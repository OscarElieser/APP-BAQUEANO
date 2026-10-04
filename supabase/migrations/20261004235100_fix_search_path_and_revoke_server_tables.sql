-- ============================================================================
-- 🧭 BAQUEANO — search_path fijo y tablas solo de servidor (Sprint 3)
-- 🎯 POR QUÉ: el asesor de Supabase marcaba sync_geography_point con
--    search_path mutable, y anon/authenticated conservaban privilegios de tabla
--    sobre auditoría y respaldos (RLS los frenaba, pero no había defensa en
--    profundidad).
-- ⚙️ CÓMO: search_path = public, extensions (PostGIS vive en extensions);
--    se retiran todos los privilegios de cliente en las tablas de servidor.
-- 📦 QUÉ: 0 advertencias de search_path; auditoría y respaldos inaccesibles
--    desde el navegador aunque se cambiara una política por error.
-- ============================================================================
alter function public.sync_geography_point() set search_path = public, extensions;
revoke all on public.audit_logs, public.backup_operations, public.ops_backup_entities, public.storage_backups from anon, authenticated;
