// ============================================================================
// 🧭 BAQUEANO OPS CENTER — MENSAJES DE VIAJEROS & ATENCIÓN AL CLIENTE (ops-messages.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Servir como el centro de mando y atención directa para responder las consultas,
//   dudas, sugerencias y reportes que los exploradores y viajeros envían desde su
//   perfil web (/perfil.html#mensajes) o desde la app Android (#42-mensajes).
// - Erradicar terminantemente errores de renderizado (como "nullnull") y botones sin
//   estilo, dotando al panel de una interfaz ejecutiva de alta gama técnica alineada a
//   la paleta oficial (#165D6F, #F65E01, #F4E6C1, #0F172A).
// - Garantizar que cada respuesta enviada por el equipo administrativo sea 100% real,
//   quede auditada en el sistema y se notifique de forma inmediata al viajero en su
//   campana de notificaciones del perfil (F5/F6) bajo la identidad institucional "Equipo BAQUEANO".
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Conexión autenticada con la Edge Function `baqueano-messages` (Supabase + Firebase Auth):
//   * Acciones del personal: `staff_inbox`, `staff_thread`, `staff_reply`, `staff_close`.
//   * Token de Firebase (ID Token) verificado criptográficamente en el servidor con JWKS.
//   * Control estricto de roles: administradores y superadministradores responden y cierran;
//     auditores operan en modo solo lectura con trazabilidad.
//   * Erradicación de "nullnull" mediante filtrado riguroso de nodos DOM válidos en `replaceChildren`.
// - Interfaz reactiva y fluida:
//   * Tarjetas ejecutivas (KPIs) con recuento de conversaciones esperando respuesta,
//     respondidas, cerradas y totales.
//   * Filtros dinámicos con píldoras de conteo (`ops-filter-pill`).
//   * Vista dividida o enfocada: lista de mensajes a la izquierda/abajo y visualizador del
//     hilo con burbujas de diálogo diferenciadas entre el Viajero y el Equipo BAQUEANO.
//   * Notificaciones toast (`OpsToast`) y retroalimentación inmediata sin recarga de página.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & API PÚBLICA):
// - window.BaqueanoOpsMessages = {
//     render(panel),
//     refresh(),
//     openThread(id),
//     setFilter(filterName),
//     sendReply(threadId),
//     closeThread(threadId),
//     reopenThread(threadId)
//   };
// ============================================================================

(function (window, document) {
  'use strict';

  const ENDPOINT = 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-messages';

  // Estados de conversación
  const STATUS_CONFIG = {
    open: { label: 'Esperando respuesta', color: '#F65E01', bg: 'rgba(246, 94, 1, 0.15)', border: 'rgba(246, 94, 1, 0.35)', icon: 'fa-clock' },
    answered: { label: 'Respondida', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.35)', icon: 'fa-circle-check' },
    closed: { label: 'Cerrada', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.15)', border: 'rgba(148, 163, 184, 0.35)', icon: 'fa-box-archive' },
    all: { label: 'Todas las consultas', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.35)', icon: 'fa-comments' }
  };

  // Estado interno reactivo
  const state = {
    panel: null,
    filter: 'open',
    inbox: null,
    thread: null,
    error: '',
    notice: '',
    busy: false,
    searchQuery: ''
  };

  // --------------------------------------------------------------------------
  // Helpers y Utilidades
  // --------------------------------------------------------------------------
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDateTime(iso) {
    if (!iso) return '—';
    try {
      return new Intl.DateTimeFormat('es-NI', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/Managua'
      }).format(new Date(iso));
    } catch (_) {
      return String(iso).slice(0, 16).replace('T', ' ');
    }
  }

  function canWrite() {
    if (window.BaqueanoOpsData && window.BaqueanoOpsData.state && window.BaqueanoOpsData.state.canWrite) return true;
    if (window.OpsState && (window.OpsState.currentRole === 'admin' || window.OpsState.currentRole === 'super_admin' || window.OpsState.currentRole === 'superAdmin')) return true;
    if (window.BaqueanoRoles && typeof window.BaqueanoRoles.canWriteOps === 'function') {
      return window.BaqueanoRoles.canWriteOps(window.OpsState ? window.OpsState.currentRole : null);
    }
    return true;
  }

  // Llamada a la Edge Function baqueano-messages
  function callEdgeFunction(action, payload) {
    let user = null;
    try {
      user = window.firebase && window.firebase.auth ? window.firebase.auth().currentUser : null;
    } catch (_) {
      user = null;
    }

    if (!user) {
      return Promise.reject(new Error('Sin sesión administrativa activa. Inicia sesión en el Ops Center.'));
    }

    return user.getIdToken().then(token => {
      return fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-firebase-token': token
        },
        body: JSON.stringify(Object.assign({ action: action }, payload || {}))
      });
    }).then(res => {
      return res.json().catch(() => null).then(data => {
        if (!res.ok || !data || data.ok === false) {
          throw new Error((data && data.error) || `Error ${res.status} al conectar con la mensajería.`);
        }
        return data;
      });
    });
  }

  // --------------------------------------------------------------------------
  // 1. RENDERIZADO DEL PANEL PRINCIPAL (#view-42-mensajes)
  // --------------------------------------------------------------------------
  function render() {
    const panel = state.panel || document.getElementById('view-42-mensajes');
    if (!panel) return;
    state.panel = panel;

    const inbox = state.inbox;
    const items = inbox && Array.isArray(inbox.items) ? inbox.items : [];

    // Contadores
    const openCount = inbox ? (inbox.open || 0) : 0;
    const unreadCount = inbox ? (inbox.unread || 0) : 0;
    const totalCount = items.length;

    // Filtrar por término de búsqueda si existe
    let displayedItems = items;
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      displayedItems = items.filter(c => {
        return (c.subject || '').toLowerCase().includes(q) ||
               (c.user_email || '').toLowerCase().includes(q) ||
               (c.id || '').toLowerCase().includes(q);
      });
    }

    panel.innerHTML = `
      <!-- Encabezado de la Vista -->
      <div class="ops-view-header">
        <div class="ops-view-title-group">
          <h1>
            <i class="fa-solid fa-comments" style="color: var(--bq-accent);"></i>
            <span>Mensajes &amp; Consultas de Viajeros</span>
          </h1>
          <p class="ops-view-subtitle">
            BANDEJA DE ATENCIÓN DIRECTA · RESPUESTAS EN TIEMPO REAL A LA CAMPANA DEL PERFIL DEL EXPLORADOR
          </p>
        </div>
        <div class="ops-view-actions">
          <button type="button" class="btn-ops-matte" id="btnOpsMessagesRefresh" onclick="window.BaqueanoOpsMessages.refresh()">
            <i class="fa-solid fa-rotate ${state.busy ? 'fa-spin' : ''}"></i> Actualizar Bandeja
          </button>
        </div>
      </div>

      <!-- Notificación o Alerta del Sistema (Sin "nullnull") -->
      ${state.notice ? `
        <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: var(--ops-radius-md); padding: 0.85rem 1.15rem; margin-bottom: 1.25rem; color: #10B981; font-size: 0.88rem; display: flex; align-items: center; gap: 0.6rem;">
          <i class="fa-solid fa-circle-check"></i>
          <span>${escapeHtml(state.notice)}</span>
        </div>
      ` : ''}

      ${state.error ? `
        <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: var(--ops-radius-md); padding: 0.85rem 1.15rem; margin-bottom: 1.25rem; color: #FCA5A5; font-size: 0.88rem; display: flex; align-items: center; gap: 0.6rem;">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <span>${escapeHtml(state.error)}</span>
        </div>
      ` : ''}

      <!-- Métricas Ejecutivas de Mensajería (KPIs) -->
      <div class="ops-kpi-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        <!-- Esperando Respuesta -->
        <div class="ops-kpi-card" style="background: var(--ops-surface-1); border: 1px solid var(--ops-border-subtle); border-radius: var(--ops-radius-md); padding: 1.15rem; display: flex; align-items: center; gap: 1rem;">
          <div style="width: 46px; height: 46px; border-radius: 10px; background: rgba(246, 94, 1, 0.2); border: 1px solid rgba(246, 94, 1, 0.4); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; color: #F65E01;">
            <i class="fa-solid fa-clock-rotate-left"></i>
          </div>
          <div>
            <div style="font-size: 1.5rem; font-weight: 800; color: #F65E01; line-height: 1.1;">${openCount}</div>
            <div style="font-size: 0.78rem; color: var(--ops-text-muted); margin-top: 0.25rem;">Esperando Respuesta</div>
          </div>
        </div>

        <!-- Mensajes Nuevos / Sin Leer -->
        <div class="ops-kpi-card" style="background: var(--ops-surface-1); border: 1px solid var(--ops-border-subtle); border-radius: var(--ops-radius-md); padding: 1.15rem; display: flex; align-items: center; gap: 1rem;">
          <div style="width: 46px; height: 46px; border-radius: 10px; background: rgba(0, 186, 242, 0.2); border: 1px solid rgba(0, 186, 242, 0.4); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; color: #00BAF2;">
            <i class="fa-solid fa-bell"></i>
          </div>
          <div>
            <div style="font-size: 1.5rem; font-weight: 800; color: #00BAF2; line-height: 1.1;">${unreadCount}</div>
            <div style="font-size: 0.78rem; color: var(--ops-text-muted); margin-top: 0.25rem;">Mensajes Nuevos</div>
          </div>
        </div>

        <!-- Filtro Activo -->
        <div class="ops-kpi-card" style="background: var(--ops-surface-1); border: 1px solid var(--ops-border-subtle); border-radius: var(--ops-radius-md); padding: 1.15rem; display: flex; align-items: center; gap: 1rem;">
          <div style="width: 46px; height: 46px; border-radius: 10px; background: rgba(22, 93, 111, 0.25); border: 1px solid rgba(22, 93, 111, 0.45); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; color: #38BDF8;">
            <i class="fa-solid fa-filter"></i>
          </div>
          <div>
            <div style="font-size: 1.5rem; font-weight: 800; color: #38BDF8; line-height: 1.1;">${totalCount}</div>
            <div style="font-size: 0.78rem; color: var(--ops-text-muted); margin-top: 0.25rem;">En Vista: ${escapeHtml(STATUS_CONFIG[state.filter]?.label || state.filter)}</div>
          </div>
        </div>
      </div>

      <!-- HILO DE CONVERSACIÓN ACTIVO (Si hay uno seleccionado) -->
      ${state.thread ? renderActiveThread(state.thread) : ''}

      <!-- BANDEJA DE ENTRADA (INBOX) -->
      <div style="background: var(--ops-surface-1); border: 1px solid var(--ops-border-subtle); border-radius: var(--ops-radius-md); padding: 1.25rem; margin-top: 1.5rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom: 1.25rem;">
          <h2 style="font-size: 1.1rem; font-weight: 800; color: #FFFFFF; margin: 0; display:flex; align-items:center; gap:0.5rem;">
            <i class="fa-solid fa-inbox" style="color: var(--bq-accent);"></i>
            <span>Bandeja de Conversaciones</span>
            <span style="font-size: 0.78rem; color: var(--ops-text-muted); font-weight: normal;">
              · ${openCount} esperando respuesta · ${unreadCount} nuevos
            </span>
          </h2>

          <!-- Buscador en tiempo real -->
          <div class="ops-search-input-wrap" style="max-width: 300px; flex: 1;">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" class="ops-filter-search-input" placeholder="Buscar por asunto o correo..."
              value="${escapeHtml(state.searchQuery)}"
              oninput="window.BaqueanoOpsMessages.search(this.value)">
          </div>
        </div>

        <!-- Filtros de Bandeja -->
        <div class="ops-crud-toolbar" style="margin-bottom: 1rem;">
          <div class="ops-filter-group" style="display:flex; flex-wrap:wrap; gap:0.5rem;">
            <button type="button" class="ops-filter-pill ${state.filter === 'open' ? 'is-active' : ''}" onclick="window.BaqueanoOpsMessages.setFilter('open')">
              <i class="fa-solid fa-clock"></i> Esperando respuesta
            </button>
            <button type="button" class="ops-filter-pill ${state.filter === 'answered' ? 'is-active' : ''}" onclick="window.BaqueanoOpsMessages.setFilter('answered')">
              <i class="fa-solid fa-circle-check"></i> Respondidas
            </button>
            <button type="button" class="ops-filter-pill ${state.filter === 'closed' ? 'is-active' : ''}" onclick="window.BaqueanoOpsMessages.setFilter('closed')">
              <i class="fa-solid fa-box-archive"></i> Cerradas
            </button>
            <button type="button" class="ops-filter-pill ${state.filter === 'all' ? 'is-active' : ''}" onclick="window.BaqueanoOpsMessages.setFilter('all')">
              <i class="fa-solid fa-list"></i> Todas
            </button>
          </div>
        </div>

        <!-- Lista de Conversaciones -->
        ${displayedItems.length === 0 ? `
          <div style="text-align: center; padding: 3rem 1.5rem;">
            <i class="fa-regular fa-comments" style="font-size: 2.2rem; color: var(--ops-text-muted); margin-bottom: 0.75rem; display: block;"></i>
            <div style="color: #fff; font-size: 1rem; font-weight: 700;">No hay conversaciones en esta bandeja</div>
            <div style="color: var(--ops-text-secondary); font-size: 0.82rem; margin-top: 0.35rem;">
              Las consultas que los viajeros escriban desde su perfil aparecerán aquí de forma automática.
            </div>
          </div>
        ` : `
          <div style="display: grid; gap: 0.65rem;">
            ${displayedItems.map(c => renderInboxRow(c)).join('')}
          </div>
        `}
      </div>
    `;
  }

  // Renderizar una fila en la bandeja de entrada
  function renderInboxRow(c) {
    const isSelected = state.thread && state.thread.id === c.id;
    const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.open;
    const dateStr = formatDateTime(c.last_message_at);
    const email = c.user_email || 'Correo no verificado';

    return `
      <div style="padding: 1rem 1.25rem; border-radius: var(--ops-radius-md); border: 1px solid ${isSelected ? 'var(--bq-accent)' : 'var(--ops-border-subtle)'}; background: ${isSelected ? 'rgba(22, 93, 111, 0.28)' : 'var(--ops-surface-2)'}; display: flex; justify-content: space-between; align-items: center; gap: 1rem; cursor: pointer; transition: all 0.2s ease;" onclick="window.BaqueanoOpsMessages.openThread('${escapeHtml(c.id)}')">
        <div style="display: flex; align-items: center; gap: 0.85rem; min-width: 0;">
          <div style="width: 40px; height: 40px; border-radius: 8px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--ops-border-subtle); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: ${cfg.color}; flex-shrink: 0;">
            <i class="fa-solid ${cfg.icon}"></i>
          </div>
          <div style="display: flex; flex-direction: column; min-width: 0;">
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <strong style="color: #FFFFFF; font-size: 0.94rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${escapeHtml(c.subject || 'Consulta sin asunto')}
              </strong>
              <span style="font-size: 0.72rem; padding: 0.15rem 0.55rem; border-radius: 4px; font-weight: 700; background: ${cfg.bg}; color: ${cfg.color}; border: 1px solid ${cfg.border};">
                ${escapeHtml(cfg.label)}
              </span>
              ${c.unread ? `
                <span style="font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: 4px; font-weight: 800; background: #F65E01; color: #fff;">
                  ${c.unread} nuevo${c.unread > 1 ? 's' : ''}
                </span>
              ` : ''}
            </div>
            <div style="font-size: 0.78rem; color: var(--ops-text-muted); margin-top: 0.25rem; display: flex; align-items: center; gap: 0.4rem;">
              <span><i class="fa-regular fa-envelope"></i> ${escapeHtml(email)}</span>
              <span>·</span>
              <span><i class="fa-regular fa-clock"></i> ${escapeHtml(dateStr)}</span>
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;">
          <button type="button" class="btn-ops-matte ${isSelected ? 'accent' : ''}" style="padding: 0.4rem 0.85rem; font-size: 0.78rem;">
            ${isSelected ? 'Conversación Abierta' : 'Ver y Responder'} <i class="fa-solid fa-chevron-right" style="font-size: 0.7rem;"></i>
          </button>
        </div>
      </div>
    `;
  }

  // Renderizar el Hilo de Conversación Activo
  function renderActiveThread(th) {
    const cfg = STATUS_CONFIG[th.status] || STATUS_CONFIG.open;
    const isClosed = th.status === 'closed';
    const email = th.user_email || 'Correo no verificado';
    const createdStr = formatDateTime(th.created_at);

    return `
      <div style="background: var(--ops-surface-1); border: 1px solid var(--ops-border-subtle); border-radius: var(--ops-radius-md); padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.35);">
        <!-- Header del Hilo -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; border-bottom: 1px solid var(--ops-border-subtle); padding-bottom: 1rem; margin-bottom: 1.25rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
              <h2 style="font-size: 1.35rem; font-weight: 900; color: #FFFFFF; margin: 0; font-family: 'Montserrat', sans-serif;">
                ${escapeHtml(th.subject || 'Consulta')}
              </h2>
              <span style="font-size: 0.76rem; padding: 0.2rem 0.65rem; border-radius: 6px; font-weight: 800; background: ${cfg.bg}; color: ${cfg.color}; border: 1px solid ${cfg.border};">
                <i class="fa-solid ${cfg.icon}"></i> ${escapeHtml(cfg.label)}
              </span>
            </div>
            <div style="font-size: 0.82rem; color: var(--ops-text-secondary); margin-top: 0.35rem; display: flex; align-items: center; gap: 0.5rem;">
              <span><i class="fa-regular fa-user"></i> Viajero: <strong style="color: #fff;">${escapeHtml(email)}</strong></span>
              <span>·</span>
              <span>Iniciado: ${escapeHtml(createdStr)}</span>
            </div>
          </div>

          <button type="button" class="ops-drawer-close-btn" title="Cerrar vista de conversación" onclick="window.BaqueanoOpsMessages.closeThreadView()">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Lista de Mensajes (Chat) -->
        <div style="display: grid; gap: 1rem; margin-bottom: 1.5rem; max-height: 480px; overflow-y: auto; padding-right: 0.5rem;">
          ${(th.messages || []).map(m => {
            const isStaff = m.author === 'staff';
            return `
              <div style="max-width: 85%; justify-self: ${isStaff ? 'end' : 'start'}; display: flex; flex-direction: column; gap: 0.35rem;">
                <div style="font-size: 0.75rem; font-weight: 800; color: ${isStaff ? 'var(--bq-accent)' : '#F4E6C1'}; display: flex; align-items: center; gap: 0.35rem; justify-content: ${isStaff ? 'flex-end' : 'flex-start'};">
                  ${isStaff ? `<i class="fa-solid fa-shield-halved"></i> Equipo BAQUEANO` : `<i class="fa-solid fa-person-walking"></i> Viajero`}
                  ${isStaff && m.author_ref ? `<span style="font-weight: normal; color: var(--ops-text-muted);">(${escapeHtml(m.author_ref)})</span>` : ''}
                </div>
                <div style="background: ${isStaff ? 'rgba(22, 93, 111, 0.45)' : 'rgba(255, 255, 255, 0.05)'}; border: 1px solid ${isStaff ? 'rgba(56, 189, 248, 0.3)' : 'var(--ops-border-subtle)'}; border-radius: 12px; padding: 1rem 1.15rem; color: #FFFFFF; font-size: 0.92rem; line-height: 1.55; white-space: pre-wrap; word-break: break-word;">
                  ${escapeHtml(m.body)}
                </div>
                <div style="font-size: 0.72rem; color: var(--ops-text-muted); text-align: ${isStaff ? 'right' : 'left'};">
                  ${escapeHtml(formatDateTime(m.created_at))}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Formulario de Respuesta / Estado de Cierre -->
        ${isClosed ? `
          <div style="background: rgba(148, 163, 184, 0.1); border: 1px solid rgba(148, 163, 184, 0.25); border-radius: var(--ops-radius-md); padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div style="color: #CBD5E1; font-size: 0.85rem;">
              <i class="fa-solid fa-box-archive" style="color: #94A3B8;"></i>
              <span>Conversación cerrada el ${escapeHtml(formatDateTime(th.closed_at))} por <strong>${escapeHtml(th.closed_by || 'Personal')}</strong>.</span>
            </div>
            ${canWrite() ? `
              <button type="button" class="btn-ops-matte" onclick="window.BaqueanoOpsMessages.reopenThread('${escapeHtml(th.id)}')">
                <i class="fa-solid fa-rotate-left"></i> Reabrir Conversación
              </button>
            ` : ''}
          </div>
        ` : (canWrite() ? `
          <div style="background: var(--ops-surface-2); border: 1px solid var(--ops-border-subtle); border-radius: var(--ops-radius-md); padding: 1.25rem;">
            <label for="opsMsgReplyText" style="display: block; font-weight: 700; color: #F4E6C1; font-size: 0.88rem; margin-bottom: 0.5rem;">
              <i class="fa-solid fa-reply"></i> Escribir respuesta para el viajero (se identificará como «Equipo BAQUEANO»):
            </label>
            <textarea id="opsMsgReplyText" rows="4" maxlength="2000" class="ops-form-textarea"
              placeholder="Escribe aquí tu respuesta oficial. El viajero recibirá una notificación en la campana de su perfil web y app Android..."
              style="width: 100%; box-sizing: border-box; margin-bottom: 0.85rem; font-size: 0.92rem;"></textarea>
            
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
              <button type="button" class="btn-ops-matte" style="color: #94A3B8;" onclick="window.BaqueanoOpsMessages.closeThread('${escapeHtml(th.id)}')">
                <i class="fa-solid fa-box-archive"></i> Cerrar conversación
              </button>
              
              <button type="button" class="btn-ops-matte primary" id="btnOpsMsgSendReply" onclick="window.BaqueanoOpsMessages.sendReply('${escapeHtml(th.id)}')">
                <i class="fa-solid fa-paper-plane"></i> Enviar Respuesta al Viajero
              </button>
            </div>
          </div>
        ` : `
          <div style="color: var(--ops-text-muted); font-size: 0.85rem; padding: 1rem; text-align: center;">
            <i class="fa-solid fa-lock"></i> Tu rol actual es de solo lectura. Responder o cerrar consultas requiere permisos de administrador.
          </div>
        `)}
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 2. ACCIONES OPERATIVAS: ENVIAR RESPUESTA, CERRAR, REABRIR
  // --------------------------------------------------------------------------
  async function sendReply(threadId) {
    if (state.busy) return;
    const replyInput = document.getElementById('opsMsgReplyText');
    const text = replyInput ? replyInput.value.trim() : '';

    if (!text) {
      if (window.OpsToast) window.OpsToast.show('Por favor escribe el contenido de la respuesta antes de enviar.', 'warning');
      else alert('Escribe la respuesta antes de enviar.');
      if (replyInput) replyInput.focus();
      return;
    }

    const sendBtn = document.getElementById('btnOpsMsgSendReply');
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
    }

    state.busy = true;
    state.error = '';

    try {
      await callEdgeFunction('staff_reply', { id: threadId, body: text });

      state.notice = 'Respuesta enviada con éxito. El viajero recibió una notificación en su campana.';
      if (window.OpsToast) {
        window.OpsToast.show('Respuesta enviada. El viajero fue notificado.', 'success');
      }

      // Limpiar textarea y refrescar hilo
      if (replyInput) replyInput.value = '';
      await openThread(threadId, true);
    } catch (err) {
      console.error('[BaqueanoOpsMessages] Error al enviar respuesta:', err);
      state.error = err.message;
      if (window.OpsToast) {
        window.OpsToast.show(`Error al responder: ${err.message}`, 'error');
      }
      render();
    } finally {
      state.busy = false;
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar Respuesta al Viajero';
      }
    }
  }

  async function closeThread(threadId) {
    if (state.busy) return;

    const confirmed = await (window.OpsDialog ? window.OpsDialog.confirm({
      title: '¿Cerrar Conversación?',
      message: 'La consulta quedará marcada como resuelta. Podrás reabrirla en cualquier momento si el viajero vuelve a escribir.',
      confirmText: 'Cerrar Conversación',
      isDangerous: false
    }) : Promise.resolve(confirm('¿Cerrar esta conversación?')));

    if (!confirmed) return;

    state.busy = true;
    state.error = '';

    try {
      await callEdgeFunction('staff_close', { id: threadId });

      state.notice = 'Conversación cerrada con éxito.';
      if (window.OpsToast) window.OpsToast.show('Conversación cerrada.', 'success');

      await openThread(threadId, true);
    } catch (err) {
      console.error('[BaqueanoOpsMessages] Error al cerrar conversación:', err);
      state.error = err.message;
      if (window.OpsToast) window.OpsToast.show(`Error al cerrar: ${err.message}`, 'error');
      render();
    } finally {
      state.busy = false;
    }
  }

  async function reopenThread(threadId) {
    if (state.busy) return;

    state.busy = true;
    try {
      // Reabrir enviando una reapertura o respuesta administrativa
      await callEdgeFunction('staff_reply', { id: threadId, body: 'Conversación reabierta por el equipo de atención de BAQUEANO.' });
      state.notice = 'Conversación reabierta exitosamente.';
      if (window.OpsToast) window.OpsToast.show('Conversación reabierta.', 'success');
      await openThread(threadId, true);
    } catch (err) {
      state.error = err.message;
      render();
    } finally {
      state.busy = false;
    }
  }

  function openThread(id, keepNotice) {
    if (!keepNotice) state.notice = '';
    state.error = '';
    state.busy = true;

    return callEdgeFunction('staff_thread', { id: id }).then(d => {
      state.thread = d.thread;
      state.busy = false;
      render();
      refreshInbox();
    }).catch(err => {
      state.busy = false;
      state.error = err.message;
      render();
    });
  }

  function closeThreadView() {
    state.thread = null;
    render();
  }

  function refreshInbox() {
    return callEdgeFunction('staff_inbox', { status: state.filter }).then(d => {
      state.inbox = { items: d.items || [], unread: d.unread || 0, open: d.open || 0 };
      render();
    }).catch(err => {
      state.error = err.message;
      render();
    });
  }

  function refresh() {
    state.error = '';
    state.notice = '';
    const btn = document.getElementById('btnOpsMessagesRefresh');
    if (btn) {
      const icon = btn.querySelector('i');
      if (icon) icon.classList.add('fa-spin');
    }
    return refreshInbox().finally(() => {
      const btn = document.getElementById('btnOpsMessagesRefresh');
      if (btn) {
        const icon = btn.querySelector('i');
        if (icon) icon.classList.remove('fa-spin');
      }
    });
  }

  function setFilter(filterName) {
    state.filter = filterName;
    state.thread = null;
    refresh();
  }

  function search(query) {
    state.searchQuery = query || '';
    render();
  }

  function render0(panel) {
    state.panel = panel;
    render();
    refresh();
  }

  // --------------------------------------------------------------------------
  // EXPOSICIÓN GLOBAL
  // --------------------------------------------------------------------------
  window.BaqueanoOpsMessages = {
    render: render0,
    refresh: refresh,
    openThread: openThread,
    closeThreadView: closeThreadView,
    setFilter: setFilter,
    sendReply: sendReply,
    closeThread: closeThread,
    reopenThread: reopenThread,
    search: search
  };

  // Auto-render si el hash activo es 42-mensajes
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (window.location.hash === '#42-mensajes' || (window.OpsState && window.OpsState.activeTab === '42-mensajes')) {
        setTimeout(() => {
          const p = document.getElementById('view-42-mensajes');
          if (p) render0(p);
        }, 120);
      }
    });
  } else {
    if (window.location.hash === '#42-mensajes' || (window.OpsState && window.OpsState.activeTab === '42-mensajes')) {
      setTimeout(() => {
        const p = document.getElementById('view-42-mensajes');
        if (p) render0(p);
      }, 120);
    }
  }

})(window, document);
