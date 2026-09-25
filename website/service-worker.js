/*
 * ============================================================================
 * BAQUEANO NICARAGUA — SERVICE WORKER PUBLICO
 * ============================================================================
 * POR QUÉ: Mantener una salida útil sin conservar datos de sesión o paneles.
 * CÓMO: Precarga solo una página offline y recursos visuales públicos; excluye
 * rutas privadas, API, Firebase, otros orígenes y cualquier petición no GET.
 * QUÉ: Instalación, limpieza versionada, caché estática y fallback de navegación.
 * ============================================================================
 */
'use strict';
const CACHE_VERSION = 'baqueano-public-v11';
const OFFLINE_URL = '/offline.html';
const PRECACHE_URLS = [OFFLINE_URL, '/index.html', '/destinos.html', '/assets/images/baqueano_launcher_solid.png', '/assets/images/logo.png'];
const PRIVATE_PREFIXES = ['/admin', '/perfil', '/api/', '/health'];
const STATIC_PREFIXES = ['/assets/images/', '/assets/audio/', '/css/', '/js/'];
function isPrivatePath(pathname) {
  return PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
function isPublicStaticPath(pathname) {
  return STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    pathname === '/styles.css' || pathname === '/app.js' || pathname === '/manifest.json';
}
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
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
