#!/usr/bin/env node
/**
 * 🧪 BAQUEANO — PRUEBAS DE NAVEGADOR: NEGOCIOS DESTACADOS EN EL INICIO Y GALERÍA POR PLAN
 *
 * 🎯 POR QUÉ (propietario, 2026-10-21): «quitar a BAQÜI del index, la que está después de eventos,
 *   y poner ahí los negocios destacados según su plan» y resolver la galería de fotos por plan.
 *   Comprueba: el espacio junto al mapa ya no tiene la tarjeta de BAQÜI, muestra el estado vacío
 *   sin negocios Cumbre y las tarjetas cuando los hay (solo Cumbre); «Mi plan» sube una foto con
 *   el flujo firmado y la deja pendiente; el Ops Center abre la galería y aprueba; la ficha
 *   pública de Aliados muestra solo lo que devuelve business_media_public.
 * ⚙️ CÓMO: sirve dist-hostinger (BASE_URL). Bloquea el service worker y el SDK de Firebase; la
 *   sesión, la Edge Function baqueano-plans, el almacenamiento y las RPC de Supabase se SIMULAN
 *   con datos de ensayo que solo existen en esta prueba.
 * 📦 QUÉ: `BASE_URL=http://127.0.0.1:8790/ node scripts/galeria-qa.mjs` → casos y salida 1 si falla alguno.
 */
import { chromium } from '@playwright/test';

const BASE = (process.env.BASE_URL || 'http://127.0.0.1:8790/').replace(/\/?$/, '/');
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: !!ok, detail });
const MONTH = new Date(Date.now() - 6 * 3600000).toISOString().slice(0, 7) + '-01';
const PIXEL = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=', 'base64');

const BIZ = [
  { id: 'biz-zz-cumbre', name: 'Casa Cumbre de Prueba', category: 'hospedaje', department_id: 'leon', municipality: 'León', description: 'Hospedaje de ensayo.', whatsapp: '88880000', phone: null, cover_image: null },
  { id: 'biz-zz-mirador', name: 'Mirador de Prueba', category: 'restaurante', department_id: 'granada', municipality: 'Granada', description: 'Restaurante de ensayo.', whatsapp: null, phone: null, cover_image: null },
];

async function open(browser, opts = {}) {
  const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: opts.viewport || { width: 1280, height: 900 }, locale: 'es-NI' });
  await ctx.addInitScript(() => {
    try { localStorage.setItem('baqueano_cookie_consent_v1', JSON.stringify({ essential: true, preferences: false, analytics: false, version: 1, policyVersion: '2026-09-26' })); } catch (_) { /* nada */ }
    try { sessionStorage.clear(); } catch (_) { /* nada */ }
    const user = { uid: 'uid-prueba', email: 'prueba@example.org', getIdToken: () => Promise.resolve('token-prueba') };
    const authObj = { currentUser: user, onAuthStateChanged(cb) { setTimeout(() => cb(user), 0); return () => {}; }, signOut: () => Promise.resolve() };
    const auth = Object.assign(() => authObj, { GoogleAuthProvider: function () {} });
    const any = new Proxy(function () {}, { get: (t, k) => (k === 'then' ? undefined : any), apply: () => any });
    window.firebase = new Proxy({ apps: [{}], auth, initializeApp: () => ({}), app: () => ({}) }, { get: (t, k) => (k in t ? t[k] : any) });
  });
  const calls = [];
  const media = { items: [], used: 0 };
  await ctx.route('**/*', (route) => {
    const req = route.request();
    const url = req.url();
    const json = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
    if (url.includes('/rest/v1/rpc/public_plan_tiers')) return json(opts.tiers || []);
    if (url.includes('/rest/v1/rpc/business_media_public')) return json(opts.publicMedia || []);
    if (url.includes('/rest/v1/businesses?')) {
      // Igual que PostgREST: filtra por id=in.(…) si viene; si no, devuelve todos los negocios de ensayo.
      const m = decodeURIComponent(url).match(/[?&]id=in\.\(([^)]*)\)/);
      const ids = m ? m[1].split(',').map((x) => x.replace(/"/g, '')) : null;
      return json(ids ? BIZ.filter((b) => ids.includes(b.id)) : BIZ.map((b) => Object.assign({ verification_status: 'partial', verified: false }, b)));
    }
    if (url.includes('/storage/v1/object/upload/sign/')) { calls.push(['PUT', url]); return json({ Key: 'ok' }); }
    if (url.includes('/functions/v1/baqueano-plans')) {
      const body = JSON.parse(req.postData() || '{}');
      calls.push([body.action, body]);
      const role = opts.role || 'owner';
      if (body.action === 'catalog') return json({ ok: true, plans: [], iva: { iva_enabled: false } });
      if (body.action === 'my_plans') return json({ ok: true, orders: opts.orders || [] });
      if (body.action === 'media_list') return json({ ok: true, role, plan: 'sendero', photo_limit: 6, video_allowed: false, used: media.used, items: media.items });
      if (body.action === 'media_upload_url') return json({ ok: true, path: 'gallery/biz-zz-cumbre/00000000-0000-4000-8000-000000000001.png', token: 't', signed_url: 'https://heiudfpthqwtjrtluqlm.supabase.co/storage/v1/object/upload/sign/businesses/gallery/biz-zz-cumbre/00000000-0000-4000-8000-000000000001.png?token=t' });
      if (body.action === 'media_attach') {
        media.items.push({ id: '00000000-0000-4000-8000-0000000000e1', kind: 'photo', url: 'https://example.org/foto.png', alt_text: body.alt_text, status: role === 'staff' ? 'active' : 'pending', sort_order: 100 });
        media.used += 1;
        return json({ ok: true, media: { id: '00000000-0000-4000-8000-0000000000e1', status: role === 'staff' ? 'active' : 'pending' } });
      }
      if (body.action === 'media_review') { media.items.forEach((m) => { if (m.id === body.id) m.status = body.decision === 'approve' ? 'active' : 'rejected'; }); return json({ ok: true }); }
      if (body.action === 'media_pending') return json({ ok: true, counts: { 'biz-zz-cumbre': 1 } });
      return json({ ok: false, error: 'no simulado' }, 400);
    }
    if (/gstatic\.com\/firebasejs/.test(url)) return route.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
    if (/supabase\.co|firebaseio|identitytoolkit/.test(url) && req.method() !== 'GET') return route.fulfill({ status: 204, body: '' });
    return route.continue();
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message || e)));
  return { ctx, page, calls, errors, media };
}
const own = (errors) => errors.filter((e) => !/^db\.collection\(\.\.\.\)/.test(e)); // solo el Firestore simulado

const browser = await chromium.launch();
try {
  // 1) Inicio sin negocios Cumbre: estado vacío honesto, sin tarjeta de BAQÜI.
  {
    const { ctx, page, errors } = await open(browser, { tiers: [] });
    await page.goto(BASE + 'index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const info = await page.evaluate(() => {
      const sec = document.getElementById('mapaAiSection');
      const slot = document.getElementById('bqHomeFeatured');
      const agenda = document.getElementById('agendaEventos');
      return {
        baqui: !!document.getElementById('baqueanoDigitalCard'),
        inMap: !!(sec && slot && sec.contains(slot)),
        afterAgenda: !!(agenda && sec && (agenda.compareDocumentPosition(sec) & Node.DOCUMENT_POSITION_FOLLOWING)),
        emptyVisible: !!slot && getComputedStyle(slot.querySelector('[data-bq-home-featured-empty]')).display !== 'none',
        cards: slot ? slot.querySelectorAll('.bq-feat-card').length : -1,
        cta: slot ? slot.querySelector('.home-featured-cta').getAttribute('href') : '',
        oldBlock: !!document.getElementById('bqFeaturedBiz'),
        mapStill: !!document.getElementById('homeInteractiveMap'),
      };
    });
    check('Inicio: ya no está la tarjeta de BAQÜI junto al mapa', !info.baqui);
    check('Inicio: «Negocios destacados» ocupa ese lugar, después de la Agenda', info.inMap && info.afterAgenda, JSON.stringify(info));
    check('Inicio: sin negocios Cumbre muestra el estado vacío (no inventa)', info.emptyVisible && info.cards === 0 && /planes\.html#cumbre/.test(info.cta));
    check('Inicio: el mapa sigue en su lugar y no se duplica el bloque viejo', info.mapStill && !info.oldBlock);
    // El asistente se carga en tiempo ocioso: se espera a que exista (no a un selector cualquiera).
    const fab = await page.waitForFunction(() => !!window.BaqueanoAssistant, null, { timeout: 15000 }).then(() => true).catch(() => false);
    check('Inicio: BAQÜI sigue disponible (asistente flotante)', fab);
    check('Inicio: sin errores de JavaScript', own(errors).length === 0, own(errors).join(' | '));
    await ctx.close();
  }
  // 2) Inicio con planes: solo Cumbre, con «Destacado».
  {
    const { ctx, page } = await open(browser, { tiers: [{ business_id: 'biz-zz-cumbre', plan_code: 'cumbre', promo_text: null }, { business_id: 'biz-zz-mirador', plan_code: 'mirador', promo_text: null }] });
    await page.goto(BASE + 'index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#bqHomeFeatured .bq-feat-card', { timeout: 10000 }).catch(() => null);
    const names = await page.$$eval('#bqHomeFeatured .bq-feat-card .bq-feat-name', (n) => n.map((x) => x.textContent));
    // Lo que se VE (no solo el atributo hidden): el estado vacío no puede quedar a la vista.
    const empty = await page.$eval('#bqHomeFeatured [data-bq-home-featured-empty]', (n) => getComputedStyle(n).display === 'none');
    const badge = await page.$eval('#bqHomeFeatured .bq-feat-badge i', (n) => parseFloat(getComputedStyle(n).fontSize)).catch(() => 99);
    check('Inicio: el distintivo «Destacado» tiene un ícono de tamaño normal', badge <= 16, badge + 'px');
    check('Inicio: muestra solo los negocios Cumbre (la portada es de Cumbre)', names.length === 1 && names[0] === 'Casa Cumbre de Prueba' && empty, names.join(' | '));
    const shot = await page.$('#mapaAiSection');
    if (shot) await shot.screenshot({ path: '/tmp/claude-0/-home-claude/63fab31e-79b8-50dc-9a7d-c6b6255ce27f/scratchpad/home-destacados.png' });
    await ctx.close();
  }
  // 3) Celular: sin desborde horizontal.
  {
    const { ctx, page } = await open(browser, { tiers: [], viewport: { width: 390, height: 844 } });
    await page.goto(BASE + 'index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const over = await page.evaluate(() => { const s = document.getElementById('bqHomeFeatured'); const r = s.getBoundingClientRect(); return { right: r.right, vw: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }; });
    check('Celular: el bloque cabe en pantalla', over.right <= over.vw + 1 && over.scroll <= over.vw + 1, JSON.stringify(over));
    const shot = await page.$('#bqHomeFeatured');
    if (shot) await shot.screenshot({ path: '/tmp/claude-0/-home-claude/63fab31e-79b8-50dc-9a7d-c6b6255ce27f/scratchpad/home-destacados-movil.png' });
    await ctx.close();
  }
  // 4) Mi plan: subir una foto (queda pendiente de revisión).
  {
    const orders = [{ code: 'PL-PRUEBA-1', plan_code: 'sendero', billing_period: 'monthly', amount_usd: 10, amount_nio: 366, status: 'paid', business_name: 'Casa Cumbre de Prueba',
      period_start: MONTH, period_end: '2099-01-01', receipt_number: 'BQ-P', business_id: 'biz-zz-cumbre', must_change_password: false,
      rules: { photo_limit: 6, automatic: {}, monthly: {}, once: ['social_welcome'] }, month: MONTH, duties: [{ kind: 'social_welcome', cadence: 'once', required: 1, done: 0, missing: 1 }], delivered: [] }];
    const { ctx, page, calls, errors } = await open(browser, { orders });
    await page.goto(BASE + 'planes.html#mi-plan', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.bq-my-plan-item', { timeout: 15000 }).catch(() => null);
    await page.click('text=Fotos de mi ficha');
    await page.waitForSelector('.bq-gal .bq-gal-count', { timeout: 8000 }).catch(() => null);
    const count0 = await page.textContent('.bq-gal .bq-gal-count').catch(() => '');
    check('Mi plan: la galería muestra el límite del plan', /0 de 6 fotos/.test(count0), count0);
    await page.setInputFiles('.bq-gal input[type=file]', { name: 'foto.png', mimeType: 'image/png', buffer: PIXEL });
    await page.fill('.bq-gal-form input:not([type=file])', 'Terraza de prueba');
    await page.click('.bq-gal >> text=Subir foto');
    await page.waitForSelector('.bq-gal-item', { timeout: 8000 }).catch(() => null);
    const seq = calls.map((c) => c[0]).filter((a) => /^media_|PUT/.test(a));
    check('Mi plan: pide enlace firmado, sube y registra (en ese orden)', seq.join(',').includes('media_upload_url,PUT,media_attach'), seq.join(','));
    const attach = calls.find((c) => c[0] === 'media_attach');
    check('Mi plan: envía la descripción de la foto', attach && attach[1].alt_text === 'Terraza de prueba');
    const chip = await page.textContent('.bq-gal-item .bq-gal-chip').catch(() => '');
    const okMsg = await page.textContent('.bq-gal .bq-gal-msg').catch(() => '');
    check('Mi plan: la foto queda pendiente de revisión', /Pendiente/.test(chip) && /revisa/.test(okMsg), chip + ' | ' + okMsg);
    // Archivo inválido: no sube.
    const before = calls.length;
    await page.setInputFiles('.bq-gal input[type=file]', { name: 'doc.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF') });
    await page.fill('.bq-gal-form input:not([type=file])', 'No es foto');
    await page.click('.bq-gal >> text=Subir foto');
    await page.waitForTimeout(500);
    check('Mi plan: rechaza archivos que no son fotos sin llamar al servidor', !calls.slice(before).some((c) => c[0] === 'media_upload_url'));
    check('Mi plan: sin errores de JavaScript', own(errors).length === 0, own(errors).join(' | '));
    await ctx.close();
  }
  // 5) Ops: botón de galería con pendientes y aprobación.
  {
    const { ctx, page, calls, media } = await open(browser, { role: 'staff' });
    media.items.push({ id: '00000000-0000-4000-8000-0000000000e9', kind: 'photo', url: 'https://example.org/p.png', alt_text: 'Pendiente', status: 'pending', sort_order: 100 });
    media.used = 1;
    await page.goto(BASE + 'planes.html', { waitUntil: 'domcontentloaded' });
    await page.addScriptTag({ url: BASE + 'js/plan-gallery.js' });
    await page.addScriptTag({ url: BASE + 'js/ops-center/ops-plan-duties.js' });
    const out = await page.evaluate(async (month) => {
      const item = { id: '00000000-0000-4000-8000-0000000000aa', plan_code: 'sendero', business_name: 'Casa Cumbre de Prueba', business_id: 'biz-zz-cumbre', rules: { photo_limit: 6, automatic: {} },
        duties: [{ kind: 'social_welcome', cadence: 'once', required: 1, done: 0, missing: 1 }], summary: { required: 1, done: 0, missing: 1 }, history: [] };
      const call = (action, payload) => fetch('https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-plans', { method: 'POST', body: JSON.stringify(Object.assign({ action }, payload)) })
        .then((r) => r.json()).then((b) => { if (action === 'duties_list') return { month, items: [item], totals: { required: 1, done: 0 } }; if (!b.ok) throw new Error(b.error); return b; });
      const box = window.BaqueanoOpsPlanDuties.section(call, true);
      document.body.appendChild(box);
      await new Promise((r) => setTimeout(r, 400));
      const btn = [...box.querySelectorAll('button')].find((b) => /Galería/.test(b.textContent));
      const label = btn ? btn.textContent : '';
      btn && btn.click();
      await new Promise((r) => setTimeout(r, 500));
      const dlg = document.querySelector('dialog.ops-plans-dialog');
      const approve = dlg ? [...dlg.querySelectorAll('button')].find((b) => /Aprobar/.test(b.textContent)) : null;
      approve && approve.click();
      await new Promise((r) => setTimeout(r, 500));
      return { label, chip: dlg ? (dlg.querySelector('.bq-gal-chip') || {}).textContent : '' };
    }, MONTH.slice(0, 7));
    check('Ops: el botón de galería avisa las fotos por revisar', /1 por revisar/.test(out.label), out.label);
    check('Ops: aprobar publica la foto', calls.some((c) => c[0] === 'media_review' && c[1].decision === 'approve') && /Publicada/.test(out.chip), out.chip);
    await ctx.close();
  }
  // 6) Ficha pública: muestra solo lo que devuelve business_media_public.
  {
    const { ctx, page, errors } = await open(browser, { publicMedia: [{ kind: 'photo', url: 'https://example.org/a.png', alt_text: 'Fachada', sort_order: 10 }, { kind: 'video', url: 'https://youtu.be/prueba', alt_text: null, sort_order: 100 }, { kind: 'photo', url: 'javascript:alert(1)', alt_text: 'mala', sort_order: 20 }] });
    await page.goto(BASE + 'aliados.html?negocio=biz-zz-cumbre', { waitUntil: 'domcontentloaded' });
    const opened = await page.waitForSelector('dialog[open][data-business-id="biz-zz-cumbre"]', { timeout: 15000 }).then(() => true).catch(() => false);
    await page.waitForSelector('.bq-ally-gallery', { timeout: 6000 }).catch(() => null);
    const g = await page.evaluate(() => { const w = document.querySelector('.bq-ally-gallery'); return w ? { imgs: [...w.querySelectorAll('img')].map((i) => [i.getAttribute('src'), i.getAttribute('alt')]), video: (w.querySelector('a.bq-ally-btn') || {}).href || '' } : null; });
    if (!opened) check('Ficha pública: hay aliados para abrir', false);
    else {
      check('Ficha pública: muestra las fotos aprobadas con su descripción', g && g.imgs.length === 1 && g.imgs[0][1] === 'Fachada', JSON.stringify(g));
      check('Ficha pública: descarta enlaces que no son https', g && !g.imgs.some((i) => /^javascript/.test(i[0])));
      check('Ficha pública: enlaza el video', g && /youtu\.be/.test(g.video));
    }
    check('Ficha pública: sin errores de JavaScript', own(errors).length === 0, own(errors).join(' | '));
    await ctx.close();
  }
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? '✅' : '❌'} ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
console.log(`\n${results.length - failed.length}/${results.length} casos OK`);
process.exit(failed.length ? 1 : 0);
