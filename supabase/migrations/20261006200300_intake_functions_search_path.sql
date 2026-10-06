-- 🎯 POR QUÉ: el linter de seguridad de Supabase (2026-10-06) marcó 3 funciones del buzón con
--   search_path mutable (WARN 0011).
-- ⚙️ CÓMO: se fija el search_path sin cambiar el cuerpo de las funciones (triggers de no-borrado,
--   inmutabilidad y updated_at).
-- 📦 QUÉ: ALTER FUNCTION ... SET search_path.
alter function public.intake_no_delete() set search_path = pg_catalog, public;
alter function public.intake_events_immutable() set search_path = pg_catalog, public;
alter function public.intake_touch() set search_path = pg_catalog, public;
