# Informe de accesibilidad WCAG 2.2 AA (requisitos 10 y 13)

> Generado por `website/scripts/browser-qa-report.mjs` a partir de `browser-qa.json` (2026-10-05 13:07 UTC).
> Medición: Playwright (Chromium) sobre el build publicado servido en local (`http://127.0.0.1:8790/`), con el shell JS montado.
> Criterio: axe-core 4 con etiquetas wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa a 390 y 1366 px; la puerta CI falla con cualquier violación crítica o grave.

| Página | 390 px | 1366 px | Imágenes sin alt |
|---|---|---|---|
| 404.html | 🟢 0 | 🟢 0 | 🟢 0 |
| aliados.html | 🟢 0 | 🟢 0 | 🟢 0 |
| ambiental.html | 🟢 0 | 🟢 0 | 🟢 0 |
| aviso-legal.html | 🟢 0 | 🟢 0 | 🟢 0 |
| ayuda.html | 🟢 0 | 🟢 0 | 🟢 0 |
| baqueano-ia.html | 🟢 0 | 🟢 0 | 🟢 0 |
| cookies.html | 🟢 0 | 🟢 0 | 🟢 0 |
| cronicas.html | 🟢 0 | 🟢 0 | 🟢 0 |
| denuncias.html | 🟢 0 | 🟢 0 | 🟢 0 |
| departamento.html?depto=madriz | 🟢 0 | 🟢 0 | 🟢 0 |
| destino.html | 🟢 0 | 🟢 0 | 🟢 0 |
| destinos.html | 🟢 0 | 🟢 0 | 🟢 0 |
| experiencias.html | 🟢 0 | 🟢 0 | 🟢 0 |
| favoritos.html | 🟢 0 | 🟢 0 | 🟢 0 |
| gastronomia.html | 🟢 0 | 🟢 0 | 🟢 0 |
| historia.html | 🟢 0 | 🟢 0 | 🟢 0 |
| index.html | 🟢 0 | 🟢 0 | 🟢 0 |
| legal.html | 🟢 0 | 🟢 0 | 🟢 0 |
| mapa.html | 🟢 0 | 🟢 0 | 🟢 0 |
| mi-negocio.html | 🟢 0 | 🟢 0 | 🟢 0 |
| mi-viaje.html | 🟢 0 | 🟢 0 | 🟢 0 |
| musica.html | 🟢 0 | 🟢 0 | 🟢 0 |
| nosotros.html | 🟢 0 | 🟢 0 | 🟢 0 |
| offline.html | 🟢 0 | 🟢 0 | 🟢 0 |
| perfil.html | 🟢 0 | 🟢 0 | 🟢 0 |
| privacidad.html | 🟢 0 | 🟢 0 | 🟢 0 |
| terminos.html | 🟢 0 | 🟢 0 | 🟢 0 |
| testimonios.html | 🟢 0 | 🟢 0 | 🟢 0 |

**Violaciones moderadas/menores (no bloquean, seguimiento):** ninguna.

## Línea base y correcciones (2026-10-05)

Primera medición: 5 críticas (`label` en cookies, `aria-required-attr` en portada y música) y 52 graves (contraste ×36, `link-name`, `nested-interactive`, `aria-prohibited-attr`, `scrollable-region-focusable`, `target-size`). Correcciones: nombres accesibles (aria-labelledby), roles válidos (`group`, `region`, `slider` con valores y teclado), áreas táctiles de 24 px y una capa de contraste en `css/baqueano-system.css` que oscurece solo el texto dentro del mismo matiz (naranja de texto `#B34400`, 5.6:1). Detalle en `SESSION_LOG.md`.
