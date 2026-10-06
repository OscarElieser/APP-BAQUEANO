-- 🎯 POR QUÉ: auditoría 2026-10-06 (verificador 01 y ANDROID-AUDIT). anon podía leer TODAS las columnas
--   de public.businesses por PostgREST, incluida commission_rate (comisión comercial, en las 30 filas),
--   y los identificadores internos owner_uid, created_by, updated_by y verified_by. Nada público usa
--   esas columnas: la web, la App y BAQUI piden columnas explícitas.
-- ⚙️ CÓMO: el SELECT de tabla para anon pasa a un SELECT por columna, con todas las columnas
--   salvo esas cinco. No se borra ningún dato. No cambian RLS, authenticated ni service_role.
--   Para revertir: grant select on public.businesses to anon;
-- 📦 QUÉ: el catálogo público de negocios sigue legible; los datos comerciales e internos, no.
do $$
declare
  cols text;
begin
  select string_agg(quote_ident(column_name), ', ' order by ordinal_position) into cols
  from information_schema.columns
  where table_schema = 'public' and table_name = 'businesses'
    and column_name not in ('commission_rate', 'owner_uid', 'created_by', 'updated_by', 'verified_by');
  execute 'revoke select on public.businesses from anon';
  execute format('grant select (%s) on public.businesses to anon', cols);
end $$;
