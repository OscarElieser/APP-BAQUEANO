-- ============================================================================
-- 🧭 BAQUEANO ECOSYSTEM — EXTENSIÓN ESPACIAL POSTGIS (003_postgis.sql)
-- ============================================================================
-- 🎯 1. POR QUÉ (WHY / PROPÓSITO):
-- - Dotar a Baqueano de consultas de proximidad geográfica de alto rendimiento
--   (distancias exactas, búsqueda por radio en metros, destinos y cooperativas cercanas).
-- - Evitar cálculos trigonométricos lentos e imprecisos en el navegador.
--
-- ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
-- - Activa la extensión PostGIS nativa de PostgreSQL.
-- - Añade columna `geom` (Point, SRID 4326) con índice espacial GIST.
-- - Función trigger para sincronizar `geom` automáticamente cuando se crean o modifican
--   las coordenadas `(latitude, longitude)`.
-- - Funciones RPC optimizadas `get_nearby_destinations` y `get_nearby_businesses` con `ST_DWithin` y `ST_DistanceSphere`.
--
-- 📦 3. QUÉ (WHAT / ENTIDADES CREADAS):
-- - Extensión `postgis`.
-- - Columnas `geom` en `destinations`, `places` y `businesses`.
-- - Funciones de búsqueda geográfica por radio en metros.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS postgis;

-- Blindaje RLS para la tabla del sistema de PostGIS (resuelve advertencia crítica de Supabase Advisor)
ALTER TABLE IF EXISTS public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura publica de spatial_ref_sys" ON public.spatial_ref_sys;
CREATE POLICY "Permitir lectura publica de spatial_ref_sys"
  ON public.spatial_ref_sys FOR SELECT
  USING (true);

-- 1. COLUMNAS GEOGRÁFICAS
ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS geom geometry(Point, 4326);
ALTER TABLE public.places ADD COLUMN IF NOT EXISTS geom geometry(Point, 4326);
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS geom geometry(Point, 4326);

-- 2. FUNCIÓN TRIGGER PARA ACTUALIZAR GEOMETRÍA DESDE LAT/LNG
CREATE OR REPLACE FUNCTION public.sync_point_geometry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.longitude IS NOT NULL AND NEW.latitude IS NOT NULL THEN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_destinations_geom ON public.destinations;
CREATE TRIGGER trg_sync_destinations_geom
BEFORE INSERT OR UPDATE OF latitude, longitude ON public.destinations
FOR EACH ROW EXECUTE FUNCTION public.sync_point_geometry();

DROP TRIGGER IF EXISTS trg_sync_places_geom ON public.places;
CREATE TRIGGER trg_sync_places_geom
BEFORE INSERT OR UPDATE OF latitude, longitude ON public.places
FOR EACH ROW EXECUTE FUNCTION public.sync_point_geometry();

DROP TRIGGER IF EXISTS trg_sync_businesses_geom ON public.businesses;
CREATE TRIGGER trg_sync_businesses_geom
BEFORE INSERT OR UPDATE OF latitude, longitude ON public.businesses
FOR EACH ROW EXECUTE FUNCTION public.sync_point_geometry();

-- 3. ÍNDICES ESPACIALES GIST
CREATE INDEX IF NOT EXISTS idx_destinations_geom ON public.destinations USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_places_geom ON public.places USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_businesses_geom ON public.businesses USING GIST(geom);

-- 4. FUNCIÓN RPC: OBTENER DESTINOS CERCANOS
CREATE OR REPLACE FUNCTION public.get_nearby_destinations(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION DEFAULT 25000,
  filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  category TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  cover_image TEXT,
  rating NUMERIC,
  distance_meters DOUBLE PRECISION
) AS $$
DECLARE
  center_point geometry;
BEGIN
  center_point := ST_SetSRID(ST_MakePoint(lng, lat), 4326);

  RETURN QUERY
  SELECT
    d.id,
    d.name,
    d.category,
    d.latitude,
    d.longitude,
    d.cover_image,
    d.rating,
    ST_Distance(d.geom::geography, center_point::geography) AS distance_meters
  FROM public.destinations d
  WHERE d.geom IS NOT NULL
    AND d.status = 'published'
    AND d.deleted_at IS NULL
    AND (filter_category IS NULL OR d.category ILIKE '%' || filter_category || '%')
    AND ST_DWithin(d.geom::geography, center_point::geography, radius_meters)
  ORDER BY distance_meters ASC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql STABLE;

-- 5. FUNCIÓN RPC: OBTENER NEGOCIOS CERCANOS
CREATE OR REPLACE FUNCTION public.get_nearby_businesses(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION DEFAULT 15000,
  filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  category TEXT,
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  verified BOOLEAN,
  distance_meters DOUBLE PRECISION
) AS $$
DECLARE
  center_point geometry;
BEGIN
  center_point := ST_SetSRID(ST_MakePoint(lng, lat), 4326);

  RETURN QUERY
  SELECT
    b.id,
    b.name,
    b.category,
    b.phone,
    b.whatsapp,
    b.address,
    b.latitude,
    b.longitude,
    b.verified,
    ST_Distance(b.geom::geography, center_point::geography) AS distance_meters
  FROM public.businesses b
  WHERE b.geom IS NOT NULL
    AND b.verified = true
    AND b.deleted_at IS NULL
    AND (filter_category IS NULL OR b.category ILIKE '%' || filter_category || '%')
    AND ST_DWithin(b.geom::geography, center_point::geography, radius_meters)
  ORDER BY distance_meters ASC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql STABLE;
