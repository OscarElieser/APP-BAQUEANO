# Identidad central con Supabase Auth — Auditoría (Fase 1) y plan por fases

> Fecha: 2026-10-05 · Directiva del propietario: Supabase Auth es la autoridad central de usuarios, sesiones, roles, permisos y seguridad para Web, Ops Center, App Android/iOS y BAQUI. La migración desde Firebase Auth es **controlada**: no se elimina Firebase de inmediato ni se pierden usuarios.

## 🎯 POR QUÉ

- Hoy hay **dos identidades a medias**: Firebase Auth inicia sesión y Supabase guarda los datos.
- Los roles se resuelven por correo en `staff_roles`, sin una tabla de usuarios real en Supabase.
- El propietario necesita un **centro administrativo real** (Ops Center) para gestionar turistas, emprendedores, guías, negocios, auditores y administradores. Toda la seguridad debe vivir en el servidor: RLS, funciones y Edge Functions.

## ⚙️ CÓMO se auditó

Todo lo de esta auditoría se comprobó directamente; nada se infirió de la documentación.
- **Base de datos:** consultas a Supabase sobre `information_schema`, `pg_policies`, `pg_constraint` y `auth.users`.
- **Web:** búsqueda de código (`signInWithPopup`, `getIdToken`, `x-firebase-token`).
- **Servidor:** lectura de las Edge Functions.
- **App:** lectura de `lib/services/auth_service.dart`.

## 📦 QUÉ — Resultado de la auditoría

### YA EXISTE (se reutiliza)

| Elemento | Evidencia |
|---|---|
| Tabla `profiles` (uuid) | 13 columnas, **0 filas**. Tiene `firebase_uid NOT NULL UNIQUE` y `role` de texto (`traveler`, `business_owner`, `guide`, `editor`, `admin`, `superadmin`). RLS: "solo servidor". |
| `staff_roles` | 4 cuentas activas: 1 `super_admin`, 2 `admin`, 1 `auditor` (incluye el auditor del jurado). RLS: solo servidor. |
| `official_super_admins` | 3 superadmins oficiales. |
| `verification_requests` | `entity_type`, `entity_id`, `applicant_uid` (texto, Firebase), `status`, `admin_notes`, `reviewed_by`. 0 filas. |
| `audit_logs` | `admin_email`, `action`, `module`, `target_entity`, `target_id`, `payload`, `ip_address`, `user_agent`. RLS: solo servidor. 0 filas en la base. |
| `businesses` | `owner_uid` (texto) y 5 negocios verificados. |
| Datos por usuario | Se identifican por UID de Firebase en texto: `favorites`, `reviews`, `travel_plans` (6 con UID), `reservations`, `sos_events`, `testimonials`, `explorer_passport_stamps`, `travel_diaries`, `ai_sessions`. |
| RBAC en servidor | `baqueano-ops`, `baqueano-community`, `baqueano-sos` y `baqueano-reservas` verifican el token de Firebase (JWKS) y consultan `staff_roles`. Admin y superadmin escriben; el auditor solo lee. |
| Ops Center protegido en servidor | Las rutas `/ops-center`, `/admin` y `/admin.html` sirven `admin.html`, pero cada dato pasa por `baqueano-ops`, que responde 401/403 sin un rol válido. |
| RLS | Activo en las 48 tablas públicas. |

### FALTA

- **Supabase Auth en uso:** `auth.users` tiene **0 usuarios** y no hay triggers.
- **Login con correo y contraseña:** la web solo ofrece Google, vía Firebase con `signInWithPopup`.
- **Trigger `auth.users → profiles`** con rol `turista` automático.
- **RBAC normalizado:** `roles`, `permissions`, `role_permissions` y `user_roles`.
- **Funciones SQL** `has_role()` y `has_permission()` para usar en RLS.
- **`business_members`:** hoy cada negocio tiene un único `owner_uid` de texto.
- **Estados de usuario** (active, suspended, blocked, pending, deleted_soft) con motivo, autor y duración.
- **Verificación separada:** `profile_verified` (identidad) frente a `businesses.verified` (negocio).
- **Gestión de usuarios en el Ops Center:** filtros, paginación, ficha, roles, suspensión e invitaciones.
- **Invitar usuario** (Admin API desde el servidor).
- **Proceso "turista → emprendedor/guía":** solicitud, revisión y cambio de rol.
- **Inmutabilidad de `audit_logs`:** hoy solo la protege RLS; no hay trigger.
- **Pruebas** de los 10 casos de seguridad.

### ESTÁ INCOMPLETO

- `profiles.firebase_uid` es `NOT NULL`, así que un usuario nativo de Supabase no podría tener perfil.
- `profiles.role` es texto libre y no coincide con los roles pedidos (`turista`, `emprendedor`, `guia`, `auditor`, `admin`, `superadmin`).
- Los estados de `verification_requests` no están normalizados (`pending`, `under_review`, `approved`, `rejected`, `needs_information`), y no tiene revisor como UUID.
- A `audit_logs` le faltan `actor_user_id`, `actor_role`, `old_values`, `new_values` y `reason`.
- El rol se decide por correo en `staff_roles`. Es seguro, porque exige correo verificado y lo comprueba el servidor, pero no está normalizado.

### ESTÁ MAL IMPLEMENTADO

- **`travel_plans`:** la web (`baqueano-ai.js` y `route-builder.js`) inserta directamente por REST, pero la política es "solo servidor", así que esas escrituras fallan en silencio. Las 6 filas con UID vienen de la Edge Function.
- **Chips de idioma de la App:** solo cambiaban de color. **Corregido** hoy con el commit `bea9c5b`.
- **`admin.html`** carga para cualquier visitante y luego muestra la puerta de acceso. Los datos están protegidos en el servidor, pero la protección del frontend depende del JS de la página. Hay que mantener la pantalla "Acceso no autorizado" sin revelar nada administrativo.

### DEBE MIGRARSE (de forma controlada)

| Hoy | Destino | Estrategia |
|---|---|---|
| **Firebase Auth** (Google; usuarios solo en Firebase y Firestore `users`; número desconocido desde Supabase) | **Supabase Auth** (Google y correo/contraseña) | **Modo dual:** las Edge Functions aceptan tokens de **Supabase o de Firebase** durante la transición. Tabla de vínculo `identity_links` (`provider='firebase'`, `legacy_uid`, `profile_id`). El vínculo solo se crea con prueba de control de ambas cuentas: tokens válidos de las dos con el **mismo correo verificado**. Import masivo opcional con `firebase auth:export` (acción del propietario). |
| Datos con `user_uid` de Firebase | `profile_id uuid` | Se añade `profile_id` sin borrar `user_uid`. Las funciones resuelven ambos identificadores mediante `identity_links`. |
| `staff_roles` y `official_super_admins` | `user_roles` | Al crearse o confirmarse un usuario con correo **verificado** que figure en esas tablas, el trigger le asigna el rol equivalente (`super_admin` → `superadmin`). Las tablas antiguas se conservan. |
| App Flutter (Firebase Auth) | `supabase_flutter` | Fase posterior: misma cuenta y mismo backend. |

## Plan por fases

| Fase | Entregable | Verificación |
|---|---|---|
| **A — Supabase Auth** | Cliente `supabase-js` en la web: Google OAuth y correo/contraseña (registro, ingreso, recuperación, cambio de contraseña, cierre de sesión, restauración y renovación de sesión). | Prueba en navegador. Google requiere configurar el proveedor en el dashboard (**acción del propietario**: Client ID/Secret y URLs de redirección). |
| **B — profiles** | Adaptar `profiles` a 1:1 con `auth.users` y trigger de alta. | Prueba SQL en transacción con rollback: casos 1 y 2. |
| **C — RBAC** | `roles`, `permissions`, `role_permissions`, `user_roles`, `has_role()` y `has_permission()`. | Pruebas SQL. |
| **D — RLS** | Políticas para `profiles`, RBAC, `business_members`, `verification_requests` y `audit_logs`; privilegios por columna. | Casos 4, 5, 6 y 10. |
| **E — Gestión de usuarios (Ops)** | Edge Function `baqueano-identity`: list/get paginado, cambio de rol, suspender/reactivar, invitar. Vista responsive en el Ops Center. | Casos 3, 7 y 9, más prueba en navegador. |
| **F — Negocios** | `business_members` (N usuarios ↔ N negocios). El emprendedor edita solo los suyos. | Casos 5 y 6. |
| **G — Verificaciones** | Solicitudes de emprendedor, guía, negocio y perfil, con revisión en el Ops Center. | Flujo completo. |
| **H — Auditores** | Experiencia de solo lectura en el Ops Center. | Caso 8. |
| **I — audit_logs** | Columnas nuevas e inmutabilidad (trigger). | Caso 8. |
| **J — Migración** | Modo dual en las Edge Functions, `identity_links` y guía de importación. | Prueba con ambos tokens. |
| **K — Tests** | Los 10 casos en SQL y CI. | CI. |
| **L — Documentación** | Este documento, ampliado con el detalle final. | Revisión. |

## Riesgos y decisiones

- **No se ejecuta nada destructivo.** `profiles.firebase_uid` pasa de `NOT NULL` a opcional; la tabla tiene 0 filas, así que no hay pérdida posible.
- **Sin `ON DELETE CASCADE` hacia datos de negocio.**
  - `profiles` → `auth.users` usa `RESTRICT`: borrar una cuenta en Auth no borra su perfil, que se desactiva con `deleted_soft`.
  - `user_roles` y `business_members` sí se borran en cascada desde `profiles`, porque son asignaciones.
  - Reservas, auditoría y negocios no dependen por FK del perfil.
- **Privilegios:**
  - Nunca se leen de `user_metadata`.
  - El trigger solo copia nombre, avatar y proveedor.
  - Los roles salen de `user_roles`, que solo modifica el servidor con permisos verificados.
  - Nadie puede elevarse a sí mismo.
  - Solo un superadmin gestiona superadmins.
- **`service_role`** solo existe dentro de las Edge Functions. Ningún archivo servido al navegador lo contiene; CI ya revisa secretos.

## Estado de implementación

### Fases B, C, D, F, G e I — base de datos ✅ (2026-10-05)

| Migración | Contenido |
|---|---|
| `20261005040000_identity_rbac_foundation.sql` | `profiles` 1:1 con `auth.users` (FK `RESTRICT`; `firebase_uid` opcional), estados, `profile_verified`; `roles`, `permissions` (31), `role_permissions`, `user_roles`; `has_permission()`, `has_role()`, `user_has_permission()` (solo servidor), `is_business_manager()`; `business_members` (N:N); `verification_requests` normalizada (con `verified` conservado por compatibilidad); `audit_logs` con actor, valores antes/después y motivo, e **inmutable** por trigger; `identity_links`; triggers de alta y de confirmación de correo; RLS y privilegios por columna. |
| `20261005041000_identity_grants_hardening.sql` | `SELECT` para `authenticated` en `profiles` y `audit_logs` (las filas las decide RLS); se revocan las escrituras directas en `verification_requests` y `businesses`. |
| `20261005042000_identity_restrictive_policies.sql` | La política **restrictiva** "Solo servidor" (`false`) anulaba las nuevas políticas permisivas. Se reescribe con `ALTER POLICY`, sin borrarla: exige sesión, y las políticas permisivas deciden las filas. En `audit_logs` y `verification_requests` las escrituras desde el cliente siguen siempre bloqueadas. |
| `20261005043000_identity_function_privileges.sql` | Funciones de trigger no invocables por RPC; funciones de permisos retiradas a `anon`. |

#### Matriz de permisos (resumen)

- **Todos:** `profile.*_own`, `favorites.manage`, `trips.manage`, `reservations.create`, `reviews.create`, `community.use`, `baqui.use` y `verifications.request`.
- **Emprendedor:** más `businesses.manage_own`, `reservations.read_own_business`, `messages.respond` y `stats.read_own_business`.
- **Guía:** más `guide.services_manage` y `messages.respond`.
- **Auditor:** más lectura (`users.read`, `businesses.read`, `verifications.read`, `audits.read`, `reports.read` y `roles.read`).
- **Admin:** más `users.update`, `users.suspend`, `users.assign_role` (solo roles no administrativos), `users.invite`, `businesses.update`, `businesses.verify` y `verifications.review`.
- **Superadmin:** más `roles.assign_staff`, `roles.assign_superadmin`, `permissions.manage` y `settings.manage`.

#### Pruebas

`supabase/tests/identity_rbac_cases.sql` se ejecuta contra la base real dentro de una transacción que **se revierte por completo**.

Resultado (2026-10-05): **casos 1 a 10 OK**, más la asignación de roles de personal por correo verificado. Después de la prueba se comprobó que `auth.users`, `profiles`, `staff_roles` y `audit_logs` quedaron sin restos y el negocio usado quedó intacto.

La prueba sirvió para detectar y corregir dos problemas: faltaba `SELECT` sobre `profiles` y `audit_logs` para `authenticated`, y la política restrictiva anulaba las políticas permisivas.

Se corrigió también el Ops Center: `deleteAuditLog` y `clearAuditLogs` mostraban "eliminado exitosamente" aunque el borrado fallaba. Las funciones se conservan, pero ahora informan que la auditoría es inmutable.

#### Advisors de Supabase

Los avisos restantes están justificados:
- `has_permission`, `has_role` e `is_business_manager` son ejecutables por `authenticated` a propósito: las políticas RLS las evalúan con el rol de quien consulta, y solo informan los permisos del propio usuario.
- `sos_events` no tiene políticas a propósito: es solo para el servidor.
- `vector` en `public`: aviso preexistente.

### Pendiente

- **E y H:** Edge Function `baqueano-identity` (lista paginada, ficha, roles con reglas contra el escalamiento, suspender/reactivar, invitar, verificaciones) y la vista del Ops Center.
- **A:** login web con Supabase (Google y correo/contraseña).
- **J:** modo dual de tokens.
- **Acción del propietario:** configurar el proveedor Google en Supabase (Authentication → Providers → Google: Client ID/Secret del proyecto de Google Cloud) y las URLs de redirección (`https://baqueanonicaragua.com/**`, `https://www.baqueanonicaragua.com/**`, `https://app-baqueano.web.app/**`). Además, personalizar las plantillas de correo con la marca BAQUEANO (Authentication → Email Templates).
