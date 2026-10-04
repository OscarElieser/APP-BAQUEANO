# 🧭 BAQUEANO — Roles y permisos (RBAC)

## 🎯 POR QUÉ (Propósito)

El reto exige al menos 3 roles funcionales y demostrables. En BAQUEANO, **autenticación** (quién sos) y **autorización** (qué podés hacer) están separadas:

- **Identidad:** Firebase Authentication (se conserva por `AGENTS.md`, regla 5).
- **Rol:** lo decide siempre el **servidor**. El navegador solo muestra u oculta controles.

Supabase Auth tiene 0 usuarios a propósito. Supabase no autentica personas: guarda datos y ejecuta las Edge Functions, que verifican el token de Firebase.

## ⚙️ CÓMO (Arquitectura)

```
Usuario ──► Firebase Auth (ID token RS256)
              │
              ▼
Edge Function baqueano-community (verify: emisor, audiencia, firma JWKS)
              │  rol = claim `role`  ─┐
              │       o correo verificado activo en public.staff_roles
              │       o "explorer"
              ▼
Supabase (rol de servicio, RLS: el cliente no lee staff_roles ni escribe tablas de servidor)
```

| Pieza | Archivo |
|---|---|
| Tabla de roles (RLS + política restrictiva + sin privilegios de cliente) | `supabase/migrations/20261005000000_staff_roles_rbac.sql` |
| Autorización del servidor (`resolveActor`, `requireStaffReader`, `requireAdmin`, acción `whoami`) | `supabase/functions/baqueano-community/index.ts` |
| Matriz del frontend (`canAccessOps`, `canWriteOps`, consulta `whoami`) | `website/js/shared/roles.js` |
| Modo Auditor en el Ops Center (bloquea 50+ acciones de escritura, banner) | `website/js/ops-center/ops-engine.js`, `website/css/ops-matte-theme.css` |
| Moderación de solo lectura (`read_only` del servidor) | `website/js/ops-center/ops-community-moderation.js` |
| Reglas de Firestore (`isAdmin()`) | `firestore.rules` |

## 📦 QUÉ (Matriz de permisos)

| Acción | Invitado | Explorador (usuario) | Emprendedor* | Auditor | Admin | Superadmin |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| Ver destinos, mapas y experiencias publicadas | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Publicar, editar o borrar **sus** experiencias, comentar, reaccionar, denunciar | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Editar contenido ajeno | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Entrar al Ops Center | ❌ | ❌ | ❌ | ✅ (solo lectura) | ✅ | ✅ |
| Ver la cola de moderación, denuncias y auditoría | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Exportar respaldo (lectura) | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Aprobar, ocultar, rechazar o destacar experiencias | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Crear, editar o borrar destinos, secciones y configuración | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Asignar roles (`public.staff_roles` / custom claims) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

\* **Emprendedor:** cuenta exploradora con un negocio verificado (`businesses`, verificación desde el Ops Center). Gestiona solo su ficha.

### Cómo asignar un Auditor (sin tocar código)

En Supabase SQL Editor (solo el Superadmin):

```sql
insert into public.staff_roles (email, role, granted_by, note)
values ('correo.auditor@ejemplo.com', 'auditor', 'oscarelieser.informatica.inatec@gmail.com', 'Jurado / auditoría');
```

- **Revocar:** `update public.staff_roles set is_active = false where email = '…';`
- El correo debe estar **verificado** en Firebase. Si no lo está, el servidor lo trata como explorador.

### Pruebas (evidencia)

| Prueba | Resultado esperado | Estado |
|---|---|---|
| `whoami` sin token | 401 | En vivo en CI (`deploy-production.yml` → verify-azure) |
| `mod_queue` sin sesión o con token falso | 401 | En vivo en CI |
| `mod_queue` como explorador | 403 | Código (`requireStaffReader`) |
| `mod_queue` como auditor | 200 con `read_only: true` | Demostrable al asignar una cuenta auditora |
| `moderate` como auditor | 403 "Solo el equipo autorizado del Ops Center puede moderar." | Código (`requireAdmin`) |
| `anon` lee `staff_roles` | denegado (sin privilegios + RLS restrictiva) | Verificado en producción + en vivo en CI |
| `roles.js`: 10 casos (claim, matriz, servidor, correo sin verificar, rol desconocido, sin red) | 10/10 OK | Unitaria |
| Ops Center: métodos de escritura envueltos; con rol de solo lectura devuelven `false` y muestran aviso; `exportFullBackup` permitido | OK | Navegador (Playwright) |

### Limitación conocida

Las lecturas del Ops Center que vienen de **Firestore** dependen de `isAdmin()` en `firestore.rules`. Para que un auditor vea esos paneles hay que darle el custom claim `role: "auditor"` y añadir la lectura correspondiente en las reglas. Ese despliegue es manual (`firebase deploy --only firestore:rules`), porque el repositorio no tiene credencial de Firebase. Los paneles servidos por Supabase (moderación de la comunidad) ya funcionan para el auditor.
