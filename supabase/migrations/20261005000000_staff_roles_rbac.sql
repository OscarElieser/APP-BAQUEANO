-- ============================================================================
-- 🧭 BAQUEANO — ROLES DEL EQUIPO (RBAC) EN EL SERVIDOR
-- ============================================================================
-- 🎯 POR QUÉ:
-- - El Hackathon exige 3+ roles demostrables. Firebase Auth sigue siendo la
--   identidad (AGENTS.md); el ROL se decide en el servidor, nunca en el
--   navegador.
-- - Asignar un Auditor no debe requerir cambiar código ni desplegar el sitio.
--
-- ⚙️ CÓMO:
-- - public.staff_roles: correo normalizado → super_admin | admin | auditor.
-- - Solo la lee la Edge Function baqueano-community (rol de servicio) tras
--   verificar el token de Firebase y que el correo esté VERIFICADO.
-- - RLS activo, sin privilegios para anon/authenticated y política
--   restrictiva explícita: el cliente no puede leerla ni escalarse.
--
-- 📦 QUÉ: matriz de permisos en docs/security/ROLES_Y_PERMISOS.md.
--   Explorador (usuario) → publica/comenta; Auditor → Ops Center solo lectura;
--   Admin → modera y edita; Superadmin → todo + gestión de roles.
-- ============================================================================

create table if not exists public.staff_roles (
  email text primary key check (email = lower(btrim(email)) and position('@' in email) > 1),
  role text not null check (role in ('super_admin', 'admin', 'auditor')),
  is_active boolean not null default true,
  granted_by text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.staff_roles is 'RBAC del equipo BAQUEANO. Solo la lee el servidor (Edge Functions) tras verificar el token de Firebase.';

alter table public.staff_roles enable row level security;
revoke all on public.staff_roles from anon, authenticated;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'staff_roles' and policyname = 'Solo servidor (Edge Functions)') then
    create policy "Solo servidor (Edge Functions)" on public.staff_roles
      as restrictive for all to anon, authenticated using (false) with check (false);
  end if;
end $$;

insert into public.staff_roles (email, role, granted_by, note) values
  ('oscarelieser.informatica.inatec@gmail.com', 'super_admin', 'propietario', 'Matriz oficial 2026-10-03'),
  ('byoscarelieser@gmail.com', 'admin', 'propietario', 'Matriz oficial 2026-10-03'),
  ('vigoronmixt@gmail.com', 'admin', 'propietario', 'Matriz oficial 2026-10-03')
on conflict (email) do nothing;
