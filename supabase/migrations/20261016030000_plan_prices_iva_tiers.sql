-- ============================================================================
-- 🧭 BAQUEANO — PRECIOS NUEVOS, IVA LISTO Y BENEFICIOS DE CADA PLAN
-- ============================================================================
-- 🎯 POR QUÉ: pedido del propietario (2026-10-15, 19:35): Sendero a US$ 10, subir Mirador y
--   Cumbre (eligió US$ 35 y US$ 90), aplicar el IVA de Nicaragua e implementar en la web todo lo
--   que promete cada plan. IVA: elegido «dejarlo listo, apagado» hasta que BAQUEANO esté inscrito
--   en la DGI como responsable recaudador (no se cobra un impuesto que no se entera).
-- ⚙️ CÓMO:
--   - plan_settings (una fila): iva_enabled (false) e iva_rate (0.15). Se enciende con
--     update public.plan_settings set iva_enabled = true where id = 1;
--   - plan_catalog: precios nuevos (C$ = US$ × 36.6243, al córdoba; anual = 10 meses).
--   - plan_orders: subtotal, IVA y total separados; negocio publicado vinculado (business_id) y
--     promoción de la ficha (Cumbre). El comprobante emitido sigue sin poder cambiar.
--   - public_plan_tiers(): lo único público: qué negocio tiene un plan vigente y cuál. La web lo
--     usa para destacar en Aliados, departamento y portada. Sin datos del cliente.
--   - plan_business_stats(): visitas a la ficha y contactos (WhatsApp, llamada, correo) del mes y
--     del mes anterior, para el panel del propietario (solo por la Edge Function).
-- 📦 QUÉ: tabla plan_settings; columnas nuevas; funciones public_plan_tiers y plan_business_stats.
-- ============================================================================

create table if not exists public.plan_settings (
  id int primary key check (id = 1),
  iva_enabled boolean not null default false,
  iva_rate numeric(5,4) not null default 0.15 check (iva_rate >= 0 and iva_rate < 1),
  updated_at timestamptz not null default now()
);
insert into public.plan_settings (id, iva_enabled, iva_rate) values (1, false, 0.15) on conflict (id) do nothing;
alter table public.plan_settings enable row level security;
drop policy if exists plan_settings_public_read on public.plan_settings;
create policy plan_settings_public_read on public.plan_settings for select to anon, authenticated using (true);
grant select on public.plan_settings to anon, authenticated;

update public.plan_catalog set monthly_usd = 10, annual_usd = 100, monthly_nio = 366, annual_nio = 3662, updated_at = now() where code = 'sendero';
update public.plan_catalog set monthly_usd = 35, annual_usd = 350, monthly_nio = 1282, annual_nio = 12819, updated_at = now() where code = 'mirador';
update public.plan_catalog set monthly_usd = 90, annual_usd = 900, monthly_nio = 3296, annual_nio = 32962, updated_at = now() where code = 'cumbre';

alter table public.plan_orders
  add column if not exists subtotal_usd numeric(10,2),
  add column if not exists subtotal_nio numeric(12,2),
  add column if not exists iva_rate numeric(5,4) not null default 0,
  add column if not exists iva_usd numeric(10,2) not null default 0,
  add column if not exists iva_nio numeric(12,2) not null default 0,
  add column if not exists business_id text,
  add column if not exists promo_text text check (promo_text is null or char_length(promo_text) <= 160),
  add column if not exists promo_until date;
update public.plan_orders set subtotal_usd = amount_usd, subtotal_nio = amount_nio where subtotal_usd is null;
create index if not exists plan_orders_business_idx on public.plan_orders (business_id) where business_id is not null;

-- El guardián del comprobante también protege subtotal e IVA.
create or replace function public.plan_orders_guard()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Los pedidos de plan no se borran: se cancelan.';
  end if;
  if old.receipt_number is not null and (
       new.receipt_number is distinct from old.receipt_number
    or new.receipt_issued_at is distinct from old.receipt_issued_at
    or new.amount_usd is distinct from old.amount_usd
    or new.amount_nio is distinct from old.amount_nio
    or new.subtotal_usd is distinct from old.subtotal_usd
    or new.subtotal_nio is distinct from old.subtotal_nio
    or new.iva_rate is distinct from old.iva_rate
    or new.iva_usd is distinct from old.iva_usd
    or new.iva_nio is distinct from old.iva_nio
    or new.legal_name is distinct from old.legal_name
    or new.id_number is distinct from old.id_number
    or new.billing_address is distinct from old.billing_address
    or new.plan_code is distinct from old.plan_code
    or new.billing_period is distinct from old.billing_period) then
    raise exception 'El comprobante % ya fue emitido y no se modifica.', old.receipt_number;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

-- Negocios con plan vigente (el plan más alto si hay varios). Público y sin datos personales.
create or replace function public.public_plan_tiers()
returns table (business_id text, plan_code text, promo_text text)
language sql
stable
security definer
set search_path = public
as $$
  select distinct on (o.business_id)
    o.business_id,
    o.plan_code,
    case when o.plan_code = 'cumbre' and (o.promo_until is null or o.promo_until >= (now() at time zone 'America/Managua')::date)
         then o.promo_text end
  from public.plan_orders o
  join public.businesses b on b.id = o.business_id and b.is_published and b.deleted_at is null
  where o.status = 'paid' and o.business_id is not null
    and o.period_end >= (now() at time zone 'America/Managua')::date
  order by o.business_id, case o.plan_code when 'cumbre' then 1 when 'mirador' then 2 else 3 end, o.period_end desc;
$$;
revoke all on function public.public_plan_tiers() from public;
grant execute on function public.public_plan_tiers() to anon, authenticated;

-- Visitas a la ficha y contactos del mes en curso y del anterior (hora de Nicaragua).
create or replace function public.plan_business_stats(p_business_id text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with bounds as (
    select date_trunc('month', now() at time zone 'America/Managua') as m0,
           date_trunc('month', now() at time zone 'America/Managua') - interval '1 month' as m1
  ),
  views as (
    select (e.occurred_at at time zone 'America/Managua') as at from public.analytics_events e
    where e.event_name = 'business_viewed' and e.entity_type = 'business' and e.entity_id = p_business_id
      and e.occurred_at >= (select m1 from bounds) at time zone 'America/Managua'
  ),
  contacts as (
    select (c.occurred_at at time zone 'America/Managua') as at, c.action_type from public.commercial_actions c
    where c.business_id = p_business_id
      and c.occurred_at >= (select m1 from bounds) at time zone 'America/Managua'
  )
  select jsonb_build_object(
    'month', to_char((select m0 from bounds), 'YYYY-MM'),
    'views', (select count(*) from views where at >= (select m0 from bounds)),
    'views_prev', (select count(*) from views where at < (select m0 from bounds)),
    'whatsapp', (select count(*) from contacts where at >= (select m0 from bounds) and action_type = 'whatsapp'),
    'calls', (select count(*) from contacts where at >= (select m0 from bounds) and action_type = 'call'),
    'messages', (select count(*) from contacts where at >= (select m0 from bounds) and action_type in ('contact', 'message')),
    'contacts_prev', (select count(*) from contacts where at < (select m0 from bounds))
  );
$$;
revoke all on function public.plan_business_stats(text) from public, anon, authenticated;
grant execute on function public.plan_business_stats(text) to service_role;
