// ============================================================================
// 🧭 BAQUEANO — DIRECTORIO DE ALIADOS CON DATOS REALES (allies-directory.js)
// ============================================================================
// 🎯 POR QUÉ:
// - aliados.html mostraba 10 tarjetas fijas. Varias no existen en Supabase y llevaban el sello
//   "Verificado BAQUEANO". "Ver perfil" llevaba al departamento y no a la ficha del aliado.
// - El propietario pide que una misma entidad (business) alimente aliados, mapa, BAQUI y Mi Viaje.
//   La ficha debe mostrar solo datos reales y ocultar lo que no existe; el departamento es
//   navegación secundaria.
//
// ⚙️ CÓMO:
// - Lee public.businesses (publicados, no borrados) con la clave pública. RLS y los permisos por
//   columna ya ocultan comisiones y responsables.
// - Pinta las tarjetas con las mismas clases, para que los filtros existentes sigan funcionando.
//   Reconstruye los filtros de territorio (17) y de categoría con lo que hay en la base.
// - Sello honesto:
//   - "Verificado" solo con verification_status = verified y una fuente que no sea un registro
//     heredado pendiente de revalidar;
//   - los heredados se rotulan "Pendiente de revalidar";
//   - los parciales, "Verificación parcial".
// - Contacto:
//   - WhatsApp, teléfono, correo y web solo si existen en el registro;
//   - si no hay WhatsApp propio, se ofrece la línea oficial de BAQUEANO, dicho así.
// - Sin foto real en la base no se inventa una: se muestra un fondo de marca con un ícono.
// - Ficha en <dialog> accesible, con mapa (si hay coordenadas), fuente, fecha y "¿Querés conocer
//   {territorio}?".
// - Si Supabase no responde, se muestra un estado de error con "Reintentar" en lugar de tarjetas
//   ficticias.
//
// 📦 QUÉ: se engancha a #aliadosCardsGrid en aliados.html; window.BaqueanoAllies = { reload }.
// ============================================================================
(function (window, document) {
  'use strict';
  var grid = document.getElementById('aliadosCardsGrid');
  if (!grid || window.BaqueanoAllies) return;

  var REST = 'https://heiudfpthqwtjrtluqlm.supabase.co/rest/v1/';
  var KEY = 'sb_publishable_q7ZhqRIRjlerZK7WOu_Qxw_X_AqXV1d';
  var OFFICIAL_WA = '50584431289';
  var PAGE = 12;
  var COLUMNS = 'id,slug,name,category,business_type,department_id,municipality,address,description,whatsapp,phone,email,website_url,opening_hours,cover_image,verification_status,verified,verified_at,source_name,source_url,retrieved_at,latitude,longitude,host_name,updated_at';
  var DEPT_NAMES = {
    boaco: 'Boaco', carazo: 'Carazo', chinandega: 'Chinandega', chontales: 'Chontales', esteli: 'Estelí', granada: 'Granada',
    jinotega: 'Jinotega', leon: 'León', madriz: 'Madriz', managua: 'Managua', masaya: 'Masaya', matagalpa: 'Matagalpa',
    nueva_segovia: 'Nueva Segovia', rivas: 'Rivas', rio_san_juan: 'Río San Juan', raccn: 'Costa Caribe Norte (RACCN)', raccs: 'Costa Caribe Sur (RACCS)'
  };
  var CAT = {
    hospedaje: { filter: 'lodge', icon: 'fa-bed', key: 'allies.cat.lodging', es: 'Hospedaje' },
    restaurante: { filter: 'gastro', icon: 'fa-utensils', key: 'allies.cat.food', es: 'Gastronomía' },
    comedor: { filter: 'gastro', icon: 'fa-utensils', key: 'allies.cat.food', es: 'Gastronomía' },
    kiosco: { filter: 'gastro', icon: 'fa-mug-hot', key: 'allies.cat.food', es: 'Gastronomía' },
    guia: { filter: 'guias', icon: 'fa-person-hiking', key: 'allies.cat.guides', es: 'Guías' },
    transporte: { filter: 'transporte', icon: 'fa-van-shuttle', key: 'allies.cat.transport', es: 'Transporte' }
  };
  var state = { rows: [], shown: PAGE, dialog: null };

  function t(key, fallback, vars) {
    var text = fallback;
    try { if (window.BaqueanoLanguage && window.BaqueanoLanguage.t) text = window.BaqueanoLanguage.t(key, Object.assign({ fallback: fallback }, vars || {})); } catch (_) { /* respaldo */ }
    return String(text).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; });
  }
  function lang() { try { return (window.BaqueanoLanguage && window.BaqueanoLanguage.get && window.BaqueanoLanguage.get()) || 'es'; } catch (_) { return 'es'; } }
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'text') node.textContent = v;
      else if (k === 'className') node.className = v;
      else if (k.indexOf('on') === 0 && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? '' : String(v));
    });
    (children || []).forEach(function (c) { if (c != null && c !== false) node.append(c); });
    return node;
  }
  function icon(name) { return el('i', { className: 'fa-solid ' + name, 'aria-hidden': 'true' }); }
  function digits(v) { return String(v || '').replace(/\D/g, ''); }
  function fmtDate(v) { try { return v ? new Intl.DateTimeFormat(lang(), { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(v)) : ''; } catch (_) { return ''; } }
  function seal(b) {
    var legacy = /heredado|pendiente de revalidar/i.test(b.source_name || '');
    if (b.verification_status === 'verified' && !legacy) return { kind: 'verified', text: t('allies.sealVerified', 'Verificado con fuente') };
    if (legacy) return { kind: 'legacy', text: t('allies.sealLegacy', 'Pendiente de revalidar') };
    return { kind: 'partial', text: t('allies.sealPartial', 'Verificación parcial') };
  }
  function place(b) { return [b.municipality, DEPT_NAMES[b.department_id] || ''].filter(Boolean).join(', '); }
  function waLink(b) {
    var own = digits(b.whatsapp);
    var number = own.length >= 8 ? (own.length === 8 ? '505' + own : own) : OFFICIAL_WA;
    var text = own.length >= 8
      ? t('allies.waHello', 'Hola {name}, los encontré en BAQUEANO.', { name: b.name })
      : t('allies.waOfficial', 'Hola BAQUEANO, quiero información de contacto de {name}.', { name: b.name });
    return { url: 'https://wa.me/' + number + '?text=' + encodeURIComponent(text), own: own.length >= 8 };
  }

  // ------------------------------------------------------------------ tarjetas
  function card(b) {
    var cat = CAT[b.category] || { filter: 'otro', icon: 'fa-store', key: 'allies.cat.other', es: 'Otro' };
    var s = seal(b);
    var media = b.cover_image && /^https:\/\//.test(b.cover_image)
      ? el('img', { src: b.cover_image, alt: b.name, className: 'aliado-card-img', loading: 'lazy', decoding: 'async', width: 399, height: 260 })
      : el('div', { className: 'aliado-card-img bq-ally-noimg', role: 'img', 'aria-label': t(cat.key, cat.es) }, [icon(cat.icon)]);
    var wa = waLink(b);
    return el('article', { className: 'aliado-card-exact bq-ally-live', 'data-dept': b.department_id || '', 'data-cat': cat.filter, 'data-id': b.id }, [
      el('div', { className: 'aliado-img-box' }, [media, el('span', { className: 'bq-ally-seal is-' + s.kind }, [icon(s.kind === 'verified' ? 'fa-check' : 'fa-clock'), ' ', s.text])]),
      el('div', { className: 'aliado-card-body' }, [
        el('h3', { className: 'aliado-card-title', text: b.name }),
        el('div', { className: 'aliado-card-location' }, [icon('fa-location-dot'), ' ', place(b) || '—']),
        el('p', { className: 'aliado-card-desc', text: b.description ? b.description.slice(0, 160) + (b.description.length > 160 ? '…' : '') : t(cat.key, cat.es) }),
        b.verified_at ? el('div', { className: 'aliado-card-audit' }, [icon('fa-calendar-check'), ' ', t('allies.verifiedOn', 'Verificado: {date}', { date: fmtDate(b.verified_at) })]) : null,
        el('div', { className: 'aliado-card-actions' }, [
          el('a', { href: wa.url, target: '_blank', rel: 'noopener noreferrer', className: 'btn-aliado-whatsapp' }, [el('i', { className: 'fa-brands fa-whatsapp', 'aria-hidden': 'true' }), ' ', wa.own ? 'WhatsApp' : t('allies.officialLine', 'Línea BAQUEANO')]),
          el('button', { type: 'button', className: 'btn-aliado-profile', text: t('allies.viewProfile', 'Ver perfil'), onclick: function (e) { openProfile(b, e.currentTarget); } })
        ])
      ])
    ]);
  }

  // ------------------------------------------------------------------ ficha
  function row(label, value, href) {
    if (!value) return null;
    var content = href ? el('a', { href: href, target: href.indexOf('http') === 0 ? '_blank' : null, rel: href.indexOf('http') === 0 ? 'noopener noreferrer' : null, text: value }) : document.createTextNode(value);
    return el('div', { className: 'bq-ally-row' }, [el('dt', { text: label }), el('dd', {}, [content])]);
  }
  function openProfile(b, opener) {
    if (!state.dialog) {
      state.dialog = el('dialog', { className: 'bq-ally-dialog', 'aria-labelledby': 'bqAllyTitle' });
      state.dialog.addEventListener('click', function (e) { if (e.target === state.dialog) state.dialog.close(); });
      state.dialog.addEventListener('close', function () { document.documentElement.classList.remove('bqd-open'); if (state.opener && state.opener.focus) state.opener.focus(); });
      document.body.append(state.dialog);
    }
    state.opener = opener;
    var cat = CAT[b.category] || { icon: 'fa-store', key: 'allies.cat.other', es: 'Otro' };
    var s = seal(b);
    var wa = waLink(b);
    var tel = digits(b.phone);
    var hasCoords = isFinite(Number(b.latitude)) && isFinite(Number(b.longitude)) && b.latitude != null;
    var dept = DEPT_NAMES[b.department_id];
    var body = el('div', { className: 'bq-ally-body' }, [
      el('p', { className: 'bq-ally-kicker' }, [icon(cat.icon), ' ', t(cat.key, cat.es), ' · ', el('span', { className: 'bq-ally-seal is-' + s.kind, text: s.text })]),
      b.description ? el('p', { className: 'bq-ally-desc', text: b.description }) : null,
      el('dl', { className: 'bq-ally-data' }, [
        row(t('allies.where', 'Ubicación'), [b.address, place(b)].filter(Boolean).join(' · ')),
        row(t('allies.host', 'Anfitrión'), b.host_name),
        row(t('allies.hours', 'Horario'), typeof b.opening_hours === 'string' ? b.opening_hours : null),
        row(t('allies.phone', 'Teléfono'), tel.length >= 8 ? b.phone : null, tel.length >= 8 ? 'tel:+' + (tel.length === 8 ? '505' + tel : tel) : null),
        row(t('allies.email', 'Correo'), b.email, b.email ? 'mailto:' + b.email : null),
        row(t('allies.web', 'Sitio web'), b.website_url && /^https?:\/\//.test(b.website_url) ? b.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '') : null, b.website_url && /^https?:\/\//.test(b.website_url) ? b.website_url : null),
        row(t('allies.source', 'Fuente'), b.source_name, b.source_url && /^https?:\/\//.test(b.source_url) ? b.source_url : null),
        row(t('allies.updated', 'Última verificación'), fmtDate(b.verified_at || b.retrieved_at || b.updated_at))
      ]),
      wa.own ? null : el('p', { className: 'bq-ally-note', text: t('allies.noOwnWa', 'Este aliado todavía no tiene un WhatsApp verificado. El botón te comunica con la línea oficial de BAQUEANO, que coordina el contacto.') }),
      el('div', { className: 'bq-ally-actions' }, [
        el('a', { href: wa.url, target: '_blank', rel: 'noopener noreferrer', className: 'bq-ally-btn is-primary' }, [el('i', { className: 'fa-brands fa-whatsapp', 'aria-hidden': 'true' }), ' ', wa.own ? t('allies.contactWa', 'Contactar por WhatsApp') : t('allies.contactOfficial', 'Contactar vía BAQUEANO')]),
        hasCoords ? el('a', { href: 'mapa.html?lat=' + Number(b.latitude).toFixed(5) + '&lng=' + Number(b.longitude).toFixed(5), className: 'bq-ally-btn' }, [icon('fa-map-location-dot'), ' ', t('allies.onMap', 'Ver en el mapa')]) : null
      ]),
      dept ? el('p', { className: 'bq-ally-secondary' }, [t('allies.knowTerritory', '¿Querés conocer {territory}?', { territory: dept }), ' ', el('a', { href: 'departamento.html?id=' + b.department_id, text: t('allies.exploreTerritory', 'Explorar el territorio') })]) : null
    ]);
    state.dialog.replaceChildren(
      el('header', { className: 'bq-ally-head' }, [
        el('h2', { id: 'bqAllyTitle', text: b.name }),
        el('button', { type: 'button', className: 'bq-ally-close', 'aria-label': t('dialog.close', 'Cerrar'), onclick: function () { state.dialog.close(); } }, [icon('fa-xmark')])
      ]),
      body
    );
    state.dialog.showModal();
    document.documentElement.classList.add('bqd-open');
    state.dialog.querySelector('.bq-ally-close').focus();
  }

  // ------------------------------------------------------------------ filtros
  function rebuildFilters() {
    var deptSelect = document.getElementById('filterDepto');
    if (deptSelect) {
      var first = deptSelect.options[0];
      deptSelect.replaceChildren(first);
      Object.keys(DEPT_NAMES).forEach(function (id) {
        var n = state.rows.filter(function (r) { return r.department_id === id; }).length;
        deptSelect.append(el('option', { value: id, text: DEPT_NAMES[id] + ' (' + n + ')' }));
      });
    }
    var catSelect = document.getElementById('filterCat');
    if (catSelect) {
      var firstCat = catSelect.options[0];
      catSelect.replaceChildren(firstCat);
      [['lodge', 'allies.cat.lodging', 'Hospedaje'], ['gastro', 'allies.cat.food', 'Gastronomía'], ['guias', 'allies.cat.guides', 'Guías'], ['transporte', 'allies.cat.transport', 'Transporte']].forEach(function (c) {
        catSelect.append(el('option', { value: c[0], text: t(c[1], c[2]) }));
      });
    }
  }

  // ------------------------------------------------------------------ carga
  function render() {
    var cards = state.rows.slice(0, state.shown).map(card);
    var more = state.rows.length > state.shown
      ? el('div', { className: 'bq-ally-more' }, [el('button', { type: 'button', className: 'bq-ally-btn', text: t('allies.showMore', 'Ver más aliados ({n} restantes)', { n: state.rows.length - state.shown }), onclick: function () { state.shown += PAGE; render(); } })])
      : null;
    var count = el('p', { className: 'bq-ally-count', role: 'status', text: t('allies.countReal', '{n} aliados publicados en BAQUEANO, con su fuente y estado de verificación.', { n: state.rows.length }) });
    grid.replaceChildren.apply(grid, [count].concat(cards).concat([more]).filter(Boolean));
    renderMetrics();
    document.dispatchEvent(new CustomEvent('baqueano:alliesRendered', { detail: { total: state.rows.length } }));
  }
  // Cifras calculadas con los registros reales (antes eran números fijos: "14 verificados", "50+").
  function renderMetrics() {
    var rows = state.rows;
    var bySeal = { verified: 0, legacy: 0, partial: 0 };
    var byCat = {};
    var territories = {};
    rows.forEach(function (r) {
      bySeal[seal(r).kind] += 1;
      var c = (CAT[r.category] || { filter: 'otro' }).filter; byCat[c] = (byCat[c] || 0) + 1;
      if (r.department_id) territories[r.department_id] = true;
    });
    var set = function (id, v) { var n = document.getElementById(id); if (n) n.textContent = String(v); };
    set('allyStatTotal', rows.length);
    set('allyStatTerritories', Object.keys(territories).length);
    set('allyStatSourced', rows.filter(function (r) { return !!r.source_name; }).length);
    var strip = document.getElementById('allyMetricsRow');
    if (!strip) return;
    var items = [
      ['fa-circle-check', t('allies.mVerified', '{n} verificados con fuente', { n: bySeal.verified })],
      ['fa-clock', t('allies.mLegacy', '{n} pendientes de revalidar', { n: bySeal.legacy })],
      ['fa-circle-half-stroke', t('allies.mPartial', '{n} con verificación parcial', { n: bySeal.partial })],
      ['fa-bed', t('allies.cat.lodging', 'Hospedaje') + ' (' + (byCat.lodge || 0) + ')'],
      ['fa-utensils', t('allies.cat.food', 'Gastronomía') + ' (' + (byCat.gastro || 0) + ')'],
      ['fa-person-hiking', t('allies.cat.guides', 'Guías') + ' (' + (byCat.guias || 0) + ')'],
      ['fa-van-shuttle', t('allies.cat.transport', 'Transporte') + ' (' + (byCat.transporte || 0) + ')']
    ];
    strip.replaceChildren.apply(strip, items.map(function (it) {
      return el('div', { className: 'aliados-metric-item' }, [icon(it[0]), ' ', el('span', { text: it[1] })]);
    }));
  }

  function error() {
    grid.replaceChildren(el('div', { className: 'bq-ally-error', role: 'alert' }, [
      el('p', { text: t('allies.loadError', 'No pudimos cargar los aliados en este momento.') }),
      el('button', { type: 'button', className: 'bq-ally-btn', text: t('allies.retry', 'Reintentar'), onclick: load })
    ]));
  }
  function load() {
    grid.setAttribute('aria-busy', 'true');
    var url = REST + 'businesses?select=' + COLUMNS + '&is_published=eq.true&deleted_at=is.null&order=verification_status.asc,name.asc';
    fetch(url, { headers: { apikey: KEY, Authorization: 'Bearer ' + KEY } })
      .then(function (res) { if (!res.ok) throw new Error('http'); return res.json(); })
      .then(function (rows) {
        state.rows = (Array.isArray(rows) ? rows : []).sort(function (a, b) {
          var rank = { verified: 0, legacy: 1, partial: 2 };
          return rank[seal(a).kind] - rank[seal(b).kind] || String(a.name).localeCompare(String(b.name), 'es');
        });
        rebuildFilters(); render();
      })
      .catch(error)
      .then(function () { grid.removeAttribute('aria-busy'); });
  }
  window.addEventListener('baqueano:languageChanged', function () { if (state.rows.length) { rebuildFilters(); render(); } });
  window.BaqueanoAllies = { reload: load };
  load();
})(window, document);
