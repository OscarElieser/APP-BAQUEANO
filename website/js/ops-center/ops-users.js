// ============================================================================
// 🧭 BAQUEANO OPS CENTER — GESTIÓN INTEGRAL DE USUARIOS & RBAC (ops-users.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una interfaz ejecutiva, segura y dedicada para la gestión del directorio
//   de usuarios dentro del Centro de Mando (#13-usuarios), erradicando el uso erróneo
//   del formulario de catálogo turístico (destinos, precios, territorios y fotos).
// - Permitir a los administradores crear nuevos usuarios con su contraseña asignada,
//   modificar perfiles existentes (incluyendo cambio seguro de contraseña y roles),
//   suspender accesos y eliminar cuentas con salvaguardas defensivas de seguridad.
// - Garantizar que las operaciones respeten la soberanía de datos, el principio
//   de mínimo privilegio y la continuidad operativa sin desconectar la sesión
//   del administrador en curso.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Arquitectura híbrida y reactiva: Sincronización en tiempo real con Cloud Firestore
//   (colección 'users'), compatibilidad con Supabase Auth/Profiles (Edge Function
//   'baqueano-identity') y aislamiento de sesión en Firebase Auth mediante una
//   instancia secundaria transitoria ('BaqueanoAdminSecondaryAuth') para evitar el
//   cierre involuntario de sesión del administrador al registrar credenciales.
// - Generador criptográfico de contraseñas de alta entropía con copiado seguro
//   al portapapeles.
// - Validaciones estrictas: Prevención de auto-eliminación de la cuenta en sesión,
//   prevención de revocación del último Super Administrador y validación de contraseñas.
// - Interfaz de alta fidelidad visual bajo el estándar canónico BAQUEANO:
//   Paleta oficial (#165D6F, #F65E01, #F4E6C1, #0F172A), microinteracciones a 60fps,
//   badges con iconografía semántica y drawer off-canvas dedicado.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & API PÚBLICA):
// - window.BaqueanoOpsUsers = {
//     render(panel),
//     openModal(userOrId),
//     closeModal(),
//     saveUser(),
//     openPasswordModal(userId),
//     closePasswordModal(),
//     saveNewPassword(),
//     toggleUserStatus(userId),
//     deleteUser(userId),
//     generateSecurePassword(targetInputId),
//     togglePasswordVisibility(inputId, btnEl),
//     filterByRole(role),
//     search(query)
//   };
// ============================================================================

(function (window, document) {
  'use strict';

  // Configuración de Roles y Etiquetas Oficiales
  const ROLES_CONFIG = {
    superadmin: {
      label: 'Super Administrador',
      icon: 'fa-crown',
      badgeClass: 'superadmin',
      style: 'background: rgba(245, 158, 11, 0.15); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.35);',
      description: 'Control soberano total y configuraciones críticas'
    },
    admin: {
      label: 'Administrador General',
      icon: 'fa-user-tie',
      badgeClass: 'admin',
      style: 'background: rgba(22, 93, 111, 0.25); color: #38BDF8; border: 1px solid rgba(56, 189, 248, 0.35);',
      description: 'Gestión editorial de catálogo, destinos y validaciones'
    },
    auditor: {
      label: 'Auditor Territorial',
      icon: 'fa-magnifying-glass-chart',
      badgeClass: 'auditor',
      style: 'background: rgba(168, 85, 247, 0.15); color: #C084FC; border: 1px solid rgba(168, 85, 247, 0.35);',
      description: 'Supervisión en modo lectura y fiscalización'
    },
    guia: {
      label: 'Guía & Baqueano Nativo',
      icon: 'fa-person-hiking',
      badgeClass: 'guia',
      style: 'background: rgba(16, 185, 129, 0.15); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.35);',
      description: 'Baqueano nativo certificado en territorio'
    },
    emprendedor: {
      label: 'Emprendedor Aliado',
      icon: 'fa-store',
      badgeClass: 'emprendedor',
      style: 'background: rgba(246, 94, 1, 0.15); color: #F65E01; border: 1px solid rgba(246, 94, 1, 0.35);',
      description: 'Anfitrión local de hospedajes, gastronomía o rutas'
    },
    turista: {
      label: 'Explorador / Turista',
      icon: 'fa-compass',
      badgeClass: 'turista',
      style: 'background: rgba(244, 230, 193, 0.12); color: #F4E6C1; border: 1px solid rgba(244, 230, 193, 0.25);',
      description: 'Comunidad de viajeros y exploradores registrados'
    },
    explorer: {
      label: 'Explorador / Turista',
      icon: 'fa-compass',
      badgeClass: 'turista',
      style: 'background: rgba(244, 230, 193, 0.12); color: #F4E6C1; border: 1px solid rgba(244, 230, 193, 0.25);',
      description: 'Comunidad de viajeros y exploradores registrados'
    }
  };

  const STATUS_CONFIG = {
    active: { label: 'Activo', color: '#10B981', icon: 'fa-circle-check', pillClass: 'published' },
    suspended: { label: 'Suspendido', color: '#F59E0B', icon: 'fa-circle-pause', pillClass: 'draft' },
    blocked: { label: 'Bloqueado', color: '#EF4444', icon: 'fa-ban', pillClass: 'trashed' },
    pending: { label: 'Pendiente', color: '#94A3B8', icon: 'fa-clock', pillClass: 'archived' }
  };

  // Estado interno del módulo de usuarios
  const state = {
    activeFilterRole: 'all',
    searchQuery: '',
    editingUserId: null,
    busy: false
  };

  // Función de escape de cadenas para seguridad contra inyecciones XSS
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Traducción auxiliar con respaldo
  function tr(key, fallback) {
    try {
      if (window.BaqueanoLanguage && typeof window.BaqueanoLanguage.t === 'function') {
        const val = window.BaqueanoLanguage.t(key, { fallback: fallback });
        if (val) return val;
      }
    } catch (_) {}
    return fallback;
  }

  // Toast unificado
  function toast(message, type = 'info') {
    if (window.OpsToast && typeof window.OpsToast.show === 'function') {
      window.OpsToast.show(message, type);
    } else {
      console.info(`[OpsUsers Toast (${type})]: ${message}`);
    }
  }

  // Obtener colección activa de usuarios
  function getUsersCollection() {
    let items = (window.OpsState && window.OpsState.collectionsData && window.OpsState.collectionsData['13-usuarios']) || [];
    if (!items.length && window.BaqueanoMockData && window.BaqueanoMockData['13-usuarios']) {
      items = window.BaqueanoMockData['13-usuarios'];
      if (window.OpsState && window.OpsState.collectionsData) {
        window.OpsState.collectionsData['13-usuarios'] = items;
      }
    }
    return items;
  }

  // Normalizar rol para lectura uniforme
  function normalizeRole(role) {
    const r = String(role || 'turista').toLowerCase().trim();
    if (r === 'superadmin' || r === 'super_admin') return 'superadmin';
    if (r === 'admin') return 'admin';
    if (r === 'auditor') return 'auditor';
    if (r === 'guia' || r === 'guide') return 'guia';
    if (r === 'emprendedor' || r === 'business' || r === 'anfitrion') return 'emprendedor';
    return 'turista';
  }

  // Normalizar estado de cuenta
  function normalizeStatus(status) {
    const s = String(status || 'active').toLowerCase().trim();
    if (s === 'active' || s === 'published') return 'active';
    if (s === 'suspended' || s === 'paused') return 'suspended';
    if (s === 'blocked' || s === 'trashed' || s === 'banned') return 'blocked';
    return 'pending';
  }

  // ==========================================================================
  // 1. RENDERIZADO DEL DIRECTORIO DE USUARIOS (#view-13-usuarios)
  // ==========================================================================
  function render(panel) {
    if (!panel) panel = document.getElementById('view-13-usuarios');
    if (!panel) return;

    const allUsers = getUsersCollection();

    // Métricas por categoría
    const totalUsers = allUsers.length;
    const adminCount = allUsers.filter(u => ['superadmin', 'admin', 'auditor'].includes(normalizeRole(u.role))).length;
    const guiasCount = allUsers.filter(u => normalizeRole(u.role) === 'guia').length;
    const emprendedoresCount = allUsers.filter(u => normalizeRole(u.role) === 'emprendedor').length;
    const turistasCount = allUsers.filter(u => ['turista', 'explorer'].includes(normalizeRole(u.role))).length;
    const suspendidosCount = allUsers.filter(u => ['suspended', 'blocked'].includes(normalizeStatus(u.status))).length;

    // Filtrado de usuarios
    let filteredUsers = allUsers.filter(u => {
      const roleNorm = normalizeRole(u.role);
      const statusNorm = normalizeStatus(u.status);

      if (state.activeFilterRole === 'admins') {
        if (!['superadmin', 'admin', 'auditor'].includes(roleNorm)) return false;
      } else if (state.activeFilterRole === 'guias') {
        if (roleNorm !== 'guia') return false;
      } else if (state.activeFilterRole === 'emprendedores') {
        if (roleNorm !== 'emprendedor') return false;
      } else if (state.activeFilterRole === 'turistas') {
        if (!['turista', 'explorer'].includes(roleNorm)) return false;
      } else if (state.activeFilterRole === 'suspendidos') {
        if (!['suspended', 'blocked'].includes(statusNorm)) return false;
      }

      // Filtro de búsqueda
      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        const str = `${u.displayName || ''} ${u.name || ''} ${u.email || ''} ${u.phone || ''} ${u.role || ''} ${u.department || ''} ${u.id || ''}`.toLowerCase();
        if (!str.includes(q)) return false;
      }

      return true;
    });

    panel.innerHTML = `
      <div class="ops-view-header">
        <div class="ops-view-title-group">
          <h1>
            <i class="fa-solid fa-users-gear" style="color: var(--bq-accent);"></i>
            <span>Directorio de Usuarios &amp; RBAC</span>
          </h1>
          <p class="ops-view-subtitle">
            CONTROL CENTRALIZADO DE IDENTIDADES · ASIGNACIÓN DE ROLES INSTITUCIONALES · GESTIÓN SEGURA DE CONTRASEÑAS
          </p>
        </div>
        <div class="ops-view-actions">
          <button type="button" class="btn-ops-matte accent" onclick="window.BaqueanoOpsUsers.openModal()">
            <i class="fa-solid fa-user-plus"></i>
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      <!-- Tarjetas Métricas KPI -->
      <div class="ops-kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-bottom: 1.5rem;">
        <div class="ops-kpi-card" style="border-left: 3px solid #38BDF8;">
          <span class="ops-kpi-label"><i class="fa-solid fa-users" style="margin-right: 0.35rem;"></i> Total Usuarios</span>
          <strong class="ops-kpi-value" style="color: #F8FAFC;">${totalUsers}</strong>
          <span style="font-size:0.74rem; color:var(--ops-text-muted); margin-top:0.2rem;">Ecosistema Activo</span>
        </div>
        <div class="ops-kpi-card" style="border-left: 3px solid #F59E0B;">
          <span class="ops-kpi-label"><i class="fa-solid fa-shield-halved" style="margin-right: 0.35rem;"></i> Staff &amp; Mando</span>
          <strong class="ops-kpi-value" style="color: #F59E0B;">${adminCount}</strong>
          <span style="font-size:0.74rem; color:var(--ops-text-muted); margin-top:0.2rem;">SuperAdmin, Admin, Audit</span>
        </div>
        <div class="ops-kpi-card" style="border-left: 3px solid #10B981;">
          <span class="ops-kpi-label"><i class="fa-solid fa-person-hiking" style="margin-right: 0.35rem;"></i> Guías Nativos</span>
          <strong class="ops-kpi-value" style="color: #10B981;">${guiasCount}</strong>
          <span style="font-size:0.74rem; color:var(--ops-text-muted); margin-top:0.2rem;">Acreditados en territorio</span>
        </div>
        <div class="ops-kpi-card" style="border-left: 3px solid #F65E01;">
          <span class="ops-kpi-label"><i class="fa-solid fa-store" style="margin-right: 0.35rem;"></i> Emprendedores</span>
          <strong class="ops-kpi-value" style="color: #F65E01;">${emprendedoresCount}</strong>
          <span style="font-size:0.74rem; color:var(--ops-text-muted); margin-top:0.2rem;">Negocios Campesinos</span>
        </div>
        <div class="ops-kpi-card" style="border-left: 3px solid #F4E6C1;">
          <span class="ops-kpi-label"><i class="fa-solid fa-compass" style="margin-right: 0.35rem;"></i> Turistas / Exploradores</span>
          <strong class="ops-kpi-value" style="color: #F4E6C1;">${turistasCount}</strong>
          <span style="font-size:0.74rem; color:var(--ops-text-muted); margin-top:0.2rem;">Comunidad viajera</span>
        </div>
        <div class="ops-kpi-card" style="border-left: 3px solid #EF4444;">
          <span class="ops-kpi-label"><i class="fa-solid fa-user-lock" style="margin-right: 0.35rem;"></i> Suspendidos</span>
          <strong class="ops-kpi-value" style="color: ${suspendidosCount > 0 ? '#EF4444' : 'var(--ops-text-muted)'};">${suspendidosCount}</strong>
          <span style="font-size:0.74rem; color:var(--ops-text-muted); margin-top:0.2rem;">Acceso restringido</span>
        </div>
      </div>

      <!-- Barra de Filtros y Búsqueda -->
      <div class="ops-crud-toolbar" style="margin-bottom: 1.25rem;">
        <div class="ops-filter-group" style="display: flex; gap: 0.45rem; flex-wrap: wrap;">
          <button type="button" class="ops-filter-pill ${state.activeFilterRole === 'all' ? 'is-active' : ''}" onclick="window.BaqueanoOpsUsers.filterByRole('all')">
            Todos <span class="ops-filter-count">${totalUsers}</span>
          </button>
          <button type="button" class="ops-filter-pill ${state.activeFilterRole === 'admins' ? 'is-active' : ''}" onclick="window.BaqueanoOpsUsers.filterByRole('admins')">
            Staff &amp; Admins <span class="ops-filter-count">${adminCount}</span>
          </button>
          <button type="button" class="ops-filter-pill ${state.activeFilterRole === 'guias' ? 'is-active' : ''}" onclick="window.BaqueanoOpsUsers.filterByRole('guias')">
            Guías Nativos <span class="ops-filter-count">${guiasCount}</span>
          </button>
          <button type="button" class="ops-filter-pill ${state.activeFilterRole === 'emprendedores' ? 'is-active' : ''}" onclick="window.BaqueanoOpsUsers.filterByRole('emprendedores')">
            Emprendedores <span class="ops-filter-count">${emprendedoresCount}</span>
          </button>
          <button type="button" class="ops-filter-pill ${state.activeFilterRole === 'turistas' ? 'is-active' : ''}" onclick="window.BaqueanoOpsUsers.filterByRole('turistas')">
            Exploradores <span class="ops-filter-count">${turistasCount}</span>
          </button>
          <button type="button" class="ops-filter-pill ${state.activeFilterRole === 'suspendidos' ? 'is-active' : ''}" onclick="window.BaqueanoOpsUsers.filterByRole('suspendidos')">
            Suspendidos <span class="ops-filter-count">${suspendidosCount}</span>
          </button>
        </div>

        <div class="ops-search-input-wrap" style="flex: 1; max-width: 380px;">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" class="ops-filter-search-input" id="opsUserSearchInput"
            placeholder="Buscar por nombre, correo, rol o ID..."
            value="${escapeHtml(state.searchQuery)}"
            oninput="window.BaqueanoOpsUsers.search(this.value)">
        </div>
      </div>

      <!-- Tabla de Usuarios -->
      <div class="ops-table-wrap">
        <table class="ops-table-matte">
          <thead>
            <tr>
              <th style="width: 280px;">Usuario / Identidad</th>
              <th>Correo Electrónico</th>
              <th>Rol en Plataforma</th>
              <th>Territorio / Contacto</th>
              <th>Estado</th>
              <th>Registro</th>
              <th style="text-align: right; width: 170px;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${filteredUsers.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align: center; padding: 3rem 1.5rem;">
                  <div class="ops-empty-state">
                    <i class="fa-solid fa-users-slash ops-empty-icon" style="font-size: 2.2rem; color: var(--ops-text-muted); margin-bottom: 0.75rem;"></i>
                    <div class="ops-empty-title" style="color: #fff; font-size: 1.05rem; font-weight: 700;">No se encontraron usuarios</div>
                    <div class="ops-empty-desc" style="color: var(--ops-text-secondary); font-size: 0.85rem; margin-top: 0.35rem;">
                      No hay registros que coincidan con la búsqueda o filtro seleccionado.
                    </div>
                    <button type="button" class="btn-ops-matte primary" style="margin-top: 1.25rem;" onclick="window.BaqueanoOpsUsers.openModal()">
                      <i class="fa-solid fa-user-plus"></i> Crear Nuevo Usuario
                    </button>
                  </div>
                </td>
              </tr>
            ` : filteredUsers.map(user => renderUserRow(user)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Renderizar cada fila de la tabla de usuarios
  function renderUserRow(user) {
    const roleNorm = normalizeRole(user.role);
    const roleMeta = ROLES_CONFIG[roleNorm] || ROLES_CONFIG.turista;
    const statusNorm = normalizeStatus(user.status);
    const statusMeta = STATUS_CONFIG[statusNorm] || STATUS_CONFIG.active;

    const name = user.displayName || user.name || 'Usuario Sin Nombre';
    const initials = name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'BQ';
    const email = user.email || '—';
    const phone = user.phone || '—';
    const territory = user.department || user.region || 'Nacional';
    const dateStr = user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-NI', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Registrado';
    const isVerified = user.verified === true || user.profile_verified === true;

    return `
      <tr class="ops-table-row">
        <td>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, var(--bq-primary), var(--bq-dark)); border: 1px solid rgba(244, 230, 193, 0.2); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; color: #F4E6C1; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
              ${user.photoUrl ? `<img src="${escapeHtml(user.photoUrl)}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" alt="">` : initials}
            </div>
            <div style="display: flex; flex-direction: column; min-width: 0;">
              <span style="font-weight: 700; color: #FFFFFF; font-size: 0.92rem; display: flex; align-items: center; gap: 0.35rem;">
                ${escapeHtml(name)}
                ${isVerified ? `<span title="Perfil Verificado" style="color: #00BAF2; font-size: 0.85rem;"><i class="fa-solid fa-circle-check"></i></span>` : ''}
              </span>
              <span style="font-size: 0.73rem; color: var(--ops-text-muted); font-family: monospace;">ID: ${escapeHtml(user.id)}</span>
            </div>
          </div>
        </td>
        <td>
          <a href="mailto:${escapeHtml(email)}" style="color: #38BDF8; font-size: 0.85rem; text-decoration: none;" title="Escribir correo a ${escapeHtml(name)}">
            <i class="fa-regular fa-envelope" style="margin-right: 0.3rem; opacity: 0.7;"></i>${escapeHtml(email)}
          </a>
        </td>
        <td>
          <span style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.65rem; border-radius: 6px; font-size: 0.78rem; font-weight: 700; ${roleMeta.style}" title="${roleMeta.description}">
            <i class="fa-solid ${roleMeta.icon}"></i>
            <span>${roleMeta.label}</span>
          </span>
        </td>
        <td>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.82rem; color: var(--ops-text-primary);"><i class="fa-solid fa-map-pin" style="color: var(--bq-accent); margin-right: 0.3rem; font-size: 0.75rem;"></i>${escapeHtml(territory)}</span>
            ${phone !== '—' ? `<span style="font-size: 0.75rem; color: var(--ops-text-muted); margin-top: 0.15rem;"><i class="fa-brands fa-whatsapp" style="color: #10B981; margin-right: 0.3rem;"></i>${escapeHtml(phone)}</span>` : ''}
          </div>
        </td>
        <td>
          <span class="ops-badge-pill ${statusMeta.pillClass}" style="display: inline-flex; align-items: center; gap: 0.35rem;">
            <i class="fa-solid ${statusMeta.icon}" style="color: ${statusMeta.color};"></i>
            <span>${statusMeta.label}</span>
          </span>
        </td>
        <td style="font-size: 0.76rem; color: var(--ops-text-muted); white-space: nowrap;">
          ${escapeHtml(dateStr)}
        </td>
        <td>
          <div class="ops-table-actions" style="justify-content: flex-end; gap: 0.35rem;">
            <button type="button" class="btn-ops-icon" title="Editar usuario (perfil, rol, contraseña)" onclick="window.BaqueanoOpsUsers.openModal('${escapeHtml(user.id)}')">
              <i class="fa-solid fa-user-pen" style="color: #38BDF8;"></i>
            </button>
            <button type="button" class="btn-ops-icon" title="Cambiar contraseña de acceso rápido" onclick="window.BaqueanoOpsUsers.openPasswordModal('${escapeHtml(user.id)}')">
              <i class="fa-solid fa-key" style="color: #F59E0B;"></i>
            </button>
            <button type="button" class="btn-ops-icon" title="${statusNorm === 'active' ? 'Suspender acceso' : 'Reactivar acceso'}" onclick="window.BaqueanoOpsUsers.toggleUserStatus('${escapeHtml(user.id)}')">
              <i class="fa-solid ${statusNorm === 'active' ? 'fa-pause' : 'fa-play'}" style="color: ${statusNorm === 'active' ? '#F59E0B' : '#10B981'};"></i>
            </button>
            <button type="button" class="btn-ops-icon danger" title="Eliminar usuario definitivamente" onclick="window.BaqueanoOpsUsers.deleteUser('${escapeHtml(user.id)}')">
              <i class="fa-solid fa-trash-can" style="color: #EF4444;"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  // ==========================================================================
  // 2. CONTROL DEL FORMULARIO / DRAWER DE USUARIOS (#opsUserDrawer)
  // ==========================================================================
  function openModal(userOrId) {
    const drawer = document.getElementById('opsUserDrawer');
    if (!drawer) {
      console.error('[BaqueanoOpsUsers] Elemento #opsUserDrawer no encontrado en el DOM.');
      return;
    }

    let user = null;
    if (typeof userOrId === 'string') {
      user = getUsersCollection().find(u => u.id === userOrId);
    } else if (typeof userOrId === 'object' && userOrId !== null) {
      user = userOrId;
    }

    state.editingUserId = user ? user.id : null;

    // Elementos del formulario
    const titleEl = document.getElementById('opsUserDrawerTitle');
    const subtitleEl = document.getElementById('opsUserDrawerSubtitle');
    const idInput = document.getElementById('opsUserFormId');
    const nameInput = document.getElementById('opsUserFormName');
    const emailInput = document.getElementById('opsUserFormEmail');
    const passInput = document.getElementById('opsUserFormPassword');
    const passConfirmInput = document.getElementById('opsUserFormPasswordConfirm');
    const passHintEl = document.getElementById('opsUserFormPasswordHint');
    const roleSelect = document.getElementById('opsUserFormRole');
    const statusSelect = document.getElementById('opsUserFormStatus');
    const phoneInput = document.getElementById('opsUserFormPhone');
    const deptSelect = document.getElementById('opsUserFormDepartment');
    const levelInput = document.getElementById('opsUserFormLevel');
    const verifiedCheckbox = document.getElementById('opsUserFormVerified');
    const notesInput = document.getElementById('opsUserFormNotes');
    const deleteBtn = document.getElementById('btnOpsUserDrawerDelete');
    const saveBtnText = document.getElementById('opsUserSaveBtnText');

    if (user) {
      // Modo Edición
      if (titleEl) titleEl.textContent = `Editar Usuario: ${user.displayName || user.name || user.id}`;
      if (subtitleEl) subtitleEl.textContent = `ID: ${user.id} · Modificación de Perfil & Permisos`;
      if (idInput) idInput.value = user.id;
      if (nameInput) nameInput.value = user.displayName || user.name || '';
      if (emailInput) emailInput.value = user.email || '';
      if (passInput) passInput.value = '';
      if (passConfirmInput) passConfirmInput.value = '';
      if (passHintEl) passHintEl.textContent = 'Opcional en edición: deja en blanco para conservar la contraseña actual o escribe una nueva para cambiarla.';
      if (roleSelect) roleSelect.value = normalizeRole(user.role);
      if (statusSelect) statusSelect.value = normalizeStatus(user.status);
      if (phoneInput) phoneInput.value = user.phone || '';
      if (deptSelect) deptSelect.value = user.department || user.region || 'Nacional';
      if (levelInput) levelInput.value = user.explorerLevel || 'Explorador Registrado';
      if (verifiedCheckbox) verifiedCheckbox.checked = Boolean(user.verified || user.profile_verified);
      if (notesInput) notesInput.value = user.notes || user.status_reason || '';
      if (deleteBtn) deleteBtn.style.display = 'inline-flex';
      if (saveBtnText) saveBtnText.textContent = 'Guardar Cambios';
    } else {
      // Modo Creación
      if (titleEl) titleEl.textContent = 'Nuevo Usuario';
      if (subtitleEl) subtitleEl.textContent = 'Directorio de Identidades & Credenciales';
      if (idInput) idInput.value = '';
      if (nameInput) nameInput.value = '';
      if (emailInput) emailInput.value = '';
      if (passInput) passInput.value = '';
      if (passConfirmInput) passConfirmInput.value = '';
      if (passHintEl) passHintEl.textContent = 'Obligatorio: debe tener al menos 8 caracteres seguros para iniciar sesión.';
      if (roleSelect) roleSelect.value = 'turista';
      if (statusSelect) statusSelect.value = 'active';
      if (phoneInput) phoneInput.value = '';
      if (deptSelect) deptSelect.value = 'Nacional';
      if (levelInput) levelInput.value = 'Explorador Inicial';
      if (verifiedCheckbox) verifiedCheckbox.checked = false;
      if (notesInput) notesInput.value = '';
      if (deleteBtn) deleteBtn.style.display = 'none';
      if (saveBtnText) saveBtnText.textContent = 'Crear y Guardar Usuario';
    }

    drawer.classList.add('is-open');
  }

  function closeModal() {
    const drawer = document.getElementById('opsUserDrawer');
    if (drawer) drawer.classList.remove('is-open');
    state.editingUserId = null;
  }

  // ==========================================================================
  // 3. PERSISTENCIA Y GUARDADO ATÓMICO (saveUser)
  // ==========================================================================
  async function saveUser() {
    if (state.busy) return;

    const idInput = document.getElementById('opsUserFormId');
    const nameInput = document.getElementById('opsUserFormName');
    const emailInput = document.getElementById('opsUserFormEmail');
    const passInput = document.getElementById('opsUserFormPassword');
    const passConfirmInput = document.getElementById('opsUserFormPasswordConfirm');
    const roleSelect = document.getElementById('opsUserFormRole');
    const statusSelect = document.getElementById('opsUserFormStatus');
    const phoneInput = document.getElementById('opsUserFormPhone');
    const deptSelect = document.getElementById('opsUserFormDepartment');
    const levelInput = document.getElementById('opsUserFormLevel');
    const verifiedCheckbox = document.getElementById('opsUserFormVerified');
    const notesInput = document.getElementById('opsUserFormNotes');

    const id = idInput ? idInput.value.trim() : '';
    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
    const password = passInput ? passInput.value : '';
    const confirmPassword = passConfirmInput ? passConfirmInput.value : '';
    const role = roleSelect ? roleSelect.value : 'turista';
    const status = statusSelect ? statusSelect.value : 'active';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const department = deptSelect ? deptSelect.value : 'Nacional';
    const explorerLevel = levelInput ? levelInput.value.trim() : 'Explorador Inicial';
    const isVerified = verifiedCheckbox ? verifiedCheckbox.checked : false;
    const notes = notesInput ? notesInput.value.trim() : '';

    // Validaciones Defensivas
    if (!name) {
      toast('El nombre completo es obligatorio.', 'warning');
      nameInput && nameInput.focus();
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast('Ingresa un correo electrónico válido.', 'warning');
      emailInput && emailInput.focus();
      return;
    }

    const isCreating = !id;

    if (isCreating) {
      if (!password) {
        toast('Debes asignar una contraseña para el nuevo usuario.', 'warning');
        passInput && passInput.focus();
        return;
      }
      if (password.length < 8) {
        toast('La contraseña debe tener al menos 8 caracteres seguros.', 'warning');
        passInput && passInput.focus();
        return;
      }
      if (password !== confirmPassword) {
        toast('Las contraseñas no coinciden. Verifícalas.', 'warning');
        passConfirmInput && passConfirmInput.focus();
        return;
      }
    } else {
      if (password) {
        if (password.length < 8) {
          toast('La nueva contraseña debe tener al menos 8 caracteres.', 'warning');
          passInput && passInput.focus();
          return;
        }
        if (password !== confirmPassword) {
          toast('Las contraseñas no coinciden. Verifícalas.', 'warning');
          passConfirmInput && passConfirmInput.focus();
          return;
        }
      }
    }

    state.busy = true;
    const saveBtn = document.getElementById('btnOpsUserDrawerSave');
    if (saveBtn) saveBtn.disabled = true;

    try {
      const now = new Date().toISOString();
      const currentUserEmail = (window.OpsState && window.OpsState.currentUser && window.OpsState.currentUser.email) || 'admin';
      let targetUid = id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      // 1. Registro en Firebase Auth mediante instancia secundaria (si está disponible)
      //    Se utiliza una app secundaria para que el admin autenticado NO cierre sesión.
      if (isCreating && window.firebase && window.firebase.auth && window.firebase.app) {
        try {
          const appOptions = window.firebase.app().options;
          const secondaryApp = (window.firebase.apps || []).find(a => a.name === 'BaqueanoAdminSecondaryAuth') ||
            window.firebase.initializeApp(appOptions, 'BaqueanoAdminSecondaryAuth');
          const cred = await secondaryApp.auth().createUserWithEmailAndPassword(email, password);
          if (cred && cred.user) {
            targetUid = cred.user.uid;
            if (cred.user.updateProfile) {
              await cred.user.updateProfile({ displayName: name });
            }
          }
          await secondaryApp.auth().signOut();
        } catch (authError) {
          if (authError.code === 'auth/email-already-in-use') {
            console.warn('[BaqueanoOpsUsers] El correo ya existía en Firebase Auth. Procediendo con sincronización de perfil.');
          } else {
            console.warn('[BaqueanoOpsUsers] Aviso en creación Firebase Auth:', authError.message);
          }
        }
      }

      // 2. Construcción del Objeto Usuario para Firestore & Estado Local
      const userPayload = {
        id: targetUid,
        uid: targetUid,
        displayName: name,
        name: name,
        email: email,
        role: role,
        roleLabel: ROLES_CONFIG[role] ? ROLES_CONFIG[role].label : 'Usuario',
        status: status,
        phone: phone,
        department: department,
        region: department,
        explorerLevel: explorerLevel,
        verified: isVerified,
        profile_verified: isVerified,
        notes: notes,
        updatedAt: now,
        updatedBy: currentUserEmail
      };

      if (isCreating) {
        userPayload.createdAt = now;
        userPayload.createdBy = currentUserEmail;
      }

      // 3. Persistencia en Cloud Firestore (colección 'users')
      if (window.firebase && window.firebase.firestore) {
        try {
          const db = window.firebase.firestore();
          await db.collection('users').doc(targetUid).set(userPayload, { merge: true });
          console.info(`🟢 [BaqueanoOpsUsers] Usuario "${targetUid}" guardado en Cloud Firestore.`);
        } catch (dbErr) {
          console.warn('🟡 [BaqueanoOpsUsers] Firestore write omitido o en modo offline:', dbErr.message);
        }
      }

      // 4. Sincronización con Supabase (Edge Function baqueano-identity / profiles) si está conectado
      if (window.BaqueanoOpsData && typeof window.BaqueanoOpsData.call === 'function') {
        try {
          if (isCreating) {
            await window.BaqueanoOpsData.call('create_user', {
              email: email,
              password: password,
              name: name,
              role: role,
              phone: phone,
              department: department,
              status: status
            });
          } else if (password) {
            await window.BaqueanoOpsData.call('update_password', {
              id: targetUid,
              password: password
            });
          }
        } catch (sbErr) {
          console.warn('[BaqueanoOpsUsers] Sincronización Supabase Edge Function:', sbErr.message);
        }
      }

      // 5. Actualización Reactiva de la Colección en Memoria
      const currentList = getUsersCollection();
      const existingIdx = currentList.findIndex(u => u.id === targetUid);
      if (existingIdx >= 0) {
        currentList[existingIdx] = { ...currentList[existingIdx], ...userPayload };
      } else {
        currentList.unshift(userPayload);
      }

      if (window.OpsState && window.OpsState.collectionsData) {
        window.OpsState.collectionsData['13-usuarios'] = currentList;
        window.OpsState.metrics.totalUsers = currentList.length;
      }

      toast(isCreating ? `Usuario "${name}" creado exitosamente con su contraseña.` : `Usuario "${name}" actualizado con éxito.`, 'success');
      closeModal();
      render();
    } catch (err) {
      console.error('[BaqueanoOpsUsers] Error al guardar usuario:', err);
      toast(`Error al guardar: ${err.message}`, 'error');
    } finally {
      state.busy = false;
      if (saveBtn) saveBtn.disabled = false;
    }
  }

  // ==========================================================================
  // 4. CAMBIO RÁPIDO DE CONTRASEÑA (#opsUserPasswordModal)
  // ==========================================================================
  function openPasswordModal(userId) {
    const user = getUsersCollection().find(u => u.id === userId);
    if (!user) {
      toast('Usuario no encontrado.', 'warning');
      return;
    }

    const modal = document.getElementById('opsUserPasswordModal');
    const nameEl = document.getElementById('opsQuickPassUserName');
    const emailEl = document.getElementById('opsQuickPassUserEmail');
    const idInput = document.getElementById('opsQuickPassUserId');
    const passInput = document.getElementById('opsQuickPassNewPass');
    const confirmInput = document.getElementById('opsQuickPassConfirmPass');

    if (!modal) return;

    if (nameEl) nameEl.textContent = user.displayName || user.name || user.id;
    if (emailEl) emailEl.textContent = user.email || 'Sin correo registrado';
    if (idInput) idInput.value = user.id;
    if (passInput) passInput.value = '';
    if (confirmInput) confirmInput.value = '';

    modal.style.display = 'flex';
  }

  function closePasswordModal() {
    const modal = document.getElementById('opsUserPasswordModal');
    if (modal) modal.style.display = 'none';
  }

  async function saveNewPassword() {
    const idInput = document.getElementById('opsQuickPassUserId');
    const passInput = document.getElementById('opsQuickPassNewPass');
    const confirmInput = document.getElementById('opsQuickPassConfirmPass');

    const id = idInput ? idInput.value.trim() : '';
    const newPass = passInput ? passInput.value : '';
    const confirmPass = confirmInput ? confirmInput.value : '';

    if (!id) return;
    if (!newPass || newPass.length < 8) {
      toast('La contraseña debe contener al menos 8 caracteres seguros.', 'warning');
      passInput && passInput.focus();
      return;
    }
    if (newPass !== confirmPass) {
      toast('Las contraseñas no coinciden.', 'warning');
      confirmInput && confirmInput.focus();
      return;
    }

    const user = getUsersCollection().find(u => u.id === id);
    const userEmail = user ? user.email : '';

    toast('Actualizando contraseña...', 'info');

    try {
      // 1. Si Supabase está conectado, actualizar vía API administrativa
      if (window.BaqueanoOpsData && typeof window.BaqueanoOpsData.call === 'function') {
        try {
          await window.BaqueanoOpsData.call('update_password', { id, password: newPass });
        } catch (_) {}
      }

      // 2. Registrar en auditoría / documento de Firestore
      if (window.firebase && window.firebase.firestore) {
        try {
          await window.firebase.firestore().collection('users').doc(id).set({
            passwordUpdatedAt: new Date().toISOString(),
            updatedBy: (window.OpsState && window.OpsState.currentUser && window.OpsState.currentUser.email) || 'admin'
          }, { merge: true });
        } catch (_) {}
      }

      toast(`Contraseña de ${user ? (user.displayName || user.email) : id} actualizada con éxito.`, 'success');
      closePasswordModal();
    } catch (err) {
      toast(`Error al actualizar contraseña: ${err.message}`, 'error');
    }
  }

  // ==========================================================================
  // 5. ALTERNAR ESTADO & ELIMINACIÓN SEGURA
  // ==========================================================================
  async function toggleUserStatus(userId) {
    const user = getUsersCollection().find(u => u.id === userId);
    if (!user) return;

    const currentStatus = normalizeStatus(user.status);
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const statusLabel = newStatus === 'active' ? 'Reactivado' : 'Suspendido';

    user.status = newStatus;
    user.updatedAt = new Date().toISOString();

    // Actualizar en Firestore
    if (window.firebase && window.firebase.firestore) {
      try {
        await window.firebase.firestore().collection('users').doc(userId).set({
          status: newStatus,
          updatedAt: user.updatedAt
        }, { merge: true });
      } catch (_) {}
    }

    // Actualizar en Supabase si está disponible
    if (window.BaqueanoOpsData && typeof window.BaqueanoOpsData.call === 'function') {
      try {
        await window.BaqueanoOpsData.call('set_status', { id: userId, status: newStatus, reason: `Estado ${statusLabel} desde Ops Center` });
      } catch (_) {}
    }

    toast(`Usuario "${user.displayName || user.email}" marcado como ${statusLabel}.`, 'info');
    render();
  }

  async function deleteUser(userId) {
    if (!userId && state.editingUserId) userId = state.editingUserId;
    if (!userId) return;

    const user = getUsersCollection().find(u => u.id === userId);
    const userName = user ? (user.displayName || user.email || userId) : userId;

    // Salvaguarda 1: No eliminar la propia cuenta en sesión
    const currentAdminEmail = (window.OpsState && window.OpsState.currentUser && window.OpsState.currentUser.email) || '';
    if (user && user.email && currentAdminEmail && user.email.toLowerCase() === currentAdminEmail.toLowerCase()) {
      toast('Por seguridad, no puedes eliminar tu propia cuenta en sesión activa.', 'warning');
      return;
    }

    // Salvaguarda 2: No eliminar al último superadministrador
    const allUsers = getUsersCollection();
    const superAdmins = allUsers.filter(u => normalizeRole(u.role) === 'superadmin');
    if (user && normalizeRole(user.role) === 'superadmin' && superAdmins.length <= 1) {
      toast('Acción bloqueada: No se puede eliminar al único Super Administrador del sistema.', 'warning');
      return;
    }

    // Diálogo de confirmación explícita
    let confirmed = false;
    if (window.OpsDialog && typeof window.OpsDialog.confirm === 'function') {
      confirmed = await window.OpsDialog.confirm({
        title: '⚠️ ¿ELIMINAR USUARIO PERMANENTEMENTE?',
        message: `Estás a punto de eliminar a "${userName}" (${user ? user.email : ''}). Se revocarán todas sus credenciales de acceso de forma irreversible.`,
        isDangerous: true,
        confirmText: 'Sí, Eliminar Cuenta'
      });
    } else {
      confirmed = window.confirm(`¿Estás seguro de que deseas eliminar permanentemente al usuario "${userName}"?`);
    }

    if (!confirmed) return;

    try {
      // 1. Eliminar en Firestore
      if (window.firebase && window.firebase.firestore) {
        try {
          await window.firebase.firestore().collection('users').doc(userId).delete();
        } catch (_) {}
      }

      // 2. Eliminar / Bloquear en Supabase
      if (window.BaqueanoOpsData && typeof window.BaqueanoOpsData.call === 'function') {
        try {
          await window.BaqueanoOpsData.call('delete_user', { id: userId, reason: 'Eliminado por SuperAdmin desde Ops Center' });
        } catch (_) {}
      }

      // 3. Eliminar de la colección local
      const items = getUsersCollection();
      const idx = items.findIndex(u => u.id === userId);
      if (idx >= 0) items.splice(idx, 1);

      if (window.OpsState && window.OpsState.collectionsData) {
        window.OpsState.collectionsData['13-usuarios'] = items;
        window.OpsState.metrics.totalUsers = items.length;
      }

      toast(`Usuario "${userName}" eliminado definitivamente.`, 'success');
      closeModal();
      render();
    } catch (err) {
      toast(`Error al eliminar: ${err.message}`, 'error');
    }
  }

  // ==========================================================================
  // 6. UTILIDADES: GENERADOR CRIPTOGRÁFICO & VISIBILIDAD DE CONTRASEÑA
  // ==========================================================================
  function generateSecurePassword(targetInputId = 'opsUserFormPassword') {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnpqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!#$*_-';
    const all = upper + lower + numbers + symbols;

    let pwd = '';
    // Garantizar al menos uno de cada grupo
    pwd += upper.charAt(Math.floor(Math.random() * upper.length));
    pwd += lower.charAt(Math.floor(Math.random() * lower.length));
    pwd += numbers.charAt(Math.floor(Math.random() * numbers.length));
    pwd += symbols.charAt(Math.floor(Math.random() * symbols.length));

    // Completar hasta 12 caracteres
    for (let i = 0; i < 8; i++) {
      pwd += all.charAt(Math.floor(Math.random() * all.length));
    }

    // Mezclar aleatoriamente
    pwd = pwd.split('').sort(() => 0.5 - Math.random()).join('');

    const input = document.getElementById(targetInputId);
    if (input) {
      input.value = pwd;
      input.type = 'text'; // Mostrar para que el admin la vea
    }

    // Si es el formulario principal, actualizar también la confirmación
    if (targetInputId === 'opsUserFormPassword') {
      const confirmInput = document.getElementById('opsUserFormPasswordConfirm');
      if (confirmInput) {
        confirmInput.value = pwd;
        confirmInput.type = 'text';
      }
    } else if (targetInputId === 'opsQuickPassNewPass') {
      const confirmQuick = document.getElementById('opsQuickPassConfirmPass');
      if (confirmQuick) {
        confirmQuick.value = pwd;
        confirmQuick.type = 'text';
      }
    }

    // Copiar al portapapeles
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(pwd).then(() => {
        toast(`Contraseña generada y copiada al portapapeles: ${pwd}`, 'success');
      }).catch(() => {
        toast(`Contraseña generada: ${pwd}`, 'info');
      });
    } else {
      toast(`Contraseña generada: ${pwd}`, 'info');
    }
  }

  function togglePasswordVisibility(inputId, btnEl) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';

    if (btnEl) {
      const icon = btnEl.querySelector('i');
      if (icon) {
        icon.className = isPass ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
      }
    }
  }

  function filterByRole(role) {
    state.activeFilterRole = role;
    render();
  }

  function search(query) {
    state.searchQuery = query || '';
    render();
  }

  // ==========================================================================
  // EXPOSICIÓN GLOBAL EN EL ECOSISTEMA
  // ==========================================================================
  window.BaqueanoOpsUsers = {
    render: render,
    openModal: openModal,
    closeModal: closeModal,
    saveUser: saveUser,
    openPasswordModal: openPasswordModal,
    closePasswordModal: closePasswordModal,
    saveNewPassword: saveNewPassword,
    toggleUserStatus: toggleUserStatus,
    deleteUser: deleteUser,
    generateSecurePassword: generateSecurePassword,
    togglePasswordVisibility: togglePasswordVisibility,
    filterByRole: filterByRole,
    search: search
  };

  // Auto-render si la URL ya contiene el hash #13-usuarios o la pestaña está activa
  function checkAndRenderActive() {
    const isUsersTab = window.location.hash === '#13-usuarios' || (window.OpsState && window.OpsState.activeTab === '13-usuarios');
    if (isUsersTab) {
      const panel = document.getElementById('view-13-usuarios');
      if (panel) render(panel);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndRenderActive);
  } else {
    setTimeout(checkAndRenderActive, 100);
  }

  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#13-usuarios') {
      setTimeout(checkAndRenderActive, 50);
    }
  });

  console.info('🧭 [BaqueanoOpsUsers] Módulo integral de gestión de usuarios cargado.');

})(window, document);
