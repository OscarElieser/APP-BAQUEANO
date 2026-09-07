// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — ASISTENTE IA PARA TURISMO RESPONSABLE (ai-assistant.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Asistir a exploradores con respuestas inmediatas sobre normativas ambientales,
//   equipamiento requerido para senderos volcánicos, acceso a reservas naturales
//   y respeto cultural comunitario.
// - Reducir la huella ecológica y prevenir accidentes por falta de preparación técnica.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Motor de concordancia semántica de palabras clave con respuestas curadas.
// - Interfaz de chat interactiva con burbujas animadas y scroll automático.
// - Chips con preguntas frecuentes predefinidas a 1 toque.
//
// 📦 3. QUÉ (WHAT / FUNCIONES EXPUESTAS):
// - initBaqueanoAi(): Controla el envío de preguntas y renderizado de respuestas.
// - askAiPreset(question): Inyecta y ejecuta una consulta predefinida desde los chips.
// ============================================================================

function initBaqueanoAi() {
  const form = document.getElementById('aiChatForm');
  const input = document.getElementById('aiUserInput');
  const chatBox = document.getElementById('aiChatMessages');

  if (!form || !input || !chatBox) return;

  const responses = {
    "calzado": "Para el Cañón de Somoto es indispensable calzado acuático o botas deportivas con buen agarre (que se puedan mojar sin resbalar en rocas pulidas). Nunca sandalias abiertas o chancletas.",
    "cerro negro": "El Volcán Cerro Negro requiere nivel físico medio-alto debido a la subida de 45-60 min por arena basáltica bajo el sol. Es crucial llevar 1.5L de agua, gafas contra el viento y pañuelo para el polvo.",
    "la luna": "Cascada La Luna se ubica en El Cuá, Jinotega (a ~45 min de Jinotega ciudad). El acceso se realiza por cafetales de sombra y nebliselva norteña. Es ideal contratar baqueano local para canopy seguro.",
    "bloqueador": "Los químicos de protectores solares alteran el pH de las aguas minerales y dañan la fauna acuática (peces nativos y larvas de anfibios). En aguas de Somoto y Apoyo usa camisetas manga larga con filtro UV.",
    "default": "En Baqueano priorizamos el turismo de huella cero. Recuerda no dejar residuos plásticos, respetar las propiedades comunitarias y apoyar la economía de los baqueanos locales sin intermediarios."
  };

  const addMessage = (text, sender) => {
    const msg = document.createElement('div');
    msg.className = `ai-bubble-msg ai-bubble-${sender}`;
    msg.textContent = text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    addMessage(query, 'user');
    input.value = '';

    setTimeout(() => {
      const lower = query.toLowerCase();
      let reply = responses.default;
      if (lower.includes("calzado") || lower.includes("ropa") || lower.includes("somoto")) reply = responses.calzado;
      else if (lower.includes("cerro") || lower.includes("fisico") || lower.includes("subir")) reply = responses["cerro negro"];
      else if (lower.includes("luna") || lower.includes("jinotega") || lower.includes("cascada")) reply = responses["la luna"];
      else if (lower.includes("bloqueador") || lower.includes("quimico") || lower.includes("agua")) reply = responses.bloqueador;

      addMessage(reply, 'bot');
    }, 500);
  });

  window.askAiPreset = question => {
    input.value = question;
    form.dispatchEvent(new Event('submit'));
  };
}
