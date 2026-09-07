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
});

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

// Control local de filtrado de destinos
function initDestinationsFilterLocal() {
  const filterBtns = document.querySelectorAll('.cat-filter-btn');
  const destCards = document.querySelectorAll('.dest-card-pro');
  if (!filterBtns.length || !destCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');
      destCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterVal === 'all' || category === filterVal) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}
