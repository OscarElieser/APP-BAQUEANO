// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — GALERÍA SONORA & PATRIMONIO MUSICAL (sonora-data.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Honrar y difundir la riqueza musical de Nicaragua, reconociendo a sus
//   grandes compositores históricos, creadores del Son Nica, cantautores de
//   nueva canción, maestros de la música clásica y la vibrante identidad
//   del Caribe nicaragüense.
// - Conectar de forma interactiva la MÚSICA con el TERRITORIO (los 17 departamentos),
//   permitiendo al visitante viajar desde la sonoridad de una pieza hacia
//   la historia, gastronomía y cooperativas del departamento de origen.
// - Garantizar rigurosidad histórica y educativa respaldada en fuentes del
//   Ministerio de Educación (MINED), aclarando autorías legítimas como
//   "La Mora Limpia" de Justo Santos y la creación del Son Nica por Camilo Zapata.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Estructura de datos inmutable organizada en 4 macrocategorías temáticas.
// - Mapeo relacional `departmentId` para enlace profundo bidireccional con
//   el explorador territorial (departamento.html?id=...).
// - Sintetizador armónico y metadatos melódicos de notas pentatónicas y
//   acordes tradicionales para reproducción inmediata sin riesgos de derechos.
//
// 📦 3. QUÉ (WHAT / DATOS EXPUESTOS):
// - BAQUEANO_SONORA_CATEGORIES: 4 categorías oficiales.
// - BAQUEANO_SONORA_ARTISTS: Catálogo de 16 compositores y artistas insignia.
// ============================================================================

window.BAQUEANO_SONORA_CATEGORIES = [
  {
    id: "son-nica",
    name: "Maestros del Son Nica y Folclore",
    icon: "fa-solid fa-guitar",
    badge: "FOLCLORE & IDENTIDAD",
    description: "Los arquitectos del compás de 6/8, el corrido nicaragüense y la tradición popular campesina.",
    count: "5 Maestros"
  },
  {
    id: "cantautores",
    name: "Grandes Cantautores de Nicaragua",
    icon: "fa-solid fa-microphone-lines",
    badge: "CANTO SOCIAL & POESÍA",
    description: "Voces inmortales de la nueva canción, la poesía musicalizada de Darío y el canto ecológico.",
    count: "5 Artistas"
  },
  {
    id: "patrimonio",
    name: "Patrimonio Musical Histórico",
    icon: "fa-solid fa-feather-pointed",
    badge: "MÚSICA ACADÉMICA & CLÁSICA",
    description: "Valses inmortales de concierto, compositores sacros y la herencia indígena de la marimba y El Güegüense.",
    count: "4 Legados"
  },
  {
    id: "caribe-contemporaneo",
    name: "Sonidos del Caribe & Contemporáneo",
    icon: "fa-solid fa-drum",
    badge: "CARIBE & FUSIÓN ACTUAL",
    description: "La cadencia del Palo de Mayo afrocaribeño, salsa de proyección internacional y rock de autor.",
    count: "3 Referentes"
  }
];

window.BAQUEANO_SONORA_ARTISTS = [
  // ==========================================================================
  // 1. MAESTROS DEL SON NICA Y FOLCLORE
  // ==========================================================================
  {
    id: "camilo-zapata",
    name: "Camilo Zapata",
    honorific: "El Padre del Son Nica",
    category: "son-nica",
    origin: "Managua (Influencia en Masaya y Chontales)",
    departmentId: "managua",
    departmentName: "Managua",
    genres: "Son Nica · Folklore Tradicional",
    years: "1917 – 2009",
    icon: "fa-solid fa-guitar",
    quote: "«En el solar de Monimbó donde doña Tina baila al son de la marimba de arco...»",
    legacy: "Creador indiscutible del Son Nica, estructura rítmica en compás de 6/8 con acentuación en el tercer tiempo que capturó por primera vez en pentagrama el andar garboso, el zapateo y el espíritu del campesino nicaragüense. Su obra sentó las bases de la música nacional con piezas eternas reconocidas en el currículo educativo del MINED.",
    works: [
      {
        title: "El Solar de Monimbó",
        tag: "Himno del Son Nica",
        desc: "La máxima expresión del ritmo nicaragüense, retratando las fiestas tradicionales de Masaya.",
        notes: [523.25, 587.33, 659.25, 783.99, 880.00, 659.25, 783.99, 523.25]
      },
      {
        title: "Caballito Chontaleño",
        tag: "Son Campesino",
        desc: "Evocación campirana a las llanuras ganaderas de Chontales y el galope sobre serranías.",
        notes: [440.00, 493.88, 523.25, 659.25, 587.33, 523.25, 493.88, 440.00]
      },
      {
        title: "Flor de mi Colina",
        tag: "Canción Lírica",
        desc: "Lirismo puro y poesía campesina incluida en la antología histórica nacional.",
        notes: [392.00, 440.00, 523.25, 659.25, 587.33, 440.00, 392.00]
      },
      {
        title: "El Nancite",
        tag: "Costumbrista",
        desc: "Pintura musical de los frutos, árboles y picardía rural pinolera.",
        notes: [523.25, 659.25, 783.99, 659.25, 587.33, 523.25]
      }
    ]
  },
  {
    id: "justo-santos",
    name: "Justo Santos",
    honorific: "Autor del Segundo Himno Nacional",
    category: "son-nica",
    origin: "Rivas / Masaya",
    departmentId: "rivas",
    departmentName: "Rivas",
    genres: "Son de Marimba · Música Instrumental",
    years: "1931 – 1958",
    icon: "fa-solid fa-music",
    quote: "«La Mora Limpia es el canto del alma nicaragüense que eriza la piel de todo patriota.»",
    legacy: "Compositor genuino de 'La Mora Limpia', inmortalizada en 1946 para un concurso de música típica. Considerada por unanimidad popular y académica como el segundo himno de Nicaragua. Su melodía en guitarra y marimba sintetiza la luz, la fertilidad y el misticismo de los campos de Nicaragua.",
    works: [
      {
        title: "La Mora Limpia",
        tag: "Segundo Himno Nacional",
        desc: "Obra cumbre del folclore nicaragüense que abre todas las fiestas patronales y celebraciones patrias.",
        notes: [659.25, 783.99, 880.00, 987.77, 880.00, 783.99, 659.25, 587.33, 523.25]
      },
      {
        title: "Al Atardecer",
        tag: "Nocturno Instrumental",
        desc: "Composición romántica para guitarra solista y trío folclórico.",
        notes: [440.00, 523.25, 659.25, 587.33, 440.00]
      }
    ]
  },
  {
    id: "tino-lopez-guerra",
    name: "Tino López Guerra",
    honorific: "El Rey del Corrido Nicaragüense",
    category: "son-nica",
    origin: "Chinandega",
    departmentId: "chinandega",
    departmentName: "Chinandega",
    genres: "Corrido Nacional · Canto Heroico",
    years: "1913 – 1967",
    icon: "fa-solid fa-trophy",
    quote: "«¡Nicaragua mía, de amor y de gloria, la cuna bendita donde yo nací!»",
    legacy: "Reconocido formalmente por el Ministerio de Educación como 'El Rey del Corrido'. Con un estilo vibrante y apasionado, cantó a las bellezas geográficas de Centroamérica, siendo 'Nicaragua Mía' su pieza más representativa, entonada con fervor y orgullo cívico en todo el mundo.",
    works: [
      {
        title: "Nicaragua Mía",
        tag: "Corrido Insigne",
        desc: "Canto cívico de devoción a los lagos, volcanes y bravura del pueblo nicaragüense.",
        notes: [523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 523.25]
      },
      {
        title: "Corrido a Managua",
        tag: "Homenaje Urbano",
        desc: "Retrato musical de la novia del Xolotlán antes del terremoto de 1972.",
        notes: [440.00, 554.37, 659.25, 783.99, 659.25, 440.00]
      },
      {
        title: "Chinandega Linda",
        tag: "Identidad Local",
        desc: "Tributo a la tierra cálida de los volcanes San Cristóbal y Cosigüina.",
        notes: [392.00, 493.88, 587.33, 783.99, 587.33, 392.00]
      }
    ]
  },
  {
    id: "erwin-kruger",
    name: "Erwin Krüger",
    honorific: "El Poeta del Trío Monimbó",
    category: "son-nica",
    origin: "Managua / Masaya",
    departmentId: "masaya",
    departmentName: "Masaya",
    genres: "Canción Romántica Campesina · Son Tradicional",
    years: "1915 – 1973",
    icon: "fa-solid fa-water",
    quote: "«Barrio de pescadores, con olor a lago y rumor de redes...»",
    legacy: "Fundador del legendario Trío Monimbó y embajador sonoro de Nicaragua ante América. Con una pluma nostálgica y descriptiva, pintó la vida cotidiana de los pescadores del lago y las tradiciones campesinas con armonías vocales de altísima factura.",
    works: [
      {
        title: "Barrio de Pescadores",
        tag: "Clásico Lacustre",
        desc: "Homenaje a las familias que viven de la pesca en las orillas del lago Xolotlán.",
        notes: [440.00, 523.25, 659.25, 587.33, 523.25, 440.00]
      },
      {
        title: "Palomita Guasiruca",
        tag: "Son Campesino",
        desc: "Arreglo maestro de una tonada tradicional segoviana que cautivó al continente.",
        notes: [523.25, 587.33, 659.25, 523.25, 392.00]
      }
    ]
  },
  {
    id: "otto-de-la-rocha",
    name: "Otto de la Rocha",
    honorific: "Voz Campesina y Creador de Pancho Madrigal",
    category: "son-nica",
    origin: "Jinotega",
    departmentId: "jinotega",
    departmentName: "Jinotega",
    genres: "Música Costumbrista · Son Jinotegano",
    years: "1933 – 2020",
    icon: "fa-solid fa-mountain",
    quote: "«¡De Jinotega bajé cantando, con mi guitarra de pino y mi corazón curtido!»",
    legacy: "Patriarca del costumbrismo nicaragüense. Cantautor, actor de radio y creador entrañable del personaje campesino 'Aniceto Prieto' en los cuentos de Pancho Madrigal. Sus canciones capturan con humor, picardía y ternura la vida dura y digna de las montañas del norte.",
    works: [
      {
        title: "Una Canción",
        tag: "Balada Costumbrista",
        desc: "Una de las melodías más sentidas y románticas escritas en el campo nicaragüense.",
        notes: [440.00, 493.88, 523.25, 659.25, 587.33, 440.00]
      },
      {
        title: "Managua Linda Managua",
        tag: "Homenaje a la Capital",
        desc: "Retrato entrañable de los barrios, la gente humilde y las vendedoras de la capital.",
        notes: [523.25, 659.25, 783.99, 880.00, 659.25, 523.25]
      },
      {
        title: "La Pelo de Maíz",
        tag: "Son Norteño",
        desc: "Retrato del amor campesino entre cafetales y neblinas jinoteganas.",
        notes: [392.00, 440.00, 523.25, 659.25, 440.00]
      }
    ]
  },

  // ==========================================================================
  // 2. GRANDES CANTAUTORES DE NICARAGUA
  // ==========================================================================
  {
    id: "carlos-mejia-godoy",
    name: "Carlos Mejía Godoy",
    honorific: "El Cronista del Canto Popular Campesino",
    category: "cantautores",
    origin: "Somoto, Madriz",
    departmentId: "madriz",
    departmentName: "Madriz",
    genres: "Música Testimonial · Son Campesino · Canto Popular",
    years: "1943 – Presente",
    icon: "fa-solid fa-wheat-awn",
    quote: "«Yo soy de un pueblo que canta como canta la chicharra, en medio de la milpa...»",
    legacy: "Figura cumbre de la música popular nicaragüense. Ganador del Festival OTI internacional con 'Quincho Barrilete' y autor de la 'Misa Campesina Nicaragüense', obra que fusionó la liturgia con los sones de mazurca, polka y marimba. Sus composiciones son crónica viva de la dignidad rural.",
    works: [
      {
        title: "Quincho Barrilete",
        tag: "Premio OTI Internacional",
        desc: "Historia del niño humilde que sueña con ser aviador; oda a la infancia trabajadora.",
        notes: [523.25, 587.33, 659.25, 698.46, 783.99, 659.25, 523.25]
      },
      {
        title: "Alforja Campesina",
        tag: "Son de Madriz",
        desc: "Himno a la labor de los campesinos segovianos, sus mulas y su alimento en morral.",
        notes: [440.00, 523.25, 659.25, 783.99, 659.25, 440.00]
      },
      {
        title: "Son tus Perjúmenes Mujer",
        tag: "Éxito Mundial",
        desc: "Composición rescatada del saber popular folclórico que dio la vuelta al mundo hispanohablante.",
        notes: [392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 523.25]
      },
      {
        title: "Nicaragua, Nicaragüita",
        tag: "Canto de Amor Patrio",
        desc: "La más tierna declaración de amor filial a la tierra que amanece entre volcanes.",
        notes: [523.25, 659.25, 783.99, 659.25, 587.33, 523.25]
      }
    ]
  },
  {
    id: "luis-enrique-mejia-godoy",
    name: "Luis Enrique Mejía Godoy",
    honorific: "El Trovador de la Poesía Musicalizada",
    category: "cantautores",
    origin: "Somoto, Madriz",
    departmentId: "madriz",
    departmentName: "Madriz",
    genres: "Nueva Canción · Poesía Musicalizada · Trova",
    years: "1945 – Presente",
    icon: "fa-solid fa-book-open",
    quote: "«Pobre la María, lavando ajeno de sol a sol con el río como testigo...»",
    legacy: "Cantautor prolífico que llevó la poesía cumbre de Rubén Darío, Ernesto Cardenal, Joaquín Pasos y José Coronel Urtecho a las partituras musicales. Con una voz potente y un compromiso lírico inquebrantable, ha narrado las transformaciones sociales y la lucha de las mujeres campesinas.",
    works: [
      {
        title: "Pobre la María",
        tag: "Canción Social",
        desc: "Crónica sentida de la mujer lavandera en los ríos de las comarcas nicaragüenses.",
        notes: [440.00, 523.25, 659.25, 587.33, 523.25, 440.00]
      },
      {
        title: "Amando en Tiempo de Guerra",
        tag: "Trova Clásica",
        desc: "La ternura como resistencia y el amor que sobrevive a los tiempos más difíciles.",
        notes: [523.25, 659.25, 783.99, 659.25, 523.25]
      },
      {
        title: "Yo Soy de Allá",
        tag: "Identidad Segoviana",
        desc: "Homenaje entrañable a las tierras de Somoto y los pinos de Nueva Segovia.",
        notes: [392.00, 493.88, 587.33, 659.25, 587.33, 392.00]
      }
    ]
  },
  {
    id: "salvador-cardenal",
    name: "Salvador Cardenal Barquero",
    honorific: "El Poeta Ecológico de Guardabarranco",
    category: "cantautores",
    origin: "Managua / Matagalpa",
    departmentId: "matagalpa",
    departmentName: "Matagalpa",
    genres: "Canto Ecológico · Dúo Guardabarranco · Trova",
    years: "1960 – 2010",
    icon: "fa-solid fa-seedling",
    quote: "«Días de amar, de sembrar los árboles que darán sombra a quienes vendrán...»",
    legacy: "Fundador junto a su hermana Katia del entrañable Dúo Guardabarranco. Pionero absoluto de la canción ecológica en América Latina, su mensaje de amor por la madre tierra, los ríos libres y la paz interior convirtió su música en estandarte ético de las nuevas generaciones.",
    works: [
      {
        title: "Días de Amar",
        tag: "Himno Ecológico",
        desc: "Canto a la regeneración ambiental, la fraternidad humana y el cuidado del suelo vivo.",
        notes: [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25]
      },
      {
        title: "Dame tu Brazo",
        tag: "Trova Guardabarranco",
        desc: "La solidaridad fraterna para cruzar el sendero de la montaña y construir comunidad.",
        notes: [440.00, 523.25, 659.25, 587.33, 440.00]
      },
      {
        title: "Arrebol",
        tag: "Lírica de Atardecer",
        desc: "Poema musical a los cielos crepusculares sobre los lagos y montañas nicaragüenses.",
        notes: [392.00, 440.00, 523.25, 659.25, 523.25]
      }
    ]
  },
  {
    id: "katia-cardenal",
    name: "Katia Cardenal",
    honorific: "Voz Cristalina de la Canción de Autor",
    category: "cantautores",
    origin: "Managua",
    departmentId: "managua",
    departmentName: "Managua",
    genres: "Canción de Autor · Nueva Canción Latinoamericana",
    years: "1963 – Presente",
    icon: "fa-solid fa-dove",
    quote: "«Cantar es como respirar la neblina pura de la montaña al despertar.»",
    legacy: "Con una de las voces más cristalinas y afinadas del continente, ha llevado el repertorio nicaragüense a Europa y toda América. Intérprete sensible de canciones nórdicas traducidas y preservadora activa del legado poético del Dúo Guardabarranco.",
    works: [
      {
        title: "Guerrero del Amor",
        tag: "Nueva Canción",
        desc: "Mensaje de fuerza no violenta y persistencia en la defensa de la verdad y la justicia.",
        notes: [523.25, 659.25, 783.99, 880.00, 783.99, 659.25, 523.25]
      },
      {
        title: "Mariposas",
        tag: "Poesía Musical",
        desc: "Vuelo metafórico sobre la libertad y la metamorfosis del espíritu humano.",
        notes: [440.00, 523.25, 659.25, 587.33, 440.00]
      }
    ]
  },
  {
    id: "norma-helena-gadea",
    name: "Norma Helena Gadea",
    honorific: "La Gran Voz de la Dignidad Nicaragüense",
    category: "cantautores",
    origin: "Ocotal, Nueva Segovia",
    departmentId: "nueva-segovia",
    departmentName: "Nueva Segovia",
    genres: "Canto Latinoamericano · Folclore Segoviano",
    years: "1955 – Presente",
    icon: "fa-solid fa-microphone",
    quote: "«En mi canto van los pinos de Ocotal y la sangre rebelde de Sandino.»",
    legacy: "Considerada una de las voces femeninas más potentes y emotivas de Centroamérica. Su timbre inconfundible ha interpretado piezas de la Misa Campesina, composiciones de Carlos y Luis Enrique Mejía Godoy, y los cantares tradicionales de Nueva Segovia con rigor vocal insuperable.",
    works: [
      {
        title: "El Canto de los Pájaros",
        tag: "Misa Campesina",
        desc: "Interpretación magistral del amanecer donde cada ave del campo alaba la creación.",
        notes: [523.25, 659.25, 783.99, 1046.50, 783.99, 523.25]
      },
      {
        title: "La Segoviana",
        tag: "Folklore Norteño",
        desc: "Canto de amor a las serranías de Ocotal, Jalapa y el pinar de Las Segovias.",
        notes: [440.00, 493.88, 587.33, 659.25, 440.00]
      }
    ]
  },

  // ==========================================================================
  // 3. PATRIMONIO MUSICAL HISTÓRICO
  // ==========================================================================
  {
    id: "jose-de-la-cruz-mena",
    name: "José de la Cruz Mena",
    honorific: "El Genio Romántico de los Valses Inmortales",
    category: "patrimonio",
    origin: "León",
    departmentId: "leon",
    departmentName: "León",
    genres: "Vals Clásico · Música de Cámara y Sinfónica",
    years: "1874 – 1907",
    icon: "fa-solid fa-violin",
    quote: "«En medio del dolor de las Ruinas brotó la melodía más hermosa jamás escuchada.»",
    legacy: "El más ilustre compositor de música académica de Nicaragua. A pesar de sufrir ceguera y aislamiento a orillas del río Chiquito en León, compuso valses inmortales como 'Ruinas', 'Amores de Santa Cecilia' y 'Rosalía', catalogados entre las cumbres del romanticismo musical latinoamericano.",
    works: [
      {
        title: "Ruinas",
        tag: "Obra Cumbre del Vals",
        desc: "Vals sinfónico conmovedor considerado el testamento estético y espiritual del maestro leonés.",
        notes: [523.25, 659.25, 783.99, 880.00, 987.77, 783.99, 659.25, 523.25]
      },
      {
        title: "Amores de Santa Cecilia",
        tag: "Vals Triunfal",
        desc: "Premiado internacionalmente en 1904, derroche de virtuosismo orquestal y elegancia.",
        notes: [440.00, 554.37, 659.25, 880.00, 659.25, 440.00]
      },
      {
        title: "Rosalía",
        tag: "Vals Romántico",
        desc: "Delicada pieza lírica para piano y ensamble de cuerdas clásicas.",
        notes: [392.00, 493.88, 587.33, 783.99, 587.33, 392.00]
      }
    ]
  },
  {
    id: "alejandro-vega-matus",
    name: "Alejandro Vega Matus",
    honorific: "El Patriarca Musical de Masaya",
    category: "patrimonio",
    origin: "Masaya",
    departmentId: "masaya",
    departmentName: "Masaya",
    genres: "Villancicos Sacros · Sones de Toros · Música Clásica",
    years: "1875 – 1937",
    icon: "fa-solid fa-bell",
    quote: "«¡Tu Gloria, Tu Gloria, gozoso este día, ¡oh plácida María!, ensalce la voz!»",
    legacy: "Compositor prolífico que definió la identidad sonora de la fiesta mariana de 'La Purísima' con sus villancicos centenarios ('Tu Gloria', 'Pues Concebida', 'Por Eso el Cristianismo'). Creó además sones de toros y marchas fúnebres que siguen vivas en el patrimonio inmaterial de Masaya.",
    works: [
      {
        title: "Tu Gloria, Tu Gloria",
        tag: "Canto de la Purísima",
        desc: "Villancico mariano indispensable que resuena en toda Nicaragua cada 7 de diciembre.",
        notes: [523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 523.25]
      },
      {
        title: "Son de Toros de Masaya",
        tag: "Música de Fiesta Popular",
        desc: "Pieza instrumental vibrante ejecutada por filarmónicos en las fiestas de San Jerónimo.",
        notes: [440.00, 523.25, 659.25, 783.99, 659.25, 440.00]
      }
    ]
  },
  {
    id: "marimba-monimbo",
    name: "La Marimba de Arco de Monimbó",
    honorific: "Instrumento Sagrado Indígena",
    category: "patrimonio",
    origin: "Masaya (Comunidad de Monimbó)",
    departmentId: "masaya",
    departmentName: "Masaya",
    genres: "Música Tradicional Indígena · Son de Marimba",
    years: "Tradición Ancestral Viva",
    icon: "fa-solid fa-drum",
    quote: "«Maderas de coyote y jícaro que cantan bajo los dedos veloces de los artesanos indígenas.»",
    legacy: "La marimba de arco es el corazón instrumental del folclore nicaragüense. Ejecutada sentado con un arco de bejuco apoyado en las rodillas y acompañada por dos guitarras españolas (guitarra y guitarrilla), produce el sonido inconfundible del mestizaje pinolero.",
    works: [
      {
        title: "El Baile del Mestizaje",
        tag: "Danza Folclórica",
        desc: "Melodía tradicional que acompaña a las parejas en traje de fantasía indígena y española.",
        notes: [523.25, 587.33, 659.25, 783.99, 880.00, 659.25, 523.25]
      },
      {
        title: "El Sapo",
        tag: "Son Tradicional",
        desc: "Divertida y virtuosa pieza descriptiva de los sonidos naturales del campo.",
        notes: [440.00, 493.88, 523.25, 659.25, 440.00]
      },
      {
        title: "La Danza Negra",
        tag: "Ritmo Mestizo",
        desc: "Antigua marcha de marimba de raíz afroindígena de las comarcas orientales.",
        notes: [392.00, 440.00, 523.25, 659.25, 523.25, 392.00]
      }
    ]
  },
  {
    id: "el-gueguense",
    name: "Música de El Güegüense",
    honorific: "Patrimonio Oral e Inmaterial de la Humanidad (UNESCO)",
    category: "patrimonio",
    origin: "Carazo / Masaya",
    departmentId: "carazo",
    departmentName: "Carazo",
    genres: "Teatro Danzario Colonial · Pito y Tamboril",
    years: "Siglo XVI – Presente",
    icon: "fa-solid fa-masks-theater",
    quote: "«¡Sonajas de plata y pito de caña que burlan al gobernador con dignidad y sonrisas!»",
    legacy: "Banda sonora de la primera obra de teatro satírico del continente americano. Ejecutada con pito de caña, tamboril y chichiles (sonajas), sus 14 sones representan la picardía, resistencia y astucia del comerciante indígena frente al imperio español.",
    works: [
      {
        title: "Son del Güegüense",
        tag: "Patrimonio UNESCO",
        desc: "Danza principal con máscaras de madera y látigos que satiriza al poder colonial.",
        notes: [523.25, 659.25, 523.25, 659.25, 783.99, 659.25, 523.25]
      },
      {
        title: "El Macho Ratón",
        tag: "Danza de Mulas",
        desc: "Ritmo alegre y trotador que imita el paso de las bestias de carga en la plaza.",
        notes: [440.00, 523.25, 659.25, 587.33, 440.00]
      }
    ]
  },

  // ==========================================================================
  // 4. SONIDOS DEL CARIBE & NICARAGUA CONTEMPORÁNEA
  // ==========================================================================
  {
    id: "dimension-costena",
    name: "Dimensión Costeña",
    honorific: "Embajadores del Palo de Mayo y la Identidad Caribeña",
    category: "caribe-contemporaneo",
    origin: "Bluefields, RACCS",
    departmentId: "raccs",
    departmentName: "RACCS",
    genres: "Palo de Mayo · Calipso · Soca Afrocaribeña",
    years: "1980 – Presente",
    icon: "fa-solid fa-drum",
    quote: "«¡Mayaya lasinki, mayo ya llegó, bailemos con la brisa del Caribe y el amor!»",
    legacy: "La agrupación que llevó la cadencia sensual, polirrítmica y festiva del Palo de Mayo costeño a todo el Pacífico nicaragüense y el mundo. Con el bajo percutido, trompetas brillantes y percusión caribeña, consolidaron el orgullo multiétnico y multicultural de Nicaragua.",
    works: [
      {
        title: "Mayaya Lasinki",
        tag: "Himno del Palo de Mayo",
        desc: "La tonada de mayo más famosa de Bluefields, celebración de la fertilidad y la lluvia.",
        notes: [523.25, 659.25, 783.99, 880.00, 1046.50, 783.99, 523.25]
      },
      {
        title: "Tululu",
        tag: "Danza Comunitaria",
        desc: "Paso de comparsa caribeña en el que toda la comunidad baila entrelazada bajo un arco humano.",
        notes: [440.00, 523.25, 659.25, 783.99, 659.25, 440.00]
      },
      {
        title: "Sing Ting Ting",
        tag: "Calipso de Bluefields",
        desc: "Fusión creole con percusión caribeña que invita al movimiento perpetuo.",
        notes: [392.00, 493.88, 587.33, 783.99, 587.33, 392.00]
      }
    ]
  },
  {
    id: "hernaldo-zuniga",
    name: "Hernaldo Zúñiga",
    honorific: "El Gran Baladista y Poeta de Proyección Internacional",
    category: "caribe-contemporaneo",
    origin: "Masaya",
    departmentId: "masaya",
    departmentName: "Masaya",
    genres: "Balada Poética · Canción de Autor Internacional",
    years: "1955 – Presente",
    icon: "fa-solid fa-pen-nib",
    quote: "«Procuro olvidarte, siguiendo la ruta de un pájaro herido...»",
    legacy: "Cantautor nicaragüense de inmensa trascendencia hispanoamericana. Con un lenguaje literario exquisito, sus composiciones han sido interpretadas por estrellas internacionales en festivales mundiales como Viña del Mar, dejando una huella imborrable en la canción romántica de autor.",
    works: [
      {
        title: "Procuro Olvidarte",
        tag: "Clásico Universal",
        desc: "Una de las baladas más versionadas e influyentes en la historia de la música en español.",
        notes: [523.25, 587.33, 659.25, 698.46, 783.99, 659.25, 523.25]
      },
      {
        title: "Cancionero",
        tag: "Canción de Autor",
        desc: "Homenaje poético al oficio de escribir versos que curan el alma.",
        notes: [440.00, 523.25, 659.25, 587.33, 440.00]
      },
      {
        title: "¿Cómo Te Va Mi Amor?",
        tag: "Éxito Continental",
        desc: "Obra maestra que conquistó las listas continentales de música romántica.",
        notes: [392.00, 440.00, 523.25, 659.25, 523.25]
      }
    ]
  },
  {
    id: "luis-enrique",
    name: "Luis Enrique",
    honorific: "El Príncipe de la Salsa",
    category: "caribe-contemporaneo",
    origin: "Somoto, Madriz",
    departmentId: "madriz",
    departmentName: "Madriz",
    genres: "Salsa Romántica · Música Tropical · Grammy Latino",
    years: "1962 – Presente",
    icon: "fa-solid fa-compact-disc",
    quote: "«Yo no sé mañana si estaremos juntos, si se acaba el mundo...»",
    legacy: "Ganador de múltiples Premios Grammy y figura clave de la salsa internacional contemporánea. Sobrino de Carlos y Luis Enrique Mejía Godoy, fusionó la herencia lírica segoviana con arreglos tropicales de primer nivel mundial, llevando la bandera de Nicaragua a los escenarios más encumbrados.",
    works: [
      {
        title: "Yo No Sé Mañana",
        tag: "Premio Grammy Latino",
        desc: "Éxito mundial de la salsa moderna con millones de reproducciones globales.",
        notes: [523.25, 659.25, 783.99, 880.00, 1046.50, 783.99, 523.25]
      },
      {
        title: "Así Es La Vida",
        tag: "Salsa Romántica",
        desc: "Composición de gran calado rítmico que consolidó su título de 'Príncipe de la Salsa'.",
        notes: [440.00, 554.37, 659.25, 783.99, 659.25, 440.00]
      }
    ]
  },
  {
    id: "perrozompopo",
    name: "Perrozompopo (Ramón Mejía)",
    honorific: "Canción Alternativa y Rock Urbano de Autor",
    category: "caribe-contemporaneo",
    origin: "Managua",
    departmentId: "managua",
    departmentName: "Managua",
    genres: "Rock Alternativo · Fusión Contemporánea · Trova Urbana",
    years: "1971 – Presente",
    icon: "fa-solid fa-guitar",
    quote: "«Entre remolinos de polvo y asfalto, cantamos la verdad de nuestra generación.»",
    legacy: "Compositor nominado al Grammy Latino que revitalizó la canción de autor con sonoridades de rock, ska, rap y música electrónica. Sus letras directas y poéticas narran las vivencias urbanas contemporáneas, las migraciones y la búsqueda de identidad de la juventud nicaragüense.",
    works: [
      {
        title: "Entre Remolinos",
        tag: "Canción Alternativa",
        desc: "Reflexión introspectiva y acústica sobre el crecimiento en los barrios de Managua.",
        notes: [440.00, 523.25, 659.25, 587.33, 523.25, 440.00]
      },
      {
        title: "Quiero Que Sepas",
        tag: "Fusión Urbana",
        desc: "Fusión de ritmos latinos con poética urbana moderna.",
        notes: [523.25, 587.33, 659.25, 783.99, 659.25, 523.25]
      },
      {
        title: "Romper El Silencio",
        tag: "Rock de Autor",
        desc: "Llamado enérgico a la conciencia cívica y la fraternidad colectiva.",
        notes: [392.00, 440.00, 523.25, 659.25, 440.00]
      }
    ]
  }
];
