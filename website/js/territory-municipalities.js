/**
 * 🎯 POR QUÉ: el propietario pidió información de CADA municipio de cada departamento y
 *   región. La cuadrícula de municipios mostraba solo nombre + una frase. Regla del
 *   proyecto: no inventar. Solo se muestra lo calculado o citado, y lo demás se declara
 *   pendiente.
 * ⚙️ CÓMO: data/municipalities.json (generado por tools/data/build-municipalities.mjs desde
 *   el contorno oficial geoBoundaries/OSM y el catálogo BAQUEANO) se descarga una sola vez
 *   cuando el territorio se pinta. Cada tarjeta conserva la identidad curada y agrega:
 *   área del contorno, lugares de BAQUEANO dentro del municipio, "Ver en el mapa"
 *   (encuadre del municipio en OpenStreetMap, no un pin inventado), "Planificar con BAQUI"
 *   y qué falta verificar. Textos de interfaz en 6 idiomas (claves territory.municipality.*).
 * 📦 QUÉ: window.BaqueanoMunicipalities.enhance(dept, gridElement), llamado por
 *   departamento.html después de pintar #deptMunicipalitiesGrid.
 */
(function (window, document) {
  'use strict';
  var DATA_URL = 'data/municipalities.json?v=20261006-muni-1';
  var dataPromise = null;

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
  function icon(name) { var i = el('i', 'fa-solid ' + name); i.setAttribute('aria-hidden', 'true'); return i; }
  function load() {
    if (!dataPromise) {
      dataPromise = fetch(DATA_URL, { credentials: 'same-origin' })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .catch(function () { dataPromise = null; return null; });
    }
    return dataPromise;
  }
  function format(n) {
    var lang = (document.documentElement.lang || 'es').slice(0, 2);
    try { return new Intl.NumberFormat(lang, { maximumFractionDigits: n < 10 ? 1 : 0 }).format(n); } catch (e) { return String(n); }
  }

  function card(m, dept) {
    var item = el('article', 'dept-place-item dept-mun-card');
    var title = el('h5', 'dept-item-title');
    title.append(icon('fa-location-dot'), ' ');
    var name = el('span', '', m.name); name.setAttribute('translate', 'no');
    title.append(name);
    item.append(title);
    if (m.identity) item.append(el('p', 'dept-item-desc', m.identity));

    var facts = el('p', 'dept-mun-facts');
    facts.append(icon('fa-ruler-combined'), ' ', i18n('territory.municipality.area', '≈ {area} km² (área del contorno)', { area: format(m.area_km2) }));
    facts.title = i18n('territory.municipality.areaHint', 'Calculada del contorno oficial OpenStreetMap/geoBoundaries; puede incluir agua de lagos y lagunas.');
    item.append(facts);

    var places = el('p', 'dept-mun-places');
    places.append(icon('fa-map-pin'), ' ');
    if (m.places && m.places.length) {
      var shown = m.places.slice(0, 3).join(' · ');
      var rest = m.places.length - 3;
      var heading = m.places.length === 1
        ? i18n('territory.municipality.placesOne', '1 lugar en BAQUEANO')
        : i18n('territory.municipality.places', '{count} lugares en BAQUEANO', { count: m.places.length });
      places.append(el('strong', '', heading + ': '), shown + (rest > 0 ? ' ' + i18n('territory.municipality.morePlaces', 'y {count} más', { count: rest }) : ''));
    } else {
      places.append(i18n('territory.municipality.noPlaces', 'Aún sin lugares verificados en BAQUEANO'));
    }
    item.append(places);

    var actions = el('div', 'dept-mun-actions');
    if (Array.isArray(m.bbox) && m.bbox.length === 4) {
      var map = el('a', 'dept-mun-btn');
      map.href = 'https://www.openstreetmap.org/?minlon=' + m.bbox[0] + '&minlat=' + m.bbox[1] + '&maxlon=' + m.bbox[2] + '&maxlat=' + m.bbox[3];
      map.target = '_blank';
      map.rel = 'noopener noreferrer';
      map.setAttribute('aria-label', i18n('territory.municipality.mapLabel', 'Ver en el mapa: {name} (OpenStreetMap, abre una pestaña nueva)', { name: m.name }));
      map.append(icon('fa-map'), ' ', i18n('territory.municipality.map', 'Ver en el mapa'));
      actions.append(map);
    }
    var plan = el('a', 'dept-mun-btn');
    plan.href = 'baqueano-ia.html?q=' + encodeURIComponent(i18n('territory.municipality.baquiQuery', 'Quiero conocer {name}, {department}', { name: m.name, department: dept.name }));
    plan.setAttribute('aria-label', i18n('territory.municipality.planLabel', 'Planificar con BAQUI: {name}', { name: m.name }));
    plan.append(icon('fa-wand-magic-sparkles'), ' ', i18n('territory.municipality.plan', 'Planificar con BAQUI'));
    actions.append(plan);
    item.append(actions);

    item.append(el('p', 'dept-mun-pending', i18n('territory.municipality.pending', 'Población, historia y fiestas patronales: por verificar con fuente oficial.')));
    return item;
  }

  var current = null;
  function enhance(dept, grid) {
    if (!dept || !grid) return;
    current = { dept: dept, grid: grid };
    var departmentId = String(dept.id).replace(/-/g, '_');
    grid.setAttribute('aria-busy', 'true');
    load().then(function (data) {
      grid.setAttribute('aria-busy', 'false');
      // Si el usuario cambió de territorio mientras cargaba, no se pinta el anterior.
      if (!data || !grid.isConnected || (grid.dataset.department && grid.dataset.department !== departmentId)) return;
      var list = (data.municipalities || []).filter(function (m) { return m.department_id === departmentId; });
      if (!list.length) return;
      grid.replaceChildren.apply(grid, list.map(function (m) { return card(m, dept); }));
      var note = grid.parentElement && grid.parentElement.querySelector('.dept-mun-source');
      if (!note) { note = el('p', 'dept-mun-source'); grid.after(note); }
      note.textContent = i18n('territory.municipality.source', 'Contornos: geoBoundaries · © OpenStreetMap (ODbL). Las áreas se calculan del contorno.') + ' ' +
        i18n('territory.municipality.count', '{count} municipios', { count: list.length });
      var profile = document.getElementById('deptTerritorialProfile');
      if (profile) profile.hidden = false;
    });
  }

  // Las tarjetas pueden pintarse antes de que cargue el idioma del visitante: se vuelven a
  // pintar con el catálogo activo cuando el idioma cambia (o termina de cargar).
  function rerender() { if (current && current.grid.isConnected) enhance(current.dept, current.grid); }
  window.addEventListener('baqueano:languageChanged', rerender);
  window.addEventListener('baqueano:i18nReady', rerender);

  window.BaqueanoMunicipalities = { enhance: enhance, load: load };
})(window, document);
