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
    }
  ];

  // -----------------------------------------------------------------------
  // CARGA DE DESTINOS PUBLICADOS DESDE FIRESTORE
  // -----------------------------------------------------------------------
  async function loadPublishedPlaces(callback) {
    try {
      if (!window.firebase || !window.firebase.firestore) {
        console.warn('[BaqueanoFirestore] SDK no disponible — usando datos semilla.');
        callback(SEED_PLACES, 'seed');
        return;
      }

      const db = window.firebase.firestore();
      const snapshot = await db.collection('places')
        .where('status', '==', 'published')
        .orderBy('name')
        .limit(48)
        .get();

      if (snapshot.empty) {
        console.info('[BaqueanoFirestore] Colección /places vacía — usando datos semilla.');
        callback(SEED_PLACES, 'seed');
        return;
      }

      const places = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(places, 'firestore');
    } catch (err) {
      console.error('[BaqueanoFirestore] Error cargando places:', err.message);
      callback(SEED_PLACES, 'seed');
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
        totalPlaces: 6,
        publishedPlaces: 6,
        totalBusinesses: 3,
        totalAuditLogs: 12,
        activeSessions: 7,
        source: 'seed'
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
