// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MOTOR DE BÚSQUEDA INTELIGENTE GLOBAL (smart-search.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Resolver el comportamiento roto del buscador hero y de la lupa del navbar que,
//   en lugar de navegar al módulo correcto, enviaban al usuario a un mensaje vacío
//   o al asistente flotante sin redireccionamiento real.
// - Brindar una experiencia de búsqueda inteligente que clasifica la intención del
//   usuario y lo lleva directamente al destino, categoría o módulo correspondiente
//   del ecosistema BAQUEANO sin intermediarios ni mensajes de transición innecesarios.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Diccionario de intención semántica con más de 80 palabras clave mapeadas a
//   rutas y parámetros de URL específicos del ecosistema.
// - Prioridad: destino exacto → categoría → módulo temático → Baqueano Digital (fallback).
// - Se engancha al submit del formulario hero (.hero-exact-search) y al click de la
//   lupa del navbar (.navbar-search-btn / .global-search) mediante event listeners
//   inyectados después de DOMContentLoaded.
// - Muestra un panel de sugerencias en tiempo real con autocompletado (max 5 resultados).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES):
// - window.BaqueanoSmartSearch: motor global con método search(query) y searchNow(query).
// - Panel flotante de sugerencias #bqSmartSuggestPanel con animación.
// - Redireccionamiento inteligente sin mensajes intermedios.
// ============================================================================

(function (window, document) {
  'use strict';

  // ==========================================================================
  // DICCIONARIO DE INTENCIÓN SEMÁNTICA
  // Cada entrada: { route: 'URL', param: 'query-param', value: 'valor-opcional' }
  // ==========================================================================
  const INTENT_MAP = [
    // ── DESTINOS EXACTOS ────────────────────────────────────────────────────
    { keys: ['ometepe', 'isla ometepe', 'volcán concepción', 'volcan concepcion', 'maderas'],         route: 'destinos.html', param: 'id', value: 'ometepe' },
    { keys: ['granada', 'iglesias granada', 'lago granada', 'colonial'],                              route: 'destinos.html', param: 'id', value: 'granada' },
    { keys: ['san juan del sur', 'sjds', 'playa san juan', 'surf'],                                   route: 'destinos.html', param: 'id', value: 'sjds' },
    { keys: ['cerro negro', 'sandboard', 'volcano boarding'],                                          route: 'destinos.html', param: 'id', value: 'cerro_negro' },
    { keys: ['somoto', 'cañón', 'canon', 'canyon', 'cañon de somoto'],                               route: 'destinos.html', param: 'id', value: 'somoto' },
    { keys: ['masaya', 'volcán masaya', 'lava masaya', 'mercado masaya', 'artesanias'],                route: 'destinos.html', param: 'id', value: 'masaya' },
    { keys: ['isletas', 'islas granada', 'isletas granada'],                                           route: 'destinos.html', param: 'id', value: 'isletas' },
    { keys: ['apoyo', 'laguna apoyo', 'laguna de apoyo'],                                              route: 'destinos.html', param: 'id', value: 'apoyo' },
    { keys: ['corn island', 'corn', 'isla del maíz', 'caribe'],                                       route: 'destinos.html', param: 'id', value: 'cornisland' },
    { keys: ['miraflor', 'reserva miraflor', 'estelí', 'esteli'],                                     route: 'destinos.html', param: 'id', value: 'miraflor' },
    { keys: ['río san juan', 'rio san juan', 'el castillo', 'caño negro'],                            route: 'destinos.html', param: 'id', value: 'riosanjuan' },
    { keys: ['bosawas', 'reserva biosfera'],                                                           route: 'destinos.html', param: 'id', value: 'bosawas' },
    { keys: ['leon', 'león', 'catedral leon', 'ciudad universitaria'],                                 route: 'destinos.html', param: 'id', value: 'leon' },

    // ── CATEGORÍAS DE DESTINOS ───────────────────────────────────────────────
    { keys: ['playa', 'playas', 'playa tropicales', 'costa', 'costas', 'litoral', 'arena', 'mar', 'pacifico', 'pacífico'], route: 'destinos.html', param: 'cat', value: 'playas' },
    { keys: ['volcan', 'volcán', 'volcanes', 'lava', 'erupcion', 'magma'],                            route: 'destinos.html', param: 'cat', value: 'volcanes' },
    { keys: ['aventura', 'adrenalina', 'extremo', 'rappel', 'tirolesa'],                              route: 'destinos.html', param: 'cat', value: 'aventura' },
    { keys: ['naturaleza', 'biosfera', 'reserva natural', 'parque nacional', 'wildlife'],              route: 'destinos.html', param: 'cat', value: 'naturaleza' },
    { keys: ['selva', 'bosque', 'tropico', 'trópico', 'jungla', 'fauna', 'flora'],                   route: 'destinos.html', param: 'cat', value: 'selva' },
    { keys: ['rio', 'ríos', 'rios', 'caño', 'laguna', 'lago'],                                       route: 'destinos.html', param: 'cat', value: 'rios' },
    { keys: ['isla', 'islas', 'archipiélago', 'archipelago'],                                         route: 'destinos.html', param: 'cat', value: 'islas' },
    { keys: ['cultura', 'tradicion', 'tradición', 'pueblo', 'comunidad', 'indigena', 'indígena'],    route: 'destinos.html', param: 'cat', value: 'cultura' },
    { keys: ['hotel', 'hospedaje', 'hostal', 'lodge', 'alojamiento', 'dormir', 'cabana', 'cabaña', 'eco-lodge'], route: 'destinos.html', param: 'cat', value: 'hospedaje' },
    { keys: ['favoritos', 'guardados', 'mis destinos'],                                               route: 'destinos.html', param: 'cat', value: 'favoritos' },

    // ── MÓDULOS TEMÁTICOS ────────────────────────────────────────────────────
    { keys: ['gastronomia', 'gastronomía', 'comida', 'cocina', 'comer', 'restaurante', 'gallo pinto', 'nacatamal', 'vigorón', 'vigaron', 'pinolillo', 'típico', 'tipico', 'receta'], route: 'gastronomia.html', param: 'q' },
    { keys: ['musica', 'música', 'marimba', 'palo de mayo', 'cancion', 'canción', 'trova', 'folclore', 'cumbia'], route: 'musica.html', param: 'q' },
    { keys: ['historia', 'colonial', 'precolombino', 'sandinismo', 'ruinas', 'patrimonio', 'museo', 'arqueología'], route: 'historia.html', param: 'q' },
    { keys: ['ambiental', 'ecologico', 'ecológico', 'sostenible', 'carbono', 'reforestacion', 'custodia'], route: 'ambiental.html', param: 'q' },
    { keys: ['mapa', 'gps', 'geolocalización', 'georreferenciado', 'ubicación', 'donde queda', 'dónde'],  route: 'mapa.html', param: 'q' },
    { keys: ['aliados', 'negocio', 'anfitrion', 'anfitrión', 'cooperativa', 'artesano', 'guia local', 'guía local'], route: 'aliados.html', param: 'q' },
    { keys: ['experiencias', 'actividades', 'tour', 'tours', 'excursion', 'excursión', 'programa'],   route: 'experiencias.html', param: 'q' },
    { keys: ['mi viaje', 'itinerario', 'planificar', 'planificador', 'reserva', 'reservas'],           route: 'mi-viaje.html', param: null },
    { keys: ['perfil', 'mi cuenta', 'cuenta', 'sesion', 'sesión', 'login', 'registro'],               route: 'perfil.html', param: null },
    { keys: ['denuncias', 'denuncia', 'sos', 'emergencia', 'ayuda', 'peligro'],                       route: 'denuncias.html', param: null },
    { keys: ['departamento', 'departamentos', 'territorio', 'managua', 'matagalpa', 'bluefields', 'jinotega', 'nueva segovia', 'chinandega', 'carazo', 'rivas', 'boaco', 'chontales', 'madriz', 'zelaya', 'raas', 'raan'], route: 'departamento.html', param: 'q' },
  ];

  // ==========================================================================
  // SUGERENCIAS DE AUTOCOMPLETADO
  // ==========================================================================
  const SUGGESTIONS_DB = [
    { label: '🏖️ Playas del Pacífico',     route: 'destinos.html?cat=playas' },
    { label: '🌋 Volcán Cerro Negro',       route: 'destinos.html?id=cerro_negro' },
    { label: '🏝️ Isla de Ometepe',          route: 'destinos.html?id=ometepe' },
    { label: '🏛️ Granada Colonial',         route: 'destinos.html?id=granada' },
    { label: '🤿 San Juan del Sur',         route: 'destinos.html?id=sjds' },
    { label: '🌊 Cañón de Somoto',          route: 'destinos.html?id=somoto' },
    { label: '🎭 Cultura Nicaragüense',     route: 'destinos.html?cat=cultura' },
    { label: '🍽️ Gastronomía Típica',      route: 'gastronomia.html' },
    { label: '🎶 Música Folclórica',        route: 'musica.html' },
    { label: '🌿 Reservas Naturales',       route: 'destinos.html?cat=naturaleza' },
    { label: '🗺️ Mapa Interactivo',         route: 'mapa.html' },
    { label: '✨ Planificar con IA',        route: 'baqueano-ia.html' },
    { label: '🐦 Laguna de Apoyo',          route: 'destinos.html?id=apoyo' },
    { label: '🏡 Reserva Miraflor',         route: 'destinos.html?id=miraflor' },
    { label: '🌺 Volcán Masaya',            route: 'destinos.html?id=masaya' },
    { label: '🚣 Río San Juan',             route: 'destinos.html?id=riosanjuan' },
    { label: '🏄 Surf en Nicaragua',        route: 'destinos.html?cat=playas' },
    { label: '🏨 Hospedajes y Lodges',      route: 'destinos.html?cat=hospedaje' },
    { label: '🤝 Aliados Comunitarios',     route: 'aliados.html' },
    { label: '🧳 Mis Viajes',              route: 'mi-viaje.html' },
  ];

  // ==========================================================================
  // MOTOR PRINCIPAL DE CLASIFICACIÓN
  // ==========================================================================
  function classifyQuery(raw) {
    if (!raw || !raw.trim()) return null;
    const q = raw.trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // quitar tildes para comparación

    // Buscar coincidencia en el mapa de intención
    for (const intent of INTENT_MAP) {
      for (const key of intent.keys) {
        const normalizedKey = key.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (q.includes(normalizedKey)) {
          return intent;
        }
      }
    }
    // Fallback: enviar a destinos.html con q= para búsqueda textual
    return { route: 'destinos.html', param: 'q', value: null };
  }

  function buildUrl(intent, rawQuery) {
    if (!intent) return 'destinos.html?q=' + encodeURIComponent(rawQuery);
    let url = intent.route;
    if (intent.param) {
      const val = intent.value || rawQuery;
      url += '?' + intent.param + '=' + encodeURIComponent(val);
    }
    return url;
  }

  function searchNow(rawQuery) {
    const intent = classifyQuery(rawQuery);
    const url = buildUrl(intent, rawQuery);
    window.location.href = url;
  }

  // ==========================================================================
  // PANEL DE SUGERENCIAS EN TIEMPO REAL
  // ==========================================================================
  function createSuggestPanel() {
    if (document.getElementById('bqSmartSuggestPanel')) return;
    const panel = document.createElement('div');
    panel.id = 'bqSmartSuggestPanel';
    panel.setAttribute('role', 'listbox');
    panel.setAttribute('aria-label', 'Sugerencias de búsqueda');
    panel.style.cssText = [
      'position:absolute',
      'top:calc(100% + 6px)',
      'left:0',
      'right:0',
      'background:rgba(15,23,42,0.97)',
      'backdrop-filter:blur(20px)',
      '-webkit-backdrop-filter:blur(20px)',
      'border:1px solid rgba(244,230,193,0.18)',
      'border-radius:14px',
      'box-shadow:0 16px 48px rgba(0,0,0,0.45)',
      'z-index:9999',
      'overflow:hidden',
      'display:none',
      'max-height:320px',
      'overflow-y:auto'
    ].join(';');
    document.body.appendChild(panel);
    return panel;
  }

  function positionPanel(inputEl) {
    const panel = document.getElementById('bqSmartSuggestPanel');
    if (!panel || !inputEl) return;
    const form = inputEl.closest('form');
    const rect = (form || inputEl).getBoundingClientRect();
    panel.style.position = 'fixed';
    panel.style.top = (rect.bottom + 6) + 'px';
    panel.style.left = rect.left + 'px';
    panel.style.width = rect.width + 'px';
  }

  function renderSuggestions(query, inputEl) {
    const panel = document.getElementById('bqSmartSuggestPanel') || createSuggestPanel();
    if (!panel) return;
    positionPanel(inputEl);

    const q = (query || '').trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    let matches = [];
    if (q.length >= 2) {
      matches = SUGGESTIONS_DB.filter(s => {
        const label = s.label.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return label.includes(q);
      }).slice(0, 6);
    } else if (q.length === 0) {
      // Mostrar populares cuando el campo está vacío y tiene foco
      matches = SUGGESTIONS_DB.slice(0, 6);
    }

    if (matches.length === 0) {
      // Mostrar opción de buscar con IA
      panel.innerHTML = `
        <div style="padding:10px 14px; display:flex; align-items:center; gap:10px; cursor:pointer; color:#F4E6C1; font-size:0.85rem;"
             onclick="window.location.href='baqueano-ia.html?prompt=${encodeURIComponent(query)}'">
          <span style="font-size:1.1rem;">✨</span>
          <span>Planificar con Baqueano Digital: <strong>${query}</strong></span>
        </div>
      `;
      panel.style.display = 'block';
      return;
    }

    panel.innerHTML = matches.map(s => `
      <div role="option"
           style="padding:10px 16px; display:flex; align-items:center; gap:10px; cursor:pointer; color:#F4E6C1; font-size:0.86rem; border-bottom:1px solid rgba(255,255,255,0.05); transition:background 0.15s;"
           onmouseover="this.style.background='rgba(246,94,1,0.12)'"
           onmouseout="this.style.background=''"
           onclick="window.location.href='${s.route}'">
        <span>${s.label}</span>
      </div>
    `).join('');

    panel.style.display = 'block';
  }

  function hideSuggestions() {
    const panel = document.getElementById('bqSmartSuggestPanel');
    if (panel) panel.style.display = 'none';
  }

  // ==========================================================================
  // ENGANCHE AL FORMULARIO HERO Y NAVBAR
  // ==========================================================================
  function hookSearchForms() {
    // 1. Formulario hero principal (index.html)
    const heroForms = document.querySelectorAll('.hero-exact-search, form[action="destinos.html"]');
    heroForms.forEach(form => {
      // Eliminar el action nativo para controlarlo nosotros
      form.removeAttribute('action');
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        const input = form.querySelector('input[name="q"], input[type="search"]');
        const query = input ? input.value.trim() : '';
        if (!query) {
          // Foco vacío → ir a destinos.html
          window.location.href = 'destinos.html';
          return;
        }
        hideSuggestions();
        searchNow(query);
      });

      // Autocompletado en tiempo real
      const input = form.querySelector('input[name="q"], input[type="search"]');
      if (input) {
        createSuggestPanel();
        input.addEventListener('input', function() {
          renderSuggestions(this.value, this);
        });
        input.addEventListener('focus', function() {
          renderSuggestions(this.value, this);
        });
        input.addEventListener('keydown', function(e) {
          if (e.key === 'Escape') hideSuggestions();
        });
      }
    });

    // 2. Búsqueda inline de destinos.html (si existe en la misma página)
    const destinosForm = document.querySelector('#destinos-search-form, form:has(input#destSearchInput)');
    if (destinosForm) {
      destinosForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const input = this.querySelector('input');
        const query = input ? input.value.trim() : '';
        if (query) searchNow(query);
      });
    }

    // 3. Cerrar panel al click fuera
    document.addEventListener('click', function(e) {
      const panel = document.getElementById('bqSmartSuggestPanel');
      if (panel && !e.target.closest('form') && !e.target.closest('#bqSmartSuggestPanel')) {
        hideSuggestions();
      }
    });
  }

  // ==========================================================================
  // INICIALIZACIÓN
  // ==========================================================================
  function init() {
    hookSearchForms();

    // Abrir panel de búsqueda desde la lupa del navbar
    document.querySelectorAll('.navbar-search-btn, .global-search[href="destinos.html"]').forEach(btn => {
      btn.addEventListener('click', function(e) {
        // Si hay un formulario hero visible, hacer foco en él en vez de navegar
        const heroInput = document.querySelector('.hero-exact-search input, form[action="destinos.html"] input');
        if (heroInput) {
          e.preventDefault();
          heroInput.focus();
          heroInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          renderSuggestions('', heroInput);
        }
        // Si no hay hero (otras páginas), la navegación a destinos.html se ejecuta normalmente
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Exposición global para debugging y uso externo
  window.BaqueanoSmartSearch = {
    search: searchNow,
    classify: classifyQuery
  };

})(window, document);
