// ============================================================================
// 🧭 BAQUEANO — BUSCADOR GLOBAL DE LA PLATAFORMA (global-search.js)
// ============================================================================
// 🎯 POR QUÉ:
// - El propietario pide un buscador global DENTRO de BAQUEANO: escribir
//   "playa", "León", "volcanes" u "Ometepe" debe llevar directo al punto
//   (categoría filtrada, territorio, ficha del destino, plato, artista…).
//   El buscador anterior solo conocía 21 páginas.
//
// ⚙️ CÓMO:
// - Índice generado desde los catálogos reales del sitio
//   (scripts/build-search-index.mjs → data/search-index.json, ≈120 KB) que
//   se descarga SOLO al abrir el buscador y queda en caché.
// - Normaliza tildes, entiende plurales y sinónimos de viaje, y puntúa por
//   coincidencia de título, prefijos y palabras clave, con prioridad por tipo
//   (categoría y departamento primero para búsquedas genéricas).
// - Enter con una coincidencia clara navega directo; si no, muestra la lista
//   agrupada. Teclado: ↑/↓, Enter, Esc; atajos "/" y Ctrl/⌘+K.
// - Todo el texto se inserta con textContent (sin HTML de los datos).
//
// 📦 QUÉ: window.BaqueanoSiteSearch = { open(q), close(), search(q), go(q) }.
// ============================================================================
(function (window, document) {
  'use strict';
  if (window.BaqueanoSiteSearch && window.BaqueanoSiteSearch.__v2) return;

  var INDEX_URL = 'data/search-index.json?v=2026-10-04b';
  var KIND = {
    categoria: { label: 'Categorías', order: 1, icon: 'fa-solid fa-layer-group', boost: 26 },
    departamento: { label: 'Departamentos', order: 2, icon: 'fa-solid fa-map', boost: 22 },
    destino: { label: 'Destinos', order: 3, icon: 'fa-solid fa-mountain-sun', boost: 14 },
    lugar: { label: 'Lugares', order: 4, icon: 'fa-solid fa-map-pin', boost: 8 },
    municipio: { label: 'Municipios', order: 5, icon: 'fa-solid fa-location-dot', boost: 2 },
    plato: { label: 'Gastronomía', order: 6, icon: 'fa-solid fa-bowl-food', boost: 5 },
    artista: { label: 'Música', order: 7, icon: 'fa-solid fa-music', boost: 3 },
    ruta: { label: 'Rutas', order: 8, icon: 'fa-solid fa-route', boost: 4 },
    paquete: { label: 'Paquetes', order: 9, icon: 'fa-solid fa-suitcase-rolling', boost: 2 },
    pagina: { label: 'Páginas', order: 10, icon: 'fa-regular fa-file-lines', boost: 6 }
  };
  // Sinónimos y plurales frecuentes al buscar destinos.
  var SYNONYMS = {
    playa: ['playa', 'playas', 'costa', 'mar', 'surf'], playas: ['playa', 'playas'],
    volcan: ['volcan', 'volcanes', 'crater'], volcanes: ['volcan', 'volcanes'],
    lago: ['lago', 'laguna', 'agua'], lagos: ['lago', 'laguna'], laguna: ['laguna', 'lago'], lagunas: ['laguna', 'lago'],
    cascada: ['cascada', 'salto', 'agua'], cascadas: ['cascada', 'salto'], rio: ['rio', 'agua'], rios: ['rio', 'agua'],
    isla: ['isla', 'islas', 'isletas'], islas: ['isla', 'islas'],
    montana: ['montana', 'cerro', 'bosque'], montanas: ['montana', 'cerro'],
    comida: ['comida', 'gastronomia', 'plato'], cafe: ['cafe', 'cafetal', 'finca'],
    hotel: ['hospedaje', 'hotel'], hoteles: ['hospedaje', 'hotel'], hospedaje: ['hospedaje', 'hotel', 'alojamiento'],
    colonial: ['colonial', 'cultura', 'ciudad'], ciudad: ['ciudad', 'cultura'],
    musica: ['musica', 'artista'], emergencia: ['sos', 'emergencia'], opiniones: ['testimonios', 'experiencias'],
    gallopinto: ['gallopinto', 'gallo']
  };
  // Palabras genéricas que no forman parte del nombre propio de un lugar:
  // "Ometepe" es el nombre de "Isla de Ometepe"; "Mombacho", de "Volcán Mombacho".
  var GENERIC = { isla: 1, islas: 1, de: 1, del: 1, la: 1, el: 1, los: 1, las: 1, y: 1, volcan: 1, playa: 1, laguna: 1, reserva: 1, natural: 1, parque: 1, nacional: 1, ciudad: 1, canon: 1 };
  var NAMED_KINDS = { destino: 1, departamento: 1, lugar: 1 };

  var FALLBACK = [
    { t: 'Destinos de Nicaragua', k: 'pagina', u: 'destinos.html', d: 'Volcanes, playas, montañas y ciudades.', s: 'destinos playas volcanes', i: 'fa-solid fa-compass' },
    { t: 'Departamentos y territorios', k: 'pagina', u: 'departamento.html', d: 'Los 17 territorios.', s: 'departamentos territorios', i: 'fa-solid fa-map' },
    { t: 'Mapa interactivo', k: 'pagina', u: 'mapa.html', d: 'Ubicá destinos en el mapa.', s: 'mapa', i: 'fa-solid fa-map-location-dot' }
  ];

  var records = null;
  var loading = null;
  var overlay = null;
  var field = null;
  var list = null;
  var meta = null;
  var activeIndex = -1;
  var current = [];
  var lastFocus = null;

  function norm(value) {
    return String(value || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function loadIndex() {
    if (records) return Promise.resolve(records);
    if (!loading) {
      loading = fetch(INDEX_URL, { credentials: 'same-origin', cache: 'force-cache' })
        .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
        .then(function (json) {
          records = (json.records || []).map(function (r) { r.tn = norm(r.t); return r; });
          return records;
        })
        .catch(function (error) {
          console.warn('[BAQUEANO Buscador] Índice no disponible, se usan accesos básicos:', error.message);
          records = FALLBACK.map(function (r) { r.tn = norm(r.t); return r; });
          loading = null;
          return records;
        });
    }
    return loading;
  }

  function expand(tokens) {
    var out = [];
    tokens.forEach(function (t) {
      out.push([t].concat(SYNONYMS[t] || []).concat(t.length > 4 && t.slice(-1) === 's' ? [t.slice(0, -1)] : []));
    });
    return out;
  }

  function score(record, q, groups) {
    var title = record.tn;
    var titleWords = title.split(' ');
    var hay = record.s || title;
    var hayWords = hay.split(' ');
    var points = 0;
    if (title === q) points += 120;
    else if (title.indexOf(q) === 0) points += 80;
    else if (title.indexOf(q) > 0) points += 45;
    // Lo escrito es el nombre propio del lugar → coincidencia casi exacta.
    if (title !== q && NAMED_KINDS[record.k] && titleWords.filter(function (w) { return !GENERIC[w]; }).join(' ') === q) points += 40;
    var matchedAll = true;
    var titleHits = 0;
    groups.forEach(function (variants) {
      var inTitle = variants.some(function (v) { return titleWords.some(function (w) { return w.indexOf(v) === 0; }); });
      var inHay = inTitle || variants.some(function (v) { return hayWords.some(function (w) { return w.indexOf(v) === 0; }); });
      if (inTitle) titleHits += 1;
      if (!inHay) matchedAll = false;
    });
    if (!matchedAll && points < 45) return 0;
    points += titleHits * 18 + (matchedAll ? 22 : 0);
    var kind = KIND[record.k];
    return points + (kind ? kind.boost : 0);
  }

  function search(query) {
    var q = norm(query);
    if (!q || !records) return [];
    var tokens = q.split(' ').filter(Boolean);
    var groups = expand(tokens);
    return records
      .map(function (r) { return { r: r, s: score(r, q, groups) }; })
      .filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return b.s - a.s || (KIND[a.r.k] || {}).order - (KIND[b.r.k] || {}).order || a.r.t.localeCompare(b.r.t, 'es'); })
      .slice(0, 30);
  }

  // Coincidencia clara → se puede navegar directo con Enter.
  function bestMatch(results, q) {
    if (!results.length) return null;
    var top = results[0];
    var second = results[1];
    // Un destino con ficha propia cuyo nombre empieza por lo buscado ("San Juan
    // del Sur", "Corn Island") gana al municipio o lugar homónimo: la ficha es
    // el punto exacto; el municipio solo lleva a su departamento.
    if (q && (top.r.k === 'municipio' || top.r.k === 'lugar')) {
      var ficha = results.filter(function (x) { return x.r.k === 'destino' && x.r.u.indexOf('destino.html') === 0 && x.r.tn.indexOf(q) === 0; })[0];
      if (ficha && ficha.s >= top.s - 60) return ficha.r;
    }
    if (top.s >= 130 || (top.s >= 100 && (!second || top.s - second.s >= 12))) return top.r;
    // Los dos mejores llevan al mismo lugar (p. ej. "Ometepe"): no hay ambigüedad.
    if (top.s >= 100 && second && second.r.u === top.r.u) return top.r;
    return null;
  }

  function navigate(record) {
    if (!record) return;
    if (record.u === '#sos') {
      close();
      if (typeof window.bqOpenSos === 'function') window.bqOpenSos();
      return;
    }
    window.location.href = record.u;
  }

  // ---------------- Interfaz ----------------
  function ensureStyles() {
    if (document.getElementById('bq-site-search-v2')) return;
    var style = document.createElement('style');
    style.id = 'bq-site-search-v2';
    style.textContent = [
      '.bq-gs-overlay{position:fixed;inset:0;z-index:2147481000;background:rgba(15,23,42,.6);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:grid;place-items:start center;padding:max(7vh,16px) 14px 18px}',
      '.bq-gs-overlay[hidden]{display:none!important}',
      '.bq-gs-panel{width:min(760px,100%);max-height:min(82dvh,760px);display:flex;flex-direction:column;overflow:hidden;background:#fff;border:1px solid #D7E2E6;border-radius:22px;box-shadow:0 28px 80px rgba(15,23,42,.35);font-family:"Plus Jakarta Sans",Inter,system-ui,sans-serif;color:#0F172A}',
      '.bq-gs-head{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid #E2E8F0}',
      '.bq-gs-head i{color:#165D6F;font-size:1.05rem}',
      '.bq-gs-field{flex:1;min-width:0;border:0;outline:0;font-size:1.05rem;color:#0F172A;background:transparent;padding:6px 0}',
      '.bq-gs-close{border:0;background:#F1F5F9;color:#475569;width:38px;height:38px;border-radius:12px;cursor:pointer;font-size:1.1rem;flex-shrink:0}',
      '.bq-gs-close:focus-visible,.bq-gs-item:focus-visible{outline:2px solid #F65E01;outline-offset:2px}',
      '.bq-gs-meta{padding:9px 18px;color:#64748B;font-size:.78rem;background:#F8FAFC;border-bottom:1px solid #EEF2F6}',
      '.bq-gs-list{overflow:auto;overscroll-behavior:contain;padding:6px 10px 12px}',
      '.bq-gs-group{margin:10px 8px 4px;color:#C2410C;font:800 .66rem/1.2 Montserrat,sans-serif;letter-spacing:.14em;text-transform:uppercase}',
      '.bq-gs-item{display:grid;grid-template-columns:40px 1fr auto;gap:12px;align-items:center;width:100%;padding:10px 12px;border-radius:14px;color:inherit;text-decoration:none;border:1px solid transparent;background:none;text-align:left;cursor:pointer}',
      '.bq-gs-item:hover,.bq-gs-item.is-active{background:#F2F8F9;border-color:#CFE0E4}',
      '.bq-gs-icon{width:40px;height:40px;border-radius:12px;background:#EDF6F7;color:#165D6F;display:grid;place-items:center}',
      '.bq-gs-item.is-active .bq-gs-icon{background:#165D6F;color:#fff}',
      '.bq-gs-text{min-width:0}',
      '.bq-gs-text strong{display:block;font:800 .92rem/1.25 Montserrat,sans-serif;color:#0F172A;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.bq-gs-text small{display:block;margin-top:2px;font-size:.76rem;color:#64748B;line-height:1.35;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.bq-gs-dep{font-size:.68rem;font-weight:800;color:#165D6F;background:#EDF6F7;padding:5px 9px;border-radius:99px;white-space:nowrap}',
      '.bq-gs-empty{text-align:center;padding:38px 18px;color:#64748B}',
      '.bq-gs-empty i{display:block;font-size:2rem;color:#CBD5E1;margin-bottom:10px}',
      '.bq-gs-empty a{color:#165D6F;font-weight:800}',
      '.bq-gs-hint{display:flex;gap:8px;flex-wrap:wrap;padding:12px 10px 4px}',
      '.bq-gs-chip{border:1px solid #D7E2E6;background:#fff;color:#165D6F;border-radius:99px;padding:7px 12px;font-weight:700;font-size:.8rem;cursor:pointer}',
      '.bq-gs-chip:hover{background:#EDF6F7}',
      '@media(max-width:600px){.bq-gs-overlay{padding:10px 8px}.bq-gs-panel{max-height:calc(100dvh - 20px);border-radius:18px}.bq-gs-item{grid-template-columns:36px 1fr}.bq-gs-icon{width:36px;height:36px}.bq-gs-dep{display:none}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function build() {
    if (overlay) return;
    ensureStyles();
    // Retira la versión anterior (21 páginas) si global-injector.js la creó.
    var legacy = document.getElementById('bqSiteSearchResults');
    if (legacy) legacy.remove();
    overlay = document.createElement('div');
    overlay.className = 'bq-gs-overlay';
    overlay.id = 'bqGlobalSearch';
    overlay.hidden = true;
    overlay.innerHTML =
      '<section class="bq-gs-panel" role="dialog" aria-modal="true" aria-labelledby="bqGsLabel">' +
        '<div class="bq-gs-head"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>' +
          '<label id="bqGsLabel" class="sr-only" for="bqGsField">Buscar en BAQUEANO</label>' +
          '<input id="bqGsField" class="bq-gs-field" type="search" placeholder="Buscá playas, volcanes, León, Ometepe, nacatamal…" autocomplete="off" role="combobox" aria-expanded="true" aria-controls="bqGsList" aria-autocomplete="list">' +
          '<button class="bq-gs-close" type="button" aria-label="Cerrar búsqueda"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>' +
        '</div>' +
        '<div class="bq-gs-meta" id="bqGsMeta" aria-live="polite">Escribí qué querés vivir en Nicaragua.</div>' +
        '<div class="bq-gs-list" id="bqGsList" role="listbox" aria-label="Resultados"></div>' +
      '</section>';
    document.body.appendChild(overlay);
    field = overlay.querySelector('#bqGsField');
    list = overlay.querySelector('#bqGsList');
    meta = overlay.querySelector('#bqGsMeta');
    overlay.querySelector('.bq-gs-close').addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    field.addEventListener('input', function () { render(field.value); });
    field.addEventListener('keydown', onKey);
    list.addEventListener('click', function (e) {
      var item = e.target.closest('[data-gs-index]');
      if (item) { e.preventDefault(); navigate(current[Number(item.dataset.gsIndex)]); return; }
      var chip = e.target.closest('[data-gs-chip]');
      if (chip) { field.value = chip.dataset.gsChip; render(field.value); field.focus(); }
    });
  }

  function suggestions() {
    list.textContent = '';
    var wrap = document.createElement('div');
    wrap.className = 'bq-gs-hint';
    ['Playas', 'Volcanes', 'León', 'Granada', 'Ometepe', 'Café', 'Nacatamal', 'Cascadas'].forEach(function (text) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'bq-gs-chip';
      chip.dataset.gsChip = text;
      chip.textContent = text;
      wrap.appendChild(chip);
    });
    list.appendChild(wrap);
    current = [];
    activeIndex = -1;
  }

  function render(query) {
    if (!overlay) return;
    var q = String(query || '').trim();
    if (!q) { meta.textContent = 'Escribí qué querés vivir en Nicaragua.'; suggestions(); return; }
    if (!records) {
      meta.textContent = 'Preparando el buscador…';
      loadIndex().then(function () { if (field.value.trim() === q) render(q); });
      return;
    }
    var results = search(q);
    // Agrupa por tipo: los grupos se ordenan por su mejor resultado y, dentro
    // de cada grupo, por puntuación (la coincidencia más fuerte sigue arriba).
    var groupOrder = [];
    var byKind = {};
    results.forEach(function (x) {
      if (!byKind[x.r.k]) { byKind[x.r.k] = []; groupOrder.push(x.r.k); }
      byKind[x.r.k].push(x.r);
    });
    current = groupOrder.reduce(function (acc, kind) { return acc.concat(byKind[kind]); }, []);
    activeIndex = current.length ? 0 : -1;
    list.textContent = '';
    if (!current.length) {
      meta.textContent = 'Sin coincidencias dentro de BAQUEANO.';
      var empty = document.createElement('div');
      empty.className = 'bq-gs-empty';
      empty.innerHTML = '<i class="fa-regular fa-compass" aria-hidden="true"></i><strong>No encontramos “<span></span>”.</strong><p>Probá con un departamento, un destino o una categoría como playas o volcanes.</p>';
      empty.querySelector('span').textContent = q;
      list.appendChild(empty);
      return;
    }
    var best = bestMatch(results, norm(q));
    // Enter abre lo mismo que anuncia el contador ("Enter abre …").
    if (best && current.indexOf(best) > 0) activeIndex = current.indexOf(best);
    meta.textContent = current.length + ' resultado' + (current.length === 1 ? '' : 's') + (best ? ' · Enter abre “' + best.t + '”' : '');
    var lastKind = null;
    current.forEach(function (r, index) {
      if (r.k !== lastKind) {
        lastKind = r.k;
        var group = document.createElement('p');
        group.className = 'bq-gs-group';
        group.textContent = (KIND[r.k] || {}).label || 'Resultados';
        list.appendChild(group);
      }
      var a = document.createElement('a');
      a.className = 'bq-gs-item' + (index === activeIndex ? ' is-active' : '');
      a.href = r.u === '#sos' ? '#' : r.u;
      a.id = 'bqGsItem' + index;
      a.dataset.gsIndex = String(index);
      a.setAttribute('role', 'option');
      a.setAttribute('aria-selected', index === activeIndex ? 'true' : 'false');
      var icon = document.createElement('span');
      icon.className = 'bq-gs-icon';
      icon.innerHTML = '<i aria-hidden="true"></i>';
      icon.firstChild.className = r.i || (KIND[r.k] || {}).icon || 'fa-solid fa-compass';
      var text = document.createElement('span');
      text.className = 'bq-gs-text';
      var title = document.createElement('strong');
      title.textContent = r.t;
      var desc = document.createElement('small');
      desc.textContent = r.d || '';
      text.append(title, desc);
      a.append(icon, text);
      if (r.dep && r.k !== 'departamento') {
        var dep = document.createElement('span');
        dep.className = 'bq-gs-dep';
        dep.textContent = r.dep;
        a.appendChild(dep);
      }
      list.appendChild(a);
    });
    field.setAttribute('aria-activedescendant', activeIndex >= 0 ? 'bqGsItem' + activeIndex : '');
  }

  function setActive(index) {
    var items = list.querySelectorAll('.bq-gs-item');
    if (!items.length) return;
    activeIndex = (index + items.length) % items.length;
    items.forEach(function (el, i) {
      el.classList.toggle('is-active', i === activeIndex);
      el.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false');
    });
    items[activeIndex].scrollIntoView({ block: 'nearest' });
    field.setAttribute('aria-activedescendant', 'bqGsItem' + activeIndex);
  }

  function onKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(activeIndex + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(activeIndex - 1); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && current[activeIndex]) navigate(current[activeIndex]);
      else if (field.value.trim()) go(field.value);
    } else if (e.key === 'Escape') { e.preventDefault(); close(); }
  }

  function open(query) {
    build();
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.documentElement.classList.add('bq-search-open');
    field.value = query || '';
    render(field.value);
    loadIndex().then(function () { if (!overlay.hidden) render(field.value); });
    window.setTimeout(function () { field.focus(); field.select(); }, 20);
  }

  function close() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.documentElement.classList.remove('bq-search-open');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  // Enviar desde un buscador de la página: directo si es claro, si no, lista.
  function go(query) {
    var q = String(query || '').trim();
    if (!q) { open(''); return Promise.resolve(); }
    return loadIndex().then(function () {
      var best = bestMatch(search(q), norm(q));
      if (best) navigate(best);
      else open(q);
    });
  }

  function wireForms() {
    document.querySelectorAll('form.hero-exact-search, form[data-bq-global-search]').forEach(function (form) {
      if (form.dataset.bqGlobalSearchWired === '1') return;
      form.dataset.bqGlobalSearchWired = '1';
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        var input = form.querySelector('input[type="search"], input[name="q"], input[type="text"]');
        go(input ? input.value : '');
      }, true);
    });
  }

  // Cualquier botón con data-bq-open-search (menú, cajón móvil) abre el buscador.
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest && e.target.closest('[data-bq-open-search]');
    if (!trigger) return;
    e.preventDefault();
    open('');
  });

  document.addEventListener('keydown', function (e) {
    var target = e.target;
    var typing = target && (target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName));
    if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); open(''); return; }
    if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); open(''); }
  });

  window.BaqueanoSiteSearch = { __v2: true, open: open, close: close, go: go, search: function (q) { return search(q).map(function (x) { return x.r; }); }, ready: loadIndex, wire: wireForms };

  // Consultas que llegaron antes de que este archivo cargara.
  var pending = window.__bqPendingSearch;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireForms, { once: true });
  else wireForms();
  if (typeof pending === 'string') { window.__bqPendingSearch = null; go(pending); }
})(window, document);
