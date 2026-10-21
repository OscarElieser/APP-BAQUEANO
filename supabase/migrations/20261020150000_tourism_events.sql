-- ============================================================================
-- 🗓️ BAQUEANO — AGENDA DE EVENTOS (amplía public.events)
-- ============================================================================
-- 🎯 POR QUÉ (propietario, 2026-10-20 «¡Nicaragua está de fiesta!»):
--   - El index muestra los próximos eventos reales de Nicaragua y el equipo los publica desde el
--     Ops Center sin tocar código ni volver a desplegar.
--   - Nada de eventos ficticios: el público solo ve lo APROBADO y PUBLICADO.
--   - Separar el estado del evento (programado, cancelado, reprogramado) de su aprobación
--     editorial (borrador, en revisión, publicado, despublicado).
--   - Fechas inequívocas: timestamptz (UTC) y presentación en America/Managua. Si no se conoce
--     la hora, `time_confirmed = false` y la web dice «Horario por confirmar» (no se inventa).
--   - Los eventos que ya pasaron NO se borran: dejan de mostrarse en el index y quedan en el histórico.
-- ⚙️ CÓMO:
--   1. Se REUTILIZA public.events (existía vacía; 012_comprehensive_cultural_and_ops_schema.sql).
--      Columnas viejas se conservan; `start_date`/`end_date`/`status` se mantienen sincronizadas por
--      trigger para no romper nada que las lea. El default viejo `status = 'published'` era peligroso
--      (un insert sin datos quedaba público): pasa a 'draft'.
--   2. Escritura solo vía Edge Function `baqueano-events` (token Firebase + staff_roles). El público
--      solo lee por funciones SECURITY DEFINER (`public_events`, `public_event`), que calculan el
--      estado temporal con la hora de Nicaragua.
--   3. Fotos: bucket `event-images` (público para leer, 5 MB, WebP/JPEG/PNG). Solo la función sube.
--   4. Historial de solo inserción (event_changes) para auditoría.
-- 📦 QUÉ: columnas nuevas, checks, índices, event_changes, events_guard(), event_time_state(),
--   public_events(...), public_event(slug), bucket event-images.
-- ↩️ ROLLBACK: docs/AGENDA-EVENTOS.md § «Reversión» (no borra eventos).
-- ============================================================================

begin;

alter table public.events
  add column if not exists slug text,
  add column if not exists description text,
  add column if not exists short_description text,
  add column if not exists image_alt text,
  add column if not exists image_credit text,
  add column if not exists start_at timestamptz,
  add column if not exists end_at timestamptz,
  add column if not exists timezone text not null default 'America/Managua',
  add column if not exists time_confirmed boolean not null default false,
  add column if not exists modality text not null default 'presencial',
  add column if not exists virtual_url text,
  add column if not exists coords_verified boolean not null default false,
  add column if not exists access_type text not null default 'unconfirmed',
  add column if not exists price numeric(12,2),
  add column if not exists currency text,
  add column if not exists organizer_url text,
  add column if not exists official_url text,
  add column if not exists registration_url text,
  add column if not exists program jsonb not null default '[]'::jsonb,
  add column if not exists recommendations text,
  add column if not exists event_status text not null default 'scheduled',
  add column if not exists rescheduled_from timestamptz,
  add column if not exists status_note text,
  add column if not exists publication_status text not null default 'draft',
  add column if not exists is_featured boolean not null default false,
  add column if not exists published_at timestamptz,
  add column if not exists created_by text,
  add column if not exists updated_by text,
  add column if not exists approved_by text;

alter table public.events alter column status set default 'draft';
alter table public.events alter column is_free set default null;
alter table public.events alter column admission_nio set default null;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'events_slug_format') then
    alter table public.events add constraint events_slug_format check (slug is null or slug ~ '^[a-z0-9][a-z0-9-]{2,119}$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'events_category_check') then
    alter table public.events add constraint events_category_check check (category in (
      'feria_turistica', 'festival_cultural', 'gastronomia', 'musica', 'tradiciones', 'arte_patrimonio',
      'naturaleza', 'turismo_comunitario', 'deporte_aventura', 'exposicion', 'tecnologia_emprendimiento', 'familiar'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'events_states_check') then
    alter table public.events add constraint events_states_check check (
      event_status in ('scheduled', 'cancelled', 'rescheduled', 'postponed')
      and publication_status in ('draft', 'review', 'published', 'unpublished')
      and modality in ('presencial', 'virtual', 'hibrido')
      and access_type in ('free', 'paid', 'unconfirmed'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'events_dates_check') then
    alter table public.events add constraint events_dates_check check (end_at is null or start_at is null or end_at >= start_at);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'events_price_check') then
    -- Precio solo si es de pago y con moneda; nunca un precio en un evento gratuito o sin confirmar.
    alter table public.events add constraint events_price_check check (
      (price is null and currency is null)
      or (access_type = 'paid' and price >= 0 and currency in ('NIO', 'USD')));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'events_coords_check') then
    alter table public.events add constraint events_coords_check check (
      (latitude is null and longitude is null)
      or (latitude between 10.5 and 15.2 and longitude between -88 and -82.5));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'events_urls_check') then
    alter table public.events add constraint events_urls_check check (
      (cover_image is null or cover_image ~ '^https://')
      and (official_url is null or official_url ~ '^https://')
      and (organizer_url is null or organizer_url ~ '^https://')
      and (registration_url is null or registration_url ~ '^https://')
      and (source_url is null or source_url ~ '^https://')
      and (virtual_url is null or virtual_url ~ '^https://'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'events_text_lengths') then
    alter table public.events add constraint events_text_lengths check (
      char_length(title) between 3 and 160
      and (short_description is null or char_length(short_description) <= 280)
      and (description is null or char_length(description) <= 8000)
      and (recommendations is null or char_length(recommendations) <= 2000)
      and (status_note is null or char_length(status_note) <= 500)
      and (image_alt is null or char_length(image_alt) <= 200)
      and jsonb_typeof(program) = 'array' and jsonb_array_length(program) <= 40);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'events_publish_requirements') then
    -- Publicar exige lo mínimo para no mostrar un evento a medias: slug, fecha/hora de inicio,
    -- descripción, foto y la fuente oficial de la información.
    alter table public.events add constraint events_publish_requirements check (
      publication_status <> 'published'
      or (slug is not null and start_at is not null and description is not null and cover_image is not null
          and source_name is not null and (source_url is not null or official_url is not null)));
  end if;
end $$;

create unique index if not exists events_slug_key on public.events (slug) where slug is not null;
create index if not exists events_public_start_idx on public.events (start_at) where publication_status = 'published';
create index if not exists events_department_start_idx on public.events (department_id, start_at);

-- Historial de solo inserción.
create table if not exists public.event_changes (
  id bigint generated always as identity primary key,
  event_id text not null references public.events(id),
  actor text not null,
  actor_role text,
  action text not null check (action in ('created', 'edited', 'submitted', 'approved', 'published', 'unpublished',
                                         'featured', 'unfeatured', 'cancelled', 'rescheduled', 'restored', 'image')),
  reason text check (reason is null or char_length(reason) <= 500),
  snapshot jsonb,
  created_at timestamptz not null default now()
);
create index if not exists event_changes_event_idx on public.event_changes (event_id, created_at);

-- Sincroniza columnas viejas, controla fechas y no deja borrar.
create or replace function public.events_guard()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Los eventos no se borran: se despublican o se cancelan (quedan en el histórico).';
  end if;
  if new.start_at is not null then
    new.start_date := (new.start_at at time zone coalesce(new.timezone, 'America/Managua'))::date;
  end if;
  if new.end_at is not null then
    new.end_date := (new.end_at at time zone coalesce(new.timezone, 'America/Managua'))::date;
  end if;
  new.schedule_time := case when new.start_at is not null and new.time_confirmed
    then to_char(new.start_at at time zone coalesce(new.timezone, 'America/Managua'), 'HH24:MI') else null end;
  new.is_free := case new.access_type when 'free' then true when 'paid' then false else null end;
  new.admission_nio := case when new.access_type = 'paid' and new.currency = 'NIO' then new.price else null end;
  -- La política vieja ("Lectura pública de eventos") usa `status`: se mantiene coherente.
  new.status := case when new.publication_status = 'published' then 'published' else 'draft' end;
  if tg_op = 'INSERT' then
    new.created_at := now();
  else
    new.created_at := old.created_at;
  end if;
  new.updated_at := now();
  if new.publication_status = 'published' and (tg_op = 'INSERT' or old.publication_status is distinct from 'published') then
    new.published_at := now();
  end if;
  return new;
end $$;
drop trigger if exists events_guard on public.events;
create trigger events_guard before insert or update or delete on public.events
  for each row execute function public.events_guard();

create or replace function public.event_changes_guard()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  raise exception 'El historial de eventos solo admite inserciones.';
end $$;
drop trigger if exists event_changes_guard on public.event_changes;
create trigger event_changes_guard before update or delete on public.event_changes
  for each row execute function public.event_changes_guard();

-- Permisos: sin acceso directo; lectura pública solo por funciones.
alter table public.events enable row level security;
alter table public.event_changes enable row level security;
drop policy if exists "Lectura pública de eventos" on public.events;
revoke all on public.events, public.event_changes from public, anon, authenticated;

-- Estado temporal calculado con la hora real (nunca «en curso» si está cancelado).
-- Sin hora de fin: un evento con hora confirmada dura hasta el final de su día; uno sin hora, todo el día.
create or replace function public.event_time_state(e public.events, p_now timestamptz default now())
returns text language sql stable set search_path = public, pg_temp as $$
  select case
    when e.event_status = 'cancelled' then 'cancelled'
    when e.event_status = 'postponed' then 'postponed'
    when e.start_at is null then 'unscheduled'
    when coalesce(e.end_at, ((e.start_at at time zone e.timezone)::date + 1)::timestamp at time zone e.timezone) <= p_now then 'finished'
    when e.start_at <= p_now and (e.time_confirmed or e.end_at is not null) then 'ongoing'
    when (e.start_at at time zone e.timezone)::date = (p_now at time zone e.timezone)::date then 'today'
    when e.event_status = 'rescheduled' then 'rescheduled'
    else 'upcoming'
  end;
$$;

-- Lista pública: publicados, ordenados por inicio. p_scope: 'upcoming' (en curso + futuros, para el
-- index y la agenda), 'past' (histórico) o 'all'.
create or replace function public.public_events(
  p_scope text default 'upcoming', p_department text default null, p_category text default null,
  p_from date default null, p_to date default null, p_limit integer default 12, p_offset integer default 0)
returns table (
  id text, slug text, title text, short_description text, category text, cover_image text, image_alt text,
  start_at timestamptz, end_at timestamptz, timezone text, time_confirmed boolean, modality text,
  department_id text, municipality_id text, location_name text, latitude double precision, longitude double precision,
  coords_verified boolean, access_type text, price numeric, currency text, event_status text, rescheduled_from timestamptz,
  status_note text, is_featured boolean, time_state text, organizer_name text, updated_at timestamptz)
language sql stable security definer set search_path = public, pg_temp as $$
  select e.id, e.slug, e.title, e.short_description, e.category, e.cover_image, e.image_alt,
         e.start_at, e.end_at, e.timezone, e.time_confirmed, e.modality,
         e.department_id, e.municipality_id, e.location_name,
         case when e.coords_verified then e.latitude end, case when e.coords_verified then e.longitude end,
         e.coords_verified, e.access_type, e.price, e.currency, e.event_status, e.rescheduled_from,
         e.status_note, e.is_featured, public.event_time_state(e), e.organizer_name, e.updated_at
  from public.events e
  where e.publication_status = 'published' and e.start_at is not null
    and (p_department is null or e.department_id = p_department)
    and (p_category is null or e.category = p_category)
    and (p_from is null or (coalesce(e.end_at, e.start_at) at time zone e.timezone)::date >= p_from)
    and (p_to is null or (e.start_at at time zone e.timezone)::date <= p_to)
    and case coalesce(p_scope, 'upcoming')
          when 'past' then public.event_time_state(e) = 'finished'
          when 'all' then true
          -- Próximos: no terminados y no cancelados (un cancelado no se promociona como disponible).
          else public.event_time_state(e) not in ('finished', 'cancelled')
        end
  order by case when coalesce(p_scope, 'upcoming') = 'past' then null else e.start_at end asc,
           case when coalesce(p_scope, 'upcoming') = 'past' then e.start_at end desc, e.id
  limit greatest(1, least(coalesce(p_limit, 12), 60)) offset greatest(0, least(coalesce(p_offset, 0), 5000));
$$;

-- Ficha pública de un evento publicado (incluye cancelados y finalizados: el enlace no se rompe).
create or replace function public.public_event(p_slug text)
returns table (
  id text, slug text, title text, short_description text, description text, category text, cover_image text,
  image_alt text, image_credit text, start_at timestamptz, end_at timestamptz, timezone text, time_confirmed boolean,
  modality text, virtual_url text, department_id text, municipality_id text, location_name text, address text,
  latitude double precision, longitude double precision, coords_verified boolean, access_type text, price numeric,
  currency text, organizer_name text, organizer_url text, contact_info text, official_url text, registration_url text,
  program jsonb, recommendations text, source_name text, source_url text, event_status text, rescheduled_from timestamptz,
  status_note text, time_state text, updated_at timestamptz, published_at timestamptz)
language sql stable security definer set search_path = public, pg_temp as $$
  select e.id, e.slug, e.title, e.short_description, e.description, e.category, e.cover_image, e.image_alt, e.image_credit,
         e.start_at, e.end_at, e.timezone, e.time_confirmed, e.modality, e.virtual_url, e.department_id, e.municipality_id,
         e.location_name, e.address,
         case when e.coords_verified then e.latitude end, case when e.coords_verified then e.longitude end, e.coords_verified,
         e.access_type, e.price, e.currency, e.organizer_name, e.organizer_url, e.contact_info, e.official_url,
         e.registration_url, e.program, e.recommendations, e.source_name, e.source_url, e.event_status,
         e.rescheduled_from, e.status_note, public.event_time_state(e), e.updated_at, e.published_at
  from public.events e
  where e.publication_status = 'published' and e.slug = p_slug
  limit 1;
$$;

revoke all on function public.event_time_state(public.events, timestamptz) from public;
revoke all on function public.public_events(text, text, text, date, date, integer, integer) from public;
revoke all on function public.public_event(text) from public;
grant execute on function public.event_time_state(public.events, timestamptz) to anon, authenticated, service_role;
grant execute on function public.public_events(text, text, text, date, date, integer, integer) to anon, authenticated, service_role;
grant execute on function public.public_event(text) to anon, authenticated, service_role;
revoke all on function public.events_guard() from public, anon, authenticated;
revoke all on function public.event_changes_guard() from public, anon, authenticated;

-- Fotos de eventos: lectura pública; solo la Edge Function sube (service_role).
do $$ begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('event-images', 'event-images', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
    on conflict (id) do nothing;
  end if;
end $$;

commit;
