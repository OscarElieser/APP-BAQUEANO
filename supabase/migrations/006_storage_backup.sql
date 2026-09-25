-- ============================================================================
-- 🧭 BAQUEANO ECOSYSTEM — GESTIÓN DE RESPALDO DE STORAGE MULTIMEDIA (006_storage_backup.sql)
-- ============================================================================
-- 🎯 1. POR QUÉ (WHY / PROPÓSITO):
-- - Asegurar que todas las fotografías de cooperativas campesinas, destinos turísticos
--   y documentos del Ops Center subidos a Firebase Storage cuenten con réplica
--   verificada en Supabase Storage.
-- - Trazabilidad criptográfica mediante checksum SHA-256 para evitar corrupción de archivos.
--
-- ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
-- - Tabla `storage_backups` con estados `pending`, `backed_up`, `failed`, `missing_source`.
-- - Registro de `file_size`, `mime_type`, rutas y URLs en ambos proveedores.
-- - Buckets estructurados en Supabase Storage con políticas de seguridad.
--
-- 📦 3. QUÉ (WHAT / ENTIDADES CREADAS):
-- - Tabla `storage_backups`.
-- - Configuración de buckets oficiales de respaldo.
-- ============================================================================

-- 1. TABLA DE REGISTRO Y SEGUIMIENTO DE ARCHIVOS RESPALDADOS
CREATE TABLE IF NOT EXISTS public.storage_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_path TEXT UNIQUE NOT NULL,
  firebase_download_url TEXT,
  supabase_bucket TEXT NOT NULL DEFAULT 'baqueano-backup-images',
  supabase_path TEXT NOT NULL,
  checksum TEXT, -- Hash SHA-256
  file_size BIGINT,
  mime_type TEXT,
  backup_status TEXT DEFAULT 'pending' CHECK (backup_status IN ('pending', 'backed_up', 'failed', 'missing_source')),
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  backed_up_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_storage_backups_status
  ON public.storage_backups(backup_status);
CREATE INDEX IF NOT EXISTS idx_storage_backups_fb_path
  ON public.storage_backups(firebase_path);

-- 2. HABILITAR ROW LEVEL SECURITY
ALTER TABLE public.storage_backups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestión de réplicas solo para backend autorizado" ON public.storage_backups;
CREATE POLICY "Gestión de réplicas solo para backend autorizado"
  ON public.storage_backups FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Lectura de estado de respaldo para administradores" ON public.storage_backups;
CREATE POLICY "Lectura de estado de respaldo para administradores"
  ON public.storage_backups FOR SELECT
  USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- 3. PROVISIÓN DE BUCKETS EN SUPABASE STORAGE (SI LA TABLA storage.buckets EXISTE)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'buckets') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES
      ('baqueano-backup-images', 'baqueano-backup-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
      ('baqueano-backup-documents', 'baqueano-backup-documents', false, 20971520, ARRAY['application/pdf', 'application/json', 'text/plain']),
      ('baqueano-backup-businesses', 'baqueano-backup-businesses', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
      ('baqueano-backup-destinations', 'baqueano-backup-destinations', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
    ON CONFLICT (id) DO UPDATE SET
      public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit;
  END IF;
END $$;
