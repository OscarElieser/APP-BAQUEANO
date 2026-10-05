#!/usr/bin/env node
/**
 * 🌐 BAQUEANO — FUSIÓN SEGURA DE CLAVES EN LOS 6 CATÁLOGOS
 *
 * 🎯 POR QUÉ: cada clave nueva debe entrar a la vez en es, en, fr, it, pt y de;
 *   editar seis JSON a mano produce faltantes y sobrescrituras accidentales.
 * ⚙️ CÓMO: recibe un lote JSON `{ "clave.semántica": { es, en, fr, it, pt, de } }`
 *   y lo fusiona en `locales/<idioma>.json` (estructura anidada). Rechaza el
 *   lote completo si falta un idioma, si un texto está vacío o si una clave ya
 *   existe con otro valor (salvo `--update`). Nunca borra claves.
 * 📦 QUÉ: `node scripts/i18n-add-keys.mjs lote.json [--update]`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const LANGS = ['es', 'en', 'fr', 'it', 'pt', 'de'];
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [, , batchPath, ...flags] = process.argv;
const update = flags.includes('--update');
if (!batchPath) {
  console.error('Uso: node scripts/i18n-add-keys.mjs lote.json [--update]');
  process.exit(2);
}

const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
const catalogs = Object.fromEntries(LANGS.map((lang) => [lang, JSON.parse(fs.readFileSync(path.join(root, 'locales', `${lang}.json`), 'utf8'))]));
const problems = [];

const getNode = (catalog, key) => key.split('.').reduce((node, part) => (node && typeof node === 'object' ? node[part] : undefined), catalog);

for (const [key, values] of Object.entries(batch)) {
  if (!/^[a-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+$/.test(key)) problems.push(`${key}: formato de clave inválido`);
  for (const lang of LANGS) {
    const value = values?.[lang];
    if (typeof value !== 'string' || !value.trim()) problems.push(`${key}: falta ${lang}`);
    const existing = getNode(catalogs[lang], key);
    if (existing && typeof existing === 'object') problems.push(`${key}: ya es un grupo en ${lang}`);
    if (typeof existing === 'string' && existing !== value && !update) problems.push(`${key}: ya existe en ${lang} con otro valor ("${existing.slice(0, 40)}")`);
  }
  const parts = key.split('.');
  for (let i = 1; i < parts.length; i += 1) {
    const prefix = parts.slice(0, i).join('.');
    if (typeof getNode(catalogs.es, prefix) === 'string') problems.push(`${key}: el prefijo ${prefix} ya es un texto`);
  }
}

if (problems.length) {
  console.error(`❌ Lote rechazado (${problems.length} problemas):\n- ${problems.slice(0, 40).join('\n- ')}`);
  process.exit(1);
}

let added = 0;
for (const [key, values] of Object.entries(batch)) {
  for (const lang of LANGS) {
    const parts = key.split('.');
    let node = catalogs[lang];
    for (const part of parts.slice(0, -1)) {
      if (!node[part] || typeof node[part] !== 'object') node[part] = {};
      node = node[part];
    }
    if (node[parts.at(-1)] !== values[lang]) {
      node[parts.at(-1)] = values[lang];
      if (lang === 'es') added += 1;
    }
  }
}
for (const lang of LANGS) {
  fs.writeFileSync(path.join(root, 'locales', `${lang}.json`), `${JSON.stringify(catalogs[lang], null, 2)}\n`);
}
console.log(`✅ ${added} claves nuevas o actualizadas en ${LANGS.length} idiomas.`);
