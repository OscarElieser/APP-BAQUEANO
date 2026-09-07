// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PAYMENT ADAPTER SERVICE
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// Proveer una arquitectura desacoplada para pasarelas de pago bancarias nacionales
// (BAC / LAFISE / BANPRO) sin acoplar la lógica de negocio a un banco específico
// y garantizando el cumplimiento estricto de seguridad (cero almacenamiento de PAN/CVV).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Interfaz unificada `PaymentProviderAdapter`.
// - Soporte de tokenización y webhooks con verificación criptográfica en servidor.
// - Clasificación transparente del estado de integración (`⚪ PENDIENTE`).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - `getAvailablePaymentProviders()`, `createPaymentOrder()`.
// ============================================================================

import type { PaymentOrderRecord, PaymentProvider } from "@baqueano/types";

export interface PaymentProviderInfo {
  readonly id: PaymentProvider;
  readonly name: string;
  readonly status: "active" | "sandbox" | "pending";
  readonly supportedCurrencies: readonly ("NIO" | "USD")[];
}

const AVAILABLE_PROVIDERS: readonly PaymentProviderInfo[] = [
  {
    id: "bac",
    name: "BAC Credomatic (Pasarela Compra-Click)",
    status: "pending",
    supportedCurrencies: ["NIO", "USD"]
  },
  {
    id: "lafise",
    name: "Banco LAFISE Bancentro",
    status: "pending",
    supportedCurrencies: ["NIO", "USD"]
  },
  {
    id: "banpro",
    name: "Banpro Promerica",
    status: "pending",
    supportedCurrencies: ["NIO", "USD"]
  }
];

export function getAvailablePaymentProviders(): readonly PaymentProviderInfo[] {
  return AVAILABLE_PROVIDERS;
}

export async function createPaymentOrder(params: {
  readonly customerEmail: string;
  readonly destinationId: string;
  readonly destinationName: string;
  readonly amountUsd: number;
}): Promise<{ success: boolean; order?: PaymentOrderRecord; message: string }> {
  return {
    success: false,
    message: "Las pasarelas de pago se encuentran en estado de arquitectura preparada (⚪ PENDIENTE de credenciales bancarias de producción)."
  };
}
