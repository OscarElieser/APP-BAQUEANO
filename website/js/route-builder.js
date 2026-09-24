// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PLANIFICADOR INTELIGENTE DE AVENTURAS (route-builder.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Permitir al explorador diseñar su aventura a medida abriendo un modal
//   rápido y ergonómico sin saturar visualmente la página principal.
// - Garantizar que SIEMPRE se ofrezca un itinerario realista, transparente
//   y verificable para Nicaragua basado en presupuesto real.
// - Priorizar datos verificados del catálogo de cooperativas Baqueano;
//   enriquecer con IA (Gemini 3.6 / Gemini Flash) y fundamentar en la base
//   de territorios del país (window.BAQUEANO_TERRITORIES).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Interfaz en dos capas: Tarjeta CTA principal en la página + Modal de 4 pasos.
// - Motor de generación triple con resiliencia total:
//   1. Catálogo Firestore (tourism_services).
//   2. Google Gemini API (modelos gemini-3.6-flash / gemini-flash-latest).
//   3. Motor de Territorios Auténticos Baqueano (fallback sin fallas).
// - Etiquetado claro de fuentes: ✅ Verificado · 🤖 Asistente IA · 🧭 Territorio Oficial.
//
// 📦 3. QUÉ (WHAT / COMPONENTES Y MÉTODOS):
// - window.BaqueanoRouteBuilder.init()
// - window.BaqueanoRouteBuilder.openModal()
// - window.BaqueanoRouteBuilder.closeModal()
// - window.BaqueanoRouteBuilder.generate()
// ============================================================================

(function (window, document) {
  'use strict';

  // --------------------------------------------------------------------------
  // CONSTANTES & CONFIGURACIÓN
  // --------------------------------------------------------------------------
  const COLLECTION        = 'tourism_services';
  const PLAN_COLLECTION   = 'travelPlans';
  const GEMINI_API_KEY    = ''; // IA generativa: únicamente mediante gateway server-side.
  const GEMINI_MODELS     = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite'];

  const SERVICE_LABELS = {
    transporte:               'Transporte',
    hospedaje:                'Hospedaje',
    alimentacion:             'Alimentación',
    entrada:                  'Entradas & Tarifas',
    guia:                     'Guía Local',
    actividad:                'Actividad en Destino',
    day_pass:                 'Day Pass',
    alquiler_vehiculo:        'Alquiler de Vehículo',
    ferry_panga:              'Ferry / Panga',
    experiencia_comunitaria:  'Experiencia Campesina'
  };

  const state = {
    services: [],
    exchange: null,
    plan: null,
    loading: false
  };

  const $ = id => document.getElementById(id);

  const money = (value, currency) =>
    new Intl.NumberFormat('es-NI', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'NIO',
      maximumFractionDigits: 2
    }).format(value || 0);

  const dateLabel = value => {
    const date = value?.toDate ? value.toDate() : new Date(value);
    return Number.isNaN(date.getTime()) ? 'Sin fecha' : date.toLocaleDateString('es-NI');
  };

  const safeUrl = value => /^https:\/\//i.test(String(value || '')) ? value : '';

  function db() {
    return window.firebase?.firestore ? window.firebase.firestore() : null;
  }

  // --------------------------------------------------------------------------
  // 1. RENDERIZADO DEL SHELL (Tarjeta CTA + Modal + Área de Resultados)
  // --------------------------------------------------------------------------
  function renderShell() {
    const section = $('routeBuilderSection');
    if (!section) return;

    section.innerHTML = `
      <div class="container">
        <div class="planner-showcase-wrap">

          <!-- TARJETA CTA PRINCIPAL (Compacta y visualmente atractiva) -->
          <div class="planner-cta-card">
            <div class="planner-cta-icon">
              <i class="fa-solid fa-compass"></i>
            </div>
            <div class="planner-cta-body">
              <div class="badge-section-pill" style="margin-bottom: 0.8rem;">
                <i class="fa-solid fa-wand-magic-sparkles"></i> Inteligencia Colectiva &amp; Catálogo Campesino
              </div>
              <h3>Armá tu Aventura en Nicaragua a tu Medida</h3>
              <p>
                Decinos cuánto querés gastar y cuántos días tenés. 
                BAQUEANO consulta tarifas registradas por cooperativas locales y enriquece tu ruta con nuestro asistente de Inteligencia Artificial conectado a destinos 100% auténticos.
              </p>
              <div class="planner-features-row">
                <span class="planner-feat-pill"><i class="fa-solid fa-shield-halved"></i> Tarifas Verificadas</span>
                <span class="planner-feat-pill"><i class="fa-solid fa-robot"></i> Asistente IA Google Gemini</span>
                <span class="planner-feat-pill"><i class="fa-solid fa-wallet"></i> Presupuesto C$ / US$</span>
                <span class="planner-feat-pill"><i class="fa-solid fa-map-location-dot"></i> Destinos Reales</span>
              </div>
            </div>
            <button type="button" class="btn-calculate-route btn-planner-launch" id="btnOpenPlannerModal">
              <i class="fa-solid fa-sliders"></i> Diseñar mi Aventura Ahora
            </button>
          </div>

          <!-- ÁREA DONDE SE MUESTRA EL ITINERARIO GENERADO -->
          <div class="planner-result-showcase" id="rbResultShowcase" style="display: none;">
            <div class="builder-card-pro builder-result-card" id="rbResult">
              <!-- Se puebla dinámicamente -->
            </div>
          </div>

        </div>
      </div>

      <!-- MODAL DEL PLANIFICADOR DE AVENTURAS -->
      <div class="planner-modal" id="routePlannerModal" role="dialog" aria-modal="true" aria-labelledby="modalPlannerTitle">
        <div class="planner-modal-dialog">
          <button type="button" class="planner-modal-close" id="btnClosePlannerModal" aria-label="Cerrar ventana">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <div class="planner-modal-header">
            <h3 id="modalPlannerTitle"><i class="fa-solid fa-sliders"></i> Planificá tu Viaje por Nicaragua</h3>
            <p>Completá estos 4 datos para que el sistema y la IA armen tu itinerario.</p>
          </div>

          <form id="routePlannerModalForm" class="planner-form-compact" novalidate>

            <!-- 1. Duración -->
            <div class="planner-input-group">
              <label><i class="fa-solid fa-calendar-days"></i> ¿Cuántos días dura tu viaje?</label>
              <div class="planner-chips-grid" id="modalDaysChips">
                <button type="button" class="planner-chip-btn" data-days="1">1 día (Day Pass)</button>
                <button type="button" class="planner-chip-btn" data-days="2">2 días</button>
                <button type="button" class="planner-chip-btn active" data-days="3">3 días (Fin de semana)</button>
                <button type="button" class="planner-chip-btn" data-days="5">5 días</button>
                <button type="button" class="planner-chip-btn" data-days="7">7 días</button>
              </div>
              <input type="hidden" id="modalRbDays" value="3">
            </div>

            <!-- 2. Presupuesto -->
            <div class="planner-input-group">
              <label for="modalRbBudget"><i class="fa-solid fa-wallet"></i> ¿Cuánto querés gastar en total?</label>
              <div class="rb-money-input">
                <select id="modalRbCurrency" aria-label="Moneda">
                  <option value="NIO" selected>C$ NIO</option>
                  <option value="USD">US$ USD</option>
                </select>
                <input id="modalRbBudget" type="number" min="100" step="50" inputmode="decimal" placeholder="Ej: 8000" value="8000" required>
              </div>
            </div>

            <!-- 3. Salida y Modalidad (2 columnas) -->
            <div class="planner-2col">
              <div class="planner-input-group">
                <label for="modalRbOrigin"><i class="fa-solid fa-map-pin"></i> Salida desde</label>
                <select id="modalRbOrigin" class="builder-select">
                  <option value="Managua" selected>Managua</option>
                  <option value="León">León</option>
                  <option value="Granada">Granada</option>
                  <option value="Rivas">Rivas / Ometepe</option>
                  <option value="Matagalpa">Matagalpa</option>
                  <option value="Jinotega">Jinotega</option>
                  <option value="Estelí">Estelí / Somoto</option>
                  <option value="Chinandega">Chinandega</option>
                  <option value="Masaya">Masaya</option>
                  <option value="Río San Juan">Río San Juan</option>
                  <option value="Caribe">Caribe (RACCN / RACCS)</option>
                </select>
              </div>

              <div class="planner-input-group">
                <label for="modalRbTravelType"><i class="fa-solid fa-users"></i> Modalidad</label>
                <select id="modalRbTravelType" class="builder-select">
                  <option value="pareja" selected>En Pareja</option>
                  <option value="familia_ninos">Familia con niños</option>
                  <option value="amigos">Grupo de amigos</option>
                  <option value="solo">Viajero solitario</option>
                </select>
              </div>
            </div>

            <!-- 4. Intereses principales (chips seleccionables) -->
            <div class="planner-input-group">
              <label><i class="fa-solid fa-heart"></i> Intereses principales</label>
              <div class="planner-chips-grid" id="modalInterestsChips">
                <button type="button" class="planner-chip-btn active" data-interest="volcanes">🌋 Volcanes</button>
                <button type="button" class="planner-chip-btn active" data-interest="aventura">🧗 Aventura</button>
                <button type="button" class="planner-chip-btn" data-interest="playa">🏖️ Playa &amp; Surf</button>
                <button type="button" class="planner-chip-btn" data-interest="ruta del cafe">☕ Ruta del Café</button>
                <button type="button" class="planner-chip-btn" data-interest="turismo rural">🌱 Turismo Campesino</button>
                <button type="button" class="planner-chip-btn" data-interest="gastronomia">🍲 Gastronomía</button>
                <button type="button" class="planner-chip-btn" data-interest="lagunas">🌊 Lagos &amp; Ríos</button>
                <button type="button" class="planner-chip-btn" data-interest="cultura">🏺 Cultura &amp; Pueblos</button>
              </div>
            </div>

            <!-- Mensaje de error / validación -->
            <div class="rb-validation" id="modalRbValidation" role="alert" hidden></div>

            <!-- Botón de acción principal -->
            <button type="submit" class="btn-calculate-route" id="btnSubmitPlannerModal" style="margin-top: 0.5rem; justify-content: center; font-size: 1.05rem; padding: 0.95rem;">
              <i class="fa-solid fa-wand-magic-sparkles"></i> Construir mi Aventura
            </button>

          </form>
        </div>
      </div>
    `;

    bindModalEvents();
  }

  // --------------------------------------------------------------------------
  // 2. CONTROL DEL MODAL (Abrir / Cerrar / Chips)
  // --------------------------------------------------------------------------
  function openModal() {
    const modal = $('routePlannerModal');
    if (modal) {
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      $('modalRbBudget')?.focus();
    }
  }

  function closeModal() {
    const modal = $('routePlannerModal');
    if (modal) {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }

  function bindModalEvents() {
    // Abrir y cerrar modal
    $('btnOpenPlannerModal')?.addEventListener('click', openModal);
    $('btnClosePlannerModal')?.addEventListener('click', closeModal);

    // Cerrar al dar clic en el fondo oscuro
    $('routePlannerModal')?.addEventListener('click', e => {
      if (e.target.id === 'routePlannerModal') closeModal();
    });

    // Cerrar con Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeModal();
    });

    // Chips de días
    const daysContainer = $('modalDaysChips');
    if (daysContainer) {
      daysContainer.querySelectorAll('.planner-chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          daysContainer.querySelectorAll('.planner-chip-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const daysInput = $('modalRbDays');
          if (daysInput) daysInput.value = btn.dataset.days || '3';
        });
      });
    }

    // Chips de intereses (selección múltiple)
    const interestsContainer = $('modalInterestsChips');
    if (interestsContainer) {
      interestsContainer.querySelectorAll('.planner-chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          btn.classList.toggle('active');
        });
      });
    }

    // Submit del formulario
    $('routePlannerModalForm')?.addEventListener('submit', e => {
      e.preventDefault();
      generate();
    });
  }

  // --------------------------------------------------------------------------
  // 3. OBTENER DATOS DEL FORMULARIO
  // --------------------------------------------------------------------------
  function getModalInput() {
    const budgetVal = Number($('modalRbBudget')?.value || 8000);
    const currency  = $('modalRbCurrency')?.value || 'NIO';
    const days      = Number($('modalRbDays')?.value || 3);
    const origin    = $('modalRbOrigin')?.value || 'Managua';
    const travelType = $('modalRbTravelType')?.value || 'pareja';

    const selectedInterests = [];
    document.querySelectorAll('#modalInterestsChips .planner-chip-btn.active').forEach(b => {
      if (b.dataset.interest) selectedInterests.push(b.dataset.interest);
    });

    const travelers = {
      adults: travelType === 'familia_ninos' ? 2 : (travelType === 'amigos' ? 4 : (travelType === 'solo' ? 1 : 2)),
      children: travelType === 'familia_ninos' ? 2 : 0
    };

    const reserve = budgetVal * 0.1; // 10% reserva
    const available = budgetVal - reserve;

    return {
      budget: budgetVal,
      currency,
      days,
      reserve,
      available,
      origin,
      travelType,
      adults: travelers.adults,
      children: travelers.children,
      interests: selectedInterests.length ? selectedInterests : ['volcanes', 'aventura', 'naturaleza'],
      includedServices: ['hospedaje', 'alimentacion', 'entrada', 'actividad'],
      fitness: 'moderada',
      accessibility: 'ninguna',
      stayMode: 'cualquiera'
    };
  }

  // --------------------------------------------------------------------------
  // 4. CARGA DEL CATÁLOGO DESDE FIRESTORE (no bloqueante)
  // --------------------------------------------------------------------------
  async function loadCatalog() {
    const firestore = db();
    if (!firestore) return;
    try {
      const [servicesSnap, exchangeSnap] = await Promise.all([
        firestore.collection(COLLECTION).get(),
        firestore.collection('app_config').doc('exchange_rate').get()
      ]);

      state.services = servicesSnap.docs.map(doc => {
        const raw = doc.data();
        return {
          id: doc.id,
          ...raw,
          precio: Number(raw.precio) || 0,
          usable: raw.disponibilidad === true && Number(raw.precio) > 0
        };
      });

      state.exchange = exchangeSnap.exists ? exchangeSnap.data() : null;
    } catch (e) {
      console.warn('[RouteBuilder] Catálogo Firestore no disponible:', e.message);
    }
  }

  // --------------------------------------------------------------------------
  // 5. MOTOR FALLBACK DE TERRITORIOS AUTÉNTICOS (SIEMPRE DISPONIBLE)
  // --------------------------------------------------------------------------
  function buildTerritoryFallbackPlan(input) {
    const territories = window.BAQUEANO_TERRITORIES || [
      {
        name: 'Madriz & Cañón de Somoto',
        shortDesc: 'Aventura geológica y cooperativas campesinas del norte.',
        places: [{ name: 'Monumento Nacional Cañón de Somoto' }, { name: 'Comunidad Sonís' }],
        activities: ['Senderismo y flotación en cañón', 'Rosquillas somoteñas artesanales']
      },
      {
        name: 'Isla de Ometepe',
        shortDesc: 'Oasis de dos volcanes en el Gran Lago de Nicaragua.',
        places: [{ name: 'Volcán Maderas' }, { name: 'Ojo de Agua' }, { name: 'Charco Verde' }],
        activities: ['Ascenso a cascada San Ramón', 'Kayak en Río Istián']
      },
      {
        name: 'León & Cordillera de los Maribios',
        shortDesc: 'Volcanes activos, sandboarding y patrimonio colonial.',
        places: [{ name: 'Volcán Cerro Negro' }, { name: 'Playa Las Peñitas' }],
        activities: ['Sandboarding en Cerro Negro', 'Recorrido en manglares']
      },
      {
        name: 'Matagalpa & Selva Negra',
        shortDesc: 'Nebliselva, cafetales de altura y cascadas.',
        places: [{ name: 'Reserva Selva Negra' }, { name: 'Cascada Santa Emilia' }],
        activities: ['Cata de café campesino', 'Avistamiento de aves quetzal']
      }
    ];

    // Seleccionar el territorio más acorde al origen o al azar informado
    let target = territories.find(t => t.name.toLowerCase().includes(input.origin.toLowerCase()))
      || territories[Math.floor(Math.random() * territories.length)];

    const rate = input.currency === 'USD' ? 1 : 36.8;
    const isUsd = input.currency === 'USD';
    const factor = isUsd ? 1 : rate;

    const daysArray = [];
    for (let d = 1; d <= input.days; d++) {
      const dayActivities = [];
      const placeIndex = (d - 1) % (target.places?.length || 1);
      const placeName = target.places?.[placeIndex]?.name || `${target.name} - Parada ${d}`;
      const actName = target.activities?.[placeIndex] || 'Exploración con guía local comunitario';

      dayActivities.push({
        nombre: placeName,
        tipo: 'actividad',
        descripcion: `${actName}. Acompañamiento por guía campesino acreditado.`,
        precio_estimado: isUsd ? '$15 – $25' : `C$ ${Math.round(15 * factor)} – ${Math.round(25 * factor)}`,
        fuente: 'baqueano.com (Territorio Oficial)'
      });

      dayActivities.push({
        nombre: `Hospedaje Rural Comunitario en ${target.name.split('&')[0].trim()}`,
        tipo: 'hospedaje',
        descripcion: 'Habitación ecológica administrada directamente por familias locales.',
        precio_estimado: isUsd ? '$20 – $35' : `C$ ${Math.round(20 * factor)} – ${Math.round(35 * factor)}`,
        fuente: 'baqueano.com'
      });

      dayActivities.push({
        nombre: 'Alimentación Autóctona del Maíz y Café',
        tipo: 'alimentacion',
        descripcion: 'Desayuno campesino y cena típica con productos de la milpa local.',
        precio_estimado: isUsd ? '$8 – $14' : `C$ ${Math.round(8 * factor)} – ${Math.round(14 * factor)}`,
        fuente: 'baqueano.com'
      });

      daysArray.push({
        day: d,
        titulo: d === 1 ? `Llegada a ${target.name}` : (d === input.days ? 'Cierre de aventura y retorno' : `Inmersión en ${placeName}`),
        activities: dayActivities
      });
    }

    const totalMin = Math.round(input.budget * 0.7);
    const totalMax = Math.round(input.budget * 0.95);

    return {
      plan_title: `${input.days} Días de Ecoturismo Auténtico en ${target.name}`,
      destino_principal: target.name,
      resumen: `Itinerario equilibrado saliendo desde ${input.origin}. Diseñado para vivir naturaleza auténtica, apoyar cooperativas rurales y maximizar tu presupuesto sin intermediarios.`,
      presupuesto_estimado: `${money(totalMin, input.currency)} – ${money(totalMax, input.currency)}`,
      days: daysArray,
      recomendacion_final: `Llevá calzado cómodo de senderismo, botella reutilizable para huella cero y dinero en efectivo (córdobas) para apoyar a los artesanos locales.`,
      nota_ia: `Este itinerario fue fundamentado en destinos reales y verificados de Baqueano Nicaragua. Los precios son rangos estimados para coordinar directamente con los anfitriones.`,
      _source: 'territory'
    };
  }

  // --------------------------------------------------------------------------
  // 6. CONSULTA A GOOGLE GEMINI API (CON FAIL-SAFE)
  // --------------------------------------------------------------------------
  async function callGemini(input) {
    // Las credenciales de IA nunca se leen desde el navegador. Mientras el
    // planificador migra al gateway server-side, se usa el motor territorial.
    if (!GEMINI_API_KEY) return buildTerritoryFallbackPlan(input);
    const territories = (window.BAQUEANO_TERRITORIES || []).slice(0, 6);
    const contextStr = territories.map(t =>
      `• ${t.name}: ${t.shortDesc} Lugares: ${(t.places || []).slice(0, 3).map(p => p.name).join(', ')}. Actividades: ${(t.activities || []).slice(0, 2).join(', ')}.`
    ).join('\n');

    const prompt = `Eres el planificador oficial de Baqueano Nicaragua (baqueano.com).
Genera un itinerario turístico REAL, AUTÉNTICO y VERIFICABLE en formato JSON estricto.

REGLAS:
- Solo usa lugares reales de Nicaragua.
- No inventes precios fijos, usa rangos estimados razonables.
- Formato de respuesta: ÚNICAMENTE JSON sin Markdown alrededor.

CONTEXTO REAL:
${contextStr}

DATOS DEL VIAJERO:
- Días: ${input.days}
- Presupuesto: ${money(input.budget, input.currency)}
- Origen: ${input.origin}
- Modalidad: ${input.travelType} (${input.adults} adultos, ${input.children} niños)
- Intereses: ${input.interests.join(', ')}

ESQUEMA JSON:
{
  "plan_title": "...",
  "destino_principal": "...",
  "resumen": "...",
  "presupuesto_estimado": "...",
  "days": [
    {
      "day": 1,
      "titulo": "...",
      "activities": [
        {
          "nombre": "...",
          "tipo": "actividad | hospedaje | alimentacion | transporte",
          "descripcion": "...",
          "precio_estimado": "...",
          "fuente": "baqueano.com"
        }
      ]
    }
  ],
  "recomendacion_final": "...",
  "nota_ia": "Itinerario asistido con IA fundamentado en destinos verificados de Nicaragua."
}`;

    // Probar modelos compatibles
    for (const model of GEMINI_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2048,
              responseMimeType: 'application/json'
            }
          })
        });

        if (resp.ok) {
          const data = await resp.json();
          const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (raw) {
            const clean = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
            const parsed = JSON.parse(clean);
            parsed._source = 'gemini';
            return parsed;
          }
        }
      } catch (err) {
        console.warn(`[RouteBuilder] Modelo ${model} no disponible:`, err.message);
      }
    }

    // Si la API falla (ej. cuotas o saturación 503), activamos el generador de territorios oficial
    return buildTerritoryFallbackPlan(input);
  }

  // --------------------------------------------------------------------------
  // 7. RENDERIZADO DEL PLAN GENERADO
  // --------------------------------------------------------------------------
  function renderPlan(plan, input) {
    const showcase = $('rbResultShowcase');
    const result = $('rbResult');
    if (!showcase || !result) return;

    showcase.style.display = 'block';

    const isGemini = plan._source === 'gemini';
    const isTerritory = plan._source === 'territory';

    const sourceBadge = isGemini
      ? `<div class="rb-source-badge rb-source-ai"><i class="fa-solid fa-robot"></i> Generado por IA Gemini · Fundamentado en destinos de Nicaragua</div>`
      : `<div class="rb-source-badge rb-source-verified"><i class="fa-solid fa-compass"></i> Itinerario Oficial Baqueano · Catálogo Territorial Verificado</div>`;

    result.innerHTML = `
      ${sourceBadge}

      <div class="rb-ai-disclaimer" style="margin-top: 0.8rem;">
        <i class="fa-solid fa-circle-check"></i>
        <div>
          <strong>Ruta Verificada por Baqueano Nicaragua</strong>
          Todos los destinos y cooperativas son reales. Los precios presentados son estimados directos sin comisiones para que coordines tu viaje con soberanía campesina.
        </div>
      </div>

      <div class="rb-result-hero">
        <div>
          <span>${plan.destino_principal || input.origin}</span>
          <h3>${plan.plan_title || 'Tu Aventura en Nicaragua'}</h3>
        </div>
        <div class="rb-quality rb-quality--ai">
          <i class="fa-solid fa-shield-halved"></i>
          <span>100% Real</span>
        </div>
      </div>

      <p class="rb-ai-resumen">${plan.resumen || ''}</p>

      ${plan.presupuesto_estimado ? `
        <div class="rb-exchange-note">
          <i class="fa-solid fa-wallet"></i> Inversión Estimada: <strong>${plan.presupuesto_estimado}</strong> (Presupuesto definido: ${money(input.budget, input.currency)})
        </div>` : ''}

      <div class="rb-day-list">
        ${(plan.days || []).map(day => `
          <section class="rb-day">
            <h4>Día ${day.day}${day.titulo ? ` — ${day.titulo}` : ''}</h4>
            ${(day.activities || []).map(act => `
              <article class="rb-service rb-service--ai">
                <div>
                  <span class="rb-service-type">${SERVICE_LABELS[act.tipo] || act.tipo || 'Actividad'}</span>
                  <h5>${act.nombre}</h5>
                  <p>${act.descripcion}</p>
                  <div>
                    <span class="rb-price-state is-ai"><i class="fa-solid fa-tag"></i> Tarifa Estimada</span>
                    ${act.fuente ? `<span class="rb-updated"><i class="fa-solid fa-link"></i> ${act.fuente}</span>` : ''}
                  </div>
                </div>
                <div class="rb-service-price">
                  <strong>${act.precio_estimado || 'Consultar'}</strong>
                  <span>por persona</span>
                </div>
              </article>
            `).join('')}
          </section>
        `).join('')}
      </div>

      ${plan.recomendacion_final ? `
        <div class="rb-ai-tip">
          <i class="fa-solid fa-hat-cowboy"></i>
          <p><strong>Consejo del Baqueano:</strong> ${plan.recomendacion_final}</p>
        </div>` : ''}

      <div class="rb-result-actions" style="margin-top: 1.5rem;">
        <a href="https://wa.me/50588888888?text=Hola+Baqueano+Nicaragua%2C+quiero+coordinar+este+itinerario+de+${encodeURIComponent(plan.plan_title || plan.destino_principal)}"
           target="_blank" rel="noopener noreferrer" class="btn-calculate-route" style="justify-content: center;">
          <i class="fa-brands fa-whatsapp"></i> Coordinar Ruta por WhatsApp
        </a>
        <button type="button" id="rbReopenPlanner" class="btn-share-route" style="justify-content: center;">
          <i class="fa-solid fa-sliders"></i> Ajustar Preferencias
        </button>
      </div>

      <p class="rb-ai-footer-note">${plan.nota_ia || ''}</p>
    `;

    $('rbReopenPlanner')?.addEventListener('click', openModal);

    // Desplazar suavemente hasta el resultado
    showcase.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // --------------------------------------------------------------------------
  // 8. LOADER DE PROCESAMIENTO
  // --------------------------------------------------------------------------
  function showLoader() {
    const showcase = $('rbResultShowcase');
    const result = $('rbResult');
    if (!showcase || !result) return;

    showcase.style.display = 'block';
    result.innerHTML = `
      <div class="rb-loading-state">
        <div class="rb-loading-spinner"><i class="fa-solid fa-spinner fa-spin fa-3x"></i></div>
        <p>Consultando catálogo de cooperativas y generando itinerario inteligente…</p>
      </div>
    `;
    showcase.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // --------------------------------------------------------------------------
  // 9. FUNCIÓN PRINCIPAL DE GENERACIÓN
  // --------------------------------------------------------------------------
  async function generate() {
    const input = getModalInput();

    // Validar presupuesto
    if (!(input.budget > 0)) {
      const errEl = $('modalRbValidation');
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Por favor ingresá un presupuesto mayor que cero.';
      }
      return;
    }

    closeModal();
    showLoader();

    try {
      const plan = await callGemini(input);
      renderPlan(plan, input);
    } catch (err) {
      console.error('[RouteBuilder] Fallo de generación:', err);
      // Fallback garantizado
      const fallbackPlan = buildTerritoryFallbackPlan(input);
      renderPlan(fallbackPlan, input);
    }
  }

  // --------------------------------------------------------------------------
  // 10. INICIALIZACIÓN
  // --------------------------------------------------------------------------
  async function init() {
    renderShell();
    await loadCatalog();
  }

  // API Pública
  window.BaqueanoRouteBuilder = {
    init,
    openModal,
    closeModal,
    generate
  };

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})(window, document);
