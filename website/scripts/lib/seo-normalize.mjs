/**
 * 🎯 POR QUÉ: la evidencia en vivo (Kronox 2026) mostró que producción declaraba
 *   como canónico el dominio de respaldo (web.app), sin hreflang, sin manifest
 *   enlazado ni datos estructurados, y con sitemap/robots apuntando al respaldo.
 *   Eso reparte la autoridad SEO entre dos dominios y oculta los 6 idiomas.
 * ⚙️ CÓMO: transformaciones puras de texto aplicadas SOLO a la copia publicada
 *   (`dist-hostinger/`) durante el build. Los HTML fuente no se tocan: el sitio
 *   oficial es uno solo y se decide en un único lugar (SITE). Idempotente: si una
 *   etiqueta ya existe, se reemplaza en vez de duplicarse.
 * 📦 QUÉ: `normalizeHtml(html, page)`, `buildSitemap(pages, lastmod, excluded)`, `redirectTarget(html)`,
 *   `normalizeRobots(text)` y las listas de páginas indexables/no indexables.
 */

export const SITE = 'https://baqueanonicaragua.com';
export const LEGACY_HOSTS = ['https://app-baqueano.web.app', 'https://app-baqueano.firebaseapp.com'];
export const LANGUAGES = ['es', 'en', 'fr', 'it', 'pt', 'de'];
// Imagen social por defecto (1200×630, generada de assets/images/destinos/isla_de_ometepe.jpg).
export const DEFAULT_OG_IMAGE = `${SITE}/assets/images/og-image.jpg`;
// Perfiles públicos reales enlazados en el footer del sitio (global-injector.js).
export const SOCIAL_PROFILES = [
  'https://www.instagram.com/baqueano_nicaragua',
  'https://www.facebook.com/share/1S71xwJKse/',
  'https://www.tiktok.com/@baqueano.nicaragu'
];

// Páginas que nunca deben indexarse (panel, utilitarias, pruebas).
export const NOINDEX_PAGES = new Set(['admin.html', 'offline.html', '404.html', 'i18n-test.html']);
// Páginas personales: se pueden visitar, pero no aportan al sitemap.
export const PERSONAL_PAGES = new Set(['perfil.html', 'favoritos.html', 'mi-viaje.html']);

// Alias con <meta http-equiv="refresh" content="0; url=destino.html">: su
// canónico es el destino y no entra al sitemap (evita contenido duplicado).
export function redirectTarget(html) {
  const match = String(html).match(/<meta\b[^>]*http-equiv=["']refresh["'][^>]*content=["']\s*\d+\s*;\s*url=([^"'#?\s]+\.html)/i);
  return match ? match[1].replace(/^\.?\//, '') : null;
}

export function canonicalFor(page) {
  return page === 'index.html' ? `${SITE}/` : `${SITE}/${page}`;
}

function escapeAttr(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

// JSON dentro de <script>: se neutraliza "</" para que el contenido no pueda cerrar la etiqueta.
function jsonLd(data) {
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

function headBounds(html) {
  const open = html.search(/<head[\s>]/i);
  const close = html.search(/<\/head>/i);
  return open === -1 || close === -1 ? null : { open, close };
}

function metaContent(head, attr, value) {
  const tag = head.match(new RegExp(`<meta\\b[^>]*${attr}=["']${value}["'][^>]*>`, 'i'));
  const content = tag && tag[0].match(/content=["']([^"']*)["']/i);
  return content ? content[1] : '';
}

function pageTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].replace(/\s+/g, ' ').trim() : 'Baqueano Nicaragua';
}

/** Normaliza el <head> de una página publicada. */
export function normalizeHtml(html, page) {
  const bounds = headBounds(html);
  if (!bounds) return html;
  let head = html.slice(bounds.open, bounds.close);
  const before = html.slice(0, bounds.open);
  const after = html.slice(bounds.close);
  const additions = [];
  const alias = redirectTarget(html);
  const canonical = canonicalFor(alias || page);
  const indexable = !NOINDEX_PAGES.has(page);

  // 1) Metadatos que apuntaban al dominio de respaldo → dominio oficial.
  head = head.replace(/(<(?:meta|link)\b[^>]*?(?:content|href)=")([^"]*)(")/gi, (all, start, value, end) => {
    const host = LEGACY_HOSTS.find((legacy) => value.startsWith(legacy));
    return host ? `${start}${SITE}${value.slice(host.length)}${end}` : all;
  });

  if (page === 'i18n-test.html' && !/name=["']robots["']/i.test(head)) {
    additions.push('<meta name="robots" content="noindex, nofollow">');
  }

  if (indexable) {
    // 2) Canonical único y oficial, seguido de sus hreflang: cada idioma tiene
    //    URL propia (?lang=xx, leído por global-language.js) + x-default.
    //    Se agrupan junto al canonical para que reaplicar el build sea idempotente.
    head = head.replace(/\s*<link\b[^>]*hreflang=[^>]*>/gi, '');
    const canonicalBlock = [`<link rel="canonical" href="${escapeAttr(canonical)}">`]
      .concat(alias ? [] : LANGUAGES.map((lang) => `<link rel="alternate" hreflang="${lang}" href="${escapeAttr(`${canonical}?lang=${lang}`)}">`))
      .concat(alias ? [] : [`<link rel="alternate" hreflang="x-default" href="${escapeAttr(canonical)}">`])
      .join('\n  ');
    if (/<link\b[^>]*rel=["']canonical["'][^>]*>/i.test(head)) {
      head = head.replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/i, canonicalBlock);
    } else additions.push(canonicalBlock);

    // 3) og:url coherente con el canónico.
    const ogUrl = `<meta property="og:url" content="${escapeAttr(canonical)}">`;
    if (/<meta\b[^>]*property=["']og:url["'][^>]*>/i.test(head)) {
      head = head.replace(/<meta\b[^>]*property=["']og:url["'][^>]*>/i, ogUrl);
    } else additions.push(ogUrl);

    // 3b) Open Graph y Twitter Card: solo se completan las etiquetas que falten,
    //     reutilizando el <title> y la meta description propios de cada página.
    if (!alias) {
      const title = pageTitle(html);
      const description = metaContent(head, 'name', 'description');
      const ogImage = metaContent(head, 'property', 'og:image') || DEFAULT_OG_IMAGE;
      const social = [
        ['property', 'og:type', 'website'],
        ['property', 'og:site_name', 'Baqueano Nicaragua'],
        ['property', 'og:locale', 'es_NI'],
        ['property', 'og:title', title],
        ['property', 'og:description', description],
        ['property', 'og:image', ogImage],
        ['name', 'twitter:card', 'summary_large_image'],
        ['name', 'twitter:title', title],
        ['name', 'twitter:description', description],
        ['name', 'twitter:image', ogImage]
      ];
      for (const [attr, key, value] of social) {
        if (value && !metaContent(head, attr, key)) additions.push(`<meta ${attr}="${key}" content="${escapeAttr(value)}">`);
      }
      if (ogImage === DEFAULT_OG_IMAGE && !metaContent(head, 'property', 'og:image:width')) {
        additions.push('<meta property="og:image:width" content="1200">', '<meta property="og:image:height" content="630">');
      }
    }

    // 4) Datos estructurados (solo si la página no declara los suyos).
    if (!alias && !/application\/ld\+json/i.test(head)) {
      const website = { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: 'Baqueano Nicaragua', inLanguage: LANGUAGES };
      const graph = page === 'index.html'
        ? [website, {
          '@type': 'Organization', '@id': `${SITE}/#organization`, name: 'Baqueano Nicaragua', url: `${SITE}/`,
          logo: `${SITE}/android-chrome-512x512.png`, image: DEFAULT_OG_IMAGE, sameAs: SOCIAL_PROFILES,
          areaServed: { '@type': 'Country', name: 'Nicaragua' }
        }]
        : [website,
          { '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: pageTitle(html), inLanguage: 'es', isPartOf: { '@id': `${SITE}/#website` }, breadcrumb: { '@id': `${canonical}#breadcrumb` } },
          { '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`, itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: pageTitle(html).split('|')[0].trim(), item: canonical }
          ] }];
      additions.push(jsonLd({ '@context': 'https://schema.org', '@graph': graph }));
    }
  }

  // 5) Iconos: favicon y apple-touch-icon en todas las páginas (iOS y pestañas).
  if (!/<link\b[^>]*rel=["'](?:shortcut )?icon["']/i.test(head)) {
    additions.push('<link rel="icon" href="/favicon.ico" sizes="any">');
    additions.push('<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">');
    additions.push('<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">');
  }
  if (!/<link\b[^>]*rel=["']apple-touch-icon["']/i.test(head)) {
    additions.push('<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">');
  }

  // 6) Manifest PWA enlazado en todas las páginas.
  if (!/<link\b[^>]*rel=["']manifest["']/i.test(head)) additions.push('<link rel="manifest" href="/site.webmanifest">');

  if (!additions.length) return before + head + after;
  return `${before}${head.replace(/\s*$/, '')}\n  ${additions.join('\n  ')}\n${after}`;
}

/** Sitemap del dominio oficial con alternativas por idioma. */
export function buildSitemap(pages, lastmod, excluded = new Set()) {
  const entries = pages
    .filter((page) => !NOINDEX_PAGES.has(page) && !PERSONAL_PAGES.has(page) && !excluded.has(page))
    .sort((a, b) => (a === 'index.html' ? -1 : b === 'index.html' ? 1 : a.localeCompare(b)))
    .map((page) => {
      const loc = canonicalFor(page);
      const alternates = LANGUAGES.map((lang) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${escapeAttr(`${loc}?lang=${lang}`)}"/>`)
        .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeAttr(loc)}"/>`);
      return `  <url>\n    <loc>${escapeAttr(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n${alternates.join('\n')}\n  </url>`;
    });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`;
}

/** robots.txt: la línea Sitemap apunta al dominio oficial. */
export function normalizeRobots(text) {
  const line = `Sitemap: ${SITE}/sitemap.xml`;
  return /^Sitemap:.*$/im.test(text) ? text.replace(/^Sitemap:.*$/gim, line) : `${text.trimEnd()}\n${line}\n`;
}
