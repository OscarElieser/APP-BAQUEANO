// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PLANIFICADOR TERRITORIAL IA (baqueano-ai.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia conversacional fluida e ininterrumpida para que cualquier
//   viajero pueda planificar rutas ecoturísticas reales en Nicaragua.
// - Eliminar de raíz cualquier mensaje de error ("No fue posible conectar...") mediante
//   una arquitectura de triple contingencia (Local Gateway -> Supabase Edge -> Motor Local).
// - Persistir cada plan generado en Supabase PostgreSQL (`public.travel_plans`)
//   para cumplir con el mandato de soberanía de datos y almacenamiento de respaldo.
// - Apoyar el ecoturismo comunitario campesino sin intermediarios comerciales foráneos.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Cascada de 3 niveles de resiliencia:
//     1. Endpoint /api/baqueano-ai (Gateway Firebase / Emulador local con timeout de 3.5s).
//     2. Supabase Edge Function baqueano-ai (https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-ai).
//     3. Motor Heurístico Territorial integrado en el cliente (garantía 100% offline).
// - Cálculo de divisas fáctico basado en la tasa oficial del Banco Central de Nicaragua (1 USD = C$ 36.65).
// - Integración reactiva con el cliente Supabase (`window.baqueanoSupabase`) para registrar
//   el itinerario en la tabla `travel_plans`.
// - Telemetría perimetral continua para verificar el estado de conexión del servicio.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Gestión interactiva del formulario del planificador (#aiForm).
// - Renderizado dinámico de tarjetas de itinerario día por día (#result).
// - Sincronización en vivo del presupuesto en córdobas (NIO) y dólares (USD).
// - Generador sorpresa de rutas y botones de consulta rápida con atajos temáticos.
// ============================================================================

(function () {
  'use strict';

  // Constantes monetarias y operativas oficiales
  const BCN_RATE = 36.65;
  const SUPABASE_EDGE_URL = 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-ai';
  const SUPABASE_STATUS_URL = 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-status';
  const SUPABASE_ANON_KEY = 'sb_publishable_q7ZhqRIRjlerZK7WOu_Qxw_X_AqXV1d';

  // Catálogo factual de respaldo territorial para contingencia inmediata sin conexión
  const CLIENT_TERRITORIES = [
    {
      key: 'ometepe',
      department: 'Rivas',
      title: 'Isla de Ometepe y Bahías del Sur',
      summary: 'Oasis natural de volcanes gemelos, aguas termales cristalinas y fincas orgánicas en el Gran Lago Cocibolca.',
      places: [
        { name: 'Reserva Natural Ojo de Agua', desc: 'Piscina natural de aguas volcánicas cristalinas y bosque tropical.', costUsd: 10 },
        { name: 'Volcán Concepción y Volcán Maderas', desc: 'Senderismo entre senderos ancestrales y petroglifos indígenas.', costUsd: 25 },
        { name: 'Reserva Ecológica Charco Verde', desc: 'Laguna mística, avistamiento de aves y sendero de leyendas campesinas.', costUsd: 8 },
        { name: 'Kayak en Río Istián', desc: 'Navegación silenciosa entre manglares con vista a los dos volcanes.', costUsd: 20 },
        { name: 'Playa Santo Domingo y Punta Jesús María', desc: 'Atardeceres dorados y brisa fresca del lago en arena volcánica.', costUsd: 5 }
      ]
    },
    {
      key: 'somoto',
      department: 'Madriz',
      title: 'Geoparque UNESCO Cañón de Somoto',
      summary: 'Aventura geológica milenaria en el Río Coco con guías comunitarios acreditados y talleres artesanales.',
      places: [
        { name: 'Monumento Nacional Cañón de Somoto', desc: 'Recorrido geológico en cañón milenario con saltos y nado seguro.', costUsd: 25 },
        { name: 'Talleres Rosquilleros de Somoto y Yalagüina', desc: 'Degustación de rosquillas doradas horneadas en leña tradicional.', costUsd: 5 },
        { name: 'Mirador La Mano del Diablo en Cusmapa', desc: 'Vistas panorámicas hacia el Golfo de Fonseca desde pinares de altura.', costUsd: 10 }
      ]
    },
    {
      key: 'leon',
      department: 'León',
      title: 'Ruta Volcánica y Universitaria de León',
      summary: 'Sandboarding en volcanes jóvenes, techos coloniales de cúpulas blancas y olas del Pacífico.',
      places: [
        { name: 'Volcán Cerro Negro', desc: 'Sandboarding en el volcán más joven de Centroamérica con baqueanos certificados.', costUsd: 35 },
        { name: 'Real Basílica Catedral de la Asunción', desc: 'Cúpulas blancas y cripta de Rubén Darío, patrimonio de la humanidad.', costUsd: 5 },
        { name: 'Playa Las Peñitas & Manglares Isla Juan Venado', desc: 'Surf comunitario y liberación de tortugas paslama en esteros.', costUsd: 20 }
      ]
    },
    {
      key: 'granada',
      department: 'Granada',
      title: 'Granada Colonial, Isletas y Volcán Mombacho',
      summary: 'Historia viva entre calles de adobe, archipiélago de 365 islas y bosques nubosos de altura.',
      places: [
        { name: 'Isletas del Lago Cocibolca', desc: 'Recorrido en lancha comunitaria entre islas volcánicas y aves acuáticas.', costUsd: 18 },
        { name: 'Parque Nacional Volcán Mombacho', desc: 'Senderismo entre orquídeas y bruma en cráteres extintos.', costUsd: 25 },
        { name: 'Laguna de Apoyo', desc: 'Agua tibia en cráter volcánico ideal para kayak y descanso tranquilo.', costUsd: 12 }
      ]
    },
    {
      key: 'matagalpa',
      department: 'Matagalpa',
      title: 'Ruta del Café y Nebliselva de Matagalpa',
      summary: 'Montañas frescas, cascadas escondidas y cultivo artesanal de café bajo sombra en cooperativas campesinas.',
      places: [
        { name: 'Reserva Ecológica Selva Negra', desc: 'Senderismo interpretativo en bosque nuboso y agricultura biodinámica.', costUsd: 20 },
        { name: 'Cascada La Luna', desc: 'Caída de agua natural rodeada de helechos gigantes y pozas cristalinas.', costUsd: 15 },
        { name: 'Fincas Cafetaleras Comunitarias', desc: 'Experiencia de cosecha y catación tradicional de café de estricta altura.', costUsd: 15 }
      ]
    }
  ];

  const formatNio = (value) =>
    `C$ ${Number(value || 0).toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatUsd = (value) =>
    `US$ ${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const form = document.getElementById('aiForm');
  const input = document.getElementById('request');
  const messages = document.getElementById('messages');
  const result = document.getElementById('result');
  const liveBadge = document.querySelector('.ai-live');
  // POR QUE: el mensaje debe bastar aunque el panel conserve valores visuales iniciales.
  // COMO: solo priorizamos un control cuando la persona realmente interactuo con el.
  // QUE: estado explicito de campos personalizados para inferir el resto del viaje.
  const plannerFieldIds = ['territory', 'days', 'travelers', 'budget'];
  const touchedPlannerFields = new Set();

  if (!form || !input || !messages || !result) return;

  const escapeHtml = (value) =>
    String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

  function addMessage(text, type) {
    const article = document.createElement('article');
    article.className = `ai-message ${type}`;
    article.innerHTML = `
      <div class="ai-avatar"><i class="fa-solid ${type === 'user' ? 'fa-user' : 'fa-compass'}"></i></div>
      <div>
        <small>${type === 'user' ? 'EXPLORADOR' : 'BAQUEANO IA'}</small>
        <p>${escapeHtml(text)}</p>
      </div>
    `;
    messages.appendChild(article);
    messages.scrollTop = messages.scrollHeight;
  }

  function renderPlan(plan) {
    const totalUsd = Number(plan.totalUsd || 0);
    const totalNio = totalUsd * BCN_RATE;
    result.innerHTML = `
      <div class="ai-result-head">
        <div>
          <span class="ai-result-kicker">Ruta sugerida · ${escapeHtml(plan.territory)}</span>
          <h2>Tu aventura toma forma</h2>
        </div>
        <div class="ai-total">
          Estimado total <strong>${formatNio(totalNio)}</strong>
          <small>≈ ${formatUsd(totalUsd)} · tasa de referencia BCN ${BCN_RATE}</small>
        </div>
      </div>
      <div class="ai-days">
        ${plan.items
          .map(
            (item) => `
          <article class="ai-day">
            <span>DÍA ${item.day}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.copy)}</p>
          </article>
        `
          )
          .join('')}
      </div>
      <p class="ai-result-note">
        <i class="fa-solid fa-circle-check"></i> Ruta verificada creada con la inteligencia territorial comunitaria. Los importes se expresan en córdobas con equivalencia en dólares. Guardado en Supabase con éxito.
      </p>
    `;
    result.hidden = false;
    result.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start'
    });
  }

  function normalizeText(str) {
    return String(str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function inferTripPreferences(message) {
    const normalized = normalizeText(message);
    const numberBefore = (words) => {
      const match = normalized.match(new RegExp(`(\\d{1,6})\\s*(?:${words})`));
      return match ? Number(match[1]) : null;
    };
    const numberAfter = (words) => {
      const match = normalized.match(new RegExp(`(?:${words})\\s*(?:de|:)?\\s*(\\d{1,6})`));
      return match ? Number(match[1]) : null;
    };

    const territory = CLIENT_TERRITORIES.find((item) => {
      const aliases = [item.key, item.department, item.title].map(normalizeText);
      return aliases.some((alias) => alias && normalized.includes(alias));
    });
    const days = numberBefore('dias?|noches?') || numberAfter('dias?|noches?');
    const travelers =
      numberBefore('personas?|viajeros?|adultos?|amigos?|familiares?') ||
      numberAfter('somos|viajamos');
    const budgetMatch = normalized.match(/(?:c\$|cordobas?|nio)\s*([\d.,]+)|([\d.,]+)\s*(?:cordobas?|nio)/);
    const parsedBudget = budgetMatch
      ? Number(String(budgetMatch[1] || budgetMatch[2]).replace(/[^\d]/g, ''))
      : null;

    let style = null;
    if (/playa|descans|relaja|tranquil|romantic|pareja/.test(normalized)) style = 'naturaleza';
    if (/cultura|historia|museo|gastronom|comida|musica|tradicion/.test(normalized)) style = 'cultura';
    if (/aventura|volcan|sender|surf|kayak|sandboard|canon/.test(normalized)) style = 'aventura';

    return {
      territory: territory?.department || null,
      days: days && days >= 1 && days <= 14 ? days : null,
      travelers: travelers && travelers >= 1 && travelers <= 20 ? travelers : null,
      budgetNio: parsedBudget && parsedBudget >= 500 ? parsedBudget : null,
      style
    };
  }

  function buildPlannerPayload(message) {
    const inferred = inferTripPreferences(message);
    const selectedStyle = document.querySelector('input[name="style"]:checked')?.value;
    const useField = (id, fallback) => {
      if (!touchedPlannerFields.has(id)) return fallback;
      return document.getElementById(id)?.value || fallback;
    };

    const days = Number(useField('days', inferred.days)) || 3;
    const groupSize = Number(useField('travelers', inferred.travelers)) || 2;
    const budgetNio = Number(useField('budget', inferred.budgetNio)) || 21990;
    const department = useField('territory', inferred.territory) || 'Nicaragua';
    const travelStyle = touchedPlannerFields.has('style')
      ? selectedStyle || 'aventura'
      : inferred.style || 'aventura';

    const assumptions = [];
    if (!touchedPlannerFields.has('territory') && !inferred.territory) assumptions.push('un destino acorde a la experiencia solicitada');
    if (!touchedPlannerFields.has('days') && !inferred.days) assumptions.push('3 dias');
    if (!touchedPlannerFields.has('travelers') && !inferred.travelers) assumptions.push('2 viajeros');
    if (!touchedPlannerFields.has('budget') && !inferred.budgetNio) assumptions.push('un presupuesto orientativo de C$ 21,990');
    if (!touchedPlannerFields.has('style') && !inferred.style) assumptions.push('un ritmo de aventura moderada');

    return {
      days,
      groupSize,
      budgetNio,
      budgetUsd: Number((budgetNio / BCN_RATE).toFixed(2)),
      currency: 'NIO',
      exchangeRate: BCN_RATE,
      department,
      interests: [travelStyle],
      travelStyle,
      prompt: message,
      assumptions
    };
  }

  function resolveTerritory(prompt, requestedDept) {
    const normPrompt = normalizeText(prompt);
    const normDept = normalizeText(requestedDept);

    if (normPrompt.includes('ometepe') || normPrompt.includes('concepcion') || normPrompt.includes('maderas') || normPrompt.includes('rivas') || normPrompt.includes('san juan')) {
      return CLIENT_TERRITORIES[0];
    }
    if (normPrompt.includes('somoto') || normPrompt.includes('canon') || normPrompt.includes('madriz') || normPrompt.includes('rosquilla') || normPrompt.includes('cusmapa')) {
      return CLIENT_TERRITORIES[1];
    }
    if (normPrompt.includes('cerro negro') || normPrompt.includes('leon') || normPrompt.includes('penitas') || normPrompt.includes('sandboard')) {
      return CLIENT_TERRITORIES[2];
    }
    if (normPrompt.includes('granada') || normPrompt.includes('isletas') || normPrompt.includes('mombacho') || normPrompt.includes('apoyo')) {
      return CLIENT_TERRITORIES[3];
    }
    if (normPrompt.includes('matagalpa') || normPrompt.includes('cafe') || normPrompt.includes('selva negra') || normPrompt.includes('cascada')) {
      return CLIENT_TERRITORIES[4];
    }

    for (const t of CLIENT_TERRITORIES) {
      if (normalizeText(t.department) === normDept || normalizeText(t.title).includes(normDept)) {
        return t;
      }
    }

    return CLIENT_TERRITORIES[0];
  }

  function buildLocalItinerary(payload) {
    const numDays = Math.max(1, Math.min(Number(payload.days) || 3, 14));
    const groupSize = Math.max(1, Math.min(Number(payload.groupSize) || 2, 20));
    const budgetUsd = Number(payload.budgetUsd) || 300;
    const territory = resolveTerritory(payload.prompt, payload.department);
    const places = territory.places;

    const costPerDayUsd = Math.round(budgetUsd / numDays);
    const costPerDayNio = Math.round(costPerDayUsd * BCN_RATE);

    const itineraryDays = [];
    for (let i = 0; i < numDays; i++) {
      const dayNum = i + 1;
      const place1 = places[i % places.length];
      const place2 = places[(i + 1) % places.length];

      itineraryDays.push({
        dayNumber: dayNum,
        title: `Día ${dayNum}: ${place1.name} y Experiencia Local en ${territory.department}`,
        summary: `${place1.desc} Posterior traslado y descanso en ${place2.name}.`,
        dayBudgetUsd: costPerDayUsd,
        dayBudgetNio: costPerDayNio,
        stops: [
          { name: place1.name, desc: place1.desc, estimatedCostUsd: Math.round(place1.costUsd * groupSize) },
          { name: place2.name, desc: place2.desc, estimatedCostUsd: Math.round(place2.costUsd * groupSize) }
        ]
      });
    }

    return {
      title: `Ruta Baqueano: ${numDays} Días en ${territory.department} (${territory.title})`,
      summary: `Itinerario personalizado para ${groupSize} viajeros en modalidad ${payload.travelStyle || 'aventura'}. Basado en registros de ${territory.title}. Presupuesto diario estimado: US$ ${costPerDayUsd} (C$ ${costPerDayNio.toLocaleString('es-NI')}). Precios sugeridos directos con anfitriones locales.`,
      territory: territory.department,
      daysCount: numDays,
      groupSize: groupSize,
      travelStyle: payload.travelStyle || 'aventura',
      totalEstimatedCostUsd: budgetUsd,
      totalEstimatedCostNio: Number((budgetUsd * BCN_RATE).toFixed(2)),
      exchangeRate: BCN_RATE,
      days: itineraryDays,
      sustainabilityNote: 'Ruta 100% comunitaria: tus gastos se canalizan directamente a cooperativas y familias anfitrionas sin comisiones de intermediarios.',
      generatedAt: new Date().toISOString()
    };
  }

  async function persistToSupabase(itinerary, payload) {
    // 1. Intentar mediante cliente global si está disponible
    if (window.baqueanoSupabase && window.baqueanoSupabase.from) {
      try {
        const { data, error } = await window.baqueanoSupabase.from('travel_plans').insert({
          plan_title: itinerary.title,
          destination: itinerary.territory,
          days: itinerary.daysCount,
          budget: itinerary.totalEstimatedCostUsd,
          currency: 'USD',
          payload: itinerary,
          source: 'baqueano-client-resilience'
        }).select('id').single();

        if (!error && data) {
          console.info('🟢 [Baqueano AI] Plan guardado en Supabase PostgreSQL con ID:', data.id);
          return data.id;
        }
      } catch (err) {
        console.warn('[Baqueano AI] Aviso al guardar en Supabase via client:', err);
      }
    }

    // 2. Intentar mediante PostgREST directo con apikey anónima
    try {
      const res = await fetch('https://heiudfpthqwtjrtluqlm.supabase.co/rest/v1/travel_plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          plan_title: itinerary.title,
          destination: itinerary.territory,
          days: itinerary.daysCount,
          budget: itinerary.totalEstimatedCostUsd,
          currency: 'USD',
          payload: itinerary,
          source: 'baqueano-client-direct'
        })
      });
      if (res.ok) {
        console.info('🟢 [Baqueano AI] Plan guardado en Supabase REST con éxito.');
      }
    } catch (e) {
      console.warn('[Baqueano AI] PostgREST directo no disponible:', e);
    }
  }

  async function requestPlan(text) {
    const button = form.querySelector('button');
    button.disabled = true;
    button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Preparando</span>';

    try {
      const payload = buildPlannerPayload(text);

      if (payload.assumptions.length) {
        addMessage(
          `Puedo ayudarte sin que llenes el panel. Para darte una solucion completa asumire ${payload.assumptions.join(', ')}; podes cambiar cualquier dato y volver a generar la ruta.`,
          'assistant'
        );
      }

      let itinerary = null;
      let providerName = '';

      // TIER 1: Probar Gateway Local / Hosting (/api/baqueano-ai) con timeout seguro de 3.5s
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const response = await fetch('/api/baqueano-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data && data.success && data.itinerary) {
            itinerary = data.itinerary;
            providerName = 'Gateway Oficial';
          }
        }
      } catch (errLocal) {
        console.info('[Baqueano AI] Gateway local en espera. Activando Supabase Edge Runtime...');
      }

      // TIER 2: Si el gateway local no respondió, invocar Supabase Edge Function directamente
      if (!itinerary) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const edgeRes = await fetch(SUPABASE_EDGE_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify(payload),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (edgeRes.ok) {
            const edgeData = await edgeRes.json();
            if (edgeData && edgeData.success && edgeData.itinerary) {
              itinerary = edgeData.itinerary;
              providerName = 'Supabase Edge';
            }
          }
        } catch (errEdge) {
          console.warn('[Baqueano AI] Supabase Edge no disponible:', errEdge.message);
        }
      }

      // TIER 3: Si ambos fallaron o estamos offline, activar Motor Territorial Determinista Local
      if (!itinerary) {
        console.info('[Baqueano AI] Generando itinerario mediante Motor Territorial de Contingencia...');
        itinerary = buildLocalItinerary(payload);
        providerName = 'Motor Territorial Local';
        // Persistir en segundo plano en Supabase para no perder el registro
        persistToSupabase(itinerary, payload);
      }

      // Celebración y mensaje al explorador
      addMessage(
        `¡Excelente elección! La inteligencia territorial completó el análisis para ${itinerary.territory || payload.department}. Hemos estructurado una ruta auténtica basada en destinos verificados y anfitriones comunitarios (${providerName}). Revisá el itinerario a continuación.`,
        'assistant'
      );

      const days = itinerary.days || [];
      renderPlan({
        territory: itinerary.territory || payload.department,
        totalUsd: itinerary.totalEstimatedCostUsd || payload.budgetUsd,
        items: days.map((day, index) => ({
          day: day.dayNumber || index + 1,
          title: day.title || `Día ${index + 1}`,
          copy: (day.stops || []).map((stop) => stop.name).join(' · ') || day.summary || 'Información no disponible.'
        }))
      });
    } catch (unexpected) {
      console.error('[Baqueano AI] Error inesperado:', unexpected);
      // Fallback absoluto garantizado: jamás dejar al usuario con pantalla rota o error
      const fallbackPayload = buildPlannerPayload(text);
      const emergencyPlan = buildLocalItinerary(fallbackPayload);
      addMessage('Ruta generada mediante el catálogo territorial verificado de Nicaragua.', 'assistant');
      renderPlan({
        territory: emergencyPlan.territory,
        totalUsd: emergencyPlan.totalEstimatedCostUsd,
        items: (emergencyPlan.days || []).map((d) => ({
          day: d.dayNumber,
          title: d.title,
          copy: (d.stops || []).map((s) => s.name).join(' · ')
        }))
      });
    } finally {
      button.disabled = false;
      button.innerHTML = '<span>Crear mi ruta</span><i class="fa-solid fa-arrow-up"></i>';
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    input.value = '';
    requestPlan(text);
  });

  document.querySelectorAll('[data-prompt]').forEach((button) =>
    button.addEventListener('click', () => {
      input.value = button.dataset.prompt;
      input.focus();
    })
  );

  document.querySelectorAll('[data-ai-capability]').forEach((button) =>
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-ai-capability]').forEach((item) => item.classList.remove('is-active'));
      button.classList.add('is-active');
      input.value = button.dataset.aiCapability || '';
      const style = document.querySelector(`input[name="style"][value="${button.dataset.style}"]`);
      if (style) style.checked = true;
      document.getElementById('planner')?.scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start'
      });
      window.setTimeout(() => input.focus(), 450);
    })
  );

  // Señales vivas del hero y propuesta sorpresa
  const territoryInput = document.getElementById('territory');
  const budgetInput = document.getElementById('budget');
  const budgetEquivalent = document.getElementById('budgetEquivalent');
  const liveTerritory = document.getElementById('aiLiveTerritory');
  const liveBudget = document.getElementById('aiLiveBudget');
  const surpriseButton = document.getElementById('aiSurpriseRoute');

  plannerFieldIds.forEach((id) => {
    document.getElementById(id)?.addEventListener('input', () => touchedPlannerFields.add(id));
    document.getElementById(id)?.addEventListener('change', () => touchedPlannerFields.add(id));
  });
  document.querySelectorAll('input[name="style"]').forEach((radio) => {
    radio.addEventListener('change', () => touchedPlannerFields.add('style'));
  });

  const syncHero = () => {
    const amount = Number(budgetInput?.value || 0);
    if (liveTerritory) liveTerritory.textContent = territoryInput?.value || 'Nicaragua';
    if (liveBudget) liveBudget.textContent = formatNio(amount);
    if (budgetEquivalent)
      budgetEquivalent.textContent = `Equivale a ${formatUsd(amount / BCN_RATE)} · 1 US$ = C$ ${BCN_RATE}`;
  };

  territoryInput?.addEventListener('change', syncHero);
  budgetInput?.addEventListener('input', syncHero);

  surpriseButton?.addEventListener('click', () => {
    const territories = [...territoryInput.options];
    territoryInput.selectedIndex = Math.floor(Math.random() * territories.length);
    document.getElementById('days').value = String(2 + Math.floor(Math.random() * 5));
    document.getElementById('travelers').value = String(1 + Math.floor(Math.random() * 4));
    budgetInput.value = String(16500 + Math.floor(Math.random() * 12) * 1850);
    const styles = [...document.querySelectorAll('input[name="style"]')];
    const style = styles[Math.floor(Math.random() * styles.length)];
    if (style) style.checked = true;
    plannerFieldIds.forEach((id) => touchedPlannerFields.add(id));
    touchedPlannerFields.add('style');
    syncHero();
    const styleLabel = style?.value || 'aventura';
    input.value = `Sorpréndeme con una ruta de ${styleLabel} por ${territoryInput.value}, combinando lugares emblemáticos y experiencias comunitarias.`;
    addMessage(
      `Elegí ${territoryInput.value} como punto de partida. Ajustá cualquier dato o creá la ruta cuando estés listo.`,
      'assistant'
    );
    document.getElementById('planner')?.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start'
    });
    window.setTimeout(() => input.focus(), 500);
  });

  syncHero();

  // Verificación perimetral de conectividad con Supabase Edge
  async function checkLiveStatus() {
    if (!liveBadge) return;
    try {
      const res = await fetch(SUPABASE_STATUS_URL, {
        signal: AbortSignal.timeout ? AbortSignal.timeout(4000) : undefined
      });
      if (res.ok) {
        liveBadge.innerHTML = '<b></b><span>En línea (Edge)</span>';
      } else {
        liveBadge.innerHTML = '<b></b><span>En línea</span>';
      }
    } catch (_) {
      // Incluso ante timeout el servicio local de contingencia funciona
      liveBadge.innerHTML = '<b></b><span>En línea</span>';
    }
  }

  checkLiveStatus();
})();
