-- ============================================================================
-- 🧭 BAQUEANO — TRAZABILIDAD, ESTADO EDITORIAL, SOSTENIBILIDAD Y COMPLETITUD (parte 3/4: Estado editorial de negocios)
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

-- 3) Estado editorial de negocios --------------------------------------------
alter table public.businesses add column if not exists status text;
update public.businesses
set status = case when deleted_at is not null then 'archived' when verified then 'published' else 'pending_review' end
where status is null;
alter table public.businesses alter column status set default 'draft';
alter table public.businesses alter column status set not null;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'businesses_status_check') then
    alter table public.businesses add constraint businesses_status_check
      check (status in ('draft', 'pending_review', 'verified', 'published', 'rejected', 'archived'));
  end if;
end $$;
create index if not exists idx_businesses_status on public.businesses (status);

-- 4) Sostenibilidad -----------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['businesses','experiences','day_passes','routes','tourism_services'] loop
    execute format('alter table public.%I add column if not exists sustainability_attributes jsonb not null default ''{}''::jsonb', t);
    if not exists (select 1 from pg_constraint where conname = t || '_sustainability_object') then
      execute format('alter table public.%I add constraint %I check (jsonb_typeof(sustainability_attributes) = ''object'')',
        t, t || '_sustainability_object');
    end if;
  end loop;
end $$;

comment on column public.businesses.sustainability_attributes is
  'Criterios responsables verificables (booleanos o texto breve): local_economy_support, community_participation, environmental_practices, waste_management, conservation, accessibility, capacity_limit, environmental_restrictions.';

-- 5) Campos de ficha faltantes -----------------------------------------------
alter table public.businesses
  add column if not exists description text,
  add column if not exists email text,
  add column if not exists website_url text,
  add column if not exists opening_hours jsonb;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'businesses_email_check') then
    alter table public.businesses add constraint businesses_email_check
      check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[a-z]{2,}$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'businesses_website_url_check') then
    alter table public.businesses add constraint businesses_website_url_check
      check (website_url is null or website_url ~ '^https?://[^ ]+$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'businesses_coords_pair') then
    alter table public.businesses add constraint businesses_coords_pair
      check ((latitude is null) = (longitude is null)
        and (latitude is null or (latitude between 10.5 and 15.2 and longitude between -88.0 and -82.5))) not valid;
  end if;
end $$;

alter table public.experiences
  add column if not exists description text,
  add column if not exists requirements text,
  add column if not exists not_included text[];

alter table public.day_passes
  add column if not exists restrictions text,
  add column if not exists contact_phone text;

alter table public.emergencies
  add column if not exists address_reference text,
  add column if not exists updated_at timestamptz not null default now();
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'emergencies_service_type_check') then
    alter table public.emergencies add constraint emergencies_service_type_check
      check (service_type in ('police', 'hospital', 'health_center', 'firefighters', 'ambulance', 'red_cross', 'other'));
  end if;
end $$;
create or replace trigger trg_emergencies_updated_at before update on public.emergencies
  for each row execute function public.set_updated_at();

