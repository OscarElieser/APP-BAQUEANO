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
// - Botón flotante compacto (FAB) en la esquina inferior derecha con avatar nica.
// - Drawer conversacional que permanece cerrado hasta que el usuario lo abre.
// - Interfaz dialógica contextual con opciones rápidas y enfoque de cámara en el Mapa 3D.
//
// 📦 3. QUÉ (WHAT / COMPONENTES EXPUESTOS):
// - window.BaqueanoAssistant:
//   * toggle(): Abre o cierra el drawer del asistente.
//   * handleAction(actionKey): Responde a las consultas del usuario.
// ============================================================================

(function(window, document) {
  'use strict';

  const RESPONSES = {
    budget: {
      bot: '💰 <strong>Presupuestos Justos sin Intermediarios:</strong><br><br>' +
           '• <strong>Económico Campesino (C$ 350 - 650/día):</strong> Monumento Nacional Cañón de Somoto, Volcán Masaya diurno, comedores de Doña Chepita.<br>' +
           '• <strong>Equilibrado Confort (C$ 1,200 - 1,800/día):</strong> Posadas campesinas en Ometepe, Volcano Sandboarding en Cerro Negro, Reserva Tisey-La Estanzuela.<br>' +
           '• <strong>Todo Incluido Comunitario (C$ 2,500+/día):</strong> Fincas cafetaleras de Matagalpa, expediciones en Río San Juan y Corn Island.',
      focus: 'pacifico'
    },
    days: {
      bot: '🗓️ <strong>Rutas Recomendadas por Tiempo:</strong><br><br>' +
           '• <strong>1 Día (Day Pass):</strong> Laguna de Apoyo + Volcán Masaya.<br>' +
           '• <strong>3 Días (Fin de Semana):</strong> Ruta Colonial & Volcánica (León → Cerro Negro → Granada → Mombacho).<br>' +
           '• <strong>5 Días (Ruta Clásica):</strong> Managua → Matagalpa (Selva Negra) → Madriz (Cañón de Somoto) → León.<br>' +
           '• <strong>7+ Días (Gran Aventura):</strong> Expedición Pacífico, Centro y Corn Island.',
      focus: 'centro'
    },
    green: {
      bot: '🌿 <strong>Decálogo Verde del Explorador Baqueano:</strong><br><br>' +
           '1. <strong>Cero Plásticos:</strong> Lleva cantimplora reutilizable a todos los senderos.<br>' +
           '2. <strong>No Extracción:</strong> No toques flora, orquídeas ni piedras volcánicas.<br>' +
           '3. <strong>Trato Justo:</strong> Paga tarifas completas a los guías campesinos locales.<br>' +
           '4. <strong>Senderos Oficiales:</strong> No abras trochas clandestinas que erosionen el suelo.',
      focus: 'todos'
    },
    hidden: {
      bot: '💎 <strong>Joyas Ocultas de Nicaragua:</strong><br><br>' +
           '• <strong>Cascada La Luna (Jinotega):</strong> Salto virgen escondido en la nebliselva de El Cuá.<br>' +
           '• <strong>Cerámica de Mozonte (Nueva Segovia):</strong> Artesanas campesinas de barro ancestral.<br>' +
           '• <strong>Macizo de Peñas Blancas (Matagalpa):</strong> Murallones de roca viva y nacientes de agua pura.',
      focus: 'centro'
    },
    map: {
      bot: '🗺️ <strong>¡Enfocando el territorio!</strong><br><br>He ajustado la perspectiva del <strong>Mapa Vivo 3D</strong>. Puedes tocar cualquier volcán o laguna para conocer los datos de las cooperativas locales.',
      focus: 'todos'
    }
  };

  const BaqueanoAssistant = {
    isOpen: false,

    init() {
      const fabBtn = document.getElementById('assistantFabBtn');
      const closeBtn = document.getElementById('btnCloseAssistant');
      const drawer = document.getElementById('assistantChatDrawer');

      if (fabBtn) {
        fabBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggle();
        });
      }

      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.close();
        });
      }

      // Cerrar al hacer clic afuera del drawer
      document.addEventListener('click', (e) => {
        const widget = document.getElementById('baqueanoAssistantBox');
        if (this.isOpen && widget && !widget.contains(e.target)) {
          this.close();
        }
      });

      // Conectar chips de opciones rápidas
      const promptChips = document.querySelectorAll('#assistantQuickPrompts .prompt-chip');
      promptChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = chip.getAttribute('data-action');
          this.handleAction(action);
        });
      });
    },

    toggle() {
      this.isOpen = !this.isOpen;
      const drawer = document.getElementById('assistantChatDrawer');
      if (drawer) {
        drawer.classList.toggle('is-open', this.isOpen);
      }
    },

    open() {
      this.isOpen = true;
      const drawer = document.getElementById('assistantChatDrawer');
      if (drawer) drawer.classList.add('is-open');
    },

    close() {
      this.isOpen = false;
      const drawer = document.getElementById('assistantChatDrawer');
      if (drawer) drawer.classList.remove('is-open');
    },

    handleAction(actionKey) {
      const resp = RESPONSES[actionKey];
      if (!resp) return;

      const body = document.getElementById('assistantMessagesBody');
      if (body) {
        // Mensaje de respuesta del guía
        const msgEl = document.createElement('div');
        msgEl.className = 'assistant-msg assistant-msg-bot';
        msgEl.innerHTML = `<p>${resp.bot}</p>`;
        body.appendChild(msgEl);
        body.scrollTop = body.scrollHeight;
      }

      // Mover cámara del Mapa 3D si aplica
      if (resp.focus && window.Baqueano3DMap && typeof window.Baqueano3DMap.filterRegion === 'function') {
        window.Baqueano3DMap.filterRegion(resp.focus);
      }
    }
  };

  window.BaqueanoAssistant = BaqueanoAssistant;

  function bootAssistant() {
    if (document.getElementById('baqueanoAssistantBox')) {
      BaqueanoAssistant.init();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootAssistant);
  } else {
    setTimeout(bootAssistant, 50);
  }

})(window, document);
