#!/usr/bin/env node
// ============================================================================
// BAQUEANO — GLOSARIO COREANO / CHINO DE LUGARES Y PUEBLOS (prueba)
// ============================================================================
// 🎯 POR QUÉ: los catálogos ko y zh se tradujeron por lotes; sin una forma fija,
//    el mismo pueblo o ciudad aparece una vez transliterado (초로테가 / 乔罗特加) y
//    otra en alfabeto latino (Chorotega), y quien lee en coreano o chino no sabe
//    si es lo mismo.
// ⚙️ CÓMO: lee scripts/i18n-glossary-ko-zh.json. Para cada texto en español que
//    nombra un lugar o pueblo del glosario, el texto ko/zh debe usar la forma del
//    glosario. Se admite el nombre latino solo cuando forma parte de un nombre
//    propio compuesto (Cañón de Somoto, León Viejo, Finca Magdalena & Ometepe…) o en ejemplos
//    de formularios (placeholder, «예:», «例如»), donde la persona escribe el nombre real.
// 📦 QUÉ: `node scripts/i18n-cjk-glossary.test.mjs` → lista de textos que no siguen
//    el glosario y código de salida 1 si hay alguno. Regla: docs/i18n-glossary-ko-zh.md.
// ============================================================================
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const glossary = JSON.parse(await readFile(join(root, 'scripts', 'i18n-glossary-ko-zh.json'), 'utf8'));

function flatten(value, prefix = '', output = new Map()) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === 'object' && !Array.isArray(child)) flatten(child, path, output);
    else output.set(path, child);
  }
  return output;
}

const load = async (lang) => flatten(JSON.parse(await readFile(join(root, 'locales', `${lang}.json`), 'utf8')));
const es = await load('es');
const catalogs = { ko: await load('ko'), zh: await load('zh') };

const LETTER = 'A-Za-zÁÉÍÓÚÜÑáéíóúüñ';
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Nombre suelto: no pegado a otras letras latinas (evita «Leonel», «Granadilla»).
// Admite el plural español («Chorotegas», «Nicaraos»).
const standalone = (name) => new RegExp(`(?<![${LETTER}])${escape(name)}s?(?![${LETTER}])`, 'i');
// Nombre latino dentro de un nombre propio compuesto: «de/del X», «Palabra X», «X Palabra».
const compound = (name) => new RegExp(
  `(?:\\b(?:de|del|la|el)\\s+|[A-ZÁÉÍÓÚ][${LETTER}'’]*\\s+(?:&\\s+)?)${escape(name)}(?![${LETTER}])|${escape(name)}\\s+[A-ZÁÉÍÓÚ][${LETTER}]`
);
const isExample = (key, text) => /placeholder/i.test(key) || /^\s*(예:|例如)/.test(text);

const entries = [...Object.entries(glossary.places), ...Object.entries(glossary.peoples)];
const problems = [];
let checked = 0;

for (const [name, forms] of entries) {
  const findName = standalone(name);
  for (const [key, source] of es) {
    if (typeof source !== 'string' || !findName.test(source)) continue;
    for (const lang of ['ko', 'zh']) {
      const text = catalogs[lang].get(key);
      if (typeof text !== 'string') continue;
      checked += 1;
      if (text.includes(forms[lang]) || isExample(key, text)) continue;
      if (!findName.test(text)) continue; // traducido de otra manera (p. ej. «el león» como animal): no es el lugar.
      const withoutCompounds = text.replace(new RegExp(compound(name).source, 'g'), '');
      if (findName.test(withoutCompounds)) problems.push(`${lang} ${key}: «${name}» en latín; use «${forms[lang]}» → ${text.slice(0, 90)}`);
    }
  }
}

if (problems.length) {
  console.error(`❌ Glosario ko/zh: ${problems.length} textos no siguen la forma fija:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`✅ Glosario ko/zh: ${entries.length} nombres, ${checked} textos revisados, 0 diferencias.`);
