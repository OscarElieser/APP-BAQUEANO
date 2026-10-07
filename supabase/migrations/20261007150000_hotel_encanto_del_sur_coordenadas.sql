-- ============================================================================
-- 🧭 BAQUEANO — HOTEL ENCANTO DEL SUR: COORDENADAS
-- ============================================================================
-- 🎯 POR QUÉ: el propietario entregó (2026-10-07) las coordenadas del hotel:
--    11.25015, -85.87015 (11° 15' 00.5" N, 85° 52' 12.5" W), descritas como "aproximadas".
-- ⚙️ CÓMO: verificado antes de guardar: grados/min/seg coinciden (diferencia de unos 20 cm), el
--    punto está dentro del límite de San Juan del Sur (bbox geoBoundaries) y a unos 300 m del Hotel
--    Victoriano, ya registrado. Se respeta la palabra del propietario: precisión 'approximate',
--    así que map_ready sigue en false (la regla del mapa exige 'exact'). El trigger trg_sync_businesses_geom
--    genera geom.
-- 📦 QUÉ: UPDATE de una sola fila por id (sin borrar nada).
-- ============================================================================
update public.businesses
set latitude = 11.25015,
    longitude = -85.87015,
    location_precision = 'approximate',
    attributes = attributes || jsonb_build_object('location', (attributes->'location') || jsonb_build_object(
      'coordinates', 'aproximadas (entregadas por el propietario 2026-10-07)',
      'coordinates_dms', '11° 15'' 00.5" N, 85° 52'' 12.5" W')),
    updated_by = 'owner:baqueano'
where id = 'biz-hotel-encanto-del-sur';
