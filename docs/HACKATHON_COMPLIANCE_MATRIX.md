# HACKATHON NICARAGUA 2026 — MATRIZ DE CUMPLIMIENTO TÉCNICO (línea base)

> **Fecha:** 2026-10-04 · **Commit auditado:** `724a5e3` · **Fase:** 1 (línea base, antes de corregir)
> Documento hermano: [`AUDIT_BEFORE.md`](../AUDIT_BEFORE.md) (los códigos `F-xx` remiten a él).

## 🎯 POR QUÉ · ⚙️ CÓMO · 📦 QUÉ

- 🎯 **POR QUÉ:** convertir cada exigencia del documento oficial en una fila verificable y demostrable en minutos ante el jurado.
- ⚙️ **CÓMO:** cada fila lleva la evidencia *observada* en esta auditoría (archivo, log de CI o consulta a Supabase) y su estado. **Regla:** ✅ solo si yo vi la evidencia; lo que depende de Azure vivo, Lighthouse o del PDF queda ⚪.
- 📦 **QUÉ:** tres tablas (Sprint 1, 2, 3), una de requisitos transversales del encargo y un resumen. La columna **EVIDENCIA FINAL** se llena en la Fase 11.

**Estados:** ✅ Cumple · 🟡 Parcial · 🔴 No cumple · ⚪ No verificado

> ⚠️ **Advertencia de fuente:** el PDF *“Entregables Nacionales Hackathon Nicaragua 2026 – Aficionado”* **no estaba disponible** en el repositorio ni en la sesión. Los requisitos provienen de la lista del encargo. Hay que cotejarlos con el PDF antes de cerrar (acción **M-00**).

## Evidencia independiente usada (observada hoy)

| ID | Evidencia | Fuente |
|---|---|---|
| EV-1 | `/health` de producción devolvió commit `724a5e3`, VM `vm-baqueano-prod`, Linux 6.8.0-1070-azure, uptime 103 228 s, 2026-10-04 20:20Z | Log CI run [37231649728](https://github.com/OscarElieser/APP-BAQUEANO/actions/runs/37231649728), job “Verificar despliegue en Azure” |
| EV-2 | `/api/azure/db` → `supabase-postgresql ok:true`, 17 departamentos, 254 ms; PostgreSQL local solo `127.0.0.1:5432` | mismo log |
| EV-3 | Job `checks` (bash -n de `azure/*.sh`, `node --check`, tests de `azure/api`, APK presente, **build estático del Website**) en verde en el mismo run | `get_job_logs` / `total_jobs:3, failed_jobs:1` |
| EV-4 | Supabase `heiudfpthqwtjrtluqlm` ACTIVE_HEALTHY, 41 tablas con RLS | MCP Supabase `list_projects`/`list_tables` |
| EV-5 | `Flutter Quality Gate` y validación backend en verde (runs #247–#251) | `actions_list` |
| EV-6 | `git log`: 50 commits en `main`, remoto `origin` sincronizado | `git log` local |

---

## PRIMER SPRINT

| REQUISITO | SPRINT | ÁREA | EVIDENCIA ACTUAL | ARCHIVO / URL | ESTADO | FALTA | ACCIÓN | EVIDENCIA FINAL |
|---|---|---|---|---|---|---|---|---|
| README técnico | 1 | Documentación | README raíz de 525 líneas (propósito, instalación Android, Azure) y `website/README.md` | `README.md`, `website/README.md` | 🟡 | Secciones exigidas ausentes: Supabase como BD principal, Roles, CI/CD, Testing, i18n, PWA, BAQUI, Capturas, Video, variables de entorno completas | Reescribir sin borrar contenido (F-17) | _Fase 11_ |
| Stack tecnológico | 1 | Documentación | Descrito de forma dispersa (Flutter, Firebase, Supabase, Azure/Nginx, Node) | `README.md`, `docs/architecture/ARQUITECTURA_OFICIAL_BAQUEANO.md` | 🟡 | Tabla única y vigente | Tabla de stack en README | _Fase 11_ |
| Instalación | 1 | Documentación | Sección “Instalación y Despliegue en Android” y “Instalación local” (web) | `README.md`, `website/README.md` | 🟡 | Guía web + backend + Supabase unificada | Consolidar | _Fase 11_ |
| Ejecución | 1 | Documentación | `npm run build`, `dev-server.js`, scripts en `website/package.json` | `website/package.json`, `dev-server.js` | 🟡 | Comando único documentado y probado en limpio | Probar en entorno limpio | _Fase 11_ |
| Diagrama ER / modelo | 1 | Base de datos | Diagrama Mermaid `erDiagram` presente en documentación (no re-validado contra las 41 tablas reales) | `docs/audit/DATABASE_AUDIT.md`, `docs/architecture/BACKEND_BAQUEANO.md` | 🟡 | ER actualizado con el esquema vivo | Generar ER desde Supabase → `docs/architecture/` | _Fase 11_ |
| Normalización hasta 2FN | 1 | Base de datos | Tablas relacionales con FK en migraciones; no hay análisis de formas normales | `supabase/migrations/001…013`, `20260929…` | ⚪ | Análisis 1FN/2FN por tabla | Documento de normalización | _Fase 6_ |
| Interfaces navegables | 1 | Frontend | 31 páginas HTML con menú/footer únicos; 0 enlaces internos rotos (verificado) | `website/*.html` | 🟡 | Navegación completa en 15 anchos no medida | Barrido responsive (Fase 4) | _Fase 4_ |
| Formularios funcionales | 1 | Frontend/Backend | Formularios en `mi-negocio`, `denuncias`, `ayuda`, `perfil`, login; sin auditoría de validación/honeypot | `website/mi-negocio.html`, `denuncias.html` | 🟡 | Validación cliente+servidor, estados loading/error/éxito, anti-spam (F-24) | Auditar y corregir | _Fase 8_ |
| Control de versiones | 1 | Git | Repositorio en GitHub, 50 commits, rama `main` | `github.com/OscarElieser/APP-BAQUEANO` | ✅ | — | — | EV-6 |
| Commits legibles | 1 | Git | Mensajes recientes: “mega”, “mega3”, “domingo4”, “actualizacion 4octubre 1” | `git log` | 🔴 | Convención `audit:/fix:/perf:/i18n:/a11y:/security:/docs:/test:` | Commits pequeños y descriptivos desde ahora; no reescribir historia | _Fases 2–12_ |
| Evidencia Commit / Push / Pull | 1 | Git | Historial y sincronización con `origin`; sin documento de evidencia | `docs/evidencias/sprint-1/` | 🟡 | Capturas/log de commit, push y pull con fecha | Generar en `HACKATHON_EVIDENCE.md` | _Fase 11_ |
| Tres roles funcionales | 1 | Seguridad | Reglas Firestore: `explorer` por defecto, `admin`, `super_admin` (claim `role`); tabla `official_super_admins` (3 filas) | `firestore.rules:31-35,106`, `website/js/user-session.js` | 🟡 | Mapa a nombres SUPERADMIN/ADMIN/USUARIO, prueba de que USUARIO no entra a Ops, política RLS equivalente en Supabase (F-08, F-09) | Matriz de roles + prueba E2E | _Fase 6_ |
| Código legible | 1 | Calidad | Encabezados “Círculo Dorado”; archivos CSS/JS muy grandes (`styles.css` 240 KB) | `website/js/*.js`, `styles.css` | 🟡 | Reducción de duplicación y CSS inline (F-22) | Refactor gradual | _Fase 4_ |
| Buenas prácticas | 1 | Calidad | `flutter analyze --fatal-infos` y `flutter test` en CI (verde); sin lint ni tests web en CI | `.github/workflows/flutter_ci.yml` | 🟡 | Lint JS, pruebas web y i18n como gates (F-16) | Pipeline ordenado | _Fase 9–10_ |
| Ejecución local sin errores | 1 | Calidad | SESSION_LOG declara pruebas locales en navegador sin errores JS; no re-ejecutadas aquí | `SESSION_LOG.md` (2026-10-04) | ⚪ | Ejecución limpia reproducible y evidencia | Correr en entorno limpio | _Fase 10_ |
| Video de navegación | 1 | Entregable | No hay video de demostración del recorrido en el repo | — | ⚪ | Guion y grabación | Preparar guion; grabar tras Fase 12 | _Fase 11_ |

## SEGUNDO SPRINT

| REQUISITO | SPRINT | ÁREA | EVIDENCIA ACTUAL | ARCHIVO / URL | ESTADO | FALTA | ACCIÓN | EVIDENCIA FINAL |
|---|---|---|---|---|---|---|---|---|
| Build final | 2 | Build | Job `checks` ejecuta `node scripts/build-hostinger-static.mjs` con éxito (EV-3); CI Flutter compila APK debug (EV-5) | `website/scripts/build-hostinger-static.mjs`, `flutter_ci.yml` | ✅ | — (el APK *release firmado* depende de secretos no verificados) | Mantener | EV-3, EV-5 |
| Servidor Azure | 2 | Infraestructura | VM `vm-baqueano-prod`, `Linux 6.8.0-1070-azure`, sirve el commit actual (EV-1) | `azure/`, `https://baqueanonicaragua.com/health` | ✅ | — | Capturar portal Azure para el jurado | EV-1 |
| SSH | 2 | Infraestructura | `setup-server.sh` configura endurecimiento SSH (código); acceso vivo no probado | `azure/setup-server.sh`, `azure/configure-nsg.sh` | ⚪ | Evidencia de acceso por clave y `PasswordAuthentication no` | Sesión SSH controlada + `sshd -T` | _Fase 9_ |
| IP pública | 2 | Infraestructura | Documentos citan `20.80.81.65` (commit `6cc4841`); no re-resuelta hoy | `docs/evidencias/MATRIZ_EVIDENCIAS_SPRINTS_1_2_3.md` | ⚪ | Resolución DNS y IP actual | `dig`/portal Azure | _Fase 9_ |
| Puertos | 2 | Seguridad red | `configure-nsg.sh` define reglas; `verify-sprints.mjs` prueba 80/443 abiertos y 3000/5432 cerrados **pero no corrió en CI** (F-01) | `azure/configure-nsg.sh`, `tools/verify-sprints.mjs` | ⚪ | Resultado vivo de la prueba (y 3306/6379/27017) | Arreglar F-01 y ejecutar | _Fase 9_ |
| Entorno de programación | 2 | Infraestructura | Node v22.23.3 en la VM (EV-1); `systemd/` y `autodeploy.sh` | `azure/systemd/`, `azure/autodeploy.sh` | ✅ | — | Documentar versiones | EV-1 |
| Base de datos operativa | 2 | Datos | Supabase responde desde Azure (EV-2); PostgreSQL local solo localhost | `/api/azure/db` | ✅ | Tablas culturales vacías (F-04) — operativa pero poco poblada | Seed (Fase 6) | EV-2, EV-4 |
| Conexión real a nube | 2 | Datos | Azure ⇄ Supabase PostgreSQL, 254 ms (EV-2) | `azure/api/server.js` | ✅ | — | — | EV-2 |
| UI components | 2 | Frontend | Sistema global (`baqueano-system.css`, `global-injector.js`); sin tokens unificados documentados | `website/css/` (79 hojas) | 🟡 | Tokens (color, tipografía, espaciado, radios, sombras, z-index, movimiento) consolidados | `design-tokens.css` | _Fase 4_ |
| Flujo UX | 2 | Frontend | Flujo Inicio→Destinos→Mapa→Mi viaje→Perfil previsto en `verify-sprints.mjs` | `tools/verify-sprints.mjs` | ⚪ | Recorrido probado en navegador | Prueba E2E | _Fase 10_ |
| Assets | 2 | Assets | 711 MB en `website/assets`, 51 imágenes > 500 KB, 14 `webp`, 2 `avif` (F-05) | `website/assets/` | 🔴 | Optimización, `srcset`, auditoría de duplicados | `docs/ASSET_AUDIT.md` + scripts seguros | _Fase 5_ |
| Accesibilidad | 2 | Accesibilidad | `css/accessibility.css`; 0 `<img>` sin `alt` (regex); WCAG 2.2 AA no medida | `website/css/accessibility.css` | 🟡 | Revisión de contraste, foco, teclado, modales, `prefers-reduced-motion` | Auditoría a11y | _Fase 4_ |
| Adaptación a tamaños de pantalla | 2 | Responsive | `mobile-first-core.css`, `responsive-ecosystem.css`; sin medición en 15 anchos | `website/css/` | ⚪ | Barrido 320–1920 px, sin overflow horizontal | Playwright por ancho | _Fase 4_ |

## TERCER SPRINT

| REQUISITO | SPRINT | ÁREA | EVIDENCIA ACTUAL | ARCHIVO / URL | ESTADO | FALTA | ACCIÓN | EVIDENCIA FINAL |
|---|---|---|---|---|---|---|---|---|
| Acceso público | 3 | Disponibilidad | `/health` y `/api/azure/*` respondieron 200 a un runner de GitHub (internet público) (EV-1) | `https://baqueanonicaragua.com` | ✅ | — | — | EV-1 |
| Seguridad básica | 3 | Seguridad | Cabeceras (CSP, HSTS, XFO, Referrer, Permissions) en Firebase y Nginx; **CSP con `unsafe-inline`**; sin secretos reales en repo (F-19, §7) | `firebase.json`, `azure/nginx/baqueano-security-headers.conf` | 🟡 | Reducir `unsafe-inline`, una sola fuente de cabeceras, `rls_auto_enable` expuesta (F-07) | Fase 8 | _Fase 8_ |
| Puertos críticos cerrados | 3 | Seguridad red | Ver “Puertos” (Sprint 2). PostgreSQL local escucha solo en `127.0.0.1` (EV-2) | `azure/configure-nsg.sh` | ⚪ | Prueba externa de 5432/3306/6379/27017 | Ejecutar `verify-sprints.mjs` | _Fase 9_ |
| Funcionamiento autónomo | 3 | E2E | La VM se despliega sola cada 2 min (EV-1: commit servido 26 s tras el push); proceso principal del viajero sin pruebas E2E en CI | `azure/autodeploy.sh` | 🟡 | E2E del flujo principal sin intervención | Smoke tests | _Fase 10_ |
| Integración cliente-servidor | 3 | Integración | Frontend → `/api/azure/*` y Edge Functions; `travel_plans` 31 filas (EV-4) | `azure/api/server.js`, `supabase/functions/` | 🟡 | Flujo completo evidenciado | Prueba CRUD E2E | _Fase 6_ |
| Guardar información | 3 | CRUD | `travel_plans` (31), `businesses` (5) con datos; `sprint_evidence_records` **0 filas** | Supabase (EV-4) | 🟡 | Registro de evidencia CRUD con datos | Ejecutar `azure/api` CRUD de evidencia | _Fase 6_ |
| Leer información | 3 | CRUD | `/api/azure/db` lee 17 departamentos (EV-2) | `/api/azure/db` | ✅ | Lectura de contenido cultural desde BD (F-04) | Seed | EV-2 |
| Modificar información | 3 | CRUD | `azure/api/test/evidence-crud.test.js` (2 pruebas) existe; sin ejecución viva documentada | `azure/api/test/` | ⚪ | Evidencia de UPDATE/DELETE con RLS y `audit_log` | Prueba + `audit_logs` (hoy 0 filas) | _Fase 6_ |
| Código de producción = GitHub `main` | 3 | Git | `/health` commit `724a5e3` = HEAD de `main` (EV-1) | `main` | ✅ | El job que lo verifica falla por F-01 (la igualdad sí se cumple) | Arreglar F-01 | EV-1 |
| README actualizado con despliegue Azure | 3 | Documentación | Sección “Despliegue Web en Azure” y “Evidencias reproducibles” en README raíz | `README.md:452-517` | 🟡 | Evidencia desactualizada (commit `6cc4841`), falta diagrama de despliegue | Actualizar | _Fase 11_ |

---

## REQUISITOS TRANSVERSALES DEL ENCARGO (calidad de producto)

| REQUISITO | ÁREA | EVIDENCIA ACTUAL | ARCHIVO / URL | ESTADO | FALTA | ACCIÓN | HALLAZGO |
|---|---|---|---|---|---|---|---|
| 6 idiomas (ES·EN·FR·IT·PT·DE) | i18n | Catálogos existen pero EN/FR/IT/PT/DE tienen 281 de 570 claves; ≈ 20 % de textos de página cubiertos | `website/locales/*.json` | 🔴 | 297 claves × 5 idiomas, auditor por página | Fase 3 | F-03 |
| Idioma persiste | i18n | `localStorage` (`baqueano_language_v2`), `document.documentElement.lang` y `MutationObserver` presentes en el motor | `website/js/global-language.js` | ⚪ | Prueba entre páginas e historial | Fase 3 | F-03 |
| SEO multilingüe (hreflang, canonical, JSON-LD, OG) | SEO | canonical 3/31, OG 2/31, JSON-LD 0, hreflang 0 | `website/*.html` | 🔴 | Plantilla central | Fase 5 | F-11 |
| Sitemap y robots correctos | SEO | 9 URLs de 31; sitemap apunta a `app-baqueano.web.app` | `sitemap.xml`, `robots.txt` | 🔴 | Generar en build | Fase 5 | F-12 |
| Performance (Lighthouse ≥ 90) | Rendimiento | Sin medición posible desde la sesión | — | ⚪ | Ejecutar Lighthouse | Fase 5 | F-05, F-13–F-15 |
| Assets optimizados / video | Rendimiento | `preload="none"` + `poster` en 5 `<video>`; sin WebM; imágenes pesadas | `website/assets/` | 🟡 | WebP/AVIF, WebM, `srcset` | Fase 5 | F-05 |
| Caché con fingerprint | Rendimiento | JS/CSS `no-cache` global | `firebase.json`, Nginx | 🟡 | Hash en build | Fase 5 | F-13 |
| PWA válida | PWA | `manifest.json` + SW v14, `offline.html`; instalabilidad no medida | `website/manifest.json`, `service-worker.js` | 🟡 | Estrategias por tipo, auditoría de instalabilidad | Fase 5 | F-21 |
| SOS con fallback offline | PWA/Seguridad | SOS en home; sin módulo offline con última ubicación | `website/index.html` | 🔴 | Módulo SOS resiliente | Fase 5 | F-21 |
| Responsive móvil probado | Responsive | Sin medición | `website/css/` | ⚪ | Barrido | Fase 4 | — |
| Accesibilidad WCAG 2.2 AA | A11y | Parcial (ver arriba) | — | 🟡 | Auditoría | Fase 4 | F-23 |
| Menú desktop/móvil completo | Navegación | Sistema único existe; estructura pedida por contrastar | `navigation.js`, `global-injector.js` | ⚪ | Prueba de teclado, Escape, focus trap | Fase 4 | — |
| Ningún secreto en frontend | Seguridad | 0 secretos reales; **ruta de claves IA en navegador** vía `window.__BQ_*_KEY` | `website/js/route-builder.js` | 🟡 | Mover a backend | Fase 8 | F-10 |
| Supabase aplica RLS | Datos | RLS activo en 41/41 tablas; 9 sin políticas; función SECURITY DEFINER expuesta | Supabase (EV-4) | 🟡 | Revocar `rls_auto_enable`, políticas documentadas | Fase 6 | F-07, F-08 |
| CRUD real | Datos | Ver Sprint 3 | — | 🟡 | — | Fase 6 | F-04 |
| BAQUI mantiene contexto / no inventa / viajeros | IA | “3 días/1 viajero” corregido; “pareja y dos niños” → 4 viajeros reportado en SESSION_LOG (6/6 casos); parser formal pendiente | `website/js/baqueano-travel-session.js` | 🟡 | Parser estructurado, memoria, fuentes | Fase 7 | — |
| Trazabilidad (`audit_log`, `verified_by`…) | Datos | Tabla `audit_logs` existe (0 filas); estados BORRADOR→ARCHIVADO por confirmar | Supabase | 🟡 | Triggers y estados | Fase 6 | F-04 |
| CI operativo | CI/CD | Flutter ✅; Producción ❌; CodeQL ❌ | `.github/workflows/` | 🔴 | Pipeline ordenado | Fase 9 | F-01, F-02, F-16 |
| CodeQL operativo | CI/CD | JS y C/C++ ✅; Java/Kotlin y Swift ❌ | `codeql.yml` | 🔴 | Matriz reducida / build manual | Fase 9 | F-02 |
| Azure documentado | Infraestructura | Docs existen pero obsoletas/contradictorias | `docs/audit/AZURE_AUDIT.md`, `docs/deployment/AZURE_DEPLOYMENT.md` | 🟡 | Actualizar | Fase 9 | F-18 |
| Rama `main` representa producción | Git | Sí (EV-1) | `main` | ✅ | — | — | — |
| Cloudflare evaluado | Infraestructura | Decisión: no activar aún (origen = Azure + proxy de auth a Firebase) | `AUDIT_BEFORE.md §6` | 🟡 | Medir TTFB real y decidir | Fase 9 | — |

---

## Resumen de la línea base

Conteo automático sobre las tres tablas de sprint (`awk` sobre este archivo):

| Estado | Sprint 1 (16) | Sprint 2 (13) | Sprint 3 (10) | **Total (39)** |
|---|---|---|---|---|
| ✅ Cumple | 1 | 5 | 3 | **9** |
| 🟡 Parcial | 11 | 2 | 5 | **18** |
| 🔴 No cumple | 1 | 1 | 0 | **2** |
| ⚪ No verificado | 3 | 5 | 2 | **10** |

**Lectura:** el flujo “servidor Azure → base en nube → código = `main`” **tiene evidencia real** (EV-1…EV-3). Lo que falta para ganar no es infraestructura sino **demostrabilidad**: CI en verde (F-01/F-02), idiomas (F-03), datos reales en Supabase (F-04), evidencia de puertos/SSH (⚪) y documentación unificada.

## Acciones previas a la Fase 2

| ID | Acción | Responsable |
|---|---|---|
| M-00 | Cotejar esta matriz con el PDF oficial y añadir los requisitos que falten | Propietario / equipo |
| M-01 | Corregir `deploy-production.yml` (checkout) y ejecutar `verify-sprints` | Fase 2 |
| M-02 | Reducir la matriz de CodeQL | Fase 2 |
| M-03 | Ejecutar Lighthouse real y guardar el JSON | Equipo (red con acceso) |
| M-04 | Capturar evidencia Azure (portal, NSG, `sshd -T`, `ss -tlnp`) sin secretos | Equipo |
