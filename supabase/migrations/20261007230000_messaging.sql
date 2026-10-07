-- ============================================================================
-- 🧭 BAQUEANO — MENSAJERÍA ENTRE VIAJEROS Y EL EQUIPO (F6)
-- ============================================================================
-- 🎯 POR QUÉ: el plan de evolución (F6) pide mensajería web + Android en Supabase. Hoy el buzón
--    (contact_messages) es de una sola vía: la persona escribe y nunca ve la respuesta dentro de
--    BAQUEANO. Ahora cada consulta es una conversación con respuestas del equipo, y la respuesta
--    llega también como aviso a la campana (notifications, F5).
-- ⚙️ CÓMO:
--    - conversations / messages: RLS activo y SIN políticas. Nadie las lee ni escribe directo:
--      solo la Edge Function baqueano-messages (service_role), que verifica el token de Firebase y
--      pasa el uid del servidor a estas funciones. El uid nunca viene del cuerpo de la petición.
--    - Las reglas viven aquí (probables con transacciones que se revierten): pertenencia de la
--      conversación, límites anti-abuso (máx. 5 abiertas por persona, 10 mensajes por 10 minutos),
--      longitudes, estados y contadores de no leídos.
--    - Sin DELETE: un trigger lo impide. Cerrar una conversación es un estado, no un borrado.
--    - Las funciones no tienen EXECUTE para anon ni authenticated.
-- 📦 QUÉ: 2 tablas, trigger anti-borrado y funciones msg_* (persona) y msg_staff_* (equipo).
-- ============================================================================
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_uid text not null check (char_length(user_uid) between 1 and 128),
  user_email text check (user_email is null or char_length(user_email) <= 254),
  subject text not null check (char_length(subject) between 3 and 120),
  status text not null default 'open' check (status in ('open', 'answered', 'closed')),
  user_unread integer not null default 0 check (user_unread >= 0),
  staff_unread integer not null default 0 check (staff_unread >= 0),
  last_author text not null default 'user' check (last_author in ('user', 'staff')),
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  closed_at timestamptz,
  closed_by text check (closed_by is null or char_length(closed_by) <= 254)
);
alter table public.conversations enable row level security;
create index if not exists conversations_user_idx on public.conversations (user_uid, last_message_at desc);
create index if not exists conversations_status_idx on public.conversations (status, last_message_at desc);
comment on table public.conversations is 'Conversaciones viajero ↔ equipo BAQUEANO (F6). Solo vía baqueano-messages.';

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id),
  author_kind text not null check (author_kind in ('user', 'staff')),
  author_ref text not null check (char_length(author_ref) between 1 and 254),
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;
create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);
create index if not exists messages_author_recent_idx on public.messages (author_ref, created_at desc);
comment on table public.messages is 'Mensajes de las conversaciones (F6). author_ref = uid de Firebase (persona) o correo del equipo.';

create or replace function public.msg_prevent_delete() returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  raise exception 'La mensajería no se borra: cerrá la conversación.' using errcode = '42501';
end;
$$;
create or replace trigger conversations_no_delete before delete on public.conversations for each row execute function public.msg_prevent_delete();
create or replace trigger messages_no_delete before delete on public.messages for each row execute function public.msg_prevent_delete();

-- Texto limpio: sin caracteres de control (salvo saltos de línea), espacios recortados.
create or replace function public.msg_clean(p_text text, p_max integer) returns text language sql immutable set search_path = public, pg_temp as $$
  select nullif(left(btrim(regexp_replace(regexp_replace(coalesce(p_text, ''), '[\x01-\x09\x0B-\x1F\x7F]', ' ', 'g'), '[ \t]+', ' ', 'g')), p_max + 1), '');
$$;

create or replace function public.msg_rate_ok(p_author text) returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select count(*) < 10 from public.messages where author_ref = p_author and created_at > now() - interval '10 minutes';
$$;

-- ---------------------------------------------------------------- persona (uid verificado por la Edge Function)
create or replace function public.msg_list(p_uid text) returns jsonb language sql stable security definer set search_path = public, pg_temp as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'subject', subject, 'status', status, 'unread', user_unread,
           'last_author', last_author, 'last_message_at', last_message_at, 'created_at', created_at) order by last_message_at desc), '[]'::jsonb)
    from (select * from public.conversations where user_uid = p_uid order by last_message_at desc limit 50) c;
$$;

create or replace function public.msg_thread(p_uid text, p_id uuid) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v public.conversations;
begin
  select * into v from public.conversations where id = p_id and user_uid = p_uid;
  if not found then raise exception 'not_found' using errcode = 'P0002'; end if;
  update public.conversations set user_unread = 0 where id = p_id;
  return jsonb_build_object('id', v.id, 'subject', v.subject, 'status', v.status, 'created_at', v.created_at,
    'messages', coalesce((select jsonb_agg(jsonb_build_object('id', m.id, 'author', m.author_kind, 'body', m.body, 'created_at', m.created_at) order by m.created_at)
                          from public.messages m where m.conversation_id = p_id), '[]'::jsonb));
end;
$$;

create or replace function public.msg_start(p_uid text, p_email text, p_subject text, p_body text) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_subject text := public.msg_clean(p_subject, 120); v_body text := public.msg_clean(p_body, 2000); v_id uuid;
begin
  if v_subject is null or char_length(v_subject) < 3 or char_length(v_subject) > 120 then raise exception 'subject_invalid' using errcode = '22023'; end if;
  if v_body is null or char_length(v_body) > 2000 then raise exception 'body_invalid' using errcode = '22023'; end if;
  if (select count(*) from public.conversations where user_uid = p_uid and status <> 'closed') >= 5 then raise exception 'too_many_open' using errcode = '54000'; end if;
  if not public.msg_rate_ok(p_uid) then raise exception 'rate_limited' using errcode = '54000'; end if;
  insert into public.conversations (user_uid, user_email, subject, staff_unread, last_author)
  values (p_uid, nullif(left(lower(btrim(coalesce(p_email, ''))), 254), ''), v_subject, 1, 'user') returning id into v_id;
  insert into public.messages (conversation_id, author_kind, author_ref, body) values (v_id, 'user', p_uid, v_body);
  return jsonb_build_object('id', v_id);
end;
$$;

create or replace function public.msg_send(p_uid text, p_id uuid, p_body text) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v public.conversations; v_body text := public.msg_clean(p_body, 2000); v_mid uuid;
begin
  select * into v from public.conversations where id = p_id and user_uid = p_uid for update;
  if not found then raise exception 'not_found' using errcode = 'P0002'; end if;
  if v.status = 'closed' then raise exception 'closed' using errcode = '55000'; end if;
  if v_body is null or char_length(v_body) > 2000 then raise exception 'body_invalid' using errcode = '22023'; end if;
  if not public.msg_rate_ok(p_uid) then raise exception 'rate_limited' using errcode = '54000'; end if;
  insert into public.messages (conversation_id, author_kind, author_ref, body) values (p_id, 'user', p_uid, v_body) returning id into v_mid;
  update public.conversations set status = 'open', staff_unread = staff_unread + 1, last_author = 'user', last_message_at = now() where id = p_id;
  return jsonb_build_object('id', v_mid);
end;
$$;

create or replace function public.msg_unread(p_uid text) returns integer language sql stable security definer set search_path = public, pg_temp as $$
  select coalesce(sum(user_unread), 0)::int from public.conversations where user_uid = p_uid;
$$;

-- ---------------------------------------------------------------- equipo (rol verificado por la Edge Function)
create or replace function public.msg_staff_inbox(p_status text) returns jsonb language sql stable security definer set search_path = public, pg_temp as $$
  select jsonb_build_object(
    'items', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'subject', subject, 'status', status, 'unread', staff_unread,
               'user_email', user_email, 'last_author', last_author, 'last_message_at', last_message_at, 'created_at', created_at) order by last_message_at desc)
             from (select * from public.conversations
                    where (p_status is null or p_status = 'all' or status = p_status)
                    order by last_message_at desc limit 100) c), '[]'::jsonb),
    'unread', (select coalesce(sum(staff_unread), 0) from public.conversations),
    'open', (select count(*) from public.conversations where status = 'open'));
$$;

create or replace function public.msg_staff_thread(p_id uuid, p_mark_read boolean) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v public.conversations;
begin
  select * into v from public.conversations where id = p_id;
  if not found then raise exception 'not_found' using errcode = 'P0002'; end if;
  if p_mark_read then update public.conversations set staff_unread = 0 where id = p_id; end if;
  return jsonb_build_object('id', v.id, 'subject', v.subject, 'status', v.status, 'user_email', v.user_email, 'created_at', v.created_at,
    'closed_at', v.closed_at, 'closed_by', v.closed_by,
    'messages', coalesce((select jsonb_agg(jsonb_build_object('id', m.id, 'author', m.author_kind, 'author_ref', case when m.author_kind = 'staff' then m.author_ref end,
                          'body', m.body, 'created_at', m.created_at) order by m.created_at)
                          from public.messages m where m.conversation_id = p_id), '[]'::jsonb));
end;
$$;

-- Devuelve user_uid para que la Edge Function avise a la persona (notifications).
create or replace function public.msg_staff_reply(p_staff text, p_id uuid, p_body text) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v public.conversations; v_body text := public.msg_clean(p_body, 2000); v_mid uuid;
begin
  select * into v from public.conversations where id = p_id for update;
  if not found then raise exception 'not_found' using errcode = 'P0002'; end if;
  if v.status = 'closed' then raise exception 'closed' using errcode = '55000'; end if;
  if v_body is null or char_length(v_body) > 2000 then raise exception 'body_invalid' using errcode = '22023'; end if;
  insert into public.messages (conversation_id, author_kind, author_ref, body) values (p_id, 'staff', left(p_staff, 254), v_body) returning id into v_mid;
  update public.conversations set status = 'answered', user_unread = user_unread + 1, staff_unread = 0, last_author = 'staff', last_message_at = now() where id = p_id;
  return jsonb_build_object('id', v_mid, 'user_uid', v.user_uid, 'subject', v.subject);
end;
$$;

create or replace function public.msg_staff_close(p_staff text, p_id uuid) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
begin
  update public.conversations set status = 'closed', closed_at = now(), closed_by = left(p_staff, 254), staff_unread = 0
   where id = p_id and status <> 'closed';
  if not found then
    if not exists (select 1 from public.conversations where id = p_id) then raise exception 'not_found' using errcode = 'P0002'; end if;
  end if;
  return jsonb_build_object('id', p_id, 'status', 'closed');
end;
$$;

do $$
declare f text;
begin
  foreach f in array array['msg_rate_ok(text)', 'msg_list(text)', 'msg_thread(text, uuid)', 'msg_start(text, text, text, text)', 'msg_send(text, uuid, text)',
                           'msg_unread(text)', 'msg_staff_inbox(text)', 'msg_staff_thread(uuid, boolean)', 'msg_staff_reply(text, uuid, text)', 'msg_staff_close(text, uuid)'] loop
    execute format('revoke all on function public.%s from public', f);
    execute format('revoke all on function public.%s from anon, authenticated', f);
    execute format('grant execute on function public.%s to service_role', f);
  end loop;
end;
$$;
