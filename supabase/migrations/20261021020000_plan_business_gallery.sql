-- ============================================================================
-- 🧭 BAQUEANO — VÍNCULO AUTOMÁTICO DEL PLAN Y GALERÍA DE FOTOS POR PLAN
-- ============================================================================
-- 🎯 POR QUÉ (propietario, 2026-10-21): «Resolvamos esto»:
--   1. Marcar una solicitud como «publicada» solo cambiaba su estado: no creaba el negocio en
--      Aliados, así que un pedido pagado nunca quedaba vinculado y no se activaban los
--      destacados ni la prioridad en BAQUI.
--   2. Las fichas no tenían galería: el límite de fotos de cada plan (6 / 20 / sin límite y
--      video en Cumbre) no se podía cumplir.
-- ⚙️ CÓMO:
--   - Al pasar a «published» una solicitud que viene de un plan pagado
--     (plan_orders.business_application_code), la base crea el negocio con los datos de la
--     solicitud y lo vincula al pedido. Si ya existe uno del mismo titular (owner_uid) o con
--     el mismo nombre y departamento, lo reutiliza: nunca duplica. El negocio nace SIN
--     verificar (el sello lo pone el equipo con documentos o visita) y sin pin exacto (la
--     ubicación de la solicitud queda como aproximada hasta que el equipo la confirme).
--   - business_media: fotos (y un video en Cumbre) de cada negocio. El límite lo pone el plan
--     vigente y se controla en la base al subir o aprobar. Lo que sube el propietario entra
--     «pendiente» y el equipo lo aprueba. Nada se borra: se retira con motivo.
--   - business_media_public(): lo único público; respeta el límite del plan vigente (si el plan
--     baja o vence, se muestran solo las primeras fotos permitidas, sin borrar ninguna).
-- 📦 QUÉ: funciones plan_department_id, plan_business_category, business_plan_code,
--   plan_photo_limit, plan_application_published (+ trigger), tabla business_media (+ guardia)
--   y business_media_public.
-- ↩️ ROLLBACK: drop trigger plan_application_published on public.business_applications;
--   drop trigger business_media_guard on public.business_media; (tablas y negocios creados se
--   conservan: no se borra nada).
-- ============================================================================

begin;

-- 1) Utilidades ----------------------------------------------------------------
create or replace function public.plan_department_id(p_name text)
returns text language sql immutable set search_path = public, pg_temp as $$
  select case regexp_replace(lower(translate(coalesce(p_name, ''), 'ÁÉÍÓÚáéíóúÑñ', 'AEIOUaeiouNn')), '[^a-z ]', '', 'g')
    when 'boaco' then 'boaco' when 'carazo' then 'carazo' when 'chinandega' then 'chinandega' when 'chontales' then 'chontales'
    when 'costa caribe norte' then 'raccn' when 'costa caribe sur' then 'raccs' when 'esteli' then 'esteli' when 'granada' then 'granada'
    when 'jinotega' then 'jinotega' when 'leon' then 'leon' when 'madriz' then 'madriz' when 'managua' then 'managua'
    when 'masaya' then 'masaya' when 'matagalpa' then 'matagalpa' when 'nueva segovia' then 'nueva_segovia'
    when 'rio san juan' then 'rio_san_juan' when 'rivas' then 'rivas' else null end;
$$;

-- Categorías del formulario de planes → categorías de Aliados (las mismas que ya usa la web).
create or replace function public.plan_business_category(p_category text)
returns text language sql immutable set search_path = public, pg_temp as $$
  select case p_category
    when 'alojamiento' then 'hospedaje' when 'gastronomia' then 'comedor' when 'restaurante' then 'restaurante'
    when 'guia' then 'guia' when 'experiencia' then 'guia' when 'transporte' then 'transporte'
    when 'alquiler_vehiculos' then 'transporte' else coalesce(nullif(p_category, ''), 'otro') end;
$$;

-- Plan vigente más alto de un negocio (null si no tiene).
create or replace function public.business_plan_code(p_business_id text)
returns text language sql stable security definer set search_path = public, pg_temp as $$
  select o.plan_code from public.plan_orders o
  where o.business_id = p_business_id and o.status = 'paid'
    and o.period_end >= (now() at time zone 'America/Managua')::date
  order by case o.plan_code when 'cumbre' then 1 when 'mirador' then 2 else 3 end
  limit 1;
$$;

-- Fotos permitidas por plan: igual que planes.html y baqueano-plans/duties.ts. -1 = sin límite.
create or replace function public.plan_photo_limit(p_plan text)
returns integer language sql immutable set search_path = public, pg_temp as $$
  select case p_plan when 'sendero' then 6 when 'mirador' then 20 when 'cumbre' then -1 else 0 end;
$$;

-- 2) Vínculo automático al publicar la solicitud del plan -----------------------
create or replace function public.plan_application_published()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_order public.plan_orders;
  v_dept text;
  v_biz text;
  v_slug text;
  v_base text;
  v_n int := 1;
  v_name text := coalesce(nullif(trim(new.trade_name), ''), new.business_name);
  v_has_coords boolean := new.lat between 10.5 and 15.2 and new.lng between -88.0 and -82.5;
begin
  select * into v_order from public.plan_orders
    where business_application_code = new.code and status = 'paid'
    order by period_end desc nulls last limit 1;
  if not found or v_order.business_id is not null then return new; end if;
  v_dept := public.plan_department_id(new.department);
  -- Si algo falla, la publicación de la solicitud sigue adelante: el motivo queda en las notas del
  -- pedido y el equipo vincula a mano con «Vincular negocio publicado».
  begin

  -- Reutiliza un negocio existente: mismo titular, o mismo nombre y departamento.
  select b.id into v_biz from public.businesses b
    where b.deleted_at is null and (
      (new.user_id is not null and b.owner_uid = new.user_id)
      or (lower(b.name) = lower(v_name) and b.department_id is not distinct from v_dept))
    order by (b.owner_uid = new.user_id) desc nulls last, b.created_at
    limit 1;

  if v_biz is null then
    v_base := trim(both '-' from regexp_replace(lower(translate(v_name, 'ÁÉÍÓÚÜáéíóúüÑñ', 'AEIOUUaeiouuNn')), '[^a-z0-9]+', '-', 'g'));
    if v_base = '' then v_base := 'negocio'; end if;
    v_base := left(v_base, 60);
    v_slug := v_base;
    while exists (select 1 from public.businesses where id = 'biz-' || v_slug or slug = v_slug) loop
      v_n := v_n + 1; v_slug := v_base || '-' || v_n;
    end loop;
    v_biz := 'biz-' || v_slug;
    insert into public.businesses (
      id, slug, name, category, department, department_id, municipality, phone, whatsapp, email, address,
      latitude, longitude, location_precision, map_ready, description, website_url, owner_uid, host_name,
      verified, ethical_badge, verification_status, status, is_published,
      source_type, source_name, retrieved_at, created_by, attributes)
    values (
      v_biz, v_slug, v_name, public.plan_business_category(new.category), new.department, v_dept, new.municipality,
      nullif(new.phone, ''), nullif(coalesce(nullif(new.whatsapp, ''), new.phone), ''),
      case when new.email ~* '^[^@\s]+@[^@\s]+\.[a-z]{2,}$' then new.email end, nullif(new.address, ''),
      case when v_has_coords then new.lat end, case when v_has_coords then new.lng end,
      case when v_has_coords then 'approximate' else 'missing' end, false,
      left(coalesce(nullif(new.description, ''), new.short_description), 2000),
      case when new.website ~ '^https?://[^ ]+$' then new.website end,
      new.user_id, nullif(new.owner_name, ''),
      false, false, 'unverified', 'published', true,
      'business_owner', 'Solicitud ' || new.code || ' (plan ' || v_order.plan_code || ')', now(),
      coalesce(new.reviewed_by, 'plan_application_published'),
      jsonb_build_object('plan_order', v_order.code, 'application', new.code));
  end if;

  update public.plan_orders set business_id = v_biz where id = v_order.id and business_id is null;
  exception when others then
    update public.plan_orders
      set staff_notes = left(coalesce(staff_notes || E'\n', '') || 'Vínculo automático no se pudo hacer (' || to_char(now() at time zone 'America/Managua', 'YYYY-MM-DD HH24:MI') || '): ' || sqlerrm, 2000)
      where id = v_order.id;
  end;
  return new;
end $$;
drop trigger if exists plan_application_published on public.business_applications;
create trigger plan_application_published after update of status on public.business_applications
  for each row when (new.status = 'published' and old.status is distinct from 'published')
  execute function public.plan_application_published();
revoke all on function public.plan_application_published() from public, anon, authenticated;

-- 3) Galería -------------------------------------------------------------------
create table if not exists public.business_media (
  id uuid primary key default gen_random_uuid(),
  business_id text not null references public.businesses(id),
  kind text not null check (kind in ('photo', 'video')),
  -- Foto: ruta en el bucket público «businesses» (gallery/<negocio>/<archivo>).
  -- Video: enlace https a YouTube, Vimeo, Facebook, Instagram o TikTok.
  storage_path text check (storage_path is null or storage_path ~ '^gallery/[a-z0-9_-]+/[a-f0-9-]{36}\.(jpg|png|webp)$'),
  url text not null check (url ~ '^https://[^\s<>"'']+$' and char_length(url) <= 500),
  alt_text text check (alt_text is null or char_length(alt_text) between 3 and 160),
  sort_order integer not null default 100 check (sort_order between 0 and 10000),
  status text not null default 'pending' check (status in ('pending', 'active', 'rejected', 'removed')),
  uploaded_by text not null check (char_length(uploaded_by) between 3 and 254),
  uploaded_role text not null check (uploaded_role in ('owner', 'staff')),
  reviewed_by text,
  reviewed_at timestamptz,
  status_reason text check (status_reason is null or char_length(status_reason) between 3 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_media_photo_path check (kind <> 'photo' or storage_path is not null),
  constraint business_media_video_host check (kind <> 'video' or url ~* '^https://(www\.|m\.)?(youtube\.com|youtu\.be|vimeo\.com|facebook\.com|fb\.watch|instagram\.com|tiktok\.com)/')
);
create index if not exists business_media_business_idx on public.business_media (business_id, status, sort_order);
comment on table public.business_media is
  'Fotos y video de cada negocio. Límite según el plan vigente (Sendero 6, Mirador 20, Cumbre sin límite + 1 video). Lo del propietario entra pendiente; el equipo aprueba. Nunca se borra: se retira con motivo.';

create or replace function public.business_media_guard()
returns trigger language plpgsql set search_path = public, pg_temp as $$
declare
  v_plan text;
  v_limit int;
  v_count int;
begin
  if tg_op = 'DELETE' then raise exception 'Las fotos no se borran: se retiran con motivo.'; end if;
  if tg_op = 'UPDATE' then
    if new.business_id is distinct from old.business_id or new.kind is distinct from old.kind
       or new.url is distinct from old.url or new.storage_path is distinct from old.storage_path
       or new.uploaded_by is distinct from old.uploaded_by or new.created_at is distinct from old.created_at then
      raise exception 'Una foto registrada no cambia de negocio ni de archivo.';
    end if;
    if old.status in ('removed', 'rejected') and new.status in ('active', 'pending') then
      raise exception 'Una foto retirada o rechazada no vuelve: subila de nuevo.';
    end if;
    new.updated_at := now();
  else
    new.created_at := now(); new.updated_at := now();
  end if;
  -- Solo cuenta para el límite lo que está visible o por revisar.
  if new.status in ('active', 'pending') and (tg_op = 'INSERT' or old.status not in ('active', 'pending')) then
    v_plan := public.business_plan_code(new.business_id);
    if new.kind = 'video' then
      if v_plan is distinct from 'cumbre' then raise exception 'El video de presentación es parte del plan Cumbre.'; end if;
      select count(*) into v_count from public.business_media
        where business_id = new.business_id and kind = 'video' and status in ('active', 'pending') and id <> new.id;
      if v_count >= 1 then raise exception 'Ya hay un video: retiralo antes de agregar otro.'; end if;
    else
      v_limit := public.plan_photo_limit(v_plan);
      if v_limit = 0 then raise exception 'Este negocio no tiene un plan vigente con galería de fotos.'; end if;
      if v_limit > 0 then
        select count(*) into v_count from public.business_media
          where business_id = new.business_id and kind = 'photo' and status in ('active', 'pending') and id <> new.id;
        if v_count >= v_limit then raise exception 'El plan % permite hasta % fotos.', initcap(v_plan), v_limit; end if;
      end if;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists business_media_guard on public.business_media;
create trigger business_media_guard before insert or update or delete on public.business_media
  for each row execute function public.business_media_guard();

alter table public.business_media enable row level security;
revoke all on public.business_media from public, anon, authenticated;
revoke all on function public.business_media_guard() from public, anon, authenticated;

-- Lo público: fotos aprobadas dentro del límite del plan vigente, y el video si es Cumbre.
create or replace function public.business_media_public(p_business_id text)
returns table (kind text, url text, alt_text text, sort_order integer)
language sql stable security definer set search_path = public, pg_temp as $$
  with plan as (select public.business_plan_code(p_business_id) as code),
  biz as (select 1 from public.businesses b where b.id = p_business_id and b.is_published and b.deleted_at is null),
  photos as (
    select m.kind, m.url, m.alt_text, m.sort_order, row_number() over (order by m.sort_order, m.created_at) as n
    from public.business_media m where m.business_id = p_business_id and m.kind = 'photo' and m.status = 'active')
  select p.kind, p.url, p.alt_text, p.sort_order from photos p, plan
    where exists (select 1 from biz) and plan.code is not null
      and (public.plan_photo_limit(plan.code) < 0 or p.n <= public.plan_photo_limit(plan.code))
  union all
  select m.kind, m.url, m.alt_text, m.sort_order from public.business_media m, plan
    where exists (select 1 from biz) and plan.code = 'cumbre' and m.business_id = p_business_id and m.kind = 'video' and m.status = 'active'
  order by 1, 4;
$$;
revoke all on function public.business_media_public(text) from public;
grant execute on function public.business_media_public(text) to anon, authenticated, service_role;
revoke all on function public.business_plan_code(text) from public, anon, authenticated;
grant execute on function public.business_plan_code(text) to service_role;

commit;
