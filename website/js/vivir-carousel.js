/**
 * ============================================================================
 * 🧭 BAQUEANO — CARRUSEL 3D «¿QUÉ QUERÉS VIVIR?» (vivir-carousel.js)
 * ============================================================================
 * 🎯 POR QUÉ:
 * - Pedido del propietario (2026-10-14): las vivencias de «¿Qué querés vivir?» se
 *   presentan como tarjetas de vidrio en un carrusel 3D (tarjeta central grande y
 *   laterales inclinadas), sin borrar nada de lo existente.
 *
 * ⚙️ CÓMO:
 * - Mejora progresiva sobre los mismos botones .vivir-option de index.html: no se
 *   crean ni se quitan vivencias, solo se agregan la descripción, el número y los
 *   controles. js/tres-pilares.js sigue manejando la elección (evento
 *   baqueano:vivir-selected, memoria y desplazamiento a destinos).
 * - Tocar una tarjeta lateral la trae al centro (sin elegirla); tocar la central la
 *   elige como antes. Flechas, puntos, teclado (← →, Inicio, Fin) y deslizamiento.
 * - Posiciones con transform 3D (perspective + rotateY + translateZ); se calculan en
 *   círculo para que siempre haya tarjetas a ambos lados.
 * - Textos de los catálogos (vivir.*) en los 8 idiomas; se repintan al cambiar de idioma.
 * - Sin movimiento si la persona pide movimiento reducido; sin JavaScript queda la
 *   cuadrícula original de postales.
 *
 * 📦 QUÉ: window.BaqueanoVivirCarousel = { go(index), next(), prev() }.
 * ============================================================================
 */
(function (window, document) {
  'use strict';
  if (window.BaqueanoVivirCarousel) return;

  var DESC_KEYS = {
    'aventura': 'vivir.desc.aventura', 'naturaleza': 'vivir.desc.naturaleza', 'cultura': 'vivir.desc.cultura',
    'descanso': 'vivir.desc.descanso', 'historia': 'vivir.desc.historia', 'gastronomia': 'vivir.desc.gastronomia',
    'comunidades': 'vivir.desc.comunidades', 'romance': 'vivir.desc.romance', 'familia': 'vivir.desc.familia',
    'algo-diferente': 'vivir.desc.algoDiferente'
  };
  var DESC_ES = {
    'aventura': 'Bajá en tabla por la arena negra de un volcán activo y caminá su cráter con guías locales.',
    'naturaleza': 'Navegá y nadá entre paredes de roca de un cañón esculpido por el agua en el norte del país.',
    'cultura': 'Recorré la calle peatonal más viva de Granada, entre casas coloniales, música y artesanía.',
    'descanso': 'Agua turquesa, arena blanca y ritmo caribeño en las islas del Caribe Sur.',
    'historia': 'Subí a la fortaleza del siglo XVII que defendía el río San Juan de los ataques piratas.',
    'gastronomia': 'Probá el vigorón granadino: yuca, chicharrón y ensalada de repollo servidos en hoja de chagüite.',
    'comunidades': 'Quedate con familias campesinas que cultivan café y comparten su vida en la isla de Ometepe.',
    'romance': 'Atardeceres sobre la bahía y el mirador del Cristo de la Misericordia, en San Juan del Sur.',
    'familia': 'Nadá en una laguna de cráter de aguas tibias y tranquilas, a minutos de Masaya y Granada.',
    'algo-diferente': 'Cascadas escondidas en la montaña de Jinotega, lejos de las rutas de siempre.'
  };

  function t(key, fallback, params) {
    try {
      var L = window.BaqueanoLanguage;
      var value = L && L.t ? L.t(key, Object.assign({ fallback: fallback }, params || {})) : '';
      if (value && value !== key) return value;
      return String(fallback).replace(/\{(\w+)\}/g, function (_, k) { return params && params[k] != null ? params[k] : ''; });
    } catch (_) { return fallback; }
  }
  function el(tag, className, attrs) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    Object.keys(attrs || {}).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    return node;
  }
  function svgArrow(dir) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    var path = document.createElementNS(ns, 'path');
    path.setAttribute('d', dir === 'prev' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7');
    svg.appendChild(path);
    return svg;
  }

  function init() {
    var grid = document.querySelector('[data-vivir-grid]');
    if (!grid || grid.classList.contains('is-coverflow')) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.vivir-option'));
    if (cards.length < 3) return;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var total = cards.length;
    var saved = null;
    try { saved = localStorage.getItem('baqueano_vivencia_selected'); } catch (_) {}
    var active = Math.max(0, cards.findIndex(function (c) { return c.getAttribute('data-vivencia') === saved; }));

    // ── Escenario y tarjetas (se agregan elementos, no se quita ninguno) ──
    var stage = el('div', 'vivir-stage');
    grid.parentNode.insertBefore(stage, grid);
    stage.appendChild(grid);
    grid.classList.add('is-coverflow');
    grid.setAttribute('aria-roledescription', 'carousel');

    cards.forEach(function (card, i) {
      var id = card.getAttribute('data-vivencia');
      var desc = el('span', 'vivir-option-desc', { 'data-i18n': DESC_KEYS[id] || '' });
      desc.textContent = DESC_ES[id] || '';
      var count = el('span', 'vivir-option-count', { 'aria-hidden': 'true' });
      count.textContent = (i + 1) + ' / ' + total;
      var shade = el('span', 'vivir-option-shade', { 'aria-hidden': 'true' });
      card.insertBefore(shade, card.firstChild);
      card.appendChild(desc);
      card.appendChild(count);
      card.dataset.index = String(i);
    });

    // ── Controles: barra de vidrio con flechas y miniatura + puntos ──
    var bar = el('div', 'vivir-dock');
    var prev = el('button', 'vivir-dock-btn', { type: 'button' });
    prev.appendChild(svgArrow('prev'));
    var next = el('button', 'vivir-dock-btn', { type: 'button' });
    next.appendChild(svgArrow('next'));
    var thumb = el('span', 'vivir-dock-thumb', { 'aria-hidden': 'true' });
    var info = el('span', 'vivir-dock-info');
    var infoTitle = el('strong', 'vivir-dock-title');
    var infoPlace = el('small', 'vivir-dock-place', { translate: 'no' });
    info.append(infoTitle, infoPlace);
    var explore = el('button', 'vivir-dock-explore', { type: 'button' });
    bar.append(prev, thumb, info, explore, next);
    var dots = el('div', 'vivir-dots', { role: 'group' });
    var dotButtons = cards.map(function (card, i) {
      var dot = el('button', 'vivir-dot', { type: 'button' });
      dot.addEventListener('click', function () { go(i, true); });
      dots.appendChild(dot);
      return dot;
    });
    var live = el('p', 'vivir-live', { 'aria-live': 'polite' });
    stage.append(bar, dots, live);

    function label(card) { var n = card.querySelector('.vivir-option-label'); return n ? n.textContent.trim() : ''; }
    function place(card) { var n = card.querySelector('.vivir-option-place'); return n ? n.textContent.trim() : ''; }

    function layout() {
      var width = stage.clientWidth || window.innerWidth;
      var narrow = width < 640;
      var cardW = narrow ? Math.min(width * 0.74, 320) : Math.min(Math.max(width * 0.26, 260), 340);
      var step = narrow ? cardW * 0.62 : cardW * 0.7;
      grid.style.setProperty('--vivir-card-w', Math.round(cardW) + 'px');
      cards.forEach(function (card, i) {
        var d = ((i - active) % total + total + Math.floor(total / 2)) % total - Math.floor(total / 2);
        var abs = Math.abs(d);
        var visible = abs <= (narrow ? 1 : 2);
        var x = d * step;
        var z = -abs * (narrow ? 90 : 140);
        var rot = d === 0 ? 0 : (d < 0 ? 32 : -32);
        var scale = d === 0 ? 1 : (abs === 1 ? 0.86 : 0.74);
        card.style.transform = 'translate(-50%, -50%) translateX(' + x.toFixed(1) + 'px) translateZ(' + z + 'px) rotateY(' + rot + 'deg) scale(' + scale + ')';
        card.style.zIndex = String(20 - abs);
        card.style.opacity = visible ? (d === 0 ? '1' : (abs === 1 ? '.92' : '.6')) : '0';
        card.style.pointerEvents = visible ? 'auto' : 'none';
        card.classList.toggle('is-center', d === 0);
        card.setAttribute('aria-current', d === 0 ? 'true' : 'false');
        card.tabIndex = d === 0 ? 0 : -1;
        if (!visible) card.setAttribute('aria-hidden', 'true'); else card.removeAttribute('aria-hidden');
      });
      dotButtons.forEach(function (dot, i) { dot.classList.toggle('is-active', i === active); dot.setAttribute('aria-pressed', i === active ? 'true' : 'false'); });
    }

    function paint() {
      var card = cards[active];
      infoTitle.textContent = label(card);
      infoPlace.textContent = place(card);
      thumb.style.backgroundImage = 'url("assets/images/vivir/' + card.getAttribute('data-vivencia') + '.webp")';
      prev.setAttribute('aria-label', t('vivir.carousel.prev', 'Vivencia anterior'));
      next.setAttribute('aria-label', t('vivir.carousel.next', 'Siguiente vivencia'));
      explore.textContent = t('vivir.carousel.explore', 'Explorar');
      dots.setAttribute('aria-label', t('vivir.carousel.label', 'Vivencias de Nicaragua'));
      dotButtons.forEach(function (dot, i) { dot.setAttribute('aria-label', t('vivir.carousel.goTo', 'Ir a {name}', { name: label(cards[i]) })); });
    }

    function go(index, announce) {
      active = (index % total + total) % total;
      layout();
      paint();
      if (announce) live.textContent = t('vivir.carousel.position', '{name}, {n} de {total}', { name: label(cards[active]), n: active + 1, total: total });
    }

    // Tarjeta lateral → al centro (sin elegir). La central sigue el flujo de tres-pilares.js.
    grid.addEventListener('click', function (event) {
      var card = event.target.closest('.vivir-option');
      if (!card || card.classList.contains('is-center')) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      go(Number(card.dataset.index), true);
    }, true);
    prev.addEventListener('click', function () { go(active - 1, true); });
    next.addEventListener('click', function () { go(active + 1, true); });
    explore.addEventListener('click', function () { cards[active].click(); });
    grid.addEventListener('keydown', function (event) {
      var map = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: total - 1 };
      if (!(event.key in map)) return;
      event.preventDefault();
      go(map[event.key], true);
      cards[active].focus({ preventScroll: true });
    });

    // Deslizamiento con el dedo o el mouse.
    var startX = null;
    var moved = false;
    stage.addEventListener('pointerdown', function (event) { if (event.target.closest('.vivir-dock, .vivir-dots')) return; startX = event.clientX; moved = false; });
    stage.addEventListener('pointermove', function (event) { if (startX !== null && Math.abs(event.clientX - startX) > 12) moved = true; });
    stage.addEventListener('pointerup', function (event) {
      if (startX === null) return;
      var dx = event.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 45) go(active + (dx < 0 ? 1 : -1), true);
    });
    stage.addEventListener('pointercancel', function () { startX = null; });
    // Un arrastre no debe contar como clic sobre la tarjeta central.
    grid.addEventListener('click', function (event) { if (moved) { event.preventDefault(); event.stopImmediatePropagation(); moved = false; } }, true);

    var resizeTimer = null;
    window.addEventListener('resize', function () { window.clearTimeout(resizeTimer); resizeTimer = window.setTimeout(layout, 120); });
    ['baqueano:languageChanged', 'baqueano:i18nReady'].forEach(function (type) { window.addEventListener(type, function () { window.setTimeout(paint, 60); }); });
    if (reduced) grid.classList.add('is-reduced');

    go(active, false);
    window.BaqueanoVivirCarousel = Object.freeze({ go: function (i) { go(i, true); }, next: function () { go(active + 1, true); }, prev: function () { go(active - 1, true); } });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}(window, document));
