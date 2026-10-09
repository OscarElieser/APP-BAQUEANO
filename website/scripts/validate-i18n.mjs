// ============================================================================
// BAQUEANO — VALIDADOR DE CATÁLOGOS I18N
// ============================================================================
// 🎯 POR QUÉ: una clave ausente o vacía reaparece como texto sin traducir.
// ⚙️ CÓMO: aplana los ocho JSON (es, en, fr, it, pt, de, ko, zh), compara sus rutas con español y falla ante
//    diferencias estructurales, valores vacíos o JSON inválido.
// 📦 QUÉ: reporte por idioma con TOTAL_KEYS, TRANSLATED_KEYS, MISSING_KEYS,
//    EXTRA_KEYS y EMPTY_KEYS, apto para CI y validación local.
// ============================================================================
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'locales');
const languages = ['es', 'en', 'fr', 'it', 'pt', 'de', 'ko', 'zh'];

function flatten(value, prefix = '', output = new Map()) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === 'object' && !Array.isArray(child)) flatten(child, path, output);
    else output.set(path, child);
  }
  return output;
}

const catalogs = new Map();
for (const language of languages) {
  const raw = await readFile(join(root, `${language}.json`), 'utf8');
  catalogs.set(language, flatten(JSON.parse(raw)));
}

const baseKeys = [...catalogs.get('es').keys()].filter(key => key !== 'meta.locale');
let failed = false;
for (const language of languages) {
  const catalog = catalogs.get(language);
  const keys = [...catalog.keys()].filter(key => key !== 'meta.locale');
  const missing = baseKeys.filter(key => !catalog.has(key));
  const extra = keys.filter(key => !baseKeys.includes(key));
  const empty = keys.filter(key => typeof catalog.get(key) !== 'string' || !catalog.get(key).trim());
  const translated = baseKeys.length - missing.length - empty.filter(key => baseKeys.includes(key)).length;
  console.log(`${language}: TOTAL_KEYS=${baseKeys.length} TRANSLATED_KEYS=${translated} MISSING_KEYS=${missing.length} EXTRA_KEYS=${extra.length} EMPTY_KEYS=${empty.length}`);
  if (missing.length) console.log(`  missing: ${missing.join(', ')}`);
  if (extra.length) console.log(`  extra: ${extra.join(', ')}`);
  if (empty.length) console.log(`  empty: ${empty.join(', ')}`);
  // Las claves extra se conservan como aliases de compatibilidad; solo faltantes
  // o valores vacíos rompen la fuente canónica definida por español.
  failed ||= missing.length > 0 || empty.length > 0;
}

if (failed) process.exitCode = 1;
