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
// 📦 QUÉ: window.BaqueanoOpsData = { call, refresh, loadTab, manages, save,
//   setStatus, verify, state }.
// ============================================================================
(function (window, document) {
  'use strict';

  const ENDPOINT = 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-ops';
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

  async function call(action, payload) {
    const user = currentUser();
    if (!user) throw new Error('Sin sesión administrativa.');
    const token = await user.getIdToken();
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(ENDPOINT, {
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
    window.setInterval(() => { if (!document.hidden && currentUser()) refresh(); }, REFRESH_MS);
    document.addEventListener('click', (event) => {
      const target = event.target.closest && event.target.closest('#btnOpsSyncAll, [data-tab="27-auditoria"]');
      if (!target || !currentUser()) return;
      if (target.id === 'btnOpsSyncAll') refresh({ force: true, health: true });
      else window.setTimeout(renderAudit, 0); // después de que el motor dibuje la vista
    });
  }

  window.BaqueanoOpsData = { call, refresh, loadTab, manages, save, setStatus, verify, onSignedIn, renderAudit, renderHealth, state, TABS };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})(window, document);
