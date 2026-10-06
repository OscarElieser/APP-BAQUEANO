#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: el SEO del dominio oficial (canonical, hreflang, manifest, JSON-LD,
 *   sitemap, robots) se genera en el build; esta prueba impide que una regresión
 *   vuelva a publicar el dominio de respaldo como canónico o duplique etiquetas.
 * ⚙️ CÓMO: casos sintéticos sobre las funciones puras + una pasada sobre las
 *   páginas reales de `website/` (sin escribir nada en disco).
 * 📦 QUÉ: `node scripts/seo-normalize.test.mjs` — sale con código 1 si algo falla.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { SITE, LANGUAGES, buildSitemap, normalizeHtml, normalizeRobots, redirectTarget } from './lib/seo-normalize.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const count = (text, re) => (text.match(re) || []).length;
let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`✓ ${name}`);
}

const legacy = `<!doctype html><html lang="es"><head>
  <title>Inicio</title>
  <link rel="canonical" href="https://app-baqueano.web.app/">
  <meta property="og:url" content="https://app-baqueano.web.app/">
  <meta property="og:image" content="https://app-baqueano.web.app/assets/images/og-image.jpg">
</head><body><a href="https://app-baqueano.web.app/x">x</a></body></html>`;

check('canonical y og:url pasan al dominio oficial', () => {
  const out = normalizeHtml(legacy, 'index.html');
  assert.match(out, new RegExp(`<link rel="canonical" href="${SITE}/">`));
  assert.match(out, new RegExp(`og:url" content="${SITE}/"`));
  assert.match(out, new RegExp(`og:image" content="${SITE}/assets/images/og-image.jpg"`));
  assert.equal(count(out, /rel="canonical"/g), 1);
});
check('el cuerpo de la página no se modifica', () => {
  assert.match(normalizeHtml(legacy, 'index.html'), /<a href="https:\/\/app-baqueano\.web\.app\/x">/);
});
check('hreflang para los 6 idiomas + x-default', () => {
  const out = normalizeHtml(legacy, 'destinos.html');
  for (const lang of LANGUAGES) assert.ok(out.includes(`hreflang="${lang}" href="${SITE}/destinos.html?lang=${lang}"`), lang);
  assert.ok(out.includes(`hreflang="x-default" href="${SITE}/destinos.html"`));
});
check('manifest y JSON-LD presentes', () => {
  const out = normalizeHtml(legacy, 'index.html');
  assert.equal(count(out, /rel="manifest"/g), 1);
  const ld = JSON.parse(out.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.deepEqual(ld['@graph'].map((n) => n['@type']), ['WebSite', 'Organization']);
});
check('idempotente: aplicar dos veces no duplica', () => {
  const once = normalizeHtml(legacy, 'mapa.html');
  assert.equal(normalizeHtml(once, 'mapa.html'), once);
});
check('páginas noindex no reciben canonical ni hreflang', () => {
  const out = normalizeHtml('<html><head><meta name="robots" content="noindex"></head></html>', 'admin.html');
  assert.equal(count(out, /canonical|hreflang/g), 0);
  assert.equal(count(out, /rel="manifest"/g), 1);
});
check('JSON-LD no puede cerrar la etiqueta script', () => {
  const out = normalizeHtml('<html><head><title>a</script><b></title></head></html>', 'ayuda.html');
  assert.ok(!/<script type="application\/ld\+json">[^]*<\/script>[^]*<\/script>/.test(out.split('</title>')[1]));
});
check('sitemap oficial excluye noindex y páginas personales', () => {
  const xml = buildSitemap(['index.html', 'admin.html', 'perfil.html', 'destinos.html', '404.html'], '2026-10-05');
  assert.equal(count(xml, /<loc>/g), 2);
  assert.ok(xml.includes(`<loc>${SITE}/</loc>`));
  assert.ok(!xml.includes('web.app') && !xml.includes('admin.html'));
});
check('alias con meta refresh: canónico al destino, sin hreflang ni sitemap', () => {
  const alias = '<html><head><meta http-equiv="refresh" content="0; url=baqueano-ia.html"><title>r</title></head></html>';
  assert.equal(redirectTarget(alias), 'baqueano-ia.html');
  const out = normalizeHtml(alias, 'baqueano-ai.html');
  assert.ok(out.includes(`<link rel="canonical" href="${SITE}/baqueano-ia.html">`));
  assert.equal(count(out, /hreflang|ld\+json/g), 0);
  assert.equal(count(buildSitemap(['baqueano-ai.html', 'baqueano-ia.html'], 'x', new Set(['baqueano-ai.html'])), /<loc>/g), 1);
});
check('Open Graph, Twitter Card e iconos se completan sin pisar los existentes', () => {
  const src = '<html><head><title>Mapa | Baqueano</title><meta name="description" content="Mapa interactivo de Nicaragua."><meta property="og:title" content="Propio"></head></html>';
  const out = normalizeHtml(src, 'mapa.html');
  assert.equal(count(out, /property="og:title"/g), 1);
  assert.ok(out.includes('content="Propio"'));
  assert.ok(out.includes('<meta name="twitter:card" content="summary_large_image">'));
  assert.ok(out.includes('og:description" content="Mapa interactivo de Nicaragua."'));
  assert.ok(out.includes(`og:image" content="${SITE}/assets/images/og-image.jpg"`));
  assert.ok(out.includes('rel="apple-touch-icon"') && out.includes('rel="icon"'));
  assert.ok(out.includes('"BreadcrumbList"'));
  assert.equal(normalizeHtml(out, 'mapa.html'), out);
});
check('robots apunta al sitemap oficial', () => {
  const out = normalizeRobots('User-agent: *\nSitemap: https://app-baqueano.web.app/sitemap.xml\n');
  assert.ok(out.includes(`Sitemap: ${SITE}/sitemap.xml`) && !out.includes('web.app'));
});
check('todas las páginas reales quedan con un único canonical oficial', () => {
  const isSiteVerification = (name) => /^google[0-9a-f]{8,}\.html$/i.test(name);
  for (const page of fs.readdirSync(ROOT).filter((n) => n.endsWith('.html') && !isSiteVerification(n))) {
    const out = normalizeHtml(fs.readFileSync(path.join(ROOT, page), 'utf8'), page);
    assert.ok(count(out, /rel=["']canonical["']/g) <= 1, page);
    assert.equal(count(out, /rel=["']manifest["']/g), 1, page);
    const head = out.slice(0, out.search(/<\/head>/i));
    assert.ok(!/(?:href|content)="https:\/\/app-baqueano\.web\.app/.test(head), `${page} conserva web.app en <head>`);
  }
});

console.log(`\nSEO normalize: ${passed} casos OK`);
