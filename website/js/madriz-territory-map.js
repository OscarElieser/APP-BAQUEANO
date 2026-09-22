// ============================================================================
// BAQUEANO — MAPA TERRITORIAL DINÁMICO DE MADRIZ
// ============================================================================
// 🎯 POR QUÉ: conectar la guía de Madriz con lugares reales sin inventar
// coordenadas, autores de reseñas ni valoraciones para llenar el mapa.
// ⚙️ CÓMO: MapLibre renderiza la cartografía; Firestore aporta únicamente
// documentos publicados de tourismPlaces y reviews calcula la media visible.
// 📦 QUÉ: mapa oscuro, marcadores accesibles, fichas inferiores, enfoque,
// pantalla completa, estados vacíos y limpieza al cambiar de departamento.
// ============================================================================

(function (window, document) {
  'use strict';

  let departmentId = 'madriz';
  let elementPrefix = 'madriz';
  const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
  let defaultCenter = [-86.6, 13.45];
  let defaultZoom = 8.45;
  let map = null;
  let markers = [];
  let generation = 0;

  function byId(id) {
    if (elementPrefix === 'madriz') return document.getElementById(id);
    const aliases = {
      madrizMapStatus: `${elementPrefix}MapStatus`,
      madrizMap: `${elementPrefix}Map`,
      madrizMapExpand: `${elementPrefix}MapExpand`,
      madrizMapShell: `${elementPrefix}MapShell`,
      mapPlacesCarousel: `${elementPrefix}MapPlacesCarousel`
    };
    return document.getElementById(aliases[id] || id);
  }

  function asNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function validCoordinates(place) {
    const latitude = asNumber(place.latitude);
    const longitude = asNumber(place.longitude);
    return latitude !== null && longitude !== null
      && latitude >= -90 && latitude <= 90
      && longitude >= -180 && longitude <= 180;
  }

  function safeImage(value) {
    const source = String(value || '').trim();
    if (/^assets\/images\//i.test(source) || /^https:\/\//i.test(source)) return source;
    return 'assets/images/logo.png';
  }

  function setStatus(message, mode) {
    const status = byId('madrizMapStatus');
    if (!status) return;
    status.className = `madriz-map-status ${mode ? `is-${mode}` : ''}`.trim();
    status.replaceChildren();
    const icon = document.createElement('i');
    icon.className = mode === 'loading'
      ? 'fa-solid fa-circle-notch fa-spin'
      : mode === 'error'
        ? 'fa-solid fa-triangle-exclamation'
        : 'fa-solid fa-circle-info';
    const text = document.createTextNode(` ${message}`);
    status.append(icon, text);
  }

  async function waitForDependencies(runId) {
    for (let attempt = 0; attempt < 40; attempt += 1) {
      if (runId !== generation) return false;
      if (window.maplibregl && window.firebase?.firestore && window.BaqueanoFirebase?.isReady) return true;
      await new Promise((resolve) => window.setTimeout(resolve, 150));
    }
    return false;
  }

  async function loadReviewRating(db, placeId) {
    try {
      const snapshot = await db.collection('reviews')
        .where('placeId', '==', placeId)
        .where('published', '==', true)
        .get();
      const values = [];
      snapshot.forEach((doc) => {
        const review = doc.data() || {};
        const rating = asNumber(review.rating);
        if (rating !== null && rating >= 1 && rating <= 5) values.push(rating);
      });
      if (!values.length) return null;
      return {
        average: values.reduce((sum, value) => sum + value, 0) / values.length,
        count: values.length
      };
    } catch (error) {
      console.warn('[Mapa Madriz] No fue posible consultar las reseñas:', error.message);
      return null;
    }
  }

  async function loadPlaces() {
    const db = window.firebase.firestore();
    const snapshot = await db.collection('tourismPlaces')
      .where('departmentId', '==', departmentId)
      .where('published', '==', true)
      .get();
    const places = [];
    snapshot.forEach((doc) => {
      const data = doc.data() || {};
      if (validCoordinates(data)) places.push({ id: doc.id, ...data });
    });
    await Promise.all(places.map(async (place) => {
      place.reviewRating = await loadReviewRating(db, place.id);
    }));
    return places;
  }

  function createPopup(place) {
    const root = document.createElement('article');
    root.className = 'madriz-map-popup';

    const image = document.createElement('img');
    image.src = safeImage(place.image);
    image.alt = '';
    image.loading = 'lazy';

    const content = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = String(place.name || 'Lugar de Madriz');
    const description = document.createElement('p');
    description.textContent = String(place.shortDescription || place.categoryLabel || 'Lugar publicado en el catálogo territorial.');
    content.append(title, description);

    if (place.verified === true) {
      const verified = document.createElement('span');
      verified.className = 'madriz-map-verified';
      verified.innerHTML = '<i class="fa-solid fa-shield-check"></i> BAQUEANO Verificado';
      content.append(verified);
    }

    root.append(image, content);
    return root;
  }

  function ratingLabel(place) {
    if (!place.reviewRating) return '';
    return `★ ${place.reviewRating.average.toFixed(1)}`;
  }

  function focusPlace(place, marker, card) {
    if (!map) return;
    map.flyTo({
      center: [Number(place.longitude), Number(place.latitude)],
      zoom: 13,
      essential: true
    });
    marker.togglePopup();
    document.querySelectorAll('.map-place-card.is-active').forEach((item) => item.classList.remove('is-active'));
    card?.classList.add('is-active');
    card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  function addPlace(place, bounds) {
    const markerButton = document.createElement('button');
    markerButton.type = 'button';
    markerButton.className = place.reviewRating ? 'baqueano-rating-marker' : 'baqueano-map-marker';
    markerButton.setAttribute('aria-label', `Mostrar ${place.name || 'lugar de Madriz'}`);
    markerButton.textContent = place.reviewRating ? ratingLabel(place) : '';
    if (!place.reviewRating) markerButton.innerHTML = '<i class="fa-solid fa-location-dot"></i>';

    const popup = new window.maplibregl.Popup({ offset: 24, closeButton: false })
      .setDOMContent(createPopup(place));
    const marker = new window.maplibregl.Marker({ element: markerButton, anchor: 'bottom' })
      .setLngLat([Number(place.longitude), Number(place.latitude)])
      .setPopup(popup)
      .addTo(map);
    markers.push(marker);
    bounds.extend([Number(place.longitude), Number(place.latitude)]);

    const carousel = byId('mapPlacesCarousel');
    if (!carousel) return;
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'map-place-card';
    card.dataset.placeId = place.id;

    const image = document.createElement('img');
    image.src = safeImage(place.image);
    image.alt = '';
    image.loading = 'lazy';
    const copy = document.createElement('span');
    copy.className = 'map-place-copy';
    const name = document.createElement('strong');
    name.textContent = String(place.name || 'Lugar de Madriz');
    const meta = document.createElement('span');
    const parts = [];
    if (place.reviewRating) parts.push(`${ratingLabel(place)} (${place.reviewRating.count})`);
    if (place.categoryLabel || place.category) parts.push(String(place.categoryLabel || place.category).replaceAll('_', ' '));
    meta.textContent = parts.join(' · ') || String(place.municipality || 'Madriz');
    copy.append(name, meta);
    card.append(image, copy);
    card.addEventListener('click', () => focusPlace(place, marker, card));
    markerButton.addEventListener('click', () => {
      document.querySelectorAll('.map-place-card.is-active').forEach((item) => item.classList.remove('is-active'));
      card.classList.add('is-active');
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
    carousel.append(card);
  }

  function bindExpandButton() {
    const button = byId('madrizMapExpand');
    const shell = byId('madrizMapShell');
    if (!button || !shell) return;
    button.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await shell.requestFullscreen();
      } catch (error) {
        shell.classList.toggle('is-expanded');
      }
      window.setTimeout(() => map?.resize(), 120);
    });
    document.addEventListener('fullscreenchange', () => window.setTimeout(() => map?.resize(), 120), { once: true });
  }

  async function mount(options) {
    unmount();
    const config = options || {};
    departmentId = String(config.departmentId || 'madriz');
    elementPrefix = String(config.elementPrefix || departmentId);
    defaultCenter = Array.isArray(config.center) ? config.center : [-86.6, 13.45];
    defaultZoom = Number.isFinite(config.zoom) ? config.zoom : 8.45;
    const runId = generation;
    const container = byId('madrizMap');
    if (!container) return;
    setStatus('Consultando lugares publicados…', 'loading');
    const ready = await waitForDependencies(runId);
    if (!ready || runId !== generation || !byId('madrizMap')) {
      setStatus('El mapa territorial no pudo inicializarse. Comprueba tu conexión.', 'error');
      return;
    }

    try {
      map = new window.maplibregl.Map({
        container: container,
        style: MAP_STYLE,
        center: defaultCenter,
        zoom: defaultZoom,
        maxZoom: 17,
        cooperativeGestures: true,
        attributionControl: true
      });
      map.addControl(new window.maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
      bindExpandButton();

      const places = await loadPlaces();
      if (runId !== generation || !map) return;
      const carousel = byId('mapPlacesCarousel');
      if (carousel) carousel.replaceChildren();
      if (!places.length) {
        setStatus('Aún no hay lugares de Madriz publicados con coordenadas verificadas.', 'empty');
        return;
      }

      const bounds = new window.maplibregl.LngLatBounds();
      places.forEach((place) => addPlace(place, bounds));
      map.fitBounds(bounds, {
        padding: { top: 90, right: 70, bottom: 190, left: 70 },
        maxZoom: 12,
        duration: 900
      });
      setStatus(`${places.length} ${places.length === 1 ? 'lugar publicado' : 'lugares publicados'} con ubicación verificable.`, 'ready');
    } catch (error) {
      console.error('[Mapa Madriz]', error);
      setStatus('No fue posible cargar el catálogo territorial en este momento.', 'error');
    }
  }

  function unmount() {
    generation += 1;
    markers.forEach((marker) => marker.remove());
    markers = [];
    if (map) {
      map.remove();
      map = null;
    }
  }

  window.BaqueanoMadrizMap = { mount, unmount };
  window.BaqueanoChinandegaMap = {
    mount: () => mount({
      departmentId: 'chinandega',
      elementPrefix: 'chinandega',
      center: [-87.13, 12.63],
      zoom: 8.25
    }),
    unmount
  };
})(window, document);
