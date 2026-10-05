// ============================================================================
// 🧭 BAQUEANO OPS CENTER — DATOS REALES DESDE SUPABASE (ops-live-data.js)
// ============================================================================
// 🎯 POR QUÉ:
// - Auditoría 2026-10-05 (C1–C3): el panel no leía ni escribía datos y mostraba
//   cifras inventadas. Directiva del propietario: Supabase es la base principal.
//
// ⚙️ CÓMO:
// - Habla SOLO con la Edge Function `baqueano-ops` usando el ID token de
//   Firebase. El servidor decide el rol, valida y audita; el navegador nunca
//   escribe tablas directamente.
// - Cada número en pantalla lleva estado y origen: REAL · SIN DATOS · ERROR ·
//   SINCRONIZANDO · NO CONFIGURADO. Sin fuente real se muestra "—".
// - Refresco moderado: al iniciar sesión, al volver a la pestaña y cada 5 min
//   solo si la pestaña está visible. Sin polling agresivo.
// - Se integra con ops-engine.js sin reemplazarlo: entrega registros con
//   `BaqueanoOpsEngine.ingestCollection` y atiende guardar/publicar/archivar/
//   verificar para las entidades administradas en Supabase.
//
// - Centro SOS (vista 20): cola real de `baqueano-sos` (sondeo de 30 s solo con
//   la vista abierta); admin gestiona estados con nota, el auditor solo lee.
// - Reservas (vista 11): solicitudes reales de `baqueano-reservas` (sin pago en
//   línea); admin confirma/completa/rechaza/cancela con nota; auditor solo lee.
// - Analítica / Impacto (vista 26): KPIs SMART de `kpi_dashboard()` y reporte
//   DB HEALTH vía `baqueano-ops`; sin denominador → "Sin datos suficientes".
// 📦 QUÉ: window.BaqueanoOpsData = { call, callSos, callReservations, renderSos, renderReservations, renderImpact, refresh, loadTab, manages, save,
//   setStatus, verify, state }.
// ============================================================================
(function (window, document) {
  'use strict';

  const ENDPOINT = 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-ops';
  // Alertas SOS de la App/Web (tabla sos_events, acceso solo vía Edge Function).
  const SOS_ENDPOINT = 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-sos';
  const SOS_POLL_MS = 30 * 1000;
  // Solicitudes de reserva por WhatsApp/teléfono (sin pago en línea).
  const RES_ENDPOINT = 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-reservas';
  const RES_POLL_MS = 60 * 1000;
  const REFRESH_MS = 5 * 60 * 1000;

  // Pestañas del Ops Center con datos en Supabase. `write` = edición habilitada.
  const TABS = {
    '03-destinos': { entity: 'destinations', write: true },
    '07-mapa': { entity: 'destinations', write: false },
    '08-negocios': { entity: 'businesses', write: true },
    '04-territorios': { entity: 'departments' },
    '05-municipios': { entity: 'municipalities' },
    '06-experiencias': { entity: 'experiences' },
    '15-gastronomia': { entity: 'gastronomy' },
    '17-cultura': { entity: 'culture' },
    '34-tarifas': { entity: 'tourism_services' },
    '09-verificaciones': { entity: 'verification_requests' }
  };

  const DEPARTMENTS = {
    boaco: 'Boaco', carazo: 'Carazo', chinandega: 'Chinandega', chontales: 'Chontales', raccn: 'RACCN', raccs: 'RACCS',
    esteli: 'Estelí', granada: 'Granada', jinotega: 'Jinotega', leon: 'León', madriz: 'Madriz', managua: 'Managua',
    masaya: 'Masaya', matagalpa: 'Matagalpa', nueva_segovia: 'Nueva Segovia', rio_san_juan: 'Río San Juan', rivas: 'Rivas'
  };
  const normalize = (v) => String(v || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  function departmentIdFromName(name) {
    const n = normalize(name);
    if (!n || n === 'nacional') return null;
    if (n.includes('norte') || n === 'raccn') return 'raccn';
    if (n.includes('sur') && (n.includes('caribe') || n === 'raccs')) return 'raccs';
    if (n === 'raccs') return 'raccs';
    return Object.keys(DEPARTMENTS).find((id) => normalize(DEPARTMENTS[id]) === n) || null;
  }

  const state = {
    role: null, canWrite: false, overview: null, health: null,
    status: 'SINCRONIZANDO', lastSync: null, error: null, started: false
  };

  // --------------------------------------------------------------------------
  // Cliente de la API administrativa
  // --------------------------------------------------------------------------
  function currentUser() {
    try { return window.firebase && window.firebase.auth ? window.firebase.auth().currentUser : null; } catch (_) { return null; }
  }

  function call(action, payload) {
    return request(ENDPOINT, action, payload);
  }

  function callSos(action, payload) {
    return request(SOS_ENDPOINT, action, payload);
  }

  function callReservations(action, payload) {
    return request(RES_ENDPOINT, action, payload);
  }

  async function request(endpoint, action, payload) {
    const user = currentUser();
    if (!user) throw new Error('Sin sesión administrativa.');
    const token = await user.getIdToken();
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-firebase-token': token },
        body: JSON.stringify(Object.assign({ action }, payload || {})),
        signal: controller.signal
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || data.ok === false) {
        const err = new Error((data && data.error) || `Error ${res.status} en la API administrativa.`);
        err.status = res.status;
        throw err;
      }
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('La API administrativa no respondió a tiempo.');
      throw error;
    } finally {
      window.clearTimeout(timer);
    }
  }

  function toast(message, type) {
    if (window.BaqueanoOpsEngine && typeof window.BaqueanoOpsEngine.toast === 'function') window.BaqueanoOpsEngine.toast(message, type);
  }

  // --------------------------------------------------------------------------
  // Pintado de KPIs y contadores (texto plano, nunca HTML de datos)
  // --------------------------------------------------------------------------
  const STATE_LABEL = { REAL: 'Real', SIN_DATOS: 'Sin datos', ERROR: 'Error', SINCRONIZANDO: 'Sincronizando', NO_CONFIGURADO: 'No configurado', DESCONECTADO: 'Desconectado' };
  const fmt = (n) => new Intl.NumberFormat('es-NI').format(n);

  function applyBadges() {
    const metrics = state.overview && state.overview.metrics;
    document.querySelectorAll('[data-ops-count]').forEach((badge) => {
      const metric = metrics && metrics[badge.dataset.opsCount];
      badge.classList.remove('is-pending');
      if (!metric) { badge.textContent = '—'; badge.title = 'Sin conexión con Supabase'; return; }
      badge.textContent = metric.value == null ? '!' : fmt(metric.value);
      badge.dataset.state = metric.state;
      badge.title = `${STATE_LABEL[metric.state] || metric.state} · Fuente: ${metric.source} (${metric.table})`;
    });
  }

  function setKpi(key, value, note, kpiState) {
    const valueEl = document.querySelector(`[data-ops-kpi="${key}"]`);
    const noteEl = document.querySelector(`[data-ops-kpi-note="${key}"]`);
    if (valueEl) { valueEl.textContent = value; valueEl.dataset.state = kpiState; }
    if (noteEl) noteEl.textContent = note;
  }

  function applyAiKpis() {
    const ai = state.overview && state.overview.ai;
    const m = state.overview && state.overview.metrics;
    if (!ai) return;
    if (ai.state !== 'REAL') {
      const msg = 'Sin datos · BAQUI aún no registra interacciones en Supabase (ai_messages).';
      setKpi('ai_messages', m && m.ai_messages ? fmt(m.ai_messages.value) : '—', msg, 'SIN_DATOS');
      setKpi('ai_provider', '—', 'Sin datos de proveedor registrados.', 'SIN_DATOS');
      setKpi('ai_tokens', '—', 'Sin datos de tokens registrados.', 'SIN_DATOS');
      setKpi('ai_latency', '—', 'Sin datos de latencia registrados.', 'SIN_DATOS');
      return;
    }
    const providers = Object.entries(ai.providers || {}).sort((a, b) => b[1] - a[1]);
    setKpi('ai_messages', fmt(m.ai_messages.value), `Real · Supabase ai_messages (muestra ${ai.sample})`, 'REAL');
    setKpi('ai_provider', providers.length ? providers[0][0] : '—', providers.map(([p, c]) => `${p}: ${c}`).join(' · ') || 'Sin proveedor registrado', 'REAL');
    setKpi('ai_tokens', fmt(ai.tokens || 0), 'Real · suma de tokens_used de la muestra', 'REAL');
    setKpi('ai_latency', ai.avg_latency_ms == null ? '—' : `${(ai.avg_latency_ms / 1000).toFixed(2)} s`, 'Real · promedio de latency_ms', ai.avg_latency_ms == null ? 'SIN_DATOS' : 'REAL');
  }

  function applyBanner() {
    const banner = document.getElementById('opsDataSourceBanner');
    const chip = document.getElementById('opsDataSourceState');
    const m = state.overview && state.overview.metrics;
    if (chip) { chip.dataset.state = state.status; chip.textContent = STATE_LABEL[state.status] || state.status; }
    if (!banner) return;
    banner.replaceChildren();
    const strong = document.createElement('strong');
    strong.textContent = 'Fuente de datos: ';
    banner.append(strong);
    if (state.status === 'ERROR' || !m) {
      banner.append(state.error ? `Supabase no respondió (${state.error}).` : 'Esperando la conexión con Supabase…');
      return;
    }
    const v = (k) => (m[k] && m[k].value != null ? fmt(m[k].value) : '—');
    banner.append(`Supabase (base principal) · ${v('departments')} territorios · ${v('destinations')} destinos (${v('destinations_published')} publicados) · ${v('businesses')} negocios (${v('businesses_verified')} verificados) · ${v('municipalities')} municipios cargados. Actualizado ${new Date(state.lastSync).toLocaleTimeString('es-NI')}.`);
    const stamp = document.getElementById('opsMetricsLastUpdated');
    if (stamp) stamp.textContent = `Datos reales · ${new Date(state.lastSync).toLocaleTimeString('es-NI')}`;
  }

  // --------------------------------------------------------------------------
  // Health Center (estado real comprobado en el servidor)
  // --------------------------------------------------------------------------
  const HEALTH_COLORS = { OPERATIVO: 'ok', DEGRADADO: 'warn', ERROR: 'bad', SIN_CONFIGURAR: 'idle', DESCONOCIDO: 'idle' };
  const HEALTH_LABEL = { OPERATIVO: 'Operativo', DEGRADADO: 'Degradado', ERROR: 'Error', SIN_CONFIGURAR: 'Sin configurar', DESCONOCIDO: 'Desconocido' };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function healthCard(compact) {
    const wrap = el('section', `ops-health ${compact ? 'is-compact' : ''}`);
    wrap.setAttribute('aria-label', 'Estado real de los servicios');
    const head = el('div', 'ops-health-head');
    const title = el('h3', 'ops-health-title', compact ? 'Estado real de los servicios' : 'Health Center · comprobaciones en vivo');
    const meta = el('span', 'ops-health-meta', state.health ? `Comprobado ${new Date(state.health.generated_at).toLocaleTimeString('es-NI')} desde el servidor` : 'Comprobando…');
    const btn = el('button', 'btn-ops-matte', 'Volver a comprobar');
    btn.type = 'button';
    btn.addEventListener('click', () => refresh({ health: true, force: true }));
    head.append(title, meta, btn);
    const grid = el('div', 'ops-health-grid');
    (state.health ? state.health.checks : []).forEach((check) => {
      const item = el('article', `ops-health-item is-${HEALTH_COLORS[check.state] || 'idle'}`);
      const top = el('div', 'ops-health-item-top');
      top.append(el('strong', '', check.label), el('span', 'ops-health-state', HEALTH_LABEL[check.state] || check.state));
      item.append(top, el('p', 'ops-health-detail', check.detail));
      item.append(el('small', 'ops-health-source', `Fuente: ${check.source}${check.latency_ms != null ? ` · ${check.latency_ms} ms` : ''}`));
      grid.append(item);
    });
    if (!state.health) grid.append(el('p', 'ops-health-detail', state.error ? `No se pudo comprobar: ${state.error}` : 'Consultando cada servicio…'));
    wrap.append(head, grid);
    return wrap;
  }

  function mount(containerId, node, slotId) {
    const view = document.getElementById(containerId);
    if (!view) return;
    let slot = document.getElementById(slotId);
    if (!slot) {
      slot = el('div', 'ops-live-slot');
      slot.id = slotId;
      const header = view.querySelector('.ops-view-header');
      if (header && header.nextSibling) view.insertBefore(slot, header.nextSibling); else view.prepend(slot);
    }
    slot.replaceChildren(node);
  }

  function renderHealth() {
    mount('view-33-estado', healthCard(false), 'opsLiveHealthCenter');
    mount('view-01-dashboard', healthCard(true), 'opsLiveHealthStrip');
  }

  // --------------------------------------------------------------------------
  // Visor de auditoría (servidor): búsqueda, filtros y fechas
  // --------------------------------------------------------------------------
  const auditState = { page: 0, q: '', module: '', admin: '', action: '', from: '', to: '' };
  async function renderAudit() {
    const box = el('section', 'ops-audit-live');
    box.setAttribute('aria-label', 'Registro de auditoría del servidor');
    box.append(el('h3', 'ops-health-title', 'Auditoría del servidor (Supabase · audit_logs)'));
    const form = el('form', 'ops-audit-filters');
    const fields = [['q', 'Buscar en descripción', 'search'], ['admin', 'Administrador', 'text'], ['module', 'Módulo', 'text'], ['action', 'Acción', 'text'], ['from', 'Desde', 'date'], ['to', 'Hasta', 'date']];
    fields.forEach(([key, label, type]) => {
      const lab = el('label', 'ops-audit-field');
      const span = el('span', '', label);
      const input = el('input');
      input.type = type; input.name = key; input.value = auditState[key] || '';
      lab.append(span, input);
      form.append(lab);
    });
    const submit = el('button', 'btn-ops-matte primary', 'Filtrar');
    submit.type = 'submit';
    form.append(submit);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      fields.forEach(([key]) => { auditState[key] = String(data.get(key) || '').trim(); });
      auditState.page = 0;
      renderAudit();
    });
    const list = el('div', 'ops-audit-list', 'Cargando auditoría…');
    box.append(form, list);
    mount('view-27-auditoria', box, 'opsLiveAudit');
    try {
      const res = await call('audit_list', {
        page: auditState.page, limit: 50, q: auditState.q || undefined, admin: auditState.admin || undefined,
        module: auditState.module || undefined, action_filter: auditState.action || undefined,
        from: auditState.from || undefined, to: auditState.to ? `${auditState.to}T23:59:59` : undefined
      });
      list.replaceChildren();
      if (!res.items.length) { list.append(el('p', 'ops-health-detail', 'Sin eventos registrados con esos filtros. Cada cambio hecho desde el Ops Center queda aquí con su valor anterior y nuevo.')); return; }
      const table = el('table', 'ops-audit-table');
      const thead = el('thead');
      const hr = el('tr');
      ['Fecha', 'Administrador', 'Rol', 'Acción', 'Módulo', 'Registro', 'Resultado'].forEach((h) => { const th = el('th', '', h); th.scope = 'col'; hr.append(th); });
      thead.append(hr);
      const tbody = el('tbody');
      res.items.forEach((row) => {
        const tr = el('tr');
        const p = row.payload || {};
        [new Date(row.created_at).toLocaleString('es-NI'), row.admin_email, p.role || '—', row.action, row.module || '—', row.description || row.target_id || '—', p.result || 'ok']
          .forEach((value) => tr.append(el('td', '', String(value))));
        tbody.append(tr);
      });
      table.append(thead, tbody);
      list.append(table, el('small', 'ops-health-source', `${res.total} eventos · página ${res.page + 1}`));
    } catch (error) {
      list.textContent = `No se pudo leer la auditoría: ${error.message}`;
    }
  }

  // --------------------------------------------------------------------------
  // Registros por módulo (mapeo Supabase → campos que usa ops-engine)
  // --------------------------------------------------------------------------
  function toEngine(entity, row) {
    const status = row.deleted_at ? 'trashed' : (row.status || 'published');
    const base = { id: row.id, source: 'supabase', status, verified: row.verified === true, updatedAt: row.updated_at || row.created_at, createdAt: row.created_at };
    switch (entity) {
      case 'destinations':
        return Object.assign(base, {
          title: row.name, name: row.name, department: DEPARTMENTS[row.department_id] || row.department_id || 'Nacional', departmentId: row.department_id,
          category: row.category || '', shortDesc: row.short_desc || '', description: row.description || '',
          latitude: row.latitude, longitude: row.longitude, imageUrl: row.cover_image || '',
          sourceName: row.source_name || '', sourceUrl: row.source_url || '', lastVerifiedAt: row.last_verified_at,
          verification: row.metadata && row.metadata.verification ? row.metadata.verification : null
        });
      case 'businesses':
        return Object.assign(base, {
          title: row.name, name: row.name, category: row.category || '', department: row.department || '', municipality: row.municipality || '',
          phone: row.phone || '', whatsapp: row.whatsapp || '', address: row.address || '', latitude: row.latitude, longitude: row.longitude,
          imageUrl: row.cover_image || '', description: row.host_story || '', dayPass: row.day_pass_available ? 'Sí' : '',
          verification: row.metadata && row.metadata.verification ? row.metadata.verification : null
        });
      case 'departments':
        return Object.assign(base, { title: row.name, name: row.name, description: row.short_desc || '', capital: row.capital || '', imageUrl: row.banner_image || '', status: 'published' });
      case 'municipalities':
        return Object.assign(base, { title: row.name, name: row.name, department: DEPARTMENTS[row.department_id] || row.department_id, status: 'published' });
      case 'gastronomy':
        return Object.assign(base, { title: row.dish_name, name: row.dish_name, category: row.category || '', department: DEPARTMENTS[row.department_id] || row.department_id });
      case 'tourism_services':
        return Object.assign(base, { title: row.title, name: row.title, category: row.service_type || '', priceUsd: row.currency === 'USD' ? row.price_min : null, priceNio: row.currency === 'NIO' ? row.price_min : null });
      case 'verification_requests':
        return Object.assign(base, { title: row.applicant_name || row.entity_id, name: row.applicant_name || row.entity_id, category: row.entity_type, description: row.admin_notes || '' });
      default:
        return Object.assign(base, { title: row.title || row.name, name: row.title || row.name, category: row.category || '', department: DEPARTMENTS[row.department_id] || row.department_id || '' });
    }
  }

  async function loadTab(tabId) {
    const cfg = TABS[tabId];
    if (!cfg || !currentUser()) return null;
    const res = await call('list', { entity: cfg.entity, limit: 100 });
    let items = res.items.map((row) => toEngine(cfg.entity, row));
    if (cfg.write && (cfg.entity === 'destinations' || cfg.entity === 'businesses')) {
      const archived = await call('list', { entity: cfg.entity, limit: 100, archived: true }).catch(() => ({ items: [] }));
      items = items.concat(archived.items.map((row) => toEngine(cfg.entity, row)));
    }
    if (tabId === '07-mapa') items = items.filter((i) => Number.isFinite(i.latitude) && Number.isFinite(i.longitude));
    if (window.BaqueanoOpsEngine && typeof window.BaqueanoOpsEngine.ingestCollection === 'function') {
      window.BaqueanoOpsEngine.ingestCollection(tabId, items, { source: 'Supabase', state: res.state, total: res.total });
    }
    return items;
  }

  // --------------------------------------------------------------------------
  // Escritura (solo destinos y negocios en esta fase)
  // --------------------------------------------------------------------------
  function manages(tabId) {
    const cfg = TABS[tabId];
    return Boolean(cfg && cfg.write && currentUser());
  }

  const num = (v) => (v === '' || v == null || !Number.isFinite(Number(v)) ? null : Number(v));
  function fromEngine(tabId, p) {
    const entity = TABS[tabId].entity;
    const lat = num(p.latitude);
    const lng = num(p.longitude);
    // Coordenadas: o ambas o ninguna. Nunca se inventan.
    const coords = lat != null && lng != null ? { latitude: lat, longitude: lng } : { latitude: null, longitude: null };
    if (entity === 'destinations') {
      return Object.assign({
        name: p.title || p.name, department_id: departmentIdFromName(p.department) || undefined, category: p.category || null,
        short_desc: p.shortDesc || null, description: p.description || null, cover_image: p.imageUrl || null,
        status: ['draft', 'published', 'pending_review', 'archived'].includes(p.status) ? p.status : undefined,
        source_name: p.sourceName || undefined, source_url: p.sourceUrl || undefined
      }, coords);
    }
    return Object.assign({
      name: p.title || p.name, category: p.category || null, department: p.department && p.department !== 'Nacional' ? p.department : null,
      municipality: p.municipality || null, phone: p.phone || null, whatsapp: p.whatsapp || null, address: p.address || null,
      cover_image: p.imageUrl || null, host_story: p.description || null, day_pass_available: Boolean(p.dayPass)
    }, coords);
  }

  async function save(tabId, payload) {
    const entity = TABS[tabId].entity;
    const values = fromEngine(tabId, payload);
    if (entity === 'destinations' && !values.department_id && !payload.id) {
      throw new Error('Elegí el departamento del destino (no puede quedar "Nacional").');
    }
    const res = await call('save', { entity, id: payload.id || undefined, values });
    const previous = payload.id ? findItem(tabId, payload.id) : null;
    if (payload.verified === true && !(previous && previous.verified)) {
      await openVerifyDialog(tabId, res.item.id, res.item.name);
    }
    await refreshAfterWrite(tabId);
    toast(`Guardado en Supabase (base principal) y registrado en auditoría.`, 'success');
    return res.item;
  }

  function findItem(tabId, id) {
    try {
      const items = window.BaqueanoOpsEngine.getCollection ? window.BaqueanoOpsEngine.getCollection(tabId) : [];
      return (items || []).find((i) => i.id === id) || null;
    } catch (_) { return null; }
  }

  async function setStatus(tabId, id, op) {
    await call('set_status', { entity: TABS[tabId].entity, id, op });
    await refreshAfterWrite(tabId);
    const labels = { publish: 'Publicado', unpublish: 'Pasado a borrador', archive: 'Archivado (recuperable)', restore: 'Restaurado' };
    toast(`${labels[op] || op} en Supabase · registrado en auditoría.`, 'success');
  }

  async function refreshAfterWrite(tabId) {
    await loadTab(tabId).catch(() => {});
    refresh({ force: true }).catch(() => {});
  }

  // Sello "Verificado por BAQUEANO" con trazabilidad completa (no un checkbox suelto).
  function openVerifyDialog(tabId, id, name) {
    return new Promise((resolve) => {
      const overlay = el('div', 'ops-verify-overlay');
      const dialog = el('form', 'ops-verify-dialog');
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('aria-labelledby', 'opsVerifyTitle');
      const title = el('h3', '', `Verificar: ${name}`);
      title.id = 'opsVerifyTitle';
      const fields = [
        ['source', 'Fuente de la verificación *', 'text', 'Visita de campo, llamada, documento oficial…'],
        ['evidence', 'Evidencia (URL https)', 'url', 'https://…'],
        ['next_review', 'Próxima revisión', 'date', ''],
        ['notes', 'Observaciones', 'textarea', '']
      ];
      const inputs = {};
      dialog.append(title, el('p', 'ops-health-detail', 'Se guardará quién verifica, cuándo, con qué fuente y evidencia. Queda en la auditoría.'));
      fields.forEach(([key, label, type, placeholder]) => {
        const lab = el('label', 'ops-audit-field');
        const input = type === 'textarea' ? el('textarea') : el('input');
        if (type !== 'textarea') input.type = type;
        input.name = key; input.placeholder = placeholder;
        if (key === 'source') input.required = true;
        lab.append(el('span', '', label), input);
        const error = el('small', 'ops-field-error');
        error.id = `opsVerifyErr-${key}`;
        input.setAttribute('aria-describedby', error.id);
        lab.append(error);
        inputs[key] = input;
        dialog.append(lab);
      });
      const actions = el('div', 'ops-verify-actions');
      const cancel = el('button', 'btn-ops-matte', 'Cancelar');
      cancel.type = 'button';
      const ok = el('button', 'btn-ops-matte primary', 'Registrar verificación');
      ok.type = 'submit';
      actions.append(cancel, ok);
      dialog.append(actions);
      overlay.append(dialog);
      document.body.append(overlay);
      inputs.source.focus();
      const close = (result) => { overlay.remove(); resolve(result); };
      cancel.addEventListener('click', () => close(false));
      overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(false); });
      dialog.addEventListener('submit', async (event) => {
        event.preventDefault();
        Object.keys(inputs).forEach((k) => { document.getElementById(`opsVerifyErr-${k}`).textContent = ''; });
        if (!inputs.source.value.trim()) { document.getElementById('opsVerifyErr-source').textContent = 'Indicá la fuente.'; inputs.source.focus(); return; }
        ok.disabled = true; ok.textContent = 'Guardando…';
        try {
          await call('verify', {
            entity: TABS[tabId].entity, id, verified: true, source: inputs.source.value.trim(),
            evidence: inputs.evidence.value.trim() || undefined, notes: inputs.notes.value.trim() || undefined,
            next_review: inputs.next_review.value || undefined
          });
          toast('Sello "Verificado por BAQUEANO" registrado con su trazabilidad.', 'success');
          close(true);
        } catch (error) {
          document.getElementById(/URL|evidencia/i.test(error.message) ? 'opsVerifyErr-evidence' : 'opsVerifyErr-source').textContent = error.message;
          ok.disabled = false; ok.textContent = 'Registrar verificación';
        }
      });
    });
  }

  async function verify(tabId, id, verified) {
    const item = findItem(tabId, id);
    if (verified) {
      const done = await openVerifyDialog(tabId, id, item ? item.name : id);
      if (done) await refreshAfterWrite(tabId);
      return done;
    }
    await call('verify', { entity: TABS[tabId].entity, id, verified: false });
    await refreshAfterWrite(tabId);
    toast('Verificación retirada (queda en la auditoría).', 'info');
    return true;
  }

  // --------------------------------------------------------------------------
  // Centro SOS (vista 20): alertas reales desde la App Android y la Web
  // --------------------------------------------------------------------------
  const SOS_LABEL = { open: 'Abierta', acknowledged: 'Atendiendo', resolved: 'Resuelta', false_alarm: 'Falsa alarma' };
  const SOS_LOCATION = { gps: 'GPS', denied: 'Permiso de ubicación denegado', disabled: 'GPS desactivado', unavailable: 'Ubicación no disponible' };
  let sosLoading = null;

  function sosVisible() {
    const view = document.getElementById('view-20-sos');
    return Boolean(view && view.offsetParent !== null && !document.hidden);
  }

  function sosRow(item, readOnly) {
    const tr = el('tr');
    tr.dataset.sosStatus = item.status;

    const alertCell = el('td');
    const chip = el('span', 'ops-sos-chip', SOS_LABEL[item.status] || item.status);
    chip.dataset.state = item.status;
    alertCell.appendChild(chip);
    alertCell.appendChild(el('div', 'ops-sos-who', item.reporter_name || 'Viajero'));
    if (item.reporter_email) alertCell.appendChild(el('div', 'ops-sos-meta', item.reporter_email));
    tr.appendChild(alertCell);

    tr.appendChild(el('td', '', item.dialed_service ? `Llamada a ${item.dialed_service}` : 'Alerta sin llamada registrada'));

    const geoCell = el('td');
    const lat = Number(item.latitude);
    const lng = Number(item.longitude);
    if (item.latitude != null && Number.isFinite(lat) && Number.isFinite(lng)) {
      const link = el('a', 'ops-sos-geo', `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      link.href = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      geoCell.appendChild(link);
      if (item.accuracy_m != null) geoCell.appendChild(el('div', 'ops-sos-meta', `±${Math.round(Number(item.accuracy_m))} m`));
    } else {
      geoCell.appendChild(el('span', 'ops-sos-meta', SOS_LOCATION[item.location_status] || 'Sin ubicación'));
    }
    tr.appendChild(geoCell);

    tr.appendChild(el('td', '', item.channel === 'web' ? 'Portal web' : 'App Android'));
    tr.appendChild(el('td', '', new Date(item.created_at).toLocaleString('es-NI')));

    const actions = el('td', 'ops-sos-actions');
    if (readOnly) {
      actions.appendChild(el('span', 'ops-sos-meta', item.handled_by ? `Gestionó: ${item.handled_by}` : 'Solo lectura'));
    } else {
      [['acknowledged', 'Atender'], ['resolved', 'Resolver'], ['false_alarm', 'Falsa alarma']]
        .filter(([status]) => status !== item.status)
        .forEach(([status, label]) => {
          const btn = el('button', 'ops-sos-btn', label);
          btn.type = 'button';
          btn.addEventListener('click', async () => {
            const note = window.prompt(`${label}: nota para el historial (opcional)`, '');
            if (note === null) return;
            btn.disabled = true;
            try {
              await callSos('update', { id: item.id, status, note });
              toast(`Alerta marcada como ${SOS_LABEL[status].toLowerCase()}.`, 'success');
              renderSos({ force: true });
            } catch (error) {
              btn.disabled = false;
              toast(`No se pudo actualizar la alerta: ${error.message}`, 'error');
            }
          });
          actions.appendChild(btn);
        });
    }
    tr.appendChild(actions);
    return tr;
  }

  function toast(message, type) {
    const engine = window.BaqueanoOpsEngine;
    if (engine && typeof engine.toast === 'function') engine.toast(message, type);
    else console.info('[OpsData]', message);
  }

  async function renderSos(options) {
    const opts = options || {};
    if (!currentUser()) return;
    if (sosLoading && !opts.force) return sosLoading;
    sosLoading = (async () => {
      // La tabla solo existe con la vista abierta; el KPI y el contador del
      // menú se actualizan siempre.
      const body = document.getElementById('sosTableBody');
      const empty = document.getElementById('sosEmptyState');
      const kpi = document.getElementById('kpiActiveSos');
      const headRow = body && body.closest('table') && body.closest('table').querySelector('thead tr');
      if (headRow && !headRow.querySelector('[data-sos-actions]')) {
        const th = el('th', '', 'Gestión');
        th.dataset.sosActions = '1';
        headRow.appendChild(th);
      }
      try {
        const data = await callSos('queue');
        const items = Array.isArray(data.items) ? data.items : [];
        if (body) body.replaceChildren(...items.map((item) => sosRow(item, data.read_only === true)));
        if (empty) {
          empty.style.display = items.length ? 'none' : '';
          const title = empty.querySelector('.ops-empty-title');
          const desc = empty.querySelector('.ops-empty-desc');
          if (title) title.textContent = 'Sin alertas SOS registradas';
          if (desc) desc.textContent = 'Fuente: Supabase sos_events vía baqueano-sos. Las alertas aparecen cuando un viajero con sesión llama a emergencias desde la App.';
        }
        const active = (data.counts && (Number(data.counts.open || 0) + Number(data.counts.acknowledged || 0))) || 0;
        state.sos = { active, counts: data.counts || {}, lastSync: Date.now() };
        if (kpi) { kpi.textContent = String(active); kpi.dataset.state = 'REAL'; kpi.title = 'Fuente: Supabase sos_events'; }
        const badge = document.getElementById('badgeActiveSos');
        if (badge) {
          badge.textContent = String(active);
          badge.title = `Alertas SOS abiertas o en atención (Supabase sos_events) · ${new Date().toLocaleTimeString('es-NI')}`;
          badge.classList.toggle('is-pending', false);
          badge.classList.toggle('is-alert', active > 0);
        }
      } catch (error) {
        if (body) body.replaceChildren();
        if (empty) {
          empty.style.display = '';
          const title = empty.querySelector('.ops-empty-title');
          const desc = empty.querySelector('.ops-empty-desc');
          if (title) title.textContent = 'No se pudo leer el Centro SOS';
          if (desc) desc.textContent = error.message;
        }
        if (kpi) { kpi.textContent = '—'; kpi.dataset.state = 'ERROR'; kpi.title = error.message; }
      }
    })().finally(() => { sosLoading = null; });
    return sosLoading;
  }

  // --------------------------------------------------------------------------
  // Reservas (vista 11): solicitudes reales coordinadas por WhatsApp/teléfono
  // --------------------------------------------------------------------------
  const RES_LABEL = { pending: 'Solicitud enviada', confirmed: 'Confirmada', rejected: 'No disponible', cancelled: 'Cancelada', completed: 'Completada' };
  const RES_ACTIONS = [['confirmed', 'Confirmar'], ['completed', 'Completada'], ['rejected', 'No disponible'], ['cancelled', 'Cancelar']];
  let resLoading = null;

  function resVisible() {
    const view = document.getElementById('view-11-reservas');
    return Boolean(view && view.offsetParent !== null && !document.hidden);
  }

  function waLink(phone, text) {
    let digits = String(phone || '').replace(/[^0-9]/g, '');
    if (digits.length === 8) digits = `505${digits}`; // número nicaragüense sin código de país
    return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : null;
  }

  function reservationRow(item, readOnly) {
    const tr = el('tr');
    tr.dataset.resStatus = item.status;
    const biz = item.businesses || {};

    const codeCell = el('td');
    const chip = el('span', 'ops-sos-chip', RES_LABEL[item.status] || item.status);
    chip.dataset.state = item.status === 'pending' ? 'acknowledged' : (item.status === 'confirmed' || item.status === 'completed' ? 'resolved' : 'closed');
    codeCell.appendChild(chip);
    codeCell.appendChild(el('div', 'ops-sos-who', item.reservation_code));
    codeCell.appendChild(el('div', 'ops-sos-meta', item.channel === 'web' ? 'Portal web' : 'App Android'));
    tr.appendChild(codeCell);

    const bizCell = el('td');
    bizCell.appendChild(el('div', 'ops-sos-who', biz.name || item.business_id || '—'));
    bizCell.appendChild(el('div', 'ops-sos-meta', [item.destination_name, biz.department].filter(Boolean).join(' · ') || item.service_title || ''));
    tr.appendChild(bizCell);

    const travelerCell = el('td');
    travelerCell.appendChild(el('div', 'ops-sos-who', item.contact_name || 'Viajero'));
    const contact = waLink(item.contact_phone, `Hola ${item.contact_name || ''}, te escribe el equipo BAQUEANO sobre tu solicitud ${item.reservation_code}.`);
    if (contact) {
      const link = el('a', 'ops-sos-geo', item.contact_phone);
      link.href = contact; link.target = '_blank'; link.rel = 'noopener noreferrer';
      travelerCell.appendChild(link);
    }
    tr.appendChild(travelerCell);

    tr.appendChild(el('td', '', `${item.travel_date || '—'} · ${item.people_count || 1} pers.`));
    tr.appendChild(el('td', '', new Date(item.created_at).toLocaleString('es-NI')));

    const actions = el('td', 'ops-sos-actions');
    if (item.notes) actions.appendChild(el('div', 'ops-sos-meta', `Nota: ${item.notes}`));
    if (readOnly) {
      actions.appendChild(el('span', 'ops-sos-meta', item.handled_by ? `Gestionó: ${item.handled_by}` : 'Solo lectura'));
    } else {
      RES_ACTIONS.filter(([status]) => status !== item.status).forEach(([status, label]) => {
        const btn = el('button', 'ops-sos-btn', label);
        btn.type = 'button';
        btn.addEventListener('click', async () => {
          const note = window.prompt(`${label} ${item.reservation_code}: nota para el historial (opcional)`, '');
          if (note === null) return;
          btn.disabled = true;
          try {
            await callReservations('update', { id: item.id, status, note });
            toast(`Reserva ${item.reservation_code}: ${RES_LABEL[status].toLowerCase()}.`, 'success');
            renderReservations({ force: true });
          } catch (error) {
            btn.disabled = false;
            toast(`No se pudo actualizar la reserva: ${error.message}`, 'error');
          }
        });
        actions.appendChild(btn);
      });
    }
    tr.appendChild(actions);
    return tr;
  }

  async function renderReservations(options) {
    const opts = options || {};
    if (!currentUser()) return;
    if (resLoading && !opts.force) return resLoading;
    resLoading = (async () => {
      const body = document.getElementById('opsLiveReservations');
      const empty = document.getElementById('opsLiveReservationsEmpty');
      try {
        const data = await callReservations('queue');
        const items = Array.isArray(data.items) ? data.items : [];
        if (body) body.replaceChildren(...items.map((item) => reservationRow(item, data.read_only === true)));
        const pending = Number((data.counts && data.counts.pending) || 0);
        state.reservations = { pending, counts: data.counts || {}, lastSync: Date.now() };
        if (empty) {
          empty.hidden = items.length > 0;
          empty.textContent = 'Sin solicitudes de reserva. Aparecen cuando un viajero con sesión registra una solicitud desde la App o la web.';
        }
      } catch (error) {
        if (body) body.replaceChildren();
        if (empty) { empty.hidden = false; empty.textContent = `No se pudieron leer las reservas: ${error.message}`; }
      }
    })().finally(() => { resLoading = null; });
    return resLoading;
  }

  // --------------------------------------------------------------------------
  // Ciclo de refresco
  // --------------------------------------------------------------------------
  let refreshing = null;
  let lastHealth = 0;
  async function refresh(options) {
    const opts = options || {};
    if (refreshing && !opts.force) return refreshing;
    refreshing = (async () => {
      state.status = 'SINCRONIZANDO';
      applyBanner();
      try {
        const wantHealth = opts.health || !state.health || Date.now() - lastHealth > REFRESH_MS;
        const [overview, health] = await Promise.all([
          call('overview'),
          wantHealth ? call('health').catch((e) => ({ error: e.message })) : Promise.resolve(state.health)
        ]);
        state.overview = overview;
        if (health && !health.error) { state.health = health; lastHealth = Date.now(); }
        state.status = 'REAL';
        state.error = null;
        state.lastSync = Date.now();
      } catch (error) {
        state.status = error.status === 403 || error.status === 401 ? 'DESCONECTADO' : 'ERROR';
        state.error = error.message;
      }
      applyBadges();
      applyAiKpis();
      applyBanner();
      renderHealth();
      window.dispatchEvent(new CustomEvent('baqueano:ops-data', { detail: { state } }));
    })().finally(() => { refreshing = null; });
    return refreshing;
  }

  async function onSignedIn() {
    try {
      const who = await call('whoami');
      state.role = who.role;
      state.canWrite = who.can_write === true;
    } catch (error) {
      state.status = 'DESCONECTADO';
      state.error = error.message;
      applyBanner();
      return;
    }
    await refresh({ health: true });
    Object.keys(TABS).forEach((tabId) => { loadTab(tabId).catch((e) => console.warn('[OpsData]', tabId, e.message)); });
    renderAudit();
    renderSos();
    renderReservations();
  }

  function start() {
    if (state.started) return;
    state.started = true;
    try {
      window.firebase.auth().onAuthStateChanged((user) => { if (user) onSignedIn(); });
    } catch (_) { /* sin Firebase Auth: el panel muestra "Desconectado" */ }
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && currentUser() && Date.now() - (state.lastSync || 0) > 60000) refresh();
    });
    window.setInterval(() => { if (!document.hidden && currentUser()) { refresh(); renderSos(); } }, REFRESH_MS);
    // SOS: sondeo cada 30 s solo mientras la vista está abierta y visible.
    window.setInterval(() => { if (currentUser() && sosVisible()) renderSos(); }, SOS_POLL_MS);
    window.setInterval(() => { if (currentUser() && resVisible()) renderReservations(); }, RES_POLL_MS);
    document.addEventListener('click', (event) => {
      const target = event.target.closest && event.target.closest('#btnOpsSyncAll, [data-tab="27-auditoria"], [data-tab="20-sos"], [data-tab="26-analitica"]');
      if (!target || !currentUser()) return;
      if (target.id === 'btnOpsSyncAll') { refresh({ force: true, health: true }); renderSos({ force: true }); renderReservations({ force: true }); }
      else if (target.dataset.tab === '20-sos') window.setTimeout(() => renderSos({ force: true }), 0);
      else if (target.dataset.tab === '26-analitica') window.setTimeout(renderImpact, 0);
      else window.setTimeout(renderAudit, 0); // después de que el motor dibuje la vista
    });
  }

  // --------------------------------------------------------------------------
  // Analítica / Impacto (vista 26): KPIs SMART calculados en PostgreSQL
  // 🎯 Ningún KPI importante puede depender de una cifra escrita a mano.
  // ⚙️ `baqueano-ops` → kpi_dashboard() y db_health_report(). Cada tarjeta
  //    muestra valor, numerador/denominador y fuente; sin denominador dice
  //    "Sin datos suficientes". Textos con claves `ops.impact.*` (6 idiomas).
  // 📦 renderImpact({ days }) dibuja la vista y el reporte DB HEALTH.
  // --------------------------------------------------------------------------
  const impactState = { days: 30, loading: false };
  function t(key, fallback, params) {
    let text = fallback;
    try {
      if (window.BaqueanoLanguage && typeof window.BaqueanoLanguage.t === 'function') text = window.BaqueanoLanguage.t(key, { fallback });
    } catch (_) { text = fallback; }
    if (params) Object.keys(params).forEach((name) => { text = String(text).split(`{${name}}`).join(String(params[name])); });
    return text;
  }
  const kNum = (v) => (v == null || Number.isNaN(Number(v)) ? null : Number(v));
  const kFmt = (v, suffix) => (kNum(v) == null ? t('ops.impact.noData', 'Sin datos suficientes') : `${Number(v).toLocaleString('es-NI')}${suffix || ''}`);

  function impactCard(titleKey, title, value, detail, source, status) {
    const card = el('article', `ops-impact-card ${status === 'insufficient_data' || value == null ? 'is-empty' : 'is-real'}`);
    card.append(el('span', 'ops-impact-label', t(titleKey, title)));
    card.append(el('strong', 'ops-impact-value', value == null ? t('ops.impact.noData', 'Sin datos suficientes') : String(value)));
    if (detail) card.append(el('p', 'ops-impact-detail', detail));
    card.append(el('small', 'ops-impact-source', `${t('ops.impact.source', 'Fuente')}: ${source}`));
    return card;
  }

  function impactView(report, health) {
    const k = (report && report.kpis) || {};
    const wrap = el('section', 'ops-impact');
    wrap.setAttribute('aria-label', t('ops.impact.title', 'Analítica e impacto'));
    const head = el('div', 'ops-health-head');
    head.append(el('h3', 'ops-health-title', t('ops.impact.title', 'Analítica e impacto')));
    head.append(el('span', 'ops-health-meta', report ? t('ops.impact.generated', 'Calculado en Supabase · {time}', { time: new Date(report.generated_at).toLocaleString('es-NI') }) : t('ops.impact.loading', 'Calculando en el servidor…')));
    const select = el('select', 'ops-impact-period');
    select.setAttribute('aria-label', t('ops.impact.period', 'Período'));
    [7, 30, 90, 365].forEach((d) => {
      const o = el('option', '', t('ops.impact.lastDays', 'Últimos {days} días', { days: d }));
      o.value = String(d);
      if (d === impactState.days) o.selected = true;
      select.append(o);
    });
    select.addEventListener('change', () => { impactState.days = Number(select.value) || 30; renderImpact(); });
    head.append(select);
    wrap.append(head);
    wrap.append(el('p', 'ops-impact-note', t('ops.impact.note', 'Todas las cifras se calculan con consultas reproducibles sobre datos reales (kpi_dashboard). Registrado no es lo mismo que activado.')));

    const grid = el('div', 'ops-impact-grid');
    const users = k.users_registered || {};
    grid.append(impactCard('ops.impact.users', 'Usuarios registrados', kNum(users.value), t('ops.impact.newInPeriod', 'Nuevos en el período: {n}', { n: kFmt(users.new_in_period) }), 'profiles'));
    const act = k.actors_activated || {};
    grid.append(impactCard('ops.impact.activated', 'Usuarios activados', act.status === 'ok' ? act.value : null,
      act.status === 'ok' ? t('ops.impact.rate', 'Tasa: {pct} de {den} actores', { pct: kFmt(act.rate_pct, ' %'), den: kFmt(act.denominator_actors_seen) }) : act.definition,
      'analytics_events · v_actor_activation', act.status));
    const active = k.active_actors || {};
    grid.append(impactCard('ops.impact.active', 'Usuarios activos (7 / 30 días)', (kNum(active.last_7_days) || kNum(active.last_30_days)) ? `${kFmt(active.last_7_days)} / ${kFmt(active.last_30_days)}` : null, null, 'analytics_events'));
    const ret = k.retention_d7 || {};
    grid.append(impactCard('ops.impact.retention', 'Retención a 7 días', ret.status === 'ok' ? kFmt(ret.value_pct, ' %') : null,
      ret.status === 'ok' ? `${kFmt(ret.numerator)} / ${kFmt(ret.denominator)}` : null, 'analytics_events', ret.status));
    const biz = k.businesses || {};
    grid.append(impactCard('ops.impact.businesses', 'Negocios (publicados / verificados)', kNum(biz.total) ? `${kFmt(biz.published)} / ${kFmt(biz.verified)}` : null,
      t('ops.impact.businessesDetail', 'Total {total} · fichas completas {complete} · completitud media {avg}', { total: kFmt(biz.total), complete: kFmt(biz.complete_profiles), avg: kFmt(biz.avg_profile_completion_pct, ' %') }), 'businesses · v_business_completion_score'));
    const cat = k.catalog || {};
    grid.append(impactCard('ops.impact.catalog', 'Destinos y experiencias publicados', `${kFmt(cat.destinations_published)} / ${kFmt(cat.experiences_published)}`,
      t('ops.impact.catalogDetail', 'Destinos con fuente: {src} · municipios: {m}', { src: kFmt(cat.destinations_with_source), m: kFmt(cat.municipalities) }), 'destinations · experiences'));
    const reservations = k.reservations || {};
    const resTotal = Object.values(reservations).reduce((a, b) => a + Number(b || 0), 0);
    grid.append(impactCard('ops.impact.reservations', 'Solicitudes de reserva', resTotal || null,
      Object.keys(reservations).map((key) => `${key}: ${reservations[key]}`).join(' · ') || null, 'reservations'));
    const conv = k.commercial_conversion || {};
    grid.append(impactCard('ops.impact.conversion', 'Conversión comercial', conv.status === 'ok' ? kFmt(conv.value_pct, ' %') : null,
      conv.status === 'ok' ? t('ops.impact.conversionDetail', '{num} de {den} actores expuestos · {total} acciones', { num: kFmt(conv.numerator_actors_with_qualified_action), den: kFmt(conv.denominator_exposed_actors), total: kFmt(conv.qualified_actions_total) }) : conv.definition,
      'commercial_actions / analytics_events', conv.status));
    const fb = k.feedback || {};
    grid.append(impactCard('ops.impact.feedback', 'Valoración positiva', fb.status === 'ok' ? kFmt(fb.positive_pct, ' %') : null,
      fb.status === 'ok' ? t('ops.impact.feedbackDetail', '{pos} de {total} evaluaciones (≥ 4) · promedio {avg}', { pos: kFmt(fb.positive), total: kFmt(fb.total), avg: kFmt(fb.avg_rating) }) : null, 'user_feedback', fb.status));
    const baqui = k.baqui || {};
    grid.append(impactCard('ops.impact.baqui', 'Uso de BAQUI', baqui.status === 'ok' ? kFmt(baqui.answers) : null,
      baqui.status === 'ok' ? t('ops.impact.baquiDetail', '{s} sesiones · latencia media {l} · {src} respuestas con fuente', { s: kFmt(baqui.sessions), l: kFmt(baqui.avg_latency_ms, ' ms'), src: kFmt(baqui.answers_with_sources) }) : null,
      'ai_sessions · ai_messages · ai_message_sources', baqui.status));
    const resp = k.responsible_offer || {};
    grid.append(impactCard('ops.impact.responsible', 'Oferta con criterios responsables', resp.status === 'ok' ? kFmt(resp.value_pct, ' %') : null,
      resp.status === 'ok' ? `${kFmt(resp.numerator)} / ${kFmt(resp.denominator)}` : resp.definition, 'businesses · experiences (sustainability_attributes)', resp.status));
    wrap.append(grid);

    if (health) {
      const s = health.structure || {};
      const q = health.data_quality || {};
      const hb = el('div', 'ops-impact-health');
      hb.append(el('h4', 'ops-impact-subtitle', t('ops.impact.dbHealth', 'Salud de la base de datos')));
      const list = el('ul', 'ops-impact-health-list');
      const line = (key, label, value, warn) => {
        const li = el('li', warn ? 'is-warn' : '');
        li.append(el('span', '', t(key, label)), el('strong', '', String(value)));
        list.append(li);
      };
      line('ops.impact.tables', 'Tablas', s.tables);
      line('ops.impact.rls', 'Tablas con RLS', `${s.rls_enabled}/${s.tables}`, s.rls_enabled !== s.tables);
      line('ops.impact.fks', 'Claves foráneas', s.foreign_keys);
      line('ops.impact.indexes', 'Índices', s.indexes);
      line('ops.impact.noSource', 'Contenido publicado sin fuente', q.content_published_without_source, q.content_published_without_source > 0);
      line('ops.impact.noCoords', 'Negocios sin coordenadas', q.businesses_without_coordinates, q.businesses_without_coordinates > 0);
      line('ops.impact.sharedPhones', 'Teléfonos repetidos entre negocios', q.shared_business_phones, q.shared_business_phones > 0);
      line('ops.impact.duplicates', 'Posibles duplicados (negocios / destinos)', `${q.possible_duplicate_businesses} / ${q.possible_duplicate_destinations}`, (q.possible_duplicate_businesses + q.possible_duplicate_destinations) > 0);
      line('ops.impact.orphanProfiles', 'Perfiles sin usuario de Auth', q.profiles_without_auth_user, q.profiles_without_auth_user > 0);
      line('ops.impact.pendingVerifications', 'Verificaciones pendientes', (health.operations || {}).pending_verifications);
      hb.append(list);
      hb.append(el('small', 'ops-impact-source', `${t('ops.impact.source', 'Fuente')}: db_health_report()`));
      wrap.append(hb);
    }
    return wrap;
  }

  async function renderImpact() {
    const view = document.getElementById('view-26-analitica');
    if (!view || impactState.loading) return;
    if (!currentUser()) { mount('view-26-analitica', el('p', 'ops-impact-note', t('ops.impact.signIn', 'Iniciá sesión para ver los indicadores.')), 'opsLiveImpact'); return; }
    impactState.loading = true;
    mount('view-26-analitica', impactView(null, null), 'opsLiveImpact');
    try {
      const to = new Date();
      const from = new Date(to.getTime() - impactState.days * 86400000);
      const [kpis, health] = await Promise.all([
        call('kpis', { from: from.toISOString(), to: to.toISOString() }),
        call('db_health').catch(() => null),
      ]);
      mount('view-26-analitica', impactView(kpis.report, health && health.report), 'opsLiveImpact');
    } catch (error) {
      mount('view-26-analitica', el('p', 'ops-impact-note is-error', t('ops.impact.error', 'No se pudieron calcular los indicadores: {error}', { error: error.message })), 'opsLiveImpact');
    } finally {
      impactState.loading = false;
    }
  }

  window.BaqueanoOpsData = { call, callSos, callReservations, refresh, loadTab, manages, save, setStatus, verify, onSignedIn, renderAudit, renderHealth, renderSos, renderReservations, renderImpact, state, TABS };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})(window, document);
