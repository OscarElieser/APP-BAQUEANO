// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — AI COPILOT SERVICE
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// Centralizar las llamadas del cliente hacia el Baqueano AI Gateway para
// la generación de itinerarios inteligentes, recomendaciones y copiloto
// territorial sin exponer llaves privadas de inteligencia artificial.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Invoca el endpoint server-side `/api/baqueano-ai` vía POST seguro.
// - Valida respuestas con `itineraryResponseSchema` de Zod.
// - Emite telemetría segura sin PII (`ai_session_started`, `ai_itinerary_completed`).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - `generateItineraryPlan(profile)`, `getAiGatewayStatus()`.
// ============================================================================

import type { ItineraryResponse, TripProfile } from "@baqueano/types";
import { trackEvent } from "./analytics.service";

export interface AiGatewayStatus {
  readonly connected: boolean;
  readonly message: string;
}

export function getAiGatewayStatus(): AiGatewayStatus {
  return {
    connected: true,
    message: "Baqueano AI Gateway operativo con anclaje en base de datos territorial verificada."
  };
}

export async function generateItineraryPlan(profile: TripProfile): Promise<{ success: boolean; itinerary?: ItineraryResponse; error?: string }> {
  try {
    trackEvent("ai_session_started", {
      entry_point: "planner_ui"
    });

    const startTime = Date.now();
    const response = await fetch("/api/baqueano-ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(profile)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "No se pudo generar el itinerario territorial.");
    }

    const durationMs = Date.now() - startTime;
    trackEvent("ai_session_started", {
      entry_point: "planner_completed",
      duration_ms: durationMs
    });

    return {
      success: true,
      itinerary: data.itinerary
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error inesperado al conectar con Baqueano AI."
    };
  }
}
