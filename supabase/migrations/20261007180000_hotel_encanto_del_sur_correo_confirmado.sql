-- ============================================================================
-- 🧭 BAQUEANO — HOTEL ENCANTO DEL SUR: CORREO CONFIRMADO
-- ============================================================================
-- 🎯 POR QUÉ: el propietario confirmó (2026-10-07) que encantodelsursjs@gmail.com es el correo
--    correcto (se había tomado de una imagen con marca de agua y quedó "por confirmar").
-- ⚙️ CÓMO: solo cambia el estado de la fuente del correo en attributes.
-- 📦 QUÉ: UPDATE de una sola fila por id (sin borrar nada).
-- ============================================================================
update public.businesses
set attributes = attributes || jsonb_build_object('email_source', (attributes->'email_source') || jsonb_build_object(
      'status', 'confirmado por el propietario', 'confirmed_at', '2026-10-07')),
    updated_by = 'owner:baqueano'
where id = 'biz-hotel-encanto-del-sur';
