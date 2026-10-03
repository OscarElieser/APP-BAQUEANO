// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MEDICIÓN DE RENDIMIENTO PLAYWRIGHT (measure_perf.cjs)
// ============================================================================
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Medir objetivamente tiempos de carga, peso de red, solicitudes y transferencias
//   en emulación móvil antes y después de las optimizaciones de ingeniería.
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Usa Playwright Chromium con emulación móvil (iPhone / Pixel 390x844),
//   monitorea eventos de red, agrupa bytes transferidos por tipo de recurso y
//   mide DOMContentLoaded, Load y First Contentful Paint.
// 📦 3. QUÉ (WHAT / ENTREGABLES):
// - Tabla de métricas por página con desglose de solicitudes y kilobytes.
// ============================================================================

const { chromium } = require('../website/node_modules/@playwright/test');

const PAGES = [
  'index.html',
  'destinos.html',
  'departamento.html',
  'historia.html',
  'baqueano-ia.html',
  'mi-viaje.html'
];

async function measurePage(browser, pageName) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
  });
  const page = await context.newPage();

  let totalRequests = 0;
  let totalBytes = 0;
  let jsBytes = 0;
  let cssBytes = 0;
  let imgBytes = 0;
  let fontBytes = 0;
  let otherBytes = 0;
  const consoleErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  page.on('response', async res => {
    totalRequests++;
    try {
      const headers = res.headers();
      const len = parseInt(headers['content-length'], 10) || 0;
      totalBytes += len;
      const type = headers['content-type'] || '';
      if (/javascript/i.test(type)) jsBytes += len;
      else if (/css/i.test(type)) cssBytes += len;
      else if (/image/i.test(type)) imgBytes += len;
      else if (/font/i.test(type)) fontBytes += len;
      else otherBytes += len;
    } catch (_) {}
  });

  const startTime = Date.now();
  await page.goto(`http://127.0.0.1:5000/${pageName}`, { waitUntil: 'load', timeout: 30000 });
  const loadTime = Date.now() - startTime;

  // Measure performance timing from browser
  const perfTiming = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    const fcp = paint.find(p => p.name === 'first-contentful-paint');
    return {
      domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : 0,
      loadEvent: nav ? Math.round(nav.loadEventEnd - nav.startTime) : 0,
      fcp: fcp ? Math.round(fcp.startTime) : 0
    };
  });

  await context.close();

  return {
    page: pageName,
    loadMs: loadTime,
    domContentMs: perfTiming.domContentLoaded,
    fcpMs: perfTiming.fcp,
    requests: totalRequests,
    totalKB: Math.round(totalBytes / 1024),
    jsKB: Math.round(jsBytes / 1024),
    cssKB: Math.round(cssBytes / 1024),
    imgKB: Math.round(imgBytes / 1024),
    fontKB: Math.round(fontBytes / 1024),
    errors: consoleErrors.length
  };
}

async function run() {
  console.log('=== MEDICIÓN DE RENDIMIENTO MÓVIL (Playwright) ===');
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const p of PAGES) {
    try {
      const res = await measurePage(browser, p);
      results.push(res);
      console.log(`✓ ${p} medido en ${res.loadMs}ms (${res.totalKB} KB, ${res.requests} reqs)`);
      if (res.errors > 0) {
        console.log(`  ⚠ Errores en ${p}:`, res.errorList);
      }
    } catch (err) {
      console.error(`✗ Error midiendo ${p}:`, err.message);
    }
  }

  await browser.close();

  console.log('\n--- RESULTADOS BASELINE ---');
  console.table(results);
}

run().catch(console.error);
