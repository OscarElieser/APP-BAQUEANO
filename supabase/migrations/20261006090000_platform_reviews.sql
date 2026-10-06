-- ============================================================================
-- 🧭 BAQUEANO — OPINIONES SOBRE LA PLATAFORMA (platform_reviews)
-- ============================================================================
-- 🎯 POR QUÉ: el propietario pidió (2026-10-06) opiniones auténticas sobre el uso de BAQUEANO.
--   La reputación tiene que salir de evidencia, no de una cifra puesta a mano:
--   - solo usuarios autenticados;
--   - una valoración activa por usuario;
--   - moderación con motivo y auditoría;
--   - promedio y distribución calculados con opiniones aprobadas;
--   - nada privado en lo público.
--   Esta tabla es independiente de `testimonials` (opiniones sobre destinos y experiencias).
-- ⚙️ CÓMO:
--   - Tablas sin acceso directo para anon ni authenticated (RLS activa, sin políticas abiertas).
--     Las escrituras pasan por la Edge Function `baqueano-reviews`, que verifica el token de
--     Firebase y usa el UID del token como dueño. Así cada usuario escribe solo lo suyo, y los
--     administradores moderan con un rol verificado en el servidor.
--   - Lectura pública solo mediante funciones SECURITY DEFINER que devuelven columnas públicas
--     de opiniones `approved`.
--   - Historial de solo inserción (`platform_review_events`): ediciones, moderación, reportes y
--     respuestas. No hay DELETE para nadie salvo service_role, y la función no lo usa.
-- 📦 QUÉ: platform_reviews, platform_review_events, platform_review_reports,
--   platform_review_summary() y platform_reviews_public(limit, offset).
-- ⚖️ NOTA: la estructura técnica no equivale a cumplimiento jurídico. La política de opiniones y el
--   consentimiento deben validarse con asesoría legal (Ley 787 de protección de datos personales,
--   Ley 842 de consumidores y usuarios) antes de anunciar la función.
-- ============================================================================

create table if not exists public.platform_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,                                   -- UID de Firebase (nunca se publica)
  auth_provider text not null check (auth_provider in ('google', 'password', 'other')),
  display_name_snapshot text check (display_name_snapshot is null or char_length(display_name_snapshot) between 1 and 80),
  avatar_url text check (avatar_url is null or (avatar_url ~ '^https://' and char_length(avatar_url) <= 500)),
  show_avatar boolean not null default true,
  comment text check (comment is null or char_length(comment) between 10 and 1000),
  rating smallint not null check (rating between 1 and 5),
  improvement text check (improvement is null or char_length(improvement) <= 600),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'hidden', 'reported', 'withdrawn')),
  platform text not null default 'web' check (platform in ('web', 'android', 'ios')),
  language text not null default 'es' check (language in ('es', 'en', 'fr', 'it', 'pt', 'de')),
  consent_version text not null,
  consent_at timestamptz not null,
  consent_purpose text not null,
  moderation_reason text check (moderation_reason is null or char_length(moderation_reason) <= 500),
  moderated_by text,
  moderated_at timestamptz,
  response_text text check (response_text is null or char_length(response_text) between 2 and 1000),
  response_by text,
  response_at timestamptz,
  edit_count integer not null default 0,
  open_reports integer not null default 0,
  deletion_requested_at timestamptz,
  erased_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  -- Una opinión retirada o borrada a pedido del usuario no conserva texto público.
  constraint platform_reviews_comment_required check (comment is not null or erased_at is not null)
);
comment on table public.platform_reviews is
  'Opiniones sobre el uso de BAQUEANO. Una activa por usuario. Escritura solo vía Edge Function baqueano-reviews. Público: platform_reviews_public() y platform_review_summary(). Separada de testimonials.';

-- Regla inicial del propietario: una valoración activa por usuario (se actualiza, no se multiplica).
create unique index if not exists platform_reviews_one_active_per_user
  on public.platform_reviews (user_id) where status <> 'withdrawn';
create index if not exists platform_reviews_status_published_idx on public.platform_reviews (status, published_at desc);

create table if not exists public.platform_review_events (
  id bigint generated always as identity primary key,
  review_id uuid not null references public.platform_reviews(id),
  actor_type text not null check (actor_type in ('user', 'admin', 'system')),
  actor_ref text not null,                                 -- UID o correo del administrador (interno)
  actor_role text,
  action text not null check (action in ('created', 'edited', 'withdrawn', 'deletion_requested', 'erased',
                                         'approved', 'rejected', 'hidden', 'marked_reported', 'responded',
                                         'response_removed', 'reported', 'report_resolved')),
  from_status text,
  to_status text,
  reason text check (reason is null or char_length(reason) <= 500),
  snapshot jsonb,                                          -- versión anterior en ediciones (se limpia al borrar)
  created_at timestamptz not null default now()
);
create index if not exists platform_review_events_review_idx on public.platform_review_events (review_id, created_at);
comment on table public.platform_review_events is 'Trazabilidad de solo inserción de cada opinión: ediciones, moderación, respuestas y reportes.';

create table if not exists public.platform_review_reports (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.platform_reviews(id),
  reporter_uid text not null,
  reason text not null check (reason in ('insulto', 'amenaza', 'spam', 'ilegal', 'datos_personales',
                                         'suplantacion', 'automatizado', 'repetido', 'enlace_peligroso',
                                         'discriminacion', 'otro')),
  details text check (details is null or char_length(details) <= 500),
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  resolved_by text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (review_id, reporter_uid)
);

-- Sin acceso directo: RLS activa y sin políticas para anon ni authenticated.
alter table public.platform_reviews enable row level security;
alter table public.platform_review_events enable row level security;
alter table public.platform_review_reports enable row level security;
revoke all on public.platform_reviews, public.platform_review_events, public.platform_review_reports from public, anon, authenticated;

-- El historial no se reescribe: solo se permiten inserciones (salvo el borrado del texto
-- de una versión anterior cuando el usuario pide eliminar su opinión).
create or replace function public.platform_review_events_guard()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'El historial de opiniones no se borra.';
  end if;
  if tg_op = 'UPDATE' then
    if new.snapshot is not null or (row(new.id, new.review_id, new.actor_type, new.actor_ref, new.action, new.created_at)
        is distinct from row(old.id, old.review_id, old.actor_type, old.actor_ref, old.action, old.created_at)) then
      raise exception 'El historial de opiniones solo admite inserciones.';
    end if;
  end if;
  return coalesce(new, old);
end $$;
drop trigger if exists platform_review_events_guard on public.platform_review_events;
create trigger platform_review_events_guard before update or delete on public.platform_review_events
  for each row execute function public.platform_review_events_guard();

-- Una opinión nunca se borra físicamente: se retira u oculta con trazabilidad.
create or replace function public.platform_reviews_no_delete()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  raise exception 'Las opiniones no se eliminan directamente: retirar, ocultar o borrar el texto deja trazabilidad.';
end $$;
drop trigger if exists platform_reviews_no_delete on public.platform_reviews;
create trigger platform_reviews_no_delete before delete on public.platform_reviews
  for each row execute function public.platform_reviews_no_delete();

create or replace function public.platform_reviews_touch()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  new.updated_at := now();
  if new.status = 'approved' and (old.status is distinct from 'approved') then
    new.published_at := now();
  end if;
  return new;
end $$;
drop trigger if exists platform_reviews_touch on public.platform_reviews;
create trigger platform_reviews_touch before update on public.platform_reviews
  for each row execute function public.platform_reviews_touch();

-- Resumen público: SOLO opiniones aprobadas. Nada se fija a mano.
create or replace function public.platform_review_summary()
returns jsonb language sql stable security definer set search_path = public, pg_temp as $$
  select jsonb_build_object(
    'count', count(*),
    'average', case when count(*) = 0 then null else round(avg(rating)::numeric, 1) end,
    'distribution', jsonb_build_object(
      '5', count(*) filter (where rating = 5), '4', count(*) filter (where rating = 4),
      '3', count(*) filter (where rating = 3), '2', count(*) filter (where rating = 2),
      '1', count(*) filter (where rating = 1)),
    'source', 'supabase:platform_reviews(status=approved)',
    'generated_at', now())
  from public.platform_reviews where status = 'approved';
$$;

-- Lista pública: solo columnas públicas de opiniones aprobadas. Nunca devuelve UID, correo,
-- consentimiento, IP ni el campo de mejora (que es un mensaje privado para el equipo).
create or replace function public.platform_reviews_public(p_limit integer default 12, p_offset integer default 0)
returns table (id uuid, display_name text, avatar_url text, rating smallint, comment text, published_at timestamptz,
               edited boolean, response_text text, response_at timestamptz)
language sql stable security definer set search_path = public, pg_temp as $$
  select r.id,
         coalesce(r.display_name_snapshot, 'Usuario BAQUEANO'),
         case when r.show_avatar then r.avatar_url else null end,
         r.rating, r.comment, r.published_at, r.edit_count > 0, r.response_text, r.response_at
  from public.platform_reviews r
  where r.status = 'approved' and r.comment is not null
  order by r.published_at desc nulls last, r.id
  limit greatest(1, least(coalesce(p_limit, 12), 50)) offset greatest(0, least(coalesce(p_offset, 0), 5000));
$$;

revoke all on function public.platform_review_summary() from public;
revoke all on function public.platform_reviews_public(integer, integer) from public;
grant execute on function public.platform_review_summary() to anon, authenticated, service_role;
grant execute on function public.platform_reviews_public(integer, integer) to anon, authenticated, service_role;
revoke all on function public.platform_review_events_guard() from public, anon, authenticated;
revoke all on function public.platform_reviews_no_delete() from public, anon, authenticated;
revoke all on function public.platform_reviews_touch() from public, anon, authenticated;
