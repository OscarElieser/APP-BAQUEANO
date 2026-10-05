#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: el propietario entregó la "Revista de Turismo Rural y Comunitario Nicaragua 2026"
 *   (INTUR, Primer Catálogo de Iniciativas de Turismo Rural y Comunitario: 27 iniciativas).
 *   Cada iniciativa debe aparecer en su departamento/región (franja viva y ficha) y en destinos.html.
 * ⚙️ CÓMO: edición idempotente de website/js/territories-data.js: cada iniciativa se agrega al
 *   final de `places` de su territorio con `verification` (fuente INTUR, actividades, servicios,
 *   horario, dirección, teléfonos publicados y mapa). Los nombres de personas de contacto NO se
 *   copian (dato personal innecesario); los teléfonos sí, porque INTUR los publica para reservar.
 *   Texto original completo: docs/data/INTUR_TURISMO_RURAL_2026.md.
 * 📦 QUÉ: `node tools/data/apply-intur-rural-2026.mjs` (repetirlo no duplica nada).
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FILE = path.join(ROOT, 'website/js/territories-data.js');
const SOURCE = { label: 'INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)', url: '' };
const ICON = { 'Turismo rural': 'fa-house-chimney', 'Turismo rural y comunitario': 'fa-people-group', Agroturismo: 'fa-seedling', 'Turismo de naturaleza': 'fa-tree' };
const map = (id) => `https://www.google.com/maps/d/u/0/edit?mid=${id}&usp=sharing`;

// [territorio, nombre, modalidad, descripción propia (del catálogo), actividades, servicios, horario, dirección, teléfonos, id de mapa]
const R = [
  ['chinandega', 'Rancho Maribel', 'Turismo rural', 'Destino rural para vivir una auténtica experiencia campestre y la hospitalidad de la comunidad, cerca de Somotillo.', 'Cabalgatas por la finca, ordeño de vacas y elaboración de productos lácteos.', 'Alimentos y bebidas, venta de artesanía local y tours.', 'Lunes a domingo, 6:00 a. m.–9:00 p. m.', 'Km 180 carretera a Somotillo, Finca Los 2 Potrillos.', ['8469-2896'], '1x5feOCfIxE6COeQyObhJTXiAWriTH64'],
  ['boaco', 'Finca Poza Redonda Azul', 'Turismo rural', 'Finca agropecuaria sostenible en Teustepe con ganadería, granos, cítricos y una poza natural como atractivo principal.', 'Senderismo al cerro El Diamante y ojo de agua, actividades agropecuarias, fogatas literarias y comida tradicional.', 'Alimentación y bebidas, cabañas, piscina y eventos familiares.', 'Lunes a domingo, 8:00 a. m.–7:00 p. m. (huéspedes hasta 10:00 p. m.).', 'Teustepe, carretera a San José de los Remates, km 82.5 a mano izquierda, 1½ km comunidad San Diego, portón de madera finca El Arbolito.', ['8752-3743'], '1a7sf0EOmz7mutO0b5cKaJ33QapdemHw'],
  ['esteli', 'Finca Lindos Ojos', 'Turismo rural', 'Finca de turismo rural dentro de la Reserva Natural Miraflor Moropotente, con bosques, aves y café orgánico.', 'Caminatas, observación de aves, senderismo, ordeño, cabalgatas y demostración de agricultura orgánica de café.', 'Bebidas, hospedería y cocina para huéspedes.', '9:00 a. m.–6:00 p. m.', 'Comunidad El Cebollal, de la rampa 2 km al oeste, Reserva Miraflor Moropotente.', ['8992-7315'], '1D33pHCZSFRX8nlP8fizGDle4AO1L23Y'],
  ['esteli', 'Ecoposada Tisey', 'Turismo rural', 'Posada ecológica en la Reserva Tisey-Estanzuela con miradores, senderos, cascadas y clima fresco de montaña.', 'Senderismo, observación de flora y fauna, miradores y recorrido por vivero.', 'Alimentos, bebidas y hospedería.', 'Lunes a viernes 8:00 a. m.–6:00 p. m.; sábado y domingo 8:00 a. m.–9:00 p. m.', 'Comunidad Almaciguera, 12 km al sureste de Estelí.', ['8658-4086'], '1vN25WegeowQTfD4M9Q-O4t8FQ-5Ko6U'],
  ['granada', 'Finca El Rayo', 'Turismo rural', 'Finca rural entre paisajes volcánicos, flora y fauna, con sendero de petroglifos que conecta con el pasado precolombino.', 'Caminatas por senderos naturales, observación de aves y exploración de flora y fauna.', 'Alimentos y bebidas, camping, kayak, natación y sendero de petroglifos.', 'Viernes a domingo, 9:00 a. m.–5:00 p. m.', 'De la entrada El Astillero, El Diamante 4 km al este y 3.5 km al sur.', ['8837-0098'], '1W6bI4kom2Cq-MvarHCYx08YyCXR2s7Q'],
  ['esteli', 'Albergue Familiar Neblina del Bosque', 'Turismo rural', 'Albergue familiar en el bosque nublado de Miraflor Moropotente, con huertos, hongos y recorridos botánicos.', 'Senderismo, cabalgatas, huertos, recorridos botánicos, tours de hongos y observación de flora y fauna.', 'Alimentos, bebidas, hospedería y camping.', 'Lunes a domingo, 9:00 a. m.–6:00 p. m.', 'De la rampa 400 metros al oeste, Reserva Miraflor Moropotente.', ['7679-7560'], '1awmyyNPpcP5WSr60aDiI_WU6F-VotDA'],
  ['madriz', 'Finca Entre Pinos', 'Turismo rural', 'Cabañas entre pinos, cedros y robles en El Rodeo de Cusmapa, unidas por puentes colgantes de árbol en árbol.', 'Senderismo, canopy, actividades agrícolas y avistamiento de aves.', 'Alimentación, hospedaje, piscina climatizada, camping, juegos para niños y tienda de recuerdos.', '9:00 a. m.–6:00 p. m.', 'Bulevar de Cusmapa 5 km al este, El Rodeo.', ['8330-4660', '5849-1548'], '1gJEZ4HTewWspc7_qtrxqICCTEkifU5U'],
  ['leon', 'Rancho Los Alpes', 'Turismo rural', 'Rancho de descanso en la comarca San Carlos con balsas de bambú, kayak, tirolesa y taller de tortillas.', 'Senderos, balsas de bambú, kayak y neumáticos, cabalgatas, tours ambientales, taller de tortillas, cultivo de peces y tirolesa.', 'Hospedaje, camping, alimentación y local para eventos.', 'Lunes a domingo, 8:00 a. m.–7:00 p. m. (reservar con 48 horas).', 'Km 99 carretera León–Poneloya, 1.5 km a la derecha por camino de macadán hacia el Centro de Salud de la comarca San Carlos.', ['8803-7085', '8860-9931'], '11yDJH2RrUdILT1SCPfF0UDlJWg1CJlM'],
  ['matagalpa', 'Albergue Tierra Alta Ecolodge', 'Turismo rural', 'Ecolodge en San Ramón con alimentos orgánicos de la finca, plantas medicinales y tours nocturnos de fauna.', 'Senderos con frutos exóticos y cultivos orgánicos, tours nocturnos (murciélagos, búhos, perezosos) y cabalgatas.', 'Alojamiento y alimentación.', 'Lunes a domingo, 8:00 a. m.–5:00 p. m.', 'Entrada a comunidad El Trentino, 1 km al norte de la Escuela San Ramón García, 400 m al norte, San Ramón.', ['8722-8635', '5747-8572'], '1xeQGLfuhxkFpkJWczFHe1DIUgFomB3o'],
  ['chinandega', 'Campamento Ecológico Campuzano', 'Turismo rural y comunitario', 'Campamento comunitario en Ranchería con piscinas naturales, bosque para observar fauna y ranchos de descanso.', 'Observación de flora y fauna, cancha deportiva, senderismo, tours, camping y cabalgata.', 'Alimentos y bebidas, artesanía local y tours.', 'Lunes a domingo, 6:00 a. m.–6:00 p. m.', 'Km 150 carretera a Somotillo, 2 km al oeste, comunidad Campuzano 1.', ['8452-4624'], '19NEj9BlhGLQ0lvp0bn7lVl7_P7zfrDo'],
  ['esteli', 'ASOPASN · Programa Agrícola San Nicolás', 'Turismo rural y comunitario', 'Iniciativa comunitaria en La Garnacha, San Nicolás, con paisajes de montaña, queso de cabra, hortalizas y miradores.', 'Senderismo, tours de queso de cabra, artesanías, hortalizas, avistamiento de aves y miradores.', 'Alimentos, bebidas y hospedaje.', 'Lunes a domingo, 8:00 a. m.–6:00 p. m.', 'Contiguo a la escuela de la comunidad La Garnacha, San Nicolás.', ['8658-1054'], '1ZUb32cBf3i_gJSlNQNWp2Sprp7fBTYo'],
  ['raccs', 'Garífuna Secrets of the Jungle', 'Turismo rural y comunitario', 'Experiencia garífuna cerca de Orinoco, Laguna de Perlas: música, gastronomía, historias ancestrales y selva tropical.', 'Tours a comunidades garífunas, río Wawashan, pesca tradicional, vida silvestre, bailes y música garífuna y saberes de finca.', 'Hospedería, alimentos y bebidas.', 'Lunes a domingo, 8:00 a. m.–5:00 p. m.', '3 km afuera de la comunidad Orinoco, municipio de Laguna de Perlas.', ['8648-4985'], '1e1r8XYLJfIxIXfvCFCRm_n31drOyE9s'],
  ['rio-san-juan', 'Hostal Buen Amigo', 'Turismo rural y comunitario', 'Hostal en la isla Mancarrón, Solentiname, para descansar y conocer las tradiciones artísticas del archipiélago.', 'Caminatas, paseos en bote, talleres de artesanía y cultura local.', 'Alimentos, bebidas, hospedería, piscinas y camping.', 'Lunes a domingo, 7:00 a. m.–8:00 p. m.', 'Isla Mancarrón, del cuadro municipal 100 m al sur.', ['8776-7508', '8961-3200'], '1JVmXW9SioVGQQs52ImHU4cGQBICHsno'],
  ['rio-san-juan', 'Albergue Caimán (Los Guatuzos)', 'Turismo rural y comunitario', 'Albergue ecológico a orillas de los humedales del río Papaturro, en el Refugio de Vida Silvestre Los Guatuzos.', 'Observación de flora y fauna, paisajes tropicales, kayak o bote y proceso del cacao.', 'Hospedaje, alimentos, bebidas, transporte acuático, guía y camping.', 'Lunes a domingo, 7:00 a. m.–9:00 p. m.', 'Comunidad Papaturro, del muelle municipal 100 m al norte, San Carlos.', ['8676-2958'], '1sYj97ccIS_7ybVgF2yEhC9F05BkfXdM'],
  ['rivas', 'Hostal Puesta del Sol (Ometepe)', 'Turismo rural y comunitario', 'Hostal familiar en La Paloma, Moyogalpa, con habitaciones sencillas, playa del lago y clases de cocina nicaragüense.', 'Senderismo, kayak, bicicleta, tours a los volcanes, proceso del vino de jamaica y clases de cocina.', 'Alimentación, hospedaje y playa.', 'Lunes a sábado, 8:00 a. m.–6:00 p. m.', 'Puerto de Moyogalpa 1½ al sur, comunidad La Paloma, escuela 400 m al lago y 175 vrs al sur.', ['8414-0647', '5865-1532', '5888-3095'], '12UuBdxsAO5ic69l9X7e_p1__cV1c_6c'],
  ['rivas', 'Finca Magdalena (Ometepe)', 'Turismo rural y comunitario', 'Finca agroturística emblemática de Altagracia, ejemplo de desarrollo comunitario, con café y petroglifos.', 'Senderismo, tours a petroglifos y tours del café.', 'Alimentación, hospedaje y piscina natural.', 'Lunes a sábado, 6:00 a. m.–9:00 p. m.', 'Café Campestre 20 m al este, 1 km al sur, Altagracia.', ['8608-7984'], '1HaFUqB9NbLmGlUOTiRw8Ih8Z8COdp2o'],
  ['chontales', 'Finca Los Ángeles', 'Agroturismo', 'Propiedad agropecuaria de Juigalpa entre serranías, llanos, bosques y arroyos, abierta a la vida de campo.', 'Cabalgatas, senderismo, actividades agropecuarias y observación de flora y fauna.', 'Alimentos, bebidas, hospedería, piscinas y camping.', 'Lunes a domingo, 6:00 a. m.–8:00 p. m.', 'Km 147 carretera Juigalpa–El Rama.', ['8909-6794'], '1cZcB0bn7mNuAhu3NaY23pYVq66DrGn0'],
  ['esteli', 'Finca Agroturística Fuente de Vida', 'Agroturismo', 'Finca en Miraflor Moropotente para convivir con el campo: café, orquídeas, plantas medicinales, rosquillas y voluntariado.', 'Senderismo, cabalgatas, aves, café, orquídeas y plantas medicinales, agricultura orgánica, granja y elaboración de rosquillas, queso y tortillas.', 'Alimentos, bebidas y hospedería.', 'Lunes a domingo, 8:00 a. m.–6:00 p. m.', 'De la rampa 1½ km al noreste, comunidad El Cebollal.', ['8160-0350'], '1Ms7wbX6q9P3oAqtzQXfOp2EbgAe22cs'],
  ['granada', 'Eco Finca El Buen Pastor', 'Agroturismo', 'Casa de campo en Nandaime con cabañas, piscina y área de meditación, enfocada en la sostenibilidad.', 'Caminatas, giras ecológicas, observación de aves y exploración de flora y fauna.', 'Cabañas, alimentos y bebidas, juegos para niños, piscina, meditación y camping.', 'Viernes a domingo, 8:00 a. m.–5:00 p. m. (con reservación).', 'Km 60.5 carretera Panamericana Sur, Nandaime.', ['8854-2029'], '1YLbA-KdYFfgFE1x20ZCZsy9tL0hI9r4'],
  ['madriz', 'Casa de Huésped La Ceibita', 'Agroturismo', 'Casa de familias anfitrionas junto al Cañón de Somoto, con tours al cañón y oficios tradicionales del campo.', 'Senderismo, actividades agropecuarias, cabalgata, neumático, apicultura, ordeño y fogatas.', 'Alimentación, hospedaje, tours al cañón y guía turístico.', 'Lunes a domingo, 6:00 a. m.–9:00 p. m.', 'Entrada principal al Cañón de Somoto, 250 m al suroeste, Somoto.', ['8919-9199'], '1qEo_gKYBh1qKs2ralmJFYM7KpFhlgJo'],
  ['managua', 'Hotel Bosque Las Nubes', 'Agroturismo', 'Bosque nuboso de clima fresco en El Crucero, con árboles centenarios, senderos entre la niebla y café de la finca.', 'Senderismo, cabalgata, flora y fauna, tour por cafetales, exposición y venta de café.', 'Alimentos, bebidas y hospedería.', '6:00 a. m.–5:00 p. m.', 'Del parque 1.5 km al este, El Crucero.', ['2278-1334', '8473-6684'], '1a2meFNl_1jJg3C6UT66jdt3QRxFNjuo'],
  ['managua', 'Finca Las Delicias', 'Agroturismo', 'Finca cafetalera entre montañas y neblina con vistas al lago Xolotlán, el volcán Momotombo y Chiltepe.', 'Senderismo, observación de aves y tours por cafetales.', 'Hospedería, alimentación y venta de café.', '6:00 a. m.–6:00 p. m.', 'Parque de El Crucero, Los Guatuzos, 3.5 km Las Nubes, 600 m al noroeste.', ['7886-2969'], '1r09KfSNCICLZkkdyLr-zg-6dGe2wgSU'],
  ['raccn', 'Finca Agroturística El Cortés', 'Agroturismo', 'Finca de Siuna que une bosque denso y producción sostenible de cacao, granos y animales con la comunidad local.', 'Senderismo, camping, actividades agropecuarias, flora, fauna y aves.', 'Alimentos, bebidas, cabañas, piscinas para niños y camping.', 'Jueves a domingo, 2:00 p. m.–9:00 p. m.', 'Comunidad Campo Uno, del barrio Gilberto Romero 3 km al noreste, Siuna.', ['8495-9820'], '1XOFQIQ2p8s6_qUgbZZo4qnOkoLe5rnY'],
  ['chinandega', 'Cabañas El Manantial', 'Turismo de naturaleza', 'Reserva Silvestre Privada en Cinco Pinos con bosques, huertos y vivero, y cabañas para dormir en la naturaleza.', 'Senderismo, cabalgatas, flora y fauna, huertos y vivero.', 'Alojamiento, alimentos y bebidas.', 'Lunes a domingo, 6:00 a. m.–6:00 p. m.', 'APROSEDE 300 m al sur, comunidad El Espino, Cinco Pinos.', ['8718-7889'], '1RDeL_Ju0LBCMqnELjCZe5DC2S-iI978'],
  ['carazo', 'Reserva Silvestre Privada La Mákina', 'Turismo de naturaleza', 'Santuario de biodiversidad camino a La Boquita con cascada, kayak, canopy y educación ambiental.', 'Observación de aves, senderismo, cascada, kayak, camping y canopy.', 'Alimentos, bebidas, diversiones y camping.', 'Sábado y domingo 8:00 a. m.–6:00 p. m.; lunes a viernes 9:00 a. m.–4:00 p. m. con reservación.', 'Km 58 carretera Diriamba–playa La Boquita.', ['8675-2919'], '1NA9gXfePzc4s9Vc-WxMBgUbKa641_No'],
  ['granada', 'Finca María Auxiliadora', 'Turismo de naturaleza', 'Refugio rural entre Granada y Diriomo con frutales, maderas, tres senderos y siembra participativa.', 'Senderos, aves, siembra y cosecha de frutales y forestales, flora y fauna.', 'Alimentos, bebidas, piscinas, camping, tres rutas de senderismo y aves.', 'Lunes a domingo, 6:00 a. m.–5:00 p. m. (con reservación).', 'Carretera Granada–Diriomo km 53.5 (IMMSA), 800 m al oeste.', ['8538-3814'], '1_aF-9soYpiBy3mofkbdmA_qPaFtO22s'],
  ['managua', 'Reserva Silvestre Privada Montibelli', 'Turismo de naturaleza', 'Reserva de bosque con seis miradores hacia las sierras de Managua y los volcanes Masaya y Mombacho.', 'Senderismo, monitoreo de flora y fauna, tours nocturnos y camping.', 'Alimentos y bebidas, hospedería y actividades al aire libre.', '8:00 a. m.–5:00 p. m. (con reservación).', 'Km 18.5 carretera Ticuantepe–La Concha, 3 km al oeste, comunidad Enramada N.º 2.', ['2220-9801', '8730-7326'], '']
];

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
let added = 0;
for (const [id, name, modality, desc, activities, services, hours, address, phones, mapId] of R) {
  const { open, close } = territoryRange(id);
  if (source.slice(open, close).includes(js(name))) continue;
  const place = {
    name, type: `${modality} · ${activities.split(/,| y /)[0].trim()}`, icon: ICON[modality], desc,
    verification: {
      status: 'verified', verifiedAt: '2026-10-05', modality,
      facts: desc, activities, services, hours, address, phones,
      ...(mapId ? { map: map(mapId) } : {}),
      contact: 'Contacto publicado por INTUR en el catálogo 2026; confirmar antes de viajar.',
      sources: [SOURCE]
    }
  };
  const before = source.slice(open, close).replace(/\s+$/, '');
  const indent = (before.match(/\n(\s*)\{\s*name:/) || [, '      '])[1];
  source = source.slice(0, open) + before + `${before.endsWith(',') ? '' : ','}\n${indent}${js(place)}` + '\n' + indent.slice(2) + source.slice(close);
  added += 1;
}
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox);
if (Object.values(sandbox.window.BAQUEANO_TERRITORIES).length !== 17) throw new Error('El archivo resultante no tiene 17 territorios');
fs.writeFileSync(FILE, source);
console.log(`INTUR Turismo Rural y Comunitario 2026: ${added} iniciativas agregadas (de ${R.length}).`);
