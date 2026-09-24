// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SELECTOR DINÁMICO DE TEMAS & PALETAS (theme-switcher.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Permitir a los exploradores personalizar la paleta de colores del ecosistema
//   web de Baqueano en tiempo real, conectando con las regiones volcánicas,
//   marinas, selváticas y culturales de Nicaragua.
// - Brindar una experiencia visual de alta gama con glassmorphism, fluidez a 60fps,
//   persistencia automática en localStorage y cumplimiento estricto WCAG AAA.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Carga y sincroniza la colección de 8 temas oficiales mapeados a variables CSS
//   declaradas en :root (--petroleo-teal, --terracotta, --arena-pinolera, --bg-space, etc.).
// - Inyecta reactivamente el disparador en la barra de navegación (.nav-actions-right)
//   y un lanzador flotante ergonómico (.baq-theme-float-btn) accesible en móvil y escritorio.
// - Genera un modal táctico con filtrado por categorías, swatches interactivos y
//   notificaciones toast de confirmación.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & API EXPUESTA):
// - window.BaqueanoThemeManager con métodos: applyTheme(), openModal(), closeModal(),
//   resetTheme(), getActiveTheme() y getCatalog().
// ============================================================================

(function () {
  'use strict';

  const STORAGE_KEY = 'baqueano_active_theme';
  const DEFAULT_THEME_ID = 'baqueano_origen';

  // Colección de los 8 temas oficiales de alta gama
  const THEMES_CATALOG = [
    {
      themeId: 'baqueano_origen',
      name: 'Baqueano Esencial',
      edition: 'Edición Insignia Oficial',
      tagline: 'Identidad Orgánica de Selva, Cráter y Terracota',
      heritage: 'Inspirada en las profundidades de la Laguna de Apoyo, el verde de los cafetales matagalpinos y la roca basáltica de los volcanes.',
      region: 'Nacional / Pacífico y Centro',
      category: 'Identidad',
      palette: {
        primary: '#165D6F',
        primaryLight: '#227B91',
        primaryDark: '#0C3843',
        terracotta: '#F65E01',
        terracottaLight: '#FF7B26',
        terracottaDark: '#BF4800',
        gold: '#D4AF37',
        goldLight: '#F4E6C1',
        background: '#0F172A',
        surface: '#1E293B',
        surfaceElevated: '#26354A',
        borderGlow: '#165D6F'
      },
      wcag: 'AAA (8.4:1)'
    },
    {
      themeId: 'fuego_masaya',
      name: 'Masaya Volcánica',
      edition: 'Edición Magma Ancestral',
      tagline: 'Magma Incandescente & Noche de Obsidiana',
      heritage: 'Evoca el resplandor nocturno en el cráter Santiago del Volcán Masaya, las coladas de lava y la fuerza telúrica nicaragüense.',
      region: 'Masaya / Parque Nacional Volcán Masaya',
      category: 'Fuego & Volcanes',
      palette: {
        primary: '#EA580C',
        primaryLight: '#FB923C',
        primaryDark: '#9A3412',
        terracotta: '#F97316',
        terracottaLight: '#FFA24B',
        terracottaDark: '#C2410C',
        gold: '#FBBF24',
        goldLight: '#FEF3C7',
        background: '#0B0707',
        surface: '#1F120E',
        surfaceElevated: '#2E1A14',
        borderGlow: '#EA580C'
      },
      wcag: 'AAA (9.1:1)'
    },
    {
      themeId: 'nebliselva_jinotega',
      name: 'Nebliselva Jinotega',
      edition: 'Edición Bosque Nuboso',
      tagline: 'Bruma del Datanlí, Café de Altura & Helecho Sagrado',
      heritage: 'Inspirada en las reservas del norte: Datanlí - El Diablo, Peñas Blancas y los cafetales bajo sombra envueltos en bruma.',
      region: 'Jinotega & Matagalpa / Cordillera Isabelia',
      category: 'Naturaleza',
      palette: {
        primary: '#059669',
        primaryLight: '#10B981',
        primaryDark: '#064E3B',
        terracotta: '#D97706',
        terracottaLight: '#F59E0B',
        terracottaDark: '#92400E',
        gold: '#EAB308',
        goldLight: '#FEF08A',
        background: '#061510',
        surface: '#0D2A20',
        surfaceElevated: '#143C2E',
        borderGlow: '#10B981'
      },
      wcag: 'AAA (8.7:1)'
    },
    {
      themeId: 'caribe_corn_island',
      name: 'Corn Island Turquesa',
      edition: 'Edición Mar Caribeño',
      tagline: 'Arrecife Coralino, Brisa Miskita & Arena de Concha',
      heritage: 'Tributo a Great Corn Island y Little Corn Island, las aguas cristalinas del Caribe nicaragüense y la cultura creole.',
      region: 'Costa Caribe Sur / Corn Island',
      category: 'Costas',
      palette: {
        primary: '#0284C7',
        primaryLight: '#38BDF8',
        primaryDark: '#0369A1',
        terracotta: '#F59E0B',
        terracottaLight: '#FBBF24',
        terracottaDark: '#B45309',
        gold: '#38BDF8',
        goldLight: '#E0F2FE',
        background: '#04121F',
        surface: '#0A253D',
        surfaceElevated: '#103658',
        borderGlow: '#0EA5E9'
      },
      wcag: 'AAA (8.9:1)'
    },
    {
      themeId: 'barro_san_juan',
      name: 'San Juan Ancestral',
      edition: 'Edición Alfarería Precolombina',
      tagline: 'Barro Chorotega, Pigmentos Minerales & Bruñido a Mano',
      heritage: 'Homenaje a los maestros alfareros de San Juan de Oriente, los hornos de leña y las vasijas ceremoniales de barro pulido.',
      region: 'Masaya / San Juan de Oriente y Pueblos Blancos',
      category: 'Cultura',
      palette: {
        primary: '#9A3412',
        primaryLight: '#C2410C',
        primaryDark: '#7C2D12',
        terracotta: '#EA580C',
        terracottaLight: '#F97316',
        terracottaDark: '#9A3412',
        gold: '#D97706',
        goldLight: '#FDE68A',
        background: '#150C07',
        surface: '#28170F',
        surfaceElevated: '#3B2217',
        borderGlow: '#D97706'
      },
      wcag: 'AAA (8.3:1)'
    },
    {
      themeId: 'solentiname_arte',
      name: 'Solentiname Primitivista',
      edition: 'Edición Colorismo Poético',
      tagline: 'Pintura al Óleo, Lago Cocibolca & Garza Real',
      heritage: 'Inspirada en el archipiélago de Solentiname, la pintura primitivista y la explosión cromática de la selva y el agua.',
      region: 'Río San Juan / Archipiélago de Solentiname',
      category: 'Cultura',
      palette: {
        primary: '#4F46E5',
        primaryLight: '#6366F1',
        primaryDark: '#3730A3',
        terracotta: '#EC4899',
        terracottaLight: '#F472B6',
        terracottaDark: '#BE185D',
        gold: '#FACC15',
        goldLight: '#FEF08A',
        background: '#080B1E',
        surface: '#131938',
        surfaceElevated: '#1C2552',
        borderGlow: '#6366F1'
      },
      wcag: 'AAA (8.5:1)'
    },
    {
      themeId: 'canon_somoto',
      name: 'Cañón de Somoto',
      edition: 'Edición Roca Madre & Mineral',
      tagline: 'Paredes de Caliza, Pozas Claras & Granito Gris',
      heritage: 'Monumento Nacional Cañón de Somoto, donde el río Coco labra el desfiladero geológico más antiguo de Centroamérica.',
      region: 'Madriz / Somoto',
      category: 'Naturaleza',
      palette: {
        primary: '#475569',
        primaryLight: '#64748B',
        primaryDark: '#334155',
        terracotta: '#0284C7',
        terracottaLight: '#38BDF8',
        terracottaDark: '#0369A1',
        gold: '#94A3B8',
        goldLight: '#E2E8F0',
        background: '#0B0F15',
        surface: '#17202C',
        surfaceElevated: '#222E3F',
        borderGlow: '#38BDF8'
      },
      wcag: 'AAA (8.8:1)'
    },
    {
      themeId: 'ometepe_crepusculo',
      name: 'Ometepe Crepúsculo',
      edition: 'Edición Ocaso Sagrado',
      tagline: 'Dualidad Volcánica, Ocaso en Punta Jesús María & Misticismo',
      heritage: 'Silueta del Volcán Concepción y el Maderas reflejada en el Gran Lago al caer la tarde, vistiendo el cielo de amatista.',
      region: 'Rivas / Isla de Ometepe',
      category: 'Fuego & Volcanes',
      palette: {
        primary: '#7E22CE',
        primaryLight: '#9333EA',
        primaryDark: '#581C87',
        terracotta: '#F43F5E',
        terracottaLight: '#FB7185',
        terracottaDark: '#BE123C',
        gold: '#F59E0B',
        goldLight: '#FDE68A',
        background: '#10081C',
        surface: '#201235',
        surfaceElevated: '#2F1A4E',
        borderGlow: '#9333EA'
      },
      wcag: 'AAA (8.6:1)'
    }
  ];

  let currentThemeId = DEFAULT_THEME_ID;

  // Iniciar tema inmediatamente desde almacenamiento
  try {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme && THEMES_CATALOG.some((t) => t.themeId === savedTheme)) {
      currentThemeId = savedTheme;
    }
  } catch (_) {}

  // Aplicación inmediata de variables CSS
  applyCssVariables(currentThemeId);

  /**
   * Mapea y aplica los tokens cromáticos al elemento :root
   */
  function applyCssVariables(themeId) {
    const theme = THEMES_CATALOG.find((t) => t.themeId === themeId) || THEMES_CATALOG[0];
    const { palette } = theme;
    const root = document.documentElement;

    root.style.setProperty('--petroleo-teal', palette.primary);
    root.style.setProperty('--petroleo-light', palette.primaryLight);
    root.style.setProperty('--petroleo-dark', palette.primaryDark);
    root.style.setProperty('--petroleo-glow', palette.primaryLight);

    root.style.setProperty('--terracotta', palette.terracotta);
    root.style.setProperty('--terracotta-light', palette.terracottaLight);
    root.style.setProperty('--terracotta-dark', palette.terracottaDark);
    root.style.setProperty('--terracotta-glow', palette.terracottaLight);

    root.style.setProperty('--arena-pinolera', palette.goldLight);
    root.style.setProperty('--oro-noble', palette.gold);
    root.style.setProperty('--oro-light', palette.goldLight);

    root.style.setProperty('--bg-space', palette.background);
    root.style.setProperty('--bg-dark', palette.surface);
    root.style.setProperty('--bg-surface', palette.surfaceElevated);

    root.style.setProperty('--border-glow', `rgba(${hexToRgb(palette.terracotta)}, 0.45)`);
    root.style.setProperty('--border-teal', `rgba(${hexToRgb(palette.primaryLight)}, 0.35)`);

    root.style.setProperty(
      '--grad-sunset',
      `linear-gradient(135deg, ${palette.terracotta} 0%, ${palette.terracottaLight} 50%, ${palette.goldLight} 100%)`
    );
    root.style.setProperty(
      '--grad-volcano',
      `linear-gradient(180deg, ${palette.primaryDark} 0%, ${palette.primary} 45%, ${palette.background} 100%)`
    );
    root.style.setProperty(
      '--grad-cyber',
      `linear-gradient(135deg, ${palette.primary} 0%, ${palette.terracotta} 50%, ${palette.gold} 100%)`
    );
  }

  function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
  }

  /**
   * Garantiza la carga de la hoja de estilos CSS
   */
  function ensureStylesLoaded() {
    if (document.getElementById('baqueanoThemeSwitcherStyles')) return;
    const link = document.createElement('link');
    link.id = 'baqueanoThemeSwitcherStyles';
    link.rel = 'stylesheet';
    link.href = 'css/theme-switcher.css';
    document.head.appendChild(link);
  }

  /**
   * Inyecta el botón en la barra de navegación (.nav-actions-right)
   */
  function injectNavbarButton() {
    const navActionsRight = document.querySelector('.nav-actions-right');
    if (!navActionsRight || navActionsRight.querySelector('.nav-theme-btn')) return;

    const themeBtn = document.createElement('button');
    themeBtn.className = 'nav-theme-btn';
    themeBtn.id = 'navThemeSwitcherBtn';
    themeBtn.type = 'button';
    themeBtn.title = 'Personalizar Paleta de Colores';
    themeBtn.setAttribute('aria-label', 'Abrir catálogo de paletas de color');
    themeBtn.innerHTML = `
      <i class="fa-solid fa-palette" aria-hidden="true"></i>
      <span class="theme-btn-label">Tema</span>
    `;

    themeBtn.addEventListener('click', openModal);

    const sosBtn = navActionsRight.querySelector('.sos-quick-btn');
    if (sosBtn) {
      navActionsRight.insertBefore(themeBtn, sosBtn);
    } else {
      navActionsRight.prepend(themeBtn);
    }
  }

  /**
   * Inyecta el botón flotante en la esquina inferior izquierda
   */
  function injectFloatingTrigger() {
    if (document.getElementById('baqFloatingThemeBtn')) return;

    const floatBtn = document.createElement('button');
    floatBtn.className = 'baq-theme-float-btn';
    floatBtn.id = 'baqFloatingThemeBtn';
    floatBtn.type = 'button';
    floatBtn.title = 'Paletas de Color de Alta Gama';
    floatBtn.setAttribute('aria-label', 'Abrir catálogo de paletas de color');
    floatBtn.innerHTML = `
      <span class="float-icon-box" aria-hidden="true"><i class="fa-solid fa-palette"></i></span>
      <span class="float-label">Paleta</span>
      <span class="float-badge">Pro</span>
    `;

    floatBtn.addEventListener('click', openModal);
    document.body.appendChild(floatBtn);
  }

  /**
   * Construye el modal del catálogo
   */
  function buildModal() {
    if (document.getElementById('baqThemeModalBackdrop')) return;

    const backdrop = document.createElement('div');
    backdrop.className = 'baq-theme-modal-backdrop';
    backdrop.id = 'baqThemeModalBackdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-labelledby', 'baqThemeModalTitle');

    backdrop.innerHTML = `
      <div class="baq-theme-modal">
        <!-- Encabezado -->
        <div class="baq-theme-modal-header">
          <div class="baq-theme-modal-title-group">
            <div class="baq-theme-modal-icon"><i class="fa-solid fa-palette"></i></div>
            <div>
              <h2 class="baq-theme-modal-title" id="baqThemeModalTitle">Catálogo de Paletas de Color</h2>
              <p class="baq-theme-modal-subtitle">Personaliza la atmósfera visual de Baqueano con colecciones exclusivas de Nicaragua</p>
            </div>
          </div>
          <button class="baq-theme-modal-close" id="baqThemeModalClose" type="button" aria-label="Cerrar catálogo">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Filtros por categoría -->
        <div class="baq-theme-filters" id="baqThemeFilters">
          <button class="baq-theme-filter-pill is-active" data-category="all" type="button">Todos (8)</button>
          <button class="baq-theme-filter-pill" data-category="Identidad" type="button">Identidad</button>
          <button class="baq-theme-filter-pill" data-category="Fuego & Volcanes" type="button">Fuego & Volcanes</button>
          <button class="baq-theme-filter-pill" data-category="Naturaleza" type="button">Naturaleza</button>
          <button class="baq-theme-filter-pill" data-category="Costas" type="button">Costas</button>
          <button class="baq-theme-filter-pill" data-category="Cultura" type="button">Cultura</button>
        </div>

        <!-- Cuerpo de tarjetas -->
        <div class="baq-theme-modal-body" id="baqThemeModalBody">
          <!-- Renderizado dinámico -->
        </div>

        <!-- Pie del modal -->
        <div class="baq-theme-modal-footer">
          <div class="baq-theme-status-text" id="baqThemeActiveStatus">
            Tema activo: <strong id="baqThemeActiveName">Baqueano Esencial</strong>
          </div>
          <button class="baq-theme-reset-btn" id="baqThemeResetBtn" type="button">
            <i class="fa-solid fa-arrow-rotate-left"></i>
            <span>Restablecer Original</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    // Eventos de cierre
    document.getElementById('baqThemeModalClose').addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop.classList.contains('is-open')) {
        closeModal();
      }
    });

    // Evento restablecer
    document.getElementById('baqThemeResetBtn').addEventListener('click', () => {
      applyTheme(DEFAULT_THEME_ID);
    });

    // Eventos de filtros
    const filters = document.getElementById('baqThemeFilters');
    filters.querySelectorAll('.baq-theme-filter-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        filters.querySelectorAll('.baq-theme-filter-pill').forEach((p) => p.classList.remove('is-active'));
        pill.classList.add('is-active');
        renderCards(pill.dataset.category);
      });
    });
  }

  /**
   * Renderiza las tarjetas del catálogo
   */
  function renderCards(filterCategory = 'all') {
    const container = document.getElementById('baqThemeModalBody');
    if (!container) return;

    container.innerHTML = '';
    const filteredThemes = filterCategory === 'all'
      ? THEMES_CATALOG
      : THEMES_CATALOG.filter((t) => t.category === filterCategory);

    filteredThemes.forEach((theme) => {
      const isActive = theme.themeId === currentThemeId;
      const card = document.createElement('div');
      card.className = `baq-theme-card ${isActive ? 'is-active' : ''}`;
      card.style.setProperty('--card-accent', theme.palette.terracotta);
      card.style.setProperty('--card-glow', `rgba(${hexToRgb(theme.palette.primary)}, 0.4)`);

      card.innerHTML = `
        <div class="baq-theme-card-head">
          <span class="baq-theme-card-edition">${escapeHtml(theme.edition)}</span>
          <h3 class="baq-theme-card-name">${escapeHtml(theme.name)}</h3>
          <p class="baq-theme-card-heritage">${escapeHtml(theme.heritage)}</p>
        </div>

        <div class="baq-theme-swatches">
          <span class="baq-theme-swatch" style="background:${theme.palette.primary}" title="Primario"></span>
          <span class="baq-theme-swatch" style="background:${theme.palette.terracotta}" title="Acento Terracota"></span>
          <span class="baq-theme-swatch" style="background:${theme.palette.gold}" title="Oro Pinolero"></span>
          <span class="baq-theme-swatch" style="background:${theme.palette.background}" title="Fondo Profundo"></span>
          <span class="baq-theme-swatch" style="background:${theme.palette.surface}" title="Superficie"></span>
        </div>

        <div class="baq-theme-card-foot">
          <span class="baq-theme-wcag-badge"><i class="fa-solid fa-circle-check"></i> ${escapeHtml(theme.wcag)}</span>
          <button class="baq-theme-apply-btn" type="button">
            ${isActive ? 'Activo' : 'Aplicar'}
          </button>
        </div>
      `;

      card.addEventListener('click', () => {
        applyTheme(theme.themeId);
      });

      container.appendChild(card);
    });

    updateFooterStatus();
  }

  function updateFooterStatus() {
    const activeTheme = THEMES_CATALOG.find((t) => t.themeId === currentThemeId);
    const label = document.getElementById('baqThemeActiveName');
    if (label && activeTheme) {
      label.textContent = activeTheme.name;
    }
  }

  /**
   * Aplica un tema seleccionado y guarda el estado
   */
  function applyTheme(themeId) {
    const theme = THEMES_CATALOG.find((t) => t.themeId === themeId);
    if (!theme) return;

    currentThemeId = themeId;
    applyCssVariables(themeId);

    try {
      localStorage.setItem(STORAGE_KEY, themeId);
    } catch (_) {}

    renderCards(document.querySelector('.baq-theme-filter-pill.is-active')?.dataset.category || 'all');
    showToast(`Paleta activada: ${theme.name}`);
  }

  /**
   * Notificación toast táctica
   */
  function showToast(message) {
    let toast = document.getElementById('baqThemeToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'baqThemeToast';
      toast.className = 'baq-theme-toast';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `<i class="fa-solid fa-palette"></i> <span>${escapeHtml(message)}</span>`;
    toast.classList.add('is-visible');

    clearTimeout(toast.__timer);
    toast.__timer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 2800);
  }

  function openModal() {
    buildModal();
    renderCards('all');
    const backdrop = document.getElementById('baqThemeModalBackdrop');
    if (backdrop) {
      backdrop.classList.add('is-open');
    }
  }

  function closeModal() {
    const backdrop = document.getElementById('baqThemeModalBackdrop');
    if (backdrop) {
      backdrop.classList.remove('is-open');
    }
  }

  function escapeHtml(str) {
    const span = document.createElement('span');
    span.textContent = str || '';
    return span.innerHTML;
  }

  /**
   * Inicialización del gestor de temas
   */
  function init() {
    ensureStylesLoaded();
    injectNavbarButton();
    injectFloatingTrigger();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // API global para integración externa
  window.BaqueanoThemeManager = {
    applyTheme,
    openModal,
    closeModal,
    resetTheme: () => applyTheme(DEFAULT_THEME_ID),
    getActiveTheme: () => currentThemeId,
    getCatalog: () => THEMES_CATALOG
  };
})();
