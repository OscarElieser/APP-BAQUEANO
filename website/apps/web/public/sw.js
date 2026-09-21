/**
 * POR QUE: Mi Viaje debe conservar una shell segura con conectividad degradada.
 * COMO: Cache-first solo para assets y rutas culturales; network-first para viaje.
 * QUE: Service Worker sin cache de API, Auth, pagos, tokens o datos bancarios.
 */
const CACHE = "baqueano-safe-shell-v1";
const SHELL = ["/mi-viaje", "/historia", "/gastronomia", "/cultura", "/mapa"];
self.addEventListener("install", (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL))));
self.addEventListener("activate", (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))));
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/") || url.pathname.includes("auth") || url.pathname.includes("pago")) return;
  if (url.pathname.startsWith("/viaje/") || url.pathname.startsWith("/mi-viaje/")) {
    event.respondWith(fetch(event.request).then((response) => { const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); return response; }).catch(() => caches.match(event.request).then((cached) => cached || caches.match("/mi-viaje"))));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
