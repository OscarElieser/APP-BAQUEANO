-- ============================================================================
-- BAQUEANO — TRADUCCIONES EDITORIALES NORMALIZADAS
-- ============================================================================
-- 🎯 POR QUÉ: el contenido turístico cambia con independencia de la interfaz y
--    necesita traducción revisada sin duplicar seis columnas en cada entidad.
-- ⚙️ CÓMO: una tabla polimórfica identifica tipo, registro, campo e idioma;
--    RLS expone solo versiones publicadas y la escritura queda en service_role.
-- 📦 QUÉ: almacenamiento, índices, estados editoriales y resolver con fallback
--    idioma solicitado → español de Nicaragua → inglés.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.content_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type ~ '^[a-z][a-z0-9_]{1,63}$'),
  content_id TEXT NOT NULL CHECK (length(trim(content_id)) BETWEEN 1 AND 160),
  language TEXT NOT NULL CHECK (language IN ('es', 'en', 'fr', 'it', 'pt', 'de')),
  field TEXT NOT NULL CHECK (field IN ('title', 'short_description', 'description', 'seo_title', 'seo_description')),
  value TEXT NOT NULL CHECK (length(trim(value)) > 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published')),
  source_language TEXT NOT NULL DEFAULT 'es' CHECK (source_language IN ('es', 'en', 'fr', 'it', 'pt', 'de')),
  ai_suggested BOOLEAN NOT NULL DEFAULT false,
  reviewed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (content_type, content_id, language, field),
  CHECK (status <> 'published' OR published_at IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_content_translations_lookup
  ON public.content_translations (content_type, content_id, field, language, status);

ALTER TABLE public.content_translations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura pública de traducciones publicadas" ON public.content_translations;
CREATE POLICY "Lectura pública de traducciones publicadas"
  ON public.content_translations FOR SELECT TO anon, authenticated
  USING (status = 'published');

REVOKE ALL ON public.content_translations FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.content_translations TO anon, authenticated, service_role;
GRANT ALL ON public.content_translations TO service_role;

CREATE OR REPLACE FUNCTION public.resolve_content_translation(
  requested_content_type TEXT,
  requested_content_id TEXT,
  requested_field TEXT,
  requested_language TEXT DEFAULT 'es'
)
RETURNS TABLE (value TEXT, resolved_language TEXT, used_fallback BOOLEAN)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT translation.value,
         translation.language AS resolved_language,
         translation.language <> requested_language AS used_fallback
  FROM public.content_translations AS translation
  WHERE translation.content_type = requested_content_type
    AND translation.content_id = requested_content_id
    AND translation.field = requested_field
    AND translation.status = 'published'
    AND translation.language IN (requested_language, 'es', 'en')
  ORDER BY CASE translation.language
    WHEN requested_language THEN 0
    WHEN 'es' THEN 1
    WHEN 'en' THEN 2
    ELSE 3
  END
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.resolve_content_translation(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_content_translation(TEXT, TEXT, TEXT, TEXT)
  TO anon, authenticated, service_role;
