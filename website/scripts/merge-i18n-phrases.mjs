// ============================================================================
// BAQUEANO — FUSIONADOR DE FRASES i18n (merge-i18n-phrases.mjs)
// ============================================================================
// 🎯 POR QUÉ: cada página tiene textos en español que el motor solo traduce si la
//    frase exacta existe en `locales/es.json`. Añadir cientos de frases a mano en
//    seis JSON es lento y propenso a errores (claves distintas, comas, formato).
// ⚙️ CÓMO: lee un archivo TSV (una frase por línea, columnas separadas por tabulador:
//    español, inglés, francés, italiano, portugués, alemán) y agrega cada frase a
//    los seis catálogos dentro de un grupo (por defecto `ui`). La clave se genera
//    a partir del texto en español. Si la frase ya existe en el grupo, la omite
//    (no duplica ni sobrescribe nada). Con `--write` guarda los cambios; sin él
//    solo muestra qué haría (modo de prueba).
// 📦 QUÉ: uso:
//      node scripts/merge-i18n-phrases.mjs frases.tsv            (prueba)
//      node scripts/merge-i18n-phrases.mjs frases.tsv ui --write (guarda)
//    Valida: 6 columnas no vacías por fila y que se conserven los marcadores
//    {nombre} de las plantillas (p. ej. {year}, {query}).
// ============================================================================
import { readFileSync, writeFileSync } from 'node:fs'; // lectura y escritura de archivos
import { dirname, join } from 'node:path';             // armado de rutas
import { fileURLToPath } from 'node:url';              // ruta de este script

// Carpeta de catálogos: website/locales (un nivel arriba de scripts/).
const localesDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'locales');
// Orden fijo de columnas del TSV: español primero, luego los cinco idiomas restantes.
const LANGS = ['es', 'en', 'fr', 'it', 'pt', 'de'];

// Argumentos: archivo TSV (obligatorio), grupo destino (opcional) y bandera --write.
const [tsvPath, group = 'ui'] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const write = process.argv.includes('--write');
if (!tsvPath) {
  console.error('Uso: node scripts/merge-i18n-phrases.mjs <archivo.tsv> [grupo] [--write]');
  process.exit(2);
}

// Convierte un texto en una clave segura: sin tildes, minúsculas, solo letras/números/_ y ≤ 40 caracteres.
const slug = (text) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '') // quita acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')                         // todo lo demás pasa a "_"
    .replace(/^_|_$/g, '')                               // sin guiones bajos en los extremos
    .slice(0, 40) || 'x';                                // límite de largo (y valor por defecto)

// Carga los seis catálogos en memoria.
const data = {};
for (const lang of LANGS) data[lang] = JSON.parse(readFileSync(join(localesDir, `${lang}.json`), 'utf8'));
// Garantiza que el grupo exista en cada idioma.
for (const lang of LANGS) data[lang][group] ??= {};

// Claves y frases ya usadas en el grupo (para no duplicar).
const usedKeys = new Set(Object.keys(data.es[group]));
const knownPhrases = new Set(Object.values(data.es[group]));

// Lee el TSV: ignora líneas vacías y separa por tabulador.
const rows = readFileSync(tsvPath, 'utf8').split('\n').filter(Boolean).map((line) => line.split('\t'));

let added = 0;   // frases nuevas agregadas
let skipped = 0; // frases que ya existían
let invalid = 0; // filas con problemas
for (const row of rows) {
  // Cada fila necesita exactamente 6 columnas con texto.
  if (row.length !== 6 || row.some((cell) => !cell.trim())) {
    console.error(`FILA INVÁLIDA (${row.length} columnas): ${row[0]?.slice(0, 50)}`);
    invalid += 1;
    continue;
  }
  const [spanish, ...translations] = row;
  // Los marcadores {algo} del español deben aparecer iguales en cada traducción.
  const placeholders = spanish.match(/\{\w+\}/g) || [];
  const missingPlaceholder = translations.some((t) => placeholders.some((p) => !t.includes(p)));
  if (missingPlaceholder) {
    console.error(`MARCADOR PERDIDO en: ${spanish.slice(0, 50)}`);
    invalid += 1;
    continue;
  }
  // Si la frase ya está en el grupo, no se vuelve a agregar.
  if (knownPhrases.has(spanish)) { skipped += 1; continue; }
  // Genera una clave única (agrega _2, _3… si hay colisión).
  const base = slug(spanish);
  let key = base;
  for (let n = 2; usedKeys.has(key); n += 1) key = `${base}_${n}`;
  usedKeys.add(key);
  knownPhrases.add(spanish);
  // Guarda la frase en español y cada traducción bajo la misma clave.
  data.es[group][key] = spanish;
  LANGS.slice(1).forEach((lang, i) => { data[lang][group][key] = translations[i]; });
  added += 1;
}

console.log(`Filas: ${rows.length} · agregadas: ${added} · ya existían: ${skipped} · inválidas: ${invalid}`);
// Si hubo filas inválidas no se escribe nada (todo o nada).
if (invalid) process.exit(1);
if (write) {
  // Guarda cada catálogo con sangría de 2 espacios y salto de línea final.
  for (const lang of LANGS) writeFileSync(join(localesDir, `${lang}.json`), `${JSON.stringify(data[lang], null, 2)}\n`, 'utf8');
  console.log('Catálogos actualizados. Ejecute: node scripts/validate-i18n.mjs');
} else {
  console.log('Modo prueba: use --write para guardar.');
}
