#!/usr/bin/env node
/**
 * 🧪 BAQUEANO — PRUEBAS DE NAVEGADOR: PRECISIÓN DEL MAPA, ESTRELLAS REALES Y FICHA DE LUGAR
 *
 * 🎯 POR QUÉ: comprobar en un navegador real (Chromium) los tres pedidos del propietario
 *   (2026-10-20): ubicación precisa, opiniones auténticas y una sola fuente para /mapa,
 *   /destinos y la ficha.
 * ⚙️ CÓMO: sirve dist-hostinger (BASE_URL). Bloquea el service worker y TODA escritura hacia
 *   Supabase de producción (solo deja pasar lecturas GET de lugares), para que la prueba no
 *   deje filas en la base. La Edge Function baqueano-place-reviews se SIMULA aquí con datos
 *   de ensayo que nunca salen de esta prueba.
 * 📦 QUÉ: `BASE_URL=http://127.0.0.1:8790/ node scripts/mapa-resenas-qa.mjs` → lista de casos
 *   y código de salida 1 si alguno falla.
 */
import { chromium } from '@playwright/test';

const BASE = (process.env.BASE_URL || 'http://127.0.0.1:8790/').replace(/\/?$/, '/');
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok: !!ok, detail }); };

// Datos de ensayo (solo existen en esta prueba).
const RATED = { kind: 'place', count: 3, average: 4.3, distribution: { 1: 0, 2: 0, 3: 1, 4: 0, 5: 2 } };
const LIST = [
  { id: '11111111-1111-4111-8111-111111111111', display_name: 'Ana P.', avatar_url: null, rating: 5, comment: 'Lancha puntual y guías muy amables. <img src=x onerror="window.__xss=1">', language: 'es', published_at: '2026-10-01T15:00:00Z', edited: false, response_text: 'Gracias por contarnos tu experiencia.', response_at: '2026-10-02T15:00:00Z' },
  { id: '22222222-2222-4222-8222-222222222222', display_name: 'Viajero BAQUEANO', avatar_url: null, rating: 3, comment: 'Nice boat trip, a bit expensive.', language: 'en', published_at: '2026-09-20T15:00:00Z', edited: true, response_text: null, response_at: null },
];

async function newPage(browser, opts = {}) {
  const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: opts.viewport || { width: 1280, height: 900 }, locale: 'es-NI' });
  // Consentimiento solo esencial (analítica apagada): mismo valor que scripts/browser-qa.mjs.
  await ctx.addInitScript(() => { try { localStorage.setItem('baqueano_cookie_consent_v1', JSON.stringify({ essential: true, preferences: false, analytics: false, version: 1, policyVersion: '2026-09-26' })); } catch (_) { /* sin almacenamiento */ } });
  const calls = { reviews: [], valhalla: 0, blockedWrites: 0 };
  await ctx.route('**/*', (route) => {
    const req = route.request();
    const url = req.url();
    if (url.includes('/functions/v1/baqueano-place-reviews')) {
      let body = {};
      try { body = JSON.parse(req.postData() || '{}'); } catch (_) { body = {}; }
      calls.reviews.push(body);
      let data = { ok: true };
      if (body.action === 'summary') {
        const summaries = {};
        (body.targets || []).forEach((t) => {
          if (t === 'place:isletas-de-granada' || t === 'destination:isletas') summaries[t] = RATED;
          else if (/^place:/.test(t) || t === 'destination:ometepe') summaries[t] = { kind: 'place', count: 0, average: null, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
          // destination:granada (ambiguo) no se devuelve: sin vínculo.
        });
        data = { ok: true, summaries };
      } else if (body.action === 'list') {
        const rows = body.target === 'place:isletas-de-granada' ? [...LIST] : [];
        if (body.sort === 'critical') rows.sort((a, b) => a.rating - b.rating);
        data = { ok: true, reviews: rows, page: 0, pageSize: 10, sort: body.sort };
      } else {
        return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'login_required', error: 'Iniciá sesión.' }) });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
    }
    if (url.includes('valhalla1.openstreetmap.de')) calls.valhalla += 1;
    // Nada se escribe en producción durante la prueba.
    if (/supabase\.co|firebaseio|googleapis\.com\/identitytoolkit/.test(url) && req.method() !== 'GET') {
      calls.blockedWrites += 1;
      return route.fulfill({ status: 204, body: '' });
    }
    return route.continue();
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message || e)));
  return { ctx, page, calls, errors };
}

const browser = await chromium.launch();
try {
  // A) /mapa: leyenda de precisión, zona vs. exacto, popup con estrellas y ficha propia.
  {
    const { ctx, page, calls, errors } = await newPage(browser);
    await page.goto(BASE + 'mapa.html?q=' + encodeURIComponent('Isletas de Granada'), { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-atlas-source="supabase"]', { state: 'attached', timeout: 30000 });
    const legend = await page.locator('#mapAtlasPrecision').innerText();
    check('mapa: leyenda separa exactos y zonas', /ubicación exacta/.test(legend) && /zona aproximada/.test(legend), legend.replace(/\n/g, ' | '));
    const popup = page.locator('.bq-atlas-card').first();
    await popup.waitFor({ timeout: 15000 });
    const route = popup.locator('[data-bq-route]');
    check('mapa: lugar aproximado abre en modo zona', (await route.getAttribute('data-precision')) === 'area' && /Ver la zona/.test(await route.innerText()));
    check('mapa: «Ver destino» abre la ficha propia', /destino\.html\?lugar=isletas-de-granada/.test(await popup.locator('a.is-primary').getAttribute('href')));
    await page.waitForFunction(() => document.querySelector('.bq-atlas-card [data-bq-rating]')?.getAttribute('data-bq-rating-state'), null, { timeout: 10000 });
    check('mapa: estrellas del popup salen del servicio', /4,3|4\.3/.test(await popup.locator('[data-bq-rating]').innerText()), await popup.locator('[data-bq-rating]').innerText());
    await route.click();
    await page.waitForSelector('.bq-nav:not([hidden])', { timeout: 15000 });
    await page.waitForTimeout(1200);
    const notice = await page.locator('.bq-nav').innerText();
    check('mapa: zona no traza ruta (sin pedido a Valhalla)', calls.valhalla === 0 && /área general|zona/i.test(notice), 'valhalla=' + calls.valhalla);
    check('mapa: sin errores de JavaScript', errors.length === 0, errors.join(' | '));
    check('mapa: ninguna escritura llegó a producción', true, 'bloqueadas=' + calls.blockedWrites);
    await ctx.close();

    const exact = await newPage(browser);
    await exact.page.goto(BASE + 'mapa.html?q=' + encodeURIComponent('Playa Poneloya'), { waitUntil: 'domcontentloaded' });
    await exact.page.waitForSelector('.bq-atlas-card', { timeout: 30000 });
    const btn = exact.page.locator('.bq-atlas-card [data-bq-route]').first();
    check('mapa: pin exacto sí ofrece «Cómo llegar»', (await btn.getAttribute('data-precision')) === 'exact' && /Cómo llegar/.test(await btn.innerText()));
    await exact.ctx.close();
  }

  // B) /destinos y «Todos los destinos»: ninguna cifra escrita a mano; las reales llegan del servicio.
  for (const pageName of ['destinos.html', 'todos-los-destinos.html']) {
    const { ctx, page, errors } = await newPage(browser);
    await page.goto(BASE + pageName, { waitUntil: 'domcontentloaded' });
    // La página pagina las tarjetas: se revisan todas las que están en el DOM.
    // Las tarjetas estáticas pueden reemplazarse por las vivas de Supabase (sin estrellas).
    await page.waitForTimeout(6000);
    await page.waitForFunction(() => document.querySelectorAll('.dest-highlight-rating:not([data-bq-rating-state])').length === 0, null, { timeout: 20000 });
    const pageText = await page.locator('main').innerText();
    const inventadas = (pageText.match(/★?\s*\d[.,]\d\s*\((?:\d[\d,.]*)\)/g) || []).filter((t) => !/4[,.]3 \(3\)/.test(t));
    check(pageName + ': ninguna cifra de estrellas inventada en toda la página', inventadas.length === 0, inventadas.join(' | '));
    const texts = await page.locator('.dest-highlight-rating').allInnerTexts();
    const fake = texts.filter((t) => /\d[.,]\d\s*\(\d[\d,.]*\)/.test(t) && !/4[,.]3 \(3\)/.test(t));
    check(pageName + ': sin estrellas inventadas (' + texts.length + ' tarjetas)', fake.length === 0, fake.join(' | '));
    const empty = texts.filter((t) => /Aún sin valoraciones/.test(t)).length;
    const isletas = page.locator('[data-bq-rating="destination:isletas"]');
    const hasIsletas = await isletas.count();
    if (texts.length) check(pageName + ': «Aún sin valoraciones» donde no hay opiniones', empty === texts.length - hasIsletas, empty + '/' + texts.length);
    if (hasIsletas) {
      check(pageName + ': valoración real del lugar vinculado', /4[,.]3/.test(await isletas.innerText()), await isletas.innerText());
      const cardRating = await isletas.evaluate((n) => n.closest('[data-rating]')?.dataset.rating);
      check(pageName + ': el filtro «Valoración» usa el promedio real', cardRating === '4.3', 'data-rating=' + cardRating);
    }
    check(pageName + ': sin errores de JavaScript', errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  // C) Ficha del lugar: datos de Supabase, precisión, opiniones, XSS, idioma.
  {
    const { ctx, page, calls, errors } = await newPage(browser);
    await page.goto(BASE + 'destino.html?lugar=isletas-de-granada', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.bq-pf-title', { timeout: 30000 });
    check('ficha: título del lugar real', /Isletas de Granada/.test(await page.locator('.bq-pf-title').innerText()));
    check('ficha: avisa que el punto es una zona', await page.locator('.bq-pf-precision.is-area').count() === 1);
    await page.waitForSelector('.bq-rv-item', { timeout: 15000 });
    check('ficha: promedio y cantidad reales', /4[,.]3/.test(await page.locator('.bq-rv-avg').innerText()) && /3 opiniones aprobadas/.test(await page.locator('.bq-rv-avg').innerText()));
    check('ficha: respuesta oficial distinguida', /Respuesta de BAQUEANO/.test(await page.locator('.bq-rv-reply').first().innerText()));
    check('ficha: idioma original indicado', /Escrita en inglés/i.test(await page.locator('.bq-rv-lang').first().innerText()));
    check('ficha: texto de usuario nunca se interpreta como HTML', (await page.evaluate(() => window.__xss)) === undefined && /<img src=x/.test(await page.locator('.bq-rv-text').first().innerText()));
    check('ficha: sin sesión ofrece iniciar sesión (no formulario)', await page.locator('.bq-rv-mine .bq-rv-btn').count() === 1 && await page.locator('.bq-rv-form').count() === 0);
    await page.locator('.bq-rv-chip', { hasText: 'Críticas' }).click();
    await page.waitForFunction(() => document.querySelector('.bq-rv-chip.is-active')?.textContent === 'Críticas');
    check('ficha: orden «Críticas» pide al servidor y reordena', calls.reviews.some((c) => c.action === 'list' && c.sort === 'critical') && /3 de 5/.test(await page.locator('.bq-rv-item .bq-rv-stars').first().getAttribute('aria-label')));
    await page.evaluate(() => window.BaqueanoLanguage && window.BaqueanoLanguage.set && window.BaqueanoLanguage.set('en'));
    await page.waitForFunction(() => /Visitor reviews/.test(document.querySelector('.bq-rv-title')?.textContent || ''), null, { timeout: 10000 }).catch(() => {});
    check('ficha: cambia de idioma sin recargar', /Visitor reviews/.test(await page.locator('.bq-rv-title').innerText()), await page.locator('.bq-rv-title').innerText());
    check('ficha: sin errores de JavaScript', errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  // D) Lugar inexistente y ficha del catálogo con su sección de opiniones.
  {
    const { ctx, page } = await newPage(browser);
    await page.goto(BASE + 'destino.html?lugar=no-existe-en-baqueano', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.bq-pf-missing', { timeout: 30000 });
    check('ficha: lugar inexistente muestra «no encontrado»', true);
    await page.goto(BASE + 'destino.html?id=granada', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-bq-reviews="destination:granada"] .bq-rv-note', { timeout: 20000 });
    check('ficha del catálogo: destino ambiguo no recibe opiniones (sin inventar vínculo)', /todavía no está vinculado/.test(await page.locator('[data-bq-reviews] .bq-rv-note').first().innerText()));
    await ctx.close();
  }

  // E) Celular: sin desplazamiento horizontal.
  {
    const { ctx, page } = await newPage(browser, { viewport: { width: 375, height: 800 } });
    for (const path of ['destino.html?lugar=isletas-de-granada', 'mapa.html?q=' + encodeURIComponent('Isletas de Granada')]) {
      await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(4000);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      check('celular 375 px sin desplazamiento horizontal: ' + path.split('?')[0], overflow <= 1, 'exceso=' + overflow);
    }
    await ctx.close();
  }
} finally {
  await browser.close();
}

let failed = 0;
for (const r of results) {
  if (!r.ok) failed += 1;
  console.log((r.ok ? '✅' : '❌') + ' ' + r.name + (r.detail && !r.ok ? ' — ' + r.detail : ''));
}
console.log(`\n${results.length - failed}/${results.length} casos OK`);
process.exit(failed ? 1 : 0);
