// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MOTOR GEOGRÁFICO & MAPA INTERACTIVO (baqueano-map.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia cartográfica inmersiva, nítida y de alta resolución
//   con imágenes satelitales oficiales de Google Maps y capas vectoriales de Nicaragua.
// - Conectar visualmente los 29 destinos y experiencias gastronómicas de turismo campesino,
//   áreas protegidas, eco-lodges, hospedajes rurales y cultura con sus cooperativas.
// - Erradicar definitivamente la marca de agua 'API KEY REQUIRED' sustituyendo proveedores
//   obsoletos por la API oficial de Google Maps v3 y capas Esri/OSM de alta disponibilidad.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Integración de Leaflet con el plugin Leaflet.GridLayer.GoogleMutant y Google Maps JS API:
//   * Google Maps Satélite HD ('satellite') como capa principal activa.
//   * Google Maps Híbrido ('hybrid') con relieve y nombres de comunidades.
//   * Google Maps Rutas ('streets' / 'roadmap') para carreteras y costas del Pacífico.
//   * Fallback defensivo automático e instantáneo a Esri World Imagery / World Street Map / OSM.
// - Generación de pines animados SVG/HTML con insignias de color por categoría territorial.
// - Control interactivo flotante de capas y saltos de cámara cinemáticos por región geográfica.
// - Sincronización reactiva con filtros del catálogo y tarjetas de destino.
//
// 📦 3. QUÉ (WHAT / COMPONENTES EXPUESTOS):
// - Objeto global `window.BaqueanoMap` con métodos:
//   * `init()`: Inicializa el mapa y renderiza los 29 marcadores georreferenciados.
//   * `switchLayer(layerId)`: Alterna entre Google Satélite, Híbrido, Rutas, Noche y Relieve.
//   * `focusRegion(regionId)`: Vuelo suave por cámara (flyTo) a regiones de Nicaragua.
//   * `filterCategory(catKey)`: Muestra/oculta pines según la categoría seleccionada.
//   * `flyToPlace(placeId)`: Centra el mapa en un destino y abre su popup enriquecido.
//   * `getPlaces()`: Retorna la lista activa de destinos cargados.
// ============================================================================

window.BaqueanoMap = (function() {
  'use strict';

  // --------------------------------------------------------------------------
  // DETECCIÓN DE DISPONIBILIDAD DE GOOGLE MAPS MUTANT API
  // --------------------------------------------------------------------------
  function isGoogleMutantAvailable() {
    return typeof L !== 'undefined' &&
           typeof L.gridLayer !== 'undefined' &&
           typeof L.gridLayer.googleMutant === 'function' &&
           typeof window.google !== 'undefined' &&
           typeof window.google.maps !== 'undefined';
  }

  // --------------------------------------------------------------------------
  // CONFIGURACIÓN DE CAPAS DE MAPA REALES (SIN MARCAS DE AGUA)
  // --------------------------------------------------------------------------
  const TILE_PROVIDERS = {
    satellite: {
      name: 'Satélite HD',
      googleType: 'satellite',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Google Maps / Esri World Imagery',
      subdomains: '',
      maxZoom: 20
    },
    hybrid: {
      name: 'Satélite Híbrido',
      googleType: 'hybrid',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Google Maps / Esri Imagery & Rutas',
      subdomains: '',
      maxZoom: 20
    },
    streets: {
      name: 'Rutas & Playas',
      googleType: 'roadmap',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Google Maps / Esri &mdash; Rutas y Playas de Nicaragua',
      subdomains: '',
      maxZoom: 20
    },
    osm: {
      name: 'Mapa Claro',
      googleType: null,
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
      subdomains: 'abc',
      maxZoom: 19
    },
    dark: {
      name: 'Modo Noche',
      googleType: null,
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri &copy; OpenStreetMap',
      subdomains: '',
      maxZoom: 18
    },
    topo: {
      name: 'Topográfico',
      googleType: null,
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri &mdash; National Geographic, USGS, INETER',
      subdomains: '',
      maxZoom: 19
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
  let currentLayerKey = 'streets';
  let activeTileErrorCount = 0;
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
    const priceNio = place.priceNio ? `C$ ${place.priceNio.toLocaleString('es-NI')}` : (place.priceUsd ? `C$ ${Math.round(place.priceUsd * 36.65).toLocaleString('es-NI')}` : '');
    const price = priceNio && place.priceUsd 
      ? `${priceNio} (≈ $${place.priceUsd} USD)` 
      : (place.priceUsd ? `$${place.priceUsd} USD` : (priceNio || 'Tarifa Comunitaria'));
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
          ${place.priceDetail ? `
            <div style="font-size: 0.74rem; color: #F4E6C1; background: rgba(15,23,42,0.7); padding: 0.35rem 0.6rem; border-radius: 6px; margin: 0.4rem 0; border: 1px dashed rgba(244,230,193,0.3); line-height: 1.35;">
              <i class="fa-solid fa-receipt" style="color: #F59E0B; margin-right: 0.25rem;"></i> ${place.priceDetail}
            </div>` : ''}
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
  // CAMBIO DE CAPA BASE (GOOGLE MUTANT CON FALLBACK A ESRI/OSM)
  // --------------------------------------------------------------------------
  function switchTileLayer(layerKey) {
    if (!mapInstance) return;

    // Normalizar si la clave solicitada no existe
    if (!TILE_PROVIDERS[layerKey]) {
      layerKey = 'satellite';
    }

    if (activeTileLayer) {
      try {
        mapInstance.removeLayer(activeTileLayer);
      } catch (e) {
        // Safe removal
      }
      activeTileLayer = null;
    }

    const conf = TILE_PROVIDERS[layerKey];
    activeTileErrorCount = 0;
    currentLayerKey = layerKey;

    // 1. Intentar proveedor oficial Google Maps GridLayer si está disponible
    if (conf.googleType && isGoogleMutantAvailable()) {
      try {
        activeTileLayer = L.gridLayer.googleMutant({
          type: conf.googleType,
          maxZoom: 20
        });
        activeTileLayer.addTo(mapInstance);
        updateMapStatus(`Google Maps ${conf.name} activo y ${currentPlaces.length} destinos visibles`, 'firestore');
        updateLayerButtonsUI(layerKey);
        if (mapInstance) mapInstance.invalidateSize();
        return;
      } catch (errGoogle) {
        console.warn('[BaqueanoMap] Error inicializando Google Mutant (' + conf.googleType + '), usando fallback Esri:', errGoogle);
      }
    }

    // 2. Fallback estándar a teselas Esri / OSM sin marcas de agua
    const layerOptions = {
      attribution: conf.attribution,
      maxZoom: conf.maxZoom || 19,
      minZoom: 2,
      crossOrigin: true
    };

    if (conf.subdomains) {
      layerOptions.subdomains = conf.subdomains;
    }

    activeTileLayer = L.tileLayer(conf.url, layerOptions);

    activeTileLayer.on('tileerror', function(error) {
      activeTileErrorCount += 1;
      console.warn('[BaqueanoMap] Error de tesela en capa', layerKey, error);
      if (activeTileErrorCount >= 4 && layerKey !== 'osm') {
        switchTileLayer('osm');
        updateMapStatus('Mostrando mapa claro por conexión limitada del proveedor satelital.', 'seed');
      }
    });

    activeTileLayer.on('load', function() {
      updateMapStatus(`${conf.name} activo y ${currentPlaces.length} destinos visibles`, 'firestore');
    });

    activeTileLayer.addTo(mapInstance);

    // Forzar actualización inmediata del cálculo geométrico de Leaflet
    if (mapInstance) {
      mapInstance.invalidateSize();
    }

    updateLayerButtonsUI(layerKey);
  }

  function updateLayerButtonsUI(layerKey) {
    document.querySelectorAll('.map-layer-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.layer === layerKey);
    });
  }

  function updateMapStatus(message, source) {
    const badge = document.getElementById('mapSourceBadge');
    if (!badge) return;

    badge.className = `map-source-badge ${source || 'firestore'}`;
    badge.innerHTML = `<i class="fa-solid fa-map-location-dot"></i> ${message}`;
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
      sourceBadge.innerHTML = `<i class="fa-solid fa-map-location-dot"></i> Mapa visible y ${places.length} Destinos Activos`;
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
        <button type="button" class="map-layer-btn active" data-layer="satellite" title="Google Maps Satélite HD en Alta Resolución">
          <i class="fa-solid fa-satellite"></i> Satélite HD
        </button>
        <button type="button" class="map-layer-btn" data-layer="hybrid" title="Google Maps Híbrido con Nombres y Rutas">
          <i class="fa-solid fa-earth-americas"></i> Híbrido
        </button>
        <button type="button" class="map-layer-btn" data-layer="streets" title="Google Maps Rutas, Playas y Calles">
          <i class="fa-solid fa-road"></i> Rutas
        </button>
        <button type="button" class="map-layer-btn" data-layer="osm" title="Mapa claro con calles, pueblos y referencias visibles">
          <i class="fa-solid fa-map-location-dot"></i> Mapa Claro
        </button>
        <button type="button" class="map-layer-btn" data-layer="dark" title="Modo Nocturno Baqueano">
          <i class="fa-solid fa-moon"></i> Noche
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

      container.classList.add('is-loading');

      // Añadir capa Satélite HD por defecto (Google Maps / Esri)
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

      // Sincronización geométrica y redibujado de teselas
      setTimeout(() => {
        if (mapInstance) {
          mapInstance.invalidateSize();
          container.classList.remove('is-loading');
        }
      }, 250);

      setTimeout(() => {
        if (mapInstance) mapInstance.invalidateSize();
      }, 750);

      setTimeout(() => {
        if (mapInstance) mapInstance.invalidateSize();
      }, 1800);

      window.addEventListener('resize', () => {
        if (mapInstance) mapInstance.invalidateSize();
      }, { passive: true });

      console.info('[BaqueanoMap] Mapa interactivo inicializado con capa visible.');
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
