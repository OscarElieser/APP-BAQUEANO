#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: checklist 20/20 — requisitos 10 (ALT en ejecución), 13 (contraste WCAG 2.2 AA),
 *   14 (responsive en 16 anchos), 15 (404), 16 (enlaces/anclas en ejecución) y 18 (WhatsApp).
 *   "Tener media queries" no prueba responsive: esto lo mide en un navegador real, con el
 *   shell (navbar/footer/BAQUI) ya montado por JavaScript.
 * ⚙️ CÓMO: Playwright + axe-core contra la salida publicada servida en local (BASE_URL).
 *   Por página y ancho: desborde horizontal (scrollWidth > innerWidth), elementos
 *   interactivos visibles fuera del viewport e imágenes sin alt. A 390 y 1366 px: axe
 *   (wcag2a/aa, wcag21aa, wcag22aa), anclas #id inexistentes, WhatsApp y cajón móvil.
 * 📦 QUÉ: `BASE_URL=http://127.0.0.1:8790/ AXE_PATH=… node scripts/browser-qa.mjs [--widths=320,390]`
 *   → docs/production-audit/browser-qa.json; código 1 si hay desborde horizontal,
 *   violaciones axe críticas o graves, imágenes sin alt o enlaces de WhatsApp inseguros.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = (process.env.BASE_URL || 'http://127.0.0.1:8790/').replace(/\/?$/, '/');
const require = createRequire(import.meta.url);
const AXE_PATH = process.env.AXE_PATH || require.resolve('axe-core/axe.min.js');
const argWidths = (process.argv.find((a) => a.startsWith('--widths=')) || '').split('=')[1];
const WIDTHS = argWidths ? argWidths.split(',').map(Number) : [320, 360, 375, 390, 412, 430, 480, 600, 768, 820, 1024, 1280, 1366, 1440, 1920, 2560];
const AXE_WIDTHS = new Set([390, 1366]);
const PAGES = ['index.html', 'destinos.html', 'destino.html', 'departamento.html?depto=madriz', 'mapa.html', 'experiencias.html',
  'historia.html', 'gastronomia.html', 'musica.html', 'cronicas.html', 'baqueano-ia.html', 'mi-viaje.html', 'perfil.html',
  'favoritos.html', 'mi-negocio.html', 'testimonios.html', 'nosotros.html', 'aliados.html', 'ambiental.html', 'denuncias.html',
  'ayuda.html', 'cookies.html', 'privacidad.html', 'terminos.html', 'aviso-legal.html', 'legal.html', '404.html', 'offline.html'];
const OUT = path.resolve(ROOT, '../docs/production-audit/browser-qa.json');

const browser = await chromium.launch();
const results = [];
const consent = JSON.stringify({ essential: true, preferences: false, analytics: false, version: 1, policyVersion: '2026-09-26' });

async function inspect(pageName, width) {
  const context = await browser.newContext({ viewport: { width, height: width < 768 ? 844 : 900 }, reducedMotion: 'reduce' });
  await context.addInitScript((value) => { try { localStorage.setItem('baqueano_cookie_consent_v1', value); } catch (e) { /* sin almacenamiento */ } }, consent);
  await context.route(/supabase\.co|googleapis\.com\/identitytoolkit|firestore\.googleapis|open-meteo|wa\.me/, (route) => route.abort());
  const page = await context.newPage();
  const row = { page: pageName, width, overflowPx: 0, offscreen: [], imgNoAlt: [], error: null };
  try {
    await page.goto(BASE + pageName, { waitUntil: 'load', timeout: 45000 });
    await page.waitForTimeout(1800);
    Object.assign(row, await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const overflowPx = Math.max(0, document.documentElement.scrollWidth - window.innerWidth);
      const visible = (el) => { const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return s.visibility !== 'hidden' && s.display !== 'none' && r.width > 0 && r.height > 0 && Number(s.opacity) > 0.05; };
      const clippedByAncestor = (el) => { let p = el.parentElement; while (p && p !== document.body) { const s = getComputedStyle(p); if (/(hidden|auto|scroll|clip)/.test(s.overflowX)) return true; p = p.parentElement; } return false; };
      const offscreen = [...document.querySelectorAll('a[href], button, input, select, textarea')]
        .filter((el) => visible(el) && !el.closest('[aria-hidden="true"], [hidden], .nav-drawer:not(.is-open), #bqCookieConsent'))
        .filter((el) => { const r = el.getBoundingClientRect(); return (r.left < -2 || r.right > vw + 2) && !clippedByAncestor(el); })
        .slice(0, 8).map((el) => (el.id ? '#' + el.id : el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0]) + ` [${Math.round(el.getBoundingClientRect().left)},${Math.round(el.getBoundingClientRect().right)}]`);
      const imgNoAlt = [...document.images].filter((img) => !img.hasAttribute('alt')).slice(0, 8).map((img) => img.getAttribute('src'));
      return { overflowPx, offscreen, imgNoAlt };
    }));

    if (AXE_WIDTHS.has(width)) {
      await page.addScriptTag({ path: AXE_PATH });
      const axe = await page.evaluate(async () => {
        const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] });
        return r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, sample: v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ') }));
      });
      row.axe = axe;
      Object.assign(row, await page.evaluate(() => {
        const missingAnchors = [...document.querySelectorAll('a[href^="#"]')].map((a) => decodeURIComponent(a.getAttribute('href').slice(1))).filter((id) => id && !document.getElementById(id) && !document.getElementsByName(id).length);
        const whatsapp = [...document.querySelectorAll('a[href*="wa.me"], a[href*="api.whatsapp.com"]')].map((a) => ({
          href: a.getAttribute('href').slice(0, 60),
          safe: a.target !== '_blank' || /noopener/.test(a.rel || ''),
          name: (a.getAttribute('aria-label') || a.textContent || a.title || '').trim().slice(0, 40)
        }));
        return { missingAnchors: [...new Set(missingAnchors)], whatsapp };
      }));
    }
    if (width === 390) {
      row.drawer = await page.evaluate(async () => {
        const toggle = document.getElementById('mobileNavToggle');
        if (!toggle || toggle.offsetParent === null) return { present: false };
        toggle.click();
        await new Promise((r) => setTimeout(r, 450));
        const menu = document.getElementById('navLinksMenu');
        const s = getComputedStyle(menu);
        const links = [...menu.querySelectorAll('a[href]')].filter((a) => a.offsetParent !== null);
        const last = links[links.length - 1];
        if (last) last.scrollIntoView({ block: 'end' });
        await new Promise((r) => setTimeout(r, 150));
        const rect = last ? last.getBoundingClientRect() : null;
        const result = { present: true, open: toggle.getAttribute('aria-expanded') === 'true', overflowY: s.overflowY, scrollable: menu.scrollHeight <= menu.clientHeight + 1 || /(auto|scroll)/.test(s.overflowY), lastReachable: rect ? rect.bottom <= window.innerHeight + 1 && rect.top >= 0 : true };
        toggle.click();
        await new Promise((r) => setTimeout(r, 300));
        result.closes = toggle.getAttribute('aria-expanded') === 'false';
        return result;
      });
    }
  } catch (error) { row.error = error.message.slice(0, 160); }
  await context.close();
  return row;
}

const queue = PAGES.flatMap((p) => WIDTHS.map((w) => [p, w]));
const workers = Number(process.env.QA_WORKERS || 4);
await Promise.all(Array.from({ length: workers }, async () => {
  while (queue.length) {
    const [p, w] = queue.shift();
    results.push(await inspect(p, w));
  }
}));
await browser.close();
results.sort((a, b) => a.page.localeCompare(b.page) || a.width - b.width);

// Página 404: contenido propio con salidas útiles (el estado HTTP 404 real lo verifica kronox-prod-evidence en producción).
const notFound = fs.readFileSync(path.join(ROOT, '404.html'), 'utf8');
const notFoundLinks = ['index.html', 'destinos.html', 'mapa.html', 'experiencias.html'].map((href) => ({ href, present: notFound.includes(`href="${href}"`) || notFound.includes(`href="/${href}"`) }));

const fails = [];
for (const r of results) {
  if (r.error) fails.push(`${r.page}@${r.width}: error ${r.error}`);
  if (r.overflowPx > 1) fails.push(`${r.page}@${r.width}: desborde horizontal ${r.overflowPx}px`);
  if (r.imgNoAlt.length) fails.push(`${r.page}@${r.width}: ${r.imgNoAlt.length} img sin alt`);
  for (const v of r.axe || []) if (['critical', 'serious'].includes(v.impact)) fails.push(`${r.page}@${r.width}: axe ${v.impact} ${v.id} (${v.nodes}) ${v.sample.slice(0, 90)}`);
  for (const w of r.whatsapp || []) if (!w.safe || !w.name) fails.push(`${r.page}@${r.width}: WhatsApp inseguro o sin nombre accesible ${w.href}`);
  if (r.drawer && r.drawer.present && !(r.drawer.open && r.drawer.lastReachable && r.drawer.closes)) fails.push(`${r.page}@390: cajón móvil ${JSON.stringify(r.drawer)}`);
}
for (const l of notFoundLinks) if (!l.present) fails.push(`404.html sin enlace a ${l.href}`);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), base: BASE, widths: WIDTHS, pages: PAGES, notFoundLinks, fails, results }, null, 1));
console.log(`Browser QA: ${PAGES.length} páginas × ${WIDTHS.length} anchos = ${results.length} cargas · fallos ${fails.length}`);
for (const f of fails.slice(0, 60)) console.log(' ✗', f);
process.exit(fails.length ? 1 : 0);
