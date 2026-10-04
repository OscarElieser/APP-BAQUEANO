-- ============================================================================
-- 🧭 BAQUEANO — REGISTROS EFÍMEROS DE EVIDENCIA CRUD
-- ============================================================================
--
-- 🎯 POR QUÉ (WHY / PROPÓSITO):
-- - Demostrar de forma reproducible Cliente → Azure → Supabase mediante un ciclo
--   crear, leer, actualizar y eliminar, sin tocar información turística real.
--
-- ⚙️ CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
-- - Cada ejecución usa un token aleatorio cuyo SHA-256 queda en la fila.
-- - RLS compara el hash con `x-proof-token`; solo la misma ejecución puede leer,
--   modificar o eliminar su registro, que además expira en quince minutos.
-- - Se conceden únicamente las cuatro operaciones necesarias a Data API.
--
-- 📦 QUÉ (WHAT / ENTREGABLES):
-- - Tabla aislada `sprint_evidence_records`, índice de expiración y cuatro
--   políticas RLS específicas para `anon` y `authenticated`.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.sprint_evidence_records (
  id UUID PRIMARY KEY,
  proof_hash TEXT NOT NULL CHECK (length(proof_hash) = 64),
  value TEXT NOT NULL CHECK (char_length(value) BETWEEN 1 AND 120),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version BETWEEN 1 AND 3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL CHECK (expires_at > created_at AND expires_at <= created_at + interval '15 minutes')
);

CREATE INDEX IF NOT EXISTS idx_sprint_evidence_expires_at
  ON public.sprint_evidence_records (expires_at);

ALTER TABLE public.sprint_evidence_records ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.sprint_evidence_records FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sprint_evidence_records TO anon, authenticated;
GRANT ALL ON TABLE public.sprint_evidence_records TO service_role;

DROP POLICY IF EXISTS "Evidencia crea su registro efimero" ON public.sprint_evidence_records;
CREATE POLICY "Evidencia crea su registro efimero"
  ON public.sprint_evidence_records FOR INSERT TO anon, authenticated
  WITH CHECK (
    proof_hash = encode(extensions.digest(coalesce(current_setting('request.headers', true)::jsonb ->> 'x-proof-token', ''), 'sha256'), 'hex')
    AND expires_at <= now() + interval '15 minutes'
  );

DROP POLICY IF EXISTS "Evidencia lee su registro efimero" ON public.sprint_evidence_records;
CREATE POLICY "Evidencia lee su registro efimero"
  ON public.sprint_evidence_records FOR SELECT TO anon, authenticated
  USING (
    proof_hash = encode(extensions.digest(coalesce(current_setting('request.headers', true)::jsonb ->> 'x-proof-token', ''), 'sha256'), 'hex')
    AND expires_at > now()
  );

DROP POLICY IF EXISTS "Evidencia actualiza su registro efimero" ON public.sprint_evidence_records;
CREATE POLICY "Evidencia actualiza su registro efimero"
  ON public.sprint_evidence_records FOR UPDATE TO anon, authenticated
  USING (
    proof_hash = encode(extensions.digest(coalesce(current_setting('request.headers', true)::jsonb ->> 'x-proof-token', ''), 'sha256'), 'hex')
    AND expires_at > now()
  )
  WITH CHECK (
    proof_hash = encode(extensions.digest(coalesce(current_setting('request.headers', true)::jsonb ->> 'x-proof-token', ''), 'sha256'), 'hex')
    AND expires_at > now()
  );

DROP POLICY IF EXISTS "Evidencia elimina su registro efimero" ON public.sprint_evidence_records;
CREATE POLICY "Evidencia elimina su registro efimero"
  ON public.sprint_evidence_records FOR DELETE TO anon, authenticated
  USING (
    proof_hash = encode(extensions.digest(coalesce(current_setting('request.headers', true)::jsonb ->> 'x-proof-token', ''), 'sha256'), 'hex')
    AND expires_at > now()
  );

