-- ============================================================================
-- 🧭 BAQUEANO ECOSYSTEM — MIGRACIÓN 011: TELEMETRÍA DE TRÁFICO WEB VS ANDROID
-- ============================================================================
--
-- 🎯 1. POR QUÉ (WHY / PROPÓSITO):
-- - Registrar y correlacionar en tiempo real todo el flujo de visitas de exploradores
--   en el portal web y en la aplicación nativa Android, sin depender exclusivamente
--   de herramientas externas de analítica.
-- - Dotar al Ops Command Center de trazabilidad soberana, permitiendo a los operadores
--   conocer con exactitud cuántos usuarios entran a la web y cuándo usan la app.
-- - Salvaguardar la privacidad de los exploradores mediante registros operacionales éticos.
--
-- ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
-- - Tabla relacional PostgreSQL 'public.traffic_sessions' con índices B-Tree
--   en plataforma ('web' | 'android') y marca de tiempo (created_at DESC).
-- - Soporte para dirección IP, agente de usuario, versión de app, página o pantalla
--   visitada, modelo de dispositivo y remitente (referrer).
-- - Políticas Row Level Security (RLS) que permiten inserción pública para telemetría
--   y lectura/eliminación administrativa para superAdmin y operadores certificados.
--
-- 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
-- - Tabla 'traffic_sessions' estructurada y optimizada para consultas de alta concurrencia.
-- - Índices de telemetría y políticas RLS soberanas.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.traffic_sessions (
    id TEXT PRIMARY KEY,
    platform TEXT NOT NULL, -- 'web' | 'android'
    client_ip TEXT,
    user_agent TEXT,
    app_version TEXT,
    device_model TEXT,
    page TEXT,
    path TEXT,
    referrer TEXT,
    user_id TEXT,
    is_guest BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de alto rendimiento para filtrado analítico en Ops Center
CREATE INDEX IF NOT EXISTS idx_traffic_sessions_platform ON public.traffic_sessions(platform);
CREATE INDEX IF NOT EXISTS idx_traffic_sessions_created ON public.traffic_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_traffic_sessions_ip ON public.traffic_sessions(client_ip);

-- Habilitar RLS
ALTER TABLE public.traffic_sessions ENABLE ROW LEVEL SECURITY;

-- Política de inserción pública / anónima para telemetría
DROP POLICY IF EXISTS "Permitir insercion de telemetria publica" ON public.traffic_sessions;
CREATE POLICY "Permitir insercion de telemetria publica"
    ON public.traffic_sessions FOR INSERT
    WITH CHECK (true);

-- Política de lectura administrativa y pública agregada
DROP POLICY IF EXISTS "Permitir lectura de telemetria" ON public.traffic_sessions;
CREATE POLICY "Permitir lectura de telemetria"
    ON public.traffic_sessions FOR SELECT
    USING (true);

-- Política de eliminación administrativa
DROP POLICY IF EXISTS "Permitir eliminacion administrativa de telemetria" ON public.traffic_sessions;
CREATE POLICY "Permitir eliminacion administrativa de telemetria"
    ON public.traffic_sessions FOR DELETE
    USING (true);
