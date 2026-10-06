// ============================================================================
// 🧭 BAQUEANO — CLIENTE DEL BUZÓN REAL (intake-api.js)
// ============================================================================
// 🎯 POR QUÉ:
// - Contacto (nosotros.html), denuncias ambientales (denuncias.html) y solicitudes de negocio
//   (Red BAQUEANO) guardan primero en Supabase mediante la Edge Function baqueano-intake. Este
//   archivo es el único punto de llamada, para no repetir lógica en cada página.
//
// ⚙️ CÓMO:
// - POST con el token de Firebase si hay sesión; si no, va sin token (contacto y denuncia anónima).
// - Clave de idempotencia por envío: si el usuario pulsa dos veces o la red falla y reintenta,
//   el servidor devuelve el mismo código en vez de duplicar.
// - Los 17 territorios con su nombre oficial (valor que valida el servidor) y su id en Supabase,
//   para cargar los municipios reales desde la tabla `municipalities` (lectura pública).
// - Ningún texto de error crudo llega al usuario: mensajes humanos traducidos.
//
// 📦 QUÉ:
// - window.BaqueanoIntake = { call, newKey, territories, loadMunicipalities, t, firebaseUser }.
// ============================================================================
(function (window) {
  'use strict';
  if (window.BaqueanoIntake) return;

  var ENDPOINT = 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-intake';
  var REST = 'https://heiudfpthqwtjrtluqlm.supabase.co/rest/v1/';
  var PUBLISHABLE_KEY = 'sb_publishable_q7ZhqRIRjlerZK7WOu_Qxw_X_AqXV1d';

  // Valor = nombre que valida el servidor; id = clave en public.departments.
  var TERRITORIES = [
    { value: 'Boaco', id: 'boaco', label: 'Boaco' },
    { value: 'Carazo', id: 'carazo', label: 'Carazo' },
    { value: 'Chinandega', id: 'chinandega', label: 'Chinandega' },
    { value: 'Chontales', id: 'chontales', label: 'Chontales' },
    { value: 'Estelí', id: 'esteli', label: 'Estelí' },
    { value: 'Granada', id: 'granada', label: 'Granada' },
    { value: 'Jinotega', id: 'jinotega', label: 'Jinotega' },
    { value: 'León', id: 'leon', label: 'León' },
    { value: 'Madriz', id: 'madriz', label: 'Madriz' },
    { value: 'Managua', id: 'managua', label: 'Managua' },
    { value: 'Masaya', id: 'masaya', label: 'Masaya' },
    { value: 'Matagalpa', id: 'matagalpa', label: 'Matagalpa' },
    { value: 'Nueva Segovia', id: 'nueva_segovia', label: 'Nueva Segovia' },
    { value: 'Rivas', id: 'rivas', label: 'Rivas' },
    { value: 'Río San Juan', id: 'rio_san_juan', label: 'Río San Juan' },
    { value: 'RACCN', id: 'raccn', label: 'Costa Caribe Norte (RACCN)' },
    { value: 'RACCS', id: 'raccs', label: 'Costa Caribe Sur (RACCS)' }
  ];

  function t(key, fallback, vars) {
    try {
      if (window.BaqueanoLanguage && typeof window.BaqueanoLanguage.t === 'function') {
        return window.BaqueanoLanguage.t(key, Object.assign({ fallback: fallback }, vars || {}));
      }
    } catch (_) { /* respaldo abajo */ }
    return String(fallback).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; });
  }
  function lang() {
    try { return (window.BaqueanoLanguage && window.BaqueanoLanguage.get && window.BaqueanoLanguage.get()) || document.documentElement.lang || 'es'; }
    catch (_) { return 'es'; }
  }
  function firebaseUser() {
    try { return window.firebase && window.firebase.auth ? window.firebase.auth().currentUser : null; } catch (_) { return null; }
  }
  function newKey() {
    var bytes = new Uint8Array(18);
    (window.crypto || window.msCrypto).getRandomValues(bytes);
    return Array.prototype.map.call(bytes, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }

  function call(action, payload) {
    var user = firebaseUser();
    var tokenPromise = user && typeof user.getIdToken === 'function' ? user.getIdToken().catch(function () { return null; }) : Promise.resolve(null);
    return tokenPromise.then(function (token) {
      var headers = { 'content-type': 'application/json' };
      if (token) headers['x-firebase-token'] = token;
      var body = Object.assign({ action: action, language: lang().slice(0, 2) }, payload || {});
      return fetch(ENDPOINT, { method: 'POST', headers: headers, body: JSON.stringify(body) }).catch(function () {
        var e = new Error(t('intake.errorNetwork', 'No pudimos conectar con BAQUEANO. Revisá tu conexión: lo que escribiste sigue aquí.'));
        e.status = 0; throw e;
      });
    }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (data) {
        if (res.ok && data && data.ok !== false) return data;
        var e = new Error((data && data.error) || t('intake.errorGeneric', 'No se pudo completar el envío. Intentá de nuevo en unos minutos.'));
        e.status = res.status; e.code = data && data.code; throw e;
      });
    });
  }

  var municipalityCache = {};
  function loadMunicipalities(territoryValue) {
    var territory = TERRITORIES.filter(function (x) { return x.value === territoryValue; })[0];
    if (!territory) return Promise.resolve([]);
    if (municipalityCache[territory.id]) return Promise.resolve(municipalityCache[territory.id]);
    var url = REST + 'municipalities?select=name&department_id=eq.' + encodeURIComponent(territory.id) + '&order=name.asc';
    return fetch(url, { headers: { apikey: PUBLISHABLE_KEY, Authorization: 'Bearer ' + PUBLISHABLE_KEY } })
      .then(function (res) { return res.ok ? res.json() : []; })
      .then(function (rows) {
        var names = (Array.isArray(rows) ? rows : []).map(function (r) { return r.name; }).filter(Boolean);
        municipalityCache[territory.id] = names;
        return names;
      })
      .catch(function () { return []; });
  }

  window.BaqueanoIntake = {
    call: call,
    newKey: newKey,
    territories: TERRITORIES.slice(),
    loadMunicipalities: loadMunicipalities,
    t: t,
    lang: lang,
    firebaseUser: firebaseUser
  };
})(window);
