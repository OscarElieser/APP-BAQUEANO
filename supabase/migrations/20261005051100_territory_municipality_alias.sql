-- ============================================================================
-- 🧭 BAQUEANO — ALIAS TERRITORIAL: localidad cabecera → municipio oficial
-- 🎯 POR QUÉ: `businesses.municipality` guardaba la localidad "Malpaisillo",
--   que no es municipio sino la cabecera de Larreynaga (León); sin alias el
--   negocio quedaba sin `municipality_id`.
-- ⚙️ CÓMO: actualización acotada (solo filas sin municipio, solo León).
-- 📦 QUÉ: 5/5 negocios enlazados a su municipio oficial. Texto original intacto.
-- ============================================================================
update public.businesses set municipality_id = 'leon__larreynaga'
where municipality_id is null and department_id = 'leon' and lower(btrim(municipality)) = 'malpaisillo';
