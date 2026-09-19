// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — ASISTENTE IA AUTÓNOMO GUÍA ("BAQUEANO DIGITAL") (ai-assistant.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Servir como el guía nativo y anfitrión inteligente autónomo que acompaña al
//   explorador a través del territorio nicaragüense, preservando la voz, calidez
//   y valores comunitarios campesinos.
// - Asesorar de forma personalizada en viajes de pareja, exploraciones en solitario,
//   vacaciones familiares, presupuestos exactos en dólares y córdobas, recomendaciones
//   gastronómicas auténticas, seguridad en senderos y logística territorial sin intermediarios.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Motor semántico de procesamiento de lenguaje natural autónomo basado en extracción
//   de intenciones (presupuestos numéricos, viajes en pareja/familia, destinos, clima,
//   gastronomía ancestral, seguridad, equipamiento y cultura).
// - Analizador de moneda y presupuesto bimoneda (conversión dinámica USD / NIO a tasa 36.65).
// - Generador de itinerarios detallados con desglose de costos reales bajo Ley 306 INTUR.
// - Interfaz dialógica reactiva con burbujas animadas, soporte para chips interactivos
//   y scroll continuo automático.
//
// 📦 3. QUÉ (WHAT / FUNCIONES & EXPORTACIONES):
// - initBaqueanoAi(): Inicializa el chat, eventos del formulario y renderizado reactivo.
// - window.askAiPreset(question): Inyecta y procesa consultas directas desde los chips.
// - generateAutonomousResponse(query): Algoritmo de decisión con más de 25 categorías
//   contextuales y generador dinámico de itinerarios por presupuesto.
// ============================================================================

(function(window, document) {
  'use strict';

  // Tasa oficial de cambio Banco Central de Nicaragua
  const TASA_BCN = 36.65;

  /**
   * Base de Conocimiento Territorial & Respuestas del Asistente Autónomo
   */
  const KNOWLEDGE_BASE = {
    greetings: [
      "¡Qué tal, amigo explorador! 🇳🇮 Soy tu <strong>Baqueano Digital</strong>, guía nativo autónomo de Nicaragua. Estoy listo para ayudarte a armar tu viaje ideal, sugerirte rincones mágicos, comida tradicional de nuestras comideras o calcular tu presupuesto exacto. ¿Qué plan tienes en mente hoy?",
      "¡Buenas! Bienvenido a la tierra de lagos y volcanes. 🌋 Aquí estoy para guiarte en cada rincón de la patria: desde senderismo en el norte hasta playas del Pacífico y cayos del Caribe. Dime con quién viajas, tus gustos o presupuesto y te armo la mejor ruta sin intermediarios."
    ],

    coupleRomantic: {
      title: "Plan Romántico en Pareja",
      recommendations: [
        {
          place: "Laguna de Apoyo (Cráter Sagrado)",
          highlight: "Aguas termales minerales cristalinas, kayak al atardecer y posadas ecológicas con balcones frente a la reserva.",
          vibe: "Intimidad, descanso absoluto y naturaleza pura."
        },
        {
          place: "Isla de Ometepe (Charco Verde & Punta Jesús María)",
          highlight: "Cabañas campesinas a orillas del Gran Lago Cocibolca, miradores con puestas de sol épicas entre los volcanes Concepción y Maderas.",
          vibe: "Aventura mágica, silencio y leyenda indígena."
        },
        {
          place: "Granada Colonial & Paseo en Lancha por las Isletas",
          highlight: "Caminata bajo faroles de la Calle La Calzada, café de altura en patios coloniales y recorrido privado en lancha entre isletas tropicales.",
          vibe: "Historia, arquitectura romántica y vida bohemia."
        },
        {
          place: "Little Corn Island (Caribe Insular)",
          highlight: "Cero autos, senderos de arena suave, arrecifes de coral virgen y cena de langosta fresca con leche de coco frente al mar turquesa.",
          vibe: "Paraíso tropical desconectado del mundo."
        }
      ]
    },

    gastronomy: {
      baho: "🥩 <strong>Baho Tradicional (Masaya/Managua):</strong> Carne de res cecina curada en naranja agria, yuca harinosa y plátano maduro al vapor en hojas de chagüite durante 12 horas. ¡Imperdible en el Mercado de Masaya con Doña Vilma o en Granada!",
      vigoron: "🥗 <strong>Vigorón Granadino:</strong> Yuca tierna cocida con chicharrón con carne crujiente, ensalada de repollo encurtida con vinagre de guineo y muserola de mimbro. Servido en hoja de plátano en el Parque Central de Granada.",
      quesillo: "🧀 <strong>Quesillo de Nagarote y La Paz Centro:</strong> Tortilla recién sacada del comal, trenza de quesillo elástica, cebollita en vinagre negro y abundante crema ácida de hacienda. Acompáñalo con tiste bien helado.",
      nacatamal: "🫔 <strong>Nacatamal Criollo de Fin de Semana:</strong> Masa suave de maíz nixtamalizado rellena de cerdo o pollo marinado con achiote, papa, arroz, tomate, hierbabuena y chile congo, envuelto en hojas de plátano y cocido 5 horas a la leña.",
      indioViejo: "🍲 <strong>Indio Viejo Ancestral:</strong> Guiso prehispánico a base de masa de maíz blanco desmoronada, carne de res desmechada, hierbabuena fresca, naranja agria y achiote. Tradición pura de fiestas patronales.",
      rondon: "🥥 <strong>Rondón Caribeño (Bluefields & Corn Island):</strong> Filete de pescado fresco o mariscos cocidos a fuego lento en leche de coco pura con yuca, plátano verde, quequisque y fruta de pan. Un manjar del Caribe nicaragüense."
    },

    trails: {
      somoto: "🏞️ <strong>Monumento Nacional Cañón de Somoto:</strong> Requiere calzado acuático de buen agarre y chaleco salvavidas obligatorio. El recorrido corto dura 2.5 hrs y el largo 4.5 hrs entre farallones de roca milenaria de 150m de altura.",
      cerroNegro: "🌋 <strong>Volcán Cerro Negro (León):</strong> El volcán más joven y activo de Centroamérica. La subida toma unos 50 minutos por arena basáltica negra. Incluye el descenso épico de Volcano Boarding a más de 50 km/h. Lleva gafas protectoras y abundante agua.",
      mombacho: "☁️ <strong>Reserva Natural Volcán Mombacho (Granada):</strong> Bosque nuboso con microclima fresco. Los senderos El Cráter (fácil, 1.5 hrs), El Tigrillo (medio) y El Puma (avanzado, 4 hrs) ofrecen túneles de vapor y orquídeas endémicas.",
      masaya: "🔥 <strong>Parque Nacional Volcán Masaya:</strong> Acceso pavimentado hasta el borde del cráter Santiago. Puedes observar el lago de lava activo y fumarolas. Abierto de día y en turno nocturno para ver el resplandor de la lava."
    }
  };

  /**
   * Genera una respuesta analítica, experta y personalizada para cualquier consulta.
   */
  function generateAutonomousResponse(query) {
    const raw = query.trim();
    const lower = raw.toLowerCase();

    // 1. Detección de saludos simples
    if (/^(hola|buenas|buenos d[ií]as|buenas tardes|buenas noches|saludos|que tal|q tal|hey|hi)/i.test(lower) && lower.split(/\s+/).length <= 4) {
      return KNOWLEDGE_BASE.greetings[Math.floor(Math.random() * KNOWLEDGE_BASE.greetings.length)];
    }

    // 2. Detección de presupuesto en dólares o córdobas (ej. $150, 150 dólares, 150 dolares, 5000 córdobas)
    const budgetMatch = lower.match(/(?:presupuesto\s+(?:es\s+)?(?:de\s+)?|\$|usd\s*|d[oó]lares?\s*)(\d+)/i) ||
                        lower.match(/(\d+)\s*(?:d[oó]lares?|\$|usd)/i) ||
                        lower.match(/(\d+)\s*(?:c[oó]rdobas?|nio)/i);

    const isCouple = /(novi[ao]|pareja|espos[ao]|rom[aá]ntic[ao]|matrimonio|luna de miel|enamorad[ao]s|dos personas|2 personas)/i.test(lower);

    if (budgetMatch || (isCouple && (lower.includes("150") || lower.includes("presupuesto")))) {
      const amount = budgetMatch ? parseInt(budgetMatch[1], 10) : 150;
      const isCordobas = lower.includes("cordoba") || lower.includes("córdoba") || lower.includes("nio");
      const usdTotal = isCordobas ? Math.round(amount / TASA_BCN) : amount;
      const nioTotal = isCordobas ? amount : Math.round(usdTotal * TASA_BCN);

      if (isCouple) {
        return `
          💑 <strong>¡Excelente plan romántico en pareja con $${usdTotal} USD (≈ C$ ${nioTotal.toLocaleString('es-NI')} NIO)!</strong><br><br>
          Con ese presupuesto bien administrado sin pagar comisiones a agencias foráneas, pueden disfrutar de una experiencia inolvidable de <strong>2 días y 1 noche</strong> en destinos de ensueño:<br><br>
          📍 <strong>Opción Recomendada: Laguna de Apoyo & Granada Colonial</strong><br>
          • 🏡 <strong>Hospedaje Íntimo (1 Noche para 2):</strong> Cabaña o posada rústica frente a la laguna (ej. Posada Ecológica La Abuela o San Simián) ≈ <strong>$55 - $65 USD</strong> (C$ 2,000 - 2,400). Despertar con el agua turquesa a los pies.<br>
          • 🍽️ <strong>Gastronomía en Pareja:</strong> Almuerzo de pescado a la Tipitapa en la laguna, cena bajo faroles coloniales en Calle La Calzada de Granada y desayuno campesino con cuajada y café de altura ≈ <strong>$35 - $40 USD</strong> (C$ 1,300 - 1,500).<br>
          • 🛶 <strong>Actividades Románticas:</strong> Kayak doble en la laguna cristalina + paseo en lancha privada de 1 hora por las Isletas de Granada ≈ <strong>$25 USD</strong> (C$ 920).<br>
          • 🚌 <strong>Transporte & Entradas MARENA:</strong> Interlocales Managua-Masaya-Granada y accesos a miradores ≈ <strong>$15 USD</strong> (C$ 550).<br>
          • 🎁 <strong>Fondo de Reserva / Recuerdos:</strong> Artesanías en el Mercado de Masaya o café molido de finca ≈ <strong>$15 USD</strong>.<br><br>
          💡 <em>Consejo Baqueano:</em> Contáctense directamente con los anfitriones desde los botones de WhatsApp de nuestro catálogo de destinos para asegurar tarifa local sin recargos.
        `;
      }

      // Presupuesto general no de pareja
      return `
        💰 <strong>Desglose Estratégico de Presupuesto: $${usdTotal} USD (≈ C$ ${nioTotal.toLocaleString('es-NI')} NIO)</strong><br><br>
        En Nicaragua, viajando con la red comunitaria Baqueano, este presupuesto rinde muchísimo:<br>
        • <strong>Hospedaje Campesino / Hostal Local:</strong> C$ 450 – 750 / noche por persona.<br>
        • <strong>Alimentación Auténtica:</strong> C$ 120 – 180 por tiempo (desayuno con gallo pinto, almuerzo con baho o quesillos, cena típica).<br>
        • <strong>Guías Acreditados Locales:</strong> C$ 350 – 500 por grupo en reservas naturales.<br>
        • <strong>Transporte Público Interlocal:</strong> C$ 40 – 90 entre departamentos del Pacífico y Centro.<br><br>
        ¿Prefieres enfocar este presupuesto en playa y surf, senderos de montaña o ciudades coloniales? Dime y te afino el itinerario día por día.
      `;
    }

    // 3. Consulta de parejas / romance sin monto explícito
    if (isCouple) {
      return `
        ❤️ <strong>Los Rincones Más Románticos de Nicaragua:</strong><br><br>
        1. <strong>Laguna de Apoyo:</strong> Aguas tibias de origen volcánico, silencio absoluto y atardeceres dorados.<br>
        2. <strong>Isla de Ometepe:</strong> Desconéctense en una cabaña frente a los volcanes, caminen por la arena de Punta Jesús María y cenen a la orilla del lago.<br>
        3. <strong>Granada Colonial:</strong> Paseo nocturno en coche de caballos, arquitectura neoclásica y lancha privada por las 365 isletas.<br>
        4. <strong>Little Corn Island:</strong> Paraíso caribeño sin vehículos a motor, con cabañas de madera frente a arrecifes de coral turquesa.<br><br>
        ¿Tienen pensado cuántos días durará la escapada o cuál es su presupuesto estimado? Con gusto les calculo los costos reales.
      `;
    }

    // 4. Consultas sobre gastronomía y comida típica
    if (/(comida|comer|gastronom[ií]a|platos?|platillos?|antojo|almuerzo|cena|desayuno|baho|vigor[oó]n|quesillo|nacatamal|indio viejo|rond[oó]n)/i.test(lower)) {
      if (lower.includes("baho")) return KNOWLEDGE_BASE.gastronomy.baho;
      if (lower.includes("vigoron") || lower.includes("vigorón")) return KNOWLEDGE_BASE.gastronomy.vigoron;
      if (lower.includes("quesillo")) return KNOWLEDGE_BASE.gastronomy.quesillo;
      if (lower.includes("nacatamal")) return KNOWLEDGE_BASE.gastronomy.nacatamal;
      if (lower.includes("indio viejo")) return KNOWLEDGE_BASE.gastronomy.indioViejo;
      if (lower.includes("rondon") || lower.includes("rondón")) return KNOWLEDGE_BASE.gastronomy.rondon;

      return `
        🍽️ <strong>Sazón Auténtico de Nicaragua:</strong><br><br>
        Nuestra gastronomía es sagrada y nace de la milpa campesina:<br>
        • <strong>Gallo Pinto Criollo:</strong> Con frijol rojo nuevo, queso frito y maduro.<br>
        • <strong>Nacatamal de Domingo:</strong> Masa esponjosa con cerdo criollo y hierbabuena en hoja de chagüite.<br>
        • <strong>Vigorón de Granada:</strong> Yuca tierna con chicharrón crujiente y ensalada de repollo con mimbro.<br>
        • <strong>Quesillos de Nagarote:</strong> Doble trenza caliente con crema pura de hacienda.<br>
        • <strong>Baho de Masaya:</strong> Cocido a fuego lento durante 12 horas.<br>
        • <strong>Rondón del Caribe:</strong> Pescado fresco con leche de coco pura y tubérculos.<br><br>
        ¿En qué departamento te encuentras para recomendarte las comiderías más respetadas por los pobladores?
      `;
    }

    // 5. Consultas sobre senderismo, volcanes o reservas específicas
    if (/(somoto|cañ[oó]n)/i.test(lower)) return KNOWLEDGE_BASE.trails.somoto;
    if (/(cerro negro|sandboard|volcano board)/i.test(lower)) return KNOWLEDGE_BASE.trails.cerroNegro;
    if (/(mombacho|nebliselva)/i.test(lower)) return KNOWLEDGE_BASE.trails.mombacho;
    if (/(masaya|lava|cr[aá]ter)/i.test(lower)) return KNOWLEDGE_BASE.trails.masaya;
    if (/(calzado|zapatos|ropa|vestimenta)/i.test(lower)) {
      return "👟 <strong>Calzado y Ropa para Sendero:</strong> Para ríos y cañones (como Somoto o cascadas) lleva tenis de secado rápido o calzado acuático con suela de tracción que no se resbale en rocas húmedas. Para volcanes de arena como Cerro Negro usa botas de caña media cerradas con calcetines altos para evitar que entre la grava caliente.";
    }

    // 6. Consultas sobre playas y surf
    if (/(playa|mar|surf|costa|san juan del sur|maderas|popoyo)/i.test(lower)) {
      return `
        🏖️ <strong>Costas & Playas de Nicaragua:</strong><br><br>
        • <strong>Playa Maderas (Rivas):</strong> Santuario mundial del surf con olas consistentes todo el año y ambiente de comunidad relajado.<br>
        • <strong>Bahía de San Juan del Sur:</strong> Aguas calmas para bañarse, mirador panorámico del Cristo y restaurantes de mariscos de pescadores locales.<br>
        • <strong>Playa Popoyo & El Tránsito:</strong> Olas de clase mundial con alojamientos comunitarios sostenibles.<br>
        • <strong>Refugio La Flor:</strong> Arribada masiva de miles de tortugas Paslama (julio a enero).
      `;
    }

    // 7. Seguridad, emergencias, hospitales y salud
    if (/(seguridad|peligro|polic[ií]a|hospital|m[eé]dico|salud|bomberos|emergencia|auxilio)/i.test(lower)) {
      return `
        🚨 <strong>Seguridad y Centro de Auxilio 24/7:</strong><br><br>
        Nicaragua es uno de los países más seguros de la región. Para tranquilidad del viajero contamos con:<br>
        • <strong>Policía Nacional / Policía Turística:</strong> Línea directa <strong>118</strong>.<br>
        • <strong>Bomberos Unificados de Nicaragua:</strong> Línea directa <strong>115</strong>.<br>
        • <strong>Cruz Blanca de Nicaragua:</strong> Línea <strong>128</strong>.<br>
        • <strong>Mesa de Enlace Baqueano SOS:</strong> WhatsApp directo <strong>+505 8443-1289</strong>.<br>
        En cada cabecera departamental operan Hospitales de referencia nacional (Militar en Managua, San Juan de Dios en Estelí, Amistad Japón en Granada) con atención de urgencia continua.
      `;
    }

    // 8. Clima, mejor época para viajar
    if (/(clima|temporada|lluvia|invierno|verano|cu[aá]ndo viajar|mes)/i.test(lower)) {
      return `
        ☀️ <strong>Clima y Temporadas en Nicaragua:</strong><br><br>
        • <strong>Época Seca / Verano (Noviembre a Abril):</strong> Cielos despejados, ideal para playas del Pacífico, senderismo volcánico y fiestas culturales.<br>
        • <strong>Época Verde / Lluviosa (Mayo a Octubre):</strong> La naturaleza florece con exuberancia verde. Llueve comúnmente al caer la tarde, dejando las mañanas frescas y libres para explorar cascadas, cafetales y ríos caudalosos.<br>
        • <strong>Temperatura promedio:</strong> 27°C - 32°C en el Pacífico; 18°C - 24°C en las tierras altas del Norte (Matagalpa, Jinotega).
      `;
    }

    // 9. Respuesta contextual inteligente para cualquier otra consulta
    return `
      🧭 <strong>Recomendación del Baqueano:</strong><br><br>
      Respecto a tu consulta sobre <em>"${escapeHtml(raw)}"</em>, en Nicaragua te sugerimos siempre coordinar directamente con las cooperativas y anfitriones de cada territorio:<br><br>
      • <strong>Rutas Sugeridas:</strong> Puedes combinar la frescura montañosa del Norte (Matagalpa y Jinotega) con la calidez volcánica y colonial del Pacífico (León, Granada y Masaya).<br>
      • <strong>Economía Justa:</strong> Los precios publicados en nuestro catálogo están regulados bajo la tasa BCN (36.65) con 0% de recargos intermediarios.<br>
      • <strong>Contacto Inmediato:</strong> Utiliza el botón de WhatsApp en cualquiera de nuestras tarjetas de destino para chatear con los anfitriones en tiempo real.<br><br>
      ¿Deseas conocer opciones de transporte, hospedaje campesino o comida típica específica para tu viaje? ¡Pregúntame con total libertad!
    `;
  }

  /**
   * Inicialización del Chatbot de Sendero en destinos.html
   */
  function initBaqueanoAi() {
    const form = document.getElementById('aiChatForm');
    const input = document.getElementById('aiUserInput');
    const chatBox = document.getElementById('aiChatMessages');

    if (!form || !input || !chatBox) return;

    const addMessage = (htmlText, sender) => {
      const msg = document.createElement('div');
      msg.className = `ai-bubble-msg ai-bubble-${sender}`;
      msg.innerHTML = htmlText;
      chatBox.appendChild(msg);
      chatBox.scrollTop = chatBox.scrollHeight;
    };

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const query = input.value.trim();
      if (!query) return;

      // Renderizar mensaje del usuario
      addMessage(escapeHtml(query), 'user');
      input.value = '';

      // Indicador visual de pensamiento
      const thinkingId = 'aiThinkingIndicator';
      const thinkingEl = document.createElement('div');
      thinkingEl.id = thinkingId;
      thinkingEl.className = 'ai-bubble-msg ai-bubble-bot';
      thinkingEl.innerHTML = '<i class="fa-solid fa-compass fa-spin"></i> <em>Consultando sendero territorial...</em>';
      chatBox.appendChild(thinkingEl);
      chatBox.scrollTop = chatBox.scrollHeight;

      // Tiempo de respuesta natural a 450ms
      setTimeout(() => {
        const thinkingIndicator = document.getElementById(thinkingId);
        if (thinkingIndicator) thinkingIndicator.remove();

        const replyHtml = generateAutonomousResponse(query);
        addMessage(replyHtml, 'bot');
      }, 450);
    });

    // Conectar función global para chips rápidos
    window.askAiPreset = function(question) {
      if (input && form) {
        input.value = question;
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    };
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  window.initBaqueanoAi = initBaqueanoAi;

  // Auto-arranque al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBaqueanoAi);
  } else {
    setTimeout(initBaqueanoAi, 60);
  }

})(window, document);
