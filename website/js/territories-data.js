// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — BASE DE CONOCIMIENTO TERRITORIAL (territories-data.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una fuente de verdad estructurada y exhaustiva para los 17 territorios
//   de Nicaragua (15 Departamentos y 2 Regiones Autónomas).
// - Capacitar al turista nacional e internacional con información auténtica:
//   historia, gastronomía, lugares clave, actividades vivas, cultura, clima y acceso.
// - Conectar cada territorio con sus cooperativas campesinas y guías baqueanos locales.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Estructura uniforme en 12 dimensiones para cada territorio.
// - Objeto inmutable expuesto globalmente en `window.BAQUEANO_TERRITORIES`.
// - Soporta renderizado dinámico en historia.html, departamento.html y el cotizador.
//
// 📦 3. QUÉ (WHAT / DATOS EXPUESTOS):
// - 17 Objetos territoriales completos con coordenadas, fotos, gastronomía,
//   rutas de acceso, recomendaciones y llamadas a la acción.
// ============================================================================

window.BAQUEANO_TERRITORIES = [
  {
    id: 'madriz',
    name: 'Madriz',
    tagline: 'Tierra de Cañones Milenarios, Rosquillas Doradas, Café y Montañas Segovianas',
    shortDesc: 'No vengás solamente a conocer Madriz. Vení a comprenderlo. Una tierra de 9 municipios donde la geología milenaria del Geoparque Mundial UNESCO Río Coco, la tradición campesina del maíz, cafetales de altura, artesanía ancestral y el espíritu segoviano construyen una identidad única en Nicaragua.',
    capital: 'Somoto',
    culturalRegion: 'Las Segovias · Norte de Nicaragua',
    municipalitiesCount: 9,
    territoriesList: 'Somoto · Totogalpa · Telpaneca · San Juan del Río Coco · Yalagüina · Palacagüina · San Lucas · Las Sabanas · San José de Cusmapa',
    identitySummary: 'Geología · Cultura indígena · Café · Maíz · Rosquillas · Artesanía · Música campesina · Bosques · Turismo rural · Aventura',
    history: 'Constituido en 1936 en honor al expresidente José Madriz al separarse de Nueva Segovia. Su historia viva es milenaria: habitado por pueblos originarios Chorotegas y etnias norteñas, sus valles y cañones resguardan petroglifos prehispánicos, templos coloniales declarados Patrimonio Cultural de la Nación y la memoria de las luchas patrias en Las Segovias.',
    geopark: {
      name: 'Geoparque Mundial UNESCO Río Coco',
      year: 2020,
      areaHa: 95400,
      significance: 'Primer Geoparque Mundial de la UNESCO en Centroamérica',
      maxAltitude: 'Cerro Volcán de Somoto (~1,730 msnm)',
      geositesCount: 12
    },
    municipalities: [
      {
        id: 'somoto',
        name: 'Somoto',
        badge: 'Cabecera Departamental',
        title: 'Cañón, Rosquillas y Música Campesina',
        desc: 'Cabecera departamental y puerta principal del Monumento Nacional Cañón de Somoto. Conectada por la Carretera Panamericana Norte, destaca por sus talleres rosquilleros tradicionales, las fiestas patronales de Santiago Apóstol y su centro histórico.',
        vivi: 'Cañón de Somoto · Geología · Rosquillas en horno de leña · Música segoviana · Centro histórico · Fiestas tradicionales',
        icon: 'fa-water',
        lat: 13.4833,
        lng: -86.5833
      },
      {
        id: 'yalaguina',
        name: 'Yalagüina',
        badge: 'Tierra del Maíz',
        title: 'Rosquillas Tradicionales y Bosque Seco',
        desc: 'Comparte con Somoto la centenaria tradición rosquillera en hornos de barro. Alberga el Parque Natural Zonzapote, Cerro El Cobre, Cerro Quizuca y la legendaria Poza Bruja, con una vibrante tradición de polkas y mazurcas.',
        vivi: 'Rosquillas recién horneadas · Senderos de montaña · Miradores · Música segoviana · Cocina del maíz',
        icon: 'fa-bread-slice',
        lat: 13.4833,
        lng: -86.5000
      },
      {
        id: 'totogalpa',
        name: 'Totogalpa',
        badge: 'Cultura Indígena',
        title: 'Patrimonio Ancestral y Turismo Rural',
        desc: 'Conserva profundas raíces indígenas y arqueología. La comunidad de San José de Palmira ofrece turismo rural comunitario con cabalgatas y senderos. Su templo parroquial es Patrimonio Cultural de la Nación.',
        vivi: 'Comunidad indígena · Arqueología viva · Museo El Almendro · Artesanía · Convivencia comunitaria',
        icon: 'fa-hands-holding-circle',
        lat: 13.5667,
        lng: -86.4833
      },
      {
        id: 'san-lucas',
        name: 'San Lucas',
        badge: 'Artesanía en Barro',
        title: 'Cerámica Ancestral y Memoria Viva',
        desc: 'Hogar de las reconocidas Mujeres Artesanas de Loma Panda, quienes moldean barro con técnicas precolombinas. En sus valles se conservan geositios como La Remedona y rica música de cuerda campesina.',
        vivi: 'Alfarería en barro · Cultura indígena · Geositio La Remedona · Finca rural · Convivencia campesina',
        icon: 'fa-palette',
        lat: 13.4167,
        lng: -86.6000
      },
      {
        id: 'las-sabanas',
        name: 'Las Sabanas',
        badge: 'Nebliselva & Laguna',
        title: 'Laguna La Bruja, Café y Alturas Segovianas',
        desc: 'Ubicado en la Reserva Tepesomoto-La Pataste con alturas superiores a los 1,700 msnm. En la comunidad El Pegador se ubica la mística Laguna La Bruja, con senderismo, avistamiento de aves y canopy.',
        vivi: 'Laguna La Bruja · Bosque nuboso · Café de altura · Senderismo de montaña · Fotografía de paisaje',
        icon: 'fa-tree',
        lat: 13.3500,
        lng: -86.6167
      },
      {
        id: 'san-jose-de-cusmapa',
        name: 'San José de Cusmapa',
        badge: 'El Gran Balcón',
        title: 'Miradores Hacia el Pacífico y Cestería en Pino',
        desc: 'El municipio más encumbrado de Madriz. El Mirador El Balcón ofrece panorámicas espectaculares hacia la cadena volcánica del Pacífico. Célebre por sus artesanías tejidas en acícula de pino, La Mano del Diablo y Cueva de la Tuma.',
        vivi: 'Mirador El Balcón · Cestería en acícula de pino · Bosque de pino · Historia indígena · Mazurcas con acordeón',
        icon: 'fa-mountain-sun',
        lat: 13.2833,
        lng: -86.6500
      },
      {
        id: 'san-juan-del-rio-coco',
        name: 'San Juan del Río Coco',
        badge: 'Territorio del Café',
        title: 'Aroma de Café, Cascadas y Nebliselva',
        desc: 'Corazón cafetalero de Madriz de clima fresco y brumoso. Fincas agroturísticas vivenciales donde se vive la ruta de la planta a la taza, Parque Natural El Majaste y cascadas rodeadas de orquídeas.',
        vivi: 'Café de estricta altura · Fincas vivenciales · Cascadas cristalinas · Bosque nuboso · Cabalgatas',
        icon: 'fa-mug-hot',
        lat: 13.5500,
        lng: -86.1667
      },
      {
        id: 'telpaneca',
        name: 'Telpaneca',
        badge: 'Pueblo del Río Coco',
        title: 'Río Sagrado, Memoria y Gastronomía Rural',
        desc: 'Asentamiento prehispánico a orillas del majestuoso Río Coco (Wangki). Posee una amplia gastronomía ancestral del maíz, la Reserva Hídrica El Malacate, petroglifos en El Limón y un templo histórico dedicado a Cristo Rey.',
        vivi: 'Ribera del Río Coco · Memoria indígena · Reserva El Malacate · Cocina campesina · Música rural',
        icon: 'fa-water',
        lat: 13.5333,
        lng: -86.2833
      },
      {
        id: 'palacaguina',
        name: 'Palacagüina',
        badge: 'Historia Segoviana',
        title: 'Memoria Histórica, Cerro de la Iguana y Tradición',
        desc: 'Inmortalizada en el cancionero nacional por la pieza "El Cristo de Palacagüina". Sus serranías resguardan la Piedra del Sapo, Cerro de la Iguana y monumentos al general Miguel Ángel Ortez.',
        vivi: 'Historia patria · Paisaje segoviano · Caminatas rurales · Antigua iglesia María Reina · Cancionero popular',
        icon: 'fa-landmark',
        lat: 13.4500,
        lng: -86.4000
      }
    ],
    canonSomoto: {
      distanceFromSomoto: '15 km',
      protectedAreaHa: 170.3,
      lengthKm: 3.0,
      wallHeightMeters: '80 a 100 m (hasta 190 m en sectores de falla)',
      confluence: 'Confluencia del Río Comalí (Honduras) y Río Tapacalí (Nicaragua), donde nace el Río Coco o Wangki',
      nationalMonumentYear: 2006,
      activities: ['Senderismo interpretativo', 'Navegación en bote de remos con baqueano', 'Flotación guiada en neumáticos', 'Fotografía geológica', 'Trail running de montaña']
    },
    gastronomy: [
      { name: 'Rosquillas de Somoto y Yalagüina', desc: 'Elaboradas artesanalmente con maíz blanco seleccionado, queso seco criollo, cuajada fresca y mantequilla de hacienda, doradas a leña en hornos de barro.' },
      { name: 'Viejitas y Hojaldras', desc: 'Bocados crujientes de masa de maíz con dulce de panela (rapadura) derretida en su centro.' },
      { name: 'Montucas Madricenses', desc: 'Tamal tierno de elote condimentado con pollo de patio, hierbabuena, leche y un toque sutil de chile congo.' },
      { name: 'Café de Estricta Altura', desc: 'Variedades Caturra, Borbón y Catuaí cultivadas bajo sombra de montaña en San Juan del Río Coco entre 1,000 y 1,400 msnm.' },
      { name: 'Gorditas de Maíz y Güirilas', desc: 'Tortas dulces asadas en hojas de plátano acompañadas con cuajada fresca de hacienda.' },
      { name: 'Rosquillas en Miel de Caña', desc: 'Postre tradicional de Semana Santa y fiestas patronales bañado en almíbar de dulce de atado.' }
    ],
    places: [
      { name: 'Monumento Nacional Cañón de Somoto', type: 'Geositio / Geoparque UNESCO', icon: 'fa-water' },
      { name: 'Reserva Natural Tepesomoto-La Pataste', type: 'Bosque Nuboso & Biodiversidad', icon: 'fa-tree' },
      { name: 'Laguna La Bruja (Las Sabanas)', type: 'Humedal de Altura & Canopy', icon: 'fa-water' },
      { name: 'Mirador El Balcón (San José de Cusmapa)', type: 'Vistas al Pacífico & Serranías', icon: 'fa-mountain-sun' },
      { name: 'Parque Natural El Majaste (San Juan del Río Coco)', type: 'Cafetales de Altura & Cascadas', icon: 'fa-leaf' },
      { name: 'Comunidad Indígena San José de Palmira (Totogalpa)', type: 'Turismo Rural Comunitario', icon: 'fa-hands-holding-circle' },
      { name: 'Talleres de Cerámica de Loma Panda (San Lucas)', type: 'Alfarería Prehispánica', icon: 'fa-palette' },
      { name: 'Parque Arqueológico Piedras Pintadas', type: 'Petroglifos & Memoria Viva', icon: 'fa-feather' }
    ],
    activities: [
      'Navegación y flotación guiada entre las paredes milenarias del Cañón de Somoto',
      'Ruta vivencial de las rosquillas: del amasado campesino al horno de leña',
      'Ruta del Café: recorrido desde el almácigo y floración hasta el tostado y taza en finca',
      'Taller vivencial de cestería con acícula de pino en San José de Cusmapa',
      'Senderismo y avistamiento de aves en los pinares y nebliselva de Tepesomoto-La Pataste',
      'Interpretación geológica del origen del Río Coco con baqueanos locales'
    ],
    culture: 'Cuna de la música de polkas, mazurcas y valses segovianos interpretados con guitarra campesina, acordeón y violín de talalate. Tierra natal de compositores legendarios como Carlos Mejía Godoy, Luis Enrique Mejía Godoy y Luis Enrique. Fiestas patronales de Santiago Apóstol en Somoto (25 de julio) y el tradicional Festival de los Burritos Somoteños.',
    bestSeason: 'Noviembre a mayo ofrece condiciones ideales para recorrer los senderos y navegar las aguas cristalinas del Cañón. Durante la época de cosecha de café (diciembre a marzo), San Juan del Río Coco vive su mayor esplendor productivo.',
    howToReach: 'Desde Managua por la Carretera Panamericana Norte (NIC-1), pasando por Sébaco y Estelí hasta llegar a Somoto (216 km, aprox. 3.5 a 4 horas). Buses expresos y ordinarios parten diariamente desde la Terminal del Mercado El Mayoreo en Managua.',
    recommendations: 'Llevar calzado con agarre para agua y rocas (no sandalias lisas), ropa de secado rápido, protector solar y repelente biodegradables, dinero en efectivo en córdobas para compras directas a cooperativas y respetar en todo momento las normas de preservación geológica del Geoparque UNESCO.',
    heroImage: 'assets/images/madriz/canon_somoto_panoramica.jpg',
    userImages: [
      'assets/images/madriz/canon_somoto_interior.png',
      'assets/images/madriz/canon_somoto_bote.png',
      'assets/images/madriz/canon_somoto_panoramica.jpg'
    ],
    lat: 13.4833,
    lng: -86.5833,
    coopCount: 14
  },
  {
    id: 'leon',
    name: 'León',
    tagline: 'Donde la historia camina entre volcanes',
    shortDesc: 'León es historia, poesía, volcanes, playas del Pacífico, arquitectura monumental y vida cultural. Desde los tejados blancos de su Catedral hasta las arenas negras del Cerro Negro, el departamento permite descubrir una Nicaragua donde patrimonio, aventura, comunidades y naturaleza conviven en un mismo territorio.',
    expandedDescription: 'El departamento de León combina uno de los patrimonios históricos más importantes de Nicaragua con una impresionante cadena volcánica y extensas costas sobre el Pacífico. Su cabecera, Santiago de los Caballeros de León, destaca por su arquitectura, museos, iglesias, universidades y profunda relación con la literatura nicaragüense. Fuera de la ciudad aparecen volcanes, playas, manglares, comunidades artesanales, sitios arqueológicos y ciudades con tradiciones propias.',
    municipalities: [
      { name: 'León', identity: 'Patrimonio, cultura, universidades, museos y arquitectura' },
      { name: 'La Paz Centro', identity: 'León Viejo, artesanía de barro, quesillo y Momotombo' },
      { name: 'Nagarote', identity: 'Gastronomía, quesillo, costa y cultura local' },
      { name: 'Telica', identity: 'Volcán Telica y Hervideros de San Jacinto' },
      { name: 'El Sauce', identity: 'Santuario del Señor de Esquipulas y turismo rural' },
      { name: 'Larreynaga', identity: 'Artesanía y comunidades rurales' },
      { name: 'Santa Rosa del Peñón', identity: 'Paisajes, minería histórica y naturaleza' },
      { name: 'Achuapa', identity: 'Montañas y turismo rural' },
      { name: 'El Jicaral', identity: 'Arqueología y paisaje rural' },
      { name: 'Quezalguaque', identity: 'Cultura comunitaria y patrimonio local' }
    ],
    history: 'La primera ciudad de León fue fundada en 1524 por Francisco Hernández de Córdoba cerca del actual Puerto Momotombo. Tras los desastres naturales y el terremoto de 1610, el asentamiento fue trasladado al sitio actual. Las ruinas de León Viejo fueron inscritas por UNESCO como Patrimonio Mundial en 2000 y la Catedral de León en 2011. La ciudad actual se convirtió en uno de los principales centros religiosos, políticos, universitarios e intelectuales del país; conserva una relación profunda con Rubén Darío, la poesía, el teatro, la pintura, el muralismo, la música, los movimientos estudiantiles, las tradiciones religiosas y las leyendas populares.',
    gastronomy: [
      { name: 'Ruta del Quesillo', desc: 'Nagarote y La Paz Centro comparten esta tradición de tortilla, queso, crema y cebolla encurtida.' },
      { name: 'Cocina Tradicional', desc: 'Vigorón, nacatamal, indio viejo, chancho con yuca, carne asada y tamales.' },
      { name: 'Sopas y Maíz', desc: 'Sopa de res, sopa de queso, güirilas y tortillas preparadas con saberes familiares.' },
      { name: 'Lácteos y Dulces', desc: 'Quesos, cajetas, rosquillas y otros dulces tradicionales de occidente.' },
      { name: 'Bebidas de Identidad', desc: 'Cacao, pinolillo, tiste, chicha y distintas bebidas tradicionales de maíz.' },
      { name: 'Sabores del Centro Histórico', desc: 'Mercados, dulcerías, cafés y emprendimientos familiares con cocina local.' }
    ],
    places: [
      { name: 'Insigne Basílica Catedral de León', type: 'Patrimonio Mundial, arquitectura, religión y fotografía', icon: 'fa-church' },
      { name: 'Museo Archivo Rubén Darío', type: 'Literatura, historia e identidad nacional', icon: 'fa-book-open' },
      { name: 'Museo de la Revolución', type: 'Historia política reciente y memoria nacional', icon: 'fa-landmark' },
      { name: 'Centro de Arte Fundación Ortiz Gurdián', type: 'Arte latinoamericano y europeo', icon: 'fa-palette' },
      { name: 'Iglesia San Juan Bautista de Sutiaba', type: 'Patrimonio indígena, arquitectura y memoria', icon: 'fa-place-of-worship' },
      { name: 'Teatro Municipal José de la Cruz Mena', type: 'Cultura, música, arquitectura y artes escénicas', icon: 'fa-masks-theater' },
      { name: 'Museo de Mitos y Leyendas', type: 'Narrativa popular y memoria viva', icon: 'fa-book-skull' },
      { name: 'Volcán Cerro Negro', type: 'Senderismo, ascenso volcánico y sandboarding', icon: 'fa-volcano' },
      { name: 'Volcán Telica', type: 'Senderismo, fotografía y observación geológica', icon: 'fa-mountain-sun' },
      { name: 'Hervideros de San Jacinto', type: 'Geología, educación ambiental y turismo comunitario', icon: 'fa-temperature-high' },
      { name: 'Volcán El Hoyo', type: 'Senderismo, campamento y aventura', icon: 'fa-mountain' },
      { name: 'Volcán Momotombo', type: 'Paisaje volcánico, historia y lago Xolotlán', icon: 'fa-volcano' },
      { name: 'Ruinas de León Viejo', type: 'Patrimonio Mundial y arqueología colonial', icon: 'fa-landmark' },
      { name: 'Las Peñitas y Poneloya', type: 'Playa, surf, gastronomía marina y atardeceres', icon: 'fa-umbrella-beach' },
      { name: 'Isla Juan Venado', type: 'Manglares, fauna, lancha y kayak', icon: 'fa-water' }
    ],
    activities: [
      'Aventura: sandboarding, trekking volcánico, campamento y fotografía',
      'Pacífico: surf, playa, kayak, manglares y paseos en lancha',
      'Cultura: recorridos urbanos, museos, iglesias, arquitectura y muralismo',
      'Literatura: Ruta Rubén Darío, poesía, bibliotecas y museos',
      'Gastronomía: Ruta del Quesillo, mercados, dulcerías y cocina local',
      'Comunidad: talleres artesanales, barro, cocina tradicional y guías locales',
      'Caminata por las terrazas blancas de la Catedral y observación del centro histórico',
      'Recorrido de mitos, leyendas y memoria viva por León y Sutiaba'
    ],
    culture: 'León vive La Gritería, la Gritería Chiquita de agosto, la Semana Santa con procesiones y alfombras, y la tradición de la Gigantona y el Enano Cabezón. Sutiaba conserva una identidad propia vinculada con el pueblo originario, la memoria, la gastronomía y la artesanía. Leyendas como la Carreta Nagua, la Mocuana, la Cegua, el Padre sin Cabeza y el Punche de Oro forman parte de su memoria popular.',
    bestSeason: 'La ciudad merece de 1 a 2 días; para conocer el departamento con volcanes, costa y León Viejo se recomiendan de 3 a 5 días. La estación seca facilita las excursiones al aire libre.',
    howToReach: 'Desde Managua se llega por la Carretera Nueva a León (NIC-12), en un recorrido aproximado de 90 km. Hay buses tradicionales desde el sector de Israel Lewites y servicios interlocales.',
    recommendations: 'No intentar combinar Cerro Negro, ciudad, playa y León Viejo en pocas horas. Conviene dividir el territorio por experiencias, hidratarse por el calor de occidente y utilizar equipo adecuado para volcanes, playa y actividades de aventura.',
    officialHighlights: [
      'Visita Nicaragua confirma que la Catedral de León es la más grande de Centroamérica y permite acceder a su techo blanco.',
      'El Museo de la Revolución se incorpora a la oferta cultural por sus exposiciones sobre la historia política reciente.',
      'INTUR confirma la diversidad de los 10 municipios: cordilleras, arqueología, santuarios, volcanes, barro, quesillo y artesanía.'
    ],
    officialSources: [
      { label: 'Visita Nicaragua — León', url: 'https://www.visitanicaragua.com/en/Destinations/leon/' },
      { label: 'INTUR — León siempre lindo', url: 'https://www.intur.gob.ni/2018/09/03/leon-siempre-lindo-ycool/' }
    ],
    officialVerifiedAt: '26 de septiembre de 2026',
    heroImage: 'assets/images/destinos/cerro_negro.jpg',
    lat: 12.5063,
    lng: -86.7017,
    coopCount: 22
  },
  {
    id: 'rivas',
    name: 'Rivas',
    tagline: 'Donde el Pacífico encuentra al Cocibolca',
    shortDesc: 'Rivas se extiende entre el océano Pacífico y el lago Cocibolca. En un solo departamento reúne Ometepe, los volcanes Concepción y Maderas, playas de surf, refugios de tortugas, arqueología, navegación, comunidades pesqueras y turismo rural.',
    expandedDescription: 'Su posición entre dos aguas convierte a Rivas en un corredor natural e histórico. San Jorge abre la ruta lacustre hacia Ometepe; San Juan del Sur y Tola conectan con el Pacífico, mientras la ciudad de Rivas y los municipios interiores conservan gastronomía, producción, patrimonio y vida comunitaria.',
    municipalities: [
      { name: 'Rivas', identity: 'Historia, gastronomía, cultura y servicios' },
      { name: 'San Jorge', identity: 'Lago, puerto y acceso a Ometepe' },
      { name: 'Buenos Aires', identity: 'Agricultura y cultura local' },
      { name: 'Potosí', identity: 'Campo, producción y paisaje rural' },
      { name: 'Belén', identity: 'Cultura rural y producción' },
      { name: 'Tola', identity: 'Surf, naturaleza, playas y comunidades costeras' },
      { name: 'San Juan del Sur', identity: 'Playa, surf, navegación y entretenimiento' },
      { name: 'Cárdenas', identity: 'Lago, frontera natural y ruralidad' },
      { name: 'Moyogalpa', identity: 'Ometepe occidental, puerto y servicios' },
      { name: 'Altagracia', identity: 'Ometepe oriental, volcanes, cultura y arqueología' }
    ],
    history: 'La región del istmo de Rivas tuvo una importante presencia indígena antes de la colonización europea. Su ubicación estratégica la convirtió en un corredor entre el Pacífico, el istmo, el Cocibolca, el río San Juan y el Caribe. La memoria territorial reúne rutas prehispánicas, período colonial, acontecimientos del siglo XIX, rutas de tránsito, arqueología y la cultura campesina, lacustre y costera actual.',
    gastronomy: [
      { name: 'Pescado del Cocibolca', desc: 'Pescado fresco preparado por familias y cocinas vinculadas con la vida lacustre.' },
      { name: 'Mariscos del Pacífico', desc: 'Productos del mar servidos en San Juan del Sur, Tola y comunidades pesqueras.' },
      { name: 'Productos de Plátano', desc: 'Tostones, tajadas y otras preparaciones fundamentales de la cocina rivense.' },
      { name: 'Sopas y Nacatamales', desc: 'Recetas tradicionales acompañadas con tortillas y productos locales.' },
      { name: 'Sabores de Ometepe', desc: 'Plátano, frutas, miel, café, pescado y cocina campesina de las fincas de la isla.' },
      { name: 'Cacao y Bebidas Tradicionales', desc: 'Bebidas y productos tropicales elaborados en comunidades y emprendimientos.' }
    ],
    places: [
      { name: 'Reserva de Biosfera Isla de Ometepe', type: 'Dos volcanes, naturaleza, arqueología y turismo rural', icon: 'fa-mountain-sun' },
      { name: 'Volcán Concepción', type: 'Senderismo regulado, geología, fotografía y naturaleza', icon: 'fa-volcano' },
      { name: 'Volcán Maderas', type: 'Bosque, biodiversidad, senderismo y vida rural', icon: 'fa-mountain' },
      { name: 'Punta Jesús María', type: 'Atardecer, fotografía y vistas del Cocibolca', icon: 'fa-camera' },
      { name: 'Reserva Natural Charco Verde', type: 'Mariposario, senderos, aves, bosque y lago', icon: 'fa-feather' },
      { name: 'Ojo de Agua y Playa Santo Domingo', type: 'Naturaleza, descanso, ciclismo y corredor turístico', icon: 'fa-droplet' },
      { name: 'Cascada de San Ramón', type: 'Caminata, bosque y paisaje natural de Altagracia', icon: 'fa-water' },
      { name: 'Museo El Ceibo y petroglifos de Ometepe', type: 'Arqueología, cerámica e historia precolombina', icon: 'fa-landmark' },
      { name: 'San Juan del Sur y Cristo de la Misericordia', type: 'Bahía, paisaje, gastronomía y atardeceres', icon: 'fa-anchor' },
      { name: 'Maderas, Marsella, Remanso, Hermosa y El Coco', type: 'Playas, surf, recreación y naturaleza', icon: 'fa-water' },
      { name: 'Refugio de Vida Silvestre La Flor', type: 'Conservación de tortugas y experiencias reguladas', icon: 'fa-shield-heart' },
      { name: 'Corredor de playas de Tola', type: 'Popoyo, Guasacate, Santana, Colorado, Gigante y comunidades', icon: 'fa-umbrella-beach' },
      { name: 'Puerto de San Jorge', type: 'Puerta lacustre, ferris y transporte hacia Ometepe', icon: 'fa-ship' },
      { name: 'Ciudad de Rivas', type: 'Historia, mercados, arquitectura, gastronomía y servicios', icon: 'fa-building-columns' }
    ],
    activities: [
      'Surf en San Juan del Sur y el corredor costero de Tola',
      'Ascensos y senderismo regulado en los volcanes Concepción y Maderas',
      'Ciclismo por las comunidades y paisajes de Ometepe',
      'Conservación de tortugas mediante visitas autorizadas en La Flor',
      'Arqueología y petroglifos de Ometepe',
      'Senderismo en volcanes, reservas y bosques',
      'Navegación por el Cocibolca entre San Jorge y Ometepe',
      'Pesca y gastronomía con comunidades costeras',
      'Turismo rural en Ometepe, Tola y municipios interiores'
    ],
    culture: 'La cultura rivense reúne las carretas peregrinas de Popoyuapa, las festividades religiosas y campesinas de Ometepe, sus leyendas y petroglifos, la cultura pesquera y las celebraciones costeras de San Juan del Sur. También conserva expresiones como Los Diablitos de Rivas, el Zompopo de Ometepe y las representaciones de La Novia de Tola.',
    bestSeason: 'Rivas y San Juan del Sur requieren al menos 2 días; Ometepe merece de 2 a 3 días. Para recorrer el departamento completo, considerando ferris, montañas y costa, se recomiendan de 5 a 7 días.',
    howToReach: 'Por la Carretera Panamericana Sur (NIC-2) desde Managua hasta Rivas (110 km). Ferry regular desde el puerto de San Jorge hacia Ometepe.',
    recommendations: 'Verificar horarios y estado del ferry antes de viajar. Los ascensos volcánicos requieren condiciones, permisos y guías apropiados. El oleaje cambia y debe consultarse localmente. La anidación de tortugas es estacional, depende de la naturaleza y nunca puede garantizarse.',
    officialHighlights: [
      'Visita Nicaragua confirma el acceso en ferry desde San Jorge y destaca Charco Verde, Ojo de Agua y los petroglifos de Ometepe.',
      'Se incorpora la Cascada de San Ramón como caminata natural del municipio de Altagracia.',
      'El inventario SIIT de INTUR confirma Punta Jesús María, Volcán Concepción, Charco Verde y Museo Precolombino El Ceibo.'
    ],
    officialSources: [
      { label: 'Visita Nicaragua — Ometepe', url: 'https://www.visitanicaragua.com/islas/isla-de-ometepe/' },
      { label: 'INTUR/SIIT — Rivas', url: 'https://tramites.intur.gob.ni/siit/public/site/atractivosTuristicosRivas.html' }
    ],
    officialVerifiedAt: '26 de septiembre de 2026',
    heroImage: 'assets/images/destinos/isla_de_ometepe.jpg',
    lat: 11.5206,
    lng: -85.5700,
    coopCount: 30
  },
  {
    id: 'jinotega',
    name: 'Jinotega',
    tagline: 'Entre montañas, café y aguas que tocan las nubes',
    shortDesc: 'Jinotega es uno de los grandes territorios naturales de Nicaragua. Montañas cubiertas de neblina, extensos cafetales, cascadas, bosques nubosos, comunidades rurales y el Lago de Apanás crean una experiencia de ecoturismo, café, aventura y tranquilidad.',
    expandedDescription: 'Conocido como el corazón del oro verde y la bruma, Jinotega conecta la ciudad y Apanás con Datanlí–El Diablo, Peñas Blancas, El Cuá, San Rafael del Norte y los territorios que conducen hacia Bosawás. El café, el agua, el bosque y las comunidades articulan su identidad.',
    municipalities: [
      { name: 'Jinotega', identity: 'Café, Apanás, miradores y bosque nuboso' },
      { name: 'San Rafael del Norte', identity: 'Historia, religión, montaña, Ruta Sandino y café' },
      { name: 'San Sebastián de Yalí', identity: 'Café, panadería tradicional y ruralidad' },
      { name: 'La Concordia', identity: 'Historia y paisaje rural' },
      { name: 'Santa María de Pantasma', identity: 'Valle, producción y comunidades' },
      { name: 'El Cuá', identity: 'Peñas Blancas, cascadas y agroecoturismo' },
      { name: 'San José de Bocay', identity: 'Bosawás, ríos, cacao y aventura' },
      { name: 'Wiwilí de Jinotega', identity: 'Ríos, naturaleza y comunidades' }
    ],
    history: 'Jinotega fue constituido como departamento en 1891 y conserva una relación profunda con comunidades originarias, la colonización agrícola y el desarrollo cafetalero. San Rafael del Norte integra la Ruta Sandino y conecta la memoria de Augusto C. Sandino y Blanca Aráuz con Benjamín Zeledón, Fray Odorico D’Andrea, las comunidades cafetaleras y la historia regional del norte.',
    gastronomy: [
      { name: 'Café SHG de Estricta Altura', desc: 'Notas de chocolate, jazmín y frutas cítricas cosechado a más de 1,400 msnm.' },
      { name: 'Güirilas con Cuajada Fresca', desc: 'Tortilla dulce de maíz tierno asada en hoja de plátano.' },
      { name: 'Agua de Loja Jinotegana', desc: 'Bebida a base de maíz hervido con jengibre y dulce de rapadura.' },
      { name: 'Sopa de Gallina India con Albóndigas', desc: 'Cocida con leña en fogones campesinos.' },
      { name: 'Panadería de Yalí', desc: 'Rosquillas, perrerreque, quesadillas, semitas, dulces y bebidas tradicionales de maíz.' },
      { name: 'Productos de Finca', desc: 'Cacao, miel, cuajada, queso, crema, frijoles, tamales y sopa de cuajada.' }
    ],
    places: [
      { name: 'Cascada La Luna & El Cuá', type: 'Nebliselva & Canopy', icon: 'fa-cloud-rain' },
      { name: 'Lago de Apanás', type: 'Humedal Ramsar', icon: 'fa-water' },
      { name: 'Peña de La Cruz', type: 'Mirador Panorámico', icon: 'fa-mountain' },
      { name: 'Reserva Natural Macizo de Peñas Blancas', type: 'Bosque Nuboso Prístino', icon: 'fa-tree' },
      { name: 'Fincas Agroecológicas de San Rafael del Norte', type: 'Ruta del Café', icon: 'fa-mug-hot' },
      { name: 'Reserva Natural Cerro Datanlí–El Diablo', type: 'Bosque nuboso, aviturismo, café y comunidades', icon: 'fa-tree' },
      { name: 'Salto La Mocuana', type: 'Cascada y naturaleza en La Fundadora', icon: 'fa-water' },
      { name: 'Cascadas Arco Iris, La Pavona y La Sonora', type: 'Agua y senderismo en Peñas Blancas', icon: 'fa-cloud-rain' },
      { name: 'Cerro Kilambé y aguas termales de El Caño', type: 'Montaña, termalismo y vida rural en El Cuá', icon: 'fa-mountain-sun' },
      { name: 'Salto de Kayaska', type: 'Naturaleza y acceso hacia Bosawás desde Bocay', icon: 'fa-water' }
    ],
    activities: [
      'Canopy sobre cascadas torrenciales en El Cuá',
      'Paseos en kayak y avistamiento de aves en el Lago de Apanás',
      'Senderismo extremo en las murallas de Peñas Blancas',
      'Cata profesional de café en cooperativas cafetaleras',
      'Ascenso al Mirador Peña de la Cruz',
      'Recorridos de cacao y naturaleza en San José de Bocay',
      'Convivencia rural en fincas y comunidades del departamento'
    ],
    culture: 'Música campirana de polkas y mazurcas del grupo Soñadores de Saraguasca. Devoción a la Virgen de la Merced y memoria viva del Siervo de Dios Fray Odorico D’Andrea.',
    bestSeason: 'Ciudad y Apanás requieren 2 días; ciudad, reservas y café, de 3 a 4 días. Para conocer el departamento profundo se recomiendan de 5 a 7 días.',
    howToReach: 'Por la Carretera Panamericana Norte hasta Matagalpa y luego ascenso por la NIC-3 hacia Jinotega (142 km desde Managua).',
    recommendations: 'Llevar abrigo, capa impermeable y calzado con agarre. Confirmar accesos y guías para Peñas Blancas, Datanlí, Kilambé y Bosawás; las condiciones de caminos, ríos y cascadas pueden cambiar con la lluvia.',
    officialHighlights: [
      'INTUR confirma actividades de kayak y remo en el Lago de Apanás vinculadas con la Ruta del Café.',
      'San Rafael del Norte es un punto central de la Ruta Sandino y de la memoria de Blanca Aráuz.',
      'El registro turístico oficial confirma oferta de alojamiento y gastronomía en los ocho municipios de Jinotega.'
    ],
    officialSources: [
      { label: 'INTUR — Ruta Sandino', url: 'https://www.intur.gob.ni/2019/02/21/nicaragua-relanza-ruta-turistica-que-honra-al-general-sandino/' },
      { label: 'INTUR — Apanás', url: 'https://www.intur.gob.ni/2014/04/16/exitosa-1ra-expedicion-kayak-y-2da-de-remos-en-apanas-2014/' },
      { label: 'INTUR/SIIT — Jinotega', url: 'https://tramites.intur.gob.ni/siit/public/site/empresasTuristicasJinotega.html' }
    ],
    officialVerifiedAt: '26 de septiembre de 2026',
    heroImage: 'assets/images/destinos/cascada_la_luna.jpg',
    lat: 13.3720,
    lng: -85.6900,
    coopCount: 26
  },
  {
    id: 'masaya',
    name: 'Masaya',
    tagline: 'Tierra de fuego, tradición y manos creadoras',
    shortDesc: 'Masaya es uno de los territorios donde la identidad cultural nicaragüense se siente con mayor intensidad: volcanes activos, comunidades indígenas, marimba, danza, cerámica, madera, cuero, textiles, mercados y fiestas tradicionales forman una experiencia que conecta naturaleza y cultura viva.',
    expandedDescription: 'Conocida como Capital del Folclore Nacional, Masaya reúne una fuerte identidad indígena y mestiza. Monimbó, el Parque Nacional Volcán Masaya, los pueblos artesanales, la Laguna de Apoyo y sus extensas celebraciones convierten el departamento en un territorio de fuego, memoria comunitaria y creación.',
    municipalities: [
      { name: 'Masaya', identity: 'Folclore, Monimbó, mercados, artesanía y fiestas tradicionales' },
      { name: 'Nindirí', identity: 'Patrimonio, volcán, paisaje, agricultura e historia local' },
      { name: 'Tisma', identity: 'Naturaleza, humedales, agricultura y turismo comunitario' },
      { name: 'La Concepción', identity: 'Producción agrícola, viveros y paisaje rural' },
      { name: 'Masatepe', identity: 'Gastronomía, muebles, tradición y vida comunitaria' },
      { name: 'Nandasmo', identity: 'Artesanía, agricultura y cultura local' },
      { name: 'Catarina', identity: 'Miradores, viveros, música, gastronomía y Laguna de Apoyo' },
      { name: 'San Juan de Oriente', identity: 'Cerámica artesanal y talleres con maestros creadores' },
      { name: 'Niquinohomo', identity: 'Memoria del General Sandino, patrimonio e historia' }
    ],
    history: 'El territorio tuvo una importante presencia de pueblos indígenas del Pacífico nicaragüense, especialmente comunidades de origen chorotega. Esa herencia permanece visible en Monimbó, la artesanía, la cerámica, la música, las danzas, las fiestas, la gastronomía, la organización comunitaria y la tradición oral. Monimbó constituye un territorio cultural vivo, con identidad indígena, talleres, historia y memoria comunitaria.',
    gastronomy: [
      { name: 'Sopa de Mondongo', desc: 'Uno de los sabores más característicos del departamento y de su cocina festiva.' },
      { name: 'Tamuga de Monimbó', desc: 'Preparación tradicional estrechamente vinculada con la identidad comunitaria de Monimbó.' },
      { name: 'Cocina de Maíz', desc: 'Nacatamal, indio viejo, tortillas, rosquillas, güirilas y tamales.' },
      { name: 'Vigorón y Yuca', desc: 'Preparaciones populares presentes en mercados, barrios y celebraciones.' },
      { name: 'Dulces y Cajetas', desc: 'Dulces tradicionales elaborados por familias y emprendimientos locales.' },
      { name: 'Bebidas Tradicionales', desc: 'Cacao, tiste, pinolillo y bebidas de maíz.' }
    ],
    places: [
      { name: 'Parque Nacional Volcán Masaya', type: 'Vulcanología, miradores, senderos autorizados y educación ambiental', icon: 'fa-fire' },
      { name: 'Laguna de Masaya', type: 'Naturaleza, paisaje volcánico y fotografía', icon: 'fa-water' },
      { name: 'Monimbó', type: 'Identidad indígena, talleres, gastronomía y memoria comunitaria', icon: 'fa-hands-holding' },
      { name: 'Mercado de Artesanías de Masaya', type: 'Artesanía, cultura, gastronomía y economía local', icon: 'fa-store' },
      { name: 'Mirador de Catarina', type: 'Paisaje, viveros, música y gastronomía', icon: 'fa-eye' },
      { name: 'San Juan de Oriente', type: 'Cerámica artesanal y experiencias directas con productores', icon: 'fa-hands' },
      { name: 'Niquinohomo y Casa Museo de Sandino', type: 'Memoria histórica y patrimonio cultural', icon: 'fa-landmark' },
      { name: 'Reserva Natural Laguna de Apoyo', type: 'Kayak, senderismo, aves, fotografía y descanso', icon: 'fa-person-swimming' },
      { name: 'Reserva Natural Laguna de Tisma', type: 'Humedal Ramsar, biodiversidad y observación responsable', icon: 'fa-binoculars' },
      { name: 'Petroglifos de El Cailagua', type: 'Arqueología, símbolos ancestrales e interpretación comunitaria', icon: 'fa-monument' },
      { name: 'Taller Escuela Valentín López y Palo Solo', type: 'Artesanía, cultura y experiencias comunitarias', icon: 'fa-hands' }
    ],
    activities: [
      'Volcanes: miradores, vulcanología, fotografía y senderismo autorizado en el Volcán Masaya',
      'Artesanía: cerámica en San Juan de Oriente y talleres de Monimbó',
      'Cultura: recorridos por Masaya y Monimbó con historia y fiestas vivas',
      'Naturaleza: Laguna de Apoyo, Catarina y Tisma',
      'Fotografía: miradores de Catarina, volcán y pueblos artesanales',
      'Gastronomía: mercados, comunidades y cocinas familiares',
      'Música: marimba y actividades culturales',
      'Viveros: Catarina y municipios cercanos',
      'Turismo comunitario con artesanos, familias, talleres y productores'
    ],
    culture: 'La marimba es fundamental en la identidad musical del territorio. Las celebraciones de San Jerónimo, el Torovenado, Los Agüizotes, las máscaras, los disfraces, la música y la representación popular forman uno de los ciclos culturales más extensos y reconocibles de Nicaragua. La cerámica, la madera, los textiles, las hamacas, el cuero, la piedra, el arte popular y los instrumentos musicales mantienen viva la economía creadora.',
    bestSeason: 'Masaya ciudad puede recorrerse en 1 día; para combinar volcán, ciudad y Catarina se recomiendan 2 días, y para conocer el departamento completo, de 3 a 4 días.',
    howToReach: 'Desde Managua existen servicios terrestres hacia Masaya, Catarina y otros municipios del corredor desde la Terminal Roberto Huembes, además de servicios interlocales.',
    recommendations: 'El horario, acceso y tarifas del Parque Nacional Volcán Masaya pueden cambiar por disposición de las autoridades y por la actividad volcánica; deben verificarse antes de viajar. Para apoyar la economía local, conviene visitar talleres y comprar directamente a los artesanos.',
    officialHighlights: [
      'INTUR confirma que Masaya posee nueve municipios y que la Laguna de Tisma es un sitio Ramsar.',
      'Se agregan como referencias culturales oficiales el Taller Escuela Valentín López y el Corredor Turístico de Palo Solo.',
      'Visita Nicaragua confirma que el Mercado de Artesanías reúne hamacas, cuero, madera tallada, cerámica y gastronomía local.'
    ],
    officialSources: [
      { label: 'Visita Nicaragua — Volcán Masaya', url: 'https://www.visitanicaragua.com/en/volcanoes/masaya-volcano/' },
      { label: 'INTUR — Masaya', url: 'https://www.intur.gob.ni/2018/08/26/masaya-corazon-de-nicaragua/' },
      { label: 'INTUR/SIIT — Masaya', url: 'https://tramites.intur.gob.ni/siit/public/site/atractivosTuristicosMasaya.html' }
    ],
    officialVerifiedAt: '26 de septiembre de 2026',
    heroImage: 'assets/images/destinos/volcan_masaya.jpg',
    lat: 11.9854,
    lng: -86.1614,
    coopCount: 28
  },
  {
    id: 'granada',
    name: 'Granada',
    tagline: 'Entre volcanes, isletas y siglos de historia',
    shortDesc: 'Granada combina arquitectura histórica, lago, volcanes, naturaleza, gastronomía y vida urbana. Su centro histórico se abre hacia el inmenso Cocibolca, mientras el Mombacho domina el horizonte y las Isletas crean uno de los paisajes más reconocibles del país.',
    expandedDescription: 'Granada reúne un centro histórico de calles coloridas, plazas, templos y casas con patios interiores con el paisaje del lago Cocibolca, las Isletas y el bosque nuboso del Mombacho. Diriá, Diriomo y Nandaime amplían la experiencia con gastronomía, artesanía, vida rural, naturaleza y celebraciones propias.',
    municipalities: [
      { name: 'Granada', identity: 'Centro histórico, arquitectura, lago, museos y gastronomía' },
      { name: 'Diriá', identity: 'Laguna de Apoyo, paisaje, cultura y atol de ánimas' },
      { name: 'Diriomo', identity: 'Cajetas, artesanía, tradición y vida comunitaria' },
      { name: 'Nandaime', identity: 'Turismo rural, naturaleza, gastronomía y festividades municipales' }
    ],
    history: 'Granada fue fundada por Francisco Hernández de Córdoba en 1524 junto a un territorio con antecedentes indígenas asociados a Xalteva. Su ubicación a orillas del lago Cocibolca favoreció las rutas comerciales, el transporte lacustre y la conexión hacia el Caribe por el sistema lago–río San Juan. Su paisaje urbano conserva iglesias, plazas, viviendas históricas, patios interiores, calles tradicionales, edificios civiles y antiguos espacios comerciales.',
    gastronomy: [
      { name: 'Ruta del Vigorón', desc: 'Yuca cocida, chicharrón y ensalada de repollo servidos en el Parque Central, mercados y cocinas locales.' },
      { name: 'Sabores del Cocibolca', desc: 'Pescado, mariscos y preparaciones vinculadas con la vida lacustre.' },
      { name: 'Cocina Nicaragüense', desc: 'Chancho con yuca, nacatamal, indio viejo y quesillos.' },
      { name: 'Ruta de las Cajetas', desc: 'Dulces tradicionales que conectan Granada con los talleres familiares de Diriomo.' },
      { name: 'Cacao y Bebidas', desc: 'Cacao, refrescos naturales, chicha y pinolillo.' },
      { name: 'Sabores Municipales', desc: 'Atol de ánimas de Diriá y preparaciones tradicionales de Nandaime.' }
    ],
    places: [
      { name: 'Centro Histórico y Calle La Calzada', type: 'Arquitectura, plazas, iglesias, museos y gastronomía', icon: 'fa-building-columns' },
      { name: 'Catedral de Granada y Parque Colón', type: 'Patrimonio, vida urbana, religión y fotografía', icon: 'fa-church' },
      { name: 'Iglesia y Torre de La Merced', type: 'Arquitectura, historia y vistas urbanas', icon: 'fa-church' },
      { name: 'Convento e Iglesia San Francisco', type: 'Historia, arquitectura y espacios museísticos', icon: 'fa-landmark' },
      { name: 'Casa de los Leones', type: 'Patrimonio cultural y ciudades históricas', icon: 'fa-house' },
      { name: 'Antigua Estación del Ferrocarril', type: 'Memoria ferroviaria y patrimonio', icon: 'fa-train' },
      { name: 'Isletas de Granada', type: 'Lancha, kayak, fauna, paisaje y fotografía', icon: 'fa-ship' },
      { name: 'Lago Cocibolca', type: 'Agua, navegación, biodiversidad e historia', icon: 'fa-water' },
      { name: 'Reserva Natural Volcán Mombacho', type: 'Senderos, miradores, bosque nuboso y aviturismo', icon: 'fa-tree' },
      { name: 'Aguas Agrias–La Nanda', type: 'Turismo rural comunitario, senderos y cocina local', icon: 'fa-people-group' },
      { name: 'Reserva Natural Laguna de Apoyo', type: 'Kayak, baño, senderismo, fotografía y aves', icon: 'fa-person-swimming' }
    ],
    activities: [
      'Granada a pie: arquitectura, plazas, iglesias, mercados y museos',
      'Isletas: recorridos en lancha, kayak y observación de naturaleza',
      'Mombacho: senderismo, bosque nuboso, miradores e interpretación ambiental',
      'Aviturismo en Mombacho, Laguna de Apoyo y espacios rurales',
      'Experiencias de cacao con productores, elaboración y degustación',
      'Fotografía de arquitectura, lago, volcanes y atardeceres',
      'Ciclismo por rutas rurales y periurbanas',
      'Turismo comunitario en Diriá, Diriomo, Nandaime y el entorno del Mombacho'
    ],
    culture: 'Granada reúne celebraciones religiosas, Semana Santa, fiestas patronales, la tradición de Xalteva, música, danza, procesiones, pintura, artesanía y festividades municipales. Los Diablos de Nandaime, El Cartel y el Atabal forman parte de las expresiones culturales del departamento.',
    bestSeason: 'La ciudad merece de 1 a 2 días; para combinar Granada, Isletas, Mombacho y Laguna de Apoyo se recomiendan de 3 a 4 días.',
    howToReach: 'Desde Managua hay servicios hacia Granada desde la Terminal Roberto Huembes, además de microbuses e interlocales por el corredor Masaya–Granada.',
    recommendations: 'Recorrer el centro histórico a pie y dividir las excursiones a Isletas, Mombacho y Laguna de Apoyo para disfrutar cada experiencia sin prisas. Llevar calzado cómodo, hidratación y confirmar previamente las condiciones de las áreas naturales.',
    officialHighlights: [
      'Visita Nicaragua identifica más de 400 pequeñas islas de origen volcánico en el conjunto de las Isletas de Granada.',
      'El Mombacho cuenta con senderos, miradores y bosque nuboso con vistas hacia el Cocibolca y la ciudad.',
      'El inventario SIIT de INTUR confirma la Antigua Estación, Aguas Agrias–La Nanda, Casa de los Leones, Catedral y Convento San Francisco.'
    ],
    officialSources: [
      { label: 'Visita Nicaragua — Granada', url: 'https://www.visitanicaragua.com/en/Destinations/pomegranate/' },
      { label: 'INTUR/SIIT — Granada', url: 'https://tramites.intur.gob.ni/siit/public/site/atractivosTuristicosGranada.html' }
    ],
    officialVerifiedAt: '26 de septiembre de 2026',
    heroImage: 'assets/images/destinos/hotel_dario.jpg',
    lat: 11.9298,
    lng: -85.9535,
    coopCount: 32
  },
  {
    id: 'matagalpa',
    name: 'Matagalpa',
    tagline: 'Donde el café nace entre montañas',
    shortDesc: 'Matagalpa, la Perla del Septentrión, combina ciudad, café, bosque nuboso, cascadas, cultura indígena, música, agricultura y turismo rural en un territorio de clima fresco y gran diversidad productiva.',
    expandedDescription: 'Desde la ciudad de Matagalpa y sus museos hasta Selva Negra, Cerro Apante, San Ramón, Tuma–La Dalia y Peñas Blancas, el departamento conecta fincas de café y cacao, cascadas, comunidades, patrimonio indígena, música norteña y experiencias de montaña.',
    municipalities: [
      { name: 'Matagalpa', identity: 'Ciudad de montaña, café, museos, miradores y cultura' },
      { name: 'Sébaco', identity: 'Producción agrícola, corredor gastronómico e historia' },
      { name: 'Ciudad Darío', identity: 'Casa natal de Rubén Darío, poesía y patrimonio' },
      { name: 'Esquipulas', identity: 'Religiosidad, ruralidad y paisajes productivos' },
      { name: 'Matiguás', identity: 'Ganadería, naturaleza y cultura rural' },
      { name: 'Muy Muy', identity: 'Lácteos, producción y paisajes' },
      { name: 'Rancho Grande', identity: 'Cacao, café, montaña y Peñas Blancas' },
      { name: 'Río Blanco', identity: 'Música, artesanía en madera, montaña y ganadería' },
      { name: 'San Dionisio', identity: 'Agricultura, cultura comunitaria y paisaje rural' },
      { name: 'San Isidro', identity: 'Producción, gastronomía y vida comunitaria' },
      { name: 'San Ramón', identity: 'Café, cacao, fincas y turismo rural comunitario' },
      { name: 'Terrabona', identity: 'Paisajes rurales, agricultura y tradición' },
      { name: 'El Tuma–La Dalia', identity: 'Montañas de café, agua, cascadas y comunidades' }
    ],
    history: 'El territorio conserva raíces de los pueblos indígenas del centro-norte y la memoria de los Indios Flecheros de Matagalpa. Villa Chagüitillo aporta arte rupestre y arqueología, mientras Ciudad Darío preserva la Casa Natal de Rubén Darío. La caficultura, la producción rural y la conservación comunitaria completan su historia moderna.',
    gastronomy: [
      { name: 'Cacao con Leche y Canela', desc: 'Bebida densa y aromática elaborada con cacao puro cultivado en montaña.' },
      { name: 'Montucas Matagalpinas', desc: 'Masa de maíz tierno rellena con carne marinada en naranja agria.' },
      { name: 'Queso Ahumado de Muy Muy', desc: 'Queso artesanal curado con maderas de roble.' },
      { name: 'Dulces de Leche y Cajeta de Café', desc: 'Elaborados por artesanas rurales del valle.' },
      { name: 'Maíz y Lácteos', desc: 'Güirilas, cuajada, crema, tamales, indio viejo, sopas y productos de finca.' },
      { name: 'Café, Chocolate y Miel', desc: 'Productos de montaña ofrecidos en fincas, comunidades y cafeterías locales.' }
    ],
    places: [
      { name: 'Reserva Silvestre Selva Negra', type: 'Bosque Nuboso & Aves', icon: 'fa-feather' },
      { name: 'Comunidad Indígena de El Chile', type: 'Tejidos Tradicionales', icon: 'fa-hands-holding' },
      { name: 'Cascada Santa Emilia', type: 'Caída de Agua Mística', icon: 'fa-water' },
      { name: 'Cerro Apante (Reserva Natural)', type: 'Senderismo de Altura', icon: 'fa-mountain' },
      { name: 'Museo Nacional del Café', type: 'Cultura Cafetalera', icon: 'fa-mug-hot' },
      { name: 'Museo Casa Natal Rubén Darío', type: 'Poesía, historia y patrimonio en Ciudad Darío', icon: 'fa-book-open' },
      { name: 'Villa Chagüitillo', type: 'Arte rupestre, arqueología e interpretación histórica', icon: 'fa-monument' },
      { name: 'Cascada Blanca y Cascada La Luna', type: 'Naturaleza, aventura y paisajes de agua', icon: 'fa-water' },
      { name: 'Macizo de Peñas Blancas', type: 'Café, senderismo, cascadas y conservación', icon: 'fa-mountain-sun' },
      { name: 'San Ramón', type: 'Turismo rural comunitario, café, cacao y fincas', icon: 'fa-people-group' },
      { name: 'Catedral San Pedro', type: 'Arquitectura, religión y patrimonio urbano', icon: 'fa-church' }
    ],
    activities: [
      'Senderismo de observación de quetzales y tucanes en Selva Negra',
      'Talleres vivenciales de tejido en telar de cintura en El Chile',
      'Ruta del chocolate desde la mazorca de cacao hasta la barra artesanal',
      'Bañarse bajo la cortina de la Cascada Santa Emilia',
      'Excursiones guiadas por líderes indígenas comunitarios',
      'Ruta del Café Matagalpino desde la planta hasta la catación',
      'Ciclismo, fotografía y aviturismo entre bosques, fincas y miradores'
    ],
    culture: 'Música de polkas y mazurcas campesinas, danzas del zopilote y devoción a San Pedro. Preservación del idioma y cosmovisión indígena matagalpa.',
    bestSeason: 'La ciudad requiere de 1 a 2 días; Matagalpa con café y naturaleza, 3 días. Para cascadas, comunidades y el departamento completo se recomiendan de 5 a 7 días.',
    howToReach: 'Desde Managua por la Carretera Panamericana Norte y desvío en Sébaco hacia Matagalpa (130 km, 2 horas).',
    recommendations: 'Usar ropa abrigada y botas resistentes al agua. Confirmar acceso, dificultad, guía, profundidad y estado del camino antes de visitar cascadas o reservas, especialmente durante la temporada lluviosa.',
    officialHighlights: [
      'El inventario SIIT de INTUR confirma Cascada La Luna, Salto de Santa Emilia, Catedral San Pedro y Museo Casa Natal Rubén Darío.',
      'INTUR identifica Cascada Blanca como parte del complejo natural de Santa Emilia en Tuma–La Dalia.',
      'La oferta oficial incluye Selva Negra, Peñas Blancas, fincas agroturísticas y turismo rural comunitario en San Ramón.'
    ],
    officialSources: [
      { label: 'INTUR/SIIT — Matagalpa', url: 'https://tramites.intur.gob.ni/siit/public/site/atractivosTuristicosMatagalpa.html' },
      { label: 'INTUR — Matagalpa destino verde', url: 'https://www.intur.gob.ni/2015/08/24/matagalpa-destino-verde-invita-a-estar-en-contacto-con-la-naturaleza/' },
      { label: 'INTUR — Oferta de Matagalpa', url: 'https://www.intur.gob.ni/2015/05/08/intur-matagalpa-y-sector-privado-presentan-oferta-turistica/' }
    ],
    officialVerifiedAt: '26 de septiembre de 2026',
    heroImage: 'assets/images/destinos/selva_negra.jpg',
    lat: 12.9980,
    lng: -85.9090,
    coopCount: 25
  },
  {
    id: 'esteli',
    name: 'Estelí',
    tagline: 'Montañas, arte y tradición nacidos de la tierra',
    shortDesc: 'Estelí es una puerta al norte montañoso de Nicaragua. Sus paisajes combinan valles productivos, nebliselvas, reservas, comunidades rurales, café, artesanía, arte urbano y una reconocida tradición vinculada al cultivo y transformación del tabaco.',
    expandedDescription: 'Desde los bosques de Miraflor y Tisey–Estanzuela hasta las esculturas de San Juan de Limay, el departamento conecta naturaleza, cultura, producción local, muralismo, arqueología, paleontología y turismo comunitario.',
    municipalities: [
      { name: 'Estelí', identity: 'Cultura urbana, naturaleza, arte y producción' },
      { name: 'Condega', identity: 'Arqueología, cerámica, agricultura y cultura' },
      { name: 'Pueblo Nuevo', identity: 'Paleontología, naturaleza y memoria' },
      { name: 'La Trinidad', identity: 'Gastronomía, panadería y cultura local' },
      { name: 'San Nicolás', identity: 'Montañas, campo y turismo rural' },
      { name: 'San Juan de Limay', identity: 'Escultura, marmolina y paisaje' }
    ],
    history: 'Conocida como la "Tres Veces Heroica Ciudad", Estelí fue escenario de épicas batallas revolucionarias. Su espíritu indomable se transformó en una pujante economía agroindustrial y artística comunitaria.',
    gastronomy: [
      { name: 'Perrerengue y Tamales de El Tisey', desc: 'Maíz cosechado en alturas de 1,200 msnm con queso de monte.' },
      { name: 'Cuajada Fresca Esteliana', desc: 'Famosa por su textura mantecosa y sabor inconfundible.' },
      { name: 'Carne Asada en Brasas de Leña', desc: 'Con tortilla caliente, chimichurri y queso frito.' },
      { name: 'Café de Miraflor', desc: 'Café orgánico cultivado por cooperativas campesinas.' },
      { name: 'Desayuno Segoviano', desc: 'Café de montaña, tortilla, cuajada, crema, huevos y frijoles.' },
      { name: 'Queso de Cabra y Miel', desc: 'Productos comunitarios vinculados con La Garnacha y fincas rurales.' }
    ],
    places: [
      { name: 'Reserva Natural Tisey-La Estanzuela', type: 'Cascada & Esculturas', icon: 'fa-water' },
      { name: 'Galería de Esculturas en Piedra de Don Alberto', type: 'Arte Popular Rústico', icon: 'fa-palette' },
      { name: 'Reserva Natural Miraflor', type: 'Orquídeas & Turismo Rural', icon: 'fa-seedling' },
      { name: 'Fábricas de Puros Artesanales', type: 'Ruta del Tabaco de Alta Gama', icon: 'fa-fire' },
      { name: 'Murales Revolucionarios y Urbanos', type: 'Arte Público', icon: 'fa-brush' },
      { name: 'La Garnacha', type: 'Comunidad, queso de cabra, producción sostenible y aves', icon: 'fa-people-group' },
      { name: 'Condega y su Taller Comunal de Cerámica', type: 'Arqueología, barro y artesanía', icon: 'fa-hands' },
      { name: 'Pueblo Nuevo', type: 'Paleontología, arqueología y memoria', icon: 'fa-landmark' },
      { name: 'San Juan de Limay', type: 'Gorditas de Limay, marmolina y talleres de escultura', icon: 'fa-hammer' },
      { name: 'Mirador San Luis', type: 'Paisaje, fotografía y artesanía', icon: 'fa-eye' }
    ],
    activities: [
      'Nado en la poza natural del Salto La Estanzuela',
      'Convivencia campesina y avistamiento de más de 200 especies de orquídeas en Miraflor',
      'Visita a las esculturas talladas en roca viva en El Jalacate',
      'Tour educativo sobre el torcido a mano de puros de renombre mundial',
      'Recorrido en bicicleta de montaña por los caminos de El Tisey',
      'Ruta urbana de murales, artistas y memoria local',
      'Talleres de cerámica, escultura, cuero y compra directa a creadores'
    ],
    culture: 'Ciudad de poetas, muralistas y músicos de guitarras campesinas. Fiestas en honor a la Virgen del Rosario en octubre con desfiles hípicos de gala.',
    bestSeason: 'La ciudad requiere 1 día; con Tisey, 2 días; al sumar Miraflor, de 3 a 4 días. Para recorrer el departamento completo se recomiendan de 4 a 5 días.',
    howToReach: 'Por la Carretera Panamericana Norte (NIC-1), 148 km desde Managua (2.5 horas de trayecto en autopista asfaltada).',
    recommendations: 'Contratar guías comunitarios en Miraflor y Tisey, confirmar el estado de senderos y cascadas, y comprar artesanías directamente a sus creadores. Los recorridos tabacaleros deben presentarse como patrimonio productivo y reservarse para público adulto.',
    officialHighlights: [
      'INTUR confirma los seis municipios y reconoce a Estelí como ciudad del muralismo, capital del tabaco y Diamante de las Segovias.',
      'El inventario SIIT incluye Salto La Estanzuela, La Garnacha, Taller Comunal de Cerámica y Mirador San Luis.',
      'Miraflor–Moropotente forma parte de la Ruta del Café y promueve turismo sostenible con comunidades rurales.'
    ],
    officialSources: [
      { label: 'INTUR — Estelí', url: 'https://www.intur.gob.ni/2018/09/07/tabaco-ciudad-heroica-de-murales/' },
      { label: 'INTUR/SIIT — Estelí', url: 'https://tramites.intur.gob.ni/siit/public/site/atractivosTuristicosEsteli.html' },
      { label: 'INTUR — Miraflor', url: 'https://www.intur.gob.ni/2016/02/01/gobierno-sandinista-amplia-oferta-turistica-en-el-departamento-de-esteli/' }
    ],
    officialVerifiedAt: '26 de septiembre de 2026',
    heroImage: 'assets/images/destinos/poco_a_poco.jpg',
    lat: 13.0910,
    lng: -86.3530,
    coopCount: 24
  },
  {
    id: 'chinandega',
    name: 'Chinandega',
    tagline: 'Tierra de Volcanes Gigantes y Costas Salvajes',
    shortDesc: 'Chinandega es la potencia agrícola y volcánica del occidente. Alberga el coloso San Cristóbal (el punto más alto del país), el mítico cráter con laguna del Cosigüina y los esteros de manglares vírgenes.',
    history: 'Tierra de antiguos cacicazgos nahuas y maribios. Puerto Corinto fue la puerta de entrada de mercaderías del mundo y escenario de defensas marítimas de la soberanía nacional.',
    gastronomy: [
      { name: 'Tonkolote Chinandegano', desc: 'Tamal de maíz relleno con carne condimentada envuelto en hojas.' },
      { name: 'Pescado Frito y Ceviche de Concha Negra', desc: 'Recién extraídos de los manglares de Corinto y Aserradores.' },
      { name: 'Rosquillas y Viejitas de El Viejo', desc: 'Reconocidas como de las más finas del país.' },
      { name: 'Fresco de Chicha Morada', desc: 'Elaborada con maíz morado autóctono.' }
    ],
    places: [
      { name: 'Volcán San Cristóbal (1,745 msnm)', type: 'Pico Más Alto del País', icon: 'fa-volcano' },
      { name: 'Volcán Cosigüina y Laguna Cráter', type: 'Reserva Natural & Golfo', icon: 'fa-mountain' },
      { name: 'Basílica Menor de Nuestra Señora del Trono', type: 'Santuario Nacional', icon: 'fa-church' },
      { name: 'Playas de Aserradores & Jiquilillo', type: 'Surf & Esteros', icon: 'fa-umbrella-beach' },
      { name: 'Estero Padre Ramos', type: 'Santuario de Manglar & Tortugas', icon: 'fa-tree' }
    ],
    activities: [
      'Ascenso exigente al coloso activo San Cristóbal',
      'Caminata hacia el mirador del cráter del Cosigüina con vista a Honduras y El Salvador',
      'Kayak silencioso por los túneles de manglar en Padre Ramos',
      'Surf de ola tubera en el famoso "The Boom" en Aserradores',
      'Peregrinación al Lavatorio de la Plata en El Viejo (6 de diciembre)'
    ],
    culture: 'Epicentro mariano de Nicaragua con la veneración a la Virgen del Trono. Bailes folclóricos de Los Mantudos y festividades en Puerto Corinto.',
    bestSeason: 'Diciembre a abril para explorar el Golfo de Fonseca con vientos suaves y cielos despejados.',
    howToReach: 'Por la Carretera Panamericana Occidental (NIC-12), 134 km desde Managua (aprox. 2.5 horas).',
    recommendations: 'Llevar abundante agua para el calor intenso, repelente ecológico de insectos para los manglares y guía especializado para el San Cristóbal.',
    heroImage: 'assets/images/destinos/cerro_negro.jpg',
    lat: 12.6280,
    lng: -87.1310,
    coopCount: 19
  },
  {
    id: 'managua',
    name: 'Managua',
    tagline: 'Mucho más que una capital',
    shortDesc: 'Managua no es únicamente ciudad. El departamento se extiende desde el lago Xolotlán hasta el océano Pacífico e incorpora paisajes urbanos, lagunas volcánicas, reservas naturales, playas, espacios culturales, gastronomía y turismo rural.',
    expandedDescription: 'El departamento combina la vida contemporánea de la capital con el centro histórico, el lago Xolotlán, las lagunas de Tiscapa, Xiloá, Apoyeque y Asososca, los bosques de Ticuantepe y El Crucero, y las playas de San Rafael del Sur y Villa El Carmen.',
    municipalities: [
      { name: 'Managua', identity: 'Historia, cultura, lago, gastronomía, servicios y entretenimiento' },
      { name: 'Ciudad Sandino', identity: 'Vida comunitaria, paisaje urbano y cultura local' },
      { name: 'El Crucero', identity: 'Clima fresco, café, miradores y turismo rural' },
      { name: 'Mateare', identity: 'Xiloá, Chiltepe, paisaje volcánico y naturaleza' },
      { name: 'San Francisco Libre', identity: 'Lago, ruralidad, naturaleza y comunidades' },
      { name: 'San Rafael del Sur', identity: 'Pochomil, Masachapa, pesca y costa del Pacífico' },
      { name: 'Ticuantepe', identity: 'Agricultura, Chocoyero, senderismo y aviturismo' },
      { name: 'Tipitapa', identity: 'Termalismo, historia local, gastronomía y campo' },
      { name: 'Villa El Carmen', identity: 'Playas, fincas, naturaleza y turismo comunitario' }
    ],
    history: 'Managua es el mayor núcleo urbano, administrativo y de servicios del país. Su paisaje está marcado por el lago Xolotlán, lagunas volcánicas, actividad sísmica, transformaciones urbanas, barrios tradicionales, mercados, espacios culturales y arquitectura de distintas épocas. Su memoria puede recorrerse desde las Huellas de Acahualinca y el centro antiguo hasta sus teatros, museos y nuevos espacios frente al lago.',
    gastronomy: [
      { name: 'Ruta de la Fritanga', desc: 'Carne asada, tajadas, enchiladas, tacos, repochetas y comida popular nocturna.' },
      { name: 'Sabores de Nicaragua', desc: 'Nacatamal, vigorón, quesillo, indio viejo, baho y recetas de todos los departamentos.' },
      { name: 'Sopas Tradicionales', desc: 'Sopa de res y sopa de mondongo preparadas en mercados, barrios y restaurantes.' },
      { name: 'Mercados y Comida Popular', desc: 'Cocinas tradicionales, productos locales y encuentros cotidianos con la ciudad.' },
      { name: 'Cafés y Cocina Contemporánea', desc: 'Café nacional y propuestas modernas inspiradas en ingredientes nicaragüenses.' },
      { name: 'Bebidas Tradicionales', desc: 'Cacao, pinolillo, tiste, chicha, cebada y semilla de jícaro.' }
    ],
    places: [
      { name: 'Puerto Salvador Allende y lago Xolotlán', type: 'Gastronomía, navegación, familia, paisaje y entretenimiento', icon: 'fa-ship' },
      { name: 'Centro Histórico de Managua', type: 'Plaza de la Revolución, Antigua Catedral y patrimonio', icon: 'fa-landmark' },
      { name: 'Teatro Nacional Rubén Darío', type: 'Artes escénicas, música, arquitectura y cultura', icon: 'fa-masks-theater' },
      { name: 'Huellas de Acahualinca', type: 'Arqueología, geología e historia humana', icon: 'fa-shoe-prints' },
      { name: 'Laguna de Tiscapa', type: 'Laguna cratérica, miradores, historia y fotografía', icon: 'fa-camera' },
      { name: 'Laguna de Xiloá y Apoyeque', type: 'Recreación autorizada, paisaje volcánico y naturaleza', icon: 'fa-water' },
      { name: 'Laguna de Asososca', type: 'Paisaje natural y observación desde áreas permitidas', icon: 'fa-droplet' },
      { name: 'Reserva Natural Chocoyero–El Brujo', type: 'Senderismo, bosque, aves e interpretación ambiental', icon: 'fa-feather' },
      { name: 'Ticuantepe y El Crucero', type: 'Agricultura, café, clima fresco, miradores y turismo rural', icon: 'fa-seedling' },
      { name: 'Pochomil y Masachapa', type: 'Playa, pesca, gastronomía, familia y atardecer', icon: 'fa-umbrella-beach' },
      { name: 'Mercado Roberto Huembes', type: 'Artesanía, textiles, comida y comercio local', icon: 'fa-store' },
      { name: 'Parque Luis Alfonso Velásquez Flores', type: 'Turismo familiar y recreación al aire libre', icon: 'fa-children' },
      { name: 'Tipitapa y Centro Turístico El Trapiche', type: 'Termalismo, recreación, historia y gastronomía', icon: 'fa-hot-tub-person' }
    ],
    activities: [
      'Experiencias urbanas de cultura, entretenimiento, gastronomía y compras',
      'Geología y paisaje en Tiscapa, Xiloá y Apoyeque',
      'Naturaleza y senderismo en Chocoyero, Ticuantepe y El Crucero',
      'Playa en Pochomil, Masachapa y las costas de Villa El Carmen',
      'Navegación autorizada y atardeceres frente al lago Xolotlán',
      'Ruta gastronómica por mercados, restaurantes y fritangas',
      'Teatros, museos, patrimonio y centros culturales'
    ],
    culture: 'Managua conecta la memoria ancestral de Acahualinca, el patrimonio del centro histórico, teatros, museos, mercados, artesanía y la vida contemporánea. Las fiestas de Santo Domingo de Guzmán, la música, la danza, los espacios culturales y la diversidad de sus barrios forman parte de su identidad viva.',
    bestSeason: 'La capital esencial puede conocerse en 1 día; ciudad y naturaleza requieren 2 días. Para recorrer el departamento desde las lagunas hasta el Pacífico se recomiendan de 3 a 4 días.',
    howToReach: 'Centro neurálgico del país con el Aeropuerto Internacional Augusto C. Sandino (MGA) y terminales terrestres a todos los departamentos.',
    recommendations: 'Diferenciar siempre los miradores y áreas recreativas de las zonas restringidas en lagunas y reservas. Confirmar accesos, horarios y navegación antes de viajar, utilizar transporte autorizado y dividir la visita entre ciudad, naturaleza y costa.',
    officialHighlights: [
      'INTUR reportó 5,058,347 visitas a destinos y espacios recreativos de Managua durante 2024.',
      'Se incorpora el Parque Luis Alfonso Velásquez entre los espacios oficiales de turismo familiar y recreación al aire libre.',
      'Puerto Salvador Allende, Pochomil y Xiloá están confirmados por INTUR como puntos de referencia recreativos y gastronómicos.'
    ],
    officialSources: [
      { label: 'INTUR — Turismo en Managua', url: 'https://www.intur.gob.ni/2025/02/11/managua-atrajo-en-2024-a-mas-de-5-millones-de-visitantes/' },
      { label: 'INTUR/SIIT — Managua', url: 'https://tramites.intur.gob.ni/siit/public/site/atractivosTuristicosManagua.html' }
    ],
    officialVerifiedAt: '26 de septiembre de 2026',
    heroImage: 'assets/images/destinos/dona_haydee.jpg',
    lat: 12.1280,
    lng: -86.2650,
    coopCount: 35
  },
  {
    id: 'carazo',
    name: 'Carazo',
    tagline: 'Donde la tradición baila entre cafetales y el Pacífico',
    shortDesc: 'Carazo reúne ciudades de clima agradable, fincas cafetaleras, reservas naturales y playas del Pacífico. Diriamba conserva tradiciones como El Güegüense, Jinotepe funciona como centro urbano y cultural, y la costa conecta con La Boquita, Casares, Huehuete y la conservación de tortugas marinas.',
    expandedDescription: 'En un territorio compacto, Carazo combina cultura viva, café, folclore, naturaleza y Pacífico. Sus ciudades, comunidades rurales, fincas, reservas y pueblos costeros permiten conectar fiestas, producción local, gastronomía, playa y conservación.',
    municipalities: [
      { name: 'Jinotepe', identity: 'Cultura urbana, gastronomía, historia y servicios' },
      { name: 'Diriamba', identity: 'Güegüense, San Sebastián, folclore, café y costa' },
      { name: 'San Marcos', identity: 'Clima fresco, café, naturaleza y tradición' },
      { name: 'Dolores', identity: 'Agroturismo, ciclismo y cultura comunitaria' },
      { name: 'El Rosario', identity: 'Vida comunitaria y patrimonio local' },
      { name: 'La Paz de Carazo', identity: 'Artesanía y tradición' },
      { name: 'Santa Teresa', identity: 'Campo, naturaleza y comunidades' },
      { name: 'La Conquista', identity: 'Turismo rural y paisajes' }
    ],
    history: 'La identidad de Carazo está ligada a las comunidades del Pacífico, al mestizaje cultural y a expresiones transmitidas durante generaciones. El Güegüense o Macho Ratón, representado durante las fiestas de San Sebastián en Diriamba, integra teatro, danza, música, tradición oral y elementos indígenas y españoles. Fue inscrito en 2008 en la Lista Representativa del Patrimonio Cultural Inmaterial de la Humanidad.',
    gastronomy: [
      { name: 'Café Caraceño', desc: 'Ruta entre San Marcos, Diriamba, Dolores, Jinotepe y fincas rurales: cultivo, tostado y degustación.' },
      { name: 'Ajiaco y Picadillo', desc: 'Preparaciones tradicionales vinculadas con la cocina familiar y festiva.' },
      { name: 'Nacatamal Caraceño', desc: 'Receta territorial elaborada con maíz, carne, verduras y saberes familiares.' },
      { name: 'Pan, Melcochas y Dulces', desc: 'Pan artesanal, melcochas y dulces de producción local.' },
      { name: 'Chilate y Helados Tradicionales', desc: 'Bebidas y postres asociados especialmente con Jinotepe y sus comunidades.' },
      { name: 'Sabores de la Costa', desc: 'Pescado y mariscos preparados en La Boquita, Casares, Huehuete y otros pueblos costeros.' }
    ],
    places: [
      { name: 'Diriamba y Basílica de San Sebastián', type: 'El Güegüense, patrimonio, fiestas, arquitectura y fotografía', icon: 'fa-church' },
      { name: 'Jinotepe y Parroquia Santiago', type: 'Arquitectura, gastronomía, cultura, parques y servicios', icon: 'fa-building-columns' },
      { name: 'La Boquita', type: 'Playa, gastronomía marina, familia y atardeceres', icon: 'fa-umbrella-beach' },
      { name: 'Casares', type: 'Pesca artesanal, comunidad, restaurantes y paisaje costero', icon: 'fa-fish' },
      { name: 'Huehuete y El Tamarindo', type: 'Playas, recreación y costa caraceña', icon: 'fa-water' },
      { name: 'Centro Ecoturístico La Máquina', type: 'Cascadas, senderos y bosque seco', icon: 'fa-water' },
      { name: 'Refugio Río Escalante–Chacocente', type: 'Senderismo, fauna y conservación regulada de tortugas', icon: 'fa-shield-heart' },
      { name: 'Reserva Silvestre Privada Tonantzin', type: 'Senderismo, aves, petroglifos, agricultura y educación ambiental', icon: 'fa-leaf' },
      { name: 'Reserva Silvestre Privada FRANIN', type: 'Senderismo, observación de aves y cabalgatas', icon: 'fa-feather' },
      { name: 'Centro Ecoturístico Loma de Viento', type: 'Senderismo, cabalgatas, jardín botánico y turismo rural', icon: 'fa-mountain-sun' },
      { name: 'Dolores y fincas cafetaleras', type: 'Ciclismo, agroturismo, café y producción local', icon: 'fa-bicycle' }
    ],
    activities: [
      'Cultura viva: El Güegüense, Toro Huaco, El Viejo y La Vieja',
      'Ruta del café por fincas, cosecha, tostado y degustación',
      'Pacífico: La Boquita, Casares, Huehuete y El Tamarindo',
      'Conservación regulada en Chacocente',
      'Naturaleza, senderos y aves en reservas privadas',
      'Ciclismo entre Dolores y áreas rurales',
      'Cabalgatas, fincas y turismo comunitario',
      'Mercados, cocina tradicional y gastronomía costera'
    ],
    culture: 'Las fiestas de San Sebastián en Diriamba convierten enero en el gran ciclo cultural de Carazo, con El Güegüense, Toro Huaco, música, bailes, procesiones y gastronomía. También destacan El Viejo y La Vieja, los Agüizotes Pizotes, la marimba, la mascarería, la tradición oral, el arte religioso, la artesanía y la cultura cafetalera.',
    bestSeason: 'Una escapada requiere 1 día; cultura y costa, 2 días. Para integrar café, reservas, comunidades, playas y Chacocente se recomiendan de 3 a 4 días.',
    howToReach: 'Por la Carretera Sur (NIC-2), 45 km desde Managua (aprox. 50 minutos de viaje).',
    recommendations: 'Dividir la visita entre Jinotepe–Diriamba, fincas y reservas, y la costa. En Chacocente, la observación y anidación de tortugas depende de la temporada, las condiciones naturales y las normas ambientales; nunca debe considerarse garantizada.',
    officialHighlights: [
      'INTUR confirma que los ocho municipios de Carazo reúnen playas, café, senderismo, reservas silvestres y tradiciones vivas.',
      'Se reincorpora el Centro Ecoturístico La Máquina como experiencia de cascadas y bosque seco.',
      'El Mapa Nacional de Turismo confirma fincas cafetaleras, La Boquita, Huehuete, Basílica San Sebastián y Parroquia Santiago.'
    ],
    officialSources: [
      { label: 'INTUR — Carazo', url: 'https://www.intur.gob.ni/2018/08/23/que-distingue-a-carazo-del-resto-de-nicaragua/' },
      { label: 'Mapa Nacional — Carazo', url: 'https://www.mapanicaragua.com/carazo/' }
    ],
    officialVerifiedAt: '26 de septiembre de 2026',
    heroImage: 'assets/images/destinos/villa_redonda.jpg',
    lat: 11.8580,
    lng: -86.2390,
    coopCount: 18
  },
  {
    id: 'chontales',
    name: 'Chontales',
    tagline: 'Donde los ríos son de leche y las piedras cuajadas',
    shortDesc: 'Chontales reúne ganadería, quesillo, arqueología, montañas, ríos, cascadas, minería, pesca, música de chicheros y cultura campesina entre el lago Cocibolca y la Serranía de Amerrique.',
    expandedDescription: 'La identidad chontaleña conecta la ciudad de Juigalpa y sus museos con haciendas ganaderas, sitios arqueológicos, cascadas, minería histórica y comunidades lacustres. Sus experiencias auténticas se extienden desde Amerrique y Piedras Pintadas hasta El Nancital.',
    municipalities: [
      { name: 'Juigalpa', identity: 'Museos, miradores, arqueología, ganadería y servicios' },
      { name: 'Acoyapa', identity: 'El Nancital, lago, pesca, navegación y cuevas' },
      { name: 'Comalapa', identity: 'Ganadería, agricultura y vida rural' },
      { name: 'La Libertad', identity: 'Minería histórica, cascadas y cultura local' },
      { name: 'Santo Domingo', identity: 'Minería, montaña y comunidades' },
      { name: 'Santo Tomás', identity: 'Quesillos, cascadas, mitos y tradiciones' },
      { name: 'San Pedro de Lóvago', identity: 'Kilona, fincas y cultura campesina' },
      { name: 'San Francisco de Cuapa', identity: 'Santuario, cascadas y religiosidad' },
      { name: 'Villa Sandino', identity: 'Piedras Pintadas, Garro Grande y arqueología' },
      { name: 'El Coral', identity: 'Naturaleza, producción y vida comunitaria' }
    ],
    history: 'Chontales conserva memoria indígena, estatuaria, cerámica, petrograbados y numerosos sitios arqueológicos. Juigalpa articula la historia regional desde el Museo Gregorio Aguilar Barea, mientras Villa Sandino resguarda Piedras Pintadas y Garro Grande. La ganadería centenaria, la minería y la vida junto al Cocibolca completan su memoria productiva.',
    gastronomy: [
      { name: 'Cuajadas y Quesos Chontaleños', desc: 'De fama internacional: queso quesillo, queso con chile y crema pura de hacienda.' },
      { name: 'Sopa de Hueso de Res con Albóndigas', desc: 'Servida en los días de mercado con tortillas gigantes.' },
      { name: 'Tamal Pisque con Queso Frito', desc: 'Maíz tratado con ceniza de roble y sal marina.' },
      { name: 'Chicha de Maíz Pujagua', desc: 'Bebida de maíz rojo fermentado.' },
      { name: 'Quesillo de Santo Tomás', desc: 'Producto emblemático elaborado con leche, queso, crema y tradición ganadera.' },
      { name: 'Sabores del Lago y la Finca', desc: 'Pescado, carne, güirilas, nacatamales, sopas y café de zonas altas.' }
    ],
    places: [
      { name: 'Cordillera de Amerrisque', type: 'Serranía Mística & Trekking', icon: 'fa-mountain' },
      { name: 'Museo Arqueológico Gregorio Aguilar Barea', type: 'Estatuas de Piedra Prehispánicas', icon: 'fa-landmark' },
      { name: 'Zoológico Thomas Belt de Juigalpa', type: 'Fauna Silvestre & Puma Albino', icon: 'fa-paw' },
      { name: 'Puerto Díaz & Lago Cocibolca', type: 'Pueblo de Pescadores', icon: 'fa-anchor' },
      { name: 'Piedras Pintadas de Villa Sandino', type: 'Petroglifos Sagrados', icon: 'fa-palette' },
      { name: 'Pirámides de Garro Grande', type: 'Arqueología y memoria precolombina', icon: 'fa-monument' },
      { name: 'Archipiélago El Nancital', type: '27 islas, aves, pesca, navegación y atardeceres', icon: 'fa-ship' },
      { name: 'Cerro y Cuevas Las Ventanas', type: 'Senderismo, espeleología y geología en Acoyapa', icon: 'fa-mountain-sun' },
      { name: 'Cascadas de Chontales', type: 'El Corozo, El Silencio, El Chancho, Hato Grande y Kilona', icon: 'fa-water' },
      { name: 'Salto y Cueva La Oropéndola', type: 'Senderismo y naturaleza en Santo Tomás', icon: 'fa-person-hiking' },
      { name: 'Aguas Calientes e Isla Arena', type: 'Geología, lancha, balneario y campamento', icon: 'fa-hot-tub-person' }
    ],
    activities: [
      'Escalada y senderismo en los riscos de la Cordillera Amerrisque',
      'Exploración de la mayor colección de estatuaria lítica indígena en Juigalpa',
      'Paseo en lancha desde Puerto Díaz en el Gran Lago',
      'Rutas agroturísticas por haciendas ganaderas sostenibles con ordeño limpio',
      'Descubrimiento de petroglifos milenarios en cuevas de Amerrisque',
      'Experiencia de finca con caballo, ganado, ordeño, queso y comida campesina',
      'Ruta de cascadas, lago y comunidades con acceso verificado localmente'
    ],
    culture: 'Famosa por sus fiestas taurinas con montas rústicas de toros bravos en agosto (fiestas de la Virgen de la Asunción) y la música de chicheros de viento.',
    bestSeason: 'Juigalpa requiere 1 día; al sumar arqueología, de 2 a 3 días. Para recorrer Amerrique, Villa Sandino, Acoyapa y cascadas se recomiendan de 4 a 5 días.',
    howToReach: 'Por la Carretera al Rama (NIC-7) desde Managua hasta Juigalpa (139 km, 2.5 horas).',
    recommendations: 'Contratar guías para Amerrique, cuevas y sitios arqueológicos; confirmar caminos y caudales antes de visitar cascadas. La minería debe abordarse desde la historia y la geología, sin ingresar en zonas de explotación.',
    officialHighlights: [
      'INTUR confirma que El Nancital está formado por 27 islas y ofrece pesca, aves, navegación y alojamiento comunitario.',
      'Piedras Pintadas comprende 150 piedras con más de 1,500 grabados y se relaciona con Garro Grande.',
      'La oferta oficial incluye Amerrique, El Corozo, Punta Mayales, Museo Gregorio Aguilar Barea y Zoológico Thomas Belt.'
    ],
    officialSources: [
      { label: 'INTUR — Chontales', url: 'https://www.intur.gob.ni/2018/12/13/y-si-conoces-chontales-este-fin-de-ano/' },
      { label: 'INTUR — Leche y cuajada', url: 'https://www.intur.gob.ni/2018/09/10/chontales-tierra-de-leche-y-cuajada/' },
      { label: 'Visita Nicaragua — Juigalpa', url: 'https://visitanicaragua.com/en/juigalpa-un-destino-imperdible-de-nicaragua/' }
    ],
    officialVerifiedAt: '26 de septiembre de 2026',
    heroImage: 'assets/images/destinos/canon_de_somoto.jpg',
    lat: 12.0620,
    lng: -85.3640,
    coopCount: 16
  },
  {
    id: 'boaco',
    name: 'Boaco',
    tagline: 'El corazón verde donde las montañas cuentan historias',
    shortDesc: 'Boaco es un territorio de montañas, colinas, fincas ganaderas, cafetales, cascadas, comunidades campesinas, artesanía y profundas tradiciones religiosas. Su relieve quebrado crea miradores y pueblos construidos sobre laderas.',
    expandedDescription: 'La ciudad de dos pisos conecta sus calles inclinadas y patrimonio urbano con Camoapa, las reservas Mombachito–Cerro La Vieja y Filas de Masigüe, las montañas de Santa Lucía y las cascadas de San José de los Remates.',
    municipalities: [
      { name: 'Boaco', identity: 'Ciudad de laderas, cultura, miradores y café' },
      { name: 'Camoapa', identity: 'Ganadería, artesanía, sombreros de pita y reservas' },
      { name: 'Santa Lucía', identity: 'Cerros, café, cascadas y aventura' },
      { name: 'San José de los Remates', identity: 'Cascadas, café, naturaleza y aves' },
      { name: 'Teustepe', identity: 'Lago, agricultura, ganadería y paisaje rural' },
      { name: 'San Lorenzo', identity: 'Campo, producción, tradiciones y naturaleza' }
    ],
    history: 'La identidad boaqueña está ligada a las poblaciones indígenas del centro, la vida campesina, la ganadería y la agricultura. La ciudad conserva calles inclinadas, viviendas de taquezal, techos tradicionales y memoria regional representada por el Cacique Yarrince. Camoapa aporta artesanía y patrimonio rural.',
    gastronomy: [
      { name: 'Queso Boaqueño de Pella', desc: 'Queso suave y salado elaborado con leche de vacas alimentadas en pastos de altura.' },
      { name: 'Carne en Vaho Boaqueña', desc: 'Cocida con leña durante 10 horas con yuca dulce y plátano maduro.' },
      { name: 'Atol de Maíz de Cacao', desc: 'Bebida caliente energizante de origen indígena.' },
      { name: 'Gorditas Dulces de Maíz', desc: 'Asadas al comal con cuajada fresca.' },
      { name: 'Lácteos de Finca', desc: 'Leche, queso, cuajada y crema elaborados en comunidades ganaderas.' },
      { name: 'Sabores Campesinos', desc: 'Güirilas, nacatamales, carnes, sopas, miel, tortillas y café de montaña.' }
    ],
    places: [
      { name: 'Centro Histórico & Calles Escalonadas de Boaco', type: 'Arquitectura Topográfica', icon: 'fa-city' },
      { name: 'Cerro de la Vieja & Cerro Alegre', type: 'Senderismo & Mitos', icon: 'fa-mountain' },
      { name: 'Río Fonseca & Balnearios Naturales', type: 'Pozas de Montaña', icon: 'fa-water' },
      { name: 'Pueblo Ganadero de Camoapa', type: 'Sombreros de Pita & Lácteos', icon: 'fa-hat-cowboy' },
      { name: 'Mirador El Faro', type: 'Panorámica de la Ciudad', icon: 'fa-eye' },
      { name: 'Reserva Mombachito–Cerro La Vieja', type: 'Bosque, senderismo, agua y turismo rural', icon: 'fa-tree' },
      { name: 'Reserva Natural Filas de Masigüe', type: 'Bosque húmedo, aves y conservación del agua', icon: 'fa-feather' },
      { name: 'Comunidad Las Lagunas', type: 'Petrograbados, senderismo, gastronomía y miradores', icon: 'fa-monument' },
      { name: 'Cerros y cascadas de Santa Lucía', type: 'La Cruz, Santo Domingo, Peña Labrada y Salto Las Américas', icon: 'fa-mountain-sun' },
      { name: 'Cueva La Cocinera y Finca El Tamarindo', type: 'Aventura, café, orquídeas y cactus', icon: 'fa-person-hiking' },
      { name: 'Salto La Chorrera', type: 'Senderismo, aves, cafetales y miradores', icon: 'fa-water' }
    ],
    activities: [
      'Caminatas por las escalinatas y miradores urbanos de la Ciudad de Dos Pisos',
      'Trekking al enigmático Cerro de la Vieja con guías locales',
      'Compra directa de sombreros de pita finamente tejidos a mano en Camoapa',
      'Visita a queserías comunitarias y degustación de lácteos',
      'Refrescante baño en las pozas del Río Malacatoya',
      'Experiencia en finca ganadera con ordeño, queso y comida campesina',
      'Ruta de café de montaña, cabalgatas, cascadas y aviturismo'
    ],
    culture: 'Danza ancestral de Los Moros y Cristianos en las fiestas patronales del Apóstol Santiago en julio. Tradición del tejido de fibra de pita en Camoapa.',
    bestSeason: 'La ciudad de Boaco requiere 1 día; Boaco y Camoapa, 2 días. Para sumar Santa Lucía y San José de los Remates se recomiendan de 3 a 4 días.',
    howToReach: 'Por la Carretera Panamericana Norte y desvío en San Benito hacia Boaco (90 km desde Managua, 1.5 horas).',
    recommendations: 'Caminar con calma por las pendientes, usar calzado de montaña y confirmar el acceso a fincas, reservas, cuevas y cascadas. Apoyar la compra directa de sombreros de pita, cuero, madera y productos lácteos.',
    officialHighlights: [
      'INTUR confirma los seis municipios y reconoce a Boaco como destino de turismo rural y cultura ganadera.',
      'La fuente oficial identifica a Boaco como ciudad de dos pisos por su topografía de subidas y bajadas.',
      'La gastronomía oficial suma miel, chingaste de chancho, enchiladita boaqueña, henchida de res y derivados de la leche.'
    ],
    officialSources: [
      { label: 'INTUR — Boaco', url: 'https://www.intur.gob.ni/2018/08/28/boaco-encanta-en-nicaragua/' },
      { label: 'Mapa Nacional — Boaco', url: 'https://www.mapanicaragua.com/boaco/' }
    ],
    officialVerifiedAt: '26 de septiembre de 2026',
    heroImage: 'assets/images/destinos/finca_magdalena.jpg',
    lat: 12.4720,
    lng: -85.6590,
    coopCount: 15
  },
  {
    id: 'nueva-segovia',
    name: 'Nueva Segovia',
    tagline: 'Donde Nicaragua toca las nubes',
    shortDesc: 'Nueva Segovia reúne bosques de pino, café de altura, montañas, historia segoviana, aguas cristalinas, barro artesanal y pueblos fronterizos. El Cerro Mogotón alcanza 2,107 metros y constituye el punto más alto de Nicaragua.',
    expandedDescription: 'La identidad del departamento conecta Ocotal, Dipilto, Ciudad Antigua, Mozonte, Jalapa, Murra y las montañas fronterizas. Pinares, café, maíz, artesanía, religiosidad popular, aguas termales, cascadas y la memoria de Las Segovias forman una experiencia fresca y montañosa.',
    municipalities: [
      { name: 'Ocotal', identity: 'Ciudad de los Pinos, cultura, comercio e historia' },
      { name: 'Dipilto', identity: 'Café, pinares, Virgen de la Piedra y montaña' },
      { name: 'Mozonte', identity: 'Barro artesanal, comunidad indígena y tradición' },
      { name: 'Macuelizo', identity: 'Feria del Jocote, producción y gastronomía' },
      { name: 'Santa María', identity: 'Paisaje seco, comunidades y producción' },
      { name: 'San Fernando', identity: 'Café, montañas, naturaleza y aguas termales' },
      { name: 'Ciudad Antigua', identity: 'Ruta colonial, iglesias y memoria local' },
      { name: 'El Jícaro', identity: 'Historia, campo y cultura segoviana' },
      { name: 'Jalapa', identity: 'Café, tabaco, maíz, música y montaña' },
      { name: 'Murra', identity: 'Cascadas, café, bosque y senderismo' },
      { name: 'Quilalí', identity: 'Montaña, historia y comunidades rurales' },
      { name: 'Wiwilí de Nueva Segovia', identity: 'Ríos, naturaleza, producción y frontera' }
    ],
    history: 'Nueva Segovia forma parte de la región histórica de Las Segovias. Ciudad Antigua remonta sus orígenes coloniales a 1543 y conserva memoria de los primeros asentamientos y ataques que transformaron la región. Las montañas también fueron escenario de la defensa de la soberanía encabezada por Augusto C. Sandino.',
    gastronomy: [
      { name: 'Tamal Relleno Segoviano', desc: 'Maíz con masa sazonada con manteca y relleno de pollo campesino.' },
      { name: 'Café de Dipilto (Taza de Excelencia)', desc: 'Reconocido con los mayores puntajes internacionales de café especial.' },
      { name: 'Rosquillas de Jalapa', desc: 'Horneadas crujientes con queso de montaña.' },
      { name: 'Empanadas de Maíz con Cuajada', desc: 'Fritas al momento en manteca pura.' },
      { name: 'Sabores de Montaña', desc: 'Güirilas, cuajada, crema, frijoles, carnes, miel, rosquillas y panes.' },
      { name: 'Ruta del Maíz y el Jocote', desc: 'Productos, dulces y bebidas vinculados con Jalapa y Macuelizo.' }
    ],
    places: [
      { name: 'Cerro Mogotón (2,107 msnm)', type: 'Cima Más Alta de Nicaragua', icon: 'fa-mountain' },
      { name: 'Santuario de la Virgen de la Piedra (Dipilto)', type: 'Sitio Religioso & Río', icon: 'fa-church' },
      { name: 'Aguas Termales de Macuelizo & Delia', type: 'Termalismo Terapéutico', icon: 'fa-hot-tub-person' },
      { name: 'Valle Fértil de Jalapa', type: 'Granero de Maíz & Tabaco', icon: 'fa-seedling' },
      { name: 'Ocotal Colonial & Casa de la Cultura', type: 'Historia & Música', icon: 'fa-landmark' },
      { name: 'Ciudad Antigua', type: 'Ruta colonial, iglesias, arquitectura y comunidades', icon: 'fa-building-columns' },
      { name: 'Cerro Las Tres Señoritas', type: 'Senderismo y vistas panorámicas cerca de Ocotal', icon: 'fa-mountain-sun' },
      { name: 'Cruz de la Fe', type: 'Mirador y recorrido religioso en Dipilto', icon: 'fa-cross' },
      { name: 'Artesanías de Mozonte', type: 'Barro, talleres y compra directa a creadores', icon: 'fa-hands' },
      { name: 'Salto El Rosario', type: 'Cascada, senderismo, bosque y comunidades de Murra', icon: 'fa-water' },
      { name: 'Aguas termales Don Alfonso', type: 'Naturaleza y bienestar en San Fernando', icon: 'fa-hot-tub-person' }
    ],
    activities: [
      'Expedición y cumbre al Cerro Mogotón entre pinares y neblina',
      'Baños relajantes en pozas de aguas termales medicinales',
      'Cata de cafés ganadores de certámenes mundiales en Dipilto',
      'Ruta histórica de Sandino por los cerros de Quilalí y El Chipote',
      'Senderismo en la cordillera de Dipilto y Jalapa',
      'Talleres de barro y compra directa a artesanos de Mozonte',
      'Ruta productiva del maíz en Jalapa y del jocote en Macuelizo'
    ],
    culture: 'Famosa por sus sones de mazurcas campesinas, fiestas patronales de la Virgen de la Asunción en Ocotal y la gran Feria Nacional del Maíz en Jalapa en septiembre.',
    bestSeason: 'Ocotal y Dipilto requieren 2 días; al sumar Jalapa se recomiendan 3 días. Para conocer el departamento completo, incluyendo Murra y Mogotón, se necesitan de 5 a 6 días.',
    howToReach: 'Por la Carretera Panamericana Norte pasando por Estelí y Somoto hacia Ocotal (226 km desde Managua, 4 horas).',
    recommendations: 'Contratar guía local para Mogotón y verificar acceso, clima y seguridad antes de salir. Llevar abrigo, hidratación, navegación sin conexión y calzado de montaña. Comprar café y artesanía directamente a productores cuando sea posible.',
    officialHighlights: [
      'INTUR confirma que Nueva Segovia posee 12 municipios y que Mogotón, con 2,107 metros, es el punto más alto del país.',
      'La oferta oficial destaca Ciudad Antigua, café premiado, artesanía de barro y pino, aguas termales y la Feria Nacional del Maíz.',
      'Visita Nicaragua reconoce Dipilto, Mozonte y San Fernando como corredor de ciclismo de montaña y turismo rural sostenible.'
    ],
    officialSources: [
      { label: 'INTUR — Nueva Segovia', url: 'https://www.intur.gob.ni/2018/09/07/el-departamento-del-mejor-cafe-en-nicaragua-te-espera/' },
      { label: 'INTUR — Turismo en Nueva Segovia', url: 'https://www.intur.gob.ni/2022/07/29/intur-cuenta-con-nuevo-edificio-para-delegacion-en-nueva-segovia/' },
      { label: 'Visita Nicaragua — Cicloturismo', url: 'https://www.visitanicaragua.com/nicaragua-un-destino-ideal-para-cicloturistas/' }
    ],
    officialVerifiedAt: '26 de septiembre de 2026',
    heroImage: 'assets/images/destinos/selva_negra.jpg',
    lat: 13.6330,
    lng: -86.4750,
    coopCount: 20
  },
  {
    id: 'rio-san-juan',
    name: 'Río San Juan',
    tagline: 'Navega la historia. Entra a la selva',
    shortDesc: 'Río San Juan combina Cocibolca, navegación fluvial, selva tropical, fauna, fortalezas, arte primitivista, islas, pesca, cacao y Caribe en uno de los territorios naturales e históricos más diversos de Nicaragua.',
    expandedDescription: 'La Ruta del Agua avanza desde San Carlos y Solentiname hacia El Castillo, Bartola, Indio Maíz y San Juan de Nicaragua. Fortalezas, humedales, comunidades ribereñas, arqueología, pintura, cacao y biodiversidad acompañan el recorrido.',
    municipalities: [
      { name: 'San Carlos', identity: 'Lago, malecón, cultura, Solentiname y puerta del río' },
      { name: 'El Castillo', identity: 'Fortaleza, río, cacao, Bartola e Indio Maíz' },
      { name: 'San Juan de Nicaragua', identity: 'Caribe, Greytown, lagunas, caños y selva' },
      { name: 'San Miguelito', identity: 'Humedales, pesca, lago, comunidades y atardeceres' },
      { name: 'Morrito', identity: 'Lago, pesca, campo y vida comunitaria' },
      { name: 'El Almendro', identity: 'Ríos, ganadería, agricultura y cultura campesina' }
    ],
    history: 'El río San Juan fue durante siglos una ruta estratégica entre el Cocibolca y el Caribe. Su memoria reúne pueblos originarios, expediciones coloniales, piratas, fortificaciones, comercio, vapores y la ruta del tránsito del siglo XIX. En El Castillo, la Fortaleza de la Inmaculada Concepción y la historia de Rafaela Herrera conservan ese legado.',
    gastronomy: [
      { name: 'Camarón de Río al Ajillo', desc: 'Camarones gigantes de agua dulce cocinados con mantequilla y ajo.' },
      { name: 'Sopa de Pescado Gaspar', desc: 'Fósil viviente cocinado con verduras de la selva y leche de coco.' },
      { name: 'Tostones Rellenos de Salpicón de Sábalo', desc: 'Bocados crujientes con pescado fresco.' },
      { name: 'Tortilla de Maíz con Frijoles Nuevos', desc: 'Acompañada de cuajada fresca ribereña.' },
      { name: 'Ruta del Cacao', desc: 'Mazorca, fermentación, secado, tostado, chocolate y degustación en fincas y comunidades.' },
      { name: 'Sabores del Agua y la Selva', desc: 'Pescado, sopas, plátano, maíz, productos tropicales, miel y lácteos rurales.' }
    ],
    places: [
      { name: 'Fortaleza de la Inmaculada Concepción (El Castillo)', type: 'Monumento Nacional Siglo XVII', icon: 'fa-chess-rook' },
      { name: 'Reserva Biológica Indio Maíz', type: 'Selva Virgen & Jaguares', icon: 'fa-tree' },
      { name: 'Archipiélago de Solentiname', type: 'Islas de Pintores Primitivistas', icon: 'fa-palette' },
      { name: 'Humedales de San Carlos & Malecón', type: 'Confluencia Lago-Río', icon: 'fa-water' },
      { name: 'San Juan de Nicaragua (Greytown)', type: 'Salida al Caribe & Cementerios Británicos', icon: 'fa-anchor' },
      { name: 'San Carlos y su circuito urbano', type: 'Malecón, fortaleza, centro cultural, museo y puerto', icon: 'fa-city' },
      { name: 'Bartola', type: 'Senderismo, cacao, fauna, cabalgatas y aviturismo', icon: 'fa-tree' },
      { name: 'Refugio de Vida Silvestre Río San Juan', type: 'Bosque húmedo, humedales y biodiversidad', icon: 'fa-feather' },
      { name: 'Antigua Greytown', type: 'Cementerios, lagunas, caños y memoria del tránsito', icon: 'fa-landmark' },
      { name: 'Refugio Los Guatuzos', type: 'Kayak, aves, fauna, bosque y senderos', icon: 'fa-binoculars' },
      { name: 'Muelle de San Miguelito y Chocoyolandia', type: 'Atardeceres, gastronomía y balneario lacustre', icon: 'fa-water' }
    ],
    activities: [
      'Navegación en lancha rápida por los raudales de El Castillo',
      'Senderismo de selva virgen con guardarrecursos indígenas en Indio Maíz',
      'Talleres de pintura primitivista y artesanía en balsa en Solentiname',
      'Pesca deportiva de captura y liberación del sábalo real gigante',
      'Safari nocturno en bote para avistamiento de caimanes y aves nocturnas',
      'Ruta del cacao y chocolate con productores locales',
      'Kayak, aviturismo, arqueología y turismo comunitario en islas y humedales'
    ],
    culture: 'Pintura primitivista fundada por Ernesto Cardenal en Solentiname, artesanías talladas en madera de balsa, poesías y leyendas de piratas.',
    bestSeason: 'San Carlos requiere de 1 a 2 días; con Solentiname, 3 días; con El Castillo, de 3 a 4 días. Para la ruta completa hasta el Caribe se recomiendan de 6 a 8 días.',
    howToReach: 'Vía terrestre por carretera pavimentada hasta San Carlos (290 km desde Managua, 5 horas) o ferry desde Granada hacia San Carlos.',
    recommendations: 'Confirmar horarios, embarcaciones, clima y navegación antes de cada tramo. Ingresar a Indio Maíz únicamente por accesos autorizados y con guía. Los avistamientos de fauna dependen de condiciones naturales y nunca deben garantizarse.',
    officialHighlights: [
      'INTUR confirma que la Ruta del Agua conecta seis municipios mediante lago, río, cultura y naturaleza.',
      'El inventario SIIT incluye Indio Maíz–Bartola, fincas de cacao, circuito urbano de San Carlos, San Miguelito y Antigua Greytown.',
      'Visita Nicaragua reconoce Solentiname como destino artístico de kayak, naturaleza, historia y artesanía primitivista.'
    ],
    officialSources: [
      { label: 'INTUR — Ruta del Agua', url: 'https://www.intur.gob.ni/2019/02/12/nicaragua-relanza-ruta-del-agua/' },
      { label: 'INTUR/SIIT — Río San Juan', url: 'https://tramites.intur.gob.ni/siit/public/site/atractivosTuristicosRioSanJuan.html' },
      { label: 'Visita Nicaragua — Islas', url: 'https://www.visitanicaragua.com/atractivos/islas/' }
    ],
    officialVerifiedAt: '26 de septiembre de 2026',
    heroImage: 'assets/images/destinos/fortaleza_el_castillo.jpg',
    lat: 11.0180,
    lng: -84.3970,
    coopCount: 27
  },
  {
    id: 'raccn',
    name: 'RACCN (Caribe Norte)',
    tagline: 'Donde la selva, los ríos y el Caribe guardan culturas ancestrales',
    shortDesc: 'La Costa Caribe Norte reúne territorio, pueblos, lenguas, cosmovisiones y biodiversidad. Comunidades miskitas, mayangnas y mestizas conviven con Bosawás, Cayos Miskitos, Río Coco, sabanas de pino y el Triángulo Minero.',
    expandedDescription: 'BAQUEANO presenta la región bajo el principio “visita con la comunidad, no visita a la comunidad”. Bilwi, Wangki, Bosawás, los cayos y el Triángulo Minero requieren coordinación local, respeto cultural y planificación según clima y transporte.',
    municipalities: [
      { name: 'Puerto Cabezas / Bilwi', identity: 'Puerta urbana, cultura miskita, costa y mercados' },
      { name: 'Waspam', identity: 'Portal del Wangki, navegación y cultura miskita' },
      { name: 'Prinzapolka', identity: 'Ríos, Caribe, pesca, humedales y comunidades' },
      { name: 'Rosita', identity: 'Naturaleza, memoria productiva y Triángulo Minero' },
      { name: 'Bonanza', identity: 'Montaña, cultura mayangna, ríos y memoria minera' },
      { name: 'Siuna', identity: 'Bosawás, bosque, biodiversidad y agricultura' },
      { name: 'Mulukukú', identity: 'Ríos, producción, conexión terrestre y comunidades' },
      { name: 'Waslala', identity: 'Montaña, agricultura, naturaleza y vida comunitaria' }
    ],
    history: 'Territorio soberano de las naciones originarias Miskita y Mayangna que resistieron a la colonia española y mantuvieron su autogobierno ancestral consagrado en la Ley de Autonomía de 1987.',
    gastronomy: [
      { name: 'Luk Luk Costeño', desc: 'Sopa ancestral miskita de carne de res hervida con yuca, plátano y culantro de monte.' },
      { name: 'Wabul de Plátano o Yuca', desc: 'Bebida espesa nutritiva elaborada con plátano maduro batido con leche de coco fresca.' },
      { name: 'Pescado Ahumado con Leña de Mangle', desc: 'Técnica de conservación tradicional indígena.' },
      { name: 'Pan de Coco Tradicional', desc: 'Horneado a la leña con coco recién rallado.' },
      { name: 'Rondón Caribeño', desc: 'Coco, tubérculos y pescado o carne preparados según la tradición comunitaria.' },
      { name: 'Bunya y Productos del Territorio', desc: 'Yuca fermentada, pescado, mariscos, plátano, maíz y coco.' }
    ],
    places: [
      { name: 'Reserva de Biosfera Bosawás', type: 'Patrimonio de la Humanidad UNESCO', icon: 'fa-tree' },
      { name: 'Río Coco / Wangki', type: 'Río Más Largo de Centroamérica', icon: 'fa-water' },
      { name: 'Bilwi (Puerto Cabezas) & Muelle Histórico', type: 'Cultura Caribeña & Playas', icon: 'fa-anchor' },
      { name: 'Comunidades Mayangnas de Bonanza y Rosita', type: 'Pueblos Originarios', icon: 'fa-hands-holding' },
      { name: 'Cayos Miskitos', type: 'Arrecifes & Casas sobre Pilotes', icon: 'fa-fish' },
      { name: 'Waspam, Portal del Wangki', type: 'Navegación, comunidades, lengua y cultura', icon: 'fa-ship' },
      { name: 'Sabanas de Pino', type: 'Paisaje, fotografía, fauna y comunidad', icon: 'fa-tree' },
      { name: 'Triángulo Minero', type: 'Siuna, Bonanza y Rosita: naturaleza y memoria productiva', icon: 'fa-mountain-sun' }
    ],
    activities: [
      'Expediciones científicas y de ecoturismo en los senderos de Bosawás',
      'Navegación en pipante tradicional por los raudales del Río Coco',
      'Convivencia comunitaria en aldeas indígenas Mayangna y Miskita',
      'Snorkel y buceo en los prístinos Cayos Miskitos',
      'Degustación de mariscos recién capturados en Bilwi'
    ],
    culture: 'Celebración del "King Pulanka" en enero (danza de sátira y memoria real miskita), lengua materna Miskita y Mayangna, cantos espirituales y artesanía en corteza de tuno.',
    bestSeason: 'Bilwi requiere 2 días; costa y comunidad, de 3 a 4 días; Waspam y Río Coco suman de 2 a 3 días. Una experiencia profunda puede requerir de 6 a 10 días según transporte y clima.',
    howToReach: 'Vuelos comerciales diarios de La Costeña desde Managua a Bilwi (1 hora) o por carretera pavimentada (520 km, aprox. 10 horas).',
    recommendations: 'Comprobar clima, carretera, río, navegación, transporte y disponibilidad antes de crear un itinerario. Coordinar cada visita con autoridades y anfitriones comunitarios; confirmar permisos, guía, normas de fotografía y prácticas culturales. No ingresar solo a Bosawás ni prometer tiempos fijos en rutas remotas.',
    officialHighlights: [
      'INTUR organiza la Ruta del Caribe Norte en los circuitos Bilwi, Sam Pitts y Litoral Sur.',
      'Visita Nicaragua reconoce Cayos Miskitos entre los grandes destinos insulares y marinos del país.',
      'La planificación regional debe integrar sitios sagrados, manifestaciones culturales, patrimonio natural y coordinación comunitaria.'
    ],
    officialSources: [
      { label: 'INTUR — Caribe Norte', url: 'https://www.intur.gob.ni/2019/03/12/ruta-de-caribe-norte/' },
      { label: 'Visita Nicaragua — Islas', url: 'https://www.visitanicaragua.com/atractivos/islas/' }
    ],
    officialVerifiedAt: '26 de septiembre de 2026',
    requiresCommunityCoordination: true,
    transportMustBeVerified: true,
    culturalSensitivity: 'alta',
    heroImage: 'assets/images/destinos/cascada_la_luna.jpg',
    lat: 14.0350,
    lng: -83.3880,
    coopCount: 17
  },
  {
    id: 'raccs',
    name: 'RACCS (Caribe Sur)',
    tagline: 'Donde Nicaragua habla en muchos idiomas y el Caribe pinta el horizonte',
    shortDesc: 'La Costa Caribe Sur combina ciudades costeras, comunidades indígenas y afrocaribeñas, ríos, lagunas, selvas, islas, cayos coralinos, playas claras y una gastronomía marcada por coco y productos del mar.',
    expandedDescription: 'Bluefields, Corn Island, Little Corn, Laguna de Perlas, Cayos Perlas y las comunidades Rama y Garífuna expresan una región multicultural donde conviven identidades creole, miskita, mestiza, rama, ulwa y garífuna.',
    municipalities: [
      { name: 'Bluefields', identity: 'Capital regional, bahía, música y multiculturalidad' },
      { name: 'Corn Island', identity: 'Islas, playas, buceo, pesca y gastronomía' },
      { name: 'Laguna de Perlas', identity: 'Laguna, Cayos Perlas, comunidades y cultura' },
      { name: 'Kukra Hill', identity: 'Agricultura, cultura caribeña y naturaleza' },
      { name: 'El Rama', identity: 'Nodo fluvial, conectividad y vida urbana caribeña' },
      { name: 'Nueva Guinea', identity: 'Agricultura, ganadería, cacao y comunidades' },
      { name: 'Muelle de los Bueyes', identity: 'Producción, naturaleza y conexión terrestre' },
      { name: 'El Ayote', identity: 'Ruralidad, producción y vida comunitaria' },
      { name: 'Bocana de Paiwas', identity: 'Ríos, campo, naturaleza y comunidades' },
      { name: 'La Cruz de Río Grande', identity: 'Río, cultura, producción y territorio' },
      { name: 'Desembocadura de Río Grande', identity: 'Río, mar, cayos, pesca y navegación' },
      { name: 'El Tortuguero', identity: 'Cascadas, senderos, aves y comunidades' }
    ],
    history: 'Mosaico multicultural único integrado por comunidades Creoles, Garífunas, Ramas, Miskitas y Mestizas. Puerto de gran relevancia histórica en el Caribe centroamericano.',
    gastronomy: [
      { name: 'Rondón Costeño (Run Down)', desc: 'Pescado fresco, langosta, cangrejo, yuca, plátano y fruta de pan cocinados a fuego lento en leche de coco con chile cabro.' },
      { name: 'Gingerser (Cerveza de Jengibre)', desc: 'Bebida fermentada afrocaribeña especiada.' },
      { name: 'Patties Costeños', desc: 'Empanadas crujientes rellenas de carne picada picante.' },
      { name: 'Queque de Quequisque y Pan de Coco', desc: 'Repostería fina tradicional.' },
      { name: 'Rice and Beans y Patí', desc: 'Arroz con frijoles en coco y empanada tradicional de la cocina caribeña.' },
      { name: 'Sabores del Mar', desc: 'Pescado, camarón, cangrejo y langosta únicamente durante temporada autorizada.' }
    ],
    places: [
      { name: 'Corn Island & Little Corn Island', type: 'Playas Turquesas & Arrecife', icon: 'fa-umbrella-beach' },
      { name: 'Cayos Perlas', type: 'Islas de Coral Desiertas', icon: 'fa-fish' },
      { name: 'Bahía de Bluefields & Malecón', type: 'Cultura Afrocaribeña', icon: 'fa-anchor' },
      { name: 'Laguna de Perlas & Aspinwall', type: 'Humedales & Comunidades Garífunas', icon: 'fa-water' },
      { name: 'Isla Rama Cay', type: 'Pueblo Originario Rama', icon: 'fa-people-roof' },
      { name: 'Bluff Beach', type: 'Playa, paisaje, deporte y gastronomía marina', icon: 'fa-umbrella-beach' },
      { name: 'Playas de Corn Island', type: 'Long Bay, South West Bay, Heavy Sand y Mount Pleasant', icon: 'fa-water' },
      { name: 'Little Corn Island y Otto Beach', type: 'Caminatas, snorkel, buceo y descanso', icon: 'fa-island-tropical' },
      { name: 'Awas y Orinoco', type: 'Experiencias culturales comunitarias miskita y garífuna', icon: 'fa-people-group' },
      { name: 'Saltos Walpapigny y Busay', type: 'Senderismo, aves, naturaleza y aguas termales', icon: 'fa-water' }
    ],
    activities: [
      'Buceo y snorkel en los arrecifes de coral virgen de Little Corn Island',
      'Paseo en lancha a los islotes desiertos de arena blanca en Cayos Perlas',
      'Bailar al ritmo de Palo de Mayo en las comparsas callejeras de Bluefields',
      'Pesca de langosta y degustación de rondón en la playa',
      'Recorrido cultural por los pueblos Garífunas de Orinoco',
      'Rutas de música, Palo de Mayo, calipso, reggae y cultura viva',
      'Navegación comunitaria por lagunas, ríos, bahías y cayos'
    ],
    culture: 'El vibrante Festival de Palo de Mayo (Maypole) durante todo mayo, música soca y reggae, espiritualidad garífuna (Walagallo) y hospitalidad caribeña.',
    bestSeason: 'Bluefields requiere 2 días; Corn Island, de 3 a 4; Corn y Little Corn, 5. Bluefields con Laguna de Perlas y Cayos requiere de 4 a 5 días; una ruta amplia puede tomar de 7 a 12 días.',
    howToReach: 'Vuelos comerciales de La Costeña desde Managua a Bluefields y Corn Island (45 min) o por la moderna carretera Managua-Bluefields (360 km, 5.5 horas).',
    recommendations: 'Comprobar avión, carretera, lancha, clima, mar y disponibilidad local. Coordinar las experiencias con anfitriones comunitarios y respetar lenguas, normas de fotografía y consentimiento. Para cayos y navegación verificar operador, embarcación, chaleco, oleaje, horario y retorno.',
    officialHighlights: [
      'INTUR confirma una Ruta del Caribe Sur de 12 municipios con cultura, aventura, sol, playa, buceo, snorkel y pesca.',
      'La ruta oficial incorpora Bluefields, Rama Cay, Laguna de Perlas, Orinoco, Awas, Corn Island y Little Corn Island.',
      'Visita Nicaragua reconoce Corn Island, Little Corn y Cayos Perlas entre los grandes destinos insulares del país.'
    ],
    officialSources: [
      { label: 'INTUR — Caribe Sur', url: 'https://www.intur.gob.ni/2019/03/15/que-tiene-la-ruta-del-caribe-sur/' },
      { label: 'Visita Nicaragua — Islas', url: 'https://www.visitanicaragua.com/atractivos/islas/' },
      { label: 'INTUR — Delegación RACCS', url: 'https://www.intur.gob.ni/delegacion-raccs/' }
    ],
    officialVerifiedAt: '26 de septiembre de 2026',
    requiresCommunityCoordination: true,
    transportMustBeVerified: true,
    culturalSensitivity: 'alta',
    heroImage: 'assets/images/destinos/corn_island.jpg',
    lat: 12.1720,
    lng: -83.0580,
    coopCount: 31
  }
];
