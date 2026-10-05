-- ============================================================================
-- 🔐 BAQUEANO — DIRECTORIO ADMINISTRATIVO DE USUARIOS (Ops Center, Fase E)
-- ============================================================================
-- 🎯 POR QUÉ: la gestión de usuarios necesita filtrar por rol, estado,
--    proveedor, negocio y verificación, con paginación en la base (nunca
--    descargar todos los usuarios al navegador).
-- ⚙️ CÓMO: vista `admin_user_directory` (security_invoker) que agrega roles,
--    negocios y verificaciones pendientes por perfil; SIN acceso para anon ni
--    authenticated: la consulta solo la Edge Function `baqueano-identity`
--    (service_role) tras comprobar `users.read`. `admin_user_summary()` da los
--    contadores del tablero en una sola consulta.
-- 📦 QUÉ: vista + función de resumen (solo servidor).
-- ============================================================================
create or replace view public.admin_user_directory
with (security_invoker = true) as
select
  p.id, p.email, p.display_name, p.first_name, p.last_name, p.phone, p.avatar_url,
  p.country, p.city, p.provider, p.status, p.profile_verified, p.preferred_language,
  p.created_at, p.updated_at, p.last_seen_at, p.status_reason, p.suspended_until,
  coalesce((
    select array_agg(ur.role_id order by r.rank desc)
    from public.user_roles ur join public.roles r on r.id = ur.role_id
    where ur.user_id = p.id
  ), '{}'::text[]) as roles,
  (select count(*) from public.business_members bm where bm.user_id = p.id and bm.status = 'active')::integer as business_count,
  coalesce((
    select string_agg(b.name, ' · ' order by b.name)
    from public.business_members bm join public.businesses b on b.id = bm.business_id
    where bm.user_id = p.id and bm.status = 'active'
  ), '') as business_names,
  exists (
    select 1 from public.verification_requests v
    where v.applicant_id = p.id and v.status in ('pending', 'under_review', 'needs_information')
  ) as pending_verification
from public.profiles p;

revoke all on public.admin_user_directory from anon, authenticated;

create or replace function public.admin_user_summary()
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'total', count(*),
    'active', count(*) filter (where status = 'active'),
    'new_7d', count(*) filter (where created_at > now() - interval '7 days'),
    'turistas', count(*) filter (where 'turista' = any (roles)),
    'emprendedores', count(*) filter (where 'emprendedor' = any (roles)),
    'guias', count(*) filter (where 'guia' = any (roles)),
    'auditores', count(*) filter (where 'auditor' = any (roles)),
    'admins', count(*) filter (where 'admin' = any (roles) or 'superadmin' = any (roles)),
    'suspended', count(*) filter (where status in ('suspended', 'blocked')),
    'pending_verification', count(*) filter (where pending_verification),
    'with_business', count(*) filter (where business_count > 0),
    'google', count(*) filter (where provider = 'google'),
    'email', count(*) filter (where provider = 'email'),
    'verified', count(*) filter (where profile_verified)
  )
  from public.admin_user_directory;
$$;
revoke execute on function public.admin_user_summary() from public, anon, authenticated;
