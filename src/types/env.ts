/**
 * Cloudflare Worker Environment Bindings and Configuration Types
 */
export interface Env {
  // Twilio Production Credentials
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_API_KEY_SID?: string;
  TWILIO_API_SECRET?: string;
  TWILIO_PHONE_NUMBER?: string;

  // ElevenLabs Conversational AI Credentials
  ELEVENLABS_API_KEY?: string;
  ELEVENLABS_AGENT_ID?: string;
  ELEVENLABS_VOICE_ID?: string;
  ELEVENLABS_MODEL_ID?: string;

  // Human Escalation Fallback (E.164 phone number)
  FALLBACK_HUMAN_NUMBER?: string;

  // Watchdog Failover Deadlines (in milliseconds)
  FAILOVER_CONNECT_TIMEOUT_MS?: string;
  FAILOVER_TTFT_TIMEOUT_MS?: string;

  // Mock / Simulation mode flag for automated test suites
  MOCK_ELEVENLABS?: string;
}
