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
      { name: 'Monumento Nacional Cañón de Somoto', type: 'Geositio / Geoparque UNESCO', icon: 'fa-water', desc: 'Cañón labrado por el río Coco entre paredes de roca; se recorre caminando, nadando y saltando con guías locales. Es parte del Geoparque Río Coco, reconocido por la UNESCO.', verification: {status: "verified",verifiedAt: "2026-10-05",facts: "Monumento Nacional reconocido por INTUR y MARENA. MARENA informa un recorrido de aproximadamente 4 km y aguas de hasta 18 m de profundidad.",price: "MARENA (03/04/2025): C$35 nacionales y C$108 visitantes de otras nacionalidades. Revalidar antes del viaje.",contact: "Canales oficiales de INTUR/MARENA o guías locales validados.",sources: [{label: "INTUR",url: "https://www.intur.gob.ni/2026/02/26/listo-para-desafiar-al-canon-de-somoto/"},{label: "MARENA",url: "https://www.marena.gob.ni/2025/04/03/acompanamiento-al-comite-de-manejo-colaborativo-del-monumento-nacional-canon-de-somoto/"}]} },
      { name: 'Reserva Natural Tepesomoto-La Pataste', type: 'Bosque Nuboso & Biodiversidad', icon: 'fa-tree', desc: 'Montaña protegida cerca de Somoto con bosque nuboso y pinares, fuente de agua para las comunidades y refugio de aves.' },
      { name: 'Laguna La Bruja (Las Sabanas)', type: 'Humedal de Altura & Canopy', icon: 'fa-water', desc: 'Laguna de altura en el municipio de Las Sabanas, rodeada de bosque de pino y clima fresco; se visita con guías comunitarios.' },
      { name: 'Mirador El Balcón (San José de Cusmapa)', type: 'Vistas al Pacífico & Serranías', icon: 'fa-mountain-sun', desc: 'Mirador en las serranías de Cusmapa, uno de los poblados más altos del país; en días despejados se divisa hacia el Golfo de Fonseca.' },
      { name: 'Parque Natural El Majaste (San Juan del Río Coco)', type: 'Cafetales de Altura & Cascadas', icon: 'fa-leaf', desc: 'Área natural entre cafetales de altura del norte de Madriz, con senderos, pozas y caídas de agua.' },
      { name: 'Comunidad Indígena San José de Palmira (Totogalpa)', type: 'Turismo Rural Comunitario', icon: 'fa-hands-holding-circle', desc: 'Comunidad indígena de Totogalpa que recibe visitantes con turismo rural comunitario: vida campesina, cocina local y tradiciones.' },
      { name: 'Talleres de Cerámica de Loma Panda (San Lucas)', type: 'Alfarería Prehispánica', icon: 'fa-palette', desc: 'Talleres familiares de alfarería en San Lucas, donde se trabaja el barro con técnicas heredadas; se puede ver el proceso y comprar directo.' },
      { name: 'Parque Arqueológico Piedras Pintadas', type: 'Petroglifos & Memoria Viva', icon: 'fa-feather', desc: 'Rocas con petroglifos precolombinos que forman parte de la memoria ancestral de Madriz; se visitan con respeto y sin tocar los grabados.' },
      {name: "Rosquillas Delicias del Norte",type: "Gastronomía y emprendimiento local",icon: "fa-cookie-bite",desc: "Taller de rosquillas somoteñas que INTUR y el Mapa Nacional de Turismo mencionan como referencia en Somoto.",verification: {status: "verified",verifiedAt: "2026-10-05",facts: "Empresa real de rosquillas somoteñas en Somoto. Fuentes periodísticas identifican a Flora (Florita) Ortiz como fundadora.",price: "Consultar precio y horario al establecimiento.",contact: "Contacto pendiente de confirmar directamente con el negocio.",sources: [{label: "Mapa Nacional de Turismo",url: "https://www.mapanicaragua.com/municipio-de-somoto/"},{label: "INTUR",url: "https://www.intur.gob.ni/2015/06/25/mpymes-de-granada-y-madriz-intercambian-experiencias/"}]}},
      {name: "Finca Entre Pinos",type: "Turismo rural · Senderismo",icon: "fa-house-chimney",desc: "Cabañas entre pinos, cedros y robles en El Rodeo de Cusmapa, unidas por puentes colgantes de árbol en árbol.",verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Turismo rural",facts: "Cabañas entre pinos, cedros y robles en El Rodeo de Cusmapa, unidas por puentes colgantes de árbol en árbol.",activities: "Senderismo, canopy, actividades agrícolas y avistamiento de aves.",services: "Alimentación, hospedaje, piscina climatizada, camping, juegos para niños y tienda de recuerdos.",hours: "9:00 a. m.–6:00 p. m.",address: "Bulevar de Cusmapa 5 km al este, El Rodeo.",phones: ["8330-4660","5849-1548"],map: "https://www.google.com/maps/d/u/0/edit?mid=1gJEZ4HTewWspc7_qtrxqICCTEkifU5U&usp=sharing",contact: "Contacto publicado por INTUR en el catálogo 2026; confirmar antes de viajar.",sources: [{label: "INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)",url: ""}]}},
      {name: "Casa de Huésped La Ceibita",type: "Agroturismo · Senderismo",icon: "fa-seedling",desc: "Casa de familias anfitrionas junto al Cañón de Somoto, con tours al cañón y oficios tradicionales del campo.",verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Agroturismo",facts: "Casa de familias anfitrionas junto al Cañón de Somoto, con tours al cañón y oficios tradicionales del campo.",activities: "Senderismo, actividades agropecuarias, cabalgata, neumático, apicultura, ordeño y fogatas.",services: "Alimentación, hospedaje, tours al cañón y guía turístico.",hours: "Lunes a domingo, 6:00 a. m.–9:00 p. m.",address: "Entrada principal al Cañón de Somoto, 250 m al suroeste, Somoto.",phones: ["8919-9199"],map: "https://www.google.com/maps/d/u/0/edit?mid=1qEo_gKYBh1qKs2ralmJFYM7KpFhlgJo&usp=sharing",contact: "Contacto publicado por INTUR en el catálogo 2026; confirmar antes de viajar.",sources: [{label: "INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)",url: ""}]}},
      {name: "Río Estelí",type: "Río · Paisaje",icon: "fa-water",desc: "Río principal de la cuenca de Estelí; su sistema fluvial se relaciona con el Salto de La Estanzuela.",lat: 13.49602,lng: -86.26757,category: "rio",precision: "approximate",geoSource: {label: "GeoNames",url: "https://mapcarta.com/es/19584058"},verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Ríos",facts: "Río principal de la cuenca de Estelí; su sistema fluvial se relaciona con el Salto de La Estanzuela.",activities: "Paisaje, educación ambiental y senderismo en sitios asociados.",zone: "Cuenca Estelí-Telpaneca",sources: [{label: "GeoNames",url: "https://mapcarta.com/es/19584058"}]}}
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
      { name: 'Insigne Basílica Catedral de León', type: 'Patrimonio Mundial, arquitectura, religión y fotografía', icon: 'fa-church', desc: 'La catedral más grande de Centroamérica, Patrimonio de la Humanidad. Sus techos blancos se recorren a pie y guarda la tumba de Rubén Darío.' },
      { name: 'Museo Archivo Rubén Darío', type: 'Literatura, historia e identidad nacional', icon: 'fa-book-open', desc: 'Casa donde vivió de niño Rubén Darío, el poeta del modernismo; conserva objetos, documentos y espacios de su vida en León.' },
      { name: 'Museo de la Revolución', type: 'Historia política reciente y memoria nacional', icon: 'fa-landmark', desc: 'Espacio dedicado a la historia política reciente de Nicaragua, con fotografías y relatos; desde su techo hay vistas del centro de León.' },
      { name: 'Centro de Arte Fundación Ortiz Gurdián', type: 'Arte latinoamericano y europeo', icon: 'fa-palette', desc: 'Colección de arte latinoamericano y europeo en casonas coloniales restauradas del centro de León.' },
      { name: 'Iglesia San Juan Bautista de Sutiaba', type: 'Patrimonio indígena, arquitectura y memoria', icon: 'fa-place-of-worship', desc: 'Templo colonial del barrio indígena de Sutiaba, uno de los más antiguos de León, con su sol tallado en el techo de madera.' },
      { name: 'Teatro Municipal José de la Cruz Mena', type: 'Cultura, música, arquitectura y artes escénicas', icon: 'fa-masks-theater', desc: 'Teatro histórico de León que lleva el nombre del compositor leonés José de la Cruz Mena; sede de conciertos y artes escénicas.' },
      { name: 'Museo de Mitos y Leyendas', type: 'Narrativa popular y memoria viva', icon: 'fa-book-skull', desc: 'Museo que reúne personajes de la tradición oral nicaragüense, como la Carreta Nahua y la Gigantona, en figuras y relatos.' },
      { name: 'Volcán Cerro Negro', type: 'Senderismo, ascenso volcánico y sandboarding', icon: 'fa-volcano', desc: 'Cono de arena volcánica negra, de los volcanes más jóvenes de Centroamérica. Se sube a pie y se desciende en tabla (sandboarding).', verification: {status: "verified",verifiedAt: "2026-10-05",facts: "Área protegida administrada por MARENA (Reserva Natural Complejo Volcánico Cerro Negro). Se formó en 1850, tiene 726 m y es uno de los principales destinos de sandboarding del país.",price: "La tarifa de sandboarding depende de cada operador; consultá con el proveedor y la fecha.",contact: "Información institucional: MARENA.",sources: [{label: "MARENA",url: "https://www.marena.gob.ni/2026/07/09/volcan-cerro-negro-recibe-la-visita-de-mas-de-34-mil-turistas"},{label: "MARENA",url: "https://www.marena.gob.ni/2025/04/13/volcan-cerro-negro/"}]} },
      { name: 'Volcán Telica', type: 'Senderismo, fotografía y observación geológica', icon: 'fa-mountain-sun', desc: 'Volcán activo de la cordillera de los Maribios; las caminatas guiadas suben hasta el borde del cráter, muy buscado al atardecer.' },
      { name: 'Hervideros de San Jacinto', type: 'Geología, educación ambiental y turismo comunitario', icon: 'fa-temperature-high', desc: 'Campo de fumarolas y lodo hirviente al pie del Telica; la comunidad de San Jacinto guía el recorrido por senderos seguros.' },
      { name: 'Volcán El Hoyo', type: 'Senderismo, campamento y aventura', icon: 'fa-mountain', desc: 'Volcán de los Maribios con travesías de senderismo y campamento, conocido por su gran agujero en la ladera.' },
      { name: 'Volcán Momotombo', type: 'Paisaje volcánico, historia y lago Xolotlán', icon: 'fa-volcano', desc: 'Volcán de cono casi perfecto a orillas del lago Xolotlán, símbolo de León y vecino de las Ruinas de León Viejo.' },
      { name: 'Ruinas de León Viejo', type: 'Patrimonio Mundial y arqueología colonial', icon: 'fa-landmark', desc: 'Restos de la primera ciudad de León, a orillas del Xolotlán y frente al Momotombo; Patrimonio de la Humanidad.' },
      { name: 'Las Peñitas y Poneloya', type: 'Playa, surf, gastronomía marina y atardeceres', icon: 'fa-umbrella-beach', desc: 'Playas del Pacífico a pocos minutos de León, con pueblos de pescadores, olas para surf y atardeceres.' },
      { name: 'Isla Juan Venado', type: 'Manglares, fauna, lancha y kayak', icon: 'fa-water', desc: 'Reserva de estero y manglares frente a Las Peñitas, con aves acuáticas y playas de anidación de tortugas; se recorre en lancha.', lat: 12.31306, lng: -86.94889, category: "isla", precision: "approximate", geoSource: {label: "Wikidata / Mapa Nacional de Turismo",url: "https://www.mapanicaragua.com/sol-y-playa/"}, verification: {status: "verified",verifiedAt: "2026-10-05",facts: "Isla y reserva natural paralela a la costa del Pacífico leonés, con manglares, fauna y playas de anidación de tortugas.",activities: "Lancha, kayak, manglares y observación de fauna.",zone: "León",sources: [{label: "Wikidata / Mapa Nacional de Turismo",url: "https://www.mapanicaragua.com/sol-y-playa/"}]} },
      {name: "Poco a Poco Hostel",type: "Hostal en el centro de León",icon: "fa-bed",desc: "Hostal en León con piscina, cocina compartida, jardín, bar, habitaciones privadas y dormitorios.",verification: {status: "verified",verifiedAt: "2026-10-05",facts: "Hostel real en León (2da Calle NO, Iglesia Bautista ½ c. arriba). Su sitio oficial indica piscina, cocina, jardín, bar, habitaciones privadas y dormitorios.",price: "Tarifa dinámica por fecha y tipo de habitación; consultar el sitio oficial.",phones: ["+505 8295-5534","+505 7631-8789"],website: "https://www.pocoapocohostel.com/",sources: [{label: "Sitio oficial",url: "https://www.pocoapocohostel.com/"}]}},
      {name: "Rancho Los Alpes",type: "Turismo rural · Senderos",icon: "fa-house-chimney",desc: "Rancho de descanso en la comarca San Carlos con balsas de bambú, kayak, tirolesa y taller de tortillas.",verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Turismo rural",facts: "Rancho de descanso en la comarca San Carlos con balsas de bambú, kayak, tirolesa y taller de tortillas.",activities: "Senderos, balsas de bambú, kayak y neumáticos, cabalgatas, tours ambientales, taller de tortillas, cultivo de peces y tirolesa.",services: "Hospedaje, camping, alimentación y local para eventos.",hours: "Lunes a domingo, 8:00 a. m.–7:00 p. m. (reservar con 48 horas).",address: "Km 99 carretera León–Poneloya, 1.5 km a la derecha por camino de macadán hacia el Centro de Salud de la comarca San Carlos.",phones: ["8803-7085","8860-9931"],map: "https://www.google.com/maps/d/u/0/edit?mid=11yDJH2RrUdILT1SCPfF0UDlJWg1CJlM&usp=sharing",contact: "Contacto publicado por INTUR en el catálogo 2026; confirmar antes de viajar.",sources: [{label: "INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)",url: ""}]}},
      {name: "Playa Las Peñitas",type: "Playa · Surf",icon: "fa-umbrella-beach",desc: "Playa y comunidad pesquera cercana a León, junto a la Reserva Natural Isla Juan Venado; popular entre surfistas.",lat: 12.3614,lng: -87.0215,category: "playa",precision: "exact",geoSource: {label: "Mapa Nacional de Turismo / GeoNames",url: "https://www.mapanicaragua.com/sol-y-playa/"},verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Playas",facts: "Playa y comunidad pesquera cercana a León, junto a la Reserva Natural Isla Juan Venado; popular entre surfistas.",activities: "Surf, gastronomía marina, paseos en lancha y acceso a Juan Venado.",zone: "León",sources: [{label: "Mapa Nacional de Turismo / GeoNames",url: "https://www.mapanicaragua.com/sol-y-playa/"}]}},
      {name: "Playa Poneloya",type: "Playa · Baño",icon: "fa-umbrella-beach",desc: "Tradicional balneario del litoral leonés y comunidad pesquera cercana a Las Peñitas.",lat: 12.3783,lng: -87.0422,category: "playa",precision: "exact",geoSource: {label: "Mapa Nacional de Turismo / GeoNames",url: "https://www.mapanicaragua.com/videos/"},verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Playas",facts: "Tradicional balneario del litoral leonés y comunidad pesquera cercana a Las Peñitas.",activities: "Baño, gastronomía, pesca y atardecer.",zone: "León",sources: [{label: "Mapa Nacional de Turismo / GeoNames",url: "https://www.mapanicaragua.com/videos/"}]}}
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
      { name: 'Reserva de Biosfera Isla de Ometepe', type: 'Dos volcanes, naturaleza, arqueología y turismo rural', icon: 'fa-mountain-sun', desc: 'Dos volcanes, Concepción y Maderas, unidos por un istmo en medio del Cocibolca; Reserva de Biosfera con petroglifos y comunidades rurales.', verification: {status: "verified",verifiedAt: "2026-10-05",facts: "Destino oficial de Nicaragua formado por los volcanes Concepción y Maderas. Visit Nicaragua destaca senderismo, la laguna del cráter del Maderas y la Cascada de San Ramón.",price: "Cada servicio tiene proveedor y precio distinto; no hay una tarifa única.",contact: "INTUR cuenta con delegación en la Isla de Ometepe; los servicios privados se verifican uno por uno.",sources: [{label: "INTUR",url: "https://www.intur.gob.ni/recinto/isla-de-ometepe/"},{label: "Visit Nicaragua",url: "https://www.visitanicaragua.com/islas/isla-de-ometepe/"}]}, lat: 11.491051, lng: -85.554472, category: "isla", precision: "approximate", geoSource: {label: "Visit Nicaragua / GeoNames",url: "https://www.visitanicaragua.com/islas/isla-de-ometepe/"} },
      { name: 'Volcán Concepción', type: 'Senderismo regulado, geología, fotografía y naturaleza', icon: 'fa-volcano', desc: 'El volcán más alto de Ometepe, activo; su ascenso es exigente y se hace solo con guía autorizado.' },
      { name: 'Volcán Maderas', type: 'Bosque, biodiversidad, senderismo y vida rural', icon: 'fa-mountain', desc: 'Volcán inactivo de Ometepe cubierto de bosque nuboso, con una laguna en el cráter y fincas en sus faldas.' },
      { name: 'Punta Jesús María', type: 'Atardecer, fotografía y vistas del Cocibolca', icon: 'fa-camera', desc: 'Lengua de arena en Ometepe que se adentra en el Lago Cocibolca; famosa por sus atardeceres.' },
      { name: 'Reserva Natural Charco Verde', type: 'Mariposario, senderos, aves, bosque y lago', icon: 'fa-feather', desc: 'Reserva en Ometepe con laguna, senderos, mariposario y monos aulladores, frente a playas del lago.' },
      { name: 'Ojo de Agua y Playa Santo Domingo', type: 'Naturaleza, descanso, ciclismo y corredor turístico', icon: 'fa-droplet', desc: 'Ojo de Agua es un balneario de agua cristalina entre árboles; Playa Santo Domingo es la franja de arena volcánica del istmo de Ometepe.' },
      { name: 'Cascada de San Ramón', type: 'Caminata, bosque y paisaje natural de Altagracia', icon: 'fa-water', desc: 'Cascada en la ladera del Volcán Maderas a la que se llega con una caminata por bosque.', verification: {status: "verified",verifiedAt: "2026-10-05",facts: "Atractivo reconocido por Visit Nicaragua, en la comunidad de San Ramón (Altagracia), en las faldas del volcán Maderas; se llega caminando.",price: "Consultar la tarifa vigente en el acceso.",sources: [{label: "Visit Nicaragua",url: "https://www.visitanicaragua.com/islas/isla-de-ometepe/"}]}, lat: 11.43424, lng: -85.51924, category: "cascada", precision: "exact", geoSource: {label: "Visit Nicaragua / OpenStreetMap",url: "https://www.visitanicaragua.com/islas/isla-de-ometepe/"} },
      { name: 'Museo El Ceibo y petroglifos de Ometepe', type: 'Arqueología, cerámica e historia precolombina', icon: 'fa-landmark', desc: 'Museo en Ometepe con colecciones precolombinas y numismáticas; la isla conserva numerosos petroglifos en sus fincas y senderos.' },
      { name: 'San Juan del Sur y Cristo de la Misericordia', type: 'Bahía, paisaje, gastronomía y atardeceres', icon: 'fa-anchor', desc: 'Bahía de pescadores rodeada de playas para surf y navegación, vigilada por el mirador del Cristo de la Misericordia.', verification: {status: "verified",verifiedAt: "2026-10-05",facts: "La bahía es uno de los principales atractivos del municipio. El Cristo de la Misericordia es una escultura de 15 m sobre un pedestal de 9 m y funciona como mirador panorámico.",price: "Consultar la tarifa vigente en el sitio.",sources: [{label: "Mapa Nacional de Turismo",url: "https://www.mapanicaragua.com/municipio-de-san-juan-del-sur/"},{label: "Mapa Nacional de Turismo",url: "https://www.mapanicaragua.com/arquitectura-de-san-juan-del-sur/page/4/"}]} },
      { name: 'Maderas, Marsella, Remanso, Hermosa y El Coco', type: 'Playas, surf, recreación y naturaleza', icon: 'fa-water', desc: 'Playas del Pacífico alrededor de San Juan del Sur, buscadas para surf, baño y descanso.', verification: {status: "verified",verifiedAt: "2026-10-05",facts: "Playa Maderas está reconocida oficialmente por INTUR y el Mapa Nacional de Turismo; destaca por sus olas y la práctica de surf.",price: "Acceso y servicios de surf: consultar con el proveedor.",contact: "Sin escuela ni teléfono asociado hasta tener ficha comercial verificada.",sources: [{label: "INTUR",url: "https://www.intur.gob.ni/2021/09/13/torneo-centroamericano-de-surf-se-despide-de-playa-maderas/"},{label: "Mapa Nacional de Turismo",url: "https://www.mapanicaragua.com/municipio-de-san-juan-del-sur/"}]} },
      { name: 'Refugio de Vida Silvestre La Flor', type: 'Conservación de tortugas y experiencias reguladas', icon: 'fa-shield-heart', desc: 'Playa protegida donde llegan a desovar tortugas marinas, con visitas reguladas por guardaparques.', verification: {status: "verified",verifiedAt: "2026-10-05",facts: "Área protegida de 7,349 hectáreas y uno de los principales sitios de anidación de tortugas marinas. MARENA reportó una arribada de 30,388 hembras paslama en septiembre de 2026.",price: "MARENA (15/04/2025): C$100 nacionales y C$200 visitantes de otras nacionalidades; niños pagan la mitad. Horario especial publicado en septiembre de 2026: 8:30 a. m.–5:00 p. m. Revalidar.",contact: "Información institucional: MARENA.",sources: [{label: "MARENA",url: "https://www.marena.gob.ni/2026/09/08/ii-arribada-de-tortugas-en-la-flor/"},{label: "MARENA",url: "https://www.marena.gob.ni/2025/04/15/refugio-de-vida-silvestre-la-flor-en-san-juan-del-sur-un-sitio-para-descubrir-en-semana-santa/"}]} },
      { name: 'Corredor de playas de Tola', type: 'Popoyo, Guasacate, Santana, Colorado, Gigante y comunidades', icon: 'fa-umbrella-beach', desc: 'Costa del municipio de Tola con playas como Popoyo, Guasacate, Santana, Colorado y Gigante, reconocidas por el surf.' },
      { name: 'Puerto de San Jorge', type: 'Puerta lacustre, ferris y transporte hacia Ometepe', icon: 'fa-ship', desc: 'Puerto lacustre de Rivas desde donde salen los ferris y lanchas hacia la Isla de Ometepe.' },
      { name: 'Ciudad de Rivas', type: 'Historia, mercados, arquitectura, gastronomía y servicios', icon: 'fa-building-columns', desc: 'Cabecera departamental con iglesias, mercado y servicios; punto de paso entre San Juan del Sur, San Jorge y la frontera sur.' },
      {name: "Morgan's Rock Reserve & Ecolodge",type: "Ecolodge y reserva privada en Playa Ocotal",icon: "fa-leaf",desc: "Ecolodge en Playa Ocotal, San Juan del Sur, con reserva privada protegida, bungalows, villas y actividades de naturaleza.",verification: {status: "verified",verifiedAt: "2026-10-05",facts: "Ecolodge real en una propiedad de 4,000 acres; cerca de la mitad es reserva privada protegida. Ofrece bungalows, villas y actividades de naturaleza.",price: "Consultar disponibilidad y tarifa en el sitio oficial.",phones: ["+505 8670-7676"],whatsapp: "+505 8988-7176",email: "reservations@morgansrock.com",website: "https://www.morgansrock.com/",sources: [{label: "Sitio oficial",url: "https://www.morgansrock.com/"},{label: "Sitio oficial",url: "https://www.morgansrock.com/es/servicios"}]}},
      {name: "Hostal Puesta del Sol (Ometepe)",type: "Turismo rural y comunitario · Senderismo",icon: "fa-people-group",desc: "Hostal familiar en La Paloma, Moyogalpa, con habitaciones sencillas, playa del lago y clases de cocina nicaragüense.",verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Turismo rural y comunitario",facts: "Hostal familiar en La Paloma, Moyogalpa, con habitaciones sencillas, playa del lago y clases de cocina nicaragüense.",activities: "Senderismo, kayak, bicicleta, tours a los volcanes, proceso del vino de jamaica y clases de cocina.",services: "Alimentación, hospedaje y playa.",hours: "Lunes a sábado, 8:00 a. m.–6:00 p. m.",address: "Puerto de Moyogalpa 1½ al sur, comunidad La Paloma, escuela 400 m al lago y 175 vrs al sur.",phones: ["8414-0647","5865-1532","5888-3095"],map: "https://www.google.com/maps/d/u/0/edit?mid=12UuBdxsAO5ic69l9X7e_p1__cV1c_6c&usp=sharing",contact: "Contacto publicado por INTUR en el catálogo 2026; confirmar antes de viajar.",sources: [{label: "INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)",url: ""}]}},
      {name: "Finca Magdalena (Ometepe)",type: "Turismo rural y comunitario · Senderismo",icon: "fa-people-group",desc: "Finca agroturística emblemática de Altagracia, ejemplo de desarrollo comunitario, con café y petroglifos.",verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Turismo rural y comunitario",facts: "Finca agroturística emblemática de Altagracia, ejemplo de desarrollo comunitario, con café y petroglifos.",activities: "Senderismo, tours a petroglifos y tours del café.",services: "Alimentación, hospedaje y piscina natural.",hours: "Lunes a sábado, 6:00 a. m.–9:00 p. m.",address: "Café Campestre 20 m al este, 1 km al sur, Altagracia.",phones: ["8608-7984"],map: "https://www.google.com/maps/d/u/0/edit?mid=1HaFUqB9NbLmGlUOTiRw8Ih8Z8COdp2o&usp=sharing",contact: "Contacto publicado por INTUR en el catálogo 2026; confirmar antes de viajar.",sources: [{label: "INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)",url: ""}]}},
      {name: "Playa San Juan del Sur",type: "Playa · Natación",icon: "fa-umbrella-beach",desc: "Bahía en forma de herradura, de oleaje generalmente suave y amplia infraestructura turística; uno de los destinos costeros más visitados del país.",lat: 11.2548,lng: -85.8729,category: "playa",precision: "exact",geoSource: {label: "Visit Nicaragua / Mapcarta-OSM",url: "https://visitanicaragua.com/en/beaches/San-Juan-del-Sur-beach/"},verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Playas",facts: "Bahía en forma de herradura, de oleaje generalmente suave y amplia infraestructura turística; uno de los destinos costeros más visitados del país.",activities: "Natación, kayak, paseos en lancha, gastronomía y atardecer.",zone: "San Juan del Sur",sources: [{label: "Visit Nicaragua / Mapcarta-OSM",url: "https://visitanicaragua.com/en/beaches/San-Juan-del-Sur-beach/"}]}},
      {name: "Playa Maderas",type: "Playa · Surf",icon: "fa-umbrella-beach",desc: "Playa reconocida por el surf, con oleaje consistente, acantilados y vegetación tropical, a unos minutos al norte de San Juan del Sur.",lat: 11.295,lng: -85.91,category: "playa",precision: "exact",geoSource: {label: "Visit Nicaragua / OpenStreetMap",url: "https://www.visitanicaragua.com/playas/playa-maderas/"},verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Playas",facts: "Playa reconocida por el surf, con oleaje consistente, acantilados y vegetación tropical, a unos minutos al norte de San Juan del Sur.",activities: "Surf, caminata, atardecer y fotografía.",zone: "San Juan del Sur",sources: [{label: "Visit Nicaragua / OpenStreetMap",url: "https://www.visitanicaragua.com/playas/playa-maderas/"}]}},
      {name: "Playa Remanso",type: "Playa · Surf",icon: "fa-umbrella-beach",desc: "Pequeña bahía al sur de San Juan del Sur, conocida por el surf y su ambiente tranquilo; el Mapa Nacional de Turismo la incluye entre las playas del municipio.",lat: 11.22249,lng: -85.84622,category: "playa",precision: "exact",geoSource: {label: "Mapa Nacional de Turismo / OpenStreetMap",url: "https://www.mapanicaragua.com/municipio-de-san-juan-del-sur/"},verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Playas",facts: "Pequeña bahía al sur de San Juan del Sur, conocida por el surf y su ambiente tranquilo; el Mapa Nacional de Turismo la incluye entre las playas del municipio.",activities: "Surf, baño, descanso y gastronomía local.",zone: "San Juan del Sur",sources: [{label: "Mapa Nacional de Turismo / OpenStreetMap",url: "https://www.mapanicaragua.com/municipio-de-san-juan-del-sur/"}]}},
      {name: "Playa El Coco",type: "Playa · Baño",icon: "fa-umbrella-beach",desc: "Amplia playa de arena fina y oleaje relativamente tranquilo, ubicada al sur de San Juan del Sur.",lat: 11.1559,lng: -85.7998,category: "playa",precision: "exact",geoSource: {label: "Mapa Nacional de Turismo",url: "https://www.mapanicaragua.com/sol-y-playa/"},verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Playas",facts: "Amplia playa de arena fina y oleaje relativamente tranquilo, ubicada al sur de San Juan del Sur.",activities: "Baño, caminata, paseo a caballo y observación de aves.",zone: "San Juan del Sur",sources: [{label: "Mapa Nacional de Turismo",url: "https://www.mapanicaragua.com/sol-y-playa/"}]}},
      {name: "Popoyo y Guasacate",type: "Playa · Surf avanzado",icon: "fa-umbrella-beach",desc: "Zona costera de Tola reconocida internacionalmente por el surf; Popoyo destaca por la consistencia y la potencia de sus olas.",lat: 11.473,lng: -86.1279,category: "playa",precision: "exact",geoSource: {label: "Mapa Nacional de Turismo / OpenStreetMap",url: "https://www.mapanicaragua.com/sol-y-playa/"},verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Playas",facts: "Zona costera de Tola reconocida internacionalmente por el surf; Popoyo destaca por la consistencia y la potencia de sus olas.",activities: "Surf avanzado, fotografía, descanso y gastronomía.",zone: "Tola",sources: [{label: "Mapa Nacional de Turismo / OpenStreetMap",url: "https://www.mapanicaragua.com/sol-y-playa/"}]}},
      {name: "Playa Gigante",type: "Playa · Baño",icon: "fa-umbrella-beach",desc: "Bahía y comunidad costera de Tola incluida en la oferta turística oficial de la Costa Esmeralda.",lat: 11.3911,lng: -86.0326,category: "playa",precision: "exact",geoSource: {label: "Mapa Nacional de Turismo / Wikidata-OSM",url: "https://www.mapanicaragua.com/videos/"},verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Playas",facts: "Bahía y comunidad costera de Tola incluida en la oferta turística oficial de la Costa Esmeralda.",activities: "Baño, pesca, paseos en lancha, gastronomía y atardecer.",zone: "Tola",sources: [{label: "Mapa Nacional de Turismo / Wikidata-OSM",url: "https://www.mapanicaragua.com/videos/"}]}}
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
      { name: 'Cascada La Luna & El Cuá', type: 'Nebliselva & Canopy', icon: 'fa-cloud-rain', desc: 'Cascada rodeada de bosque húmedo en la zona de El Cuá, en el norte montañoso de Jinotega.' },
      { name: 'Lago de Apanás', type: 'Humedal Ramsar', icon: 'fa-water', desc: 'Lago artificial entre montañas al norte de Jinotega, con comunidades de pescadores y paisajes de neblina.' },
      { name: 'Peña de La Cruz', type: 'Mirador Panorámico', icon: 'fa-mountain', desc: 'Cerro con una cruz que domina la ciudad de Jinotega; la subida ofrece vista a todo el valle.' },
      { name: 'Reserva Natural Macizo de Peñas Blancas', type: 'Bosque Nuboso Prístino', icon: 'fa-tree', desc: 'Macizo rocoso con bosque nuboso, nacientes de agua y cascadas, parte de la zona de amortiguamiento de Bosawás.' },
      { name: 'Fincas Agroecológicas de San Rafael del Norte', type: 'Ruta del Café', icon: 'fa-mug-hot', desc: 'Fincas familiares de café y cultivos diversos en San Rafael del Norte que reciben visitantes con turismo rural.' },
      { name: 'Reserva Natural Cerro Datanlí–El Diablo', type: 'Bosque nuboso, aviturismo, café y comunidades', icon: 'fa-tree', desc: 'Reserva de bosque nuboso entre Jinotega y Matagalpa, con fincas de café, senderos y fuentes de agua.' },
      { name: 'Salto La Mocuana', type: 'Cascada y naturaleza en La Fundadora', icon: 'fa-water', desc: 'Cascada cercana a la comunidad de La Fundadora, en Jinotega, conocida por la leyenda de La Mocuana.' },
      { name: 'Cascadas Arco Iris, La Pavona y La Sonora', type: 'Agua y senderismo en Peñas Blancas', icon: 'fa-cloud-rain', desc: 'Conjunto de caídas de agua en Peñas Blancas, unidas por senderos de montaña.' },
      { name: 'Cerro Kilambé y aguas termales de El Caño', type: 'Montaña, termalismo y vida rural en El Cuá', icon: 'fa-mountain-sun', desc: 'Montaña de las más altas del norte del país y fuentes termales en la zona rural de El Cuá.' },
      { name: 'Salto de Kayaska', type: 'Naturaleza y acceso hacia Bosawás desde Bocay', icon: 'fa-water', desc: 'Cascada en la zona de Bocay, puerta de acceso a la Reserva de Biosfera Bosawás.' },
      {name: "Cascada La Bujona",type: "Cascada · Senderismo",icon: "fa-droplet",desc: "Caída de agua registrada en OpenStreetMap en el departamento de Jinotega, próxima al sector de Paso El Limón.",lat: 13.08037,lng: -85.87418,category: "cascada",precision: "exact",geoSource: {label: "OpenStreetMap",url: "https://mapcarta.com/es/N6907277586"},verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Cascadas",facts: "Caída de agua registrada en OpenStreetMap en el departamento de Jinotega, próxima al sector de Paso El Limón.",activities: "Senderismo, fotografía y naturaleza.",zone: "Jinotega",sources: [{label: "OpenStreetMap",url: "https://mapcarta.com/es/N6907277586"}]}}
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
    heroImage: 'assets/images/departamentos/jinotega.jpg',
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
      { name: 'Parque Nacional Volcán Masaya', type: 'Vulcanología, miradores, senderos autorizados y educación ambiental', icon: 'fa-fire', desc: 'Volcán activo con miradores al cráter Santiago, del que salen gases y donde anidan chocoyos; las visitas nocturnas muestran su resplandor.', verification: {status: "verified",verifiedAt: "2026-10-05",facts: "Área administrada por MARENA (aprox. km 23 carretera Managua–Masaya). La Plaza Oviedo reabrió en diciembre de 2025 y permite apreciar la incandescencia del volcán Santiago bajo medidas de seguridad.",price: "Horario general reportado por MARENA (17/07/2026): lunes a domingo, 8:30 a. m. a 7:00 p. m.; puede cambiar por actividad volcánica. Tarifa: consultar publicación oficial vigente.",contact: "Información institucional: MARENA.",sources: [{label: "MARENA",url: "https://www.marena.gob.ni/2026/07/17/mas-visitas-en-volcan-masaya/"},{label: "MARENA",url: "https://www.marena.gob.ni/2025/12/20/marena-anuncia-reapertura-de-la-plaza-oviedo-del-parque-nacional-volcan-masaya/"}]} },
      { name: 'Laguna de Masaya', type: 'Naturaleza, paisaje volcánico y fotografía', icon: 'fa-water', desc: 'Laguna de origen volcánico al pie de la ciudad de Masaya, con miradores desde el malecón.' },
      { name: 'Monimbó', type: 'Identidad indígena, talleres, gastronomía y memoria comunitaria', icon: 'fa-hands-holding', desc: 'Barrio indígena de Masaya, corazón de la artesanía y del folclore, con talleres de cuero, madera y máscaras.' },
      { name: 'Mercado de Artesanías de Masaya', type: 'Artesanía, cultura, gastronomía y economía local', icon: 'fa-store', desc: 'Edificio histórico con hamacas, cerámica, madera, cuero y textiles de todo el país.' },
      { name: 'Mirador de Catarina', type: 'Paisaje, viveros, música y gastronomía', icon: 'fa-eye', desc: 'Balcón natural sobre la Laguna de Apoyo, con viveros, comida y artesanía.' },
      { name: 'San Juan de Oriente', type: 'Cerámica artesanal y experiencias directas con productores', icon: 'fa-hands', desc: 'Pueblo alfarero de los Pueblos Blancos donde la cerámica se tornea y pinta a mano con motivos precolombinos.' },
      { name: 'Niquinohomo y Casa Museo de Sandino', type: 'Memoria histórica y patrimonio cultural', icon: 'fa-landmark', desc: 'Pueblo natal de Augusto C. Sandino; la casa donde nació funciona como museo y biblioteca.' },
      { name: 'Reserva Natural Laguna de Apoyo', type: 'Kayak, senderismo, aves, fotografía y descanso', icon: 'fa-person-swimming', desc: 'Laguna de cráter de agua templada entre Granada y Masaya, ideal para nadar, remar en kayak y observar aves.' },
      { name: 'Reserva Natural Laguna de Tisma', type: 'Humedal Ramsar, biodiversidad y observación responsable', icon: 'fa-binoculars', desc: 'Humedal de importancia internacional (sitio Ramsar) con gran diversidad de aves acuáticas.' },
      { name: 'Petroglifos de El Cailagua', type: 'Arqueología, símbolos ancestrales e interpretación comunitaria', icon: 'fa-monument', desc: 'Grabados precolombinos en las paredes de una cañada cerca de Masaya, interpretados por guías comunitarios.' },
      { name: 'Taller Escuela Valentín López y Palo Solo', type: 'Artesanía, cultura y experiencias comunitarias', icon: 'fa-hands', desc: 'Espacios de artesanía y tradición en Masaya donde se aprende de los oficios locales y se compra directo.' },
      {name: "Posada Ecológica La Abuela – Laguna de Apoyo",type: "Hotel-restaurante y pase de día en la laguna",icon: "fa-water",desc: "Hotel-restaurante a orillas de la Laguna de Apoyo con cabañas y pase de día para disfrutar del agua y el bosque.",verification: {status: "verified",verifiedAt: "2026-10-05",facts: "Hotel-restaurante real en el entorno de la Laguna de Apoyo; acceso principal en el km 37.9, 2 km al norte desde el triángulo.",price: "Sitio oficial (2026): pase de día adulto US$17.25 (US$12.25 consumibles); cabaña para 2 personas US$81.90 con impuestos. Revalidar antes de comprar.",phones: ["2520-1634","2520-5563"],whatsapp: "8822-8513",email: "info@posadaecologicalaabuela.com.ni",website: "https://www.posadaecologicalaabuela.com.ni/",sources: [{label: "Sitio oficial",url: "https://www.posadaecologicalaabuela.com.ni/Page/Contacto"},{label: "Sitio oficial",url: "https://www.posadaecologicalaabuela.com.ni/Page/Servicios"}]}}
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
      { name: 'Centro Histórico y Calle La Calzada', type: 'Arquitectura, plazas, iglesias, museos y gastronomía', icon: 'fa-building-columns', desc: 'Recorrido a pie por el centro colonial de Granada y su calle peatonal La Calzada, que baja hasta el lago.', verification: {status: "verified",verifiedAt: "2026-10-05",facts: "Eje emblemático del centro histórico con edificios coloniales que comunica el centro con el Lago Cocibolca. El Mapa Nacional de Turismo la identifica como uno de los principales puntos de vida nocturna de Granada.",price: "Cada restaurante, bar y comercio maneja su propia ficha y precios.",contact: "No existe un teléfono único de la calle ni una asociación que represente toda la oferta.",sources: [{label: "Mapa Nacional de Turismo",url: "https://www.mapanicaragua.com/local/calle-la-calzada/"},{label: "Mapa Nacional de Turismo",url: "https://www.mapanicaragua.com/granada/"}]} },
      { name: 'Catedral de Granada y Parque Colón', type: 'Patrimonio, vida urbana, religión y fotografía', icon: 'fa-church', desc: 'La catedral amarilla de Granada frente al Parque Colón, el punto de partida para recorrer la ciudad colonial.' },
      { name: 'Iglesia y Torre de La Merced', type: 'Arquitectura, historia y vistas urbanas', icon: 'fa-church', desc: 'Iglesia colonial de Granada cuyo campanario ofrece una de las mejores vistas de los techos de la ciudad y del lago.' },
      { name: 'Convento e Iglesia San Francisco', type: 'Historia, arquitectura y espacios museísticos', icon: 'fa-landmark', desc: 'Convento-museo que guarda estatuas precolombinas de la isla Zapatera, hoy parque nacional.', verification: {status: "verified",verifiedAt: "2026-10-05",facts: "Conjunto histórico fundado en 1529 como Inmaculada Concepción. Hoy funciona como Centro Cultural Museo Convento San Francisco, con arte precolombino, pintura primitivista, arte religioso y mobiliario tradicional.",price: "Consultar la tarifa vigente en el museo.",sources: [{label: "Mapa Nacional de Turismo",url: "https://www.mapanicaragua.com/municipio-de-granada/"},{label: "Mapa Nacional de Turismo",url: "https://www.mapanicaragua.com/arquitectura-de-granada/page/2/"}]} },
      { name: 'Casa de los Leones', type: 'Patrimonio cultural y ciudades históricas', icon: 'fa-house', desc: 'Casona colonial frente al Parque Colón de Granada, hoy centro cultural con exposiciones y actividades.' },
      { name: 'Antigua Estación del Ferrocarril', type: 'Memoria ferroviaria y patrimonio', icon: 'fa-train', desc: 'Edificio histórico de la estación de trenes de Granada, testimonio de la época del ferrocarril en el Pacífico.' },
      { name: 'Isletas de Granada', type: 'Lancha, kayak, fauna, paisaje y fotografía', icon: 'fa-ship', desc: 'Cientos de pequeñas islas formadas por una antigua erupción del Mombacho, con aves y comunidades; se recorren en lancha.', lat: 11.89911, lng: -85.88519, category: "isla", precision: "approximate", geoSource: {label: "Visit Nicaragua / GeoNames",url: "https://www.visitanicaragua.com/atractivos/islas/"}, verification: {status: "verified",verifiedAt: "2026-10-05",facts: "Archipiélago lacustre de numerosos islotes al sureste de Granada, en el Lago Cocibolca.",activities: "Paseo en lancha, kayak, observación de aves y fotografía.",zone: "Granada",sources: [{label: "Visit Nicaragua / GeoNames",url: "https://www.visitanicaragua.com/atractivos/islas/"}]} },
      { name: 'Lago Cocibolca', type: 'Agua, navegación, biodiversidad e historia', icon: 'fa-water', desc: 'El lago más grande de Centroamérica, frente a Granada, con islas, playas lacustres y paseos en lancha.' },
      { name: 'Reserva Natural Volcán Mombacho', type: 'Senderos, miradores, bosque nuboso y aviturismo', icon: 'fa-tree', desc: 'Senderos entre fumarolas, orquídeas y bosque nuboso con vistas a Granada y al lago.' },
      { name: 'Aguas Agrias–La Nanda', type: 'Turismo rural comunitario, senderos y cocina local', icon: 'fa-people-group', desc: 'Experiencia de turismo rural comunitario en Nandaime, con senderos, ríos y cocina local.' },
      { name: 'Reserva Natural Laguna de Apoyo', type: 'Kayak, baño, senderismo, fotografía y aves', icon: 'fa-person-swimming', desc: 'Laguna de cráter de agua templada entre Granada y Masaya, ideal para nadar, remar en kayak y observar aves.' },
      {name: "Hotel Darío",type: "Hotel boutique colonial en La Calzada",icon: "fa-hotel",desc: "Hotel boutique de arquitectura colonial sobre la Calle La Calzada, en pleno centro histórico de Granada.",verification: {status: "verified",verifiedAt: "2026-10-05",facts: "Hotel boutique colonial real en el centro de Granada (Calle La Calzada). Google Hotels y publicaciones del establecimiento coinciden en el teléfono principal.",price: "Tarifa dinámica: consultar para las fechas exactas del viaje.",phones: ["+505 2552-3400"],website: "http://www.hoteldario.com/",sources: [{label: "Google Hotels",url: "https://www.google.com.ni/travel/hotels/entity/ChgIlMGj0J3IydGoARoLL2cvMXRmNGcyazAQAQ"},{label: "Sitio oficial",url: "http://www.hoteldario.com/"}]}},
      {name: "Treehouse Nicaragua",type: "Hostal y espacio de eventos junto al Mombacho",icon: "fa-tree",desc: "Hostal entre los árboles en la comarca Poste Rojo, a las afueras de Granada en el entorno del volcán Mombacho.",verification: {status: "verified",verifiedAt: "2026-10-05",facts: "Negocio real a unos 20 minutos de Granada (km 57.5 carretera Granada–Nandaime, comarca Poste Rojo). Funciona como hostel y espacio de eventos; su web indica que solo acepta efectivo.",price: "Consultar tarifa o entrada según alojamiento o evento.",whatsapp: "+505 8550-3093",email: "hello@treehousenicaragua.com",website: "https://www.treehousenicaragua.com/",sources: [{label: "Sitio oficial",url: "https://www.treehousenicaragua.com/faqs"},{label: "Sitio oficial",url: "https://www.treehousenicaragua.com/about"}]}},
      {name: "Finca El Rayo",type: "Turismo rural · Caminatas por senderos naturales",icon: "fa-house-chimney",desc: "Finca rural entre paisajes volcánicos, flora y fauna, con sendero de petroglifos que conecta con el pasado precolombino.",verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Turismo rural",facts: "Finca rural entre paisajes volcánicos, flora y fauna, con sendero de petroglifos que conecta con el pasado precolombino.",activities: "Caminatas por senderos naturales, observación de aves y exploración de flora y fauna.",services: "Alimentos y bebidas, camping, kayak, natación y sendero de petroglifos.",hours: "Viernes a domingo, 9:00 a. m.–5:00 p. m.",address: "De la entrada El Astillero, El Diamante 4 km al este y 3.5 km al sur.",phones: ["8837-0098"],map: "https://www.google.com/maps/d/u/0/edit?mid=1W6bI4kom2Cq-MvarHCYx08YyCXR2s7Q&usp=sharing",contact: "Contacto publicado por INTUR en el catálogo 2026; confirmar antes de viajar.",sources: [{label: "INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)",url: ""}]}},
      {name: "Eco Finca El Buen Pastor",type: "Agroturismo · Caminatas",icon: "fa-seedling",desc: "Casa de campo en Nandaime con cabañas, piscina y área de meditación, enfocada en la sostenibilidad.",verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Agroturismo",facts: "Casa de campo en Nandaime con cabañas, piscina y área de meditación, enfocada en la sostenibilidad.",activities: "Caminatas, giras ecológicas, observación de aves y exploración de flora y fauna.",services: "Cabañas, alimentos y bebidas, juegos para niños, piscina, meditación y camping.",hours: "Viernes a domingo, 8:00 a. m.–5:00 p. m. (con reservación).",address: "Km 60.5 carretera Panamericana Sur, Nandaime.",phones: ["8854-2029"],map: "https://www.google.com/maps/d/u/0/edit?mid=1YLbA-KdYFfgFE1x20ZCZsy9tL0hI9r4&usp=sharing",contact: "Contacto publicado por INTUR en el catálogo 2026; confirmar antes de viajar.",sources: [{label: "INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)",url: ""}]}},
      {name: "Finca María Auxiliadora",type: "Turismo de naturaleza · Senderos",icon: "fa-tree",desc: "Refugio rural entre Granada y Diriomo con frutales, maderas, tres senderos y siembra participativa.",verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Turismo de naturaleza",facts: "Refugio rural entre Granada y Diriomo con frutales, maderas, tres senderos y siembra participativa.",activities: "Senderos, aves, siembra y cosecha de frutales y forestales, flora y fauna.",services: "Alimentos, bebidas, piscinas, camping, tres rutas de senderismo y aves.",hours: "Lunes a domingo, 6:00 a. m.–5:00 p. m. (con reservación).",address: "Carretera Granada–Diriomo km 53.5 (IMMSA), 800 m al oeste.",phones: ["8538-3814"],map: "https://www.google.com/maps/d/u/0/edit?mid=1_aF-9soYpiBy3mofkbdmA_qPaFtO22s&usp=sharing",contact: "Contacto publicado por INTUR en el catálogo 2026; confirmar antes de viajar.",sources: [{label: "INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)",url: ""}]}},
      {name: "Río Tipitapa",type: "Río · Paisaje",icon: "fa-water",desc: "Curso de agua natural que conecta el Lago Xolotlán con el Lago Cocibolca en condiciones hidrológicas favorables.",lat: 12.08333,lng: -85.88333,category: "rio",precision: "approximate",geoSource: {label: "GeoNames / Wikidata",url: "https://mapcarta.com/es/19577744"},verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Ríos",facts: "Curso de agua natural que conecta el Lago Xolotlán con el Lago Cocibolca en condiciones hidrológicas favorables.",activities: "Paisaje, educación ambiental y observación de humedales.",zone: "Tipitapa",sources: [{label: "GeoNames / Wikidata",url: "https://mapcarta.com/es/19577744"}]}},
      {name: "Isla Zapatera",type: "Isla · Arqueología",icon: "fa-mountain-sun",desc: "Isla volcánica del Lago Cocibolca, núcleo del Parque Nacional Archipiélago Zapatera y relevante por su patrimonio arqueológico.",lat: 11.739,lng: -85.835,category: "isla",precision: "approximate",geoSource: {label: "MARENA / GeoNames",url: "https://www.marena.gob.ni/wp-content/uploads/2023/08/11-Plan-de-Manejo-Parque-Nacional-Archipielago-Zapatera.pdf"},verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Islas",facts: "Isla volcánica del Lago Cocibolca, núcleo del Parque Nacional Archipiélago Zapatera y relevante por su patrimonio arqueológico.",activities: "Arqueología, senderismo, navegación y naturaleza.",zone: "Granada",sources: [{label: "MARENA / GeoNames",url: "https://www.marena.gob.ni/wp-content/uploads/2023/08/11-Plan-de-Manejo-Parque-Nacional-Archipielago-Zapatera.pdf"}]}}
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
    heroImage: 'assets/images/aliados/hotel_dario.jpg',
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
      { name: 'Reserva Silvestre Selva Negra', type: 'Bosque Nuboso & Aves', icon: 'fa-feather', desc: 'Bosque nuboso, senderos y finca cafetalera en las montañas de Matagalpa.', verification: {status: "verified",verifiedAt: "2026-10-05",facts: "Selva Negra Ecolodge, en el km 140 de la carretera Matagalpa–Jinotega: ecolodge y hacienda cafetalera real. Su sitio oficial indica operación desde 1975 y al menos 600 hectáreas entre área protegida y productiva.",price: "Consultar la tarifa vigente directamente con el establecimiento.",phones: ["+505 8100-9100","+505 2770-1963"],whatsapp: "+505 8509-4871",email: "info@selvanegra.com",sources: [{label: "Sitio oficial",url: "https://selvanegramatagalpa.wixsite.com/snpatrio2024/acerca-de"}]} },
      { name: 'Comunidad Indígena de El Chile', type: 'Tejidos Tradicionales', icon: 'fa-hands-holding', desc: 'Comunidad indígena de Matagalpa reconocida por sus tejidos en telar; se visitan los talleres y se compra a las tejedoras.' },
      { name: 'Cascada Santa Emilia', type: 'Caída de Agua Mística', icon: 'fa-water', desc: 'Cascada entre bosque y cafetales en las montañas de Matagalpa, accesible con una caminata corta.' },
      { name: 'Cerro Apante (Reserva Natural)', type: 'Senderismo de Altura', icon: 'fa-mountain', desc: 'Reserva que rodea la ciudad de Matagalpa, con senderos de bosque y miradores sobre el valle.' },
      { name: 'Museo Nacional del Café', type: 'Cultura Cafetalera', icon: 'fa-mug-hot', desc: 'Historia del café en Nicaragua contada desde Matagalpa, la ciudad que lo hizo identidad.' },
      { name: 'Museo Casa Natal Rubén Darío', type: 'Poesía, historia y patrimonio en Ciudad Darío', icon: 'fa-book-open', desc: 'Museo en la casa de Ciudad Darío (Matagalpa) donde nació Rubén Darío, el Príncipe de las Letras Castellanas.' },
      { name: 'Villa Chagüitillo', type: 'Arte rupestre, arqueología e interpretación histórica', icon: 'fa-monument', desc: 'Comunidad de Sébaco con petroglifos precolombinos a orillas de quebradas, interpretados por guías locales.' },
      { name: 'Cascada Blanca y Cascada La Luna', type: 'Naturaleza, aventura y paisajes de agua', icon: 'fa-water', desc: 'Caídas de agua en Matagalpa con pozas y senderos, buenas para un día de naturaleza.' },
      { name: 'Macizo de Peñas Blancas', type: 'Café, senderismo, cascadas y conservación', icon: 'fa-mountain-sun', desc: 'Macizo de bosque nuboso compartido con Jinotega, con café, cascadas y conservación del agua.' },
      { name: 'San Ramón', type: 'Turismo rural comunitario, café, cacao y fincas', icon: 'fa-people-group', desc: 'Municipio cafetalero cercano a Matagalpa con turismo rural comunitario en fincas de café y cacao.' },
      { name: 'Catedral San Pedro', type: 'Arquitectura, religión y patrimonio urbano', icon: 'fa-church', desc: 'Catedral de la ciudad de Matagalpa, de arquitectura colonial tardía y centro de la vida urbana.' },
      {name: "Albergue Tierra Alta Ecolodge",type: "Turismo rural · Senderos con frutos exóticos",icon: "fa-house-chimney",desc: "Ecolodge en San Ramón con alimentos orgánicos de la finca, plantas medicinales y tours nocturnos de fauna.",verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Turismo rural",facts: "Ecolodge en San Ramón con alimentos orgánicos de la finca, plantas medicinales y tours nocturnos de fauna.",activities: "Senderos con frutos exóticos y cultivos orgánicos, tours nocturnos (murciélagos, búhos, perezosos) y cabalgatas.",services: "Alojamiento y alimentación.",hours: "Lunes a domingo, 8:00 a. m.–5:00 p. m.",address: "Entrada a comunidad El Trentino, 1 km al norte de la Escuela San Ramón García, 400 m al norte, San Ramón.",phones: ["8722-8635","5747-8572"],map: "https://www.google.com/maps/d/u/0/edit?mid=1xeQGLfuhxkFpkJWczFHe1DIUgFomB3o&usp=sharing",contact: "Contacto publicado por INTUR en el catálogo 2026; confirmar antes de viajar.",sources: [{label: "INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)",url: ""}]}},
      {name: "Río Tuma",type: "Río · Baño en zonas habilitadas",icon: "fa-water",desc: "Curso de agua importante de la región norte-central; el punto marca un sitio accesible cercano a El Tuma-La Dalia.",lat: 13.1025,lng: -85.74323,category: "rio",precision: "exact",geoSource: {label: "OpenStreetMap",url: "https://mapcarta.com/es/N5135651522"},verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Ríos",facts: "Curso de agua importante de la región norte-central; el punto marca un sitio accesible cercano a El Tuma-La Dalia.",activities: "Baño en zonas habilitadas, fotografía y paisaje rural.",zone: "El Tuma-La Dalia",sources: [{label: "OpenStreetMap",url: "https://mapcarta.com/es/N5135651522"}]}},
      {name: "Cascada La Luna (El Tuma-La Dalia)",type: "Cascada · Senderismo",icon: "fa-droplet",desc: "Cascada cercana a El Tuma-La Dalia, rodeada de vegetación y con actividades de aventura en su entorno.",lat: 13.11685,lng: -85.75101,category: "cascada",precision: "exact",geoSource: {label: "OpenStreetMap / Mapa Nacional de Turismo",url: "https://mapcarta.com/es/N5607799821"},verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Cascadas",facts: "Cascada cercana a El Tuma-La Dalia, rodeada de vegetación y con actividades de aventura en su entorno.",activities: "Senderismo, fotografía y turismo de naturaleza.",zone: "El Tuma-La Dalia",sources: [{label: "OpenStreetMap / Mapa Nacional de Turismo",url: "https://mapcarta.com/es/N5607799821"}]}},
      {name: "Cascada Blanca (Río Yasica)",type: "Cascada · Baño en zonas autorizadas",icon: "fa-droplet",desc: "Cascada del Río Yasica conocida como Cascada Blanca, en el corredor hacia El Tuma-La Dalia.",lat: 12.99124,lng: -85.82931,category: "cascada",precision: "exact",geoSource: {label: "OpenStreetMap / UCC",url: "https://mapcarta.com/es/N4904807522"},verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Cascadas",facts: "Cascada del Río Yasica conocida como Cascada Blanca, en el corredor hacia El Tuma-La Dalia.",activities: "Baño en zonas autorizadas, senderismo y fotografía.",zone: "San Ramón / Santa Emilia",sources: [{label: "OpenStreetMap / UCC",url: "https://mapcarta.com/es/N4904807522"}]}}
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
      { name: 'Reserva Natural Tisey-La Estanzuela', type: 'Cascada & Esculturas', icon: 'fa-water', desc: 'Cascada, pinares, miradores y las esculturas talladas en piedra en la montaña de Estelí.' },
      { name: 'Galería de Esculturas en Piedra de Don Alberto', type: 'Arte Popular Rústico', icon: 'fa-palette', desc: 'Figuras talladas en la roca de la montaña por el artista Alberto Gutiérrez, dentro de la reserva Tisey.' },
      { name: 'Reserva Natural Miraflor', type: 'Orquídeas & Turismo Rural', icon: 'fa-seedling', desc: 'Bosque nuboso, orquídeas, aves y familias campesinas que reciben visitantes en sus fincas.' },
      { name: 'Fábricas de Puros Artesanales', type: 'Ruta del Tabaco de Alta Gama', icon: 'fa-fire', desc: 'Recorridos por fábricas de Estelí donde el tabaco se enrolla a mano.' },
      { name: 'Murales Revolucionarios y Urbanos', type: 'Arte Público', icon: 'fa-brush', desc: 'Murales en las calles de Estelí que cuentan su historia social y política; se recorren a pie por el centro.' },
      { name: 'La Garnacha', type: 'Comunidad, queso de cabra, producción sostenible y aves', icon: 'fa-people-group', desc: 'Comunidad en la Reserva Tisey-La Estanzuela que produce queso de cabra y recibe visitantes con turismo rural.' },
      { name: 'Condega y su Taller Comunal de Cerámica', type: 'Arqueología, barro y artesanía', icon: 'fa-hands', desc: 'Condega es tierra de alfarería; en Ducualí Grande las mujeres trabajan el barro con técnicas tradicionales.' },
      { name: 'Pueblo Nuevo', type: 'Paleontología, arqueología y memoria', icon: 'fa-landmark', desc: 'Municipio del norte de Estelí conocido por el Museo Paleontológico El Bosque, con fósiles de megafauna encontrados en la zona.' },
      { name: 'San Juan de Limay', type: 'Gorditas de Limay, marmolina y talleres de escultura', icon: 'fa-hammer', desc: 'Pueblo de Estelí famoso por sus artesanos que tallan piedra marmolina en figuras y animales.' },
      { name: 'Mirador San Luis', type: 'Paisaje, fotografía y artesanía', icon: 'fa-eye', desc: 'Mirador en las montañas de Estelí con paisaje amplio, fotografía y artesanía local.' },
      {name: "Finca Lindos Ojos",type: "Turismo rural · Caminatas",icon: "fa-house-chimney",desc: "Finca de turismo rural dentro de la Reserva Natural Miraflor Moropotente, con bosques, aves y café orgánico.",verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Turismo rural",facts: "Finca de turismo rural dentro de la Reserva Natural Miraflor Moropotente, con bosques, aves y café orgánico.",activities: "Caminatas, observación de aves, senderismo, ordeño, cabalgatas y demostración de agricultura orgánica de café.",services: "Bebidas, hospedería y cocina para huéspedes.",hours: "9:00 a. m.–6:00 p. m.",address: "Comunidad El Cebollal, de la rampa 2 km al oeste, Reserva Miraflor Moropotente.",phones: ["8992-7315"],map: "https://www.google.com/maps/d/u/0/edit?mid=1D33pHCZSFRX8nlP8fizGDle4AO1L23Y&usp=sharing",contact: "Contacto publicado por INTUR en el catálogo 2026; confirmar antes de viajar.",sources: [{label: "INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)",url: ""}]}},
      {name: "Ecoposada Tisey",type: "Turismo rural · Senderismo",icon: "fa-house-chimney",desc: "Posada ecológica en la Reserva Tisey-Estanzuela con miradores, senderos, cascadas y clima fresco de montaña.",verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Turismo rural",facts: "Posada ecológica en la Reserva Tisey-Estanzuela con miradores, senderos, cascadas y clima fresco de montaña.",activities: "Senderismo, observación de flora y fauna, miradores y recorrido por vivero.",services: "Alimentos, bebidas y hospedería.",hours: "Lunes a viernes 8:00 a. m.–6:00 p. m.; sábado y domingo 8:00 a. m.–9:00 p. m.",address: "Comunidad Almaciguera, 12 km al sureste de Estelí.",phones: ["8658-4086"],map: "https://www.google.com/maps/d/u/0/edit?mid=1vN25WegeowQTfD4M9Q-O4t8FQ-5Ko6U&usp=sharing",contact: "Contacto publicado por INTUR en el catálogo 2026; confirmar antes de viajar.",sources: [{label: "INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)",url: ""}]}},
      {name: "Albergue Familiar Neblina del Bosque",type: "Turismo rural · Senderismo",icon: "fa-house-chimney",desc: "Albergue familiar en el bosque nublado de Miraflor Moropotente, con huertos, hongos y recorridos botánicos.",verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Turismo rural",facts: "Albergue familiar en el bosque nublado de Miraflor Moropotente, con huertos, hongos y recorridos botánicos.",activities: "Senderismo, cabalgatas, huertos, recorridos botánicos, tours de hongos y observación de flora y fauna.",services: "Alimentos, bebidas, hospedería y camping.",hours: "Lunes a domingo, 9:00 a. m.–6:00 p. m.",address: "De la rampa 400 metros al oeste, Reserva Miraflor Moropotente.",phones: ["7679-7560"],map: "https://www.google.com/maps/d/u/0/edit?mid=1awmyyNPpcP5WSr60aDiI_WU6F-VotDA&usp=sharing",contact: "Contacto publicado por INTUR en el catálogo 2026; confirmar antes de viajar.",sources: [{label: "INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)",url: ""}]}},
      {name: "ASOPASN · Programa Agrícola San Nicolás",type: "Turismo rural y comunitario · Senderismo",icon: "fa-people-group",desc: "Iniciativa comunitaria en La Garnacha, San Nicolás, con paisajes de montaña, queso de cabra, hortalizas y miradores.",verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Turismo rural y comunitario",facts: "Iniciativa comunitaria en La Garnacha, San Nicolás, con paisajes de montaña, queso de cabra, hortalizas y miradores.",activities: "Senderismo, tours de queso de cabra, artesanías, hortalizas, avistamiento de aves y miradores.",services: "Alimentos, bebidas y hospedaje.",hours: "Lunes a domingo, 8:00 a. m.–6:00 p. m.",address: "Contiguo a la escuela de la comunidad La Garnacha, San Nicolás.",phones: ["8658-1054"],map: "https://www.google.com/maps/d/u/0/edit?mid=1ZUb32cBf3i_gJSlNQNWp2Sprp7fBTYo&usp=sharing",contact: "Contacto publicado por INTUR en el catálogo 2026; confirmar antes de viajar.",sources: [{label: "INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)",url: ""}]}},
      {name: "Finca Agroturística Fuente de Vida",type: "Agroturismo · Senderismo",icon: "fa-seedling",desc: "Finca en Miraflor Moropotente para convivir con el campo: café, orquídeas, plantas medicinales, rosquillas y voluntariado.",verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Agroturismo",facts: "Finca en Miraflor Moropotente para convivir con el campo: café, orquídeas, plantas medicinales, rosquillas y voluntariado.",activities: "Senderismo, cabalgatas, aves, café, orquídeas y plantas medicinales, agricultura orgánica, granja y elaboración de rosquillas, queso y tortillas.",services: "Alimentos, bebidas y hospedería.",hours: "Lunes a domingo, 8:00 a. m.–6:00 p. m.",address: "De la rampa 1½ km al noreste, comunidad El Cebollal.",phones: ["8160-0350"],map: "https://www.google.com/maps/d/u/0/edit?mid=1Ms7wbX6q9P3oAqtzQXfOp2EbgAe22cs&usp=sharing",contact: "Contacto publicado por INTUR en el catálogo 2026; confirmar antes de viajar.",sources: [{label: "INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)",url: ""}]}},
      {name: "Salto de La Estanzuela",type: "Cascada · Senderismo",icon: "fa-droplet",desc: "Salto asociado al río Estelí y uno de los atractivos naturales más conocidos del municipio; su coordenada debe confirmarse en campo.",lat: 13.025,lng: -86.39,category: "cascada",precision: "approximate",geoSource: {label: "Mapa Nacional de Turismo / referencia geográfica secundaria",url: "https://www.mapanicaragua.com/category/atractivos-turisticos/"},verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Cascadas",facts: "Salto asociado al río Estelí y uno de los atractivos naturales más conocidos del municipio; su coordenada debe confirmarse en campo.",activities: "Senderismo, fotografía y naturaleza.",zone: "Estelí",sources: [{label: "Mapa Nacional de Turismo / referencia geográfica secundaria",url: "https://www.mapanicaragua.com/category/atractivos-turisticos/"}]}}
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
    heroImage: 'assets/images/departamentos/esteli.png',
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
      { name: 'Volcán San Cristóbal (1,745 msnm)', type: 'Pico Más Alto del País', icon: 'fa-volcano', desc: 'El volcán más alto de Nicaragua, activo; el ascenso es exigente y se hace solo con guía y buen estado físico.' },
      { name: 'Volcán Cosigüina y Laguna Cráter', type: 'Reserva Natural & Golfo', icon: 'fa-mountain', desc: 'Volcán en la península de Cosigüina con una laguna en el cráter y vistas al Golfo de Fonseca.' },
      { name: 'Basílica Menor de Nuestra Señora del Trono', type: 'Santuario Nacional', icon: 'fa-church', desc: 'Santuario de El Viejo, centro de la devoción a la Virgen del Trono y de la tradición de La Lavada de la Plata.' },
      { name: 'Playas de Aserradores & Jiquilillo', type: 'Surf & Esteros', icon: 'fa-umbrella-beach', desc: 'Playas del Pacífico norte con olas para surf, esteros y pueblos de pescadores.' },
      { name: 'Estero Padre Ramos', type: 'Santuario de Manglar & Tortugas', icon: 'fa-tree', desc: 'Reserva de manglares y esteros donde anidan tortugas marinas; se recorre en lancha con guías comunitarios.' },
      {name: "Rancho Maribel",type: "Turismo rural · Cabalgatas por la finca",icon: "fa-house-chimney",desc: "Destino rural para vivir una auténtica experiencia campestre y la hospitalidad de la comunidad, cerca de Somotillo.",verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Turismo rural",facts: "Destino rural para vivir una auténtica experiencia campestre y la hospitalidad de la comunidad, cerca de Somotillo.",activities: "Cabalgatas por la finca, ordeño de vacas y elaboración de productos lácteos.",services: "Alimentos y bebidas, venta de artesanía local y tours.",hours: "Lunes a domingo, 6:00 a. m.–9:00 p. m.",address: "Km 180 carretera a Somotillo, Finca Los 2 Potrillos.",phones: ["8469-2896"],map: "https://www.google.com/maps/d/u/0/edit?mid=1x5feOCfIxE6COeQyObhJTXiAWriTH64&usp=sharing",contact: "Contacto publicado por INTUR en el catálogo 2026; confirmar antes de viajar.",sources: [{label: "INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)",url: ""}]}},
      {name: "Campamento Ecológico Campuzano",type: "Turismo rural y comunitario · Observación de flora",icon: "fa-people-group",desc: "Campamento comunitario en Ranchería con piscinas naturales, bosque para observar fauna y ranchos de descanso.",verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Turismo rural y comunitario",facts: "Campamento comunitario en Ranchería con piscinas naturales, bosque para observar fauna y ranchos de descanso.",activities: "Observación de flora y fauna, cancha deportiva, senderismo, tours, camping y cabalgata.",services: "Alimentos y bebidas, artesanía local y tours.",hours: "Lunes a domingo, 6:00 a. m.–6:00 p. m.",address: "Km 150 carretera a Somotillo, 2 km al oeste, comunidad Campuzano 1.",phones: ["8452-4624"],map: "https://www.google.com/maps/d/u/0/edit?mid=19NEj9BlhGLQ0lvp0bn7lVl7_P7zfrDo&usp=sharing",contact: "Contacto publicado por INTUR en el catálogo 2026; confirmar antes de viajar.",sources: [{label: "INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)",url: ""}]}},
      {name: "Cabañas El Manantial",type: "Turismo de naturaleza · Senderismo",icon: "fa-tree",desc: "Reserva Silvestre Privada en Cinco Pinos con bosques, huertos y vivero, y cabañas para dormir en la naturaleza.",verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Turismo de naturaleza",facts: "Reserva Silvestre Privada en Cinco Pinos con bosques, huertos y vivero, y cabañas para dormir en la naturaleza.",activities: "Senderismo, cabalgatas, flora y fauna, huertos y vivero.",services: "Alojamiento, alimentos y bebidas.",hours: "Lunes a domingo, 6:00 a. m.–6:00 p. m.",address: "APROSEDE 300 m al sur, comunidad El Espino, Cinco Pinos.",phones: ["8718-7889"],map: "https://www.google.com/maps/d/u/0/edit?mid=1RDeL_Ju0LBCMqnELjCZe5DC2S-iI978&usp=sharing",contact: "Contacto publicado por INTUR en el catálogo 2026; confirmar antes de viajar.",sources: [{label: "INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)",url: ""}]}},
      {name: "Playa Jiquilillo",type: "Playa · Baño",icon: "fa-umbrella-beach",desc: "Extensa playa del Pacífico norte que el Mapa Nacional de Turismo identifica entre los destinos favoritos de sol y playa del país.",lat: 12.736,lng: -87.451,category: "playa",precision: "exact",geoSource: {label: "Mapa Nacional de Turismo",url: "https://www.mapanicaragua.com/sol-y-playa/"},verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Playas",facts: "Extensa playa del Pacífico norte que el Mapa Nacional de Turismo identifica entre los destinos favoritos de sol y playa del país.",activities: "Baño, surf, pesca, descanso y naturaleza.",zone: "El Viejo",sources: [{label: "Mapa Nacional de Turismo",url: "https://www.mapanicaragua.com/sol-y-playa/"}]}}
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
    heroImage: 'assets/images/departamentos/chinandega.jpg',
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
      { name: 'Puerto Salvador Allende y lago Xolotlán', type: 'Gastronomía, navegación, familia, paisaje y entretenimiento', icon: 'fa-ship', desc: 'Malecón de Managua a orillas del lago Xolotlán, con restaurantes, paseos en barco y espacios familiares.' },
      { name: 'Centro Histórico de Managua', type: 'Plaza de la Revolución, Antigua Catedral y patrimonio', icon: 'fa-landmark', desc: 'Zona de la antigua Managua con la Catedral vieja, el Palacio de la Cultura y la plaza junto al lago Xolotlán.' },
      { name: 'Teatro Nacional Rubén Darío', type: 'Artes escénicas, música, arquitectura y cultura', icon: 'fa-masks-theater', desc: 'Principal escenario de artes escénicas del país, frente al lago Xolotlán, con conciertos, danza y teatro.' },
      { name: 'Huellas de Acahualinca', type: 'Arqueología, geología e historia humana', icon: 'fa-shoe-prints', desc: 'Huellas de personas y animales conservadas en ceniza volcánica, de más de dos milenios de antigüedad, protegidas en un museo.' },
      { name: 'Laguna de Tiscapa', type: 'Laguna cratérica, miradores, historia y fotografía', icon: 'fa-camera', desc: 'Laguna cratérica en el corazón de Managua, con miradores, historia y canopy.' },
      { name: 'Laguna de Xiloá y Apoyeque', type: 'Recreación autorizada, paisaje volcánico y naturaleza', icon: 'fa-water', desc: 'Lagunas de origen volcánico en la península de Chiltepe; Xiloá es balneario y Apoyeque una reserva natural.' },
      { name: 'Laguna de Asososca', type: 'Paisaje natural y observación desde áreas permitidas', icon: 'fa-droplet', desc: 'Laguna cratérica que abastece de agua a Managua; se observa solo desde los miradores permitidos.' },
      { name: 'Reserva Natural Chocoyero–El Brujo', type: 'Senderismo, bosque, aves e interpretación ambiental', icon: 'fa-feather', desc: 'Cascadas y paredes donde anidan miles de chocoyos, a poca distancia de la capital.', lat: 11.99, lng: -86.25, category: "cascada", precision: "approximate", geoSource: {label: "Mapa Nacional de Turismo / KBA",url: "https://www.mapanicaragua.com/reserva-natural-chocoyero-el-brujo/"}, verification: {status: "verified",verifiedAt: "2026-10-05",facts: "Dos saltos de agua de más de 20 metros dentro de la Reserva Natural Chocoyero-El Brujo, área protegida de Ticuantepe.",activities: "Senderismo, aves, naturaleza y educación ambiental.",zone: "Ticuantepe",sources: [{label: "Mapa Nacional de Turismo / KBA",url: "https://www.mapanicaragua.com/reserva-natural-chocoyero-el-brujo/"}]} },
      { name: 'Ticuantepe y El Crucero', type: 'Agricultura, café, clima fresco, miradores y turismo rural', icon: 'fa-seedling', desc: 'Municipios de altura al sur de Managua: Ticuantepe con fincas de piña y El Crucero con clima fresco y miradores.' },
      { name: 'Pochomil y Masachapa', type: 'Playa, pesca, gastronomía, familia y atardecer', icon: 'fa-umbrella-beach', desc: 'Playas del Pacífico de Managua con pesca, comedores de mariscos y atardeceres.' },
      { name: 'Mercado Roberto Huembes', type: 'Artesanía, textiles, comida y comercio local', icon: 'fa-store', desc: 'Mercado de Managua con una gran sección de artesanía nicaragüense, textiles y comida típica.' },
      { name: 'Parque Luis Alfonso Velásquez Flores', type: 'Turismo familiar y recreación al aire libre', icon: 'fa-children', desc: 'Parque urbano familiar de Managua con áreas verdes, juegos y espacios recreativos.' },
      { name: 'Tipitapa y Centro Turístico El Trapiche', type: 'Termalismo, recreación, historia y gastronomía', icon: 'fa-hot-tub-person', desc: 'Tipitapa, entre los dos grandes lagos, es conocida por sus aguas termales; El Trapiche ofrece piscinas y comida típica.' },
      {name: "Hotel Bosque Las Nubes",type: "Agroturismo · Senderismo",icon: "fa-seedling",desc: "Bosque nuboso de clima fresco en El Crucero, con árboles centenarios, senderos entre la niebla y café de la finca.",verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Agroturismo",facts: "Bosque nuboso de clima fresco en El Crucero, con árboles centenarios, senderos entre la niebla y café de la finca.",activities: "Senderismo, cabalgata, flora y fauna, tour por cafetales, exposición y venta de café.",services: "Alimentos, bebidas y hospedería.",hours: "6:00 a. m.–5:00 p. m.",address: "Del parque 1.5 km al este, El Crucero.",phones: ["2278-1334","8473-6684"],map: "https://www.google.com/maps/d/u/0/edit?mid=1a2meFNl_1jJg3C6UT66jdt3QRxFNjuo&usp=sharing",contact: "Contacto publicado por INTUR en el catálogo 2026; confirmar antes de viajar.",sources: [{label: "INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)",url: ""}]}},
      {name: "Finca Las Delicias",type: "Agroturismo · Senderismo",icon: "fa-seedling",desc: "Finca cafetalera entre montañas y neblina con vistas al lago Xolotlán, el volcán Momotombo y Chiltepe.",verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Agroturismo",facts: "Finca cafetalera entre montañas y neblina con vistas al lago Xolotlán, el volcán Momotombo y Chiltepe.",activities: "Senderismo, observación de aves y tours por cafetales.",services: "Hospedería, alimentación y venta de café.",hours: "6:00 a. m.–6:00 p. m.",address: "Parque de El Crucero, Los Guatuzos, 3.5 km Las Nubes, 600 m al noroeste.",phones: ["7886-2969"],map: "https://www.google.com/maps/d/u/0/edit?mid=1r09KfSNCICLZkkdyLr-zg-6dGe2wgSU&usp=sharing",contact: "Contacto publicado por INTUR en el catálogo 2026; confirmar antes de viajar.",sources: [{label: "INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)",url: ""}]}},
      {name: "Reserva Silvestre Privada Montibelli",type: "Turismo de naturaleza · Senderismo",icon: "fa-tree",desc: "Reserva de bosque con seis miradores hacia las sierras de Managua y los volcanes Masaya y Mombacho.",verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Turismo de naturaleza",facts: "Reserva de bosque con seis miradores hacia las sierras de Managua y los volcanes Masaya y Mombacho.",activities: "Senderismo, monitoreo de flora y fauna, tours nocturnos y camping.",services: "Alimentos y bebidas, hospedería y actividades al aire libre.",hours: "8:00 a. m.–5:00 p. m. (con reservación).",address: "Km 18.5 carretera Ticuantepe–La Concha, 3 km al oeste, comunidad Enramada N.º 2.",phones: ["2220-9801","8730-7326"],contact: "Contacto publicado por INTUR en el catálogo 2026; confirmar antes de viajar.",sources: [{label: "INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)",url: ""}]}},
      {name: "Playa Pochomil",type: "Playa · Baño",icon: "fa-umbrella-beach",desc: "Playa amplia, plana y alargada; una de las más cercanas a Managua y con servicios turísticos.",lat: 11.77244,lng: -86.50435,category: "playa",precision: "exact",geoSource: {label: "Mapa Nacional de Turismo / GeoNames",url: "https://www.mapanicaragua.com/sol-y-playa/"},verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Playas",facts: "Playa amplia, plana y alargada; una de las más cercanas a Managua y con servicios turísticos.",activities: "Baño, caminata, paseo a caballo y gastronomía.",zone: "San Rafael del Sur",sources: [{label: "Mapa Nacional de Turismo / GeoNames",url: "https://www.mapanicaragua.com/sol-y-playa/"}]}},
      {name: "Playa Masachapa",type: "Playa · Baño",icon: "fa-umbrella-beach",desc: "Pueblo pesquero y playa del Pacífico cercana a Pochomil, con formaciones rocosas y pesca artesanal.",lat: 11.78467,lng: -86.51594,category: "playa",precision: "exact",geoSource: {label: "Mapa Nacional de Turismo / GeoNames",url: "https://www.mapanicaragua.com/sol-y-playa/"},verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Playas",facts: "Pueblo pesquero y playa del Pacífico cercana a Pochomil, con formaciones rocosas y pesca artesanal.",activities: "Baño, compra de mariscos, caminata y fotografía.",zone: "San Rafael del Sur",sources: [{label: "Mapa Nacional de Turismo / GeoNames",url: "https://www.mapanicaragua.com/sol-y-playa/"}]}}
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
    heroImage: 'assets/images/departamentos/managua.png',
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
      { name: 'Diriamba y Basílica de San Sebastián', type: 'El Güegüense, patrimonio, fiestas, arquitectura y fotografía', icon: 'fa-church', desc: 'Ciudad de Carazo donde, en las fiestas de San Sebastián, el Güegüense, el Toro Huaco y el Gigante bailan en las calles.' },
      { name: 'Jinotepe y Parroquia Santiago', type: 'Arquitectura, gastronomía, cultura, parques y servicios', icon: 'fa-building-columns', desc: 'Cabecera de Carazo con su parroquia de Santiago y fiestas patronales con bailes tradicionales y procesiones.' },
      { name: 'La Boquita', type: 'Playa, gastronomía marina, familia y atardeceres', icon: 'fa-umbrella-beach', desc: 'Balneario del Pacífico de Carazo con comedores de mariscos, pescadores y atardeceres.', lat: 11.67825, lng: -86.38236, category: "playa", precision: "exact", geoSource: {label: "Visit Nicaragua / GeoNames",url: "https://www.visitanicaragua.com/atractivos/playas/"}, verification: {status: "verified",verifiedAt: "2026-10-05",facts: "Balneario del Pacífico en el municipio de Diriamba, Carazo, con acceso carretero y servicios turísticos.",activities: "Baño, descanso, gastronomía y atardecer.",zone: "Diriamba",sources: [{label: "Visit Nicaragua / GeoNames",url: "https://www.visitanicaragua.com/atractivos/playas/"}]} },
      { name: 'Casares', type: 'Pesca artesanal, comunidad, restaurantes y paisaje costero', icon: 'fa-fish', desc: 'Comunidad de pescadores en la costa de Carazo, con playa tranquila y comida de mar.' },
      { name: 'Huehuete y El Tamarindo', type: 'Playas, recreación y costa caraceña', icon: 'fa-water', desc: 'Playas de la costa de Carazo con pesca artesanal y descanso frente al mar.' },
      { name: 'Centro Ecoturístico La Máquina', type: 'Cascadas, senderos y bosque seco', icon: 'fa-water', desc: 'Área natural en Carazo con ríos, pozas, cascadas y senderos entre bosque seco.' },
      { name: 'Refugio Río Escalante–Chacocente', type: 'Senderismo, fauna y conservación regulada de tortugas', icon: 'fa-shield-heart', desc: 'Playa protegida y bosque seco donde desovan tortugas marinas.' },
      { name: 'Reserva Silvestre Privada Tonantzin', type: 'Senderismo, aves, petroglifos, agricultura y educación ambiental', icon: 'fa-leaf', desc: 'Reserva privada en Carazo con senderos, aves, petroglifos y prácticas agrícolas sostenibles.' },
      { name: 'Reserva Silvestre Privada FRANIN', type: 'Senderismo, observación de aves y cabalgatas', icon: 'fa-feather', desc: 'Reserva privada de bosque para senderismo, observación de aves y cabalgatas.' },
      { name: 'Centro Ecoturístico Loma de Viento', type: 'Senderismo, cabalgatas, jardín botánico y turismo rural', icon: 'fa-mountain-sun', desc: 'Espacio de turismo rural en Carazo con senderos, cabalgatas y jardín botánico.' },
      { name: 'Dolores y fincas cafetaleras', type: 'Ciclismo, agroturismo, café y producción local', icon: 'fa-bicycle', desc: 'Municipio de la meseta de Carazo con fincas de café, rutas en bicicleta y producción local.' },
      {name: "Reserva Silvestre Privada La Mákina",type: "Turismo de naturaleza · Observación de aves",icon: "fa-tree",desc: "Santuario de biodiversidad camino a La Boquita con cascada, kayak, canopy y educación ambiental.",verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Turismo de naturaleza",facts: "Santuario de biodiversidad camino a La Boquita con cascada, kayak, canopy y educación ambiental.",activities: "Observación de aves, senderismo, cascada, kayak, camping y canopy.",services: "Alimentos, bebidas, diversiones y camping.",hours: "Sábado y domingo 8:00 a. m.–6:00 p. m.; lunes a viernes 9:00 a. m.–4:00 p. m. con reservación.",address: "Km 58 carretera Diriamba–playa La Boquita.",phones: ["8675-2919"],map: "https://www.google.com/maps/d/u/0/edit?mid=1NA9gXfePzc4s9Vc-WxMBgUbKa641_No&usp=sharing",contact: "Contacto publicado por INTUR en el catálogo 2026; confirmar antes de viajar.",sources: [{label: "INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)",url: ""}]}}
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
    heroImage: 'assets/images/departamentos/carazo.png',
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
      { name: 'Cordillera de Amerrisque', type: 'Serranía Mística & Trekking', icon: 'fa-mountain', desc: 'Serranía de Chontales con montañas, ríos y miradores sobre la llanura ganadera.' },
      { name: 'Museo Arqueológico Gregorio Aguilar Barea', type: 'Estatuas de Piedra Prehispánicas', icon: 'fa-landmark', desc: 'Museo de Juigalpa con una colección de estatuas prehispánicas de piedra de la región chontal.' },
      { name: 'Zoológico Thomas Belt de Juigalpa', type: 'Fauna Silvestre & Puma Albino', icon: 'fa-paw', desc: 'Pequeño zoológico de Juigalpa con fauna nicaragüense, dedicado a la educación ambiental de familias y escuelas.' },
      { name: 'Puerto Díaz & Lago Cocibolca', type: 'Pueblo de Pescadores', icon: 'fa-anchor', desc: 'Pueblo de pescadores a orillas del Cocibolca, con lanchas, pescado fresco y atardeceres sobre el lago.' },
      { name: 'Piedras Pintadas de Villa Sandino', type: 'Petroglifos Sagrados', icon: 'fa-palette', desc: 'Rocas con petroglifos precolombinos en Villa Sandino, parte de la memoria ancestral de Chontales.' },
      { name: 'Pirámides de Garro Grande', type: 'Arqueología y memoria precolombina', icon: 'fa-monument', desc: 'Sitio arqueológico con montículos y vestigios precolombinos en Chontales.' },
      { name: 'Archipiélago El Nancital', type: '27 islas, aves, pesca, navegación y atardeceres', icon: 'fa-ship', desc: 'Grupo de islas del Cocibolca frente a Chontales, con aves, pesca, navegación y atardeceres.' },
      { name: 'Cerro y Cuevas Las Ventanas', type: 'Senderismo, espeleología y geología en Acoyapa', icon: 'fa-mountain-sun', desc: 'Cerro con cuevas y formaciones rocosas en Acoyapa, para senderismo y espeleología guiada.' },
      { name: 'Cascadas de Chontales', type: 'El Corozo, El Silencio, El Chancho, Hato Grande y Kilona', icon: 'fa-water', desc: 'Caídas de agua como El Corozo, El Silencio, El Chancho, Hato Grande y Kilona, entre ganadería y bosque.' },
      { name: 'Salto y Cueva La Oropéndola', type: 'Senderismo y naturaleza en Santo Tomás', icon: 'fa-person-hiking', desc: 'Cascada y cueva en Santo Tomás, nombradas por las aves oropéndolas que anidan en la zona.' },
      { name: 'Aguas Calientes e Isla Arena', type: 'Geología, lancha, balneario y campamento', icon: 'fa-hot-tub-person', desc: 'Aguas termales a orillas del Cocibolca y una isla de arena a la que se llega en lancha.' },
      {name: "Finca Los Ángeles",type: "Agroturismo · Cabalgatas",icon: "fa-seedling",desc: "Propiedad agropecuaria de Juigalpa entre serranías, llanos, bosques y arroyos, abierta a la vida de campo.",verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Agroturismo",facts: "Propiedad agropecuaria de Juigalpa entre serranías, llanos, bosques y arroyos, abierta a la vida de campo.",activities: "Cabalgatas, senderismo, actividades agropecuarias y observación de flora y fauna.",services: "Alimentos, bebidas, hospedería, piscinas y camping.",hours: "Lunes a domingo, 6:00 a. m.–8:00 p. m.",address: "Km 147 carretera Juigalpa–El Rama.",phones: ["8909-6794"],map: "https://www.google.com/maps/d/u/0/edit?mid=1cZcB0bn7mNuAhu3NaY23pYVq66DrGn0&usp=sharing",contact: "Contacto publicado por INTUR en el catálogo 2026; confirmar antes de viajar.",sources: [{label: "INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)",url: ""}]}}
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
    heroImage: 'assets/images/departamentos/chontales.png',
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
      { name: 'Centro Histórico & Calles Escalonadas de Boaco', type: 'Arquitectura Topográfica', icon: 'fa-city', desc: 'La \'ciudad de dos pisos\': parte alta y parte baja unidas por calles en pendiente con vista al valle.' },
      { name: 'Cerro de la Vieja & Cerro Alegre', type: 'Senderismo & Mitos', icon: 'fa-mountain', desc: 'Cerros de Boaco con senderos, miradores y leyendas de la tradición oral local.' },
      { name: 'Río Fonseca & Balnearios Naturales', type: 'Pozas de Montaña', icon: 'fa-water', desc: 'Río de montaña con pozas naturales para bañarse cerca de la ciudad de Boaco.' },
      { name: 'Pueblo Ganadero de Camoapa', type: 'Sombreros de Pita & Lácteos', icon: 'fa-hat-cowboy', desc: 'Municipio ganadero de Boaco, conocido por sus artesanías de palma (pita) y la vida de hacienda.' },
      { name: 'Mirador El Faro', type: 'Panorámica de la Ciudad', icon: 'fa-eye', desc: 'Mirador sobre la \'ciudad de dos pisos\', con vista panorámica de Boaco.' },
      { name: 'Reserva Mombachito–Cerro La Vieja', type: 'Bosque, senderismo, agua y turismo rural', icon: 'fa-tree', desc: 'Reserva de bosque con fuentes de agua, senderos y turismo rural en Boaco.' },
      { name: 'Reserva Natural Filas de Masigüe', type: 'Bosque húmedo, aves y conservación del agua', icon: 'fa-feather', desc: 'Serranía de bosque húmedo protegida por su valor para el agua y las aves.' },
      { name: 'Comunidad Las Lagunas', type: 'Petrograbados, senderismo, gastronomía y miradores', icon: 'fa-monument', desc: 'Comunidad rural de Boaco con petrograbados, senderos, cocina local y miradores.' },
      { name: 'Cerros y cascadas de Santa Lucía', type: 'La Cruz, Santo Domingo, Peña Labrada y Salto Las Américas', icon: 'fa-mountain-sun', desc: 'Pueblo rodeado de montañas, con cerros y cascadas ideales para caminatas y turismo rural.' },
      { name: 'Cueva La Cocinera y Finca El Tamarindo', type: 'Aventura, café, orquídeas y cactus', icon: 'fa-person-hiking', desc: 'Cueva para aventura guiada y una finca con café, orquídeas y cactus.' },
      { name: 'Salto La Chorrera', type: 'Senderismo, aves, cafetales y miradores', icon: 'fa-water', desc: 'Cascada entre cafetales con senderos, aves y miradores.' },
      {name: "Finca Poza Redonda Azul",type: "Turismo rural · Senderismo al cerro El Diamante",icon: "fa-house-chimney",desc: "Finca agropecuaria sostenible en Teustepe con ganadería, granos, cítricos y una poza natural como atractivo principal.",verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Turismo rural",facts: "Finca agropecuaria sostenible en Teustepe con ganadería, granos, cítricos y una poza natural como atractivo principal.",activities: "Senderismo al cerro El Diamante y ojo de agua, actividades agropecuarias, fogatas literarias y comida tradicional.",services: "Alimentación y bebidas, cabañas, piscina y eventos familiares.",hours: "Lunes a domingo, 8:00 a. m.–7:00 p. m. (huéspedes hasta 10:00 p. m.).",address: "Teustepe, carretera a San José de los Remates, km 82.5 a mano izquierda, 1½ km comunidad San Diego, portón de madera finca El Arbolito.",phones: ["8752-3743"],map: "https://www.google.com/maps/d/u/0/edit?mid=1a7sf0EOmz7mutO0b5cKaJ33QapdemHw&usp=sharing",contact: "Contacto publicado por INTUR en el catálogo 2026; confirmar antes de viajar.",sources: [{label: "INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)",url: ""}]}}
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
    heroImage: 'assets/images/departamentos/boaco.png',
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
      { name: 'Cerro Mogotón (2,107 msnm)', type: 'Cima Más Alta de Nicaragua', icon: 'fa-mountain', desc: 'El punto más alto de Nicaragua, en una reserva natural de pinares y bosque nuboso en la frontera norte.' },
      { name: 'Santuario de la Virgen de la Piedra (Dipilto)', type: 'Sitio Religioso & Río', icon: 'fa-church', desc: 'Santuario en una cueva de piedra en Dipilto, centro de peregrinación entre pinares y fincas de café.' },
      { name: 'Aguas Termales de Macuelizo & Delia', type: 'Termalismo Terapéutico', icon: 'fa-hot-tub-person', desc: 'Fuentes de aguas termales en el municipio de Macuelizo, usadas como baños de descanso.' },
      { name: 'Valle Fértil de Jalapa', type: 'Granero de Maíz & Tabaco', icon: 'fa-seedling', desc: 'Valle agrícola del norte de Nueva Segovia, conocido por el maíz, el tabaco y el clima fresco.' },
      { name: 'Ocotal Colonial & Casa de la Cultura', type: 'Historia & Música', icon: 'fa-landmark', desc: 'Cabecera de Nueva Segovia con su parque central, catedral y casa de la cultura, puerta hacia los pinares del norte.' },
      { name: 'Ciudad Antigua', type: 'Ruta colonial, iglesias, arquitectura y comunidades', icon: 'fa-building-columns', desc: 'Uno de los pueblos coloniales más antiguos de Nicaragua, con su iglesia histórica y calles tradicionales.' },
      { name: 'Cerro Las Tres Señoritas', type: 'Senderismo y vistas panorámicas cerca de Ocotal', icon: 'fa-mountain-sun', desc: 'Cerro cercano a Ocotal con senderos y vistas panorámicas del valle.' },
      { name: 'Cruz de la Fe', type: 'Mirador y recorrido religioso en Dipilto', icon: 'fa-cross', desc: 'Mirador con una gran cruz en Dipilto, destino de recorridos religiosos y paisaje de pinares.' },
      { name: 'Artesanías de Mozonte', type: 'Barro, talleres y compra directa a creadores', icon: 'fa-hands', desc: 'Talleres de cerámica de barro en Mozonte, comunidad de tradición indígena; se compra directo a las artesanas.' },
      { name: 'Salto El Rosario', type: 'Cascada, senderismo, bosque y comunidades de Murra', icon: 'fa-water', desc: 'Cascada en el municipio de Murra, rodeada de bosque y comunidades cafetaleras.' },
      { name: 'Aguas termales Don Alfonso', type: 'Naturaleza y bienestar en San Fernando', icon: 'fa-hot-tub-person', desc: 'Aguas termales naturales en San Fernando para descanso y bienestar.' }
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
    heroImage: 'assets/images/departamentos/nueva%20segovia.png',
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
      { name: 'Fortaleza de la Inmaculada Concepción (El Castillo)', type: 'Monumento Nacional Siglo XVII', icon: 'fa-chess-rook', desc: 'Fortaleza colonial sobre los raudales del río San Juan, construida para defender la ruta hacia el Caribe.', verification: {status: "verified",verifiedAt: "2026-10-05",facts: "Fortaleza colonial construida entre 1672 y 1675 para proteger la ruta del Río San Juan; es Patrimonio Cultural de la Nación y uno de los principales valores históricos del municipio.",price: "Consultar la tarifa vigente en el sitio.",sources: [{label: "Mapa Nacional de Turismo",url: "https://www.mapanicaragua.com/arquitectura-de-el-castillo/"},{label: "Mapa Nacional de Turismo",url: "https://www.mapanicaragua.com/cultura-de-el-castillo/"}]} },
      { name: 'Reserva Biológica Indio Maíz', type: 'Selva Virgen & Jaguares', icon: 'fa-tree', desc: 'Una de las selvas mejor conservadas de Centroamérica; se visita por sus bordes con guías autorizados.' },
      { name: 'Archipiélago de Solentiname', type: 'Islas de Pintores Primitivistas', icon: 'fa-palette', desc: 'Islas de pintores y talladores de madera de balsa en el Cocibolca.', lat: 11.17283, lng: -84.99081, category: "isla", precision: "approximate", geoSource: {label: "Visit Nicaragua / GeoNames",url: "https://www.visitanicaragua.com/atractivos/islas/"}, verification: {status: "verified",verifiedAt: "2026-10-05",facts: "Conjunto insular del Lago Cocibolca reconocido por su naturaleza, sus comunidades y su tradición artística.",activities: "Arte primitivista, turismo comunitario, aves, lancha y cultura.",zone: "San Carlos",sources: [{label: "Visit Nicaragua / GeoNames",url: "https://www.visitanicaragua.com/atractivos/islas/"}]} },
      { name: 'Humedales de San Carlos & Malecón', type: 'Confluencia Lago-Río', icon: 'fa-water', desc: 'Malecón de San Carlos donde se unen el lago y el río San Juan, rodeado de humedales con aves.' },
      { name: 'San Juan de Nicaragua (Greytown)', type: 'Salida al Caribe & Cementerios Británicos', icon: 'fa-anchor', desc: 'Poblado en la desembocadura del río San Juan al Caribe, con historia del tránsito interoceánico.' },
      { name: 'San Carlos y su circuito urbano', type: 'Malecón, fortaleza, centro cultural, museo y puerto', icon: 'fa-city', desc: 'Cabecera de Río San Juan, con malecón, fortaleza, centro cultural y el puerto de salida hacia el río y Solentiname.' },
      { name: 'Bartola', type: 'Senderismo, cacao, fauna, cabalgatas y aviturismo', icon: 'fa-tree', desc: 'Comunidad a orillas del río San Juan, junto a la Reserva Indio Maíz, con senderos, cacao y fauna.' },
      { name: 'Refugio de Vida Silvestre Río San Juan', type: 'Bosque húmedo, humedales y biodiversidad', icon: 'fa-feather', desc: 'Refugio a lo largo del río San Juan con selva, humedales y fauna, recorrido en lancha.' },
      { name: 'Antigua Greytown', type: 'Cementerios, lagunas, caños y memoria del tránsito', icon: 'fa-landmark', desc: 'Sitio histórico con cementerios de la época del tránsito, lagunas y caños en la costa caribe de Río San Juan.' },
      { name: 'Refugio Los Guatuzos', type: 'Kayak, aves, fauna, bosque y senderos', icon: 'fa-binoculars', desc: 'Humedales y ríos con aves, caimanes y monos al sur del Cocibolca.' },
      { name: 'Muelle de San Miguelito y Chocoyolandia', type: 'Atardeceres, gastronomía y balneario lacustre', icon: 'fa-water', desc: 'Muelle del Cocibolca con atardeceres, comida local y balneario lacustre.' },
      {name: "Hostal Buen Amigo",type: "Turismo rural y comunitario · Caminatas",icon: "fa-people-group",desc: "Hostal en la isla Mancarrón, Solentiname, para descansar y conocer las tradiciones artísticas del archipiélago.",verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Turismo rural y comunitario",facts: "Hostal en la isla Mancarrón, Solentiname, para descansar y conocer las tradiciones artísticas del archipiélago.",activities: "Caminatas, paseos en bote, talleres de artesanía y cultura local.",services: "Alimentos, bebidas, hospedería, piscinas y camping.",hours: "Lunes a domingo, 7:00 a. m.–8:00 p. m.",address: "Isla Mancarrón, del cuadro municipal 100 m al sur.",phones: ["8776-7508","8961-3200"],map: "https://www.google.com/maps/d/u/0/edit?mid=1JVmXW9SioVGQQs52ImHU4cGQBICHsno&usp=sharing",contact: "Contacto publicado por INTUR en el catálogo 2026; confirmar antes de viajar.",sources: [{label: "INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)",url: ""}]}},
      {name: "Albergue Caimán (Los Guatuzos)",type: "Turismo rural y comunitario · Observación de flora",icon: "fa-people-group",desc: "Albergue ecológico a orillas de los humedales del río Papaturro, en el Refugio de Vida Silvestre Los Guatuzos.",verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Turismo rural y comunitario",facts: "Albergue ecológico a orillas de los humedales del río Papaturro, en el Refugio de Vida Silvestre Los Guatuzos.",activities: "Observación de flora y fauna, paisajes tropicales, kayak o bote y proceso del cacao.",services: "Hospedaje, alimentos, bebidas, transporte acuático, guía y camping.",hours: "Lunes a domingo, 7:00 a. m.–9:00 p. m.",address: "Comunidad Papaturro, del muelle municipal 100 m al norte, San Carlos.",phones: ["8676-2958"],map: "https://www.google.com/maps/d/u/0/edit?mid=1sYj97ccIS_7ybVgF2yEhC9F05BkfXdM&usp=sharing",contact: "Contacto publicado por INTUR en el catálogo 2026; confirmar antes de viajar.",sources: [{label: "INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)",url: ""}]}},
      {name: "Río San Juan",type: "Río · Navegación",icon: "fa-water",desc: "Río histórico que nace en el Lago Cocibolca y fluye hacia el Caribe; eje de naturaleza, historia, navegación y turismo del departamento.",lat: 11.119218,lng: -84.778118,category: "rio",precision: "approximate",geoSource: {label: "Mapa Nacional de Turismo / Wikidata",url: "https://www.mapanicaragua.com/rio-san-juan/"},verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Ríos",facts: "Río histórico que nace en el Lago Cocibolca y fluye hacia el Caribe; eje de naturaleza, historia, navegación y turismo del departamento.",activities: "Navegación, pesca deportiva, observación de aves e historia.",zone: "San Carlos / El Castillo / San Juan de Nicaragua",sources: [{label: "Mapa Nacional de Turismo / Wikidata",url: "https://www.mapanicaragua.com/rio-san-juan/"}]}}
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
    heroImage: 'assets/images/destinos/Fortaleza de la Inmaculada Concepción.jpg',
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
      { name: 'Reserva de Biosfera Bosawás', type: 'Patrimonio de la Humanidad UNESCO', icon: 'fa-tree', desc: 'Uno de los bosques tropicales más extensos de Centroamérica, territorio mayangna y miskitu.' },
      { name: 'Río Coco / Wangki', type: 'Río Más Largo de Centroamérica', icon: 'fa-water', desc: 'El río más largo de Centroamérica, frontera con Honduras y eje de la vida miskitu.', lat: 14.99751, lng: -83.13809, category: "rio", precision: "approximate", geoSource: {label: "GeoNames / Wikidata",url: "https://mapcarta.com/es/19586360"}, verification: {status: "verified",verifiedAt: "2026-10-05",facts: "Gran río del norte de Nicaragua que forma parte de la frontera con Honduras y desemboca en el Caribe; también se le conoce como Wangki.",activities: "Paisaje fluvial, cultura comunitaria y navegación local.",zone: "Waspam y zona fronteriza",sources: [{label: "GeoNames / Wikidata",url: "https://mapcarta.com/es/19586360"}]} },
      { name: 'Bilwi (Puerto Cabezas) & Muelle Histórico', type: 'Cultura Caribeña & Playas', icon: 'fa-anchor', desc: 'Ciudad portuaria del Caribe norte con muelle, playa y cultura miskita.' },
      { name: 'Comunidades Mayangnas de Bonanza y Rosita', type: 'Pueblos Originarios', icon: 'fa-hands-holding', desc: 'Pueblos originarios mayangnas que conservan su idioma y su relación con el bosque de Bosawás.' },
      { name: 'Cayos Miskitos', type: 'Arrecifes & Casas sobre Pilotes', icon: 'fa-fish', desc: 'Cayos y arrecifes frente a la costa de la RACCN, con casas sobre pilotes de comunidades miskitas.' },
      { name: 'Waspam, Portal del Wangki', type: 'Navegación, comunidades, lengua y cultura', icon: 'fa-ship', desc: 'Pueblo a orillas del río Coco, centro de las comunidades miskitas del Wangki.' },
      { name: 'Sabanas de Pino', type: 'Paisaje, fotografía, fauna y comunidad', icon: 'fa-tree', desc: 'Extensas sabanas de pino caribe cerca de Bilwi, con fauna y paisajes abiertos.' },
      { name: 'Triángulo Minero', type: 'Siuna, Bonanza y Rosita: naturaleza y memoria productiva', icon: 'fa-mountain-sun', desc: 'Siuna, Bonanza y Rosita: municipios mineros con historia productiva y acceso a la naturaleza de Bosawás.' },
      {name: "Finca Agroturística El Cortés",type: "Agroturismo · Senderismo",icon: "fa-seedling",desc: "Finca de Siuna que une bosque denso y producción sostenible de cacao, granos y animales con la comunidad local.",verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Agroturismo",facts: "Finca de Siuna que une bosque denso y producción sostenible de cacao, granos y animales con la comunidad local.",activities: "Senderismo, camping, actividades agropecuarias, flora, fauna y aves.",services: "Alimentos, bebidas, cabañas, piscinas para niños y camping.",hours: "Jueves a domingo, 2:00 p. m.–9:00 p. m.",address: "Comunidad Campo Uno, del barrio Gilberto Romero 3 km al noreste, Siuna.",phones: ["8495-9820"],map: "https://www.google.com/maps/d/u/0/edit?mid=1XOFQIQ2p8s6_qUgbZZo4qnOkoLe5rnY&usp=sharing",contact: "Contacto publicado por INTUR en el catálogo 2026; confirmar antes de viajar.",sources: [{label: "INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)",url: ""}]}}
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
    heroImage: 'assets/images/departamentos/raan.png',
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
      { name: 'Corn Island & Little Corn Island', type: 'Playas Turquesas & Arrecife', icon: 'fa-umbrella-beach', desc: 'Islas caribeñas de arena blanca, arrecifes y cultura creole.', verification: {status: "verified",verifiedAt: "2026-10-05",facts: "Destino oficial del Caribe nicaragüense. Visit Nicaragua resalta playas de arena blanca, aguas transparentes, cultura afrocaribeña, gastronomía, snorkel, buceo y kayak.",price: "Panga, snorkel, cabañas y taxi tienen precio por proveedor y fecha; consultar.",contact: "Alojamiento, panga y buceo se registran como proveedores separados.",sources: [{label: "Visit Nicaragua",url: "https://www.visitanicaragua.com/islas/great-corn-island/"}]}, lat: 12.1664, lng: -83.0514, category: "isla", precision: "approximate", geoSource: {label: "Visit Nicaragua / GeoNames",url: "https://www.visitanicaragua.com/islas/great-corn-island/"} },
      { name: 'Cayos Perlas', type: 'Islas de Coral Desiertas', icon: 'fa-fish', desc: 'Cayos de arena y arrecife frente a Laguna de Perlas, en un área de anidación de tortugas.' },
      { name: 'Bahía de Bluefields & Malecón', type: 'Cultura Afrocaribeña', icon: 'fa-anchor', desc: 'Ciudad caribeña de música, bahía y mercado, cabecera de la RACCS.' },
      { name: 'Laguna de Perlas & Aspinwall', type: 'Humedales & Comunidades Garífunas', icon: 'fa-water', desc: 'Laguna costera con comunidades creoles, garífunas y miskitu, punto de salida hacia los Cayos Perlas.' },
      { name: 'Isla Rama Cay', type: 'Pueblo Originario Rama', icon: 'fa-people-roof', desc: 'Pequeña isla en la bahía de Bluefields, hogar principal del pueblo originario Rama.' },
      { name: 'Bluff Beach', type: 'Playa, paisaje, deporte y gastronomía marina', icon: 'fa-umbrella-beach', desc: 'Playa en El Bluff, a la entrada de la bahía de Bluefields, con mar abierto y comida marina.' },
      { name: 'Playas de Corn Island', type: 'Long Bay, South West Bay, Heavy Sand y Mount Pleasant', icon: 'fa-water', desc: 'Playas de arena blanca y agua turquesa alrededor de Corn Island, con arrecifes para esnórquel.' },
      { name: 'Little Corn Island y Otto Beach', type: 'Caminatas, snorkel, buceo y descanso', icon: 'fa-island-tropical', desc: 'Isla pequeña y sin carros, con senderos, arrecifes y playas tranquilas como Otto Beach.', lat: 12.2884, lng: -82.9812, category: "isla", precision: "approximate", geoSource: {label: "Visit Nicaragua / GeoNames",url: "https://www.visitanicaragua.com/atractivos/islas/"}, verification: {status: "verified",verifiedAt: "2026-10-05",facts: "Isla caribeña de menor tamaño, sin tránsito vehicular convencional, conocida por su ambiente tranquilo, playas y arrecifes.",activities: "Buceo, snorkel, playa, caminata y kayak.",zone: "Corn Island",sources: [{label: "Visit Nicaragua / GeoNames",url: "https://www.visitanicaragua.com/atractivos/islas/"}]} },
      { name: 'Awas y Orinoco', type: 'Experiencias culturales comunitarias miskita y garífuna', icon: 'fa-people-group', desc: 'Comunidades de Laguna de Perlas: Awas con playa lacustre y Orinoco, corazón de la cultura garífuna.' },
      { name: 'Saltos Walpapigny y Busay', type: 'Senderismo, aves, naturaleza y aguas termales', icon: 'fa-water', desc: 'Caídas de agua en la RACCS rodeadas de bosque tropical, con aves y aguas termales en la zona.' },
      {name: "Garífuna Secrets of the Jungle",type: "Turismo rural y comunitario · Tours a comunidades garífunas",icon: "fa-people-group",desc: "Experiencia garífuna cerca de Orinoco, Laguna de Perlas: música, gastronomía, historias ancestrales y selva tropical.",verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Turismo rural y comunitario",facts: "Experiencia garífuna cerca de Orinoco, Laguna de Perlas: música, gastronomía, historias ancestrales y selva tropical.",activities: "Tours a comunidades garífunas, río Wawashan, pesca tradicional, vida silvestre, bailes y música garífuna y saberes de finca.",services: "Hospedería, alimentos y bebidas.",hours: "Lunes a domingo, 8:00 a. m.–5:00 p. m.",address: "3 km afuera de la comunidad Orinoco, municipio de Laguna de Perlas.",phones: ["8648-4985"],map: "https://www.google.com/maps/d/u/0/edit?mid=1e1r8XYLJfIxIXfvCFCRm_n31drOyE9s&usp=sharing",contact: "Contacto publicado por INTUR en el catálogo 2026; confirmar antes de viajar.",sources: [{label: "INTUR · Catálogo de Iniciativas de Turismo Rural y Comunitario (2026)",url: ""}]}},
      {name: "Río Grande de Matagalpa",type: "Río · Paisaje",icon: "fa-water",desc: "Uno de los principales ríos de Nicaragua; recorre el país hacia el Caribe y drena una extensa cuenca.",lat: 12.90905,lng: -83.51531,category: "rio",precision: "approximate",geoSource: {label: "GeoNames / OpenStreetMap",url: "https://mapcarta.com/es/19583878"},verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Ríos",facts: "Uno de los principales ríos de Nicaragua; recorre el país hacia el Caribe y drena una extensa cuenca.",activities: "Paisaje, navegación local y observación ambiental.",zone: "Cuenca del Río Grande",sources: [{label: "GeoNames / OpenStreetMap",url: "https://mapcarta.com/es/19583878"}]}},
      {name: "Río Escondido",type: "Río · Navegación",icon: "fa-water",desc: "Río del sureste de Nicaragua que desemboca en el mar Caribe al norte de Bluefields.",lat: 12.08677,lng: -83.74916,category: "rio",precision: "approximate",geoSource: {label: "GeoNames / Mapcarta",url: "https://mapcarta.com/es/19584100"},verification: {status: "verified",verifiedAt: "2026-10-05",modality: "Ríos",facts: "Río del sureste de Nicaragua que desemboca en el mar Caribe al norte de Bluefields.",activities: "Navegación, paisaje y conexión fluvial.",zone: "Bluefields / El Rama",sources: [{label: "GeoNames / Mapcarta",url: "https://mapcarta.com/es/19584100"}]}}
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
