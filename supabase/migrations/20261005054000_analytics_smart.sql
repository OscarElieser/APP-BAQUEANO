-- ============================================================================
-- 🧭 BAQUEANO — ANALÍTICA SMART: EVENTOS, ACCIONES COMERCIALES, ATRIBUCIÓN,
--    FEEDBACK, ACTIVACIÓN Y KPIs CALCULADOS EN EL BACKEND
-- ============================================================================
-- 🎯 POR QUÉ (auditoría BD B-6):
--   Ningún objetivo SMART se podía demostrar desde la BD: no existían eventos de
--   producto, acciones comerciales, atribución de campañas ni valoraciones. Los
--   KPIs dependían de cifras escritas en documentos.
-- ⚙️ CÓMO:
--   - `analytics_event_types` (tabla de catálogo, no ENUM: evoluciona sin
--     ALTER TYPE) define cada evento, su etapa AARRR, si cuenta para la
--     ACTIVACIÓN y si el cliente puede emitirlo.
--   - `analytics_events` (alto volumen, append-only), `campaign_attribution`
--     (UTM una vez por sesión, no repetidas en cada evento), `commercial_actions`
--     (WhatsApp, llamada, reserva…, enlazadas a negocio/destino/sesión/campaña),
--     `user_feedback` (rating 1–5 + utilidad + función evaluada).
--   - Identidad del actor: `user_id` (Supabase Auth, lo fija el servidor con
--     auth.uid(); nunca viene del cliente) o `anonymous_id` del dispositivo.
--     `legacy_uid` (Firebase) solo lo escribe una Edge Function que verificó el
--     token.
--   - Ingesta: RPC `track_event`, `track_commercial_action`, `submit_feedback`
--     (SECURITY DEFINER, validan catálogo, tamaño de metadata y límite por hora).
--     Las tablas no aceptan escritura directa de clientes.
--   - KPIs: `kpi_dashboard(desde, hasta)` devuelve JSON con valores,
--     numeradores, denominadores y estado de datos ("Sin datos suficientes"
--     cuando el denominador es 0). Solo staff con `analytics.read`.
--   - Definición oficial: REGISTRADO ≠ ACTIVADO. Activado = actor con ≥ 1
--     evento marcado `is_activation` (favorito, viaje, BAQUI, itinerario,
--     consulta, solicitud de reserva, experiencia publicada).
-- 📦 QUÉ: indicadores reproducibles por SQL, consumibles por Ops Center, web
--   y app con el mismo backend. Sin datos inventados.
-- ============================================================================

-- Catálogo de eventos -----------------------------------------------------------
create table if not exists public.analytics_event_types (
  name text primary key check (name ~ '^[a-z][a-z0-9_]{2,60}$'),
  description text not null,
  funnel_stage text not null check (funnel_stage in ('acquisition', 'activation', 'retention', 'referral', 'revenue', 'engagement')),
  is_activation boolean not null default false,
  client_allowed boolean not null default true,
  created_at timestamptz not null default now()
);
comment on table public.analytics_event_types is 'Catálogo de eventos de producto (lookup table). is_activation define la ACTIVACIÓN oficial; client_allowed = puede emitirse desde web/app.';

insert into public.analytics_event_types (name, description, funnel_stage, is_activation, client_allowed) values
  ('page_viewed',            'Vista de página o pantalla',                                  'acquisition', false, true),
  ('session_started',        'Inicio de sesión de navegación (primera vista de la sesión)',   'acquisition', false, true),
  ('user_registered',        'Cuenta creada (lo emite el servidor)',                        'acquisition', false, false),
  ('user_activated',         'Primera acción relevante (lo emite el servidor)',             'activation',  false, false),
  ('destination_viewed',     'Ficha de destino abierta',                                    'engagement',  false, true),
  ('business_viewed',        'Ficha de negocio abierta',                                    'engagement',  false, true),
  ('experience_viewed',      'Ficha de experiencia abierta',                                'engagement',  false, true),
  ('search_performed',       'Búsqueda realizada',                                          'engagement',  false, true),
  ('map_opened',             'Mapa abierto',                                                'engagement',  false, true),
  ('favorite_added',         'Elemento guardado en favoritos',                              'activation',  true,  true),
  ('trip_created',           'Viaje creado o guardado en Mi Viaje',                         'activation',  true,  true),
  ('baqui_used',             'Consulta a BAQUI',                                            'activation',  true,  true),
  ('itinerary_generated',    'Itinerario generado',                                         'activation',  true,  true),
  ('inquiry_sent',           'Consulta enviada a un negocio',                               'activation',  true,  true),
  ('booking_requested',      'Solicitud de reserva registrada',                             'revenue',     true,  true),
  ('experience_published',   'Experiencia publicada por un emprendedor',                    'activation',  true,  false),
  ('whatsapp_clicked',       'Clic en WhatsApp de un negocio',                              'revenue',     false, true),
  ('phone_clicked',          'Clic en llamar a un negocio',                                 'revenue',     false, true),
  ('directions_clicked',     'Clic en cómo llegar',                                         'revenue',     false, true),
  ('review_created',         'Reseña o testimonio enviado',                                 'retention',   false, true),
  ('experience_shared',      'Experiencia o itinerario compartido',                         'referral',    false, true),
  ('invite_sent',            'Invitación enviada',                                          'referral',    false, true),
  ('language_changed',       'Cambio de idioma',                                            'engagement',  false, true),
  ('feedback_submitted',     'Valoración enviada',                                          'retention',   false, true)
on conflict (name) do nothing;

-- Atribución de campañas (una fila por sesión) -------------------------------
create table if not exists public.campaign_attribution (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique check (char_length(session_id) between 8 and 120),
  anonymous_id text check (anonymous_id is null or char_length(anonymous_id) between 8 and 120),
  user_id uuid references public.profiles(id) on delete set null,
  platform text not null check (platform in ('web', 'android', 'ios')),
  utm_source text check (utm_source is null or char_length(utm_source) <= 100),
  utm_medium text check (utm_medium is null or char_length(utm_medium) <= 100),
  utm_campaign text check (utm_campaign is null or char_length(utm_campaign) <= 150),
  utm_content text check (utm_content is null or char_length(utm_content) <= 150),
  utm_term text check (utm_term is null or char_length(utm_term) <= 150),
  referrer_domain text check (referrer_domain is null or char_length(referrer_domain) <= 200),
  landing_path text check (landing_path is null or char_length(landing_path) <= 300),
  first_seen_at timestamptz not null default now()
);
create index if not exists idx_campaign_attribution_campaign on public.campaign_attribution (utm_source, utm_campaign, first_seen_at desc);
create index if not exists idx_campaign_attribution_seen on public.campaign_attribution (first_seen_at desc);
comment on table public.campaign_attribution is 'UTM y canal de llegada una vez por sesión (no se repiten columnas UTM en cada evento).';

-- Eventos de producto -----------------------------------------------------------
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null references public.analytics_event_types(name),
  occurred_at timestamptz not null default now(),
  user_id uuid references public.profiles(id) on delete set null,
  legacy_uid text check (legacy_uid is null or char_length(legacy_uid) <= 128),
  anonymous_id text check (anonymous_id is null or char_length(anonymous_id) between 8 and 120),
  session_id text check (session_id is null or char_length(session_id) between 8 and 120),
  platform text not null check (platform in ('web', 'android', 'ios', 'ops', 'server')),
  entity_type text check (entity_type is null or entity_type ~ '^[a-z_]{2,40}$'),
  entity_id text check (entity_id is null or char_length(entity_id) <= 160),
  department_id text references public.departments(id) on delete set null,
  language text check (language is null or language in ('es', 'en', 'fr', 'it', 'pt', 'de')),
  path text check (path is null or char_length(path) <= 300),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object' and pg_column_size(metadata) <= 4096),
  check (user_id is not null or legacy_uid is not null or anonymous_id is not null)
);
create index if not exists idx_analytics_events_name_time on public.analytics_events (event_name, occurred_at desc);
create index if not exists idx_analytics_events_time on public.analytics_events (occurred_at desc);
create index if not exists idx_analytics_events_user on public.analytics_events (user_id, occurred_at) where user_id is not null;
create index if not exists idx_analytics_events_anon on public.analytics_events (anonymous_id, occurred_at) where anonymous_id is not null;
create index if not exists idx_analytics_events_entity on public.analytics_events (entity_type, entity_id) where entity_id is not null;
comment on table public.analytics_events is 'Eventos de producto append-only (web, Android, iOS, Ops, servidor). Sin PII: no se guarda IP, correo ni teléfono.';

-- Acciones comerciales -----------------------------------------------------------
create table if not exists public.commercial_actions (
  id uuid primary key default gen_random_uuid(),
  action_type text not null check (action_type in ('whatsapp', 'call', 'contact', 'booking_request', 'day_pass_request', 'directions', 'message')),
  occurred_at timestamptz not null default now(),
  user_id uuid references public.profiles(id) on delete set null,
  legacy_uid text check (legacy_uid is null or char_length(legacy_uid) <= 128),
  anonymous_id text check (anonymous_id is null or char_length(anonymous_id) between 8 and 120),
  session_id text check (session_id is null or char_length(session_id) between 8 and 120),
  business_id text references public.businesses(id) on delete set null,
  destination_id text references public.destinations(id) on delete set null,
  experience_id text references public.experiences(id) on delete set null,
  reservation_id uuid references public.reservations(id) on delete set null,
  campaign_attribution_id uuid references public.campaign_attribution(id) on delete set null,
  platform text not null check (platform in ('web', 'android', 'ios', 'server')),
  is_qualified boolean not null default true,
  check (user_id is not null or legacy_uid is not null or anonymous_id is not null),
  check (business_id is not null or destination_id is not null or experience_id is not null)
);
create index if not exists idx_commercial_actions_time on public.commercial_actions (occurred_at desc);
create index if not exists idx_commercial_actions_business on public.commercial_actions (business_id, occurred_at desc);
create index if not exists idx_commercial_actions_type on public.commercial_actions (action_type, occurred_at desc);
comment on table public.commercial_actions is 'Intención comercial medible (contacto directo con el prestador). Calificada = acción con destino real (negocio/destino/experiencia existente) emitida por un actor identificable.';

-- Valoraciones -------------------------------------------------------------------
create table if not exists public.user_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references public.profiles(id) on delete set null,
  legacy_uid text check (legacy_uid is null or char_length(legacy_uid) <= 128),
  anonymous_id text check (anonymous_id is null or char_length(anonymous_id) between 8 and 120),
  feature text not null check (feature in ('baqui', 'itinerary', 'search', 'map', 'reservation', 'business_profile', 'destination', 'app', 'web', 'other')),
  rating smallint not null check (rating between 1 and 5),
  usefulness smallint check (usefulness is null or usefulness between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 1000),
  language text check (language is null or language in ('es', 'en', 'fr', 'it', 'pt', 'de')),
  platform text not null check (platform in ('web', 'android', 'ios')),
  entity_type text,
  entity_id text,
  check (user_id is not null or legacy_uid is not null or anonymous_id is not null)
);
create index if not exists idx_user_feedback_time on public.user_feedback (created_at desc);
create index if not exists idx_user_feedback_feature on public.user_feedback (feature, created_at desc);
comment on table public.user_feedback is 'Valoraciones de usuarios. Positiva = rating >= 4. KPI: positivas / totales.';

-- RLS: solo servidor; la ingesta pasa por RPC validadas ---------------------------
do $$
declare t text;
begin
  foreach t in array array['analytics_event_types','campaign_attribution','analytics_events','commercial_actions','user_feedback'] loop
    execute format('alter table public.%I enable row level security', t);
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = t and policyname = 'Solo servidor (Edge Functions)') then
      execute format('create policy "Solo servidor (Edge Functions)" on public.%I as restrictive for all to anon, authenticated using (false) with check (false)', t);
    end if;
    execute format('revoke all on public.%I from public, anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end $$;

-- Permiso de lectura analítica --------------------------------------------------
insert into public.permissions (id, description, critical)
values ('analytics.read', 'Leer KPIs, analítica de producto y reporte de salud de la BD', false)
on conflict (id) do nothing;
insert into public.role_permissions (role_id, permission_id)
select r.id, 'analytics.read' from public.roles r where r.id in ('auditor', 'admin', 'superadmin')
on conflict do nothing;
