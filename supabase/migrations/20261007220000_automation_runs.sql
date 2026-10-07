-- ============================================================================
-- 🧭 BAQUEANO — AUTOMATIZACIÓN: CONTROLES PROGRAMADOS CON HISTORIAL (F8)
-- ============================================================================
-- 🎯 POR QUÉ: el plan de evolución (F8) pide automatización en infraestructura con
--    historial verificable (automation_runs). Hasta hoy la salud solo se medía al abrir
--    el Ops Center (baqueano-ops → health), sin registro: si algo fallaba de noche
--    nadie lo sabía ni quedaba evidencia.
-- ⚙️ CÓMO:
--    - pg_cron ejecuta public.run_automation_checks('cron') cada hora (minuto 17), dentro
--      de la base de datos: no hace falta ninguna clave en GitHub Actions ni en el navegador.
--    - Cada control mide algo real y deja estado OK / WARN / FAIL con detalle:
--        web /health (commit publicado), sitemap.xml, /descargar y la APK, RLS en todas las
--        tablas, funciones security definer sin search_path, calidad de datos y
--        operación (db_health_report), y actividad de BAQÜI.
--    - automation_runs: RLS activo y SIN políticas. Solo la lee el Ops Center a través de
--      la Edge Function baqueano-ops (rol staff verificado en el servidor).
--    - La función no tiene EXECUTE para anon ni authenticated: nadie la dispara desde fuera.
--      El botón "Ejecutar ahora" del Ops Center pasa por baqueano-ops (admin) con service_role.
--    - Sin DROP ni DELETE: el historial se conserva.
-- 📦 QUÉ: extensión pg_cron, tabla automation_runs, función run_automation_checks(text),
--    tarea cron "baqueano-automation-hourly".
-- ============================================================================
create extension if not exists pg_cron;

create table if not exists public.automation_runs (
  id bigint generated always as identity primary key,
  job text not null default 'health_checks' check (job ~ '^[a-z_]{3,40}$'),
  trigger text not null check (trigger in ('cron', 'manual')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running', 'ok', 'warn', 'fail')),
  checks jsonb not null default '[]'::jsonb,
  summary text
);
alter table public.automation_runs enable row level security;
create index if not exists automation_runs_started_idx on public.automation_runs (started_at desc);
comment on table public.automation_runs is 'Historial de controles automáticos (F8). Solo lectura vía baqueano-ops; sin políticas públicas.';

create or replace function public.run_automation_checks(p_trigger text default 'cron')
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_id bigint;
  v_checks jsonb := '[]'::jsonb;
  v_t0 timestamptz;
  v_res extensions.http_response;
  v_ms integer;
  v_report jsonb;
  v_n bigint;
  v_list jsonb;
  v_status text;
  v_fail integer;
  v_warn integer;
  v_body text;
begin
  if p_trigger not in ('cron', 'manual') then raise exception 'trigger inválido'; end if;
  insert into public.automation_runs (trigger) values (p_trigger) returning id into v_id;
  perform extensions.http_set_curlopt('CURLOPT_TIMEOUT', '12');

  -- 1. Web publicada: /health responde con el commit desplegado.
  begin
    v_t0 := clock_timestamp();
    v_res := extensions.http_get('https://baqueanonicaragua.com/health');
    v_ms := (extract(epoch from clock_timestamp() - v_t0) * 1000)::int;
    v_body := coalesce(substring(v_res.content from '"commit"\s*:\s*"([0-9a-f]{7,40})"'), '');
    v_checks := v_checks || jsonb_build_object('id', 'web_health', 'label', 'Web /health', 'ms', v_ms,
      'state', case when v_res.status = 200 and v_body <> '' then (case when v_ms > 4000 then 'warn' else 'ok' end) else 'fail' end,
      'detail', case when v_res.status = 200 then 'HTTP 200 · commit ' || nullif(left(v_body, 7), '') else 'HTTP ' || v_res.status end);
  exception when others then
    v_checks := v_checks || jsonb_build_object('id', 'web_health', 'label', 'Web /health', 'state', 'fail', 'detail', 'Sin respuesta: ' || left(sqlerrm, 120));
  end;

  -- 2. sitemap.xml: responde y lista las páginas indexables.
  begin
    v_res := extensions.http_get('https://baqueanonicaragua.com/sitemap.xml');
    v_n := (select count(*) from regexp_matches(coalesce(v_res.content, ''), '<loc>', 'g'));
    v_checks := v_checks || jsonb_build_object('id', 'sitemap', 'label', 'sitemap.xml',
      'state', case when v_res.status = 200 and v_n >= 20 then 'ok' when v_res.status = 200 then 'warn' else 'fail' end,
      'detail', 'HTTP ' || v_res.status || ' · ' || v_n || ' URL');
  exception when others then
    v_checks := v_checks || jsonb_build_object('id', 'sitemap', 'label', 'sitemap.xml', 'state', 'fail', 'detail', 'Sin respuesta: ' || left(sqlerrm, 120));
  end;

  -- 3. Descarga de la app: página /descargar y archivo APK.
  begin
    v_res := extensions.http(('HEAD', 'https://baqueanonicaragua.com/downloads/baqueano-android.apk', array[]::extensions.http_header[], null, null)::extensions.http_request);
    v_n := v_res.status;
    v_res := extensions.http(('HEAD', 'https://baqueanonicaragua.com/descargar', array[]::extensions.http_header[], null, null)::extensions.http_request);
    v_checks := v_checks || jsonb_build_object('id', 'app_download', 'label', 'App Android (/descargar y APK)',
      'state', case when v_n = 200 and v_res.status = 200 then 'ok' else 'fail' end,
      'detail', '/descargar HTTP ' || v_res.status || ' · APK HTTP ' || v_n);
  exception when others then
    v_checks := v_checks || jsonb_build_object('id', 'app_download', 'label', 'App Android (/descargar y APK)', 'state', 'fail', 'detail', 'Sin respuesta: ' || left(sqlerrm, 120));
  end;

  -- 4–6. Seguridad, calidad de datos y operación (misma fuente que el Ops Center).
  begin
    v_report := public.db_health_report();
    v_list := v_report -> 'structure' -> 'tables_without_rls';
    v_checks := v_checks || jsonb_build_object('id', 'rls', 'label', 'RLS en todas las tablas públicas',
      'state', case when jsonb_array_length(v_list) = 0 then 'ok' else 'fail' end,
      'detail', case when jsonb_array_length(v_list) = 0 then (v_report -> 'structure' ->> 'rls_enabled') || ' tablas con RLS'
                     else 'Sin RLS: ' || left(v_list::text, 200) end);
    v_list := v_report -> 'structure' -> 'security_definer_without_search_path';
    v_checks := v_checks || jsonb_build_object('id', 'definer_search_path', 'label', 'Funciones security definer con search_path fijo',
      'state', case when jsonb_array_length(v_list) = 0 then 'ok' else 'warn' end,
      'detail', case when jsonb_array_length(v_list) = 0 then 'Todas fijan search_path' else 'Sin search_path: ' || left(v_list::text, 200) end);
    v_n := coalesce((v_report -> 'data_quality' ->> 'businesses_published_without_source')::bigint, 0)
         + coalesce((v_report -> 'data_quality' ->> 'content_published_without_source')::bigint, 0)
         + coalesce((v_report -> 'data_quality' ->> 'destinations_invalid_coordinates')::bigint, 0)
         + coalesce((v_report -> 'data_quality' ->> 'profiles_without_auth_user')::bigint, 0);
    v_checks := v_checks || jsonb_build_object('id', 'data_quality', 'label', 'Calidad de datos publicados',
      'state', case when v_n = 0 then 'ok' else 'warn' end,
      'detail', 'Publicados sin fuente: ' || ((v_report -> 'data_quality' ->> 'businesses_published_without_source')::bigint + (v_report -> 'data_quality' ->> 'content_published_without_source')::bigint)
                || ' · coordenadas fuera de Nicaragua: ' || (v_report -> 'data_quality' ->> 'destinations_invalid_coordinates')
                || ' · perfiles sin usuario: ' || (v_report -> 'data_quality' ->> 'profiles_without_auth_user'));
    v_checks := v_checks || jsonb_build_object('id', 'operations', 'label', 'Pendientes de operación',
      'state', case when (v_report -> 'operations' ->> 'open_sos')::int > 0 then 'warn' else 'ok' end,
      'detail', 'SOS abiertos: ' || (v_report -> 'operations' ->> 'open_sos')
                || ' · verificaciones: ' || (v_report -> 'operations' ->> 'pending_verifications')
                || ' · reservas: ' || (v_report -> 'operations' ->> 'pending_reservations')
                || ' · conocimiento por revisar: ' || (v_report -> 'operations' ->> 'pending_knowledge_candidates'));
  exception when others then
    v_checks := v_checks || jsonb_build_object('id', 'db_health', 'label', 'Reporte de salud de la base', 'state', 'fail', 'detail', left(sqlerrm, 160));
  end;

  -- 7. BAQÜI: hubo respuestas registradas en los últimos 7 días.
  begin
    select max(created_at) into v_t0 from public.ai_messages;
    v_checks := v_checks || jsonb_build_object('id', 'baqui_activity', 'label', 'BAQÜI (actividad 7 días)',
      'state', case when v_t0 > now() - interval '7 days' then 'ok' else 'warn' end,
      'detail', case when v_t0 is null then 'Sin interacciones registradas' else 'Última respuesta: ' || to_char(v_t0 at time zone 'America/Managua', 'YYYY-MM-DD HH24:MI') || ' (hora de Nicaragua)' end);
  exception when others then
    v_checks := v_checks || jsonb_build_object('id', 'baqui_activity', 'label', 'BAQÜI (actividad 7 días)', 'state', 'fail', 'detail', left(sqlerrm, 160));
  end;

  select count(*) filter (where c ->> 'state' = 'fail'), count(*) filter (where c ->> 'state' = 'warn')
    into v_fail, v_warn from jsonb_array_elements(v_checks) c;
  v_status := case when v_fail > 0 then 'fail' when v_warn > 0 then 'warn' else 'ok' end;
  update public.automation_runs
     set finished_at = clock_timestamp(), status = v_status, checks = v_checks,
         summary = jsonb_array_length(v_checks) || ' controles · ' || v_fail || ' fallas · ' || v_warn || ' avisos'
   where id = v_id;
  return jsonb_build_object('id', v_id, 'status', v_status, 'checks', v_checks);
end;
$$;

revoke all on function public.run_automation_checks(text) from public;
revoke all on function public.run_automation_checks(text) from anon, authenticated;

-- Cada hora, minuto 17 (evita el pico del minuto 0). cron.schedule con el mismo nombre
-- actualiza la tarea existente: la migración se puede reaplicar sin duplicar.
select cron.schedule('baqueano-automation-hourly', '17 * * * *', $cron$select public.run_automation_checks('cron')$cron$);
