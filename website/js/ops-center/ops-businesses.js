// ============================================================================
// 🧭 BAQUEANO OPS CENTER — GESTIÓN INTEGRAL DE NEGOCIOS & ALIADOS (ops-businesses.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una consola ejecutiva, soberana y dedicada para la gestión del ecosistema
//   de negocios comunitarios y anfitriones aliados (#08-negocios), erradicando el uso
//   erróneo de etiquetas y placeholders de catálogo turístico genérico (playas, volcanes,
//   Cañón de Somoto) en favor de campos comerciales auténticos (anfitrión responsable,
//   rubro comercial, contacto directo, WhatsApp sin intermediarios, coordenadas, historia,
//   servicio de pasadía y tarifas con córdobas primero).
// - Facultar al personal administrativo para Agregar, Editar, Suspender (pausar visibilidad)
//   o Eliminar (archivar con trazabilidad en Supabase y Firestore) cualquier negocio aliado,
//   con confirmaciones de seguridad y sin recargar la página.
// - Cumplir con la Regla 11 del Propietario (2026-10-07): "Precios: córdobas primero, luego
//   dólares", usando la tasa de cambio de referencia C$ 36.6243 por US$ 1.
// - Garantizar auditoría inmutable bajo Ley 1210 / Ley 1211 para la asignación y revocación
//   del Sello Oficial de Verificación ("Check Azul").
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Arquitectura híbrida y reactiva: Operaciones directas vía `BaqueanoOpsData` conectada a
//   la Edge Function `baqueano-ops` (Supabase PostgreSQL como fuente principal de verdad) y
//   Dual-Write atómico a Cloud Firestore (`businesses`) con actualización inmediata en memoria
//   (Zero Latency UI) sobre `OpsState.collectionsData['08-negocios']`.
// - Soporte completo del ciclo de vida comercial:
//   * Agregar: Formulario limpio con valores por defecto adecuados y validaciones de datos.
//   * Editar: Carga exhaustiva de todos los metadatos comerciales, territoriales y multimedia.
//   * Suspender / Reactivar: Acción atómica en 1 clic que conmuta entre `published` y `draft`
//     con confirmación modal explicativa.
//   * Eliminar / Archivar: Borrado lógico seguro (`archive`) con confirmación defensiva.
// - Interfaz de alta gama técnica bajo la paleta oficial de BAQUEANO (#165D6F, #F65E01,
//   #F4E6C1, #0F172A), microinteracciones fluidas, tabs organizados y drawer off-canvas dedicado.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & API PÚBLICA):
// - window.BaqueanoOpsBusinesses = {
//     render(panel),
//     openDrawer(businessOrId),
//     closeDrawer(),
//     saveBusiness(),
//     toggleBusinessStatus(businessId),
//     deleteBusiness(businessId),
//     toggleVerified(businessId),
//     setFilterStatus(status),
//     setFilterDepartment(department),
//     search(query),
//     switchDrawerTab(tabName),
//     calculateUsdPrice(),
//     handleImageUpload(file)
//   };
// ============================================================================

(function (window, document) {
  'use strict';

  // i18n de la interfaz del Ops Center (claves ops.<módulo>.*; respaldo en español si falta la traducción).
  function i18n(key, fallback, vars) {
    var out = fallback;
    try { if (window.BaqueanoLanguage && window.BaqueanoLanguage.t) out = window.BaqueanoLanguage.t(key, { fallback: fallback }) || fallback; } catch (_) { out = fallback; }
    return String(out).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; });
  }
  // Valor de atributo HTML ya entre comillas (title=${q(…)}); escapa comillas dobles.
  function q(value) { return '"' + String(value == null ? '' : value).replace(/"/g, '&quot;') + '"'; }

  // Tasa oficial de referencia del proyecto (Regla 11: Córdobas primero, verificado 2026-10-01)
  const FX_RATE_USD_NIO = 36.6243;

  // Categorías comerciales oficiales de BAQUEANO
  const BUSINESS_CATEGORIES = [
    { id: 'hospedaje', label: 'Hospedaje Campesino / Ecolodge / Cabaña', icon: 'fa-bed', color: '#165D6F' },
    { id: 'comedor', label: 'Comedor Típico / Restaurante / Gastronomía', icon: 'fa-utensils', color: '#F65E01' },
    { id: 'guia', label: 'Guía Nativo / Tour Operador Local / Excursiones', icon: 'fa-person-hiking', color: '#10B981' },
    { id: 'transporte', label: 'Transporte Rural / Lacustre / Comunitario', icon: 'fa-van-shuttle', color: '#38BDF8' },
    { id: 'artesano', label: 'Artesanías / Talleres Vivos / Cultura', icon: 'fa-palette', color: '#A855F7' },
    { id: 'finca', label: 'Agroturismo / Finca Familiar / Café & Cacao', icon: 'fa-seedling', color: '#84CC16' },
    { id: 'cooperativa', label: 'Cooperativa Ecoturística Comunitaria', icon: 'fa-people-group', color: '#F59E0B' },
    { id: 'emprendimiento', label: 'Emprendimiento Comunitario Diverso', icon: 'fa-store', color: '#0EA5E9' }
  ];

  // Territorios oficiales de Nicaragua (15 departamentos + 2 regiones autónomas)
  const NICARAGUA_DEPARTMENTS = [
    'Boaco', 'Carazo', 'Chinandega', 'Chontales', 'Estelí', 'Granada', 'Jinotega',
    'León', 'Madriz', 'Managua', 'Masaya', 'Matagalpa', 'Nueva Segovia',
    'Rivas', 'Río San Juan', 'RACCN', 'RACCS'
  ];

  // Estado interno del módulo
  const state = {
    activeStatusFilter: 'all',
    activeDepartmentFilter: 'all',
    searchQuery: '',
    editingBusinessId: null,
    isSubmitting: false,
    activeDrawerTab: 'general'
  };

  // --------------------------------------------------------------------------
  // Utilidades y Helpers
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

  function getBusinessesCollection() {
    if (window.BaqueanoOpsEngine && window.BaqueanoOpsEngine.getCollection) {
      const items = window.BaqueanoOpsEngine.getCollection('08-negocios');
      if (Array.isArray(items) && items.length > 0) return items;
    }
    if (window.OpsState && window.OpsState.collectionsData && Array.isArray(window.OpsState.collectionsData['08-negocios'])) {
      return window.OpsState.collectionsData['08-negocios'];
    }
    return [];
  }

  function getCategoryMeta(catKey) {
    if (!catKey) return BUSINESS_CATEGORIES[7]; // Emprendimiento
    const clean = String(catKey).toLowerCase().trim();
    const found = BUSINESS_CATEGORIES.find(c => c.id === clean || clean.includes(c.id));
    if (found) return found;
    return { id: 'general', label: catKey, icon: 'fa-store', color: 'var(--bq-secondary)' };
  }

  function formatMoney(amountNio, amountUsd) {
    const nio = Number(amountNio);
    const usd = Number(amountUsd);
    const hasNio = Number.isFinite(nio) && nio > 0;
    const hasUsd = Number.isFinite(usd) && usd > 0;

    if (!hasNio && !hasUsd) {
      return '<span style="color: var(--ops-text-muted); font-size: 0.82rem;">Tarifa a consultar</span>';
    }

    if (hasNio && hasUsd) {
      return `<strong style="color: #F4E6C1; font-size: 0.88rem;">C$ ${nio.toLocaleString('es-NI')}</strong> <span style="font-size: 0.76rem; color: var(--ops-text-muted);">(≈ $${usd.toFixed(2)} USD)</span>`;
    }

    if (hasNio) {
      const equivUsd = (nio / FX_RATE_USD_NIO).toFixed(2);
      return `<strong style="color: #F4E6C1; font-size: 0.88rem;">C$ ${nio.toLocaleString('es-NI')}</strong> <span style="font-size: 0.76rem; color: var(--ops-text-muted);">(≈ $${equivUsd} USD)</span>`;
    }

    const equivNio = Math.round(usd * FX_RATE_USD_NIO);
    return `<strong style="color: #F4E6C1; font-size: 0.88rem;">C$ ${equivNio.toLocaleString('es-NI')}</strong> <span style="font-size: 0.76rem; color: var(--ops-text-muted);">(Orig. $${usd.toFixed(2)} USD)</span>`;
  }

  // --------------------------------------------------------------------------
  // 1. RENDERIZADO DEL PANEL PRINCIPAL (#view-08-negocios)
  // --------------------------------------------------------------------------
  function render(panel) {
    if (!panel) panel = document.getElementById('view-08-negocios');
    if (!panel) return;

    const allBusinesses = getBusinessesCollection();

    // Contadores de KPIs
    const totalCount = allBusinesses.length;
    const publishedCount = allBusinesses.filter(b => (b.status || 'published') === 'published').length;
    const verifiedCount = allBusinesses.filter(b => b.verified === true || b.verificationStatus === 'verified').length;
    const pendingCount = allBusinesses.filter(b => b.status === 'pending_review' || b.status === 'pending').length;
    const draftCount = allBusinesses.filter(b => b.status === 'draft' || b.status === 'suspended').length;
    const archivedCount = allBusinesses.filter(b => b.status === 'archived' || b.status === 'trashed').length;

    // Filtrado interactivo
    let filtered = allBusinesses.filter(b => {
      // Filtro de estado
      const st = b.status || 'published';
      if (state.activeStatusFilter === 'published' && st !== 'published') return false;
      if (state.activeStatusFilter === 'verified' && !(b.verified === true || b.verificationStatus === 'verified')) return false;
      if (state.activeStatusFilter === 'pending' && st !== 'pending_review' && st !== 'pending') return false;
      if (state.activeStatusFilter === 'draft' && st !== 'draft' && st !== 'suspended') return false;
      if (state.activeStatusFilter === 'archived' && st !== 'archived' && st !== 'trashed') return false;
      if (state.activeStatusFilter === 'all' && (st === 'archived' || st === 'trashed')) return false;

      // Filtro de departamento
      if (state.activeDepartmentFilter !== 'all') {
        const dept = String(b.department || '').toLowerCase();
        if (!dept.includes(state.activeDepartmentFilter.toLowerCase())) return false;
      }

      // Filtro de búsqueda en tiempo real
      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        const searchable = `${b.name || ''} ${b.title || ''} ${b.hostName || b.host_name || ''} ${b.category || ''} ${b.municipality || ''} ${b.department || ''} ${b.phone || ''} ${b.whatsapp || ''}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      return true;
    });

    panel.innerHTML = `
      <!-- Encabezado de Vista -->
      <div class="ops-view-header">
        <div class="ops-view-title-group">
          <h1>
            <i class="fa-solid fa-store" style="color: var(--bq-secondary);"></i>
            <span>Negocios Comunitarios &amp; Anfitriones Aliados</span>
          </h1>
          <p class="ops-view-subtitle">
            CENTRO DE MANDO COMERCIAL · AUDITORÍA, REVISIÓN, SUSPENSIÓN Y PUBLICACIÓN BAJO LEY 1210 / LEY 1211
          </p>
        </div>
        <div class="ops-view-actions">
          <button type="button" class="btn-ops-matte accent" onclick="window.BaqueanoOpsBusinesses.openDrawer()">
            <i class="fa-solid fa-plus"></i> Nuevo Negocio
          </button>
        </div>
      </div>

      <!-- Tarjetas de Métricas Ejecutivas (KPIs) -->
      <div class="ops-kpi-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        <div class="ops-kpi-card" style="background: var(--ops-surface-1); border: 1px solid var(--ops-border-subtle); border-radius: var(--ops-radius-md); padding: 1.15rem; display: flex; align-items: center; gap: 1rem;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(22, 93, 111, 0.2); border: 1px solid rgba(22, 93, 111, 0.4); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; color: #38BDF8;">
            <i class="fa-solid fa-store"></i>
          </div>
          <div>
            <div style="font-size: 1.5rem; font-weight: 800; color: #FFFFFF; line-height: 1.1;">${totalCount}</div>
            <div style="font-size: 0.78rem; color: var(--ops-text-muted); margin-top: 0.2rem;">Total Registrados</div>
          </div>
        </div>

        <div class="ops-kpi-card" style="background: var(--ops-surface-1); border: 1px solid var(--ops-border-subtle); border-radius: var(--ops-radius-md); padding: 1.15rem; display: flex; align-items: center; gap: 1rem;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.4); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; color: #10B981;">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <div>
            <div style="font-size: 1.5rem; font-weight: 800; color: #10B981; line-height: 1.1;">${publishedCount}</div>
            <div style="font-size: 0.78rem; color: var(--ops-text-muted); margin-top: 0.2rem;">Publicados / Activos</div>
          </div>
        </div>

        <div class="ops-kpi-card" style="background: var(--ops-surface-1); border: 1px solid var(--ops-border-subtle); border-radius: var(--ops-radius-md); padding: 1.15rem; display: flex; align-items: center; gap: 1rem;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(0, 186, 242, 0.2); border: 1px solid rgba(0, 186, 242, 0.4); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; color: #00BAF2;">
            <i class="fa-solid fa-certificate"></i>
          </div>
          <div>
            <div style="font-size: 1.5rem; font-weight: 800; color: #00BAF2; line-height: 1.1;">${verifiedCount}</div>
            <div style="font-size: 0.78rem; color: var(--ops-text-muted); margin-top: 0.2rem;">Con Sello Verificado</div>
          </div>
        </div>

        <div class="ops-kpi-card" style="background: var(--ops-surface-1); border: 1px solid var(--ops-border-subtle); border-radius: var(--ops-radius-md); padding: 1.15rem; display: flex; align-items: center; gap: 1rem;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(245, 158, 11, 0.2); border: 1px solid rgba(245, 158, 11, 0.4); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; color: #F59E0B;">
            <i class="fa-solid fa-clock-rotate-left"></i>
          </div>
          <div>
            <div style="font-size: 1.5rem; font-weight: 800; color: #F59E0B; line-height: 1.1;">${pendingCount}</div>
            <div style="font-size: 0.78rem; color: var(--ops-text-muted); margin-top: 0.2rem;">En Revisión</div>
          </div>
        </div>

        <div class="ops-kpi-card" style="background: var(--ops-surface-1); border: 1px solid var(--ops-border-subtle); border-radius: var(--ops-radius-md); padding: 1.15rem; display: flex; align-items: center; gap: 1rem;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; color: #EF4444;">
            <i class="fa-solid fa-pause"></i>
          </div>
          <div>
            <div style="font-size: 1.5rem; font-weight: 800; color: #FCA5A5; line-height: 1.1;">${draftCount}</div>
            <div style="font-size: 0.78rem; color: var(--ops-text-muted); margin-top: 0.2rem;">Suspendidos / Borrador</div>
          </div>
        </div>
      </div>

      <!-- Barra de Filtros y Búsqueda -->
      <div class="ops-crud-toolbar" style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem;">
        <div class="ops-filter-group" style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;">
          <button type="button" class="ops-filter-pill ${state.activeStatusFilter === 'all' ? 'is-active' : ''}" onclick="window.BaqueanoOpsBusinesses.setFilterStatus('all')">
            Todos <span class="ops-filter-count">${totalCount - archivedCount}</span>
          </button>
          <button type="button" class="ops-filter-pill ${state.activeStatusFilter === 'published' ? 'is-active' : ''}" onclick="window.BaqueanoOpsBusinesses.setFilterStatus('published')">
            Publicados <span class="ops-filter-count">${publishedCount}</span>
          </button>
          <button type="button" class="ops-filter-pill ${state.activeStatusFilter === 'verified' ? 'is-active' : ''}" onclick="window.BaqueanoOpsBusinesses.setFilterStatus('verified')">
            Verificados <span class="ops-filter-count">${verifiedCount}</span>
          </button>
          <button type="button" class="ops-filter-pill ${state.activeStatusFilter === 'pending' ? 'is-active' : ''}" onclick="window.BaqueanoOpsBusinesses.setFilterStatus('pending')">
            En Revisión <span class="ops-filter-count">${pendingCount}</span>
          </button>
          <button type="button" class="ops-filter-pill ${state.activeStatusFilter === 'draft' ? 'is-active' : ''}" onclick="window.BaqueanoOpsBusinesses.setFilterStatus('draft')">
            Suspendidos <span class="ops-filter-count">${draftCount}</span>
          </button>
          <button type="button" class="ops-filter-pill ${state.activeStatusFilter === 'archived' ? 'is-active' : ''}" onclick="window.BaqueanoOpsBusinesses.setFilterStatus('archived')">
            Archivados <span class="ops-filter-count">${archivedCount}</span>
          </button>

          <!-- Filtro de Departamento -->
          <select class="ops-form-select" style="max-width: 190px; padding: 0.35rem 0.75rem; font-size: 0.82rem;" onchange="window.BaqueanoOpsBusinesses.setFilterDepartment(this.value)">
            <option value="all" ${state.activeDepartmentFilter === 'all' ? 'selected' : ''}>Todos los Departamentos</option>
            ${NICARAGUA_DEPARTMENTS.map(d => `<option value="${escapeHtml(d)}" ${state.activeDepartmentFilter === d ? 'selected' : ''}>${escapeHtml(d)}</option>`).join('')}
          </select>
        </div>

        <div class="ops-search-input-wrap" style="flex: 1; max-width: 360px;">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" class="ops-filter-search-input" id="opsBusinessSearchInput"
            placeholder=i18n('ops.businesses.buscarPorNegocioAnfitrion', 'Buscar por negocio, anfitrión, municipio o teléfono...')
            value="${escapeHtml(state.searchQuery)}"
            oninput="window.BaqueanoOpsBusinesses.search(this.value)">
        </div>
      </div>

      <!-- Tabla de Negocios & Aliados -->
      <div class="ops-table-wrap">
        <table class="ops-table-matte">
          <thead>
            <tr>
              <th style="width: 290px;">Negocio Comercial &amp; Anfitrión</th>
              <th>Rubro / Categoría</th>
              <th>Territorio &amp; Contacto</th>
              <th>Tarifa (C$ Primero)</th>
              <th>Estado</th>
              <th style="text-align: right; width: 180px;">Acciones Operativas</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="6" style="text-align: center; padding: 3rem 1.5rem;">
                  <div class="ops-empty-state">
                    <i class="fa-solid fa-store-slash ops-empty-icon" style="font-size: 2.2rem; color: var(--ops-text-muted); margin-bottom: 0.75rem;"></i>
                    <div class="ops-empty-title" style="color: #fff; font-size: 1.05rem; font-weight: 700;">No se encontraron negocios</div>
                    <div class="ops-empty-desc" style="color: var(--ops-text-secondary); font-size: 0.85rem; margin-top: 0.35rem;">
                      No hay registros que coincidan con la búsqueda o el filtro aplicado.
                    </div>
                    <button type="button" class="btn-ops-matte primary" style="margin-top: 1.25rem;" onclick="window.BaqueanoOpsBusinesses.openDrawer()">
                      <i class="fa-solid fa-plus"></i> Registrar Primer Negocio Aliado
                    </button>
                  </div>
                </td>
              </tr>
            ` : filtered.map(item => renderBusinessRow(item)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Renderizar fila individual de la tabla
  function renderBusinessRow(item) {
    const title = item.name || item.title || 'Negocio Sin Nombre';
    const host = item.hostName || item.host_name || 'Anfitrión Comunitario';
    const categoryMeta = getCategoryMeta(item.category);
    const department = item.department || 'Nicaragua';
    const municipality = item.municipality || '';
    const phone = item.phone || '';
    const whatsapp = item.whatsapp || phone || '';
    const isVerified = item.verified === true || item.verificationStatus === 'verified';
    const status = ['published', 'draft', 'suspended', 'pending_review', 'pending', 'archived', 'trashed'].includes(item.status) ? item.status : 'published';
    const isSuspended = status === 'draft' || status === 'suspended';
    const isArchived = status === 'archived' || status === 'trashed';
    const isDayPass = Boolean(item.dayPass || item.day_pass_available);
    const isHiddenGem = Boolean(item.hiddenGem || item.hidden_gem);
    const image = item.imageUrl || item.cover_image || '';

    // Estado badge
    let statusLabel = 'Publicado';
    let statusPillClass = 'published';
    let statusIcon = 'fa-circle-check';
    let statusColor = '#10B981';

    if (isSuspended) {
      statusLabel = 'Suspendido';
      statusPillClass = 'draft';
      statusIcon = 'fa-pause';
      statusColor = '#F59E0B';
    } else if (status === 'pending_review' || status === 'pending') {
      statusLabel = 'En Revisión';
      statusPillClass = 'draft';
      statusIcon = 'fa-clock';
      statusColor = '#38BDF8';
    } else if (isArchived) {
      statusLabel = 'Archivado';
      statusPillClass = 'archived';
      statusIcon = 'fa-box-archive';
      statusColor = '#94A3B8';
    }

    const priceHtml = formatMoney(item.priceNio, item.priceUsd);

    return `
      <tr class="ops-table-row">
        <!-- 1. Negocio & Anfitrión -->
        <td>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 44px; height: 44px; border-radius: 8px; background: var(--ops-surface-2); border: 1px solid var(--ops-border-subtle); display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.25);">
              ${image ? `<img src="${escapeHtml(image)}" style="width: 100%; height: 100%; object-fit: cover;" alt="" referrerpolicy="no-referrer">` : `<i class="fa-solid fa-store" style="color: var(--ops-text-muted); font-size: 1.1rem;"></i>`}
            </div>
            <div style="display: flex; flex-direction: column; min-width: 0;">
              <span style="font-weight: 700; color: #FFFFFF; font-size: 0.92rem; display: flex; align-items: center; gap: 0.35rem;">
                ${escapeHtml(title)}
                ${isVerified ? `<span title=${q(i18n('ops.businesses.verificadoOficialmenteSelloAutentico', 'Verificado Oficialmente (Sello Auténtico BAQUEANO)'))} style="color: #00BAF2; font-size: 0.85rem;"><i class="fa-solid fa-circle-check"></i></span>` : ''}
              </span>
              <span style="font-size: 0.78rem; color: var(--ops-text-secondary); display: flex; align-items: center; gap: 0.35rem; margin-top: 0.15rem;">
                <i class="fa-solid fa-user-tag" style="font-size: 0.72rem; color: var(--bq-accent);"></i> ${escapeHtml(host)}
              </span>
              <div style="display: flex; gap: 0.35rem; margin-top: 0.25rem;">
                ${isDayPass ? `<span style="font-size: 0.68rem; background: rgba(246, 94, 1, 0.15); color: #F65E01; border: 1px solid rgba(246, 94, 1, 0.35); padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: 700;">Day Pass</span>` : ''}
                ${isHiddenGem ? `<span style="font-size: 0.68rem; background: rgba(244, 230, 193, 0.12); color: #F4E6C1; border: 1px solid rgba(244, 230, 193, 0.3); padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: 700;">Joya Oculta</span>` : ''}
              </div>
            </div>
          </div>
        </td>

        <!-- 2. Rubro Comercial -->
        <td>
          <span style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.65rem; border-radius: 6px; font-size: 0.78rem; font-weight: 700; background: rgba(22, 93, 111, 0.2); color: #38BDF8; border: 1px solid rgba(56, 189, 248, 0.35);" title=${q(`${escapeHtml(categoryMeta.label)}`)}>
            <i class="fa-solid ${categoryMeta.icon}"></i>
            <span>${escapeHtml(categoryMeta.label.split('/')[0].trim())}</span>
          </span>
        </td>

        <!-- 3. Territorio & Contacto -->
        <td>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.84rem; color: #FFFFFF; display: flex; align-items: center; gap: 0.3rem;">
              <i class="fa-solid fa-location-dot" style="color: var(--bq-accent); font-size: 0.78rem;"></i>
              ${escapeHtml(municipality ? `${municipality}, ${department}` : department)}
            </span>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem;">
              ${whatsapp ? `
                <a href="https://wa.me/505${escapeHtml(whatsapp.replace(/[^\d]/g, ''))}" target="_blank" rel="noopener noreferrer" style="font-size: 0.76rem; color: #10B981; text-decoration: none; display: flex; align-items: center; gap: 0.25rem;" title=${q(i18n('ops.businesses.abrirWhatsappDirectoCon', 'Abrir WhatsApp directo con {p0}', { p0: (escapeHtml(title)) }))}>
                  <i class="fa-brands fa-whatsapp"></i> ${escapeHtml(whatsapp)}
                </a>
              ` : (phone ? `<span style="font-size: 0.76rem; color: var(--ops-text-muted);"><i class="fa-solid fa-phone"></i> ${escapeHtml(phone)}</span>` : '<span style="font-size: 0.75rem; color: var(--ops-text-muted);">Sin contacto directo</span>')}
            </div>
          </div>
        </td>

        <!-- 4. Tarifas (C$ Primero) -->
        <td>
          ${priceHtml}
        </td>

        <!-- 5. Estado Operativo -->
        <td>
          <span class="ops-badge-pill ${statusPillClass}" style="display: inline-flex; align-items: center; gap: 0.35rem;">
            <i class="fa-solid ${statusIcon}" style="color: ${statusColor};"></i>
            <span>${statusLabel}</span>
          </span>
        </td>

        <!-- 6. Acciones Operativas -->
        <td>
          <div class="ops-table-actions" style="justify-content: flex-end; gap: 0.35rem;">
            <!-- Sello Verificado Toggle -->
            <button type="button" class="btn-ops-icon" title=${q(isVerified ? i18n('ops.businesses.sealActiveManage', 'Sello Verificado Activo (Clic para gestionar)') : i18n('ops.businesses.sealGrant', 'Acreditar Sello Oficial BAQUEANO'))} onclick="window.BaqueanoOpsBusinesses.toggleVerified('${escapeHtml(item.id)}')">
              <i class="fa-solid fa-circle-check" style="${isVerified ? 'color: #00BAF2;' : 'color: var(--ops-text-muted);'}"></i>
            </button>

            <!-- Editar Negocio -->
            <button type="button" class="btn-ops-icon" title=${q(i18n('ops.businesses.editarDatosComercialesContacto', 'Editar datos comerciales, contacto y territorio'))} onclick="window.BaqueanoOpsBusinesses.openDrawer('${escapeHtml(item.id)}')">
              <i class="fa-solid fa-pen-to-square" style="color: #38BDF8;"></i>
            </button>

            <!-- Suspender / Reactivar Negocio -->
            ${!isArchived ? `
              <button type="button" class="btn-ops-icon" title=${q(isSuspended ? i18n('ops.businesses.reactivatePublish', 'Reactivar / Publicar Negocio') : i18n('ops.businesses.suspendHide', 'Suspender Negocio (Ocultar temporalmente)'))} onclick="window.BaqueanoOpsBusinesses.toggleBusinessStatus('${escapeHtml(item.id)}')">
                <i class="fa-solid ${isSuspended ? 'fa-play' : 'fa-pause'}" style="color: ${isSuspended ? '#10B981' : '#F59E0B'};"></i>
              </button>
            ` : `
              <button type="button" class="btn-ops-icon" title=${q(i18n('ops.businesses.restaurarDeLaPapelera', 'Restaurar de la papelera'))} onclick="window.BaqueanoOpsBusinesses.restoreBusiness('${escapeHtml(item.id)}')">
                <i class="fa-solid fa-rotate-left" style="color: #10B981;"></i>
              </button>
            `}

            <!-- Eliminar / Archivar Negocio -->
            <button type="button" class="btn-ops-icon danger" title=${q(i18n('ops.businesses.eliminarArchivarNegocio', 'Eliminar / Archivar Negocio'))} onclick="window.BaqueanoOpsBusinesses.deleteBusiness('${escapeHtml(item.id)}')">
              <i class="fa-solid fa-trash-can" style="color: #EF4444;"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  // --------------------------------------------------------------------------
  // 2. CONTROL DEL DRAWER DE NEGOCIOS (#opsBusinessDrawer)
  // --------------------------------------------------------------------------
  function openDrawer(businessOrId) {
    const drawer = document.getElementById('opsBusinessDrawer');
    if (!drawer) {
      console.error('[BaqueanoOpsBusinesses] Drawer #opsBusinessDrawer no encontrado en el DOM.');
      return;
    }

    let item = null;
    if (typeof businessOrId === 'string') {
      item = getBusinessesCollection().find(b => b.id === businessOrId);
    } else if (typeof businessOrId === 'object' && businessOrId !== null) {
      item = businessOrId;
    }

    state.editingBusinessId = item ? item.id : null;

    // Header del drawer
    const titleEl = document.getElementById('opsBizDrawerTitle');
    const subtitleEl = document.getElementById('opsBizDrawerSubtitle');
    const deleteBtn = document.getElementById('btnOpsBizDrawerDelete');
    const suspendBtn = document.getElementById('btnOpsBizDrawerSuspend');

    if (item) {
      if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-pen-to-square" style="color: var(--bq-accent);"></i> <span>${escapeHtml(i18n('ops.businesses.editTitle', 'Editar Negocio: {p0}', { p0: item.name || item.title }))}</span>`;
      if (subtitleEl) subtitleEl.textContent = i18n('ops.businesses.idActualizado', 'ID: {p0} · Actualizado: {p1}', { p0: (item.id), p1: (item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('es-NI') : 'Hoy') });
      if (deleteBtn) deleteBtn.style.display = 'inline-flex';
      if (suspendBtn) {
        suspendBtn.style.display = 'inline-flex';
        const isSusp = item.status === 'draft' || item.status === 'suspended';
        suspendBtn.innerHTML = isSusp ? '<i class="fa-solid fa-play"></i> Reactivar Negocio' : '<i class="fa-solid fa-pause"></i> Suspender Negocio';
        suspendBtn.className = isSusp ? 'btn-ops-matte' : 'btn-ops-matte danger';
      }
    } else {
      if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-store" style="color: var(--bq-secondary);"></i> <span>${escapeHtml(i18n('ops.businesses.newTitle', 'Nuevo Negocio & Aliado Comunitario'))}</span>`;
      if (subtitleEl) subtitleEl.textContent = i18n('ops.businesses.moduloNegociosComunitariosAnfitriones', 'Módulo: Negocios Comunitarios, Anfitriones y Emprendedores');
      if (deleteBtn) deleteBtn.style.display = 'none';
      if (suspendBtn) suspendBtn.style.display = 'none';
    }

    // Llenar campos del formulario
    document.getElementById('opsBizFormId').value = item ? item.id : '';
    document.getElementById('opsBizFormName').value = item ? (item.name || item.title || '') : '';
    document.getElementById('opsBizFormHost').value = item ? (item.hostName || item.host_name || '') : '';
    document.getElementById('opsBizFormCategory').value = item ? (item.category || 'comedor') : 'hospedaje';
    document.getElementById('opsBizFormStatus').value = item ? (item.status || 'published') : 'published';

    // Servicios destacados
    document.getElementById('opsBizFormDayPass').checked = Boolean(item && (item.dayPass === 'Sí' || item.day_pass_available));
    document.getElementById('opsBizFormHiddenGem').checked = Boolean(item && (item.hiddenGem || item.hidden_gem));
    document.getElementById('opsBizFormVerified').checked = Boolean(item && (item.verified === true || item.verificationStatus === 'verified'));

    // Ubicación
    document.getElementById('opsBizFormDepartment').value = item ? (item.department || 'Matagalpa') : 'Matagalpa';
    document.getElementById('opsBizFormMunicipality').value = item ? (item.municipality || '') : '';
    document.getElementById('opsBizFormAddress').value = item ? (item.address || '') : '';
    document.getElementById('opsBizFormLatitude').value = item && item.latitude != null ? item.latitude : '';
    document.getElementById('opsBizFormLongitude').value = item && item.longitude != null ? item.longitude : '';

    // Contacto
    document.getElementById('opsBizFormPhone').value = item ? (item.phone || '') : '';
    document.getElementById('opsBizFormWhatsapp').value = item ? (item.whatsapp || item.phone || '') : '';
    document.getElementById('opsBizFormEmail').value = item ? (item.email || '') : '';
    document.getElementById('opsBizFormWebsite').value = item ? (item.websiteUrl || item.website_url || item.website || '') : '';

    // Tarifas
    document.getElementById('opsBizFormPriceNio').value = item && item.priceNio ? item.priceNio : '';
    document.getElementById('opsBizFormPriceUsd').value = item && item.priceUsd ? item.priceUsd : '';

    // Historia campesina y descripción
    document.getElementById('opsBizFormStory').value = item ? (item.hostStory || item.host_story || '') : '';
    document.getElementById('opsBizFormDescription').value = item ? (item.description || '') : '';
    document.getElementById('opsBizFormImageUrl').value = item ? (item.imageUrl || item.cover_image || '') : '';

    // Vista previa de imagen
    updateImagePreview(item ? (item.imageUrl || item.cover_image || '') : '');

    // Resetear al primer tab (general)
    switchDrawerTab('general');

    drawer.classList.add('is-open');
  }

  function closeDrawer() {
    const drawer = document.getElementById('opsBusinessDrawer');
    if (drawer) drawer.classList.remove('is-open');
    state.editingBusinessId = null;
  }

  function switchDrawerTab(tabName) {
    state.activeDrawerTab = tabName;
    document.querySelectorAll('.ops-biz-tab-btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.getAttribute('data-biz-tab') === tabName);
    });
    document.querySelectorAll('.ops-biz-tab-pane').forEach(pane => {
      pane.classList.toggle('is-active', pane.id === `opsBizPane-${tabName}`);
    });
  }

  function updateImagePreview(url) {
    const previewBox = document.getElementById('opsBizImagePreviewBox');
    const previewImg = document.getElementById('opsBizImagePreviewImg');
    if (!previewBox || !previewImg) return;

    if (url && url.trim()) {
      previewImg.src = url.trim();
      previewBox.style.display = 'block';
    } else {
      previewBox.style.display = 'none';
      previewImg.src = '';
    }
  }

  function calculateUsdPrice() {
    const nioInput = document.getElementById('opsBizFormPriceNio');
    const usdInput = document.getElementById('opsBizFormPriceUsd');
    if (!nioInput || !usdInput) return;

    const nio = parseFloat(nioInput.value);
    if (Number.isFinite(nio) && nio > 0) {
      const calcUsd = (nio / FX_RATE_USD_NIO).toFixed(2);
      usdInput.value = calcUsd;
    }
  }

  // --------------------------------------------------------------------------
  // 3. PERSISTENCIA ATÓMICA DE NEGOCIOS (AGREGAR / MODIFICAR)
  // --------------------------------------------------------------------------
  async function saveBusiness() {
    if (state.isSubmitting) return;

    const nameInput = document.getElementById('opsBizFormName');
    const name = nameInput ? nameInput.value.trim() : '';

    if (!name) {
      if (window.OpsToast) window.OpsToast.show(i18n('ops.businesses.elNombreComercialDel', 'El Nombre Comercial del negocio es obligatorio.'), 'warning');
      else alert(i18n('ops.businesses.elNombreComercialDel', 'El Nombre Comercial del negocio es obligatorio.'));
      switchDrawerTab('general');
      if (nameInput) nameInput.focus();
      return;
    }

    const id = document.getElementById('opsBizFormId').value.trim() || undefined;
    const hostName = document.getElementById('opsBizFormHost').value.trim();
    const category = document.getElementById('opsBizFormCategory').value;
    const status = document.getElementById('opsBizFormStatus').value;
    const dayPass = document.getElementById('opsBizFormDayPass').checked;
    const hiddenGem = document.getElementById('opsBizFormHiddenGem').checked;
    const verified = document.getElementById('opsBizFormVerified').checked;

    const department = document.getElementById('opsBizFormDepartment').value;
    const municipality = document.getElementById('opsBizFormMunicipality').value.trim();
    const address = document.getElementById('opsBizFormAddress').value.trim();
    const latVal = parseFloat(document.getElementById('opsBizFormLatitude').value);
    const lngVal = parseFloat(document.getElementById('opsBizFormLongitude').value);
    const latitude = Number.isFinite(latVal) ? latVal : null;
    const longitude = Number.isFinite(lngVal) ? lngVal : null;

    const phone = document.getElementById('opsBizFormPhone').value.trim();
    const whatsapp = document.getElementById('opsBizFormWhatsapp').value.trim();
    const email = document.getElementById('opsBizFormEmail').value.trim();
    const websiteUrl = document.getElementById('opsBizFormWebsite').value.trim();

    const priceNio = parseFloat(document.getElementById('opsBizFormPriceNio').value) || null;
    const priceUsd = parseFloat(document.getElementById('opsBizFormPriceUsd').value) || null;

    const hostStory = document.getElementById('opsBizFormStory').value.trim();
    const description = document.getElementById('opsBizFormDescription').value.trim();
    const coverImage = document.getElementById('opsBizFormImageUrl').value.trim();

    // Payload normalizado para el ecosistema BAQUEANO
    const payload = {
      id: id,
      name: name,
      title: name,
      hostName: hostName,
      host_name: hostName,
      category: category,
      status: status,
      dayPass: dayPass ? 'Sí' : '',
      day_pass_available: dayPass,
      hiddenGem: hiddenGem,
      hidden_gem: hiddenGem,
      verified: verified,
      verificationStatus: verified ? 'verified' : 'unverified',
      department: department,
      municipality: municipality,
      address: address,
      latitude: latitude,
      longitude: longitude,
      phone: phone,
      whatsapp: whatsapp,
      email: email,
      websiteUrl: websiteUrl,
      website_url: websiteUrl,
      priceNio: priceNio,
      priceUsd: priceUsd,
      hostStory: hostStory,
      host_story: hostStory,
      description: description || hostStory,
      imageUrl: coverImage,
      cover_image: coverImage,
      updatedAt: new Date().toISOString()
    };

    const saveBtn = document.getElementById('btnOpsBizDrawerSave');
    state.isSubmitting = true;
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${escapeHtml(i18n('ops.common.saving', 'Guardando...'))}`;
    }

    try {
      // 1. Guardado a través del canal oficial de Supabase (BaqueanoOpsData / Edge Function baqueano-ops)
      if (window.BaqueanoOpsData && window.BaqueanoOpsData.manages('08-negocios')) {
        await window.BaqueanoOpsData.save('08-negocios', payload);
      } else if (window.OpsCMS && window.OpsCMS.saveEntity) {
        await window.OpsCMS.saveEntity('08-negocios', payload);
      }

      // 2. Dual-Write de respaldo en Cloud Firestore
      try {
        if (window.firebase && window.firebase.firestore) {
          const db = window.firebase.firestore();
          const targetId = payload.id || `biz_${Date.now()}`;
          await db.collection('businesses').doc(targetId).set(payload, { merge: true });
        }
      } catch (fbErr) {
        console.warn('[BaqueanoOpsBusinesses] Dual-Write Firestore secundario omitido:', fbErr.message);
      }

      // 3. Actualización Inmediata en Memoria (Zero Latency UI)
      if (window.OpsState && window.OpsState.collectionsData) {
        if (!window.OpsState.collectionsData['08-negocios']) window.OpsState.collectionsData['08-negocios'] = [];
        const list = window.OpsState.collectionsData['08-negocios'];
        const existingIdx = list.findIndex(b => b.id === payload.id);
        if (existingIdx >= 0) {
          list[existingIdx] = Object.assign({}, list[existingIdx], payload);
        } else {
          list.unshift(payload);
        }
      }

      if (window.OpsToast) {
        window.OpsToast.show(i18n('ops.businesses.negocioGuardadoExitosamente', 'Negocio \"{p0}\" guardado exitosamente.', { p0: (name) }), 'success');
      }

      closeDrawer();
      render();
    } catch (err) {
      console.error('[BaqueanoOpsBusinesses] Error al guardar negocio:', err);
      if (window.OpsToast) window.OpsToast.show(i18n('ops.businesses.errorAlGuardar', 'Error al guardar: {p0}', { p0: (err.message) }), 'error');
      else alert(i18n('ops.businesses.error', 'Error: {p0}', { p0: (err.message) }));
    } finally {
      state.isSubmitting = false;
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> ${escapeHtml(i18n('ops.businesses.saveBusiness', 'Guardar Negocio'))}`;
      }
    }
  }

  // --------------------------------------------------------------------------
  // 4. SUSPENSIÓN / REACTIVACIÓN DE NEGOCIOS
  // --------------------------------------------------------------------------
  async function toggleBusinessStatus(businessId) {
    if (!businessId && state.editingBusinessId) businessId = state.editingBusinessId;
    if (!businessId) return;

    const item = getBusinessesCollection().find(b => b.id === businessId);
    if (!item) return;

    const isCurrentSuspended = item.status === 'draft' || item.status === 'suspended';
    const actionLabel = isCurrentSuspended ? 'Reactivar y Publicar' : 'Suspender Temporalmente';
    const newStatus = isCurrentSuspended ? 'published' : 'draft';
    const op = isCurrentSuspended ? 'publish' : 'unpublish';

    const confirmed = await (window.OpsDialog ? window.OpsDialog.confirm({
      title: `¿${actionLabel} Negocio?`,
      message: isCurrentSuspended
        ? `El negocio "${item.name || item.title}" volverá a ser visible públicamente en el portal web y la app móvil Android.`
        : `El negocio "${item.name || item.title}" se ocultará de la web y la app móvil (pausa operativa campesina o revisión editorial).`,
      confirmText: actionLabel,
      isDangerous: !isCurrentSuspended
    }) : Promise.resolve(confirm(`¿Deseas ${actionLabel.toLowerCase()} este negocio?`)));

    if (!confirmed) return;

    try {
      // 1. Notificar a Supabase (baqueano-ops Edge Function)
      if (window.BaqueanoOpsData && window.BaqueanoOpsData.setStatus) {
        await window.BaqueanoOpsData.setStatus('08-negocios', businessId, op);
      }

      // 2. Dual-Write en Firestore
      try {
        if (window.firebase && window.firebase.firestore) {
          const db = window.firebase.firestore();
          await db.collection('businesses').doc(businessId).set({
            status: newStatus,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      } catch (_) {}

      // 3. Actualizar memoria local
      item.status = newStatus;
      item.updatedAt = new Date().toISOString();

      if (window.OpsToast) {
        window.OpsToast.show(i18n('ops.businesses.negocio', 'Negocio \"{p0}\" {p1}.', { p0: (item.name || item.title), p1: (isCurrentSuspended ? 'reactivado y publicado' : 'suspendido') }), 'success');
      }

      if (state.editingBusinessId === businessId) closeDrawer();
      render();
    } catch (err) {
      console.error('[BaqueanoOpsBusinesses] Error al cambiar estado:', err);
      if (window.OpsToast) window.OpsToast.show(i18n('ops.businesses.errorAlSuspenderReactivar', 'Error al suspender/reactivar: {p0}', { p0: (err.message) }), 'error');
    }
  }

  // --------------------------------------------------------------------------
  // 5. ELIMINACIÓN / ARCHIVO SEGURO DE NEGOCIOS
  // --------------------------------------------------------------------------
  async function deleteBusiness(businessId) {
    if (!businessId && state.editingBusinessId) businessId = state.editingBusinessId;
    if (!businessId) return;

    const item = getBusinessesCollection().find(b => b.id === businessId);
    if (!item) return;

    const confirmed = await (window.OpsDialog ? window.OpsDialog.confirm({
      title: '⚠️ ¿Archivar / Eliminar Negocio Aliado?',
      message: `El registro "${item.name || item.title}" se archivará de forma segura en Supabase y Firestore. Podrá ser recuperado desde la papelera o la auditoría del sistema.`,
      confirmText: 'Archivar Negocio',
      isDangerous: true
    }) : Promise.resolve(confirm(`¿Estás seguro de archivar el negocio "${item.name || item.title}"?`)));

    if (!confirmed) return;

    try {
      // 1. Supabase (borrado lógico archive)
      if (window.BaqueanoOpsData && window.BaqueanoOpsData.setStatus) {
        await window.BaqueanoOpsData.setStatus('08-negocios', businessId, 'archive');
      }

      // 2. Firestore
      try {
        if (window.firebase && window.firebase.firestore) {
          const db = window.firebase.firestore();
          await db.collection('businesses').doc(businessId).set({
            status: 'archived',
            deletedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      } catch (_) {}

      // 3. Actualizar memoria local
      item.status = 'archived';
      item.deleted_at = new Date().toISOString();

      if (window.OpsToast) {
        window.OpsToast.show(i18n('ops.businesses.negocioArchivadoConExito', 'Negocio \"{p0}\" archivado con éxito.', { p0: (item.name || item.title) }), 'success');
      }

      if (state.editingBusinessId === businessId) closeDrawer();
      render();
    } catch (err) {
      console.error('[BaqueanoOpsBusinesses] Error al archivar negocio:', err);
      if (window.OpsToast) window.OpsToast.show(i18n('ops.businesses.errorAlArchivar', 'Error al archivar: {p0}', { p0: (err.message) }), 'error');
    }
  }

  async function restoreBusiness(businessId) {
    if (!businessId) return;
    const item = getBusinessesCollection().find(b => b.id === businessId);
    if (!item) return;

    try {
      if (window.BaqueanoOpsData && window.BaqueanoOpsData.setStatus) {
        await window.BaqueanoOpsData.setStatus('08-negocios', businessId, 'restore');
      }

      try {
        if (window.firebase && window.firebase.firestore) {
          await window.firebase.firestore().collection('businesses').doc(businessId).set({
            status: 'draft',
            deletedAt: null,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      } catch (_) {}

      item.status = 'draft';
      item.deleted_at = null;

      if (window.OpsToast) window.OpsToast.show(i18n('ops.businesses.negocioRestauradoABorradores', 'Negocio \"{p0}\" restaurado a borradores.', { p0: (item.name || item.title) }), 'success');
      render();
    } catch (err) {
      if (window.OpsToast) window.OpsToast.show(i18n('ops.businesses.errorAlRestaurar', 'Error al restaurar: {p0}', { p0: (err.message) }), 'error');
    }
  }

  // --------------------------------------------------------------------------
  // 6. GESTIÓN DEL SELLO DE VERIFICACIÓN OFICIAL
  // --------------------------------------------------------------------------
  async function toggleVerified(businessId) {
    if (!businessId) return;
    const item = getBusinessesCollection().find(b => b.id === businessId);
    if (!item) return;

    const currentlyVerified = item.verified === true || item.verificationStatus === 'verified';

    // Si ya está verificado, confirmación para revocar
    if (currentlyVerified) {
      const confirmed = await (window.OpsDialog ? window.OpsDialog.confirm({
        title: '¿Revocar Sello de Verificación Oficial?',
        message: `El negocio "${item.name || item.title}" perderá la insignia verificada en la web y la app móvil.`,
        confirmText: 'Revocar Sello',
        isDangerous: true
      }) : Promise.resolve(confirm('¿Revocar verificación?')));

      if (!confirmed) return;

      try {
        if (window.BaqueanoOpsData && window.BaqueanoOpsData.verify) {
          await window.BaqueanoOpsData.verify('08-negocios', businessId, false);
        }
        item.verified = false;
        item.verificationStatus = 'unverified';
        if (window.OpsToast) window.OpsToast.show(i18n('ops.businesses.selloDeVerificacionRevocado', 'Sello de verificación revocado.'), 'warning');
        render();
      } catch (err) {
        if (window.OpsToast) window.OpsToast.show(i18n('ops.businesses.error', 'Error: {p0}', { p0: (err.message) }), 'error');
      }
      return;
    }

    // Si no está verificado, abrir diálogo de trazabilidad oficial
    if (window.BaqueanoOpsData && window.BaqueanoOpsData.verify) {
      try {
        await window.BaqueanoOpsData.verify('08-negocios', businessId, true);
        item.verified = true;
        item.verificationStatus = 'verified';
        render();
      } catch (err) {
        if (window.OpsToast) window.OpsToast.show(i18n('ops.businesses.errorAlVerificar', 'Error al verificar: {p0}', { p0: (err.message) }), 'error');
      }
    } else {
      item.verified = true;
      item.verificationStatus = 'verified';
      render();
    }
  }

  // --------------------------------------------------------------------------
  // 7. SUBIDA DE FOTOGRAFÍA / LOGOTIPO A STORAGE
  // --------------------------------------------------------------------------
  async function handleImageUpload(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (window.OpsToast) window.OpsToast.show(i18n('ops.businesses.elArchivoDebeSer', 'El archivo debe ser una imagen válida (JPG, PNG o WebP).'), 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      if (window.OpsToast) window.OpsToast.show(i18n('ops.businesses.laImagenSuperaEl', 'La imagen supera el límite permitido de 15 MB.'), 'error');
      return;
    }

    const dropzone = document.getElementById('opsBizDropzoneText');
    if (dropzone) dropzone.textContent = i18n('ops.businesses.subiendoImagenAStorage', 'Subiendo imagen a Storage...');

    try {
      if (window.OpsStorage && window.OpsStorage.uploadFile) {
        const res = await window.OpsStorage.uploadFile(file, 'businesses');
        const urlInput = document.getElementById('opsBizFormImageUrl');
        if (urlInput) urlInput.value = res.downloadURL;
        updateImagePreview(res.downloadURL);
        if (window.OpsToast) window.OpsToast.show(i18n('ops.businesses.fotografiaSubidaExitosamente', 'Fotografía subida exitosamente.'), 'success');
      } else {
        // Fallback local FileReader preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const urlInput = document.getElementById('opsBizFormImageUrl');
          if (urlInput) urlInput.value = e.target.result;
          updateImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      if (window.OpsToast) window.OpsToast.show(i18n('ops.businesses.errorEnSubida', 'Error en subida: {p0}', { p0: (err.message) }), 'error');
    } finally {
      if (dropzone) dropzone.textContent = i18n('ops.businesses.hazClicOArrastra', 'Haz clic o arrastra para subir fotografía o logotipo');
    }
  }

  // --------------------------------------------------------------------------
  // 8. EVENTOS DE BÚSQUEDA Y FILTRADO
  // --------------------------------------------------------------------------
  function setFilterStatus(status) {
    state.activeStatusFilter = status;
    render();
  }

  function setFilterDepartment(dept) {
    state.activeDepartmentFilter = dept;
    render();
  }

  let searchTimeout = null;
  function search(query) {
    state.searchQuery = query || '';
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      render();
    }, 120);
  }

  // --------------------------------------------------------------------------
  // EXPOSICIÓN GLOBAL EN WINDOW
  // --------------------------------------------------------------------------
  window.BaqueanoOpsBusinesses = {
    render: render,
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,
    saveBusiness: saveBusiness,
    toggleBusinessStatus: toggleBusinessStatus,
    deleteBusiness: deleteBusiness,
    restoreBusiness: restoreBusiness,
    toggleVerified: toggleVerified,
    setFilterStatus: setFilterStatus,
    setFilterDepartment: setFilterDepartment,
    search: search,
    switchDrawerTab: switchDrawerTab,
    calculateUsdPrice: calculateUsdPrice,
    handleImageUpload: handleImageUpload
  };

  // Auto-render si la pestaña 08-negocios está activa o en el hash
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (window.location.hash === '#08-negocios' || (window.OpsState && window.OpsState.activeTab === '08-negocios')) {
        setTimeout(() => render(), 120);
      }
    });
  } else {
    if (window.location.hash === '#08-negocios' || (window.OpsState && window.OpsState.activeTab === '08-negocios')) {
      setTimeout(() => render(), 120);
    }
  }

})(window, document);
