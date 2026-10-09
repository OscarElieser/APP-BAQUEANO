// ============================================================================
// 🧭 BAQUEANO — ATLAS DE TODOS LOS DESTINOS EN EL MAPA (mapa-atlas.js)
// ============================================================================
// 🎯 POR QUÉ: pedido del propietario (2026-10-09): «mostrar todos los pines de todos los
//    destinos que tenemos, que se vean bien bonito». El mapa tenía 22 puntos escritos a mano
//    con etiquetas fijas que se encimaban.
// ⚙️ CÓMO:
//    - Lee los lugares publicados de Supabase (BaqueanoPlacesService.getPublishedPlaces) y
//      pinta SOLO los que tienen coordenadas reales dentro de Nicaragua; nunca inventa una
//      ubicación (los que no tienen se cuentan en la leyenda).
//    - Suma los hospedajes verificados que ya traía mapa.html (coordenadas exactas).
//    - Pines en gota con el color e ícono de su grupo; ubicación aproximada o centroide →
//      borde punteado y aviso en el globo. Agrupación por zona (Leaflet.markercluster) con
//      anillo de colores proporcional a los grupos que contiene.
//    - Filtros por grupo con conteo real, buscador, números del encabezado y leyenda vivos.
//    - Sin Supabase: usa los puntos de respaldo de mapa.html.
// 📦 QUÉ: window.BaqueanoAtlas = { mount(map, fallbackPlaces), render(group, query) }.
// ============================================================================
(function (window, document) {
  'use strict';

  var GROUPS = {
    volcan: { color: '#DC2626', icon: 'fa-volcano', key: 'pages.mapa.atlas.cat.volcan', label: 'Volcanes' },
    playa: { color: '#0284C7', icon: 'fa-umbrella-beach', key: 'pages.mapa.atlas.cat.playa', label: 'Playas' },
    agua: { color: '#0D9488', icon: 'fa-water', key: 'pages.mapa.atlas.cat.agua', label: 'Ríos, lagos y cascadas' },
    naturaleza: { color: '#4A7A5A', icon: 'fa-leaf', key: 'pages.mapa.atlas.cat.naturaleza', label: 'Naturaleza' },
    cultura: { color: '#F65E01', icon: 'fa-landmark', key: 'pages.mapa.atlas.cat.cultura', label: 'Cultura e historia' },
    comunidad: { color: '#165D6F', icon: 'fa-people-roof', key: 'pages.mapa.atlas.cat.comunidad', label: 'Turismo comunitario' },
    hospedaje: { color: '#B7791F', icon: 'fa-bed', key: 'pages.mapa.atlas.cat.hospedaje', label: 'Hospedajes' }
  };
  var ORDER = ['volcan', 'playa', 'agua', 'naturaleza', 'cultura', 'comunidad', 'hospedaje'];
  // Categoría de Supabase → [grupo, ícono propio]
  var CATEGORY = {
    volcan: ['volcan', 'fa-volcano'], playa: ['playa', 'fa-umbrella-beach'],
    rio: ['agua', 'fa-water'], laguna: ['agua', 'fa-water'], lago: ['agua', 'fa-ship'], cascada: ['agua', 'fa-droplet'], isla: ['agua', 'fa-sailboat'],
    reserva: ['naturaleza', 'fa-tree'], parque: ['naturaleza', 'fa-tree'], cerro: ['naturaleza', 'fa-mountain'], cueva: ['naturaleza', 'fa-dungeon'], mirador: ['naturaleza', 'fa-binoculars'],
    sitio_historico: ['cultura', 'fa-landmark'], centro_cultural: ['cultura', 'fa-masks-theater'], museo: ['cultura', 'fa-building-columns'], mercado: ['cultura', 'fa-store'], atractivo: ['cultura', 'fa-star'],
    turismo_comunitario: ['comunidad', 'fa-people-roof'], turismo_rural: ['comunidad', 'fa-house-chimney'], agroturismo: ['comunidad', 'fa-seedling'],
    // Puntos de respaldo de mapa.html
    naturaleza: ['naturaleza', 'fa-leaf'], cultura: ['cultura', 'fa-landmark'], coop: ['comunidad', 'fa-people-roof'],
    hoteles: ['hospedaje', 'fa-hotel'], hostales: ['hospedaje', 'fa-bed'], ecolodges: ['hospedaje', 'fa-tree'], resorts: ['hospedaje', 'fa-umbrella-beach']
  };
  var DEPARTMENTS = {
    boaco: 'Boaco', carazo: 'Carazo', chinandega: 'Chinandega', chontales: 'Chontales', raccn: 'Costa Caribe Norte',
    raccs: 'Costa Caribe Sur', esteli: 'Estelí', granada: 'Granada', jinotega: 'Jinotega', leon: 'León', madriz: 'Madriz',
    managua: 'Managua', masaya: 'Masaya', matagalpa: 'Matagalpa', nueva_segovia: 'Nueva Segovia', rio_san_juan: 'Río San Juan', rivas: 'Rivas'
  };
  var PRECISE = { exact: true, reference: true };

  var state = { map: null, cluster: null, places: [], missing: 0, group: 'all', query: '' };

  function i18n(key, fallback, vars) {
    var out = fallback;
    try { out = (window.BaqueanoLanguage && window.BaqueanoLanguage.t(key, { fallback: fallback })) || fallback; } catch (_) { out = fallback; }
    return String(out).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; });
  }
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function norm(value) { return String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function inNicaragua(lat, lng) { return lat >= 10.5 && lat <= 15.2 && lng >= -88 && lng <= -82.5; }

  // Foto real del lugar o, si no hay, una foto real de su territorio (misma regla que el catálogo).
  function photoFor(deptId, id, own) {
    if (own) return { src: own, territory: false };
    var entry = (window.BAQUEANO_MEDIA_CATALOG || {})[String(deptId || '').replace(/_/g, '-')];
    var list = entry && entry.carousel && entry.carousel.length ? entry.carousel : null;
    if (!list) return null;
    var hash = 0;
    String(id).split('').forEach(function (ch) { hash = (hash * 31 + ch.charCodeAt(0)) >>> 0; });
    return { src: list[hash % list.length], territory: true };
  }

  function fromSupabase(p) {
    var lat = Number(p.latitude), lng = Number(p.longitude);
    if (p.latitude == null || p.longitude == null || p.location_precision === 'missing' || !inNicaragua(lat, lng)) return null;
    var cat = CATEGORY[p.category] || ['cultura', 'fa-location-dot'];
    var attrs = p.attributes || {};
    return {
      id: p.slug || p.id, name: p.name, lat: lat, lng: lng, group: cat[0], icon: cat[1],
      typeKey: 'destinos.verified.kind.' + p.category, type: p.type_label || '',
      dept: DEPARTMENTS[p.department_id] || '', deptId: p.department_id, zone: p.zone_text || '',
      desc: p.short_description || '', precise: !!PRECISE[p.location_precision],
      verification: p.verification_status || 'pending_review',
      photo: photoFor(p.department_id, p.id || p.name, attrs.cover_image || attrs.image),
      link: p.department_id ? 'departamento.html?id=' + encodeURIComponent(String(p.department_id).replace(/_/g, '-')) + '&ir=' + encodeURIComponent(p.name) : 'destinos.html'
    };
  }
  function fromFallback(p) {
    var cat = CATEGORY[p.cat] || ['cultura', 'fa-location-dot'];
    return {
      id: p.id, name: p.name, lat: p.lat, lng: p.lng, group: cat[0], icon: cat[1], typeKey: '', type: p.type || '',
      dept: p.dept || '', zone: p.muni || '', desc: p.desc || '', precise: true,
      verification: p.verified ? 'verified' : 'pending_review', photo: p.img ? { src: p.img, territory: false } : null,
      link: 'destinos.html?q=' + encodeURIComponent(p.name), phone: p.phone, whatsapp: p.whatsapp
    };
  }

  function pinIcon(place) {
    var g = GROUPS[place.group];
    return window.L.divIcon({
      className: 'bq-atlas-pin-wrap',
      html: '<span class="bq-atlas-pin' + (place.precise ? '' : ' is-approx') + '" style="--pin:' + g.color + '"><i class="fa-solid ' + place.icon + '" aria-hidden="true"></i></span>',
      iconSize: [34, 42], iconAnchor: [17, 40], popupAnchor: [0, -36], tooltipAnchor: [0, -38]
    });
  }

  // Anillo de la agrupación: colores proporcionales a los grupos que contiene.
  function clusterIcon(cluster) {
    var counts = {};
    cluster.getAllChildMarkers().forEach(function (m) { counts[m.options.bqGroup] = (counts[m.options.bqGroup] || 0) + 1; });
    var total = cluster.getChildCount(), acc = 0, stops = [];
    ORDER.forEach(function (g) {
      if (!counts[g]) return;
      var from = acc / total * 360; acc += counts[g];
      stops.push(GROUPS[g].color + ' ' + from.toFixed(1) + 'deg ' + (acc / total * 360).toFixed(1) + 'deg');
    });
    var size = total < 10 ? 44 : total < 40 ? 52 : 62;
    return window.L.divIcon({
      className: 'bq-atlas-cluster-wrap',
      html: '<span class="bq-atlas-cluster" style="--ring:conic-gradient(' + stops.join(',') + ');width:' + size + 'px;height:' + size + 'px"><b>' + total + '</b></span>',
      iconSize: [size, size]
    });
  }

  function popupHtml(place) {
    var g = GROUPS[place.group];
    var type = place.typeKey ? i18n(place.typeKey, place.type || i18n(g.key, g.label)) : (place.type || i18n(g.key, g.label));
    var seal = place.verification === 'verified'
      ? '<span class="bq-atlas-seal is-verified"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> ' + esc(i18n('places.verified.seal', 'Verificado')) + '</span>'
      : '<span class="bq-atlas-seal"><i class="fa-solid fa-clock" aria-hidden="true"></i> ' + esc(i18n('pages.destinos.live.pending', 'Por verificar')) + '</span>';
    var photo = place.photo ? '<div class="bq-atlas-photo"><img src="' + esc(place.photo.src) + '" alt="" loading="lazy" decoding="async">' +
      (place.photo.territory ? '<span>' + esc(i18n('pages.destinos.live.territoryPhoto', 'Foto del territorio')) + '</span>' : '') + '</div>' : '';
    var where = [place.zone, place.dept].filter(Boolean).join(' · ');
    var approx = place.precise ? '' : '<p class="bq-atlas-approx"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> ' + esc(i18n('pages.mapa.atlas.approx', 'Ubicación aproximada: confirmá el acceso con la comunidad o el prestador.')) + '</p>';
    var route = 'https://www.google.com/maps/dir/?api=1&destination=' + place.lat + ',' + place.lng;
    return '<article class="bq-atlas-card" style="--pin:' + g.color + '">' + photo +
      '<div class="bq-atlas-body">' +
      '<span class="bq-atlas-kind"><i class="fa-solid ' + place.icon + '" aria-hidden="true"></i> ' + esc(type) + '</span>' +
      '<h4 translate="no">' + esc(place.name) + '</h4>' +
      (where ? '<p class="bq-atlas-where" translate="no"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ' + esc(where) + '</p>' : '') +
      seal + (place.desc ? '<p class="bq-atlas-desc">' + esc(place.desc) + '</p>' : '') + approx +
      '<div class="bq-atlas-actions">' +
      '<a class="is-primary" href="' + esc(place.link) + '">' + esc(i18n('testimonials.viewDestination', 'Ver destino')) + '</a>' +
      '<a href="' + route + '" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-diamond-turn-right" aria-hidden="true"></i> ' + esc(i18n('pages.mapa.atlas.directions', 'Cómo llegar')) + '</a>' +
      '</div></div></article>';
  }

  function matches(place) {
    if (state.group !== 'all' && place.group !== state.group) return false;
    if (!state.query) return true;
    return norm([place.name, place.dept, place.zone, place.type, i18n(GROUPS[place.group].key, GROUPS[place.group].label)].join(' ')).indexOf(norm(state.query)) !== -1;
  }

  function render(group, query) {
    if (group != null) state.group = group;
    if (query != null) state.query = String(query).trim();
    if (!state.cluster) return;
    state.cluster.clearLayers();
    var shown = state.places.filter(matches);
    state.cluster.addLayers(shown.map(function (p) { return p.marker; }));
    var empty = document.getElementById('mapAtlasEmpty');
    if (empty) empty.hidden = shown.length > 0;
    if (shown.length && (state.query || state.group !== 'all')) {
      var bounds = window.L.latLngBounds(shown.map(function (p) { return [p.lat, p.lng]; }));
      state.map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 });
    }
    return shown.length;
  }

  function paintCounts() {
    var counts = { all: state.places.length };
    state.places.forEach(function (p) { counts[p.group] = (counts[p.group] || 0) + 1; });
    document.querySelectorAll('.map-chip-btn[data-cat]').forEach(function (chip) {
      var c = chip.getAttribute('data-cat');
      var n = chip.querySelector('.map-chip-count');
      if (n) n.textContent = counts[c] || 0;
      chip.hidden = c !== 'all' && !counts[c];
    });
    var placesStat = document.querySelector('[data-atlas-stat="places"]');
    if (placesStat) placesStat.textContent = state.places.length;
    var groupsStat = document.querySelector('[data-atlas-stat="groups"]');
    if (groupsStat) groupsStat.textContent = ORDER.filter(function (g) { return counts[g]; }).length;
    var legend = document.getElementById('mapAtlasLegendItems');
    if (legend) {
      legend.replaceChildren();
      ORDER.forEach(function (g) {
        if (!counts[g]) return;
        var row = document.createElement('span');
        var dot = document.createElement('i'); dot.className = 'legend-dot'; dot.style.background = GROUPS[g].color;
        var label = document.createElement('span'); label.setAttribute('data-i18n', GROUPS[g].key); label.textContent = i18n(GROUPS[g].key, GROUPS[g].label);
        row.append(dot, ' ', label, ' ');
        var n = document.createElement('small'); n.textContent = counts[g]; row.appendChild(n);
        legend.appendChild(row);
      });
    }
    var missing = document.getElementById('mapAtlasMissing');
    if (missing) {
      missing.hidden = !state.missing;
      missing.textContent = i18n('pages.mapa.atlas.missingNote', '{n} lugares publicados aún no tienen coordenadas verificadas y no se muestran.', { n: state.missing });
    }
  }

  function build(places) {
    state.places = places.map(function (place) {
      place.marker = window.L.marker([place.lat, place.lng], { icon: pinIcon(place), bqGroup: place.group, title: place.name, riseOnHover: true });
      place.marker.bindPopup(function () { return popupHtml(place); }, { maxWidth: 300, minWidth: 260, className: 'bq-atlas-popup', autoPanPadding: [40, 90] });
      place.marker.bindTooltip(esc(place.name), { direction: 'top', offset: [0, -2], className: 'bq-atlas-tip' });
      return place;
    });
    paintCounts();
    render();
    var q = new URLSearchParams(window.location.search).get('q');
    if (q) {
      var hit = state.places.find(function (p) { return norm(p.name).indexOf(norm(q)) !== -1 || norm(q).indexOf(norm(p.name)) !== -1; });
      if (hit) window.setTimeout(function () { state.cluster.zoomToShowLayer(hit.marker, function () { hit.marker.openPopup(); }); }, 300);
    }
    document.documentElement.setAttribute('data-atlas-source', state.source);
  }

  function mount(map, fallbackPlaces) {
    if (!map || !window.L || state.map) return;
    state.map = map;
    state.cluster = window.L.markerClusterGroup
      ? window.L.markerClusterGroup({ iconCreateFunction: clusterIcon, showCoverageOnHover: false, spiderfyOnMaxZoom: true, maxClusterRadius: 48, chunkedLoading: true })
      : window.L.layerGroup();
    if (!state.cluster.addLayers) state.cluster.addLayers = function (layers) { layers.forEach(function (l) { state.cluster.addLayer(l); }); };
    if (!state.cluster.zoomToShowLayer) state.cluster.zoomToShowLayer = function (layer, cb) { map.setView(layer.getLatLng(), 13); cb(); };
    map.addLayer(state.cluster);
    var lodging = (fallbackPlaces || []).filter(function (p) { return /^hosp_/.test(p.id); }).map(fromFallback);
    var useFallback = function () {
      state.source = 'static';
      build((fallbackPlaces || []).map(fromFallback));
    };
    var service = window.BaqueanoPlacesService;
    if (!service || typeof service.getPublishedPlaces !== 'function') return useFallback();
    service.getPublishedPlaces({ limit: 1000 }).then(function (result) {
      var rows = (result && result.source === 'supabase' && result.places) || [];
      if (!rows.length) return useFallback();
      var mapped = rows.map(fromSupabase);
      state.missing = mapped.filter(function (p) { return !p; }).length;
      state.source = 'supabase';
      build(mapped.filter(Boolean).concat(lodging));
    }).catch(useFallback);
  }

  window.addEventListener('baqueano:languageChanged', function () { if (state.places.length) paintCounts(); });
  window.BaqueanoAtlas = { mount: mount, render: render };
})(window, document);
