/**
 * WHY: Prevent regressions across the public pages corrected from the approved visual specification.
 * HOW: Uses Playwright against the local static server at desktop and mobile widths, then exercises critical flows.
 * WHAT: Reports HTTP, JavaScript, responsive-layout, storage, form, navigation and interactive-control failures.
 */
import { chromium } from '@playwright/test';

const base = process.env.BASE_URL || 'http://127.0.0.1:4179/';
const pages = ['departamento.html?id=managua','index.html','destinos.html','baqueano-ia.html','mi-viaje.html','mapa.html?q=Volcán%20Masaya','experiencias.html','gastronomia.html','ambiental.html','musica.html','aliados.html','denuncias.html','ayuda.html','terminos.html','legal.html','aviso-legal.html','cronicas.html'];
const browser = await chromium.launch();
const failures = [];
const openLocalPage = (page, route) => page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 30000 });

async function acceptStoredConsent(context) {
  await context.addInitScript(() => localStorage.setItem('baqueano_cookie_consent_v1', JSON.stringify({ essential: true, preferences: true, analytics: false, version: 1, updatedAt: new Date().toISOString() })));
  await context.route('**/*', route => {
    const request = route.request();
    const url = new URL(request.url());
    const isLocal = url.hostname === '127.0.0.1' || url.hostname === 'localhost';
    return request.resourceType() === 'media' || !isLocal ? route.abort() : route.continue();
  });
}

for (const width of [390, 1440]) {
  const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 } });
  await acceptStoredConsent(context);
  for (const route of pages) {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const response = await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(500);
    const layout = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2, title: document.title }));
    if (!response || response.status() >= 400 || errors.length || layout.overflow || !layout.title) failures.push({ route, width, status: response?.status(), errors, layout });
    await page.close();
  }
  await context.close();
}

const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await acceptStoredConsent(context);
const page = await context.newPage();
await openLocalPage(page, 'index.html');
await page.locator('.bq-comment-open').first().click();
await page.locator('.bq-comment-form textarea').fill('Una experiencia excelente para conocer Nicaragua.');
await page.locator('.bq-comment-form button[type="submit"]').click();
if (await page.locator('.test-card-exact').count() < 4) failures.push({ flow: 'testimonial-submit' });

await openLocalPage(page, 'denuncias.html');
await page.selectOption('#reportType', { index: 1 });
await page.selectOption('#reportDepartment', { index: 1 });
await page.fill('#reportLocation', 'Sendero de prueba');
await page.fill('#reportDetails', 'Descripción formal de prueba para validar el flujo.');
await page.click('#ecoReportForm button[type="submit"]');
if (!await page.locator('.bq-report-confirmation').count()) failures.push({ flow: 'formal-report' });

await openLocalPage(page, 'aliados.html');
if (!await page.locator('#bqAllySearch').count() || !await page.locator('#bqResetAllyFilters').count()) failures.push({ flow: 'ally-controls' });
await page.fill('#bqAllySearch', 'Somoto');
if (await page.locator('.aliado-card-exact:visible').count() < 1) failures.push({ flow: 'ally-search' });

await openLocalPage(page, 'baqueano-ia.html');
await page.locator('[data-baqui-action="save"]').first().click();
if (!await page.evaluate(() => JSON.parse(localStorage.getItem('baqueano_saved_trips') || '[]').length > 0)) failures.push({ flow: 'baqui-save' });
await page.locator('[data-baqui-action="qr"]').first().click();
if (!await page.locator('#bqRouteQrDialog[open]').count()) failures.push({ flow: 'baqui-qr' });

await openLocalPage(page, 'historia.html');
await page.locator('.hist-people-card').first().click();
if (!await page.locator('.hist-people-card.bq-expanded').count()) failures.push({ flow: 'history-expand' });

await openLocalPage(page, 'musica.html');
await page.evaluate(() => scrollTo(0, 700));
await page.waitForTimeout(200);
if (!await page.locator('#bqMusicMinimize').count()) failures.push({ flow: 'music-dock' });

await context.close();
await browser.close();
if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}
console.log(`Final website audit passed: ${pages.length} pages, desktop/mobile, and critical interactions.`);
