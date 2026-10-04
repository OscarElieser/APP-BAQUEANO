// ============================================================================
// BAQUEANO — MAPA TERRITORIAL DINÁMICO DE NICARAGUA
// ============================================================================
// 🎯 POR QUÉ: conectar las 17 guías territoriales con ubicaciones reales sin
// inventar coordenadas, autores de reseñas ni valoraciones para llenar el mapa.
// ⚙️ CÓMO: MapLibre renderiza la cartografía; Firestore aporta únicamente
// documentos publicados de tourismPlaces y reviews calcula la media visible.
// 📦 QUÉ: mapa reutilizable, centro territorial exacto, marcadores accesibles,
// fichas inferiores, pantalla completa y limpieza al cambiar de departamento.
// 🗺️ ACOTADO POR TERRITORIO (2026-10-04): cada mapa muestra SOLO su
// departamento o región: contorno oficial (data/nicaragua-departments.geojson,
// geoBoundaries ADM1, CC BY 4.0), resto del país atenuado, vista limitada al
// territorio y pines aceptados únicamente si caen dentro del contorno (la
// geocodificación se restringe al rectángulo del territorio). Antes un lugar
// podía ubicarse en otro departamento y mezclar información entre territorios.
// ============================================================================

(function (window, document) {
  'use strict';

  let departmentId = 'madriz';
  let elementPrefix = 'madriz';
  let territoryName = 'Madriz';
  const MAP_STYLE = {
    version: 8,
    sources: {
      arcgisWorld: {
        type: 'raster',
        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        attribution: 'Tiles &copy; Esri'
      }
    },
    layers: [{ id: 'arcgis-world', type: 'raster', source: 'arcgisWorld' }]
  };
  let defaultCenter = [-86.6, 13.45];
  let defaultZoom = 8.45;
  let map = null;
  let markers = [];
  let generation = 0;
  let catalogPlaces = [];
  const GEOCODE_CACHE_KEY = 'baqueano-territory-geocodes-v2';
  const BOUNDARIES_URL = 'data/nicaragua-departments.geojson?v=20261004-1';
  let boundariesPromise = null;
  // Coordenadas calculadas una vez en GitHub Actions (scripts/geocode-territory-places.mjs).
  const PRECOMPUTED_URL = 'data/territory-places.json';
  let precomputedPromise = null;
  let territoryFeature = null;
  const NICARAGUA_BOUNDS = { south: 10.7, north: 15.1, west: -88.1, east: -82.5 };

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

  function readGeocodeCache() {
    try {
      const value = JSON.parse(window.localStorage.getItem(GEOCODE_CACHE_KEY) || '{}');
      return value && typeof value === 'object' ? value : {};
    } catch (error) {
      return {};
    }
  }

  function writeGeocodeCache(cache) {
    try {
      window.localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      // El mapa conserva su función principal si el navegador bloquea el almacenamiento.
    }
  }

  function insideNicaragua(latitude, longitude) {
    return latitude >= NICARAGUA_BOUNDS.south && latitude <= NICARAGUA_BOUNDS.north
      && longitude >= NICARAGUA_BOUNDS.west && longitude <= NICARAGUA_BOUNDS.east;
  }

  function loadBoundaries() {
    if (!boundariesPromise) {
      boundariesPromise = fetch(BOUNDARIES_URL, { credentials: 'same-origin' })
        .then((response) => (response.ok ? response.json() : null))
        .catch(() => null);
    }
    return boundariesPromise;
  }

  function loadPrecomputed() {
    if (!precomputedPromise) {
      precomputedPromise = fetch(PRECOMPUTED_URL, { credentials: 'same-origin', cache: 'no-cache' })
        .then((response) => (response.ok ? response.json() : null))
        .catch(() => null);
    }
    return precomputedPromise;
  }

  function pointInRing(point, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if ((yi > point[1]) !== (yj > point[1]) && point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }

  function polygonsOf(feature) {
    const geometry = feature && feature.geometry;
    if (!geometry) return [];
    return geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : [];
  }

  // Sin contorno disponible se conserva el filtro nacional (degradación segura).
  function insideTerritory(latitude, longitude) {
    if (!territoryFeature) return insideNicaragua(latitude, longitude);
    const point = [longitude, latitude];
    return polygonsOf(territoryFeature).some((rings) => pointInRing(point, rings[0]) && !rings.slice(1).some((hole) => pointInRing(point, hole)));
  }

  function territoryBbox() {
    const bbox = territoryFeature && territoryFeature.properties && territoryFeature.properties.bbox;
    return Array.isArray(bbox) && bbox.length === 4 ? bbox : null;
  }

  // Máscara: todo el mundo menos el territorio (los anillos exteriores son huecos).
  function maskGeometry() {
    const world = [[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]];
    const holes = polygonsOf(territoryFeature).map((rings) => rings[0]);
    return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [world].concat(holes) } };
  }

  function waitForStyle() {
    return new Promise((resolve) => {
      if (!map) return resolve(false);
      if (map.isStyleLoaded && map.isStyleLoaded()) return resolve(true);
      const timer = window.setTimeout(() => resolve(Boolean(map)), 6000);
      map.once('load', () => { window.clearTimeout(timer); resolve(true); });
    });
  }

  function drawTerritory() {
    if (!map || !territoryFeature) return;
    try {
      map.addSource('bq-territory', { type: 'geojson', data: territoryFeature });
      map.addSource('bq-territory-mask', { type: 'geojson', data: maskGeometry() });
      map.addLayer({ id: 'bq-territory-mask', type: 'fill', source: 'bq-territory-mask', paint: { 'fill-color': '#0F172A', 'fill-opacity': 0.55 } });
      map.addLayer({ id: 'bq-territory-fill', type: 'fill', source: 'bq-territory', paint: { 'fill-color': '#165D6F', 'fill-opacity': 0.08 } });
      map.addLayer({ id: 'bq-territory-line', type: 'line', source: 'bq-territory', paint: { 'line-color': '#F65E01', 'line-width': 3 } });
    } catch (error) {
      console.warn(`[Mapa ${territoryName}] No fue posible dibujar el contorno:`, error.message);
    }
    const bbox = territoryBbox();
    if (!bbox) return;
    const pad = 0.35;
    map.setMaxBounds([[bbox[0] - pad, bbox[1] - pad], [bbox[2] + pad, bbox[3] + pad]]);
    map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], { padding: 40, duration: 0 });
  }

  function geocodeCacheId(place) {
    return `${departmentId}:${String(place.name || '').trim().toLocaleLowerCase('es-NI')}`;
  }

  function geocodeSearchName(value) {
    return String(value || '')
      .replace(/\s*\([^)]*\)\s*/g, ' ')
      .replace(/^(reserva silvestre|reserva natural|monumento nacional)\s+/i, '')
      .replace(/^museo nacional\s+/i, 'Museo ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async function geocodeCatalogPlace(place, runId, cache) {
    const cacheId = geocodeCacheId(place);
    const cached = cache[cacheId];
    if (cached && validCoordinates(cached) && insideTerritory(Number(cached.latitude), Number(cached.longitude))) return { ...place, ...cached };

    const query = [geocodeSearchName(place.name), territoryName, 'Nicaragua'].filter(Boolean).join(', ');
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('limit', '1');
    url.searchParams.set('countrycodes', 'ni');
    url.searchParams.set('accept-language', 'es');
    const bbox = territoryBbox();
    if (bbox) {
      url.searchParams.set('viewbox', bbox.join(','));
      url.searchParams.set('bounded', '1');
    }

    try {
      const response = await fetch(url.toString(), {
        headers: { Accept: 'application/json' },
        referrerPolicy: 'strict-origin-when-cross-origin'
      });
      if (!response.ok || runId !== generation) return null;
      const results = await response.json();
      const match = Array.isArray(results) ? results[0] : null;
      const latitude = asNumber(match?.lat);
      const longitude = asNumber(match?.lon);
      // Solo se acepta un punto dentro del contorno del territorio activo.
      if (latitude === null || longitude === null || !insideTerritory(latitude, longitude)) return null;
      cache[cacheId] = { latitude, longitude, geocodedAt: Date.now() };
      writeGeocodeCache(cache);
      return { ...place, latitude, longitude };
    } catch (error) {
      console.warn(`[Mapa ${territoryName}] No fue posible ubicar ${place.name}:`, error.message);
      return null;
    }
  }

  async function loadCatalogPlaces(runId, onPlace) {
    const cache = readGeocodeCache();
    const precomputed = await loadPrecomputed();
    const known = new Map();
    const list = precomputed && precomputed.territories && Array.isArray(precomputed.territories[departmentId])
      ? precomputed.territories[departmentId] : [];
    list.forEach((entry) => {
      const lat = asNumber(entry.lat);
      const lng = asNumber(entry.lng);
      if (lat !== null && lng !== null && insideTerritory(lat, lng)) known.set(String(entry.name), { latitude: lat, longitude: lng });
    });
    let resolved = 0;
    for (let index = 0; index < catalogPlaces.length; index += 1) {
      if (runId !== generation) break;
      const place = catalogPlaces[index] || {};
      const fixed = known.get(String(place.name));
      // Coordenada precalculada (validada dentro del contorno): sin red ni espera.
      const cached = fixed || cache[geocodeCacheId(place)];
      const result = fixed ? { ...place, ...fixed } : await geocodeCatalogPlace(place, runId, cache);
      if (result && runId === generation) {
        resolved += 1;
        onPlace({
          id: `catalog-${departmentId}-${index}`,
          name: String(result.name || `Lugar de ${territoryName}`),
          shortDescription: String(result.type || 'Lugar mencionado en la guía territorial.'),
          categoryLabel: String(result.type || 'Atractivo territorial'),
          municipality: territoryName,
          image: result.image || '',
          latitude: result.latitude,
          longitude: result.longitude,
          verified: false,
          catalogReference: true
        });
      }
      setStatus(`Ubicando lugares de ${territoryName}: ${index + 1} de ${catalogPlaces.length}…`, 'loading');
      if (!cached && index < catalogPlaces.length - 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 1050));
      }
    }
    return resolved;
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
    if (window.maplibregl) return true;
    if (!document.getElementById('bq-maplibre-script')) {
      const script = document.createElement('script');
      script.id = 'bq-maplibre-script';
      script.src = 'https://cdn.jsdelivr.net/npm/maplibre-gl@5.7.1/dist/maplibre-gl.js';
      script.defer = true;
      document.body.appendChild(script);
    }
    for (let attempt = 0; attempt < 50; attempt += 1) {
      if (runId !== generation) return false;
      if (window.maplibregl) return true;
      await new Promise((resolve) => window.setTimeout(resolve, 120));
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

  async function waitForFirestore(runId) {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      if (runId !== generation) return false;
      if (window.firebase?.firestore && window.BaqueanoFirebase?.isReady) return true;
      await new Promise((resolve) => window.setTimeout(resolve, 150));
    }
    return false;
  }

  async function loadPlaces(runId) {
    const firestoreReady = await waitForFirestore(runId);
    if (!firestoreReady || runId !== generation) return [];
    const db = window.firebase.firestore();
    const snapshot = await db.collection('tourismPlaces')
      .where('departmentId', '==', departmentId)
      .where('published', '==', true)
      .get();
    const places = [];
    snapshot.forEach((doc) => {
      const data = doc.data() || {};
      if (validCoordinates(data) && insideTerritory(Number(data.latitude), Number(data.longitude))) places.push({ id: doc.id, ...data });
    });
    // Los pines no deben esperar una consulta adicional por cada reseña.
    // Las valoraciones son complementarias; la ubicación aparece primero.
    return places;
  }

  async function loadPlacesWithTimeout(runId) {
    const timeout = new Promise((resolve) => {
      window.setTimeout(() => resolve([]), 8000);
    });
    return Promise.race([loadPlaces(runId), timeout]);
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
    title.textContent = String(place.name || `Lugar de ${territoryName}`);
    const description = document.createElement('p');
    description.textContent = String(place.shortDescription || place.categoryLabel || 'Lugar publicado en el catálogo territorial.');
    content.append(title, description);

    const meta = document.createElement('p');
    meta.className = 'madriz-map-popup-meta';
    meta.textContent = place.catalogReference
      ? `${territoryName} · ubicación aproximada`
      : String(place.municipality || territoryName);
    content.append(meta);

    const directions = document.createElement('a');
    directions.className = 'madriz-map-popup-link';
    directions.href = `https://www.google.com/maps/dir/?api=1&destination=${Number(place.latitude)},${Number(place.longitude)}`;
    directions.target = '_blank';
    directions.rel = 'noopener noreferrer';
    directions.innerHTML = '<i class="fa-solid fa-route" aria-hidden="true"></i> Cómo llegar';
    content.append(directions);

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
    markerButton.setAttribute('aria-label', `Mostrar ${place.name || `lugar de ${territoryName}`}`);
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
    name.textContent = String(place.name || `Lugar de ${territoryName}`);
    const meta = document.createElement('span');
    const parts = [];
    if (place.reviewRating) parts.push(`${ratingLabel(place)} (${place.reviewRating.count})`);
    if (place.categoryLabel || place.category) parts.push(String(place.categoryLabel || place.category).replaceAll('_', ' '));
    meta.textContent = parts.join(' · ') || String(place.municipality || territoryName);
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
    territoryName = String(config.territoryName || (departmentId === 'madriz' ? 'Madriz' : departmentId));
    catalogPlaces = Array.isArray(config.catalogPlaces) ? config.catalogPlaces : [];
    defaultCenter = Array.isArray(config.center) ? config.center : [-86.6, 13.45];
    defaultZoom = Number.isFinite(config.zoom) ? config.zoom : 8.45;
    const runId = generation;
    const container = byId('madrizMap');
    if (!container) return;
    setStatus('Consultando lugares publicados…', 'loading');
    const boundaries = await loadBoundaries();
    if (runId !== generation) return;
    territoryFeature = boundaries && Array.isArray(boundaries.features)
      ? boundaries.features.find((feature) => feature.properties && feature.properties.id === departmentId) || null
      : null;
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
      await waitForStyle();
      if (runId !== generation || !map) return;
      drawTerritory();

      const centerMarkerElement = document.createElement('button');
      centerMarkerElement.type = 'button';
      centerMarkerElement.className = 'baqueano-map-marker baqueano-territory-center-marker';
      centerMarkerElement.setAttribute('aria-label', `Centro territorial de ${territoryName}`);
      centerMarkerElement.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
      const centerMarker = new window.maplibregl.Marker({ element: centerMarkerElement, anchor: 'bottom' })
        .setLngLat(defaultCenter)
        .addTo(map);
      markers.push(centerMarker);

      let places = [];
      try {
        places = await loadPlacesWithTimeout(runId);
      } catch (error) {
        console.warn(`[Mapa ${territoryName}] No fue posible consultar lugares publicados:`, error.message);
      }
      if (runId !== generation || !map) return;
      const carousel = byId('mapPlacesCarousel');
      if (carousel) carousel.replaceChildren();
      if (!places.length && !catalogPlaces.length) {
        setStatus(`Mapa centrado en ${territoryName}. Aún no hay lugares publicados con coordenadas verificadas.`, 'empty');
        return;
      }

      const bounds = new window.maplibregl.LngLatBounds();
      const territoryBounds = territoryBbox();
      if (territoryBounds) bounds.extend([[territoryBounds[0], territoryBounds[1]], [territoryBounds[2], territoryBounds[3]]]);
      places.forEach((place) => addPlace(place, bounds));
      const publishedCount = places.length;
      const knownNames = new Set(places.map((place) => String(place.name || '').toLocaleLowerCase('es-NI')));
      const catalogResolved = await loadCatalogPlaces(runId, (place) => {
        const normalizedName = String(place.name || '').toLocaleLowerCase('es-NI');
        if (knownNames.has(normalizedName)) return;
        knownNames.add(normalizedName);
        places.push(place);
        addPlace(place, bounds);
      });
      if (runId !== generation || !map) return;
      if (!places.length) {
        setStatus(`Mapa centrado en ${territoryName}. No fue posible ubicar lugares en este momento.`, 'empty');
        return;
      }
      map.fitBounds(bounds, {
        padding: { top: 90, right: 70, bottom: 190, left: 70 },
        maxZoom: 12,
        duration: 900
      });
      const statusParts = [];
      if (catalogResolved) statusParts.push(`${catalogResolved} ${catalogResolved === 1 ? 'lugar de la guía' : 'lugares de la guía'}`);
      if (publishedCount) statusParts.push(`${publishedCount} ${publishedCount === 1 ? 'registro publicado' : 'registros publicados'}`);
      const totalPins = (catalogResolved || 0) + publishedCount;
      setStatus(`${statusParts.join(' y ')} ${totalPins === 1 ? 'ubicado' : 'ubicados'} en ${territoryName}.`, 'ready');
    } catch (error) {
      console.error(`[Mapa ${territoryName}]`, error);
      setStatus('No fue posible cargar el catálogo territorial en este momento.', 'error');
    }
  }

  function unmount() {
    generation += 1;
    markers.forEach((marker) => marker.remove());
    markers = [];
    territoryFeature = null;
    if (map) {
      map.remove();
      map = null;
    }
  }

  window.BaqueanoMadrizMap = { mount, unmount };
  window.BaqueanoChinandegaMap = {
    mount: (options) => mount({
      departmentId: 'chinandega',
      elementPrefix: 'chinandega',
      territoryName: 'Chinandega',
      center: [-87.13, 12.63],
      zoom: 8.25,
      ...(options || {})
    }),
    unmount
  };
})(window, document);
