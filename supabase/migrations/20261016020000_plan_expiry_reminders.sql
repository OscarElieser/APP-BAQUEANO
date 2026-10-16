-- ============================================================================
-- 🧭 BAQUEANO — AVISOS DE VENCIMIENTO DE PLANES (plataforma, correo y WhatsApp)
-- ============================================================================
-- 🎯 POR QUÉ: pedido del propietario (2026-10-15): «que el sistema le mande un mensaje por
--   notificación dentro de la plataforma y además por correo y WhatsApp que pronto se le
--   acabará su plan».
-- ⚙️ CÓMO: pg_cron corre plan_reminders_run() todos los días a las 08:05 de Nicaragua.
--   Para cada plan pagado que vence en 7, 3 o 1 días, hoy, o que venció ayer:
--   - Plataforma: aviso en la campana (public.notifications, claves i18n, sin repetir gracias a
--     dedupe_key). Funciona desde el primer día.
--   - Correo: API de Resend con las claves guardadas en Supabase Vault (resend_api_key y
--     resend_from). Sin claves queda «not_configured», no se inventa un envío.
--   - WhatsApp: API oficial de WhatsApp Business (Meta) con plantilla aprobada (whatsapp_token,
--     whatsapp_phone_id, whatsapp_template en Vault). Sin claves queda «not_configured» y el
--     Ops Center muestra el botón para enviarlo a mano.
--   Cada intento queda en plan_reminders (una vez por pedido, tipo y canal). Nada se borra.
-- 📦 QUÉ: tabla plan_reminders; funciones plan_secret, plan_html_escape, plan_reminders_run;
--   tarea pg_cron 'baqueano-plan-reminders'.
-- ============================================================================

create table if not exists public.plan_reminders (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.plan_orders(id),
  order_code text not null,
  kind text not null check (kind in ('d7', 'd3', 'd1', 'd0', 'expired')),
  channel text not null check (channel in ('platform', 'email', 'whatsapp')),
  status text not null check (status in ('sent', 'failed', 'not_configured', 'skipped')),
  detail text check (detail is null or char_length(detail) <= 500),
  created_at timestamptz not null default now(),
  unique (order_id, kind, channel)
);
create index if not exists plan_reminders_created_idx on public.plan_reminders (created_at desc);
alter table public.plan_reminders enable row level security;
revoke all on public.plan_reminders from anon, authenticated;

create or replace function public.plan_reminders_no_delete()
returns trigger language plpgsql set search_path = public as $$
begin
  raise exception 'Los avisos de planes no se borran.';
end;
$$;
drop trigger if exists plan_reminders_no_delete on public.plan_reminders;
create trigger plan_reminders_no_delete before delete on public.plan_reminders
  for each row execute function public.plan_reminders_no_delete();

-- Lee un secreto de Supabase Vault (solo funciones del servidor).
create or replace function public.plan_secret(p_name text)
returns text
language sql
security definer
set search_path = public, vault
as $$
  select nullif(trim(decrypted_secret), '') from vault.decrypted_secrets where name = p_name order by created_at desc limit 1;
$$;
revoke all on function public.plan_secret(text) from public, anon, authenticated;

create or replace function public.plan_html_escape(p text)
returns text language sql immutable as $$
  select replace(replace(replace(replace(coalesce(p, ''), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), '"', '&quot;');
$$;

create or replace function public.plan_reminders_run()
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_today date := (now() at time zone 'America/Managua')::date;
  o record;
  v_days int;
  v_kind text;
  v_plan text;
  v_date text;
  v_status text;
  v_detail text;
  v_res extensions.http_response;
  v_resend_key text := public.plan_secret('resend_api_key');
  v_resend_from text := public.plan_secret('resend_from');
  v_wa_token text := public.plan_secret('whatsapp_token');
  v_wa_phone text := public.plan_secret('whatsapp_phone_id');
  v_wa_template text := coalesce(public.plan_secret('whatsapp_template'), 'plan_por_vencer');
  v_subject text;
  v_html text;
  v_count jsonb := '{"platform":0,"email":0,"whatsapp":0}'::jsonb;
begin
  perform extensions.http_set_curlopt('CURLOPT_TIMEOUT', '15');

  for o in
    select * from public.plan_orders
    where status = 'paid' and period_end is not null
      and (period_end - v_today) between -1 and 7
  loop
    v_days := o.period_end - v_today;
    v_kind := case when v_days = 7 then 'd7' when v_days = 3 then 'd3' when v_days = 1 then 'd1'
                   when v_days = 0 then 'd0' when v_days = -1 then 'expired' else null end;
    continue when v_kind is null;
    v_plan := initcap(o.plan_code);
    v_date := to_char(o.period_end, 'DD/MM/YYYY');

    -- 1. Campana dentro de la plataforma (web; la app la recibirá al integrar la campana).
    if not exists (select 1 from public.plan_reminders where order_id = o.id and kind = v_kind and channel = 'platform') then
      if o.owner_uid is null then
        v_status := 'skipped'; v_detail := 'El pedido todavía no tiene cuenta de propietario.';
      else
        insert into public.notifications (recipient_uid, type, title_key, body_key, params, link, status, source, ref_id, dedupe_key)
        values (o.owner_uid, 'account',
          case when v_kind = 'expired' then 'plans.notify.expiredTitle' else 'plans.notify.title' end,
          case when v_kind = 'expired' then 'plans.notify.expired' when v_kind = 'd0' then 'plans.notify.today' when v_kind = 'd1' then 'plans.notify.tomorrow' else 'plans.notify.body' end,
          jsonb_build_object('plan', v_plan, 'days', v_days, 'date', v_date, 'business', o.business_name, 'code', o.code),
          '/planes.html#mi-plan', 'new', 'plans', o.code, 'plan:' || o.code || ':' || v_kind)
        on conflict do nothing;
        v_status := 'sent'; v_detail := null;
        v_count := jsonb_set(v_count, '{platform}', to_jsonb((v_count->>'platform')::int + 1));
      end if;
      insert into public.plan_reminders (order_id, order_code, kind, channel, status, detail) values (o.id, o.code, v_kind, 'platform', v_status, v_detail);
    end if;

    -- 2. Correo (Resend).
    if not exists (select 1 from public.plan_reminders where order_id = o.id and kind = v_kind and channel = 'email') then
      if v_resend_key is null or v_resend_from is null then
        v_status := 'not_configured'; v_detail := 'Faltan resend_api_key y resend_from en Supabase Vault.';
      else
        v_subject := case when v_kind = 'expired' then 'Tu plan ' || v_plan || ' de BAQUEANO venció'
                          when v_kind = 'd0' then 'Tu plan ' || v_plan || ' de BAQUEANO vence hoy'
                          else 'Tu plan ' || v_plan || ' de BAQUEANO vence en ' || v_days || ' día' || case when v_days = 1 then '' else 's' end end;
        v_html := '<div style="font-family:Arial,sans-serif;font-size:15px;color:#0D1B2A;max-width:560px">'
          || '<img src="https://baqueanonicaragua.com/assets/images/LOGOS/baqueano_logo_horizontal_negro.png" alt="BAQUEANO" width="180" style="margin:0 0 16px">'
          || '<p>Hola ' || public.plan_html_escape(o.contact_name) || ',</p>'
          || '<p>' || case when v_kind = 'expired' then 'Tu plan <strong>' || v_plan || '</strong> de «' || public.plan_html_escape(o.business_name) || '» venció el ' || v_date || '.'
                           else 'Tu plan <strong>' || v_plan || '</strong> de «' || public.plan_html_escape(o.business_name) || '» vence el <strong>' || v_date || '</strong>.' end || '</p>'
          || '<p>Para que tu local siga visible en la web y en la app de BAQUEANO, renová por WhatsApp al <a href="https://wa.me/50577976973">+505 7797 6973</a> indicando tu pedido ' || o.code || '.</p>'
          || '<p><a href="https://baqueanonicaragua.com/planes.html#mi-plan" style="display:inline-block;padding:10px 18px;background:#C2410C;color:#fff;border-radius:999px;text-decoration:none;font-weight:bold">Ver mi plan</a></p>'
          || '<p style="color:#64748B;font-size:12px">BAQUEANO Nicaragua · Managua · baqueanonicaragua.com</p></div>';
        begin
          v_res := extensions.http(('POST', 'https://api.resend.com/emails',
            array[extensions.http_header('Authorization', 'Bearer ' || v_resend_key)],
            'application/json',
            jsonb_build_object('from', v_resend_from, 'to', jsonb_build_array(o.email), 'subject', v_subject, 'html', v_html)::text)::extensions.http_request);
          v_status := case when v_res.status between 200 and 299 then 'sent' else 'failed' end;
          v_detail := case when v_status = 'sent' then null else left('HTTP ' || v_res.status || ' ' || coalesce(v_res.content, ''), 500) end;
        exception when others then
          v_status := 'failed'; v_detail := left(sqlerrm, 500);
        end;
        if v_status = 'sent' then v_count := jsonb_set(v_count, '{email}', to_jsonb((v_count->>'email')::int + 1)); end if;
      end if;
      insert into public.plan_reminders (order_id, order_code, kind, channel, status, detail) values (o.id, o.code, v_kind, 'email', v_status, v_detail);
    end if;

    -- 3. WhatsApp (API oficial de WhatsApp Business, plantilla aprobada por Meta).
    if not exists (select 1 from public.plan_reminders where order_id = o.id and kind = v_kind and channel = 'whatsapp') then
      if v_wa_token is null or v_wa_phone is null then
        v_status := 'not_configured'; v_detail := 'Faltan whatsapp_token y whatsapp_phone_id en Supabase Vault (WhatsApp Business API). Se puede enviar a mano desde el Ops Center.';
      else
        begin
          v_res := extensions.http(('POST', 'https://graph.facebook.com/v20.0/' || v_wa_phone || '/messages',
            array[extensions.http_header('Authorization', 'Bearer ' || v_wa_token)],
            'application/json',
            jsonb_build_object(
              'messaging_product', 'whatsapp',
              'to', regexp_replace(o.phone, '\D', '', 'g'),
              'type', 'template',
              'template', jsonb_build_object(
                'name', v_wa_template,
                'language', jsonb_build_object('code', 'es'),
                'components', jsonb_build_array(jsonb_build_object('type', 'body', 'parameters', jsonb_build_array(
                  jsonb_build_object('type', 'text', 'text', o.contact_name),
                  jsonb_build_object('type', 'text', 'text', v_plan),
                  jsonb_build_object('type', 'text', 'text', v_date)))))
            )::text)::extensions.http_request);
          v_status := case when v_res.status between 200 and 299 then 'sent' else 'failed' end;
          v_detail := case when v_status = 'sent' then null else left('HTTP ' || v_res.status || ' ' || coalesce(v_res.content, ''), 500) end;
        exception when others then
          v_status := 'failed'; v_detail := left(sqlerrm, 500);
        end;
        if v_status = 'sent' then v_count := jsonb_set(v_count, '{whatsapp}', to_jsonb((v_count->>'whatsapp')::int + 1)); end if;
      end if;
      insert into public.plan_reminders (order_id, order_code, kind, channel, status, detail) values (o.id, o.code, v_kind, 'whatsapp', v_status, v_detail);
    end if;
  end loop;

  return jsonb_build_object('ran_at', now(), 'sent', v_count);
end;
$$;
revoke all on function public.plan_reminders_run() from public, anon, authenticated;
grant execute on function public.plan_reminders_run() to service_role;

-- Todos los días a las 08:05 de Nicaragua (14:05 UTC).
do $$
begin
  if exists (select 1 from cron.job where jobname = 'baqueano-plan-reminders') then
    perform cron.unschedule('baqueano-plan-reminders');
  end if;
  perform cron.schedule('baqueano-plan-reminders', '5 14 * * *', 'select public.plan_reminders_run()');
end;
$$;
