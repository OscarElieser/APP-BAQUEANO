<!--
🎯 POR QUÉ: medir la cobertura real de los 6 idiomas.
⚙️ CÓMO: puerta CI validate-i18n + i18n-audit con trinquete; prueba de navegador.
📦 QUÉ: cifras, cambios y brechas.
-->
# Informe i18n — Kronox 2026

**Estado:** 🟡 AVANZADO (S3-15).

| Medida | Valor |
|---|---|
| Claves por idioma (es, en, fr, it, pt, de) | 1 782, sin faltantes, extras ni vacías |
| Archivos de interfaz al 100 % | 43 |
| Textos JS dinámicos sin clave | 731 |
| Textos TSX pendientes | 60 de 1 154 |
| Paridad Web → APK | `export-locales-for-app.mjs --check` en CI |

## Cambios de esta ronda

- `?lang=xx` en la URL tiene prioridad sobre la preferencia guardada (`website/js/global-language.js`). Cada idioma tiene una URL real.
- El build declara `hreflang` para los 6 idiomas más `x-default` en todas las páginas indexables, y los incluye en el sitemap.

## Brechas

- Las 30 páginas HTML con claves insertadas siguen en curso. Se publicarán cuando existan sus traducciones, para no romper la puerta de CI.
- Faltan los 731 textos JS y los textos del runtime de idioma del Ops Center.
