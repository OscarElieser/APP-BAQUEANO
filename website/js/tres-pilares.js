/**
 * ============================================================================
 * 🧭 BAQUEANO ECOSYSTEM — TRES PILARES CENTRALES (tres-pilares.js)
 * ============================================================================
 *
 * 🎯 1. POR QUÉ (WHY / PROPÓSITO):
 * - Materializar los tres conceptos que convierten a BAQUEANO en algo diferente
 *   a cualquier plataforma turística:
 *   PILAR 1 — "¿Qué querés vivir?" — Búsqueda por experiencia emocional
 *   PILAR 2 — "Lo que no sale en el mapa" — Toggle hidden_gem funcional
 *   PILAR 3 — BAQUEANO Digital como guía territorial real
 *
 * ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
 * - Módulo auto-inicializado con IIFE (Immediately Invoked Function Expression).
 * - Persiste estado de hidden_gem en localStorage para consistencia cross-page.
 * - Emite eventos custom (baqueano:vivir-selected, baqueano:hidden-gem-toggled)
 *   para que otros módulos (destinos, mapa, IA) reaccionen.
 * - API pública expuesta en window.BaqueanoPilares.
 * - Cero dependencias externas; se conecta con los datos existentes.
 *
 * 📦 3. QUÉ (WHAT / FUNCIONALIDAD & ENTREGABLES):
 * - initVivirSelector() — Interactividad del selector experiencial.
 * - initHiddenGemToggle() — Toggle y persistencia del modo "Lo que no sale en el mapa".
 * - initBaquiGuide() — Evolución de la card de Baqüi con prompt contextual.
 * - API pública: isHiddenGemActive(), getSelectedVivencia(), setHiddenGem(bool).
 * ============================================================================
 */
"use strict";

(function () {
  /* ═══════════════════════════════════════════════════════════════════════════
     CONSTANTES Y CONFIGURACIÓN
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * Clave de localStorage para persistir el estado del modo hidden_gem
   * entre sesiones y páginas del sitio.
   */
  var STORAGE_KEY_HIDDEN_GEM = "baqueano_hidden_gem_active";

  /**
   * Clave de localStorage para recordar la última vivencia seleccionada.
   */
  var STORAGE_KEY_VIVENCIA = "baqueano_vivencia_selected";

  /**
   * Catálogo de vivencias emocionales.
   * Cada opción mapea a categorías del catálogo territorial de BAQUEANO.
   * Se utiliza para redirigir o filtrar contenido en destinos.html y en la IA.
   */
  var VIVENCIAS = [
    { id: "aventura",     icon: "fa-solid fa-person-hiking",    label: "Aventura",       color: "#E54D00", categories: ["volcanes", "aventura", "senderismo"] },
    { id: "naturaleza",   icon: "fa-solid fa-leaf",             label: "Naturaleza",     color: "#4A7A5A", categories: ["naturaleza", "rios", "reservas"] },
    { id: "cultura",      icon: "fa-solid fa-masks-theater",    label: "Cultura",        color: "#8B5CF6", categories: ["cultura", "museos", "patrimonio"] },
    { id: "descanso",     icon: "fa-solid fa-umbrella-beach",   label: "Descanso",       color: "#06B6D4", categories: ["playas", "hospedaje"] },
    { id: "historia",     icon: "fa-solid fa-scroll",           label: "Historia",       color: "#A16207", categories: ["historia", "patrimonio", "arqueologia"] },
    { id: "gastronomia",  icon: "fa-solid fa-utensils",         label: "Gastronomía",    color: "#DC2626", categories: ["gastronomia"] },
    { id: "comunidades",  icon: "fa-solid fa-people-group",     label: "Comunidades",    color: "#165D6F", categories: ["comunitario", "cooperativas"] },
    { id: "romance",      icon: "fa-solid fa-heart",            label: "Romance",        color: "#EC4899", categories: ["playas", "hospedaje", "gastronomia"] },
    { id: "familia",      icon: "fa-solid fa-children",         label: "Familia",        color: "#F59E0B", categories: ["naturaleza", "playas", "cultura"] },
    { id: "algo-diferente", icon: "fa-solid fa-gem",            label: "Algo diferente", color: "#F65E01", categories: ["hidden_gem"] }
  ];


  /* ═══════════════════════════════════════════════════════════════════════════
     PILAR 1 — "¿QUÉ QUERÉS VIVIR?"
     Selector experiencial que invita a elegir una emoción antes que un destino.
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * Inicializa la interactividad del selector experiencial.
   * Cada opción de vivencia al hacer clic:
   * 1. Activa su estado visual (.is-active).
   * 2. Persiste la elección en localStorage.
   * 3. Emite evento custom para que otros módulos reaccionen.
   * 4. Si "algo diferente" se selecciona, activa automáticamente hidden_gem.
   */
  function initVivirSelector() {
    var container = document.querySelector("[data-vivir-grid]");
    if (!container) return;

    var options = container.querySelectorAll(".vivir-option");
    if (!options.length) return;

    // Restaurar última selección si existe
    var saved = localStorage.getItem(STORAGE_KEY_VIVENCIA);

    options.forEach(function (opt) {
      var vivenciaId = opt.getAttribute("data-vivencia");

      // Restaurar estado visual
      if (saved && vivenciaId === saved) {
        opt.classList.add("is-active");
      }

      // Listener de clic
      opt.addEventListener("click", function (e) {
        e.preventDefault();

        // Desactivar todas las opciones
        options.forEach(function (o) { o.classList.remove("is-active"); });

        // Activar la seleccionada
        opt.classList.add("is-active");

        // Persistir la elección
        localStorage.setItem(STORAGE_KEY_VIVENCIA, vivenciaId);

        // Si "algo diferente" fue seleccionado, activar hidden_gem automáticamente
        if (vivenciaId === "algo-diferente") {
          setHiddenGem(true);
        }

        // Emitir evento custom para otros módulos (destinos, mapa, IA)
        var vivenciaData = VIVENCIAS.find(function (v) { return v.id === vivenciaId; });
        document.dispatchEvent(new CustomEvent("baqueano:vivir-selected", {
          detail: {
            id: vivenciaId,
            label: vivenciaData ? vivenciaData.label : vivenciaId,
            categories: vivenciaData ? vivenciaData.categories : []
          }
        }));

        // Scroll suave hacia la sección de destinos para mostrar resultados
        var destinos = document.getElementById("destinosInspiran");
        if (destinos) {
          setTimeout(function () {
            destinos.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 300);
        }
      });

      // Accesibilidad: activar con Enter o Space
      opt.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          opt.click();
        }
      });
    });
  }


  /* ═══════════════════════════════════════════════════════════════════════════
     PILAR 2 — "LO QUE NO SALE EN EL MAPA" (TOGGLE FUNCIONAL)
     Convierte el eslogan en un interruptor real que cambia las recomendaciones.
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * Inicializa el toggle funcional de hidden_gem.
   * Al activarse:
   * 1. Persiste en localStorage.
   * 2. Añade atributo data-hidden-gem="true" al <body> para que el CSS global reaccione.
   * 3. Emite evento custom "baqueano:hidden-gem-toggled".
   * 4. Actualiza el contador visual de hidden gems disponibles.
   */
  function initHiddenGemToggle() {
    var toggle = document.getElementById("hiddenGemToggle");
    var bar = document.querySelector(".hidden-gem-bar");
    if (!toggle || !bar) return;

    // Restaurar estado guardado
    var saved = localStorage.getItem(STORAGE_KEY_HIDDEN_GEM) === "true";
    toggle.checked = saved;
    if (saved) {
      bar.classList.add("is-active");
      document.body.setAttribute("data-hidden-gem", "true");
    }

    // Actualizar contador de hidden gems
    updateGemCount(bar);

    // Listener de cambio
    toggle.addEventListener("change", function () {
      var isActive = toggle.checked;

      // Persistir estado
      localStorage.setItem(STORAGE_KEY_HIDDEN_GEM, isActive ? "true" : "false");

      // Estado visual de la barra
      if (isActive) {
        bar.classList.add("is-active");
        document.body.setAttribute("data-hidden-gem", "true");
      } else {
        bar.classList.remove("is-active");
        document.body.removeAttribute("data-hidden-gem");
      }

      // Emitir evento para otros módulos (mapa, destinos, IA, recomendaciones)
      document.dispatchEvent(new CustomEvent("baqueano:hidden-gem-toggled", {
        detail: { active: isActive }
      }));

      // Feedback háptico sutil si el navegador lo soporta
      if (isActive && navigator.vibrate) {
        try { navigator.vibrate(50); } catch (_) { /* silencioso */ }
      }
    });
  }

  /**
   * Actualiza el contador visual de hidden gems disponibles.
   * @param {HTMLElement} bar — Contenedor .hidden-gem-bar.
   */
  function updateGemCount(bar) {
    var countEl = bar ? bar.querySelector(".hidden-gem-count") : null;
    if (!countEl) return;

    // Conteo basado en datos disponibles en el catálogo maestro o datos estáticos conocidos
    // (cuando Supabase esté conectado, esto se reemplaza por un count real)
    var count = 0;

    // Intentar leer del catálogo maestro si existe
    if (window.BAQUEANO_MASTER_CATALOG) {
      var catalog = window.BAQUEANO_MASTER_CATALOG;
      if (Array.isArray(catalog)) {
        count = catalog.filter(function (item) { return item.hidden_gem === true; }).length;
      }
    }

    // Si no hay catálogo, usar conteo base conocido de la plataforma
    if (count === 0) {
      // Estimado conservador basado en destinos y negocios ya conocidos
      count = 12;
    }

    countEl.textContent = count;
  }


  /* ═══════════════════════════════════════════════════════════════════════════
     PILAR 3 — BAQUEANO DIGITAL COMO GUÍA TERRITORIAL REAL
     Evoluciona la card de Baqüi añadiendo prompt contextual y señales de
     que es un guía capaz de responder: qué conocer, cómo llegar, cuánto
     gastar, quién te recibe, la historia, dónde comer, dormir y qué hay cerca.
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * Inicializa la evolución de la card de Baqüi.
   * Añade la clase evolucionada, el indicador de estado, las etiquetas
   * de capacidades y el área de prompt contextual.
   */
  function initBaquiGuide() {
    var card = document.getElementById("baqueanoDigitalCard");
    if (!card) return;

    // Añadir clase evolucionada sin destruir la existente
    card.classList.add("baqui-guide-evolved");

    // Inyectar indicador de estado "Guía activo" antes del título
    var titleRow = card.querySelector(".ai-title-row");
    if (titleRow && !card.querySelector(".baqui-status-indicator")) {
      var statusIndicator = document.createElement("div");
      statusIndicator.className = "baqui-status-indicator";
      statusIndicator.innerHTML =
        '<span class="baqui-status-dot"></span>' +
        '<span class="baqui-status-text">Guía activo</span>';
      titleRow.parentNode.insertBefore(statusIndicator, titleRow);
    }

    // Inyectar etiquetas de capacidades territoriales después de la descripción
    var descText = card.querySelector(".ai-desc-text");
    if (descText && !card.querySelector(".baqui-capabilities")) {
      var caps = document.createElement("div");
      caps.className = "baqui-capabilities";
      caps.innerHTML = [
        '<span class="baqui-cap-tag"><i class="fa-solid fa-route"></i> Rutas</span>',
        '<span class="baqui-cap-tag"><i class="fa-solid fa-coins"></i> Precios</span>',
        '<span class="baqui-cap-tag"><i class="fa-solid fa-utensils"></i> Comida</span>',
        '<span class="baqui-cap-tag"><i class="fa-solid fa-bed"></i> Hospedaje</span>',
        '<span class="baqui-cap-tag"><i class="fa-solid fa-book-open"></i> Historia</span>',
        '<span class="baqui-cap-tag"><i class="fa-solid fa-location-dot"></i> Cercanía</span>',
        '<span class="baqui-cap-tag"><i class="fa-solid fa-users"></i> Anfitriones</span>'
      ].join("");
      descText.parentNode.insertBefore(caps, descText.nextSibling);
    }

    // Inyectar área de prompt contextual al final de la card
    var contentSide = card.querySelector(".ai-content-side");
    if (contentSide && !card.querySelector(".baqui-prompt-area")) {
      var promptArea = document.createElement("a");
      promptArea.className = "baqui-prompt-area";
      promptArea.href = "baqueano-ai.html?prompt=contame-que-queres-vivir";
      promptArea.setAttribute("aria-label", "Contale a Baqüi qué querés vivir");
      promptArea.innerHTML =
        '<span class="baqui-prompt-placeholder">Contame qué querés vivir...</span>' +
        '<span class="baqui-prompt-send" aria-hidden="true"><i class="fa-solid fa-paper-plane"></i></span>';
      contentSide.appendChild(promptArea);
    }

    // Actualizar el texto descriptivo para reflejar guía territorial real
    if (descText) {
      descText.textContent = "Tu guía territorial. Te digo qué conocer, cómo llegar, cuánto podés gastar, quién te recibe y cómo armar tu viaje.";
    }
  }


  /* ═══════════════════════════════════════════════════════════════════════════
     API PÚBLICA Y UTILIDADES
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * Verifica si el modo "Lo que no sale en el mapa" está activo.
   * @returns {boolean}
   */
  function isHiddenGemActive() {
    return localStorage.getItem(STORAGE_KEY_HIDDEN_GEM) === "true";
  }

  /**
   * Obtiene la vivencia emocional seleccionada actualmente.
   * @returns {string|null}
   */
  function getSelectedVivencia() {
    return localStorage.getItem(STORAGE_KEY_VIVENCIA) || null;
  }

  /**
   * Establece programáticamente el estado del modo hidden_gem.
   * Útil para que otros módulos lo activen (e.g. el selector "algo diferente").
   * @param {boolean} active — true para activar, false para desactivar.
   */
  function setHiddenGem(active) {
    var toggle = document.getElementById("hiddenGemToggle");
    var bar = document.querySelector(".hidden-gem-bar");

    localStorage.setItem(STORAGE_KEY_HIDDEN_GEM, active ? "true" : "false");

    if (toggle) {
      toggle.checked = active;
    }

    if (bar) {
      if (active) {
        bar.classList.add("is-active");
        document.body.setAttribute("data-hidden-gem", "true");
      } else {
        bar.classList.remove("is-active");
        document.body.removeAttribute("data-hidden-gem");
      }
    }

    // Emitir evento
    document.dispatchEvent(new CustomEvent("baqueano:hidden-gem-toggled", {
      detail: { active: active }
    }));
  }


  /* ═══════════════════════════════════════════════════════════════════════════
     INICIALIZACIÓN
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * Inicializa los tres pilares cuando el DOM está listo.
   * Se ejecuta con DOMContentLoaded para no bloquear la carga.
   */
  function init() {
    initVivirSelector();
    initHiddenGemToggle();
    initBaquiGuide();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Exponer API pública
  window.BaqueanoPilares = {
    isHiddenGemActive: isHiddenGemActive,
    getSelectedVivencia: getSelectedVivencia,
    setHiddenGem: setHiddenGem,
    VIVENCIAS: VIVENCIAS
  };

})();
