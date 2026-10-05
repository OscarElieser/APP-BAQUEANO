# Continuar en Antigravity — documento de traspaso

> 🎯 **POR QUÉ:** el historial de chat de Claude Code (nube) no se puede trasladar a otra herramienta. Este documento permite que Antigravity, con Claude conectado o sin él, retome el trabajo sin reconstruir el contexto.
> ⚙️ **CÓMO:** resume el estado verificado al 2026-10-05, los pendientes en orden de prioridad, los comandos de prueba y las acciones que solo puede hacer el propietario. El detalle completo vive en `SESSION_LOG.md`; este archivo solo lo orienta.
> 📦 **QUÉ:** el punto de pausa, la rama, la matriz 20/20, los pendientes, los comandos y las reglas que no se pueden romper.

---

## 1. Primer paso en Antigravity

```bash
git fetch origin
git checkout claude/sleepy-goodall-kqogrq   # aquí está el trabajo a medias; main solo tiene lo probado
git pull
```

Mensaje sugerido para el agente:

> Leé `AGENTS.md`, `docs/CONTINUAR_EN_ANTIGRAVITY.md` y el final de `SESSION_LOG.md`. Retomá desde "Punto de pausa" siguiendo las reglas del proyecto.

| Rama | Commit | Contenido |
|---|---|---|
| `main` | `d6d787c` | Último trabajo **probado**. Es lo que se publica (Azure y Firebase). |
| `claude/sleepy-goodall-kqogrq` | `main` + commits de pausa | Capa CSS "Responsive sin recortes" **sin probar**, más la bitácora. |

## 2. Punto de pausa

✅ **Cerrado el 2026-10-05.** La capa "Responsive sin recortes" se probó y se publicó en `main`. También se corrigió BAQUI:
- reconoce departamentos mal escritos;
- propone una ruta cuando le dicen "quiero conocer Nicaragua";
- reparte el presupuesto por persona y por día;
- recomienda lugares según los intereses.

`npm run test:baqui` da 20/20.

Siguiente trabajo: la sección 4, desde el punto 2 (CTA principal).

## 3. Matriz 20/20 (estado honesto al 2026-10-05)

🟢 verificado con evidencia · 🟡 parcial · 🟠 riesgo · 🔴 bloqueado o no hecho

| # | Requisito | Estado | Evidencia / falta |
|---|---|---|---|
| 1 | Aviso legal | 🟡 | La página existe con enlaces OK. Falta revisión del contenido legal. |
| 2 | Privacidad | 🟡 | La página existe. Falta alinearla con la analítica nueva (Supabase `track_event`). |
| 3 | Consentimiento de cookies | 🟢 | `website/scripts/consent-analytics.test.mjs` 5/5. Se puede reabrir desde el footer. i18n ×6. |
| 4 | HTTPS / HSTS / cabeceras | 🟡 | Se verifica en `kronox-evidence.yml` y `deploy-production.yml` (verify-azure). Producción está atrasada (ver la sección 6). |
| 5 | Meta / OG / Twitter | 🟢 | `production-audit.mjs`: 0 críticos en 31 páginas. |
| 6 | JSON-LD sin datos inventados | 🟢 | `seo-normalize.mjs` (WebSite, Organization, WebPage, BreadcrumbList). |
| 7 | sitemap / robots | 🟢 | Sin web.app, CSS y JS sin bloquear, puerta CI. |
| 8 | Google Business | 🔴 | **Acción externa del propietario.** No se falsifica. |
| 9 | Favicon / apple-touch / manifest | 🟢 | `assets/icons/*`, auditor estático. |
| 10 | ALT en imágenes | 🟢 | Estático + navegador: 0 imágenes sin alt (448 cargas). |
| 11 | Optimización de imágenes | 🟡 | Hero de 42 MB pasó a 1–2,9 MB, footer de 766 KB a 19 KB. Faltan otras imágenes pesadas. |
| 12 | Lighthouse / CWV | 🟠 | Escritorio: Perf 64, CLS 0,057. Móvil: Perf 28–30, LCP 16 s. Brecha: unos 800 KB de CSS que bloquea el render (refactor de CSS crítico). |
| 13 | Contraste WCAG 2.2 AA | 🟢 | axe: 0 críticas y 0 graves en 28 páginas a 390 y 1366 px (`accessibility-report.md`). |
| 14 | Responsive 16 anchos | 🟢 | 448 cargas (28 páginas × 16 anchos): 0 desbordes y 0 elementos interactivos recortados (`responsive-report.md`). |
| 15 | 404 propia | 🟢 | Enlaces OK. El estado HTTP 404 real lo verifica `kronox-evidence`. |
| 16 | Enlaces rotos en CI | 🟢 / 🟡 | Estático: 0 críticos. Quedan 3 "Ver más" de Historia (pueblos, personajes, fuentes) sin contenido: **no inventar**, decide el propietario. |
| 17 | Antispam en servidor | 🔴 | Pendiente bloque E: auditar Edge Functions (rate limit, validación, CORS, App Check). |
| 18 | Botón WhatsApp | 🟢 | `noopener` y nombre accesible verificados en navegador. |
| 19 | Analítica real con consentimiento | 🟢 | `js/baqueano-analytics.js` → RPC `track_event` (Supabase), sin datos personales, 17 eventos. |
| 20 | Una CTA principal por pantalla | 🟢 | 28 páginas auditadas y certificadas con jerarquía visual primaria/secundaria (`docs/production-audit/cta-report.md`). |

Informes en `docs/production-audit/`: `static-audit.md`, `accessibility-report.md`, `responsive-report.md`, `broken-links-report.md`, `cta-report.md` y `lighthouse/`.

Informes que aún faltan (bloque E): `20-point-checklist.md`, `lighthouse-mobile.md`, `lighthouse-desktop.md`, `seo-report.md`, `security-report.md`, `analytics-report.md` y `deployment-verification.md` (commit local = main = desplegado).

## 4. Pendientes en orden

1. ~~Responsive sin recortes~~ ✅ hecho.
2. ~~CTA principal (requisito 20)~~ ✅ hecho (`docs/production-audit/cta-report.md`).
3. **Bloque E:**
   - Antispam y seguridad de Edge Functions y formularios.
   - Los informes que faltan.
   - Matriz final.
   - Workflow de Lighthouse contra producción.
4. **Rendimiento móvil:** CSS crítico, `@import` de Google Fonts en `css/typography.css` y `css/pages/index-destinos-editorial.css`, y animaciones no compuestas.
5. **i18n:** 731 textos en JS dinámico, 60 en TSX y el idioma en tiempo de ejecución de Ops Center (`npm run i18n` debe seguir con 0 errores).
6. **Datos de ejemplo visibles** (eliminar o marcar, nunca inventar): precios y calificaciones de ejemplo, como "4.8 (320 reseñas)", "Desde C$ 600" y los paquetes de `experiencias.html`.
7. **Kronox:** actualizar `tools/kronox/development-requirements.mjs` después del 20/20 y regenerar con `node tools/kronox/gen-development-docs.mjs`.

## 5. Comandos (desde `website/`)

```bash
node scripts/build-hostinger-static.mjs                       # build → dist-hostinger/
python3 -m http.server 8790 --directory dist-hostinger &      # servir el build
npm run i18n                                                  # puerta i18n (0 errores)
node scripts/production-audit.mjs --out=../docs/production-audit   # auditor estático 20/20
node scripts/seo-normalize.test.mjs                           # SEO 12 casos
node scripts/territory-places-rule.test.mjs                   # franja viva 17 territorios
BASE_URL=http://127.0.0.1:8790/ node scripts/consent-analytics.test.mjs
BASE_URL=http://127.0.0.1:8790/ node scripts/browser-qa.mjs   # 28 páginas × 16 anchos (≈6 min)
BASE_URL=http://127.0.0.1:8790/ node scripts/browser-qa.mjs --widths=390,1366   # rápido
node scripts/browser-qa-report.mjs                            # genera los informes .md
```

`browser-qa.mjs` necesita `@playwright/test` y `axe-core`. En local se instalan con `npm i -D @playwright/test axe-core` y `npx playwright install chromium`. En CI los instala el job `browser-qa` de `.github/workflows/deploy-production.yml`.

## 6. Acciones que solo puede hacer el propietario

| Acción | Por qué |
|---|---|
| **Desbloquear el autodeploy de la VM Azure:** `sudo journalctl -u baqueano-autodeploy -n 100` y `df -h`. | Producción sigue en `56bd236`. Por eso la portada en inglés sale mezclada con español en el teléfono: las traducciones ya están en `main`, pero no se publicaron. |
| Cerrar el puerto 22 en el NSG de Azure. | Seguridad. |
| Restringir las claves de navegador (Firebase/Google) por dominio. | Seguridad. |
| Perfil de Google Business. | Requisito 8, externo. |
| Contenido real de "Ver más" en Historia (pueblos, personajes, fuentes). | No se inventa. |
| Videos S1-12 y S3-20. | Evidencia Kronox. |

## 7. Reglas que no se pueden romper (resumen; la fuente es `AGENTS.md`)

- Escribir cada pedido en `SESSION_LOG.md` **antes** de actuar.
- No eliminar nada sin autorización. Nada de DROP, TRUNCATE ni force push a `main`.
- Sin verdes falsos: cada 🟢 necesita una prueba reproducible.
- i18n en 6 idiomas (es, en, fr, it, pt, de) con claves semánticas: `npm run i18n:add lote.json`.
- Nunca exponer `SUPABASE_SERVICE_ROLE_KEY` ni otras claves en el frontend o el repo. Los roles no salen de `user_metadata`.
- BAQUI no inventa precios, horarios, teléfonos ni negocios.
- Encabezado POR QUÉ / CÓMO / QUÉ en todo archivo nuevo o modificado.
- Flutter solo para Android (`lib/` y `android/`). No tocar `ios/` ni el `web/` de Flutter.
- Arquitectura: Firebase = Auth + Hosting. Supabase = base de datos principal.
- Graphify: `graphify query "…"` antes de buscar en el código (`docs/architecture/GRAPHIFY.md`).

## 8. Mapa rápido

| Tema | Dónde |
|---|---|
| Reglas | `AGENTS.md`, `.agents/rules/` |
| Bitácora completa | `SESSION_LOG.md` |
| Arquitectura | `docs/architecture/ARQUITECTURA_OFICIAL_BAQUEANO.md` |
| Base de datos | `docs/database/DATA_DICTIONARY.md`, `supabase/migrations/` |
| Kronox (sprints) | `docs/hackathon/development/`, `tools/kronox/` |
| Auditoría 20/20 | `docs/production-audit/`, `website/scripts/{production-audit,browser-qa,browser-qa-report}.mjs` |
| CI / despliegue | `.github/workflows/deploy-production.yml`, `kronox-evidence.yml` |
| Antigravity | `docs/architecture/{AGENT_SKILLS_ANTIGRAVITY,OPEN_DESIGN_ANTIGRAVITY,21ST_MCP_ANTIGRAVITY}.md` |
