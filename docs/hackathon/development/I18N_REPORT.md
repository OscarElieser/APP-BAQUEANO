<!--
🎯 POR QUÉ: medir la cobertura real de los 6 idiomas.
⚙️ CÓMO: puerta CI validate-i18n + i18n-audit con trinquete; prueba de navegador.
📦 QUÉ: cifras, cambios y brechas.
-->
# Informe i18n — Kronox 2026

**Estado:** 🟡 AVANZADO (S3-15).

| Medida | Valor |
|---|---|
| Claves por idioma (es, en, fr, it, pt, de) | 3 593, sin faltantes, extras ni vacías |
| Textos HTML con clave | 3 606 de 3 607 (30 páginas migradas) |
| Archivos de interfaz al 100 % | 73 |
| Textos JS dinámicos sin clave | 731 |
| Textos TSX pendientes | 60 de 1 154 |
| Paridad Web → APK | `export-locales-for-app.mjs --check` en CI |

## Cambios de esta ronda

- **Fase 2 completada (2026-10-05):** 30 páginas HTML migradas a claves; 1 811 claves nuevas traducidas en 17 lotes (`tools/i18n-batches/`, fuente + traducción + `merge.mjs`). Verificado en Chromium: 0 claves sin resolver en 29 páginas × (en, de) y prueba de idioma de 19 rutas × 6 idiomas con persistencia.

- `?lang=xx` en la URL tiene prioridad sobre la preferencia guardada (`website/js/global-language.js`). Cada idioma tiene una URL real.
- El build declara `hreflang` para los 6 idiomas más `x-default` en todas las páginas indexables, y los incluye en el sitemap.

## Brechas

- Faltan los 731 textos JS y los textos del runtime de idioma del Ops Center.
