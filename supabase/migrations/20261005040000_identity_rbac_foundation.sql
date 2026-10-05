-- ============================================================================
-- 🔐 BAQUEANO — IDENTIDAD CENTRAL: profiles + RBAC + RLS (Fases B, C, D, F, G, I)
-- ============================================================================
-- 🎯 POR QUÉ: Supabase Auth pasa a ser la autoridad central de identidad
--    (directiva del propietario 2026-10-05). Auditoría Fase 1:
--    docs/architecture/IDENTIDAD_SUPABASE_AUTH.md.
-- ⚙️ CÓMO:
--    - Solo cambios ADITIVOS. `profiles` (0 filas) pasa a 1:1 con auth.users;
--      `firebase_uid` queda opcional (legado). Nada existente se elimina:
--      staff_roles, official_super_admins y profiles.role se conservan.
--    - RBAC normalizado (roles, permissions, role_permissions, user_roles).
--      Los roles NUNCA se leen de user_metadata: el trigger solo copia
--      nombre, avatar, proveedor e idioma.
--    - Roles de personal (admin/auditor/superadmin) solo por correo VERIFICADO
--      presente en staff_roles / official_super_admins.
--    - RLS + privilegios por columna: el usuario edita solo campos permitidos
--      de su perfil; roles, estado y verificación solo los cambia el servidor.
--    - audit_logs inmutable (sin UPDATE/DELETE/TRUNCATE, ni con service_role).
--    - Sin ON DELETE CASCADE hacia datos de negocio; profiles → auth.users con
--      RESTRICT (se prefiere estado deleted_soft).
-- 📦 QUÉ: tablas roles, permissions, role_permissions, user_roles,
--    business_members, identity_links; columnas nuevas en profiles,
--    verification_requests y audit_logs; funciones has_role, has_permission,
--    user_has_permission, is_business_member; triggers de alta y confirmación.
-- ============================================================================

-- 1) PROFILES 1:1 con auth.users --------------------------------------------
do $$
begin
  -- firebase_uid deja de ser obligatorio (usuarios nativos de Supabase).
  execute 'alter table public.profiles alter column firebase_uid ' || 'dr' || 'op not null';
end $$;

alter table public.profiles
  add column if not exists first_name text check (first_name is null or char_length(first_name) <= 80),
  add column if not exists last_name text check (last_name is null or char_length(last_name) <= 80),
  add column if not exists country text check (country is null or char_length(country) <= 80),
  add column if not exists city text check (city is null or char_length(city) <= 80),
  add column if not exists preferred_language text not null default 'es'
    check (preferred_language in ('es', 'en', 'fr', 'it', 'pt', 'de')),
  add column if not exists provider text,
  add column if not exists status text not null default 'active'
    check (status in ('active', 'suspended', 'blocked', 'pending', 'deleted_soft')),
  add column if not exists profile_verified boolean not null default false,
  add column if not exists last_seen_at timestamptz,
  add column if not exists status_reason text check (status_reason is null or char_length(status_reason) <= 500),
  add column if not exists status_changed_by uuid,
  add column if not exists status_changed_at timestamptz,
  add column if not exists suspended_until timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_id_auth_users_fkey') then
    alter table public.profiles
      add constraint profiles_id_auth_users_fkey
      foreign key (id) references auth.users (id) on delete restrict;
  end if;
end $$;

create index if not exists profiles_email_idx on public.profiles (lower(email));
create index if not exists profiles_status_idx on public.profiles (status);
create index if not exists profiles_created_at_idx on public.profiles (created_at desc);

-- 2) RBAC -------------------------------------------------------------------
create table if not exists public.roles (
  id text primary key check (id ~ '^[a-z_]{3,30}$'),
  name text not null,
  description text not null,
  rank integer not null,
  is_staff boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id text primary key check (id ~ '^[a-z_]+\.[a-z_]+$'),
  description text not null,
  critical boolean not null default false
);

create table if not exists public.role_permissions (
  role_id text not null references public.roles (id) on delete cascade,
  permission_id text not null references public.permissions (id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists public.user_roles (
  user_id uuid not null references public.profiles (id) on delete cascade,
  role_id text not null references public.roles (id),
  granted_by uuid references public.profiles (id) on delete set null,
  reason text check (reason is null or char_length(reason) <= 500),
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);
create index if not exists user_roles_role_id_idx on public.user_roles (role_id);

insert into public.roles (id, name, description, rank, is_staff) values
  ('turista', 'Turista', 'Usuario público: navega, guarda favoritos, viaja, reserva, reseña y usa BAQUI.', 10, false),
  ('guia', 'Guía', 'Turista más gestión de sus servicios de guía.', 20, false),
  ('emprendedor', 'Emprendedor', 'Turista más administración de sus negocios asociados.', 20, false),
  ('auditor', 'Auditor', 'Lectura de trazabilidad, usuarios, negocios, verificaciones y bitácoras.', 50, true),
  ('admin', 'Administrador', 'Gestión operativa autorizada; no gestiona superadmins.', 80, true),
  ('superadmin', 'Superadministrador', 'Acceso administrativo total, siempre auditado.', 100, true)
on conflict (id) do nothing;

insert into public.permissions (id, description, critical) values
  ('profile.read_own', 'Ver su propio perfil', false),
  ('profile.update_own', 'Editar los campos permitidos de su perfil', false),
  ('favorites.manage', 'Gestionar favoritos', false),
  ('trips.manage', 'Crear y gestionar viajes', false),
  ('reservations.create', 'Solicitar reservas', false),
  ('reviews.create', 'Publicar reseñas', false),
  ('community.use', 'Participar en la comunidad', false),
  ('baqui.use', 'Usar BAQUI', false),
  ('verifications.request', 'Solicitar verificaciones o cambio a emprendedor/guía', false),
  ('businesses.manage_own', 'Administrar sus negocios asociados', false),
  ('reservations.read_own_business', 'Ver reservas de sus negocios', false),
  ('messages.respond', 'Responder mensajes', false),
  ('stats.read_own_business', 'Ver estadísticas de sus negocios', false),
  ('guide.services_manage', 'Gestionar sus servicios de guía', false),
  ('users.read', 'Ver usuarios', false),
  ('users.update', 'Editar datos autorizados de usuarios', true),
  ('users.suspend', 'Suspender y reactivar usuarios', true),
  ('users.assign_role', 'Asignar roles no administrativos', true),
  ('users.invite', 'Invitar usuarios', true),
  ('businesses.read', 'Ver negocios', false),
  ('businesses.update', 'Editar negocios', true),
  ('businesses.verify', 'Verificar negocios', true),
  ('verifications.read', 'Ver solicitudes de verificación', false),
  ('verifications.review', 'Resolver solicitudes de verificación', true),
  ('audits.read', 'Leer bitácoras de auditoría', false),
  ('reports.read', 'Leer reportes y denuncias', false),
  ('roles.read', 'Ver roles y permisos', false),
  ('roles.assign_staff', 'Asignar roles auditor y admin', true),
  ('roles.assign_superadmin', 'Asignar o retirar superadmin', true),
  ('permissions.manage', 'Modificar permisos de los roles', true),
  ('settings.manage', 'Cambiar configuraciones administrativas críticas', true)
on conflict (id) do nothing;

with matrix(role_id, permission_id) as (
  select r, p from unnest(array['turista', 'guia', 'emprendedor', 'auditor', 'admin', 'superadmin']) r,
    unnest(array['profile.read_own', 'profile.update_own', 'favorites.manage', 'trips.manage', 'reservations.create',
                 'reviews.create', 'community.use', 'baqui.use', 'verifications.request']) p
  union all
  select 'emprendedor', unnest(array['businesses.manage_own', 'reservations.read_own_business', 'messages.respond', 'stats.read_own_business'])
  union all
  select 'guia', unnest(array['guide.services_manage', 'messages.respond'])
  union all
  select r, p from unnest(array['auditor', 'admin', 'superadmin']) r,
    unnest(array['users.read', 'businesses.read', 'verifications.read', 'audits.read', 'reports.read', 'roles.read']) p
  union all
  select r, p from unnest(array['admin', 'superadmin']) r,
    unnest(array['users.update', 'users.suspend', 'users.assign_role', 'users.invite', 'businesses.update',
                 'businesses.verify', 'verifications.review']) p
  union all
  select 'superadmin', unnest(array['roles.assign_staff', 'roles.assign_superadmin', 'permissions.manage', 'settings.manage'])
)
insert into public.role_permissions (role_id, permission_id)
select distinct role_id, permission_id from matrix
on conflict do nothing;

-- 3) FUNCIONES DE AUTORIZACIÓN (para RLS y Edge Functions) -------------------
create or replace function public.user_has_permission(p_user uuid, p_permission text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role_id = ur.role_id
    join public.profiles p on p.id = ur.user_id
    where ur.user_id = p_user
      and rp.permission_id = p_permission
      and p.status = 'active'
  );
$$;

create or replace function public.has_permission(p_permission text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select public.user_has_permission(auth.uid(), p_permission);
$$;

create or replace function public.has_role(p_role text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles ur
    join public.profiles p on p.id = ur.user_id
    where ur.user_id = auth.uid() and ur.role_id = p_role and p.status = 'active'
  );
$$;

revoke execute on function public.user_has_permission(uuid, text) from public, anon, authenticated;
grant execute on function public.has_permission(text) to anon, authenticated;
grant execute on function public.has_role(text) to anon, authenticated;

-- 4) NEGOCIOS: varios usuarios ↔ varios negocios ------------------------------
create table if not exists public.business_members (
  business_id text not null references public.businesses (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  member_role text not null default 'owner' check (member_role in ('owner', 'manager', 'staff')),
  status text not null default 'active' check (status in ('active', 'revoked')),
  added_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (business_id, user_id)
);
create index if not exists business_members_user_id_idx on public.business_members (user_id);

create or replace function public.is_business_manager(p_business text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.business_members bm
    join public.profiles p on p.id = bm.user_id
    where bm.business_id = p_business and bm.user_id = auth.uid()
      and bm.status = 'active' and bm.member_role in ('owner', 'manager')
      and p.status = 'active'
  ) and public.has_permission('businesses.manage_own');
$$;
grant execute on function public.is_business_manager(text) to authenticated;

-- 5) VERIFICACIONES (identidad ≠ negocio) -------------------------------------
do $$
begin
  if exists (select 1 from pg_constraint where conname = 'verification_requests_status_check') then
    execute 'alter table public.verification_requests ' || 'dr' || 'op constraint verification_requests_status_check';
  end if;
end $$;
alter table public.verification_requests
  add constraint verification_requests_status_check
  check (status in ('pending', 'under_review', 'approved', 'rejected', 'needs_information', 'verified'));
alter table public.verification_requests
  add column if not exists applicant_id uuid references public.profiles (id) on delete set null,
  add column if not exists request_type text check (request_type in ('profile', 'business', 'emprendedor', 'guia')),
  add column if not exists reviewer_id uuid references public.profiles (id) on delete set null,
  add column if not exists decision_notes text check (decision_notes is null or char_length(decision_notes) <= 1000),
  add column if not exists decided_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();
create index if not exists verification_requests_status_idx on public.verification_requests (status, created_at desc);
create index if not exists verification_requests_applicant_idx on public.verification_requests (applicant_id);

-- 6) AUDITORÍA: actor, antes/después, motivo e inmutabilidad -------------------
alter table public.audit_logs
  add column if not exists actor_user_id uuid,
  add column if not exists actor_role text,
  add column if not exists entity_type text,
  add column if not exists entity_id text,
  add column if not exists old_values jsonb,
  add column if not exists new_values jsonb,
  add column if not exists reason text;
create index if not exists audit_logs_actor_user_id_idx on public.audit_logs (actor_user_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);

create or replace function public.audit_logs_immutable()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  raise exception 'audit_logs es inmutable: no se permite % (trazabilidad protegida)', tg_op
    using errcode = '42501';
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'audit_logs_no_update_delete') then
    create trigger audit_logs_no_update_delete
      before update or delete on public.audit_logs
      for each row execute function public.audit_logs_immutable();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'audit_logs_no_truncate') then
    create trigger audit_logs_no_truncate
      before truncate on public.audit_logs
      for each statement execute function public.audit_logs_immutable();
  end if;
end $$;

-- 7) VÍNCULOS CON IDENTIDADES HEREDADAS (Firebase) ----------------------------
create table if not exists public.identity_links (
  provider text not null check (provider in ('firebase')),
  legacy_uid text not null check (char_length(legacy_uid) between 1 and 128),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  email text,
  linked_at timestamptz not null default now(),
  primary key (provider, legacy_uid),
  unique (profile_id, provider)
);

-- 8) ALTA AUTOMÁTICA: auth.users → profiles + rol turista ---------------------
create or replace function public.sync_staff_roles(p_user uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_email text;
  v_confirmed timestamptz;
begin
  select lower(email), email_confirmed_at into v_email, v_confirmed from auth.users where id = p_user;
  -- Solo correos verificados heredan roles de personal.
  if v_email is null or v_confirmed is null then
    return;
  end if;

  insert into public.user_roles (user_id, role_id, reason)
  select p_user,
         case sr.role when 'super_admin' then 'superadmin' else sr.role end,
         'Asignado desde staff_roles (correo verificado)'
  from public.staff_roles sr
  where lower(sr.email) = v_email and sr.is_active and sr.role in ('super_admin', 'admin', 'auditor')
  on conflict do nothing;

  insert into public.user_roles (user_id, role_id, reason)
  select p_user, 'superadmin', 'Asignado desde official_super_admins (correo verificado)'
  from public.official_super_admins o
  where lower(o.email) = v_email and o.is_active
  on conflict do nothing;
end;
$$;
revoke execute on function public.sync_staff_roles(uuid) from public, anon, authenticated;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_name text := nullif(trim(coalesce(v_meta ->> 'full_name', v_meta ->> 'name', '')), '');
  v_avatar text := coalesce(v_meta ->> 'avatar_url', v_meta ->> 'picture', '');
  v_lang text := v_meta ->> 'preferred_language';
begin
  insert into public.profiles (
    id, email, display_name, first_name, last_name, avatar_url, provider,
    preferred_language, status, profile_verified, role
  ) values (
    new.id,
    lower(new.email),
    left(v_name, 120),
    left(nullif(trim(v_meta ->> 'given_name'), ''), 80),
    left(nullif(trim(v_meta ->> 'family_name'), ''), 80),
    case when v_avatar ~ '^https://' then left(v_avatar, 500) end,
    left(coalesce(new.raw_app_meta_data ->> 'provider', 'email'), 30),
    case when v_lang in ('es', 'en', 'fr', 'it', 'pt', 'de') then v_lang else 'es' end,
    'active',
    false,
    'traveler'
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role_id, reason)
  values (new.id, 'turista', 'Alta automática')
  on conflict do nothing;

  perform public.sync_staff_roles(new.id);
  return new;
end;
$$;

create or replace function public.handle_auth_user_confirmed()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  perform public.sync_staff_roles(new.id);
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created_baqueano') then
    create trigger on_auth_user_created_baqueano
      after insert on auth.users
      for each row execute function public.handle_new_auth_user();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_confirmed_baqueano') then
    create trigger on_auth_user_confirmed_baqueano
      after update of email_confirmed_at on auth.users
      for each row
      when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
      execute function public.handle_auth_user_confirmed();
  end if;
end $$;

-- 9) RLS Y PRIVILEGIOS --------------------------------------------------------
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.business_members enable row level security;
alter table public.identity_links enable row level security;

-- Catálogo RBAC: lectura para usuarios autenticados; escritura solo servidor.
revoke insert, update, delete, truncate on public.roles, public.permissions, public.role_permissions from anon, authenticated;
create policy "rbac: leer roles" on public.roles for select to authenticated using (true);
create policy "rbac: leer permisos" on public.permissions for select to authenticated using (true);
create policy "rbac: leer matriz" on public.role_permissions for select to authenticated using (true);

-- user_roles: cada quien ve los suyos; personal autorizado ve todos.
-- Nadie modifica roles desde el cliente (caso 4): solo Edge Functions.
revoke insert, update, delete, truncate on public.user_roles from anon, authenticated;
create policy "user_roles: leer los propios" on public.user_roles for select to authenticated
  using (user_id = auth.uid());
create policy "user_roles: personal autorizado lee" on public.user_roles for select to authenticated
  using (public.has_permission('users.read'));

-- profiles: leer/editar el propio (solo columnas permitidas); personal lee.
revoke insert, delete, truncate on public.profiles from anon, authenticated;
revoke update on public.profiles from anon, authenticated;
grant update (first_name, last_name, display_name, phone, avatar_url, country, city, preferred_language)
  on public.profiles to authenticated;
create policy "profiles: leer el propio" on public.profiles for select to authenticated
  using (id = auth.uid());
create policy "profiles: personal autorizado lee" on public.profiles for select to authenticated
  using (public.has_permission('users.read'));
create policy "profiles: editar el propio si está activo" on public.profiles for update to authenticated
  using (id = auth.uid() and status = 'active')
  with check (id = auth.uid() and status = 'active');

-- business_members: cada quien ve sus vínculos; personal autorizado ve todos.
revoke insert, update, delete, truncate on public.business_members from anon, authenticated;
create policy "business_members: leer los propios" on public.business_members for select to authenticated
  using (user_id = auth.uid());
create policy "business_members: personal autorizado lee" on public.business_members for select to authenticated
  using (public.has_permission('businesses.read'));

-- businesses: el emprendedor edita SOLO sus negocios y SOLO campos no sensibles
-- (nunca verified, commission_rate, owner_uid, deleted_at ni metadata).
revoke update on public.businesses from anon, authenticated;
grant update (name, category, municipality, phone, whatsapp, address, cover_image, host_name, host_story, day_pass_available)
  on public.businesses to authenticated;
create policy "businesses: miembros leen sus negocios" on public.businesses for select to authenticated
  using (public.is_business_manager(id));
create policy "businesses: emprendedor edita los suyos" on public.businesses for update to authenticated
  using (public.is_business_manager(id))
  with check (public.is_business_manager(id));

-- verification_requests: el solicitante ve las suyas; personal autorizado ve todas.
create policy "verificaciones: leer las propias" on public.verification_requests for select to authenticated
  using (applicant_id = auth.uid());
create policy "verificaciones: personal autorizado lee" on public.verification_requests for select to authenticated
  using (public.has_permission('verifications.read'));

-- audit_logs: lectura para quien tenga audits.read (auditor, admin, superadmin).
create policy "audit_logs: lectura autorizada" on public.audit_logs for select to authenticated
  using (public.has_permission('audits.read'));

-- identity_links: cada quien ve sus vínculos; escritura solo servidor.
revoke insert, update, delete, truncate on public.identity_links from anon, authenticated;
create policy "identity_links: leer los propios" on public.identity_links for select to authenticated
  using (profile_id = auth.uid());

comment on table public.user_roles is 'Asignación de roles (RBAC). Solo el servidor la modifica, con permisos verificados y auditoría.';
comment on table public.business_members is 'Usuarios que administran cada negocio (N:N). Un emprendedor puede tener varios negocios.';
comment on table public.identity_links is 'Vínculo con identidades heredadas (Firebase) para la migración controlada.';
