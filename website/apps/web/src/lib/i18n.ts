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

const EXTENDED_TRANSLATIONS: Record<string, Record<string, string>> = {
  "nav.destinations": { fr: "Destinations", it: "Destinazioni", pt: "Destinos", de: "Reiseziele" },
  "nav.map": { fr: "Carte", it: "Mappa", pt: "Mapa", de: "Karte" },
  "nav.history": { fr: "Histoire", it: "Storia", pt: "História", de: "Geschichte" },
  "nav.territories": { fr: "Territoires", it: "Territori", pt: "Territórios", de: "Regionen" },
  "nav.gastronomy": { fr: "Gastronomie", it: "Gastronomia", pt: "Gastronomia", de: "Kulinarik" },
  "nav.culture": { fr: "Culture", it: "Cultura", pt: "Cultura", de: "Kultur" },
  "nav.ai": { fr: "Baqueano AI", it: "Baqueano AI", pt: "Baqueano AI", de: "Baqueano AI" },
  "nav.sustainability": { fr: "Impact et durabilité", it: "Impatto e sostenibilità", pt: "Impacto e sustentabilidade", de: "Wirkung und Nachhaltigkeit" },
  "hero.tagline": { fr: "DÉCOUVREZ CE QUE LES CARTES NE MONTRENT PAS", it: "SCOPRI CIÒ CHE LE MAPPE NON MOSTRANO", pt: "DESCUBRA O QUE OS MAPAS NÃO MOSTRAM", de: "ENTDECKEN SIE, WAS KARTEN NICHT ZEIGEN" },
  "cta.explore": { fr: "Explorer le territoire", it: "Esplora il territorio", pt: "Explorar o território", de: "Region entdecken" },
  "cta.book": { fr: "Réserver l'expérience", it: "Prenota l'esperienza", pt: "Reservar experiência", de: "Erlebnis buchen" },
  "cta.emergency": { fr: "Appel d'urgence SOS", it: "Chiamata di emergenza SOS", pt: "Chamada de emergência SOS", de: "SOS-Notruf" },
  "footer.rights": { fr: "Tous droits réservés. Tourisme durable sans intermédiaires.", it: "Tutti i diritti riservati. Turismo sostenibile senza intermediari.", pt: "Todos os direitos reservados. Turismo sustentável sem intermediários.", de: "Alle Rechte vorbehalten. Nachhaltiger Tourismus ohne Zwischenhändler." }
};

/**
 * Retrieves a translated string with deterministic fallback to es-NI.
 */
export function getTranslation(key: string, locale: LocaleCode = "es-NI"): string {
  const entry = UI_DICTIONARY[key];
  if (!entry) return key;

  return EXTENDED_TRANSLATIONS[key]?.[locale] ?? entry[locale] ?? entry["es-NI"] ?? entry["es"] ?? entry["en"] ?? key;
}

/**
 * Supported active locales.
 */
export function getSupportedLocales(): readonly LocaleCode[] {
  return ["es-NI", "es-CR", "es-GT", "es", "en", "fr", "it", "pt", "de"];
}

/**
 * Resolves the effective locale checking user preference first, then system header, with fallback to es-NI.
 */
export function resolveEffectiveLocale(preference?: string, acceptLanguage?: string): LocaleCode {
  if (preference && getSupportedLocales().includes(preference as LocaleCode)) {
    return preference as LocaleCode;
  }
  if (acceptLanguage) {
    const browserLanguage = acceptLanguage.toLowerCase().split(/[-_,;]/)[0] as LocaleCode;
    if (getSupportedLocales().includes(browserLanguage)) return browserLanguage;
  }
  return "es-NI";
}
