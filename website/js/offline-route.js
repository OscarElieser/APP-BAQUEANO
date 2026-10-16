/**
 * 🧭 BAQUEANO — MÓDULO 3 · RUTA SIN SEÑAL Y ENVÍOS PENDIENTES (js/offline-route.js)
 * 🎯 POR QUÉ: pedido del propietario (15-10-2026, «Módulo 3»). En la montaña, en la Costa
 *   Caribe o en el río no hay señal. La persona tiene que poder abrir su ruta, ver las fotos y los
 *   datos de cada parada, y contactar al propietario aunque no haya internet en ese momento.
 * ⚙️ CÓMO:
 *   1. «Guardar mi ruta para ir sin señal» (en Mi viaje):
 *      - IndexedDB (base «baqueano-offline», almacén «routes»): copia de las paradas de Mi viaje
 *        (nombre, lugar, descripción, coordenadas reales, foto), con fecha de guardado.
 *      - Cache Storage («baqueano-rutas-v1»): la página Mi viaje y todos sus estilos, scripts y
 *        traducciones ya cargados, la página offline y las fotos de cada parada. Las fotos del
 *        propio sitio se recomprimen a WebP (máx. 1280 px) para ocupar menos en el teléfono; si el
 *        navegador no puede, se guarda la original. El service worker sirve todo eso sin red.
 *      - Pide almacenamiento persistente (navigator.storage.persist) para que el teléfono no lo
 *        borre solo, y muestra cuánto ocupa.
 *   2. Cola de envíos pendientes (almacén «outbox»): los registros de analítica de contacto
 *      (Módulo 2) que fallan sin señal se guardan y se envían al volver la conexión.
 *      - Chrome/Android: Background Sync (el service worker los manda aunque se cierre la página).
 *      - iOS/Safari y Firefox (sin Background Sync): se envían desde la página al volver la señal,
 *        al volver a la pestaña o en la próxima visita. Solo uno de los dos caminos actúa.
 *      - Solo URLs de las RPC de analítica de Supabase; máx. 50 envíos y 7 días.
 *   3. Avisos (toast, role=status) al perder o recuperar la señal.
 * 📦 QUÉ: window.BaqueanoOffline = { saveRoute, removeRoute, getRoute, send, flush, toast }.
 */
(function () {
  'use strict';
  if (window.BaqueanoOffline) return;

  var DB_NAME = 'baqueano-offline';
  var DB_VERSION = 1;
  var ROUTE_CACHE = 'baqueano-rutas-v1';
  var ROUTE_ID = 'mi-viaje';
  var OUTBOX_MAX = 50;
  var OUTBOX_TTL = 7 * 86400000;
  var SYNC_TAG = 'bq-outbox';
  var SEND_ALLOW = /^https:\/\/heiudfpthqwtjrtluqlm\.supabase\.co\/rest\/v1\/rpc\/(track_event|track_commercial_action)$/;
  var ASSET_PATH = /^\/(css|js|assets|locales|fonts)\//;

  function t(key, fallback, vars) {
    var out = fallback;
    try {
      if (window.BaqueanoLanguage && window.BaqueanoLanguage.t) {
        var v = window.BaqueanoLanguage.t(key, { fallback: fallback });
        if (v && v !== key) out = v;
      }
    } catch (_) { out = fallback; }
    return String(out).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; });
  }
  function lang() { return (document.documentElement.lang || 'es').slice(0, 2); }

  // ── IndexedDB ─────────────────────────────────────────────────────────────
  var dbPromise = null;
  function db() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!('indexedDB' in window)) { reject(new Error('sin IndexedDB')); return; }
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function () {
        var d = req.result;
        if (!d.objectStoreNames.contains('routes')) d.createObjectStore('routes', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('outbox')) d.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true });
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
    dbPromise.catch(function () { dbPromise = null; });
    return dbPromise;
  }
  function tx(store, mode, fn) {
    return db().then(function (d) {
      return new Promise(function (resolve, reject) {
        var tr = d.transaction(store, mode);
        var st = tr.objectStore(store);
        var result;
        Promise.resolve(fn(st)).then(function (r) { result = r; });
        tr.oncomplete = function () { resolve(result); };
        tr.onerror = function () { reject(tr.error); };
        tr.onabort = function () { reject(tr.error); };
      });
    });
  }
  function reqP(r) { return new Promise(function (res, rej) { r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; }); }

  function getRoute() {
    return tx('routes', 'readonly', function (st) { return reqP(st.get(ROUTE_ID)); }).catch(function () { return null; });
  }

  // ── Toast ─────────────────────────────────────────────────────────────────
  var toastTimer = null;
  function toast(message, opts) {
    opts = opts || {};
    var box = document.getElementById('bqOfflineToast');
    if (!box) {
      box = document.createElement('div');
      box.id = 'bqOfflineToast';
      box.className = 'bq-offline-toast';
      box.setAttribute('role', 'status');
      box.setAttribute('aria-live', 'polite');
      document.body.appendChild(box);
    }
    box.textContent = '';
    var p = document.createElement('p');
    p.textContent = message;
    box.appendChild(p);
    if (opts.href && opts.linkText) {
      var a = document.createElement('a');
      a.href = opts.href; a.textContent = opts.linkText;
      box.appendChild(a);
    }
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'bq-offline-toast-close';
    close.setAttribute('aria-label', t('dialog.close', 'Cerrar'));
    close.textContent = String.fromCharCode(215); // «×»: símbolo, no texto que traducir (funciona sin Font Awesome, que sin señal no carga)
    close.addEventListener('click', function () { box.classList.remove('is-visible'); });
    box.appendChild(close);
    box.dataset.tone = opts.tone || 'info';
    // Un fotograma después, para que la animación arranque y el lector de pantalla lo anuncie.
    requestAnimationFrame(function () { box.classList.add('is-visible'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { box.classList.remove('is-visible'); }, opts.duration || 7000);
  }

  // ── Guardar la ruta ───────────────────────────────────────────────────────
  function abs(u) { try { return new URL(u, window.location.href).href; } catch (_) { return null; } }
  function sameOrigin(u) { try { return new URL(u).origin === window.location.origin; } catch (_) { return false; } }

  // Estilos, scripts, traducciones y fuentes propias que esta página ya cargó (con su ?v= exacto,
  // que es la llave con la que el navegador las vuelve a pedir).
  function loadedAssets() {
    var out = [];
    try {
      performance.getEntriesByType('resource').forEach(function (e) {
        if (!sameOrigin(e.name)) return;
        var u = new URL(e.name);
        if (ASSET_PATH.test(u.pathname) && !/\.(mp4|webm|mp3|m4a|ogg)$/i.test(u.pathname)) out.push(u.href);
      });
    } catch (_) { /* navegador sin Resource Timing */ }
    return out;
  }

  // Recomprime una foto del propio sitio a WebP (máx. 1280 px de ancho). Si no conviene, null.
  function toWebp(blob) {
    if (!('createImageBitmap' in window) || /image\/(webp|svg|gif)/.test(blob.type)) return Promise.resolve(null);
    return createImageBitmap(blob).then(function (bmp) {
      var scale = Math.min(1, 1280 / bmp.width);
      var w = Math.max(1, Math.round(bmp.width * scale)), h = Math.max(1, Math.round(bmp.height * scale));
      var canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(bmp, 0, 0, w, h);
      if (bmp.close) bmp.close();
      return new Promise(function (resolve) {
        canvas.toBlob(function (out) {
          // Solo si de verdad salió WebP y pesa menos que la original.
          resolve(out && out.type === 'image/webp' && out.size < blob.size ? out : null);
        }, 'image/webp', 0.72);
      });
    }).catch(function () { return null; });
  }

  // Respuesta «limpia» (sin redirección): el service worker no puede servir una respuesta
  // redirigida a una navegación, y Cloudflare redirige mi-viaje.html → /mi-viaje.
  function clean(res, body, type) {
    var headers = new Headers();
    headers.set('Content-Type', type || res.headers.get('Content-Type') || 'application/octet-stream');
    headers.set('X-Baqueano-Offline', new Date().toISOString());
    return new Response(body, { status: 200, statusText: 'OK', headers: headers });
  }

  function storeOne(cache, url, kind) {
    var opts = sameOrigin(url) ? { cache: 'no-store', credentials: 'same-origin' } : { mode: 'cors', credentials: 'omit' };
    return fetch(url, opts).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var type = res.headers.get('Content-Type') || '';
      return res.blob().then(function (blob) {
        if (kind === 'image' && sameOrigin(url)) {
          return toWebp(blob).then(function (webp) {
            var body = webp || blob;
            return cache.put(url, clean(res, body, webp ? 'image/webp' : type)).then(function () { return { bytes: body.size, webp: !!webp }; });
          });
        }
        var puts = [cache.put(url, clean(res, blob, type))];
        if (kind === 'page') {
          // La misma página bajo su dirección limpia y con .html.
          var u = new URL(url);
          var alt = /\.html$/.test(u.pathname) ? u.origin + u.pathname.replace(/\.html$/, '') : u.origin + u.pathname + '.html';
          puts.push(cache.put(alt, clean(res, blob, type)));
        }
        return Promise.all(puts).then(function () { return { bytes: blob.size, webp: false }; });
      });
    });
  }

  // Cola de trabajo con 4 descargas a la vez.
  function pool(items, size, worker, onEach) {
    var i = 0, done = 0, results = [];
    return new Promise(function (resolve) {
      if (!items.length) { resolve(results); return; }
      function next() {
        if (i >= items.length) return;
        var idx = i++;
        worker(items[idx]).then(function (r) { results[idx] = { ok: true, r: r }; }, function (e) { results[idx] = { ok: false, e: e }; })
          .then(function () {
            done++;
            if (onEach) onEach(done, items.length);
            if (done === items.length) resolve(results); else next();
          });
      }
      for (var k = 0; k < Math.min(size, items.length); k++) next();
    });
  }

  function mb(bytes) { return (bytes / 1048576).toLocaleString(lang(), { maximumFractionDigits: 1, minimumFractionDigits: 1 }); }

  var saving = false;
  function saveRoute(onProgress) {
    if (saving) return Promise.reject(new Error('busy'));
    if (!('caches' in window)) return Promise.reject(new Error('unsupported'));
    var stops = window.BaqueanoTrip ? window.BaqueanoTrip.list() : [];
    if (!stops.length) return Promise.reject(new Error('empty'));
    if (!navigator.onLine) return Promise.reject(new Error('offline'));
    saving = true;

    var jobs = [];
    var seen = {};
    function addJob(url, kind, isStop) {
      var u = abs(url);
      if (!u || !/^https?:/.test(u)) return;
      if (seen[u]) { if (isStop) seen[u].stop = true; return; }
      seen[u] = { url: u, kind: kind, stop: !!isStop };
      jobs.push(seen[u]);
    }
    addJob('/mi-viaje.html', 'page');
    addJob('/offline.html', 'page');
    loadedAssets().forEach(function (u) { addJob(u, /\.(png|jpe?g|webp|gif|svg|avif)(\?|$)/i.test(u) ? 'image' : 'asset'); });
    stops.forEach(function (s) { if (s.image) addJob(s.image, 'image', true); });

    return caches.open(ROUTE_CACHE).then(function (cache) {
      return pool(jobs, 4, function (job) { return storeOne(cache, job.url, job.kind); }, onProgress);
    }).then(function (results) {
      var bytes = 0, photos = 0, webp = 0, failed = 0;
      results.forEach(function (r, idx) {
        if (!r.ok) { failed++; return; }
        bytes += r.r.bytes;
        // «Fotos» = las de las paradas (no logos ni íconos de la página).
        if (jobs[idx].stop) photos++;
        if (r.r.webp) webp++;
      });
      var pageOk = results[0] && results[0].ok;
      if (!pageOk) throw new Error('page');
      var record = {
        id: ROUTE_ID,
        savedAt: new Date().toISOString(),
        stops: stops.map(function (s) {
          return { destId: s.destId, title: s.title, location: s.location, desc: s.desc, lat: s.lat, lng: s.lng, link: s.link, image: s.image ? abs(s.image) : '' };
        }),
        urls: jobs.filter(function (j, idx) { return results[idx].ok; }).map(function (j) { return j.url; }),
        bytes: bytes, photos: photos, webp: webp, failed: failed
      };
      // Se pide almacenamiento persistente antes de guardar el registro, para dejar constancia.
      var persist = navigator.storage && navigator.storage.persist ? navigator.storage.persist().catch(function () { return false; }) : Promise.resolve(false);
      return persist.then(function (persisted) {
        record.persisted = !!persisted;
        return tx('routes', 'readwrite', function (st) { st.put(record); }).then(function () { return record; });
      });
    }).then(function (record) {
      saving = false;
      return record;
    }, function (err) {
      saving = false;
      throw err;
    });
  }

  function removeRoute() {
    var p1 = ('caches' in window) ? caches.delete(ROUTE_CACHE) : Promise.resolve();
    var p2 = tx('routes', 'readwrite', function (st) { st.delete(ROUTE_ID); }).catch(function () { /* nada guardado */ });
    return Promise.all([p1, p2]);
  }

  // ── Panel en Mi viaje ─────────────────────────────────────────────────────
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleString(lang() === 'es' ? 'es-NI' : lang(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch (_) { return iso; }
  }
  function sameStops(record) {
    var now = (window.BaqueanoTrip ? window.BaqueanoTrip.list() : []).map(function (s) { return s.destId; }).join('|');
    var then = (record.stops || []).map(function (s) { return s.destId; }).join('|');
    return now === then;
  }

  function renderPanel() {
    var host = document.querySelector('#tabItinerario .route-action-btns');
    if (!host) return;
    var panel = document.getElementById('bqOfflinePanel');
    if (!panel) {
      panel = document.createElement('section');
      panel.id = 'bqOfflinePanel';
      panel.className = 'bq-offline-panel';
      panel.setAttribute('aria-labelledby', 'bqOfflineTitle');
      // Estructura con DOM (sin innerHTML): los textos los pone renderPanel con t().
      var mk = function (tag, cls, attrs) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
        return n;
      };
      var head = mk('div', 'bq-offline-head');
      head.appendChild(mk('i', 'fa-solid fa-signal', { 'aria-hidden': 'true' }));
      var headText = mk('div');
      headText.appendChild(mk('h3', '', { id: 'bqOfflineTitle' }));
      headText.appendChild(mk('p', 'bq-offline-desc'));
      head.appendChild(headText);
      var progress = mk('div', 'bq-offline-progress');
      progress.hidden = true;
      progress.appendChild(mk('div', 'bq-offline-bar'));
      var actions = mk('div', 'bq-offline-actions');
      actions.appendChild(mk('button', 'bq-offline-save', { type: 'button' }));
      var rm = mk('button', 'bq-offline-remove', { type: 'button' });
      rm.hidden = true;
      actions.appendChild(rm);
      panel.appendChild(head);
      panel.appendChild(mk('p', 'bq-offline-status', { id: 'bqOfflineStatus', role: 'status', 'aria-live': 'polite' }));
      panel.appendChild(progress);
      panel.appendChild(actions);
      host.parentNode.insertBefore(panel, host.nextSibling);
      panel.querySelector('.bq-offline-save').addEventListener('click', onSave);
      panel.querySelector('.bq-offline-remove').addEventListener('click', onRemove);
    }
    panel.querySelector('#bqOfflineTitle').textContent = t('offline.route.title', 'Tu ruta sin señal');
    panel.querySelector('.bq-offline-desc').textContent = t('offline.route.desc', 'Guardá en este teléfono tus paradas, sus fotos y esta página para abrirlas donde no hay internet.');
    var saveBtn = panel.querySelector('.bq-offline-save');
    var removeBtn = panel.querySelector('.bq-offline-remove');
    var status = panel.querySelector('#bqOfflineStatus');
    removeBtn.textContent = t('offline.route.remove', 'Quitar del teléfono');
    if (!('caches' in window) || !('indexedDB' in window)) {
      saveBtn.disabled = true;
      saveBtn.textContent = t('offline.route.save', 'Guardar mi ruta para ir sin señal');
      status.textContent = t('offline.route.unsupported', 'Este navegador no permite guardar la ruta sin conexión.');
      return;
    }
    getRoute().then(function (record) {
      var count = window.BaqueanoTrip ? window.BaqueanoTrip.list().length : 0;
      if (record) {
        removeBtn.hidden = false;
        var changed = !sameStops(record);
        saveBtn.textContent = changed ? t('offline.route.update', 'Actualizar la ruta guardada') : t('offline.route.resave', 'Volver a guardar');
        status.textContent = t('offline.route.saved', 'Guardada el {date} · Paradas: {stops} · Fotos: {photos} · {mb} MB', { date: fmtDate(record.savedAt), stops: record.stops.length, photos: record.photos, mb: mb(record.bytes) }) +
          (changed ? ' ' + t('offline.route.changed', 'Cambiaste tu viaje después de guardarla: actualizala antes de salir.') : '');
        panel.dataset.state = changed ? 'changed' : 'saved';
      } else {
        removeBtn.hidden = true;
        saveBtn.textContent = t('offline.route.save', 'Guardar mi ruta para ir sin señal');
        status.textContent = count ? t('offline.route.notSaved', 'Todavía no la guardaste en este teléfono.') : t('offline.route.empty', 'Agregá destinos a Mi viaje para poder guardarlos.');
        panel.dataset.state = 'empty';
      }
      saveBtn.disabled = !count;
    });
  }

  function onSave() {
    var panel = document.getElementById('bqOfflinePanel');
    var bar = panel.querySelector('.bq-offline-progress');
    var fill = panel.querySelector('.bq-offline-bar');
    var status = panel.querySelector('#bqOfflineStatus');
    var btn = panel.querySelector('.bq-offline-save');
    btn.disabled = true;
    bar.hidden = false;
    fill.style.width = '0%';
    status.textContent = t('offline.route.saving', 'Guardando…');
    saveRoute(function (done, total) {
      fill.style.width = Math.round(done / total * 100) + '%';
      status.textContent = t('offline.route.progress', 'Guardando {done} de {total}…', { done: done, total: total });
    }).then(function (record) {
      bar.hidden = true;
      renderPanel();
      toast(t('offline.route.done', 'Listo, ya podés abrir tu ruta sin señal en este teléfono. Paradas: {stops} · Fotos: {photos} · {mb} MB', { stops: record.stops.length, photos: record.photos, mb: mb(record.bytes) }), { tone: 'ok' });
      try { if (window.BaqueanoAnalytics) window.BaqueanoAnalytics.track('itinerary_generate', { source: 'offline_route', count: record.stops.length }); } catch (_) { /* opcional */ }
    }, function (err) {
      bar.hidden = true;
      btn.disabled = false;
      var msg = err && err.message === 'offline' ? t('offline.route.errOffline', 'Necesitás conexión para guardar la ruta. Hacelo antes de salir.')
        : err && err.message === 'empty' ? t('offline.route.empty', 'Agregá destinos a Mi viaje para poder guardarlos.')
        : err && err.message === 'busy' ? t('offline.route.saving', 'Guardando…')
        : t('offline.route.errSave', 'No se pudo guardar. Revisá el espacio libre del teléfono e intentá de nuevo.');
      status.textContent = msg;
      toast(msg, { tone: 'warn' });
    });
  }

  function onRemove() {
    removeRoute().then(function () {
      renderPanel();
      toast(t('offline.route.removed', 'Quitamos la ruta guardada de este teléfono. Tu viaje sigue en Mi viaje.'));
    });
  }

  // ── Página offline: muestra la ruta guardada ───────────────────────────────
  function renderOfflinePage() {
    var anchor = document.querySelector('.offline-wrapper .lead-text');
    if (!anchor || document.getElementById('bqOfflineSaved')) return;
    getRoute().then(function (record) {
      if (!record || !record.stops || !record.stops.length) return;
      var box = document.createElement('section');
      box.id = 'bqOfflineSaved';
      box.className = 'bq-offline-saved';
      box.setAttribute('aria-labelledby', 'bqOfflineSavedTitle');
      var h = document.createElement('h2');
      h.id = 'bqOfflineSavedTitle';
      h.textContent = t('offline.page.title', 'Tu ruta guardada');
      var p = document.createElement('p');
      p.textContent = t('offline.page.saved', 'Guardada el {date}', { date: fmtDate(record.savedAt) });
      var open = document.createElement('a');
      open.href = 'mi-viaje.html';
      open.className = 'bq-offline-open';
      open.textContent = t('offline.page.open', 'Abrir Mi viaje');
      var ol = document.createElement('ol');
      record.stops.forEach(function (s) {
        var li = document.createElement('li');
        var strong = document.createElement('strong');
        strong.textContent = s.title;
        li.appendChild(strong);
        if (s.location) li.appendChild(document.createTextNode(' · ' + s.location));
        if (s.lat != null && s.lng != null) {
          var c = document.createElement('span');
          c.className = 'bq-offline-coords';
          c.textContent = Number(s.lat).toFixed(5) + ', ' + Number(s.lng).toFixed(5);
          li.appendChild(c);
        }
        ol.appendChild(li);
      });
      box.appendChild(h); box.appendChild(p); box.appendChild(ol); box.appendChild(open);
      anchor.parentNode.insertBefore(box, anchor.nextSibling);
    });
  }

  // ── Cola de envíos pendientes ─────────────────────────────────────────────
  var hasBgSync = 'serviceWorker' in navigator && 'SyncManager' in window;

  function enqueue(url, body, headers) {
    return tx('outbox', 'readwrite', function (st) {
      st.add({ url: url, body: body, headers: headers, createdAt: Date.now() });
      return reqP(st.count()).then(function (n) {
        if (n <= OUTBOX_MAX) return;
        // Se descartan los más viejos.
        return reqP(st.getAllKeys()).then(function (keys) { keys.slice(0, n - OUTBOX_MAX).forEach(function (k) { st.delete(k); }); });
      });
    }).then(function () {
      if (hasBgSync) {
        return navigator.serviceWorker.ready.then(function (reg) { return reg.sync.register(SYNC_TAG); }).catch(function () { /* sin permiso: se envía desde la página */ });
      }
    }).catch(function () { /* sin IndexedDB: el registro se pierde, el contacto no */ });
  }

  // Envía a Supabase; sin red, lo deja en la cola.
  function send(url, body, headers) {
    if (!SEND_ALLOW.test(url)) return Promise.resolve(false);
    if (!navigator.onLine) return enqueue(url, body, headers).then(function () { return 'queued'; });
    return fetch(url, { method: 'POST', keepalive: true, headers: headers, body: JSON.stringify(body) })
      .then(function () { return true; }, function () { return enqueue(url, body, headers).then(function () { return 'queued'; }); });
  }

  var flushing = false;
  function flush() {
    // Con Background Sync manda el service worker; así no se envía dos veces.
    if (hasBgSync || flushing || !navigator.onLine) return Promise.resolve(0);
    flushing = true;
    var sentCount = 0;
    return tx('outbox', 'readonly', function (st) { return reqP(st.getAll()); }).then(function (items) {
      items = items || [];
      return items.reduce(function (chain, item) {
        return chain.then(function (stop) {
          if (stop) return true;
          if (Date.now() - item.createdAt > OUTBOX_TTL || !SEND_ALLOW.test(item.url)) return del(item.id).then(function () { return false; });
          return fetch(item.url, { method: 'POST', headers: item.headers, body: JSON.stringify(item.body) }).then(function (res) {
            // 2xx o error del servidor por datos (4xx): no se reintenta. 5xx: queda para después.
            if (res.status >= 500) return true;
            sentCount++;
            return del(item.id).then(function () { return false; });
          }, function () { return true; });
        });
      }, Promise.resolve(false));
    }).catch(function () { /* nada en cola */ }).then(function () { flushing = false; return sentCount; });
  }
  function del(id) { return tx('outbox', 'readwrite', function (st) { st.delete(id); }); }

  // ── Avisos de señal ───────────────────────────────────────────────────────
  window.addEventListener('offline', function () {
    getRoute().then(function (record) {
      if (record) toast(t('offline.toast.offRoute', 'Sin señal. Tu ruta guardada sigue disponible.'), { href: 'mi-viaje.html', linkText: t('offline.page.open', 'Abrir Mi viaje'), tone: 'warn', duration: 9000 });
      else toast(t('offline.toast.off', 'Sin señal. Las páginas que ya abriste se pueden seguir viendo.'), { tone: 'warn', duration: 9000 });
    });
  });
  window.addEventListener('online', function () {
    toast(t('offline.toast.on', 'Volviste a tener señal.'), { tone: 'ok', duration: 4000 });
    flush();
  });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') flush(); });

  function init() {
    renderPanel();
    renderOfflinePage();
    flush();
    // Mi viaje cambia cuando se agregan o quitan destinos: el panel avisa si hay que actualizar.
    window.addEventListener('storage', function (e) { if (e.key === 'baqueano_trip') renderPanel(); });
    document.addEventListener('click', function (e) {
      if (e.target && e.target.closest && e.target.closest('#tabItinerario button, #tabItinerario [role="button"]')) setTimeout(renderPanel, 400);
    });
    window.addEventListener('baqueano:languageChanged', renderPanel);
  }

  window.BaqueanoOffline = Object.freeze({ saveRoute: saveRoute, removeRoute: removeRoute, getRoute: getRoute, send: send, flush: flush, toast: toast });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
