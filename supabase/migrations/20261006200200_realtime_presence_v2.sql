-- ============================================================================
-- 🧭 BAQUEANO — PRESENCIA v2: FIREBASE, ESTADOS Y FEED CON FILTROS (20261006200200)
-- ============================================================================
-- 🎯 POR QUÉ: el propietario pidió ver en el Ops Center a los usuarios autenticados con
--   Firebase (Google o correo) separados de los invitados, con estados ONLINE / INACTIVO /
--   OFFLINE, una tabla de usuarios conectados y un feed filtrable.
-- ⚙️ CÓMO: columnas aditivas (sin DROP) y funciones v2 nuevas; las v1 se conservan.
--   El proveedor y el nombre vienen del ID Token verificado en la Edge Function, nunca del
--   navegador. label = slug público de la URL (p. ej. "granada"), validado con regex.
--   El cierre de sesión se registra como kind='leave' con auth_provider='logout': el check
--   de kind no se amplía porque cambiarlo exige DROP CONSTRAINT.
--   Probado el 2026-10-06 en una transacción revertida: Oscar (Google, 2 pestañas) = 1 persona en línea;
--   Ana (correo, Android) en línea; visitante con la pestaña oculta = inactivo.
-- 📦 QUÉ: presence_heartbeat_v2, presence_snapshot_v2, presence_feed_v2, presence_identity.
-- ============================================================================

alter table public.presence_sessions
  add column if not exists auth_provider text check (auth_provider is null or auth_provider in ('google', 'password', 'phone', 'apple', 'anonymous', 'custom', 'other')),
  add column if not exists display_name text check (display_name is null or length(display_name) <= 80),
  add column if not exists label text check (label is null or label ~ '^[A-Za-z0-9 _.-]{1,60}$');
comment on column public.presence_sessions.display_name is 'Nombre del token de Firebase verificado (solo usuarios con sesión). Lo ve únicamente el equipo en el Ops Center.';
alter table public.presence_events
  add column if not exists auth_provider text check (auth_provider is null or length(auth_provider) <= 20),
  add column if not exists label text check (label is null or label ~ '^[A-Za-z0-9 _.-]{1,60}$');

create or replace function public.presence_identity(p_tab_id text, p_provider text, p_display_name text) returns void
language sql security definer set search_path = '' as $$
  update public.presence_sessions set auth_provider = p_provider, display_name = p_display_name where tab_id = p_tab_id;
$$;

create or replace function public.presence_heartbeat_v2(
  p_tab_id text, p_browser_id text, p_user_uid text, p_user_role text, p_auth_provider text, p_display_name text,
  p_platform text, p_device_class text, p_app_version text, p_path text, p_label text, p_language text,
  p_visible boolean, p_leave boolean
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  prev record;
  had_prev boolean := false;
  actor text := case when p_user_role in ('admin', 'super_admin', 'auditor') then 'staff'
                     when p_user_uid is not null then 'user' else 'visitor' end;
  ref text := left(md5(p_browser_id), 8);
begin
  select path, label, user_uid into prev from public.presence_sessions where tab_id = p_tab_id;
  had_prev := found;

  if p_leave then
    update public.presence_sessions set ended_at = now(), last_seen = now(), visible = false where tab_id = p_tab_id;
    if found then
      insert into public.presence_events (kind, actor_type, platform, path, label, browser_ref, auth_provider)
      values ('leave', actor, p_platform, p_path, p_label, ref, p_auth_provider);
    end if;
    return jsonb_build_object('ok', true, 'left', true);
  end if;

  insert into public.presence_sessions as s (tab_id, browser_id, user_uid, user_role, auth_provider, display_name, platform, device_class, app_version, path, label, language, visible)
  values (p_tab_id, p_browser_id, p_user_uid, p_user_role, p_auth_provider, p_display_name, p_platform, p_device_class, p_app_version, p_path, p_label, p_language, coalesce(p_visible, true))
  on conflict (tab_id) do update set
    browser_id = excluded.browser_id, user_uid = excluded.user_uid, user_role = excluded.user_role,
    auth_provider = excluded.auth_provider, display_name = excluded.display_name,
    platform = excluded.platform, device_class = excluded.device_class, app_version = excluded.app_version,
    path = excluded.path, label = excluded.label, language = excluded.language, visible = excluded.visible,
    last_seen = now(), ended_at = null;

  if not had_prev then
    if not exists (select 1 from public.presence_sessions where browser_id = p_browser_id and tab_id <> p_tab_id and last_seen > now() - interval '30 minutes') then
      insert into public.presence_events (kind, actor_type, platform, path, label, browser_ref, auth_provider)
      values (case when p_platform = 'android' then 'android_open' else 'visit_start' end, actor, p_platform, p_path, p_label, ref, p_auth_provider);
    else
      insert into public.presence_events (kind, actor_type, platform, path, label, browser_ref, auth_provider)
      values ('page_enter', actor, p_platform, p_path, p_label, ref, p_auth_provider);
    end if;
  elsif prev.path is distinct from p_path or prev.label is distinct from p_label then
    insert into public.presence_events (kind, actor_type, platform, path, label, browser_ref, auth_provider)
    values ('page_enter', actor, p_platform, p_path, p_label, ref, p_auth_provider);
  end if;
  if had_prev and prev.user_uid is null and p_user_uid is not null then
    insert into public.presence_events (kind, actor_type, platform, path, label, browser_ref, auth_provider)
    values ('login', actor, p_platform, p_path, p_label, ref, p_auth_provider);
  end if;
  if had_prev and prev.user_uid is not null and p_user_uid is null then
    insert into public.presence_events (kind, actor_type, platform, path, label, browser_ref, auth_provider)
    values ('leave', 'user', p_platform, p_path, p_label, ref, 'logout');
  end if;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.presence_snapshot_v2() returns jsonb
language sql security definer set search_path = '' stable as $$
  with recent as (
    select *,
      case when ended_at is null and last_seen > now() - interval '90 seconds' and visible then 'online'
           when ended_at is null and last_seen > now() - interval '5 minutes' then 'inactive'
           else 'offline' end as st
    from public.presence_sessions where last_seen > now() - interval '30 minutes'
  ), active as (select * from recent where st in ('online', 'inactive')),
  per_user as (
    select distinct on (user_uid) user_uid, display_name, auth_provider, user_role, platform, device_class, path, label, last_seen,
      (select case when bool_or(r2.st = 'online') then 'online' when bool_or(r2.st = 'inactive') then 'inactive' else 'offline' end
         from recent r2 where r2.user_uid = r.user_uid) as st,
      (select count(*) from recent r3 where r3.user_uid = r.user_uid and r3.st <> 'offline') as tabs
    from recent r where user_uid is not null order by user_uid, last_seen desc
  ), day_start as (
    select (date_trunc('day', now() at time zone 'America/Managua') at time zone 'America/Managua') as ds
  )
  select public.presence_snapshot() || jsonb_build_object(
    'states', jsonb_build_object(
      'online', (select count(distinct coalesce(user_uid, browser_id)) from recent where st = 'online'),
      'inactive', (select count(distinct coalesce(user_uid, browser_id)) from active a
                    where not exists (select 1 from recent o where o.st = 'online' and coalesce(o.user_uid, o.browser_id) = coalesce(a.user_uid, a.browser_id))),
      'offline_30m', (select count(distinct coalesce(user_uid, browser_id)) from recent r
                    where not exists (select 1 from active a where coalesce(a.user_uid, a.browser_id) = coalesce(r.user_uid, r.browser_id)))
    ),
    'firebase', jsonb_build_object(
      'online', (select count(distinct user_uid) from active where user_uid is not null),
      'google', (select count(distinct user_uid) from active where auth_provider = 'google'),
      'password', (select count(distinct user_uid) from active where auth_provider = 'password'),
      'other', (select count(distinct user_uid) from active where user_uid is not null and coalesce(auth_provider, 'other') not in ('google', 'password')),
      'guests', (select count(distinct browser_id) from active where user_uid is null),
      'today', (select count(distinct user_uid) from public.presence_sessions s, day_start d where s.user_uid is not null and s.last_seen >= d.ds),
      'last_login', (select max(occurred_at) from public.presence_events where kind = 'login')
    ),
    'users', coalesce((select jsonb_agg(jsonb_build_object(
        'name', coalesce(nullif(display_name, ''), 'Usuario'), 'state', st, 'provider', auth_provider, 'role', user_role,
        'platform', platform, 'device', device_class, 'path', path, 'label', label, 'last_seen', last_seen, 'tabs', tabs,
        'uid_tail', right(user_uid, 6)) order by (st = 'online') desc, last_seen desc)
      from per_user), '[]'::jsonb)
  );
$$;

create or replace function public.presence_feed_v2(p_limit integer default 60) returns jsonb
language sql security definer set search_path = '' stable as $$
  select coalesce(jsonb_agg(to_jsonb(f) order by f.at desc), '[]'::jsonb) from (
    select * from (
      (select occurred_at as at, 'presence'::text as src, kind, actor_type, platform, path, label, auth_provider, null::text as detail
         from public.presence_events order by occurred_at desc limit 150)
      union all
      (select created_at, 'intake', kind || ':' || action, actor_type, null, null, null, null, to_status
         from public.intake_events order by created_at desc limit 25)
      union all
      (select coalesce(moderated_at, created_at), 'review', case when moderated_at is null then 'submitted' else 'moderated' end,
              case when moderated_at is null then 'user' else 'staff' end, platform, null, null, auth_provider, status
         from public.platform_reviews order by coalesce(moderated_at, created_at) desc limit 25)
      union all
      (select created_at, 'audit', coalesce(module, '') || ':' || coalesce(action, ''), 'staff', null, null, null, null, null
         from public.audit_logs order by created_at desc limit 25)
    ) u order by u.at desc limit least(greatest(coalesce(p_limit, 60), 1), 150)
  ) f;
$$;

revoke all on function public.presence_identity(text, text, text) from public, anon, authenticated;
revoke all on function public.presence_heartbeat_v2(text, text, text, text, text, text, text, text, text, text, text, text, boolean, boolean) from public, anon, authenticated;
revoke all on function public.presence_snapshot_v2() from public, anon, authenticated;
revoke all on function public.presence_feed_v2(integer) from public, anon, authenticated;
grant execute on function public.presence_identity(text, text, text) to service_role;
grant execute on function public.presence_heartbeat_v2(text, text, text, text, text, text, text, text, text, text, text, text, boolean, boolean) to service_role;
grant execute on function public.presence_snapshot_v2() to service_role;
grant execute on function public.presence_feed_v2(integer) to service_role;
