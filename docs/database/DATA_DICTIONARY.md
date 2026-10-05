<!--
🎯 POR QUÉ: documentar cada tabla y columna que EXISTE en producción, no las que se planearon.
⚙️ CÓMO: generado por tools/db/gen-data-dictionary.mjs desde la instantánea del catálogo de Supabase. No editar a mano: regenerar.
📦 QUÉ: dominios, propósito de cada tabla, columnas, tipos, nulabilidad, claves, relaciones y valores por defecto.
-->
# Diccionario de datos — BAQUEANO (Supabase/PostgreSQL)

> Generado desde el catálogo real del proyecto `heiudfpthqwtjrtluqlm` · instantánea **2026-10-05** · 66 tablas en `public`, todas con RLS.
> Regenerar: `node tools/db/gen-data-dictionary.mjs > docs/database/DATA_DICTIONARY.md`.

**Convenciones:** `NN` = NOT NULL · `PK` = clave primaria · `UQ` = participa en restricción única · `FK → t` = clave foránea. Columnas comunes de trazabilidad (`source_name`, `source_url`, `source_type`, `retrieved_at`, `verified_at`, `verified_by`, `valid_until`, `verification_status`) significan: origen del dato, cuándo se obtuvo, quién y cuándo lo verificó y hasta cuándo es válido. `verification_status` por defecto es `unverified`: nada se presenta como verificado sin evidencia.

## Índice por dominio

| Dominio | Tablas |
|---|---|
| Identidad, roles y permisos | `profiles`, `identity_links`, `roles`, `permissions`, `role_permissions`, `user_roles`, `staff_roles`, `official_super_admins` |
| Territorio | `departments`, `municipalities` |
| Catálogo turístico | `destinations`, `places`, `experiences`, `routes`, `route_stops`, `day_passes`, `tourism_services`, `events` |
| Negocios | `businesses`, `business_members`, `verification_requests` |
| Cultura y patrimonio | `culture`, `heritage`, `museums`, `festivals`, `gastronomy`, `crafts`, `legends`, `music`, `historical_figures`, `communities` |
| Seguridad y emergencias | `emergencies`, `sos_events` |
| Viajero | `favorites`, `reservations`, `reviews`, `travel_plans`, `travel_diaries`, `explorer_passport_stamps` |
| Comunidad (testimonios) | `testimonials`, `testimonial_media`, `testimonial_comments`, `testimonial_reactions`, `testimonial_reports` |
| BAQUI (IA) y conocimiento | `ai_sessions`, `ai_messages`, `rag_sources`, `ai_message_sources`, `knowledge_documents`, `knowledge_candidates`, `baqui_knowledge_gaps`, `baqui_trip_memory`, `baqui_feedback`, `content_translations` |
| Analítica SMART | `analytics_event_types`, `analytics_events`, `commercial_actions`, `campaign_attribution`, `user_feedback`, `traffic_sessions` |
| Auditoría, respaldo y operación | `audit_logs`, `firestore_mirror`, `backup_operations`, `storage_backups`, `ops_backup_entities`, `sprint_evidence_records` |

## Identidad, roles y permisos

### `profiles`

Perfil de cada persona (viajero, anfitrión, staff). `id` = auth.users; `firebase_uid` enlaza la identidad heredada.

Columnas: 26 · PK: `id` · Relaciones: `auth.users`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK · FK → auth.users | `gen_random_uuid()` |
| `firebase_uid` | text |  | UQ |  |
| `display_name` | text |  |  |  |
| `email` | text |  |  |  |
| `avatar_url` | text |  |  |  |
| `role` | text |  |  | `'traveler'::text` |
| `phone` | text |  |  |  |
| `explorer_level` | integer |  |  | `1` |
| `xp` | integer |  |  | `0` |
| `metadata` | jsonb |  |  | `'{}'::jsonb` |
| `created_at` | timestamptz |  |  | `now()` |
| `updated_at` | timestamptz |  |  | `now()` |
| `deleted_at` | timestamptz |  |  |  |
| `first_name` | text |  |  |  |
| `last_name` | text |  |  |  |
| `country` | text |  |  |  |
| `city` | text |  |  |  |
| `preferred_language` | text | ✔ |  | `'es'::text` |
| `provider` | text |  |  |  |
| `status` | text | ✔ |  | `'active'::text` |
| `profile_verified` | boolean | ✔ |  | `false` |
| `last_seen_at` | timestamptz |  |  |  |
| `status_reason` | text |  |  |  |
| `status_changed_by` | uuid |  |  |  |
| `status_changed_at` | timestamptz |  |  |  |
| `suspended_until` | timestamptz |  |  |  |

### `identity_links`

Vincula una identidad externa (proveedor + uid heredado de Firebase) con un perfil. Base de la migración Firebase → Supabase.

Columnas: 5 · PK: `provider`, `legacy_uid` · Relaciones: `profiles`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `provider` | text | ✔ | PK · UQ |  |
| `legacy_uid` | text | ✔ | PK |  |
| `profile_id` | uuid | ✔ | UQ · FK → profiles |  |
| `email` | text |  |  |  |
| `linked_at` | timestamptz | ✔ |  | `now()` |

### `roles`

Catálogo de roles RBAC con rango (traveler, business_owner, auditor, admin, superadmin…).

Columnas: 6 · PK: `id`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | text | ✔ | PK |  |
| `name` | text | ✔ |  |  |
| `description` | text | ✔ |  |  |
| `rank` | integer | ✔ |  |  |
| `is_staff` | boolean | ✔ |  | `false` |
| `created_at` | timestamptz | ✔ |  | `now()` |

### `permissions`

Catálogo de permisos atómicos; `critical` marca los que exigen doble control.

Columnas: 3 · PK: `id`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | text | ✔ | PK |  |
| `description` | text | ✔ |  |  |
| `critical` | boolean | ✔ |  | `false` |

### `role_permissions`

Relación N:M rol ↔ permiso.

Columnas: 2 · PK: `role_id`, `permission_id` · Relaciones: `roles`, `permissions`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `role_id` | text | ✔ | PK · FK → roles |  |
| `permission_id` | text | ✔ | PK · FK → permissions |  |

### `user_roles`

Roles asignados a un perfil; `granted_by` y `reason` dejan rastro. Nadie puede autoasignarse staff.

Columnas: 5 · PK: `user_id`, `role_id` · Relaciones: `profiles`, `roles`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `user_id` | uuid | ✔ | PK · FK → profiles |  |
| `role_id` | text | ✔ | PK · FK → roles |  |
| `granted_by` | uuid |  | FK → profiles |  |
| `reason` | text |  |  |  |
| `created_at` | timestamptz | ✔ |  | `now()` |

### `staff_roles`

Roles de staff por correo (puente con el Ops Center heredado mientras se migra a `user_roles`).

Columnas: 7 · PK: `email`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `email` | text | ✔ | PK |  |
| `role` | text | ✔ |  |  |
| `is_active` | boolean | ✔ |  | `true` |
| `granted_by` | text |  |  |  |
| `note` | text |  |  |  |
| `created_at` | timestamptz | ✔ |  | `now()` |
| `updated_at` | timestamptz | ✔ |  | `now()` |

### `official_super_admins`

Lista cerrada de superadministradores oficiales; solo escritura de servidor.

Columnas: 6 · PK: `email`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `email` | text | ✔ | PK |  |
| `role` | text | ✔ |  | `'super_admin'::text` |
| `is_active` | boolean | ✔ |  | `true` |
| `granted_reason` | text | ✔ |  |  |
| `created_at` | timestamptz | ✔ |  | `now()` |
| `updated_at` | timestamptz | ✔ |  | `now()` |

## Territorio

### `departments`

15 departamentos + 2 regiones autónomas (17 territorios).

Columnas: 6 · PK: `id`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | text | ✔ | PK |  |
| `name` | text | ✔ |  |  |
| `capital` | text |  |  |  |
| `short_desc` | text |  |  |  |
| `banner_image` | text |  |  |  |
| `created_at` | timestamptz |  |  | `now()` |

### `municipalities`

153 municipios con FK a departamento; `location_precision` declara si la coordenada es real, aproximada o falta.

Columnas: 11 · PK: `id` · Relaciones: `departments`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | text | ✔ | PK |  |
| `department_id` | text | ✔ | UQ · FK → departments |  |
| `name` | text | ✔ | UQ |  |
| `created_at` | timestamptz |  |  | `now()` |
| `latitude` | double precision |  |  |  |
| `longitude` | double precision |  |  |  |
| `location_precision` | text | ✔ |  | `'missing'::text` |
| `source_name` | text |  |  |  |
| `source_url` | text |  |  |  |
| `geom` | geography(Point,4326) |  |  |  |
| `updated_at` | timestamptz | ✔ |  | `now()` |

## Catálogo turístico

### `destinations`

Destinos publicables; trazabilidad (`source_*`, `verification_status`, `valid_until`) y FK a territorio.

Columnas: 36 · PK: `id` · Relaciones: `departments`, `municipalities`, `profiles`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | text | ✔ | PK |  |
| `department_id` | text |  | FK → departments |  |
| `name` | text | ✔ |  |  |
| `category` | text |  |  |  |
| `short_desc` | text |  |  |  |
| `description` | text |  |  |  |
| `latitude` | double precision |  |  |  |
| `longitude` | double precision |  |  |  |
| `cover_image` | text |  |  |  |
| `rating` | numeric(3,2) |  |  |  |
| `reviews_count` | integer |  |  | `0` |
| `verified` | boolean |  |  | `false` |
| `status` | text |  |  | `'published'::text` |
| `metadata` | jsonb |  |  | `'{}'::jsonb` |
| `created_at` | timestamptz |  |  | `now()` |
| `updated_at` | timestamptz |  |  | `now()` |
| `deleted_at` | timestamptz |  |  |  |
| `geom` | geometry(Point,4326) |  |  |  |
| `source_name` | text |  |  |  |
| `source_url` | text |  |  |  |
| `confidence_status` | text | ✔ |  | `'pending'::text` |
| `last_verified_at` | timestamptz |  |  |  |
| `verification_notes` | text |  |  |  |
| `hidden_gem` | boolean |  |  | `false` |
| `vibe_tags` | text[] |  |  | `'{}'::text[]` |
| `best_season` | text |  |  |  |
| `how_to_reach` | text |  |  |  |
| `audio_ambient_url` | text |  |  |  |
| `audio_narration_url` | text |  |  |  |
| `municipality_id` | text |  | FK → municipalities |  |
| `source_type` | text |  |  |  |
| `retrieved_at` | timestamptz |  |  |  |
| `verified_at` | timestamptz |  |  |  |
| `verified_by` | uuid |  | FK → profiles |  |
| `valid_until` | date |  |  |  |
| `verification_status` | text | ✔ |  | `'unverified'::text` |

### `places`

Lugares concretos dentro de un destino.

Columnas: 23 · PK: `id` · Relaciones: `destinations`, `profiles`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | text | ✔ | PK |  |
| `destination_id` | text |  | FK → destinations |  |
| `name` | text | ✔ |  |  |
| `category` | text |  |  |  |
| `description` | text |  |  |  |
| `latitude` | double precision |  |  |  |
| `longitude` | double precision |  |  |  |
| `avg_price_usd` | numeric(10,2) |  |  |  |
| `difficulty` | text |  |  |  |
| `created_at` | timestamptz |  |  | `now()` |
| `updated_at` | timestamptz |  |  | `now()` |
| `geom` | geometry(Point,4326) |  |  |  |
| `source_name` | text |  |  |  |
| `source_url` | text |  |  |  |
| `last_verified_at` | timestamptz |  |  |  |
| `hidden_gem` | boolean |  |  | `false` |
| `vibe_tags` | text[] |  |  | `'{}'::text[]` |
| `source_type` | text |  |  |  |
| `retrieved_at` | timestamptz |  |  |  |
| `verified_at` | timestamptz |  |  |  |
| `verified_by` | uuid |  | FK → profiles |  |
| `valid_until` | date |  |  |  |
| `verification_status` | text | ✔ |  | `'unverified'::text` |

### `experiences`

Experiencias ofrecidas por un negocio o comunidad (precio, duración, requisitos, no incluido).

Columnas: 37 · PK: `id` · Relaciones: `destinations`, `businesses`, `departments`, `municipalities`, `profiles`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | text | ✔ | PK |  |
| `destination_id` | text |  | FK → destinations |  |
| `business_id` | text |  | FK → businesses |  |
| `department_id` | text |  | FK → departments |  |
| `title` | text | ✔ |  |  |
| `category` | text | ✔ |  |  |
| `sensory_type` | text |  |  |  |
| `duration_hours` | numeric(4,1) |  |  | `2.0` |
| `price_nio` | numeric(10,2) |  |  |  |
| `price_usd` | numeric(10,2) |  |  |  |
| `group_size_max` | integer |  |  | `12` |
| `included` | text[] |  |  |  |
| `host_name` | text |  |  |  |
| `host_bio` | text |  |  |  |
| `difficulty` | text |  |  |  |
| `latitude` | double precision |  |  |  |
| `longitude` | double precision |  |  |  |
| `geom` | geography(Point,4326) |  |  |  |
| `cover_image` | text |  |  |  |
| `verified` | boolean |  |  | `true` |
| `hidden_gem` | boolean |  |  | `false` |
| `status` | text |  |  | `'published'::text` |
| `created_at` | timestamptz |  |  | `now()` |
| `updated_at` | timestamptz |  |  | `now()` |
| `municipality_id` | text |  | FK → municipalities |  |
| `source_name` | text |  |  |  |
| `source_url` | text |  |  |  |
| `source_type` | text |  |  |  |
| `retrieved_at` | timestamptz |  |  |  |
| `verified_at` | timestamptz |  |  |  |
| `verified_by` | uuid |  | FK → profiles |  |
| `valid_until` | date |  |  |  |
| `verification_status` | text | ✔ |  | `'unverified'::text` |
| `sustainability_attributes` | jsonb | ✔ |  | `'{}'::jsonb` |
| `description` | text |  |  |  |
| `requirements` | text |  |  |  |
| `not_included` | text[] |  |  |  |

### `routes`

Rutas de varios días/territorios.

Columnas: 29 · PK: `id` · Relaciones: `profiles`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | text | ✔ | PK |  |
| `title` | text | ✔ |  |  |
| `slug` | text | ✔ | UQ |  |
| `tagline` | text |  |  |  |
| `department_ids` | text[] |  |  |  |
| `category` | text | ✔ |  |  |
| `theme` | text |  |  |  |
| `duration_days` | integer |  |  | `1` |
| `difficulty` | text |  |  |  |
| `budget_tier` | text |  |  |  |
| `estimated_cost_nio` | numeric(10,2) |  |  |  |
| `estimated_cost_usd` | numeric(10,2) |  |  |  |
| `transport_mode` | text |  |  |  |
| `cover_image` | text |  |  |  |
| `map_geojson` | jsonb |  |  | `'{}'::jsonb` |
| `hidden_gem` | boolean |  |  | `false` |
| `verified` | boolean |  |  | `true` |
| `status` | text |  |  | `'published'::text` |
| `created_at` | timestamptz |  |  | `now()` |
| `updated_at` | timestamptz |  |  | `now()` |
| `source_name` | text |  |  |  |
| `source_url` | text |  |  |  |
| `source_type` | text |  |  |  |
| `retrieved_at` | timestamptz |  |  |  |
| `verified_at` | timestamptz |  |  |  |
| `verified_by` | uuid |  | FK → profiles |  |
| `valid_until` | date |  |  |  |
| `verification_status` | text | ✔ |  | `'unverified'::text` |
| `sustainability_attributes` | jsonb | ✔ |  | `'{}'::jsonb` |

### `route_stops`

Paradas ordenadas de una ruta (día, duración, coordenada).

Columnas: 13 · PK: `id` · Relaciones: `routes`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `route_id` | text | ✔ | FK → routes |  |
| `stop_order` | integer | ✔ |  |  |
| `entity_type` | text |  |  |  |
| `entity_id` | text |  |  |  |
| `title` | text | ✔ |  |  |
| `day_number` | integer |  |  | `1` |
| `duration_minutes` | integer |  |  | `60` |
| `notes` | text |  |  |  |
| `latitude` | double precision |  |  |  |
| `longitude` | double precision |  |  |  |
| `geom` | geography(Point,4326) |  |  |  |
| `created_at` | timestamptz |  |  | `now()` |

### `day_passes`

Pases de día de un negocio (precio adulto/niño, restricciones, reserva).

Columnas: 25 · PK: `id` · Relaciones: `businesses`, `profiles`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `business_id` | text | ✔ | FK → businesses |  |
| `title` | text | ✔ |  |  |
| `price_adult_nio` | numeric(10,2) |  |  |  |
| `price_child_nio` | numeric(10,2) |  |  |  |
| `price_usd` | numeric(10,2) |  |  |  |
| `schedule_hours` | text |  |  |  |
| `amenities` | text[] |  |  |  |
| `pool_access` | boolean |  |  | `false` |
| `food_credit_included` | boolean |  |  | `false` |
| `requires_reservation` | boolean |  |  | `true` |
| `status` | text |  |  | `'published'::text` |
| `created_at` | timestamptz |  |  | `now()` |
| `updated_at` | timestamptz |  |  | `now()` |
| `source_name` | text |  |  |  |
| `source_url` | text |  |  |  |
| `source_type` | text |  |  |  |
| `retrieved_at` | timestamptz |  |  |  |
| `verified_at` | timestamptz |  |  |  |
| `verified_by` | uuid |  | FK → profiles |  |
| `valid_until` | date |  |  |  |
| `verification_status` | text | ✔ |  | `'unverified'::text` |
| `sustainability_attributes` | jsonb | ✔ |  | `'{}'::jsonb` |
| `restrictions` | text |  |  |  |
| `contact_phone` | text |  |  |  |

### `tourism_services`

Servicios con precio y fuente obligatoria (`source_name`); nunca precio sin origen.

Columnas: 22 · PK: `id` · Relaciones: `destinations`, `businesses`, `profiles`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `destination_id` | text |  | FK → destinations |  |
| `business_id` | text |  | FK → businesses |  |
| `title` | text | ✔ |  |  |
| `service_type` | text | ✔ |  |  |
| `price_kind` | text | ✔ |  |  |
| `price_min` | numeric(12,2) |  |  |  |
| `price_max` | numeric(12,2) |  |  |  |
| `currency` | text | ✔ |  | `'NIO'::text` |
| `price_unit` | text |  |  |  |
| `source_name` | text | ✔ |  |  |
| `source_url` | text |  |  |  |
| `verified_at` | timestamptz |  |  |  |
| `valid_until` | date |  |  |  |
| `status` | text | ✔ |  | `'pending'::text` |
| `created_at` | timestamptz | ✔ |  | `now()` |
| `updated_at` | timestamptz | ✔ |  | `now()` |
| `source_type` | text |  |  |  |
| `retrieved_at` | timestamptz |  |  |  |
| `verified_by` | uuid |  | FK → profiles |  |
| `verification_status` | text | ✔ |  | `'unverified'::text` |
| `sustainability_attributes` | jsonb | ✔ |  | `'{}'::jsonb` |

### `events`

Eventos con fecha, lugar y costo.

Columnas: 29 · PK: `id` · Relaciones: `departments`, `municipalities`, `profiles`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | text | ✔ | PK |  |
| `department_id` | text |  | FK → departments |  |
| `municipality_id` | text |  | FK → municipalities |  |
| `title` | text | ✔ |  |  |
| `category` | text | ✔ |  |  |
| `start_date` | date | ✔ |  |  |
| `end_date` | date |  |  |  |
| `schedule_time` | text |  |  |  |
| `location_name` | text | ✔ |  |  |
| `address` | text |  |  |  |
| `latitude` | double precision |  |  |  |
| `longitude` | double precision |  |  |  |
| `geom` | geography(Point,4326) |  |  |  |
| `is_free` | boolean |  |  | `true` |
| `admission_nio` | numeric(10,2) |  |  | `0.00` |
| `organizer_name` | text |  |  |  |
| `contact_info` | text |  |  |  |
| `cover_image` | text |  |  |  |
| `status` | text |  |  | `'published'::text` |
| `created_at` | timestamptz |  |  | `now()` |
| `updated_at` | timestamptz |  |  | `now()` |
| `source_name` | text |  |  |  |
| `source_url` | text |  |  |  |
| `source_type` | text |  |  |  |
| `retrieved_at` | timestamptz |  |  |  |
| `verified_at` | timestamptz |  |  |  |
| `verified_by` | uuid |  | FK → profiles |  |
| `valid_until` | date |  |  |  |
| `verification_status` | text | ✔ |  | `'unverified'::text` |

## Negocios

### `businesses`

Negocios/anfitriones; `status`, `verification_status` y FK a departamento y municipio. Completitud en `v_business_profile_completion`.

Columnas: 40 · PK: `id` · Relaciones: `departments`, `municipalities`, `profiles`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | text | ✔ | PK |  |
| `owner_uid` | text |  |  |  |
| `name` | text | ✔ |  |  |
| `category` | text |  |  |  |
| `department` | text |  |  |  |
| `municipality` | text |  |  |  |
| `phone` | text |  |  |  |
| `whatsapp` | text |  |  |  |
| `address` | text |  |  |  |
| `latitude` | double precision |  |  |  |
| `longitude` | double precision |  |  |  |
| `cover_image` | text |  |  |  |
| `verified` | boolean |  |  | `true` |
| `commission_rate` | numeric(4,2) |  |  | `0.00` |
| `metadata` | jsonb |  |  | `'{}'::jsonb` |
| `created_at` | timestamptz |  |  | `now()` |
| `updated_at` | timestamptz |  |  | `now()` |
| `deleted_at` | timestamptz |  |  |  |
| `geom` | geometry(Point,4326) |  |  |  |
| `hidden_gem` | boolean |  |  | `false` |
| `host_name` | text |  |  |  |
| `host_story` | text |  |  |  |
| `ethical_badge` | boolean |  |  | `true` |
| `day_pass_available` | boolean |  |  | `false` |
| `department_id` | text |  | FK → departments |  |
| `municipality_id` | text |  | FK → municipalities |  |
| `source_name` | text |  |  |  |
| `source_url` | text |  |  |  |
| `source_type` | text |  |  |  |
| `retrieved_at` | timestamptz |  |  |  |
| `verified_at` | timestamptz |  |  |  |
| `valid_until` | date |  |  |  |
| `verification_status` | text | ✔ |  | `'unverified'::text` |
| `verified_by` | uuid |  | FK → profiles |  |
| `status` | text | ✔ |  | `'draft'::text` |
| `sustainability_attributes` | jsonb | ✔ |  | `'{}'::jsonb` |
| `description` | text |  |  |  |
| `email` | text |  |  |  |
| `website_url` | text |  |  |  |
| `opening_hours` | jsonb |  |  |  |

### `business_members`

Personas que administran un negocio (owner/manager) con estado.

Columnas: 6 · PK: `business_id`, `user_id` · Relaciones: `businesses`, `profiles`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `business_id` | text | ✔ | PK · FK → businesses |  |
| `user_id` | uuid | ✔ | PK · FK → profiles |  |
| `member_role` | text | ✔ |  | `'owner'::text` |
| `status` | text | ✔ |  | `'active'::text` |
| `added_by` | uuid |  | FK → profiles |  |
| `created_at` | timestamptz | ✔ |  | `now()` |

### `verification_requests`

Solicitudes de verificación revisadas por staff (decisión, notas y revisor).

Columnas: 18 · PK: `id` · Relaciones: `profiles`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `entity_type` | text | ✔ |  |  |
| `entity_id` | text | ✔ |  |  |
| `applicant_uid` | text | ✔ |  |  |
| `applicant_name` | text | ✔ |  |  |
| `applicant_phone` | text | ✔ |  |  |
| `documents_payload` | jsonb |  |  | `'{}'::jsonb` |
| `status` | text |  |  | `'pending'::text` |
| `admin_notes` | text |  |  |  |
| `reviewed_by` | text |  |  |  |
| `reviewed_at` | timestamptz |  |  |  |
| `created_at` | timestamptz |  |  | `now()` |
| `applicant_id` | uuid |  | FK → profiles |  |
| `request_type` | text |  |  |  |
| `reviewer_id` | uuid |  | FK → profiles |  |
| `decision_notes` | text |  |  |  |
| `decided_at` | timestamptz |  |  |  |
| `updated_at` | timestamptz | ✔ |  | `now()` |

## Cultura y patrimonio

### `culture`

Contenido cultural general por territorio.

Columnas: 22 · PK: `id` · Relaciones: `departments`, `municipalities`, `profiles`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | text | ✔ | PK |  |
| `department_id` | text |  | FK → departments |  |
| `municipality_id` | text |  | FK → municipalities |  |
| `title` | text | ✔ |  |  |
| `category` | text | ✔ |  |  |
| `short_desc` | text |  |  |  |
| `content` | text | ✔ |  |  |
| `image_url` | text |  |  |  |
| `audio_url` | text |  |  |  |
| `source_name` | text |  |  |  |
| `source_url` | text |  |  |  |
| `verified` | boolean |  |  | `true` |
| `hidden_gem` | boolean |  |  | `false` |
| `status` | text |  |  | `'published'::text` |
| `created_at` | timestamptz |  |  | `now()` |
| `updated_at` | timestamptz |  |  | `now()` |
| `source_type` | text |  |  |  |
| `retrieved_at` | timestamptz |  |  |  |
| `verified_at` | timestamptz |  |  |  |
| `verified_by` | uuid |  | FK → profiles |  |
| `valid_until` | date |  |  |  |
| `verification_status` | text | ✔ |  | `'unverified'::text` |

### `heritage`

Patrimonio material (tipo, período, estatus UNESCO, decreto).

Columnas: 26 · PK: `id` · Relaciones: `departments`, `municipalities`, `profiles`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | text | ✔ | PK |  |
| `department_id` | text |  | FK → departments |  |
| `municipality_id` | text |  | FK → municipalities |  |
| `name` | text | ✔ |  |  |
| `heritage_type` | text | ✔ |  |  |
| `period` | text |  |  |  |
| `description` | text | ✔ |  |  |
| `latitude` | double precision |  |  |  |
| `longitude` | double precision |  |  |  |
| `geom` | geography(Point,4326) |  |  |  |
| `image_url` | text |  |  |  |
| `audio_url` | text |  |  |  |
| `unesco_status` | text |  |  |  |
| `legal_decree` | text |  |  |  |
| `status` | text |  |  | `'published'::text` |
| `hidden_gem` | boolean |  |  | `false` |
| `created_at` | timestamptz |  |  | `now()` |
| `updated_at` | timestamptz |  |  | `now()` |
| `source_name` | text |  |  |  |
| `source_url` | text |  |  |  |
| `source_type` | text |  |  |  |
| `retrieved_at` | timestamptz |  |  |  |
| `verified_at` | timestamptz |  |  |  |
| `verified_by` | uuid |  | FK → profiles |  |
| `valid_until` | date |  |  |  |
| `verification_status` | text | ✔ |  | `'unverified'::text` |

### `museums`

Museos con horario y tarifas.

Columnas: 29 · PK: `id` · Relaciones: `departments`, `municipalities`, `profiles`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | text | ✔ | PK |  |
| `department_id` | text |  | FK → departments |  |
| `municipality_id` | text |  | FK → municipalities |  |
| `name` | text | ✔ |  |  |
| `focus_area` | text | ✔ |  |  |
| `description` | text | ✔ |  |  |
| `address` | text |  |  |  |
| `latitude` | double precision |  |  |  |
| `longitude` | double precision |  |  |  |
| `geom` | geography(Point,4326) |  |  |  |
| `schedule` | text |  |  |  |
| `admission_nio` | numeric(10,2) |  |  | `0.00` |
| `admission_usd` | numeric(10,2) |  |  | `0.00` |
| `is_free` | boolean |  |  | `false` |
| `contact_phone` | text |  |  |  |
| `website_url` | text |  |  |  |
| `image_url` | text |  |  |  |
| `status` | text |  |  | `'published'::text` |
| `hidden_gem` | boolean |  |  | `false` |
| `created_at` | timestamptz |  |  | `now()` |
| `updated_at` | timestamptz |  |  | `now()` |
| `source_name` | text |  |  |  |
| `source_url` | text |  |  |  |
| `source_type` | text |  |  |  |
| `retrieved_at` | timestamptz |  |  |  |
| `verified_at` | timestamptz |  |  |  |
| `verified_by` | uuid |  | FK → profiles |  |
| `valid_until` | date |  |  |  |
| `verification_status` | text | ✔ |  | `'unverified'::text` |

### `festivals`

Fiestas patronales y tradiciones por mes.

Columnas: 23 · PK: `id` · Relaciones: `departments`, `municipalities`, `profiles`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | text | ✔ | PK |  |
| `department_id` | text |  | FK → departments |  |
| `municipality_id` | text |  | FK → municipalities |  |
| `name` | text | ✔ |  |  |
| `patron_saint_or_theme` | text | ✔ |  |  |
| `celebration_month` | integer | ✔ |  |  |
| `start_day` | integer |  |  |  |
| `end_day` | integer |  |  |  |
| `traditions_description` | text | ✔ |  |  |
| `culinary_traditions` | text |  |  |  |
| `dance_music` | text |  |  |  |
| `image_url` | text |  |  |  |
| `status` | text |  |  | `'published'::text` |
| `created_at` | timestamptz |  |  | `now()` |
| `updated_at` | timestamptz |  |  | `now()` |
| `source_name` | text |  |  |  |
| `source_url` | text |  |  |  |
| `source_type` | text |  |  |  |
| `retrieved_at` | timestamptz |  |  |  |
| `verified_at` | timestamptz |  |  |  |
| `verified_by` | uuid |  | FK → profiles |  |
| `valid_until` | date |  |  |  |
| `verification_status` | text | ✔ |  | `'unverified'::text` |

### `gastronomy`

Platos típicos, ingredientes y técnicas.

Columnas: 25 · PK: `id` · Relaciones: `departments`, `municipalities`, `profiles`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | text | ✔ | PK |  |
| `department_id` | text |  | FK → departments |  |
| `municipality_id` | text |  | FK → municipalities |  |
| `dish_name` | text | ✔ |  |  |
| `category` | text | ✔ |  |  |
| `origin_history` | text |  |  |  |
| `ingredients` | text[] |  |  |  |
| `ancestral_technique` | text |  |  |  |
| `best_places` | text |  |  |  |
| `average_price_nio` | numeric(10,2) |  |  |  |
| `average_price_usd` | numeric(10,2) |  |  |  |
| `image_url` | text |  |  |  |
| `audio_url` | text |  |  |  |
| `status` | text |  |  | `'published'::text` |
| `hidden_gem` | boolean |  |  | `false` |
| `created_at` | timestamptz |  |  | `now()` |
| `updated_at` | timestamptz |  |  | `now()` |
| `source_name` | text |  |  |  |
| `source_url` | text |  |  |  |
| `source_type` | text |  |  |  |
| `retrieved_at` | timestamptz |  |  |  |
| `verified_at` | timestamptz |  |  |  |
| `verified_by` | uuid |  | FK → profiles |  |
| `valid_until` | date |  |  |  |
| `verification_status` | text | ✔ |  | `'unverified'::text` |

### `crafts`

Artesanías y cooperativas artesanas.

Columnas: 27 · PK: `id` · Relaciones: `departments`, `municipalities`, `profiles`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | text | ✔ | PK |  |
| `department_id` | text |  | FK → departments |  |
| `municipality_id` | text |  | FK → municipalities |  |
| `craft_name` | text | ✔ |  |  |
| `material` | text | ✔ |  |  |
| `ancestral_community` | text |  |  |  |
| `artisan_coop_name` | text |  |  |  |
| `contact_phone` | text |  |  |  |
| `workshop_address` | text |  |  |  |
| `latitude` | double precision |  |  |  |
| `longitude` | double precision |  |  |  |
| `geom` | geography(Point,4326) |  |  |  |
| `description` | text | ✔ |  |  |
| `price_range_nio` | text |  |  |  |
| `image_url` | text |  |  |  |
| `status` | text |  |  | `'published'::text` |
| `hidden_gem` | boolean |  |  | `false` |
| `created_at` | timestamptz |  |  | `now()` |
| `updated_at` | timestamptz |  |  | `now()` |
| `source_name` | text |  |  |  |
| `source_url` | text |  |  |  |
| `source_type` | text |  |  |  |
| `retrieved_at` | timestamptz |  |  |  |
| `verified_at` | timestamptz |  |  |  |
| `verified_by` | uuid |  | FK → profiles |  |
| `valid_until` | date |  |  |  |
| `verification_status` | text | ✔ |  | `'unverified'::text` |

### `legends`

Leyendas y tradición oral.

Columnas: 20 · PK: `id` · Relaciones: `departments`, `municipalities`, `profiles`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | text | ✔ | PK |  |
| `department_id` | text |  | FK → departments |  |
| `municipality_id` | text |  | FK → municipalities |  |
| `title` | text | ✔ |  |  |
| `oral_tradition_summary` | text | ✔ |  |  |
| `full_story` | text | ✔ |  |  |
| `lesson_or_context` | text |  |  |  |
| `image_url` | text |  |  |  |
| `audio_narration_url` | text |  |  |  |
| `status` | text |  |  | `'published'::text` |
| `created_at` | timestamptz |  |  | `now()` |
| `updated_at` | timestamptz |  |  | `now()` |
| `source_name` | text |  |  |  |
| `source_url` | text |  |  |  |
| `source_type` | text |  |  |  |
| `retrieved_at` | timestamptz |  |  |  |
| `verified_at` | timestamptz |  |  |  |
| `verified_by` | uuid |  | FK → profiles |  |
| `valid_until` | date |  |  |  |
| `verification_status` | text | ✔ |  | `'unverified'::text` |

### `music`

Patrimonio musical.

Columnas: 21 · PK: `id` · Relaciones: `departments`, `profiles`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | text | ✔ | PK |  |
| `department_id` | text |  | FK → departments |  |
| `title` | text | ✔ |  |  |
| `artist_composer` | text | ✔ |  |  |
| `genre` | text | ✔ |  |  |
| `era` | text |  |  |  |
| `historical_significance` | text |  |  |  |
| `audio_preview_url` | text |  |  |  |
| `lyrics_excerpt` | text |  |  |  |
| `image_url` | text |  |  |  |
| `status` | text |  |  | `'published'::text` |
| `created_at` | timestamptz |  |  | `now()` |
| `updated_at` | timestamptz |  |  | `now()` |
| `source_name` | text |  |  |  |
| `source_url` | text |  |  |  |
| `source_type` | text |  |  |  |
| `retrieved_at` | timestamptz |  |  |  |
| `verified_at` | timestamptz |  |  |  |
| `verified_by` | uuid |  | FK → profiles |  |
| `valid_until` | date |  |  |  |
| `verification_status` | text | ✔ |  | `'unverified'::text` |

### `historical_figures`

Personajes históricos.

Columnas: 22 · PK: `id` · Relaciones: `departments`, `municipalities`, `profiles`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | text | ✔ | PK |  |
| `department_id` | text |  | FK → departments |  |
| `municipality_id` | text |  | FK → municipalities |  |
| `full_name` | text | ✔ |  |  |
| `role_title` | text | ✔ |  |  |
| `birth_year` | integer |  |  |  |
| `death_year` | integer |  |  |  |
| `biography` | text | ✔ |  |  |
| `legacy_summary` | text |  |  |  |
| `key_locations` | text |  |  |  |
| `image_url` | text |  |  |  |
| `status` | text |  |  | `'published'::text` |
| `created_at` | timestamptz |  |  | `now()` |
| `updated_at` | timestamptz |  |  | `now()` |
| `source_name` | text |  |  |  |
| `source_url` | text |  |  |  |
| `source_type` | text |  |  |  |
| `retrieved_at` | timestamptz |  |  |  |
| `verified_at` | timestamptz |  |  |  |
| `verified_by` | uuid |  | FK → profiles |  |
| `valid_until` | date |  |  |  |
| `verification_status` | text | ✔ |  | `'unverified'::text` |

### `communities`

Comunidades anfitrionas (cooperativas, pueblos originarios).

Columnas: 27 · PK: `id` · Relaciones: `departments`, `municipalities`, `profiles`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | text | ✔ | PK |  |
| `department_id` | text |  | FK → departments |  |
| `municipality_id` | text |  | FK → municipalities |  |
| `name` | text | ✔ |  |  |
| `ethnic_group` | text |  |  |  |
| `host_coop_name` | text |  |  |  |
| `community_leader` | text |  |  |  |
| `contact_phone` | text |  |  |  |
| `whatsapp` | text |  |  |  |
| `experiences_offered` | text[] |  |  |  |
| `visitor_guidelines` | text |  |  |  |
| `latitude` | double precision |  |  |  |
| `longitude` | double precision |  |  |  |
| `geom` | geography(Point,4326) |  |  |  |
| `cover_image` | text |  |  |  |
| `status` | text |  |  | `'published'::text` |
| `hidden_gem` | boolean |  |  | `true` |
| `created_at` | timestamptz |  |  | `now()` |
| `updated_at` | timestamptz |  |  | `now()` |
| `source_name` | text |  |  |  |
| `source_url` | text |  |  |  |
| `source_type` | text |  |  |  |
| `retrieved_at` | timestamptz |  |  |  |
| `verified_at` | timestamptz |  |  |  |
| `verified_by` | uuid |  | FK → profiles |  |
| `valid_until` | date |  |  |  |
| `verification_status` | text | ✔ |  | `'unverified'::text` |

## Seguridad y emergencias

### `emergencies`

Directorio de emergencias por territorio (tipo de servicio validado por CHECK).

Columnas: 25 · PK: `id` · Relaciones: `departments`, `municipalities`, `profiles`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `department_id` | text | ✔ | FK → departments |  |
| `municipality_id` | text |  | FK → municipalities |  |
| `service_type` | text | ✔ |  |  |
| `entity_name` | text | ✔ |  |  |
| `phone_emergency` | text | ✔ |  |  |
| `phone_secondary` | text |  |  |  |
| `address` | text |  |  |  |
| `latitude` | double precision |  |  |  |
| `longitude` | double precision |  |  |  |
| `geom` | geography(Point,4326) |  |  |  |
| `is_24_hours` | boolean |  |  | `true` |
| `notes` | text |  |  |  |
| `verified` | boolean |  |  | `true` |
| `created_at` | timestamptz |  |  | `now()` |
| `source_name` | text |  |  |  |
| `source_url` | text |  |  |  |
| `source_type` | text |  |  |  |
| `retrieved_at` | timestamptz |  |  |  |
| `verified_at` | timestamptz |  |  |  |
| `verified_by` | uuid |  | FK → profiles |  |
| `valid_until` | date |  |  |  |
| `verification_status` | text | ✔ |  | `'unverified'::text` |
| `address_reference` | text |  |  |  |
| `updated_at` | timestamptz | ✔ |  | `now()` |

### `sos_events`

Alertas SOS emitidas desde la app; lectura solo staff.

Columnas: 17 · PK: `id`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `created_at` | timestamptz | ✔ |  | `now()` |
| `updated_at` | timestamptz | ✔ |  | `now()` |
| `reporter_uid` | text | ✔ |  |  |
| `reporter_email` | text |  |  |  |
| `reporter_name` | text |  |  |  |
| `channel` | text | ✔ |  | `'android'::text` |
| `latitude` | double precision |  |  |  |
| `longitude` | double precision |  |  |  |
| `accuracy_m` | double precision |  |  |  |
| `location_status` | text | ✔ |  | `'unavailable'::text` |
| `dialed_service` | text |  |  |  |
| `note` | text |  |  |  |
| `status` | text | ✔ |  | `'open'::text` |
| `handled_by` | text |  |  |  |
| `handled_at` | timestamptz |  |  |  |
| `history` | jsonb | ✔ |  | `'[]'::jsonb` |

## Viajero

### `favorites`

Favoritos de un usuario (único por entidad).

Columnas: 5 · PK: `id`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `user_uid` | text | ✔ | UQ |  |
| `entity_type` | text | ✔ | UQ |  |
| `entity_id` | text | ✔ | UQ |  |
| `created_at` | timestamptz |  |  | `now()` |

### `reservations`

Reservas con código único, historial de estados y canal.

Columnas: 22 · PK: `id` · Relaciones: `businesses`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `reservation_code` | text | ✔ | UQ |  |
| `user_uid` | text | ✔ |  |  |
| `business_id` | text |  | FK → businesses |  |
| `service_title` | text | ✔ |  |  |
| `travel_date` | date | ✔ |  |  |
| `people_count` | integer |  |  | `1` |
| `total_price` | numeric(10,2) |  |  |  |
| `currency` | text |  |  | `'NIO'::text` |
| `status` | text |  |  | `'pending'::text` |
| `notes` | text |  |  |  |
| `version` | integer |  |  | `1` |
| `created_at` | timestamptz |  |  | `now()` |
| `updated_at` | timestamptz |  |  | `now()` |
| `deleted_at` | timestamptz |  |  |  |
| `contact_name` | text |  |  |  |
| `contact_phone` | text |  |  |  |
| `destination_name` | text |  |  |  |
| `channel` | text | ✔ |  | `'android'::text` |
| `history` | jsonb | ✔ |  | `'[]'::jsonb` |
| `handled_by` | text |  |  |  |
| `handled_at` | timestamptz |  |  |  |

### `reviews`

Reseñas con calificación; `verified_visit` indica visita comprobada.

Columnas: 11 · PK: `id` · Relaciones: `businesses`, `destinations`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `user_uid` | text | ✔ |  |  |
| `user_name` | text |  |  |  |
| `user_avatar` | text |  |  |  |
| `business_id` | text |  | FK → businesses |  |
| `destination_id` | text |  | FK → destinations |  |
| `rating` | integer | ✔ |  |  |
| `comment` | text | ✔ |  |  |
| `verified_visit` | boolean |  |  | `false` |
| `status` | text |  |  | `'published'::text` |
| `created_at` | timestamptz |  |  | `now()` |

### `travel_plans`

Planes de viaje generados (determinista o IA).

Columnas: 10 · PK: `id`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `user_uid` | text |  |  |  |
| `plan_title` | text | ✔ |  |  |
| `destination` | text |  |  |  |
| `days` | integer |  |  |  |
| `budget` | numeric(10,2) |  |  |  |
| `currency` | text |  |  | `'USD'::text` |
| `payload` | jsonb | ✔ |  |  |
| `source` | text |  |  | `'deterministic'::text` |
| `created_at` | timestamptz |  |  | `now()` |

### `travel_diaries`

Diarios de viaje personales/públicos.

Columnas: 9 · PK: `id`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `user_uid` | text | ✔ |  |  |
| `title` | text | ✔ |  |  |
| `trip_id` | uuid |  |  |  |
| `is_public` | boolean |  |  | `false` |
| `entries` | jsonb |  |  | `'[]'::jsonb` |
| `cover_image` | text |  |  |  |
| `created_at` | timestamptz |  |  | `now()` |
| `updated_at` | timestamptz |  |  | `now()` |

### `explorer_passport_stamps`

Sellos del pasaporte explorador (único por entidad).

Columnas: 9 · PK: `id`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `user_uid` | text | ✔ | UQ |  |
| `entity_type` | text | ✔ | UQ |  |
| `entity_id` | text | ✔ | UQ |  |
| `entity_name` | text | ✔ |  |  |
| `department_id` | text |  |  |  |
| `stamp_category` | text |  |  | `'territorial'::text` |
| `verified_by_qr` | boolean |  |  | `false` |
| `stamped_at` | timestamptz |  |  | `now()` |

## Comunidad (testimonios)

### `testimonials`

Testimonios moderados (`pending_review` por defecto) con contadores y búsqueda de texto completo.

Columnas: 36 · PK: `id` · Relaciones: `destinations`, `departments`, `businesses`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `author_uid` | text | ✔ |  |  |
| `author_name` | text | ✔ |  |  |
| `author_avatar` | text |  |  |  |
| `title` | text | ✔ |  |  |
| `body` | text | ✔ |  |  |
| `destination_id` | text |  | FK → destinations |  |
| `destination_ref` | text |  |  |  |
| `destination_name` | text |  |  |  |
| `department_id` | text |  | FK → departments |  |
| `municipality` | text |  |  |  |
| `business_id` | text |  | FK → businesses |  |
| `place_name` | text |  |  |  |
| `visit_month` | date |  |  |  |
| `rating` | smallint |  |  |  |
| `experience_type` | text |  |  |  |
| `tags` | text[] | ✔ |  | `'{}'::text[]` |
| `recommendations` | text |  |  |  |
| `tips` | text |  |  |  |
| `status` | text | ✔ |  | `'pending_review'::text` |
| `featured` | boolean | ✔ |  | `false` |
| `verified_visit` | boolean | ✔ |  | `false` |
| `moderation_note` | text |  |  |  |
| `moderated_by` | text |  |  |  |
| `moderated_at` | timestamptz |  |  |  |
| `comments_count` | integer | ✔ |  | `0` |
| `reactions_count` | integer | ✔ |  | `0` |
| `reports_count` | integer | ✔ |  | `0` |
| `media_count` | integer | ✔ |  | `0` |
| `photo_count` | integer | ✔ |  | `0` |
| `video_count` | integer | ✔ |  | `0` |
| `content_hash` | text | ✔ |  |  |
| `search_vector` | tsvector (generada) |  |  |  |
| `published_at` | timestamptz |  |  |  |
| `created_at` | timestamptz | ✔ |  | `now()` |
| `updated_at` | timestamptz | ✔ |  | `now()` |

### `testimonial_media`

Fotos/videos de un testimonio con tamaño y tipo validados.

Columnas: 14 · PK: `id` · Relaciones: `testimonials`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `testimonial_id` | uuid | ✔ | FK → testimonials |  |
| `author_uid` | text | ✔ |  |  |
| `kind` | text | ✔ |  |  |
| `storage_path` | text | ✔ | UQ |  |
| `thumb_path` | text |  |  |  |
| `mime_type` | text | ✔ |  |  |
| `size_bytes` | integer | ✔ |  |  |
| `width` | integer |  |  |  |
| `height` | integer |  |  |  |
| `duration_seconds` | numeric(6,2) |  |  |  |
| `position` | smallint | ✔ |  | `0` |
| `status` | text | ✔ |  | `'ready'::text` |
| `created_at` | timestamptz | ✔ |  | `now()` |

### `testimonial_comments`

Comentarios encadenados (`parent_id`).

Columnas: 13 · PK: `id` · Relaciones: `testimonials`, `testimonial_comments`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `testimonial_id` | uuid | ✔ | FK → testimonials |  |
| `parent_id` | uuid |  | FK → testimonial_comments |  |
| `author_uid` | text | ✔ |  |  |
| `author_name` | text | ✔ |  |  |
| `author_avatar` | text |  |  |  |
| `body` | text | ✔ |  |  |
| `status` | text | ✔ |  | `'published'::text` |
| `edited` | boolean | ✔ |  | `false` |
| `reactions_count` | integer | ✔ |  | `0` |
| `reports_count` | integer | ✔ |  | `0` |
| `created_at` | timestamptz | ✔ |  | `now()` |
| `updated_at` | timestamptz | ✔ |  | `now()` |

### `testimonial_reactions`

Reacciones a testimonios o comentarios.

Columnas: 6 · PK: `id` · Relaciones: `testimonials`, `testimonial_comments`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `testimonial_id` | uuid |  | FK → testimonials |  |
| `comment_id` | uuid |  | FK → testimonial_comments |  |
| `author_uid` | text | ✔ |  |  |
| `kind` | text | ✔ |  | `'like'::text` |
| `created_at` | timestamptz | ✔ |  | `now()` |

### `testimonial_reports`

Reportes de moderación.

Columnas: 10 · PK: `id` · Relaciones: `testimonials`, `testimonial_comments`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `testimonial_id` | uuid |  | FK → testimonials |  |
| `comment_id` | uuid |  | FK → testimonial_comments |  |
| `reporter_uid` | text | ✔ |  |  |
| `reason` | text | ✔ |  |  |
| `details` | text |  |  |  |
| `status` | text | ✔ |  | `'open'::text` |
| `reviewed_by` | text |  |  |  |
| `reviewed_at` | timestamptz |  |  |  |
| `created_at` | timestamptz | ✔ |  | `now()` |

## BAQUI (IA) y conocimiento

### `ai_sessions`

Sesión de conversación con BAQUI (canal, proveedor, modelo, idioma, conteo de mensajes).

Columnas: 16 · PK: `id` · Relaciones: `profiles`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `user_uid` | text |  |  |  |
| `session_key` | text | ✔ | UQ |  |
| `current_module` | text |  |  |  |
| `travel_style` | text |  |  |  |
| `budget_tier` | text |  |  |  |
| `created_at` | timestamptz |  |  | `now()` |
| `updated_at` | timestamptz |  |  | `now()` |
| `user_id` | uuid |  | FK → profiles |  |
| `legacy_uid` | text |  |  |  |
| `language` | text |  |  |  |
| `channel` | text |  |  |  |
| `provider` | text |  |  |  |
| `model` | text |  |  |  |
| `message_count` | integer | ✔ |  | `0` |
| `last_message_at` | timestamptz |  |  |  |

### `ai_messages`

Mensajes de la sesión con tokens, latencia y herramientas usadas; texto minimizado (sin correos/teléfonos).

Columnas: 15 · PK: `id` · Relaciones: `ai_sessions`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `session_id` | uuid |  | FK → ai_sessions |  |
| `role` | text | ✔ |  |  |
| `content` | text | ✔ |  |  |
| `specialized_agent` | text |  |  |  |
| `rag_sources` | jsonb |  |  | `'[]'::jsonb` |
| `tool_calls` | jsonb |  |  | `'[]'::jsonb` |
| `provider_used` | text |  |  |  |
| `tokens_used` | integer |  |  |  |
| `latency_ms` | integer |  |  |  |
| `created_at` | timestamptz |  |  | `now()` |
| `model` | text |  |  |  |
| `tokens_input` | integer |  |  |  |
| `tokens_output` | integer |  |  |  |
| `language` | text |  |  |  |

### `rag_sources`

Fuentes citables por BAQUI con nivel de confianza; BAQUI nunca las verifica.

Columnas: 15 · PK: `id` · Relaciones: `profiles`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `source_type` | text | ✔ |  |  |
| `entity_type` | text |  |  |  |
| `entity_id` | text |  |  |  |
| `title` | text | ✔ |  |  |
| `url` | text |  |  |  |
| `publisher` | text |  |  |  |
| `language` | text |  |  |  |
| `trust_level` | text | ✔ |  | `'unreviewed'::text` |
| `verified` | boolean | ✔ |  | `false` |
| `verified_at` | timestamptz |  |  |  |
| `verified_by` | uuid |  | FK → profiles |  |
| `retrieved_at` | timestamptz |  |  |  |
| `created_at` | timestamptz | ✔ |  | `now()` |
| `updated_at` | timestamptz | ✔ |  | `now()` |

### `ai_message_sources`

Fuentes usadas por cada respuesta (rango y similitud).

Columnas: 4 · PK: `message_id`, `rag_source_id` · Relaciones: `ai_messages`, `rag_sources`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `message_id` | uuid | ✔ | PK · FK → ai_messages |  |
| `rag_source_id` | uuid | ✔ | PK · FK → rag_sources |  |
| `rank` | smallint | ✔ |  | `1` |
| `similarity` | numeric(5,4) |  |  |  |

### `knowledge_documents`

Documentos con embedding (pgvector 768) para recuperación.

Columnas: 11 · PK: `id`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `title` | text | ✔ |  |  |
| `content` | text | ✔ |  |  |
| `source` | text |  |  |  |
| `department` | text |  |  |  |
| `municipality` | text |  |  |  |
| `category` | text |  |  |  |
| `metadata` | jsonb |  |  | `'{}'::jsonb` |
| `embedding` | vector(768) |  |  |  |
| `created_at` | timestamptz |  |  | `now()` |
| `updated_at` | timestamptz |  |  | `now()` |

### `knowledge_candidates`

Datos propuestos por fuentes externas pendientes de revisión humana.

Columnas: 14 · PK: `id`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `country_code` | text | ✔ | UQ | `'NI'::text` |
| `entity_type` | text | ✔ | UQ |  |
| `entity_id` | text |  | UQ |  |
| `field` | text | ✔ | UQ |  |
| `proposed_value` | jsonb | ✔ |  |  |
| `source_type` | text | ✔ | UQ |  |
| `source_url` | text |  |  |  |
| `source_id` | text |  | UQ |  |
| `confidence` | numeric(4,3) |  |  |  |
| `detected_at` | timestamptz | ✔ |  | `now()` |
| `status` | text | ✔ |  | `'pending'::text` |
| `reviewed_by` | text |  |  |  |
| `reviewed_at` | timestamptz |  |  |  |

### `baqui_knowledge_gaps`

Temas que BAQUI no pudo responder (prioriza curaduría).

Columnas: 9 · PK: `id`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `country_code` | text | ✔ | UQ | `'NI'::text` |
| `topic` | text | ✔ | UQ |  |
| `region` | text |  | UQ |  |
| `query_count` | integer | ✔ |  | `1` |
| `priority` | text | ✔ |  | `'normal'::text` |
| `status` | text | ✔ |  | `'open'::text` |
| `first_detected_at` | timestamptz | ✔ |  | `now()` |
| `last_detected_at` | timestamptz | ✔ |  | `now()` |

### `baqui_trip_memory`

Memoria de viaje con consentimiento y expiración.

Columnas: 10 · PK: `id`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `user_uid` | text |  |  |  |
| `country_code` | text | ✔ |  | `'NI'::text` |
| `language` | text | ✔ |  | `'es'::text` |
| `session_id` | text | ✔ | UQ |  |
| `trip_state` | jsonb | ✔ |  | `'{}'::jsonb` |
| `consented_at` | timestamptz |  |  |  |
| `expires_at` | timestamptz |  |  |  |
| `created_at` | timestamptz | ✔ |  | `now()` |
| `updated_at` | timestamptz | ✔ |  | `now()` |

### `baqui_feedback`

Retroalimentación sobre respuestas de BAQUI.

Columnas: 8 · PK: `id`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `user_uid` | text |  |  |  |
| `session_id` | text |  |  |  |
| `response_id` | text |  |  |  |
| `feedback_type` | text | ✔ |  |  |
| `comment` | text |  |  |  |
| `context` | jsonb | ✔ |  | `'{}'::jsonb` |
| `created_at` | timestamptz | ✔ |  | `now()` |

### `content_translations`

Traducciones revisadas de contenido (6 idiomas), con estado y sugerencia IA marcada.

Columnas: 13 · PK: `id`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `content_type` | text | ✔ | UQ |  |
| `content_id` | text | ✔ | UQ |  |
| `language` | text | ✔ | UQ |  |
| `field` | text | ✔ | UQ |  |
| `value` | text | ✔ |  |  |
| `status` | text | ✔ |  | `'draft'::text` |
| `source_language` | text | ✔ |  | `'es'::text` |
| `ai_suggested` | boolean | ✔ |  | `false` |
| `reviewed_at` | timestamptz |  |  |  |
| `published_at` | timestamptz |  |  |  |
| `created_at` | timestamptz | ✔ |  | `now()` |
| `updated_at` | timestamptz | ✔ |  | `now()` |

## Analítica SMART

### `analytics_event_types`

Catálogo de eventos con etapa AARRR; `is_activation` define activación (≠ registro); `client_allowed` separa eventos de servidor.

Columnas: 6 · PK: `name`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `name` | text | ✔ | PK |  |
| `description` | text | ✔ |  |  |
| `funnel_stage` | text | ✔ |  |  |
| `is_activation` | boolean | ✔ |  | `false` |
| `client_allowed` | boolean | ✔ |  | `true` |
| `created_at` | timestamptz | ✔ |  | `now()` |

### `analytics_events`

Eventos ingresados solo vía RPC `track_event` (el usuario lo fija el servidor).

Columnas: 14 · PK: `id` · Relaciones: `analytics_event_types`, `profiles`, `departments`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `event_name` | text | ✔ | FK → analytics_event_types |  |
| `occurred_at` | timestamptz | ✔ |  | `now()` |
| `user_id` | uuid |  | FK → profiles |  |
| `legacy_uid` | text |  |  |  |
| `anonymous_id` | text |  |  |  |
| `session_id` | text |  |  |  |
| `platform` | text | ✔ |  |  |
| `entity_type` | text |  |  |  |
| `entity_id` | text |  |  |  |
| `department_id` | text |  | FK → departments |  |
| `language` | text |  |  |  |
| `path` | text |  |  |  |
| `metadata` | jsonb | ✔ |  | `'{}'::jsonb` |

### `commercial_actions`

Intenciones comerciales (WhatsApp, llamada, reserva) ligadas a negocio/destino/experiencia.

Columnas: 14 · PK: `id` · Relaciones: `profiles`, `businesses`, `destinations`, `experiences`, `reservations`, `campaign_attribution`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `action_type` | text | ✔ |  |  |
| `occurred_at` | timestamptz | ✔ |  | `now()` |
| `user_id` | uuid |  | FK → profiles |  |
| `legacy_uid` | text |  |  |  |
| `anonymous_id` | text |  |  |  |
| `session_id` | text |  |  |  |
| `business_id` | text |  | FK → businesses |  |
| `destination_id` | text |  | FK → destinations |  |
| `experience_id` | text |  | FK → experiences |  |
| `reservation_id` | uuid |  | FK → reservations |  |
| `campaign_attribution_id` | uuid |  | FK → campaign_attribution |  |
| `platform` | text | ✔ |  |  |
| `is_qualified` | boolean | ✔ |  | `true` |

### `campaign_attribution`

Primer contacto UTM por sesión.

Columnas: 13 · PK: `id` · Relaciones: `profiles`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `session_id` | text | ✔ | UQ |  |
| `anonymous_id` | text |  |  |  |
| `user_id` | uuid |  | FK → profiles |  |
| `platform` | text | ✔ |  |  |
| `utm_source` | text |  |  |  |
| `utm_medium` | text |  |  |  |
| `utm_campaign` | text |  |  |  |
| `utm_content` | text |  |  |  |
| `utm_term` | text |  |  |  |
| `referrer_domain` | text |  |  |  |
| `landing_path` | text |  |  |  |
| `first_seen_at` | timestamptz | ✔ |  | `now()` |

### `user_feedback`

Calificación 1–5 por funcionalidad vía RPC `submit_feedback`.

Columnas: 13 · PK: `id` · Relaciones: `profiles`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `created_at` | timestamptz | ✔ |  | `now()` |
| `user_id` | uuid |  | FK → profiles |  |
| `legacy_uid` | text |  |  |  |
| `anonymous_id` | text |  |  |  |
| `feature` | text | ✔ |  |  |
| `rating` | smallint | ✔ |  |  |
| `usefulness` | smallint |  |  |  |
| `comment` | text |  |  |  |
| `language` | text |  |  |  |
| `platform` | text | ✔ |  |  |
| `entity_type` | text |  |  |  |
| `entity_id` | text |  |  |  |

### `traffic_sessions`

Sesiones de tráfico (plataforma y página) con inserción acotada.

Columnas: 12 · PK: `id`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | text | ✔ | PK |  |
| `platform` | text | ✔ |  |  |
| `client_ip` | text |  |  |  |
| `user_agent` | text |  |  |  |
| `app_version` | text |  |  |  |
| `device_model` | text |  |  |  |
| `page` | text |  |  |  |
| `path` | text |  |  |  |
| `referrer` | text |  |  |  |
| `user_id` | text |  |  |  |
| `is_guest` | boolean |  |  | `true` |
| `created_at` | timestamptz |  |  | `now()` |

## Auditoría, respaldo y operación

### `audit_logs`

Bitácora inmutable (triggers bloquean UPDATE/DELETE/TRUNCATE) con valores antes/después.

Columnas: 18 · PK: `id`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `admin_email` | text | ✔ |  |  |
| `ip_address` | text |  |  |  |
| `user_agent` | text |  |  |  |
| `action` | text | ✔ |  |  |
| `module` | text |  |  |  |
| `target_entity` | text |  |  |  |
| `target_id` | text |  |  |  |
| `description` | text |  |  |  |
| `payload` | jsonb |  |  | `'{}'::jsonb` |
| `created_at` | timestamptz |  |  | `now()` |
| `actor_user_id` | uuid |  |  |  |
| `actor_role` | text |  |  |  |
| `entity_type` | text |  |  |  |
| `entity_id` | text |  |  |  |
| `old_values` | jsonb |  |  |  |
| `new_values` | jsonb |  |  |  |
| `reason` | text |  |  |  |

### `firestore_mirror`

Réplica de Firestore (origen heredado de Android) mientras dura la migración.

Columnas: 13 · PK: `doc_path`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `doc_path` | text | ✔ | PK |  |
| `collection` | text | ✔ |  |  |
| `doc_id` | text | ✔ |  |  |
| `data` | jsonb | ✔ |  | `'{}'::jsonb` |
| `owner_uid` | text |  |  |  |
| `written_by_uid` | text | ✔ |  |  |
| `written_by_email` | text |  |  |  |
| `op` | text | ✔ |  |  |
| `deleted` | boolean | ✔ |  | `false` |
| `version` | integer | ✔ |  | `1` |
| `source` | text | ✔ |  | `'web'::text` |
| `mirrored_at` | timestamptz | ✔ |  | `now()` |
| `created_at` | timestamptz | ✔ |  | `now()` |

### `backup_operations`

Cola de operaciones de respaldo Firebase ↔ Supabase con reintentos.

Columnas: 14 · PK: `id`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `operation_id` | text | ✔ | UQ |  |
| `firebase_uid` | text |  |  |  |
| `entity_type` | text | ✔ |  |  |
| `entity_id` | text | ✔ |  |  |
| `operation_type` | text | ✔ |  |  |
| `payload` | jsonb | ✔ |  |  |
| `firebase_status` | text |  |  | `'pending'::text` |
| `retry_count` | integer |  |  | `0` |
| `last_error` | text |  |  |  |
| `version` | integer |  |  | `1` |
| `created_at` | timestamptz |  |  | `now()` |
| `updated_at` | timestamptz |  |  | `now()` |
| `synced_at` | timestamptz |  |  |  |

### `storage_backups`

Respaldo de archivos de Firebase Storage en Supabase Storage con checksum.

Columnas: 13 · PK: `id`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK | `gen_random_uuid()` |
| `firebase_path` | text | ✔ | UQ |  |
| `firebase_download_url` | text |  |  |  |
| `supabase_bucket` | text | ✔ |  | `'baqueano-backup-images'::text` |
| `supabase_path` | text | ✔ |  |  |
| `checksum` | text |  |  |  |
| `file_size` | bigint |  |  |  |
| `mime_type` | text |  |  |  |
| `backup_status` | text |  |  | `'pending'::text` |
| `last_error` | text |  |  |  |
| `created_at` | timestamptz |  |  | `now()` |
| `updated_at` | timestamptz |  |  | `now()` |
| `backed_up_at` | timestamptz |  |  |  |

### `ops_backup_entities`

Respaldo de entidades del Ops Center.

Columnas: 5 · PK: `id`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | text | ✔ | PK |  |
| `module_id` | text |  |  |  |
| `collection_name` | text |  |  |  |
| `payload` | jsonb | ✔ |  |  |
| `updated_at` | timestamptz |  |  | `now()` |

### `sprint_evidence_records`

Registros de evidencia con hash de prueba y expiración.

Columnas: 7 · PK: `id`

| Columna | Tipo | NN | Clave | Por defecto |
|---|---|:-:|---|---|
| `id` | uuid | ✔ | PK |  |
| `proof_hash` | text | ✔ |  |  |
| `value` | text | ✔ |  |  |
| `version` | integer | ✔ |  | `1` |
| `created_at` | timestamptz | ✔ |  | `now()` |
| `updated_at` | timestamptz | ✔ |  | `now()` |
| `expires_at` | timestamptz | ✔ |  |  |

