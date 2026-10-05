# Arquitectura de datos e identidad de BAQUEANO

## 🎯 POR QUÉ

BAQUEANO necesita que Web, Android, Ops Center, BAQUI y el mapa compartan datos y una identidad coherente sin perder la compatibilidad que hoy aporta Firebase. La meta es retirar la dependencia operacional de Firestore, no borrar Firebase.

## ⚙️ CÓMO

Supabase es la fuente principal de verdad. Firebase y Supabase Auth coexisten durante una transición controlada. Un perfil BAQUEANO estable se vincula con una o más identidades verificadas; ninguna coincidencia por correo se acepta si el proveedor no confirmó el correo. Las escrituras privilegiadas pasan por Edge Functions y RBAC. Firestore y Firebase Storage permanecen como legado hasta validar cada módulo y su rollback.

```text
Firebase Auth ───────┐
                     ├──► profile BAQUEANO ──► Supabase DB
Supabase Auth ───────┘             │
                                   ├──► Web / Android / Ops / BAQUI / Mapa
Supabase DB ──► Edge Function ──► FCM ──► Android
```

## 📦 QUÉ

### Responsabilidades

| Plataforma | Responsabilidad de transición |
|---|---|
| Supabase | PostgreSQL/PostGIS, fuente operacional, perfiles centrales, RBAC, Storage nuevo, Edge Functions, Realtime selectivo y Supabase Auth preparado |
| Firebase | Auth actual, Google Sign-In, FCM, Analytics, App Check y compatibilidad con Firestore/Storage/Hosting/Functions heredados |
| Azure | Publicación de `baqueanonicaragua.com` y APIs Azure existentes |

### Evidencia auditada al 2026-10-05

| Área | Estado | Evidencia |
|---|---|---|
| Supabase catálogo | 🟢 | 237 `places`, 30 `businesses`, 7 `destinations`; importación territorial registrada `ok` |
| Supabase Auth | 🟡 | Infraestructura disponible; 0 usuarios actuales |
| Perfil central | 🟡 | `profiles` e `identity_links` existen, ambos con 0 filas |
| Antiduplicación | 🔴 | `profiles.id` aún tiene FK directa a `auth.users`; bloquea perfiles solo-Firebase |
| Firebase Auth/Google | 🟡 | SDK y flujo Android activos; falta prueba E2E de esta auditoría |
| Firestore Android | 🟡 | Accesos activos en perfiles, directorio, pagos y servicio general |
| FCM / Analytics | 🔴 | No aparecen dependencias Flutter declaradas; validar consola y APK antes de integrar |
| App Check | 🟡 | Dependencia Flutter declarada; falta inventario de recursos protegidos |
| Firebase Storage | 🟡 | Configuración/reglas heredadas conservadas; falta inventario de objetos y referencias |
| Supabase Storage | 🟡 | Buckets creados; migración de archivos pendiente |
| Web/Ops | 🟡 | Ops usa Edge Functions; todavía hay rutas y textos Firestore heredados |
| BAQUI | 🟡 | Edge Function compartida existe; consumidores y fuentes aún no están totalmente unificados |
| Backup | 🟡 | Catálogos locales respaldados; faltan exportaciones verificadas de Firebase Auth/Firestore/Storage |

### Modelo de identidad objetivo

- `profiles.id`: UUID estable de la persona BAQUEANO, independiente del proveedor.
- `profiles.supabase_user_id`: vínculo nullable y único a `auth.users.id`.
- `profiles.firebase_uid`: compatibilidad indexada durante la transición.
- `identity_links`: vínculo normalizado por `(provider, provider_user_id)` para `firebase`, `supabase`, `google` o `email`.
- Un proveedor no puede vincular la misma identidad a dos perfiles.
- Un perfil puede tener como máximo un vínculo por proveedor.
- La coincidencia por correo solo vincula automáticamente cuando el correo está verificado y no hay ambigüedad.
- Roles y permisos viven en Supabase, nunca en `user_metadata` editable.

### Flujo de resolución

1. Verificar criptográficamente el token del proveedor.
2. Buscar `(provider, provider_user_id)` en `identity_links`.
3. Si existe, cargar ese `profile_id`.
4. Si no existe y el correo está verificado, buscar exactamente un perfil por correo normalizado.
5. Si hay cero coincidencias, crear un perfil y su vínculo dentro de una transacción.
6. Si hay más de una coincidencia o conflicto, no vincular automáticamente; registrar revisión.
7. Actualizar `last_login_at` y auditar el evento sin guardar tokens.

### Matriz de los 35 entregables

| # | Entregable | Estado |
|---:|---|---|
| 1–2 | Auditoría Firebase/Firestore | 🟡 inventario local; falta evidencia de consola |
| 3 | Auditoría Supabase | 🟢 esquema y conteos consultados |
| 4–7 | Flutter, Web, Ops, BAQUI | 🟡 consumidores identificados; falta E2E |
| 8–9 | Arquitectura actual/propuesta | 🟢 documentada aquí |
| 10–13 | Tablas y migraciones | 🟡 reutilización definida; borrador de identidad no aplicado |
| 14–16 | Auth, puente e identidades | 🟡 Edge Function dual existente; modelo debe desacoplarse |
| 17 | RLS | 🟡 endurecida; debe resolver `current_profile_id()` |
| 18–24 | Mapa, BAQUI, Flutter, Web, Mi Negocio, reservas, favoritos | 🟡 migración parcial |
| 25–27 | Notificaciones, Analytics, Storage | 🔴 auditoría remota pendiente |
| 28 | Configuración compartida | 🔴 `app_settings`/`branding_settings` no existen |
| 29–30 | Pruebas y seguridad | 🟡 pruebas parciales; asesores mantienen hallazgos |
| 31–32 | Backups y rollback | 🟡 catálogos sí; Firebase remoto pendiente |
| 33 | Conteos antes/después | 🟢 catálogo territorial documentado |
| 34 | Diferencias Web/Android | 🟡 Firestore/estáticos aún divergen de Supabase |
| 35 | Avance real | 🟡 aproximadamente 45%; no se considera producción unificada |

### Fases y rollback

1. Exportar y verificar Firebase Auth, Firestore y Storage; no borrar orígenes.
2. Aplicar en entorno de prueba el desacoplamiento de perfiles y ejecutar casos de duplicación/concurrencia.
3. Vincular usuarios Firebase con correo verificado; conflictos van a revisión.
4. Habilitar Supabase Auth para un grupo controlado y vincular al mismo perfil.
5. Migrar cada módulo de lectura/escritura con comparación Supabase = Web = Android.
6. Mantener Firebase como rollback hasta aprobación expresa por módulo.

Rollback de identidad: deshabilitar altas por Supabase Auth, conservar los vínculos ya auditados y continuar autenticando con Firebase; nunca eliminar usuarios ni perfiles como mecanismo de reversión.

### Puertas obligatorias antes de producción

- Cero duplicados de identidad y correo verificado ambiguo.
- Login Firebase y Google existentes intactos.
- Login Supabase, recuperación y verificación probados en staging.
- RLS y Edge Functions probadas para ambos proveedores.
- `flutter analyze`, `flutter test`, pruebas web/i18n y consistencia de conteos limpias.
- Backups restaurables y rollback ensayado.
- Autorización explícita del propietario para desplegar.
