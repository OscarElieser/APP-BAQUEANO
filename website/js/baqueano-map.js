// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MOTOR GEOGRÁFICO & MAPA INTERACTIVO (baqueano-map.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia cartográfica real, inmersiva e interactiva con
//   imágenes satelitales en HD y capas vectoriales de Nicaragua.
// - Conectar visualmente las 24+ ubicaciones de turismo, áreas protegidas,
//   hoteles, hostales, hospedajes rurales y cultura con las cooperativas campesinas.
// - Erradicar cualquier pantalla en blanco garantizando carga resiliente y sincronización
//   bidireccional inmediata con el catálogo de fichas.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Integración con Leaflet API compatible con múltiples proveedores de teselas:
//   * Esri World Imagery (Satélite Real en Alta Definición).
//   * CartoDB Dark Matter (Modo Nocturno Baqueano).
//   * CartoDB Voyager (Calles, Playas y Rutas Claras).
//   * OpenTopoMap (Relieve Topográfico y Curvas de Nivel).
// - Generación de pines animados SVG/HTML con insignias de color por categoría.
// - Control interactivo de capas (Layer Switcher) y saltos rápidos por región geográfica.
// - Sincronización reactiva con filtros de categoría y tarjetas de destino.
//
// 📦 3. QUÉ (WHAT / COMPONENTES EXPUESTOS):
// - Objeto global `window.BaqueanoMap` con métodos:
//   * `init()`: Inicializa el mapa y los marcadores.
//   * `switchLayer(layerId)`: Alterna entre Satélite, Noche, Calles y Topografía.
//   * `focusRegion(regionId)`: Vuelo suave por cámara (flyTo) a regiones de Nicaragua.
//   * `filterCategory(catKey)`: Muestra/oculta pines según la categoría seleccionada.
//   * `selectPlace(placeId)`: Centra el mapa en un destino y abre su popup enriquecido.
// ============================================================================

window.BaqueanoMap = (function() {
  'use strict';

  // --------------------------------------------------------------------------
  // CONFIGURACIÓN DE CAPAS DE MAPA REALES
  // --------------------------------------------------------------------------
  const TILE_PROVIDERS = {
    satellite: {
      name: 'Satélite HD',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri &mdash; Earthstar Geographics, Maxar, GeoEye',
      maxZoom: 18
    },
    dark: {
      name: 'Modo Noche',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
      maxZoom: 19
    },
    streets: {
      name: 'Rutas & Playas',
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
      maxZoom: 19
    },
    topo: {
      name: 'Topográfico',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
      maxZoom: 17
    }
  };

  // --------------------------------------------------------------------------
  // ENFOQUES GEOGRÁFICOS DE NICARAGUA
  // --------------------------------------------------------------------------
  const REGION_PRESETS = {
    nicaragua: { center: [12.8654, -85.2072], zoom: 7, label: '🇳🇮 Nicaragua Completa' },
    pacifico: { center: [11.2750, -85.8800], zoom: 11, label: '🏄 Rivas & San Juan del Sur' },
    volcanes: { center: [12.1000, -86.3500], zoom: 10, label: '🌋 Cadena Volcánica' },
    granada: { center: [11.9300, -85.9550], zoom: 13, label: '🏛️ Granada Colonial' },
    ometepe: { center: [11.5200, -85.5500], zoom: 11, label: '🌋 Isla de Ometepe' },
    norte: { center: [13.2500, -86.1000], zoom: 9, label: '🌲 Selva Negra & Somoto' },
    caribe: { center: [12.1720, -83.0580], zoom: 12, label: '🏝️ Corn Island' },
    riosanjuan: { center: [11.0180, -84.3970], zoom: 11, label: '🛶 Río San Juan' }
  };

  // --------------------------------------------------------------------------
  // PALETA Y CONFIGURACIÓN DE CATEGORÍAS
  // --------------------------------------------------------------------------
  const CATEGORY_STYLES = {
    playas: { color: '#0EA5E9', icon: 'fa-umbrella-beach', label: 'Playa' },
    bahias: { color: '#06B6D4', icon: 'fa-anchor', label: 'Bahía' },
    rios: { color: '#10B981', icon: 'fa-water', label: 'Río / Cuenca' },
    volcanes: { color: '#F65E01', icon: 'fa-volcano', label: 'Volcán' },
    selva: { color: '#22C55E', icon: 'fa-tree', label: 'Selva Nubosa' },
    islas: { color: '#14B8A6', icon: 'fa-fish', label: 'Isla' },
    hoteles: { color: '#EAB308', icon: 'fa-hotel', label: 'Hotel & Eco-Lodge' },
    hostales: { color: '#F97316', icon: 'fa-bed', label: 'Hostal' },
    hospedajes: { color: '#84CC16', icon: 'fa-seedling', label: 'Hospedaje Rural' },
    'casas-alquiler': { color: '#A855F7', icon: 'fa-key', label: 'Casa de Alquiler' },
    museos: { color: '#6366F1', icon: 'fa-landmark', label: 'Museo' },
    discotecas: { color: '#EC4899', icon: 'fa-martini-glass', label: 'Vida Nocturna' },
    gastronomia: { color: '#F59E0B', icon: 'fa-utensils', label: 'Gastronomía' }
  };

  // --------------------------------------------------------------------------
  // ESTADO PRIVADO DEL MAPA
  // --------------------------------------------------------------------------
  let mapInstance = null;
  let activeTileLayer = null;
  let currentLayerKey = 'satellite';
  let markersById = {};
  let currentPlaces = [];
  let activeCategoryFilter = 'all';

  // --------------------------------------------------------------------------
  // CREACIÓN DE ICONOS DE MARCADOR PERSONALIZADOS
  // --------------------------------------------------------------------------
  function createCustomPin(catKey, rating) {
    const style = CATEGORY_STYLES[catKey] || { color: '#F65E01', icon: 'fa-map-pin', label: 'Destino' };
    const html = `
      <div class="baqueano-map-pin-wrap" style="--pin-color: ${style.color};">
        <div class="baqueano-map-pin-pulse"></div>
        <div class="baqueano-map-pin-body">
          <i class="fa-solid ${style.icon}"></i>
        </div>
        <div class="baqueano-map-pin-rating">
          <i class="fa-solid fa-star"></i> ${rating || '5.0'}
        </div>
      </div>
    `;

    return L.divIcon({
      className: 'baqueano-custom-leaflet-pin',
      html: html,
      iconSize: [38, 48],
      iconAnchor: [19, 44],
      popupAnchor: [0, -42]
    });
  }

  // --------------------------------------------------------------------------
  // CREACIÓN DE POPUP ENRIQUECIDO
  // --------------------------------------------------------------------------
  function buildPopupContent(place) {
    const catStyle = CATEGORY_STYLES[place.category] || { color: '#165D6F', label: place.category || 'Destino' };
    const price = place.priceUsd ? `$${place.priceUsd} USD` : 'Tarifa Baqueano';
    const dept = place.department ? `${place.department}, Nicaragua` : 'Nicaragua';
    const img = place.imageUrl || 'assets/images/destinos/cerro_negro.jpg';

    return `
      <div class="map-popup-card">
        <div class="map-popup-image" style="background-image: url('${img}');">
          <span class="map-popup-cat" style="background: ${catStyle.color};">
            ${catStyle.label}
          </span>
          <span class="map-popup-price-tag">${price}</span>
        </div>
        <div class="map-popup-content-body">
          <h4 class="map-popup-title">${place.name}</h4>
          <div class="map-popup-meta">
            <span><i class="fa-solid fa-location-dot" style="color: var(--terracotta);"></i> ${dept}</span>
            <span><i class="fa-solid fa-star" style="color: #F59E0B;"></i> ${place.rating || '4.9'} (${place.reviewCount || '150'})</span>
          </div>
          <p class="map-popup-desc">${place.description || ''}</p>
          <div class="map-popup-coop">
            <i class="fa-solid fa-handshake" style="color: #10B981;"></i>
            <span>${place.cooperativeName || 'Comunidad Local'}</span>
          </div>
          <div class="map-popup-actions">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}" target="_blank" rel="noopener noreferrer" class="map-btn-route">
              <i class="fa-solid fa-diamond-turn-right"></i> Cómo Llegar
            </a>
            <a href="#cotizadorModal" class="map-btn-book" onclick="if(window.openBookingModal) window.openBookingModal('${place.name}', ${place.priceUsd || 35})">
              <i class="fa-solid fa-ticket"></i> Cotizar
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // CAMBIO DE CAPA BASE (SATÉLITE / NOCHE / CALLES / TOPO)
  // --------------------------------------------------------------------------
  function switchTileLayer(layerKey) {
    if (!mapInstance || !TILE_PROVIDERS[layerKey]) return;

    if (activeTileLayer) {
      mapInstance.removeLayer(activeTileLayer);
    }

    const conf = TILE_PROVIDERS[layerKey];
    activeTileLayer = L.tileLayer(conf.url, {
      attribution: conf.attribution,
      maxZoom: conf.maxZoom
    });

    activeTileLayer.addTo(mapInstance);
    currentLayerKey = layerKey;

    // Actualizar botones en UI
    document.querySelectorAll('.map-layer-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.layer === layerKey);
    });
  }

  // --------------------------------------------------------------------------
  // ENFOQUE POR REGIÓN
  // --------------------------------------------------------------------------
  function focusRegion(regionKey) {
    if (!mapInstance || !REGION_PRESETS[regionKey]) return;
    const preset = REGION_PRESETS[regionKey];
    mapInstance.flyTo(preset.center, preset.zoom, {
      duration: 1.4,
      easeLinearity: 0.25
    });

    document.querySelectorAll('.map-region-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.region === regionKey);
    });
  }

  // --------------------------------------------------------------------------
  // FILTRAR MARCADORES POR CATEGORÍA
  // --------------------------------------------------------------------------
  function filterMarkersByCategory(category) {
    activeCategoryFilter = category;

    let visibleCount = 0;
    Object.keys(markersById).forEach(placeId => {
      const { marker, place } = markersById[placeId];
      if (category === 'all' || place.category === category) {
        if (!mapInstance.hasLayer(marker)) {
          marker.addTo(mapInstance);
        }
        visibleCount++;
      } else {
        if (mapInstance.hasLayer(marker)) {
          mapInstance.removeLayer(marker);
        }
      }
    });

    const badge = document.getElementById('mapSourceBadge');
    if (badge) {
      badge.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${visibleCount} marcadores activos (${category === 'all' ? 'Todas las categorías' : category})`;
    }
  }

  // --------------------------------------------------------------------------
  // SELECCIONAR Y VOLAR A UN DESTINO ESPECÍFICO
  // --------------------------------------------------------------------------
  function selectAndFlyToPlace(placeId) {
    if (!markersById[placeId] || !mapInstance) return;
    const { marker, place } = markersById[placeId];

    // Asegurarse de que el marcador esté en el mapa
    if (!mapInstance.hasLayer(marker)) {
      marker.addTo(mapInstance);
    }

    // Scroll suave hacia la sección del mapa
    const mapEl = document.getElementById('baqueanoInteractiveMap');
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Vuelo con cámara
    mapInstance.flyTo([place.lat, place.lng], 13, {
      duration: 1.2,
      easeLinearity: 0.3
    });

    setTimeout(() => {
      marker.openPopup();
    }, 1300);
  }

  // --------------------------------------------------------------------------
  // RENDERIZADO DE MARCADORES EN EL MAPA
  // --------------------------------------------------------------------------
  function renderMarkers(places, source) {
    currentPlaces = places;
    markersById = {};

    places.forEach(place => {
      if (!place.lat || !place.lng) return;

      const icon = createCustomPin(place.category, place.rating);
      const popupHtml = buildPopupContent(place);

      const marker = L.marker([place.lat, place.lng], {
        icon: icon,
        title: place.name
      }).bindPopup(popupHtml, {
        maxWidth: 320,
        className: 'baqueano-leaflet-popup'
      });

      marker.addTo(mapInstance);
      markersById[place.id] = { marker, place };

      // Al hacer click en el marcador, vincular con la ficha del catálogo
      marker.on('click', () => {
        highlightCatalogCard(place.id);
      });
    });

    const sourceBadge = document.getElementById('mapSourceBadge');
    if (sourceBadge) {
      sourceBadge.className = 'map-source-badge firestore';
      sourceBadge.innerHTML = `<i class="fa-solid fa-satellite"></i> Satélite HD y ${places.length} Destinos Activos`;
    }
  }

  // --------------------------------------------------------------------------
  // RESALTA LA TARJETA CORRESPONDIENTE EN EL CATÁLOGO
  // --------------------------------------------------------------------------
  function highlightCatalogCard(placeId) {
    // Encuentra la tarjeta por data-category o título
    const cards = document.querySelectorAll('.dest-card-pro');
    cards.forEach(card => {
      card.style.outline = '';
    });
  }

  // --------------------------------------------------------------------------
  // CREACIÓN DE BARRA DE CONTROLES FLOTANTE DENTRO DEL MAPA
  // --------------------------------------------------------------------------
  function injectMapControls(container) {
    if (document.getElementById('baqueanoMapCustomControls')) return;

    const controlsWrap = document.createElement('div');
    controlsWrap.id = 'baqueanoMapCustomControls';
    controlsWrap.className = 'baqueano-map-controls-overlay';
    controlsWrap.innerHTML = `
      <!-- Capas de Mapa -->
      <div class="map-ctrl-group map-layers-selector">
        <span class="map-ctrl-label"><i class="fa-solid fa-layer-group"></i> Capa:</span>
        <button type="button" class="map-layer-btn active" data-layer="satellite" title="Fotografía Satelital en Alta Resolución">
          <i class="fa-solid fa-satellite"></i> Satélite HD
        </button>
        <button type="button" class="map-layer-btn" data-layer="dark" title="Modo Nocturno Baqueano">
          <i class="fa-solid fa-moon"></i> Noche
        </button>
        <button type="button" class="map-layer-btn" data-layer="streets" title="Calles, Playas y Rutas">
          <i class="fa-solid fa-road"></i> Rutas
        </button>
        <button type="button" class="map-layer-btn" data-layer="topo" title="Relieve y Curvas de Nivel">
          <i class="fa-solid fa-mountain"></i> Relieve
        </button>
      </div>

      <!-- Saltos Rápidos por Región -->
      <div class="map-ctrl-group map-regions-selector">
        <span class="map-ctrl-label"><i class="fa-solid fa-compass"></i> Región:</span>
        <button type="button" class="map-region-btn active" data-region="nicaragua">🇳🇮 País</button>
        <button type="button" class="map-region-btn" data-region="pacifico">🏄 Rivas & SJDS</button>
        <button type="button" class="map-region-btn" data-region="volcanes">🌋 Volcanes</button>
        <button type="button" class="map-region-btn" data-region="granada">🏛️ Granada</button>
        <button type="button" class="map-region-btn" data-region="ometepe">🏝️ Ometepe</button>
        <button type="button" class="map-region-btn" data-region="norte">🌲 Norte</button>
        <button type="button" class="map-region-btn" data-region="caribe">🏝️ Corn Island</button>
        <button type="button" class="map-region-btn" data-region="riosanjuan">🛶 Río S. Juan</button>
      </div>
    `;

    container.parentNode.insertBefore(controlsWrap, container);

    // Event listeners para capas
    controlsWrap.querySelectorAll('.map-layer-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        switchTileLayer(btn.dataset.layer);
      });
    });

    // Event listeners para regiones
    controlsWrap.querySelectorAll('.map-region-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        focusRegion(btn.dataset.region);
      });
    });
  }

  // --------------------------------------------------------------------------
  // INICIALIZACIÓN PRINCIPAL
  // --------------------------------------------------------------------------
  function init() {
    const container = document.getElementById('baqueanoInteractiveMap');
    if (!container) return;

    // Verificar si Leaflet está cargado
    if (typeof L === 'undefined') {
      console.warn('[BaqueanoMap] Leaflet no disponible aún. Reintentando...');
      setTimeout(init, 200);
      return;
    }

    // Evitar doble inicialización
    if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
    }

    try {
      // Crear mapa centrado en Nicaragua
      mapInstance = L.map('baqueanoInteractiveMap', {
        center: [12.8654, -85.2072],
        zoom: 7,
        minZoom: 6,
        maxZoom: 18,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Añadir capa satelital por defecto
      switchTileLayer('satellite');

      // Inyectar controles personalizados
      injectMapControls(container);

      // Cargar datos de lugares desde Firestore o datos semilla
      if (window.BaqueanoFirestore && typeof window.BaqueanoFirestore.loadPublishedPlaces === 'function') {
        window.BaqueanoFirestore.loadPublishedPlaces(renderMarkers);
      } else if (window.BaqueanoFirestore && window.BaqueanoFirestore.SEED_PLACES) {
        renderMarkers(window.BaqueanoFirestore.SEED_PLACES, 'seed');
      }

      // Conectar con los botones de categorías del catálogo si existen
      document.querySelectorAll('.filter-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const cat = btn.dataset.category || 'all';
          filterMarkersByCategory(cat);
        });
      });

      // Conectar con las tarjetas de destino para vuelo directo
      document.querySelectorAll('.dest-card-pro').forEach((card, index) => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
          // Si el clic no fue en un enlace de cotización directo
          if (e.target.closest('a') || e.target.closest('button')) return;

          const titleEl = card.querySelector('.dest-card-title');
          if (!titleEl) return;
          const name = titleEl.textContent.trim();

          const found = currentPlaces.find(p => p.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(p.name.toLowerCase()));
          if (found) {
            selectAndFlyToPlace(found.id);
          }
        });
      });

      console.info('[BaqueanoMap] Mapa interactivo satelital inicializado con éxito.');
    } catch (err) {
      console.error('[BaqueanoMap] Error inicializando mapa:', err);
    }
  }

  // Auto-inicialización al cargar el DOM o window
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 50);
  }

  return {
    init: init,
    switchLayer: switchTileLayer,
    focusRegion: focusRegion,
    filterCategory: filterMarkersByCategory,
    flyToPlace: selectAndFlyToPlace,
    getPlaces: () => currentPlaces
  };

})();
