#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: Completar la deuda histórica de claves que solo existían en el catálogo canónico de Nicaragua.
 * ⚙️ CÓMO: Traduce únicamente claves ausentes, protege nombres culturales y conserva cualquier traducción editorial ya aprobada.
 * 📦 QUÉ: Herramienta de mantenimiento puntual para sincronizar EN, FR, IT, PT y DE sin borrar claves de compatibilidad.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const targets = ['en', 'fr', 'it', 'pt', 'de'];
const protectedTerms = ['BAQUEANO', 'BAQUI', 'Baqüi', 'Nicaragua', 'Nicaragüense', 'Vigorón', 'Nacatamal', 'Güegüense', 'Ometepe', 'Córdoba', 'Córdobas', 'Managua', 'Granada', 'León', 'Masaya', 'Madriz', 'Río San Juan', 'Corn Island'];

const getPath = (source, key) => key.split('.').reduce((value, segment) => value?.[segment], source);
const setPath = (source, key, value) => {
  const parts = key.split('.');
  const leaf = parts.pop();
  const parent = parts.reduce((node, part) => (node[part] ||= {}), source);
  parent[leaf] = value;
};
const flatten = (value, prefix = '', output = new Map()) => {
  for (const [key, child] of Object.entries(value)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === 'object' && !Array.isArray(child)) flatten(child, next, output);
    else output.set(next, child);
  }
  return output;
};
const protect = value => {
  const replacements = [];
  let text = value;
  protectedTerms.forEach(term => {
    text = text.replaceAll(term, () => {
      const token = `ZXQBQ${replacements.length}QXZ`;
      replacements.push([token, term]);
      return token;
    });
  });
  return { text, replacements };
};
const restore = (value, replacements) => replacements.reduce((text, [token, term]) => text.replace(new RegExp(token, 'gi'), term), value);

async function translate(value, target, attempt = 0) {
  const { text, replacements } = protect(value);
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  url.search = new URLSearchParams({ client: 'gtx', sl: 'es', tl: target, dt: 't', q: text });
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const translated = payload[0].map(part => part[0]).join('');
    return restore(translated, replacements);
  } catch (error) {
    if (attempt < 3) {
      await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
      return translate(value, target, attempt + 1);
    }
    throw error;
  }
}

const base = JSON.parse(await fs.readFile(path.join(root, 'locales', 'es.json'), 'utf8'));
const baseEntries = [...flatten(base)].filter(([key, value]) => key !== 'meta.locale' && typeof value === 'string');

for (const target of targets) {
  const file = path.join(root, 'locales', `${target}.json`);
  const catalog = JSON.parse(await fs.readFile(file, 'utf8'));
  const missing = baseEntries.filter(([key]) => getPath(catalog, key) == null);
  const delimiter = ' ZXQSPLITQXZ ';
  for (let index = 0; index < missing.length; index += 20) {
    const batch = missing.slice(index, index + 20);
    const translated = await translate(batch.map(([, source]) => source).join(delimiter), target);
    const values = translated.split(/\s*ZXQSPLITQXZ\s*/i);
    if (values.length !== batch.length) throw new Error(`${target}: el lote ${index / 20 + 1} no conservó sus límites.`);
    batch.forEach(([key], offset) => setPath(catalog, key, values[offset]));
    await new Promise(resolve => setTimeout(resolve, 350));
  }
  await fs.writeFile(file, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
  console.log(`${target}: ${missing.length} claves completadas.`);
}
