/**
 * 🧭 BAQUEANO — CENTRO DE NAVEGACIÓN «CÓMO LLEGAR» (js/bq-navigator.js)
 * 🎯 POR QUÉ: pedido del propietario (20-10-2026): «Cómo llegar» no debe sacar a la persona de
 *   BAQUEANO hacia Google Maps. La ruta, la distancia, el tiempo y las indicaciones se ven dentro
 *   de la plataforma, con su ubicación y seguimiento GPS si lo autoriza. «Arma la navegación
 *   interna que tenemos»: se usa la base de mapas actual (Leaflet + OpenStreetMap) mientras el
 *   proyecto no tenga habilitada la Routes API de Google (comprobado el 20-10-2026).
 * ⚙️ CÓMO:
 *   - Rutas reales por carretera: Valhalla (servidor comunitario de OpenStreetMap, FOSSGIS),
 *     con indicaciones en el idioma de la persona (el chino no existe en Valhalla: van en inglés
 *     y se avisa). Auto, moto, a pie y bici; bus desactivado porque en Nicaragua no hay horarios
 *     de transporte público en línea (no se inventan).
 *   - Origen: la ubicación del navegador SOLO al tocar «Usar mi ubicación», o un lugar escrito a
 *     mano (búsqueda en OpenStreetMap/Nominatim limitada a Nicaragua). Nada se guarda ni se envía
 *     a BAQUEANO: la posición solo viaja al servidor de rutas para calcular el trayecto.
 *   - Sin coordenadas verificadas no hay ruta (aviso). Un punto marcado como «área general» (centro
 *     de un lago o reserva) se muestra en el mapa pero no se traza ruta hasta un acceso confirmado.
 *   - «Iniciar navegación»: watchPosition, posición en el mapa, próximo paso, distancia restante,
 *     aviso si te salís de la ruta (tolerancia según la precisión del GPS) y «Recalcular». Voz
 *     opcional (speechSynthesis). Se mantiene la pantalla encendida si el navegador lo permite.
 *   - Integración sin tocar cada botón: intercepta los enlaces que antes iban a Google Maps
 *     (dir/?destination=, ?q=, search/?query= con coordenadas) y los elementos [data-bq-route].
 *     Sin JavaScript el enlace sigue funcionando. Los de SOS no se tocan.
 *   - El botón «Atrás» del navegador cierra el mapa y vuelve a la ficha; el idioma cambia en vivo
 *     y, si hay una ruta, se piden las indicaciones en el idioma nuevo.
 * 📦 QUÉ: window.BaqueanoNavigator = { open({ lat, lng, name, image, id, precision, stops }), close() }.
 */
(function () {
  'use strict';
  if (window.BaqueanoNavigator) return;

  var ROUTER = 'https://valhalla1.openstreetmap.de/route';
  var GEOCODER = 'https://nominatim.openstreetmap.org/search';
  var LEAFLET_JS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
  var LEAFLET_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
  var ROUTE_LANG = { es: 'es-ES', en: 'en-US', fr: 'fr-FR', it: 'it-IT', pt: 'pt-BR', de: 'de-DE', ko: 'ko-KR', zh: 'en-US' };
  var SPEECH_LANG = { es: 'es-419', en: 'en-US', fr: 'fr-FR', it: 'it-IT', pt: 'pt-BR', de: 'de-DE', ko: 'ko-KR', zh: 'en-US' };
  // Nicaragua con margen (incluye los cayos del Caribe): fuera de aquí no se calcula ruta.
  var BBOX = { s: 10.5, n: 15.2, w: -88.2, e: -82.4 };
  var MODES = [
    { id: 'auto', icon: 'fa-car', key: 'routeNav.mode.auto', es: 'Auto' },
    { id: 'motorcycle', icon: 'fa-motorcycle', key: 'routeNav.mode.moto', es: 'Moto' },
    { id: 'pedestrian', icon: 'fa-person-walking', key: 'routeNav.mode.walk', es: 'A pie' },
    { id: 'bicycle', icon: 'fa-bicycle', key: 'routeNav.mode.bike', es: 'Bici' },
    { id: 'transit', icon: 'fa-bus', key: 'routeNav.mode.bus', es: 'Bus', disabled: true }
  ];

  var state = {
    root: null, map: null, layers: null, dest: null, stops: [], origin: null, mode: 'auto',
    routes: [], active: 0, watchId: null, posMarker: null, accCircle: null, lastIndex: 0,
    offCount: 0, voice: false, spoken: {}, wakeLock: null, pushed: false, opener: null,
    reqId: 0, cache: new Map(), geoResults: []
  };

  // ── Utilidades ────────────────────────────────────────────────────────────
  function lang() { try { return (window.BaqueanoLanguage && window.BaqueanoLanguage.get()) || 'es'; } catch (_) { return 'es'; } }
  function locale() { try { return (window.BaqueanoLanguage && window.BaqueanoLanguage.getLocale()) || 'es-NI'; } catch (_) { return 'es-NI'; } }
  function t(key, fallback, vars) {
    var out = fallback;
    try {
      if (window.BaqueanoLanguage && window.BaqueanoLanguage.t) {
        var v = window.BaqueanoLanguage.t(key, { fallback: fallback });
        if (v && v !== key) out = v;
      }
    } catch (_) { out = fallback; }
    return String(out).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; });
  }
  function el(tag, cls, attrs) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (attrs[k] != null && attrs[k] !== false) n.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    });
    return n;
  }
  function icon(name) { return el('i', 'fa-solid ' + name, { 'aria-hidden': 'true' }); }
  // Texto traducible: guarda la clave para volver a traducir al cambiar de idioma.
  function label(node, key, es, vars) {
    node.dataset.navKey = key; node.dataset.navEs = es;
    if (vars) node.dataset.navVars = JSON.stringify(vars); else delete node.dataset.navVars;
    node.textContent = t(key, es, vars);
    return node;
  }
  function relabel() {
    if (!state.root) return;
    state.root.querySelectorAll('[data-nav-key]').forEach(function (n) {
      var vars = n.dataset.navVars ? JSON.parse(n.dataset.navVars) : null;
      n.textContent = t(n.dataset.navKey, n.dataset.navEs, vars);
    });
    state.root.querySelectorAll('[data-nav-aria]').forEach(function (n) {
      n.setAttribute('aria-label', t(n.dataset.navAria, n.dataset.navAriaEs));
    });
  }
  function aria(node, key, es) { node.dataset.navAria = key; node.dataset.navAriaEs = es; node.setAttribute('aria-label', t(key, es)); return node; }
  function validCoords(lat, lng) {
    lat = Number(lat); lng = Number(lng);
    return isFinite(lat) && isFinite(lng) && !(lat === 0 && lng === 0) && lat >= BBOX.s && lat <= BBOX.n && lng >= BBOX.w && lng <= BBOX.e;
  }
  function fmtKm(km) {
    var nf = function (v, d) { return Number(v).toLocaleString(locale(), { maximumFractionDigits: d, minimumFractionDigits: 0 }); };
    return km < 1 ? nf(Math.round(km * 1000 / 10) * 10, 0) + ' m' : nf(km, km < 10 ? 1 : 0) + ' km';
  }
  function fmtDuration(sec) {
    var m = Math.round(sec / 60);
    if (m < 60) return t('routeNav.minutes', '{n} min', { n: m });
    var h = Math.floor(m / 60), r = m % 60;
    return r ? t('routeNav.hoursMinutes', '{h} h {m} min', { h: h, m: r }) : t('routeNav.hours', '{h} h', { h: h });
  }
  function fmtClock(date) { try { return date.toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' }); } catch (_) { return ''; } }
  function haversine(a, b) {
    var R = 6371000, toRad = Math.PI / 180;
    var dLat = (b[0] - a[0]) * toRad, dLng = (b[1] - a[1]) * toRad;
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a[0] * toRad) * Math.cos(b[0] * toRad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(s));
  }
  // Polilínea codificada de Valhalla (precisión 6).
  function decode(str) {
    var index = 0, lat = 0, lng = 0, out = [];
    while (index < str.length) {
      var b, shift = 0, result = 0;
      do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      lat += (result & 1) ? ~(result >> 1) : (result >> 1);
      shift = 0; result = 0;
      do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      lng += (result & 1) ? ~(result >> 1) : (result >> 1);
      out.push([lat / 1e6, lng / 1e6]);
    }
    return out;
  }

  // ── Leaflet bajo demanda ──────────────────────────────────────────────────
  var leafletPromise = null;
  function loadLeaflet() {
    if (window.L && window.L.map) return Promise.resolve(window.L);
    if (leafletPromise) return leafletPromise;
    leafletPromise = new Promise(function (resolve, reject) {
      if (!document.querySelector('link[href*="leaflet"]')) {
        var css = el('link', '', { rel: 'stylesheet', href: LEAFLET_CSS, crossorigin: 'anonymous' });
        document.head.appendChild(css);
      }
      var s = el('script', '', { src: LEAFLET_JS, crossorigin: 'anonymous' });
      s.onload = function () { resolve(window.L); };
      s.onerror = function () { leafletPromise = null; reject(new Error('leaflet')); };
      document.head.appendChild(s);
    });
    return leafletPromise;
  }

  // ── Interfaz ──────────────────────────────────────────────────────────────
  function build() {
    var root = el('div', 'bq-nav', { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'bqNavTitle', id: 'bqNav' });
    var mapBox = el('div', 'bq-nav-map', { id: 'bqNavMap' });
    var mapFallback = el('p', 'bq-nav-map-msg', { id: 'bqNavMapMsg', hidden: true });
    mapBox.appendChild(mapFallback);
    var locateBtn = aria(el('button', 'bq-nav-fab', { type: 'button', id: 'bqNavLocate' }), 'routeNav.myLocation', 'Mi ubicación');
    locateBtn.appendChild(icon('fa-location-crosshairs'));
    var closeBtn = aria(el('button', 'bq-nav-close', { type: 'button', id: 'bqNavClose' }), 'routeNav.close', 'Cerrar y volver');
    closeBtn.appendChild(icon('fa-xmark'));

    var panel = el('aside', 'bq-nav-panel', { id: 'bqNavPanel' });
    var grip = aria(el('button', 'bq-nav-grip', { type: 'button', 'aria-expanded': 'true', 'aria-controls': 'bqNavPanel' }), 'routeNav.togglePanel', 'Mostrar u ocultar indicaciones');
    grip.appendChild(el('span', '', { 'aria-hidden': 'true' }));

    var head = el('header', 'bq-nav-head');
    var photo = el('img', 'bq-nav-photo', { id: 'bqNavPhoto', alt: '', hidden: true, width: '72', height: '72', decoding: 'async' });
    var headText = el('div', 'bq-nav-headtext');
    headText.appendChild(label(el('p', 'bq-nav-kicker'), 'routeNav.kicker', 'Cómo llegar'));
    headText.appendChild(el('h2', '', { id: 'bqNavTitle' }));
    headText.appendChild(el('p', 'bq-nav-coords', { id: 'bqNavCoords' }));
    head.appendChild(photo); head.appendChild(headText);

    var notice = el('p', 'bq-nav-notice', { id: 'bqNavNotice', role: 'status', hidden: true });

    var originBox = el('section', 'bq-nav-origin', { 'aria-labelledby': 'bqNavOriginLbl' });
    originBox.appendChild(label(el('h3', '', { id: 'bqNavOriginLbl' }), 'routeNav.from', 'Desde'));
    var gpsBtn = el('button', 'bq-nav-btn is-primary', { type: 'button', id: 'bqNavUseGps' });
    gpsBtn.appendChild(icon('fa-location-arrow')); gpsBtn.appendChild(document.createTextNode(' '));
    gpsBtn.appendChild(label(el('span'), 'routeNav.useMyLocation', 'Usar mi ubicación'));
    var originNow = el('p', 'bq-nav-origin-now', { id: 'bqNavOriginNow', hidden: true });
    var form = el('form', 'bq-nav-manual', { id: 'bqNavManual' });
    var inputLbl = label(el('label', '', { for: 'bqNavOriginInput' }), 'routeNav.orWrite', 'O escribí desde dónde salís');
    var row = el('div', 'bq-nav-manual-row');
    var input = el('input', '', { id: 'bqNavOriginInput', type: 'search', autocomplete: 'off', maxlength: '120', enterkeyhint: 'search' });
    var searchBtn = el('button', 'bq-nav-btn', { type: 'submit' });
    searchBtn.appendChild(label(el('span'), 'routeNav.search', 'Buscar'));
    row.appendChild(input); row.appendChild(searchBtn);
    form.appendChild(inputLbl); form.appendChild(row);
    var geoList = el('ul', 'bq-nav-geolist', { id: 'bqNavGeoList', hidden: true });
    originBox.appendChild(gpsBtn); originBox.appendChild(originNow); originBox.appendChild(form); originBox.appendChild(geoList);

    var modes = el('div', 'bq-nav-modes', { role: 'radiogroup', id: 'bqNavModes' });
    aria(modes, 'routeNav.modes', 'Cómo vas a viajar');
    MODES.forEach(function (m) {
      var b = el('button', 'bq-nav-mode', { type: 'button', role: 'radio', 'aria-checked': m.id === state.mode ? 'true' : 'false', 'data-mode': m.id, disabled: !!m.disabled });
      b.appendChild(icon(m.icon)); b.appendChild(label(el('span'), m.key, m.es));
      modes.appendChild(b);
    });
    var modeNote = el('p', 'bq-nav-modenote', { id: 'bqNavModeNote', hidden: true });
    var busNote = label(el('p', 'bq-nav-modenote'), 'routeNav.note.bus', 'Bus: en Nicaragua no hay horarios de transporte público en línea, por eso no calculamos rutas en bus. Consultá en la terminal o con el negocio.');

    var status = el('p', 'bq-nav-status', { id: 'bqNavStatus', role: 'status', 'aria-live': 'polite' });
    var summary = el('div', 'bq-nav-summary', { id: 'bqNavSummary', hidden: true });
    var alts = el('div', 'bq-nav-alts', { id: 'bqNavAlts', hidden: true });

    var actions = el('div', 'bq-nav-actions', { id: 'bqNavActions', hidden: true });
    var startBtn = el('button', 'bq-nav-btn is-primary', { type: 'button', id: 'bqNavStart' });
    startBtn.appendChild(icon('fa-location-arrow')); startBtn.appendChild(document.createTextNode(' '));
    startBtn.appendChild(label(el('span'), 'routeNav.start', 'Iniciar navegación'));
    var stopBtn = el('button', 'bq-nav-btn is-danger', { type: 'button', id: 'bqNavStop', hidden: true });
    stopBtn.appendChild(icon('fa-flag-checkered')); stopBtn.appendChild(document.createTextNode(' '));
    stopBtn.appendChild(label(el('span'), 'routeNav.finish', 'Finalizar recorrido'));
    var recalcBtn = el('button', 'bq-nav-btn', { type: 'button', id: 'bqNavRecalc' });
    recalcBtn.appendChild(icon('fa-rotate')); recalcBtn.appendChild(document.createTextNode(' '));
    recalcBtn.appendChild(label(el('span'), 'routeNav.recalc', 'Recalcular ruta'));
    var voiceBtn = el('button', 'bq-nav-btn', { type: 'button', id: 'bqNavVoice', 'aria-pressed': 'false', hidden: !('speechSynthesis' in window) });
    voiceBtn.appendChild(icon('fa-volume-high')); voiceBtn.appendChild(document.createTextNode(' '));
    voiceBtn.appendChild(label(el('span'), 'routeNav.voice', 'Leer indicaciones'));
    actions.appendChild(startBtn); actions.appendChild(stopBtn); actions.appendChild(recalcBtn); actions.appendChild(voiceBtn);

    var next = el('div', 'bq-nav-next', { id: 'bqNavNext', hidden: true, role: 'status', 'aria-live': 'polite' });
    var stepsTitle = label(el('h3', 'bq-nav-steps-title', { id: 'bqNavStepsTitle', hidden: true }), 'routeNav.steps', 'Indicaciones');
    var steps = el('ol', 'bq-nav-steps', { id: 'bqNavSteps', 'aria-labelledby': 'bqNavStepsTitle' });
    var langNote = el('p', 'bq-nav-langnote', { id: 'bqNavLangNote', hidden: true });
    var safety = label(el('p', 'bq-nav-safety'), 'routeNav.safety', 'Mirá el camino, no la pantalla. Los caminos rurales pueden estar en mal estado o cerrados en temporada de lluvia: confirmá con la comunidad o el negocio antes de salir.');
    var credit = el('p', 'bq-nav-credit');
    credit.appendChild(label(el('span'), 'routeNav.credit', 'Rutas calculadas con Valhalla sobre datos de © OpenStreetMap. Tiempos estimados, no garantizados.'));

    [grip, next, head, notice, originBox, modes, busNote, modeNote, status, summary, alts, actions, stepsTitle, steps, langNote, safety, credit].forEach(function (n) { panel.appendChild(n); });
    root.appendChild(mapBox); root.appendChild(locateBtn); root.appendChild(closeBtn); root.appendChild(panel);
    document.body.appendChild(root);

    closeBtn.addEventListener('click', function () { close(); });
    grip.addEventListener('click', function () {
      var collapsed = panel.classList.toggle('is-collapsed');
      grip.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      setTimeout(function () { if (state.map) state.map.invalidateSize(); }, 350);
    });
    gpsBtn.addEventListener('click', function () { locate(true); });
    locateBtn.addEventListener('click', function () { if (state.posMarker && state.map) state.map.setView(state.posMarker.getLatLng(), 16); else locate(true); });
    form.addEventListener('submit', function (e) { e.preventDefault(); searchOrigin(input.value); });
    modes.addEventListener('click', function (e) {
      var b = e.target.closest('.bq-nav-mode');
      if (!b || b.disabled) return;
      setMode(b.dataset.mode);
    });
    modes.addEventListener('keydown', function (e) {
      if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].indexOf(e.key) === -1) return;
      var list = Array.prototype.filter.call(modes.querySelectorAll('.bq-nav-mode'), function (b) { return !b.disabled; });
      var i = list.indexOf(document.activeElement);
      var nextBtn = list[(i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : list.length - 1)) % list.length];
      if (nextBtn) { e.preventDefault(); nextBtn.focus(); setMode(nextBtn.dataset.mode); }
    });
    startBtn.addEventListener('click', startTracking);
    stopBtn.addEventListener('click', function () { stopTracking(true); });
    recalcBtn.addEventListener('click', function () { computeRoute(true); });
    voiceBtn.addEventListener('click', function () {
      state.voice = !state.voice;
      voiceBtn.setAttribute('aria-pressed', state.voice ? 'true' : 'false');
      if (!state.voice && window.speechSynthesis) window.speechSynthesis.cancel();
    });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      // Foco atrapado dentro del navegador.
      var f = Array.prototype.filter.call(root.querySelectorAll('button:not([disabled]),input,a[href],[tabindex]:not([tabindex="-1"])'), function (n) { return n.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
    return root;
  }

  function $(id) { return document.getElementById(id); }
  function setStatus(key, es, vars, tone) {
    var s = $('bqNavStatus');
    if (!s) return;
    if (!key) { s.textContent = ''; delete s.dataset.navKey; s.dataset.tone = ''; return; }
    label(s, key, es, vars);
    s.dataset.tone = tone || '';
  }
  function setNotice(key, es, vars) {
    var n = $('bqNavNotice');
    if (!key) { n.hidden = true; delete n.dataset.navKey; return; }
    label(n, key, es, vars); n.hidden = false;
  }

  // ── Mapa ──────────────────────────────────────────────────────────────────
  function ensureMap() {
    return loadLeaflet().then(function (L) {
      if (state.map) { state.map.invalidateSize(); return L; }
      // En el teléfono se hace zoom con los dedos; en escritorio los +/− van arriba a la derecha (la X está a la izquierda).
      var touch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      state.map = L.map('bqNavMap', { zoomControl: false, attributionControl: true }).setView([state.dest.lat, state.dest.lng], 12);
      if (!touch) L.control.zoom({ position: 'topright' }).addTo(state.map);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(state.map);
      state.layers = L.layerGroup().addTo(state.map);
      return L;
    }).catch(function () {
      var msg = $('bqNavMapMsg');
      label(msg, 'routeNav.err.map', 'No se pudo cargar el mapa. Revisá tu conexión.'); msg.hidden = false;
      throw new Error('map');
    });
  }
  function pin(L, latlng, kind, text) {
    var html = '<span class="bq-nav-pin is-' + kind + '">' + (text || '') + '</span>';
    return L.marker(latlng, { icon: L.divIcon({ className: 'bq-nav-pin-wrap', html: html, iconSize: [30, 30], iconAnchor: [15, 15] }), keyboard: false });
  }
  function drawBase() {
    var L = window.L;
    if (!L || !state.map) return;
    state.layers.clearLayers();
    state.stops.forEach(function (s, i) {
      var last = i === state.stops.length - 1;
      pin(L, [s.lat, s.lng], last ? 'dest' : 'stop', last ? '' : String(i + 1)).addTo(state.layers).bindTooltip(s.name || '', { direction: 'top' });
    });
    if (state.origin) pin(L, [state.origin.lat, state.origin.lng], 'origin').addTo(state.layers);
  }
  function drawRoutes() {
    var L = window.L;
    drawBase();
    if (!state.routes.length) return;
    state.routes.forEach(function (r, i) {
      if (i === state.active) return;
      var alt = L.polyline(r.shape, { color: '#64748b', weight: 6, opacity: 0.55, dashArray: '8 8' }).addTo(state.layers);
      alt.on('click', function () { selectRoute(i); });
    });
    var a = state.routes[state.active];
    L.polyline(a.shape, { color: '#ffffff', weight: 10, opacity: 0.9 }).addTo(state.layers);
    L.polyline(a.shape, { color: '#F65E01', weight: 6, opacity: 1 }).addTo(state.layers);
    state.map.fitBounds(L.latLngBounds(a.shape), { padding: [40, 40] });
  }

  // ── Origen ────────────────────────────────────────────────────────────────
  function locate(userAction) {
    if (!('geolocation' in navigator)) { setStatus('routeNav.err.noGps', 'Este navegador no puede usar tu ubicación. Escribí desde dónde salís.', null, 'warn'); return; }
    setStatus('routeNav.locating', 'Buscando tu ubicación…');
    navigator.geolocation.getCurrentPosition(function (pos) {
      var lat = pos.coords.latitude, lng = pos.coords.longitude;
      if (!validCoords(lat, lng)) {
        setStatus('routeNav.err.outside', 'Tu ubicación está fuera de Nicaragua. Escribí un punto de partida dentro del país.', null, 'warn');
        return;
      }
      setOrigin({ lat: lat, lng: lng, label: t('routeNav.myLocation', 'Mi ubicación'), labelKey: 'routeNav.myLocation', source: 'gps', accuracy: pos.coords.accuracy });
    }, function (err) {
      if (err.code === 1) setStatus('routeNav.err.denied', 'No diste permiso para usar tu ubicación. Podés escribir desde dónde salís.', null, 'warn');
      else setStatus('routeNav.err.gps', 'No pudimos obtener tu ubicación. Probá de nuevo o escribí desde dónde salís.', null, 'warn');
      if (userAction) $('bqNavOriginInput').focus();
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
  }
  function setOrigin(origin) {
    state.origin = origin;
    var now = $('bqNavOriginNow');
    now.hidden = false;
    if (origin.labelKey) label(now, 'routeNav.fromPlace', 'Saliendo desde: {place}', { place: t(origin.labelKey, origin.label) });
    else label(now, 'routeNav.fromPlace', 'Saliendo desde: {place}', { place: origin.label });
    $('bqNavGeoList').hidden = true;
    computeRoute(false);
  }
  function searchOrigin(text) {
    var q = String(text || '').trim();
    if (q.length < 3) { setStatus('routeNav.err.short', 'Escribí al menos 3 letras.', null, 'warn'); return; }
    if (!navigator.onLine) { setStatus('routeNav.err.offline', 'Sin conexión: no se puede calcular la ruta ahora.', null, 'warn'); return; }
    setStatus('routeNav.searching', 'Buscando el lugar…');
    var url = GEOCODER + '?format=jsonv2&limit=5&countrycodes=ni&accept-language=' + encodeURIComponent(lang()) + '&q=' + encodeURIComponent(q);
    fetch(url, { headers: { Accept: 'application/json' } }).then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {
      var list = $('bqNavGeoList');
      list.textContent = '';
      rows = (rows || []).filter(function (row) { return validCoords(row.lat, row.lon); });
      if (!rows.length) { setStatus('routeNav.err.notFound', 'No encontramos ese lugar en Nicaragua. Probá con el nombre del barrio, la ciudad o un punto conocido.', null, 'warn'); list.hidden = true; return; }
      setStatus(null);
      rows.forEach(function (row) {
        var li = el('li');
        var b = el('button', 'bq-nav-georow', { type: 'button', text: row.display_name });
        b.addEventListener('click', function () { setOrigin({ lat: Number(row.lat), lng: Number(row.lon), label: row.display_name.split(',').slice(0, 2).join(','), source: 'manual' }); });
        li.appendChild(b); list.appendChild(li);
      });
      list.hidden = false;
      list.querySelector('button').focus();
    }).catch(function () { setStatus('routeNav.err.network', 'No hay conexión con el servicio de mapas. Probá de nuevo.', null, 'warn'); });
  }

  // ── Rutas ─────────────────────────────────────────────────────────────────
  function setMode(mode) {
    if (state.mode === mode) return;
    state.mode = mode;
    $('bqNavModes').querySelectorAll('.bq-nav-mode').forEach(function (b) { b.setAttribute('aria-checked', b.dataset.mode === mode ? 'true' : 'false'); });
    var note = $('bqNavModeNote');
    if (mode === 'motorcycle') { label(note, 'routeNav.note.moto', 'Para moto se usa la red de carreteras para vehículos; respetá las restricciones locales.'); note.hidden = false; }
    else note.hidden = true;
    if (state.origin) computeRoute(false);
  }
  function computeRoute(force) {
    if (!state.origin || state.dest.precision === 'area') return;
    if (!navigator.onLine) { setStatus('routeNav.err.offline', 'Sin conexión: no se puede calcular la ruta ahora.', null, 'warn'); return; }
    var locations = [{ lat: state.origin.lat, lon: state.origin.lng, type: 'break' }].concat(state.stops.map(function (s) { return { lat: s.lat, lon: s.lng, type: 'break' }; }));
    var body = { locations: locations, costing: state.mode, units: 'kilometers', directions_options: { language: ROUTE_LANG[lang()] || 'es-ES' } };
    if (state.stops.length === 1) body.alternates = 2;
    var key = JSON.stringify([locations.map(function (l) { return [l.lat.toFixed(4), l.lon.toFixed(4)]; }), state.mode, body.directions_options.language]);
    if (!force && state.cache.has(key)) { applyRoutes(state.cache.get(key)); return; }
    var id = ++state.reqId;
    setStatus('routeNav.calculating', 'Calculando la ruta…');
    var ctrl = 'AbortController' in window ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 20000);
    fetch(ROUTER + '?json=' + encodeURIComponent(JSON.stringify(body)), { signal: ctrl ? ctrl.signal : undefined }).then(function (r) {
      return r.json().then(function (data) { return { ok: r.ok, status: r.status, data: data }; });
    }).then(function (res) {
      clearTimeout(timer);
      if (id !== state.reqId) return;
      if (!res.ok || !res.data.trip) {
        state.routes = []; drawRoutes(); renderRoute();
        if (res.status === 429) setStatus('routeNav.err.busy', 'El servicio de rutas está ocupado. Esperá un momento y tocá «Recalcular ruta».', null, 'warn');
        else setStatus('routeNav.err.noRoute', 'No encontramos un camino para este modo de viaje. Probá con otro modo o con otro punto de partida.', null, 'warn');
        return;
      }
      var trips = [res.data.trip].concat((res.data.alternates || []).map(function (a) { return a.trip; }));
      var routes = trips.map(function (trip) {
        var shape = [], maneuvers = [], offset = 0;
        trip.legs.forEach(function (leg) {
          var pts = decode(leg.shape);
          leg.maneuvers.forEach(function (m) { maneuvers.push({ text: m.instruction, type: m.type, km: m.length, sec: m.time, at: m.begin_shape_index + offset }); });
          shape = shape.concat(offset ? pts.slice(1) : pts);
          offset = shape.length - 1;
        });
        // Distancia acumulada para «falta X km» durante el seguimiento.
        var cum = [0];
        for (var i = 1; i < shape.length; i++) cum.push(cum[i - 1] + haversine(shape[i - 1], shape[i]));
        return { km: trip.summary.length, sec: trip.summary.time, shape: shape, cum: cum, maneuvers: maneuvers, language: trip.language };
      });
      state.cache.set(key, routes);
      applyRoutes(routes);
    }).catch(function () {
      clearTimeout(timer);
      if (id !== state.reqId) return;
      setStatus(navigator.onLine ? 'routeNav.err.network' : 'routeNav.err.offline', navigator.onLine ? 'No hay conexión con el servicio de mapas. Probá de nuevo.' : 'Sin conexión: no se puede calcular la ruta ahora.', null, 'warn');
    });
  }
  function applyRoutes(routes) {
    state.routes = routes; state.active = 0; state.lastIndex = 0; state.spoken = {};
    setStatus(null);
    drawRoutes(); renderRoute();
  }
  function selectRoute(i) { state.active = i; state.lastIndex = 0; state.spoken = {}; drawRoutes(); renderRoute(); }

  function renderRoute() {
    var summary = $('bqNavSummary'), alts = $('bqNavAlts'), steps = $('bqNavSteps'), actions = $('bqNavActions');
    var r = state.routes[state.active];
    summary.textContent = ''; alts.textContent = ''; steps.textContent = '';
    $('bqNavStepsTitle').hidden = !r;
    summary.hidden = !r; actions.hidden = !r;
    $('bqNavLangNote').hidden = true;
    if (!r) return;
    var eta = new Date(Date.now() + r.sec * 1000);
    [['fa-road', 'routeNav.distance', 'Distancia', fmtKm(r.km)], ['fa-clock', 'routeNav.duration', 'Tiempo estimado', fmtDuration(r.sec)], ['fa-flag-checkered', 'routeNav.eta', 'Llegada aprox.', fmtClock(eta)]].forEach(function (row) {
      var box = el('div', 'bq-nav-metric');
      box.appendChild(icon(row[0]));
      var txt = el('div');
      txt.appendChild(label(el('span', 'bq-nav-metric-lbl'), row[1], row[2]));
      txt.appendChild(el('strong', '', { text: row[3] }));
      box.appendChild(txt); summary.appendChild(box);
    });
    if (state.routes.length > 1) {
      alts.hidden = false;
      alts.appendChild(label(el('span', 'bq-nav-alts-lbl'), 'routeNav.alternatives', 'Otras rutas'));
      state.routes.forEach(function (route, i) {
        var b = el('button', 'bq-nav-alt' + (i === state.active ? ' is-active' : ''), { type: 'button', 'aria-pressed': i === state.active ? 'true' : 'false' });
        label(b, 'routeNav.routeOption', 'Ruta {n}: {km} · {time}', { n: i + 1, km: fmtKm(route.km), time: fmtDuration(route.sec) });
        b.addEventListener('click', function () { selectRoute(i); });
        alts.appendChild(b);
      });
    } else alts.hidden = true;
    r.maneuvers.forEach(function (m, i) {
      var li = el('li', 'bq-nav-step', { 'data-step': String(i) });
      li.appendChild(el('span', 'bq-nav-step-text', { text: m.text }));
      if (m.km > 0) li.appendChild(el('span', 'bq-nav-step-km', { text: fmtKm(m.km) }));
      steps.appendChild(li);
    });
    if (lang() === 'zh') { label($('bqNavLangNote'), 'routeNav.note.langEn', 'Las indicaciones paso a paso todavía no están disponibles en este idioma: se muestran en inglés.'); $('bqNavLangNote').hidden = false; }
  }

  // ── Seguimiento GPS ───────────────────────────────────────────────────────
  function nearest(route, p) {
    // Busca primero cerca del último punto conocido (ventana) y, si queda lejos, en toda la ruta.
    var best = { i: 0, d: Infinity };
    var from = Math.max(0, state.lastIndex - 30), to = Math.min(route.shape.length, state.lastIndex + 300);
    for (var i = from; i < to; i++) { var d = haversine(p, route.shape[i]); if (d < best.d) best = { i: i, d: d }; }
    if (best.d > 150) for (var j = 0; j < route.shape.length; j++) { var d2 = haversine(p, route.shape[j]); if (d2 < best.d) best = { i: j, d: d2 }; }
    return best;
  }
  function startTracking() {
    if (!('geolocation' in navigator)) { setStatus('routeNav.err.noGps', 'Este navegador no puede usar tu ubicación. Escribí desde dónde salís.', null, 'warn'); return; }
    if (state.watchId != null) return;
    $('bqNavStart').hidden = true; $('bqNavStop').hidden = false;
    setStatus('routeNav.tracking', 'Siguiendo tu ubicación. Podés detenerlo cuando quieras.');
    state.offCount = 0;
    try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(function (l) { state.wakeLock = l; }).catch(function () {}); } catch (_) { /* sin bloqueo de pantalla */ }
    state.watchId = navigator.geolocation.watchPosition(onPosition, function (err) {
      if (err.code === 1) { stopTracking(false); setStatus('routeNav.err.denied', 'No diste permiso para usar tu ubicación. Podés escribir desde dónde salís.', null, 'warn'); }
      else setStatus('routeNav.err.gpsWeak', 'Señal GPS débil. Seguimos intentando…', null, 'warn');
    }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });
  }
  function onPosition(pos) {
    var L = window.L, r = state.routes[state.active];
    if (!L || !state.map || !r) return;
    var p = [pos.coords.latitude, pos.coords.longitude], acc = pos.coords.accuracy || 30;
    if (!state.posMarker) {
      state.accCircle = L.circle(p, { radius: acc, color: '#165D6F', weight: 1, fillOpacity: 0.12 }).addTo(state.map);
      state.posMarker = L.marker(p, { icon: L.divIcon({ className: 'bq-nav-pin-wrap', html: '<span class="bq-nav-me"></span>', iconSize: [22, 22], iconAnchor: [11, 11] }), keyboard: false }).addTo(state.map);
      state.map.setView(p, 16);
    } else {
      state.posMarker.setLatLng(p); state.accCircle.setLatLng(p).setRadius(acc);
      if (!state.map.getBounds().pad(-0.2).contains(p)) state.map.panTo(p);
    }
    var near = nearest(r, p);
    state.lastIndex = near.i;
    // Llegó una lectura: si antes avisamos «señal débil», ya no corresponde.
    if ($('bqNavStatus').dataset.navKey === 'routeNav.err.gpsWeak') setStatus('routeNav.tracking', 'Siguiendo tu ubicación. Podés detenerlo cuando quieras.');
    var dest = state.stops[state.stops.length - 1];
    var toDest = haversine(p, [dest.lat, dest.lng]);
    if (toDest < Math.max(40, acc)) {
      showNext(t('routeNav.arrived', 'Llegaste a {place}.', { place: dest.name || '' }), '');
      speak(t('routeNav.arrived', 'Llegaste a {place}.', { place: dest.name || '' }));
      stopTracking(false);
      setStatus('routeNav.arrivedStatus', 'Llegaste. Recorrido finalizado.', null, 'ok');
      return;
    }
    // Fuera de ruta: más de max(60 m, 1,5 × precisión) en dos lecturas seguidas.
    var tolerance = Math.max(60, acc * 1.5);
    if (near.d > tolerance) state.offCount++; else state.offCount = 0;
    if (state.offCount >= 2) setStatus('routeNav.offRoute', 'Parece que te saliste de la ruta. Tocá «Recalcular ruta» para buscar otra desde donde estás.', null, 'warn');
    else if ($('bqNavStatus').dataset.navKey === 'routeNav.offRoute') setStatus('routeNav.tracking', 'Siguiendo tu ubicación. Podés detenerlo cuando quieras.');
    var remaining = r.cum[r.cum.length - 1] - r.cum[near.i];
    var nextM = null, nextIdx = -1;
    for (var k = 0; k < r.maneuvers.length; k++) { if (r.maneuvers[k].at > near.i) { nextM = r.maneuvers[k]; nextIdx = k; break; } }
    var dist = nextM ? r.cum[Math.min(nextM.at, r.cum.length - 1)] - r.cum[near.i] : remaining;
    var text = nextM ? nextM.text : t('routeNav.continue', 'Seguí hasta el destino.');
    showNext(t('routeNav.inDistance', 'En {dist}: {step}', { dist: fmtKm(dist / 1000), step: text }), t('routeNav.remaining', 'Faltan {dist}', { dist: fmtKm(remaining / 1000) }));
    $('bqNavSteps').querySelectorAll('.bq-nav-step').forEach(function (li) { li.classList.toggle('is-current', Number(li.dataset.step) === nextIdx); });
    if (nextM && dist < 250 && !state.spoken[nextIdx]) { state.spoken[nextIdx] = true; speak(text); }
    // Al recalcular desde aquí, la ruta parte de la posición real.
    state.origin = { lat: p[0], lng: p[1], label: t('routeNav.myLocation', 'Mi ubicación'), labelKey: 'routeNav.myLocation', source: 'gps' };
  }
  function showNext(main, sub) {
    var n = $('bqNavNext');
    n.textContent = '';
    n.appendChild(el('strong', '', { text: main }));
    if (sub) n.appendChild(el('span', '', { text: sub }));
    n.hidden = false;
  }
  function speak(text) {
    if (!state.voice || !('speechSynthesis' in window) || !text) return;
    try {
      var u = new SpeechSynthesisUtterance(text);
      u.lang = SPEECH_LANG[lang()] || 'es-419';
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
    } catch (_) { /* sin voz */ }
  }
  function stopTracking(announce) {
    if (state.watchId != null) { navigator.geolocation.clearWatch(state.watchId); state.watchId = null; }
    if (state.wakeLock) { try { state.wakeLock.release(); } catch (_) { /* ya liberado */ } state.wakeLock = null; }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (state.posMarker && state.map) { state.map.removeLayer(state.posMarker); state.map.removeLayer(state.accCircle); }
    state.posMarker = null; state.accCircle = null;
    var start = $('bqNavStart'), stop = $('bqNavStop');
    if (start) start.hidden = false;
    if (stop) stop.hidden = true;
    if (announce) { setStatus('routeNav.stopped', 'Seguimiento detenido.'); $('bqNavNext').hidden = true; }
    if ($('bqNavSteps')) $('bqNavSteps').querySelectorAll('.is-current').forEach(function (li) { li.classList.remove('is-current'); });
  }

  // ── Abrir y cerrar ────────────────────────────────────────────────────────
  function open(opts) {
    opts = opts || {};
    var stops = (opts.stops && opts.stops.length ? opts.stops : [opts]).map(function (s) {
      return { lat: Number(s.lat), lng: Number(s.lng), name: s.name || '', image: s.image || '', id: s.id || '', precision: s.precision || 'exact' };
    });
    var valid = stops.filter(function (s) { return validCoords(s.lat, s.lng); });
    state.opener = document.activeElement;
    if (!state.root) state.root = build();
    stopTracking(false);
    state.routes = []; state.origin = null; state.stops = valid; state.dest = valid[valid.length - 1] || stops[stops.length - 1];
    var last = stops[stops.length - 1];
    $('bqNavTitle').textContent = stops.length > 1 ? t('routeNav.tripTitle', 'Ruta de tu viaje ({n} paradas)', { n: stops.length }) : (last.name || t('routeNav.destination', 'Destino'));
    var photo = $('bqNavPhoto');
    if (last.image) { photo.src = last.image; photo.hidden = false; } else photo.hidden = true;
    $('bqNavCoords').textContent = valid.length ? valid.map(function (s) { return s.lat.toFixed(5) + ', ' + s.lng.toFixed(5); }).slice(-1)[0] : '';
    $('bqNavOriginNow').hidden = true; $('bqNavGeoList').hidden = true; $('bqNavNext').hidden = true;
    $('bqNavOriginInput').value = '';
    renderRoute(); setStatus(null); setNotice(null);
    var noCoords = valid.length !== stops.length || !valid.length;
    var area = !noCoords && state.dest.precision === 'area';
    state.dest.precision = area ? 'area' : 'exact';
    state.root.classList.toggle('is-blocked', noCoords);
    var originBox = state.root.querySelector('.bq-nav-origin'), modes = $('bqNavModes');
    originBox.hidden = noCoords || area; modes.hidden = noCoords || area;
    state.root.querySelectorAll('.bq-nav-modenote').forEach(function (n) { if (!n.id) n.hidden = noCoords || area; });
    if (noCoords) setNotice('routeNav.noCoords', 'Este lugar todavía no tiene coordenadas verificadas en BAQUEANO, así que no podemos trazar una ruta sin inventarla. Contactá al lugar para confirmar cómo llegar.');
    else if (area) setNotice('routeNav.area', 'La ubicación marcada es el área general del lugar, no su entrada. El punto de acceso está por confirmar: consultá con guías o la comunidad antes de salir.');
    document.documentElement.classList.add('bq-nav-open');
    state.root.classList.add('is-open');
    if (!state.pushed) { try { history.pushState({ bqNav: true }, '', location.pathname + location.search + '#como-llegar'); state.pushed = true; } catch (_) { /* sin history */ } }
    $('bqNavClose').focus();
    if (noCoords) return true;
    ensureMap().then(function () {
      state.map.invalidateSize();
      drawBase();
      if (state.stops.length > 1) state.map.fitBounds(window.L.latLngBounds(state.stops.map(function (s) { return [s.lat, s.lng]; })), { padding: [40, 40] });
      else state.map.setView([state.dest.lat, state.dest.lng], area ? 11 : 13);
      setTimeout(function () { if (state.map) state.map.invalidateSize(); }, 300);
      if (area) return;
      // Si la persona ya dio permiso antes, se ubica sola; si no, espera a que toque el botón.
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then(function (p) { if (p.state === 'granted') locate(false); }).catch(function () {});
      }
    }).catch(function () { /* el aviso de mapa ya se mostró */ });
    return true;
  }
  function close(fromHistory) {
    if (!state.root || !state.root.classList.contains('is-open')) return;
    stopTracking(false);
    state.reqId++;
    state.root.classList.remove('is-open');
    document.documentElement.classList.remove('bq-nav-open');
    if (state.pushed && !fromHistory) { state.pushed = false; try { history.back(); } catch (_) { /* sin history */ } }
    state.pushed = false;
    if (state.opener && state.opener.isConnected && state.opener.focus) state.opener.focus();
  }
  window.addEventListener('popstate', function () { if (state.root && state.root.classList.contains('is-open')) close(true); });

  // ── Idioma en vivo ────────────────────────────────────────────────────────
  window.addEventListener('baqueano:languageChanged', function () {
    relabel();
    if (state.root && state.root.classList.contains('is-open')) {
      if (state.origin && state.routes.length) computeRoute(false); else renderRoute();
    }
  });

  // ── Enlaces que antes iban a Google Maps ──────────────────────────────────
  function coordsFromHref(href) {
    var u;
    try { u = new URL(href, location.href); } catch (_) { return null; }
    if (!/(^|\.)google\.[a-z.]+$|^maps\.google\./.test(u.hostname) || !/maps|^\/?$/.test(u.pathname + u.hostname)) return null;
    var raw = u.searchParams.get('destination') || u.searchParams.get('query') || u.searchParams.get('q') || u.searchParams.get('daddr') || '';
    var m = /^\s*(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)\s*$/.exec(decodeURIComponent(raw));
    if (!m) return null;
    var route = /\/dir\b/.test(u.pathname) || u.searchParams.has('destination') || u.searchParams.has('daddr');
    return { lat: Number(m[1]), lng: Number(m[2]), precision: route ? 'exact' : 'area' };
  }
  var HEADING = /^(H1|H2|H3|H4|H5)$/;
  function contextName(node) {
    if (node.getAttribute('data-name')) return node.getAttribute('data-name');
    // Primero el título más cercano ANTES del botón (en su mismo bloque o en los de arriba).
    for (var n = node, up = 0; n && up < 4; n = n.parentElement, up++) {
      for (var sib = n.previousElementSibling; sib; sib = sib.previousElementSibling) {
        if (HEADING.test(sib.tagName) && sib.textContent.trim()) return sib.textContent.replace(/\s+/g, ' ').trim().slice(0, 90);
      }
    }
    var p = node.parentElement;
    for (var i = 0; p && i < 6; i++, p = p.parentElement) {
      var h = p.querySelector('h1, h2, h3, h4, h5, [class*="title"], [class*="name"]');
      if (h && !h.contains(node) && h.textContent.trim()) return h.textContent.replace(/\s+/g, ' ').trim().slice(0, 90);
    }
    return '';
  }
  // Foto de la misma tarjeta o ficha (no cualquier imagen de la página: antes podía tomar un mapa).
  function contextImage(node) {
    var card = node.closest('article, [class*="card"], [class*="popup"], .leaflet-popup-content, dialog, [class*="dossier"], [class*="place-info"]');
    if (!card) return '';
    var img = card.querySelector('img[src]:not([src^="data:"])');
    return img && img.naturalWidth > 60 ? (img.currentSrc || img.src) : '';
  }
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var target = e.target && e.target.closest ? e.target : null;
    if (!target) return;
    var trigger = target.closest('[data-bq-route]');
    var data = null;
    if (trigger) {
      data = { lat: trigger.getAttribute('data-lat'), lng: trigger.getAttribute('data-lng'), precision: trigger.getAttribute('data-precision') || 'exact' };
      // Los enlaces viejos a Google Maps ya los cuenta baqueano-analytics.js; estos botones nuevos no.
      try { if (window.BaqueanoAnalytics) window.BaqueanoAnalytics.track('directions_click', { entityType: trigger.getAttribute('data-business-id') ? 'business' : 'place', entityId: trigger.getAttribute('data-business-id') || trigger.getAttribute('data-place-id') || null }); } catch (_) { /* opcional */ }
    } else {
      var a = target.closest('a[href]');
      if (!a || a.closest('[id*="sos" i],[class*="sos" i],[data-bq-keep-external]')) return;
      data = coordsFromHref(a.getAttribute('href'));
      trigger = a;
    }
    if (!data) return;
    e.preventDefault();
    e.stopPropagation();
    // Un <dialog> modal queda siempre por encima: se cierra antes de abrir el mapa.
    var modal = trigger.closest('dialog[open]');
    if (modal) modal.close();
    open({ lat: data.lat, lng: data.lng, precision: data.precision, name: contextName(trigger), image: trigger.getAttribute('data-image') || contextImage(trigger), id: trigger.getAttribute('data-place-id') || trigger.getAttribute('data-business-id') || '' });
  }, true);

  // ── Mi viaje y el itinerario de BAQUI: ruta por carretera entre todas las paradas ──
  function tripStops() {
    var list = window.BaqueanoTrip ? window.BaqueanoTrip.list() : [];
    return list.map(function (d) { return { lat: d.lat, lng: d.lng, name: d.title, image: d.image || '', id: d.destId || '' }; });
  }
  function baquiStops() {
    var s = window.BaqueanoTravelSession && window.BaqueanoTravelSession.get ? window.BaqueanoTravelSession.get() : null;
    return (s && s.route ? s.route : []).map(function (p) { return { lat: p.latitude, lng: p.longitude, name: p.name, id: p.knowledgeId || '' }; });
  }
  function openStops(stops) {
    var withCoords = stops.filter(function (s) { return validCoords(s.lat, s.lng); });
    if (!withCoords.length) { open({ name: stops[0] ? stops[0].name : '' }); return; }
    open({ stops: withCoords.slice(0, 18) });
  }
  function shortcut(host, id, getStops, before, cls) {
    if (!host || document.getElementById(id)) return;
    var b = el('button', (cls || 'btn-route-action') + ' bq-nav-shortcut', { type: 'button', id: id });
    b.appendChild(icon('fa-route')); b.appendChild(document.createTextNode(' '));
    b.appendChild(label(el('span'), 'routeNav.tripRoute', 'Ver la ruta por carretera'));
    b.addEventListener('click', function () { openStops(getStops()); });
    if (before && before.parentNode === host) host.insertBefore(b, before.nextSibling); else host.appendChild(b);
  }
  function mountShortcuts() {
    shortcut(document.querySelector('#tabItinerario .route-action-btns'), 'bqNavTripBtn', tripStops);
    var recenter = document.getElementById('aiMapRecenterBtn');
    if (recenter) shortcut(recenter.parentNode, 'bqNavBaquiBtn', baquiStops, recenter, 'ia-chat-pill');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountShortcuts, { once: true }); else mountShortcuts();
  setTimeout(mountShortcuts, 2500);

  window.BaqueanoNavigator = Object.freeze({ open: open, openStops: openStops, close: function () { close(false); } });
})();
