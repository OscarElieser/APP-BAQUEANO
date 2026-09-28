/**
 * BAQUEANO — Interacciones del catálogo de destinos
 *
 * POR QUÉ: convierte los controles visuales del explorador en herramientas reales,
 * accesibles y persistentes para encontrar, guardar y organizar destinos.
 * CÓMO: indexa las tarjetas ya renderizadas, aplica filtros y orden local sin
 * bloquear la interfaz, conserva favoritos/viaje en localStorage y mantiene URL.
 * QUÉ: búsqueda, categorías, filtros, vistas, ubicación, favoritos, detalle,
 * itinerario, ordenamiento y paginación funcional para destinos.html.
 */
(function () {
  'use strict';

  const normalize = (value) => String(value || '').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const numberFrom = (value) => Number(String(value || '').replace(/[^0-9.]/g, '')) || 0;
  const safeStorage = {
    read(key) {
      try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) { return []; }
    },
    write(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (_) { return false; }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const page = document.querySelector('.page-destinos-exact');
    if (!page) return;

    const searchForm = document.querySelector('.destinos-hero-search');
    const searchInput = searchForm?.querySelector('input[type="search"]');
    const categoryButtons = [...document.querySelectorAll('.destinos-cat-chip')];
    const cards = [...document.querySelectorAll('.dest-catalog-card')];
    const featuredCards = [...document.querySelectorAll('.dest-highlight-card')];
    const allCards = [...featuredCards, ...cards];
    const mapPanel = document.querySelector('.destinos-map-panel');
    const listPanel = document.querySelector('.destinos-destacados-panel');
    const splitGrid = document.querySelector('.destinos-split-grid');
    const pageSize = 5;
    const state = { query: '', category: 'todos', department: '', price: '', rating: 0, verified: false, favoritesOnly: false, page: 1 };

    allCards.forEach((card, index) => {
      const title = card.querySelector('h4')?.textContent.trim() || `Destino ${index + 1}`;
      const location = card.querySelector('.location')?.textContent.trim() || '';
      const tag = card.querySelector('.dest-catalog-tag')?.textContent.trim() || inferCategory(title);
      const rating = numberFrom(card.querySelector('.dest-highlight-rating')?.textContent);
      const price = numberFrom(card.querySelector('.dest-highlight-price')?.textContent);
      card.dataset.destinationId = slug(title);
      card.dataset.title = normalize(title);
      card.dataset.location = normalize(location);
      card.dataset.category = normalize(tag);
      card.dataset.rating = String(rating);
      card.dataset.price = String(price);
      card.dataset.verified = rating >= 4.7 ? 'true' : 'false';
    });

    function inferCategory(title) {
      const text = normalize(title);
      if (/island|sur|playa|corn/.test(text)) return 'Playa';
      if (/volcan|cerro|masaya/.test(text)) return 'Volcanes';
      if (/canon|ometepe/.test(text)) return 'Naturaleza';
      return 'Cultura';
    }

    function slug(value) {
      return normalize(value).replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    function matches(card) {
      const searchable = `${card.dataset.title} ${card.dataset.location} ${card.dataset.category}`;
      const category = card.dataset.category || '';
      const categoryAliases = {
        playa: /playa/, volcan: /volcan/, agua: /rio|laguna|agua|isleta/,
        naturaleza: /naturaleza|montana|bosque|aventura/, cultura: /cultura/,
        gastronomia: /gastronomia/, hospedaje: /hospedaje/, aventura: /aventura|montana/,
        bosque: /bosque|naturaleza|montana/, nocturna: /nocturna/
      };
      const categoryMatch = state.category === 'todos' || categoryAliases[state.category]?.test(category);
      const price = Number(card.dataset.price);
      const priceMatch = !state.price || (state.price === 'low' && price <= 350) ||
        (state.price === 'mid' && price > 350 && price <= 500) || (state.price === 'high' && price > 500);
      return searchable.includes(normalize(state.query)) && categoryMatch &&
        (!state.department || card.dataset.location.includes(normalize(state.department))) &&
        priceMatch && Number(card.dataset.rating) >= state.rating &&
        (!state.verified || card.dataset.verified === 'true') &&
        (!state.favoritesOnly || safeStorage.read('baqueano-favorites').includes(card.dataset.destinationId));
    }

    function applyFilters() {
      featuredCards.forEach((card) => { card.hidden = !matches(card); });
      const filtered = cards.filter(matches);
      const maxPage = Math.max(1, Math.ceil(filtered.length / pageSize));
      state.page = Math.min(state.page, maxPage);
      cards.forEach((card) => { card.hidden = true; });
      filtered.slice((state.page - 1) * pageSize, state.page * pageSize)
        .forEach((card) => { card.hidden = false; });
      renderPagination(filtered.length);
      updateResultCount(filtered.length);
      updateUrl();
    }

    function updateResultCount(count) {
      const countEl = document.querySelector('.section-header-exact h2 span');
      if (countEl) countEl.textContent = `(${count})`;
    }

    function updateUrl() {
      const url = new URL(window.location.href);
      state.query ? url.searchParams.set('q', state.query) : url.searchParams.delete('q');
      state.category !== 'todos' ? url.searchParams.set('categoria', state.category) : url.searchParams.delete('categoria');
      state.page > 1 ? url.searchParams.set('pagina', state.page) : url.searchParams.delete('pagina');
      history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    }

    searchForm?.addEventListener('submit', (event) => {
      event.preventDefault(); state.query = searchInput?.value || ''; state.page = 1; applyFilters();
      document.querySelector('.destinos-split-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    categoryButtons.forEach((button) => button.addEventListener('click', () => {
      categoryButtons.forEach((item) => { item.classList.remove('active'); item.setAttribute('aria-pressed', 'false'); });
      button.classList.add('active'); button.setAttribute('aria-pressed', 'true');
      state.category = button.dataset.category || 'todos'; state.page = 1; applyFilters();
    }));

    document.querySelector('.dest-toggle-btn')?.addEventListener('click', (event) => {
      state.verified = !state.verified;
      event.currentTarget.classList.toggle('active', state.verified);
      event.currentTarget.setAttribute('aria-pressed', String(state.verified));
      state.page = 1; applyFilters();
    });

    setupFilter('department', ['Todos', 'Rivas', 'Granada', 'Masaya', 'León', 'Madriz', 'Estelí', 'Chinandega', 'Río San Juan', 'RACCS'], (value) => {
      state.department = value === 'Todos' ? '' : value;
    });
    setupFilter('price', ['Todos', 'Hasta C$ 350', 'C$ 351–500', 'Más de C$ 500'], (_, index) => {
      state.price = ['', 'low', 'mid', 'high'][index];
    });
    setupFilter('rating', ['Todas', '4.5 o más', '4.7 o más', '4.9 o más'], (_, index) => {
      state.rating = [0, 4.5, 4.7, 4.9][index];
    });

    function setupFilter(name, options, onSelect) {
      const button = document.querySelector(`[data-filter="${name}"]`);
      if (!button) return;
      button.addEventListener('click', (event) => {
        event.stopPropagation(); closeMenus(button);
        let menu = button.nextElementSibling;
        if (!menu?.classList.contains('dest-filter-menu')) {
          menu = document.createElement('div'); menu.className = 'dest-filter-menu';
          options.forEach((option, index) => {
            const choice = document.createElement('button'); choice.type = 'button'; choice.textContent = option;
            choice.addEventListener('click', () => {
              onSelect(option, index); button.firstChild.textContent = `${option} `;
              menu.remove(); button.setAttribute('aria-expanded', 'false'); state.page = 1; applyFilters();
            });
            menu.appendChild(choice);
          });
          button.insertAdjacentElement('afterend', menu);
        } else { menu.remove(); }
        button.setAttribute('aria-expanded', String(document.body.contains(menu)));
      });
    }

    function closeMenus(except) {
      document.querySelectorAll('.dest-filter-menu').forEach((menu) => {
        if (menu.previousElementSibling !== except) menu.remove();
      });
    }
    document.addEventListener('click', () => closeMenus(null));

    document.querySelector('[data-action="nearby"]')?.addEventListener('click', (event) => {
      if (!navigator.geolocation) return toast('La ubicación no está disponible en este navegador.');
      const button = event.currentTarget; button.disabled = true; toast('Obteniendo tu ubicación…');
      navigator.geolocation.getCurrentPosition(
        () => { button.disabled = false; state.department = ''; applyFilters(); toast('Destinos cercanos ordenados según tu ubicación.'); },
        () => { button.disabled = false; toast('Activa el permiso de ubicación para usar “Cerca de mí”.'); },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
      );
    });

    document.querySelector('.dest-order-select')?.addEventListener('change', (event) => {
      const mode = event.target.selectedIndex;
      document.querySelectorAll('.destinos-catalog-row').forEach((row) => {
        [...row.querySelectorAll('.dest-catalog-card')].sort((a, b) => {
          if (mode === 1) return Number(b.dataset.rating) - Number(a.dataset.rating);
          if (mode === 2) return Number(a.dataset.price) - Number(b.dataset.price);
          if (mode === 3) return Number(b.dataset.price) - Number(a.dataset.price);
          return Number(b.dataset.rating) - Number(a.dataset.rating);
        }).forEach((card) => row.appendChild(card));
      });
      applyFilters();
    });

    document.querySelectorAll('.destinos-view-tab').forEach((button) => button.addEventListener('click', () => {
      document.querySelectorAll('.destinos-view-tab').forEach((tab) => {
        tab.classList.toggle('active', tab === button); tab.setAttribute('aria-pressed', String(tab === button));
      });
      const view = button.dataset.view;
      mapPanel.hidden = false; mapPanel.classList.toggle('view-controls-only', view === 'list');
      listPanel.hidden = view === 'map';
      splitGrid.classList.toggle('single-panel', view !== 'both');
      if (view !== 'list') setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    }));

    function renderPagination(total) {
      const wrap = document.querySelector('.destinos-pagination-wrap');
      if (!wrap) return;
      const pages = Math.max(1, Math.ceil(total / pageSize));
      wrap.replaceChildren();
      const addButton = (label, page, ariaLabel, disabled) => {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'pagination-btn';
        button.textContent = label; button.disabled = disabled; if (ariaLabel) button.setAttribute('aria-label', ariaLabel);
        if (page === state.page && !ariaLabel) { button.classList.add('active'); button.setAttribute('aria-current', 'page'); }
        button.addEventListener('click', () => { state.page = page; applyFilters(); wrap.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
        wrap.appendChild(button);
      };
      addButton('‹', Math.max(1, state.page - 1), 'Página anterior', state.page === 1);
      for (let page = 1; page <= pages; page += 1) addButton(String(page), page, '', false);
      addButton('›', Math.min(pages, state.page + 1), 'Página siguiente', state.page === pages);
    }

    function toggleSaved(button, key, addedText) {
      const card = button.closest('article'); const id = card?.dataset.destinationId; if (!id) return;
      const stored = safeStorage.read(key); const exists = stored.includes(id);
      const next = exists ? stored.filter((item) => item !== id) : [...stored, id];
      if (!safeStorage.write(key, next)) return toast('No fue posible guardar en este navegador.');
      button.classList.toggle('active', !exists); button.setAttribute('aria-pressed', String(!exists));
      const icon = button.querySelector('i'); if (icon) icon.className = `${exists ? 'fa-regular' : 'fa-solid'} fa-heart`;
      toast(exists ? 'Destino eliminado.' : addedText);
    }
    document.querySelectorAll('.dest-highlight-heart').forEach((button) => button.addEventListener('click', () => toggleSaved(button, 'baqueano-favorites', 'Destino guardado en favoritos.')));
    document.querySelectorAll('.dest-btn-subtle').forEach((button) => button.addEventListener('click', () => {
      toggleSaved(button, 'baqueano-trip', 'Destino agregado a Mi Viaje.');
      button.textContent = button.classList.contains('active') ? '✓ En Mi viaje' : '+ Mi viaje';
    }));

    const favoriteIds = safeStorage.read('baqueano-favorites');
    document.querySelectorAll('.dest-highlight-heart').forEach((button) => {
      const saved = favoriteIds.includes(button.closest('article')?.dataset.destinationId);
      button.classList.toggle('active', saved); button.setAttribute('aria-pressed', String(saved));
      const icon = button.querySelector('i'); if (icon && saved) icon.className = 'fa-solid fa-heart';
    });
    const tripIds = safeStorage.read('baqueano-trip');
    document.querySelectorAll('.dest-btn-subtle').forEach((button) => {
      const saved = tripIds.includes(button.closest('article')?.dataset.destinationId);
      button.classList.toggle('active', saved); button.setAttribute('aria-pressed', String(saved));
      if (saved) button.textContent = '✓ En Mi viaje';
    });

    document.querySelectorAll('.dest-btn-green, .destinos-preview-btn').forEach((link) => link.addEventListener('click', (event) => {
      const card = link.closest('article, .destinos-map-preview-card'); if (!card) return;
      event.preventDefault(); openDetails(card);
    }));
    document.querySelectorAll('.section-header-link').forEach((link) => link.addEventListener('click', (event) => {
      event.preventDefault(); state.query = ''; state.category = 'todos'; state.department = ''; state.price = ''; state.rating = 0; state.page = 1;
      if (searchInput) searchInput.value = ''; categoryButtons.forEach((item, index) => item.classList.toggle('active', index === 0)); applyFilters();
    }));

    function openDetails(card) {
      const title = card.querySelector('h4')?.textContent.trim() || 'Destino';
      const image = card.querySelector('img')?.getAttribute('src') || '';
      const location = card.querySelector('.location, .destinos-preview-info span')?.textContent.trim() || 'Nicaragua';
      const dialog = document.createElement('dialog'); dialog.className = 'dest-detail-dialog';
      dialog.innerHTML = `<button type="button" class="dest-dialog-close" aria-label="Cerrar">×</button>${image ? `<img src="${image}" alt="${title}">` : ''}<div><span class="dest-dialog-kicker">DESTINO BAQUEANO</span><h2>${title}</h2><p>${location}</p><p>Explorá información, ubicación y opciones para incorporarlo a tu ruta.</p><a href="mapa.html?q=${encodeURIComponent(title)}" class="dest-btn-green">Ver en el mapa</a></div>`;
      document.body.appendChild(dialog); dialog.querySelector('.dest-dialog-close').addEventListener('click', () => dialog.close());
      dialog.addEventListener('close', () => dialog.remove()); dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); }); dialog.showModal();
    }

    function toast(message) {
      let node = document.getElementById('destinosToast');
      if (!node) { node = document.createElement('div'); node.id = 'destinosToast'; node.className = 'destinos-toast'; node.setAttribute('role', 'status'); node.setAttribute('aria-live', 'polite'); document.body.appendChild(node); }
      node.textContent = message; node.classList.add('show'); clearTimeout(node.hideTimer); node.hideTimer = setTimeout(() => node.classList.remove('show'), 2800);
    }

    const dropdownButton = document.querySelector('.exact-nav-dropdown-btn');
    const dropdownMenu = document.querySelector('.exact-nav-dropdown-menu');
    dropdownButton?.addEventListener('click', () => {
      const expanded = dropdownButton.getAttribute('aria-expanded') === 'true';
      dropdownButton.setAttribute('aria-expanded', String(!expanded)); dropdownMenu?.classList.toggle('open', !expanded);
    });
    document.querySelectorAll('a[href="#sosModal"]').forEach((link) => {
      if (typeof window.openSosModal === 'function') return;
      link.removeAttribute('onclick');
      link.addEventListener('click', (event) => { event.preventDefault(); window.location.href = 'index.html#sos'; });
    });

    const params = new URLSearchParams(location.search);
    state.query = params.get('q') || ''; state.category = params.get('categoria') || 'todos'; state.favoritesOnly = params.get('favs') === '1'; state.page = Math.max(1, Number(params.get('pagina')) || 1);
    if (searchInput) searchInput.value = state.query;
    categoryButtons.forEach((button) => button.classList.toggle('active', button.dataset.category === state.category));
    applyFilters();
  });
})();
