-- ============================================================================
-- 🧭 BAQUEANO ECOSYSTEM — EXTENSIÓN ESPACIAL POSTGIS (003_postgis.sql)
-- ============================================================================
-- 🎯 1. POR QUÉ (WHY / PROPÓSITO):
-- - Dotar a Baqueano de consultas de proximidad geográfica de alto rendimiento
--   (distancias exactas, búsqueda por radio en metros, destinos y cooperativas cercanas).
-- - Evitar cálculos trigonométricos lentos e imprecisos en el navegador.
-- - Cumplir con las directrices de seguridad de Supabase instalando extensiones
--   en el esquema dedicado `extensions`, blindando `spatial_ref_sys` contra exposición pública.
--
-- ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
-- - Activa PostGIS en el esquema `extensions` para aislar tablas internas del API PostgREST.
-- - Añade columna `geom` (Point, SRID 4326) con índice espacial GIST.
-- - Función trigger para sincronizar `geom` automáticamente cuando se crean o modifican
--   las coordenadas `(latitude, longitude)`.
-- - Funciones RPC optimizadas `get_nearby_destinations` y `get_nearby_businesses` con `ST_DWithin` y `ST_Distance`.
-- - Funciones configuradas con `SET search_path = public, extensions` para prevenir advertencias de mutabilidad.
--
-- 📦 3. QUÉ (WHAT / ENTIDADES CREADAS):
-- - Extensión `postgis` en esquema `extensions`.
-- - Columnas `geom` en `destinations`, `places` y `businesses`.
-- - Triggers `trg_sync_*_geom`.
-- - Índices `idx_*_geom`.
-- - Funciones RPC `get_nearby_destinations` y `get_nearby_businesses`.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- 1. COLUMNAS GEOGRÁFICAS
ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS geom extensions.geometry(Point, 4326);
ALTER TABLE public.places ADD COLUMN IF NOT EXISTS geom extensions.geometry(Point, 4326);
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS geom extensions.geometry(Point, 4326);

-- 2. FUNCIÓN TRIGGER PARA ACTUALIZAR GEOMETRÍA DESDE LAT/LNG
CREATE OR REPLACE FUNCTION public.sync_point_geometry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.longitude IS NOT NULL AND NEW.latitude IS NOT NULL THEN
    NEW.geom := extensions.ST_SetSRID(extensions.ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, extensions;

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
  center_point extensions.geometry;
BEGIN
  center_point := extensions.ST_SetSRID(extensions.ST_MakePoint(lng, lat), 4326);

  RETURN QUERY
  SELECT
    d.id,
    d.name,
    d.category,
    d.latitude,
    d.longitude,
    d.cover_image,
    d.rating,
    extensions.ST_Distance(d.geom::extensions.geography, center_point::extensions.geography) AS distance_meters
  FROM public.destinations d
  WHERE d.geom IS NOT NULL
    AND d.status = 'published'
    AND d.deleted_at IS NULL
    AND (filter_category IS NULL OR d.category ILIKE '%' || filter_category || '%')
    AND extensions.ST_DWithin(d.geom::extensions.geography, center_point::extensions.geography, radius_meters)
  ORDER BY distance_meters ASC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public, extensions;

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
  center_point extensions.geometry;
BEGIN
  center_point := extensions.ST_SetSRID(extensions.ST_MakePoint(lng, lat), 4326);

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
    extensions.ST_Distance(b.geom::extensions.geography, center_point::extensions.geography) AS distance_meters
  FROM public.businesses b
  WHERE b.geom IS NOT NULL
    AND b.verified = true
    AND b.deleted_at IS NULL
    AND (filter_category IS NULL OR b.category ILIKE '%' || filter_category || '%')
    AND extensions.ST_DWithin(b.geom::extensions.geography, center_point::extensions.geography, radius_meters)
  ORDER BY distance_meters ASC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public, extensions;
