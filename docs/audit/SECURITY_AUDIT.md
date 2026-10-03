# 🛡️ BAQUEANO — Auditoría de seguridad (Fase 1)

## 🎯 POR QUÉ

La rúbrica de Sprint 3 exige seguridad, puertos controlados y datos reales protegidos. Además, el repositorio es **público** (la API de GitHub responde 200 sin autenticación), por lo que todo lo versionado debe considerarse expuesto.

## ⚙️ CÓMO

Revisión estática de reglas Firestore/Storage/RTDB, políticas RLS en `supabase/migrations`, Edge Functions, cabeceras de `firebase.json`, contenido versionado y verificación en vivo de solo lectura (conteos con clave publicable). **No se probaron escrituras contra producción.**

## 📦 QUÉ — Hallazgos

### P0 — Crítico

| ID | Hallazgo | Evidencia | Impacto | Remediación propuesta |
| --- | --- | --- | --- | --- |
| SEC-P0-01 | **11 perfiles completos de Chrome/Edge versionados y publicados** en un repositorio público | `.snapshots/chrome-*`, `.snapshots/edge-*` (3.154 archivos, 336 MB) incluyen `Cookies`, `Login Data`, `Web Data`, `Session Storage`, `Sessions`, `Trust Tokens` | Posible exposición de sesiones, historial y datos de cuentas de quien generó las capturas. En Windows, cookies y contraseñas van cifradas con DPAPI, pero el resto (historial, almacenamiento local, sesiones) no. | 1) **Inmediato:** cerrar sesión en todos los dispositivos de las cuentas Google usadas en esos perfiles y cambiar contraseñas; revocar sesiones de Firebase/Supabase si se usaron. 2) Añadir `.snapshots/*-profile*`, `.snapshots/chrome-*`, `.snapshots/edge-*` a `.gitignore` y `git rm -r --cached` (conserva los archivos en disco). 3) **Requiere autorización explícita:** purgar historial con `git filter-repo` + force-push (operación destructiva e irreversible). Conservar los PNG de `.snapshots/` como evidencia. |
| SEC-P0-02 | `audit_logs` con política `FOR ALL USING (true) WITH CHECK (true)` | `supabase/migrations/010_audit_logs.sql:39`; en vivo la tabla responde 200 al rol anónimo | Cualquiera con la clave publicable (presente en el sitio) puede insertar, modificar o borrar la auditoría. Anula la trazabilidad exigida. | Política solo `INSERT` vía `service_role`/backend; `SELECT` para `admin`/`auditor`; sin `UPDATE`/`DELETE`. |
| SEC-P0-03 | `ops_backup_entities` con `FOR ALL USING (true)` | `005_backup_operations.sql:73`; en vivo 200 | Escritura y borrado anónimo de respaldos del Ops Center. | Restringir a backend. |
| SEC-P0-04 | Bucket `baqueano-media`: `INSERT/UPDATE/DELETE` sin condición de rol | `008_storage_buckets_setup.sql:45-55`; `009`: `storage.buckets INSERT WITH CHECK (true)` | Cualquiera puede subir, sustituir o borrar todo el material multimedia y crear buckets. | Escritura solo `service_role` o admin verificado; quitar `INSERT` en `storage.buckets`. |
| SEC-P0-05 | `traffic_sessions` con `SELECT` y `DELETE USING (true)` | `011_traffic_telemetry.sql:57,63`; en vivo 200 | Lectura pública de telemetría de visitantes (privacidad) y borrado anónimo. | `INSERT` anónimo acotado; `SELECT/DELETE` solo admin. |

> Nota: las migraciones pueden no reflejar exactamente producción (ver DATABASE_AUDIT). Hay que confirmar las políticas reales con `supabase db dump --schema public` o el panel antes de corregir.

### P1 — Alto

| ID | Hallazgo | Evidencia | Remediación |
| --- | --- | --- | --- |
| SEC-P1-01 | RLS usa `auth.uid()::text` comparado con `firebase_uid`, pero **Supabase no está configurado para aceptar JWT de Firebase** (no hay `[auth.third_party.firebase]` en `config.toml`) y `auth.uid()` exige un UUID; los UID de Firebase no lo son | `002_rls_policies.sql`, `012_...:661,664` | Activar *Third-Party Auth: Firebase* en Supabase; reescribir políticas con `(auth.jwt() ->> 'sub')`; añadir claim `role: 'authenticated'` mediante función de bloqueo/claims en Firebase. Sin esto, perfiles, favoritos, reservas y viajes no funcionan con RLS. |
| SEC-P1-02 | `isAdmin()` por lista de correos **sin exigir `email_verified`** | `firestore.rules:31-41`, `storage.rules:26-36`, `functions/lib/auth-middleware.js:59` | Añadir `request.auth.token.email_verified == true`; migrar a Custom Claims como única autoridad. |
| SEC-P1-03 | Edge Function BAQUI pública: `verify_jwt = false`, `Access-Control-Allow-Origin: *`, sin límite de tasa; usa `SUPABASE_SERVICE_ROLE_KEY` para escribir `travel_plans` | `supabase/config.toml:10`, `baqueano-ai/index.ts:46,380,458` | Riesgo de abuso de costes de Gemini y de escrituras masivas. Limitar origen a los dominios oficiales, rate-limit por IP/uid, validar Firebase ID token cuando haya usuario, App Check. |
| SEC-P1-04 | Ops Center escribe/borra en Supabase **desde el navegador** (`destinations`, `businesses`, `audit_logs` delete) | `website/js/ops-center/ops-engine.js` | Hoy no se ejecuta porque el cliente Supabase no se inicializa, pero si se activara con las políticas actuales, `audit_logs` sería borrable. Mover escrituras administrativas a backend (Function/Azure API) con verificación de token. |
| SEC-P1-05 | `travel_plans`: `INSERT WITH CHECK (true)` y lectura pública de filas con `user_uid IS NULL` | `002_rls_policies.sql:121,126` | Validar propietario; no exponer planes anónimos. |
| SEC-P1-06 | ✅ *Verificado correcto:* el build release/bundle **lanza `GradleException`** si falta `key.properties` (no firma con debug). Consecuencia: el job de CI `flutter build appbundle --release` en `.github/workflows/flutter_ci.yml` fallará sin keystore en secretos | `android/app/build.gradle.kts:61-71` | Inyectar keystore desde GitHub Secrets en CI, o compilar `--debug`/APK sin firmar en PRs. |
| SEC-P1-07 | Rol `auditor` no existe en Supabase (`profiles.role` CHECK no lo incluye) ni en reglas Firestore | `001_initial_schema.sql:34` | Requisito Hackathon (Admin/Usuario/Auditor). Ver IMPLEMENTATION_PLAN. |

### P2 — Medio

- **CSP** con `'unsafe-inline'` en `script-src` y `style-src` (`firebase.json`). Hay 264 asignaciones `innerHTML =` en `website/js`; con `unsafe-inline` cualquier XSS es explotable. Plan: auditar `innerHTML` con datos no confiables → `textContent`/sanitizado; luego hashes/nonces.
- `X-XSS-Protection` está obsoleto (inofensivo; puede retirarse).
- CSP de Firebase Hosting **no aplica** a `baqueanonicaragua.com` cuando se sirva desde Hostinger/Azure: hay que replicar cabeceras (`.htaccess`/Nginx).
- `npm audit` de `functions/` no ejecutado (sin `node_modules`). CodeQL existe en `.github/workflows/codeql.yml`.
- Dos `package-lock`/`pnpm-lock` en raíz (npm y pnpm) → riesgo de árbol de dependencias divergente.

### P3 — Bajo

- `database.rules.json` usa claves sin comillas (formato laxo); verificar que `firebase deploy --only database` lo acepte.
- La clave publicable de Supabase y la `apiKey` de Firebase en el cliente son **públicas por diseño**: no son fuga. La seguridad depende por completo de RLS y reglas.

## Controles que ya funcionan ✅

- Firestore y Storage con denegación por defecto (`match /{allPaths=**} { allow read, write: if false; }`).
- RTDB cerrada (`.read/.write: false`).
- `.env`, keystores, `key.properties`, `local-keys.js` ignorados; `.env` no versionado.
- Cabeceras HSTS, `X-Frame-Options: DENY`, `nosniff`, `Permissions-Policy`, `noindex` en `admin.html`.
- Functions verifica ID tokens con `firebase-admin`.
- Tablas sin política (BAQUI memory, `verification_requests`, `official_super_admins`) tienen RLS activado → deniegan por defecto.
