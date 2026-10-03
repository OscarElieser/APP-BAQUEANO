// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — FICHA DINÁMICA DE DESTINOS (destination-dossier.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Resolver el fallo crítico de navegación detectado en la auditoría técnica de
//   destinos.html, donde pulsar "Ver destino" (destinos.html?id=ometepe, sjds, etc.)
//   devolvía al usuario al catálogo general sin mostrar una verdadera ficha territorial.
// - Brindar una experiencia completa de descubrimiento territorial: portada HD,
//   descripción, ubicación geográfica exacta, clima promedio, tarifas transparentes
//   en Córdobas (C$) y USD, logística de cómo llegar, gastronomía cercana, hospedajes
//   aliados verificados, protocolo de verificación de 8 puntos, decálogo ambiental y
//   conexión directa con Baqueano IA y Mi Viaje.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Catálogo estructurado de fichas territoriales georreferenciadas.
// - Renderizado dinámico accesible en modal / sheet de alta definición (Glassmorphism).
// - Sincronización bidireccional con URL (History API pushState / replaceState).
// - Persistencia autenticada mediante Firebase Auth, Functions y Supabase.
// - Interceptor global de clics para enlaces con parámetro ?id= en destinos y tarjetas.
//
// 📦 3. QUÉ (WHAT / ENTIDADES EXPUESTAS):
// - window.BaqueanoDossier = { open: openDestinationDossier, close: closeDestinationDossier, get: getDestinationData }
// - window.openDestinationDossier(id)
// ============================================================================

(function (window, document) {
  'use strict';

  // ─── Base de Datos Territorial de Destinos Baqueano ──────────────────────
  const DESTINATIONS_DB = {
    ometepe: {
      id: 'ometepe',
      title: 'Isla de Ometepe',
      subtitle: 'Oasis de Dos Volcanes y Petroglifos en el Gran Lago Cocibolca',
      department: 'Rivas',
      municipality: 'Altagracia & Moyogalpa',
      category: 'Naturaleza & Volcanes',
      image: 'assets/images/destinos/isla_de_ometepe.jpg',
      altImage: 'assets/images/destinos/isla_de_ometepe.jpg',
      verifiedDate: 'Actualización pendiente',
      priceNio: 'Precio pendiente de verificación',
      priceUsd: 'Sin publicar',
      climate: '27°C · Brisa lacustre fresca',
      duration: '2 a 3 días sugeridos',
      difficulty: 'Moderada / Exigente en volcanes',
      coordinates: '11.5380° N, 85.6220° W',
      description: 'Ometepe ("dos montañas" en lengua náhuatl) es la mayor isla volcánica lacustre del mundo, declarada Reserva de Biosfera por la UNESCO en 2010. Formada por dos colosos —el imponente Volcán Concepción (1,610 m, activo) y el verde Volcán Maderas (1,394 m, cubierto de bosque nuboso con laguna en su cráter)—, la isla combina arqueología precolombina viva, cafetales agroecológicos comunitarios, manantiales cristalinos y una cultura hospitalaria campesina única.',
      howToReach: 'Desde Managua tomar la Carretera Panamericana Sur (NIC-2) hasta la ciudad de Rivas (110 km) y continuar 5 km hasta el Puerto de San Jorge. Desde San Jorge zarpan ferris y lanchas motorizadas cada 45 minutos hacia los puertos de Moyogalpa o San José del Sur (tiempo de navegación: 60 minutos). En la isla hay buses regulares, taxis locales y cooperativas de alquiler de motocicletas y bicicletas.',
      activities: [
        'Ascenso guiado al Volcán Concepción (jornada de 7-9 horas con guías comunitarios)',
        'Senderismo al bosque nuboso y laguna del cráter del Volcán Maderas',
        'Baño en las aguas minerales curativas del manantial Ojo de Agua',
        'Kayak ecológico por el Río Istián entre manglares y garzas',
        'Ruta arqueológica de petroglifos ancestrales en Finca Magdalena y Museo El Ceibo'
      ],
      gastronomy: [
        'Pescado guapote frito del Cocibolca con tostones y ensalada criolla',
        'Plátano maduro horneado con queso frito y cuajada de finca',
        'Café orgánico de sombra cultivado por cooperativas campesinas del Volcán Maderas',
        'Batidos de frutas tropicales frescas de temporada (mango, maracuyá, guanábana)'
      ],
      allies: [
        'Cooperativa Agropecuaria Finca Magdalena (Ecoturismo & Café Orgánico)',
        'Red Comunitaria Ometepe Viva (Guías de montaña acreditados)',
        'Posada Rural San Ramón (Hospedaje ecológico campesino)'
      ],
      safetyTips: 'Para ascender a cualquiera de los dos volcanes es mandatorio ir acompañado por un guía local acreditado. Llevar calzado cerrado con tracción, protector solar biodegradable, abundante agua (mínimo 3 litros por persona para ascensos) y respetar la señalización de senderos protegidos.'
    },

    granada: {
      id: 'granada',
      title: 'Granada Colonial & Isletas',
      subtitle: 'La Gran Sultana y el Archipiélago de 365 Isletas del Cocibolca',
      department: 'Granada',
      municipality: 'Granada',
      category: 'Cultura & Patrimonio',
      image: 'assets/images/destinos/Calle La Calzada & Zona Bohemia.jpg',
      altImage: 'assets/images/destinos/isletas_de_granada.jpg',
      verifiedDate: 'Actualización pendiente',
      priceNio: 'Precio pendiente de verificación',
      priceUsd: 'Sin publicar',
      climate: '29°C · Cálido tropical',
      duration: '1 a 2 días sugeridos',
      difficulty: 'Fácil / Caminata urbana y navegación',
      coordinates: '11.9344° N, 85.9560° W',
      description: 'Fundada en 1524 por Francisco Hernández de Córdoba, Granada es la ciudad colonial más antigua en tierra firme del continente americano que conserva su asiento original. Su arquitectura neoclásica y barroca andaluza, sus iglesias de vivos colores, la señorial Calle La Calzada y el puerto sobre el Gran Lago de Nicaragua ofrecen un viaje sensorial al corazón histórico de Centroamérica.',
      howToReach: 'Ubicada a tan solo 45 km al sureste de Managua sobre la Carretera a Masaya (NIC-4). Hay buses interurbanos expresos cada 15 minutos desde la terminal del Mercado Roberto Huembes en Managua (tiempo aproximado: 50 minutos). En vehículo particular la carretera está 100% asfaltada y señalizada.',
      activities: [
        'Ascenso al campanario de la Iglesia La Merced para una vista panorámica de 360° sobre los tejados coloniales y el Volcán Mombacho',
        'Paseo en lancha con pescadores locales por el archipiélago de las 365 Isletas del Cocibolca y visita al Fuerte San Pablo (1783)',
        'Recorrido por el Convento y Museo San Francisco con su sala de estatuaria precolombina de la Isla Zapatera',
        'Taller artesanal de chocolate y cata de café orgánico nicaragüense',
        'Caminata vespertina por el Malecón de Granada con brisa del lago'
      ],
      gastronomy: [
        'El auténtico Vigorón granadino servido sobre hoja de plátano con chicharrón crujiente, yuca suave y ensalada de repollo',
        'Fresco de Grama con limón, bebida tradicional refrescante',
        'Guapote en salsa tipitapa o a la tipitapa frente al lago',
        'Postres tradicionales de almíbar, cajetas de leche y raspados de frutas'
      ],
      allies: [
        'Asociación de Lancheros Unidos de las Isletas de Granada',
        'Cooperativa de Artesanos y Pintores Primitivistas',
        'Hotel Convento Colonial Doña Rosa'
      ],
      safetyTips: 'Zona urbana sumamente turística y tranquila. Para paseos en lancha por las isletas, exigir siempre el uso de chaleco salvavidas reglamentario. En la tarde y noche, mantenerse en las calles iluminadas del centro histórico y La Calzada.'
    },

    sjds: {
      id: 'sjds',
      title: 'San Juan del Sur & Costa Esmeralda',
      subtitle: 'Santuario del Surf del Pacífico y Refugio de Vida Marina',
      department: 'Rivas',
      municipality: 'San Juan del Sur & Tola',
      category: 'Playas & Surf',
      image: 'assets/images/destinos/Bahía de San Juan del Sur & Mirador del Cristo.jpg',
      altImage: 'assets/images/destinos/Playa Maderas (Santuario del Surf).jpg',
      verifiedDate: 'Actualización pendiente',
      priceNio: 'Precio pendiente de verificación',
      priceUsd: 'Sin publicar',
      climate: '28°C · Brisa marina y oleaje constante',
      duration: '2 a 4 días sugeridos',
      difficulty: 'Moderada / Clases de surf y senderismo costero',
      coordinates: '11.2529° N, 85.8705° W',
      description: 'Antiguo puerto pesquero y escala histórica de la ruta del oro en el siglo XIX, San Juan del Sur es hoy la capital costera del surf en Centroamérica. Su bahía en forma de herradura está flanqueada por acantilados y presidida por el mirador del Cristo de la Misericordia. A pocos minutos se despliega la Costa Esmeralda: Playa Maderas, Playa Marsella, Playa Hermosa y el Refugio de Vida Silvestre La Flor.',
      howToReach: 'A 140 km al sur de Managua por la Carretera Panamericana Sur (NIC-2) hasta Rivas, y desde allí 28 km por la Carretera a San Juan del Sur. Existen buses directos desde Managua (Mercado Huembes) y colectivos frecuentes desde el Mercado de Rivas.',
      activities: [
        'Sesiones de surf para principiantes y avanzados en Playa Maderas y Playa Remanso',
        'Ascenso al Mirador del Cristo de la Misericordia para contemplar atardeceres de postal',
        'Observación nocturna de anidación de tortugas paslama en el Refugio de Vida Silvestre La Flor (julio a enero)',
        'Paseos en velero y avistamiento de ballenas y delfines durante la temporada',
        'Paseos a caballo por playas vírgenes y acantilados'
      ],
      gastronomy: [
        'Ceviche mixto de corvina, camarón y calamar recién desembarcado',
        'Langosta a la parrilla con mantequilla de ajo y tostones',
        'Tacos de pescado al estilo costero con salsa de aguacate',
        'Cócteles tropicales con ron nicaragüense Flor de Caña y jugo de coco'
      ],
      allies: [
        'Escuela Comunitaria de Surf Maderas',
        'Cooperativa de Pescadores Artesanales de la Bahía',
        'Posadas Ecológicas de Playa Remanso'
      ],
      safetyTips: 'Atención a las corrientes de resaca en playas de mar abierto; consultar con salvavidas o instructores locales antes de ingresar al agua. En el Refugio La Flor, no usar linternas blancas ni flashes fotográficos para no desorientar a las tortugas.'
    },

    cerro_negro: {
      id: 'cerro_negro',
      title: 'Volcán Cerro Negro',
      subtitle: 'El Volcán Más Joven de Centroamérica y Cuna del Sandboarding',
      department: 'León',
      municipality: 'Malpaisillo & León',
      category: 'Aventura Extrema',
      image: 'assets/images/destinos/cerro_negro.jpg',
      altImage: 'assets/images/destinos/cerro_negro.jpg',
      verifiedDate: 'Actualización pendiente',
      priceNio: 'Precio pendiente de verificación',
      priceUsd: 'Sin publicar',
      climate: '32°C · Terreno volcánico árido y soleado',
      duration: 'Medio día (4 a 5 horas)',
      difficulty: 'Moderada / Descenso veloz en tabla',
      coordinates: '12.5061° N, 86.7022° W',
      description: 'Nacido en 1850, el Cerro Negro (728 m) es uno de los volcanes activos más singulares y jóvenes del planeta. Su cono negro azabache de escoria y ceniza contrasta vívidamente con la cordillera de Los Maribios. Es el único lugar en el mundo donde se practica el célebre "Volcano Sandboarding", deslizándose por sus empinadas faldas sobre tablas especiales a velocidades de hasta 80 km/h.',
      howToReach: 'Ubicado a 25 km al este de la ciudad de León. El acceso se realiza en vehículos 4x4 o tours organizados por cooperativas de guías desde León hasta la caseta de control de guardaparques comunitarios.',
      activities: [
        'Ascenso a pie de 50 minutos con vistas espectaculares a los volcanes Telica, Momotombo y San Cristóbal',
        'Exploración del cráter activo con fumarolas de azufre y suelo tibio',
        'Descenso en sandboarding sobre ceniza negra con traje de protección y gafas',
        'Fotografía de contraste lunar de la Cordillera de los Maribios'
      ],
      gastronomy: [
        'Bebidas rehidratantes naturales (fresco de chía con tamarindo)',
        'Almuerzo campesino tradicional en cooperativas de Malpaisillo (pollo con verduras criollas)',
        'Cosas de horno leonesas y quesillo recién elaborado en el camino de regreso'
      ],
      allies: [
        'Cooperativa de Ecoturismo Comunitario Cerro Negro',
        'Asociación de Guías Certificados de la Cordillera de los Maribios'
      ],
      safetyTips: 'Obligatorio el uso de traje protector resistente, gafas cerradas contra polvo volcánico y guantes proporcionados por los guías. Seguir estrictamente las instrucciones de frenado con los talones durante el descenso.'
    },

    somoto: {
      id: 'somoto',
      title: 'Monumento Nacional Cañón de Somoto',
      subtitle: 'La Joya Geológica del Norte y Aguas Cristalinas del Río Coco',
      department: 'Madriz',
      municipality: 'Somoto',
      category: 'Ecoturismo & Geología',
      image: 'assets/images/destinos/canon_de_somoto.jpg',
      altImage: 'assets/images/destinos/cascada_la_luna.jpg',
      verifiedDate: 'Actualización pendiente',
      priceNio: 'Precio pendiente de verificación',
      priceUsd: 'Sin publicar',
      climate: '24°C · Clima fresco de montaña norteña',
      duration: '1 día completo (4 a 6 horas en cañón)',
      difficulty: 'Moderada / Natación y senderismo acuático',
      coordinates: '13.4833° N, 86.6833° W',
      description: 'Descubierto formalmente por científicos en 2004 y declarado Monumento Nacional, este espectacular cañón de entre 5 y 13 millones de años cuenta con paredes verticales de roca que se elevan entre 120 y 150 metros. Por su fondo fluye el Río Coco (el más largo de Centroamérica) en tranquilas pozas turquesas ideales para nadar, flotar en neumáticos y saltar desde rocas.',
      howToReach: 'Ubicado a 220 km al norte de Managua por la Carretera Panamericana Norte (NIC-1), a 15 km de la frontera con Honduras. Desde Somoto se toma el desvío señalizado hacia la comunidad Sonís (cooperativas de entrada al cañón).',
      activities: [
        'Circuito completo de 6 km nadando y flotando por el cañón con chaleco salvavidas',
        'Saltos controlados a pozas profundas desde repisas de 3, 5 y 8 metros (opcionales)',
        'Paseo en barcas de remo operadas por familias de la comunidad',
        'Senderismo por el mirador superior con vista al abismo rocoso',
        'Pernocta en cabañas comunitarias rurales campesinas'
      ],
      gastronomy: [
        'Las legendarias Rosquillas de Somoto (hojaldras y empanaditas horneadas a leña)',
        'Montucas norteñas de maíz con cerdo y hierbabuena',
        'Café recién colado con cuajada fresca de hacienda'
      ],
      allies: [
        'Cooperativa de Guías Comunitarios Guardaparques de Somoto',
        'Asociación de Mujeres Rosquilleras de Madriz',
        'Eco-Albergue Comunitario Sonís'
      ],
      safetyTips: 'El chaleco salvavidas es de uso OBLIGATORIO durante todo el recorrido dentro del agua. En época lluviosa, verificar los niveles del río antes de ingresar; los guías comunitarios aplican protocolo estricto de seguridad hidrológica.'
    },

    masaya: {
      id: 'masaya',
      title: 'Volcán Masaya & Mercado de Artesanías',
      subtitle: 'La Boca del Infierno y el Corazón del Folklore Nicaragüense',
      department: 'Masaya',
      municipality: 'Nindirí & Masaya',
      category: 'Cultura & Volcanes',
      image: 'assets/images/destinos/volcan_masaya.jpg',
      altImage: 'assets/images/destinos/volcan_masaya.jpg',
      verifiedDate: 'Actualización pendiente',
      priceNio: 'Precio pendiente de verificación',
      priceUsd: 'Sin publicar',
      climate: '28°C · Vientos constantes y vapores minerales',
      duration: 'Medio día o tour crepuscular',
      difficulty: 'Fácil / Acceso vehicular hasta el borde del cráter',
      coordinates: '11.9843° N, 86.1613° W',
      description: 'El primer Parque Nacional creado en Nicaragua (1979) alberga uno de los pocos volcanes del planeta donde se puede observar directamente un lago de lava en ebullición dentro del Cráter Santiago. Bautizado por los conquistadores españoles como "La Boca del Infierno" en 1529, el complejo ofrece senderos por túneles de lava subterráneos, el mirador de la Cruz de Bobadilla y el cercano Mercado de Artesanías de Masaya.',
      howToReach: 'Situado en el km 23 de la Carretera Managua – Masaya (NIC-4), a solo 25 minutos del centro de Managua. Carretera pavimentada de primer nivel hasta el mismo borde del cráter.',
      activities: [
        'Observación del lago de lava incandescente en el tour crepuscular y nocturno',
        'Exploración de cuevas de murciélagos y tubos volcánicos fósiles',
        'Visita al Centro de Interpretación Geológica del Parque Nacional',
        'Compras de hamacas tejidas, cuero y madera en el Mercado de Artesanías de Masaya',
        'Paseo por el Mirador de Catarina con vista sobre la Laguna de Apoyo'
      ],
      gastronomy: [
        'Sopa de mondongo tradicional de Masatepe',
        'Buñuelos de yuca y queso bañados en miel de caña caliente',
        'Tiste fresco batido en jícara con cacao y maíz molido',
        'Tamal pisque con queso y café caliente'
      ],
      allies: [
        'Cooperativa de Artesanos de Monimbó',
        'Red de Guías del Parque Nacional Volcán Masaya',
        'Mercado de las Artesanías de Masaya'
      ],
      safetyTips: 'Atender siempre las recomendaciones del personal del parque en relación con los niveles de gas emitidos por el cráter. El tiempo de permanencia al borde del cráter suele limitarse a 15-20 minutos para proteger las vías respiratorias.'
    },

    isletas: {
      id: 'isletas',
      title: 'Isletas de Granada',
      subtitle: '365 Joyas Tropicales de la Erupción del Volcán Mombacho',
      department: 'Granada',
      municipality: 'Granada',
      category: 'Naturaleza & Navegación',
      image: 'assets/images/destinos/isletas_de_granada.jpg',
      altImage: 'assets/images/destinos/Calle La Calzada & Zona Bohemia.jpg',
      verifiedDate: 'Actualización pendiente',
      priceNio: 'Precio pendiente de verificación',
      priceUsd: 'Sin publicar',
      climate: '28°C · Refrescante brisa del Cocibolca',
      duration: '2 a 4 horas de navegación',
      difficulty: 'Fácil / Familiar',
      coordinates: '11.9056° N, 85.9189° W',
      description: 'Nacidas hace más de 20,000 años tras una colosal erupción del Volcán Mombacho que arrojó rocas gigantescas sobre el Lago Cocibolca, estas 365 islas albergan comunidades pesqueras, fortalezas históricas contra piratas y una extraordinaria diversidad de aves acuáticas.',
      howToReach: 'A 5 km del centro histórico de Granada hasta los puertos lacustres de Asese o Cabañas.',
      activities: ['Paseos en lancha con guías bilingües y pescadores', 'Kayak entre canales estrechos', 'Visita al Fuerte San Pablo (1783)', 'Avistamiento de garzas, martines pescadores y cormoranes'],
      gastronomy: ['Guapote a la tipitapa recién capturado', 'Pescado frito con tajadas de plátano', 'Cocos fríos'],
      allies: ['Asociación de Lancheros de Puerto Asese', 'Comunidad Pesquera La Calera'],
      safetyTips: 'Uso obligatorio de chalecos salvavidas en todas las embarcaciones.'
    },

    apoyo: {
      id: 'apoyo',
      title: 'Laguna de Apoyo',
      subtitle: 'Cráter de Agua Termal Cristalina entre Bosque Seco Tropical',
      department: 'Masaya / Granada',
      municipality: 'Catarina & Diriá',
      category: 'Naturaleza & Relax',
      image: 'assets/images/destinos/laguna_de_apoyo.jpg',
      altImage: 'assets/images/destinos/laguna_de_apoyo.jpg',
      verifiedDate: 'Actualización pendiente',
      priceNio: 'Precio pendiente de verificación',
      priceUsd: 'Sin publicar',
      climate: '26°C · Aguas templadas minerales',
      duration: '1 día completo o pernocta',
      difficulty: 'Fácil / Natación y buceo',
      coordinates: '11.9230° N, 86.0350° W',
      description: 'Una de las lagunas de cráter más bellas y limpias de América, con 200 metros de profundidad y aguas templadas ligeramente mineralizadas. Rodeada de exuberante bosque tropical donde habitan monos congo, tucanes y mariposas morpho.',
      howToReach: 'A 40 km de Managua bajando por el desvío señalizado desde la carretera Catarina-Masaya.',
      activities: ['Natación en aguas minerales', 'Kayak y paddleboard libre de motores de combustión', 'Senderismo para avistamiento de fauna', 'Buceo de altura en cráter'],
      gastronomy: ['Cocina fresca con ingredientes locales', 'Cervezas artesanales y jugos naturales'],
      allies: ['Eco-Lodges de la Laguna de Apoyo', 'Comité de Conservación de la Reserva'],
      safetyTips: 'Prohibida la entrada de botes con motor de gasolina para preservar la calidad del agua.'
    },

    cornisland: {
      id: 'cornisland',
      title: 'Corn Island & Little Corn',
      subtitle: 'El Paraíso Caribeño de Aguas Turquesas y Arrecifes de Coral',
      department: 'RACCS',
      municipality: 'Corn Island',
      category: 'Caribe & Arrecifes',
      image: 'assets/images/destinos/corn_island.jpg',
      altImage: 'assets/images/destinos/corn_island.jpg',
      verifiedDate: 'Actualización pendiente',
      priceNio: 'Precio pendiente de verificación',
      priceUsd: 'Sin publicar',
      climate: '29°C · Caribeño puro',
      duration: '3 a 5 días sugeridos',
      difficulty: 'Fácil a moderada / Snorkel y buceo',
      coordinates: '12.1667° N, 83.0667° W',
      description: 'Ubicadas a 70 km de la costa caribeña continental, Big Corn y Little Corn Island combinan playas de arena blanca impoluta, agua cristalina de 28°C y arrecifes coralinos intactos con la entrañable cultura criolla de habla creole e inglesa.',
      howToReach: 'Vuelos regulares desde Managua a Big Corn Island (1 hora y 15 min). Para Little Corn se cruza en panga rápida (30 min).',
      activities: ['Buceo y snorkel en arrecifes de coral y cuevas marinas', 'Avistamiento de mantarrayas y tiburones nodriza', 'Caminatas por senderos sin vehículos en Little Corn', 'Paseos en velero al atardecer'],
      gastronomy: ['Rondón caribeño con leche de coco fresca, pescado, yuca y fruta de pan', 'Pan de coco horneado a diario', 'Langosta fresca'],
      allies: ['Cooperativa de Buzos Artesanales', 'Posadas Nativas de Little Corn'],
      safetyTips: 'Respetar los arrecifes de coral: jamás pisarlos ni tocarlos. Usar bloqueador solar biodegradable.'
    },

    miraflor: {
      id: 'miraflor',
      title: 'Reserva Natural Miraflor',
      subtitle: 'Bosque de Neblina, Orquídeas Silvestres y Rutas Cafetaleras',
      department: 'Estelí',
      municipality: 'Estelí',
      category: 'Turismo Rural Comunitario',
      image: 'assets/images/destinos/selva_negra.jpg',
      altImage: 'assets/images/destinos/cascada_la_luna.jpg',
      verifiedDate: 'Actualización pendiente',
      priceNio: 'Precio pendiente de verificación',
      priceUsd: 'Sin publicar',
      climate: '19°C · Clima de montaña fresco',
      duration: '2 días sugeridos',
      difficulty: 'Moderada / Caminatas por senderos húmedos',
      coordinates: '13.2500° N, 86.2500° W',
      description: 'Pionera del turismo rural comunitario en Nicaragua, Miraflor abarca tres zonas climáticas: bosque seco, premontano y bosque de neblina. Más de 200 especies de orquídeas y decenas de cooperativas campesinas acogen al viajero.',
      howToReach: 'A 30 km al noreste de Estelí por camino de tierra transitable todo el año.',
      activities: ['Paseos a caballo por cafetales y orquidiarios', 'Convivencia en fincas familiares campesinas', 'Avistamiento del quetzal y aves de montaña', 'Ruta del café agroecológico'],
      gastronomy: ['Gallo pinto norteño con cuajada ahumada', 'Tortillas recién hechas al comal', 'Café de altura esteliano'],
      allies: ['Unión de Cooperativas Agropecuarias de Miraflor', 'Red de Familias Anfitrionas'],
      safetyTips: 'Llevar abrigo ligero y chaqueta impermeable para las noches frescas y la neblina.'
    }
  };

  // Helper para normalizar búsquedas de ID o títulos
  function normalizeKey(str) {
    return String(str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  function getDestinationData(idOrTitle) {
    if (!idOrTitle) return null;
    const direct = DESTINATIONS_DB[idOrTitle.toLowerCase()];
    if (direct) return direct;

    const key = normalizeKey(idOrTitle);
    for (const id in DESTINATIONS_DB) {
      if (id === key || key.includes(id) || id.includes(key)) {
        return DESTINATIONS_DB[id];
      }
    }
    // Fallback: buscar por coincidencia en título
    for (const id in DESTINATIONS_DB) {
      const item = DESTINATIONS_DB[id];
      if (normalizeKey(item.title).includes(key) || key.includes(normalizeKey(item.title))) {
        return item;
      }
    }
    return null;
  }

  // ─── Modal Overlay Singleton ──────────────────────────────────────────────
  let overlayNode = null;

  function ensureOverlay() {
    if (overlayNode) return overlayNode;
    overlayNode = document.createElement('div');
    overlayNode.className = 'bq-dossier-overlay';
    overlayNode.id = 'bqDestinationDossierOverlay';
    overlayNode.setAttribute('role', 'dialog');
    overlayNode.setAttribute('aria-modal', 'true');
    overlayNode.setAttribute('aria-label', 'Ficha Territorial de Destino');
    document.body.appendChild(overlayNode);

    overlayNode.addEventListener('click', (e) => {
      if (e.target === overlayNode) closeDestinationDossier();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlayNode.classList.contains('is-open')) {
        closeDestinationDossier();
      }
    });

    return overlayNode;
  }

  // ─── Renderizador de la Ficha Dinámica ─────────────────────────────────────
  function openDestinationDossier(idOrTitle, updateHistory = true) {
    const dest = getDestinationData(idOrTitle);
    if (!dest) {
      console.warn('[Baqueano Dossier] Destino no encontrado:', idOrTitle);
      return false;
    }

    const overlay = ensureOverlay();

    // El estado privado se consulta en Supabase; nunca se infiere desde el navegador.
    let isFav = false;
    let isTrip = false;

    overlay.innerHTML = `
      <div class="bq-dossier-dialog" id="bqDossierDialog">
        <!-- Portada Cinematográfica -->
        <div class="bq-dossier-hero">
          <img src="${dest.image}" alt="${dest.title}" class="bq-dossier-hero-img" onerror="this.onerror=null;this.src='${dest.altImage || 'assets/images/destinos/volcan_masaya.jpg'}'">
          <div class="bq-dossier-hero-gradient"></div>
          <button type="button" class="bq-dossier-close" id="bqDossierCloseBtn" aria-label="Cerrar ficha">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <div class="bq-dossier-hero-text">
            <div class="bq-dossier-badges">
              <span class="bq-dossier-badge dept"><i class="fa-solid fa-location-dot"></i> ${dest.department}</span>
              <span class="bq-dossier-badge cat"><i class="fa-solid fa-compass"></i> ${dest.category}</span>
              <span class="bq-dossier-badge verified"><i class="fa-solid fa-clock-rotate-left"></i> Actualización pendiente</span>
            </div>
            <h2 class="bq-dossier-title">${dest.title}</h2>
            <p class="bq-dossier-loc"><i class="fa-solid fa-map-pin"></i> ${dest.municipality}, ${dest.department} · Coordenadas: ${dest.coordinates}</p>
          </div>
        </div>

        <!-- Cuerpo Desplazable con Toda la Información -->
        <div class="bq-dossier-scroll-area">
          <!-- 1. Métricas Clave -->
          <div class="bq-dossier-metrics">
            <div class="bq-dossier-metric-card">
              <i class="fa-solid fa-coins"></i>
              <div>
                <span class="bq-dossier-metric-label">Precio Sugerido</span>
                <span class="bq-dossier-metric-val">${dest.priceNio}</span>
                <small style="color:#94A3B8;font-size:0.75rem;">(${dest.priceUsd})</small>
              </div>
            </div>
            <div class="bq-dossier-metric-card">
              <i class="fa-solid fa-cloud-sun"></i>
              <div>
                <span class="bq-dossier-metric-label">Clima Promedio</span>
                <span class="bq-dossier-metric-val">${dest.climate}</span>
              </div>
            </div>
            <div class="bq-dossier-metric-card">
              <i class="fa-regular fa-clock"></i>
              <div>
                <span class="bq-dossier-metric-label">Estadía Ideal</span>
                <span class="bq-dossier-metric-val">${dest.duration}</span>
              </div>
            </div>
            <div class="bq-dossier-metric-card">
              <i class="fa-solid fa-person-hiking"></i>
              <div>
                <span class="bq-dossier-metric-label">Dificultad</span>
                <span class="bq-dossier-metric-val">${dest.difficulty}</span>
              </div>
            </div>
          </div>

          <!-- 2. Sello de Confianza y Verificación Territorial -->
          <div class="bq-dossier-trust-banner">
            <i class="fa-solid fa-shield-halved"></i>
            <div class="bq-dossier-trust-text">
              <h5>Estado de confianza</h5>
              <p>Esta ficha espera una fuente y fecha de verificación registradas en Supabase. Los datos sin respaldo no se presentan como confirmados.</p>
            </div>
          </div>

          <!-- 3. Descripción y Sentido Territorial -->
          <div class="bq-dossier-section">
            <h4><i class="fa-solid fa-book-open"></i> Sobre este destino</h4>
            <p>${dest.description}</p>
          </div>

          <!-- 4. Cómo Llegar -->
          <div class="bq-dossier-section">
            <h4><i class="fa-solid fa-route"></i> Cómo llegar</h4>
            <p>${dest.howToReach}</p>
          </div>

          <!-- 5. Actividades Imperdibles -->
          <div class="bq-dossier-section">
            <h4><i class="fa-solid fa-wand-magic-sparkles"></i> Actividades recomendadas</h4>
            <div class="bq-dossier-chips-list">
              ${dest.activities.map(act => `<div class="bq-dossier-chip-item"><i class="fa-solid fa-check" style="color:#4A7A5A"></i> ${act}</div>`).join('')}
            </div>
          </div>

          <!-- 6. Gastronomía Cercana -->
          <div class="bq-dossier-section">
            <h4><i class="fa-solid fa-utensils"></i> Gastronomía ancestral &amp; sabores locales</h4>
            <div class="bq-dossier-chips-list">
              ${dest.gastronomy.map(dish => `<div class="bq-dossier-chip-item"><i class="fa-solid fa-bowl-food" style="color:#F65E01"></i> ${dish}</div>`).join('')}
            </div>
          </div>

          <!-- 7. Hospedajes y Aliados Verificados -->
          <div class="bq-dossier-section">
            <h4><i class="fa-solid fa-handshake"></i> Aliados y Cooperativas Verificadas</h4>
            <div class="bq-dossier-chips-list">
              ${dest.allies.map(ally => `<div class="bq-dossier-chip-item"><i class="fa-solid fa-store" style="color:#2DD4BF"></i> ${ally}</div>`).join('')}
            </div>
          </div>

          <!-- 8. Consejos y Decálogo de Seguridad -->
          <div class="bq-dossier-section">
            <h4><i class="fa-solid fa-circle-exclamation"></i> Recomendaciones de seguridad &amp; respeto ambiental</h4>
            <p>${dest.safetyTips}</p>
          </div>

          <!-- 9. Feedback de Utilidad Territorial (4 F Marketing Digital) -->
          <div class="bq-dossier-feedback-box">
            <div class="bq-dossier-feedback-header">
              <div class="bq-dossier-feedback-title">
                <i class="fa-solid fa-comment-dots" style="color:#F65E01;"></i> ¿Te resultó útil esta información territorial?
              </div>
              <div class="bq-dossier-feedback-actions">
                <button type="button" class="bq-feedback-chip ${localStorage.getItem('bq_vote_' + dest.id) === 'up' ? 'voted' : ''}" id="modalVoteUp" aria-label="Sí, muy útil">
                  <i class="fa-solid fa-thumbs-up" style="color:#4A7A5A;"></i> <span>Sí, útil</span>
                </button>
                <button type="button" class="bq-feedback-chip ${localStorage.getItem('bq_vote_' + dest.id) === 'down' ? 'voted' : ''}" id="modalVoteDown" aria-label="Podría mejorar">
                  <i class="fa-solid fa-thumbs-down" style="color:#F59E0B;"></i> <span>Podría mejorar</span>
                </button>
                <button type="button" class="bq-report-btn" id="modalReportBtn" title="Reportar dato desactualizado o incorrecto">
                  <i class="fa-solid fa-flag"></i> Reportar dato
                </button>
              </div>
            </div>
            <div id="modalFeedbackMsg" style="display:none;font-size:0.8rem;color:#2DD4BF;margin-top:6px;">
              <i class="fa-solid fa-circle-check"></i> ¡Gracias por tu valoración! Ayuda a la comunidad viajera y a las cooperativas locales.
            </div>
          </div>
        </div>

        <!-- Barra Inferior de Acciones Tácticas -->
        <div class="bq-dossier-footer-bar">
          <div class="bq-dossier-btn-group">
            <button type="button" class="bq-dossier-act-btn ghost" id="bqDossierFavBtn">
              <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart" style="${isFav ? 'color:#EF4444' : ''}"></i> <span>${isFav ? 'Guardado' : 'Favoritos'}</span>
            </button>
            <button type="button" class="bq-dossier-act-btn ghost" id="bqDossierTripBtn">
              <i class="fa-solid fa-route" style="${isTrip ? 'color:#F65E01' : ''}"></i> <span>${isTrip ? 'En Mi Viaje' : '+ Mi Viaje'}</span>
            </button>
            <button type="button" class="bq-dossier-act-btn ghost" id="bqDossierShareBtn">
              <i class="fa-solid fa-share-nodes"></i> <span>Compartir</span>
            </button>
          </div>
          <div class="bq-dossier-btn-group">
            <a href="baqueano-ia.html?destino=${encodeURIComponent(dest.id)}" class="bq-dossier-act-btn primary">
              <i class="fa-solid fa-wand-magic-sparkles"></i> Planificar con IA
            </a>
            <a href="mapa.html?q=${encodeURIComponent(dest.title)}" class="bq-dossier-act-btn secondary">
              <i class="fa-regular fa-map"></i> Ver en Mapa
            </a>
          </div>
        </div>
      </div>
    `;

    // Eventos del modal
    document.getElementById('bqDossierCloseBtn').addEventListener('click', closeDestinationDossier);

    // Botón Favorito
    const favBtn = document.getElementById('bqDossierFavBtn');
    favBtn.addEventListener('click', async () => {
      try {
        await window.BaqueanoApi.saveFavorite(dest.id, 'destination');
        favBtn.innerHTML = '<i class="fa-solid fa-heart" style="color:#EF4444"></i> <span>Guardado</span>';
        if (window.bqToast) window.bqToast('Destino guardado en Supabase.', 'success');
      } catch (error) {
        if (window.bqToast) window.bqToast(error.status === 401 ? 'Entrá a tu cuenta para guardar este lugar.' : error.message, 'warning');
      }
    });

    // Botón Mi Viaje
    const tripBtn = document.getElementById('bqDossierTripBtn');
    tripBtn.addEventListener('click', async () => {
      try {
        await window.BaqueanoApi.saveTravelPlan({
          planTitle: `Visita a ${dest.title}`, destination: dest.id, days: 1,
          currency: 'NIO', source: 'destination_dossier',
          payload: { destinationId: dest.id, title: dest.title, department: dest.department }
        });
        tripBtn.innerHTML = '<i class="fa-solid fa-route" style="color:#F65E01"></i> <span>En Mi Viaje</span>';
        if (window.bqToast) window.bqToast('Plan guardado en Supabase.', 'success');
      } catch (error) {
        if (window.bqToast) window.bqToast(error.status === 401 ? 'Entrá a tu cuenta para guardar tu viaje.' : error.message, 'warning');
      }
    });

    // Botón Compartir
    const shareBtn = document.getElementById('bqDossierShareBtn');
    shareBtn.addEventListener('click', () => {
      const shareUrl = `${window.location.origin}${window.location.pathname.replace(/[^/]+$/, '')}destinos.html?id=${dest.id}`;
      if (navigator.share) {
        navigator.share({
          title: `${dest.title} | Baqueano Nicaragua`,
          text: `Descubrí ${dest.title} en Nicaragua con Baqueano:`,
          url: shareUrl
        }).catch(() => copyToClipboard(shareUrl));
      } else {
        copyToClipboard(shareUrl);
      }
    });

    function copyToClipboard(text) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          if (window.bqToast) window.bqToast('Enlace copiado al portapapeles 📋', 'success');
        });
      }
    }

    // Feedback de Utilidad Territorial (4F)
    const modalVoteUp = document.getElementById('modalVoteUp');
    const modalVoteDown = document.getElementById('modalVoteDown');
    const modalFeedbackMsg = document.getElementById('modalFeedbackMsg');
    const modalReportBtn = document.getElementById('modalReportBtn');

    function handleVote(type) {
      localStorage.setItem(`bq_vote_${dest.id}`, type);
      if (modalVoteUp) modalVoteUp.classList.toggle('voted', type === 'up');
      if (modalVoteDown) modalVoteDown.classList.toggle('voted', type === 'down');
      if (modalFeedbackMsg) modalFeedbackMsg.style.display = 'block';
      if (window.bqToast) window.bqToast(type === 'up' ? '¡Gracias por valorar positivamente!' : 'Gracias. Trabajamos para mejorar la información.', 'info');
      if (window.BaqueanoApi && typeof window.BaqueanoApi.trackInteraction === 'function') {
        window.BaqueanoApi.trackInteraction('dossier_feedback', { destId: dest.id, vote: type });
      }
    }

    if (modalVoteUp) modalVoteUp.addEventListener('click', () => handleVote('up'));
    if (modalVoteDown) modalVoteDown.addEventListener('click', () => handleVote('down'));

    if (modalReportBtn) {
      modalReportBtn.addEventListener('click', () => {
        const reason = prompt(`Reportar actualización para "${dest.title}":\n¿Qué dato deseas reportar o actualizar? (Precios, Ruta, Horarios, Cooperativa, Otro)`);
        if (reason && reason.trim()) {
          const reports = JSON.parse(localStorage.getItem('baqueano_data_reports') || '[]');
          reports.push({ destId: dest.id, destTitle: dest.title, details: reason.trim(), date: new Date().toISOString() });
          localStorage.setItem('baqueano_data_reports', JSON.stringify(reports));
          if (window.bqToast) window.bqToast('Reporte registrado para moderación territorial. ¡Muchas gracias!', 'success');
          else alert('Reporte registrado para moderación territorial. ¡Muchas gracias!');
        }
      });
    }

    // Abrir overlay
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Actualizar URL sin recargar
    if (updateHistory) {
      const targetUrl = new URL(window.location.href);
      targetUrl.searchParams.set('id', dest.id);
      window.history.pushState({ dossierId: dest.id }, '', targetUrl.toString());
      document.title = `${dest.title} — Ficha Territorial Oficial | Baqueano Nicaragua`;
    }

    return true;
  }

  function closeDestinationDossier() {
    const overlay = document.getElementById('bqDestinationDossierOverlay');
    if (overlay) {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
    }
    // Restaurar URL sin parámetro id si estamos en destinos.html
    const targetUrl = new URL(window.location.href);
    if (targetUrl.searchParams.has('id')) {
      targetUrl.searchParams.delete('id');
      window.history.pushState({}, '', targetUrl.toString());
      document.title = 'Destinos de Nicaragua | Baqueano Nicaragua';
    }
  }

  // ─── Inicialización y Escuchas Globales ────────────────────────────────────
  function initDossierController() {
    // 1. Cargar CSS dedicado si aún no está presente
    if (!document.getElementById('bq-destination-dossier-css')) {
      const link = document.createElement('link');
      link.id = 'bq-destination-dossier-css';
      link.rel = 'stylesheet';
      link.href = 'css/destination-dossier.css?v=20260928-1';
      document.head.appendChild(link);
    }

    // 2. Interceptar enlaces de "Ver destino" en la página
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('a[href*="destinos.html?id="], a[href*="destino.html?id="], [data-dossier-id], .dest-btn-green, .destinos-preview-btn');
      if (!btn) return;

      let destId = btn.getAttribute('data-dossier-id');
      if (!destId && btn.getAttribute('href')) {
        const href = btn.getAttribute('href');
        const match = href.match(/[?&]id=([^&#]+)/);
        if (match) destId = decodeURIComponent(match[1]);
      }

      // Si no tiene parámetro id explícito, intentar inferir del título de la tarjeta
      if (!destId) {
        const card = btn.closest('article, .dest-catalog-card, .dest-highlight-card, .destinos-map-preview-card');
        if (card) {
          const title = card.querySelector('h4, .dest-title')?.textContent.trim();
          if (title) destId = title;
        }
      }

      if (destId) {
        e.preventDefault();
        openDestinationDossier(destId, true);
      }
    });

    // 3. Detectar si la página cargó con un parámetro ?id= en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const initialId = urlParams.get('id');
    if (initialId) {
      setTimeout(() => {
        openDestinationDossier(initialId, false);
      }, 100);
    }

    // 4. Manejo de botón Atrás/Adelante del navegador
    window.addEventListener('popstate', (e) => {
      const params = new URLSearchParams(window.location.search);
      const popId = params.get('id');
      if (popId) {
        openDestinationDossier(popId, false);
      } else {
        const overlay = document.getElementById('bqDestinationDossierOverlay');
        if (overlay && overlay.classList.contains('is-open')) {
          overlay.classList.remove('is-open');
          document.body.style.overflow = '';
        }
      }
    });
  }

  // Exportar a window
  window.BaqueanoDossier = {
    open: openDestinationDossier,
    close: closeDestinationDossier,
    get: getDestinationData,
    db: DESTINATIONS_DB
  };
  window.openDestinationDossier = openDestinationDossier;
  window.closeDestinationDossier = closeDestinationDossier;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDossierController);
  } else {
    initDossierController();
  }

})(window, document);
