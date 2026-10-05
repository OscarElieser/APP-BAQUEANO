-- ============================================================================
-- 🔐 BAQUEANO — AJUSTE DE POLÍTICAS RESTRICTIVAS "Solo servidor" (identidad)
-- ============================================================================
-- 🎯 POR QUÉ: en profiles, audit_logs y verification_requests existía una
--    política RESTRICTIVA `false` para anon/authenticated. Las políticas
--    restrictivas se combinan con AND, así que anulaban las nuevas políticas
--    permisivas ("leer el propio", "auditor lee"). Detectado por la prueba
--    supabase/tests/identity_rbac_cases.sql (casos 3, 4 y 8).
-- ⚙️ CÓMO: sin eliminar políticas, se reescriben con ALTER POLICY:
--    - profiles: exige sesión (auth.uid()); filas y columnas las limitan las
--      políticas permisivas y los privilegios por columna.
--    - audit_logs y verification_requests: exige sesión para leer; ninguna
--      escritura desde el cliente (WITH CHECK false).
--    anon sigue sin acceso (no tiene auth.uid()).
-- 📦 QUÉ: 3 políticas renombradas y redefinidas.
-- ============================================================================
alter policy "Solo servidor (Edge Functions)" on public.profiles
  using (auth.uid() is not null) with check (auth.uid() is not null);
alter policy "Solo servidor (Edge Functions)" on public.profiles
  rename to "Solo usuarios con sesión (filas según políticas propias)";

alter policy "Solo servidor (Edge Functions)" on public.audit_logs
  using (auth.uid() is not null) with check (false);
alter policy "Solo servidor (Edge Functions)" on public.audit_logs
  rename to "Solo lectura con sesión; escritura solo servidor";

alter policy "Solo servidor (Edge Functions)" on public.verification_requests
  using (auth.uid() is not null) with check (false);
alter policy "Solo servidor (Edge Functions)" on public.verification_requests
  rename to "Solo lectura con sesión; escritura solo servidor";
