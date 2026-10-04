-- ============================================================================
-- 🧭 BAQUEANO — PRUEBAS NEGATIVAS DE RLS (Hackathon Nicaragua 2026)
-- ============================================================================
-- 🎯 POR QUÉ: demostrar al jurado que el cliente público no puede leer,
--    falsificar ni borrar auditoría, respaldos ni datos personales, y que sí
--    lee el catálogo publicado.
-- ⚙️ CÓMO: pgTAP con SET LOCAL ROLE anon; todo se revierte al final.
-- 📦 QUÉ: `supabase test db` (resultado 2026-10-04 en producción, transacción
--    revertida: 12/12 como se esperaba).
-- ============================================================================
BEGIN;
SELECT plan(14);

-- Privilegios de tabla (defensa en profundidad)
SELECT ok(NOT has_table_privilege('anon', 'public.audit_logs', 'SELECT'), 'anon sin privilegio de leer audit_logs');
SELECT ok(NOT has_table_privilege('anon', 'public.ops_backup_entities', 'UPDATE'), 'anon sin privilegio sobre respaldos');
SELECT ok(NOT has_table_privilege('authenticated', 'public.storage_backups', 'SELECT'), 'authenticated sin privilegio sobre réplicas');
SELECT ok(NOT has_table_privilege('anon', 'public.traffic_sessions', 'SELECT'), 'anon no lee telemetría');

-- Políticas restrictivas explícitas en tablas de servidor
SELECT ok(EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Solo servidor (Edge Functions)' AND permissive = 'RESTRICTIVE'), 'profiles: solo servidor');
SELECT ok(EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reservations' AND policyname = 'Solo servidor (Edge Functions)'), 'reservations: solo servidor');
SELECT ok(NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND roles::text LIKE '%public%' AND cmd = 'ALL' AND qual = 'true'), 'ninguna política ALL abierta a public');

-- Comportamiento efectivo como anon
SET LOCAL ROLE anon;
SELECT throws_ok($$ SELECT count(*) FROM public.profiles $$, '42501', NULL, 'anon no lee perfiles');
SELECT throws_ok($$ SELECT count(*) FROM public.reservations $$, '42501', NULL, 'anon no lee reservas');
SELECT throws_ok($$ SELECT count(*) FROM public.official_super_admins $$, '42501', NULL, 'anon no lee superadmins');
SELECT throws_ok($$ INSERT INTO public.audit_logs(action) VALUES ('falsificado') $$, '42501', NULL, 'anon no falsifica auditoría');
SELECT lives_ok($$ INSERT INTO public.traffic_sessions(id, platform, path) VALUES ('pgtap-' || md5(random()::text), 'web', '/prueba') $$, 'anon inserta telemetría');
SELECT ok((SELECT count(*) FROM public.departments) > 0, 'anon lee departamentos');
SELECT is((SELECT count(*)::int FROM public.destinations WHERE status <> 'published'), 0, 'anon solo ve destinos publicados');
RESET ROLE;

SELECT * FROM finish();
ROLLBACK;
