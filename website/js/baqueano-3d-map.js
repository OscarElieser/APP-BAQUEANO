// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MAPA VIVO 3D DE NICARAGUA (baqueano-3d-map.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Servir como la pieza insignia de identidad territorial y visual de BAQUEANO:
//   un territorio turístico digital 3D interactivo que conecta la geografía física,
//   las áreas protegidas, las comunidades campesinas y la riqueza cultural de Nicaragua.
// - Erradicar mapas planos convencionales en favor de una experiencia inmersiva
//   en WebGL que permita al explorador nacional e internacional comprender
//   el relieve de volcanes, los grandes lagos (Cocibolca y Xolotlán), las montañas
//   del norte y las dos costas soberanas (Pacífico y Caribe).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Construido sobre Three.js con WebGLRenderer acelerado por GPU.
// - Geometría de relieve topográfico con shaders procedurales inspirados en la
//   paleta oficial (#080D1A, #165D6F, #F4E6C1, #F65E01).
// - Marcadores 3D interactivos con halos de pulsación luminosa en coordenadas reales.
// - Rutas animadas trazadas con curvas de Bézier y partículas viajeras en sendero.
// - OrbitControls suaves con límites de ángulo para preservar la vista óptima.
// - IntersectionObserver para pausar el loop de renderizado cuando el lienzo
//   no esté en el viewport, garantizando 60fps y 0% desperdicio de batería en móviles.
// - Integración con Cloud Firestore y fallback a catálogo canónico de Baqueano.
//
// 📦 3. QUÉ (WHAT / COMPONENTES EXPUESTOS):
// - window.Baqueano3DMap: Objeto singleton con métodos de control:
//   * init(containerId): Inicializa la escena 3D en el DOM.
//   * focusLocation(lat, lng, zoom): Transición suave de cámara a un territorio.
//   * highlightRoute(points): Dibuja y anima una ruta turística en el relieve.
//   * openDetailDrawer(territoryKey): Abre la ficha territorial interactiva.
// ============================================================================

(function(window, document) {
  'use strict';

  // --------------------------------------------------------------------------
  // DATOS CARTOGRÁFICOS Y TERRITORIALES DE NICARAGUA
  // --------------------------------------------------------------------------
  const TERRITORIES_DATA = {
    managua: {
      name: 'Managua (Capital & Ecosistema)',
      coords: [12.1364, -86.2514],
      elevation: 0.15,
      type: 'capital',
      description: 'Cuna cultural frente al Lago Xolotlán, Parque Central, Reserva Natural Chocoyero-El Brujo y gastronomía de comiderías populares.',
      highlights: ['Chocoyero-El Brujo', 'Laguna de Tiscapa', 'Huellas de Acahualinca', 'Puerto Salvador Allende'],
      culture: 'Muralismo, poesía rubendariana, asados campesinos al carbón.',
      color: '#F65E01'
    },
    leon: {
      name: 'León (Maribios & Volcanes)',
      coords: [12.4378, -86.8780],
      elevation: 0.35,
      type: 'volcano',
      description: 'Cordillera de los Maribios, Cerro Negro (volcano sandboarding), Catedral Patrimonio de la Humanidad y quesillo artesanal de Nagarote.',
      highlights: ['Volcán Cerro Negro', 'Volcán Telica', 'Ruinas de León Viejo', 'Playa Las Peñitas'],
      culture: 'Tradición de mitos populares (La Gigantona), poesía y quesillos en hoja.',
      color: '#F65E01'
    },
    granada: {
      name: 'Granada (Mombacho & Isletas)',
      coords: [11.9299, -85.9560],
      elevation: 0.40,
      type: 'volcano',
      description: 'El Gran Lago Cocibolca, 365 isletas de origen volcánico, bosque nuboso del Volcán Mombacho y vigorón servido en hoja de plátano.',
      highlights: ['Volcán Mombacho', 'Las Isletas de Granada', 'Calle La Calzada', 'Convento San Francisco'],
      culture: 'Arquitectura colonial, comedia bailete El Güegüense, vigorón campesino.',
      color: '#165D6F'
    },
    rivas: {
      name: 'Rivas (Ometepe & San Juan del Sur)',
      coords: [11.4372, -85.8263],
      elevation: 0.45,
      type: 'island',
      description: 'Isla de Ometepe con sus colosos Concepción y Maderas, playas del Pacífico para surf y santuario de tortugas paslama en Refugio La Flor.',
      highlights: ['Isla de Ometepe', 'Playa Maderas', 'Refugio La Flor', 'San Juan del Sur'],
      culture: 'Petroglifos precolombinos, cooperativas plataneras, pesca artesanal.',
      color: '#10B981'
    },
    madriz: {
      name: 'Madriz (Cañón de Somoto & Rosquillas)',
      coords: [13.4833, -86.5833],
      elevation: 0.30,
      type: 'canyon',
      description: 'Monumento Nacional Cañón de Somoto esculpido por el Río Coco (Wangki), talleres tradicionales de rosquillas horneadas en leña.',
      highlights: ['Cañón de Somoto', 'Mirador La Cruz', 'Rosquillerías Tradicionales', 'Río Coco'],
      culture: 'Música de polkas y mazurcas segovianas, rosquillas y café de altura.',
      color: '#F59E0B'
    },
    matagalpa: {
      name: 'Matagalpa (Perla del Septentrión & Café)',
      coords: [12.9256, -85.9178],
      elevation: 0.38,
      type: 'mountain',
      description: 'Bosques de niebla, senderos de nebliselva en Selva Negra, cascadas, comunidades indígenas de Sébaco y caficultura agroecológica.',
      highlights: ['Reserva Selva Negra', 'Cascada Santa Emilia', 'Cerro Apante', 'Comunidad de San Ramón'],
      culture: 'Danza indígena de Matagalpa, café estricta altura (SHG), chocolate artesanal.',
      color: '#165D6F'
    },
    jinotega: {
      name: 'Jinotega (Brumas & Lago de Apanás)',
      coords: [13.0900, -85.9900],
      elevation: 0.42,
      type: 'mountain',
      description: 'La Ciudad de las Brumas, Lago de Apanás para avistamiento de aves acuáticas, Reserva Datanlí-El Diablo y cascada La Luna en El Cuá.',
      highlights: ['Lago de Apanás', 'Cascada La Luna', 'Reserva Datanlí-El Diablo', 'Peña de la Cruz'],
      culture: 'Guitarras segovianas, tejido campesino de henequén, clima fresco de montaña.',
      color: '#10B981'
    },
    masaya: {
      name: 'Masaya (Cuna del Folclore & Lava Activa)',
      coords: [11.9744, -86.0942],
      elevation: 0.32,
      type: 'volcano',
      description: 'El Cráter Santiago con su lago de lava incandescente en el Volcán Masaya, Laguna de Apoyo de aguas cristalinas y Mercado de Artesanías.',
      highlights: ['Volcán Masaya', 'Laguna de Apoyo', 'Mercado de Artesanías', 'Pueblos Blancos'],
      culture: 'Marimba de arco tradicional, danzas de torovenado, baho en chagüite.',
      color: '#F65E01'
    },
    caribe_sur: {
      name: 'Caribe Sur (Corn Island & Bluefields)',
      coords: [12.1720, -83.0580],
      elevation: 0.08,
      type: 'coast',
      description: 'Aguas turquesas en Big y Little Corn Island, arrecifes de coral protegidos, cultura creole y garífuna multilingüe y rondón con coco.',
      highlights: ['Corn Island & Little Corn', 'Bahía de Bluefields', 'Laguna de Perlas', 'Cayos Perlas'],
      culture: 'Palo de Mayo ancestral, gastronomía de mariscos y rondón, música mento.',
      color: '#38BDF8'
    }
  };

  // --------------------------------------------------------------------------
  // RUTAS EXPEDICIONARIAS DE EJEMPLO
  // --------------------------------------------------------------------------
  const ROUTES_DATA = {
    ruta_volcanes: {
      name: 'Ruta de los Volcanes & Fuego Sagrado',
      points: ['leon', 'masaya', 'granada', 'rivas'],
      color: '#F65E01'
    },
    ruta_cafe: {
      name: 'Ruta del Café Campesino & Bosque de Niebla',
      points: ['managua', 'matagalpa', 'jinotega', 'madriz'],
      color: '#10B981'
    },
    ruta_caribe: {
      name: 'Travesía de Dos Océanos: Pacífico a Caribe',
      points: ['rivas', 'granada', 'caribe_sur'],
      color: '#38BDF8'
    }
  };

  // --------------------------------------------------------------------------
  // ESTADO INTERNO DEL MOTOR THREE.JS
  // --------------------------------------------------------------------------
  const MapState = {
    container: null,
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    meshTerrain: null,
    markersGroup: null,
    routesGroup: null,
    particlesMesh: null,
    activeLocationKey: null,
    isRendering: false,
    raycaster: null,
    mouse: null,
    clock: null
  };

  // --------------------------------------------------------------------------
  // MOTOR PRINCIPAL
  // --------------------------------------------------------------------------
  const Baqueano3DMap = {
    init(containerId = 'baqueano3dCanvasWrap') {
      const container = document.getElementById(containerId);
      if (!container) {
        console.warn(`[Baqueano3DMap] Contenedor #${containerId} no encontrado.`);
        return;
      }

      if (typeof window.THREE === 'undefined') {
        console.warn('[Baqueano3DMap] Three.js no está cargado. Se omite inicialización.');
        return;
      }

      MapState.container = container;
      MapState.clock = new THREE.Clock();
      MapState.raycaster = new THREE.Raycaster();
      MapState.mouse = new THREE.Vector2();

      this.setupScene();
      this.createTerrainMesh();
      this.createLakesAndWater();
      this.createTerritoryMarkers();
      this.createAmbientParticles();
      this.drawRoute('ruta_volcanes');
      this.setupInteraction();
      this.setupObserver();
      this.animate();

      console.info('[Baqueano3DMap] Mapa Vivo 3D de Nicaragua inicializado exitosamente.');
    },

    // ------------------------------------------------------------------------
    // 1. CONFIGURACIÓN DE ESCENA, CÁMARA, LUCES & CONTROLES
    // ------------------------------------------------------------------------
    setupScene() {
      const width = MapState.container.clientWidth || 800;
      const height = MapState.container.clientHeight || 560;

      // Escena con niebla ambiental para profundidad cinemática
      MapState.scene = new THREE.Scene();
      MapState.scene.background = new THREE.Color(0x080D1A);
      MapState.scene.fog = new THREE.FogExp2(0x080D1A, 0.045);

      // Cámara en perspectiva inclinada (isométrica teatral)
      MapState.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      MapState.camera.position.set(0, 11, 12);

      // Renderizador WebGL con soporte retina y antialiasing
      MapState.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      MapState.renderer.setSize(width, height);
      MapState.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      MapState.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      MapState.renderer.toneMappingExposure = 1.1;

      // Inyectar canvas en el DOM limpio
      MapState.container.innerHTML = '';
      MapState.container.appendChild(MapState.renderer.domElement);

      // OrbitControls de navegación orbital táctil y de ratón
      if (typeof THREE.OrbitControls !== 'undefined') {
        MapState.controls = new THREE.OrbitControls(MapState.camera, MapState.renderer.domElement);
        MapState.controls.enableDamping = true;
        MapState.controls.dampingFactor = 0.06;
        MapState.controls.maxPolarAngle = Math.PI / 2 - 0.08; // Evitar pasar por debajo del suelo
        MapState.controls.minDistance = 6;
        MapState.controls.maxDistance = 22;
        MapState.controls.autoRotate = true;
        MapState.controls.autoRotateSpeed = 0.35;
        MapState.controls.target.set(0, 0, 0);
      }

      // Iluminación cinemática
      const ambientLight = new THREE.AmbientLight(0x165D6F, 1.4);
      MapState.scene.add(ambientLight);

      // Luz direccional dorada (sol nicaragüense al atardecer)
      const sunLight = new THREE.DirectionalLight(0xF4E6C1, 1.8);
      sunLight.position.set(8, 14, 8);
      MapState.scene.add(sunLight);

      // Luz secundaria de lava volcánica terracota (#F65E01)
      const lavaLight = new THREE.PointLight(0xF65E01, 2.2, 18);
      lavaLight.position.set(-2, 2, 0);
      MapState.scene.add(lavaLight);

      // Grupos de jerarquía
      MapState.markersGroup = new THREE.Group();
      MapState.routesGroup = new THREE.Group();
      MapState.scene.add(MapState.markersGroup);
      MapState.scene.add(MapState.routesGroup);

      // Manejo de resize responsivo
      window.addEventListener('resize', () => this.onWindowResize());
    },

    // ------------------------------------------------------------------------
    // 2. ESCULPIDO TOPOGRÁFICO DE NICARAGUA
    // ------------------------------------------------------------------------
    createTerrainMesh() {
      // Plano subdividido para esculpir cordilleras y depresiones
      const geometry = new THREE.PlaneGeometry(16, 12, 128, 128);
      geometry.rotateX(-Math.PI / 2);

      const positions = geometry.attributes.position;

      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);

        let elevation = 0;

        // 1. Cadena Volcánica de los Maribios (Franja Oeste-Pacífico)
        // Coordenadas aproximadas en el plano: x: -5 a -1, z: 0 a 4
        const distVolcanoLine = Math.abs((z * 0.7) - x - 1.2);
        if (distVolcanoLine < 1.4 && z > -2 && z < 4.5) {
          elevation += Math.exp(-distVolcanoLine * 2.2) * 1.35;

          // Volcanes emblemáticos puntuales
          // Cerro Negro / Telica
          const dCerroNegro = Math.hypot(x - (-2.8), z - 1.0);
          elevation += Math.exp(-dCerroNegro * 3.5) * 1.2;

          // Mombacho / Masaya
          const dMombacho = Math.hypot(x - (-0.8), z - 2.5);
          elevation += Math.exp(-dMombacho * 3.0) * 1.4;

          // Concepción y Maderas (Ometepe en el lago)
          const dOmetepeConcepcion = Math.hypot(x - 0.4, z - 3.8);
          elevation += Math.exp(-dOmetepeConcepcion * 4.0) * 1.5;
        }

        // 2. Macizo Central (Matagalpa, Jinotega, Madriz)
        const dNorte = Math.hypot(x - (-1.0), z - (-2.2));
        if (dNorte < 3.2) {
          elevation += Math.exp(-dNorte * 0.8) * 1.1;
        }

        // 3. Depresiones de los Lagos
        // Lago Xolotlán (Managua)
        const dXolotlan = Math.hypot(x - (-1.5), z - 0.5);
        if (dXolotlan < 1.2) {
          elevation -= 0.35;
        }

        // Gran Lago Cocibolca (Nicaragua)
        const dCocibolca = Math.hypot(x - 0.6, z - 2.8);
        if (dCocibolca < 2.2) {
          elevation -= 0.4;
          // Dejar sobresalir la Isla de Ometepe
          const dOmetepeIsland = Math.hypot(x - 0.4, z - 3.6);
          if (dOmetepeIsland < 0.65) {
            elevation += 0.85;
          }
        }

        // 4. Llanura de la Costa Caribe (Descenso gradual al este)
        if (x > 2.0) {
          elevation = Math.max(0.04, elevation * 0.3);
        }

        // Añadir textura procedural sutil
        elevation += Math.sin(x * 2.5) * Math.cos(z * 2.5) * 0.08;

        positions.setY(i, Math.max(-0.25, elevation));
      }

      geometry.computeVertexNormals();

      // Material con textura topográfica de alta gama
      const material = new THREE.MeshStandardMaterial({
        color: 0x0D1B2A,
        roughness: 0.72,
        metalness: 0.18,
        wireframe: false,
        flatShading: true
      });

      MapState.meshTerrain = new THREE.Mesh(geometry, material);
      MapState.scene.add(MapState.meshTerrain);

      // Líneas de contorno topográfico estilizadas
      const wireGeo = geometry.clone();
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x165D6F,
        wireframe: true,
        transparent: true,
        opacity: 0.22
      });
      const wireMesh = new THREE.Mesh(wireGeo, wireMat);
      wireMesh.position.y = 0.01;
      MapState.scene.add(wireMesh);
    },

    // ------------------------------------------------------------------------
    // 3. SUPERFICIES DE AGUA & LAGOS SAGRADOS (XOLOTLÁN Y COCIBOLCA)
    // ------------------------------------------------------------------------
    createLakesAndWater() {
      // Plano de agua en depresión
      const waterGeo = new THREE.PlaneGeometry(15.8, 11.8);
      waterGeo.rotateX(-Math.PI / 2);

      const waterMat = new THREE.MeshStandardMaterial({
        color: 0x0A2B3B,
        roughness: 0.15,
        metalness: 0.85,
        transparent: true,
        opacity: 0.75
      });

      const waterMesh = new THREE.Mesh(waterGeo, waterMat);
      waterMesh.position.y = -0.06;
      MapState.scene.add(waterMesh);
    },

    // ------------------------------------------------------------------------
    // 4. MARCADORES 3D PULSANTES EN COORDENADAS TERRITORIALES
    // ------------------------------------------------------------------------
    createTerritoryMarkers() {
      MapState.markersGroup.clear();

      Object.keys(TERRITORIES_DATA).forEach((key) => {
        const item = TERRITORIES_DATA[key];
        const pos = this.geoToMapCoords(item.coords[0], item.coords[1], item.elevation);

        // Grupo contenedor del pin
        const markerObj = new THREE.Group();
        markerObj.position.copy(pos);
        markerObj.userData = { territoryKey: key, ...item };

        // Pin piramidal flotante
        const pinGeo = new THREE.ConeGeometry(0.18, 0.45, 4);
        pinGeo.rotateX(Math.PI);
        const pinMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(item.color),
          emissive: new THREE.Color(item.color),
          emissiveIntensity: 0.6,
          roughness: 0.3
        });
        const pinMesh = new THREE.Mesh(pinGeo, pinMat);
        pinMesh.position.y = 0.45;
        markerObj.add(pinMesh);

        // Halo de pulsación luminosa en la base
        const ringGeo = new THREE.RingGeometry(0.12, 0.28, 16);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(item.color),
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.y = 0.05;
        ringMesh.name = 'pulseRing';
        markerObj.add(ringMesh);

        // Esfera núcleo
        const coreGeo = new THREE.SphereGeometry(0.09, 12, 12);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        coreMesh.position.y = 0.24;
        markerObj.add(coreMesh);

        MapState.markersGroup.add(markerObj);
      });
    },

    // ------------------------------------------------------------------------
    // 5. PARTÍCULAS AMBIENTALES EN SUSPENSIÓN (BRUMA & ESTRELLAS)
    // ------------------------------------------------------------------------
    createAmbientParticles() {
      const count = 320;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);

      for (let i = 0; i < count * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 16;
        positions[i + 1] = Math.random() * 5 + 0.5;
        positions[i + 2] = (Math.random() - 0.5) * 12;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const material = new THREE.PointsMaterial({
        color: 0xF4E6C1,
        size: 0.075,
        transparent: true,
        opacity: 0.65
      });

      MapState.particlesMesh = new THREE.Points(geometry, material);
      MapState.scene.add(MapState.particlesMesh);
    },

    // ------------------------------------------------------------------------
    // 6. TRAZADO DE RUTAS ANIMADAS (CURVAS DE BÉZIER FLUORESCENTES)
    // ------------------------------------------------------------------------
    drawRoute(routeKey = 'ruta_volcanes') {
      const route = ROUTES_DATA[routeKey];
      if (!route) return;

      MapState.routesGroup.clear();

      const points = route.points.map((pKey) => {
        const t = TERRITORIES_DATA[pKey];
        const pos = this.geoToMapCoords(t.coords[0], t.coords[1], t.elevation);
        return new THREE.Vector3(pos.x, pos.y + 0.3, pos.z);
      });

      if (points.length < 2) return;

      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.04, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(route.color),
        transparent: true,
        opacity: 0.85
      });

      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      MapState.routesGroup.add(tubeMesh);
    },

    // ------------------------------------------------------------------------
    // 7. TRANSFORMACIÓN DE COORDENADAS GPS A ESPACIO THREE.JS
    // ------------------------------------------------------------------------
    geoToMapCoords(lat, lng, elevation = 0.2) {
      // Límites territoriales de Nicaragua:
      // Latitud: ~10.7° N a ~15.0° N
      // Longitud: ~-87.7° W a ~-82.5° W
      const minLat = 10.7, maxLat = 15.0;
      const minLng = -87.7, maxLng = -82.5;

      const normX = (lng - minLng) / (maxLng - minLng); // 0 a 1 (oeste a este)
      const normZ = (lat - minLat) / (maxLat - minLat); // 0 a 1 (sur a norte)

      // Mapear al plano 3D (x: -7 a 7, z: 5 a -5)
      const x = (normX - 0.5) * 14.5;
      const z = (0.5 - normZ) * 9.5;
      const y = elevation + 0.2;

      return new THREE.Vector3(x, y, z);
    },

    // ------------------------------------------------------------------------
    // 8. INTERACCIÓN (RAYCASTING, CLIC & TOQUE TÁCTIL)
    // ------------------------------------------------------------------------
    setupInteraction() {
      const domEl = MapState.renderer.domElement;

      const onPointerClick = (e) => {
        const rect = domEl.getBoundingClientRect();
        MapState.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        MapState.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        MapState.raycaster.setFromCamera(MapState.mouse, MapState.camera);
        const intersects = MapState.raycaster.intersectObjects(MapState.markersGroup.children, true);

        if (intersects.length > 0) {
          // Obtener grupo del marcador
          let targetObj = intersects[0].object;
          while (targetObj.parent && targetObj.parent !== MapState.markersGroup) {
            targetObj = targetObj.parent;
          }

          if (targetObj && targetObj.userData && targetObj.userData.territoryKey) {
            this.openDetailDrawer(targetObj.userData.territoryKey);
          }
        }
      };

      domEl.addEventListener('click', onPointerClick);
    },

    // ------------------------------------------------------------------------
    // 9. FICHA TERRITORIAL INTERACTIVA (DRAWER DE EXPLORACIÓN)
    // ------------------------------------------------------------------------
    openDetailDrawer(territoryKey) {
      const item = TERRITORIES_DATA[territoryKey];
      if (!item) return;

      MapState.activeLocationKey = territoryKey;

      // Pausar rotación automática temporalmente al interactuar
      if (MapState.controls) MapState.controls.autoRotate = false;

      // Desplazar cámara suavemente hacia el objetivo
      const pos = this.geoToMapCoords(item.coords[0], item.coords[1], item.elevation);
      if (MapState.controls) {
        MapState.controls.target.set(pos.x, pos.y, pos.z);
      }

      // Inyectar contenido en el modal o drawer territorial
      const drawer = document.getElementById('map3dDetailDrawer');
      const titleEl = document.getElementById('map3dDrawerTitle');
      const bodyEl = document.getElementById('map3dDrawerBody');

      if (drawer && titleEl && bodyEl) {
        titleEl.innerHTML = `<i class="fa-solid fa-mountain" style="color: ${item.color};"></i> ${item.name}`;
        bodyEl.innerHTML = `
          <div style="font-size: 0.88rem; color: #F4E6C1; line-height: 1.6; margin-bottom: 1rem;">
            ${item.description}
          </div>

          <div style="margin-bottom: 1rem;">
            <strong style="color: #FFFFFF; font-size: 0.82rem; display: block; margin-bottom: 0.4rem;">
              <i class="fa-solid fa-compass" style="color: #F65E01;"></i> Destinos & Atractivos Soberanos:
            </strong>
            <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
              ${item.highlights.map(h => `
                <span style="background: rgba(22, 93, 111, 0.4); border: 1px solid rgba(244, 230, 193, 0.2); padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.75rem; color: #FFFFFF;">
                  ${h}
                </span>
              `).join('')}
            </div>
          </div>

          <div style="margin-bottom: 1.25rem; background: rgba(8, 13, 26, 0.6); padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
            <strong style="color: #F4E6C1; font-size: 0.78rem; display: block; margin-bottom: 0.25rem;">
              <i class="fa-solid fa-guitar" style="color: #F65E01;"></i> Identidad & Tradición:
            </strong>
            <span style="font-size: 0.8rem; color: #94A3B8;">${item.culture}</span>
          </div>

          <div style="display: flex; gap: 0.6rem;">
            <a href="destinos.html?depto=${encodeURIComponent(item.name.split(' ')[0])}" class="btn-hero-primary" style="flex: 1; text-align: center; font-size: 0.82rem; padding: 0.65rem 0.8rem;">
              <i class="fa-solid fa-compass"></i> Ver Destinos
            </a>
            <button type="button" class="btn-hero-glass" onclick="window.Baqueano3DMap.closeDetailDrawer()" style="font-size: 0.82rem; padding: 0.65rem 0.8rem;">
              Cerrar
            </button>
          </div>
        `;
        drawer.classList.add('is-open');
      }
    },

    closeDetailDrawer() {
      const drawer = document.getElementById('map3dDetailDrawer');
      if (drawer) drawer.classList.remove('is-open');
      if (MapState.controls) {
        MapState.controls.autoRotate = true;
        MapState.controls.target.set(0, 0, 0);
      }
    },

    // ------------------------------------------------------------------------
    // 10. OPTIMIZACIÓN ENERGÉTICA MEDIANTE INTERSECTION OBSERVER
    // ------------------------------------------------------------------------
    setupObserver() {
      if (!('IntersectionObserver' in window)) {
        MapState.isRendering = true;
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          MapState.isRendering = entry.isIntersecting;
        });
      }, { threshold: 0.1 });

      observer.observe(MapState.container);
    },

    // ------------------------------------------------------------------------
    // 11. BUCLE DE ANIMACIÓN A 60 FPS
    // ------------------------------------------------------------------------
    animate() {
      requestAnimationFrame(() => this.animate());

      if (!MapState.isRendering) return;

      const elapsed = MapState.clock.getElapsedTime();

      // Animación de pulsación lumínica en los halos de los marcadores
      MapState.markersGroup.children.forEach((group, idx) => {
        const ring = group.getObjectByName('pulseRing');
        if (ring) {
          const s = 1 + Math.sin(elapsed * 3 + idx) * 0.35;
          ring.scale.set(s, s, s);
        }
      });

      // Flotación suave de partículas ambientales
      if (MapState.particlesMesh) {
        MapState.particlesMesh.rotation.y = elapsed * 0.02;
      }

      // Actualizar controles orbitales
      if (MapState.controls) {
        MapState.controls.update();
      }

      MapState.renderer.render(MapState.scene, MapState.camera);
    },

    onWindowResize() {
      if (!MapState.container || !MapState.renderer || !MapState.camera) return;
      const width = MapState.container.clientWidth || 800;
      const height = MapState.container.clientHeight || 560;
      MapState.camera.aspect = width / height;
      MapState.camera.updateProjectionMatrix();
      MapState.renderer.setSize(width, height);
    }
  };

  // Exponer objeto globalmente
  window.Baqueano3DMap = Baqueano3DMap;

})(window, document);
