/**
 * 🎯 POR QUÉ: requisito 12 (velocidad). El video del hero descargaba 42 MB al abrir
 *   la portada (autoplay anulaba preload="none"): Lighthouse móvil 15/100, LCP 16 s.
 *   La identidad visual se conserva: el mismo video, codificado para web (1280 px
 *   ≈ 2,9 MB; 720 px ≈ 1,0 MB, sin audio porque el fondo siempre va silenciado).
 * ⚙️ CÓMO: el <video> nace sin src (data-src en cada <source>) y con póster WebP
 *   precargado: el póster es el primer pintado (LCP). Tras el evento load y un
 *   momento de inactividad se asignan las fuentes y se reproduce. No se carga si
 *   la persona pidió "reducir movimiento", activó ahorro de datos o tiene 2G; en
 *   ese caso queda el póster. Se pausa fuera de pantalla para ahorrar batería.
 * 📦 QUÉ: activa todo `video[data-hero-video]`. El original de alta resolución
 *   sigue disponible en el reproductor del modal ("Ver video").
 */
(function (window, document) {
  'use strict';

  function shouldSkip() {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var connection = navigator.connection || {};
    var slow = /(^|-)2g$/.test(connection.effectiveType || '');
    return reduced || connection.saveData === true || slow;
  }

  function activate(video) {
    if (video.dataset.heroLoaded || shouldSkip()) return;
    video.dataset.heroLoaded = 'true';
    video.querySelectorAll('source[data-src]').forEach(function (source) {
      source.src = source.getAttribute('data-src');
    });
    video.muted = true;
    video.load();
    var play = video.play();
    if (play && play.catch) play.catch(function () { /* autoplay bloqueado: queda el póster */ });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
          else video.pause();
        });
      }, { threshold: 0.1 }).observe(video);
    }
  }

  function start() {
    var videos = document.querySelectorAll('video[data-hero-video]');
    if (!videos.length) return;
    var run = function () { videos.forEach(activate); };
    if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 2500 });
    else window.setTimeout(run, 1200);
  }

  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
})(window, document);
