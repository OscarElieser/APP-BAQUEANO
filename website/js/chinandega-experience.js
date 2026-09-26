// ============================================================================
// BAQUEANO — EXPERIENCIA TERRITORIAL DE CHINANDEGA
// ============================================================================
// 🎯 POR QUÉ: presentar Chinandega como un sistema vivo de volcanes, costa,
// manglares, puertos, agricultura, fe y memoria; no como una lista de lugares.
// ⚙️ CÓMO: renderizado declarativo y responsivo dentro de departamento.html,
// con datos territoriales estables y estados honestos para información variable.
// 📦 QUÉ: hero, atractivos, 13 municipios, patrimonio, cultura, rutas, logística,
// precios documentados, conexiones temáticas y acciones de viaje.
// ============================================================================

(function (window, document) {
  'use strict';

  const MUNICIPALITIES = [
    ['Chinandega', 'Ciudad, patrimonio, vida comercial y puerta al volcán San Cristóbal.', 'fa-city'],
    ['Chichigalpa', 'Memoria maribia, arqueología, cultura y paisaje agroindustrial.', 'fa-landmark'],
    ['El Viejo', 'Basílica, Lavada de la Plata, Cosigüina, Padre Ramos y playas.', 'fa-church'],
    ['Corinto', 'Puerto, mar, pesca, gastronomía y cultura costera.', 'fa-anchor'],
    ['El Realejo', 'Antiguo puerto colonial, ruinas, manglares e historia.', 'fa-sailboat'],
    ['Posoltega', 'Volcán Casita, agricultura, memoria y resiliencia comunitaria.', 'fa-hands-holding-circle'],
    ['Puerto Morazán', 'Estero Real, camarones, memoria ferroviaria y Tonalá.', 'fa-water'],
    ['Somotillo', 'Frontera, intercambio, cerros y paisaje rural del norte.', 'fa-road'],
    ['Villanueva', 'Ríos, planicies agrícolas y conexión con Apacunca.', 'fa-wheat-awn'],
    ['Cinco Pinos', 'Cerro San Rafael, río El Gallo y naturaleza de montaña.', 'fa-mountain-sun'],
    ['San Pedro del Norte', 'Cordillera de La Botija, ríos y vida agropecuaria.', 'fa-cow'],
    ['San Francisco del Norte', 'Sabanas, Cerro del Mono, ríos y vida rural.', 'fa-tree'],
    ['Santo Tomás del Norte', 'Río Guasaule, agricultura y tradición comunitaria.', 'fa-people-group']
  ];

  const DESTINATIONS = [
    {
      icon: 'fa-volcano',
      name: 'Volcán San Cristóbal',
      eyebrow: 'Gigante de Occidente · 1,745 m aprox.',
      copy: 'Principal referencia volcánica del departamento y parte del Complejo Volcánico San Cristóbal–Casita. Las salidas deben depender del estado real del sendero, clima, riesgo volcánico y guía disponible.',
      tags: ['Condición actual', 'Guía recomendado', 'Equipo y seguridad']
    },
    {
      icon: 'fa-mountain',
      name: 'Volcán Cosigüina',
      eyebrow: 'Península · Laguna cratérica · Golfo de Fonseca',
      copy: 'Senderismo entre bosque, cráter y miradores hacia Nicaragua, Honduras y El Salvador, acompañado de interpretación geológica y comunitaria.',
      tags: ['Reserva natural', 'Senderismo', 'Mirador trinacional']
    },
    {
      icon: 'fa-seedling',
      name: 'Estero Padre Ramos',
      eyebrow: 'Manglar · Vida marina · Comunidad',
      copy: 'Una entrada educativa al manglar: protección costera, fauna, pesca artesanal, conservación y recorridos operados localmente en lancha o kayak.',
      tags: ['Manglar', 'Aves', 'Operador verificado']
    },
    {
      icon: 'fa-umbrella-beach',
      name: 'Costa del Pacífico',
      eyebrow: 'Jiquilillo · Aposentillo · Nahualapa · Paso Caballos',
      copy: 'Cada playa requiere información diferenciada sobre oleaje, baño, surf, acceso, temporada, servicios y estado actual del mar.',
      tags: ['Estado del mar', 'Accesibilidad', 'Servicios reales']
    },
    {
      icon: 'fa-church',
      name: 'El Viejo',
      eyebrow: 'Fe viva · Patrimonio · Lavada de la Plata',
      copy: 'El Santuario Nacional y Basílica Menor exige una visita respetuosa que explique la Virgen del Trono, la tradición del 6 de diciembre y el comportamiento dentro de un espacio vivo de fe.',
      tags: ['Patrimonio cultural', '1562', 'Tradición religiosa']
    },
    {
      icon: 'fa-anchor',
      name: 'Corinto y El Realejo',
      eyebrow: 'Puerto actual · Puerto colonial',
      copy: 'Dos lecturas complementarias del mar: actividad portuaria y gastronomía en Corinto; ruinas, estero y memoria del comercio colonial en El Realejo.',
      tags: ['Historia portuaria', 'Pesca', 'Cocina marina']
    },
    {
      icon: 'fa-wheat-awn',
      name: 'Llanos de Apacunca',
      eyebrow: 'Teocintle · Maíz · Biodiversidad',
      copy: 'Reserva genética que protege un pariente silvestre del maíz y conecta conservación, agricultura y gastronomía ancestral.',
      tags: ['Recurso genético', 'Educación ambiental', 'Maíz']
    },
    {
      icon: 'fa-binoculars',
      name: 'Delta del Estero Real',
      eyebrow: 'Humedal · Pesca artesanal · Aves',
      copy: 'Paisaje productivo y ambiental asociado con Puerto Morazán, manglares, zonas inundables y camaronicultura. Toda visita depende de accesos y operadores reales.',
      tags: ['Humedal', 'Comunidad', 'Conservación']
    }
  ];

  const ROUTES = [
    ['Entre volcanes', 'Chinandega → San Cristóbal → paisaje agrícola → cultura local.', 'fa-volcano'],
    ['Costa del Pacífico', 'Jiquilillo → Padre Ramos → manglar → gastronomía marina → atardecer.', 'fa-water'],
    ['Fe y patrimonio', 'El Viejo → Basílica → Virgen del Trono → tradición religiosa.', 'fa-church'],
    ['Historia de puertos', 'El Realejo → Corinto → memoria colonial → mar → gastronomía.', 'fa-anchor'],
    ['Maíz y biodiversidad', 'Apacunca → teocintle → agricultura → conservación → cocina de maíz.', 'fa-wheat-awn'],
    ['Norte rural', 'Somotillo → Cinco Pinos → San Pedro → San Francisco → Santo Tomás.', 'fa-mountain-sun']
  ];

  const GALLERY_IMAGES = [
    'chinandega.jpg', 'chinandega1.png', 'chinandega2.jfif', 'chinandega3.jfif',
    'chinandega4.jfif', 'chinandega5.jfif', 'chinandega6.jfif', 'chinandega7.jpg',
    'chinandega8.jfif', 'chinandega9.jfif', 'chinandega10.jfif', 'chinandega11.jfif',
    'chinandega12.jfif', 'chinandega13.jfif', 'chinandega14.jfif', 'chinandega15.jfif',
    'chinandega16.jfif', 'chinandega17.jfif', 'chinandega18.jfif', 'chinandega19.jfif',
    'chinandega20.jfif', 'chinandega21.jfif', 'chinandega22.jfif'
  ];

  const DEEP_DIVES = [
    {
      number: '01', icon: 'fa-volcano', title: 'San Cristóbal: el gigante de Occidente',
      subtitle: 'Complejo Volcánico San Cristóbal–Casita · 1,745 metros aprox.',
      copy: 'El San Cristóbal domina el paisaje chinandegano y constituye el punto más alto de la cadena volcánica del país. Su ficha no debe limitarse a ofrecer una subida: necesita nivel físico, estado del sendero, condiciones meteorológicas, riesgo volcánico, equipo, acompañamiento y fecha de la última verificación.',
      asideTitle: 'Antes de una salida',
      aside: ['Condiciones actuales confirmadas', 'Guía requerido o recomendado', 'Tiempo y dificultad del recorrido', 'Equipo y protocolo de seguridad']
    },
    {
      number: '02', icon: 'fa-mountain-sun', title: 'Cosigüina: Nicaragua frente a tres países',
      subtitle: 'Península · Laguna cratérica · Golfo de Fonseca',
      copy: 'La experiencia atraviesa bosque y paisaje volcánico hasta la laguna del cráter y los miradores del Golfo de Fonseca. El recorrido debe explicar la historia geológica, la biodiversidad y la relación de las comunidades de la península con Nicaragua, Honduras y El Salvador.',
      asideTitle: 'Secuencia territorial',
      aside: ['Sendero y bosque', 'Cráter y laguna', 'Mirador trinacional', 'Interpretación comunitaria']
    },
    {
      number: '03', icon: 'fa-seedling', title: 'Padre Ramos: entrar al mundo del manglar',
      subtitle: 'Reserva Natural · 22,061 hectáreas aprox.',
      copy: 'Padre Ramos permite comprender por qué el manglar protege la costa, qué especies dependen del estuario y cómo la pesca artesanal se relaciona con la conservación. Los recorridos en lancha o kayak deben proceder de operadores locales documentados.',
      asideTitle: 'Una visita que educa',
      aside: ['Función ecológica del manglar', 'Aves y fauna del estuario', 'Pesca artesanal', 'Operación local responsable']
    },
    {
      number: '04', icon: 'fa-umbrella-beach', title: 'Un departamento abierto al Pacífico',
      subtitle: 'Jiquilillo · Aposentillo · Nahualapa · Paso Caballos',
      copy: 'Las playas no son intercambiables. Cada ficha necesita oleaje, condición de baño, surf, accesibilidad, estacionamiento, servicios, temporada y estado actual del mar. Jiquilillo conecta especialmente descanso, cocina marina y exploración de Padre Ramos.',
      asideTitle: 'Información antes de ir',
      aside: ['Oleaje y baño', 'Surf y actividades', 'Acceso y servicios', 'Estado actual del mar']
    },
    {
      number: '05', icon: 'fa-church', title: 'El Viejo: espiritualidad y memoria nacional',
      subtitle: 'Basílica Menor · Virgen del Trono · Lavada de la Plata',
      copy: 'La tradición sitúa la llegada de la imagen en 1562 por el antiguo puerto de La Posesión. Cada 6 de diciembre, la Lavada de la Plata expresa una devoción viva; por eso la visita debe diferenciar patrimonio, ceremonia religiosa y comportamiento respetuoso dentro del templo.',
      asideTitle: 'Visita respetuosa',
      aside: ['Contexto histórico', 'Significado de la celebración', 'Conducta dentro del templo', 'Fe viva, no espectáculo']
    },
    {
      number: '06', icon: 'fa-anchor', title: 'El Realejo y Corinto: dos memorias del puerto',
      subtitle: 'Puerto colonial · Ciudad portuaria contemporánea',
      copy: 'El Realejo conserva la memoria del Puerto de La Posesión, ruinas coloniales, esteros y paisajes de pesca. Corinto muestra la vida marítima contemporánea y una cocina comunitaria reconocida por ceviches, pescado, sopas y preparaciones de mar.',
      asideTitle: 'Ruta portuaria',
      aside: ['Antiguo puerto colonial', 'Ruinas de San Francisco', 'Actividad marítima actual', 'Gastronomía comunitaria']
    },
    {
      number: '07', icon: 'fa-wheat-awn', title: 'Apacunca: memoria genética del maíz',
      subtitle: 'Teocintle · Biodiversidad · Agricultura',
      copy: 'La reserva protege poblaciones de teocintle, pariente silvestre del maíz y recurso genético de enorme relevancia. Esta historia conecta biodiversidad, agricultura, cocina ancestral y conservación sin convertir el área protegida en un simple escenario fotográfico.',
      asideTitle: 'Conexión BAQUEANO',
      aside: ['Teocintle y maíz', 'Diversidad genética', 'Agricultura local', 'Gastronomía ancestral']
    },
    {
      number: '08', icon: 'fa-binoculars', title: 'Estero Real y Puerto Morazán',
      subtitle: 'Humedal · Camaronicultura · Memoria ferroviaria',
      copy: 'El sistema del Estero Real reúne manglares, zonas inundables, aves, pesca artesanal y vida productiva. Puerto Morazán añade la memoria del antiguo ferrocarril y la conexión musical de Tonalá con Son tus Perjúmenes Mujer.',
      asideTitle: 'Territorio y patrimonio',
      aside: ['Observación de aves', 'Pesca y camaronicultura', 'Antiguo ramal ferroviario', 'Tonalá y patrimonio musical']
    },
    {
      number: '09', icon: 'fa-hands-holding-circle', title: 'Posoltega: memoria y resiliencia',
      subtitle: 'Volcán Casita · Huracán Mitch · Vida agrícola',
      copy: 'La memoria del desastre de 1998 debe tratarse con dignidad: explicar qué ocurrió, cómo recuerda la comunidad y cómo vive actualmente Posoltega. Su presente también incluye agricultura, patrimonio religioso y una identidad rural que no puede quedar reducida a la tragedia.',
      asideTitle: 'Memoria responsable',
      aside: ['Contexto del desastre', 'Respeto a las víctimas', 'Aprendizaje comunitario', 'Posoltega en el presente']
    },
    {
      number: '10', icon: 'fa-road', title: 'El norte rural y la frontera',
      subtitle: 'Somotillo · Cinco Pinos · San Pedro · San Francisco · Santo Tomás · Villanueva',
      copy: 'Más allá de la costa aparecen cordilleras, ríos, sabanas, planicies agrícolas y dinámicas fronterizas. Esta ruta incorpora el Cerro San Rafael, La Botija, el río Guasaule, los ríos Negro y Tecomapa, y comunidades cuyo paisaje cotidiano también forma parte de Chinandega.',
      asideTitle: 'Otra cara del departamento',
      aside: ['Paisaje fronterizo', 'Montaña y sabana', 'Ríos y agricultura', 'Comunidades rurales']
    }
  ];

  function updateHero(dept) {
    const hero = document.getElementById('deptHeroBg');
    const title = document.getElementById('deptTitle');
    const tagline = document.getElementById('deptTagline');
    const summary = document.getElementById('deptShortDesc');
    const badge = document.getElementById('deptBadgeText');
    if (hero) hero.style.backgroundImage = "url('assets/images/departamentos/chinandega.jpg')";
    if (title) title.textContent = 'Chinandega';
    if (tagline) tagline.textContent = '«Tierra de Volcanes, Manglares, Puertos, Mar y Tradiciones de Occidente»';
    if (badge) badge.innerHTML = '<i class="fa-solid fa-sun"></i> Occidente de Nicaragua · 13 Municipios';
    if (summary) {
      summary.innerHTML = `
        <strong>Cabecera:</strong> Chinandega &nbsp;|&nbsp;
        <strong>Región:</strong> Occidente &nbsp;|&nbsp;
        <strong>Municipios:</strong> 13 &nbsp;|&nbsp;
        <strong>Identidad:</strong> Volcanes · Pacífico · Manglares · Agricultura · Puertos<br>
        <span class="chinandega-hero-note">Del Golfo de Fonseca al Pacífico abierto: un territorio moldeado por el fuego volcánico, el mar y el trabajo de sus comunidades.</span>`;
    }
    if (dept) document.title = `Chinandega — Guía Territorial | Baqueano Nicaragua`;
  }

  function renderDestinations() {
    return DESTINATIONS.map((item, index) => `
      <article class="chinandega-destination-card">
        <div class="chinandega-card-number">${String(index + 1).padStart(2, '0')}</div>
        <div class="chinandega-card-icon"><i class="fa-solid ${item.icon}"></i></div>
        <span class="chinandega-eyebrow">${item.eyebrow}</span>
        <h3>${item.name}</h3>
        <p>${item.copy}</p>
        <div class="chinandega-tag-row">${item.tags.map((tag) => `<span>${tag}</span>`).join('')}</div>
      </article>`).join('');
  }

  function renderMunicipalities() {
    return MUNICIPALITIES.map(([name, copy, icon], index) => `
      <button type="button" class="chinandega-municipality-card" onclick="window.BaqueanoChinandega.openMunicipalityModal(${index})">
        <span class="chinandega-municipality-index">${String(index + 1).padStart(2, '0')}</span>
        <i class="fa-solid ${icon}"></i>
        <h3>${name}</h3>
        <p>${copy}</p>
        <span class="chinandega-detail-state"><i class="fa-solid fa-circle-info"></i> Ficha territorial en documentación</span>
      </button>`).join('');
  }

  function renderDeepDives() {
    return DEEP_DIVES.map((item) => `
      <section class="chinandega-section chinandega-deep-dive">
        <div class="chinandega-deep-card">
          <div class="chinandega-deep-main">
            <div class="chinandega-deep-index">${item.number}</div>
            <div class="chinandega-card-icon"><i class="fa-solid ${item.icon}"></i></div>
            <span class="chinandega-eyebrow">${item.subtitle}</span>
            <h2>${item.title}</h2>
            <p>${item.copy}</p>
          </div>
          <aside class="chinandega-deep-aside">
            <h3>${item.asideTitle}</h3>
            <ul>${item.aside.map((entry) => `<li><i class="fa-solid fa-circle-check"></i> ${entry}</li>`).join('')}</ul>
          </aside>
        </div>
      </section>`).join('');
  }

  function renderChinandegaExperience(container, dept) {
    if (!container) return;
    updateHero(dept);
    const target = container.querySelector('.dept-section-block .container');
    if (!target) return;
    const selector = document.getElementById('selectorTerritoriosSection');
    const selectorHtml = selector ? selector.outerHTML : '';

    target.innerHTML = `
      <section class="chinandega-intro-section">
        <div class="chinandega-manifesto-card">
          <div class="chinandega-badge-row">
            <span><i class="fa-solid fa-volcano"></i> Volcanes activos</span>
            <span><i class="fa-solid fa-water"></i> Pacífico y manglares</span>
            <span><i class="fa-solid fa-anchor"></i> Memoria portuaria</span>
          </div>
          <p class="chinandega-overline">ANTES DE LLEGAR · ENTENDÉ EL TERRITORIO</p>
          <h2>Chinandega no es solamente calor, playa y volcanes.</h2>
          <p>Es un territorio moldeado por tres fuerzas: la actividad volcánica, el océano Pacífico y el trabajo agrícola y marítimo de sus comunidades. Aquí conviven volcán, caña, puerto, manglar, maíz, mar, historia, fe, pesca y agricultura.</p>
          <div class="chinandega-manifesto-actions">
            <a href="#chinandegaDestinos" class="btn-hero-primary"><i class="fa-solid fa-compass"></i> Comprender Chinandega</a>
            <a href="#chinandegaMunicipios" class="btn-hero-secondary"><i class="fa-solid fa-map"></i> Explorar 13 municipios</a>
            <button type="button" class="btn-hero-glass" id="saveChinandega"><i class="fa-regular fa-bookmark"></i> Guardar en Mi Viaje</button>
          </div>
        </div>
      </section>

      <section class="infinite-gallery-section chinandega-infinite-gallery" aria-label="Galería en movimiento de Chinandega">
        <div class="container-fluid chinandega-gallery-fluid">
          <div class="infinite-carousel-container">
            <div class="infinite-track" id="chinandegaInfiniteTrack" title="Haz clic para pausar o reanudar">
              ${GALLERY_IMAGES.map((file, index) => `
                <div class="infinite-item"><img src="assets/images/departamentos/${file}" alt="Chinandega: territorio, cultura y naturaleza ${index + 1}" loading="lazy"></div>
              `).join('')}
              <div class="territory-carousel-clone" aria-hidden="true">
                ${GALLERY_IMAGES.map(file => `<div class="infinite-item"><img src="assets/images/departamentos/${file}" alt="" loading="lazy"></div>`).join('')}
              </div>
            </div>
          </div>
          <button type="button" class="chinandega-gallery-toggle" id="chinandegaGalleryToggle"><i class="fa-solid fa-pause"></i> Pausar galería</button>
        </div>
      </section>

      <section class="madriz-video-gallery chinandega-audio-section">
        <div class="container">
          <div class="video-gallery-header">
            <div class="sub-label-tag"><i class="fa-solid fa-wave-square"></i> EXPERIENCIA SONORA DOCUMENTADA</div>
            <h2 class="section-title-clean">Chinandega en el patrimonio musical</h2>
            <p>El archivo disponible se presenta con su crédito autoral, sin completar el repertorio con audios no documentados.</p>
          </div>
          <div class="chinandega-audio-card">
            <div class="chinandega-audio-icon"><i class="fa-solid fa-music"></i></div>
            <div><span>OBRA TERRITORIAL</span><h3>Corrido a Chinandega</h3><p>Composición vinculada a Tino López Guerra.</p></div>
            <audio controls preload="metadata" src="assets/audio/Corrido a Chinandega.mp3">Tu navegador no admite audio HTML5.</audio>
          </div>
        </div>
      </section>

      <section class="madriz-map-section" aria-labelledby="chinandegaMapTitle">
        <div class="container">
          <div class="madriz-map-heading">
            <div class="sub-label-tag"><i class="fa-solid fa-map-location-dot"></i> CARTOGRAFÍA VIVA DE CHINANDEGA</div>
            <h2 id="chinandegaMapTitle">Explorá el occidente desde el territorio real</h2>
            <p>Solo aparecen lugares publicados con coordenadas verificables. Las reseñas visibles proceden de opiniones publicadas.</p>
          </div>
          <div class="baqueano-map-wrapper" id="chinandegaMapShell">
            <div id="chinandegaMap" role="application" aria-label="Mapa interactivo de lugares publicados en Chinandega"></div>
            <div class="madriz-map-topbar">
              <span class="madriz-map-live"><i class="fa-solid fa-satellite-dish"></i> Datos territoriales BAQUEANO</span>
              <button type="button" class="madriz-map-expand" id="chinandegaMapExpand" aria-label="Ampliar mapa">Ampliar <i class="fa-solid fa-expand"></i></button>
            </div>
            <div class="madriz-map-status" id="chinandegaMapStatus" role="status" aria-live="polite"><i class="fa-solid fa-circle-notch fa-spin"></i> Consultando lugares publicados…</div>
            <div id="chinandegaMapPlacesCarousel" class="map-places-carousel" aria-label="Lugares disponibles en el mapa"></div>
          </div>
        </div>
      </section>

      <section class="chinandega-gallery-section" aria-labelledby="chinandegaGalleryTitle">
        <header class="chinandega-section-heading">
          <span><i class="fa-solid fa-camera"></i> TERRITORIO EN ALTA FIDELIDAD</span>
          <h2 id="chinandegaGalleryTitle">Volcanes, ciudad y costa occidental</h2>
          <p>Una lectura visual del departamento antes de profundizar en cada experiencia.</p>
        </header>
        <div class="chinandega-gallery-grid">
          <figure class="chinandega-gallery-card chinandega-gallery-card--wide">
            <img src="assets/images/departamentos/chinandega.jpg" alt="Paisaje representativo del departamento de Chinandega" loading="lazy">
            <figcaption><strong>Territorio volcánico</strong><span>Occidente de Nicaragua</span></figcaption>
          </figure>
          <figure class="chinandega-gallery-card">
            <img src="assets/images/departamentos/chinandega1.png" alt="Paisaje cultural y natural de Chinandega" loading="lazy">
            <figcaption><strong>Identidad occidental</strong><span>Historia, producción y comunidad</span></figcaption>
          </figure>
        </div>
      </section>

      <section class="chinandega-facts-strip" aria-label="Datos territoriales de Chinandega">
        <article><strong>13</strong><span>Municipios</span></article>
        <article><strong>2</strong><span>Grandes sistemas volcánicos</span></article>
        <article><strong>5</strong><span>Áreas naturales destacadas</span></article>
        <article><strong>1</strong><span>Territorio abierto al Pacífico</span></article>
      </section>

      <section class="chinandega-section" id="chinandegaDestinos">
        <header class="chinandega-section-heading">
          <span><i class="fa-solid fa-location-dot"></i> EXPERIENCIAS QUE DEFINEN EL OCCIDENTE</span>
          <h2>Del fuego volcánico al mundo del manglar</h2>
          <p>Cada experiencia informa qué protege, qué condiciones deben verificarse y cómo conectar respetuosamente con el territorio.</p>
        </header>
        <div class="chinandega-destinations-grid">${renderDestinations()}</div>
      </section>

      ${renderDeepDives()}

      <section class="chinandega-section" id="chinandegaTerritorioVivo">
        <header class="chinandega-section-heading">
          <span><i class="fa-solid fa-microscope"></i> MODO TERRITORIO VIVO</span>
          <h2>Comprendé las fuerzas que construyen Chinandega</h2>
        </header>
        <div class="geo-tabs-bar chinandega-tabs">
          <button type="button" class="geo-tab-btn active" data-chinandega-tab="volcanes">Volcanes</button>
          <button type="button" class="geo-tab-btn" data-chinandega-tab="manglares">Manglares</button>
          <button type="button" class="geo-tab-btn" data-chinandega-tab="puertos">Puertos</button>
          <button type="button" class="geo-tab-btn" data-chinandega-tab="maiz">Maíz</button>
        </div>
        <div class="chinandega-tab-stage" id="chinandegaTabStage"></div>
      </section>

      <section class="chinandega-section chinandega-municipality-section" id="chinandegaMunicipios">
        <header class="chinandega-section-heading">
          <span><i class="fa-solid fa-map-location-dot"></i> LOS 13 MUNICIPIOS</span>
          <h2>Muchas formas de vivir Chinandega</h2>
          <p>La costa, la ciudad, el norte rural, los puertos y las zonas agrícolas forman un solo departamento con identidades distintas.</p>
        </header>
        <div class="chinandega-municipality-grid">${renderMunicipalities()}</div>
      </section>

      <section class="chinandega-section">
        <div class="chinandega-story-grid">
          <article class="chinandega-story-card chinandega-story-card--sea">
            <span class="chinandega-story-icon"><i class="fa-solid fa-shrimp"></i></span>
            <p class="chinandega-overline">GASTRONOMÍA DE TIERRA Y MAR</p>
            <h2>Chinandega también se comprende comiendo</h2>
            <p>Corinto y El Realejo reúnen ceviches, pescado, camarones, conchas y sopas marineras. El interior conecta sopa de queso, cocina de maíz y tradición rosquillera de El Viejo.</p>
            <ul>
              <li>Ingredientes y preparación documentados</li>
              <li>Quién cocina y dónde probarlo</li>
              <li>Precio actual solamente desde un establecimiento verificado</li>
            </ul>
          </article>
          <article class="chinandega-story-card chinandega-story-card--culture">
            <span class="chinandega-story-icon"><i class="fa-solid fa-music"></i></span>
            <p class="chinandega-overline">ESCUCHÁ CHINANDEGA</p>
            <h2>Música vinculada al territorio</h2>
            <ul class="chinandega-music-list">
              <li><strong>Cumbia Chinandegana</strong><span>Jorge Paladino</span></li>
              <li><strong>Corrido a Chinandega</strong><span>Tino López Guerra</span></li>
              <li><strong>Nicaragua Mía</strong><span>Tino López Guerra</span></li>
              <li><strong>Son tus Perjúmenes Mujer</strong><span>Tradición vinculada a Tonalá</span></li>
            </ul>
            <a href="musica.html" class="chinandega-text-link">Abrir patrimonio sonoro <i class="fa-solid fa-arrow-right"></i></a>
          </article>
        </div>
      </section>

      <section class="chinandega-section">
        <div class="chinandega-conservation-card">
          <div>
            <p class="chinandega-overline">NATURALEZA QUE DEBE PROTEGERSE</p>
            <h2>Visitar también significa custodiar</h2>
            <p>Cosigüina, Estero Real, Padre Ramos, Llanos de Apacunca y el Complejo San Cristóbal–Casita no son escenarios decorativos: son sistemas vivos con comunidades, normas y límites.</p>
          </div>
          <div class="chinandega-conservation-list">
            <span><i class="fa-solid fa-shield-heart"></i> Actividades permitidas</span>
            <span><i class="fa-solid fa-ban"></i> Restricciones vigentes</span>
            <span><i class="fa-solid fa-leaf"></i> Impacto del visitante</span>
            <span><i class="fa-solid fa-people-group"></i> Guía y operador local</span>
          </div>
        </div>
      </section>

      <section class="chinandega-section">
        <header class="chinandega-section-heading">
          <span><i class="fa-solid fa-people-group"></i> QUIÉNES HACEN VIVIR CHINANDEGA</span>
          <h2>Perfiles reales, autorizados y vinculados al territorio</h2>
          <p>Esta sección no inventa nombres. Se activará con personas y organizaciones que hayan autorizado su publicación.</p>
        </header>
        <div class="chinandega-people-grid">
          ${['Pescadores y prestadores de lancha','Guías de volcanes y naturaleza','Cocineras y productoras de rosquillas','Productores agrícolas','Músicos y promotores culturales','Cooperativas y turismo rural'].map((role) => `
            <article><i class="fa-solid fa-user-check"></i><h3>${role}</h3><p>Perfil pendiente de registro y autorización documental.</p><span>Sin identidad ficticia</span></article>
          `).join('')}
        </div>
      </section>

      <section class="chinandega-section">
        <header class="chinandega-section-heading">
          <span><i class="fa-solid fa-route"></i> VIVÍ CHINANDEGA</span>
          <h2>Seis rutas para comprender, no solamente recorrer</h2>
          <p>Los recorridos son propuestas editoriales. Precios, horarios y disponibilidad se obtienen únicamente de proveedores documentados.</p>
        </header>
        <div class="chinandega-routes-grid">
          ${ROUTES.map(([name, copy, icon], index) => `
            <article><span>${index + 1}</span><i class="fa-solid ${icon}"></i><h3>${name}</h3><p>${copy}</p><strong><i class="fa-solid fa-clock"></i> Consultar disponibilidad</strong></article>
          `).join('')}
        </div>
      </section>

      <section class="chinandega-section">
        <div class="chinandega-info-grid">
          <article>
            <i class="fa-solid fa-masks-theater"></i>
            <h3>Tradiciones vivas</h3>
            <p>Los Mantudos de Chinandega, la Lavada de la Plata en El Viejo y Los Judíos o Contilados de Santo Tomás del Norte deben explicarse con contexto, fecha y conducta respetuosa.</p>
          </article>
          <article>
            <i class="fa-solid fa-landmark-dome"></i>
            <h3>Patrimonio documentado</h3>
            <p>Iglesias de Chinandega y Chichigalpa, ruinas de San Francisco en El Realejo, Basílica de El Viejo e iglesia parroquial de Posoltega.</p>
          </article>
          <article>
            <i class="fa-solid fa-mound"></i>
            <h3>Arqueología responsable</h3>
            <p>El Museo Chichihualtepec y la memoria maribia se presentan separando evidencia documentada, interpretación y tradición oral.</p>
          </article>
          <article>
            <i class="fa-solid fa-moon"></i>
            <h3>Tradición oral</h3>
            <p>Los relatos relacionados con volcanes y comunidades se identifican claramente como memoria cultural, no como hechos científicos o históricos.</p>
          </article>
        </div>
      </section>

      <section class="chinandega-section">
        <div class="chinandega-logistics-card">
          <header>
            <span><i class="fa-solid fa-compass"></i> PLANIFICACIÓN HONESTA</span>
            <h2>Cómo llegar, cuándo viajar y cuánto cuesta</h2>
          </header>
          <div class="chinandega-logistics-grid">
            <article><i class="fa-solid fa-bus"></i><h3>Transporte</h3><p>Terminal, ruta, horario, precio, fecha de verificación y fuente. Ningún horario se fija permanentemente en HTML.</p></article>
            <article><i class="fa-solid fa-cloud-sun"></i><h3>Condiciones</h3><p>Playa, volcán, manglar, aves, fiestas y surf requieren respuestas distintas según clima, oleaje y acceso actual.</p></article>
            <article><i class="fa-solid fa-tags"></i><h3>Precios reales</h3><p><strong>Verificado</strong>, <strong>publicado recientemente</strong> o <strong>consultar precio</strong>. Nunca estimaciones presentadas como tarifas vigentes.</p></article>
            <article><i class="fa-solid fa-kit-medical"></i><h3>SOS Chinandega</h3><p>Hospitales, centros de salud, Policía, Bomberos, Cruz Roja, guía y ruta médica deben proceder del directorio actualizado.</p></article>
          </div>
        </div>
      </section>

      <section class="chinandega-closing-section">
        <div class="chinandega-closing-card">
          <p class="chinandega-overline">TU VIAJE COMIENZA CON UNA DECISIÓN INFORMADA</p>
          <h2>Ya conocés un poco de Chinandega. Ahora vivilo.</h2>
          <div class="chinandega-closing-actions">
            <a href="#chinandegaMunicipios"><i class="fa-solid fa-map"></i> Explorar 13 municipios</a>
            <a href="#chinandegaDestinos"><i class="fa-solid fa-volcano"></i> Conocer volcanes y manglares</a>
            <a href="gastronomia.html"><i class="fa-solid fa-shrimp"></i> Comer frente al Pacífico</a>
            <a href="musica.html"><i class="fa-solid fa-music"></i> Escuchar Chinandega</a>
            <a href="aliados.html"><i class="fa-solid fa-handshake"></i> Conocer anfitriones</a>
            <button type="button" class="open-planner-btn"><i class="fa-solid fa-wand-magic-sparkles"></i> Construir mi aventura</button>
            <button type="button" class="open-sos-btn"><i class="fa-solid fa-tower-broadcast"></i> SOS Chinandega</button>
          </div>
        </div>
      </section>

      <div class="modal-backdrop-pro" id="chinandegaMunicipalityModal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="chinandegaMunicipalityTitle">
        <div class="mun-modal-dialog">
          <button type="button" class="modal-close-x" id="closeChinandegaMunicipality" aria-label="Cerrar ficha"><i class="fa-solid fa-xmark"></i></button>
          <div id="chinandegaMunicipalityBody"></div>
        </div>
      </div>

      ${selectorHtml}`;

    bindSaveAction();
    bindInteractiveExperience();
    if (window.BaqueanoChinandegaMap) window.BaqueanoChinandegaMap.mount();
  }

  const TERRITORY_TABS = {
    volcanes: ['Fuego y relieve', 'San Cristóbal, Casita y Cosigüina explican buena parte del relieve, los suelos y los riesgos naturales del departamento.', 'fa-volcano'],
    manglares: ['La frontera entre tierra y mar', 'Padre Ramos y Estero Real protegen costa, sostienen fauna y acompañan formas de vida relacionadas con pesca y humedales.', 'fa-seedling'],
    puertos: ['Puertas históricas del Pacífico', 'El Realejo conserva la memoria colonial; Corinto representa la actividad marítima contemporánea; Puerto Morazán conecta estero y ferrocarril.', 'fa-anchor'],
    maiz: ['Diversidad que alimenta', 'Apacunca protege teocintle y conecta genética, agricultura, cocina ancestral y soberanía alimentaria.', 'fa-wheat-awn']
  };

  function renderTerritoryTab(key) {
    const stage = document.getElementById('chinandegaTabStage');
    const item = TERRITORY_TABS[key] || TERRITORY_TABS.volcanes;
    if (!stage) return;
    stage.innerHTML = `<i class="fa-solid ${item[2]}"></i><div><h3>${item[0]}</h3><p>${item[1]}</p></div>`;
    document.querySelectorAll('[data-chinandega-tab]').forEach((button) => button.classList.toggle('active', button.dataset.chinandegaTab === key));
  }

  function bindInteractiveExperience() {
    renderTerritoryTab('volcanes');
    document.querySelectorAll('[data-chinandega-tab]').forEach((button) => button.addEventListener('click', () => renderTerritoryTab(button.dataset.chinandegaTab)));
    const track = document.getElementById('chinandegaInfiniteTrack');
    const toggle = document.getElementById('chinandegaGalleryToggle');
    const toggleGallery = () => {
      if (!track || !toggle) return;
      const paused = track.classList.toggle('is-paused');
      toggle.innerHTML = paused ? '<i class="fa-solid fa-play"></i> Reanudar galería' : '<i class="fa-solid fa-pause"></i> Pausar galería';
    };
    track?.addEventListener('click', toggleGallery);
    toggle?.addEventListener('click', toggleGallery);
    document.getElementById('closeChinandegaMunicipality')?.addEventListener('click', closeMunicipalityModal);
  }

  function openMunicipalityModal(index) {
    const municipality = MUNICIPALITIES[index];
    const modal = document.getElementById('chinandegaMunicipalityModal');
    const body = document.getElementById('chinandegaMunicipalityBody');
    if (!municipality || !modal || !body) return;
    body.innerHTML = `<div class="mun-modal-header"><span class="modal-badge-pill">Municipio ${index + 1} de 13</span><h2 class="modal-mun-title" id="chinandegaMunicipalityTitle">${municipality[0]}</h2><h4 class="modal-mun-subtitle">Chinandega · Occidente de Nicaragua</h4></div><div class="chinandega-municipality-modal-copy"><i class="fa-solid ${municipality[2]}"></i><p>${municipality[1]}</p><div class="chinandega-modal-notice"><i class="fa-solid fa-shield-check"></i> Servicios, horarios y precios se mostrarán únicamente cuando estén documentados.</div></div>`;
    modal.classList.add('active'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
  }

  function closeMunicipalityModal() {
    const modal = document.getElementById('chinandegaMunicipalityModal');
    if (!modal) return;
    modal.classList.remove('active'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow='';
  }

  function bindSaveAction() {
    const button = document.getElementById('saveChinandega');
    if (!button) return;
    button.addEventListener('click', () => {
      try {
        const saved = JSON.parse(window.localStorage.getItem('baqueano_saved_trips') || '[]');
        if (!saved.includes('chinandega')) saved.push('chinandega');
        window.localStorage.setItem('baqueano_saved_trips', JSON.stringify(saved));
        button.innerHTML = '<i class="fa-solid fa-check"></i> Guardado en Mi Viaje';
        button.classList.add('is-saved');
      } catch (error) {
        console.warn('[Chinandega] No fue posible guardar el viaje:', error.message);
      }
    });
  }

  window.BaqueanoChinandega = { renderChinandegaExperience, openMunicipalityModal, closeMunicipalityModal };
})(window, document);
