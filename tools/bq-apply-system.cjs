/*
 * 🧭 BAQUEANO — Aplicador del sistema de diseño global (tools/bq-apply-system.cjs)
 * 🎯 POR QUÉ: llevar el sistema "Cartografía viva" a las 30 páginas de website/
 *    sin editar cada archivo a mano y sin borrar contenido.
 * ⚙️ CÓMO: transformaciones idempotentes sobre el HTML: (1) data-bq-page y
 *    data-bq-group en <html>; (2) una sola petición de Google Fonts
 *    (Montserrat + Plus Jakarta Sans); (3) enlace a css/baqueano-system.css
 *    al final del <head>; (4) <main id="mainContent"> en páginas sin landmark.
 * 📦 QUÉ: `node tools/bq-apply-system.cjs` (escribe) o `--dry` (solo informa).
 */
const fs = require('fs');
const path = require('path');
const DRY = process.argv.includes('--dry');
const WEB = path.join(__dirname, '..', 'website');
const VERSION = '20261003-3';
const FONTS = 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,500;0,600;0,700;0,800;0,900;1,700;1,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
const GROUPS = {
  home: ['index', 'experiencias'],
  territorio: ['destinos', 'destino', 'departamento', 'mapa'],
  cultura: ['historia', 'gastronomia', 'musica', 'cronicas', 'ambiental'],
  cuenta: ['perfil', 'mi-viaje', 'favoritos', 'mi-negocio'],
  baqui: ['baqueano-ia', 'baqueano-ai'],
  institucional: ['nosotros', 'aliados', 'denuncias', 'ayuda'],
  legal: ['terminos', 'privacidad', 'cookies', 'aviso-legal', 'legal'],
  sistema: ['404', 'offline', 'i18n-test'],
  ops: ['admin']
};
const groupOf = (name) => Object.keys(GROUPS).find((g) => GROUPS[g].includes(name)) || 'home';

function matchingClose(html, openIdx, tag) {
  const re = new RegExp('<(/?)' + tag + '(?=[\\s>])[^>]*>', 'gi');
  re.lastIndex = openIdx;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return m.index + m[0].length;
  }
  return -1;
}

const report = [];
for (const file of fs.readdirSync(WEB).filter((f) => f.endsWith('.html')).sort()) {
  const name = file.replace(/\.html$/, '');
  const group = groupOf(name);
  let html = fs.readFileSync(path.join(WEB, file), 'utf8');
  const before = html;
  const notes = [];

  // (1) Identidad de página en <html>.
  if (!/data-bq-page=/.test(html)) {
    html = html.replace(/<html\b([^>]*)>/i, `<html$1 data-bq-page="${name}" data-bq-group="${group}">`);
    notes.push('html-attrs');
  }

  // (2) Una sola petición de fuentes.
  const fontRe = /https:\/\/fonts\.googleapis\.com\/css2\?[^"']+/g;
  const fontHits = (html.match(fontRe) || []).filter((u) => u !== FONTS);
  if (fontHits.length) {
    let first = true;
    html = html.replace(/<link\b[^>]*href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]+"[^>]*>\s*/g, (tag) => {
      if (first) { first = false; return `<link rel="stylesheet" href="${FONTS}">\n  `; }
      return ''; // peticiones duplicadas de fuentes: el sistema ya carga ambas familias
    });
    notes.push(`fonts(${fontHits.length})`);
  }

  // (3) Sistema de diseño al final del <head> (admin conserva su tema de operaciones).
  if (group !== 'ops' && !/baqueano-system\.css/.test(html)) {
    html = html.replace(/<\/head>/i, `  <!-- Sistema de diseño global BAQUEANO: siempre la última hoja -->\n  <link rel="stylesheet" id="bq-system" href="css/baqueano-system.css?v=${VERSION}">\n</head>`);
    notes.push('system-css');
  }

  // (4) Landmark <main> en páginas que no lo tienen.
  if (!/<main\b/i.test(html) && group !== 'ops') {
    const navOpen = html.search(/<nav\b[^>]*id="mainNavbar"/i);
    const navEnd = navOpen >= 0 ? matchingClose(html, navOpen, 'nav') : -1;
    const footStart = html.search(/<footer\b/i);
    if (navEnd > 0 && footStart > navEnd) {
      const inner = html.slice(navEnd, footStart);
      html = html.slice(0, navEnd) + `\n  <main id="mainContent" tabindex="-1">` + inner + `</main>\n  ` + html.slice(footStart);
      notes.push(`main(${(inner.match(/<section\b/gi) || []).length} secciones)`);
    } else {
      notes.push(`main-SIN-ANCLA(nav=${navEnd},footer=${footStart})`);
    }
  }

  report.push(`${file.padEnd(20)} ${group.padEnd(14)} ${notes.join(' ') || '—'}`);
  if (!DRY && html !== before) fs.writeFileSync(path.join(WEB, file), html);
}
console.log(report.join('\n'));
