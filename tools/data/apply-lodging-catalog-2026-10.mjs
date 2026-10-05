#!/usr/bin/env node
// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — APLICADOR DEL CATÁLOGO VERIFICADO DE HOSPEDAJES
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - El propietario entregó el Catálogo Verificado de Hospedajes de Nicaragua (octubre 2026):
//   13 establecimientos (Hoteles, Hostales, Eco-lodges, Resorts, Casas Árbol) con fuentes oficiales,
//   coordenadas exactas o de referencia, precisión cartográfica y contactos auditados.
// - Es crítico para el mapa de BAQUEANO, destinos.html y BAQUI que ningún hospedaje invente precios,
//   que 'Cómo llegar' use el pin verificado y que solo los puntos validados tengan map_ready = true.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Edición idempotente y determinista de `website/js/territories-data.js`.
// - Hospedajes existentes (4: Poco a Poco Hostel, Morgan's Rock, Hotel Darío, Treehouse Nicaragua):
//   se actualizan con sus coordenadas, precisión cartográfica, geoSource, servicios y verificación.
//   Treehouse Nicaragua conserva map_ready: false y lat/lng nulos hasta validar su pin exacto en OSM.
// - Hospedajes nuevos (9: InterContinental, Hyatt Place, Plaza Colón, El Convento, Victoriano,
//   Selva Negra, Hotel San José, TOTOCO Eco Resort, Yemaya Reefs):
//   se insertan en el array `places` de su respectivo territorio (managua, granada, leon, rivas, matagalpa, raccs).
// - Validación sintáctica con motor VM en Node.js y garantía de preservación de los 17 territorios.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Script ejecutable: `node tools/data/apply-lodging-catalog-2026-10.mjs`.
// - Actualización limpia de `website/js/territories-data.js`.
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FILE = path.join(ROOT, 'website/js/territories-data.js');

// Catálogo de 13 Hospedajes Verificados (05/10/2026)
// Estructura: [
//   territoryId, name, type, lodgingType, icon, lat, lng, precision, mapReady,
//   desc, municipality, address, phone, whatsapp, email, website,
//   amenities, primarySource, geoSource, existingName | null
// ]
const LODGINGS = [
  // 1. Managua - InterContinental
  [
    'managua',
    'InterContinental Managua at Metrocentro Mall',
    'Hotel · Alojamiento y negocios',
    'hotel',
    'fa-hotel',
    12.126600,
    -86.264880,
    'exact',
    true,
    'Hotel urbano de la cadena InterContinental. Su sitio oficial confirma alojamiento, piscina, restaurantes, gimnasio, estacionamiento y servicios de negocios.',
    'Managua',
    'Frente al Centro Comercial Metrocentro, Managua',
    '+505 2276-8989',
    null,
    'inter.mga@r-hr.com',
    'https://www.ihg.com/intercontinental/hotels/es/es/managua/mgahb/hoteldetail',
    ['Habitaciones y suites', 'Piscina', 'Restaurantes', 'Gimnasio', 'Estacionamiento', 'Accesibilidad'],
    { label: 'IHG / InterContinental (sitio oficial)', url: 'https://www.ihg.com/intercontinental/hotels/es/es/managua/mgahb/hoteldetail' },
    { label: 'Mapcarta / OpenStreetMap', url: 'https://mapcarta.com/es/32287560' },
    null
  ],
  // 2. Managua - Hyatt Place
  [
    'managua',
    'Hyatt Place Managua',
    'Hotel · Negocios y ocio',
    'hotel',
    'fa-hotel',
    12.101730,
    -86.248280,
    'exact',
    true,
    'Hotel de la marca Hyatt Place. Hyatt confirma habitaciones modernas, desayuno, Wi-Fi, piscina exterior y espacios para viajeros de negocios y ocio.',
    'Managua',
    'Carretera Masaya km 8.2, Managua',
    '+505 2252-7000',
    null,
    null,
    'https://www.hyatt.com/hyatt-place/es-ES/mgazm-hyatt-place-managua',
    ['Habitaciones y suites', 'Desayuno', 'Wi-Fi', 'Piscina', 'Bar', 'Espacios de trabajo'],
    { label: 'Hyatt (sitio oficial)', url: 'https://www.hyatt.com/hyatt-place/es-ES/mgazm-hyatt-place-managua' },
    { label: 'Mapcarta / OpenStreetMap', url: 'https://mapcarta.com/W286996213' },
    null
  ],
  // 3. Granada - Hotel Plaza Colón
  [
    'granada',
    'Hotel Plaza Colón',
    'Hotel · Balcones y sostenibilidad',
    'hotel',
    'fa-hotel',
    11.929820,
    -85.954510,
    'exact',
    true,
    'Hotel ubicado frente al Parque Central de Granada. Su web oficial confirma habitaciones, balcones, servicios hoteleros y prácticas de sostenibilidad certificadas.',
    'Granada',
    'Parque Central, Granada, Nicaragua',
    '+505 2552-8489',
    '+505 8590-4062',
    'reservaciones@hotelplazacolon.com',
    'https://hotelplazacolon.com/es/inicio/',
    ['Habitaciones', 'Wi-Fi', 'Balcones', 'Servicios turísticos', 'Enfoque de sostenibilidad'],
    { label: 'Hotel Plaza Colón (sitio oficial)', url: 'https://hotelplazacolon.com/es/inicio/' },
    { label: 'Mapcarta / OpenStreetMap', url: 'https://mapcarta.com/34348452' },
    null
  ],
  // 4. Granada - Hotel Darío (Existente)
  [
    'granada',
    'Hotel Darío',
    'Hotel · Centro histórico',
    'hotel',
    'fa-hotel',
    11.930270,
    -85.951610,
    'exact',
    true,
    'Establecimiento hotelero identificado cartográficamente en el centro histórico de Granada, sobre el corredor turístico de Calle La Calzada.',
    'Granada',
    'Calle La Calzada, Granada',
    null,
    null,
    null,
    'http://www.hoteldario.com/',
    ['Alojamiento urbano en el centro histórico'],
    { label: 'OpenStreetMap / GeoNames / Wikidata', url: 'https://mapcarta.com/es/32290446' },
    { label: 'Mapcarta / OpenStreetMap', url: 'https://mapcarta.com/es/32290446' },
    'Hotel Darío'
  ],
  // 5. León - Hotel El Convento
  [
    'leon',
    'Hotel El Convento',
    'Hotel · Patrimonio histórico',
    'hotel',
    'fa-hotel',
    12.435610,
    -86.881900,
    'exact',
    true,
    'Hotel ubicado en el centro histórico de León, registrado como alojamiento en OpenStreetMap y GeoNames, a pocos minutos caminando de la Catedral de León.',
    'León',
    'Centro histórico de León, Nicaragua',
    null,
    null,
    null,
    null,
    ['Alojamiento urbano y patrimonial'],
    { label: 'OpenStreetMap / GeoNames / Wikidata', url: 'https://mapcarta.com/es/32808130' },
    { label: 'Mapcarta / OpenStreetMap', url: 'https://mapcarta.com/es/32808130' },
    null
  ],
  // 6. León - Poco a Poco Hostel (Existente)
  [
    'leon',
    'Poco a Poco Hostel',
    'Hostal · Piscina y coworking',
    'hostel',
    'fa-bed',
    12.437010,
    -86.881820,
    'exact',
    true,
    'Hostal real en León con dormitorios y habitaciones privadas. Su web oficial confirma piscina, cocina, jardín, bar, rooftop, espacios de trabajo y tour desk.',
    'León',
    '2da calle NO, Iglesia Bautista 1/2 calle arriba, León',
    '+505 8295-5534',
    null,
    null,
    'https://www.pocoapocohostel.com/',
    ['Dormitorios', 'Habitaciones privadas', 'Piscina', 'Cocina', 'Bar', 'Rooftop', 'Espacios de trabajo'],
    { label: 'Poco a Poco Hostel (sitio oficial)', url: 'https://www.pocoapocohostel.com/' },
    { label: 'Mapcarta / OpenStreetMap', url: 'https://mapcarta.com/N4595638290' },
    'Poco a Poco Hostel'
  ],
  // 7. Rivas - Hotel Victoriano
  [
    'rivas',
    'Hotel Victoriano',
    'Hotel boutique · Frente a la playa',
    'hotel',
    'fa-hotel',
    11.250690,
    -85.872710,
    'exact',
    true,
    'Hotel frente a la playa de San Juan del Sur. El sitio oficial confirma 25 habitaciones, piscina, restaurante, spa/masajes y alojamiento con Wi-Fi.',
    'San Juan del Sur',
    'Paseo del Rey, San Juan del Sur, Nicaragua',
    '+505 8679-0261',
    null,
    'reservaciones@hotelvictoriano.com',
    'https://www.hotelvictoriano.com/nosotros.php',
    ['Habitaciones', 'Piscina', 'Restaurante', 'Spa', 'Gimnasio', 'Wi-Fi', 'Frente a la playa'],
    { label: 'Hotel Victoriano (sitio oficial)', url: 'https://www.hotelvictoriano.com/nosotros.php' },
    { label: 'Mapcarta / OpenStreetMap', url: 'https://mapcarta.com/es/W415533338' },
    null
  ],
  // 8. Rivas - Morgan's Rock Reserve & Ecolodge (Existente)
  [
    'rivas',
    "Morgan's Rock Reserve & Ecolodge",
    'Eco-lodge / resort · Playa Ocotal',
    'ecolodge',
    'fa-leaf',
    11.305520,
    -85.920490,
    'exact',
    true,
    'Eco-lodge y reserva privada en Playa Ocotal. Su web oficial confirma alojamiento y ubicación en San Juan del Sur, además de actividades y experiencias de naturaleza.',
    'San Juan del Sur',
    'Playa Ocotal, San Juan del Sur, Rivas, Nicaragua',
    '+505 8670-7676',
    '+505 8988-7176',
    'reservations@morgansrock.com',
    'https://www.morgansrock.com/stay/',
    ['Bungalows/villas', 'Naturaleza', 'Playa', 'Gastronomía', 'Actividades de reserva'],
    { label: "Morgan's Rock (sitio oficial)", url: 'https://www.morgansrock.com/stay/' },
    { label: 'Wikidata', url: 'https://www.wikidata.org/wiki/Q125863965' },
    "Morgan's Rock Reserve & Ecolodge"
  ],
  // 9. Granada - Treehouse Nicaragua (Existente - Coordenada pendiente de validación OSM)
  [
    'granada',
    'Treehouse Nicaragua',
    'Hostal / casas árbol · Selva',
    'hostel',
    'fa-tree',
    null,
    null,
    'pending',
    false,
    'Hostal de selva con casas árbol, habitaciones privadas y dormitorio compartido. Su web oficial confirma su ubicación en km 57.5 de la carretera Granada-Nandaime.',
    'Granada / Comarca Poste Rojo',
    'Km 57.5 carretera Granada-Nandaime, Comarca Poste Rojo, Granada',
    null,
    '+505 8550-3093',
    'hello@treehousenicaragua.com',
    'https://www.treehousenicaragua.com/hostel',
    ['Casas árbol', 'Habitaciones privadas', 'Dormitorio', 'Áreas comunes', 'Eventos'],
    { label: 'Treehouse Nicaragua (sitio oficial)', url: 'https://www.treehousenicaragua.com/hostel' },
    { label: 'Dirección oficial / Google Hotels', url: 'https://www.treehousenicaragua.com/find-us' },
    'Treehouse Nicaragua'
  ],
  // 10. Matagalpa - Selva Negra Ecolodge
  [
    'matagalpa',
    'Selva Negra Ecolodge',
    'Eco-lodge / finca cafetalera · Montaña',
    'ecolodge',
    'fa-leaf',
    12.999080,
    -85.909280,
    'reference',
    true,
    'Hotel y finca cafetalera histórica en las montañas de Matagalpa. Su sitio oficial confirma senderismo, aviturismo, tours de café y cacao y experiencias de naturaleza.',
    'Matagalpa',
    'Km 140 carretera Matagalpa-Jinotega, Matagalpa, Nicaragua',
    '+505 8100-9100',
    null,
    'info@selvanegra.com',
    'https://www.selvanegra.com/',
    ['Hotel', 'Cabañas', 'Senderismo', 'Aviturismo', 'Café', 'Cacao', 'Finca', 'Restaurante'],
    { label: 'Selva Negra (sitio oficial)', url: 'https://www.selvanegra.com/' },
    { label: 'AntWeb / referencia geográfica de Selva Negra Hotel', url: 'https://www.antweb.org/locality.do?code=loc12.9990835%2C-85.90928' },
    null
  ],
  // 11. Matagalpa - Hotel San José Matagalpa
  [
    'matagalpa',
    'Hotel San José Matagalpa',
    'Hotel · Centro urbano',
    'hotel',
    'fa-hotel',
    12.921630,
    -85.918770,
    'exact',
    true,
    'Hotel urbano en el centro de Matagalpa. Su sitio oficial confirma habitaciones y su ubicación detrás de la Iglesia San José.',
    'Matagalpa',
    'Detrás de la Iglesia San José, Matagalpa',
    '+505 2772-2544',
    '+505 8534-9559',
    null,
    'https://hotelsanjosematagalpa.com/',
    ['Habitaciones', 'Desayuno', 'Wi-Fi', 'Alojamiento urbano'],
    { label: 'Hotel San José Matagalpa (sitio oficial)', url: 'https://hotelsanjosematagalpa.com/' },
    { label: 'Mapcarta / OpenStreetMap', url: 'https://mapcarta.com/es/N1780589783' },
    null
  ],
  // 12. Rivas - TOTOCO Eco Resort
  [
    'rivas',
    'TOTOCO Eco Resort',
    'Eco-resort · Isla de Ometepe',
    'resort',
    'fa-leaf',
    11.480420,
    -85.521830,
    'reference',
    true,
    'Eco resort de Ometepe con cabañas de selva y enfoque regenerativo. Su sitio oficial confirma la dirección, teléfono y experiencias en la isla.',
    'Altagracia / Balgüe, Isla de Ometepe',
    'Callejón de la Palmera, 800 m arriba, Balgüe, Nicaragua',
    '+505 5815-0757',
    null,
    'info@totoco-resort.com',
    'https://www.totoco-resort.com/contact',
    ['Cabañas', 'Naturaleza', 'Piscina', 'Excursiones', 'Experiencias de Ometepe'],
    { label: 'TOTOCO Eco Resort (sitio oficial)', url: 'https://www.totoco-resort.com/contact' },
    { label: 'Near-Place / referencia cartográfica', url: 'https://ni.near-place.com/totoco-eco-lodge-callejon-de-la-palmera-800m-arriba-balgue' },
    null
  ],
  // 13. RACCS - Yemaya Reefs
  [
    'raccs',
    'Yemaya Reefs',
    'Resort / hotel boutique · Little Corn Island',
    'resort',
    'fa-hotel',
    12.301950,
    -82.985020,
    'reference',
    true,
    'Hotel boutique frente al mar en Little Corn Island. Su web oficial confirma habitaciones frente a la playa, actividades acuáticas, wellness y prácticas de sostenibilidad.',
    'Little Corn Island',
    'Northern End, Little Corn Island, Nicaragua',
    '+505 5830-2200',
    '+505 8415-5543',
    'reservations.yemaya@colibriboutiquehotels.com',
    'https://yemayalittlecorn.com/es/inicio/',
    ['Habitaciones frente al mar', 'Spa/wellness', 'Kayak', 'Snorkel', 'Paddleboard', 'Restaurante'],
    { label: 'Yemaya Reefs (sitio oficial)', url: 'https://yemayalittlecorn.com/es/inicio/' },
    { label: 'OpenStreetMap / punto turístico inmediato al hotel', url: 'https://mapcarta.com/es/N8694728217' },
    null
  ]
];

const js = (value) => JSON.stringify(value).replace(/"([a-zA-Z]+)":/g, '$1: ');

let source = fs.readFileSync(FILE, 'utf8');

function territoryRange(id) {
  const start = source.search(new RegExp(`\\bid:\\s*['"]${id.replace('-', '\\-')}['"]`));
  if (start < 0) throw new Error(`Territorio no encontrado: ${id}`);
  const open = source.indexOf('[', source.indexOf('places:', start));
  let depth = 0, i = open;
  for (; i < source.length; i += 1) {
    if (source[i] === '[') depth += 1;
    else if (source[i] === ']') {
      depth -= 1;
      if (!depth) break;
    }
  }
  return { open, close: i };
}

const report = { enriched: 0, added: 0, kept: 0 };

for (const [
  territoryId, name, type, lodgingType, icon, lat, lng, precision, mapReady,
  desc, municipality, address, phone, whatsapp, email, website,
  amenities, primarySource, geoSource, existingName
] of LODGINGS) {
  const sources = [primarySource, geoSource].filter(Boolean);
  const verification = {
    status: mapReady ? 'verified' : 'verified_pin_pending',
    verifiedAt: '2026-10-05',
    modality: 'Hospedajes',
    lodgingType,
    facts: desc,
    address,
    amenities,
    price: 'Consultar disponibilidad y tarifa',
    priceMode: 'dynamic',
    mapReady,
    precision,
    zone: municipality,
    ...(phone ? { phones: [phone] } : {}),
    ...(whatsapp ? { whatsapp } : {}),
    ...(email ? { email } : {}),
    ...(website ? { website } : {}),
    sources
  };

  const place = {
    name,
    type,
    icon,
    desc,
    ...(lat !== null && lng !== null ? { lat, lng } : {}),
    category: 'hospedaje',
    precision,
    geoSource,
    verification
  };

  if (existingName) {
    const { open, close } = territoryRange(territoryId);
    const section = source.slice(open, close);
    let at = section.indexOf(`name: '${existingName.replace(/'/g, "\\'")}'`);
    if (at < 0) at = section.indexOf(`name: ${JSON.stringify(existingName)}`);
    if (at < 0) throw new Error(`No se encontró ${existingName} en ${territoryId}`);

    // Encontrar el inicio '{' y fin '}' del objeto existente
    const openBrace = section.lastIndexOf('{', at);
    let depth = 0;
    let closeBrace = -1;
    for (let i = openBrace; i < section.length; i += 1) {
      if (section[i] === '{') depth += 1;
      else if (section[i] === '}') {
        depth -= 1;
        if (!depth) {
          closeBrace = i;
          break;
        }
      }
    }
    if (closeBrace < 0) throw new Error(`No se pudo delimitar el objeto para ${existingName}`);

    const existingBlock = section.slice(openBrace, closeBrace + 1);
    if (existingBlock.includes('category: "hospedaje"') && existingBlock.includes('lodgingType:')) {
      report.kept += 1;
      continue;
    }

    const updatedBlock = js(place);
    source = source.slice(0, open + openBrace) + updatedBlock + source.slice(open + closeBrace + 1);
    report.enriched += 1;
    continue;
  }

  // Agregar nuevo hospedaje
  const { open, close } = territoryRange(territoryId);
  const section = source.slice(open, close);
  if (section.includes(`name: ${JSON.stringify(name)}`)) {
    report.kept += 1;
    continue;
  }

  const before = section.replace(/\s+$/, '');
  const indentMatch = before.match(/\n(\s*)\{\s*name:/);
  const indent = indentMatch ? indentMatch[1] : '      ';

  source = source.slice(0, open) + before + `${before.endsWith(',') ? '' : ','}\n${indent}${js(place)}` + '\n' + indent.slice(2) + source.slice(close);
  report.added += 1;
}

// Validar sintaxis mediante VM
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox);
if (Object.values(sandbox.window.BAQUEANO_TERRITORIES).length !== 17) {
  throw new Error('El archivo resultante no tiene los 17 territorios requeridos.');
}

fs.writeFileSync(FILE, source, 'utf8');
console.log(`✅ Catálogo de Hospedajes aplicado con éxito:`);
console.log(`   - Enriquecidos (existentes): ${report.enriched}`);
console.log(`   - Nuevos agregados: ${report.added}`);
console.log(`   - Sin cambios (ya procesados): ${report.kept}`);
