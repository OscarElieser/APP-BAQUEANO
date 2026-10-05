#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: el checklist de producción 20/20 exige evidencia reproducible, no
 *   afirmaciones. Este auditor revisa la COPIA PUBLICADA (dist-hostinger/, la misma
 *   que sirve Azure) y falla CI si una página pierde metadatos, canonical, favicon,
 *   ALT, o si aparece un enlace/asset roto o un canonical al dominio de respaldo.
 * ⚙️ CÓMO: lectura estática de cada HTML (sin navegador): extrae <head>, <img>,
 *   <a>, <script>, <link> y JSON-LD; comprueba existencia de archivos locales y de
 *   anclas #id en la página destino; valida robots.txt y sitemap.xml. Los textos
 *   inyectados en tiempo de ejecución (navbar/footer del shell) se auditan aparte
 *   en el navegador.
 * 📦 QUÉ: `node scripts/production-audit.mjs [--dir=dist-hostinger] [--out=../docs/production-audit]`
 *   → static-audit.json + static-audit.md; código 1 si hay hallazgos críticos.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NOINDEX_PAGES, PERSONAL_PAGES, SITE, LEGACY_HOSTS, redirectTarget } from './lib/seo-normalize.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, fallback) => (process.argv.find((a) => a.startsWith(`--${name}=`)) || '').split('=')[1] || fallback;
const DIR = path.resolve(ROOT, arg('dir', 'dist-hostinger'));
const OUT = path.resolve(ROOT, arg('out', '../docs/production-audit'));
const GENERIC_ALT = /^(imagen|image|img|foto|photo|picture|logo|icono|icon|banner|image\d+|img\d+|foto\d+|untitled|sin título|\d+)$/i;

if (!fs.existsSync(DIR)) {
  console.error(`No existe ${DIR}. Ejecutá antes: node scripts/build-hostinger-static.mjs`);
  process.exit(2);
}

const findings = [];
const add = (severity, page, rule, detail) => findings.push({ severity, page, rule, detail });

function attrs(tag) {
  const out = {};
  for (const m of tag.matchAll(/([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g)) out[m[1].toLowerCase()] = m[3] ?? m[4] ?? m[5] ?? '';
  for (const m of tag.matchAll(/\s([\w-]+)(?=[\s>/])(?!\s*=)/g)) if (!(m[1].toLowerCase() in out)) out[m[1].toLowerCase()] = '';
  return out;
}
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map((m) => attrs(m[0]));
const stripComments = (html) => html.replace(/<!--[\s\S]*?-->/g, '');
const decodeEntities = (s) => String(s).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

function localTarget(fromPage, ref) {
  if (!ref) return null;
  const value = decodeEntities(ref.trim());
  if (/^(https?:|mailto:|tel:|sms:|data:|blob:|javascript:|whatsapp:|geo:|#)/i.test(value)) {
    const host = [SITE, ...LEGACY_HOSTS].find((h) => value.startsWith(h + '/') || value === h);
    if (!host) return null;
    return { rel: value.slice(host.length).replace(/^\//, '') || 'index.html', legacy: host !== SITE };
  }
  if (value.includes('${') || value.includes('{{')) return null;
  const clean = value.split('#')[0].split('?')[0];
  const hash = value.includes('#') ? value.split('#')[1] : '';
  let rel = clean.startsWith('/') ? clean.slice(1) : path.posix.join(path.posix.dirname(fromPage), clean);
  try { rel = decodeURIComponent(rel); } catch { /* deja la ruta tal cual */ }
  return { rel: rel || fromPage, hash };
}
const exists = (rel) => {
  const target = path.join(DIR, rel);
  if (!target.startsWith(DIR)) return false;
  if (fs.existsSync(target)) return fs.statSync(target).isFile() || fs.existsSync(path.join(target, 'index.html'));
  return false;
};

const pages = fs.readdirSync(DIR).filter((n) => n.endsWith('.html')).sort();
const htmlCache = new Map(pages.map((p) => [p, stripComments(fs.readFileSync(path.join(DIR, p), 'utf8'))]));
const idCache = new Map();
const idsOf = (page) => {
  if (!idCache.has(page)) {
    const html = htmlCache.get(page) || '';
    idCache.set(page, new Set([...html.matchAll(/\s(?:id|name)\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1])));
  }
  return idCache.get(page);
};

const seo = [];
const titles = new Map();
const descriptions = new Map();
const linkReport = [];

for (const page of pages) {
  const html = htmlCache.get(page);
  const headEnd = html.search(/<\/head>/i);
  const head = headEnd > 0 ? html.slice(0, headEnd) : html;
  const alias = redirectTarget(html);
  const noindex = NOINDEX_PAGES.has(page) || /<meta[^>]+name=["']robots["'][^>]+noindex/i.test(head);
  const indexable = !noindex && !alias;
  const metas = tags(head, 'meta');
  const links = tags(head, 'link');
  const meta = (key, val) => metas.find((m) => (m[key] || '').toLowerCase() === val)?.content;
  const title = decodeEntities((head.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '').replace(/\s+/g, ' ').trim();
  const description = decodeEntities(meta('name', 'description') || '').trim();
  const canonical = links.find((l) => (l.rel || '').toLowerCase() === 'canonical')?.href || '';
  const hreflangs = links.filter((l) => (l.rel || '').toLowerCase() === 'alternate' && l.hreflang).length;
  const ogImage = meta('property', 'og:image');
  const jsonLd = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  const lang = (html.match(/<html[^>]*\slang=["']([^"']+)["']/i) || [])[1];
  const row = { page, title, description, canonical, og: Boolean(meta('property', 'og:title') && ogImage), twitter: Boolean(meta('name', 'twitter:card')), jsonLd: jsonLd.length, hreflang: hreflangs, indexable, lang: lang || '' };
  seo.push(row);

  // Metadatos comunes a todas las páginas
  if (!lang) add('critical', page, 'html-lang', 'falta atributo lang en <html>');
  if (!metas.some((m) => (m.name || '').toLowerCase() === 'viewport')) add('critical', page, 'viewport', 'falta meta viewport');
  if (!title) add('critical', page, 'title', 'falta <title>');
  if (!links.some((l) => /(^|\s)icon(\s|$)/i.test(l.rel || ''))) add('critical', page, 'favicon', 'falta <link rel="icon">');
  for (const l of links.filter((x) => /icon|manifest|apple-touch-icon/i.test(x.rel || ''))) {
    const t = localTarget(page, l.href);
    if (t && !exists(t.rel)) add('critical', page, 'favicon-missing', `${l.rel} → ${l.href} no existe`);
  }
  if (!links.some((l) => /apple-touch-icon/i.test(l.rel || ''))) add('warning', page, 'apple-touch-icon', 'falta apple-touch-icon');
  if (!links.some((l) => (l.rel || '').toLowerCase() === 'manifest')) add('critical', page, 'manifest', 'falta <link rel="manifest">');
  if (/(?:href|content|src)=["']https:\/\/app-baqueano\.(?:web\.app|firebaseapp\.com)/i.test(head)) add('critical', page, 'legacy-domain-head', 'el <head> referencia el dominio de respaldo');
  for (const block of jsonLd) {
    try {
      const data = JSON.parse(block);
      const nodes = Array.isArray(data) ? data : [data];
      if (!nodes.every((n) => String(n['@context'] || '').includes('schema.org'))) add('critical', page, 'jsonld-context', 'JSON-LD sin @context schema.org');
      if (JSON.stringify(data).includes('app-baqueano.web.app')) add('critical', page, 'jsonld-legacy', 'JSON-LD apunta al dominio de respaldo');
    } catch (error) { add('critical', page, 'jsonld-invalid', `JSON-LD inválido: ${error.message}`); }
  }

  if (indexable) {
    if (!description) add('critical', page, 'description', 'falta meta description');
    else if (description.length < 50 || description.length > 170) add('warning', page, 'description-length', `${description.length} caracteres (recomendado 50–170)`);
    if (title && (title.length < 15 || title.length > 70)) add('warning', page, 'title-length', `${title.length} caracteres (recomendado 15–70)`);
    if (!canonical) add('critical', page, 'canonical', 'falta canonical');
    else if (!canonical.startsWith(SITE + '/')) add('critical', page, 'canonical-domain', `canonical fuera del dominio oficial: ${canonical}`);
    if (!row.og) add('critical', page, 'open-graph', 'faltan og:title/og:image');
    if (!meta('property', 'og:description')) add('critical', page, 'og-description', 'falta og:description');
    if (!row.twitter) add('critical', page, 'twitter-card', 'falta twitter:card');
    if (ogImage) {
      const t = localTarget(page, ogImage);
      if (!/^https:\/\//.test(ogImage)) add('critical', page, 'og-image-absolute', `og:image debe ser absoluta: ${ogImage}`);
      if (t && !exists(t.rel)) add('critical', page, 'og-image-missing', `og:image no existe: ${ogImage}`);
    }
    if (hreflangs < 7) add('critical', page, 'hreflang', `${hreflangs} hreflang (se esperan 6 idiomas + x-default)`);
    if (!jsonLd.length) add('critical', page, 'jsonld', 'falta JSON-LD');
    if (title) titles.set(title, [...(titles.get(title) || []), page]);
    if (description) descriptions.set(description, [...(descriptions.get(description) || []), page]);
  }

  // Imágenes
  for (const img of tags(html, 'img')) {
    if (!('alt' in img)) add('critical', page, 'img-alt-missing', `<img src="${img.src || ''}"> sin atributo alt`);
    else if (GENERIC_ALT.test(img.alt.trim())) add('critical', page, 'img-alt-generic', `alt genérico "${img.alt}" en ${img.src}`);
    const t = localTarget(page, img.src);
    if (t && img.src && !exists(t.rel)) add('critical', page, 'img-missing', `imagen no existe: ${img.src}`);
  }

  // Enlaces, scripts y hojas de estilo locales
  const refs = [
    ...tags(html, 'a').map((a) => ['a', a.href]),
    ...tags(html, 'script').map((s) => ['script', s.src]),
    ...tags(head, 'link').filter((l) => /stylesheet|preload|modulepreload/i.test(l.rel || '')).map((l) => ['link', l.href]),
    ...tags(html, 'source').map((s) => ['source', s.src || (s.srcset || '').split(/[\s,]/)[0]])
  ];
  for (const [kind, ref] of refs) {
    if (!ref) continue;
    if (kind === 'a' && ref.startsWith('#')) {
      const id = decodeURIComponent(ref.slice(1));
      if (id && !idsOf(page).has(id)) {
        add('warning', page, 'anchor-missing', `ancla #${id} no existe en la página (puede crearse en tiempo de ejecución)`);
        linkReport.push({ from: page, link: ref, status: 'ancla no encontrada (estático)', severity: 'warning' });
      }
      continue;
    }
    const t = localTarget(page, ref);
    if (!t) continue;
    if (t.legacy) { add('critical', page, 'legacy-link', `${kind} apunta al dominio de respaldo: ${ref}`); linkReport.push({ from: page, link: ref, status: 'dominio de respaldo', severity: 'critical' }); continue; }
    if (!exists(t.rel)) {
      add('critical', page, `${kind}-missing`, `${ref} → ${t.rel} no existe`);
      linkReport.push({ from: page, link: ref, status: '404 (archivo inexistente en la salida publicada)', severity: 'critical' });
    } else if (kind === 'a' && t.hash && t.rel.endsWith('.html') && htmlCache.has(t.rel) && !idsOf(t.rel).has(decodeURIComponent(t.hash))) {
      add('warning', page, 'anchor-missing', `${ref}: ancla #${t.hash} no encontrada en ${t.rel} (estático)`);
      linkReport.push({ from: page, link: ref, status: 'ancla no encontrada (estático)', severity: 'warning' });
    }
  }
}

for (const [title, list] of titles) if (list.length > 1) add('critical', list.join(', '), 'title-duplicate', `title repetido: "${title}"`);
for (const [desc, list] of descriptions) if (list.length > 1) add('critical', list.join(', '), 'description-duplicate', `description repetida: "${desc.slice(0, 60)}…"`);

// robots.txt y sitemap.xml
const robots = fs.existsSync(path.join(DIR, 'robots.txt')) ? fs.readFileSync(path.join(DIR, 'robots.txt'), 'utf8') : '';
if (!robots) add('critical', 'robots.txt', 'robots', 'falta robots.txt');
if (!robots.includes(`Sitemap: ${SITE}/sitemap.xml`)) add('critical', 'robots.txt', 'robots-sitemap', 'Sitemap no apunta al dominio oficial');
for (const blocked of ['/css/', '/js/', '/assets/']) {
  if (new RegExp(`^Disallow:\\s*${blocked.replace(/\//g, '\\/')}\\s*$`, 'mi').test(robots)) add('critical', 'robots.txt', 'robots-blocks-render', `robots.txt bloquea ${blocked}: Google no puede renderizar`);
}
const sitemap = fs.existsSync(path.join(DIR, 'sitemap.xml')) ? fs.readFileSync(path.join(DIR, 'sitemap.xml'), 'utf8') : '';
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (/web\.app|firebaseapp/.test(sitemap)) add('critical', 'sitemap.xml', 'sitemap-legacy', 'sitemap contiene el dominio de respaldo');
const sitemapPages = new Set(locs.map((u) => u.replace(SITE + '/', '') || 'index.html'));
for (const p of sitemapPages) if (!htmlCache.has(p)) add('critical', 'sitemap.xml', 'sitemap-missing-page', `${p} no existe`);
for (const row of seo) {
  row.sitemap = sitemapPages.has(row.page);
  const shouldBeIn = row.indexable && !PERSONAL_PAGES.has(row.page);
  if (shouldBeIn && !row.sitemap) add('critical', 'sitemap.xml', 'sitemap-incomplete', `falta ${row.page}`);
  if (!row.indexable && row.sitemap) add('critical', 'sitemap.xml', 'sitemap-noindex', `${row.page} no indexable está en el sitemap`);
}

// Salidas
const critical = findings.filter((f) => f.severity === 'critical');
const warnings = findings.filter((f) => f.severity === 'warning');
fs.mkdirSync(OUT, { recursive: true });
const summary = { generatedAt: new Date().toISOString(), dir: path.relative(ROOT, DIR), pages: pages.length, critical: critical.length, warnings: warnings.length, sitemapUrls: locs.length };
fs.writeFileSync(path.join(OUT, 'static-audit.json'), JSON.stringify({ summary, seo, findings, links: linkReport }, null, 1));
const esc = (v) => String(v ?? '').replace(/\|/g, '\\|');
const yes = (v) => (v ? '✅' : '❌');
const md = [
  '<!--', '🎯 POR QUÉ: evidencia automática del checklist 20/20 sobre la salida publicada.', '⚙️ CÓMO: generado por website/scripts/production-audit.mjs (no editar a mano).', '📦 QUÉ: SEO por página, hallazgos críticos/advertencias y enlaces.', '-->',
  '# Auditoría estática de la salida publicada', '',
  `Generado: ${summary.generatedAt} · Páginas: ${summary.pages} · URLs en sitemap: ${summary.sitemapUrls} · **Críticos: ${summary.critical}** · Advertencias: ${summary.warnings}`, '',
  '## SEO por página', '', '| URL | Title | Description | Canonical | OG | Twitter | JSON-LD | Hreflang | Indexable | Sitemap |', '|---|---|---|---|:-:|:-:|:-:|:-:|:-:|:-:|',
  ...seo.map((r) => `| ${r.page} | ${esc(r.title.slice(0, 60))} | ${r.description ? `${r.description.length} car.` : '—'} | ${esc(r.canonical.replace(SITE, '') || '—')} | ${yes(r.og)} | ${yes(r.twitter)} | ${r.jsonLd} | ${r.hreflang} | ${yes(r.indexable)} | ${yes(r.sitemap)} |`),
  '', '## Hallazgos', '', critical.length || warnings.length ? '| Severidad | Página | Regla | Detalle |\n|---|---|---|---|\n' + [...critical, ...warnings].map((f) => `| ${f.severity === 'critical' ? '❌ crítico' : '⚠️ advertencia'} | ${esc(f.page)} | ${f.rule} | ${esc(f.detail)} |`).join('\n') : 'Sin hallazgos.', ''
].join('\n');
fs.writeFileSync(path.join(OUT, 'static-audit.md'), md);
console.log(`Auditoría estática: ${pages.length} páginas · críticos ${critical.length} · advertencias ${warnings.length} · sitemap ${locs.length} URL`);
if (critical.length) {
  const byRule = critical.reduce((acc, f) => ((acc[f.rule] = (acc[f.rule] || 0) + 1), acc), {});
  console.log('Críticos por regla:', JSON.stringify(byRule));
  process.exit(1);
}
