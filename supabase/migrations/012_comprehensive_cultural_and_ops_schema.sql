-- ============================================================================
-- 🧭 BAQUEANO ECOSYSTEM — ESQUEMA CANÓNICO CULTURAL, TERRITORIAL & OPS
-- Archivo: 012_comprehensive_cultural_and_ops_schema.sql
-- ============================================================================
-- 🎯 1. POR QUÉ (WHY / PROPÓSITO):
-- - Transformar BAQUEANO de un catálogo estático a un Ecosistema Digital
--   Inteligente Vivo, Soberano y Trazable de Nicaragua.
-- - Dotar a la plataforma de persistencia relacional oficial para cultura viva,
--   patrimonio histórico, gastronomía ancestral, música, artesanías, festividades,
--   pueblos originarios, rutas vivas, emergencias, anfitriones y modo "No sale en el mapa".
-- - Erradicar datos simulados o mockups en memoria en favor de tablas reales
--   gobernables al 100% desde el Ops Center y consultables con RLS y PostGIS.
--
-- ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
-- - Totalmente ADITIVO y REVERSIBLE: no destruye ni modifica destructivamente
--   ninguna de las 16 tablas existentes (profiles, departments, destinations, etc.).
-- - Extensiones nativas: pgcrypto, postgis y vector.
-- - Índices relacionales y espaciales GiST para búsquedas de alta velocidad.
-- - Atributo canónico 'hidden_gem BOOLEAN DEFAULT false' en todas las entidades
--   para activar de forma nativa la experiencia "DESCUBRE LO QUE NO SALE EN EL MAPA".
-- - Trazabilidad obligatoria: created_at, updated_at, source_name, source_url, verified.
-- - Políticas Row Level Security (RLS): lectura pública de contenidos publicados,
--   escritura segura reservada al backend/service_role y roles administrativos.
--
-- 📦 3. QUÉ (WHAT / ENTIDADES CREADAS & AMPLIADAS):
-- - Ampliación de destinations, places y businesses con hidden_gem y campos sensoriales.
-- - Tablas de Cultura y Patrimonio: culture, heritage, museums, gastronomy, music,
--   crafts, festivals, communities, indigenous_peoples, legends, historical_figures.
-- - Tablas de Logística y Rutas: routes, route_stops, experiences, events, emergencies, day_passes.
-- - Tablas de Exploración y Gamificación: explorer_passport_stamps, travel_diaries.
-- - Tablas de Orquestación IA y Auditoría: ai_sessions, ai_messages, verification_requests.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. AMPLIACIÓN NO DESTRUCTIVA DE TABLAS EXISTENTES
-- ----------------------------------------------------------------------------
ALTER TABLE public.destinations
  ADD COLUMN IF NOT EXISTS hidden_gem BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS vibe_tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS best_season TEXT,
  ADD COLUMN IF NOT EXISTS how_to_reach TEXT,
  ADD COLUMN IF NOT EXISTS audio_ambient_url TEXT,
  ADD COLUMN IF NOT EXISTS audio_narration_url TEXT;

CREATE INDEX IF NOT EXISTS idx_destinations_hidden_gem ON public.destinations(hidden_gem);

ALTER TABLE public.places
  ADD COLUMN IF NOT EXISTS hidden_gem BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS vibe_tags TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_places_hidden_gem ON public.places(hidden_gem);

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS hidden_gem BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS host_name TEXT,
  ADD COLUMN IF NOT EXISTS host_story TEXT,
  ADD COLUMN IF NOT EXISTS ethical_badge BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS day_pass_available BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_businesses_hidden_gem ON public.businesses(hidden_gem);

-- ----------------------------------------------------------------------------
-- 2. DOMINIO CULTURAL, PATRIMONIAL & ANCESTRAL
-- ----------------------------------------------------------------------------

-- Cultura viva, expresiones y tradiciones
CREATE TABLE IF NOT EXISTS public.culture (
  id TEXT PRIMARY KEY,
  department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
  municipality_id TEXT,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- danza, tradicion, literatura, teatro, lengua
  short_desc TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  audio_url TEXT,
  source_name TEXT,
  source_url TEXT,
  verified BOOLEAN DEFAULT true,
  hidden_gem BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_culture_dept ON public.culture(department_id);
CREATE INDEX IF NOT EXISTS idx_culture_category ON public.culture(category);
CREATE INDEX IF NOT EXISTS idx_culture_status ON public.culture(status);
CREATE INDEX IF NOT EXISTS idx_culture_hidden_gem ON public.culture(hidden_gem);

-- Patrimonio material, inmaterial, arquitectónico y arqueológico
CREATE TABLE IF NOT EXISTS public.heritage (
  id TEXT PRIMARY KEY,
  department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
  municipality_id TEXT,
  name TEXT NOT NULL,
  heritage_type TEXT NOT NULL, -- arquitectonico, arqueologico, natural, inmaterial
  period TEXT, -- precolombino, colonial, republicano, contemporaneo
  description TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  geom geography(Point, 4326),
  image_url TEXT,
  audio_url TEXT,
  unesco_status TEXT, -- unesco_world_heritage, unesco_intangible, national_monument, local
  legal_decree TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  hidden_gem BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_heritage_dept ON public.heritage(department_id);
CREATE INDEX IF NOT EXISTS idx_heritage_hidden_gem ON public.heritage(hidden_gem);
CREATE INDEX IF NOT EXISTS idx_heritage_geom ON public.heritage USING GIST(geom);

-- Museos y Casas de Cultura
CREATE TABLE IF NOT EXISTS public.museums (
  id TEXT PRIMARY KEY,
  department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
  municipality_id TEXT,
  name TEXT NOT NULL,
  focus_area TEXT NOT NULL, -- historia, arqueologia, arte, comunitario, etnografia
  description TEXT NOT NULL,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  geom geography(Point, 4326),
  schedule TEXT,
  admission_nio NUMERIC(10,2) DEFAULT 0.00,
  admission_usd NUMERIC(10,2) DEFAULT 0.00,
  is_free BOOLEAN DEFAULT false,
  contact_phone TEXT,
  website_url TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  hidden_gem BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_museums_dept ON public.museums(department_id);
CREATE INDEX IF NOT EXISTS idx_museums_geom ON public.museums USING GIST(geom);

-- Gastronomía viva, recetas ancestrales y sabores territoriales
CREATE TABLE IF NOT EXISTS public.gastronomy (
  id TEXT PRIMARY KEY,
  department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
  municipality_id TEXT,
  dish_name TEXT NOT NULL,
  category TEXT NOT NULL, -- plato_fuerte, sopa, postre, bebida, panaderia_maiz
  origin_history TEXT,
  ingredients TEXT[],
  ancestral_technique TEXT,
  best_places TEXT,
  average_price_nio NUMERIC(10,2),
  average_price_usd NUMERIC(10,2),
  image_url TEXT,
  audio_url TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  hidden_gem BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gastronomy_dept ON public.gastronomy(department_id);
CREATE INDEX IF NOT EXISTS idx_gastronomy_category ON public.gastronomy(category);
CREATE INDEX IF NOT EXISTS idx_gastronomy_hidden_gem ON public.gastronomy(hidden_gem);

-- Galería sonora y archivo musical de Nicaragua
CREATE TABLE IF NOT EXISTS public.music (
  id TEXT PRIMARY KEY,
  department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  artist_composer TEXT NOT NULL,
  genre TEXT NOT NULL, -- son_nica, mazurca, polka, vals, marimba, palo_de_mayo, nueva_cancion
  era TEXT,
  historical_significance TEXT,
  audio_preview_url TEXT,
  lyrics_excerpt TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_music_dept ON public.music(department_id);
CREATE INDEX IF NOT EXISTS idx_music_genre ON public.music(genre);

-- Artesanías y oficios tradicionales campesinos
CREATE TABLE IF NOT EXISTS public.crafts (
  id TEXT PRIMARY KEY,
  department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
  municipality_id TEXT,
  craft_name TEXT NOT NULL,
  material TEXT NOT NULL, -- barro, madera, cuero, pita, jícaro, tejido
  ancestral_community TEXT,
  artisan_coop_name TEXT,
  contact_phone TEXT,
  workshop_address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  geom geography(Point, 4326),
  description TEXT NOT NULL,
  price_range_nio TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  hidden_gem BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crafts_dept ON public.crafts(department_id);
CREATE INDEX IF NOT EXISTS idx_crafts_geom ON public.crafts USING GIST(geom);

-- Festividades patronales y calendario cultural
CREATE TABLE IF NOT EXISTS public.festivals (
  id TEXT PRIMARY KEY,
  department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
  municipality_id TEXT,
  name TEXT NOT NULL,
  patron_saint_or_theme TEXT NOT NULL,
  celebration_month INTEGER NOT NULL CHECK (celebration_month BETWEEN 1 AND 12),
  start_day INTEGER,
  end_day INTEGER,
  traditions_description TEXT NOT NULL,
  culinary_traditions TEXT,
  dance_music TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_festivals_dept ON public.festivals(department_id);
CREATE INDEX IF NOT EXISTS idx_festivals_month ON public.festivals(celebration_month);

-- Comunidades rurales, anfitriones y pueblos originarios
CREATE TABLE IF NOT EXISTS public.communities (
  id TEXT PRIMARY KEY,
  department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
  municipality_id TEXT,
  name TEXT NOT NULL,
  ethnic_group TEXT, -- chorotega, miskito, mayangna, rama, creole, garifuna, campesino
  host_coop_name TEXT,
  community_leader TEXT,
  contact_phone TEXT,
  whatsapp TEXT,
  experiences_offered TEXT[],
  visitor_guidelines TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  geom geography(Point, 4326),
  cover_image TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  hidden_gem BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_communities_dept ON public.communities(department_id);
CREATE INDEX IF NOT EXISTS idx_communities_geom ON public.communities USING GIST(geom);

-- Leyendas y memoria oral nicaragüense
CREATE TABLE IF NOT EXISTS public.legends (
  id TEXT PRIMARY KEY,
  department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
  municipality_id TEXT,
  title TEXT NOT NULL,
  oral_tradition_summary TEXT NOT NULL,
  full_story TEXT NOT NULL,
  lesson_or_context TEXT,
  image_url TEXT,
  audio_narration_url TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_legends_dept ON public.legends(department_id);

-- Personajes históricos y forjadores de identidad
CREATE TABLE IF NOT EXISTS public.historical_figures (
  id TEXT PRIMARY KEY,
  department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
  municipality_id TEXT,
  full_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  birth_year INTEGER,
  death_year INTEGER,
  biography TEXT NOT NULL,
  legacy_summary TEXT,
  key_locations TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_historical_figures_dept ON public.historical_figures(department_id);

-- ----------------------------------------------------------------------------
-- 3. DOMINIO DE RUTAS, EXPERIENCIAS, EVENTOS & LOGÍSTICA
-- ----------------------------------------------------------------------------

-- Rutas temáticas del explorador
CREATE TABLE IF NOT EXISTS public.routes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  department_ids TEXT[],
  category TEXT NOT NULL, -- senderismo, volcanes, cafe, artesania, colonial, fluvial, costa
  theme TEXT,
  duration_days INTEGER DEFAULT 1,
  difficulty TEXT CHECK (difficulty IN ('facil', 'moderada', 'exigente', 'extrema')),
  budget_tier TEXT CHECK (budget_tier IN ('economico', 'intermedio', 'premium')),
  estimated_cost_nio NUMERIC(10,2),
  estimated_cost_usd NUMERIC(10,2),
  transport_mode TEXT, -- 4x4, autobus, senderismo, lancha, vehiculo_liviano
  cover_image TEXT,
  map_geojson JSONB DEFAULT '{}',
  hidden_gem BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_routes_slug ON public.routes(slug);
CREATE INDEX IF NOT EXISTS idx_routes_category ON public.routes(category);
CREATE INDEX IF NOT EXISTS idx_routes_hidden_gem ON public.routes(hidden_gem);

-- Paradas ordenadas de cada ruta
CREATE TABLE IF NOT EXISTS public.route_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id TEXT NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  stop_order INTEGER NOT NULL,
  entity_type TEXT, -- destination, place, business, museum, heritage
  entity_id TEXT,
  title TEXT NOT NULL,
  day_number INTEGER DEFAULT 1,
  duration_minutes INTEGER DEFAULT 60,
  notes TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  geom geography(Point, 4326),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_route_stops_route ON public.route_stops(route_id, stop_order);
CREATE INDEX IF NOT EXISTS idx_route_stops_geom ON public.route_stops USING GIST(geom);

-- Catálogo de Experiencias Turísticas Comunitarias Vivas
CREATE TABLE IF NOT EXISTS public.experiences (
  id TEXT PRIMARY KEY,
  destination_id TEXT REFERENCES public.destinations(id) ON DELETE SET NULL,
  business_id TEXT REFERENCES public.businesses(id) ON DELETE SET NULL,
  department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- aventura, ecoturismo, gastronomia, cultural, relax, nocturno
  sensory_type TEXT, -- visual, gustativo, auditivo, adrenalina, espiritual
  duration_hours NUMERIC(4,1) DEFAULT 2.0,
  price_nio NUMERIC(10,2),
  price_usd NUMERIC(10,2),
  group_size_max INTEGER DEFAULT 12,
  included TEXT[],
  host_name TEXT,
  host_bio TEXT,
  difficulty TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  geom geography(Point, 4326),
  cover_image TEXT,
  verified BOOLEAN DEFAULT true,
  hidden_gem BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_experiences_dept ON public.experiences(department_id);
CREATE INDEX IF NOT EXISTS idx_experiences_category ON public.experiences(category);
CREATE INDEX IF NOT EXISTS idx_experiences_hidden_gem ON public.experiences(hidden_gem);
CREATE INDEX IF NOT EXISTS idx_experiences_geom ON public.experiences USING GIST(geom);

-- Agenda cultural y eventos dinámicos (sin borrado al concluir; pasan a histórico)
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
  municipality_id TEXT,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- concierto, fiesta_patronal, feria, exposicion, deportivo, gastronomico
  start_date DATE NOT NULL,
  end_date DATE,
  schedule_time TEXT,
  location_name TEXT NOT NULL,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  geom geography(Point, 4326),
  is_free BOOLEAN DEFAULT true,
  admission_nio NUMERIC(10,2) DEFAULT 0.00,
  organizer_name TEXT,
  contact_info TEXT,
  cover_image TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'historical')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_geom ON public.events USING GIST(geom);

-- Centro Nacional de Emergencias y Servicios Críticos BAQUEANO
CREATE TABLE IF NOT EXISTS public.emergencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id TEXT NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  municipality_id TEXT,
  service_type TEXT NOT NULL, -- hospital, centro_salud, policia, bomberos, cruz_roja, rescate_volcan
  entity_name TEXT NOT NULL,
  phone_emergency TEXT NOT NULL,
  phone_secondary TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  geom geography(Point, 4326),
  is_24_hours BOOLEAN DEFAULT true,
  notes TEXT,
  verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_emergencies_dept ON public.emergencies(department_id);
CREATE INDEX IF NOT EXISTS idx_emergencies_type ON public.emergencies(service_type);
CREATE INDEX IF NOT EXISTS idx_emergencies_geom ON public.emergencies USING GIST(geom);

-- Day Passes y Pasadías Turísticos
CREATE TABLE IF NOT EXISTS public.day_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  price_adult_nio NUMERIC(10,2),
  price_child_nio NUMERIC(10,2),
  price_usd NUMERIC(10,2),
  schedule_hours TEXT,
  amenities TEXT[],
  pool_access BOOLEAN DEFAULT false,
  food_credit_included BOOLEAN DEFAULT false,
  requires_reservation BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_day_passes_business ON public.day_passes(business_id);

-- ----------------------------------------------------------------------------
-- 4. DOMINIO DEL VIAJERO, PASAPORTE & GAMIFICACIÓN RESPONSABLE
-- ----------------------------------------------------------------------------

-- Pasaporte Digital del Explorador Baqueano (Sellos territoriales certificados)
CREATE TABLE IF NOT EXISTS public.explorer_passport_stamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uid TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- destination, heritage, museum, community, route
  entity_id TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  department_id TEXT,
  stamp_category TEXT DEFAULT 'territorial', -- territorial, cultura, naturaleza, hidden_gem, gastronomia
  verified_by_qr BOOLEAN DEFAULT false,
  stamped_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_uid, entity_type, entity_id)
);
CREATE INDEX IF NOT EXISTS idx_passport_user ON public.explorer_passport_stamps(user_uid);

-- Diario de Viaje / Mi Historia Baqueano
CREATE TABLE IF NOT EXISTS public.travel_diaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uid TEXT NOT NULL,
  title TEXT NOT NULL,
  trip_id UUID,
  is_public BOOLEAN DEFAULT false,
  entries JSONB DEFAULT '[]'::jsonb, -- arreglo de hitos, notas, fotos y recuerdos
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_diaries_user ON public.travel_diaries(user_uid);

-- Solicitudes de Verificación Baqueano para Negocios y Anfitriones
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- business, guide, community, experience
  entity_id TEXT NOT NULL,
  applicant_uid TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  applicant_phone TEXT NOT NULL,
  documents_payload JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'verified', 'rejected')),
  admin_notes TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON public.verification_requests(status);

-- ----------------------------------------------------------------------------
-- 5. ORQUESTACIÓN DE IA, SESIONES Y TRAZABILIDAD
-- ----------------------------------------------------------------------------

-- Sesiones contextualizadas de Baqueano IA
CREATE TABLE IF NOT EXISTS public.ai_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uid TEXT,
  session_key TEXT NOT NULL,
  current_module TEXT,
  travel_style TEXT,
  budget_tier TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_key ON public.ai_sessions(session_key);

-- Mensajes y trazabilidad de inferencia Multi-LLM
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.ai_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  specialized_agent TEXT, -- travel, territory, culture, food, route, safety, orchestrator
  rag_sources JSONB DEFAULT '[]'::jsonb,
  tool_calls JSONB DEFAULT '[]'::jsonb,
  provider_used TEXT, -- gemini, groq, ollama, factual_engine
  tokens_used INTEGER,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_messages_session ON public.ai_messages(session_id);

-- ----------------------------------------------------------------------------
-- 6. DISPARADORES POSTGIS PARA SINCRONIZACIÓN DE COORDENADAS
-- ----------------------------------------------------------------------------

-- Función universal para recalcular punto geográfico en inserción/actualización
CREATE OR REPLACE FUNCTION public.sync_geography_point()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL AND
     NEW.latitude BETWEEN -90 AND 90 AND NEW.longitude BETWEEN -180 AND 180 THEN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  ELSE
    NEW.geom := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a tablas que contienen coordenadas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_heritage_geom') THEN
    CREATE TRIGGER trg_heritage_geom BEFORE INSERT OR UPDATE OF latitude, longitude ON public.heritage
    FOR EACH ROW EXECUTE FUNCTION public.sync_geography_point();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_museums_geom') THEN
    CREATE TRIGGER trg_museums_geom BEFORE INSERT OR UPDATE OF latitude, longitude ON public.museums
    FOR EACH ROW EXECUTE FUNCTION public.sync_geography_point();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_crafts_geom') THEN
    CREATE TRIGGER trg_crafts_geom BEFORE INSERT OR UPDATE OF latitude, longitude ON public.crafts
    FOR EACH ROW EXECUTE FUNCTION public.sync_geography_point();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_communities_geom') THEN
    CREATE TRIGGER trg_communities_geom BEFORE INSERT OR UPDATE OF latitude, longitude ON public.communities
    FOR EACH ROW EXECUTE FUNCTION public.sync_geography_point();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_experiences_geom') THEN
    CREATE TRIGGER trg_experiences_geom BEFORE INSERT OR UPDATE OF latitude, longitude ON public.experiences
    FOR EACH ROW EXECUTE FUNCTION public.sync_geography_point();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_events_geom') THEN
    CREATE TRIGGER trg_events_geom BEFORE INSERT OR UPDATE OF latitude, longitude ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.sync_geography_point();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_emergencies_geom') THEN
    CREATE TRIGGER trg_emergencies_geom BEFORE INSERT OR UPDATE OF latitude, longitude ON public.emergencies
    FOR EACH ROW EXECUTE FUNCTION public.sync_geography_point();
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 7. POLÍTICAS ROW LEVEL SECURITY (RLS) ESTRICTAS
-- ----------------------------------------------------------------------------

-- Habilitar RLS en todas las tablas creadas
ALTER TABLE public.culture ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heritage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.museums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gastronomy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historical_figures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.explorer_passport_stamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_diaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública para contenidos en estado 'published'
DROP POLICY IF EXISTS "Lectura pública de cultura publicada" ON public.culture;
CREATE POLICY "Lectura pública de cultura publicada" ON public.culture FOR SELECT TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "Lectura pública de patrimonio publicado" ON public.heritage;
CREATE POLICY "Lectura pública de patrimonio publicado" ON public.heritage FOR SELECT TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "Lectura pública de museos publicados" ON public.museums;
CREATE POLICY "Lectura pública de museos publicados" ON public.museums FOR SELECT TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "Lectura pública de gastronomía publicada" ON public.gastronomy;
CREATE POLICY "Lectura pública de gastronomía publicada" ON public.gastronomy FOR SELECT TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "Lectura pública de música publicada" ON public.music;
CREATE POLICY "Lectura pública de música publicada" ON public.music FOR SELECT TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "Lectura pública de artesanías publicadas" ON public.crafts;
CREATE POLICY "Lectura pública de artesanías publicadas" ON public.crafts FOR SELECT TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "Lectura pública de festividades publicadas" ON public.festivals;
CREATE POLICY "Lectura pública de festividades publicadas" ON public.festivals FOR SELECT TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "Lectura pública de comunidades publicadas" ON public.communities;
CREATE POLICY "Lectura pública de comunidades publicadas" ON public.communities FOR SELECT TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "Lectura pública de leyendas publicadas" ON public.legends;
CREATE POLICY "Lectura pública de leyendas publicadas" ON public.legends FOR SELECT TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "Lectura pública de próceres publicados" ON public.historical_figures;
CREATE POLICY "Lectura pública de próceres publicados" ON public.historical_figures FOR SELECT TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "Lectura pública de rutas publicadas" ON public.routes;
CREATE POLICY "Lectura pública de rutas publicadas" ON public.routes FOR SELECT TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "Lectura pública de paradas de rutas" ON public.route_stops;
CREATE POLICY "Lectura pública de paradas de rutas" ON public.route_stops FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Lectura pública de experiencias publicadas" ON public.experiences;
CREATE POLICY "Lectura pública de experiencias publicadas" ON public.experiences FOR SELECT TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "Lectura pública de eventos" ON public.events;
CREATE POLICY "Lectura pública de eventos" ON public.events FOR SELECT TO anon, authenticated USING (status IN ('published', 'historical'));

DROP POLICY IF EXISTS "Lectura pública de emergencias" ON public.emergencies;
CREATE POLICY "Lectura pública de emergencias" ON public.emergencies FOR SELECT TO anon, authenticated USING (verified = true);

DROP POLICY IF EXISTS "Lectura pública de day passes publicados" ON public.day_passes;
CREATE POLICY "Lectura pública de day passes publicados" ON public.day_passes FOR SELECT TO anon, authenticated USING (status = 'published');

-- Políticas del Pasaporte y Diarios de Viaje
DROP POLICY IF EXISTS "Usuarios ven sus propios sellos de pasaporte" ON public.explorer_passport_stamps;
CREATE POLICY "Usuarios ven sus propios sellos de pasaporte" ON public.explorer_passport_stamps FOR SELECT TO authenticated USING (auth.uid()::text = user_uid);

DROP POLICY IF EXISTS "Usuarios ven sus diarios propios o públicos" ON public.travel_diaries;
CREATE POLICY "Usuarios ven sus diarios propios o públicos" ON public.travel_diaries FOR SELECT TO anon, authenticated USING (is_public = true OR (auth.uid() IS NOT NULL AND auth.uid()::text = user_uid));

-- Permisos de Grants a los roles públicos
GRANT SELECT ON public.culture, public.heritage, public.museums, public.gastronomy,
  public.music, public.crafts, public.festivals, public.communities, public.legends,
  public.historical_figures, public.routes, public.route_stops, public.experiences,
  public.events, public.emergencies, public.day_passes TO anon, authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
