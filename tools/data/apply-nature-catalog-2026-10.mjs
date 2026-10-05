#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: el propietario entregó "BAQUEANO_NATURALEZA.pdf" (Catálogo de naturaleza protegida y
 *   paisajes de Nicaragua, octubre 2026): 39 registros con coordenadas, precisión y fuente.
 *   Deben quedar en su departamento/región (franja + ficha) y en destinos.html.
 * ⚙️ CÓMO: edición idempotente de website/js/territories-data.js.
 *   - Lugar existente (misma entidad): se le agregan lat/lng, categoría, precisión y fuente; se
 *     conserva su departamento aunque el centro de referencia caiga en otro contorno.
 *   - Lugar nuevo: su departamento lo decide el contorno oficial (geoBoundaries ADM1); si el punto
 *     cae en agua (lagos), se usa el declarado.
 *   - Registros duplicados dentro del catálogo (cerro y su reserva con el mismo punto; mirador y
 *     cueva con el mismo punto) se fusionan en una sola ficha (columna `merge`).
 *   - precision: exact | centroid | reference (como el catálogo). Solo "exact" se usa para
 *     navegar; el resto es "área general, acceso por confirmar".
 *   Texto fuente: docs/data/CATALOGO_NATURALEZA_2026-10.md.
 * 📦 QUÉ: `node tools/data/apply-nature-catalog-2026-10.mjs` (repetirlo no cambia nada).
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FILE = path.join(ROOT, 'website/js/territories-data.js');
const GEO = JSON.parse(fs.readFileSync(path.join(ROOT, 'website/data/nicaragua-departments.geojson'), 'utf8'));
const ICON = { laguna: 'fa-water', volcan: 'fa-volcano', reserva: 'fa-tree', cueva: 'fa-mountain', mirador: 'fa-binoculars', parque: 'fa-leaf' };
const LABEL = { laguna: 'Laguna o lago', volcan: 'Volcán o cerro', reserva: 'Reserva natural', cueva: 'Cueva o cañón', mirador: 'Mirador', parque: 'Parque o área protegida' };
const MNT = 'Mapa Nacional de Turismo';

// [categoría, nombre, territorio declarado, municipio/zona, lat, lng, precisión, descripción verificada, experiencias, fuente, existente | null, merge?]
const N = [
  ['laguna', 'Laguna de Apoyo', 'masaya', 'Catarina, San Juan de Oriente, Diriá y Diriomo', 11.923441, -86.030882, 'centroid', 'Laguna cratérica de origen volcánico y reserva natural; uno de los paisajes lacustres más emblemáticos del Pacífico de Nicaragua.', 'Kayak, natación en zonas habilitadas, senderismo, observación de naturaleza y fotografía.', 'MARENA · Plan de Manejo Reserva Natural Laguna de Apoyo', 'Reserva Natural Laguna de Apoyo'],
  ['laguna', 'Laguna de Tiscapa', 'managua', 'Managua', 12.13943, -86.27034, 'centroid', 'Laguna cratérica dentro de Managua; la reserva comprende la laguna y la Loma de Tiscapa y fue declarada área protegida en 1991.', 'Paisaje urbano, fotografía e interpretación ambiental e histórica.', `${MNT} / MARENA`, 'Laguna de Tiscapa'],
  ['laguna', 'Laguna de Xiloá', 'managua', 'Mateare · Península de Chiltepe', 12.22151, -86.32196, 'centroid', 'Laguna de cráter volcánico en la Península de Chiltepe, dentro de un entorno protegido cercano a Managua.', 'Baño en sectores habilitados, paisaje, recreación y fotografía.', 'Visit Nicaragua / OpenStreetMap', 'Laguna de Xiloá y Apoyeque'],
  ['laguna', 'Laguna de Apoyeque', 'managua', 'Mateare · Península de Chiltepe', 12.244931, -86.341497, 'centroid', 'Laguna en la caldera del volcán Apoyeque, rodeada de vegetación y paisajes volcánicos; el acceso requiere planificación y guía local.', 'Senderismo de aventura, geoturismo y observación panorámica.', 'Visit Nicaragua', null],
  ['laguna', 'Laguna de Asososca', 'managua', 'Managua', 12.137778, -86.313611, 'centroid', 'Laguna cratérica y reserva natural al oeste de Managua; reservorio estratégico de agua para la ciudad, con acceso condicionado.', 'Paisaje y educación ambiental; acceso condicionado por su función de abastecimiento.', `${MNT} / MARENA`, 'Laguna de Asososca'],
  ['laguna', 'Lago de Apanás-Asturias', 'jinotega', 'Jinotega', 13.194444, -85.976389, 'centroid', 'Lago artificial de gran importancia hidroeléctrica y ambiental en Jinotega, reconocido como sitio Ramsar.', 'Paisaje, pesca recreativa donde esté autorizada, observación de aves y turismo rural.', 'Wikidata / OpenStreetMap', 'Lago de Apanás'],
  ['laguna', 'Lago Cocibolca (Lago de Nicaragua)', 'granada', 'Granada, Rivas, Río San Juan, Chontales y otros', 11.6873, -85.47863, 'centroid', 'El mayor lago de Centroamérica, con islas, archipiélagos, comunidades pesqueras y gran diversidad de paisajes y actividades.', 'Navegación, islas, pesca, kayak, fotografía y turismo comunitario.', 'OpenStreetMap / GeoNames', 'Lago Cocibolca'],
  ['laguna', 'Lago Xolotlán (Lago de Managua)', 'managua', 'Managua y municipios ribereños', 12.339722, -86.350556, 'centroid', 'Segundo gran lago de Nicaragua, ligado al paisaje de Managua y a la cadena volcánica del Pacífico.', 'Paseos lacustres autorizados, fotografía y paisaje urbano y volcánico.', `${MNT} / Geographic Names`, null],
  ['volcan', 'Volcán Masaya (caldera Santiago)', 'masaya', 'Nindirí / Masaya', 11.9822, -86.1621, 'reference', 'Caldera volcánica activa dentro del Parque Nacional Volcán Masaya; INETER reporta actividad volcánica y monitoreo permanente.', 'Geoturismo, observación volcánica bajo condiciones oficiales y fotografía.', 'INETER / Visit Nicaragua', null],
  ['volcan', 'Volcán Mombacho', 'granada', 'Granada / Nandaime', 11.82732, -85.95995, 'reference', 'Volcán cubierto por bosque nuboso y reconocido como reserva natural, con senderos y miradores hacia Granada y el Lago Cocibolca.', 'Senderismo, bosque nuboso, observación de flora y fauna y fotografía.', 'Visit Nicaragua / OpenStreetMap', 'Reserva Natural Volcán Mombacho'],
  ['volcan', 'Cerro Negro', 'leon', 'La Paz Centro / León', 12.50782, -86.70329, 'reference', 'Volcán joven formado en 1850 y uno de los principales sitios de turismo de aventura del occidente del país.', 'Senderismo, sandboarding con operador responsable, geoturismo y fotografía.', 'MARENA / OpenStreetMap', 'Volcán Cerro Negro'],
  ['volcan', 'Volcán Telica', 'leon', 'Telica', 12.6, -86.87, 'reference', 'Estratovolcán activo de la Cordillera de los Maribios, monitoreado por INETER.', 'Senderismo con guía, geoturismo y paisaje volcánico.', 'INETER', 'Volcán Telica'],
  ['volcan', 'Volcán Cosigüina', 'chinandega', 'El Viejo · Península de Cosigüina', 12.983333, -87.566667, 'reference', 'Macizo volcánico aislado en la Península de Cosigüina; su gran erupción histórica de 1835 transformó la morfología de la caldera.', 'Senderismo, observación de la laguna cratérica y paisaje del Golfo de Fonseca.', 'MARENA / Geographic Names', 'Volcán Cosigüina y Laguna Cráter'],
  ['volcan', 'Volcán Concepción', 'rivas', 'Isla de Ometepe', 11.53901, -85.62258, 'reference', 'Uno de los dos grandes volcanes de Ometepe y uno de los volcanes activos más representativos de Nicaragua.', 'Ascenso exigente con guía experimentado, fotografía y geoturismo.', 'Visit Nicaragua / OpenStreetMap', 'Volcán Concepción'],
  ['volcan', 'Volcán Maderas', 'rivas', 'Altagracia · Isla de Ometepe', 11.44452, -85.51197, 'reference', 'Volcán cubierto por bosque húmedo y nuboso; su entorno forma parte de la Reserva de Biosfera Isla de Ometepe.', 'Senderismo con guía, bosque nuboso, laguna cratérica y fotografía.', 'Visit Nicaragua / OpenStreetMap', 'Volcán Maderas'],
  ['reserva', 'Reserva Natural Cerro Datanlí - El Diablo', 'jinotega', 'Jinotega', 13.11941, -85.87948, 'reference', 'Área protegida de nebliselva a unos 15 km de Jinotega, con elevaciones de alrededor de 1,650 m y alta biodiversidad.', 'Senderismo, aves, cascadas, paisaje y camping controlado.', MNT, 'Reserva Natural Cerro Datanlí–El Diablo', 'Incluye el registro "Cerro Datanlí - El Diablo" (mismo punto, cumbre del Cerro El Diablo).'],
  ['reserva', 'Reserva Natural Cerro Kilambé', 'jinotega', 'El Cuá / San José de Bocay / Wiwilí', 13.58178, -85.69313, 'reference', 'Reserva montañosa de origen volcánico con bosque de nebliselva y una importante red de nacientes y ríos.', 'Senderismo especializado, biodiversidad, aves y paisaje.', MNT, 'Cerro Kilambé y aguas termales de El Caño', 'Incluye el registro "Cerro Kilambé" (mismo punto, cumbre).'],
  ['reserva', 'Reserva Natural Cerro Musún', 'matagalpa', 'Río Blanco / Matiguás / Paiwas', 12.98536, -85.24221, 'reference', 'Área protegida de bosque húmedo tropical y bosque nuboso con cascadas y alta riqueza de flora y fauna.', 'Senderismo, cascadas, fotografía, camping y observación de fauna.', MNT, null, 'Incluye el registro "Cerro Musún" (mismo punto, cumbre).'],
  ['volcan', 'Cerro Mogotón', 'nueva-segovia', 'Frontera Nicaragua-Honduras', 13.763062, -86.399059, 'reference', 'Pico de 2,107 metros registrado por GeoNames, considerado el punto de mayor elevación del territorio nicaragüense.', 'Montañismo y senderismo especializado con guía local.', 'GeoNames', 'Cerro Mogotón (2,107 msnm)'],
  ['reserva', 'Reserva Natural Chocoyero - El Brujo', 'managua', 'Ticuantepe', 11.9812, -86.2633, 'centroid', 'Reserva de bosque tropical con dos saltos de agua de más de 20 metros y colonias de chocoyos; área protegida desde 1993.', 'Senderismo, aves, cascadas, ciclismo y camping controlado.', MNT, 'Reserva Natural Chocoyero–El Brujo'],
  ['reserva', 'Reserva Natural Tisey - La Estanzuela', 'esteli', 'Estelí / San Nicolás / El Sauce', 13.0222, -86.3884, 'reference', 'Área protegida de pinares, robledales y montañas que incluye el Salto La Estanzuela, miradores y arte rural en piedra.', 'Senderismo, cascadas, miradores, arte en piedra y turismo rural.', `${MNT} / Wikidata`, 'Reserva Natural Tisey-La Estanzuela'],
  ['reserva', 'Reserva Natural Estero Padre Ramos', 'chinandega', 'El Viejo', 12.78091, -87.48321, 'centroid', 'Área protegida de manglar en la costa del Pacífico norte, de gran importancia para la biodiversidad y los medios de vida comunitarios.', 'Kayak, observación de aves y fauna y recorridos por ramales del estero.', MNT, 'Estero Padre Ramos'],
  ['reserva', 'Reserva Natural Miraflor - Moropotente', 'esteli', 'Estelí', 13.21, -86.28, 'centroid', 'Paisaje protegido de montañas, fincas y bosques del norte, reconocido por turismo rural, biodiversidad y producción sostenible.', 'Agroturismo, senderismo, aves, café y turismo comunitario.', 'OpenStreetMap / Wikidata', 'Reserva Natural Miraflor'],
  ['reserva', 'Reserva Natural Península de Chiltepe', 'managua', 'Mateare', 12.24928, -86.35086, 'centroid', 'Área protegida cercana a Managua que integra las calderas y lagunas de Apoyeque y Xiloá.', 'Senderismo, geoturismo y paisaje volcánico y lacustre.', MNT, null],
  ['cueva', 'Monumento Nacional Cañón de Somoto', 'madriz', 'Somoto · comunidad de Sonís', 13.45523, -86.70377, 'reference', 'Cañón de aproximadamente 3 km modelado en roca volcánica por el sistema fluvial que forma el río Coco; Monumento Nacional desde 2006.', 'Senderismo, natación según condiciones, bote o neumático, geoturismo y rappel con operadores autorizados.', `${MNT} / INETER`, 'Monumento Nacional Cañón de Somoto'],
  ['cueva', 'Cuevas y Mirador de Apaguají', 'esteli', 'San Nicolás · Reserva Tisey-La Estanzuela', 12.96849, -86.37914, 'exact', 'Sistema de cuevas y mirador en la parte alta de Tisey-La Estanzuela; Visit Nicaragua destaca su interés ecológico y la presencia de murciélagos.', 'Senderismo, miradores, exploración guiada de cuevas y fotografía.', 'Visit Nicaragua / OpenStreetMap', null, 'Incluye el registro "Mirador Apaguají" (mismo punto).'],
  ['cueva', 'Cueva del Duende (Tisey)', 'esteli', 'San Nicolás · Tisey-La Estanzuela', 12.97122, -86.38087, 'exact', 'Cueva mencionada en el plan de manejo de Tisey-La Estanzuela, con un mirador panorámico próximo en la zona montañosa de la reserva.', 'Senderismo, paisaje y exploración solo con guía local y respeto a la fauna de cuevas.', 'Plan de Manejo Tisey-La Estanzuela / OpenStreetMap', null, 'Incluye el registro "Mirador Cueva del Duende" (mismo punto).'],
  ['mirador', 'Mirador de Catarina', 'masaya', 'Catarina', 11.91318, -86.06903, 'exact', 'Uno de los miradores más visitados del país, con vistas hacia la Laguna de Apoyo, el Lago Cocibolca, Granada y el Volcán Mombacho.', 'Paisaje, fotografía, artesanía, gastronomía, senderos y actividades de aventura.', 'Visit Nicaragua', 'Mirador de Catarina'],
  ['mirador', 'Mirador El Ranchito (Tisey)', 'esteli', 'San Nicolás · Tisey-La Estanzuela', 12.97223, -86.37849, 'exact', 'Mirador rural dentro del conjunto de puntos panorámicos de la zona de Apaguají, en Tisey-La Estanzuela.', 'Senderismo, paisaje y fotografía.', 'OpenStreetMap', null],
  ['parque', 'Parque Nacional Volcán Masaya', 'masaya', 'Nindirí / Masaya', 11.983333, -86.15, 'centroid', 'Parque nacional creado en 1979 alrededor de la caldera volcánica de Masaya y sus cráteres; el acceso depende de MARENA e INETER.', 'Geoturismo, interpretación volcánica y fotografía bajo regulación oficial.', 'MARENA / Wikidata', 'Parque Nacional Volcán Masaya'],
  ['parque', 'Parque Nacional Saslaya', 'raccn', 'Siuna · zona de Bosawás', 13.7, -84.86, 'reference', 'Parque nacional del gran sistema de conservación de Bosawás, de bosque tropical y alta biodiversidad.', 'Turismo científico y de naturaleza muy controlado, con coordinación local y ambiental.', 'MARENA · Plan de Manejo Parque Nacional Saslaya', null],
  ['parque', 'Reserva de Biosfera Bosawás', 'raccn', 'Norte y Caribe Norte', 13.44305, -85.14404, 'reference', 'Una de las áreas de conservación más extensas de Centroamérica y parte central del Corredor Biológico Mesoamericano, con territorios indígenas.', 'Investigación, conservación y turismo de naturaleza solo con condiciones y permisos adecuados.', `${MNT} / MARENA`, 'Reserva de Biosfera Bosawás'],
  ['parque', 'Reserva Biológica Indio Maíz', 'rio-san-juan', 'Sureste de Nicaragua', 12.91355, -84.67987, 'reference', 'Gran reserva de bosque húmedo tropical en el sureste de Nicaragua, integrada a la Reserva de Biosfera Río San Juan.', 'Conservación, investigación y turismo de naturaleza regulado en sectores autorizados.', 'MARENA / OpenStreetMap', 'Reserva Biológica Indio Maíz'],
  ['parque', 'Parque Nacional Archipiélago Zapatera', 'granada', 'Lago Cocibolca · Isla Zapatera', 11.739, -85.835, 'reference', 'Área protegida insular y volcánica en el Lago Cocibolca, con alto valor natural y arqueológico.', 'Navegación autorizada, naturaleza, arqueología y turismo comunitario con operadores locales.', 'MARENA · Plan de Manejo', 'Isla Zapatera']
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
const report = { enriched: 0, kept: 0, added: 0, moved: [] };
for (const [category, name, declared, zone, lat, lng, precision, desc, experiences, sourceName, existing, merge] of N) {
  const geoSource = { label: `${sourceName} (catálogo de naturaleza 2026)`, url: '' };
  const verification = { status: 'verified', verifiedAt: '2026-10-05', facts: desc, activities: experiences, zone, ...(merge ? { note: merge } : {}), sources: [geoSource] };
  if (existing) {
    const { open, close } = territoryRange(declared);
    const section = source.slice(open, close);
    let at = section.indexOf(`name: '${existing.replace(/'/g, "\\'")}'`);
    if (at < 0) at = section.indexOf(`name: ${JSON.stringify(existing)}`);
    if (at < 0) throw new Error(`No se encontró ${existing} en ${declared}`);
    const lineEnd = section.indexOf('\n', at);
    const line = section.slice(at, lineEnd);
    if (/\blat: /.test(line)) { report.kept += 1; continue; } // ya tiene coordenada con fuente (catálogo anterior)
    const close2 = line.lastIndexOf('}');
    let updated = line.slice(0, close2).replace(/\s+$/, '') + `, lat: ${lat}, lng: ${lng}, category: ${JSON.stringify(category)}, precision: ${JSON.stringify(precision)}, geoSource: ${js(geoSource)}`;
    if (!line.includes('verification:')) updated += `, verification: ${js(verification)}`;
    updated += ' ' + line.slice(close2);
    source = source.slice(0, open + at) + updated + source.slice(open + lineEnd);
    report.enriched += 1;
    continue;
  }
  const inside = territoryAt(lat, lng);
  const id = inside || declared;
  if (inside && inside !== declared) report.moved.push(`${name}: ${declared} → ${inside}`);
  const { open, close } = territoryRange(id);
  const section = source.slice(open, close);
  if (section.includes(`name: ${JSON.stringify(name)}`)) continue;
  const place = { name, type: `${LABEL[category]} · ${experiences.split(/,| y /)[0].trim()}`, icon: ICON[category], desc, lat, lng, category, precision, geoSource, verification };
  const before = section.replace(/\s+$/, '');
  const indent = (before.match(/\n(\s*)\{\s*name:/) || [, '      '])[1];
  source = source.slice(0, open) + before + `${before.endsWith(',') ? '' : ','}\n${indent}${js(place)}` + '\n' + indent.slice(2) + source.slice(close);
  report.added += 1;
}
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox);
if (Object.values(sandbox.window.BAQUEANO_TERRITORIES).length !== 17) throw new Error('El archivo resultante no tiene 17 territorios');
fs.writeFileSync(FILE, source);
console.log(`Catálogo de naturaleza: ${report.enriched} existentes con coordenadas, ${report.kept} ya tenían coordenada, ${report.added} nuevos.`);
if (report.moved.length) console.log('Reasignados por contorno:\n  ' + report.moved.join('\n  '));
