# 🗄️ BAQUEANO — Auditoría de base de datos (Fase 1)

## 🎯 POR QUÉ

La arquitectura oficial declara **Supabase como fuente única de información**. Esta auditoría mide la distancia entre esa decisión y lo que existe hoy.

## ⚙️ CÓMO

Lectura de las 17 migraciones (`supabase/migrations`, 2.372 líneas), reglas de Firestore y conteos anónimos de solo lectura contra producción (`heiudfpthqwtjrtluqlm.supabase.co`).

## 📦 QUÉ

### 1. Esquema definido (migraciones)

44 tablas en `public`, todas con `ENABLE ROW LEVEL SECURITY`. Grupos:

- **Territorio:** `departments`, `municipalities`, `communities`, `places`, `destinations` (+ PostGIS en `003`).
- **Cultura:** `culture`, `heritage`, `museums`, `gastronomy`, `music`, `crafts`, `festivals`, `legends`, `historical_figures`, `events`.
- **Turismo:** `routes`, `route_stops`, `experiences`, `day_passes`, `tourism_services`, `businesses`, `emergencies`.
- **Usuario:** `profiles` (`firebase_uid TEXT UNIQUE`), `favorites`, `travel_plans`, `travel_diaries`, `reservations`, `reviews`, `explorer_passport_stamps`.
- **Gobierno:** `audit_logs`, `verification_requests`, `official_super_admins`, `backup_operations`, `storage_backups`, `ops_backup_entities`, `traffic_sessions`.
- **IA:** `knowledge_documents` (pgvector), `knowledge_candidates`, `ai_sessions`, `ai_messages`, `baqui_trip_memory`, `baqui_knowledge_gaps`, `baqui_feedback`.
- **i18n:** `content_translations`.

✅ Buen punto de partida: `firebase_uid` como vínculo, estados `status = 'published'`, PostGIS y pgvector.

### 2. Deriva entre migraciones y producción (P1)

| Evidencia | Interpretación |
| --- | --- |
| `content_translations` → **404** en producción | La migración `20261001090000_content_translations.sql` no se aplicó. |
| `profiles` → **401** (la migración 002 permite `SELECT` público) | Los permisos se cambiaron fuera de migraciones (panel/SQL manual). |
| Migraciones mezclan prefijos `001…013` con timestamps `2026…` | El historial de `supabase_migrations.schema_migrations` probablemente no coincide. |

**Acción:** `supabase db pull` / `supabase migration list` para reconciliar antes de cualquier cambio de esquema. No aplicar migraciones nuevas sobre una base con historial desconocido.

### 3. Datos reales (P1)

| Tabla | Filas | Esperado |
| --- | --- | --- |
| departments | 17 | 17 ✅ |
| destinations | 7 | Cientos (catálogo web) |
| municipalities | 0 | 153 |
| places / emergencies / tourism_services / knowledge_documents | 0 | — |

El contenido turístico real vive en `website/js/territories-data.js`, `madriz-experience.js`, `chinandega-experience.js`, `website-business-catalog.js`, `assets/data/*.json`, Firestore y código Dart. Detalle completo en [DATA_SOURCE_MAP.md](DATA_SOURCE_MAP.md).

### 4. Identidad Firebase ↔ Supabase (P1)

- Las políticas comparan `firebase_uid = auth.uid()::text`. `auth.uid()` convierte el claim `sub` a `uuid`; un UID de Firebase (28 caracteres alfanuméricos) **provoca error de conversión**.
- No hay integración *Third-Party Auth (Firebase)* configurada en `supabase/config.toml`.
- El cliente web se crea sin `accessToken` de Firebase.
- **Conclusión:** hoy ninguna operación de usuario autenticado puede pasar RLS en Supabase. Por eso Android y la web siguen usando Firestore.

Diseño propuesto (a implementar en Sprint 2, P1):

```sql
-- Helper estable: devuelve el UID de Firebase del JWT verificado por Supabase.
create or replace function public.firebase_uid() returns text
language sql stable as $$ select nullif(auth.jwt() ->> 'sub', '') $$;
-- Política tipo:
-- using (user_uid = public.firebase_uid())
```

Cliente web: `createClient(url, key, { accessToken: async () => await firebase.auth().currentUser?.getIdToken() ?? null })`.

### 5. Modelo de traducciones

`content_translations` (tabla genérica entidad/campo/idioma) es correcta para contenido editorial dinámico y permite fallback `ko→en→es`. Recomendación: mantenerla (no JSONB por columna) porque permite estado de revisión por idioma, trazabilidad y consultas por idioma faltante. Falta aplicarla en producción y añadir `ko`, `zh`, `ru` a su `CHECK` si lo restringe.

### 6. Trazabilidad y CRUD no destructivo

- Varias tablas ya tienen `deleted_at` (soft delete) ✅.
- Faltan de forma homogénea `created_by`, `updated_by`, `verified_by`, `published_by`, `verified_at`, `published_at` y el estado `DRAFT → PENDING → IN_REVIEW → VERIFIED → PUBLISHED → ARCHIVED`.
- `audit_logs` existe pero está abierta (SEC-P0-02).

### 7. Firestore (operativo hoy)

Colecciones activas: `users`, `destinations`, `businesses`, `tourism_services`, `tourismPlaces`, `reviews`, `travelPlans`, `multimedia`, `reservation_requests`, `reservations`, `conversations`, `app_config`, `android_releases`. Las reglas son correctas (deny-by-default). **No migrar transacciones (reservas, pagos) sin conciliación**.

### 8. Entregable Hackathon pendiente

No existe diagrama ER. Generar `docs/DATABASE_ER.md` con Mermaid `erDiagram` a partir del esquema reconciliado.
