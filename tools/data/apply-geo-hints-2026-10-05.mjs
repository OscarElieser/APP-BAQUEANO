#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: 25 lugares verificados (base verificada y catálogo INTUR 2026) no aparecen en
 *   OpenStreetMap por su nombre comercial, así que quedaban sin pin ni tarjeta en la franja.
 * ⚙️ CÓMO: se agrega `geoHint` con la comunidad o el municipio QUE FIGURA EN SU DIRECCIÓN
 *   OFICIAL. website/scripts/geocode-territory-places.mjs lo usa solo como respaldo y marca
 *   el punto como aproximado (dentro del contorno del territorio). Idempotente.
 * 📦 QUÉ: `node tools/data/apply-geo-hints-2026-10-05.mjs`.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const FILE = path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..'), 'website/js/territories-data.js');
// nombre del lugar → comunidad/municipio de su dirección oficial
const HINTS = {
  'Rosquillas Delicias del Norte': 'Somoto', 'Finca Entre Pinos': 'San José de Cusmapa', 'Casa de Huésped La Ceibita': 'Somoto',
  'Rancho Los Alpes': 'Poneloya', "Morgan's Rock Reserve & Ecolodge": 'Playa Ocotal', 'Convento e Iglesia San Francisco': 'Iglesia San Francisco, Granada',
  'Treehouse Nicaragua': 'Nandaime', 'Eco Finca El Buen Pastor': 'Nandaime', 'Albergue Tierra Alta Ecolodge': 'San Ramón, Matagalpa',
  'Finca Lindos Ojos': 'Miraflor', 'Ecoposada Tisey': 'Tisey', 'Albergue Familiar Neblina del Bosque': 'Miraflor',
  'ASOPASN · Programa Agrícola San Nicolás': 'San Nicolás, Estelí', 'Finca Agroturística Fuente de Vida': 'Miraflor',
  'Rancho Maribel': 'Somotillo', 'Campamento Ecológico Campuzano': 'Somotillo', 'Cabañas El Manantial': 'Cinco Pinos',
  'Reserva Silvestre Privada Montibelli': 'Ticuantepe', 'Reserva Silvestre Privada La Mákina': 'Diriamba', 'Finca Los Ángeles': 'Juigalpa',
  'Finca Poza Redonda Azul': 'Teustepe', 'Hostal Buen Amigo': 'Mancarrón', 'Finca Agroturística El Cortés': 'Siuna',
  'Garífuna Secrets of the Jungle': 'Orinoco', 'Río Coco / Wangki': 'Waspam'
};
let source = fs.readFileSync(FILE, 'utf8');
let added = 0;
for (const [name, hint] of Object.entries(HINTS)) {
  const keys = [`name: '${name.replace(/'/g, "\\'")}'`, `name: ${JSON.stringify(name)}`];
  const at = keys.map((k) => source.indexOf(k)).find((i) => i >= 0);
  if (at == null || at < 0) throw new Error(`No se encontró ${name}`);
  const lineEnd = source.indexOf('\n', at);
  const line = source.slice(at, lineEnd);
  if (line.includes('geoHint:')) continue;
  const close = line.lastIndexOf('}');
  source = source.slice(0, at) + line.slice(0, close).replace(/\s+$/, '') + `, geoHint: ${JSON.stringify(hint)} ` + line.slice(close) + source.slice(lineEnd);
  added += 1;
}
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox);
fs.writeFileSync(FILE, source);
console.log(`geoHint agregado a ${added} lugares.`);
