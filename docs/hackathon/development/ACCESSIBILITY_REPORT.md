<!--
🎯 POR QUÉ: WCAG AA debe probarse con herramientas, no solo describirse.
⚙️ CÓMO: inventario de lo existente y prueba requerida (axe en 10 anchos).
📦 QUÉ: estado y brecha.
-->
# Informe de accesibilidad — Kronox 2026

**Estado:** 🟠 EN PROCESO (S3-16).

## Lo que existe

- `aria-label`, `alt` y `title` traducidos mediante `data-i18n-*` (puerta i18n en CI).
- `docs/audit/ACCESSIBILITY_AUDIT.md` y `docs/marketing/04_UX_FLOW_WIREFRAMES_ACCESIBILIDAD.md` §5 son documentales y **no cuentan como verificación**.

## Prueba requerida (no ejecutada todavía)

axe-core con Playwright en 10 anchos (320, 360, 375, 414, 768, 820, 1024, 1280, 1440 y 1920 px), aplicado a la portada, destinos, departamento, destino, mapa, BAQUI, Mi Viaje, perfil y mi-negocio. Criterio: 0 violaciones *serious* o *critical* y ningún desplazamiento horizontal.
