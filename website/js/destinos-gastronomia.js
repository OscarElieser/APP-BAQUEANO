// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — GESTOR DE GASTRONOMÍA, FAVORITOS Y RUTAS (destinos-gastronomia.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia de alta fidelidad en el catálogo de destinos y gastronomía
//   incorporando información real y transparente: nombre del local y propietario/cocinera,
//   dirección territorial exacta, teléfono directo, precios reales en Córdobas (C$) y Dólares ($),
//   ruta de cómo llegar en mapa satelital y enlace directo a WhatsApp sin intermediarios.
// - Permitir a los exploradores dar "Me Gusta" (❤️) y "Guardar en Favoritos" (⭐)
//   con persistencia en almacenamiento local (localStorage) y filtrado instantáneo.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Gestión reactiva de estado con localStorage para 'baqueano_fav_places' y 'baqueano_liked_places'.
// - Event delegation para interactividad inmediata a 60fps sin sobrecarga de memoria.
// - Integración bidireccional con Leaflet Map (`window.BaqueanoMap.flyToPlace()`) y Google Maps GPS.
// - Formateo bimoneda dinámico y generador de enlaces de WhatsApp personalizados.
//
// 📦 3. QUÉ (WHAT / FUNCIONES Y MÓDULOS EXPUESTOS):
// - initDestinosFeatures(): Inicializa likes, favoritos, filtros y manejadores de ruta/WhatsApp.
// - toggleFavorite(placeId): Añade/elimina de favoritos y actualiza la UI.
// - toggleLike(placeId): Incrementa/decrementa likes y anima el corazón.
// - openRouteInMap(lat, lng, name): Desplaza y enfoca el mapa interactivo o abre GPS nativo.
// ============================================================================

(function () {
  'use strict';

  const STORAGE_KEY_FAVS = 'baqueano_fav_places_v1';
  const STORAGE_KEY_LIKES = 'baqueano_liked_places_v1';
  const STORAGE_KEY_LIKE_COUNTS = 'baqueano_like_counts_v1';

  // Obtener lista de favoritos
  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_FAVS) || '[]');
    } catch (e) {
      return [];
    }
  }

  // Guardar lista de favoritos
  function saveFavorites(favs) {
    try {
      localStorage.setItem(STORAGE_KEY_FAVS, JSON.stringify(favs));
    } catch (e) {}
  }

  // Obtener lugares a los que el usuario dio like
  function getUserLikes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_LIKES) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveUserLikes(likes) {
    try {
      localStorage.setItem(STORAGE_KEY_LIKES, JSON.stringify(likes));
    } catch (e) {}
  }

  // Contador global de likes simulado persistente
  function getLikeCounts() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_LIKE_COUNTS) || '{}');
    } catch (e) {
      return {};
    }
  }

  function saveLikeCounts(counts) {
    try {
      localStorage.setItem(STORAGE_KEY_LIKE_COUNTS, JSON.stringify(counts));
    } catch (e) {}
  }

  // Alternar favorito
  function toggleFavorite(placeId, buttonEl) {
    let favs = getFavorites();
    const index = favs.indexOf(placeId);
    const isAdding = (index === -1);

    if (isAdding) {
      favs.push(placeId);
    } else {
      favs.splice(index, 1);
    }

    saveFavorites(favs);
    updateFavoriteButtonsUI();
    updateFavoriteBadgeCount();

    // Si estamos en la vista de favoritos, refrescar visibilidad
    const activeFilterBtn = document.querySelector('.cat-filter-btn.active');
    if (activeFilterBtn && activeFilterBtn.dataset.filter === 'favoritos') {
      applyCategoryFilter('favoritos');
    }

    // Feedback sonoro/háptico visual
    if (buttonEl) {
      buttonEl.classList.toggle('active', isAdding);
      buttonEl.innerHTML = `<i class="fa-${isAdding ? 'solid' : 'regular'} fa-bookmark"></i>`;
      buttonEl.title = isAdding ? 'Quitar de mis favoritos' : 'Guardar en mis favoritos';
      buttonEl.setAttribute('aria-label', isAdding ? 'Quitar de mis favoritos' : 'Guardar en mis favoritos');
    }
  }

  // Alternar Like
  function toggleLike(placeId, buttonEl) {
    let userLikes = getUserLikes();
    let likeCounts = getLikeCounts();
    const index = userLikes.indexOf(placeId);
    const isLiking = (index === -1);

    let currentCount = likeCounts[placeId] || parseInt(buttonEl?.getAttribute('data-initial-likes') || '24', 10);

    if (isLiking) {
      userLikes.push(placeId);
      currentCount += 1;
    } else {
      userLikes.splice(index, 1);
      currentCount = Math.max(0, currentCount - 1);
    }

    likeCounts[placeId] = currentCount;
    saveUserLikes(userLikes);
    saveLikeCounts(likeCounts);

    updateLikeButtonsUI();
  }

  // Actualizar UI de botones de favoritos
  function updateFavoriteButtonsUI() {
    const favs = getFavorites();
    document.querySelectorAll('.btn-action-fav').forEach(btn => {
      const placeId = btn.getAttribute('data-id');
      const isFav = favs.includes(placeId);
      btn.classList.toggle('active', isFav);
      btn.innerHTML = `<i class="fa-${isFav ? 'solid' : 'regular'} fa-bookmark"></i>`;
      btn.title = isFav ? 'Quitar de mis favoritos' : 'Guardar en mis favoritos';
      btn.setAttribute('aria-label', isFav ? 'Quitar de mis favoritos' : 'Guardar en mis favoritos');
    });
  }

  // Actualizar UI de botones de likes
  function updateLikeButtonsUI() {
    const userLikes = getUserLikes();
    const likeCounts = getLikeCounts();

    document.querySelectorAll('.btn-action-like').forEach(btn => {
      const placeId = btn.getAttribute('data-id');
      const isLiked = userLikes.includes(placeId);
      const initialLikes = parseInt(btn.getAttribute('data-initial-likes') || '24', 10);
      const count = likeCounts[placeId] !== undefined ? likeCounts[placeId] : initialLikes;

      btn.classList.toggle('active', isLiked);
      btn.innerHTML = `<i class="fa-${isLiked ? 'solid' : 'regular'} fa-heart"></i><span class="like-number">${count}</span>`;
      btn.title = isLiked ? 'Ya te gusta este lugar' : 'Me gusta este lugar';
      btn.setAttribute('aria-label', `${count} personas les gusta este lugar`);
    });
  }

  // Actualizar badge de conteo en la píldora de favoritos
  function updateFavoriteBadgeCount() {
    const favs = getFavorites();
    const badge = document.getElementById('favCountBadge');
    if (badge) {
      badge.textContent = favs.length;
      badge.style.display = favs.length > 0 ? 'inline-block' : 'none';
    }
  }

  // Desplazamiento y centrado en el mapa satelital interactivo
  function routeToMap(lat, lng, name, placeId) {
    // Si tenemos el módulo BaqueanoMap activo, volar suavemente
    if (window.BaqueanoMap && typeof window.BaqueanoMap.flyToPlace === 'function' && placeId) {
      window.BaqueanoMap.flyToPlace(placeId);
      return;
    }

    const mapEl = document.getElementById('baqueanoInteractiveMap');
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Fallback abrir navegación directa en Google Maps GPS
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  // Mapeo de Macro-Categorías con sus Subcategorías
  const MACRO_GROUPS = {
    'naturaleza-all': ['playas', 'bahias', 'rios', 'volcanes', 'selva', 'islas'],
    'estadias-all': ['hoteles', 'hostales', 'hospedajes', 'casas-alquiler'],
    'cultura-all': ['gastronomia', 'museos', 'discotecas']
  };

  const SUB_TO_MACRO = {
    'playas': 'naturaleza', 'bahias': 'naturaleza', 'rios': 'naturaleza', 'volcanes': 'naturaleza', 'selva': 'naturaleza', 'islas': 'naturaleza', 'naturaleza-all': 'naturaleza',
    'hoteles': 'estadias', 'hostales': 'estadias', 'hospedajes': 'estadias', 'casas-alquiler': 'estadias', 'estadias-all': 'estadias',
    'gastronomia': 'cultura', 'museos': 'cultura', 'discotecas': 'cultura', 'cultura-all': 'cultura'
  };

  const MACRO_INFO = {
    'naturaleza': {
      label: 'Naturaleza & Aventura',
      icon: 'fa-mountain-sun',
      btnId: 'macroBtnNaturaleza',
      allKey: 'naturaleza-all'
    },
    'estadias': {
      label: 'Hospedajes & Estadías',
      icon: 'fa-house-chimney-window',
      btnId: 'macroBtnEstadias',
      allKey: 'estadias-all'
    },
    'cultura': {
      label: 'Cultura, Sabor & Vida',
      icon: 'fa-utensils',
      btnId: 'macroBtnCultura',
      allKey: 'cultura-all'
    }
  };

  // Nombres humanizados para el indicador de filtro activo
  const FILTER_NAMES = {
    'all': 'Todos los Destinos',
    'favoritos': 'Mis Favoritos',
    'naturaleza-all': 'Toda la Naturaleza & Aventura',
    'playas': 'Playas del Pacífico',
    'bahias': 'Bahías & Puertos',
    'rios': 'Ríos, Cascadas & Cañones',
    'volcanes': 'Volcanes & Senderos',
    'selva': 'Reservas & Selva',
    'islas': 'Islas & Archipiélagos',
    'estadias-all': 'Todos los Hospedajes',
    'hoteles': 'Hoteles & Resorts',
    'hostales': 'Hostales & Lodges',
    'hospedajes': 'Cabañas & Posadas',
    'casas-alquiler': 'Casas de Alquiler',
    'cultura-all': 'Toda la Cultura & Vida',
    'gastronomia': 'Gastronomía Ancestral',
    'museos': 'Museos & Memoria',
    'discotecas': 'Bares & Vida Nocturna'
  };

  // Variable de estado para controlar qué submenú está visible
  let currentOpenMacro = null;
  let currentActiveFilter = 'all';

  // Esconde el submenú automáticamente con animación limpia
  function hideSubmenu() {
    const stripEl = document.getElementById('activeSubmenuStrip');
    if (stripEl) {
      stripEl.style.display = 'none';
    }
    document.querySelectorAll('.macro-nav-btn.has-sub').forEach(btn => {
      btn.setAttribute('aria-expanded', 'false');
    });
    currentOpenMacro = null;
  }

  // Abre y renderiza el submenú de una macro-categoría
  function openSubmenuFor(macroKey, activeFilterKey) {
    const stripEl = document.getElementById('activeSubmenuStrip');
    const containerEl = document.getElementById('stripButtonsContainer');
    const labelEl = document.getElementById('stripLabelTag');

    if (!stripEl || !containerEl || !labelEl) return;

    if (!macroKey || macroKey === 'all' || macroKey === 'favoritos') {
      hideSubmenu();
      return;
    }

    const dropdownWrap = document.querySelector(`.macro-dropdown-wrapper[data-dropdown="${macroKey}"]`);
    if (!dropdownWrap) return;

    const sourceButtons = dropdownWrap.querySelectorAll('.sub-cat-btn');
    if (!sourceButtons.length) return;

    const info = MACRO_INFO[macroKey] || { label: 'Subcategorías', icon: 'fa-filter' };
    labelEl.innerHTML = `<i class="fa-solid ${info.icon}"></i> ${info.label}:`;

    // Replicar botones en el panel
    containerEl.innerHTML = '';
    sourceButtons.forEach(btn => {
      const clone = document.createElement('button');
      clone.type = 'button';
      clone.className = 'cat-filter-btn sub-cat-btn';
      clone.setAttribute('data-filter', btn.getAttribute('data-filter'));
      clone.setAttribute('data-macro-parent', macroKey);
      clone.innerHTML = btn.innerHTML;
      if (btn.getAttribute('data-filter') === activeFilterKey) {
        clone.classList.add('active');
      }
      containerEl.appendChild(clone);
    });

    stripEl.style.display = 'flex';
    currentOpenMacro = macroKey;

    // Actualizar aria-expanded en los botones
    document.querySelectorAll('.macro-nav-btn.has-sub').forEach(btn => {
      btn.setAttribute('aria-expanded', btn.dataset.macro === macroKey ? 'true' : 'false');
    });
  }

  // Aplicar filtro de categorías y favoritos con auto-ocultamiento del submenú
  function applyCategoryFilter(filterKey, autoHideSubmenu = true) {
    currentActiveFilter = filterKey;
    const cards = document.querySelectorAll('.dest-card-pro');
    const favs = getFavorites();
    let visibleCount = 0;

    cards.forEach(card => {
      const cardCategory = card.getAttribute('data-category') || '';
      const cardId = card.getAttribute('data-id') || '';

      let show = false;
      if (filterKey === 'all') {
        show = true;
      } else if (filterKey === 'favoritos') {
        show = favs.includes(cardId);
      } else if (MACRO_GROUPS[filterKey]) {
        show = MACRO_GROUPS[filterKey].includes(cardCategory);
      } else {
        show = (cardCategory === filterKey);
      }

      card.style.display = show ? 'flex' : 'none';
      if (show) visibleCount++;
    });

    // Determinar la macro-categoría correspondiente
    let currentMacro = null;
    if (filterKey === 'all') currentMacro = 'all';
    else if (filterKey === 'favoritos') currentMacro = 'favoritos';
    else currentMacro = SUB_TO_MACRO[filterKey] || null;

    // Actualizar botones de macro nivel
    document.querySelectorAll('.macro-nav-btn').forEach(btn => {
      const isAll = (filterKey === 'all' && btn.id === 'macroBtnAll');
      const isFav = (filterKey === 'favoritos' && btn.id === 'filterFavsBtn');
      const isMacro = (currentMacro && btn.dataset.macro === currentMacro);
      btn.classList.toggle('active', isAll || isFav || isMacro);
    });

    // Actualizar píldoras y sub-botones activos
    document.querySelectorAll('.cat-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-filter') === filterKey);
    });

    // Actualizar o esconder el indicador de filtro activo
    const indicatorEl = document.getElementById('activeFilterIndicator');
    const indicatorNameEl = document.getElementById('activeFilterName');
    const indicatorCountEl = document.getElementById('activeFilterCount');

    if (indicatorEl && indicatorNameEl && indicatorCountEl) {
      if (filterKey === 'all') {
        indicatorEl.style.display = 'none';
      } else {
        indicatorNameEl.textContent = FILTER_NAMES[filterKey] || filterKey;
        indicatorCountEl.textContent = `(${visibleCount})`;
        indicatorEl.style.display = 'inline-flex';
      }
    }

    // SI autoHideSubmenu es true, esconder el submenú para no estancarse en pantalla
    if (autoHideSubmenu) {
      hideSubmenu();
    }

    // Notificar al mapa interactivo para filtrar pines
    if (window.BaqueanoMap && typeof window.BaqueanoMap.filterCategory === 'function') {
      window.BaqueanoMap.filterCategory(filterKey === 'favoritos' ? 'all' : filterKey);
    }
  }

  // Inicialización de escuchadores de eventos
  function initDestinosFeatures() {
    updateFavoriteButtonsUI();
    updateLikeButtonsUI();
    updateFavoriteBadgeCount();

    // Event Delegation para likes, favoritos, macro dropdowns y filtros
    document.addEventListener('click', function (e) {
      // 1. Click en botón macro con submenú (toggle de apertura/cierre)
      const macroToggleBtn = e.target.closest('.macro-nav-btn.has-sub');
      if (macroToggleBtn) {
        e.preventDefault();
        e.stopPropagation();
        const macroKey = macroToggleBtn.dataset.macro;
        if (currentOpenMacro === macroKey) {
          // Ya estaba abierto -> alternar y cerrarlo
          hideSubmenu();
        } else {
          // Abrir para seleccionar subcategoría
          openSubmenuFor(macroKey, currentActiveFilter);
        }
        return;
      }

      // 2. Botón de cerrar submenú manualmente (✕)
      const closeSubBtn = e.target.closest('#closeSubmenuBtn');
      if (closeSubBtn) {
        e.preventDefault();
        e.stopPropagation();
        hideSubmenu();
        return;
      }

      // 3. Botón de quitar filtro activo
      const clearFilterBtn = e.target.closest('#clearActiveFilterBtn');
      if (clearFilterBtn) {
        e.preventDefault();
        e.stopPropagation();
        applyCategoryFilter('all', true);
        return;
      }

      // 4. Cerrar submenú al hacer click fuera del área de navegación de categorías
      if (currentOpenMacro && !e.target.closest('.dest-category-nav-suite')) {
        hideSubmenu();
      }

      // 5. Favoritos
      const favBtn = e.target.closest('.btn-action-fav');
      if (favBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = favBtn.getAttribute('data-id');
        if (id) toggleFavorite(id, favBtn);
        return;
      }

      // 6. Likes
      const likeBtn = e.target.closest('.btn-action-like');
      if (likeBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = likeBtn.getAttribute('data-id');
        if (id) toggleLike(id, likeBtn);
        return;
      }

      // 7. Rutas y GPS
      const routeBtn = e.target.closest('.btn-action-route');
      if (routeBtn) {
        e.preventDefault();
        e.stopPropagation();
        const lat = parseFloat(routeBtn.getAttribute('data-lat') || '12.8654');
        const lng = parseFloat(routeBtn.getAttribute('data-lng') || '-85.2072');
        const name = routeBtn.getAttribute('data-name') || 'Destino';
        const placeId = routeBtn.getAttribute('data-id') || '';
        routeToMap(lat, lng, name, placeId);
        return;
      }

      // 8. Botones de filtro de categorías (Macro, Submenú o Strip)
      const catBtn = e.target.closest('.cat-filter-btn');
      if (catBtn) {
        const filter = catBtn.getAttribute('data-filter') || 'all';
        // Al seleccionar cualquier subcategoría o categoría, se esconde automáticamente el submenú
        applyCategoryFilter(filter, true);
        return;
      }
    });

    // Buscador instantáneo de destinos y gastronomía
    const searchInput = document.getElementById('destSearchInput');
    const clearBtn = document.getElementById('destSearchClearBtn');

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        const query = this.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.dest-card-pro');

        cards.forEach(card => {
          const text = card.textContent.toLowerCase();
          card.style.display = (!query || text.includes(query)) ? 'flex' : 'none';
        });
      });
    }

    if (clearBtn && searchInput) {
      clearBtn.addEventListener('click', function () {
        searchInput.value = '';
        document.querySelectorAll('.dest-card-pro').forEach(card => card.style.display = 'flex');
      });
    }
  }

  // Exponer API global
  window.BaqueanoDestinos = {
    init: initDestinosFeatures,
    toggleFav: toggleFavorite,
    toggleLike: toggleLike,
    routeTo: routeToMap,
    filter: applyCategoryFilter
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDestinosFeatures);
  } else {
    initDestinosFeatures();
  }

})();
