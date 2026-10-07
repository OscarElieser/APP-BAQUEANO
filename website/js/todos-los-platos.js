// ============================================================================
// 🧭 BAQUEANO — TODOS LOS PLATOS (todos-los-platos.js)
// ============================================================================
// 🎯 POR QUÉ: pedido del propietario (2026-10-07): «Ver todos los platos» debe mostrar aparte todos
//    los platos; en gastronomia.html quedan los destacados en movimiento.
// ⚙️ CÓMO:
//    - Fuente: window.BAQUEANO_TERRITORIES (js/territories-data.js), la misma que ya publican las
//      fichas de cada departamento: 17 territorios, nombre y descripción de cada plato. No se
//      agregan precios, calificaciones ni fotos de platos que no existan: la imagen es la foto del
//      territorio y lo dice.
//    - Búsqueda por nombre o descripción y filtro por territorio; ?q= y ?territorio= en la URL.
//    - Todo con textContent (sin innerHTML con datos).
// 📦 QUÉ: rellena #allDishesGrid, #allDishesCount y #allDishesTerritory.
// ============================================================================
(function (window, document) {
  'use strict';

  function t(key, fallback, vars) {
    var out = fallback;
    try { if (window.BaqueanoLanguage && window.BaqueanoLanguage.t) out = window.BaqueanoLanguage.t(key, { fallback: fallback }) || fallback; } catch (_) { out = fallback; }
    return String(out).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; });
  }
  function el(tag, cls, text, attrs) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    Object.keys(attrs || {}).forEach(function (k) { if (attrs[k] != null) n.setAttribute(k, attrs[k]); });
    return n;
  }
  function norm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); }

  var territories = [];
  var state = { q: '', territory: '' };

  function load() {
    var T = window.BAQUEANO_TERRITORIES || {};
    territories = Object.keys(T).map(function (k) { return T[k]; })
      .filter(function (x) { return x && Array.isArray(x.gastronomy) && x.gastronomy.length; })
      .sort(function (a, b) { return String(a.name).localeCompare(String(b.name), 'es'); });
  }

  function render() {
    var grid = document.getElementById('allDishesGrid');
    var count = document.getElementById('allDishesCount');
    if (!grid) return;
    var q = norm(state.q);
    var total = 0, groups = [];
    territories.forEach(function (terr) {
      if (state.territory && terr.id !== state.territory) return;
      var dishes = terr.gastronomy.filter(function (d) { return !q || norm(d.name + ' ' + d.desc).indexOf(q) !== -1; });
      if (!dishes.length) return;
      total += dishes.length;
      groups.push({ terr: terr, dishes: dishes });
    });
    var nodes = groups.map(function (g) {
      var section = el('section', 'all-dishes-group', null, { 'aria-labelledby': 'dishGroup-' + g.terr.id });
      var head = el('div', 'all-dishes-group-head');
      var h2 = el('h2', null, g.terr.name, { id: 'dishGroup-' + g.terr.id, translate: 'no' });
      head.appendChild(h2);
      head.appendChild(el('span', 'all-dishes-group-n', t('allDishes.groupCount', '{n} platos', { n: g.dishes.length })));
      var link = el('a', 'all-dishes-group-link', t('allDishes.viewTerritory', 'Ver la ficha de {name}', { name: g.terr.name }), { href: 'departamento.html?id=' + encodeURIComponent(g.terr.id) });
      head.appendChild(link);
      section.appendChild(head);
      var list = el('ul', 'all-dishes-list');
      g.dishes.forEach(function (d) {
        var li = el('li', 'all-dishes-card');
        if (g.terr.heroImage) {
          var fig = el('div', 'all-dishes-media');
          fig.appendChild(el('img', null, null, { src: g.terr.heroImage, alt: '', loading: 'lazy', decoding: 'async', width: '400', height: '240' }));
          fig.appendChild(el('span', 'all-dishes-photo-note', t('allDishes.territoryPhoto', 'Foto del territorio')));
          li.appendChild(fig);
        }
        var body = el('div', 'all-dishes-body');
        body.appendChild(el('h3', null, d.name, { translate: 'no' }));
        body.appendChild(el('p', null, d.desc));
        li.appendChild(body);
        list.appendChild(li);
      });
      section.appendChild(list);
      return section;
    });
    grid.replaceChildren.apply(grid, nodes.length ? nodes : [el('p', 'all-dishes-empty', t('allDishes.empty', 'No encontramos platos con esa búsqueda.'), { role: 'status' })]);
    if (count) count.textContent = groups.length === 1
      ? t('allDishes.countOne', '{n} platos de 1 territorio', { n: total })
      : t('allDishes.count', '{n} platos de {t} territorios', { n: total, t: groups.length });
  }

  function syncUrl() {
    try {
      var url = new URL(window.location.href);
      state.q ? url.searchParams.set('q', state.q) : url.searchParams.delete('q');
      state.territory ? url.searchParams.set('territorio', state.territory) : url.searchParams.delete('territorio');
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch (_) { /* sin History API */ }
  }

  function start() {
    load();
    var params = new URLSearchParams(window.location.search);
    state.q = params.get('q') || '';
    state.territory = params.get('territorio') || '';
    var search = document.getElementById('allDishesSearch');
    var select = document.getElementById('allDishesTerritory');
    if (select) {
      territories.forEach(function (terr) { select.appendChild(el('option', null, terr.name, { value: terr.id })); });
      select.value = state.territory;
      select.addEventListener('change', function () { state.territory = select.value; syncUrl(); render(); });
    }
    if (search) {
      search.value = state.q;
      var timer = null;
      search.addEventListener('input', function () { window.clearTimeout(timer); timer = window.setTimeout(function () { state.q = search.value.trim(); syncUrl(); render(); }, 200); });
    }
    render();
  }
  window.addEventListener('baqueano:languageChanged', render);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})(window, document);
