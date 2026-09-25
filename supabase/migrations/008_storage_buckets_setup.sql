-- ============================================================================
-- 🧭 BAQUEANO ECOSYSTEM — CONFIGURACIÓN DE STORAGE PERIMETRAL (008_storage_buckets_setup.sql)
-- ============================================================================
-- 🎯 1. POR QUÉ (WHY / PROPÓSITO):
-- - Garantizar que todas las imágenes, videos, audios y documentos subidos desde el
--   Centro de Operaciones (admin.html) se guarden de forma soberana en Supabase Storage.
-- - Evitar bloqueos por cuotas o facturación de Firebase Storage.
--
-- ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
-- - Creación idempotente del bucket público `baqueano-media` en `storage.buckets`.
-- - Políticas de seguridad RLS en `storage.objects` para inserción, lectura y gestión.
--
-- 📦 3. QUÉ (WHAT / RECURSOS CREADOS):
-- - Bucket `baqueano-media` (público, límite 50MB por archivo).
-- - Políticas RLS universales para el ecosistema Baqueano.
-- ============================================================================

-- 1. CREACIÓN DEL BUCKET PRINCIPAL DE MULTIMEDIA
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'baqueano-media',
  'baqueano-media',
  true,
  52428800, -- 50 MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif',
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a',
    'video/mp4', 'video/webm', 'video/quicktime',
    'application/pdf', 'application/json', 'text/plain',
    'application/vnd.android.package-archive'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. POLÍTICAS DE ACCESO EN storage.objects
DROP POLICY IF EXISTS "Lectura pública de baqueano-media" ON storage.objects;
CREATE POLICY "Lectura pública de baqueano-media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'baqueano-media');

DROP POLICY IF EXISTS "Inserción autorizada en baqueano-media" ON storage.objects;
CREATE POLICY "Inserción autorizada en baqueano-media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'baqueano-media');

DROP POLICY IF EXISTS "Actualización autorizada en baqueano-media" ON storage.objects;
CREATE POLICY "Actualización autorizada en baqueano-media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'baqueano-media');

DROP POLICY IF EXISTS "Eliminación autorizada en baqueano-media" ON storage.objects;
CREATE POLICY "Eliminación autorizada en baqueano-media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'baqueano-media');
