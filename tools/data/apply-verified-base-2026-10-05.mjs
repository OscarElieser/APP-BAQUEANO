#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: el propietario entregó una base verificada (docs/data/BASE_VERIFICADA_2026-10-05.md)
 *   con 19 registros: 13 lugares que ya están en su departamento y 6 negocios nuevos.
 *   Deben quedar en su departamento/región, con fuente oficial y sin datos no comprobados
 *   (ni teléfonos de terceros, ni calificaciones, ni precios sin fecha).
 * ⚙️ CÓMO: edición idempotente de website/js/territories-data.js. A cada lugar existente
 *   (buscado por nombre exacto dentro de su territorio) se le agrega `verification`; los
 *   lugares nuevos se insertan al final de `places` de su territorio. Si ya tienen
 *   `verification`, no se tocan. Se valida cargando el archivo resultante.
 * 📦 QUÉ: `node tools/data/apply-verified-base-2026-10-05.mjs` (una sola vez; repetirlo no cambia nada).
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FILE = path.join(ROOT, 'website/js/territories-data.js');
const AT = '2026-10-05';
const src = (label, url) => ({ label, url });
const MARENA = 'MARENA', INTUR = 'INTUR', VISITA = 'Visit Nicaragua', MAPA = 'Mapa Nacional de Turismo';

// Lugares que ya existen: nombre exacto en territories-data.js.
const EXISTING = [
  ['madriz', 'Monumento Nacional Cañón de Somoto', {
    facts: 'Monumento Nacional reconocido por INTUR y MARENA. MARENA informa un recorrido de aproximadamente 4 km y aguas de hasta 18 m de profundidad.',
    price: 'MARENA (03/04/2025): C$35 nacionales y C$108 visitantes de otras nacionalidades. Revalidar antes del viaje.',
    contact: 'Canales oficiales de INTUR/MARENA o guías locales validados.',
    sources: [src(INTUR, 'https://www.intur.gob.ni/2026/02/26/listo-para-desafiar-al-canon-de-somoto/'), src(MARENA, 'https://www.marena.gob.ni/2025/04/03/acompanamiento-al-comite-de-manejo-colaborativo-del-monumento-nacional-canon-de-somoto/')] }],
  ['leon', 'Volcán Cerro Negro', {
    facts: 'Área protegida administrada por MARENA (Reserva Natural Complejo Volcánico Cerro Negro). Se formó en 1850, tiene 726 m y es uno de los principales destinos de sandboarding del país.',
    price: 'La tarifa de sandboarding depende de cada operador; consultá con el proveedor y la fecha.',
    contact: 'Información institucional: MARENA.',
    sources: [src(MARENA, 'https://www.marena.gob.ni/2026/07/09/volcan-cerro-negro-recibe-la-visita-de-mas-de-34-mil-turistas'), src(MARENA, 'https://www.marena.gob.ni/2025/04/13/volcan-cerro-negro/')] }],
  ['rivas', 'Reserva de Biosfera Isla de Ometepe', {
    facts: 'Destino oficial de Nicaragua formado por los volcanes Concepción y Maderas. Visit Nicaragua destaca senderismo, la laguna del cráter del Maderas y la Cascada de San Ramón.',
    price: 'Cada servicio tiene proveedor y precio distinto; no hay una tarifa única.',
    contact: 'INTUR cuenta con delegación en la Isla de Ometepe; los servicios privados se verifican uno por uno.',
    sources: [src(INTUR, 'https://www.intur.gob.ni/recinto/isla-de-ometepe/'), src(VISITA, 'https://www.visitanicaragua.com/islas/isla-de-ometepe/')] }],
  ['rivas', 'Maderas, Marsella, Remanso, Hermosa y El Coco', {
    facts: 'Playa Maderas está reconocida oficialmente por INTUR y el Mapa Nacional de Turismo; destaca por sus olas y la práctica de surf.',
    price: 'Acceso y servicios de surf: consultar con el proveedor.',
    contact: 'Sin escuela ni teléfono asociado hasta tener ficha comercial verificada.',
    sources: [src(INTUR, 'https://www.intur.gob.ni/2021/09/13/torneo-centroamericano-de-surf-se-despide-de-playa-maderas/'), src(MAPA, 'https://www.mapanicaragua.com/municipio-de-san-juan-del-sur/')] }],
  ['rivas', 'San Juan del Sur y Cristo de la Misericordia', {
    facts: 'La bahía es uno de los principales atractivos del municipio. El Cristo de la Misericordia es una escultura de 15 m sobre un pedestal de 9 m y funciona como mirador panorámico.',
    price: 'Consultar la tarifa vigente en el sitio.',
    sources: [src(MAPA, 'https://www.mapanicaragua.com/municipio-de-san-juan-del-sur/'), src(MAPA, 'https://www.mapanicaragua.com/arquitectura-de-san-juan-del-sur/page/4/')] }],
  ['rivas', 'Cascada de San Ramón', {
    facts: 'Atractivo reconocido por Visit Nicaragua, en la comunidad de San Ramón (Altagracia), en las faldas del volcán Maderas; se llega caminando.',
    price: 'Consultar la tarifa vigente en el acceso.',
    sources: [src(VISITA, 'https://www.visitanicaragua.com/islas/isla-de-ometepe/')] }],
  ['rivas', 'Refugio de Vida Silvestre La Flor', {
    facts: 'Área protegida de 7,349 hectáreas y uno de los principales sitios de anidación de tortugas marinas. MARENA reportó una arribada de 30,388 hembras paslama en septiembre de 2026.',
    price: 'MARENA (15/04/2025): C$100 nacionales y C$200 visitantes de otras nacionalidades; niños pagan la mitad. Horario especial publicado en septiembre de 2026: 8:30 a. m.–5:00 p. m. Revalidar.',
    contact: 'Información institucional: MARENA.',
    sources: [src(MARENA, 'https://www.marena.gob.ni/2026/09/08/ii-arribada-de-tortugas-en-la-flor/'), src(MARENA, 'https://www.marena.gob.ni/2025/04/15/refugio-de-vida-silvestre-la-flor-en-san-juan-del-sur-un-sitio-para-descubrir-en-semana-santa/')] }],
  ['raccs', 'Corn Island & Little Corn Island', {
    facts: 'Destino oficial del Caribe nicaragüense. Visit Nicaragua resalta playas de arena blanca, aguas transparentes, cultura afrocaribeña, gastronomía, snorkel, buceo y kayak.',
    price: 'Panga, snorkel, cabañas y taxi tienen precio por proveedor y fecha; consultar.',
    contact: 'Alojamiento, panga y buceo se registran como proveedores separados.',
    sources: [src(VISITA, 'https://www.visitanicaragua.com/islas/great-corn-island/')] }],
  ['matagalpa', 'Reserva Silvestre Selva Negra', {
    facts: 'Selva Negra Ecolodge, en el km 140 de la carretera Matagalpa–Jinotega: ecolodge y hacienda cafetalera real. Su sitio oficial indica operación desde 1975 y al menos 600 hectáreas entre área protegida y productiva.',
    price: 'Consultar la tarifa vigente directamente con el establecimiento.',
    phones: ['+505 8100-9100', '+505 2770-1963'], whatsapp: '+505 8509-4871', email: 'info@selvanegra.com',
    sources: [src('Sitio oficial', 'https://selvanegramatagalpa.wixsite.com/snpatrio2024/acerca-de')] }],
  ['masaya', 'Parque Nacional Volcán Masaya', {
    facts: 'Área administrada por MARENA (aprox. km 23 carretera Managua–Masaya). La Plaza Oviedo reabrió en diciembre de 2025 y permite apreciar la incandescencia del volcán Santiago bajo medidas de seguridad.',
    price: 'Horario general reportado por MARENA (17/07/2026): lunes a domingo, 8:30 a. m. a 7:00 p. m.; puede cambiar por actividad volcánica. Tarifa: consultar publicación oficial vigente.',
    contact: 'Información institucional: MARENA.',
    sources: [src(MARENA, 'https://www.marena.gob.ni/2026/07/17/mas-visitas-en-volcan-masaya/'), src(MARENA, 'https://www.marena.gob.ni/2025/12/20/marena-anuncia-reapertura-de-la-plaza-oviedo-del-parque-nacional-volcan-masaya/')] }],
  ['granada', 'Centro Histórico y Calle La Calzada', {
    facts: 'Eje emblemático del centro histórico con edificios coloniales que comunica el centro con el Lago Cocibolca. El Mapa Nacional de Turismo la identifica como uno de los principales puntos de vida nocturna de Granada.',
    price: 'Cada restaurante, bar y comercio maneja su propia ficha y precios.',
    contact: 'No existe un teléfono único de la calle ni una asociación que represente toda la oferta.',
    sources: [src(MAPA, 'https://www.mapanicaragua.com/local/calle-la-calzada/'), src(MAPA, 'https://www.mapanicaragua.com/granada/')] }],
  ['granada', 'Convento e Iglesia San Francisco', {
    facts: 'Conjunto histórico fundado en 1529 como Inmaculada Concepción. Hoy funciona como Centro Cultural Museo Convento San Francisco, con arte precolombino, pintura primitivista, arte religioso y mobiliario tradicional.',
    price: 'Consultar la tarifa vigente en el museo.',
    sources: [src(MAPA, 'https://www.mapanicaragua.com/municipio-de-granada/'), src(MAPA, 'https://www.mapanicaragua.com/arquitectura-de-granada/page/2/')] }],
  ['rio-san-juan', 'Fortaleza de la Inmaculada Concepción (El Castillo)', {
    facts: 'Fortaleza colonial construida entre 1672 y 1675 para proteger la ruta del Río San Juan; es Patrimonio Cultural de la Nación y uno de los principales valores históricos del municipio.',
    price: 'Consultar la tarifa vigente en el sitio.',
    sources: [src(MAPA, 'https://www.mapanicaragua.com/arquitectura-de-el-castillo/'), src(MAPA, 'https://www.mapanicaragua.com/cultura-de-el-castillo/')] }]
];

// Negocios nuevos en su departamento (descripción propia, sin cifras).
const NEW = [
  ['madriz', { name: 'Rosquillas Delicias del Norte', type: 'Gastronomía y emprendimiento local', icon: 'fa-cookie-bite',
    desc: 'Taller de rosquillas somoteñas que INTUR y el Mapa Nacional de Turismo mencionan como referencia en Somoto.' }, {
    facts: 'Empresa real de rosquillas somoteñas en Somoto. Fuentes periodísticas identifican a Flora (Florita) Ortiz como fundadora.',
    price: 'Consultar precio y horario al establecimiento.',
    contact: 'Contacto pendiente de confirmar directamente con el negocio.',
    sources: [src(MAPA, 'https://www.mapanicaragua.com/municipio-de-somoto/'), src(INTUR, 'https://www.intur.gob.ni/2015/06/25/mpymes-de-granada-y-madriz-intercambian-experiencias/')] }],
  ['leon', { name: 'Poco a Poco Hostel', type: 'Hostal en el centro de León', icon: 'fa-bed',
    desc: 'Hostal en León con piscina, cocina compartida, jardín, bar, habitaciones privadas y dormitorios.' }, {
    facts: 'Hostel real en León (2da Calle NO, Iglesia Bautista ½ c. arriba). Su sitio oficial indica piscina, cocina, jardín, bar, habitaciones privadas y dormitorios.',
    price: 'Tarifa dinámica por fecha y tipo de habitación; consultar el sitio oficial.',
    phones: ['+505 8295-5534', '+505 7631-8789'], website: 'https://www.pocoapocohostel.com/',
    sources: [src('Sitio oficial', 'https://www.pocoapocohostel.com/')] }],
  ['rivas', { name: "Morgan's Rock Reserve & Ecolodge", type: 'Ecolodge y reserva privada en Playa Ocotal', icon: 'fa-leaf',
    desc: 'Ecolodge en Playa Ocotal, San Juan del Sur, con reserva privada protegida, bungalows, villas y actividades de naturaleza.' }, {
    facts: 'Ecolodge real en una propiedad de 4,000 acres; cerca de la mitad es reserva privada protegida. Ofrece bungalows, villas y actividades de naturaleza.',
    price: 'Consultar disponibilidad y tarifa en el sitio oficial.',
    phones: ['+505 8670-7676'], whatsapp: '+505 8988-7176', email: 'reservations@morgansrock.com', website: 'https://www.morgansrock.com/',
    sources: [src('Sitio oficial', 'https://www.morgansrock.com/'), src('Sitio oficial', 'https://www.morgansrock.com/es/servicios')] }],
  ['masaya', { name: 'Posada Ecológica La Abuela – Laguna de Apoyo', type: 'Hotel-restaurante y pase de día en la laguna', icon: 'fa-water',
    desc: 'Hotel-restaurante a orillas de la Laguna de Apoyo con cabañas y pase de día para disfrutar del agua y el bosque.' }, {
    facts: 'Hotel-restaurante real en el entorno de la Laguna de Apoyo; acceso principal en el km 37.9, 2 km al norte desde el triángulo.',
    price: 'Sitio oficial (2026): pase de día adulto US$17.25 (US$12.25 consumibles); cabaña para 2 personas US$81.90 con impuestos. Revalidar antes de comprar.',
    phones: ['2520-1634', '2520-5563'], whatsapp: '8822-8513', email: 'info@posadaecologicalaabuela.com.ni', website: 'https://www.posadaecologicalaabuela.com.ni/',
    sources: [src('Sitio oficial', 'https://www.posadaecologicalaabuela.com.ni/Page/Contacto'), src('Sitio oficial', 'https://www.posadaecologicalaabuela.com.ni/Page/Servicios')] }],
  ['granada', { name: 'Hotel Darío', type: 'Hotel boutique colonial en La Calzada', icon: 'fa-hotel',
    desc: 'Hotel boutique de arquitectura colonial sobre la Calle La Calzada, en pleno centro histórico de Granada.' }, {
    facts: 'Hotel boutique colonial real en el centro de Granada (Calle La Calzada). Google Hotels y publicaciones del establecimiento coinciden en el teléfono principal.',
    price: 'Tarifa dinámica: consultar para las fechas exactas del viaje.',
    phones: ['+505 2552-3400'], website: 'http://www.hoteldario.com/',
    sources: [src('Google Hotels', 'https://www.google.com.ni/travel/hotels/entity/ChgIlMGj0J3IydGoARoLL2cvMXRmNGcyazAQAQ'), src('Sitio oficial', 'http://www.hoteldario.com/')] }],
  ['granada', { name: 'Treehouse Nicaragua', type: 'Hostal y espacio de eventos junto al Mombacho', icon: 'fa-tree',
    desc: 'Hostal entre los árboles en la comarca Poste Rojo, a las afueras de Granada en el entorno del volcán Mombacho.' }, {
    facts: 'Negocio real a unos 20 minutos de Granada (km 57.5 carretera Granada–Nandaime, comarca Poste Rojo). Funciona como hostel y espacio de eventos; su web indica que solo acepta efectivo.',
    price: 'Consultar tarifa o entrada según alojamiento o evento.',
    whatsapp: '+505 8550-3093', email: 'hello@treehousenicaragua.com', website: 'https://www.treehousenicaragua.com/',
    sources: [src('Sitio oficial', 'https://www.treehousenicaragua.com/faqs'), src('Sitio oficial', 'https://www.treehousenicaragua.com/about')] }]
];

const block = (v) => {
  const out = { status: 'verified', verifiedAt: AT, facts: v.facts, price: v.price };
  ['contact', 'phones', 'whatsapp', 'email', 'website'].forEach((k) => { if (v[k]) out[k] = v[k]; });
  out.sources = v.sources;
  return out;
};
const js = (value) => JSON.stringify(value).replace(/"([a-zA-Z]+)":/g, '$1: ');

let source = fs.readFileSync(FILE, 'utf8');
function territoryRange(id) {
  const start = source.search(new RegExp(`\\bid:\\s*['"]${id.replace('-', '\\-')}['"]`));
  if (start < 0) throw new Error(`Territorio no encontrado: ${id}`);
  const placesAt = source.indexOf('places:', start);
  const open = source.indexOf('[', placesAt);
  let depth = 0, i = open;
  for (; i < source.length; i += 1) { if (source[i] === '[') depth += 1; else if (source[i] === ']') { depth -= 1; if (!depth) break; } }
  return { open, close: i };
}
let added = 0, enriched = 0;
for (const [id, name, data] of EXISTING) {
  const { open, close } = territoryRange(id);
  const section = source.slice(open, close);
  const key = `name: '${name.replace(/'/g, "\\'")}'`;
  const at = section.indexOf(key);
  if (at < 0) throw new Error(`Lugar no encontrado en ${id}: ${name}`);
  const lineEnd = section.indexOf('\n', at);
  const line = section.slice(at, lineEnd);
  if (line.includes('verification:')) continue;
  const closeBrace = line.lastIndexOf('}');
  const updated = line.slice(0, closeBrace).replace(/\s+$/, '') + `, verification: ${js(block(data))} ` + line.slice(closeBrace);
  source = source.slice(0, open + at) + updated + source.slice(open + lineEnd);
  enriched += 1;
}
for (const [id, place, data] of NEW) {
  const { open, close } = territoryRange(id);
  if (source.slice(open, close).includes(`name: ${JSON.stringify(place.name)}`) || source.slice(open, close).includes(`name: '${place.name}'`)) continue;
  const before = source.slice(open, close).replace(/\s+$/, '');
  const indent = (before.match(/\n(\s*)\{\s*name:/) || [, '      '])[1];
  const entry = `${before.endsWith(',') ? '' : ','}\n${indent}${js(Object.assign({}, place, { verification: block(data) }))}`;
  source = source.slice(0, open) + before + entry + '\n' + indent.slice(2) + source.slice(close);
  added += 1;
}

// Validación: el archivo resultante carga y conserva todos los territorios.
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox);
const list = Object.values(sandbox.window.BAQUEANO_TERRITORIES);
if (list.length !== 17) throw new Error('El archivo resultante no tiene 17 territorios');
fs.writeFileSync(FILE, source);
console.log(`Base verificada ${AT}: ${enriched} lugares verificados, ${added} lugares nuevos.`);
