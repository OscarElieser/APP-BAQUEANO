/**
 * ============================================================================
 * 🧭 BAQUEANO — GALERÍA EN ARCO 3D DE CADA DEPARTAMENTO (territory-arc-gallery.js)
 * ============================================================================
 * 🎯 POR QUÉ:
 * - Pedido del propietario (2026-10-14): la galería de fotos de cada departamento
 *   (antes una tira que corre de lado) se presenta como un arco curvo de tarjetas
 *   en 3D, «sin borrar nada».
 *
 * ⚙️ CÓMO:
 * - Mejora progresiva: toma las mismas fotos (.infinite-item) que generan
 *   madriz-experience.js, chinandega-experience.js y territory-media-experience.js;
 *   no crea ni quita fotos. La copia técnica del bucle (.territory-carousel-clone)
 *   solo se oculta mientras está el arco.
 * - El botón existente «Pausar galería» sigue funcionando: el arco observa la clase
 *   .is-paused de la tira y detiene su avance automático.
 * - Tocar una foto lateral la trae al centro; flechas, teclado (← → Inicio Fin) y
 *   deslizamiento. Textos en los 8 idiomas (gallery.arc.*).
 * - Sin avance automático si la persona pide movimiento reducido.
 *
 * 📦 QUÉ: window.BaqueanoArcGallery = { enhance(root) }.
 * ============================================================================
 */
(function (window, document) {
  'use strict';
  if (window.BaqueanoArcGallery) return;

  var AUTO_MS = 4200;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function t(key, fallback, params) {
    try {
      var L = window.BaqueanoLanguage;
      var value = L && L.t ? L.t(key, Object.assign({ fallback: fallback }, params || {})) : '';
      if (value && value !== key) return value;
    } catch (_) {}
    return String(fallback).replace(/\{(\w+)\}/g, function (_, k) { return params && params[k] != null ? params[k] : ''; });
  }
  function el(tag, className, attrs) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    Object.keys(attrs || {}).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    return node;
  }
  function arrow(dir) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    var path = document.createElementNS(ns, 'path');
    path.setAttribute('d', dir === 'prev' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7');
    svg.appendChild(path);
    return svg;
  }

  function enhanceTrack(track) {
    if (!track || track.dataset.bqArc === 'true') return;
    var items = Array.prototype.slice.call(track.children).filter(function (n) { return n.classList && n.classList.contains('infinite-item'); });
    if (items.length < 2) return;
    var section = track.closest('.infinite-gallery-section');
    var container = track.closest('.infinite-carousel-container') || track.parentNode;
    track.dataset.bqArc = 'true';
    if (section) section.classList.add('is-arc');
    container.classList.add('is-arc');
    track.classList.add('bq-arc-track');
    track.setAttribute('role', 'group');
    track.setAttribute('aria-roledescription', 'carousel');
    track.tabIndex = 0;
    var total = items.length;
    var active = 0;
    items.forEach(function (item, i) {
      item.dataset.arcIndex = String(i);
      item.classList.add('bq-arc-card');
      var shine = el('span', 'bq-arc-shine', { 'aria-hidden': 'true' });
      item.appendChild(shine);
    });

    // Barra: anterior · contador · siguiente (el botón de pausa original se mantiene)
    var bar = el('div', 'bq-arc-bar');
    var prev = el('button', 'bq-arc-btn', { type: 'button' });
    prev.appendChild(arrow('prev'));
    var next = el('button', 'bq-arc-btn', { type: 'button' });
    next.appendChild(arrow('next'));
    var count = el('span', 'bq-arc-count', { 'aria-hidden': 'true' });
    var progress = el('span', 'bq-arc-progress', { 'aria-hidden': 'true' });
    var progressFill = el('span', 'bq-arc-progress-fill');
    progress.appendChild(progressFill);
    bar.append(prev, count, progress, next);
    var live = el('p', 'bq-arc-live', { 'aria-live': 'polite' });
    container.insertAdjacentElement('afterend', bar);
    bar.insertAdjacentElement('afterend', live);

    function layout() {
      var width = container.clientWidth || window.innerWidth;
      var narrow = width < 640;
      var cardW = narrow ? Math.min(width * 0.62, 260) : Math.min(Math.max(width * 0.2, 220), 300);
      var step = narrow ? cardW * 0.58 : cardW * 0.78;
      var reach = narrow ? 1 : (width < 1000 ? 2 : 3);
      track.style.setProperty('--arc-card-w', Math.round(cardW) + 'px');
      items.forEach(function (item, i) {
        var half = Math.floor(total / 2);
        var d = ((i - active) % total + total + half) % total - half;
        var abs = Math.abs(d);
        var visible = abs <= reach;
        var x = d * step;
        var y = abs * abs * (narrow ? 10 : 16) + abs * 6;
        var z = -abs * (narrow ? 70 : 110);
        var tilt = d * (narrow ? 4 : 5.5);
        var turn = -d * 10;
        var scale = 1 - abs * 0.07;
        item.style.transform = 'translateX(-50%) translateX(' + x.toFixed(1) + 'px) translateY(' + y.toFixed(1) + 'px) translateZ(' + z + 'px) rotateZ(' + tilt + 'deg) rotateY(' + turn + 'deg) scale(' + scale.toFixed(3) + ')';
        item.style.zIndex = String(30 - abs);
        item.style.opacity = visible ? String(1 - abs * 0.14) : '0';
        item.style.pointerEvents = visible ? 'auto' : 'none';
        item.classList.toggle('is-center', d === 0);
        var img = item.querySelector('img');
        if (img && visible) img.loading = 'eager';
      });
    }
    function paint() {
      prev.setAttribute('aria-label', t('gallery.arc.prev', 'Foto anterior'));
      next.setAttribute('aria-label', t('gallery.arc.next', 'Foto siguiente'));
      track.setAttribute('aria-label', t('gallery.arc.label', 'Galería de fotos en arco'));
      count.textContent = (active + 1) + ' / ' + total;
      progressFill.style.width = ((active + 1) / total * 100) + '%';
    }
    function go(index, announce) {
      active = (index % total + total) % total;
      layout();
      paint();
      if (announce) {
        var img = items[active].querySelector('img');
        live.textContent = t('gallery.arc.position', 'Foto {n} de {total}', { n: active + 1, total: total }) + (img && img.alt ? ' — ' + img.alt : '');
      }
    }

    // Avance automático, respetando el botón «Pausar galería» existente.
    var hovering = false;
    function paused() { return reduced || hovering || document.hidden || track.classList.contains('is-paused'); }
    var timer = window.setInterval(function () {
      if (!document.body.contains(track)) { window.clearInterval(timer); return; }
      if (!paused()) go(active + 1, false);
    }, AUTO_MS);
    track.addEventListener('mouseenter', function () { hovering = true; });
    track.addEventListener('mouseleave', function () { hovering = false; });
    track.addEventListener('focusin', function () { hovering = true; });
    track.addEventListener('focusout', function () { hovering = false; });

    track.addEventListener('click', function (event) {
      var card = event.target.closest('.bq-arc-card');
      if (!card) return;
      // Las fotos laterales se traen al centro; no deben activar la pausa por clic de Chinandega.
      if (!card.classList.contains('is-center')) {
        event.preventDefault();
        event.stopImmediatePropagation();
        go(Number(card.dataset.arcIndex), true);
      }
    }, true);
    prev.addEventListener('click', function () { go(active - 1, true); });
    next.addEventListener('click', function () { go(active + 1, true); });
    track.addEventListener('keydown', function (event) {
      var map = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: total - 1 };
      if (!(event.key in map)) return;
      event.preventDefault();
      go(map[event.key], true);
    });
    var startX = null;
    track.addEventListener('pointerdown', function (event) { startX = event.clientX; });
    track.addEventListener('pointerup', function (event) {
      if (startX === null) return;
      var dx = event.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 45) go(active + (dx < 0 ? 1 : -1), true);
    });
    track.addEventListener('pointercancel', function () { startX = null; });

    var resizeTimer = null;
    window.addEventListener('resize', function () { window.clearTimeout(resizeTimer); resizeTimer = window.setTimeout(layout, 120); });
    ['baqueano:languageChanged', 'baqueano:i18nReady'].forEach(function (type) { window.addEventListener(type, function () { window.setTimeout(paint, 60); }); });
    go(0, false);
  }

  function enhance(root) {
    (root || document).querySelectorAll('.infinite-gallery-section .infinite-track').forEach(enhanceTrack);
  }

  function start() {
    enhance(document);
    // Los departamentos se pintan después de cargar sus datos: se observa el contenido.
    var pending = false;
    new MutationObserver(function () {
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(function () { pending = false; enhance(document); });
    }).observe(document.body, { childList: true, subtree: true });
  }

  window.BaqueanoArcGallery = Object.freeze({ enhance: enhance });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
}(window, document));
