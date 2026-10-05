-- ============================================================================
-- 🔐 BAQUEANO — PRIVILEGIOS DE FUNCIONES DE IDENTIDAD (advisors de seguridad)
-- ============================================================================
-- 🎯 POR QUÉ: el linter de Supabase marcó funciones SECURITY DEFINER
--    ejecutables por anon/authenticated vía /rest/v1/rpc.
-- ⚙️ CÓMO:
--    - Funciones de trigger: nadie las invoca por RPC (los triggers siguen
--      funcionando porque los ejecuta el sistema).
--    - has_permission / has_role / is_business_manager: se retiran a anon
--      (las políticas son TO authenticated). Se mantienen para authenticated
--      porque RLS las evalúa con el rol de quien consulta; solo informan los
--      permisos del propio usuario (auth.uid()), no los de terceros.
-- 📦 QUÉ: revokes de EXECUTE.
-- ============================================================================
revoke execute on function public.handle_new_auth_user() from public, anon, authenticated;
revoke execute on function public.handle_auth_user_confirmed() from public, anon, authenticated;
revoke execute on function public.has_permission(text) from public, anon;
revoke execute on function public.has_role(text) from public, anon;
revoke execute on function public.is_business_manager(text) from public, anon;
grant execute on function public.has_permission(text) to authenticated;
grant execute on function public.has_role(text) to authenticated;
grant execute on function public.is_business_manager(text) to authenticated;
