// Regresiones de veracidad pública BAQUEANO. Ejecutar: node scripts/critical-public-data.test.mjs
// No requiere Supabase, credenciales, red ni despliegue.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => readFileSync(join(root, name), 'utf8');
const aliados = read('aliados.html');
const alliesJs = read('js/allies-directory.js');
const destinos = read('destinos.html');
const index = read('index.html');
const mapa = read('mapa.html');
const cookies = read('cookies.html');

const gridStart = aliados.indexOf('<div class="aliados-grid-exact" id="aliadosCardsGrid"');
const nearStart = aliados.indexOf('<div class="aliados-nearby-list">');
assert.ok(gridStart >= 0 && nearStart > gridStart, 'El directorio debe tener contenedor de aliados');
const grid = aliados.slice(gridStart, nearStart);

assert.doesNotMatch(grid, /<article class="aliado-card-exact"/, 'Prohibidas fichas ficticias de respaldo');
assert.doesNotMatch(grid, /href="departamento\.html[^"]*" class="btn-aliado-profile"/, 'El perfil no puede enviar al departamento');
assert.doesNotMatch(aliados, /const aliadosPins\s*=\s*\[/, 'No publicar pines estáticos de supuestos aliados');
assert.doesNotMatch(aliados, /~\s*\d+\s*km\s*·\s*Verificado/, 'Prohibidas distancias arbitrarias');
assert.match(aliados, /getMapPoints\(\)/, 'El mapa debe leer coordenadas del directorio');
assert.match(aliados, /BaqueanoAllies\.sortNear/, 'El botón Cercanía debe ordenar realmente');
assert.match(alliesJs, /is_published=eq\.true&deleted_at=is\.null/, 'Solo negocios publicados en el directorio');
assert.match(alliesJs, /getMapPoints: publishedMapPoints/, 'Los puntos deben ser dinámicos');
assert.match(alliesJs, /kmBetween\(state\.userLocation/, 'La cercanía debe ser geográfica');

assert.doesNotMatch(destinos, /<div class="dest-highlight-rating">[^\n]*\d\.\d\s*\([\d,]+\)/, 'Prohibidas puntuaciones HTML sin fuente');
assert.doesNotMatch(index, /<span class="dest-card-rating">[^\n]*\d\.\d\s*\([\d,]+\)/, 'Prohibidos conteos de reseñas prefijados');
assert.doesNotMatch(destinos, /<div[^>]+class="dest-highlight-price">Desde C\$\s*[\d,]+/, 'Prohibidas tarifas fijas sin proveedor');

assert.match(mapa, /navigator\.geolocation\.getCurrentPosition/, 'SOS debe solicitar GPS real');
assert.doesNotMatch(mapa, /id="sosGpsDisplay"[^>]*>[^<]*12\.5061/, 'Prohibida coordenada de ejemplo en campo SOS');
assert.doesNotMatch(aliados, /12\.5061° N, 86\.7022° W \(Referencia Nacional\)/, 'Prohibido sustituir GPS fallido por referencia');
assert.match(cookies, /Ley de Protección de los Derechos de las Personas Consumidoras y Usuarias/, 'Denominación correcta de Ley 842');
assert.doesNotMatch(cookies, /Ley 842<\/strong>\s*<span[^>]*>— Ley de Protección del Medio Ambiente/, 'Ley 842 no es ambiental');

console.log('OK: contenido crítico verificado sin conexiones externas ni despliegues.');
