-- ============================================================================
-- 📅 BAQUEANO — RESERVAS POR CONTACTO DIRECTO (WhatsApp / teléfono)
-- ============================================================================
-- 🎯 POR QUÉ: BAQUEANO no tiene pasarela de pago (directiva del propietario,
--    2026-10-05). La reserva es una SOLICITUD trazable: el viajero la registra,
--    contacta al negocio verificado por WhatsApp o llamada y el precio/pago se
--    acuerdan directamente con el negocio. Ops Center sigue el estado.
-- ⚙️ CÓMO: cambio solo aditivo sobre public.reservations (0 filas): columnas de
--    contacto, origen e historial. Se conservan RLS ("Solo servidor") y los
--    estados existentes: pending (solicitud enviada) → confirmed / rejected /
--    cancelled / completed. `total_price` queda nulo: la App no fija precios.
-- 📦 QUÉ: contact_name, contact_phone, destination_name, channel, history,
--    handled_by, handled_at + índice por fecha.
-- ============================================================================

alter table public.reservations
  add column if not exists contact_name text check (contact_name is null or char_length(contact_name) <= 80),
  add column if not exists contact_phone text check (contact_phone is null or contact_phone ~ '^[0-9+ ()-]{7,20}$'),
  add column if not exists destination_name text check (destination_name is null or char_length(destination_name) <= 120),
  add column if not exists channel text not null default 'android' check (channel in ('android', 'web')),
  add column if not exists history jsonb not null default '[]'::jsonb,
  add column if not exists handled_by text,
  add column if not exists handled_at timestamptz;

create index if not exists idx_reservations_created_at on public.reservations (created_at desc);

comment on table public.reservations is
  'Solicitudes de reserva por contacto directo (sin pago en línea). Acceso solo vía Edge Function baqueano-reservas.';
