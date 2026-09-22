// ============================================================================
// 🧭 BAQUEANO — CONSULTA DIGITAL FUNDAMENTADA
// ============================================================================
// 🎯 POR QUÉ: permitir preguntas libres sin limitar al visitante a accesos rápidos
// ni responder con precios, negocios o disponibilidad inventados.
// ⚙️ CÓMO: interpreta intenciones seguras, consulta catálogos públicos de
// Firestore y presenta resultados trazables; los costos se derivan al planificador.
// 📦 QUÉ: chat accesible, búsqueda documental, accesos contextuales y estados
// honestos cuando faltan datos o conectividad.
// ============================================================================

(function (window, document) {
  'use strict';

  const QUICK_ANSWERS = {
    green: '<strong>Decálogo Verde:</strong><br>1. Llevá recipientes reutilizables.<br>2. No extraigás flora, fauna ni piedras.<br>3. Usá senderos autorizados.<br>4. Respetá indicaciones de guías y comunidades.<br>5. Llevate todos tus residuos.',
    days: 'Podés indicar de 1 a 30 días en el Planificador. La ruta solo se construirá cuando existan servicios con precios y disponibilidad registrados.',
    budget: 'Escribí la cantidad exacta que querés gastar o abrí el Planificador. No usamos categorías de presupuesto ni precios creados automáticamente.',
    map: 'El mapa muestra únicamente puntos con coordenadas registradas. Puedo llevarte a esa sección ahora.'
  };
  const state = { open: false, busy: false };
  const $ = id => document.getElementById(id);

  function escapeHtml(value) {
    const span = document.createElement('span');
    span.textContent = String(value || '');
    return span.innerHTML;
  }

  function appendMessage(content, role = 'bot', isHtml = false) {
    const body = $('assistantMessagesBody');
    if (!body) return null;
    const message = document.createElement('div');
    message.className = `assistant-msg assistant-msg-${role}`;
    if (isHtml) message.innerHTML = `<p>${content}</p>`;
    else { const p = document.createElement('p'); p.textContent = content; message.appendChild(p); }
    body.appendChild(message);
    body.scrollTop = body.scrollHeight;
    return message;
  }

  function openPlanner(amount, currency) {
    const budget = $('rbBudget');
    const currencyInput = $('rbCurrency');
    if (budget && amount) budget.value = amount;
    if (currencyInput && currency) currencyInput.value = currency;
    $('routeBuilderSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function extractBudget(query) {
    const match = query.replaceAll(',', '').match(/(?:c\$|us\$|usd|nio|presupuesto)?\s*(\d+(?:\.\d{1,2})?)/i);
    if (!match) return null;
    return { amount: Number(match[1]), currency: /us\$|usd/i.test(query) ? 'USD' : 'NIO' };
  }

  async function searchCatalog(query) {
    if (!window.firebase?.firestore) throw new Error('El catálogo no está disponible en este momento.');
    const db = window.firebase.firestore();
    const [destinations, services] = await Promise.all([
      db.collection('destinations').limit(80).get(),
      db.collection('tourism_services').limit(120).get()
    ]);
    const terms = query.toLocaleLowerCase('es').split(/\s+/).filter(term => term.length > 2);
    const score = item => terms.reduce((total, term) => total + (item.searchText.includes(term) ? 1 : 0), 0);
    const destinationItems = destinations.docs.map(doc => {
      const data = doc.data();
      return { type: 'Destino', name: data.title || data.name, detail: [data.department, data.municipality, data.category].filter(Boolean).join(' · '), url: data.slug ? `destinos.html#${encodeURIComponent(data.slug)}` : 'destinos.html', searchText: JSON.stringify(data).toLocaleLowerCase('es') };
    });
    const serviceItems = services.docs.map(doc => {
      const data = doc.data();
      const usablePrice = Number(data.precio) > 0 && data.disponibilidad === true && ['verificado','publicado'].includes(data.estadoPrecio);
      return { type: 'Servicio', name: data.nombre, detail: `${data.negocioNombre || 'Proveedor registrado'} · ${usablePrice ? `${data.moneda === 'USD' ? 'US$' : 'C$'} ${Number(data.precio).toLocaleString('es-NI')}` : 'Consultar precio'}`, url: /^https:\/\//i.test(data.urlOficial || '') ? data.urlOficial : '', searchText: JSON.stringify(data).toLocaleLowerCase('es') };
    });
    return [...destinationItems, ...serviceItems].map(item => ({ ...item, score: score(item) })).filter(item => item.name && item.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);
  }

  function renderResults(results) {
    if (!results.length) return 'No encontré registros que coincidan con esa consulta. No voy a inventar una recomendación; probá indicando un departamento, actividad o tipo de servicio.';
    return `Encontré ${results.length} coincidencias en el catálogo:<span class="assistant-result-list">${results.map(item => `<span class="assistant-result-item"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.type)} · ${escapeHtml(item.detail)}</span>${item.url ? `<a href="${escapeHtml(item.url)}" ${item.url.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}>Abrir información</a>` : ''}</span>`).join('')}</span>`;
  }

  async function ask(rawQuery) {
    const query = String(rawQuery || '').trim();
    if (!query || state.busy) return;
    appendMessage(query, 'user');
    state.busy = true;
    $('assistantSendBtn').disabled = true;
    const pending = appendMessage('Consultando información registrada…', 'status');
    try {
      const lower = query.toLocaleLowerCase('es');
      const budget = extractBudget(query);
      if (budget && /presupuesto|gastar|ruta|viaje/.test(lower)) {
        pending.remove();
        appendMessage(`Puedo preparar el formulario con ${budget.currency === 'USD' ? 'US$' : 'C$'} ${budget.amount.toLocaleString('es-NI')}. Los precios finales saldrán exclusivamente de Firestore.<br><button class="assistant-inline-action" id="assistantOpenPlanner">Abrir planificador</button>`, 'bot', true);
        $('assistantOpenPlanner')?.addEventListener('click', () => { openPlanner(budget.amount, budget.currency); BaqueanoAssistant.close(); });
      } else if (/decálogo|norma|ambient|plástico|sendero/.test(lower)) {
        pending.remove(); appendMessage(QUICK_ANSWERS.green, 'bot', true);
      } else if (/mapa|ubicación|dónde/.test(lower)) {
        pending.remove(); appendMessage(`${QUICK_ANSWERS.map}<br><button class="assistant-inline-action" id="assistantOpenMap">Abrir mapa</button>`, 'bot', true);
        $('assistantOpenMap')?.addEventListener('click', () => { $('mapaVivo3DNicaragua')?.scrollIntoView({ behavior: 'smooth' }); BaqueanoAssistant.close(); });
      } else {
        const results = await searchCatalog(query);
        pending.remove(); appendMessage(renderResults(results), 'bot', true);
      }
    } catch (error) {
      pending.remove(); appendMessage(`${error.message} No se generó una respuesta ficticia.`, 'bot');
    } finally {
      state.busy = false; $('assistantSendBtn').disabled = false; $('assistantQueryInput')?.focus();
    }
  }

  const BaqueanoAssistant = {
    init() {
      $('assistantFabBtn')?.addEventListener('click', event => { event.stopPropagation(); this.toggle(); });
      $('btnCloseAssistant')?.addEventListener('click', event => { event.stopPropagation(); this.close(); });
      $('assistantQueryForm')?.addEventListener('submit', event => { event.preventDefault(); const input = $('assistantQueryInput'); const value = input.value; input.value = ''; ask(value); });
      $('assistantQueryInput')?.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); $('assistantQueryForm')?.requestSubmit(); } });
      document.querySelectorAll('#assistantQuickPrompts .prompt-chip').forEach(chip => chip.addEventListener('click', event => { event.stopPropagation(); const action = chip.dataset.action; if (action === 'map') ask(chip.dataset.question); else if (action === 'budget') { appendMessage(chip.dataset.question, 'user'); appendMessage(`${QUICK_ANSWERS.budget}<br><button class="assistant-inline-action" id="assistantOpenPlanner">Abrir planificador</button>`, 'bot', true); $('assistantOpenPlanner')?.addEventListener('click', () => { openPlanner(); this.close(); }); } else if (action === 'days' || action === 'green') { appendMessage(chip.dataset.question, 'user'); appendMessage(QUICK_ANSWERS[action], 'bot', true); } else ask(chip.dataset.question); }));
      document.addEventListener('click', event => { const widget = $('baqueanoAssistantBox'); if (state.open && widget && !widget.contains(event.target)) this.close(); });
    },
    toggle() { state.open ? this.close() : this.open(); },
    open() { state.open = true; $('assistantChatDrawer')?.classList.add('is-open'); $('assistantChatDrawer')?.setAttribute('aria-hidden','false'); setTimeout(() => $('assistantQueryInput')?.focus(), 80); },
    close() { state.open = false; $('assistantChatDrawer')?.classList.remove('is-open'); $('assistantChatDrawer')?.setAttribute('aria-hidden','true'); },
    ask
  };

  window.BaqueanoAssistant = BaqueanoAssistant;
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', () => BaqueanoAssistant.init()) : BaqueanoAssistant.init();
})(window, document);
