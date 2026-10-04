# AUDIT_BEFORE — BAQUEANO NICARAGUA · Hackathon Nicaragua 2026

> **Fecha:** 2026-10-04 · **Fase:** 0 (baseline) + 1 (auditoría) · **Alcance:** solo lectura. No se modificó código, producción, Supabase ni Azure.
> **Commit auditado:** `724a5e3` (HEAD de `main`, el mismo que sirve producción según `/health`, ver CI run 37231649728).
> **Rama de trabajo:** `claude/upbeat-turing-m7y81v` (designada por la sesión; sustituye a `audit/competition-hardening-2026`).

## 🎯 POR QUÉ · ⚙️ CÓMO · 📦 QUÉ (Círculo Dorado)

- 🎯 **POR QUÉ:** el jurado premia lo demostrable. Antes de corregir hay que saber, con medición, qué funciona, qué falla y por qué.
- ⚙️ **CÓMO:** inventario automático de `website/` (31 HTML, 79 CSS, 98 JS), medición de cobertura i18n contra los catálogos, revisión de `firebase.json`, `service-worker.js`, `azure/`, workflows, y consulta **real** a GitHub Actions (logs de jobs fallidos) y a Supabase (tablas, RLS, advisors) mediante conectores de solo lectura.
- 📦 **QUÉ:** este informe + `docs/HACKATHON_COMPLIANCE_MATRIX.md`. Cada dato lleva su fuente. Lo que no pude medir está marcado **⚪ No verificado** y dice por qué.

## 0. Límites honestos de esta auditoría

| Qué no pude hacer | Motivo | Consecuencia |
|---|---|---|
| Abrir `https://baqueanonicaragua.com` directamente | La red de esta sesión bloquea el dominio (proxy: `connect_rejected`) | Cabeceras en vivo, HTTP/2, TLS: ⚪. Sí uso evidencia de **logs de CI** que consultaron producción el 2026-10-04 20:20Z |
| Lighthouse / Core Web Vitals (LCP, INP, CLS, TBT, TTFB) | Sin acceso al sitio publicado desde aquí | **No se inventan números.** Se listan causas estructurales medibles (peso, bloqueo, CSS/JS por página) |
| Estado vivo de NSG, SSH, `ufw` en Azure | Sin credenciales `az`/SSH (correcto: GitHub tampoco las tiene) | Solo se audita el *código* de `azure/*.sh` y lo que el CI observa desde fuera |
| Leer el PDF oficial "Entregables Nacionales Hackathon Nicaragua 2026 – Aficionado" | **No está en el repositorio ni en la sesión** | La matriz se construye con la lista de requisitos del encargo; debe contrastarse con el PDF (ver §Pendientes) |
| Pruebas de navegador en 15 anchos × 4 navegadores | Fuera del alcance de Fase 1 | Responsive: auditoría estática; la medición va en Fase 4 |

## 1. Resumen ejecutivo

**Lo que ya está bien (con evidencia):**
- Producción vive y está sincronizada: `/health` devolvió commit `724a5e3` el 2026-10-04 20:20Z; VM `vm-baqueano-prod`, Linux 6.8.0-1070-azure, uptime ≈ 28,7 h; API Azure OK; Supabase PostgreSQL responde (17 departamentos, 254 ms); PostgreSQL local solo en `127.0.0.1:5432`.
- Cero secretos reales en el repo: no hay claves `sk-…`, `gsk_…`, JWT ni llaves privadas; las `AIza…` son claves **públicas por diseño** de Firebase (web/Android). `service_role` solo aparece en código de servidor (Edge Functions, `azure/api`, `functions/`), no en el navegador.
- 0 enlaces/recursos internos rotos en los 31 HTML (verificado con decodificación de URL).
- Menú y footer únicos inyectados por `global-injector.js` + `navigation.js`; `admin.html` queda aparte, como se exige.
- Los 5 CI de Flutter recientes están verdes (runs #247–#251).

**Lo que está mal y bloquea el objetivo (los cinco hallazgos más graves):**

| # | Hallazgo | Evidencia |
|---|---|---|
| F-01 | **El pipeline de despliegue a producción falla en cada push** (≥ 4 runs seguidos: #25–#28) | Log run 37231649728: `Cannot find module '…/tools/verify-sprints.mjs'` |
| F-02 | **CodeQL en rojo en cada push** (≥ 5 runs) por 2 de 4 lenguajes mal configurados | Logs run 37231649651: `java-kotlin` autobuild `gradlew clean` falla; `swift` falla tras 5 min |
| F-03 | **i18n: 5 de 6 idiomas están a ≈ 49 % del catálogo y ≈ 20 % de la UI medible** | `validate-i18n.mjs` → 297 claves faltantes por idioma; 0 `data-i18n` en 30 de 31 páginas |
| F-04 | **Supabase "base principal" casi vacía para contenido territorial** | 41 tablas, RLS en todas, pero `municipalities`=0, `places`=0, `culture`=0, `gastronomy`=0…; contenido real vive en JS/JSON estáticos |
| F-05 | **Peso del repositorio y de los assets**: `.git` 781 MB, `website/assets` 711 MB, APK de 90 MB y `.exe` duplicados versionados | `git count-objects`, `du`, `git ls-files` |

## 2. Hallazgos P0 — CRÍTICO

### F-01 · Despliegue de producción en rojo (workflow sin `checkout`)
- **Problema:** `🚀 BAQUEANO Producción (Azure + Firebase)` termina en `failure` en todos los pushes recientes, aunque producción sí se actualiza (la VM hace *pull* sola cada 2 min).
- **Archivo:** `.github/workflows/deploy-production.yml`, job `verify-azure`.
- **Página afectada:** ninguna (infraestructura/CI). Afecta la evidencia “producción = GitHub main” (Sprint 3).
- **Impacto:** el jurado verá una insignia roja en Actions; el gate de verificación nunca llega a ejecutar `verify-sprints`, cabeceras y redirecciones, así que **esas comprobaciones no están protegiendo nada hoy**.
- **Causa raíz:** el job `verify-azure` no tiene paso `actions/checkout`; el único `checkout` de esa parte del archivo pertenece al job `firebase-hosting`. El archivo `tools/verify-sprints.mjs` **sí está versionado** (`git ls-files` lo confirma); simplemente no existe en el runner. Los pasos previos (health, `/api/azure/health`, `/api/azure/db`) pasan.
- **Solución:** añadir `actions/checkout@v4` + `setup-node` al inicio de `verify-azure`. Cambio de 4 líneas.
- **Riesgo:** bajo; solo toca CI.
- **Prueba necesaria:** `workflow_dispatch` y verificar que el job queda verde; el log debe mostrar los 15 checks.
- **Estado:** 🔴 Abierto (se corrige en Fase 9).

### F-02 · CodeQL falla por configuración, no por dependencias
- **Problema:** `CodeQL Advanced` rojo en cada push y en el cron semanal.
- **Archivo:** `.github/workflows/codeql.yml` (matriz `c-cpp`, `java-kotlin`, `javascript-typescript`, `swift`).
- **Evidencia real (run 37231649651, commit `724a5e3`):**
  - `c-cpp` ✅ · `javascript-typescript` ✅
  - `java-kotlin` ❌ — `autobuild` ejecuta `./gradlew clean` y **BUILD FAILED in 26s** → *“We were unable to automatically build your code. Please change the build mode … to manual”*.
  - `swift` ❌ — falla en *Perform CodeQL Analysis* tras ≈ 5 min en `macos-latest` (**no leí el mensaje interno del job Swift**; la causa probable es el mismo problema de autobuild sobre el proyecto Flutter `ios/`, pero está **sin confirmar**).
- **Causa raíz:** el proyecto Android es Flutter: `./gradlew` necesita el SDK de Flutter (`local.properties`, `flutter.sdk`) que el runner no tiene. Además `AGENTS.md` fija **Android exclusivo**, así que analizar Swift (`ios/`) no aporta.
- **Solución propuesta:** matriz mínima `javascript-typescript` (+ `actions`), y `java-kotlin` solo con `build-mode: manual` tras `subosito/flutter-action` + `flutter build apk --debug`, o eliminarlo. Quitar `swift` y `c-cpp` (código C++ de plantilla `windows/`, `linux/` de Flutter, fuera de alcance).
- **Riesgo:** bajo (reduce cobertura nominal, pero se pierde solo análisis que ya no corría).
- **Prueba:** push a rama → los jobs restantes verdes + alertas visibles en *Security → Code scanning*.
- **Estado:** 🔴 Abierto.

### F-03 · Internacionalización: la cobertura real es mínima
- **Problema:** cambiar de idioma no traduce la mayor parte de cada página.
- **Archivos:** `website/js/global-language.js`, `website/locales/*.json`, `website/scripts/validate-i18n.mjs`.
- **Medición (script propio, método abajo):**

| Idioma | Claves | Faltantes vs ES | Valores idénticos al español |
|---|---|---|---|
| es | 570 | — | — |
| en · fr · it · de | 281 | **297** | 10 · 10 · 14 · 13 (de 273) |
| pt | 281 | **297** | **56** (de 273) → probables textos sin traducir |

  `node website/scripts/validate-i18n.mjs` **termina con error** (exit 1): confirma el fallo, pero **no está en ningún workflow de CI**.
- **Cobertura por página** (texto visible + `placeholder/title/aria-label/alt` cuyo texto coincide *exactamente* con un valor del catálogo ES — cota inferior): total **1 159 de 5 764 textos ≈ 20 %**. Peores: `admin` 4 %, `cronicas` 2 %, `mi-negocio` 7 %, `denuncias` 9 %, `ayuda` 10 %, `departamento` 10 %, `historia` 10 %. Mejores: `testimonios` 100 %, `baqueano-ai` 71 %, `legal` 59 %. Detalle por página en §Anexo A.
- **Causa raíz (3 factores):**
  1. El motor traduce por **coincidencia exacta de frase en español** (`translateLegacy` → `semanticFallbackKeys`) y casi no se usa `data-i18n` (0 en 30 de 31 páginas; solo `i18n-test.html` lo usa). Un texto que no esté literalmente en `es.json` jamás se traduce.
  2. Los catálogos solo contienen ≈ 570 frases de interfaz; el contenido editorial (historia, gastronomía, departamentos, términos legales) no está catalogado.
  3. Solo 4 de 98 archivos JS usan la API `BaqueanoLanguage`: las tarjetas, toasts y mensajes creados dinámicamente (`global-search.js`, `baqueano-travel-session.js`, `destinos-interactions.js`…) quedan en español.
  4. El validador compara *claves entre JSON*, no *textos de las páginas*; por eso reportaba “OK” sin serlo.
- **Solución:** crear `audit-i18n-pages.mjs` (Fase 3), completar 297 claves × 5 idiomas, migrar plantillas JS a `BaqueanoLanguage.t()`, añadir el auditor al CI con umbral progresivo. No crear segundo motor.
- **Riesgo:** medio (toca muchas páginas); mitigar con datos propios nicaragüenses en lista de “no traducir” (Masaya, Ometepe, León, Granada, Somoto, Guardabarranco, Nacatamal, Güirila…).
- **Prueba:** auditor por página + `i18n-browser.test.mjs` (existe, 0 casos `test(` detectados — revisar) + persistencia entre páginas.
- **Estado:** 🔴 Abierto. *Nota de método:* esta medición es una **estimación conservadora** (no ejecuta JS ni cuenta texto generado en runtime); el auditor oficial la reemplazará.

### F-04 · Supabase no es todavía la fuente efectiva del contenido
- **Problema:** la directiva dice “Supabase principal”, pero el contenido que ve el viajero sale de archivos estáticos.
- **Evidencia (MCP Supabase, proyecto `heiudfpthqwtjrtluqlm` ACTIVE_HEALTHY, PG 17.6):** 41 tablas en `public`, RLS activo en las 41. Filas: `departments` 17, `destinations` 7, `businesses` 5, `travel_plans` 31, `official_super_admins` 3; **0 filas** en `municipalities`, `places`, `culture`, `heritage`, `museums`, `gastronomy`, `music`, `crafts`, `festivals`, `communities`, `routes`, `experiences`, `events`, `emergencies`, `day_passes`, `reviews`, `favorites`, `reservations`, `audit_logs` y `firestore_mirror` (0).
- **Contraste:** `website/data/search-index.json` tiene 524 registros (140 municipios, 180 lugares, 99 platos) y `travel-knowledge.json` 27 lugares; los catálogos viven en `js/*-catalog.js`, `territories-data.js`, `sonora-data.js`.
- **Impacto:** (a) “Supabase tiene la misma capacidad para toda la información” no se cumple; (b) el criterio de rúbrica *CRUD real sobre BD en nube* queda sostenido por pocas tablas; (c) `audit_logs` vacío → sin evidencia de trazabilidad.
- **Causa raíz:** migraciones `012/013` crearon el esquema cultural, pero el *seed* masivo desde el contenido estático no se ha ejecutado; el sitio nunca cambió su fuente de lectura.
- **Solución (Fase 6):** script de *seed* idempotente desde los JSON/JS existentes → tablas normalizadas; lectura con caída a estático (no borrar nada); `audit_log` por trigger.
- **Riesgo:** alto si se sobrescribe; por eso solo `INSERT … ON CONFLICT DO NOTHING` y en rama de Supabase.
- **Prueba:** conteos antes/después + pruebas RLS (`supabase/tests/*.sql` ya existen).
- **Estado:** 🔴 Abierto.

### F-05 · Peso del repositorio y de los assets
- **Medido:** `.git` pack 781 MB (3 242 objetos en el pack); `website/assets` 711 MB. Por tipo en `website/assets`: mp3 93 archivos ≈ 421 MB, png 110 ≈ 69 MB, mp4 6 ≈ 62 MB, jpg 145 ≈ 28 MB, jfif 127 ≈ 24 MB, **webp 14, avif 2**. **51 imágenes > 500 KB; 19 > 2 MB.**
- **Versionados que no deberían estarlo:** `website/assets/BaqueanoNicaragua.apk` (≈ 90 MB), `.github/skills/impeccable/.../impeccable.exe` y `.agents/skills/.../impeccable.exe` (≈ 14 MB **cada uno**, duplicados), `.runtime/departamento-full-before.png` (≈ 6 MB), videos duplicados en `assets/videos/` (raíz) y `website/assets/videos/`.
- **Impacto:** clonado lento, CI lento, riesgo de límite de Firebase Hosting (el build de Azure ya excluye `.apk`).
- **Causa raíz:** binarios añadidos sin Git LFS ni almacenamiento externo.
- **Solución:** *no borrar* (regla 0). Generar `docs/ASSET_AUDIT.md`, mover APK a *Releases* de GitHub o Supabase Storage, y proponer LFS. Conversión WebP/AVIF con originales conservados.
- **Estado:** 🔴 Abierto (se documenta en Fase 5; ninguna eliminación automática).

## 3. Hallazgos P1 — ALTO

| ID | Problema | Archivo / página | Causa raíz | Solución | Estado |
|---|---|---|---|---|---|
| F-06 | **Migración de comunidad sin aplicar**: no existen tablas de testimonios en Supabase (`list_tables` no las muestra); `testimonios.html` muestra “no disponible” | `supabase/migrations/20261004170000_community_testimonials.sql`, `supabase/functions/baqueano-community` | El diálogo de permisos rechazó la aplicación (SESSION_LOG 2026-10-04) | Aplicar migración + desplegar Edge Function con autorización del propietario | 🔴 |
| F-07 | **`public.rls_auto_enable()` ejecutable por `anon` y `authenticated`** (SECURITY DEFINER) vía `/rest/v1/rpc/rls_auto_enable` | Supabase `public` | Función de utilería expuesta en esquema API | `REVOKE EXECUTE … FROM anon, authenticated, public` | 🔴 (advisor WARN) |
| F-08 | **9 tablas con RLS y sin políticas**: `profiles`, `favorites`, `reservations`, `travel_plans` (31 filas), `ai_messages`, `ai_sessions`, `verification_requests`, `official_super_admins`, `firestore_mirror` | Supabase | Cierre total deliberado (*lock down*), pero sin políticas el cliente `authenticated` nunca puede leer lo propio | Verificar que *todo* acceso pasa por Edge Functions/`azure/api`; añadir políticas `owner` donde corresponda y **documentarlo** (el jurado lo preguntará) | 🟡 (INFO; intención por confirmar) |
| F-09 | **Rol decidido por correo en JS público** (3 correos de administración en `PRIVILEGED_ACCOUNTS`) | `website/js/user-session.js:38-57` | Tabla de interfaz; el código admite que *solo decide qué se ve* y que los permisos reales están en Firestore rules/Functions | Aceptable como UI, pero: (1) exponer correos de admin en JS público; (2) mover a *custom claims* y leer el rol del token; (3) prueba de que `USUARIO` no entra a `admin.html` | 🟡 |
| F-10 | **Claves de IA leídas del navegador** (`window.__BQ_OPENAI_KEY`, `__BQ_DEEPSEEK_KEY`, `__BQ_GEMINI_KEY`) con llamadas directas a `api.openai.com` | `website/js/route-builder.js:44-46, 856+` | Diseño que permite pegar una clave en el frontend (hoy están vacías → **no hay fuga**, pero la ruta existe) | Retirar rutas directas; llamar a `supabase/functions/baqueano-ai` o `backend/ai` | 🔴 |
| F-11 | **SEO técnico casi ausente**: `canonical` en 3/31 páginas; `og:title` en 2/31; **JSON-LD en 0/31**; **hreflang en 0**; `departamento.html` sin `<title>`; `baqueano-ai.html` sin meta description | todos los HTML | Cabeceras escritas a mano por página | Inyección centralizada desde `global-injector.js` + plantilla por página; JSON-LD solo con datos reales | 🔴 |
| F-12 | **`sitemap.xml` lista solo 9 URLs de 31 páginas y `robots.txt` apunta el sitemap a `app-baqueano.web.app`**, no al dominio oficial; además `Disallow: /css/` impide a los buscadores renderizar la página | `website/sitemap.xml`, `website/robots.txt` | Valores de cuando el origen era Firebase | Sitemap generado en el build con dominio canónico; permitir `/css/` y `/js/` | 🔴 |
| F-13 | **Caché: JS y CSS siempre `no-cache`** (Firebase y Nginx) aunque las URLs ya llevan `?v=`; el service worker además los pide con `cache:'no-store'` | `firebase.json`, `azure/nginx/baqueano.conf:134-141`, `service-worker.js` | Evitar “controles obsoletos” sin tener nombres con hash | Fingerprint en el build (`app.<hash>.css`) + `immutable` solo para esos; HTML sigue `no-cache` | 🟡 |
| F-14 | **Carga de CSS en cascada por JS**: cada página enlaza 5–14 hojas y `global-injector.js` añade en runtime hasta 9 más + Font Awesome (cdnjs) + Google Fonts | `website/js/global-injector.js:~60-100` | Sistema global que impone hojas tras el parseo | Medir con Lighthouse (⚪) y consolidar a 1–2 hojas críticas + diferidas | 🟡 |
| F-15 | **JS bloqueante**: 98 archivos; `departamento.html` 11 scripts sin `defer`, `mi-negocio` 10, `baqueano-ia` 6, `perfil` 6 | páginas listadas | `<script src>` sin `defer/async` | `defer` y carga bajo demanda | 🟡 |
| F-16 | **CI no ejecuta ninguna prueba web**: `flutter_ci.yml` solo corre Flutter y `node -c` del backend; `validate-i18n`, `global-shell.test`, `production-smoke` y `azure/api test` (este solo en deploy) no son gates | `.github/workflows/` | Pipelines creados por separado | Pipeline ordenado (lint→tests→i18n→security→build→calidad→deploy→smoke) | 🔴 |
| F-17 | **README raíz centrado en la app Flutter**; faltan secciones exigidas (Supabase como BD principal, Roles, CI/CD, Testing, i18n, PWA, BAQUI, Capturas, Video demo, variables de entorno completas). Existe `website/README.md` separado | `README.md` (525 líneas) | README anterior al giro web/Azure | Reescribir manteniendo contenido (no borrar) | 🟡 |
| F-18 | **Documentación contradictoria**: `docs/audit/AZURE_AUDIT.md` dice “Azure: ❌ inexistente”; `MATRIZ_EVIDENCIAS…` cita commit `6cc4841` (producción ya sirve `724a5e3`) | `docs/audit/`, `docs/evidencias/` | Documentos de fechas distintas | Marcar como históricos y apuntar a la matriz nueva | 🟡 |

## 4. Hallazgos P2 / P3

| ID | Sev | Problema | Dónde | Solución |
|---|---|---|---|---|
| F-19 | P2 | **CSP con `'unsafe-inline'` en script y style**; `X-XSS-Protection` (obsoleto) activo; Firebase añade `preload` en HSTS y Nginx no → política distinta por origen | `firebase.json`, `azure/nginx/baqueano-security-headers.conf` | Medir scripts inline (hasta 16 por página) → moverlos a archivos → *nonce/hash*; una sola fuente de cabeceras |
| F-20 | P2 | **Nginx**: gzip sí; **sin Brotli, sin `limit_req`, sin HTTP/2 declarado en los `.conf`** (TLS lo añade Certbot fuera del repo) | `azure/nginx/*.conf` | Rate limiting en `/api/`, `client_max_body_size`, timeouts; verificar HTTP/2 en vivo (⚪) |
| F-21 | P2 | **Service worker**: precache de solo 11 URLs; JS/CSS *network-first*; sin *stale-while-revalidate*; SOS no tiene módulo offline propio | `website/service-worker.js` (v14, 74 líneas) | Estrategias por tipo; módulo SOS con números y última ubicación |
| F-22 | P2 | **Estilos inline masivos**: `admin` 225 `style=`, `experiencias` 109, `historia` 101, `mi-viaje` 42 + 12 bloques `<style>`; `experiencias`/`mapa`/`legal` con `<style>` embebido | HTML listados | Moverlos a clases/tokens |
| F-23 | P2 | **`admin.html` tiene 36 `<h1>`** | `website/admin.html` | Un `h1` por vista; resto `h2/h3` |
| F-24 | P2 | **Formularios**: sin auditoría de etiqueta/validación/honeypot hecha; `mi-negocio` (77 KB) y `denuncias` son los de mayor riesgo | `mi-negocio.html`, `denuncias.html`, `ayuda.html` | Auditar en Fase 8 |
| F-25 | P2 | **Lenguaje HTML inconsistente**: `lang="es"` en unas páginas y `es-NI` en otras (`baqueano-ia`, `perfil`, `nosotros`, `privacidad`, `terminos`, `destino`) | HTML | Unificar a `es-NI` o `es` |
| F-26 | P2 | **Imágenes sin `width/height`** en 11 páginas (p. ej. `aliados` 2, `musica` 3); `lazy` bien usado | HTML | Añadir dimensiones (previene CLS) |
| F-27 | P3 | **Scripts de parcheo históricos** en `website/scripts/` (`apply-*.js`, `update-*.js`, `inject-global.js`…) que podrían reintroducir código ya retirado (p. ej. `update-perfil-auth.js` inyectaría un “Modo Demostración”) | `website/scripts/` | Marcar como legado; no ejecutar; mover a `scripts/legacy/` (sin borrar) |
| F-28 | P3 | **Supabase advisors**: `vector` instalada en `public`; `sync_geography_point` sin `search_path` fijo | Supabase | Mover extensión; fijar `search_path` |
| F-29 | P3 | **Páginas auxiliares publicables**: `i18n-test.html`, `baqueano-ai.html` (duplicado de `baqueano-ia.html`), `legal.html` vs `aviso-legal.html` | `website/` | Decidir canónicas; `noindex` en pruebas |
| F-30 | P3 | **Tres lockfiles** (`package-lock.json` raíz, `pnpm-lock.yaml` raíz y de `website/`) y dos `package.json` con nombres distintos | raíz, `website/` | Unificar gestor |

## 5. Auditoría por área (A–Z)

> Formato: **estado** · evidencia · hallazgos relacionados.

- **A. Arquitectura** — Tres capas coexistentes: Flutter Android (`lib/`, `android/`), portal estático (`website/`) servido por Nginx en Azure con respaldo en Firebase Hosting, y workspace Next.js (`website/apps/web`, `apps/admin`) **no desplegado**. Backends: `azure/api` (Node), `supabase/functions` (5), `functions/` (Firebase), `backend/ai` (Genkit). Hay riesgo de **tres APIs solapadas**. Documentada en `docs/architecture/`. Hallazgos F-04, F-16.
- **B. Frontend** — 31 HTML, 79 CSS, 98 JS, sin bundler para el portal. Ver §Anexo B (inventario página→CSS→JS). F-14, F-15, F-22.
- **C. Backend** — `azure/api/server.js` con prueba `evidence-crud.test.js`; 5 Edge Functions Supabase; `functions/index.js`. Contrato `/api/azure/health` y `/api/azure/db` operativo (CI). ⚪ CRUD real: ver F-04.
- **D. Navegación** — `navigation.js`, `global-injector.js`, `global-language.js` existentes y referenciados directamente por 23 de 31 páginas (sin `global-injector` en el HTML: `admin` —exento—, `baqueano-ai`, `destino`, `favoritos`, `mapa`, `offline`, `testimonios`, `i18n-test`; verificar en navegador que reciban menú y footer). `global-shell.test.mjs` (10 casos). Estructura pedida (Explorar/Cultura/Comunidad/Cuenta) por contrastar en Fase 4. ⚪.
- **E. Base de datos** — Ver F-04, F-07, F-08, F-28. 21 migraciones; 2 pruebas SQL de RLS (`supabase/tests/`). Modelo ER en `docs/audit/DATABASE_AUDIT.md` (mermaid). Trazabilidad (`audit_logs` 0 filas).
- **F. Seguridad** — Sin secretos reales. Riesgos: F-07, F-09, F-10, F-19. Reglas Firestore con `isAdmin()` por *custom claim* `role` (`admin`/`super_admin`) y creación de usuario forzada a `explorer`: **buena práctica**.
- **G. Performance** — ⚪ métricas. Estructural: F-05, F-13, F-14, F-15. Video con `preload="none"` + `poster` en 5 `<video>`: bien.
- **H. Accesibilidad** — Existe `css/accessibility.css`; 0 imágenes sin `alt` en los HTML estáticos (regex); `viewport` en 31/31; skip-link no detectado por mi regex (⚪, verificar en navegador); F-23. WCAG 2.2 AA no medida.
- **I. SEO** — F-11, F-12.
- **J. Internacionalización** — F-03, F-25.
- **K. PWA** — `manifest.json` (`start_url:/?source=pwa`, `scope:/`, `standalone`, 2 iconos `src`); SW v14; F-21. Instalabilidad ⚪.
- **L. Responsive** — ⚪ medición. Hay `mobile-first-core.css` y `responsive-ecosystem.css`; riesgo por `<style>` inline con anchuras. Plan Fase 4.
- **M. BAQUI** — `baqueano-travel-session.js` ya no inventa “3 días/1 viajero” y reconoce “pareja y dos niños”, “$500” (SESSION_LOG; 6/6 casos del propietario). Fuera de este informe: parser formal (Fase 7), memoria persistente, citas de fuente. F-10.
- **N. Ops Center** — `admin.html` (104 KB, 11 scripts, `js/ops-center/`), CSS propio, `X-Robots-Tag: noindex` + `no-store` en Firebase y Nginx. Protección por rol: F-09 (prueba pendiente).
- **O. Autenticación** — Firebase Auth conservado; Google para admin; sesión sincronizada con Firestore/Supabase (`firestore-mirror.js`). `redirect_uri_mismatch` ya diagnosticado (commit `39aab17`).
- **P. CI/CD** — F-01, F-02, F-16. Runs: Producción #25–#28 ❌; CodeQL #256–#261 ❌; Flutter #247–#251 ✅.
- **Q. Azure** — Ver §6.
- **R. Firebase** — `firebase.json`: Hosting `app-baqueano` (respaldo), Functions Node 20, CSP/HSTS/XFO/Permissions-Policy, redirects 301/302, cache. Reglas `firestore.rules`, `storage.rules`, `database.rules.json`. Observación: Firebase Hosting excluye `**/*.apk` y videos “(1)”.
- **S. Supabase** — F-04, F-06, F-07, F-08, F-28. Proyecto `heiudfpthqwtjrtluqlm` activo; el segundo proyecto (`supabase-chestnut-flask`) está `INACTIVE` (no usar).
- **T. Deuda técnica** — F-17, F-27, F-30; 3 sistemas (Flutter/estático/Next).
- **U. Código muerto** — Existe `docs/audit/DEAD_CODE_AUDIT.md` y `UNUSED_FILES_CLEANUP.md` previos; no se re-ejecutó. Candidatos: F-27, `baqueano-ai.html`.
- **V. Duplicaciones** — `assets/` raíz vs `website/assets/` (videos y audio duplicados, p. ej. `ENTRE REMOLINOS.mp3` en ambos); dos `impeccable.exe`; `legal.html` vs `aviso-legal.html`.
- **W. Errores de consola** — ⚪ no medido (sin navegador contra el sitio). El SESSION_LOG reporta “0 errores JS” en las páginas probadas por el propietario el 2026-10-04.
- **X. Recursos 404** — **0 en los 31 HTML** (estático). ⚪ 404 dinámicos (JS).
- **Y. Listeners duplicados** — ⚪ no medido; sospechosos: `global-injector` + `navigation` + `user-session` que escuchan `baqueano:shell-ready`. Plan: instrumentar en Fase 4.
- **Z. Peticiones de red innecesarias** — ⚪; candidatos: F-14 (Font Awesome + Google Fonts runtime), `locales/*.json` con `?v=` fijo, `search-index.json` diferido (bien).

## 6. Azure — qué sé y qué no

**Evidencia observada hoy (CI run 37231649728, 2026-10-04 20:20Z):**
- `hostname: vm-baqueano-prod`, `Linux 6.8.0-1070-azure`, Node v22.23.3, uptime 103 228 s.
- `/health` → commit `724a5e3`, `deployedAt 2026-10-04T20:19:51Z` (despliegue ≈ 26 s tras el push: modelo *pull* cada 2 min).
- `/api/azure/db` → Supabase PostgreSQL `ok:true`, 17 departamentos, 254 ms; PostgreSQL local “solo localhost, sin datos productivos”.

**Código revisado:** `azure/setup-server.sh`, `configure-nsg.sh` (reglas por prioridad/puerto/origen), `deploy.sh`, `autodeploy.sh`, `enable-https.sh`, `nginx/*.conf` (gzip, `deny` de `.md/.log/.apk`, `Cache-Control` por tipo, `location /api` con `limit_except GET HEAD POST`), `systemd/`.

**⚪ No verificado desde aquí:** reglas NSG vivas, `ufw`, SSH por clave/`PasswordAuthentication no`, IP pública (el documento de evidencias dice `20.80.81.65`), certificado TLS, HTTP/2, puertos 5432/3306/6379/27017 cerrados *desde internet* (el script `tools/verify-sprints.mjs` los comprueba, pero **no corrió en CI** por F-01). Capturas/`docs/evidencias/azure/resultados/verificacion.json` existen pero corresponden al commit `6cc4841`.

**Cloudflare:** no se recomienda activarlo ahora. Origen real = **Azure (Nginx) para `baqueanonicaragua.com`**, con Firebase Hosting solo como respaldo y `baqueano-auth-proxy.conf` que proxifica `/__/auth` a Firebase para el login. Añadir un proxy delante complicaría el `redirect_uri` de Google (ya dio un `redirect_uri_mismatch`), la caché del SW y el diagnóstico. Decisión formal en Fase 9 tras medir TTFB real.

## 7. Seguridad de secretos (sin exponer valores)

| Patrón | Archivos con coincidencia | Veredicto |
|---|---|---|
| `AIza…` (Firebase) | 6: `firebase-config.js`, `user-session.js` (mención), `firebase_options.dart`, `google-services.json`, `AndroidManifest.xml`, `SESSION_LOG.md` | Claves públicas por diseño. **Pendiente:** confirmar en Google Cloud que estén restringidas por referrer/paquete (⚪) |
| `sb_publishable_…` Supabase | `website/js/supabase-config.js` | Clave pública; la seguridad depende de RLS (F-07/F-08) |
| `sk-…`, `gsk_…`, JWT, `-----BEGIN PRIVATE KEY` | **0** | ✅ |
| `service_role` en `website/js`, `website/*.html`, `lib/` | **0** | ✅ (solo servidor) |
| Archivos de secretos versionados | solo `.env.example` (5) y `google-services.json` | ✅ (sin valores reales) |

No hay claves que rotar. **No se ejecutó** escaneo de historial git completo (⚪): recomendado con `gitleaks` en Fase 8.

## 8. Plan de fases propuesto (resumen)

| Fase | Entrega principal | Hallazgos |
|---|---|---|
| 2 | P0 de CI y despliegue | F-01, F-02 |
| 3 | `audit-i18n-pages.mjs`, 297 claves × 5 idiomas, plantillas JS | F-03, F-25 |
| 4 | Responsive 15 anchos, tokens, estilos inline | F-22, F-23, F-26 |
| 5 | Assets, CSS/JS, caché con hash, PWA/SOS | F-05, F-13–F-15, F-21 |
| 6 | Seed Supabase, `audit_log`, estados, roles | F-04, F-06–F-09, F-28 |
| 7 | Parser BAQUI, memoria, fuentes | F-10 |
| 8 | CSP, formularios, escaneo de historial | F-19, F-24 |
| 9 | Nginx, Azure evidencia, Cloudflare decisión | F-20 |
| 10–12 | Pruebas, documentación Hackathon, auditoría final | F-16–F-18 |

## Anexo A — Cobertura i18n por página (cota inferior, método abajo)

| Página | Textos | Cubiertos | % |
|---|---|---|---|
| 404 | 104 | 50 | 48 |
| admin | 478 | 19 | 4 |
| aliados | 300 | 42 | 14 |
| ambiental | 173 | 27 | 16 |
| aviso-legal | 177 | 51 | 29 |
| ayuda | 69 | 7 | 10 |
| baqueano-ai | 48 | 34 | 71 |
| baqueano-ia | 290 | 69 | 24 |
| cookies | 206 | 49 | 24 |
| cronicas | 58 | 1 | 2 |
| denuncias | 214 | 19 | 9 |
| departamento | 255 | 25 | 10 |
| destino | 59 | 27 | 46 |
| destinos | 218 | 70 | 32 |
| experiencias | 195 | 31 | 16 |
| favoritos | 8 | 1 | 13 |
| gastronomia | 286 | 52 | 18 |
| historia | 289 | 29 | 10 |
| i18n-test | 6 | 4 | 67 |
| index | 337 | 107 | 32 |
| legal | 63 | 37 | 59 |
| mapa | 64 | 23 | 36 |
| mi-negocio | 381 | 27 | 7 |
| mi-viaje | 196 | 53 | 27 |
| musica | 267 | 36 | 13 |
| nosotros | 228 | 42 | 18 |
| offline | 72 | 37 | 51 |
| perfil | 228 | 48 | 21 |
| privacidad | 156 | 29 | 19 |
| terminos | 259 | 33 | 13 |
| testimonios | 80 | 80 | 100 |
| **Total** | **5 764** | **1 159** | **≈ 20** |

**Método:** se quitan `<script>`, `<style>` y comentarios; se extrae todo texto entre etiquetas (> 2 caracteres con letras) y los atributos `placeholder/title/aria-label/alt`; un texto cuenta como “cubierto” si coincide, tras normalizar espacios, con algún valor de `locales/es.json`. No ejecuta JS (texto dinámico no contado) y no considera frases parcialmente traducidas. Es una **cota inferior orientativa**; la cifra oficial la dará `audit-i18n-pages.mjs`.

## Anexo B — Inventario resumido página → recursos

Columnas: tamaño HTML KB · `<link css>` · `<script src>` · bloqueantes (sin `defer/async/module`) · JS inline KB · `style=` · menú/footer globales.

| Página | KB | CSS | JS | Bloq. | JS inline KB | style= | `global-injector` |
|---|---|---|---|---|---|---|---|
| 404 | 24 | 8 | 2 | 2 | 1 | 2 | sí |
| admin | 104 | 5 | 11 | 8 | 1 | 225 | no (exento) |
| aliados | 59 | 9 | 3 | 2 | 8 | 8 | sí |
| ambiental | 35 | 9 | 3 | 2 | 2 | 21 | sí |
| aviso-legal | 34 | 8 | 2 | 2 | 1 | 2 | sí |
| ayuda | 9 | 5 | 3 | 3 | 0 | 0 | sí |
| baqueano-ai | 8 | 3 | 2 | 2 | 0 | 3 | no |
| baqueano-ia | 55 | 9 | 7 | 6 | 13 | 28 | sí |
| cookies | 39 | 9 | 2 | 2 | 3 | 11 | sí |
| cronicas | 12 | 5 | 2 | 2 | 0 | 3 | sí |
| denuncias | 42 | 8 | 8 | 6 | 0 | 10 | sí |
| departamento | 70 | 9 | 13 | 11 | 16 | 9 | sí |
| destino | 31 | 7 | 5 | 5 | 14 | 34 | no |
| destinos | 41 | 8 | 4 | 4 | 4 | 31 | sí |
| experiencias | 45 | 7 | 3 | 3 | 2 | 109 | sí |
| favoritos | 3 | 5 | 3 | 3 | 0 | 0 | no |
| gastronomia | 55 | 8 | 2 | 2 | 8 | 5 | sí |
| historia | 60 | 8 | 5 | 3 | 4 | 101 | sí |
| index | 85 | 14 | 5 | 5 | 8 | 51 | sí |
| legal | 15 | 7 | 2 | 2 | 1 | 3 | sí |
| mapa | 28 | 9 | 3 | 2 | 11 | 2 | no |
| mi-negocio | 77 | 8 | 12 | 10 | 1 | 42 | sí |
| mi-viaje | 52 | 7 | 4 | 4 | 1 | 42 | sí |
| musica | 53 | 8 | 3 | 3 | 8 | 22 | sí |
| nosotros | 40 | 8 | 2 | 2 | 1 | 53 | sí |
| offline | 19 | 3 | 2 | 2 | 1 | 2 | no |
| perfil | 42 | 9 | 11 | 6 | 4 | 65 | sí |
| privacidad | 25 | 8 | 2 | 2 | 1 | 33 | sí |
| terminos | 52 | 8 | 2 | 2 | 3 | 3 | sí |
| testimonios | 15 | 5 | 7 | 4 | 0 | 0 | no |
| i18n-test | 2 | 1 | 1 | 1 | 0 | 0 | no |

*(“no” en `global-injector` = no aparece el texto `global-injector` en el HTML; puede cargarse por otro script — comprobar en Fase 4 si esas páginas reciben el menú y el footer únicos.)*

## Pendientes de verificación para cerrar la Fase 1

1. Leer el PDF oficial y contrastarlo con la matriz (no estaba disponible).
2. Ejecutar Lighthouse (móvil y escritorio) sobre `https://baqueanonicaragua.com/` desde una red con acceso.
3. Confirmar en Azure: NSG, SSH, `ufw`, certificado, HTTP/2.
4. Leer el mensaje interno del job CodeQL Swift.
5. Confirmar restricciones de las claves `AIza…` en Google Cloud.
