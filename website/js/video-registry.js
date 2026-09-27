// ============================================================================
// BAQUEANO — REGISTRO AUDIOVISUAL FIJO Y GOBERNADO POR OPS CENTER
// ============================================================================
// 🎯 POR QUÉ (WHY / PROPÓSITO):
// - Garantizar que cada espacio audiovisual muestre siempre el video editorial
//   aprobado, sin rotaciones, fuentes aleatorias ni cambios por disponibilidad.
// - Permitir que únicamente una publicación explícita del Ops Center reemplace
//   el material visible mediante el documento app_config/site_videos.
//
// ⚙️ CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Un catálogo local inmutable ofrece videos MP4 y pósteres de respaldo.
// - Los elementos se vinculan mediante data-baqueano-video-slot.
// - Firestore puede reemplazar src/poster/título por slot usando onSnapshot;
//   si no existe configuración o falla la red, permanece el material local.
// - IntersectionObserver reproduce únicamente videos visibles; el modo de
//   movimiento reducido mantiene el póster y evita consumo innecesario.
//
// 📦 QUÉ (WHAT / ENTREGABLES):
// - Catálogo fijo, sincronización Ops, validación defensiva de URLs, control de
//   ciclo de vida y API window.BaqueanoVideos.
// ============================================================================
(function exposeBaqueanoVideos(window, document) {
  'use strict';

  const VIDEO_CATALOG = Object.freeze({
    indexHero: Object.freeze({
      label: 'Hero principal de Nicaragua',
      src: 'assets/videos/video%20nicaragua.mp4',
      poster: '',
      title: 'Paisajes aéreos y territorio vivo de Nicaragua'
    }),
    destinationsFeature: Object.freeze({
      label: 'Destinos destacados',
      src: 'assets/videos/destinos.mp4',
      poster: 'assets/images/destinos/cerro_negro.jpg',
      title: 'Destinos naturales y aventura en Nicaragua'
    }),
    cultureMusic: Object.freeze({
      label: 'Cultura y patrimonio sonoro',
      src: 'assets/videos/video.mp4',
      poster: 'assets/images/destinos/Calle%20La%20Calzada%20%26%20Zona%20Bohemia.jpg',
      title: 'Música, danza e identidad cultural nicaragüense'
    }),
    cultureGastronomy: Object.freeze({
      label: 'Gastronomía ancestral',
      src: 'assets/videos/gastronomia.mp4',
      poster: 'assets/images/comida/nacatamal.jpg',
      title: 'Fogón, maíz y gastronomía ancestral'
    }),
    cultureHistory: Object.freeze({
      label: 'Historia y patrimonio',
      src: 'assets/videos/historia.mp4',
      poster: 'assets/images/destinos/isletas_de_granada.jpg',
      title: 'Historia, arquitectura y memoria viva de Nicaragua'
    })
  });

  const state = {
    initialized: false,
    observer: null,
    unsubscribe: null,
    config: null
  };

  function safeMediaUrl(value, fallback) {
    const candidate = String(value || '').trim();
    if (!candidate) return fallback;
    if (/^assets\/(?:videos|images)\//i.test(candidate)) return candidate;
    try {
      const parsed = new URL(candidate, window.location.href);
      if (parsed.protocol === 'https:' || (parsed.protocol === 'http:' && /^(localhost|127\.0\.0\.1)$/.test(parsed.hostname))) {
        return parsed.href;
      }
    } catch (_) {}
    return fallback;
  }

  function resolveSlot(slotName) {
    const fallback = VIDEO_CATALOG[slotName];
    if (!fallback) return null;
    const published = state.config?.slots?.[slotName] || {};
    return {
      ...fallback,
      src: safeMediaUrl(published.src, fallback.src),
      poster: safeMediaUrl(published.poster, fallback.poster),
      title: String(published.title || fallback.title).trim().slice(0, 180),
      source: published.src ? 'ops_center' : 'local_catalog'
    };
  }

  function applySlot(video) {
    const slotName = video.dataset.baqueanoVideoSlot;
    const media = resolveSlot(slotName);
    if (!media) return;

    const currentSrc = video.getAttribute('src') || '';
    const sourceChanged = currentSrc !== media.src;
    video.querySelectorAll('source').forEach((source) => source.remove());
    video.setAttribute('src', media.src);
    if (media.poster) {
      video.setAttribute('poster', media.poster);
    } else {
      video.removeAttribute('poster');
    }
    video.setAttribute('aria-label', media.title);
    video.dataset.videoSource = media.source;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = slotName === 'indexHero' ? 'auto' : 'metadata';
    video.disablePictureInPicture = true;
    video.disableRemotePlayback = true;
    if (sourceChanged && typeof video.load === 'function') video.load();
  }

  function observePlayback(video) {
    if (!state.observer) return;
    state.observer.observe(video);
  }

  function applyAll() {
    document.querySelectorAll('video[data-baqueano-video-slot]').forEach((video) => {
      applySlot(video);
      observePlayback(video);
    });
  }

  function createPlaybackObserver() {
    if (state.observer || !('IntersectionObserver' in window)) return;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
    state.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (!entry.isIntersecting || reducedMotion || document.hidden) {
          video.pause();
          return;
        }
        document.querySelectorAll('video[data-baqueano-video-slot]').forEach((otherVideo) => {
          if (otherVideo !== video) otherVideo.pause();
        });
        video.play().catch(() => {});
      });
    }, { rootMargin: '160px 0px', threshold: 0.18 });
  }

  function connectOpsConfiguration() {
    if (!window.firebase?.firestore) return;
    try {
      const docRef = window.firebase.firestore().collection('app_config').doc('site_videos');
      state.unsubscribe = docRef.onSnapshot((snapshot) => {
        if (!snapshot.exists) return;
        const data = snapshot.data() || {};
        if (data.status && data.status !== 'published') return;
        state.config = data;
        applyAll();
      }, (error) => console.warn('[BaqueanoVideos] Configuración remota no disponible:', error.message));
    } catch (error) {
      console.warn('[BaqueanoVideos] Se conserva el catálogo audiovisual local:', error.message);
    }
  }

  function init() {
    if (state.initialized) return;
    state.initialized = true;
    createPlaybackObserver();
    applyAll();
    connectOpsConfiguration();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) document.querySelectorAll('video[data-baqueano-video-slot]').forEach((video) => video.pause());
      else applyAll();
    });
  }

  window.BaqueanoVideos = Object.freeze({
    catalog: VIDEO_CATALOG,
    init,
    applyAll,
    getResolvedSlot: resolveSlot
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})(window, document);
