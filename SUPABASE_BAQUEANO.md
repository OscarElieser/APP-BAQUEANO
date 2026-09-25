# 🧭 BAQUEANO ECOSYSTEM — ESPECIFICACIÓN TÉCNICA DE SUPABASE

<!--
============================================================================
🧭 BAQUEANO NICARAGUA — ESPECIFICACIÓN Y ARQUITECTURA DE SUPABASE
============================================================================
🎯 1. POR QUÉ (WHY / PROPÓSITO):
- Servir como la infraestructura de respaldo soberano, persistencia relacional avanzada,
  motor geoespacial de alta precisión (PostGIS) y memoria vectorial para RAG (pgvector).
- Proveer un almacenamiento secundario automatizado con verificación de integridad
  SHA-256 ante eventuales fallas o latencias en Firebase Storage.
- Actuar como receptor de la cola transaccional de contingencia (`backup_operations`)
  para que ninguna reserva, reseña o perfil campesino se pierda jamás.

⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
- Principio FIREBASE FIRST, SUPABASE FALLBACK:
  * Supabase NO reemplaza a Firebase; lo complementa y respalda de forma ordenada.
  * Autenticación vinculada mediante `firebase_uid` único (sin passwords en Supabase).
  * Row Level Security (RLS) habilitado de forma obligatoria en el 100% de las tablas.
  * Extensiones PostGIS (`geography(Point, 4326)`) y pgvector (`vector(768)`) activas.
  * Clave `service_role` confinada al backend seguro (Google Secret Manager).
  * Clave anónima pública limitada estrictamente por políticas RLS de solo lectura
    en catálogos públicos y acceso exclusivo a registros propios.

📦 3. QUÉ (WHAT / ENTREGABLES & ESQUEMA VERSIONADO):
- 6 archivos de migración SQL en `supabase/migrations/` (001 a 006).
- Tablas relacionales: `profiles`, `departments`, `municipalities`, `destinations`,
  `places`, `businesses`, `reservations`, `reviews`, `favorites`, `travel_plans`.
- Tablas de contingencia y RAG: `backup_operations`, `ops_backup_entities`,
  `storage_backups`, `knowledge_documents`.
- Funciones RPC: `get_nearby_destinations`, `get_nearby_businesses`, `match_knowledge_documents`.
============================================================================
-->

---

## 📌 1. Información General del Proyecto Supabase

- **Project Ref**: `heiudfpthqwtjrtluqlm`
- **URL Base**: `https://heiudfpthqwtjrtluqlm.supabase.co`
- **Dashboard Directo**: [https://supabase.com/dashboard/project/heiudfpthqwtjrtluqlm](https://supabase.com/dashboard/project/heiudfpthqwtjrtluqlm)
- **Clave Anónima Pública**: `sb_publishable_q7ZhqRIRjlerZK7WOu_Qxw_X_AqXV1d`
- **Ubicación de Migraciones**: [supabase/migrations/](file:///c:/Users/PC%201/APP%20BAQUEANO/supabase/migrations/)

---

## 🗄️ 2. Estructura de Tablas y Esquema Relacional

### 2.1 Identidad y Perfiles (`profiles`)
Vincula a los usuarios de Firebase Authentication con la base relacional de Supabase:
- `id` (UUID, Primary Key, default `gen_random_uuid()`)
- `firebase_uid` (TEXT UNIQUE NOT NULL): Identificador único emitido por Firebase Auth.
- `email` (TEXT)
- `display_name` (TEXT)
- `photo_url` (TEXT)
- `role` (TEXT, default `'traveler'`, check en `traveler, business_owner, guide, editor, admin, superadmin`)
- `phone` (TEXT)
- `created_at` / `updated_at` (TIMESTAMPTZ)

### 2.2 Geografía y Territorios (`departments`, `municipalities`)
- `departments`: Los 15 departamentos y 2 regiones autónomas de Nicaragua.
- `municipalities`: Los 153 municipios con referencia foránea a su departamento.

### 2.3 Catálogo y Negocios (`destinations`, `places`, `businesses`)
- `destinations`: Senderos, volcanes y áreas protegidas con geografía PostGIS (`geom geography(Point, 4326)`), dificultad, precio de referencia en USD y NIO.
- `places`: Puntos georreferenciados específicos con coordenadas GPS.
- `businesses`: Cooperativas y anfitriones con certificación oficial de Baqueano y Ley 306/1210.

### 2.4 Transacciones del Explorador (`reservations`, `reviews`, `favorites`, `travel_plans`)
- `reservations`: Reservas con control de concurrencia optimista (`version INTEGER DEFAULT 1`), estados (`pending, confirmed, rejected, cancelled, completed`) y clave foránea al usuario y negocio.
- `reviews`: Calificaciones comunitarias de 1 a 5 estrellas con moderación de estado (`published, pending_review, archived`).
- `favorites`: Lista de favoritos del explorador con restricción de unicidad (`UNIQUE(user_id, entity_type, entity_id)`).
- `travel_plans`: Itinerarios estructurados generados por la IA de Baqueano.

### 2.5 Respaldo Operacional y Failover (`backup_operations`)
Cola transaccional utilizada cuando Firestore no se encuentra disponible:
- `id` (UUID, Primary Key)
- `operation_id` (TEXT UNIQUE NOT NULL): UUID único de operación para garantizar **idempotencia total** y evitar duplicados en reintentos.
- `firebase_uid` (TEXT): Usuario emisor de la acción.
- `entity_type` (TEXT): Colección destino (`reservations`, `reviews`, `favorites`, `users`, `businesses`, etc.).
- `entity_id` (TEXT): ID de la entidad en Firestore.
- `operation_type` (TEXT): `CREATE, UPDATE, DELETE, UPSERT`.
- `payload` (JSONB): Datos completos de la entidad.
- `firebase_status` (TEXT): `pending, processing, synced, failed, cancelled, conflict`.
- `retry_count` (INTEGER DEFAULT 0)
- `last_error` (TEXT)
- `next_retry_at` (TIMESTAMPTZ)
- `synced_at` (TIMESTAMPTZ)

### 2.6 Respaldo de Almacenamiento (`storage_backups`)
Control de integridad de fotografías y documentos duplicados entre Firebase Storage y Supabase Storage:
- `firebase_path` (TEXT NOT NULL)
- `firebase_download_url` (TEXT)
- `supabase_bucket` (TEXT NOT NULL)
- `supabase_path` (TEXT NOT NULL)
- `checksum` (TEXT NOT NULL): Hash **SHA-256** del archivo para certificar integridad.
- `file_size` (BIGINT)
- `mime_type` (TEXT)
- `backup_status` (TEXT): `pending, backed_up, failed, missing_source`.

---

## 🔒 3. Políticas de Seguridad (Row Level Security - RLS)

Todas las tablas cuentan con `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`.

1. **Lectura Pública de Catálogos**:
   - `departments`, `municipalities`, `destinations`, `places` y `businesses` son de lectura pública para cualquier cliente (`auth.role() = 'anon'` o autenticado).
2. **Escritura Protegida**:
   - Inserciones, modificaciones y eliminaciones requieren rol administrativo o se ejecutan a través de la clave `service_role` en el backend.
3. **Privacidad del Explorador**:
   - En `reservations`, `reviews` y `favorites`, los usuarios únicamente pueden leer y crear registros donde `user_id` coincida con su identidad autenticada.
4. **Protección de Roles**:
   - Ningún usuario puede elevar su propio rol en `profiles`. Los cambios de rol se auditan y ejecutan estrictamente desde el backend.

---

## 🌍 4. Motor Geoespacial PostGIS

1. **Extensiones y Columnas**:
   - Se activa `CREATE EXTENSION IF NOT EXISTS postgis;`.
   - Se mantienen columnas espaciales indexadas mediante `CREATE INDEX ON ... USING GIST (geom);`.
2. **Triggers de Sincronización Automática**:
   - Cada inserción o actualización de `latitude` y `longitude` recalcula automáticamente `geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography`.
3. **Procedimiento Almacenado `get_nearby_destinations`**:
   - Realiza cálculo geodésico de radio utilizando `ST_DWithin(geom, ST_SetSRID(ST_MakePoint(search_lon, search_lat), 4326)::geography, radius_meters)`.
   - Retorna distancia exacta en metros calculada mediante `ST_Distance`.

---

## 🧠 5. Inteligencia Artificial & RAG con pgvector

1. **Extensión Vectorial**:
   - Se activa `CREATE EXTENSION IF NOT EXISTS vector;`.
2. **Tabla `knowledge_documents`**:
   - Almacena fragmentos territoriales oficiales de Nicaragua (INTUR, MARENA, INETER, Ley 306).
   - Columna `embedding vector(768)` (optimizado para Google Gemini Text Embedding y modelos compactos).
   - Índice de proximidad HNSW (`CREATE INDEX ON knowledge_documents USING hnsw (embedding vector_cosine_ops);`) para búsquedas en submiliegundos.
3. **Procedimiento Almacenado `match_knowledge_documents`**:
   - Permite al backend consultar los fragmentos más afines con umbral mínimo de similitud (`1 - (embedding <=> query_embedding) > match_threshold`).

---

## 📦 6. Organización de Buckets en Supabase Storage

Para alojar las copias de seguridad de medios se definen los siguientes buckets:
- `baqueano-backup-media`: Fotografías de destinos, senderos y volcanes.
- `baqueano-backup-businesses`: Fotografías de cooperativas, anfitriones y licencias.
- `baqueano-backup-documents`: Fichas técnicas, auditorías y certificaciones en PDF.

---

## 📋 7. Guía de Ejecución de Migraciones

Para aplicar las migraciones en el proyecto Supabase `heiudfpthqwtjrtluqlm`:
1. Ingresar al **Supabase Dashboard**: [https://supabase.com/dashboard/project/heiudfpthqwtjrtluqlm](https://supabase.com/dashboard/project/heiudfpthqwtjrtluqlm)
2. Seleccionar la sección **SQL Editor**.
3. Ejecutar secuencialmente los 6 archivos ubicados en la carpeta `supabase/migrations/`:
   - `001_initial_schema.sql` (Tablas maestras)
   - `002_rls_policies.sql` (Políticas de seguridad RLS)
   - `003_postgis.sql` (Extensión espacial y funciones RPC)
   - `004_pgvector.sql` (Extensión vectorial y RAG)
   - `005_backup_operations.sql` (Cola de contingencia y resguardo)
   - `006_storage_backup.sql` (Control de integridad de almacenamiento)
