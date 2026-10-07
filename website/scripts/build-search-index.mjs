/**
 * 🧭 BAQUEANO — GENERADOR DEL ÍNDICE DEL BUSCADOR GLOBAL (build-search-index.mjs)
 *
 * 🎯 POR QUÉ:
 * - El propietario pide un buscador global DENTRO de la plataforma: escribir
 *   "playa", "León" o "volcanes" debe llevar directo al punto exacto
 *   (categoría filtrada, territorio, ficha del destino, plato, artista…).
 * - Cargar los catálogos completos (≈180 KB) en cada página para buscar
 *   sería lento; un índice compacto se descarga solo al abrir el buscador.
 *
 * ⚙️ CÓMO:
 * - Lee los catálogos REALES que ya usa el sitio (sin datos inventados):
 *   js/territories-data.js (17 territorios, lugares, municipios, platos,
 *   actividades), js/baqueano-master-catalog.js (destinos, rutas, paquetes),
 *   js/destination-dossier.js (fichas con ?id=) y js/sonora-data.js (artistas).
 * - Cada registro guarda: título, tipo, URL de destino, descripción corta,
 *   departamento y palabras clave normalizadas (sin tildes).
 * - Enlaces profundos ya soportados por las páginas: destinos.html?categoria=,
 *   departamento.html?id=, destino.html?id=, mapa.html?q=.
 * - "Directo al punto": cuando el elemento vive DENTRO de una página (un
 *   municipio en su departamento, un plato, un artista, una ruta) el enlace
 *   lleva `ir=<nombre>`; js/global-injector.js (initSearchSpotlight) ubica ese
 *   elemento al cargar, lo centra en pantalla y lo resalta.
 *
 * 📦 QUÉ:
 * - Escribe website/data/search-index.json. Ejecutar al cambiar catálogos:
 *   `node scripts/build-search-index.mjs` (desde website/).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(path.join(ROOT, rel), 'utf8');

function loadGlobals(rel) {
  const sandbox = { window: {}, document: { addEventListener() {}, readyState: 'complete', querySelector: () => null, querySelectorAll: () => [] }, console };
  sandbox.window.window = sandbox.window;
  vm.createContext(sandbox);
  vm.runInContext(read(rel), sandbox, { filename: rel });
  return sandbox.window;
}

// Extrae el objeto literal DESTINATIONS_DB sin ejecutar el código de interfaz.
function loadDossier() {
  const src = read('js/destination-dossier.js');
  const start = src.indexOf('const DESTINATIONS_DB = {');
  let depth = 0;
  let end = -1;
  for (let i = src.indexOf('{', start); i < src.length; i += 1) {
    if (src[i] === '{') depth += 1;
    else if (src[i] === '}') { depth -= 1; if (depth === 0) { end = i + 1; break; } }
  }
  return vm.runInNewContext(`(${src.slice(src.indexOf('{', start), end)})`);
}

const norm = (value) => String(value || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]+/g, ' ').replace(/\s+/g, ' ').trim();
const short = (value, max = 140) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
};

const records = [];
const seen = new Set();
// Salto al elemento exacto dentro de la página (ver initSearchSpotlight).
// Sin el paréntesis aclaratorio: la página muestra "Ruta del Oro (6 Días)",
// no "Ruta del Oro (Ruta Interoceánica del Tránsito)".
const spot = (url, name) => `${url}${url.includes('?') ? '&' : '?'}ir=${encodeURIComponent(String(name).replace(/\s*\([^)]*\)\s*/g, ' ').trim())}`;
function add(record) {
  const key = `${record.k}|${norm(record.t)}|${record.u}`;
  if (seen.has(key)) return;
  seen.add(key);
  records.push({
    t: record.t, k: record.k, u: record.u, d: short(record.d), dep: record.dep || '',
    s: norm([record.t, record.dep, record.keywords].filter(Boolean).join(' ')), i: record.i || ''
  });
}

// ── 1. Categorías de destinos.html (data-category reales) ────────────────────
const CATEGORIES = [
  ['playa', 'Playas', 'fa-solid fa-umbrella-beach', 'playa playas costa mar oceano pacifico caribe surf arena olas balneario'],
  ['volcan', 'Volcanes', 'fa-solid fa-volcano', 'volcan volcanes crater lava cerro senderismo sandboarding'],
  ['agua', 'Lagos, ríos y lagunas', 'fa-solid fa-water', 'agua lago lagos laguna lagunas rio rios cascada cascadas salto nadar kayak'],
  ['bosque', 'Bosques y reservas', 'fa-solid fa-tree', 'bosque bosques reserva reservas selva nebliselva area protegida biosfera'],
  ['naturaleza', 'Naturaleza', 'fa-solid fa-leaf', 'naturaleza ecoturismo aves fauna flora paisaje mirador'],
  ['aventura', 'Aventura', 'fa-solid fa-person-hiking', 'aventura adrenalina canopy senderismo escalada kayak surf'],
  ['cultura', 'Cultura y ciudades', 'fa-solid fa-landmark', 'cultura ciudad ciudades colonial coloniales iglesia catedral museo patrimonio'],
  ['gastronomia', 'Gastronomía', 'fa-solid fa-utensils', 'gastronomia comida restaurante platos tipico cafe cacao'],
  ['hospedaje', 'Hospedaje', 'fa-solid fa-bed', 'hospedaje hotel hoteles hostal alojamiento dormir cabanas eco lodge'],
  ['nocturna', 'Vida nocturna', 'fa-solid fa-moon', 'noche nocturna bares fiesta musica en vivo']
];
for (const [id, title, icon, keywords] of CATEGORIES) {
  add({ k: 'categoria', t: title, u: `destinos.html?categoria=${id}`, d: `Destinos de Nicaragua: ${title.toLowerCase()}.`, keywords, i: icon });
}

// ── 2. Territorios (17 departamentos) y su contenido ─────────────────────────
const territories = loadGlobals('js/territories-data.js').BAQUEANO_TERRITORIES || [];
const dossier = loadDossier();
const dossierByName = new Map(Object.values(dossier).map((d) => [norm(d.title), d]));
// Lugares que mapa.html sabe ubicar (NICARAGUA_PLACES en mapa.html).
const MAP_PLACES = [...read('mapa.html').matchAll(/name:\s*'([^']+)'/g)].map((m) => m[1]);
const STOPWORDS = new Set(['san', 'del', 'las', 'los', 'the', 'por', 'con']);
const words = (text) => norm(text).split(' ').filter((w) => w.length >= 3 && !STOPWORDS.has(w));
// Destino directo: ficha (destino.html?id=) > punto en el mapa > su territorio.
function placeUrl(name, territoryId) {
  const n = norm(name);
  for (const [key, d] of dossierByName) {
    if (key && (n.includes(key) || key.includes(n))) return `destino.html?id=${encodeURIComponent(d.id)}`;
  }
  const nameWords = words(name);
  const mapHit = MAP_PLACES.find((m) => {
    const mw = words(m);
    // Todas las palabras significativas del lugar del mapa deben aparecer.
    return mw.length > 0 && mw.every((w) => nameWords.includes(w));
  });
  if (mapHit) return `mapa.html?q=${encodeURIComponent(mapHit)}`;
  return territoryId ? `departamento.html?id=${encodeURIComponent(territoryId)}` : `destinos.html?q=${encodeURIComponent(name)}`;
}
for (const t of territories) {
  const url = `departamento.html?id=${encodeURIComponent(t.id)}`;
  add({
    k: 'departamento', t: t.name, u: url, dep: t.name, i: 'fa-solid fa-map',
    d: t.tagline || t.shortDesc,
    keywords: [t.capital, t.culturalRegion, 'departamento territorio', t.territoriesList].join(' ')
  });
  for (const m of t.municipalities || []) {
    add({ k: 'municipio', t: m.name, u: spot(url, m.name), dep: t.name, i: 'fa-solid fa-location-dot', d: m.title || m.desc, keywords: `municipio ${m.badge || ''}` });
  }
  for (const p of t.places || []) {
    const target = placeUrl(p.name, t.id);
    add({ k: 'lugar', t: p.name, u: target.startsWith('departamento.html') ? spot(target, p.name) : target, dep: t.name, i: 'fa-solid fa-map-pin', d: `${p.type || 'Lugar'} · ${t.name}`, keywords: p.type });
  }
  for (const g of t.gastronomy || []) {
    // El plato regional se muestra en la sección de gastronomía de su territorio.
    add({ k: 'plato', t: g.name, u: spot(url, g.name), dep: t.name, i: 'fa-solid fa-bowl-food', d: g.desc, keywords: 'comida plato gastronomia tipico' });
  }
}

// ── 3. Fichas de destino (destino.html?id=) ──────────────────────────────────
for (const d of Object.values(dossier)) {
  add({
    k: 'destino', t: d.title, u: `destino.html?id=${encodeURIComponent(d.id)}`, dep: d.department, i: 'fa-solid fa-mountain-sun',
    d: d.subtitle || d.description, keywords: [d.category, d.municipality].join(' ')
  });
}

// ── 4. Catálogo maestro: destinos, rutas y paquetes ──────────────────────────
const master = loadGlobals('js/baqueano-master-catalog.js').BAQUEANO_MASTER_CATALOG || {};
const masterCategory = { playas: 'playa', islas: 'agua', volcanes: 'volcan', naturaleza: 'naturaleza' };
for (const d of master.destinations || []) {
  const viaDossier = placeUrl(d.name, null);
  const url = /^(destino|mapa)\.html/.test(viaDossier) ? viaDossier : `destinos.html?q=${encodeURIComponent(d.name)}&categoria=${masterCategory[d.category] || 'todos'}`;
  add({ k: 'destino', t: d.name, u: url, dep: d.department, i: 'fa-solid fa-mountain-sun', d: d.description, keywords: [d.category, d.subCategory, d.municipality].join(' ') });
}
// ── 3b. Platos nacionales de gastronomia.html (tarjetas reales de la página) ──
const gastroHtml = read('gastronomia.html');
for (const m of gastroHtml.matchAll(/<h3 class="dish-title">([^<]+)<\/h3>[\s\S]*?<p class="dish-desc">([^<]+)<\/p>/g)) {
  const name = m[1].trim();
  add({ k: 'plato', t: name, u: spot('gastronomia.html', name), dep: 'Nicaragua', i: 'fa-solid fa-bowl-food', d: m[2], keywords: 'comida plato gastronomia tipico nacional' });
}

for (const r of master.routes || []) {
  add({ k: 'ruta', t: r.name, u: spot('experiencias.html', r.name), dep: r.department, i: 'fa-solid fa-route', d: r.theme, keywords: `ruta ${(r.stops || []).join(' ')}` });
}
for (const p of master.packages || []) {
  add({ k: 'paquete', t: p.title, u: spot('experiencias.html', p.title), dep: p.department, i: 'fa-solid fa-suitcase-rolling', d: `${p.zone || ''} · ${p.durationDays || ''} días`, keywords: `paquete tour ${p.targetAudience || ''}` });
}

// ── 5. Música (artistas reales del archivo sonoro) ───────────────────────────
const sonora = loadGlobals('js/sonora-data.js');
for (const a of sonora.BAQUEANO_SONORA_ARTISTS || []) {
  add({ k: 'artista', t: a.name, u: spot('musica.html', a.name), i: 'fa-solid fa-music', d: `${a.honorific || ''} · ${a.origin || ''}`, keywords: `musica artista cantante ${a.category || ''}` });
}

// ── 6. Páginas y servicios de la plataforma ──────────────────────────────────
const PAGES = [
  ['Inicio', 'index.html', 'Portada de BAQUEANO Nicaragua.', 'inicio portada home', 'fa-solid fa-house'],
  ['Destinos de Nicaragua', 'destinos.html', 'Volcanes, playas, montañas, reservas y ciudades.', 'destinos viajar turismo', 'fa-solid fa-compass'],
  ['Todos los destinos', 'todos-los-destinos.html', 'Catálogo completo de lugares publicados, con filtros por categoría y departamento.', 'todos destinos catalogo lugares lista completa', 'fa-solid fa-list'],
  ['Departamentos y territorios', 'departamento.html', 'Los 17 territorios de Nicaragua.', 'departamentos territorios', 'fa-solid fa-map'],
  ['Mapa interactivo', 'mapa.html', 'Ubicá destinos, servicios y puntos de interés.', 'mapa ubicacion gps coordenadas', 'fa-solid fa-map-location-dot'],
  ['Experiencias y rutas', 'experiencias.html', 'Actividades, senderos, rutas y paquetes.', 'experiencias tours rutas paquetes guias', 'fa-solid fa-person-hiking'],
  ['BAQUI · Planificador', 'baqueano-ia.html', 'Armá tu ruta y consultá el clima por territorio.', 'baqui ia inteligencia artificial planificar itinerario clima', 'fa-solid fa-wand-magic-sparkles'],
  ['Mi viaje', 'mi-viaje.html', 'Organizá destinos, presupuesto y días.', 'mi viaje itinerario presupuesto plan', 'fa-solid fa-route'],
  ['Historia y memoria', 'historia.html', 'Historia nacional, personajes y patrimonio.', 'historia museos monumentos independencia memoria', 'fa-solid fa-landmark'],
  ['Gastronomía nicaragüense', 'gastronomia.html', 'Platos, bebidas, recetas y tradiciones.', 'gastronomia comida recetas', 'fa-solid fa-utensils'],
  ['Música de Nicaragua', 'musica.html', 'Archivo sonoro, artistas e instrumentos.', 'musica canciones marimba son nica folclor', 'fa-solid fa-music'],
  ['Custodia ambiental', 'ambiental.html', 'Áreas protegidas y buenas prácticas.', 'ambiental conservacion areas protegidas', 'fa-solid fa-leaf'],
  ['Crónicas', 'cronicas.html', 'Relatos y reportajes de Nicaragua.', 'cronicas relatos reportajes revista', 'fa-regular fa-newspaper'],
  ['Experiencias de viajeros (Testimonios)', 'testimonios.html', 'Viajeros reales comparten lo que vivieron en Nicaragua.', 'testimonios opiniones resenas experiencias viajeros comunidad comentarios', 'fa-regular fa-comments'],
  ['Red de aliados', 'aliados.html', 'Organizaciones vinculadas al turismo.', 'aliados organizaciones socios', 'fa-regular fa-handshake'],
  ['Mi negocio', 'mi-negocio.html', 'Registrá tu emprendimiento turístico.', 'negocio emprendimiento registrar hospedaje restaurante guia', 'fa-solid fa-shop'],
  ['Canal de denuncias', 'denuncias.html', 'Reporte confidencial ambiental.', 'denuncia reportar ambiental', 'fa-solid fa-shield-halved'],
  ['Mi perfil', 'perfil.html', 'Tu cuenta, datos y preferencias.', 'perfil cuenta iniciar sesion registro', 'fa-regular fa-user'],
  ['Reservas', 'perfil.html#reservas', 'Consultá tus reservas.', 'reservas reservar', 'fa-regular fa-calendar-days'],
  ['Favoritos', 'favoritos.html', 'Destinos que guardaste.', 'favoritos guardados', 'fa-regular fa-heart'],
  ['Centro de ayuda', 'ayuda.html', 'Preguntas frecuentes y soporte.', 'ayuda soporte preguntas faq', 'fa-regular fa-circle-question'],
  ['Quiénes somos', 'nosotros.html', 'Propósito, misión y equipo.', 'nosotros mision vision equipo contacto', 'fa-solid fa-people-group'],
  ['Términos y condiciones', 'terminos.html', 'Condiciones de uso.', 'terminos condiciones legal', 'fa-regular fa-file-lines'],
  ['Privacidad', 'privacidad.html', 'Protección de datos personales.', 'privacidad datos personales', 'fa-solid fa-user-shield'],
  ['Cookies', 'cookies.html', 'Preferencias y almacenamiento.', 'cookies consentimiento', 'fa-solid fa-cookie-bite'],
  ['Aviso legal', 'aviso-legal.html', 'Información legal del sitio.', 'aviso legal', 'fa-solid fa-scale-balanced'],
  ['Centro SOS y auxilio', '#sos', 'Emergencias: Policía 118, Ambulancia 128, Bomberos 115, 911.', 'sos emergencia policia ambulancia bomberos auxilio 118 128 115 911', 'fa-solid fa-shield-heart']
];
for (const [title, url, desc, keywords, icon] of PAGES) add({ k: 'pagina', t: title, u: url, d: desc, keywords, i: icon });

const out = path.join(ROOT, 'data', 'search-index.json');
mkdirSync(path.dirname(out), { recursive: true });
const payload = { version: new Date().toISOString().slice(0, 10), count: records.length, records };
writeFileSync(out, JSON.stringify(payload));
const byKind = records.reduce((acc, r) => ({ ...acc, [r.k]: (acc[r.k] || 0) + 1 }), {});
console.log(`Índice: ${records.length} registros →`, byKind, `${Math.round(JSON.stringify(payload).length / 1024)} KB`);

// ── 7. Conocimiento de ruta para BAQUI (tarjetas "Cómo moverte" y "Alertas") ──
// Datos reales por lugar: cómo llegar, mejor época, recomendaciones, seguridad,
// clima y coordenadas. Lo consume js/baqueano-travel-session.js.
const firstItems = (list, n) => (Array.isArray(list) ? list.slice(0, n).map((x) => (typeof x === 'string' ? x : x.name)).filter(Boolean) : []);
function parseCoordinates(text) {
  const match = /(-?\d+(?:\.\d+)?)°?\s*([NS])?[,;\s]+(-?\d+(?:\.\d+)?)°?\s*([EW])?/i.exec(String(text || ''));
  if (!match) return { lat: null, lng: null };
  let lat = Number(match[1]);
  let lng = Number(match[3]);
  if (/s/i.test(match[2] || '')) lat = -Math.abs(lat);
  if (/w/i.test(match[4] || '') || lng > 0) lng = -Math.abs(lng);
  return { lat, lng };
}
// Solo imágenes que existen en el sitio (nunca una ruta rota en la tarjeta).
const realImage = (rel) => (rel && !/^https?:/i.test(rel) && existsSync(path.join(ROOT, rel)) ? rel : '');
const knowledge = [];
for (const t of territories) {
  knowledge.push({
    id: t.id, kind: 'territorio', name: t.name, territory: t.id,
    aliases: [t.name, ...(t.municipalities || []).map((m) => m.name)].map(norm),
    lat: Number.isFinite(t.lat) ? t.lat : null, lng: Number.isFinite(t.lng) ? t.lng : null,
    tagline: t.tagline || '', capital: t.capital || '', region: t.culturalRegion || '',
    identity: t.identitySummary || '', description: short(t.shortDesc || t.culture, 360),
    geopark: t.geopark && t.geopark.name ? t.geopark.name : '', image: realImage(t.heroImage),
    howToReach: t.howToReach || '', bestSeason: t.bestSeason || '', recommendations: t.recommendations || '',
    activities: firstItems(t.activities, 4), places: firstItems(t.places, 4), food: firstItems(t.gastronomy, 3),
    // Todos los lugares del territorio con su descripción propia: BAQUI los usa
    // para recomendar según intereses ("playa" → La Boquita, Las Peñitas…).
    spots: (t.places || []).filter((p) => p && p.name).map((p) => ({ name: p.name, type: p.type || '', desc: short(p.desc || '', 160) })),
    municipalities: (t.municipalities || []).map((m) => m.name),
    // Datos con fuente oficial (Visita Nicaragua, INTUR) y su fecha de verificación.
    highlights: firstItems(t.officialHighlights, 2),
    sources: (t.officialSources || []).filter((src) => src && /^https:\/\//.test(src.url)).slice(0, 2).map((src) => ({ label: src.label, url: src.url })),
    verifiedAt: t.officialVerifiedAt || '',
    url: `departamento.html?id=${encodeURIComponent(t.id)}`,
    community: `testimonios.html?departamento=${encodeURIComponent(t.id)}`
  });
}
const territoryByName = new Map(territories.map((t) => [norm(t.name), t.id]));
for (const d of Object.values(dossier)) {
  const { lat, lng } = parseCoordinates(d.coordinates);
  const shortName = norm(d.title).replace(/^(isla|isletas|volcan|reserva natural|laguna|canon) de /, '');
  knowledge.push({
    id: d.id, kind: 'destino', name: d.title, department: d.department || '',
    territory: territoryByName.get(norm(d.department)) || null,
    aliases: [...new Set([norm(d.title), norm(d.id).replace(/_/g, ' '), shortName])].filter((a) => a.length > 3),
    lat, lng, tagline: d.subtitle || '', category: d.category || '', municipality: d.municipality || '',
    description: short(d.description, 360), image: realImage(d.image),
    howToReach: d.howToReach || '', climate: d.climate || '', duration: d.duration || '',
    difficulty: d.difficulty || '', safetyTips: d.safetyTips || '', activities: firstItems(d.activities, 4),
    food: firstItems(d.gastronomy, 3), allies: firstItems(d.allies, 3),
    url: `destino.html?id=${encodeURIComponent(d.id)}`,
    community: `testimonios.html?destino=${encodeURIComponent(d.id)}`
  });
}
const knowledgeOut = path.join(ROOT, 'data', 'travel-knowledge.json');
writeFileSync(knowledgeOut, JSON.stringify({ version: new Date().toISOString().slice(0, 10), count: knowledge.length, places: knowledge }));
console.log(`Conocimiento de ruta: ${knowledge.length} lugares, ${Math.round(JSON.stringify(knowledge).length / 1024)} KB`);
