/**
 * 🎯 POR QUÉ: el propietario pidió que la base verificada (2026-10-05) y el catálogo INTUR
 *   de turismo rural y comunitario 2026 aparezcan también en destinos.html, por departamento.
 * ⚙️ CÓMO: una sola fuente de datos, js/territories-data.js (la misma de la franja viva y la
 *   ficha de cada departamento). Se descarga solo cuando la sección se acerca a la pantalla.
 *   Se listan los lugares con `verification`; filtros por departamento/región y por tipo.
 *   Sin calificaciones ni precios inventados: cada tarjeta muestra su fuente.
 * 📦 QUÉ: llena #destVerifiedGrid, #destVerifiedDept, #destVerifiedKind y #destVerifiedCount.
 */
(function (window, document) {
  'use strict';
  var DATA_URL = 'js/territories-data.js?v=20261005-nat-1';
  var section = document.getElementById('destinosVerificados');
  if (!section) return;
  var grid = document.getElementById('destVerifiedGrid');
  var deptSelect = document.getElementById('destVerifiedDept');
  var kindRow = document.getElementById('destVerifiedKind');
  var count = document.getElementById('destVerifiedCount');
  var items = [];
  var state = { dept: '', kind: '' };

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
  function icon(name) { var i = el('i', name.indexOf('fa-brands') === 0 ? name : 'fa-solid ' + name); i.setAttribute('aria-hidden', 'true'); return i; }

  // Tipo legible: modalidad del catálogo INTUR o "Lugar verificado" (base verificada).
  var CATEGORY_KIND = { playa: 'Playas', rio: 'Ríos', isla: 'Islas', cascada: 'Cascadas', laguna: 'Lagunas y lagos', volcan: 'Volcanes y cerros', reserva: 'Reservas naturales', cueva: 'Cuevas y cañones', mirador: 'Miradores', parque: 'Parques y áreas protegidas' };
  function kindOf(place) {
    var v = place.verification || {};
    if (place.category && CATEGORY_KIND[place.category]) return i18n('destinos.verified.kind.' + place.category, CATEGORY_KIND[place.category]);
    return v.modality || i18n('destinos.verified.kindPlace', 'Lugar y servicio verificado');
  }

  function collect() {
    var territories = window.BAQUEANO_TERRITORIES;
    var list = Array.isArray(territories) ? territories : Object.values(territories || {});
    items = [];
    list.forEach(function (territory) {
      (territory.places || []).forEach(function (place) {
        if (!place.verification) return;
        items.push({ territory: territory, place: place, kind: kindOf(place) });
      });
    });
    items.sort(function (a, b) { return a.territory.name.localeCompare(b.territory.name, 'es') || a.place.name.localeCompare(b.place.name, 'es'); });
  }

  function renderFilters() {
    var seen = {};
    items.forEach(function (item) { seen[item.territory.id] = item.territory.name; });
    Object.keys(seen).sort(function (a, b) { return seen[a].localeCompare(seen[b], 'es'); }).forEach(function (id) {
      var option = el('option', '', seen[id]);
      option.value = id;
      option.setAttribute('translate', 'no');
      deptSelect.append(option);
    });
    var kinds = [];
    items.forEach(function (item) { if (kinds.indexOf(item.kind) < 0) kinds.push(item.kind); });
    [''].concat(kinds).forEach(function (kind) {
      var chip = el('button', 'dest-verified-chip' + (kind === state.kind ? ' is-active' : ''), kind || i18n('destinos.verified.kindAll', 'Todos'));
      chip.type = 'button';
      chip.setAttribute('aria-pressed', String(kind === state.kind));
      chip.addEventListener('click', function () {
        state.kind = kind;
        Array.prototype.forEach.call(kindRow.children, function (node) { var on = node === chip; node.classList.toggle('is-active', on); node.setAttribute('aria-pressed', String(on)); });
        renderGrid();
      });
      kindRow.append(chip);
    });
    deptSelect.addEventListener('change', function () { state.dept = deptSelect.value; renderGrid(); });
  }

  function card(item) {
    var place = item.place, v = place.verification, territory = item.territory;
    var article = el('article', 'dest-verified-card');
    var head = el('div', 'dest-verified-head');
    var badge = el('span', 'dest-verified-icon'); badge.append(icon(place.icon || 'fa-location-dot'));
    var titles = el('div', 'dest-verified-titles');
    var title = el('h3', '', place.name); title.setAttribute('translate', 'no');
    var where = el('p', 'dest-verified-where'); where.append(icon('fa-location-dot'), ' ', territory.name);
    titles.append(title, where);
    head.append(badge, titles);
    var seal = el('p', 'dest-verified-seal'); seal.append(icon('fa-circle-check'), ' ' + i18n('places.verified.seal', 'Verificado') + ' · ' + item.kind);
    var desc = el('p', 'dest-verified-desc', place.desc);
    article.append(head, seal, desc);
    if (v.activities) { var act = el('p', 'dest-verified-meta'); act.append(el('strong', '', i18n('places.verified.activities', 'Actividades') + ': '), v.activities); article.append(act); }
    if (v.hours) { var hrs = el('p', 'dest-verified-meta'); hrs.append(el('strong', '', i18n('places.verified.hours', 'Horario') + ': '), v.hours); article.append(hrs); }
    if (v.price) { var price = el('p', 'dest-verified-meta'); price.append(el('strong', '', i18n('places.verified.price', 'Precio y horario') + ': '), v.price); article.append(price); }
    var actions = el('div', 'dest-verified-actions');
    var more = el('a', 'dest-verified-btn is-primary');
    more.href = 'departamento.html?id=' + encodeURIComponent(territory.id);
    more.append(icon('fa-map-location-dot'), ' ' + i18n('destinos.verified.seeDepartment', 'Ver en {department}', { department: territory.name }));
    var plan = el('a', 'dest-verified-btn');
    plan.href = 'baqueano-ia.html?q=' + encodeURIComponent('Quiero visitar ' + place.name + ' en ' + territory.name);
    plan.append(icon('fa-wand-magic-sparkles'), ' ' + i18n('destinos.verified.plan', 'Planificar con BAQUI'));
    actions.append(more, plan);
    article.append(actions);
    var sources = (v.sources || []).filter(function (s) { return s && s.label; });
    if (sources.length) {
      var src = el('p', 'dest-verified-source', i18n('places.verified.sources', 'Fuentes') + ': ');
      sources.forEach(function (s, index) {
        if (index) src.append(' · ');
        if (s.url) { var a = el('a', '', s.label); a.href = s.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; src.append(a); }
        else src.append(s.label);
      });
      article.append(src);
    }
    return article;
  }

  function renderGrid() {
    var shown = items.filter(function (item) { return (!state.dept || item.territory.id === state.dept) && (!state.kind || item.kind === state.kind); });
    grid.replaceChildren.apply(grid, shown.map(card));
    count.textContent = i18n('destinos.verified.count', '{count} lugares verificados', { count: shown.length });
    grid.setAttribute('aria-busy', 'false');
  }

  function start() {
    if (start.done) return; start.done = true;
    var ready = function () { collect(); renderFilters(); renderGrid(); };
    if (window.BAQUEANO_TERRITORIES) { ready(); return; }
    var script = document.createElement('script');
    script.src = DATA_URL; script.async = true;
    script.onload = ready;
    script.onerror = function () { count.textContent = i18n('destinos.verified.error', 'No se pudo cargar la lista. Recargá la página.'); };
    document.body.appendChild(script);
  }
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting; })) { observer.disconnect(); start(); }
    }, { rootMargin: '600px 0px' });
    observer.observe(section);
  } else start();
  window.addEventListener('baqueano:languageChanged', function () { if (start.done && items.length) { kindRow.replaceChildren(); while (deptSelect.options.length > 1) deptSelect.remove(1); collect(); renderFilters(); renderGrid(); } });
})(window, document);
