/*
 * 🧭 BAQUEANO — Unificador de verdes (tools/bq-unify-greens.cjs)
 * 🎯 POR QUÉ: 10 verdes distintos; #10B981 (173 usos) da 2.54:1 con texto
 *    blanco y como texto sobre blanco: falla WCAG en botones y etiquetas.
 * ⚙️ CÓMO: familia "selva" derivada de #4A7A5A (color del brief):
 *    medios → #4A7A5A, claros/neón (para fondo oscuro) → #8DBF9A,
 *    muy oscuro → #2F5A3C. Excluye el Ops Center (tema oscuro propio).
 * 📦 QUÉ: `node tools/bq-unify-greens.cjs`.
 */
const fs = require('fs');
const path = require('path');
const WEB = path.join(__dirname, '..', 'website');
const MID = '#4A7A5A';
const LIGHT = '#8DBF9A';
const DEEP = '#2F5A3C';
const MAP = {
  '10B981': MID, '059669': MID, '16A34A': MID, '22C55E': MID, '15803D': MID, '047857': MID,
  '34D399': LIGHT, '4ADE80': LIGHT, '00FF9D': LIGHT,
  '065F46': DEEP
};
const re = new RegExp('#(' + Object.keys(MAP).join('|') + ')(?![0-9A-Fa-f])', 'gi');
const inDir = (dir, test) => fs.readdirSync(path.join(WEB, dir)).filter(test).map((f) => path.join(dir, f));
const files = [
  'styles.css',
  ...inDir('css', (f) => f.endsWith('.css') && !/^ops-|baqueano-system/.test(f)),
  ...inDir('css/pages', (f) => f.endsWith('.css')),
  ...inDir('js', (f) => f.endsWith('.js') && !/^(admin-ops|ops-)/.test(f)),
  ...fs.readdirSync(WEB).filter((f) => f.endsWith('.html') && f !== 'admin.html')
];
let total = 0;
for (const f of files) {
  const p = path.join(WEB, f);
  const s = fs.readFileSync(p, 'utf8');
  let n = 0;
  const out = s.replace(re, (m, hex) => { n += 1; return MAP[hex.toUpperCase()]; });
  if (n) { fs.writeFileSync(p, out); total += n; console.log(f.padEnd(40), n); }
}
console.log('reemplazos de verde:', total);
