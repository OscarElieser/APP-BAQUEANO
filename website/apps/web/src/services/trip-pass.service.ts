/**
 * POR QUE
 * Un pase de viaje debe ser verificable y no una imagen decorativa.
 *
 * COMO
 * Solicita emision al backend interno y valida referencias firmadas. El cliente
 * nunca conoce la clave HMAC ni decide si un viaje es elegible.
 *
 * QUE
 * Cliente tipado para emitir y validar BAQUEANO Trip Pass.
 */
export interface TripPassClaims {
  readonly tripId: string;
  readonly explorerId: string;
  readonly issuedAt: string;
  readonly expiresAt: string;
}

export async function validateTripPass(token: string): Promise<{ valid: boolean; claims?: TripPassClaims; error?: string }> {
  const response = await fetch(`/api/trip-pass?token=${encodeURIComponent(token)}`, { cache: "no-store" });
  return response.json() as Promise<{ valid: boolean; claims?: TripPassClaims; error?: string }>;
}
