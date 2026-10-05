#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: los documentos de evidencia por sprint y la auditoría final deben coincidir
 *   exactamente; generarlos desde una sola fuente lo garantiza.
 * ⚙️ CÓMO: lee REQUIREMENTS (development-requirements.mjs), calcula la cobertura ponderada
 *   (VERDE=1, SUPER=1, AVANZADO=0,75, EN PROCESO=0,40, PENDIENTE=0) antes y después y
 *   escribe los Markdown en docs/hackathon/development/.
 * 📦 QUÉ: `node tools/kronox/gen-development-docs.mjs` → SPRINT_1/2/3_DEVELOPMENT_EVIDENCE.md
 *   y FINAL_DEVELOPMENT_AUDIT.md. `--check` falla si los archivos no están al día.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LABELS, REQUIREMENTS, WEIGHTS } from './development-requirements.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = path.join(root, 'docs/hackathon/development');
const check = process.argv.includes('--check');
const esc = (v) => String(v ?? '').replace(/\|/g, '\\|');
const pct = (n, d) => `${((n / d) * 100).toFixed(1)} %`;

function coverage(list, key) {
  const score = list.reduce((sum, r) => sum + WEIGHTS[r[key]], 0);
  return { score, total: list.length, pct: pct(score, list.length) };
}
function counts(list) {
  return Object.keys(LABELS).map((s) => [s, list.filter((r) => r.state === s).length]);
}
const header = (why, how, what) => `<!--\n🎯 POR QUÉ: ${why}\n⚙️ CÓMO: ${how}\n📦 QUÉ: ${what}\n-->\n`;
const GENERATED = 'Generado por `tools/kronox/gen-development-docs.mjs` desde `tools/kronox/development-requirements.mjs`. No editar a mano.';

function table(list) {
  const rows = ['| Sprint | ID | Requisito | Antes | Corrección realizada | Evidencia | Estado final | Brecha restante |', '|---|---|---|---|---|---|---|---|'];
  for (const r of list) {
    rows.push(`| ${r.sprint} | ${r.id} | ${esc(r.name)} | ${LABELS[r.before]} | ${esc(r.fix)} | ${esc(r.evidence)} | **${LABELS[r.state]}** | ${esc(r.gap || '—')} |`);
  }
  return rows.join('\n');
}

const files = {};
for (const sprint of [1, 2, 3]) {
  const list = REQUIREMENTS.filter((r) => r.sprint === sprint);
  const before = coverage(list, 'before');
  const after = coverage(list, 'state');
  files[`SPRINT_${sprint}_DEVELOPMENT_EVIDENCE.md`] = [
    header(`evidencia verificable de los requisitos de Desarrollo del Sprint ${sprint} (Kronox 2026).`,
      'estado antes/después, corrección y evidencia reproducible por requisito; cobertura ponderada.',
      `tabla del Sprint ${sprint}, cobertura y brechas.`),
    `# Sprint ${sprint} — Evidencia de Desarrollo`, '', `> ${GENERATED}`, '',
    `**Cobertura ponderada:** antes ${before.pct} (${before.score.toFixed(2)}/${before.total}) → ahora **${after.pct}** (${after.score.toFixed(2)}/${after.total}).`, '',
    counts(list).map(([s, n]) => `${LABELS[s]}: ${n}`).join(' · '), '',
    table(list), ''
  ].join('\n');
}

const all = REQUIREMENTS;
const total = coverage(all, 'state');
const totalBefore = coverage(all, 'before');
const byState = (s) => all.filter((r) => r.state === s);
const list = (items, withGap) => items.length ? items.map((r) => `- **${r.id}** ${r.name}${withGap && r.gap ? ` — ${r.gap}` : ''}`).join('\n') : '- Ninguno.';

files['FINAL_DEVELOPMENT_AUDIT.md'] = [
  header('auditoría final de Desarrollo (Sprints 1–3) con clasificación honesta: nada en verde sin evidencia.',
    'cobertura ponderada calculada desde la fuente única; evidencia en vivo desde un runner de GitHub (workflow kronox-evidence).',
    'resumen por sprint, listas por color, riesgos, acciones del propietario y tabla completa.'),
  '# Auditoría final de Desarrollo — Sprints 1, 2 y 3', '', `> ${GENERATED}`, '',
  '**Desarrollo NO se declara terminado:** existen requisitos en proceso o pendientes y un fallo crítico en producción (la VM no sirve `main`).', '',
  '## Cobertura ponderada', '',
  '| Sprint | Requisitos | Antes | Ahora |', '|---|---:|---:|---:|',
  ...[1, 2, 3].map((s) => {
    const l = all.filter((r) => r.sprint === s);
    return `| Sprint ${s} | ${l.length} | ${coverage(l, 'before').pct} | **${coverage(l, 'state').pct}** |`;
  }),
  `| **Total** | ${all.length} | ${totalBefore.pct} | **${total.pct}** |`, '',
  'Ponderación: VERDE = 1 · SUPER AVANZADO = 1 · AVANZADO = 0,75 · EN PROCESO = 0,40 · PENDIENTE = 0.', '',
  `## ${LABELS.green} (${byState('green').length})`, '', list(byState('green')), '',
  `## ${LABELS.super} (${byState('super').length})`, '', list(byState('super')), '',
  `## ${LABELS.advanced} (${byState('advanced').length})`, '', list(byState('advanced'), true), '',
  `## ${LABELS.progress} (${byState('progress').length})`, '', list(byState('progress'), true), '',
  `## ${LABELS.pending} (${byState('pending').length})`, '', list(byState('pending'), true), '',
  '## Riesgos y acciones que solo puede ejecutar el propietario', '',
  '1. **Autodeploy de la VM detenido** (crítico): `/health` sirve `56bd236`. Ejecutar `sudo journalctl -u baqueano-autodeploy -n 100` y `df -h` en la VM; si el disco está lleno, liberar releases antiguos de `/var/www/baqueano/releases` (conserva el actual y el anterior para rollback).',
  '2. **Puerto 22 abierto a Internet:** restringir la regla SSH del NSG a las IP de administración.',
  '3. **Claves de navegador Google/Firebase:** confirmar restricción por referrer (web) y por paquete/SHA-1 (Android) en Google Cloud.',
  '4. **Identidad:** 0 usuarios en `auth.users`; la migración Firebase → Supabase no se declara completa.',
  '5. **Videos S1-12 y S3-20:** entregables audiovisuales del equipo.', '',
  '## Tabla completa', '', table(all), '',
  '## Cómo reproducir la evidencia', '',
  '- Producción en vivo: Actions → "🧪 Evidencia de producción (Kronox 2026)" → Run workflow (artefacto JSON + Markdown).',
  '- Base de datos: ejecutar `supabase/tests/database_central_cases.sql` (termina en RAISE EXCEPTION: no deja datos).',
  '- SEO del build: `cd website && node scripts/build-hostinger-static.mjs && node scripts/seo-normalize.test.mjs`.',
  '- Regenerar estos documentos: `node tools/kronox/gen-development-docs.mjs`.', ''
].join('\n');

let stale = false;
fs.mkdirSync(outDir, { recursive: true });
for (const [name, content] of Object.entries(files)) {
  const target = path.join(outDir, name);
  if (check) {
    if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== content) { console.error(`Desactualizado: ${name}`); stale = true; }
  } else fs.writeFileSync(target, content);
}
if (stale) process.exit(1);
console.log(`${check ? 'Verificados' : 'Generados'} ${Object.keys(files).length} documentos · cobertura total ${total.pct} (antes ${totalBefore.pct}).`);
