# 🌍 BAQUEANO — Auditoría i18n (Fase 1)

## 🎯 POR QUÉ

BAQUEANO debe operar en 9 idiomas (ES, EN, FR, IT, PT, DE, KO, ZH, RU) para turistas internacionales, con una arquitectura central y sin HTML duplicado.

## ⚙️ CÓMO

Lectura de `website/js/global-language.js`, `website/locales/*.json` y ejecución de `node website/scripts/validate-i18n.mjs`.

## 📦 QUÉ

### Lo que ya está bien ✅

- **Motor central único** (`global-language.js`, v`2026.10.01`), cargado en todas las páginas vía `global-injector.js`. No hay HTML por idioma.
- Catálogos JSON con claves compartidas (`nav.home`, `actions.save`, `status.loading`…).
- Actualiza `document.documentElement.lang` (`es-NI`, `en-US`, …).
- Persistencia en `localStorage` (`baqueano_language_v2`) con migración de claves heredadas.
- `MutationObserver` traduce nodos añadidos dinámicamente.
- Fallback a español; scripts de validación (`validate-i18n.mjs`, `i18n-audit.mjs`, `i18n-browser.test.mjs`).

### Brechas

| ID | Prioridad | Hallazgo | Evidencia |
| --- | --- | --- | --- |
| I18N-P2-01 | P2 | Solo **6 de 9** idiomas: faltan **KO, ZH, RU** | `SUPPORTED = ['es','en','fr','it','pt','de']`; `locales/ko.json` → 404 |
| ↳ Estado 2026-10-09 | — | **KO y ZH resueltos**: 8 idiomas en web (selector, catálogos completos de 5.548 claves, hreflang, puerta CI) y app Android. Traducción hecha con IA (Claude) y validada automáticamente (claves, marcadores {x}); **pendiente revisión de hablantes nativos**. RU sigue pendiente. | `website/locales/ko.json`, `website/locales/zh.json` |
| I18N-P2-02 | P2 | Cobertura: `es` 342 claves; `en/fr/it/pt/de` **45 traducidas (13 %)**, 297 faltantes, 7 sobrantes | Salida de `validate-i18n.mjs` |
| I18N-P2-03 | P2 | Casi ningún HTML usa `data-i18n` (0 en 29 páginas; 4 en `i18n-test.html`). La traducción depende de un mapa de textos heredados (`legacyKeys`, ~40 cadenas) → el contenido de página queda en español | `grep -c data-i18n` |
| I18N-P2-04 | P2 | Fallback de un solo nivel (→ ES). Se pide `ko/zh/ru/fr/it/pt/de → en → es` | `global-language.js` |
| I18N-P2-05 | P2 | Prioridad de idioma sin perfil autenticado: hoy `localStorage → navigator → es`. Falta `profiles.preferred_language` en Supabase | Sin columna ni lectura |
| I18N-P2-06 | P2 | Contenido dinámico: `content_translations` no existe en producción | 404 |
| I18N-P2-07 | P2 | SEO internacional: 0 `hreflang` en todas las páginas | Ver SEO_AUDIT |
| I18N-P3-01 | P3 | Sin preparación RTL (`dir`) aunque no se necesita hoy | — |

### Diseño objetivo (evolución del motor actual, no reemplazo)

1. Ampliar `SUPPORTED` y `LOCALES` con `ko: 'ko-KR'`, `zh: 'zh-CN'`, `ru: 'ru-RU'`; añadir `RTL = new Set([])` y fijar `document.documentElement.dir`.
2. Cadena de fallback: `[lang, 'en', 'es']` por clave; nunca mostrar la clave (si todo falla, conservar el texto original del DOM).
3. Prioridad: perfil Supabase (`preferred_language`) → `localStorage` → `navigator.languages` → `es`.
4. Marcar HTML con `data-i18n` página por página, empezando por navegación, footer, index y formularios.
5. Completar los 9 catálogos con las 342 claves; traducción revisada por humanos para KO/ZH/RU antes de publicar (marcar estado `machine` vs `reviewed`).
6. `validate-i18n.mjs` en CI: falla si un idioma publicado tiene claves vacías.
7. Android: `intl` ya está en `pubspec.yaml`; planificar ARB por idioma en fase posterior.
