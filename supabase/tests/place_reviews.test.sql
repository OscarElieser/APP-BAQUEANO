-- ============================================================================
-- 🧭 BAQUEANO — PRUEBAS DE VALORACIONES DE LUGARES (public.reviews)
-- ============================================================================
-- 🎯 POR QUÉ: demostrar que (1) el público no lee ni escribe la tabla directamente, (2) nadie
--    cambia el autor ni el destino de una opinión, (3) los promedios cuentan SOLO lo publicado y
--    (4) lo público nunca devuelve el UID de Firebase.
-- ⚙️ CÓMO: SQL plano (sin pgTAP) con bloques DO que fallan con un mensaje claro. Todo corre en
--    una transacción que se REVIERTE al final: no deja filas en la base.
-- 📦 QUÉ: `psql -f supabase/tests/place_reviews.test.sql` o pegar en el editor SQL de Supabase.
--    Al final imprime «place_reviews: 16/16 OK».
-- ============================================================================
begin;

create temporary table _t (n serial, name text);
create or replace function pg_temp.ok(p_name text) returns void language sql as $$ insert into _t (name) values (p_name) $$;
grant all on _t to anon, authenticated;
grant usage on sequence _t_n_seq to anon, authenticated;

-- Lugar de prueba (solo existe dentro de esta transacción).
insert into public.places (id, slug, name, is_published) values ('pl-zz-prueba', 'zz-prueba', 'Lugar de prueba', true);

-- 1-3) El público no toca la tabla directamente.
set local role anon;
do $$ begin perform count(*) from public.reviews; raise exception 'FALLA 1: anon leyó reviews';
exception when insufficient_privilege then perform pg_temp.ok('anon no lee reviews'); end $$;
do $$ begin insert into public.reviews (user_uid, place_id, rating, comment) values ('x', 'pl-zz-prueba', 5, 'falsa');
  raise exception 'FALLA 2: anon insertó'; exception when insufficient_privilege then perform pg_temp.ok('anon no inserta'); end $$;
reset role;
set local role authenticated;
do $$ begin update public.reviews set rating = 5; raise exception 'FALLA 3: authenticated actualizó';
exception when insufficient_privilege then perform pg_temp.ok('authenticated no modifica'); end $$;
reset role;

-- 4) Sin opiniones: 0 y promedio nulo (nunca 5 por defecto).
set local role anon;
do $$ declare r record; begin
  select * into r from public.place_review_summaries(array['place:zz-prueba']);
  if r.count <> 0 or r.average is not null then raise exception 'FALLA 4: resumen vacío = % / %', r.count, r.average; end if;
  perform pg_temp.ok('sin opiniones: 0 y sin promedio');
end $$;
reset role;

-- Datos de prueba escritos como lo haría la Edge Function (service_role).
insert into public.reviews (user_uid, user_name, user_avatar, show_avatar, place_id, rating, comment, status) values
  ('uid-a', 'Ana', 'https://example.org/a.png', true,  'pl-zz-prueba', 5, 'Muy lindo lugar para caminar.', 'published'),
  ('uid-b', 'Beto', 'https://example.org/b.png', false, 'pl-zz-prueba', 2, 'El acceso estaba en mal estado.', 'published'),
  ('uid-c', 'Ceci', null, true, 'pl-zz-prueba', 1, 'Pendiente de moderación.', 'pending'),
  ('uid-d', 'Dani', null, true, 'pl-zz-prueba', 1, 'Oculta por el equipo.', 'hidden');

-- 5) Solo cuenta lo publicado.
do $$ declare r record; begin
  select * into r from public.place_review_summaries(array['place:zz-prueba']);
  if r.count <> 2 or r.average <> 3.5 or r.d5 <> 1 or r.d2 <> 1 or r.d1 <> 0 then
    raise exception 'FALLA 5: % opiniones, promedio %', r.count, r.average; end if;
  perform pg_temp.ok('promedio y distribución solo con lo publicado');
end $$;

-- 6) Una por usuario y lugar.
do $$ begin
  insert into public.reviews (user_uid, place_id, rating, comment) values ('uid-a', 'pl-zz-prueba', 4, 'Segunda opinión.');
  raise exception 'FALLA 6: duplicada';
exception when unique_violation then perform pg_temp.ok('una opinión por usuario y lugar'); end $$;

-- 7-8) Autor y destino inmutables.
do $$ begin update public.reviews set user_uid = 'uid-z' where user_uid = 'uid-a'; raise exception 'FALLA 7';
exception when raise_exception then if sqlerrm like 'FALLA%' then raise; end if; perform pg_temp.ok('autor inmutable'); end $$;
do $$ begin update public.reviews set place_id = 'pl-playa-poneloya' where user_uid = 'uid-a'; raise exception 'FALLA 8';
exception when raise_exception then if sqlerrm like 'FALLA%' then raise; end if; perform pg_temp.ok('destino inmutable'); end $$;

-- 9) No se borra.
do $$ begin delete from public.reviews where user_uid = 'uid-a'; raise exception 'FALLA 9';
exception when raise_exception then if sqlerrm like 'FALLA%' then raise; end if; perform pg_temp.ok('no se borra'); end $$;

-- 10) Fecha de creación controlada por la base.
do $$ declare c timestamptz; begin
  select created_at into c from public.reviews where user_uid = 'uid-a';
  update public.reviews set created_at = '2000-01-01', comment = 'Editada con más detalle.' where user_uid = 'uid-a';
  if (select created_at from public.reviews where user_uid = 'uid-a') <> c then raise exception 'FALLA 10'; end if;
  perform pg_temp.ok('created_at inmutable');
end $$;

-- 11) Calificación fuera de rango.
do $$ begin insert into public.reviews (user_uid, place_id, rating, comment) values ('uid-e', 'pl-zz-prueba', 6, 'x');
  raise exception 'FALLA 11'; exception when check_violation then perform pg_temp.ok('rating 1..5'); end $$;

set local role anon;
-- 12) Lo público no expone el UID y respeta la foto oculta.
do $$ declare n int; hidden_avatar text; begin
  select count(*) into n from information_schema.columns c
    where c.table_schema = 'public' and c.table_name = 'reviews' and has_column_privilege('anon', 'public.reviews', c.column_name, 'SELECT');
  if n > 0 then raise exception 'FALLA 12a: anon tiene % columnas visibles', n; end if;
  select avatar_url into hidden_avatar from public.place_reviews_public('place:zz-prueba') where display_name = 'Beto';
  if hidden_avatar is not null then raise exception 'FALLA 12b: avatar oculto visible'; end if;
  if exists (select 1 from public.place_reviews_public('place:zz-prueba') where display_name in ('Ceci', 'Dani')) then
    raise exception 'FALLA 12c: pendiente u oculta en la lista pública'; end if;
  perform pg_temp.ok('lista pública sin UID ni no publicadas');
end $$;

-- 13) Orden «críticas» primero las más bajas; «mejores» primero las más altas.
do $$ begin
  if (select rating from public.place_reviews_public('place:zz-prueba', 'critical') limit 1) <> 2 then raise exception 'FALLA 13a'; end if;
  if (select rating from public.place_reviews_public('place:zz-prueba', 'best') limit 1) <> 5 then raise exception 'FALLA 13b'; end if;
  perform pg_temp.ok('orden recientes/mejores/críticas');
end $$;

-- 14) Alias inequívocos sí; ambiguos no; lugar no publicado tampoco.
do $$ begin
  if not exists (select 1 from public.review_resolve_target('destination:ometepe')) then raise exception 'FALLA 14a'; end if;
  if exists (select 1 from public.review_resolve_target('destination:granada')) then raise exception 'FALLA 14b'; end if;
  perform pg_temp.ok('alias destino→lugar solo inequívocos');
end $$;
reset role;
do $$ begin
  if exists (select 1 from public.places where is_published = false)
     and exists (select 1 from public.review_resolve_target('place:' || (select slug from public.places where is_published = false limit 1))) then
    raise exception 'FALLA 15'; end if;
  perform pg_temp.ok('lugar no publicado no recibe opiniones');
end $$;

-- 16) La política vieja (todas las columnas a anon) ya no existe.
do $$ begin
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'reviews') then raise exception 'FALLA 16'; end if;
  perform pg_temp.ok('sin políticas abiertas en reviews');
end $$;

select 'place_reviews: ' || count(*) || '/16 OK' as resultado from _t;
rollback;
