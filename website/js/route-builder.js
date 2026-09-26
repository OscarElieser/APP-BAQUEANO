// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PLANIFICADOR INTELIGENTE DE AVENTURAS (route-builder.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Permitir al explorador diseñar su aventura a medida abriendo un modal
//   rápido y ergonómico sin saturar visualmente la página principal.
// - Garantizar que SIEMPRE se ofrezca un itinerario realista, transparente
//   y verificable para Nicaragua basado en presupuesto real.
// - Conectar de forma directa y soberana (0% comisiones) al viajero con
//   los negocios locales, cooperativas comunitarias y guías baqueanos recomendados
//   por la IA vía WhatsApp oficial.
// - Erradicar intermediarios foráneos enlazando siempre con el negocio seleccionado
//   o las cooperativas y anfitriones que la IA recomienda para cada actividad.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Interfaz en dos capas: Tarjeta CTA principal en la página + Modal de 4 pasos.
// - Catálogo exhaustivo de anfitriones y cooperativas verificadas para los 17 territorios
//   de Nicaragua (Madriz, León, Ometepe/Rivas, Matagalpa, Jinotega, Granada, Masaya, etc.).
// - Asignación determinista de negocios reales a cada actividad del itinerario generado por IA.
// - Selector interactivo de anfitrión en la vista del plan: el botón principal de WhatsApp
//   se conecta dinámicamente con el negocio seleccionado, y cada actividad cuenta con su
//   enlace directo para chatear con el anfitrión responsable.
// - Mensajería pre-formateada en deep-links wa.me con detalles de la ruta, actividad,
//   fechas, viajeros y presupuesto estimado sin comisiones.
//
// 📦 3. QUÉ (WHAT / COMPONENTES Y MÉTODOS):
// - window.BaqueanoRouteBuilder.init()
// - window.BaqueanoRouteBuilder.openModal()
// - window.BaqueanoRouteBuilder.closeModal()
// - window.BaqueanoRouteBuilder.generate()
// - buildWhatsAppUrl(business, plan, input, specificActivity)
// - enhancePlanWithBusinesses(plan, input)
// ============================================================================

(function (window, document) {
  'use strict';

  // --------------------------------------------------------------------------
  // CONSTANTES & CONFIGURACIÓN
  // --------------------------------------------------------------------------
  const COLLECTION        = 'tourism_services';
  const PLAN_COLLECTION   = 'travelPlans';
  const OPENAI_API_KEY    = window.__BQ_OPENAI_KEY || '';
  const DEEPSEEK_API_KEY  = window.__BQ_DEEPSEEK_KEY || '';
  const GEMINI_API_KEY    = window.__BQ_GEMINI_KEY || '';
  const GEMINI_MODELS     = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite'];
  const MESA_CENTRAL_PHONE = '50584431289';
  const OFFICIAL_BCN_RATE_2026 = 36.6243;

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

  // --------------------------------------------------------------------------
  // CATÁLOGO DE ANFITRIONES Y NEGOCIOS VERIFICADOS POR TERRITORIO
  // --------------------------------------------------------------------------
  const VERIFIED_BUSINESSES_BY_TERRITORY = {
    madriz: [
      { id: 'biz-coop-somoto', name: 'Coop. Cañón de Somoto', department: 'Madriz', type: 'Guías & Aventura Fluvial', host: 'Gonzalo Cruz (Guía Comunitario)', phone: '50584431289', category: 'guia' },
      { id: 'biz-rosquillas-francisca', name: 'Taller de Rosquillas Doña Francisca', department: 'Madriz', type: 'Gastronomía Tradicional', host: 'Doña Francisca Tercero', phone: '50586421180', category: 'alimentacion' },
      { id: 'biz-posada-somoto', name: 'Posada Campesina Las Sabanas & Somoto', department: 'Madriz', type: 'Hospedaje Rural', host: 'Familia Tercero', phone: '50584431289', category: 'hospedaje' }
    ],
    leon: [
      { id: 'biz-guias-cerro-negro', name: 'Guías Baqueanos Volcán Cerro Negro', department: 'León', type: 'Guías & Sandboarding', host: 'Marcos Rivas Carcache', phone: '50588442310', category: 'guia' },
      { id: 'biz-hostal-poco-a-poco', name: 'Hostal Colonial & Tours León', department: 'León', type: 'Hospedaje Colonial', host: 'Elena Rostrán Silva', phone: '50587213455', category: 'hospedaje' },
      { id: 'biz-surf-las-penitas', name: 'Surf Camp & Manglares Las Peñitas', department: 'León', type: 'Surf & Hospedaje de Playa', host: 'Carlos Delgado', phone: '50586114520', category: 'actividad' },
      { id: 'biz-quesillos-la-paz', name: 'Quesillos Tradicionales La Paz Centro', department: 'León', type: 'Gastronomía Típica', host: 'Doña Rosaura', phone: '50584219904', category: 'alimentacion' }
    ],
    rivas: [
      { id: 'biz-ometepe-viva', name: 'Red Comunitaria Ometepe Viva', department: 'Rivas (Ometepe)', type: 'Guías de Volcán & Ecoturismo', host: 'Ramón Mendoza', phone: '50587220199', category: 'guia' },
      { id: 'biz-finca-magdalena', name: 'Finca Magdalena Eco-Lodge Campesino', department: 'Rivas (Ometepe)', type: 'Hospedaje Rural & Café', host: 'Cooperativa Agropecuaria Magdalena', phone: '50584440019', category: 'hospedaje' },
      { id: 'biz-pescadores-sjds', name: 'Cooperativa Pescadores San Juan del Sur', department: 'Rivas', type: 'Lanchas & Navegación Costera', host: 'Capitán Silvio Morales', phone: '50588771120', category: 'transporte' },
      { id: 'biz-playa-maderas-surf', name: 'Surf Camp Maderas & Popoyo', department: 'Rivas', type: 'Aventura & Playa', host: 'Marcos Guasacate', phone: '50589110034', category: 'actividad' }
    ],
    matagalpa: [
      { id: 'biz-selva-negra', name: 'Ecolodge Campesino Selva Negra', department: 'Matagalpa', type: 'Ecoturismo, Senderismo & Café', host: 'Familia Kühl', phone: '50584332210', category: 'hospedaje' },
      { id: 'biz-guias-penas-blancas', name: 'Guías Macizo Peñas Blancas', department: 'Matagalpa', type: 'Guías de Montaña & Nebliselva', host: 'Guardianes del Macizo', phone: '50584431289', category: 'guia' },
      { id: 'biz-comedor-la-sombra', name: 'Comedor Campesino La Sombra', department: 'Matagalpa', type: 'Gastronomía Norteña', host: 'Doña Carmen Rizo', phone: '50584431289', category: 'alimentacion' }
    ],
    jinotega: [
      { id: 'biz-finca-san-marcos', name: 'Hacienda Cafetalera San Marcos', department: 'Jinotega', type: 'Agroturismo & Café de Altura', host: 'Don Arnulfo Zeledón', phone: '50584431289', category: 'actividad' },
      { id: 'biz-campamento-bocay', name: 'Campamento Bocay Selva & Nebliselva', department: 'Jinotega', type: 'Aventura & Camping', host: 'Bocay Ecotour', phone: '50584431289', category: 'guia' },
      { id: 'biz-hostal-apanas', name: 'Hostal Brisas de Apanás', department: 'Jinotega', type: 'Hospedaje en Lago de Apanás', host: 'Familia Pineda', phone: '50584431289', category: 'hospedaje' }
    ],
    granada: [
      { id: 'biz-guias-mombacho', name: 'Guías Reserva Natural Volcán Mombacho', department: 'Granada', type: 'Guías de Bosque Nuboso & Canopy', host: 'Fundación Mombacho', phone: '50585521990', category: 'guia' },
      { id: 'biz-lanchas-lago-azul', name: 'Lanchas El Lago Azul (Isletas)', department: 'Granada', type: 'Navegación en el Cocibolca', host: 'Don Francisco Chamorro', phone: '50584431289', category: 'transporte' },
      { id: 'biz-hotel-dario', name: 'Hotel Colonial Darío', department: 'Granada', type: 'Hospedaje Patrimonial', host: 'Recepción Central Darío', phone: '50525523400', category: 'hospedaje' },
      { id: 'biz-vigoron-toribia', name: 'Vigorón Tradicional La Gran Sultana', department: 'Granada', type: 'Gastronomía Tradicional', host: 'Doña Toribia Gastón', phone: '50585023319', category: 'alimentacion' }
    ],
    masaya: [
      { id: 'biz-posada-la-abuela', name: 'Posada Ecológica La Abuela (Laguna de Apoyo)', department: 'Masaya', type: 'Alojamiento & Reserva Natural', host: 'Gerencia La Abuela', phone: '50588665544', category: 'hospedaje' },
      { id: 'biz-guias-masaya', name: 'Guías Parque Nacional Volcán Masaya', department: 'Masaya', type: 'Geología & Cuevas Volcánicas', host: 'Guías Volcán Masaya', phone: '50584431289', category: 'guia' },
      { id: 'biz-taller-catarina', name: 'Taller de Cerámica y Viveros Catarina', department: 'Masaya', type: 'Artesanías & Mirador', host: 'Familia Gaitán', phone: '50583349100', category: 'actividad' }
    ],
    'rio san juan': [
      { id: 'biz-guias-guatuzos', name: 'Guías Comunitarios Río San Juan & Los Guatuzos', department: 'Río San Juan', type: 'Safari Fluvial & Aves', host: 'Colectivo Guatuzos', phone: '50586431980', category: 'guia' },
      { id: 'biz-coop-el-castillo', name: 'Cooperativa Pesquera y Guías El Castillo', department: 'Río San Juan', type: 'Patrimonio Histórico & Panga', host: 'Don Sergio Morales', phone: '50588339910', category: 'transporte' },
      { id: 'biz-sabalos-lodge', name: 'Sábalos Lodge Campesino', department: 'Río San Juan', type: 'Hospedaje Ribereño', host: 'Familia Miranda', phone: '50584431289', category: 'hospedaje' }
    ],
    esteli: [
      { id: 'biz-comedor-chepita', name: 'Comedor Campesino Doña Chepita', department: 'Estelí', type: 'Gastronomía del Maíz', host: 'Doña Chepita Gadea', phone: '50584431289', category: 'alimentacion' },
      { id: 'biz-taller-limay', name: 'Taller Escultórico San Juan de Limay', department: 'Estelí', type: 'Artesanía en Marmolina', host: 'Maestros Canteros de Limay', phone: '50584719022', category: 'actividad' },
      { id: 'biz-eco-tisey', name: 'Ecoalbergue Tisey & La Estanzuela', department: 'Estelí', type: 'Senderismo & Alojamiento Rural', host: 'Cooperativa Tisey', phone: '50584431289', category: 'hospedaje' }
    ],
    chinandega: [
      { id: 'biz-guias-cosiguina', name: 'Guías Comunitarios Volcán Cosigüina', department: 'Chinandega', type: 'Senderismo de Cráter & Golfo', host: 'Don Efraín Potosí', phone: '50589127760', category: 'guia' },
      { id: 'biz-guias-san-cristobal', name: 'Guías Alta Montaña Volcán San Cristóbal', department: 'Chinandega', type: 'Alta Montaña', host: 'Guías de Occidente', phone: '50586903341', category: 'guia' },
      { id: 'biz-mariscos-corinto', name: 'Rancho Mariscos & Aventura Corinto', department: 'Chinandega', type: 'Gastronomía Marina', host: 'Doña Miriam Galeano', phone: '50588231940', category: 'alimentacion' }
    ],
    carazo: [
      { id: 'biz-comedor-gueguense', name: 'Comedor Tradicional El Güegüense', department: 'Carazo', type: 'Gastronomía Folclórica', host: 'Doña Rosario Diriamba', phone: '50584431289', category: 'alimentacion' },
      { id: 'biz-reserva-concepcion', name: 'Reserva Privada Silvestre La Concepción', department: 'Carazo', type: 'Ecoturismo & Senderos', host: 'Don Manuel Arana', phone: '50584431289', category: 'actividad' }
    ],
    'nueva segovia': [
      { id: 'biz-coop-jalapa', name: 'Cooperativa Agropecuaria & Agroturismo Jalapa', department: 'Nueva Segovia', type: 'Turismo Rural Campesino', host: 'Don Mateo Pastrana', phone: '50584431289', category: 'actividad' },
      { id: 'biz-artesanas-mozonte', name: 'Artesanas de Cerámica Precolombina Mozonte', department: 'Nueva Segovia', type: 'Artesanía Ancestral', host: 'Colectivo Indígena Chorotega', phone: '50584431289', category: 'actividad' }
    ],
    boaco: [
      { id: 'biz-ruta-queso-boaco', name: 'Ruta del Queso y Finca Agroecológica Boaco', department: 'Boaco', type: 'Agroturismo & Lácteos', host: 'Don Teodoro Barquero', phone: '50584431289', category: 'actividad' }
    ],
    chontales: [
      { id: 'biz-guias-amerrisque', name: 'Guías Arqueológicos Amerrisque & Juigalpa', department: 'Chontales', type: 'Arqueología & Cordillera', host: 'Lic. Barea Juigalpa', phone: '50584431289', category: 'guia' }
    ],
    caribe: [
      { id: 'biz-coop-corn-island', name: 'Cooperativa Ecoturística Corn Island', department: 'Caribe (RACCS)', type: 'Alojamiento, Buceo & Snorkel', host: 'Colectivo Isleño Corn Island', phone: '50586903344', category: 'hospedaje' },
      { id: 'biz-rondon-pearl', name: 'Comedor Ancestral Rondon Miss Pearl', department: 'Caribe (RACCS)', type: 'Gastronomía Afrocaribeña', host: 'Miss Pearl Sambola', phone: '50587304522', category: 'alimentacion' }
    ],
    managua: [
      { id: 'biz-reserva-kilimanjaro', name: 'Reserva Privada Kilimanjaro (El Crucero)', department: 'Managua', type: 'Senderismo de Montaña Fresca', host: 'Equipo Kilimanjaro', phone: '50584431289', category: 'actividad' },
      { id: 'biz-fritanga-jacinto', name: 'Fritanga Auténtica Don Jacinto', department: 'Managua', type: 'Gastronomía Típica', host: 'Don Jacinto Jarquín', phone: '50589113400', category: 'alimentacion' }
    ]
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

  function normalizePriceKey(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  function applyPublishedPrices(plan) {
    plan.presupuesto_estimado = null;
    (plan.days || []).forEach(day => {
      (day.activities || []).forEach(activity => {
        const activityKey = normalizePriceKey(activity.nombre);
        const service = state.services.find(item => {
          if (!item.usable) return false;
          const serviceKey = normalizePriceKey(item.nombre || item.name || item.title);
          return serviceKey && (activityKey.includes(serviceKey) || serviceKey.includes(activityKey));
        });
        activity.precio_publicado = service
          ? money(service.precio, service.moneda || service.currency)
          : null;
        delete activity.precio_estimado;
      });
    });
    return plan;
  }

  function buildBudgetAllocation(input) {
    const total = Number(input.budget) || 0;
    const available = total * 0.8;
    const overnight = Number(input.days) > 1;
    const weights = overnight
      ? [
          ['Transporte o renta de vehículo', 0.30, 'fa-car-side'],
          ['Hospedaje', 0.25, 'fa-bed'],
          ['Comida y agua', 0.25, 'fa-utensils'],
          ['Entradas y actividades', 0.15, 'fa-ticket'],
          ['Gastos menores', 0.05, 'fa-bag-shopping']
        ]
      : [
          ['Transporte o renta de vehículo', 0.40, 'fa-car-side'],
          ['Comida y agua', 0.30, 'fa-utensils'],
          ['Entradas y actividades', 0.20, 'fa-ticket'],
          ['Gastos menores', 0.10, 'fa-bag-shopping']
        ];
    return {
      available,
      reserve: total * 0.2,
      items: weights.map(([label, weight, icon]) => ({ label, icon, amount: available * weight }))
    };
  }

  function dualMoney(value, currency) {
    const isUsd = currency === 'USD';
    const nio = isUsd ? value * OFFICIAL_BCN_RATE_2026 : value;
    const usd = isUsd ? value : value / OFFICIAL_BCN_RATE_2026;
    return `${money(nio, 'NIO')} · ${money(usd, 'USD')}`;
  }

  function db() {
    return window.firebase?.firestore ? window.firebase.firestore() : null;
  }

  // --------------------------------------------------------------------------
  // ASIGNACIÓN INTELIGENTE DE NEGOCIOS Y CONEXIÓN WHATSAPP DIRECTA
  // --------------------------------------------------------------------------
  function resolveTerritoryKey(text) {
    const raw = String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (raw.includes('somoto') || raw.includes('madriz')) return 'madriz';
    if (raw.includes('leon') || raw.includes('cerro negro') || raw.includes('maribios') || raw.includes('penitas') || raw.includes('telica')) return 'leon';
    if (raw.includes('ometepe') || raw.includes('rivas') || raw.includes('san juan del sur') || raw.includes('popoyo') || raw.includes('maderas')) return 'rivas';
    if (raw.includes('matagalpa') || raw.includes('selva negra') || raw.includes('penas blancas')) return 'matagalpa';
    if (raw.includes('jinotega') || raw.includes('apanas') || raw.includes('bocay')) return 'jinotega';
    if (raw.includes('granada') || raw.includes('mombacho') || raw.includes('isletas')) return 'granada';
    if (raw.includes('masaya') || raw.includes('apoyo') || raw.includes('catarina')) return 'masaya';
    if (raw.includes('rio san juan') || raw.includes('castillo') || raw.includes('guatuzos') || raw.includes('solentiname')) return 'rio san juan';
    if (raw.includes('esteli') || raw.includes('tisey') || raw.includes('miraflor') || raw.includes('limay')) return 'esteli';
    if (raw.includes('chinandega') || raw.includes('cosiguina') || raw.includes('san cristobal') || raw.includes('corinto')) return 'chinandega';
    if (raw.includes('carazo') || raw.includes('diriamba') || raw.includes('jinotepe')) return 'carazo';
    if (raw.includes('nueva segovia') || raw.includes('jalapa') || raw.includes('mozonte') || raw.includes('ocotal')) return 'nueva segovia';
    if (raw.includes('boaco')) return 'boaco';
    if (raw.includes('chontales') || raw.includes('juigalpa') || raw.includes('amerrisque')) return 'chontales';
    if (raw.includes('corn island') || raw.includes('caribe') || raw.includes('bluefields') || raw.includes('raccs') || raw.includes('raccn')) return 'caribe';
    return 'managua';
  }

  function getTerritoryBusinesses(territoryNameOrOrigin) {
    const key = resolveTerritoryKey(territoryNameOrOrigin);
    const list = [...(VERIFIED_BUSINESSES_BY_TERRITORY[key] || VERIFIED_BUSINESSES_BY_TERRITORY.managua)];

    if (Array.isArray(window.BaqueanoWebsiteBusinesses)) {
      window.BaqueanoWebsiteBusinesses.forEach(wb => {
        const wbKey = resolveTerritoryKey(wb.department || wb.name);
        if (wbKey === key && !list.some(item => item.id === wb.id || item.name === wb.name)) {
          list.push({
            id: wb.id,
            name: wb.name || wb.title,
            department: wb.department || 'Nicaragua',
            type: wb.type || wb.category || 'Anfitrión Aliado',
            host: wb.municipality ? wb.type + ' (' + wb.municipality + ')' : 'Anfitrión Verificado',
            phone: wb.phone || wb.whatsapp || MESA_CENTRAL_PHONE,
            category: (wb.type || '').toLowerCase().includes('hospedaje') || (wb.type || '').toLowerCase().includes('alojamiento') ? 'hospedaje' : 'actividad'
          });
        }
      });
    }

    return list;
  }

  function findBusinessForActivity(territoryBusinesses, actType, placeName) {
    const type = String(actType || '').toLowerCase();
    const pName = String(placeName || '').toLowerCase();

    const byName = territoryBusinesses.find(b => pName.includes(b.name.toLowerCase()) || b.name.toLowerCase().includes(pName));
    if (byName) return byName;

    if (type.includes('hospedaje') || type.includes('alojamiento') || type.includes('cabaña') || type.includes('hotel')) {
      const bHosp = territoryBusinesses.find(b => b.category === 'hospedaje' || b.type.toLowerCase().includes('hospedaje') || b.type.toLowerCase().includes('lodge'));
      if (bHosp) return bHosp;
    }
    if (type.includes('alimen') || type.includes('comida') || type.includes('gastronom') || type.includes('restaurante')) {
      const bFood = territoryBusinesses.find(b => b.category === 'alimentacion' || b.type.toLowerCase().includes('gastronom') || b.type.toLowerCase().includes('comedor'));
      if (bFood) return bFood;
    }
    if (type.includes('transporte') || type.includes('lancha') || type.includes('ferry') || type.includes('panga')) {
      const bTrans = territoryBusinesses.find(b => b.category === 'transporte' || b.type.toLowerCase().includes('lancha') || b.type.toLowerCase().includes('pesca'));
      if (bTrans) return bTrans;
    }

    return territoryBusinesses.find(b => b.category === 'guia') || territoryBusinesses[0];
  }

  function buildWhatsAppUrl(business, plan, input, specificActivity) {
    const rawPhone = String(business?.phone || business?.whatsapp || MESA_CENTRAL_PHONE).replace(/[^0-9]/g, '');
    const cleanPhone = rawPhone.startsWith('505') ? rawPhone : '505' + rawPhone;
    const bizName = business?.name || 'Anfitrión Baqueano';

    let msg = '¡Hola *' + bizName + '*! 👋\n';
    msg += 'Te contacto desde la plataforma oficial de *Baqueano Nicaragua* (ecoturismo sin intermediarios).\n\n';

    if (specificActivity) {
      msg += 'La IA de Baqueano me recomendó tu servicio para la siguiente actividad de mi ruta:\n';
      msg += '📍 *Actividad:* ' + specificActivity.nombre + '\n';
      msg += '🗺️ *Destino:* ' + (plan.destino_principal || input.origin) + '\n';
      if (specificActivity.precio_publicado) {
        msg += '🏷️ *Tarifa publicada en plataforma:* ' + specificActivity.precio_publicado + '\n';
      }
      msg += '👥 *Viajeros:* ' + input.adults + ' adultos' + (input.children ? ', ' + input.children + ' niños' : '') + '\n';
    } else {
      msg += 'La IA de Baqueano generó mi itinerario de aventura: *' + (plan.plan_title || plan.destino_principal) + '*.\n';
      msg += '📅 *Duración:* ' + input.days + ' días\n';
      msg += '👥 *Viajeros:* ' + input.adults + ' adultos' + (input.children ? ', ' + input.children + ' niños' : '') + ' (' + input.travelType + ')\n';
      msg += '💰 *Presupuesto máximo indicado por mí:* ' + money(input.budget, input.currency) + '\n';
      msg += '\nMe gustaría consultar tu disponibilidad para coordinar directamente contigo con 0% de comisiones foráneas.';
    }

    msg += '\n\n¿Tenés disponibilidad para atendernos? ¡Muchas gracias!';
    return 'https://wa.me/' + cleanPhone + '?text=' + encodeURIComponent(msg);
  }

  function enhancePlanWithBusinesses(plan, input) {
    const targetTerritory = plan.destino_principal || input.origin;
    const businesses = getTerritoryBusinesses(targetTerritory);

    const uniqueMap = new Map();

    (plan.days || []).forEach(day => {
      (day.activities || []).forEach(act => {
        const biz = findBusinessForActivity(businesses, act.tipo, act.nombre);
        act.business = biz;
        act.whatsappUrl = buildWhatsAppUrl(biz, plan, input, act);

        if (biz && !uniqueMap.has(biz.id)) {
          uniqueMap.set(biz.id, {
            ...biz,
            whatsappUrl: buildWhatsAppUrl(biz, plan, input)
          });
        }
      });
    });

    plan.recommended_businesses = Array.from(uniqueMap.values());
    if (!plan.recommended_businesses.length) {
      const fallbackBiz = businesses[0] || {
        id: 'biz-mesa-baqueano',
        name: 'Mesa Técnica Baqueano Nicaragua',
        department: 'Nicaragua',
        type: 'Coordinación y Enlace Territorial',
        host: 'Mesa Oficial Baqueano',
        phone: MESA_CENTRAL_PHONE,
        category: 'guia',
        isFallbackContact: true
      };
      fallbackBiz.whatsappUrl = buildWhatsAppUrl(fallbackBiz, plan, input);
      plan.recommended_businesses.push(fallbackBiz);
    }

    plan.selected_business = plan.recommended_businesses[0];
    plan.hasDirectContact = plan.recommended_businesses.some(business => {
      const phone = String(business.phone || business.whatsapp || '').replace(/\D/g, '');
      return !business.isFallbackContact && phone.length >= 11;
    });
    return plan;
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

          <!-- TARJETA CTA PRINCIPAL -->
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
            <p>Completá estos 4 datos para que el sistema y la IA armen tu itinerario con anfitriones reales.</p>
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

  function closeResult() {
    const showcase = $('rbResultShowcase');
    if (!showcase || showcase.style.display === 'none') return;
    showcase.style.display = 'none';
    showcase.setAttribute('aria-hidden', 'true');
    const launchButton = $('btnOpenPlannerModal');
    launchButton?.focus({ preventScroll: true });
    launchButton?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function bindModalEvents() {
    $('btnOpenPlannerModal')?.addEventListener('click', openModal);
    $('btnClosePlannerModal')?.addEventListener('click', closeModal);

    $('routePlannerModal')?.addEventListener('click', e => {
      if (e.target.id === 'routePlannerModal') closeModal();
    });

    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      const modal = $('routePlannerModal');
      if (modal?.classList.contains('is-open')) closeModal();
      else closeResult();
    });

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

    const interestsContainer = $('modalInterestsChips');
    if (interestsContainer) {
      interestsContainer.querySelectorAll('.planner-chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          btn.classList.toggle('active');
        });
      });
    }

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

    const reserve = budgetVal * 0.2;
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
          usable: (raw.published === true || raw.status === 'published')
            && raw.disponibilidad === true
            && Number(raw.precio) > 0
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

    let target = territories.find(t => t.name.toLowerCase().includes(input.origin.toLowerCase()))
      || territories[Math.floor(Math.random() * territories.length)];

    const daysArray = [];
    for (let d = 1; d <= input.days; d++) {
      const dayActivities = [];
      const placeIndex = (d - 1) % (target.places?.length || 1);
      const placeName = target.places?.[placeIndex]?.name || (target.name + ' - Parada ' + d);
      const actName = target.activities?.[placeIndex] || 'Exploración con guía local comunitario';

      dayActivities.push({
        nombre: placeName,
        tipo: 'actividad',
        descripcion: actName + '. Acompañamiento por guía campesino acreditado.',
        precio_publicado: null,
        fuente: 'Baqueano Oficial (Territorio Verificado)'
      });

      dayActivities.push({
        nombre: 'Hospedaje Rural Comunitario en ' + target.name.split('&')[0].trim(),
        tipo: 'hospedaje',
        descripcion: 'Habitación ecológica administrada directamente por familias locales con baño privado y vistas naturales.',
        precio_publicado: null,
        fuente: 'Red de Anfitriones Baqueano'
      });

      dayActivities.push({
        nombre: 'Alimentación Autóctona del Maíz y Café',
        tipo: 'alimentacion',
        descripcion: 'Desayuno campesino y cena típica con productos de la milpa local.',
        precio_publicado: null,
        fuente: 'Cocina Local Campesina'
      });

      daysArray.push({
        day: d,
        titulo: d === 1 ? ('Llegada a ' + target.name) : (d === input.days ? 'Cierre de aventura y retorno' : ('Inmersión en ' + placeName)),
        activities: dayActivities
      });
    }

    return {
      plan_title: input.days + ' Días de Ecoturismo Auténtico en ' + target.name,
      destino_principal: target.name,
      resumen: 'Itinerario equilibrado saliendo desde ' + input.origin + '. Diseñado para vivir naturaleza auténtica, apoyar cooperativas rurales y maximizar tu presupuesto sin intermediarios.',
      presupuesto_estimado: null,
      days: daysArray,
      recomendacion_final: 'Llevá calzado cómodo de senderismo, botella reutilizable para huella cero y dinero en efectivo (córdobas) para apoyar a los artesanos locales.',
      nota_ia: 'Cuando no existe una tarifa publicada en el catálogo, el precio debe consultarse directamente al anfitrión.',
      _source: 'territory'
    };
  }

  // --------------------------------------------------------------------------
  // 6. CONSULTA A IA MULTI-PROVEEDOR (DEEPSEEK / GEMINI) CON FAIL-SAFE TERRITORIAL
  // --------------------------------------------------------------------------
  async function callAIPlanner(input) {
    const territories = (window.BAQUEANO_TERRITORIES || []).slice(0, 6);
    const contextStr = territories.map(t =>
      '• ' + t.name + ': ' + t.shortDesc + ' Lugares: ' + (t.places || []).slice(0, 3).map(p => p.name).join(', ') + '. Actividades: ' + (t.activities || []).slice(0, 2).join(', ') + '.'
    ).join('\n');

    const prompt = `Eres el planificador oficial de Baqueano Nicaragua (baqueano.com).
Genera un itinerario turístico REAL, AUTÉNTICO y VERIFICABLE en formato JSON estricto.

REGLAS:
- Solo usa lugares reales de Nicaragua.
- No inventes precios ni rangos. Usa null cuando no exista una tarifa publicada y verificable en el contexto.
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
          "precio_publicado": null,
          "fuente": "Baqueano Verificado"
        }
      ]
    }
  ],
  "recomendacion_final": "...",
  "nota_ia": "Itinerario asistido con IA fundamentado en destinos verificados de Nicaragua."
}`;

    // 6.1 Intento prioritario con OpenAI API (GPT-4o Mini)
    if (OPENAI_API_KEY) {
      try {
        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'Eres el planificador oficial de Baqueano Nicaragua (baqueano.com). Genera un itinerario turístico REAL, AUTÉNTICO y VERIFICABLE en formato JSON estricto conforme a la estructura indicada.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
            max_tokens: 2048
          })
        });

        if (resp.ok) {
          const data = await resp.json();
          const raw = data?.choices?.[0]?.message?.content;
          if (raw) {
            const clean = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
            const parsed = JSON.parse(clean);
            parsed._source = 'openai';
            return parsed;
          }
        } else {
          console.warn(`[RouteBuilder] OpenAI API status ${resp.status} - Activando cascada de respaldo`);
        }
      } catch (err) {
        console.warn('[RouteBuilder] OpenAI API no disponible:', err.message);
      }
    }

    // 6.2 Intento con DeepSeek API oficial
    if (DEEPSEEK_API_KEY) {
      try {
        const resp = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              {
                role: 'system',
                content: 'Eres el planificador oficial de Baqueano Nicaragua (baqueano.com). Genera un itinerario turístico REAL, AUTÉNTICO y VERIFICABLE en formato JSON estricto conforme a la estructura indicada.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
            max_tokens: 2048
          })
        });

        if (resp.ok) {
          const data = await resp.json();
          const raw = data?.choices?.[0]?.message?.content;
          if (raw) {
            const clean = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
            const parsed = JSON.parse(clean);
            parsed._source = 'deepseek';
            return parsed;
          }
        } else {
          console.warn(`[RouteBuilder] DeepSeek API status ${resp.status} - Activando fail-safe inteligente Baqueano`);
        }
      } catch (err) {
        console.warn('[RouteBuilder] DeepSeek API no disponible:', err.message);
      }
    }

    // 6.3 Intento alternativo con Google Gemini API
    if (GEMINI_API_KEY) {
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
    }

    // 6.4 Respaldo seguro y determinista: Motor Territorial Baqueano
    return buildTerritoryFallbackPlan(input);
  }

  // --------------------------------------------------------------------------
  // 7. RENDERIZADO DEL PLAN GENERADO
  // --------------------------------------------------------------------------
  function renderPlan(rawPlan, input) {
    const showcase = $('rbResultShowcase');
    const result = $('rbResult');
    if (!showcase || !result) return;

    // Enriquecer el plan con negocios reales y enlaces específicos a WhatsApp
    const plan = enhancePlanWithBusinesses(applyPublishedPrices(rawPlan), input);
    const budgetAllocation = !plan.hasDirectContact ? buildBudgetAllocation(input) : null;

    // Persistir itinerario en Supabase (public.travel_plans)
    try {
      const anonKey = 'sb_publishable_q7ZhqRIRjlerZK7WOu_Qxw_X_AqXV1d';
      const user = (window.BaqueanoSession && window.BaqueanoSession.getUser) ? window.BaqueanoSession.getUser() : null;
      const uid = user ? user.firebaseUid : null;
      if (window.baqueanoSupabase && window.baqueanoSupabase.from) {
        window.baqueanoSupabase.from('travel_plans').insert({
          user_uid: uid,
          plan_title: plan.plan_title || ('Ruta Baqueano en ' + (plan.destino_principal || 'Nicaragua')),
          destination: plan.destino_principal || input.origin || 'Nicaragua',
          days: Number(input.days) || 3,
          budget: Number(input.budgetUsd) || 300,
          currency: 'USD',
          payload: plan,
          source: plan._source || 'route-builder'
        }).then(({ error }) => {
          if (error) console.warn('[Supabase Sync] Aviso en travel_plans:', error.message);
          else console.info('🟢 [Supabase Sync] Plan de viaje registrado en Supabase.');
        }).catch(err => console.warn('[Supabase Sync] Error plan:', err.message));
      } else {
        fetch('https://heiudfpthqwtjrtluqlm.supabase.co/rest/v1/travel_plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            user_uid: uid,
            plan_title: plan.plan_title || ('Ruta Baqueano en ' + (plan.destino_principal || 'Nicaragua')),
            destination: plan.destino_principal || input.origin || 'Nicaragua',
            days: Number(input.days) || 3,
            budget: Number(input.budgetUsd) || 300,
            currency: 'USD',
            payload: plan,
            source: plan._source || 'route-builder'
          })
        }).catch(e => console.warn('[Supabase Sync] Error REST plan:', e.message));
      }
    } catch (saveErr) {
      console.warn('[RouteBuilder] No se pudo guardar en Supabase:', saveErr);
    }

    showcase.style.display = 'block';
    showcase.setAttribute('aria-hidden', 'false');

    const isAi = plan._source === 'openai' || plan._source === 'deepseek' || plan._source === 'gemini';
    const aiProviderMap = {
      openai: 'OpenAI GPT-4o',
      deepseek: 'DeepSeek Chat',
      gemini: 'Google Gemini'
    };
    const aiProviderName = aiProviderMap[plan._source] || 'IA Inteligente';
    const sourceBadge = isAi
      ? `<div class="rb-source-badge rb-source-ai"><i class="fa-solid fa-robot"></i> Generado por ${aiProviderName} · Fundamentado en destinos reales de Nicaragua</div>`
      : `<div class="rb-source-badge rb-source-verified"><i class="fa-solid fa-compass"></i> Itinerario Oficial Baqueano · Catálogo Territorial Verificado</div>`;

    const mesaBaqueanoWaUrl = 'https://wa.me/' + MESA_CENTRAL_PHONE + '?text=' + encodeURIComponent(
      'Hola Mesa Técnica Baqueano 👋, deseo coordinar mi itinerario asistido: *' + plan.plan_title + '* (' + input.days + ' días en ' + plan.destino_principal + '). Negocios recomendados por la IA: ' + plan.recommended_businesses.map(b => b.name).join(', ') + '. ¿Podrían asesorarme?'
    );

    result.innerHTML = `
      <button type="button" class="rb-result-close" id="rbCloseResult" aria-label="Cerrar itinerario" title="Cerrar itinerario">
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
      ${sourceBadge}

      <div class="rb-ai-disclaimer" style="margin-top: 0.8rem;">
        <i class="fa-solid fa-circle-check"></i>
        <div>
          <strong>Conexión directa con anfitriones registrados</strong>
          Solo mostramos tarifas publicadas en el catálogo. Cuando no existe una tarifa vigente, debés consultar precio y disponibilidad directamente.
        </div>
      </div>

      <div class="rb-result-hero">
        <div>
          <span>${plan.destino_principal || input.origin}</span>
          <h3>${plan.plan_title || 'Tu Aventura en Nicaragua'}</h3>
        </div>
        <div class="rb-quality rb-quality--ai">
          <i class="fa-solid fa-shield-halved"></i>
          <span>Datos del catálogo</span>
        </div>
      </div>

      <p class="rb-ai-resumen">${plan.resumen || ''}</p>

      ${plan.presupuesto_estimado ? `
        <div class="rb-exchange-note">
          <i class="fa-solid fa-wallet"></i> Inversión Estimada: <strong>${plan.presupuesto_estimado}</strong> (Presupuesto definido: ${money(input.budget, input.currency)})
        </div>` : ''}

      ${budgetAllocation ? `
        <section class="rb-budget-allocation" aria-labelledby="rbBudgetAllocationTitle">
          <div class="rb-budget-allocation-head">
            <div><span>ORIENTACIÓN SIN CONTACTO DIRECTO</span><h4 id="rbBudgetAllocationTitle">Distribución sugerida del 80% de tu presupuesto</h4></div>
            <strong>${dualMoney(budgetAllocation.available, input.currency)}</strong>
          </div>
          <p>Esto no es una tarifa del destino. Es un límite de gasto para organizarte mientras no exista un teléfono directo registrado.</p>
          <div class="rb-budget-allocation-grid">
            ${budgetAllocation.items.map(item => `<article><i class="fa-solid ${item.icon}"></i><span>${item.label}</span><strong>${dualMoney(item.amount, input.currency)}</strong></article>`).join('')}
          </div>
          <div class="rb-budget-reserve"><i class="fa-solid fa-shield-heart"></i> Reserva para imprevistos (20%): <strong>${dualMoney(budgetAllocation.reserve, input.currency)}</strong></div>
          <small>Conversión de referencia: US$1 = C$${OFFICIAL_BCN_RATE_2026}, tipo de cambio oficial BCN 2026.</small>
        </section>` : ''}

      <!-- LISTA DE DÍAS Y ACTIVIDADES CON SUS ANFITRIONES -->
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
                    <span class="rb-price-state is-ai"><i class="fa-solid fa-tag"></i> ${act.precio_publicado ? 'Tarifa publicada' : 'Consultar precio'}</span>
                    ${act.fuente ? `<span class="rb-updated"><i class="fa-solid fa-link"></i> ${act.fuente}</span>` : ''}
                  </div>
                  <!-- Chip del Anfitrión Recomendado para esta actividad -->
                  ${act.business ? `
                    <div class="rb-act-business-chip">
                      <span class="rb-act-host-tag"><i class="fa-solid fa-store"></i> Anfitrión: <strong>${act.business.name}</strong></span>
                      <a href="${act.whatsappUrl}" target="_blank" rel="noopener noreferrer" class="rb-act-wa-btn" title="Chatear con ${act.business.name} por WhatsApp">
                        <i class="fa-brands fa-whatsapp"></i> Chatear
                      </a>
                    </div>
                  ` : ''}
                </div>
                <div class="rb-service-price">
                  <strong>${act.precio_publicado || 'Consultar precio'}</strong>
                  <span>${act.precio_publicado ? 'según publicación' : 'con el anfitrión'}</span>
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

      <!-- BLOQUE INTERACTIVO: NEGOCIOS Y ANFITRIONES RECOMENDADOS POR LA IA -->
      <div class="rb-recommended-businesses-wrap">
        <div class="rb-biz-header">
          <div class="badge-section-pill" style="margin-bottom: 0.4rem;">
            <i class="fa-solid fa-handshake-angle"></i> Comercio Justo · 0% Comisión
          </div>
          <h4>Negocios y Anfitriones Recomendados por la IA en tu Ruta</h4>
          <p>Seleccioná con cuál negocio deseas coordinar por WhatsApp o contactá a cada uno de forma individual:</p>
        </div>
        <div class="rb-biz-cards-grid" id="rbBizCardsGrid">
          ${plan.recommended_businesses.map(biz => `
            <div class="rb-biz-card ${biz.id === plan.selected_business.id ? 'is-selected' : ''}" data-biz-id="${biz.id}">
              <div class="rb-biz-card-head">
                <span class="rb-biz-type"><i class="fa-solid fa-circle-check"></i> ${biz.type}</span>
                <span class="rb-biz-verified">Verificado Baqueano</span>
              </div>
              <h5 class="rb-biz-name">${biz.name}</h5>
              <p class="rb-biz-meta"><i class="fa-solid fa-user-check"></i> ${biz.host} · ${biz.department}</p>
              <div class="rb-biz-card-footer">
                <button type="button" class="btn-select-biz ${biz.id === plan.selected_business.id ? 'active' : ''}" data-biz-id="${biz.id}">
                  <i class="fa-solid ${biz.id === plan.selected_business.id ? 'fa-circle-check' : 'fa-circle'}"></i> 
                  <span>${biz.id === plan.selected_business.id ? 'Seleccionado' : 'Seleccionar'}</span>
                </button>
                <a href="${biz.whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn-biz-wa" title="Chatear con ${biz.name} por WhatsApp">
                  <i class="fa-brands fa-whatsapp"></i> WhatsApp
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- BOTONES DE ACCIÓN PRINCIPALES -->
      <div class="rb-result-actions" style="margin-top: 1.5rem;">
        <a href="${plan.selected_business.whatsappUrl}" id="rbMainWaBtn"
           target="_blank" rel="noopener noreferrer" class="btn-calculate-route" style="justify-content: center;">
          <i class="fa-brands fa-whatsapp"></i> Coordinar Ruta con ${plan.selected_business.name} por WhatsApp
        </a>
        <button type="button" id="rbReopenPlanner" class="btn-share-route" style="justify-content: center;">
          <i class="fa-solid fa-sliders"></i> Ajustar Preferencias
        </button>
      </div>

      <div class="rb-mesa-coordination-note">
        <a href="${mesaBaqueanoWaUrl}" target="_blank" rel="noopener noreferrer" class="rb-mesa-link">
          <i class="fa-solid fa-shield-halved" style="color: #f65e01;"></i> ¿Deseas asistencia integral para toda la ruta? Coordinar con Mesa Central Baqueano (+505 8443-1289)
        </a>
      </div>

      <p class="rb-ai-footer-note">${plan.nota_ia || ''}</p>
    `;

    // Eventos de selección dinámica de negocio
    const cardsGrid = $('rbBizCardsGrid');
    const mainWaBtn = $('rbMainWaBtn');

    if (cardsGrid && mainWaBtn) {
      cardsGrid.addEventListener('click', e => {
        const selectBtn = e.target.closest('.btn-select-biz') || e.target.closest('.rb-biz-card');
        if (!selectBtn || e.target.closest('.btn-biz-wa')) return;

        const bizId = selectBtn.dataset.bizId || selectBtn.closest('.rb-biz-card')?.dataset.bizId;
        const targetBiz = plan.recommended_businesses.find(b => b.id === bizId);
        if (!targetBiz) return;

        plan.selected_business = targetBiz;

        // Actualizar estados visuales de tarjetas
        cardsGrid.querySelectorAll('.rb-biz-card').forEach(card => {
          const isTarget = card.dataset.bizId === bizId;
          card.classList.toggle('is-selected', isTarget);
          const btn = card.querySelector('.btn-select-biz');
          if (btn) {
            btn.classList.toggle('active', isTarget);
            const icon = btn.querySelector('i');
            const span = btn.querySelector('span');
            if (icon) icon.className = isTarget ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle';
            if (span) span.textContent = isTarget ? 'Seleccionado' : 'Seleccionar';
          }
        });

        // Actualizar botón principal
        mainWaBtn.href = targetBiz.whatsappUrl;
        mainWaBtn.innerHTML = '<i class="fa-brands fa-whatsapp"></i> Coordinar Ruta con ' + targetBiz.name + ' por WhatsApp';
      });
    }

    $('rbReopenPlanner')?.addEventListener('click', openModal);
    $('rbCloseResult')?.addEventListener('click', closeResult);

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
        <p>Consultando catálogo de anfitriones y cooperativas verificadas de Nicaragua…</p>
      </div>
    `;
    showcase.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // --------------------------------------------------------------------------
  // 9. FUNCIÓN PRINCIPAL DE GENERACIÓN
  // --------------------------------------------------------------------------
  async function generate() {
    const input = getModalInput();

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
      const plan = await callAIPlanner(input);
      renderPlan(plan, input);
    } catch (err) {
      console.error('[RouteBuilder] Fallo de generación:', err);
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
    generate,
    buildWhatsAppUrl,
    enhancePlanWithBusinesses
  };

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})(window, document);
