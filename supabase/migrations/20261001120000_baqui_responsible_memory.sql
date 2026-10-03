-- ============================================================================
-- BAQUEANO — MEMORIA Y APRENDIZAJE RESPONSABLE DE BAQÜI
-- ============================================================================
-- 🎯 POR QUÉ: recordar viajes y detectar vacíos mejora BAQÜI, pero ningún dato
--    oficial debe cambiar sin trazabilidad, consentimiento y revisión humana.
-- ⚙️ CÓMO: separa memoria de viaje, candidatos, feedback y vacíos; RLS bloquea
--    escritura pública y el backend verifica Firebase antes de usar service_role.
-- 📦 QUÉ: cuatro tablas auditables, estados controlados, índices y políticas de
--    lectura privada que preparan Nicaragua como primer perfil territorial.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.baqui_trip_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_uid TEXT, country_code TEXT NOT NULL DEFAULT 'NI',
  language TEXT NOT NULL DEFAULT 'es' CHECK (language IN ('es','en','fr','it','pt','de')),
  session_id TEXT NOT NULL, trip_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  consented_at TIMESTAMPTZ, expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id)
);

CREATE TABLE IF NOT EXISTS public.knowledge_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), country_code TEXT NOT NULL DEFAULT 'NI',
  entity_type TEXT NOT NULL, entity_id TEXT, field TEXT NOT NULL, proposed_value JSONB NOT NULL,
  source_type TEXT NOT NULL, source_url TEXT, source_id TEXT, confidence NUMERIC(4,3) CHECK (confidence BETWEEN 0 AND 1),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(), status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by TEXT, reviewed_at TIMESTAMPTZ, UNIQUE (country_code, entity_type, entity_id, field, source_type, source_id)
);

CREATE TABLE IF NOT EXISTS public.baqui_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_uid TEXT, session_id TEXT,
  response_id TEXT, feedback_type TEXT NOT NULL CHECK (feedback_type IN ('helpful','incorrect','outdated','irrelevant')),
  comment TEXT CHECK (length(comment) <= 1000), context JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.baqui_knowledge_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), country_code TEXT NOT NULL DEFAULT 'NI',
  topic TEXT NOT NULL, region TEXT, query_count INTEGER NOT NULL DEFAULT 1 CHECK (query_count > 0),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewing','resolved','dismissed')),
  first_detected_at TIMESTAMPTZ NOT NULL DEFAULT now(), last_detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (country_code, topic, region)
);

CREATE INDEX IF NOT EXISTS idx_baqui_trip_memory_user ON public.baqui_trip_memory(user_uid, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_candidates_review ON public.knowledge_candidates(status, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_baqui_feedback_type ON public.baqui_feedback(feedback_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_baqui_knowledge_gaps_priority ON public.baqui_knowledge_gaps(status, priority, query_count DESC);

ALTER TABLE public.baqui_trip_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.baqui_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.baqui_knowledge_gaps ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.baqui_trip_memory, public.knowledge_candidates, public.baqui_feedback, public.baqui_knowledge_gaps FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.baqui_trip_memory, public.knowledge_candidates, public.baqui_feedback, public.baqui_knowledge_gaps TO service_role;
