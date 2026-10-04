// ============================================================================
// 🧭 BAQUEANO — CONTENIDO AMPLIADO POR TERRITORIO (territories-rich-data.js)
// ============================================================================
// 🎯 POR QUÉ:
// - Madriz fue la referencia de estilo: cada territorio debe tener la misma
//   profundidad (historia en línea de tiempo, sitios emblemáticos, sabores,
//   artesanías, música, fiestas, patrimonio, naturaleza, leyendas, rutas,
//   logística y SOS) con SU información, nunca la de Madriz.
//
// ⚙️ CÓMO:
// - Un objeto por territorio (id de territories-data.js). Todo es opcional:
//   js/territory-rich-sections.js solo pinta las secciones que tienen datos.
// - Solo información pública y comprobable (patrimonio declarado, geografía,
//   tradiciones documentadas). Sin personas, precios ni cifras inventadas;
//   los anfitriones se agregan solo con perfiles reales registrados.
//
// 📦 QUÉ: window.BAQUEANO_TERRITORY_DETAILS = { [id]: { timeline, signature,
//   dishes, crafts, music, festivals, heritage, nature, legends, routes,
//   whatToBring, sos } }.
// ============================================================================
(function (window) {
  'use strict';

  window.BAQUEANO_TERRITORY_DETAILS = Object.freeze({
    leon: {
      timeline: [
        { period: 'Antes de 1524', title: 'Pueblos originarios', text: 'Sutiaba y los pueblos de la cordillera de los Maribios habitaban la llanura entre el Pacífico y el lago Xolotlán.' },
        { period: '1524', title: 'León Viejo', text: 'Francisco Hernández de Córdoba funda León a orillas del Xolotlán, frente al volcán Momotombo.' },
        { period: '1610', title: 'Traslado de la ciudad', text: 'Tras sismos y la actividad del Momotombo, León se traslada junto al pueblo indígena de Sutiaba, donde está hoy.' },
        { period: 'Siglo XIX', title: 'Ciudad universitaria y liberal', text: 'León fue capital colonial, centro político liberal y sede de una de las universidades más antiguas de Centroamérica.' },
        { period: '2000 y 2011', title: 'Doble Patrimonio Mundial', text: 'La UNESCO inscribe las Ruinas de León Viejo (2000) y la Catedral de León (2011).' }
      ],
      signature: [
        { icon: 'fa-church', title: 'Catedral de León', subtitle: 'Patrimonio Mundial UNESCO (2011)', text: 'La catedral más grande de Centroamérica. Sus techos blancos se recorren a pie y guarda la tumba de Rubén Darío.', facts: [['Ubicación', 'Parque Central de León'], ['Experiencia', 'Recorrido por los techos y vistas a los volcanes']] },
        { icon: 'fa-landmark', title: 'Ruinas de León Viejo', subtitle: 'Patrimonio Mundial UNESCO (2000)', text: 'Restos de la primera ciudad de León, a orillas del Xolotlán y frente al Momotombo, en La Paz Centro.', facts: [['Ubicación', 'Puerto Momotombo, La Paz Centro'], ['Experiencia', 'Arqueología colonial y paisaje volcánico']] },
        { icon: 'fa-volcano', title: 'Volcán Cerro Negro', subtitle: 'Uno de los volcanes más jóvenes de América', text: 'Cono de arena volcánica negra nacido en 1850. Se sube a pie y se desciende en tabla (sandboarding) con operadores autorizados.', facts: [['Ubicación', 'Cordillera de los Maribios'], ['Experiencia', 'Caminata y descenso guiado']] },
        { icon: 'fa-water', title: 'Las Peñitas e Isla Juan Venado', subtitle: 'Reserva Natural', text: 'Estero de manglares frente al Pacífico con aves acuáticas y playas de anidación de tortugas marinas.', facts: [['Ubicación', 'Costa de León'], ['Experiencia', 'Paseo en lancha por el manglar']] }
      ],
      dishes: [
        { name: 'Quesillo', ingredient: 'Tortilla, quesillo, crema y cebolla encurtida', how: 'Envuelto en tortilla caliente y bañado con crema', where: 'Nagarote y La Paz Centro' },
        { name: 'Tiste', ingredient: 'Cacao y maíz tostado', how: 'Bebida fría servida en jícara', where: 'Mercados y hogares leoneses' },
        { name: 'Indio viejo', ingredient: 'Masa de maíz, carne desmenuzada y naranja agria', how: 'Guiso espeso cocinado a fuego lento', where: 'Cocinas familiares' },
        { name: 'Cuajada con tortilla', ingredient: 'Leche cuajada y maíz', how: 'Fresca, con sal, acompañando el desayuno', where: 'Comunidades ganaderas' }
      ],
      crafts: [
        { tag: 'Barro', title: 'Tejas y ladrillos de barro', community: 'La Paz Centro', text: 'Hornos artesanales que mantienen la tradición alfarera de la zona.' },
        { tag: 'Tradición', title: 'Gigantonas y cabezones', community: 'Barrios de León', text: 'Figuras gigantes de cartón y tela que se bailan al ritmo del tambor.' }
      ],
      music: { text: 'León suena a tambor y verso popular: la Gigantona y el Enano Cabezón recorren las calles con coplas improvisadas, y la ciudad guarda la memoria de Rubén Darío.', items: [{ name: 'La Gigantona', text: 'Baile callejero con tambor y coplas, protagonista de la Purísima.' }, { name: 'Rubén Darío', text: 'El Museo Archivo Rubén Darío conserva la casa donde creció el poeta.' }] },
      festivals: [
        { name: 'La Gritería', when: '7 de diciembre', where: 'Toda la ciudad', text: 'Nació en León en 1857 y hoy se celebra en todo el país con altares a la Purísima.' },
        { name: 'Semana Santa en Sutiaba', when: 'Semana Santa', where: 'Barrio indígena de Sutiaba', text: 'Alfombras de aserrín de colores sobre las calles para las procesiones.' }
      ],
      heritage: ['Catedral de León (UNESCO 2011)', 'Ruinas de León Viejo (UNESCO 2000)', 'Iglesia de Sutiaba', 'Museo Archivo Rubén Darío'],
      nature: { text: 'La cordillera de los Maribios forma una cadena de volcanes activos junto a la llanura agrícola y la costa de manglares.', species: ['Aves acuáticas del manglar', 'Tortugas marinas en la costa', 'Garzas y pelícanos'] },
      legends: [{ title: 'El padre sin cabeza', text: 'Relato de la tradición oral leonesa sobre un sacerdote que aparece de noche cerca de los templos coloniales.' }],
      routes: [
        { title: 'León colonial', steps: ['Catedral y sus techos', 'Museo Archivo Rubén Darío', 'Iglesia y barrio de Sutiaba', 'Murales y casonas del centro'] },
        { title: 'Ruta volcánica', steps: ['Salida temprano hacia los Maribios', 'Ascenso a Cerro Negro', 'Descenso guiado', 'Almuerzo en la ciudad'] },
        { title: 'Pacífico y manglar', steps: ['Playa Las Peñitas', 'Lancha por Isla Juan Venado', 'Atardecer frente al mar'] }
      ],
      whatToBring: ['Protector solar y gorra: el calor es intenso todo el año', 'Calzado cerrado para Cerro Negro', 'Agua suficiente', 'Repelente para el manglar'],
      sos: { hospital: 'Hospital Escuela Óscar Danilo Rosales Argüello (HEODRA), León' }
    },

    rivas: {
      timeline: [
        { period: 'Antes de 1522', title: 'Pueblo nicarao', text: 'El istmo estaba habitado por el pueblo del cacique Nicarao, que dio nombre al país.' },
        { period: '1522', title: 'Encuentro con Gil González', text: 'El conquistador Gil González Dávila se encuentra con el cacique Nicarao en el istmo de Rivas.' },
        { period: '1856', title: 'Batalla de Rivas', text: 'Durante la guerra contra William Walker se libra la Batalla de Rivas, donde el costarricense Juan Santamaría se convirtió en héroe.' },
        { period: '2010', title: 'Ometepe, Reserva de Biosfera', text: 'La UNESCO declara la Isla de Ometepe Reserva de Biosfera.' }
      ],
      signature: [
        { icon: 'fa-mountain-sun', title: 'Isla de Ometepe', subtitle: 'Reserva de Biosfera UNESCO (2010)', text: 'Dos volcanes, Concepción y Maderas, unidos por un istmo en medio del Cocibolca, con petroglifos y comunidades rurales.', facts: [['Acceso', 'Ferry o lancha desde San Jorge'], ['Experiencia', 'Senderismo, kayak, arqueología y fincas']] },
        { icon: 'fa-water', title: 'San Juan del Sur', subtitle: 'Bahía del Pacífico', text: 'Bahía de pescadores rodeada de playas para surf y navegación.', facts: [['Acceso', 'Carretera desde Rivas'], ['Experiencia', 'Surf, navegación y atardeceres']] },
        { icon: 'fa-shield-heart', title: 'Refugio de Vida Silvestre La Flor', subtitle: 'Anidación de tortugas marinas', text: 'Playa protegida donde llegan a desovar tortugas marinas, con visitas reguladas.', facts: [['Ubicación', 'Costa sur de San Juan del Sur'], ['Regla BAQUEANO', 'Solo con guardaparques y sin luz blanca']] }
      ],
      dishes: [
        { name: 'Pescado del Cocibolca', ingredient: 'Guapote o mojarra del lago', how: 'Frito entero con tostones y ensalada', where: 'San Jorge y Ometepe' },
        { name: 'Mariscos del Pacífico', ingredient: 'Pescado, camarón y langosta', how: 'A la plancha o en sopa marinera', where: 'San Juan del Sur y Tola' },
        { name: 'Plátano en todas sus formas', ingredient: 'Plátano verde y maduro', how: 'Tostones, tajadas y maduro asado', where: 'Todo el departamento' }
      ],
      heritage: ['Petroglifos de Ometepe', 'Museo de Altagracia (Ometepe)', 'Iglesia parroquial de Rivas', 'Museo de Antropología e Historia de Rivas'],
      nature: { text: 'Rivas une el Pacífico y el Cocibolca: bosque seco, bosque nuboso en el Maderas, playas de anidación y el lago de agua dulce más grande de Centroamérica.', species: ['Monos congo en Ometepe', 'Tortugas marinas', 'Urracas copetonas', 'Garzas del lago'] },
      routes: [
        { title: 'Ometepe en dos días', steps: ['Ferry San Jorge → Moyogalpa', 'Charco Verde y Punta Jesús María', 'Ojo de Agua', 'Petroglifos y comunidades de Altagracia'] },
        { title: 'Pacífico rivense', steps: ['Bahía de San Juan del Sur', 'Playas para surf', 'Visita nocturna regulada a La Flor'] }
      ],
      whatToBring: ['Calzado de montaña para los volcanes de Ometepe', 'Ropa liviana y protector solar', 'Impermeable en época lluviosa', 'Linterna roja (no blanca) para observar tortugas'],
      sos: { hospital: 'Hospital Gaspar García Laviana, Rivas' }
    },

    masaya: {
      timeline: [
        { period: 'Raíz indígena', title: 'Monimbó', text: 'La comunidad indígena de Monimbó conserva oficios, danzas y organización tradicional en la ciudad de Masaya.' },
        { period: '1912', title: 'Batalla del Coyotepe', text: 'En el cerro Coyotepe se libra una de las batallas de la resistencia de Benjamín Zeledón contra la intervención estadounidense.' },
        { period: '1978', title: 'Insurrección de Monimbó', text: 'El barrio de Monimbó se levanta en febrero de 1978, un hito de la historia contemporánea del país.' },
        { period: '1979', title: 'Primer parque nacional', text: 'Se crea el Parque Nacional Volcán Masaya, el primero del país.' }
      ],
      signature: [
        { icon: 'fa-volcano', title: 'Parque Nacional Volcán Masaya', subtitle: 'Primer parque nacional de Nicaragua (1979)', text: 'Volcán activo con miradores al cráter Santiago, del que salen gases y donde anidan chocoyos.', facts: [['Ubicación', 'Entre Masaya y Managua'], ['Regla BAQUEANO', 'Respetar el tiempo de permanencia en el cráter']] },
        { icon: 'fa-water', title: 'Laguna de Apoyo', subtitle: 'Reserva Natural', text: 'Laguna volcánica de aguas tibias y transparentes, compartida con Granada.', facts: [['Experiencia', 'Nado, kayak y bosque seco'], ['Acceso', 'Desde Masaya o Catarina']] },
        { icon: 'fa-store', title: 'Mercado de Artesanías', subtitle: 'Mercado Viejo de Masaya', text: 'Edificio histórico con hamacas, cerámica, madera, cuero y textiles de todo el país.', facts: [['Ubicación', 'Centro de Masaya'], ['Experiencia', 'Compra directa a talleres']] },
        { icon: 'fa-binoculars', title: 'Mirador de Catarina', subtitle: 'Pueblos Blancos', text: 'Balcón natural sobre la Laguna de Apoyo, con viveros y artesanía.', facts: [['Ubicación', 'Catarina'], ['Experiencia', 'Vistas, viveros y gastronomía']] }
      ],
      dishes: [
        { name: 'Chancho con yuca', ingredient: 'Cerdo, yuca y ensalada de repollo', how: 'Cerdo frito servido sobre yuca cocida', where: 'Ciudad de Masaya' },
        { name: 'Indio viejo', ingredient: 'Masa de maíz y carne', how: 'Guiso espeso con naranja agria y hierbabuena', where: 'Cocinas tradicionales' },
        { name: 'Nacatamal', ingredient: 'Masa, cerdo, arroz y especias', how: 'Envuelto en hoja de plátano y cocido por horas', where: 'Fines de semana en todo el departamento' }
      ],
      crafts: [
        { tag: 'Cerámica', title: 'Cerámica de San Juan de Oriente', community: 'San Juan de Oriente', text: 'Piezas torneadas y pintadas a mano con motivos precolombinos.' },
        { tag: 'Textil', title: 'Hamacas de Masaya', community: 'Ciudad de Masaya', text: 'Hamacas tejidas a mano en talleres familiares.' },
        { tag: 'Madera', title: 'Muebles y tallados', community: 'Masaya y Pueblos Blancos', text: 'Mecedoras, muebles de madera y mimbre hechos a mano.' }
      ],
      music: { text: 'Masaya es la cuna del folclor nicaragüense: marimba de arco, sones de toro y bailes de las fiestas de San Jerónimo.', items: [{ name: 'Marimba de arco', text: 'Instrumento emblemático que acompaña los bailes tradicionales.' }, { name: 'Torovenado', text: 'Baile satírico y popular de las fiestas de San Jerónimo.' }] },
      festivals: [
        { name: 'Fiestas de San Jerónimo', when: 'Desde el 30 de septiembre', where: 'Ciudad de Masaya', text: 'Las fiestas patronales más largas del país, con bailes, toros y procesiones.' },
        { name: 'Los Agüizotes', when: 'Último viernes de octubre', where: 'Monimbó', text: 'Desfile nocturno de personajes de leyenda: la Carreta Nagua, el Cadejo y la Llorona.' }
      ],
      heritage: ['Fortaleza El Coyotepe', 'Mercado Viejo de Masaya', 'Iglesia de San Jerónimo', 'Barrio indígena de Monimbó'],
      nature: { text: 'Volcanes, lagunas cratéricas y bosque seco. En las paredes del cráter Santiago anidan los chocoyos (pericos) que resisten los gases volcánicos.', species: ['Chocoyos del cráter', 'Aves de la Laguna de Apoyo', 'Bosque seco tropical'] },
      legends: [{ title: 'Los Agüizotes', text: 'Monimbó revive cada año los espantos de la tradición oral en un desfile nocturno: Carreta Nagua, Cadejo, Llorona y más.' }],
      routes: [
        { title: 'Pueblos Blancos', steps: ['Mirador de Catarina', 'Cerámica en San Juan de Oriente', 'Niquinohomo', 'Almuerzo de cocina local'] },
        { title: 'Volcán y artesanía', steps: ['Parque Nacional Volcán Masaya', 'Mercado de Artesanías', 'Fortaleza El Coyotepe'] }
      ],
      whatToBring: ['Calzado cómodo para los miradores', 'Agua y protector solar', 'Efectivo en córdobas para compras directas', 'Traje de baño para la Laguna de Apoyo'],
      sos: { hospital: 'Hospital Humberto Alvarado Vásquez, Masaya' }
    },

    granada: {
      timeline: [
        { period: '1524', title: 'Fundación', text: 'Francisco Hernández de Córdoba funda Granada a orillas del Cocibolca, una de las ciudades europeas más antiguas del continente.' },
        { period: 'Siglo XVII', title: 'Ataques piratas', text: 'Su riqueza comercial atrajo saqueos de piratas que llegaban por el río San Juan.' },
        { period: '1856', title: 'Incendio de Walker', text: 'Las tropas de William Walker incendian la ciudad durante la Guerra Nacional.' },
        { period: 'Hoy', title: 'Ciudad colonial viva', text: 'Su centro histórico, iglesias y casonas la convierten en uno de los destinos más visitados del país.' }
      ],
      signature: [
        { icon: 'fa-water', title: 'Isletas de Granada', subtitle: 'Archipiélago del Cocibolca', text: 'Cientos de pequeñas islas formadas por una antigua erupción del Mombacho, con aves y comunidades pescadoras.', facts: [['Acceso', 'Lancha desde el malecón o Puerto Asese'], ['Experiencia', 'Paseo en lancha y observación de aves']] },
        { icon: 'fa-mountain', title: 'Reserva Natural Volcán Mombacho', subtitle: 'Bosque nuboso', text: 'Senderos entre fumarolas, orquídeas y bosque nuboso con vistas a Granada y al lago.', facts: [['Experiencia', 'Senderos y miradores'], ['Clima', 'Fresco y húmedo en la cima']] },
        { icon: 'fa-landmark', title: 'Centro histórico', subtitle: 'Calle La Calzada, Catedral y La Merced', text: 'Recorrido a pie por la Catedral, el campanario de La Merced y la calle peatonal La Calzada hasta el lago.', facts: [['Experiencia', 'Caminata y arquitectura colonial']] },
        { icon: 'fa-monument', title: 'Convento San Francisco y Zapatera', subtitle: 'Arqueología del Cocibolca', text: 'El convento-museo guarda estatuas precolombinas de la isla Zapatera, hoy parque nacional.', facts: [['Ubicación', 'Centro de Granada / isla Zapatera']] }
      ],
      dishes: [
        { name: 'Vigorón', ingredient: 'Yuca, chicharrón y ensalada de repollo', how: 'Servido sobre hoja de chagüite (plátano)', where: 'Parque Central de Granada' },
        { name: 'Pescado del lago', ingredient: 'Guapote y mojarra del Cocibolca', how: 'Frito o en caldo', where: 'Isletas y malecón' }
      ],
      festivals: [
        { name: 'Festival Internacional de Poesía', when: 'Febrero (fecha anual variable)', where: 'Centro histórico', text: 'Poetas de todo el mundo leen en plazas e iglesias de la ciudad.' },
        { name: 'La Purísima y Gritería', when: '7 de diciembre', where: 'Toda la ciudad', text: 'Altares a la Virgen en casas y calles coloniales.' }
      ],
      heritage: ['Catedral de Granada', 'Iglesia La Merced', 'Convento San Francisco', 'Fortaleza La Pólvora', 'Parque Nacional Archipiélago Zapatera'],
      nature: { text: 'Lago, islas y volcán: el Mombacho tiene bosque nuboso y las isletas reúnen aves acuáticas.', species: ['Garzas y martines pescadores', 'Monos congo en algunas isletas', 'Orquídeas del Mombacho'] },
      routes: [
        { title: 'Granada a pie', steps: ['Catedral y Parque Central', 'Campanario de La Merced', 'Convento San Francisco', 'Calle La Calzada hasta el malecón'] },
        { title: 'Lago y volcán', steps: ['Lancha por las Isletas', 'Ascenso al Mombacho', 'Atardecer en el malecón'] }
      ],
      whatToBring: ['Sombrero y protector solar para el centro', 'Abrigo liviano para la cima del Mombacho', 'Calzado cómodo para caminar', 'Agua'],
      sos: { hospital: 'Hospital Amistad Japón–Nicaragua, Granada' }
    },

    managua: {
      timeline: [
        { period: 'Hace más de 2,000 años', title: 'Huellas de Acahualinca', text: 'Huellas humanas fosilizadas en ceniza volcánica a orillas del Xolotlán.' },
        { period: '1852', title: 'Capital de Nicaragua', text: 'Managua se convierte en capital, entre las rivales León y Granada.' },
        { period: '1931 y 1972', title: 'Terremotos', text: 'Dos terremotos destruyeron el centro; el de 1972 cambió para siempre la forma de la ciudad.' },
        { period: 'Hoy', title: 'Ciudad de lagunas', text: 'La capital convive con lagunas cratéricas, el lago Xolotlán y la costa del Pacífico.' }
      ],
      signature: [
        { icon: 'fa-shoe-prints', title: 'Huellas de Acahualinca', subtitle: 'Sitio arqueológico y museo', text: 'Huellas de personas y animales conservadas en ceniza volcánica, de más de dos milenios de antigüedad.', facts: [['Ubicación', 'Barrio Acahualinca, Managua']] },
        { icon: 'fa-water', title: 'Laguna de Tiscapa', subtitle: 'Reserva Natural', text: 'Laguna cratérica en el corazón de la ciudad, con miradores y canopy.', facts: [['Experiencia', 'Mirador y canopy']] },
        { icon: 'fa-feather', title: 'Reserva Natural Chocoyero–El Brujo', subtitle: 'Ticuantepe', text: 'Cascadas y paredes donde anidan miles de chocoyos, a poca distancia de la capital.', facts: [['Mejor hora', 'Temprano o al atardecer para ver los chocoyos']] },
        { icon: 'fa-umbrella-beach', title: 'Costa de San Rafael del Sur', subtitle: 'Pacífico de Managua', text: 'Playas como Masachapa y Pochomil para descansar frente al mar.', facts: [['Acceso', 'Carretera al Pacífico']] }
      ],
      dishes: [
        { name: 'Fritanga', ingredient: 'Gallo pinto, tajadas, carne asada y queso frito', how: 'A la plancha en puestos de esquina', where: 'Barrios de Managua' },
        { name: 'Baho', ingredient: 'Carne, plátano y yuca', how: 'Cocido al vapor en hojas de plátano', where: 'Domingos en fondas tradicionales' }
      ],
      festivals: [{ name: 'Santo Domingo de Guzmán', when: '1 al 10 de agosto', where: 'Managua', text: 'Fiestas patronales con promesantes pintados de aceite negro y la bajada y subida de "Minguito".' }],
      heritage: ['Huellas de Acahualinca', 'Antigua Catedral de Managua', 'Palacio Nacional de la Cultura', 'Loma de Tiscapa'],
      nature: { text: 'Lagunas volcánicas, el lago Xolotlán y reservas cercanas a la ciudad.', species: ['Chocoyos en El Chocoyero', 'Aves de las lagunas', 'Bosque seco'] },
      routes: [
        { title: 'Managua histórica', steps: ['Huellas de Acahualinca', 'Antigua Catedral y Palacio Nacional', 'Malecón del Xolotlán', 'Loma de Tiscapa'] },
        { title: 'Lagunas y naturaleza', steps: ['Laguna de Xiloá', 'Chocoyero–El Brujo', 'Atardecer en el Pacífico'] }
      ],
      whatToBring: ['Ropa liviana: Managua es calurosa todo el año', 'Agua', 'Protector solar', 'Calzado cómodo'],
      sos: { hospital: 'Hospital Escuela Antonio Lenín Fonseca y Hospital Fernando Vélez Paiz, Managua' }
    },

    carazo: {
      timeline: [
        { period: 'Raíz indígena', title: 'La meseta de los pueblos', text: 'Diriamba, Jinotepe y San Marcos crecen en la meseta fresca entre el Pacífico y el interior.' },
        { period: 'Siglo XIX', title: 'Café de la meseta', text: 'Carazo fue de los primeros departamentos cafetaleros del país.' },
        { period: '2005', title: 'El Güegüense, patrimonio de la humanidad', text: 'La UNESCO proclama El Güegüense obra maestra del patrimonio oral e inmaterial.' }
      ],
      signature: [
        { icon: 'fa-masks-theater', title: 'El Güegüense', subtitle: 'Patrimonio Oral e Inmaterial UNESCO (2005)', text: 'Teatro-danza satírico de la época colonial que se presenta en las fiestas de Diriamba.', facts: [['Dónde verlo', 'Fiestas de San Sebastián, Diriamba'], ['Cuándo', 'Enero']] },
        { icon: 'fa-shield-heart', title: 'Refugio Río Escalante–Chacocente', subtitle: 'Anidación de tortugas marinas', text: 'Playa protegida y bosque seco donde desovan tortugas marinas.', facts: [['Ubicación', 'Santa Teresa'], ['Regla BAQUEANO', 'Visitas nocturnas solo con guardaparques']] },
        { icon: 'fa-umbrella-beach', title: 'Playas de Carazo', subtitle: 'La Boquita, Casares y Huehuete', text: 'Costa de pescadores con comida de mar y atardeceres.', facts: [['Experiencia', 'Playa y mariscos']] }
      ],
      dishes: [
        { name: 'Mariscos de La Boquita', ingredient: 'Pescado y mariscos del día', how: 'Frito, en sopa o a la plancha', where: 'La Boquita y Casares' },
        { name: 'Café de la meseta', ingredient: 'Café de altura media', how: 'Colado en casa', where: 'San Marcos, Jinotepe y Diriamba' }
      ],
      crafts: [{ tag: 'Máscaras', title: 'Máscaras y trajes del Güegüense', community: 'Diriamba', text: 'Talladores y bordadoras mantienen los personajes del teatro-danza.' }],
      music: { text: 'El son del Güegüense se toca con violín, pito y tambor; acompaña también al Toro Huaco y al Gigante en las fiestas.', items: [{ name: 'Son del Güegüense', text: 'Violín, pito y tambor.' }, { name: 'El Toro Huaco', text: 'Danza tradicional de las fiestas de Diriamba.' }] },
      festivals: [
        { name: 'Fiestas de San Sebastián', when: 'Enero', where: 'Diriamba', text: 'El Güegüense, el Toro Huaco y el Gigante bailan en las calles.' },
        { name: 'Fiestas de Santiago', when: 'Julio', where: 'Jinotepe', text: 'Fiestas patronales con bailes tradicionales y procesiones.' }
      ],
      heritage: ['El Güegüense (UNESCO 2005)', 'Museo Ecológico de Trópico Seco (Diriamba)', 'Iglesias de Diriamba y Jinotepe'],
      nature: { text: 'De la meseta fresca al bosque seco de la costa, con playas de anidación de tortugas.', species: ['Tortugas marinas', 'Aves del bosque seco', 'Fauna del trópico seco'] },
      routes: [
        { title: 'Cultura del Güegüense', steps: ['Diriamba y su iglesia', 'Museo Ecológico de Trópico Seco', 'Talleres de máscaras', 'Jinotepe'] },
        { title: 'Costa caraceña', steps: ['La Boquita', 'Casares', 'Chacocente en temporada de anidación'] }
      ],
      whatToBring: ['Abrigo liviano para la meseta por la noche', 'Protector solar para la costa', 'Linterna roja para tortugas'],
      sos: { hospital: 'Hospital Regional Santiago, Jinotepe' }
    },

    esteli: {
      timeline: [
        { period: 'Raíz indígena', title: 'Valle de Estelí', text: 'Valle fértil rodeado de montañas en la región de Las Segovias.' },
        { period: 'Siglo XX', title: 'Tabaco', text: 'Estelí se convierte en un referente mundial de puros hechos a mano.' },
        { period: '1978–1979', title: 'Insurrección', text: 'La ciudad fue escenario de las insurrecciones que marcaron su memoria, visible hoy en sus murales.' }
      ],
      signature: [
        { icon: 'fa-leaf', title: 'Reserva Natural Miraflor', subtitle: 'Turismo rural comunitario', text: 'Bosque nuboso, orquídeas, aves y familias campesinas que reciben visitantes.', facts: [['Experiencia', 'Senderos, aves y vida en finca']] },
        { icon: 'fa-water', title: 'Reserva Tisey–La Estanzuela', subtitle: 'Salto de La Estanzuela', text: 'Cascada, pinares, miradores y las esculturas talladas en piedra en la montaña.', facts: [['Experiencia', 'Cascada y caminatas']] },
        { icon: 'fa-smoking', title: 'Fábricas de puros', subtitle: 'Tradición tabacalera', text: 'Recorridos por fábricas donde se enrolla el tabaco a mano.', facts: [['Ubicación', 'Ciudad de Estelí']] },
        { icon: 'fa-bone', title: 'Museo Paleontológico El Bosque', subtitle: 'Pueblo Nuevo', text: 'Fósiles de megafauna prehistórica encontrados en la zona.', facts: [['Ubicación', 'Pueblo Nuevo']] }
      ],
      dishes: [
        { name: 'Güirilas', ingredient: 'Maíz tierno', how: 'Tortilla dulce cocida en comal, con cuajada', where: 'Carreteras y mercados del norte' },
        { name: 'Cuajada y crema', ingredient: 'Leche de las fincas', how: 'Fresca, con tortilla', where: 'Todo el departamento' }
      ],
      crafts: [
        { tag: 'Barro', title: 'Cerámica de Ducualí Grande', community: 'Condega', text: 'Alfarería de mujeres que trabajan el barro con técnicas tradicionales.' },
        { tag: 'Piedra', title: 'Esculturas en piedra marmolina', community: 'San Juan de Limay', text: 'Piezas talladas en piedra suave por artesanos locales.' }
      ],
      heritage: ['Murales de Estelí', 'Museo Paleontológico El Bosque (Pueblo Nuevo)', 'Catedral de Estelí'],
      nature: { text: 'Montañas de Las Segovias con bosque nuboso, pinares y cascadas.', species: ['Orquídeas de Miraflor', 'Aves de bosque nuboso', 'Pinares'] },
      routes: [
        { title: 'Estelí y su tabaco', steps: ['Fábrica de puros', 'Murales del centro', 'Mercado y cocina local'] },
        { title: 'Montañas del norte', steps: ['Reserva Natural Miraflor', 'Salto de La Estanzuela', 'Cerámica de Condega'] }
      ],
      whatToBring: ['Abrigo: las noches son frescas', 'Calzado de montaña', 'Impermeable en época lluviosa', 'Repelente'],
      sos: { hospital: 'Hospital San Juan de Dios, Estelí' }
    },

    'nueva-segovia': {
      timeline: [
        { period: 'Siglo XVII', title: 'Ciudad Antigua', text: 'Antigua capital de Las Segovias, atacada por piratas; conserva su iglesia colonial.' },
        { period: '1927–1933', title: 'Sandino en Las Segovias', text: 'Las montañas segovianas fueron escenario de la lucha de Augusto C. Sandino, incluido el combate de Ocotal (1927).' },
        { period: 'Hoy', title: 'Café y pinares', text: 'Dipilto, Mozonte y Jalapa son tierra de café y bosques de pino.' }
      ],
      signature: [
        { icon: 'fa-mountain', title: 'Cerro Mogotón', subtitle: 'Punto más alto de Nicaragua', text: 'Reserva natural de pinares y bosque nuboso en la frontera norte.', facts: [['Regla BAQUEANO', 'Solo con guía local autorizado']] },
        { icon: 'fa-church', title: 'Ciudad Antigua', subtitle: 'Pueblo colonial', text: 'Calles empedradas e iglesia colonial con su imagen venerada.', facts: [['Experiencia', 'Historia colonial y tranquilidad']] },
        { icon: 'fa-mug-hot', title: 'Café de Dipilto', subtitle: 'Fincas de altura', text: 'Fincas entre pinares donde se produce café de altura.', facts: [['Experiencia', 'Recorridos de finca y catación']] }
      ],
      dishes: [
        { name: 'Rosquillas de Jalapa', ingredient: 'Maíz y cuajada', how: 'Horneadas en horno de leña', where: 'Jalapa' },
        { name: 'Café de altura', ingredient: 'Café de las fincas segovianas', how: 'Colado en casa', where: 'Dipilto y Mozonte' }
      ],
      music: { text: 'Polkas, mazurcas y música campesina segoviana acompañan las fiestas del norte.', items: [{ name: 'Música campesina', text: 'Guitarra, acordeón y violín en fiestas y ferias.' }] },
      heritage: ['Iglesia colonial de Ciudad Antigua', 'Ocotal y su centro histórico'],
      nature: { text: 'Pinares, bosque nuboso y el Mogotón en la frontera con Honduras.', species: ['Bosque de pino', 'Aves de altura'] },
      routes: [{ title: 'Ruta segoviana', steps: ['Ocotal', 'Ciudad Antigua', 'Fincas de café en Dipilto', 'Jalapa'] }],
      whatToBring: ['Abrigo para las noches frías', 'Calzado de montaña', 'Impermeable'],
      sos: { hospital: 'Hospital Alfonso Moncada Guillén, Ocotal' }
    },

    jinotega: {
      timeline: [
        { period: 'Raíz indígena', title: 'Pueblos del norte', text: 'Territorio de pueblos originarios en la zona montañosa del centro-norte.' },
        { period: '1927', title: 'San Rafael del Norte', text: 'Augusto C. Sandino se casa en San Rafael del Norte, donde hoy hay un museo dedicado a su memoria.' },
        { period: 'Hoy', title: 'Ciudad de las Brumas', text: 'Jinotega es uno de los principales departamentos productores de café del país.' }
      ],
      signature: [
        { icon: 'fa-water', title: 'Lago de Apanás', subtitle: 'Embalse de montaña', text: 'Lago artificial entre montañas con comunidades de pescadores.', facts: [['Experiencia', 'Paseo en lancha y pesca']] },
        { icon: 'fa-cross', title: 'Peña de la Cruz', subtitle: 'Mirador de Jinotega', text: 'Cerro con una cruz que domina la ciudad, con vista a todo el valle.', facts: [['Experiencia', 'Caminata y mirador']] },
        { icon: 'fa-tree', title: 'Bosawás y Datanlí–El Diablo', subtitle: 'Reservas del norte', text: 'Jinotega comparte la Reserva de Biosfera Bosawás y la Reserva Datanlí–El Diablo.', facts: [['Regla BAQUEANO', 'Visitas solo con guías y comunidades autorizadas']] }
      ],
      dishes: [{ name: 'Café de Jinotega', ingredient: 'Café de altura', how: 'Colado en finca', where: 'Fincas de todo el departamento' }],
      crafts: [{ tag: 'Barro', title: 'Cerámica negra', community: 'Jinotega', text: 'Piezas de barro de acabado negro pulido, tradición del norte del país.' }],
      festivals: [{ name: 'Fiestas de San Juan', when: '24 de junio', where: 'Jinotega', text: 'Fiestas patronales de la ciudad.' }],
      heritage: ['Museo de Sandino en San Rafael del Norte', 'Templo del Tepeyac (San Rafael del Norte)'],
      nature: { text: 'Montañas cafetaleras, bosque nuboso y parte de Bosawás, uno de los bosques más grandes de Centroamérica.', species: ['Aves de bosque nuboso', 'Bosque tropical de Bosawás'] },
      routes: [{ title: 'Café y brumas', steps: ['Peña de la Cruz', 'Finca cafetalera', 'Lago de Apanás', 'San Rafael del Norte'] }],
      whatToBring: ['Abrigo: es una de las zonas más frescas del país', 'Impermeable', 'Calzado de montaña'],
      sos: { hospital: 'Hospital Victoria Motta, Jinotega' }
    },

    matagalpa: {
      timeline: [
        { period: '1867', title: 'Nace Rubén Darío', text: 'El poeta nace en Metapa, hoy Ciudad Darío, en el departamento de Matagalpa.' },
        { period: 'Siglo XIX', title: 'Llega el café', text: 'Familias locales e inmigrantes europeos convierten las montañas en zona cafetalera.' },
        { period: 'Hoy', title: 'Perla del Septentrión', text: 'Matagalpa es un centro del café, el turismo rural y la música campesina.' }
      ],
      signature: [
        { icon: 'fa-tree', title: 'Selva Negra', subtitle: 'Finca y reserva', text: 'Bosque nuboso, senderos y finca cafetalera en las montañas.', facts: [['Experiencia', 'Senderos y café']] },
        { icon: 'fa-mug-hot', title: 'Museo del Café', subtitle: 'Ciudad de Matagalpa', text: 'Historia del café en Nicaragua contada desde la ciudad que lo hizo identidad.', facts: [['Ubicación', 'Centro de Matagalpa']] },
        { icon: 'fa-book-open', title: 'Casa natal de Rubén Darío', subtitle: 'Ciudad Darío', text: 'Museo en la casa donde nació el Príncipe de las Letras Castellanas.', facts: [['Ubicación', 'Ciudad Darío']] },
        { icon: 'fa-leaf', title: 'Reserva Cerro El Arenal', subtitle: 'Bosque nuboso', text: 'Bosque de musgos, orquídeas y aves entre Matagalpa y Jinotega.', facts: [['Experiencia', 'Senderismo y aves']] }
      ],
      dishes: [
        { name: 'Güirilas con cuajada', ingredient: 'Maíz tierno y cuajada', how: 'Tortilla dulce en comal', where: 'Carretera Sébaco–Matagalpa' },
        { name: 'Café de Matagalpa', ingredient: 'Café de altura', how: 'Colado en finca', where: 'Todo el departamento' }
      ],
      crafts: [{ tag: 'Barro', title: 'Cerámica negra', community: 'Matagalpa', text: 'Barro de acabado negro pulido, tradición compartida con Jinotega.' }],
      music: { text: 'Matagalpa celebra la música campesina del norte: polkas, mazurcas y jamaquellos.', items: [{ name: 'Festival de Polkas, Mazurcas y Jamaquellos', text: 'Encuentro de música y baile campesino del norte.' }] },
      heritage: ['Catedral de Matagalpa', 'Casa natal de Rubén Darío (Ciudad Darío)', 'Museo del Café'],
      nature: { text: 'Montañas de bosque nuboso con café bajo sombra.', species: ['Orquídeas', 'Aves de bosque nuboso', 'Monos congo'] },
      legends: [{ title: 'La Mocuana', text: 'Leyenda de la tradición oral nicaragüense asociada al cerro de la Mocuana, en Sébaco.' }],
      routes: [
        { title: 'Ruta del café', steps: ['Museo del Café', 'Selva Negra', 'Finca y catación', 'Cerro El Arenal'] },
        { title: 'Ruta dariana', steps: ['Ciudad Darío', 'Casa natal de Rubén Darío', 'Sébaco'] }
      ],
      whatToBring: ['Abrigo para la montaña', 'Impermeable', 'Calzado de senderismo'],
      sos: { hospital: 'Hospital Escuela César Amador Molina, Matagalpa' }
    },

    chontales: {
      timeline: [
        { period: 'Prehispánico', title: 'Estatuaria chontal', text: 'Los pueblos de la región tallaron grandes estatuas de piedra que hoy se conservan en Juigalpa.' },
        { period: 'Colonia y siglo XIX', title: 'Ganadería', text: 'Las llanuras y serranías se dedicaron a la ganadería, base de su identidad.' },
        { period: 'Hoy', title: 'Ganadería y minería', text: 'Juigalpa, Santo Domingo y La Libertad combinan ganado, minería y cultura campesina.' }
      ],
      signature: [
        { icon: 'fa-monument', title: 'Museo Gregorio Aguilar Barea', subtitle: 'Juigalpa', text: 'Colección de estatuas prehispánicas de piedra de la región chontal.', facts: [['Ubicación', 'Juigalpa']] },
        { icon: 'fa-mountain', title: 'Serranía de Amerrisque', subtitle: 'Cordillera chontaleña', text: 'Montañas, ríos y miradores sobre la llanura ganadera.', facts: [['Experiencia', 'Senderismo y paisaje']] },
        { icon: 'fa-church', title: 'Cuapa', subtitle: 'Santuario mariano', text: 'Lugar de peregrinación desde 1980.', facts: [['Ubicación', 'Cuapa']] }
      ],
      dishes: [
        { name: 'Quesos y cuajada', ingredient: 'Leche de las haciendas', how: 'Quesillo, cuajada y queso seco', where: 'Juigalpa y comunidades ganaderas' },
        { name: 'Carne asada', ingredient: 'Res de la región', how: 'A la brasa', where: 'Todo el departamento' }
      ],
      festivals: [{ name: 'Fiestas patronales de Juigalpa', when: 'Agosto', where: 'Juigalpa', text: 'Hípicas, música y tradición ganadera.' }],
      heritage: ['Museo Gregorio Aguilar Barea (Juigalpa)', 'Estatuaria prehispánica chontal'],
      nature: { text: 'Llanuras ganaderas, ríos y la serranía de Amerrisque cerca del Cocibolca.', species: ['Aves de llanura', 'Bosque de galería'] },
      routes: [{ title: 'Chontales esencial', steps: ['Museo de Juigalpa', 'Mirador de la serranía', 'Hacienda ganadera', 'Cuapa'] }],
      whatToBring: ['Protector solar y gorra', 'Calzado cerrado para el campo', 'Agua'],
      sos: { hospital: 'Hospital Regional Asunción, Juigalpa' }
    },

    boaco: {
      timeline: [
        { period: 'Raíz indígena', title: 'Pueblos del centro', text: 'Territorio de pueblos originarios en las montañas centrales.' },
        { period: 'Colonia y siglo XIX', title: 'Ganadería', text: 'Boaco se consolida como tierra ganadera y lechera.' },
        { period: 'Hoy', title: 'Ciudad de dos pisos', text: 'La cabecera se levanta en dos niveles sobre la ladera, de ahí su apodo.' }
      ],
      signature: [
        { icon: 'fa-city', title: 'Boaco, ciudad de dos pisos', subtitle: 'Cabecera departamental', text: 'Parte alta y parte baja unidas por calles en pendiente con vista al valle.', facts: [['Experiencia', 'Caminata y miradores']] },
        { icon: 'fa-mountain', title: 'Santa Lucía', subtitle: 'Pueblo entre cerros', text: 'Pueblo rodeado de montañas, ideal para caminatas y turismo rural.', facts: [['Experiencia', 'Senderismo y vida rural']] },
        { icon: 'fa-hat-cowboy', title: 'Sombreros de pita de Camoapa', subtitle: 'Artesanía', text: 'Sombreros tejidos a mano con fibra de pita.', facts: [['Ubicación', 'Camoapa']] }
      ],
      dishes: [{ name: 'Lácteos boaqueños', ingredient: 'Leche de la región', how: 'Cuajada, quesillo y crema', where: 'Todo el departamento' }],
      crafts: [{ tag: 'Fibra', title: 'Tejido de pita', community: 'Camoapa', text: 'Sombreros y piezas tejidas con fibra de pita.' }],
      festivals: [{ name: 'Fiestas de Santiago Apóstol', when: 'Julio', where: 'Boaco', text: 'Fiestas patronales con tradición ganadera.' }],
      nature: { text: 'Montañas, ríos y llanuras ganaderas en el centro del país.', species: ['Aves de montaña', 'Bosque seco y de galería'] },
      routes: [{ title: 'Boaco rural', steps: ['Ciudad de dos pisos', 'Santa Lucía', 'Camoapa y su pita'] }],
      whatToBring: ['Calzado para pendientes', 'Abrigo liviano en las alturas', 'Agua'],
      sos: { hospital: 'Hospital José Nieborowski, Boaco' }
    },

    'rio-san-juan': {
      timeline: [
        { period: '1675', title: 'Fortaleza de la Inmaculada Concepción', text: 'Se termina la fortaleza de El Castillo para frenar a piratas que remontaban el río.' },
        { period: '1762', title: 'Rafaela Herrera', text: 'La joven Rafaela Herrera dirige la defensa del fuerte frente a un ataque británico.' },
        { period: '1780', title: 'Expedición de Nelson', text: 'Una expedición británica en la que participó Horatio Nelson intenta tomar el río.' },
        { period: 'Hoy', title: 'Selva y agua', text: 'Reservas como Indio Maíz y Los Guatuzos protegen algunos de los bosques más ricos del país.' }
      ],
      signature: [
        { icon: 'fa-chess-rook', title: 'El Castillo', subtitle: 'Fortaleza de la Inmaculada Concepción', text: 'Fortaleza colonial sobre los raudales del río San Juan.', facts: [['Acceso', 'Lancha desde San Carlos'], ['Experiencia', 'Historia y vida ribereña']] },
        { icon: 'fa-palette', title: 'Archipiélago de Solentiname', subtitle: 'Arte primitivista', text: 'Islas de pintores y talladores de madera de balsa en el Cocibolca.', facts: [['Acceso', 'Lancha desde San Carlos']] },
        { icon: 'fa-tree', title: 'Reserva Biológica Indio Maíz', subtitle: 'Selva tropical', text: 'Una de las selvas mejor conservadas de Centroamérica.', facts: [['Regla BAQUEANO', 'Solo en zonas habilitadas y con guía']] },
        { icon: 'fa-feather', title: 'Refugio Los Guatuzos', subtitle: 'Humedales', text: 'Humedales y ríos con aves, caimanes y monos.', facts: [['Experiencia', 'Paseo en lancha y observación de aves']] }
      ],
      dishes: [{ name: 'Pescado de río y lago', ingredient: 'Guapote, mojarra y camarón de río', how: 'Frito o en sopa', where: 'San Carlos y El Castillo' }],
      crafts: [{ tag: 'Arte', title: 'Pintura primitivista y tallas de balsa', community: 'Solentiname', text: 'Pinturas de colores vivos y animales tallados en madera de balsa.' }],
      heritage: ['Fortaleza de la Inmaculada Concepción (El Castillo)', 'Arte de Solentiname'],
      nature: { text: 'Río, lago y selva tropical: uno de los territorios más biodiversos del país.', species: ['Sábalo real (pesca deportiva regulada)', 'Monos y perezosos', 'Caimanes', 'Aves acuáticas'] },
      routes: [
        { title: 'Río San Juan', steps: ['San Carlos', 'Lancha por el río', 'El Castillo', 'Sendero en Indio Maíz'] },
        { title: 'Islas del arte', steps: ['San Carlos', 'Solentiname', 'Talleres de pintura y tallado'] }
      ],
      whatToBring: ['Impermeable y bolsa seca', 'Repelente', 'Botas de hule para la selva', 'Efectivo'],
      sos: { hospital: 'Hospital Luis Felipe Moncada, San Carlos' }
    },

    raccn: {
      timeline: [
        { period: 'Ancestral', title: 'Pueblos originarios', text: 'Territorio de los pueblos miskitu y mayangna, junto a comunidades creoles y mestizas.' },
        { period: '1997', title: 'Bosawás, Reserva de Biosfera', text: 'La UNESCO declara Bosawás Reserva de Biosfera.' },
        { period: 'Hoy', title: 'Autonomía', text: 'La región se organiza bajo el régimen de autonomía de la Costa Caribe.' }
      ],
      signature: [
        { icon: 'fa-water', title: 'Río Coco (Wangki)', subtitle: 'Waspam', text: 'El río más largo de Centroamérica, eje de la vida miskitu.', facts: [['Regla BAQUEANO', 'Visitas coordinadas con las comunidades']] },
        { icon: 'fa-tree', title: 'Reserva de Biosfera Bosawás', subtitle: 'UNESCO (1997)', text: 'Uno de los bosques tropicales más extensos de Centroamérica, territorio mayangna y miskitu.', facts: [['Regla BAQUEANO', 'Solo con autorización comunitaria']] },
        { icon: 'fa-anchor', title: 'Bilwi (Puerto Cabezas)', subtitle: 'Puerto del Caribe', text: 'Ciudad portuaria con muelle, playa y cultura miskita.', facts: [['Experiencia', 'Muelle, mercado y playa']] }
      ],
      dishes: [
        { name: 'Wabul', ingredient: 'Guineo o plátano cocido', how: 'Bebida espesa tradicional miskita', where: 'Comunidades miskitu' },
        { name: 'Rondón', ingredient: 'Pescado, coco y tubérculos', how: 'Guiso en leche de coco', where: 'Bilwi y comunidades costeras' }
      ],
      heritage: ['Lenguas miskitu y mayangna', 'Reserva de Biosfera Bosawás'],
      nature: { text: 'Selva, ríos, sabanas de pino y costa caribeña.', species: ['Jaguar y danto en Bosawás', 'Aves tropicales', 'Sabanas de pino caribe'] },
      routes: [{ title: 'Bilwi y la costa', steps: ['Muelle de Bilwi', 'Mercado y cocina miskita', 'Comunidades costeras (con coordinación)'] }],
      whatToBring: ['Impermeable', 'Repelente', 'Efectivo: no hay cajeros en todas las comunidades', 'Permisos y contacto comunitario confirmados'],
      sos: { hospital: 'Hospital Nuevo Amanecer, Bilwi' }
    },

    raccs: {
      timeline: [
        { period: 'Ancestral', title: 'Pueblos del Caribe Sur', text: 'Territorio de creoles, garífunas, rama, mayangna, miskitu y mestizos.' },
        { period: 'Siglo XIX', title: 'Bluefields', text: 'Bluefields se consolida como centro de la Costa Caribe Sur.' },
        { period: 'Hoy', title: 'Autonomía y diversidad', text: 'La región es un mosaico de lenguas, músicas y cocinas.' }
      ],
      signature: [
        { icon: 'fa-umbrella-beach', title: 'Corn Islands', subtitle: 'Big Corn y Little Corn', text: 'Islas caribeñas de arena blanca, arrecifes y cultura creole.', facts: [['Acceso', 'Avión o barco desde Bluefields']] },
        { icon: 'fa-water', title: 'Laguna de Perlas', subtitle: 'Comunidades y cayos', text: 'Laguna costera con comunidades creoles, garífunas y miskitu, y los Cayos Perlas.', facts: [['Acceso', 'Lancha desde Bluefields']] },
        { icon: 'fa-music', title: 'Bluefields', subtitle: 'Capital del Palo de Mayo', text: 'Ciudad caribeña de música, bahía y mercado.', facts: [['Experiencia', 'Cultura creole y mercado']] }
      ],
      dishes: [
        { name: 'Rondón (Run down)', ingredient: 'Pescado, leche de coco y tubérculos', how: 'Guiso lento en leche de coco', where: 'Bluefields y Corn Islands' },
        { name: 'Pan de coco', ingredient: 'Harina y coco', how: 'Horneado', where: 'Toda la costa' },
        { name: 'Patí', ingredient: 'Masa rellena de carne', how: 'Empanada horneada y picante', where: 'Bluefields' }
      ],
      music: { text: 'El Caribe Sur se baila: Palo de Mayo creole y la música garífuna mantienen viva la herencia afrocaribeña.', items: [{ name: 'Palo de Mayo', text: 'Fiesta y baile creole de Bluefields en mayo.' }, { name: 'Música garífuna', text: 'Tambores y cantos garífunas en Orinoco y Laguna de Perlas.' }] },
      festivals: [
        { name: 'Palo de Mayo (Mayo Ya!)', when: 'Mayo', where: 'Bluefields', text: 'Un mes de música, desfiles y baile alrededor del palo.' },
        { name: 'Día de la llegada garífuna', when: '19 de noviembre', where: 'Orinoco', text: 'Celebración de la herencia garífuna.' }
      ],
      heritage: ['Palo de Mayo', 'Lenguas y culturas creole, garífuna y rama'],
      nature: { text: 'Lagunas, manglares, cayos y arrecifes del Caribe.', species: ['Arrecifes de coral', 'Manglares', 'Aves marinas'] },
      routes: [
        { title: 'Caribe esencial', steps: ['Bluefields', 'Laguna de Perlas', 'Cayos Perlas (con operador autorizado)'] },
        { title: 'Islas del maíz', steps: ['Big Corn', 'Little Corn', 'Snorkel en arrecifes'] }
      ],
      whatToBring: ['Protector solar biodegradable', 'Impermeable', 'Efectivo', 'Bolsa seca para lanchas'],
      sos: { hospital: 'Hospital Regional Ernesto Sequeira Blanco, Bluefields' }
    }
  });
})(window);
