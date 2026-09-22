// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PLANIFICADOR TURÍSTICO INTELIGENTE (route-builder.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Construir itinerarios respetando el presupuesto real del explorador.
// - Priorizar siempre datos verificados del catálogo Firestore de Baqueano;
//   cuando no hay registros suficientes, enriquecer con Gemini AI usando
//   los datos oficiales del sitio como contexto verificado.
// - Nunca presentar precios inventados como tarifas reales.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - STEP 1: Consulta Firestore → tourism_services (precios registrados).
// - STEP 2: Si Firestore devuelve 0 resultados → llama a Gemini 2.0 Flash
//           con territorios de Nicaragua (window.BAQUEANO_TERRITORIES) como
//           contexto fundamentado, para generar un plan verificable.
// - Formulario compacto: 5 campos visibles + acordeón de opciones avanzadas.
// - Badge de fuente diferenciado: ✅ Verificado · 🕐 Publicado · 🤖 IA Baqueano.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES):
// - window.BaqueanoRouteBuilder.init() — punto de entrada principal.
// - Renderiza en #routeBuilderSection → .route-builder-grid.
// - Fallback Gemini con prompt estructurado en JSON.
// ============================================================================

(function (window, document) {
  'use strict';

  // --------------------------------------------------------------------------
  // CONSTANTES
  // --------------------------------------------------------------------------
  const COLLECTION       = 'tourism_services';
  const PLAN_COLLECTION  = 'travelPlans';
  // La credencial de IA nunca debe enviarse al navegador. El despliegue puede
  // inyectar una URL de proxy administrada mediante window.BAQUEANO_CONFIG.
  const GEMINI_PROXY_ENDPOINT = String(
    window.BAQUEANO_CONFIG?.geminiProxyEndpoint || ''
  ).trim();

  const SERVICE_LABELS = {
    transporte:               'Transporte',
    hospedaje:                'Hospedaje',
    alimentacion:             'Alimentación',
    entrada:                  'Entradas',
    guia:                     'Guías locales',
    actividad:                'Actividades',
    day_pass:                 'Day Pass',
    alquiler_vehiculo:        'Alquiler de vehículo',
    ferry_panga:              'Ferry / Panga',
    experiencia_comunitaria:  'Experiencias comunitarias'
  };

  const state = { services: [], exchange: null, plan: null, loading: false };

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
  // 1. RENDERIZADO DEL FORMULARIO (simplificado)
  // --------------------------------------------------------------------------
  function renderShell() {
    const section = $('routeBuilderSection');
    if (!section) return;

    const subtext = section.querySelector('.section-subtext');
    if (subtext) {
      subtext.textContent =
        'Decinos cuánto querés gastar, qué querés vivir y cuántos días tenés. ' +
        'BAQUEANO busca primero experiencias con precios registrados; ' +
        'si el catálogo no tiene resultados, nuestro asistente IA genera un plan ' +
        'basado en la información verificada del sitio.';
    }

    const grid = section.querySelector('.route-builder-grid');
    if (!grid) return;

    grid.innerHTML = `
      <!-- ======= COLUMNA IZQUIERDA: FORMULARIO ======= -->
      <div class="builder-card-pro rb-planner-card">
        <div class="builder-header-bar">
          <i class="fa-solid fa-sliders"></i>
          <h3>Datos de tu aventura</h3>
          <span class="rb-live-badge" id="rbCatalogStatus">Conectando…</span>
        </div>

        <form id="routePlannerForm" class="builder-form-body" novalidate>

          <!-- ── CAMPOS ESENCIALES (siempre visibles) ── -->
          <div class="rb-form-grid rb-form-grid--main">

            <!-- Días -->
            <label class="builder-field-group">
              <span class="builder-label"><i class="fa-solid fa-calendar-days"></i> Duración</span>
              <select id="rbDays" class="builder-select">
                <option value="1">1 día (Day Pass)</option>
                <option value="2">2 días</option>
                <option value="3" selected>3 días (Fin de semana)</option>
                <option value="5">5 días</option>
                <option value="7">7 días (Una semana)</option>
                <option value="custom">Personalizado…</option>
              </select>
              <input id="rbCustomDays" class="builder-select" type="number" min="1" max="30"
                     value="4" hidden aria-label="Cantidad de días personalizada">
            </label>

            <!-- Presupuesto -->
            <label class="builder-field-group">
              <span class="builder-label"><i class="fa-solid fa-wallet"></i> ¿Cuánto querés gastar?</span>
              <span class="rb-money-input">
                <select id="rbCurrency" aria-label="Moneda">
                  <option value="NIO">C$ NIO</option>
                  <option value="USD">US$ USD</option>
                </select>
                <input id="rbBudget" type="number" min="1" step="1"
                       inputmode="decimal" placeholder="8000" required>
              </span>
            </label>

            <!-- Salida -->
            <label class="builder-field-group">
              <span class="builder-label"><i class="fa-solid fa-map-pin"></i> Salida desde</span>
              <select id="rbOriginDept" class="builder-select">
                <option>Managua</option><option>León</option><option>Granada</option>
                <option>Rivas</option><option>Masaya</option><option>Carazo</option>
                <option>Estelí</option><option>Matagalpa</option><option>Jinotega</option>
                <option>Madriz</option><option>Chinandega</option><option>Boaco</option>
                <option>Chontales</option><option>Río San Juan</option>
                <option>RACCN</option><option>RACCS</option>
              </select>
            </label>

            <!-- Viajeros -->
            <div class="builder-field-group">
              <span class="builder-label"><i class="fa-solid fa-people-roof"></i> Viajeros</span>
              <div class="rb-inline-inputs">
                <label>Adultos<input id="rbAdults" type="number" min="1" max="30" value="2"></label>
                <label>Niños<input id="rbChildren" type="number" min="0" max="20" value="0"></label>
              </div>
            </div>

            <!-- Modalidad -->
            <label class="builder-field-group rb-span-2">
              <span class="builder-label"><i class="fa-solid fa-user-group"></i> Modalidad</span>
              <select id="rbTravelType" class="builder-select">
                <option value="solo">Viajero solitario</option>
                <option value="pareja">Pareja</option>
                <option value="familia">Familia</option>
                <option value="familia_ninos" selected>Familia con niños</option>
                <option value="amigos">Grupo de amigos</option>
                <option value="mayores">Adultos mayores</option>
                <option value="organizado">Grupo organizado</option>
              </select>
            </label>

          </div><!-- /rb-form-grid--main -->

          <!-- ── INTERESES (chips) ── -->
          <fieldset class="rb-choice-field">
            <legend><i class="fa-solid fa-heart"></i> Intereses</legend>
            <div class="rb-check-grid rb-interest-grid">
              ${['Volcanes','Aventura','Playa','Surf','Ríos','Lagunas','Islas','Montaña',
                 'Senderismo','Ruta del Café','Turismo Rural','Turismo Comunitario',
                 'Gastronomía','Historia','Cultura','Naturaleza','Ecoturismo',
                 'Experiencias campesinas','Fotografía','Música'].map(
                (label, i) =>
                  `<label><input type="checkbox" name="rbInterests" value="${label.toLocaleLowerCase('es')}"
                  ${i < 3 ? 'checked' : ''}><span>${label}</span></label>`
              ).join('')}
            </div>
          </fieldset>

          <!-- ── OPCIONES AVANZADAS (colapsable) ── -->
          <details class="rb-advanced-details">
            <summary class="rb-advanced-summary">
              <i class="fa-solid fa-sliders"></i> Opciones avanzadas
              <i class="fa-solid fa-chevron-down rb-chevron"></i>
            </summary>

            <div class="rb-advanced-body">
              <!-- Reserva de emergencia -->
              <label class="builder-field-group">
                <span class="builder-label"><i class="fa-solid fa-shield-heart"></i> Reserva de emergencia</span>
                <select id="rbEmergency" class="builder-select">
                  <option value="0">No reservar</option>
                  <option value="5">5%</option>
                  <option value="10" selected>10%</option>
                  <option value="15">15%</option>
                  <option value="20">20%</option>
                  <option value="custom">Cantidad personalizada</option>
                </select>
                <input id="rbEmergencyCustom" class="builder-select" type="number"
                       min="0" step="0.01" value="0" hidden aria-label="Reserva personalizada">
              </label>

              <!-- Condición física -->
              <label class="builder-field-group">
                <span class="builder-label"><i class="fa-solid fa-person-hiking"></i> Condición física</span>
                <select id="rbFitness" class="builder-select">
                  <option value="ligera">Ligera</option>
                  <option value="moderada" selected>Moderada</option>
                  <option value="avanzada">Avanzada</option>
                </select>
              </label>

              <!-- Accesibilidad -->
              <label class="builder-field-group">
                <span class="builder-label"><i class="fa-solid fa-universal-access"></i> Accesibilidad</span>
                <select id="rbAccessibility" class="builder-select">
                  <option value="ninguna">Sin requerimientos especiales</option>
                  <option value="movilidad_reducida">Movilidad reducida</option>
                  <option value="silla_ruedas">Usuario de silla de ruedas</option>
                  <option value="adulto_mayor">Adulto mayor</option>
                  <option value="transporte_accesible">Transporte accesible</option>
                </select>
              </label>

              <!-- Estancia -->
              <label class="builder-field-group">
                <span class="builder-label"><i class="fa-solid fa-bed"></i> Tipo de estancia</span>
                <select id="rbStayMode" class="builder-select">
                  <option value="cualquiera">Cualquiera</option>
                  <option value="hotel">Hotel</option>
                  <option value="hostal">Hostal</option>
                  <option value="posada">Posada</option>
                  <option value="rural">Hospedaje rural</option>
                  <option value="familia">Casa de familia</option>
                  <option value="eco_lodge">Eco lodge</option>
                  <option value="finca">Finca turística</option>
                  <option value="camping">Camping</option>
                  <option value="sin_hospedaje">Sin hospedaje</option>
                </select>
              </label>

              <!-- Servicios a incluir -->
              <fieldset class="rb-choice-field">
                <legend>¿Qué incluir en el presupuesto?</legend>
                <div class="rb-check-grid">
                  ${Object.entries(SERVICE_LABELS).map(([value, label]) =>
                    `<label><input type="checkbox" name="rbServices" value="${value}"
                    ${['hospedaje','alimentacion','entrada','actividad'].includes(value) ? 'checked' : ''}
                    ><span>${label}</span></label>`
                  ).join('')}
                </div>
              </fieldset>

              <!-- Transporte -->
              <fieldset class="rb-choice-field">
                <legend>Transporte posible</legend>
                <div class="rb-check-grid">
                  ${['Bus local','Vehículo propio','4x4','Cooperativa','Taxi privado',
                     'Alquiler de vehículo','Ferry','Panga'].map(
                    (label, i) =>
                      `<label><input type="checkbox" name="rbTransport"
                      value="${label.toLowerCase().replaceAll(' ','_')}"
                      ${i === 0 ? 'checked' : ''}><span>${label}</span></label>`
                  ).join('')}
                </div>
              </fieldset>
            </div><!-- /rb-advanced-body -->
          </details>

          <!-- Validación -->
          <div class="rb-validation" id="rbValidation" role="alert" hidden></div>

          <!-- Botón submit -->
          <button type="submit" class="btn-calculate-route" id="btnCalculateRoute">
            <i class="fa-solid fa-route"></i> Construir mi aventura
          </button>

        </form>
      </div>

      <!-- ======= COLUMNA DERECHA: RESULTADO ======= -->
      <div class="builder-card-pro builder-result-card">
        <div class="builder-header-bar">
          <i class="fa-solid fa-map-location-dot"></i>
          <h3>Tu Aventura BAQUEANO</h3>
        </div>
        <div class="builder-result-content" id="rbResult">
          <div class="rb-honest-empty">
            <i class="fa-solid fa-route"></i>
            <h4>Esperando tus preferencias</h4>
            <p>Llená el formulario y presioná <strong>Construir mi aventura</strong>. Primero buscamos en nuestro catálogo verificado; si no hay resultados, nuestra IA genera un plan con información real de Nicaragua.</p>
          </div>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 2. NORMALIZAR SERVICIO DE FIRESTORE
  // --------------------------------------------------------------------------
  function normalizeService(doc) {
    const raw = doc.data ? doc.data() : doc;
    const expiration = raw.fechaVencimiento?.toDate
      ? raw.fechaVencimiento.toDate()
      : new Date(raw.fechaVencimiento || 0);
    const expired =
      raw.fechaVencimiento &&
      !Number.isNaN(expiration.getTime()) &&
      expiration < new Date();
    const numericPrice = Number(raw.precio);
    const status = expired
      ? 'precio_desactualizado'
      : raw.estadoPrecio || (raw.verificado ? 'verificado' : 'publicado');
    return {
      id: doc.id || raw.id,
      ...raw,
      precio: numericPrice,
      estadoPrecio: status,
      usable:
        numericPrice > 0 &&
        ['verificado', 'publicado'].includes(status) &&
        raw.disponibilidad === true &&
        !['no_disponible', 'cerrado_temporalmente'].includes(raw.estadoDisponibilidad)
    };
  }

  // --------------------------------------------------------------------------
  // 3. CARGA DEL CATÁLOGO DESDE FIRESTORE
  // --------------------------------------------------------------------------
  async function loadCatalog() {
    const firestore = db();
    if (!firestore) throw new Error('Firebase no está disponible.');
    const [servicesSnap, exchangeSnap] = await Promise.all([
      firestore.collection(COLLECTION).get(),
      firestore.collection('app_config').doc('exchange_rate').get()
    ]);
    state.services = servicesSnap.docs.map(normalizeService);
    state.exchange = exchangeSnap.exists ? exchangeSnap.data() : null;
    const usable = state.services.filter(s => s.usable).length;
    const badge = $('rbCatalogStatus');
    if (badge) {
      badge.textContent = usable > 0
        ? `${usable} tarifas verificadas`
        : 'Catálogo sin tarifas · IA lista';
      badge.classList.toggle('is-ready', usable > 0);
    }
  }

  // --------------------------------------------------------------------------
  // 4. LEER INPUTS DEL FORMULARIO
  // --------------------------------------------------------------------------
  function selected(name) {
    return [...document.querySelectorAll(`[name="${name}"]:checked`)].map(el => el.value);
  }

  function getInput() {
    const budget   = Number($('rbBudget').value);
    const days     = $('rbDays').value === 'custom'
      ? Number($('rbCustomDays').value)
      : Number($('rbDays').value);
    const emergencyValue = $('rbEmergency').value;
    const reserve  = emergencyValue === 'custom'
      ? Number($('rbEmergencyCustom').value)
      : budget * Number(emergencyValue) / 100;
    const includedServices = selected('rbServices');
    return {
      budget,
      currency:    $('rbCurrency').value,
      days,
      reserve,
      available:   budget - reserve,
      adults:      Number($('rbAdults').value),
      children:    Number($('rbChildren').value),
      origin:      $('rbOriginDept').value,
      travelType:  $('rbTravelType').value,
      fitness:     $('rbFitness').value,
      accessibility: $('rbAccessibility').value,
      stayMode:    $('rbStayMode').value,
      includedServices: includedServices.length
        ? includedServices
        : ['hospedaje', 'alimentacion', 'entrada', 'actividad'],
      transport:   selected('rbTransport'),
      interests:   selected('rbInterests')
    };
  }

  // --------------------------------------------------------------------------
  // 5. VALIDACIÓN
  // --------------------------------------------------------------------------
  function validate(input) {
    if (!(input.budget > 0))                            return 'Ingresá un presupuesto mayor que cero.';
    if (!(input.days >= 1 && input.days <= 30))         return 'La duración debe estar entre 1 y 30 días.';
    if (input.reserve < 0 || input.reserve >= input.budget) return 'La reserva de emergencia debe ser menor que el presupuesto.';
    if (input.adults < 1 || input.children < 0)        return 'Revisá la cantidad de viajeros.';
    return '';
  }

  // --------------------------------------------------------------------------
  // 6. CONVERSIÓN DE MONEDA
  // --------------------------------------------------------------------------
  function convert(value, from, to) {
    if (from === to) return value;
    const rate = Number(state.exchange?.tipoCambio);
    if (!(rate > 0)) return null;
    return from === 'USD' ? value * rate : value / rate;
  }

  // --------------------------------------------------------------------------
  // 7. COSTO DE UN SERVICIO
  // --------------------------------------------------------------------------
  function serviceCost(service, input) {
    const base       = service.precio;
    const adults     = input.adults;
    const children   = input.children;
    const hasChild   = service.precioNino !== null && service.precioNino !== undefined && service.precioNino !== '';
    const childPrice = hasChild ? Number(service.precioNino) : null;
    const adultPrice = Number(service.precioAdulto) || base;
    switch (service.tipoPrecio) {
      case 'persona':    return adults * adultPrice + children * (Number.isFinite(childPrice) ? childPrice : adultPrice);
      case 'pareja':     return Math.ceil((adults + children) / 2) * base;
      case 'habitacion': return Math.ceil((adults + children) / Math.max(1, Number(service.capacidadHabitacion) || 2)) * base * input.days;
      case 'noche':      return base * Math.max(0, input.days - 1);
      case 'dia':        return base * input.days;
      default:           return base;
    }
  }

  // --------------------------------------------------------------------------
  // 8. CONSTRUIR PLAN CON DATOS DE FIRESTORE
  // --------------------------------------------------------------------------
  function buildPlan(input) {
    const candidates = state.services
      .filter(s => {
        if (!s.usable || !input.includedServices.includes(s.tipoServicio)) return false;
        if (input.accessibility !== 'ninguna' && Array.isArray(s.incompatibleAccesibilidad) && s.incompatibleAccesibilidad.includes(input.accessibility)) return false;
        if (s.condicionFisica && ['ligera','moderada','avanzada'].indexOf(s.condicionFisica) > ['ligera','moderada','avanzada'].indexOf(input.fitness)) return false;
        if (s.tipoServicio === 'hospedaje' && input.stayMode !== 'cualquiera' && input.stayMode !== 'sin_hospedaje' && s.modalidadEstancia && s.modalidadEstancia !== input.stayMode) return false;
        return true;
      })
      .map(s => {
        const rawCost      = serviceCost(s, input);
        const cost         = convert(rawCost, s.moneda || 'NIO', input.currency);
        const interestScore = (s.intereses || []).filter(v => input.interests.includes(String(v).toLocaleLowerCase('es'))).length;
        return { ...s, calculatedCost: cost, rawCost, interestScore };
      })
      .filter(s => Number.isFinite(s.calculatedCost))
      .sort((a, b) => Number(b.verificado) - Number(a.verificado) || b.interestScore - a.interestScore || a.calculatedCost - b.calculatedCost);

    const chosen = [];
    let total = 0;
    for (const s of candidates) {
      if (total + s.calculatedCost > input.available) continue;
      const sameType = chosen.filter(c => c.tipoServicio === s.tipoServicio).length;
      const limit    = ['alimentacion','actividad','entrada'].includes(s.tipoServicio) ? input.days : 1;
      if (sameType >= limit) continue;
      chosen.push(s);
      total += s.calculatedCost;
    }

    const dayGroups = Array.from({ length: input.days }, (_, i) => ({ day: i + 1, services: [] }));
    chosen.forEach((s, i) => dayGroups[i % input.days].services.push(s));

    return {
      id:            `plan-${Date.now()}`,
      input,
      services:      chosen,
      days:          dayGroups,
      total,
      remaining:     input.available - total,
      createdAt:     new Date().toISOString(),
      verifiedCount: chosen.filter(s => s.verificado).length,
      source:        'firestore'
    };
  }

  // --------------------------------------------------------------------------
  // 9. FALLBACK: LLAMADA A GEMINI AI
  // Usa territories-data.js como contexto verificado del sitio Baqueano.
  // --------------------------------------------------------------------------
  async function callGeminiFallback(input) {
    if (!GEMINI_PROXY_ENDPOINT) {
      throw new Error('El asistente IA no está configurado de forma segura. Intenta nuevamente cuando existan tarifas verificadas.');
    }

    // Construir contexto con los destinos reales del sitio
    const territories = (window.BAQUEANO_TERRITORIES || []).slice(0, 6);
    const territoryContext = territories.map(t =>
      `• ${t.name}: ${t.shortDesc} Lugares: ${t.places.slice(0,3).map(p => p.name).join(', ')}. Actividades: ${t.activities.slice(0,2).join(', ')}.`
    ).join('\n');

    const interesesStr = input.interests.length ? input.interests.join(', ') : 'naturaleza, aventura';
    const budgetStr    = `${money(input.budget, input.currency)} (disponible para gastar: ${money(input.available, input.currency)})`;
    const travelersStr = `${input.adults} adulto(s)${input.children > 0 ? ` y ${input.children} niño(s)` : ''}`;

    const systemPrompt = `Eres el asistente oficial de planificación turística de Baqueano Nicaragua (baqueano.com).
Tu misión: generar itinerarios turísticos REALES, VERIFICABLES y FUNDAMENTADOS para Nicaragua.

REGLAS ESTRICTAS:
- SOLO usa lugares, actividades y gastronomía REAL de Nicaragua (ningún lugar inventado).
- NUNCA inventes precios exactos. Usa rangos estimados (ej: "C$ 150–250 por persona").
- Indica la fuente de cada actividad como "baqueano.com" si está en el contexto.
- El plan debe ser alcanzable con el presupuesto indicado.
- Responde ÚNICAMENTE con JSON válido, sin texto adicional antes o después.

DESTINOS VERIFICADOS DEL SITIO BAQUEANO (usa esta información):
${territoryContext}

SOLICITUD DEL EXPLORADOR:
- Presupuesto: ${budgetStr}
- Duración: ${input.days} día(s)
- Salida desde: ${input.origin}
- Modalidad: ${input.travelType} (${travelersStr})
- Intereses: ${interesesStr}
- Tipo de estancia: ${input.stayMode}

FORMATO DE RESPUESTA (JSON exacto):
{
  "plan_title": "Título del plan (ej: 3 Días en el Cañón y los Volcanes)",
  "destino_principal": "Nombre del territorio principal",
  "resumen": "Descripción de 2 líneas del viaje",
  "presupuesto_estimado": "Rango total estimado (ej: C$ 4,500 – 6,000)",
  "days": [
    {
      "day": 1,
      "titulo": "Título del día",
      "activities": [
        {
          "nombre": "Nombre real del lugar o actividad",
          "tipo": "hospedaje | alimentacion | actividad | entrada | transporte",
          "descripcion": "Descripción breve y auténtica",
          "precio_estimado": "Rango estimado por persona",
          "fuente": "baqueano.com"
        }
      ]
    }
  ],
  "nota_ia": "Este itinerario fue generado por IA con información verificada de Baqueano Nicaragua. Precios son estimados — confirma disponibilidad directamente con cada prestador.",
  "recomendacion_final": "Consejo práctico del Baqueano Digital"
}`;

    const body = {
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json'
      }
    };

    const response = await fetch(GEMINI_PROXY_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errText.slice(0, 200)}`);
    }

    const data = await response.json();
    const raw  = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) throw new Error('Gemini no devolvió contenido.');

    // Parsear JSON (puede venir con \`\`\`json ... \`\`\`)
    const jsonStr  = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const plan     = JSON.parse(jsonStr);
    plan._source   = 'gemini';
    plan._input    = input;
    return plan;
  }

  // --------------------------------------------------------------------------
  // 10. BADGE DE PRECIO POR FUENTE
  // --------------------------------------------------------------------------
  function priceBadge(service) {
    if (service.verificado)
      return '<span class="rb-price-state is-verified"><i class="fa-solid fa-circle-check"></i> Precio verificado</span>';
    return '<span class="rb-price-state is-published"><i class="fa-solid fa-clock"></i> Precio publicado</span>';
  }

  // --------------------------------------------------------------------------
  // 11. RENDER — PLAN FIRESTORE
  // --------------------------------------------------------------------------
  function renderFirestorePlan(plan) {
    const result = $('rbResult');
    if (!plan.services.length) return false; // Sin resultados → fallback

    const i       = plan.input;
    const quality = Math.round(plan.verifiedCount / plan.services.length * 100);
    const rate    = Number(state.exchange?.tipoCambio);
    const opp     = i.currency === 'NIO' ? 'USD' : 'NIO';
    const conv    = convert(plan.total, i.currency, opp);

    result.innerHTML = `
      <div class="rb-source-badge rb-source-verified">
        <i class="fa-solid fa-database"></i>
        Datos del Catálogo Baqueano · ${quality}% precios verificados
      </div>
      <div class="rb-result-hero">
        <div>
          <span>Tu Aventura BAQUEANO está lista</span>
          <h3>${plan.services.length} servicios con tarifas registradas</h3>
        </div>
        <div class="rb-quality"><strong>${quality}%</strong><span>verificado</span></div>
      </div>
      <div class="rb-budget-grid">
        <div><span>Presupuesto</span><strong>${money(i.budget, i.currency)}</strong></div>
        <div><span>Reserva emergencia</span><strong>${money(i.reserve, i.currency)}</strong></div>
        <div><span>Disponible</span><strong>${money(i.available, i.currency)}</strong></div>
        <div><span>Costo registrado</span><strong>${money(plan.total, i.currency)}</strong></div>
        <div><span>Saldo</span><strong>${money(plan.remaining, i.currency)}</strong></div>
      </div>
      ${rate > 0 ? `<div class="rb-exchange-note"><i class="fa-solid fa-right-left"></i> ${money(plan.total, i.currency)} ≈ ${money(conv, opp)} · Tasa: C$${rate.toFixed(4)} = US$1 · Actualizada: ${dateLabel(state.exchange.fechaTipoCambio)}</div>`
        : `<div class="rb-exchange-note is-warning"><i class="fa-solid fa-triangle-exclamation"></i> Sin tasa de cambio vigente.</div>`}
      <div class="rb-day-list">
        ${plan.days.map(day => day.services.length ? `
          <section class="rb-day">
            <h4>Día ${day.day}</h4>
            ${day.services.map(s => `
              <article class="rb-service">
                <div>
                  <span class="rb-service-type">${SERVICE_LABELS[s.tipoServicio] || s.tipoServicio}</span>
                  <h5>${s.nombre}</h5>
                  <p>${s.negocioNombre || 'Proveedor registrado'} · ${s.municipio || s.departamento || 'Territorio por confirmar'}</p>
                  <div>${priceBadge(s)} <span class="rb-updated">Actualizado: ${dateLabel(s.fechaVerificacion || s.updatedAt)}</span></div>
                </div>
                <div class="rb-service-price">
                  <strong>${money(s.calculatedCost, i.currency)}</strong>
                  <span>${s.tipoPrecio || 'precio único'}</span>
                  ${safeUrl(s.urlOficial || s.fuentePrecioUrl) ? `<a href="${safeUrl(s.urlOficial || s.fuentePrecioUrl)}" target="_blank" rel="noopener noreferrer">Ver fuente</a>` : '<span>Sin enlace</span>'}
                </div>
              </article>`).join('')}
            <div class="rb-day-total">Subtotal: ${money(day.services.reduce((sum, s) => sum + s.calculatedCost, 0), i.currency)}</div>
          </section>` : '').join('')}
      </div>
      <div class="rb-result-actions">
        <button type="button" id="rbVerifyPlan" class="btn-calculate-route"><i class="fa-solid fa-shield"></i> Verificar disponibilidad</button>
        <button type="button" id="rbSavePlan" class="btn-share-route"><i class="fa-regular fa-heart"></i> Guardar plan</button>
        <button type="button" id="rbMapPlan" class="btn-anim-route"><i class="fa-solid fa-map"></i> Ver en mapa</button>
      </div>
      <div id="rbVerificationResult" class="rb-verification-result" aria-live="polite"></div>
    `;

    $('rbVerifyPlan').addEventListener('click', verifyPlan);
    $('rbSavePlan').addEventListener('click', savePlan);
    $('rbMapPlan').addEventListener('click', showMap);
    return true;
  }

  // --------------------------------------------------------------------------
  // 12. RENDER — PLAN GEMINI AI
  // --------------------------------------------------------------------------
  function renderGeminiPlan(plan, input) {
    const result = $('rbResult');

    result.innerHTML = `
      <div class="rb-source-badge rb-source-ai">
        <i class="fa-solid fa-robot"></i>
        Generado por IA · Fundamentado en datos verificados de Baqueano Nicaragua
      </div>

      <div class="rb-ai-disclaimer">
        <i class="fa-solid fa-circle-info"></i>
        <div>
          <strong>Itinerario asistido por IA</strong>
          Los lugares son reales de Nicaragua. Los precios son estimados — consulta disponibilidad con cada prestador antes de viajar.
        </div>
      </div>

      <div class="rb-result-hero">
        <div>
          <span>${plan.destino_principal || input.origin}</span>
          <h3>${plan.plan_title || 'Tu aventura en Nicaragua'}</h3>
        </div>
        <div class="rb-quality rb-quality--ai">
          <i class="fa-solid fa-robot"></i>
          <span>IA Baqueano</span>
        </div>
      </div>

      <p class="rb-ai-resumen">${plan.resumen || ''}</p>

      ${plan.presupuesto_estimado ? `<div class="rb-exchange-note"><i class="fa-solid fa-wallet"></i> Estimado total: <strong>${plan.presupuesto_estimado}</strong></div>` : ''}

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
                    <span class="rb-price-state is-ai"><i class="fa-solid fa-robot"></i> Estimado IA</span>
                    ${act.fuente ? `<span class="rb-updated"><i class="fa-solid fa-link"></i> Fuente: ${act.fuente}</span>` : ''}
                  </div>
                </div>
                <div class="rb-service-price">
                  <strong>${act.precio_estimado || 'Consultar'}</strong>
                  <span>por persona</span>
                </div>
              </article>`).join('')}
          </section>`).join('')}
      </div>

      ${plan.recomendacion_final ? `
        <div class="rb-ai-tip">
          <i class="fa-solid fa-hat-cowboy"></i>
          <p><strong>Consejo del Baqueano:</strong> ${plan.recomendacion_final}</p>
        </div>` : ''}

      <div class="rb-result-actions">
        <a href="https://wa.me/50588888888?text=Hola+Baqueano+Nicaragua%2C+quiero+m%C3%A1s+info+sobre+un+itinerario+en+${encodeURIComponent(plan.destino_principal || input.origin)}"
           target="_blank" rel="noopener noreferrer" class="btn-calculate-route">
          <i class="fa-brands fa-whatsapp"></i> Consultar con un Baqueano Real
        </a>
        <button type="button" id="rbRetryFirestore" class="btn-share-route">
          <i class="fa-solid fa-rotate"></i> Buscar de nuevo en catálogo
        </button>
      </div>
      <p class="rb-ai-footer-note">${plan.nota_ia || ''}</p>
    `;

    $('rbRetryFirestore')?.addEventListener('click', generate);
  }

  // --------------------------------------------------------------------------
  // 13. RENDER — ERROR HONESTO (sin Firestore ni Gemini)
  // --------------------------------------------------------------------------
  function renderError(msg) {
    const result = $('rbResult');
    if (!result) return;
    result.innerHTML = `
      <div class="rb-honest-empty">
        <i class="fa-solid fa-cloud-xmark"></i>
        <h4>No pudimos construir tu plan en este momento</h4>
        <p>${msg}</p>
        <p>Probá con más días, diferente presupuesto o contactanos directo por WhatsApp.</p>
      </div>`;
  }

  // --------------------------------------------------------------------------
  // 14. LOADER ANIMADO
  // --------------------------------------------------------------------------
  function showLoader(phase) {
    const result = $('rbResult');
    if (!result) return;
    const messages = {
      firestore: 'Buscando en el catálogo de tarifas verificadas…',
      gemini:    'Consultando el asistente IA con información de Nicaragua…'
    };
    result.innerHTML = `
      <div class="rb-loading-state">
        <div class="rb-loading-spinner"><i class="fa-solid fa-spinner fa-spin fa-3x"></i></div>
        <p>${messages[phase] || 'Procesando…'}</p>
      </div>`;
  }

  // --------------------------------------------------------------------------
  // 15. GENERAR PLAN (PIPELINE PRINCIPAL)
  // --------------------------------------------------------------------------
  async function generate() {
    const input = getInput();
    const error = validate(input);
    const validEl = $('rbValidation');
    if (validEl) { validEl.hidden = !error; validEl.textContent = error; }
    if (error) return;

    state.loading = true;
    const btn = $('btnCalculateRoute');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Construyendo…'; }

    try {
      // PASO 1: Construir plan con Firestore
      showLoader('firestore');
      state.plan = buildPlan(input);
      const rendered = renderFirestorePlan(state.plan);

      if (!rendered) {
        // PASO 2: Firestore no tiene datos → llamar a Gemini
        showLoader('gemini');
        const geminiPlan = await callGeminiFallback(input);
        renderGeminiPlan(geminiPlan, input);
      }
    } catch (err) {
      console.error('[RouteBuilder]', err);
      // Intentar Gemini como fallback si Firestore falló completamente
      if (!err.message?.includes('Gemini')) {
        try {
          showLoader('gemini');
          const geminiPlan = await callGeminiFallback(input);
          renderGeminiPlan(geminiPlan, input);
        } catch (geminiErr) {
          renderError(geminiErr.message || 'Error desconocido al contactar el asistente IA.');
        }
      } else {
        renderError(err.message || 'Error desconocido.');
      }
    } finally {
      state.loading = false;
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-route"></i> Construir mi aventura'; }
    }
  }

  // --------------------------------------------------------------------------
  // 16. VERIFICAR PLAN (re-consulta Firestore)
  // --------------------------------------------------------------------------
  async function verifyPlan() {
    const output = $('rbVerificationResult');
    if (!output || !state.plan) return;
    output.textContent = 'Comprobando tarifas y disponibilidad en Firestore…';
    try {
      const firestore = db();
      const docs = await Promise.all(state.plan.services.map(s => firestore.collection(COLLECTION).doc(s.id).get()));
      const changes = docs
        .map((doc, i) => ({ previous: state.plan.services[i], current: doc.exists ? normalizeService(doc) : null }))
        .filter(c => !c.current || !c.current.usable || c.current.precio !== c.previous.precio || c.current.moneda !== c.previous.moneda);

      if (changes.length) {
        output.innerHTML = `<strong>El precio o disponibilidad cambió:</strong><ul>${changes.map(c =>
          `<li>${c.previous.nombre}: ${money(c.previous.precio, c.previous.moneda)} → ${c.current ? money(c.current.precio, c.current.moneda) : 'No disponible'}</li>`
        ).join('')}</ul><button type="button" id="rbRebuild">Buscar alternativa</button>`;
        $('rbRebuild').addEventListener('click', generate);
      } else {
        output.innerHTML = '<strong><i class="fa-solid fa-circle-check"></i> Precios y disponibilidad confirmados.</strong>';
      }
    } catch (err) {
      output.textContent = `No se pudo verificar: ${err.message}`;
    }
  }

  // --------------------------------------------------------------------------
  // 17. GUARDAR PLAN EN FIRESTORE (usuario autenticado)
  // --------------------------------------------------------------------------
  async function savePlan() {
    const user   = window.firebase?.auth?.().currentUser;
    const output = $('rbVerificationResult');
    if (!user) { if (output) output.textContent = 'Iniciá sesión para guardar tu itinerario.'; return; }
    const plan    = state.plan;
    const payload = {
      userId: user.uid,
      createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      budget: plan.input.budget, currency: plan.input.currency,
      emergencyReserve: plan.input.reserve, availableBudget: plan.input.available,
      totalCost: plan.total, remainingBudget: plan.remaining, days: plan.input.days,
      travelers: { adults: plan.input.adults, children: plan.input.children },
      origin: plan.input.origin, interests: plan.input.interests, status: 'draft'
    };
    const ref = await db().collection(PLAN_COLLECTION).add(payload);
    if (output) output.textContent = `Plan guardado (referencia: ${ref.id}).`;
  }

  // --------------------------------------------------------------------------
  // 18. VER EN MAPA
  // --------------------------------------------------------------------------
  function showMap() {
    const stops = (state.plan?.services || [])
      .filter(s => Number.isFinite(Number(s.latitud)) && Number.isFinite(Number(s.longitud)))
      .map(s => ({ lat: Number(s.latitud), lng: Number(s.longitud), title: s.nombre }));
    if (stops.length && window.BaqueanoRealMap?.drawRoute) window.BaqueanoRealMap.drawRoute(stops);
    $('mapaVivo3DNicaragua')?.scrollIntoView({ behavior: 'smooth' });
  }

  // --------------------------------------------------------------------------
  // 19. INICIALIZACIÓN
  // --------------------------------------------------------------------------
  async function init() {
    renderShell();

    // Listeners de campos dinámicos
    $('rbDays')?.addEventListener('change', e => {
      if ($('rbCustomDays')) $('rbCustomDays').hidden = e.target.value !== 'custom';
    });
    $('rbEmergency')?.addEventListener('change', e => {
      if ($('rbEmergencyCustom')) $('rbEmergencyCustom').hidden = e.target.value !== 'custom';
    });

    // Submit del formulario
    $('routePlannerForm')?.addEventListener('submit', e => { e.preventDefault(); generate(); });

    // Carga del catálogo (no bloqueante)
    try {
      await loadCatalog();
    } catch (err) {
      const badge = $('rbCatalogStatus');
      if (badge) { badge.textContent = 'IA lista (catálogo offline)'; badge.classList.add('is-ai-mode'); }
    }
  }

  // --------------------------------------------------------------------------
  // API PÚBLICA
  // --------------------------------------------------------------------------
  window.BaqueanoRouteBuilder = { init, generate, verifyPlan };
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})(window, document);
