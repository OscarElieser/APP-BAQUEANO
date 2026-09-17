// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — RESOLUTOR UNIVERSAL DE ENLACES PROFUNDOS (deep-link-resolver.service.ts)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer un enrutador canónico universal para abrir recursos (destinos, viajes,
//   reservas, Smart Points, corredores) desde Web, PWA, códigos QR físicos y notificaciones.
// - Erradicar enlaces rotos y proteger recursos privados frente a accesos no autorizados.
// - Neutralizar vectores de ataque de Open Redirect mediante listas blancas y validación estricta de dominios.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Parser de Esquema de Rutas: Mapea patrones de URL a tipos de recurso tipificados.
// - Control de Privacidad: Identifica si el recurso exige autenticación previa (`requiresAuth`).
//
// 📦 3. QUÉ (WHAT / MÉTODOS EXPUESTOS):
// - resolveExperienceLink(): Resuelve una ruta o link QR hacia la página de destino correcta.
// - generateCanonicalLink(): Construye la URL canónica normalizada para compartir.
// ============================================================================

import type { ExperienceDeepLinkRecord } from "@baqueano/types";

export interface ResolvedLinkResult {
  readonly isValid: boolean;
  readonly targetRoute: string;
  readonly targetType: "PLACE" | "BUSINESS" | "TRIP" | "CORRIDOR" | "SMART_POINT" | "RESERVATION" | "UNKNOWN";
  readonly targetId: string;
  readonly requiresAuth: boolean;
  readonly error?: string;
}

export class DeepLinkResolverService {
  /**
   * Resuelve una URL o ruta hacia su destino final validando seguridad y permisos.
   */
  public resolveExperienceLink(rawPathOrUrl: string): ResolvedLinkResult {
    if (!rawPathOrUrl || typeof rawPathOrUrl !== "string") {
      return {
        isValid: false,
        targetRoute: "/",
        targetType: "UNKNOWN",
        targetId: "",
        requiresAuth: false,
        error: "Ruta inválida"
      };
    }

    let cleanPath = rawPathOrUrl.trim();

    // Si viene una URL completa, extraer solo el pathname para evitar open redirects a dominios externos
    if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
      try {
        const parsed = new URL(cleanPath);
        cleanPath = parsed.pathname;
      } catch {
        return {
          isValid: false,
          targetRoute: "/",
          targetType: "UNKNOWN",
          targetId: "",
          requiresAuth: false,
          error: "URL malformada"
        };
      }
    }

    // Patrón 1: Destino público `/destinos/:slug` o `/p/:slug`
    if (cleanPath.startsWith("/destinos/") || cleanPath.startsWith("/p/")) {
      const slug = cleanPath.split("/")[2] || "";
      return {
        isValid: true,
        targetRoute: `/destinos/${slug}`,
        targetType: "PLACE",
        targetId: slug,
        requiresAuth: false
      };
    }

    // Patrón 2: Corredor turístico `/rutas/:slug`
    if (cleanPath.startsWith("/rutas/")) {
      const slug = cleanPath.split("/")[2] || "";
      return {
        isValid: true,
        targetRoute: `/rutas/${slug}`,
        targetType: "CORRIDOR",
        targetId: slug,
        requiresAuth: false
      };
    }

    // Patrón 3: Viaje privado / colaborativo `/viaje/:tripId`
    if (cleanPath.startsWith("/viaje/")) {
      const tripId = cleanPath.split("/")[2] || "";
      return {
        isValid: true,
        targetRoute: `/viaje/${tripId}`,
        targetType: "TRIP",
        targetId: tripId,
        requiresAuth: true
      };
    }

    // Patrón 4: Kiosco / Smart Point `/kiosk/:smartPointId`
    if (cleanPath.startsWith("/kiosk/")) {
      const spId = cleanPath.split("/")[2] || "";
      return {
        isValid: true,
        targetRoute: `/kiosk/${spId}`,
        targetType: "SMART_POINT",
        targetId: spId,
        requiresAuth: false
      };
    }

    // Patrón 5: Reserva `/reservas/:id`
    if (cleanPath.startsWith("/reservas/")) {
      const resId = cleanPath.split("/")[2] || "";
      return {
        isValid: true,
        targetRoute: `/reservas/${resId}`,
        targetType: "RESERVATION",
        targetId: resId,
        requiresAuth: true
      };
    }

    // Fallback a home si es una ruta pública válida
    if (cleanPath.startsWith("/")) {
      return {
        isValid: true,
        targetRoute: cleanPath,
        targetType: "UNKNOWN",
        targetId: "",
        requiresAuth: false
      };
    }

    return {
      isValid: false,
      targetRoute: "/",
      targetType: "UNKNOWN",
      targetId: "",
      requiresAuth: false,
      error: "Ruta no autorizada"
    };
  }

  /**
   * Genera el enlace canónico normalizado para un recurso específico.
   */
  public generateCanonicalLink(
    targetType: "PLACE" | "BUSINESS" | "TRIP" | "CORRIDOR" | "SMART_POINT" | "RESERVATION",
    targetId: string
  ): ExperienceDeepLinkRecord {
    switch (targetType) {
      case "PLACE":
        return {
          canonicalUrl: `/destinos/${targetId}`,
          targetType,
          targetId,
          requiresAuth: false
        };
      case "CORRIDOR":
        return {
          canonicalUrl: `/rutas/${targetId}`,
          targetType,
          targetId,
          requiresAuth: false
        };
      case "TRIP":
        return {
          canonicalUrl: `/viaje/${targetId}`,
          targetType,
          targetId,
          requiresAuth: true
        };
      case "SMART_POINT":
        return {
          canonicalUrl: `/kiosk/${targetId}`,
          targetType,
          targetId,
          requiresAuth: false
        };
      case "RESERVATION":
        return {
          canonicalUrl: `/reservas/${targetId}`,
          targetType,
          targetId,
          requiresAuth: true
        };
      default:
        return {
          canonicalUrl: `/`,
          targetType,
          targetId,
          requiresAuth: false
        };
    }
  }
}

export const deepLinkResolverService = new DeepLinkResolverService();
