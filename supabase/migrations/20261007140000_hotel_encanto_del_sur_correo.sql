-- ============================================================================
-- 🧭 BAQUEANO — HOTEL ENCANTO DEL SUR: CORREO
-- ============================================================================
-- 🎯 POR QUÉ: el propietario pidió (2026-10-07) publicar también el correo del hotel.
-- ⚙️ CÓMO: se toma de la publicidad del hotel enviada por el propietario como referencia
--    (encantodelsursjs@gmail.com). Queda anotada la fuente y que debe confirmarse, porque una
--    marca de agua tapa parte del texto en esa imagen.
-- 📦 QUÉ: UPDATE de una sola fila por id (sin borrar nada).
-- ============================================================================
update public.businesses
set email = 'encantodelsursjs@gmail.com',
    attributes = attributes || jsonb_build_object('email_source', jsonb_build_object(
      'source', 'Publicidad del hotel enviada por el propietario',
      'checked_at', '2026-10-07',
      'status', 'confirmar con el propietario')),
    updated_by = 'owner:baqueano'
where id = 'biz-hotel-encanto-del-sur';
