-- ============================================================================
-- 🧭 BAQUEANO — Tipos de evento web del checklist 20/20 (requisito 19: analítica real)
-- ============================================================================
-- 🎯 POR QUÉ: la web enviará eventos propios (sin GA4/GTM duplicados) solo con
--   consentimiento de analítica. track_event rechaza cualquier evento fuera del
--   catálogo, así que los eventos mínimos del checklist deben existir aquí.
-- ⚙️ CÓMO: inserción aditiva e idempotente (ON CONFLICT DO NOTHING); no modifica
--   ni borra tipos existentes. login/registro de servidor siguen siendo eventos
--   de servidor (user_registered, client_allowed=false).
-- 📦 QUÉ: 7 tipos nuevos permitidos desde el cliente.
-- ============================================================================
insert into public.analytics_event_types (name, description, funnel_stage, is_activation, client_allowed) values
  ('sos_clicked', 'La persona abrió o usó un acceso SOS (sin ubicación ni datos personales).', 'engagement', false, true),
  ('testimonial_submitted', 'Envío de un testimonio para moderación.', 'retention', false, true),
  ('business_registration_submitted', 'Envío del formulario de registro de negocio (Mi Negocio).', 'acquisition', false, true),
  ('reservation_started', 'Inicio de una solicitud de reserva antes de enviarla.', 'revenue', false, true),
  ('baqui_message_sent', 'Mensaje enviado a BAQUI (solo conteo; nunca el contenido).', 'engagement', false, true),
  ('login_completed', 'Inicio de sesión completado en el cliente (informativo; la identidad la verifica el servidor).', 'activation', false, true),
  ('consent_updated', 'Cambio de preferencias de consentimiento (solo se registra si la analítica quedó aceptada).', 'engagement', false, true)
on conflict (name) do nothing;
