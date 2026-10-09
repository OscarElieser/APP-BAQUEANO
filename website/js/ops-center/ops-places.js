// ============================================================================
// 🧭 BAQUEANO — OPS CENTER: LUGARES (ops-places.js)
// ============================================================================
// 🎯 POR QUÉ:
// - Auditoría 2026-10-07 (docs/ops-center/OPS_CENTER_AUDIT_2026-10-07.md, A08/A09): los 237 lugares
//   de `places` alimentan la web, el mapa y BAQUI, pero el Ops Center no tenía cómo gestionarlos.
//   La consulta real dio 108 sin municipio, 141 sin fuente y 40 sin coordenadas.
// - PROMPT MAESTRO §12 y §127: crear, editar, ubicar, citar la fuente, verificar, publicar y archivar
//   un lugar sin tocar código.
//
// ⚙️ CÓMO:
// - Todo pasa por la Edge Function baqueano-ops, con el token de Firebase de la sesión. El servidor
//   decide el rol (auditor lee; admin y super_admin escriben), valida cada campo (coordenadas dentro
//   de Nicaragua, municipio que pertenezca al departamento, URL https) y deja auditoría con el
//   antes y el después. El navegador nunca usa claves de servicio.
// - Paginación en el servidor (25 por página) y filtros de calidad (`quality`) resueltos en SQL.
//   Los contadores de cada filtro salen del total real de esa consulta, nunca de un valor fijo.
// - Nada se completa solo: si falta municipio, fuente o coordenadas, se muestra el faltante para
//   que una persona lo cargue con su fuente.
// - Archivar no borra: el lugar deja de verse en la web (is_published = false) y se puede restaurar.
// - Todo se pinta con textContent. Textos opsPlaces.* con respaldo en español.
//
// 📦 QUÉ: window.BaqueanoOpsPlaces = { render(panel), refresh() } para la vista 43-lugares.
// ============================================================================
(function (window, document) {
  'use strict';
  if (window.BaqueanoOpsPlaces) return;

  var PAGE = 25;
  var QUALITY = [
    ['', 'opsPlaces.q.all', 'Todos'],
    ['no_municipality', 'opsPlaces.q.noMunicipality', 'Sin municipio'],
    ['no_source', 'opsPlaces.q.noSource', 'Sin fuente'],
    ['no_coords', 'opsPlaces.q.noCoords', 'Sin coordenadas'],
    ['unverified', 'opsPlaces.q.unverified', 'Sin verificar'],
    ['verified', 'opsPlaces.q.verified', 'Verificados'],
    ['unpublished', 'opsPlaces.q.unpublished', 'No publicados'],
    ['archived', 'opsPlaces.q.archived', 'Archivados']
  ];
  var state = {
    panel: null, quality: '', q: '', department: '', page: 0, items: [], total: null, counts: {},
    departments: [], municipalities: [], loadedAt: null, error: '', notice: '', busy: false, dialog: null
  };
  var searchTimer = null;
  var requestSeq = 0;

  function tr(key, fallback, vars) {
    var out = fallback;
    try { if (window.BaqueanoLanguage && window.BaqueanoLanguage.t) out = window.BaqueanoLanguage.t(key, Object.assign({ fallback: fallback }, vars || {})) || fallback; } catch (_) { /* sin motor i18n */ }
    return String(out).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; });
  }
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'text') n.textContent = v; else if (k === 'className') n.className = v; else n.setAttribute(k, v === true ? '' : v);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function icon(name) { var i = el('i', { className: 'fa-solid ' + name }); i.setAttribute('aria-hidden', 'true'); return i; }
  function api() { return window.BaqueanoOpsData; }
  function canWrite() { return !!(api() && api().state && api().state.canWrite); }
  function call(action, payload) {
    if (!api() || typeof api().call !== 'function') return Promise.reject(new Error(tr('opsPlaces.noApi', 'El Ops Center todavía no está conectado. Iniciá sesión.')));
    return api().call(action, payload);
  }
  function deptName(id) { var d = state.departments.find(function (x) { return x.id === id; }); return d ? d.name : (id || ''); }
  function muniName(id) { var m = state.municipalities.find(function (x) { return x.id === id; }); return m ? m.name : (id || ''); }
  function hasSource(p) { return !!((p.source_name && p.source_name.trim()) || (p.source_url && p.source_url.trim())); }
  function hasCoords(p) { return Number.isFinite(Number(p.latitude)) && Number.isFinite(Number(p.longitude)) && p.latitude !== null && p.longitude !== null; }
  function errText(e) { return (e && e.message) || tr('opsPlaces.error', 'No se pudo completar la operación.'); }

  // ---------------------------------------------------------------- datos
  function listPayload(quality, page, limit) {
    var p = { entity: 'places', page: page, limit: limit };
    if (quality === 'archived') p.archived = true; else if (quality) p.quality = quality;
    if (state.q) p.q = state.q;
    if (state.department) p.department_id = state.department;
    return p;
  }

  function loadTerritories() {
    if (state.departments.length) return Promise.resolve();
    var all = [];
    function muniPage(page) {
      return call('list', { entity: 'municipalities', limit: 100, page: page }).then(function (r) {
        all = all.concat(r.items || []);
        if ((r.items || []).length === 100 && all.length < (r.total || 0)) return muniPage(page + 1);
        return null;
      });
    }
    return Promise.all([
      call('list', { entity: 'departments', limit: 100, page: 0 }).then(function (r) { state.departments = r.items || []; }),
      muniPage(0).then(function () { state.municipalities = all; })
    ]);
  }

  function refresh() {
    if (!state.panel) return;
    var seq = ++requestSeq;
    state.busy = true; state.error = '';
    paint();
    loadTerritories()
      .then(function () {
        return Promise.all([
          call('list', listPayload(state.quality, state.page, PAGE)),
          // Contadores reales de cada filtro (solo el total; 1 fila por consulta).
          Promise.all(QUALITY.map(function (q) {
            return call('list', listPayload(q[0], 0, 1)).then(function (r) { return [q[0], r.total]; }, function () { return [q[0], null]; });
          }))
        ]);
      })
      .then(function (res) {
        if (seq !== requestSeq) return;
        state.items = res[0].items || [];
        state.total = res[0].total;
        state.counts = {};
        res[1].forEach(function (pair) { state.counts[pair[0]] = pair[1]; });
        state.loadedAt = new Date();
      }, function (e) { if (seq === requestSeq) { state.error = errText(e); state.items = []; state.total = null; } })
      .then(function () { if (seq === requestSeq) { state.busy = false; paint(); } });
  }

  // ---------------------------------------------------------------- vista
  function header() {
    var actions = [];
    var reload = el('button', { type: 'button', className: 'ops-btn' }, [icon('fa-rotate'), ' ' + tr('opsPlaces.refresh', 'Actualizar')]);
    reload.addEventListener('click', refresh);
    actions.push(reload);
    if (canWrite()) {
      var add = el('button', { type: 'button', className: 'ops-btn ops-btn-primary', 'data-ops-places-new': '' }, [icon('fa-plus'), ' ' + tr('opsPlaces.new', 'Nuevo lugar')]);
      add.addEventListener('click', function () { openEditor(null); });
      actions.push(add);
    }
    var source = state.loadedAt
      ? tr('opsPlaces.source', 'Fuente: Supabase · places · actualizado {time}', { time: state.loadedAt.toLocaleTimeString() })
      : tr('opsPlaces.sourcePending', 'Fuente: Supabase · places · cargando…');
    return el('div', { className: 'ops-view-header' }, [
      el('div', { className: 'ops-view-title-group' }, [
        el('h1', {}, [icon('fa-location-dot'), ' ' + tr('opsPlaces.title', 'Lugares')]),
        el('p', { className: 'ops-view-subtitle', text: tr('opsPlaces.subtitle', 'Los lugares que ven la web, el mapa y BAQUI. Completá lo que falte con su fuente: nada se rellena solo.') }),
        el('p', { className: 'ops-places-source', text: source })
      ]),
      el('div', { className: 'ops-view-actions' }, actions)
    ]);
  }

  function chips() {
    var wrap = el('div', { className: 'ops-places-chips', role: 'group', 'aria-label': tr('opsPlaces.qualityLabel', 'Filtrar por calidad de datos') });
    QUALITY.forEach(function (q) {
      var n = state.counts[q[0]];
      var b = el('button', { type: 'button', className: 'ops-places-chip' + (state.quality === q[0] ? ' is-active' : ''), 'aria-pressed': state.quality === q[0] ? 'true' : 'false', 'data-quality': q[0] }, [
        tr(q[1], q[2]), ' ', el('span', { className: 'ops-places-chip-n', text: n == null ? '—' : String(n) })
      ]);
      b.addEventListener('click', function () { state.quality = q[0]; state.page = 0; refresh(); });
      wrap.appendChild(b);
    });
    return wrap;
  }

  function filters() {
    var search = el('input', { type: 'search', className: 'ops-form-input', id: 'opsPlacesSearch', value: state.q, placeholder: tr('opsPlaces.searchPh', 'Buscar por nombre…'), autocomplete: 'off' });
    search.addEventListener('input', function () {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(function () { state.q = search.value.trim(); state.page = 0; refresh(); }, 350);
    });
    var dept = el('select', { className: 'ops-form-input', id: 'opsPlacesDept' }, [el('option', { value: '', text: tr('opsPlaces.allDepts', 'Todos los territorios') })]);
    state.departments.forEach(function (d) { dept.appendChild(el('option', { value: d.id, text: d.name, selected: state.department === d.id ? 'selected' : null })); });
    dept.addEventListener('change', function () { state.department = dept.value; state.page = 0; refresh(); });
    return el('div', { className: 'ops-places-filters' }, [
      el('label', { className: 'ops-places-field', for: 'opsPlacesSearch' }, [el('span', { text: tr('opsPlaces.search', 'Buscar') }), search]),
      el('label', { className: 'ops-places-field', for: 'opsPlacesDept' }, [el('span', { text: tr('opsPlaces.territory', 'Territorio') }), dept])
    ]);
  }

  function flag(ok, okText, badText) {
    return el('span', { className: 'ops-places-flag ' + (ok ? 'is-ok' : 'is-missing') }, [icon(ok ? 'fa-circle-check' : 'fa-triangle-exclamation'), ' ' + (ok ? okText : badText)]);
  }

  function table() {
    if (state.error) return el('p', { className: 'ops-places-error', role: 'alert' }, [icon('fa-circle-exclamation'), ' ' + state.error]);
    if (state.busy && !state.items.length) return el('p', { className: 'ops-places-empty', role: 'status', text: tr('opsPlaces.loading', 'Cargando lugares desde Supabase…') });
    if (!state.items.length) return el('p', { className: 'ops-places-empty', role: 'status', text: tr('opsPlaces.empty', 'No hay lugares con este filtro.') });
    var tbody = el('tbody');
    state.items.forEach(function (p) {
      var name = el('button', { type: 'button', className: 'ops-places-name', 'data-place-id': p.id }, [p.name]);
      name.addEventListener('click', function () { openEditor(p); });
      var terr = el('td', {}, [deptName(p.department_id) || '—', el('br'), p.municipality_id ? el('small', { text: muniName(p.municipality_id) }) : flag(false, '', tr('opsPlaces.noMunicipality', 'Sin municipio'))]);
      var pub = p.archived_at ? tr('opsPlaces.archived', 'Archivado') : (p.is_published ? tr('opsPlaces.published', 'Publicado') : tr('opsPlaces.draft', 'Borrador'));
      tbody.appendChild(el('tr', {}, [
        el('td', {}, [name, el('br'), el('small', { text: [p.category, p.subcategory].filter(Boolean).join(' · ') || '—' })]),
        terr,
        el('td', {}, [flag(hasCoords(p), tr('opsPlaces.coordsOk', 'Ubicado'), tr('opsPlaces.noCoords', 'Sin coordenadas'))]),
        el('td', {}, [hasSource(p) ? el('span', { text: p.source_name || p.source_url }) : flag(false, '', tr('opsPlaces.noSource', 'Sin fuente'))]),
        el('td', {}, [flag(p.verification_status === 'verified', tr('opsPlaces.verified', 'Verificado'), tr('opsPlaces.unverified', 'Sin verificar'))]),
        el('td', {}, [el('span', { className: 'ops-badge-status ' + (p.is_published && !p.archived_at ? 'published' : 'draft'), text: pub })]),
        el('td', {}, [rowActions(p)])
      ]));
    });
    var from = state.page * PAGE + 1, to = state.page * PAGE + state.items.length;
    var prev = el('button', { type: 'button', className: 'ops-btn', disabled: state.page === 0 ? 'disabled' : null }, [icon('fa-chevron-left'), ' ' + tr('opsPlaces.prev', 'Anterior')]);
    prev.addEventListener('click', function () { state.page -= 1; refresh(); });
    var next = el('button', { type: 'button', className: 'ops-btn', disabled: to >= (state.total || 0) ? 'disabled' : null }, [tr('opsPlaces.next', 'Siguiente') + ' ', icon('fa-chevron-right')]);
    next.addEventListener('click', function () { state.page += 1; refresh(); });
    return el('div', {}, [
      el('div', { className: 'ops-table-container-matte ops-places-table' }, [
        el('table', { className: 'ops-table-matte' }, [
          el('caption', { className: 'ops-sr-only', text: tr('opsPlaces.caption', 'Lugares del catálogo con su estado de calidad') }),
          el('thead', {}, [el('tr', {}, [
            tr('opsPlaces.colName', 'Lugar'), tr('opsPlaces.colTerritory', 'Territorio'), tr('opsPlaces.colLocation', 'Ubicación'),
            tr('opsPlaces.colSource', 'Fuente'), tr('opsPlaces.colVerification', 'Verificación'), tr('opsPlaces.colStatus', 'Estado'),
            tr('opsPlaces.colActions', 'Acciones')
          ].map(function (h) { return el('th', { scope: 'col', text: h }); }))]),
          tbody
        ])
      ]),
      el('div', { className: 'ops-places-pager' }, [
        prev,
        el('span', { role: 'status', text: tr('opsPlaces.range', '{from}–{to} de {total}', { from: from, to: to, total: state.total }) }),
        next
      ])
    ]);
  }

  function paint() {
    if (!state.panel) return;
    state.paintedCanWrite = canWrite();
    // 2026-10-09: replaceChildren(null) escribía el texto «null» debajo del encabezado
    // cuando no había aviso; ahora solo se pasan nodos reales.
    state.panel.replaceChildren.apply(state.panel, [
      header(),
      state.notice ? el('p', { className: 'ops-places-notice', role: 'status', text: state.notice }) : null,
      chips(),
      filters(),
      table()
    ].filter(Boolean));
  }

  // ---------------------------------------------------------------- acciones por fila
  // 2026-10-09 (pedido del propietario): agregar, modificar, suspender, verificar y eliminar
  // directamente desde la lista. Usan las mismas acciones auditadas del servidor:
  //  - Suspender/Activar = set_status unpublish/publish (deja de verse en la web y el mapa).
  //  - Eliminar = set_status archive: NO borra la fila (regla del proyecto); se restaura desde
  //    «Archivados». Pide confirmación en la misma fila.
  //  - Verificar abre la ficha en la sección de verificación, porque exige la fuente.
  function quick(action, place, payload, okText, buttons) {
    buttons.forEach(function (b) { b.disabled = true; });
    return call(action, Object.assign({ entity: 'places', id: place.id }, payload)).then(function () {
      state.notice = okText; refresh();
    }, function (err) {
      state.notice = errText(err); buttons.forEach(function (b) { b.disabled = false; }); paint();
    });
  }

  function rowActions(p) {
    var wrap = el('div', { className: 'ops-places-actions', role: 'group', 'aria-label': tr('opsPlaces.actionsFor', 'Acciones para {name}', { name: p.name }) });
    function btn(cls, iconName, label, title) {
      return el('button', { type: 'button', className: 'ops-row-btn ' + cls, title: title || label, 'aria-label': (title || label) + ' · ' + p.name }, [icon(iconName), el('span', { text: label })]);
    }
    var edit = btn('is-edit', canWrite() ? 'fa-pen-to-square' : 'fa-eye', canWrite() ? tr('opsPlaces.edit', 'Modificar') : tr('opsPlaces.view', 'Ver'));
    edit.addEventListener('click', function () { openEditor(p); });
    wrap.appendChild(edit);
    if (!canWrite()) return wrap;
    var all = [];
    if (p.archived_at) {
      var restore = btn('is-restore', 'fa-rotate-left', tr('opsPlaces.restore', 'Restaurar'));
      restore.addEventListener('click', function () { quick('set_status', p, { op: 'restore' }, tr('opsPlaces.restoredOk', 'Lugar restaurado como borrador.'), all); });
      all.push(restore);
    } else {
      var toggle = p.is_published
        ? btn('is-suspend', 'fa-circle-pause', tr('opsPlaces.suspend', 'Suspender'), tr('opsPlaces.suspendHint', 'Suspender: deja de verse en la web y el mapa'))
        : btn('is-activate', 'fa-circle-play', tr('opsPlaces.activate', 'Activar'), tr('opsPlaces.activateHint', 'Activar: se publica en la web y el mapa'));
      toggle.addEventListener('click', function () {
        quick('set_status', p, { op: p.is_published ? 'unpublish' : 'publish' }, p.is_published ? tr('opsPlaces.unpublishedOk', 'El lugar ya no se muestra en la web.') : tr('opsPlaces.publishedOk', 'El lugar se publicó en la web y el mapa.'), all);
      });
      var verified = p.verification_status === 'verified';
      var verify = btn(verified ? 'is-verified' : 'is-verify', verified ? 'fa-certificate' : 'fa-circle-check', verified ? tr('opsPlaces.verified', 'Verificado') : tr('opsPlaces.verify', 'Verificar'), verified ? tr('opsPlaces.unverify', 'Retirar verificación') : tr('opsPlaces.verify', 'Verificar'));
      verify.addEventListener('click', function () { openEditor(p, { focusVerify: true }); });
      var del = btn('is-delete', 'fa-trash-can', tr('opsPlaces.delete', 'Eliminar'), tr('opsPlaces.deleteHint', 'Eliminar: se archiva y se puede restaurar'));
      del.addEventListener('click', function () {
        if (del.dataset.confirm !== '1') {
          del.dataset.confirm = '1';
          del.classList.add('is-confirming');
          del.lastChild.textContent = tr('opsPlaces.confirm', 'Confirmar');
          state.notice = tr('opsPlaces.deleteConfirm', '¿Eliminar «{name}»? Se archiva: deja de verse en la web y el mapa, y podés restaurarlo desde «Archivados». Tocá «Confirmar» para seguir.', { name: p.name });
          var note = state.panel.querySelector('.ops-places-notice');
          if (note) { note.textContent = state.notice; note.classList.add('is-warning'); }
          else state.panel.insertBefore(el('p', { className: 'ops-places-notice is-warning', role: 'status', text: state.notice }), state.panel.children[1] || null);
          window.setTimeout(function () {
            if (!document.contains(del) || del.disabled) return;
            del.dataset.confirm = ''; del.classList.remove('is-confirming'); del.lastChild.textContent = tr('opsPlaces.delete', 'Eliminar');
          }, 8000);
          return;
        }
        quick('set_status', p, { op: 'archive' }, tr('opsPlaces.archivedOk', 'Lugar archivado. Podés restaurarlo desde «Archivados».'), all);
      });
      all.push(toggle, verify, del);
    }
    all.forEach(function (b) { wrap.appendChild(b); });
    return wrap;
  }

  // ---------------------------------------------------------------- editor
  var FIELDS = [
    ['name', 'opsPlaces.f.name', 'Nombre', 'text', true],
    ['department_id', 'opsPlaces.f.department', 'Departamento o región', 'dept', true],
    ['municipality_id', 'opsPlaces.f.municipality', 'Municipio', 'muni', false],
    ['category', 'opsPlaces.f.category', 'Categoría', 'text', false],
    ['subcategory', 'opsPlaces.f.subcategory', 'Subcategoría', 'text', false],
    ['short_description', 'opsPlaces.f.short', 'Descripción corta', 'area', false],
    ['description', 'opsPlaces.f.description', 'Descripción', 'area', false],
    ['latitude', 'opsPlaces.f.lat', 'Latitud (10.6 a 15.1)', 'num', false],
    ['longitude', 'opsPlaces.f.lng', 'Longitud (-87.8 a -82.5)', 'num', false],
    ['address', 'opsPlaces.f.address', 'Dirección o referencia', 'text', false],
    ['source_name', 'opsPlaces.f.sourceName', 'Fuente (institución, documento o visita)', 'text', false],
    ['source_url', 'opsPlaces.f.sourceUrl', 'Enlace de la fuente (https)', 'url', false]
  ];

  function ensureDialog() {
    if (state.dialog) return state.dialog;
    var d = el('dialog', { className: 'ops-places-dialog', 'aria-labelledby': 'opsPlacesDialogTitle' });
    d.addEventListener('close', function () { if (d.__opener && document.contains(d.__opener)) d.__opener.focus(); });
    document.body.appendChild(d);
    state.dialog = d;
    return d;
  }

  function fillMunicipalities(select, deptId, current) {
    select.replaceChildren(el('option', { value: '', text: tr('opsPlaces.noMuniOption', '— Sin municipio todavía —') }));
    state.municipalities.filter(function (m) { return !deptId || m.department_id === deptId; })
      .sort(function (a, b) { return a.name.localeCompare(b.name, 'es'); })
      .forEach(function (m) { select.appendChild(el('option', { value: m.id, text: m.name, selected: current === m.id ? 'selected' : null })); });
  }

  function openEditor(place, options) {
    options = options || {};
    var d = ensureDialog();
    d.__opener = document.activeElement;
    var writable = canWrite();
    var form = el('form', { className: 'ops-places-form', method: 'dialog', novalidate: true });
    var status = el('p', { className: 'ops-places-form-status', role: 'status', 'aria-live': 'polite' });
    var inputs = {};
    FIELDS.forEach(function (f) {
      var id = 'opsPlace_' + f[0];
      var input;
      if (f[3] === 'dept') {
        input = el('select', { id: id, className: 'ops-form-input', required: f[4] ? true : null }, [el('option', { value: '', text: tr('opsPlaces.chooseDept', 'Elegí el territorio') })]);
        state.departments.forEach(function (x) { input.appendChild(el('option', { value: x.id, text: x.name, selected: place && place.department_id === x.id ? 'selected' : null })); });
      } else if (f[3] === 'muni') {
        input = el('select', { id: id, className: 'ops-form-input' });
        fillMunicipalities(input, place && place.department_id, place && place.municipality_id);
      } else if (f[3] === 'area') {
        input = el('textarea', { id: id, className: 'ops-form-input', rows: f[0] === 'description' ? '5' : '2', maxlength: '6000' });
        input.value = (place && place[f[0]]) || '';
      } else {
        input = el('input', { id: id, className: 'ops-form-input', type: f[3] === 'num' ? 'number' : (f[3] === 'url' ? 'url' : 'text'), step: f[3] === 'num' ? 'any' : null, required: f[4] ? true : null, maxlength: f[3] === 'num' ? null : (f[3] === 'url' ? '1000' : '160') });
        input.value = place && place[f[0]] != null ? String(place[f[0]]) : '';
      }
      if (!writable) input.disabled = true;
      inputs[f[0]] = input;
      form.appendChild(el('label', { className: 'ops-places-field', for: id }, [el('span', { text: tr(f[1], f[2]) + (f[4] ? ' *' : '') }), input]));
    });
    inputs.department_id.addEventListener('change', function () { fillMunicipalities(inputs.municipality_id, inputs.department_id.value, ''); });

    var buttons = [];
    var close = el('button', { type: 'button', className: 'ops-btn' }, [tr('opsPlaces.close', 'Cerrar')]);
    close.addEventListener('click', function () { d.close(); });
    buttons.push(close);
    if (place && hasCoords(place)) {
      buttons.push(el('a', { className: 'ops-btn', href: 'mapa.html?q=' + encodeURIComponent(place.name) + '&lat=' + place.latitude + '&lng=' + place.longitude, target: '_blank', rel: 'noopener' }, [icon('fa-map-location-dot'), ' ' + tr('opsPlaces.viewMap', 'Ver en el mapa')]));
    }
    if (writable) {
      var save = el('button', { type: 'submit', className: 'ops-btn ops-btn-primary' }, [icon('fa-floppy-disk'), ' ' + tr('opsPlaces.save', 'Guardar')]);
      buttons.push(save);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var values = {};
        FIELDS.forEach(function (f) {
          var v = inputs[f[0]].value.trim();
          var original = place ? (place[f[0]] == null ? '' : String(place[f[0]])) : '';
          if (place && v === original) return; // solo lo que cambió (el servidor audita antes/después)
          values[f[0]] = f[3] === 'num' ? (v === '' ? null : Number(v)) : (v === '' ? null : v);
        });
        // Las coordenadas viajan juntas: si cambió una, se envían las dos.
        if ('latitude' in values || 'longitude' in values) {
          values.latitude = inputs.latitude.value.trim() === '' ? null : Number(inputs.latitude.value);
          values.longitude = inputs.longitude.value.trim() === '' ? null : Number(inputs.longitude.value);
        }
        if (place && !Object.keys(values).length) { status.textContent = tr('opsPlaces.noChanges', 'No hay cambios para guardar.'); return; }
        save.disabled = true; status.textContent = tr('opsPlaces.saving', 'Guardando…');
        call('save', { entity: 'places', id: place ? place.id : undefined, values: values })
          .then(function (r) {
            state.notice = place ? tr('opsPlaces.saved', 'Cambios guardados y registrados en la auditoría.') : tr('opsPlaces.created', 'Lugar creado como borrador: revisalo y publicalo cuando esté listo.');
            d.close(); refresh();
            if (!place && r && r.item) window.setTimeout(function () { openEditor(r.item); }, 0);
          }, function (err) { status.textContent = errText(err); save.disabled = false; });
      });
    }
    var body = [
      el('div', { className: 'ops-places-dialog-head' }, [
        el('h2', { id: 'opsPlacesDialogTitle', text: place ? place.name : tr('opsPlaces.new', 'Nuevo lugar') }),
        place ? el('p', { className: 'ops-places-source', text: tr('opsPlaces.idLine', 'ID {id} · última edición {date}', { id: place.id, date: place.updated_at ? new Date(place.updated_at).toLocaleString() : '—' }) }) : null,
        !writable ? el('p', { className: 'ops-places-notice', text: tr('opsPlaces.readOnly', 'Tu rol es de solo lectura: podés revisar, no modificar.') }) : null
      ]),
      form,
      status
    ];
    if (place && writable) body.push(lifecyclePanel(place, d));
    form.appendChild(el('div', { className: 'ops-places-dialog-actions' }, buttons));
    d.replaceChildren.apply(d, body.filter(Boolean));
    if (!d.open) d.showModal();
    window.setTimeout(function () {
      // «Verificar» desde la lista: lleva directo a la sección de verificación (pide la fuente).
      var lifecycle = options.focusVerify && d.querySelector('.ops-places-lifecycle');
      if (lifecycle) {
        lifecycle.scrollIntoView({ block: 'center' });
        var target = d.querySelector('#opsPlaceVerifySource') || lifecycle.querySelector('button');
        if (target) target.focus();
      } else inputs.name.focus();
    }, 0);
  }

  // Publicación, archivo y verificación: acciones separadas, cada una auditada en el servidor.
  function lifecyclePanel(place, dialog) {
    var msg = el('p', { className: 'ops-places-form-status', role: 'status', 'aria-live': 'polite' });
    function run(action, payload, okText) {
      msg.textContent = tr('opsPlaces.working', 'Procesando…');
      return call(action, Object.assign({ entity: 'places', id: place.id }, payload)).then(function () {
        state.notice = okText; dialog.close(); refresh();
      }, function (err) { msg.textContent = errText(err); });
    }
    var row = [];
    if (!place.archived_at) {
      var pub = el('button', { type: 'button', className: 'ops-btn' }, [icon(place.is_published ? 'fa-eye-slash' : 'fa-eye'), ' ' + (place.is_published ? tr('opsPlaces.unpublish', 'Despublicar') : tr('opsPlaces.publish', 'Publicar'))]);
      pub.addEventListener('click', function () { run('set_status', { op: place.is_published ? 'unpublish' : 'publish' }, place.is_published ? tr('opsPlaces.unpublishedOk', 'El lugar ya no se muestra en la web.') : tr('opsPlaces.publishedOk', 'El lugar se publicó en la web y el mapa.')); });
      row.push(pub);
      var arch = el('button', { type: 'button', className: 'ops-btn' }, [icon('fa-box-archive'), ' ' + tr('opsPlaces.archive', 'Archivar')]);
      arch.addEventListener('click', function () {
        // Confirmación explícita con el nombre: archivar oculta el lugar en la web.
        if (arch.dataset.confirm !== '1') { arch.dataset.confirm = '1'; msg.textContent = tr('opsPlaces.archiveConfirm', 'Archivar «{name}» lo oculta de la web y del mapa. Tocá «Archivar» otra vez para confirmar.', { name: place.name }); return; }
        run('set_status', { op: 'archive' }, tr('opsPlaces.archivedOk', 'Lugar archivado. Podés restaurarlo desde «Archivados».'));
      });
      row.push(arch);
    } else {
      var rest = el('button', { type: 'button', className: 'ops-btn' }, [icon('fa-rotate-left'), ' ' + tr('opsPlaces.restore', 'Restaurar')]);
      rest.addEventListener('click', function () { run('set_status', { op: 'restore' }, tr('opsPlaces.restoredOk', 'Lugar restaurado como borrador.')); });
      row.push(rest);
    }
    // Verificación: exige fuente; la próxima revisión hace que el sello venza.
    var src = el('input', { type: 'text', className: 'ops-form-input', id: 'opsPlaceVerifySource', maxlength: '300', placeholder: tr('opsPlaces.verifySourcePh', 'Visita, llamada, documento oficial…') });
    var ev = el('input', { type: 'url', className: 'ops-form-input', id: 'opsPlaceVerifyEvidence', maxlength: '1000', placeholder: 'https://' });
    var nextReview = el('input', { type: 'date', className: 'ops-form-input', id: 'opsPlaceVerifyNext' });
    var verified = place.verification_status === 'verified';
    var vbtn = el('button', { type: 'button', className: 'ops-btn ' + (verified ? '' : 'ops-btn-primary') }, [icon(verified ? 'fa-ban' : 'fa-circle-check'), ' ' + (verified ? tr('opsPlaces.unverify', 'Retirar verificación') : tr('opsPlaces.verify', 'Verificar'))]);
    vbtn.addEventListener('click', function () {
      if (!verified && !src.value.trim()) { msg.textContent = tr('opsPlaces.verifyNeedsSource', 'Para verificar indicá cómo lo comprobaste (fuente).'); src.focus(); return; }
      run('verify', { verified: !verified, source: src.value.trim() || undefined, evidence: ev.value.trim() || undefined, next_review: nextReview.value || undefined },
        verified ? tr('opsPlaces.unverifiedOk', 'Se retiró el sello de verificación.') : tr('opsPlaces.verifiedOk', 'Lugar verificado con su fuente.'));
    });
    return el('section', { className: 'ops-places-lifecycle', 'aria-label': tr('opsPlaces.lifecycle', 'Publicación y verificación') }, [
      el('h3', { text: tr('opsPlaces.lifecycle', 'Publicación y verificación') }),
      el('div', { className: 'ops-places-dialog-actions' }, row),
      verified ? null : el('label', { className: 'ops-places-field', for: 'opsPlaceVerifySource' }, [el('span', { text: tr('opsPlaces.verifySource', 'Cómo se comprobó (obligatorio)') }), src]),
      verified ? null : el('label', { className: 'ops-places-field', for: 'opsPlaceVerifyEvidence' }, [el('span', { text: tr('opsPlaces.verifyEvidence', 'Evidencia (enlace, opcional)') }), ev]),
      verified ? null : el('label', { className: 'ops-places-field', for: 'opsPlaceVerifyNext' }, [el('span', { text: tr('opsPlaces.verifyNext', 'Próxima revisión (el sello vence ese día)') }), nextReview]),
      el('div', { className: 'ops-places-dialog-actions' }, [vbtn]),
      msg
    ]);
  }

  function render(panel) { state.panel = panel; state.notice = ''; paint(); refresh(); }
  window.addEventListener('baqueano:languageChanged', paint);
  // El permiso de escritura lo confirma el servidor (whoami) después del primer pintado: si cambia,
  // se vuelve a pintar para mostrar u ocultar «Nuevo lugar» y las acciones.
  window.addEventListener('baqueano:ops-data', function () { if (state.panel && state.paintedCanWrite !== canWrite()) paint(); });
  window.BaqueanoOpsPlaces = { render: render, refresh: refresh, _state: state };
})(window, document);
