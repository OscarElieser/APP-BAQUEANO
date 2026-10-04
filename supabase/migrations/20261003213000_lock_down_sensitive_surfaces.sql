-- ============================================================================
-- 🧭 BAQUEANO — CIERRE DE SUPERFICIES SENSIBLES
-- ============================================================================
--
-- 🎯 POR QUÉ (WHY / PROPÓSITO):
-- - Impedir que clientes anónimos o autenticados alteren multimedia oficial,
--   evidencia de auditoría, telemetría o réplicas operativas.
-- - Preservar Firestore como fuente primaria y Supabase como espejo completo
--   administrado exclusivamente por backends confiables.
--
-- ⚙️ CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
-- - Elimina políticas históricas permisivas sin reescribir migraciones ya
--   aplicadas, manteniendo una evolución reproducible y auditable.
-- - Revoca privilegios de cliente sobre tablas sensibles y conserva el acceso
--   de `service_role`, cuya clave nunca debe exponerse en aplicaciones públicas.
-- - Conserva la lectura pública del bucket `baqueano-media`; solo se bloquean
--   creación de buckets y mutaciones de objetos desde roles cliente.
--
-- 📦 QUÉ (WHAT / ENTREGABLES):
-- - Storage público de solo lectura para visitantes.
-- - Auditoría, telemetría y colas/espejos operativos reservados al backend.
-- - Base segura para mover cualquier operación administrativa restante a una
--   Function autenticada con Firebase antes de habilitarla nuevamente.
-- ============================================================================

-- Storage: `service_role` omite RLS; ningún cliente necesita políticas de
-- escritura. La política pública de lectura de objetos se conserva intacta.
DROP POLICY IF EXISTS "Inserción autorizada en baqueano-media" ON storage.objects;
DROP POLICY IF EXISTS "Actualización autorizada en baqueano-media" ON storage.objects;
DROP POLICY IF EXISTS "Eliminación autorizada en baqueano-media" ON storage.objects;
DROP POLICY IF EXISTS "Creación de buckets" ON storage.buckets;

-- Los registros de auditoría contienen PII y deben ser inmutables desde el
-- navegador. Toda lectura, inserción o retención se ejecuta en backend.
DROP POLICY IF EXISTS "Acceso total a audit_logs" ON public.audit_logs;
REVOKE ALL ON TABLE public.audit_logs FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.audit_logs TO service_role;

-- La telemetría puede aceptar eventos únicamente mediante un endpoint con
-- validación, límites de frecuencia y minimización de datos.
DROP POLICY IF EXISTS "Permitir insercion de telemetria publica" ON public.traffic_sessions;
DROP POLICY IF EXISTS "Permitir lectura de telemetria" ON public.traffic_sessions;
DROP POLICY IF EXISTS "Permitir eliminacion administrativa de telemetria" ON public.traffic_sessions;
REVOKE ALL ON TABLE public.traffic_sessions FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.traffic_sessions TO service_role;

-- Las operaciones de respaldo son internas. Un usuario autenticado no equivale
-- a un operador autorizado y no debe observar ni alterar payloads del espejo.
DROP POLICY IF EXISTS "Gestión de respaldo para backend soberano" ON public.backup_operations;
DROP POLICY IF EXISTS "Lectura de respaldo para administradores autenticados" ON public.backup_operations;
DROP POLICY IF EXISTS "Compatibilidad Ops Center legado" ON public.ops_backup_entities;
REVOKE ALL ON TABLE public.backup_operations FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.ops_backup_entities FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.backup_operations, public.ops_backup_entities TO service_role;

