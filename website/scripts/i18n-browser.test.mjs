#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: Verificar el contrato multilingüe en un navegador real y entre navegaciones.
 * ⚙️ CÓMO: Recorre los seis idiomas en el fixture heredable y comprueba API, evento, DOM, atributo lang y almacenamiento v2.
 * 📦 QUÉ: Prueba Playwright ejecutable contra BASE_URL, sin credenciales ni mutaciones externas.
 */
import { chromium } from '@playwright/test';

const base = process.env.BASE_URL || 'http://127.0.0.1:4179/';
const languages = ['es', 'en', 'fr', 'it', 'pt', 'de'];
const requiredPages = [
  'index.html', 'destinos.html', 'departamento.html?depto=madriz', 'departamento.html?depto=managua',
  'destino.html', 'experiencias.html', 'historia.html', 'gastronomia.html', 'musica.html', 'ambiental.html',
  'mapa.html', 'baqueano-ia.html', 'mi-viaje.html', 'perfil.html', 'nosotros.html', 'terminos.html',
  'privacidad.html', 'cookies.html', 'aviso-legal.html'
];
const browser = await chromium.launch();
const page = await browser.newPage();
page.setDefaultTimeout(30000);
const runtimeErrors = [];
page.on('pageerror', error => runtimeErrors.push(error.message));
await page.route('**/*', route => {
  const request = route.request();
  const resource = request.resourceType();
  const hostname = new URL(request.url()).hostname;
  if (!['127.0.0.1', 'localhost'].includes(hostname) || ['image', 'media', 'font', 'stylesheet'].includes(resource)) return route.abort();
  return route.continue();
});
await page.goto(`${base}i18n-test.html`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(window.BaqueanoLanguage));

for (const language of languages) {
  const result = await page.evaluate(async selected => {
    await window.BaqueanoLanguage.set(selected);
    const dynamic = document.createElement('span');
    dynamic.dataset.i18n = 'actions.search';
    dynamic.textContent = 'Buscar';
    document.getElementById('i18nDynamic').replaceChildren(dynamic);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return {
      selected: window.BaqueanoLanguage.get(),
      htmlLanguage: document.documentElement.lang,
      stored: localStorage.getItem('baqueano_language_v2'),
      dynamic: dynamic.textContent,
      api: ['get', 'set', 't', 'translateElement', 'refresh'].every(name => typeof window.BaqueanoLanguage[name] === 'function')
    };
  }, language);
  if (result.selected !== language || result.stored !== language || !result.htmlLanguage.startsWith(language) || !result.dynamic || !result.api) {
    throw new Error(`Fallo i18n para ${language}: ${JSON.stringify(result)}`);
  }
}

await page.goto(`${base}destinos.html`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(window.BaqueanoLanguage));
const persisted = await page.evaluate(() => ({ language: window.BaqueanoLanguage.get(), stored: localStorage.getItem('baqueano_language_v2') }));
if (persisted.language !== 'de' || persisted.stored !== 'de') throw new Error(`Persistencia fallida: ${JSON.stringify(persisted)}`);

for (const route of requiredPages) {
  console.log(`Checking ${route}…`);
  runtimeErrors.length = 0;
  await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  try {
    await page.waitForFunction(() => Boolean(window.BaqueanoLanguage));
  } catch (error) {
    throw new Error(`${route} no cargó i18n. Errores: ${runtimeErrors.join(' | ') || 'ninguno capturado'}`, { cause: error });
  }
  for (const language of languages) {
    const result = await page.evaluate(async selected => {
      await window.BaqueanoLanguage.set(selected);
      return { selected: window.BaqueanoLanguage.get(), htmlLanguage: document.documentElement.lang };
    }, language);
    if (result.selected !== language || !result.htmlLanguage.startsWith(language)) throw new Error(`${route} falló en ${language}.`);
  }
}

await browser.close();
console.log(`I18N browser contract passed for ${requiredPages.length} required routes in es, en, fr, it, pt and de with cross-page persistence.`);
