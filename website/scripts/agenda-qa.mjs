#!/usr/bin/env node
/**
 * 🧪 BAQUEANO — PRUEBAS DE NAVEGADOR DE LA AGENDA DE EVENTOS
 *
 * 🎯 POR QUÉ: comprobar lo que pidió el propietario (2026-10-20): la sección va justo antes del
 *   mapa y BAQÜI (también en celular), sin eventos muestra el estado vacío, las tarjetas abren
 *   el evento correcto, fecha y hora en hora de Nicaragua, .ics correcto, Mi Viaje sin duplicar,
 *   idioma en vivo y ninguna sección perdida.
 * ⚙️ CÓMO: sirve dist-hostinger (BASE_URL). Bloquea el service worker y toda escritura a Supabase.
 *   La Edge Function baqueano-events se SIMULA con eventos de ensayo que solo existen en esta prueba.
 * 📦 QUÉ: `BASE_URL=http://127.0.0.1:8790/ node scripts/agenda-qa.mjs` → casos y salida 1 si falla alguno.
 */
import { chromium } from '@playwright/test';

const BASE = (process.env.BASE_URL || 'http://127.0.0.1:8790/').replace(/\/?$/, '/');
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: !!ok, detail });
const DAY = 86400000;
const iso = (ms) => new Date(ms).toISOString();
const NOW = Date.now();
// Eventos de ensayo (nunca se guardan en ninguna base).
const SAMPLE = [
  { id: 'ev-prueba-a', slug: 'prueba-festival-a', title: 'Prueba Festival A', short_description: 'Descripción breve de ensayo.', category: 'festival_cultural', cover_image: null, image_alt: null,
    start_at: '2030-11-15T00:30:00.000Z', end_at: '2030-11-15T04:00:00.000Z', timezone: 'America/Managua', time_confirmed: true, modality: 'presencial',
    department_id: 'leon', municipality_id: null, location_name: 'Parque Central', latitude: 12.4352, longitude: -86.8795, coords_verified: true,
    access_type: 'free', price: null, currency: null, event_status: 'scheduled', rescheduled_from: null, status_note: null, is_featured: true, time_state: 'upcoming', organizer_name: 'Organizador de prueba', updated_at: iso(NOW) },
  { id: 'ev-prueba-b', slug: 'prueba-feria-b', title: 'Prueba Feria B', short_description: null, category: 'feria_turistica', cover_image: null, image_alt: null,
    start_at: iso(NOW + 3 * DAY), end_at: null, timezone: 'America/Managua', time_confirmed: false, modality: 'presencial',
    department_id: 'granada', municipality_id: null, location_name: 'Calle La Calzada', latitude: null, longitude: null, coords_verified: false,
    access_type: 'unconfirmed', price: null, currency: null, event_status: 'rescheduled', rescheduled_from: iso(NOW + DAY), status_note: 'Cambio por lluvia.', is_featured: false, time_state: 'rescheduled', organizer_name: null, updated_at: iso(NOW) },
];
const DETAIL = Object.assign({}, SAMPLE[0], { description: 'Descripción detallada de ensayo.', address: 'Frente a la Catedral', virtual_url: null, organizer_url: null, contact_info: null,
  official_url: 'https://example.org/oficial', registration_url: 'https://example.org/entradas', program: [{ date: '2030-11-14', time: '18:30', what: 'Inauguración' }],
  recommendations: 'Llevá agua.', source_name: 'Fuente de prueba', source_url: 'https://example.org/fuente', image_credit: null, published_at: iso(NOW) });

async function open(browser, mode, viewport) {
  const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: viewport || { width: 1280, height: 900 }, locale: 'es-NI', acceptDownloads: true });
  await ctx.addInitScript(() => { try { localStorage.setItem('baqueano_cookie_consent_v1', JSON.stringify({ essential: true, preferences: false, analytics: false, version: 1, policyVersion: '2026-09-26' })); } catch (_) { /* nada */ } });
  const calls = [];
  await ctx.route('**/*', (route) => {
    const req = route.request();
    const url = req.url();
    if (url.includes('/functions/v1/baqueano-events')) {
      const body = JSON.parse(req.postData() || '{}');
      calls.push(body);
      let data;
      if (body.action === 'list') data = { ok: true, events: mode === 'empty' ? [] : SAMPLE, hasMore: false };
      else if (body.action === 'get') return body.slug === DETAIL.slug ? route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, event: DETAIL }) })
        : route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'no' }) });
      else data = { ok: false };
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
    }
    if (/supabase\.co|firebaseio|identitytoolkit/.test(url) && req.method() !== 'GET') return route.fulfill({ status: 204, body: '' });
    return route.continue();
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message || e)));
  return { ctx, page, calls, errors };
}

const browser = await chromium.launch();
try {
  for (const viewport of [{ width: 1280, height: 900 }, { width: 375, height: 800 }]) {
    const tag = viewport.width < 500 ? 'celular' : 'computadora';
    const { ctx, page, errors } = await open(browser, 'events', viewport);
    await page.goto(BASE + 'index.html', { waitUntil: 'domcontentloaded' });
    const order = await page.evaluate(() => {
      const ids = [...document.querySelectorAll('main section[id], body > section[id], section[id]')].map((s) => s.id);
      return { ids, agenda: ids.indexOf('agendaEventos'), map: ids.indexOf('mapaAiSection'), dest: ids.indexOf('destinosInspiran') };
    });
    check(`index (${tag}): la agenda va justo antes del mapa y BAQÜI`, order.agenda > 0 && order.map === order.agenda + 1 && order.dest < order.agenda, order.ids.join(' > '));
    const visualOrder = await page.evaluate(() => document.getElementById('agendaEventos').getBoundingClientRect().top < document.getElementById('mapaAiSection').getBoundingClientRect().top);
    check(`index (${tag}): también en el orden visual`, visualOrder);
    await page.locator('#agendaEventos').scrollIntoViewIfNeeded();
    await page.waitForSelector('#agendaEventos .bq-ev-card:not(.is-skeleton)', { timeout: 20000 });
    const titles = await page.locator('#agendaEventos .bq-ev-title').allInnerTexts();
    check(`index (${tag}): muestra los eventos publicados`, titles.join('|') === 'Prueba Festival A|Prueba Feria B', titles.join('|'));
    const first = page.locator('#agendaEventos .bq-ev-card').first();
    const meta = await first.locator('.bq-ev-meta').innerText();
    check(`index (${tag}): hora de Nicaragua (00:30 UTC → 18:30 del día anterior)`, /14|18:30|6:30/.test(meta) && /(06|6):30|18:30/.test(meta), meta.replace(/\n/g, ' | '));
    const second = await page.locator('#agendaEventos .bq-ev-card').nth(1).innerText();
    check(`index (${tag}): sin hora confirmada dice «Horario por confirmar»`, /Horario por confirmar/.test(second));
    check(`index (${tag}): reprogramado muestra estado y fecha anterior`, /Reprogramado/.test(second) && /Antes:/.test(second));
    check(`index (${tag}): «Cómo llegar» solo con coordenadas verificadas`, await first.locator('[data-bq-route]').count() === 1 && await page.locator('#agendaEventos .bq-ev-card').nth(1).locator('[data-bq-route]').count() === 0);
    check(`index (${tag}): «Ver evento» abre la ficha correcta`, (await first.locator('a.bq-ev-btn').getAttribute('href')) === 'evento.html?e=prueba-festival-a');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(`index (${tag}): sin desplazamiento horizontal de la página`, overflow <= 1, 'exceso=' + overflow);
    for (const id of ['heroNicaragua', 'categoriaStrip', 'vivirSelector', 'destinosInspiran', 'mapaAiSection', 'porqueBaqueano', 'experienciasSection', 'testimoniosSection']) {
      if (!(await page.locator('#' + id).count())) check(`index (${tag}): no se perdió #${id}`, false);
    }
    check(`index (${tag}): sin errores de JavaScript`, errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  // Sin eventos: estado vacío, nunca ejemplos.
  {
    const { ctx, page } = await open(browser, 'empty');
    await page.goto(BASE + 'index.html', { waitUntil: 'domcontentloaded' });
    await page.locator('#agendaEventos').scrollIntoViewIfNeeded();
    await page.waitForSelector('#agendaEventos .bq-ev-empty', { timeout: 20000 });
    check('index: sin eventos muestra «Muy pronto…»', /Muy pronto tendremos nuevas experiencias/.test(await page.locator('#agendaEventos').innerText()) && await page.locator('#agendaEventos .bq-ev-card').count() === 0);
    await ctx.close();
  }

  // Agenda completa: filtros.
  {
    const { ctx, page, calls, errors } = await open(browser, 'events');
    await page.goto(BASE + 'eventos.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.bq-ev-grid .bq-ev-card', { timeout: 20000 });
    await page.selectOption('#evDep', 'leon');
    await page.waitForTimeout(500);
    await page.selectOption('#evCat', 'musica');
    await page.waitForTimeout(500);
    await page.locator('.bq-ev-chip', { hasText: 'Anteriores' }).click();
    await page.waitForTimeout(500);
    const last = calls.filter((c) => c.action === 'list').pop();
    check('agenda: filtros por departamento, categoría y anteriores llegan al servidor', last.departmentId === 'leon' && last.category === 'musica' && last.scope === 'past', JSON.stringify(last));
    check('agenda: la URL guarda los filtros', /departamento=leon/.test(page.url()) && /categoria=musica/.test(page.url()) && /ver=anteriores/.test(page.url()), page.url());
    check('agenda: sin errores de JavaScript', errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  // Ficha: datos, .ics, Mi Viaje sin duplicar, Schema.org, idioma.
  {
    const { ctx, page, errors } = await open(browser, 'events');
    await page.goto(BASE + 'evento.html?e=prueba-festival-a', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.bq-ev-h1', { timeout: 20000 });
    const facts = await page.locator('.bq-ev-facts').innerText();
    check('ficha: fecha y hora completas en hora de Nicaragua', /14 de noviembre de 2030/.test(facts) && /hora de Nicaragua/.test(facts), facts.replace(/\n/g, ' | '));
    check('ficha: entradas marcadas como servicio del organizador', /servicio del organizador/.test(await page.locator('.bq-ev-links').innerText()));
    const ld = JSON.parse(await page.locator('#bqEventJsonLd').textContent());
    check('ficha: Schema.org Event solo con datos reales', ld['@type'] === 'Event' && ld.startDate === DETAIL.start_at && ld.isAccessibleForFree === true && !ld.offers, JSON.stringify(ld).slice(0, 200));
    const [download] = await Promise.all([page.waitForEvent('download'), page.locator('.bq-ev-btn', { hasText: 'Añadir a mi calendario' }).click()]);
    const icsText = await (await download.createReadStream()).toArray().then((c) => Buffer.concat(c).toString('utf8'));
    check('ficha: .ics con hora UTC correcta', /DTSTART:20301115T003000Z/.test(icsText) && /DTEND:20301115T040000Z/.test(icsText) && /BEGIN:VEVENT/.test(icsText) && /\r\n/.test(icsText), icsText.split('\r\n').slice(6, 9).join(' '));
    const tripBtn = page.locator('.bq-ev-btn', { hasText: 'Mi Viaje' });
    await tripBtn.click();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.bq-ev-h1');
    await page.locator('.bq-ev-btn', { hasText: 'En Mi Viaje' }).waitFor({ timeout: 5000 });
    const count = await page.evaluate(() => window.BaqueanoTrip.list().filter((d) => d.destId === 'evento-prueba-festival-a').length);
    check('ficha: Mi Viaje guarda una sola vez', count === 1, 'veces=' + count);
    await page.evaluate(() => window.BaqueanoLanguage && window.BaqueanoLanguage.set && window.BaqueanoLanguage.set('en'));
    await page.waitForFunction(() => /Add to my calendar/.test(document.querySelector('.bq-ev-actions')?.textContent || ''), null, { timeout: 8000 }).catch(() => {});
    check('ficha: cambia de idioma sin recargar', /Add to my calendar/.test(await page.locator('.bq-ev-actions').innerText()));
    check('ficha: sin errores de JavaScript', errors.length === 0, errors.join(' | '));
    await page.goto(BASE + 'evento.html?e=no-existe-nada', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.bq-ev-empty', { timeout: 20000 });
    check('ficha: evento inexistente muestra «no encontramos»', /No encontramos ese evento|We couldn/.test(await page.locator('.bq-ev-empty').innerText()));
    await ctx.close();
  }
} finally {
  await browser.close();
}
let failed = 0;
for (const r of results) { if (!r.ok) failed += 1; console.log((r.ok ? '✅' : '❌') + ' ' + r.name + (r.ok ? '' : ' — ' + r.detail)); }
console.log(`\n${results.length - failed}/${results.length} casos OK`);
process.exit(failed ? 1 : 0);
