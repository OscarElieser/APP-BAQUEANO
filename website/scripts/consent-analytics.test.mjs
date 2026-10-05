#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: requisitos 3 y 19 del checklist 20/20. "Tener cookies.html" no
 *   prueba consentimiento y "tener código de analítica" no prueba que funcione:
 *   esta prueba lo demuestra en un navegador real.
 * ⚙️ CÓMO: Playwright contra el sitio local (BASE_URL); intercepta las llamadas
 *   a Supabase (no salen a internet) y verifica: sin decisión no hay eventos;
 *   rechazar no envía nada y persiste; el footer reabre la configuración;
 *   aceptar envía page_viewed y whatsapp_clicked sin datos personales; el banner
 *   se traduce (?lang=en); retirar el permiso borra el id anónimo y detiene el envío.
 * 📦 QUÉ: `BASE_URL=http://127.0.0.1:5077/ node scripts/consent-analytics.test.mjs`
 */
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const base = (process.env.BASE_URL || 'http://127.0.0.1:5077/').replace(/\/?$/, '/');
const browser = await chromium.launch();
let passed = 0;
const step = async (name, fn) => { await fn(); passed += 1; console.log(`✓ ${name}`); };

async function newPage() {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const events = [];
  await page.route('**/rest/v1/rpc/track_event', async (route) => {
    events.push(JSON.parse(route.request().postData() || '{}'));
    await route.fulfill({ status: 200, contentType: 'application/json', body: 'true' });
  });
  return { context, page, events };
}
const bannerVisible = (page) => page.evaluate(() => { const el = document.getElementById('bqCookieConsent'); return Boolean(el && !el.hidden); });

await step('sin decisión: el aviso aparece y no se envía ningún evento', async () => {
  const { context, page, events } = await newPage();
  await page.goto(base + 'index.html', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  assert.equal(await bannerVisible(page), true);
  assert.equal(await page.locator('script[data-baqueano-analytics]').count(), 0);
  assert.equal(events.length, 0);
  await context.close();
});

await step('rechazar: no carga analítica, persiste y el footer reabre la configuración', async () => {
  const { context, page, events } = await newPage();
  await page.goto(base + 'destinos.html', { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await page.click('[data-cookie-action="reject"]');
  assert.equal(await bannerVisible(page), false);
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(1200);
  assert.equal(await bannerVisible(page), false);
  assert.equal(await page.locator('script[data-baqueano-analytics]').count(), 0);
  await page.evaluate(() => document.querySelector('#siteFooter [data-cookie-open]').click());
  assert.equal(await bannerVisible(page), true);
  assert.equal(await page.evaluate(() => document.getElementById('bqCookieSettings').hidden), false);
  assert.equal(events.length, 0);
  await context.close();
});

await step('aceptar: envía page_viewed y whatsapp_clicked sin datos personales', async () => {
  const { context, page, events } = await newPage();
  await page.goto(base + 'index.html?utm_source=prueba', { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await page.click('[data-cookie-action="accept"]');
  await page.waitForFunction(() => Boolean(window.BaqueanoAnalytics));
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => Boolean(window.BaqueanoAnalytics));
  await page.waitForTimeout(500);
  assert.ok(events.some((e) => e.p_event_name === 'page_viewed'), 'page_viewed enviado');
  await page.evaluate(() => {
    const a = document.createElement('a');
    a.href = 'https://wa.me/50584431289'; a.target = '_blank'; a.textContent = 'wa';
    a.addEventListener('click', (ev) => ev.preventDefault());
    document.body.appendChild(a); a.click();
  });
  await page.waitForTimeout(300);
  assert.ok(events.some((e) => e.p_event_name === 'whatsapp_clicked'), 'whatsapp_clicked enviado');
  const raw = JSON.stringify(events);
  assert.ok(!/@|password|token|Bearer|50584431289/i.test(raw), 'sin correo, contraseña, token ni teléfono en los eventos');
  for (const e of events) {
    assert.equal(e.p_platform, 'web');
    assert.match(e.p_anonymous_id, /^web-/);
  }
  await context.close();
});

await step('el aviso se traduce con ?lang=en', async () => {
  const { context, page } = await newPage();
  await page.goto(base + 'index.html?lang=en', { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  const title = await page.textContent('#bqCookieTitle');
  assert.equal(title.trim(), 'Your privacy and your preferences');
  await context.close();
});

await step('retirar el permiso detiene el envío y borra el id anónimo', async () => {
  const { context, page, events } = await newPage();
  await page.goto(base + 'index.html', { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  await page.click('[data-cookie-action="accept"]');
  await page.waitForFunction(() => Boolean(window.BaqueanoAnalytics));
  await page.evaluate(() => window.BaqueanoCookieConsent.open());
  await page.uncheck('#bqConsentAnalytics');
  await page.click('[data-cookie-action="save"]');
  const before = events.length;
  const stored = await page.evaluate(() => localStorage.getItem('baqueano_anonymous_id'));
  assert.equal(stored, null);
  assert.equal(await page.evaluate(() => window.BaqueanoAnalytics.track('page_view', {})), false);
  assert.equal(events.length, before);
  await context.close();
});

await browser.close();
console.log(`\nConsentimiento y analítica: ${passed} casos OK`);
