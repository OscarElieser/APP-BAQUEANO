-- ============================================================================
-- BAQUEANO — CAPA CANÓNICA DE DATOS SUPABASE
-- ============================================================================
-- POR QUÉ: Supabase es la única fuente de datos; Firebase sólo aloja y autentica.
-- CÓMO: Functions verifica Firebase ID Tokens y escribe con service_role; los
-- clientes públicos sólo leen registros publicados protegidos por RLS.
-- QUÉ: trazabilidad de destinos, precios tipados, métricas reales y permisos
-- explícitos compatibles con la Data API de Supabase 2026.
-- ============================================================================

ALTER TABLE public.destinations
  ALTER COLUMN rating DROP DEFAULT,
  ALTER COLUMN verified SET DEFAULT false,
  ADD COLUMN IF NOT EXISTS source_name TEXT,
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS confidence_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (confidence_status IN ('verified_baqueano', 'confirmed', 'pending', 'community')),
  ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_notes TEXT;

ALTER TABLE public.places
  ALTER COLUMN avg_price_usd DROP DEFAULT,
  ADD COLUMN IF NOT EXISTS source_name TEXT,
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.tourism_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id TEXT REFERENCES public.destinations(id) ON DELETE CASCADE,
  business_id TEXT REFERENCES public.businesses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  service_type TEXT NOT NULL,
  price_kind TEXT NOT NULL CHECK (price_kind IN ('confirmed', 'estimated', 'on_request')),
  price_min NUMERIC(12,2),
  price_max NUMERIC(12,2),
  currency TEXT NOT NULL DEFAULT 'NIO' CHECK (currency IN ('NIO', 'USD')),
  price_unit TEXT,
  source_name TEXT NOT NULL,
  source_url TEXT,
  verified_at TIMESTAMPTZ,
  valid_until DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('published', 'pending', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (price_min IS NULL OR price_min >= 0),
  CHECK (price_max IS NULL OR price_max >= price_min),
  CHECK (price_kind = 'on_request' OR price_min IS NOT NULL),
  CHECK (price_kind <> 'confirmed' OR verified_at IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_tourism_services_destination_status
  ON public.tourism_services(destination_id, status);
CREATE INDEX IF NOT EXISTS idx_tourism_services_business_status
  ON public.tourism_services(business_id, status);
ALTER TABLE public.tourism_services ENABLE ROW LEVEL SECURITY;

-- Firebase Auth es la identidad canónica: ningún cliente escribe directo.
DROP POLICY IF EXISTS "Lectura pública de perfiles básicos" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar únicamente su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los dueños administran sus propios negocios" ON public.businesses;
DROP POLICY IF EXISTS "Los usuarios ven únicamente sus propias reservas" ON public.reservations;
DROP POLICY IF EXISTS "Creación de reservas para usuario autenticado o backend" ON public.reservations;
DROP POLICY IF EXISTS "Actualización de reservas controlada por backend" ON public.reservations;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear reseñas" ON public.reviews;
DROP POLICY IF EXISTS "Usuarios administran únicamente sus favoritos" ON public.favorites;
DROP POLICY IF EXISTS "Usuarios ven sus propios planes o públicos" ON public.travel_plans;
DROP POLICY IF EXISTS "Creación de planes de viaje" ON public.travel_plans;

DROP POLICY IF EXISTS "Lectura pública de servicios publicados" ON public.tourism_services;
CREATE POLICY "Lectura pública de servicios publicados"
  ON public.tourism_services FOR SELECT TO anon, authenticated
  USING (status = 'published');

REVOKE ALL ON public.profiles, public.reservations, public.favorites,
  public.travel_plans FROM anon, authenticated;
GRANT SELECT ON public.departments, public.municipalities, public.destinations,
  public.places, public.businesses, public.reviews, public.tourism_services
  TO anon, authenticated;

CREATE OR REPLACE VIEW public.public_ecosystem_metrics
WITH (security_invoker = true) AS
SELECT
  (SELECT count(*) FROM public.destinations WHERE status = 'published' AND deleted_at IS NULL) AS published_destinations,
  (SELECT count(DISTINCT department_id) FROM public.destinations WHERE status = 'published' AND deleted_at IS NULL) AS covered_departments,
  (SELECT count(*) FROM public.businesses WHERE deleted_at IS NULL) AS registered_businesses,
  (SELECT count(*) FROM public.businesses WHERE verified = true AND deleted_at IS NULL) AS verified_businesses,
  (SELECT count(*) FROM public.tourism_services WHERE status = 'published') AS published_services,
  (SELECT count(*) FROM public.travel_plans) AS generated_routes;

REVOKE ALL ON public.public_ecosystem_metrics FROM PUBLIC;
GRANT SELECT ON public.public_ecosystem_metrics TO anon, authenticated, service_role;
