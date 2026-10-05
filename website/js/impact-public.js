/**
 * 🧭 BAQUEANO IMPACTO — sección pública "Nuestro impacto" (nosotros.html#impacto)
 *
 * 🎯 POR QUÉ: mostrar cómo BAQUEANO contribuye a prioridades nacionales con
 *   indicadores REALES y fuentes oficiales, sin propaganda y sin atribuirse
 *   reconocimientos institucionales que no existen.
 * ⚙️ CÓMO: se ejecuta cuando la sección se acerca a la pantalla. Pide a Supabase
 *   (clave publicable, solo lectura):
 *   1. RPC public_impact_summary(): agregados sin PII calculados al momento.
 *   2. national_alignment (RLS: solo filas vigentes) con fuente y fecha.
 *   Si el servidor no responde o la migración aún no está aplicada, cada cifra
 *   dice "Sin datos suficientes": nunca se rellena con números estimados.
 * 📦 QUÉ: llena [data-impact-key] en #bqImpactGrid y la lista #bqImpactAlign.
 */
(function (window, document) {
  'use strict';
  var section = document.getElementById('impacto');
  if (!section || !window.fetch) return;
  var BASE = 'https://heiudfpthqwtjrtluqlm.supabase.co/rest/v1/';
  var KEY = 'sb_publishable_q7ZhqRIRjlerZK7WOu_Qxw_X_AqXV1d';
  var HEADERS = { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
  var FRAMEWORK_FALLBACK = {
    pnlcp_dh_2022_2026: 'Plan Nacional de Lucha contra la Pobreza y para el Desarrollo Humano 2022-2026',
    intur_2026: 'INTUR — ejes de trabajo 2026',
    ley_turismo_rural: 'Turismo Rural y Comunitario (INTUR)',
    ene_2024_2026: 'Estrategia Nacional de Educación 2024-2026',
    marena_sinap: 'MARENA — Sistema Nacional de Áreas Protegidas'
  };
  var TYPE_FALLBACK = { direct: 'Contribución directa', supporting: 'Contribución de apoyo', potential: 'Capacidad potencial' };

  function i18n(key, fallback, vars) {
    var lang = window.BaqueanoLanguage;
    var text = (lang && typeof lang.t === 'function' && lang.t(key, Object.assign({ fallback: fallback }, vars || {}))) || fallback;
    return String(text).replace(/\{(\w+)\}/g, function (_, token) { return vars && vars[token] != null ? vars[token] : '{' + token + '}'; });
  }
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
  function locale() {
    var lang = (window.BaqueanoLanguage && window.BaqueanoLanguage.getLanguage && window.BaqueanoLanguage.getLanguage()) || 'es';
    return lang === 'es' ? 'es-NI' : lang;
  }
  function request(path, options) {
    var controller = window.AbortController ? new AbortController() : null;
    var timer = controller ? window.setTimeout(function () { controller.abort(); }, 10000) : null;
    return window.fetch(BASE + path, Object.assign({ headers: HEADERS, signal: controller && controller.signal }, options || {}))
      .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .finally(function () { if (timer) window.clearTimeout(timer); });
  }

  var summary = null;
  var alignment = null;

  function renderStats() {
    var grid = document.getElementById('bqImpactGrid');
    if (!grid) return;
    grid.querySelectorAll('[data-impact-key]').forEach(function (node) {
      var value = summary ? summary[node.getAttribute('data-impact-key')] : null;
      var card = node.closest('.bq-impact-stat');
      if (value == null || isNaN(Number(value))) {
        node.textContent = i18n('impact.noData', 'Sin datos suficientes');
        if (card) card.classList.add('is-empty');
        return;
      }
      if (card) card.classList.remove('is-empty');
      var unit = node.getAttribute('data-impact-unit') || '';
      node.textContent = Number(value).toLocaleString(locale()) + (unit ? ' ' + unit : '');
      var key = node.getAttribute('data-impact-key');
      if (key === 'departamentos_con_contenido' && summary.departamentos_catalogados) node.textContent += ' / ' + summary.departamentos_catalogados;
      if (key === 'municipios_con_contenido' && summary.municipios_catalogados) node.textContent += ' / ' + summary.municipios_catalogados;
    });
    grid.setAttribute('aria-busy', 'false');
    var note = document.getElementById('bqImpactNote');
    if (note && summary && summary.generated_at) {
      note.textContent = i18n('impact.public.formula', 'Cobertura territorial = municipios con contenido ÷ municipios catalogados × 100. Fuente: base de datos BAQUEANO (Supabase).') +
        ' ' + i18n('impact.public.updated', 'Calculado: {time}.', { time: new Date(summary.generated_at).toLocaleString(locale()) });
    }
  }

  function renderAlignment() {
    var box = document.getElementById('bqImpactAlign');
    if (!box) return;
    box.textContent = '';
    if (!alignment || !alignment.length) {
      box.append(el('p', 'bq-impact-note', i18n('impact.public.alignEmpty', 'La matriz de alineación con fuentes oficiales todavía no está publicada.')));
      return;
    }
    var groups = {};
    alignment.forEach(function (row) { (groups[row.national_framework] = groups[row.national_framework] || []).push(row); });
    Object.keys(groups).forEach(function (framework) {
      var details = el('details', 'bq-impact-framework');
      details.append(el('summary', '', i18n('impact.framework.' + framework, FRAMEWORK_FALLBACK[framework] || framework)));
      var list = el('ul', 'bq-impact-align-list');
      list.setAttribute('role', 'list');
      groups[framework].forEach(function (row) {
        var li = el('li');
        var head = el('p', 'bq-impact-align-head');
        head.append(el('strong', '', row.axis_name), el('span', 'bq-impact-badge is-' + row.alignment_type, i18n('impact.alignType.' + row.alignment_type, TYPE_FALLBACK[row.alignment_type] || row.alignment_type)));
        li.append(head);
        // Descripción redactada en español en la fuente de datos (contenido, no interfaz).
        li.append(el('p', '', row.description));
        var meta = el('p', 'bq-impact-source');
        var link = el('a', '', i18n('impact.public.officialSource', 'Fuente oficial') + ': ' + row.source_name);
        link.href = row.source_url; link.target = '_blank'; link.rel = 'noopener noreferrer';
        meta.append(link, document.createTextNode(' · ' + i18n('impact.public.verifiedOn', 'Consultada el {date}', { date: row.verified_at })));
        li.append(meta);
        list.append(li);
      });
      details.append(list);
      box.append(details);
    });
  }

  function load() {
    Promise.allSettled([
      request('rpc/public_impact_summary', { method: 'POST', body: '{}' }),
      request('national_alignment?select=national_framework,axis_name,description,alignment_type,source_name,source_url,verified_at&order=sort_order.asc')
    ]).then(function (results) {
      summary = results[0].status === 'fulfilled' ? results[0].value : null;
      alignment = results[1].status === 'fulfilled' ? results[1].value : null;
      renderStats();
      renderAlignment();
    });
  }

  window.addEventListener('baqueano:languageChanged', function () { if (summary !== null || alignment !== null) { renderStats(); renderAlignment(); } });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting; })) { io.disconnect(); load(); }
    }, { rootMargin: '400px 0px' });
    io.observe(section);
  } else {
    load();
  }
})(window, document);
