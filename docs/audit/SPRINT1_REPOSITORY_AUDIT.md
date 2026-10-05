<!--
🎯 POR QUÉ: la directiva Kronox 2026 exige empezar auditando TODO con evidencia medible antes de declarar
  cualquier requisito de Sprint 1 como cumplido. Las auditorías anteriores (docs/audit/*, 2026-10-03) siguen
  siendo válidas como historia, pero no reflejan los cambios del 2026-10-04/05.
⚙️ CÓMO: cifras obtenidas con comandos reproducibles sobre `main` (git ls-files, du, git grep), el catálogo real
  de Supabase vía MCP y el workflow `kronox-evidence` ejecutado desde un runner de GitHub (fuera de la VM).
📦 QUÉ: inventario, secretos, Git, duplicados/legado, estado de producción y clasificación de S1-01…S1-12.
-->
# Auditoría del repositorio — Sprint 1 (Kronox 2026)

**Fecha:** 2026-10-05 · **Commit auditado:** `fba666b` (main) · **Auditor:** sesión Claude Code con verificación automática.
**Regla de lectura:** nada aparece en verde sin evidencia reproducible. La documentación no cuenta como implementación.

## 1. Inventario (archivos versionados)

`git ls-files | wc -l` → **2 150 archivos**.

| Área | Archivos | Contenido | Observación |
|---|---:|---|---|
| `website/` | 1 386 | Web pública (31 HTML), Ops Center (`admin.html`), JS, CSS, locales ×6, `apps/` + `packages/` (Next.js, 229 archivos) | Producción: build estático `website/scripts/build-hostinger-static.mjs` |
| `lib/` + `android/` + `test/` | 177 | App Flutter (Android exclusivo) | `ios/`, `web/`, `windows/` no se tocan (AGENTS.md) |
| `supabase/` | 68 | 44 migraciones, 8 Edge Functions + `_shared`, pruebas SQL | Backend central |
| `azure/` | 19 | `deploy.sh`, `autodeploy.sh`, API Node (`azure/api`) | Pull-based cada 2 min |
| `functions/`, `backend/` | 30 | Cloud Functions heredadas y prompts de IA | **Legado** (ver §5) |
| `admin/` | 14 | Panel Flutter admin antiguo | **Legado**: el Ops Center vigente es `website/admin.html` |
| `.github/` | 64 | 8 workflows + skills | |
| `docs/` | 62 | Arquitectura, auditorías, seguridad, marketing | |
| `.runtime/` | 24 | Capturas PNG antes/después | Evidencia visual, no código |
| `assets/` (raíz) | 124 | Recursos de la app Flutter | |

**Archivos más pesados versionados:** APK 91,0 MiB (`website/assets/BaqueanoNicaragua.apk`), video 42,3 MiB, `impeccable.exe` 14 MiB **duplicado** en `.github/skills` y `.agents/skills`, audios de 8–13 MiB. El build de producción ya excluye el APK y 15 videos sin uso (`ignoredAssetNames`), pero la salida pesa 624,9 MiB → riesgo de despliegue lento y de disco en la VM (ver §6).

## 2. Secretos

Barrido con `git grep` de patrones `service_role`, `-----BEGIN`, `AKIA`, `sk-`, `SUPABASE_SERVICE_ROLE_KEY=`, cadenas de conexión de Azure y credenciales de Firebase Admin.

| Hallazgo | Resultado |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` con valor | **No encontrado** (solo nombres de variable y `.env.example`) |
| Claves privadas / credenciales Azure / Firebase Admin | **No encontrado** |
| Claves de navegador Google/Firebase (`AIza…`) | Presentes en `android/app/google-services.json`, `AndroidManifest.xml`, `lib/config/firebase_options.dart`, `website/js/firebase-config.js`, `user-session.js`. **Públicas por diseño**; control: restricción por referrer/app en Google Cloud (acción del propietario, no verificable desde el repo) |
| Clave `anon` de Supabase en el frontend | Pública por diseño; la seguridad la imponen RLS + RPC (probado en vivo, §6) |

## 3. Git y control de versiones

| Control | Estado |
|---|---|
| Ramas | `main` + `claude/sleepy-goodall-kqogrq` |
| Convención de commits | Prefijos `feat/fix/ci/docs(…)` en español, en uso desde 2026-10-03; no hay `commitlint` que la imponga |
| Etiquetas / releases | **Ninguna** → no hay punto de retorno nombrado; el rollback real lo da `azure/deploy.sh --rollback` (releases atómicos en la VM) |
| Force-push sobre `main` | No usado en esta auditoría |
| `.gitignore` | Cubre `*.log`, `dist-hostinger`, `node_modules`, `.env`; `firestore-debug.log` existe en el disco pero **no está versionado** |
| Clon en esta sesión | Superficial (`--depth`); el historial completo vive en GitHub |

## 4. Base de datos (catálogo real, no documentación)

66 tablas en `public`, **todas con RLS**, 97 FK, 252 índices. El diccionario generado está en `docs/database/DATA_DICTIONARY.md` (`tools/db/gen-data-dictionary.mjs`). Las 21 pruebas SQL de `supabase/tests/database_central_cases.sql` pasan en una transacción que se revierte. Datos pendientes de calidad: 7 destinos publicados sin fuente, 5 negocios sin coordenadas, 144 municipios sin coordenadas y 0 usuarios en `auth.users` (la identidad sigue en Firebase).

## 5. Duplicados, alias y legado (nada se borra)

| Elemento | Diagnóstico | Acción |
|---|---|---|
| `website/baqueano-ai.html` ↔ `baqueano-ia.html` | Alias con `meta refresh` (no es duplicado de contenido) | El build declara el canonical del destino y lo excluye del sitemap (`fba666b+`) |
| `impeccable.exe` en `.github/skills` y `.agents/skills` | Binario duplicado de 14 MiB, contenidos de skill divergentes | Documentado; eliminar requiere autorización |
| `admin/` (Flutter) | Panel anterior sin referencias desde la web | Marcar como legado; no borrar |
| `functions/` (Cloud Functions) + `backend/ai` | Arquitectura anterior a Edge Functions | Legado; la autoridad es `supabase/functions/*` |
| `docs/evidencias/MATRIZ_EVIDENCIAS_SPRINTS_1_2_3.md` | Declara "100 % COMPLETADO" en `6cc4841` con enlaces `file:///d:/` rotos | Marcada como **histórica**; la matriz vigente está en `docs/hackathon/development/` |
| Canonical/sitemap/robots a `app-baqueano.web.app` | Repartía la autoridad SEO al dominio de respaldo | Corregido en el build (`fba666b`) |

## 6. Producción medida en vivo (run 37263032958, desde GitHub)

**56 OK · 8 observaciones · 1 crítico.**

- ❌ **Crítico:** `/health` sirve `56bd236`; `main` está en `62076d3`/`fba666b`. El autodeploy de la VM no avanza desde 2026-10-05 00:27 UTC. El build de HEAD se reproduce en CI sin errores, así que la causa está en la VM (servicio, disco o `git fetch`). **Acción del propietario:** `sudo journalctl -u baqueano-autodeploy -n 100` y `df -h`.
- ⚠️ **Puerto 22 abierto a Internet:** restringir el NSG de Azure a IPs de administración.
- ✅ HTTPS (301), www→apex, TLS 1.3 Let's Encrypt válido 88 días, HSTS, CSP, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`; nginx sin versión expuesta; `.git`, `.env`, `package.json` y `supabase/config.toml` devuelven 404; 15 páginas críticas responden 200; 404 real; 5432/3000/6379/8080/3306 cerrados; anon no escribe ni lee tablas sensibles.

## 7. Clasificación Sprint 1 (Desarrollo)

Ponderación: 🟢/🟢⭐ = 1 · 🟡 = 0,75 · 🟠 = 0,40 · 🔴 = 0.

| ID | Requisito | Estado | Evidencia / brecha |
|---|---|---|---|
| S1-01 | Auditoría general | 🟢 | Este documento + `docs/database/AUDITORIA_BD_2026-10-05.md` + evidencia en vivo |
| S1-02 | Reorganización de carpetas | 🟡 | Android (`lib/`,`android/`) y Web (`website/`) separados; persisten `admin/`, `functions/`, `backend/` de legado sin marcar en su raíz |
| S1-03 | README técnico | 🟡 | README con arquitectura y despliegue; falta reflejar la cadena completa CLIENTE→…→BAQUI y el estado real de producción |
| S1-04 | Arquitectura | 🟢 | `docs/architecture/ARQUITECTURA_OFICIAL_BAQUEANO.md` + AGENTS.md §5 (Firebase Auth+Hosting, Supabase principal) |
| S1-05 | Modelo ER Supabase | 🟡 | 66 tablas, 97 FK, territorio normalizado, diccionario generado; faltan diagramas ER por dominio |
| S1-06 | Firebase Authentication | 🟡 | Google Login web y app operativos; sin prueba E2E automatizada de registro/logout |
| S1-07 | Roles y permisos | 🟢 | `roles`, `permissions`, `user_roles`, `staff_roles`; pruebas negativas anon en vivo; sin autoelevación (RLS + Edge Function) |
| S1-08 | Interfaces navegables | 🟡 | 15 páginas críticas 200 en producción; falta verificador automático de enlaces internos |
| S1-09 | Formularios funcionales | 🟠 | Reservas/SOS/testimonios escriben vía Edge Functions; varios formularios siguen sin prueba de envío real |
| S1-10 | Git y control de versiones | 🟡 | Convención en uso y CI en cada push; sin etiquetas de release ni `commitlint` |
| S1-11 | Ejecución local | 🟡 | Build web reproducible (727 archivos) y `flutter_ci` verde; Android en dispositivo físico sin evidencia nueva |
| S1-12 | Video de navegación | 🔴 | No hay video en el repositorio (entregable del equipo) |

**Cobertura ponderada Sprint 1 (Desarrollo):** (3×1 + 7×0,75 + 1×0,40 + 0) / 12 = **8,65 / 12 = 72 %**.
