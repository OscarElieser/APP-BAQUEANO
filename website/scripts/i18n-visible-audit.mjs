#!/usr/bin/env node
/**
 * 🧭 BAQUEANO — AUDITORÍA VISIBLE DE IDIOMAS (scripts/i18n-visible-audit.mjs)
 * 🎯 POR QUÉ: pedido del propietario (20-10-2026): «revise que en todas las páginas que tenemos
 *   en la web tienen que cambiar el idioma». El auditor estático (i18n-audit) mira el código;
 *   este mira lo que la persona VE: abre cada página en español y en otro idioma y lista los
 *   textos que quedan iguales (o sea, en español) después de cambiar el idioma.
 * ⚙️ CÓMO: Playwright sobre la salida publicada (BASE_URL). Para cada página y cada idioma:
 *   1. Carga la página con baqueano_language_v2 = 'es' y guarda los textos visibles (nodos de
 *      texto, placeholder, aria-label y title de elementos visibles).
 *   2. Carga la misma página con el otro idioma y busca los textos que siguen idénticos.
 *   3. Descarta nombres propios (scripts/i18n-proper-nouns.json), translate="no", números,
 *      URLs, correos, teléfonos y textos de 1 palabra que empiezan con mayúscula (topónimos).
 *   4. Clasifica: «interfaz» (texto del sitio) o «contenido» (dentro de tarjetas que llegan de
 *      Supabase: [data-business-id], [data-place-id], .bq-dynamic-cms-section, etc.).
 *   No da consentimiento de analítica (no escribe nada en producción).
 * 📦 QUÉ: node scripts/i18n-visible-audit.mjs [--langs=en,fr] [--pages=a.html,b.html]
 *   → docs/i18n-visible-audit.json y resumen en consola. Código de salida 1 si hay textos de
 *   interfaz sin traducir.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = (process.env.BASE_URL || 'http://127.0.0.1:8790/').replace(/\/?$/, '/');
const arg = (name) => (process.argv.find((a) => a.startsWith(`--${name}=`)) || '').split('=').slice(1).join('=');
const LANGS = (arg('langs') || 'en,fr,it,pt,de,ko,zh').split(',').filter(Boolean);
const SKIP = new Set(['admin.html', 'i18n-test.html', 'google5c73d71f3e5f8337.html', 'baqueano-ai.html']);
const PAGES = arg('pages')
  ? arg('pages').split(',')
  : fs.readdirSync(root).filter((f) => f.endsWith('.html') && !SKIP.has(f)).sort()
    .map((f) => (f === 'destino.html' ? 'destino.html?id=ometepe' : f === 'departamento.html' ? 'departamento.html?id=madriz' : f));
const nouns = new Set(JSON.parse(fs.readFileSync(path.join(root, 'scripts/i18n-proper-nouns.json'), 'utf8')).terms.map((t) => t.toLowerCase()));
// Vocabulario común del sitio: palabras que en es.json aparecen en minúscula 3+ veces. Sirve para
// distinguir una etiqueta en Mayúsculas Iniciales («Precio Sugerido») de un topónimo («Cerro Negro»).
const vocab = (() => {
  const count = new Map();
  (function walk(o) {
    if (typeof o === 'string') { for (const w of o.match(/\p{Ll}[\p{Ll}]{3,}/gu) || []) count.set(w, (count.get(w) || 0) + 1); }
    else if (o && typeof o === 'object') Object.values(o).forEach(walk);
  })(JSON.parse(fs.readFileSync(path.join(root, 'locales/es.json'), 'utf8')));
  return new Set([...count].filter(([w, n]) => n >= 3 && !nouns.has(w)).map(([w]) => w));
})();
const consent = JSON.stringify({ essential: true, preferences: true, analytics: false, version: 1, policyVersion: '2026-09-26' });

// Se ejecuta dentro de la página: textos visibles con su origen.
function collect() {
  const DATA = '[data-business-id],[data-place-id],[data-destination-id],.bq-dynamic-cms-section,.bq-ally-dialog,.bq-feat-card,[data-cms],[data-dynamic],.cronica-card,.review-card,.testimonial-card,.bq-review,.pr-review-text,.leaflet-container,[data-user-content]';
  const out = [];
  const visible = (el) => {
    if (!el || el.closest('[translate="no"],.notranslate,script,style,noscript,template,[hidden],[aria-hidden="true"],code,pre')) return false;
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const push = (text, el, kind) => {
    const t = String(text || '').replace(/\s+/g, ' ').trim();
    if (t.length < 3 || !/\p{L}{2}/u.test(t)) return;
    out.push({ t, kind, data: !!el.closest(DATA), where: (el.id ? '#' + el.id : el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : '')) });
  };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) { if (visible(n.parentElement)) push(n.nodeValue, n.parentElement, 'text'); }
  document.querySelectorAll('[placeholder],[aria-label],[title],img[alt]').forEach((el) => {
    if (!visible(el)) return;
    ['placeholder', 'aria-label', 'title', 'alt'].forEach((a) => { if (el.hasAttribute(a)) push(el.getAttribute(a), el, a); });
  });
  return { lang: document.documentElement.lang, items: out };
}

async function render(browser, page, lang) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, locale: lang === 'es' ? 'es-NI' : lang, serviceWorkers: 'block' });
  await ctx.addInitScript(([l, c]) => { try { localStorage.setItem('baqueano_language_v2', l); localStorage.setItem('baqueano_cookie_consent_v1', c); } catch (_) {} }, [lang, consent]);
  const p = await ctx.newPage();
  try {
    await p.goto(BASE + page, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await p.waitForLoadState('load', { timeout: 20000 }).catch(() => {});
    await p.waitForTimeout(3500);
    return await p.evaluate(collect);
  } finally { await ctx.close(); }
}

const ignorable = (t) => {
  const low = t.toLowerCase();
  if (nouns.has(low)) return true;
  if (/^[\d\s.,:;%$C+\-–—/()#×·|•°'"´]+$/u.test(t)) return true;
  if (/^(https?:|www\.|[\w.+-]+@[\w-]+\.)/i.test(t)) return true;
  if (/^\+?\d[\d\s-]{6,}$/.test(t)) return true;
  if (/^(BAQUEANO|BAQUI|SOS|WhatsApp|Instagram|Facebook|TikTok|YouTube|Google|Android|iOS|PDF|QR|IA|ES|EN|FR|IT|PT|DE|KO|ZH|OK|C\$|US\$)\b/i.test(t) && t.split(' ').length <= 2) return true;
  // Una sola palabra con mayúscula inicial: casi siempre un topónimo o un nombre.
  if (!/\s/.test(t) && /^\p{Lu}/u.test(t)) return true;
  // Precios, medidas y versiones («US$ 10.00», «8 km/h», «95.4 MB», «Android 15 (API 35)»).
  if (/\d/.test(t) && t.split(/\s+/).length <= 4 && !/\p{Ll}{4,}/u.test(t.replace(/\b(km|kg|mb|gb|api|min|hrs?|h)\b/gi, ''))) return true;
  // Solo nombres propios unidos por conectores: «Somoto, Madriz», «Cerro Negro · León»,
  // «Gloria Elena Espinoza de Tercero», «La Paz Centro & Nagarote».
  const words = t.replace(/[(),.:;·•|&+/–—-]/g, ' ').split(/\s+/).filter(Boolean);
  const CONNECT = /^(de|del|la|las|los|el|y|e|en|da|do|van|von|di)$/i;
  const titled = words.length && words.every((w) => CONNECT.test(w) || /^[\p{Lu}\d@#]/u.test(w) || /^\p{Lu}+$/u.test(w));
  if (titled && !words.some((w) => vocab.has(w.toLowerCase()) && !CONNECT.test(w))) return true;
  return false;
};

const browser = await chromium.launch();
const report = { base: BASE, langs: LANGS, generatedAt: new Date().toISOString(), pages: [] };
let uiTotal = 0;
for (const page of PAGES) {
  const es = await render(browser, page, 'es').catch((e) => ({ error: e.message, items: [] }));
  const esSet = new Set(es.items.map((i) => i.t));
  const row = { page, langs: {} };
  for (const lang of LANGS) {
    const other = await render(browser, page, lang).catch((e) => ({ error: e.message, items: [] }));
    const seen = new Set();
    const same = other.items.filter((i) => esSet.has(i.t) && !ignorable(i.t) && !seen.has(i.t) && seen.add(i.t));
    const ui = same.filter((i) => !i.data);
    const content = same.filter((i) => i.data);
    uiTotal += ui.length;
    row.langs[lang] = { htmlLang: other.lang, error: other.error || null, ui: ui.map((i) => ({ t: i.t.slice(0, 160), kind: i.kind, where: i.where })), content: content.length, contentSample: content.slice(0, 5).map((i) => i.t.slice(0, 100)) };
  }
  report.pages.push(row);
  const en = row.langs[LANGS[0]];
  console.log(`${page.padEnd(32)} ${LANGS.map((l) => `${l}:${row.langs[l].ui.length}${row.langs[l].htmlLang !== l ? '(lang=' + row.langs[l].htmlLang + ')' : ''}`).join(' ')}  · contenido ${en.content}`);
}
await browser.close();
fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs/i18n-visible-audit.json'), JSON.stringify(report, null, 2));
console.log(`\nTextos de interfaz que no cambian de idioma: ${uiTotal} (detalle en docs/i18n-visible-audit.json)`);
process.exit(uiTotal ? 1 : 0);
