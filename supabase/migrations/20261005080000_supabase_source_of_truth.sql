-- ============================================================================
-- 🧭 BAQUEANO — SUPABASE = FUENTE PRINCIPAL DE VERDAD (núcleo de datos)
-- ============================================================================
-- 🎯 POR QUÉ:
--   Directiva del propietario (2026-10-05): todo dato estructurado nace, se
--   actualiza y se consulta en Supabase. Auditoría previa
--   (docs/architecture/SUPABASE_SOURCE_OF_TRUTH.md):
--   - Firestore `appbaqueano` está VACÍO (0 colecciones): no hay datos que migrar
--     desde allí; las escrituras del sitio a Firestore se pierden.
--   - La web publica 266 lugares desde js/territories-data.js; Supabase tiene
--     0 places, 7 destinations y 5 businesses.
--   - `places` existía (0 filas) pero sin departamento, municipio, slug ni
--     estado de publicación, y su RLS permitía leer TODO (using true).
-- ⚙️ CÓMO (aditivo e idempotente; no borra tablas ni datos):
--   1. places: columnas de publicación, territorio (FK a departments y a los 153
--      municipalities existentes), precisión, map_ready, trazabilidad y
--      vínculo con el origen heredado (legacy_source/legacy_key) para importar
--      sin duplicar. RLS pública → solo is_published.
--   2. businesses: slug, business_type, precisión, map_ready, is_published
--      (columna GENERADA desde status: imposible que diverjan) y trazabilidad.
--      RLS pública → solo publicados. Guardia: nadie sin businesses.verify se
--      autoasigna el check azul ni publica (trigger).
--   3. prices (precios dinámicos con checked_at y vigencia) y
--      verification_sources (fuente por entidad con vencimiento → needs_review).
--   4. Rol `editor` y permisos content.* (los roles existentes se reutilizan:
--      emprendedor = business_owner, guia = guide, turista = tourist/user).
--   5. data_migration_runs + data_source_status(): reporte de migración y
--      panel "Estado del sistema de datos" del Ops Center.
--   6. Buckets de Storage por dominio (sin mover archivos existentes).
--   7. public_impact_summary() cuenta places + businesses publicados.
-- 📦 QUÉ: esquema listo para importar los 266 lugares (script
--   website/scripts/migrate-territories-to-supabase.mjs) y para que web, app,
--   Ops Center, BAQUI, mapa, Mi Negocio e Impacto lean el mismo dato.
-- ↩️ ROLLBACK: docs/architecture/SUPABASE_SOURCE_OF_TRUTH.md §Rollback
--   (columnas/tablas nuevas pueden retirarse; datos previos intactos).
-- ⚠️ Depende de 20261005070000_impact_alignment.sql (community_impact, etc.).
-- ============================================================================

-- 1) PLACES ------------------------------------------------------------------
alter table public.places
  add column if not exists slug text,
  add column if not exists subcategory text,
  add column if not exists type_label text,
  add column if not exists icon text,
  add column if not exists department_id text references public.departments(id) on delete set null,
  add column if not exists municipality_id text references public.municipalities(id) on delete set null,
  add column if not exists zone_text text,
  add column if not exists short_description text,
  add column if not exists location_precision text not null default 'missing',
  add column if not exists address text,
  add column if not exists map_ready boolean not null default false,
  add column if not exists is_published boolean not null default false,
  add column if not exists archived_at timestamptz,
  add column if not exists attributes jsonb not null default '{}'::jsonb,
  add column if not exists legacy_source text,
  add column if not exists legacy_key text,
  add column if not exists created_by text,
  add column if not exists updated_by text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'places_slug_format') then
    alter table public.places add constraint places_slug_format check (slug is null or slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'places_location_precision_check') then
    alter table public.places add constraint places_location_precision_check
      check (location_precision in ('exact', 'reference', 'approximate', 'centroid', 'address', 'pending', 'missing'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'places_map_ready_requires_pin') then
    -- "Cómo llegar" solo con pin validado: map_ready exige coordenadas y precisión exacta.
    alter table public.places add constraint places_map_ready_requires_pin
      check (not map_ready or (latitude is not null and longitude is not null and location_precision = 'exact'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'places_coords_in_nicaragua') then
    alter table public.places add constraint places_coords_in_nicaragua
      check ((latitude is null) = (longitude is null)
        and (latitude is null or (latitude between 10.5 and 15.2 and longitude between -88.0 and -82.5)));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'places_archived_not_published') then
    alter table public.places add constraint places_archived_not_published check (not (is_published and archived_at is not null));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'places_attributes_object') then
    alter table public.places add constraint places_attributes_object check (jsonb_typeof(attributes) = 'object' and pg_column_size(attributes) <= 16384);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'places_category_check') then
    alter table public.places add constraint places_category_check check (category is null or category in (
      'playa', 'rio', 'isla', 'cascada', 'laguna', 'lago', 'volcan', 'cerro', 'reserva', 'cueva', 'canon', 'mirador', 'parque',
      'museo', 'sitio_historico', 'centro_cultural', 'mercado', 'turismo_rural', 'turismo_comunitario', 'agroturismo', 'atractivo'));
  end if;
end $$;

-- 'partial' = identidad verificada, ubicación exacta pendiente (catálogos oct 2026).
alter table public.places drop constraint if exists places_verification_status_check;
alter table public.places add constraint places_verification_status_check
  check (verification_status in ('unverified', 'pending_review', 'partial', 'verified', 'rejected', 'expired'));

create unique index if not exists uq_places_slug on public.places (slug) where slug is not null;
create unique index if not exists uq_places_legacy on public.places (legacy_source, legacy_key) where legacy_key is not null;
create index if not exists idx_places_public_map on public.places (department_id, category) where is_published and map_ready;
create index if not exists idx_places_municipality on public.places (municipality_id) where municipality_id is not null;

comment on column public.places.is_published is 'Visible al público (RLS). Publicar/despublicar/archivar se hace en Ops Center.';
comment on column public.places.map_ready is 'Pin validado: habilita marcador y "Cómo llegar". Exige lat/lng y precisión exact (CHECK).';
comment on column public.places.legacy_key is 'Clave estable del registro en territories-data.js (territorio + nombre normalizado). Evita duplicar al reimportar.';
comment on column public.places.zone_text is 'Municipio o zona tal como lo trae la fuente cuando no se pudo enlazar con municipalities (no se inventa el enlace).';

drop policy if exists "Lectura pública de lugares turísticos" on public.places;
drop policy if exists "Lectura pública de lugares publicados" on public.places;
create policy "Lectura pública de lugares publicados" on public.places for select to anon, authenticated using (is_published);
revoke insert, update, delete, truncate on public.places from anon, authenticated;

-- 2) BUSINESSES --------------------------------------------------------------
alter table public.businesses
  add column if not exists slug text,
  add column if not exists business_type text,
  add column if not exists location_precision text not null default 'missing',
  add column if not exists map_ready boolean not null default false,
  add column if not exists attributes jsonb not null default '{}'::jsonb,
  add column if not exists legacy_source text,
  add column if not exists legacy_key text,
  add column if not exists created_by text,
  add column if not exists updated_by text;
alter table public.businesses
  add column if not exists is_published boolean generated always as (status = 'published' and deleted_at is null) stored;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'businesses_slug_format') then
    alter table public.businesses add constraint businesses_slug_format check (slug is null or slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'businesses_business_type_check') then
    alter table public.businesses add constraint businesses_business_type_check check (business_type is null or business_type in (
      'restaurante', 'comedor', 'kiosco', 'hotel', 'hostal', 'ecolodge', 'resort', 'cabana', 'casa_arbol', 'guia', 'artesano', 'cooperativa',
      'cafe', 'bar', 'transporte', 'tour_operador', 'finca', 'emprendimiento', 'hospedaje'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'businesses_location_precision_check') then
    alter table public.businesses add constraint businesses_location_precision_check
      check (location_precision in ('exact', 'reference', 'approximate', 'centroid', 'address', 'pending', 'missing'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'businesses_map_ready_requires_pin') then
    alter table public.businesses add constraint businesses_map_ready_requires_pin
      check (not map_ready or (latitude is not null and longitude is not null and location_precision = 'exact'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'businesses_attributes_object') then
    alter table public.businesses add constraint businesses_attributes_object check (jsonb_typeof(attributes) = 'object' and pg_column_size(attributes) <= 16384);
  end if;
end $$;

alter table public.businesses drop constraint if exists businesses_verification_status_check;
alter table public.businesses add constraint businesses_verification_status_check
  check (verification_status in ('unverified', 'pending_review', 'partial', 'verified', 'rejected', 'expired'));

create unique index if not exists uq_businesses_slug on public.businesses (slug) where slug is not null;
create unique index if not exists uq_businesses_legacy on public.businesses (legacy_source, legacy_key) where legacy_key is not null;
create index if not exists idx_businesses_public_map on public.businesses (department_id, business_type) where status = 'published' and deleted_at is null and map_ready;

comment on column public.businesses.is_published is 'Generada: status = published y sin borrado lógico. Fuente única del estado público.';

-- Público: solo publicados (antes: verified = true, que podía mostrar fichas no publicadas).
drop policy if exists "Lectura pública de negocios verificados" on public.businesses;
drop policy if exists "Lectura pública de negocios publicados" on public.businesses;
create policy "Lectura pública de negocios publicados" on public.businesses for select to anon, authenticated using (status = 'published' and deleted_at is null);

-- Guardia del check azul: un emprendedor edita su ficha (RLS is_business_manager)
-- pero no puede verificarla, publicarla ni tocar la trazabilidad de verificación.
create or replace function public.guard_business_verification()
returns trigger language plpgsql set search_path = '' as $$
declare
  v_role text := coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', '');
begin
  if v_role = 'service_role' or current_user in ('postgres', 'service_role', 'supabase_admin') then return new; end if;
  if public.has_permission('businesses.verify') then return new; end if;
  if tg_op = 'INSERT' then
    if new.verified or new.verification_status in ('verified', 'partial') or new.status not in ('draft', 'pending_review') then
      raise exception 'Solo el equipo BAQUEANO puede verificar o publicar un negocio.' using errcode = '42501';
    end if;
    return new;
  end if;
  if new.verified is distinct from old.verified
     or new.verification_status is distinct from old.verification_status
     or new.verified_at is distinct from old.verified_at
     or new.verified_by is distinct from old.verified_by
     or new.status is distinct from old.status
     or new.map_ready is distinct from old.map_ready
     or new.protagonist_verified_at is distinct from old.protagonist_verified_at
     or new.owner_uid is distinct from old.owner_uid then
    raise exception 'Solo el equipo BAQUEANO puede verificar, publicar o cambiar el titular de un negocio.' using errcode = '42501';
  end if;
  return new;
end $$;
drop trigger if exists trg_guard_business_verification on public.businesses;
create trigger trg_guard_business_verification before insert or update on public.businesses
  for each row execute function public.guard_business_verification();

-- 3) PRECIOS DINÁMICOS -------------------------------------------------------
create table if not exists public.prices (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('place', 'business', 'experience', 'route', 'tourism_service', 'destination')),
  entity_id text not null check (char_length(entity_id) between 1 and 160),
  product_name text not null check (char_length(product_name) between 2 and 200),
  amount numeric(12, 2) check (amount is null or amount >= 0),
  amount_max numeric(12, 2) check (amount_max is null or amount_max >= 0),
  currency text not null default 'NIO' check (currency in ('NIO', 'USD')),
  price_type text not null check (price_type in ('fixed', 'from', 'range', 'per_person', 'per_night', 'per_day', 'entry', 'free', 'other')),
  valid_from date,
  valid_until date,
  source_name text,
  source_url text check (source_url is null or source_url ~ '^https?://[^ ]+$'),
  checked_at timestamptz not null,
  is_active boolean not null default true,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (amount_max is null or amount is null or amount_max >= amount),
  check (valid_until is null or valid_from is null or valid_until >= valid_from),
  check (price_type = 'free' or amount is not null)
);
create index if not exists idx_prices_entity on public.prices (entity_type, entity_id) where is_active;
comment on table public.prices is 'Precios dinámicos con fecha de revisión. Places/businesses NO guardan precios permanentes. Sin fila vigente: "Precio por confirmar".';

-- 4) FUENTES DE VERIFICACIÓN POR ENTIDAD ------------------------------------
create table if not exists public.verification_sources (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('place', 'business', 'destination', 'experience', 'route', 'emergency', 'culture', 'price', 'municipality')),
  entity_id text not null check (char_length(entity_id) between 1 and 160),
  source_name text not null check (char_length(source_name) between 2 and 300),
  source_url text check (source_url is null or source_url ~ '^https?://[^ ]+$'),
  source_type text not null check (source_type in ('official', 'business_official', 'government', 'osm', 'wikidata', 'manual_verified', 'media', 'community', 'directory')),
  verified_at timestamptz not null,
  expires_at timestamptz,
  verified_by text,
  status text not null default 'active' check (status in ('active', 'needs_review', 'retired')),
  notes text check (notes is null or char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  unique (entity_type, entity_id, source_name, source_url)
);
create index if not exists idx_verification_sources_entity on public.verification_sources (entity_type, entity_id);
create index if not exists idx_verification_sources_expiry on public.verification_sources (expires_at) where status = 'active';
comment on table public.verification_sources is 'Fuente de cada dato verificado (oficial, sitio del negocio, OSM, Wikidata, verificación manual). Vencida ⇒ needs_review.';

create or replace function public.refresh_source_expiry()
returns integer language plpgsql security definer set search_path = '' as $$
declare v int;
begin
  update public.verification_sources set status = 'needs_review' where status = 'active' and expires_at is not null and expires_at < now();
  get diagnostics v = row_count;
  return v;
end $$;
revoke all on function public.refresh_source_expiry() from public, anon, authenticated;
grant execute on function public.refresh_source_expiry() to service_role;

-- 5) REPORTE DE MIGRACIÓN ----------------------------------------------------
create table if not exists public.data_migration_runs (
  id uuid primary key default gen_random_uuid(),
  run_key text not null unique,
  source text not null,
  mode text not null check (mode in ('dry_run', 'apply')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  totals jsonb not null default '{}'::jsonb,
  status text not null default 'running' check (status in ('running', 'ok', 'failed')),
  notes text
);
comment on table public.data_migration_runs is 'Cada corrida del importador (territories-data.js → places/businesses) con totales que deben cuadrar.';

-- RLS de tablas nuevas: lectura pública solo de lo vigente; escritura solo servidor.
do $$
declare t text;
begin
  foreach t in array array['prices', 'verification_sources', 'data_migration_runs'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from public, anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end $$;
grant select on public.prices, public.verification_sources to anon, authenticated;
drop policy if exists "Lectura pública de precios vigentes" on public.prices;
create policy "Lectura pública de precios vigentes" on public.prices for select to anon, authenticated
  using (is_active and (valid_until is null or valid_until >= current_date));
drop policy if exists "Lectura pública de fuentes activas" on public.verification_sources;
create policy "Lectura pública de fuentes activas" on public.verification_sources for select to anon, authenticated using (status = 'active');
create or replace trigger trg_prices_updated before update on public.prices for each row execute function public.set_updated_at();

-- 6) ROLES Y PERMISOS (reutiliza el RBAC existente) -------------------------
insert into public.roles (id, name, description, rank, is_staff) values
  ('editor', 'Editor', 'Crea y edita contenido territorial (lugares, cultura, precios) en Ops Center; no verifica ni publica.', 40, true)
on conflict (id) do nothing;
insert into public.permissions (id, description, critical) values
  ('content.read', 'Leer contenido territorial en borrador', false),
  ('content.manage', 'Crear y editar lugares, cultura, rutas y precios', false),
  ('content.publish', 'Publicar, despublicar y archivar contenido', true),
  ('content.verify', 'Verificar contenido y sus fuentes', true)
on conflict (id) do nothing;
insert into public.role_permissions (role_id, permission_id)
select r, p from (values
  ('editor', 'content.read'), ('editor', 'content.manage'),
  ('auditor', 'content.read'),
  ('admin', 'content.read'), ('admin', 'content.manage'), ('admin', 'content.publish'), ('admin', 'content.verify'),
  ('superadmin', 'content.read'), ('superadmin', 'content.manage'), ('superadmin', 'content.publish'), ('superadmin', 'content.verify')
) v(r, p)
on conflict do nothing;

-- 7) STORAGE: buckets por dominio (migración progresiva; nada se mueve) -------
-- Públicos: lectura por URL pública. Escritura: solo Edge Functions (service_role),
-- porque no hay políticas INSERT/UPDATE para anon/authenticated en storage.objects.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('places', 'places', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('businesses', 'businesses', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('culture', 'culture', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/ogg']),
  ('experiences', 'experiences', true, 15728640, array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']),
  ('users', 'users', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('evidence', 'evidence', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;

-- 8) ESTADO DEL SISTEMA DE DATOS (Ops Center) --------------------------------
create or replace function public.data_source_status()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_role text := coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', '');
  v_last jsonb;
begin
  if v_role <> 'service_role' and current_user not in ('postgres', 'service_role')
     and not public.has_permission('analytics.read') and not public.has_permission('content.read') then
    raise exception 'sin permiso' using errcode = '42501';
  end if;
  select to_jsonb(r) - 'notes' into v_last from public.data_migration_runs r where r.mode = 'apply' order by r.started_at desc limit 1;
  return jsonb_build_object(
    'generated_at', now(),
    'primary_data_source', 'SUPABASE',
    'firestore', 'LEGACY',
    'places', jsonb_build_object(
      'total', (select count(*) from public.places),
      'published', (select count(*) from public.places where is_published),
      'map_ready', (select count(*) from public.places where map_ready),
      'verified', (select count(*) from public.places where verification_status = 'verified'),
      'partial', (select count(*) from public.places where verification_status = 'partial'),
      'pending', (select count(*) from public.places where verification_status in ('unverified', 'pending_review')),
      'expired', (select count(*) from public.places where verification_status = 'expired' or (valid_until is not null and valid_until < current_date)),
      'without_coordinates', (select count(*) from public.places where latitude is null),
      'without_municipality', (select count(*) from public.places where municipality_id is null),
      'migrated_from_static', (select count(*) from public.places where legacy_source = 'territories-data.js')),
    'businesses', jsonb_build_object(
      'total', (select count(*) from public.businesses where deleted_at is null),
      'published', (select count(*) from public.businesses where status = 'published' and deleted_at is null),
      'map_ready', (select count(*) from public.businesses where map_ready and deleted_at is null),
      'verified', (select count(*) from public.businesses where verification_status = 'verified' and deleted_at is null),
      'partial', (select count(*) from public.businesses where verification_status = 'partial' and deleted_at is null),
      'pending', (select count(*) from public.businesses where verification_status in ('unverified', 'pending_review') and deleted_at is null),
      'expired', (select count(*) from public.businesses where (verification_status = 'expired' or (valid_until is not null and valid_until < current_date)) and deleted_at is null),
      'without_source', (select count(*) from public.businesses where source_url is null and deleted_at is null),
      'migrated_from_static', (select count(*) from public.businesses where legacy_source = 'territories-data.js')),
    'sources', jsonb_build_object(
      'active', (select count(*) from public.verification_sources where status = 'active'),
      'needs_review', (select count(*) from public.verification_sources where status = 'needs_review' or (expires_at is not null and expires_at < now()))),
    'prices_active', (select count(*) from public.prices where is_active and (valid_until is null or valid_until >= current_date)),
    'last_migration', v_last
  );
end $$;
revoke all on function public.data_source_status() from public, anon;
grant execute on function public.data_source_status() to authenticated, service_role;

-- 9) IMPACTO: cuenta places + businesses (redefine la versión de 20261005070000) --
create or replace function public.public_impact_summary()
returns jsonb language sql stable security definer set search_path = '' as $$
  with content as (
    select municipality_id, department_id from public.places where is_published
    union all select municipality_id, department_id from public.destinations where status = 'published' and deleted_at is null
    union all select municipality_id, department_id from public.businesses where status = 'published' and deleted_at is null
    union all select municipality_id, department_id from public.experiences where status = 'published'
    union all select municipality_id, department_id from public.communities where status = 'published'
  ), cov as (
    select count(distinct municipality_id) muni, count(distinct department_id) dep from content
  )
  select jsonb_build_object(
    'generated_at', now(),
    'source', 'Supabase · public_impact_summary()',
    'lugares_publicados', (select count(*) from public.places where is_published),
    'lugares_verificados', (select count(*) from public.places where is_published and verification_status = 'verified'),
    'destinos_publicados', (select count(*) from public.places where is_published) + (select count(*) from public.destinations where status = 'published' and deleted_at is null),
    'destinos_verificados', (select count(*) from public.places where is_published and verification_status = 'verified')
        + (select count(*) from public.destinations where status = 'published' and deleted_at is null and verification_status = 'verified'),
    'negocios_locales', (select count(*) from public.businesses where status = 'published' and deleted_at is null),
    'negocios_verificados', (select count(*) from public.businesses where status = 'published' and deleted_at is null and verification_status = 'verified'),
    'experiencias_publicadas', (select count(*) from public.experiences where status = 'published'),
    'experiencias_comunitarias', (select count(*) from public.community_impact where badge_status = 'verified' and (valid_until is null or valid_until >= current_date)),
    'rutas_creadas', (select count(*) from public.routes where status = 'published'),
    'itinerarios_generados', (select count(*) from public.travel_plans),
    'consultas_baqui', (select count(*) from public.ai_messages where role = 'user'),
    'practicas_sostenibles_verificadas', (select count(*) from public.sustainability_practices where evidence_status = 'verified_baqueano'),
    'departamentos_catalogados', (select count(*) from public.departments),
    'departamentos_con_contenido', (select dep from cov),
    'municipios_catalogados', (select count(*) from public.municipalities),
    'municipios_con_contenido', (select muni from cov),
    'cobertura_territorial_baqueano', (select case when (select count(*) from public.municipalities) > 0
        then round((select muni from cov) * 100.0 / (select count(*) from public.municipalities), 1) end),
    'alineaciones_vigentes', (select count(*) from public.national_alignment where status = 'active' and verification_expiry >= current_date)
  );
$$;
revoke all on function public.public_impact_summary() from public;
grant execute on function public.public_impact_summary() to anon, authenticated, service_role;
