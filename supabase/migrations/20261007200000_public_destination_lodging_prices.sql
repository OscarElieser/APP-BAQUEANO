-- ============================================================================
-- 🧭 BAQUEANO — TARIFAS VIGENTES DE HOSPEDAJES POR DESTINO (para BAQÜI)
-- ============================================================================
-- 🎯 POR QUÉ: BAQÜI arma presupuestos sin inventar precios. Hasta ahora solo leía precios por
--    destino; las tarifas que publican los negocios (p. ej. Hotel Encanto del Sur, San Juan del Sur)
--    quedaban fuera. El propietario pidió continuar el plan (2026-10-07).
-- ⚙️ CÓMO: función de solo lectura (security definer, search_path fijo) que devuelve, para el nombre
--    de un municipio, las tarifas de negocios publicados con precio activo y vigente HOY en hora de
--    Nicaragua. Comparación sin tildes con translate() (sin depender de la extensión unaccent).
--    Solo expone datos públicos: nombre, WhatsApp, producto, monto, moneda, tipo, vigencia, fuente.
-- 📦 QUÉ: public.public_destination_lodging_prices(p_place text) → filas; EXECUTE para anon/authenticated.
-- ============================================================================
create or replace function public.public_destination_lodging_prices(p_place text)
returns table (
  business_id text, business_name text, whatsapp text, verification_status text,
  product_name text, amount numeric, currency text, price_type text,
  valid_from date, valid_until date, source_name text, checked_at timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with place as (
    select lower(translate(trim(coalesce(p_place, '')), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun')) as k
  ), today as (
    select (now() at time zone 'America/Managua')::date as d
  )
  select b.id, b.name, b.whatsapp, b.verification_status,
         p.product_name, p.amount, p.currency, p.price_type,
         p.valid_from, p.valid_until, p.source_name, p.checked_at
  from public.businesses b
  join public.municipalities m on m.id = b.municipality_id
  join public.prices p on p.entity_type = 'business' and p.entity_id = b.id
  cross join place cross join today
  where length(place.k) >= 3
    and lower(translate(m.name, 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun')) = place.k
    and b.status = 'published' and b.deleted_at is null
    and b.category = 'hospedaje'
    and p.is_active = true and p.amount is not null
    and (p.valid_from is null or p.valid_from <= today.d)
    and (p.valid_until is null or p.valid_until >= today.d)
  order by b.name, p.amount
  limit 40;
$$;

revoke all on function public.public_destination_lodging_prices(text) from public;
grant execute on function public.public_destination_lodging_prices(text) to anon, authenticated;
