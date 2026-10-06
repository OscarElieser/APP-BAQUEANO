-- ============================================================================
-- 🧭 BAQUEANO — PRESENCIA REAL Y ACTIVIDAD EN VIVO (20261006200000_realtime_presence.sql)
-- ============================================================================
-- 🎯 POR QUÉ:
-- - El 2026-10-06 unas 5 personas usaron BAQUEANO a la vez y el Ops Center no las mostró.
--   Causas comprobadas en la base:
--   1. La analítica (analytics_events) solo se envía con consentimiento de analítica:
--      ese día hubo 9 visitantes anónimos y un solo consent_updated.
--   2. El Ops Center solo tenía "activos 7/30 días"; ninguna métrica de "ahora".
--   3. La web inicia sesión con Firebase y analytics_events usa auth.uid() de Supabase:
--      user_id siempre llegaba vacío (0 usuarios identificados).
--   4. Android no envía ningún evento.
--   5. El rastreador antiguo (traffic_sessions, con IP de terceros) quedó bloqueado en
--      20261003213000 y no lo carga ninguna página: tabla vacía.
--
-- ⚙️ CÓMO:
-- - Presencia operativa mínima, sin identificadores persistentes:
--   - tab_id: aleatorio por pestaña, en memoria;
--   - browser_id: aleatorio, compartido entre pestañas del mismo navegador por
--     BroadcastChannel, nunca guardado;
--   - user_uid solo si la Edge Function verificó el token de Firebase.
--   - Sin IP, sin user agent completo y sin geolocalización.
-- - Solo la Edge Function baqueano-presence (service_role) escribe y lee. RLS activo y
--   acceso revocado a anon/authenticated.
-- - Persona ≠ sesión ≠ pestaña: personas = distinct coalesce(user_uid, browser_id);
--   sesiones = distinct browser_id; pestañas = filas.
-- - "En línea" = last_seen en los últimos 90 s (heartbeat 25 s visible / 60 s oculto).
-- - Nada se borra: las filas viejas quedan con ended_at y sirven al historial diario.
--
-- 📦 QUÉ:
-- - Tablas presence_sessions y presence_events.
-- - Funciones presence_heartbeat(...) y presence_snapshot().
-- ============================================================================

create table if not exists public.presence_sessions (
  tab_id text primary key check (tab_id ~ '^[A-Za-z0-9_-]{16,64}$'),
  browser_id text not null check (browser_id ~ '^[A-Za-z0-9_-]{16,64}$'),
  user_uid text check (user_uid is null or length(user_uid) between 1 and 128),
  user_role text check (user_role is null or user_role in ('explorer', 'auditor', 'admin', 'super_admin')),
  platform text not null default 'web' check (platform in ('web', 'pwa', 'android')),
  device_class text not null default 'desktop' check (device_class in ('mobile', 'tablet', 'desktop')),
  app_version text check (app_version is null or length(app_version) <= 40),
  path text check (path is null or length(path) <= 200),
  language text check (language is null or language in ('es', 'en', 'fr', 'it', 'pt', 'de')),
  visible boolean not null default true,
  started_at timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  ended_at timestamptz
);
comment on table public.presence_sessions is 'Presencia operativa por pestaña. Sin IP ni identificadores persistentes. Solo service_role.';
create index if not exists presence_sessions_last_seen_idx on public.presence_sessions (last_seen desc);
create index if not exists presence_sessions_browser_idx on public.presence_sessions (browser_id);

create table if not exists public.presence_events (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  kind text not null check (kind in ('visit_start', 'page_enter', 'login', 'android_open', 'leave')),
  actor_type text not null check (actor_type in ('visitor', 'user', 'staff')),
  platform text not null check (platform in ('web', 'pwa', 'android')),
  path text check (path is null or length(path) <= 200),
  browser_ref text check (browser_ref is null or length(browser_ref) <= 12)
);
comment on table public.presence_events is 'Hechos de navegación sin datos personales para el feed "Actividad en vivo". browser_ref = 8 caracteres de un hash, solo para agrupar.';
create index if not exists presence_events_occurred_idx on public.presence_events (occurred_at desc);

alter table public.presence_sessions enable row level security;
alter table public.presence_events enable row level security;
revoke all on table public.presence_sessions from public, anon, authenticated;
revoke all on table public.presence_events from public, anon, authenticated;
grant all on table public.presence_sessions to service_role;
grant all on table public.presence_events to service_role;

-- Inmutabilidad del feed: sin UPDATE/DELETE (regla "no eliminar").
create or replace function public.presence_events_immutable() returns trigger
language plpgsql set search_path = '' as $$
begin
  raise exception 'presence_events es de solo inserción';
end $$;
create or replace trigger presence_events_no_change before update or delete on public.presence_events
  for each row execute function public.presence_events_immutable();

-- Las funciones presence_heartbeat, presence_snapshot y presence_feed se aplicaron en
-- migraciones separadas (sin DROP: una sentencia destructiva exige confirmación manual).
-- Ver 20261006200100_realtime_presence_functions.sql.
