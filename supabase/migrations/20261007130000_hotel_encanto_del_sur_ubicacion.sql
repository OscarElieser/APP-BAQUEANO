-- ============================================================================
-- 🧭 BAQUEANO — HOTEL ENCANTO DEL SUR: UBICACIÓN
-- ============================================================================
-- 🎯 POR QUÉ: el propietario entregó (2026-10-07) el enlace de Google Maps del hotel:
--    https://maps.app.goo.gl/zg64Cd6hWcq5psGF7
-- ⚙️ CÓMO: ese enlace redirige a la ficha "Hotel Encanto del Sur, Av. Gaspar Garcia Laviana,
--    San Juan del Sur 48600" (lugar de Google 0x8f75b44204ea7461:0xef9f405edf63dfac), resuelto
--    desde la base con extensions.http. La URL no trae coordenadas y la página no las expone sin
--    navegador; no se inventan. Se guarda la dirección, el enlace exacto y precisión 'address'
--    (el pin del mapa sigue apagado: map_ready exige coordenadas exactas).
-- 📦 QUÉ: UPDATE de una sola fila por id (sin borrar nada).
-- ============================================================================
update public.businesses
set address = 'Av. Gaspar García Laviana, San Juan del Sur 48600, Rivas, Nicaragua',
    location_precision = 'address',
    attributes = attributes || jsonb_build_object('location', jsonb_build_object(
      'maps_url', 'https://maps.app.goo.gl/zg64Cd6hWcq5psGF7',
      'google_place', '0x8f75b44204ea7461:0xef9f405edf63dfac',
      'source', 'Enlace de Google Maps entregado por el propietario',
      'checked_at', '2026-10-07',
      'coordinates', 'pendientes')),
    updated_by = 'owner:baqueano'
where id = 'biz-hotel-encanto-del-sur';
