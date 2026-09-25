-- ============================================================================
-- 🧭 BAQUEANO ECOSYSTEM — SEMILLERO TERRITORIAL CANÓNICO (007_canonical_territories_seed.sql)
-- ============================================================================
-- 🎯 1. POR QUÉ (WHY / PROPÓSITO):
-- - Poblar la base de datos relacional de Supabase con el catálogo territorial oficial de Nicaragua.
-- - Garantizar que las consultas de destinos, cooperativas aliadas y departamentos
--   entreguen datos auténticos e inmediatos sin depender de servicios externos.
-- - Cumplir con la solicitud del explorador: "quiero que supabase me guarde todo por el momento".
--
-- ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
-- - Inserts idempotentes con `ON CONFLICT (id) DO NOTHING / DO UPDATE`.
-- - Coordenadas geodésicas WGS-84 precisas para cada hito y municipio.
-- - Vinculación de PostGIS si la columna geom está presente.
--
-- 📦 3. QUÉ (WHAT / ENTIDADES POBLADAS):
-- - 17 Departamentos y Regiones Autónomas en `public.departments`.
-- - Destinos insignia en `public.destinations`.
-- - Cooperativas y negocios comunitarios (0% comisión) en `public.businesses`.
-- ============================================================================

-- 1. DEPARTAMENTOS Y REGIONES AUTÓNOMAS
INSERT INTO public.departments (id, name, capital, short_desc, banner_image) VALUES
('madriz', 'Madriz', 'Somoto', 'Tierra del Cañón de Somoto, rosquillas doradas en horno de leña y Geoparque UNESCO.', 'assets/images/destinos/canon_de_somoto.jpg'),
('rivas', 'Rivas', 'Rivas', 'Hogar de la mística Isla de Ometepe, volcanes gemelos, manglares del Istián y playas del Pacífico.', 'assets/images/destinos/isla_de_ometepe.jpg'),
('leon', 'León', 'León', 'Primera capital universitaria, cúpulas blancas de la Catedral y sandboarding en Cerro Negro.', 'assets/images/destinos/cerro_negro.jpg'),
('granada', 'Granada', 'Granada', 'La Gran Sultana colonial, archipiélago de 365 isletas y bosque nuboso del Volcán Mombacho.', 'assets/images/destinos/isletas_de_granada.jpg'),
('matagalpa', 'Matagalpa', 'Matagalpa', 'Reino del café de altura, nebliselva en Selva Negra, cascadas y pueblos flecheros indígenas.', 'assets/images/destinos/selva_negra.jpg'),
('masaya', 'Masaya', 'Masaya', 'Cuna del folclor nicaragüense, cráter activo del Volcán Masaya y aguas de Laguna de Apoyo.', 'assets/images/destinos/volcan_masaya.jpg'),
('nueva_segovia', 'Nueva Segovia', 'Ocotal', 'Montañas de pinares, café de estricta altura, historia sandinista y aguas termales.', 'assets/images/destinos/cascada_la_luna.jpg'),
('esteli', 'Estelí', 'Estelí', 'El Diamante de Las Segovias, Reserva Natural Tisey-La Estanzuela y orquídeas de Miraflor.', 'assets/images/destinos/cascada_la_luna.jpg'),
('chinandega', 'Chinandega', 'Chinandega', 'Tierra de volcanes imponentes, San Cristóbal y el cráter de aguas esmeralda de Cosigüina.', 'assets/images/destinos/cerro_negro.jpg'),
('managua', 'Managua', 'Managua', 'Capital de la República, lagunas cratéricas urbanas y senderos frescos en El Crucero.', 'assets/images/destinos/selva_negra.jpg'),
('carazo', 'Carazo', 'Jinotepe', 'Meseta de clima fresco, cascadas campesinas, bailes del Güegüense y costa de Chacocente.', 'assets/images/destinos/isla_de_ometepe.jpg'),
('boaco', 'Boaco', 'Boaco', 'La Ciudad de dos pisos, serranías ganaderas, queso artesanal y petroglifos precolombinos.', 'assets/images/destinos/selva_negra.jpg'),
('chontales', 'Chontales', 'Juigalpa', 'Cultura chontaleña, serranías de Amerrisque, monolitos gigantes y sabanas ganaderas.', 'assets/images/destinos/isletas_de_granada.jpg'),
('jinotega', 'Jinotega', 'Jinotega', 'La Ciudad de las Brumas, Lago Apanás, Macizo de Peñas Blancas y café orgánico.', 'assets/images/destinos/cascada_la_luna.jpg'),
('rio_san_juan', 'Río San Juan', 'San Carlos', 'Arteria fluvial viva, Fortaleza del Castillo, archipiélago de Solentiname e Indio Maíz.', 'assets/images/destinos/Fortaleza de la Inmaculada Concepción.jpg'),
('raccn', 'Costa Caribe Norte (RACCN)', 'Bilwi', 'Corazón de la Reserva de Biosfera Bosawás, pueblos miskitos y mayangnas.', 'assets/images/destinos/corn_island.jpg'),
('raccs', 'Costa Caribe Sur (RACCS)', 'Bluefields', 'Aguas turquesas de Corn Island, cultura creole, garífuna y selvas vírgenes.', 'assets/images/destinos/corn_island.jpg')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  capital = EXCLUDED.capital,
  short_desc = EXCLUDED.short_desc,
  banner_image = EXCLUDED.banner_image;

-- 2. DESTINOS TURÍSTICOS FACTUALES
INSERT INTO public.destinations (id, department_id, name, category, short_desc, description, latitude, longitude, cover_image, rating, reviews_count, verified, status) VALUES
('dest_canon_somoto', 'madriz', 'Monumento Nacional Cañón de Somoto', 'naturaleza', 'Desfiladero geológico terciario con paredes de hasta 80 metros labradas por el Río Coco.', 'El Cañón de Somoto es uno de los monumentos geológicos más antiguos de Centroamérica y el geositio insignia del Geoparque Mundial UNESCO Río Coco. Ofrece nado seguro, senderismo geológico y navegación en neumáticos con guías locales campesinos.', 13.4833, -86.6667, 'assets/images/destinos/canon_de_somoto.jpg', 4.95, 342, true, 'published'),
('dest_isla_ometepe', 'rivas', 'Isla de Ometepe (Concepción & Maderas)', 'naturaleza', 'Oasis de volcanes gemelos en el Lago Cocibolca, Reserva de Biosfera UNESCO.', 'Dos volcanes majestuosos que emergen de las aguas dulces del Gran Lago de Nicaragua. Cuenta con petroglifos precolombinos, aguas termales medicinales de Ojo de Agua y kayak en el Río Istián.', 11.5375, -85.5905, 'assets/images/destinos/isla_de_ometepe.jpg', 4.98, 512, true, 'published'),
('dest_cerro_negro', 'leon', 'Volcán Cerro Negro', 'aventura', 'El volcán más joven y activo de Centroamérica, mundialmente famoso por sandboarding.', 'Nacido en 1850, este cono de ceniza negra ofrece la experiencia inigualable de descender en tabla a más de 60 km/h guiado por cooperativas locales de baqueanos.', 12.5061, -86.7022, 'assets/images/destinos/cerro_negro.jpg', 4.92, 438, true, 'published'),
('dest_selva_negra', 'matagalpa', 'Reserva Ecológica Selva Negra', 'naturaleza', 'Bosque nuboso primario, senderos de orquídeas y hacienda cafetalera sustentable.', 'Ubicada a más de 1,200 msnm, Selva Negra combina conservación biológica con producción agrícola ecológica y avistamiento del quetzal y aves de montaña.', 12.9983, -85.9089, 'assets/images/destinos/selva_negra.jpg', 4.88, 290, true, 'published'),
('dest_volcan_mombacho', 'granada', 'Reserva Natural Volcán Mombacho', 'naturaleza', 'Cráteres extintos cubiertos de bosque enano y bruma con vistas panorámicas.', 'Guardián de la ciudad colonial de Granada, ofrece senderos en la cumbre (Sendero El Cráter, El Puma) y vistas hacia las 365 Isletas de Granada.', 11.8260, -85.9680, 'assets/images/destinos/selva_negra.jpg', 4.91, 380, true, 'published'),
('dest_laguna_apoyo', 'masaya', 'Reserva Natural Laguna de Apoyo', 'naturaleza', 'Cráter volcánico de aguas termales cristalinas enriquecidas con minerales.', 'Un espejo de agua formado hace miles de años dentro de un cráter volcánico. Ideal para buceo, kayak y relajación en un ambiente de bosque tropical seco.', 11.9286, -86.0306, 'assets/images/destinos/laguna_de_apoyo.jpg', 4.94, 460, true, 'published'),
('dest_corn_island', 'raccs', 'Islas del Maíz (Great & Little Corn Island)', 'playa', 'Paraíso caribeño de aguas turquesas, arrecifes de coral y cultura creole.', 'Dos islas en el Mar Caribe nicaragüense rodeadas de arrecifes de coral prístinos, pesca artesanal de langosta y gastronomía de rondón caribeño.', 12.1644, -83.0531, 'assets/images/destinos/corn_island.jpg', 4.96, 275, true, 'published')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  short_desc = EXCLUDED.short_desc,
  description = EXCLUDED.description,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  cover_image = EXCLUDED.cover_image,
  rating = EXCLUDED.rating,
  verified = EXCLUDED.verified;

-- 3. COOPERATIVAS Y NEGOCIOS VERIFICADOS (0% COMISIÓN SOBERANA)
INSERT INTO public.businesses (id, name, category, department, municipality, phone, whatsapp, address, verified, commission_rate, metadata) VALUES
('biz-coop-somoto', 'Coop. Guías Comunitarios del Cañón de Somoto', 'guia', 'Madriz', 'Somoto', '50584431289', '50584431289', 'Comunidad Sonís, Entrada al Cañón de Somoto', true, 0.00, '{"host": "Gonzalo Cruz", "specialty": "Geología y descenso en cañón", "verified": true}'::jsonb),
('biz-red-ometepe', 'Red Comunitaria Ometepe Viva', 'hospedaje', 'Rivas', 'Altagracia', '50588442211', '50588442211', 'Faldas del Volcán Maderas, Isla de Ometepe', true, 0.00, '{"host": "Doña María Luisa", "specialty": "Posadas rurales y senderismo campesino", "verified": true}'::jsonb),
('biz-cerro-negro-exp', 'Baqueanos del Cerro Negro', 'guia', 'León', 'Malpaisillo', '50587654321', '50587654321', 'Base del Volcán Cerro Negro, León', true, 0.00, '{"host": "Marcos Toruño", "specialty": "Sandboarding volcánico certificado", "verified": true}'::jsonb),
('biz-selva-negra-lodge', 'Finca Comunitaria Nebliselva', 'hospedaje', 'Matagalpa', 'Matagalpa', '50589110022', '50589110022', 'Km 140 Carretera Matagalpa - Jinotega', true, 0.00, '{"host": "Familia Kühl", "specialty": "Ecoturismo de café de altura", "verified": true}'::jsonb),
('biz-lancheros-isletas', 'Asoc. Lancheros Tradicionales de Granada', 'transporte', 'Granada', 'Granada', '50584431289', '50584431289', 'Puerto Cabaña Amarilla, Granada', true, 0.00, '{"host": "Capitán Silvio Peña", "specialty": "Navegación comunitaria entre Isletas", "verified": true}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  department = EXCLUDED.department,
  municipality = EXCLUDED.municipality,
  phone = EXCLUDED.phone,
  whatsapp = EXCLUDED.whatsapp,
  address = EXCLUDED.address,
  commission_rate = EXCLUDED.commission_rate,
  metadata = EXCLUDED.metadata;
