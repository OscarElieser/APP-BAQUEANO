#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: el propietario entregó el "Catálogo de playas, ríos, islas y cascadas de Nicaragua"
 *   (octubre 2026): 32 puntos con coordenadas y fuente. Deben aparecer como pin en su departamento
 *   (franja viva + ficha) y en destinos.html, sin precios ni teléfonos.
 * ⚙️ CÓMO: edición idempotente de website/js/territories-data.js.
 *   - El territorio de cada punto se decide con el CONTORNO OFICIAL (geoBoundaries ADM1): el
 *     texto "Matagalpa / RACCS" no basta. Si el punto no cae en el departamento declarado, se
 *     usa el que lo contiene y se informa.
 *   - Si el lugar ya existe como la misma entidad (p. ej. "Isletas de Granada"), solo se le
 *     agregan lat/lng, categoría, precisión y la fuente geográfica. Si no, se agrega nuevo con
 *     su descripción verificada.
 *   - precision: "exact" (punto del atractivo) o "approximate" (centro de referencia de una isla
 *     o río, o coordenada por confirmar en campo). El mapa muestra "ubicación aproximada".
 *   Texto fuente: docs/data/CATALOGO_GEO_2026-10.md.
 * 📦 QUÉ: `node tools/data/apply-geo-catalog-2026-10.mjs` (repetirlo no cambia nada).
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FILE = path.join(ROOT, 'website/js/territories-data.js');
const GEO = JSON.parse(fs.readFileSync(path.join(ROOT, 'website/data/nicaragua-departments.geojson'), 'utf8'));
const ICON = { playa: 'fa-umbrella-beach', rio: 'fa-water', isla: 'fa-mountain-sun', cascada: 'fa-droplet' };
const LABEL = { playa: 'Playa', rio: 'Río', isla: 'Isla', cascada: 'Cascada' };

// [categoría, nombre, departamento declarado, municipio/zona, lat, lng, precisión, descripción verificada, experiencias, fuente, url, existente?]
const C = [
  ['playa', 'Playa San Juan del Sur', 'rivas', 'San Juan del Sur', 11.2548, -85.8729, 'exact', 'Bahía en forma de herradura, de oleaje generalmente suave y amplia infraestructura turística; uno de los destinos costeros más visitados del país.', 'Natación, kayak, paseos en lancha, gastronomía y atardecer.', 'Visit Nicaragua / Mapcarta-OSM', 'https://visitanicaragua.com/en/beaches/San-Juan-del-Sur-beach/'],
  ['playa', 'Playa Maderas', 'rivas', 'San Juan del Sur', 11.295, -85.91, 'exact', 'Playa reconocida por el surf, con oleaje consistente, acantilados y vegetación tropical, a unos minutos al norte de San Juan del Sur.', 'Surf, caminata, atardecer y fotografía.', 'Visit Nicaragua / OpenStreetMap', 'https://www.visitanicaragua.com/playas/playa-maderas/'],
  ['playa', 'Playa Remanso', 'rivas', 'San Juan del Sur', 11.22249, -85.84622, 'exact', 'Pequeña bahía al sur de San Juan del Sur, conocida por el surf y su ambiente tranquilo; el Mapa Nacional de Turismo la incluye entre las playas del municipio.', 'Surf, baño, descanso y gastronomía local.', 'Mapa Nacional de Turismo / OpenStreetMap', 'https://www.mapanicaragua.com/municipio-de-san-juan-del-sur/'],
  ['playa', 'Playa El Coco', 'rivas', 'San Juan del Sur', 11.1559, -85.7998, 'exact', 'Amplia playa de arena fina y oleaje relativamente tranquilo, ubicada al sur de San Juan del Sur.', 'Baño, caminata, paseo a caballo y observación de aves.', 'Mapa Nacional de Turismo', 'https://www.mapanicaragua.com/sol-y-playa/'],
  ['playa', 'Popoyo y Guasacate', 'rivas', 'Tola', 11.473, -86.1279, 'exact', 'Zona costera de Tola reconocida internacionalmente por el surf; Popoyo destaca por la consistencia y la potencia de sus olas.', 'Surf avanzado, fotografía, descanso y gastronomía.', 'Mapa Nacional de Turismo / OpenStreetMap', 'https://www.mapanicaragua.com/sol-y-playa/'],
  ['playa', 'Playa Gigante', 'rivas', 'Tola', 11.3911, -86.0326, 'exact', 'Bahía y comunidad costera de Tola incluida en la oferta turística oficial de la Costa Esmeralda.', 'Baño, pesca, paseos en lancha, gastronomía y atardecer.', 'Mapa Nacional de Turismo / Wikidata-OSM', 'https://www.mapanicaragua.com/videos/'],
  ['playa', 'Playa Las Peñitas', 'leon', 'León', 12.3614, -87.0215, 'exact', 'Playa y comunidad pesquera cercana a León, junto a la Reserva Natural Isla Juan Venado; popular entre surfistas.', 'Surf, gastronomía marina, paseos en lancha y acceso a Juan Venado.', 'Mapa Nacional de Turismo / GeoNames', 'https://www.mapanicaragua.com/sol-y-playa/'],
  ['playa', 'Playa Poneloya', 'leon', 'León', 12.3783, -87.0422, 'exact', 'Tradicional balneario del litoral leonés y comunidad pesquera cercana a Las Peñitas.', 'Baño, gastronomía, pesca y atardecer.', 'Mapa Nacional de Turismo / GeoNames', 'https://www.mapanicaragua.com/videos/'],
  ['playa', 'Playa Pochomil', 'managua', 'San Rafael del Sur', 11.77244, -86.50435, 'exact', 'Playa amplia, plana y alargada; una de las más cercanas a Managua y con servicios turísticos.', 'Baño, caminata, paseo a caballo y gastronomía.', 'Mapa Nacional de Turismo / GeoNames', 'https://www.mapanicaragua.com/sol-y-playa/'],
  ['playa', 'Playa Masachapa', 'managua', 'San Rafael del Sur', 11.78467, -86.51594, 'exact', 'Pueblo pesquero y playa del Pacífico cercana a Pochomil, con formaciones rocosas y pesca artesanal.', 'Baño, compra de mariscos, caminata y fotografía.', 'Mapa Nacional de Turismo / GeoNames', 'https://www.mapanicaragua.com/sol-y-playa/'],
  ['playa', 'La Boquita', 'carazo', 'Diriamba', 11.67825, -86.38236, 'exact', 'Balneario del Pacífico en el municipio de Diriamba, Carazo, con acceso carretero y servicios turísticos.', 'Baño, descanso, gastronomía y atardecer.', 'Visit Nicaragua / GeoNames', 'https://www.visitanicaragua.com/atractivos/playas/', 'La Boquita'],
  ['playa', 'Playa Jiquilillo', 'chinandega', 'El Viejo', 12.736, -87.451, 'exact', 'Extensa playa del Pacífico norte que el Mapa Nacional de Turismo identifica entre los destinos favoritos de sol y playa del país.', 'Baño, surf, pesca, descanso y naturaleza.', 'Mapa Nacional de Turismo', 'https://www.mapanicaragua.com/sol-y-playa/'],
  ['rio', 'Río San Juan', 'rio-san-juan', 'San Carlos / El Castillo / San Juan de Nicaragua', 11.119218, -84.778118, 'approximate', 'Río histórico que nace en el Lago Cocibolca y fluye hacia el Caribe; eje de naturaleza, historia, navegación y turismo del departamento.', 'Navegación, pesca deportiva, observación de aves e historia.', 'Mapa Nacional de Turismo / Wikidata', 'https://www.mapanicaragua.com/rio-san-juan/'],
  ['rio', 'Río Coco o Wangki', 'raccn', 'Waspam y zona fronteriza', 14.99751, -83.13809, 'approximate', 'Gran río del norte de Nicaragua que forma parte de la frontera con Honduras y desemboca en el Caribe; también se le conoce como Wangki.', 'Paisaje fluvial, cultura comunitaria y navegación local.', 'GeoNames / Wikidata', 'https://mapcarta.com/es/19586360', 'Río Coco / Wangki'],
  ['rio', 'Río Grande de Matagalpa', 'raccs', 'Cuenca del Río Grande', 12.90905, -83.51531, 'approximate', 'Uno de los principales ríos de Nicaragua; recorre el país hacia el Caribe y drena una extensa cuenca.', 'Paisaje, navegación local y observación ambiental.', 'GeoNames / OpenStreetMap', 'https://mapcarta.com/es/19583878'],
  ['rio', 'Río Escondido', 'raccs', 'Bluefields / El Rama', 12.08677, -83.74916, 'approximate', 'Río del sureste de Nicaragua que desemboca en el mar Caribe al norte de Bluefields.', 'Navegación, paisaje y conexión fluvial.', 'GeoNames / Mapcarta', 'https://mapcarta.com/es/19584100'],
  ['rio', 'Río Tuma', 'matagalpa', 'El Tuma-La Dalia', 13.1025, -85.74323, 'exact', 'Curso de agua importante de la región norte-central; el punto marca un sitio accesible cercano a El Tuma-La Dalia.', 'Baño en zonas habilitadas, fotografía y paisaje rural.', 'OpenStreetMap', 'https://mapcarta.com/es/N5135651522'],
  ['rio', 'Río Tipitapa', 'managua', 'Tipitapa', 12.08333, -85.88333, 'approximate', 'Curso de agua natural que conecta el Lago Xolotlán con el Lago Cocibolca en condiciones hidrológicas favorables.', 'Paisaje, educación ambiental y observación de humedales.', 'GeoNames / Wikidata', 'https://mapcarta.com/es/19577744'],
  ['rio', 'Río Estelí', 'esteli', 'Cuenca Estelí-Telpaneca', 13.49602, -86.26757, 'approximate', 'Río principal de la cuenca de Estelí; su sistema fluvial se relaciona con el Salto de La Estanzuela.', 'Paisaje, educación ambiental y senderismo en sitios asociados.', 'GeoNames', 'https://mapcarta.com/es/19584058'],
  ['isla', 'Isla de Ometepe', 'rivas', 'Altagracia / Moyogalpa', 11.491051, -85.554472, 'approximate', 'Reserva de Biosfera en el Lago Cocibolca formada por los volcanes Concepción y Maderas, con una combinación excepcional de naturaleza y cultura.', 'Senderismo, playas lacustres, cultura, kayak y ciclismo.', 'Visit Nicaragua / GeoNames', 'https://www.visitanicaragua.com/islas/isla-de-ometepe/', 'Reserva de Biosfera Isla de Ometepe'],
  ['isla', 'Great Corn Island', 'raccs', 'Corn Island', 12.1664, -83.0514, 'approximate', 'La mayor de las Corn Islands, con playas de arena blanca, aguas turquesas, arrecifes y cultura afrocaribeña.', 'Snorkel, buceo, kayak, gastronomía y playa.', 'Visit Nicaragua / GeoNames', 'https://www.visitanicaragua.com/islas/great-corn-island/', 'Corn Island & Little Corn Island'],
  ['isla', 'Little Corn Island', 'raccs', 'Corn Island', 12.2884, -82.9812, 'approximate', 'Isla caribeña de menor tamaño, sin tránsito vehicular convencional, conocida por su ambiente tranquilo, playas y arrecifes.', 'Buceo, snorkel, playa, caminata y kayak.', 'Visit Nicaragua / GeoNames', 'https://www.visitanicaragua.com/atractivos/islas/', 'Little Corn Island y Otto Beach'],
  ['isla', 'Isletas de Granada', 'granada', 'Granada', 11.89911, -85.88519, 'approximate', 'Archipiélago lacustre de numerosos islotes al sureste de Granada, en el Lago Cocibolca.', 'Paseo en lancha, kayak, observación de aves y fotografía.', 'Visit Nicaragua / GeoNames', 'https://www.visitanicaragua.com/atractivos/islas/', 'Isletas de Granada'],
  ['isla', 'Archipiélago de Solentiname', 'rio-san-juan', 'San Carlos', 11.17283, -84.99081, 'approximate', 'Conjunto insular del Lago Cocibolca reconocido por su naturaleza, sus comunidades y su tradición artística.', 'Arte primitivista, turismo comunitario, aves, lancha y cultura.', 'Visit Nicaragua / GeoNames', 'https://www.visitanicaragua.com/atractivos/islas/', 'Archipiélago de Solentiname'],
  ['isla', 'Isla Juan Venado', 'leon', 'León', 12.31306, -86.94889, 'approximate', 'Isla y reserva natural paralela a la costa del Pacífico leonés, con manglares, fauna y playas de anidación de tortugas.', 'Lancha, kayak, manglares y observación de fauna.', 'Wikidata / Mapa Nacional de Turismo', 'https://www.mapanicaragua.com/sol-y-playa/', 'Isla Juan Venado'],
  ['isla', 'Isla Zapatera', 'granada', 'Granada', 11.739, -85.835, 'approximate', 'Isla volcánica del Lago Cocibolca, núcleo del Parque Nacional Archipiélago Zapatera y relevante por su patrimonio arqueológico.', 'Arqueología, senderismo, navegación y naturaleza.', 'MARENA / GeoNames', 'https://www.marena.gob.ni/wp-content/uploads/2023/08/11-Plan-de-Manejo-Parque-Nacional-Archipielago-Zapatera.pdf'],
  ['cascada', 'Cascada de San Ramón', 'rivas', 'Altagracia, Isla de Ometepe', 11.43424, -85.51924, 'exact', 'Cascada en las faldas del volcán Maderas, accesible por sendero desde la comunidad de San Ramón.', 'Senderismo, naturaleza y fotografía.', 'Visit Nicaragua / OpenStreetMap', 'https://www.visitanicaragua.com/islas/isla-de-ometepe/', 'Cascada de San Ramón'],
  ['cascada', 'Cascada La Luna (El Tuma-La Dalia)', 'matagalpa', 'El Tuma-La Dalia', 13.11685, -85.75101, 'exact', 'Cascada cercana a El Tuma-La Dalia, rodeada de vegetación y con actividades de aventura en su entorno.', 'Senderismo, fotografía y turismo de naturaleza.', 'OpenStreetMap / Mapa Nacional de Turismo', 'https://mapcarta.com/es/N5607799821'],
  ['cascada', 'Cascada Blanca (Río Yasica)', 'matagalpa', 'San Ramón / Santa Emilia', 12.99124, -85.82931, 'exact', 'Cascada del Río Yasica conocida como Cascada Blanca, en el corredor hacia El Tuma-La Dalia.', 'Baño en zonas autorizadas, senderismo y fotografía.', 'OpenStreetMap / UCC', 'https://mapcarta.com/es/N4904807522'],
  ['cascada', 'Cascada La Bujona', 'jinotega', 'Jinotega', 13.08037, -85.87418, 'exact', 'Caída de agua registrada en OpenStreetMap en el departamento de Jinotega, próxima al sector de Paso El Limón.', 'Senderismo, fotografía y naturaleza.', 'OpenStreetMap', 'https://mapcarta.com/es/N6907277586'],
  ['cascada', 'Cascadas Chocoyero y El Brujo', 'managua', 'Ticuantepe', 11.99, -86.25, 'approximate', 'Dos saltos de agua de más de 20 metros dentro de la Reserva Natural Chocoyero-El Brujo, área protegida de Ticuantepe.', 'Senderismo, aves, naturaleza y educación ambiental.', 'Mapa Nacional de Turismo / KBA', 'https://www.mapanicaragua.com/reserva-natural-chocoyero-el-brujo/', 'Reserva Natural Chocoyero–El Brujo'],
  ['cascada', 'Salto de La Estanzuela', 'esteli', 'Estelí', 13.025, -86.39, 'approximate', 'Salto asociado al río Estelí y uno de los atractivos naturales más conocidos del municipio; su coordenada debe confirmarse en campo.', 'Senderismo, fotografía y naturaleza.', 'Mapa Nacional de Turismo / referencia geográfica secundaria', 'https://www.mapanicaragua.com/category/atractivos-turisticos/']
];

function pointInRing([x, y], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i]; const [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
const territoryAt = (lat, lng) => GEO.features.find((f) => {
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  return polys.some((rings) => pointInRing([lng, lat], rings[0]));
})?.properties.id || null;

const js = (value) => JSON.stringify(value).replace(/"([a-zA-Z]+)":/g, '$1: ');
let source = fs.readFileSync(FILE, 'utf8');
function territoryRange(id) {
  const start = source.search(new RegExp(`\\bid:\\s*['"]${id.replace('-', '\\-')}['"]`));
  if (start < 0) throw new Error(`Territorio no encontrado: ${id}`);
  const open = source.indexOf('[', source.indexOf('places:', start));
  let depth = 0, i = open;
  for (; i < source.length; i += 1) { if (source[i] === '[') depth += 1; else if (source[i] === ']') { depth -= 1; if (!depth) break; } }
  return { open, close: i };
}
const report = { enriched: 0, added: 0, moved: [], outside: [] };
for (const [category, name, declared, zone, lat, lng, precision, desc, experiences, sourceName, url, existing] of C) {
  const inside = territoryAt(lat, lng);
  // Puntos sobre agua (islas lacustres, ríos fronterizos) pueden quedar fuera de los contornos
  // terrestres: se conserva el departamento declarado y la precisión "approximate".
  let id = declared;
  if (inside && inside !== declared) { report.moved.push(`${name}: ${declared} → ${inside}`); id = inside; }
  if (!inside) report.outside.push(`${name} (${declared})`);
  const geo = { lat, lng, category, precision };
  const geoSource = { label: sourceName, url };
  const { open, close } = territoryRange(id);
  const section = source.slice(open, close);
  if (existing) {
    const key = `name: '${existing.replace(/'/g, "\\'")}'`;
    let at = section.indexOf(key);
    if (at < 0) at = section.indexOf(`name: ${JSON.stringify(existing)}`);
    if (at < 0) throw new Error(`No se encontró ${existing} en ${id}`);
    const lineEnd = section.indexOf('\n', at);
    const line = section.slice(at, lineEnd);
    if (/\blat: /.test(line)) continue;
    const close2 = line.lastIndexOf('}');
    let updated = line.slice(0, close2).replace(/\s+$/, '') + `, lat: ${lat}, lng: ${lng}, category: ${JSON.stringify(category)}, precision: ${JSON.stringify(precision)}, geoSource: ${js(geoSource)}`;
    if (!line.includes('verification:')) {
      updated += `, verification: ${js({ status: 'verified', verifiedAt: '2026-10-05', facts: desc, activities: experiences, zone, sources: [geoSource] })}`;
    }
    updated += ' ' + line.slice(close2);
    source = source.slice(0, open + at) + updated + source.slice(open + lineEnd);
    report.enriched += 1;
  } else {
    if (section.includes(`name: ${JSON.stringify(name)}`)) continue;
    const place = {
      name, type: `${LABEL[category]} · ${experiences.split(/,| y /)[0].trim()}`, icon: ICON[category], desc, ...geo, geoSource,
      verification: { status: 'verified', verifiedAt: '2026-10-05', modality: `${LABEL[category]}s`.replace('Ríos', 'Ríos').replace('Islas', 'Islas'), facts: desc, activities: experiences, zone, sources: [geoSource] }
    };
    const before = section.replace(/\s+$/, '');
    const indent = (before.match(/\n(\s*)\{\s*name:/) || [, '      '])[1];
    source = source.slice(0, open) + before + `${before.endsWith(',') ? '' : ','}\n${indent}${js(place)}` + '\n' + indent.slice(2) + source.slice(close);
    report.added += 1;
  }
}
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox);
if (Object.values(sandbox.window.BAQUEANO_TERRITORIES).length !== 17) throw new Error('El archivo resultante no tiene 17 territorios');
fs.writeFileSync(FILE, source);
console.log(`Catálogo geográfico: ${report.enriched} existentes con coordenadas, ${report.added} nuevos.`);
if (report.moved.length) console.log('Reasignados por contorno:\n  ' + report.moved.join('\n  '));
if (report.outside.length) console.log('Fuera de contornos terrestres (se conserva el declarado):\n  ' + report.outside.join('\n  '));
