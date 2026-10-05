-- ============================================================================
-- 🧭 BAQUEANO — INGESTA VALIDADA, ACTIVACIÓN Y KPIs DESDE EL BACKEND
-- ============================================================================
-- 🎯 POR QUÉ: las tablas de analítica no aceptan escritura directa de clientes;
--   la web y la app necesitan una puerta segura para registrar eventos, y Ops
--   Center necesita KPIs calculados en PostgreSQL (no contando miles de filas
--   en JavaScript).
-- ⚙️ CÓMO:
--   - `track_event`, `track_commercial_action`, `submit_feedback`: SECURITY
--     DEFINER con search_path vacío; validan catálogo/listas, tamaños, existencia
--     de entidades y límites por hora/día por `anonymous_id`. `user_id` SIEMPRE
--     sale de auth.uid() (nunca del cliente). Al primer evento de activación de
--     un actor se registra `user_activated` (servidor).
--   - `v_actor_activation`: primera vista y fecha de activación por actor.
--   - `kpi_dashboard(desde, hasta)`: JSON con valor, numerador, denominador y
--     estado (`ok` / `insufficient_data`) de cada KPI. Solo service_role o
--     personal con `analytics.read`.
-- 📦 QUÉ: KPIs reproducibles (docs/database/SMART_KPI_MATRIX.md).
-- ============================================================================

create or replace function public.analytics_actor_key(p_user uuid, p_legacy text, p_anonymous text)
returns text language sql immutable set search_path = '' as $$
  select coalesce('u:' || p_user::text, 'f:' || p_legacy, 'a:' || p_anonymous)
$$;
revoke all on function public.analytics_actor_key(uuid, text, text) from public, anon, authenticated;
grant execute on function public.analytics_actor_key(uuid, text, text) to service_role;
create index if not exists idx_analytics_events_activation_actor
  on public.analytics_events (public.analytics_actor_key(user_id, legacy_uid, anonymous_id))
  where event_name = 'user_activated';

create or replace function public.track_event(
  p_event_name text,
  p_anonymous_id text,
  p_session_id text default null,
  p_platform text default 'web',
  p_entity_type text default null,
  p_entity_id text default null,
  p_department_id text default null,
  p_language text default null,
  p_path text default null,
  p_metadata jsonb default '{}'::jsonb,
  p_utm jsonb default null
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
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
$$;

create or replace function public.track_commercial_action(
  p_action_type text,
  p_anonymous_id text,
  p_session_id text default null,
  p_platform text default 'web',
  p_business_id text default null,
  p_destination_id text default null,
  p_experience_id text default null
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
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
$$;

create or replace function public.submit_feedback(
  p_feature text,
  p_rating smallint,
  p_anonymous_id text,
  p_platform text default 'web',
  p_usefulness smallint default null,
  p_comment text default null,
  p_language text default null,
  p_entity_type text default null,
  p_entity_id text default null
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
begin
  if p_anonymous_id is null or char_length(p_anonymous_id) not between 8 and 120 then
    raise exception 'anonymous_id inválido' using errcode = '22023';
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
$$;

revoke all on function public.track_event(text, text, text, text, text, text, text, text, text, jsonb, jsonb) from public;
revoke all on function public.track_commercial_action(text, text, text, text, text, text, text) from public;
revoke all on function public.submit_feedback(text, smallint, text, text, smallint, text, text, text, text) from public;
grant execute on function public.track_event(text, text, text, text, text, text, text, text, text, jsonb, jsonb) to anon, authenticated, service_role;
grant execute on function public.track_commercial_action(text, text, text, text, text, text, text) to anon, authenticated, service_role;
grant execute on function public.submit_feedback(text, smallint, text, text, smallint, text, text, text, text) to anon, authenticated, service_role;

-- Activación por actor ------------------------------------------------------------
create or replace view public.v_actor_activation
with (security_invoker = true) as
select
  public.analytics_actor_key(e.user_id, e.legacy_uid, e.anonymous_id) as actor_key,
  min(e.occurred_at) as first_seen_at,
  min(e.occurred_at) filter (where t.is_activation) as activated_at,
  count(*) as events_total,
  count(distinct date_trunc('day', e.occurred_at)) as active_days
from public.analytics_events e
join public.analytics_event_types t on t.name = e.event_name
group by 1;
revoke all on public.v_actor_activation from anon, authenticated;
grant select on public.v_actor_activation to service_role;

-- KPIs ----------------------------------------------------------------------------
create or replace function public.kpi_dashboard(
  p_from timestamptz default now() - interval '30 days',
  p_to timestamptz default now()
) returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_role text := coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', '');
  r jsonb := '{}'::jsonb;
  v_num numeric;
  v_den numeric;
  kpi jsonb;
begin
  if v_role <> 'service_role' and current_user not in ('postgres', 'service_role')
     and not public.has_permission('analytics.read') then
    raise exception 'sin permiso analytics.read' using errcode = '42501';
  end if;

  -- helper inline: {value, numerator, denominator, status}
  -- Usuarios
  r := r || jsonb_build_object('users_registered', jsonb_build_object(
    'value', (select count(*) from public.profiles where status <> 'deleted_soft'),
    'new_in_period', (select count(*) from public.profiles where created_at between p_from and p_to),
    'source', 'profiles (Supabase Auth). Las cuentas aún en Firebase se cuentan al migrar.'));

  select count(*) into v_num from public.v_actor_activation where activated_at between p_from and p_to;
  select count(*) into v_den from public.v_actor_activation where first_seen_at <= p_to;
  r := r || jsonb_build_object('actors_activated', jsonb_build_object(
    'value', v_num, 'denominator_actors_seen', v_den,
    'rate_pct', case when v_den > 0 then round(v_num * 100.0 / v_den, 1) end,
    'status', case when v_den > 0 then 'ok' else 'insufficient_data' end,
    'definition', 'Actor con al menos 1 evento is_activation (favorito, viaje, BAQUI, itinerario, consulta, solicitud de reserva, experiencia publicada).'));

  r := r || jsonb_build_object('active_actors', jsonb_build_object(
    'last_7_days', (select count(distinct public.analytics_actor_key(user_id, legacy_uid, anonymous_id)) from public.analytics_events where occurred_at > p_to - interval '7 days' and occurred_at <= p_to),
    'last_30_days', (select count(distinct public.analytics_actor_key(user_id, legacy_uid, anonymous_id)) from public.analytics_events where occurred_at > p_to - interval '30 days' and occurred_at <= p_to)));

  r := r || jsonb_build_object('users_by_role', coalesce((
    select jsonb_object_agg(role_id, n) from (select role_id, count(*) n from public.user_roles group by role_id) x), '{}'::jsonb));

  -- Retención D7: actores vistos por primera vez en el período (hasta p_to - 7 días)
  -- que vuelven entre el día 7 y el 14 después de su primera visita.
  select count(*), count(*) filter (where exists (
           select 1 from public.analytics_events e
           where public.analytics_actor_key(e.user_id, e.legacy_uid, e.anonymous_id) = a.actor_key
             and e.occurred_at >= a.first_seen_at + interval '7 days'
             and e.occurred_at < a.first_seen_at + interval '14 days'))
    into v_den, v_num
  from public.v_actor_activation a
  where a.first_seen_at between p_from and p_to - interval '7 days';
  r := r || jsonb_build_object('retention_d7', jsonb_build_object(
    'value_pct', case when v_den > 0 then round(v_num * 100.0 / v_den, 1) end,
    'numerator', v_num, 'denominator', v_den,
    'status', case when v_den > 0 then 'ok' else 'insufficient_data' end));

  -- Oferta y prestadores
  r := r || jsonb_build_object('businesses', jsonb_build_object(
    'total', (select count(*) from public.businesses where deleted_at is null),
    'published', (select count(*) from public.businesses where deleted_at is null and status = 'published'),
    'verified', (select count(*) from public.businesses where deleted_at is null and verification_status = 'verified'),
    'complete_profiles', (select count(*) from public.v_business_completion_score where is_complete),
    'avg_profile_completion_pct', (select round(avg(profile_completion), 1) from public.v_business_completion_score),
    'pending_verifications', (select count(*) from public.verification_requests where status in ('pending', 'under_review', 'needs_information'))));

  r := r || jsonb_build_object('catalog', jsonb_build_object(
    'destinations_published', (select count(*) from public.destinations where status = 'published' and deleted_at is null),
    'destinations_with_source', (select count(*) from public.destinations where status = 'published' and deleted_at is null and source_name is not null),
    'experiences_published', (select count(*) from public.experiences where status = 'published'),
    'municipalities', (select count(*) from public.municipalities)));

  select count(*) into v_den from (
    select id from public.businesses where deleted_at is null and status = 'published'
    union all select id from public.experiences where status = 'published') o;
  select count(*) into v_num from (
    select id from public.businesses where deleted_at is null and status = 'published'
      and exists (select 1 from jsonb_each(sustainability_attributes) j where j.value = 'true'::jsonb)
    union all select id from public.experiences where status = 'published'
      and exists (select 1 from jsonb_each(sustainability_attributes) j where j.value = 'true'::jsonb)) o;
  r := r || jsonb_build_object('responsible_offer', jsonb_build_object(
    'value_pct', case when v_den > 0 then round(v_num * 100.0 / v_den, 1) end,
    'numerator', v_num, 'denominator', v_den,
    'status', case when v_den > 0 and v_num > 0 then 'ok' else 'insufficient_data' end,
    'definition', 'Oferta publicada (negocios + experiencias) con al menos 1 criterio responsable en sustainability_attributes.'));

  -- Reservas y conversión
  r := r || jsonb_build_object('reservations', coalesce((
    select jsonb_object_agg(status, n) from (select status, count(*) n from public.reservations
      where created_at between p_from and p_to group by status) x), '{}'::jsonb));

  select count(distinct public.analytics_actor_key(user_id, legacy_uid, anonymous_id)) into v_den
  from public.analytics_events
  where event_name in ('business_viewed', 'destination_viewed', 'experience_viewed') and occurred_at between p_from and p_to;
  select count(distinct public.analytics_actor_key(user_id, legacy_uid, anonymous_id)) into v_num
  from public.commercial_actions where is_qualified and occurred_at between p_from and p_to;
  r := r || jsonb_build_object('commercial_conversion', jsonb_build_object(
    'value_pct', case when v_den > 0 then round(v_num * 100.0 / v_den, 1) end,
    'numerator_actors_with_qualified_action', v_num,
    'denominator_exposed_actors', v_den,
    'qualified_actions_total', (select count(*) from public.commercial_actions where is_qualified and occurred_at between p_from and p_to),
    'by_type', coalesce((select jsonb_object_agg(action_type, n) from (select action_type, count(*) n from public.commercial_actions
                 where occurred_at between p_from and p_to group by action_type) x), '{}'::jsonb),
    'status', case when v_den > 0 then 'ok' else 'insufficient_data' end,
    'definition', 'Actores con al menos 1 acción comercial calificada / actores expuestos a una ficha (negocio, destino o experiencia) en el período x 100.'));

  -- Feedback
  select count(*), count(*) filter (where rating >= 4) into v_den, v_num
  from public.user_feedback where created_at between p_from and p_to;
  r := r || jsonb_build_object('feedback', jsonb_build_object(
    'total', v_den, 'positive', v_num,
    'positive_pct', case when v_den > 0 then round(v_num * 100.0 / v_den, 1) end,
    'avg_rating', (select round(avg(rating), 2) from public.user_feedback where created_at between p_from and p_to),
    'status', case when v_den > 0 then 'ok' else 'insufficient_data' end));

  -- BAQUI
  r := r || jsonb_build_object('baqui', jsonb_build_object(
    'sessions', (select count(*) from public.ai_sessions where created_at between p_from and p_to),
    'answers', (select count(*) from public.ai_messages where role = 'assistant' and created_at between p_from and p_to),
    'avg_latency_ms', (select round(avg(latency_ms)) from public.ai_messages where role = 'assistant' and created_at between p_from and p_to),
    'tokens', (select coalesce(sum(tokens_used), 0) from public.ai_messages where created_at between p_from and p_to),
    'answers_with_sources', (select count(distinct message_id) from public.ai_message_sources s
                             join public.ai_messages m on m.id = s.message_id where m.created_at between p_from and p_to),
    'status', case when exists (select 1 from public.ai_messages where created_at between p_from and p_to) then 'ok' else 'insufficient_data' end));

  return jsonb_build_object('period', jsonb_build_object('from', p_from, 'to', p_to), 'generated_at', now(), 'kpis', r);
end;
$$;
revoke all on function public.kpi_dashboard(timestamptz, timestamptz) from public, anon;
grant execute on function public.kpi_dashboard(timestamptz, timestamptz) to authenticated, service_role;
comment on function public.kpi_dashboard is 'KPIs SMART calculados en el backend (Ops Center, Analítica / Impacto). Requiere analytics.read o service_role.';
