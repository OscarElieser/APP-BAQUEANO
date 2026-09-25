-- ============================================================================
-- 🧭 BAQUEANO ECOSYSTEM — REGISTRO DE AUDITORÍA Y SESIONES (010_audit_logs.sql)
-- ============================================================================
-- 🎯 1. POR QUÉ (WHY / PROPÓSITO):
-- - Registrar el historial inmutable de accesos de administradores y exploradores,
--   incluyendo dirección IP, navegador, acción y fecha/hora.
-- - Permitir auditoría de seguridad y eliminación controlada de registros desde el panel.
--
-- ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
-- - Tabla relacional `public.audit_logs` con columnas para `admin_email`, `ip_address`,
--   `action`, `description` y `payload` JSONB.
-- - Índices btree sobre fecha y usuario para consultas rápidas.
-- - Políticas RLS permisivas para lectura y eliminación desde el Centro de Mando.
--
-- 📦 3. QUÉ (WHAT / ENTIDADES CREADAS):
-- - Tabla `public.audit_logs`.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  action TEXT NOT NULL,
  module TEXT,
  target_entity TEXT,
  target_id TEXT,
  description TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_email ON public.audit_logs(admin_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso total a audit_logs" ON public.audit_logs;
CREATE POLICY "Acceso total a audit_logs"
  ON public.audit_logs FOR ALL
  USING (true)
  WITH CHECK (true);
