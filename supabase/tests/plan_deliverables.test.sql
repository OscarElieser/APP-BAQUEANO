-- ============================================================================
-- 🧭 BAQUEANO — PRUEBAS DE COMPROMISOS DE LOS PLANES (public.plan_deliverables)
-- ============================================================================
-- 🎯 POR QUÉ: demostrar que (1) el público no lee ni escribe la tabla, (2) una entrega no se
--    borra ni se reescribe, solo se anula con motivo, (3) la evidencia debe ser https.
-- ⚙️ CÓMO: SQL plano con bloques DO; todo en una transacción que se REVIERTE al final.
-- 📦 QUÉ: `psql -f supabase/tests/plan_deliverables.test.sql`. Imprime «plan_deliverables: 9/9 OK».
-- ============================================================================
begin;

create temporary table _t (n serial, name text);
create or replace function pg_temp.ok(p_name text) returns void language sql as $$ insert into _t (name) values (p_name) $$;
grant all on _t to anon, authenticated;
grant usage on sequence _t_n_seq to anon, authenticated;

insert into public.plan_orders (id, code, plan_code, billing_period, amount_usd, amount_nio, exchange_rate, client_type, legal_name,
  id_type, id_number, contact_name, email, phone, billing_address, business_name, business_category, department, business_description, status)
values ('00000000-0000-4000-8000-0000000000aa', 'PL-PRUEBA-1', 'mirador', 'monthly', 35, 1282, 36.6243, 'persona', 'Prueba Plan',
  'cedula', '0010101010000X', 'Prueba', 'prueba@example.org', '+50588888888', 'Calle de prueba', 'Local de prueba', 'restaurante', 'León',
  'Local de prueba para las pruebas automáticas', 'paid');

-- 1-2) El público no toca la tabla.
set local role anon;
do $$ begin perform count(*) from public.plan_deliverables; raise exception 'FALLA 1';
exception when insufficient_privilege then perform pg_temp.ok('anon no lee'); end $$;
reset role;
set local role authenticated;
do $$ begin insert into public.plan_deliverables (order_id, kind, period_month, done_by) values ('00000000-0000-4000-8000-0000000000aa', 'chronicle', '2026-10-01', 'x@x.ni');
  raise exception 'FALLA 2'; exception when insufficient_privilege then perform pg_temp.ok('authenticated no inserta'); end $$;
reset role;

-- Como la Edge Function (service_role).
insert into public.plan_deliverables (id, order_id, kind, period_month, evidence_url, done_by)
values ('00000000-0000-4000-8000-0000000000d1', '00000000-0000-4000-8000-0000000000aa', 'social_post', '2026-10-01', 'https://instagram.com/p/prueba', 'equipo@baqueano.ni');

-- 3) Fecha controlada por la base y estado inicial «done» aunque se mande otra cosa.
do $$ declare r record; begin
  insert into public.plan_deliverables (order_id, kind, period_month, done_by, status, done_at)
    values ('00000000-0000-4000-8000-0000000000aa', 'chronicle', '2026-10-01', 'equipo@baqueano.ni', 'void', now() + interval '10 days') returning * into r;
  if r.status <> 'done' or r.done_at > now() + interval '1 minute' then raise exception 'FALLA 3: % %', r.status, r.done_at; end if;
  perform pg_temp.ok('estado y fecha controlados');
end $$;

-- 4) No se borra.
do $$ begin delete from public.plan_deliverables where id = '00000000-0000-4000-8000-0000000000d1'; raise exception 'FALLA 4';
exception when raise_exception then if sqlerrm like 'FALLA%' then raise; end if; perform pg_temp.ok('no se borra'); end $$;

-- 5) No se reescribe (evidencia, mes, tipo).
do $$ begin update public.plan_deliverables set evidence_url = 'https://otro.ni' where id = '00000000-0000-4000-8000-0000000000d1'; raise exception 'FALLA 5';
exception when raise_exception then if sqlerrm like 'FALLA%' then raise; end if; perform pg_temp.ok('no se reescribe'); end $$;

-- 6) Anular exige motivo.
do $$ begin update public.plan_deliverables set status = 'void' where id = '00000000-0000-4000-8000-0000000000d1'; raise exception 'FALLA 6';
exception when check_violation then perform pg_temp.ok('anular exige motivo'); end $$;

-- 7) Anular con motivo funciona y deja la fecha.
do $$ declare r record; begin
  update public.plan_deliverables set status = 'void', void_reason = 'Cargada en el negocio equivocado', voided_by = 'equipo@baqueano.ni'
    where id = '00000000-0000-4000-8000-0000000000d1' returning * into r;
  if r.voided_at is null then raise exception 'FALLA 7'; end if;
  perform pg_temp.ok('anulación con motivo');
end $$;

-- 8) Una anulada no vuelve atrás.
do $$ begin update public.plan_deliverables set status = 'done', void_reason = null where id = '00000000-0000-4000-8000-0000000000d1'; raise exception 'FALLA 8';
exception when raise_exception then if sqlerrm like 'FALLA%' then raise; end if; perform pg_temp.ok('anulada es definitiva'); end $$;

-- 9) Evidencia solo https y mes al día 1.
do $$ begin
  begin insert into public.plan_deliverables (order_id, kind, period_month, evidence_url, done_by) values ('00000000-0000-4000-8000-0000000000aa', 'video', '2026-10-01', 'javascript:alert(1)', 'e@e.ni');
    raise exception 'FALLA 9a'; exception when check_violation then null; end;
  begin insert into public.plan_deliverables (order_id, kind, period_month, done_by) values ('00000000-0000-4000-8000-0000000000aa', 'video', '2026-10-15', 'e@e.ni');
    raise exception 'FALLA 9b'; exception when check_violation then null; end;
  perform pg_temp.ok('evidencia https y mes válido');
end $$;

select 'plan_deliverables: ' || count(*) || '/9 OK' as resultado from _t;
rollback;
