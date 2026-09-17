/**
 * Twilio REST API Client for Live Call Control & Mid-Call Failover Redirection
 *
 * Used by the Watchdog Failover Engine to dynamically reroute active live calls
 * without dropping the line or requiring the user to hang up and call back.
 */

export interface TwilioClientConfig {
  accountSid: string;
  authToken: string;
  apiKeySid?: string;
  apiSecret?: string;
}

export interface RedirectCallResult {
  success: boolean;
  callSid: string;
  status?: string;
  error?: string;
}

export class TwilioClient {
  private accountSid: string;
  private authHeader: string;

  constructor(config: TwilioClientConfig) {
    this.accountSid = config.accountSid;

    // Support either AccountSid:AuthToken or ApiKeySid:ApiSecret
    let username = config.accountSid;
    let secret = config.authToken;

    if (config.apiKeySid && config.apiSecret) {
      username = config.apiKeySid;
      secret = config.apiSecret;
    }

    const credentials = `${username}:${secret}`;
    this.authHeader = `Basic ${btoa(credentials)}`;
  }

  /**
   * Dynamically interrupts an active live call and redirects it to a new TwiML URL.
   * This is the cornerstone of zero-dropped-call failovers.
   *
   * @param callSid Active Twilio Call SID
   * @param redirectUrl URL serving emergency fallback TwiML
   * @returns RedirectCallResult
   */
  async redirectCall(callSid: string, redirectUrl: string): Promise<RedirectCallResult> {
    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Calls/${callSid}.json`;

    const body = new URLSearchParams({
      Url: redirectUrl,
      Method: 'POST',
    });

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: this.authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          callSid,
          error: `Twilio API HTTP ${response.status}: ${errorText}`,
        };
      }

      const data = (await response.json()) as { status?: string };
      return {
        success: true,
        callSid,
        status: data.status,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        callSid,
        error: `Network error redirecting call: ${message}`,
      };
    }
  }

  /**
   * Fetches the current live status of a Twilio call
   */
  async getCallStatus(callSid: string): Promise<{ status: string; duration?: string } | null> {
    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Calls/${callSid}.json`;

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: this.authHeader,
        },
      });

      if (!response.ok) return null;
      const data = (await response.json()) as { status: string; duration?: string };
      return {
        status: data.status,
        duration: data.duration,
      };
    } catch {
      return null;
    }
  }
}
