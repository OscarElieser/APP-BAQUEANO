-- ============================================================================
-- 🧭 BAQUEANO — TRAZABILIDAD, ESTADO EDITORIAL, SOSTENIBILIDAD Y COMPLETITUD (parte 2/4: Trazabilidad homogénea)
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

-- Nota de aplicación: en producción se aplicó en bloques (traceability_2a…2f) por el
-- límite de 60 s de la herramienta MCP; el resultado es idéntico a este archivo.
-- 2) Trazabilidad homogénea ---------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['businesses','destinations','places','experiences','day_passes','tourism_services',
                           'routes','emergencies','communities','culture','heritage','museums','gastronomy',
                           'music','crafts','festivals','legends','historical_figures','events'] loop
    execute format('alter table public.%I
      add column if not exists source_name text,
      add column if not exists source_url text,
      add column if not exists source_type text,
      add column if not exists retrieved_at timestamptz,
      add column if not exists verified_at timestamptz,
      add column if not exists verified_by uuid references public.profiles(id) on delete set null,
      add column if not exists valid_until date,
      add column if not exists verification_status text not null default %L', t, 'unverified');
    if not exists (select 1 from pg_constraint where conname = t || '_verification_status_check') then
      execute format('alter table public.%I add constraint %I check (verification_status in
        (''unverified'', ''pending_review'', ''verified'', ''rejected'', ''expired''))', t, t || '_verification_status_check');
    end if;
    if not exists (select 1 from pg_constraint where conname = t || '_source_type_check') then
      execute format('alter table public.%I add constraint %I check (source_type is null or source_type in
        (''official_government'', ''field_audit'', ''business_owner'', ''community'', ''internal_database'', ''media'', ''academic'', ''other''))',
        t, t || '_source_type_check');
    end if;
    if not exists (select 1 from pg_constraint where conname = t || '_source_url_check') then
      execute format('alter table public.%I add constraint %I check (source_url is null or source_url ~ ''^https?://[^ ]+$'')',
        t, t || '_source_url_check');
    end if;
    if not exists (select 1 from pg_constraint where conname = t || '_verified_requires_date') then
      execute format('alter table public.%I add constraint %I check (verification_status <> ''verified'' or verified_at is not null) not valid',
        t, t || '_verified_requires_date');
    end if;
    execute format('create index if not exists %I on public.%I (verification_status)', 'idx_' || t || '_verification_status', t);
  end loop;
end $$;

-- Los negocios marcados verified=true conservan su sello: se registra que la
-- verificación es heredada (sin inventar fecha de auditoría de campo).
update public.businesses
set verification_status = 'verified',
    verified_at = coalesce(verified_at, updated_at, created_at, now()),
    source_type = coalesce(source_type, 'internal_database'),
    source_name = coalesce(source_name, 'Registro heredado BAQUEANO: sello previo a la trazabilidad, pendiente de revalidar en campo')
where verified = true and verification_status = 'unverified';

update public.destinations
set verification_status = 'pending_review'
where verification_status = 'unverified' and confidence_status = 'pending';

