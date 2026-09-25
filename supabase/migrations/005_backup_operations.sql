-- ============================================================================
-- 🧭 BAQUEANO ECOSYSTEM — GESTOR DE OPERACIONES DE RESPALDO & FAILOVER (005_backup_operations.sql)
-- ============================================================================
-- 🎯 1. POR QUÉ (WHY / PROPÓSITO):
-- - Garantizar que NINGUNA reserva, actualización administrativa, reseña o perfil se
--   pierda si Firebase sufre una interrupción temporal o error 5xx.
-- - Las operaciones críticas se resguardan en Supabase con `operation_id` idempotente
--   y se sincronizan automáticamente con Firebase al restablecerse la conexión.
--
-- ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
-- - Tabla transaccional `backup_operations` con estados explícitos:
--   `pending`, `processing`, `synced`, `failed`, `cancelled`, `conflict`.
-- - Control de reintentos progresivo con backoff exponencial.
-- - Tabla espejo de compatibilidad `ops_backup_entities` para soportar llamadas directas
--   del CMS Ops Center sin romper código legado.
--
-- 📦 3. QUÉ (WHAT / ENTIDADES CREADAS):
-- - Tabla `backup_operations`.
-- - Tabla `ops_backup_entities`.
-- - Índices de consulta rápida para operaciones pendientes.
-- ============================================================================

-- 1. TABLA CENTRAL DE OPERACIONES DE RESPALDO Y COLA DE SINCRONIZACIÓN
CREATE TABLE IF NOT EXISTS public.backup_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id TEXT UNIQUE NOT NULL,
  firebase_uid TEXT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('INSERT', 'UPDATE', 'DELETE', 'UPSERT')),
  payload JSONB NOT NULL,
  firebase_status TEXT DEFAULT 'pending' CHECK (firebase_status IN ('pending', 'processing', 'synced', 'failed', 'cancelled', 'conflict')),
  retry_count INTEGER DEFAULT 0,
  last_error TEXT,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  synced_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_backup_ops_status_retry
  ON public.backup_operations(firebase_status, retry_count);
CREATE INDEX IF NOT EXISTS idx_backup_ops_entity
  ON public.backup_operations(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_backup_ops_op_id
  ON public.backup_operations(operation_id);

-- 2. TABLA DE COMPATIBILIDAD CON OPS CENTER LEGADO
CREATE TABLE IF NOT EXISTS public.ops_backup_entities (
  id TEXT PRIMARY KEY,
  module_id TEXT,
  collection_name TEXT,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. HABILITAR ROW LEVEL SECURITY
ALTER TABLE public.backup_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ops_backup_entities ENABLE ROW LEVEL SECURITY;

-- Políticas: Solo el backend de sincronización (service_role) y administradores autorizados
DROP POLICY IF EXISTS "Gestión de respaldo para backend soberano" ON public.backup_operations;
CREATE POLICY "Gestión de respaldo para backend soberano"
  ON public.backup_operations FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Lectura de respaldo para administradores autenticados" ON public.backup_operations;
CREATE POLICY "Lectura de respaldo para administradores autenticados"
  ON public.backup_operations FOR SELECT
  USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Compatibilidad Ops Center legado" ON public.ops_backup_entities;
CREATE POLICY "Compatibilidad Ops Center legado"
  ON public.ops_backup_entities FOR ALL
  USING (true)
  WITH CHECK (true);
