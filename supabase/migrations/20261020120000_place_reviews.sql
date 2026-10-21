-- ============================================================================
-- 🧭 BAQUEANO — VALORACIONES Y OPINIONES REALES DE LUGARES (public.reviews)
-- ============================================================================
-- 🎯 POR QUÉ (pedido del propietario, 2026-10-20, "mapa turístico inteligente"):
--   - Las estrellas de /mapa, /destinos y la ficha tienen que salir de usuarios reales, ser
--     una sola fuente y no contradecirse. Hoy había cifras escritas a mano (4.9 (1,210), etc.)
--     y `destinations.rating` con valores sin respaldo.
--   - Un usuario no puede modificar opiniones ajenas, y el público solo lee lo aprobado.
--   - La identidad es Firebase (no Supabase Auth): `auth.uid()` NO identifica al autor. Por eso
--     nadie escribe directo en la tabla; la Edge Function `baqueano-place-reviews` verifica el
--     ID token de Firebase y usa su UID como dueño (mismo patrón que platform_reviews).
-- ⚙️ CÓMO:
--   1. Se REUTILIZA `public.reviews` (existía vacía y con FK a destinations/businesses) y se amplía:
--      place_id → places, moderación con motivo, respuesta oficial, idioma, consentimiento,
--      contador de ediciones y de reportes, banderas antispam.
--   2. Un registro por usuario y lugar (índices únicos parciales): editar actualiza, no duplica.
--   3. Fechas controladas por la base (triggers); UID, destino y fecha de creación inmutables.
--   4. Sin acceso directo para anon ni authenticated. Se quita la política de lectura que
--      devolvía todas las columnas (incluido el UID de Firebase del autor). Lectura pública
--      solo por funciones SECURITY DEFINER que devuelven columnas públicas de lo `published`.
--   5. Historial de solo inserción (review_events) y reportes (review_reports).
--   6. Alias explícitos destino→lugar (review_target_aliases) para las tarjetas de /destinos
--      que equivalen sin ambigüedad a un lugar de `places`. Los ambiguos NO se vinculan.
-- 📦 QUÉ: columnas nuevas en reviews, review_events, review_reports, review_target_aliases,
--   review_resolve_target(), place_review_summaries(text[]), place_reviews_public(...).
-- ↩️ ROLLBACK: ver docs/MAPA-RESENAS.md § "Reversión" (quita lo nuevo y restaura la política
--   anterior; no borra opiniones porque no se borra nada).
-- ⚖️ NOTA: la estructura técnica no equivale a cumplimiento jurídico (Ley 787, Ley 842).
-- ============================================================================

begin;

-- 1) Ampliar public.reviews ---------------------------------------------------
alter table public.reviews
  add column if not exists place_id text references public.places(id),
  add column if not exists auth_provider text,
  add column if not exists show_avatar boolean not null default true,
  add column if not exists language text not null default 'es',
  add column if not exists platform text not null default 'web',
  add column if not exists consent_version text,
  add column if not exists consent_at timestamptz,
  add column if not exists moderation_reason text,
  add column if not exists moderated_by text,
  add column if not exists moderated_at timestamptz,
  add column if not exists response_text text,
  add column if not exists response_by text,
  add column if not exists response_at timestamptz,
  add column if not exists edit_count integer not null default 0,
  add column if not exists open_reports integer not null default 0,
  add column if not exists flags text[] not null default '{}',
  add column if not exists erased_at timestamptz,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists published_at timestamptz;

alter table public.reviews alter column created_at set default now();
update public.reviews set created_at = now() where created_at is null;
alter table public.reviews alter column created_at set not null;
alter table public.reviews alter column status set default 'pending';
alter table public.reviews alter column status set not null;
alter table public.reviews alter column comment set default '';

alter table public.reviews drop constraint if exists reviews_status_check;
alter table public.reviews add constraint reviews_status_check
  check (status in ('pending', 'published', 'rejected', 'hidden', 'reported', 'withdrawn', 'moderation'));

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'reviews_one_target') then
    -- Cada opinión pertenece a un único lugar, negocio o destino.
    alter table public.reviews add constraint reviews_one_target
      check (num_nonnulls(place_id, business_id, destination_id) = 1);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'reviews_comment_len') then
    alter table public.reviews add constraint reviews_comment_len check (char_length(comment) <= 1000);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'reviews_language_check') then
    alter table public.reviews add constraint reviews_language_check
      check (language in ('es', 'en', 'fr', 'it', 'pt', 'de', 'ko', 'zh'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'reviews_platform_check') then
    alter table public.reviews add constraint reviews_platform_check check (platform in ('web', 'android', 'ios'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'reviews_auth_provider_check') then
    alter table public.reviews add constraint reviews_auth_provider_check
      check (auth_provider is null or auth_provider in ('google', 'password', 'other'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'reviews_text_lengths') then
    alter table public.reviews add constraint reviews_text_lengths check (
      (user_name is null or char_length(user_name) <= 80)
      and (user_avatar is null or (user_avatar ~ '^https://' and char_length(user_avatar) <= 500))
      and (moderation_reason is null or char_length(moderation_reason) <= 500)
      and (response_text is null or char_length(response_text) between 2 and 1000));
  end if;
end $$;

-- Un registro por usuario y destino: editar actualiza la misma fila.
create unique index if not exists reviews_one_per_user_place on public.reviews (user_uid, place_id) where place_id is not null;
create unique index if not exists reviews_one_per_user_business on public.reviews (user_uid, business_id) where business_id is not null;
create unique index if not exists reviews_one_per_user_destination on public.reviews (user_uid, destination_id) where destination_id is not null;
create index if not exists reviews_place_published_idx on public.reviews (place_id, published_at desc) where status = 'published';
create index if not exists reviews_status_updated_idx on public.reviews (status, updated_at desc);

comment on table public.reviews is
  'Valoraciones (1–5) y opiniones de visitantes sobre lugares, negocios o destinos. Una por usuario y destino. Escritura solo vía Edge Function baqueano-place-reviews (token Firebase). Público: place_review_summaries() y place_reviews_public(). Nunca se publica user_uid.';
comment on column public.reviews.user_uid is 'UID de Firebase del autor (verificado en el servidor). Nunca se devuelve al público.';

-- 2) Historial y reportes -----------------------------------------------------
create table if not exists public.review_events (
  id bigint generated always as identity primary key,
  review_id uuid not null references public.reviews(id),
  actor_type text not null check (actor_type in ('user', 'admin', 'system')),
  actor_ref text not null,
  actor_role text,
  action text not null check (action in ('created', 'edited', 'withdrawn', 'erased', 'approved', 'rejected', 'hidden',
                                         'marked_reported', 'responded', 'response_removed', 'reported', 'report_resolved', 'flagged')),
  from_status text,
  to_status text,
  reason text check (reason is null or char_length(reason) <= 500),
  snapshot jsonb,
  created_at timestamptz not null default now()
);
create index if not exists review_events_review_idx on public.review_events (review_id, created_at);
create index if not exists review_events_actor_idx on public.review_events (actor_ref, action, created_at);
comment on table public.review_events is 'Trazabilidad de solo inserción de cada opinión de lugar: ediciones, moderación, respuestas y reportes.';

create table if not exists public.review_reports (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id),
  reporter_uid text not null,
  reason text not null check (reason in ('insulto', 'amenaza', 'spam', 'ilegal', 'datos_personales', 'suplantacion',
                                         'automatizado', 'repetido', 'enlace_peligroso', 'discriminacion', 'falso', 'otro')),
  details text check (details is null or char_length(details) <= 500),
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  resolved_by text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (review_id, reporter_uid)
);

-- 3) Alias destino → lugar (solo equivalencias inequívocas) ---------------------
create table if not exists public.review_target_aliases (
  alias text primary key check (alias ~ '^[a-z0-9_-]{2,60}$'),
  place_id text not null references public.places(id),
  note text,
  created_at timestamptz not null default now()
);
comment on table public.review_target_aliases is
  'Claves de tarjetas de /destinos (destinos.html?id=…) que equivalen a un único lugar de places. Las ambiguas (Granada, León, Masaya…) no se vinculan: muestran «Aún sin valoraciones».';
-- Solo los lugares que existen: en una base nueva (revisión de Supabase) places llega vacía.
insert into public.review_target_aliases (alias, place_id, note)
select v.alias, v.place_id, v.note from (values
  ('ometepe',    'pl-reserva-de-biosfera-isla-de-ometepe',        'Isla de Ometepe'),
  ('isletas',    'pl-isletas-de-granada',                         'Las Isletas de Granada'),
  ('miraflor',   'pl-reserva-natural-miraflor',                   'Miraflor'),
  ('apoyo',      'pl-reserva-natural-laguna-de-apoyo',            'Laguna de Apoyo'),
  ('cornisland', 'pl-corn-island-little-corn-island',             'Corn Island'),
  ('indiomaiz',  'pl-reserva-biologica-indio-maiz',               'Reserva Indio Maíz'),
  ('sjds',       'pl-san-juan-del-sur-y-cristo-de-la-misericordia', 'San Juan del Sur'),
  ('riosanjuan', 'pl-rio-san-juan',                               'Río San Juan')
) as v(alias, place_id, note)
where exists (select 1 from public.places p where p.id = v.place_id)
on conflict (alias) do nothing;

-- 4) Permisos: sin acceso directo ---------------------------------------------
alter table public.reviews enable row level security;
alter table public.review_events enable row level security;
alter table public.review_reports enable row level security;
alter table public.review_target_aliases enable row level security;
-- La política anterior devolvía todas las columnas (incluido user_uid) de lo publicado.
drop policy if exists "Lectura pública de reseñas publicadas" on public.reviews;
revoke all on public.reviews, public.review_events, public.review_reports from public, anon, authenticated;
revoke all on public.review_target_aliases from public, anon, authenticated;
grant select on public.review_target_aliases to anon, authenticated;
drop policy if exists "Alias públicos" on public.review_target_aliases;
create policy "Alias públicos" on public.review_target_aliases for select to anon, authenticated using (true);

-- 5) Integridad controlada por la base -----------------------------------------
create or replace function public.reviews_guard()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Las opiniones no se eliminan: se retiran u ocultan con trazabilidad.';
  end if;
  if tg_op = 'INSERT' then
    new.created_at := now();
    new.updated_at := now();
    new.edit_count := 0;
    new.published_at := case when new.status = 'published' then now() else null end;
    return new;
  end if;
  if new.user_uid is distinct from old.user_uid
     or new.place_id is distinct from old.place_id
     or new.business_id is distinct from old.business_id
     or new.destination_id is distinct from old.destination_id then
    raise exception 'El autor y el destino de una opinión no se pueden cambiar.';
  end if;
  new.created_at := old.created_at;
  new.updated_at := now();
  if new.status = 'published' and old.status is distinct from 'published' then
    new.published_at := now();
  end if;
  return new;
end $$;
drop trigger if exists reviews_guard on public.reviews;
create trigger reviews_guard before insert or update or delete on public.reviews
  for each row execute function public.reviews_guard();

create or replace function public.review_events_guard()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  if tg_op = 'DELETE' then raise exception 'El historial de opiniones no se borra.'; end if;
  if new.snapshot is not null or (row(new.id, new.review_id, new.actor_type, new.actor_ref, new.action, new.created_at)
      is distinct from row(old.id, old.review_id, old.actor_type, old.actor_ref, old.action, old.created_at)) then
    raise exception 'El historial de opiniones solo admite inserciones.';
  end if;
  return new;
end $$;
drop trigger if exists review_events_guard on public.review_events;
create trigger review_events_guard before update or delete on public.review_events
  for each row execute function public.review_events_guard();

-- 6) Lectura pública ------------------------------------------------------------
-- 'place:<slug|id>' | 'destination:<alias>' | 'business:<id>' → (tipo, id real) o nada.
create or replace function public.review_resolve_target(p_target text)
returns table (kind text, ref text)
language sql stable security definer set search_path = public, pg_temp as $$
  with t as (select split_part(coalesce(p_target, ''), ':', 1) as k, substr(coalesce(p_target, ''), strpos(coalesce(p_target, ''), ':') + 1) as v)
  select 'place', p.id from t join public.places p on t.k = 'place' and p.is_published and (p.id = t.v or p.slug = t.v)
  union all
  select 'place', p.id from t join public.review_target_aliases a on t.k = 'destination' and a.alias = t.v
    join public.places p on p.id = a.place_id and p.is_published
  union all
  select 'business', b.id from t join public.businesses b on t.k = 'business' and b.id = t.v and b.is_published
  limit 1;
$$;

-- Resumen por destino: SOLO lo publicado (aprobado). Sin opiniones → count 0 y average null.
create or replace function public.place_review_summaries(p_targets text[])
returns table (target text, kind text, ref text, count integer, average numeric, d1 integer, d2 integer, d3 integer, d4 integer, d5 integer)
language sql stable security definer set search_path = public, pg_temp as $$
  with req as (select distinct x as target from unnest(coalesce(p_targets, '{}'::text[])) x limit 200),
  res as (select req.target, r.kind, r.ref from req cross join lateral public.review_resolve_target(req.target) r)
  select res.target, res.kind, res.ref,
         count(v.id)::int,
         case when count(v.id) = 0 then null else round(avg(v.rating)::numeric, 1) end,
         (count(v.id) filter (where v.rating = 1))::int, (count(v.id) filter (where v.rating = 2))::int,
         (count(v.id) filter (where v.rating = 3))::int, (count(v.id) filter (where v.rating = 4))::int,
         (count(v.id) filter (where v.rating = 5))::int
  from res
  left join public.reviews v on v.status = 'published'
    and ((res.kind = 'place' and v.place_id = res.ref) or (res.kind = 'business' and v.business_id = res.ref))
  group by res.target, res.kind, res.ref;
$$;

-- Lista pública: columnas públicas de lo publicado. Nunca UID, correo, banderas ni motivos internos.
create or replace function public.place_reviews_public(p_target text, p_sort text default 'recent', p_limit integer default 10, p_offset integer default 0)
returns table (id uuid, display_name text, avatar_url text, rating integer, comment text, language text,
               published_at timestamptz, edited boolean, response_text text, response_at timestamptz)
language sql stable security definer set search_path = public, pg_temp as $$
  with t as (select * from public.review_resolve_target(p_target))
  select v.id, coalesce(nullif(v.user_name, ''), 'Viajero BAQUEANO'),
         case when v.show_avatar then v.user_avatar else null end,
         v.rating, v.comment, v.language, v.published_at, v.edit_count > 0, v.response_text, v.response_at
  from t join public.reviews v on v.status = 'published'
    and ((t.kind = 'place' and v.place_id = t.ref) or (t.kind = 'business' and v.business_id = t.ref))
  order by
    case when p_sort = 'best' then v.rating end desc nulls last,
    case when p_sort = 'critical' then v.rating end asc nulls last,
    v.published_at desc nulls last, v.id
  limit greatest(1, least(coalesce(p_limit, 10), 50)) offset greatest(0, least(coalesce(p_offset, 0), 5000));
$$;

revoke all on function public.review_resolve_target(text) from public;
revoke all on function public.place_review_summaries(text[]) from public;
revoke all on function public.place_reviews_public(text, text, integer, integer) from public;
grant execute on function public.review_resolve_target(text) to anon, authenticated, service_role;
grant execute on function public.place_review_summaries(text[]) to anon, authenticated, service_role;
grant execute on function public.place_reviews_public(text, text, integer, integer) to anon, authenticated, service_role;
revoke all on function public.reviews_guard() from public, anon, authenticated;
revoke all on function public.review_events_guard() from public, anon, authenticated;

commit;
