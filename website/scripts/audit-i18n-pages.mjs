// ============================================================================
// BAQUEANO — AUDITOR i18n POR PÁGINA (audit-i18n-pages.mjs)
// ============================================================================
// 🎯 POR QUÉ: `validate-i18n.mjs` solo compara claves entre los seis JSON; no
//    dice si el texto que ve el viajero en cada HTML/JS está conectado al motor.
//    Este auditor responde "¿qué porcentaje de cada página se traduce de verdad?".
// ⚙️ CÓMO: sin dependencias. Lee `locales/es.json` como fuente canónica y recorre
//    los HTML públicos y los JS públicos:
//    - HTML: texto visible, placeholder, title, aria-label, alt, <option>, y
//      metadatos SEO (<title>, description, og:*, twitter:*).
//    - JS: literales con aspecto de español (plantillas, toasts, validaciones,
//      errores, tarjetas creadas con JS). Es una HEURÍSTICA y se documenta como tal.
//    Un texto cuenta como "traducido" si (a) su elemento tiene data-i18n*, o
//    (b) coincide con un valor de es.json (el motor lo traduce por frase exacta,
//    ver `translateLegacy` en js/global-language.js).
//    Nombres propios nicaragüenses (Masaya, Ometepe, León…) se excluyen: NO se traducen.
// 📦 QUÉ: tabla por página con TOTAL_TEXTS, TRANSLATED, UNTRANSLATED, MISSING_KEYS,
//    HARDCODED_STRINGS y DYNAMIC_STRINGS; `--write` genera docs/I18N_AUDIT.md;
//    `--min=<pct>` falla (exit 1) si algún HTML queda por debajo (uso en CI);
//    `--json` imprime el resultado en JSON; `--list` lista los textos únicos sin traducir.
// ============================================================================
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const docsOut = join(root, '..', 'docs', 'I18N_AUDIT.md');
const args = new Set(process.argv.slice(2));
const minArg = process.argv.find((a) => a.startsWith('--min='));
const minPct = minArg ? Number(minArg.split('=')[1]) : null;
const LANGS = ['es', 'en', 'fr', 'it', 'pt', 'de'];

// Nombres propios y marcas que NO deben traducirse (consistencia cultural).
const PROPER_NAMES = [
  'Nicaragua', 'Masaya', 'Ometepe', 'León', 'Granada', 'Somoto', 'Managua', 'Estelí', 'Matagalpa', 'Jinotega',
  'Rivas', 'Carazo', 'Chinandega', 'Madriz', 'Nueva Segovia', 'Boaco', 'Chontales', 'Río San Juan', 'Corn Island',
  'San Juan del Sur', 'Guardabarranco', 'Nacatamal', 'Güirila', 'Vigorón', 'Gallo Pinto', 'BAQUEANO', 'Baqueano',
  'BAQUI', 'Baqui', 'Baqüi', 'Google', 'Firebase', 'Supabase', 'Azure'
];

function flatten(value, prefix = '', out = new Map()) {
  for (const [k, v] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, path, out);
    else out.set(path, v);
  }
  return out;
}

const catalogs = {};
for (const l of LANGS) catalogs[l] = flatten(JSON.parse(await readFile(join(root, 'locales', `${l}.json`), 'utf8')));
const phraseToKeys = new Map();
for (const [key, value] of catalogs.es) {
  if (typeof value !== 'string' || key === 'meta.locale') continue;
  const phrase = norm(value);
  if (!phrase) continue;
  if (!phraseToKeys.has(phrase)) phraseToKeys.set(phrase, []);
  phraseToKeys.get(phrase).push(key);
}

function norm(text) {
  return String(text).replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}
function looksLikeText(text) {
  return text.length > 2 && /[A-Za-zÁÉÍÓÚáéíóúñÑüÜ]{3}/.test(text) && !/^[\s\d.,:;|/\\()+\-–—•·©®™%$€#*_=<>[\]{}"'`~!?¡¿]+$/.test(text);
}
function isOnlyProperNames(text) {
  let rest = text;
  for (const name of PROPER_NAMES) rest = rest.split(name).join(' ');
  return !/[A-Za-zÁÉÍÓÚáéíóúñÑ]{3}/.test(rest);
}
function isUrlOrCode(text) {
  return /^(https?:|mailto:|tel:|\/|\.\/|#|data:|www\.)/i.test(text) || /^[\w.-]+@[\w.-]+$/.test(text) || /^[\w-]+\.(png|jpe?g|webp|svg|css|js|json|html|mp4|mp3)$/i.test(text);
}

function classify(text, hasKey) {
  const phrase = norm(text);
  const keys = phraseToKeys.get(phrase);
  if (hasKey || keys) {
    const missing = keys ? keys.filter((k) => LANGS.some((l) => !catalogs[l].has(k))) : [];
    return { translated: true, missing };
  }
  return { translated: false, missing: [] };
}

// ---- HTML ------------------------------------------------------------------
function auditHtml(html) {
  const stripped = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');
  const items = [];
  // Texto visible: marcamos si el elemento padre inmediato lleva data-i18n.
  for (const m of stripped.matchAll(/<([a-z0-9-]+)([^>]*)>([^<]+)(?=<)/gi)) {
    const text = norm(m[3]);
    if (!looksLikeText(text) || isOnlyProperNames(text) || isUrlOrCode(text)) continue;
    if (/\bdata-no-translate\b|\bnotranslate\b/.test(m[2])) continue;
    items.push({ kind: 'texto', text, hasKey: /\bdata-i18n(?!-)/.test(m[2]) });
  }
  for (const m of stripped.matchAll(/<([a-z0-9-]+)\b([^>]*)>/gi)) {
    for (const a of m[2].matchAll(/\b(placeholder|title|aria-label|alt)=("([^"]*)"|'([^']*)')/gi)) {
      const text = norm(a[3] ?? a[4] ?? '');
      if (!looksLikeText(text) || isOnlyProperNames(text) || isUrlOrCode(text)) continue;
      items.push({ kind: a[1].toLowerCase(), text, hasKey: new RegExp(`data-i18n-${a[1]}\\b`, 'i').test(m[2]) });
    }
  }
  // SEO
  const seo = [];
  const title = html.match(/<title>([^<]*)<\/title>/i);
  if (title) seo.push({ kind: 'meta title', text: norm(title[1]) });
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = m[0];
    const key = (tag.match(/\b(?:name|property)=["']([^"']+)["']/i) || [])[1];
    const content = (tag.match(/\bcontent=["']([^"']*)["']/i) || [])[1];
    if (key && content && /^(description|og:title|og:description|twitter:title|twitter:description)$/i.test(key)) seo.push({ kind: `meta ${key}`, text: norm(content) });
  }
  return { items, seo };
}

// ---- JS (heurística) ------------------------------------------------------------
const ES_HINT = /[áéíóúñ¿¡]|\b(el|la|los|las|de|del|para|con|por|que|tu|tus|un|una|y|en|no|se|su|al|más|mas|sin|hay|esta|este|puedes|debes)\b/i;
function auditJs(source) {
  const found = [];
  const lines = source.split('\n');
  const literal = /'((?:[^'\\\n]|\\.){6,300})'|"((?:[^"\\\n]|\\.){6,300})"|`((?:[^`\\]|\\.){6,400})`/g;
  lines.forEach((line) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line) || /console\.(log|info|warn|error|debug)/.test(line)) return;
    for (const m of line.matchAll(literal)) {
      let text = (m[1] ?? m[2] ?? m[3] ?? '').replace(/\$\{[^}]*\}/g, ' ').replace(/<[^>]+>/g, ' ');
      text = norm(text);
      if (!text.includes(' ') || !looksLikeText(text) || isUrlOrCode(text) || isOnlyProperNames(text)) continue;
      if (/[{};]|=>|\b(function|return|const|var|let)\b|^[.#\w-]+(\s[.#\w>+~:\[\]="'-]+)*$/.test(text) && !/[áéíóúñ¿¡]/.test(text)) continue;
      if (!ES_HINT.test(text)) continue;
      found.push(text);
    }
  });
  return found;
}

// ---- recorrido ---------------------------------------------------------------
const htmlFiles = (await readdir(root)).filter((f) => f.endsWith('.html')).sort();
const jsFiles = (await readdir(join(root, 'js'))).filter((f) => f.endsWith('.js')).sort();

const pages = [];
const allHardcoded = new Map(); // texto → {pages:Set, kind}
for (const file of htmlFiles) {
  const html = await readFile(join(root, file), 'utf8');
  const { items, seo } = auditHtml(html);
  let translated = 0;
  const hardcoded = [];
  const missingKeys = new Set();
  for (const it of items) {
    const r = classify(it.text, it.hasKey);
    if (r.translated) { translated += 1; r.missing.forEach((k) => missingKeys.add(k)); } else {
      hardcoded.push(it);
      const e = allHardcoded.get(it.text) || { pages: new Set(), kind: it.kind };
      e.pages.add(file);
      allHardcoded.set(it.text, e);
    }
  }
  const seoUntranslated = seo.filter((s) => !classify(s.text, false).translated);
  pages.push({
    file, total: items.length, translated, untranslated: items.length - translated,
    missingKeys: missingKeys.size, hardcoded: hardcoded.length, hardcodedSample: hardcoded.slice(0, 5).map((h) => `${h.kind}: ${h.text.slice(0, 70)}`),
    seoTotal: seo.length, seoUntranslated: seoUntranslated.length,
    pct: items.length ? Math.round((translated / items.length) * 100) : 100
  });
}

const scripts = [];
for (const file of jsFiles) {
  const src = await readFile(join(root, 'js', file), 'utf8');
  const usesApi = /BaqueanoLanguage|baqueano:language/.test(src);
  const strings = auditJs(src);
  const untranslated = strings.filter((s) => !classify(s, false).translated);
  scripts.push({ file, dynamic: strings.length, untranslated: untranslated.length, usesApi, sample: untranslated.slice(0, 3).map((s) => s.slice(0, 70)) });
}

const sum = (arr, k) => arr.reduce((a, p) => a + p[k], 0);
const totalTexts = sum(pages, 'total');
const totalTranslated = sum(pages, 'translated');
const result = {
  generatedAt: new Date().toISOString().slice(0, 10),
  catalog: Object.fromEntries(LANGS.map((l) => [l, catalogs[l].size])),
  html: { total: totalTexts, translated: totalTranslated, pct: totalTexts ? Math.round((totalTranslated / totalTexts) * 1000) / 10 : 100 },
  pages, scripts
};

if (args.has('--list')) {
  // Textos HTML sin traducir, únicos, ordenados por número de páginas (para priorizar el catálogo).
  const rows = [...allHardcoded].sort((a, b) => b[1].pages.size - a[1].pages.size || a[0].localeCompare(b[0]));
  // Columnas: nº de páginas · tipo de texto · texto · lista de páginas donde aparece.
  // La lista de páginas va al final para poder priorizar por página sin romper las 3 primeras columnas.
  for (const [text, e] of rows) console.log(`${e.pages.size}\t${e.kind}\t${text}\t${[...e.pages].map((f) => f.replace('.html', '')).join(',')}`);
  console.error(`${rows.length} textos únicos sin traducir`);
} else if (args.has('--json')) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`Catálogo (claves): ${LANGS.map((l) => `${l}=${catalogs[l].size}`).join(' ')}`);
  console.log('PÁGINA'.padEnd(22), 'TOTAL_TEXTS TRANSLATED UNTRANSLATED MISSING_KEYS HARDCODED %'.replace(/ /g, '\t'));
  for (const p of pages) console.log(p.file.padEnd(22), [p.total, p.translated, p.untranslated, p.missingKeys, p.hardcoded, `${p.pct}%`].join('\t'));
  console.log(`TOTAL HTML: ${totalTranslated}/${totalTexts} = ${result.html.pct}%`);
  const dyn = sum(scripts, 'dynamic');
  console.log(`JS: ${sum(scripts, 'untranslated')} de ${dyn} literales en español no están en el catálogo (heurística) · ${scripts.filter((s) => s.usesApi).length}/${scripts.length} archivos usan la API BaqueanoLanguage`);
}

if (args.has('--write')) {
  const L = [];
  L.push('# I18N_AUDIT — cobertura de traducción por página', '');
  L.push(`> Generado por \`website/scripts/audit-i18n-pages.mjs --write\` el ${result.generatedAt}. **No editar a mano.**`, '');
  L.push('## 🎯 POR QUÉ · ⚙️ CÓMO · 📦 QUÉ', '');
  L.push('- 🎯 **POR QUÉ:** `validate-i18n.mjs` solo compara claves entre catálogos; no mide si lo que se ve en cada página está conectado al motor de traducción.');
  L.push('- ⚙️ **CÓMO:** un texto cuenta como traducido si su elemento tiene `data-i18n*` o coincide con un valor de `locales/es.json` (el motor traduce por frase exacta). Se excluyen nombres propios nicaragüenses. En JS se buscan literales con aspecto de español: es una **heurística** (puede haber falsos positivos y negativos).');
  L.push('- 📦 **QUÉ:** tabla por página, SEO por página y literales dinámicos por script.', '');
  L.push(`**Catálogos (claves):** ${LANGS.map((l) => `${l}=${catalogs[l].size}`).join(' · ')}  `);
  L.push(`**HTML total:** ${totalTranslated} de ${totalTexts} textos cubiertos = **${result.html.pct} %**`, '');
  L.push('## Por página (HTML)', '');
  L.push('| Página | TOTAL_TEXTS | TRANSLATED | UNTRANSLATED | MISSING_KEYS | HARDCODED_STRINGS | SEO sin traducir | % |');
  L.push('|---|---|---|---|---|---|---|---|');
  for (const p of pages) L.push(`| ${p.file} | ${p.total} | ${p.translated} | ${p.untranslated} | ${p.missingKeys} | ${p.hardcoded} | ${p.seoUntranslated}/${p.seoTotal} | ${p.pct} |`);
  L.push('', '`MISSING_KEYS` = claves usadas por la página que faltan en al menos un idioma distinto de ES.', '');
  L.push('## Muestras de texto sin traducir (5 por página)', '');
  for (const p of pages.filter((x) => x.hardcodedSample.length)) {
    L.push(`**${p.file}**`, ...p.hardcodedSample.map((s) => `- ${s.replace(/\|/g, '\\|')}`), '');
  }
  L.push('## Literales dinámicos en JS (heurística)', '');
  L.push('| Script | DYNAMIC_STRINGS | Sin catálogo | Usa `BaqueanoLanguage` |');
  L.push('|---|---|---|---|');
  for (const s of scripts.filter((x) => x.dynamic > 0).sort((a, b) => b.untranslated - a.untranslated)) L.push(`| js/${s.file} | ${s.dynamic} | ${s.untranslated} | ${s.usesApi ? 'sí' : 'no'} |`);
  L.push('', '## Cómo se usa', '', '```bash', 'node website/scripts/audit-i18n-pages.mjs            # tabla en consola', 'node website/scripts/audit-i18n-pages.mjs --write    # regenera este archivo', 'node website/scripts/audit-i18n-pages.mjs --min=60   # exit 1 si alguna página < 60 %', '```', '');
  await mkdir(dirname(docsOut), { recursive: true });
  await writeFile(docsOut, L.join('\n'), 'utf8');
  console.log(`Escrito ${docsOut}`);
}

if (minPct != null) {
  const bad = pages.filter((p) => p.pct < minPct);
  if (bad.length) {
    console.error(`FALLA: ${bad.length} página(s) por debajo de ${minPct}%: ${bad.map((p) => `${p.file}=${p.pct}%`).join(', ')}`);
    process.exitCode = 1;
  }
}
