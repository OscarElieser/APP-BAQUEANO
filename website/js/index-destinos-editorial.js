/**
 * ============================================================================
 * 🧭 BAQUEANO ECOSYSTEM — index-destinos-editorial.js
 * ============================================================================
 *
 * 🎯 1. POR QUÉ (WHY / PROPÓSITO):
 * - Orquestar la experiencia interactiva, inmersiva y editorial de la sección
 *   “Destinos que Inspiran” en la portada web de BAQUEANO.
 * - Conectar el relato territorial, los filtros temáticos, los puntos sobre el
 *   mapa de relieve y la mini-galería fotográfica en un flujo reactivo unificado,
 *   erradicando cualquier comportamiento rígido de marketplace.
 *
 * ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
 * - Arquitectura de datos desacoplada y tipada para cada destino: título, ubicación,
 *   relato, imagen principal, galería de 4 polaroids, atributos circulares coloreados
 *   y categorías temáticas.
 * - Soporte nativo para consumir datos desde Supabase mediante window.BAQUEANO_DESTINATIONS.
 * - Manipulación defensiva del DOM con DocumentFragment y replaceChildren para
 *   máxima eficiencia sin fugas de memoria ni riesgos de inyección de script.
 * - Transición fotográfica suave mediante la clase .is-changing y eventos load/error.
 * - Interacción bidireccional: al pulsar un pin del mapa, un filtro o una miniatura
 *   polaroid, el estado se sincroniza de forma instantánea y accesible (ARIA).
 *
 * 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
 * - Catálogo maestro de 5 destinos icónicos (Ometepe, Somoto, León, Granada, Cerro Negro).
 * - API pública global window.BaqueanoDestinations.show(id) y .get(id).
 * - Ciclo de mini-galería mediante botón de avance rápido.
 * ============================================================================
 */

(function () {
  'use strict';

  // Catálogo maestro local con datos reales y verificados de Nicaragua
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
        { icon: 'fa-volcano', label: 'Volcanes', color: '#2D7A4F' },
        { icon: 'fa-person-hiking', label: 'Senderismo', color: '#4A6D8C' },
        { icon: 'fa-landmark', label: 'Cultura', color: '#D95328' },
        { icon: 'fa-utensils', label: 'Gastronomía', color: '#C97D1A' },
        { icon: 'fa-people-group', label: 'Comunidades', color: '#165D6F' }
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
        { icon: 'fa-water', label: 'Río & Cañón', color: '#2D7A4F' },
        { icon: 'fa-person-hiking', label: 'Aventura', color: '#4A6D8C' },
        { icon: 'fa-monument', label: 'Patrimonio', color: '#D95328' },
        { icon: 'fa-utensils', label: 'Rosquillas', color: '#C97D1A' },
        { icon: 'fa-people-group', label: 'Baqueanos', color: '#165D6F' }
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
        { icon: 'fa-landmark', label: 'Catedral UNESCO', color: '#2D7A4F' },
        { icon: 'fa-building-columns', label: 'Museos & Arte', color: '#4A6D8C' },
        { icon: 'fa-book-open', label: 'Rubén Darío', color: '#D95328' },
        { icon: 'fa-utensils', label: 'Quesillos', color: '#C97D1A' },
        { icon: 'fa-volcano', label: 'Cordillera', color: '#165D6F' }
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
        { icon: 'fa-landmark', label: 'Arquitectura', color: '#2D7A4F' },
        { icon: 'fa-water', label: '365 Isletas', color: '#4A6D8C' },
        { icon: 'fa-building-columns', label: 'Conventos', color: '#D95328' },
        { icon: 'fa-utensils', label: 'Vigorón', color: '#C97D1A' },
        { icon: 'fa-people-group', label: 'Cultura Viva', color: '#165D6F' }
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
        { icon: 'fa-volcano', label: 'Volcán Activo', color: '#2D7A4F' },
        { icon: 'fa-person-snowboarding', label: 'Sandboarding', color: '#4A6D8C' },
        { icon: 'fa-mountain-sun', label: 'Cráteres', color: '#D95328' },
        { icon: 'fa-compass', label: 'Geoturismo', color: '#C97D1A' },
        { icon: 'fa-people-group', label: 'Baqueanos', color: '#165D6F' }
      ],
      categories: ['todos', 'volcanes', 'naturaleza'],
      href: 'destinos.html?id=cerro_negro'
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const root = document.querySelector('[data-inspire-root]');
    if (!root) return;

    const pins = [...root.querySelectorAll('[data-destination]')];
    const filters = [...root.querySelectorAll('[data-inspire-filter]')];
    const heroImg = root.querySelector('[data-inspire-image]');
    const titleEl = root.querySelector('[data-inspire-title]');
    const locationEl = root.querySelector('[data-inspire-location]');
    const descEl = root.querySelector('[data-inspire-description]');
    const linkEl = root.querySelector('[data-inspire-link]');
    const traitsContainer = root.querySelector('[data-inspire-traits]');
    const polaroidItems = [...root.querySelectorAll('.polaroid-item')];
    const btnNext = root.querySelector('#btnNextGalleryItem');

    // Integración con datos externos de Supabase si están definidos
    const externalDestinations = window.BAQUEANO_DESTINATIONS;
    const data = externalDestinations && typeof externalDestinations === 'object'
      ? { ...defaultDestinations, ...externalDestinations }
      : defaultDestinations;

    let currentDestinationId = 'ometepe';
    let currentGalleryIndex = 0;

    /**
     * Actualiza la fotografía principal con animación y manejo defensivo
     */
    function updateHeroImage(url, altText) {
      if (!heroImg || !url) return;
      heroImg.classList.add('is-changing');
      
      const tempImg = new Image();
      tempImg.onload = () => {
        heroImg.src = url;
        heroImg.alt = altText || 'Destino turístico de Nicaragua';
        heroImg.classList.remove('is-changing');
      };
      tempImg.onerror = () => {
        heroImg.classList.remove('is-changing');
        console.warn('[BaqueanoDestinations] No fue posible cargar la imagen:', url);
      };
      tempImg.src = url;
    }

    /**
     * Renderiza un destino completo en la interfaz editorial
     */
    function render(id) {
      const source = data[id];
      if (!source || typeof source !== 'object') return;
      currentDestinationId = id;
      currentGalleryIndex = 0;

      const item = { ...(defaultDestinations[id] || {}), ...source };
      const mainImageUrl = item.image_url || item.image;

      // 1. Fotografía principal
      updateHeroImage(mainImageUrl, `Paisaje de ${item.title}`);

      // 2. Textos editoriales
      if (titleEl) titleEl.textContent = item.title;
      if (locationEl) locationEl.textContent = item.location;
      if (descEl) descEl.textContent = item.description;
      if (linkEl) linkEl.href = item.href || 'destinos.html';

      // 3. Indicadores circulares temáticos de experiencia
      if (traitsContainer) {
        const traits = Array.isArray(item.traits) ? item.traits : [];
        const fragment = document.createDocumentFragment();

        traits.forEach(traitData => {
          const badge = document.createElement('div');
          badge.className = 'trait-badge-item';

          const circle = document.createElement('div');
          circle.className = 'trait-circle-icon';
          circle.style.backgroundColor = traitData.color || '#165D6F';

          const icon = document.createElement('i');
          const safeIcon = /^fa-[a-z0-9-]+$/i.test(String(traitData.icon || '')) ? traitData.icon : 'fa-compass';
          icon.className = `fa-solid ${safeIcon}`;
          icon.setAttribute('aria-hidden', 'true');
          circle.appendChild(icon);

          const label = document.createElement('span');
          label.className = 'trait-label-text';
          label.textContent = String(traitData.label || '');

          badge.append(circle, label);
          fragment.appendChild(badge);
        });

        traitsContainer.replaceChildren(fragment);
      }

      // 4. Mini galería de polaroids
      const gallery = Array.isArray(item.gallery) && item.gallery.length > 0 ? item.gallery : [mainImageUrl];
      polaroidItems.forEach((btn, index) => {
        const photoUrl = gallery[index] || gallery[0] || mainImageUrl;
        const img = btn.querySelector('img');
        if (img) {
          img.src = photoUrl;
          img.alt = `${item.title} — foto ${index + 1}`;
        }
        btn.classList.toggle('is-active', index === 0);
      });

      // 5. Estado activo en pines del mapa
      pins.forEach(pin => {
        const isActive = pin.dataset.destination === id;
        pin.classList.toggle('is-active', isActive);
        pin.setAttribute('aria-pressed', String(isActive));
      });
    }

    // Interacción al pulsar un pin del mapa
    pins.forEach(pin => {
      pin.addEventListener('click', () => {
        const destId = pin.dataset.destination;
        if (destId) render(destId);
      });
    });

    // Interacción al pulsar un filtro temático
    filters.forEach(filter => {
      filter.addEventListener('click', () => {
        const category = filter.dataset.inspireFilter;
        filters.forEach(btn => {
          const isActive = btn === filter;
          btn.classList.toggle('is-active', isActive);
          btn.setAttribute('aria-pressed', String(isActive));
        });

        // Buscar el primer destino coincidente con la categoría
        const match = Object.entries(data).find(([, item]) =>
          Array.isArray(item.categories) && item.categories.includes(category)
        );
        if (match) render(match[0]);
      });
    });

    // Interacción al pulsar una polaroid de la mini-galería
    polaroidItems.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        const currentData = data[currentDestinationId] || defaultDestinations.ometepe;
        const gallery = currentData.gallery || [];
        const photoUrl = gallery[index] || currentData.image;

        polaroidItems.forEach((item, i) => item.classList.toggle('is-active', i === index));
        currentGalleryIndex = index;
        updateHeroImage(photoUrl, `${currentData.title} — vista ${index + 1}`);
      });
    });

    // Interacción con botón siguiente de la mini-galería
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        const currentData = data[currentDestinationId] || defaultDestinations.ometepe;
        const gallery = currentData.gallery || [];
        if (!gallery.length) return;

        currentGalleryIndex = (currentGalleryIndex + 1) % Math.min(gallery.length, polaroidItems.length);
        const photoUrl = gallery[currentGalleryIndex] || currentData.image;

        polaroidItems.forEach((item, i) => item.classList.toggle('is-active', i === currentGalleryIndex));
        updateHeroImage(photoUrl, `${currentData.title} — vista ${currentGalleryIndex + 1}`);
      });
    }

    // API Pública Global de Destinos BAQUEANO
    window.BaqueanoDestinations = Object.freeze({
      show: render,
      get: id => data[id] || null,
      getAll: () => ({ ...data })
    });

    // Inicializar con Isla de Ometepe como destino destacado predeterminado
    render('ometepe');
  });
}());
