// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SINCRONIZACIÓN FIRESTORE EN TIEMPO REAL (firestore-realtime.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Conectar el portal web estático de Baqueano Nicaragua directamente a
//   Cloud Firestore mediante el SDK de Firebase (compat v9), eliminando
//   cualquier dependencia de datos mockeados o hardcodeados.
// - Proveer sincronización en tiempo real para:
//   * Catálogo de destinos (colección /places) con filtrado por status='published'.
//   * Métricas operativas del Ops Center (usuarios, reservas, rutas activas).
//   * Registro de negocios aliados (/businesses) para el portal de anfitriones.
//   * Guardado de favoritos del explorador (/user_saved_places).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Firebase SDK compat (CDN) ya inicializado en app.js.
// - Uso de onSnapshot() para subscripción en tiempo real donde aplique.
// - Uso de get() para lecturas one-shot de catálogo público.
// - Manejo defensivo: if (!window.firebase) fallback a datos semilla.
// - Separación de responsabilidades: este módulo solo gestiona datos,
//   no manipula el DOM directamente (delega a callbacks).
//
// 📦 3. QUÉ (WHAT / FUNCIONES EXPUESTAS):
// - BaqueanoFirestore.loadPublishedPlaces(callback)
// - BaqueanoFirestore.listenAdminMetrics(callback)
// - BaqueanoFirestore.registerBusiness(data) → Promise<string>
// - BaqueanoFirestore.savePlace(userId, placeId) → Promise<void>
// - BaqueanoFirestore.removeSavedPlace(userId, placeId) → Promise<void>
// - BaqueanoFirestore.getUserSavedPlaces(userId) → Promise<string[]>
// - BaqueanoFirestore.submitEnvReport(data) → Promise<string>
// - BaqueanoFirestore.loadAuditLogs(callback)
// ============================================================================

window.BaqueanoFirestore = (function() {

  // -----------------------------------------------------------------------
  // DATOS SEMILLA — Fallback cuando Firestore no está disponible (offline/dev)
  // -----------------------------------------------------------------------
  const SEED_PLACES = [
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
      badgeIcon: 'fa-droplet',
      status: 'published',
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
      badgeIcon: 'fa-volcano',
      status: 'published',
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
      badgeIcon: 'fa-mountain-sun',
      status: 'published',
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
      badgeIcon: 'fa-water',
      status: 'published',
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
      badgeIcon: 'fa-anchor',
      status: 'published',
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
      badgeIcon: 'fa-hotel',
      status: 'published',
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
      badgeIcon: 'fa-building-columns',
      status: 'published',
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
      badgeIcon: 'fa-tree',
      status: 'published',
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
      badgeIcon: 'fa-mug-hot',
      status: 'published',
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
      badgeIcon: 'fa-house-chimney-window',
      status: 'published',
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
      badgeIcon: 'fa-landmark',
      status: 'published',
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
      badgeIcon: 'fa-chess-rook',
      status: 'published',
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
      badgeIcon: 'fa-martini-glass-citrus',
      status: 'published',
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
      badgeIcon: 'fa-music',
      status: 'published',
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
      badgeIcon: 'fa-utensils',
      status: 'published',
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
      imageUrl: 'assets/images/comida/quesillo.jpg',
      badge: 'Quesillo de Nagarote',
      badgeIcon: 'fa-cheese',
      status: 'published',
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
      imageUrl: 'assets/images/comida/rosquillas.jpg',
      badge: 'Horno de Barro',
      badgeIcon: 'fa-cookie-bite',
      status: 'published',
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
      badgeIcon: 'fa-shrimp',
      status: 'published',
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
      badgeIcon: 'fa-drumstick-bite',
      status: 'published',
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
      badgeIcon: 'fa-fire-burner',
      status: 'published',
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
      badgeIcon: 'fa-umbrella-beach',
      status: 'published',
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
      badgeIcon: 'fa-fish',
      status: 'published',
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
      badgeIcon: 'fa-tree',
      status: 'published',
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
      badgeIcon: 'fa-cloud-rain',
      status: 'published',
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
      badgeIcon: 'fa-water',
      status: 'published',
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
      badgeIcon: 'fa-fire',
      status: 'published',
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
      badgeIcon: 'fa-mug-saucer',
      status: 'published',
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
      badgeIcon: 'fa-seedling',
      status: 'published',
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
      badgeIcon: 'fa-key',
      status: 'published',
      lat: 11.9310,
      lng: -85.9520,
      priceNio: 5500,
      priceUsd: 150,
      priceDetail: 'Casa colonial privada completa 10 personas C$ 5,500 - C$ 8,800 | Piscina privada'
    },
    {
      id: "dest_playa_el_coco",
      name: "Playa El Coco",
      department: "Rivas",
      municipality: "San Juan del Sur",
      category: "playas",
      description: "Playa de aguas tranquilas y arenas doradas, ideal para el descanso familiar y avistamiento de aves marinas en el corredor del Pacífico sur.",
      rating: 4.8,
      reviewCount: 310,
      cooperativeName: "Pescadores y Guías de El Coco",
      imageUrl: "assets/images/destinos/Refugio de Vida Silvestre La Flor & Playa El Coco.webp",
      badge: "Playa Serena",
      badgeIcon: "fa-umbrella-beach",
      status: 'published',
      lat: 11.162,
      lng: -85.808,
      priceNio: 200,
      priceUsd: 5.5,
      priceDetail: "Acceso a playa libre | Alquiler de sombrilla artesanal C$ 150 | Paseo en bote de pesca C$ 350"
    },
    {
      id: "dest_playa_hermosa",
      name: "Playa Hermosa",
      department: "Rivas",
      municipality: "San Juan del Sur",
      category: "playas",
      description: "Más de un kilómetro de costa virgen con bosque tropical adyacente. Olas suaves para aprender surf y paseos a caballo por la orilla.",
      rating: 4.9,
      reviewCount: 470,
      cooperativeName: "Comunidad Costera Hermosa",
      imageUrl: "assets/images/destinos/Playa Maderas (Santuario del Surf).jpg",
      badge: "Playa Virgen",
      badgeIcon: "fa-water",
      status: 'published',
      lat: 11.205,
      lng: -85.836,
      priceNio: 150,
      priceUsd: 4,
      priceDetail: "Entrada y parqueo C$ 120 | Tabla de surf principiante C$ 300 día | Paseo a caballo C$ 350"
    },
    {
      id: "dest_playa_gigante",
      name: "Playa Gigante & Pie de Gigante",
      department: "Rivas",
      municipality: "Tola",
      category: "playas",
      description: "Pintoresca bahía de pescadores con su imponente acantilado Pie de Gigante. Mariscos frescos recién desembarcados y ambiente bohemio.",
      rating: 4.8,
      reviewCount: 390,
      cooperativeName: "Cooperativa Pesquera El Gigante",
      imageUrl: "assets/images/destinos/Villa Vista Redonda (Emerald Coast).webp",
      badge: "Bahía Pesquera",
      badgeIcon: "fa-anchor",
      status: 'published',
      lat: 11.401,
      lng: -86.035,
      priceNio: 250,
      priceUsd: 7,
      priceDetail: "Paseo en lancha a playas secretas C$ 350 | Pescado frito del día C$ 250 | Tabla de surf C$ 200"
    },
    {
      id: "dest_playa_santo_domingo",
      name: "Playa Santo Domingo (Ometepe)",
      department: "Rivas",
      municipality: "Altagracia",
      category: "playas",
      description: "Extensa playa lacustre de arenas blancas sobre el Gran Lago de Nicaragua, ubicada en el istmo entre los volcanes Concepción y Maderas.",
      rating: 4.9,
      reviewCount: 520,
      cooperativeName: "Hostales Comunitarios de Ometepe",
      imageUrl: "assets/images/destinos/isla_de_ometepe.jpg",
      badge: "Playa Lacustre",
      badgeIcon: "fa-volcano",
      status: 'published',
      lat: 11.51,
      lng: -85.545,
      priceNio: 180,
      priceUsd: 5,
      priceDetail: "Acceso libre a playa | Alquiler de kayak lago C$ 180 hora | Plato de guapote C$ 250"
    },
    {
      id: "dest_playa_guasacate",
      name: "Playa Guasacate & Popoyo",
      department: "Rivas",
      municipality: "Tola",
      category: "playas",
      description: "Mecca del surf internacional con rompientes huecas consistentes. Pozas de marea naturales para baño y mariscos al estilo campesino costero.",
      rating: 4.9,
      reviewCount: 460,
      cooperativeName: "Gremio de Surfeadores de Popoyo",
      imageUrl: "assets/images/destinos/Villa Vista Redonda (Emerald Coast).webp",
      badge: "Surf & Pozas",
      badgeIcon: "fa-water",
      status: 'published',
      lat: 11.455,
      lng: -86.105,
      priceNio: 350,
      priceUsd: 9.5,
      priceDetail: "Clase de surf con baqueano 2h C$ 550 | Alquiler tabla C$ 250 | Ceviche local C$ 180"
    },
    {
      id: "dest_playa_sjds_bahia",
      name: "Playa San Juan del Sur",
      department: "Rivas",
      municipality: "San Juan del Sur",
      category: "playas",
      description: "La playa urbana más emblemática del país, con su forma de herradura, aguas calmas, veleros fondeados y gastronomía marina tradicional.",
      rating: 4.8,
      reviewCount: 840,
      cooperativeName: "Pescadores Artesanales de SJDS",
      imageUrl: "assets/images/destinos/Bahía de San Juan del Sur & Mirador del Cristo.jpg",
      badge: "Bahía Urbana",
      badgeIcon: "fa-ship",
      status: 'published',
      lat: 11.2529,
      lng: -85.8705,
      priceNio: 200,
      priceUsd: 5.5,
      priceDetail: "Paseo en lancha por la bahía C$ 200 | Mirador del Cristo entrada C$ 75 | Cóctel de mariscos C$ 160"
    },
    {
      id: "dest_playa_las_penitas",
      name: "Playa Las Peñitas",
      department: "León",
      municipality: "León",
      category: "playas",
      description: "Arenas oscuras volcánicas, estuarios de manglar y olas para todos los niveles de surf. Atardeceres de fuego sobre el horizonte pacífico.",
      rating: 4.9,
      reviewCount: 680,
      cooperativeName: "Pescadores y Ecoturismo Las Peñitas",
      imageUrl: "assets/images/departamentos/leon.png",
      badge: "Atardeceres Volcánicos",
      badgeIcon: "fa-sun",
      status: 'published',
      lat: 12.355,
      lng: -86.975,
      priceNio: 250,
      priceUsd: 7,
      priceDetail: "Paseo en lancha estuario C$ 250 | Alquiler de tabla de surf C$ 250 | Pescado a la tipitapa C$ 280"
    },
    {
      id: "dest_playa_el_velero",
      name: "Playa El Velero",
      department: "León",
      municipality: "Nagarote",
      category: "playas",
      description: "Playa serena y privada de arena volcánica y aguas calmas. Perfecta para el descanso familiar y la degustación de quesillos tradicionales.",
      rating: 4.7,
      reviewCount: 310,
      cooperativeName: "Comité Turístico Nagarote",
      imageUrl: "assets/images/departamentos/leon1.png",
      badge: "Costa Serena",
      badgeIcon: "fa-umbrella-beach",
      status: 'published',
      lat: 12.22,
      lng: -86.84,
      priceNio: 150,
      priceUsd: 4,
      priceDetail: "Entrada y cuidado de vehículo C$ 100 | Sopa marinera C$ 250 | Quesillo trenza con tiste C$ 95"
    },
    {
      id: "dest_playa_poneloya",
      name: "Playa Poneloya",
      department: "León",
      municipality: "León",
      category: "playas",
      description: "Pueblo balneario histórico de tradición leonesa, puente peatonal hacia la bocana y restaurantes con terrazas sobre la rompiente del mar.",
      rating: 4.7,
      reviewCount: 490,
      cooperativeName: "Comerciantes Costeros de Poneloya",
      imageUrl: "assets/images/departamentos/leon.png",
      badge: "Balneario Tradicional",
      badgeIcon: "fa-water",
      status: 'published',
      lat: 12.37,
      lng: -86.995,
      priceNio: 180,
      priceUsd: 5,
      priceDetail: "Paseo en bote por la bocana C$ 180 | Pargo rojo frito C$ 220 | Refresco de semilla de jícaro C$ 35"
    },
    {
      id: "dest_playa_juan_venado",
      name: "Playa e Isla Juan Venado",
      department: "León",
      municipality: "León",
      category: "playas",
      description: "Isla barrera de 22 km deshabitada entre el océano y el estero. Santuario de manglares, cocodrilos, aves acuáticas y anidación de tortugas.",
      rating: 4.9,
      reviewCount: 410,
      cooperativeName: "Guías Ecológicos Juan Venado",
      imageUrl: "assets/images/destinos/Refugio de Vida Silvestre La Flor & Playa El Coco.webp",
      badge: "Isla Barrera Virgen",
      badgeIcon: "fa-tree",
      status: 'published',
      lat: 12.33,
      lng: -86.95,
      priceNio: 350,
      priceUsd: 9.5,
      priceDetail: "Paseo ecológico en kayak por manglares C$ 350 | Lancha a motor C$ 550 grupo | Guía baqueano C$ 250"
    },
    {
      id: "dest_playa_pochomil",
      name: "Playa Pochomil",
      department: "Managua",
      municipality: "San Rafael del Sur",
      category: "playas",
      description: "El balneario popular por excelencia del departamento de Managua. Amplia franja de arena, paseos en cuadraciclos y música en vivo.",
      rating: 4.8,
      reviewCount: 780,
      cooperativeName: "Cooperativa Turística de Pochomil",
      imageUrl: "assets/images/departamentos/managua.png",
      badge: "Balneario Popular",
      badgeIcon: "fa-umbrella-beach",
      status: 'published',
      lat: 11.775,
      lng: -86.51,
      priceNio: 150,
      priceUsd: 4,
      priceDetail: "Acceso público libre | Alquiler de rancho con hamaca C$ 150 | Pargo a la Tipitapa C$ 250"
    },
    {
      id: "dest_playa_masachapa",
      name: "Playa Masachapa",
      department: "Managua",
      municipality: "San Rafael del Sur",
      category: "playas",
      description: "Pueblo de pescadores artesanales donde adquirir pescado fresco recién salido de las faenas nocturnas y pasear sobre el malecón histórico.",
      rating: 4.7,
      reviewCount: 520,
      cooperativeName: "Asociación de Pescadores Masachapa",
      imageUrl: "assets/images/departamentos/managua1.jpg",
      badge: "Muelle Pesquero",
      badgeIcon: "fa-anchor",
      status: 'published',
      lat: 11.785,
      lng: -86.518,
      priceNio: 180,
      priceUsd: 5,
      priceDetail: "Pescado fresco por libra C$ 80-120 | Plato servido con tostones C$ 180 | Paseo lancha C$ 250"
    },
    {
      id: "dest_playa_san_diego",
      name: "Playa San Diego",
      department: "Managua",
      municipality: "Villa El Carmen",
      category: "playas",
      description: "Playa de olas rápidas y tubulares ideales para surfistas experimentados. Entorno apacible con estero y avistamiento de pelícanos.",
      rating: 4.8,
      reviewCount: 340,
      cooperativeName: "Comunidad Surf San Diego",
      imageUrl: "assets/images/departamentos/managua.png",
      badge: "Ola Tubular",
      badgeIcon: "fa-water",
      status: 'published',
      lat: 11.89,
      lng: -86.62,
      priceNio: 200,
      priceUsd: 5.5,
      priceDetail: "Alquiler tabla surf día C$ 300 | Guía de olas local C$ 200 | Ceviche de curvina C$ 150"
    },
    {
      id: "dest_playa_la_boquita",
      name: "Playa La Boquita",
      department: "Carazo",
      municipality: "Diriamba",
      category: "playas",
      description: "Complejo turístico caraceño de acantilados bajos, rocas coralinas, paseos a caballo y restaurantes con terrazas de madera frente a las olas.",
      rating: 4.8,
      reviewCount: 610,
      cooperativeName: "Cooperativa Costera La Boquita",
      imageUrl: "assets/images/departamentos/carazo.png",
      badge: "Costa Rocosa",
      badgeIcon: "fa-water",
      status: 'published',
      lat: 11.69,
      lng: -86.355,
      priceNio: 180,
      priceUsd: 5,
      priceDetail: "Paseo en caballo por la playa C$ 150 | Pargo frito con tajadas C$ 220 | Rancho con hamaca C$ 100"
    },
    {
      id: "dest_playa_casares",
      name: "Playa Casares",
      department: "Carazo",
      municipality: "Diriamba",
      category: "playas",
      description: "Bahía rocosa de pescadores donde el río desemboca en el mar. Casas construidas sobre promontorios y ambiente pesquero auténtico.",
      rating: 4.7,
      reviewCount: 380,
      cooperativeName: "Pescadores de Casares",
      imageUrl: "assets/images/departamentos/carazo1.png",
      badge: "Aldea Pesquera",
      badgeIcon: "fa-anchor",
      status: 'published',
      lat: 11.68,
      lng: -86.335,
      priceNio: 150,
      priceUsd: 4,
      priceDetail: "Tour en lancha de pesca C$ 300 | Sopa marinera casera C$ 200 | Cóctel de conchas negras C$ 140"
    },
    {
      id: "dest_el_bluff",
      name: "Península y Playa El Bluff",
      department: "RACCS",
      municipality: "Bluefields",
      category: "playas",
      description: "Península caribeña con kilométricas playas de aguas templadas, brisa marina caribeña y puerto de cabotaje a corta distancia en panga desde Bluefields.",
      rating: 4.8,
      reviewCount: 420,
      cooperativeName: "Comunidad Costera El Bluff",
      imageUrl: "assets/images/departamentos/RAAS.png",
      badge: "Caribe Soberano",
      badgeIcon: "fa-fish",
      status: 'published',
      lat: 12,
      lng: -83.715,
      priceNio: 220,
      priceUsd: 6,
      priceDetail: "Panga rápida Bluefields - El Bluff C$ 50 | Rondón criollo de mariscos C$ 280 | Coco de agua C$ 25"
    },
    {
      id: "dest_playa_la_bocana_bilwi",
      name: "Playa La Bocana de Bilwi",
      department: "RACCN",
      municipality: "Puerto Cabezas / Bilwi",
      category: "playas",
      description: "Playa de la costa miskita norte donde desembocan riachuelos de selva. Ambiente festivo caribeño, tambores y mariscos preparados con leche de coco.",
      rating: 4.8,
      reviewCount: 310,
      cooperativeName: "Comunidad Indígena Miskita de Bilwi",
      imageUrl: "assets/images/departamentos/raan.png",
      badge: "Costa Miskita",
      badgeIcon: "fa-water",
      status: 'published',
      lat: 14.03,
      lng: -83.38,
      priceNio: 200,
      priceUsd: 5.5,
      priceDetail: "Pescado frito caribeño C$ 200 | Pan de coco recién horneado C$ 30 | Baile de tambores"
    },
    {
      id: "dest_playa_nahualapa",
      name: "Playa de Nahualapa",
      department: "Chinandega",
      municipality: "El Viejo",
      category: "playas",
      description: "Bahía semicircular de aguas mansas protegida de vientos fuertes, rodeada de esteros vírgenes y palmeras. Destino predilecto para el kayak de mar.",
      rating: 4.9,
      reviewCount: 360,
      cooperativeName: "Cooperativa Ecoturística Nahualapa",
      imageUrl: "assets/images/departamentos/chinandega.jpg",
      badge: "Bahía Secreta",
      badgeIcon: "fa-umbrella-beach",
      status: 'published',
      lat: 12.65,
      lng: -87.27,
      priceNio: 200,
      priceUsd: 5.5,
      priceDetail: "Alquiler de kayak C$ 200 hora | Guía a esteros de manglar C$ 300 | Pescado a la plancha C$ 220"
    },
    {
      id: "dest_playa_corinto",
      name: "Playa Corinto & Paso Caballos",
      department: "Chinandega",
      municipality: "Corinto",
      category: "playas",
      description: "Extensa playa con puente emblemático de Paso Caballos. Gastronomía marina de renombre, conchas negras de manglar y camarones frescos.",
      rating: 4.8,
      reviewCount: 650,
      cooperativeName: "Marisqueros de Paso Caballos",
      imageUrl: "assets/images/departamentos/chinandega7.jpg",
      badge: "Mariscos de Corinto",
      badgeIcon: "fa-shrimp",
      status: 'published',
      lat: 12.48,
      lng: -87.17,
      priceNio: 200,
      priceUsd: 5.5,
      priceDetail: "Sopa de mariscos Paso Caballos C$ 250 | Cóctel de conchas C$ 120 | Paseo en panga C$ 200"
    },
    {
      id: "dest_playa_jiquilillo",
      name: "Playa Jiquilillo",
      department: "Chinandega",
      municipality: "El Viejo",
      category: "playas",
      description: "Pueblo costero auténtico de pescadores con kilómetros de arena volcánica y oleaje constante. Puerta de entrada al estero de anidación de tortugas carey.",
      rating: 4.8,
      reviewCount: 430,
      cooperativeName: "Pescadores y Protectores de Carey Jiquilillo",
      imageUrl: "assets/images/departamentos/chinandega.jpg",
      badge: "Santuario Carey",
      badgeIcon: "fa-water",
      status: 'published',
      lat: 12.72,
      lng: -87.45,
      priceNio: 250,
      priceUsd: 7,
      priceDetail: "Patrullaje nocturno de tortugas carey C$ 350 | Tabla de surf C$ 250 | Comida campesina C$ 150"
    },
    {
      id: "dest_playa_aposentillo",
      name: "Playa Aposentillo",
      department: "Chinandega",
      municipality: "El Viejo",
      category: "playas",
      description: "Playa de surf paradisíaca con la famosa ola The Boom y rompientes para todos los gustos. Pozas de agua clara durante marea baja.",
      rating: 4.9,
      reviewCount: 510,
      cooperativeName: "Comunidad Surf Aposentillo",
      imageUrl: "assets/images/destinos/Playa Maderas (Santuario del Surf).jpg",
      badge: "Ola The Boom",
      badgeIcon: "fa-bolt",
      status: 'published',
      lat: 12.63,
      lng: -87.24,
      priceNio: 350,
      priceUsd: 9.5,
      priceDetail: "Clase de surf con guía baqueano C$ 550 | Tabla por día C$ 250 | Plato del pescador C$ 220"
    },
    {
      id: "dest_cascada_el_corozo",
      name: "Cascadas El Corozo",
      department: "Nueva Segovia",
      municipality: "Jalapa",
      category: "rios",
      description: "Múltiples caídas de agua escalonadas entre densos pinares segovianos. Pozas cristalinas de montaña y senderos de orquídeas silvestres.",
      rating: 4.9,
      reviewCount: 290,
      cooperativeName: "Cooperativa Agroturística Jalapa",
      imageUrl: "assets/images/departamentos/nueva segovia.png",
      badge: "Cascada de Pinar",
      badgeIcon: "fa-water",
      status: 'published',
      lat: 13.88,
      lng: -86.12,
      priceNio: 150,
      priceUsd: 4,
      priceDetail: "Entrada y sendero campesino C$ 100 | Guía de montaña baqueano C$ 250 | Almuerzo típico C$ 140"
    },
    {
      id: "dest_cascada_la_bujona",
      name: "Cascada La Bujona",
      department: "Jinotega",
      municipality: "San Rafael del Norte",
      category: "rios",
      description: "Impresionante cortina de agua de más de 20 metros de altura oculta en un cañón de helechos gigantes y cafetales de altura.",
      rating: 4.9,
      reviewCount: 380,
      cooperativeName: "Baqueanos de San Rafael del Norte",
      imageUrl: "assets/images/destinos/cascada_la_luna.jpg",
      badge: "Catarata Sagrada",
      badgeIcon: "fa-droplet",
      status: 'published',
      lat: 13.25,
      lng: -85.78,
      priceNio: 180,
      priceUsd: 5,
      priceDetail: "Entrada al sendero protegido C$ 80 | Guía comunitario de cascada C$ 250 | Café de altura C$ 35"
    },
    {
      id: "dest_salto_santa_emilia",
      name: "Salto Santa Emilia",
      department: "Matagalpa",
      municipality: "Matagalpa",
      category: "rios",
      description: "Catarata rodeada de bosque lluvioso y cuevas milenarias de murciélagos. Poza profunda verde esmeralda apta para el baño reconfortante.",
      rating: 4.8,
      reviewCount: 460,
      cooperativeName: "Finca Ecoturística Santa Emilia",
      imageUrl: "assets/images/destinos/cascada_la_luna.jpg",
      badge: "Poza Esmeralda",
      badgeIcon: "fa-water",
      status: 'published',
      lat: 13.02,
      lng: -85.87,
      priceNio: 150,
      priceUsd: 4,
      priceDetail: "Entrada general C$ 100 nac. / C$ 180 extr. | Sendero a las cuevas C$ 150 | Almuerzo campesino C$ 150"
    },
    {
      id: "dest_laguna_la_bruja",
      name: "Laguna La Bruja",
      department: "Madriz",
      municipality: "Las Sabanas",
      category: "rios",
      description: "Mística laguna de montaña situada a más de 1,300 metros sobre el nivel del mar, envuelta en leyendas locales, niebla y densos pinares.",
      rating: 4.8,
      reviewCount: 240,
      cooperativeName: "Guías de Las Sabanas Madriz",
      imageUrl: "assets/images/departamentos/somoto.jpg",
      badge: "Laguna Encantada",
      badgeIcon: "fa-wand-magic-sparkles",
      status: 'published',
      lat: 13.62,
      lng: -86.53,
      priceNio: 120,
      priceUsd: 3.3,
      priceDetail: "Entrada a la reserva C$ 50 | Guía de leyendas y bosque C$ 200 | Café con rosquillas C$ 40"
    },
    {
      id: "dest_laguna_perlas",
      name: "Laguna de Perlas (Pearl Lagoon)",
      department: "RACCS",
      municipality: "Laguna de Perlas",
      category: "rios",
      description: "La albufera costera más grande de Nicaragua, hogar de pueblos creole, miskitos y garífunas con canales de manglares y pesca deportiva soberana.",
      rating: 4.9,
      reviewCount: 410,
      cooperativeName: "Consejo Comunal de Pearl Lagoon",
      imageUrl: "assets/images/departamentos/RAAS.png",
      badge: "Albufera Caribeña",
      badgeIcon: "fa-fish",
      status: 'published',
      lat: 12.35,
      lng: -83.67,
      priceNio: 350,
      priceUsd: 9.5,
      priceDetail: "Paseo en panga por la laguna C$ 350 | Tour a comunidades garífunas C$ 600 | Rondón criollo C$ 250"
    },
    {
      id: "dest_laguna_masaya",
      name: "Laguna de Masaya",
      department: "Masaya",
      municipality: "Masaya",
      category: "rios",
      description: "Cuerpo de agua volcánico al pie de la meseta de los pueblos blancos y del coloso Santiago. Miradores panorámicos y vegetación endémica.",
      rating: 4.7,
      reviewCount: 480,
      cooperativeName: "Pescadores Artesanales de Masaya",
      imageUrl: "assets/images/departamentos/masaya.png",
      badge: "Cráter Lacustre",
      badgeIcon: "fa-volcano",
      status: 'published',
      lat: 11.97,
      lng: -86.1,
      priceNio: 100,
      priceUsd: 2.8,
      priceDetail: "Acceso a mirador libre | Bajada guiada a la ribera C$ 150 | Refresco tradicional C$ 30"
    },
    {
      id: "dest_laguna_xiloa",
      name: "Laguna de Xiloá",
      department: "Managua",
      municipality: "Mateare",
      category: "rios",
      description: "Cráter de aguas cálidas y ligeramente salobres a solo 15 minutos de Managua. Balneario con centro turístico, paseos en bote y quioscos típicos.",
      rating: 4.7,
      reviewCount: 560,
      cooperativeName: "Asociación Gastronómica de Xiloá",
      imageUrl: "assets/images/departamentos/managua.png",
      badge: "Laguna de Cráter",
      badgeIcon: "fa-water",
      status: 'published',
      lat: 12.215,
      lng: -86.32,
      priceNio: 100,
      priceUsd: 2.8,
      priceDetail: "Entrada al balneario C$ 30 | Paseo en lancha C$ 120 | Pescado frito guapote C$ 180"
    },
    {
      id: "dest_laguna_apoyeque",
      name: "Laguna de Apoyeque",
      department: "Managua",
      municipality: "Chiltepe",
      category: "rios",
      description: "Cráter volcánico extinto con una de las lagunas más profundas y misteriosas de Centroamérica. Senderismo agreste y vistas al Lago Xolotlán.",
      rating: 4.9,
      reviewCount: 310,
      cooperativeName: "Baqueanos de la Península de Chiltepe",
      imageUrl: "assets/images/departamentos/managua1.jpg",
      badge: "Cráter Salvaje",
      badgeIcon: "fa-volcano",
      status: 'published',
      lat: 12.24,
      lng: -86.34,
      priceNio: 250,
      priceUsd: 7,
      priceDetail: "Guía baqueano para descenso al cráter C$ 350 | Senderismo de borde C$ 200"
    },
    {
      id: "dest_termales_don_alfonso",
      name: "Aguas Termales Don Alfonso",
      department: "Nueva Segovia",
      municipality: "San Fernando",
      category: "rios",
      description: "Pozas termales naturales ricas en minerales volcánicos y azufre terapéutico, entre paisajes montañosos y clima fresco segoviano.",
      rating: 4.9,
      reviewCount: 370,
      cooperativeName: "Familiar Termales Don Alfonso",
      imageUrl: "assets/images/departamentos/nueva segovia1.png",
      badge: "Termales Minerales",
      badgeIcon: "fa-hot-tub-person",
      status: 'published',
      lat: 13.78,
      lng: -86.41,
      priceNio: 150,
      priceUsd: 4,
      priceDetail: "Entrada a piscinas termales C$ 100 | Masaje campesino de arcilla C$ 200 | Sopa de gallina criolla C$ 150"
    },
    {
      id: "dest_termales_tipitapa",
      name: "Baños Termales de Tipitapa",
      department: "Managua",
      municipality: "Tipitapa",
      category: "rios",
      description: "Histórico balneario de aguas termales hidrotermales medicinales, sauna natural y restaurantes contiguos donde degustar el pescado a la Tipitapa.",
      rating: 4.6,
      reviewCount: 520,
      cooperativeName: "Comité Termal Tipitapa",
      imageUrl: "assets/images/departamentos/managua.png",
      badge: "Sauna Natural",
      badgeIcon: "fa-hot-tub-person",
      status: 'published',
      lat: 12.198,
      lng: -86.096,
      priceNio: 120,
      priceUsd: 3.3,
      priceDetail: "Entrada a pozas termales C$ 80 | Baño sauna natural C$ 120 | Pescado a la Tipitapa tradicional C$ 220"
    },
    {
      id: "dest_mirador_catarina",
      name: "Mirador de Catarina",
      department: "Masaya",
      municipality: "Catarina",
      category: "selva",
      description: "El mirador más afamado de Nicaragua con vista panorámica de 360 grados hacia la Laguna de Apoyo, Volcán Mombacho y Granada. Viveros y música de marimbas.",
      rating: 4.9,
      reviewCount: 980,
      cooperativeName: "Viveristas y Músicos de Catarina",
      imageUrl: "assets/images/destinos/laguna_de_apoyo.jpg",
      badge: "Mirador Panorámico",
      badgeIcon: "fa-binoculars",
      status: 'published',
      lat: 11.912,
      lng: -86.073,
      priceNio: 100,
      priceUsd: 2.8,
      priceDetail: "Entrada al mirador C$ 30 nac. / C$ 75 extr. | Paseo en caballo sendero cráter C$ 150 | Marimba al aire libre"
    },
    {
      id: "dest_mirador_el_caballito",
      name: "Mirador Sendero El Caballito",
      department: "Masaya",
      municipality: "San Juan de Oriente",
      category: "selva",
      description: "Sendero ecológico que desciende entre cafetales y hornos de cerámica hasta asomarse sobre el cráter de Apoyo con senderos de barro ancestral.",
      rating: 4.8,
      reviewCount: 310,
      cooperativeName: "Alfareros de San Juan de Oriente",
      imageUrl: "assets/images/departamentos/masaya1.png",
      badge: "Sendero Artesanal",
      badgeIcon: "fa-person-hiking",
      status: 'published',
      lat: 11.905,
      lng: -86.08,
      priceNio: 120,
      priceUsd: 3.3,
      priceDetail: "Acceso al sendero C$ 50 | Demostración de torno de cerámica C$ 100 | Taller práctico de barro C$ 180"
    },
    {
      id: "dest_mirador_apaguaji",
      name: "Mirador y Cuevas de Apaguajil",
      department: "Boaco",
      municipality: "Camoapa",
      category: "selva",
      description: "Formación rocosa monumental y cuevas precolombinas en el corazón ganadero de Camoapa con vistas infinitas hacia los valles centrales.",
      rating: 4.8,
      reviewCount: 260,
      cooperativeName: "Custodios de Apaguajil",
      imageUrl: "assets/images/departamentos/boaco.png",
      badge: "Cuevas Precolombinas",
      badgeIcon: "fa-mountain",
      status: 'published',
      lat: 12.92,
      lng: -85.35,
      priceNio: 150,
      priceUsd: 4,
      priceDetail: "Entrada y acceso a cuevas C$ 80 | Guía baqueano local C$ 200 | Sombrero pita tradicional"
    },
    {
      id: "dest_mirador_cerro_calvario",
      name: "Parque Ecológico & Mirador Cerro El Calvario",
      department: "Matagalpa",
      municipality: "Matagalpa",
      category: "selva",
      description: "Balcón natural sobre la ciudad de Matagalpa con senderos empedrados, canopy urbano, jardín botánico y la brisa permanente de la Perla del Septentrión.",
      rating: 4.9,
      reviewCount: 620,
      cooperativeName: "Guías Ambientales de Matagalpa",
      imageUrl: "assets/images/departamentos/matagalpa.png",
      badge: "Balcón del Septentrión",
      badgeIcon: "fa-city",
      status: 'published',
      lat: 12.925,
      lng: -85.92,
      priceNio: 100,
      priceUsd: 2.8,
      priceDetail: "Entrada libre al parque | Tirolesa canopy C$ 120 | Café con leche y güirila en el mirador C$ 90"
    },
    {
      id: "dest_refugio_chocoyero",
      name: "Refugio de Vida Silvestre Chocoyero–El Brujo",
      department: "Managua",
      municipality: "Ticuantepe",
      category: "selva",
      description: "Paredes de roca basáltica donde anidan miles de chocoyos verdes (pericos). Dos cascadas de bosque premontano y senderos de piñas ecológicas.",
      rating: 4.9,
      reviewCount: 580,
      cooperativeName: "Cooperativa Ecoturística Chocoyero",
      imageUrl: "assets/images/destinos/cascada_la_luna.jpg",
      badge: "Santuario de Chocoyos",
      badgeIcon: "fa-dove",
      status: 'published',
      lat: 12.015,
      lng: -86.22,
      priceNio: 180,
      priceUsd: 5,
      priceDetail: "Entrada MARENA C$ 80 nac. / C$ 180 extr. | Guía a cascada El Brujo C$ 250 | Tour de piña C$ 120"
    },
    {
      id: "dest_refugio_guatuzos",
      name: "Refugio de Vida Silvestre Los Guatuzos",
      department: "Río San Juan",
      municipality: "San Carlos",
      category: "selva",
      description: "Humedal de importancia internacional RAMSAR con canales fluviales, caimanes, tortugas de río, monos aulladores y puente colgante de dosel.",
      rating: 5,
      reviewCount: 420,
      cooperativeName: "Comunidad Indígena Papaturro",
      imageUrl: "assets/images/departamentos/rio san juan.png",
      badge: "Humedal RAMSAR",
      badgeIcon: "fa-feather",
      status: 'published',
      lat: 11.04,
      lng: -85.05,
      priceNio: 450,
      priceUsd: 12,
      priceDetail: "Lancha fluvial por canales C$ 450 | Puente colgante y sendero caimanes C$ 250 | Cabaña comunitaria C$ 600"
    },
    {
      id: "dest_refugio_chacocente",
      name: "Refugio de Vida Silvestre Río Escalante - Chacocente",
      department: "Carazo",
      municipality: "Santa Teresa",
      category: "playas",
      description: "Uno de los últimos bosques tropicales secos del Pacífico y una de las 9 playas del planeta donde ocurren arribadas masivas de tortugas paslama.",
      rating: 4.9,
      reviewCount: 390,
      cooperativeName: "Guardaparques de Chacocente",
      imageUrl: "assets/images/destinos/Refugio de Vida Silvestre La Flor & Playa El Coco.webp",
      badge: "Arribadas Masivas",
      badgeIcon: "fa-shield-halved",
      status: 'published',
      lat: 11.52,
      lng: -86.19,
      priceNio: 250,
      priceUsd: 7,
      priceDetail: "Entrada MARENA C$ 100 nac. / C$ 250 extr. | Guía nocturno baqueano C$ 300 | Sendero bosque seco C$ 150"
    },
    {
      id: "dest_cerro_mogoton",
      name: "Cerro Mogotón (Punto Más Alto de Nicaragua)",
      department: "Nueva Segovia",
      municipality: "San Fernando",
      category: "selva",
      description: "La cumbre máxima de Nicaragua con 2,107 metros de altitud. Bosques de niebla, robledales centenarios, musgos y vistas sin fin hacia Centroamérica.",
      rating: 5,
      reviewCount: 340,
      cooperativeName: "Baqueanos de Altura Mogotón",
      imageUrl: "assets/images/departamentos/nueva segovia.png",
      badge: "Cumbre Soberana 2,107m",
      badgeIcon: "fa-mountain-sun",
      status: 'published',
      lat: 13.76,
      lng: -86.4,
      priceNio: 550,
      priceUsd: 15,
      priceDetail: "Guía oficial de ascenso C$ 600 grupo | Permiso de sendero C$ 150 | Almuerzo de cumbre C$ 160"
    },
    {
      id: "dest_reserva_cerro_arenal",
      name: "Reserva Natural Cerro El Arenal",
      department: "Matagalpa",
      municipality: "Matagalpa",
      category: "selva",
      description: "Bosque nuboso primario que abastece de agua a la región norteña. Senderos con musgos, bromelias, quetzales y cafetales de sombra agroecológica.",
      rating: 4.9,
      reviewCount: 410,
      cooperativeName: "Cooperativa Agroforestal El Arenal",
      imageUrl: "assets/images/destinos/selva_negra.jpg",
      badge: "Bosque Nuboso",
      badgeIcon: "fa-cloud-rain",
      status: 'published',
      lat: 12.98,
      lng: -85.9,
      priceNio: 200,
      priceUsd: 5.5,
      priceDetail: "Entrada al sendero C$ 80 | Guía de aves y flora C$ 250 | Taza de café de altura C$ 35"
    },
    {
      id: "dest_reserva_estero_padre_ramos",
      name: "Reserva Natural Estero Padre Ramos",
      department: "Chinandega",
      municipality: "El Viejo",
      category: "selva",
      description: "Uno de los bosques de manglar mejor conservados de Mesoamérica. Canales laberínticos protegidos de agua calma y nidos de tortuga carey.",
      rating: 4.9,
      reviewCount: 380,
      cooperativeName: "Ecoturismo Padre Ramos",
      imageUrl: "assets/images/departamentos/chinandega.jpg",
      badge: "Manglar Mesoamericano",
      badgeIcon: "fa-tree",
      status: 'published',
      lat: 12.8,
      lng: -87.47,
      priceNio: 350,
      priceUsd: 9.5,
      priceDetail: "Recorrido en kayak por manglares C$ 350 | Lancha comunitaria C$ 550 | Pescado del estero C$ 200"
    },
    {
      id: "dest_reserva_bosawas",
      name: "Reserva de Biósfera Bosawás",
      department: "Jinotega / RACCN",
      municipality: "Wiwilí / Bonanza",
      category: "selva",
      description: "El corazón del Corredor Biológico Mesoamericano y la mayor reserva de bosque tropical húmedo de Centroamérica. Territorio indígena Mayangna y Miskito.",
      rating: 5,
      reviewCount: 490,
      cooperativeName: "Nación Indígena Mayangna Sauni As",
      imageUrl: "assets/images/departamentos/biosfera bosawas.jpg",
      badge: "Pulmón de Centroamérica",
      badgeIcon: "fa-earth-americas",
      status: 'published',
      lat: 14.15,
      lng: -85,
      priceNio: 650,
      priceUsd: 18,
      priceDetail: "Paseo en pipante indígena por el río C$ 650 | Guía mayangna ancestral C$ 450 día | Albergue de selva C$ 500"
    },
    {
      id: "dest_reserva_penas_blancas",
      name: "Reserva Natural Macizo Peñas Blancas",
      department: "Jinotega",
      municipality: "El Cuá",
      category: "selva",
      description: "Majestuoso muro de caliza blanca cubierto por nebliselva virgen. Nacimiento de más de 40 ríos y cataratas que caen de acantilados de 1,700m.",
      rating: 5,
      reviewCount: 390,
      cooperativeName: "Guardianes de Peñas Blancas",
      imageUrl: "assets/images/destinos/cascada_la_luna.jpg",
      badge: "Catedral de Piedra",
      badgeIcon: "fa-mountain",
      status: 'published',
      lat: 13.28,
      lng: -85.67,
      priceNio: 350,
      priceUsd: 9.5,
      priceDetail: "Guía baqueano a la Cascada Arcoíris C$ 350 | Acceso al sendero C$ 100 | Almuerzo montañés C$ 140"
    },
    {
      id: "dest_reserva_amerrisque",
      name: "Reserva Natural Serranía Amerrisque",
      department: "Chontales",
      municipality: "Juigalpa",
      category: "selva",
      description: "Cordillera mítica de origen precolombino con farallones que inspiraron el nombre de América según geógrafos. Pinturas rupestres y cultura chontaleña.",
      rating: 4.8,
      reviewCount: 320,
      cooperativeName: "Baqueanos de Amerrisque",
      imageUrl: "assets/images/departamentos/chontales.png",
      badge: "Cordillera Mítica",
      badgeIcon: "fa-mountain-sun",
      status: 'published',
      lat: 12.15,
      lng: -85.35,
      priceNio: 250,
      priceUsd: 7,
      priceDetail: "Senderismo guiado a cuevas y monolitos C$ 300 | Visita a petroglifos C$ 150 | Almuerzo campesino C$ 140"
    },
    {
      id: "dest_reserva_tepesomoto",
      name: "Reserva Natural Tepesomoto–La Patasta",
      department: "Madriz",
      municipality: "Las Sabanas",
      category: "selva",
      description: "Meseta de clima templado con miradores de 1,700m hacia Honduras y el Golfo de Fonseca. Bosques de robles y cooperativas de flores y fresas.",
      rating: 4.8,
      reviewCount: 280,
      cooperativeName: "Red Comunitaria Tepesomoto",
      imageUrl: "assets/images/departamentos/somoto.jpg",
      badge: "Meseta de Fresas",
      badgeIcon: "fa-leaf",
      status: 'published',
      lat: 13.45,
      lng: -86.6,
      priceNio: 200,
      priceUsd: 5.5,
      priceDetail: "Sendero a mirador La Patasta C$ 150 | Tour de fresas orgánicas C$ 100 | Café con rosquillas C$ 40"
    },
    {
      id: "dest_reserva_tisey",
      name: "Reserva Natural Tisey–Estanzuela",
      department: "Estelí",
      municipality: "Estelí",
      category: "selva",
      description: "Catarata de La Estanzuela, esculturas labradas en piedra viva por Don Alberto Gutiérrez en El Jalacate y talleres de queso artesanal suizo-segoviano.",
      rating: 5,
      reviewCount: 680,
      cooperativeName: "Custodios de El Tisey",
      imageUrl: "assets/images/departamentos/reserva tisey.jpg",
      badge: "Esculturas en Piedra",
      badgeIcon: "fa-hammer",
      status: 'published',
      lat: 13.05,
      lng: -86.36,
      priceNio: 200,
      priceUsd: 5.5,
      priceDetail: "Entrada y recorrido esculturas El Jalacate C$ 100 | Salto La Estanzuela C$ 80 | Queso campesino C$ 120"
    },
    {
      id: "dest_reserva_miraflor",
      name: "Reserva Natural Miraflor Moropotente",
      department: "Estelí",
      municipality: "Estelí",
      category: "selva",
      description: "Pionera del turismo rural comunitario en Nicaragua con más de 200 especies de orquídeas, tres zonas climáticas, fincas de café orgánico y hospedajes campesinos.",
      rating: 4.9,
      reviewCount: 540,
      cooperativeName: "UCA Miraflor (Unión de Cooperativas Agropecuarias)",
      imageUrl: "assets/images/departamentos/esteli1.png",
      badge: "Ruta de las Orquídeas",
      badgeIcon: "fa-seedling",
      status: 'published',
      lat: 13.25,
      lng: -86.25,
      priceNio: 450,
      priceUsd: 12,
      priceDetail: "Paseo a caballo con baqueano C$ 350 | Hospedaje en casa campesina con 3 comidas C$ 650 | Tour orquídeas C$ 200"
    },
    {
      id: "dest_isletas_granada",
      name: "Isletas de Granada & Fuerte San Pablo",
      department: "Granada",
      municipality: "Granada",
      category: "islas",
      description: "Archipiélago de 365 islas formadas por la avalancha milenaria del Volcán Mombacho en el Gran Lago. Fortaleza colonial San Pablo y avistamiento de garzas.",
      rating: 4.9,
      reviewCount: 780,
      cooperativeName: "Cooperativa de Lancheros de Granada",
      imageUrl: "assets/images/destinos/isletas_de_granada.jpg",
      badge: "365 Isletas",
      badgeIcon: "fa-water",
      status: 'published',
      lat: 11.91,
      lng: -85.91,
      priceNio: 350,
      priceUsd: 9.5,
      priceDetail: "Tour en lancha artesanal 1h C$ 350 | Entrada al Fuerte San Pablo C$ 30 | Almuerzo pescado frito C$ 220"
    },
    {
      id: "dest_archipielago_solentiname",
      name: "Archipiélago de Solentiname",
      department: "Río San Juan",
      municipality: "San Carlos",
      category: "islas",
      description: "36 islas sagradas en el sur del Gran Lago. Cuna de la pintura primitivista y artesanía de madera balsa, petroglifos indígenas y silencio contemplativo.",
      rating: 5,
      reviewCount: 450,
      cooperativeName: "Pintores y Artesanos de Solentiname",
      imageUrl: "assets/images/departamentos/rio san juan1.png",
      badge: "Pintura Primitivista",
      badgeIcon: "fa-palette",
      status: 'published',
      lat: 11.18,
      lng: -85.02,
      priceNio: 550,
      priceUsd: 15,
      priceDetail: "Lancha desde San Carlos C$ 250 | Taller con maestro pintor primitivista C$ 300 | Cabaña rústica con vista al lago C$ 550"
    },
    {
      id: "dest_cayos_perlas",
      name: "Cayos Perlas (Pearl Cays)",
      department: "RACCS",
      municipality: "Laguna de Perlas",
      category: "islas",
      description: "18 cayos caribeños deshabitados de arena blanca y aguas transparentes color esmeralda. Snorkel en arrecifes vírgenes y avistamiento de delfines.",
      rating: 5,
      reviewCount: 380,
      cooperativeName: "Guías Indígenas de Cayos Perlas",
      imageUrl: "assets/images/destinos/corn_island.jpg",
      badge: "Cayos Vírgenes",
      badgeIcon: "fa-sun",
      status: 'published',
      lat: 12.48,
      lng: -83.38,
      priceNio: 950,
      priceUsd: 26,
      priceDetail: "Paseo en lancha ida y vuelta con snorkel C$ 950 | Almuerzo caribeño en el cayo C$ 300"
    },
    {
      id: "dest_isla_del_amor",
      name: "Isla del Amor (Lago Xolotlán)",
      department: "Managua",
      municipality: "Managua",
      category: "islas",
      description: "Isla dentro del Lago de Managua con senderos ecológicos, miradores hacia el Volcán Momotombo, piscinas y travesía en barco desde el Puerto Salvador Allende.",
      rating: 4.7,
      reviewCount: 520,
      cooperativeName: "Tripulación Barco Momotombito",
      imageUrl: "assets/images/departamentos/managua.png",
      badge: "Isla del Xolotlán",
      badgeIcon: "fa-ship",
      status: 'published',
      lat: 12.16,
      lng: -86.29,
      priceNio: 250,
      priceUsd: 7,
      priceDetail: "Boleto de barco ida y vuelta C$ 180 | Acceso piscinas y senderos C$ 150 | Almuerzo buffet C$ 250"
    },
    {
      id: "dest_little_corn_island",
      name: "Little Corn Island",
      department: "RACCS",
      municipality: "Corn Island",
      category: "islas",
      description: "La joya caribeña sin vehículos a motor. Senderos a pie entre selva y cocoteros, playas de postal Otto Beach y buceo de primer orden mundial.",
      rating: 5,
      reviewCount: 710,
      cooperativeName: "Comunidad Isleña de Little Corn",
      imageUrl: "assets/images/destinos/corn_island.jpg",
      badge: "Caribe sin Motores",
      badgeIcon: "fa-person-walking",
      status: 'published',
      lat: 12.29,
      lng: -82.98,
      priceNio: 1100,
      priceUsd: 30,
      priceDetail: "Panga Big Corn a Little Corn C$ 300 | Tour de buceo o snorkel C$ 1,100 | Cabaña frente al mar C$ 950"
    },
    {
      id: "dest_eco_la_fundadora",
      name: "Eco Albergue La Fundadora",
      department: "Matagalpa / Jinotega",
      municipality: "Matagalpa",
      category: "hospedajes",
      description: "Antigua hacienda cafetalera convertida en cooperativa campesina modelo. Senderos a cascadas, ordeño tradicional de vacas y cata de café orgánico.",
      rating: 4.9,
      reviewCount: 310,
      cooperativeName: "Cooperativa Multisectorial La Fundadora",
      imageUrl: "assets/images/destinos/Finca Magdalena Eco-Lodge Campesino.jpg",
      badge: "Finca Modelo",
      badgeIcon: "fa-mug-hot",
      status: 'published',
      lat: 13.02,
      lng: -85.95,
      priceNio: 550,
      priceUsd: 15,
      priceDetail: "Cabaña rústica con desayuno C$ 550 | Tour completo de café y bosque C$ 250 | Comida casera C$ 130"
    },
    {
      id: "dest_campamento_vida_joven",
      name: "Campamento Vida Joven – La Finca",
      department: "Matagalpa",
      municipality: "El Tuma - La Dalia",
      category: "hospedajes",
      description: "Campamento ecológico y finca cafetalera en las montañas de La Dalia con tirolesa sobre lagunas, deportes de aventura y labor social comunitaria.",
      rating: 5,
      reviewCount: 340,
      cooperativeName: "Comunidad La Dalia - Vida Joven",
      imageUrl: "assets/images/destinos/selva_negra.jpg",
      badge: "Aventura & Montaña",
      badgeIcon: "fa-campground",
      status: 'published',
      lat: 13.12,
      lng: -85.8,
      priceNio: 650,
      priceUsd: 18,
      priceDetail: "Estadía con pensión completa C$ 850 | Actividades de aventura y canopy C$ 350 | Tour de café C$ 200"
    },
    {
      id: "gastro_sopa_mondongo",
      name: "Sopa de Mondongo de Masatepe",
      department: "Masaya",
      municipality: "Masatepe",
      category: "gastronomia",
      description: "La reina de las sopas nicaragüenses. Toalla de res en trozos suaves, verduras criollas (quequisque, chayote, elote, yuca), naranja agria y tortillas calientes.",
      rating: 4.9,
      reviewCount: 540,
      cooperativeName: "Soperos Tradicionales de Masatepe",
      imageUrl: "assets/images/comida/nacatamal.jpg",
      badge: "Sopa de Masatepe",
      badgeIcon: "fa-bowl-rice",
      status: 'published',
      lat: 11.9167,
      lng: -86.15,
      priceNio: 220,
      priceUsd: 6,
      priceDetail: "Cazuela grande de sopa con arroz y aguacate C$ 220 | Refresco de chicha C$ 30"
    },
    {
      id: "gastro_gallo_pinto_soberano",
      name: "Gallo Pinto Campesino con Cuajada",
      department: "Nacional",
      municipality: "Managua / Chontales",
      category: "gastronomia",
      description: "Arroz frito y frijoles rojos criollos con cebolla y chiltoma, acompañado de cuajada fresca ahumada de hacienda, plátano frito y crema pura de campo.",
      rating: 5,
      reviewCount: 890,
      cooperativeName: "Fritangueros Campesinos Unidos",
      imageUrl: "assets/images/comida/gallo_pinto.jpg",
      badge: "Plato Insignia",
      badgeIcon: "fa-utensils",
      status: 'published',
      lat: 12.14,
      lng: -86.26,
      priceNio: 120,
      priceUsd: 3.3,
      priceDetail: "Plato completo de gallo pinto con cuajada, huevo y plátano C$ 120 | Café de palo C$ 25"
    },
    {
      id: "gastro_nacatamal_masaya",
      name: "Nacatamal de Masa Campesina",
      department: "Masaya",
      municipality: "Masaya",
      category: "gastronomia",
      description: "Masa de maíz criollo condimentada con manteca de cerdo, carne marinada, arroz, papas, rodajas de tomate, cebolla, hierbabuena y chile en hoja de plátano.",
      rating: 5,
      reviewCount: 680,
      cooperativeName: "Artesanas del Nacatamal Masaya",
      imageUrl: "assets/images/comida/nacatamal.jpg",
      badge: "Nacatamal Dominical",
      badgeIcon: "fa-gift",
      status: 'published',
      lat: 11.98,
      lng: -86.1,
      priceNio: 90,
      priceUsd: 2.5,
      priceDetail: "Nacatamal especial con carne de cerdo y tocino C$ 90 | Pan francés y café negro C$ 30"
    },
    {
      id: "gastro_guirila_matagalpa",
      name: "La Güirila con Cuajada y Crema",
      department: "Matagalpa",
      municipality: "Sébaco",
      category: "gastronomia",
      description: "Tortilla gruesa y dulce elaborada con maíz tierno recién desgranado, asada sobre hoja de plátano al comal de barro, servida con cuajada fresca y crema.",
      rating: 5,
      reviewCount: 610,
      cooperativeName: "Güirileras de Sébaco",
      imageUrl: "assets/images/comida/quesillo.jpg",
      badge: "Maíz Tierno",
      badgeIcon: "fa-wheat-awn",
      status: 'published',
      lat: 12.85,
      lng: -86.09,
      priceNio: 80,
      priceUsd: 2.2,
      priceDetail: "Güirila recién salida con cuajada y crema C$ 80 | Café caliente de montaña C$ 25"
    },
    {
      id: "gastro_fresco_cacao",
      name: "Fresco de Cacao Tradicional en Jícara",
      department: "Granada",
      municipality: "Granada",
      category: "gastronomia",
      description: "Grano de cacao criollo tostado, molido con arroz, canela y leche fresca de hacienda, servido con abundante hielo picado en jícaras artesanales de filigrana.",
      rating: 5,
      reviewCount: 740,
      cooperativeName: "Cacaoteros y Refresqueras de Granada",
      imageUrl: "assets/images/departamentos/granada.jpg",
      badge: "Cacao en Jícara",
      badgeIcon: "fa-mug-saucer",
      status: 'published',
      lat: 11.935,
      lng: -85.95,
      priceNio: 45,
      priceUsd: 1.2,
      priceDetail: "Jícara grande de cacao con leche C$ 45 | Repuesto para llevar C$ 40"
    },
    {
      id: "gastro_pinolillo_carazo",
      name: "Pinolillo Pinolero Tradicional",
      department: "Carazo",
      municipality: "Diriamba",
      category: "gastronomia",
      description: "Bebida nacional a base de maíz blanco tostado y cacao molido con especias sagradas (pimienta de chapa y canela). Servido en jícaras con huacal.",
      rating: 4.9,
      reviewCount: 480,
      cooperativeName: "Tradición Pinolera de Diriamba",
      imageUrl: "assets/images/departamentos/carazo.png",
      badge: "Bebida Sagrada",
      badgeIcon: "fa-glass-water",
      status: 'published',
      lat: 11.85,
      lng: -86.24,
      priceNio: 40,
      priceUsd: 1.1,
      priceDetail: "Huacal de pinolillo frío C$ 40 | Libra de pinolillo molido para llevar C$ 60"
    },
    {
      id: "gastro_fresco_grama",
      name: "Fresco de Grama con Limón",
      department: "Granada",
      municipality: "Granada",
      category: "gastronomia",
      description: "Hierba de grama medicinal hervida con canela y esencia dulce, aromatizada con jugo de limón criollo. La bebida más refrescante del calor granadino.",
      rating: 4.8,
      reviewCount: 390,
      cooperativeName: "Tradición de Refrescos Granadinos",
      imageUrl: "assets/images/departamentos/granada1.jpg",
      badge: "Grama con Limón",
      badgeIcon: "fa-lemon",
      status: 'published',
      lat: 11.93,
      lng: -85.95,
      priceNio: 35,
      priceUsd: 1,
      priceDetail: "Vaso de fresco de grama con hielo picado C$ 35"
    },
    {
      id: "gastro_tres_leches",
      name: "Torta Tres Leches Tradicional",
      department: "Managua",
      municipality: "Managua",
      category: "gastronomia",
      description: "Bizcocho esponjoso bañado en la trinidad láctea de leche evaporada, leche condensada y crema pura de campo, coronado con merengue y canela.",
      rating: 4.9,
      reviewCount: 560,
      cooperativeName: "Repostería Tradicional Managüense",
      imageUrl: "assets/images/comida/baho.jpg",
      badge: "Postre Emblema",
      badgeIcon: "fa-cake-candles",
      status: 'published',
      lat: 12.14,
      lng: -86.26,
      priceNio: 95,
      priceUsd: 2.6,
      priceDetail: "Porción generosa de tres leches C$ 95 | Café de la casa C$ 35"
    },
    {
      id: "gastro_bunuelos_masaya",
      name: "Buñuelos de Yuca con Miel de Rapiña",
      department: "Masaya",
      municipality: "Masaya",
      category: "gastronomia",
      description: "Masa de yuca rallada y queso seco frita hasta quedar dorada y crocante por fuera y suave por dentro, bañada en jarabe hirviendo de dulce de caña.",
      rating: 5,
      reviewCount: 620,
      cooperativeName: "Dulceras de Monimbó",
      imageUrl: "assets/images/comida/nacatamal.jpg",
      badge: "Miel de Caña",
      badgeIcon: "fa-jar",
      status: 'published',
      lat: 11.975,
      lng: -86.09,
      priceNio: 60,
      priceUsd: 1.6,
      priceDetail: "Orden de 3 buñuelos con miel de caña caliente C$ 60"
    },
    {
      id: "gastro_almibar_masaya",
      name: "Almíbar de Papaya, Jocote y Mango",
      department: "Masaya",
      municipality: "Masaya",
      category: "gastronomia",
      description: "Dulce ancestral de Semana Santa y Purísimas elaborado con papaya verde en tiras, jocotes maduros, mangos criollos, grosellas y dulce de rapadura en paila de cobre.",
      rating: 4.9,
      reviewCount: 430,
      cooperativeName: "Dulcería Tradicional Monimbó",
      imageUrl: "assets/images/comida/baho.jpg",
      badge: "Dulce Ancestral",
      badgeIcon: "fa-bowl-food",
      status: 'published',
      lat: 11.97,
      lng: -86.09,
      priceNio: 70,
      priceUsd: 1.9,
      priceDetail: "Porción de almíbar surtido C$ 70 | Tarro familiar para llevar C$ 180"
    },
    {
      id: "art_mercado_masaya",
      name: "Mercado de Artesanías de Masaya",
      department: "Masaya",
      municipality: "Masaya",
      category: "museos",
      description: "Fortaleza neogótica del siglo XIX con más de 200 talleres de artesanos de hamacas, calzado de cuero, madera labrada, máscaras de Güegüense y bailes folclóricos.",
      rating: 5,
      reviewCount: 920,
      cooperativeName: "Cooperativa de Artesanos de Masaya",
      imageUrl: "assets/images/departamentos/masaya.png",
      badge: "Cuna del Folclore",
      badgeIcon: "fa-masks-theater",
      status: 'published',
      lat: 11.973,
      lng: -86.095,
      priceNio: 150,
      priceUsd: 4,
      priceDetail: "Entrada libre al mercado | Espectáculo de folclore los jueves C$ 100 | Artesanías desde C$ 80"
    },
    {
      id: "art_ceramica_negra",
      name: "Talleres de Cerámica Negra de Matagalpa",
      department: "Matagalpa",
      municipality: "San Ramón",
      category: "museos",
      description: "Técnica precolombina de bruñido con piedra de río y ahumado con pino y hojas secas que otorga a las piezas un negro azabache brillante único en el mundo.",
      rating: 4.9,
      reviewCount: 390,
      cooperativeName: "Cooperativa de Mujeres Artesanas de San Ramón",
      imageUrl: "assets/images/departamentos/matagalpa1.png",
      badge: "Barro Bruñido",
      badgeIcon: "fa-hand-sparkles",
      status: 'published',
      lat: 12.98,
      lng: -85.85,
      priceNio: 180,
      priceUsd: 5,
      priceDetail: "Taller demostrativo de ahumado C$ 180 | Pieza artesanal desde C$ 150 | Café matagalpino C$ 30"
    },
    {
      id: "art_telares_chile",
      name: "Telares Indígenas El Chile",
      department: "Matagalpa",
      municipality: "San Ramón",
      category: "museos",
      description: "Hilado manual de algodón teñido con tintes botánicos naturales (corteza de mora, cáscara de jícaro, achiote) en telares tradicionales de madera.",
      rating: 4.9,
      reviewCount: 310,
      cooperativeName: "Cooperativa Telares Indígenas El Chile",
      imageUrl: "assets/images/departamentos/matagalpa.png",
      badge: "Tintes Botánicos",
      badgeIcon: "fa-rug",
      status: 'published',
      lat: 12.9,
      lng: -85.8,
      priceNio: 150,
      priceUsd: 4,
      priceDetail: "Demostración de telar y tinte natural C$ 150 | Bolso tejido a mano desde C$ 250"
    },
    {
      id: "art_mercado_huembes",
      name: "Mercado Roberto Huembes (Pabellón de Artesanías)",
      department: "Managua",
      municipality: "Managua",
      category: "museos",
      description: "El mayor concentrador de artesanía nacional de los 15 departamentos y 2 regiones autónomas, guitarras de Masaya, hamacas, cuero y dulces de la Purísima.",
      rating: 4.8,
      reviewCount: 710,
      cooperativeName: "Asociación de Comerciantes de Artesanía Huembes",
      imageUrl: "assets/images/departamentos/managua.png",
      badge: "Gran Bazar Nacional",
      badgeIcon: "fa-store",
      status: 'published',
      lat: 12.122,
      lng: -86.248,
      priceNio: 100,
      priceUsd: 2.8,
      priceDetail: "Acceso libre | Artesanías y recuerdos desde C$ 50 | Almuerzo típico de mercado C$ 120"
    },
    {
      id: "art_loma_panda",
      name: "Cooperativa de Artesanas de Loma Panda",
      department: "Estelí",
      municipality: "San Juan de Limay",
      category: "museos",
      description: "Esculturas talladas en piedra marmolina extraída de los cerros de Limay. Las mujeres de Loma Panda plasman figuras campesinas y maternidades célebres.",
      rating: 4.9,
      reviewCount: 270,
      cooperativeName: "Cooperativa de Mujeres Escultoras de Marmolina",
      imageUrl: "assets/images/departamentos/esteli.png",
      badge: "Piedra Marmolina",
      badgeIcon: "fa-gem",
      status: 'published',
      lat: 13.29,
      lng: -86.61,
      priceNio: 200,
      priceUsd: 5.5,
      priceDetail: "Demostración de tallado en piedra de marmolina C$ 150 | Escultura original desde C$ 250"
    },
    {
      id: "art_san_juan_oriente",
      name: "Talleres de Alfarería San Juan de Oriente",
      department: "Masaya",
      municipality: "San Juan de Oriente",
      category: "museos",
      description: "Pueblo de alfareros milenarios donde casi todas las casas cuentan con horno de leña y torno. Réplicas precolombinas polícromas y cerámica contemporánea.",
      rating: 5,
      reviewCount: 840,
      cooperativeName: "Gremio de Maestros Alfareros",
      imageUrl: "assets/images/departamentos/masaya1.png",
      badge: "Alfarería Precolombina",
      badgeIcon: "fa-vihara",
      status: 'published',
      lat: 11.905,
      lng: -86.078,
      priceNio: 150,
      priceUsd: 4,
      priceDetail: "Taller interactivo de modelado de vasija C$ 150 | Piezas cerámicas de autor desde C$ 200"
    },
    {
      id: "art_totogalpa_tusa",
      name: "Totogalpa – Artesanías de Tusa de Maíz",
      department: "Madriz",
      municipality: "Totogalpa",
      category: "museos",
      description: "Mujeres indígenas segovianas transforman la hoja seca de la mazorca (tusa) en muñecas tradicionales, flores de colores botánicos y cuadros decorativos.",
      rating: 4.8,
      reviewCount: 290,
      cooperativeName: "Cooperativa de Artesanas de Tusa Totogalpa",
      imageUrl: "assets/images/departamentos/somoto.jpg",
      badge: "Artesanías de Tusa",
      badgeIcon: "fa-spa",
      status: 'published',
      lat: 13.56,
      lng: -86.49,
      priceNio: 120,
      priceUsd: 3.3,
      priceDetail: "Taller de confección de muñeca de tusa C$ 120 | Recuerdos artesanales desde C$ 50"
    },
    {
      id: "art_hamacas_masaya",
      name: "Talleres Tradicionales de Hamacas de Masaya",
      department: "Masaya",
      municipality: "Masaya",
      category: "museos",
      description: "Hamacas tejidas punto a punto con hilo de algodón 100%, flecos de madera tallada y varillas de laurel. El reposo campesino elevado a arte patrimonio.",
      rating: 5,
      reviewCount: 760,
      cooperativeName: "Tejedores de Hamacas de Monimbó",
      imageUrl: "assets/images/departamentos/masaya.png",
      badge: "Hamacas de Algodón",
      badgeIcon: "fa-bed",
      status: 'published',
      lat: 11.97,
      lng: -86.09,
      priceNio: 650,
      priceUsd: 18,
      priceDetail: "Hamaca matrimonial de lujo tejida en macramé C$ 1,200 | Hamaca personal C$ 650 | Visita al taller libre"
    }
  ];

  // -----------------------------------------------------------------------
  // CARGA DE DESTINOS PUBLICADOS DESDE FIRESTORE
  // -----------------------------------------------------------------------
  async function loadPublishedPlaces(callback) {
    try {
      if (!window.firebase || !window.firebase.firestore) {
        console.warn('[BaqueanoFirestore] SDK no disponible — usando datos semilla.');
        if (typeof callback === 'function') callback(SEED_PLACES, 'seed');
        return SEED_PLACES;
      }

      const db = window.firebase.firestore();
      const snapshot = await db.collection('places')
        .where('status', '==', 'published')
        .orderBy('name')
        .limit(250)
        .get();

      if (snapshot.empty) {
        console.info('[BaqueanoFirestore] Colección /places vacía — usando datos semilla.');
        if (typeof callback === 'function') callback(SEED_PLACES, 'seed');
        return SEED_PLACES;
      }

      const places = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (typeof callback === 'function') callback(places, 'firestore');
      return places;
    } catch (err) {
      console.error('[BaqueanoFirestore] Error cargando places:', err.message);
      if (typeof callback === 'function') callback(SEED_PLACES, 'seed');
      return SEED_PLACES;
    }
  }

  // -----------------------------------------------------------------------
  // MÉTRICAS DEL OPS CENTER EN TIEMPO REAL (onSnapshot)
  // -----------------------------------------------------------------------
  let metricsUnsubscribe = null;

  function listenAdminMetrics(callback) {
    if (!window.firebase || !window.firebase.firestore) {
      // Métricas de referencia para desarrollo
      callback({
        totalPlaces: 0, publishedPlaces: 0, totalBusinesses: 0, totalAuditLogs: 0, activeSessions: 0, source: "unavailable"
      });
      return null;
    }

    const db = window.firebase.firestore();

    // Escucha en tiempo real la colección /places
    metricsUnsubscribe = db.collection('places')
      .onSnapshot(snapshot => {
        const total = snapshot.size;
        const published = snapshot.docs.filter(d => d.data().status === 'published').length;
        callback({
          totalPlaces: total,
          publishedPlaces: published,
          source: 'firestore'
        });
      }, err => {
        console.error('[BaqueanoFirestore] Error en listenAdminMetrics:', err.message);
      });

    return metricsUnsubscribe;
  }

  function stopListeningMetrics() {
    if (metricsUnsubscribe) {
      metricsUnsubscribe();
      metricsUnsubscribe = null;
    }
  }

  // -----------------------------------------------------------------------
  // REGISTRO DE NEGOCIO/ANFITRIÓN EN /businesses
  // -----------------------------------------------------------------------
  async function registerBusiness(data) {
    const businessId = `biz_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const record = {
      id: businessId,
      ...data,
      status: 'pending_review',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (window.firebase && window.firebase.firestore) {
        const db = window.firebase.firestore();
        await db.collection('businesses').doc(businessId).set(record);
        console.info('[BaqueanoFirestore] Negocio registrado en Firestore:', businessId);
      } else {
        console.warn('[BaqueanoFirestore] Firestore no disponible. Registro local:', record);
      }
      return businessId;
    } catch (err) {
      console.error('[BaqueanoFirestore] Error registrando negocio:', err.message);
      throw err;
    }
  }

  // -----------------------------------------------------------------------
  // FAVORITOS DEL EXPLORADOR EN /user_saved_places
  // -----------------------------------------------------------------------
  async function savePlace(userId, placeId) {
    if (!userId || !placeId) throw new Error('userId y placeId son requeridos');

    const savedId = `${userId}_${placeId}`;
    const record = {
      id: savedId,
      userId: userId,
      placeId: placeId,
      savedAt: new Date().toISOString()
    };

    if (window.firebase && window.firebase.firestore) {
      const db = window.firebase.firestore();
      await db.collection('user_saved_places').doc(savedId).set(record);
    }

    // Sincronización local como respaldo
    const local = JSON.parse(localStorage.getItem('baqueano_favs') || '[]');
    if (!local.includes(placeId)) {
      local.push(placeId);
      localStorage.setItem('baqueano_favs', JSON.stringify(local));
    }
  }

  async function removeSavedPlace(userId, placeId) {
    if (!userId || !placeId) throw new Error('userId y placeId son requeridos');

    const savedId = `${userId}_${placeId}`;

    if (window.firebase && window.firebase.firestore) {
      const db = window.firebase.firestore();
      await db.collection('user_saved_places').doc(savedId).delete();
    }

    const local = JSON.parse(localStorage.getItem('baqueano_favs') || '[]');
    const filtered = local.filter(id => id !== placeId);
    localStorage.setItem('baqueano_favs', JSON.stringify(filtered));
  }

  async function getUserSavedPlaces(userId) {
    if (!userId) return JSON.parse(localStorage.getItem('baqueano_favs') || '[]');

    try {
      if (window.firebase && window.firebase.firestore) {
        const db = window.firebase.firestore();
        const snapshot = await db.collection('user_saved_places')
          .where('userId', '==', userId)
          .get();
        return snapshot.docs.map(doc => doc.data().placeId);
      }
    } catch (err) {
      console.error('[BaqueanoFirestore] Error cargando favoritos:', err.message);
    }

    return JSON.parse(localStorage.getItem('baqueano_favs') || '[]');
  }

  // -----------------------------------------------------------------------
  // DENUNCIAS AMBIENTALES EN /environmental_reports
  // -----------------------------------------------------------------------
  async function submitEnvReport(data) {
    const reportId = `env_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const record = {
      id: reportId,
      ...data,
      status: 'received',
      createdAt: new Date().toISOString()
    };

    if (window.firebase && window.firebase.firestore) {
      const db = window.firebase.firestore();
      await db.collection('environmental_reports').doc(reportId).set(record);
    }

    return reportId;
  }

  // -----------------------------------------------------------------------
  // LOGS DE AUDITORÍA INMUTABLES DESDE /audit_logs
  // -----------------------------------------------------------------------
  async function loadAuditLogs(callback) {
    try {
      if (!window.firebase || !window.firebase.firestore) {
        callback([], 'seed');
        return;
      }

      const db = window.firebase.firestore();
      const snapshot = await db.collection('audit_logs')
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();

      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(logs, 'firestore');
    } catch (err) {
      console.error('[BaqueanoFirestore] Error cargando audit_logs:', err.message);
      callback([], 'error');
    }
  }

  // -----------------------------------------------------------------------
  // ESCRITURA DE AUDIT LOG ADMINISTRATIVO
  // -----------------------------------------------------------------------
  async function writeAuditLog(action, detail, userEmail) {
    const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const entry = {
      id: logId,
      action: action,
      detail: detail,
      performedBy: userEmail || 'system',
      timestamp: new Date().toISOString(),
      source: 'web_admin'
    };

    if (window.firebase && window.firebase.firestore) {
      try {
        const db = window.firebase.firestore();
        await db.collection('audit_logs').doc(logId).set(entry);
      } catch (err) {
        console.error('[BaqueanoFirestore] Error escribiendo audit log:', err.message);
      }
    }

    return logId;
  }

  // API pública del módulo
  return {
    loadPublishedPlaces,
    listenAdminMetrics,
    stopListeningMetrics,
    registerBusiness,
    savePlace,
    removeSavedPlace,
    getUserSavedPlaces,
    submitEnvReport,
    loadAuditLogs,
    writeAuditLog,
    SEED_PLACES
  };

})();
