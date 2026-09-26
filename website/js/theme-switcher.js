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
  const CUSTOM_COLORS_STORAGE_KEY = 'baqueano_custom_section_colors';
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

  // Valores por defecto de personalización cromática de secciones
  const defaultCustomColors = {
    bgColor: '#080D1A',
    titleColor: '#FFFFFF',
    textColor: '#E2E8F0',
    accentColor: '#F65E01',
    opacity: 45 // 45% filtro, dejando 55% de luz a la imagen panorámica
  };

  let activeCustomColors = { ...defaultCustomColors };

  try {
    const savedCustom = localStorage.getItem(CUSTOM_COLORS_STORAGE_KEY);
    if (savedCustom) {
      activeCustomColors = { ...defaultCustomColors, ...JSON.parse(savedCustom) };
    }
  } catch (_) {}

  function applyCustomSectionColors(colors, save = true) {
    activeCustomColors = { ...activeCustomColors, ...colors };
    const root = document.documentElement;
    const { bgColor, titleColor, textColor, accentColor, opacity } = activeCustomColors;

    // Calcular valores rgba derivados para gradiente atmosférico
    const rgb = hexToRgb(bgColor);
    const alphaTop = Math.min(0.9, (opacity / 100) * 1.2).toFixed(2);
    const alphaMid = Math.max(0.1, (opacity / 100) * 0.45).toFixed(2);
    const alphaBot = Math.min(0.95, (opacity / 100) * 1.4).toFixed(2);

    root.style.setProperty('--section-bg-color', bgColor);
    root.style.setProperty('--section-bg-tint', `rgba(${rgb}, ${alphaTop})`);
    root.style.setProperty('--section-bg-tint-mid', `rgba(${rgb}, ${alphaMid})`);
    root.style.setProperty('--section-bg-tint-bot', `rgba(${rgb}, ${alphaBot})`);
    root.style.setProperty('--section-title-color', titleColor);
    root.style.setProperty('--section-text-color', textColor);
    root.style.setProperty('--section-accent-color', accentColor);

    if (save) {
      try {
        localStorage.setItem(CUSTOM_COLORS_STORAGE_KEY, JSON.stringify(activeCustomColors));
      } catch (_) {}
    }

    // Actualizar campos en el modal si está abierto
    syncColorControlsUI();
  }

  // Aplicar inmediatamente al iniciar
  applyCustomSectionColors(activeCustomColors, false);


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

    // 1. Tokens de Identidad Oficial Baqueano (Globales en toda la web)
    root.style.setProperty('--baqueano-primary', palette.primary);
    root.style.setProperty('--baqueano-orange', palette.terracotta);
    root.style.setProperty('--baqueano-cream', palette.goldLight);
    root.style.setProperty('--baqueano-night', palette.background);
    root.style.setProperty('--baqueano-green', palette.primaryLight);

    // 2. Tokens de paleta primaria (Teal / Primario)
    root.style.setProperty('--petroleo-teal', palette.primary);
    root.style.setProperty('--petroleo-light', palette.primaryLight);
    root.style.setProperty('--petroleo-dark', palette.primaryDark);
    root.style.setProperty('--petroleo-glow', palette.primaryLight);

    // 3. Tokens de acento y fuego (Terracota / Naranja / Acento)
    root.style.setProperty('--terracotta', palette.terracotta);
    root.style.setProperty('--terracotta-light', palette.terracottaLight);
    root.style.setProperty('--terracotta-dark', palette.terracottaDark);
    root.style.setProperty('--terracotta-glow', palette.terracottaLight);

    // 4. Tokens de oro, arena y acentos cálidos
    root.style.setProperty('--arena-pinolera', palette.goldLight);
    root.style.setProperty('--arena-light', palette.goldLight);
    root.style.setProperty('--oro-noble', palette.gold);
    root.style.setProperty('--oro-light', palette.goldLight);
    root.style.setProperty('--text-cream', palette.goldLight);

    // 5. Fondos y superficies del sistema
    root.style.setProperty('--bg-space', palette.background);
    root.style.setProperty('--bg-dark', palette.surface);
    root.style.setProperty('--bg-surface', palette.surfaceElevated);
    root.style.setProperty('--bg-card', `rgba(${hexToRgb(palette.surface)}, 0.85)`);
    root.style.setProperty('--bg-card-hover', `rgba(${hexToRgb(palette.primary)}, 0.3)`);
    root.style.setProperty('--bg-glass', `rgba(${hexToRgb(palette.surface)}, 0.75)`);
    root.style.setProperty('--bg-glass-strong', `rgba(${hexToRgb(palette.background)}, 0.92)`);

    // 6. Bordes y resplandores
    root.style.setProperty('--border-glow', `rgba(${hexToRgb(palette.terracotta)}, 0.5)`);
    root.style.setProperty('--border-teal', `rgba(${hexToRgb(palette.primaryLight)}, 0.4)`);

    // 7. Gradientes dinámicos del sistema
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

    // 8. Atributo global para selectores CSS avanzados
    root.setAttribute('data-theme', themeId);
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
   * Inyecta o enlaza el botón en la barra de navegación (.nav-actions-right)
   */
  function injectNavbarButton() {
    const existing = document.getElementById('navThemeSwitcherBtn') || document.querySelector('.nav-theme-btn');
    if (existing) {
      existing.removeEventListener('click', openModal);
      existing.addEventListener('click', openModal);
      return;
    }

    const navActionsRight = document.querySelector('.nav-actions-right');
    if (!navActionsRight) return;

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
   * Inyecta el botón flotante ergonómico para abrir el selector en cualquier momento
   */
  function injectFloatingTrigger() {
    if (document.getElementById('baqFloatingThemeBtn')) return;
    const btn = document.createElement('button');
    btn.className = 'baq-theme-float-btn';
    btn.id = 'baqFloatingThemeBtn';
    btn.type = 'button';
    btn.title = 'Personalizar Colores de Fondo y Letras';
    btn.setAttribute('aria-label', 'Personalizar colores de fondo y letras');
    btn.innerHTML = `
      <div class="float-icon-box"><i class="fa-solid fa-palette"></i></div>
      <span class="float-text">Colores</span>
      <span class="float-badge">Personalizar</span>
    `;
    btn.addEventListener('click', openModal);
    document.body.appendChild(btn);
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

                <!-- Selector de Pestañas del Modal -->
        <div class="baq-theme-modal-nav-tabs">
          <button type="button" class="baq-modal-tab-btn is-active" id="tabBtnCatalog" data-view="catalog">
            <i class="fa-solid fa-palette"></i> <span>Temas de Nicaragua</span>
          </button>
          <button type="button" class="baq-modal-tab-btn" id="tabBtnStudio" data-view="studio">
            <i class="fa-solid fa-sliders"></i> <span>Personalizar Fondo &amp; Letras</span>
          </button>
        </div>

        <!-- VISTA 1: CATÁLOGO REGIONAL -->
        <div id="baqModalViewCatalog" class="baq-modal-view-panel is-active">
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
        </div>

        <!-- VISTA 2: COLOR STUDIO (PERSONALIZADOR DE SECCIONES & LETRAS) -->
        <div id="baqModalViewStudio" class="baq-modal-view-panel">
          <div class="baq-studio-container">
            <div class="baq-studio-intro">
              <i class="fa-solid fa-wand-magic-sparkles"></i>
              <div>
                <strong>Estudio Cromático en Vivo</strong>
                <p>Modifica el tono de fondo, el color de los títulos y el color de las letras en las secciones. La imagen panorámica de fondo se adaptará con el color que elijas en tiempo real.</p>
              </div>
            </div>

            <div class="baq-studio-grid">
              <!-- CONTROL 1: FONDO DE SECCIONES -->
              <div class="baq-studio-card">
                <div class="baq-studio-card-head">
                  <span class="baq-studio-icon"><i class="fa-solid fa-image"></i></span>
                  <div>
                    <h4>Tinte de Fondo de Secciones</h4>
                    <p>Color base que baña los paisajes de cada sección</p>
                  </div>
                </div>
                <div class="baq-studio-swatches-row" id="studioBgSwatches">
                  <button type="button" class="studio-swatch-chip" data-color="#080D1A" style="--c:#080D1A" title="Noche Azul Baqueano"></button>
                  <button type="button" class="studio-swatch-chip" data-color="#0B0707" style="--c:#0B0707" title="Magma Masaya"></button>
                  <button type="button" class="studio-swatch-chip" data-color="#04121F" style="--c:#04121F" title="Océano Caribe"></button>
                  <button type="button" class="studio-swatch-chip" data-color="#061510" style="--c:#061510" title="Selva Esmeralda"></button>
                  <button type="button" class="studio-swatch-chip" data-color="#12081E" style="--c:#12081E" title="Crepúsculo Ometepe"></button>
                  <button type="button" class="studio-swatch-chip" data-color="#150C07" style="--c:#150C07" title="Barro Precolombino"></button>
                  <button type="button" class="studio-swatch-chip" data-color="#020408" style="--c:#020408" title="Obsidiana Pura"></button>
                </div>
                <div class="baq-studio-picker-row">
                  <label for="inputCustomBgColor"><i class="fa-solid fa-eye-dropper"></i> Color Libre:</label>
                  <div class="baq-color-input-wrap">
                    <input type="color" id="inputCustomBgColor" value="#080D1A">
                    <span id="labelCustomBgVal">#080D1A</span>
                  </div>
                </div>
              </div>

              <!-- CONTROL 2: COLOR DE TÍTULOS -->
              <div class="baq-studio-card">
                <div class="baq-studio-card-head">
                  <span class="baq-studio-icon" style="color:#FBBF24"><i class="fa-solid fa-heading"></i></span>
                  <div>
                    <h4>Color de los Títulos</h4>
                    <p>Tipografía de los titulares principales en cada sección</p>
                  </div>
                </div>
                <div class="baq-studio-swatches-row" id="studioTitleSwatches">
                  <button type="button" class="studio-swatch-chip" data-color="#FFFFFF" style="--c:#FFFFFF" title="Blanco Nieve"></button>
                  <button type="button" class="studio-swatch-chip" data-color="#F4E6C1" style="--c:#F4E6C1" title="Crema Pinolera"></button>
                  <button type="button" class="studio-swatch-chip" data-color="#FBBF24" style="--c:#FBBF24" title="Oro Solentiname"></button>
                  <button type="button" class="studio-swatch-chip" data-color="#F65E01" style="--c:#F65E01" title="Naranja Fuego"></button>
                  <button type="button" class="studio-swatch-chip" data-color="#38BDF8" style="--c:#38BDF8" title="Cian Caribeño"></button>
                  <button type="button" class="studio-swatch-chip" data-color="#34D399" style="--c:#34D399" title="Verde Menta"></button>
                  <button type="button" class="studio-swatch-chip" data-color="#FB7185" style="--c:#FB7185" title="Coral Ometepe"></button>
                </div>
                <div class="baq-studio-picker-row">
                  <label for="inputCustomTitleColor"><i class="fa-solid fa-eye-dropper"></i> Color Libre:</label>
                  <div class="baq-color-input-wrap">
                    <input type="color" id="inputCustomTitleColor" value="#FFFFFF">
                    <span id="labelCustomTitleVal">#FFFFFF</span>
                  </div>
                </div>
              </div>

              <!-- CONTROL 3: COLOR DE LETRAS Y PÁRRAFOS -->
              <div class="baq-studio-card">
                <div class="baq-studio-card-head">
                  <span class="baq-studio-icon" style="color:#38BDF8"><i class="fa-solid fa-paragraph"></i></span>
                  <div>
                    <h4>Color de Textos y Letras</h4>
                    <p>Subtítulos, descripciones y textos secundarios</p>
                  </div>
                </div>
                <div class="baq-studio-swatches-row" id="studioTextSwatches">
                  <button type="button" class="studio-swatch-chip" data-color="#E2E8F0" style="--c:#E2E8F0" title="Gris Perla Suave"></button>
                  <button type="button" class="studio-swatch-chip" data-color="#F4E6C1" style="--c:#F4E6C1" title="Crema Cálido"></button>
                  <button type="button" class="studio-swatch-chip" data-color="#CBD5E1" style="--c:#CBD5E1" title="Plata Claro"></button>
                  <button type="button" class="studio-swatch-chip" data-color="#94A3B8" style="--c:#94A3B8" title="Pizarra Atenuado"></button>
                  <button type="button" class="studio-swatch-chip" data-color="#FFFFFF" style="--c:#FFFFFF" title="Blanco Total"></button>
                </div>
                <div class="baq-studio-picker-row">
                  <label for="inputCustomTextColor"><i class="fa-solid fa-eye-dropper"></i> Color Libre:</label>
                  <div class="baq-color-input-wrap">
                    <input type="color" id="inputCustomTextColor" value="#E2E8F0">
                    <span id="labelCustomTextVal">#E2E8F0</span>
                  </div>
                </div>
              </div>

              <!-- CONTROL 4: VISIBILIDAD DE LA IMAGEN DE FONDO -->
              <div class="baq-studio-card">
                <div class="baq-studio-card-head">
                  <span class="baq-studio-icon" style="color:#F65E01"><i class="fa-solid fa-circle-half-stroke"></i></span>
                  <div>
                    <h4>Visibilidad de Imagen Panorámica</h4>
                    <p>Ajusta el brillo y nitidez del paisaje de fondo</p>
                  </div>
                </div>
                <div class="baq-slider-group">
                  <div class="baq-slider-labels">
                    <span><i class="fa-solid fa-moon"></i> Más Oscuro</span>
                    <strong id="labelOpacityVal">55% Nitidez</strong>
                    <span><i class="fa-solid fa-sun"></i> Más Brillante</span>
                  </div>
                  <input type="range" id="inputCustomOpacity" min="10" max="85" value="45" class="baq-range-slider">
                </div>
              </div>
            </div>

            <!-- Previsualizador de Muestra Rápida -->
            <div class="baq-studio-preview-box">
              <div class="baq-preview-badge">Vista Previa de Secciones</div>
              <h3 class="baq-preview-title">Destinos que Inspiran Nicaragua</h3>
              <p class="baq-preview-desc">Volcanes sagrados, reservas de biósfera, joyas coloniales y paraísos costeros que definen la grandeza de nuestra patria.</p>
            </div>
          </div>
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
      applyCustomSectionColors(defaultCustomColors);
      showToast('Colores restablecidos a los valores oficiales de Baqueano.');
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
   * Aplica un tema seleccionado, guarda el estado y esconde el modal
   */
  function applyTheme(themeId, autoClose = true) {
    const theme = THEMES_CATALOG.find((t) => t.themeId === themeId);
    if (!theme) return;

    currentThemeId = themeId;
    applyCssVariables(themeId);

    try {
      localStorage.setItem(STORAGE_KEY, themeId);
    } catch (_) {}

    renderCards(document.querySelector('.baq-theme-filter-pill.is-active')?.dataset.category || 'all');
    showToast(`Paleta activada: ${theme.name}`);

    // Esconde el modal automáticamente tras seleccionar el tema
    if (autoClose) {
      setTimeout(() => {
        closeModal();
      }, 350);
    }
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
