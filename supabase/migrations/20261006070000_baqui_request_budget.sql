-- 🎯 POR QUÉ: auditoría de seguridad 2026-10-06 (baqueano-ai:anonymous-unmetered-gemini-and-persistent-writes).
--   BAQUI es pública y sin límite. Cualquiera podía gastar la cuota de Gemini del proyecto y
--   llenar travel_plans y ai_messages, que alimentan KPIs públicos.
-- ⚙️ CÓMO: contador por ventana fija en la base (no en memoria, porque cada instancia de Edge
--   Function es efímera). La función identifica a quien llama con un hash SHA-256 de la IP,
--   nunca con la IP en claro. Solo service_role puede ejecutar baqui_consume_budget; anon y
--   authenticated no tienen acceso a la tabla ni a la función.
-- 📦 QUÉ: tabla ai_request_budget + baqui_consume_budget(clave, límite, ventana_segundos) → boolean.
create table if not exists public.ai_request_budget (
  bucket text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (bucket, window_start)
);
comment on table public.ai_request_budget is 'Contadores de presupuesto de BAQUI por ventana. bucket = global o ip:<sha256>; sin IP en claro.';
alter table public.ai_request_budget enable row level security;
revoke all on public.ai_request_budget from public, anon, authenticated;

create or replace function public.baqui_consume_budget(p_bucket text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  w timestamptz;
  n integer;
begin
  if p_bucket is null or length(p_bucket) > 100 or p_limit < 1 or p_window_seconds < 60 then
    return false;
  end if;
  w := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  insert into public.ai_request_budget as b (bucket, window_start, hits)
  values (p_bucket, w, 1)
  on conflict (bucket, window_start) do update set hits = b.hits + 1
  returning hits into n;
  return n <= p_limit;
end;
$$;
revoke all on function public.baqui_consume_budget(text, integer, integer) from public, anon, authenticated;
grant execute on function public.baqui_consume_budget(text, integer, integer) to service_role;
