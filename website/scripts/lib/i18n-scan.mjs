// ============================================================================
// 🌐 BAQUEANO — ESCÁNER I18N COMPARTIDO (auditor + migración)
// ============================================================================
// 🎯 POR QUÉ: el auditor y la herramienta de migración deben aplicar EXACTAMENTE
//   las mismas reglas para decidir qué es texto de interfaz traducible.
// ⚙️ CÓMO:
//   - HTML: tokenizador propio (scripts/lib/html-tokens.mjs). Un texto está
//     cubierto si algún ancestro tiene `data-i18n`; exento si está dentro de
//     script/style/svg/code/pre o de un elemento con `data-no-translate`,
//     `translate="no"` o clase `notranslate`, o si solo contiene nombres
//     propios, marcas, URLs, correos, números o símbolos.
//   - Atributos placeholder/title/aria-label/alt (+ aria-description,
//     aria-valuetext): cubiertos con `data-i18n-<atributo>`.
//   - TSX/JSX: texto JSX y props visibles con cadenas literales; cubiertos si
//     usan `t("clave")` o `<T k="clave" />`.
// 📦 QUÉ: `scanHtml`, `scanTsx`, `scanJs`, `isExempt`, `loadCatalog`.
// ============================================================================
import fs from 'node:fs';
import path from 'node:path';
import { decodeEntities, tokenize } from './html-tokens.mjs';

export const LANGS = ['es', 'en', 'fr', 'it', 'pt', 'de'];
export const TRANSLATABLE_ATTRIBUTES = ['placeholder', 'title', 'aria-label', 'alt', 'aria-description', 'aria-valuetext'];
const SKIP_TAGS = new Set(['script', 'style', 'svg', 'code', 'pre', 'noscript', 'template', 'math']);

export function flatten(value, prefix = '', output = new Map()) {
  for (const [key, child] of Object.entries(value)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === 'object' && !Array.isArray(child)) flatten(child, next, output);
    else output.set(next, child);
  }
  return output;
}

export function loadCatalog(root, lang = 'es') {
  return flatten(JSON.parse(fs.readFileSync(path.join(root, 'locales', `${lang}.json`), 'utf8')));
}

let properNouns = null;
export function loadProperNouns(root) {
  if (properNouns) return properNouns;
  const file = path.join(root, 'scripts', 'i18n-proper-nouns.json');
  const list = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')).terms : [];
  properNouns = new Set(list.map((term) => term.toLowerCase()));
  return properNouns;
}

export function normalizeText(value) {
  return decodeEntities(String(value)).replace(/\s+/g, ' ').trim();
}

/** Texto que no requiere traducción: marcas, nombres propios, URLs, números, símbolos. */
export function isExempt(text, root) {
  const value = normalizeText(text);
  if (!/\p{L}{2}/u.test(value)) return true; // sin palabras (números, emojis, símbolos)
  if (/^(https?:\/\/|www\.|mailto:|tel:)\S+$/i.test(value)) return true;
  if (/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(value)) return true;
  if (/^[+()\d\s-]{7,}$/.test(value)) return true;
  if (/^(US\$|C\$|\$|€)?\s?[\d.,]+\s?(USD|NIO|C\$)?$/.test(value)) return true;
  const nouns = loadProperNouns(root);
  // Solo nombres propios/marcas separados por signos (p. ej. "León · Masaya").
  const parts = value.split(/\s*[·|,/&+–—-]\s*|\s+y\s+/).map((part) => part.replace(/[^\p{L}\p{N}' .]/gu, '').trim().toLowerCase()).filter(Boolean);
  return parts.length > 0 && parts.every((part) => nouns.has(part));
}

function exemptAncestor(tag) {
  if (SKIP_TAGS.has(tag.name)) return true;
  if (tag.attr('data-no-translate')) return true;
  const translate = tag.attr('translate');
  if (translate && translate.value.toLowerCase() === 'no') return true;
  return /(^|\s)notranslate(\s|$)/.test(tag.attr('class')?.value || '');
}

/**
 * Escanea un HTML. Devuelve conteos y la lista de pendientes con posición,
 * para que la migración los reescriba sin tocar el resto del archivo.
 */
export function scanHtml(html, { root, catalog }) {
  const { texts, tags } = tokenize(html);
  const catalogValues = new Set([...catalog.values()].map((value) => normalizeText(value)));
  const result = { total: 0, keyed: 0, legacy: 0, untranslated: 0, attrTotal: 0, attrKeyed: 0, attrUntranslated: 0, missingKeys: [], pendingTexts: [], pendingAttrs: [] };

  for (const text of texts) {
    const value = normalizeText(text.value);
    if (!/\p{L}{2}/u.test(value)) continue;
    if (text.ancestors.some(exemptAncestor)) continue;
    if (text.parentTag?.name === 'title' || text.parentTag?.name === 'textarea') {
      // <title> se traduce con data-i18n-title en <html>; textarea es contenido del usuario.
      if (text.parentTag.name === 'textarea') continue;
    }
    if (isExempt(value, root)) continue;
    result.total += 1;
    if (text.ancestors.some((tag) => tag.attr('data-i18n'))) {
      result.keyed += 1;
      continue;
    }
    if (text.parentTag?.name === 'title') {
      const htmlTag = tags.find((tag) => tag.name === 'html');
      if (htmlTag?.attr('data-i18n-title')) {
        result.keyed += 1;
        continue;
      }
    }
    if (catalogValues.has(value)) result.legacy += 1;
    result.untranslated += 1;
    result.pendingTexts.push({ ...text, normalized: value });
  }

  for (const tag of tags) {
    if (tag.ancestors.some(exemptAncestor) || exemptAncestor(tag)) {
      // Un elemento exento puede igual tener aria-label traducible; solo se exime si es SVG/script.
      if (tag.ancestors.some((ancestor) => SKIP_TAGS.has(ancestor.name)) || SKIP_TAGS.has(tag.name)) continue;
    }
    for (const name of TRANSLATABLE_ATTRIBUTES) {
      const attribute = tag.attr(name);
      if (!attribute) continue;
      const value = normalizeText(attribute.value);
      if (!/\p{L}{2}/u.test(value) || isExempt(value, root)) continue;
      if (name === 'title' && tag.name === 'html') continue;
      result.attrTotal += 1;
      if (tag.attr(`data-i18n-${name}`)) {
        result.attrKeyed += 1;
        continue;
      }
      result.attrUntranslated += 1;
      result.pendingAttrs.push({ tag, name, value, attribute });
    }
    for (const attr of tag.attrs) {
      if (!/^data-i18n(-[\w-]+)?$/.test(attr.name)) continue;
      if (['data-i18n-ignore'].includes(attr.name)) continue;
      if (!catalog.has(attr.value)) result.missingKeys.push(attr.value);
    }
  }
  return result;
}

const JSX_PROPS = ['aria-label', 'aria-description', 'placeholder', 'title', 'alt', 'label', 'description', 'subtitle', 'eyebrow', 'helperText', 'emptyText', 'tooltip', 'heading', 'cta', 'buttonLabel'];

/** Escanea TSX/JSX: texto JSX y props visibles con literales; claves t()/<T k>. */
export function scanTsx(source, { root, catalog }) {
  const result = { total: 0, keyed: 0, untranslated: 0, missingKeys: [], pending: [] };
  const usedKeys = [
    ...[...source.matchAll(/\bt\(\s*["'`]([a-z][\w]*(?:\.[\w]+)+)["'`]/g)].map((m) => m[1]),
    ...[...source.matchAll(/<T\s+k=["']([a-z][\w]*(?:\.[\w]+)+)["']/g)].map((m) => m[1]),
    ...[...source.matchAll(/(?:labelKey|titleKey|descriptionKey|messageKey|textKey)\s*:\s*["']([a-z][\w]*(?:\.[\w]+)+)["']/g)].map((m) => m[1]),
  ];
  result.keyed = usedKeys.length;
  for (const key of usedKeys) if (!catalog.has(key)) result.missingKeys.push(key);

  // Quita comentarios para no contar documentación.
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
  for (const match of code.matchAll(/>([^<>{}]*\p{L}{2}[^<>{}]*)</gu)) {
    const raw = match[1];
    const value = normalizeText(raw);
    if (!value || /=>|&&|\|\||\bconst\b|\breturn\b|;/.test(raw)) continue;
    const before = code.slice(Math.max(0, match.index - 200), match.index + 1);
    const openTag = before.match(/<([A-Za-z][\w.]*)\b[^<>]*>$/);
    if (!openTag) continue; // no es texto JSX (p. ej. genéricos TS)
    if (/translate=["']no["']|data-no-translate/.test(openTag[0])) continue;
    if (isExempt(value, root)) continue;
    result.total += 1;
    result.untranslated += 1;
    result.pending.push({ kind: 'text', value, index: match.index });
  }
  for (const match of code.matchAll(new RegExp(`\\b(${JSX_PROPS.join('|')})="([^"]*\\p{L}{2}[^"]*)"`, 'gu'))) {
    const value = normalizeText(match[2]);
    if (isExempt(value, root)) continue;
    result.total += 1;
    result.untranslated += 1;
    result.pending.push({ kind: 'prop', prop: match[1], value, index: match.index });
  }
  result.total += result.keyed;
  return result;
}

/** JS heredado: claves usadas con BaqueanoLanguage.t / data-i18n y texto dinámico sin clave. */
export function scanJs(source, { catalog }) {
  const result = { keyed: 0, hardcoded: 0, missingKeys: [], pending: [] };
  const keys = [
    ...[...source.matchAll(/BaqueanoLanguage\??\.t\(\s*['"`]([a-z][\w]*(?:\.[\w]+)+)['"`]/g)].map((m) => m[1]),
    ...[...source.matchAll(/\bi18n\(\s*['"`]([a-z][\w]*(?:\.[\w]+)+)['"`]/g)].map((m) => m[1]),
    ...[...source.matchAll(/data-i18n(?:-[\w-]+)?=\\?["']([a-z][\w]*(?:\.[\w]+)+)\\?["']/g)].map((m) => m[1]),
  ];
  result.keyed = keys.length;
  for (const key of keys) if (!catalog.has(key)) result.missingKeys.push(key);
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\])\/\/.*$/gm, '$1');
  for (const match of code.matchAll(/(?:textContent|innerText|innerHTML|placeholder|title|ariaLabel)\s*=\s*(['"`])((?:(?!\1).)*\p{L}{3}(?:(?!\1).)*)\1/gu)) {
    if (/BaqueanoLanguage|i18n\(|\bt\(/.test(match[2])) continue;
    result.hardcoded += 1;
    result.pending.push({ value: normalizeText(match[2].replace(/\$\{[^}]*\}/g, '{x}')), index: match.index });
  }
  for (const match of code.matchAll(/(?:showToast|toast|alert|notify|CustomToast\.\w+|OpsToast\.show)\(\s*(['"`])((?:(?!\1).)*\p{L}{3}(?:(?!\1).)*)\1/gu)) {
    result.hardcoded += 1;
    result.pending.push({ value: normalizeText(match[2].replace(/\$\{[^}]*\}/g, '{x}')), index: match.index });
  }
  return result;
}
