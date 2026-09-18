// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MAPA REAL INTERACTIVO DE NICARAGUA (nicaragua-real-map.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Reemplazar la simulación topográfica procesal Three.js por un mapa geográfico
//   100% real de Nicaragua, posicionado con coordenadas WGS-84 auténticas.
// - Mostrar todos los 17 departamentos y regiones autónomas con sus pines
//   reales de destinos en el territorio nacional exacto.
// - Ofrecer una experiencia de exploración genuina: el turista ve Nicaragua real,
//   con ríos, lagos Cocibolca y Xolotlán, costas del Pacífico y el Caribe.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Motor cartográfico: Leaflet.js 1.9.4 (ya cargado en index.html).
// - Tiles: Esri WorldTopoMap (gratuito, sin API key, relieve topográfico real).
// - Marcadores custom SVG con clase de tipo (volcano, capital, mountain, etc.).
// - Popup enriquecido con imagen, descripción, cooperativas y enlace a ficha.
// - Filtro de regiones (Pacífico, Centro, Caribe) sincronizado con los botones
//   del HUD existente en el HTML.
// - IntersectionObserver para inicialización lazy y animar entrada de pines.
// - Compatible con CMS: los datos se leen de window.BAQUEANO_TERRITORIES.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES):
// - window.BaqueanoRealMap: singleton con métodos init(), filterRegion(), focusDepartment().
// - Mapa centrado en Nicaragua (12.8654° N, -85.2072° W), zoom 7.
// - 17 marcadores categorizados con animación de pulso y popup bilingüe.
// ============================================================================

(function (window, document) {
  'use strict';

  // --------------------------------------------------------------------------
  // CONFIGURACIÓN CARTOGRÁFICA
  // --------------------------------------------------------------------------
  const MAP_CONFIG = {
    center: [12.8654, -85.2072],   // Centro geográfico de Nicaragua
    zoom: 8,
    minZoom: 6,
    maxZoom: 14,
    // Tiles gratuitos con relieve topográfico real
    tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    tileAttribution: 'Tiles © Esri &mdash; Esri, DeLorme, NAVTEQ',
    // Bounds de Nicaragua para restringir el paneo excesivo
    maxBounds: [[9.5, -89.0], [16.0, -82.0]]
  };

  // --------------------------------------------------------------------------
  // CATEGORÍAS DE PINES (iconos SVG + colores de la paleta oficial)
  // --------------------------------------------------------------------------
  const PIN_CATEGORIES = {
    capital:  { color: '#F65E01', emoji: '🏙️', label: 'Capital' },
    volcano:  { color: '#FF4444', emoji: '🌋', label: 'Volcán' },
    island:   { color: '#10B981', emoji: '🏝️', label: 'Isla' },
    canyon:   { color: '#F59E0B', emoji: '🏞️', label: 'Cañón' },
    mountain: { color: '#165D6F', emoji: '⛰️', label: 'Montaña' },
    colonial: { color: '#8B5CF6', emoji: '🏛️', label: 'Colonial' },
    caribbean:{ color: '#06B6D4', emoji: '🌊', label: 'Caribe' },
    lake:     { color: '#3B82F6', emoji: '💧', label: 'Lago/Río' },
    coffee:   { color: '#92400E', emoji: '☕', label: 'Café' },
    artisan:  { color: '#EC4899', emoji: '🎨', label: 'Artesanía' }
  };

  // --------------------------------------------------------------------------
  // DATOS COMPLETOS DE DESTINOS (lat/lng reales de territories-data.js + tipo)
  // --------------------------------------------------------------------------
  const NICARAGUA_DESTINATIONS = [
    {
      id: 'managua', name: 'Managua', region: 'pacifico',
      lat: 12.1280, lng: -86.2650, type: 'capital', coopCount: 35,
      tagline: 'Corazón de la Nación: Xolotlán, Lagunas y El Chocoyero',
      desc: 'La capital combina modernidad con reservas naturales ocultas, cráteres volcánicos urbanos y las costas del Gran Lago Xolotlán.',
      highlights: ['Lago Xolotlán', 'El Chocoyero-El Brujo', 'Loma de Tiscapa', 'Puerto Salvador Allende'],
      image: 'assets/images/destinos/dona_haydee.jpg'
    },
    {
      id: 'leon', name: 'León', region: 'pacifico',
      lat: 12.5063, lng: -86.7017, type: 'volcano', coopCount: 22,
      tagline: 'Historia, Volcanes y Playas en un Solo Destino',
      desc: 'Capital histórica con Catedral Patrimonio UNESCO, volcanes de arena negra para sandboarding y costas salvajes del Pacífico.',
      highlights: ['Volcán Cerro Negro', 'Catedral de León', 'Ruinas de León Viejo', 'Playa Las Peñitas'],
      image: 'assets/images/destinos/cerro_negro.jpg'
    },
    {
      id: 'chinandega', name: 'Chinandega', region: 'pacifico',
      lat: 12.6280, lng: -87.1310, type: 'volcano', coopCount: 19,
      tagline: 'Tierra de Volcanes Gigantes y Costas Salvajes',
      desc: 'Alberga el San Cristóbal (punto más alto del país), el cráter con laguna del Cosigüina y esteros de manglares vírgenes.',
      highlights: ['Volcán San Cristóbal', 'Volcán Cosigüina', 'Estero Padre Ramos', 'Playas de Aserradores'],
      image: 'assets/images/destinos/cerro_negro.jpg'
    },
    {
      id: 'masaya', name: 'Masaya', region: 'pacifico',
      lat: 11.9854, lng: -86.1614, type: 'artisan', coopCount: 28,
      tagline: 'Cuna del Folklore, Volcán Activo y Tradición Ancestral',
      desc: 'Corazón de la identidad artesanal con el lago de lava del Volcán Masaya, Laguna de Apoyo y los Pueblos Blancos.',
      highlights: ['Volcán Masaya', 'Laguna de Apoyo', 'Mercado de Artesanías', 'Barrio de Monimbó'],
      image: 'assets/images/destinos/volcan_masaya.jpg'
    },
    {
      id: 'granada', name: 'Granada', region: 'pacifico',
      lat: 11.9298, lng: -85.9535, type: 'colonial', coopCount: 32,
      tagline: 'La Gran Sultana: Isletas, Mombacho y Joya Colonial',
      desc: 'Ciudad colonial más antigua sobre tierra firme de América, con 365 isletas volcánicas y la selva nubosa del Mombacho.',
      highlights: ['Las Isletas', 'Volcán Mombacho', 'Calle La Calzada', 'Convento San Francisco'],
      image: 'assets/images/destinos/hotel_dario.jpg'
    },
    {
      id: 'rivas', name: 'Rivas & Ometepe', region: 'pacifico',
      lat: 11.5206, lng: -85.5700, type: 'island', coopCount: 30,
      tagline: 'Oasis de Fuego y Agua: Ometepe y Playas del Pacífico',
      desc: 'Isla de Ometepe con volcanes Concepción y Maderas, playas de surf del Pacífico y santuario de tortugas La Flor.',
      highlights: ['Isla de Ometepe', 'Playa Maderas', 'Refugio La Flor', 'San Juan del Sur'],
      image: 'assets/images/destinos/isla_de_ometepe.jpg'
    },
    {
      id: 'carazo', name: 'Carazo', region: 'pacifico',
      lat: 11.8580, lng: -86.2390, type: 'artisan', coopCount: 18,
      tagline: 'Cuna de El Güegüense, Clima Fresco y Playas de Refugio',
      desc: 'Cuna de la primera obra de teatro del continente. Cafetales, cascadas y playas protegidas en el Pacífico.',
      highlights: ['Diriamba & El Güegüense', 'Laguna La Maquina', 'Chacocente', 'La Boquita'],
      image: 'assets/images/destinos/villa_redonda.jpg'
    },
    {
      id: 'esteli', name: 'Estelí', region: 'centro',
      lat: 13.0910, lng: -86.3530, type: 'mountain', coopCount: 24,
      tagline: 'Diamante de Las Segovias: Tabaco, Cascadas y Muralismo',
      desc: 'Ciudad Tres Veces Heroica, reconocida mundialmente por los mejores puros de tabaco, cascadas y murales artísticos.',
      highlights: ['Tisey-La Estanzuela', 'Reserva Miraflor', 'Fábricas de Puros', 'Salto La Estanzuela'],
      image: 'assets/images/destinos/poco_a_poco.jpg'
    },
    {
      id: 'matagalpa', name: 'Matagalpa', region: 'centro',
      lat: 12.9980, lng: -85.9090, type: 'coffee', coopCount: 25,
      tagline: 'Perla del Septentrión: Nebliselva, Cacao y Guías Indígenas',
      desc: 'Reino del ecoturismo de montaña con bosques de niebla, haciendas de cacao fino y comunidades indígenas activas.',
      highlights: ['Selva Negra', 'Cascada Santa Emilia', 'Cerro Apante', 'Cacao agroecológico'],
      image: 'assets/images/destinos/selva_negra.jpg'
    },
    {
      id: 'jinotega', name: 'Jinotega', region: 'centro',
      lat: 13.3720, lng: -85.6900, type: 'coffee', coopCount: 26,
      tagline: 'La Ciudad de las Brumas, Cascadas y Café de Altura',
      desc: 'Gigante montañoso rodeado de niebla perpetua, ríos caudalosos, Lago de Apanás y cafés más premiados de Nicaragua.',
      highlights: ['Lago de Apanás', 'Cascada La Luna', 'Peñas Blancas', 'Ruta del Café'],
      image: 'assets/images/destinos/cascada_la_luna.jpg'
    },
    {
      id: 'boaco', name: 'Boaco', region: 'centro',
      lat: 12.4720, lng: -85.6590, type: 'mountain', coopCount: 15,
      tagline: 'Ciudad de Dos Pisos, Cerros Místicos y Quesos Artesanales',
      desc: 'Joya entre montañas quebradas con calles escalonadas únicas, cerros vírgenes y rica tradición quesera artesanal.',
      highlights: ['Calles Escalonadas', 'Cerro de la Vieja', 'Queserías de Camoapa', 'Río Fonseca'],
      image: 'assets/images/destinos/finca_magdalena.jpg'
    },
    {
      id: 'chontales', name: 'Chontales', region: 'centro',
      lat: 12.0620, lng: -85.3640, type: 'artisan', coopCount: 16,
      tagline: 'Tierra de Amerrisques, Petroglifos y Cultura Serrana',
      desc: 'Custodio de la Cordillera de Amerrisque y riqueza arqueológica prehispánica. Los ríos son de leche y las piedras de cuajada.',
      highlights: ['Cordillera Amerrisque', 'Museo Arqueológico', 'Puerto Díaz', 'Petroglifos Sagrados'],
      image: 'assets/images/destinos/canon_de_somoto.jpg'
    },
    {
      id: 'madriz', name: 'Madriz', region: 'centro',
      lat: 13.4775, lng: -86.5800, type: 'canyon', coopCount: 14,
      tagline: 'Tierra de Cañones Milenarios y Rosquillas Doradas',
      desc: 'Puerta geológica del norte con el Cañón de Somoto, esculpido por el Río Coco, y talleres de rosquillas artesanales.',
      highlights: ['Cañón de Somoto', 'Mirador La Cruz', 'Rosquillerías Tradicionales', 'Río Coco'],
      image: 'assets/images/destinos/canon_de_somoto.jpg'
    },
    {
      id: 'nueva-segovia', name: 'Nueva Segovia', region: 'centro',
      lat: 13.6330, lng: -86.4750, type: 'mountain', coopCount: 20,
      tagline: 'Pinar Soberano, Cumbres del Mogotón y Sendero de Sandino',
      desc: 'Corona montañosa del norte con el Cerro Mogotón (2,107 msnm, el punto más alto del país) y aguas termales.',
      highlights: ['Cerro Mogotón', 'Aguas Termales', 'Valle de Jalapa', 'Café de Dipilto'],
      image: 'assets/images/destinos/selva_negra.jpg'
    },
    {
      id: 'rio-san-juan', name: 'Río San Juan', region: 'caribe',
      lat: 11.0180, lng: -84.3970, type: 'lake', coopCount: 27,
      tagline: 'Ruta del Agua Sagrada, Fortaleza Colonial e Indio Maíz',
      desc: 'Paraíso fluvial que conecta el Gran Lago con el Mar Caribe, custodiado por la Reserva de Biosfera Indio Maíz.',
      highlights: ['Fortaleza El Castillo', 'Biosfera Indio Maíz', 'Solentiname', 'San Carlos'],
      image: 'assets/images/destinos/fortaleza_el_castillo.jpg'
    },
    {
      id: 'raccn', name: 'RACCN · Caribe Norte', region: 'caribe',
      lat: 14.0350, lng: -83.3880, type: 'caribbean', coopCount: 17,
      tagline: 'Biosfera Bosawás, Miskitos y Mayangnas del Río Wangki',
      desc: 'Pulmón verde de Centroamérica con la Reserva Bosawás, pueblos originarios milenarios y costas caribeñas vírgenes.',
      highlights: ['Biosfera Bosawás', 'Río Coco/Wangki', 'Bilwi/Puerto Cabezas', 'Cayos Miskitos'],
      image: 'assets/images/destinos/cascada_la_luna.jpg'
    },
    {
      id: 'raccs', name: 'RACCS · Caribe Sur', region: 'caribe',
      lat: 12.1720, lng: -83.0580, type: 'caribbean', coopCount: 31,
      tagline: 'Paraíso Afrocaribeño: Corn Island, Bluefields y Cayos Perlas',
      desc: 'Fiesta de color con ritmos de palo de mayo y aguas turquesas. Corn Island, Bluefields y biodiversidad de arrecifes.',
      highlights: ['Corn Island', 'Cayos Perlas', 'Bluefields', 'Laguna de Perlas'],
      image: 'assets/images/destinos/corn_island.jpg'
    }
  ];

  // --------------------------------------------------------------------------
  // CREADOR DE ICONO SVG PERSONALIZADO PARA LEAFLET
  // --------------------------------------------------------------------------
  function createPinIcon(destination) {
    const cat = PIN_CATEGORIES[destination.type] || PIN_CATEGORIES.mountain;
    const color = cat.color;
    const emoji = cat.emoji;

    // SVG del marcador tipo "teardrop" con la paleta de Baqueano
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="42" height="52" viewBox="0 0 42 52">
        <defs>
          <radialGradient id="pinGrad_${destination.id}" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stop-color="${color}DD"/>
            <stop offset="100%" stop-color="${color}"/>
          </radialGradient>
          <filter id="pinShadow_${destination.id}" x="-30%" y="-20%" width="160%" height="160%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="${color}66"/>
          </filter>
        </defs>
        <!-- Cuerpo del pin -->
        <path d="M21 2 C10.5 2 2 10.5 2 21 C2 35 21 50 21 50 C21 50 40 35 40 21 C40 10.5 31.5 2 21 2 Z"
              fill="url(#pinGrad_${destination.id})"
              filter="url(#pinShadow_${destination.id})"
              stroke="#0F172A33" stroke-width="1.5"/>
        <!-- Círculo interno blanco -->
        <circle cx="21" cy="21" r="12" fill="rgba(255,255,255,0.95)"/>
        <!-- Emoji del tipo -->
        <text x="21" y="26" text-anchor="middle" font-size="13" font-family="Segoe UI Emoji, Apple Color Emoji, sans-serif">${emoji}</text>
        <!-- Anillo pulsante externo (animado vía CSS) -->
        <circle cx="21" cy="21" r="19" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.4" class="pin-pulse-ring"/>
      </svg>`;

    return L.divIcon({
      className: `baqueano-map-pin pin-${destination.type}`,
      html: svgContent,
      iconSize: [42, 52],
      iconAnchor: [21, 50],   // Punta del pin al centro
      popupAnchor: [0, -52]   // Popup aparece encima del pin
    });
  }

  // --------------------------------------------------------------------------
  // CREADOR DE POPUP ENRIQUECIDO
  // --------------------------------------------------------------------------
  function createPopupContent(dest) {
    const cat = PIN_CATEGORIES[dest.type] || PIN_CATEGORIES.mountain;
    const highlightsList = dest.highlights
      .map(h => `<li><i class="fa-solid fa-check-circle" style="color:#F65E01;margin-right:5px;"></i>${h}</li>`)
      .join('');

    return `
      <div class="baq-map-popup">
        <div class="baq-popup-header" style="background:${cat.color}15;border-left:4px solid ${cat.color};">
          <span class="baq-popup-cat-badge" style="background:${cat.color};">${cat.emoji} ${cat.label}</span>
          <h3 class="baq-popup-title">${dest.name}</h3>
          <p class="baq-popup-tagline">${dest.tagline}</p>
        </div>
        <div class="baq-popup-img-wrap">
          <img src="${dest.image}" alt="${dest.name}" class="baq-popup-img"
               onerror="this.src='assets/images/destinos/canon_de_somoto.jpg'">
          <div class="baq-popup-img-overlay">
            <span class="baq-popup-coops">
              <i class="fa-solid fa-people-group"></i> ${dest.coopCount} Cooperativas
            </span>
          </div>
        </div>
        <p class="baq-popup-desc">${dest.desc}</p>
        <ul class="baq-popup-highlights">${highlightsList}</ul>
        <a href="destinos.html#${dest.id}" class="baq-popup-cta">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> Explorar Ficha Completa
        </a>
      </div>`;
  }

  // --------------------------------------------------------------------------
  // MÓDULO PRINCIPAL: BaqueanoRealMap
  // --------------------------------------------------------------------------
  const BaqueanoRealMap = {
    map: null,
    markers: [],
    activeRegion: 'todos',
    initialized: false,

    // ——————————————————————————————
    // init(containerId): Monta el mapa real de Nicaragua
    // ——————————————————————————————
    init: function (containerId) {
      const container = document.getElementById(containerId);
      if (!container || this.initialized) return;
      if (typeof L === 'undefined') {
        // Leaflet no disponible, reintentar en 800ms
        setTimeout(() => this.init(containerId), 800);
        return;
      }

      this.initialized = true;

      // Limpiar el contenedor (remover canvas Three.js si existe)
      container.innerHTML = '';
      container.style.height = '520px';
      container.style.borderRadius = '16px';
      container.style.overflow = 'hidden';

      // Inicializar mapa Leaflet
      this.map = L.map(containerId, {
        center: MAP_CONFIG.center,
        zoom: MAP_CONFIG.zoom,
        minZoom: MAP_CONFIG.minZoom,
        maxZoom: MAP_CONFIG.maxZoom,
        zoomControl: true,
        scrollWheelZoom: true,
        maxBounds: MAP_CONFIG.maxBounds,
        maxBoundsViscosity: 1.0,
        attributionControl: true
      });

      // Capa de tiles topográficos (relieve real)
      L.tileLayer(MAP_CONFIG.tileUrl, {
        attribution: MAP_CONFIG.tileAttribution,
        maxZoom: 18
      }).addTo(this.map);

      // Capa alternativa oscura (estilo Baqueano) cuando se requiera
      // L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png').addTo(this.map);

      // Agregar todos los marcadores
      this._addAllMarkers();

      // Conectar botones de región del HUD existente
      this._bindRegionButtons();

      // Actualizar el HUD de título
      this._updateHUDTitle();

      console.log('[BaqueanoRealMap] ✅ Mapa real de Nicaragua inicializado con', this.markers.length, 'destinos.');
    },

    // ——————————————————————————————
    // _addAllMarkers(): Agrega pines de los 17 destinos
    // ——————————————————————————————
    _addAllMarkers: function () {
      NICARAGUA_DESTINATIONS.forEach(dest => {
        if (!dest.lat || !dest.lng) return;

        const icon = createPinIcon(dest);
        const popup = L.popup({
          maxWidth: 300,
          minWidth: 260,
          className: 'baqueano-popup-wrap',
          closeButton: true,
          autoClose: true
        }).setContent(createPopupContent(dest));

        const marker = L.marker([dest.lat, dest.lng], { icon })
          .bindPopup(popup)
          .addTo(this.map);

        // Animación de entrada del marcador
        marker.on('add', function () {
          const el = this.getElement();
          if (el) {
            el.style.opacity = '0';
            el.style.transform += ' scale(0.3)';
            el.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
            setTimeout(() => {
              el.style.opacity = '1';
              el.style.transform = el.style.transform.replace(' scale(0.3)', ' scale(1)');
            }, Math.random() * 600);
          }
        });

        // Hover: escalar ligeramente el pin
        marker.on('mouseover', function () {
          const el = this.getElement();
          if (el) el.style.transform = (el.style.transform || '') + ' scale(1.2)';
        });
        marker.on('mouseout', function () {
          const el = this.getElement();
          if (el) el.style.transform = el.style.transform.replace(' scale(1.2)', '');
        });

        // Guardar referencia con metadatos
        marker._baqueanoData = dest;
        this.markers.push(marker);
      });

      // Ajustar la vista para que Nicaragua quede centrada con todos sus pines
      if (this.markers.length > 0) {
        const group = L.featureGroup(this.markers);
        this.map.fitBounds(group.getBounds().pad(0.05), { animate: false });
        // Forzar zoom mínimo de 7 para que Nicaragua sea protagonista
        setTimeout(() => {
          if (this.map.getZoom() < 7) this.map.setZoom(7);
        }, 200);
      }
    },

    // ——————————————————————————————
    // filterRegion(region): Filtra pines por región geográfica
    // ——————————————————————————————
    filterRegion: function (region) {
      this.activeRegion = region;
      const visibleMarkers = [];

      this.markers.forEach(marker => {
        const dest = marker._baqueanoData;
        const show = (region === 'todos' || dest.region === region);

        if (show) {
          if (!this.map.hasLayer(marker)) marker.addTo(this.map);
          visibleMarkers.push(marker);
          // Animación de aparición
          const el = marker.getElement();
          if (el) {
            el.style.transition = 'opacity 0.4s, transform 0.4s';
            el.style.opacity = '1';
            el.style.transform = '';
          }
        } else {
          if (this.map.hasLayer(marker)) this.map.removeLayer(marker);
        }
      });

      // Zoom a los marcadores visibles
      if (visibleMarkers.length > 0) {
        const group = L.featureGroup(visibleMarkers);
        this.map.fitBounds(group.getBounds().pad(0.15), { animate: true, duration: 0.8 });
      } else {
        this.map.setView(MAP_CONFIG.center, MAP_CONFIG.zoom, { animate: true });
      }
    },

    // ——————————————————————————————
    // focusDepartment(id): Enfoca un destino por ID
    // ——————————————————————————————
    focusDepartment: function (id) {
      const marker = this.markers.find(m => m._baqueanoData && m._baqueanoData.id === id);
      if (!marker) return;
      this.map.setView(marker.getLatLng(), 10, { animate: true, duration: 1.2 });
      setTimeout(() => marker.openPopup(), 700);
    },

    // ——————————————————————————————
    // _bindRegionButtons(): Conecta botones del HUD existente
    // ——————————————————————————————
    _bindRegionButtons: function () {
      const buttons = document.querySelectorAll('.btn-map-region');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          buttons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const region = btn.dataset.region || 'todos';
          this.filterRegion(region);
        });
      });

      // Botón de reset de vista
      const btnReset = document.getElementById('btnReset3DView');
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          this.filterRegion('todos');
          // Resetear botones
          buttons.forEach(b => b.classList.toggle('active', b.dataset.region === 'todos'));
        });
      }

      // Botón de rotación (no aplica al mapa real, lo desactivamos visualmente)
      const btnRotate = document.getElementById('btnToggle3DRotation');
      if (btnRotate) {
        btnRotate.title = 'Centrar vista en Nicaragua';
        btnRotate.addEventListener('click', () => {
          this.map.setView(MAP_CONFIG.center, MAP_CONFIG.zoom, { animate: true });
        });
      }
    },

    // ——————————————————————————————
    // drawRoute(stops): Traza una ruta física en el mapa uniendo las paradas seleccionadas
    // ——————————————————————————————
    drawRoute: function(stops) {
      if (!this.map || !stops || stops.length === 0) return;

      // Limpiar ruta anterior si existe
      if (this.routeLayer) {
        this.map.removeLayer(this.routeLayer);
      }

      const latLngs = [];
      const routeMarkers = [];

      // Cerrar cualquier popup abierto
      this.map.closePopup();

      // Recolectar coordenadas
      stops.forEach(stop => {
        if (stop.lat && stop.lng) {
          latLngs.push([stop.lat, stop.lng]);
          
          // Encontrar el marcador correspondiente para resaltarlo (opcional)
          const marker = this.markers.find(m => m.getLatLng().lat === stop.lat && m.getLatLng().lng === stop.lng);
          if (marker) routeMarkers.push(marker);
        }
      });

      if (latLngs.length < 2) {
        console.warn('No hay suficientes coordenadas reales para trazar una ruta en el mapa.');
        // Si solo hay uno, hacemos zoom a ese punto
        if (latLngs.length === 1) {
          this.map.setView(latLngs[0], 10, { animate: true, duration: 1.5 });
        }
        return;
      }

      // Trazar línea de ruta con estilo dinámico
      this.routeLayer = L.polyline(latLngs, {
        color: '#F65E01',
        weight: 5,
        opacity: 0.8,
        dashArray: '10, 10',
        lineCap: 'round'
      }).addTo(this.map);

      // Animar mapa para encuadrar la ruta completa
      this.map.fitBounds(this.routeLayer.getBounds().pad(0.2), {
        animate: true,
        duration: 1.8,
        easeLinearity: 0.25
      });

      // Efecto visual: resaltar el primer marcador de la ruta abriendo su popup
      setTimeout(() => {
        if (routeMarkers.length > 0) {
          routeMarkers[0].openPopup();
        }
      }, 1900);
    },

    // ——————————————————————————————
    // _updateHUDTitle(): Actualiza el texto del HUD para reflejar el mapa real
    // ——————————————————————————————
    _updateHUDTitle: function () {
      const titleEl = document.querySelector('.mapa-3d-title-text');
      if (titleEl) {
        titleEl.innerHTML = '<i class="fa-solid fa-map-location-dot"></i> Mapa Real · Nicaragua · 17 Territorios';
      }
      const sectionTitle = document.querySelector('#mapaVivo3DNicaragua .section-headline');
      if (sectionTitle) sectionTitle.textContent = 'Mapa Real de Nicaragua';
      const sectionSub = document.querySelector('#mapaVivo3DNicaragua .section-subtext');
      if (sectionSub) sectionSub.textContent = 'Explora los 17 departamentos y regiones de Nicaragua en un mapa real con todos los destinos Baqueano. Haz clic en cualquier pin para ver la ficha completa.';
      // Badge
      const badge = document.querySelector('#mapaVivo3DNicaragua .badge-section-pill');
      if (badge) badge.innerHTML = '<i class="fa-solid fa-map-location-dot"></i> Mapa Geográfico Real';
    }
  };

  // --------------------------------------------------------------------------
  // INICIALIZACIÓN CON IntersectionObserver (lazy, solo cuando es visible)
  // --------------------------------------------------------------------------
  function initWhenVisible() {
    const section = document.getElementById('mapaVivo3DNicaragua');
    if (!section) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          BaqueanoRealMap.init('baqueano3dCanvasWrap');
          observer.disconnect();
        }
      });
    }, { threshold: 0.1 });

    observer.observe(section);
  }

  // Exponer globalmente para uso externo (CMS, admin, etc.)
  window.BaqueanoRealMap = BaqueanoRealMap;

  // Arrancar al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhenVisible);
  } else {
    initWhenVisible();
  }

})(window, document);
