#!/usr/bin/env node
/**
 * 🌐 BAQUEANO — EXTRAE EL CONTENIDO SIN TRADUCIR DE TERRITORIOS Y DESTINOS
 *
 * 🎯 POR QUÉ (propietario, 22-10-2026: «Todos» → idiomas parte 2): departamento.html y destino.html
 *   tienen miles de frases editoriales solo en español; el catálogo general no las cubre.
 * ⚙️ CÓMO: abre cada departamento (los 17 de las píldoras) y cada destino en español y en inglés,
 *   recorre la página para que se dibuje todo, y junta los textos y atributos visibles que siguen
 *   iguales en inglés. Son las frases que van a locales/content/territorios.<idioma>.json.
 * 📦 QUÉ: `BASE_URL=http://127.0.0.1:8790/ node scripts/i18n-content-extract.mjs [salida.json]`
 *   → { "frase": { "pages": [...] } } y un resumen. No escribe en locales/.
 */
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';

const BASE = (process.env.BASE_URL || 'http://127.0.0.1:8790/').replace(/\/?$/, '/');
const OUT = process.argv[2] || 'territorios-pendientes.json';
const DESTINOS = ['ometepe', 'granada', 'sjds', 'cerro_negro', 'somoto', 'masaya', 'isletas', 'apoyo', 'cornisland', 'miraflor'];

const browser = await chromium.launch();
const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1280, height: 900 }, locale: 'es-NI' });
await ctx.addInitScript(() => { try { localStorage.setItem('baqueano_cookie_consent_v1', JSON.stringify({ essential: true, version: 1, policyVersion: '2026-09-26' })); } catch (_) {} });
await ctx.route('**/*', (r) => (/\.(png|jpe?g|webp|gif|mp4|webm|woff2?)(\?|$)/i.test(r.request().url()) || !/127\.0\.0\.1|localhost/.test(new URL(r.request().url()).hostname) ? r.abort() : r.continue()));
const page = await ctx.newPage();

async function collect() {
  // Recorre la página para que los bloques diferidos se dibujen.
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
  await page.waitForTimeout(700);
  return page.evaluate(() => {
    const out = new Set();
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    const root = document.querySelector('main') || document.body;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement && !n.parentElement.closest('script,style,noscript,svg,[aria-hidden="true"],.bq-lang-switcher') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
    let n; while ((n = walker.nextNode())) { const t = norm(n.nodeValue); if (t) out.add(t); }
    root.querySelectorAll('[alt],[title],[aria-label],[placeholder]').forEach((el) => ['alt', 'title', 'aria-label', 'placeholder'].forEach((a) => { const v = norm(el.getAttribute(a)); if (v) out.add(v); }));
    return [...out];
  });
}
async function setLang(lang) {
  await page.evaluate((l) => window.BaqueanoLanguage && window.BaqueanoLanguage.set(l), lang);
  await page.waitForTimeout(900);
}
const pending = new Map();
async function visit(url) {
  await page.goto(BASE + url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(window.BaqueanoLanguage), null, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await setLang('es');
  const es = await collect();
  await setLang('en');
  const en = new Set(await collect());
  let count = 0;
  for (const t of es) {
    if (!en.has(t)) continue;                       // ya se traduce
    if (!/[a-záéíóúñü]{3}/i.test(t)) continue;      // números, símbolos, siglas
    if (!pending.has(t)) pending.set(t, { pages: [] });
    pending.get(t).pages.push(url); count++;
  }
  await setLang('es');
  return count;
}

await page.goto(BASE + 'departamento.html', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1500);
const deptos = await page.$$eval('[data-dept-id]', (b) => [...new Set(b.map((x) => x.dataset.deptId))]);
const report = [];
for (const d of deptos) report.push(['departamento.html?id=' + d, await visit('departamento.html?id=' + d)]);
for (const id of DESTINOS) report.push(['destino.html?id=' + id, await visit('destino.html?id=' + id)]);
await browser.close();

const obj = Object.fromEntries([...pending].sort((a, b) => a[0].localeCompare(b[0], 'es')));
writeFileSync(OUT, JSON.stringify(obj, null, 1));
const chars = Object.keys(obj).reduce((s, k) => s + k.length, 0);
for (const [u, c] of report) console.log(String(c).padStart(4), u);
console.log(`\n${Object.keys(obj).length} frases únicas sin traducir · ${chars} caracteres · ${deptos.length} departamentos y ${DESTINOS.length} destinos`);
