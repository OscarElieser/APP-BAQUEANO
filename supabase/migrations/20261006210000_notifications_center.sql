-- ============================================================================
-- 🧭 BAQUEANO — CENTRO DE NOTIFICACIONES (20261006210000_notifications_center.sql)
-- ============================================================================
-- 🎯 POR QUÉ: campana 🔔 en web y Android con estados nueva / leída / archivada (pedido del
--   propietario 2026-10-06). Firebase autentica; Supabase guarda los avisos.
-- ⚙️ CÓMO: recipient_uid = UID de Firebase verificado por la Edge Function baqueano-notifications.
--   Los textos se guardan como claves i18n + params (se pintan en el idioma de cada persona).
--   dedupe_key con índice único evita avisos repetidos. RLS activo y solo service_role.
--   No se borra: trigger que impide DELETE ("eliminar" = archivar).
-- 📦 QUÉ: tabla public.notifications + trigger notifications_no_delete.
--   Productores actuales: baqueano-reviews (opinión aprobada / rechazada / respondida).
--   Evolución: con "Third-party auth: Firebase" activado en Supabase, se puede sumar
--   Realtime nativo (postgres_changes) con RLS por auth.jwt()->>'sub'.
-- ============================================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_uid text not null check (length(recipient_uid) between 1 and 128),
  type text not null check (type in ('review_approved', 'review_rejected', 'review_response', 'message', 'reply',
    'business_approved', 'business_verified', 'business_update', 'account', 'security', 'news', 'system', 'alert')),
  title_key text not null check (title_key ~ '^[A-Za-z0-9_.]{1,80}$'),
  body_key text check (body_key is null or body_key ~ '^[A-Za-z0-9_.]{1,80}$'),
  params jsonb not null default '{}'::jsonb check (jsonb_typeof(params) = 'object' and length(params::text) <= 2000),
  link text check (link is null or (link ~ '^/[A-Za-z0-9/_.?=&#-]{0,200}$')),
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  source text not null default 'system' check (length(source) <= 40),
  ref_id text check (ref_id is null or length(ref_id) <= 80),
  dedupe_key text check (dedupe_key is null or length(dedupe_key) <= 160),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  archived_at timestamptz
);
comment on table public.notifications is 'Centro de notificaciones (web y Android). recipient_uid = UID de Firebase verificado. Textos como claves i18n + params. Solo service_role (Edge Function baqueano-notifications).';
create index if not exists notifications_recipient_idx on public.notifications (recipient_uid, status, created_at desc);
create unique index if not exists notifications_dedupe_idx on public.notifications (recipient_uid, dedupe_key) where dedupe_key is not null;
alter table public.notifications enable row level security;
revoke all on table public.notifications from public, anon, authenticated;
grant all on table public.notifications to service_role;

create or replace function public.notifications_no_delete() returns trigger
language plpgsql set search_path = '' as $$
begin
  raise exception 'notifications no se borra: se archiva (status = archived)';
end $$;
create or replace trigger notifications_no_delete before delete on public.notifications
  for each row execute function public.notifications_no_delete();
