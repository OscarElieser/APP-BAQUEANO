// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — OPS IA COPILOT & BAQUEANO COMMANDER (ops-ia-copilot.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Asistente del operador autenticado dentro del Ops Center: resume el estado
//   del ecosistema, propone una agenda priorizada y ejecuta comandos SEGUROS.
// - Auditoría 2026-10-05 (C2): la versión anterior mostraba datos inventados
//   (pulso 98 %, 1,248 consultas, 88 %/12 %, 42 ms, reserva #BQ-2026-1842 de un
//   anfitrión ficticio, "coordenadas actualizadas" sin hacer nada). Esta versión
//   conserva la misma API pública pero SOLO usa datos reales.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA):
// - Fuente única: window.BaqueanoOpsData (js/ops-center/ops-live-data.js), que
//   obtiene conteos y salud de servicios desde la Edge Function `baqueano-ops`.
// - Baqueano Pulse = % de comprobaciones de salud en estado OPERATIVO sobre las
//   que están configuradas. Sin comprobaciones → "Sin evaluar" (no un número).
// - Agenda: tareas derivadas de conteos reales (moderación, verificaciones,
//   reservas, destinos sin coordenadas, servicios con error, catálogos vacíos).
// - Commander: comandos de navegación y consulta. Nunca ejecuta operaciones
//   destructivas ni modifica datos; las acciones abren el módulo para que el
//   administrador decida. La IA no modifica datos turísticos oficiales.
//
// 📦 3. QUÉ (window.BaqueanoOpsIA, misma interfaz que antes):
// - init, getPulse, getExecutiveBriefing, getOperationalAgenda,
//   executeQuickAction, sendCommand, simulateAction, speakBriefing,
//   openCommanderModal, triggerPredefinedCommand, handleCommanderSubmit.
// ============================================================================

(function (window, document) {
  'use strict';

  // Nombre del operador: SIEMPRE el de la cuenta autenticada.
  function getOperatorName() {
    try {
      const fbUser = window.firebase && window.firebase.auth && window.firebase.auth().currentUser;
      const sessionUser = window.BaqueanoSession && window.BaqueanoSession.getUser && window.BaqueanoSession.getUser();
      const raw = (fbUser && (fbUser.displayName || fbUser.email)) || (sessionUser && sessionUser.isLoggedIn && (sessionUser.name || sessionUser.email)) || '';
      const first = String(raw).split('@')[0].trim().split(/\s+/)[0];
      return first || 'Administrador';
    } catch (_) {
      return 'Administrador';
    }
  }

  function escapeOps(value) {
    return String(value).replace(/[&<>'"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
  }

  function syncOperatorName() {
    const name = getOperatorName();
    document.querySelectorAll('[data-ops-operator]').forEach((node) => { node.textContent = name; });
    const commanderBtn = document.getElementById('btnOpsIaCommander');
    if (commanderBtn) commanderBtn.title = 'Baqueano Commander — Asistente de ' + name;
  }

  const OPS_STATE = {
    initialized: false,
    get adminName() { return getOperatorName(); },
    decisionLog: [],
    conversationHistory: []
  };

  // --------------------------------------------------------------------------
  // Datos reales
  // --------------------------------------------------------------------------
  function data() { return (window.BaqueanoOpsData && window.BaqueanoOpsData.state) || null; }
  function metric(key) {
    const d = data();
    const m = d && d.overview && d.overview.metrics && d.overview.metrics[key];
    return m && m.value != null ? m.value : null;
  }
  const fmt = (n) => (n == null ? 'sin dato' : new Intl.NumberFormat('es-NI').format(n));

  // --------------------------------------------------------------------------
  // 1. BAQUEANO PULSE (calculado de comprobaciones reales)
  // --------------------------------------------------------------------------
  function calculateBaqueanoPulse() {
    const d = data();
    const checks = d && d.health && Array.isArray(d.health.checks) ? d.health.checks : [];
    const evaluated = checks.filter((c) => c.state !== 'SIN_CONFIGURAR' && c.state !== 'DESCONOCIDO');
    if (!evaluated.length) {
      return { score: null, status: 'unknown', statusLabel: d && d.status === 'ERROR' ? 'Sin conexión con el servidor' : 'Sin evaluar todavía', color: '#94A3B8', basis: 'Sin comprobaciones de salud disponibles.' };
    }
    const ok = evaluated.filter((c) => c.state === 'OPERATIVO').length;
    const errors = evaluated.filter((c) => c.state === 'ERROR').length;
    const score = Math.round((ok / evaluated.length) * 100);
    const status = errors ? 'degraded' : (score === 100 ? 'optimal' : 'attention');
    return {
      score,
      status,
      statusLabel: status === 'optimal' ? 'Servicios comprobados operativos' : (status === 'attention' ? 'Atención requerida' : 'Hay servicios con error'),
      color: status === 'optimal' ? '#4A7A5A' : (status === 'attention' ? '#F59E0B' : '#EF4444'),
      basis: `${ok} de ${evaluated.length} comprobaciones reales en estado operativo${checks.length > evaluated.length ? ` (${checks.length - evaluated.length} sin configurar)` : ''}.`
    };
  }

  // --------------------------------------------------------------------------
  // 2. AGENDA OPERATIVA (solo con datos reales)
  // --------------------------------------------------------------------------
  function getOperationalAgenda() {
    const agenda = [];
    const d = data();
    if (!d || !d.overview) return agenda;
    const add = (item) => agenda.push(Object.assign({ actionType: 'open_tab' }, item));

    (d.health && d.health.checks || []).filter((c) => c.state === 'ERROR' || c.state === 'DEGRADADO').forEach((c) => add({
      id: `health-${c.id}`, category: 'Infraestructura', priority: c.state === 'ERROR' ? 'urgent' : 'warning',
      priorityBadge: c.state === 'ERROR' ? 'Error' : 'Degradado', title: c.label, summary: c.detail,
      actionLabel: 'Ver estado del sistema', payload: { tab: '33-estado' }
    }));
    const pendingStories = metric('testimonials_pending');
    if (pendingStories > 0) add({ id: 'mod-pending', category: 'Comunidad', priority: 'warning', priorityBadge: 'Moderación', title: `${fmt(pendingStories)} experiencias esperan revisión`, summary: 'Publicadas por viajeros; no aparecen en la web hasta aprobarse.', actionLabel: 'Abrir moderación', payload: { tab: '36-comunidad' } });
    const reports = metric('reports_open');
    if (reports > 0) add({ id: 'mod-reports', category: 'Comunidad', priority: 'urgent', priorityBadge: 'Denuncias', title: `${fmt(reports)} denuncias abiertas`, summary: 'Contenido denunciado por la comunidad.', actionLabel: 'Revisar denuncias', payload: { tab: '36-comunidad' } });
    const verif = metric('verification_pending');
    if (verif > 0) add({ id: 'verif', category: 'Negocios', priority: 'warning', priorityBadge: 'Verificación', title: `${fmt(verif)} solicitudes de verificación`, summary: 'Negocios que piden el sello "Verificado por BAQUEANO".', actionLabel: 'Abrir verificaciones', payload: { tab: '09-verificaciones' } });
    const resv = metric('reservations_pending');
    if (resv > 0) add({ id: 'resv', category: 'Operaciones', priority: 'urgent', priorityBadge: 'Reservas', title: `${fmt(resv)} reservas pendientes`, summary: 'Reservas sin confirmar.', actionLabel: 'Abrir reservas', payload: { tab: '11-reservas' } });
    const dest = metric('destinations');
    const withCoords = metric('destinations_with_coordinates');
    if (dest != null && withCoords != null && dest > withCoords) add({ id: 'coords', category: 'Calidad de datos', priority: 'warning', priorityBadge: 'Mapa', title: `${fmt(dest - withCoords)} destinos sin coordenadas`, summary: 'No aparecen en el mapa. Se corrigen a mano con una fuente verificable (no se inventan coordenadas).', actionLabel: 'Abrir destinos', payload: { tab: '03-destinos' } });
    if (metric('municipalities') === 0) add({ id: 'muni', category: 'Catálogo', priority: 'notice', priorityBadge: 'Catálogo vacío', title: 'Municipios sin cargar en Supabase', summary: 'La tabla municipalities está vacía; el filtrado territorial por municipio no tiene datos.', actionLabel: 'Abrir municipios', payload: { tab: '05-municipios' } });
    if (metric('ai_messages') === 0) add({ id: 'baqui', category: 'BAQUI', priority: 'notice', priorityBadge: 'Sin telemetría', title: 'BAQUI no registra interacciones', summary: 'No hay datos de uso, tokens ni latencia en ai_messages.', actionLabel: 'Abrir BAQUEANO AI', payload: { tab: '23-ai' } });
    return agenda;
  }

  // --------------------------------------------------------------------------
  // 3. BRIEFING
  // --------------------------------------------------------------------------
  function getExecutiveBriefing() {
    const pulse = calculateBaqueanoPulse();
    const hour = new Date().getHours();
    const saludo = hour >= 19 || hour < 5 ? 'Buenas noches' : (hour >= 12 ? 'Buenas tardes' : 'Buenos días');
    const agenda = getOperationalAgenda();
    const criticalCount = agenda.filter((i) => i.priority === 'urgent').length;
    const attentionCount = agenda.filter((i) => i.priority === 'warning').length;
    const d = data();
    let narrative = `${saludo}, ${OPS_STATE.adminName}. `;
    if (!d || !d.overview) {
      narrative += d && d.error ? `No pude leer los datos reales: ${d.error}` : 'Estoy esperando los datos reales de Supabase.';
    } else {
      narrative += pulse.score == null ? `Estado de servicios: **${pulse.statusLabel}**. ` : `Estado de servicios: **${pulse.score}%** — ${pulse.basis} `;
      narrative += `Catálogo real: **${fmt(metric('destinations'))} destinos** (${fmt(metric('destinations_published'))} publicados) y **${fmt(metric('businesses'))} negocios** (${fmt(metric('businesses_verified'))} verificados). `;
      narrative += agenda.length ? `Hay **${agenda.length} asuntos** en tu agenda.` : 'No hay asuntos pendientes detectados en los datos.';
    }
    return { greeting: saludo, admin: OPS_STATE.adminName, pulse, narrative, totalPending: agenda.length, criticalCount, attentionCount };
  }

  // --------------------------------------------------------------------------
  // 4. ACCIONES SEGURAS (navegación y refresco; nada destructivo)
  // --------------------------------------------------------------------------
  function openTab(tab, search) {
    const engine = window.BaqueanoOpsEngine;
    if (!engine || typeof engine.switchTab !== 'function') return false;
    engine.switchTab(tab);
    if (search && typeof engine.onSearchInput === 'function') engine.onSearchInput(tab, search);
    return true;
  }

  async function executeQuickAction(actionType, payload) {
    const p = payload || {};
    let resultMessage;
    switch (actionType) {
      case 'open_tab':
      case 'quick_mark_audit':
      case 'quick_geocode_fix':
        openTab(p.tab || (actionType === 'quick_geocode_fix' ? '03-destinos' : '27-auditoria'));
        resultMessage = actionType === 'quick_geocode_fix'
          ? 'Abrí Destinos. Las coordenadas se corrigen a mano con una fuente verificable: el asistente no las inventa.'
          : 'Módulo abierto.';
        break;
      case 'quick_sync_supabase':
        if (window.BaqueanoOpsData) await window.BaqueanoOpsData.refresh({ force: true, health: true });
        resultMessage = 'Datos y estado de servicios releídos desde el servidor.';
        break;
      case 'quick_whatsapp_reminder': {
        const phone = String(p.phone || '').replace(/[^0-9]/g, '');
        if (!phone) { resultMessage = 'No hay un teléfono real registrado para este recordatorio.'; break; }
        logDecision('WhatsApp', `Borrador abierto para ${phone}`);
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(p.draftText || '')}`, '_blank', 'noopener');
        resultMessage = 'Borrador de WhatsApp abierto; nada se envía sin tu confirmación.';
        break;
      }
      default:
        resultMessage = 'Acción no reconocida: no se ejecutó nada.';
    }
    logDecision('Acción', `${actionType}: ${resultMessage}`);
    if (window.BaqueanoOpsEngine && window.BaqueanoOpsEngine.toast) window.BaqueanoOpsEngine.toast(resultMessage, 'info');
    return { success: true, message: resultMessage, timestamp: new Date() };
  }

  // --------------------------------------------------------------------------
  // 5. BAQUEANO COMMANDER (comandos administrativos seguros)
  // --------------------------------------------------------------------------
  const MODULES = [
    [/reserv/, '11-reservas', 'Reservas'], [/negocio|aliado|emprend/, '08-negocios', 'Negocios'], [/destino/, '03-destinos', 'Destinos'],
    [/sos|emergenc/, '20-sos', 'Centro SOS'], [/auditor|bitacora|bitácora|log/, '27-auditoria', 'Auditoría'], [/moderac|testimon|comunidad|denuncia/, '36-comunidad', 'Comunidad'],
    [/verific/, '09-verificaciones', 'Verificaciones'], [/estado|salud|health|servicio/, '33-estado', 'Estado del sistema'], [/municip/, '05-municipios', 'Municipios'],
    [/territor|departament/, '04-territorios', 'Territorios'], [/mapa/, '07-mapa', 'Mapa'], [/tarifa|precio/, '34-tarifas', 'Tarifas'], [/backup|respaldo/, '35-backup', 'Backup']
  ];

  function processCommanderQuery(queryText) {
    if (!queryText || typeof queryText !== 'string') return '';
    const q = queryText.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
    OPS_STATE.conversationHistory.push({ sender: 'operator', text: queryText, date: new Date() });
    const d = data();
    let response;

    const search = q.match(/^(?:buscar|busca|encontrar)\s+(?:el\s+|la\s+)?(?:destino\s+)?(.{2,60})$/);
    if (search) {
      openTab('03-destinos', search[1]);
      response = `Abrí **Destinos** filtrando por "${escapeOps(search[1])}".`;
    } else if (/(abrir|abre|mostrar|muestra|ver|ir a)\b/.test(q) && MODULES.some(([re]) => re.test(q))) {
      const [, tab, label] = MODULES.find(([re]) => re.test(q));
      openTab(tab);
      response = `Abrí **${label}**.`;
      if (tab === '11-reservas') response += ` Pendientes según Supabase: **${fmt(metric('reservations_pending'))}**.`;
      if (tab === '08-negocios') response += ` Negocios: **${fmt(metric('businesses'))}** (${fmt(metric('businesses_verified'))} verificados).`;
    } else if (/como esta|estado general|pulso|pulse/.test(q)) {
      const b = getExecutiveBriefing();
      const checks = d && d.health ? d.health.checks.map((c) => `• **${c.label}:** ${c.state} — ${c.detail}`).join('\n') : 'Sin comprobaciones todavía.';
      response = `${b.narrative}\n\n${checks}`;
    } else if (/error|sincroniz|supabase|firebase|backup|respaldo/.test(q)) {
      const bad = d && d.health ? d.health.checks.filter((c) => c.state !== 'OPERATIVO') : [];
      response = `Espejo Firestore→Supabase: **${fmt(metric('firestore_mirror'))}** documentos replicados. ` +
        (bad.length ? `\nServicios que no están operativos:\n${bad.map((c) => `• **${c.label}:** ${c.state} — ${c.detail}`).join('\n')}` : '\nTodas las comprobaciones configuradas están operativas.');
    } else if (/hoy|resumen|actividad/.test(q)) {
      response = `**Resumen con datos reales:**\n` +
        `• Sesiones web registradas (24 h): ${fmt(metric('traffic_sessions_24h'))}\n` +
        `• Experiencias en moderación: ${fmt(metric('testimonials_pending'))} · publicadas: ${fmt(metric('testimonials_published'))}\n` +
        `• Reservas pendientes: ${fmt(metric('reservations_pending'))}\n` +
        `• Interacciones BAQUI registradas: ${fmt(metric('ai_messages'))}\n` +
        `• Eventos de auditoría: ${fmt(metric('audit_logs'))}`;
    } else if (/simul|impacto/.test(q)) {
      response = simulateAction(q);
    } else {
      response = 'Puedo: **"¿Cómo está BAQUEANO?"**, **"Mostrar errores de sincronización"**, **"Abrir reservas pendientes"**, **"Mostrar negocios pendientes"**, **"Ver alertas SOS"**, **"Buscar destino Ometepe"** o **"Resumen de hoy"**. No ejecuto cambios de datos: abro el módulo para que decidás.';
    }
    OPS_STATE.conversationHistory.push({ sender: 'ops_ia', text: response, date: new Date() });
    return response;
  }

  function simulateAction(actionKey) {
    const businesses = metric('businesses');
    if (String(actionKey || '').includes('tarif')) {
      return `🔬 **Análisis de impacto (datos reales):** hay **${fmt(businesses)} negocios** y **${fmt(metric('tourism_services'))} tarifas** registradas en Supabase. ` +
        'No hay datos suficientes para estimar efectos económicos; cualquier cambio requiere confirmación y queda en la auditoría.';
    }
    return '🔬 No tengo un modelo de simulación para esa acción. Revisá el módulo correspondiente antes de aplicar cambios.';
  }

  function logDecision(category, details) {
    OPS_STATE.decisionLog.unshift({ id: 'dec_' + Date.now(), timestamp: new Date().toISOString(), category, details, authorizedBy: OPS_STATE.adminName });
    if (OPS_STATE.decisionLog.length > 50) OPS_STATE.decisionLog.pop();
  }

  function speakBriefing() {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const clean = getExecutiveBriefing().narrative.replace(/\*\*/g, '').replace(/[#•]/g, '').replace(/\n+/g, '. ');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'es-NI';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  // --------------------------------------------------------------------------
  // 6. WIDGET DEL DASHBOARD (DOM seguro: textContent)
  // --------------------------------------------------------------------------
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
  function richText(target, text) {
    // **negrita** y saltos de línea, siempre como texto (sin HTML de datos).
    String(text).split('\n').forEach((line, i) => {
      if (i) target.append(document.createElement('br'));
      line.split(/(\*\*[^*]+\*\*)/).forEach((part) => {
        if (/^\*\*[^*]+\*\*$/.test(part)) target.append(el('strong', '', part.slice(2, -2)));
        else if (part) target.append(document.createTextNode(part));
      });
    });
  }

  function renderOpsIaDashboardWidget() {
    const container = document.getElementById('opsIaCommandCenterWidget');
    if (!container) return;
    const pulse = calculateBaqueanoPulse();
    const briefing = getExecutiveBriefing();
    const agenda = getOperationalAgenda();

    const card = el('div', 'ops-pulse-hero-card ops-ia-real');
    const head = el('div', 'ops-ia-head');
    const ring = el('div', 'ops-ia-ring');
    ring.style.borderColor = pulse.color;
    ring.append(el('span', 'ops-ia-ring-value', pulse.score == null ? '—' : `${pulse.score}%`), el('span', 'ops-ia-ring-label', 'Servicios'));
    ring.title = pulse.basis;
    const titles = el('div', 'ops-ia-titles');
    const h2 = el('h2', 'ops-ia-title');
    h2.append('Baqueano Ops IA · Asistente de ');
    const op = el('span', '', OPS_STATE.adminName);
    op.setAttribute('data-ops-operator', '');
    h2.append(op);
    titles.append(h2, el('p', 'ops-ia-sub', `${pulse.statusLabel} · Datos: Supabase (base principal) vía API administrativa`));
    const buttons = el('div', 'ops-ia-buttons');
    const voice = el('button', 'btn-ops-matte', 'Voz ejecutiva');
    voice.type = 'button';
    voice.addEventListener('click', speakBriefing);
    const commander = el('button', 'btn-ops-matte accent', 'Baqueano Commander');
    commander.type = 'button';
    commander.addEventListener('click', openCommanderModal);
    buttons.append(voice, commander);
    head.append(ring, titles, buttons);

    const brief = el('div', 'ops-ia-brief');
    brief.append(el('div', 'ops-ia-brief-label', 'Briefing con datos reales'));
    const body = el('div');
    richText(body, briefing.narrative);
    brief.append(body);

    const agendaBox = el('div', 'ops-ia-agenda');
    agendaBox.append(el('div', 'ops-ia-brief-label', `Agenda operativa (${agenda.length})`));
    if (!agenda.length) agendaBox.append(el('p', 'ops-ia-sub', briefing.pulse.score == null ? 'La agenda se arma cuando llegan los datos reales.' : 'Sin asuntos pendientes detectados en los datos.'));
    agenda.forEach((item) => {
      const row = el('div', `ops-ia-task is-${item.priority}`);
      const text = el('div', 'ops-ia-task-text');
      text.append(el('span', 'ops-ia-task-badge', item.priorityBadge), el('strong', '', item.title), el('small', '', item.summary));
      const action = el('button', 'btn-ops-matte primary', item.actionLabel);
      action.type = 'button';
      action.addEventListener('click', () => executeQuickAction(item.actionType, item.payload));
      row.append(text, action);
      agendaBox.append(row);
    });
    card.append(head, brief, agendaBox);
    container.replaceChildren(card);
  }

  // --------------------------------------------------------------------------
  // 7. MODAL DEL COMMANDER
  // --------------------------------------------------------------------------
  function openCommanderModal() {
    let modal = document.getElementById('baqueanoCommanderModal');
    if (modal) { modal.style.display = 'flex'; document.getElementById('commanderInputText')?.focus(); return; }
    modal = el('div', 'ops-modal-overlay ops-commander-overlay');
    modal.id = 'baqueanoCommanderModal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'commanderTitle');
    const box = el('div', 'ops-commander-box');
    const header = el('div', 'ops-commander-header');
    const title = el('h3', '', 'Baqueano Commander');
    title.id = 'commanderTitle';
    const close = el('button', 'btn-ops-matte', '✕');
    close.type = 'button';
    close.setAttribute('aria-label', 'Cerrar Commander');
    close.addEventListener('click', () => { modal.style.display = 'none'; });
    header.append(title, close);
    const feed = el('div', 'ops-commander-feed');
    feed.id = 'commanderMessagesFeed';
    feed.setAttribute('aria-live', 'polite');
    const hello = el('div', 'ops-commander-msg is-ai');
    richText(hello, `Hola ${OPS_STATE.adminName}. Respondo con datos reales de Supabase y abro módulos; no modifico datos sin tu intervención.`);
    feed.append(hello);
    const chips = el('div', 'ops-commander-chips');
    ['¿Cómo está BAQUEANO?', 'Abrir reservas pendientes', 'Mostrar negocios pendientes', 'Ver alertas SOS', 'Buscar destino Ometepe', 'Mostrar errores de sincronización'].forEach((label) => {
      const chip = el('button', 'btn-ops-matte', label);
      chip.type = 'button';
      chip.addEventListener('click', () => triggerPredefinedCommand(label));
      chips.append(chip);
    });
    const form = el('form', 'ops-commander-form');
    form.id = 'commanderInputForm';
    const input = el('input');
    input.type = 'text';
    input.id = 'commanderInputText';
    input.placeholder = 'Escribí un comando…';
    input.setAttribute('aria-label', 'Comando para Baqueano Commander');
    input.maxLength = 200;
    const send = el('button', 'btn-ops-matte primary', 'Enviar');
    send.type = 'submit';
    form.append(input, send);
    form.addEventListener('submit', handleCommanderSubmit);
    box.append(header, feed, chips, form);
    modal.append(box);
    modal.addEventListener('keydown', (e) => { if (e.key === 'Escape') modal.style.display = 'none'; });
    document.body.append(modal);
    input.focus();
  }

  function handleCommanderSubmit(event) {
    if (event) event.preventDefault();
    const input = document.getElementById('commanderInputText');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    triggerPredefinedCommand(text);
  }

  function triggerPredefinedCommand(text) {
    let feed = document.getElementById('commanderMessagesFeed');
    if (!feed) { openCommanderModal(); feed = document.getElementById('commanderMessagesFeed'); }
    if (!feed) return;
    const mine = el('div', 'ops-commander-msg is-operator');
    mine.append(el('strong', '', `${OPS_STATE.adminName}: `), document.createTextNode(text));
    const answer = el('div', 'ops-commander-msg is-ai');
    richText(answer, processCommanderQuery(text));
    feed.append(mine, answer);
    feed.scrollTop = feed.scrollHeight;
  }

  // --------------------------------------------------------------------------
  // 8. INDICADOR DEL TOPBAR
  // --------------------------------------------------------------------------
  function renderPulseIndicatorInTopbar() {
    const topStatus = document.querySelector('.ops-status-indicator');
    if (!topStatus) return;
    const pulse = calculateBaqueanoPulse();
    const dot = el('span', 'ops-pulse-dot');
    dot.style.background = pulse.color;
    const label = el('button', 'ops-pulse-label', pulse.score == null ? 'Servicios: sin evaluar' : `Servicios ${pulse.score}%`);
    label.type = 'button';
    label.title = pulse.basis;
    label.addEventListener('click', () => openTab('33-estado'));
    topStatus.replaceChildren(dot, label);
  }

  function renderAll() {
    renderOpsIaDashboardWidget();
    renderPulseIndicatorInTopbar();
  }

  // --------------------------------------------------------------------------
  // 9. INICIALIZACIÓN (se actualiza cuando llegan datos reales; sin intervalos)
  // --------------------------------------------------------------------------
  function init() {
    if (OPS_STATE.initialized) return;
    OPS_STATE.initialized = true;
    renderAll();
    syncOperatorName();
    try {
      if (window.firebase && window.firebase.auth) window.firebase.auth().onAuthStateChanged(syncOperatorName);
    } catch (_) { /* sin Auth: queda "Administrador" */ }
    window.addEventListener('baqueano_session_updated', syncOperatorName);
    window.addEventListener('baqueano:ops-data', renderAll);
  }

  window.BaqueanoOpsIA = {
    init,
    getPulse: calculateBaqueanoPulse,
    getExecutiveBriefing,
    getOperationalAgenda,
    executeQuickAction,
    sendCommand: processCommanderQuery,
    simulateAction,
    speakBriefing,
    openCommanderModal,
    triggerPredefinedCommand,
    handleCommanderSubmit
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(window, document);
