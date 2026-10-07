-- ============================================================================
-- 🧭 BAQUEANO — HOTEL ENCANTO DEL SUR: TELÉFONO
-- ============================================================================
-- 🎯 POR QUÉ: el propietario pidió (2026-10-07) agregar el teléfono 2568 2222 del hotel.
-- ⚙️ CÓMO: phone pasa a ser el teléfono para llamadas (+505 2568 2222); el WhatsApp
--    (+505 7753 2549) sigue en su columna. El valor anterior de phone (el mismo WhatsApp) queda
--    anotado en attributes.
-- 📦 QUÉ: UPDATE de una sola fila por id (sin borrar nada).
-- ============================================================================
update public.businesses
set phone = '+505 2568 2222',
    attributes = attributes || jsonb_build_object('phones', jsonb_build_object(
      'call', '+505 2568 2222',
      'whatsapp', '+505 7753 2549',
      'previous_phone', '+505 7753 2549',
      'source', 'Propietario BAQUEANO, 2026-10-07')),
    updated_by = 'owner:baqueano'
where id = 'biz-hotel-encanto-del-sur';
