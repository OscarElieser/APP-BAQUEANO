-- ============================================================================
-- 🧭 BAQUEANO — PRUEBAS DE LA BD CENTRAL (seguridad, territorio, analítica, KPIs)
-- ============================================================================
-- 🎯 POR QUÉ: demostrar con consultas reproducibles que la BD protege, relaciona
--   y mide lo que dice (no basta con que las tablas existan).
-- ⚙️ CÓMO: un bloque DO que simula los roles `anon` y `service_role`, ejecuta
--   los casos y TERMINA con RAISE EXCEPTION para que TODO se revierta (no deja
--   datos de prueba en producción). El mensaje final lista OK/FALLA por caso.
-- 📦 QUÉ: ejecutar en el editor SQL o vía MCP `execute_sql`. Resultado esperado
--   (2026-10-05): todos los casos "OK".
-- ============================================================================
do $$
declare
  r text := '';
  ok boolean;
  k jsonb;
  h jsonb;
begin
  -- ---------- Como visitante anónimo ----------
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  execute 'set local role anon';

  begin insert into storage.objects(bucket_id, name) values ('baqueano-media', 'probe.txt'); r := r || E'\nC01 storage anon upload: FALLA';
  exception when others then r := r || E'\nC01 storage anon upload bloqueado: OK'; end;
  begin insert into storage.buckets(id, name) values ('probe-bkt', 'probe-bkt'); r := r || E'\nC02 crear bucket anon: FALLA';
  exception when others then r := r || E'\nC02 crear bucket anon bloqueado: OK'; end;
  begin truncate public.destinations; r := r || E'\nC03 truncate catálogo: FALLA';
  exception when others then r := r || E'\nC03 truncate catálogo bloqueado: OK'; end;
  begin insert into public.businesses(id, name) values ('probe', 'probe'); r := r || E'\nC04 insertar negocio anon: FALLA';
  exception when others then r := r || E'\nC04 insertar negocio anon bloqueado: OK'; end;
  begin perform 1 from public.sos_events limit 1; r := r || E'\nC05 leer SOS anon: FALLA';
  exception when others then r := r || E'\nC05 leer SOS anon bloqueado: OK'; end;
  begin perform 1 from public.analytics_events limit 1; r := r || E'\nC06 leer analítica anon: FALLA';
  exception when others then r := r || E'\nC06 leer analítica anon bloqueado: OK'; end;
  begin perform public.kpi_dashboard(); r := r || E'\nC07 KPIs anon: FALLA';
  exception when others then r := r || E'\nC07 KPIs anon bloqueado: OK'; end;
  begin perform public.db_health_report(); r := r || E'\nC08 health anon: FALLA';
  exception when others then r := r || E'\nC08 health anon bloqueado: OK'; end;

  ok := (select count(*) from public.destinations) > 0;
  r := r || E'\nC09 lectura pública de destinos publicados: ' || case when ok then 'OK' else 'FALLA' end;
  ok := (select count(*) from public.municipalities) = 153;
  r := r || E'\nC10 153 municipios públicos: ' || case when ok then 'OK' else 'FALLA' end;

  -- Ingesta validada
  ok := public.track_event('destination_viewed', 'anon-case-0001', 'sess-case-0001', 'web', 'destination', 'dest_canon_somoto', 'madriz', 'es', '/destino.html', '{}'::jsonb, '{"utm_source":"instagram","utm_campaign":"caso"}'::jsonb)
        and public.track_event('favorite_added', 'anon-case-0001', 'sess-case-0001', 'web', 'destination', 'dest_canon_somoto')
        and public.track_commercial_action('whatsapp', 'anon-case-0001', 'sess-case-0001', 'web', 'biz-coop-somoto')
        and public.submit_feedback('baqui', 5::smallint, 'anon-case-0001', 'web', 4::smallint, 'Útil');
  r := r || E'\nC11 ingesta evento/favorito/WhatsApp/feedback: ' || case when ok then 'OK' else 'FALLA' end;
  begin perform public.track_event('user_registered', 'anon-case-0001'); r := r || E'\nC12 evento de servidor desde cliente: FALLA';
  exception when others then r := r || E'\nC12 evento de servidor desde cliente bloqueado: OK'; end;
  begin perform public.track_commercial_action('whatsapp', 'anon-case-0001', null, 'web', 'no-existe'); r := r || E'\nC13 acción sobre negocio inexistente: FALLA';
  exception when others then r := r || E'\nC13 acción sobre negocio inexistente bloqueada: OK'; end;
  begin perform public.submit_feedback('baqui', 9::smallint, 'anon-case-0001'); r := r || E'\nC14 rating fuera de 1..5: FALLA';
  exception when others then r := r || E'\nC14 rating fuera de 1..5 bloqueado: OK'; end;

  -- ---------- Como servidor ----------
  execute 'reset role';
  perform set_config('request.jwt.claims', '{"role":"service_role"}', true);
  k := public.kpi_dashboard();
  ok := (k->'kpis'->'actors_activated'->>'value')::int >= 1
        and (k->'kpis'->'commercial_conversion'->>'denominator_exposed_actors')::int >= 1
        and (k->'kpis'->'feedback'->>'positive')::int >= 1;
  r := r || E'\nC15 KPIs reflejan activación, conversión y feedback: ' || case when ok then 'OK' else 'FALLA' end;
  ok := exists (select 1 from public.campaign_attribution where session_id = 'sess-case-0001' and utm_campaign = 'caso');
  r := r || E'\nC16 atribución UTM por sesión: ' || case when ok then 'OK' else 'FALLA' end;
  h := public.db_health_report();
  ok := jsonb_array_length(h->'structure'->'tables_without_rls') = 0
        and jsonb_array_length(h->'structure'->'security_definer_without_search_path') = 0;
  r := r || E'\nC17 health: todas las tablas con RLS y SECURITY DEFINER con search_path: ' || case when ok then 'OK' else 'FALLA' end;
  ok := (select count(*) from public.businesses where department_id is null or municipality_id is null) = 0;
  r := r || E'\nC18 negocios enlazados a departamento y municipio (FK): ' || case when ok then 'OK' else 'FALLA' end;

  -- CRUD con borrado lógico (experiencia)
  insert into public.experiences (id, title, category, business_id, department_id, municipality_id, status)
  values ('exp-case-0001', 'Caso de prueba', 'naturaleza', 'biz-coop-somoto', 'madriz', 'madriz__somoto', 'draft');
  update public.experiences set status = 'published', description = 'Actualizada' where id = 'exp-case-0001';
  update public.experiences set status = 'archived' where id = 'exp-case-0001';
  ok := (select status = 'archived' and description = 'Actualizada' from public.experiences where id = 'exp-case-0001');
  r := r || E'\nC19 CRUD experiencia (crear/leer/actualizar/archivar): ' || case when ok then 'OK' else 'FALLA' end;
  begin
    insert into public.experiences (id, title, category, municipality_id) values ('exp-case-0002', 'X', 'y', 'municipio-inexistente');
    r := r || E'\nC20 FK municipio inexistente: FALLA';
  exception when foreign_key_violation then r := r || E'\nC20 FK municipio inexistente rechazada: OK'; end;
  -- C21: la inmutabilidad se verifica por catálogo (los triggers BEFORE UPDATE/DELETE y
  -- BEFORE TRUNCATE existen y están activos); no se intenta borrar auditoría real.
  ok := (select count(*) from pg_trigger
         where tgrelid = 'public.audit_logs'::regclass and tgenabled = 'O'
           and tgname in ('audit_logs_no_update_delete', 'audit_logs_no_truncate')) = 2;
  r := r || E'\nC21 auditoría inmutable (triggers activos): ' || case when ok then 'OK' else 'FALLA' end;

  raise exception 'RESULTADOS (transacción revertida):%', r;
end $$;
