-- ============================================================================
-- BAQUEANO — BORRADOR NO DESPLEGABLE: IDENTIDAD MULTIPROVEEDOR
-- ============================================================================
-- 🎯 POR QUÉ: permitir que una persona solo-Firebase tenga un perfil BAQUEANO
-- sin exigir una fila previa en auth.users ni crear duplicados al adoptar Auth.
-- ⚙️ CÓMO: desacopla la PK del perfil, agrega el vínculo nullable con Supabase
-- Auth y amplía identity_links. Requiere migración formal y pruebas RLS.
-- 📦 QUÉ: propuesta revisable; NO ejecutar en producción tal como está.
-- ============================================================================

begin;

alter table public.profiles
  drop constraint if exists profiles_id_auth_users_fkey;

alter table public.profiles
  add column if not exists supabase_user_id uuid;

update public.profiles p
set supabase_user_id = p.id
where p.supabase_user_id is null
  and exists (select 1 from auth.users u where u.id = p.id);

alter table public.profiles
  add constraint profiles_supabase_user_id_fkey
  foreign key (supabase_user_id) references auth.users(id) on delete set null;

create unique index if not exists profiles_supabase_user_id_uidx
  on public.profiles (supabase_user_id)
  where supabase_user_id is not null;

create unique index if not exists profiles_verified_email_uidx
  on public.profiles (lower(email))
  where email is not null and status <> 'deleted_soft';

alter table public.identity_links
  drop constraint if exists identity_links_provider_check;

alter table public.identity_links
  add constraint identity_links_provider_check
  check (provider in ('firebase', 'supabase', 'google', 'email'));

alter table public.identity_links
  add column if not exists email_verified boolean not null default false,
  add column if not exists last_login_at timestamptz;

comment on column public.identity_links.legacy_uid is
  'Identificador del usuario en el proveedor; nombre heredado, equivale a provider_user_id.';

-- Pendiente antes de convertir este borrador en migración:
-- 1. Reemplazar handle_new_auth_user para resolver correo verificado y crear
--    identity_links(provider='supabase') dentro de la misma transacción.
-- 2. Crear current_profile_id() y migrar todas las políticas que comparan
--    directamente auth.uid() con profiles.id o claves user_id.
-- 3. Adaptar sync_staff_roles(), baqueano-identity y pruebas RLS.
-- 4. Probar concurrencia de Firebase/Supabase con el mismo correo.

rollback;
