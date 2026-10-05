-- ============================================================================
-- 🧭 BAQUEANO — CIERRE DE STORAGE Y PRIVILEGIOS DE CLIENTE (auditoría BD G-1…G-5)
-- ============================================================================
-- 🎯 POR QUÉ:
--   La auditoría del 2026-10-05 encontró que producción NO tenía aplicada la
--   migración 20261003213000: las políticas de `storage.objects` permitían a
--   cualquier visitante (rol `anon`) subir, sobrescribir y borrar archivos del
--   bucket público `baqueano-media`, y `storage.buckets` permitía crear buckets.
--   Además los roles cliente conservaban TRUNCATE/escritura en tablas de
--   catálogo (RLS frena la escritura, pero TRUNCATE no está cubierto por RLS).
-- ⚙️ CÓMO (no destructivo):
--   - No se borra ninguna política: `ALTER POLICY … TO service_role` las deja
--     existentes pero aplicables solo al backend (que además omite RLS).
--   - REVOKE de privilegios de escritura/TRUNCATE a `anon`/`authenticated` en
--     tablas que solo se escriben por Edge Functions. La lectura se conserva.
--   - `traffic_sessions`: la inserción pública se mantiene (la web la usa)
--     pero con validación de forma y longitudes.
--   - `sos_events`: política RESTRICTIVA explícita (antes: RLS sin políticas).
-- 📦 QUÉ: storage de solo lectura para visitantes; catálogo de solo lectura
--   para clientes; telemetría acotada. Idempotente.
-- ↩️ ROLLBACK: `ALTER POLICY … TO public` y `GRANT …` restauran el estado
--   anterior (documentado en docs/database/MIGRATION_GUIDE.md). No recomendado.
-- ============================================================================

-- G-1 Storage: mutaciones y creación de buckets solo para el backend --------
do $$
declare
  p record;
begin
  for p in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'storage'
      and (
        (tablename = 'objects' and cmd in ('INSERT', 'UPDATE', 'DELETE')
          and coalesce(qual, '') || coalesce(with_check, '') like '%baqueano-media%')
        or (tablename = 'buckets' and cmd = 'INSERT')
      )
      and roles <> '{service_role}'::name[]
  loop
    execute format('alter policy %I on %I.%I to service_role', p.policyname, p.schemaname, p.tablename);
  end loop;
end $$;

-- G-3 Privilegios de cliente: lectura sí, escritura/TRUNCATE no -------------
do $$
declare
  t text;
  catalog_tables text[] := array[
    'communities','crafts','culture','day_passes','departments','destinations','emergencies','events',
    'experiences','festivals','gastronomy','heritage','historical_figures','knowledge_documents','legends',
    'municipalities','museums','music','places','reviews','route_stops','routes','tourism_services',
    'explorer_passport_stamps','travel_diaries'
  ];
begin
  foreach t in array catalog_tables loop
    if to_regclass('public.' || t) is not null then
      execute format('revoke insert, update, delete, truncate on public.%I from anon, authenticated', t);
    end if;
  end loop;
  -- Tablas solo servidor: sin privilegios de cliente (RLS RESTRICTIVA ya las cierra).
  foreach t in array array['ai_sessions','ai_messages'] loop
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
  execute 'revoke truncate on public.traffic_sessions from anon, authenticated';
  execute 'revoke insert, update, delete, truncate on public.public_ecosystem_metrics from anon, authenticated';
end $$;

-- G-4 Telemetría: inserción pública acotada ---------------------------------
alter policy "Permitir insercion de telemetria publica" on public.traffic_sessions
  with check (
    platform in ('web', 'android', 'ios')
    and char_length(id) between 8 and 80
    and (path is null or char_length(path) <= 300)
    and (page is null or char_length(page) <= 200)
    and (referrer is null or char_length(referrer) <= 500)
    and (user_agent is null or char_length(user_agent) <= 400)
    and (user_id is null or char_length(user_id) <= 128)
  );

-- G-5 SOS: cierre explícito (antes implícito por RLS sin políticas) ---------
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'sos_events') then
    execute $p$create policy "Solo servidor (Edge Functions)" on public.sos_events
      as restrictive for all to anon, authenticated using (false) with check (false)$p$;
  end if;
end $$;
