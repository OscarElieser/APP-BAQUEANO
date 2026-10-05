/**
 * 🎯 POR QUÉ: requisito 12 — fuentes de Google y Font Awesome no deben bloquear el
 *   primer pintado (Lighthouse las marcaba como render-blocking).
 * ⚙️ CÓMO: el build publica esas hojas con media="print" + data-async-style; este
 *   script las activa (media="all") en cuanto cargan. Sin manejadores inline.
 * 📦 QUÉ: activa todo link[data-async-style]; respaldo <noscript> en el HTML.
 */
(function (document) {
  'use strict';
  document.querySelectorAll('link[data-async-style]').forEach(function (link) {
    var enable = function () { link.media = 'all'; };
    if (link.sheet) enable();
    else { link.addEventListener('load', enable, { once: true }); link.addEventListener('error', enable, { once: true }); }
  });
})(document);
