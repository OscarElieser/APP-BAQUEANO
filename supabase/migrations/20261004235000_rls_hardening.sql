-- ============================================================================
-- 🧭 BAQUEANO — ENDURECIMIENTO DE RLS (Hackathon Nicaragua 2026, Sprint 3)
-- ============================================================================
-- 🎯 POR QUÉ:
-- - audit_logs y ops_backup_entities tenían una política `ALL` para `public`
--   con `true`: cualquiera con la clave pública podía leer, modificar o BORRAR
--   la auditoría. traffic_sessions permitía a cualquiera leer y borrar.
-- - 11 tablas tenían RLS sin políticas: el acceso ya era solo de servidor,
--   pero la intención no quedaba documentada ni demostrable.
--
-- ⚙️ CÓMO:
-- - La identidad es Firebase Auth (AGENTS.md): el navegador nunca actúa como
--   rol `authenticated` de Supabase. Toda escritura de datos de usuarios,
--   auditoría y respaldo pasa por Edge Functions con token de Firebase
--   verificado y rol de servicio (que no está sujeto a RLS).
-- - Se eliminan las políticas abiertas y se agrega, en las tablas de uso
--   exclusivo del servidor, una política RESTRICTIVA `false` para anon y
--   authenticated: deniega explícitamente y deja la intención visible.
-- - traffic_sessions conserva solo INSERT anónimo (telemetría).
--
-- 📦 QUÉ: auditoría inmutable desde el cliente, respaldos y datos personales
--   accesibles solo por el servidor; pruebas en supabase/tests/rls_hardening.test.sql.
-- ============================================================================

-- 1. Políticas abiertas: se reasignan solo al rol de servicio (que ya omite RLS),
--    con lo que dejan de aplicar a anon/authenticated. ALTER en lugar de DROP para
--    conservar el historial de nombres y evitar operaciones destructivas.
do $$
declare
  p record;
begin
  for p in
    select * from (values
      ('audit_logs', 'Acceso total a audit_logs'),
      ('ops_backup_entities', 'Compatibilidad Ops Center legado'),
      ('traffic_sessions', 'Permitir lectura de telemetria'),
      ('traffic_sessions', 'Permitir eliminacion administrativa de telemetria'),
      ('backup_operations', 'Lectura de respaldo para administradores autenticados'),
      ('storage_backups', 'Lectura de estado de respaldo para administradores')
    ) as v(tbl, pol)
  loop
    if exists (select 1 from pg_policies where schemaname = 'public' and tablename = p.tbl and policyname = p.pol) then
      execute format('alter policy %I on public.%I to service_role', p.pol, p.tbl);
    end if;
  end loop;
end $$;

-- 2. Denegación explícita para el cliente en tablas de uso exclusivo del servidor
do $$
declare
  t text;
begin
  foreach t in array array[
    'audit_logs', 'ops_backup_entities', 'backup_operations', 'storage_backups',
    'profiles', 'favorites', 'reservations', 'travel_plans', 'ai_sessions', 'ai_messages',
    'verification_requests', 'official_super_admins', 'firestore_mirror',
    'testimonial_reactions', 'testimonial_reports'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
      if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = t and policyname = 'Solo servidor (Edge Functions)') then
        execute format(
          'create policy "Solo servidor (Edge Functions)" on public.%I as restrictive for all to anon, authenticated using (false) with check (false)',
          t
        );
      end if;
    end if;
  end loop;
end $$;

-- 3. Telemetría: el cliente solo inserta
revoke select, update, delete on public.traffic_sessions from anon, authenticated;
