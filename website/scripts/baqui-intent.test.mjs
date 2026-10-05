#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: BAQUI debe entender pedidos reales de viaje (adultos, niños,
 *    presupuesto en USD o C$, varios destinos, días) y PREGUNTAR los días en
 *    vez de inventarlos. Es un caso de demostración del Hackathon 2026.
 * ⚙️ CÓMO: abre baqueano-ia.html en Chromium (red externa bloqueada), ejecuta
 *    BaqueanoTravelSession.parseTravelIntent con 16 frases (incluye errores de
 *    tipeo) y, en una
 *    conversación completa, verifica que BAQUI pide los días y luego arma el
 *    itinerario con los días indicados; luego, el reparto del presupuesto y la
 *    ruta propuesta con "quiero conocer Nicaragua".
 * 📦 QUÉ: `BASE_URL=http://127.0.0.1:8765/ node scripts/baqui-intent.test.mjs`.
 */
import { chromium } from '@playwright/test';

const base = process.env.BASE_URL || 'http://127.0.0.1:4179/';
const cases = [
  {"q": "Somos 2 adultos y 3 niños, tenemos 500 dólares y queremos ir a Granada, Masaya y León", "e": {"adults": 2, "children": 3, "amount": 500, "currency": "USD", "dest": ["Granada", "Masaya", "León"], "days": null}},
  {"q": "Quiero ir a Somoto con mi esposa y mi hijo, presupuesto de C$ 8,000", "e": {"adults": 2, "children": 1, "amount": 8000, "currency": "NIO", "dest": ["Somoto"], "days": null}},
  {"q": "Vamos 4 personas a Estelí por 3 días con $300", "e": {"adults": 4, "children": 0, "amount": 300, "currency": "USD", "dest": ["Estelí"], "days": 3}},
  {"q": "dos noches en Granada", "e": {"days": 3, "dest": ["Granada"], "adults": null}},
  {"q": "Tenemos un presupuesto de 1.500 dólares para León y Chinandega, somos 3 adultos", "e": {"amount": 1500, "currency": "USD", "adults": 3, "children": 0, "dest": ["León", "Chinandega"]}},
  {"q": "3 niños y 2 adultos a Masaya con 20000 córdobas", "e": {"adults": 2, "children": 3, "amount": 20000, "currency": "NIO", "dest": ["Masaya"]}},
  {"q": "Viajo sola a Granada por una semana con 700 USD", "e": {"adults": 1, "children": 0, "days": 7, "amount": 700, "currency": "USD", "dest": ["Granada"]}},
  {"q": "Somos 5, dos de ellos niños, queremos conocer Managua", "e": {"adults": 3, "children": 2, "dest": ["Managua"]}},
  {"q": "Mi pareja y yo con nuestros dos hijos, US$ 1,200, Granada y Masaya", "e": {"adults": 2, "children": 2, "amount": 1200, "currency": "USD", "dest": ["Granada", "Masaya"]}},
  {"q": "Somos una familia de 4: 2 adultos y 2 niños, 800 dólares, Estelí", "e": {"adults": 2, "children": 2, "amount": 800, "dest": ["Estelí"]}},
  {"q": "Quiero ir a León", "e": {"adults": null, "days": null, "amount": null, "dest": ["León"]}},
  {"q": "2 adultos y un bebé, $450, Somoto y Estelí, fin de semana", "e": {"adults": 2, "children": 1, "amount": 450, "days": 2, "dest": ["Somoto", "Estelí"]}},
  {"q": "Tenemos 600 dólares, somos 2 personas mayores y 1 niña, vamos a Granada", "e": {"adults": 2, "children": 1, "amount": 600, "dest": ["Granada"]}},
  {"q": "Presupuesto de 50 dólares por persona, somos 4 adultos, Masaya", "e": {"adults": 4, "amount": 200, "currency": "USD", "dest": ["Masaya"]}},
  {"q": "Con mis 3 hijos y mi esposo a Granada, 5 días, 900 dólares", "e": {"adults": 2, "children": 3, "days": 5, "amount": 900, "dest": ["Granada"]}},
  // Pedido real del propietario (2026-10-05), con errores de tipeo: "carazon", "presupesto".
  {"q": "quiero ir a la playa , a los departamentos de carazon ,rivas, leon tengo un presupesto de 300 dolares voy 5 personas", "e": {"adults": 5, "amount": 300, "currency": "USD", "dest": ["Carazo", "Rivas", "León"]}}
];

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
await page.route('**/*', (route) => (['127.0.0.1', 'localhost'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort()));
// Idioma fijo (es-NI, fuente): los mensajes de BAQUI ya se traducen al idioma del navegador.
await page.goto(`${base}baqueano-ia.html?lang=es`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(window.BaqueanoTravelSession), null, { timeout: 20000 });
// Igual que el chat: los nombres del catálogo (17 departamentos) se cargan antes de interpretar.
await page.evaluate(() => window.BaqueanoTravelSession.loadKnowledge && window.BaqueanoTravelSession.loadKnowledge());

let failed = 0;
for (const testCase of cases) {
  const got = await page.evaluate((query) => {
    const engine = window.BaqueanoTravelSession;
    const empty = Object.assign(engine.get(), { destinations: [], days: null, travelers: null, adults: null, children: 0, budget: { amount: null, currency: 'USD' }, interests: [] });
    const s = engine.parseTravelIntent(query, empty);
    return { adults: s.adults, children: s.children, amount: s.budget.amount, currency: s.budget.currency, dest: s.destinations, days: s.days };
  }, testCase.q);
  const diff = Object.entries(testCase.e).filter(([key, value]) => JSON.stringify(got[key]) !== JSON.stringify(value));
  if (diff.length) { failed++; console.error(`❌ ${testCase.q}\n   obtenido ${JSON.stringify(got)}`); }
  else console.log(`✅ ${testCase.q}`);
}

// Conversación: sin días → BAQUI los pide; "4 días" → itinerario de 4 días sin perder lo demás.
await page.evaluate(() => document.getElementById('bqCookieConsent')?.remove());
async function say(text) {
  await page.fill('#iaChatInput', text);
  await page.press('#iaChatInput', 'Enter');
  await page.waitForTimeout(3000);
  return page.evaluate(() => { const bots = [...document.querySelectorAll('#iaChatMessages .ia-msg.bot')]; return bots.at(-1)?.firstChild?.textContent || ''; });
}
const first = await say('Somos 2 adultos y 3 niños, tenemos 500 dólares y queremos ir a Granada, Masaya y León');
if (!/cu[aá]ntos d[ií]as/.test(first)) { failed++; console.error('❌ BAQUI no preguntó los días: ' + first); } else console.log('✅ BAQUI pregunta los días');
await say('4 días');
const state = await page.evaluate(() => window.BaqueanoTravelSession.get());
if (state.days !== 4 || state.adults !== 2 || state.children !== 3 || state.budget.amount !== 500 || state.itinerary.length !== 4) {
  failed++; console.error('❌ Conversación: ' + JSON.stringify({ days: state.days, adults: state.adults, children: state.children, amount: state.budget.amount, itinerary: state.itinerary.length }));
} else console.log('✅ Itinerario de 4 días conservando viajeros y presupuesto');

// Reparto del presupuesto propio: $500 / 5 personas / 4 días = $25 por persona por día.
const split = await page.evaluate(() => document.getElementById('iaBudgetSplit')?.innerText || '');
if (!/\$25\.00/.test(split) || !/\$125/.test(split)) { failed++; console.error('❌ Reparto del presupuesto: ' + split.replace(/\n+/g, ' | ')); }
else console.log('✅ Reparto del presupuesto (por día y por persona por día)');

// "Quiero conocer Nicaragua": BAQUI propone la ruta (solo destinos del catálogo).
await page.evaluate(() => sessionStorage.clear());
await page.goto(`${base}baqueano-ia.html?lang=es`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(window.BaqueanoTravelSession), null, { timeout: 20000 });
await page.evaluate(() => document.getElementById('bqCookieConsent')?.remove());
const proposal = await say('quiero conocer Nicaragua, me gustan los volcanes');
const proposed = await page.evaluate(() => window.BaqueanoTravelSession.get());
if (!/Te propongo/.test(proposal) || proposed.destinations.length < 2 || !proposed.proposed) { failed++; console.error('❌ Propuesta de ruta: ' + proposal); }
else console.log('✅ "Quiero conocer Nicaragua" → ruta propuesta: ' + proposed.destinations.join(' → '));

await browser.close();
if (errors.length) { failed++; console.error('❌ Errores JS: ' + errors.slice(0, 3).join(' | ')); }
console.log(failed ? `\n${failed} falla(s)` : `\nBAQUI: ${cases.length + 4}/${cases.length + 4} OK`);
process.exit(failed ? 1 : 0);
