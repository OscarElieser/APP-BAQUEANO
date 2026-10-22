-- ============================================================================
-- 🧭 BAQUEANO — MÓDULO AMBIENTAL MAESTRO (MARENA → Supabase → web/app/BAQUI)
-- ============================================================================
-- 🎯 POR QUÉ:
--   Mandato del propietario (2026-10-05): una base ambiental única, trazable y
--   verificable. "Ningún contenido ambiental podrá marcarse como verificado o
--   publicarse con check BAQUEANO si no existe evidencia trazable de la fuente
--   oficial o validación documentada correspondiente" (AGENTS.md regla 10).
--   "Cómo llegar" solo con un punto de acceso validado; el centroide de una
--   reserva nunca es una entrada turística.
--   Auditoría previa (docs/architecture/MARENA_ENVIRONMENTAL_MODULE.md): no existe
--   ninguna tabla ambiental; `places` ya trae publicación, map_ready, coordenadas
--   acotadas a Nicaragua y trazabilidad; `verification_sources` ya guarda la
--   fuente por entidad. Se REUTILIZAN; no se crea una tabla de destinos paralela.
-- ⚙️ CÓMO (aditivo e idempotente; no borra tablas, columnas ni datos):
--   1. places: categorías naturales nuevas + place_type (zoocriadero ≠ destino).
--   2. verification_sources: nuevos tipos de entidad y de fuente + metadatos del
--      documento (institución, título, fecha). Es la tabla `environmental_sources`
--      del mandato: no se duplica.
--   3. Tablas satélite de places: protected_area_details (incluye Ramsar y
--      ownership_type), management_plans, biodiversity_records, visitor_rules,
--      access_points, biosphere_reserves (+ vínculo N:M), environmental_regulations,
--      wildlife_restrictions. Estados: verified|partial|pending|expired|conflicting|rejected.
--   4. CHECKs de honestidad: verified exige fuente y fecha; Ramsar/biosfera exigen
--      fuente; un acceso map_ready exige coordenadas; vedas con fechas coherentes.
--   5. Guardias (triggers): solo content.verify verifica y solo content.publish
--      publica; un área protegida no se publica sin el mínimo de la Fase 18.
--   6. RLS: público lee solo lo publicado/verificado; escritura solo servidor
--      (Edge Functions / service_role) — no hay escritura pública directa.
--   7. Vistas y funciones: place_navigation (¿se habilita "Cómo llegar"?),
--      environmental_dashboard() (Ops Center, Fase 27) y
--      refresh_environmental_verification_status() (Fase 32: solo cambia estados).
-- 📦 QUÉ: esquema listo para los importadores website/scripts/import-marena-*.mjs.
-- ↩️ ROLLBACK: docs/architecture/MARENA_ENVIRONMENTAL_MODULE.md §Rollback.
-- ⚠️ Depende de 20261005080000_supabase_source_of_truth.sql (places, businesses,
--    verification_sources, permisos content.*). NO aplicar en producción sin
--    autorización expresa del propietario.
-- ============================================================================

-- 1) PLACES: categorías naturales y tipo de lugar ------------------------------
alter table public.places drop constraint if exists places_category_check;
alter table public.places add constraint places_category_check check (category is null or category in (
  'playa', 'rio', 'isla', 'cascada', 'laguna', 'lago', 'volcan', 'cerro', 'reserva', 'cueva', 'canon', 'mirador', 'parque',
  'museo', 'sitio_historico', 'centro_cultural', 'mercado', 'turismo_rural', 'turismo_comunitario', 'agroturismo', 'atractivo',
  -- Fase 2 (MARENA): patrimonio natural
  'area_protegida', 'humedal', 'manglar', 'bosque', 'centro_ecoturistico', 'zoocriadero'));

alter table public.places add column if not exists place_type text;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'places_place_type_check') then
    alter table public.places add constraint places_place_type_check check (place_type is null or place_type in (
      'tourist_attraction', 'protected_area', 'natural_feature', 'ecotourism_center', 'wildlife_breeding_center', 'other'));
  end if;
end $$;
comment on column public.places.place_type is 'Fase 12: un zoocriadero (wildlife_breeding_center) NO es destino por defecto; solo se publica con evidencia de atención a visitantes.';

-- 2) FUENTES: verification_sources = environmental_sources ---------------------
alter table public.verification_sources drop constraint if exists verification_sources_entity_type_check;
alter table public.verification_sources add constraint verification_sources_entity_type_check check (entity_type in (
  'place', 'business', 'destination', 'experience', 'route', 'emergency', 'culture', 'price', 'municipality',
  'protected_area', 'management_plan', 'biodiversity_record', 'visitor_rule', 'access_point', 'biosphere_reserve',
  'environmental_regulation', 'wildlife_restriction'));
alter table public.verification_sources drop constraint if exists verification_sources_source_type_check;
alter table public.verification_sources add constraint verification_sources_source_type_check check (source_type in (
  'official', 'business_official', 'government', 'osm', 'wikidata', 'manual_verified', 'media', 'community', 'directory',
  'management_plan', 'regulation', 'government_map', 'international_official'));
alter table public.verification_sources drop constraint if exists verification_sources_status_check;
alter table public.verification_sources add constraint verification_sources_status_check
  check (status in ('active', 'needs_review', 'expired', 'conflicting', 'retired'));
alter table public.verification_sources
  add column if not exists institution text check (institution is null or char_length(institution) <= 200),
  add column if not exists document_title text check (document_title is null or char_length(document_title) <= 500),
  add column if not exists document_date date,
  add column if not exists retrieved_at timestamptz;
comment on column public.verification_sources.document_date is 'Fecha del documento fuente (no la de consulta): permite no confundir una fuente 2023 con una 2025 (Fase 30).';

-- Dominios compartidos --------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'env_verification_status') then
    create type public.env_verification_status as enum ('verified', 'partial', 'pending', 'expired', 'conflicting', 'rejected');
  end if;
end $$;

-- 3) ÁREAS PROTEGIDAS (Fases 4, 9, 11) ----------------------------------------
create table if not exists public.protected_area_details (
  id uuid primary key default gen_random_uuid(),
  place_id text not null unique references public.places(id) on delete cascade,
  official_name text check (official_name is null or char_length(official_name) between 3 and 300),
  official_name_as_published text check (official_name_as_published is null or char_length(official_name_as_published) <= 300),
  official_category text check (official_category is null or official_category in (
    'parque_nacional', 'reserva_natural', 'reserva_biologica', 'refugio_vida_silvestre', 'monumento_nacional', 'monumento_historico',
    'reserva_recursos_geneticos', 'paisaje_terrestre_protegido', 'reserva_biosfera', 'humedal', 'parque_ecologico_municipal',
    'reserva_silvestre_privada', 'otra')),
  -- Marco legal vigente citado por la R.M. 016-2026: Ley 1248 (SINACADS). El estado se registra tal cual lo diga la fuente.
  sinap_status text check (sinap_status is null or sinap_status in ('declared', 'not_declared', 'unknown')),
  legal_framework text check (legal_framework is null or char_length(legal_framework) <= 300),
  biosphere_reserve boolean not null default false,
  ramsar_site boolean not null default false,
  ramsar_name text,
  ramsar_code text check (ramsar_code is null or ramsar_code ~ '^[0-9]{1,5}$'),
  ramsar_source_url text check (ramsar_source_url is null or ramsar_source_url ~ '^https://[^ ]+$'),
  wetland_type text check (wetland_type is null or char_length(wetland_type) <= 120),
  private_reserve boolean not null default false,
  municipal_park boolean not null default false,
  ecotourism_center boolean not null default false,
  ownership_type text not null default 'unknown' check (ownership_type in ('public', 'private_reserve', 'municipal', 'community', 'mixed', 'unknown')),
  department_id text references public.departments(id) on delete set null,
  municipality_id text references public.municipalities(id) on delete set null,
  territorial_scope_text text check (territorial_scope_text is null or char_length(territorial_scope_text) <= 500),
  area_hectares numeric(12, 2) check (area_hectares is null or area_hectares > 0),
  area_source_date date,
  buffer_zone text check (buffer_zone is null or char_length(buffer_zone) <= 2000),
  managing_authority text check (managing_authority is null or char_length(managing_authority) <= 300),
  official_description text check (official_description is null or char_length(official_description) <= 4000),
  legal_reference text check (legal_reference is null or char_length(legal_reference) <= 500),
  source_url text check (source_url is null or source_url ~ '^https://[^ ]+$'),
  verified_at timestamptz,
  verification_status public.env_verification_status not null default 'pending',
  notes text check (notes is null or char_length(notes) <= 2000),
  created_by text, updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pad_verified_needs_source check (verification_status <> 'verified' or (source_url is not null and verified_at is not null and official_name is not null and official_category is not null)),
  constraint pad_ramsar_needs_source check (not ramsar_site or ramsar_source_url is not null),
  constraint pad_area_needs_date check (area_hectares is null or area_source_date is not null),
  constraint pad_private_matches_ownership check (not private_reserve or ownership_type in ('private_reserve', 'mixed'))
);
comment on table public.protected_area_details is 'Ficha legal de un área protegida (1:1 con places). Sin dato confirmado → NULL. area_hectares solo con fecha de la fuente.';

-- 4) PLANES DE MANEJO (Fase 5) ------------------------------------------------
create table if not exists public.management_plans (
  id uuid primary key default gen_random_uuid(),
  place_id text references public.places(id) on delete set null,
  area_key text not null check (area_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 5 and 300),
  title_as_published text check (title_as_published is null or char_length(title_as_published) <= 300),
  document_url text check (document_url is null or document_url ~ '^https://[^ ]+$'),
  document_qr_url text check (document_qr_url is null or document_qr_url ~ '^https://[^ ]+$'),
  approval_reference text check (approval_reference is null or char_length(approval_reference) <= 200),
  gazette_reference text check (gazette_reference is null or char_length(gazette_reference) <= 200),
  gazette_url text check (gazette_url is null or gazette_url ~ '^https://[^ ]+$'),
  document_date date,
  valid_from date,
  valid_to date,
  zoning_summary text check (zoning_summary is null or char_length(zoning_summary) <= 3000),
  buffer_zone_summary text check (buffer_zone_summary is null or char_length(buffer_zone_summary) <= 3000),
  tourism_rules_summary text check (tourism_rules_summary is null or char_length(tourism_rules_summary) <= 3000),
  conservation_rules_summary text check (conservation_rules_summary is null or char_length(conservation_rules_summary) <= 3000),
  source_name text not null,
  source_url text not null check (source_url ~ '^https://[^ ]+$'),
  verified_at timestamptz,
  status public.env_verification_status not null default 'pending',
  notes text check (notes is null or char_length(notes) <= 2000),
  created_by text, updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (area_key, source_url),
  check (valid_to is null or valid_from is null or valid_to >= valid_from),
  constraint mp_verified_needs_evidence check (status <> 'verified' or (verified_at is not null and (document_url is not null or gazette_url is not null)))
);
comment on table public.management_plans is 'Plan de manejo oficial (MARENA). Solo resúmenes de lo relevante para el visitante; nunca el documento completo.';

-- 5) BIODIVERSIDAD (Fase 6) ---------------------------------------------------
create table if not exists public.biodiversity_records (
  id uuid primary key default gen_random_uuid(),
  place_id text not null references public.places(id) on delete cascade,
  ecosystem_type text check (ecosystem_type is null or char_length(ecosystem_type) <= 200),
  species_name text check (species_name is null or char_length(species_name) <= 200),
  species_type text check (species_type is null or species_type in ('flora', 'fauna', 'fungi', 'ecosystem', 'other')),
  flora_summary text check (flora_summary is null or char_length(flora_summary) <= 2000),
  fauna_summary text check (fauna_summary is null or char_length(fauna_summary) <= 2000),
  conservation_note text check (conservation_note is null or char_length(conservation_note) <= 2000),
  is_historical_record boolean not null default true,
  source_url text not null check (source_url ~ '^https://[^ ]+$'),
  source_date date not null,
  verified_at timestamptz,
  status public.env_verification_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on column public.biodiversity_records.is_historical_record is 'Fase 6: por defecto el registro NO afirma presencia actual; se muestra "registrado en <source_date>".';

-- 6) REGLAS PARA VISITANTES (Fase 7) ------------------------------------------
create table if not exists public.visitor_rules (
  id uuid primary key default gen_random_uuid(),
  place_id text not null references public.places(id) on delete cascade,
  rule_type text not null check (rule_type in ('hiking', 'camping', 'swimming', 'fishing', 'wildlife_observation', 'night_access', 'vehicle_access',
    'fire', 'waste', 'drone', 'boat_access', 'pets', 'other')),
  description text not null check (char_length(description) between 5 and 2000),
  allowed boolean,                        -- NULL = la fuente no lo dice (no se infiere)
  requires_authorization boolean,
  requires_guide boolean,
  seasonal boolean,
  valid_from date,
  valid_until date,
  source_url text not null check (source_url ~ '^https://[^ ]+$'),
  verified_at timestamptz,
  status public.env_verification_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (valid_until is null or valid_from is null or valid_until >= valid_from)
);
comment on column public.visitor_rules.allowed is 'NULL = sin dato oficial. BAQUI responde "No tengo una autorización vigente verificada" (Fase 24).';

-- 7) PUNTOS DE ACCESO (Fase 8) ------------------------------------------------
create table if not exists public.access_points (
  id uuid primary key default gen_random_uuid(),
  place_id text not null references public.places(id) on delete cascade,
  name text not null check (char_length(name) between 3 and 200),
  latitude double precision,
  longitude double precision,
  access_type text not null check (access_type in ('entrance', 'visitor_center', 'dock', 'trailhead', 'ranger_station', 'parking', 'other')),
  road_condition text check (road_condition is null or char_length(road_condition) <= 300),
  requires_guide boolean,
  visitor_center boolean not null default false,
  dock boolean not null default false,
  trailhead boolean not null default false,
  source_url text not null check (source_url ~ '^https://[^ ]+$'),
  verified_at timestamptz,
  status public.env_verification_status not null default 'pending',
  map_ready boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ap_coords_in_nicaragua check ((latitude is null) = (longitude is null)
    and (latitude is null or (latitude between 10.5 and 15.2 and longitude between -88.0 and -82.5))),
  constraint ap_map_ready_requires_verified_pin check (not map_ready or (latitude is not null and status = 'verified' and verified_at is not null))
);
comment on table public.access_points is 'Entrada, centro de visitantes, muelle o sendero VERIFICADO. "Cómo llegar" de un área protegida usa esto, nunca el centroide.';

-- 8) RESERVAS DE BIOSFERA (Fase 10) -------------------------------------------
create table if not exists public.biosphere_reserves (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 3 and 200),
  unesco_status text not null default 'unconfirmed' check (unesco_status in ('designated', 'unconfirmed', 'withdrawn')),
  departments text[] not null default '{}',
  municipalities text[] not null default '{}',
  core_zone text check (core_zone is null or char_length(core_zone) <= 2000),
  buffer_zone text check (buffer_zone is null or char_length(buffer_zone) <= 2000),
  transition_zone text check (transition_zone is null or char_length(transition_zone) <= 2000),
  source_url text check (source_url is null or source_url ~ '^https://[^ ]+$'),
  verified_at timestamptz,
  status public.env_verification_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint br_designated_needs_source check (unesco_status <> 'designated' or (source_url is not null and verified_at is not null))
);
create table if not exists public.biosphere_reserve_places (
  biosphere_reserve_id uuid not null references public.biosphere_reserves(id) on delete cascade,
  place_id text not null references public.places(id) on delete cascade,
  zone text check (zone is null or zone in ('core', 'buffer', 'transition', 'unknown')),
  primary key (biosphere_reserve_id, place_id)
);

-- 9) NORMATIVAS (Fase 14) -----------------------------------------------------
create table if not exists public.environmental_regulations (
  id uuid primary key default gen_random_uuid(),
  regulation_key text not null unique check (regulation_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 5 and 500),
  document_type text not null check (document_type in ('ley', 'decreto', 'resolucion_ministerial', 'acuerdo_ministerial', 'norma_tecnica', 'procedimiento', 'otro')),
  institution text not null,
  publication_reference text check (publication_reference is null or char_length(publication_reference) <= 300),
  publication_date date,
  effective_date date,
  source_url text check (source_url is null or source_url ~ '^https://[^ ]+$'),
  applies_to text check (applies_to is null or char_length(applies_to) <= 1000),
  summary text check (summary is null or char_length(summary) <= 3000),
  superseded_by text references public.environmental_regulations(regulation_key) on delete set null,
  verified_at timestamptz,
  status public.env_verification_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint er_verified_needs_source check (status <> 'verified' or (source_url is not null and verified_at is not null))
);
comment on table public.environmental_regulations is 'Normativa ambiental. No es interpretación legal: la interfaz muestra "Esta actividad puede estar sujeta a regulación. Consultar autoridad competente."';

-- 10) VEDAS (Fase 15) ---------------------------------------------------------
create table if not exists public.wildlife_restrictions (
  id uuid primary key default gen_random_uuid(),
  regulation_key text not null references public.environmental_regulations(regulation_key) on delete restrict,
  year integer not null check (year between 1999 and 2100),
  species_group text not null check (species_group in ('mamiferos', 'aves', 'reptiles', 'anfibios', 'peces', 'moluscos', 'crustaceos', 'equinodermos', 'flora')),
  species_name text not null check (char_length(species_name) between 2 and 300),
  common_name text check (common_name is null or char_length(common_name) <= 300),
  restriction_type text not null check (restriction_type in ('indefinite', 'partial')),
  period_text text not null check (char_length(period_text) between 3 and 1500),
  start_date date,
  end_date date,
  note text check (note is null or char_length(note) <= 1000),
  source_url text not null check (source_url ~ '^https://[^ ]+$'),
  source_date date not null,
  verified_at timestamptz,
  status public.env_verification_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (regulation_key, species_group, species_name, common_name, period_text),
  constraint wr_dates_in_year check ((start_date is null) = (end_date is null)
    and (start_date is null or (end_date >= start_date and extract(year from start_date) = year))),
  constraint wr_partial_shape check (restriction_type = 'partial' or start_date is null)
);
comment on table public.wildlife_restrictions is 'Vedas por año. Una veda de otro año NO se muestra como vigente: ver wildlife_restrictions_current y refresh_environmental_verification_status().';

-- 11) CENTROS ECOTURÍSTICOS (Fase 13): reutiliza businesses ------------------
alter table public.businesses drop constraint if exists businesses_business_type_check;
alter table public.businesses add constraint businesses_business_type_check check (business_type is null or business_type in (
  'restaurante', 'comedor', 'kiosco', 'hotel', 'hostal', 'ecolodge', 'resort', 'cabana', 'casa_arbol', 'guia', 'artesano', 'cooperativa',
  'cafe', 'bar', 'transporte', 'tour_operador', 'finca', 'emprendimiento', 'hospedaje', 'ecotourism_center'));
alter table public.businesses
  add column if not exists protected_area_place_id text references public.places(id) on delete set null,
  add column if not exists services text[] not null default '{}',
  add column if not exists visitor_information text check (visitor_information is null or char_length(visitor_information) <= 3000);

-- Índices --------------------------------------------------------------------
create index if not exists idx_pad_department on public.protected_area_details (department_id);
create index if not exists idx_mp_place on public.management_plans (place_id);
create index if not exists idx_bio_place on public.biodiversity_records (place_id);
create index if not exists idx_rules_place on public.visitor_rules (place_id);
create index if not exists idx_access_place on public.access_points (place_id) where map_ready;
create index if not exists idx_wr_year on public.wildlife_restrictions (year, species_group);

-- updated_at ------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['protected_area_details', 'management_plans', 'biodiversity_records', 'visitor_rules', 'access_points',
    'biosphere_reserves', 'environmental_regulations', 'wildlife_restrictions'] loop
    execute format('drop trigger if exists trg_%s_updated on public.%I', t, t);
    execute format('create trigger trg_%s_updated before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- 12) GUARDIAS: verificar y publicar no es público ----------------------------
-- Solo quien tiene content.verify puede dejar un registro en verified/rejected;
-- el servidor (service_role) importa en pending/partial/conflicting.
create or replace function public.guard_environmental_verification()
returns trigger language plpgsql set search_path = '' as $$
declare
  v_role text := coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', '');
  v_new text := to_jsonb(new) ->> (case when tg_table_name = 'protected_area_details' then 'verification_status' else 'status' end);
  v_old text := case when tg_op = 'UPDATE' then to_jsonb(old) ->> (case when tg_table_name = 'protected_area_details' then 'verification_status' else 'status' end) end;
begin
  if v_role = 'service_role' or current_user in ('postgres', 'service_role', 'supabase_admin') then return new; end if;
  if v_new in ('verified', 'rejected') and v_new is distinct from v_old and not public.has_permission('content.verify') then
    raise exception 'Solo el equipo BAQUEANO con permiso content.verify puede verificar contenido ambiental.' using errcode = '42501';
  end if;
  return new;
end $$;
do $$
declare t text;
begin
  foreach t in array array['protected_area_details', 'management_plans', 'biodiversity_records', 'visitor_rules', 'access_points',
    'biosphere_reserves', 'environmental_regulations', 'wildlife_restrictions'] loop
    execute format('drop trigger if exists trg_%s_guard_verify on public.%I', t, t);
    execute format('create trigger trg_%s_guard_verify before insert or update on public.%I for each row execute function public.guard_environmental_verification()', t, t);
  end loop;
end $$;

-- Fase 18: un área protegida no se publica sin el mínimo verificable.
-- Aplica SOLO a places con ficha en protected_area_details (no toca los 237 lugares existentes).
create or replace function public.protected_area_publication_gaps(p_place_id text)
returns text[] language sql stable security definer set search_path = '' as $$
  select array_remove(array[
    case when d.official_name is null then 'official_name' end,
    case when d.official_category is null then 'official_category' end,
    -- Departamento y municipio deben venir de la ficha oficial (no del catálogo editorial de places).
    case when d.department_id is null then 'department' end,
    case when d.municipality_id is null and d.territorial_scope_text is null then 'municipality_or_scope' end,
    case when not exists (select 1 from public.verification_sources s where s.entity_type = 'protected_area' and s.entity_id = p.id
      and s.status = 'active' and s.source_type in ('official', 'management_plan', 'regulation', 'government', 'government_map', 'international_official')) then 'official_source' end,
    case when d.verified_at is null then 'verified_at' end,
    case when d.verification_status not in ('verified', 'partial') then 'verification_status' end
  ], null)
  from public.places p join public.protected_area_details d on d.place_id = p.id
  where p.id = p_place_id;
$$;
revoke all on function public.protected_area_publication_gaps(text) from public, anon;
grant execute on function public.protected_area_publication_gaps(text) to authenticated, service_role;

create or replace function public.guard_protected_area_publication()
returns trigger language plpgsql set search_path = '' as $$
declare v_gaps text[];
begin
  if new.is_published and (tg_op = 'INSERT' or not old.is_published)
     and exists (select 1 from public.protected_area_details d where d.place_id = new.id) then
    v_gaps := public.protected_area_publication_gaps(new.id);
    if coalesce(array_length(v_gaps, 1), 0) > 0 then
      raise exception 'Área protegida sin datos mínimos para publicar: %', array_to_string(v_gaps, ', ') using errcode = '23514';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists trg_places_guard_protected_publication on public.places;
create trigger trg_places_guard_protected_publication before insert or update of is_published on public.places
  for each row execute function public.guard_protected_area_publication();

-- 13) "CÓMO LLEGAR" (Fases 8, 21, 23) -----------------------------------------
-- Área protegida: solo con access_point verificado y map_ready. Otros lugares: places.map_ready (pin exacto).
create or replace view public.place_navigation with (security_invoker = true) as
select p.id as place_id,
       (d.place_id is not null) as is_protected_area,
       case when d.place_id is not null then exists (select 1 from public.access_points a where a.place_id = p.id and a.map_ready)
            else p.map_ready end as can_navigate,
       (select a.latitude from public.access_points a where a.place_id = p.id and a.map_ready order by a.verified_at desc nulls last limit 1) as access_latitude,
       (select a.longitude from public.access_points a where a.place_id = p.id and a.map_ready order by a.verified_at desc nulls last limit 1) as access_longitude,
       (select a.name from public.access_points a where a.place_id = p.id and a.map_ready order by a.verified_at desc nulls last limit 1) as access_name
from public.places p
left join public.protected_area_details d on d.place_id = p.id
where p.is_published;
comment on view public.place_navigation is 'Fuente única del botón "Cómo llegar" (web, Android, BAQUI). El centroide de una reserva nunca habilita navegación.';

-- Vedas vigentes: año actual; si aún no hay resolución del año, la última (Art. 10 R.M. 016-2026).
create or replace view public.wildlife_restrictions_current with (security_invoker = true) as
select w.* from public.wildlife_restrictions w
where w.status in ('verified', 'partial', 'conflicting')
  and w.year = (select max(x.year) from public.wildlife_restrictions x where x.year <= extract(year from current_date)::int and x.status in ('verified', 'partial', 'conflicting'));

-- 14) RLS ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['protected_area_details', 'management_plans', 'biodiversity_records', 'visitor_rules', 'access_points',
    'biosphere_reserves', 'biosphere_reserve_places', 'environmental_regulations', 'wildlife_restrictions'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from public, anon, authenticated', t);
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end $$;
grant select on public.place_navigation, public.wildlife_restrictions_current to anon, authenticated;

-- Público: solo lo verificado/parcial de lugares publicados. Staff con content.read ve borradores.
drop policy if exists "env_pad_public" on public.protected_area_details;
create policy "env_pad_public" on public.protected_area_details for select to anon, authenticated
  using ((verification_status in ('verified', 'partial') and exists (select 1 from public.places p where p.id = place_id and p.is_published))
         or public.has_permission('content.read'));
drop policy if exists "env_mp_public" on public.management_plans;
create policy "env_mp_public" on public.management_plans for select to anon, authenticated
  using (status in ('verified', 'partial') or public.has_permission('content.read'));
drop policy if exists "env_bio_public" on public.biodiversity_records;
create policy "env_bio_public" on public.biodiversity_records for select to anon, authenticated
  using ((status = 'verified' and exists (select 1 from public.places p where p.id = place_id and p.is_published)) or public.has_permission('content.read'));
drop policy if exists "env_rules_public" on public.visitor_rules;
create policy "env_rules_public" on public.visitor_rules for select to anon, authenticated
  using ((status = 'verified' and exists (select 1 from public.places p where p.id = place_id and p.is_published)) or public.has_permission('content.read'));
drop policy if exists "env_access_public" on public.access_points;
create policy "env_access_public" on public.access_points for select to anon, authenticated
  using ((status = 'verified' and exists (select 1 from public.places p where p.id = place_id and p.is_published)) or public.has_permission('content.read'));
drop policy if exists "env_br_public" on public.biosphere_reserves;
create policy "env_br_public" on public.biosphere_reserves for select to anon, authenticated
  using (status in ('verified', 'partial') or public.has_permission('content.read'));
drop policy if exists "env_brp_public" on public.biosphere_reserve_places;
create policy "env_brp_public" on public.biosphere_reserve_places for select to anon, authenticated using (true);
drop policy if exists "env_reg_public" on public.environmental_regulations;
create policy "env_reg_public" on public.environmental_regulations for select to anon, authenticated
  using (status in ('verified', 'partial') or public.has_permission('content.read'));
drop policy if exists "env_wr_public" on public.wildlife_restrictions;
create policy "env_wr_public" on public.wildlife_restrictions for select to anon, authenticated
  using (status in ('verified', 'partial', 'conflicting') or public.has_permission('content.read'));

-- 15) VERIFICACIÓN AUTOMÁTICA (Fase 32): solo estados, nunca contenido ----------
create or replace function public.refresh_environmental_verification_status()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_sources int; v_plans int; v_access int; v_vedas int; v_rules int;
  v_year int := extract(year from current_date)::int;
begin
  -- Fuentes con vencimiento cumplido → needs_review (no se borran).
  update public.verification_sources set status = 'needs_review'
   where status = 'active' and expires_at is not null and expires_at < now();
  get diagnostics v_sources = row_count;
  -- Planes con vigencia vencida → expired.
  update public.management_plans set status = 'expired'
   where status in ('verified', 'partial') and valid_to is not null and valid_to < current_date;
  get diagnostics v_plans = row_count;
  -- Accesos verificados hace más de 24 meses → pending (revalidar; deja de habilitar "Cómo llegar").
  update public.access_points set status = 'pending', map_ready = false
   where status = 'verified' and verified_at < now() - interval '24 months';
  get diagnostics v_access = row_count;
  -- Vedas: un año solo vence cuando existe la resolución de un año posterior (Art. 10 R.M. 016-2026).
  update public.wildlife_restrictions w set status = 'expired'
   where w.status <> 'expired' and exists (select 1 from public.wildlife_restrictions n where n.year > w.year and n.year <= v_year and n.status in ('verified', 'partial'));
  get diagnostics v_vedas = row_count;
  -- Reglas con vigencia vencida → expired.
  update public.visitor_rules set status = 'expired'
   where status = 'verified' and valid_until is not null and valid_until < current_date;
  get diagnostics v_rules = row_count;
  return jsonb_build_object('ran_at', now(), 'sources_needs_review', v_sources, 'plans_expired', v_plans,
    'access_points_revalidate', v_access, 'wildlife_restrictions_expired', v_vedas, 'visitor_rules_expired', v_rules);
end $$;
revoke all on function public.refresh_environmental_verification_status() from public, anon, authenticated;
grant execute on function public.refresh_environmental_verification_status() to service_role;

-- 16) DASHBOARD AMBIENTAL (Fase 27, Ops Center) --------------------------------
create or replace function public.environmental_dashboard()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_role text := coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', '');
begin
  if v_role <> 'service_role' and current_user not in ('postgres', 'service_role') and not public.has_permission('content.read') then
    raise exception 'sin permiso' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'generated_at', now(),
    'protected_areas', jsonb_build_object(
      'total', (select count(*) from public.protected_area_details),
      'verified', (select count(*) from public.protected_area_details where verification_status = 'verified'),
      'partial', (select count(*) from public.protected_area_details where verification_status = 'partial'),
      'pending', (select count(*) from public.protected_area_details where verification_status = 'pending'),
      'conflicting', (select count(*) from public.protected_area_details where verification_status = 'conflicting'),
      'published', (select count(*) from public.protected_area_details d join public.places p on p.id = d.place_id where p.is_published),
      'without_official_category', (select count(*) from public.protected_area_details where official_category is null),
      'without_source', (select count(*) from public.protected_area_details d where not exists (select 1 from public.verification_sources s where s.entity_type = 'protected_area' and s.entity_id = d.place_id)),
      'without_coordinates', (select count(*) from public.protected_area_details d join public.places p on p.id = d.place_id where p.latitude is null),
      'without_municipality', (select count(*) from public.protected_area_details d join public.places p on p.id = d.place_id where coalesce(d.municipality_id, p.municipality_id) is null),
      'exact_pins', (select count(*) from public.protected_area_details d join public.places p on p.id = d.place_id where p.location_precision = 'exact')),
    'management_plans', jsonb_build_object(
      'total', (select count(*) from public.management_plans),
      'linked_to_place', (select count(*) from public.management_plans where place_id is not null),
      'with_approval_reference', (select count(*) from public.management_plans where approval_reference is not null),
      'without_document_url', (select count(*) from public.management_plans where document_url is null and gazette_url is null)),
    'access_points', jsonb_build_object(
      'total', (select count(*) from public.access_points),
      'validated', (select count(*) from public.access_points where map_ready)),
    'regulations', (select count(*) from public.environmental_regulations),
    'wildlife_restrictions_current', (select count(*) from public.wildlife_restrictions_current),
    'sources_expired', (select count(*) from public.verification_sources where status in ('needs_review', 'expired')
      and entity_type in ('protected_area', 'management_plan', 'environmental_regulation', 'wildlife_restriction', 'access_point')));
end $$;
revoke all on function public.environmental_dashboard() from public, anon;
grant execute on function public.environmental_dashboard() to authenticated, service_role;
