-- ============================================================================
-- 🧭 BAQUEANO ECOSYSTEM — POLÍTICAS ROW LEVEL SECURITY (002_rls_policies.sql)
-- ============================================================================
-- 🎯 1. POR QUÉ (WHY / PROPÓSITO):
-- - Blindar el acceso en Supabase de modo que ningún usuario normal ni cliente web
--   pueda elevar sus roles, ver reservas ajenas o alterar el catálogo oficial.
-- - Garantizar que las operaciones críticas sean autorizadas por backend o mediante
--   reglas deterministas de propiedad.
--
-- ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
-- - `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` en todas las tablas.
-- - Cláusulas `DROP POLICY IF EXISTS` antes de cada creación para idempotencia total.
-- - Políticas SELECT públicas para contenido publicado (destinos, lugares, negocios verificados).
-- - Políticas restrictivas para reservas, favoritos y perfiles vinculados al `firebase_uid`.
-- - Política de bypass total para `service_role` (invocado exclusivamente por el backend Node.js).
--
-- 📦 3. QUÉ (WHAT / POLÍTICAS APLICADAS):
-- - Acceso lectura pública al catálogo de turismo.
-- - Aislamiento estricto de perfiles y reservas por usuario.
-- - Prohibición de escritura directa no autorizada en negocios y destinos.
-- ============================================================================

-- Habilitar RLS en todas las tablas relacionales
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_plans ENABLE ROW LEVEL SECURITY;

-- 1. POLÍTICAS DE PERFILES
DROP POLICY IF EXISTS "Lectura pública de perfiles básicos" ON public.profiles;
CREATE POLICY "Lectura pública de perfiles básicos"
  ON public.profiles FOR SELECT
  USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Los usuarios pueden actualizar únicamente su propio perfil" ON public.profiles;
CREATE POLICY "Los usuarios pueden actualizar únicamente su propio perfil"
  ON public.profiles FOR UPDATE
  USING (firebase_uid = auth.uid()::text OR auth.role() = 'service_role')
  WITH CHECK (firebase_uid = auth.uid()::text OR auth.role() = 'service_role');

-- 2. POLÍTICAS DE CATÁLOGO (Departamentos, Municipios, Destinos y Lugares)
DROP POLICY IF EXISTS "Lectura pública de departamentos" ON public.departments;
CREATE POLICY "Lectura pública de departamentos"
  ON public.departments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Lectura pública de municipios" ON public.municipalities;
CREATE POLICY "Lectura pública de municipios"
  ON public.municipalities FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Lectura pública de destinos publicados" ON public.destinations;
CREATE POLICY "Lectura pública de destinos publicados"
  ON public.destinations FOR SELECT
  USING (status = 'published' AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Lectura pública de lugares turísticos" ON public.places;
CREATE POLICY "Lectura pública de lugares turísticos"
  ON public.places FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Modificación de destinos solo para servicio administrativo" ON public.destinations;
CREATE POLICY "Modificación de destinos solo para servicio administrativo"
  ON public.destinations FOR ALL
  USING (auth.role() = 'service_role');

-- 3. POLÍTICAS DE NEGOCIOS
DROP POLICY IF EXISTS "Lectura pública de negocios verificados" ON public.businesses;
CREATE POLICY "Lectura pública de negocios verificados"
  ON public.businesses FOR SELECT
  USING (verified = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Los dueños administran sus propios negocios" ON public.businesses;
CREATE POLICY "Los dueños administran sus propios negocios"
  ON public.businesses FOR ALL
  USING (owner_uid = auth.uid()::text OR auth.role() = 'service_role')
  WITH CHECK (owner_uid = auth.uid()::text OR auth.role() = 'service_role');

-- 4. POLÍTICAS DE RESERVAS
DROP POLICY IF EXISTS "Los usuarios ven únicamente sus propias reservas" ON public.reservations;
CREATE POLICY "Los usuarios ven únicamente sus propias reservas"
  ON public.reservations FOR SELECT
  USING (user_uid = auth.uid()::text OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Creación de reservas para usuario autenticado o backend" ON public.reservations;
CREATE POLICY "Creación de reservas para usuario autenticado o backend"
  ON public.reservations FOR INSERT
  WITH CHECK (user_uid = auth.uid()::text OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Actualización de reservas controlada por backend" ON public.reservations;
CREATE POLICY "Actualización de reservas controlada por backend"
  ON public.reservations FOR UPDATE
  USING (auth.role() = 'service_role');

-- 5. POLÍTICAS DE RESEÑAS
DROP POLICY IF EXISTS "Lectura pública de reseñas publicadas" ON public.reviews;
CREATE POLICY "Lectura pública de reseñas publicadas"
  ON public.reviews FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Usuarios autenticados pueden crear reseñas" ON public.reviews;
CREATE POLICY "Usuarios autenticados pueden crear reseñas"
  ON public.reviews FOR INSERT
  WITH CHECK (user_uid = auth.uid()::text OR auth.role() = 'service_role');

-- 6. POLÍTICAS DE FAVORITOS
DROP POLICY IF EXISTS "Usuarios administran únicamente sus favoritos" ON public.favorites;
CREATE POLICY "Usuarios administran únicamente sus favoritos"
  ON public.favorites FOR ALL
  USING (user_uid = auth.uid()::text OR auth.role() = 'service_role')
  WITH CHECK (user_uid = auth.uid()::text OR auth.role() = 'service_role');

-- 7. POLÍTICAS DE PLANES DE VIAJE
DROP POLICY IF EXISTS "Usuarios ven sus propios planes o públicos" ON public.travel_plans;
CREATE POLICY "Usuarios ven sus propios planes o públicos"
  ON public.travel_plans FOR SELECT
  USING (user_uid = auth.uid()::text OR user_uid IS NULL OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Creación de planes de viaje" ON public.travel_plans;
CREATE POLICY "Creación de planes de viaje"
  ON public.travel_plans FOR INSERT
  WITH CHECK (true);
