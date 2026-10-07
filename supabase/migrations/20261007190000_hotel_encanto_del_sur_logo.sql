-- ============================================================================
-- 🧭 BAQUEANO — HOTEL ENCANTO DEL SUR: LOGO ORIGINAL
-- ============================================================================
-- 🎯 POR QUÉ: el propietario entregó (2026-10-07) el logo original del hotel; va como protagonista
--    de la ficha (BAQUEANO solo firma con el sello "Disponible en BAQUEANO").
-- ⚙️ CÓMO: archivo website/assets/images/negocios/hotel-encanto-del-sur/logo.webp (600×400); se
--    anota en attributes.logo. cover_image no se toca (es para foto del lugar, no para el logo).
-- 📦 QUÉ: UPDATE de una sola fila por id (sin borrar nada).
-- ============================================================================
update public.businesses
set attributes = attributes || jsonb_build_object('logo', jsonb_build_object(
      'status', 'received',
      'src', 'assets/images/negocios/hotel-encanto-del-sur/logo.webp',
      'source', 'Logo original entregado por el propietario',
      'received_at', '2026-10-07')),
    updated_by = 'owner:baqueano'
where id = 'biz-hotel-encanto-del-sur';
