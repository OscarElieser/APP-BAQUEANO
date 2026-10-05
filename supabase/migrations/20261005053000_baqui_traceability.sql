-- ============================================================================
-- 🧭 BAQUEANO — BAQUI: TRAZABILIDAD DE SESIONES, MENSAJES Y FUENTES RAG
-- ============================================================================
-- 🎯 POR QUÉ (auditoría BD B-5/B-7):
--   `ai_sessions`/`ai_messages` existían pero BAQUI no escribía en ellas, y no
--   había catálogo de fuentes: no se podía saber qué fuente usó BAQUI ni medir
--   su uso (KPI), latencia, tokens o proveedor.
-- ⚙️ CÓMO (aditivo):
--   - `ai_sessions`: identidad (`user_id` → profiles, `legacy_uid` Firebase),
--     idioma, canal, proveedor, modelo, contadores. `user_uid` se conserva.
--   - `ai_messages`: modelo, tokens de entrada/salida, idioma. `rag_sources` y
--     `tool_calls` JSONB se conservan (las llamadas a herramientas no tienen
--     ciclo de vida propio → JSONB; ver DATABASE_DECISIONS D-07).
--   - `rag_sources`: catálogo de fuentes (entidad interna, fuente oficial, URL)
--     con verificación y nivel de confianza; `ai_message_sources` N:N
--     mensaje↔fuente con rango (normaliza "qué fuente usó BAQUI").
--   - Minimización: el contenido de los mensajes se guarda recortado y sin
--     correos/teléfonos (lo hace la Edge Function; aquí se limita la longitud).
--   - BAQUI NO puede publicar/verificar: todo es solo servidor y las fuentes
--     nuevas nacen `verified = false`.
-- 📦 QUÉ: base de los KPIs "uso de BAQUI", "latencia real", "fuentes usadas".
-- ============================================================================

alter table public.ai_sessions
  add column if not exists user_id uuid references public.profiles(id) on delete set null,
  add column if not exists legacy_uid text,
  add column if not exists language text,
  add column if not exists channel text,
  add column if not exists provider text,
  add column if not exists model text,
  add column if not exists message_count integer not null default 0,
  add column if not exists last_message_at timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'ai_sessions_language_check') then
    alter table public.ai_sessions add constraint ai_sessions_language_check
      check (language is null or language in ('es', 'en', 'fr', 'it', 'pt', 'de'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ai_sessions_channel_check') then
    alter table public.ai_sessions add constraint ai_sessions_channel_check
      check (channel is null or channel in ('web', 'android', 'ios', 'ops'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ai_sessions_session_key_key') then
    alter table public.ai_sessions add constraint ai_sessions_session_key_key unique (session_key);
  end if;
end $$;
create index if not exists idx_ai_sessions_user on public.ai_sessions (user_id, created_at desc);
create index if not exists idx_ai_sessions_created on public.ai_sessions (created_at desc);

alter table public.ai_messages
  add column if not exists model text,
  add column if not exists tokens_input integer,
  add column if not exists tokens_output integer,
  add column if not exists language text;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'ai_messages_content_length') then
    alter table public.ai_messages add constraint ai_messages_content_length check (char_length(content) <= 4000) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ai_messages_metrics_nonneg') then
    alter table public.ai_messages add constraint ai_messages_metrics_nonneg check (
      coalesce(tokens_used, 0) >= 0 and coalesce(tokens_input, 0) >= 0 and coalesce(tokens_output, 0) >= 0
      and coalesce(latency_ms, 0) >= 0);
  end if;
end $$;
create index if not exists idx_ai_messages_created on public.ai_messages (created_at desc);

create table if not exists public.rag_sources (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('destination', 'business', 'experience', 'culture', 'emergency',
                                                    'knowledge_document', 'government_source', 'official_url', 'internal_database')),
  entity_type text,
  entity_id text,
  title text not null check (char_length(title) between 2 and 200),
  url text check (url is null or url ~ '^https?://[^ ]+$'),
  publisher text,
  language text check (language is null or language in ('es', 'en', 'fr', 'it', 'pt', 'de')),
  trust_level text not null default 'unreviewed' check (trust_level in ('official', 'verified_internal', 'community', 'unreviewed')),
  verified boolean not null default false,
  verified_at timestamptz,
  verified_by uuid references public.profiles(id) on delete set null,
  retrieved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not verified or verified_at is not null)
);
create unique index if not exists uq_rag_sources_identity
  on public.rag_sources (source_type, coalesce(entity_type, ''), coalesce(entity_id, ''), coalesce(url, ''));
comment on table public.rag_sources is 'Catálogo de fuentes que BAQUI puede citar. BAQUI consulta primero fuentes internas verificadas; nunca verifica ni publica por sí mismo.';

create table if not exists public.ai_message_sources (
  message_id uuid not null references public.ai_messages(id) on delete cascade,
  rag_source_id uuid not null references public.rag_sources(id) on delete restrict,
  rank smallint not null default 1 check (rank between 1 and 50),
  similarity numeric(5,4) check (similarity is null or similarity between 0 and 1),
  primary key (message_id, rag_source_id)
);
create index if not exists idx_ai_message_sources_source on public.ai_message_sources (rag_source_id);

alter table public.rag_sources enable row level security;
alter table public.ai_message_sources enable row level security;
do $$
declare t text;
begin
  foreach t in array array['rag_sources','ai_message_sources'] loop
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = t and policyname = 'Solo servidor (Edge Functions)') then
      execute format('create policy "Solo servidor (Edge Functions)" on public.%I as restrictive for all to anon, authenticated using (false) with check (false)', t);
    end if;
  end loop;
end $$;
revoke all on public.rag_sources, public.ai_message_sources from public, anon, authenticated;
grant all on public.rag_sources, public.ai_message_sources to service_role;

create or replace trigger trg_rag_sources_updated_at before update on public.rag_sources
  for each row execute function public.set_updated_at();

-- Registro atómico de un intercambio de BAQUI (sesión + 2 mensajes + fuentes).
create or replace function public.baqui_log_exchange(
  p_session_key text,
  p_user_id uuid,
  p_legacy_uid text,
  p_language text,
  p_channel text,
  p_provider text,
  p_model text,
  p_user_content text,
  p_assistant_content text,
  p_tokens_input integer,
  p_tokens_output integer,
  p_latency_ms integer,
  p_tool_calls jsonb default '[]'::jsonb,
  p_sources jsonb default '[]'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session uuid;
  v_message uuid;
  v_source jsonb;
  v_source_id uuid;
  v_rank smallint := 0;
begin
  if p_session_key is null or char_length(p_session_key) not between 6 and 120 then
    raise exception 'session_key inválido';
  end if;

  insert into public.ai_sessions (session_key, user_id, legacy_uid, user_uid, language, channel, provider, model, message_count, last_message_at)
  values (p_session_key, p_user_id, p_legacy_uid, p_legacy_uid, p_language, p_channel, p_provider, p_model, 2, now())
  on conflict (session_key) do update
    set message_count = public.ai_sessions.message_count + 2,
        last_message_at = now(),
        provider = excluded.provider,
        model = excluded.model,
        language = coalesce(excluded.language, public.ai_sessions.language),
        user_id = coalesce(public.ai_sessions.user_id, excluded.user_id),
        legacy_uid = coalesce(public.ai_sessions.legacy_uid, excluded.legacy_uid),
        updated_at = now()
  returning id into v_session;

  insert into public.ai_messages (session_id, role, content, language)
  values (v_session, 'user', left(coalesce(p_user_content, ''), 4000), p_language);

  insert into public.ai_messages (session_id, role, content, provider_used, model, tokens_input, tokens_output,
                                  tokens_used, latency_ms, tool_calls, rag_sources, language)
  values (v_session, 'assistant', left(coalesce(p_assistant_content, ''), 4000), p_provider, p_model,
          p_tokens_input, p_tokens_output, coalesce(p_tokens_input, 0) + coalesce(p_tokens_output, 0),
          p_latency_ms, coalesce(p_tool_calls, '[]'::jsonb), coalesce(p_sources, '[]'::jsonb), p_language)
  returning id into v_message;

  for v_source in select * from jsonb_array_elements(coalesce(p_sources, '[]'::jsonb)) loop
    exit when v_rank >= 20;
    v_rank := v_rank + 1;
    insert into public.rag_sources (source_type, entity_type, entity_id, title, url, publisher, trust_level)
    values (
      coalesce(v_source->>'source_type', 'internal_database'),
      v_source->>'entity_type', v_source->>'entity_id',
      left(coalesce(v_source->>'title', 'Fuente sin título'), 200),
      nullif(v_source->>'url', ''), v_source->>'publisher', 'unreviewed')
    on conflict (source_type, (coalesce(entity_type, '')), (coalesce(entity_id, '')), (coalesce(url, ''))) do update
      set retrieved_at = now()
    returning id into v_source_id;
    insert into public.ai_message_sources (message_id, rag_source_id, rank, similarity)
    values (v_message, v_source_id, v_rank, nullif(v_source->>'similarity', '')::numeric)
    on conflict do nothing;
  end loop;

  return v_message;
end;
$$;
revoke all on function public.baqui_log_exchange(text, uuid, text, text, text, text, text, text, text, integer, integer, integer, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.baqui_log_exchange(text, uuid, text, text, text, text, text, text, text, integer, integer, integer, jsonb, jsonb)
  to service_role;
comment on function public.baqui_log_exchange is 'Registro atómico de un intercambio de BAQUI (solo service_role desde la Edge Function baqueano-ai).';
