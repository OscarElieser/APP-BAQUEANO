-- ============================================================================
-- 🔐 BAQUEANO — PRIVILEGIOS DE IDENTIDAD (complemento de 20261005040000)
-- ============================================================================
-- 🎯 POR QUÉ: la prueba de seguridad mostró que `authenticated` no tenía
--    SELECT sobre profiles ni audit_logs (revocado en el endurecimiento del
--    2026-10-04), por lo que las políticas de "leer el propio" y de lectura
--    del auditor no podían funcionar. Además, verification_requests y
--    businesses conservaban INSERT/UPDATE/DELETE/TRUNCATE para anon y
--    authenticated (bloqueados solo por RLS).
-- ⚙️ CÓMO: SELECT a authenticated (las filas visibles las decide RLS);
--    revocar escrituras directas que deben pasar por Edge Functions
--    (defensa en profundidad). No cambia datos.
-- 📦 QUÉ: grants/revokes sobre profiles, audit_logs, verification_requests y
--    businesses.
-- ============================================================================
grant select on public.profiles to authenticated;
grant select on public.audit_logs to authenticated;
revoke insert, update, delete, truncate on public.verification_requests from anon, authenticated;
revoke insert, delete, truncate on public.businesses from anon, authenticated;
