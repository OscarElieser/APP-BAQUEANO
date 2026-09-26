import fs from 'node:fs';

console.log('🎨 Implementando Selector de Colores Dinámico y Personalizador de Secciones...');

// ============================================================================
// 1. ACTUALIZAR website/js/theme-switcher.js
// ============================================================================
const jsPath = 'website/js/theme-switcher.js';
let jsContent = fs.readFileSync(jsPath, 'utf8');

// Añadir clave de almacenamiento para colores personalizados
if (!jsContent.includes('const CUSTOM_COLORS_STORAGE_KEY =')) {
  jsContent = jsContent.replace(
    "const STORAGE_KEY = 'baqueano_active_theme';",
    "const STORAGE_KEY = 'baqueano_active_theme';\n  const CUSTOM_COLORS_STORAGE_KEY = 'baqueano_custom_section_colors';"
  );
}

// Lógica de carga y aplicación de colores personalizados
const customColorLogic = `
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
    root.style.setProperty('--section-bg-tint', \`rgba(\${rgb}, \${alphaTop})\`);
    root.style.setProperty('--section-bg-tint-mid', \`rgba(\${rgb}, \${alphaMid})\`);
    root.style.setProperty('--section-bg-tint-bot', \`rgba(\${rgb}, \${alphaBot})\`);
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
`;

if (!jsContent.includes('function applyCustomSectionColors')) {
  jsContent = jsContent.replace('let currentThemeId = DEFAULT_THEME_ID;', 'let currentThemeId = DEFAULT_THEME_ID;\n' + customColorLogic);
}

// Inyección del botón flotante ergonómico
const newFloatingTrigger = `  /**
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
    btn.innerHTML = \`
      <div class="float-icon-box"><i class="fa-solid fa-palette"></i></div>
      <span class="float-text">Colores</span>
      <span class="float-badge">Personalizar</span>
    \`;
    btn.addEventListener('click', openModal);
    document.body.appendChild(btn);
  }`;

jsContent = jsContent.replace(
  /\/\*\*\s*\* Oculta el lanzador flotante[\s\S]*?function injectFloatingTrigger\(\)\s*\{[\s\S]*?\}\s*\}/m,
  newFloatingTrigger
);

// Reemplazar buildModal con soporte para pestañas: Catálogo y Personalizador de Secciones & Letras
const modalBodyReplacement = `        <!-- Selector de Pestañas del Modal -->
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
        </div>`;

jsContent = jsContent.replace(
  /<!-- Filtros por categoría -->[\s\S]*?<!-- Cuerpo de tarjetas -->[\s\S]*?<div class="baq-theme-modal-body" id="baqThemeModalBody">[\s\S]*?<\/div>/m,
  modalBodyReplacement
);

// Eventos de controles del Studio
const studioEventsCode = `
    // Función de sincronización de controles con el estado actual
    function syncColorControlsUI() {
      const inputBg = document.getElementById('inputCustomBgColor');
      const inputTitle = document.getElementById('inputCustomTitleColor');
      const inputText = document.getElementById('inputCustomTextColor');
      const inputOpacity = document.getElementById('inputCustomOpacity');

      const labelBg = document.getElementById('labelCustomBgVal');
      const labelTitle = document.getElementById('labelCustomTitleVal');
      const labelText = document.getElementById('labelCustomTextVal');
      const labelOpacity = document.getElementById('labelOpacityVal');

      if (inputBg) {
        inputBg.value = activeCustomColors.bgColor;
        if (labelBg) labelBg.textContent = activeCustomColors.bgColor.toUpperCase();
      }
      if (inputTitle) {
        inputTitle.value = activeCustomColors.titleColor;
        if (labelTitle) labelTitle.textContent = activeCustomColors.titleColor.toUpperCase();
      }
      if (inputText) {
        inputText.value = activeCustomColors.textColor;
        if (labelText) labelText.textContent = activeCustomColors.textColor.toUpperCase();
      }
      if (inputOpacity) {
        inputOpacity.value = activeCustomColors.opacity;
        if (labelOpacity) labelOpacity.textContent = (100 - activeCustomColors.opacity) + '% Nitidez';
      }

      // Actualizar vista previa
      const previewBox = document.querySelector('.baq-studio-preview-box');
      const previewTitle = document.querySelector('.baq-preview-title');
      const previewDesc = document.querySelector('.baq-preview-desc');
      if (previewBox && previewTitle && previewDesc) {
        previewBox.style.backgroundColor = activeCustomColors.bgColor;
        previewTitle.style.color = activeCustomColors.titleColor;
        previewDesc.style.color = activeCustomColors.textColor;
      }
    }

    // Navegación entre pestañas (Temas vs Personalizador)
    const tabBtnCatalog = document.getElementById('tabBtnCatalog');
    const tabBtnStudio = document.getElementById('tabBtnStudio');
    const viewCatalog = document.getElementById('baqModalViewCatalog');
    const viewStudio = document.getElementById('baqModalViewStudio');

    if (tabBtnCatalog && tabBtnStudio) {
      tabBtnCatalog.addEventListener('click', () => {
        tabBtnCatalog.classList.add('is-active');
        tabBtnStudio.classList.remove('is-active');
        viewCatalog.classList.add('is-active');
        viewStudio.classList.remove('is-active');
      });

      tabBtnStudio.addEventListener('click', () => {
        tabBtnStudio.classList.add('is-active');
        tabBtnCatalog.classList.remove('is-active');
        viewStudio.classList.add('is-active');
        viewCatalog.classList.remove('is-active');
        syncColorControlsUI();
      });
    }

    // Escuchadores de eventos para Color Pickers
    const inputCustomBg = document.getElementById('inputCustomBgColor');
    if (inputCustomBg) {
      inputCustomBg.addEventListener('input', (e) => {
        applyCustomSectionColors({ bgColor: e.target.value });
      });
    }

    const inputCustomTitle = document.getElementById('inputCustomTitleColor');
    if (inputCustomTitle) {
      inputCustomTitle.addEventListener('input', (e) => {
        applyCustomSectionColors({ titleColor: e.target.value });
      });
    }

    const inputCustomText = document.getElementById('inputCustomTextColor');
    if (inputCustomText) {
      inputCustomText.addEventListener('input', (e) => {
        applyCustomSectionColors({ textColor: e.target.value });
      });
    }

    const inputCustomOpacity = document.getElementById('inputCustomOpacity');
    if (inputCustomOpacity) {
      inputCustomOpacity.addEventListener('input', (e) => {
        applyCustomSectionColors({ opacity: parseInt(e.target.value, 10) });
      });
    }

    // Escuchadores de Swatches rápidos
    document.querySelectorAll('#studioBgSwatches .studio-swatch-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        applyCustomSectionColors({ bgColor: btn.dataset.color });
      });
    });

    document.querySelectorAll('#studioTitleSwatches .studio-swatch-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        applyCustomSectionColors({ titleColor: btn.dataset.color });
      });
    });

    document.querySelectorAll('#studioTextSwatches .studio-swatch-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        applyCustomSectionColors({ textColor: btn.dataset.color });
      });
    });
`;

if (!jsContent.includes('syncColorControlsUI')) {
  jsContent = jsContent.replace("document.getElementById('baqThemeResetBtn').addEventListener('click', () => {", studioEventsCode + "\n    document.getElementById('baqThemeResetBtn').addEventListener('click', () => {");
}

// Reset button resets both theme and custom section colors
jsContent = jsContent.replace(
  "applyTheme(DEFAULT_THEME_ID);",
  "applyTheme(DEFAULT_THEME_ID);\n      applyCustomSectionColors(defaultCustomColors);\n      showToast('Colores restablecidos a los valores oficiales de Baqueano.');"
);

// Exponer en window.BaqueanoThemeManager
jsContent = jsContent.replace(
  "getCatalog: () => THEMES_CATALOG\n  };",
  "getCatalog: () => THEMES_CATALOG,\n    setSectionColors: applyCustomSectionColors,\n    getCustomColors: () => ({ ...activeCustomColors })\n  };"
);

fs.writeFileSync(jsPath, jsContent, 'utf8');
console.log('✅ website/js/theme-switcher.js actualizado exitosamente.');

// ============================================================================
// 2. ACTUALIZAR website/css/theme-switcher.css
// ============================================================================
const cssPath = 'website/css/theme-switcher.css';
let cssContent = fs.readFileSync(cssPath, 'utf8');

// Habilitar botón flotante de forma visible y llamativa
const floatingCssReplacement = `/* ── LANZADOR FLOTANTE ERGONÓMICO ── */
.baq-theme-float-btn {
  display: inline-flex !important;
  align-items: center;
  gap: 10px;
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 9999;
  background: rgba(15, 23, 42, 0.88);
  border: 1px solid rgba(246, 94, 1, 0.5);
  border-radius: 999px;
  padding: 8px 16px 8px 8px;
  color: #F4E6C1;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(246, 94, 1, 0.25);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  user-select: none;
}`;

cssContent = cssContent.replace(
  /\/\* ── LANZADOR FLOTANTE ESCONDIDO[\s\S]*?\.baq-theme-float-btn\s*\{[\s\S]*?display:\s*none\s*!important;\s*\}/m,
  floatingCssReplacement
);

// Estilos del Studio de Colores
const studioCss = `
/* ── PESTAÑAS DEL MODAL ── */
.baq-theme-modal-nav-tabs {
  display: flex;
  gap: 10px;
  padding: 12px 28px 0;
  background: rgba(15, 23, 42, 0.4);
  border-bottom: 1px solid rgba(244, 230, 193, 0.1);
}

.baq-modal-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: #94A3B8;
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.baq-modal-tab-btn:hover {
  color: #FFFFFF;
}

.baq-modal-tab-btn.is-active {
  color: #F65E01;
  border-bottom-color: #F65E01;
}

/* ── PANELES DE VISTA ── */
.baq-modal-view-panel {
  display: none;
  flex: 1;
  overflow-y: auto;
}

.baq-modal-view-panel.is-active {
  display: block;
}

/* ── COLOR STUDIO CONTENEDOR ── */
.baq-studio-container {
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.baq-studio-intro {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 18px;
  background: rgba(22, 93, 111, 0.18);
  border: 1px solid rgba(22, 93, 111, 0.35);
  border-radius: 14px;
  color: #F4E6C1;
  font-size: 13px;
  line-height: 1.5;
}

.baq-studio-intro i {
  color: #F65E01;
  font-size: 20px;
  margin-top: 3px;
}

.baq-studio-intro strong {
  display: block;
  font-size: 14px;
  color: #FFFFFF;
  margin-bottom: 2px;
}

.baq-studio-intro p {
  margin: 0;
  color: #CBD5E1;
}

.baq-studio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 16px;
}

.baq-studio-card {
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.baq-studio-card-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.baq-studio-icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-size: 15px;
}

.baq-studio-card-head h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #FFFFFF;
}

.baq-studio-card-head p {
  margin: 2px 0 0;
  font-size: 11px;
  color: #94A3B8;
}

.baq-studio-swatches-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.studio-swatch-chip {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--c);
  border: 2px solid rgba(255, 255, 255, 0.25);
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, border-color 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.studio-swatch-chip:hover {
  transform: scale(1.22);
  border-color: #F65E01;
  box-shadow: 0 4px 14px rgba(246, 94, 1, 0.5);
}

.baq-studio-picker-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 12px;
  color: #CBD5E1;
}

.baq-color-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: monospace;
  font-size: 12px;
  color: #F4E6C1;
}

.baq-color-input-wrap input[type="color"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 36px;
  height: 28px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.baq-color-input-wrap input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

.baq-color-input-wrap input[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: 6px;
}

.baq-slider-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.baq-slider-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #94A3B8;
}

.baq-slider-labels strong {
  color: #F65E01;
  font-size: 13px;
}

.baq-range-slider {
  width: 100%;
  accent-color: #F65E01;
  cursor: pointer;
}

.baq-studio-preview-box {
  background-color: var(--section-bg-color, #080D1A);
  border: 1px solid rgba(246, 94, 1, 0.35);
  border-radius: 16px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
}

.baq-preview-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--section-accent-color, #F65E01);
  margin-bottom: 8px;
}

.baq-preview-title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 800;
  color: var(--section-title-color, #FFFFFF);
  transition: color 0.2s ease;
}

.baq-preview-desc {
  margin: 0;
  font-size: 13px;
  color: var(--section-text-color, #E2E8F0);
  line-height: 1.6;
  max-width: 650px;
  transition: color 0.2s ease;
}
`;

if (!cssContent.includes('.baq-theme-modal-nav-tabs')) {
  cssContent += '\n' + studioCss;
  fs.writeFileSync(cssPath, cssContent, 'utf8');
  console.log('✅ website/css/theme-switcher.css actualizado con estilos de Color Studio.');
} else {
  console.log('ℹ️ theme-switcher.css ya contenía estilos de Color Studio.');
}
