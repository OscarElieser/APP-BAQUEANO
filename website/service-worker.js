/*
 * ============================================================================
 * BAQUEANO NICARAGUA — SERVICE WORKER PUBLICO
 * ============================================================================
 * POR QUÉ: Mantener una salida útil sin conservar datos de sesión o paneles.
 * CÓMO: Precarga solo una página offline y recursos visuales públicos; excluye
 * rutas privadas, API, Firebase, otros orígenes y cualquier petición no GET.
 * QUÉ: Instalación, limpieza versionada, caché estática y fallback de navegación.
 * 16-10-2026 (Módulo 3, «ruta sin señal»):
 *   - Las cachés «baqueano-rutas-*» las llena la persona con «Guardar mi ruta para ir sin
 *     señal» (js/offline-route.js): no se borran al actualizar el service worker.
 *   - /locales/ entra como recurso público: sin señal la página conserva el idioma elegido.
 *   - Background Sync «bq-outbox»: envía a Supabase los registros de contacto que quedaron en
 *     la cola de IndexedDB sin señal. Solo las RPC de analítica; máx. 7 días.
 * ============================================================================
 */
'use strict';
const CACHE_VERSION = 'baqueano-offline-v15';
const OFFLINE_URL = '/offline.html';
const PRECACHE_URLS = [
  OFFLINE_URL,
  '/index.html',
  '/destinos.html',
  '/manifest.json',
  '/site.webmanifest',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/styles.css',
  '/css/mobile-first-core.css',
  '/css/demo-hackathon.css',
  '/js/demo-hackathon-tour.js',
  '/js/destinos-provenance.js',
  '/assets/images/baqueano_launcher_solid.png',
  '/assets/images/logo.png'
];
const PRIVATE_PREFIXES = ['/admin', '/perfil', '/api/', '/health'];
const STATIC_PREFIXES = ['/assets/images/', '/assets/audio/', '/css/', '/js/', '/assets/icons/', '/locales/', '/fonts/'];
const ROUTE_CACHE_PREFIX = 'baqueano-rutas-';
function isPrivatePath(pathname) {
  return PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
function isPublicStaticPath(pathname) {
  return STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    pathname === '/styles.css' || pathname === '/app.js' || pathname === '/manifest.json' ||
    pathname === '/site.webmanifest' || pathname === '/favicon.ico' || pathname.startsWith('/favicon-') ||
    pathname.startsWith('/android-chrome-') || pathname.startsWith('/maskable-') || pathname === '/apple-touch-icon.png';
}
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION && !key.startsWith(ROUTE_CACHE_PREFIX)).map((key) => caches.delete(key))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || isPrivatePath(url.pathname)) return;
  if (request.mode === 'navigate') {
    event.respondWith(
      Promise.race([
        fetch(request),
        new Promise((_, reject) => setTimeout(() => reject(new Error('navigation-timeout')), 15000))
      ]).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(async () => (await caches.match(request)) || caches.match(OFFLINE_URL))
    );
    return;
  }
  if (!isPublicStaticPath(url.pathname)) return;
  // JavaScript y CSS usan red primero para no conservar controles obsoletos.
  // El caché queda únicamente como respaldo cuando no existe conectividad.
  event.respondWith(fetch(request, { cache: 'no-store' }).then((response) => {
    if (!response.ok || response.type !== 'basic') return response;
    const copy = response.clone();
    caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
    return response;
  }).catch(() => caches.match(request)));
});

// ── Cola de envíos pendientes (Background Sync) ────────────────────────────
const OUTBOX_ALLOW = /^https:\/\/heiudfpthqwtjrtluqlm\.supabase\.co\/rest\/v1\/rpc\/(track_event|track_commercial_action)$/;
const OUTBOX_TTL = 7 * 86400000;
function outboxDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('baqueano-offline', 1);
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains('routes')) d.createObjectStore('routes', { keyPath: 'id' });
      if (!d.objectStoreNames.contains('outbox')) d.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function outboxAll(d) {
  return new Promise((resolve, reject) => {
    const r = d.transaction('outbox', 'readonly').objectStore('outbox').getAll();
    r.onsuccess = () => resolve(r.result || []);
    r.onerror = () => reject(r.error);
  });
}
function outboxDelete(d, id) {
  return new Promise((resolve) => {
    const tr = d.transaction('outbox', 'readwrite');
    tr.objectStore('outbox').delete(id);
    tr.oncomplete = () => resolve();
    tr.onerror = () => resolve();
  });
}
async function flushOutbox() {
  const d = await outboxDb();
  const items = await outboxAll(d);
  for (const item of items) {
    if (Date.now() - item.createdAt > OUTBOX_TTL || !OUTBOX_ALLOW.test(item.url)) { await outboxDelete(d, item.id); continue; }
    // Sin red, fetch lanza error: el navegador reintenta el sync más tarde.
    const res = await fetch(item.url, { method: 'POST', headers: item.headers, body: JSON.stringify(item.body) });
    if (res.status >= 500) throw new Error('servidor ocupado');
    await outboxDelete(d, item.id);
  }
}
self.addEventListener('sync', (event) => {
  if (event.tag === 'bq-outbox') event.waitUntil(flushOutbox());
});

