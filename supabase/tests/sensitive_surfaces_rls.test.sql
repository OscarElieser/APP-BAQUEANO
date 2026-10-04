-- ============================================================================
-- 🧭 BAQUEANO — REGRESIÓN DE AUTORIZACIÓN PARA SUPERFICIES SENSIBLES
-- ============================================================================
--
-- 🎯 POR QUÉ (WHY / PROPÓSITO):
-- - Evitar que futuras migraciones restauren accidentalmente acceso público a
--   datos operativos, PII o mutaciones de multimedia oficial.
--
-- ⚙️ CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
-- - pgTAP verifica privilegios efectivos de `anon`/`authenticated` y la ausencia
--   de las políticas permisivas históricas en Storage.
-- - La prueba usa el catálogo real de PostgreSQL y se revierte al finalizar.
--
-- 📦 QUÉ (WHAT / ENTREGABLES):
-- - Dieciséis aserciones reproducibles mediante `supabase test db`.
-- ============================================================================

BEGIN;
SELECT plan(16);

SELECT ok(NOT has_table_privilege('anon', 'public.audit_logs', 'SELECT'), 'anon no lee audit_logs');
SELECT ok(NOT has_table_privilege('anon', 'public.audit_logs', 'INSERT'), 'anon no inserta audit_logs');
SELECT ok(NOT has_table_privilege('authenticated', 'public.audit_logs', 'SELECT'), 'authenticated no lee audit_logs');
SELECT ok(NOT has_table_privilege('authenticated', 'public.audit_logs', 'DELETE'), 'authenticated no elimina audit_logs');

SELECT ok(NOT has_table_privilege('anon', 'public.traffic_sessions', 'SELECT'), 'anon no lee telemetria');
SELECT ok(has_table_privilege('anon', 'public.traffic_sessions', 'INSERT'), 'anon solo inserta telemetria (sin leer ni borrar)');
SELECT ok(NOT has_table_privilege('authenticated', 'public.traffic_sessions', 'SELECT'), 'authenticated no lee telemetria');
SELECT ok(NOT has_table_privilege('authenticated', 'public.traffic_sessions', 'DELETE'), 'authenticated no elimina telemetria');

SELECT ok(NOT has_table_privilege('anon', 'public.backup_operations', 'SELECT'), 'anon no lee operaciones de respaldo');
SELECT ok(NOT has_table_privilege('authenticated', 'public.backup_operations', 'SELECT'), 'authenticated no lee operaciones de respaldo');
SELECT ok(NOT has_table_privilege('anon', 'public.ops_backup_entities', 'DELETE'), 'anon no elimina entidades espejo');
SELECT ok(NOT has_table_privilege('authenticated', 'public.ops_backup_entities', 'UPDATE'), 'authenticated no altera entidades espejo');

SELECT is(
  (SELECT count(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname IN (
    'Inserción autorizada en baqueano-media',
    'Actualización autorizada en baqueano-media',
    'Eliminación autorizada en baqueano-media'
  )),
  0::bigint,
  'no existen políticas públicas de mutación en baqueano-media'
);
SELECT is(
  (SELECT count(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'buckets' AND policyname = 'Creación de buckets'),
  0::bigint,
  'no existe política pública para crear buckets'
);
SELECT ok(has_table_privilege('service_role', 'public.audit_logs', 'SELECT'), 'service_role conserva auditoría');
SELECT ok(has_table_privilege('service_role', 'public.traffic_sessions', 'INSERT'), 'service_role conserva telemetría');

SELECT * FROM finish();
ROLLBACK;

