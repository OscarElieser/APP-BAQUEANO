#!/usr/bin/env node
// ============================================================================
// 🧭 BAQUEANO — APLICADOR DEL CATÁLOGO VERIFICADO DE RESTAURANTES, COMEDORES Y KIOSCOS
// ============================================================================
// 🎯 POR QUÉ:
// - El propietario entregó el catálogo de octubre 2026 (12 establecimientos: 6
//   restaurantes, 4 comedores, 2 kioscos) para el mapa, destinos.html y BAQUI.
// - Reglas del catálogo: map_ready solo con latitud/longitud verificadas; con
//   dirección comprobada pero sin pin → verificación "partial" y map_ready=false
//   (sin "Cómo llegar"); precios, horarios y reseñas son dinámicos con fecha de
//   revisión; BAQUI nunca inventa teléfono, precio, menú, horario ni coordenadas.
// ⚙️ CÓMO:
// - Edición idempotente de `website/js/territories-data.js` (mismo patrón que
//   apply-lodging-catalog-2026-10.mjs): inserta cada lugar en su territorio; si ya
//   existe por nombre, no lo duplica. Validación con VM (17 territorios).
// - Teléfonos marcados "confirmar antes de publicar" / "no publicar" NO se cargan.
// - Por coherencia con la importación INTUR (sin nombres de personas), la ficha del
//   kiosco La Gata no publica el nombre de su responsable (está en la fuente).
// 📦 QUÉ: `node tools/data/apply-food-catalog-2026-10.mjs`. Texto íntegro de la
//   fuente: docs/data/CATALOGO_GASTRONOMIA_2026-10.md.
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FILE = path.join(ROOT, 'website/js/territories-data.js');
const CHECKED_AT = '2026-10-05';

const KIND = {
  restaurante: { type: 'Restaurante', icon: 'fa-utensils', modality: 'Restaurantes' },
  comedor: { type: 'Comedor', icon: 'fa-bowl-food', modality: 'Comedores' },
  kiosco: { type: 'Kiosco', icon: 'fa-store', modality: 'Kioscos' }
};

// [territorio, nombre, categoría, lat, lng, precisión, municipio, dirección, teléfono, correo, descripción, oferta[], fuente, mapa]
const PLACES = [
  ['managua', 'Cocina de Doña Haydée', 'restaurante', 12.11872, -86.26163, 'exact', 'Managua', 'Carretera a Masaya km 4 1/2, Managua', '+505 2270-6100', null,
    'Restaurante nicaragüense ampliamente conocido en Managua. La ficha comercial actual confirma su dirección, teléfono y operación diaria.',
    ['Comida nicaragüense', 'Desayuno', 'Almuerzo', 'Cena', 'Atención en local'],
    { label: 'Google Business / OpenStreetMap', url: 'https://mapcarta.com/N887699115' }],
  ['managua', 'Restaurante Don Cándido', 'restaurante', 12.12577, -86.26316, 'exact', 'Managua', '15 Av. Sureste, Managua', '+505 2277-2485', null,
    'Restaurante especializado en cortes de carne, con ficha comercial activa y ubicación cartográfica verificada en Managua.',
    ['Cortes de carne', 'Almuerzo', 'Cena', 'Atención en local'],
    { label: 'Google Business / OpenStreetMap', url: 'https://mapcarta.com/es/N1748771743' }],
  ['managua', 'Restaurante El Eskimo', 'restaurante', 12.14409, -86.29012, 'exact', 'Managua', '18 y 19 Ave. Sur Oeste, Managua', '+505 2266-6313', null,
    'Restaurante registrado cartográficamente en Managua y con ficha comercial activa.',
    ['Restaurante', 'Comidas y bebidas'],
    { label: 'Google Business / OpenStreetMap', url: 'https://mapcarta.com/es/N887537085' }],
  ['managua', 'Restaurante Los Ranchos', 'restaurante', 12.14443, -86.29049, 'exact', 'Managua', 'Distrito II, Managua', '+505 2266-0527', null,
    'Restaurante con presencia consolidada en Managua. La ficha comercial y OpenStreetMap confirman su ubicación.',
    ['Restaurante', 'Almuerzo', 'Cena', 'Atención en local'],
    { label: 'Google Business / OpenStreetMap', url: 'https://mapcarta.com/es/N887536144' }],
  ['granada', 'Restaurante El Zaguán', 'restaurante', 11.92958, -85.95256, 'exact', 'Granada', 'Costado este de la Catedral, Granada', '+505 8886-6099', null,
    'Restaurante del centro histórico de Granada, verificado mediante ficha comercial y cartografía abierta.',
    ['Cortes de carne', 'Almuerzo', 'Cena'],
    { label: 'Google Business / OpenStreetMap', url: 'https://mapcarta.com/es/W419754191' }],
  ['granada', 'Boca Baco', 'restaurante', null, null, 'address', 'Granada', 'Costado oeste de la Catedral / Av. La Sirena, Granada', '+505 8810-9805', 'boca.baco20@gmail.com',
    'Restaurante de cocina fusión y tapas en el centro de Granada. Su sitio oficial confirma contacto, ubicación y menú.',
    ['Cocina fusión', 'Sushi', 'Tapas', 'Vinos', 'Cocteles', 'Opciones veganas'],
    { label: 'Sitio oficial Boca Baco', url: 'https://bocabaconicaragua.com/english-menu/' }, 'https://bocabaconicaragua.com/english-menu/'],
  ['granada', 'Comedor Doña Tulita', 'comedor', 11.9322657, -85.9573215, 'exact', 'Granada', 'Calle El Hormiguero, Granada', '+505 2552-7100', null,
    'Comedor de comida casera nicaragüense en Granada. La dirección, el teléfono y las coordenadas coinciden en fuentes locales y cartográficas.',
    ['Comida casera', 'Almuerzo', 'Cena', 'Atención en local'],
    { label: 'Near-Place / Google Business', url: 'https://ni.near-place.com/comedor-dona-tulita-w2jvw33-calle-el-hormiguero-granada/en' }],
  ['leon', 'Comedor La Cucaracha', 'comedor', 12.4342008, -86.873702, 'exact', 'León', 'León, Nicaragua', null, null,
    'Comedor popular en León con ubicación geográfica verificable y referencias públicas de comida nicaragüense.',
    ['Comida popular nicaragüense', 'Almuerzo'],
    { label: 'Near-Place / Google Business', url: 'https://ni.near-place.com/comedor-la-cucaracha-leon' }],
  ['granada', 'Comedor La Parada', 'comedor', null, null, 'address', 'Granada', 'Terminal de pequeños buses, Granada (Plus Code W2HW+G8V)', '+505 8955-8759', null,
    'Comedor local dentro de la terminal de pequeños buses de Granada. Fuentes recientes confirman dirección, teléfono y horario.',
    ['Comida típica', 'Menú del día', 'Opciones vegetarianas', 'Para llevar'],
    { label: 'Restaurant Guru / AZ Nicaragua', url: 'https://es.restaurantguru.com/Comedor-La-Parada-Granada-Granada' }],
  ['granada', 'Comedor Martha', 'comedor', null, null, 'address', 'Granada', 'Frente al parque del cementerio, Granada', '+505 8477-5431', null,
    'Comedor y restaurante nicaragüense con ficha comercial activa en Granada.',
    ['Comida nicaragüense', 'Atención en local'],
    { label: 'Google Business', url: 'https://www.google.com/maps/search/?api=1&query=Comedor+Martha+Granada+Nicaragua' }],
  ['granada', 'Kiosco La Gata', 'kiosco', null, null, 'address', 'Granada', 'Parque Central Colón, Granada', null, null,
    'Kiosco tradicional de vigorón en el Parque Central Colón, identificado por fuentes periodísticas nicaragüenses como un kiosco histórico de Granada.',
    ['Vigorón', 'Cerdo con yuca', 'Bebidas tradicionales'],
    { label: 'La Gaceta / La Verdad Nica', url: 'https://www.lagaceta.gob.ni/la-imponente-gran-sultana-granada-muestra-algunos-de-sus-rincones-mas-hermosos/' }],
  ['managua', 'Kiosko Vilma', 'kiosco', null, null, 'address', 'Managua', 'Aeropuerto Internacional Augusto C. Sandino, Managua', null, null,
    'Kiosco y cafetería identificado públicamente dentro del Aeropuerto Internacional Augusto C. Sandino; también sirve de punto de referencia para el transporte turístico.',
    ['Cafetería', 'Kiosco'],
    { label: 'Google Business / Bigfoot Hostel', url: 'https://www.bigfoothostelleon.com/service-page/from-managua-airport-to-leon-shared-shuttle-23' }]
];

const js = (value) => JSON.stringify(value).replace(/"([a-zA-Z]+)":/g, '$1: ');
let source = fs.readFileSync(FILE, 'utf8');

function territoryRange(id) {
  const start = source.search(new RegExp(`\\bid:\\s*['"]${id}['"]`));
  if (start < 0) throw new Error(`Territorio no encontrado: ${id}`);
  const open = source.indexOf('[', source.indexOf('places:', start));
  let depth = 0;
  let i = open;
  for (; i < source.length; i += 1) {
    if (source[i] === '[') depth += 1;
    else if (source[i] === ']') { depth -= 1; if (!depth) break; }
  }
  return { open, close: i };
}

const report = { added: 0, kept: 0, mapReady: 0, pinPending: 0 };
for (const [territoryId, name, category, lat, lng, precision, municipality, address, phone, email, desc, offer, primarySource, website] of PLACES) {
  const kind = KIND[category];
  const mapReady = lat !== null && lng !== null && precision === 'exact';
  const query = encodeURIComponent(`${name} ${municipality} Nicaragua`);
  const verification = {
    status: mapReady ? 'verified' : 'verified_pin_pending',
    verificationStatus: mapReady ? 'verified' : 'partial',
    verifiedAt: CHECKED_AT,
    checkedAt: CHECKED_AT,
    modality: kind.modality,
    facts: desc,
    address,
    amenities: offer,
    price: 'Consultar precio, menú y horario con el establecimiento',
    priceMode: 'dynamic',
    mapReady,
    precision: mapReady ? 'exact' : 'address',
    zone: municipality,
    ...(phone ? { phones: [phone] } : {}),
    ...(email ? { email } : {}),
    ...(website ? { website } : {}),
    map: mapReady ? `https://www.google.com/maps?q=${lat},${lng}` : `https://www.google.com/maps/search/?api=1&query=${query}`,
    sources: [primarySource]
  };
  const place = {
    name,
    type: kind.type,
    icon: kind.icon,
    desc,
    ...(mapReady ? { lat, lng } : {}),
    category,
    precision: mapReady ? 'exact' : 'address',
    geoSource: primarySource,
    verification
  };

  const { open, close } = territoryRange(territoryId);
  const section = source.slice(open, close);
  if (section.includes(`name: ${JSON.stringify(name)}`) || section.includes(`name: '${name.replace(/'/g, "\\'")}'`)) { report.kept += 1; continue; }
  const before = section.replace(/\s+$/, '');
  const indentMatch = before.match(/\n(\s*)\{\s*name:/);
  const indent = indentMatch ? indentMatch[1] : '      ';
  source = source.slice(0, open) + before + `${before.endsWith(',') ? '' : ','}\n${indent}${js(place)}` + '\n' + indent.slice(2) + source.slice(close);
  report.added += 1;
  if (mapReady) report.mapReady += 1; else report.pinPending += 1;
}

const sandbox = { window: {} };
vm.runInNewContext(source, sandbox);
const territories = Object.values(sandbox.window.BAQUEANO_TERRITORIES);
if (territories.length !== 17) throw new Error('El archivo resultante no tiene los 17 territorios requeridos.');
const all = territories.flatMap((t) => t.places || []);
for (const [, name] of PLACES) {
  const found = all.filter((p) => p.name === name);
  if (found.length !== 1) throw new Error(`${name}: aparece ${found.length} veces`);
  const p = found[0];
  if (p.verification.mapReady && (typeof p.lat !== 'number' || typeof p.lng !== 'number')) throw new Error(`${name}: map_ready sin coordenadas`);
  if (!p.verification.mapReady && (p.lat != null || p.lng != null)) throw new Error(`${name}: coordenadas sin pin validado`);
}

fs.writeFileSync(FILE, source, 'utf8');
console.log('✅ Catálogo de restaurantes, comedores y kioscos aplicado:');
console.log(`   - Nuevos: ${report.added} (map-ready ${report.mapReady} · pin pendiente ${report.pinPending})`);
console.log(`   - Sin cambios (ya existían): ${report.kept}`);
console.log(`   - Lugares totales: ${all.length}`);
