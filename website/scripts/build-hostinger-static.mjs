#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: Hostinger debe publicar la web HTML actual sin interpretar el monorepo Next.js como una sola aplicación Node.
 * ⚙️ CÓMO: Crea una salida estática determinista mediante una lista permitida, excluye fuentes de build y archivos pesados no utilizados, y valida rutas esenciales.
 * 📦 QUÉ: Genera `dist-hostinger/` con HTML, CSS, JavaScript, locales, recursos públicos, PWA y reglas Apache; conserva intactos `apps/` y `packages/`.
 *   Normaliza el SEO de la copia publicada al dominio oficial (`scripts/lib/seo-normalize.mjs`).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { buildSitemap, normalizeHtml, normalizeRobots, redirectTarget } from './lib/seo-normalize.mjs';

const root = process.cwd();
const output = path.resolve(root, 'dist-hostinger');
if (path.dirname(output) !== path.resolve(root) || path.basename(output) !== 'dist-hostinger') {
  throw new Error('Directorio de salida no seguro.');
}

// `data/` lleva los índices generados del buscador global y de BAQUI
// (scripts/build-search-index.mjs); sin ellos el buscador cae al modo básico.
const publicDirectories = ['assets', 'css', 'data', 'js', 'locales'];
const publicRootFiles = new Set([
  '.htaccess', 'app.js', 'favicon.ico', 'favicon.png', 'manifest.json', 'robots.txt',
  'service-worker.js', 'sitemap.xml', 'styles.css'
]);
const ignoredAssetNames = new Set([
  'BaqueanoNicaragua.apk',
  '20260925_203015.mp4', '20260925_195926.mp4', '20260925_195441.mp4', '20260925_200655.mp4',
  '20260925_202624.mp4', '20260925_195625.mp4', '20260925_195646.mp4', '20260925_195917.mp4',
  'video 2 (1).mp4', 'video nicaragua (1).mp4', 'destinos (1).mp4', 'gastronomia (1).mp4',
  'historia (1).mp4', 'video (1).mp4', '[preview]destinos.mp4'
]);

async function copyTree(source, target) {
  await fs.mkdir(target, { recursive: true });
  for (const entry of await fs.readdir(source, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || ignoredAssetNames.has(entry.name) || entry.name.endsWith('.crdownload')) continue;
    const from = path.join(source, entry.name);
    const to = path.join(target, entry.name);
    if (entry.isDirectory()) await copyTree(from, to);
    else if (entry.isFile()) await fs.copyFile(from, to);
  }
}

await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(output, { recursive: true });

for (const entry of await fs.readdir(root, { withFileTypes: true })) {
  if (entry.isFile() && (entry.name.endsWith('.html') || publicRootFiles.has(entry.name))) {
    await fs.copyFile(path.join(root, entry.name), path.join(output, entry.name));
  }
}
for (const directory of publicDirectories) await copyTree(path.join(root, directory), path.join(output, directory));

// SEO del dominio oficial solo en la copia publicada (los HTML fuente no cambian):
// canonical, og:url, hreflang ×6 + x-default, manifest, JSON-LD, sitemap y robots.
const publishedPages = (await fs.readdir(output)).filter((name) => name.endsWith('.html'));
const aliasPages = new Set();
for (const page of publishedPages) {
  const target = path.join(output, page);
  const html = await fs.readFile(target, 'utf8');
  if (redirectTarget(html)) aliasPages.add(page);
  await fs.writeFile(target, normalizeHtml(html, page));
}
await fs.writeFile(path.join(output, 'sitemap.xml'), buildSitemap(publishedPages, new Date().toISOString().slice(0, 10), aliasPages));
const robotsPath = path.join(output, 'robots.txt');
await fs.writeFile(robotsPath, normalizeRobots(await fs.readFile(robotsPath, 'utf8')));

const required = ['index.html', '404.html', 'testimonios.html', 'styles.css', 'js/global-injector.js', 'js/global-language.js', 'js/global-search.js', 'locales/es.json', 'data/search-index.json', 'data/travel-knowledge.json', '.htaccess'];
for (const relative of required) {
  try { await fs.access(path.join(output, relative)); }
  catch { throw new Error(`Salida incompleta: falta ${relative}`); }
}
for (const forbidden of ['package.json', 'pnpm-lock.yaml', 'apps', 'packages', 'node_modules', 'scripts']) {
  try {
    await fs.access(path.join(output, forbidden));
    throw new Error(`La salida pública contiene una fuente privada: ${forbidden}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

async function measure(directory) {
  let files = 0;
  let bytes = 0;
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      const nested = await measure(target);
      files += nested.files;
      bytes += nested.bytes;
    } else {
      files += 1;
      bytes += (await fs.stat(target)).size;
    }
  }
  return { files, bytes };
}

const summary = await measure(output);
console.log(`Hostinger static build ready: ${summary.files} files, ${(summary.bytes / 1024 / 1024).toFixed(1)} MiB, output dist-hostinger/.`);
