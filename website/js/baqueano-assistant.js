// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — ASISTENTE DIGITAL GUÍA ("EL GUARDABARRANCO BAQUEANO")
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Servir como el guía nativo y anfitrión inteligente que acompaña al explorador
//   a través del territorio nicaragüense, preservando la voz y valores campesinos.
// - Recomendar destinos y cooperativas según presupuesto, condición física y clima,
//   explicar normas de conservación del decálogo verde y resaltar sitios poco conocidos.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Widget flotante interactivo con animación suave y avatar estilizado de Guardabarranco.
// - Interfaz dialógica contextual con árboles de decisión temáticos rápidos.
// - Integración con el Mapa Vivo 3D para enfocar y marcar los territorios recomendados.
//
// 📦 3. QUÉ (WHAT / COMPONENTES EXPUESTOS):
// - window.BaqueanoAssistant:
//   * toggleWidget(): Abre o minimiza el asistente en pantalla.
//   * askOption(optionKey): Procesa la respuesta del usuario y entrega recomendaciones.
// ============================================================================

(function(window, document) {
  'use strict';

  const DIALOG_TREE = {
    start: {
      message: '¡Hola, explorador! Soy tu Baqueano Digital, guardián de los senderos de Nicaragua. ¿En qué te puedo orientar hoy?',
      options: [
        { label: '🏔️ Recomiéndame una ruta por presupuesto', next: 'budget' },
        { label: '🌿 ¿Cuáles son las normas ambientales de sendero?', next: 'eco_rules' },
        { label: '💎 Lugares poco conocidos y mágicos', next: 'hidden_gems' },
        { label: '🗺️ Trazar aventura personalizada', next: 'goto_builder' }
      ]
    },
    budget: {
      message: '¿Cuál es tu presupuesto aproximado por día de viaje?',
      options: [
        { label: 'Económico Campesino (C$ 500 - 800)', next: 'budget_low' },
        { label: 'Aventura Intermedia (C$ 1,000 - 1,800)', next: 'budget_mid' },
        { label: 'Experiencia Integral (C$ 2,000+)', next: 'budget_high' }
      ]
    },
    budget_low: {
      message: 'Para presupuesto económico campesino te recomiendo:\n\n1. Monumento Nacional Cañón de Somoto (Madriz): Entrada MARENA accesible y guías locales campesinos.\n2. Volcán Masaya: Entrada diurna nacional C$ 50.\n3. Isletas de Granada: Recorrido en lancha comunitaria.\n\n¿Deseas ver estos puntos en el Mapa 3D?',
      options: [
        { label: '🧭 Enfocar Cañón de Somoto en Mapa 3D', action: () => focusMap('madriz') },
        { label: '🌋 Enfocar Volcán Masaya en Mapa 3D', action: () => focusMap('masaya') },
        { label: 'Volver al inicio', next: 'start' }
      ]
    },
    budget_mid: {
      message: 'Excelente. Con este presupuesto puedes disfrutar de:\n\n1. Volcán Cerro Negro (León): Volcano Sandboarding con los guías de Los Maribios.\n2. Isla de Ometepe (Rivas): Cabañas ecológicas en Finca Magdalena y ascenso al Maderas.\n3. Selva Negra (Matagalpa): Senderismo en nebliselva y cata de café orgánico.',
      options: [
        { label: '🌋 Enfocar Cerro Negro en Mapa 3D', action: () => focusMap('leon') },
        { label: '🏝️ Enfocar Ometepe en Mapa 3D', action: () => focusMap('rivas') },
        { label: 'Volver al inicio', next: 'start' }
      ]
    },
    budget_high: {
      message: 'Con presupuesto integral te sugiero la Travesía de Dos Océanos:\n\n1. Hospedaje en Posada La Abuela (Laguna de Apoyo).\n2. Corn Island & Little Corn: Arrecifes vírgenes y langosta fresca.\n3. San Juan del Sur & Refugio La Flor (anidación de tortugas paslama).',
      options: [
        { label: '🌊 Enfocar Corn Island en Mapa 3D', action: () => focusMap('caribe_sur') },
        { label: 'Volver al inicio', next: 'start' }
      ]
    },
    eco_rules: {
      message: '📜 DECÁLOGO VERDE BAQUEANO:\n\n1. Lo que lleves a la montaña, tráelo de vuelta (Basura Cero).\n2. Prohibido extraer orquídeas, arena volcánica o molestar fauna.\n3. Respeta las fuentes de agua dulce: cero jabones no biodegradables.\n4. Consume directamente a familias y cooperativas locales.',
      options: [
        { label: 'Leer Decálogo Verde Completo', action: () => window.location.href = 'ambiental.html' },
        { label: 'Entendido, volver', next: 'start' }
      ]
    },
    hidden_gems: {
      message: '✨ TESOROS POCO CONOCIDOS:\n\n• Cascada La Luna en El Cuá (Jinotega): Caída de agua entre brumas.\n• Finca Magdalena (Ometepe): Petroglifos sagrados entre cafetales.\n• Laguna de Apoyo: Cráter volcánico termal sin ruido de motores.\n\n¿Cuál deseas explorar en 3D?',
      options: [
        { label: '🌊 Ver Cascada La Luna en Mapa 3D', action: () => focusMap('jinotega') },
        { label: 'Volver al menú', next: 'start' }
      ]
    },
    goto_builder: {
      message: '¡Excelente decisión! Te llevo directo al diseñador "Construye tu Aventura" para calcular días, presupuesto e itinerario.',
      options: [
        { label: 'Ir al Diseñador de Rutas', action: () => scrollToSection('routeBuilderSection') },
        { label: 'Volver al menú', next: 'start' }
      ]
    }
  };

  function focusMap(territoryKey) {
    const mapSection = document.getElementById('mapaVivo3DNicaragua');
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth' });
    }
    if (window.Baqueano3DMap) {
      setTimeout(() => {
        window.Baqueano3DMap.openDetailDrawer(territoryKey);
      }, 500);
    }
  }

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  const BaqueanoAssistant = {
    isOpen: false,

    init() {
      const toggleBtn = document.getElementById('btnBaqueanoAssistantToggle');
      const closeBtn = document.getElementById('btnAssistantClose');

      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => this.toggleWidget());
      }
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.closeWidget());
      }

      this.renderStep('start');
    },

    toggleWidget() {
      this.isOpen = !this.isOpen;
      const widget = document.getElementById('baqueanoAssistantBox');
      if (widget) {
        widget.classList.toggle('is-open', this.isOpen);
      }
    },

    closeWidget() {
      this.isOpen = false;
      const widget = document.getElementById('baqueanoAssistantBox');
      if (widget) widget.classList.remove('is-open');
    },

    renderStep(stepKey) {
      const step = DIALOG_TREE[stepKey];
      if (!step) return;

      const chatBody = document.getElementById('assistantChatBody');
      const optionsWrap = document.getElementById('assistantOptionsWrap');

      if (chatBody) {
        chatBody.innerHTML = `
          <div class="assistant-msg-bubble" style="background: rgba(22, 93, 111, 0.45); border: 1px solid rgba(244, 230, 193, 0.2); border-radius: 12px; padding: 0.85rem 1rem; color: #FFFFFF; font-size: 0.84rem; line-height: 1.55; white-space: pre-line;">
            ${step.message}
          </div>
        `;
      }

      if (optionsWrap) {
        optionsWrap.innerHTML = step.options.map((opt, idx) => `
          <button type="button" class="assistant-option-btn" data-index="${idx}" style="display: block; width: 100%; text-align: left; background: rgba(8, 13, 26, 0.8); border: 1px solid rgba(244, 230, 193, 0.25); color: #F4E6C1; border-radius: 8px; padding: 0.6rem 0.85rem; font-size: 0.78rem; font-weight: 500; margin-bottom: 0.4rem; cursor: pointer; transition: all 0.2s ease;">
            ${opt.label}
          </button>
        `).join('');

        optionsWrap.querySelectorAll('.assistant-option-btn').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.getAttribute('data-index'), 10);
            const chosen = step.options[idx];
            if (chosen) {
              if (typeof chosen.action === 'function') {
                chosen.action();
              }
              if (chosen.next) {
                this.renderStep(chosen.next);
              }
            }
          });
        });
      }
    }
  };

  window.BaqueanoAssistant = BaqueanoAssistant;

  document.addEventListener('DOMContentLoaded', () => {
    BaqueanoAssistant.init();
  });

})(window, document);
