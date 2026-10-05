-- ============================================================================
-- 🧭 BAQUEANO — APLICACIÓN DE MIGRACIONES PENDIENTES DEL REPO + REFUERZO
-- ============================================================================
-- 🎯 POR QUÉ: la auditoría (G-2) encontró que `20261001090000_content_translations`
--   y `20261001120000_baqui_responsible_memory` existían en el repo pero nunca se
--   aplicaron en producción (deriva repo ↔ BD).
-- ⚙️ CÓMO: se aplicaron en producción con su mismo contenido (sin el DROP POLICY
--   de una política inexistente) el 2026-10-05; este archivo agrega, de forma
--   idempotente, lo que faltaba para cumplir el estándar actual:
--   - Política RESTRICTIVA "Solo servidor" en las 4 tablas de memoria de BAQUI
--     (RLS sin políticas = cierre implícito; ahora es explícito y auditable).
--   - Trigger común `set_updated_at()` en tablas con `updated_at`.
-- 📦 QUÉ: `content_translations` (i18n de contenido editorial, equivalente a
--   entity_translations) y memoria responsable de BAQUI operativas.
-- ============================================================================
do $$
declare t text;
begin
  foreach t in array array['baqui_trip_memory','knowledge_candidates','baqui_feedback','baqui_knowledge_gaps'] loop
    if to_regclass('public.' || t) is not null and not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = t and policyname = 'Solo servidor (Edge Functions)') then
      execute format('create policy "Solo servidor (Edge Functions)" on public.%I as restrictive for all to anon, authenticated using (false) with check (false)', t);
    end if;
  end loop;
end $$;

create or replace trigger trg_content_translations_updated_at before update on public.content_translations
  for each row execute function public.set_updated_at();
create or replace trigger trg_baqui_trip_memory_updated_at before update on public.baqui_trip_memory
  for each row execute function public.set_updated_at();
