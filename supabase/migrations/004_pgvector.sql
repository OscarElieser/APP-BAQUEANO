-- ============================================================================
-- 🧭 BAQUEANO ECOSYSTEM — EXTENSIÓN VECTORIAL & RAG SOSTENIBLE (004_pgvector.sql)
-- ============================================================================
-- 🎯 1. POR QUÉ (WHY / PROPÓSITO):
-- - Fundamentar las respuestas de la Inteligencia Artificial (Baqueano AI / Gemini)
--   en documentos fácticos comprobados de Nicaragua (leyes INTUR 1210/1211, tarifas
--   campesinas, reservas naturales, alertas de senderos y cultura ancestral).
-- - Erradicar alucinaciones mediante Retrieval-Augmented Generation (RAG).
--
-- ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
-- - Activa la extensión nativa `vector` (pgvector).
-- - Crea la tabla `knowledge_documents` con columna `embedding vector(768)` (dimensión
--   estándar de Google Gemini `text-embedding-004`).
-- - Índice HNSW (Hierarchical Navigable Small World) para búsqueda por similitud coseno
--   con latencia inferior a 50ms.
-- - Función RPC `match_knowledge_documents` para recuperar los fragmentos más relevantes.
--
-- 📦 3. QUÉ (WHAT / ENTIDADES CREADAS):
-- - Extensión `vector`.
-- - Tabla `knowledge_documents`.
-- - Función `match_knowledge_documents`.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- 1. TABLA DE DOCUMENTOS DE CONOCIMIENTO TERRITORIAL
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT,
  department TEXT,
  municipality TEXT,
  category TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding vector(768),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ÍNDICE VECTORIAL HNSW PARA SIMILITUD COSENO
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_hnsw
  ON public.knowledge_documents
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- 3. HABILITAR RLS
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura pública de conocimiento verificado" ON public.knowledge_documents;
CREATE POLICY "Lectura pública de conocimiento verificado"
  ON public.knowledge_documents FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Escritura de conocimiento restringida a backend de ingestión" ON public.knowledge_documents;
CREATE POLICY "Escritura de conocimiento restringida a backend de ingestión"
  ON public.knowledge_documents FOR ALL
  USING (auth.role() = 'service_role');

-- 4. FUNCIÓN RPC: RECUPERACIÓN VECTORIAL CON SIMILITUD COSENO
CREATE OR REPLACE FUNCTION public.match_knowledge_documents(
  query_embedding vector(768),
  match_threshold FLOAT DEFAULT 0.65,
  match_count INT DEFAULT 5,
  filter_department TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  source TEXT,
  department TEXT,
  category TEXT,
  metadata JSONB,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    kd.id,
    kd.title,
    kd.content,
    kd.source,
    kd.department,
    kd.category,
    kd.metadata,
    1 - (kd.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_documents kd
  WHERE kd.embedding IS NOT NULL
    AND (filter_department IS NULL OR kd.department ILIKE '%' || filter_department || '%')
    AND 1 - (kd.embedding <=> query_embedding) > match_threshold
  ORDER BY kd.embedding <=> query_embedding ASC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public, extensions;

