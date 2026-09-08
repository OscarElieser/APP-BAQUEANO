// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — ORQUESTADOR PRINCIPAL (APP.JS)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Servir como coordinador central de inicio e interconexión para todas las
//   páginas modulares del portal oficial de Baqueano Nicaragua.
// - Detectar dinámicamente qué componentes existen en la página activa
//   (música, calculadora, formulario ambiental, pasaporte, chat IA, admin dashboard)
//   e inicializar sus respectivos controladores sin errores de referencia.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Carga y comprueba la disponibilidad de los módulos especializados:
//   * js/navigation.js
//   * js/audio-player.js
//   * js/environmental.js
//   * js/calculator.js
//   * js/ai-assistant.js
//   * js/admin-ops.js
// - Manejo defensivo con verificación de elementos DOM y fallback integrado.
// - Integración con Firebase Analytics para rastreo de visitas éticas.
//
// 📦 3. QUÉ (WHAT / CICLO DE VIDA):
// - Evento DOMContentLoaded dispara el despachador de módulos.
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Módulos transversales de navegación y seguridad
  if (typeof initNavbarScroll === 'function') initNavbarScroll();
  if (typeof initMobileMenu === 'function') initMobileMenu();
  if (typeof initActiveNavHighlight === 'function') initActiveNavHighlight();
  if (typeof initDynamicNavbar === 'function') initDynamicNavbar();
  if (typeof initDynamicFooter === 'function') initDynamicFooter();
  if (typeof initSosModal === 'function') initSosModal();
  if (typeof initDownloadModal === 'function') initDownloadModal();
  if (typeof initShareTools === 'function') initShareTools();
  if (typeof initSmoothScroll === 'function') initSmoothScroll();

  // 2. Módulo de Patrimonio Sonoro Folclórico
  if (document.getElementById('globalFolkloreAudio') && typeof initFolkloreAudio === 'function') {
    initFolkloreAudio();
  }

  // 3. Módulo Ambiental y Denuncias
  if (document.getElementById('environmentalReportForm') && typeof initEnvironmentalModule === 'function') {
    initEnvironmentalModule();
  }

  // 4. Asistente Inteligente Baqueano AI
  if (document.getElementById('aiChatForm') && typeof initBaqueanoAi === 'function') {
    initBaqueanoAi();
  }

  // 5. Motor Fiscal y Cotizador Bimoneda (Ley 306)
  if (document.getElementById('receiptSubtotal') && typeof initBimonedaCheckout === 'function') {
    initBimonedaCheckout();
  }

  // 6. Calculadora de Retorno Rural Campesino (ROI)
  if (document.getElementById('monthlyTours') && typeof initRoiCalculator === 'function') {
    initRoiCalculator();
  }

  // 7. Explorador de 17 Territorios
  initTerritoriesLocal();

  // 8. Filtrado de Catálogo de Destinos
  initDestinationsFilterLocal();

  // 9. Operaciones del Admin Ops Center
  if (document.getElementById('liveFeedStream') && typeof initAdminOperations === 'function') {
    initAdminOperations();
  }
  
  // 10. Módulos nuevos de expansión
  if (typeof initFirestoreRealtime === 'function') initFirestoreRealtime();
  if (document.getElementById('hostForm') && typeof initBusinessPortal === 'function') initBusinessPortal();
  if (document.getElementById('liveMetricsDashboard') && typeof initLiveMetrics === 'function') initLiveMetrics();

  // 11. Tipografía Cinematográfica Dinámica (Letras en Movimiento en H1)
  initKineticHeadings();
});

// Inicializador de tipografía cinética para todos los h1
function initKineticHeadings() {
  const headings = document.querySelectorAll('h1');
  if (!headings.length) return;

  headings.forEach(heading => {
    // Si ya está procesado o tiene inputs interactivos, omitir
    if (heading.getAttribute('data-kinetic-ready') === 'true') return;

    const rawText = heading.textContent ? heading.textContent.trim() : '';
    if (!rawText || rawText.length === 0) return;

    // Accesibilidad estricta: preservar el texto original para lectores de pantalla
    heading.setAttribute('aria-label', rawText);
    heading.setAttribute('data-kinetic-ready', 'true');

    // Dividir en palabras y caracteres manteniendo la estructura
    const words = rawText.split(/\s+/);
    let charCounter = 0;

    heading.innerHTML = words.map(word => {
      const charsHtml = word.split('').map(char => {
        charCounter++;
        return `<span class="kinetic-char" style="--char-index: ${charCounter}">${char}</span>`;
      }).join('');
      return `<span class="kinetic-word">${charsHtml}</span>`;
    }).join('&nbsp;');
  });
}

// Control local de tarjetas de territorios
function initTerritoriesLocal() {
  const cards = document.querySelectorAll('.territory-pill-card');
  if (!cards.length) return;

  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
  });
}

// Control interactivo y dinámico de filtrado de destinos y estadías por categoría y búsqueda en vivo
function initDestinationsFilterLocal() {
  const filterBtns = document.querySelectorAll('.cat-filter-btn');
  const destCards = document.querySelectorAll('.dest-card-pro');
  const searchInput = document.getElementById('destSearchInput');
  const clearBtn = document.getElementById('destSearchClearBtn');

  if (!filterBtns.length && !destCards.length && !searchInput) return;

  let activeCategory = 'all';
  let searchQuery = '';

  const applyFilters = () => {
    destCards.forEach(card => {
      const category = card.getAttribute('data-category') || '';
      const textContent = (card.textContent || '').toLowerCase();

      const matchCategory = (activeCategory === 'all' || category === activeCategory);
      const matchSearch = (!searchQuery || textContent.includes(searchQuery));

      if (matchCategory && matchSearch) {
        card.style.display = 'flex';
        card.style.animation = 'fadeIn 0.35s ease forwards';
      } else {
        card.style.display = 'none';
      }
    });
  };

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-filter') || 'all';
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = (e.target.value || '').trim().toLowerCase();
      applyFilters();
    });
  }

  if (clearBtn && searchInput) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      applyFilters();
      searchInput.focus();
    });
  }
}

