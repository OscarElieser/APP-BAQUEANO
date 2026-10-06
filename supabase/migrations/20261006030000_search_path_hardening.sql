-- ============================================================================
-- 🧭 BAQUEANO — search_path fijo en funciones geoespaciales (auditoría 2026-10-06)
-- ============================================================================
-- 🎯 POR QUÉ: Supabase Advisors (lint 0011 function_search_path_mutable) marcó
--   sync_point_geometry, get_nearby_destinations y get_nearby_businesses. Sin un
--   search_path fijo, quien pueda crear objetos en un esquema anterior del path podría
--   suplantar funciones (por ejemplo, ST_*). La auditoría de seguridad del 2026-10-06
--   las clasifica como hardening de prioridad baja.
-- ⚙️ CÓMO: ALTER FUNCTION … SET search_path = public, extensions (ahí vive PostGIS).
--   No cambia firmas, permisos ni resultados. No borra nada.
-- 📦 QUÉ: 3 ALTER FUNCTION.
-- ↩️ ROLLBACK: alter function <f>(<args>) reset search_path;
-- ============================================================================
alter function public.sync_point_geometry() set search_path = public, extensions;
alter function public.get_nearby_destinations(double precision, double precision, double precision, text) set search_path = public, extensions;
alter function public.get_nearby_businesses(double precision, double precision, double precision, text) set search_path = public, extensions;
