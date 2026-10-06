# Informe de enlaces (requisitos 15 y 16)

> Generado por `website/scripts/browser-qa-report.mjs` a partir de `browser-qa.json` (2026-10-06 16:50 UTC).
> Medición: Playwright (Chromium) sobre el build publicado servido en local (`http://127.0.0.1:8790/`), con el shell JS montado.
> Dos capas: el auditor estático (`production-audit.mjs`) verifica que todo destino local exista en el build; el navegador verifica en ejecución las anclas `#id` y los enlaces de WhatsApp.

## Estático

Páginas: 31 · críticos: 0 (enlaces, scripts, hojas e imágenes locales inexistentes bloquean el despliegue) · advertencias: 64 (de ellas 64 anclas que el HTML estático no contiene; se comprueban abajo en ejecución, donde el JS ya montó el contenido).

## Anclas en ejecución (390 y 1366 px)

| Página | Anclas `#id` sin destino | WhatsApp (seguro + nombre accesible) |
|---|---|---|
| 404.html | 🟢 0 | 🟢 1 |
| aliados.html | 🟢 0 | 🟢 11 |
| ambiental.html | 🟢 0 | 🟢 1 |
| aviso-legal.html | 🟢 0 | 🟢 1 |
| ayuda.html | 🟢 0 | 🟢 2 |
| baqueano-ia.html | 🟢 0 | 🟢 1 |
| cookies.html | 🟢 0 | 🟢 1 |
| cronicas.html | 🟢 0 | 🟢 1 |
| denuncias.html | 🟢 0 | 🟢 1 |
| departamento.html?depto=madriz | 🟢 0 | 🟢 4 |
| destino.html | 🟢 0 | 🟢 1 |
| destinos.html | 🟢 0 | 🟢 1 |
| experiencias.html | 🟢 0 | 🟢 16 |
| favoritos.html | 🟢 0 | 🟢 1 |
| gastronomia.html | 🟢 0 | 🟢 5 |
| historia.html | 🟡 `#epocaPrehispanica` `#resistenciaIndigena` `#periodoColonial` `#independencia` `#guerraNacional` `#sigloXX` | 🟢 1 |
| index.html | 🟢 0 | 🟢 3 |
| legal.html | 🟢 0 | 🟢 1 |
| mapa.html | 🟢 0 | 🟢 2 |
| mi-negocio.html | 🟢 0 | 🟢 1 |
| mi-viaje.html | 🟢 0 | 🟢 1 |
| musica.html | 🟢 0 | 🟢 1 |
| nosotros.html | 🟢 0 | 🟢 2 |
| offline.html | 🟢 0 | 🟢 1 |
| perfil.html | 🟢 0 | 🟢 1 |
| privacidad.html | 🟢 0 | 🟢 1 |
| terminos.html | 🟢 0 | 🟢 1 |
| testimonios.html | 🟢 0 | 🟢 1 |

## Página 404

- 🟢 enlace a `index.html`
- 🟢 enlace a `destinos.html`
- 🟢 enlace a `mapa.html`
- 🟢 enlace a `experiencias.html`

El estado HTTP 404 real del dominio lo verifica `tools/kronox-prod-evidence.mjs` (workflow kronox-evidence) en producción.
