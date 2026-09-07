// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — I18N & LOCALIZATION RESOLVER (FASE 12)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proporcionar un catálogo semántico de cadenas de interfaz (UI strings)
//   y mecanismos de resolución de idioma con fallback controlado hacia español (es-NI).
// - Asegura que la experiencia del usuario sea natural tanto para exploradores
//   hispanohablantes como angloparlantes, manteniendo la identidad territorial.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Diccionario tipado por claves semánticas (no IDs genéricos como "text_001").
// - Resolución de locale con soporte para headers Accept-Language y almacenamiento de preferencia.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - `getTranslation(key, locale)`
// - `getSupportedLocales()`
// - `resolveEffectiveLocale(userPreference, browserLocale)`
// ============================================================================

import type { LocaleCode } from "@baqueano/types";

export const UI_DICTIONARY: Record<string, Record<string, string>> = {
  "nav.destinations": {
    "es-NI": "Destinos",
    "es": "Destinos",
    "en": "Destinations"
  },
  "nav.map": {
    "es-NI": "Mapa",
    "es": "Mapa",
    "en": "Map"
  },
  "nav.history": {
    "es-NI": "Historia",
    "es": "Historia",
    "en": "History"
  },
  "nav.territories": {
    "es-NI": "Territorios",
    "es": "Territorios",
    "en": "Territories"
  },
  "nav.gastronomy": {
    "es-NI": "Gastronomía",
    "es": "Gastronomía",
    "en": "Gastronomy"
  },
  "nav.culture": {
    "es-NI": "Cultura",
    "es": "Cultura",
    "en": "Culture"
  },
  "nav.ai": {
    "es-NI": "Baqueano AI",
    "es": "Baqueano AI",
    "en": "Baqueano AI"
  },
  "nav.sustainability": {
    "es-NI": "Impacto & Sostenibilidad",
    "es": "Impacto & Sostenibilidad",
    "en": "Impact & Sustainability"
  },
  "hero.tagline": {
    "es-NI": "DESCUBRE LO QUE NO SALE EN EL MAPA",
    "es": "DESCUBRE LO QUE NO SALE EN EL MAPA",
    "en": "DISCOVER WHAT IS NOT ON THE MAP"
  },
  "cta.explore": {
    "es-NI": "Explorar Territorio",
    "es": "Explorar Territorio",
    "en": "Explore Territory"
  },
  "cta.book": {
    "es-NI": "Reservar Experiencia",
    "es": "Reservar Experiencia",
    "en": "Book Experience"
  },
  "cta.emergency": {
    "es-NI": "Llamada de Emergencia SOS",
    "es": "Llamada de Emergencia SOS",
    "en": "SOS Emergency Call"
  },
  "footer.rights": {
    "es-NI": "Todos los derechos reservados. Turismo sostenible sin intermediarios.",
    "es": "Todos los derechos reservados. Turismo sostenible sin intermediarios.",
    "en": "All rights reserved. Sustainable tourism without intermediaries."
  }
};

/**
 * Retrieves a translated string with deterministic fallback to es-NI.
 */
export function getTranslation(key: string, locale: LocaleCode = "es-NI"): string {
  const entry = UI_DICTIONARY[key];
  if (!entry) return key;

  return entry[locale] ?? entry["es-NI"] ?? entry["es"] ?? entry["en"] ?? key;
}

/**
 * Supported active locales.
 */
export function getSupportedLocales(): readonly LocaleCode[] {
  return ["es-NI", "es-CR", "es-GT", "es", "en"];
}

/**
 * Resolves the effective locale checking user preference first, then system header, with fallback to es-NI.
 */
export function resolveEffectiveLocale(preference?: string, acceptLanguage?: string): LocaleCode {
  if (preference && getSupportedLocales().includes(preference as LocaleCode)) {
    return preference as LocaleCode;
  }
  if (acceptLanguage && acceptLanguage.toLowerCase().startsWith("en")) {
    return "en";
  }
  return "es-NI";
}
