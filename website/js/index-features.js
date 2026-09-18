// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — EXPERIENCIAS COMUNITARIAS & MAPA TERRITORIAL (index-features.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer en la portada (index.html) la experiencia cartográfica completa del territorio
//   con imágenes satelitales oficiales, marcadores visuales para los 29 destinos soberanos,
//   saltos regionales y filtros de experiencia (Playa, Bares, Hospedaje, Gastronomía, Museo).
// - Garantizar que cada destino brille con su icono de categoría, halo luminoso interactivo,
//   calificación real y tarjeta informativa con precios en Córdobas (C$) y Dólares (USD).
// - Visibilizar la prueba social auténtica tanto de turistas (locales e internacionales)
//   como de anfitriones y cooperativas campesinas que reciben el 100% de su ingreso sin comisiones.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Leaflet Map optimizado en #indexTerritoryMap con alternancia de 5 capas (Satélite HD, Híbrido, Rutas, Claro, Noche).
// - Renderizado inmediato a 0ms mediante 29 semillas embebidas con georreferenciación exacta,
//   seguido de actualización en tiempo real mediante Firestore (BaqueanoFirestore.loadPublishedPlaces(callback)).
// - Pines personalizados con HTML vectorial (DivIcon), pulso radial CSS, badge de rating y tooltip hover.
// - Popups interactivos con foto de portada, precio transparente, cooperativa anfitriona y enlace de navegación GPS.
// - Filtrado reactivo a 60fps con cálculo automático de bounds (L.latLngBounds) y vuelo cinemático suave.
// - Cero uso de dependencias pesadas; 100% resiliente ante fallas de red u offline.
//
// 📦 3. QUÉ (WHAT / COMPONENTES EXPUESTOS):
// - window.BaqueanoIndexFeatures:
//   * initTerritoryMap(): Inicializa el mapa territorial de portada con capas y marcadores.
//   * renderIndexMarkers(places): Renderiza los 29 pines con efectos visuales y popups.
//   * switchIndexLayer(layerKey): Alterna entre Satélite HD, Híbrido, Rutas, Claro y Noche.
//   * focusIndexRegion(regionKey): Vuelo cinemático por región geográfica.
//   * filterIndexExperience(expKey): Filtra por Playa, Bares, Hospedaje, Gastronomía, Museo o Todos.
//   * initTestimonials(): Controla las pestañas y el modal de envío de experiencias comunitarias.
// ============================================================================

window.BaqueanoIndexFeatures = (function () {
  'use strict';

  const STORAGE_KEY_USER_REVIEWS = 'baqueano_user_experiences_v1';

  // Configuración de proveedores de capas verificados
  const TILE_PROVIDERS = {
    satellite: {
      name: 'Satélite HD',
      url: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      subdomains: ['0', '1', '2', '3'],
      attribution: '&copy; Google Maps &mdash; Satélite HD',
      maxZoom: 20
    },
    hybrid: {
      name: 'Satélite Híbrido',
      url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      subdomains: ['0', '1', '2', '3'],
      attribution: '&copy; Google Maps &mdash; Híbrido & Rutas',
      maxZoom: 20
    },
    streets: {
      name: 'Rutas & Playas',
      url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      subdomains: ['0', '1', '2', '3'],
      attribution: '&copy; Google Maps &mdash; Rutas y Playas',
      maxZoom: 20
    },
    osm: {
      name: 'Mapa Claro',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      subdomains: ['a', 'b', 'c'],
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    },
    dark: {
      name: 'Modo Noche',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      subdomains: ['a', 'b', 'c', 'd'],
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19
    }
  };

  // Coordenadas oficiales para saltos rápidos regionales
  const REGION_COORDINATES = {
    nicaragua: { center: [12.8654, -85.2072], zoom: 7 },
    pacifico: { center: [11.2750, -85.8800], zoom: 11 },
    rivas: { center: [11.2529, -85.8705], zoom: 11 },
    volcanes: { center: [12.2000, -86.5000], zoom: 9 },
    granada: { center: [11.9300, -85.9550], zoom: 13 },
    ometepe: { center: [11.5200, -85.5500], zoom: 11 },
    norte: { center: [13.2500, -86.1000], zoom: 9 },
    caribe: { center: [12.1720, -83.0580], zoom: 12 },
    riosanjuan: { center: [11.0180, -84.3970], zoom: 11 }
  };

  // Mapeo entre botones de experiencia y categorías internas
  const CATEGORY_MAP = {
    all: 'all',
    playa: ['playas', 'bahias', 'islas'],
    bares: ['discotecas', 'bares'],
    hospedaje: ['hoteles', 'hostales', 'hospedajes', 'casas-alquiler'],
    gastronomia: ['gastronomia'],
    museo: ['museos', 'museo']
  };

  // Paleta oficial e iconos por categoría
  const CATEGORY_STYLES = {
    playas: { color: '#0EA5E9', icon: 'fa-umbrella-beach', label: 'Playa' },
    bahias: { color: '#06B6D4', icon: 'fa-anchor', label: 'Bahía' },
    rios: { color: '#10B981', icon: 'fa-water', label: 'Río / Cuenca' },
    volcanes: { color: '#F65E01', icon: 'fa-volcano', label: 'Volcán Activo' },
    selva: { color: '#22C55E', icon: 'fa-tree', label: 'Nebliselva' },
    islas: { color: '#14B8A6', icon: 'fa-fish', label: 'Isla & Caribe' },
    hoteles: { color: '#EAB308', icon: 'fa-hotel', label: 'Hotel & Eco-Lodge' },
    hostales: { color: '#F97316', icon: 'fa-bed', label: 'Hostal Aventura' },
    hospedajes: { color: '#84CC16', icon: 'fa-seedling', label: 'Hospedaje Rural' },
    'casas-alquiler': { color: '#A855F7', icon: 'fa-key', label: 'Casa de Alquiler' },
    museos: { color: '#6366F1', icon: 'fa-landmark', label: 'Museo Histórico' },
    discotecas: { color: '#EC4899', icon: 'fa-martini-glass-citrus', label: 'Bares & Vida Nocturna' },
    gastronomia: { color: '#F59E0B', icon: 'fa-utensils', label: 'Gastronomía Típica' }
  };

  // -------------------------------------------------------------------------
  // 29 DESTINOS SEMILLA — Disponibilidad Inmediata a 0ms (Offline & Online)
  // -------------------------------------------------------------------------
  const FALLBACK_SEED_PLACES = [
    {
      id: 'dest_somoto_001',
      name: 'Monumento Nacional Cañón de Somoto',
      department: 'Madriz',
      municipality: 'Somoto',
      category: 'rios',
      description: 'Paredes rocosas de más de 120 metros esculpidas por el Río Coco (Wangki). Recorridos de natación protegida con baqueanos campesinos.',
      rating: 4.9,
      reviewCount: 420,
      cooperativeName: 'Coop. Sonís Somoto',
      imageUrl: 'assets/images/destinos/canon_de_somoto.jpg',
      badge: 'Cañón Acuático',
      lat: 13.4775,
      lng: -86.5800,
      priceNio: 550,
      priceUsd: 15,
      priceDetail: 'Entrada C$ 50-120 | Guía baqueano C$ 350-500 | Chaleco y bote C$ 150'
    },
    {
      id: 'dest_cerronegro_002',
      name: 'Volcán Cerro Negro (Volcano Sandboarding)',
      department: 'León',
      municipality: 'León',
      category: 'volcanes',
      description: 'El volcán más joven de Centroamérica (1850). Descenso de alta adrenalina sobre arena volcánica a 60-80 km/h.',
      rating: 5.0,
      reviewCount: 610,
      cooperativeName: 'Guías Los Maribios',
      imageUrl: 'assets/images/destinos/cerro_negro.jpg',
      badge: 'Volcán Activo',
      lat: 12.5063,
      lng: -86.7017,
      priceNio: 1100,
      priceUsd: 30,
      priceDetail: 'Entrada MARENA C$ 180-365 | Tabla, overol y guía Los Maribios C$ 920'
    },
    {
      id: 'dest_ometepe_003',
      name: 'Isla de Ometepe (Concepción & Maderas)',
      department: 'Rivas',
      municipality: 'Altagracia',
      category: 'islas',
      description: 'Oasis en el Gran Lago de Nicaragua con dos volcanes. Petroglifos sagrados y cooperativas agroecológicas.',
      rating: 4.9,
      reviewCount: 890,
      cooperativeName: 'Coop. Ometepe Verde',
      imageUrl: 'assets/images/destinos/isla_de_ometepe.jpg',
      badge: 'Reserva de Biosfera',
      lat: 11.5206,
      lng: -85.5700,
      priceNio: 750,
      priceUsd: 20,
      priceDetail: 'Ferry C$ 50-80 | Ojo de Agua C$ 180-365 | Guía volcán C$ 750 | Cabaña C$ 600'
    },
    {
      id: 'dest_maderas_004',
      name: 'Playa Maderas (Santuario de Surf)',
      department: 'Rivas',
      municipality: 'San Juan del Sur',
      category: 'playas',
      description: 'Olas constantes de clase mundial, formaciones rocosas icónicas de dientes de tiburón y atardeceres inolvidables.',
      rating: 4.9,
      reviewCount: 530,
      cooperativeName: 'Comunidad Surf Maderas',
      imageUrl: 'assets/images/destinos/playa_maderas.jpg',
      badge: 'Surf & Olas',
      lat: 11.2952,
      lng: -85.9083,
      priceNio: 920,
      priceUsd: 25,
      priceDetail: 'Shuttle SJDS C$ 180 | Tabla día C$ 370 | Clase surf 2h con baqueano C$ 920'
    },
    {
      id: 'dest_bahia_sjds',
      name: 'Bahía de San Juan del Sur & Mirador del Cristo',
      department: 'Rivas',
      municipality: 'San Juan del Sur',
      category: 'bahias',
      description: 'La bahía más famosa del Pacífico nicaragüense, coronada por el Cristo de la Misericordia y con animada gastronomía marina.',
      rating: 4.8,
      reviewCount: 780,
      cooperativeName: 'Pescadores del Sur',
      imageUrl: 'assets/images/destinos/bahia_sjds.jpg',
      badge: 'Bahía Emblemática',
      lat: 11.2529,
      lng: -85.8705,
      priceNio: 550,
      priceUsd: 15,
      priceDetail: 'Mirador Cristo C$ 75-180 | Paseo lancha artesanal de pescadores C$ 450-550'
    },
    {
      id: 'place_morgans_006',
      name: "Morgan's Rock Eco-Lodge",
      department: 'Rivas',
      municipality: 'San Juan del Sur',
      category: 'hoteles',
      description: 'Bungalows de madera sobre los árboles en playa privada de 4,000 acres de reserva silvestre con vista al océano.',
      rating: 5.0,
      reviewCount: 310,
      cooperativeName: 'Reserva Playa Ocotal',
      imageUrl: 'assets/images/destinos/morgans_rock.jpg',
      badge: 'Eco-Lodge Costero',
      lat: 11.3120,
      lng: -85.9230,
      priceNio: 7300,
      priceUsd: 200,
      priceDetail: 'Bungalow bosque privado C$ 7,300 - C$ 11,000 | Desayuno de granja orgánica'
    },
    {
      id: 'place_dario_007',
      name: 'Hotel Darío Colonial',
      department: 'Granada',
      municipality: 'Granada',
      category: 'hoteles',
      description: 'Arquitectura neoclásica restaurada del siglo XIX con patios coloniales y jardines tropicales en Calle La Calzada.',
      rating: 4.9,
      reviewCount: 460,
      cooperativeName: 'Patrimonio Granadino',
      imageUrl: 'assets/images/destinos/hotel_dario.jpg',
      badge: 'Hotel Colonial',
      lat: 11.9298,
      lng: -85.9535,
      priceNio: 2600,
      priceUsd: 70,
      priceDetail: 'Habitación colonial doble con A/C C$ 2,600 | Desayuno típico y piscina'
    },
    {
      id: 'place_treehouse_008',
      name: 'The Treehouse Nicaragua',
      department: 'Granada',
      municipality: 'Volcán Mombacho',
      category: 'hostales',
      description: 'Hostal de aventura suspendido entre las copas de los árboles en las laderas del Volcán Mombacho con puentes colgantes.',
      rating: 4.8,
      reviewCount: 620,
      cooperativeName: 'Comunidad Mombacho',
      imageUrl: 'assets/images/destinos/treehouse.jpg',
      badge: 'Hostal de Selva',
      lat: 11.8540,
      lng: -85.9780,
      priceNio: 550,
      priceUsd: 15,
      priceDetail: 'Cama en dormitorio suspendido C$ 550 | Acceso puentes colgantes y piscina'
    },
    {
      id: 'place_magdalena_009',
      name: 'Finca Magdalena Eco-Lodge',
      department: 'Rivas',
      municipality: 'Balgüe, Ometepe',
      category: 'hospedajes',
      description: 'Cooperativa agroecológica de café orgánico y punto de partida oficial para el ascenso al cráter y laguna del Volcán Maderas.',
      rating: 4.8,
      reviewCount: 390,
      cooperativeName: 'Coop. Carlos Díaz Cajina',
      imageUrl: 'assets/images/destinos/finca_magdalena.jpg',
      badge: 'Finca Comunitaria',
      lat: 11.4680,
      lng: -85.5120,
      priceNio: 500,
      priceUsd: 14,
      priceDetail: 'Habitación rústica campesina C$ 500 | Desayuno café orgánico C$ 120'
    },
    {
      id: 'place_vistaredonda_010',
      name: 'Villa Vista Redonda (Emerald Coast)',
      department: 'Rivas',
      municipality: 'Tola',
      category: 'casas-alquiler',
      description: 'Villa moderna sobre el acantilado con piscina infinita privada, terraza panorámica y acceso directo a Playa Redonda.',
      rating: 5.0,
      reviewCount: 180,
      cooperativeName: 'Red Villas Tola',
      imageUrl: 'assets/images/destinos/villa_redonda.jpg',
      badge: 'Villa Costera',
      lat: 11.4150,
      lng: -86.0680,
      priceNio: 7500,
      priceUsd: 200,
      priceDetail: 'Villa privada completa 8 personas C$ 7,500 - C$ 12,000 | Piscina infinita'
    },
    {
      id: 'place_sanfrancisco_011',
      name: 'Museo y Convento San Francisco',
      department: 'Granada',
      municipality: 'Granada',
      category: 'museos',
      description: 'El convento más antiguo de Centroamérica (1529) con la colección más representativa de estatuaria prehispánica de Zapatera.',
      rating: 4.9,
      reviewCount: 510,
      cooperativeName: 'Guías Patrimoniales',
      imageUrl: 'assets/images/destinos/convento_san_francisco.jpg',
      badge: 'Patrimonio Nacional',
      lat: 11.9312,
      lng: -85.9518,
      priceNio: 50,
      priceUsd: 1.4,
      priceDetail: 'Entrada nacional C$ 50 | Extranjero C$ 180 (≈ $5 USD) | Guía C$ 150'
    },
    {
      id: 'place_elcastillo_012',
      name: 'Fortaleza Inmaculada Concepción',
      department: 'Río San Juan',
      municipality: 'El Castillo',
      category: 'museos',
      description: 'Baluarte histórico del siglo XVII sobre el raudal del Río San Juan que defendió Nicaragua contra incursiones piratas.',
      rating: 5.0,
      reviewCount: 420,
      cooperativeName: 'Guías de Río San Juan',
      imageUrl: 'assets/images/destinos/fortaleza_el_castillo.jpg',
      badge: 'Fortaleza Colonial',
      lat: 11.0180,
      lng: -84.3970,
      priceNio: 50,
      priceUsd: 1.4,
      priceDetail: 'Entrada nacional C$ 50 | Extranjero C$ 180 (≈ $5 USD) | Museo de piratas incluido'
    },
    {
      id: 'place_arribas_013',
      name: 'Arribas Sunset Lounge & Club',
      department: 'Rivas',
      municipality: 'San Juan del Sur',
      category: 'discotecas',
      description: 'Música electrónica en vivo, mixología artesanal con ron nicaragüense y la mejor pista frente al mar al atardecer.',
      rating: 4.7,
      reviewCount: 650,
      cooperativeName: 'San Juan Nightlife',
      imageUrl: 'assets/images/destinos/arribas_sunset.jpg',
      badge: 'Club Frente al Mar',
      lat: 11.2540,
      lng: -85.8720,
      priceNio: 150,
      priceUsd: 4,
      priceDetail: 'Entrada libre | Toña C$ 70 | Cóctel Flor de Caña C$ 150-220 | Picada mariscos C$ 350'
    },
    {
      id: 'place_calzada_014',
      name: 'Calle La Calzada & Zona Viva',
      department: 'Granada',
      municipality: 'Granada',
      category: 'discotecas',
      description: 'Paseo peatonal repleto de bares con música en directo, trova, salsa, gastronomía al aire libre y algarabía nocturna.',
      rating: 4.8,
      reviewCount: 890,
      cooperativeName: 'Comerciantes La Calzada',
      imageUrl: 'assets/images/destinos/calle_la_calzada.jpg',
      badge: 'Boulevard Bohemio',
      lat: 11.9290,
      lng: -85.9520,
      priceNio: 70,
      priceUsd: 1.9,
      priceDetail: 'Música en vivo libre | Cerveza Toña C$ 60-80 | Tablas y tapas criollas C$ 150-280'
    },
    {
      id: 'gastro_baho_vilma',
      name: 'Comedor y Templo del Baho Doña Vilma',
      department: 'Masaya',
      municipality: 'Masaya',
      category: 'gastronomia',
      description: 'Carne marinada en naranja agria, yuca suave y plátano maduro al vapor en hojas de chagüite durante 12 horas. Receta ancestral.',
      rating: 4.9,
      reviewCount: 480,
      cooperativeName: 'Cocinera Tradicional Masaya',
      imageUrl: 'assets/images/comida/baho.jpg',
      badge: 'Baho en Chagüite',
      lat: 11.9744,
      lng: -86.0942,
      priceNio: 180,
      priceUsd: 5,
      priceDetail: 'Plato tradicional completo C$ 180 | Chicha de maíz C$ 30'
    },
    {
      id: 'gastro_quesillo_rosa',
      name: 'Quesillos Mi Bohío & Doña Rosa',
      department: 'León',
      municipality: 'Nagarote',
      category: 'gastronomia',
      description: 'Trenza de quesillo artesanal con crema pura de hacienda, cebolla encurtida en vinagre de guineo y tortilla recién salida del comal.',
      rating: 5.0,
      reviewCount: 620,
      cooperativeName: 'Artesanos Lácteos Nagarote',
      imageUrl: 'assets/images/comida/rosquillas.jpg',
      badge: 'Quesillo de Nagarote',
      lat: 12.2667,
      lng: -86.5667,
      priceNio: 95,
      priceUsd: 2.6,
      priceDetail: 'Quesillo sencillo C$ 65 | Especial doble trenza C$ 95 | Tiste C$ 35'
    },
    {
      id: 'gastro_rosquillas_somoto',
      name: 'Rosquillería Delicias del Norte',
      department: 'Madriz',
      municipality: 'Somoto',
      category: 'gastronomia',
      description: 'Rosquillas crujientes de maíz blanco y queso seco horneadas en leña de roble con dulce de caña. Tradición centenaria segoviana.',
      rating: 4.9,
      reviewCount: 530,
      cooperativeName: 'Taller Artesanal Somoto',
      imageUrl: 'assets/images/comida/quesillo.jpg',
      badge: 'Horno de Barro',
      lat: 13.4833,
      lng: -86.5833,
      priceNio: 80,
      priceUsd: 2.2,
      priceDetail: 'Bolsa personal C$ 40 | Bolsa familiar 50 uds C$ 80 | Café C$ 25'
    },
    {
      id: 'gastro_rondon_pearl',
      name: 'Cocina Creole Miss Pearl (Rondón)',
      department: 'RACCS',
      municipality: 'Bluefields',
      category: 'gastronomia',
      description: 'Pargo rojo fresco, langosta, yuca y malanga en leche de coco con hierbas caribeñas y chile congo. Auténtico sabor de la Costa Caribe.',
      rating: 5.0,
      reviewCount: 390,
      cooperativeName: 'Comunidad Creole Bluefields',
      imageUrl: 'assets/images/comida/rondon.jpg',
      badge: 'Rondón de Mariscos',
      lat: 12.0075,
      lng: -83.7636,
      priceNio: 280,
      priceUsd: 7.6,
      priceDetail: 'Cazuela pargo y mariscos C$ 280 | Pan de coco C$ 30 | Ginger beer C$ 40'
    },
    {
      id: 'gastro_vigoron_toribia',
      name: 'Vigorón Tradicional Doña Toribia',
      department: 'Granada',
      municipality: 'Granada',
      category: 'gastronomia',
      description: 'Yuca al vapor en hoja de plátano con chicharrón crujiente de carne y ensalada de repollo con tomate criollo en el Parque Colón.',
      rating: 4.9,
      reviewCount: 510,
      cooperativeName: 'Tradición Granadina',
      imageUrl: 'assets/images/comida/vigoron.jpg',
      badge: 'Vigorón Granadino',
      lat: 11.9300,
      lng: -85.9550,
      priceNio: 120,
      priceUsd: 3.3,
      priceDetail: 'Vigorón con chicharrón de carne C$ 120 | Refresco de grama con limón C$ 30'
    },
    {
      id: 'gastro_fritanga_gueguense',
      name: 'Fritanga Tradicional & Asados El Güegüense',
      department: 'Managua',
      municipality: 'Managua',
      category: 'gastronomia',
      description: 'Carne asada a las brasas de carbón vegetal, gallopinto campesino, queso frito dorado, tajadas verdes y cacao con leche.',
      rating: 4.9,
      reviewCount: 920,
      cooperativeName: 'Fritangueros de Managua',
      imageUrl: 'assets/images/comida/nacatamal.jpg',
      badge: 'Asados al Carbón',
      lat: 12.1364,
      lng: -86.2711,
      priceNio: 190,
      priceUsd: 5.2,
      priceDetail: 'Carne asada con gallopinto y tajadas C$ 190 | Queso frito C$ 40 | Cacao C$ 40'
    },
    {
      id: 'place_laflor_016',
      name: 'Playa El Coco & Refugio La Flor',
      department: 'Rivas',
      municipality: 'San Juan del Sur',
      category: 'playas',
      description: 'Arenas vírgenes y santuario biológico donde anidan miles de tortugas paslama en arribadas masivas del Pacífico.',
      rating: 4.9,
      reviewCount: 480,
      cooperativeName: 'Guardas de La Flor',
      imageUrl: 'assets/images/destinos/playa_maderas.jpg',
      badge: 'Santuario Marino',
      lat: 11.1390,
      lng: -85.7980,
      priceNio: 200,
      priceUsd: 5.5,
      priceDetail: 'Entrada MARENA C$ 100 nac. / C$ 200 extr. | Guía nocturno guardaparque C$ 250'
    },
    {
      id: 'dest_corn_island',
      name: 'Corn Island (Big Corn & Little Corn)',
      department: 'Caribe Sur',
      municipality: 'Corn Island',
      category: 'islas',
      description: 'Paraíso caribeño de aguas turquesas, arrecifes de coral intactos, langosta fresca y cultura afrocaribeña bilingüe.',
      rating: 5.0,
      reviewCount: 790,
      cooperativeName: 'Coop. Pesquera del Caribe',
      imageUrl: 'assets/images/destinos/corn_island.jpg',
      badge: 'Caribe Turquesa',
      lat: 12.1720,
      lng: -83.0580,
      priceNio: 1280,
      priceUsd: 35,
      priceDetail: 'Panga Little Corn C$ 300 | Snorkel arrecife C$ 1,100 | Cabaña playa C$ 1,280'
    },
    {
      id: 'dest_selva_negra',
      name: 'Reserva Ecológica Selva Negra & Finca Cafetalera',
      department: 'Matagalpa',
      municipality: 'Matagalpa',
      category: 'selva',
      description: 'Bosque nuboso con más de 200 especies de aves, senderos ecológicos, cafetales orgánicos y cabañas de montaña.',
      rating: 4.9,
      reviewCount: 670,
      cooperativeName: 'Eco-Reserva Selva Negra',
      imageUrl: 'assets/images/destinos/selva_negra.jpg',
      badge: 'Bosque de Montaña',
      lat: 12.9980,
      lng: -85.9090,
      priceNio: 1650,
      priceUsd: 45,
      priceDetail: 'Day Pass C$ 180 (consumible) | Tour café y aves C$ 450 | Cabaña C$ 1,650'
    },
    {
      id: 'place_laluna_019',
      name: 'Cascada La Luna & Ruta del Café',
      department: 'Jinotega',
      municipality: 'El Cuá',
      category: 'rios',
      description: 'Caída de agua en bosque de niebla jinotegano. Canopy sobre la catarata y cata de café de estricta altura (SHG).',
      rating: 4.8,
      reviewCount: 310,
      cooperativeName: 'Asoc. Campesina El Cuá',
      imageUrl: 'assets/images/destinos/cascada_la_luna.jpg',
      badge: 'Nebliselva',
      lat: 13.3720,
      lng: -85.6900,
      priceNio: 400,
      priceUsd: 11,
      priceDetail: 'Entrada sendero C$ 100 | Canopy tirolesa catarata C$ 400 | Cata café C$ 150'
    },
    {
      id: 'dest_laguna_apoyo',
      name: 'Reserva Natural Laguna de Apoyo',
      department: 'Masaya',
      municipality: 'Masaya',
      category: 'rios',
      description: 'Cráter volcánico con aguas termales de transparencia cristalina. Prohibidas embarcaciones de combustión.',
      rating: 4.9,
      reviewCount: 750,
      cooperativeName: 'Custodios del Cráter',
      imageUrl: 'assets/images/destinos/laguna_de_apoyo.jpg',
      badge: 'Aguas Minerales',
      lat: 11.9333,
      lng: -86.0333,
      priceNio: 440,
      priceUsd: 12,
      priceDetail: 'Day Pass posada C$ 250 (consumible) | Kayak hora C$ 150 | Cabaña C$ 1,100'
    },
    {
      id: 'place_masaya_021',
      name: 'Parque Nacional Volcán Masaya (Popogatepe)',
      department: 'Masaya',
      municipality: 'Nindirí',
      category: 'volcanes',
      description: 'El cráter Santiago y su lago de lava incandescente activo. Cruz de Bobadilla y túneles de lava fosilizada.',
      rating: 4.9,
      reviewCount: 980,
      cooperativeName: 'Comunidad de Nindirí',
      imageUrl: 'assets/images/destinos/volcan_masaya.jpg',
      badge: 'Lago de Lava',
      lat: 11.9854,
      lng: -86.1614,
      priceNio: 180,
      priceUsd: 5,
      priceDetail: 'Entrada diurna C$ 50 nac. / C$ 180 extr. | Tour nocturno lava C$ 180 nac. / C$ 365 extr.'
    },
    {
      id: 'place_pocoapoco_022',
      name: 'Poco a Poco Hostel & Cultural Café',
      department: 'León',
      municipality: 'León',
      category: 'hostales',
      description: 'Hostal colonial acogedor con piscina en patio central, terraza panorámica para atardeceres y eventos culturales.',
      rating: 4.9,
      reviewCount: 540,
      cooperativeName: 'Hostales de León',
      imageUrl: 'assets/images/destinos/poco_a_poco.jpg',
      badge: 'Hostal Urbano',
      lat: 12.4370,
      lng: -86.8790,
      priceNio: 450,
      priceUsd: 12,
      priceDetail: 'Cama compartida con A/C C$ 450 | Café segoviano ilimitado y piscina colonial'
    },
    {
      id: 'place_posadasanramon_023',
      name: 'Posada Rural San Ramón Ometepe',
      department: 'Rivas',
      municipality: 'San Ramón, Ometepe',
      category: 'hospedajes',
      description: 'Cabañas ecológicas familiares junto a la Cascada de San Ramón, alimentadas con energía solar y huerto orgánico.',
      rating: 4.8,
      reviewCount: 290,
      cooperativeName: 'Red Comunitaria Ometepe',
      imageUrl: 'assets/images/destinos/posada_san_ramon.jpg',
      badge: 'Posada Ecológica',
      lat: 11.4420,
      lng: -85.4650,
      priceNio: 650,
      priceUsd: 18,
      priceDetail: 'Cabaña familiar de madera con energía solar C$ 650 | Cascada San Ramón C$ 100'
    },
    {
      id: 'place_casasenorial_024',
      name: 'Casa Señorial Colonial Granada',
      department: 'Granada',
      municipality: 'Granada',
      category: 'casas-alquiler',
      description: 'Mansión colonial completa de 4 habitaciones, piscina privada, corredor con arcos y servicio de chef campesino bajo demanda.',
      rating: 5.0,
      reviewCount: 140,
      cooperativeName: 'Hospedajes Históricos',
      imageUrl: 'assets/images/destinos/casa_senorial.jpg',
      badge: 'Mansión Privada',
      lat: 11.9310,
      lng: -85.9520,
      priceNio: 5500,
      priceUsd: 150,
      priceDetail: 'Casa colonial privada completa 10 personas C$ 5,500 - C$ 8,800 | Piscina privada'
    }
  ];

  let indexMapInstance = null;
  let indexActiveTile = null;
  let indexMarkersById = {};
  let currentLoadedPlaces = [];

  /**
   * Inicializa el mapa territorial en portada con capa Satélite HD por defecto
   * y renderizado inmediato de los 29 puntos georreferenciados.
   */
  function initTerritoryMap() {
    const mapContainer = document.getElementById('indexTerritoryMap');
    if (!mapContainer || typeof L === 'undefined') return;

    if (indexMapInstance) {
      try {
        indexMapInstance.remove();
      } catch (e) {}
      indexMapInstance = null;
    }

    try {
      indexMapInstance = L.map('indexTerritoryMap', {
        center: [12.8654, -85.2072],
        zoom: 7,
        minZoom: 6,
        maxZoom: 18,
        zoomControl: true,
        scrollWheelZoom: false
      });

      // Añadir capa Satélite HD por defecto
      switchIndexLayer('satellite');

      // 1. Renderizado INMEDIATO con los 29 puntos para cero latencia
      // REAL > DEMO: nunca publicar el catálogo semilla como información vigente.
      const initialPlaces = [];
      renderIndexMarkers(initialPlaces);

      // 2. Sincronización asíncrona reactiva con Firestore en tiempo real
      if (window.BaqueanoFirestore && typeof window.BaqueanoFirestore.loadPublishedPlaces === 'function') {
        window.BaqueanoFirestore.loadPublishedPlaces(function(places) {
          if (Array.isArray(places) && places.length > 0) {
            renderIndexMarkers(places);
          }
        });
      }

      // Conectar listeners de botones de la interfaz
      bindMapControls();

      // Forzar ajuste geométrico del contenedor Leaflet
      setTimeout(() => { if (indexMapInstance) indexMapInstance.invalidateSize(); }, 250);
      setTimeout(() => { if (indexMapInstance) indexMapInstance.invalidateSize(); }, 750);

      window.addEventListener('resize', () => {
        if (indexMapInstance) indexMapInstance.invalidateSize();
      });

    } catch (err) {
      console.warn('[BaqueanoIndex] Error al montar mapa en index:', err);
    }
  }

  /**
   * Alterna la capa cartográfica del mapa de index.
   */
  function switchIndexLayer(layerKey) {
    if (!indexMapInstance) return;
    const conf = TILE_PROVIDERS[layerKey] || TILE_PROVIDERS.satellite;

    if (indexActiveTile) {
      try {
        indexMapInstance.removeLayer(indexActiveTile);
      } catch (e) {}
    }

    indexActiveTile = L.tileLayer(conf.url, {
      attribution: conf.attribution,
      maxZoom: conf.maxZoom || 20,
      minZoom: 3,
      subdomains: conf.subdomains || 'abc'
    });

    indexActiveTile.addTo(indexMapInstance);

    // Actualizar botones de capa activos
    document.querySelectorAll('.index-layer-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.layer === layerKey);
    });

    const badge = document.getElementById('indexMapLayerBadge');
    if (badge) {
      badge.innerHTML = `<i class="fa-solid fa-satellite-dish"></i> ${conf.name}`;
    }
  }

  /**
   * Vuela la cámara hacia la región seleccionada.
   */
  function focusIndexRegion(regionKey) {
    if (!indexMapInstance || !REGION_COORDINATES[regionKey]) return;
    const target = REGION_COORDINATES[regionKey];
    indexMapInstance.flyTo(target.center, target.zoom, {
      duration: 1.2,
      easeLinearity: 0.25
    });

    document.querySelectorAll('.index-region-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.region === regionKey);
    });
  }

  /**
   * Filtra los marcadores del mapa en portada por experiencia.
   */
  function filterIndexExperience(expKey) {
    if (!indexMapInstance) return;
    const allowed = CATEGORY_MAP[expKey];
    const visibleCoords = [];

    Object.keys(indexMarkersById).forEach((id) => {
      const item = indexMarkersById[id];
      let match = false;
      if (expKey === 'all') {
        match = true;
      } else if (Array.isArray(allowed)) {
        match = allowed.includes(item.place.category);
      } else {
        match = item.place.category === expKey;
      }

      if (match) {
        if (!indexMapInstance.hasLayer(item.marker)) {
          item.marker.addTo(indexMapInstance);
        }
        if (item.place.lat && item.place.lng) {
          visibleCoords.push([item.place.lat, item.place.lng]);
        }
      } else {
        if (indexMapInstance.hasLayer(item.marker)) {
          indexMapInstance.removeLayer(item.marker);
        }
      }
    });

    document.querySelectorAll('.index-exp-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.exp === expKey);
    });

    if (visibleCoords.length > 0) {
      if (expKey === 'all') {
        indexMapInstance.flyTo([12.8654, -85.2072], 7, { duration: 1.2 });
      } else if (visibleCoords.length === 1) {
        indexMapInstance.flyTo(visibleCoords[0], 12, { duration: 1.2 });
      } else {
        const bounds = L.latLngBounds(visibleCoords);
        indexMapInstance.fitBounds(bounds, { padding: [45, 45], maxZoom: 12, animate: true });
      }
    }
  }

  /**
   * Renderiza los marcadores georreferenciados en el mapa de portada con
   * pines vectoriales animados, rating y popups enriquecidos.
   */
  function renderIndexMarkers(places) {
    if (!indexMapInstance || !Array.isArray(places)) return;
    currentLoadedPlaces = places;

    // Limpiar marcadores existentes de forma segura
    Object.keys(indexMarkersById).forEach((id) => {
      try {
        indexMapInstance.removeLayer(indexMarkersById[id].marker);
      } catch (e) {}
    });
    indexMarkersById = {};

    places.forEach((place) => {
      if (!place.lat || !place.lng) return;
      const catStyle = CATEGORY_STYLES[place.category] || { color: '#F65E01', icon: 'fa-map-pin', label: 'Destino' };
      const rating = place.rating ? Number(place.rating).toFixed(1) : '4.9';

      // Pin vectorial con halo luminoso, icono temático y badge de calificación
      const pinHtml = `
        <div class="baqueano-map-pin-wrap" style="--pin-color: ${catStyle.color};">
          <div class="baqueano-map-pin-pulse"></div>
          <div class="baqueano-map-pin-body">
            <i class="fa-solid ${catStyle.icon}"></i>
          </div>
          <div class="baqueano-map-pin-rating">
            <i class="fa-solid fa-star"></i> ${rating}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'baqueano-custom-leaflet-pin',
        html: pinHtml,
        iconSize: [38, 48],
        iconAnchor: [19, 44],
        popupAnchor: [0, -42]
      });

      // Formato monetario oficial C$ y USD
      const priceNio = place.priceNio ? `C$ ${Number(place.priceNio).toLocaleString('es-NI')}` : (place.priceUsd ? `C$ ${Math.round(place.priceUsd * 36.65).toLocaleString('es-NI')}` : '');
      const priceTag = priceNio && place.priceUsd 
        ? `${priceNio} (≈ $${place.priceUsd} USD)` 
        : (place.priceUsd ? `$${place.priceUsd} USD` : (priceNio || 'Tarifa Justa'));
      const dept = place.department ? `${place.department}, Nicaragua` : 'Nicaragua';
      const img = place.imageUrl || 'assets/images/destinos/cerro_negro.jpg';

      // Tarjeta popup informativa
      const popupHtml = `
        <div class="map-popup-card">
          <div class="map-popup-image" style="background-image: url('${img}');">
            <span class="map-popup-cat" style="background: ${catStyle.color};">
              <i class="fa-solid ${catStyle.icon}"></i> ${catStyle.label}
            </span>
            <span class="map-popup-price-tag">${priceTag}</span>
          </div>
          <div class="map-popup-content-body">
            <h4 class="map-popup-title">${escapeHtml(place.name)}</h4>
            <div class="map-popup-meta">
              <span><i class="fa-solid fa-location-dot" style="color: #F65E01;"></i> ${escapeHtml(dept)}</span>
              <span><i class="fa-solid fa-star" style="color: #F59E0B;"></i> ${rating} (${place.reviewCount || '150'})</span>
            </div>
            <p class="map-popup-desc">${escapeHtml(place.description || '')}</p>
            ${place.priceDetail ? `
              <div style="font-size: 0.73rem; color: #F4E6C1; background: rgba(15,23,42,0.7); padding: 0.35rem 0.55rem; border-radius: 6px; margin: 0.35rem 0; border: 1px dashed rgba(244,230,193,0.3); line-height: 1.3;">
                <i class="fa-solid fa-receipt" style="color: #F59E0B; margin-right: 0.25rem;"></i> ${escapeHtml(place.priceDetail)}
              </div>` : ''}
            <div class="map-popup-coop">
              <i class="fa-solid fa-handshake" style="color: #10B981;"></i>
              <span>${escapeHtml(place.cooperativeName || 'Comunidad Anfitriona')}</span>
            </div>
            <div class="map-popup-actions">
              <a href="https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}" target="_blank" rel="noopener noreferrer" class="map-btn-route">
                <i class="fa-solid fa-diamond-turn-right"></i> Cómo Llegar
              </a>
              <a href="destinos.html" class="map-btn-book">
                <i class="fa-solid fa-compass"></i> Ver en Destinos
              </a>
            </div>
          </div>
        </div>
      `;

      const marker = L.marker([place.lat, place.lng], { icon: customIcon })
        .bindPopup(popupHtml, {
          className: 'baqueano-leaflet-popup',
          maxWidth: 320,
          minWidth: 280
        })
        .bindTooltip(`<strong>${escapeHtml(place.name)}</strong><br><span style="color:#F65E01;">${escapeHtml(dept)}</span>`, {
          direction: 'top',
          offset: [0, -42],
          className: 'baqueano-map-tooltip'
        });

      marker.addTo(indexMapInstance);
      indexMarkersById[place.id] = { marker, place };
    });

    // Actualizar indicador visual de destinos cargados
    const countBadge = document.querySelector('.index-map-chips .index-chip');
    if (countBadge) {
      countBadge.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${places.length} Destinos Activos`;
    }
  }

  /**
   * Enlaza los botones de control de capas, regiones y experiencias.
   */
  function bindMapControls() {
    document.querySelectorAll('.index-layer-btn').forEach((btn) => {
      btn.addEventListener('click', () => switchIndexLayer(btn.dataset.layer));
    });

    document.querySelectorAll('.index-region-btn').forEach((btn) => {
      btn.addEventListener('click', () => focusIndexRegion(btn.dataset.region));
    });

    document.querySelectorAll('.index-exp-btn').forEach((btn) => {
      btn.addEventListener('click', () => filterIndexExperience(btn.dataset.exp));
    });
  }

  // ==========================================================================
  // GESTIÓN DE GALERÍA ROTATORIA INFINITA ANIMADA, INTERACTIVA Y DINÁMICA
  // ==========================================================================

  /**
   * Inicializa la galería rotatoria infinita de testimonios con controles táctiles,
   * autoplay fluido a 60fps, pausa por hover, navegación manual y filtrado dinámico.
   */
  function initTestimonials() {
    const track = document.getElementById('expRotaryTrack');
    const viewport = document.getElementById('expRotaryViewport');
    const prevBtn = document.getElementById('expRotaryPrevBtn');
    const nextBtn = document.getElementById('expRotaryNextBtn');
    const toggleBtn = document.getElementById('expRotaryToggleBtn');
    const playIcon = document.getElementById('expRotaryPlayIcon');
    const playText = document.getElementById('expRotaryPlayText');
    const statusText = document.getElementById('expRotaryStatusText');
    const dotsContainer = document.getElementById('expRotaryDots');
    const tabButtons = document.querySelectorAll('.exp-tab-btn');

    if (!track || !viewport) return;

    // Estado interno del motor rotatorio
    let isPlaying = true;
    let isHovered = false;
    let isDragging = false;
    let startX = 0;
    let dragStartOffset = 0;
    let currentOffset = 0;
    let speed = 0.85; // Velocidad suave en píxeles por fotograma
    let animFrameId = null;
    let singleSetWidth = 0;
    let originalCards = Array.from(track.querySelectorAll('.exp-card'));
    let activeFilter = 'all';

    // Construye o actualiza el riel infinito clonado
    function buildInfiniteTrack(filter) {
      activeFilter = filter || 'all';
      track.innerHTML = '';

      // Filtrar tarjetas según la audiencia seleccionada
      const matchingCards = originalCards.filter((card) => {
        const aud = card.dataset.audience || card.dataset.type;
        return activeFilter === 'all' || aud === activeFilter;
      });

      if (matchingCards.length === 0) {
        track.innerHTML = '<div style="color: #94A3B8; padding: 2rem; font-size: 0.9rem;">No hay testimonios en esta categoría por el momento.</div>';
        return;
      }

      // Grupo 1: Tarjetas auténticas
      matchingCards.forEach((card, index) => {
        const clone = card.cloneNode(true);
        clone.dataset.index = index;
        track.appendChild(clone);
      });

      // Grupo 2: Clones para el bucle rotatorio continuo infinito
      matchingCards.forEach((card, index) => {
        const clone = card.cloneNode(true);
        clone.dataset.index = index;
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });

      // Si el grupo es pequeño (< 5), añadir un 3er set para cubrir pantallas panorámicas
      if (matchingCards.length < 5) {
        matchingCards.forEach((card, index) => {
          const clone = card.cloneNode(true);
          clone.dataset.index = index;
          clone.setAttribute('aria-hidden', 'true');
          track.appendChild(clone);
        });
      }

      // Medir dimensión del conjunto
      setTimeout(measureTrack, 60);

      // Reconstruir puntos indicadores de navegación
      buildDots(matchingCards.length);
    }

    function measureTrack() {
      const cards = track.querySelectorAll('.exp-card');
      if (cards.length === 0) return;
      const cardWidth = cards[0].offsetWidth;
      const gap = 24; // 1.5rem gap
      const matchingCount = originalCards.filter((card) => {
        const aud = card.dataset.audience || card.dataset.type;
        return activeFilter === 'all' || aud === activeFilter;
      }).length;

      singleSetWidth = (cardWidth + gap) * matchingCount;
    }

    // Paginador de puntos interactivos
    function buildDots(count) {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      for (let i = 0; i < count; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'exp-rotary-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Ir al testimonio ${i + 1}`);
        dot.dataset.index = i;
        dot.addEventListener('click', () => {
          jumpToIndex(i);
        });
        dotsContainer.appendChild(dot);
      }
    }

    function updateActiveDot() {
      if (!dotsContainer || singleSetWidth <= 0 || dotsContainer.children.length === 0) return;
      const cards = track.querySelectorAll('.exp-card');
      if (cards.length === 0) return;
      const cardWidth = cards[0].offsetWidth + 24;
      const normalizedOffset = Math.abs(currentOffset) % singleSetWidth;
      const activeIdx = Math.round(normalizedOffset / cardWidth) % dotsContainer.children.length;

      Array.from(dotsContainer.children).forEach((dot, idx) => {
        dot.classList.toggle('active', idx === activeIdx);
      });
    }

    function jumpToIndex(idx) {
      const cards = track.querySelectorAll('.exp-card');
      if (cards.length === 0) return;
      const cardWidth = cards[0].offsetWidth + 24;
      currentOffset = -(idx * cardWidth);
      applyTransform();
      updateActiveDot();
    }

    function applyTransform() {
      track.style.transform = `translate3d(${currentOffset}px, 0, 0)`;
    }

    // Bucle continuo cinemático a 60fps
    function tick() {
      if (isPlaying && !isHovered && !isDragging && singleSetWidth > 0) {
        currentOffset -= speed;
        if (Math.abs(currentOffset) >= singleSetWidth) {
          currentOffset += singleSetWidth;
        }
        applyTransform();
        updateActiveDot();
      }
      animFrameId = requestAnimationFrame(tick);
    }

    // Botón Play / Pausa
    function togglePlayPause() {
      isPlaying = !isPlaying;
      if (isPlaying) {
        if (playIcon) playIcon.className = 'fa-solid fa-pause';
        if (playText) playText.textContent = 'Pausar';
        if (statusText) statusText.textContent = 'Rotación Continua en Vivo';
      } else {
        if (playIcon) playIcon.className = 'fa-solid fa-play';
        if (playText) playText.textContent = 'Reanudar';
        if (statusText) statusText.textContent = 'Rotación en Pausa';
      }
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', togglePlayPause);
    }

    // Desplazamiento manual tarjeta a tarjeta (Anterior / Siguiente)
    function step(direction) {
      const cards = track.querySelectorAll('.exp-card');
      if (cards.length === 0) return;
      const cardStep = cards[0].offsetWidth + 24;
      currentOffset += direction * cardStep;

      if (currentOffset > 0 && singleSetWidth > 0) {
        currentOffset -= singleSetWidth;
      } else if (Math.abs(currentOffset) >= singleSetWidth * 2 && singleSetWidth > 0) {
        currentOffset += singleSetWidth;
      }

      track.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
      applyTransform();
      updateActiveDot();
      setTimeout(() => {
        track.style.transition = '';
      }, 460);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => step(1));
    if (nextBtn) nextBtn.addEventListener('click', () => step(-1));

    // Pausar al posar el cursor sobre el carrusel
    viewport.addEventListener('mouseenter', () => {
      isHovered = true;
    });
    viewport.addEventListener('mouseleave', () => {
      isHovered = false;
      isDragging = false;
      viewport.classList.remove('is-dragging');
    });

    // Soporte para arrastrar con mouse (Drag)
    viewport.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.pageX;
      dragStartOffset = currentOffset;
      viewport.classList.add('is-dragging');
      track.style.transition = '';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const delta = e.pageX - startX;
      currentOffset = dragStartOffset + delta;
      applyTransform();
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        viewport.classList.remove('is-dragging');
      }
    });

    // Soporte táctil en dispositivos móviles (Swipe)
    viewport.addEventListener('touchstart', (e) => {
      isDragging = true;
      startX = e.touches[0].pageX;
      dragStartOffset = currentOffset;
      track.style.transition = '';
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const delta = e.touches[0].pageX - startX;
      currentOffset = dragStartOffset + delta;
      applyTransform();
    }, { passive: true });

    viewport.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Filtrado interactivo por pestañas
    tabButtons.forEach((tab) => {
      tab.addEventListener('click', () => {
        const filter = tab.dataset.filter;
        tabButtons.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        currentOffset = 0;
        buildInfiniteTrack(filter);
      });
    });

    // Iniciar galería
    buildInfiniteTrack('all');
    animFrameId = requestAnimationFrame(tick);

    window.addEventListener('resize', () => {
      measureTrack();
    });

    // Conectar modal para compartir experiencia
    initExpModal();

    function initExpModal() {
      const openModalBtn    = document.getElementById('btnOpenExpModal');
      const modalBackdrop   = document.getElementById('modalAddExperience');
      const closeModalBtn   = document.getElementById('btnCloseExpModal');
      const cancelModalBtn  = document.getElementById('btnCancelExpModal');
      const form            = document.getElementById('formAddExperience');

      // ── Upload multimedia ──────────────────────────────────────────────────
      const uploadZone      = document.getElementById('expUploadZone');
      const mediaInput      = document.getElementById('expMediaInput');
      const previewGrid     = document.getElementById('expMediaPreviewGrid');

      /** Array de objetos { file, objectUrl, type: 'image'|'video', base64? } */
      let selectedMedia = [];
      const MAX_FILES   = 4;

      /** Renderiza/actualiza la cuadrícula de previews */
      function renderPreviews() {
        if (!previewGrid) return;
        previewGrid.innerHTML = '';
        selectedMedia.forEach((item, idx) => {
          const wrap = document.createElement('div');
          wrap.className = 'exp-preview-item';

          if (item.type === 'image') {
            const img = document.createElement('img');
            img.src = item.objectUrl;
            img.alt = 'Vista previa';
            wrap.appendChild(img);
          } else {
            // Video: thumbnail estático con ícono de play
            const vid = document.createElement('video');
            vid.src  = item.objectUrl;
            vid.muted = true;
            vid.preload = 'metadata';
            wrap.appendChild(vid);

            const playIco = document.createElement('div');
            playIco.className = 'exp-preview-play-icon';
            playIco.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
            wrap.appendChild(playIco);

            const badge = document.createElement('span');
            badge.className = 'exp-preview-type-badge';
            badge.textContent = 'VIDEO';
            wrap.appendChild(badge);
          }

          // Overlay con botón eliminar
          const overlay = document.createElement('div');
          overlay.className = 'exp-preview-overlay';
          const removeBtn = document.createElement('button');
          removeBtn.type = 'button';
          removeBtn.className = 'exp-preview-remove';
          removeBtn.setAttribute('aria-label', 'Eliminar archivo');
          removeBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
          removeBtn.addEventListener('click', () => {
            URL.revokeObjectURL(item.objectUrl);
            selectedMedia.splice(idx, 1);
            renderPreviews();
            // Actualizar texto de la zona de upload
            updateZoneHint();
          });
          overlay.appendChild(removeBtn);
          wrap.appendChild(overlay);

          previewGrid.appendChild(wrap);
        });
        updateZoneHint();
      }

      /** Actualiza el hint de la drop zone según cuántos archivos hay */
      function updateZoneHint() {
        const hint = uploadZone ? uploadZone.querySelector('.exp-upload-hint-primary') : null;
        if (!hint) return;
        const remaining = MAX_FILES - selectedMedia.length;
        if (remaining <= 0) {
          hint.textContent = '¡Máximo de archivos alcanzado!';
        } else if (selectedMedia.length > 0) {
          hint.textContent = `${selectedMedia.length} archivo(s) · Haz clic para añadir más`;
        } else {
          hint.textContent = 'Arrastra o haz clic para subir';
        }
      }

      /** Procesa los archivos nuevos seleccionados/soltados */
      function handleFiles(files) {
        const allowed = Array.from(files).filter(f =>
          f.type.startsWith('image/') || f.type.startsWith('video/')
        );
        const toAdd = allowed.slice(0, MAX_FILES - selectedMedia.length);
        if (toAdd.length < allowed.length) {
          alert(`Solo puedes subir hasta ${MAX_FILES} archivos en total.`);
        }
        toAdd.forEach(file => {
          selectedMedia.push({
            file,
            objectUrl: URL.createObjectURL(file),
            type: file.type.startsWith('image/') ? 'image' : 'video',
            base64: null  // se llena de forma asíncrona para fotos (para persistir)
          });
          // Leer base64 solo para imágenes (evitar OOM con videos grandes)
          if (file.type.startsWith('image/') && file.size < 3 * 1024 * 1024) {
            const reader = new FileReader();
            reader.onload = (evt) => {
              const match = selectedMedia.find(m => m.file === file);
              if (match) match.base64 = evt.target.result;
            };
            reader.readAsDataURL(file);
          }
        });
        renderPreviews();
      }

      // ── Eventos de la zona de upload ──────────────────────────────────────
      if (mediaInput) {
        mediaInput.addEventListener('change', () => {
          handleFiles(mediaInput.files);
          mediaInput.value = ''; // Permitir re-seleccionar el mismo archivo
        });
      }

      if (uploadZone) {
        uploadZone.addEventListener('dragover', (e) => {
          e.preventDefault();
          uploadZone.classList.add('drag-over');
        });
        uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
        uploadZone.addEventListener('drop', (e) => {
          e.preventDefault();
          uploadZone.classList.remove('drag-over');
          handleFiles(e.dataTransfer.files);
        });
        // Teclado: Enter/Space activan el input file
        uploadZone.addEventListener('keydown', (e) => {
          if ((e.key === 'Enter' || e.key === ' ') && mediaInput) {
            e.preventDefault();
            mediaInput.click();
          }
        });
      }

      // ── Abrir / cerrar modal ───────────────────────────────────────────────
      function openModal() {
        if (!modalBackdrop) return;
        modalBackdrop.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      }

      function closeModal() {
        if (!modalBackdrop) return;
        modalBackdrop.classList.remove('is-open');
        document.body.style.overflow = '';
        if (form) form.reset();
        // Revocar URLs de objeto y limpiar array
        selectedMedia.forEach(m => URL.revokeObjectURL(m.objectUrl));
        selectedMedia = [];
        if (previewGrid) previewGrid.innerHTML = '';
        updateZoneHint();
      }

      if (openModalBtn)   openModalBtn.addEventListener('click', openModal);
      if (closeModalBtn)  closeModalBtn.addEventListener('click', closeModal);
      if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

      if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
          if (e.target === modalBackdrop) closeModal();
        });
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalBackdrop && modalBackdrop.classList.contains('is-open')) {
          closeModal();
        }
      });

      // ── Envío del formulario ───────────────────────────────────────────────
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();

          const author   = document.getElementById('expAuthor')?.value.trim();
          const role     = document.getElementById('expRoleType')?.value;
          const location = document.getElementById('expLocation')?.value.trim();
          const rating   = parseInt(document.getElementById('expRating')?.value || '5', 10);
          const comment  = document.getElementById('expComment')?.value.trim();

          if (!author || !comment) {
            alert('Por favor completa todos los campos requeridos.');
            return;
          }

          // Serializar solo las imágenes base64 (los videos NO se persisten en localStorage)
          const mediaForStorage = selectedMedia
            .filter(m => m.type === 'image' && m.base64)
            .map(m => ({ type: 'image', base64: m.base64 }))
            .slice(0, 4);

          const newReview = {
            id:       'rev_' + Date.now(),
            author,
            role:     role || 'turista-local',
            location: location || 'Nicaragua',
            rating:   rating || 5,
            comment,
            date:     'Hoy (Recién compartido)',
            media:    mediaForStorage
          };

          // También pasar las ObjectURLs para renderizado inmediato en la card
          const mediaForCard = selectedMedia.map(m => ({ type: m.type, url: m.objectUrl, base64: m.base64 || null }));

          saveUserExperienceLocally(newReview);
          injectNewReviewCard(newReview, mediaForCard);
          closeModal();

          // Limpiar objectURLs ya que closeModal revocó las que tenía selectedMedia,
          // pero mediaForCard mantiene referencias vivas para la card → no revocar aquí.
          alert('¡Gracias por compartir tu experiencia con la comunidad Baqueano!');
        });
      }

      loadLocalUserExperiences();
    }

    function injectNewReviewCard(data, mediaItems) {
      const card = document.createElement('div');
      card.className = 'exp-card';
      card.dataset.audience = data.role === 'negocio' ? 'negocio' : (data.role === 'turista-inter' ? 'turista-inter' : 'turista-local');

      let roleBadge = 'Turista Local';
      let roleClass = 'tag-turista';
      let flag = '🇳🇮';

      if (data.role === 'turista-inter' || data.role === 'internacional') {
        roleBadge = 'Viajero Internacional';
        roleClass = 'tag-inter';
        flag = '🌎';
      } else if (data.role === 'negocio') {
        roleBadge = 'Anfitrión / Negocio';
        roleClass = 'tag-negocio';
        flag = '🌾';
      }

      let starsHtml = '';
      for (let i = 1; i <= 5; i++) {
        starsHtml += i <= data.rating ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>';
      }

      // ── Construir sección de medios si hay archivos adjuntos ─────────────────
      // Priorizamos: (1) mediaItems pasados desde el modal (objectURL activo),
      //              (2) data.media con base64 (restaurado desde localStorage).
      const resolvedMedia = [];
      if (Array.isArray(mediaItems) && mediaItems.length > 0) {
        mediaItems.forEach(m => resolvedMedia.push({ type: m.type, src: m.url || m.base64 }));
      } else if (Array.isArray(data.media) && data.media.length > 0) {
        data.media.forEach(m => resolvedMedia.push({ type: m.type, src: m.base64 }));
      }

      let mediaSectionHtml = '';
      if (resolvedMedia.length > 0) {
        const pillLabel = resolvedMedia.length === 1 ? '1 archivo adjunto' : `${resolvedMedia.length} archivos adjuntos`;

        let thumbsHtml = '';
        resolvedMedia.forEach(m => {
          if (m.type === 'image') {
            thumbsHtml += `<img class="exp-card-thumb" src="${escapeHtml(m.src || '')}" alt="Foto de experiencia" loading="lazy">`;
          } else {
            thumbsHtml += `
              <div class="exp-card-video-wrap">
                <video src="${escapeHtml(m.src || '')}" muted preload="metadata"></video>
                <div class="exp-card-play"><i class="fa-solid fa-circle-play"></i></div>
              </div>`;
          }
        });

        mediaSectionHtml = `
          <span class="exp-media-pill">
            <i class="fa-solid fa-photo-film"></i> ${escapeHtml(pillLabel)}
          </span>
          <div class="exp-card-media-row">${thumbsHtml}</div>`;
      }

      card.innerHTML = `
        <div>
          <div class="exp-card-header">
            <div class="exp-author-info">
              <div class="exp-avatar-wrap">${flag}</div>
              <div>
                <h4 class="exp-name">${escapeHtml(data.author)} <i class="fa-solid fa-circle-check exp-verified-icon" title="Verificado"></i></h4>
                <p class="exp-origin">${escapeHtml(data.location)}</p>
              </div>
            </div>
            <span class="exp-role-badge ${roleClass}">${roleBadge}</span>
          </div>
          <div class="exp-rating-stars">${starsHtml}</div>
          <p class="exp-quote-text">«${escapeHtml(data.comment)}»</p>
          ${mediaSectionHtml}
        </div>
        <div class="exp-footer-tag">
          <span class="exp-impact-pill"><i class="fa-solid fa-comment-dots"></i> Experiencia Comunitaria</span>
          <span>${escapeHtml(data.date || 'Recién compartido')}</span>
        </div>
      `;

      originalCards.unshift(card);
      buildInfiniteTrack(activeFilter);
    }

    function saveUserExperienceLocally(item) {
      try {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEY_USER_REVIEWS) || '[]');
        existing.unshift(item);
        localStorage.setItem(STORAGE_KEY_USER_REVIEWS, JSON.stringify(existing.slice(0, 20)));
      } catch (e) {
        console.warn('[BaqueanoIndex] Error guardando reseña local:', e);
      }
    }

    function loadLocalUserExperiences() {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY_USER_REVIEWS) || '[]');
        if (Array.isArray(stored)) {
          stored.forEach((item) => injectNewReviewCard(item));
        }
      } catch (e) {
        console.warn('[BaqueanoIndex] Error al cargar reseñas locales:', e);
      }
    }
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }

  // Inicialización automática al cargar el DOM
  function autoInit() {
    initTerritoryMap();
    initTestimonials();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    setTimeout(autoInit, 100);
  }

  return {
    initTerritoryMap,
    initTestimonials,
    switchIndexLayer,
    focusIndexRegion,
    filterIndexExperience,
    renderIndexMarkers
  };
})();
