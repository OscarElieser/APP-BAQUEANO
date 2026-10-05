/**
 * 🎯 POR QUÉ: requisito 12 (velocidad). Lighthouse marcó como bloqueantes del primer
 *   pintado las hojas de Google Fonts y Font Awesome (CDN) y una hoja cargada dos
 *   veces en la misma página (css/videos.css con y sin ?v=). Ninguna es necesaria
 *   para pintar el contenido: las fuentes ya usan display=swap y los iconos son
 *   decorativos.
 * ⚙️ CÓMO: transformación de la COPIA PUBLICADA (los HTML fuente no cambian):
 *   1) <link rel="stylesheet"> de fonts.googleapis.com / font-awesome → media="print"
 *      + data-async-style (js/async-styles.js lo pasa a media="all" al cargar) y un
 *      <noscript> de respaldo. Sin manejadores inline (compatible con CSP estricta).
 *   2) Hojas locales repetidas en la misma página (misma ruta, distinto ?v=) → se
 *      conserva la primera. Idempotente.
 *   3) Hojas que global-injector.js añade por JS ~700 ms después del primer pintado
 *      (provocaban CLS 0,31 en escritorio): se declaran en el <head> en el mismo
 *      orden final que produce el inyector (baqueano-system.css siempre la última).
 *      La lista se lee de js/global-injector.js en el build: no puede desincronizarse,
 *      y el inyector ya omite las hojas presentes (sin doble descarga).
 * 📦 QUÉ: `optimizeHtml(html, { injectorSheets })`, `readInjectorSheets(source)`.
 */
const ASYNC_STYLE_HOSTS = /^https:\/\/(fonts\.googleapis\.com\/css|cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/)/i;

/** Lee la lista `needed` de injectGlobalCSS() en js/global-injector.js. */
export function readInjectorSheets(source) {
  const block = (String(source).match(/function injectGlobalCSS\(\) \{[\s\S]*?var needed = \[([\s\S]*?)\n\s*\];/) || [])[1] || '';
  return [...block.matchAll(/id:\s*'([^']+)'[\s\S]*?href:\s*'([^']+)'/g)].map((m) => ({ id: m[1], href: m[2] }));
}

const pathOf = (href) => href.split('?')[0].replace(/^\.?\//, '');

export function optimizeHtml(html, options = {}) {
  const headEnd = html.search(/<\/head>/i);
  if (headEnd < 0) return html;
  let head = html.slice(0, headEnd);
  const rest = html.slice(headEnd);
  let asyncCount = 0;

  head = head.replace(/<link\b[^>]*>/gi, (tag) => {
    if (!/rel=["']stylesheet["']/i.test(tag) || /data-async-style/i.test(tag)) return tag;
    const href = (tag.match(/href=["']([^"']+)["']/i) || [])[1] || '';
    if (!ASYNC_STYLE_HOSTS.test(href) || /media=/i.test(tag)) return tag;
    asyncCount += 1;
    const asyncTag = tag.replace(/\s*\/?>$/, ' media="print" data-async-style>');
    return `${asyncTag}<noscript>${tag}</noscript>`;
  });

  const seen = new Set();
  head = head.replace(/[ \t]*<link\b[^>]*rel=["']stylesheet["'][^>]*>\n?/gi, (tag) => {
    const href = (tag.match(/href=["']([^"']+)["']/i) || [])[1] || '';
    if (/^(https?:)?\/\//i.test(href) || /media=["']print["']/i.test(tag) || tag.includes('<noscript')) return tag;
    const key = href.split('?')[0].replace(/^\.?\//, '');
    if (seen.has(key)) return '';
    seen.add(key);
    return tag;
  });

  // 3) Hojas del inyector, solo en páginas que cargan global-injector.js.
  const sheets = options.injectorSheets || [];
  if (sheets.length && /global-injector\.js/.test(html)) {
    const present = new Set([...head.matchAll(/<link\b[^>]*href=["']([^"']+)["'][^>]*>/gi)].map((m) => pathOf(m[1])));
    const hasFonts = /fonts\.googleapis\.com\/css2/.test(head);
    const add = [];
    for (const sheet of sheets) {
      if (sheet.id === 'bq-fonts' && hasFonts) continue;
      if (present.has(pathOf(sheet.href)) || /^https?:/i.test(sheet.href)) continue;
      add.push(`  <link rel="stylesheet" id="${sheet.id}" href="${sheet.href}" data-preinjected>`);
    }
    if (add.length) {
      // Se insertan tras la última hoja; baqueano-system.css pasa al final (como hace el inyector).
      const systemRe = /[ \t]*<link\b[^>]*href=["'][^"']*css\/baqueano-system\.css[^"']*["'][^>]*>\n?/i;
      const systemTag = (head.match(systemRe) || [])[0];
      if (systemTag) head = head.replace(systemRe, '');
      const lastSheet = [...head.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*>(?:<\/noscript>)?/gi)].pop();
      const at = lastSheet ? lastSheet.index + lastSheet[0].length : head.length;
      const systemLine = systemTag ? systemTag.replace(/^\s*/, '  ').replace(/\n?$/, '') : '';
      head = head.slice(0, at) + '\n' + add.join('\n') + (systemLine ? '\n' + systemLine : '') + head.slice(at);
    }
  }

  if ((asyncCount || /data-async-style/.test(head)) && !/js\/async-styles\.js/.test(head)) {
    head += '  <script src="/js/async-styles.js?v=20261005-1" defer></script>\n';
  }
  // 4) Páginas con video de fondo: la barra termina en modo bq-nav-over-video
  //    (absoluta sobre el hero, platform-enhancements.js). Marcarla así desde el HTML
  //    evita que <main> salte 76 px cuando el shell la reemplaza (CLS).
  let body = rest;
  if (/class=["'][^"']*\bbq-hero-background\b/.test(body)) {
    body = body.replace(/<nav\b([^>]*\bid=["']mainNavbar["'][^>]*)>/i, (tag, attrs) => (
      /bq-nav-over-video/.test(attrs) ? tag : tag.replace(/class=["']([^"']*)["']/i, (m, cls) => `class="${cls} bq-nav-over-video"`)
    ));
  }
  return head + body;
}
