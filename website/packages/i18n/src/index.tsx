"use client";

/**
 * 🌐 BAQUEANO — I18N PARA REACT/NEXT (MISMA FUENTE QUE LA WEB HTML)
 *
 * 🎯 POR QUÉ
 * Las apps Next (`apps/web`, `apps/admin`) tenían texto español escrito en los
 * componentes: al elegir otro idioma, la navegación, formularios, errores y
 * modales seguían en español. La plataforma necesita UNA sola fuente de
 * traducciones para HTML, React, BAQUI, Ops Center y la App Android.
 *
 * ⚙️ CÓMO
 * - Catálogos: `website/locales/<idioma>.json` (los mismos que usa
 *   `js/global-language.js`). Se cargan con `import()` dinámico: solo el
 *   español (fuente y respaldo) y el idioma activo; quedan en caché.
 * - Idioma: misma clave de almacenamiento que el motor HTML
 *   (`baqueano_language_v2`), sincronizado entre pestañas (`storage`) y con
 *   el evento `baqueano:languageChanged`; el servidor renderiza en español y
 *   el cliente aplica la preferencia tras montar (sin desajuste de hidratación).
 * - `t(key, params)`: idioma activo → español → (solo en desarrollo) la clave
 *   con aviso. El auditor `scripts/i18n-audit.mjs` falla si una clave usada
 *   no existe en `es.json`, por lo que en producción nunca se ve una clave.
 *
 * 📦 QUÉ
 * `I18nProvider`, `useBaqueanoI18n()` → { t, language, setLanguage, locale },
 * `SUPPORTED_LANGUAGES`, `normalizeLanguage`, `LanguageSelector`.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const SUPPORTED_LANGUAGES = ["es", "en", "fr", "it", "pt", "de"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const LANGUAGE_LOCALES: Record<Language, string> = {
  es: "es-NI",
  en: "en-US",
  fr: "fr-FR",
  it: "it-IT",
  pt: "pt-BR",
  de: "de-DE",
};
export const LANGUAGE_NAMES: Record<Language, string> = {
  es: "Español",
  en: "English",
  fr: "Français",
  it: "Italiano",
  pt: "Português",
  de: "Deutsch",
};
const STORAGE_KEY = "baqueano_language_v2";

type Catalog = Record<string, unknown>;
type Params = Record<string, string | number>;

export function normalizeLanguage(value: unknown): Language {
  const code = String(value ?? "").trim().toLowerCase().split(/[-_]/)[0];
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(code) ? (code as Language) : "es";
}

const catalogCache = new Map<Language, Promise<Catalog>>();

function loadCatalog(language: Language): Promise<Catalog> {
  const cached = catalogCache.get(language);
  if (cached) return cached;
  const request = import(`../../../locales/${language}.json`)
    .then((module: { default?: Catalog }) => (module.default ?? (module as unknown as Catalog)))
    .catch(() => ({}) as Catalog);
  catalogCache.set(language, request);
  return request;
}

function readPath(source: Catalog | null, key: string): string | undefined {
  const value = key.split(".").reduce<unknown>((node, segment) => {
    if (node && typeof node === "object" && Object.prototype.hasOwnProperty.call(node, segment)) {
      return (node as Record<string, unknown>)[segment];
    }
    return undefined;
  }, source);
  return typeof value === "string" && value.trim() ? value : undefined;
}

function interpolate(text: string, params?: Params): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, token: string) => (params[token] == null ? match : String(params[token])));
}

/** Traducción pura (útil fuera de React, p. ej. en servicios o pruebas). */
export function translate(active: Catalog | null, fallback: Catalog | null, key: string, params?: Params): string {
  const value = readPath(active, key) ?? readPath(fallback, key);
  if (value) return interpolate(value, params);
  if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
    console.warn(`[i18n] Clave inexistente: ${key}`);
  }
  return key;
}

interface I18nContextValue {
  language: Language;
  locale: string;
  ready: boolean;
  t: (key: string, params?: Params) => string;
  setLanguage: (language: Language) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function readStoredLanguage(): Language | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? normalizeLanguage(stored) : null;
  } catch {
    return null;
  }
}

export function I18nProvider({ children, initialCatalog }: { children: ReactNode; initialCatalog?: Catalog }) {
  const [language, setLanguageState] = useState<Language>("es");
  const [fallback, setFallback] = useState<Catalog | null>(initialCatalog ?? null);
  const [active, setActive] = useState<Catalog | null>(initialCatalog ?? null);
  const [ready, setReady] = useState(Boolean(initialCatalog));

  // Preferencia guardada (o del navegador) tras montar.
  useEffect(() => {
    setLanguageState(readStoredLanguage() ?? normalizeLanguage(navigator.language));
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) setLanguageState(normalizeLanguage(event.newValue));
    };
    const onLegacyChange = (event: Event) => {
      const detail = (event as CustomEvent<{ language?: string }>).detail;
      if (detail?.language) setLanguageState(normalizeLanguage(detail.language));
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("baqueano:languageChanged", onLegacyChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("baqueano:languageChanged", onLegacyChange);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadCatalog("es"), language === "es" ? Promise.resolve(null) : loadCatalog(language)]).then(([es, selected]) => {
      if (cancelled) return;
      setFallback(es);
      setActive(selected ?? es);
      setReady(true);
      document.documentElement.lang = LANGUAGE_LOCALES[language];
    });
    return () => {
      cancelled = true;
    };
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    const normalized = normalizeLanguage(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, normalized);
    } catch {
      /* almacenamiento bloqueado: el idioma igual cambia en esta página */
    }
    setLanguageState(normalized);
    window.dispatchEvent(new CustomEvent("baqueano:languageChanged", { detail: { language: normalized, source: "react" } }));
  }, []);

  const t = useCallback((key: string, params?: Params) => translate(active, fallback, key, params), [active, fallback]);

  const value = useMemo<I18nContextValue>(
    () => ({ language, locale: LANGUAGE_LOCALES[language], ready, t, setLanguage }),
    [language, ready, t, setLanguage],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useBaqueanoI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useBaqueanoI18n debe usarse dentro de <I18nProvider>.");
  return context;
}

/** Selector accesible de idioma (6 idiomas), compartido por web y admin. */
export function LanguageSelector({ className = "" }: { className?: string }) {
  const { t, language, setLanguage } = useBaqueanoI18n();
  return (
    <label className={className}>
      <span className="sr-only">{t("language.change")}</span>
      <select
        value={language}
        aria-label={t("language.change")}
        onChange={(event) => setLanguage(normalizeLanguage(event.target.value))}
        className="focus-ring rounded-md border border-white/14 bg-white/10 px-2 py-2 text-xs font-bold uppercase text-white"
      >
        {SUPPORTED_LANGUAGES.map((code) => (
          <option key={code} value={code} className="bg-[#07131f] text-white" data-no-translate>
            {LANGUAGE_NAMES[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
