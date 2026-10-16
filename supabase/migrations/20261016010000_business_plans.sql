-- ============================================================================
-- 🧭 BAQUEANO — PLANES PARA NEGOCIOS, PEDIDOS Y COMPROBANTES DE PAGO
-- ============================================================================
-- 🎯 POR QUÉ: pedido del propietario (2026-10-15): «necesito tres planes… en córdobas y en
--   dólares… cuando compren se tiene que contactar por WhatsApp para los métodos de pago…
--   le salga la factura… y además generarle un usuario y contraseña». Precios: US$ 8, 20 y
--   50 mensuales, también anuales. BAQUEANO todavía no tiene numeración autorizada por la
--   DGI: se emite un «comprobante de pago» numerado (no fiscal) hasta que exista.
-- ⚙️ CÓMO:
--   - plan_catalog: los 3 planes con precio mensual y anual en US$ y C$ (cambio del proyecto).
--   - plan_orders: cada pedido con los datos de facturación del cliente. Nadie lo lee ni lo
--     escribe directo: solo la Edge Function baqueano-plans con la clave de servicio.
--   - plan_receipt_issue(): asigna el número de comprobante correlativo sin saltos
--     (contador con bloqueo de fila, nunca una secuencia) y fija el período pagado.
--   - Nada se borra: un trigger impide DELETE en pedidos y el número emitido no cambia.
-- 📦 QUÉ: tablas plan_catalog, plan_orders, plan_receipt_counters; funciones
--   plan_receipt_issue(uuid, text, text, timestamptz, text) y plan_orders_guard().
-- ============================================================================

create table if not exists public.plan_catalog (
  code text primary key check (code ~ '^[a-z]{3,20}$'),
  sort_order int not null default 0,
  monthly_usd numeric(10,2) not null check (monthly_usd > 0),
  annual_usd numeric(10,2) not null check (annual_usd > 0),
  monthly_nio numeric(12,2) not null check (monthly_nio > 0),
  annual_nio numeric(12,2) not null check (annual_nio > 0),
  exchange_rate numeric(10,4) not null default 36.6243,
  photo_limit int,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- C$ = US$ × 36.6243 (cambio de referencia del proyecto, AGENTS.md regla 11), redondeado al
-- córdoba. Anual = 10 meses (2 meses de regalo).
insert into public.plan_catalog (code, sort_order, monthly_usd, annual_usd, monthly_nio, annual_nio, photo_limit) values
  ('sendero', 1,  8.00,  80.00,   293.00,  2930.00, 6),
  ('mirador', 2, 20.00, 200.00,   732.00,  7325.00, 20),
  ('cumbre',  3, 50.00, 500.00,  1831.00, 18312.00, null)
on conflict (code) do nothing;

create table if not exists public.plan_receipt_counters (
  series text primary key,
  last_number int not null default 0
);
insert into public.plan_receipt_counters (series, last_number) values ('BQ', 0) on conflict (series) do nothing;

create table if not exists public.plan_orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  plan_code text not null references public.plan_catalog(code),
  billing_period text not null check (billing_period in ('monthly', 'annual')),
  amount_usd numeric(10,2) not null,
  amount_nio numeric(12,2) not null,
  exchange_rate numeric(10,4) not null,
  -- Datos del cliente para el comprobante
  client_type text not null check (client_type in ('persona', 'empresa')),
  legal_name text not null check (char_length(legal_name) between 2 and 160),
  id_type text not null check (id_type in ('cedula', 'ruc', 'pasaporte', 'residencia')),
  id_number text not null check (char_length(id_number) between 4 and 30),
  contact_name text not null check (char_length(contact_name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 254),
  phone text not null check (char_length(phone) between 7 and 40),
  billing_address text not null check (char_length(billing_address) between 5 and 300),
  -- Datos del local que se va a publicar
  business_name text not null check (char_length(business_name) between 2 and 160),
  business_category text not null,
  department text not null check (char_length(department) between 2 and 80),
  municipality text check (municipality is null or char_length(municipality) <= 80),
  business_description text not null check (char_length(business_description) between 20 and 300),
  notes text check (notes is null or char_length(notes) <= 1000),
  language text not null default 'es',
  -- Proceso
  status text not null default 'pending' check (status in ('pending', 'contacted', 'paid', 'cancelled')),
  payment_method text check (payment_method is null or payment_method in ('transferencia', 'deposito', 'efectivo', 'billetera', 'otro')),
  payment_reference text check (payment_reference is null or char_length(payment_reference) <= 120),
  paid_at timestamptz,
  period_start date,
  period_end date,
  receipt_number text unique,
  receipt_issued_at timestamptz,
  receipt_issued_by text,
  owner_uid text,
  owner_email text,
  account_created_at timestamptz,
  must_change_password boolean not null default false,
  business_application_code text,
  staff_notes text check (staff_notes is null or char_length(staff_notes) <= 2000),
  idempotency_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists plan_orders_status_idx on public.plan_orders (status, created_at desc);
create index if not exists plan_orders_owner_idx on public.plan_orders (owner_uid);
create index if not exists plan_orders_email_idx on public.plan_orders (lower(email));

-- Sin borrados; el comprobante emitido (número, fecha, montos, datos del cliente) no se reescribe.
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

drop trigger if exists plan_orders_guard on public.plan_orders;
create trigger plan_orders_guard before update or delete on public.plan_orders
  for each row execute function public.plan_orders_guard();

-- Emite el comprobante: número correlativo BQ-000001… con bloqueo de fila (sin saltos).
create or replace function public.plan_receipt_issue(
  p_order uuid, p_method text, p_reference text, p_paid_at timestamptz, p_issued_by text)
returns public.plan_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.plan_orders;
  v_next int;
  v_start date;
begin
  select * into v_order from public.plan_orders where id = p_order for update;
  if not found then raise exception 'Pedido inexistente.'; end if;
  if v_order.receipt_number is not null then return v_order; end if;
  if v_order.status = 'cancelled' then raise exception 'El pedido está cancelado.'; end if;

  update public.plan_receipt_counters set last_number = last_number + 1 where series = 'BQ'
    returning last_number into v_next;
  v_start := (coalesce(p_paid_at, now()) at time zone 'America/Managua')::date;

  update public.plan_orders set
    status = 'paid',
    payment_method = p_method,
    payment_reference = nullif(trim(coalesce(p_reference, '')), ''),
    paid_at = coalesce(p_paid_at, now()),
    period_start = v_start,
    period_end = (v_start + case when v_order.billing_period = 'annual' then interval '1 year' else interval '1 month' end - interval '1 day')::date,
    receipt_number = 'BQ-' || lpad(v_next::text, 6, '0'),
    receipt_issued_at = now(),
    receipt_issued_by = p_issued_by
  where id = p_order
  returning * into v_order;
  return v_order;
end;
$$;

-- Código del pedido (lo que el cliente menciona por WhatsApp): PL-2026-000001.
create or replace function public.plan_order_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_year text := to_char(now() at time zone 'America/Managua', 'YYYY');
  v_next int;
begin
  insert into public.plan_receipt_counters (series, last_number) values ('PL-' || v_year, 1)
  on conflict (series) do update set last_number = public.plan_receipt_counters.last_number + 1
  returning last_number into v_next;
  return 'PL-' || v_year || '-' || lpad(v_next::text, 6, '0');
end;
$$;
revoke all on function public.plan_order_code() from public, anon, authenticated;
grant execute on function public.plan_order_code() to service_role;

alter table public.plan_catalog enable row level security;
alter table public.plan_orders enable row level security;
alter table public.plan_receipt_counters enable row level security;

-- El catálogo (precios) es público; pedidos y contador solo por la Edge Function.
drop policy if exists plan_catalog_public_read on public.plan_catalog;
create policy plan_catalog_public_read on public.plan_catalog for select to anon, authenticated using (is_active);

revoke all on public.plan_orders, public.plan_receipt_counters from anon, authenticated;
revoke all on function public.plan_receipt_issue(uuid, text, text, timestamptz, text) from public, anon, authenticated;
grant execute on function public.plan_receipt_issue(uuid, text, text, timestamptz, text) to service_role;
grant select on public.plan_catalog to anon, authenticated;
