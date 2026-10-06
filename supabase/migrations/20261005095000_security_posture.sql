-- ============================================================================
-- 🧭 BAQUEANO — POSTURA DE SEGURIDAD VERIFICABLE SIN RUIDO (security_posture)
-- ============================================================================
-- 🎯 POR QUÉ:
--   Los controles de CI (deploy-production.yml y tools/kronox-prod-evidence.mjs)
--   demostraban la seguridad "atacando": leían como anon 10-12 tablas cerradas y
--   emitían eventos de servidor. Postgres respondía bien (42501 / 22023), pero
--   cada intento quedaba como ERROR en los logs: el 2026-10-05 fueron los 21
--   errores de Postgres y ~20 warnings del API Gateway del panel de Supabase.
--   El propietario pidió: "NO QUIERO VER ERRORES NI WARNINGS".
-- ⚙️ CÓMO:
--   Función de solo lectura, SECURITY DEFINER, ejecutable por anon, que informa
--   los privilegios EFECTIVOS de los roles anon/authenticated (has_table_privilege,
--   has_function_privilege), si la tabla tiene RLS y qué eventos de analítica son
--   solo de servidor. No expone datos: solo booleanos sobre una lista fija.
--   Los controles de CI pasan a leer esta postura en vez de provocar denegaciones.
-- 📦 QUÉ: public.security_posture() → jsonb. Sin efectos secundarios.
-- ↩️ ROLLBACK: revoke execute on function public.security_posture() from anon;
--    (o reemplazarla); no toca datos ni políticas.
-- ⚠️ Aplicar en producción SOLO con autorización del propietario.
-- ============================================================================

create or replace function public.security_posture()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_tables text[] := array['staff_roles', 'audit_logs', 'ops_backup_entities', 'backup_operations', 'profiles', 'reservations',
    'sos_events', 'user_roles', 'identity_links', 'business_members', 'analytics_events', 'commercial_actions', 'user_feedback',
    'ai_messages', 'storage_backups', 'destinations', 'businesses', 'municipalities', 'places', 'departments'];
  v_views text[] := array['admin_user_directory'];
  v_functions text[] := array['kpi_dashboard', 'refresh_source_expiry', 'data_source_status'];
  v_out jsonb := '{}'::jsonb;
  v_name text;
  v_oid oid;
begin
  foreach v_name in array v_tables || v_views loop
    v_oid := to_regclass('public.' || quote_ident(v_name));
    if v_oid is null then
      v_out := v_out || jsonb_build_object(v_name, jsonb_build_object('exists', false));
    else
      v_out := v_out || jsonb_build_object(v_name, jsonb_build_object(
        'exists', true,
        'rls', coalesce((select c.relrowsecurity from pg_catalog.pg_class c where c.oid = v_oid), false),
        'anon_select', has_table_privilege('anon', v_oid, 'SELECT'),
        'anon_insert', has_table_privilege('anon', v_oid, 'INSERT'),
        'anon_update', has_table_privilege('anon', v_oid, 'UPDATE'),
        'anon_delete', has_table_privilege('anon', v_oid, 'DELETE'),
        'authenticated_select', has_table_privilege('authenticated', v_oid, 'SELECT'),
        'authenticated_insert', has_table_privilege('authenticated', v_oid, 'INSERT')));
    end if;
  end loop;

  return jsonb_build_object(
    'generated_at', now(),
    'relations', v_out,
    'functions', (
      select coalesce(jsonb_object_agg(f.name, jsonb_build_object(
        'exists', p.oid is not null,
        'anon_execute', p.oid is not null and has_function_privilege('anon', p.oid, 'EXECUTE'))), '{}'::jsonb)
      from unnest(v_functions) as f(name)
      left join lateral (
        select pp.oid from pg_catalog.pg_proc pp
        join pg_catalog.pg_namespace n on n.oid = pp.pronamespace
        where n.nspname = 'public' and pp.proname = f.name
        limit 1) p on true),
    -- Eventos que track_event rechaza desde el cliente (solo los emite el servidor).
    'server_only_events', (
      case when to_regclass('public.analytics_event_types') is null then '[]'::jsonb
      else (select coalesce(jsonb_agg(t.name order by t.name), '[]'::jsonb) from public.analytics_event_types t where not t.client_allowed) end)
  );
end $$;

comment on function public.security_posture() is
  'Postura de seguridad (solo booleanos de privilegios/RLS sobre una lista fija). La usan los controles de CI para probar el cierre de tablas sin provocar errores en los logs.';
revoke all on function public.security_posture() from public;
grant execute on function public.security_posture() to anon, authenticated, service_role;
