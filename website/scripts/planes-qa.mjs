#!/usr/bin/env node
/**
 * 🧪 BAQUEANO — PRUEBAS DE NAVEGADOR DE LOS BENEFICIOS POR PLAN
 *
 * 🎯 POR QUÉ (propietario, 2026-10-20): «adaptar según el plan seleccionado para cumplir lo que
 *   debemos hacer». Comprueba que «Mi plan» muestra cada pedido (antes una variable tapaba al
 *   contenedor y no se veía ninguno), las fotos y entregas que corresponden a cada plan, los
 *   enlaces de evidencia, el informe del mes solo en Cumbre (con datos reales, sin inventar) y
 *   el tablero «Compromisos del mes» del Ops Center (registrar y anular con motivo).
 * ⚙️ CÓMO: sirve dist-hostinger (BASE_URL). Bloquea el service worker, el SDK de Firebase y toda
 *   escritura a Supabase. La sesión de Firebase y la Edge Function baqueano-plans se SIMULAN con
 *   pedidos de ensayo que solo existen en esta prueba.
 * 📦 QUÉ: `BASE_URL=http://127.0.0.1:8790/ node scripts/planes-qa.mjs` → casos y salida 1 si falla alguno.
 */
import { chromium } from '@playwright/test';

const BASE = (process.env.BASE_URL || 'http://127.0.0.1:8790/').replace(/\/?$/, '/');
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: !!ok, detail });
const MONTH = new Date(Date.now() - 6 * 3600000).toISOString().slice(0, 7) + '-01';

const RULES = {
  sendero: { photo_limit: 6, automatic: { statsCompare: false, departmentFeatured: false, home: false }, monthly: {}, once: ['social_welcome'] },
  cumbre: { photo_limit: null, automatic: { statsCompare: true, departmentFeatured: true, home: true, alliesFirst: true, baquiRecommends: true, promo: true }, monthly: { social_post: 4, chronicle: 1, social_ad: 1, report_pdf: 1 }, once: ['social_welcome', 'verification', 'video', 'onboarding'] },
};
const ORDERS = [
  { code: 'PL-PRUEBA-000001', plan_code: 'cumbre', billing_period: 'monthly', amount_usd: 90, amount_nio: 3296, status: 'paid', business_name: 'Local Cumbre de Prueba',
    period_start: MONTH, period_end: '2099-01-01', receipt_number: 'BQ-PRUEBA', business_id: 'biz-prueba', promo_text: null, must_change_password: false,
    stats: { month: MONTH.slice(0, 7), views: 41, views_prev: 30, whatsapp: 7, calls: 2, messages: 1, contacts_prev: 6 },
    rules: RULES.cumbre, month: MONTH,
    duties: [
      { kind: 'social_post', cadence: 'monthly', required: 4, done: 1, missing: 3 },
      { kind: 'chronicle', cadence: 'monthly', required: 1, done: 0, missing: 1 },
      { kind: 'social_welcome', cadence: 'once', required: 1, done: 1, missing: 0 },
    ],
    delivered: [{ kind: 'social_post', evidence_url: 'https://instagram.com/p/prueba-qa', done_at: new Date().toISOString() }, { kind: 'social_welcome', evidence_url: 'https://facebook.com/prueba-qa', done_at: new Date().toISOString() }] },
  { code: 'PL-PRUEBA-000002', plan_code: 'sendero', billing_period: 'monthly', amount_usd: 10, amount_nio: 366, status: 'paid', business_name: 'Local Sendero de Prueba',
    period_start: MONTH, period_end: '2099-01-01', receipt_number: 'BQ-PRUEBA2', business_id: null, must_change_password: false,
    rules: RULES.sendero, month: MONTH, duties: [{ kind: 'social_welcome', cadence: 'once', required: 1, done: 0, missing: 1 }], delivered: [] },
];

async function open(browser, myPlans = { ok: true, orders: ORDERS }) {
  const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1280, height: 900 }, locale: 'es-NI' });
  await ctx.addInitScript(() => {
    try { localStorage.setItem('baqueano_cookie_consent_v1', JSON.stringify({ essential: true, preferences: false, analytics: false, version: 1, policyVersion: '2026-09-26' })); } catch (_) { /* nada */ }
    // Sesión simulada del propietario (solo en esta prueba).
    const user = { uid: 'uid-prueba', email: 'prueba@example.org', displayName: 'Prueba', getIdToken: () => Promise.resolve('token-prueba') };
    const authObj = { currentUser: user, onAuthStateChanged(cb) { setTimeout(() => cb(user), 0); return () => {}; }, signOut: () => Promise.resolve() };
    const auth = Object.assign(() => authObj, { GoogleAuthProvider: function () {} });
    const any = new Proxy(function () {}, { get: (t, k) => (k === 'then' ? undefined : any), apply: () => any });
    window.firebase = new Proxy({ apps: [{}], auth, initializeApp: () => ({}), app: () => ({}) }, { get: (t, k) => (k in t ? t[k] : any) });
  });
  const calls = [];
  await ctx.route('**/*', (route) => {
    const req = route.request();
    const url = req.url();
    if (url.includes('/functions/v1/baqueano-plans')) {
      const body = JSON.parse(req.postData() || '{}');
      calls.push(body);
      let data = { ok: false, error: 'no simulado' };
      if (body.action === 'catalog') data = { ok: true, plans: [], iva: { iva_enabled: false, iva_rate: 0.15 } };
      if (body.action === 'my_plans') data = myPlans;
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
    }
    if (/gstatic\.com\/firebasejs/.test(url)) return route.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
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
  // 1) Mi plan
  {
    const { ctx, page, errors } = await open(browser);
    await page.goto(BASE + 'planes.html#mi-plan', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#bqMyPlan .bq-my-plan-item', { timeout: 15000 }).catch(() => null);
    const items = await page.$$eval('#bqMyPlan .bq-my-plan-item', (n) => n.length);
    check('Mi plan muestra cada pedido (sin el error de «box»)', items === 2, `${items} pedidos`);
    const photos = await page.$$eval('.bq-my-plan-photos', (n) => n.map((x) => x.textContent));
    check('Fotos según el plan: Cumbre sin límite, Sendero 6', /sin límite/.test(photos[0] || '') && /6/.test(photos[1] || ''), photos.join(' | '));
    const duties = await page.$$eval('.bq-my-plan-item', (n) => n.map((x) => [...x.querySelectorAll('.bq-my-plan-duties li')].map((li) => li.textContent.trim())));
    check('Cumbre: 1 de 4 publicaciones y la Crónica pendiente', duties[0] && duties[0].some((d) => /1 de 4/.test(d)) && duties[0].some((d) => /Crónicas/.test(d)), JSON.stringify(duties[0]));
    check('Sendero: solo la bienvenida, pendiente', duties[1] && duties[1].length === 1 && /Pendiente/.test(duties[1][0]), JSON.stringify(duties[1]));
    const links = await page.$$eval('.bq-duty-link', (n) => n.map((a) => [a.getAttribute('href'), a.getAttribute('rel')]));
    check('Evidencia enlazada y con rel seguro', links.length === 2 && links.every(([h, r]) => /^https:\/\//.test(h) && /noopener/.test(r)), JSON.stringify(links));
    const reportBtns = await page.$$eval('.bq-my-plan-item', (n) => n.map((x) => [...x.querySelectorAll('button')].some((b) => /Informe del mes/.test(b.textContent))));
    check('Informe del mes solo en Cumbre', reportBtns[0] === true && reportBtns[1] === false, JSON.stringify(reportBtns));
    const [popup] = await Promise.all([page.waitForEvent('popup', { timeout: 8000 }).catch(() => null), page.click('.bq-my-plan-item >> text=Informe del mes').catch(() => null)]);
    if (popup) {
      await popup.waitForLoadState('domcontentloaded');
      const txt = await popup.textContent('body');
      check('Informe con datos reales del mes y comparación', /41/.test(txt) && /30 \(\+11\)/.test(txt) && /Contactos en total/.test(txt), txt.slice(0, 160));
      check('Informe con entregas y pendientes', /Lo que BAQUEANO hizo/.test(txt) && /Pendiente este mes/.test(txt) && /Ver publicación/.test(txt));
      const injected = await popup.evaluate(() => document.querySelectorAll('script').length);
      check('Informe sin scripts inyectados', injected === 0, `${injected} scripts`);
    } else check('Informe se abre en una ventana', false);
    // Sin datos: no inventa números.
    const html = await page.evaluate(() => window.BaqueanoPlanReport._build({ plan_code: 'cumbre', business_name: '<b>X</b>', duties: [], delivered: [] }));
    check('Informe sin datos: lo dice y escapa el nombre', /aparecen cuando tu local esté publicado/.test(html) && /&lt;b&gt;X/.test(html) && !/<b>X/.test(html));
    // Idioma en vivo
    await page.evaluate(() => window.BaqueanoLanguage && window.BaqueanoLanguage.set && window.BaqueanoLanguage.set('en'));
    await page.waitForTimeout(600);
    await page.evaluate(() => window.dispatchEvent(new Event('baqueano_session_updated')));
    await page.waitForTimeout(800);
    const en = await page.$$eval('.bq-my-plan-duties h4', (n) => n.map((x) => x.textContent));
    check('Traducido al cambiar de idioma (inglés)', en.some((t) => /What BAQUEANO does/.test(t)), en.join(' | '));
    if (process.env.QA_DEBUG) console.log('ERRORES:', JSON.stringify(errors));
    const relevant = errors.filter((e) => !/^db\.collection\(\.\.\.\)/.test(e) /* solo el Firestore simulado */);
    check('Sin errores de JavaScript propios en planes.html', relevant.length === 0, relevant.join(' | '));
    await ctx.close();
  }

  // 1b) Equipo sin pedidos (propietario, 21-10-2026): no se le dice «no tiene planes».
  for (const [role, label] of [['super_admin', 'Superadministrador'], ['admin', 'Administrador'], ['auditor', 'Auditor, solo lectura']]) {
    const { ctx, page } = await open(browser, { ok: true, orders: [], staff_role: role });
    await page.goto(BASE + 'planes.html#mi-plan', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction((l) => { const t = (document.getElementById('bqMyPlan') || {}).textContent || ''; return /todavía no tiene/.test(t) || t.includes(l); }, label, { timeout: 15000 }).catch(() => null);
    const txt = await page.textContent('#bqMyPlan');
    const href = await page.getAttribute('#bqMyPlan a.bq-plan-cta', 'href').catch(() => null);
    check(`Equipo (${role}): sin «no tiene planes», con su rol y acceso al Ops Center`,
      !/todavía no tiene planes/.test(txt) && txt.includes(label) && href === 'admin.html#44-planes', txt.slice(0, 160) + ' · ' + href);
    await ctx.close();
  }
  {
    const { ctx, page } = await open(browser, { ok: true, orders: [], staff_role: null });
    await page.goto(BASE + 'planes.html#mi-plan', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => /todavía no tiene|equipo BAQUEANO/.test((document.getElementById('bqMyPlan') || {}).textContent || ''), null, { timeout: 15000 }).catch(() => null);
    const txt = await page.textContent('#bqMyPlan');
    check('Negocio sin pedidos: sigue viendo «Tu cuenta todavía no tiene planes»', /todavía no tiene planes/.test(txt) && !/equipo BAQUEANO/.test(txt), txt.slice(0, 120));
    await ctx.close();
  }

  // 2) Ops Center: tablero de compromisos (módulo aislado con la Edge Function simulada)
  {
    const { ctx, page, errors } = await open(browser);
    await page.goto(BASE + 'planes.html', { waitUntil: 'domcontentloaded' });
    await page.addScriptTag({ url: BASE + 'js/ops-center/ops-plan-duties.js' });
    const result = await page.evaluate(async (month) => {
      const log = [];
      const item = { id: '00000000-0000-4000-8000-0000000000aa', code: 'PL-PRUEBA-000001', plan_code: 'mirador', business_name: 'Local Mirador de Prueba', business_id: null,
        rules: { photo_limit: 20, automatic: { departmentFeatured: true, alliesFirst: true, statsCompare: true } },
        duties: [{ kind: 'social_post', cadence: 'monthly', required: 2, done: 0, missing: 2 }, { kind: 'verification', cadence: 'once', required: 1, done: 1, missing: 0 }],
        summary: { required: 3, done: 1, missing: 2 },
        history: [{ id: '00000000-0000-4000-8000-0000000000d1', kind: 'verification', status: 'done', done_at: new Date().toISOString(), done_by: 'equipo@baqueano.ni', evidence_url: null }] };
      const call = (action, payload) => { log.push([action, payload]); return Promise.resolve(action === 'duties_list' ? { month, items: [item], totals: { required: 3, done: 1 } } : { ok: true }); };
      const box = window.BaqueanoOpsPlanDuties.section(call, true);
      document.body.appendChild(box);
      await new Promise((r) => setTimeout(r, 200));
      const lines = [...box.querySelectorAll('.ops-duties-list li')].map((li) => li.textContent);
      const hint = box.querySelector('.ops-duties-card .ops-plans-hint').textContent;
      [...box.querySelectorAll('.ops-duties-list li button')][0].click();
      await new Promise((r) => setTimeout(r, 100));
      const dlg = document.querySelector('dialog.ops-plans-dialog');
      const input = dlg.querySelector('input[type=url]');
      input.value = 'https://instagram.com/p/qa';
      dlg.querySelector('footer button').click();
      await new Promise((r) => setTimeout(r, 300));
      return { lines, hint, log, required: input.hasAttribute('required') };
    }, MONTH.slice(0, 7));
    check('Ops: entregas del plan con su avance', result.lines.some((l) => /0\/2 este mes/.test(l)) && result.lines.some((l) => /Una vez · hecho/.test(l)), result.lines.join(' | '));
    check('Ops: fotos permitidas y aviso de negocio sin vincular', /Fotos permitidas: 20/.test(result.hint) && /Falta vincular/.test(result.hint), result.hint);
    check('Ops: publicación en redes exige enlace', result.required === true);
    const rec = result.log.find((x) => x[0] === 'duty_record');
    check('Ops: registra la entrega con pedido, tipo, mes y evidencia', rec && rec[1].kind === 'social_post' && rec[1].evidence_url === 'https://instagram.com/p/qa' && rec[1].order_id === '00000000-0000-4000-8000-0000000000aa', JSON.stringify(rec));
    check('Ops: recarga después de registrar', result.log.filter((x) => x[0] === 'duties_list').length >= 2);
    if (process.env.QA_DEBUG) console.log('ERRORES:', JSON.stringify(errors));
    const relevant = errors.filter((e) => !/^db\.collection\(\.\.\.\)/.test(e) /* solo el Firestore simulado */);
    check('Ops: sin errores de JavaScript', relevant.length === 0, relevant.join(' | '));
    await ctx.close();
  }
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? '✅' : '❌'} ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
console.log(`\n${results.length - failed.length}/${results.length} casos OK`);
process.exit(failed.length ? 1 : 0);
