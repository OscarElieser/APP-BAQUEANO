#!/usr/bin/env node
/**
 * 🌐 BAQUEANO — MIGRACIÓN DE PÁGINAS HTML A CLAVES I18N EXPLÍCITAS
 *
 * 🎯 POR QUÉ: miles de textos de las páginas solo se traducían por coincidencia
 *   de frase (o no se traducían). La regla es: cada texto de interfaz con su
 *   clave semántica explícita.
 * ⚙️ CÓMO (mismas reglas que el auditor, `lib/i18n-scan.mjs`):
 *   - Reutiliza la clave existente si el texto ya está en es.json.
 *   - Si no, crea `pages.<página>.<sección>.<elemento><n>` (sección = id del
 *     ancestro más cercano o del bloque semántico).
 *   - Elemento hoja sin `id` → `data-i18n` en el propio elemento. Contenido
 *     mixto o elemento con `id`/región viva (JS puede reescribirlo) → envuelve
 *     el texto en `<span data-i18n>`; así una reescritura dinámica no se pierde.
 *   - Atributos → `data-i18n-<atributo>`; <title> y meta description →
 *     `data-i18n-title` / `data-i18n-description` en <html>.
 *   - No elimina nada: solo agrega atributos o envoltorios <span>.
 *   - Un texto que aparece en 2 o más páginas del lote recibe una clave
 *     compartida `common.<texto>` (una sola traducción para todo el sitio).
 * 📦 QUÉ: `node scripts/i18n-migrate-html.mjs a.html b.html … [--out lote-es.json]`
 *   reescribe las páginas y escribe el lote en español de las claves NUEVAS
 *   para traducir y fusionar con `scripts/i18n-add-keys.mjs`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCatalog, normalizeText, scanHtml } from './lib/i18n-scan.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const outIndex = argv.indexOf('--out');
const outPath = outIndex >= 0 ? argv[outIndex + 1] : null;
const pages = argv.filter((arg, i) => !arg.startsWith('--') && !(outIndex >= 0 && i === outIndex + 1));
if (!pages.length) {
  console.error('Uso: node scripts/i18n-migrate-html.mjs a.html [b.html …] [--out lote.json]');
  process.exit(2);
}

const catalog = loadCatalog(root, 'es');
const reverse = new Map();
for (const [key, value] of catalog) {
  if (typeof value !== 'string') continue;
  const normalized = normalizeText(value);
  // Preferir claves genéricas (actions.*, nav.*, status.*) a las de otras páginas.
  if (!reverse.has(normalized) || (reverse.get(normalized).startsWith('pages.') && !key.startsWith('pages.'))) reverse.set(normalized, key);
}

const camel = (value) => {
  const cleaned = String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : '')).replace(/^[^A-Za-z]+/, '');
  return cleaned ? cleaned.charAt(0).toLowerCase() + cleaned.slice(1) : '';
};
const SEMANTIC = new Set(['section', 'header', 'footer', 'main', 'nav', 'aside', 'article', 'form', 'dialog']);
function sectionOf(ancestors) {
  for (let i = ancestors.length - 1; i >= 0; i -= 1) {
    const tag = ancestors[i];
    const id = tag.attr('id')?.value;
    if (id && camel(id)) return camel(id).slice(0, 40);
    if (SEMANTIC.has(tag.name)) {
      const cls = (tag.attr('class')?.value || '').split(/\s+/).find((c) => /^[a-z]/i.test(c) && !/^(is|has|js)-/.test(c));
      if (cls && camel(cls)) return camel(cls).slice(0, 40);
      return tag.name;
    }
  }
  return 'body';
}

// Primera pasada: qué textos se repiten entre páginas → clave común.
const scans = pages.map((page) => {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  return { page, html, scan: scanHtml(html, { root, catalog }) };
});
const pagesByText = new Map();
for (const { page, scan } of scans) {
  const values = [...scan.pendingTexts.map((t) => t.normalized), ...scan.pendingAttrs.map((a) => a.value)];
  for (const value of new Set(values)) pagesByText.set(value, (pagesByText.get(value) || 0) + 1);
}

const newKeys = {};
const assigned = new Map();
const usedKeys = new Set(catalog.keys());
function uniqueKey(base) {
  let n = 1;
  while (usedKeys.has(`${base}${n}`)) n += 1;
  const key = `${base}${n}`;
  usedKeys.add(key);
  return key;
}
function keyFor(text, ancestors, element, slug) {
  if (reverse.has(text)) return reverse.get(text);
  const shared = (pagesByText.get(text) || 0) > 1;
  const memo = shared ? `common|${text}` : `${slug}|${text}`;
  if (assigned.has(memo)) return assigned.get(memo);
  let key;
  if (shared) {
    const words = camel(text.toLowerCase().split(/\s+/).slice(0, 5).join(' ')).slice(0, 40) || 'text';
    key = usedKeys.has(`common.${words}`) ? uniqueKey(`common.${words}`) : `common.${words}`;
    usedKeys.add(key);
  } else {
    key = uniqueKey(`pages.${slug}.${sectionOf(ancestors)}.${camel(element) || 'text'}`);
  }
  newKeys[key] = text;
  assigned.set(memo, key);
  return key;
}

const escapeAttr = (value) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
for (const { page, html, scan } of scans) {
  const slug = camel(path.basename(page, '.html')) || 'page';
  const { tags, texts } = scan;
  const edits = [];
  const htmlTag = tags.find((tag) => tag.name === 'html');
  const childCount = new Map();
  for (const tag of tags) {
    const parent = tag.ancestors[tag.ancestors.length - 1];
    if (parent) childCount.set(parent, (childCount.get(parent) || 0) + 1);
  }
  const textCount = new Map();
  for (const text of texts) if (text.parentTag && text.value.trim()) textCount.set(text.parentTag, (textCount.get(text.parentTag) || 0) + 1);

  let titleDone = Boolean(htmlTag?.attr('data-i18n-title'));
  for (const pending of scan.pendingTexts) {
    const parent = pending.parentTag;
    if (!parent) continue;
    if (parent.name === 'title') {
      if (htmlTag && !titleDone) {
        edits.push({ at: htmlTag.nameEnd, insert: ` data-i18n-title="${keyFor(pending.normalized, pending.ancestors, 'title', slug)}"` });
        titleDone = true;
      }
      continue;
    }
    const key = keyFor(pending.normalized, pending.ancestors, parent.name, slug);
    const isLeaf = !childCount.get(parent) && textCount.get(parent) === 1;
    const dynamicRisk = Boolean(parent.attr('id') || parent.attr('aria-live') || ['status', 'alert'].includes(parent.attr('role')?.value || ''));
    const blockedParent = ['body', 'html', 'head', 'select', 'label'].includes(parent.name);
    if (isLeaf && !dynamicRisk && !blockedParent && !parent.attr('data-i18n')) {
      edits.push({ at: parent.nameEnd, insert: ` data-i18n="${key}"` });
    } else {
      const raw = pending.value;
      const leading = raw.match(/^\s*/)[0];
      const trailing = raw.match(/\s*$/)[0];
      const inner = raw.slice(leading.length, raw.length - trailing.length);
      edits.push({ at: pending.start, remove: raw.length, insert: `${leading}<span data-i18n="${key}">${inner}</span>${trailing}` });
    }
  }
  for (const pending of scan.pendingAttrs) {
    const key = keyFor(pending.value, [...pending.tag.ancestors, pending.tag], `${pending.tag.name}-${pending.name}`, slug);
    edits.push({ at: pending.tag.nameEnd, insert: ` data-i18n-${pending.name}="${escapeAttr(key)}"` });
  }
  const description = tags.find((tag) => tag.name === 'meta' && tag.attr('name')?.value === 'description');
  if (description && htmlTag && !htmlTag.attr('data-i18n-description')) {
    const value = normalizeText(description.attr('content')?.value || '');
    if (/\p{L}{2}/u.test(value)) edits.push({ at: htmlTag.nameEnd, insert: ` data-i18n-description="${keyFor(value, [], 'metaDescription', slug)}"` });
  }

  edits.sort((a, b) => b.at - a.at || (b.remove ? 1 : 0) - (a.remove ? 1 : 0));
  let output = html;
  for (const edit of edits) output = output.slice(0, edit.at) + edit.insert + output.slice(edit.at + (edit.remove || 0));
  fs.writeFileSync(path.join(root, page), output);
  console.log(`${page}: ${edits.length} cambios.`);
}

if (outPath) fs.writeFileSync(outPath, `${JSON.stringify(newKeys, null, 2)}\n`);
console.log(`Total: ${Object.keys(newKeys).length} claves nuevas (${Object.keys(newKeys).filter((k) => k.startsWith('common.')).length} comunes).`);
