#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: las ~1 900 claves insertadas en las 30 páginas HTML se traducen por lotes;
 *   el espacio de trabajo vive en el repositorio para poder continuar desde cualquier computadora.
 * ⚙️ CÓMO: `es-NN.json` = { clave: texto es } (fuente); `tx-NN.json` = arreglo alineado por índice
 *   con [en, fr, it, pt, de]. Se valida longitud y se fusiona con website/scripts/i18n-add-keys.mjs.
 * 📦 QUÉ: `node tools/i18n-batches/merge.mjs 07 08 ...` (desde cualquier directorio).
 *   Estado de cada lote: tools/i18n-batches/README.md.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const addKeys = path.resolve(here, '../../website/scripts/i18n-add-keys.mjs');
for (const n of process.argv.slice(2)) {
  const es = JSON.parse(fs.readFileSync(path.join(here, `es-${n}.json`), 'utf8'));
  const tx = JSON.parse(fs.readFileSync(path.join(here, `tx-${n}.json`), 'utf8'));
  const keys = Object.keys(es);
  if (keys.length !== tx.length) throw new Error(`lote ${n}: ${keys.length} es vs ${tx.length} traducciones`);
  const batch = {};
  keys.forEach((k, i) => {
    if (!Array.isArray(tx[i]) || tx[i].length !== 5 || tx[i].some((v) => typeof v !== 'string' || !v.trim())) {
      throw new Error(`lote ${n} #${i} (${k}): se esperaban 5 traducciones no vacías`);
    }
    const [en, fr, it, pt, de] = tx[i];
    batch[k] = { es: es[k], en, fr, it, pt, de };
  });
  const tmp = path.join(here, `.batch-${n}.json`);
  fs.writeFileSync(tmp, JSON.stringify(batch, null, 1));
  try { execFileSync('node', [addKeys, tmp], { stdio: 'inherit' }); } finally { fs.rmSync(tmp, { force: true }); }
}
