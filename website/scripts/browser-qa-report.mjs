#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: checklist 20/20 — los informes responsive, accesibilidad y enlaces deben
 *   salir de mediciones reproducibles, no escribirse a mano (regla: sin verdes falsos).
 * ⚙️ CÓMO: lee docs/production-audit/browser-qa.json (scripts/browser-qa.mjs) y
 *   static-audit.json (scripts/production-audit.mjs) y genera tablas Markdown.
 *   Los baselines previos a las correcciones se citan desde la bitácora (SESSION_LOG.md).
 * 📦 QUÉ: `node scripts/browser-qa-report.mjs` → responsive-report.md,
 *   accessibility-report.md y broken-links-report.md en docs/production-audit/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DIR = path.join(ROOT, 'docs/production-audit');
const qa = JSON.parse(fs.readFileSync(path.join(DIR, 'browser-qa.json'), 'utf8'));
const staticAudit = fs.existsSync(path.join(DIR, 'static-audit.json')) ? JSON.parse(fs.readFileSync(path.join(DIR, 'static-audit.json'), 'utf8')) : null;
const stamp = qa.generatedAt.slice(0, 16).replace('T', ' ') + ' UTC';
const ok = (b) => (b ? '🟢' : '🔴');
const header = (title, why) => `# ${title}\n\n> Generado por \`website/scripts/browser-qa-report.mjs\` a partir de \`browser-qa.json\` (${stamp}).\n> Medición: Playwright (Chromium) sobre el build publicado servido en local (\`${qa.base}\`), con el shell JS montado.\n> ${why}\n\n`;

// ── Responsive ────────────────────────────────────────────────────────────────
const byPage = new Map();
for (const r of qa.results) { if (!byPage.has(r.page)) byPage.set(r.page, []); byPage.get(r.page).push(r); }
let responsive = header('Informe responsive (requisito 14)', 'Criterio: sin desborde horizontal (`scrollWidth > innerWidth`), sin errores de carga; el cajón móvil (390 px) abre, permite llegar a la última opción y cierra.');
responsive += `| Página | ${qa.widths.join(' | ')} | Cajón móvil |\n|---|${qa.widths.map(() => '---').join('|')}|---|\n`;
for (const [page, rows] of byPage) {
  const cells = qa.widths.map((w) => { const r = rows.find((x) => x.width === w); if (!r) return '—'; return r.error ? '🔴 error' : r.overflowPx > 1 ? `🔴 +${r.overflowPx}px` : '🟢'; });
  const d = rows.find((x) => x.drawer)?.drawer;
  const drawer = !d ? '—' : !d.present ? 'n/a' : ok(d.open && d.lastReachable && d.closes) + (d.overflowY ? ` (${d.overflowY})` : '');
  responsive += `| ${page} | ${cells.join(' | ')} | ${drawer} |\n`;
}
const overflowFails = qa.results.filter((r) => r.overflowPx > 1).length;
const offscreen = qa.results.filter((r) => r.offscreen.length);
responsive += `\n**Total:** ${qa.results.length} cargas · desbordes horizontales: ${overflowFails} · errores de carga: ${qa.results.filter((r) => r.error).length}.\n`;
responsive += `\n**Elementos interactivos parcialmente fuera del viewport (informativo, no bloquea):** ${offscreen.length} cargas.\n`;
for (const r of offscreen.slice(0, 25)) responsive += `- ${r.page} @${r.width}: ${r.offscreen.join(', ')}\n`;
fs.writeFileSync(path.join(DIR, 'responsive-report.md'), responsive);

// ── Accesibilidad ────────────────────────────────────────────────────────────
let a11y = header('Informe de accesibilidad WCAG 2.2 AA (requisitos 10 y 13)', 'Criterio: axe-core 4 con etiquetas wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa a 390 y 1366 px; la puerta CI falla con cualquier violación crítica o grave.');
a11y += '| Página | 390 px | 1366 px | Imágenes sin alt |\n|---|---|---|---|\n';
for (const [page, rows] of byPage) {
  const cell = (w) => { const r = rows.find((x) => x.width === w); if (!r || !r.axe) return '—'; const bad = r.axe.filter((v) => ['critical', 'serious'].includes(v.impact)); const other = r.axe.length - bad.length; return bad.length ? `🔴 ${bad.map((v) => v.id).join(', ')}` : `🟢 0${other ? ` (+${other} moderadas/menores)` : ''}`; };
  const noAlt = Math.max(0, ...rows.map((r) => r.imgNoAlt.length));
  a11y += `| ${page} | ${cell(390)} | ${cell(1366)} | ${noAlt ? '🔴 ' + noAlt : '🟢 0'} |\n`;
}
const minor = {};
for (const r of qa.results) for (const v of r.axe || []) if (!['critical', 'serious'].includes(v.impact)) minor[v.id] = (minor[v.id] || 0) + 1;
a11y += `\n**Violaciones moderadas/menores (no bloquean, seguimiento):** ${Object.keys(minor).length ? Object.entries(minor).map(([k, n]) => `${k} ×${n}`).join(', ') : 'ninguna'}.\n`;
a11y += `\n## Línea base y correcciones (2026-10-05)\n\nPrimera medición: 5 críticas (\`label\` en cookies, \`aria-required-attr\` en portada y música) y 52 graves (contraste ×36, \`link-name\`, \`nested-interactive\`, \`aria-prohibited-attr\`, \`scrollable-region-focusable\`, \`target-size\`). Correcciones: nombres accesibles (aria-labelledby), roles válidos (\`group\`, \`region\`, \`slider\` con valores y teclado), áreas táctiles de 24 px y una capa de contraste en \`css/baqueano-system.css\` que oscurece solo el texto dentro del mismo matiz (naranja de texto \`#B34400\`, 5.6:1). Detalle en \`SESSION_LOG.md\`.\n`;
fs.writeFileSync(path.join(DIR, 'accessibility-report.md'), a11y);

// ── Enlaces ───────────────────────────────────────────────────────────────────
let links = header('Informe de enlaces (requisitos 15 y 16)', 'Dos capas: el auditor estático (`production-audit.mjs`) verifica que todo destino local exista en el build; el navegador verifica en ejecución las anclas `#id` y los enlaces de WhatsApp.');
if (staticAudit) {
  const sum = staticAudit.summary || {};
  const anchorWarn = (staticAudit.findings || []).filter((f) => f.rule === 'anchor-missing').length;
  links += `## Estático\n\nPáginas: ${sum.pages ?? '—'} · críticos: ${sum.critical ?? '—'} (enlaces, scripts, hojas e imágenes locales inexistentes bloquean el despliegue) · advertencias: ${sum.warnings ?? '—'} (de ellas ${anchorWarn} anclas que el HTML estático no contiene; se comprueban abajo en ejecución, donde el JS ya montó el contenido).\n\n`;
}
links += '## Anclas en ejecución (390 y 1366 px)\n\n| Página | Anclas `#id` sin destino | WhatsApp (seguro + nombre accesible) |\n|---|---|---|\n';
for (const [page, rows] of byPage) {
  const r = rows.find((x) => x.width === 1366) || rows[0];
  const missing = [...new Set(rows.flatMap((x) => x.missingAnchors || []))];
  const wa = r.whatsapp || [];
  links += `| ${page} | ${missing.length ? '🟡 ' + missing.slice(0, 6).map((m) => '`#' + m + '`').join(' ') : '🟢 0'} | ${wa.length ? ok(wa.every((w) => w.safe && w.name)) + ' ' + wa.length : '— 0'} |\n`;
}
links += `\n## Página 404\n\n${qa.notFoundLinks.map((l) => `- ${ok(l.present)} enlace a \`${l.href}\``).join('\n')}\n\nEl estado HTTP 404 real del dominio lo verifica \`tools/kronox-prod-evidence.mjs\` (workflow kronox-evidence) en producción.\n`;
fs.writeFileSync(path.join(DIR, 'broken-links-report.md'), links);
console.log('Informes: responsive-report.md, accessibility-report.md, broken-links-report.md');
