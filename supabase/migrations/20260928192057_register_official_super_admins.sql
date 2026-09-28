-- ============================================================================
-- BAQUEANO ECOSYSTEM - REGISTRO OFICIAL DE SUPERADMINISTRADORES
-- ============================================================================
-- POR QUE (WHY / PROPOSITO):
-- - Mantener en Supabase una fuente canonica, auditable y no editable por clientes
--   para las identidades con el nivel maximo de administracion de Baqueano.
-- - Evitar que una cuenta comun pueda elevar su rol mediante datos controlados desde
--   la aplicacion o metadatos modificables por el usuario.
--
-- COMO (HOW / ARQUITECTURA E IMPLEMENTACION):
-- - Tabla privada por RLS, con correo normalizado como clave primaria y rol cerrado.
-- - Privilegios revocados para anon/authenticated y acceso reservado a service_role.
-- - Seed idempotente mediante ON CONFLICT para poder ejecutar la migracion sin
--   duplicados y reactivar de forma determinista las cuentas oficiales.
-- - Sincronizacion defensiva de perfiles ya existentes, sin crear perfiles falsos ni
--   depender de que las tres cuentas hayan iniciado sesion previamente.
--
-- QUE (WHAT / ENTREGABLES):
-- - public.official_super_admins con los tres correos oficiales de Baqueano.
-- - Indice parcial para consultas de cuentas activas.
-- - Actualizacion de roles existentes en public.profiles a superadmin.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.official_super_admins (
  email TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'super_admin' CHECK (role = 'super_admin'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  granted_reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT official_super_admins_email_normalized
    CHECK (email = lower(btrim(email)) AND position('@' IN email) > 1)
);

CREATE INDEX IF NOT EXISTS idx_official_super_admins_active_email
  ON public.official_super_admins (email)
  WHERE is_active = true;

ALTER TABLE public.official_super_admins ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.official_super_admins FROM anon, authenticated;
GRANT ALL ON TABLE public.official_super_admins TO service_role;

INSERT INTO public.official_super_admins (email, role, is_active, granted_reason)
VALUES
  ('oscarelieser.informatica.inatec@gmail.com', 'super_admin', true, 'Cuenta fundadora oficial'),
  ('byoscarelieser@gmail.com', 'super_admin', true, 'Cuenta fundadora oficial'),
  ('vigoronmixt@gmail.com', 'super_admin', true, 'Cuenta fundadora oficial')
ON CONFLICT (email) DO UPDATE
SET role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    granted_reason = EXCLUDED.granted_reason,
    updated_at = now();

UPDATE public.profiles
SET role = 'superadmin',
    updated_at = now()
WHERE lower(btrim(email)) IN (
  'oscarelieser.informatica.inatec@gmail.com',
  'byoscarelieser@gmail.com',
  'vigoronmixt@gmail.com'
)
AND role IS DISTINCT FROM 'superadmin';
