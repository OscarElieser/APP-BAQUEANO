-- ============================================================================
-- 🧭 BAQUEANO — CONTADOR DE DESCARGAS DE LA APP ANDROID
-- ============================================================================
-- 🎯 POR QUÉ: el plan de evolución (F7) pide ver en Ops Center cuántas veces se descarga la APK
--    desde /descargar, por versión, sin inventar cifras.
-- ⚙️ CÓMO:
--    - app_download_events: un registro por clic en "Descargar para Android" (descargar.html).
--      RLS activo y SIN políticas: nadie la lee ni escribe directo; solo estas funciones.
--    - record_app_download(): security definer, search_path fijo. No guarda IP ni datos de la
--      persona: solo un hash SHA-256 de (IP + sal aleatoria del día). La sal (32 bytes de
--      gen_random_bytes) vive en app_download_salts, también con RLS y sin políticas, así que el
--      hash no se puede revertir probando IPs. Sirve para limitar a 3 conteos por dispositivo y día.
--    - public_app_download_stats(): solo agregados (total, 7 y 30 días, por versión, por día de
--      los últimos 14), en hora de Nicaragua. Sin filas individuales.
--    - Limitación declarada: una descarga directa del archivo (sin pasar por el botón) no se cuenta.
-- 📦 QUÉ: 2 tablas + 2 funciones (EXECUTE para anon/authenticated). Sin DROP ni DELETE.
-- ============================================================================
create table if not exists public.app_download_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  version_name text not null check (char_length(version_name) between 1 and 20 and version_name ~ '^[0-9A-Za-z.+-]+$'),
  version_code integer check (version_code is null or version_code between 1 and 100000000),
  source text not null default 'descargar' check (source in ('descargar')),
  device_day_hash text not null check (char_length(device_day_hash) = 64)
);
alter table public.app_download_events enable row level security;
create index if not exists app_download_events_created_idx on public.app_download_events (created_at);
create index if not exists app_download_events_hash_idx on public.app_download_events (device_day_hash, created_at);
comment on table public.app_download_events is 'Clics en "Descargar para Android" de /descargar. Sin IP ni datos personales: hash diario solo para limitar repeticiones.';

create table if not exists public.app_download_salts (
  day date primary key,
  salt text not null check (char_length(salt) = 64)
);
alter table public.app_download_salts enable row level security;
comment on table public.app_download_salts is 'Sal aleatoria diaria para el hash de app_download_events. Sin acceso público.';

create or replace function public.record_app_download(p_version_name text, p_version_code integer default null)
returns boolean
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_headers json;
  v_ip text;
  v_day date := (now() at time zone 'America/Managua')::date;
  v_salt text;
  v_hash text;
  v_count integer;
begin
  if p_version_name is null or p_version_name !~ '^[0-9A-Za-z.+-]{1,20}$' then return false; end if;
  begin v_headers := current_setting('request.headers', true)::json; exception when others then v_headers := null; end;
  v_ip := coalesce(nullif(v_headers ->> 'cf-connecting-ip', ''), nullif(trim(split_part(coalesce(v_headers ->> 'x-forwarded-for', ''), ',', 1)), ''), 'sin-ip');
  insert into public.app_download_salts (day, salt) values (v_day, encode(gen_random_bytes(32), 'hex'))
  on conflict (day) do nothing;
  select salt into v_salt from public.app_download_salts where day = v_day;
  v_hash := encode(digest(trim(v_ip) || '|' || v_salt, 'sha256'), 'hex');
  select count(*) into v_count from public.app_download_events
   where device_day_hash = v_hash and created_at > now() - interval '1 day';
  if v_count >= 3 then return false; end if;
  insert into public.app_download_events (version_name, version_code, device_day_hash)
  values (p_version_name, p_version_code, v_hash);
  return true;
end;
$$;

create or replace function public.public_app_download_stats()
returns json
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with e as (select *, (created_at at time zone 'America/Managua')::date as d from public.app_download_events),
       today as (select (now() at time zone 'America/Managua')::date as d)
  select json_build_object(
    'total', (select count(*) from e),
    'last7', (select count(*) from e, today where e.d > today.d - 7),
    'last30', (select count(*) from e, today where e.d > today.d - 30),
    'firstAt', (select min(created_at) from e),
    'lastAt', (select max(created_at) from e),
    'byVersion', coalesce((select json_agg(json_build_object('version', version_name, 'code', version_code, 'count', n) order by n desc)
                  from (select version_name, version_code, count(*) n from e group by 1, 2) v), '[]'::json),
    'daily', (select json_agg(json_build_object('date', g.d, 'count', coalesce(c.n, 0)) order by g.d)
              from today, generate_series(today.d - 13, today.d, interval '1 day') as g0(x)
              cross join lateral (select g0.x::date as d) g
              left join (select d, count(*) n from e group by d) c on c.d = g.d),
    'timezone', 'America/Managua'
  );
$$;

revoke all on function public.record_app_download(text, integer) from public;
revoke all on function public.public_app_download_stats() from public;
grant execute on function public.record_app_download(text, integer) to anon, authenticated;
grant execute on function public.public_app_download_stats() to anon, authenticated;
