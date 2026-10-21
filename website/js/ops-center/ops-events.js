// ============================================================================
// 🗓️ BAQUEANO — OPS CENTER: GESTIÓN DE EVENTOS (ops-events.js)
// ============================================================================
// 🎯 POR QUÉ (propietario, 2026-10-20): «la sección debe poder administrarse sin modificar código
//   cada vez que se anuncie un evento». Desde aquí el equipo crea, revisa, publica, destaca,
//   reprograma o cancela; el index y la agenda se actualizan solos.
// - Información auténtica: la fuente oficial es obligatoria para publicar; nada se publica solo.
//   Los datos que vengan de internet se cargan como borrador y se revisan antes de publicar.
// - Nada se borra: se despublica o se cancela (queda en el histórico).
//
// ⚙️ CÓMO:
// - Solo la Edge Function `baqueano-events` con el token de Firebase. El servidor verifica el rol
//   (admin y superadmin editan; auditor solo lee) y escribe event_changes y audit_logs.
// - Fecha y hora se escriben en hora de Nicaragua; el servidor las guarda en UTC sin ambigüedad.
//   Sin hora confirmada se publica «Horario por confirmar».
// - Fotos: URL firmada (PUT) al bucket event-images; el servidor comprueba el tipo real.
// - Todo con createElement/textContent. Sin confirm()/prompt(): las confirmaciones están en la vista.
//
// 📦 QUÉ: window.BaqueanoOpsEvents = { render(panel), refresh() } — vista 46-eventos.
// ============================================================================
(function (window, document) {
  'use strict';
  if (window.BaqueanoOpsEvents) return;

  var ENDPOINT = 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-events';
  var TABS = [
    { id: 'all', label: 'Todos', icon: 'fa-layer-group' },
    { id: 'draft', label: 'Borradores', icon: 'fa-pen-ruler' },
    { id: 'review', label: 'En revisión', icon: 'fa-hourglass-half' },
    { id: 'published', label: 'Publicados', icon: 'fa-circle-check' },
    { id: 'unpublished', label: 'Despublicados', icon: 'fa-eye-slash' },
    { id: 'past', label: 'Anteriores', icon: 'fa-clock-rotate-left' }
  ];
  var CATEGORIES = {
    feria_turistica: 'Ferias turísticas', festival_cultural: 'Festivales culturales', gastronomia: 'Gastronomía',
    musica: 'Música y conciertos', tradiciones: 'Tradiciones y festividades', arte_patrimonio: 'Arte y patrimonio',
    naturaleza: 'Naturaleza y ecoturismo', turismo_comunitario: 'Turismo comunitario', deporte_aventura: 'Deporte y aventura',
    exposicion: 'Exposiciones', tecnologia_emprendimiento: 'Tecnología y emprendimiento', familiar: 'Actividades familiares'
  };
  var DEPARTMENTS = {
    boaco: 'Boaco', carazo: 'Carazo', chinandega: 'Chinandega', chontales: 'Chontales', raccn: 'Costa Caribe Norte',
    raccs: 'Costa Caribe Sur', esteli: 'Estelí', granada: 'Granada', jinotega: 'Jinotega', leon: 'León', madriz: 'Madriz',
    managua: 'Managua', masaya: 'Masaya', matagalpa: 'Matagalpa', nueva_segovia: 'Nueva Segovia', rio_san_juan: 'Río San Juan', rivas: 'Rivas'
  };
  var PUB_LABELS = { draft: 'Borrador', review: 'En revisión', published: 'Publicado', unpublished: 'Despublicado' };
  var STATUS_LABELS = { scheduled: 'Programado', cancelled: 'Cancelado', rescheduled: 'Reprogramado', postponed: 'Pospuesto' };
  var ACTION_LABELS = { created: 'Creado', edited: 'Editado', submitted: 'Enviado a revisión', approved: 'Aprobado', published: 'Publicado',
    unpublished: 'Despublicado', featured: 'Destacado', unfeatured: 'Ya no destacado', cancelled: 'Cancelado', rescheduled: 'Reprogramado',
    restored: 'Vuelve a programado', image: 'Foto cambiada' };
  var FIELD = 'width:100%;box-sizing:border-box;min-height:40px;padding:0.55rem 0.7rem;border-radius:8px;border:1px solid var(--ops-border-subtle);background:rgba(15,23,42,0.6);color:#fff;font:inherit;font-size:0.85rem;';

  var state = { panel: null, tab: 'all', q: '', items: [], totals: {}, canEdit: false, editing: null, history: [], requestId: 0, busy: false };

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      var v = attrs[key];
      if (v == null || v === false) return;
      if (key === 'text') node.textContent = v;
      else if (key === 'className') node.className = v;
      else if (key === 'style') node.style.cssText = v;
      else if (key.indexOf('on') === 0 && typeof v === 'function') node.addEventListener(key.slice(2), v);
      else node.setAttribute(key, v === true ? '' : String(v));
    });
    (children || []).forEach(function (c) { if (c != null && c !== false) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return node;
  }
  function tr(key, fallback) {
    try { return (window.BaqueanoLanguage && window.BaqueanoLanguage.t(key, { fallback: fallback })) || fallback; } catch (_) { return fallback; }
  }
  function icon(name) { return el('i', { className: 'fa-solid ' + name, 'aria-hidden': 'true' }); }
  function btn(label, iconName, kind, handler, attrs) { return el('button', Object.assign({ type: 'button', className: 'btn-ops-matte' + (kind ? ' ' + kind : ''), onclick: handler }, attrs || {}), [icon(iconName), ' ' + label]); }
  function toast(message, kind) {
    var engine = window.BaqueanoOpsEngine;
    if (engine && typeof engine.showToast === 'function') { try { engine.showToast(message, kind || 'info'); return; } catch (_) { /* respaldo */ } }
    var box = el('div', { role: 'status', text: message, style: 'position:fixed;right:1.25rem;bottom:1.25rem;z-index:9999;max-width:360px;padding:0.85rem 1rem;border-radius:10px;background:' + (kind === 'error' ? '#7f1d1d' : '#165D6F') + ';color:#fff;font-size:0.85rem;' });
    document.body.appendChild(box);
    setTimeout(function () { box.remove(); }, 4200);
  }
  function managua(iso, withTime) {
    if (!iso) return '—';
    try { return new Intl.DateTimeFormat('es-NI', Object.assign({ timeZone: 'America/Managua', day: '2-digit', month: 'short', year: 'numeric' }, withTime ? { hour: '2-digit', minute: '2-digit' } : {})).format(new Date(iso)); } catch (_) { return iso; }
  }
  // ISO (UTC) → { date: 'YYYY-MM-DD', time: 'HH:MM' } en hora de Nicaragua (UTC−6 todo el año).
  function toLocal(iso) {
    if (!iso) return { date: '', time: '' };
    var local = new Date(Date.parse(iso) - 6 * 3600000).toISOString();
    return { date: local.slice(0, 10), time: local.slice(11, 16) };
  }

  function call(action, payload) {
    var user = null;
    try { user = window.firebase && window.firebase.auth ? window.firebase.auth().currentUser : null; } catch (_) { user = null; }
    var tokenP = user && user.getIdToken ? user.getIdToken().catch(function () { return null; }) : Promise.resolve(null);
    return tokenP.then(function (token) {
      var headers = { 'content-type': 'application/json' };
      if (token) headers['x-firebase-token'] = token;
      return fetch(ENDPOINT, { method: 'POST', headers: headers, body: JSON.stringify(Object.assign({ action: action }, payload || {})) });
    }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (data) {
        if (res.ok && data && data.ok !== false) return data;
        var e = new Error((data && data.error) || 'No se pudo completar la acción.'); e.status = res.status; throw e;
      });
    });
  }
  function errorMessage(e) {
    if (!e) return 'No se pudo completar la acción.';
    if (e.status === 401) return 'Iniciá sesión con tu cuenta del equipo.';
    if (!e.status) return 'No se pudo conectar con la Edge Function baqueano-events.';
    return e.message;
  }

  // ------------------------------------------------------------------ vista
  function paint(nodes) { if (state.panel) state.panel.replaceChildren.apply(state.panel, nodes); }
  function header() {
    return el('div', { className: 'ops-view-header' }, [
      el('div', { className: 'ops-view-title-group' }, [
        el('h1', null, [icon('fa-calendar-days'), ' Gestión de eventos']),
        el('p', { className: 'ops-view-subtitle', text: 'AGENDA BAQUEANO · LO PUBLICADO APARECE EN EL INDEX Y EN /EVENTOS SIN DESPLEGAR · NADA SE BORRA' })
      ]),
      el('div', { className: 'ops-view-actions' }, [
        el('a', { className: 'btn-ops-matte', href: 'eventos.html', target: '_blank', rel: 'noopener' }, [icon('fa-arrow-up-right-from-square'), ' Ver agenda pública']),
        state.canEdit ? btn('Nuevo evento', 'fa-plus', 'primary', function () { openEditor(null); }) : null,
        btn('Actualizar', 'fa-arrows-rotate', '', function () { load(); })
      ])
    ]);
  }
  function tabs() {
    return el('div', { className: 'ops-crud-toolbar' }, [
      el('div', { className: 'ops-filter-group', role: 'tablist', 'aria-label': 'Estado de publicación' }, TABS.map(function (tb) {
        var active = state.tab === tb.id;
        var n = tb.id === 'all' ? Object.keys(state.totals).reduce(function (a, k) { return a + state.totals[k]; }, 0) : state.totals[tb.id];
        return el('button', { type: 'button', role: 'tab', 'aria-selected': active ? 'true' : 'false', className: 'ops-filter-pill' + (active ? ' is-active' : ''),
          onclick: function () { if (state.busy) return; state.tab = tb.id; load(); } },
          [icon(tb.icon), ' ' + tb.label + ' ', n != null ? el('span', { className: 'ops-filter-count', text: String(n || 0) }) : null]);
      })),
      el('form', { 'aria-label': 'Buscar eventos', style: 'display:flex;gap:0.4rem;margin-top:0.6rem;', onsubmit: function (e) { e.preventDefault(); state.q = e.target.elements.q.value.trim(); load(); } }, [
        (function () { var i = el('input', { name: 'q', type: 'search', maxlength: 80, placeholder: 'Buscar por nombre', 'aria-label': 'Buscar por nombre', style: FIELD + 'max-width:320px;' }); i.value = state.q; return i; })(),
        el('button', { type: 'submit', className: 'btn-ops-matte' }, [icon('fa-magnifying-glass'), ' Buscar'])
      ])
    ]);
  }
  function row(ev) {
    var pub = PUB_LABELS[ev.publication_status] || ev.publication_status;
    var st = STATUS_LABELS[ev.event_status] || ev.event_status;
    return el('article', { className: 'ops-table-container-matte', style: 'padding:1rem 1.1rem;display:grid;grid-template-columns:96px 1fr;gap:1rem;align-items:start;border-left:3px solid ' + (ev.publication_status === 'published' ? '#3ECF8E' : ev.publication_status === 'review' ? '#F59E0B' : '#165D6F') + ';' }, [
      ev.cover_image ? el('img', { src: ev.cover_image, alt: '', width: 96, height: 64, loading: 'lazy', style: 'width:96px;height:64px;object-fit:cover;border-radius:8px;' })
        : el('div', { style: 'width:96px;height:64px;border-radius:8px;background:rgba(255,255,255,0.06);display:grid;place-items:center;color:#94A3B8;font-size:0.7rem;text-align:center;', text: 'Sin foto' }),
      el('div', { style: 'min-width:0;display:grid;gap:0.3rem;' }, [
        el('strong', { text: ev.title, style: 'color:#fff;font-size:0.95rem;overflow-wrap:anywhere;' }),
        el('span', { style: 'font-size:0.78rem;color:var(--ops-text-secondary);', text: managua(ev.start_at, ev.time_confirmed) + (ev.time_confirmed ? '' : ' · horario por confirmar') + ' · ' + (DEPARTMENTS[ev.department_id] || (ev.modality === 'virtual' ? 'En línea' : '—')) + ' · ' + (CATEGORIES[ev.category] || ev.category) }),
        el('div', { style: 'display:flex;gap:0.4rem;flex-wrap:wrap;' }, [
          el('span', { className: 'ops-badge-pill ' + (ev.publication_status === 'published' ? 'published' : 'draft'), text: pub }),
          ev.event_status !== 'scheduled' ? el('span', { className: 'ops-badge-pill draft', text: st }) : null,
          ev.is_featured ? el('span', { className: 'ops-badge-pill published', text: '★ Destacado' }) : null
        ]),
        el('div', null, [btn(state.canEdit ? 'Abrir y editar' : 'Ver detalle', state.canEdit ? 'fa-pen' : 'fa-eye', '', function () { openEditor(ev.id); })])
      ])
    ]);
  }

  function load() {
    if (!state.panel) return;
    var id = ++state.requestId;
    state.busy = true;
    state.editing = null;
    paint([header(), tabs(), el('div', { className: 'ops-empty-state' }, [icon('fa-spinner fa-spin ops-empty-icon'), el('div', { className: 'ops-empty-title', text: 'Cargando la agenda…' })])]);
    Promise.all([call('whoami').catch(function () { return { user: { canEdit: false } }; }), call('mod_list', { publication: state.tab, q: state.q || undefined })])
      .then(function (r) {
        if (id !== state.requestId) return;
        state.canEdit = !!(r[0].user && r[0].user.canEdit);
        state.items = r[1].items || [];
        state.totals = r[1].totals || {};
        var note = el('p', { style: 'margin:0 0 1rem;font-size:0.78rem;color:var(--ops-text-muted);', text: 'Para publicar hacen falta: fecha de inicio, descripción, foto autorizada y la fuente oficial (nombre y enlace). Un evento tomado de internet se guarda como borrador y se verifica con el organizador antes de publicarlo.' });
        var list = state.items.length ? el('div', { style: 'display:grid;gap:0.8rem;' }, state.items.map(row))
          : el('div', { className: 'ops-empty-state' }, [icon('fa-calendar-plus ops-empty-icon'), el('div', { className: 'ops-empty-title', text: 'Sin eventos en esta vista' }), el('div', { className: 'ops-empty-desc', text: state.canEdit ? 'Tocá «Nuevo evento» para cargar el primero.' : 'Cuando el equipo cargue eventos aparecerán aquí.' })]);
        paint([header(), tabs(), note, list]);
      })
      .catch(function (e) {
        if (id !== state.requestId) return;
        paint([header(), tabs(), el('div', { className: 'ops-empty-state' }, [icon('fa-shield-halved ops-empty-icon'), el('div', { className: 'ops-empty-title', text: 'No se pudo abrir la agenda' }), el('div', { className: 'ops-empty-desc', text: errorMessage(e) })])]);
      })
      .then(function () { if (id === state.requestId) state.busy = false; });
  }

  // ------------------------------------------------------------------ editor
  function input(name, label, value, attrs) {
    var id = 'opsEv-' + name;
    var control = (attrs && attrs.tag === 'textarea') ? el('textarea', Object.assign({ id: id, name: name, rows: attrs.rows || 4, style: FIELD + 'resize:vertical;' }, attrs.extra || {}))
      : (attrs && attrs.tag === 'select') ? el('select', { id: id, name: name, style: FIELD }, Object.keys(attrs.options).map(function (k) { return el('option', { value: k, text: attrs.options[k] }); }))
        : el('input', Object.assign({ id: id, name: name, type: (attrs && attrs.type) || 'text', style: FIELD }, (attrs && attrs.extra) || {}));
    if (attrs && attrs.type === 'checkbox') { control.style.cssText = 'width:20px;height:20px;'; control.checked = !!value; }
    else control.value = value == null ? '' : String(value);
    if (!state.canEdit) control.disabled = true;
    var wrap = el('div', { style: 'display:grid;gap:0.3rem;min-width:0;' + (attrs && attrs.wide ? 'grid-column:1 / -1;' : '') }, [
      el('label', { for: id, style: 'font-size:0.78rem;font-weight:700;color:#F4E6C1;', text: label }), control,
      attrs && attrs.hint ? el('small', { style: 'color:var(--ops-text-muted);font-size:0.72rem;', text: attrs.hint }) : null
    ]);
    if (attrs && attrs.type === 'checkbox') wrap = el('label', { for: id, style: 'display:flex;gap:0.5rem;align-items:center;font-size:0.82rem;color:#F4E6C1;' + (attrs.wide ? 'grid-column:1 / -1;' : '') }, [control, label]);
    return wrap;
  }
  function group(title, children) {
    return el('fieldset', { style: 'border:1px solid var(--ops-border-subtle);border-radius:12px;padding:1rem;margin:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:0.8rem;' },
      [el('legend', { style: 'padding:0 0.4rem;font-weight:800;color:#fff;font-size:0.9rem;', text: title })].concat(children));
  }

  function openEditor(id) {
    var ready = id ? call('mod_get', { id: id }) : Promise.resolve({ event: null, history: [] });
    paint([header(), el('div', { className: 'ops-empty-state' }, [icon('fa-spinner fa-spin ops-empty-icon')])]);
    ready.then(function (d) { state.editing = d.event; state.history = d.history || []; renderEditor(); })
      .catch(function (e) { toast(errorMessage(e), 'error'); load(); });
  }

  function renderEditor() {
    var ev = state.editing || {};
    var start = toLocal(ev.start_at);
    var end = toLocal(ev.end_at);
    var form = el('form', { style: 'display:grid;gap:1rem;', novalidate: true });
    var programText = (ev.program || []).map(function (p) { return [p.date || '', p.time || '', p.what].join(' | '); }).join('\n');
    form.append(
      group('Datos principales', [
        input('title', 'Nombre oficial *', ev.title, { wide: true, extra: { maxlength: 160, required: true } }),
        input('category', 'Categoría *', ev.category || 'festival_cultural', { tag: 'select', options: CATEGORIES }),
        input('modality', 'Modalidad', ev.modality || 'presencial', { tag: 'select', options: { presencial: 'Presencial', virtual: 'Virtual', hibrido: 'Híbrido' } }),
        input('shortDescription', 'Descripción breve (tarjeta)', ev.short_description, { tag: 'textarea', rows: 2, wide: true, extra: { maxlength: 280 } }),
        input('description', 'Descripción detallada *', ev.description, { tag: 'textarea', rows: 6, wide: true, extra: { maxlength: 8000 } })
      ]),
      group('Fecha y hora (hora de Nicaragua)', [
        input('startDate', 'Fecha de inicio *', start.date, { type: 'date' }),
        input('startTime', 'Hora de inicio', ev.time_confirmed ? start.time : '', { type: 'time', hint: 'Dejala vacía si todavía no está confirmada: se mostrará «Horario por confirmar».' }),
        input('endDate', 'Fecha de finalización', end.date, { type: 'date' }),
        input('endTime', 'Hora de finalización', ev.end_at && ev.time_confirmed ? end.time : '', { type: 'time' })
      ]),
      group('Lugar', [
        input('departmentId', 'Departamento *', ev.department_id || '', { tag: 'select', options: Object.assign({ '': '— Elegí —' }, DEPARTMENTS) }),
        input('municipalityId', 'Municipio', ev.municipality_id),
        input('locationName', 'Lugar exacto *', ev.location_name, { extra: { maxlength: 160 } }),
        input('address', 'Dirección', ev.address, { extra: { maxlength: 300 } }),
        input('latitude', 'Latitud', ev.latitude, { type: 'number', extra: { step: 'any', min: 10.5, max: 15.2 } }),
        input('longitude', 'Longitud', ev.longitude, { type: 'number', extra: { step: 'any', min: -88, max: -82.5 } }),
        input('coordsVerified', 'Coordenadas verificadas en sitio o con el organizador (habilita «Cómo llegar»)', ev.coords_verified, { type: 'checkbox', wide: true }),
        input('virtualUrl', 'Enlace de transmisión (virtual o híbrido)', ev.virtual_url, { type: 'url', wide: true })
      ]),
      group('Acceso', [
        input('accessType', 'Tipo de acceso', ev.access_type || 'unconfirmed', { tag: 'select', options: { unconfirmed: 'Sin confirmar', free: 'Gratuito', paid: 'Pagado' } }),
        input('price', 'Precio (solo si está verificado)', ev.price, { type: 'number', extra: { step: '0.01', min: 0 } }),
        input('currency', 'Moneda', ev.currency || 'NIO', { tag: 'select', options: { NIO: 'Córdobas (C$)', USD: 'Dólares (US$)' } }),
        input('registrationUrl', 'Inscripción o entradas (del organizador)', ev.registration_url, { type: 'url', wide: true, hint: 'BAQUEANO no vende entradas: este enlace se muestra como servicio del organizador.' })
      ]),
      group('Organizador y fuente oficial', [
        input('organizerName', 'Organizador', ev.organizer_name),
        input('organizerUrl', 'Sitio del organizador', ev.organizer_url, { type: 'url' }),
        input('contactInfo', 'Contacto público', ev.contact_info, { wide: true, extra: { maxlength: 300 } }),
        input('officialUrl', 'Enlace oficial del evento', ev.official_url, { type: 'url', wide: true }),
        input('sourceName', 'Fuente de la información *', ev.source_name, { hint: 'Ej.: INTUR, Alcaldía de León, organizador.' }),
        input('sourceUrl', 'Enlace de la fuente *', ev.source_url, { type: 'url' })
      ]),
      group('Detalle', [
        input('program', 'Programa (una actividad por línea: fecha | hora | actividad)', programText, { tag: 'textarea', rows: 4, wide: true, hint: 'Ejemplo: 2026-11-14 | 18:30 | Desfile inaugural. Fecha y hora son opcionales.' }),
        input('recommendations', 'Recomendaciones para participantes', ev.recommendations, { tag: 'textarea', rows: 3, wide: true }),
        input('imageAlt', 'Descripción de la foto (accesibilidad)', ev.image_alt, { wide: true }),
        input('imageCredit', 'Crédito de la foto', ev.image_credit)
      ])
    );

    function collect() {
      var f = form.elements;
      var program = String(f.program.value || '').split('\n').map(function (l) { return l.trim(); }).filter(Boolean).map(function (l) {
        var parts = l.split('|').map(function (x) { return x.trim(); });
        return parts.length >= 3 ? { date: parts[0], time: parts[1], what: parts.slice(2).join(' | ') } : { what: l };
      });
      return {
        title: f.title.value, category: f.category.value, modality: f.modality.value, shortDescription: f.shortDescription.value,
        description: f.description.value, startDate: f.startDate.value, startTime: f.startTime.value, timeConfirmed: !!f.startTime.value,
        endDate: f.endDate.value, endTime: f.endTime.value, departmentId: f.departmentId.value, municipalityId: f.municipalityId.value,
        locationName: f.locationName.value, address: f.address.value, latitude: f.latitude.value, longitude: f.longitude.value,
        coordsVerified: f.coordsVerified.checked, virtualUrl: f.virtualUrl.value, accessType: f.accessType.value,
        price: f.accessType.value === 'paid' ? f.price.value : '', currency: f.currency.value, registrationUrl: f.registrationUrl.value,
        organizerName: f.organizerName.value, organizerUrl: f.organizerUrl.value, contactInfo: f.contactInfo.value, officialUrl: f.officialUrl.value,
        sourceName: f.sourceName.value, sourceUrl: f.sourceUrl.value, program: program, recommendations: f.recommendations.value,
        imageAlt: f.imageAlt.value, imageCredit: f.imageCredit.value
      };
    }
    function save() {
      return call('save', { id: ev.id || undefined, event: collect() }).then(function (d) {
        state.editing = d.event; toast(tr('opsEvents.saved', 'Evento guardado.'), 'success'); return d.event;
      });
    }
    function act(promise, ok) {
      return promise.then(function () { toast(ok, 'success'); openEditor(state.editing.id); }).catch(function (e) { toast(errorMessage(e), 'error'); });
    }

    // Foto
    var photo = el('div', { style: 'display:grid;gap:0.5rem;' }, [
      el('strong', { style: 'color:#fff;', text: 'Foto oficial o autorizada *' }),
      ev.cover_image ? el('img', { src: ev.cover_image, alt: ev.image_alt || '', style: 'max-width:100%;width:420px;aspect-ratio:16/10;object-fit:cover;border-radius:10px;' }) : el('p', { style: 'margin:0;color:var(--ops-text-muted);font-size:0.8rem;', text: 'Sin foto. Guardá el evento primero y después subí la foto (WebP, JPG o PNG, hasta 5 MB). Sin foto no se puede publicar.' })
    ]);
    if (state.canEdit && ev.id) {
      var file = el('input', { type: 'file', accept: 'image/webp,image/jpeg,image/png', 'aria-label': 'Elegir foto del evento', style: 'color:#fff;' });
      file.addEventListener('change', function () {
        var f = file.files && file.files[0];
        if (!f) return;
        file.disabled = true;
        call('upload_url', { id: ev.id, mime: f.type, size: f.size })
          .then(function (d) { return fetch(d.upload_url, { method: 'PUT', headers: { 'content-type': f.type, 'x-upsert': 'false' }, body: f }).then(function (r) { if (!r.ok) throw new Error('No se pudo subir la foto.'); return d.path; }); })
          .then(function (path) { return call('attach_image', { id: ev.id, path: path }); })
          .then(function () { toast(tr('opsEvents.photoUpdated', 'Foto actualizada.'), 'success'); openEditor(ev.id); })
          .catch(function (e) { file.disabled = false; toast(errorMessage(e), 'error'); });
      });
      photo.append(file);
    }

    // Publicación y estado
    var reason = el('textarea', { rows: 2, maxlength: 500, placeholder: 'Motivo o nota pública (obligatorio para despublicar, cancelar, posponer o reprogramar)', 'aria-label': 'Motivo', style: FIELD });
    var reDate = el('input', { type: 'date', 'aria-label': 'Nueva fecha', style: FIELD + 'max-width:180px;' });
    var reTime = el('input', { type: 'time', 'aria-label': 'Nueva hora', style: FIELD + 'max-width:140px;' });
    var controls = [];
    if (state.canEdit && ev.id) {
      var pub = ev.publication_status;
      if (pub === 'draft' || pub === 'unpublished') controls.push(btn('Enviar a revisión', 'fa-paper-plane', '', function () { act(call('publication', { id: ev.id, to: 'review' }), 'Enviado a revisión.'); }));
      if (pub !== 'published') controls.push(btn('Aprobar y publicar', 'fa-circle-check', 'accent', function () { act(save().then(function () { return call('publication', { id: ev.id, to: 'published' }); }), 'Publicado: ya aparece en el index y en la agenda.'); }));
      if (pub === 'published') controls.push(btn('Despublicar', 'fa-eye-slash', '', function () { act(call('publication', { id: ev.id, to: 'unpublished', reason: reason.value }), 'Despublicado.'); }));
      controls.push(btn(ev.is_featured ? 'Quitar destacado' : 'Destacar', 'fa-star', '', function () { act(call('feature', { id: ev.id, on: !ev.is_featured }), 'Listo.'); }));
      if (ev.event_status !== 'cancelled') controls.push(btn('Cancelar evento', 'fa-ban', '', function () { act(call('status', { id: ev.id, to: 'cancelled', note: reason.value }), 'Evento marcado como cancelado.'); }));
      if (ev.event_status !== 'postponed') controls.push(btn('Posponer (fecha por confirmar)', 'fa-hourglass', '', function () { act(call('status', { id: ev.id, to: 'postponed', note: reason.value }), 'Evento pospuesto.'); }));
      if (ev.event_status !== 'scheduled') controls.push(btn('Volver a programado', 'fa-rotate-left', '', function () { act(call('status', { id: ev.id, to: 'scheduled', note: reason.value }), 'Evento programado.'); }));
    }
    var statusBox = ev.id ? el('div', { className: 'ops-table-container-matte', style: 'padding:1rem;display:grid;gap:0.6rem;' }, [
      el('strong', { style: 'color:#fff;', text: 'Publicación: ' + (PUB_LABELS[ev.publication_status] || '—') + ' · Estado: ' + (STATUS_LABELS[ev.event_status] || '—') + (ev.published_at ? ' · publicado ' + managua(ev.published_at, true) : '') }),
      state.canEdit ? reason : null,
      controls.length ? el('div', { style: 'display:flex;gap:0.5rem;flex-wrap:wrap;' }, controls) : null,
      state.canEdit ? el('div', { style: 'display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;' }, [
        el('span', { style: 'font-size:0.8rem;color:#F4E6C1;', text: 'Reprogramar a:' }), reDate, reTime,
        btn('Reprogramar', 'fa-calendar-check', '', function () { act(call('status', { id: ev.id, to: 'rescheduled', startDate: reDate.value, startTime: reTime.value, note: reason.value }), 'Reprogramado: se muestra la nueva fecha y el aviso del cambio.'); })
      ]) : null
    ]) : null;

    var history = state.history.length ? el('details', { style: 'font-size:0.8rem;color:var(--ops-text-secondary);' }, [
      el('summary', { style: 'cursor:pointer;', text: 'Historial (' + state.history.length + ')' }),
      el('ol', { style: 'margin:0.5rem 0 0;padding-left:1.2rem;' }, state.history.map(function (h) {
        return el('li', null, [el('strong', { text: ACTION_LABELS[h.action] || h.action }), ' · ' + h.actor + (h.actor_role ? ' (' + h.actor_role + ')' : '') + ' · ' + managua(h.created_at, true), h.reason ? el('div', { style: 'color:var(--ops-text-muted);', text: 'Motivo: ' + h.reason }) : null]);
      }))
    ]) : null;

    var actions = el('div', { style: 'display:flex;gap:0.5rem;flex-wrap:wrap;position:sticky;bottom:0;padding:0.75rem 0;background:var(--ops-bg, #0B1220);' }, [
      state.canEdit ? btn(ev.id ? 'Guardar cambios' : 'Crear borrador', 'fa-floppy-disk', 'primary', function () {
        save().then(function (saved) { openEditor(saved.id); }).catch(function (e) { toast(errorMessage(e), 'error'); });
      }) : null,
      ev.slug && ev.publication_status === 'published' ? el('a', { className: 'btn-ops-matte', href: 'evento.html?e=' + encodeURIComponent(ev.slug), target: '_blank', rel: 'noopener' }, [icon('fa-arrow-up-right-from-square'), ' Ver ficha pública']) : null,
      btn('Volver a la lista', 'fa-arrow-left', '', function () { load(); })
    ]);

    paint([
      el('div', { className: 'ops-view-header' }, [el('div', { className: 'ops-view-title-group' }, [
        el('h1', null, [icon('fa-calendar-days'), ' ' + (ev.id ? ev.title : 'Nuevo evento')]),
        el('p', { className: 'ops-view-subtitle', text: ev.id ? ('ID ' + ev.id + (ev.slug ? ' · enlace evento.html?e=' + ev.slug : '')) : 'SE GUARDA COMO BORRADOR · NO SE PUBLICA HASTA QUE LO APRUEBES' })
      ])]),
      statusBox, photo, form, history, actions
    ]);
  }

  function refreshBadge() {
    call('mod_list', { publication: 'review' }).then(function (d) {
      var b = document.getElementById('badgeCount-46');
      if (!b) return;
      var n = Number((d.totals || {}).review) || 0;
      b.textContent = n > 99 ? '99+' : String(n);
      b.style.display = n ? '' : 'none';
      b.title = n + ' eventos en revisión';
    }).catch(function () { /* sin sesión o sin permiso */ });
  }
  (function watchAuth() {
    try {
      if (window.firebase && window.firebase.auth) { window.firebase.auth().onAuthStateChanged(function (u) { if (u) refreshBadge(); }); return; }
    } catch (_) { /* aún no */ }
    setTimeout(watchAuth, 800);
  })();

  window.BaqueanoOpsEvents = {
    render: function (panel) { state.panel = panel || document.getElementById('view-46-eventos'); load(); },
    refresh: load
  };
})(window, document);
