-- ============================================================================
-- 🧭 BAQUEANO IMPACTO — ALINEACIÓN NACIONAL, INDICADORES Y TRAZABILIDAD DE FUENTES
-- ============================================================================
-- 🎯 POR QUÉ:
--   Demostrar con datos reales cómo BAQUEANO CONTRIBUYE a prioridades nacionales
--   (PNLCP-DH 2022-2026, ejes INTUR 2026, Estrategia Nacional de Educación
--   2024-2026, MARENA) sin atribuirse reconocimientos que no existen. Toda
--   relación se guarda como "contribución o alineación de BAQUEANO", con la
--   fuente oficial, la fecha de verificación y su vencimiento.
-- ⚙️ CÓMO (aditivo e idempotente; no borra ni altera datos existentes):
--   1. strategic_sources: documento, institución, año, URL, fecha de consulta,
--      última revisión y vencimiento. Fuente vencida ⇒ status = needs_review
--      (función refresh_impact_verification_status + estado efectivo en vistas).
--   2. national_alignment: eje oficial ↔ componente BAQUEANO. alignment_type
--      solo admite direct | supporting | potential (NUNCA "official": no hay
--      convenio ni resolución institucional registrada).
--   3. impact_indicators: catálogo de indicadores (clave, panel, fórmula y
--      tablas de origen). Los VALORES nunca se guardan a mano: los calcula
--      strategic_impact_report() en cada consulta.
--   4. impact_events: VISTA sobre analytics_events + commercial_actions con los
--      nombres del embudo (place_view … reservation_completed). Se reutiliza la
--      ingesta existente (track_event, límite por hora, sin PII) en lugar de
--      crear una segunda tabla de eventos que duplicaría datos.
--   5. sustainability_practices, community_impact, entity_accessibility:
--      prácticas y atributos por entidad con estado "reported" o
--      "verified_baqueano" (nunca "certificación ambiental oficial").
--   6. businesses.protagonist_type + atributos autodeclarados (mujer / joven /
--      rural / cooperativa) para la categoría "Protagonista local".
--   7. strategic_impact_report() (staff con analytics.read) y
--      public_impact_summary() (anónimo: solo agregados, sin PII).
-- 📦 QUÉ: base de datos de BAQUEANO IMPACTO para Ops Center, página pública y BAQUI.
-- ↩️ ROLLBACK: todo lo nuevo puede retirarse sin pérdida (nada existente se modifica
--   salvo columnas nuevas opcionales en businesses). Requiere autorización.
-- ============================================================================

-- 1) Fuentes estratégicas ------------------------------------------------------
create table if not exists public.strategic_sources (
  id text primary key check (id ~ '^[a-z0-9_]{3,80}$'),
  institution text not null check (char_length(institution) between 2 and 200),
  document text not null check (char_length(document) between 2 and 300),
  year text check (year is null or year ~ '^\d{4}(-\d{4})?$'),
  source_name text not null check (char_length(source_name) between 2 and 300),
  source_url text not null check (source_url ~ '^https?://[^ ]+$'),
  excerpt text check (excerpt is null or char_length(excerpt) <= 2000),
  consulted_at date not null,
  verified_at date not null,
  last_verified_at date not null,
  verification_expiry date not null,
  status text not null default 'active' check (status in ('active', 'needs_review', 'retired')),
  notes text check (notes is null or char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (verification_expiry >= last_verified_at)
);
comment on table public.strategic_sources is 'Fuentes oficiales consultadas para BAQUEANO IMPACTO. Vencida (verification_expiry < hoy) ⇒ needs_review.';

-- 2) Alineación nacional ---------------------------------------------------------
create table if not exists public.national_alignment (
  id text primary key check (id ~ '^[a-z0-9_]{3,80}$'),
  national_framework text not null check (national_framework in ('pnlcp_dh_2022_2026', 'intur_2026', 'ene_2024_2026', 'marena_sinap', 'ley_turismo_rural')),
  axis_code text not null check (char_length(axis_code) between 1 and 40),
  axis_name text not null check (char_length(axis_name) between 2 and 300),
  lineamiento text check (lineamiento is null or char_length(lineamiento) <= 600),
  accion text check (accion is null or char_length(accion) <= 600),
  description text not null check (char_length(description) between 10 and 1500),
  baqueano_component text not null check (char_length(baqueano_component) between 2 and 300),
  alignment_type text not null check (alignment_type in ('direct', 'supporting', 'potential')),
  evidence text not null check (char_length(evidence) between 5 and 1500),
  indicator_keys text[] not null default '{}',
  source_id text not null references public.strategic_sources(id) on delete restrict,
  source_name text not null,
  source_url text not null check (source_url ~ '^https?://[^ ]+$'),
  verified_at date not null,
  last_verified_at date not null,
  verification_expiry date not null,
  status text not null default 'active' check (status in ('active', 'needs_review', 'draft', 'retired')),
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.national_alignment is 'Contribución o alineación funcional de BAQUEANO con marcos nacionales. NO implica reconocimiento oficial: alignment_type no admite "official".';
comment on column public.national_alignment.alignment_type is 'direct = la función de BAQUEANO opera hoy sobre esa prioridad; supporting = la apoya indirectamente; potential = capacidad existente aún sin datos suficientes.';
create index if not exists idx_national_alignment_framework on public.national_alignment (national_framework, sort_order);

-- 3) Catálogo de indicadores -----------------------------------------------------
create table if not exists public.impact_indicators (
  key text primary key check (key ~ '^[a-z][a-z0-9_]{2,60}$'),
  panel text not null check (panel in ('tourism', 'local_economy', 'community', 'culture', 'environment', 'education', 'technology', 'inclusion', 'safety', 'territory')),
  label_i18n_key text not null,
  formula text not null,
  source_tables text not null,
  unit text not null default 'count' check (unit in ('count', 'percent')),
  is_public boolean not null default true,
  sort_order integer not null default 100
);
comment on table public.impact_indicators is 'Definición de cada indicador de impacto. El valor se calcula en strategic_impact_report(); nunca se guarda una cifra manual.';

-- 4) Prácticas sostenibles por entidad -------------------------------------------
create table if not exists public.sustainability_practices (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('business', 'destination', 'experience', 'community', 'route')),
  entity_id text not null check (char_length(entity_id) between 1 and 160),
  practice text not null check (practice in ('area_protegida', 'practica_sostenible', 'reciclaje', 'energia_renovable', 'conservacion_agua', 'proteccion_biodiversidad', 'producto_local', 'movilidad_sostenible')),
  evidence_status text not null default 'reported' check (evidence_status in ('reported', 'verified_baqueano', 'rejected')),
  evidence_url text check (evidence_url is null or evidence_url ~ '^https?://[^ ]+$'),
  notes text check (notes is null or char_length(notes) <= 1000),
  reported_at timestamptz not null default now(),
  verified_at timestamptz,
  verified_by text,
  valid_until date,
  unique (entity_type, entity_id, practice),
  check (evidence_status <> 'verified_baqueano' or verified_at is not null)
);
comment on table public.sustainability_practices is 'Ficha de Sostenibilidad BAQUEANO. "Práctica reportada" o "Práctica verificada por BAQUEANO". No es una certificación ambiental oficial.';

-- 5) Impacto comunitario e insignia "Experiencia Comunitaria" --------------------
create table if not exists public.community_impact (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('business', 'destination', 'experience', 'community')),
  entity_id text not null check (char_length(entity_id) between 1 and 160),
  department_id text references public.departments(id) on delete set null,
  municipality_id text references public.municipalities(id) on delete set null,
  responsible_name text check (responsible_name is null or char_length(responsible_name) <= 200),
  activity text check (activity is null or char_length(activity) <= 500),
  local_impact text check (local_impact is null or char_length(local_impact) <= 1000),
  public_contact text check (public_contact is null or char_length(public_contact) <= 200),
  how_to_reach text check (how_to_reach is null or char_length(how_to_reach) <= 1000),
  latitude double precision check (latitude is null or latitude between 10.5 and 15.2),
  longitude double precision check (longitude is null or longitude between -88.0 and -82.5),
  tourism_modalities text[] not null default '{}',
  source_name text,
  source_url text check (source_url is null or source_url ~ '^https?://[^ ]+$'),
  badge_status text not null default 'pending' check (badge_status in ('pending', 'verified', 'rejected', 'expired')),
  verified_at timestamptz,
  verified_by text,
  valid_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_type, entity_id),
  check (badge_status <> 'verified' or (verified_at is not null and verified_by is not null)),
  check (tourism_modalities <@ array['turismo_rural', 'turismo_comunitario', 'agroturismo', 'finca', 'cooperativa', 'comunidad', 'guia_local', 'experiencia_campesina', 'gastronomia_local', 'artesania']::text[])
);
comment on table public.community_impact is 'Insignia "Experiencia Comunitaria": solo visible con badge_status = verified (verificación en Ops Center) y vigente.';

-- 6) Accesibilidad verificada ------------------------------------------------------
create table if not exists public.entity_accessibility (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('business', 'destination', 'experience', 'route')),
  entity_id text not null check (char_length(entity_id) between 1 and 160),
  feature text not null check (feature in ('acceso_silla_ruedas', 'bano_accesible', 'estacionamiento_accesible', 'ruta_accesible', 'informacion_visual', 'informacion_auditiva', 'acompanamiento')),
  status text not null default 'reported' check (status in ('reported', 'verified', 'rejected')),
  verified_at timestamptz,
  verified_by text,
  notes text check (notes is null or char_length(notes) <= 500),
  created_at timestamptz not null default now(),
  unique (entity_type, entity_id, feature),
  check (status <> 'verified' or verified_at is not null)
);
comment on table public.entity_accessibility is 'Atributos de accesibilidad. Solo se muestran como disponibles con status = verified.';

-- 7) Protagonista local (columnas opcionales en businesses) ------------------------
alter table public.businesses
  add column if not exists protagonist_type text,
  add column if not exists women_led boolean,
  add column if not exists youth_led boolean,
  add column if not exists rural_area boolean,
  add column if not exists protagonist_verified_at timestamptz;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'businesses_protagonist_type_check') then
    alter table public.businesses add constraint businesses_protagonist_type_check check (protagonist_type is null or protagonist_type in
      ('microemprendimiento', 'emprendimiento_familiar', 'cooperativa', 'artesano', 'guia_local', 'comedor', 'productor', 'alojamiento_rural', 'empresa_turistica'));
  end if;
end $$;
comment on column public.businesses.protagonist_type is 'Categoría "Protagonista local". Autodeclarada en Mi Negocio; protagonist_verified_at la fija el Ops Center.';
comment on column public.businesses.women_led is 'Autodeclarado: emprendimiento liderado por mujeres. NULL = no informado (no se cuenta).';

-- 8) Eventos del embudo que faltaban en el catálogo -------------------------------
insert into public.analytics_event_types (name, description, funnel_stage, is_activation, client_allowed) values
  ('place_viewed', 'Ficha de un lugar del territorio abierta (franja o pin del mapa).', 'engagement', false, true),
  ('qr_generated', 'Código QR generado para compartir un lugar, negocio o itinerario.', 'referral', false, true),
  ('reservation_completed', 'Reserva confirmada o completada por el prestador (lo emite el servidor).', 'revenue', false, false),
  ('visit_confirmed', 'Visita confirmada por el prestador o el visitante (lo emite el servidor).', 'revenue', false, false)
on conflict (name) do nothing;

-- 9) impact_events: vista del embudo sobre la ingesta existente -------------------
create or replace view public.impact_events with (security_invoker = true) as
  select e.id, e.occurred_at,
    case e.event_name
      when 'destination_viewed' then 'place_view'
      when 'place_viewed' then 'place_view'
      when 'business_viewed' then 'business_view'
      when 'map_opened' then 'map_open'
      when 'directions_clicked' then 'directions_click'
      when 'whatsapp_clicked' then 'whatsapp_click'
      when 'phone_clicked' then 'call_click'
      when 'reservation_started' then 'reservation_start'
      when 'booking_requested' then 'reservation_start'
      when 'reservation_completed' then 'reservation_completed'
      when 'visit_confirmed' then 'visit'
      when 'review_created' then 'review'
      when 'qr_generated' then 'qr_generated'
      when 'baqui_message_sent' then 'baqui_query'
      when 'baqui_used' then 'baqui_query'
      when 'itinerary_generated' then 'itinerary_generated'
    end as impact_event,
    e.platform, e.entity_type, e.entity_id, e.department_id,
    public.analytics_actor_key(e.user_id, e.legacy_uid, e.anonymous_id) as actor_key,
    'analytics_events'::text as origin
  from public.analytics_events e
  where e.event_name in ('destination_viewed', 'place_viewed', 'business_viewed', 'map_opened', 'directions_clicked', 'whatsapp_clicked',
    'phone_clicked', 'reservation_started', 'booking_requested', 'reservation_completed', 'visit_confirmed', 'review_created', 'qr_generated',
    'baqui_message_sent', 'baqui_used', 'itinerary_generated')
  union all
  select c.id, c.occurred_at,
    case c.action_type when 'whatsapp' then 'whatsapp_click' when 'call' then 'call_click' when 'directions' then 'directions_click'
      when 'booking_request' then 'reservation_start' when 'day_pass_request' then 'reservation_start' else 'contact' end,
    c.platform,
    case when c.business_id is not null then 'business' when c.experience_id is not null then 'experience' else 'destination' end,
    coalesce(c.business_id, c.experience_id, c.destination_id), null,
    public.analytics_actor_key(c.user_id, c.legacy_uid, c.anonymous_id),
    'commercial_actions'::text
  from public.commercial_actions c;
comment on view public.impact_events is 'Trazabilidad turista → lugar → negocio → mapa → contacto → reserva → visita → reseña, sobre analytics_events y commercial_actions (sin duplicar ingesta ni guardar PII).';

-- 10) RLS ----------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['strategic_sources', 'national_alignment', 'impact_indicators', 'sustainability_practices', 'community_impact', 'entity_accessibility'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from public, anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end $$;
revoke all on public.impact_events from public, anon, authenticated;
grant select on public.impact_events to service_role;

-- Lectura pública SOLO de lo vigente y verificable; escritura únicamente por servidor.
grant select on public.strategic_sources, public.national_alignment, public.impact_indicators, public.sustainability_practices, public.community_impact, public.entity_accessibility to anon, authenticated;
drop policy if exists "Lectura pública de fuentes vigentes" on public.strategic_sources;
create policy "Lectura pública de fuentes vigentes" on public.strategic_sources for select to anon, authenticated
  using (status = 'active' and verification_expiry >= current_date);
drop policy if exists "Lectura pública de alineación vigente" on public.national_alignment;
create policy "Lectura pública de alineación vigente" on public.national_alignment for select to anon, authenticated
  using (status = 'active' and verification_expiry >= current_date);
drop policy if exists "Lectura pública de indicadores públicos" on public.impact_indicators;
create policy "Lectura pública de indicadores públicos" on public.impact_indicators for select to anon, authenticated using (is_public);
drop policy if exists "Lectura pública de prácticas reportadas o verificadas" on public.sustainability_practices;
create policy "Lectura pública de prácticas reportadas o verificadas" on public.sustainability_practices for select to anon, authenticated
  using (evidence_status in ('reported', 'verified_baqueano') and (valid_until is null or valid_until >= current_date));
drop policy if exists "Lectura pública de insignias verificadas" on public.community_impact;
create policy "Lectura pública de insignias verificadas" on public.community_impact for select to anon, authenticated
  using (badge_status = 'verified' and (valid_until is null or valid_until >= current_date));
drop policy if exists "Lectura pública de accesibilidad verificada" on public.entity_accessibility;
create policy "Lectura pública de accesibilidad verificada" on public.entity_accessibility for select to anon, authenticated
  using (status = 'verified');

create or replace trigger trg_strategic_sources_updated before update on public.strategic_sources for each row execute function public.set_updated_at();
create or replace trigger trg_national_alignment_updated before update on public.national_alignment for each row execute function public.set_updated_at();
create or replace trigger trg_community_impact_updated before update on public.community_impact for each row execute function public.set_updated_at();

-- 11) Vencimiento de verificación ⇒ needs_review --------------------------------------
create or replace function public.refresh_impact_verification_status()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_sources int; v_align int; v_badges int;
begin
  update public.strategic_sources set status = 'needs_review' where status = 'active' and verification_expiry < current_date;
  get diagnostics v_sources = row_count;
  update public.national_alignment a set status = 'needs_review'
   where a.status = 'active' and (a.verification_expiry < current_date
     or exists (select 1 from public.strategic_sources s where s.id = a.source_id and s.status <> 'active'));
  get diagnostics v_align = row_count;
  update public.community_impact set badge_status = 'expired' where badge_status = 'verified' and valid_until < current_date;
  get diagnostics v_badges = row_count;
  return jsonb_build_object('sources_needs_review', v_sources, 'alignment_needs_review', v_align, 'badges_expired', v_badges, 'ran_at', now());
end $$;
revoke all on function public.refresh_impact_verification_status() from public, anon, authenticated;
grant execute on function public.refresh_impact_verification_status() to service_role;

-- 12) Reporte de impacto (Ops Center) ---------------------------------------------------
create or replace function public.strategic_impact_report(
  p_from timestamptz default now() - interval '30 days',
  p_to timestamptz default now()
) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_role text := coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', '');
  v_total_muni numeric; v_muni_content numeric; v_dep_content numeric;
  ev jsonb; p jsonb := '{}'::jsonb;
begin
  if v_role <> 'service_role' and current_user not in ('postgres', 'service_role')
     and not public.has_permission('analytics.read') then
    raise exception 'sin permiso analytics.read' using errcode = '42501';
  end if;

  -- Cobertura territorial: municipios con al menos un contenido publicado.
  select count(*) into v_total_muni from public.municipalities;
  with content as (
    select municipality_id, department_id from public.destinations where status = 'published' and deleted_at is null
    union all select municipality_id, department_id from public.businesses where status = 'published' and deleted_at is null
    union all select municipality_id, department_id from public.experiences where status = 'published'
    union all select municipality_id, department_id from public.communities where status = 'published'
  )
  select count(distinct municipality_id), count(distinct department_id) into v_muni_content, v_dep_content from content;

  -- Eventos del embudo en el período
  select coalesce(jsonb_object_agg(impact_event, n), '{}'::jsonb) into ev from (
    select impact_event, count(*) n from public.impact_events
    where occurred_at between p_from and p_to and impact_event is not null group by impact_event) x;

  p := jsonb_build_object(
    'tourism', jsonb_build_object(
      'destinos_publicados', (select count(*) from public.destinations where status = 'published' and deleted_at is null),
      'destinos_verificados', (select count(*) from public.destinations where status = 'published' and deleted_at is null and verification_status = 'verified'),
      'rutas_creadas', (select count(*) from public.routes where status = 'published'),
      'experiencias_publicadas', (select count(*) from public.experiences where status = 'published'),
      'servicios_turisticos', (select count(*) from public.tourism_services where status = 'published'),
      'visitas_generadas', coalesce((ev ->> 'place_view')::int, 0) + coalesce((ev ->> 'business_view')::int, 0)),
    'local_economy', jsonb_build_object(
      'negocios_locales', (select count(*) from public.businesses where status = 'published' and deleted_at is null),
      'negocios_verificados', (select count(*) from public.businesses where deleted_at is null and verification_status = 'verified'),
      'emprendimientos_familiares', (select count(*) from public.businesses where deleted_at is null and protagonist_type = 'emprendimiento_familiar'),
      'mujeres_emprendedoras', (select count(*) from public.businesses where deleted_at is null and women_led is true),
      'jovenes_emprendedores', (select count(*) from public.businesses where deleted_at is null and youth_led is true),
      'cooperativas', (select count(*) from public.businesses where deleted_at is null and protagonist_type = 'cooperativa'),
      'negocios_rurales', (select count(*) from public.businesses where deleted_at is null and (rural_area is true or protagonist_type = 'alojamiento_rural')),
      'protagonistas_sin_categoria', (select count(*) from public.businesses where deleted_at is null and protagonist_type is null)),
    'community', jsonb_build_object(
      'comunidades_publicadas', (select count(*) from public.communities where status = 'published'),
      'experiencias_comunitarias_verificadas', (select count(*) from public.community_impact where badge_status = 'verified' and (valid_until is null or valid_until >= current_date)),
      'experiencias_comunitarias_pendientes', (select count(*) from public.community_impact where badge_status = 'pending')),
    'culture', jsonb_build_object(
      'patrimonio', (select count(*) from public.heritage),
      'gastronomia', (select count(*) from public.gastronomy),
      'musica', (select count(*) from public.music),
      'artesania', (select count(*) from public.crafts),
      'festividades', (select count(*) from public.festivals),
      'personajes_historicos', (select count(*) from public.historical_figures),
      'leyendas', (select count(*) from public.legends),
      'cultura', (select count(*) from public.culture)),
    'environment', jsonb_build_object(
      'practicas_reportadas', (select count(*) from public.sustainability_practices where evidence_status = 'reported'),
      'practicas_verificadas', (select count(*) from public.sustainability_practices where evidence_status = 'verified_baqueano'),
      'oferta_con_criterio_responsable', (select count(*) from public.businesses where deleted_at is null and status = 'published'
        and exists (select 1 from jsonb_each(sustainability_attributes) j where j.value = 'true'::jsonb))),
    'education', jsonb_build_object(
      'lineamientos_vinculados', (select count(*) from public.national_alignment where national_framework = 'ene_2024_2026' and status = 'active'),
      'evidencias_sprint', (select count(*) from public.sprint_evidence_records)),
    'technology', jsonb_build_object(
      'usuarios', (select count(*) from public.profiles where status <> 'deleted_soft'),
      'consultas_baqui', (select count(*) from public.ai_messages where role = 'user' and created_at between p_from and p_to),
      'sesiones_baqui', (select count(*) from public.ai_sessions where created_at between p_from and p_to),
      'itinerarios_generados', (select count(*) from public.travel_plans where created_at between p_from and p_to),
      'destinos_consultados', coalesce((ev ->> 'place_view')::int, 0),
      'negocios_visualizados', coalesce((ev ->> 'business_view')::int, 0),
      'aperturas_mapa', coalesce((ev ->> 'map_open')::int, 0),
      'clics_como_llegar', coalesce((ev ->> 'directions_click')::int, 0),
      'clics_whatsapp', coalesce((ev ->> 'whatsapp_click')::int, 0),
      'clics_llamar', coalesce((ev ->> 'call_click')::int, 0),
      'reservas_iniciadas', coalesce((ev ->> 'reservation_start')::int, 0),
      'reservas_completadas', (select count(*) from public.reservations where status in ('confirmed', 'completed') and created_at between p_from and p_to),
      'qr_generados', coalesce((ev ->> 'qr_generated')::int, 0)),
    'inclusion', jsonb_build_object(
      'atributos_accesibilidad_verificados', (select count(*) from public.entity_accessibility where status = 'verified'),
      'entidades_con_accesibilidad_verificada', (select count(distinct (entity_type, entity_id)) from public.entity_accessibility where status = 'verified'),
      'idiomas_interfaz', 6),
    'safety', jsonb_build_object(
      'contactos_emergencia', (select count(*) from public.emergencies),
      'contactos_emergencia_verificados', (select count(*) from public.emergencies where verification_status = 'verified'),
      'contactos_con_ubicacion', (select count(*) from public.emergencies where latitude is not null),
      'alertas_sos', (select count(*) from public.sos_events where created_at between p_from and p_to)),
    'territory', jsonb_build_object(
      'departamentos_catalogados', (select count(*) from public.departments),
      'departamentos_con_contenido', v_dep_content,
      'municipios_catalogados', v_total_muni,
      'municipios_con_contenido', v_muni_content,
      'cobertura_territorial_baqueano', case when v_total_muni > 0 then round(v_muni_content * 100.0 / v_total_muni, 1) end,
      'contenido_costa_caribe', (select count(*) from (
          select id from public.destinations where status = 'published' and deleted_at is null and department_id in ('raccn', 'raccs')
          union all select id from public.businesses where status = 'published' and deleted_at is null and department_id in ('raccn', 'raccs')
          union all select id from public.experiences where status = 'published' and department_id in ('raccn', 'raccs')) c),
      'por_departamento', coalesce((select jsonb_agg(d order by d ->> 'department_id') from (
          select jsonb_build_object('department_id', dp.id, 'name', dp.name,
            'destinos', (select count(*) from public.destinations x where x.department_id = dp.id and x.status = 'published' and x.deleted_at is null),
            'negocios', (select count(*) from public.businesses x where x.department_id = dp.id and x.status = 'published' and x.deleted_at is null),
            'experiencias', (select count(*) from public.experiences x where x.department_id = dp.id and x.status = 'published'),
            'municipios', (select count(*) from public.municipalities m where m.department_id = dp.id)) d
          from public.departments dp) z), '[]'::jsonb))
  );

  return jsonb_build_object(
    'period', jsonb_build_object('from', p_from, 'to', p_to),
    'generated_at', now(),
    'panels', p,
    'funnel', ev,
    'formula', jsonb_build_object('cobertura_territorial_baqueano', 'municipios_con_contenido / municipios_catalogados * 100'),
    'alignment', jsonb_build_object(
      'active', (select count(*) from public.national_alignment where status = 'active' and verification_expiry >= current_date),
      'needs_review', (select count(*) from public.national_alignment where status = 'needs_review' or verification_expiry < current_date),
      'sources_expired', (select count(*) from public.strategic_sources where verification_expiry < current_date)),
    'notice', 'Indicadores calculados en Supabase al momento de la consulta. 0 significa que todavía no hay registros; no se usan cifras estimadas.');
end $$;
revoke all on function public.strategic_impact_report(timestamptz, timestamptz) from public, anon;
grant execute on function public.strategic_impact_report(timestamptz, timestamptz) to authenticated, service_role;

-- 13) Resumen público (solo agregados, sin PII ni eventos individuales) ------------------
create or replace function public.public_impact_summary()
returns jsonb language sql stable security definer set search_path = '' as $$
  with content as (
    select municipality_id, department_id from public.destinations where status = 'published' and deleted_at is null
    union all select municipality_id, department_id from public.businesses where status = 'published' and deleted_at is null
    union all select municipality_id, department_id from public.experiences where status = 'published'
    union all select municipality_id, department_id from public.communities where status = 'published'
  ), cov as (
    select count(distinct municipality_id) muni, count(distinct department_id) dep from content
  )
  select jsonb_build_object(
    'generated_at', now(),
    'source', 'Supabase · public_impact_summary()',
    'destinos_publicados', (select count(*) from public.destinations where status = 'published' and deleted_at is null),
    'destinos_verificados', (select count(*) from public.destinations where status = 'published' and deleted_at is null and verification_status = 'verified'),
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

-- 14) Catálogo de indicadores ---------------------------------------------------------------
insert into public.impact_indicators (key, panel, label_i18n_key, formula, source_tables, unit, sort_order) values
  ('destinos_publicados', 'tourism', 'impact.ind.destinos_publicados', 'count(destinations) status=published', 'destinations', 'count', 10),
  ('departamentos_cubiertos', 'territory', 'impact.ind.departamentos_cubiertos', 'count(distinct department_id) de contenido publicado', 'destinations, businesses, experiences, communities', 'count', 11),
  ('municipios_cubiertos', 'territory', 'impact.ind.municipios_cubiertos', 'count(distinct municipality_id) de contenido publicado', 'destinations, businesses, experiences, communities', 'count', 12),
  ('cobertura_territorial_baqueano', 'territory', 'impact.ind.cobertura', 'municipios_con_contenido / municipios_catalogados * 100', 'municipalities + contenido publicado', 'percent', 13),
  ('rutas_creadas', 'tourism', 'impact.ind.rutas_creadas', 'count(routes) status=published', 'routes', 'count', 14),
  ('experiencias_publicadas', 'tourism', 'impact.ind.experiencias_publicadas', 'count(experiences) status=published', 'experiences', 'count', 15),
  ('visitas_generadas', 'tourism', 'impact.ind.visitas_generadas', 'eventos place_view + business_view del período', 'impact_events', 'count', 16),
  ('negocios_locales', 'local_economy', 'impact.ind.negocios_locales', 'count(businesses) status=published', 'businesses', 'count', 20),
  ('emprendimientos_familiares', 'local_economy', 'impact.ind.emprendimientos_familiares', 'protagonist_type=emprendimiento_familiar', 'businesses', 'count', 21),
  ('mujeres_emprendedoras', 'local_economy', 'impact.ind.mujeres_emprendedoras', 'women_led = true (autodeclarado)', 'businesses', 'count', 22),
  ('jovenes_emprendedores', 'local_economy', 'impact.ind.jovenes_emprendedores', 'youth_led = true (autodeclarado)', 'businesses', 'count', 23),
  ('cooperativas', 'local_economy', 'impact.ind.cooperativas', 'protagonist_type=cooperativa', 'businesses', 'count', 24),
  ('negocios_rurales', 'local_economy', 'impact.ind.negocios_rurales', 'rural_area = true o alojamiento_rural', 'businesses', 'count', 25),
  ('experiencias_comunitarias', 'community', 'impact.ind.experiencias_comunitarias', 'community_impact badge_status=verified y vigente', 'community_impact', 'count', 30),
  ('practicas_verificadas', 'environment', 'impact.ind.practicas_verificadas', 'sustainability_practices evidence_status=verified_baqueano', 'sustainability_practices', 'count', 40),
  ('usuarios', 'technology', 'impact.ind.usuarios', 'count(profiles) activos', 'profiles', 'count', 50),
  ('consultas_baqui', 'technology', 'impact.ind.consultas_baqui', 'ai_messages role=user', 'ai_messages', 'count', 51),
  ('itinerarios_generados', 'technology', 'impact.ind.itinerarios_generados', 'count(travel_plans)', 'travel_plans', 'count', 52),
  ('clics_como_llegar', 'technology', 'impact.ind.clics_como_llegar', 'impact_events directions_click', 'impact_events', 'count', 53),
  ('clics_whatsapp', 'technology', 'impact.ind.clics_whatsapp', 'impact_events whatsapp_click', 'impact_events', 'count', 54),
  ('reservas_iniciadas', 'technology', 'impact.ind.reservas_iniciadas', 'impact_events reservation_start', 'impact_events', 'count', 55),
  ('qr_generados', 'technology', 'impact.ind.qr_generados', 'impact_events qr_generated', 'impact_events', 'count', 56),
  ('accesibilidad_verificada', 'inclusion', 'impact.ind.accesibilidad_verificada', 'entity_accessibility status=verified', 'entity_accessibility', 'count', 60),
  ('contactos_emergencia_verificados', 'safety', 'impact.ind.contactos_emergencia', 'emergencies verification_status=verified', 'emergencies', 'count', 70)
on conflict (key) do nothing;

-- 15) Fuentes oficiales consultadas (2026-10-05) ------------------------------------------
insert into public.strategic_sources (id, institution, document, year, source_name, source_url, excerpt, consulted_at, verified_at, last_verified_at, verification_expiry, notes) values
  ('pnlcp_dh_lineamiento_viii', 'Gobierno de Reconciliación y Unidad Nacional', 'Plan Nacional de Lucha contra la Pobreza y para el Desarrollo Humano 2022-2026 — Lineamiento "Desarrollar la economía creativa, familiar y emprendedora, con énfasis en modelos asociativos"', '2022-2026',
   'PNLCP-DH 2022-2026 (pndh.gob.ni)', 'https://www.pndh.gob.ni/documentos/pndhActualizado/08_LINEAMIENTO_VIII_(19jul21).pdf',
   'Incluye la Política Nacional de Turismo (desarrollo sostenible del sector; reducción de la pobreza y mejora de la calidad de vida) con líneas: Promoción Turística; Diferenciación y diversificación de la oferta turística (turismo creativo y cultural, Estrategia de Desarrollo del Turismo Rural, rutas, productos y mapas turísticos); asistencia técnica en digitalización empresarial y comercialización en redes; Política de Patrimonio Cultural complementaria con el Turismo y la Economía Creativa.',
   '2026-10-05', '2026-10-05', '2026-10-05', '2027-04-05', 'Texto extraído del PDF oficial el 2026-10-05.'),
  ('intur_2026', 'Instituto Nicaragüense de Turismo (INTUR)', 'Así impulsará Intur el turismo en Nicaragua en 2026', '2026',
   'INTUR — intur.gob.ni', 'https://www.intur.gob.ni/2026/01/13/asi-impulsara-intur-el-turismo-en-nicaragua-en-2026/',
   'Objetivo: "Fortalecer el turismo como motor de desarrollo humano, económico y social, con el protagonismo de las familias nicaragüenses". Ejes: Promoción turística; Diferenciación y diversificación de la oferta turística; Mejora de la infraestructura turística; Formación y capacitación; Mejora de la calidad de los servicios turísticos; Enlazamiento y complementariedad; Modelo de presencia y comunicación directa.',
   '2026-10-05', '2026-10-05', '2026-10-05', '2027-01-31', 'Plan anual: vence al cierre del ejercicio 2026.'),
  ('intur_turismo_rural', 'Instituto Nicaragüense de Turismo (INTUR)', 'Turismo Rural y Comunitario', null,
   'INTUR — Turismo Rural y Comunitario', 'https://www.intur.gob.ni/turismo-rural-y-comunitario/',
   'La Ley General de Turismo reconoce el Turismo Rural y Comunitario como modalidad estratégica: fortalece economías locales, genera empleo, brinda oportunidades a mujeres y jóvenes, impulsa el desarrollo territorial; rescata la identidad cultural, protege la biodiversidad y conserva el patrimonio.',
   '2026-10-05', '2026-10-05', '2026-10-05', '2027-04-05', null),
  ('ene_2024_2026', 'Comisión Nacional de Educación (MINED, INATEC/Tecnológico Nacional, CNU)', 'Estrategia Nacional de Educación en todas sus Modalidades "Bendiciones y Victorias" 2024-2026', '2024-2026',
   'Estrategia Nacional de Educación 2024-2026 (PDF publicado por UNAN-Managua)', 'https://www.unan.edu.ni/wp-content/uploads/Estrategia_Nacional_Educacion-2024-2026.pdf',
   '16 ejes y 70 lineamientos verificados en el documento. El número de acciones no se confirmó por extracción automática (se contaron 126 marcadores de acción).',
   '2026-10-05', '2026-10-05', '2026-10-05', '2027-01-31', 'Estrategia con vigencia hasta 2026.'),
  ('mined_ene_presentacion', 'Ministerio de Educación (MINED)', 'Gobierno de Nicaragua presenta Nueva Estrategia Nacional de Educación', '2024',
   'MINED — mined.gob.ni', 'https://www.mined.gob.ni/gobierno-de-nicaragua-presenta-nueva-estrategia-nacional-de-educacion/',
   'Presentación oficial de la Estrategia; menciona, entre otros, los ejes Educación Creativa, Historia e Identidad Nacional, Investigación e Innovación, Ambientes Naturales y Cambio Climático.',
   '2026-10-05', '2026-10-05', '2026-10-05', '2027-01-31', null),
  ('marena_sinap', 'Ministerio del Ambiente y los Recursos Naturales (MARENA)', 'Sistema Nacional de Áreas Protegidas (SINAP) — portal institucional', null,
   'MARENA — marena.gob.ni', 'https://www.marena.gob.ni/',
   'El portal de MARENA informa 4 reservas de biosfera y 76 áreas protegidas (zonas núcleo).',
   '2026-10-05', '2026-10-05', '2026-10-05', '2027-04-05', 'Cifras tal como las muestra el portal al 2026-10-05.')
on conflict (id) do nothing;

-- 16) Matriz de alineación (contribución de BAQUEANO; ninguna fila es "official") -------------
insert into public.national_alignment (id, national_framework, axis_code, axis_name, lineamiento, accion, description, baqueano_component, alignment_type, evidence, indicator_keys, source_id, source_name, source_url, verified_at, last_verified_at, verification_expiry, sort_order) values
  ('pnlcp_turismo_promocion', 'pnlcp_dh_2022_2026', 'VIII.TUR.1', 'Política Nacional de Turismo — Promoción Turística', 'Posicionar a Nicaragua como destino diverso e integral', null,
   'El PNLCP-DH 2022-2026 plantea la promoción turística de Nicaragua. BAQUEANO contribuye publicando destinos, rutas y experiencias en 6 idiomas con SEO y mapa interactivo.',
   'Destinos · Mapa · Multilenguaje (ES/EN/FR/IT/PT/DE) · SEO', 'direct', 'Portal público con catálogo territorial de 17 departamentos/regiones y sitemap; catálogo i18n en 6 idiomas (puerta CI npm run i18n).',
   array['destinos_publicados', 'departamentos_cubiertos', 'visitas_generadas'], 'pnlcp_dh_lineamiento_viii', 'PNLCP-DH 2022-2026 (pndh.gob.ni)', 'https://www.pndh.gob.ni/documentos/pndhActualizado/08_LINEAMIENTO_VIII_(19jul21).pdf', '2026-10-05', '2026-10-05', '2027-04-05', 10),
  ('pnlcp_turismo_diversificacion', 'pnlcp_dh_2022_2026', 'VIII.TUR.2', 'Política Nacional de Turismo — Diferenciación y diversificación de la oferta turística', 'Turismo creativo y cultural; Estrategia de Desarrollo del Turismo Rural; rutas, corredores y mapas turísticos', null,
   'El PNLCP-DH impulsa el turismo creativo, cultural y rural con rutas y mapas turísticos. BAQUEANO contribuye con rutas, BAQUI (itinerarios), experiencias comunitarias y un mapa por territorio.',
   'Rutas · BAQUI · Experiencias · Mapa por territorio · Turismo rural', 'direct', 'Catálogo de iniciativas de la Revista INTUR de Turismo Rural y Comunitario 2026 cargado por territorio; BAQUI genera itinerarios con lugares del catálogo.',
   array['rutas_creadas', 'experiencias_publicadas', 'itinerarios_generados', 'experiencias_comunitarias'], 'pnlcp_dh_lineamiento_viii', 'PNLCP-DH 2022-2026 (pndh.gob.ni)', 'https://www.pndh.gob.ni/documentos/pndhActualizado/08_LINEAMIENTO_VIII_(19jul21).pdf', '2026-10-05', '2026-10-05', '2027-04-05', 11),
  ('pnlcp_economia_creativa', 'pnlcp_dh_2022_2026', 'VIII', 'Desarrollar la economía creativa, familiar y emprendedora, con énfasis en modelos asociativos', 'Asistencia técnica en digitalización empresarial y comercialización en redes', null,
   'El PNLCP-DH identifica el desarrollo de la economía creativa, familiar y emprendedora como lineamiento. BAQUEANO contribuye digitalizando y visibilizando emprendimientos turísticos locales (Mi Negocio, ficha pública, contacto directo sin comisión).',
   'Mi Negocio · Ops Center (verificación) · Protagonista local', 'direct', 'Registro de negocios en Mi Negocio y verificación con trazabilidad en Ops Center (verification_status, verified_at, fuente).',
   array['negocios_locales', 'emprendimientos_familiares', 'cooperativas', 'mujeres_emprendedoras', 'jovenes_emprendedores'], 'pnlcp_dh_lineamiento_viii', 'PNLCP-DH 2022-2026 (pndh.gob.ni)', 'https://www.pndh.gob.ni/documentos/pndhActualizado/08_LINEAMIENTO_VIII_(19jul21).pdf', '2026-10-05', '2026-10-05', '2027-04-05', 12),
  ('pnlcp_patrimonio', 'pnlcp_dh_2022_2026', 'VIII.PAT', 'Política de Patrimonio Cultural (complementaria con el Turismo y la Economía Creativa)', 'Identificar, documentar y divulgar el patrimonio y las tradiciones', null,
   'El PNLCP-DH orienta la Política de Patrimonio Cultural a resguardar y divulgar tradiciones e identidad. BAQUEANO contribuye documentando historia, música, gastronomía y tradiciones vinculadas a cada destino.',
   'Historia de mi País · Música · Gastronomía · Crónicas', 'supporting', 'Páginas públicas historia.html, musica.html, gastronomia.html y cronicas.html; tablas culturales en Supabase (heritage, music, gastronomy, crafts, festivals) aún sin registros migrados.',
   array[]::text[], 'pnlcp_dh_lineamiento_viii', 'PNLCP-DH 2022-2026 (pndh.gob.ni)', 'https://www.pndh.gob.ni/documentos/pndhActualizado/08_LINEAMIENTO_VIII_(19jul21).pdf', '2026-10-05', '2026-10-05', '2027-04-05', 13),
  ('intur26_promocion', 'intur_2026', 'INTUR-1', 'Promoción turística', null, null,
   'INTUR 2026 impulsa la promoción de Nicaragua como destino seguro, auténtico, sostenible y accesible. BAQUEANO presenta capacidades funcionales compatibles: destinos, SEO, redes y multilenguaje.',
   'Destinos · SEO · Redes · Multilenguaje', 'direct', 'Sitio público indexable con sitemap y 6 idiomas.', array['destinos_publicados', 'visitas_generadas'],
   'intur_2026', 'INTUR — intur.gob.ni', 'https://www.intur.gob.ni/2026/01/13/asi-impulsara-intur-el-turismo-en-nicaragua-en-2026/', '2026-10-05', '2026-10-05', '2027-01-31', 20),
  ('intur26_diversificacion', 'intur_2026', 'INTUR-2', 'Diferenciación y diversificación de la oferta turística', null, null,
   'INTUR 2026 prevé rutas, corredores, circuitos y mapas turísticos. BAQUEANO presenta capacidades compatibles: rutas, experiencias, BAQUI y turismo rural, cultural y comunitario.',
   'Rutas · Experiencias · BAQUI · Turismo rural y comunitario', 'direct', 'Itinerarios de BAQUI con lugares del catálogo; filtros de turismo rural en destinos.html.', array['rutas_creadas', 'experiencias_publicadas', 'itinerarios_generados'],
   'intur_2026', 'INTUR — intur.gob.ni', 'https://www.intur.gob.ni/2026/01/13/asi-impulsara-intur-el-turismo-en-nicaragua-en-2026/', '2026-10-05', '2026-10-05', '2027-01-31', 21),
  ('intur26_infraestructura', 'intur_2026', 'INTUR-3', 'Mejora de la infraestructura turística', null, null,
   'BAQUEANO no construye infraestructura; contribuye con un catálogo georreferenciado de servicios (hospedajes, comedores, transporte) para que el visitante los encuentre.',
   'Catálogo georreferenciado de servicios', 'supporting', 'Coordenadas con precisión declarada (exact/centroid/reference) en el catálogo territorial.', array['negocios_locales'],
   'intur_2026', 'INTUR — intur.gob.ni', 'https://www.intur.gob.ni/2026/01/13/asi-impulsara-intur-el-turismo-en-nicaragua-en-2026/', '2026-10-05', '2026-10-05', '2027-01-31', 22),
  ('intur26_formacion', 'intur_2026', 'INTUR-4', 'Formación y capacitación', null, null,
   'BAQUEANO LAB documenta aprendizajes prácticos (programación, mapas, IA, UX, turismo). Es una contribución educativa del proyecto, no un programa de INTUR.',
   'BAQUEANO LAB', 'potential', 'Registros de evidencia de sprint (sprint_evidence_records).', array[]::text[],
   'intur_2026', 'INTUR — intur.gob.ni', 'https://www.intur.gob.ni/2026/01/13/asi-impulsara-intur-el-turismo-en-nicaragua-en-2026/', '2026-10-05', '2026-10-05', '2027-01-31', 23),
  ('intur26_calidad', 'intur_2026', 'INTUR-5', 'Mejora de la calidad de los servicios turísticos', null, null,
   'BAQUEANO apoya la calidad de la información: verificación con fuente, fecha y vigencia, y valoraciones de visitantes. No sustituye la categorización ni la certificación de INTUR.',
   'Ops Center · Verificación · Reseñas', 'supporting', 'Campos verification_status, verified_at, valid_until y source_url en negocios y destinos.', array['negocios_verificados'],
   'intur_2026', 'INTUR — intur.gob.ni', 'https://www.intur.gob.ni/2026/01/13/asi-impulsara-intur-el-turismo-en-nicaragua-en-2026/', '2026-10-05', '2026-10-05', '2027-01-31', 24),
  ('intur26_enlazamiento', 'intur_2026', 'INTUR-6', 'Enlazamiento y complementariedad', null, null,
   'INTUR 2026 promueve alianzas entre el sector turístico y los pequeños negocios. BAQUEANO conecta al turista con negocios locales, proveedores y experiencias (WhatsApp, llamada, cómo llegar, reserva).',
   'Negocios locales · Contacto directo · Reservas', 'direct', 'Embudo medible en impact_events (whatsapp_click, call_click, directions_click, reservation_start).', array['clics_whatsapp', 'clics_como_llegar', 'reservas_iniciadas'],
   'intur_2026', 'INTUR — intur.gob.ni', 'https://www.intur.gob.ni/2026/01/13/asi-impulsara-intur-el-turismo-en-nicaragua-en-2026/', '2026-10-05', '2026-10-05', '2027-01-31', 25),
  ('intur26_comunicacion', 'intur_2026', 'INTUR-7', 'Modelo de presencia y comunicación directa', null, null,
   'BAQUEANO presenta capacidades compatibles: comunidad, testimonios moderados y contacto local directo.',
   'Testimonios · Comunidad · Contacto local', 'supporting', 'Testimonios con moderación en Ops Center (testimonials).', array[]::text[],
   'intur_2026', 'INTUR — intur.gob.ni', 'https://www.intur.gob.ni/2026/01/13/asi-impulsara-intur-el-turismo-en-nicaragua-en-2026/', '2026-10-05', '2026-10-05', '2027-01-31', 26),
  ('intur_rural_comunitario', 'ley_turismo_rural', 'TRC', 'Turismo Rural y Comunitario (Ley General de Turismo, según INTUR)', null, null,
   'Según INTUR, el turismo rural y comunitario fortalece las economías locales, genera empleo, brinda oportunidades a mujeres y jóvenes y protege identidad, biodiversidad y patrimonio. BAQUEANO contribuye visibilizando estas iniciativas con la insignia "Experiencia Comunitaria" (solo tras verificación).',
   'Experiencia Comunitaria · Filtros de turismo rural · Mapa', 'direct', '27 iniciativas de la Revista INTUR 2026 cargadas en el catálogo territorial; insignia con verificación en community_impact.', array['experiencias_comunitarias', 'negocios_rurales'],
   'intur_turismo_rural', 'INTUR — Turismo Rural y Comunitario', 'https://www.intur.gob.ni/turismo-rural-y-comunitario/', '2026-10-05', '2026-10-05', '2027-04-05', 30),
  ('ene_eje3_creativa', 'ene_2024_2026', 'EJE 3', 'Educación Creativa', '14. Promoveremos iniciativas que proyecten habilidades, capacidades y destrezas de estudiantes y docentes para emprender acciones creativas e innovadoras.', 'Plataforma de creatividad e innovación para el desarrollo de proyectos',
   'BAQUEANO es un proyecto práctico de creatividad e innovación (Flutter, web, IA, mapas). Contribución educativa del proyecto; no es un programa oficial del MINED, INATEC ni CNU.',
   'BAQUEANO LAB', 'supporting', 'Repositorio público del proyecto y registros de evidencia de sprint.', array[]::text[],
   'ene_2024_2026', 'Estrategia Nacional de Educación 2024-2026', 'https://www.unan.edu.ni/wp-content/uploads/Estrategia_Nacional_Educacion-2024-2026.pdf', '2026-10-05', '2026-10-05', '2027-01-31', 40),
  ('ene_eje4_cultura', 'ene_2024_2026', 'EJE 4', 'Educación Artística y Cultural', '18. Promoveremos el valor de la cultura popular nicaragüense y el conocimiento ancestral, en todos los niveles educativos.', null,
   'BAQUEANO difunde cultura popular, música y gastronomía nicaragüenses en sus páginas públicas, con fines de divulgación abiertos a la comunidad educativa.',
   'Música · Gastronomía · Historia de mi País', 'supporting', 'Páginas musica.html, gastronomia.html e historia.html.', array[]::text[],
   'ene_2024_2026', 'Estrategia Nacional de Educación 2024-2026', 'https://www.unan.edu.ni/wp-content/uploads/Estrategia_Nacional_Educacion-2024-2026.pdf', '2026-10-05', '2026-10-05', '2027-01-31', 41),
  ('ene_eje5_identidad', 'ene_2024_2026', 'EJE 5', 'Historia e Identidad Nacional', '20. Fomentaremos la investigación sobre la historia e identidad cultural.', null,
   'BAQUEANO documenta historia local y nacional vinculada a destinos (Historia de mi País, crónicas, audioguía).',
   'Historia de mi País · Crónicas · Audioguía', 'supporting', 'historia.html con épocas y audioguía; cronicas.html.', array[]::text[],
   'ene_2024_2026', 'Estrategia Nacional de Educación 2024-2026', 'https://www.unan.edu.ni/wp-content/uploads/Estrategia_Nacional_Educacion-2024-2026.pdf', '2026-10-05', '2026-10-05', '2027-01-31', 42),
  ('ene_eje6_ambiente', 'ene_2024_2026', 'EJE 6', 'Ambiente y Naturaleza', '23. Promoveremos el cuido y conservación del agua y el suelo, como recurso natural y fuente de vida.', null,
   'La Ficha de Sostenibilidad BAQUEANO registra prácticas como conservación de agua y reciclaje ("Práctica reportada" / "Práctica verificada por BAQUEANO").',
   'Ficha de Sostenibilidad · ambiental.html', 'potential', 'Tabla sustainability_practices creada; sin registros a la fecha.', array['practicas_verificadas'],
   'ene_2024_2026', 'Estrategia Nacional de Educación 2024-2026', 'https://www.unan.edu.ni/wp-content/uploads/Estrategia_Nacional_Educacion-2024-2026.pdf', '2026-10-05', '2026-10-05', '2027-01-31', 43),
  ('ene_eje7_clima', 'ene_2024_2026', 'EJE 7', 'Cambio Climático', '27. Fortaleceremos la sensibilización sobre la mitigación y adaptación al cambio climático.', null,
   'BAQUEANO informa sobre áreas protegidas y prácticas sostenibles reportadas por destino y negocio, y sobre el clima de la ruta.',
   'Ficha de Sostenibilidad · Clima de ruta · Áreas protegidas', 'potential', 'Catálogo de naturaleza protegida por departamento; módulo de clima en rutas.', array['practicas_verificadas'],
   'ene_2024_2026', 'Estrategia Nacional de Educación 2024-2026', 'https://www.unan.edu.ni/wp-content/uploads/Estrategia_Nacional_Educacion-2024-2026.pdf', '2026-10-05', '2026-10-05', '2027-01-31', 44),
  ('ene_eje11_innovacion', 'ene_2024_2026', 'EJE 11', 'Investigación e Innovación', '40. Promoveremos la incubación de proyectos técnicos de estudiantes y docentes para la creación de modelos de negocios y protección de propiedad intelectual, desde la plataforma INNOVATEC.', null,
   'BAQUEANO es un proyecto tecnológico aplicable a retos como INNOVATEC o Hackathon Nicaragua. Contribución o alineación del proyecto; no implica participación oficial salvo inscripción documentada.',
   'BAQUEANO LAB · BAQUI (IA) · Supabase · Mapas', 'potential', 'Arquitectura documentada en el repositorio; inscripción en INNOVATEC/Hackathon no registrada en esta base.', array[]::text[],
   'ene_2024_2026', 'Estrategia Nacional de Educación 2024-2026', 'https://www.unan.edu.ni/wp-content/uploads/Estrategia_Nacional_Educacion-2024-2026.pdf', '2026-10-05', '2026-10-05', '2027-01-31', 45),
  ('marena_areas_protegidas', 'marena_sinap', 'SINAP', 'Sistema Nacional de Áreas Protegidas', null, null,
   'MARENA administra el SINAP (el portal informa 76 áreas protegidas). BAQUEANO contribuye ubicando reservas, parques y refugios en su departamento con fuente, y orienta a visitarlos de forma responsable. No otorga sellos ambientales oficiales.',
   'Catálogo de naturaleza protegida · Ficha de Sostenibilidad', 'supporting', 'Catálogo de naturaleza protegida (lagunas, volcanes, reservas, parques) en destinos.html.', array['practicas_verificadas'],
   'marena_sinap', 'MARENA — marena.gob.ni', 'https://www.marena.gob.ni/', '2026-10-05', '2026-10-05', '2027-04-05', 50)
on conflict (id) do nothing;
