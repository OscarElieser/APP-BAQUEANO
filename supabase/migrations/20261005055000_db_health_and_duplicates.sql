-- ============================================================================
-- 🧭 BAQUEANO — SALUD DE LA BASE DE DATOS Y SUGERENCIA DE DUPLICADOS
-- ============================================================================
-- 🎯 POR QUÉ: la base debe auditarse sola. Hay que detectar FKs y RLS faltantes,
--   registros huérfanos, coordenadas inválidas, contenido publicado sin fuente,
--   negocios sin territorio, perfiles sin usuario de Auth y posibles duplicados,
--   sin depender de revisiones manuales.
-- ⚙️ CÓMO:
--   - `db_health_report()` → JSON con métricas de estructura (tablas, FK, RLS,
--     índices) y de calidad de datos. SECURITY DEFINER, solo service_role o
--     personal con `analytics.read`. Solo lectura.
--   - `v_possible_duplicate_businesses` / `v_possible_duplicate_destinations`:
--     sugerencias por nombre normalizado + territorio. NUNCA fusionan nada: la
--     decisión es humana (Ops Center).
-- 📦 QUÉ: reporte "DB HEALTH" reproducible (CI/Ops/documentación).
-- ============================================================================

create or replace function public.normalize_name(p text)
returns text language sql immutable set search_path = '' as $$
  select btrim(regexp_replace(lower(translate(coalesce(p, ''),
    'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN')), '[^a-z0-9]+', ' ', 'g'))
$$;
revoke all on function public.normalize_name(text) from public, anon, authenticated;
grant execute on function public.normalize_name(text) to service_role;

create or replace view public.v_possible_duplicate_businesses
with (security_invoker = true) as
select a.id as business_id, b.id as possible_duplicate_id, a.name, b.name as duplicate_name,
       coalesce(a.department_id, a.department) as territory,
       case when a.phone is not null and a.phone = b.phone then 'mismo_nombre_y_telefono' else 'mismo_nombre_y_territorio' end as reason
from public.businesses a
join public.businesses b
  on a.id < b.id
 and public.normalize_name(a.name) = public.normalize_name(b.name)
 and coalesce(a.department_id, a.department, '') = coalesce(b.department_id, b.department, '')
where a.deleted_at is null and b.deleted_at is null;

create or replace view public.v_possible_duplicate_destinations
with (security_invoker = true) as
select a.id as destination_id, b.id as possible_duplicate_id, a.name, b.name as duplicate_name, a.department_id
from public.destinations a
join public.destinations b
  on a.id < b.id
 and public.normalize_name(a.name) = public.normalize_name(b.name)
 and coalesce(a.department_id, '') = coalesce(b.department_id, '')
where a.deleted_at is null and b.deleted_at is null;

-- Teléfonos compartidos entre negocios distintos (señal de dato dudoso).
create or replace view public.v_shared_business_phones
with (security_invoker = true) as
select phone, count(*) as businesses, array_agg(id order by id) as business_ids
from public.businesses
where deleted_at is null and phone is not null
group by phone
having count(*) > 1;

revoke all on public.v_possible_duplicate_businesses, public.v_possible_duplicate_destinations, public.v_shared_business_phones from anon, authenticated;
grant select on public.v_possible_duplicate_businesses, public.v_possible_duplicate_destinations, public.v_shared_business_phones to service_role;

create or replace function public.db_health_report()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_role text := coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', '');
  v_cultural text[] := array['culture','heritage','museums','gastronomy','music','crafts','festivals','legends','historical_figures','communities','events'];
  v_published_no_source bigint := 0;
  v_count bigint;
  t text;
begin
  if v_role <> 'service_role' and current_user not in ('postgres', 'service_role')
     and not public.has_permission('analytics.read') then
    raise exception 'sin permiso analytics.read' using errcode = '42501';
  end if;

  foreach t in array v_cultural || array['destinations', 'experiences', 'routes'] loop
    execute format('select count(*) from public.%I where status = ''published'' and source_name is null', t) into v_count;
    v_published_no_source := v_published_no_source + v_count;
  end loop;

  return jsonb_build_object(
    'generated_at', now(),
    'structure', jsonb_build_object(
      'tables', (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r'),
      'views', (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'v'),
      'foreign_keys', (select count(*) from pg_constraint where connamespace = 'public'::regnamespace and contype = 'f'),
      'indexes', (select count(*) from pg_indexes where schemaname = 'public'),
      'rls_enabled', (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity),
      'tables_without_rls', coalesce((select jsonb_agg(c.relname order by c.relname) from pg_class c join pg_namespace n on n.oid = c.relnamespace
                                      where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity), '[]'::jsonb),
      'rls_without_policies', coalesce((select jsonb_agg(c.relname order by c.relname) from pg_class c join pg_namespace n on n.oid = c.relnamespace
                                        where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity
                                          and not exists (select 1 from pg_policy p where p.polrelid = c.oid)), '[]'::jsonb),
      'security_definer_without_search_path', coalesce((select jsonb_agg(p.proname) from pg_proc p
                                        where p.pronamespace = 'public'::regnamespace and p.prosecdef
                                          and not exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%')), '[]'::jsonb)),
    'data_quality', jsonb_build_object(
      'profiles_without_auth_user', (select count(*) from public.profiles p where not exists (select 1 from auth.users u where u.id = p.id)),
      'businesses_without_department', (select count(*) from public.businesses where deleted_at is null and department_id is null),
      'businesses_without_municipality', (select count(*) from public.businesses where deleted_at is null and municipality_id is null),
      'businesses_without_coordinates', (select count(*) from public.businesses where deleted_at is null and latitude is null),
      'businesses_published_without_source', (select count(*) from public.businesses where deleted_at is null and status = 'published' and source_name is null),
      'content_published_without_source', v_published_no_source,
      'destinations_without_status', (select count(*) from public.destinations where status is null),
      'destinations_invalid_coordinates', (select count(*) from public.destinations
                                           where latitude is not null and not (latitude between 10.5 and 15.2 and longitude between -88.0 and -82.5)),
      'emergencies_unverified', (select count(*) from public.emergencies where not coalesce(verified, false)),
      'municipalities_without_coordinates', (select count(*) from public.municipalities where latitude is null),
      'favorites_orphan_destinations', (select count(*) from public.favorites f where f.entity_type = 'destination'
                                         and not exists (select 1 from public.destinations d where d.id = f.entity_id)),
      'route_stops_orphan_destinations', (select count(*) from public.route_stops s where s.entity_type = 'destination'
                                           and not exists (select 1 from public.destinations d where d.id = s.entity_id)),
      'possible_duplicate_businesses', (select count(*) from public.v_possible_duplicate_businesses),
      'possible_duplicate_destinations', (select count(*) from public.v_possible_duplicate_destinations),
      'shared_business_phones', (select count(*) from public.v_shared_business_phones)),
    'operations', jsonb_build_object(
      'pending_verifications', (select count(*) from public.verification_requests where status in ('pending', 'under_review', 'needs_information')),
      'open_sos', (select count(*) from public.sos_events where status in ('open', 'acknowledged')),
      'pending_reservations', (select count(*) from public.reservations where status = 'pending' and deleted_at is null),
      'pending_knowledge_candidates', (select count(*) from public.knowledge_candidates where status = 'pending'),
      'audit_log_entries', (select count(*) from public.audit_logs)));
end;
$$;
revoke all on function public.db_health_report() from public, anon;
grant execute on function public.db_health_report() to authenticated, service_role;
comment on function public.db_health_report is 'Reporte DB HEALTH (estructura + calidad de datos + operación). Solo lectura. Requiere analytics.read o service_role.';
