// ============================================================================
// 🧭 BAQUEANO — MI VIAJE COMPARTIDO (baqueano-trip-store.js)
// ============================================================================
// 🎯 POR QUÉ: reporte del propietario (2026-10-09): «cuando le das + Mi viaje no se guarda en
//    mi-viaje.html». Había tres cajones distintos: el catálogo guardaba ids en `baqueano-trip`,
//    destino.html guardaba en `baqueano_trip_plan` y mi-viaje.html solo lee `baqueano_trip`.
// ⚙️ CÓMO: un único almacén con el formato que ya entiende mi-viaje-interactions.js
//    ({ name, saved, days: [...] }). Cada destino agregado es una parada con su nombre, territorio,
//    descripción y coordenadas reales cuando existen (nunca inventadas). Migra una sola vez lo que
//    quedó en las claves viejas. Sin localStorage disponible, no rompe la página.
// 📦 QUÉ: window.BaqueanoTrip = { has(destId), add(stop), remove(destId), list(), migrateLegacy() }.
// ============================================================================
(function (window) {
  'use strict';
  if (window.BaqueanoTrip) return;
  var KEY = 'baqueano_trip';
  var LEGACY_IDS = 'baqueano-trip';
  var LEGACY_PLAN = 'baqueano_trip_plan';

  function read(key, fallback) {
    try { var v = JSON.parse(window.localStorage.getItem(key)); return v == null ? fallback : v; } catch (_) { return fallback; }
  }
  function write(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); return true; } catch (_) { return false; }
  }
  function t(key, fallback) {
    try { return (window.BaqueanoLanguage && window.BaqueanoLanguage.t(key, { fallback: fallback })) || fallback; } catch (_) { return fallback; }
  }
  function load() {
    var trip = read(KEY, null);
    if (!trip || typeof trip !== 'object' || !Array.isArray(trip.days)) trip = { name: 'Mi Aventura por Nicaragua', saved: false, days: [] };
    // Un itinerario de ejemplo no se mezcla con destinos reales del visitante.
    if (trip.demo) trip = { name: trip.name || 'Mi Aventura por Nicaragua', saved: false, days: [] };
    return trip;
  }
  function slug(value) {
    return String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  function nextId(days) {
    return days.reduce(function (max, d) { return Math.max(max, Number(d.id) || 0); }, 0) + 1;
  }

  function has(destId) {
    if (!destId) return false;
    return load().days.some(function (d) { return d.destId === destId; });
  }

  // stop: { destId, name, location, desc, lat, lng, link, image }
  function add(stop) {
    if (!stop || !stop.name) return false;
    var destId = stop.destId || slug(stop.name);
    var trip = load();
    if (trip.days.some(function (d) { return d.destId === destId; })) return true;
    var lat = Number(stop.lat), lng = Number(stop.lng);
    var coords = stop.lat != null && stop.lng != null && isFinite(lat) && isFinite(lng);
    trip.days.push({
      id: nextId(trip.days), destId: destId,
      badge: t('trip.stopBadge', 'Destino guardado'),
      location: stop.location || 'Nicaragua', title: stop.name, desc: stop.desc || '',
      extra: '', cost: '', km: null, hours: null,
      lat: coords ? lat : null, lng: coords ? lng : null,
      link: stop.link || '', image: stop.image || '', addedAt: new Date().toISOString(), saved: false
    });
    return write(KEY, trip);
  }

  function remove(destId) {
    var trip = load();
    trip.days = trip.days.filter(function (d) { return d.destId !== destId; });
    return write(KEY, trip);
  }

  function list() { return load().days.slice(); }

  // Lo agregado con destino.html (baqueano_trip_plan) pasa al viaje real una sola vez.
  // Los ids sueltos de `baqueano-trip` los recupera el catálogo (que conoce nombre y lugar).
  function migrateLegacy() {
    var plan = read(LEGACY_PLAN, []);
    if (Array.isArray(plan) && plan.length) {
      plan.forEach(function (p) { if (p && p.title) add({ destId: p.destinationId || slug(p.title), name: p.title, location: p.department || '' }); });
      write(LEGACY_PLAN, []);
    }
  }

  window.BaqueanoTrip = { has: has, add: add, remove: remove, list: list, migrateLegacy: migrateLegacy, legacyIds: function () { return read(LEGACY_IDS, []); }, clearLegacyIds: function () { write(LEGACY_IDS, []); } };
  migrateLegacy();
})(window);
