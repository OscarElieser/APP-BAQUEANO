-- ============================================================================
-- 🔐 BAQUEANO — PRUEBAS DE SEGURIDAD DE IDENTIDAD (RBAC + RLS) — SIN PERSISTENCIA
-- ============================================================================
-- 🎯 POR QUÉ: demostrar en la base real que los roles, permisos y políticas
--    funcionan (casos 1–10 de la directiva del propietario).
-- ⚙️ CÓMO: un solo bloque DO crea usuarios de prueba en auth.users, simula
--    sesiones (`set local role authenticated` + `request.jwt.claims`) e intenta
--    cada operación. Al final lanza una excepción con el informe: Postgres
--    revierte TODO (usuarios, roles, cambios). No queda ningún dato de prueba.
-- 📦 QUÉ: informe "OK/FALLA" por caso en el mensaje de la excepción final.
--    Ejecutar con: Supabase SQL / MCP execute_sql (rol postgres).
-- ============================================================================
do $$
declare
  v_google uuid := gen_random_uuid();
  v_email uuid := gen_random_uuid();
  v_owner uuid := gen_random_uuid();
  v_admin uuid := gen_random_uuid();
  v_auditor uuid := gen_random_uuid();
  v_super uuid := gen_random_uuid();
  v_report text := '';
  v_ok boolean;
  v_count integer;
begin
  -- Usuario de personal (solo dentro de esta transacción).
  insert into public.staff_roles (email, role, is_active, note) values
    ('prueba-admin@baqueano.test', 'admin', true, 'prueba revertida'),
    ('prueba-auditor@baqueano.test', 'auditor', true, 'prueba revertida'),
    ('prueba-super@baqueano.test', 'super_admin', true, 'prueba revertida');

  insert into auth.users (id, aud, role, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values
    (v_google, 'authenticated', 'authenticated', 'Viajera.Google@baqueano.test', now(),
      '{"provider":"google","providers":["google"]}', '{"full_name":"Viajera Google","avatar_url":"https://lh3.googleusercontent.com/a/x","role":"superadmin"}', now(), now()),
    (v_email, 'authenticated', 'authenticated', 'viajero.email@baqueano.test', null,
      '{"provider":"email","providers":["email"]}', '{"name":"Viajero Email"}', now(), now()),
    (v_owner, 'authenticated', 'authenticated', 'emprendedora@baqueano.test', now(), '{"provider":"email"}', '{}', now(), now()),
    (v_admin, 'authenticated', 'authenticated', 'prueba-admin@baqueano.test', now(), '{"provider":"google"}', '{}', now(), now()),
    (v_auditor, 'authenticated', 'authenticated', 'prueba-auditor@baqueano.test', now(), '{"provider":"google"}', '{}', now(), now()),
    (v_super, 'authenticated', 'authenticated', 'prueba-super@baqueano.test', now(), '{"provider":"google"}', '{}', now(), now());

  -- CASO 1: Google → perfil + turista (y user_metadata "role":"superadmin" IGNORADO).
  select count(*) = 1 into v_ok from public.profiles where id = v_google and provider = 'google' and status = 'active'
    and display_name = 'Viajera Google' and email = 'viajera.google@baqueano.test';
  v_ok := v_ok and exists (select 1 from public.user_roles where user_id = v_google and role_id = 'turista')
    and not exists (select 1 from public.user_roles where user_id = v_google and role_id <> 'turista');
  v_report := v_report || format(E'\nCASO 1 Google → turista (metadata ignorada): %s', case when v_ok then 'OK' else 'FALLA' end);

  -- CASO 2: email/contraseña → perfil + turista.
  select exists (select 1 from public.profiles where id = v_email and provider = 'email')
     and exists (select 1 from public.user_roles where user_id = v_email and role_id = 'turista') into v_ok;
  v_report := v_report || format(E'\nCASO 2 Email → turista: %s', case when v_ok then 'OK' else 'FALLA' end);

  -- Personal por correo verificado.
  select exists (select 1 from public.user_roles where user_id = v_admin and role_id = 'admin')
     and exists (select 1 from public.user_roles where user_id = v_auditor and role_id = 'auditor')
     and exists (select 1 from public.user_roles where user_id = v_super and role_id = 'superadmin') into v_ok;
  v_report := v_report || format(E'\nPersonal desde staff_roles con correo verificado: %s', case when v_ok then 'OK' else 'FALLA' end);

  -- Emprendedor con un negocio propio (asignación de servidor).
  insert into public.user_roles (user_id, role_id, reason) values (v_owner, 'emprendedor', 'prueba');
  insert into public.business_members (business_id, user_id, member_role) values ('biz-coop-somoto', v_owner, 'owner');

  -- CASO 3: turista no tiene acceso administrativo (sin users.read; no ve a otros ni auditoría).
  perform set_config('request.jwt.claims', json_build_object('sub', v_google, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  select count(*) into v_count from public.profiles;
  v_ok := v_count = 1 and not public.has_permission('users.read') and not public.has_permission('audits.read');
  select count(*) into v_count from public.audit_logs;
  v_ok := v_ok and v_count = 0;
  execute 'reset role';
  v_report := v_report || format(E'\nCASO 3 Turista sin acceso administrativo: %s', case when v_ok then 'OK' else 'FALLA' end);

  -- CASO 4: turista intenta darse un rol / cambiar su estado vía API.
  perform set_config('request.jwt.claims', json_build_object('sub', v_google, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  begin
    insert into public.user_roles (user_id, role_id) values (v_google, 'admin');
    v_ok := false;
  exception when insufficient_privilege then v_ok := true;
  end;
  begin
    update public.profiles set status = 'active', profile_verified = true where id = v_google;
    v_ok := false;
  exception when insufficient_privilege then v_ok := v_ok and true;
  end;
  update public.profiles set city = 'León' where id = v_google;
  get diagnostics v_count = row_count;
  v_ok := v_ok and v_count = 1;
  execute 'reset role';
  v_report := v_report || format(E'\nCASO 4 Turista no puede asignarse roles ni verificarse (sí editar su ciudad): %s', case when v_ok then 'OK' else 'FALLA' end);

  -- CASO 5 y 6: emprendedor edita negocio ajeno (0 filas) y propio (1 fila); nunca "verified".
  perform set_config('request.jwt.claims', json_build_object('sub', v_owner, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  update public.businesses set host_story = 'Intento ajeno' where id = 'biz-red-ometepe';
  get diagnostics v_count = row_count;
  v_report := v_report || format(E'\nCASO 5 Emprendedor edita negocio ajeno → denegado: %s', case when v_count = 0 then 'OK' else 'FALLA' end);
  update public.businesses set host_story = 'Historia propia' where id = 'biz-coop-somoto';
  get diagnostics v_count = row_count;
  v_ok := v_count = 1;
  begin
    update public.businesses set verified = true where id = 'biz-coop-somoto';
    v_ok := false;
  exception when insufficient_privilege then null;
  end;
  execute 'reset role';
  v_report := v_report || format(E'\nCASO 6 Emprendedor edita negocio propio (sin tocar "verified"): %s', case when v_ok then 'OK' else 'FALLA' end);

  -- CASO 7: admin no tiene permiso para gestionar superadmin ni escribir user_roles directo.
  perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_ok := public.has_permission('users.assign_role') and not public.has_permission('roles.assign_superadmin')
    and not public.has_permission('roles.assign_staff');
  begin
    insert into public.user_roles (user_id, role_id) values (v_admin, 'superadmin');
    v_ok := false;
  exception when insufficient_privilege then null;
  end;
  execute 'reset role';
  v_report := v_report || format(E'\nCASO 7 Admin no puede crear superadmin: %s', case when v_ok then 'OK' else 'FALLA' end);

  -- CASO 8: auditor lee auditoría pero no puede borrarla; ni el servidor puede.
  insert into public.audit_logs (admin_email, action, module, actor_user_id, actor_role, entity_type, entity_id, reason)
  values ('sistema', 'prueba', 'identidad', v_super, 'superadmin', 'profile', v_google::text, 'prueba revertida');
  perform set_config('request.jwt.claims', json_build_object('sub', v_auditor, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  select count(*) into v_count from public.audit_logs where module = 'identidad';
  v_ok := v_count >= 1;
  begin
    delete from public.audit_logs where module = 'identidad';
    get diagnostics v_count = row_count;
    v_ok := v_ok and v_count = 0;
  exception when insufficient_privilege then null;
  end;
  execute 'reset role';
  begin
    delete from public.audit_logs where module = 'identidad';
    v_ok := false;
  exception when insufficient_privilege then null;
  end;
  v_report := v_report || format(E'\nCASO 8 Auditor no borra audit_logs (inmutable incluso para el servidor): %s', case when v_ok then 'OK' else 'FALLA' end);

  -- CASO 9: superadmin tiene el permiso de asignar roles críticos (la Edge Function lo ejecuta y audita).
  perform set_config('request.jwt.claims', json_build_object('sub', v_super, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_ok := public.has_permission('roles.assign_superadmin') and public.has_permission('roles.assign_staff');
  execute 'reset role';
  v_report := v_report || format(E'\nCASO 9 Superadmin puede asignar roles (vía servidor + auditoría): %s', case when v_ok then 'OK' else 'FALLA' end);

  -- CASO 10: usuario suspendido pierde permisos y no puede editar su perfil.
  update public.profiles set status = 'suspended', status_reason = 'prueba' where id = v_owner;
  perform set_config('request.jwt.claims', json_build_object('sub', v_owner, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_ok := not public.has_permission('businesses.manage_own') and not public.has_permission('reservations.create');
  update public.profiles set city = 'Somoto' where id = v_owner;
  get diagnostics v_count = row_count;
  v_ok := v_ok and v_count = 0;
  update public.businesses set host_story = 'Suspendida' where id = 'biz-coop-somoto';
  get diagnostics v_count = row_count;
  v_ok := v_ok and v_count = 0;
  execute 'reset role';
  v_report := v_report || format(E'\nCASO 10 Usuario suspendido sin operaciones restringidas: %s', case when v_ok then 'OK' else 'FALLA' end);

  raise exception 'INFORME DE PRUEBAS (todo revertido):%', v_report;
end $$;
