/**
 * 🎯 POR QUÉ: los 6 filtros temáticos de crónicas eran <a href="#"> sin función: el lector
 *   tocaba "Ruta del Café" y no pasaba nada (auditoría de botones 2026-10-06).
 * ⚙️ CÓMO: cada filtro es un <button aria-pressed> con data-topic. Cada pieza (crónica o
 *   lectura recomendada) declara sus temas en data-topics, tomados de su propio texto. Al
 *   elegir un tema se ocultan las piezas que no lo tienen. Si ninguna crónica completa
 *   coincide, se avisa con un mensaje (role=status). El tema elegido queda en la URL
 *   (#tema=cafe) para compartirlo y para atrás/adelante.
 * 📦 QUÉ: filtro accesible por teclado, sin dependencias y sin inventar contenido.
 */
(function (document, window) {
  'use strict';
  var chips = Array.prototype.slice.call(document.querySelectorAll('.bq-mag-chip[data-topic]'));
  if (!chips.length) return;
  var pieces = Array.prototype.slice.call(document.querySelectorAll('[data-topics]'));
  var empty = document.getElementById('bqMagFilterEmpty');
  var mains = pieces.filter(function (el) { return el.tagName === 'ARTICLE'; });

  function apply(topic, push) {
    var t = chips.some(function (c) { return c.dataset.topic === topic; }) ? topic : 'todas';
    chips.forEach(function (c) {
      var on = c.dataset.topic === t;
      c.classList.toggle('active', on);
      c.setAttribute('aria-pressed', String(on));
    });
    pieces.forEach(function (el) {
      var topics = (el.getAttribute('data-topics') || '').split(/\s+/);
      el.hidden = t !== 'todas' && topics.indexOf(t) < 0;
    });
    if (empty) empty.hidden = t === 'todas' || mains.some(function (el) { return !el.hidden; });
    var hash = t === 'todas' ? '' : '#tema=' + t;
    if (push && window.location.hash !== hash) window.history.pushState({ tema: t }, '', hash || window.location.pathname + window.location.search);
  }
  function fromUrl() { var m = /tema=([a-z]+)/.exec(window.location.hash); apply(m ? m[1] : 'todas', false); }

  chips.forEach(function (c) { c.addEventListener('click', function () { apply(c.dataset.topic, true); }); });
  window.addEventListener('popstate', fromUrl);
  fromUrl();
})(document, window);
