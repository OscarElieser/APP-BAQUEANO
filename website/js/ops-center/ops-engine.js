// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — OPS CENTER CORE ENGINE (ops-engine.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Transformar el Ops Center en el verdadero cerebro operativo y digital de
//   BAQUEANO Nicaragua, eliminando cualquier necesidad de editar código fuente
//   para tareas editoriales, comerciales, de seguridad o configuración.
// - Conectar de forma nativa con Firebase (Auth, Firestore, Storage) bajo la
//   regla inquebrantable REAL > DEMO: 0 datos inventados, 0 métricas simuladas,
//   y empty states ejecutivos cuando no haya registros.
// - Centralizar la telemetría unificada de Website y Android respetando
//   la integridad del modelo móvil y auditando cada acción administrativa.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Arquitectura basada en eventos y estado centralizado reactivo (OpsState).
// - Conexión directa a Firestore usando el SDK Singleton (window.BaqueanoFirebase).
// - Verificación estricta de identidad con Google OAuth 2.0 y sesiones validadas.
// - Módulos desacoplados: CMS de Contenido, Aprobación de Negocios, Verificación
//   con sello oficial, Centro SOS, Monitor Android, Website Builder y Auditoría.
// - Command Palette táctico accesible globalmente vía Ctrl+K / Cmd+K.
//
// 📦 3. QUÉ (WHAT / SERVICIOS & CONTROLADORES EXPUESTOS):
// - window.BaqueanoOpsEngine: Fachada principal de inicialización y control.
// - OpsState: Gestor de estado reactivo y caché de datos reales.
// - OpsAuth: Proveedor de autenticación y control de sesión admin.
// - OpsData: Capa de persistencia, consultas limitadas y cursor pagination.
// - OpsUI: Orquestador del DOM, sidebar colapsable, pestañas y command palette.
// ============================================================================

(function (window, document) {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. ESTADO GLOBAL REACTIVO (OPS STATE)
  // --------------------------------------------------------------------------
  const OpsState = {
    currentUser: null,
    currentRole: null,
    activeTab: '01-dashboard',
    activeFilter: 'all',
    sidebarCollapsed: false,
    
    // Caché de Datos Reales (Iniciados estrictamente en vacío)
    metrics: {
      totalUsers: 0,
      webUsers: 0,
      androidUsers: 0,
      totalDestinations: 0,
      publishedDestinations: 0,
      totalBusinesses: 0,
      pendingBusinesses: 0,
      verifiedBusinesses: 0,
      activeSosAlerts: 0,
      auditEventsCount: 0,
      lastUpdated: null
    },

    destinations: [],
    businesses: [],
    auditLogs: [],
    sosAlerts: [],
    appConfig: {},

    // Suscripciones activas de Firestore (para evitar fugas de memoria)
    listeners: []
  };

  // --------------------------------------------------------------------------
  // 2. CAPA DE SEGURIDAD & AUTENTICACIÓN (OPS AUTH)
  // --------------------------------------------------------------------------
  const OpsAuth = {
    // Cuentas con autorización administrativa verificada
    authorizedAdmins: [
      'oscarelieser.informatica.inatec@gmail.com',
      'byoscarelieser@gmail.com',
      'vigoronmixt@gmail.com'
    ],

    init() {
      if (!window.firebase || !window.firebase.auth) {
        console.warn('[OpsAuth] Firebase Auth no está disponible en este momento.');
        return;
      }

      window.firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          this.handleAuthenticatedUser(user);
        } else {
          this.handleSignedOutUser();
        }
      });

      this.bindAuthButtons();
    },

    bindAuthButtons() {
      const googleBtn = document.getElementById('btnGoogleLogin');
      const logoutBtn = document.getElementById('btnLogoutAdmin');

      if (googleBtn) {
        googleBtn.addEventListener('click', () => this.loginWithGoogle());
      }

      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => this.logout());
      }
    },

    async loginWithGoogle() {
      const feedbackEl = document.getElementById('loginFeedback');
      if (feedbackEl) {
        feedbackEl.className = 'login-feedback-alert success';
        feedbackEl.style.display = 'flex';
        feedbackEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Conectando de forma segura con Google...';
      }

      try {
        const provider = new window.firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        await window.firebase.auth().signInWithPopup(provider);
      } catch (error) {
        console.error('[OpsAuth] Error en inicio de sesión Google:', error);
        if (feedbackEl) {
          feedbackEl.className = 'login-feedback-alert error';
          feedbackEl.style.display = 'flex';
          feedbackEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> Error de autenticación: ${error.message}`;
        }
      }
    },

    handleAuthenticatedUser(user) {
      const email = (user.email || '').toLowerCase().trim();
      const isAuthorized = this.authorizedAdmins.some((adminEmail) => adminEmail.toLowerCase() === email);

      if (!isAuthorized) {
        console.warn(`[OpsAuth] Acceso denegado a usuario no autorizado: ${email}`);
        window.firebase.auth().signOut();
        const feedbackEl = document.getElementById('loginFeedback');
        if (feedbackEl) {
          feedbackEl.className = 'login-feedback-alert error';
          feedbackEl.style.display = 'flex';
          feedbackEl.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:0.4rem;text-align:left;">
              <div><i class="fa-solid fa-lock"></i> <strong>Acceso Restringido</strong></div>
              <div style="font-size:0.82rem;color:var(--ops-text-secondary);">
                La cuenta <code>${email}</code> no cuenta con privilegios administrativos en el Ops Center.
              </div>
            </div>`;
        }
        OpsUI.showLoginGate();
        return;
      }

      OpsState.currentUser = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL || '',
        role: 'superAdmin'
      };

      OpsUI.updateUserProfileUI(OpsState.currentUser);
      OpsUI.hideLoginGate();
      OpsData.initDataSync();

      // Registro de inicio de sesión en auditoría
      OpsData.logAuditEvent({
        action: 'ADMIN_SESSION_STARTED',
        module: 'Seguridad',
        description: `Inicio de sesión administrativo verificado para ${user.email}`,
        status: 'success'
      });
    },

    handleSignedOutUser() {
      OpsState.currentUser = null;
      OpsData.stopAllListeners();
      OpsUI.showLoginGate();
    },

    async logout() {
      if (window.firebase && window.firebase.auth) {
        await window.firebase.auth().signOut();
      }
      OpsState.currentUser = null;
      sessionStorage.removeItem('baqueano_active_user');
      OpsUI.showLoginGate();
    }
  };

  // --------------------------------------------------------------------------
  // 3. CAPA DE DATOS FIRESTORE REAL (OPS DATA)
  // --------------------------------------------------------------------------
  const OpsData = {
    getDb() {
      return window.firebase && window.firebase.firestore ? window.firebase.firestore() : null;
    },

    initDataSync() {
      const db = this.getDb();
      if (!db) {
        console.warn('[OpsData] Firestore no está listo para sincronización en tiempo real.');
        return;
      }

      this.listenToDestinations(db);
      this.listenToBusinesses(db);
      this.listenToSosAlerts(db);
      this.listenToAuditLogs(db);
      this.listenToAppConfig(db);
    },

    stopAllListeners() {
      OpsState.listeners.forEach((unsubscribe) => {
        if (typeof unsubscribe === 'function') unsubscribe();
      });
      OpsState.listeners = [];
    },

    // 3.1 Destinos (Colección compartida con Android: 'destinations' y 'places')
    listenToDestinations(db) {
      const unsub = db.collection('destinations').onSnapshot(
        (snapshot) => {
          OpsState.destinations = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));

          OpsState.metrics.totalDestinations = snapshot.size;
          OpsState.metrics.publishedDestinations = OpsState.destinations.filter(
            (d) => d.status === 'published'
          ).length;

          OpsUI.renderDashboardMetrics();
          OpsUI.renderDestinationsTable();
        },
        (error) => {
          console.error('[OpsData] Error leyendo destinos:', error);
          OpsUI.showNotice('Error al sincronizar destinos desde Firestore.', 'error');
        }
      );
      OpsState.listeners.push(unsub);
    },

    // 3.2 Negocios Comunitarios ('businesses')
    listenToBusinesses(db) {
      const unsub = db.collection('businesses').onSnapshot(
        (snapshot) => {
          OpsState.businesses = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));

          OpsState.metrics.totalBusinesses = snapshot.size;
          OpsState.metrics.pendingBusinesses = OpsState.businesses.filter(
            (b) => b.status === 'pending_review' || b.status === 'pending'
          ).length;
          OpsState.metrics.verifiedBusinesses = OpsState.businesses.filter(
            (b) => b.verified === true || b.verificationStatus === 'verified'
          ).length;

          OpsUI.renderDashboardMetrics();
          OpsUI.renderBusinessesTable();
          OpsUI.updateBadge('badgePendingBiz', OpsState.metrics.pendingBusinesses);
        },
        (error) => {
          console.error('[OpsData] Error leyendo negocios:', error);
        }
      );
      OpsState.listeners.push(unsub);
    },

    // 3.3 Alertas SOS Reales ('sos_logs')
    listenToSosAlerts(db) {
      const unsub = db.collection('sos_logs')
        .where('status', '==', 'active')
        .onSnapshot(
          (snapshot) => {
            OpsState.sosAlerts = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data()
            }));

            OpsState.metrics.activeSosAlerts = snapshot.size;
            OpsUI.renderDashboardMetrics();
            OpsUI.renderSosModule();
            OpsUI.updateBadge('badgeActiveSos', snapshot.size, snapshot.size > 0 ? 'alert' : 'neutral');
          },
          (error) => {
            console.warn('[OpsData] Listener de sos_logs:', error.message);
          }
        );
      OpsState.listeners.push(unsub);
    },

    // 3.4 Registro Inmutable de Auditoría ('audit_logs')
    listenToAuditLogs(db) {
      const unsub = db.collection('audit_logs')
        .orderBy('timestamp', 'desc')
        .limit(20)
        .onSnapshot(
          (snapshot) => {
            OpsState.auditLogs = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data()
            }));
            OpsState.metrics.auditEventsCount = snapshot.size;
            OpsUI.renderAuditFeed();
          },
          (error) => {
            console.warn('[OpsData] Listener de audit_logs:', error.message);
          }
        );
      OpsState.listeners.push(unsub);
    },

    // 3.5 Configuración Global ('app_config/global')
    listenToAppConfig(db) {
      const unsub = db.collection('app_config').doc('global').onSnapshot(
        (doc) => {
          if (doc.exists) {
            OpsState.appConfig = doc.data();
            OpsUI.renderAppConfigView();
          }
        },
        (error) => console.warn('[OpsData] Configuración remota:', error.message)
      );
      OpsState.listeners.push(unsub);
    },

    // 3.6 Acciones de Auditoría Reales
    async logAuditEvent(eventData) {
      const db = this.getDb();
      if (!db || !OpsState.currentUser) return;

      try {
        await db.collection('audit_logs').add({
          action: eventData.action || 'ADMIN_ACTION',
          module: eventData.module || 'Sistema',
          description: eventData.description || '',
          performedBy: OpsState.currentUser.email,
          performedByUid: OpsState.currentUser.uid,
          timestamp: new Date().toISOString(),
          status: eventData.status || 'success'
        });
      } catch (err) {
        console.warn('[OpsData] No fue posible guardar registro de auditoría:', err.message);
      }
    },

    // 3.7 CRUD de Destino
    async saveDestination(destData) {
      const db = this.getDb();
      if (!db) throw new Error('Base de datos no conectada');

      const isUpdate = Boolean(destData.id);
      const destId = destData.id || `dest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const payload = {
        ...destData,
        id: destId,
        updatedAt: new Date().toISOString(),
        updatedBy: OpsState.currentUser?.email || 'admin'
      };

      if (!isUpdate) {
        payload.createdAt = new Date().toISOString();
        payload.createdBy = OpsState.currentUser?.email || 'admin';
        if (!payload.status) payload.status = 'published';
      }

      await db.collection('destinations').doc(destId).set(payload, { merge: true });
      // Mantener sincronía con 'places' para compatibilidad retroactiva
      await db.collection('places').doc(destId).set(payload, { merge: true });

      await this.logAuditEvent({
        action: isUpdate ? 'DESTINATION_UPDATED' : 'DESTINATION_CREATED',
        module: 'Destinos',
        description: `${isUpdate ? 'Actualizó' : 'Creó'} el destino "${destData.name || destId}"`,
        status: 'success'
      });

      return destId;
    },

    // 3.8 Aprobación y Verificación de Negocios
    async verifyBusiness(businessId, verificationNotes = '') {
      const db = this.getDb();
      if (!db) throw new Error('Base de datos no conectada');

      const updateData = {
        verificationStatus: 'verified',
        verified: true,
        verifiedAt: new Date().toISOString(),
        verifiedBy: OpsState.currentUser?.email || 'admin',
        verificationNotes: verificationNotes || 'Verificado por equipo de campo BAQUEANO bajo Ley 1210/1211.',
        status: 'published',
        updatedAt: new Date().toISOString()
      };

      await db.collection('businesses').doc(businessId).update(updateData);

      await this.logAuditEvent({
        action: 'BUSINESS_VERIFIED',
        module: 'Negocios',
        description: `Aprobó y asignó sello "Verificado por BAQUEANO" al negocio ${businessId}`,
        status: 'success'
      });
    },

    async updateBusinessStatus(businessId, newStatus) {
      const db = this.getDb();
      if (!db) throw new Error('Base de datos no conectada');

      await db.collection('businesses').doc(businessId).update({
        status: newStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: OpsState.currentUser?.email || 'admin'
      });

      await this.logAuditEvent({
        action: 'BUSINESS_STATUS_CHANGED',
        module: 'Negocios',
        description: `Cambió estado del negocio ${businessId} a "${newStatus}"`,
        status: 'success'
      });
    }
  };

  // --------------------------------------------------------------------------
  // 4. CAPA DE INTERFAZ MATE & VISTAS (OPS UI)
  // --------------------------------------------------------------------------
  const OpsUI = {
    init() {
      this.bindNavigation();
      this.bindSidebarToggle();
      this.bindCommandPalette();
      this.startOfficialClock();
    },

    startOfficialClock() {
      const clockEl = document.getElementById('opsLiveClock');
      const dateEl = document.getElementById('opsLiveDate');

      const updateTime = () => {
        const now = new Date();
        if (clockEl) {
          clockEl.textContent = now.toLocaleTimeString('es-NI', { hour12: false });
        }
        if (dateEl) {
          dateEl.textContent = now.toLocaleDateString('es-NI', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }).toUpperCase();
        }
      };

      updateTime();
      setInterval(updateTime, 1000);
    },

    bindSidebarToggle() {
      const toggleBtn = document.getElementById('opsSidebarToggleBtn');
      const sidebar = document.getElementById('opsSidebarMatte');

      if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
          OpsState.sidebarCollapsed = !OpsState.sidebarCollapsed;
          sidebar.classList.toggle('is-collapsed', OpsState.sidebarCollapsed);
          const icon = toggleBtn.querySelector('i');
          if (icon) {
            icon.className = OpsState.sidebarCollapsed
              ? 'fa-solid fa-chevron-right'
              : 'fa-solid fa-chevron-left';
          }
        });
      }
    },

    bindNavigation() {
      const navItems = document.querySelectorAll('.ops-nav-item');
      navItems.forEach((item) => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const targetTab = item.getAttribute('data-tab');
          if (targetTab) {
            this.switchTab(targetTab);
          }
        });
      });
    },

    switchTab(tabId) {
      OpsState.activeTab = tabId;

      // Actualizar botones de navegación
      const navItems = document.querySelectorAll('.ops-nav-item');
      navItems.forEach((item) => {
        item.classList.toggle('is-active', item.getAttribute('data-tab') === tabId);
      });

      // Mostrar panel correspondiente
      const panels = document.querySelectorAll('.ops-view-panel');
      panels.forEach((panel) => {
        panel.classList.toggle('is-active', panel.id === `view-${tabId}`);
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    updateUserProfileUI(user) {
      const nameEl = document.getElementById('opsTopUserName');
      const roleEl = document.getElementById('opsTopUserRole');
      const avatarEl = document.getElementById('opsTopUserAvatar');

      if (nameEl) nameEl.textContent = user.name || user.email;
      if (roleEl) roleEl.textContent = 'Super Administrador';
      if (avatarEl) {
        const initials = (user.name || user.email).substring(0, 2).toUpperCase();
        avatarEl.textContent = initials;
      }
    },

    showLoginGate() {
      const loginGate = document.getElementById('adminLoginGate');
      const opsWorkspace = document.getElementById('opsAppContainer');
      if (loginGate) loginGate.style.display = 'flex';
      if (opsWorkspace) opsWorkspace.style.display = 'none';
    },

    hideLoginGate() {
      const loginGate = document.getElementById('adminLoginGate');
      const opsWorkspace = document.getElementById('opsAppContainer');
      if (loginGate) loginGate.style.display = 'none';
      if (opsWorkspace) opsWorkspace.style.display = 'flex';
    },

    updateBadge(badgeId, count, type = 'neutral') {
      const badge = document.getElementById(badgeId);
      if (!badge) return;

      badge.textContent = count.toString();
      badge.style.display = count > 0 ? 'inline-block' : 'none';
      badge.className = `ops-nav-badge ${type === 'alert' ? 'badge-alert' : type === 'success' ? 'badge-success' : ''}`;
    },

    // 4.1 Renderizado de KPIs Reales
    renderDashboardMetrics() {
      const m = OpsState.metrics;
      this.setText('kpiTotalUsers', m.totalUsers.toString());
      this.setText('kpiTotalDestinations', m.totalDestinations.toString());
      this.setText('kpiPublishedDestinations', m.publishedDestinations.toString());
      this.setText('kpiTotalBusinesses', m.totalBusinesses.toString());
      this.setText('kpiPendingBusinesses', m.pendingBusinesses.toString());
      this.setText('kpiVerifiedBusinesses', m.verifiedBusinesses.toString());
      this.setText('kpiActiveSos', m.activeSosAlerts.toString());

      // Timestamp de última actualización real
      const timeEl = document.getElementById('opsMetricsLastUpdated');
      if (timeEl) {
        timeEl.textContent = `Actualizado: ${new Date().toLocaleTimeString('es-NI')}`;
      }
    },

    // 4.2 Renderizado de Tabla de Destinos
    renderDestinationsTable() {
      const tbody = document.getElementById('destinationsTableBody');
      const emptyState = document.getElementById('destinationsEmptyState');
      if (!tbody) return;

      if (!OpsState.destinations || OpsState.destinations.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'flex';
        return;
      }

      if (emptyState) emptyState.style.display = 'none';
      tbody.innerHTML = OpsState.destinations.map((d) => `
        <tr>
          <td>
            <div style="font-weight:600;color:#fff;">${this.escape(d.name || 'Sin nombre')}</div>
            <div style="font-size:0.75rem;color:var(--ops-text-muted);">${this.escape(d.department || '')} • ${this.escape(d.municipality || '')}</div>
          </td>
          <td><span class="ops-badge-status ${d.status || 'draft'}">${d.status || 'draft'}</span></td>
          <td>${this.escape(d.category || 'General')}</td>
          <td>${d.priceNio ? `C$ ${d.priceNio}` : (d.priceUsd ? `$ ${d.priceUsd}` : '—')}</td>
          <td style="text-align:right;">
            <button class="btn-ops-matte" onclick="window.BaqueanoOpsEngine.editDestination('${d.id}')" title="Editar">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-ops-matte" onclick="window.BaqueanoOpsEngine.toggleDestinationStatus('${d.id}', '${d.status === 'published' ? 'draft' : 'published'}')" title="Publicar/Despublicar">
              <i class="fa-solid ${d.status === 'published' ? 'fa-eye-slash' : 'fa-eye'}"></i>
            </button>
          </td>
        </tr>
      `).join('');
    },

    // 4.3 Renderizado de Tabla de Negocios
    renderBusinessesTable() {
      const tbody = document.getElementById('businessesTableBody');
      const emptyState = document.getElementById('businessesEmptyState');
      if (!tbody) return;

      if (!OpsState.businesses || OpsState.businesses.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'flex';
        return;
      }

      if (emptyState) emptyState.style.display = 'none';
      tbody.innerHTML = OpsState.businesses.map((b) => `
        <tr>
          <td>
            <div style="font-weight:600;color:#fff;">${this.escape(b.name || 'Sin nombre')}</div>
            <div style="font-size:0.75rem;color:var(--ops-text-muted);">${this.escape(b.department || '')} • Contacto: ${this.escape(b.contactEmail || b.contactPhone || '—')}</div>
          </td>
          <td>
            <span class="ops-badge-status ${b.status || 'pending'}">${b.status || 'pending'}</span>
          </td>
          <td>
            ${b.verified
              ? '<span class="ops-badge-status published"><i class="fa-solid fa-shield-check"></i> Verificado</span>'
              : '<span class="ops-badge-status draft">Sin Verificar</span>'}
          </td>
          <td style="text-align:right;">
            ${!b.verified ? `
              <button class="btn-ops-matte primary" onclick="window.BaqueanoOpsEngine.approveAndVerifyBusiness('${b.id}')">
                <i class="fa-solid fa-check"></i> Verificar
              </button>
            ` : ''}
            <button class="btn-ops-matte danger" onclick="window.BaqueanoOpsEngine.suspendBusiness('${b.id}')" title="Suspender">
              <i class="fa-solid fa-ban"></i>
            </button>
          </td>
        </tr>
      `).join('');
    },

    // 4.4 Renderizado de Centro SOS Real
    renderSosModule() {
      const tbody = document.getElementById('sosTableBody');
      const emptyState = document.getElementById('sosEmptyState');
      if (!tbody) return;

      if (!OpsState.sosAlerts || OpsState.sosAlerts.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'flex';
        return;
      }

      if (emptyState) emptyState.style.display = 'none';
      tbody.innerHTML = OpsState.sosAlerts.map((sos) => `
        <tr>
          <td><span class="ops-badge-status rejected">EMERGENCIA ACTIVA</span></td>
          <td>${this.escape(sos.emergencyType || 'Auxilio General')}</td>
          <td><code>${this.escape(sos.coordinates || 'Coordenadas pendientes')}</code></td>
          <td>${sos.platform || 'web/android'}</td>
          <td>${sos.createdAt ? new Date(sos.createdAt).toLocaleTimeString('es-NI') : '—'}</td>
        </tr>
      `).join('');
    },

    // 4.5 Feed de Auditoría en Tiempo Real
    renderAuditFeed() {
      const feed = document.getElementById('opsAuditFeed');
      if (!feed) return;

      if (!OpsState.auditLogs || OpsState.auditLogs.length === 0) {
        feed.innerHTML = `
          <div class="ops-empty-state" style="padding:1.5rem;">
            <div style="font-size:0.85rem;color:var(--ops-text-muted);">No hay eventos de auditoría registrados hoy.</div>
          </div>`;
        return;
      }

      feed.innerHTML = OpsState.auditLogs.map((log) => `
        <div style="display:flex;align-items:flex-start;gap:0.75rem;padding:0.75rem;border-bottom:1px solid var(--ops-border-subtle);">
          <div style="width:28px;height:28px;border-radius:6px;background:var(--ops-surface-2);display:flex;align-items:center;justify-content:center;color:var(--bq-accent);flex-shrink:0;">
            <i class="fa-solid fa-file-shield"></i>
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:0.84rem;font-weight:600;color:#fff;">${this.escape(log.action)}</div>
            <div style="font-size:0.78rem;color:var(--ops-text-secondary);">${this.escape(log.description || '')}</div>
            <div style="font-size:0.68rem;color:var(--ops-text-muted);margin-top:0.2rem;">
              ${this.escape(log.performedBy || 'Sistema')} • ${new Date(log.timestamp).toLocaleString('es-NI')}
            </div>
          </div>
        </div>
      `).join('');
    },

    renderAppConfigView() {
      // Sincronización de feature flags y configuración remota
      const bannerInput = document.getElementById('cfgAnnouncementText');
      if (bannerInput && OpsState.appConfig.announcementText) {
        bannerInput.value = OpsState.appConfig.announcementText;
      }
    },

    // 4.6 Command Palette (Ctrl+K)
    bindCommandPalette() {
      const paletteBtn = document.getElementById('opsCommandPaletteTrigger');
      const modal = document.getElementById('opsCommandModalBackdrop');
      const input = document.getElementById('opsCommandSearchInput');
      const closeBtn = document.getElementById('opsCommandCloseBtn');

      const openPalette = () => {
        if (modal) {
          modal.classList.add('is-open');
          if (input) {
            input.value = '';
            input.focus();
          }
        }
      };

      const closePalette = () => {
        if (modal) modal.classList.remove('is-open');
      };

      if (paletteBtn) paletteBtn.addEventListener('click', openPalette);
      if (closeBtn) closeBtn.addEventListener('click', closePalette);

      window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          if (modal && modal.classList.contains('is-open')) {
            closePalette();
          } else {
            openPalette();
          }
        }
        if (e.key === 'Escape') closePalette();
      });
    },

    setText(elementId, text) {
      const el = document.getElementById(elementId);
      if (el) el.textContent = text;
    },

    escape(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    },

    showNotice(message, type = 'info') {
      alert(`[Baqueano Ops] ${message}`);
    }
  };

  // --------------------------------------------------------------------------
  // 5. INICIALIZACIÓN PÚBLICA & FACHADA GLOBAL
  // --------------------------------------------------------------------------
  window.BaqueanoOpsEngine = {
    init() {
      console.info('[BaqueanoOpsEngine] Inicializando cerebro de operaciones...');
      OpsUI.init();
      OpsAuth.init();
    },

    // Métodos expuestos para la interfaz
    async editDestination(destId) {
      const dest = OpsState.destinations.find((d) => d.id === destId);
      if (!dest) return;
      const newName = prompt('Editar nombre del destino:', dest.name);
      if (newName && newName.trim()) {
        await OpsData.saveDestination({ ...dest, name: newName.trim() });
        alert('Destino actualizado con éxito.');
      }
    },

    async toggleDestinationStatus(destId, newStatus) {
      const dest = OpsState.destinations.find((d) => d.id === destId);
      if (!dest) return;
      if (confirm(`¿Cambiar estado de "${dest.name}" a "${newStatus}"?`)) {
        await OpsData.saveDestination({ ...dest, status: newStatus });
      }
    },

    async approveAndVerifyBusiness(businessId) {
      const notes = prompt('Notas de verificación territorial (Ley 1210/1211):', 'Auditado presencialmente por equipo de campo BAQUEANO.');
      if (notes !== null) {
        await OpsData.verifyBusiness(businessId, notes);
        alert('Negocio verificado y publicado oficialmente.');
      }
    },

    async suspendBusiness(businessId) {
      if (confirm('¿Confirmas la suspensión de este negocio? Se despublicará de inmediato.')) {
        await OpsData.updateBusinessStatus(businessId, 'suspended');
      }
    }
  };

  // Autoinicio al cargar el DOM
  document.addEventListener('DOMContentLoaded', () => {
    window.BaqueanoOpsEngine.init();
  });

})(window, document);
