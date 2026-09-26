// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — EXPERIENCIA INTEGRAL MADRIZ (madriz-experience.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia interactiva de alta fidelidad para el departamento de
//   Madriz ("Tierra de Cañones Milenarios, Rosquillas Doradas, Café y Montañas"),
//   permitiendo al visitante comprender la profunda conexión entre el Geoparque
//   Mundial UNESCO Río Coco, la vida campesina, el café de altura, la memoria indígena
//   y la cocina del maíz.
// - Implementar la jerarquía territorial de navegación soberana:
//   Nicaragua ➔ Madriz ➔ 9 Municipios ➔ Finca / Taller ➔ Experiencia ➔ Reserva / Mapa.
// - Conectar de forma directa con cooperativas campesinas, artesanas y baqueanos
//   sin intermediarios comerciales.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Controlador dinámico expuesto en `window.BaqueanoMadriz`.
// - Renderizado reactivo a 60fps con efectos Glassmorphism, paleta oficial
//   (#165D6F, #F65E01, #F4E6C1, #0F172A) y cero dependencias pesadas.
// - Soporte para visor de galería fotográfica con imágenes reales del Cañón de Somoto,
//   modo explorador científico interactivo con pestañas geológicas, selector
//   individual de los 9 municipios con modal descriptivo, reproductor sonoro y
//   fichas humanas verificadas.
// - Cumplimiento estricto de la política de precios transparentes y sellos éticos:
//   PRECIO VERIFICADO, PATRIMONIO CULTURAL VERIFICADO y TRADICIÓN ORAL.
//
// 📦 3. QUÉ (WHAT / COMPONENTES EXPUESTOS):
// - `window.BaqueanoMadriz.renderMadrizExperience(container, dept)`
// - `window.BaqueanoMadriz.openMunicipalityModal(munId)`
// - `window.BaqueanoMadriz.switchGeologyTab(tabId)`
// - `window.BaqueanoMadriz.playGeologyAudio()`
// - `window.BaqueanoMadriz.openPhotoModal(src, caption)`
// ============================================================================

(function () {
  'use strict';

  // Base de datos enriquecida de los 9 municipios para la navegación individual
  const MUNICIPIOS_DETALLE = {
    'somoto': {
      name: 'Somoto',
      badge: 'Cabecera Departamental',
      title: 'La Puerta del Cañón, Rosquillas y Fiestas Tradicionales',
      altitude: '700 msnm',
      distanceManagua: '216 km (Carretera Panamericana Norte)',
      desc: 'Somoto es la cabecera departamental de Madriz y la puerta de entrada al Monumento Nacional Cañón de Somoto. Su identidad gira en torno a sus talleres tradicionales de rosquillas doradas en hornos de barro, su arquitectura colonial de templos declarados Patrimonio de la Nación y las emblemáticas fiestas patronales de Santiago Apóstol.',
      vivi: ['Navegación e interpretación geológica en el Cañón de Somoto', 'Visita a talleres familiares de rosquillas recién salidas del horno', 'Recorrido por el centro histórico y templo parroquial', 'Festival de los Burritos Somoteños en julio', 'Mirador La Cruz de Somoto'],
      geosites: ['Cañón de Somoto (Geositio UNESCO)', 'Cerro Volcán de Somoto (1,730 m)'],
      cooperatives: 'Cooperativa de Guías Comunitarios del Cañón · Asociación de Rosquilleras Somoteñas',
      howToGet: 'Terminal El Mayoreo en Managua directo hacia la terminal municipal de Somoto (3.5 - 4 horas).',
      image: 'assets/images/madriz/canon_somoto_panoramica.jpg'
    },
    'yalaguina': {
      name: 'Yalagüina',
      badge: 'Tierra del Maíz & Leyendas',
      title: 'Tradición Rosquillera y Paisajes de Bosque Seco',
      desc: 'Yalagüina comparte con Somoto la centenaria tradición rosquillera de Las Segovias. Alberga importantes áreas ecológicas como el Parque Natural Zonzapote, el Cerro El Cobre y la mítica Poza Bruja, escenario de vivas leyendas campesinas y polkas norteñas.',
      vivi: ['Ruta vivencial del maíz en hornos tradicionales de leña', 'Senderismo en Parque Natural Zonzapote', 'Mirador Cerro Quizuca', 'Música de polkas y mazurcas campesinas', 'Gastronomía de güirilas y atol agrio'],
      geosites: ['Cerro El Cobre', 'Poza Bruja'],
      cooperatives: 'Talleres familiares de mujeres rosquilleras de Yalagüina',
      howToGet: 'Ubicada sobre la Panamericana Norte, 15 minutos antes de llegar a Somoto.',
      image: 'assets/images/madriz/canon_somoto_interior.png'
    },
    'totogalpa': {
      name: 'Totogalpa',
      badge: 'Comunidad Indígena Ancestral',
      title: 'Memoria Prehispánica, Iglesia Monumental y Turismo Rural',
      desc: 'Totogalpa posee un arraigo indígena ininterrumpido. Su templo parroquial está oficialmente registrado como Patrimonio Cultural de la Nación. En la comunidad de San José de Palmira se desarrollan experiencias de ecoturismo campesino con senderismo, cabalgatas y cocina local.',
      vivi: ['Visita a la comunidad indígena de San José de Palmira', 'Museo Comunitario El Almendro junto al parque municipal', 'Apreciación del templo colonial parroquial', 'Cabalgatas por serranías y bosques de roble', 'Gastronomía preparada por familias locales'],
      geosites: ['San José de Palmira', 'Manantiales de montaña'],
      cooperatives: 'Cooperativa Ecoturística Indígena San José de Palmira',
      howToGet: 'A 10 km al norte de Somoto hacia Ocotal sobre la Carretera Panamericana.',
      image: 'assets/images/madriz/canon_somoto_bote.png'
    },
    'san-lucas': {
      name: 'San Lucas',
      badge: 'Alfarería de Barro Ancestral',
      title: 'Mujeres Artesanas de Loma Panda y Geositio La Remedona',
      desc: 'San Lucas es baluarte de la memoria indígena de Madriz. Las reconocidas Mujeres Artesanas de Loma Panda conservan técnicas alfareras prehispánicas en barro cocido. Además forma parte del Geoparque UNESCO con el geositio La Remedona.',
      vivi: ['Taller vivencial de modelado en barro con artesanas de Loma Panda', 'Caminata geológica hacia el Geositio La Remedona', 'Recorrido por fincas campesinas agroecológicas', 'Música tradicional con guitarras de cedro', 'Convivencia rural y saberes ancestrales'],
      geosites: ['Geositio La Remedona (Geoparque Río Coco)'],
      cooperatives: 'Asociación de Mujeres Artesanas de Loma Panda',
      howToGet: 'A 12 km al suroeste de Somoto por carretera de todo tiempo.',
      image: 'assets/images/madriz/canon_somoto_panoramica.jpg'
    },
    'las-sabanas': {
      name: 'Las Sabanas',
      badge: 'Nebliselva & Laguna La Bruja',
      title: 'Montaña Fría, Humedales de Altura y Café de Altura',
      desc: 'El municipio de Las Sabanas se asienta en las faldas de la Reserva Natural Tepesomoto-La Pataste, alcanzando más de 1,700 msnm con clima templado. En la comunidad El Pegador se ubica la emblemática Laguna La Bruja, con senderismo, paseos en lancha y avistamiento de aves.',
      vivi: ['Senderismo y avistamiento de aves en Laguna La Bruja', 'Paseos en lancha y canopy sobre la laguna', 'Visita a cafetales de sombra y pinares', 'Caminatas a miradores de nebliselva', 'Fotografía de orquídeas y helechos gigantes'],
      geosites: ['Laguna La Bruja (Reserva Tepesomoto-La Pataste)'],
      cooperatives: 'Comité Ecoturístico Comunitario El Pegador',
      howToGet: 'Desde Somoto tomando el desvío hacia San José de Cusmapa (aprox. 45 min).',
      image: 'assets/images/destinos/cascada_la_luna.jpg'
    },
    'san-jose-de-cusmapa': {
      name: 'San José de Cusmapa',
      badge: 'El Gran Balcón de Madriz',
      title: 'El Municipio Más Alto, Miradores al Pacífico y Artesanía en Pino',
      desc: 'Cusmapa se alza como el gran balcón de Las Segovias. Desde el Mirador El Balcón se aprecian vistas panorámicas hacia el Golfo de Fonseca y volcanes del Pacífico. Sus artesanas son maestras del tejido fino en acícula de pino y sus músicos tocan dulzaina, maracas y acordeón.',
      vivi: ['Mirador El Balcón con vistas infinitas hacia el Pacífico', 'Taller de cestería con hojas secas (acícula) de pino', 'Exploración de la mística Cueva de la Tuma', 'Recorrido por la formación natural La Mano del Diablo', 'Música de polkas y mazurcas campesinas'],
      geosites: ['Mirador El Balcón', 'La Mano del Diablo', 'Piedra de Orocuina'],
      cooperatives: 'Cooperativa de Artesanas en Acícula de Pino de Cusmapa',
      howToGet: 'A 38 km al sur de Somoto atravesando Las Sabanas por camino panorámico.',
      image: 'assets/images/destinos/canon_de_somoto.jpg'
    },
    'san-juan-del-rio-coco': {
      name: 'San Juan del Río Coco',
      badge: 'Territorio del Café de Estricta Altura',
      title: 'Cafetales de Sombra, Parque Natural El Majaste y Cascadas',
      desc: 'San Juan del Río Coco es el epicentro cafetalero de Madriz. Sus montañas de clima brumoso y laderas fértiles producen café orgánico de exportación. Destacan el Parque Natural El Majaste, caídas de agua cristalinas y fincas agroecológicas vivenciales.',
      vivi: ['Ruta del Café: de la recolección en mata al tostado y catación', 'Recorrido ecológico por el Parque Natural El Majaste', 'Senderismo a cascadas de montaña', 'Cabalgatas por cafetales y robledales', 'Hospedaje rural en fincas cafetaleras'],
      geosites: ['Parque Natural El Majaste', 'Cascadas del Río Coco'],
      cooperatives: 'Cooperativas Cafetaleras de Estricta Altura de San Juan del Río Coco',
      howToGet: 'Desde Telpaneca o Palacagüina tomando la vía pavimentada hacia el este (aprox. 1.5 horas desde Somoto).',
      image: 'assets/images/destinos/selva_negra.jpg'
    },
    'telpaneca': {
      name: 'Telpaneca',
      badge: 'Pueblo Histórico Ribereño',
      title: 'A Orillas del Sagrado Río Coco (Wangki) y Memoria Precolombina',
      desc: 'Telpaneca tiene raíces precolombinas documentadas y su desarrollo está ligado a las riberas del Río Coco. Conserva un variado recetario campesino ancestral, la Reserva Hídrica El Malacate, petroglifos en El Limón y un majestuoso templo dedicado a Cristo Rey.',
      vivi: ['Paseo por las riberas del Río Coco (Wangki)', 'Visita a la Reserva Hídrica El Malacate', 'Ruta de petroglifos de El Limón', 'Degustación de cocina ancestral de maíz y yuca', 'Música campesina ribereña'],
      geosites: ['Riberas del Río Coco', 'Reserva Hídrica El Malacate'],
      cooperatives: 'Colectivo Agroecológico y Cultural de Telpaneca',
      howToGet: 'A 28 km al este de Palacagüina en ruta hacia San Juan del Río Coco.',
      image: 'assets/images/destinos/Fortaleza de la Inmaculada Concepción.jpg'
    },
    'palacaguina': {
      name: 'Palacagüina',
      badge: 'Historia & Cancionero Segoviano',
      title: 'Memoria de las Gestas Patrias y Cerro de la Iguana',
      desc: 'Palacagüina resguarda episodios clave de la historia de Las Segovias. Inmortalizada por la tonada "El Cristo de Palacagüina", su paisaje está custodiado por el Cerro de la Iguana, la formación rocosa Piedra del Sapo y la antigua iglesia colonial María Reina.',
      vivi: ['Caminata histórica por el centro y templo colonial María Reina', 'Ascenso y mirador en el Cerro de la Iguana', 'Visita a la formación Piedra del Sapo', 'Ruta de monumentos al general Miguel Ángel Ortez', 'Gastronomía de sopa de albóndigas y tortillas calientes'],
      geosites: ['Cerro de la Iguana', 'Piedra del Sapo'],
      cooperatives: 'Productores agroforestales y guías comunitarios de Palacagüina',
      howToGet: 'Sobre el nudo vial de la Carretera Panamericana y el ramal hacia San Juan del Río Coco.',
      image: 'assets/images/madriz/canon_somoto_interior.png'
    }
  };

  // Matriz de Gastronomía Ancestral del Maíz
  const MATRIZ_MAIZ = [
    {
      plato: 'Rosquillas de Somoto y Yalagüina',
      ingrediente: 'Maíz blanco nitzamalizado, queso seco criollo, mantequilla de hacienda, cuajada',
      quienPrepara: 'Matriarcas rosquilleras en talleres familiares dirigidos tradicionalmente por mujeres',
      comoCocina: 'Masa fina sobada a mano, moldeada en argollas y dorada a doble cocción en horno de leña de barro',
      cuandoConsume: 'Todo el año, compañera inseparable del café de la mañana y la tarde segoviana',
      dondeProbar: 'Talleres tradicionales de Somoto y Yalagüina (Ruta de las Rosquillas Verificada)'
    },
    {
      plato: 'Montucas Madricenses',
      ingrediente: 'Maíz tierno de elote, manteca de cerdo o leche entera, pollo sazonado con hierbabuena y chile congo',
      quienPrepara: 'Cizineras tradicionales campesinas de Somoto y Telpaneca',
      comoCocina: 'Masa tierna molida y condimentada, envuelta en la propia tuza del elote y hervida al vapor de leña',
      cuandoConsume: 'Fines de semana, temporada de cosecha de maíz (agosto a noviembre) y ferias campesinas',
      dondeProbar: 'Comedores comunitarios y mercados municipales de Somoto y Telpaneca'
    },
    {
      plato: 'Hojaldras y Viejitas de Panela',
      ingrediente: 'Maíz seleccionado, dulce de panela (rapadura de caña) de molienda y cuajada madura',
      quienPrepara: 'Artesanas reposteras campesinas de Las Segovias',
      comoCocina: 'Crujientes piezas horneadas con corazón dulce derretido que carameliza la masa',
      cuandoConsume: 'Desayunos, meriendas campesinas y festividades patronales',
      dondeProbar: 'Puestos y cooperativas de rosquilleras en la Panamericana y centros urbanos'
    },
    {
      plato: 'Güirilas con Cuajada de Hacienda',
      ingrediente: 'Maíz elote tierno recién cosechado, sal y cuajada fresca de ordeño',
      quienPrepara: 'Madres y productoras de comunidades rurales de Palacagüina y Totogalpa',
      comoCocina: 'Masa molida sin manteca ni agua, asada a fuego lento sobre hoja de plátano en comal de barro',
      cuandoConsume: 'En toda época de maíz nuevo, servida bien caliente con mantequilla fresca',
      dondeProbar: 'Paradas tradicionales en empalmes de Yalagüina y Palacagüina'
    }
  ];

  // Fichas humanas: Conocé a su gente
  const GENTE_MADRIZ = [
    {
      categoria: 'Baqueanos del Cañón',
      rol: 'Guías Comunitarios de Aventura',
      nombre: 'Don Manuel & Guías Comunitarios de Sonís',
      comunidad: 'Comunidad Sonís, Cañón de Somoto',
      desc: 'Nacidos a orillas del Cañón antes de su declaración oficial en 2006. Conocen cada cueva, la profundidad de cada poza y la historia geológica de las paredes.',
      verificado: true
    },
    {
      categoria: 'Productoras de Rosquillas',
      rol: 'Matriarcas de la Economía Familiar',
      nombre: 'Doña Vilma & Red de Talleres Rosquilleros',
      comunidad: 'Somoto y Yalagüina',
      desc: 'Más de 40 años manteniendo vivo el oficio con recetas transmitidas de abuelas a nietas. Emprendimientos encabezados por mujeres campesinas.',
      verificado: true
    },
    {
      categoria: 'Familias Cafetaleras',
      rol: 'Café de Estricta Altura Sostenible',
      nombre: 'Familia Gutiérrez & Cooperativas El Majaste',
      comunidad: 'San Juan del Río Coco',
      desc: 'Productores agroecológicos que cultivan bajo sombra protegiendo las fuentes hídricas del Río Coco y la biodiversidad de nebliselva.',
      verificado: true
    },
    {
      categoria: 'Mujeres Artesanas del Barro',
      rol: 'Cerámica Ancestral de Loma Panda',
      nombre: 'Colectivo Artesanas de Loma Panda',
      comunidad: 'San Lucas',
      desc: 'Manos indígenas que moldean vasijas, cántaros y piezas ornamentales extrayendo y purificando el barro con técnicas precolombinas.',
      verificado: true
    },
    {
      categoria: 'Artesanas de Acícula de Pino',
      rol: 'Tejido Ecológico de Montaña',
      nombre: 'Asociación de Mujeres de Cusmapa',
      comunidad: 'San José de Cusmapa',
      desc: 'Transforman las agujas secas caídas del pino en cestas aromáticas, paneras y joyería vegetal sin talar un solo árbol.',
      verificado: true
    },
    {
      categoria: 'Comunidades Indígenas',
      rol: 'Memoria Viva y Turismo Rural',
      nombre: 'Consejo Comunitario San José de Palmira',
      comunidad: 'Totogalpa',
      desc: 'Familias campesinas indígenas que ofrecen hospedaje rural, cabalgatas y senderismo respetuoso compartiendo sus raíces originarias.',
      verificado: true
    }
  ];

  // Función principal de renderizado
  function renderMadrizExperience(container, dept) {
    if (!container) return;

    // Actualizar Hero específico de Madriz
    updateHeroMadriz(dept);

    // Contenedor principal de contenidos
    const html = `
      <!-- BLOQUE 0: MANIFIESTO PRINCIPAL -->
      <section class="madriz-manifesto-strip">
        <div class="container">
          <div class="manifesto-card-alta-gama">
            <div class="manifesto-badge-row">
              <span class="m-badge-primary"><i class="fa-solid fa-earth-americas"></i> Geoparque Mundial UNESCO Río Coco</span>
              <span class="m-badge-secondary"><i class="fa-solid fa-mountain"></i> 9 Municipios Segovianos</span>
              <span class="m-badge-accent"><i class="fa-solid fa-users"></i> Ecoturismo Sin Intermediarios</span>
            </div>
            <h2 class="manifesto-headline">No vengás solamente a conocer Madriz. Vení a comprenderlo.</h2>
            <p class="manifesto-copy">
              Madriz combina valles elevados, serranías, bosques de nebliselva, áreas cafetaleras de estricta altura,
              comunidades rurales de profunda memoria indígena y una de las expresiones gastronómicas más reconocibles de Nicaragua.
              Aquí no existe una sola forma de viajar: podés entrar entre paredes volcánicas milenarias en el Cañón de Somoto,
              aprender con artesanas que tejen acícula de pino o moldean barro, conversar con familias cafetaleras y escuchar polkas
              y mazurcas que siguen latiendo en la vida comunitaria del norte.
            </p>
            <div class="manifesto-action-bar">
              <a href="#losNueveMadriz" class="btn-hero-primary"><i class="fa-solid fa-compass"></i> Explorar sus 9 Municipios</a>
              <a href="#modoCientifico" class="btn-hero-secondary"><i class="fa-solid fa-microscope"></i> Modo Geológico Científico</a>
              <button type="button" class="btn-hero-glass open-planner-btn"><i class="fa-solid fa-wand-magic-sparkles"></i> Planificar con IA</button>
              <button type="button" class="btn-hero-glass" id="btnSaveMadrizTrip"><i class="fa-regular fa-bookmark"></i> Guardar en Mi Viaje</button>
            </div>
          </div>
        </div>
      </section>

      <!-- GALERÍA DE ROTACIÓN INFINITA (PAUSABLE) -->
      <section class="infinite-gallery-section">
        <div class="container-fluid" style="padding: 0;">
          <div class="infinite-carousel-container">
            <div class="infinite-track" onclick="this.classList.toggle('is-paused')" title="Haz clic para pausar/reanudar">
              <!-- Elementos duplicados para el scroll infinito suave -->
              <div class="infinite-item"><img src="assets/images/madriz/canon_somoto_panoramica.jpg" alt="Madriz 1" loading="lazy"></div>
              <div class="infinite-item"><img src="assets/images/madriz/canon_somoto_interior.png" alt="Madriz 2" loading="lazy"></div>
              <div class="infinite-item"><img src="assets/images/madriz/canon_somoto_bote.png" alt="Madriz 3" loading="lazy"></div>
              <div class="infinite-item"><img src="assets/images/destinos/canon_de_somoto.jpg" alt="Madriz 4" loading="lazy"></div>
              <div class="infinite-item"><img src="assets/images/destinos/cascada_la_luna.jpg" alt="Madriz 5" loading="lazy"></div>
              <!-- Duplicado -->
              <div class="infinite-item"><img src="assets/images/madriz/canon_somoto_panoramica.jpg" alt="Madriz 1" loading="lazy"></div>
              <div class="infinite-item"><img src="assets/images/madriz/canon_somoto_interior.png" alt="Madriz 2" loading="lazy"></div>
              <div class="infinite-item"><img src="assets/images/madriz/canon_somoto_bote.png" alt="Madriz 3" loading="lazy"></div>
              <div class="infinite-item"><img src="assets/images/destinos/canon_de_somoto.jpg" alt="Madriz 4" loading="lazy"></div>
              <div class="infinite-item"><img src="assets/images/destinos/cascada_la_luna.jpg" alt="Madriz 5" loading="lazy"></div>
            </div>
          </div>
          <div style="text-align: center; margin-top: 1rem;">
             <span class="sub-label-tag" style="font-size: 0.75rem; background: rgba(0,0,0,0.3);"><i class="fa-solid fa-hand-pointer"></i> Haz clic en la galería para pausar</span>
          </div>
        </div>
      </section>

      <!-- GALERÍA DE VIDEO DE MADRIZ -->
      <section class="madriz-video-gallery">
        <div class="container">
          <div class="video-gallery-header">
             <div class="sub-label-tag"><i class="fa-solid fa-video"></i> EXPERIENCIA AUDIOVISUAL</div>
             <h3 class="section-title-clean" style="color: #fff; font-size: 2.2rem; margin-top: 0.5rem; font-family: var(--font-display);">Madriz en Movimiento</h3>
             <p style="color: var(--text-secondary); max-width: 600px; margin: 0.5rem 0 2rem;">Explorá los paisajes, la gente y la cultura de Madriz a través de nuestra selección de videos verificados.</p>
          </div>
          
          <div class="video-grid">
             <div class="video-card-showcase">
               <video src="assets/videos/video%20nicaragua.mp4" controls preload="metadata" poster="assets/images/madriz/canon_somoto_panoramica.jpg"></video>
               <div class="video-info">
                 <h4>Navegando el Cañón de Somoto</h4>
                 <p>Turismo comunitario guiado por los baqueanos locales.</p>
               </div>
             </div>
             
             <div class="video-card-showcase">
               <video src="assets/videos/gastronomia.mp4" controls preload="metadata" poster="assets/images/madriz/canon_somoto_interior.png"></video>
               <div class="video-info">
                 <h4>Elaboración de Rosquillas</h4>
                 <p>Tradición centenaria en hornos de barro.</p>
               </div>
             </div>
          </div>
        </div>
      </section>

      <!-- MAPA TERRITORIAL: datos publicados desde Firestore, sin coordenadas ficticias -->
      <section class="madriz-map-section" aria-labelledby="madrizMapTitle">
        <div class="container">
          <div class="madriz-map-heading">
            <div class="sub-label-tag"><i class="fa-solid fa-map-location-dot"></i> CARTOGRAFÍA VIVA DE MADRIZ</div>
            <h2 id="madrizMapTitle">Explorá Madriz desde el territorio real</h2>
            <p>Seleccioná una ficha para acercarte al lugar. Solamente mostramos ubicaciones publicadas con coordenadas verificables.</p>
          </div>
          <div class="baqueano-map-wrapper" id="madrizMapShell">
            <div id="madrizMap" role="application" aria-label="Mapa interactivo de lugares publicados en Madriz"></div>
            <div class="madriz-map-topbar">
              <span class="madriz-map-live"><i class="fa-solid fa-satellite-dish"></i> Datos territoriales BAQUEANO</span>
              <button type="button" class="madriz-map-expand" id="madrizMapExpand" aria-label="Ampliar mapa">
                Ampliar <i class="fa-solid fa-expand"></i>
              </button>
            </div>
            <div class="madriz-map-status" id="madrizMapStatus" role="status" aria-live="polite">
              <i class="fa-solid fa-circle-notch fa-spin"></i> Consultando lugares publicados…
            </div>
            <div id="mapPlacesCarousel" class="map-places-carousel" aria-label="Lugares disponibles en el mapa"></div>
          </div>
        </div>
      </section>

      <!-- GALERÍA MULTIMEDIA DE ALTA FIDELIDAD CON LAS FOTOS DEL CAÑÓN -->
      <section class="madriz-gallery-strip">
        <div class="container">
          <div class="gallery-header-row">
            <div>
              <div class="sub-label-tag"><i class="fa-solid fa-camera"></i> REGISTRO FOTOGRÁFICO VERIFICADO</div>
              <h3 class="section-title-clean">El Cañón de Somoto en Alta Fidelidad</h3>
            </div>
            <span class="tag-verified-count">3 Perspectivas Clave</span>
          </div>

          <div class="madriz-photo-grid">
            <div class="photo-card-showcase" onclick="window.BaqueanoMadriz.openPhotoModal('assets/images/madriz/canon_somoto_interior.png', 'Navegación interior por el Cañón de Somoto: aguas profundas entre paredones de más de 80 metros de roca volcánica terciaria.')">
              <img src="assets/images/madriz/canon_somoto_interior.png" alt="Interior del Cañón de Somoto" loading="lazy">
              <div class="photo-card-overlay">
                <span class="photo-badge"><i class="fa-solid fa-water"></i> Vista Acuática</span>
                <h4>Interior del Cañón</h4>
                <p>Navegación entre paredes volcánicas verticales de hasta 100 m.</p>
              </div>
            </div>

            <div class="photo-card-showcase" onclick="window.BaqueanoMadriz.openPhotoModal('assets/images/madriz/canon_somoto_bote.png', 'Bote guiado por baqueanos campesinos de Somoto: turismo comunitario seguro y sin intermediarios.')">
              <img src="assets/images/madriz/canon_somoto_bote.png" alt="Bote en el Cañón de Somoto" loading="lazy">
              <div class="photo-card-overlay">
                <span class="photo-badge"><i class="fa-solid fa-sailboat"></i> Guía Campesino</span>
                <h4>Recorrido en Bote</h4>
                <p>Acompañamiento local con chalecos y remos artesanales.</p>
              </div>
            </div>

            <div class="photo-card-showcase" onclick="window.BaqueanoMadriz.openPhotoModal('assets/images/madriz/canon_somoto_panoramica.jpg', 'Perspectiva geológica del Cañón de Somoto y confluencia de los ríos Comalí y Tapacalí donde nace el Río Coco.')">
              <img src="assets/images/madriz/canon_somoto_panoramica.jpg" alt="Panorámica del Cañón de Somoto" loading="lazy">
              <div class="photo-card-overlay">
                <span class="photo-badge"><i class="fa-solid fa-mountain"></i> Geoparque UNESCO</span>
                <h4>Evolución Tectónica</h4>
                <p>Millones de años de erosión fluvial y fallas activas.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 1. ANTES DE LLEGAR: ENTENDÉ DÓNDE ESTÁS ENTRANDO -->
      <section class="madriz-section-wrap">
        <div class="container">
          <div class="dept-section-card">
            <div class="dept-card-header">
              <i class="fa-solid fa-earth-americas"></i>
              <div>
                <h3>1. Antes de llegar: entendé dónde estás entrando</h3>
                <span class="card-subtitle">Geoparque Mundial UNESCO Río Coco · 95,400 Hectáreas Protegidas</span>
              </div>
            </div>
            <div class="geopark-overview-layout">
              <div class="geopark-info-col">
                <p class="departamento-inline-001">
                  Madriz no debe entenderse solamente como el departamento donde está el Cañón de Somoto.
                  Una parte fundamental de su identidad está asociada al <strong>Geoparque Mundial UNESCO Río Coco</strong>,
                  designado en 2020 como el <strong>primer Geoparque Mundial de la UNESCO en Centroamérica</strong>.
                </p>
                <p class="departamento-inline-001">
                  UNESCO describe este territorio como una combinación viva de patrimonio geológico de relevancia planetaria,
                  comunidades rurales, bosques nubosos, manantiales de montaña y desarrollo sostenible campesino.
                  El punto más alto es el <strong>Cerro Volcán de Somoto (~1,730 msnm)</strong>.
                </p>
                <div class="baqueano-highlight-quote">
                  <i class="fa-solid fa-leaf"></i>
                  <div>
                    <h5>Lo que BAQUEANO quiere que comprendás:</h5>
                    <p>No estás entrando solamente a una zona turística. Estás entrando a un territorio donde la geología, el agua, el maíz, el café, las montañas y las comunidades han construido conjuntamente una identidad soberana.</p>
                  </div>
                </div>
              </div>
              <div class="geopark-stats-col">
                <div class="stat-box-alta-gama">
                  <span class="stat-number">2020</span>
                  <span class="stat-label">Declaración UNESCO</span>
                  <span class="stat-desc">1er Geoparque de Centroamérica</span>
                </div>
                <div class="stat-box-alta-gama">
                  <span class="stat-number">95,400</span>
                  <span class="stat-label">Hectáreas de Territorio</span>
                  <span class="stat-desc">Cuenca alta del Río Coco</span>
                </div>
                <div class="stat-box-alta-gama">
                  <span class="stat-number">12</span>
                  <span class="stat-label">Geositios Oficiales</span>
                  <span class="stat-desc">Relevancia planetaria</span>
                </div>
                <div class="stat-box-alta-gama">
                  <span class="stat-number">1,730 m</span>
                  <span class="stat-label">Punto Más Alto</span>
                  <span class="stat-desc">Cerro Volcán de Somoto</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. HISTORIA, ORIGEN & MEMORIA VIVA -->
      <section class="madriz-section-wrap">
        <div class="container">
          <div class="dept-section-card">
            <div class="dept-card-header">
              <i class="fa-solid fa-scroll"></i>
              <div>
                <h3>2. Historia, Origen & Memoria Viva</h3>
                <span class="card-subtitle">Constitución de 1936 y Línea de Tiempo Territorial</span>
              </div>
            </div>
            <p class="departamento-inline-001">
              Madriz fue constituido como departamento en <strong>1936</strong> al separarse de Nueva Segovia,
              honrando la memoria del expresidente José Madriz con Somoto como cabecera. Sin embargo, su historia
              humana se remonta a miles de años: valles y cañones resguardan petroglifos, cerámica precolombina
              y una memoria comunitaria viva en Totogalpa, San Lucas y Telpaneca.
            </p>
            <div class="timeline-madriz-strip">
              <div class="t-step">
                <span class="t-pill">1</span>
                <h5>Pueblos Originarios</h5>
                <p>Chorotegas y pueblos norteños; petroglifos y alfarería ancestral.</p>
              </div>
              <div class="t-arrow"><i class="fa-solid fa-arrow-right"></i></div>
              <div class="t-step">
                <span class="t-pill">2</span>
                <h5>Período Colonial</h5>
                <p>Templos barrocos de Somoto y Totogalpa; caminos reales de mulas.</p>
              </div>
              <div class="t-arrow"><i class="fa-solid fa-arrow-right"></i></div>
              <div class="t-step">
                <span class="t-pill">3</span>
                <h5>Formación Segoviana</h5>
                <p>Gestas campesinas y consolidación de la cultura del café y el maíz.</p>
              </div>
              <div class="t-arrow"><i class="fa-solid fa-arrow-right"></i></div>
              <div class="t-step">
                <span class="t-pill">4</span>
                <h5>Creación de Madriz (1936)</h5>
                <p>Autonomía departamental con sus 9 municipios hermanos.</p>
              </div>
              <div class="t-arrow"><i class="fa-solid fa-arrow-right"></i></div>
              <div class="t-step active">
                <span class="t-pill">5</span>
                <h5>Madriz Contemporáneo</h5>
                <p>Geoparque UNESCO, turismo rural sin intermediarios y café de altura.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. UNA HISTORIA ESCRITA EN PIEDRA & MODO CIENTÍFICO -->
      <section class="madriz-section-wrap" id="modoCientifico">
        <div class="container">
          <div class="dept-section-card scientific-mode-card">
            <div class="dept-card-header">
              <i class="fa-solid fa-microscope"></i>
              <div>
                <h3>3. Una Historia Escrita en Piedra</h3>
                <span class="card-subtitle">Modo Explorador Científico BAQUEANO · Cañón de Somoto</span>
              </div>
            </div>
            <p class="departamento-inline-001">
              El Cañón de Somoto no es simplemente "un lugar bonito para nadar". Es un libro abierto donde la
              corteza terrestre revela millones de años de procesos volcánicos, tectónicos y de erosión fluvial en Centroamérica.
            </p>

            <!-- Pestañas Interactivas del Modo Científico -->
            <div class="geo-tabs-bar">
              <button type="button" class="geo-tab-btn active" data-tab="tab-formacion" onclick="window.BaqueanoMadriz.switchGeologyTab('tab-formacion')">
                <i class="fa-solid fa-gem"></i> ¿Qué estoy viendo?
              </button>
              <button type="button" class="geo-tab-btn" data-tab="tab-origen" onclick="window.BaqueanoMadriz.switchGeologyTab('tab-origen')">
                <i class="fa-solid fa-volcano"></i> Cómo se formó
              </button>
              <button type="button" class="geo-tab-btn" data-tab="tab-agua" onclick="window.BaqueanoMadriz.switchGeologyTab('tab-agua')">
                <i class="fa-solid fa-water"></i> El agua que lo transformó
              </button>
              <button type="button" class="geo-tab-btn" data-tab="tab-escala" onclick="window.BaqueanoMadriz.switchGeologyTab('tab-escala')">
                <i class="fa-solid fa-hourglass-half"></i> Escala temporal & Reglas
              </button>
            </div>

            <!-- Contenido de las pestañas -->
            <div class="geo-tab-panes">
              <div class="geo-pane active" id="tab-formacion">
                <div class="geo-pane-grid">
                  <div>
                    <h4>Estructura Geológica Visible</h4>
                    <p>Paredes casi verticales de entre <strong>80 y 100 metros</strong> de altura, que en fallas profundas superan los <strong>190 metros</strong>. Están compuestas por <strong>rocas volcánicas terciarias (ignimbritas y basaltos compactos)</strong> formadas hace 5 a 13 millones de años.</p>
                    <ul class="geo-bullet-list">
                      <li><strong>Longitud del cañón:</strong> Aprox. 3 kilómetros de estrecho desfiladero.</li>
                      <li><strong>Ancho mínimo:</strong> Sectores con pasos de menos de 10 metros de ancho.</li>
                      <li><strong>Profundidad de pozas:</strong> Entre 2 y 15 metros en aguas calmas de verano.</li>
                    </ul>
                  </div>
                  <div class="geo-side-box">
                    <span class="geo-tip-title"><i class="fa-solid fa-camera"></i> Punto Fotográfico Científico</span>
                    <p>Desde la entrada este al amanecer (7:00 AM - 9:00 AM) la luz solar entra oblicua resaltando las estrías verticales de corte por cizalla en la pared rocosa.</p>
                  </div>
                </div>
              </div>

              <div class="geo-pane" id="tab-origen">
                <div class="geo-pane-grid">
                  <div>
                    <h4>Fallas Tectónicas y Vulcanismo</h4>
                    <p>El cañón se originó debido a una fractura tectónica regional en el bloque de Las Segovias. Los movimientos de fallas crearon una fisura natural de debilidad por donde las aguas encontraron su curso de escape hacia el Atlántico.</p>
                    <p>Posteriormente, eventos sísmicos continuos ensancharon y profundizaron la grieta, dejando al descubierto capas estratigráficas de cenizas volcánicas solidificadas y flujos piroclásticos prehistóricos.</p>
                  </div>
                  <div class="geo-side-box">
                    <span class="geo-tip-title"><i class="fa-solid fa-headphones"></i> Escuchar Explicación</span>
                    <p>Pulsá el reproductor para escuchar la narración del geólogo baqueano sobre el choque de placas y el nacimiento del desfiladero.</p>
                    <button type="button" class="btn-hero-primary" style="padding: 0.5rem 1rem; font-size: 0.82rem;" onclick="window.BaqueanoMadriz.playGeologyAudio()">
                      <i class="fa-solid fa-play"></i> Reproducir Audio Geológico
                    </button>
                  </div>
                </div>
              </div>

              <div class="geo-pane" id="tab-agua">
                <div class="geo-pane-grid">
                  <div>
                    <h4>La Confluencia Fluvial Tapacalí-Comalí</h4>
                    <p>El agua es el escultor maestro del Cañón. Río arriba convergen dos cuencas:</p>
                    <ul class="geo-bullet-list">
                      <li><strong>Río Comalí:</strong> Procede de las montañas del sur de Honduras.</li>
                      <li><strong>Río Tapacalí:</strong> Drena las serranías altas del territorio nicaragüense.</li>
                    </ul>
                    <p>En su punto de unión exacto, nace el <strong>Río Coco o Wangki</strong>, el río más largo de Centroamérica (aprox. 750 km), que utiliza el cañón como su primer gran canal de salida.</p>
                  </div>
                  <div class="geo-side-box">
                    <span class="geo-tip-title"><i class="fa-solid fa-route"></i> Conexión Fluvial Soberana</span>
                    <p><strong>Madriz ➔ Jinotega (Bosawás) ➔ Caribe Norte (Cabo Gracias a Dios)</strong>: un solo río que conecta la geología seca del norte con la selva húmeda y las etnias Miskitu y Mayangna.</p>
                  </div>
                </div>
              </div>

              <div class="geo-pane" id="tab-escala">
                <div class="geo-pane-grid">
                  <div>
                    <h4>Escala Temporal Geológica</h4>
                    <div class="time-scale-bar">
                      <div class="time-scale-item">
                        <span>Hace 15 Ma</span>
                        <p>Efusiones volcánicas del Mioceno en el norte centroamericano.</p>
                      </div>
                      <div class="time-scale-item">
                        <span>Hace 5 Ma</span>
                        <p>Fracturamiento tectónico y apertura de la falla de Somoto.</p>
                      </div>
                      <div class="time-scale-item">
                        <span>Últimos 2 Ma</span>
                        <p>Erosión fluvial constante del Río Coco tallando el cañón actual.</p>
                      </div>
                    </div>
                  </div>
                  <div class="geo-side-box" style="border-color: rgba(246, 94, 1, 0.4);">
                    <span class="geo-tip-title" style="color: var(--terracotta);"><i class="fa-solid fa-shield-halved"></i> Reglas de Protección Geológica</span>
                    <ul class="geo-bullet-list" style="margin-top: 0.5rem; font-size: 0.8rem;">
                      <li>Prohibido extraer rocas, minerales o fósiles del Geoparque.</li>
                      <li>No rayar ni pintar las paredes del desfiladero.</li>
                      <li>Uso estricto de chalecos salvavidas y baqueanos certificados.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. MONUMENTO NACIONAL CAÑÓN DE SOMOTO -->
      <section class="madriz-section-wrap">
        <div class="container">
          <div class="dept-section-card">
            <div class="dept-card-header">
              <i class="fa-solid fa-water"></i>
              <div>
                <h3>4. Monumento Nacional Cañón de Somoto</h3>
                <span class="card-subtitle">Área Protegida de 170.3 Hectáreas · Declarada en 2006</span>
              </div>
            </div>
            <div class="canon-features-grid">
              <div class="canon-feat-item">
                <i class="fa-solid fa-location-dot"></i>
                <div>
                  <h5>Ubicación</h5>
                  <p>A 15 km de Somoto sobre la comunidad de Sonís.</p>
                </div>
              </div>
              <div class="canon-feat-item">
                <i class="fa-solid fa-ruler-combined"></i>
                <div>
                  <h5>Dimensiones</h5>
                  <p>3 km de longitud con paredes de 80 a 100 m.</p>
                </div>
              </div>
              <div class="canon-feat-item">
                <i class="fa-solid fa-person-swimming"></i>
                <div>
                  <h5>Experiencias Habilitadas</h5>
                  <p>Senderismo, navegación en lancha, flotación guiada y Trail running.</p>
                </div>
              </div>
              <div class="canon-feat-item">
                <i class="fa-solid fa-circle-check"></i>
                <div>
                  <h5>Regla BAQUEANO</h5>
                  <p>Nivel de aguas, tarifas y guías verificados en tiempo real con la cooperativa.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 5 & 6. RESERVA TEPESOMOTO-LA PATASTE & LAGUNA LA BRUJA -->
      <section class="madriz-section-wrap">
        <div class="container">
          <div class="grid-two-cards">
            <!-- Tepesomoto-La Pataste -->
            <div class="dept-section-card inner-card">
              <div class="dept-card-header">
                <i class="fa-solid fa-tree"></i>
                <div>
                  <h3>5. Reserva Natural Tepesomoto–La Pataste</h3>
                  <span class="card-subtitle">10,069 Hectáreas · Bosque Nuboso y Pinares</span>
                </div>
              </div>
              <p class="departamento-inline-001">
                Reserva protegida compartida entre Madriz y Estelí declarada en 1991. Conserva robledales,
                pinares y sectores de nebliselva con orquídeas y helechos gigantes.
              </p>
              <div class="trail-meta-strip">
                <span class="meta-pill"><i class="fa-solid fa-gauge-high"></i> Nivel: Moderado</span>
                <span class="meta-pill"><i class="fa-solid fa-arrows-up-down"></i> Altitud: Hasta 1,730 m</span>
                <span class="meta-pill"><i class="fa-solid fa-clock"></i> Duración: 3 a 5 hrs</span>
              </div>
            </div>

            <!-- Laguna La Bruja -->
            <div class="dept-section-card inner-card">
              <div class="dept-card-header">
                <i class="fa-solid fa-water"></i>
                <div>
                  <h3>6. Laguna La Bruja (Las Sabanas)</h3>
                  <span class="card-subtitle">Comunidad El Pegador · Zona de Amortiguamiento</span>
                </div>
              </div>
              <p class="departamento-inline-001">
                Ubicada en Las Sabanas. Cuenta con senderos de orquídeas, paseos en lancha, canopy y avistamiento
                de aves de altura en un entorno de paz absoluta.
              </p>
              <div class="price-policy-box">
                <div class="price-status-header">
                  <span class="badge-status-published"><i class="fa-regular fa-clock"></i> PRECIO PUBLICADO 2025</span>
                  <span class="source-tag">Fuente: MARENA</span>
                </div>
                <p class="price-policy-desc">Paseo en lancha y canopy disponible con guías de El Pegador. <em>(Requiere confirmación previa según temporada de lluvia).</em></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 7. SAN JUAN DEL RÍO COCO & RUTA DEL CAFÉ -->
      <section class="madriz-section-wrap">
        <div class="container">
          <div class="dept-section-card">
            <div class="dept-card-header">
              <i class="fa-solid fa-mug-hot"></i>
              <div>
                <h3>7. San Juan del Río Coco: Donde el Café Cuenta una Historia</h3>
                <span class="card-subtitle">Ruta BAQUEANO del Café de Estricta Altura</span>
              </div>
            </div>
            <p class="departamento-inline-001">
              San Juan del Río Coco respira aroma de café. Sus plantaciones bajo sombra se alimentan de manantiales
              de montaña en el Parque Natural El Majaste, produciendo granos reconocidos por su balance, acidez cítrica y notas achocolatadas.
            </p>
            <div class="coffee-route-stepper">
              <div class="c-step">
                <span class="c-icon"><i class="fa-solid fa-seedling"></i></span>
                <h5>1. Almácigo & Planta</h5>
                <p>Variedades Caturra, Borbón y Catuaí bajo sombra.</p>
              </div>
              <div class="c-step">
                <span class="c-icon"><i class="fa-solid fa-sun"></i></span>
                <h5>2. Cultivo de Altura</h5>
                <p>Cuidado agroecológico entre 1,000 y 1,400 msnm.</p>
              </div>
              <div class="c-step">
                <span class="c-icon"><i class="fa-solid fa-hand"></i></span>
                <h5>3. Corte Selectivo</h5>
                <p>Cosecha manual de cerezas rojas (Diciembre - Marzo).</p>
              </div>
              <div class="c-step">
                <span class="c-icon"><i class="fa-solid fa-water"></i></span>
                <h5>4. Despulpado</h5>
                <p>Lavado con aguas de manantial y secado solar en patio.</p>
              </div>
              <div class="c-step">
                <span class="c-icon"><i class="fa-solid fa-fire-burner"></i></span>
                <h5>5. Tostado Artesanal</h5>
                <p>Tueste medio que preserva aromas afrutados de Las Segovias.</p>
              </div>
              <div class="c-step">
                <span class="c-icon"><i class="fa-solid fa-mug-saucer"></i></span>
                <h5>6. Taza Campesina</h5>
                <p>Degustación directa con la familia productora en finca.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 8 & 9. ROSQUILLAS & GASTRONOMÍA ANCESTRAL DEL MAÍZ -->
      <section class="madriz-section-wrap">
        <div class="container">
          <div class="dept-section-card">
            <div class="dept-card-header">
              <i class="fa-solid fa-bread-slice"></i>
              <div>
                <h3>8 & 9. Rosquillas & Sabores de Madriz (Hijos del Maíz)</h3>
                <span class="card-subtitle">Somoto y Yalagüina · Gastronomía Campesina Ancestral</span>
              </div>
            </div>
            <p class="departamento-inline-001">
              Las rosquillas son el estandarte culinario de Madriz. Decenas de talleres tradicionales, históricamente dirigidos
              por mujeres en Somoto y Yalagüina, hornean diariamente miles de piezas crujientes en hornos de barro con leña de roble.
            </p>

            <h4 class="sub-table-title"><i class="fa-solid fa-wheat-awn"></i> Matriz de Gastronomía Ancestral del Maíz</h4>
            <div class="matrix-table-wrap">
              <table class="madriz-matrix-table">
                <thead>
                  <tr>
                    <th>Plato Tradicional</th>
                    <th>Ingrediente Principal</th>
                    <th>Quién lo Prepara</th>
                    <th>Cómo se Cocina</th>
                    <th>Dónde Probarlo</th>
                  </tr>
                </thead>
                <tbody>
                  ${MATRIZ_MAIZ.map(m => `
                    <tr>
                      <td><strong>${m.plato}</strong></td>
                      <td>${m.ingrediente}</td>
                      <td>${m.quienPrepara}</td>
                      <td>${m.comoCocina}</td>
                      <td><span class="badge-location">${m.dondeProbar}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <!-- 10. ARTESANÍAS VIVENCIALES -->
      <section class="madriz-section-wrap">
        <div class="container">
          <div class="dept-section-card">
            <div class="dept-card-header">
              <i class="fa-solid fa-hand-holding-heart"></i>
              <div>
                <h3>10. Artesanías: Llevarte Algo que Tiene una Historia</h3>
                <span class="card-subtitle">Talleres Vivenciales de 1 Hora · Compra Directa al Artesano</span>
              </div>
            </div>
            <p class="departamento-inline-001">
              En BAQUEANO no proponemos solamente comprar artesanía en vitrina. Te invitamos a conocer al artesano,
              sentarte a su lado, aprender su técnica centenaria y moldear una pieza propia.
            </p>
            <div class="artisans-grid">
              <div class="artisan-card">
                <span class="artisan-tag"><i class="fa-solid fa-tree"></i> Acícula de Pino</span>
                <h4>Cestería en Hoja de Pino</h4>
                <p><strong>Comunidad:</strong> San José de Cusmapa</p>
                <p><strong>Artesanas:</strong> Asociación de Mujeres de Cusmapa</p>
                <p><strong>Experiencia:</strong> 1 hora aprendiendo el tejido de espiral con acícula seca aromática.</p>
                <div class="artisan-card-footer">
                  <span class="verified-badge"><i class="fa-solid fa-certificate"></i> Comercio Justo 100%</span>
                  <a href="https://wa.me/50584431289?text=Hola%20Mesa%20Baqueano,%20deseo%20visitar%20el%20taller%20de%20acícula%20de%20pino%20en%20Cusmapa" target="_blank" class="btn-hero-primary" style="padding: 0.4rem 0.8rem; font-size: 0.78rem;">
                    <i class="fa-brands fa-whatsapp"></i> Conectar Taller
                  </a>
                </div>
              </div>

              <div class="artisan-card">
                <span class="artisan-tag"><i class="fa-solid fa-palette"></i> Barro Prehispánico</span>
                <h4>Alfarería Ancestral Loma Panda</h4>
                <p><strong>Comunidad:</strong> Loma Panda, San Lucas</p>
                <p><strong>Artesanas:</strong> Colectivo Mujeres de Loma Panda</p>
                <p><strong>Experiencia:</strong> Modelado a mano de vasijas de barro y quemado tradicional en fogón.</p>
                <div class="artisan-card-footer">
                  <span class="verified-badge"><i class="fa-solid fa-certificate"></i> Memoria Indígena</span>
                  <a href="https://wa.me/50584431289?text=Hola%20Mesa%20Baqueano,%20deseo%20visitar%20Loma%20Panda%20en%20San%20Lucas" target="_blank" class="btn-hero-primary" style="padding: 0.4rem 0.8rem; font-size: 0.78rem;">
                    <i class="fa-brands fa-whatsapp"></i> Conectar Taller
                  </a>
                </div>
              </div>

              <div class="artisan-card">
                <span class="artisan-tag"><i class="fa-solid fa-hat-cowboy"></i> Fibras Naturales</span>
                <h4>Sombreros y Cestería en Tule</h4>
                <p><strong>Comunidad:</strong> Totogalpa y Telpaneca</p>
                <p><strong>Artesanos:</strong> Familias campesinas tejedoras</p>
                <p><strong>Experiencia:</strong> Tejido de fibras vegetales de caña, tule y bambú para sombreros y paneras.</p>
                <div class="artisan-card-footer">
                  <span class="verified-badge"><i class="fa-solid fa-certificate"></i> Tradición Campesina</span>
                  <a href="https://wa.me/50584431289?text=Hola%20Mesa%20Baqueano,%20deseo%20conocer%20artesanos%20de%20Totogalpa" target="_blank" class="btn-hero-primary" style="padding: 0.4rem 0.8rem; font-size: 0.78rem;">
                    <i class="fa-brands fa-whatsapp"></i> Conectar Taller
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 11. ESCUCHÁ MADRIZ -->
      <section class="madriz-section-wrap">
        <div class="container">
          <div class="dept-section-card music-section-card">
            <div class="dept-card-header">
              <i class="fa-solid fa-guitar"></i>
              <div>
                <h3>11. Escuchá Madriz: Patrimonio Musical Segoviano</h3>
                <span class="card-subtitle">Polkas, Mazurcas y Creadores del Canto Nacional</span>
              </div>
            </div>
            <p class="departamento-inline-001">
              Madriz suena a guitarra de cedro, acordeón campesino, violín de talalate y tambor. Aquí nacieron
              referentes de la música nicaragüense como <strong>Carlos Mejía Godoy</strong>, <strong>Luis Enrique Mejía Godoy</strong>
              y <strong>Luis Enrique Mejía López</strong>.
            </p>
            <div class="music-madriz-player-box">
              <div class="music-meta-left">
                <span class="sound-tag"><i class="fa-solid fa-music"></i> SONORIDAD SEGOVIANA</span>
                <h4>Polka Norteña & Mazurca Campesina</h4>
                <p>Danza y compás tradicional de las montañas de Madriz y Las Segovias.</p>
                <div class="player-action-strip">
                  <button type="button" class="btn-hero-primary" id="btnPlayMadrizPolka" onclick="window.BaqueanoAudio && window.BaqueanoAudio.playSample ? window.BaqueanoAudio.playSample() : alert('Reproduciendo Polka Segoviana...');">
                    <i class="fa-solid fa-play"></i> Escuchar Polka Segoviana
                  </button>
                  <a href="musica.html" class="btn-hero-secondary">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Abrir Patrimonio Sonoro
                  </a>
                </div>
              </div>
              <div class="artists-badge-col">
                <span class="art-pill"><i class="fa-solid fa-microphone"></i> Carlos Mejía Godoy (Somoto)</span>
                <span class="art-pill"><i class="fa-solid fa-microphone"></i> Luis Enrique Mejía Godoy (Somoto)</span>
                <span class="art-pill"><i class="fa-solid fa-microphone"></i> Luis Enrique (Somoto)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 12, 13 & 14. FIESTAS, PATRIMONIO INC Y ARQUEOLOGÍA -->
      <section class="madriz-section-wrap">
        <div class="container">
          <div class="grid-three-cards">
            <!-- Fiestas y Burritos -->
            <div class="dept-section-card inner-card">
              <div class="dept-card-header">
                <i class="fa-solid fa-champagne-glasses"></i>
                <div>
                  <h4>12. Fiestas y Vida Comunitaria</h4>
                  <span class="card-subtitle">Santiago Apóstol & Festival de Burritos</span>
                </div>
              </div>
              <p class="departamento-inline-001">
                Somoto celebra el <strong>25 de julio</strong> sus fiestas de Santiago Apóstol acompañadas
                del histórico <strong>Festival de los Burritos Somoteños</strong>, honrando la labor de estos animales en la vida campesina.
              </p>
              <div class="event-mini-badge">
                <i class="fa-regular fa-calendar-check"></i> Próxima edición: Julio 2026 (Verificado)
              </div>
            </div>

            <!-- Patrimonio INC -->
            <div class="dept-section-card inner-card">
              <div class="dept-card-header">
                <i class="fa-solid fa-landmark"></i>
                <div>
                  <h4>13. Patrimonio Oficial INC</h4>
                  <span class="card-subtitle">Monumentos Declarados de la Nación</span>
                </div>
              </div>
              <ul class="patrimony-check-list">
                <li><i class="fa-solid fa-check-double"></i> Iglesia Parroquial de Somoto</li>
                <li><i class="fa-solid fa-check-double"></i> Murales de Arte Monumental de Somoto</li>
                <li><i class="fa-solid fa-check-double"></i> Iglesia Parroquial de Totogalpa</li>
                <li><i class="fa-solid fa-check-double"></i> Museo Comunitario El Almendro</li>
              </ul>
              <span class="seal-patrimonio"><i class="fa-solid fa-shield-halved"></i> Patrimonio Verificado INC</span>
            </div>

            <!-- Arqueología -->
            <div class="dept-section-card inner-card">
              <div class="dept-card-header">
                <i class="fa-solid fa-feather"></i>
                <div>
                  <h4>14. Arqueología y Petroglifos</h4>
                  <span class="card-subtitle">Parque Arqueológico Piedras Pintadas</span>
                </div>
              </div>
              <p class="departamento-inline-001">
                Piedras Pintadas y petroglifos en Telpaneca testimonian la presencia de pueblos precolombinos.
              </p>
              <div class="scientific-rigor-box">
                <i class="fa-solid fa-circle-info"></i>
                <span>En BAQUEANO declaramos con rigor: «Petroglifos con origen en investigación arqueológica activa».</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 15. LOS NUEVE MUNICIPIOS DE MADRIZ (SELECTOR Y EXPLORADOR INDIVIDUAL) -->
      <section class="madriz-section-wrap" id="losNueveMadriz">
        <div class="container">
          <div class="dept-section-card">
            <div class="dept-card-header">
              <i class="fa-solid fa-map-location-dot"></i>
              <div>
                <h3>15. Conocé los Nueve Madriz</h3>
                <span class="card-subtitle">Navegación Territorial Individual: Tocá Cada Municipio para Descubrirlo</span>
              </div>
            </div>
            <p class="departamento-inline-001">
              Madriz no termina en Somoto. Cada uno de sus 9 municipios posee su propia geografía, microclima,
              cooperativas, memorias y senderos. Tocá cualquiera de ellos para desplegar su ficha completa:
            </p>

            <div class="nine-mun-grid">
              ${dept.municipalities.map((m, idx) => `
                <div class="mun-card" onclick="window.BaqueanoMadriz.openMunicipalityModal('${m.id}')">
                  <div class="mun-card-top">
                    <span class="mun-number">0${idx + 1}</span>
                    <span class="mun-badge-pill">${m.badge}</span>
                  </div>
                  <h4 class="mun-name"><i class="fa-solid ${m.icon}"></i> ${m.name}</h4>
                  <h5 class="mun-title">${m.title}</h5>
                  <p class="mun-short-desc">${m.desc.substring(0, 110)}...</p>
                  <div class="mun-vivi-tag">
                    <strong>Viví:</strong> ${m.vivi}
                  </div>
                  <button type="button" class="btn-open-mun">
                    <span>Explorar Municipio</span> <i class="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </section>

      <!-- 16 & 17. NATURALEZA VIVA & TRADICIÓN ORAL -->
      <section class="madriz-section-wrap">
        <div class="container">
          <div class="grid-two-cards">
            <!-- Quién vive aquí -->
            <div class="dept-section-card inner-card">
              <div class="dept-card-header">
                <i class="fa-solid fa-paw"></i>
                <div>
                  <h3>16. Naturaleza Viva: ¿Quién vive aquí?</h3>
                  <span class="card-subtitle">Monitoreo Biológico MARENA · Observación sin Perturbar</span>
                </div>
              </div>
              <p class="departamento-inline-001">
                En monitoreos oficiales en la Reserva Tepesomoto-La Pataste y pinares segovianos se ha documentado
                la presencia de fauna protegida:
              </p>
              <div class="wildlife-tags-wrap">
                <span class="wild-tag"><i class="fa-solid fa-paw"></i> Puma (Puma concolor)</span>
                <span class="wild-tag"><i class="fa-solid fa-paw"></i> Venado Cola Blanca</span>
                <span class="wild-tag"><i class="fa-solid fa-paw"></i> Sajino de Collar</span>
                <span class="wild-tag"><i class="fa-solid fa-crow"></i> Guardabarranco</span>
                <span class="wild-tag"><i class="fa-solid fa-dove"></i> Quetzalillo y Tucanete</span>
                <span class="wild-tag"><i class="fa-solid fa-seedling"></i> Orquídeas de Montaña</span>
              </div>
            </div>

            <!-- Tradición oral -->
            <div class="dept-section-card inner-card">
              <div class="dept-card-header">
                <i class="fa-solid fa-moon"></i>
                <div>
                  <h3>17. Leyendas & Tradición Oral</h3>
                  <span class="card-subtitle">Memoria Popular de las Serranías</span>
                </div>
              </div>
              <div class="disclaimer-oral-tradition">
                <span class="oral-badge"><i class="fa-solid fa-book-open"></i> TRADICIÓN ORAL</span>
                <p><em>Este relato forma parte de la memoria popular y no se presenta como un acontecimiento histórico comprobado.</em></p>
              </div>
              <p class="departamento-inline-001" style="margin-top: 0.8rem;">
                Relatos transmitidos en fogones sobre los misterios de <strong>Poza Bruja</strong> en Yalagüina,
                los espíritus guardianes de la <strong>Cueva de la Tuma</strong> en Cusmapa y las apariciones en la <strong>Laguna La Bruja</strong> en Las Sabanas.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 18. CONOCÉ A LAS PERSONAS QUE HACEN VIVIR MADRIZ -->
      <section class="madriz-section-wrap">
        <div class="container">
          <div class="dept-section-card">
            <div class="dept-card-header">
              <i class="fa-solid fa-users"></i>
              <div>
                <h3>18. ¿Quiénes Hacen Vivir Este Territorio?</h3>
                <span class="card-subtitle">Conocé a su Gente · Anfitriones Verificados</span>
              </div>
            </div>
            <p class="departamento-inline-001">
              Madriz vive gracias a personas reales que custodian el agua, hornean el maíz, cuidan los cafetales
              y tejen sus fibras. En BAQUEANO cada perfil es real, registrado y autorizado:
            </p>

            <div class="people-grid-alta-gama">
              ${GENTE_MADRIZ.map(p => `
                <div class="person-profile-card">
                  <div class="person-tag-pill">${p.categoria}</div>
                  <h4>${p.nombre}</h4>
                  <span class="person-comunidad"><i class="fa-solid fa-location-dot"></i> ${p.comunidad}</span>
                  <p class="person-desc">${p.desc}</p>
                  <div class="person-footer-badge">
                    <i class="fa-solid fa-shield-check"></i> Perfil Verificado BAQUEANO
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </section>

      <!-- 19. VIVÍ MADRIZ, NO SOLAMENTE LO OBSERVÉS (5 RUTAS EXPERIENCIALES) -->
      <section class="madriz-section-wrap">
        <div class="container">
          <div class="dept-section-card">
            <div class="dept-card-header">
              <i class="fa-solid fa-person-walking-luggage"></i>
              <div>
                <h3>19. Viví Madriz, No Solamente lo Observés</h3>
                <span class="card-subtitle">5 Rutas Experienciales con Cálculo Inteligente de Tiempo y Costos Reales</span>
              </div>
            </div>

            <div class="experiencias-grid-baqueano">
              <div class="exp-route-box">
                <span class="exp-step-badge">Ruta 1</span>
                <h4>🫓 Una Mañana entre Rosquillas</h4>
                <p>Somoto y Yalagüina ➔ Conocer taller familiar ➔ Amasado de maíz con cuajada ➔ Horno de leña ➔ Degustación caliente ➔ Compra directa.</p>
              </div>

              <div class="exp-route-box">
                <span class="exp-step-badge">Ruta 2</span>
                <h4>☕ Del Cafetal a la Taza</h4>
                <p>San Juan del Río Coco ➔ Recorrer finca agroecológica ➔ Conocer floración y grano ➔ Proceso de secado ➔ Catación con la familia productora.</p>
              </div>

              <div class="exp-route-box">
                <span class="exp-step-badge">Ruta 3</span>
                <h4>🪨 Un Día entre Millones de Años</h4>
                <p>Cañón de Somoto ➔ Guía campesino con chaleco ➔ Navegación en desfiladero ➔ Interpretación geológica ➔ Almuerzo campestre en Sonís.</p>
              </div>

              <div class="exp-route-box">
                <span class="exp-step-badge">Ruta 4</span>
                <h4>🌲 Madriz de Montaña</h4>
                <p>Las Sabanas ➔ Laguna La Bruja ➔ Cusmapa ➔ Mirador El Balcón ➔ Cestería de acícula de pino ➔ Hospedaje rural campesino.</p>
              </div>

              <div class="exp-route-box">
                <span class="exp-step-badge">Ruta 5</span>
                <h4>🏺 Ruta de Memoria Indígena</h4>
                <p>Totogalpa ➔ Museo Comunitario El Almendro ➔ San Lucas ➔ Alfarería de Loma Panda ➔ Petroglifos ➔ Convivencia comunitaria en Palmira.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 20, 21 & 22. GUÍA PRÁCTICA DE VIAJE: CÓMO LLEGAR, CLIMA DINÁMICO Y QUÉ LLEVAR -->
      <section class="madriz-section-wrap">
        <div class="container">
          <div class="dept-section-card">
            <div class="dept-card-header">
              <i class="fa-solid fa-compass"></i>
              <div>
                <h3>20, 21 & 22. Guía Práctica de Viaje & Logística</h3>
                <span class="card-subtitle">Acceso por Panamericana Norte, Clima por Actividad y Equipamiento</span>
              </div>
            </div>

            <div class="dept-logistics-grid">
              <div class="dept-logistic-box">
                <h5><i class="fa-solid fa-route departamento-inline-003"></i> 20. Cómo Llegar</h5>
                <p>Desde Managua por la Carretera Panamericana Norte (NIC-1) pasando por Sébaco y Estelí hacia Somoto (216 km, aprox. 3.5 a 4 hrs). Buses expresos salen desde la <strong>Terminal del Mercado El Mayoreo</strong>.</p>
              </div>
              <div class="dept-logistic-box">
                <h5><i class="fa-solid fa-cloud-sun-rain departamento-inline-002"></i> 21. Cuándo Visitar</h5>
                <p><strong>Cañón:</strong> Noviembre a mayo (aguas mansas).<br>
                <strong>Café:</strong> Diciembre a marzo (cosecha dorada).<br>
                <strong>Montaña:</strong> Clima fresco todo el año; llevar abrigo para noches en Cusmapa.</p>
              </div>
              <div class="dept-logistic-box">
                <h5><i class="fa-solid fa-suitcase departamento-inline-004"></i> 22. Qué Llevar</h5>
                <p>Calzado con agarre para agua y rocas, ropa de cambio impermeable, abrigo para serranías, repelente biodegradable y dinero en córdobas para compras comunitarias directas.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 23 & 24. SEGURIDAD SOS Y CÓDIGO DEL EXPLORADOR -->
      <section class="madriz-section-wrap">
        <div class="container">
          <div class="grid-two-cards">
            <!-- Seguridad SOS -->
            <div class="dept-section-card inner-card">
              <div class="dept-card-header">
                <i class="fa-solid fa-triangle-exclamation" style="color: var(--rojo-alerta);"></i>
                <div>
                  <h3>23. Seguridad & SOS Madriz</h3>
                  <span class="card-subtitle">Telemetría y Enlaces de Emergencia Territorial</span>
                </div>
              </div>
              <p class="departamento-inline-001">
                Hospital Juan Antonio Brenes Palacios (Somoto), Policía Nacional (118), Bomberos (115) y Cruz Blanca (128).
              </p>
              <div class="sos-actions-wrap">
                <button type="button" class="btn-hero-primary open-sos-btn" style="width: 100%; justify-content: center; background: var(--rojo-alerta);">
                  <i class="fa-solid fa-tower-broadcast"></i> Activar Auxilio SOS Madriz
                </button>
              </div>
            </div>

            <!-- Código del explorador -->
            <div class="dept-section-card inner-card">
              <div class="dept-card-header">
                <i class="fa-solid fa-leaf" style="color: #10B981;"></i>
                <div>
                  <h3>24. Código del Explorador</h3>
                  <span class="card-subtitle">Decálogo Verde de Visita Soberana</span>
                </div>
              </div>
              <ul class="decalogo-list">
                <li><i class="fa-solid fa-ban"></i> No extraer piedras, plantas ni piezas arqueológicas.</li>
                <li><i class="fa-solid fa-handshake"></i> Comprar directo a campesinos y artesanas.</li>
                <li><i class="fa-solid fa-trash-can"></i> Retornar con el 100% de tus residuos plásticos.</li>
                <li><i class="fa-solid fa-person-shelter"></i> Respetar ceremonias y tradiciones locales.</li>
              </ul>
              <a href="denuncias.html" class="report-damage-btn">
                <i class="fa-solid fa-bullhorn"></i> Reportar Incidencia Ambiental en Madriz
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- 28 & 29. CIERRE: ¿YA CONOCÉS MADRIZ O QUERÉS EMPEZAR A VIVIRLO? -->
      <section class="madriz-closing-strip">
        <div class="container">
          <div class="closing-card-alta-gama">
            <span class="closing-pretitle">TU EXPEDICIÓN COMIENZA AQUÍ</span>
            <h2 class="closing-title">¿Ya conocés Madriz o querés empezar a comprenderlo?</h2>
            <p class="closing-desc">
              Elegí cómo querés conectar hoy con este territorio milenario de cañones, café y maíz:
            </p>
            <div class="closing-actions-grid">
              <a href="#losNueveMadriz" class="closing-action-btn"><i class="fa-solid fa-map-location-dot"></i> Explorar los 9 Municipios</a>
              <a href="#modoCientifico" class="closing-action-btn"><i class="fa-solid fa-water"></i> Conocer el Cañón de Somoto</a>
              <a href="destinos.html" class="closing-action-btn"><i class="fa-solid fa-bread-slice"></i> Ruta de las Rosquillas</a>
              <a href="destinos.html" class="closing-action-btn"><i class="fa-solid fa-mug-hot"></i> Vivir Experiencia Cafetalera</a>
              <a href="musica.html" class="closing-action-btn"><i class="fa-solid fa-music"></i> Escuchar Madriz</a>
              <button type="button" class="closing-action-btn open-planner-btn"><i class="fa-solid fa-robot"></i> Construir Mi Aventura IA</button>
              <a href="aliados.html" class="closing-action-btn"><i class="fa-solid fa-handshake"></i> Conectar con Anfitriones</a>
              <button type="button" class="closing-action-btn open-sos-btn" style="border-color: rgba(239, 68, 68, 0.4); color: #FCA5A5;"><i class="fa-solid fa-tower-broadcast"></i> SOS Madriz 24/7</button>
            </div>
          </div>
        </div>
      </section>

      <!-- MODAL PARA EXPLORAR CADA UNO DE LOS 9 MUNICIPIOS -->
      <div class="modal-backdrop-pro" id="munDetailModal" aria-hidden="true" role="dialog">
        <div class="mun-modal-dialog">
          <button class="modal-close-x" id="closeMunModalBtn" aria-label="Cerrar información del municipio" onclick="window.BaqueanoMadriz.closeMunicipalityModal()"><i class="fa-solid fa-xmark"></i></button>
          <div id="munModalBody"></div>
        </div>
      </div>

      <!-- LIGHTBOX PARA FOTOS -->
      <div class="modal-backdrop-pro" id="photoLightboxModal" aria-hidden="true" role="dialog" onclick="window.BaqueanoMadriz.closePhotoModal()">
        <div class="lightbox-dialog" onclick="event.stopPropagation()">
          <button class="modal-close-x" aria-label="Cerrar fotografía" onclick="window.BaqueanoMadriz.closePhotoModal()"><i class="fa-solid fa-xmark"></i></button>
          <img id="lightboxImg" src="" alt="Ampliación">
          <div id="lightboxCaption" class="lightbox-caption"></div>
        </div>
      </div>
    `;

    // Inyectar en el contenedor de departamento.html
    const targetSection = container.querySelector('.dept-section-block .container');
    if (targetSection) {
      // Dejar también el selector de 17 territorios al final para que el usuario pueda cambiar a otro departamento
      const selectorCard = document.getElementById('selectorTerritoriosSection');
      const selectorHtml = selectorCard ? selectorCard.outerHTML : '';
      targetSection.innerHTML = html + selectorHtml;

      // Reconectar eventos del selector de territorios
      const selectorGrid = document.getElementById('deptSelectorGrid');
      if (selectorGrid && window.BAQUEANO_TERRITORIES) {
        selectorGrid.innerHTML = window.BAQUEANO_TERRITORIES.map(t => `
          <button type="button" class="territory-pill-card ${t.id === 'madriz' ? 'active' : ''}" data-territory="${t.id}">
            <h5>${t.name}</h5>
            <span>${t.tagline}</span>
          </button>
        `).join('');
      }
    }

    // Inicializar listeners locales
    initLocalEvents();
    if (window.BaqueanoMadrizMap) {
      window.BaqueanoMadrizMap.mount();
    }
  }

  // Actualiza el Hero con la información ampliada de Madriz
  function updateHeroMadriz(dept) {
    const titleEl = document.getElementById('deptTitle');
    const taglineEl = document.getElementById('deptTagline');
    const shortDescEl = document.getElementById('deptShortDesc');
    const heroBgEl = document.getElementById('deptHeroBg');
    const badgeTextEl = document.getElementById('deptBadgeText');

    if (titleEl) titleEl.textContent = 'Madriz';
    if (taglineEl) taglineEl.textContent = '«Tierra de Cañones Milenarios, Rosquillas Doradas, Café y Montañas Segovianas»';
    if (shortDescEl) {
      shortDescEl.innerHTML = `
        <strong>Cabecera:</strong> Somoto &nbsp;|&nbsp;
        <strong>Región:</strong> Las Segovias · Norte de Nicaragua &nbsp;|&nbsp;
        <strong>Municipios:</strong> 9 Territorios Hermanos &nbsp;|&nbsp;
        <strong>Geoparque Mundial UNESCO Río Coco (2020)</strong><br>
        <span style="font-size: 0.95rem; color: #E2E8F0; margin-top: 0.4rem; display: block;">
          No vengás solamente a conocer Madriz. Vení a comprenderlo. Una tierra esculpida por el agua donde la geología milenaria, la memoria indígena, los talleres campesinos de rosquillas doradas y el aroma de café de montaña te esperan sin intermediarios.
        </span>
      `;
    }
    if (heroBgEl) {
      heroBgEl.style.backgroundImage = `url('assets/images/madriz/canon_somoto_panoramica.jpg')`;
    }
    if (badgeTextEl) {
      badgeTextEl.innerHTML = `<i class="fa-solid fa-earth-americas"></i> Geoparque Mundial UNESCO Río Coco · 9 Municipios`;
    }
  }

  // Abre el modal detallado de un municipio
  function openMunicipalityModal(munId) {
    const mun = MUNICIPIOS_DETALLE[munId];
    if (!mun) return;

    const modal = document.getElementById('munDetailModal');
    const body = document.getElementById('munModalBody');
    if (!modal || !body) return;

    body.innerHTML = `
      <div class="mun-modal-header">
        <span class="modal-badge-pill">${mun.badge}</span>
        <h2 class="modal-mun-title">${mun.name}</h2>
        <h4 class="modal-mun-subtitle">${mun.title}</h4>
      </div>
      <div class="mun-modal-content-grid">
        <div class="mun-modal-info">
          <p class="mun-modal-desc">${mun.desc}</p>
          <div class="mun-modal-vivi-box">
            <h5><i class="fa-solid fa-compass"></i> Vivencias Auténticas en ${mun.name}:</h5>
            <ul>
              ${mun.vivi.map(v => `<li><i class="fa-solid fa-circle-check"></i> ${v}</li>`).join('')}
            </ul>
          </div>
          <div class="mun-quick-stats">
            <div><strong>Altitud:</strong> ${mun.altitude}</div>
            <div><strong>Distancia desde Managua:</strong> ${mun.distanceManagua}</div>
            <div><strong>Geositios:</strong> ${mun.geosites.join(', ')}</div>
            <div><strong>Cooperativas:</strong> ${mun.cooperatives}</div>
          </div>
          <div class="mun-modal-footer-cta">
            <a href="https://wa.me/50584431289?text=Hola%20Mesa%20Baqueano,%20deseo%20planificar%20una%20visita%20a%20${encodeURIComponent(mun.name)},%20Madriz" target="_blank" class="btn-hero-primary">
              <i class="fa-brands fa-whatsapp"></i> Contactar Guías de ${mun.name}
            </a>
            <button type="button" class="btn-hero-glass" onclick="window.BaqueanoMadriz.closeMunicipalityModal()">
              Cerrar Ficha
            </button>
          </div>
        </div>
        <div class="mun-modal-media">
          <img src="${mun.image}" alt="${mun.name}" class="mun-modal-img">
          <span class="media-caption">Paisaje representativo de ${mun.name}</span>
        </div>
      </div>
    `;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMunicipalityModal() {
    const modal = document.getElementById('munDetailModal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  // Pestañas geológicas del Cañón de Somoto
  function switchGeologyTab(tabId) {
    document.querySelectorAll('.geo-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('.geo-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === tabId);
    });
  }

  function playGeologyAudio() {
    if (window.BaqueanoAudio && window.BaqueanoAudio.playSample) {
      window.BaqueanoAudio.playSample();
    } else {
      alert('Sintetizando explicación geológica del Cañón de Somoto: Formación volcánica terciaria de 13 millones de años.');
    }
  }

  // Modal Lightbox para fotos
  function openPhotoModal(src, caption) {
    const modal = document.getElementById('photoLightboxModal');
    const img = document.getElementById('lightboxImg');
    const cap = document.getElementById('lightboxCaption');
    if (!modal || !img) return;

    img.src = src;
    if (cap) cap.textContent = caption || '';
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closePhotoModal() {
    const modal = document.getElementById('photoLightboxModal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  function initLocalEvents() {
    // Botón Guardar en Mi Viaje
    const btnSave = document.getElementById('btnSaveMadrizTrip');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        let trips = JSON.parse(localStorage.getItem('baqueano_saved_trips') || '[]');
        if (!trips.includes('madriz')) {
          trips.push('madriz');
          localStorage.setItem('baqueano_saved_trips', JSON.stringify(trips));
          btnSave.innerHTML = `<i class="fa-solid fa-check"></i> ¡Guardado en Mi Viaje!`;
          btnSave.style.borderColor = '#10B981';
          btnSave.style.color = '#10B981';
        } else {
          alert('Madriz ya forma parte de tu libreta de viaje en Baqueano.');
        }
      });
    }
  }

  // Exponer API en el objeto global
  window.BaqueanoMadriz = {
    renderMadrizExperience: renderMadrizExperience,
    openMunicipalityModal: openMunicipalityModal,
    closeMunicipalityModal: closeMunicipalityModal,
    switchGeologyTab: switchGeologyTab,
    playGeologyAudio: playGeologyAudio,
    openPhotoModal: openPhotoModal,
    closePhotoModal: closePhotoModal
  };

})();
