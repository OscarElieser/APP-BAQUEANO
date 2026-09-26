// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — ASISTENTE IA TERRITORIAL DE DESTINOS
// ============================================================================
// 🎯 POR QUÉ: reemplazar respuestas precargadas y precios no verificables por
//    consultas reales al motor territorial con Search Grounding.
// ⚙️ CÓMO: todas las preguntas se envían a Supabase Edge; el navegador no
//    contiene secretos ni consulta directamente proveedores generativos.
// 📦 QUÉ: chat funcional, fuentes consultadas, estado real y errores transparentes.
// ============================================================================
(function (window, document) {
  'use strict';

  const EDGE_AI_URL = 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-ai';
  const SUPABASE_PUBLIC_KEY = 'sb_publishable_q7ZhqRIRjlerZK7WOu_Qxw_X_AqXV1d';

  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

  function safeSourceUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' ? url.href : '';
    } catch (_) { return ''; }
  }

  function renderGroundedAnswer(data) {
    const itinerary = data?.itinerary;
    if (!itinerary) return '<strong>No se recibió un resultado territorial válido.</strong> Agregá el destino, cantidad de días y viajeros para volver a consultar.';
    const days = Array.isArray(itinerary.days) ? itinerary.days.slice(0, 7).map((day) => {
      const stops = Array.isArray(day.stops) ? day.stops.map((stop) => `<li><strong>${escapeHtml(stop.name)}</strong>${stop.desc ? ` — ${escapeHtml(stop.desc)}` : ''}</li>`).join('') : '';
      return `<section class="ai-grounded-day"><strong>${escapeHtml(day.title || `Día ${day.dayNumber || ''}`)}</strong>${stops ? `<ul>${stops}</ul>` : ''}</section>`;
    }).join('') : '';
    const sources = Array.isArray(itinerary.sources) ? itinerary.sources.map((source) => {
      const href = safeSourceUrl(source?.url || source?.uri);
      return href ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.title || new URL(href).hostname)}</a>` : '';
    }).filter(Boolean).join(' · ') : '';
    const grounded = data.groundingStatus === 'grounded' || itinerary.informationMode === 'grounded-web';
    return `<strong>${escapeHtml(itinerary.title || 'Ruta territorial')}</strong>
      <p>${escapeHtml(itinerary.summary || '')}</p>${days}
      <p><small>${grounded ? '✓ Información fundamentada mediante búsqueda web' : 'ℹ Respuesta basada en el catálogo territorial publicado'}${sources ? ` · Fuentes: ${sources}` : ''}</small></p>`;
  }

  function initBaqueanoAi() {
    const form = document.getElementById('aiChatForm');
    const input = document.getElementById('aiUserInput');
    const chatBox = document.getElementById('aiChatMessages');
    if (!form || !input || !chatBox || form.dataset.edgeReady === 'true') return;
    form.dataset.edgeReady = 'true';

    const addMessage = (content, sender, isHtml = false) => {
      const message = document.createElement('div');
      message.className = `ai-bubble-msg ai-bubble-${sender}`;
      if (isHtml) message.innerHTML = content; else message.textContent = content;
      chatBox.appendChild(message);
      chatBox.scrollTop = chatBox.scrollHeight;
      return message;
    };

    const ask = async (question) => {
      const query = String(question || '').trim();
      if (!query || form.getAttribute('aria-busy') === 'true') return;
      addMessage(query, 'user');
      input.value = '';
      form.setAttribute('aria-busy', 'true');
      const thinking = addMessage('Consultando Supabase Edge y fuentes territoriales…', 'bot');
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 20000);
      try {
        const response = await fetch(EDGE_AI_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: SUPABASE_PUBLIC_KEY },
          signal: controller.signal,
          body: JSON.stringify({ message: query, prompt: query })
        });
        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.ok) throw new Error(`EDGE_${response.status}`);
        thinking.remove();
        addMessage(renderGroundedAnswer(data), 'bot', true);
      } catch (error) {
        thinking.textContent = error.name === 'AbortError'
          ? 'La consulta superó el tiempo de espera. No mostraremos información inventada; intentá nuevamente.'
          : 'El servicio territorial no respondió. No mostraremos una respuesta simulada ni precios sin verificar.';
      } finally {
        window.clearTimeout(timeout);
        form.setAttribute('aria-busy', 'false');
      }
    };

    form.addEventListener('submit', (event) => { event.preventDefault(); ask(input.value); });
    window.askAiPreset = ask;
  }

  window.initBaqueanoAi = initBaqueanoAi;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initBaqueanoAi, { once: true });
  else initBaqueanoAi();
})(window, document);
