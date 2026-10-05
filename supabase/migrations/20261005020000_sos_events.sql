-- ============================================================================
-- 🆘 BAQUEANO — ALERTAS SOS TRAZABLES (App Android + Web → Ops Center)
-- ============================================================================
-- 🎯 POR QUÉ: la pantalla SOS solo abría la llamada o el SMS; el Centro de
--    Operaciones nunca sabía que un viajero pidió ayuda ni dónde estaba.
-- ⚙️ CÓMO: tabla con RLS activado y SIN políticas públicas: nadie la lee ni la
--    escribe con la clave publicable. Solo la Edge Function `baqueano-community`
--    (service_role) inserta, tras verificar el ID token de Firebase, y el
--    personal autorizado la consulta/actualiza a través de esa misma función.
--    La ubicación es un dato sensible: no se expone a otros usuarios.
-- 📦 QUÉ: `public.sos_events` + índices + historial de estados.
-- ============================================================================

create table if not exists public.sos_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reporter_uid text not null,
  reporter_email text,
  reporter_name text,
  channel text not null default 'android' check (channel in ('android', 'web')),
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  accuracy_m double precision check (accuracy_m is null or accuracy_m >= 0),
  location_status text not null default 'unavailable'
    check (location_status in ('gps', 'unavailable', 'denied', 'disabled')),
  dialed_service text check (dialed_service is null or dialed_service ~ '^[0-9+]{3,15}$'),
  note text check (note is null or char_length(note) <= 500),
  status text not null default 'open'
    check (status in ('open', 'acknowledged', 'resolved', 'false_alarm')),
  handled_by text,
  handled_at timestamptz,
  history jsonb not null default '[]'::jsonb,
  constraint sos_events_coords_pair check ((latitude is null) = (longitude is null))
);

create index if not exists sos_events_created_at_idx on public.sos_events (created_at desc);
create index if not exists sos_events_status_idx on public.sos_events (status, created_at desc);
create index if not exists sos_events_reporter_idx on public.sos_events (reporter_uid, created_at desc);

alter table public.sos_events enable row level security;

-- Sin políticas para anon/authenticated: acceso exclusivo del servidor.
revoke all on public.sos_events from anon, authenticated;

comment on table public.sos_events is
  'Alertas SOS de viajeros. Acceso solo vía Edge Function baqueano-community (service_role) con token Firebase verificado.';
