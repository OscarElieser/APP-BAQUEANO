-- ============================================================================
-- 📅 BAQUEANO — INGRESO OPERATIVO DE RESERVAS POR TELÉFONO Y WHATSAPP
-- ============================================================================
-- 🎯 POR QUÉ:
-- - Las solicitudes creadas desde Android/web ya eran trazables, pero una llamada
--   o conversación de WhatsApp atendida por el equipo quedaba fuera del sistema.
-- - Ops Center necesita mostrar cada solicitud real sin inventar reservas ni
--   confundir una conversación con una reserva confirmada.
--
-- ⚙️ CÓMO:
-- - Se amplía únicamente el dominio de `channel`; el acceso continúa cerrado a
--   clientes públicos mediante RLS y la Edge Function valida identidad/RBAC.
-- - No se altera precio ni pago: siguen acordándose directamente con el negocio.
-- - La restricción se reemplaza dentro de una transacción y conserva los canales
--   existentes (`android`, `web`) junto con `phone` y `whatsapp`.
--
-- 📦 QUÉ:
-- - `public.reservations.channel` acepta Android, web, teléfono y WhatsApp.
-- ============================================================================

begin;

alter table public.reservations
  drop constraint if exists reservations_channel_check;

alter table public.reservations
  add constraint reservations_channel_check
  check (channel in ('android', 'web', 'phone', 'whatsapp'));

comment on column public.reservations.channel is
  'Canal comprobado de ingreso: android, web, phone o whatsapp.';

commit;
