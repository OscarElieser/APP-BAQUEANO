-- ============================================================================
-- 🧭 BAQUEANO — TRAZABILIDAD, ESTADO EDITORIAL, SOSTENIBILIDAD Y COMPLETITUD (parte 4/4: Completitud de ficha)
-- ============================================================================
-- 🎯 POR QUÉ (auditoría BD B-2/B-3/B-4/B-8):
--   - 7 destinos publicados sin fuente; negocios sin estado editorial, fuente,
--     verificador ni fecha; cultura/emergencias/experiencias sin trazabilidad
--     homogénea → no se puede distinguir "existe" de "verificado" o "publicado".
--   - No había forma de medir "fichas completas" ni "oferta responsable".
--   - `updated_at` no se mantenía solo en la mayoría de tablas de catálogo.
-- ⚙️ CÓMO (aditivo, idempotente, sin cambiar lecturas públicas existentes):
--   1. `set_updated_at()` — función común reutilizable; se agrega trigger solo
--      a las tablas con `updated_at` que no tenían uno (no se duplican).
--   2. Columnas de trazabilidad homogéneas (nullable) en entidades de contenido:
--      source_name, source_url, source_type, retrieved_at, verified_at,
--      verified_by → profiles, valid_until, verification_status.
--   3. `businesses.status` editorial (draft/pending_review/verified/published/
--      rejected/archived) inicializado desde `verified` (sin cambiar la RLS
--      pública, que sigue exigiendo verified = true).
--   4. `sustainability_attributes` JSONB (objeto) en oferta turística: criterios
--      responsables con estructura flexible y medible (ver DATABASE_DECISIONS).
--   5. Campos faltantes de ficha (negocio, experiencia, day pass, emergencia).
--   6. Vistas `v_business_profile_completion` y `v_verified_businesses`
--      (security_invoker: respetan la RLS de quien consulta).
-- 📦 QUÉ: base medible para KPIs de prestadores, verificación y oferta
--   responsable. No se borra ni renombra nada.
-- ============================================================================

-- 6) Completitud de ficha y negocios verificados ------------------------------
create or replace view public.v_business_profile_completion
with (security_invoker = true) as
select
  b.id as business_id,
  b.name,
  b.status,
  b.department_id,
  (b.name is not null and char_length(btrim(b.name)) >= 3)                          as has_name,
  (coalesce(b.description, b.host_story) is not null)                                as has_description,
  (b.category is not null)                                                           as has_category,
  (b.department_id is not null and b.municipality_id is not null)                    as has_location,
  (b.latitude is not null and b.longitude is not null)                               as has_coordinates,
  (coalesce(b.phone, b.whatsapp, b.email) is not null)                               as has_contact,
  (b.opening_hours is not null)                                                      as has_schedule,
  (b.cover_image is not null)                                                        as has_photo,
  (exists (select 1 from public.tourism_services s where s.business_id = b.id)
    or exists (select 1 from public.experiences e where e.business_id = b.id)
    or exists (select 1 from public.day_passes d where d.business_id = b.id))       as has_services,
  (exists (select 1 from public.tourism_services s where s.business_id = b.id and s.price_kind <> 'on_request')
    or exists (select 1 from public.day_passes d where d.business_id = b.id
               and coalesce(d.price_adult_nio, d.price_usd) is not null))            as has_price_reference,
  (b.source_name is not null)                                                        as has_source,
  (b.verification_status = 'verified')                                               as is_verified
from public.businesses b
where b.deleted_at is null;

comment on view public.v_business_profile_completion is
  'Completitud de ficha de prestador (12 criterios). Ficha completa = los 12 en true. Base del KPI "prestadores con ficha completa".';

create or replace view public.v_business_completion_score
with (security_invoker = true) as
select
  c.*,
  ( c.has_name::int + c.has_description::int + c.has_category::int + c.has_location::int + c.has_coordinates::int
  + c.has_contact::int + c.has_schedule::int + c.has_photo::int + c.has_services::int + c.has_price_reference::int
  + c.has_source::int + c.is_verified::int ) as criteria_met,
  12 as criteria_total,
  round(( c.has_name::int + c.has_description::int + c.has_category::int + c.has_location::int + c.has_coordinates::int
        + c.has_contact::int + c.has_schedule::int + c.has_photo::int + c.has_services::int + c.has_price_reference::int
        + c.has_source::int + c.is_verified::int ) * 100.0 / 12, 1) as profile_completion,
  ( c.has_name and c.has_description and c.has_category and c.has_location and c.has_coordinates and c.has_contact
    and c.has_schedule and c.has_photo and c.has_services and c.has_price_reference and c.has_source and c.is_verified) as is_complete
from public.v_business_profile_completion c;

create or replace view public.v_verified_businesses
with (security_invoker = true) as
select b.id, b.name, b.category, b.department_id, b.municipality_id, b.latitude, b.longitude,
       b.phone, b.whatsapp, b.cover_image, b.hidden_gem, b.day_pass_available, b.verified_at, b.source_name
from public.businesses b
where b.verified and b.deleted_at is null and b.status in ('published', 'verified');

revoke all on public.v_business_profile_completion, public.v_business_completion_score from anon;
grant select on public.v_business_profile_completion, public.v_business_completion_score to authenticated, service_role;
grant select on public.v_verified_businesses to anon, authenticated, service_role;
