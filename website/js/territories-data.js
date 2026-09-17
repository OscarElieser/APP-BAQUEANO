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
    tagline: 'Tierra de Cañones Milenarios y Rosquillas Doradas',
    shortDesc: 'Madriz es la puerta geológica del norte de Nicaragua. Destaca por el imponente Monumento Nacional Cañón de Somoto, sus comunidades artesanas de rosquillas de maíz y su clima fresco segoviano.',
    history: 'Creado en 1936 en honor al presidente José Madriz, este territorio fue esculpido ancestralmente por las aguas sagradas del Río Coco (Wangki). En sus serranías habitaron comunidades indígenas chorotegas y es escenario de la memoria viva de la defensa soberana.',
    gastronomy: [
      { name: 'Rosquillas de Somoto', desc: 'Horneadas en hornos de barro con maíz blanco, queso criollo y mantequilla de hacienda.' },
      { name: 'Gorditas de Maíz', desc: 'Masa dulce tradicional rellena de cuajada fresca.' },
      { name: 'Montucas Madricenses', desc: 'Tamal de maíz tierno condimentado con pollo y hierbabuena.' },
      { name: 'Café de Estricta Altura', desc: 'Cultivado bajo sombra en las microcuencas de San Juan de Río Coco.' }
    ],
    places: [
      { name: 'Monumento Nacional Cañón de Somoto', type: 'Geositio / Aventura', icon: 'fa-water' },
      { name: 'Talleres Tradicionales de Rosquillas', type: 'Ruta Gastronómica', icon: 'fa-bread-slice' },
      { name: 'Mirador La Cruz de Somoto', type: 'Panorámica', icon: 'fa-mountain' },
      { name: 'Reserva Natural Tepesomoto-La Pataste', type: 'Bosque Nuboso', icon: 'fa-tree' },
      { name: 'Pueblo Alfarero de Ducualí', type: 'Artesanía en Barro', icon: 'fa-palette' }
    ],
    activities: [
      'Navegación en lancha y natación con chaleco por el Cañón de Somoto',
      'Senderismo de interpretación geológica con baqueanos locales',
      'Ruta vivencial del maíz y elaboración artesanal de rosquillas',
      'Avistamiento de aves en los pinares de San Lucas y Las Sabanas',
      'Fotografía de caídas de agua y pozas de aguas cristalinas'
    ],
    culture: 'Famoso por su música de polkas y mazurcas campesinas interpretadas con guitarras de cedro y violín de talalate. Celebran en julio las fiestas de Santiago Apóstol y la feria del maíz.',
    bestSeason: 'Noviembre a mayo para navegación óptima del cañón con aguas calmas y senderos secos.',
    howToReach: 'Desde Managua por la Carretera Panamericana Norte (NIC-1) pasando por Estelí hacia Somoto (216 km, aprox. 3.5 horas). Terminal de buses en El Mayoreo.',
    recommendations: 'Llevar calzado para agua que no resbale, protector solar biodegradable, ropa de cambio impermeable y comprar directo a las cooperativas de rosquilleras.',
    heroImage: 'assets/images/destinos/canon_de_somoto.jpg',
    lat: 13.4775,
    lng: -86.5800,
    coopCount: 14
  },
  {
    id: 'leon',
    name: 'León',
    tagline: 'Historia, Volcanes y Playas en un Solo Destino',
    shortDesc: 'León es la capital histórica y universitaria de Nicaragua. Cautiva por su arquitectura barroca colonial, la insigne Catedral Patrimonio de la Humanidad, volcanes activos de arena negra y costas salvajes del Pacífico.',
    history: 'Fundada en 1524 junto al lago Xolotlán y trasladada en 1610 tras las erupciones del Momotombo. Cuna de la independencia, capital del pensamiento poético con Rubén Darío y epicentro de las mayores gestas libertarias.',
    gastronomy: [
      { name: 'Cosa de Horno Leonesa', desc: 'Bocado ancestral horneado a base de harina de maíz, queso y dulce de caña.' },
      { name: 'Nacatamal Gigante', desc: 'Elaborado con maíz nitzamalizado, lomo de cerdo adobado, hierbabuena y chile congo.' },
      { name: 'Sopa de Pescado de Poneloya', desc: 'Mariscos frescos con leche de coco y verduras de huerto.' },
      { name: 'Chicha Bruja y Fresco de Ensalada', desc: 'Bebidas tradicionales fermentadas y frutales.' }
    ],
    places: [
      { name: 'Insigne Basílica Catedral de León', type: 'Patrimonio UNESCO', icon: 'fa-church' },
      { name: 'Volcán Cerro Negro', type: 'Sandboarding Extremo', icon: 'fa-volcano' },
      { name: 'Sitio Histórico Ruinas de León Viejo', type: 'Arqueología Colonial', icon: 'fa-landmark' },
      { name: 'Playa Las Peñitas & Poneloya', type: 'Surf & Atardeceres', icon: 'fa-umbrella-beach' },
      { name: 'Museo Centro de Arte Fundación Ortiz-Gurdián', type: 'Arte Iberoamericano', icon: 'fa-palette' }
    ],
    activities: [
      'Volcano boarding a 70 km/h sobre las arenas negras del Cerro Negro',
      'Caminata sobre los techos blancos de la Catedral de León',
      'Surf y liberación de tortuguillos en la Reserva Isla Juan Venado',
      'Tour nocturno de mitos y leyendas por el barrio indígena de Sutiaba',
      'Ruta de murales revolucionarios y museos históricos'
    ],
    culture: 'Cultura poética y devocional. Famoso por "La Gritería" del 7 de diciembre en honor a la Purísima, las gigantonas de Sutiaba con el enano cabezón y alfombras pasionarias de aserrín.',
    bestSeason: 'Diciembre a abril para días soleados en la playa y ascenso despejado a los volcanes.',
    howToReach: 'Desde Managua por la Carretera Nueva a León (NIC-12), 90 km (1.5 horas). Transporte fluido y constante desde la terminal de la UCA y Mercado Israel Lewites.',
    recommendations: 'Ropa ligera de algodón, abundante hidratación para el calor de occidente, gafas de protección para el sandboarding y sombrero de ala ancha.',
    heroImage: 'assets/images/destinos/cerro_negro.jpg',
    lat: 12.5063,
    lng: -86.7017,
    coopCount: 22
  },
  {
    id: 'rivas',
    name: 'Rivas',
    tagline: 'Oasis de Fuego y Agua: Ometepe y Playas del Pacífico',
    shortDesc: 'Rivas es el istmo privilegiado entre el Gran Lago de Nicaragua y el Océano Pacífico. Hogar de la mágica Isla de Ometepe con dos volcanes colosales y las mejores rompientes de surf de Centroamérica.',
    history: 'Territorio de los pueblos originarios Nicaraos y Niquiranos que pactaron con el cacique Nicaragua. Testigo de la gesta heroica de Emmanuel Mongalo y puerta de la histórica Ruta del Tránsito marítima del siglo XIX.',
    gastronomy: [
      { name: 'Guapote Deshuesado al Ajo', desc: 'Pez fresco del Gran Lago cocinado al término con tostones de plátano.' },
      { name: 'Parrillada de Mariscos de San Juan del Sur', desc: 'Langosta, camarones y calamares a la brasa.' },
      { name: 'Cajetas de Coco y Leche de Rivas', desc: 'Dulces finos elaborados en pailas de cobre.' },
      { name: 'Vino de Flor de Jamaica de Ometepe', desc: 'Bebida artesanal producida en cooperativas agroecológicas.' }
    ],
    places: [
      { name: 'Isla de Ometepe (Concepción & Maderas)', type: 'Reserva de Biosfera', icon: 'fa-mountain-sun' },
      { name: 'Bahía de San Juan del Sur', type: 'Bahía Emblemática', icon: 'fa-anchor' },
      { name: 'Playa Maderas & Playa Gigante', type: 'Surf de Clase Mundial', icon: 'fa-water' },
      { name: 'Refugio de Vida Silvestre La Flor', type: 'Arribada de Tortugas', icon: 'fa-feather' },
      { name: 'Ojo de Agua Ometepe', type: 'Piscina Natural Mineral', icon: 'fa-droplet' }
    ],
    activities: [
      'Ascenso al cráter del Volcán Concepción y laguna del Volcán Maderas',
      'Surf en olas constantes offshore en Playa Maderas y Popoyo',
      'Avistamiento nocturno de anidación masiva de tortugas Paslama',
      'Kayak en el Río Istián entre manglares y caimanes',
      'Recorridos en bicicleta y moto alrededor de Ometepe'
    ],
    culture: 'Riqueza en petroglifos indígenas, leyendas de la sirena de Ojo de Agua, fiestas patronales de San Juan Bautista y procesiones marítimas de pescadores.',
    bestSeason: 'Diciembre a mayo para mar calmo y senderos despejados; de julio a enero para el espectáculo de desove de tortugas marinas.',
    howToReach: 'Por la Carretera Panamericana Sur (NIC-2) desde Managua hasta Rivas (110 km). Ferry regular desde el puerto de San Jorge hacia Ometepe.',
    recommendations: 'Alquilar transporte 4x4 o moto para recorrer las playas de Tola, no tocar a las tortugas en los desoves y apoyar posadas campesinas comunitarias.',
    heroImage: 'assets/images/destinos/isla_de_ometepe.jpg',
    lat: 11.5206,
    lng: -85.5700,
    coopCount: 30
  },
  {
    id: 'jinotega',
    name: 'Jinotega',
    tagline: 'La Ciudad de las Brumas, Cascadas y Café de Altura',
    shortDesc: 'Jinotega es el gigante montañoso del norte, rodeado de niebla perpetua, ríos caudalosos, el Lago de Apanás y las fincas donde nace el café más premiado de Nicaragua.',
    history: 'Tierra de indomables guerreros jiñocabos y matagalpas. En sus cumbres se organizaron las cooperativas del norte y las gestas del Ejército Defensor de Sandino.',
    gastronomy: [
      { name: 'Café SHG de Estricta Altura', desc: 'Notas de chocolate, jazmín y frutas cítricas cosechado a más de 1,400 msnm.' },
      { name: 'Güirilas con Cuajada Fresca', desc: 'Tortilla dulce de maíz tierno asada en hoja de plátano.' },
      { name: 'Agua de Loja Jinotegana', desc: 'Bebida a base de maíz hervido con jengibre y dulce de rapadura.' },
      { name: 'Sopa de Gallina India con Albóndigas', desc: 'Cocida con leña en fogones campesinos.' }
    ],
    places: [
      { name: 'Cascada La Luna & El Cuá', type: 'Nebliselva & Canopy', icon: 'fa-cloud-rain' },
      { name: 'Lago de Apanás', type: 'Humedal Ramsar', icon: 'fa-water' },
      { name: 'Peña de La Cruz', type: 'Mirador Panorámico', icon: 'fa-mountain' },
      { name: 'Reserva Natural Macizo de Peñas Blancas', type: 'Bosque Nuboso Prístino', icon: 'fa-tree' },
      { name: 'Fincas Agroecológicas de San Rafael del Norte', type: 'Ruta del Café', icon: 'fa-mug-hot' }
    ],
    activities: [
      'Canopy sobre cascadas torrenciales en El Cuá',
      'Paseos en kayak y avistamiento de aves en el Lago de Apanás',
      'Senderismo extremo en las murallas de Peñas Blancas',
      'Cata profesional de café en cooperativas cafetaleras',
      'Subida de los 800 escalones a la Peña de La Cruz'
    ],
    culture: 'Música campirana de polkas y mazurcas del grupo Soñadores de Saraguasca. Devoción a la Virgen de la Merced y memoria viva del Siervo de Dios Fray Odorico D’Andrea.',
    bestSeason: 'Noviembre a marzo durante la cosecha cafetalera y festividades navideñas de montaña.',
    howToReach: 'Por la Carretera Panamericana Norte hasta Matagalpa y luego ascenso por la NIC-3 hacia Jinotega (142 km desde Managua).',
    recommendations: 'Llevar abrigo para el frío de montaña, capa impermeable para la bruma, calzado con buen agarre para lodo y cámara fotográfica.',
    heroImage: 'assets/images/destinos/cascada_la_luna.jpg',
    lat: 13.3720,
    lng: -85.6900,
    coopCount: 26
  },
  {
    id: 'masaya',
    name: 'Masaya',
    tagline: 'Cuna del Folklore, Volcán Activo y Tradición Ancestral',
    shortDesc: 'Masaya es el corazón de la identidad artesanal y folclórica nicaragüense. Alberga el impresionante lago de lava del Volcán Masaya, la laguna de Apoyo y los Pueblos Blancos.',
    history: 'Asiento milenario de los bravos guerreros de Dirién y Monimbó, quienes resistieron con heroísmo a los invasores y forjaron una tradición artesanal inquebrantable.',
    gastronomy: [
      { name: 'Vigorón Criollo de Masaya', desc: 'Yuca cocida suave con chicharrón crocante y ensalada de repollo con vinagre de guineo.' },
      { name: 'Perrerengue de Maíz', desc: 'Torta horneada con maíz y queso añejo.' },
      { name: 'Tamuga de Monimbó', desc: 'Tamal ceremonial envuelto en hojas de chagüite.' },
      { name: 'Chicha de Maíz y Pinolillo', desc: 'Bebidas identitarias de los pueblos indígenas.' }
    ],
    places: [
      { name: 'Parque Nacional Volcán Masaya (Popogatepe)', type: 'Lago de Lava Activo', icon: 'fa-fire' },
      { name: 'Reserva Natural Laguna de Apoyo', type: 'Cráter de Aguas Termales', icon: 'fa-water' },
      { name: 'Mercado Nacional de Artesanías', type: 'Artesanía & Madera', icon: 'fa-store' },
      { name: 'Barrio Indígena de Monimbó', type: 'Cuna Cultural', icon: 'fa-hands-holding' },
      { name: 'Mirador de Catarina', type: 'Vista Panorámica de Apoyo', icon: 'fa-eye' }
    ],
    activities: [
      'Observación nocturna del lago de lava incandescente en el cráter Santiago',
      'Natación y buceo en las aguas termales y minerales de Laguna de Apoyo',
      'Paseo de compras de hamacas tejidas a mano y cerámica utilitaria',
      'Recorrido en carretón de caballos por los viveros florales de Catarina',
      'Talleres interactivos de marimba de arco en Monimbó'
    ],
    culture: 'La fiesta patronal más larga de Nicaragua (San Jerónimo, 3 meses). Danza del Torovenado, Ahuizotes de espantos ancestrales, bailes de negras y sones de marimba.',
    bestSeason: 'Todo el año; especialmente de septiembre a noviembre para vivir las fiestas folclóricas.',
    howToReach: 'A solo 28 km de Managua por la Carretera a Masaya (NIC-4), trayecto de 35 minutos.',
    recommendations: 'Visitar el volcán en horario nocturno con reserva previa, probar el vigorón en el parque central y adquirir hamacas hechas en Monimbó.',
    heroImage: 'assets/images/destinos/volcan_masaya.jpg',
    lat: 11.9854,
    lng: -86.1614,
    coopCount: 28
  },
  {
    id: 'granada',
    name: 'Granada',
    tagline: 'La Gran Sultana: Isletas, Mombacho y Joya Colonial',
    shortDesc: 'Granada es la ciudad colonial más antigua sobre tierra firme de América (1524). Deslumbra por sus fachadas señoriales, el archipiélago de 365 isletas del Lago Cocibolca y la selva nubosa del Volcán Mombacho.',
    history: 'Fundada por Francisco Hernández de Córdoba en 1624 a orillas del Cocibolca. Resistió ataques de piratas ingleses y franceses y renació tras el incendio provocado por William Walker en 1856.',
    gastronomy: [
      { name: 'Vigorón Granadino con Moshita', desc: 'Servido en hoja de plátano con chicharrón con carne y encurtido de mimbro.' },
      { name: 'Baho Tradicional', desc: 'Carne cecina marinada con plátano verde, maduro y yuca cocinada al vapor en hojas de plátano.' },
      { name: 'Guapote al Vapor en Salsa Tipitapa', desc: 'Pescado de lago servido con tostones crocantes.' },
      { name: 'Gramilla y Cacao con Leche', desc: 'Bebidas refrescantes coloniales servidas en jarro de barro.' }
    ],
    places: [
      { name: 'Centro Histórico & Calle La Calzada', type: 'Arquitectura Colonial', icon: 'fa-building-columns' },
      { name: 'Archipiélago de las Isletas de Granada', type: '365 Islas Volcánicas', icon: 'fa-ship' },
      { name: 'Reserva Natural Volcán Mombacho', type: 'Bosque Nuboso & Fumarolas', icon: 'fa-tree' },
      { name: 'Museo Convento San Francisco', type: 'Estatuaria Prehispánica', icon: 'fa-landmark' },
      { name: 'Iglesia y Torre de La Merced', type: 'Mirador 360°', icon: 'fa-church' }
    ],
    activities: [
      'Paseo en lancha o kayak entre las isletas y avistamiento de monos',
      'Senderismo en el cráter nuboso y canopy extremo en el Volcán Mombacho',
      'Paseo en coche tradicional de caballos por las calles coloniales',
      'Subir al campanario de La Merced al atardecer para ver toda la ciudad',
      'Vida nocturna bohemia, música en vivo y tertulias en La Calzada'
    ],
    culture: 'Festival Internacional de Poesía, procesiones de Semana Santa con alfombras florales, fiestas patronales de la Virgen de la Asunción con el tradicional tope de toros.',
    bestSeason: 'Noviembre a abril para clima despejado y brisa fresca proveniente del Lago Cocibolca.',
    howToReach: 'A 45 km de Managua por la Carretera a Masaya-Granada (NIC-4). Excelente conexión vial en 45 minutos.',
    recommendations: 'Caminar temprano por la mañana para fotografiar las fachadas coloniales, llevar calzado cómodo para empedrados y probar el café de las laderas del Mombacho.',
    heroImage: 'assets/images/destinos/hotel_dario.jpg',
    lat: 11.9298,
    lng: -85.9535,
    coopCount: 32
  },
  {
    id: 'matagalpa',
    name: 'Matagalpa',
    tagline: 'Perla del Septentrión: Nebliselva, Cacao y Guías Indígenas',
    shortDesc: 'Matagalpa es el reino del ecoturismo de montaña, los ríos de aguas frías y las reservas biológicas. Famosa por sus haciendas de cacao fino de aroma y la herencia viva de los pueblos flecheros indígenas.',
    history: 'Asiento de la heroica comunidad de indígenas flecheros de Matagalpa que jugaron un rol determinante en la Batalla de San Jacinto (1856). Territorio de pioneros del café y la conservación ambiental comunitaria.',
    gastronomy: [
      { name: 'Cacao con Leche y Canela', desc: 'Bebida densa y aromática elaborada con cacao puro cultivado en montaña.' },
      { name: 'Montucas Matagalpinas', desc: 'Masa de maíz tierno rellena con carne marinada en naranja agria.' },
      { name: 'Queso Ahumado de Muy Muy', desc: 'Queso artesanal curado con maderas de roble.' },
      { name: 'Dulces de Leche y Cajeta de Café', desc: 'Elaborados por artesanas rurales del valle.' }
    ],
    places: [
      { name: 'Reserva Silvestre Selva Negra', type: 'Bosque Nuboso & Aves', icon: 'fa-feather' },
      { name: 'Comunidad Indígena de El Chile', type: 'Tejidos Tradicionales', icon: 'fa-hands-holding' },
      { name: 'Cascada Santa Emilia', type: 'Caída de Agua Mística', icon: 'fa-water' },
      { name: 'Cerro Apante (Reserva Natural)', type: 'Senderismo de Altura', icon: 'fa-mountain' },
      { name: 'Museo Nacional del Café', type: 'Cultura Cafetalera', icon: 'fa-mug-hot' }
    ],
    activities: [
      'Senderismo de observación de quetzales y tucanes en Selva Negra',
      'Talleres vivenciales de tejido en telar de cintura en El Chile',
      'Ruta del chocolate desde la mazorca de cacao hasta la barra artesanal',
      'Bañarse bajo la cortina de la Cascada Santa Emilia',
      'Excursiones guiadas por líderes indígenas comunitarios'
    ],
    culture: 'Música de polkas y mazurcas campesinas, danzas del zopilote y devoción a San Pedro. Preservación del idioma y cosmovisión indígena matagalpa.',
    bestSeason: 'Diciembre a abril para senderismo seco; mayo a octubre para ver cascadas en su máximo caudal.',
    howToReach: 'Desde Managua por la Carretera Panamericana Norte y desvío en Sébaco hacia Matagalpa (130 km, 2 horas).',
    recommendations: 'Ropa abrigada para las noches de montaña, botas de trekking resistentes al agua y linterna para paseos nocturnos en la selva.',
    heroImage: 'assets/images/destinos/selva_negra.jpg',
    lat: 12.9980,
    lng: -85.9090,
    coopCount: 25
  },
  {
    id: 'esteli',
    name: 'Estelí',
    tagline: 'Diamante de Las Segovias: Tabaco, Cascadas y Muralismo',
    shortDesc: 'Estelí es una ciudad vibrante y productiva ubicada en una meseta protegida por pinares. Reconocida mundialmente por los mejores puros de tabaco del planeta, sus cascadas y sus murales artísticos.',
    history: 'Conocida como la "Tres Veces Heroica Ciudad", Estelí fue escenario de épicas batallas revolucionarias. Su espíritu indomable se transformó en una pujante economía agroindustrial y artística comunitaria.',
    gastronomy: [
      { name: 'Perrerengue y Tamales de El Tisey', desc: 'Maíz cosechado en alturas de 1,200 msnm con queso de monte.' },
      { name: 'Cuajada Fresca Esteliana', desc: 'Famosa por su textura mantecosa y sabor inconfundible.' },
      { name: 'Carne Asada en Brasas de Leña', desc: 'Con tortilla caliente, chimichurri y queso frito.' },
      { name: 'Café de Miraflor', desc: 'Café orgánico cultivado por cooperativas campesinas.' }
    ],
    places: [
      { name: 'Reserva Natural Tisey-La Estanzuela', type: 'Cascada & Esculturas', icon: 'fa-water' },
      { name: 'Galería de Esculturas en Piedra de Don Alberto', type: 'Arte Popular Rústico', icon: 'fa-palette' },
      { name: 'Reserva Natural Miraflor', type: 'Orquídeas & Turismo Rural', icon: 'fa-seedling' },
      { name: 'Fábricas de Puros Artesanales', type: 'Ruta del Tabaco de Alta Gama', icon: 'fa-fire' },
      { name: 'Murales Revolucionarios y Urbanos', type: 'Arte Público', icon: 'fa-brush' }
    ],
    activities: [
      'Nado en la poza natural del Salto La Estanzuela',
      'Convivencia campesina y avistamiento de más de 200 especies de orquídeas en Miraflor',
      'Visita a las esculturas talladas en roca viva en El Jalacate',
      'Tour educativo sobre el torcido a mano de puros de renombre mundial',
      'Recorrido en bicicleta de montaña por los caminos de El Tisey'
    ],
    culture: 'Ciudad de poetas, muralistas y músicos de guitarras campesinas. Fiestas en honor a la Virgen del Rosario en octubre con desfiles hípicos de gala.',
    bestSeason: 'Diciembre a mayo para caminatas al aire libre y festivales del tabaco.',
    howToReach: 'Por la Carretera Panamericana Norte (NIC-1), 148 km desde Managua (2.5 horas de trayecto en autopista asfaltada).',
    recommendations: 'Contratar guías comunitarios en Miraflor para no perderse en los senderos de neblina y apoyar la compra de artesanías de marmolina.',
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
    tagline: 'Corazón de la Nación: Xolotlán, Lagunas y El Chocoyero',
    shortDesc: 'La capital de Nicaragua combina la modernidad con reservas naturales ocultas, cráteres volcánicos urbanos como Tiscapa y las costas del Gran Lago Xolotlán.',
    history: 'Elevada a capital de la República en 1852 para dirimir las disputas entre León y Granada. Ha renacido con orgullo y resiliencia tras los terremotos de 1931 y 1972.',
    gastronomy: [
      { name: 'Nacatamal Dominical', desc: 'Envuelto en hojas de plátano con arroz, papa, cerdo, hierbabuena y pan caliente.' },
      { name: 'Carne Asada con Fritanga', desc: 'Tajadas verdes fritas, queso frito y ensalada de repollo.' },
      { name: 'Sopa de Res con Médula', desc: 'Cocida en olla de barro con elote, quequisque y yuca.' },
      { name: 'Raspados con Leche Condensada', desc: 'Hielo raspado con jarabe de piña, tamarindo y leche condensada.' }
    ],
    places: [
      { name: 'Puerto Salvador Allende & Lago Xolotlán', type: 'Malecón & Recreación', icon: 'fa-ship' },
      { name: 'Reserva Natural El Chocoyero-El Brujo', type: 'Cascadas & Chocoyos', icon: 'fa-feather' },
      { name: 'Parque Histórico Loma de Tiscapa', type: 'Laguna Cráter & Silueta de Sandino', icon: 'fa-landmark' },
      { name: 'Teatro Nacional Rubén Darío', type: 'Templo Cultural', icon: 'fa-masks-theater' },
      { name: 'Plaza de la Revolución & Antigua Catedral', type: 'Patrimonio Histórico', icon: 'fa-monument' }
    ],
    activities: [
      'Paseo en barco por el Lago Xolotlán hacia la Isla del Amor',
      'Avistamiento de miles de chocoyos verdes retornando a sus nidos en las cascadas',
      'Canopy sobre la Laguna de Tiscapa',
      'Espectáculos de danza y conciertos sinfónicos en el Teatro Rubén Darío',
      'Recorrido gastronómico nocturno en las tradicionales fritangas capitalinas'
    ],
    culture: 'Fiestas patronales de Santo Domingo de Guzmán (1 al 10 de agosto) con el baile de las vacas culonas, los diablitos y el desfile hípico más grande del país.',
    bestSeason: 'Noviembre a marzo para clima fresco y noches ventiladas.',
    howToReach: 'Centro neurálgico del país con el Aeropuerto Internacional Augusto C. Sandino (MGA) y terminales terrestres a todos los departamentos.',
    recommendations: 'Utilizar el transporte oficial o taxis recomendados, visitar El Chocoyero a las 4:00 PM para presenciar la llegada de las aves.',
    heroImage: 'assets/images/destinos/dona_haydee.jpg',
    lat: 12.1280,
    lng: -86.2650,
    coopCount: 35
  },
  {
    id: 'carazo',
    name: 'Carazo',
    tagline: 'Cuna de El Güegüense, Clima Fresco y Playas de Refugio',
    shortDesc: 'Ubicado en una meseta de clima fresco, Carazo es la cuna de la primera obra de teatro del continente. Ofrece cafetales con sombra, cascadas y playas protegidas en el Pacífico.',
    history: 'Tierra de caciques nahua-mangues. En Diriamba nació "El Güegüense o Macho Ratón", Patrimonio Oral e Intangible de la Humanidad por la UNESCO.',
    gastronomy: [
      { name: 'Masa de Cazuela (Indio Viejo Caraceño)', desc: 'Carne deshebrada con masa sazonada con naranja agria y hierbabuena.' },
      { name: 'Ajiaco Caraceño', desc: 'Guiso ancestral con hojas de quelite, jocote y piña.' },
      { name: 'Picadillo Diriambino', desc: 'Carne picada fina con verduras y especias criollas.' },
      { name: 'Buñuelos de Yuca en Miel de Caña', desc: 'Bocados crujientes bañados en almíbar de dulce.' }
    ],
    places: [
      { name: 'Basílica Menor de San Sebastián (Diriamba)', type: 'Arte Religioso & Murales', icon: 'fa-church' },
      { name: 'Centro Ecoturístico La Maquina', type: 'Cascadas & Bosque Seco', icon: 'fa-water' },
      { name: 'Refugio de Vida Silvestre Chacocente', type: 'Anidación de Tortugas', icon: 'fa-feather' },
      { name: 'Playas La Boquita & Casares', type: 'Costa & Gastronomía Marina', icon: 'fa-umbrella-beach' },
      { name: 'Fincas Cafetaleras de Jinotepe', type: 'Agroturismo', icon: 'fa-mug-hot' }
    ],
    activities: [
      'Apreciar la danza en vivo de El Güegüense y El Toro Huaco',
      'Senderismo en los senderos naturales de la cascada La Maquina',
      'Vigilia ecológica de arribada de tortugas marinas en Chacocente',
      'Paseos a caballo en las playas de La Boquita',
      'Ruta del café y cata en haciendas familiares'
    ],
    culture: 'Fiestas de San Sebastián en enero y San Marcos en abril con danzas de El Güegüense, El Toro Huaco, Las Inditas y El Viejo y la Vieja.',
    bestSeason: 'Enero a mayo para festividades patronales y mar tranquilo en la costa.',
    howToReach: 'Por la Carretera Sur (NIC-2), 45 km desde Managua (aprox. 50 minutos de viaje).',
    recommendations: 'Comer la masa de cazuela en los comedores de Diriamba, respetar los protocolos de Chacocente y llevar abrigo ligero.',
    heroImage: 'assets/images/destinos/villa_redonda.jpg',
    lat: 11.8580,
    lng: -86.2390,
    coopCount: 18
  },
  {
    id: 'chontales',
    name: 'Chontales',
    tagline: 'Tierra de los Amerriques, Petroglifos y Cultura Serrana',
    shortDesc: 'Chontales es el territorio donde "los ríos son de leche y las piedras de cuajada". Custodia la majestuosa Cordillera de Amerrisque y una inmensa riqueza arqueológica prehispánica.',
    history: 'Habitado por los indómitos pueblos chontales, respetados por su valentía. El nombre de la Cordillera Amerrisque inspiró, según crónicas e historiadores, el nombre del continente América.',
    gastronomy: [
      { name: 'Cuajadas y Quesos Chontaleños', desc: 'De fama internacional: queso quesillo, queso con chile y crema pura de hacienda.' },
      { name: 'Sopa de Hueso de Res con Albóndigas', desc: 'Servida en los días de mercado con tortillas gigantes.' },
      { name: 'Tamal Pisque con Queso Frito', desc: 'Maíz tratado con ceniza de roble y sal marina.' },
      { name: 'Chicha de Maíz Pujagua', desc: 'Bebida de maíz rojo fermentado.' }
    ],
    places: [
      { name: 'Cordillera de Amerrisque', type: 'Serranía Mística & Trekking', icon: 'fa-mountain' },
      { name: 'Museo Arqueológico Gregorio Aguilar Barea', type: 'Estatuas de Piedra Prehispánicas', icon: 'fa-landmark' },
      { name: 'Zoológico Thomas Belt de Juigalpa', type: 'Fauna Silvestre & Puma Albino', icon: 'fa-paw' },
      { name: 'Puerto Díaz & Lago Cocibolca', type: 'Pueblo de Pescadores', icon: 'fa-anchor' },
      { name: 'Piedras Pintadas de Villa Sandino', type: 'Petroglifos Sagrados', icon: 'fa-palette' }
    ],
    activities: [
      'Escalada y senderismo en los riscos de la Cordillera Amerrisque',
      'Exploración de la mayor colección de estatuaria lítica indígena en Juigalpa',
      'Paseo en lancha desde Puerto Díaz en el Gran Lago',
      'Rutas agroturísticas por haciendas ganaderas sostenibles con ordeño limpio',
      'Descubrimiento de petroglifos milenarios en cuevas de Amerrisque'
    ],
    culture: 'Famosa por sus fiestas taurinas con montas rústicas de toros bravos en agosto (fiestas de la Virgen de la Asunción) y la música de chicheros de viento.',
    bestSeason: 'Diciembre a mayo para caminatas en la cordillera sin lluvias intensas.',
    howToReach: 'Por la Carretera al Rama (NIC-7) desde Managua hasta Juigalpa (139 km, 2.5 horas).',
    recommendations: 'Comprar quesos empacados al vacío en las queserías artesanales de Juigalpa y llevar calzado de montaña para los riscos de Amerrisque.',
    heroImage: 'assets/images/destinos/canon_de_somoto.jpg',
    lat: 12.0620,
    lng: -85.3640,
    coopCount: 16
  },
  {
    id: 'boaco',
    name: 'Boaco',
    tagline: 'La Ciudad de Dos Pisos, Cerros Místicos y Quesos Tradicionales',
    shortDesc: 'Boaco es una joya entre montañas quebradas con calles escalonadas en dos pisos naturales. Combina paisajes de pastizales verdes, cerros vírgenes y rica tradición láctea.',
    history: 'Fundada tras los traslados provocados por invasiones caribes en el siglo XVIII. Sus habitantes levantaron una ciudad adaptada a la topografía vertical con puentes peatonales elevados.',
    gastronomy: [
      { name: 'Queso Boaqueño de Pella', desc: 'Queso suave y salado elaborado con leche de vacas alimentadas en pastos de altura.' },
      { name: 'Carne en Vaho Boaqueña', desc: 'Cocida con leña durante 10 horas con yuca dulce y plátano maduro.' },
      { name: 'Atol de Maíz de Cacao', desc: 'Bebida caliente energizante de origen indígena.' },
      { name: 'Gorditas Dulces de Maíz', desc: 'Asadas al comal con cuajada fresca.' }
    ],
    places: [
      { name: 'Centro Histórico & Calles Escalonadas de Boaco', type: 'Arquitectura Topográfica', icon: 'fa-city' },
      { name: 'Cerro de la Vieja & Cerro Alegre', type: 'Senderismo & Mitos', icon: 'fa-mountain' },
      { name: 'Río Fonseca & Balnearios Naturales', type: 'Pozas de Montaña', icon: 'fa-water' },
      { name: 'Pueblo Ganadero de Camoapa', type: 'Sombreros de Pita & Lácteos', icon: 'fa-hat-cowboy' },
      { name: 'Mirador El Faro', type: 'Panorámica de la Ciudad', icon: 'fa-eye' }
    ],
    activities: [
      'Caminatas por las escalinatas y miradores urbanos de la Ciudad de Dos Pisos',
      'Trekking al enigmático Cerro de la Vieja con guías locales',
      'Compra directa de sombreros de pita finamente tejidos a mano en Camoapa',
      'Visita a queserías comunitarias y degustación de lácteos',
      'Refrescante baño en las pozas del Río Malacatoya'
    ],
    culture: 'Danza ancestral de Los Moros y Cristianos en las fiestas patronales del Apóstol Santiago en julio. Tradición del tejido de fibra de pita en Camoapa.',
    bestSeason: 'Diciembre a abril para clima despejado y senderismo montañoso.',
    howToReach: 'Por la Carretera Panamericana Norte y desvío en San Benito hacia Boaco (90 km desde Managua, 1.5 horas).',
    recommendations: 'Caminar con calma por las pendientes pronunciadas y comprar un auténtico sombrero de pita de Camoapa.',
    heroImage: 'assets/images/destinos/finca_magdalena.jpg',
    lat: 12.4720,
    lng: -85.6590,
    coopCount: 15
  },
  {
    id: 'nueva-segovia',
    name: 'Nueva Segovia',
    tagline: 'Pinar Soberano, Cumbres del Mogotón y Sendero de Sandino',
    shortDesc: 'Nueva Segovia es la corona montañosa del norte de Nicaragua. Hogar del Cerro Mogotón (2,107 msnm, el punto más alto del país), manantiales de aguas termales y bosques de pino aromático.',
    history: 'Territorio de rica historia minera colonial y escenario sagrado de la lucha por la soberanía patria comandada por Augusto C. Sandino desde el legendario cerro El Chipote.',
    gastronomy: [
      { name: 'Tamal Relleno Segoviano', desc: 'Maíz con masa sazonada con manteca y relleno de pollo campesino.' },
      { name: 'Café de Dipilto (Taza de Excelencia)', desc: 'Reconocido con los mayores puntajes internacionales de café especial.' },
      { name: 'Rosquillas de Jalapa', desc: 'Horneadas crujientes con queso de montaña.' },
      { name: 'Empanadas de Maíz con Cuajada', desc: 'Fritas al momento en manteca pura.' }
    ],
    places: [
      { name: 'Cerro Mogotón (2,107 msnm)', type: 'Cima Más Alta de Nicaragua', icon: 'fa-mountain' },
      { name: 'Santuario de la Virgen de la Piedra (Dipilto)', type: 'Sitio Religioso & Río', icon: 'fa-church' },
      { name: 'Aguas Termales de Macuelizo & Delia', type: 'Termalismo Terapéutico', icon: 'fa-hot-tub-person' },
      { name: 'Valle Fértil de Jalapa', type: 'Granero de Maíz & Tabaco', icon: 'fa-seedling' },
      { name: 'Ocotal Colonial & Casa de la Cultura', type: 'Historia & Música', icon: 'fa-landmark' }
    ],
    activities: [
      'Expedición y cumbre al Cerro Mogotón entre pinares y neblina',
      'Baños relajantes en pozas de aguas termales medicinales',
      'Cata de cafés ganadores de certámenes mundiales en Dipilto',
      'Ruta histórica de Sandino por los cerros de Quilalí y El Chipote',
      'Senderismo en la cordillera de Dipilto y Jalapa'
    ],
    culture: 'Famosa por sus sones de mazurcas campesinas, fiestas patronales de la Virgen de la Asunción en Ocotal y la gran Feria Nacional del Maíz en Jalapa en septiembre.',
    bestSeason: 'Diciembre a mayo para expediciones seguras y senderos secos al Mogotón.',
    howToReach: 'Por la Carretera Panamericana Norte pasando por Estelí y Somoto hacia Ocotal (226 km desde Managua, 4 horas).',
    recommendations: 'Contratar baqueanos certificados para el ascenso al Mogotón, llevar ropa térmica para temperaturas que pueden bajar de 12°C y comprar café en grano en Dipilto.',
    heroImage: 'assets/images/destinos/selva_negra.jpg',
    lat: 13.6330,
    lng: -86.4750,
    coopCount: 20
  },
  {
    id: 'rio-san-juan',
    name: 'Río San Juan',
    tagline: 'Ruta del Agua Sagrada, Fortaleza Colonial e Indio Maíz',
    shortDesc: 'Río San Juan es el paraíso fluvial y ecológico del sur de Nicaragua. Conecta el Gran Lago con el Mar Caribe a través de una arteria de agua custodiada por la impenetrable Reserva de Biosfera Indio Maíz.',
    history: 'Ruta histórica codiciada por imperios mundiales y piratas como Francis Drake y Horatio Nelson. En 1762, la heroína Rafaela Herrera defendió la Fortaleza El Castillo derrotando a la flota británica.',
    gastronomy: [
      { name: 'Camarón de Río al Ajillo', desc: 'Camarones gigantes de agua dulce cocinados con mantequilla y ajo.' },
      { name: 'Sopa de Pescado Gaspar', desc: 'Fósil viviente cocinado con verduras de la selva y leche de coco.' },
      { name: 'Tostones Rellenos de Salpicón de Sábalo', desc: 'Bocados crujientes con pescado fresco.' },
      { name: 'Tortilla de Maíz con Frijoles Nuevos', desc: 'Acompañada de cuajada fresca ribereña.' }
    ],
    places: [
      { name: 'Fortaleza de la Inmaculada Concepción (El Castillo)', type: 'Monumento Nacional Siglo XVII', icon: 'fa-chess-rook' },
      { name: 'Reserva Biológica Indio Maíz', type: 'Selva Virgen & Jaguares', icon: 'fa-tree' },
      { name: 'Archipiélago de Solentiname', type: 'Islas de Pintores Primitivistas', icon: 'fa-palette' },
      { name: 'Humedales de San Carlos & Malecón', type: 'Confluencia Lago-Río', icon: 'fa-water' },
      { name: 'San Juan de Nicaragua (Greytown)', type: 'Salida al Caribe & Cementerios Británicos', icon: 'fa-anchor' }
    ],
    activities: [
      'Navegación en lancha rápida por los raudales de El Castillo',
      'Senderismo de selva virgen con guardarrecursos indígenas en Indio Maíz',
      'Talleres de pintura primitivista y artesanía en balsa en Solentiname',
      'Pesca deportiva de captura y liberación del sábalo real gigante',
      'Safari nocturno en bote para avistamiento de caimanes y aves nocturnas'
    ],
    culture: 'Pintura primitivista fundada por Ernesto Cardenal en Solentiname, artesanías talladas en madera de balsa, poesías y leyendas de piratas.',
    bestSeason: 'Diciembre a mayo para navegación tranquila y avistamiento de fauna en las orillas.',
    howToReach: 'Vía terrestre por carretera pavimentada hasta San Carlos (290 km desde Managua, 5 horas) o ferry desde Granada hacia San Carlos.',
    recommendations: 'Llevar repelente biodegradable, botas de hule para la selva, poncho impermeable de lluvia y cámara con zoom para fauna.',
    heroImage: 'assets/images/destinos/fortaleza_el_castillo.jpg',
    lat: 11.0180,
    lng: -84.3970,
    coopCount: 27
  },
  {
    id: 'raccn',
    name: 'RACCN (Caribe Norte)',
    tagline: 'Biosfera Bosawás, Pueblos Miskitos y Mayangnas del Río Wangki',
    shortDesc: 'La Región Autónoma de la Costa Caribe Norte es el pulmón verde de Centroamérica. Alberga el corazón de la Reserva de Biosfera Bosawás, pueblos originarios milenarios y costas caribeñas vírgenes.',
    history: 'Territorio soberano de las naciones originarias Miskita y Mayangna que resistieron a la colonia española y mantuvieron su autogobierno ancestral consagrado en la Ley de Autonomía de 1987.',
    gastronomy: [
      { name: 'Luk Luk Costeño', desc: 'Sopa ancestral miskita de carne de res hervida con yuca, plátano y culantro de monte.' },
      { name: 'Wabul de Plátano o Yuca', desc: 'Bebida espesa nutritiva elaborada con plátano maduro batido con leche de coco fresca.' },
      { name: 'Pescado Ahumado con Leña de Mangle', desc: 'Técnica de conservación tradicional indígena.' },
      { name: 'Pan de Coco Tradicional', desc: 'Horneado a la leña con coco recién rallado.' }
    ],
    places: [
      { name: 'Reserva de Biosfera Bosawás', type: 'Patrimonio de la Humanidad UNESCO', icon: 'fa-tree' },
      { name: 'Río Coco / Wangki', type: 'Río Más Largo de Centroamérica', icon: 'fa-water' },
      { name: 'Bilwi (Puerto Cabezas) & Muelle Histórico', type: 'Cultura Caribeña & Playas', icon: 'fa-anchor' },
      { name: 'Comunidades Mayangnas de Bonanza y Rosita', type: 'Pueblos Originarios', icon: 'fa-hands-holding' },
      { name: 'Cayos Miskitos', type: 'Arrecifes & Casas sobre Pilotes', icon: 'fa-fish' }
    ],
    activities: [
      'Expediciones científicas y de ecoturismo en los senderos de Bosawás',
      'Navegación en pipante tradicional por los raudales del Río Coco',
      'Convivencia comunitaria en aldeas indígenas Mayangna y Miskita',
      'Snorkel y buceo en los prístinos Cayos Miskitos',
      'Degustación de mariscos recién capturados en Bilwi'
    ],
    culture: 'Celebración del "King Pulanka" en enero (danza de sátira y memoria real miskita), lengua materna Miskita y Mayangna, cantos espirituales y artesanía en corteza de tuno.',
    bestSeason: 'Febrero a mayo para caminos transitables y mar del Caribe calmo.',
    howToReach: 'Vuelos comerciales diarios de La Costeña desde Managua a Bilwi (1 hora) o por carretera pavimentada (520 km, aprox. 10 horas).',
    recommendations: 'Respetar las normativas y autoridades comunales indígenas (Wihta), contratar guías locales nativos y aplicarse vacuna contra fiebre amarilla si se adentra en la selva profunda.',
    heroImage: 'assets/images/destinos/cascada_la_luna.jpg',
    lat: 14.0350,
    lng: -83.3880,
    coopCount: 17
  },
  {
    id: 'raccs',
    name: 'RACCS (Caribe Sur)',
    tagline: 'Paraíso Afrocaribeño: Corn Island, Bluefields y Cayos Perlas',
    shortDesc: 'La Región Autónoma de la Costa Caribe Sur es una fiesta de color, ritmos de palo de mayo y aguas turquesas. Combina la exuberancia de Corn Island con la historia multilingüe de Bluefields y Bahía de Perlas.',
    history: 'Mosaico multicultural único integrado por comunidades Creoles, Garífunas, Ramas, Miskitas y Mestizas. Puerto de gran relevancia histórica en el Caribe centroamericano.',
    gastronomy: [
      { name: 'Rondón Costeño (Run Down)', desc: 'Pescado fresco, langosta, cangrejo, yuca, plátano y fruta de pan cocinados a fuego lento en leche de coco con chile cabro.' },
      { name: 'Gingerser (Cerveza de Jengibre)', desc: 'Bebida fermentada afrocaribeña especiada.' },
      { name: 'Patties Costeños', desc: 'Empanadas crujientes rellenas de carne picada picante.' },
      { name: 'Queque de Quequisque y Pan de Coco', desc: 'Repostería fina tradicional.' }
    ],
    places: [
      { name: 'Corn Island & Little Corn Island', type: 'Playas Turquesas & Arrecife', icon: 'fa-umbrella-beach' },
      { name: 'Cayos Perlas', type: 'Islas de Coral Desiertas', icon: 'fa-fish' },
      { name: 'Bahía de Bluefields & Malecón', type: 'Cultura Afrocaribeña', icon: 'fa-anchor' },
      { name: 'Laguna de Perlas & Aspinwall', type: 'Humedales & Comunidades Garífunas', icon: 'fa-water' },
      { name: 'Isla Rama Cay', type: 'Pueblo Originario Rama', icon: 'fa-people-roof' }
    ],
    activities: [
      'Buceo y snorkel en los arrecifes de coral virgen de Little Corn Island',
      'Paseo en lancha a los islotes desiertos de arena blanca en Cayos Perlas',
      'Bailar al ritmo de Palo de Mayo en las comparsas callejeras de Bluefields',
      'Pesca de langosta y degustación de rondón en la playa',
      'Recorrido cultural por los pueblos Garífunas de Orinoco'
    ],
    culture: 'El vibrante Festival de Palo de Mayo (Maypole) durante todo mayo, música soca y reggae, espiritualidad garífuna (Walagallo) y hospitalidad caribeña.',
    bestSeason: 'Diciembre a mayo para aguas cristalinas ideales para buceo y snorkel.',
    howToReach: 'Vuelos comerciales de La Costeña desde Managua a Bluefields y Corn Island (45 min) o por la moderna carretera Managua-Bluefields (360 km, 5.5 horas).',
    recommendations: 'No usar plásticos de un solo uso en las islas, alquilar carritos de golf o bicicletas en Big Corn Island y probar el rondón con encargo previo.',
    heroImage: 'assets/images/destinos/corn_island.jpg',
    lat: 12.1720,
    lng: -83.0580,
    coopCount: 31
  }
];
