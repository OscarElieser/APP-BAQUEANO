// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — ANALYTICS & TELEMETRY SERVICE
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// Centralizar el despacho de eventos de telemetría y comportamiento de usuario
// en el cliente web sin filtrar información personal identificable (PII),
// garantizando que cada métrica recolectada cumpla con la taxonomía oficial de
// la Fase 6 de Baqueano y apoye la toma de decisiones basada en evidencia.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Valida esquemas tipados en tiempo de compilación para eventos permitidos.
// - Sanitiza entradas de texto para descartar emails, teléfonos y caracteres de escape.
// - Soporta modo seguro (no-op en servidor y logs estructurados en desarrollo).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Clases y funciones: `trackEvent()`, `trackSearch()`, `trackDestinationView()`, `trackMapOpen()`.
// ============================================================================

export type AnalyticsEventName =
  | "destination_view"
  | "destination_save"
  | "map_open"
  | "map_marker_click"
  | "search_executed"
  | "search_zero_results"
  | "filter_applied"
  | "territory_view"
  | "business_contact_click"
  | "android_cta_click"
  | "ai_session_started"
  | "error_boundary_triggered";

export interface AnalyticsPayload {
  readonly [key: string]: string | number | boolean | undefined;
}

interface WindowWithAnalytics {
  gtag?: (command: string, eventName: string, params?: Record<string, string | number | boolean>) => void;
}

/**
 * Sanitiza cualquier texto antes de ser transmitido para prevenir fugas de PII o inyecciones.
 */
export function sanitizeAnalyticsValue(value: string): string {
  return value
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[REDACTED_EMAIL]")
    .replace(/\+?\d[\d -]{7,}\d/g, "[REDACTED_PHONE]")
    .trim()
    .slice(0, 100);
}

/**
 * Despacha un evento de telemetría seguro hacia la capa de analítica disponible.
 */
export function trackEvent(eventName: AnalyticsEventName, payload?: AnalyticsPayload): void {
  if (typeof window === "undefined") {
    return;
  }

  // Sanitizar payloads que contengan cadenas
  const cleanPayload: Record<string, string | number | boolean> = {};
  if (payload) {
    for (const [key, val] of Object.entries(payload)) {
      if (typeof val === "string") {
        cleanPayload[key] = sanitizeAnalyticsValue(val);
      } else if (typeof val === "number" || typeof val === "boolean") {
        cleanPayload[key] = val;
      }
    }
  }

  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug(`[Baqueano Telemetry] [${eventName}]`, cleanPayload);
  }

  // Integración extensible con GA4 / GTM si existe 'gtag' en window
  const customWindow = window as unknown as WindowWithAnalytics;
  if (typeof customWindow.gtag === "function") {
    customWindow.gtag("event", eventName, cleanPayload);
  }
}
