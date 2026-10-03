/**
 * ============================================================================
 * 🧭 BAQUEANO ECOSYSTEM — index-destinos-editorial.js
 * ============================================================================
 *
 * 🎯 1. POR QUÉ (WHY / PROPÓSITO):
 * - Orquestar la experiencia interactiva, inmersiva y editorial de la sección
 *   "Destinos que Inspiran" en la portada web de BAQUEANO.
 * - Conectar el relato territorial, los filtros temáticos, los puntos sobre el
 *   mapa de relieve y la mini-galería fotográfica en un flujo reactivo unificado.
 *
 * ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
 * - Arquitectura de datos desacoplada y tipada para cada destino.
 * - Soporte nativo para consumir datos desde Supabase mediante window.BAQUEANO_DESTINATIONS.
 * - Manipulación defensiva del DOM con DocumentFragment y replaceChildren.
 * - Transición fotográfica suave mediante la clase .is-changing.
 * - Autoplay infinito de 5 s entre destinos con barra de progreso animada,
 *   pausa en hover/foco y botón de pausa/play accesible.
 *
 * 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
 * - Catálogo maestro de 5 destinos icónicos (Ometepe, Somoto, León, Granada, Cerro Negro).
 * - API pública global window.BaqueanoDestinations.show/get/getAll/pause/resume.
 * - Ciclo automático infinito con pausa manual de 10 s tras interacción.
 * ============================================================================
 */

(function () {
  'use strict';

  const defaultDestinations = {
    ometepe: {
      title: 'Isla de Ometepe',
      location: 'Rivas · Lago de Nicaragua',
      description: 'Naturaleza, cultura y comunidades que te conectan con la esencia de Nicaragua.',
      image: 'assets/images/destinos/isla_de_ometepe.jpg',
      gallery: [
        'assets/images/destinos/isla_de_ometepe.jpg',
        'assets/images/destinos/cascada_la_luna.jpg',
        'assets/images/destinos/Finca Magdalena Eco-Lodge Campesino.jpg',
        'assets/images/comida/nacatamal.jpg'
      ],
      traits: [
        { icon: 'fa-volcano',        label: 'Volcanes',    color: '#2D7A4F' },
        { icon: 'fa-person-hiking',  label: 'Senderismo',  color: '#4A6D8C' },
        { icon: 'fa-landmark',       label: 'Cultura',     color: '#D95328' },
        { icon: 'fa-utensils',       label: 'Gastronomía', color: '#C97D1A' },
        { icon: 'fa-people-group',   label: 'Comunidades', color: '#165D6F' }
      ],
      categories: ['todos', 'naturaleza', 'volcanes', 'cultura', 'comunidades'],
      href: 'destinos.html?id=ometepe'
    },

    somoto: {
      title: 'Cañón de Somoto',
      location: 'Madriz · Somoto',
      description: 'Agua cristalina, roca milenaria y baqueanos comunitarios en uno de los paisajes geológicos más antiguos de Centroamérica.',
      image: 'assets/images/destinos/canon_de_somoto.jpg',
      gallery: [
        'assets/images/destinos/canon_de_somoto.jpg',
        'assets/images/departamentos/somoto.jpg',
        'assets/images/departamentos/somoto1.png',
        'assets/images/comida/delicias del norte.jpg'
      ],
      traits: [
        { icon: 'fa-water',          label: 'Río & Cañón', color: '#2D7A4F' },
        { icon: 'fa-person-hiking',  label: 'Aventura',    color: '#4A6D8C' },
        { icon: 'fa-monument',       label: 'Patrimonio',  color: '#D95328' },
        { icon: 'fa-utensils',       label: 'Rosquillas',  color: '#C97D1A' },
        { icon: 'fa-people-group',   label: 'Baqueanos',   color: '#165D6F' }
      ],
      categories: ['todos', 'naturaleza', 'patrimonio', 'comunidades'],
      href: 'destinos.html?id=somoto'
    },

    leon: {
      title: 'León Colonial',
      location: 'León · Occidente',
      description: 'Poesía, memoria de Darío, arquitectura sacra Patrimonio de la Humanidad y la imponente cordillera volcánica de los Maribios.',
      image: 'assets/images/departamentos/leon.png',
      gallery: [
        'assets/images/departamentos/leon.png',
        'assets/images/departamentos/leon1.png',
        'assets/images/departamentos/leon2.jfif',
        'assets/images/comida/quesillo.jpg'
      ],
      traits: [
        { icon: 'fa-landmark',          label: 'Catedral UNESCO', color: '#2D7A4F' },
        { icon: 'fa-building-columns',  label: 'Museos & Arte',   color: '#4A6D8C' },
        { icon: 'fa-book-open',         label: 'Rubén Darío',     color: '#D95328' },
        { icon: 'fa-utensils',          label: 'Quesillos',       color: '#C97D1A' },
        { icon: 'fa-volcano',           label: 'Cordillera',      color: '#165D6F' }
      ],
      categories: ['todos', 'cultura', 'patrimonio', 'museos', 'gastronomia'],
      href: 'destinos.html?id=leon'
    },

    granada: {
      title: 'Granada la Sultana',
      location: 'Granada · Lago de Nicaragua',
      description: 'Patios señoriales, tradición viva entre las 365 isletas, conventos centenarios y el sabor ancestral del vigorón.',
      image: 'assets/images/departamentos/granada.jpg',
      gallery: [
        'assets/images/departamentos/granada.jpg',
        'assets/images/destinos/isletas_de_granada.jpg',
        'assets/images/destinos/Casa Señorial Colonial Granada.jpg',
        'assets/images/comida/vigoron.jpg'
      ],
      traits: [
        { icon: 'fa-landmark',         label: 'Arquitectura', color: '#2D7A4F' },
        { icon: 'fa-water',            label: '365 Isletas',  color: '#4A6D8C' },
        { icon: 'fa-building-columns', label: 'Conventos',    color: '#D95328' },
        { icon: 'fa-utensils',         label: 'Vigorón',      color: '#C97D1A' },
        { icon: 'fa-people-group',     label: 'Cultura Viva', color: '#165D6F' }
      ],
      categories: ['todos', 'cultura', 'patrimonio', 'playas', 'gastronomia', 'museos'],
      href: 'destinos.html?id=granada'
    },

    'cerro-negro': {
      title: 'Volcán Cerro Negro',
      location: 'León · Cordillera de los Maribios',
      description: 'Arena basáltica, horizonte volcánico abierto y sandboarding extremo en el volcán más joven y activo de Centroamérica.',
      image: 'assets/images/destinos/cerro_negro.jpg',
      gallery: [
        'assets/images/destinos/cerro_negro.jpg',
        'assets/images/departamentos/leon7.jfif',
        'assets/images/departamentos/leon9.jfif',
        'assets/images/comida/gallo_pinto.jpg'
      ],
      traits: [
        { icon: 'fa-volcano',           label: 'Volcán Activo', color: '#2D7A4F' },
        { icon: 'fa-person-snowboarding', label: 'Sandboarding', color: '#4A6D8C' },
        { icon: 'fa-mountain-sun',      label: 'Cráteres',      color: '#D95328' },
        { icon: 'fa-compass',           label: 'Geoturismo',    color: '#C97D1A' },
        { icon: 'fa-people-group',      label: 'Baqueanos',     color: '#165D6F' }
      ],
      categories: ['todos', 'volcanes', 'naturaleza'],
      href: 'destinos.html?id=cerro_negro'
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const root = document.querySelector('[data-inspire-root]');
    if (!root) return;

    const pins             = [...root.querySelectorAll('[data-destination]')];
    const filters          = [...root.querySelectorAll('[data-inspire-filter]')];
    const heroImg          = root.querySelector('[data-inspire-image]');
    const titleEl          = root.querySelector('[data-inspire-title]');
    const locationEl       = root.querySelector('[data-inspire-location]');
    const descEl           = root.querySelector('[data-inspire-description]');
    const linkEl           = root.querySelector('[data-inspire-link]');
    const traitsContainer  = root.querySelector('[data-inspire-traits]');
    const polaroidItems    = [...root.querySelectorAll('.polaroid-item')];
    const btnNext          = root.querySelector('#btnNextGalleryItem');
    const article          = root.querySelector('.inspire-feature');

    const externalDestinations = window.BAQUEANO_DESTINATIONS;
    const data = externalDestinations && typeof externalDestinations === 'object'
      ? { ...defaultDestinations, ...externalDestinations }
      : defaultDestinations;

    // ═══════════════════════════════════════════════════════════════════════
    // MOTOR CARTOGRÁFICO — Sistema de 4 capas
    // Principio: el ANCHOR (punto SVG) es la ubicación real e inamovible.
    // El CALLOUT (tarjeta) se posiciona por data-card-x/card-y.
    // El CONECTOR Bézier une ambos puntos visualmente.
    // ═══════════════════════════════════════════════════════════════════════

    const mapRoot          = document.getElementById('nicaraguaMapRoot');
    const svgConnections   = document.getElementById('mapConnectionsSvg');
    const geoAnchors       = svgConnections
      ? [...svgConnections.querySelectorAll('.geo-anchor')]
      : [];
    const geoCallouts      = mapRoot
      ? [...mapRoot.querySelectorAll('.geo-callout')]
      : [];

    // Namespace SVG para crear elementos geométricos
    const SVG_NS = 'http://www.w3.org/2000/svg';

    // Mapa de conectores: destId → <path> SVG
    const connectorMap = {};

    /**
     * buildConnectors() — Genera un <path> Bézier por cada callout.
     * El path va desde el centro del anchor (cx, cy del SVG en unidades %)
     * hasta el centro del callout, transformando píxeles a % del SVG.
     * Se llama UNA sola vez al init y cuando el viewport cambia.
     */
    function buildConnectors() {
      if (!svgConnections || !mapRoot) return;

      // Limpiar conectores previos
      svgConnections.querySelectorAll('.geo-connector').forEach(el => el.remove());

      const svgRect  = svgConnections.getBoundingClientRect();
      const rootRect = mapRoot.getBoundingClientRect();
      if (svgRect.width < 10 || svgRect.height < 10) return;

      geoCallouts.forEach(callout => {
        const destId = callout.dataset.destination;
        if (!destId) return;

        // Anchor SVG (cx/cy en unidades % del viewBox 0 0 100 100)
        const anchorEl = svgConnections.querySelector(
          `.geo-anchor[data-anchor-for="${destId}"]`
        );
        if (!anchorEl) return;
        const dotEl = anchorEl.querySelector('.anchor-dot');
        if (!dotEl) return;

        const ax = parseFloat(dotEl.getAttribute('cx')); // % en SVG
        const ay = parseFloat(dotEl.getAttribute('cy')); // % en SVG

        // Posición en píxeles del callout relativa al SVG
        const callRect = callout.getBoundingClientRect();
        const cx_px = callRect.left + callRect.width  * 0.5 - svgRect.left;
        const cy_px = callRect.top  + callRect.height * 0.5 - svgRect.top;

        // Convertir píxeles a % del viewBox (0 0 100 100)
        const cx = (cx_px / svgRect.width)  * 100;
        const cy = (cy_px / svgRect.height) * 100;

        // Control point Bézier: curvatura moderada entre los dos puntos
        const cpx = ax + (cx - ax) * 0.35;
        const cpy = ay + (cy - ay) * 0.65;

        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('class', 'geo-connector');
        path.setAttribute('data-connector-for', destId);
        // Bézier cuadrático Q cx cy, endX endY
        path.setAttribute('d', `M ${ax} ${ay} Q ${cpx} ${cpy}, ${cx} ${cy}`);
        svgConnections.appendChild(path);
        connectorMap[destId] = path;
      });
    }

    /**
     * updateGeoMap(activeId) — Sincroniza el estado visual del mapa
     * cuando cambia el destino activo:
     * - Activa el anchor del destino seleccionado
     * - Resalta su conector Bézier
     * - Transfiere el halo pulsante al anchor activo
     */
    function updateGeoMap(activeId) {
      // Anchors
      geoAnchors.forEach(anchor => {
        const isActive = anchor.dataset.anchorFor === activeId;
        anchor.classList.toggle('is-active', isActive);
        // Transferir halo pulsante
        const halo = anchor.querySelector('.anchor-halo');
        if (halo) halo.classList.toggle('anchor-halo--pulse', isActive);
      });

      // Conectores
      Object.entries(connectorMap).forEach(([id, path]) => {
        path.classList.toggle('is-active', id === activeId);
      });
    }

    const destSequence = Object.keys(data);
    let currentDestinationId = 'ometepe';
    let currentSequenceIndex = 0;
    let currentGalleryIndex  = 0;

    // ── Barra de Progreso del Autoplay ──────────────────────────────────────
    const progressWrap = document.createElement('div');
    progressWrap.className = 'inspire-autoplay-progress';
    progressWrap.setAttribute('aria-hidden', 'true');
    const progressBar = document.createElement('div');
    progressBar.className = 'inspire-autoplay-bar';
    progressWrap.appendChild(progressBar);
    article && article.appendChild(progressWrap);

    // ── Botón Pausa/Play accesible ──────────────────────────────────────────
    const playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'inspire-autoplay-toggle';
    playBtn.setAttribute('aria-label', 'Pausar galería automática');
    playBtn.setAttribute('title', 'Pausar / Reproducir');
    playBtn.innerHTML = '<i class="fa-solid fa-pause" aria-hidden="true"></i>';
    article && article.appendChild(playBtn);

    // ── Indicadores de destino (dots) ───────────────────────────────────────
    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'inspire-autoplay-dots';
    dotsWrap.setAttribute('aria-hidden', 'true');
    destSequence.forEach((id, i) => {
      const dot = document.createElement('span');
      dot.className = 'inspire-dot' + (i === 0 ? ' is-active' : '');
      dot.dataset.dotIndex = i;
      dotsWrap.appendChild(dot);
    });
    article && article.appendChild(dotsWrap);

    let autoplayTimer = null;
    let resumeTimer   = null;
    let isPaused      = false;
    const INTERVAL       = 5000;
    const RESUME_DELAY   = 10000;

    function updateDots(activeIndex) {
      [...dotsWrap.children].forEach((dot, i) =>
        dot.classList.toggle('is-active', i === activeIndex)
      );
    }

    function resetProgressBar() {
      progressBar.style.transition = 'none';
      progressBar.style.width = '0%';
      void progressBar.offsetWidth; // reflow
      progressBar.style.transition = `width ${INTERVAL}ms linear`;
      progressBar.style.width = isPaused ? '0%' : '100%';
    }

    function pauseProgressBar() {
      const computed = parseFloat(getComputedStyle(progressBar).width) || 0;
      const parentW  = progressWrap.offsetWidth || 1;
      progressBar.style.transition = 'none';
      progressBar.style.width = `${(computed / parentW) * 100}%`;
    }

    function updateHeroImage(url, altText) {
      if (!heroImg || !url) return;
      heroImg.classList.add('is-changing');
      const tmp = new Image();
      tmp.onload = () => {
        heroImg.src = url;
        heroImg.alt = altText || 'Destino turístico de Nicaragua';
        heroImg.classList.remove('is-changing');
      };
      tmp.onerror = () => {
        heroImg.classList.remove('is-changing');
        console.warn('[BaqueanoDestinations] No fue posible cargar:', url);
      };
      tmp.src = url;
    }

    function render(id, fromAutoplay) {
      const source = data[id];
      if (!source || typeof source !== 'object') return;
      currentDestinationId = id;
      currentGalleryIndex  = 0;

      const seqIdx = destSequence.indexOf(id);
      if (seqIdx !== -1) {
        currentSequenceIndex = seqIdx;
        updateDots(seqIdx);
      }

      const item = { ...(defaultDestinations[id] || {}), ...source };
      const mainImg = item.image_url || item.image;

      updateHeroImage(mainImg, `Paisaje de ${item.title}`);

      if (titleEl)    titleEl.textContent    = item.title;
      if (locationEl) locationEl.textContent = item.location;
      if (descEl)     descEl.textContent     = item.description;
      if (linkEl)     linkEl.href            = item.href || 'destinos.html';

      // Traits
      if (traitsContainer) {
        const traits   = Array.isArray(item.traits) ? item.traits : [];
        const fragment = document.createDocumentFragment();
        traits.forEach(t => {
          const badge  = document.createElement('div');
          badge.className = 'trait-badge-item';
          const circle = document.createElement('div');
          circle.className = 'trait-circle-icon';
          circle.style.backgroundColor = t.color || '#165D6F';
          const ico = document.createElement('i');
          const safe = /^fa-[a-z0-9-]+$/i.test(String(t.icon || '')) ? t.icon : 'fa-compass';
          ico.className = `fa-solid ${safe}`;
          ico.setAttribute('aria-hidden', 'true');
          circle.appendChild(ico);
          const lbl = document.createElement('span');
          lbl.className = 'trait-label-text';
          lbl.textContent = String(t.label || '');
          badge.append(circle, lbl);
          fragment.appendChild(badge);
        });
        traitsContainer.replaceChildren(fragment);
      }

      // Galería
      const gallery = Array.isArray(item.gallery) && item.gallery.length > 0 ? item.gallery : [mainImg];
      polaroidItems.forEach((btn, i) => {
        const photoUrl = gallery[i] || gallery[0] || mainImg;
        const img = btn.querySelector('img');
        if (img) { img.src = photoUrl; img.alt = `${item.title} — foto ${i + 1}`; }
        btn.classList.toggle('is-active', i === 0);
      });

      // Pins mapa
      pins.forEach(pin => {
        const active = pin.dataset.destination === id;
        pin.classList.toggle('is-active', active);
        pin.setAttribute('aria-pressed', String(active));
      });

      // Actualizar sistema cartográfico geográfico
      updateGeoMap(id);

      // Reiniciar barra de progreso solo si el render viene del autoplay
      if (fromAutoplay) resetProgressBar();
    }

    // ── Autoplay ────────────────────────────────────────────────────────────
    function startAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
      autoplayTimer = setInterval(() => {
        if (isPaused) return;
        currentSequenceIndex = (currentSequenceIndex + 1) % destSequence.length;
        render(destSequence[currentSequenceIndex], true);
      }, INTERVAL);
      resetProgressBar();
    }

    function pauseAutoplay(scheduleResume) {
      isPaused = true;
      pauseProgressBar();
      playBtn.innerHTML = '<i class="fa-solid fa-play" aria-hidden="true"></i>';
      playBtn.setAttribute('aria-label', 'Reproducir galería automática');
      if (scheduleResume) {
        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(resumeAutoplay, RESUME_DELAY);
      }
    }

    function resumeAutoplay() {
      isPaused = false;
      playBtn.innerHTML = '<i class="fa-solid fa-pause" aria-hidden="true"></i>';
      playBtn.setAttribute('aria-label', 'Pausar galería automática');
      resetProgressBar();
    }

    // Hover/focus en la sección feature
    if (article) {
      article.addEventListener('mouseenter', () => { if (!isPaused) { isPaused = true; pauseProgressBar(); } });
      article.addEventListener('mouseleave', () => {
        if (isPaused && !playBtn.dataset.manualPause) resumeAutoplay();
      });
      article.addEventListener('focusin', () => { if (!isPaused) { isPaused = true; pauseProgressBar(); } });
      article.addEventListener('focusout', () => {
        requestAnimationFrame(() => {
          if (!article.contains(document.activeElement)) {
            if (!playBtn.dataset.manualPause) resumeAutoplay();
          }
        });
      });
    }

    // Toggle manual
    playBtn.addEventListener('click', () => {
      if (isPaused) {
        delete playBtn.dataset.manualPause;
        clearTimeout(resumeTimer);
        resumeAutoplay();
      } else {
        playBtn.dataset.manualPause = '1';
        clearTimeout(resumeTimer);
        pauseAutoplay(false);
      }
    });

    // Pins del mapa (pausa manual + reanuda en 10 s)
    pins.forEach(pin => {
      pin.addEventListener('click', () => {
        const destId = pin.dataset.destination;
        if (!destId) return;
        clearTimeout(resumeTimer);
        render(destId, false);
        pauseAutoplay(true);
      });
    });

    // Filtros temáticos
    filters.forEach(filter => {
      filter.addEventListener('click', () => {
        const cat = filter.dataset.inspireFilter;
        filters.forEach(btn => {
          const active = btn === filter;
          btn.classList.toggle('is-active', active);
          btn.setAttribute('aria-pressed', String(active));
        });
        const match = Object.entries(data).find(([, item]) =>
          Array.isArray(item.categories) && item.categories.includes(cat)
        );
        if (match) { render(match[0], false); pauseAutoplay(true); }
      });
    });

    // Polaroids
    polaroidItems.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        const current = data[currentDestinationId] || defaultDestinations.ometepe;
        const gal = current.gallery || [];
        const url = gal[index] || current.image;
        polaroidItems.forEach((el, i) => el.classList.toggle('is-active', i === index));
        currentGalleryIndex = index;
        updateHeroImage(url, `${current.title} — vista ${index + 1}`);
      });
    });

    // Botón siguiente galería
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        const current = data[currentDestinationId] || defaultDestinations.ometepe;
        const gal = current.gallery || [];
        if (!gal.length) return;
        currentGalleryIndex = (currentGalleryIndex + 1) % Math.min(gal.length, polaroidItems.length);
        const url = gal[currentGalleryIndex] || current.image;
        polaroidItems.forEach((el, i) => el.classList.toggle('is-active', i === currentGalleryIndex));
        updateHeroImage(url, `${current.title} — vista ${currentGalleryIndex + 1}`);
      });
    }

    // API Pública
    window.BaqueanoDestinations = Object.freeze({
      show:    (id) => { render(id, false); pauseAutoplay(true); },
      get:     id => data[id] || null,
      getAll:  () => ({ ...data }),
      pause:   () => pauseAutoplay(false),
      resume:  resumeAutoplay
    });

    // Iniciar
    render('ometepe', false);

    // Construir conectores Bézier geográficos después del primer paint
    // (necesitamos las dimensiones reales del DOM para calcular px → %)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        buildConnectors();
        updateGeoMap('ometepe');
      });
    });

    // Reconstruir conectores al redimensionar el viewport
    if (typeof ResizeObserver !== 'undefined' && mapRoot) {
      const ro = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          buildConnectors();
          updateGeoMap(currentDestinationId);
        });
      });
      ro.observe(mapRoot);
    }

    setTimeout(startAutoplay, 1200);
  });
}());
