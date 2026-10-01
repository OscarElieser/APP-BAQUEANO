/**
 * ============================================================================
 * 🧭 BAQUEANO ECOSYSTEM — index-destinos-editorial.js
 * ============================================================================
 *
 * 🎯 1. POR QUÉ (WHY / PROPÓSITO):
 * - Interacción editorial de destinos inspiradores en la portada.
 * - Permite explorar identidades territoriales sin abandonar la portada.
 *
 * ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
 * - Un catálogo local sincroniza filtros, puntos, relato e imágenes.
 * - Escucha clicks en pins del mapa y filtros de categoría.
 *
 * 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
 * - Selección de destino, filtrado temático y actualización accesible del DOM.
 * ============================================================================
 */
(function () {
  'use strict';

  const data = {
    ometepe: {
      title: 'Isla de Ometepe',
      location: 'Rivas · Lago Cocibolca',
      description: 'Naturaleza, cultura y comunidades que te conectan con la esencia de Nicaragua.',
      image: 'assets/images/destinos/isla_de_ometepe.jpg',
      gallery: [
        'assets/images/destinos/isla_de_ometepe.jpg',
        'assets/images/destinos/cascada_la_luna.jpg',
        'assets/images/destinos/Finca Magdalena Eco-Lodge Campesino.jpg'
      ],
      traits: [
        ['fa-volcano', 'Volcanes'],
        ['fa-person-hiking', 'Senderismo'],
        ['fa-landmark', 'Cultura'],
        ['fa-people-group', 'Comunidades']
      ],
      categories: ['todos', 'naturaleza', 'volcanes', 'cultura', 'comunidades'],
      href: 'destinos.html?id=ometepe'
    },
    somoto: {
      title: 'Cañón de Somoto',
      location: 'Madriz · Somoto',
      description: 'Agua, roca milenaria y guías comunitarios en uno de los paisajes más antiguos del país.',
      image: 'assets/images/destinos/canon_de_somoto.jpg',
      gallery: [
        'assets/images/destinos/canon_de_somoto.jpg',
        'assets/images/madriz/canon_somoto_interior.png',
        'assets/images/madriz/canon_somoto_bote.png'
      ],
      traits: [
        ['fa-water', 'Río'],
        ['fa-person-hiking', 'Aventura'],
        ['fa-people-group', 'Guías locales']
      ],
      categories: ['todos', 'naturaleza', 'comunidades'],
      href: 'destinos.html?id=somoto'
    },
    leon: {
      title: 'León',
      location: 'León · Occidente',
      description: 'Arte, memoria y arquitectura viva entre calles coloniales y el paisaje volcánico de occidente.',
      image: 'assets/images/departamentos/leon.png',
      gallery: [
        'assets/images/departamentos/leon.png',
        'assets/images/departamentos/leon2.jfif',
        'assets/images/departamentos/leon4.jfif'
      ],
      traits: [
        ['fa-landmark', 'Patrimonio'],
        ['fa-palette', 'Arte'],
        ['fa-music', 'Tradición']
      ],
      categories: ['todos', 'cultura', 'comunidades'],
      href: 'destinos.html?id=leon'
    },
    granada: {
      title: 'Granada',
      location: 'Granada · Lago Cocibolca',
      description: 'Ciudad de colores, oficios y sabores que abre la ruta hacia isletas, volcanes y comunidades.',
      image: 'assets/images/departamentos/granada.jpg',
      gallery: [
        'assets/images/departamentos/granada.jpg',
        'assets/images/destinos/isletas_de_granada.jpg',
        'assets/images/destinos/Casa Señorial Colonial Granada.jpg'
      ],
      traits: [
        ['fa-landmark', 'Cultura'],
        ['fa-utensils', 'Gastronomía'],
        ['fa-water', 'Isletas']
      ],
      categories: ['todos', 'cultura', 'gastronomia'],
      href: 'destinos.html?id=granada'
    },
    'cerro-negro': {
      title: 'Cerro Negro',
      location: 'León · Cordillera de los Maribios',
      description: 'Arena volcánica, horizonte abierto y aventura responsable guiada por conocedores del territorio.',
      image: 'assets/images/destinos/cerro_negro.jpg',
      gallery: [
        'assets/images/destinos/cerro_negro.jpg',
        'assets/images/departamentos/leon7.jfif',
        'assets/images/departamentos/leon9.jfif'
      ],
      traits: [
        ['fa-volcano', 'Volcán'],
        ['fa-person-hiking', 'Aventura'],
        ['fa-compass', 'Exploración']
      ],
      categories: ['todos', 'naturaleza', 'volcanes'],
      href: 'destinos.html?id=cerro_negro'
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const root = document.querySelector('[data-inspire-root]');
    if (!root) return;

    const pins = [...root.querySelectorAll('[data-destination]')];
    const filters = [...root.querySelectorAll('[data-inspire-filter]')];

    function render(id) {
      const item = data[id];
      if (!item) return;

      const hero = root.querySelector('[data-inspire-image]');
      hero.src = item.image;
      hero.alt = `Paisaje de ${item.title}`;

      root.querySelector('[data-inspire-title]').textContent = item.title;
      root.querySelector('[data-inspire-location]').textContent = item.location;
      root.querySelector('[data-inspire-description]').textContent = item.description;
      root.querySelector('[data-inspire-link]').href = item.href;

      root.querySelector('[data-inspire-traits]').innerHTML = item.traits
        .map(([icon, label]) => `<span><i class="fa-solid ${icon}" aria-hidden="true"></i>${label}</span>`)
        .join('');

      root.querySelectorAll('[data-inspire-gallery]').forEach((img, index) => {
        img.src = item.gallery[index] || item.image;
        img.alt = `${item.title}, vista ${index + 1}`;
      });

      pins.forEach(pin => {
        const active = pin.dataset.destination === id;
        pin.classList.toggle('is-active', active);
        pin.setAttribute('aria-pressed', String(active));
      });
    }

    pins.forEach(pin => pin.addEventListener('click', () => render(pin.dataset.destination)));

    filters.forEach(filter => filter.addEventListener('click', () => {
      const category = filter.dataset.inspireFilter;
      filters.forEach(button => {
        const active = button === filter;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      const match = Object.entries(data).find(([, item]) => item.categories.includes(category));
      if (match) render(match[0]);
    }));

    render('ometepe');
  });
}());
