// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CONTEXTO UNIFICADO DE EXPERIENCIA (experience-context.service.ts)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia continua ("Omnichannel Continuity") para que el viajero
//   no perciba barreras entre Web, PWA, Android (contrato compatible), Kioscos y QR/NFC.
// - Conservar la intención del usuario ante eventos de autenticación (ej. explorar destino
//   → guardar → iniciar sesión → continuar en el mismo destino sin recargas forzadas a Home).
// - Principio de Privacidad: Recordar únicamente lo necesario para asistir la experiencia
//   del viaje, NUNCA para generar vigilancia o rastreo invasivo.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Context Store Ligero: Administra el estado de sesión, canal de acceso, viaje activo y
//   preferencias de localización (país, moneda, idioma).
// - Detección Segura de Canal: Identifica el entorno de ejecución (Web, PWA, Kiosco)
//   sin utilizar esa detección como mecanismo exclusivo de seguridad.
//
// 📦 3. QUÉ (WHAT / MÉTODOS EXPUESTOS):
// - getExperienceContext(): Obtiene o inicializa el contexto de la sesión.
// - updateExperienceContext(): Modifica atributos contextuales (viaje activo, destino actual).
// - preserveLoginIntent(): Valida y almacena de forma segura la URL de retorno pos-login.
// - detectChannel(): Identifica el canal de navegación.
// ============================================================================

import type { ExperienceChannel, ExperienceContextRecord } from "@baqueano/types";

export class ExperienceContextService {
  private contexts: Map<string, ExperienceContextRecord> = new Map();

  /**
   * Obtiene o inicializa el contexto de experiencia para una sesión.
   */
  public getExperienceContext(sessionId: string, userId?: string | null): ExperienceContextRecord {
    let context = this.contexts.get(sessionId);
    if (!context) {
      context = {
        sessionId,
        userId: userId ?? null,
        channel: "WEB",
        countryId: "NI",
        locale: "es-NI",
        currency: "NIO",
        activeTripId: null,
        currentPlaceId: null,
        currentSmartPointId: null,
        lastIntent: null,
        updatedAt: new Date().toISOString()
      };
      this.contexts.set(sessionId, context);
    }
    return context;
  }

  /**
   * Actualiza parcialmente el contexto de la experiencia del usuario.
   */
  public updateExperienceContext(
    sessionId: string,
    patch: Partial<ExperienceContextRecord>
  ): ExperienceContextRecord {
    const current = this.getExperienceContext(sessionId);
    const updated: ExperienceContextRecord = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString()
    };
    this.contexts.set(sessionId, updated);
    return updated;
  }

  /**
   * Valida una URL de retorno pos-autenticación para prevenir Open Redirects.
   */
  public preserveLoginIntent(returnUrl?: string | null): string {
    if (!returnUrl) return "/";

    // Permitir solo rutas relativas que inicien con '/' y no con '//' ni esquemas externos
    if (returnUrl.startsWith("/") && !returnUrl.startsWith("//") && !returnUrl.includes("://")) {
      return returnUrl;
    }

    return "/";
  }

  /**
   * Infiere el canal de ejecución a partir de headers y banderas del navegador.
   */
  public detectChannel(isPwaStandalone: boolean = false, isKioskParam: boolean = false): ExperienceChannel {
    if (isKioskParam) return "KIOSK";
    if (isPwaStandalone) return "PWA";
    return "WEB";
  }
}

export const experienceContextService = new ExperienceContextService();
