// ============================================================================
// 🧭 BAQUEANO — CLIENTE DE LA COMUNIDAD (community-api.js)
// ============================================================================
// 🎯 POR QUÉ:
// - Testimonios, comentarios, reacciones, denuncias y multimedia se guardan
//   en Supabase a través de la Edge Function `baqueano-community`, que
//   verifica la sesión de Firebase. Este archivo es el único punto de acceso
//   del sitio a esa función (testimonios.html, fichas de destino, Ops Center).
//
// ⚙️ CÓMO:
// - call(action, datos): POST con el ID token de Firebase si hay sesión.
// - Fotos: se redimensionan y convierten a WebP en el navegador (máx. 1600
//   px, miniatura de 480 px) antes de subir: menos datos y almacenamiento.
// - Videos: se leen duración, tamaño y un fotograma como portada (WebP); el
//   video nunca se reproduce solo en el feed.
// - Subida con URL firmada (una por archivo) y luego "attach_media", donde el
//   servidor comprueba el tipo real del archivo.
//
// 📦 QUÉ: window.BaqueanoCommunity = { call, available, compressImage,
//   videoInfo, uploadMedia, CommunityError, limits }.
// ============================================================================
(function (window) {
  'use strict';
  if (window.BaqueanoCommunity) return;

  var ENDPOINT = 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-community';
  var LIMITS = Object.freeze({ photos: 6, videos: 1, imageBytes: 8 * 1048576, videoBytes: 40 * 1048576, videoSeconds: 90, imageMax: 1600, thumbMax: 480 });

  function CommunityError(message, status) {
    this.name = 'CommunityError';
    this.message = message;
    this.status = status || 0;
  }
  CommunityError.prototype = Object.create(Error.prototype);

  function currentUser() {
    try { return window.firebase && window.firebase.auth ? window.firebase.auth().currentUser : null; } catch (_) { return null; }
  }

  function call(action, payload) {
    var user = currentUser();
    var tokenPromise = user && typeof user.getIdToken === 'function' ? user.getIdToken().catch(function () { return null; }) : Promise.resolve(null);
    return tokenPromise.then(function (token) {
      var headers = { 'content-type': 'application/json' };
      if (token) headers['x-firebase-token'] = token;
      return fetch(ENDPOINT, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(Object.assign({ action: action }, payload || {}))
      }).catch(function () {
        throw new CommunityError('Sin conexión con la comunidad BAQUEANO. Revisá tu internet.', 0);
      });
    }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (data) {
        if (res.ok && data && data.ok !== false) return data;
        var message = data && data.error ? data.error : (res.status === 404 ? 'La comunidad de viajeros todavía se está habilitando.' : 'No se pudo completar la acción.');
        throw new CommunityError(message, res.status);
      });
    });
  }

  // ¿Está desplegado el servicio? (una lectura pública mínima)
  var availability = null;
  function available() {
    if (!availability) {
      availability = call('list', { limit: 1 }).then(function () { return true; }, function (error) {
        availability = null;
        return !(error.status === 404 || error.status === 0 || error.status >= 500) ? true : false;
      });
    }
    return availability;
  }

  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () { resolve({ img: img, url: url }); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new CommunityError('No pudimos leer esa foto.', 400)); };
      img.src = url;
    });
  }

  function toWebp(source, width, height, maxSide, quality) {
    var scale = Math.min(1, maxSide / Math.max(width, height));
    var canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (blob && blob.type === 'image/webp') resolve({ blob: blob, width: canvas.width, height: canvas.height });
        else reject(new CommunityError('Tu navegador no pudo optimizar la imagen.', 400));
      }, 'image/webp', quality);
    });
  }

  // Foto → WebP optimizado + miniatura (el original no se sube).
  function compressImage(file) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return Promise.reject(new CommunityError('Usá fotos JPG, PNG o WebP.', 400));
    if (file.size > 25 * 1048576) return Promise.reject(new CommunityError('La foto es demasiado pesada (máx. 25 MB antes de optimizar).', 400));
    return loadImage(file).then(function (loaded) {
      var w = loaded.img.naturalWidth;
      var h = loaded.img.naturalHeight;
      return Promise.all([toWebp(loaded.img, w, h, LIMITS.imageMax, 0.82), toWebp(loaded.img, w, h, LIMITS.thumbMax, 0.72)]).then(function (out) {
        URL.revokeObjectURL(loaded.url);
        if (out[0].blob.size > LIMITS.imageBytes) throw new CommunityError('La foto sigue siendo muy pesada después de optimizarla.', 400);
        return { kind: 'image', blob: out[0].blob, thumb: out[1].blob, width: out[0].width, height: out[0].height, mime: 'image/webp' };
      });
    });
  }

  // Video: valida tipo, tamaño y duración; portada WebP del primer segundo.
  function videoInfo(file) {
    if (!/^video\/(mp4|webm)$/.test(file.type)) return Promise.reject(new CommunityError('Usá videos MP4 o WebM.', 400));
    if (file.size > LIMITS.videoBytes) return Promise.reject(new CommunityError('El video supera 40 MB. Recortalo o comprimilo antes de subirlo.', 400));
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      video.src = url;
      var done = false;
      var fail = function (message) { if (done) return; done = true; URL.revokeObjectURL(url); reject(new CommunityError(message, 400)); };
      video.onerror = function () { fail('No pudimos leer ese video.'); };
      video.onloadedmetadata = function () {
        if (!(video.duration > 0) || video.duration > LIMITS.videoSeconds) { fail('El video debe durar como máximo ' + LIMITS.videoSeconds + ' segundos.'); return; }
        video.currentTime = Math.min(1, video.duration / 2);
      };
      video.onseeked = function () {
        if (done) return;
        toWebp(video, video.videoWidth || 640, video.videoHeight || 360, LIMITS.thumbMax, 0.72).then(function (poster) {
          done = true;
          URL.revokeObjectURL(url);
          resolve({ kind: 'video', blob: file, thumb: poster.blob, width: video.videoWidth || null, height: video.videoHeight || null, duration: Math.round(video.duration * 100) / 100, mime: file.type });
        }, function () { fail('No pudimos generar la portada del video.'); });
      };
    });
  }

  function putSigned(url, blob, contentType) {
    return fetch(url, { method: 'PUT', headers: { 'content-type': contentType, 'x-upsert': 'false' }, body: blob }).then(function (res) {
      if (!res.ok) throw new CommunityError('No se pudo subir el archivo.', res.status);
    });
  }

  // Sube un archivo ya preparado (compressImage/videoInfo) a una experiencia.
  function uploadMedia(testimonialId, prepared, position, onProgress) {
    return call('upload_url', { testimonial_id: testimonialId, kind: prepared.kind, mime: prepared.mime, size: prepared.blob.size })
      .then(function (slot) {
        if (onProgress) onProgress('subiendo');
        return putSigned(slot.upload_url, prepared.blob, prepared.mime)
          .then(function () { return prepared.thumb ? putSigned(slot.thumb_upload_url, prepared.thumb, 'image/webp').catch(function () { return null; }) : null; })
          .then(function (thumbResult) {
            if (onProgress) onProgress('verificando');
            return call('attach_media', {
              testimonial_id: testimonialId, path: slot.path, thumb_path: prepared.thumb ? slot.thumb_path : null,
              kind: prepared.kind, width: prepared.width, height: prepared.height, duration: prepared.duration || null, position: position
            });
          });
      });
  }

  window.BaqueanoCommunity = Object.freeze({
    call: call, available: available, compressImage: compressImage, videoInfo: videoInfo,
    uploadMedia: uploadMedia, CommunityError: CommunityError, limits: LIMITS, endpoint: ENDPOINT
  });
})(window);
