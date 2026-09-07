/**
 * WHY
 * Prevents the Baqueano AI interface from pretending to call a real model.
 *
 * HOW
 * Exposes an integration status boundary and refuses to store provider secrets in frontend code.
 *
 * WHAT
 * AI Gateway status used by the public AI page.
 */
export interface AiGatewayStatus {
  readonly connected: false;
  readonly message: string;
}

export function getAiGatewayStatus(): AiGatewayStatus {
  return {
    connected: false,
    message: "AI Gateway is not connected in the frontend. Provider API keys must remain server-side."
  };
}
