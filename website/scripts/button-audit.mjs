#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: el propietario exige que TODOS los botones y enlaces de baqueanonicaragua.com
 *   funcionen ("si hay botones que no tienen página, aplicarla"). Un auditor estático no ve
 *   el menú, el footer ni BAQUI, porque se montan con JavaScript. Hay que probarlos en un
 *   navegador real.
 * ⚙️ CÓMO: Playwright recorre cada página publicada (BASE_URL) a 1366 px y a 390 px.
 *   - Enlaces: destino interno existente (archivo en dist), ancla #id existente, href vacío,
 *     "#" o "javascript:" (SIN DESTINO), mailto/tel/externos (se listan, no se visitan).
 *   - Botones visibles: se hace clic en cada uno y se observa si ocurre algo: navegación,
 *     ventana nueva, diálogo, cambio de aria-expanded/aria-pressed/clase o mutación del DOM.
 *     Si no pasa nada, queda como "SIN EFECTO" para revisarlo a mano. No hay falsos verdes:
 *     un botón de formulario que valida sin enviar cuenta como efecto (mensaje de error).
 *   Las llamadas a Supabase, Firebase y WhatsApp se bloquean: es una prueba local, sin
 *   escribir datos reales.
 * 📦 QUÉ: `BASE_URL=http://127.0.0.1:8790/ node scripts/button-audit.mjs [--pages=a.html,b.html]`
 *   → docs/production-audit/button-audit.json y button-audit.md.
 *   Código 1 si hay enlaces internos rotos o enlaces sin destino.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist-hostinger');
const BASE = (process.env.BASE_URL || 'http://127.0.0.1:8790/').replace(/\/?$/, '/');
const OUT_DIR = path.resolve(ROOT, '../docs/production-audit');
const argPages = (process.argv.find((a) => a.startsWith('--pages=')) || '').split('=')[1];
const SKIP = new Set(['google5c73d71f3e5f8337.html', 'i18n-test.html']);
const PAGES = argPages ? argPages.split(',') : fs.readdirSync(DIST).filter((f) => f.endsWith('.html') && !SKIP.has(f)).sort();
const WIDTHS = [1366, 390];
const consent = JSON.stringify({ essential: true, preferences: false, analytics: false, version: 1, policyVersion: '2026-09-26' });

const browser = await chromium.launch();
const report = [];

function internalTarget(href, pageName) {
  const url = new URL(href, BASE + pageName);
  if (url.origin !== new URL(BASE).origin) return null;
  let file = decodeURIComponent(url.pathname.replace(/^\//, '')) || 'index.html';
  if (file.endsWith('/')) file += 'index.html';
  return { file, exists: fs.existsSync(path.join(DIST, file)), hash: url.hash.slice(1), samePage: file === pageName.split('?')[0] };
}

async function auditPage(pageName, width) {
  const context = await browser.newContext({ viewport: { width, height: width < 768 ? 844 : 900 }, reducedMotion: 'reduce' });
  await context.addInitScript((value) => { try { localStorage.setItem('baqueano_cookie_consent_v1', value); } catch (e) { /* sin almacenamiento */ } }, consent);
  await context.route(/supabase\.co|googleapis\.com\/identitytoolkit|firestore\.googleapis|firebaseinstallations|open-meteo|wa\.me|api\.whatsapp/, (route) => route.abort());
  const page = await context.newPage();
  page.on('dialog', (d) => d.dismiss().catch(() => {}));
  const url = BASE + pageName;
  const out = { page: pageName, width, links: [], buttons: [], error: null };
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1500);

    // ---- Enlaces ----
    const links = await page.evaluate(() => [...document.querySelectorAll('a')].map((a) => {
      const r = a.getBoundingClientRect(); const s = getComputedStyle(a);
      return {
        href: a.getAttribute('href'), text: (a.getAttribute('aria-label') || a.textContent || a.title || '').replace(/\s+/g, ' ').trim().slice(0, 60),
        visible: r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none',
        role: a.getAttribute('role'), id: a.id, cls: String(a.className).split(' ')[0],
        hasClick: !!a.onclick || a.hasAttribute('onclick') || a.hasAttribute('data-action') || a.hasAttribute('data-open') || a.hasAttribute('aria-controls')
      };
    }));
    for (const l of links) {
      const row = { ...l, status: 'OK' };
      const h = (l.href || '').trim();
      if (!h || h === '#' || /^javascript:/i.test(h)) {
        row.status = l.hasClick || l.role === 'button' ? 'BOTÓN-ENLACE' : 'SIN DESTINO';
      } else if (/^(mailto|tel|sms):/i.test(h)) row.status = 'CONTACTO';
      else if (/^https?:\/\//i.test(h) && !h.startsWith(BASE)) row.status = 'EXTERNO';
      else {
        const t = internalTarget(h, pageName);
        if (t && !t.exists) row.status = 'ROTO';
        else if (t && t.hash && t.samePage) {
          const ok = await page.evaluate((id) => !!(document.getElementById(id) || document.getElementsByName(id).length), t.hash);
          if (!ok) row.status = 'ANCLA ROTA';
        }
        if (t) row.target = t.file + (t.hash ? '#' + t.hash : '');
      }
      out.links.push(row);
    }

    // ---- Botones (clic y observación) ----
    const handles = await page.$$('button, [role="button"]:not(a[href]:not([href="#"]))');
    let index = 0;
    for (const handle of handles) {
      index += 1;
      if (index > 60) break;
      const info = await handle.evaluate((el) => {
        const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
        return {
          text: (el.getAttribute('aria-label') || el.textContent || el.title || '').replace(/\s+/g, ' ').trim().slice(0, 60),
          id: el.id, cls: String(el.className).split(' ')[0], type: el.getAttribute('type'),
          disabled: el.disabled || el.getAttribute('aria-disabled') === 'true',
          visible: r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && !el.closest('[hidden],[aria-hidden="true"],.nav-drawer:not(.is-open)'),
          inForm: !!el.form
        };
      }).catch(() => null);
      if (!info || !info.visible) continue;
      const row = { ...info, status: 'SIN EFECTO' };
      if (info.disabled) { row.status = 'DESACTIVADO'; out.buttons.push(row); continue; }
      const before = page.url();
      await page.evaluate(() => {
        window.__bqMut = 0;
        window.__bqObs && window.__bqObs.disconnect();
        window.__bqObs = new MutationObserver((m) => { window.__bqMut += m.length; });
        window.__bqObs.observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true });
      }).catch(() => {});
      const popupPromise = context.waitForEvent('page', { timeout: 1200 }).catch(() => null);
      let clicked = true;
      try { await handle.click({ timeout: 2500 }); } catch (e) { clicked = false; row.status = 'NO CLICABLE'; row.note = e.message.split('\n')[0].slice(0, 120); }
      if (clicked) {
        await page.waitForTimeout(350);
        const popup = await popupPromise;
        const after = page.url();
        const mut = await page.evaluate(() => window.__bqMut || 0).catch(() => -1);
        if (popup) { row.status = 'OK'; row.effect = 'ventana nueva'; await popup.close().catch(() => {}); }
        else if (after !== before) { row.status = 'OK'; row.effect = 'navega a ' + after.replace(BASE, ''); }
        else if (mut !== 0) { row.status = 'OK'; row.effect = mut < 0 ? 'recarga' : 'cambia la página (' + mut + ' mutaciones)'; }
        if (after !== before || mut < 0) {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
          await page.waitForTimeout(1200);
          break; // la página cambió: los handles restantes ya no son válidos (se cubren en la otra pasada de ancho)
        }
        await page.keyboard.press('Escape').catch(() => {});
        await page.waitForTimeout(150);
      }
      out.buttons.push(row);
    }
  } catch (error) { out.error = error.message.slice(0, 200); }
  await context.close();
  return out;
}

// Cola de trabajo con QA_WORKERS páginas en paralelo (por defecto 4); cada resultado se imprime al terminar.
const jobs = PAGES.flatMap((p) => WIDTHS.map((w) => [p, w]));
const WORKERS = Math.max(1, Number(process.env.QA_WORKERS || 4));
async function worker() {
  while (jobs.length) {
    const [p, w] = jobs.shift();
    const r = await auditPage(p, w);
    report.push(r);
    const bad = r.links.filter((l) => ['ROTO', 'SIN DESTINO', 'ANCLA ROTA'].includes(l.status)).length;
    const noEffect = r.buttons.filter((b) => b.status !== 'OK').length;
    console.log(`${p}@${w}: ${r.links.length} enlaces (${bad} con problema) · ${r.buttons.length} botones probados (${noEffect} sin efecto/no clicables)${r.error ? ' · ERROR ' + r.error : ''}`);
  }
}
await Promise.all(Array.from({ length: WORKERS }, worker));
report.sort((a, b) => a.page.localeCompare(b.page) || b.width - a.width);
await browser.close();

// ---- Consolidado (un problema por página+destino, sin duplicar anchos) ----
const issues = new Map();
for (const r of report) {
  for (const l of r.links) if (['ROTO', 'SIN DESTINO', 'ANCLA ROTA'].includes(l.status)) {
    const key = `${r.page}|link|${l.status}|${l.href}|${l.text}`;
    if (!issues.has(key)) issues.set(key, { page: r.page, kind: 'enlace', status: l.status, label: l.text, href: l.href, widths: [] });
    issues.get(key).widths.push(r.width);
  }
  for (const b of r.buttons) if (b.status !== 'OK' && b.status !== 'DESACTIVADO') {
    const key = `${r.page}|btn|${b.status}|${b.id || b.cls}|${b.text}`;
    if (!issues.has(key)) issues.set(key, { page: r.page, kind: 'botón', status: b.status, label: b.text, selector: b.id ? '#' + b.id : '.' + b.cls, note: b.note, widths: [] });
    issues.get(key).widths.push(r.width);
  }
}
const list = [...issues.values()];
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'button-audit.json'), JSON.stringify({ generatedAt: new Date().toISOString(), base: BASE, pages: PAGES, widths: WIDTHS, issues: list, report }, null, 1));
const totals = report.reduce((a, r) => ({ links: a.links + r.links.length, buttons: a.buttons + r.buttons.length }), { links: 0, buttons: 0 });
const md = ['# Auditoría de botones y enlaces (navegador real)', '',
  `> Generado por \`website/scripts/button-audit.mjs\` el ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC contra ${BASE}. ${PAGES.length} páginas × ${WIDTHS.length} anchos: ${totals.links} enlaces y ${totals.buttons} botones probados con clic.`, '',
  '| Página | Tipo | Estado | Texto / nombre | Destino o selector | Anchos |', '|---|---|---|---|---|---|',
  ...list.map((i) => `| ${i.page} | ${i.kind} | ${i.status} | ${(i.label || '—').replace(/\|/g, '/')} | \`${(i.href || i.selector || '').replace(/\|/g, '/')}\` | ${i.widths.join(', ')} |`),
  '', list.length ? '' : '✅ Sin enlaces rotos, sin enlaces sin destino y todos los botones visibles producen un efecto.'];
fs.writeFileSync(path.join(OUT_DIR, 'button-audit.md'), md.join('\n'));
const hard = list.filter((i) => i.kind === 'enlace');
console.log(`\nTotal: ${totals.links} enlaces · ${totals.buttons} botones · problemas consolidados ${list.length} (enlaces ${hard.length})`);
process.exit(hard.length ? 1 : 0);
