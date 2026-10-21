-- ============================================================================
-- 🗓️ BAQUEANO — PRUEBAS DE LA AGENDA DE EVENTOS (public.events)
-- ============================================================================
-- 🎯 POR QUÉ: demostrar que el público solo ve eventos aprobados y publicados, que los estados
--    (hoy, en curso, finalizado, cancelado) salen de fechas reales en hora de Nicaragua, que un
--    cancelado no se promociona y que nada se borra.
-- ⚙️ CÓMO: SQL plano, todo dentro de una transacción REVERTIDA (no deja filas). Eventos de
--    ensayo con id 'zz-prueba-*' que solo existen durante la prueba.
-- 📦 QUÉ: `psql -f supabase/tests/tourism_events.test.sql` o pegar en el SQL Editor.
--    Al final imprime «tourism_events: 15/15 OK».
-- ============================================================================
begin;
create temporary table _t (n serial, name text);
create or replace function pg_temp.ok(p text) returns void language sql as $$ insert into _t (name) values (p) $$;
grant all on _t to anon, authenticated;
grant usage on sequence _t_n_seq to anon, authenticated;

-- Base válida para publicar (fuente, foto, descripción y fecha obligatorias).
create temporary table _base as select
  'Evento de prueba'::text title, 'festival_cultural'::text category, 'Lugar de prueba'::text location_name,
  'Descripción de prueba con detalle.'::text description, 'https://example.org/foto.webp'::text cover_image,
  'Fuente de prueba'::text source_name, 'https://example.org/fuente'::text source_url;

insert into public.events (id, slug, title, category, location_name, description, cover_image, source_name, source_url,
  department_id, start_at, end_at, time_confirmed, publication_status, event_status)
select v.id, v.slug, b.title, b.category, b.location_name, b.description, b.cover_image, b.source_name, b.source_url,
  'leon', v.s, v.e, v.tc, v.pub, v.st
from _base b, (values
  ('zz-prueba-futuro',    'zz-prueba-futuro',    now() + interval '10 days', null::timestamptz, true,  'published', 'scheduled'),
  ('zz-prueba-encurso',   'zz-prueba-encurso',   now() - interval '1 hour',  now() + interval '2 hours', true, 'published', 'scheduled'),
  ('zz-prueba-pasado',    'zz-prueba-pasado',    now() - interval '10 days', now() - interval '9 days', true, 'published', 'scheduled'),
  ('zz-prueba-cancelado', 'zz-prueba-cancelado', now() - interval '1 hour',  now() + interval '2 hours', true, 'published', 'cancelled'),
  ('zz-prueba-borrador',  'zz-prueba-borrador',  now() + interval '5 days',  null, true, 'draft', 'scheduled')
) v(id, slug, s, e, tc, pub, st);

-- 1-2) Sin acceso directo.
set local role anon;
do $$ begin perform count(*) from public.events; raise exception 'FALLA 1: anon leyó events';
exception when insufficient_privilege then perform pg_temp.ok('anon no lee la tabla'); end $$;
do $$ begin insert into public.events (id, title, category, start_date, location_name) values ('x', 'Falso', 'familiar', current_date, 'x');
  raise exception 'FALLA 2: anon insertó'; exception when insufficient_privilege then perform pg_temp.ok('anon no crea eventos'); end $$;

-- 3) Próximos: futuro y en curso; nunca borrador, pasado ni cancelado.
do $$ declare ids text[]; begin
  select array_agg(id order by start_at) into ids from public.public_events('upcoming') where id like 'zz-prueba-%';
  if ids is distinct from array['zz-prueba-encurso', 'zz-prueba-futuro'] then raise exception 'FALLA 3: %', ids; end if;
  perform pg_temp.ok('próximos: en curso + futuros, ordenados');
end $$;
-- 4) Estados calculados.
do $$ begin
  if (select time_state from public.public_events('all') where id = 'zz-prueba-encurso') <> 'ongoing' then raise exception 'FALLA 4a'; end if;
  if (select time_state from public.public_events('all') where id = 'zz-prueba-cancelado') <> 'cancelled' then raise exception 'FALLA 4b: cancelado'; end if;
  if (select time_state from public.public_events('all') where id = 'zz-prueba-pasado') <> 'finished' then raise exception 'FALLA 4c'; end if;
  if (select time_state from public.public_events('all') where id = 'zz-prueba-futuro') <> 'upcoming' then raise exception 'FALLA 4d'; end if;
  perform pg_temp.ok('estados: en curso, cancelado (nunca en curso), finalizado, próximo');
end $$;
-- 5) Histórico.
do $$ begin
  if not exists (select 1 from public.public_events('past') where id = 'zz-prueba-pasado') then raise exception 'FALLA 5'; end if;
  perform pg_temp.ok('finalizados quedan en el histórico');
end $$;
-- 6) Ficha: publicada sí, borrador no.
do $$ begin
  if not exists (select 1 from public.public_event('zz-prueba-cancelado')) then raise exception 'FALLA 6a'; end if;
  if exists (select 1 from public.public_event('zz-prueba-borrador')) then raise exception 'FALLA 6b'; end if;
  perform pg_temp.ok('ficha pública solo de publicados');
end $$;
reset role;

-- 7) Hora de Nicaragua: 14-11-2026 18:30 local = 15-11 00:30 UTC; la fecha local se guarda bien.
do $$ declare d date; t text; begin
  update public.events set start_at = '2026-11-15 00:30:00+00' where id = 'zz-prueba-futuro';
  select start_date, schedule_time into d, t from public.events where id = 'zz-prueba-futuro';
  if d <> '2026-11-14' or t <> '18:30' then raise exception 'FALLA 7: % %', d, t; end if;
  perform pg_temp.ok('fecha y hora en America/Managua');
end $$;
-- 8) Hora sin confirmar: no se publica una hora.
do $$ begin
  update public.events set time_confirmed = false where id = 'zz-prueba-futuro';
  if (select schedule_time from public.events where id = 'zz-prueba-futuro') is not null then raise exception 'FALLA 8'; end if;
  perform pg_temp.ok('horario por confirmar no inventa hora');
end $$;
-- 9) Publicar exige fuente, foto, descripción y fecha.
do $$ begin
  update public.events set source_name = null where id = 'zz-prueba-futuro';
  raise exception 'FALLA 9';
exception when check_violation then perform pg_temp.ok('no se publica sin fuente'); end $$;
-- 10) Precio solo en eventos de pago con moneda.
do $$ begin
  update public.events set access_type = 'free', price = 100, currency = 'NIO' where id = 'zz-prueba-futuro';
  raise exception 'FALLA 10';
exception when check_violation then perform pg_temp.ok('sin precio en eventos gratuitos'); end $$;
-- 11) Coordenadas fuera de Nicaragua.
do $$ begin
  update public.events set latitude = 40, longitude = -3 where id = 'zz-prueba-futuro';
  raise exception 'FALLA 11';
exception when check_violation then perform pg_temp.ok('coordenadas solo dentro de Nicaragua'); end $$;
-- 12) No se borra.
do $$ begin
  delete from public.events where id = 'zz-prueba-pasado';
  raise exception 'FALLA 12';
exception when raise_exception then if sqlerrm like 'FALLA%' then raise; end if; perform pg_temp.ok('los eventos no se borran'); end $$;
-- 13) Coordenadas no verificadas no salen al público.
do $$ begin
  update public.events set latitude = 12.43, longitude = -86.88, coords_verified = false where id = 'zz-prueba-encurso';
  if (select latitude from public.public_events('all') where id = 'zz-prueba-encurso') is not null then raise exception 'FALLA 13'; end if;
  perform pg_temp.ok('sin coordenadas verificadas no hay «Cómo llegar»');
end $$;
-- 14) Default seguro: un insert mínimo queda en borrador.
do $$ begin
  insert into public.events (id, title, category, start_date, location_name) values ('zz-prueba-minimo', 'Mínimo', 'familiar', current_date, 'x');
  if (select publication_status || '/' || status from public.events where id = 'zz-prueba-minimo') <> 'draft/draft' then raise exception 'FALLA 14'; end if;
  perform pg_temp.ok('un evento nuevo nace en borrador');
end $$;
-- 15) La política vieja ya no existe.
do $$ begin
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'events') then raise exception 'FALLA 15'; end if;
  perform pg_temp.ok('sin políticas abiertas en events');
end $$;

select 'tourism_events: ' || count(*) || '/15 OK' as resultado from _t;
rollback;
