# Reporte integral del sistema multilingüe — 2026-10-01

## 🎯 POR QUÉ

BAQUEANO necesitaba convertir el idioma en una capacidad del shell global, persistente y heredable, además de exponer la deuda editorial que el validador anterior no estaba mostrando con claridad.

## ⚙️ CÓMO

- `global-injector.js` continúa siendo el único bootstrap de las páginas públicas y carga el motor una sola vez.
- `global-language.js` usa un guard global, seis idiomas, almacenamiento `baqueano_language_v2`, migración desde v1 y la clave histórica, catálogos JSON, fallback español y un observer agrupado por frame.
- La API pública incluye `get`, `set`, `t`, `translateElement` y `refresh`.
- Se mantienen los eventos existentes y se emite también el contrato global `baqueano`.
- BAQUI y la sesión de viaje consultan primero la clave v2 y conservan compatibilidad hacia atrás.
- El fallback heredado ahora indexa frases canónicas desde el catálogo español; las claves semánticas siguen siendo el mecanismo principal.
- Se añadió una página fixture que carga solo el shell global y una prueba Playwright sobre todas las rutas solicitadas.

## 📦 QUÉ

### Archivos de implementación

- `js/global-language.js`
- `js/global-injector.js`
- `js/baqueano-assistant.js`
- `js/baqueano-travel-session.js`
- `package.json`
- `i18n-test.html`
- `scripts/i18n-audit.mjs`
- `scripts/i18n-browser.test.mjs`
- `scripts/validate-i18n.mjs`
- `scripts/complete-i18n-catalogs.mjs`
- `docs/i18n-audit.json`

### Verificación aprobada

- 19 rutas públicas requeridas verificadas en `es`, `en`, `fr`, `it`, `pt` y `de`.
- Ciclo de cambio de los seis idiomas aprobado en cada ruta.
- Persistencia entre `i18n-test.html` y `destinos.html` aprobada.
- Carga automática desde el shell, sin importar directamente `global-language.js`, aprobada.
- Contenido dinámico con `data-i18n` aprobado.
- API pública, atributo `lang` y almacenamiento v2 aprobados.
- `pnpm test`, `pnpm lint` y `pnpm typecheck` aprobados.

### Deuda editorial detectada y no ocultada

El catálogo español contiene 342 claves. Cada catálogo EN/FR/IT/PT/DE contiene actualmente 45 claves canónicas y conserva siete aliases históricos; faltan 297 traducciones por idioma. El runtime usa español como fallback y nunca presenta la clave interna al usuario, pero esto todavía puede producir mezcla lingüística en secciones sin traducción editorial.

La herramienta `pnpm i18n:audit` falla deliberadamente mientras exista esa deuda. `docs/i18n-audit.json` registra además estimaciones de textos HTML sin clave y textos dinámicos rígidos para su corrección progresiva. No se copiaron textos españoles a catálogos extranjeros para producir un resultado engañoso.

### Integridad

No se eliminó contenido, diseño, funcionalidad, Firebase, Supabase, BAQUI, navegación, mapas, imágenes ni rutas. No se modificaron `ios/` ni el directorio Flutter `web/`.
