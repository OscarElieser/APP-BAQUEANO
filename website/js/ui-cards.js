/**
 * 🧭 BAQUEANO — MÓDULO 1 · TARJETAS VIVAS Y MODO SOL (js/ui-cards.js)
 * 🎯 POR QUÉ: pedido del propietario (15-10-2026, 23:37). Las tarjetas mostraban un hueco
 *   mientras cargaba la foto y la aparición era brusca. Y en el campo, con sol directo, el sitio
 *   oscuro no se lee: hace falta un «Modo Sol» de alto contraste (WCAG AAA) a un toque.
 * ⚙️ CÓMO:
 *   - Busca las tarjetas reales del sitio (destinos, aliados, experiencias, gastronomía,
 *     música y destacados por plan), también las que se crean después con datos de Supabase
 *     (MutationObserver), y a cada foto le pone:
 *       · esqueleto con brillo mientras descarga,
 *       · desenfoque progresivo que se enfoca al cargar (decode() antes de mostrar),
 *       · si la foto falla, quita el brillo y deja el fondo neutro (sin imágenes inventadas).
 *   - Las insignias que van sobre la foto pasan a vidrio conservando su color de categoría.
 *   - Modo Sol: botón en la barra (aria-pressed), se recuerda en este navegador
 *     (localStorage con try/catch) y respeta prefers-contrast: more la primera vez.
 *   - No usa BlurHash: BAQUEANO no guarda todavía el hash de cada foto. Cuando el Ops Center lo
 *     calcule al subir la imagen (columna blurhash en Supabase), se pinta aquí como fondo.
 * 📦 QUÉ: window.BaqueanoCards.scan(root) y window.BaqueanoSunMode { isOn, set, toggle }.
 */
(function () {
  'use strict';
  if (window.BaqueanoCards) return;

  var CARD_SEL = [
    '.dest-catalog-card', '.aliado-card-exact', '.exp-main-card', '.dish-card-exact',
    '.artist-card-exact', '.sweet-card-exact', '.track-card-exact', '.bq-feat-card'
  ].join(',');
  // Insignias que se ven sobre la foto.
  var BADGE_SEL = [
    '.dest-catalog-tag', '.bq-ally-seal', '.bq-ally-featured', '.exp-difficulty-badge',
    '.bq-feat-badge', '.aliado-verified-pill'
  ].join(',');
  var SUN_KEY = 'bq_sun_mode';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function t(key, fallback) {
    try {
      if (window.BaqueanoLanguage && window.BaqueanoLanguage.t) {
        var v = window.BaqueanoLanguage.t(key, { fallback: fallback });
        if (v && v !== key) return v;
      }
    } catch (_) { /* sin traductor: queda el español */ }
    return fallback;
  }

  // ── Fotos: esqueleto + desenfoque progresivo ──────────────────────────────
  function finish(img, shell, ok) {
    shell.classList.remove('is-loading');
    if (!ok) { shell.classList.add('is-error'); return; }
    img.classList.add('is-loaded');
  }

  function prepareImage(img) {
    if (img.dataset.bqCard === '1') return;
    img.dataset.bqCard = '1';
    var shell = img.parentElement;
    if (!shell) return;
    shell.classList.add('bq-media-shell');
    // Ya cargada (caché): se muestra nítida, sin parpadeo.
    if (img.complete && img.naturalWidth > 0) return;
    img.classList.add('bq-progressive');
    if (reduceMotion) img.classList.add('is-loaded');
    shell.classList.add('is-loading');
    var done = false;
    function onLoad() {
      if (done) return; done = true;
      var p = typeof img.decode === 'function' ? img.decode() : Promise.resolve();
      p.catch(function () { /* decode falla en algunos SVG: se muestra igual */ }).then(function () { finish(img, shell, true); });
    }
    function onError() { if (done) return; done = true; finish(img, shell, false); }
    img.addEventListener('load', onLoad, { once: true });
    img.addEventListener('error', onError, { once: true });
    // Carrera: pudo terminar entre la comprobación y los listeners.
    if (img.complete) { img.naturalWidth > 0 ? onLoad() : onError(); }
  }

  // ── Insignias de vidrio con su color ──────────────────────────────────────
  function rgbaFrom(color, alpha) {
    var m = /rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)(?:[\s,/]+([\d.]+))?/.exec(color || '');
    if (!m) return null;
    if (m[4] !== undefined && Number(m[4]) < 0.05) return null; // transparente: usa el vidrio oscuro
    return { glass: 'rgba(' + m[1] + ',' + m[2] + ',' + m[3] + ',' + alpha + ')', solid: 'rgb(' + m[1] + ',' + m[2] + ',' + m[3] + ')' };
  }
  function prepareBadge(badge) {
    if (badge.dataset.bqGlass === '1') return;
    badge.dataset.bqGlass = '1';
    var c = rgbaFrom(getComputedStyle(badge).backgroundColor, 0.84);
    if (c) {
      badge.style.setProperty('--bq-glass-bg', c.glass);
      badge.style.setProperty('--bq-glass-solid', c.solid);
    }
    badge.classList.add('bq-glass');
  }

  function prepareCard(card) {
    if (card.dataset.bqCardReady === '1') {
      // La tarjeta pudo recibir una foto nueva (render en vivo): solo se revisan las fotos.
      card.querySelectorAll('img:not([data-bq-card])').forEach(prepareImage);
      return;
    }
    card.dataset.bqCardReady = '1';
    card.classList.add('bq-card-motion');
    card.querySelectorAll('img').forEach(function (img) {
      if (/logo|icon/i.test(img.className) || img.closest('.bq-ally-actions')) return;
      prepareImage(img);
    });
    card.querySelectorAll(BADGE_SEL).forEach(function (badge) {
      if (badge.closest('.bq-media-shell')) prepareBadge(badge);
    });
  }

  function scan(root) {
    var scope = root && root.querySelectorAll ? root : document;
    if (scope.matches && scope.matches(CARD_SEL)) prepareCard(scope);
    scope.querySelectorAll(CARD_SEL).forEach(prepareCard);
  }

  // Las tarjetas que llegan después (Supabase, filtros, «ver más»).
  var pending = new Set();
  var scheduled = false;
  function flush() {
    scheduled = false;
    pending.forEach(function (node) { if (node.isConnected) scan(node); });
    pending.clear();
  }
  function watch() {
    if (!('MutationObserver' in window)) return;
    new MutationObserver(function (records) {
      records.forEach(function (r) {
        r.addedNodes.forEach(function (n) { if (n.nodeType === 1) pending.add(n); });
      });
      if (pending.size && !scheduled) { scheduled = true; (window.requestAnimationFrame || setTimeout)(flush); }
    }).observe(document.body, { childList: true, subtree: true });
  }

  // ── Modo Sol ──────────────────────────────────────────────────────────────
  function readSun() {
    try { return localStorage.getItem(SUN_KEY); } catch (_) { return null; }
  }
  function isOn() { return document.documentElement.getAttribute('data-bq-sun') === 'on'; }
  function syncButtons() {
    var on = isOn();
    document.querySelectorAll('.bq-sun-toggle').forEach(function (b) {
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      var label = on ? t('a11y.sunModeOff', 'Salir del Modo Sol') : t('a11y.sunMode', 'Modo Sol: alto contraste para leer con sol');
      b.setAttribute('aria-label', label);
      b.title = label;
    });
  }
  function setSun(on, remember) {
    if (on) document.documentElement.setAttribute('data-bq-sun', 'on');
    else document.documentElement.removeAttribute('data-bq-sun');
    if (remember !== false) {
      try { localStorage.setItem(SUN_KEY, on ? 'on' : 'off'); } catch (_) { /* navegación privada: dura esta visita */ }
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      if (!meta.dataset.bqOriginal) meta.dataset.bqOriginal = meta.getAttribute('content') || '';
      meta.setAttribute('content', on ? '#ffffff' : meta.dataset.bqOriginal);
    }
    syncButtons();
    try { document.dispatchEvent(new CustomEvent('bq:sun-mode', { detail: { on: on } })); } catch (_) { /* navegadores viejos */ }
  }
  function toggleSun() { setSun(!isOn()); }

  function makeButton() {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'bq-sun-toggle';
    b.setAttribute('aria-pressed', 'false');
    var i = document.createElement('i');
    i.className = 'fa-solid fa-sun';
    i.setAttribute('aria-hidden', 'true');
    var s = document.createElement('span');
    s.className = 'bq-sun-label';
    s.setAttribute('aria-hidden', 'true');
    s.setAttribute('data-i18n', 'a11y.sunShort');
    s.textContent = t('a11y.sunShort', 'Modo Sol');
    b.appendChild(i); b.appendChild(s);
    b.addEventListener('click', toggleSun);
    return b;
  }
  function mountButton() {
    if (/admin(\.html)?$/i.test(location.pathname)) return true; // el Ops Center tiene su propio tema
    var actions = document.querySelector('.global-nav-actions, .nav-actions-right, .exact-nav-actions');
    if (!actions) return false;
    if (actions.querySelector('.bq-sun-toggle')) return true;
    var b = makeButton();
    var lang = actions.querySelector('.navbar-lang-pill, .global-language');
    if (lang) actions.insertBefore(b, lang); else actions.appendChild(b);
    syncButtons();
    return true;
  }

  function init() {
    var saved = readSun();
    if (saved === 'on' || (saved === null && window.matchMedia && window.matchMedia('(prefers-contrast: more)').matches)) setSun(true, false);
    scan(document);
    watch();
    // La barra la arma navigation.js: se reintenta hasta que exista (máx. ~10 s).
    var tries = 0;
    (function retry() {
      if (mountButton() || ++tries > 40) return;
      setTimeout(retry, 250);
    })();
    // Al cambiar de idioma se vuelven a traducir las etiquetas del botón.
    window.addEventListener('baqueano:languageChanged', syncButtons);
    window.addEventListener('baqueano:i18nReady', syncButtons);
  }

  window.BaqueanoCards = Object.freeze({ scan: scan });
  window.BaqueanoSunMode = Object.freeze({ isOn: isOn, set: setSun, toggle: toggleSun });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
