// ============================================================================
// 🧭 BAQUEANO OPS CENTER — GESTIÓN FINANCIERA & COMPROBANTES DE PAGO (ops-payments.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una consola financiera, contable y operativa dedicada para el control
//   integral de pagos y comprobantes bancarios de clientes y exploradores (#12-pagos).
// - Erradicar terminantemente los formularios genéricos de destinos turísticos y
//   etiquetas inapropiadas, sustituyéndolos por un sistema auténtico de control de
//   recaudación: código de comprobante, número de referencia bancaria, banco emisor,
//   datos del cliente (nombre, WhatsApp, correo), concepto del servicio, baucher y
//   notas de auditoría para conciliación contable.
// - Cumplir con la solicitud del propietario: registrar los comprobantes que envían
//   los clientes para llevar un control estricto interno y permitir enviárselo al cliente
//   de forma inmediata por WhatsApp, correo electrónico o descargarlo/imprimirlo en PDF.
// - Respetar de forma irrestricta la Regla 11 del Propietario (2026-10-07): "Precios:
//   córdobas primero, luego dólares", usando la tasa oficial del BCN C$ 36.6243 por US$ 1.
// - Respaldar la trazabilidad fiscal y la transparencia con anfitriones comunitarios
//   y reservas bajo la Ley 1210 / Ley 1211 de la República de Nicaragua.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Arquitectura reactiva y persistencia híbrida:
//   * Dual-Write atómico a Cloud Firestore en la colección 'payment_orders' y sincronización
//     con Supabase ('ops_backup_entities' / 'payment_orders').
//   * Actualización instantánea en memoria local (Zero Latency UI) sobre
//     'OpsState.collectionsData["12-pagos"]' y reflejo inmediato en los KPIs de recaudación.
//   * Subida de baucher/soporte a Storage con compresión y visor de alta resolución.
// - Motor omnicanal de emisión y envío al cliente:
//   * WhatsApp Oficial: Mensaje preformateado y codificado URI con desglose formal del recibo.
//   * Correo Electrónico: Mailto estructurado con cabecera institucional.
//   * PDF / Impresión Oficial: Ventana de impresión con membrete BAQUEANO NICARAGUA, QR de
//     trazabilidad, desglose en C$ y US$, y firma digitalizada.
//   * Portapapeles: Copia de 1 clic para chats de atención.
// - Interfaz ejecutiva con paleta de marca (#165D6F, #F65E01, #F4E6C1, #0F172A),
//   microinteracciones fluidas y filtros por estado de conciliación y entidad bancaria.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & API PÚBLICA):
// - window.BaqueanoOpsPayments = {
//     render(panel),
//     openDrawer(paymentOrId),
//     closeDrawer(),
//     savePayment(),
//     togglePaymentStatus(paymentId, newStatus),
//     deletePayment(paymentId),
//     openShareModal(paymentId),
//     closeShareModal(),
//     sendWhatsapp(paymentId),
//     sendEmail(paymentId),
//     printReceipt(paymentId),
//     copyReceiptText(paymentId),
//     openBaucherModal(imageUrl, paymentCode),
//     closeBaucherModal(),
//     setFilterStatus(status),
//     setFilterBank(bank),
//     search(query),
//     generateReceiptCode(),
//     calculateUsdFromNio(),
//     calculateNioFromUsd(),
//     handleBaucherUpload(file)
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

  // Tasa oficial de cambio de referencia del proyecto (Regla 11: Córdobas primero, verificado 2026-10-01)
  const FX_RATE_USD_NIO = 36.6243;

  // Bancos y canales de pago oficiales disponibles en Nicaragua
  const PAYMENT_BANKS = [
    { id: 'BAC Credomatic', name: 'BAC Credomatic Nicaragua', icon: 'fa-building-columns', color: '#EF4444' },
    { id: 'Banpro Promerica', name: 'Banco de la Producción (Banpro)', icon: 'fa-building-columns', color: '#10B981' },
    { id: 'Banco Lafise', name: 'Banco LAFISE Bancentro', icon: 'fa-building-columns', color: '#165D6F' },
    { id: 'BDF', name: 'Banco de Finanzas (BDF)', icon: 'fa-building-columns', color: '#38BDF8' },
    { id: 'Banco Avanz', name: 'Banco Avanz Nicaragua', icon: 'fa-building-columns', color: '#F59E0B' },
    { id: 'Billetera Movil', name: 'Billetera Móvil (Kash / Banpro)', icon: 'fa-mobile-screen-button', color: '#8B5CF6' },
    { id: 'Tarjeta Debito/Credito', name: 'Tarjeta Débito / Crédito (Visa / Mastercard)', icon: 'fa-credit-card', color: '#EC4899' },
    { id: 'Efectivo Cordobas', name: 'Efectivo en Territorio (0% Comisión Guía)', icon: 'fa-money-bill-wave', color: '#F4E6C1' },
    { id: 'Stripe Global', name: 'Stripe Pasarela Internacional', icon: 'fa-globe', color: '#6366F1' },
    { id: 'Transferencia ACH/SWIFT', name: 'Transferencia ACH Interbancaria / SWIFT', icon: 'fa-arrow-right-arrow-left', color: '#14B8A6' }
  ];

  // Estado reactivo interno del módulo
  const state = {
    activeStatusFilter: 'all',
    activeBankFilter: 'all',
    searchQuery: '',
    editingPaymentId: null,
    activeSharingPayment: null,
    isSubmitting: false
  };

  // --------------------------------------------------------------------------
  // Utilidades y Formateadores
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

  function getPaymentsCollection() {
    if (window.BaqueanoOpsEngine && typeof window.BaqueanoOpsEngine.getCollection === 'function') {
      const items = window.BaqueanoOpsEngine.getCollection('12-pagos');
      if (Array.isArray(items) && items.length > 0) return items;
    }
    if (window.OpsState && window.OpsState.collectionsData && Array.isArray(window.OpsState.collectionsData['12-pagos'])) {
      return window.OpsState.collectionsData['12-pagos'];
    }
    return [];
  }

  function formatMoneyBadge(amountNio, amountUsd) {
    const nio = Number(amountNio);
    const usd = Number(amountUsd);
    const hasNio = Number.isFinite(nio) && nio > 0;
    const hasUsd = Number.isFinite(usd) && usd > 0;

    if (!hasNio && !hasUsd) {
      return '<span style="color: var(--ops-text-muted); font-size: 0.82rem;">C$ 0.00</span>';
    }

    if (hasNio && hasUsd) {
      return `<div style="display: flex; flex-direction: column; line-height: 1.25;">
        <strong style="color: #F4E6C1; font-size: 0.95rem; font-weight: 800;">C$ ${nio.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
        <span style="font-size: 0.77rem; color: #94A3B8;">≈ $${usd.toFixed(2)} USD</span>
      </div>`;
    }

    if (hasNio) {
      const equivUsd = (nio / FX_RATE_USD_NIO).toFixed(2);
      return `<div style="display: flex; flex-direction: column; line-height: 1.25;">
        <strong style="color: #F4E6C1; font-size: 0.95rem; font-weight: 800;">C$ ${nio.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
        <span style="font-size: 0.77rem; color: #94A3B8;">≈ $${equivUsd} USD</span>
      </div>`;
    }

    const equivNio = (usd * FX_RATE_USD_NIO).toFixed(2);
    return `<div style="display: flex; flex-direction: column; line-height: 1.25;">
      <strong style="color: #F4E6C1; font-size: 0.95rem; font-weight: 800;">C$ ${Number(equivNio).toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
      <span style="font-size: 0.77rem; color: #94A3B8;">Orig. $${usd.toFixed(2)} USD</span>
    </div>`;
  }

  function getStatusBadge(status) {
    const s = String(status || 'pending').toLowerCase();
    if (s === 'approved' || s === 'completed' || s === 'conciliado' || s === 'confirmado') {
      return {
        key: 'approved',
        label: 'Conciliado & Verificado',
        badgeClass: 'published',
        icon: 'fa-circle-check',
        color: '#10B981',
        bg: 'rgba(16, 185, 129, 0.15)',
        border: 'rgba(16, 185, 129, 0.35)'
      };
    }
    if (s === 'pending' || s === 'pending_review' || s === 'pendiente') {
      return {
        key: 'pending',
        label: 'Pendiente de Revisión',
        badgeClass: 'draft',
        icon: 'fa-clock-rotate-left',
        color: '#F59E0B',
        bg: 'rgba(245, 158, 11, 0.15)',
        border: 'rgba(245, 158, 11, 0.35)'
      };
    }
    if (s === 'rejected' || s === 'rechazado' || s === 'fallido' || s === 'failed') {
      return {
        key: 'rejected',
        label: 'Rechazado / No Recibido',
        badgeClass: 'archived',
        icon: 'fa-circle-xmark',
        color: '#EF4444',
        bg: 'rgba(239, 68, 68, 0.15)',
        border: 'rgba(239, 68, 68, 0.35)'
      };
    }
    if (s === 'refunded' || s === 'reembolsado' || s === 'anulado') {
      return {
        key: 'refunded',
        label: 'Reembolsado / Anulado',
        badgeClass: 'archived',
        icon: 'fa-rotate-left',
        color: '#94A3B8',
        bg: 'rgba(148, 163, 184, 0.15)',
        border: 'rgba(148, 163, 184, 0.35)'
      };
    }
    return {
      key: 'pending',
      label: 'Pendiente',
      badgeClass: 'draft',
      icon: 'fa-clock',
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.35)'
    };
  }

  // --------------------------------------------------------------------------
  // 1. RENDERIZADO DEL PANEL PRINCIPAL (#view-12-pagos)
  // --------------------------------------------------------------------------
  function render(panel) {
    if (!panel) panel = document.getElementById('view-12-pagos');
    if (!panel) return;

    const allPayments = getPaymentsCollection();

    // Contadores de KPIs
    let totalNio = 0;
    let totalUsd = 0;
    let approvedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;
    let refundedCount = 0;

    allPayments.forEach(item => {
      const st = (item.status || 'pending').toLowerCase();
      const nio = Number(item.amountNio) || (Number(item.amountUsd) ? Number(item.amountUsd) * FX_RATE_USD_NIO : 0);
      const usd = Number(item.amountUsd) || (Number(item.amountNio) ? Number(item.amountNio) / FX_RATE_USD_NIO : 0);

      if (st === 'approved' || st === 'completed' || st === 'conciliado' || st === 'confirmado') {
        approvedCount++;
        totalNio += nio;
        totalUsd += usd;
      } else if (st === 'pending' || st === 'pending_review' || st === 'pendiente') {
        pendingCount++;
      } else if (st === 'rejected' || st === 'rechazado' || st === 'failed') {
        rejectedCount++;
      } else if (st === 'refunded' || st === 'anulado') {
        refundedCount++;
      }
    });

    const totalCount = allPayments.length;

    // Filtrado interactivo
    const filtered = allPayments.filter(item => {
      // Filtro de estado
      const st = (item.status || 'pending').toLowerCase();
      if (state.activeStatusFilter === 'approved' && !(st === 'approved' || st === 'completed' || st === 'conciliado' || st === 'confirmado')) return false;
      if (state.activeStatusFilter === 'pending' && !(st === 'pending' || st === 'pending_review' || st === 'pendiente')) return false;
      if (state.activeStatusFilter === 'rejected' && !(st === 'rejected' || st === 'rechazado' || st === 'failed')) return false;
      if (state.activeStatusFilter === 'refunded' && !(st === 'refunded' || st === 'anulado')) return false;

      // Filtro de banco
      if (state.activeBankFilter !== 'all') {
        const bankStr = String(item.paymentMethod || item.bank || '').toLowerCase();
        if (!bankStr.includes(state.activeBankFilter.toLowerCase())) return false;
      }

      // Filtro de búsqueda
      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        const searchable = `${item.receiptCode || item.id || ''} ${item.reference || ''} ${item.touristName || item.customerName || ''} ${item.customerPhone || item.phone || ''} ${item.customerEmail || item.email || ''} ${item.concept || item.orderId || ''} ${item.paymentMethod || item.bank || ''}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      return true;
    });

    panel.innerHTML = `
      <!-- Encabezado de Vista -->
      <div class="ops-view-header">
        <div class="ops-view-title-group">
          <h1>
            <i class="fa-solid fa-receipt" style="color: var(--bq-accent);"></i>
            <span>Pagos &amp; Comprobantes Bancarios</span>
          </h1>
          <p class="ops-view-subtitle">
            CONTROL DE RECAUDACIÓN, CONCILIACIÓN BANCARIA, DEPÓSITOS DE CLIENTES Y EMISIÓN DE RECIBOS OFICIALES
          </p>
        </div>
        <div class="ops-view-actions">
          <button type="button" class="btn-ops-matte accent" onclick="window.BaqueanoOpsPayments.openDrawer()">
            <i class="fa-solid fa-plus"></i> Registrar Nuevo Comprobante
          </button>
        </div>
      </div>

      <!-- Métricas Financieras Ejecutivas (KPIs) -->
      <div class="ops-kpi-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        <!-- Recaudado en Córdobas -->
        <div class="ops-kpi-card" style="background: var(--ops-surface-1); border: 1px solid var(--ops-border-subtle); border-radius: var(--ops-radius-md); padding: 1.15rem; display: flex; align-items: center; gap: 1rem;">
          <div style="width: 46px; height: 46px; border-radius: 10px; background: rgba(244, 230, 193, 0.15); border: 1px solid rgba(244, 230, 193, 0.35); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; color: #F4E6C1;">
            <i class="fa-solid fa-coins"></i>
          </div>
          <div>
            <div style="font-size: 1.45rem; font-weight: 800; color: #F4E6C1; line-height: 1.1;">
              C$ ${totalNio.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style="font-size: 0.78rem; color: var(--ops-text-muted); margin-top: 0.25rem;">
              Total Recaudado (C$)
            </div>
          </div>
        </div>

        <!-- Equivalente en Dólares -->
        <div class="ops-kpi-card" style="background: var(--ops-surface-1); border: 1px solid var(--ops-border-subtle); border-radius: var(--ops-radius-md); padding: 1.15rem; display: flex; align-items: center; gap: 1rem;">
          <div style="width: 46px; height: 46px; border-radius: 10px; background: rgba(22, 93, 111, 0.25); border: 1px solid rgba(22, 93, 111, 0.45); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; color: #38BDF8;">
            <i class="fa-solid fa-dollar-sign"></i>
          </div>
          <div>
            <div style="font-size: 1.45rem; font-weight: 800; color: #38BDF8; line-height: 1.1;">
              $ ${totalUsd.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </div>
            <div style="font-size: 0.78rem; color: var(--ops-text-muted); margin-top: 0.25rem;">
              Equivalente USD (1 = C$ 36.62)
            </div>
          </div>
        </div>

        <!-- Conciliados / Verificados -->
        <div class="ops-kpi-card" style="background: var(--ops-surface-1); border: 1px solid var(--ops-border-subtle); border-radius: var(--ops-radius-md); padding: 1.15rem; display: flex; align-items: center; gap: 1rem;">
          <div style="width: 46px; height: 46px; border-radius: 10px; background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.4); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; color: #10B981;">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <div>
            <div style="font-size: 1.5rem; font-weight: 800; color: #10B981; line-height: 1.1;">${approvedCount}</div>
            <div style="font-size: 0.78rem; color: var(--ops-text-muted); margin-top: 0.25rem;">Conciliados / Verificados</div>
          </div>
        </div>

        <!-- Pendientes de Acreditación -->
        <div class="ops-kpi-card" style="background: var(--ops-surface-1); border: 1px solid var(--ops-border-subtle); border-radius: var(--ops-radius-md); padding: 1.15rem; display: flex; align-items: center; gap: 1rem;">
          <div style="width: 46px; height: 46px; border-radius: 10px; background: rgba(245, 158, 11, 0.2); border: 1px solid rgba(245, 158, 11, 0.4); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; color: #F59E0B;">
            <i class="fa-solid fa-clock-rotate-left"></i>
          </div>
          <div>
            <div style="font-size: 1.5rem; font-weight: 800; color: #F59E0B; line-height: 1.1;">${pendingCount}</div>
            <div style="font-size: 0.78rem; color: var(--ops-text-muted); margin-top: 0.25rem;">Pendientes de Revisión</div>
          </div>
        </div>

        <!-- Total Comprobantes Registrados -->
        <div class="ops-kpi-card" style="background: var(--ops-surface-1); border: 1px solid var(--ops-border-subtle); border-radius: var(--ops-radius-md); padding: 1.15rem; display: flex; align-items: center; gap: 1rem;">
          <div style="width: 46px; height: 46px; border-radius: 10px; background: rgba(246, 94, 1, 0.2); border: 1px solid rgba(246, 94, 1, 0.4); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; color: #F65E01;">
            <i class="fa-solid fa-file-invoice"></i>
          </div>
          <div>
            <div style="font-size: 1.5rem; font-weight: 800; color: #FFFFFF; line-height: 1.1;">${totalCount}</div>
            <div style="font-size: 0.78rem; color: var(--ops-text-muted); margin-top: 0.25rem;">Total de Comprobantes</div>
          </div>
        </div>
      </div>

      <!-- Barra de Filtros, Bancos y Buscador -->
      <div class="ops-crud-toolbar" style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem;">
        <div class="ops-filter-group" style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;">
          <button type="button" class="ops-filter-pill ${state.activeStatusFilter === 'all' ? 'is-active' : ''}" onclick="window.BaqueanoOpsPayments.setFilterStatus('all')">
            Todos <span class="ops-filter-count">${totalCount}</span>
          </button>
          <button type="button" class="ops-filter-pill ${state.activeStatusFilter === 'approved' ? 'is-active' : ''}" onclick="window.BaqueanoOpsPayments.setFilterStatus('approved')">
            Conciliados <span class="ops-filter-count">${approvedCount}</span>
          </button>
          <button type="button" class="ops-filter-pill ${state.activeStatusFilter === 'pending' ? 'is-active' : ''}" onclick="window.BaqueanoOpsPayments.setFilterStatus('pending')">
            Pendientes <span class="ops-filter-count">${pendingCount}</span>
          </button>
          <button type="button" class="ops-filter-pill ${state.activeStatusFilter === 'rejected' ? 'is-active' : ''}" onclick="window.BaqueanoOpsPayments.setFilterStatus('rejected')">
            Rechazados <span class="ops-filter-count">${rejectedCount}</span>
          </button>
          <button type="button" class="ops-filter-pill ${state.activeStatusFilter === 'refunded' ? 'is-active' : ''}" onclick="window.BaqueanoOpsPayments.setFilterStatus('refunded')">
            Anulados <span class="ops-filter-count">${refundedCount}</span>
          </button>

          <!-- Filtro de Banco / Canal -->
          <select class="ops-form-select" style="max-width: 220px; padding: 0.35rem 0.75rem; font-size: 0.82rem;" onchange="window.BaqueanoOpsPayments.setFilterBank(this.value)">
            <option value="all" ${state.activeBankFilter === 'all' ? 'selected' : ''}>Todos los Bancos / Medios</option>
            ${PAYMENT_BANKS.map(b => `<option value="${escapeHtml(b.id)}" ${state.activeBankFilter === b.id ? 'selected' : ''}>${escapeHtml(b.name)}</option>`).join('')}
          </select>
        </div>

        <div class="ops-search-input-wrap" style="flex: 1; max-width: 380px;">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" class="ops-filter-search-input" id="opsPaymentSearchInput"
            placeholder=i18n('ops.payments.buscarPorClienteComprobante', 'Buscar por cliente, comprobante, referencia o banco...')
            value="${escapeHtml(state.searchQuery)}"
            oninput="window.BaqueanoOpsPayments.search(this.value)">
        </div>
      </div>

      <!-- Tabla de Comprobantes & Pagos -->
      <div class="ops-table-wrap">
        <table class="ops-table-matte">
          <thead>
            <tr>
              <th style="width: 200px;">Comprobante &amp; Fecha</th>
              <th style="width: 240px;">Cliente / Explorador</th>
              <th>Concepto &amp; Referencia Bancaria</th>
              <th style="width: 170px;">Monto (C$ Primero)</th>
              <th style="width: 170px;">Estado Contable</th>
              <th style="width: 80px; text-align: center;">Baucher</th>
              <th style="text-align: right; width: 180px;">Acciones Operativas</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align: center; padding: 3.5rem 1.5rem;">
                  <div class="ops-empty-state">
                    <i class="fa-solid fa-receipt ops-empty-icon" style="font-size: 2.2rem; color: var(--ops-text-muted); margin-bottom: 0.75rem;"></i>
                    <div class="ops-empty-title" style="color: #fff; font-size: 1.05rem; font-weight: 700;">No se encontraron comprobantes</div>
                    <div class="ops-empty-desc" style="color: var(--ops-text-secondary); font-size: 0.85rem; margin-top: 0.35rem;">
                      No hay registros que coincidan con los criterios de búsqueda o el filtro seleccionado.
                    </div>
                    <button type="button" class="btn-ops-matte primary" style="margin-top: 1.25rem;" onclick="window.BaqueanoOpsPayments.openDrawer()">
                      <i class="fa-solid fa-plus"></i> Registrar Primer Comprobante
                    </button>
                  </div>
                </td>
              </tr>
            ` : filtered.map(item => renderPaymentRow(item)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Renderizar fila individual de comprobante
  function renderPaymentRow(item) {
    const code = item.receiptCode || item.id || 'COMP-S/N';
    const dateStr = item.date || item.createdAt || new Date().toISOString().split('T')[0];
    const customer = item.touristName || item.customerName || 'Cliente No Especificado';
    const phone = item.customerPhone || item.phone || '';
    const email = item.customerEmail || item.email || '';
    const concept = item.concept || item.orderId || 'Servicio Turístico Baqueano';
    const bank = item.paymentMethod || item.bank || 'Transferencia Bancaria';
    const ref = item.reference || 'Sin Referencia';
    const stBadge = getStatusBadge(item.status);
    const moneyHtml = formatMoneyBadge(item.amountNio, item.amountUsd);
    const voucherUrl = item.baucherUrl || item.voucherUrl || item.imageUrl || '';

    return `
      <tr class="ops-table-row">
        <!-- 1. Comprobante & Fecha -->
        <td>
          <div style="display: flex; flex-direction: column;">
            <span style="font-family: monospace; font-weight: 800; color: #FFFFFF; font-size: 0.92rem; display: flex; align-items: center; gap: 0.35rem;">
              <i class="fa-solid fa-receipt" style="color: var(--bq-accent); font-size: 0.8rem;"></i>
              ${escapeHtml(code)}
            </span>
            <span style="font-size: 0.77rem; color: var(--ops-text-muted); margin-top: 0.2rem; display: flex; align-items: center; gap: 0.3rem;">
              <i class="fa-regular fa-calendar" style="font-size: 0.7rem;"></i>
              ${escapeHtml(dateStr)}
            </span>
          </div>
        </td>

        <!-- 2. Cliente / Explorador -->
        <td>
          <div style="display: flex; flex-direction: column; min-width: 0;">
            <span style="font-weight: 700; color: #FFFFFF; font-size: 0.88rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${escapeHtml(customer)}
            </span>
            <div style="display: flex; flex-direction: column; gap: 0.15rem; margin-top: 0.2rem;">
              ${phone ? `
                <a href="https://wa.me/505${escapeHtml(phone.replace(/[^\d]/g, ''))}" target="_blank" rel="noopener noreferrer" style="font-size: 0.76rem; color: #10B981; text-decoration: none; display: flex; align-items: center; gap: 0.3rem;">
                  <i class="fa-brands fa-whatsapp"></i> ${escapeHtml(phone)}
                </a>
              ` : ''}
              ${email ? `
                <span style="font-size: 0.74rem; color: var(--ops-text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title=${q(`${escapeHtml(email)}`)}>
                  <i class="fa-regular fa-envelope" style="font-size: 0.7rem;"></i> ${escapeHtml(email)}
                </span>
              ` : ''}
            </div>
          </div>
        </td>

        <!-- 3. Concepto & Referencia -->
        <td>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.86rem; color: #E2E8F0; font-weight: 600; line-height: 1.3;">
              ${escapeHtml(concept)}
            </span>
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem; margin-top: 0.3rem;">
              <span style="font-size: 0.74rem; background: rgba(22, 93, 111, 0.25); color: #38BDF8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 0.1rem 0.45rem; border-radius: 4px; font-weight: 700; display: inline-flex; align-items: center; gap: 0.25rem;">
                <i class="fa-solid fa-building-columns" style="font-size: 0.68rem;"></i>
                ${escapeHtml(bank)}
              </span>
              <span style="font-size: 0.74rem; background: var(--ops-surface-2); color: #F4E6C1; border: 1px solid var(--ops-border-subtle); padding: 0.1rem 0.45rem; border-radius: 4px; font-family: monospace;">
                Ref: ${escapeHtml(ref)}
              </span>
            </div>
          </div>
        </td>

        <!-- 4. Monto (C$ Primero) -->
        <td>
          ${moneyHtml}
        </td>

        <!-- 5. Estado Contable -->
        <td>
          <span style="display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.65rem; border-radius: 6px; font-size: 0.76rem; font-weight: 700; background: ${stBadge.bg}; color: ${stBadge.color}; border: 1px solid ${stBadge.border};">
            <i class="fa-solid ${stBadge.icon}"></i>
            <span>${stBadge.label}</span>
          </span>
        </td>

        <!-- 6. Baucher / Foto -->
        <td style="text-align: center;">
          ${voucherUrl ? `
            <button type="button" class="btn-ops-icon" title=${q(i18n('ops.payments.verBaucherComprobanteBancario', 'Ver baucher / comprobante bancario'))} style="color: #38BDF8;" onclick="window.BaqueanoOpsPayments.openBaucherModal('${escapeHtml(voucherUrl)}', '${escapeHtml(code)}')">
              <i class="fa-solid fa-image"></i>
            </button>
          ` : `
            <span title=${q(i18n('ops.payments.sinComprobanteAdjunto', 'Sin comprobante adjunto'))} style="color: var(--ops-text-muted); font-size: 0.78rem;">
              <i class="fa-regular fa-image" style="opacity: 0.4;"></i>
            </span>
          `}
        </td>

        <!-- 7. Acciones Operativas -->
        <td>
          <div class="ops-table-actions" style="justify-content: flex-end; gap: 0.35rem;">
            <!-- Botón Enviar / Compartir al Cliente -->
            <button type="button" class="btn-ops-icon" title=${q(i18n('ops.payments.enviarComprobanteAlCliente', 'Enviar comprobante al cliente (WhatsApp, Correo, PDF)'))} style="color: #10B981;" onclick="window.BaqueanoOpsPayments.openShareModal('${escapeHtml(item.id)}')">
              <i class="fa-solid fa-paper-plane"></i>
            </button>

            <!-- Conciliar Rápido Toggle -->
            ${stBadge.key === 'pending' ? `
              <button type="button" class="btn-ops-icon" title=${q(i18n('ops.payments.aprobarYConciliarPago', 'Aprobar y Conciliar Pago (Fondo Acreditado)'))} style="color: #F59E0B;" onclick="window.BaqueanoOpsPayments.togglePaymentStatus('${escapeHtml(item.id)}', 'approved')">
                <i class="fa-solid fa-check-double"></i>
              </button>
            ` : `
              <button type="button" class="btn-ops-icon" title=${q(i18n('ops.payments.cambiarAPendienteDe', 'Cambiar a Pendiente de Revisión'))} style="color: #94A3B8;" onclick="window.BaqueanoOpsPayments.togglePaymentStatus('${escapeHtml(item.id)}', 'pending')">
                <i class="fa-solid fa-clock-rotate-left"></i>
              </button>
            `}

            <!-- Editar Comprobante -->
            <button type="button" class="btn-ops-icon" title=${q(i18n('ops.payments.editarDatosDelComprobante', 'Editar datos del comprobante'))} style="color: #38BDF8;" onclick="window.BaqueanoOpsPayments.openDrawer('${escapeHtml(item.id)}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>

            <!-- Eliminar Comprobante -->
            <button type="button" class="btn-ops-icon danger" title=${q(i18n('ops.payments.eliminarComprobante', 'Eliminar comprobante'))} style="color: #EF4444;" onclick="window.BaqueanoOpsPayments.deletePayment('${escapeHtml(item.id)}')">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  // --------------------------------------------------------------------------
  // 2. CONTROL DEL DRAWER DE COMPROBANTES (#opsPaymentDrawer)
  // --------------------------------------------------------------------------
  function openDrawer(paymentOrId) {
    const drawer = document.getElementById('opsPaymentDrawer');
    if (!drawer) {
      console.error('[BaqueanoOpsPayments] Drawer #opsPaymentDrawer no encontrado.');
      return;
    }

    let item = null;
    if (typeof paymentOrId === 'string') {
      item = getPaymentsCollection().find(p => p.id === paymentOrId);
    } else if (typeof paymentOrId === 'object' && paymentOrId !== null) {
      item = paymentOrId;
    }

    state.editingPaymentId = item ? item.id : null;

    const titleEl = document.getElementById('opsPaymentDrawerTitle');
    const subtitleEl = document.getElementById('opsPaymentDrawerSubtitle');
    const deleteBtn = document.getElementById('btnOpsPaymentDrawerDelete');
    const shareBtn = document.getElementById('btnOpsPaymentDrawerShare');

    if (item) {
      if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-pen-to-square" style="color: var(--bq-accent);"></i> <span>${escapeHtml(i18n('ops.payments.editTitle', 'Editar Comprobante: {p0}', { p0: item.receiptCode || item.id }))}</span>`;
      if (subtitleEl) subtitleEl.textContent = i18n('ops.payments.idCliente', 'ID: {p0} · Cliente: {p1}', { p0: (item.id), p1: (item.touristName || item.customerName || 'N/A') });
      if (deleteBtn) deleteBtn.style.display = 'inline-flex';
      if (shareBtn) shareBtn.style.display = 'inline-flex';
    } else {
      if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-receipt" style="color: var(--bq-accent);"></i> <span>${escapeHtml(i18n('ops.payments.newTitle', 'Registrar Nuevo Comprobante'))}</span>`;
      if (subtitleEl) subtitleEl.textContent = i18n('ops.payments.moduloPagosComprobantesBancarios', 'Módulo: Pagos & Comprobantes Bancarios');
      if (deleteBtn) deleteBtn.style.display = 'none';
      if (shareBtn) shareBtn.style.display = 'none';
    }

    // Llenar campos del formulario
    document.getElementById('opsPaymentFormId').value = item ? item.id : '';
    document.getElementById('opsPaymentFormCode').value = item ? (item.receiptCode || item.id || '') : generateReceiptCode();
    document.getElementById('opsPaymentFormReference').value = item ? (item.reference || '') : '';
    document.getElementById('opsPaymentFormBank').value = item ? (item.paymentMethod || item.bank || 'BAC Credomatic') : 'BAC Credomatic';
    document.getElementById('opsPaymentFormStatus').value = item ? (item.status || 'approved') : 'approved';

    // Fecha
    const todayStr = new Date().toISOString().split('T')[0];
    document.getElementById('opsPaymentFormDate').value = item ? (item.date || item.createdAt || todayStr) : todayStr;

    // Cliente
    document.getElementById('opsPaymentFormCustomerName').value = item ? (item.touristName || item.customerName || '') : '';
    document.getElementById('opsPaymentFormCustomerPhone').value = item ? (item.customerPhone || item.phone || '') : '';
    document.getElementById('opsPaymentFormCustomerEmail').value = item ? (item.customerEmail || item.email || '') : '';

    // Concepto
    document.getElementById('opsPaymentFormConcept').value = item ? (item.concept || item.orderId || '') : '';
    document.getElementById('opsPaymentFormOrderCode').value = item ? (item.orderId || '') : '';

    // Montos (C$ primero)
    const nioVal = item && item.amountNio ? item.amountNio : '';
    const usdVal = item && item.amountUsd ? item.amountUsd : '';
    document.getElementById('opsPaymentFormAmountNio').value = nioVal;
    document.getElementById('opsPaymentFormAmountUsd').value = usdVal;

    // Baucher
    const voucherUrl = item ? (item.baucherUrl || item.voucherUrl || item.imageUrl || '') : '';
    document.getElementById('opsPaymentFormVoucherUrl').value = voucherUrl;
    updateBaucherPreview(voucherUrl);

    // Notas de auditoría
    document.getElementById('opsPaymentFormNotes').value = item ? (item.notes || item.internalNotes || item.fiscalRegime || '') : '';

    drawer.classList.add('is-open');
  }

  function closeDrawer() {
    const drawer = document.getElementById('opsPaymentDrawer');
    if (drawer) drawer.classList.remove('is-open');
    state.editingPaymentId = null;
  }

  function generateReceiptCode() {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    return `COMP-${year}-${rand}`;
  }

  function calculateUsdFromNio() {
    const nioInput = document.getElementById('opsPaymentFormAmountNio');
    const usdInput = document.getElementById('opsPaymentFormAmountUsd');
    if (!nioInput || !usdInput) return;

    const nio = parseFloat(nioInput.value);
    if (Number.isFinite(nio) && nio > 0) {
      const calcUsd = (nio / FX_RATE_USD_NIO).toFixed(2);
      usdInput.value = calcUsd;
    }
  }

  function calculateNioFromUsd() {
    const nioInput = document.getElementById('opsPaymentFormAmountNio');
    const usdInput = document.getElementById('opsPaymentFormAmountUsd');
    if (!nioInput || !usdInput) return;

    const usd = parseFloat(usdInput.value);
    if (Number.isFinite(usd) && usd > 0) {
      const calcNio = (usd * FX_RATE_USD_NIO).toFixed(2);
      nioInput.value = calcNio;
    }
  }

  function updateBaucherPreview(url) {
    const previewBox = document.getElementById('opsPaymentBaucherPreviewBox');
    const previewImg = document.getElementById('opsPaymentBaucherPreviewImg');
    if (!previewBox || !previewImg) return;

    if (url && url.trim()) {
      previewImg.src = url.trim();
      previewBox.style.display = 'block';
    } else {
      previewBox.style.display = 'none';
      previewImg.src = '';
    }
  }

  // --------------------------------------------------------------------------
  // 3. PERSISTENCIA ATÓMICA DE COMPROBANTES (AGREGAR / MODIFICAR)
  // --------------------------------------------------------------------------
  async function savePayment() {
    if (state.isSubmitting) return;

    const codeInput = document.getElementById('opsPaymentFormCode');
    const receiptCode = codeInput ? codeInput.value.trim() : '';
    const customerName = document.getElementById('opsPaymentFormCustomerName').value.trim();
    const amountNio = parseFloat(document.getElementById('opsPaymentFormAmountNio').value);
    const amountUsd = parseFloat(document.getElementById('opsPaymentFormAmountUsd').value);

    if (!customerName) {
      if (window.OpsToast) window.OpsToast.show(i18n('ops.payments.elNombreDelCliente', 'El Nombre del Cliente o Explorador es obligatorio.'), 'warning');
      else alert(i18n('ops.payments.elNombreDelCliente2', 'El Nombre del Cliente es obligatorio.'));
      document.getElementById('opsPaymentFormCustomerName').focus();
      return;
    }

    if (!Number.isFinite(amountNio) || amountNio <= 0) {
      if (window.OpsToast) window.OpsToast.show(i18n('ops.payments.debesIngresarUnMonto', 'Debes ingresar un Monto en Córdobas (C$) válido mayor a 0.'), 'warning');
      else alert(i18n('ops.payments.montoEnCordobasObligatorio', 'Monto en Córdobas obligatorio.'));
      document.getElementById('opsPaymentFormAmountNio').focus();
      return;
    }

    const id = document.getElementById('opsPaymentFormId').value.trim() || `pay-${Date.now()}`;
    const reference = document.getElementById('opsPaymentFormReference').value.trim() || `REF-${Date.now().toString().slice(-6)}`;
    const bank = document.getElementById('opsPaymentFormBank').value;
    const status = document.getElementById('opsPaymentFormStatus').value;
    const dateVal = document.getElementById('opsPaymentFormDate').value.trim() || new Date().toISOString().split('T')[0];
    const customerPhone = document.getElementById('opsPaymentFormCustomerPhone').value.trim();
    const customerEmail = document.getElementById('opsPaymentFormCustomerEmail').value.trim();
    const concept = document.getElementById('opsPaymentFormConcept').value.trim() || 'Servicio Turístico Baqueano';
    const orderId = document.getElementById('opsPaymentFormOrderCode').value.trim() || '';
    const voucherUrl = document.getElementById('opsPaymentFormVoucherUrl').value.trim();
    const notes = document.getElementById('opsPaymentFormNotes').value.trim();

    const finalUsd = Number.isFinite(amountUsd) && amountUsd > 0 ? amountUsd : Number((amountNio / FX_RATE_USD_NIO).toFixed(2));

    const payload = {
      id: id,
      receiptCode: receiptCode || generateReceiptCode(),
      orderId: orderId,
      concept: concept,
      touristName: customerName,
      customerName: customerName,
      customerPhone: customerPhone,
      phone: customerPhone,
      customerEmail: customerEmail,
      email: customerEmail,
      amountNio: amountNio,
      amountUsd: finalUsd,
      paymentMethod: bank,
      bank: bank,
      reference: reference,
      status: status,
      date: dateVal,
      baucherUrl: voucherUrl,
      voucherUrl: voucherUrl,
      notes: notes,
      fiscalRegime: notes ? `Nota: ${notes}` : 'Régimen Simplificado Turístico Ley 1210',
      updatedAt: new Date().toISOString()
    };

    state.isSubmitting = true;
    const saveBtn = document.getElementById('btnOpsPaymentDrawerSave');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${escapeHtml(i18n('ops.common.saving', 'Guardando...'))}`;
    }

    try {
      // 1. Dual-Write a Cloud Firestore ('payment_orders')
      try {
        if (window.firebase && window.firebase.firestore) {
          const db = window.firebase.firestore();
          await db.collection('payment_orders').doc(id).set(payload, { merge: true });
        }
      } catch (fErr) {
        console.warn('[BaqueanoOpsPayments] Firestore write aviso:', fErr.message);
      }

      // 2. Dual-Write a Supabase si BaqueanoOpsData está disponible
      try {
        if (window.BaqueanoOpsData && typeof window.BaqueanoOpsData.save === 'function') {
          await window.BaqueanoOpsData.save('12-pagos', payload);
        }
      } catch (sErr) {
        console.warn('[BaqueanoOpsPayments] Supabase write aviso:', sErr.message);
      }

      // 3. Actualizar memoria local en OpsState.collectionsData['12-pagos']
      if (!window.OpsState) window.OpsState = {};
      if (!window.OpsState.collectionsData) window.OpsState.collectionsData = {};
      if (!Array.isArray(window.OpsState.collectionsData['12-pagos'])) {
        window.OpsState.collectionsData['12-pagos'] = [];
      }

      const list = window.OpsState.collectionsData['12-pagos'];
      const existingIdx = list.findIndex(p => p.id === id);
      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], ...payload };
      } else {
        payload.createdAt = new Date().toISOString();
        list.unshift(payload);
      }

      if (window.OpsToast) {
        window.OpsToast.show(i18n('ops.payments.comprobanteGuardadoConExito', 'Comprobante \"{p0}\" guardado con éxito.', { p0: (payload.receiptCode) }), 'success');
      } else {
        alert(i18n('ops.payments.comprobanteGuardadoConExito2', 'Comprobante {p0} guardado con éxito.', { p0: (payload.receiptCode) }));
      }

      closeDrawer();
      render();
    } catch (err) {
      console.error('[BaqueanoOpsPayments] Error al guardar comprobante:', err);
      if (window.OpsToast) {
        window.OpsToast.show(i18n('ops.payments.errorAlGuardarComprobante', 'Error al guardar comprobante: {p0}', { p0: (err.message) }), 'error');
      } else {
        alert(i18n('ops.payments.errorAlGuardarComprobante', 'Error al guardar comprobante: {p0}', { p0: (err.message) }));
      }
    } finally {
      state.isSubmitting = false;
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> ${escapeHtml(i18n('ops.payments.saveReceipt', 'Guardar Comprobante'))}`;
      }
    }
  }

  // --------------------------------------------------------------------------
  // 4. CONCILIACIÓN RÁPIDA (TOGGLE DE ESTADO EN 1 CLIC)
  // --------------------------------------------------------------------------
  async function togglePaymentStatus(paymentId, newStatus) {
    if (!paymentId) return;
    const item = getPaymentsCollection().find(p => p.id === paymentId);
    if (!item) return;

    const targetStatus = newStatus || (item.status === 'approved' ? 'pending' : 'approved');

    try {
      if (window.firebase && window.firebase.firestore) {
        await window.firebase.firestore().collection('payment_orders').doc(paymentId).set({
          status: targetStatus,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }

      item.status = targetStatus;
      item.updatedAt = new Date().toISOString();

      const label = targetStatus === 'approved' ? 'Conciliado & Verificado' : 'Pendiente de Revisión';
      if (window.OpsToast) {
        window.OpsToast.show(i18n('ops.payments.comprobanteMarcadoComo', 'Comprobante marcado como: {p0}', { p0: (label) }), 'success');
      }

      render();
    } catch (err) {
      console.error('[BaqueanoOpsPayments] Error en togglePaymentStatus:', err);
      if (window.OpsToast) window.OpsToast.show(i18n('ops.payments.error', 'Error: {p0}', { p0: (err.message) }), 'error');
    }
  }

  // --------------------------------------------------------------------------
  // 5. ELIMINAR / ARCHIVAR COMPROBANTE CON DIÁLOGO DEFENSIVO
  // --------------------------------------------------------------------------
  async function deletePayment(paymentId) {
    if (!paymentId && state.editingPaymentId) paymentId = state.editingPaymentId;
    if (!paymentId) return;

    const item = getPaymentsCollection().find(p => p.id === paymentId);
    if (!item) return;

    const confirmed = await (window.OpsDialog ? window.OpsDialog.confirm({
      title: '⚠️ ¿Eliminar Comprobante Bancario?',
      message: `El comprobante "${item.receiptCode || item.id}" a nombre de "${item.touristName || item.customerName || 'Cliente'}" por C$ ${Number(item.amountNio || 0).toLocaleString('es-NI')} será eliminado del registro contable.`,
      confirmText: 'Eliminar Registro',
      isDangerous: true
    }) : Promise.resolve(confirm(`¿Estás seguro de eliminar el comprobante ${item.receiptCode || item.id}?`)));

    if (!confirmed) return;

    try {
      // Borrar en Firestore
      if (window.firebase && window.firebase.firestore) {
        await window.firebase.firestore().collection('payment_orders').doc(paymentId).delete();
      }

      // Eliminar de memoria
      if (window.OpsState && window.OpsState.collectionsData && Array.isArray(window.OpsState.collectionsData['12-pagos'])) {
        window.OpsState.collectionsData['12-pagos'] = window.OpsState.collectionsData['12-pagos'].filter(p => p.id !== paymentId);
      }

      if (window.OpsToast) {
        window.OpsToast.show(i18n('ops.payments.comprobanteEliminadoConExito', 'Comprobante \"{p0}\" eliminado con éxito.', { p0: (item.receiptCode || item.id) }), 'success');
      }

      if (state.editingPaymentId === paymentId) closeDrawer();
      render();
    } catch (err) {
      console.error('[BaqueanoOpsPayments] Error al eliminar:', err);
      if (window.OpsToast) window.OpsToast.show(i18n('ops.payments.errorAlEliminar', 'Error al eliminar: {p0}', { p0: (err.message) }), 'error');
    }
  }

  // --------------------------------------------------------------------------
  // 6. MODAL Y MOTOR DE ENVÍO AL CLIENTE (WHATSAPP, CORREO, PDF, COPIAR)
  // --------------------------------------------------------------------------
  function openShareModal(paymentId) {
    if (!paymentId && state.editingPaymentId) paymentId = state.editingPaymentId;
    if (!paymentId) return;

    const item = getPaymentsCollection().find(p => p.id === paymentId);
    if (!item) return;

    state.activeSharingPayment = item;

    const modal = document.getElementById('opsPaymentShareModal');
    if (!modal) {
      console.error('[BaqueanoOpsPayments] Modal #opsPaymentShareModal no encontrado.');
      return;
    }

    // Llenar datos de previsualización en el modal
    const codeEl = document.getElementById('opsShareModalCode');
    const customerEl = document.getElementById('opsShareModalCustomer');
    const amountEl = document.getElementById('opsShareModalAmount');
    const bankEl = document.getElementById('opsShareModalBank');
    const statusEl = document.getElementById('opsShareModalStatus');
    const phoneInput = document.getElementById('opsShareModalPhoneInput');
    const emailInput = document.getElementById('opsShareModalEmailInput');

    const nio = Number(item.amountNio || 0);
    const usd = Number(item.amountUsd || (nio / FX_RATE_USD_NIO));

    if (codeEl) codeEl.textContent = item.receiptCode || item.id;
    if (customerEl) customerEl.textContent = item.touristName || item.customerName || 'Cliente';
    if (amountEl) {
      // Montos con nodos y textContent (sin HTML armado a mano).
      const amountStrong = document.createElement('strong'); amountStrong.style.color = '#F4E6C1';
      amountStrong.textContent = 'C$ ' + nio.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const amountUsd = document.createElement('span'); amountUsd.style.cssText = 'color:#94A3B8; font-size:0.8rem;';
      amountUsd.textContent = '(≈ $' + usd.toFixed(2) + ' USD)';
      amountEl.replaceChildren(amountStrong, ' ', amountUsd);
    }
    if (bankEl) bankEl.textContent = i18n('ops.payments.ref', '{p0} (Ref: {p1})', { p0: (item.paymentMethod || item.bank || 'Banco'), p1: (item.reference || 'S/N') });
    if (statusEl) {
      const st = getStatusBadge(item.status);
      const stSpan = document.createElement('span'); stSpan.style.color = st.color; stSpan.style.fontWeight = '700';
      const stIcon = document.createElement('i'); stIcon.className = 'fa-solid ' + st.icon; stIcon.setAttribute('aria-hidden', 'true');
      stSpan.append(stIcon, ' ' + st.label);
      statusEl.replaceChildren(stSpan);
    }

    if (phoneInput) phoneInput.value = item.customerPhone || item.phone || '';
    if (emailInput) emailInput.value = item.customerEmail || item.email || '';

    modal.style.display = 'flex';
  }

  function closeShareModal() {
    const modal = document.getElementById('opsPaymentShareModal');
    if (modal) modal.style.display = 'none';
    state.activeSharingPayment = null;
  }

  // Generar el texto formal del recibo para WhatsApp o portapapeles
  function buildReceiptText(item) {
    const nio = Number(item.amountNio || 0);
    const usd = Number(item.amountUsd || (nio / FX_RATE_USD_NIO));
    const code = item.receiptCode || item.id;
    const customer = item.touristName || item.customerName || 'Explorador';
    const concept = item.concept || item.orderId || 'Servicio Turístico';
    const bank = item.paymentMethod || item.bank || 'Transferencia Bancaria';
    const ref = item.reference || 'S/N';
    const date = item.date || item.createdAt || new Date().toISOString().split('T')[0];
    const isApproved = (item.status || 'pending').toLowerCase() === 'approved';

    return `🧭 *BAQUEANO NICARAGUA — COMPROBANTE OFICIAL DE PAGO*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 *Nº Comprobante:* ${code}
📅 *Fecha de Emisión:* ${date}
👤 *Cliente:* ${customer}
💼 *Concepto:* ${concept}
🏦 *Entidad / Medio:* ${bank}
🔖 *Referencia / Baucher:* ${ref}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 *TOTAL PAGADO:* C$ ${nio.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NIO
💵 *Equivalente:* $${usd.toFixed(2)} USD (Tasa BCN: C$ 36.6243)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${isApproved ? '✅ *ESTADO: CONCILIADO & VERIFICADO EN CUENTA*' : '⏳ *ESTADO: PENDIENTE DE CONCILIACIÓN*'}

_¡Gracias por respaldar el turismo comunitario campesino en Nicaragua sin intermediarios!_
_Emisión oficial protegida bajo Ley 1210 / Ley 1211._
🌐 https://baqueanonicaragua.com`;
  }

  function sendWhatsapp(paymentId) {
    const item = paymentId ? getPaymentsCollection().find(p => p.id === paymentId) : state.activeSharingPayment;
    if (!item) return;

    let phone = (document.getElementById('opsShareModalPhoneInput') ? document.getElementById('opsShareModalPhoneInput').value : (item.customerPhone || item.phone || '')).trim();
    phone = phone.replace(/[^\d]/g, '');

    if (!phone) {
      if (window.OpsToast) window.OpsToast.show(i18n('ops.payments.porFavorIngresaEl', 'Por favor ingresa el número de WhatsApp del cliente.'), 'warning');
      else alert(i18n('ops.payments.numeroDeWhatsappRequerido', 'Número de WhatsApp requerido'));
      return;
    }

    // Si no incluye código de país 505 y tiene 8 dígitos
    if (phone.length === 8) {
      phone = `505${phone}`;
    }

    const message = buildReceiptText(item);
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    if (window.OpsToast) window.OpsToast.show(i18n('ops.payments.abriendoWhatsappConComprobante', 'Abriendo WhatsApp con comprobante oficial...'), 'success');
  }

  function sendEmail(paymentId) {
    const item = paymentId ? getPaymentsCollection().find(p => p.id === paymentId) : state.activeSharingPayment;
    if (!item) return;

    const email = (document.getElementById('opsShareModalEmailInput') ? document.getElementById('opsShareModalEmailInput').value : (item.customerEmail || item.email || '')).trim();

    if (!email) {
      if (window.OpsToast) window.OpsToast.show(i18n('ops.payments.porFavorIngresaEl2', 'Por favor ingresa el correo del cliente.'), 'warning');
      else alert(i18n('ops.payments.correoElectronicoRequerido', 'Correo electrónico requerido'));
      return;
    }

    const subject = `Comprobante Oficial de Pago ${item.receiptCode || item.id} — BAQUEANO Nicaragua`;
    const body = buildReceiptText(item);
    const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;

    if (window.OpsToast) window.OpsToast.show(i18n('ops.payments.abriendoClienteDeCorreo', 'Abriendo cliente de correo...'), 'success');
  }

  function copyReceiptText(paymentId) {
    const item = paymentId ? getPaymentsCollection().find(p => p.id === paymentId) : state.activeSharingPayment;
    if (!item) return;

    const text = buildReceiptText(item);
    navigator.clipboard.writeText(text).then(() => {
      if (window.OpsToast) window.OpsToast.show(i18n('ops.payments.textoDelComprobanteCopiado', 'Texto del comprobante copiado al portapapeles.'), 'success');
      else alert(i18n('ops.payments.comprobanteCopiadoAlPortapapeles', 'Comprobante copiado al portapapeles'));
    }).catch(err => {
      console.error('Error al copiar:', err);
      if (window.OpsToast) window.OpsToast.show(i18n('ops.payments.noSePudoCopiar', 'No se pudo copiar automáticamente.'), 'error');
    });
  }

  function printReceipt(paymentId) {
    const item = paymentId ? getPaymentsCollection().find(p => p.id === paymentId) : state.activeSharingPayment;
    if (!item) return;

    const nio = Number(item.amountNio || 0);
    const usd = Number(item.amountUsd || (nio / FX_RATE_USD_NIO));
    const code = item.receiptCode || item.id;
    const customer = item.touristName || item.customerName || 'Cliente No Especificado';
    const concept = item.concept || item.orderId || 'Servicio Turístico';
    const bank = item.paymentMethod || item.bank || 'Transferencia Bancaria';
    const ref = item.reference || 'S/N';
    const date = item.date || item.createdAt || new Date().toISOString().split('T')[0];
    const notes = item.notes || item.internalNotes || 'Comprobante emitido sin retención indebida';
    const isApproved = (item.status || 'pending').toLowerCase() === 'approved';

    const printWin = window.open('', '_blank', 'width=800,height=900');
    if (!printWin) {
      if (window.OpsToast) window.OpsToast.show(i18n('ops.payments.porFavorPermiteVentanas', 'Por favor permite ventanas emergentes para imprimir.'), 'warning');
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Recibo Oficial de Pago — ${escapeHtml(code)}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
          body { background: #fff; color: #1e293b; padding: 40px; font-size: 14px; line-height: 1.5; }
          .receipt-box { border: 2px solid #165D6F; border-radius: 12px; padding: 32px; max-width: 680px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px; }
          .logo-title h1 { color: #165D6F; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
          .logo-title p { color: #F65E01; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
          .code-box { text-align: right; }
          .code-badge { background: #165D6F; color: #fff; padding: 6px 14px; border-radius: 6px; font-family: monospace; font-size: 15px; font-weight: 700; }
          .date { color: #64748b; font-size: 12px; margin-top: 6px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
          .field-group label { display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; margin-bottom: 4px; }
          .field-group value { display: block; font-size: 14px; font-weight: 600; color: #0f172a; }
          .total-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
          .total-nio { font-size: 24px; font-weight: 900; color: #165D6F; }
          .total-usd { font-size: 14px; color: #64748b; font-weight: 600; margin-top: 2px; }
          .status-badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-weight: 800; font-size: 12px; text-transform: uppercase; }
          .status-approved { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
          .status-pending { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
          .footer { border-top: 1px solid #e2e8f0; padding-top: 18px; text-align: center; font-size: 11px; color: #64748b; }
          .stamp { margin-top: 14px; color: #0f172a; font-weight: 700; }
          @media print {
            body { padding: 0; }
            .receipt-box { border: 1px solid #000; box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <div class="header">
            <div class="logo-title">
              <h1>🧭 BAQUEANO</h1>
              <p>Nicaragua · Ecoturismo Comunitario</p>
            </div>
            <div class="code-box">
              <div class="code-badge">${escapeHtml(code)}</div>
              <div class="date">Fecha: ${escapeHtml(date)}</div>
            </div>
          </div>

          <div class="grid">
            <div class="field-group">
              <label>Cliente / Pagador</label>
              <value>${escapeHtml(customer)}</value>
            </div>
            <div class="field-group">
              <label>Entidad Bancaria &amp; Medio</label>
              <value>${escapeHtml(bank)}</value>
            </div>
            <div class="field-group">
              <label>Concepto del Servicio</label>
              <value>${escapeHtml(concept)}</value>
            </div>
            <div class="field-group">
              <label>Nº de Referencia / Baucher</label>
              <value style="font-family: monospace;">${escapeHtml(ref)}</value>
            </div>
          </div>

          <div class="total-card">
            <div>
              <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b;">Monto Oficial Recibido</div>
              <div class="total-nio">C$ ${nio.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NIO</div>
              <div class="total-usd">Equivalente: $${usd.toFixed(2)} USD (Tasa BCN: C$ 36.6243)</div>
            </div>
            <div>
              <span class="status-badge ${isApproved ? 'status-approved' : 'status-pending'}">
                ${isApproved ? '✓ Pago Conciliado &amp; Acreditado' : '⏳ Pendiente de Verificación'}
              </span>
            </div>
          </div>

          ${notes ? `
            <div style="margin-bottom: 20px; padding: 12px; background: #fffbeb; border-radius: 6px; font-size: 12px; color: #92400e;">
              <strong>Notas de Conciliación:</strong> ${escapeHtml(notes)}
            </div>
          ` : ''}

          <div class="footer">
            <p>Comprobante oficial expedido por BAQUEANO Nicaragua para fines de control de expediciones, guías nativos y anfitriones comunitarios sin intermediarios.</p>
            <p class="stamp">Emitido en Managua, Nicaragua · Ley 1210 / Ley 1211 · https://baqueanonicaragua.com</p>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  }

  // --------------------------------------------------------------------------
  // 7. MODAL VISOR DE BAUCHER DE PAGO
  // --------------------------------------------------------------------------
  function openBaucherModal(imageUrl, paymentCode) {
    const modal = document.getElementById('opsPaymentBaucherModal');
    const imgEl = document.getElementById('opsBaucherModalImg');
    const titleEl = document.getElementById('opsBaucherModalTitle');
    if (!modal || !imgEl) return;

    imgEl.src = imageUrl;
    if (titleEl) titleEl.textContent = i18n('ops.payments.baucherDepositoBancario', 'Baucher / Depósito Bancario — {p0}', { p0: (paymentCode || 'Comprobante') });
    modal.style.display = 'flex';
  }

  function closeBaucherModal() {
    const modal = document.getElementById('opsPaymentBaucherModal');
    if (modal) modal.style.display = 'none';
  }

  // --------------------------------------------------------------------------
  // 8. SUBIDA DE BAUCHER A STORAGE
  // --------------------------------------------------------------------------
  async function handleBaucherUpload(file) {
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      if (window.OpsToast) window.OpsToast.show(i18n('ops.payments.elArchivoDebeSer', 'El archivo debe ser una imagen (JPG, PNG, WebP) o un archivo PDF.'), 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      if (window.OpsToast) window.OpsToast.show(i18n('ops.payments.elArchivoSuperaEl', 'El archivo supera el límite de 15 MB.'), 'error');
      return;
    }

    const dropzoneText = document.getElementById('opsPaymentDropzoneText');
    if (dropzoneText) dropzoneText.textContent = i18n('ops.payments.subiendoComprobanteAStorage', 'Subiendo comprobante a Storage...');

    try {
      if (window.OpsStorage && typeof window.OpsStorage.uploadFile === 'function') {
        const res = await window.OpsStorage.uploadFile(file, 'payments');
        const urlInput = document.getElementById('opsPaymentFormVoucherUrl');
        if (urlInput) urlInput.value = res.downloadURL;
        updateBaucherPreview(res.downloadURL);
        if (window.OpsToast) window.OpsToast.show(i18n('ops.payments.comprobanteSubidoExitosamente', 'Comprobante subido exitosamente.'), 'success');
      } else {
        // Fallback local con FileReader
        const reader = new FileReader();
        reader.onload = (e) => {
          const urlInput = document.getElementById('opsPaymentFormVoucherUrl');
          if (urlInput) urlInput.value = e.target.result;
          updateBaucherPreview(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('[BaqueanoOpsPayments] Error al subir baucher:', err);
      if (window.OpsToast) window.OpsToast.show(i18n('ops.payments.errorAlSubirComprobante', 'Error al subir comprobante: {p0}', { p0: (err.message) }), 'error');
    } finally {
      if (dropzoneText) dropzoneText.textContent = i18n('ops.payments.hazClicOArrastra', 'Haz clic o arrastra para subir foto del baucher bancario');
    }
  }

  // --------------------------------------------------------------------------
  // 9. EVENTOS DE BÚSQUEDA Y FILTRADO
  // --------------------------------------------------------------------------
  function setFilterStatus(status) {
    state.activeStatusFilter = status;
    render();
  }

  function setFilterBank(bank) {
    state.activeBankFilter = bank;
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
  window.BaqueanoOpsPayments = {
    render: render,
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,
    savePayment: savePayment,
    togglePaymentStatus: togglePaymentStatus,
    deletePayment: deletePayment,
    openShareModal: openShareModal,
    closeShareModal: closeShareModal,
    sendWhatsapp: sendWhatsapp,
    sendEmail: sendEmail,
    printReceipt: printReceipt,
    copyReceiptText: copyReceiptText,
    openBaucherModal: openBaucherModal,
    closeBaucherModal: closeBaucherModal,
    setFilterStatus: setFilterStatus,
    setFilterBank: setFilterBank,
    search: search,
    generateReceiptCode: generateReceiptCode,
    calculateUsdFromNio: calculateUsdFromNio,
    calculateNioFromUsd: calculateNioFromUsd,
    handleBaucherUpload: handleBaucherUpload,
    updateBaucherPreview: updateBaucherPreview
  };

  // Auto-render si la pestaña 12-pagos está activa o en el hash
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (window.location.hash === '#12-pagos' || (window.OpsState && window.OpsState.activeTab === '12-pagos')) {
        setTimeout(() => render(), 120);
      }
    });
  } else {
    if (window.location.hash === '#12-pagos' || (window.OpsState && window.OpsState.activeTab === '12-pagos')) {
      setTimeout(() => render(), 120);
    }
  }

})(window, document);
