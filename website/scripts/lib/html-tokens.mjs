// ============================================================================
// 🌐 BAQUEANO — TOKENIZADOR HTML SIN DEPENDENCIAS (auditor y migración i18n)
// ============================================================================
// 🎯 POR QUÉ: CI ejecuta los scripts sin instalar paquetes; el auditor i18n
//   necesita entender el HTML (texto visible, atributos, ancestros) con
//   precisión, no con expresiones regulares sueltas.
// ⚙️ CÓMO: recorre el documento una vez y produce tokens con posición exacta
//   (inicio/fin en el texto original) y la pila de ancestros de cada texto.
//   Respeta comentarios, <script>/<style> como texto crudo y elementos vacíos.
// 📦 QUÉ: `tokenize(html)` → { texts, tags } para auditar y reescribir sin
//   alterar el resto del archivo.
// ============================================================================

export const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr',
]);
const RAW_TEXT = new Set(['script', 'style', 'textarea', 'title']);

export function parseAttributes(source) {
  const attributes = [];
  const pattern = /([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = pattern.exec(source))) {
    attributes.push({
      name: match[1].toLowerCase(),
      value: match[2] ?? match[3] ?? match[4] ?? '',
      start: match.index,
      end: match.index + match[0].length,
      quoted: match[2] != null ? '"' : match[3] != null ? "'" : '',
    });
  }
  return attributes;
}

/**
 * Tokeniza `html` y devuelve:
 * - tags: [{ name, attrs, start, end, nameEnd, selfClosing, ancestors }]
 * - texts: [{ value, start, end, ancestors, parentTag }]
 * `ancestors` es la pila de etiquetas abiertas (objetos tag) al llegar al token.
 */
export function tokenize(html) {
  const tags = [];
  const texts = [];
  const stack = [];
  let index = 0;

  const pushText = (start, end) => {
    if (end <= start) return;
    texts.push({ value: html.slice(start, end), start, end, ancestors: stack.slice(), parentTag: stack[stack.length - 1] || null });
  };

  while (index < html.length) {
    const lt = html.indexOf('<', index);
    if (lt === -1) {
      pushText(index, html.length);
      break;
    }
    pushText(index, lt);

    if (html.startsWith('<!--', lt)) {
      const close = html.indexOf('-->', lt + 4);
      index = close === -1 ? html.length : close + 3;
      continue;
    }
    if (html[lt + 1] === '!' || html[lt + 1] === '?') {
      const close = html.indexOf('>', lt);
      index = close === -1 ? html.length : close + 1;
      continue;
    }

    const closing = html[lt + 1] === '/';
    const nameMatch = /^[A-Za-z][A-Za-z0-9:-]*/.exec(html.slice(lt + (closing ? 2 : 1), lt + 60));
    if (!nameMatch) {
      // "<" literal en texto.
      pushText(lt, lt + 1);
      index = lt + 1;
      continue;
    }
    const name = nameMatch[0].toLowerCase();
    // Fin de la etiqueta respetando comillas.
    let cursor = lt + (closing ? 2 : 1) + nameMatch[0].length;
    let quote = null;
    while (cursor < html.length) {
      const char = html[cursor];
      if (quote) {
        if (char === quote) quote = null;
      } else if (char === '"' || char === "'") {
        quote = char;
      } else if (char === '>') {
        break;
      }
      cursor += 1;
    }
    const end = Math.min(cursor + 1, html.length);

    if (closing) {
      for (let i = stack.length - 1; i >= 0; i -= 1) {
        if (stack[i].name === name) {
          stack.length = i;
          break;
        }
      }
      index = end;
      continue;
    }

    const nameEnd = lt + 1 + nameMatch[0].length;
    const attrSource = html.slice(nameEnd, end - 1);
    const selfClosing = /\/\s*$/.test(attrSource) || VOID_ELEMENTS.has(name);
    const tag = {
      name,
      start: lt,
      end,
      nameEnd,
      selfClosing,
      attrs: parseAttributes(attrSource.replace(/\/\s*$/, '')).map((attr) => ({ ...attr, start: attr.start + nameEnd, end: attr.end + nameEnd })),
      ancestors: stack.slice(),
    };
    tag.attr = (attrName) => tag.attrs.find((attr) => attr.name === attrName);
    tags.push(tag);

    if (RAW_TEXT.has(name)) {
      const closeIndex = html.toLowerCase().indexOf(`</${name}`, end);
      const rawEnd = closeIndex === -1 ? html.length : closeIndex;
      if (name === 'title' || name === 'textarea') {
        texts.push({ value: html.slice(end, rawEnd), start: end, end: rawEnd, ancestors: [...stack, tag], parentTag: tag });
      }
      const closeEnd = closeIndex === -1 ? html.length : html.indexOf('>', closeIndex) + 1;
      index = closeEnd;
      continue;
    }
    if (!selfClosing) stack.push(tag);
    index = end;
  }
  return { tags, texts };
}

export function hasAttr(tag, name) {
  return Boolean(tag && tag.attrs.some((attr) => attr.name === name));
}

/** Decodifica entidades HTML comunes para comparar con el catálogo. */
const NAMED_ENTITIES = {
  rarr: '→', larr: '←', uarr: '↑', darr: '↓', harr: '↔', copy: '©', reg: '®', trade: '™', middot: '·', bull: '•',
  hellip: '…', mdash: '—', ndash: '–', laquo: '«', raquo: '»', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
  iexcl: '¡', iquest: '¿', deg: '°', times: '×', euro: '€', aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó',
  uacute: 'ú', ntilde: 'ñ', Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú', Ntilde: 'Ñ', uuml: 'ü', Uuml: 'Ü',
  ordf: 'ª', ordm: 'º', check: '✓',
};

export function decodeEntities(value) {
  return value
    .replace(/&(?!nbsp;|amp;|lt;|gt;|quot;|apos;)([A-Za-z]+);/g, (entity, name) => NAMED_ENTITIES[name] ?? entity)
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
}
