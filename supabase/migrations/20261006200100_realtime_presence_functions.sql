-- ============================================================================
-- 🧭 BAQUEANO — FUNCIONES DE PRESENCIA (20261006200100_realtime_presence_functions.sql)
-- ============================================================================
-- 🎯 POR QUÉ: contar personas, sesiones y pestañas en línea y alimentar "Actividad en vivo".
-- ⚙️ CÓMO: SECURITY DEFINER con search_path vacío; solo service_role puede ejecutarlas
--   (la Edge Function baqueano-presence valida el origen, el límite y el rol de equipo).
--   Probado el 2026-10-06 en una transacción revertida: 2 pestañas del mismo navegador = 1 persona;
--   login sin recargar = evento "login"; Android abre y sale; anon sin acceso.
-- 📦 QUÉ: presence_heartbeat(...), presence_snapshot(), presence_feed(limit).
-- ============================================================================

create or replace function public.presence_heartbeat(
  p_tab_id text, p_browser_id text, p_user_uid text, p_user_role text, p_platform text,
  p_device_class text, p_app_version text, p_path text, p_language text, p_visible boolean, p_leave boolean
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  prev record;
  had_prev boolean := false;
  actor text := case when p_user_role in ('admin', 'super_admin', 'auditor') then 'staff'
                     when p_user_uid is not null then 'user' else 'visitor' end;
  ref text := left(md5(p_browser_id), 8);
begin
  select path, user_uid into prev from public.presence_sessions where tab_id = p_tab_id;
  had_prev := found;

  if p_leave then
    update public.presence_sessions set ended_at = now(), last_seen = now(), visible = false where tab_id = p_tab_id;
    if found then
      insert into public.presence_events (kind, actor_type, platform, path, browser_ref) values ('leave', actor, p_platform, p_path, ref);
    end if;
    return jsonb_build_object('ok', true, 'left', true);
  end if;

  insert into public.presence_sessions as s (tab_id, browser_id, user_uid, user_role, platform, device_class, app_version, path, language, visible)
  values (p_tab_id, p_browser_id, p_user_uid, p_user_role, p_platform, p_device_class, p_app_version, p_path, p_language, coalesce(p_visible, true))
  on conflict (tab_id) do update set
    browser_id = excluded.browser_id, user_uid = excluded.user_uid, user_role = excluded.user_role,
    platform = excluded.platform, device_class = excluded.device_class, app_version = excluded.app_version,
    path = excluded.path, language = excluded.language, visible = excluded.visible,
    last_seen = now(), ended_at = null;

  if not had_prev then
    -- Primera pestaña de este navegador en 30 min = inicio de visita.
    if not exists (select 1 from public.presence_sessions where browser_id = p_browser_id and tab_id <> p_tab_id and last_seen > now() - interval '30 minutes') then
      insert into public.presence_events (kind, actor_type, platform, path, browser_ref)
      values (case when p_platform = 'android' then 'android_open' else 'visit_start' end, actor, p_platform, p_path, ref);
    else
      insert into public.presence_events (kind, actor_type, platform, path, browser_ref) values ('page_enter', actor, p_platform, p_path, ref);
    end if;
  elsif prev.path is distinct from p_path then
    insert into public.presence_events (kind, actor_type, platform, path, browser_ref) values ('page_enter', actor, p_platform, p_path, ref);
  end if;
  if had_prev and prev.user_uid is null and p_user_uid is not null then
    insert into public.presence_events (kind, actor_type, platform, path, browser_ref) values ('login', actor, p_platform, p_path, ref);
  end if;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.presence_snapshot() returns jsonb
language sql security definer set search_path = '' stable as $$
  with live as (
    select * from public.presence_sessions where ended_at is null and last_seen > now() - interval '90 seconds'
  ), day_start as (
    select (date_trunc('day', now() at time zone 'America/Managua') at time zone 'America/Managua') as ds
  ), today as (
    select s.* from public.presence_sessions s, day_start d where s.last_seen >= d.ds
  )
  select jsonb_build_object(
    'generated_at', now(),
    'online_threshold_seconds', 90,
    'online', jsonb_build_object(
      'people', (select count(distinct coalesce(user_uid, browser_id)) from live),
      'sessions', (select count(distinct browser_id) from live),
      'tabs', (select count(*) from live),
      'visitors', (select count(distinct browser_id) from live where user_uid is null),
      'registered', (select count(distinct user_uid) from live where user_uid is not null),
      'staff', (select count(distinct user_uid) from live where user_role in ('admin', 'super_admin', 'auditor')),
      'web', (select count(distinct coalesce(user_uid, browser_id)) from live where platform = 'web'),
      'pwa', (select count(distinct coalesce(user_uid, browser_id)) from live where platform = 'pwa'),
      'android', (select count(distinct coalesce(user_uid, browser_id)) from live where platform = 'android'),
      'mobile', (select count(distinct browser_id) from live where device_class = 'mobile'),
      'tablet', (select count(distinct browser_id) from live where device_class = 'tablet'),
      'desktop', (select count(distinct browser_id) from live where device_class = 'desktop')
    ),
    'today', jsonb_build_object(
      'people', (select count(distinct coalesce(user_uid, browser_id)) from today),
      'registered', (select count(distinct user_uid) from today where user_uid is not null),
      'android', (select count(distinct coalesce(user_uid, browser_id)) from today where platform = 'android'),
      'page_views', (select count(*) from public.presence_events e, day_start d
                      where e.kind in ('visit_start', 'page_enter', 'android_open') and e.occurred_at >= d.ds)
    ),
    'pages_now', coalesce((select jsonb_agg(jsonb_build_object('path', p.path, 'n', p.n) order by p.n desc) from (
        select path, count(distinct browser_id) n from live group by path order by 2 desc limit 10) p), '[]'::jsonb),
    'peak_today', coalesce((select max(x.c) from (
        select count(distinct coalesce(s.user_uid, s.browser_id)) c
        from day_start d
        cross join lateral (select generate_series(d.ds, now(), interval '5 minutes') union select now()) as g(slot)
        join public.presence_sessions s on s.started_at <= g.slot and s.last_seen >= g.slot - interval '90 seconds'
        group by g.slot) x), 0)
  );
$$;

-- Feed unificado: navegación (presence_events), buzón (intake_events), opiniones y auditoría.
-- Solo tipos, estados y rutas: ningún nombre, correo ni texto escrito por personas.
create or replace function public.presence_feed(p_limit integer default 40) returns jsonb
language sql security definer set search_path = '' stable as $$
  select coalesce(jsonb_agg(to_jsonb(f) order by f.at desc), '[]'::jsonb) from (
    select * from (
      (select occurred_at as at, 'presence'::text as src, kind, actor_type, platform, path, null::text as detail
         from public.presence_events order by occurred_at desc limit 100)
      union all
      (select created_at, 'intake', kind || ':' || action, actor_type, null, null, to_status
         from public.intake_events order by created_at desc limit 20)
      union all
      (select coalesce(moderated_at, created_at), 'review', case when moderated_at is null then 'submitted' else 'moderated' end,
              case when moderated_at is null then 'user' else 'staff' end, platform, null, status
         from public.platform_reviews order by coalesce(moderated_at, created_at) desc limit 20)
      union all
      (select created_at, 'audit', coalesce(module, '') || ':' || coalesce(action, ''), 'staff', null, null, null
         from public.audit_logs order by created_at desc limit 20)
    ) u order by u.at desc limit least(greatest(coalesce(p_limit, 40), 1), 100)
  ) f;
$$;

revoke all on function public.presence_heartbeat(text, text, text, text, text, text, text, text, text, boolean, boolean) from public, anon, authenticated;
revoke all on function public.presence_snapshot() from public, anon, authenticated;
revoke all on function public.presence_feed(integer) from public, anon, authenticated;
grant execute on function public.presence_heartbeat(text, text, text, text, text, text, text, text, text, boolean, boolean) to service_role;
grant execute on function public.presence_snapshot() to service_role;
grant execute on function public.presence_feed(integer) to service_role;
