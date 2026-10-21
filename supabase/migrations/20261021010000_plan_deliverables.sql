-- ============================================================================
-- 🧭 BAQUEANO — COMPROMISOS DE CADA PLAN (public.plan_deliverables)
-- ============================================================================
-- 🎯 POR QUÉ (propietario, 2026-10-20): «adaptar según el plan seleccionado para cumplir lo que
--   debemos hacer». Hay beneficios que el sistema aplica solo (destacado, orden, promoción,
--   estadísticas, prioridad en BAQUI) y otros que hace el equipo cada mes: publicaciones en
--   redes, Crónica, pauta pagada, informe, verificación, video y armado de la ficha. Sin un
--   registro no hay forma de saber si se cumplió lo que se le vendió a cada negocio.
-- ⚙️ CÓMO:
--   - Cada entrega hecha queda como una fila: pedido, tipo, mes, evidencia (enlace https),
--     nota, quién la hizo y cuándo. No se borra: si se registró por error, se anula con motivo.
--   - Lo que corresponde a cada plan vive en el código (baqueano-plans/duties.ts), porque es
--     la misma tabla que se muestra en planes.html. La base guarda lo hecho, no lo prometido.
--   - Sin acceso directo para anon ni authenticated: lectura y escritura por la Edge Function
--     baqueano-plans (equipo con token verificado; el propietario ve las suyas en «Mi plan»).
-- 📦 QUÉ: tabla plan_deliverables + trigger plan_deliverables_guard.
-- ↩️ ROLLBACK: drop trigger plan_deliverables_guard on public.plan_deliverables;
--   drop function public.plan_deliverables_guard(); (la tabla se conserva: no se borra nada).
-- ============================================================================

begin;

create table if not exists public.plan_deliverables (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.plan_orders(id),
  kind text not null check (kind in (
    'social_welcome', 'social_post', 'social_ad', 'chronicle', 'report_pdf',
    'verification', 'video', 'onboarding')),
  -- Primer día del mes al que corresponde (hora de Nicaragua). Las entregas únicas también
  -- llevan el mes en que se hicieron.
  period_month date not null check (extract(day from period_month) = 1),
  evidence_url text check (evidence_url is null or (evidence_url ~ '^https://[^\s<>"'']+$' and char_length(evidence_url) <= 500)),
  note text check (note is null or char_length(note) <= 500),
  status text not null default 'done' check (status in ('done', 'void')),
  void_reason text check (void_reason is null or char_length(void_reason) between 5 and 500),
  done_by text not null check (char_length(done_by) between 3 and 254),
  done_at timestamptz not null default now(),
  voided_by text,
  voided_at timestamptz,
  created_at timestamptz not null default now(),
  constraint plan_deliverables_void_reason check (status <> 'void' or void_reason is not null)
);
create index if not exists plan_deliverables_order_idx on public.plan_deliverables (order_id, period_month, kind) where status = 'done';
create index if not exists plan_deliverables_month_idx on public.plan_deliverables (period_month, kind);
comment on table public.plan_deliverables is
  'Entregas que el equipo hizo para cada plan (redes, Crónica, pauta, informe, verificación, video, ficha). Solo inserción y anulación con motivo; nunca se borra. Lectura y escritura por baqueano-plans.';

-- Integridad: nada se borra; una fila hecha solo puede pasar a anulada (con motivo) y lo demás
-- no cambia.
create or replace function public.plan_deliverables_guard()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Las entregas de los planes no se borran: se anulan con motivo.';
  end if;
  if tg_op = 'INSERT' then
    new.created_at := now();
    if new.done_at is null or new.done_at > now() + interval '5 minutes' then new.done_at := now(); end if;
    new.status := 'done';
    new.void_reason := null; new.voided_by := null; new.voided_at := null;
    return new;
  end if;
  if old.status = 'void' then
    raise exception 'Esta entrega ya fue anulada.';
  end if;
  if row(new.order_id, new.kind, new.period_month, new.evidence_url, new.note, new.done_by, new.done_at, new.created_at)
     is distinct from row(old.order_id, old.kind, old.period_month, old.evidence_url, old.note, old.done_by, old.done_at, old.created_at)
     or new.status <> 'void' then
    raise exception 'Una entrega registrada solo se puede anular.';
  end if;
  new.voided_at := now();
  return new;
end $$;
drop trigger if exists plan_deliverables_guard on public.plan_deliverables;
create trigger plan_deliverables_guard before insert or update or delete on public.plan_deliverables
  for each row execute function public.plan_deliverables_guard();

alter table public.plan_deliverables enable row level security;
revoke all on public.plan_deliverables from public, anon, authenticated;
revoke all on function public.plan_deliverables_guard() from public, anon, authenticated;

commit;
