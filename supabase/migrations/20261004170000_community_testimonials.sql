-- ============================================================================
-- 🧭 BAQUEANO — COMUNIDAD: EXPERIENCIAS DE VIAJEROS (TESTIMONIOS)
-- ============================================================================
-- 🎯 POR QUÉ:
-- - El propietario (2026-10-04) pide una comunidad real donde turistas
--   compartan experiencias vividas en Nicaragua: ver es público; publicar,
--   comentar, reaccionar, subir fotos/videos y denunciar exige sesión.
-- - Firebase Storage exige plan de pago y el propietario indicó usar
--   Supabase para este proceso. Firebase Auth sigue siendo la identidad.
--
-- ⚙️ CÓMO:
-- - Tablas relacionales con claves foráneas a destinations, departments y
--   businesses (cuando el lugar existe en el catálogo de Supabase) y
--   `destination_ref` para los destinos del catálogo web.
-- - Autoría por `author_uid` (UID de Firebase verificado en la Edge Function
--   `baqueano-community`). El navegador NUNCA escribe directo: no hay
--   permisos de INSERT/UPDATE/DELETE para anon ni authenticated.
-- - Lectura pública SOLO de lo publicado y SOLO de columnas públicas
--   (sin UID, hash ni notas de moderación).
-- - Contadores y auto-ocultamiento por denuncias mantenidos por triggers.
-- - Búsqueda de texto completo en español (GIN).
--
-- 📦 QUÉ:
-- - testimonials, testimonial_media, testimonial_comments,
--   testimonial_reactions, testimonial_reports.
-- - Bucket `community-media` (imágenes WebP/JPEG/PNG y videos MP4/WebM).
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. Testimonios
-- ---------------------------------------------------------------------------
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_uid text not null check (char_length(author_uid) between 6 and 128),
  author_name text not null check (char_length(author_name) between 1 and 80),
  author_avatar text check (author_avatar is null or author_avatar ~ '^https://'),
  title text not null check (char_length(title) between 5 and 120),
  body text not null check (char_length(body) between 30 and 4000),
  destination_id text references public.destinations(id) on delete set null,
  destination_ref text check (destination_ref is null or char_length(destination_ref) <= 120),
  destination_name text check (destination_name is null or char_length(destination_name) <= 120),
  department_id text references public.departments(id) on delete set null,
  municipality text check (municipality is null or char_length(municipality) <= 80),
  business_id text references public.businesses(id) on delete set null,
  place_name text check (place_name is null or char_length(place_name) <= 120),
  visit_month date,
  rating smallint check (rating is null or rating between 1 and 5),
  experience_type text check (experience_type is null or experience_type in (
    'naturaleza', 'cultura', 'gastronomia', 'aventura', 'playa', 'montana', 'comunidad',
    'historia', 'ecoturismo', 'hospedaje', 'restaurante', 'tour', 'evento', 'otro'
  )),
  tags text[] not null default '{}' check (coalesce(array_length(tags, 1), 0) <= 8),
  recommendations text check (recommendations is null or char_length(recommendations) <= 1000),
  tips text check (tips is null or char_length(tips) <= 1000),
  status text not null default 'pending_review' check (status in (
    'draft', 'pending_review', 'published', 'rejected', 'hidden', 'reported', 'archived'
  )),
  featured boolean not null default false,
  verified_visit boolean not null default false,
  moderation_note text check (moderation_note is null or char_length(moderation_note) <= 500),
  moderated_by text,
  moderated_at timestamptz,
  comments_count integer not null default 0,
  reactions_count integer not null default 0,
  reports_count integer not null default 0,
  media_count integer not null default 0,
  photo_count integer not null default 0,
  video_count integer not null default 0,
  content_hash text not null,
  search_vector tsvector generated always as (
    to_tsvector('spanish'::regconfig,
      coalesce(title, '') || ' ' || coalesce(body, '') || ' ' ||
      coalesce(destination_name, '') || ' ' || coalesce(place_name, '') || ' ' ||
      coalesce(municipality, '') || ' ' || coalesce(array_to_string(tags, ' '), ''))
  ) stored,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.testimonials is
  'Experiencias de viajeros. Escritura exclusiva de la Edge Function baqueano-community (UID de Firebase verificado).';

create index if not exists idx_testimonials_status_published on public.testimonials (status, published_at desc);
create index if not exists idx_testimonials_author on public.testimonials (author_uid, created_at desc);
create index if not exists idx_testimonials_destination on public.testimonials (destination_ref) where destination_ref is not null;
create index if not exists idx_testimonials_destination_id on public.testimonials (destination_id) where destination_id is not null;
create index if not exists idx_testimonials_department on public.testimonials (department_id);
create index if not exists idx_testimonials_business on public.testimonials (business_id) where business_id is not null;
create index if not exists idx_testimonials_type on public.testimonials (experience_type);
create index if not exists idx_testimonials_search on public.testimonials using gin (search_vector);
create unique index if not exists uq_testimonials_author_hash on public.testimonials (author_uid, content_hash);

-- ---------------------------------------------------------------------------
-- 2. Multimedia (archivos en el bucket community-media)
-- ---------------------------------------------------------------------------
create table if not exists public.testimonial_media (
  id uuid primary key default gen_random_uuid(),
  testimonial_id uuid not null references public.testimonials(id) on delete cascade,
  author_uid text not null,
  kind text not null check (kind in ('image', 'video')),
  storage_path text not null unique check (char_length(storage_path) <= 300),
  thumb_path text check (thumb_path is null or char_length(thumb_path) <= 300),
  mime_type text not null check (mime_type in ('image/webp', 'image/jpeg', 'image/png', 'video/mp4', 'video/webm')),
  size_bytes integer not null check (size_bytes > 0 and size_bytes <= 41943040),
  width integer check (width is null or width between 1 and 10000),
  height integer check (height is null or height between 1 and 10000),
  duration_seconds numeric(6, 2) check (duration_seconds is null or duration_seconds between 0 and 180),
  position smallint not null default 0 check (position between 0 and 20),
  status text not null default 'ready' check (status in ('pending', 'ready', 'rejected')),
  created_at timestamptz not null default now()
);
create index if not exists idx_testimonial_media_testimonial on public.testimonial_media (testimonial_id, position);

-- ---------------------------------------------------------------------------
-- 3. Comentarios (con respuestas: parent_id)
-- ---------------------------------------------------------------------------
create table if not exists public.testimonial_comments (
  id uuid primary key default gen_random_uuid(),
  testimonial_id uuid not null references public.testimonials(id) on delete cascade,
  parent_id uuid references public.testimonial_comments(id) on delete cascade,
  author_uid text not null,
  author_name text not null check (char_length(author_name) between 1 and 80),
  author_avatar text check (author_avatar is null or author_avatar ~ '^https://'),
  body text not null check (char_length(body) between 1 and 1500),
  status text not null default 'published' check (status in ('published', 'hidden', 'deleted', 'reported')),
  edited boolean not null default false,
  reactions_count integer not null default 0,
  reports_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_testimonial_comments_thread on public.testimonial_comments (testimonial_id, created_at);
create index if not exists idx_testimonial_comments_author on public.testimonial_comments (author_uid, created_at desc);

-- ---------------------------------------------------------------------------
-- 4. Reacciones (a un testimonio o a un comentario)
-- ---------------------------------------------------------------------------
create table if not exists public.testimonial_reactions (
  id uuid primary key default gen_random_uuid(),
  testimonial_id uuid references public.testimonials(id) on delete cascade,
  comment_id uuid references public.testimonial_comments(id) on delete cascade,
  author_uid text not null,
  kind text not null default 'like' check (kind in ('like', 'useful', 'inspiring')),
  created_at timestamptz not null default now(),
  check ((testimonial_id is not null) <> (comment_id is not null))
);
create unique index if not exists uq_reaction_testimonial on public.testimonial_reactions (testimonial_id, author_uid, kind) where testimonial_id is not null;
create unique index if not exists uq_reaction_comment on public.testimonial_reactions (comment_id, author_uid, kind) where comment_id is not null;

-- ---------------------------------------------------------------------------
-- 5. Denuncias
-- ---------------------------------------------------------------------------
create table if not exists public.testimonial_reports (
  id uuid primary key default gen_random_uuid(),
  testimonial_id uuid references public.testimonials(id) on delete cascade,
  comment_id uuid references public.testimonial_comments(id) on delete cascade,
  reporter_uid text not null,
  reason text not null check (reason in ('spam', 'ofensivo', 'falso', 'privacidad', 'peligroso', 'otro')),
  details text check (details is null or char_length(details) <= 500),
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed', 'actioned')),
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  check ((testimonial_id is not null) <> (comment_id is not null))
);
create unique index if not exists uq_report_testimonial on public.testimonial_reports (testimonial_id, reporter_uid) where testimonial_id is not null;
create unique index if not exists uq_report_comment on public.testimonial_reports (comment_id, reporter_uid) where comment_id is not null;
create index if not exists idx_testimonial_reports_open on public.testimonial_reports (status, created_at desc);

-- ---------------------------------------------------------------------------
-- 6. Triggers: updated_at, contadores y auto-ocultamiento por denuncias
-- ---------------------------------------------------------------------------
create or replace function public.community_touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_testimonials_touch on public.testimonials;
create trigger trg_testimonials_touch before update on public.testimonials
  for each row execute function public.community_touch_updated_at();
drop trigger if exists trg_testimonial_comments_touch on public.testimonial_comments;
create trigger trg_testimonial_comments_touch before update on public.testimonial_comments
  for each row execute function public.community_touch_updated_at();

create or replace function public.community_refresh_counts(p_testimonial uuid)
returns void language sql set search_path = public as $$
  update public.testimonials t set
    comments_count = (select count(*) from public.testimonial_comments c where c.testimonial_id = t.id and c.status = 'published'),
    reactions_count = (select count(*) from public.testimonial_reactions r where r.testimonial_id = t.id),
    reports_count = (select count(*) from public.testimonial_reports r where r.testimonial_id = t.id and r.status = 'open'),
    media_count = (select count(*) from public.testimonial_media m where m.testimonial_id = t.id and m.status = 'ready'),
    photo_count = (select count(*) from public.testimonial_media m where m.testimonial_id = t.id and m.status = 'ready' and m.kind = 'image'),
    video_count = (select count(*) from public.testimonial_media m where m.testimonial_id = t.id and m.status = 'ready' and m.kind = 'video')
  where t.id = p_testimonial;
$$;

-- Un trigger por tabla: PL/pgSQL no evalúa en cortocircuito y leer
-- NEW.comment_id en una tabla sin esa columna rompería la escritura.
create or replace function public.community_testimonial_counts()
returns trigger language plpgsql set search_path = public as $$
begin
  perform public.community_refresh_counts(coalesce(new.testimonial_id, old.testimonial_id));
  return coalesce(new, old);
end $$;

create or replace function public.community_reaction_counts()
returns trigger language plpgsql set search_path = public as $$
begin
  if coalesce(new.comment_id, old.comment_id) is not null then
    update public.testimonial_comments c
      set reactions_count = (select count(*) from public.testimonial_reactions r where r.comment_id = c.id)
      where c.id = coalesce(new.comment_id, old.comment_id);
  else
    perform public.community_refresh_counts(coalesce(new.testimonial_id, old.testimonial_id));
  end if;
  return coalesce(new, old);
end $$;

create or replace function public.community_report_counts()
returns trigger language plpgsql set search_path = public as $$
declare
  target uuid;
  open_reports integer;
begin
  if coalesce(new.comment_id, old.comment_id) is not null then
    select count(*) into open_reports from public.testimonial_reports r
      where r.comment_id = coalesce(new.comment_id, old.comment_id) and r.status = 'open';
    update public.testimonial_comments c
      set reports_count = open_reports,
          status = case when c.status = 'published' and open_reports >= 3 then 'reported' else c.status end
      where c.id = coalesce(new.comment_id, old.comment_id);
    return coalesce(new, old);
  end if;
  target := coalesce(new.testimonial_id, old.testimonial_id);
  perform public.community_refresh_counts(target);
  -- Tres denuncias abiertas retiran la publicación hasta que la revise el Ops Center.
  update public.testimonials set status = 'reported'
    where id = target and status = 'published' and reports_count >= 3;
  return coalesce(new, old);
end $$;

drop trigger if exists trg_testimonial_comments_counts on public.testimonial_comments;
create trigger trg_testimonial_comments_counts after insert or update or delete on public.testimonial_comments
  for each row execute function public.community_testimonial_counts();
drop trigger if exists trg_testimonial_media_counts on public.testimonial_media;
create trigger trg_testimonial_media_counts after insert or update or delete on public.testimonial_media
  for each row execute function public.community_testimonial_counts();
drop trigger if exists trg_testimonial_reactions_counts on public.testimonial_reactions;
create trigger trg_testimonial_reactions_counts after insert or delete on public.testimonial_reactions
  for each row execute function public.community_reaction_counts();
drop trigger if exists trg_testimonial_reports_counts on public.testimonial_reports;
create trigger trg_testimonial_reports_counts after insert or update or delete on public.testimonial_reports
  for each row execute function public.community_report_counts();

-- ---------------------------------------------------------------------------
-- 7. Seguridad: RLS + permisos por columna (lectura pública de lo publicado)
-- ---------------------------------------------------------------------------
alter table public.testimonials enable row level security;
alter table public.testimonial_media enable row level security;
alter table public.testimonial_comments enable row level security;
alter table public.testimonial_reactions enable row level security;
alter table public.testimonial_reports enable row level security;

revoke all on public.testimonials, public.testimonial_media, public.testimonial_comments,
  public.testimonial_reactions, public.testimonial_reports from anon, authenticated;

grant select (
  id, author_name, author_avatar, title, body, destination_id, destination_ref, destination_name,
  department_id, municipality, business_id, place_name, visit_month, rating, experience_type, tags,
  recommendations, tips, status, featured, verified_visit, comments_count, reactions_count,
  media_count, photo_count, video_count, published_at, created_at, updated_at,
  search_vector -- necesario para filtrar la búsqueda pública (derivado de texto ya público)
) on public.testimonials to anon, authenticated;
grant select (
  id, testimonial_id, kind, storage_path, thumb_path, mime_type, size_bytes, width, height,
  duration_seconds, position, created_at
) on public.testimonial_media to anon, authenticated;
grant select (
  id, testimonial_id, parent_id, author_name, author_avatar, body, edited, reactions_count, created_at, updated_at, status
) on public.testimonial_comments to anon, authenticated;

drop policy if exists "Lectura pública de experiencias publicadas" on public.testimonials;
create policy "Lectura pública de experiencias publicadas" on public.testimonials
  for select to anon, authenticated using (status = 'published');

drop policy if exists "Lectura pública de multimedia publicada" on public.testimonial_media;
create policy "Lectura pública de multimedia publicada" on public.testimonial_media
  for select to anon, authenticated using (
    status = 'ready' and exists (
      select 1 from public.testimonials t where t.id = testimonial_id and t.status = 'published'
    )
  );

drop policy if exists "Lectura pública de comentarios publicados" on public.testimonial_comments;
create policy "Lectura pública de comentarios publicados" on public.testimonial_comments
  for select to anon, authenticated using (
    status = 'published' and exists (
      select 1 from public.testimonials t where t.id = testimonial_id and t.status = 'published'
    )
  );
-- testimonial_reactions y testimonial_reports: sin políticas → solo service role.

-- Las funciones del esquema public se exponen por RPC: solo el servidor las ejecuta.
revoke execute on function public.community_refresh_counts(uuid) from public, anon, authenticated;
revoke execute on function public.community_touch_updated_at() from public, anon, authenticated;
revoke execute on function public.community_testimonial_counts() from public, anon, authenticated;
revoke execute on function public.community_reaction_counts() from public, anon, authenticated;
revoke execute on function public.community_report_counts() from public, anon, authenticated;
-- Los triggers llaman a community_refresh_counts con el rol que escribe (service_role).
grant execute on function public.community_refresh_counts(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- 8. Bucket de multimedia (subidas solo con URL firmada de la Edge Function)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('community-media', 'community-media', true, 41943040,
  array['image/webp', 'image/jpeg', 'image/png', 'video/mp4', 'video/webm'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
