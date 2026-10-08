// ============================================================================
// 🧭 BAQUEANO — GALERÍA EN MOVIMIENTO INFINITO CON PAUSA (bq-marquee.js)
// ============================================================================
// 🎯 POR QUÉ: el propietario pidió (2026-10-07) que Monumentos, Fuentes, Sabores y Destinos
//    destacados se muestren "en galería en movimiento infinito automático con opción de pausa por
//    el usuario". Un solo componente para que todas se comporten igual.
// ⚙️ CÓMO:
//    - Mejora progresiva: el contenedor [data-bq-marquee] conserva sus tarjetas (si el script no
//      carga, se ven como antes). El script las mete en una pista, añade una COPIA inerte
//      (aria-hidden + inert, fuera del orden de tabulación) y anima la pista de 0 a -50 %: el
//      final empalma con el principio sin saltos.
//    - Velocidad constante en px/s (data-bq-speed, por defecto 40) sin importar cuántas tarjetas.
//    - Botón Pausar/Continuar (aria-pressed) antes de la pista; también se detiene al pasar el
//      puntero o al tener foco dentro (WCAG 2.2.2) y cuando la pestaña no está visible.
//    - prefers-reduced-motion: no se anima; la fila se recorre a mano con desplazamiento.
//    - Si las tarjetas caben sin moverse, no se anima ni se muestra el botón.
// 📦 QUÉ: window.BaqueanoMarquee = { refresh(root) }. Opciones: data-bq-speed, data-bq-label.
// ============================================================================
(function (window, document) {
  'use strict';
  if (window.BaqueanoMarquee) return;
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) { reduce = false; }

  function t(key, fallback) {
    try { if (window.BaqueanoLanguage && window.BaqueanoLanguage.t) return window.BaqueanoLanguage.t(key, { fallback: fallback }) || fallback; } catch (_) { /* sin motor */ }
    return fallback;
  }

  function setLabel(btn, paused) {
    btn.setAttribute('aria-pressed', paused ? 'true' : 'false');
    var icon = btn.querySelector('i');
    if (icon) icon.className = paused ? 'fa-solid fa-play' : 'fa-solid fa-pause';
    var span = btn.querySelector('span');
    span.setAttribute('data-i18n', paused ? 'marquee.play' : 'marquee.pause');
    span.textContent = paused ? t('marquee.play', 'Continuar') : t('marquee.pause', 'Pausar');
  }

  function destroy(box) {
    if (!box) return;
    var state = box.__bqMarquee;
    if (!state) return;
    clearClones(state);
    var items = Array.prototype.slice.call(state.track.children);
    items.forEach(function (it) {
      it.classList.remove('bq-marquee-item');
      box.appendChild(it);
    });
    if (state.controls && state.controls.parentNode) state.controls.remove();
    if (state.viewport && state.viewport.parentNode) state.viewport.remove();
    box.classList.remove('bq-marquee', 'is-static', 'is-paused', 'is-reduced');
    delete box.__bqMarquee;
  }

  function build(box) {
    if (box.__bqMarquee) {
      // Si se añadieron elementos directamente a la caja fuera del viewport/controls, o el track quedó vacío:
      var stray = Array.prototype.filter.call(box.children, function (ch) {
        return ch !== box.__bqMarquee.controls && ch !== box.__bqMarquee.viewport;
      });
      if (stray.length || !box.__bqMarquee.track.children.length) {
        destroy(box);
      } else {
        return box.__bqMarquee;
      }
    }
    var items = Array.prototype.slice.call(box.children);
    if (!items.length) return null;
    var label = box.getAttribute('data-bq-label') || '';
    var viewport = document.createElement('div');
    viewport.className = 'bq-marquee-viewport';
    var track = document.createElement('div');
    track.className = 'bq-marquee-track';
    items.forEach(function (it) { it.classList.add('bq-marquee-item'); track.appendChild(it); });
    viewport.appendChild(track);
    var controls = document.createElement('div');
    controls.className = 'bq-marquee-controls';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'bq-marquee-toggle';
    btn.appendChild(document.createElement('i')).setAttribute('aria-hidden', 'true');
    btn.appendChild(document.createTextNode(' '));
    btn.appendChild(document.createElement('span'));
    controls.appendChild(btn);
    box.classList.add('bq-marquee');
    if (label) { box.setAttribute('role', 'region'); box.setAttribute('aria-label', label); }
    box.appendChild(controls);
    box.appendChild(viewport);
    var state = { box: box, track: track, viewport: viewport, btn: btn, controls: controls, paused: false, hold: false, clones: [] };
    setLabel(btn, false);
    btn.addEventListener('click', function () { state.paused = !state.paused; apply(state); });
    ['mouseenter', 'focusin'].forEach(function (ev) { viewport.addEventListener(ev, function () { state.hold = true; apply(state); }); });
    ['mouseleave', 'focusout'].forEach(function (ev) { viewport.addEventListener(ev, function (e) {
      if (ev === 'focusout' && viewport.contains(e.relatedTarget)) return;
      state.hold = false; apply(state);
    }); });
    box.__bqMarquee = state;
    return state;
  }

  function clearClones(state) {
    state.clones.forEach(function (c) { c.remove(); });
    state.clones = [];
  }

  function measure(state) {
    clearClones(state);
    var originals = Array.prototype.filter.call(state.track.children, function (n) { return !n.hasAttribute('data-bq-clone'); });
    var width = state.track.scrollWidth;
    var fits = width <= state.viewport.clientWidth + 2;
    state.moving = !reduce && !fits && originals.length > 1;
    state.box.classList.toggle('is-static', !state.moving);
    state.box.classList.toggle('is-reduced', reduce);
    state.controls.hidden = !state.moving;
    if (!state.moving) { state.track.style.removeProperty('--bq-marquee-duration'); return; }
    originals.forEach(function (node) {
      var copy = node.cloneNode(true);
      copy.setAttribute('data-bq-clone', '');
      copy.setAttribute('aria-hidden', 'true');
      copy.setAttribute('inert', '');
      copy.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach(function (f) { f.setAttribute('tabindex', '-1'); });
      copy.querySelectorAll('[id]').forEach(function (f) { f.removeAttribute('id'); });
      if (copy.id) copy.removeAttribute('id');
      state.track.appendChild(copy);
      state.clones.push(copy);
    });
    var speed = Number(state.box.getAttribute('data-bq-speed')) || 40;
    state.track.style.setProperty('--bq-marquee-duration', Math.max(12, Math.round(width / speed)) + 's');
    apply(state);
  }

  function apply(state) {
    var stop = state.paused || state.hold || document.hidden;
    state.box.classList.toggle('is-paused', stop);
    setLabel(state.btn, state.paused);
  }

  function refresh(root) {
    (root || document).querySelectorAll('[data-bq-marquee]').forEach(function (box) {
      var state = build(box);
      if (state) measure(state);
    });
  }

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () { refresh(); }, 200);
  });
  document.addEventListener('visibilitychange', function () {
    document.querySelectorAll('[data-bq-marquee]').forEach(function (box) { if (box.__bqMarquee) apply(box.__bqMarquee); });
  });
  window.addEventListener('baqueano:languageChanged', function () {
    document.querySelectorAll('[data-bq-marquee]').forEach(function (box) { if (box.__bqMarquee) setLabel(box.__bqMarquee.btn, box.__bqMarquee.paused); });
  });

  window.BaqueanoMarquee = { refresh: refresh, destroy: destroy, build: build };
  function start() { refresh(); window.addEventListener('load', function () { refresh(); }, { once: true }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})(window, document);
