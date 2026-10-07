-- ============================================================================
-- 🧭 BAQUEANO — LÍMITE POR IP EN LAS RPC PÚBLICAS DE ESCRITURA (20/20 E, antispam)
-- ============================================================================
-- 🎯 POR QUÉ: track_event, track_commercial_action y submit_feedback se pueden llamar sin sesión
--    (clave publicable). Sus límites dependían SOLO de anonymous_id, que elige el navegador: quien
--    quisiera inflar la analítica o llenar opiniones bastaba con cambiarlo en cada llamada.
-- ⚙️ CÓMO:
--    - client_ip_allowed(scope, límite, ventana): toma la IP de la petición (cf-connecting-ip o
--      el primer x-forwarded-for), la convierte en SHA-256 con la sal aleatoria del día
--      (app_download_salts: 32 bytes, sin acceso público) y cuenta en public.ai_request_budget
--      con baqui_consume_budget (la misma ventana fija que usan las Edge Functions).
--      La IP nunca se guarda en claro y el hash no se puede revertir probando IPs.
--    - Las llamadas internas (service_role o sin cabeceras HTTP: cron, SQL) no se limitan.
--    - Límites generosos para no castigar redes compartidas (universidades, hoteles):
--        track_event 600 / 10 min · track_commercial_action 120 / 10 min · submit_feedback 20 / hora.
--      Al pasarse, la función devuelve false (igual que su límite anterior), sin error.
--    - El resto de cada función queda idéntico a su versión anterior (pg_get_functiondef del
--      2026-10-07); solo se agrega la línea del límite después de validar los parámetros.
-- 📦 QUÉ: función client_ip_allowed + 3 funciones redefinidas. Sin DROP ni DELETE.
-- ============================================================================
create or replace function public.client_ip_allowed(p_scope text, p_limit integer, p_window_seconds integer)
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
begin
  if coalesce(nullif(current_setting('request.jwt.claims', true), '')::json ->> 'role', '') = 'service_role' then return true; end if;
  begin v_headers := nullif(current_setting('request.headers', true), '')::json; exception when others then v_headers := null; end;
  if v_headers is null then return true; end if;
  v_ip := coalesce(nullif(v_headers ->> 'cf-connecting-ip', ''), nullif(trim(split_part(coalesce(v_headers ->> 'x-forwarded-for', ''), ',', 1)), ''));
  if v_ip is null then return true; end if;
  insert into public.app_download_salts (day, salt) values (v_day, encode(gen_random_bytes(32), 'hex')) on conflict (day) do nothing;
  select salt into v_salt from public.app_download_salts where day = v_day;
  return public.baqui_consume_budget('rpc:' || left(p_scope, 12) || ':' || encode(digest(trim(v_ip) || '|' || v_salt, 'sha256'), 'hex'), p_limit, p_window_seconds);
end;
$$;
revoke all on function public.client_ip_allowed(text, integer, integer) from public;
revoke all on function public.client_ip_allowed(text, integer, integer) from anon, authenticated;

CREATE OR REPLACE FUNCTION public.submit_feedback(p_feature text, p_rating smallint, p_anonymous_id text, p_platform text DEFAULT 'web'::text, p_usefulness smallint DEFAULT NULL::smallint, p_comment text DEFAULT NULL::text, p_language text DEFAULT NULL::text, p_entity_type text DEFAULT NULL::text, p_entity_id text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_user uuid;
begin
  if p_anonymous_id is null or char_length(p_anonymous_id) not between 8 and 120 then
    raise exception 'anonymous_id inválido' using errcode = '22023';
  end if;
  -- Límite por IP (20/20 E): anonymous_id lo elige el navegador, la IP (en hash) no.
  if not public.client_ip_allowed('feedback', 20, 3600) then
    return false;
  end if;
  if (select count(*) from public.user_feedback
      where anonymous_id = p_anonymous_id and created_at > now() - interval '1 day') >= 10 then
    return false;
  end if;
  select id into v_user from public.profiles where id = auth.uid() and status = 'active';
  insert into public.user_feedback (user_id, anonymous_id, feature, rating, usefulness, comment, language, platform, entity_type, entity_id)
  values (v_user, p_anonymous_id, p_feature, p_rating, p_usefulness, left(nullif(btrim(p_comment), ''), 1000),
          case when p_language in ('es', 'en', 'fr', 'it', 'pt', 'de') then p_language end,
          p_platform, nullif(p_entity_type, ''), left(nullif(p_entity_id, ''), 160));
  perform public.track_event('feedback_submitted', p_anonymous_id, null, p_platform, 'feature', p_feature);
  return true;
end;
$function$;

CREATE OR REPLACE FUNCTION public.track_commercial_action(p_action_type text, p_anonymous_id text, p_session_id text DEFAULT NULL::text, p_platform text DEFAULT 'web'::text, p_business_id text DEFAULT NULL::text, p_destination_id text DEFAULT NULL::text, p_experience_id text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_user uuid;
  v_business text;
  v_destination text;
  v_experience text;
  v_campaign uuid;
  v_event text;
begin
  if p_action_type not in ('whatsapp', 'call', 'contact', 'booking_request', 'day_pass_request', 'directions', 'message') then
    raise exception 'acción inválida' using errcode = '22023';
  end if;
  if p_platform not in ('web', 'android', 'ios') then
    raise exception 'plataforma inválida' using errcode = '22023';
  end if;
  if p_anonymous_id is null or char_length(p_anonymous_id) not between 8 and 120 then
    raise exception 'anonymous_id inválido' using errcode = '22023';
  end if;
  -- Límite por IP (20/20 E): anonymous_id lo elige el navegador, la IP (en hash) no.
  if not public.client_ip_allowed('commercial', 120, 600) then
    return false;
  end if;
  if (select count(*) from public.commercial_actions
      where anonymous_id = p_anonymous_id and occurred_at > now() - interval '1 hour') >= 60 then
    return false;
  end if;

  select id into v_user from public.profiles where id = auth.uid() and status = 'active';
  select id into v_business from public.businesses where id = p_business_id and deleted_at is null;
  select id into v_destination from public.destinations where id = p_destination_id and deleted_at is null;
  select id into v_experience from public.experiences where id = p_experience_id;
  if v_business is null and v_destination is null and v_experience is null then
    raise exception 'la acción debe referirse a un negocio, destino o experiencia existente' using errcode = '22023';
  end if;
  select id into v_campaign from public.campaign_attribution where session_id = p_session_id;

  insert into public.commercial_actions (action_type, user_id, anonymous_id, session_id, business_id, destination_id,
                                         experience_id, campaign_attribution_id, platform, is_qualified)
  values (p_action_type, v_user, p_anonymous_id, p_session_id, v_business, v_destination, v_experience, v_campaign,
          p_platform, true);

  v_event := case p_action_type when 'whatsapp' then 'whatsapp_clicked' when 'call' then 'phone_clicked'
             when 'directions' then 'directions_clicked' when 'booking_request' then 'booking_requested'
             when 'day_pass_request' then 'booking_requested' else 'inquiry_sent' end;
  perform public.track_event(v_event, p_anonymous_id, p_session_id, p_platform,
                             case when v_business is not null then 'business' when v_experience is not null then 'experience' else 'destination' end,
                             coalesce(v_business, v_experience, v_destination));
  return true;
end;
$function$;

CREATE OR REPLACE FUNCTION public.track_event(p_event_name text, p_anonymous_id text, p_session_id text DEFAULT NULL::text, p_platform text DEFAULT 'web'::text, p_entity_type text DEFAULT NULL::text, p_entity_id text DEFAULT NULL::text, p_department_id text DEFAULT NULL::text, p_language text DEFAULT NULL::text, p_path text DEFAULT NULL::text, p_metadata jsonb DEFAULT '{}'::jsonb, p_utm jsonb DEFAULT NULL::jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_user uuid;
  v_type record;
  v_recent integer;
  v_actor text;
begin
  select * into v_type from public.analytics_event_types where name = p_event_name;
  if not found or not v_type.client_allowed then
    raise exception 'evento no permitido: %', p_event_name using errcode = '22023';
  end if;
  if p_platform not in ('web', 'android', 'ios') then
    raise exception 'plataforma inválida' using errcode = '22023';
  end if;
  if p_anonymous_id is null or char_length(p_anonymous_id) not between 8 and 120 then
    raise exception 'anonymous_id inválido' using errcode = '22023';
  end if;
  -- Límite por IP (20/20 E): anonymous_id lo elige el navegador, la IP (en hash) no.
  if not public.client_ip_allowed('event', 600, 600) then
    return false;
  end if;

  select p.id into v_user from public.profiles p where p.id = auth.uid() and p.status = 'active';

  select count(*) into v_recent from public.analytics_events
  where anonymous_id = p_anonymous_id and occurred_at > now() - interval '1 hour';
  if v_recent >= 300 then
    return false;
  end if;

  if p_utm is not null and p_session_id is not null and jsonb_typeof(p_utm) = 'object' then
    insert into public.campaign_attribution (session_id, anonymous_id, user_id, platform, utm_source, utm_medium,
                                             utm_campaign, utm_content, utm_term, referrer_domain, landing_path)
    values (p_session_id, p_anonymous_id, v_user, p_platform,
            left(p_utm->>'utm_source', 100), left(p_utm->>'utm_medium', 100), left(p_utm->>'utm_campaign', 150),
            left(p_utm->>'utm_content', 150), left(p_utm->>'utm_term', 150), left(p_utm->>'referrer_domain', 200),
            left(p_utm->>'landing_path', 300))
    on conflict (session_id) do nothing;
  end if;

  v_actor := public.analytics_actor_key(v_user, null, p_anonymous_id);
  if v_type.is_activation and not exists (
      select 1 from public.analytics_events e
      where e.event_name = 'user_activated'
        and public.analytics_actor_key(e.user_id, e.legacy_uid, e.anonymous_id) = v_actor) then
    insert into public.analytics_events (event_name, user_id, anonymous_id, session_id, platform, metadata)
    values ('user_activated', v_user, p_anonymous_id, p_session_id, 'server', jsonb_build_object('trigger_event', p_event_name));
  end if;

  insert into public.analytics_events (event_name, user_id, anonymous_id, session_id, platform, entity_type, entity_id,
                                       department_id, language, path, metadata)
  values (p_event_name, v_user, p_anonymous_id, p_session_id, p_platform,
          nullif(p_entity_type, ''), left(nullif(p_entity_id, ''), 160),
          (select d.id from public.departments d where d.id = p_department_id),
          case when p_language in ('es', 'en', 'fr', 'it', 'pt', 'de') then p_language end,
          left(p_path, 300),
          case when jsonb_typeof(p_metadata) = 'object' and pg_column_size(p_metadata) <= 4096 then p_metadata else '{}'::jsonb end);
  return true;
end;
$function$;
