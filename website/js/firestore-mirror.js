/*
 * ============================================================================
 * 🧭 BAQUEANO — ESPEJO AUTOMÁTICO FIRESTORE → SUPABASE (firestore-mirror.js)
 * ============================================================================
 *
 * 🎯 POR QUÉ (Propósito):
 * - Directiva del propietario (2026-10-03): Firestore es la fuente prioritaria
 *   y Supabase guarda la misma información. Las copias que el sitio intentaba
 *   con la clave pública eran rechazadas por Supabase sin aviso.
 *
 * ⚙️ CÓMO (Arquitectura):
 * - Envuelve, una sola vez, los métodos de escritura del SDK compat de
 *   Firestore: DocumentReference.set/update/delete, CollectionReference.add y
 *   WriteBatch.set/update/delete/commit. El resultado original se devuelve
 *   intacto: el espejo NUNCA bloquea ni cambia el comportamiento del sitio.
 * - Solo después de que Firestore confirma la escritura se lee el documento
 *   final (resuelve serverTimestamp y merges) y se envía a la Edge Function
 *   `baqueano-mirror` con el ID token de Firebase. La función verifica el
 *   token y aplica las mismas reglas que firestore.rules.
 * - Sin sesión no se envía nada (Firestore exige sesión para casi todo).
 * - Si la red falla, el envío queda en una cola local (máx. 100) y se
 *   reintenta al recuperar conexión o en la próxima carga. 401/403/400 no se
 *   reintentan (no tendría sentido).
 *
 * 📦 QUÉ (Entregables):
 * - window.BaqueanoMirror = { flush(), pending(), mirrorPath(path) }.
 * ============================================================================
 */
(function (window) {
  'use strict';

  if (window.BaqueanoMirror) return;

  var ENDPOINT = 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-mirror';
  var QUEUE_KEY = 'baqueano_mirror_queue_v1';
  var MAX_QUEUE = 100;
  var patched = false;

  // ---- Serialización de tipos de Firestore a JSON ---------------------------
  function toJson(value, depth) {
    if (depth > 20 || value === undefined) return null;
    if (value === null || typeof value !== 'object') {
      return typeof value === 'number' && !isFinite(value) ? null : value;
    }
    if (typeof value.toDate === 'function' && typeof value.seconds === 'number') {
      try { return value.toDate().toISOString(); } catch (_) { return null; }
    }
    if (typeof value.latitude === 'number' && typeof value.longitude === 'number' && typeof value.isEqual === 'function') {
      return { latitude: value.latitude, longitude: value.longitude };
    }
    if (typeof value.path === 'string' && value.firestore) return { ref: value.path };
    if (typeof value.toBase64 === 'function') return { bytes: value.toBase64() };
    if (value instanceof Date) return isFinite(value.getTime()) ? value.toISOString() : null;
    if (Array.isArray(value)) return value.map(function (item) { return toJson(item, depth + 1); });
    var out = {};
    Object.keys(value).forEach(function (key) { out[key] = toJson(value[key], depth + 1); });
    return out;
  }

  // ---- Cola persistente --------------------------------------------------------
  function readQueue() {
    try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch (_) { return []; }
  }
  function writeQueue(queue) {
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-MAX_QUEUE))); } catch (_) { /* almacenamiento lleno o bloqueado */ }
  }

  function currentUser() {
    try { return window.firebase && window.firebase.auth ? window.firebase.auth().currentUser : null; } catch (_) { return null; }
  }

  // Envía un registro; devuelve 'ok' | 'retry' | 'drop'.
  async function send(entry) {
    var user = currentUser();
    if (!user || typeof user.getIdToken !== 'function') return 'retry';
    var token;
    try { token = await user.getIdToken(); } catch (_) { return 'retry'; }
    try {
      var response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-firebase-token': token },
        body: JSON.stringify(entry),
        keepalive: true
      });
      if (response.ok) return 'ok';
      if (response.status === 401 || response.status === 403 || response.status === 400 || response.status === 413) {
        console.warn('[Baqueano Mirror] Copia rechazada (' + response.status + '):', entry.path);
        return 'drop';
      }
      return 'retry';
    } catch (_) {
      return 'retry';
    }
  }

  async function dispatch(entry) {
    var result = await send(entry);
    if (result === 'retry') {
      var queue = readQueue();
      queue.push(entry);
      writeQueue(queue);
    }
  }

  var flushing = false;
  async function flush() {
    if (flushing || !currentUser()) return;
    flushing = true;
    try {
      var queue = readQueue();
      var remaining = [];
      for (var i = 0; i < queue.length; i++) {
        var result = await send(queue[i]);
        if (result === 'retry') remaining.push(queue[i]);
      }
      writeQueue(remaining);
    } finally {
      flushing = false;
    }
  }

  // Lee el documento ya escrito y lo envía (resuelve serverTimestamp, merges…).
  async function mirrorRef(ref, op) {
    try {
      if (!ref || typeof ref.path !== 'string' || !currentUser()) return;
      if (op === 'delete') return dispatch({ path: ref.path, op: 'delete', source: 'web' });
      var snapshot = await ref.get();
      if (!snapshot.exists) return dispatch({ path: ref.path, op: 'delete', source: 'web' });
      return dispatch({ path: ref.path, op: op, data: toJson(snapshot.data(), 0), source: 'web' });
    } catch (error) {
      console.warn('[Baqueano Mirror] No se pudo preparar la copia de', ref && ref.path, error && error.message);
    }
  }

  // ---- Envoltura de los métodos de escritura ----------------------------------
  function wrap(proto, method, after) {
    var original = proto && proto[method];
    if (typeof original !== 'function' || original.__bqMirror) return;
    var wrapped = function () {
      var result = original.apply(this, arguments);
      try { after(this, result, arguments); } catch (_) { /* el espejo nunca rompe la escritura */ }
      return result;
    };
    wrapped.__bqMirror = true;
    proto[method] = wrapped;
  }

  function patch() {
    if (patched) return true;
    var fs = window.firebase && window.firebase.firestore;
    if (!fs || !fs.DocumentReference || !fs.CollectionReference) return false;
    patched = true;

    ['set', 'update', 'delete'].forEach(function (method) {
      wrap(fs.DocumentReference.prototype, method, function (ref, promise) {
        if (promise && typeof promise.then === 'function') {
          promise.then(function () { mirrorRef(ref, method); }, function () { /* Firestore rechazó: no hay nada que copiar */ });
        }
      });
    });

    wrap(fs.CollectionReference.prototype, 'add', function (_collection, promise) {
      if (promise && typeof promise.then === 'function') {
        promise.then(function (ref) { mirrorRef(ref, 'add'); }, function () {});
      }
    });

    if (fs.WriteBatch) {
      ['set', 'update', 'delete'].forEach(function (method) {
        wrap(fs.WriteBatch.prototype, method, function (batch, _result, args) {
          batch.__bqRefs = batch.__bqRefs || [];
          batch.__bqRefs.push({ ref: args[0], op: method });
        });
      });
      wrap(fs.WriteBatch.prototype, 'commit', function (batch, promise) {
        var refs = (batch.__bqRefs || []).slice();
        batch.__bqRefs = [];
        if (promise && typeof promise.then === 'function') {
          promise.then(function () { refs.forEach(function (item) { mirrorRef(item.ref, item.op); }); }, function () {});
        }
      });
    }
    return true;
  }

  // El SDK de Firestore puede cargarse después de este script: se reintenta.
  function waitForFirestore(attempt) {
    if (patch()) { flush(); return; }
    if (attempt < 60) window.setTimeout(function () { waitForFirestore(attempt + 1); }, 500);
  }

  window.addEventListener('online', flush);
  try {
    if (window.firebase && window.firebase.auth) window.firebase.auth().onAuthStateChanged(function (user) { if (user) flush(); });
  } catch (_) { /* Auth aún no disponible */ }

  window.BaqueanoMirror = Object.freeze({
    flush: flush,
    pending: function () { return readQueue().length; },
    mirrorPath: function (path) {
      if (!window.firebase || !window.firebase.firestore) return Promise.resolve();
      return mirrorRef(window.firebase.firestore().doc(path), 'set');
    }
  });

  waitForFirestore(0);
})(window);
