#!/usr/bin/env node
/**
 * 🧪 BAQUEANO — PRUEBAS DE NAVEGADOR: «CÓMO LLEGAR» COMO GOOGLE MAPS, DENTRO DE BAQUEANO
 *
 * 🎯 POR QUÉ (propietario, 2026-10-21): «cuando el usuario dé clic en cómo llegar, poner la ruta
 *   desde donde está hasta el punto… azul su punto de partida o ubicación actual y rojo el punto de
 *   llegada… cuánto tiempo le tocaría llegar en bus, carro, moto, helicóptero o avión (opcional),
 *   bicicleta o a pie, e ir dirigiéndolo como Google Maps, siempre dentro de la plataforma web».
 * ⚙️ CÓMO: sirve dist-hostinger (BASE_URL). El GPS se simula con Playwright y el servidor de rutas
 *   (Valhalla) se SIMULA con una ruta de ensayo, distinta por modo de viaje. Ninguna petición sale
 *   a Google: se comprueba que todo pasa dentro de la página.
 * 📦 QUÉ: `BASE_URL=http://127.0.0.1:8790/ node scripts/mapa-ruta-qa.mjs` → casos y salida 1 si falla alguno.
 */
import { chromium } from '@playwright/test';

const BASE = (process.env.BASE_URL || 'http://127.0.0.1:8790/').replace(/\/?$/, '/');
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: !!ok, detail });
const START = { latitude: 12.1364, longitude: -86.2514 }; // Managua (ensayo)
const DEST = { lat: 12.4352, lng: -86.8795, name: 'Destino de prueba (León)' };
const MIN = { auto: 95, motorcycle: 90, bus: 140, bicycle: 330, pedestrian: 1150 };

// Polilínea de precisión 6, como la devuelve Valhalla.
function encode(points) {
  let out = '', pLat = 0, pLng = 0;
  const enc = (v) => { v = v < 0 ? ~(v << 1) : v << 1; let s = ''; while (v >= 0x20) { s += String.fromCharCode((0x20 | (v & 0x1f)) + 63); v >>= 5; } return s + String.fromCharCode(v + 63); };
  for (const [lat, lng] of points) { const a = Math.round(lat * 1e6), b = Math.round(lng * 1e6); out += enc(a - pLat) + enc(b - pLng); pLat = a; pLng = b; }
  return out;
}
const SHAPE = [[START.latitude, START.longitude], [12.25, -86.5], [12.35, -86.7], [DEST.lat, DEST.lng]];

const browser = await chromium.launch();
const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1280, height: 900 }, locale: 'es-NI', geolocation: START, permissions: ['geolocation'] });
await ctx.addInitScript(() => { try { localStorage.setItem('baqueano_cookie_consent_v1', JSON.stringify({ essential: true, preferences: false, analytics: false, version: 1, policyVersion: '2026-09-26' })); } catch (_) { /* nada */ } });
const routerCalls = [];
const external = [];
await ctx.route('**/*', (route) => {
  const url = route.request().url();
  if (url.startsWith('https://valhalla1.openstreetmap.de/route')) {
    const body = JSON.parse(decodeURIComponent(url.split('json=')[1] || '%7B%7D'));
    routerCalls.push(body);
    const origin = body.locations[0];
    const shape = encode([[origin.lat, origin.lon]].concat(SHAPE.slice(1)));
    const sec = (MIN[body.costing] || 100) * 60;
    const trip = { summary: { length: 92.4, time: sec }, language: 'es-ES', legs: [{ shape, maneuvers: [
      { instruction: 'Salí hacia el oeste.', type: 1, length: 30, time: sec / 3, begin_shape_index: 0 },
      { instruction: 'Doblá a la derecha.', type: 10, length: 60, time: sec / 2, begin_shape_index: 1 },
      { instruction: 'Llegaste a tu destino.', type: 4, length: 0, time: 0, begin_shape_index: 3 }] }] };
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ trip }) });
  }
  if (/google\.com\/maps|maps\.google|maps\.googleapis/.test(url)) external.push(url);
  if (/supabase\.co|firebaseio|identitytoolkit/.test(url) && route.request().method() !== 'GET') return route.fulfill({ status: 204, body: '' });
  return route.continue();
});
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e.message || e)));
page.on('popup', (p) => external.push(p.url()));

try {
  await page.goto(BASE + 'mapa.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.BaqueanoNavigator, null, { timeout: 20000 });
  await page.evaluate((d) => window.BaqueanoNavigator.open(d), DEST);
  await page.waitForSelector('#bqNav.is-open', { timeout: 10000 });
  // «Usar mi ubicación» (si el permiso ya estaba, se ubica solo).
  await page.waitForTimeout(800);
  if (!routerCalls.length) await page.click('#bqNavUseGps');
  await page.waitForSelector('#bqNavSummary:not([hidden])', { timeout: 15000 });
  await page.waitForTimeout(600);

  const colors = await page.evaluate(() => {
    const css = (sel) => { const n = document.querySelector(sel); return n ? getComputedStyle(n).backgroundColor : ''; };
    const line = [...document.querySelectorAll('#bqNavMap path.leaflet-interactive')].map((p) => p.getAttribute('stroke'));
    return { origin: css('.bq-nav-pin.is-origin'), dest: css('.bq-nav-pin.is-dest'), line };
  });
  check('Partida en azul', colors.origin === 'rgb(26, 115, 232)', colors.origin);
  check('Llegada en rojo', colors.dest === 'rgb(217, 48, 37)', colors.dest);
  check('Ruta dibujada en azul dentro del mapa de BAQUEANO', colors.line.includes('#1a73e8'), colors.line.join(','));

  // Tabla «Tiempo según cómo vayas»: espera a que terminen los 5 modos por carretera.
  await page.waitForFunction(() => document.querySelectorAll('#bqNavCompareList button.bq-nav-cmp strong').length >= 5, null, { timeout: 20000 }).catch(() => null);
  const rows = await page.$$eval('#bqNavCompareList .bq-nav-cmp', (n) => n.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  check('Muestra el tiempo en carro, moto, bus, bici y a pie', ['Auto', 'Moto', 'Bus', 'Bici', 'A pie'].every((m) => rows.some((r) => r.startsWith(m) && /min|h/.test(r))), rows.join(' | '));
  check('Tiempos distintos por modo (bus 2 h 20 min, a pie 19 h 10 min)', rows.some((r) => /^Bus.*2 h 20 min/.test(r)) && rows.some((r) => /^A pie.*19 h 10 min/.test(r)), rows.join(' | '));
  check('Helicóptero y avión como referencia en línea recta', rows.some((r) => /^Helicóptero.*≈.*línea recta/.test(r)) && rows.some((r) => /^Avión.*≈.*línea recta/.test(r)));
  const airNote = await page.textContent('#bqNavCompare .bq-nav-modenote');
  check('Aclara que el aéreo no es un servicio regular', /no un servicio regular/.test(airNote || ''));
  const summaryCalls = routerCalls.filter((c) => c.directions_type === 'none').map((c) => c.costing).sort();
  check('Pide a Valhalla un resumen por cada modo por carretera', ['auto', 'bicycle', 'bus', 'motorcycle', 'pedestrian'].every((m) => summaryCalls.includes(m)), summaryCalls.join(','));

  // Elegir bus en la tabla: dibuja la ruta en bus y avisa que no incluye horarios.
  const before = routerCalls.length;
  await page.click('#bqNavCompareList button.bq-nav-cmp[data-mode="bus"]');
  await page.waitForTimeout(800);
  const busCall = routerCalls.slice(before).find((c) => c.costing === 'bus' && c.directions_type !== 'none');
  const busNote = await page.$eval('#bqNavBusNote', (n) => !n.hidden && n.textContent);
  const busPressed = await page.$eval('#bqNavCompareList button[data-mode="bus"]', (n) => n.getAttribute('aria-pressed'));
  check('Tocar «Bus» traza la ruta en bus y aclara que no hay horarios', !!busCall && /horarios/.test(busNote || '') && busPressed === 'true');
  const dur = await page.textContent('#bqNavSummary');
  check('El resumen usa el tiempo del modo elegido', /2 h 20 min/.test(dur || ''), (dur || '').slice(0, 80));

  // Elegir el punto de partida en el mapa.
  await page.click('#bqNavPick');
  const hint = await page.textContent('#bqNavStatus');
  const box = await page.$eval('#bqNavMap', (n) => { const r = n.getBoundingClientRect(); return { x: r.left + r.width * 0.3, y: r.top + r.height * 0.4 }; });
  const n0 = routerCalls.length;
  await page.mouse.click(box.x, box.y);
  await page.waitForTimeout(900);
  const from = await page.textContent('#bqNavOriginNow');
  check('«Elegir en el mapa»: pide tocar el mapa y usa ese punto como partida', /Tocá el mapa/.test(hint || '') && /Punto elegido en el mapa/.test(from || '') && routerCalls.length > n0, (from || '') + ' / ' + (hint || ''));

  // Guía como Google Maps: iniciar, avanzar y salirse de la ruta → recalcula sola.
  await page.click('#bqNavCompareList button.bq-nav-cmp[data-mode="auto"]');
  await page.waitForTimeout(600);
  await ctx.setGeolocation(START);
  await page.click('#bqNavStart');
  await page.waitForTimeout(1200);
  const next = await page.textContent('#bqNavNext');
  check('Indica el próximo giro y lo que falta', /En .*:/.test(next || '') && /Faltan/.test(next || ''), (next || '').slice(0, 120));
  const meColor = await page.$eval('.bq-nav-me', (n) => getComputedStyle(n).backgroundColor).catch(() => '');
  check('Tu posición en azul mientras navegás', meColor === 'rgb(26, 115, 232)', meColor);
  const n1 = routerCalls.length;
  for (const p of [{ latitude: 11.95, longitude: -85.95 }, { latitude: 11.951, longitude: -85.951 }, { latitude: 11.952, longitude: -85.952 }]) { await ctx.setGeolocation(p); await page.waitForTimeout(1300); }
  const status = await page.textContent('#bqNavStatus');
  const reroute = routerCalls.slice(n1).find((c) => c.directions_type !== 'none' && Math.abs(c.locations[0].lat - 11.95) < 0.01);
  check('Si te salís de la ruta, recalcula sola desde donde estás', !!reroute && /Recalculando|Siguiendo/.test(status || ''), (status || '') + ' · llamadas ' + (routerCalls.length - n1));
  await page.click('#bqNavStop');

  // Idioma en vivo.
  await page.evaluate(() => window.BaqueanoLanguage && window.BaqueanoLanguage.set && window.BaqueanoLanguage.set('en'));
  await page.waitForTimeout(800);
  const en = await page.textContent('#bqNavCompareTitle');
  check('La tabla se traduce al cambiar de idioma', /Time by how you travel/.test(en || ''), en);

  check('Todo pasa dentro de BAQUEANO (ningún Google Maps)', external.length === 0, external.join(' | '));
  check('Sin errores de JavaScript', errors.length === 0, errors.join(' | '));
  await page.screenshot({ path: '/tmp/claude-0/-home-claude/63fab31e-79b8-50dc-9a7d-c6b6255ce27f/scratchpad/nav-ruta.png' });
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? '✅' : '❌'} ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
console.log(`\n${results.length - failed.length}/${results.length} casos OK`);
process.exit(failed.length ? 1 : 0);
