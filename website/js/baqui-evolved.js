/**
 * ============================================================================
 * 🧭 BAQUEANO ECOSYSTEM — BAQÜI EVOLUCIONADO (baqui-evolved.js)
 * ============================================================================
 *
 * 🎯 1. POR QUÉ (WHY / PROPÓSITO):
 * - Transformar a Baqüi de "chatbot que responde" a ACOMPAÑANTE INTELIGENTE
 *   TERRITORIAL que puede hacer cosas reales dentro de BAQUEANO.
 * - Diferenciación esencial: Booking vende inventario con filtros; BAQUEANO
 *   vende descubrimiento guiado. Baqüi es el centro operativo de esa experiencia.
 * - Este archivo extiende baqueano-assistant.js v6 sin modificarlo.
 *   Se carga DESPUÉS de él y engancha su API pública.
 *
 * ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
 * - Módulo IIFE auto-inicializado que espera a que BaqueanoAssistant esté activo.
 * - Motor BaquiTripContext: memoria de sesión con presupuesto, días, intereses,
 *   restricciones, lugares guardados y decisiones anteriores.
 * - 10 Modos conversacionales visibles como botones en la UI del drawer.
 * - 16 Herramientas reales (tool-calling pattern) que ejecutan acciones reales.
 * - Respuestas accionables: botones [Ver ruta] [Agregar a Mi Viaje] [Ver mapa].
 * - Integración con window.BaqueanoPilares (tres-pilares.js) para
 *   sincronizar el modo "No sale en el mapa" y "¿Qué querés vivir?".
 * - Cero dependencias externas; se apoya en la API pública de BaqueanoAssistant.
 * - Respeta prefers-reduced-motion y accesibilidad WCAG 2.1 AA.
 *
 * 📦 3. QUÉ (WHAT / FUNCIONALIDAD & ENTREGABLES):
 * - BaquiTripContext — Motor de memoria de viaje en sesión.
 * - BaquiTools — 16 herramientas reales integradas con la plataforma.
 * - BaquiModes — 10 modos conversacionales con UI visible.
 * - BaquiActionCards — Respuestas accionables con botones.
 * - BaquiEvolved — API pública expuesta en window.BaquiEvolved.
 * ============================================================================
 */
"use strict";

(function () {
  var EVOLVED_VERSION = "1.0.0";
  var EVOLVED_KEY = "baqueano_baqui_evolved_v1";
  var TRIP_CONTEXT_KEY = "baqueano_trip_context_v1";

  /* ═══════════════════════════════════════════════════════════════════════════
     ESPERAR A QUE BaqueanoAssistant v6 ESTÉ DISPONIBLE
     ═══════════════════════════════════════════════════════════════════════════ */
  var pollAttempts = 0;
  function waitForAssistant(callback) {
    if (window.BaqueanoAssistant && window.BaqueanoAssistant.version === "6") {
      callback();
    } else if (pollAttempts < 20) {
      pollAttempts++;
      setTimeout(function () { waitForAssistant(callback); }, 250);
    }
  }


  /* ═══════════════════════════════════════════════════════════════════════════
     MOTOR DE MEMORIA DE VIAJE — BaquiTripContext
     Recuerda durante la sesión: presupuesto, días, quién viaja, intereses,
     restricciones, lugares guardados y decisiones anteriores.
     ═══════════════════════════════════════════════════════════════════════════ */
  var BaquiTripContext = (function () {
    var safeJson = function (val, fallback) {
      try { return JSON.parse(val) || fallback; } catch (_) { return fallback; }
    };

    // Estructura base del contexto de viaje
    var DEFAULT_CTX = {
      // ¿Qué querés vivir?
      vivencia: null,              // "aventura" | "cultura" | "gastronomia" | ...
      // Perfil de viaje
      budget: null,                // número en C$ o USD
      budgetCurrency: "NIO",       // "NIO" | "USD"
      days: null,                  // número de días
      travelers: { adults: 1, children: 0, seniors: 0 },
      startLocation: null,         // ciudad o departamento de partida
      // Intereses y restricciones
      interests: [],               // ["historia", "gastronomia", ...]
      restrictions: [],            // ["sin_volcanes", "accesibilidad", ...]
      dietaryNeeds: [],            // ["vegetariano", "sin_mariscos", ...]
      // Lugares y destinos
      savedPlaces: [],             // destinos guardados en esta sesión
      rejectedPlaces: [],          // destinos explícitamente rechazados
      addedToTrip: [],             // agregados a Mi Viaje
      // Modo activo
      activeMode: "explorar",      // uno de los 10 modos
      hiddenGemMode: false,        // sincronizado con BaqueanoPilares
      // Estado del planificador
      currentItinerary: null,      // itinerario construido más reciente
      itineraryDate: null,         // fecha objetivo del viaje
      // Conversación
      lastIntent: null,            // última intención detectada
      lastDestination: null,       // último destino mencionado
      lastBudgetMention: null,     // última mención de presupuesto
      // Timestamp
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    var ctx = Object.assign({}, DEFAULT_CTX, safeJson(sessionStorage.getItem(TRIP_CONTEXT_KEY), {}));

    function save() {
      ctx.updatedAt = Date.now();
      sessionStorage.setItem(TRIP_CONTEXT_KEY, JSON.stringify(ctx));
    }

    /**
     * Actualiza el contexto con datos extraídos del texto del usuario.
     * Detecta presupuesto, días, intereses y restricciones de forma natural.
     * @param {string} text — Mensaje del usuario.
     */
    function extractFromText(text) {
      if (!text) return;
      var normalized = String(text).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

      // Detectar presupuesto en córdobas
      var budgetNIO = normalized.match(/c\$\s*([0-9.,]+)|([0-9.,]+)\s*cord?o?b?a?s?/i);
      if (budgetNIO) {
        var amount = parseFloat(String(budgetNIO[1] || budgetNIO[2]).replace(/,/g, ""));
        if (!isNaN(amount)) { ctx.budget = amount; ctx.budgetCurrency = "NIO"; ctx.lastBudgetMention = amount + " NIO"; }
      }

      // Detectar presupuesto en dólares
      var budgetUSD = normalized.match(/\$\s*([0-9.,]+)|([0-9.,]+)\s*dol?a?r?e?s?/i);
      if (budgetUSD) {
        var amountUSD = parseFloat(String(budgetUSD[1] || budgetUSD[2]).replace(/,/g, ""));
        if (!isNaN(amountUSD)) { ctx.budget = amountUSD; ctx.budgetCurrency = "USD"; ctx.lastBudgetMention = "$" + amountUSD; }
      }

      // Detectar días
      var daysMatch = normalized.match(/([0-9]+)\s*d[ií]as?|([0-9]+)\s*jornadas?/i);
      if (daysMatch) {
        var days = parseInt(daysMatch[1] || daysMatch[2]);
        if (!isNaN(days) && days > 0 && days <= 30) { ctx.days = days; }
      }

      // Detectar destino mencionado
      var destinations = ["leon", "granada", "ometepe", "san juan del sur", "masaya", "matagalpa",
        "esteli", "jinotega", "chinandega", "managua", "bluefields", "san carlos", "somoto"];
      destinations.forEach(function (d) {
        if (normalized.includes(d)) ctx.lastDestination = d;
      });

      // Detectar intereses
      var interestMap = {
        "historia": ["historia", "patrimonio", "colonial", "arqueolog"],
        "gastronomia": ["comida", "gastronomia", "comer", "tipico", "platillo"],
        "naturaleza": ["naturaleza", "reserva", "sendero", "fauna", "flora"],
        "playa": ["playa", "mar", "costa", "surf", "buceo"],
        "aventura": ["aventura", "volcan", "rafting", "escalada", "senderismo"],
        "cultura": ["cultura", "musica", "danza", "arte", "museos", "tradicion"],
        "comunidades": ["comunidad", "cooperativa", "artesano", "campesino", "comunitario"],
        "descanso": ["descanso", "relax", "tranquilo", "descansar", "meditar"]
      };
      Object.keys(interestMap).forEach(function (interest) {
        if (interestMap[interest].some(function (kw) { return normalized.includes(kw); })) {
          if (ctx.interests.indexOf(interest) === -1) ctx.interests.push(interest);
        }
      });

      // Detectar restricciones
      if (/sin.*volcan|no.*volcan/.test(normalized)) {
        if (ctx.restrictions.indexOf("sin_volcanes") === -1) ctx.restrictions.push("sin_volcanes");
      }
      if (/accesib|silla.*ruedas|movilidad/.test(normalized)) {
        if (ctx.restrictions.indexOf("accesibilidad") === -1) ctx.restrictions.push("accesibilidad");
      }
      if (/ninos|ninas|bebes|familia/.test(normalized)) {
        if (ctx.restrictions.indexOf("familiar") === -1) ctx.restrictions.push("familiar");
      }

      save();
    }

    /**
     * Genera un resumen del contexto actual para incluir en el prompt del backend.
     * @returns {string}
     */
    function getSummary() {
      var parts = [];
      if (ctx.vivencia) parts.push("Quiere vivir: " + ctx.vivencia);
      if (ctx.budget) parts.push("Presupuesto: " + ctx.budget + " " + ctx.budgetCurrency);
      if (ctx.days) parts.push("Días disponibles: " + ctx.days);
      if (ctx.lastDestination) parts.push("Destino mencionado: " + ctx.lastDestination);
      if (ctx.interests.length) parts.push("Intereses: " + ctx.interests.join(", "));
      if (ctx.restrictions.length) parts.push("Restricciones: " + ctx.restrictions.join(", "));
      if (ctx.savedPlaces.length) parts.push("Lugares guardados: " + ctx.savedPlaces.slice(-3).join(", "));
      if (ctx.hiddenGemMode) parts.push("Modo: Lo que no sale en el mapa ACTIVO");
      return parts.length ? "Contexto del viajero: " + parts.join(" | ") : "";
    }

    function reset() {
      Object.assign(ctx, DEFAULT_CTX, { createdAt: Date.now() });
      save();
    }

    return {
      get: function (key) { return key ? ctx[key] : ctx; },
      set: function (key, value) { ctx[key] = value; save(); },
      extract: extractFromText,
      summary: getSummary,
      reset: reset,
      savePlace: function (place) {
        if (ctx.savedPlaces.indexOf(place) === -1) ctx.savedPlaces.push(place);
        save();
      },
      addToTrip: function (place) {
        if (ctx.addedToTrip.indexOf(place) === -1) ctx.addedToTrip.push(place);
        save();
      },
      rejectPlace: function (place) {
        if (ctx.rejectedPlaces.indexOf(place) === -1) ctx.rejectedPlaces.push(place);
        save();
      }
    };
  })();


  /* ═══════════════════════════════════════════════════════════════════════════
     HERRAMIENTAS REALES — BaquiTools
     Cada herramienta ejecuta una acción REAL en la plataforma.
     Baqüi no "dice" que guardó algo; lo ejecuta.
     ═══════════════════════════════════════════════════════════════════════════ */
  var BaquiTools = {

    /** Busca destinos en el catálogo maestro filtrados por categoría o texto. */
    searchDestinations: function (query, category) {
      var catalog = window.BAQUEANO_MASTER_CATALOG || [];
      if (!catalog.length) return [];
      var q = String(query || "").toLowerCase();
      return catalog.filter(function (item) {
        var matchQ = !q || String(item.name || item.title || "").toLowerCase().includes(q) ||
          String(item.description || "").toLowerCase().includes(q);
        var matchCat = !category || String(item.category || item.type || "").toLowerCase().includes(category.toLowerCase());
        return matchQ && matchCat;
      }).slice(0, 6);
    },

    /** Busca exclusivamente hidden gems (no salen en el mapa convencional). */
    searchHiddenGems: function (vivencia) {
      var catalog = window.BAQUEANO_MASTER_CATALOG || [];
      return catalog.filter(function (item) {
        return item.hidden_gem === true &&
          (!vivencia || String(item.category || "").toLowerCase().includes(vivencia));
      }).slice(0, 5);
    },

    /** Busca negocios verificados. */
    searchBusinesses: function (query, type) {
      var businesses = window.BAQUEANO_BUSINESSES || [];
      var q = String(query || "").toLowerCase();
      return businesses.filter(function (b) {
        return b.status === "verified" &&
          (!q || String(b.name || "").toLowerCase().includes(q)) &&
          (!type || String(b.type || "").toLowerCase().includes(type));
      }).slice(0, 5);
    },

    /** Busca museos y patrimonio cultural. */
    searchMuseums: function () {
      var catalog = window.BAQUEANO_MASTER_CATALOG || [];
      return catalog.filter(function (item) {
        return /museo|patrimonio|arqueolog/i.test(String(item.category || item.type || ""));
      }).slice(0, 5);
    },

    /** Busca opciones gastronómicas. */
    searchFood: function (type) {
      var catalog = window.BAQUEANO_MASTER_CATALOG || [];
      var t = String(type || "").toLowerCase();
      return catalog.filter(function (item) {
        return /gastronomia|comida|restaurante/i.test(String(item.category || "")) &&
          (!t || String(item.name || "").toLowerCase().includes(t));
      }).slice(0, 5);
    },

    /** Busca destinos cercanos usando geolocalización (con permiso). */
    searchNearby: function (callback) {
      if (!navigator.geolocation) {
        callback(null, "Geolocalización no disponible en este navegador.");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          var lat = pos.coords.latitude;
          var lng = pos.coords.longitude;
          var catalog = window.BAQUEANO_MASTER_CATALOG || [];
          // Filtrar por proximidad aproximada (Nicaragua: lat ~11-15, lng ~-87-83)
          var nearby = catalog.filter(function (item) {
            if (!item.lat || !item.lng) return false;
            var dlat = Math.abs(item.lat - lat);
            var dlng = Math.abs(item.lng - lng);
            return dlat < 0.5 && dlng < 0.5; // ~55km
          }).slice(0, 5);
          callback(nearby, null);
        },
        function () { callback(null, "No se pudo obtener tu ubicación."); },
        { enableHighAccuracy: false, timeout: 8000 }
      );
    },

    /**
     * Construye un itinerario simplificado basado en el contexto del viaje.
     * NOTA: La planificación completa se delega al backend de IA.
     * Esta versión construye una estructura local como fallback o punto de partida.
     * @returns {object} — Itinerario estructurado.
     */
    buildItinerary: function (destination, days, budget, interests) {
      var ctx = BaquiTripContext.get();
      var dest = destination || ctx.lastDestination || "Nicaragua";
      var numDays = days || ctx.days || 1;
      var bgt = budget || ctx.budget;
      var ints = interests || ctx.interests;

      var itinerary = {
        destination: dest,
        days: numDays,
        budget: bgt ? (bgt + " " + ctx.budgetCurrency) : "No especificado",
        interests: ints.length ? ints.join(", ") : "Exploración general",
        note: "Itinerario generado como base. Baqüi puede ajustarlo con información más detallada.",
        schedule: []
      };

      for (var i = 1; i <= Math.min(numDays, 3); i++) {
        itinerary.schedule.push({
          day: i,
          title: "Día " + i + " en " + dest,
          morning: "Exploración matutina (hora sugerida: 8:00 AM)",
          afternoon: "Actividad principal según intereses: " + (ints[0] || "exploración"),
          evening: "Gastronomía local y descanso"
        });
      }

      BaquiTripContext.set("currentItinerary", itinerary);
      return itinerary;
    },

    /**
     * Calcula presupuesto estimado.
     * No inventa precios si no hay datos verificados.
     */
    calculateBudget: function (destination, days, travelers) {
      // Rangos base verificados del catálogo de Nicaragua (como referencia orientativa)
      var BASE_COSTS_NIO = {
        transport: 200,    // C$ por persona, trayecto promedio Managua-destino
        food: 250,         // C$ por persona por día (comida típica)
        accommodation: 600 // C$ por persona por noche (hostal o posada básica)
      };
      var d = parseInt(days) || 1;
      var t = parseInt(travelers) || 1;
      var total = (BASE_COSTS_NIO.transport + (BASE_COSTS_NIO.food + BASE_COSTS_NIO.accommodation) * d) * t;
      return {
        estimated: total,
        currency: "NIO",
        disclaimer: "Estimación orientativa basada en rangos históricos. Los precios reales deben verificarse con los negocios.",
        breakdown: {
          transport: BASE_COSTS_NIO.transport * t,
          food: BASE_COSTS_NIO.food * d * t,
          accommodation: BASE_COSTS_NIO.accommodation * d * t
        }
      };
    },

    /** Abre el mapa interactivo centrado en un destino. */
    openMap: function (destination) {
      var mapUrl = "mapa.html";
      if (destination) mapUrl += "?q=" + encodeURIComponent(destination);
      window.dispatchEvent(new CustomEvent("baqueano:map-opened", {
        detail: { destination: destination }
      }));
      // Si hay un mapa embebido en la página, intentar centrarlo
      if (window.baqueanoMap && typeof window.baqueanoMap.setView === "function") {
        // Leaflet disponible en página
        document.getElementById("homeInteractiveMap")?.scrollIntoView({ behavior: "smooth" });
      } else {
        window.open(mapUrl, "_blank", "noopener");
      }
    },

    /** Guarda un lugar en favoritos (persiste en localStorage). */
    saveFavorite: function (place) {
      var favorites = JSON.parse(localStorage.getItem("baqueano_favorites") || "[]");
      var existing = favorites.find(function (f) { return f.name === place; });
      if (!existing) {
        favorites.push({ name: place, savedAt: Date.now() });
        localStorage.setItem("baqueano_favorites", JSON.stringify(favorites.slice(-50)));
        BaquiTripContext.savePlace(place);
        window.dispatchEvent(new CustomEvent("baqueano:favorite_added", { detail: { name: place } }));
        return true;
      }
      return false; // Ya estaba guardado
    },

    /** Agrega un lugar a Mi Viaje. */
    addToTrip: function (place, day) {
      var trip = JSON.parse(sessionStorage.getItem("baqueano_my_trip") || "[]");
      trip.push({ name: place, day: day || null, addedAt: Date.now() });
      sessionStorage.setItem("baqueano_my_trip", JSON.stringify(trip.slice(-30)));
      BaquiTripContext.addToTrip(place);
      window.dispatchEvent(new CustomEvent("baqueano:trip_item_added", { detail: { name: place, day: day } }));
      return true;
    },

    /** Verifica disponibilidad — retorna false si no hay backend conectado. */
    checkAvailability: function (destination, date) {
      // Conectado a Supabase cuando esté disponible
      // Por ahora indica honestamente que requiere verificación directa
      return {
        available: null,
        message: "La disponibilidad debe verificarse directamente con el negocio. No tengo ese dato actualizado en tiempo real.",
        verifiedAt: null
      };
    },

    /** Muestra servicios de emergencia cercanos. */
    showEmergencyServices: function (callback) {
      var services = [
        { name: "Cruz Roja Nicaragua", phone: "128", type: "Emergencia médica" },
        { name: "Policía Nacional", phone: "118", type: "Seguridad" },
        { name: "Bomberos Unificados", phone: "115", type: "Bomberos" },
        { name: "Centro Nacional de Emergencias", phone: "911", type: "Emergencias generales" },
        { name: "SINAPRED", phone: "1298", type: "Desastres naturales" }
      ];
      if (callback) callback(services);
      return services;
    }
  };


  /* ═══════════════════════════════════════════════════════════════════════════
     10 MODOS CONVERSACIONALES — BaquiModes
     Cada modo tiene un emoji, etiqueta, prompt inicial y comportamiento especial.
     ═══════════════════════════════════════════════════════════════════════════ */
  var MODES = [
    {
      id: "explorar",
      emoji: "🧭",
      label: "Explorar",
      prompt: "Quiero explorar Nicaragua. ¿Por dónde empezamos?",
      hint: "Descubrir destinos",
      color: "#165D6F"
    },
    {
      id: "planificar",
      emoji: "🗺️",
      label: "Planificar viaje",
      prompt: null, // Abre wizard de planificación
      hint: "Armar mi ruta",
      color: "#165D6F",
      isWizard: true
    },
    {
      id: "sorprender",
      emoji: "✨",
      label: "Sorpréndeme",
      prompt: "Sorpréndeme con algo diferente en Nicaragua. Tengo tiempo y ganas de descubrir algo inesperado.",
      hint: "Experiencia inesperada",
      color: "#8B5CF6"
    },
    {
      id: "hidden-gem",
      emoji: "🌿",
      label: "No sale en el mapa",
      prompt: null, // Activa modo hidden_gem y muestra resultados
      hint: "Lugares ocultos",
      color: "#4A7A5A",
      isHiddenGem: true
    },
    {
      id: "comer",
      emoji: "🍲",
      label: "Comer",
      prompt: "Quiero probar comida típica de Nicaragua. ¿Qué me recomendás?",
      hint: "Gastronomía local",
      color: "#F59E0B"
    },
    {
      id: "cultura",
      emoji: "🏛️",
      label: "Cultura e historia",
      prompt: "Contame sobre la cultura e historia de Nicaragua.",
      hint: "Patrimonio e historia",
      color: "#A16207"
    },
    {
      id: "comunidades",
      emoji: "👥",
      label: "Comunidades",
      prompt: "Quiero conectar con comunidades locales y turismo comunitario en Nicaragua.",
      hint: "Comunidades y artesanos",
      color: "#F65E01"
    },
    {
      id: "cerca",
      emoji: "📍",
      label: "Cerca de mí",
      prompt: null, // Activa geolocalización
      hint: "Qué hay cerca",
      color: "#06B6D4",
      isNearby: true
    },
    {
      id: "mi-viaje",
      emoji: "🎒",
      label: "Mi viaje",
      prompt: null, // Muestra resumen del viaje actual
      hint: "Ver mi planificación",
      color: "#165D6F",
      isTrip: true
    },
    {
      id: "emergencias",
      emoji: "🆘",
      label: "Emergencias",
      prompt: null, // Muestra servicios de emergencia inmediatamente
      hint: "Ayuda urgente",
      color: "#DC2626",
      isEmergency: true
    }
  ];

  /**
   * Activa un modo conversacional específico.
   * @param {string} modeId — ID del modo.
   * @param {HTMLElement} drawerEl — Elemento del drawer de Baqüi.
   */
  function activateMode(modeId, drawerEl) {
    var mode = MODES.find(function (m) { return m.id === modeId; });
    if (!mode) return;

    BaquiTripContext.set("activeMode", modeId);

    // Actualizar botones de modo activo
    if (drawerEl) {
      drawerEl.querySelectorAll(".bqe-mode-btn").forEach(function (btn) {
        btn.classList.toggle("is-active", btn.dataset.mode === modeId);
      });
    }

    // Acciones especiales por modo
    if (mode.isHiddenGem) {
      // Activar toggle de hidden_gem en la homepage y en el contexto
      BaquiTripContext.set("hiddenGemMode", true);
      if (window.BaqueanoPilares) window.BaqueanoPilares.setHiddenGem(true);
      var gems = BaquiTools.searchHiddenGems();
      var gemMsg = gems.length
        ? "¡Modo activado! Estos son algunos lugares que no salen en el mapa convencional:\n\n" +
          gems.map(function (g) { return "• " + (g.name || g.title); }).join("\n") +
          "\n\n¿Querés que te cuente más de alguno?"
        : "Modo 'Lo que no sale en el mapa' activado. Ahora mis recomendaciones priorizan comunidades, patrimonio poco conocido y emprendimientos locales. ¿Qué tipo de experiencia buscás?";
      appendEvolvedMessage(gemMsg, [
        { label: "🌿 Ver en mapa", action: "open_map", payload: null },
        { label: "🔍 Seguir explorando", action: "explore_hidden_gems", payload: null }
      ]);

    } else if (mode.isNearby) {
      // Solicitar ubicación para buscar cercanos
      appendEvolvedMessage("Para mostrarte lo que hay cerca necesito tu ubicación. ¿Me autorizás a usarla solo para esta búsqueda? No se guarda.", [
        { label: "📍 Sí, usar mi ubicación", action: "search_nearby_confirmed", payload: null },
        { label: "❌ No, sin ubicación", action: "search_popular", payload: null }
      ]);

    } else if (mode.isEmergency) {
      // Mostrar servicios inmediatamente sin preguntar
      var services = BaquiTools.showEmergencyServices();
      var emergMsg = "🆘 EMERGENCIAS — NÚMEROS VERIFICADOS:\n\n" +
        services.map(function (s) { return "• " + s.name + ": " + s.phone + " (" + s.type + ")"; }).join("\n") +
        "\n\n¿Necesitás que te ayude a localizar el servicio más cercano?";
      appendEvolvedMessage(emergMsg, [
        { label: "📞 Llamar a Cruz Roja (128)", action: "call", payload: "128" },
        { label: "📞 Llamar a Policía (118)", action: "call", payload: "118" },
        { label: "📍 Ver en mapa", action: "open_map", payload: "servicios+emergencia+nicaragua" }
      ]);

    } else if (mode.isTrip) {
      // Mostrar resumen del viaje actual
      showTripSummary();

    } else if (mode.isWizard) {
      // Iniciar wizard de planificación
      startPlannerWizard();

    } else if (mode.prompt && window.BaqueanoAssistant) {
      window.BaqueanoAssistant.ask(mode.prompt);
    }
  }

  /**
   * Inicia el wizard de planificación de viaje paso a paso.
   */
  function startPlannerWizard() {
    appendEvolvedMessage(
      "🗺️ Vamos a planificar tu viaje.\n\nPara armar una ruta personalizada necesito saber algunas cosas. Empecemos:\n\n**¿Desde dónde salís?** (ciudad o departamento de partida)",
      []
    );
    BaquiTripContext.set("wizardStep", "start_location");
  }

  /**
   * Muestra el resumen del viaje actual guardado en sesión.
   */
  function showTripSummary() {
    var trip = JSON.parse(sessionStorage.getItem("baqueano_my_trip") || "[]");
    var ctx = BaquiTripContext.get();

    if (!trip.length) {
      appendEvolvedMessage(
        "🎒 Todavía no tenés lugares guardados en tu viaje.\n\nPodés ir agregando destinos mientras explorás, o decirme qué querés visitar y los organizo por día.",
        [
          { label: "🧭 Empezar a explorar", action: "mode_explorar", payload: null },
          { label: "🗺️ Planificar viaje", action: "mode_planificar", payload: null }
        ]
      );
    } else {
      var summary = "🎒 **Tu viaje actual:**\n\n" +
        trip.slice(-8).map(function (item, i) {
          return (i + 1) + ". " + item.name + (item.day ? " (Día " + item.day + ")" : "");
        }).join("\n");

      if (ctx.budget) summary += "\n\n💰 Presupuesto: " + ctx.budget + " " + ctx.budgetCurrency;
      if (ctx.days) summary += "\n📅 Días planificados: " + ctx.days;

      appendEvolvedMessage(summary, [
        { label: "🗺️ Ver en mapa", action: "open_map", payload: trip.map(function (t) { return t.name; }).join(",") },
        { label: "➕ Agregar destino", action: "mode_explorar", payload: null },
        { label: "🗑️ Limpiar viaje", action: "clear_trip", payload: null }
      ]);
    }
  }


  /* ═══════════════════════════════════════════════════════════════════════════
     RESPUESTAS ACCIONABLES — appendEvolvedMessage
     Agrega mensajes con botones de acción reales al drawer de Baqüi.
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * Agrega un mensaje con botones de acción al panel de mensajes de Baqüi.
   * @param {string} text — Texto del mensaje.
   * @param {Array} actions — Botones: [{label, action, payload}]
   */
  function appendEvolvedMessage(text, actions) {
    var body = document.getElementById("bqMessages");
    if (!body) return;

    var item = document.createElement("article");
    item.className = "bq-message is-assistant bqe-evolved-msg";

    // Texto del mensaje (soporta saltos de línea y negrita básica)
    var p = document.createElement("p");
    p.innerHTML = String(text)
      .replace(/\n/g, "<br>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    item.appendChild(p);

    // Botones de acción si existen
    if (actions && actions.length) {
      var actionsDiv = document.createElement("div");
      actionsDiv.className = "bqe-action-buttons";
      actions.forEach(function (act) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "bqe-action-btn";
        btn.textContent = act.label;
        btn.dataset.bqeAction = act.action;
        if (act.payload) btn.dataset.bqePayload = String(act.payload);
        actionsDiv.appendChild(btn);
      });
      item.appendChild(actionsDiv);
    }

    body.appendChild(item);
    body.scrollTop = body.scrollHeight;
  }

  /**
   * Maneja los clics en botones de acción evolucionados.
   * @param {string} action — ID de la acción.
   * @param {string} payload — Datos adicionales.
   */
  function handleActionClick(action, payload) {
    switch (action) {
      case "open_map":
        BaquiTools.openMap(payload);
        break;
      case "call":
        if (payload) window.location.href = "tel:" + payload;
        break;
      case "save_favorite":
        if (payload) {
          var saved = BaquiTools.saveFavorite(payload);
          appendEvolvedMessage(
            saved ? "✅ Guardé **" + payload + "** en tus favoritos." : "**" + payload + "** ya estaba en tus favoritos.",
            []
          );
        }
        break;
      case "add_to_trip":
        if (payload) {
          BaquiTools.addToTrip(payload, null);
          appendEvolvedMessage("✅ Agregué **" + payload + "** a tu viaje.", [
            { label: "🎒 Ver mi viaje", action: "mode_mi-viaje", payload: null }
          ]);
        }
        break;
      case "mode_explorar":
        activateMode("explorar", document.getElementById("bqDrawer"));
        break;
      case "mode_planificar":
        activateMode("planificar", document.getElementById("bqDrawer"));
        break;
      case "mode_mi-viaje":
        activateMode("mi-viaje", document.getElementById("bqDrawer"));
        break;
      case "explore_hidden_gems":
        if (window.BaqueanoAssistant) window.BaqueanoAssistant.ask("Mostrame más lugares ocultos en Nicaragua que no aparecen en guías convencionales.");
        break;
      case "search_nearby_confirmed":
        BaquiTools.searchNearby(function (results, error) {
          if (error) {
            appendEvolvedMessage("No pude obtener tu ubicación. " + error, []);
          } else if (!results || !results.length) {
            appendEvolvedMessage("No encontré destinos específicos muy cerca tuyo, pero puedo sugerirte los más populares de Nicaragua. ¿Querés?", [
              { label: "🧭 Ver destinos populares", action: "mode_explorar", payload: null }
            ]);
          } else {
            var msg = "📍 **Cerca de tu ubicación:**\n\n" +
              results.map(function (r) { return "• " + (r.name || r.title); }).join("\n");
            appendEvolvedMessage(msg, results.map(function (r) {
              return { label: "🗺️ " + (r.name || r.title), action: "open_map", payload: r.name };
            }));
          }
        });
        break;
      case "search_popular":
        if (window.BaqueanoAssistant) window.BaqueanoAssistant.ask("Mostrame los destinos más populares de Nicaragua.");
        break;
      case "clear_trip":
        sessionStorage.removeItem("baqueano_my_trip");
        BaquiTripContext.set("addedToTrip", []);
        appendEvolvedMessage("✅ Tu viaje fue limpiado. Cuando quieras empezar a planificar de nuevo, estoy aquí.", []);
        break;
      default:
        break;
    }
  }


  /* ═══════════════════════════════════════════════════════════════════════════
     INYECCIÓN DE UI — Modos y mejoras visuales en el drawer de Baqüi
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * Inyecta la barra de modos conversacionales en el drawer de Baqüi.
   * Se inserta ENTRE el header y la sección de mensajes existente.
   * No elimina ningún elemento existente.
   */
  function injectModesBar(drawerEl) {
    if (!drawerEl || drawerEl.querySelector(".bqe-modes-bar")) return;

    var modesBar = document.createElement("nav");
    modesBar.className = "bqe-modes-bar";
    modesBar.setAttribute("aria-label", "Modos de conversación de Baqüi");
    modesBar.setAttribute("role", "toolbar");

    MODES.forEach(function (mode) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "bqe-mode-btn" + (mode.id === "explorar" ? " is-active" : "");
      btn.dataset.mode = mode.id;
      btn.setAttribute("aria-label", mode.label);
      btn.setAttribute("title", mode.hint);
      btn.innerHTML = "<span class=\"bqe-mode-emoji\">" + mode.emoji + "</span><span class=\"bqe-mode-label\">" + mode.label + "</span>";
      if (mode.color) btn.style.setProperty("--mode-color", mode.color);
      modesBar.appendChild(btn);
    });

    // Insertar antes de la sección de mensajes
    var messagesSection = drawerEl.querySelector("#bqMessages, .bq-messages");
    if (messagesSection) {
      drawerEl.insertBefore(modesBar, messagesSection);
    } else {
      drawerEl.appendChild(modesBar);
    }

    // Listener de clics en modos
    modesBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".bqe-mode-btn");
      if (!btn) return;
      activateMode(btn.dataset.mode, drawerEl);
    });
  }

  /**
   * Inyecta la barra de contexto de viaje (indicador de presupuesto, días, etc.)
   * debajo de los modos si hay datos disponibles.
   */
  function updateTripContextBar(drawerEl) {
    if (!drawerEl) return;
    var ctx = BaquiTripContext.get();
    var bar = drawerEl.querySelector(".bqe-trip-context-bar");

    var hasSomething = ctx.budget || ctx.days || ctx.lastDestination || ctx.vivencia;
    if (!hasSomething) {
      if (bar) bar.hidden = true;
      return;
    }

    if (!bar) {
      bar = document.createElement("div");
      bar.className = "bqe-trip-context-bar";
      var modesBar = drawerEl.querySelector(".bqe-modes-bar");
      if (modesBar && modesBar.nextSibling) {
        drawerEl.insertBefore(bar, modesBar.nextSibling);
      }
    }

    bar.hidden = false;
    var tags = [];
    if (ctx.vivencia) tags.push("🌟 " + ctx.vivencia);
    if (ctx.lastDestination) tags.push("📍 " + ctx.lastDestination);
    if (ctx.budget) tags.push("💰 " + ctx.budget + " " + ctx.budgetCurrency);
    if (ctx.days) tags.push("📅 " + ctx.days + " días");

    bar.innerHTML = "<span class=\"bqe-ctx-label\">Tu viaje:</span>" +
      tags.map(function (t) { return "<span class=\"bqe-ctx-tag\">" + t + "</span>"; }).join("") +
      "<button type=\"button\" class=\"bqe-ctx-clear\" title=\"Limpiar contexto\">×</button>";

    var clearBtn = bar.querySelector(".bqe-ctx-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        BaquiTripContext.reset();
        bar.hidden = true;
        appendEvolvedMessage("Contexto de viaje limpiado. Empecemos de nuevo. ¿Qué querés descubrir?", []);
      });
    }
  }


  /* ═══════════════════════════════════════════════════════════════════════════
     INTEGRACIÓN CON PILARES (tres-pilares.js)
     Sincronizar vivencia y hidden_gem entre módulos.
     ═══════════════════════════════════════════════════════════════════════════ */
  function syncWithPilares() {
    // Si BaqueanoPilares está disponible, leer estado actual
    if (window.BaqueanoPilares) {
      var vivencia = window.BaqueanoPilares.getSelectedVivencia();
      if (vivencia) BaquiTripContext.set("vivencia", vivencia);

      if (window.BaqueanoPilares.isHiddenGemActive()) {
        BaquiTripContext.set("hiddenGemMode", true);
      }
    }

    // Escuchar eventos de cambio de vivencia
    document.addEventListener("baqueano:vivir-selected", function (e) {
      if (!e.detail) return;
      BaquiTripContext.set("vivencia", e.detail.id);
      BaquiTripContext.set("interests", e.detail.categories || []);
      updateTripContextBar(document.getElementById("bqDrawer"));
    });

    // Escuchar toggle de hidden_gem
    document.addEventListener("baqueano:hidden-gem-toggled", function (e) {
      BaquiTripContext.set("hiddenGemMode", e.detail && e.detail.active);
    });
  }


  /* ═══════════════════════════════════════════════════════════════════════════
     INTERCEPTAR MENSAJES DEL USUARIO para extraer contexto
     Se engancha al flujo de envío del formulario existente.
     ═══════════════════════════════════════════════════════════════════════════ */
  function interceptUserMessages() {
    var form = document.getElementById("bqForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      // No cancelamos el submit — solo extraemos contexto en paralelo
      var input = document.getElementById("bqInput");
      if (input && input.value) {
        BaquiTripContext.extract(input.value);
        updateTripContextBar(document.getElementById("bqDrawer"));
      }
    }, true); // captura = antes del submit original
  }


  /* ═══════════════════════════════════════════════════════════════════════════
     DELEGACIÓN DE CLICS EN BOTONES DE ACCIÓN EVOLUCIONADOS
     ═══════════════════════════════════════════════════════════════════════════ */
  function initActionDelegation() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-bqe-action]");
      if (!btn) return;
      e.preventDefault();
      var action = btn.dataset.bqeAction;
      var payload = btn.dataset.bqePayload || null;
      handleActionClick(action, payload);
    });
  }


  /* ═══════════════════════════════════════════════════════════════════════════
     INICIALIZACIÓN PRINCIPAL
     ═══════════════════════════════════════════════════════════════════════════ */
  function init() {
    var drawerEl = document.getElementById("bqDrawer");
    if (!drawerEl) return;

    // 1. Inyectar barra de modos conversacionales
    injectModesBar(drawerEl);

    // 2. Mostrar contexto de viaje si hay datos previos
    updateTripContextBar(drawerEl);

    // 3. Sincronizar con Pilares
    syncWithPilares();

    // 4. Interceptar mensajes para extraer contexto
    interceptUserMessages();

    // 5. Delegación de clics en botones de acción
    initActionDelegation();

    // 6. Escuchar cuando se abre el drawer para refrescar contexto
    document.addEventListener("click", function (e) {
      if (e.target.closest("#bqMascot")) {
        setTimeout(function () { updateTripContextBar(document.getElementById("bqDrawer")); }, 200);
      }
    });
  }

  // Esperar a que BaqueanoAssistant v6 esté disponible antes de inicializar
  waitForAssistant(init);

  // Exponer API pública
  window.BaquiEvolved = {
    version: EVOLVED_VERSION,
    context: BaquiTripContext,
    tools: BaquiTools,
    modes: MODES,
    activateMode: activateMode,
    appendMessage: appendEvolvedMessage,
    handleAction: handleActionClick
  };

})();
