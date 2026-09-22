// ============================================================================
// 🧭 BAQUEANO — PLANIFICADOR TURÍSTICO CON PRECIOS VERIFICABLES
// ============================================================================
// 🎯 POR QUÉ: una ruta útil debe respetar el dinero real del viajero y jamás
// presentar como precio una cifra creada por IA, una constante o una estimación.
// ⚙️ CÓMO: lee `tourism_services` y `app_config/exchange_rate` en Firestore,
// descarta tarifas vencidas/no disponibles, calcula según unidad de cobro y
// optimiza únicamente combinaciones cuyo total no supera el presupuesto usable.
// 📦 QUÉ: formulario libre, reserva de emergencia, desglose auditable, snapshot,
// guardado autenticado, reverificación previa y enlace al mapa/reserva.
// ============================================================================

(function (window, document) {
  'use strict';

  const COLLECTION = 'tourism_services';
  const PLAN_COLLECTION = 'travelPlans';
  const SERVICE_LABELS = {
    transporte: 'Transporte', hospedaje: 'Hospedaje', alimentacion: 'Alimentación',
    entrada: 'Entradas', guia: 'Guías locales', actividad: 'Actividades',
    day_pass: 'Day Pass', alquiler_vehiculo: 'Alquiler de vehículo', ferry_panga: 'Ferry / Panga',
    experiencia_comunitaria: 'Experiencias comunitarias'
  };
  const state = { services: [], exchange: null, plan: null, loading: false };

  const $ = id => document.getElementById(id);
  const money = (value, currency) => new Intl.NumberFormat('es-NI', { style: 'currency', currency: currency === 'USD' ? 'USD' : 'NIO', maximumFractionDigits: 2 }).format(value || 0);
  const dateLabel = value => {
    const date = value?.toDate ? value.toDate() : new Date(value);
    return Number.isNaN(date.getTime()) ? 'Sin fecha verificable' : date.toLocaleDateString('es-NI');
  };
  const safeUrl = value => /^https:\/\//i.test(String(value || '')) ? value : '';

  function db() {
    return window.firebase?.firestore ? window.firebase.firestore() : null;
  }

  function renderShell() {
    const section = $('routeBuilderSection');
    if (!section) return;
    section.querySelector('.section-subtext').textContent = 'Decinos cuánto querés gastar, qué querés vivir y cuántos días tenés. BAQUEANO buscará experiencias con precios registrados y construirá una ruta dentro de tu presupuesto.';
    section.querySelector('.route-builder-grid').innerHTML = `
      <div class="builder-card-pro rb-planner-card">
        <div class="builder-header-bar"><i class="fa-solid fa-sliders"></i><h3>Datos de tu aventura</h3><span class="rb-live-badge" id="rbCatalogStatus">Conectando con tarifas…</span></div>
        <form id="routePlannerForm" class="builder-form-body" novalidate>
          <div class="rb-form-grid">
            <label class="builder-field-group"><span class="builder-label"><i class="fa-solid fa-calendar-days"></i> Duración</span><select id="rbDays" class="builder-select"><option value="1">1 día</option><option value="2">2 días</option><option value="3" selected>3 días</option><option value="4">4 días</option><option value="5">5 días</option><option value="7">7 días</option><option value="custom">Personalizado</option></select><input id="rbCustomDays" class="builder-select" type="number" min="1" max="30" value="6" hidden aria-label="Cantidad personalizada de días"></label>
            <label class="builder-field-group"><span class="builder-label"><i class="fa-solid fa-wallet"></i> ¿Cuánto querés gastar?</span><span class="rb-money-input"><select id="rbCurrency" aria-label="Moneda"><option value="NIO">C$ NIO</option><option value="USD">US$ USD</option></select><input id="rbBudget" type="number" min="0.01" step="0.01" inputmode="decimal" placeholder="8000" required></span></label>
            <label class="builder-field-group"><span class="builder-label"><i class="fa-solid fa-shield-heart"></i> Reserva de emergencia</span><select id="rbEmergency" class="builder-select"><option value="0">No reservar</option><option value="5">5%</option><option value="10" selected>10%</option><option value="15">15%</option><option value="20">20%</option><option value="custom">Cantidad personalizada</option></select><input id="rbEmergencyCustom" class="builder-select" type="number" min="0" step="0.01" value="0" hidden aria-label="Reserva personalizada"></label>
            <label class="builder-field-group"><span class="builder-label"><i class="fa-solid fa-map-pin"></i> Salida</span><select id="rbOriginDept" class="builder-select"><option>Managua</option><option>León</option><option>Granada</option><option>Rivas</option><option>Masaya</option><option>Carazo</option><option>Estelí</option><option>Matagalpa</option><option>Jinotega</option><option>Madriz</option><option>Chinandega</option><option>Boaco</option><option>Chontales</option><option>Río San Juan</option><option>RACCN</option><option>RACCS</option></select></label>
            <label class="builder-field-group"><span class="builder-label"><i class="fa-solid fa-user-group"></i> Modalidad</span><select id="rbTravelType" class="builder-select"><option value="solo">Viajero solitario</option><option value="pareja" selected>Pareja</option><option value="familia">Familia</option><option value="familia_ninos">Familia con niños</option><option value="amigos">Grupo de amigos</option><option value="mayores">Adultos mayores</option><option value="organizado">Grupo organizado</option></select></label>
            <div class="builder-field-group"><span class="builder-label"><i class="fa-solid fa-people-roof"></i> Viajeros</span><div class="rb-inline-inputs"><label>Adultos<input id="rbAdults" type="number" min="1" max="30" value="2"></label><label>Niños<input id="rbChildren" type="number" min="0" max="20" value="0"></label></div></div>
            <label class="builder-field-group"><span class="builder-label"><i class="fa-solid fa-person-hiking"></i> Condición física</span><select id="rbFitness" class="builder-select"><option value="ligera">Ligera</option><option value="moderada" selected>Moderada</option><option value="avanzada">Avanzada</option></select></label>
            <label class="builder-field-group"><span class="builder-label"><i class="fa-solid fa-universal-access"></i> Accesibilidad</span><select id="rbAccessibility" class="builder-select"><option value="ninguna">Sin requerimientos especiales</option><option value="movilidad_reducida">Movilidad reducida</option><option value="silla_ruedas">Usuario de silla de ruedas</option><option value="adulto_mayor">Adulto mayor</option><option value="dificultad_caminar">Dificultad para caminar</option><option value="transporte_accesible">Transporte accesible</option><option value="otra">Otra necesidad</option></select></label>
            <label class="builder-field-group"><span class="builder-label"><i class="fa-solid fa-bed"></i> Estancia</span><select id="rbStayMode" class="builder-select"><option value="cualquiera">Cualquiera</option><option value="hotel">Hotel</option><option value="hostal">Hostal</option><option value="posada">Posada</option><option value="rural">Hospedaje rural</option><option value="familia">Casa de familia</option><option value="eco_lodge">Eco lodge</option><option value="finca">Finca turística</option><option value="resort">Resort</option><option value="camping">Camping</option><option value="day_pass">Day Pass</option><option value="sin_hospedaje">Sin hospedaje</option></select></label>
          </div>
          <fieldset class="rb-choice-field"><legend>¿Qué querés incluir dentro de tu presupuesto?</legend><div class="rb-check-grid">${Object.entries(SERVICE_LABELS).map(([value, label]) => `<label><input type="checkbox" name="rbServices" value="${value}" ${['hospedaje','alimentacion','entrada','actividad'].includes(value) ? 'checked' : ''}><span>${label}</span></label>`).join('')}</div></fieldset>
          <fieldset class="rb-choice-field"><legend>Transporte posible</legend><div class="rb-check-grid">${['Bus local','Vehículo propio','4x4','Cooperativa','Taxi privado','Alquiler de vehículo','Ferry','Panga','Transporte mixto'].map((label, index) => `<label><input type="checkbox" name="rbTransport" value="${label.toLowerCase().replaceAll(' ','_')}" ${index === 0 ? 'checked' : ''}><span>${label}</span></label>`).join('')}</div></fieldset>
          <fieldset class="rb-choice-field"><legend>Intereses</legend><div class="rb-check-grid rb-interest-grid">${['Volcanes','Aventura','Playa','Surf','Ríos','Lagunas','Islas','Montaña','Senderismo','Ruta del Café','Turismo Rural','Turismo Comunitario','Gastronomía','Historia','Cultura','Museos','Artesanía','Pueblos Blancos','Aves','Fotografía','Naturaleza','Ecoturismo','Bienestar','Experiencias campesinas','Patrimonio','Música','Festividades','Reservas naturales'].map((label, index) => `<label><input type="checkbox" name="rbInterests" value="${label.toLocaleLowerCase('es')}" ${index < 2 ? 'checked' : ''}><span>${label}</span></label>`).join('')}</div></fieldset>
          <div class="rb-validation" id="rbValidation" role="alert" hidden></div>
          <button type="submit" class="btn-calculate-route" id="btnCalculateRoute"><i class="fa-solid fa-route"></i> Construir mi aventura</button>
        </form>
      </div>
      <div class="builder-card-pro builder-result-card"><div class="builder-header-bar"><i class="fa-solid fa-map-location-dot"></i><h3>Tu Aventura BAQUEANO</h3></div><div class="builder-result-content" id="rbResult"><div class="rb-honest-empty"><i class="fa-solid fa-database"></i><h4>Esperando tus preferencias</h4><p>Solo mostraremos servicios con tarifas registradas, vigentes y trazables.</p></div></div></div>`;
  }

  function normalizeService(doc) {
    const raw = doc.data ? doc.data() : doc;
    const expiration = raw.fechaVencimiento?.toDate ? raw.fechaVencimiento.toDate() : new Date(raw.fechaVencimiento || 0);
    const expired = raw.fechaVencimiento && !Number.isNaN(expiration.getTime()) && expiration < new Date();
    const numericPrice = Number(raw.precio);
    const status = expired ? 'precio_desactualizado' : (raw.estadoPrecio || (raw.verificado ? 'verificado' : 'publicado'));
    return { id: doc.id || raw.id, ...raw, precio: numericPrice, estadoPrecio: status, usable: numericPrice > 0 && ['verificado','publicado'].includes(status) && raw.disponibilidad === true && !['no_disponible','cerrado_temporalmente'].includes(raw.estadoDisponibilidad) };
  }

  async function loadCatalog() {
    const firestore = db();
    if (!firestore) throw new Error('Firebase no está disponible en este momento.');
    const [servicesSnap, exchangeSnap] = await Promise.all([firestore.collection(COLLECTION).get(), firestore.collection('app_config').doc('exchange_rate').get()]);
    state.services = servicesSnap.docs.map(normalizeService);
    state.exchange = exchangeSnap.exists ? exchangeSnap.data() : null;
    const usable = state.services.filter(item => item.usable).length;
    $('rbCatalogStatus').textContent = `${usable} tarifas utilizables de ${state.services.length}`;
    $('rbCatalogStatus').classList.toggle('is-ready', usable > 0);
  }

  function selected(name) { return [...document.querySelectorAll(`[name="${name}"]:checked`)].map(input => input.value); }
  function getInput() {
    const budget = Number($('rbBudget').value);
    const days = $('rbDays').value === 'custom' ? Number($('rbCustomDays').value) : Number($('rbDays').value);
    const emergencyValue = $('rbEmergency').value;
    const reserve = emergencyValue === 'custom' ? Number($('rbEmergencyCustom').value) : budget * Number(emergencyValue) / 100;
    return { budget, currency: $('rbCurrency').value, days, reserve, available: budget - reserve, adults: Number($('rbAdults').value), children: Number($('rbChildren').value), origin: $('rbOriginDept').value, travelType: $('rbTravelType').value, fitness: $('rbFitness').value, accessibility: $('rbAccessibility').value, stayMode: $('rbStayMode').value, includedServices: selected('rbServices'), transport: selected('rbTransport'), interests: selected('rbInterests') };
  }

  function validate(input) {
    if (!(input.budget > 0)) return 'Ingresá un presupuesto mayor que cero.';
    if (!(input.days >= 1 && input.days <= 30)) return 'La duración debe estar entre 1 y 30 días.';
    if (input.reserve < 0 || input.reserve >= input.budget) return 'La reserva de emergencia debe ser menor que el presupuesto.';
    if (input.adults < 1 || input.children < 0) return 'Revisá la cantidad de viajeros.';
    if (!input.includedServices.length) return 'Seleccioná al menos un servicio para presupuestar.';
    return '';
  }

  function convert(value, from, to) {
    if (from === to) return value;
    const rate = Number(state.exchange?.tipoCambio);
    if (!(rate > 0)) return null;
    return from === 'USD' ? value * rate : value / rate;
  }

  function serviceCost(service, input) {
    const base = service.precio;
    const adults = input.adults;
    const children = input.children;
    const hasChildPrice = service.precioNino !== null && service.precioNino !== undefined && service.precioNino !== '';
    const childPrice = hasChildPrice ? Number(service.precioNino) : null;
    const adultPrice = Number(service.precioAdulto) || base;
    switch (service.tipoPrecio) {
      case 'persona': return adults * adultPrice + children * (Number.isFinite(childPrice) ? childPrice : adultPrice);
      case 'pareja': return Math.ceil((adults + children) / 2) * base;
      case 'habitacion': return Math.ceil((adults + children) / Math.max(1, Number(service.capacidadHabitacion) || 2)) * base * input.days;
      case 'noche': return base * Math.max(0, input.days - 1);
      case 'dia': return base * input.days;
      case 'vehiculo': case 'grupo': case 'actividad': case 'unico': default: return base;
    }
  }

  function buildPlan(input) {
    const candidates = state.services.filter(service => {
      if (!service.usable || !input.includedServices.includes(service.tipoServicio)) return false;
      if (input.accessibility !== 'ninguna' && Array.isArray(service.incompatibleAccesibilidad) && service.incompatibleAccesibilidad.includes(input.accessibility)) return false;
      if (service.condicionFisica && ['ligera','moderada','avanzada'].indexOf(service.condicionFisica) > ['ligera','moderada','avanzada'].indexOf(input.fitness)) return false;
      if (service.tipoServicio === 'hospedaje' && input.stayMode !== 'cualquiera' && input.stayMode !== 'sin_hospedaje' && service.modalidadEstancia && service.modalidadEstancia !== input.stayMode) return false;
      return true;
    }).map(service => {
      const rawCost = serviceCost(service, input);
      const cost = convert(rawCost, service.moneda || 'NIO', input.currency);
      const interestScore = (service.intereses || []).filter(value => input.interests.includes(String(value).toLocaleLowerCase('es'))).length;
      return { ...service, calculatedCost: cost, rawCost, interestScore };
    }).filter(service => Number.isFinite(service.calculatedCost))
      .sort((a, b) => Number(b.verificado) - Number(a.verificado) || b.interestScore - a.interestScore || a.calculatedCost - b.calculatedCost);

    const chosen = [];
    let total = 0;
    for (const service of candidates) {
      if (total + service.calculatedCost > input.available) continue;
      const sameTypeCount = chosen.filter(item => item.tipoServicio === service.tipoServicio).length;
      const limit = ['alimentacion','actividad','entrada'].includes(service.tipoServicio) ? input.days : 1;
      if (sameTypeCount >= limit) continue;
      chosen.push(service); total += service.calculatedCost;
    }
    const dayGroups = Array.from({ length: input.days }, (_, index) => ({ day: index + 1, services: [] }));
    chosen.forEach((service, index) => dayGroups[index % input.days].services.push(service));
    return { id: `plan-${Date.now()}`, input, services: chosen, days: dayGroups, total, remaining: input.available - total, createdAt: new Date().toISOString(), verifiedCount: chosen.filter(item => item.verificado).length };
  }

  function priceBadge(service) {
    if (service.verificado) return '<span class="rb-price-state is-verified"><i class="fa-solid fa-circle-check"></i> Precio verificado</span>';
    return '<span class="rb-price-state is-published"><i class="fa-solid fa-clock"></i> Precio publicado recientemente</span>';
  }

  function renderPlan(plan) {
    const result = $('rbResult');
    if (!plan.services.length) {
      const alternatives = state.services.filter(item => !item.usable || item.estadoPrecio === 'consultar_precio').slice(0, 5);
      result.innerHTML = `<div class="rb-honest-empty"><i class="fa-solid fa-triangle-exclamation"></i><h4>No encontramos una combinación verificable dentro de este presupuesto</h4><p>No se fabricaron precios para completar la ruta. Probá cambiando días, servicios o presupuesto.</p>${alternatives.length ? `<div class="rb-consult-list"><strong>Alternativas para consultar:</strong>${alternatives.map(item => `<span>${item.nombre || 'Servicio'} · Consultar precio y disponibilidad</span>`).join('')}</div>` : ''}</div>`;
      return;
    }
    const i = plan.input;
    const quality = Math.round(plan.verifiedCount / plan.services.length * 100);
    const rate = Number(state.exchange?.tipoCambio);
    const opposite = i.currency === 'NIO' ? 'USD' : 'NIO';
    const converted = convert(plan.total, i.currency, opposite);
    result.innerHTML = `
      <div class="rb-result-hero"><div><span>Tu Aventura BAQUEANO está lista</span><h3>${plan.services.length} servicios con precios registrados</h3></div><div class="rb-quality"><strong>${quality}%</strong><span>precios verificados</span></div></div>
      <div class="rb-budget-grid"><div><span>Presupuesto</span><strong>${money(i.budget,i.currency)}</strong></div><div><span>Reserva de emergencia</span><strong>${money(i.reserve,i.currency)}</strong></div><div><span>Presupuesto disponible</span><strong>${money(i.available,i.currency)}</strong></div><div><span>Costo registrado</span><strong>${money(plan.total,i.currency)}</strong></div><div><span>Saldo disponible</span><strong>${money(plan.remaining,i.currency)}</strong></div></div>
      ${rate > 0 ? `<div class="rb-exchange-note"><i class="fa-solid fa-right-left"></i> ${money(plan.total,i.currency)} ≈ ${money(converted,opposite)} · Tasa utilizada: C$${rate.toFixed(4)} = US$1 · Actualizada: ${dateLabel(state.exchange.fechaTipoCambio)}</div>` : '<div class="rb-exchange-note is-warning"><i class="fa-solid fa-triangle-exclamation"></i> No hay una tasa de cambio vigente configurada; no se muestra conversión.</div>'}
      <div class="rb-day-list">${plan.days.map(day => day.services.length ? `<section class="rb-day"><h4>Día ${day.day}</h4>${day.services.map(service => `<article class="rb-service"><div><span class="rb-service-type">${SERVICE_LABELS[service.tipoServicio] || service.tipoServicio}</span><h5>${service.nombre}</h5><p>${service.negocioNombre || 'Proveedor registrado'} · ${service.municipio || service.departamento || 'Territorio por confirmar'}</p><div>${priceBadge(service)} <span class="rb-updated">Actualizado: ${dateLabel(service.fechaVerificacion || service.updatedAt)}</span></div></div><div class="rb-service-price"><strong>${money(service.calculatedCost,i.currency)}</strong><span>${service.tipoPrecio || 'precio único'}</span>${safeUrl(service.urlOficial || service.fuentePrecioUrl) ? `<a href="${safeUrl(service.urlOficial || service.fuentePrecioUrl)}" target="_blank" rel="noopener noreferrer">Ver fuente del precio</a>` : '<span>Fuente sin enlace público</span>'}</div></article>`).join('')}<div class="rb-day-total">Subtotal del día: ${money(day.services.reduce((sum,item)=>sum+item.calculatedCost,0),i.currency)}</div></section>` : '').join('')}</div>
      <div class="rb-result-actions"><button type="button" id="rbVerifyPlan" class="btn-calculate-route"><i class="fa-solid fa-shield"></i> Verificar precio y disponibilidad</button><button type="button" id="rbSavePlan" class="btn-share-route"><i class="fa-regular fa-heart"></i> Guardar en Mi Viaje</button><button type="button" id="rbMapPlan" class="btn-anim-route"><i class="fa-solid fa-map"></i> Ver mi ruta en el mapa</button><button type="button" id="rbReservePlan" class="btn-share-route" disabled><i class="fa-solid fa-calendar-check"></i> Reservar mi aventura</button></div><div id="rbVerificationResult" class="rb-verification-result" aria-live="polite"></div>`;
    $('rbVerifyPlan').addEventListener('click', verifyPlan);
    $('rbSavePlan').addEventListener('click', savePlan);
    $('rbMapPlan').addEventListener('click', showMap);
    $('rbReservePlan').addEventListener('click', requestReservation);
  }

  async function verifyPlan() {
    const output = $('rbVerificationResult');
    output.textContent = 'Comprobando tarifas y disponibilidad en Firebase…';
    try {
      const firestore = db();
      const docs = await Promise.all(state.plan.services.map(item => firestore.collection(COLLECTION).doc(item.id).get()));
      const changes = docs.map((doc, index) => ({ previous: state.plan.services[index], current: doc.exists ? normalizeService(doc) : null })).filter(item => !item.current || !item.current.usable || item.current.precio !== item.previous.precio || item.current.moneda !== item.previous.moneda);
      if (changes.length) {
        output.innerHTML = `<strong>El precio o la disponibilidad cambió desde que generaste tu itinerario.</strong><ul>${changes.map(item => `<li>${item.previous.nombre}: ${money(item.previous.precio,item.previous.moneda)} → ${item.current ? money(item.current.precio,item.current.moneda) : 'No disponible'}</li>`).join('')}</ul><button type="button" id="rbRebuild">Buscar alternativa</button>`;
        $('rbRebuild').addEventListener('click', generate);
        $('rbReservePlan').disabled = true;
      } else {
        output.innerHTML = '<strong><i class="fa-solid fa-circle-check"></i> Precios y disponibilidad confirmados con la información vigente.</strong>';
        $('rbReservePlan').disabled = false;
      }
    } catch (error) { output.textContent = `No fue posible completar la verificación: ${error.message}`; }
  }

  async function savePlan() {
    const user = window.firebase?.auth?.().currentUser;
    const output = $('rbVerificationResult');
    if (!user) { output.textContent = 'Iniciá sesión para guardar este itinerario en Mi Viaje.'; return; }
    const plan = state.plan;
    const payload = { userId: user.uid, createdAt: window.firebase.firestore.FieldValue.serverTimestamp(), updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(), budget: plan.input.budget, currency: plan.input.currency, emergencyReserve: plan.input.reserve, availableBudget: plan.input.available, totalCost: plan.total, remainingBudget: plan.remaining, days: plan.input.days, travelers: { adults: plan.input.adults, children: plan.input.children }, origin: plan.input.origin, transport: plan.input.transport, interests: plan.input.interests, physicalCondition: plan.input.fitness, accessibility: [plan.input.accessibility], accommodation: [plan.input.stayMode], includedServices: plan.input.includedServices, itinerary: plan.days.map(day => ({ day: day.day, serviceIds: day.services.map(item => item.id) })), priceSnapshot: Object.fromEntries(plan.services.map(item => [item.id, { precio: item.precio, moneda: item.moneda, fecha: item.fechaVerificacion || null, proveedor: item.businessId || '', fuente: item.fuentePrecio || '' }])), status: 'draft' };
    const ref = await db().collection(PLAN_COLLECTION).add(payload);
    output.textContent = `Itinerario guardado con referencia ${ref.id}.`;
  }

  function showMap() {
    const stops = state.plan.services.filter(item => Number.isFinite(Number(item.latitud)) && Number.isFinite(Number(item.longitud))).map(item => ({ lat: Number(item.latitud), lng: Number(item.longitud), title: item.nombre }));
    if (stops.length && window.BaqueanoRealMap?.drawRoute) window.BaqueanoRealMap.drawRoute(stops);
    $('mapaVivo3DNicaragua')?.scrollIntoView({ behavior: 'smooth' });
  }

  function requestReservation() {
    const output = $('rbVerificationResult');
    output.textContent = 'Ruta verificada. La solicitud de reserva se prepara sin efectuar cobros; cada proveedor debe confirmar antes de continuar.';
  }

  function generate() {
    const input = getInput();
    const error = validate(input);
    $('rbValidation').hidden = !error;
    $('rbValidation').textContent = error;
    if (error) return;
    state.plan = buildPlan(input);
    renderPlan(state.plan);
  }

  async function init() {
    renderShell();
    $('rbDays').addEventListener('change', event => { $('rbCustomDays').hidden = event.target.value !== 'custom'; });
    $('rbEmergency').addEventListener('change', event => { $('rbEmergencyCustom').hidden = event.target.value !== 'custom'; });
    $('routePlannerForm').addEventListener('submit', event => { event.preventDefault(); generate(); });
    try { await loadCatalog(); } catch (error) { $('rbCatalogStatus').textContent = 'Catálogo no disponible'; $('rbResult').innerHTML = `<div class="rb-honest-empty"><i class="fa-solid fa-cloud-xmark"></i><h4>No podemos consultar precios en este momento</h4><p>${error.message} No se generó ningún costo alternativo.</p></div>`; }
  }

  window.BaqueanoRouteBuilder = { init, generate, verifyPlan };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})(window, document);
