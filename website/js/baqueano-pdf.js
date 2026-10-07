// ============================================================================
// 🧭 BAQUEANO — PLANTILLA PDF OFICIAL (baqueano-pdf.js)
// ============================================================================
// 🎯 POR QUÉ:
// - Los PDF de Términos, Aviso Legal y Mi Viaje se hacían con window.print(): una impresión de la
//   pantalla, sin portada, sin índice y distinta en cada navegador. El Prompt Maestro Integral pide
//   documentos con texto real (seleccionable y buscable), identidad BAQUEANO, índice, "Página X de
//   Y", metadatos y el mismo contenido que la web.
//
// ⚙️ CÓMO:
// - jsPDF guardado en el sitio (js/vendor, revisado; ver js/vendor/README.md), cargado solo al pedir
//   un PDF.
// - El contenido legal se lee del mismo HTML ya traducido de la página: títulos h1–h4, párrafos,
//   listas y tablas. Nunca hay una copia aparte que pueda quedar desactualizada.
// - Versión y fecha de la última actualización legal salen de los atributos data-legal-* del
//   <main>. La fecha de generación es distinta y se indica por separado.
// - Tipografía Helvetica estándar del PDF (texto real). Se descartan los caracteres que esa
//   fuente no puede representar (emojis).
// - Logo oficial horizontal (PNG), con su proporción original.
//
// 📦 QUÉ:
// - window.BaqueanoPdf = { legalFromPage(button), ecoReceipt(data), document(spec), techReport(report) }.
// - techReport (F9, 2026-10-07): informe técnico del Ops Center con datos reales ya medidos; cada
//   sección declara su fuente y hora, y una sección sin datos dice por qué en vez de inventar.
// - Los botones con [data-legal-pdf] generan el PDF de la página legal actual.
// ============================================================================
(function (window, document) {
  'use strict';
  if (window.BaqueanoPdf) return;

  var JSPDF_SRC = 'js/vendor/jspdf-4.2.1.umd.min.js';
  var LOGO_SRC = 'assets/images/LOGOS/baqueano_logo_horizontal.png';
  var LOGO_RATIO = 1568 / 214;
  var SITE = 'baqueanonicaragua.com';
  var COLORS = { ink: [13, 27, 42], body: [51, 65, 85], muted: [100, 116, 139], teal: [22, 93, 111], orange: [246, 94, 1], line: [226, 232, 240] };
  var A4 = { w: 210, h: 297, margin: 20 };
  var DOCS = {
    terminos: { file: 'Terminos_y_Condiciones', key: 'pdf.docTerms', es: 'Términos y Condiciones', url: 'terminos.html' },
    privacidad: { file: 'Politica_de_Privacidad', key: 'pdf.docPrivacy', es: 'Política de Privacidad', url: 'privacidad.html' },
    'aviso-legal': { file: 'Aviso_Legal', key: 'pdf.docLegal', es: 'Aviso Legal', url: 'aviso-legal.html' },
    cookies: { file: 'Politica_de_Cookies', key: 'pdf.docCookies', es: 'Política de Cookies', url: 'cookies.html' }
  };

  function t(key, fallback, vars) {
    var text = fallback;
    try { if (window.BaqueanoLanguage && window.BaqueanoLanguage.t) text = window.BaqueanoLanguage.t(key, Object.assign({ fallback: fallback }, vars || {})); } catch (_) { /* respaldo */ }
    return String(text).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; });
  }
  function lang() {
    try { return ((window.BaqueanoLanguage && window.BaqueanoLanguage.get && window.BaqueanoLanguage.get()) || document.documentElement.lang || 'es').slice(0, 2); } catch (_) { return 'es'; }
  }
  function fmtDate(value) {
    // 'AAAA-MM-DD' se interpreta como mediodía UTC para que en Managua sea el mismo día.
    var d = value instanceof Date ? value : new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? value + 'T12:00:00Z' : value);
    if (!isFinite(d.getTime())) return '';
    try { return new Intl.DateTimeFormat(lang(), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Managua' }).format(d); } catch (_) { return d.toISOString().slice(0, 10); }
  }

  // Helvetica del PDF usa WinAnsi: se conservan Latin-1 y los signos tipográficos de WinAnsi.
  var WINANSI_EXTRA = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';
  function clean(text) {
    return String(text || '')
      .replace(/[→⇒➜]/g, '->').replace(/[←]/g, '<-').replace(/[✓✔]/g, '·').replace(/ /g, ' ')
      .split('').filter(function (ch) { var c = ch.charCodeAt(0); return (c >= 32 && c <= 126) || (c >= 160 && c <= 255) || ch === '\n' || WINANSI_EXTRA.indexOf(ch) !== -1; }).join('')
      .replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();
  }

  // ------------------------------------------------------------------ carga perezosa
  var jspdfPromise = null;
  function loadJsPdf() {
    if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
    if (jspdfPromise) return jspdfPromise;
    jspdfPromise = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = JSPDF_SRC; s.async = true;
      s.onload = function () { window.jspdf && window.jspdf.jsPDF ? resolve(window.jspdf.jsPDF) : reject(new Error('jspdf')); };
      s.onerror = function () { jspdfPromise = null; reject(new Error('jspdf')); };
      document.head.appendChild(s);
    });
    return jspdfPromise;
  }
  var logoPromise = null;
  function loadLogo() {
    if (logoPromise) return logoPromise;
    logoPromise = fetch(LOGO_SRC).then(function (r) { if (!r.ok) throw new Error('logo'); return r.blob(); }).then(function (blob) {
      return new Promise(function (resolve) { var fr = new FileReader(); fr.onload = function () { resolve(fr.result); }; fr.onerror = function () { resolve(null); }; fr.readAsDataURL(blob); });
    }).catch(function () { return null; });
    return logoPromise;
  }

  // ------------------------------------------------------------------ motor de maquetación
  function Writer(doc, opts) {
    this.doc = doc; this.opts = opts || {};
    this.y = A4.margin; this.width = A4.w - A4.margin * 2;
    this.bottom = A4.h - 22;
  }
  Writer.prototype.lineHeight = function (size, factor) { return size * 0.3528 * (factor || 1.45); };
  Writer.prototype.newPage = function () { this.doc.addPage(); this.y = this.opts.contentTop || 30; };
  Writer.prototype.ensure = function (h) { if (this.y + h > this.bottom) this.newPage(); };
  Writer.prototype.text = function (text, o) {
    o = o || {};
    var doc = this.doc, size = o.size || 10.5, indent = o.indent || 0;
    var value = clean(text); if (!value) return;
    doc.setFont('helvetica', o.bold ? 'bold' : (o.italic ? 'italic' : 'normal'));
    doc.setFontSize(size);
    doc.setTextColor.apply(doc, o.color || COLORS.body);
    var lh = this.lineHeight(size, o.lh);
    var width = this.width - indent - (o.bullet ? 4 : 0);
    var lines = doc.splitTextToSize(value, width);
    if (o.keepWithNext) this.ensure(lh * Math.min(lines.length, 2) + (o.keepWithNext || 0));
    for (var i = 0; i < lines.length; i++) {
      this.ensure(lh);
      if (o.bullet && i === 0) doc.text('•', A4.margin + indent, this.y);
      doc.text(lines[i], A4.margin + indent + (o.bullet ? 4 : 0), this.y);
      this.y += lh;
    }
    this.y += o.after != null ? o.after : 1.6;
  };

  function drawHeaderFooter(doc, meta, logo) {
    var total = doc.getNumberOfPages();
    for (var p = 1; p <= total; p++) {
      doc.setPage(p);
      if (p > 1 || meta.headerOnFirst) {
        if (logo) doc.addImage(logo, 'PNG', A4.margin, 10, 28, 28 / LOGO_RATIO);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor.apply(doc, COLORS.muted);
        doc.text(clean(meta.shortTitle || meta.title), A4.w - A4.margin, 13, { align: 'right' });
        doc.setDrawColor.apply(doc, COLORS.line); doc.setLineWidth(0.3); doc.line(A4.margin, 17, A4.w - A4.margin, 17);
      }
      doc.setDrawColor.apply(doc, COLORS.line); doc.setLineWidth(0.3); doc.line(A4.margin, A4.h - 14, A4.w - A4.margin, A4.h - 14);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor.apply(doc, COLORS.muted);
      var left = 'BAQUEANO · Nicaragua Auténtica · ' + SITE + (meta.version ? ' · ' + t('pdf.version', 'Versión') + ' ' + meta.version : '');
      doc.text(clean(left), A4.margin, A4.h - 9);
      doc.text(clean(t('pdf.pageOf', 'Página {n} de {total}', { n: p, total: total })), A4.w - A4.margin, A4.h - 9, { align: 'right' });
    }
  }

  // ------------------------------------------------------------------ extracción del contenido legal
  // Bloques de texto. Los paneles cerrados (acordeones) se incluyen siempre: el PDF debe traer el
  // texto completo, no solo lo que está desplegado en pantalla.
  var BLOCK_SELECTOR = 'h1,h2,h3,h4,p,li,dt,dd,summary,tr,blockquote,div';
  var CONTAINER_SELECTOR = 'div,p,ul,ol,li,h1,h2,h3,h4,table,section,article,dl,blockquote';
  function excluded(el) {
    return !!el.closest('script,style,nav,form,dialog,template,[hidden],.no-pdf,#mainNavbar,.site-footer,footer,.bq-cookie-layer,.term-search-card');
  }
  function textOf(el) {
    var text = el.innerText && el.offsetParent !== null ? el.innerText : el.textContent;
    return String(text || '').replace(/\s+/g, ' ').trim();
  }
  function extract(root) {
    var out = [];
    Array.prototype.forEach.call(root.querySelectorAll(BLOCK_SELECTOR), function (el) {
      if (excluded(el)) return;
      var tag = el.tagName;
      if (tag === 'DIV' && el.querySelector(CONTAINER_SELECTOR)) {
        // Texto escrito directamente en un contenedor que además tiene bloques (p. ej. "Datos: <ul>…").
        var own = Array.prototype.filter.call(el.childNodes, function (n) {
          return n.nodeType === 3 || (n.nodeType === 1 && !n.matches(CONTAINER_SELECTOR) && !n.querySelector(CONTAINER_SELECTOR) && !excluded(n) && !/^(BUTTON|SCRIPT|STYLE|SVG|I)$/.test(n.tagName));
        }).map(function (n) { return n.textContent; }).join(' ').replace(/\s+/g, ' ').trim();
        if (own.length > 2) out.push({ level: 0, text: own });
        return;
      }
      if (tag !== 'TR' && tag !== 'DIV' && el.querySelector('p,li,h1,h2,h3,h4,dt,dd,tr,blockquote')) return;
      if (tag !== 'TR' && el.closest('tr') && el.closest('tr') !== el) return;
      var text = tag === 'TR'
        ? Array.prototype.map.call(el.children, function (c) { return textOf(c); }).filter(Boolean).join(' · ')
        : textOf(el);
      if (!text || (tag === 'DIV' && text.length < 3)) return;
      var level = /^H[1-4]$/.test(tag) ? Number(tag[1]) : 0;
      if (out.length && out[out.length - 1].text === text) return;
      out.push({ level: level, text: text, bullet: tag === 'LI', table: tag === 'TR', th: tag === 'TR' && !!el.querySelector('th') });
    });
    return out;
  }

  // ------------------------------------------------------------------ documento legal
  function legal(info) {
    return Promise.all([loadJsPdf(), loadLogo()]).then(function (res) {
      var JsPDF = res[0], logo = res[1];
      var doc = new JsPDF({ unit: 'mm', format: 'a4', compress: true });
      var meta = info.meta;
      var blocks = info.blocks.filter(function (b) { return b.level !== 1; });
      var levels = blocks.filter(function (b) { return b.level > 0; }).map(function (b) { return b.level; });
      var top = levels.length ? Math.min.apply(null, levels) : 2;
      var tocLevels = { }; tocLevels[top] = true; tocLevels[top + 1] = true;
      var tocEntries = blocks.filter(function (b) { return tocLevels[b.level]; });
      var perTocPage = 34;
      var tocPages = Math.max(1, Math.ceil(tocEntries.length / perTocPage));

      // Portada
      if (logo) doc.addImage(logo, 'PNG', A4.margin, 40, 110, 110 / LOGO_RATIO);
      doc.setFillColor.apply(doc, COLORS.orange); doc.rect(A4.margin, 70, 24, 1.6, 'F');
      var w = new Writer(doc, { contentTop: 26 });
      w.y = 86;
      w.text(meta.title, { size: 26, bold: true, color: COLORS.ink, lh: 1.25, after: 6 });
      if (meta.scope) w.text(meta.scope, { size: 11, color: COLORS.body, after: 10 });
      [
        [t('pdf.version', 'Versión'), meta.version || '—'],
        [t('pdf.lastLegalUpdate', 'Última actualización legal'), meta.updated ? fmtDate(meta.updated) : '—'],
        [t('pdf.generatedOn', 'Fecha de generación de este PDF'), fmtDate(new Date())],
        [t('pdf.language', 'Idioma'), lang().toUpperCase()],
        [t('pdf.officialSource', 'Fuente oficial'), 'https://' + SITE + '/' + meta.url]
      ].forEach(function (row) {
        w.text(row[0], { size: 8.5, bold: true, color: COLORS.muted, after: 0.4 });
        w.text(row[1], { size: 11, color: COLORS.ink, after: 3.5 });
      });
      w.y = A4.h - 50;
      w.text(t('pdf.coverNote', 'Este PDF reproduce el texto publicado en el sitio oficial en la fecha de generación. Si hay diferencias, prevalece la versión vigente publicada en el sitio.'), { size: 8.5, italic: true, color: COLORS.muted });

      // Páginas reservadas para el índice
      for (var i = 0; i < tocPages; i++) doc.addPage();

      // Contenido
      doc.addPage(); w.y = 26;
      var anchors = [];
      blocks.forEach(function (b) {
        if (b.level) {
          var size = b.level <= top ? 14 : (b.level === top + 1 ? 12 : 11);
          w.y += b.level <= top ? 3 : 1.5;
          w.ensure(18);
          if (tocLevels[b.level]) anchors.push({ text: b.text, level: b.level, page: doc.getNumberOfPages(), y: w.y });
          w.text(b.text, { size: size, bold: true, color: b.level <= top ? COLORS.teal : COLORS.ink, lh: 1.3, after: 2 });
        } else if (b.table) {
          w.text(b.text, { size: 9.5, bold: b.th, color: b.th ? COLORS.ink : COLORS.body, after: 1 });
        } else {
          w.text(b.text, { size: 10.5, bullet: b.bullet, indent: b.bullet ? 2 : 0 });
        }
      });

      // Documentos relacionados
      w.y += 4; w.ensure(40);
      w.text(t('pdf.relatedDocs', 'Documentos relacionados'), { size: 13, bold: true, color: COLORS.teal, after: 3 });
      Object.keys(DOCS).forEach(function (k) {
        var d = DOCS[k];
        w.ensure(7);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor.apply(doc, COLORS.teal);
        var label = clean(t(d.key, d.es) + ': https://' + SITE + '/' + d.url);
        doc.textWithLink(label, A4.margin, w.y, { url: 'https://' + SITE + '/' + d.url });
        w.y += 6;
      });

      // Índice con números de página y enlaces internos
      var tw = new Writer(doc);
      for (var pIndex = 0; pIndex < tocPages; pIndex++) {
        doc.setPage(2 + pIndex);
        tw.y = 30;
        if (pIndex === 0) tw.text(t('pdf.toc', 'Índice'), { size: 18, bold: true, color: COLORS.ink, after: 5 });
        anchors.slice(pIndex * perTocPage, (pIndex + 1) * perTocPage).forEach(function (a) {
          var indent = a.level > top ? 6 : 0;
          doc.setFont('helvetica', a.level > top ? 'normal' : 'bold'); doc.setFontSize(a.level > top ? 9.5 : 10.5);
          doc.setTextColor.apply(doc, COLORS.ink);
          var label = doc.splitTextToSize(clean(a.text), A4.w - A4.margin * 2 - indent - 14)[0];
          doc.text(label, A4.margin + indent, tw.y);
          doc.text(String(a.page), A4.w - A4.margin, tw.y, { align: 'right' });
          doc.link(A4.margin, tw.y - 4, A4.w - A4.margin * 2, 5.5, { pageNumber: a.page });
          tw.y += 6.4;
        });
      }

      drawHeaderFooter(doc, meta, logo);
      doc.setProperties({
        title: clean(meta.title) + ' — BAQUEANO',
        subject: clean(meta.scope || meta.title),
        author: 'BAQUEANO — Nicaragua Auténtica',
        keywords: 'BAQUEANO, Nicaragua, ' + clean(meta.title) + ', ' + lang(),
        creator: 'BAQUEANO (' + SITE + ')'
      });
      if (typeof doc.setLanguage === 'function') { try { doc.setLanguage(lang()); } catch (_) { /* opcional */ } }
      var filename = 'BAQUEANO_' + meta.file + '_' + lang().toUpperCase() + '_v' + (meta.version || '1.0') + '.pdf';
      doc.save(filename);
      return { filename: filename, pages: doc.getNumberOfPages(), headings: anchors.length, blocks: blocks.length };
    });
  }

  function legalFromPage(button) {
    var main = document.querySelector('main[data-legal-doc]') || document.querySelector('[data-legal-doc]');
    if (!main) return Promise.reject(new Error('no-legal-doc'));
    var key = main.getAttribute('data-legal-doc');
    var base = DOCS[key] || { file: 'Documento', key: 'pdf.docGeneric', es: 'Documento legal', url: window.location.pathname.split('/').pop() };
    var h1 = main.querySelector('h1') || document.querySelector('h1');
    var description = document.querySelector('meta[name="description"]');
    var heading = h1 ? h1.innerText.replace(/\s+/g, ' ').trim() : '';
    var meta = {
      // Título = nombre oficial del documento; el encabezado de la página va como subtítulo.
      title: t(base.key, base.es),
      shortTitle: t(base.key, base.es),
      scope: [heading, description ? description.getAttribute('content') : ''].filter(Boolean).join(' — '),
      version: main.getAttribute('data-legal-version') || '1.0',
      updated: main.getAttribute('data-legal-updated') || '',
      file: base.file, url: base.url
    };
    var label = button ? button.innerHTML : '';
    if (button) { button.disabled = true; button.setAttribute('aria-busy', 'true'); }
    return legal({ meta: meta, blocks: extract(main) }).then(function (result) {
      document.dispatchEvent(new CustomEvent('baqueano:pdfGenerated', { detail: Object.assign({ kind: 'legal', doc: key }, result) }));
      return result;
    }).catch(function (error) {
      if (window.BaqueanoDialog) window.BaqueanoDialog.notice(t('pdf.error', 'No se pudo generar el PDF. Revisá tu conexión e intentá de nuevo.'), { tone: 'warning' });
      throw error;
    }).finally(function () {
      if (button) { button.disabled = false; button.removeAttribute('aria-busy'); button.innerHTML = label; }
    });
  }

  // ------------------------------------------------------------------ comprobante de denuncia
  function ecoReceipt(data) {
    return Promise.all([loadJsPdf(), loadLogo()]).then(function (res) {
      var JsPDF = res[0], logo = res[1];
      var doc = new JsPDF({ unit: 'mm', format: 'a4', compress: true });
      if (logo) doc.addImage(logo, 'PNG', A4.margin, 18, 60, 60 / LOGO_RATIO);
      var w = new Writer(doc);
      w.y = 40;
      w.text(t('pdf.ecoTitle', 'Comprobante de reporte ambiental'), { size: 18, bold: true, color: COLORS.ink, after: 2 });
      w.text(t('pdf.ecoSubtitle', 'Recibido por BAQUEANO de forma confidencial.'), { size: 10.5, color: COLORS.body, after: 8 });
      [
        [t('ecoReport.receiptCode', 'Código'), data.code],
        [t('ecoReport.receiptDate', 'Fecha y hora'), data.createdAt],
        [t('ecoReport.receiptCategory', 'Tipo'), data.category],
        [t('ecoReport.receiptPlace', 'Territorio'), data.territory],
        [t('ecoReport.reference', 'Dirección o punto de referencia'), data.reference || '—'],
        [t('ecoReport.receiptEvidence', 'Evidencias guardadas'), data.evidence],
        [t('ecoReport.receiptStatus', 'Estado'), data.status]
      ].forEach(function (row) {
        w.text(row[0], { size: 8.5, bold: true, color: COLORS.muted, after: 0.4 });
        w.text(row[1] || '—', { size: 11.5, color: COLORS.ink, after: 3.5 });
      });
      w.y += 4;
      w.text(t('ecoReport.receiptIntro', 'Tu reporte quedó guardado de forma confidencial y el equipo lo revisará. Recibirlo no significa que ya se haya enviado a una institución: si se deriva, lo verás al consultar el estado.'), { size: 10, color: COLORS.body, after: 4 });
      w.text(t('pdf.ecoPrivacy', 'Este comprobante no incluye fotos, videos ni datos de contacto. Para consultar el estado necesitás el código y el token privado que viste al enviar el reporte; el token no se imprime aquí por seguridad.'), { size: 9, italic: true, color: COLORS.muted });
      drawHeaderFooter(doc, { title: t('pdf.ecoTitle', 'Comprobante de reporte ambiental') }, logo);
      doc.setProperties({ title: clean(t('pdf.ecoTitle', 'Comprobante de reporte ambiental')) + ' ' + data.code, author: 'BAQUEANO — Nicaragua Auténtica', creator: 'BAQUEANO (' + SITE + ')', subject: data.code });
      var filename = 'BAQUEANO_Comprobante_' + data.code + '.pdf';
      doc.save(filename);
      return { filename: filename };
    });
  }

  // ------------------------------------------------------------------ PDF de Mi Viaje
  function tripPlan(trip, weather) {
    return Promise.all([loadJsPdf(), loadLogo()]).then(function (res) {
      var JsPDF = res[0], logo = res[1];
      var doc = new JsPDF({ unit: 'mm', format: 'a4', compress: true });
      var days = (trip && trip.days) || [];
      var title = clean(trip.name || t('trip.pdfDefaultName', 'Mi viaje por Nicaragua'));
      if (logo) doc.addImage(logo, 'PNG', A4.margin, 18, 70, 70 / LOGO_RATIO);
      var w = new Writer(doc, { contentTop: 26 });
      w.y = 42;
      w.text(title, { size: 22, bold: true, color: COLORS.ink, lh: 1.25, after: 3 });
      // Una ruta de BAQUI trae paradas (no días) y a veces sin ubicación: se usa el nombre.
      var places = days.map(function (d) { return d.location || d.title; }).filter(Boolean);
      var isRoute = trip.kind === 'route';
      w.text(isRoute
        ? t('trip.pdfSummaryStops', '{n} paradas · {places}', { n: days.length, places: places.join(' · ') })
        : t('trip.pdfSummary', '{n} días · {places}', { n: days.length, places: places.join(' · ') }), { size: 11, color: COLORS.body, after: 2 });
      w.text(t('pdf.generatedOn', 'Fecha de generación de este PDF') + ': ' + fmtDate(new Date()), { size: 9, color: COLORS.muted, after: 6 });
      if (trip.demo) {
        w.text(t('trip.demoTitle', 'Itinerario de ejemplo.') + ' ' + t('trip.demoBody', 'No es una reserva ni una ruta confirmada: los horarios, el transporte y los costos se confirman con cada prestador.'), { size: 9.5, italic: true, color: [124, 45, 18], after: 6 });
      }
      w.text(t('trip.pdfItinerary', 'Itinerario día por día'), { size: 15, bold: true, color: COLORS.teal, after: 3 });
      days.forEach(function (d) {
        w.ensure(30);
        w.text(d.badge || '', { size: 9, bold: true, color: COLORS.orange, after: 0.5 });
        w.text(d.title || '', { size: 12.5, bold: true, color: COLORS.ink, lh: 1.3, after: 1 });
        if (d.location) w.text(t('allies.where', 'Ubicación') + ': ' + d.location, { size: 9.5, color: COLORS.muted, after: 1 });
        if (d.desc) w.text(d.desc, { size: 10.5 });
        if (d.extra) w.text(d.extra, { size: 10, italic: true });
        var stats = [d.km ? d.km + ' km' : '', d.hours ? d.hours + ' h' : '', t('trip.costLabel', 'Costo:') + ' ' + (d.cost || t('trip.toConfirm', 'Por confirmar'))].filter(Boolean).join(' · ');
        w.text(stats, { size: 9.5, color: COLORS.body, after: 1 });
        if (isFinite(Number(d.lat)) && isFinite(Number(d.lng)) && d.lat != null) {
          var url = 'https://www.google.com/maps/search/?api=1&query=' + Number(d.lat).toFixed(5) + ',' + Number(d.lng).toFixed(5);
          w.ensure(6);
          doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor.apply(doc, COLORS.teal);
          doc.textWithLink(clean(t('trip.pdfMapLink', 'Ver este punto en el mapa')), A4.margin, w.y, { url: url });
          w.y += 6;
        }
        w.y += 3;
      });
      w.ensure(30);
      w.text(t('trip.weatherTitle', 'Clima en tu ruta'), { size: 15, bold: true, color: COLORS.teal, after: 2 });
      if (weather && weather.days && weather.days.length) {
        w.text(t('trip.weatherNote', 'Pronóstico de los próximos 3 días (tu viaje todavía no tiene fechas).') + ' ' + (weather.place || ''), { size: 10 });
        weather.days.forEach(function (d) { w.text(d.label + ': ' + d.max + '° / ' + d.min + '°' + (d.rain != null ? ' · ' + d.rain + '%' : ''), { size: 10, bullet: true, indent: 2 }); });
        w.text(t('trip.weatherSource', 'Fuente: Open-Meteo') + ' · ' + fmtDate(weather.at || new Date()), { size: 8.5, color: COLORS.muted });
      } else {
        w.text(t('trip.pdfNoWeather', 'Sin pronóstico en este documento: consultalo cerca de la fecha del viaje. BAQUEANO no incluye datos de clima inventados.'), { size: 10 });
      }
      w.ensure(30);
      w.text(t('trip.budgetTitle', 'Categorías de gasto de tu viaje'), { size: 15, bold: true, color: COLORS.teal, after: 2 });
      w.text(t('trip.budgetHonest', 'BAQUEANO no publica montos sin una fuente verificable. Cada costo se confirma directamente con el prestador antes de viajar.'), { size: 10 });
      w.ensure(26);
      w.text(t('trip.pdfContact', 'Contacto'), { size: 15, bold: true, color: COLORS.teal, after: 2 });
      w.text(t('trip.pdfContactBody', 'Para coordinar con los prestadores de esta ruta: línea oficial de BAQUEANO +505 8443-1289 (WhatsApp) o baqueanonicaragua@gmail.com. BAQUEANO te conecta con los negocios; no procesa reservas ni pagos.'), { size: 10 });
      w.text(t('trip.pdfQrPending', 'Código QR para compartir: próximamente, cuando el viaje pueda guardarse en tu cuenta con un enlace privado.'), { size: 9, italic: true, color: COLORS.muted });
      drawHeaderFooter(doc, { title: title }, logo);
      doc.setProperties({ title: title + ' — BAQUEANO', subject: t('trip.pdfItinerary', 'Itinerario día por día'), author: 'BAQUEANO — Nicaragua Auténtica', creator: 'BAQUEANO (' + SITE + ')', keywords: 'BAQUEANO, Nicaragua, ' + places.join(', ') });
      var filename = 'BAQUEANO_' + (isRoute ? 'Ruta_BAQUI_' : 'Mi_Viaje_') + lang().toUpperCase() + '_' + new Date().toISOString().slice(0, 10) + '.pdf';
      doc.save(filename);
      document.dispatchEvent(new CustomEvent('baqueano:pdfGenerated', { detail: { kind: 'trip', filename: filename, days: days.length } }));
      return { filename: filename, pages: doc.getNumberOfPages() };
    });
  }

  // ------------------------------------------------------------------ informe técnico (F9)
  // report = { generatedBy, sections: [{ title, source, at, note, rows: [[etiqueta, valor, estado?]], error }] }
  // estado opcional: 'ok' | 'warn' | 'fail' (se escribe como texto, no solo color).
  function techReport(report) {
    return Promise.all([loadJsPdf(), loadLogo()]).then(function (res) {
      var JsPDF = res[0], logo = res[1];
      var doc = new JsPDF({ unit: 'mm', format: 'a4', compress: true });
      var title = t('techReport.title', 'Informe técnico de BAQUEANO');
      var now = new Date();
      if (logo) doc.addImage(logo, 'PNG', A4.margin, 18, 70, 70 / LOGO_RATIO);
      var w = new Writer(doc, { contentTop: 26 });
      w.y = 42;
      w.text(title, { size: 22, bold: true, color: COLORS.ink, lh: 1.25, after: 3 });
      var stamp = new Intl.DateTimeFormat(lang(), { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Managua' }).format(now);
      w.text(t('pdf.generatedOn', 'Fecha de generación de este PDF') + ': ' + stamp + ' (' + t('techReport.tz', 'hora de Nicaragua') + ')', { size: 9.5, color: COLORS.muted, after: 1 });
      if (report.generatedBy) w.text(t('techReport.by', 'Generado por') + ': ' + report.generatedBy, { size: 9.5, color: COLORS.muted, after: 4 });
      w.text(t('techReport.method', 'Todas las cifras de este informe se midieron en el momento de generarlo, desde la base de datos de Supabase y desde el sitio publicado. Si una fuente no respondió, la sección lo indica; no se completan datos a mano ni se estiman.'), { size: 10, italic: true, after: 6 });
      var STATE = { ok: t('techReport.stateOk', 'Correcto'), warn: t('techReport.stateWarn', 'Aviso'), fail: t('techReport.stateFail', 'Falla') };
      var STATE_COLOR = { ok: [74, 122, 90], warn: [180, 83, 9], fail: [185, 28, 28] };
      (report.sections || []).forEach(function (sec, i) {
        w.ensure(28);
        w.text((i + 1) + '. ' + sec.title, { size: 14, bold: true, color: COLORS.teal, after: 1.5, keepWithNext: 10 });
        var meta = [sec.source ? t('techReport.source', 'Fuente') + ': ' + sec.source : '', sec.at ? t('techReport.measuredAt', 'Medido') + ': ' + sec.at : ''].filter(Boolean).join(' · ');
        if (meta) w.text(meta, { size: 8.5, color: COLORS.muted, after: 2 });
        if (sec.error) { w.text(t('techReport.unavailable', 'Sin datos en este informe') + ': ' + sec.error, { size: 10, color: STATE_COLOR.fail, after: 4 }); return; }
        if (sec.note) w.text(sec.note, { size: 9.5, italic: true, after: 2 });
        (sec.rows || []).forEach(function (row) {
          var label = clean(row[0]), value = clean(row[1] == null ? '—' : String(row[1])), st = row[2];
          doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5);
          var labelW = 62, valueX = A4.margin + labelW + 2, valueW = w.width - labelW - 2 - (st ? 20 : 0);
          var labelLines = doc.splitTextToSize(label, labelW);
          doc.setFont('helvetica', 'normal');
          var valueLines = doc.splitTextToSize(value, valueW);
          var lh = w.lineHeight(9.5, 1.35), h = Math.max(labelLines.length, valueLines.length) * lh + 1.6;
          w.ensure(h);
          doc.setFont('helvetica', 'bold'); doc.setTextColor.apply(doc, COLORS.ink); doc.text(labelLines, A4.margin, w.y);
          doc.setFont('helvetica', 'normal'); doc.setTextColor.apply(doc, COLORS.body); doc.text(valueLines, valueX, w.y);
          if (st && STATE[st]) {
            doc.setFont('helvetica', 'bold'); doc.setTextColor.apply(doc, STATE_COLOR[st]);
            doc.text(clean(STATE[st]), A4.w - A4.margin, w.y, { align: 'right' });
          }
          doc.setDrawColor.apply(doc, COLORS.line); doc.setLineWidth(0.2);
          doc.line(A4.margin, w.y + h - lh - 0.2, A4.w - A4.margin, w.y + h - lh - 0.2);
          w.y += h;
        });
        w.y += 4;
      });
      drawHeaderFooter(doc, { title: title, shortTitle: title }, logo);
      doc.setProperties({ title: title, subject: t('techReport.subject', 'Estado técnico de la plataforma'), author: 'BAQUEANO — Ops Center', creator: 'BAQUEANO (' + SITE + ')', keywords: 'BAQUEANO, informe técnico, Supabase, Azure' });
      var local = new Intl.DateTimeFormat('sv-SE', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Managua' }).format(now).replace(/[-: ]/g, '');
      var filename = 'BAQUEANO_Informe_tecnico_' + local + '.pdf'; // hora de Nicaragua (AAAAMMDDHHMM)
      doc.save(filename);
      document.dispatchEvent(new CustomEvent('baqueano:pdfGenerated', { detail: { kind: 'techReport', filename: filename, sections: (report.sections || []).length } }));
      return { filename: filename, pages: doc.getNumberOfPages() };
    });
  }

  // Botones de descarga de los documentos legales (sin onclick en línea).
  document.addEventListener('click', function (e) {
    var button = e.target.closest && e.target.closest('[data-legal-pdf]');
    if (!button) return;
    e.preventDefault();
    legalFromPage(button).catch(function () { /* el diálogo ya informó */ });
  });

  window.BaqueanoPdf = { legalFromPage: legalFromPage, ecoReceipt: ecoReceipt, trip: tripPlan, techReport: techReport, _extract: extract, _clean: clean };
})(window, document);
