// ============================================================================
// 🧭 BAQUEANO — PRESENCIA EN TIEMPO REAL (baqueano-presence.js)
// ============================================================================
// 🎯 POR QUÉ:
// - El Ops Center no mostraba a las personas conectadas: la analítica depende del
//   consentimiento, no había métrica de "ahora" y la sesión de Firebase nunca llegaba como
//   usuario. La presencia operativa es mínima y sin rastreo:
//   - no usa cookies, localStorage ni sessionStorage;
//   - no guarda identificadores en el dispositivo.
//
// ⚙️ CÓMO:
// - tab_id: aleatorio por pestaña, solo en memoria.
// - browser_id: aleatorio en memoria; las pestañas abiertas del mismo navegador lo comparten por
//   BroadcastChannel. Así 5 pestañas de una persona cuentan como 1 persona, 1 sesión y 5 pestañas.
//   Al cerrar todas, el id desaparece.
// - Latido cada 25 s con la pestaña visible y cada 60 s oculta. Al cambiar de visibilidad se
//   envía uno al momento; al salir (pagehide), "leave" con keepalive.
// - Si hay sesión de Firebase, se envía el token: el servidor lo verifica y deduce el rol.
//   El cliente nunca declara quién es.
// - Solo la ruta, sin query ni hash. Sin IP, sin user agent y sin coordenadas.
//
// 📦 QUÉ: window.BaqueanoPresence = { ping(), state }.
// ============================================================================
(function (window, document) {
  'use strict';
  if (window.BaqueanoPresence) return;

  var ENDPOINT = 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-presence';
  var VISIBLE_MS = 25000;
  var HIDDEN_MS = 60000;

  function randomId() {
    var bytes = new Uint8Array(16);
    (window.crypto || window.msCrypto).getRandomValues(bytes);
    return Array.prototype.map.call(bytes, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }
  var state = { tabId: randomId(), browserId: null, timer: null, sending: false, left: false };

  function platform() {
    try {
      if (window.matchMedia && (window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: minimal-ui)').matches)) return 'pwa';
      if (window.navigator.standalone === true) return 'pwa';
    } catch (_) { /* navegador sin matchMedia */ }
    return 'web';
  }
  function device() {
    var w = Math.min(window.screen ? window.screen.width : window.innerWidth, window.innerWidth || 9999);
    var coarse = false;
    try { coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches; } catch (_) { /* sin media queries */ }
    if (coarse && w < 768) return 'mobile';
    if (coarse && w < 1200) return 'tablet';
    return w < 768 ? 'mobile' : 'desktop';
  }
  function language() {
    try {
      var l = (window.BaqueanoLanguage && window.BaqueanoLanguage.get && window.BaqueanoLanguage.get()) || document.documentElement.lang || 'es';
      return String(l).slice(0, 2).toLowerCase();
    } catch (_) { return 'es'; }
  }
  // Etiqueta pública de la página (p. ej. el destino o departamento abierto), nunca texto libre:
  // solo ids con formato de slug tomados de la URL.
  function label() {
    try {
      var params = new URLSearchParams(window.location.search);
      var keys = ['id', 'dep', 'departamento', 'destino', 'slug', 'd'];
      for (var i = 0; i < keys.length; i++) {
        var v = params.get(keys[i]);
        if (v && /^[A-Za-z0-9_.-]{1,60}$/.test(v)) return v.toLowerCase();
      }
    } catch (_) { /* URL sin parámetros */ }
    return null;
  }
  function firebaseUser() {
    try { return window.firebase && window.firebase.auth ? window.firebase.auth().currentUser : null; } catch (_) { return null; }
  }

  // ── browser_id compartido entre pestañas, sin almacenamiento ───────────────
  var channel = null;
  try { channel = 'BroadcastChannel' in window ? new window.BroadcastChannel('baqueano-presence') : null; } catch (_) { channel = null; }
  function adopt(id) {
    // Si dos pestañas generaron ids a la vez, convergen al menor.
    if (id && /^[a-f0-9]{32}$/.test(id) && (!state.browserId || id < state.browserId)) state.browserId = id;
  }
  if (channel) {
    channel.onmessage = function (event) {
      var msg = event.data || {};
      if (msg.type === 'who' && state.browserId) channel.postMessage({ type: 'id', id: state.browserId });
      if (msg.type === 'id') adopt(msg.id);
    };
  }
  function resolveBrowserId() {
    return new Promise(function (resolve) {
      if (!channel) { state.browserId = randomId(); resolve(); return; }
      channel.postMessage({ type: 'who' });
      window.setTimeout(function () {
        if (!state.browserId) { state.browserId = randomId(); channel.postMessage({ type: 'id', id: state.browserId }); }
        resolve();
      }, 300);
    });
  }

  function send(extra) {
    if (!state.browserId || state.left) return Promise.resolve();
    var leave = !!(extra && extra.leave);
    var user = firebaseUser();
    var tokenPromise = !leave && user && typeof user.getIdToken === 'function'
      ? user.getIdToken().catch(function () { return null; }) : Promise.resolve(null);
    return tokenPromise.then(function (token) {
      var headers = { 'content-type': 'application/json' };
      if (token) headers['x-firebase-token'] = token;
      var body = {
        action: 'heartbeat', tab_id: state.tabId, browser_id: state.browserId,
        platform: platform(), device: device(), path: window.location.pathname, label: label(),
        language: language(), visible: !document.hidden, leave: leave
      };
      return window.fetch(ENDPOINT, { method: 'POST', headers: headers, body: JSON.stringify(body), keepalive: leave })
        .catch(function () { /* la presencia nunca rompe la navegación */ });
    });
  }
  function schedule() {
    window.clearTimeout(state.timer);
    state.timer = window.setTimeout(function () { send().then(schedule); }, document.hidden ? HIDDEN_MS : VISIBLE_MS);
  }
  function ping() { return send().then(schedule); }

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && state.left) state.left = false; // vuelve del bfcache
    ping();
  });
  window.addEventListener('pagehide', function () { send({ leave: true }); state.left = true; window.clearTimeout(state.timer); });
  window.addEventListener('pageshow', function (event) { if (event.persisted) { state.left = false; ping(); } });
  window.addEventListener('baqueano:languageChanged', function () { ping(); });

  function watchAuth() {
    try {
      if (window.firebase && window.firebase.auth) {
        window.firebase.auth().onAuthStateChanged(function () { ping(); });
        return true;
      }
    } catch (_) { /* Firebase todavía no cargó */ }
    return false;
  }

  resolveBrowserId().then(function () {
    ping();
    // Firebase se carga de forma diferida en algunas páginas: se reintenta unos segundos.
    var tries = 0;
    (function waitAuth() {
      if (watchAuth() || ++tries > 20) return;
      window.setTimeout(waitAuth, 1000);
    })();
  });

  window.BaqueanoPresence = { ping: ping, state: state };
})(window, document);
