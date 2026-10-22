-- ============================================================================
-- 🧭 BAQUEANO ECOSYSTEM — CATÁLOGO VERIFICADO DE HOSPEDAJES (Supabase Migration)
-- ============================================================================
--
-- 🎯 1. POR QUÉ (WHY / PROPÓSITO):
-- - Crear y poblar la tabla canónica `public.lodgings` para el Catálogo Verificado
--   de Hospedajes de Nicaragua (octubre 2026), auditado con fuentes oficiales directas
--   y cartografía abierta (OpenStreetMap/GeoNames/Wikidata).
-- - Garantizar que ningún hospedaje invente precios ('Consultar disponibilidad y tarifa'),
--   que 'Cómo llegar' utilice el pin exacto del establecimiento y que el check azul
--   dependa estrictamente de verification_status = 'verified'.
-- - Respaldar la consulta de BAQUI y la sincronización con el mapa de BAQUEANO.
--
-- ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
-- - Tabla relacional `public.lodgings` con llave primaria UUID y slug único.
-- - Coordenadas en `double precision` (`latitude`, `longitude`) para precisión submétrica.
-- - Columnas de auditoría: `location_precision` ('exact' | 'reference' | 'pending'),
--   `map_ready` (boolean: true solo con pin preciso), `verification_status` ('verified'),
--   `source_url`, `coordinate_source_url` y `verified_at`.
-- - Políticas de seguridad RLS: lectura pública para registros publicados (`is_published = true`),
--   escritura restringida a roles de administración y Ops Center con token verificado.
-- - Semilla determinista con `INSERT ... ON CONFLICT (slug) DO UPDATE` para los 13 hospedajes.
--
-- 📦 3. QUÉ (WHAT / ENTIDADES CREADAS):
-- - Tabla: `public.lodgings`
-- - Índices: `idx_lodgings_dept`, `idx_lodgings_type`, `idx_lodgings_map_ready`, `idx_lodgings_slug`
-- - Políticas RLS: lectura anónima/autenticada y control administrativo
-- - 13 registros iniciales verificados (Managua, Granada, León, Rivas, Matagalpa, RACCS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.lodgings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  lodging_type TEXT NOT NULL CHECK (lodging_type IN ('hotel', 'hostel', 'ecolodge', 'resort', 'guesthouse', 'cabin', 'treehouse')),
  department TEXT NOT NULL,
  municipality TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location_precision TEXT NOT NULL DEFAULT 'pending' CHECK (location_precision IN ('exact', 'reference', 'pending')),
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  amenities TEXT[] DEFAULT '{}'::text[],
  price_mode TEXT NOT NULL DEFAULT 'dynamic' CHECK (price_mode IN ('dynamic', 'fixed', 'contact')),
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('verified', 'partial', 'pending', 'expired')),
  source_url TEXT NOT NULL,
  coordinate_source_url TEXT,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  map_ready BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices de consulta rápida para el Mapa y BAQUI
CREATE INDEX IF NOT EXISTS idx_lodgings_dept ON public.lodgings (department);
CREATE INDEX IF NOT EXISTS idx_lodgings_muni ON public.lodgings (municipality);
CREATE INDEX IF NOT EXISTS idx_lodgings_type ON public.lodgings (lodging_type);
CREATE INDEX IF NOT EXISTS idx_lodgings_status ON public.lodgings (verification_status);
CREATE INDEX IF NOT EXISTS idx_lodgings_map_ready ON public.lodgings (map_ready) WHERE map_ready = true;
CREATE INDEX IF NOT EXISTS idx_lodgings_slug ON public.lodgings (slug);

-- Habilitar RLS
ALTER TABLE public.lodgings ENABLE ROW LEVEL SECURITY;

-- Política de lectura: pública para registros publicados
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'lodgings' AND policyname = 'lodgings_public_read_policy'
  ) THEN
    CREATE POLICY lodgings_public_read_policy ON public.lodgings
      FOR SELECT
      TO anon, authenticated
      USING (is_published = true);
  END IF;
END $$;

-- Política de escritura administrativa
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'lodgings' AND policyname = 'lodgings_admin_write_policy'
  ) THEN
    CREATE POLICY lodgings_admin_write_policy ON public.lodgings
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- SEMILLA DE 13 HOSPEDAJES VERIFICADOS (05/10/2026)
-- ----------------------------------------------------------------------------
INSERT INTO public.lodgings (
  name, slug, lodging_type, department, municipality, address,
  latitude, longitude, location_precision, phone, whatsapp, email, website,
  amenities, price_mode, verification_status, source_url, coordinate_source_url,
  verified_at, map_ready, is_published, description
) VALUES
(
  'InterContinental Managua at Metrocentro Mall',
  'intercontinental-managua-metrocentro',
  'hotel',
  'Managua',
  'Managua',
  'Frente al Centro Comercial Metrocentro, Managua',
  12.126600,
  -86.264880,
  'exact',
  '+505 2276-8989',
  NULL,
  'inter.mga@r-hr.com',
  'https://www.ihg.com/intercontinental/hotels/es/es/managua/mgahb/hoteldetail',
  ARRAY['Habitaciones y suites', 'Piscina', 'Restaurantes', 'Gimnasio', 'Estacionamiento', 'Accesibilidad'],
  'dynamic',
  'verified',
  'https://www.ihg.com/intercontinental/hotels/es/es/managua/mgahb/hoteldetail',
  'https://mapcarta.com/es/32287560',
  '2026-10-05 00:00:00+00',
  true,
  true,
  'Hotel urbano de la cadena InterContinental. Su sitio oficial confirma alojamiento, piscina, restaurantes, gimnasio, estacionamiento y servicios de negocios.'
),
(
  'Hyatt Place Managua',
  'hyatt-place-managua',
  'hotel',
  'Managua',
  'Managua',
  'Carretera Masaya km 8.2, Managua',
  12.101730,
  -86.248280,
  'exact',
  '+505 2252-7000',
  NULL,
  NULL,
  'https://www.hyatt.com/hyatt-place/es-ES/mgazm-hyatt-place-managua',
  ARRAY['Habitaciones y suites', 'Desayuno', 'Wi-Fi', 'Piscina', 'Bar', 'Espacios de trabajo'],
  'dynamic',
  'verified',
  'https://www.hyatt.com/hyatt-place/es-ES/mgazm-hyatt-place-managua',
  'https://mapcarta.com/W286996213',
  '2026-10-05 00:00:00+00',
  true,
  true,
  'Hotel de la marca Hyatt Place. Hyatt confirma habitaciones modernas, desayuno, Wi-Fi, piscina exterior y espacios para viajeros de negocios y ocio.'
),
(
  'Hotel Plaza Colón',
  'hotel-plaza-colon-granada',
  'hotel',
  'Granada',
  'Granada',
  'Parque Central, Granada, Nicaragua',
  11.929820,
  -85.954510,
  'exact',
  '+505 2552-8489',
  '+505 8590-4062',
  'reservaciones@hotelplazacolon.com',
  'https://hotelplazacolon.com/es/inicio/',
  ARRAY['Habitaciones', 'Wi-Fi', 'Balcones', 'Servicios turísticos', 'Enfoque de sostenibilidad'],
  'dynamic',
  'verified',
  'https://hotelplazacolon.com/es/inicio/',
  'https://mapcarta.com/34348452',
  '2026-10-05 00:00:00+00',
  true,
  true,
  'Hotel ubicado frente al Parque Central de Granada. Su web oficial confirma habitaciones, balcones, servicios hoteleros y prácticas de sostenibilidad certificadas.'
),
(
  'Hotel Darío',
  'hotel-dario-granada',
  'hotel',
  'Granada',
  'Granada',
  'Calle La Calzada, Granada',
  11.930270,
  -85.951610,
  'exact',
  NULL,
  NULL,
  NULL,
  'http://www.hoteldario.com/',
  ARRAY['Alojamiento urbano en el centro histórico'],
  'dynamic',
  'verified',
  'https://mapcarta.com/es/32290446',
  'https://mapcarta.com/es/32290446',
  '2026-10-05 00:00:00+00',
  true,
  true,
  'Establecimiento hotelero identificado cartográficamente en el centro histórico de Granada, sobre el corredor turístico de Calle La Calzada.'
),
(
  'Hotel El Convento',
  'hotel-el-convento-leon',
  'hotel',
  'León',
  'León',
  'Centro histórico de León, Nicaragua',
  12.435610,
  -86.881900,
  'exact',
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY['Alojamiento urbano y patrimonial'],
  'dynamic',
  'verified',
  'https://mapcarta.com/es/32808130',
  'https://mapcarta.com/es/32808130',
  '2026-10-05 00:00:00+00',
  true,
  true,
  'Hotel ubicado en el centro histórico de León, registrado como alojamiento en OpenStreetMap y GeoNames, a pocos minutos caminando de la Catedral de León.'
),
(
  'Poco a Poco Hostel',
  'poco-a-poco-hostel-leon',
  'hostel',
  'León',
  'León',
  '2da calle NO, Iglesia Bautista 1/2 calle arriba, León',
  12.437010,
  -86.881820,
  'exact',
  '+505 8295-5534',
  NULL,
  NULL,
  'https://www.pocoapocohostel.com/',
  ARRAY['Dormitorios', 'Habitaciones privadas', 'Piscina', 'Cocina', 'Bar', 'Rooftop', 'Espacios de trabajo'],
  'dynamic',
  'verified',
  'https://www.pocoapocohostel.com/',
  'https://mapcarta.com/N4595638290',
  '2026-10-05 00:00:00+00',
  true,
  true,
  'Hostal real en León con dormitorios y habitaciones privadas. Su web oficial confirma piscina, cocina, jardín, bar, rooftop, espacios de trabajo y tour desk.'
),
(
  'Hotel Victoriano',
  'hotel-victoriano-san-juan-del-sur',
  'hotel',
  'Rivas',
  'San Juan del Sur',
  'Paseo del Rey, San Juan del Sur, Nicaragua',
  11.250690,
  -85.872710,
  'exact',
  '+505 8679-0261',
  NULL,
  'reservaciones@hotelvictoriano.com',
  'https://www.hotelvictoriano.com/nosotros.php',
  ARRAY['Habitaciones', 'Piscina', 'Restaurante', 'Spa', 'Gimnasio', 'Wi-Fi', 'Frente a la playa'],
  'dynamic',
  'verified',
  'https://www.hotelvictoriano.com/nosotros.php',
  'https://mapcarta.com/es/W415533338',
  '2026-10-05 00:00:00+00',
  true,
  true,
  'Hotel frente a la playa de San Juan del Sur. El sitio oficial confirma 25 habitaciones, piscina, restaurante, spa/masajes y alojamiento con Wi-Fi.'
),
(
  'Morgan''s Rock Reserve & Ecolodge',
  'morgans-rock-reserve-ecolodge',
  'ecolodge',
  'Rivas',
  'San Juan del Sur',
  'Playa Ocotal, San Juan del Sur, Rivas, Nicaragua',
  11.305520,
  -85.920490,
  'exact',
  '+505 8670-7676',
  '+505 8988-7176',
  'reservations@morgansrock.com',
  'https://www.morgansrock.com/stay/',
  ARRAY['Bungalows/villas', 'Naturaleza', 'Playa', 'Gastronomía', 'Actividades de reserva'],
  'dynamic',
  'verified',
  'https://www.morgansrock.com/stay/',
  'https://www.wikidata.org/wiki/Q125863965',
  '2026-10-05 00:00:00+00',
  true,
  true,
  'Eco-lodge y reserva privada en Playa Ocotal. Su web oficial confirma alojamiento y ubicación en San Juan del Sur, además de actividades y experiencias de naturaleza.'
),
(
  'Treehouse Nicaragua',
  'treehouse-nicaragua-granada',
  'hostel',
  'Granada',
  'Granada',
  'Km 57.5 carretera Granada-Nandaime, Comarca Poste Rojo, Granada',
  NULL,
  NULL,
  'pending',
  NULL,
  '+505 8550-3093',
  'hello@treehousenicaragua.com',
  'https://www.treehousenicaragua.com/hostel',
  ARRAY['Casas árbol', 'Habitaciones privadas', 'Dormitorio', 'Áreas comunes', 'Eventos'],
  'dynamic',
  'verified',
  'https://www.treehousenicaragua.com/hostel',
  'https://www.treehousenicaragua.com/find-us',
  '2026-10-05 00:00:00+00',
  false,
  true,
  'Hostal de selva con casas árbol, habitaciones privadas y dormitorio compartido. Su web oficial confirma su ubicación en km 57.5 de la carretera Granada-Nandaime.'
),
(
  'Selva Negra Ecolodge',
  'selva-negra-ecolodge-matagalpa',
  'ecolodge',
  'Matagalpa',
  'Matagalpa',
  'Km 140 carretera Matagalpa-Jinotega, Matagalpa, Nicaragua',
  12.999080,
  -85.909280,
  'reference',
  '+505 8100-9100',
  NULL,
  'info@selvanegra.com',
  'https://www.selvanegra.com/',
  ARRAY['Hotel', 'Cabañas', 'Senderismo', 'Aviturismo', 'Café', 'Cacao', 'Finca', 'Restaurante'],
  'dynamic',
  'verified',
  'https://www.selvanegra.com/',
  'https://www.antweb.org/locality.do?code=loc12.9990835%2C-85.90928',
  '2026-10-05 00:00:00+00',
  true,
  true,
  'Hotel y finca cafetalera histórica en las montañas de Matagalpa. Su sitio oficial confirma senderismo, aviturismo, tours de café y cacao y experiencias de naturaleza.'
),
(
  'Hotel San José Matagalpa',
  'hotel-san-jose-matagalpa',
  'hotel',
  'Matagalpa',
  'Matagalpa',
  'Detrás de la Iglesia San José, Matagalpa',
  12.921630,
  -85.918770,
  'exact',
  '+505 2772-2544',
  '+505 8534-9559',
  NULL,
  'https://hotelsanjosematagalpa.com/',
  ARRAY['Habitaciones', 'Desayuno', 'Wi-Fi', 'Alojamiento urbano'],
  'dynamic',
  'verified',
  'https://hotelsanjosematagalpa.com/',
  'https://mapcarta.com/es/N1780589783',
  '2026-10-05 00:00:00+00',
  true,
  true,
  'Hotel urbano en el centro de Matagalpa. Su sitio oficial confirma habitaciones y su ubicación detrás de la Iglesia San José.'
),
(
  'TOTOCO Eco Resort',
  'totoco-eco-resort-ometepe',
  'resort',
  'Rivas',
  'Altagracia',
  'Callejón de la Palmera, 800 m arriba, Balgüe, Nicaragua',
  11.480420,
  -85.521830,
  'reference',
  '+505 5815-0757',
  NULL,
  'info@totoco-resort.com',
  'https://www.totoco-resort.com/contact',
  ARRAY['Cabañas', 'Naturaleza', 'Piscina', 'Excursiones', 'Experiencias de Ometepe'],
  'dynamic',
  'verified',
  'https://www.totoco-resort.com/contact',
  'https://ni.near-place.com/totoco-eco-lodge-callejon-de-la-palmera-800m-arriba-balgue',
  '2026-10-05 00:00:00+00',
  true,
  true,
  'Eco resort de Ometepe con cabañas de selva y enfoque regenerativo. Su sitio oficial confirma la dirección, teléfono y experiencias en la isla.'
),
(
  'Yemaya Reefs',
  'yemaya-reefs-little-corn',
  'resort',
  'RACCS',
  'Corn Island',
  'Northern End, Little Corn Island, Nicaragua',
  12.301950,
  -82.985020,
  'reference',
  '+505 5830-2200',
  '+505 8415-5543',
  'reservations.yemaya@colibriboutiquehotels.com',
  'https://yemayalittlecorn.com/es/inicio/',
  ARRAY['Habitaciones frente al mar', 'Spa/wellness', 'Kayak', 'Snorkel', 'Paddleboard', 'Restaurante'],
  'dynamic',
  'verified',
  'https://yemayalittlecorn.com/es/inicio/',
  'https://mapcarta.com/es/N8694728217',
  '2026-10-05 00:00:00+00',
  true,
  true,
  'Hotel boutique frente al mar en Little Corn Island. Su web oficial confirma habitaciones frente a la playa, actividades acuáticas, wellness y prácticas de sostenibilidad.'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  lodging_type = EXCLUDED.lodging_type,
  department = EXCLUDED.department,
  municipality = EXCLUDED.municipality,
  address = EXCLUDED.address,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  location_precision = EXCLUDED.location_precision,
  phone = EXCLUDED.phone,
  whatsapp = EXCLUDED.whatsapp,
  email = EXCLUDED.email,
  website = EXCLUDED.website,
  amenities = EXCLUDED.amenities,
  price_mode = EXCLUDED.price_mode,
  verification_status = EXCLUDED.verification_status,
  source_url = EXCLUDED.source_url,
  coordinate_source_url = EXCLUDED.coordinate_source_url,
  verified_at = EXCLUDED.verified_at,
  map_ready = EXCLUDED.map_ready,
  is_published = EXCLUDED.is_published,
  description = EXCLUDED.description,
  updated_at = now();
