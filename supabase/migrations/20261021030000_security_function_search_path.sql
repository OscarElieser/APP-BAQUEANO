-- ============================================================================
-- 🛡️ BAQUEANO — BLINDAJE: search_path fijo en plan_html_escape (21-10-2026)
-- ============================================================================
-- 🎯 POR QUÉ: el asesor de seguridad de Supabase marca `public.plan_html_escape` con
--   «role mutable search_path». Es la única función de public sin ruta fija: quien
--   pudiera crear objetos en otro esquema del search_path podría suplantar `replace`.
-- ⚙️ CÓMO: solo usa funciones de pg_catalog (replace, coalesce), que siempre se
--   resuelven primero; con search_path vacío el comportamiento es idéntico.
-- 📦 QUÉ: ALTER FUNCTION … SET search_path = ''. Idempotente; no toca datos.
-- ↩️ ROLLBACK: alter function public.plan_html_escape(text) reset search_path;
-- ============================================================================
do $$
begin
  if to_regprocedure('public.plan_html_escape(text)') is not null then
    alter function public.plan_html_escape(text) set search_path = '';
  end if;
end $$;
