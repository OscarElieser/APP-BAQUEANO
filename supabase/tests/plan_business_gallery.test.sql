-- ============================================================================
-- 🧭 BAQUEANO — PRUEBAS: VÍNCULO AUTOMÁTICO DEL PLAN Y GALERÍA POR PLAN
-- ============================================================================
-- 🎯 POR QUÉ: demostrar que (1) publicar la solicitud de un plan pagado crea el negocio sin
--    verificar y lo vincula, (2) no duplica si ya existe, (3) la galería respeta el límite de
--    cada plan y el video es solo de Cumbre, (4) nada se borra y (5) lo público no excede el plan.
-- ⚙️ CÓMO: SQL plano; todo dentro de una transacción que se REVIERTE al final.
-- 📦 QUÉ: `psql -f supabase/tests/plan_business_gallery.test.sql` → «plan_business_gallery: 13/13 OK».
-- ============================================================================
begin;

create temporary table _t (n serial, name text);
create or replace function pg_temp.ok(p_name text) returns void language sql as $$ insert into _t (name) values (p_name) $$;
grant all on _t to anon, authenticated;
grant usage on sequence _t_n_seq to anon, authenticated;

-- Pedido Sendero pagado con su solicitud (todo de ensayo).
insert into public.plan_orders (id, code, plan_code, billing_period, amount_usd, amount_nio, exchange_rate, client_type, legal_name, id_type, id_number,
  contact_name, email, phone, billing_address, business_name, business_category, department, business_description, status, period_start, period_end,
  receipt_number, business_application_code, owner_uid)
values ('00000000-0000-4000-8000-0000000000b1', 'PL-ZZ-1', 'sendero', 'monthly', 10, 366, 36.6243, 'persona', 'Prueba', 'cedula', '0010101010000Z',
  'Ana Prueba', 'ana@example.org', '+50588880000', 'Calle de prueba', 'Hostal ZZ Prueba', 'alojamiento', 'León', 'Hostal de prueba para las pruebas automáticas',
  'paid', current_date, current_date + 30, 'BQ-ZZ-1', 'NEG-ZZ-1', 'uid-zz-ana');
insert into public.business_applications (id, code, user_id, business_name, owner_name, phone, email, department, municipality, category, short_description, status, lat, lng, consents, language)
values ('00000000-0000-4000-8000-0000000000c1', 'NEG-ZZ-1', 'uid-zz-ana', 'Hostal ZZ Prueba', 'Ana Prueba', '+50588880000', 'ana@example.org', 'León', 'León',
  'alojamiento', 'Hostal de prueba para las pruebas automáticas', 'approved', 12.43, -86.88, '{}'::jsonb, 'es');

-- 1) Publicar crea el negocio y lo vincula.
update public.business_applications set status = 'published', approved_at = now() where code = 'NEG-ZZ-1';
do $$ declare b record; begin
  select x.* into b from public.businesses x join public.plan_orders o on o.business_id = x.id where o.code = 'PL-ZZ-1';
  if b.id is null then raise exception 'FALLA 1: no se creó ni vinculó'; end if;
  perform pg_temp.ok('publicar crea y vincula');
end $$;

-- 2) Nace sin verificar, sin pin exacto y con su departamento y categoría.
do $$ declare b record; begin
  select x.* into b from public.businesses x join public.plan_orders o on o.business_id = x.id where o.code = 'PL-ZZ-1';
  if b.verified or b.verification_status <> 'unverified' or b.map_ready or b.location_precision <> 'approximate'
     or b.department_id <> 'leon' or b.category <> 'hospedaje' or not b.is_published or b.owner_uid <> 'uid-zz-ana' then
    raise exception 'FALLA 2: % % % % % %', b.verified, b.verification_status, b.location_precision, b.department_id, b.category, b.owner_uid; end if;
  perform pg_temp.ok('sin verificar ni pin exacto');
end $$;

-- 3) Volver a publicar no duplica.
update public.business_applications set status = 'approved' where code = 'NEG-ZZ-1';
update public.business_applications set status = 'published' where code = 'NEG-ZZ-1';
do $$ begin
  if (select count(*) from public.businesses where owner_uid = 'uid-zz-ana') <> 1 then raise exception 'FALLA 3'; end if;
  perform pg_temp.ok('no duplica');
end $$;

-- 4) Una solicitud sin plan pagado no crea nada.
insert into public.business_applications (id, code, user_id, business_name, owner_name, phone, email, department, category, short_description, status, consents, language)
values ('00000000-0000-4000-8000-0000000000c2', 'NEG-ZZ-2', 'uid-zz-otro', 'Otro ZZ', 'Otro', '+50588881111', 'otro@example.org', 'Granada', 'restaurante', 'Solicitud sin plan para la prueba', 'approved', '{}'::jsonb, 'es');
update public.business_applications set status = 'published' where code = 'NEG-ZZ-2';
do $$ begin
  if exists (select 1 from public.businesses where owner_uid = 'uid-zz-otro') then raise exception 'FALLA 4'; end if;
  perform pg_temp.ok('sin plan no crea negocio');
end $$;

-- 5) Sendero: hasta 6 fotos (contando las pendientes).
do $$ declare v_biz text := (select business_id from public.plan_orders where code = 'PL-ZZ-1'); i int; begin
  for i in 1..6 loop
    insert into public.business_media (business_id, kind, storage_path, url, uploaded_by, uploaded_role, status)
    values (v_biz, 'photo', 'gallery/' || replace(v_biz, 'biz-', '') || '/' || gen_random_uuid() || '.webp', 'https://example.org/f' || i || '.webp', 'ana@example.org', 'owner', case when i <= 3 then 'active' else 'pending' end);
  end loop;
  begin
    insert into public.business_media (business_id, kind, storage_path, url, uploaded_by, uploaded_role)
    values (v_biz, 'photo', 'gallery/' || replace(v_biz, 'biz-', '') || '/' || gen_random_uuid() || '.webp', 'https://example.org/f7.webp', 'ana@example.org', 'owner');
    raise exception 'FALLA 5: aceptó la séptima';
  exception when raise_exception then if sqlerrm like 'FALLA%' then raise; end if; end;
  perform pg_temp.ok('Sendero hasta 6 fotos');
end $$;

-- 6) Sendero no tiene video.
do $$ begin
  insert into public.business_media (business_id, kind, url, uploaded_by, uploaded_role)
  values ((select business_id from public.plan_orders where code = 'PL-ZZ-1'), 'video', 'https://youtu.be/prueba', 'ana@example.org', 'owner');
  raise exception 'FALLA 6';
exception when raise_exception then if sqlerrm like 'FALLA%' then raise; end if; perform pg_temp.ok('video solo en Cumbre'); end $$;

-- 7) Lo público: solo lo aprobado (3), nunca lo pendiente.
do $$ begin
  if (select count(*) from public.business_media_public((select business_id from public.plan_orders where code = 'PL-ZZ-1'))) <> 3 then raise exception 'FALLA 7'; end if;
  perform pg_temp.ok('público solo lo aprobado');
end $$;

-- 8) Retirar libera cupo; lo retirado no vuelve.
do $$ declare v_id uuid; v_biz text := (select business_id from public.plan_orders where code = 'PL-ZZ-1'); begin
  select id into v_id from public.business_media where business_id = v_biz and status = 'pending' limit 1;
  update public.business_media set status = 'removed', status_reason = 'Foto repetida' where id = v_id;
  insert into public.business_media (business_id, kind, storage_path, url, uploaded_by, uploaded_role)
  values (v_biz, 'photo', 'gallery/' || replace(v_biz, 'biz-', '') || '/' || gen_random_uuid() || '.webp', 'https://example.org/f8.webp', 'ana@example.org', 'owner');
  begin update public.business_media set status = 'active' where id = v_id; raise exception 'FALLA 8';
  exception when raise_exception then if sqlerrm like 'FALLA%' then raise; end if; end;
  perform pg_temp.ok('retirar libera cupo y no vuelve');
end $$;

-- 9) No se borra ni cambia de archivo.
do $$ begin
  begin delete from public.business_media where status = 'active'; raise exception 'FALLA 9a';
  exception when raise_exception then if sqlerrm like 'FALLA%' then raise; end if; end;
  begin update public.business_media set url = 'https://example.org/otra.webp' where status = 'active'; raise exception 'FALLA 9b';
  exception when raise_exception then if sqlerrm like 'FALLA%' then raise; end if; end;
  perform pg_temp.ok('no se borra ni se cambia el archivo');
end $$;

-- 10) Cumbre: sin límite de fotos y un solo video, de un sitio permitido.
do $$ declare v_biz text := (select business_id from public.plan_orders where code = 'PL-ZZ-1'); i int; begin
  update public.plan_orders set status = 'paid' where code = 'PL-ZZ-1';
  insert into public.plan_orders (id, code, plan_code, billing_period, amount_usd, amount_nio, exchange_rate, client_type, legal_name, id_type, id_number,
    contact_name, email, phone, billing_address, business_name, business_category, department, business_description, status, period_start, period_end, receipt_number, business_id)
  values ('00000000-0000-4000-8000-0000000000b2', 'PL-ZZ-2', 'cumbre', 'monthly', 90, 3296, 36.6243, 'persona', 'Prueba', 'cedula', '0010101010000Z',
    'Ana Prueba', 'ana@example.org', '+50588880000', 'Calle de prueba', 'Hostal ZZ Prueba', 'alojamiento', 'León', 'Hostal de prueba para las pruebas automáticas',
    'paid', current_date, current_date + 30, 'BQ-ZZ-2', v_biz);
  for i in 1..10 loop
    insert into public.business_media (business_id, kind, storage_path, url, uploaded_by, uploaded_role, status)
    values (v_biz, 'photo', 'gallery/' || replace(v_biz, 'biz-', '') || '/' || gen_random_uuid() || '.webp', 'https://example.org/c' || i || '.webp', 'equipo@baqueano.ni', 'staff', 'active');
  end loop;
  begin insert into public.business_media (business_id, kind, url, uploaded_by, uploaded_role) values (v_biz, 'video', 'https://evil.example/v', 'e@e.ni', 'staff');
    raise exception 'FALLA 10a'; exception when check_violation then null; end;
  insert into public.business_media (business_id, kind, url, uploaded_by, uploaded_role, status) values (v_biz, 'video', 'https://youtu.be/prueba', 'e@e.ni', 'staff', 'active');
  begin insert into public.business_media (business_id, kind, url, uploaded_by, uploaded_role) values (v_biz, 'video', 'https://vimeo.com/1', 'e@e.ni', 'staff');
    raise exception 'FALLA 10b'; exception when raise_exception then if sqlerrm like 'FALLA%' then raise; end if; end;
  perform pg_temp.ok('Cumbre sin límite y un video');
end $$;

-- 11) Si Cumbre vence, lo público vuelve al límite del plan que queda (Sendero: 6) sin borrar nada.
do $$ declare v_biz text := (select business_id from public.plan_orders where code = 'PL-ZZ-1'); begin
  if (select count(*) from public.business_media_public(v_biz) where kind = 'video') <> 1 then raise exception 'FALLA 11a'; end if;
  update public.plan_orders set status = 'cancelled' where code = 'PL-ZZ-2';
  if (select count(*) from public.business_media_public(v_biz) where kind = 'photo') <> 6
     or exists (select 1 from public.business_media_public(v_biz) where kind = 'video') then raise exception 'FALLA 11b'; end if;
  perform pg_temp.ok('al bajar de plan respeta el nuevo límite');
end $$;

-- 13) Si crear el negocio falla, la solicitud se publica igual y el motivo queda en las notas.
do $$ begin
  insert into public.plan_orders (id, code, plan_code, billing_period, amount_usd, amount_nio, exchange_rate, client_type, legal_name, id_type, id_number,
    contact_name, email, phone, billing_address, business_name, business_category, department, business_description, status, period_start, period_end, receipt_number, business_application_code)
  values ('00000000-0000-4000-8000-0000000000b3', 'PL-ZZ-3', 'mirador', 'monthly', 35, 1282, 36.6243, 'persona', 'Prueba', 'cedula', '0010101010000Z',
    'Beto Prueba', 'beto@example.org', '+50588882222', 'Calle de prueba', 'Negocio ZZ Falla', 'restaurante', 'Granada', 'Negocio de prueba para la falla controlada',
    'paid', current_date, current_date + 30, 'BQ-ZZ-3', 'NEG-ZZ-3');
  -- La falla se provoca con una regla temporal en businesses (se revierte con la prueba).
  alter table public.businesses add constraint zz_prueba_falla check (name <> 'Negocio ZZ Falla') not valid;
  insert into public.business_applications (id, code, user_id, business_name, owner_name, phone, email, department, category, short_description, status, consents, language)
  values ('00000000-0000-4000-8000-0000000000c3', 'NEG-ZZ-3', 'uid-zz-beto', 'Negocio ZZ Falla', 'Beto', '+50588882222', 'beto@example.org', 'Granada', 'restaurante', 'Solicitud que no puede crear negocio', 'approved', '{}'::jsonb, 'es');
  update public.business_applications set status = 'published' where code = 'NEG-ZZ-3';
  if (select status from public.business_applications where code = 'NEG-ZZ-3') <> 'published' then raise exception 'FALLA 13a'; end if;
  if (select business_id from public.plan_orders where code = 'PL-ZZ-3') is not null
     or (select staff_notes from public.plan_orders where code = 'PL-ZZ-3') not like '%Vínculo automático%' then raise exception 'FALLA 13b'; end if;
  perform pg_temp.ok('una falla no bloquea la publicación');
end $$;

-- 12) El público no lee la tabla directamente.
set local role anon;
do $$ begin perform count(*) from public.business_media; raise exception 'FALLA 12';
exception when insufficient_privilege then perform pg_temp.ok('anon no lee la tabla'); end $$;
reset role;

select 'plan_business_gallery: ' || count(*) || '/13 OK' as resultado from _t;
rollback;
