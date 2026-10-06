-- ============================================================================
-- 🧭 BAQUEANO — PRUEBAS DEL MÓDULO AMBIENTAL MARENA (Fase 35)
-- ============================================================================
-- 🎯 POR QUÉ: si una regla de honestidad falla (verificado sin fuente, Ramsar
--    sin fuente, pin sin coordenadas, "Cómo llegar" desde el centroide, área
--    publicada a medias, veda de otro año como vigente), NO se publica.
-- ⚙️ CÓMO: pgTAP; datos de prueba propios dentro de la transacción y ROLLBACK.
--    Localmente se ejecutó en PGlite (PostgreSQL 18) con un shim de pgTAP y la
--    migración 20261005090000 + los importadores MARENA (ver
--    docs/architecture/MARENA_ENVIRONMENTAL_MODULE.md §Pruebas).
-- 📦 QUÉ: `supabase test db` (requiere la migración aplicada).
-- ============================================================================
BEGIN;
SELECT plan(25);

-- Datos de prueba: un área protegida sin publicar y una normativa.
INSERT INTO public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, legacy_source, legacy_key, created_by, updated_by)
VALUES ('pl-test-area', 'test-area', 'Área Protegida de Prueba', 'reserva', 'protected_area', 'missing', false, false, 'partial', 'pgtap', 'test-area', 'pgtap', 'pgtap');
INSERT INTO public.environmental_regulations (regulation_key, title, document_type, institution, status)
VALUES ('rm-test-vedas', 'Resolución de prueba de vedas', 'resolucion_ministerial', 'MARENA', 'pending');

-- 1-4. Honestidad de la ficha legal
SELECT throws_ok($$ INSERT INTO public.protected_area_details (place_id, official_name, official_category, verification_status) VALUES ('pl-test-area', 'Área Protegida de Prueba', 'reserva_natural', 'verified') $$,
  '23514', NULL, 'verified sin fuente ni fecha → rechazado');
SELECT throws_ok($$ INSERT INTO public.protected_area_details (place_id, official_name, ramsar_site) VALUES ('pl-test-area', 'Área Protegida de Prueba', true) $$,
  '23514', NULL, 'Ramsar sin fuente → rechazado');
SELECT throws_ok($$ INSERT INTO public.protected_area_details (place_id, official_name, area_hectares) VALUES ('pl-test-area', 'Área Protegida de Prueba', 1200) $$,
  '23514', NULL, 'superficie sin fecha de la fuente → rechazada');
SELECT lives_ok($$ INSERT INTO public.protected_area_details (place_id, official_name, official_category, source_url, verified_at, verification_status)
  VALUES ('pl-test-area', 'Área Protegida de Prueba', 'reserva_natural', 'https://www.marena.gob.ni/planes-de-manejo/', now(), 'partial') $$, 'ficha parcial con fuente oficial → aceptada');

-- 5-6. Publicación controlada (Fase 18)
SELECT throws_ok($$ UPDATE public.places SET is_published = true WHERE id = 'pl-test-area' $$,
  '23514', NULL, 'área protegida sin departamento/municipio/fuente activa → no se publica');
SELECT ok('department' = ANY(public.protected_area_publication_gaps('pl-test-area')), 'la brecha "department" se reporta');

-- 7-9. "Cómo llegar": nunca desde el centroide
UPDATE public.places SET latitude = 13.0, longitude = -85.9, location_precision = 'exact', map_ready = true WHERE id = 'pl-test-area';
SELECT is((SELECT count(*)::int FROM public.place_navigation WHERE place_id = 'pl-test-area'), 0, 'lugar no publicado no aparece en navegación');
SELECT throws_ok($$ INSERT INTO public.access_points (place_id, name, access_type, source_url, map_ready) VALUES ('pl-test-area', 'Entrada sin pin', 'entrance', 'https://example.org/a', true) $$,
  '23514', NULL, 'acceso map_ready sin coordenadas ni verificación → rechazado');
SELECT throws_ok($$ INSERT INTO public.access_points (place_id, name, latitude, longitude, access_type, source_url) VALUES ('pl-test-area', 'Fuera del país', 9.0, -84.0, 'entrance', 'https://example.org/a') $$,
  '23514', NULL, 'acceso con coordenadas fuera de Nicaragua → rechazado');

-- 10-14. Vedas: fechas coherentes y vigencia por año
SELECT throws_ok($$ INSERT INTO public.wildlife_restrictions (regulation_key, year, species_group, species_name, restriction_type, period_text, start_date, end_date, source_url, source_date)
  VALUES ('rm-test-vedas', 2026, 'aves', 'Especie prueba', 'partial', '1 marzo / 30 junio', '2025-03-01', '2025-06-30', 'https://example.org/v', '2026-02-16') $$,
  '23514', NULL, 'veda con fechas de otro año → rechazada');
SELECT throws_ok($$ INSERT INTO public.wildlife_restrictions (regulation_key, year, species_group, species_name, restriction_type, period_text, start_date, end_date, source_url, source_date)
  VALUES ('rm-test-vedas', 2026, 'aves', 'Especie prueba', 'indefinite', 'Indefinida', '2026-01-01', '2026-12-31', 'https://example.org/v', '2026-02-16') $$,
  '23514', NULL, 'veda indefinida con fechas → rechazada');
INSERT INTO public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, source_url, source_date, status)
VALUES ('rm-test-vedas', 2025, 'aves', 'Especie prueba', 'Prueba', 'partial', '1 marzo / 30 junio', '2025-03-01', '2025-06-30', 'https://example.org/v', '2025-02-21', 'verified'),
       ('rm-test-vedas', 2026, 'aves', 'Especie prueba', 'Prueba', 'partial', '1 marzo / 30 junio 2026', '2026-03-01', '2026-06-30', 'https://example.org/v', '2026-02-16', 'verified');
SELECT is((SELECT count(*)::int FROM public.wildlife_restrictions_current WHERE regulation_key = 'rm-test-vedas' AND year = 2025), 0,
  'veda 2025 no se muestra como vigente cuando existe la de 2026');
SELECT lives_ok($$ SELECT public.refresh_environmental_verification_status() $$, 'refresco de estados ejecuta');
SELECT is((SELECT status::text FROM public.wildlife_restrictions WHERE regulation_key = 'rm-test-vedas' AND year = 2025), 'expired', 'veda 2025 vence al existir la de 2026');

-- 15-16. Planes y biosfera exigen evidencia
SELECT throws_ok($$ INSERT INTO public.management_plans (area_key, title, source_name, source_url, status) VALUES ('test-area', 'Plan de prueba', 'MARENA', 'https://www.marena.gob.ni/x', 'verified') $$,
  '23514', NULL, 'plan verified sin documento ni fecha → rechazado');
SELECT throws_ok($$ INSERT INTO public.biosphere_reserves (slug, name, unesco_status) VALUES ('biosfera-prueba', 'Biosfera de prueba', 'designated') $$,
  '23514', NULL, 'biosfera "designated" sin fuente → rechazada');

-- 17. Normativa verificada exige fuente
SELECT throws_ok($$ UPDATE public.environmental_regulations SET status = 'verified' WHERE regulation_key = 'rm-test-vedas' $$,
  '23514', NULL, 'normativa verified sin fuente → rechazada');

-- 18-19. Zoocriadero no es destino por defecto; categoría nueva válida
SELECT lives_ok($$ INSERT INTO public.places (id, slug, name, category, place_type, is_published, legacy_source, legacy_key) VALUES ('pl-test-zoo', 'test-zoo', 'Zoocriadero de prueba', 'zoocriadero', 'wildlife_breeding_center', false, 'pgtap', 'test-zoo') $$,
  'zoocriadero se registra sin publicar');
SELECT throws_ok($$ INSERT INTO public.places (id, name, place_type) VALUES ('pl-test-bad', 'Tipo inválido', 'destino_magico') $$, '23514', NULL, 'place_type inválido → rechazado');

-- 20-25. Seguridad (RLS y privilegios)
SELECT ok(NOT has_table_privilege('anon', 'public.protected_area_details', 'INSERT'), 'anon no escribe fichas legales');
SELECT ok(NOT has_table_privilege('authenticated', 'public.wildlife_restrictions', 'UPDATE'), 'authenticated no edita vedas');
SELECT ok(NOT has_table_privilege('anon', 'public.access_points', 'INSERT'), 'anon no crea accesos');
SET LOCAL ROLE anon;
SELECT is((SELECT count(*)::int FROM public.protected_area_details WHERE place_id = 'pl-test-area'), 0, 'anon no ve la ficha de un área no publicada');
SELECT ok((SELECT count(*) FROM public.wildlife_restrictions_current) >= 0, 'anon lee vedas vigentes');
SELECT throws_ok($$ SELECT public.refresh_environmental_verification_status() $$, '42501', NULL, 'anon no ejecuta el refresco de estados');
RESET ROLE;

SELECT * FROM finish();
ROLLBACK;
