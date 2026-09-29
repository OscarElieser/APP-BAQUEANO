// ============================================================================
// BAQUEANO — CLIENTE CANÓNICO DE DATOS (baqueano-api.js)
// ============================================================================
// POR QUÉ: impedir que la interfaz use localStorage, Firestore o cifras embebidas
// como fuente de verdad para perfiles, favoritos, viajes y contenido turístico.
// CÓMO: consume Firebase Functions bajo /api; para rutas privadas adjunta el ID
// Token emitido por Firebase Auth. Nunca contiene secretos de Supabase.
// QUÉ: lectura pública de catálogo y operaciones autenticadas persistidas por el
// backend exclusivamente en Supabase PostgreSQL.
// ============================================================================
(function (window) {
  'use strict';

  var authReadyPromise;
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        if (existing.dataset.loaded === 'true') return resolve();
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      var script = document.createElement('script');
      script.src = src;
      script.defer = true;
      script.addEventListener('load', function () { script.dataset.loaded = 'true'; resolve(); }, { once: true });
      script.addEventListener('error', reject, { once: true });
      document.head.appendChild(script);
    });
  }

  function ensureFirebaseAuth() {
    if (authReadyPromise) return authReadyPromise;
    authReadyPromise = Promise.resolve()
      .then(function () { return window.firebase ? null : loadScript('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js'); })
      .then(function () { return window.firebase && window.firebase.auth ? null : loadScript('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js'); })
      .then(function () { return window.BaqueanoFirebase ? null : loadScript('js/firebase-config.js'); })
      .then(function () {
        return new Promise(function (resolve) {
          var unsubscribe = window.firebase.auth().onAuthStateChanged(function () {
            unsubscribe();
            resolve();
          }, function () { resolve(); });
        });
      });
    return authReadyPromise;
  }

  async function firebaseToken() {
    await ensureFirebaseAuth();
    var user = window.firebase.auth().currentUser;
    return user ? user.getIdToken() : null;
  }

  async function request(path, options) {
    var config = Object.assign({ method: 'GET', headers: {} }, options || {});
    config.headers = Object.assign({ Accept: 'application/json' }, config.headers || {});
    var token = await firebaseToken();
    if (token) config.headers.Authorization = 'Bearer ' + token;
    if (config.body && typeof config.body !== 'string') {
      config.headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(config.body);
    }
    var response = await fetch('/api/' + String(path).replace(/^\/+/, ''), config);
    var payload = await response.json().catch(function () { return {}; });
    if (!response.ok) {
      var error = new Error((payload.error && payload.error.message) || 'No fue posible completar la operación.');
      error.code = payload.error && payload.error.code;
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  window.BaqueanoApi = {
    authReady: ensureFirebaseAuth,
    request: request,
    destinations: function (filters) {
      var params = new URLSearchParams(filters || {});
      return request('destinations' + (params.toString() ? '?' + params : ''));
    },
    profile: function () { return request('profile'); },
    saveFavorite: function (entityId, entityType) {
      return request('favorites', { method: 'POST', body: { entityId: entityId, entityType: entityType || 'destination' } });
    },
    reservations: function () { return request('reservations'); },
    createReservation: function (record) { return request('reservations', { method: 'POST', body: record }); },
    travelPlans: function () { return request('travel-plans'); },
    saveTravelPlan: function (record) { return request('travel-plans', { method: 'POST', body: record }); }
  };
})(window);
