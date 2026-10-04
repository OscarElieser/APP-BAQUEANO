-- ============================================================================
-- 🧭 BAQUEANO — PRUEBAS RLS DEL CRUD EFÍMERO
-- ============================================================================
-- 🎯 POR QUÉ: impedir que la evidencia técnica abra acceso cruzado entre pruebas.
-- ⚙️ CÓMO: pgTAP inspecciona RLS, privilegios y las cuatro políticas requeridas.
-- 📦 QUÉ: ocho aserciones transaccionales para `supabase test db`.
-- ============================================================================

BEGIN;
SELECT plan(8);
SELECT has_table('public', 'sprint_evidence_records', 'existe tabla de evidencia');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid = 'public.sprint_evidence_records'::regclass), 'RLS esta habilitado');
SELECT ok(has_table_privilege('anon', 'public.sprint_evidence_records', 'SELECT'), 'anon puede leer con RLS');
SELECT ok(has_table_privilege('anon', 'public.sprint_evidence_records', 'INSERT'), 'anon puede insertar con RLS');
SELECT ok(has_table_privilege('anon', 'public.sprint_evidence_records', 'UPDATE'), 'anon puede actualizar con RLS');
SELECT ok(has_table_privilege('anon', 'public.sprint_evidence_records', 'DELETE'), 'anon puede eliminar con RLS');
SELECT is((SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'sprint_evidence_records'), 4::bigint, 'existen cuatro politicas');
SELECT ok(has_table_privilege('service_role', 'public.sprint_evidence_records', 'SELECT,INSERT,UPDATE,DELETE'), 'backend conserva CRUD');
SELECT * FROM finish();
ROLLBACK;

