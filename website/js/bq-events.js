/**
 * ============================================================================
 * 🗓️ BAQUEANO — AGENDA DE EVENTOS (bq-events.js)
 * ============================================================================
 * 🎯 POR QUÉ:
 * - Pedido del propietario (2026-10-20): «¡Nicaragua está de fiesta!» en el index, justo antes
 *   de «Explorá Nicaragua en el mapa» + BAQÜI, con eventos reales que el equipo publica desde el
 *   Ops Center sin tocar código. Página completa con filtros y ficha de cada evento.
 * - Nada ficticio: sin eventos publicados se muestra un estado vacío, nunca ejemplos.
 *
 * ⚙️ CÓMO:
 * - Una sola fuente: Edge Function `baqueano-events` (list / get), que solo devuelve eventos
 *   aprobados y publicados y calcula el estado (hoy, en curso, finalizado, cancelado…) con la
 *   hora de Nicaragua. Fechas y horas se muestran en America/Managua con el formato del idioma.
 * - Index: se carga cuando la sección se acerca a la pantalla (no frena la portada); carrusel
 *   con desplazamiento táctil y flechas; de 3 a 6 próximos eventos.
 * - Ficha: «Cómo llegar» con el navegador interno solo si las coordenadas están verificadas
 *   (si no, no se ofrece); eventos virtuales sin «Cómo llegar». «Añadir a mi calendario» genera
 *   un .ics correcto (UTC o día completo si la hora no está confirmada). «Agregar a Mi Viaje» sin
 *   duplicar. Schema.org Event solo con datos reales. Enlaces de entradas marcados como del organizador.
 * - Todo se construye con createElement/textContent. Textos en 8 idiomas (events.*).
 *
 * 📦 QUÉ: window.BaqueanoEvents = { list(opts), get(slug), mountHome(el), mountAgenda(el), mountDetail(el, slug), ics(event) }.
 * ============================================================================
 */
(function (window, document) {
  'use strict';
  if (window.BaqueanoEvents) return;

  var ENDPOINT = 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-events';
  var TZ = 'America/Managua';
  var CATEGORIES = ['feria_turistica', 'festival_cultural', 'gastronomia', 'musica', 'tradiciones', 'arte_patrimonio',
    'naturaleza', 'turismo_comunitario', 'deporte_aventura', 'exposicion', 'tecnologia_emprendimiento', 'familiar'];
  var CATEGORY_LABELS = {
    feria_turistica: 'Ferias turísticas', festival_cultural: 'Festivales culturales', gastronomia: 'Gastronomía',
    musica: 'Música y conciertos', tradiciones: 'Tradiciones y festividades', arte_patrimonio: 'Arte y patrimonio',
    naturaleza: 'Naturaleza y ecoturismo', turismo_comunitario: 'Turismo comunitario', deporte_aventura: 'Deporte y aventura',
    exposicion: 'Exposiciones', tecnologia_emprendimiento: 'Tecnología y emprendimiento', familiar: 'Actividades familiares'
  };
  var CATEGORY_ICONS = {
    feria_turistica: 'fa-store', festival_cultural: 'fa-masks-theater', gastronomia: 'fa-utensils', musica: 'fa-music',
    tradiciones: 'fa-church', arte_patrimonio: 'fa-palette', naturaleza: 'fa-leaf', turismo_comunitario: 'fa-people-roof',
    deporte_aventura: 'fa-person-hiking', exposicion: 'fa-image', tecnologia_emprendimiento: 'fa-lightbulb', familiar: 'fa-children'
  };
  var DEPARTMENTS = {
    boaco: 'Boaco', carazo: 'Carazo', chinandega: 'Chinandega', chontales: 'Chontales', raccn: 'Costa Caribe Norte',
    raccs: 'Costa Caribe Sur', esteli: 'Estelí', granada: 'Granada', jinotega: 'Jinotega', leon: 'León', madriz: 'Madriz',
    managua: 'Managua', masaya: 'Masaya', matagalpa: 'Matagalpa', nueva_segovia: 'Nueva Segovia', rio_san_juan: 'Río San Juan', rivas: 'Rivas'
  };
  var STATE_LABELS = {
    upcoming: 'Próximamente', today: 'Hoy', ongoing: 'En curso', finished: 'Finalizado', cancelled: 'Cancelado',
    rescheduled: 'Reprogramado', postponed: 'Pospuesto', unscheduled: 'Fecha por confirmar'
  };

  // ------------------------------------------------------------------ utilidades
  function t(key, fallback, vars) {
    var out = fallback;
    try { out = (window.BaqueanoLanguage && window.BaqueanoLanguage.t('events.' + key, { fallback: fallback })) || fallback; } catch (_) { out = fallback; }
    return String(out).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; });
  }
  function lang() {
    var l = 'es';
    try { l = (window.BaqueanoLanguage && window.BaqueanoLanguage.get && window.BaqueanoLanguage.get()) || document.documentElement.lang || 'es'; } catch (_) { l = 'es'; }
    l = String(l).slice(0, 2).toLowerCase();
    return /^(es|en|fr|it|pt|de|ko|zh)$/.test(l) ? l : 'es';
  }
  function locale() { return { es: 'es-NI', en: 'en-US', fr: 'fr-FR', it: 'it-IT', pt: 'pt-BR', de: 'de-DE', ko: 'ko-KR', zh: 'zh-CN' }[lang()]; }
  function el(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text != null) n.textContent = text;
    return n;
  }
  function icon(name) { var i = el('i', 'fa-solid ' + name); i.setAttribute('aria-hidden', 'true'); return i; }
  function i18nText(tag, className, key, fallback) {
    var n = el(tag, className, t(key, fallback));
    n.setAttribute('data-i18n', 'events.' + key);
    return n;
  }
  function safeUrl(u) { return /^https:\/\/[^\s"'<>]+$/.test(String(u || '')) ? String(u) : ''; }
  function catLabel(c) { return t('cat.' + c, CATEGORY_LABELS[c] || c); }
  function stateLabel(s) { return t('state.' + s, STATE_LABELS[s] || s); }
  function fmt(iso, opts) {
    try { return new Intl.DateTimeFormat(locale(), Object.assign({ timeZone: TZ }, opts)).format(new Date(iso)); } catch (_) { return ''; }
  }
  function datePart(iso, part) {
    try {
      var parts = new Intl.DateTimeFormat(locale(), { timeZone: TZ, day: 'numeric', month: 'short', year: 'numeric' }).formatToParts(new Date(iso));
      var hit = parts.filter(function (p) { return p.type === part; })[0];
      return hit ? hit.value.replace('.', '') : '';
    } catch (_) { return ''; }
  }
  function localDate(iso) {
    try { return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso)); } catch (_) { return String(iso).slice(0, 10); }
  }
  // «sáb. 14 de noviembre de 2026 · 18:30 – 22:00» o «… · Horario por confirmar».
  function whenText(e, long) {
    if (!e.start_at) return t('dateTbc', 'Fecha por confirmar');
    var dayOpts = long ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' } : { weekday: 'short', day: 'numeric', month: 'short' };
    var start = fmt(e.start_at, dayOpts);
    var sameDay = !e.end_at || localDate(e.end_at) === localDate(e.start_at);
    var days = sameDay ? start : start + ' – ' + fmt(e.end_at, dayOpts);
    return days;
  }
  function timeText(e) {
    if (!e.time_confirmed) return t('timeTbc', 'Horario por confirmar');
    var start = fmt(e.start_at, { hour: '2-digit', minute: '2-digit' });
    if (e.end_at && localDate(e.end_at) === localDate(e.start_at)) return start + ' – ' + fmt(e.end_at, { hour: '2-digit', minute: '2-digit' });
    return start;
  }
  function whereText(e) {
    if (e.modality === 'virtual') return t('virtual', 'En línea');
    return [e.location_name, e.municipality_id ? String(e.municipality_id).split('__').pop().replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); }) : '', DEPARTMENTS[e.department_id] || '']
      .filter(Boolean).filter(function (v, i, a) { return a.indexOf(v) === i; }).join(' · ');
  }
  function canRoute(e) { return e.modality !== 'virtual' && e.coords_verified && isFinite(e.latitude) && isFinite(e.longitude) && e.latitude != null; }

  function call(action, payload) {
    return fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.assign({ action: action }, payload || {})) })
      .then(function (res) {
        return res.json().catch(function () { return null; }).then(function (data) {
          if (res.ok && data && data.ok !== false) return data;
          var e = new Error((data && data.error) || 'error'); e.status = res.status; throw e;
        });
      });
  }
  function list(opts) { return call('list', opts || {}).then(function (d) { return d; }); }
  function get(slug) { return call('get', { slug: slug }).then(function (d) { return d.event; }); }

  // ------------------------------------------------------------------ tarjeta
  function card(e) {
    var art = el('article', 'bq-ev-card is-' + e.time_state);
    var link = 'evento.html?e=' + encodeURIComponent(e.slug);
    var media = el('a', 'bq-ev-media');
    media.href = link;
    media.setAttribute('tabindex', '-1');
    media.setAttribute('aria-hidden', 'true');
    var img = safeUrl(e.cover_image);
    if (img) {
      var im = el('img');
      im.src = img; im.alt = ''; im.loading = 'lazy'; im.decoding = 'async'; im.width = 640; im.height = 400;
      im.addEventListener('error', function () { im.remove(); media.classList.add('is-nophoto'); });
      media.append(im);
    } else media.classList.add('is-nophoto');
    var badge = el('span', 'bq-ev-date');
    badge.append(el('b', null, datePart(e.start_at, 'day')), el('span', null, datePart(e.start_at, 'month') + ' ' + datePart(e.start_at, 'year')));
    media.append(badge);
    if (e.time_state !== 'upcoming') {
      var chip = el('span', 'bq-ev-state is-' + e.time_state, stateLabel(e.time_state));
      media.append(chip);
    }
    if (e.is_featured) media.append(el('span', 'bq-ev-featured', t('featured', 'Destacado')));
    art.append(media);

    var body = el('div', 'bq-ev-body');
    var cat = el('span', 'bq-ev-cat');
    cat.append(icon(CATEGORY_ICONS[e.category] || 'fa-calendar'), ' ', catLabel(e.category));
    var h = el('h3', 'bq-ev-title');
    var a = el('a', null, e.title);
    a.href = link;
    a.setAttribute('translate', 'no');
    h.append(a);
    var meta = el('ul', 'bq-ev-meta');
    var li1 = el('li'); li1.append(icon('fa-calendar-day'), ' ', el('span', null, whenText(e, false)));
    var li2 = el('li'); li2.append(icon('fa-clock'), ' ', el('span', null, timeText(e)));
    var li3 = el('li'); li3.append(icon(e.modality === 'virtual' ? 'fa-globe' : 'fa-location-dot'), ' ');
    var where = el('span', null, whereText(e)); where.setAttribute('translate', 'no'); li3.append(where);
    meta.append(li1, li2, li3);
    if (e.event_status === 'rescheduled' && e.rescheduled_from) {
      meta.append(el('li', 'bq-ev-note', t('rescheduledFrom', 'Antes: {date}', { date: fmt(e.rescheduled_from, { day: 'numeric', month: 'short' }) })));
    }
    body.append(cat, h, meta);
    if (e.short_description) { var p = el('p', 'bq-ev-desc', e.short_description); p.setAttribute('lang', 'es'); body.append(p); }
    var actions = el('div', 'bq-ev-actions');
    var go = el('a', 'bq-ev-btn', t('view', 'Ver evento'));
    go.href = link;
    go.setAttribute('aria-label', t('viewAria', 'Ver evento: {title}', { title: e.title }));
    actions.append(go);
    if (canRoute(e) && e.time_state !== 'cancelled' && e.time_state !== 'finished') {
      var route = el('button', 'bq-ev-btn is-ghost');
      route.type = 'button';
      route.setAttribute('data-bq-route', '');
      route.setAttribute('data-lat', String(e.latitude));
      route.setAttribute('data-lng', String(e.longitude));
      route.setAttribute('data-precision', 'exact');
      if (img) route.setAttribute('data-image', img);
      route.append(icon('fa-diamond-turn-right'), ' ', t('directions', 'Cómo llegar'));
      actions.append(route);
    }
    body.append(actions);
    art.append(body);
    return art;
  }

  function emptyState(scope) {
    var box = el('div', 'bq-ev-empty');
    box.append(icon('fa-calendar-plus'));
    box.append(i18nText('p', null, scope === 'past' ? 'emptyPast' : 'empty', scope === 'past' ? 'Todavía no hay eventos anteriores registrados.' : 'Muy pronto tendremos nuevas experiencias para descubrir Nicaragua.'));
    return box;
  }
  function skeleton(n) {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < n; i += 1) { var s = el('div', 'bq-ev-card is-skeleton'); s.setAttribute('aria-hidden', 'true'); frag.append(s); }
    return frag;
  }

  // ------------------------------------------------------------------ index (carrusel)
  function mountHome(section) {
    if (!section || section.__bqEvents) return;
    section.__bqEvents = true;
    var track = section.querySelector('[data-ev-track]');
    var status = section.querySelector('[data-ev-status]');
    var prev = section.querySelector('[data-ev-prev]');
    var next = section.querySelector('[data-ev-next]');
    var data = null;
    function paintArrows() {
      if (!prev || !next) return;
      var max = track.scrollWidth - track.clientWidth - 2;
      var scrollable = max > 0;
      prev.hidden = next.hidden = !scrollable;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
    }
    function paint() {
      track.replaceChildren();
      if (!data) return;
      if (!data.length) { track.append(emptyState('upcoming')); track.classList.add('is-empty'); paintArrows(); return; }
      track.classList.remove('is-empty');
      data.forEach(function (e) { track.append(card(e)); });
      if (status) status.textContent = t('countAria', '{n} próximos eventos', { n: data.length });
      paintArrows();
    }
    function step(dir) {
      var c = track.querySelector('.bq-ev-card');
      var w = c ? c.getBoundingClientRect().width + 20 : track.clientWidth;
      track.scrollBy({ left: dir * w, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(paintArrows); }, { passive: true });
    window.addEventListener('resize', paintArrows);
    track.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowRight') { ev.preventDefault(); step(1); }
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); step(-1); }
    });
    function load() {
      track.replaceChildren(skeleton(3));
      list({ scope: 'upcoming', limit: 6 }).then(function (d) { data = d.events || []; paint(); })
        .catch(function () {
          // Sin servicio: estado vacío honesto (nunca eventos de ejemplo).
          data = []; paint();
        });
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (en) { return en.isIntersecting; })) { io.disconnect(); load(); }
      }, { rootMargin: '600px 0px' });
      io.observe(section);
    } else load();
    window.addEventListener('baqueano:languageChanged', paint);
  }

  // ------------------------------------------------------------------ página completa con filtros
  function mountAgenda(root) {
    if (!root || root.__bqEvents) return;
    root.__bqEvents = true;
    var params = new URLSearchParams(window.location.search);
    var state = {
      scope: params.get('ver') === 'anteriores' ? 'past' : 'upcoming',
      category: CATEGORIES.indexOf(params.get('categoria')) !== -1 ? params.get('categoria') : '',
      department: DEPARTMENTS[params.get('departamento')] ? params.get('departamento') : '',
      from: /^\d{4}-\d{2}-\d{2}$/.test(params.get('desde') || '') ? params.get('desde') : '',
      to: /^\d{4}-\d{2}-\d{2}$/.test(params.get('hasta') || '') ? params.get('hasta') : '',
      page: 0, items: [], hasMore: false, loading: false
    };
    var form = el('form', 'bq-ev-filters');
    form.setAttribute('aria-label', t('filtersAria', 'Filtrar eventos'));
    function field(id, key, fallback, control) {
      var w = el('div', 'bq-ev-field');
      var l = el('label', null, t(key, fallback)); l.htmlFor = id; l.setAttribute('data-i18n', 'events.' + key);
      control.id = id;
      w.append(l, control);
      return w;
    }
    var scope = el('div', 'bq-ev-scope');
    scope.setAttribute('role', 'group');
    scope.setAttribute('aria-label', t('scopeAria', 'Qué eventos mostrar'));
    [['upcoming', 'scopeUpcoming', 'Próximos'], ['past', 'scopePast', 'Anteriores']].forEach(function (s) {
      var b = el('button', 'bq-ev-chip', t(s[1], s[2]));
      b.type = 'button';
      b.setAttribute('aria-pressed', String(state.scope === s[0]));
      b.addEventListener('click', function () {
        state.scope = s[0];
        scope.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        reload();
      });
      scope.append(b);
    });
    var cat = el('select');
    var o0 = el('option', null, t('allCategories', 'Todas las categorías')); o0.value = ''; cat.append(o0);
    CATEGORIES.forEach(function (c) { var o = el('option', null, catLabel(c)); o.value = c; cat.append(o); });
    cat.value = state.category;
    var dep = el('select');
    var d0 = el('option', null, t('allDepartments', 'Todo el país')); d0.value = ''; dep.append(d0);
    Object.keys(DEPARTMENTS).forEach(function (k) { var o = el('option', null, DEPARTMENTS[k]); o.value = k; dep.append(o); });
    dep.value = state.department;
    var from = el('input'); from.type = 'date'; from.value = state.from;
    var to = el('input'); to.type = 'date'; to.value = state.to;
    var clear = el('button', 'bq-ev-link', t('clearFilters', 'Quitar filtros'));
    clear.type = 'button';
    form.append(scope, field('evCat', 'category', 'Categoría', cat), field('evDep', 'department', 'Departamento', dep),
      field('evFrom', 'from', 'Desde', from), field('evTo', 'to', 'Hasta', to), clear);
    [cat, dep, from, to].forEach(function (c) { c.addEventListener('change', reload); });
    clear.addEventListener('click', function () { cat.value = ''; dep.value = ''; from.value = ''; to.value = ''; reload(); });
    form.addEventListener('submit', function (ev) { ev.preventDefault(); reload(); });

    var count = el('p', 'bq-ev-count');
    count.setAttribute('role', 'status');
    count.setAttribute('aria-live', 'polite');
    var grid = el('div', 'bq-ev-grid');
    var more = el('button', 'bq-ev-btn is-ghost bq-ev-more', t('more', 'Ver más eventos'));
    more.type = 'button';
    more.hidden = true;
    more.addEventListener('click', function () { state.page += 1; fetchPage(); });
    root.replaceChildren(form, count, grid, more);

    function syncUrl() {
      var q = new URLSearchParams();
      if (state.scope === 'past') q.set('ver', 'anteriores');
      if (state.category) q.set('categoria', state.category);
      if (state.department) q.set('departamento', state.department);
      if (state.from) q.set('desde', state.from);
      if (state.to) q.set('hasta', state.to);
      try { history.replaceState(null, '', window.location.pathname + (q.toString() ? '?' + q : '')); } catch (_) { /* nada */ }
    }
    function paint() {
      grid.replaceChildren();
      if (!state.items.length && !state.loading) grid.append(emptyState(state.scope));
      state.items.forEach(function (e) { grid.append(card(e)); });
      more.hidden = !state.hasMore;
      count.textContent = state.loading && !state.items.length ? t('loading', 'Cargando eventos…')
        : state.items.length === 1 ? t('countOne', '1 evento') : t('countMany', '{n} eventos', { n: state.items.length + (state.hasMore ? '+' : '') });
    }
    function fetchPage() {
      state.loading = true;
      if (!state.items.length) { grid.replaceChildren(skeleton(3)); count.textContent = t('loading', 'Cargando eventos…'); }
      more.disabled = true;
      list({ scope: state.scope, category: state.category || undefined, departmentId: state.department || undefined,
        from: state.from || undefined, to: state.to || undefined, page: state.page, limit: 12 })
        .then(function (d) { state.items = state.items.concat(d.events || []); state.hasMore = !!d.hasMore; })
        .catch(function () { state.hasMore = false; count.textContent = t('error', 'No pudimos cargar la agenda. Probá de nuevo más tarde.'); })
        .then(function () { state.loading = false; more.disabled = false; paint(); });
    }
    function reload() {
      state.category = cat.value; state.department = dep.value; state.from = from.value; state.to = to.value;
      state.page = 0; state.items = [];
      syncUrl();
      fetchPage();
    }
    fetchPage();
    window.addEventListener('baqueano:languageChanged', function () {
      cat.querySelectorAll('option').forEach(function (o) { o.textContent = o.value ? catLabel(o.value) : t('allCategories', 'Todas las categorías'); });
      d0.textContent = t('allDepartments', 'Todo el país');
      paint();
    });
  }

  // ------------------------------------------------------------------ .ics (RFC 5545)
  function icsEscape(s) { return String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
  function icsFold(line) {
    var out = [], bytes = new TextEncoder().encode(line);
    if (bytes.length <= 75) return line;
    var cur = '', curLen = 0;
    Array.from(line).forEach(function (ch) {
      var n = new TextEncoder().encode(ch).length;
      if (curLen + n > (out.length ? 74 : 75)) { out.push(cur); cur = ''; curLen = 0; }
      cur += ch; curLen += n;
    });
    out.push(cur);
    return out.join('\r\n ');
  }
  function icsUtc(iso) { return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
  function icsDate(iso, plusDays) {
    var d = localDate(iso).split('-').map(Number);
    var dt = new Date(Date.UTC(d[0], d[1] - 1, d[2] + (plusDays || 0)));
    return dt.toISOString().slice(0, 10).replace(/-/g, '');
  }
  function ics(e) {
    var url = window.location.origin + '/evento.html?e=' + encodeURIComponent(e.slug);
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//BAQUEANO Nicaragua//Agenda//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
      'UID:' + e.id + '@baqueanonicaragua.com', 'DTSTAMP:' + icsUtc(new Date().toISOString())];
    if (e.time_confirmed) {
      lines.push('DTSTART:' + icsUtc(e.start_at));
      if (e.end_at) lines.push('DTEND:' + icsUtc(e.end_at));
    } else {
      // Hora sin confirmar: evento de día completo (no se inventa una hora).
      lines.push('DTSTART;VALUE=DATE:' + icsDate(e.start_at));
      lines.push('DTEND;VALUE=DATE:' + icsDate(e.end_at || e.start_at, 1));
    }
    lines.push('SUMMARY:' + icsEscape(e.title));
    var where = e.modality === 'virtual' ? (safeUrl(e.virtual_url) || t('virtual', 'En línea')) : [e.location_name, e.address, DEPARTMENTS[e.department_id], 'Nicaragua'].filter(Boolean).join(', ');
    lines.push('LOCATION:' + icsEscape(where));
    if (canRoute(e)) lines.push('GEO:' + Number(e.latitude).toFixed(6) + ';' + Number(e.longitude).toFixed(6));
    lines.push('DESCRIPTION:' + icsEscape([e.short_description, e.time_confirmed ? '' : t('timeTbc', 'Horario por confirmar'), url].filter(Boolean).join('\n')));
    lines.push('URL:' + url);
    lines.push('STATUS:' + (e.event_status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'));
    lines.push('END:VEVENT', 'END:VCALENDAR');
    return lines.map(icsFold).join('\r\n') + '\r\n';
  }
  function downloadIcs(e) {
    var blob = new Blob([ics(e)], { type: 'text/calendar;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (e.slug || 'evento') + '.ics';
    document.body.appendChild(a);
    a.click();
    window.setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  // ------------------------------------------------------------------ Schema.org Event (solo datos reales)
  function jsonLd(e) {
    var status = { cancelled: 'EventCancelled', rescheduled: 'EventRescheduled', postponed: 'EventPostponed' }[e.event_status] || 'EventScheduled';
    var mode = { virtual: 'OnlineEventAttendanceMode', hibrido: 'MixedEventAttendanceMode' }[e.modality] || 'OfflineEventAttendanceMode';
    var data = {
      '@context': 'https://schema.org', '@type': 'Event', name: e.title,
      startDate: e.time_confirmed ? e.start_at : localDate(e.start_at),
      eventStatus: 'https://schema.org/' + status, eventAttendanceMode: 'https://schema.org/' + mode,
      url: window.location.origin + '/evento.html?e=' + encodeURIComponent(e.slug)
    };
    if (e.end_at) data.endDate = e.time_confirmed ? e.end_at : localDate(e.end_at);
    if (e.rescheduled_from) data.previousStartDate = e.rescheduled_from;
    if (e.description || e.short_description) data.description = e.short_description || String(e.description).slice(0, 300);
    if (safeUrl(e.cover_image)) data.image = [e.cover_image];
    var locs = [];
    if (e.modality !== 'virtual') {
      var place = { '@type': 'Place', name: e.location_name, address: { '@type': 'PostalAddress', addressCountry: 'NI' } };
      if (DEPARTMENTS[e.department_id]) place.address.addressRegion = DEPARTMENTS[e.department_id];
      if (e.address) place.address.streetAddress = e.address;
      if (canRoute(e)) place.geo = { '@type': 'GeoCoordinates', latitude: e.latitude, longitude: e.longitude };
      locs.push(place);
    }
    if (e.modality !== 'presencial' && safeUrl(e.virtual_url)) locs.push({ '@type': 'VirtualLocation', url: e.virtual_url });
    if (locs.length) data.location = locs.length === 1 ? locs[0] : locs;
    if (e.organizer_name) data.organizer = { '@type': 'Organization', name: e.organizer_name, url: safeUrl(e.organizer_url) || undefined };
    if (e.access_type === 'free') data.isAccessibleForFree = true;
    if (e.access_type === 'paid' && e.price != null && e.currency) {
      data.offers = { '@type': 'Offer', price: String(e.price), priceCurrency: e.currency, url: safeUrl(e.registration_url) || safeUrl(e.official_url) || undefined };
    }
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.id = 'bqEventJsonLd';
    s.textContent = JSON.stringify(data);
    var old = document.getElementById('bqEventJsonLd');
    if (old) old.remove();
    document.head.appendChild(s);
  }
  function setMeta(name, value, prop) {
    var sel = prop ? 'meta[property="' + name + '"]' : 'meta[name="' + name + '"]';
    var m = document.querySelector(sel);
    if (!m) { m = document.createElement('meta'); m.setAttribute(prop ? 'property' : 'name', name); document.head.appendChild(m); }
    m.setAttribute('content', value);
  }

  // ------------------------------------------------------------------ ficha
  function mountDetail(root, slug) {
    if (!root) return Promise.resolve(false);
    slug = String(slug || '').toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]{2,119}$/.test(slug)) { notFound(root); return Promise.resolve(false); }
    root.replaceChildren(i18nText('p', 'bq-ev-loading', 'loadingOne', 'Cargando el evento…'));
    return get(slug).then(function (e) {
      buildDetail(root, e);
      if (!root.__bqLang) { root.__bqLang = true; window.addEventListener('baqueano:languageChanged', function () { if (root.__bqEvent) buildDetail(root, root.__bqEvent); }); }
      root.__bqEvent = e;
      return true;
    })
      .catch(function (err) { if (err.status === 404) notFound(root); else errorBox(root); return false; });
  }
  function notFound(root) {
    root.replaceChildren();
    var box = el('div', 'bq-ev-empty');
    box.append(icon('fa-calendar-xmark'), i18nText('h1', null, 'notFound', 'No encontramos ese evento'),
      i18nText('p', null, 'notFoundBody', 'Puede que todavía no esté publicado o que el enlace esté incompleto.'));
    var a = el('a', 'bq-ev-btn', t('allEvents', 'Ver todos los eventos')); a.href = 'eventos.html';
    box.append(a);
    root.append(box);
  }
  function errorBox(root) {
    root.replaceChildren();
    var box = el('div', 'bq-ev-empty');
    box.append(icon('fa-plug-circle-xmark'), i18nText('p', null, 'error', 'No pudimos cargar la agenda. Probá de nuevo más tarde.'));
    root.append(box);
  }
  function section(key, fallback, iconName) {
    var s = el('section', 'bq-ev-section');
    var h = el('h2'); h.append(icon(iconName), ' ');
    var label = el('span', null, t(key, fallback)); label.setAttribute('data-i18n', 'events.' + key);
    h.append(label);
    s.append(h);
    return s;
  }
  function buildDetail(root, e) {
    root.replaceChildren();
    var art = el('article', 'bq-ev-detail is-' + e.time_state);
    var hero = el('header', 'bq-ev-hero');
    var img = safeUrl(e.cover_image);
    if (img) {
      var im = el('img', 'bq-ev-hero-img');
      im.src = img; im.alt = e.image_alt || e.title; im.decoding = 'async'; im.width = 1200; im.height = 630;
      hero.append(im);
      if (e.image_credit) hero.append(el('span', 'bq-ev-credit', '© ' + e.image_credit));
    }
    var text = el('div', 'bq-ev-hero-text');
    var chips = el('div', 'bq-ev-chips');
    var cat = el('span', 'bq-ev-cat'); cat.append(icon(CATEGORY_ICONS[e.category] || 'fa-calendar'), ' ', catLabel(e.category));
    chips.append(cat, el('span', 'bq-ev-state is-' + e.time_state, stateLabel(e.time_state)));
    var h1 = el('h1', 'bq-ev-h1', e.title); h1.setAttribute('translate', 'no');
    text.append(chips, h1);
    hero.append(text);
    art.append(hero);

    if (e.event_status === 'cancelled' || e.event_status === 'rescheduled' || e.event_status === 'postponed') {
      var alert = el('div', 'bq-ev-alert is-' + e.event_status);
      alert.setAttribute('role', 'status');
      var msg = e.event_status === 'cancelled' ? t('alertCancelled', 'Este evento fue cancelado por el organizador.')
        : e.event_status === 'postponed' ? t('alertPostponed', 'Este evento fue pospuesto. La nueva fecha está por confirmar.')
          : t('alertRescheduled', 'Cambió la fecha. Antes era el {date}.', { date: fmt(e.rescheduled_from, { day: 'numeric', month: 'long', year: 'numeric' }) });
      alert.append(icon('fa-triangle-exclamation'), ' ', el('span', null, msg));
      if (e.status_note) { var note = el('p', null, e.status_note); note.setAttribute('lang', 'es'); alert.append(note); }
      art.append(alert);
    }

    // Datos clave
    var facts = el('dl', 'bq-ev-facts');
    function fact(iconName, key, fallback, value, translateNo) {
      var dt = el('dt'); dt.append(icon(iconName), ' ', t(key, fallback));
      var dd = el('dd', null, value); if (translateNo) dd.setAttribute('translate', 'no');
      facts.append(dt, dd);
    }
    fact('fa-calendar-day', 'factDate', 'Fecha', whenText(e, true));
    fact('fa-clock', 'factTime', 'Horario', timeText(e) + (e.time_confirmed ? ' ' + t('nicaraguaTime', '(hora de Nicaragua)') : ''));
    fact(e.modality === 'virtual' ? 'fa-globe' : 'fa-location-dot', 'factPlace', 'Lugar', whereText(e) + (e.address ? ' — ' + e.address : ''), true);
    if (e.organizer_name) fact('fa-user-tie', 'factOrganizer', 'Organiza', e.organizer_name, true);
    fact('fa-ticket', 'factAccess', 'Entrada', e.access_type === 'free' ? t('free', 'Gratuita')
      : e.access_type === 'paid' ? (e.price != null && e.currency ? new Intl.NumberFormat(locale(), { style: 'currency', currency: e.currency, maximumFractionDigits: 2 }).format(e.price) : t('paidTbc', 'Con costo (monto por confirmar con el organizador)'))
        : t('accessTbc', 'Por confirmar'));
    art.append(facts);

    // Acciones
    var actions = el('div', 'bq-ev-actions is-detail');
    var live = e.time_state !== 'cancelled' && e.time_state !== 'finished';
    if (canRoute(e) && live) {
      var route = el('button', 'bq-ev-btn');
      route.type = 'button';
      route.setAttribute('data-bq-route', '');
      route.setAttribute('data-lat', String(e.latitude));
      route.setAttribute('data-lng', String(e.longitude));
      route.setAttribute('data-precision', 'exact');
      if (img) route.setAttribute('data-image', img);
      route.append(icon('fa-diamond-turn-right'), ' ', t('directions', 'Cómo llegar'));
      actions.append(route);
    }
    if (live && e.start_at) {
      var cal = el('button', 'bq-ev-btn is-ghost');
      cal.type = 'button';
      cal.append(icon('fa-calendar-plus'), ' ', t('addCalendar', 'Añadir a mi calendario'));
      cal.addEventListener('click', function () { downloadIcs(e); });
      actions.append(cal);
    }
    if (window.BaqueanoTrip && live) {
      var trip = el('button', 'bq-ev-btn is-ghost');
      trip.type = 'button';
      var tripId = 'evento-' + e.slug;
      var paintTrip = function () {
        var saved = window.BaqueanoTrip.has(tripId);
        trip.replaceChildren(icon(saved ? 'fa-check' : 'fa-suitcase-rolling'), ' ', saved ? t('inTrip', 'En Mi Viaje') : t('addTrip', 'Agregar a Mi Viaje'));
        trip.setAttribute('aria-pressed', String(saved));
      };
      trip.addEventListener('click', function () {
        if (window.BaqueanoTrip.has(tripId)) window.BaqueanoTrip.remove(tripId);
        else window.BaqueanoTrip.add({ destId: tripId, name: e.title, location: whereText(e), desc: whenText(e, false) + ' · ' + timeText(e),
          lat: canRoute(e) ? e.latitude : null, lng: canRoute(e) ? e.longitude : null, link: 'evento.html?e=' + encodeURIComponent(e.slug), image: img });
        paintTrip();
      });
      paintTrip();
      actions.append(trip);
    }
    var share = el('button', 'bq-ev-btn is-ghost');
    share.type = 'button';
    share.append(icon('fa-share-nodes'), ' ', t('share', 'Compartir'));
    share.addEventListener('click', function () {
      var url = window.location.origin + '/evento.html?e=' + encodeURIComponent(e.slug);
      if (navigator.share) { navigator.share({ title: e.title, url: url }).catch(function () { /* cancelado */ }); return; }
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { share.lastChild.textContent = t('copied', 'Enlace copiado'); });
    });
    actions.append(share);
    art.append(actions);
    if (lang() !== 'es') art.append(i18nText('p', 'bq-ev-langnote', 'spanishOnly', 'La información del evento está en su idioma original (español).'));

    if (e.description) { var about = section('about', 'Sobre el evento', 'fa-book-open'); var p = el('p', null, e.description); p.setAttribute('lang', 'es'); about.append(p); art.append(about); }
    if (Array.isArray(e.program) && e.program.length) {
      var prog = section('program', 'Programa', 'fa-list-ol');
      var ol = el('ol', 'bq-ev-program');
      e.program.forEach(function (it) {
        var li = el('li');
        var when = [it.date ? fmt(it.date + 'T12:00:00-06:00', { weekday: 'short', day: 'numeric', month: 'short' }) : '', it.time || ''].filter(Boolean).join(' · ');
        if (when) li.append(el('strong', null, when), ' ');
        var w = el('span', null, it.what); w.setAttribute('lang', 'es'); li.append(w);
        ol.append(li);
      });
      prog.append(ol);
      art.append(prog);
    }
    if (e.recommendations) { var rec = section('tips', 'Recomendaciones', 'fa-lightbulb'); var rp = el('p', null, e.recommendations); rp.setAttribute('lang', 'es'); rec.append(rp); art.append(rec); }

    // Enlaces oficiales (BAQUEANO no vende entradas ni hace reservas)
    var links = [];
    if (safeUrl(e.registration_url)) links.push(['regLink', 'Inscripción o entradas (servicio del organizador)', e.registration_url, 'fa-ticket']);
    if (safeUrl(e.official_url)) links.push(['officialLink', 'Sitio oficial del evento', e.official_url, 'fa-globe']);
    if (safeUrl(e.organizer_url)) links.push(['organizerLink', 'Sitio del organizador', e.organizer_url, 'fa-building']);
    if (e.modality !== 'presencial' && safeUrl(e.virtual_url)) links.push(['virtualLink', 'Transmisión en línea', e.virtual_url, 'fa-video']);
    if (links.length || e.contact_info) {
      var info = section('contact', 'Contacto y enlaces oficiales', 'fa-address-book');
      var ul = el('ul', 'bq-ev-links');
      links.forEach(function (l) {
        var li = el('li'); var a = el('a'); a.href = l[2]; a.target = '_blank'; a.rel = 'noopener noreferrer';
        a.setAttribute('data-bq-keep-external', '');
        a.append(icon(l[3]), ' ', t(l[0], l[1]), ' ', icon('fa-arrow-up-right-from-square'));
        li.append(a); ul.append(li);
      });
      if (e.contact_info) { var c = el('li', null, e.contact_info); c.setAttribute('translate', 'no'); ul.append(c); }
      info.append(ul, i18nText('p', 'bq-ev-small', 'noTickets', 'BAQUEANO no vende entradas ni hace reservas: las inscripciones son del organizador.'));
      art.append(info);
    }
    var src = section('source', 'Fuente de la información', 'fa-book-bookmark');
    var sp = el('p');
    if (e.source_name) {
      if (safeUrl(e.source_url)) { var sa = el('a', null, e.source_name); sa.href = e.source_url; sa.target = '_blank'; sa.rel = 'noopener noreferrer'; sa.setAttribute('data-bq-keep-external', ''); sp.append(sa); }
      else sp.append(e.source_name);
    }
    if (e.updated_at) sp.append(' · ', t('updatedOn', 'actualizado el {date}', { date: fmt(e.updated_at, { day: 'numeric', month: 'long', year: 'numeric' }) }));
    src.append(sp);
    art.append(src);

    root.append(art);
    document.title = e.title + ' | Agenda BAQUEANO';
    var desc = e.short_description || String(e.description || '').slice(0, 160);
    if (desc) { setMeta('description', desc); setMeta('og:description', desc, true); }
    setMeta('og:title', e.title, true);
    setMeta('og:type', 'event', true);
    if (img) setMeta('og:image', img, true);
    jsonLd(e);
  }

  function autoMount() {
    var home = document.querySelector('[data-bq-events-home]');
    if (home) mountHome(home);
    var agenda = document.querySelector('[data-bq-events-agenda]');
    if (agenda) mountAgenda(agenda);
    var detail = document.querySelector('[data-bq-events-detail]');
    if (detail) mountDetail(detail, new URLSearchParams(window.location.search).get('e'));
  }

  window.BaqueanoEvents = { list: list, get: get, mountHome: mountHome, mountAgenda: mountAgenda, mountDetail: mountDetail, ics: ics, categories: CATEGORIES };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoMount);
  else autoMount();
})(window, document);
