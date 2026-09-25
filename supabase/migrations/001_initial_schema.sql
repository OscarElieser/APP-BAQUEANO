-- ============================================================================
-- 🧭 BAQUEANO ECOSYSTEM — ESQUEMA RELACIONAL Y BASE OPERATIVA (001_initial_schema.sql)
-- ============================================================================
-- 🎯 1. POR QUÉ (WHY / PROPÓSITO):
-- - Dotar a Baqueano de una base de datos relacional y de respaldo en Supabase PostgreSQL.
-- - Garantizar que los perfiles, reservas, negocios campesinos, reseñas y favoritos
--   cuenten con integridad referencial, tipos estrictos y trazabilidad ante caídas de Firebase.
-- - Vincular de manera determinista cada identidad mediante `firebase_uid`.
--
-- ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
-- - Tablas relacionales normalizadas con llaves foráneas y borrado suave (`deleted_at`).
-- - Índices btree para búsquedas rápidas por `firebase_uid`, departamentos y categorías.
-- - Control de concurrencia optimista con columna `version`.
--
-- 📦 3. QUÉ (WHAT / ENTIDADES CREADAS):
-- - `profiles`: Perfiles de viajeros y anfitriones vinculados por `firebase_uid`.
-- - `departments`, `municipalities`: División territorial de Nicaragua.
-- - `destinations`, `places`: Catálogo factual de turismo y senderos.
-- - `businesses`: Cooperativas y negocios verificados (0% comisión).
-- - `reservations`: Sistema transaccional de reservas comunitarias.
-- - `reviews`, `favorites`: Interacciones y valoraciones de exploradores.
-- - `travel_plans`: Itinerarios generados por el motor de IA y el explorador.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PERFILES DE USUARIO
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE NOT NULL,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'traveler' CHECK (role IN ('traveler', 'business_owner', 'guide', 'editor', 'admin', 'superadmin')),
  phone TEXT,
  explorer_level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_profiles_firebase_uid ON public.profiles(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2. DEPARTAMENTOS Y TERRITORIOS DE NICARAGUA
CREATE TABLE IF NOT EXISTS public.departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  capital TEXT,
  short_desc TEXT,
  banner_image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.municipalities (
  id TEXT PRIMARY KEY,
  department_id TEXT NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_municipalities_dept ON public.municipalities(department_id);

-- 3. DESTINOS PROTEGIDOS Y NATURALES
CREATE TABLE IF NOT EXISTS public.destinations (
  id TEXT PRIMARY KEY,
  department_id TEXT REFERENCES public.departments(id),
  name TEXT NOT NULL,
  category TEXT,
  short_desc TEXT,
  description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  cover_image TEXT,
  rating NUMERIC(3,2) DEFAULT 5.00,
  reviews_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_destinations_dept ON public.destinations(department_id);
CREATE INDEX IF NOT EXISTS idx_destinations_category ON public.destinations(category);

-- 4. LUGARES, SENDEROS Y PUNTOS DE INTERÉS
CREATE TABLE IF NOT EXISTS public.places (
  id TEXT PRIMARY KEY,
  destination_id TEXT REFERENCES public.destinations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  avg_price_usd NUMERIC(10,2) DEFAULT 0.00,
  difficulty TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_places_destination ON public.places(destination_id);

-- 5. NEGOCIOS Y COOPERATIVAS ALIADAS (0% COMISIÓN SOBERANA)
CREATE TABLE IF NOT EXISTS public.businesses (
  id TEXT PRIMARY KEY,
  owner_uid TEXT,
  name TEXT NOT NULL,
  category TEXT,
  department TEXT,
  municipality TEXT,
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  cover_image TEXT,
  verified BOOLEAN DEFAULT true,
  commission_rate NUMERIC(4,2) DEFAULT 0.00,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_uid);
CREATE INDEX IF NOT EXISTS idx_businesses_dept ON public.businesses(department);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON public.businesses(category);

-- 6. RESERVAS COMUNITARIAS
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_code TEXT UNIQUE NOT NULL,
  user_uid TEXT NOT NULL,
  business_id TEXT REFERENCES public.businesses(id),
  service_title TEXT NOT NULL,
  travel_date DATE NOT NULL,
  people_count INTEGER DEFAULT 1,
  total_price NUMERIC(10,2),
  currency TEXT DEFAULT 'NIO',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled', 'completed')),
  notes TEXT,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON public.reservations(user_uid);
CREATE INDEX IF NOT EXISTS idx_reservations_business ON public.reservations(business_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);

-- 7. RESEÑAS Y TESTIMONIOS
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uid TEXT NOT NULL,
  user_name TEXT,
  user_avatar TEXT,
  business_id TEXT REFERENCES public.businesses(id),
  destination_id TEXT REFERENCES public.destinations(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  verified_visit BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'moderation', 'hidden')),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reviews_dest ON public.reviews(destination_id);
CREATE INDEX IF NOT EXISTS idx_reviews_biz ON public.reviews(business_id);

-- 8. FAVORITOS DE EXPLORADORES
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uid TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_uid, entity_type, entity_id)
);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_uid);

-- 9. PLANES DE VIAJE E ITINERARIOS
CREATE TABLE IF NOT EXISTS public.travel_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uid TEXT,
  plan_title TEXT NOT NULL,
  destination TEXT,
  days INTEGER,
  budget NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  payload JSONB NOT NULL,
  source TEXT DEFAULT 'deterministic',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_travel_plans_user ON public.travel_plans(user_uid);
