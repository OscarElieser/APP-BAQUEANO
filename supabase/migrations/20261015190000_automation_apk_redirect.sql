-- ============================================================================
-- 🧭 BAQUEANO — CONTROL DE DESCARGA DEL APK CON GITHUB RELEASES (15-10-2026)
-- 🎯 POR QUÉ: «revise aqui cual son los errores y corregirlo» (Ops Center → Automatización).
--   El control «App Android» fallaba con «APK HTTP 302»: desde la migración a Cloudflare el
--   APK (más de 25 MB) se descarga de GitHub Releases y la ruta del sitio redirige. La
--   descarga funcionaba; el control esperaba un 200 directo.
-- ⚙️ CÓMO: misma función run_automation_checks; solo cambia el control 3: sigue hasta 4
--   redirecciones permitidas (GitHub Releases y su CDN) y exige 200 al final.
-- 📦 QUÉ: create or replace de public.run_automation_checks(text); permisos sin cambios.
-- ============================================================================
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
  v_url text;
  v_loc text;
  v_hops integer;
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
  --    2026-10-15: el APK se sirve desde GitHub Releases (Cloudflare limita 25 MB por archivo),
  --    así que /downloads/baqueano-android.apk redirige. Se siguen hasta 4 redirecciones y solo
  --    se aceptan destinos de github.com/OscarElieser/APP-BAQUEANO/releases y su CDN; el
  --    resultado final debe ser HTTP 200.
  begin
    v_url := 'https://baqueanonicaragua.com/downloads/baqueano-android.apk';
    v_hops := 0;
    loop
      v_res := extensions.http(('HEAD', v_url, array[]::extensions.http_header[], null, null)::extensions.http_request);
      exit when v_res.status not in (301, 302, 303, 307, 308) or v_hops >= 4;
      select h.value into v_loc from unnest(v_res.headers) h where lower(h.field) = 'location' limit 1;
      exit when v_loc is null
        or (v_hops = 0 and v_loc !~ '^https://github\.com/OscarElieser/APP-BAQUEANO/releases/')
        or (v_hops > 0 and v_loc !~ '^https://([a-z0-9-]+\.)*(github\.com|githubusercontent\.com)/');
      v_url := v_loc;
      v_hops := v_hops + 1;
    end loop;
    v_n := v_res.status;
    v_res := extensions.http(('HEAD', 'https://baqueanonicaragua.com/descargar', array[]::extensions.http_header[], null, null)::extensions.http_request);
    v_checks := v_checks || jsonb_build_object('id', 'app_download', 'label', 'App Android (/descargar y APK)',
      'state', case when v_n = 200 and v_res.status = 200 then 'ok' else 'fail' end,
      'detail', '/descargar HTTP ' || v_res.status || ' · APK HTTP ' || v_n
                || case when v_hops > 0 then ' (GitHub Releases, ' || v_hops || ' redirecciones)' else '' end);
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
