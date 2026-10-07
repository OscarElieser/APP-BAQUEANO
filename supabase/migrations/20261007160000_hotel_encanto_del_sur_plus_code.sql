-- ============================================================================
-- 🧭 BAQUEANO — HOTEL ENCANTO DEL SUR: PLUS CODE (UBICACIÓN EXACTA)
-- ============================================================================
-- 🎯 POR QUÉ: el propietario entregó (2026-10-07) el Plus Code del hotel: "742H+HX San Juan del Sur".
-- ⚙️ CÓMO: decodificado con el algoritmo abierto Open Location Code, recuperando el prefijo con la
--    referencia de San Juan del Sur → 763P742H+HX → centro 11.2514375, -85.8700625, celda de
--    0.000125° (~14 m); al volver a codificarlo da el mismo código. Las coordenadas "aproximadas"
--    anteriores (11.25015, -85.87015) quedaban 143 m al sur: se reemplazan y se conservan en
--    attributes como historial. Con precisión de Plus Code se marca 'exact' y se activa el pin.
-- 📦 QUÉ: UPDATE de una sola fila por id (sin borrar nada).
-- ============================================================================
update public.businesses
set latitude = 11.2514375,
    longitude = -85.8700625,
    location_precision = 'exact',
    map_ready = true,
    attributes = attributes || jsonb_build_object('location', (attributes->'location') || jsonb_build_object(
      'plus_code', '763P742H+HX',
      'plus_code_short', '742H+HX San Juan del Sur',
      'coordinates', 'exactas: centro del Plus Code entregado por el propietario (celda ~14 m), 2026-10-07',
      'previous_coordinates', jsonb_build_object('latitude', 11.25015, 'longitude', -85.87015, 'precision', 'approximate', 'note', '143 m al sur del Plus Code'))),
    updated_by = 'owner:baqueano'
where id = 'biz-hotel-encanto-del-sur';
