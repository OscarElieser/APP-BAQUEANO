# 🧭 Arquitectura oficial de BAQUEANO (única vigente)

> Versión 2026-10-05. Alineada con `AGENTS.md`, regla 5: directiva del propietario del 2026-10-03. Este documento sustituye cualquier versión anterior. Ante una contradicción, prevalecen `AGENTS.md` y este archivo.

## 🎯 POR QUÉ (Propósito)

Una evaluación externa señaló que README y documentos describían arquitecturas distintas:

- "Firestore es la base principal".
- "Supabase es la única fuente".
- "Roles en Custom Claims".

Este documento fija **una sola** descripción, verificable en el código y en producción, para que el jurado, el equipo y cualquier agente lean lo mismo.

## ⚙️ CÓMO (Arquitectura)

### Diagrama único

```text
                         USUARIO (navegador · Android)
                                     │
               ┌─────────────────────┴──────────────────────┐
               ▼                                            ▼
  https://baqueanonicaragua.com                     App Android (Flutter)
  DNS en HOSTINGER  ──►  AZURE VM vm-baqueano-prod          │
  Nginx + TLS · CSP/HSTS · autodeploy de main (2 min)       │
  ├─ Website estático (website/ → dist-hostinger)           │
  └─ API Node /api/azure/* (127.0.0.1:3000)                 │
               │                                            │
               ├──────────── Firebase Authentication ◄──────┤   IDENTIDAD (UID + ID token)
               │                                            │
               │            Cloud Firestore  ◄──────────────┤   ESCRITURA PRIORITARIA
               │  (Ops Center y app escriben aquí primero)  │
               │                    │                       │
               │       baqueano-mirror (Edge Function, token verificado)
               │                    ▼                       │
               └──────────►  SUPABASE PostgreSQL  ◄─────────┘   ESPEJO COMPLETO + LECTURA WEB
                     RLS · Storage · Edge Functions · pgvector
                     ├─ baqueano-community  (experiencias, moderación, RBAC)
                     ├─ baqueano-ai         (BAQUI, RAG sobre datos verificados)
                     ├─ baqueano-mirror     (réplica Firestore → Supabase)
                     └─ baqueano-status     (salud)

  Firebase Hosting https://app-baqueano.web.app → solo respaldo técnico (no canonical)
```

### Responsabilidades (no intercambiables)

| Componente | Responsabilidad | Evidencia en el repositorio |
|---|---|---|
| **Hostinger** | Dominio y DNS de `baqueanonicaragua.com`, que apunta a Azure | `docs/deployment/AZURE_DEPLOYMENT.md` |
| **Azure VM** | Sirve el sitio y la API (Nginx, TLS, cabeceras de seguridad); se actualiza sola desde `main` | `azure/`, `.github/workflows/deploy-production.yml` (job verify-azure) |
| **Firebase Authentication** | Identidad: Google Sign-In, sesión, UID e ID token RS256 | `website/js/user-session.js`, `lib/` |
| **Cloud Firestore** | Fuente de datos **prioritaria**: toda escritura nueva va primero aquí (Ops Center y Android) | `firestore.rules`, `website/js/firestore-mirror.js` |
| **Supabase** | **Espejo completo** de cada colección, con la misma capacidad. Es la lectura del sitio, la comunidad, BAQUI y la consulta desde Azure. Aplica RLS | `supabase/migrations/`, `supabase/functions/`, `supabase/tests/` |
| **Edge Functions** | Toda escritura en Supabase hecha en nombre de un usuario: verifican el token de Firebase y deciden el rol | `supabase/functions/*` |
| **Firebase Hosting** | Respaldo técnico; nunca canonical | `firebase.json` |
| **Android** | App Flutter separada (`lib/`, `android/`). No se tocan `ios/` ni `web/` | `pubspec.yaml` |

### Reglas de datos

1. **Escritura:** Firestore primero. Después `baqueano-mirror` replica en Supabase con el mismo alcance. La clave pública del navegador **no** escribe tablas de servidor (`SUPABASE_BROWSER_WRITES = false` en el Ops Center).
2. **Lectura pública del sitio:** Supabase, con RLS (solo contenido publicado y columnas públicas).
3. **Contenido de usuarios** (experiencias, comentarios, fotos y videos): solo por la Edge Function `baqueano-community`, que verifica el token de Firebase, sanea, limita frecuencia y comprueba el tipo real de archivo.
4. **`SUPABASE_SERVICE_ROLE_KEY`:** solo existe en el servidor (Edge Functions). Nunca en HTML, JavaScript público, APK ni el repositorio.
5. **Supabase Auth tiene 0 usuarios a propósito:** la identidad es Firebase. Supabase no guarda contraseñas.

### Roles (RBAC)

El rol siempre lo decide el servidor:

1. Custom claim `role` del token de Firebase.
2. Si no hay claim, el correo **verificado** en `public.staff_roles`.
3. Si no aparece, `explorer`.

Roles: Invitado, Explorador (usuario), Emprendedor, **Auditor (solo lectura)**, Admin y Superadmin. La matriz y las pruebas están en [`docs/security/ROLES_Y_PERMISOS.md`](../security/ROLES_Y_PERMISOS.md).

### Dominio y canonical

- Canonical: `https://baqueanonicaragua.com`. `www` redirige al dominio sin `www`; HTTP redirige a HTTPS.
- `https://app-baqueano.web.app` sigue accesible, pero nunca se declara canonical.

## 📦 QUÉ (Criterios verificables)

| # | Criterio | Cómo se verifica |
|---|---|---|
| 1 | Producción sirve el commit de `main` | `curl https://baqueanonicaragua.com/health` (job verify-azure) |
| 2 | Azure consulta Supabase | `GET /api/azure/db` → `"provider":"supabase-postgresql","ok":true` |
| 3 | Sin sesión no se modera ni se leen tablas de servidor | Pruebas negativas en vivo de verify-azure (401 y anon sin acceso) |
| 4 | RLS sin políticas abiertas | `supabase/tests/rls_hardening.test.sql` (pgTAP) |
| 5 | Roles demostrables | `docs/security/ROLES_Y_PERMISOS.md` |
| 6 | Android analiza y compila | `flutter_ci.yml` y CodeQL java-kotlin (build manual) |

### Precedencia documental

Los documentos históricos que describen otra arquitectura (Firestore como "única" base, Supabase como "única autoridad", Next.js obligatorio o `web.app` como canonical) se conservan solo como historial.
