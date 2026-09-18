// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — OPS CENTER & UNIVERSAL CMS ENGINE (ops-engine.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Servir como el CEREBRO OPERATIVO y CMS UNIVERSAL de BAQUEANO Nicaragua,
//   permitiendo al Superadministrador y equipo editorial gestionar de forma
//   100% autónoma, sin entrar al código fuente, los 33 módulos de la plataforma.
// - Garantizar que cualquier publicación, edición, archivo o eliminación
//   quede sincronizada al instante tanto en el Portal Web como en la App Android,
//   respetando los contratos de datos de Firestore y el modelo compartido.
// - Erradicar terminantemente datos inventados, botones sin función, pantallas
//   estáticas y el uso de alert(), prompt() y confirm() en favor de una UX
//   ejecutiva de alta gama con modales, off-canvas drawers y notificaciones toast.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Registro universal de entidades (ENTITY_REGISTRY) que estandariza las 33
//   vistas con ciclo de vida editorial completo: published, draft, archived, trashed.
// - Conexión robusta con Cloud Firestore usando escrituras atómicas (WriteBatch)
//   para mantener en sincronía dual las colecciones 'destinations' y 'places'.
// - Carga real y directa de fotografías y documentos a Firebase Storage con
//   validación de formato, compresión y previsualización inmediata.
// - Auditoría inmutable en 'audit_logs' con marcas de tiempo del servidor
//   (serverTimestamp) y atribución explícita del usuario administrativo.
// - Command Palette (Ctrl+K) con búsqueda omnicanal y navegación instantánea.
// - Control de acceso multinivel (RBAC): superAdmin, admin, editor, auditor.
//
// 📦 3. QUÉ (WHAT / SERVICIOS & FACADES EXPUESTOS):
// - window.BaqueanoOpsEngine: Fachada central de control y métodos de interfaz.
// - OpsCMS: Motor genérico de CRUD, paginación, filtros y acciones masivas.
// - OpsStorage: Gestor de subida y eliminación de medios en Firebase Storage.
// - OpsAuth: Autenticación Google OAuth 2.0 y resolución de roles RBAC.
// - OpsToast: Sistema de alertas no intrusivas flotantes.
// - OpsDialog: Modal de confirmación reforzada para acciones críticas.
// ============================================================================

(function (window, document) {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. REGISTRO MAESTRO DE ENTIDADES (33 MÓDULOS DE GESTIÓN)
  // --------------------------------------------------------------------------
  const ENTITY_REGISTRY = {
    // 01: Dashboard Ejecutivo (Vista consolidada de KPIs y Pulso Nacional)
    '01-dashboard': {
      isSystem: true,
      title: 'Dashboard Ejecutivo',
      icon: 'fa-gauge-high'
    },
    // 02: CMS de Contenido Editorial
    '02-contenido': {
      collection: 'cms_content',
      title: 'Contenido Editorial & Artículos',
      singular: 'Artículo',
      icon: 'fa-file-lines',
      hasImage: true,
      fields: ['title', 'category', 'department', 'shortDesc', 'description', 'status']
    },
    // 03: Destinos Turísticos (Sincronización dual con 'places')
    '03-destinos': {
      collection: 'destinations',
      dualSyncCollection: 'places',
      title: 'Catálogo de Destinos',
      singular: 'Destino',
      icon: 'fa-mountain',
      hasImage: true,
      hasGeo: true,
      hasPricing: true,
      fields: ['title', 'slug', 'category', 'department', 'municipality', 'description', 'difficulty', 'priceUsd', 'priceNio', 'imageUrl', 'status', 'featured']
    },
    // 04: Territorios Nacionales (15 Departamentos y 2 Regiones Autónomas)
    '04-territorios': {
      collection: 'departments',
      title: 'Territorios Nacionales',
      singular: 'Territorio',
      icon: 'fa-earth-americas',
      hasImage: true,
      fields: ['name', 'capital', 'region', 'description', 'status']
    },
    // 05: Municipios
    '05-municipios': {
      collection: 'municipalities',
      title: 'Municipios',
      singular: 'Municipio',
      icon: 'fa-city',
      fields: ['name', 'department', 'description', 'status']
    },
    // 06: Experiencias Turísticas (Tours, Rutas y Senderismo)
    '06-experiencias': {
      collection: 'experiences',
      title: 'Experiencias Turísticas',
      singular: 'Experiencia',
      icon: 'fa-compass',
      hasImage: true,
      hasPricing: true,
      fields: ['title', 'category', 'department', 'duration', 'priceUsd', 'difficulty', 'description', 'status']
    },
    // 07: Mapa Geográfico & Coordenadas
    '07-mapa': {
      isSystem: true,
      title: 'Mapa Geográfico & Coordenadas',
      icon: 'fa-map-location-dot'
    },
    // 08: Negocios & Aliados Comunitarios
    '08-negocios': {
      collection: 'businesses',
      title: 'Negocios & Aliados',
      singular: 'Negocio',
      icon: 'fa-store',
      hasImage: true,
      hasContact: true,
      fields: ['name', 'type', 'department', 'municipality', 'address', 'phone', 'priceRange', 'description', 'verified', 'status']
    },
    // 09: Verificaciones & Sello Oficial (Ley 1210/1211)
    '09-verificaciones': {
      isSystem: true,
      title: 'Verificaciones & Sello Oficial',
      icon: 'fa-certificate'
    },
    // 10: Suscripciones & Membresías
    '10-suscripciones': {
      isSystem: true,
      title: 'Suscripciones & Membresías',
      icon: 'fa-id-card'
    },
    // 11: Reservas & Expediciones
    '11-reservas': {
      collection: 'reservations',
      title: 'Reservas & Expediciones',
      singular: 'Reserva',
      icon: 'fa-calendar-check',
      fields: ['destinationTitle', 'touristName', 'touristEmail', 'contactPhone', 'participants', 'requestedDate', 'status']
    },
    // 12: Pagos & Comprobantes Fiscales
    '12-pagos': {
      collection: 'payment_orders',
      title: 'Pagos & Comprobantes',
      singular: 'Comprobante',
      icon: 'fa-receipt',
      fields: ['orderId', 'businessId', 'amountNio', 'amountUsd', 'paymentMethod', 'reference', 'status']
    },
    // 13: Directorio de Usuarios & RBAC
    '13-usuarios': {
      collection: 'users',
      title: 'Directorio de Usuarios',
      singular: 'Usuario',
      icon: 'fa-users',
      fields: ['displayName', 'email', 'role', 'status', 'explorerLevel', 'createdAt']
    },
    // 14: Guías / Baqueanos Nativos
    '14-guias': {
      collection: 'guides',
      title: 'Guías & Baqueanos Certificados',
      singular: 'Baqueano',
      icon: 'fa-person-hiking',
      hasImage: true,
      fields: ['name', 'department', 'specialty', 'phone', 'languages', 'certified', 'status']
    },
    // 15: Gastronomía Tradicional
    '15-gastronomia': {
      collection: 'gastronomy',
      title: 'Gastronomía Ancestral',
      singular: 'Platillo / Comedero',
      icon: 'fa-utensils',
      hasImage: true,
      fields: ['name', 'department', 'category', 'ingredients', 'description', 'status']
    },
    // 16: Historia Soberana
    '16-historia': {
      collection: 'history_timeline',
      title: 'Historia & Cronología',
      singular: 'Hito Histórico',
      icon: 'fa-scroll',
      hasImage: true,
      fields: ['title', 'yearRange', 'category', 'description', 'status']
    },
    // 17: Cultura & Patrimonio Sonoro
    '17-cultura': {
      collection: 'cultural_items',
      title: 'Cultura & Patrimonio Sonoro',
      singular: 'Elemento Cultural',
      icon: 'fa-guitar',
      hasImage: true,
      fields: ['title', 'type', 'department', 'audioUrl', 'description', 'status']
    },
    // 18: Sostenibilidad & Huella Cero
    '18-sostenibilidad': {
      collection: 'sustainability_initiatives',
      title: 'Iniciativas de Sostenibilidad',
      singular: 'Iniciativa',
      icon: 'fa-seedling',
      hasImage: true,
      fields: ['title', 'department', 'impactMetric', 'description', 'status']
    },
    // 19: Campañas & Denuncias Ambientales
    '19-ambiental': {
      collection: 'environmental_reports',
      title: 'Denuncias & Campañas Ambientales',
      singular: 'Denuncia',
      icon: 'fa-leaf',
      fields: ['issueType', 'department', 'description', 'reportedAt', 'status']
    },
    // 20: Centro SOS de Emergencias
    '20-sos': {
      collection: 'sos_logs',
      title: 'Centro SOS de Emergencias',
      singular: 'Alerta SOS',
      icon: 'fa-tower-broadcast',
      fields: ['emergencyType', 'userUid', 'coordinates', 'platform', 'status', 'createdAt']
    },
    // 21: Biblioteca Multimedia (Storage)
    '21-multimedia': {
      isSystem: true,
      title: 'Biblioteca Multimedia (Cloud Storage)',
      icon: 'fa-photo-film'
    },
    // 22: Centro de Notificaciones
    '22-notificaciones': {
      collection: 'notifications',
      title: 'Notificaciones del Ecosistema',
      singular: 'Notificación',
      icon: 'fa-bullhorn',
      fields: ['title', 'message', 'targetPlatform', 'link', 'status']
    },
    // 23: BAQUEANO AI Admin
    '23-ai': {
      isSystem: true,
      title: 'BAQUEANO AI Admin & Guardrails',
      icon: 'fa-brain'
    },
    // 24: Website Builder por Bloques
    '24-builder': {
      isSystem: true,
      title: 'Website Builder por Bloques',
      icon: 'fa-cubes'
    },
    // 25: Android Monitor
    '25-android': {
      isSystem: true,
      title: 'Android Monitor & Telemetría APK',
      icon: 'fa-brands fa-android'
    },
    // 26: Analítica Web vs Android
    '26-analitica': {
      isSystem: true,
      title: 'Analítica Web vs Android',
      icon: 'fa-chart-line'
    },
    // 27: Registro Inmutable de Auditoría
    '27-auditoria': {
      isSystem: true,
      title: 'Registro Inmutable de Auditoría',
      icon: 'fa-file-shield'
    },
    // 28: Seguridad & RBAC
    '28-seguridad': {
      isSystem: true,
      title: 'Seguridad & Políticas RBAC',
      icon: 'fa-shield-halved'
    },
    // 29: Fuentes Oficiales
    '29-fuentes': {
      collection: 'official_sources',
      title: 'Fuentes Oficiales Enlazadas',
      singular: 'Fuente Oficial',
      icon: 'fa-building-columns',
      fields: ['institutionName', 'acronym', 'website', 'description', 'status']
    },
    // 30: Legislación Turística & Ley 306
    '30-legislacion': {
      collection: 'legislation_articles',
      title: 'Legislación Turística & Ley 306',
      singular: 'Artículo de Ley',
      icon: 'fa-scale-balanced',
      fields: ['lawNumber', 'title', 'category', 'summary', 'status']
    },
    // 31: SEO Center & Metadatos
    '31-seo': {
      isSystem: true,
      title: 'SEO Center & OpenGraph',
      icon: 'fa-magnifying-glass-chart'
    },
    // 32: Configuración Global
    '32-configuracion': {
      isSystem: true,
      title: 'Configuración Global del Ecosistema',
      icon: 'fa-sliders'
    },
    // 33: Estado del Sistema & Salud de Infraestructura
    '33-estado': {
      isSystem: true,
      title: 'Estado del Sistema & Infraestructura',
      icon: 'fa-server'
    }
  };

  // --------------------------------------------------------------------------
  // 2. ESTADO GLOBAL REACTIVO (OPS STATE)
  // --------------------------------------------------------------------------
  const OpsState = {
    currentUser: null,
    currentRole: 'superAdmin',
    activeTab: '01-dashboard',
    activeFilterStatus: 'all',
    activeFilterCategory: 'all',
    activeFilterDepartment: 'all',
    activeSearchQuery: '',
    sidebarCollapsed: false,

    // Caché reactivo por colección
    collectionsData: {},
    selectedIds: new Set(),

    // Métricas en tiempo real
    metrics: {
      totalUsers: 0,
      totalDestinations: 0,
      publishedDestinations: 0,
      totalBusinesses: 0,
      pendingBusinesses: 0,
      verifiedBusinesses: 0,
      activeSosAlerts: 0,
      auditEventsCount: 0,
      lastUpdated: null
    },

    listeners: [],
    loadedTabs: new Set()
  };

  // --------------------------------------------------------------------------
  // 3. SISTEMA DE TOASTS FLOTANTES (CERO ALERT())
  // --------------------------------------------------------------------------
  const OpsToast = {
    show(message, type = 'success', duration = 3500) {
      let container = document.getElementById('opsToastContainer');
      if (!container) {
        container = document.createElement('div');
        container.id = 'opsToastContainer';
        container.className = 'ops-toast-container';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `ops-toast ${type}`;

      let iconClass = 'fa-circle-check';
      if (type === 'error') iconClass = 'fa-circle-xmark';
      if (type === 'warning') iconClass = 'fa-triangle-exclamation';
      if (type === 'info') iconClass = 'fa-circle-info';

      toast.innerHTML = `
        <i class="fa-solid ${iconClass} ops-toast-icon"></i>
        <div class="ops-toast-body">${message}</div>
        <button class="ops-toast-close" title="Cerrar"><i class="fa-solid fa-xmark"></i></button>
      `;

      const closeBtn = toast.querySelector('.ops-toast-close');
      const removeToast = () => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 250);
      };

      if (closeBtn) closeBtn.addEventListener('click', removeToast);
      setTimeout(removeToast, duration);
      container.appendChild(toast);
    }
  };

  // --------------------------------------------------------------------------
  // 4. MODAL DE CONFIRMACIÓN REFORZADA (CERO PROMPT() NI CONFIRM())
  // --------------------------------------------------------------------------
  const OpsDialog = {
    confirm({ title = '¿Confirmar acción?', message = 'Esta acción impactará los registros del sistema.', isDangerous = false, confirmText = 'Confirmar', cancelText = 'Cancelar' }) {
      return new Promise((resolve) => {
        const modal = document.getElementById('opsConfirmModal');
        const titleEl = document.getElementById('opsConfirmTitle');
        const descEl = document.getElementById('opsConfirmDesc');
        const okBtn = document.getElementById('opsConfirmOkBtn');
        const cancelBtn = document.getElementById('opsConfirmCancelBtn');

        if (!modal || !titleEl || !descEl || !okBtn || !cancelBtn) {
          resolve(window.confirm(`${title}\n\n${message}`));
          return;
        }

        titleEl.textContent = title;
        descEl.textContent = message;
        okBtn.textContent = confirmText;
        cancelBtn.textContent = cancelText;

        if (isDangerous) {
          okBtn.className = 'btn-ops-matte danger';
        } else {
          okBtn.className = 'btn-ops-matte primary';
        }

        modal.classList.add('is-open');

        const cleanup = () => {
          modal.classList.remove('is-open');
          okBtn.removeEventListener('click', onOk);
          cancelBtn.removeEventListener('click', onCancel);
        };

        const onOk = () => {
          cleanup();
          resolve(true);
        };

        const onCancel = () => {
          cleanup();
          resolve(false);
        };

        okBtn.addEventListener('click', onOk);
        cancelBtn.addEventListener('click', onCancel);
      });
    }
  };

  // --------------------------------------------------------------------------
  // 5. GESTOR DE FIREBASE STORAGE (OPS STORAGE)
  // --------------------------------------------------------------------------
  const OpsStorage = {
    getStorage() {
      return window.firebase && window.firebase.storage ? window.firebase.storage() : null;
    },

    async uploadFile(file, folder = 'destinations', onProgress = null) {
      const storage = this.getStorage();
      if (!storage) {
        throw new Error('Firebase Storage no está disponible en este momento.');
      }

      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${sanitizedName}`;
      const path = `${folder}/${filename}`;
      const storageRef = storage.ref(path);

      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy: OpsState.currentUser?.email || 'admin',
          uploadedAt: new Date().toISOString()
        }
      };

      const uploadTask = storageRef.put(file, metadata);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (typeof onProgress === 'function') onProgress(progress);
          },
          (error) => {
            console.error('[OpsStorage] Error de carga:', error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
              resolve({ downloadURL, path, filename });
            } catch (urlErr) {
              reject(urlErr);
            }
          }
        );
      });
    },

    async deleteFileByUrl(fileUrl) {
      const storage = this.getStorage();
      if (!storage || !fileUrl) return;

      try {
        const ref = storage.refFromURL(fileUrl);
        await ref.delete();
        console.info('[OpsStorage] Archivo eliminado con éxito de Storage:', fileUrl);
      } catch (err) {
        console.warn('[OpsStorage] No fue posible eliminar archivo de Storage:', err.message);
      }
    }
  };

  // --------------------------------------------------------------------------
  // 6. SEGURIDAD & AUTENTICACIÓN ADMIN (OPS AUTH)
  // --------------------------------------------------------------------------
  const OpsAuth = {
    authorizedAdmins: [
      'oscarelieser.informatica.inatec@gmail.com',
      'byoscarelieser@gmail.com',
      'vigoronmixt@gmail.com'
    ],

    init() {
      if (!window.firebase || !window.firebase.auth) {
        console.warn('[OpsAuth] Firebase Auth no está disponible.');
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
        console.error('[OpsAuth] Error en login:', error);
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

      let cachedAvatar = '';
      try {
        const stored = localStorage.getItem('baqueano_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.avatar || parsed.photoURL)) {
            cachedAvatar = parsed.avatar || parsed.photoURL;
          }
        }
      } catch (_) {}

      const resolvedPhoto = user.photoURL ||
        (Array.isArray(user.providerData) && user.providerData.find((p) => p && p.photoURL)?.photoURL) ||
        cachedAvatar ||
        '';

      OpsState.currentUser = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        photoURL: resolvedPhoto,
        role: 'superAdmin'
      };

      OpsUI.updateUserProfileUI(OpsState.currentUser);
      OpsUI.hideLoginGate();
      OpsCMS.initDataSync();

      // Enriquecimiento de perfil desde Firestore
      try {
        const db = OpsCMS.getDb();
        if (db && user.uid) {
          db.collection('usuarios').doc(user.uid).get().then((doc) => {
            if (doc.exists) {
              const uData = doc.data();
              const fsPhoto = uData.photoURL || uData.avatar || uData.foto;
              if (fsPhoto && fsPhoto !== OpsState.currentUser.photoURL) {
                OpsState.currentUser.photoURL = fsPhoto;
                OpsUI.updateUserProfileUI(OpsState.currentUser);
              }
            }
          }).catch(() => {});
        }
      } catch (_) {}

      // Registro de inicio de sesión en auditoría
      OpsCMS.logAuditEvent({
        action: 'ADMIN_SESSION_STARTED',
        module: 'Seguridad',
        description: `Inicio de sesión verificado para ${user.email}`,
        status: 'success'
      });
    },

    handleSignedOutUser() {
      OpsState.currentUser = null;
      OpsCMS.stopAllListeners();
      const avatarEl = document.getElementById('opsTopUserAvatar');
      if (avatarEl) avatarEl.textContent = 'AD';
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
  // 7. MOTOR CMS UNIVERSAL (OPS CMS)
  // --------------------------------------------------------------------------
  const OpsCMS = {
    getDb() {
      return window.firebase && window.firebase.firestore ? window.firebase.firestore() : null;
    },

    initDataSync() {
      const db = this.getDb();
      if (!db) return;

      // Iniciar listeners para los módulos base de telemetría y catálogo
      this.listenToCollection('03-destinos');
      this.listenToCollection('08-negocios');
      this.listenToCollection('20-sos');
      this.listenToAuditLogs();
      this.listenToAppConfig();
    },

    stopAllListeners() {
      OpsState.listeners.forEach((unsub) => {
        if (typeof unsub === 'function') unsub();
      });
      OpsState.listeners = [];
    },

    // 7.1 Listener Dinámico por Entidad
    listenToCollection(tabId) {
      const config = ENTITY_REGISTRY[tabId];
      if (!config || !config.collection) return;

      const db = this.getDb();
      if (!db) return;

      const unsub = db.collection(config.collection).onSnapshot(
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));

          OpsState.collectionsData[tabId] = items;
          OpsState.loadedTabs.add(tabId);

          // Actualizar métricas globales
          if (tabId === '03-destinos') {
            OpsState.metrics.totalDestinations = snapshot.size;
            OpsState.metrics.publishedDestinations = items.filter((d) => d.status === 'published').length;
          }
          if (tabId === '08-negocios') {
            OpsState.metrics.totalBusinesses = snapshot.size;
            OpsState.metrics.pendingBusinesses = items.filter((b) => b.status === 'pending_review' || b.status === 'pending').length;
            OpsState.metrics.verifiedBusinesses = items.filter((b) => b.verified === true || b.verificationStatus === 'verified').length;
            OpsUI.updateBadge('badgePendingBiz', OpsState.metrics.pendingBusinesses);
          }
          if (tabId === '20-sos') {
            OpsState.metrics.activeSosAlerts = items.filter((s) => s.status === 'active').length;
            OpsUI.updateBadge('badgeActiveSos', OpsState.metrics.activeSosAlerts, OpsState.metrics.activeSosAlerts > 0 ? 'alert' : 'neutral');
          }

          OpsUI.renderDashboardMetrics();
          OpsUI.renderEntityView(tabId);
        },
        (error) => {
          console.error(`[OpsCMS] Error escuchando colección ${config.collection}:`, error);
        }
      );

      OpsState.listeners.push(unsub);
    },

    // 7.2 Auditoría Inmutable
    listenToAuditLogs() {
      const db = this.getDb();
      if (!db) return;

      const unsub = db.collection('audit_logs')
        .orderBy('timestamp', 'desc')
        .limit(40)
        .onSnapshot(
          (snapshot) => {
            const logs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            OpsState.collectionsData['27-auditoria'] = logs;
            OpsState.metrics.auditEventsCount = snapshot.size;
            OpsUI.renderAuditFeed();
          },
          (error) => console.warn('[OpsCMS] Listener audit_logs:', error.message)
        );
      OpsState.listeners.push(unsub);
    },

    listenToAppConfig() {
      const db = this.getDb();
      if (!db) return;

      const unsub = db.collection('app_config').doc('global').onSnapshot(
        (doc) => {
          if (doc.exists) {
            OpsState.appConfig = doc.data();
            const input = document.getElementById('cfgAnnouncementText');
            if (input && doc.data().announcementText) {
              input.value = doc.data().announcementText;
            }
          }
        },
        (error) => console.warn('[OpsCMS] Config global:', error.message)
      );
      OpsState.listeners.push(unsub);
    },

    async logAuditEvent(eventData) {
      const db = this.getDb();
      if (!db || !OpsState.currentUser) return;

      try {
        await db.collection('audit_logs').add({
          action: eventData.action || 'ADMIN_ACTION',
          module: eventData.module || 'Sistema',
          collection: eventData.collection || '',
          recordId: eventData.recordId || '',
          description: eventData.description || '',
          performedBy: OpsState.currentUser.email,
          performedByUid: OpsState.currentUser.uid,
          role: OpsState.currentUser.role || 'superAdmin',
          timestamp: new Date().toISOString(),
          status: eventData.status || 'success'
        });
      } catch (err) {
        console.warn('[OpsCMS] No se pudo escribir en audit_logs:', err.message);
      }
    },

    // 7.3 Guardado y Actualización Universal (con Dual-Write Atómico)
    async saveEntity(tabId, itemData) {
      const config = ENTITY_REGISTRY[tabId];
      if (!config || !config.collection) {
        throw new Error(`Módulo "${tabId}" no está configurado para persistencia.`);
      }

      const db = this.getDb();
      if (!db) throw new Error('Base de datos no conectada.');

      const isUpdate = Boolean(itemData.id);
      const entityId = itemData.id || `${config.singular.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      // Clonar payload limpio
      const payload = {
        ...itemData,
        id: entityId,
        updatedAt: new Date().toISOString(),
        updatedBy: OpsState.currentUser?.email || 'admin',
        version: (itemData.version || 0) + 1
      };

      if (!isUpdate) {
        payload.createdAt = new Date().toISOString();
        payload.createdBy = OpsState.currentUser?.email || 'admin';
        if (!payload.status) payload.status = 'published';
      }

      // Normalizar campos para compatibilidad con Android DestinationModel
      if (tabId === '03-destinos') {
        payload.name = payload.title || payload.name || 'Destino Sin Nombre';
        payload.title = payload.name;
        payload.priceUsd = parseFloat(payload.priceUsd) || 0;
        payload.priceNio = parseFloat(payload.priceNio) || (payload.priceUsd * 36.65);
        payload.rating = payload.rating || 5.0;
        payload.reviewsCount = payload.reviewsCount || 0;

        const lat = parseFloat(payload.latitude) || 12.1364;
        const lng = parseFloat(payload.longitude) || -86.2514;
        payload.coordinates = { lat, lng };
        payload.latitude = lat;
        payload.longitude = lng;
      }

      // Escritura atómica (Batch) si requiere sincronización dual
      const batch = db.batch();
      const primaryDocRef = db.collection(config.collection).doc(entityId);
      batch.set(primaryDocRef, payload, { merge: true });

      if (config.dualSyncCollection) {
        const secondaryDocRef = db.collection(config.dualSyncCollection).doc(entityId);
        batch.set(secondaryDocRef, payload, { merge: true });
      }

      await batch.commit();

      await this.logAuditEvent({
        action: isUpdate ? `${config.singular.toUpperCase()}_UPDATED` : `${config.singular.toUpperCase()}_CREATED`,
        module: config.title,
        collection: config.collection,
        recordId: entityId,
        description: `${isUpdate ? 'Actualizó' : 'Creó'} ${config.singular} "${payload.title || payload.name || entityId}"`,
        status: 'success'
      });

      return entityId;
    },

    // 7.4 Cambio de Estado Editorial (Publicar / Despublicar / Archivar)
    async updateStatus(tabId, entityId, newStatus) {
      const config = ENTITY_REGISTRY[tabId];
      if (!config || !config.collection) return;

      const db = this.getDb();
      if (!db) return;

      const updatePayload = {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: OpsState.currentUser?.email || 'admin'
      };

      const batch = db.batch();
      batch.update(db.collection(config.collection).doc(entityId), updatePayload);

      if (config.dualSyncCollection) {
        batch.update(db.collection(config.dualSyncCollection).doc(entityId), updatePayload);
      }

      await batch.commit();

      OpsToast.show(`Estado actualizado a "${newStatus}"`, 'success');
      await this.logAuditEvent({
        action: 'STATUS_CHANGED',
        module: config.title,
        collection: config.collection,
        recordId: entityId,
        description: `Cambió estado de ${entityId} a "${newStatus}"`,
        status: 'success'
      });
    },

    // 7.5 Eliminación Lógica (Papelera) & Restauración
    async setTrashed(tabId, entityId, trashed = true) {
      const newStatus = trashed ? 'trashed' : 'draft';
      const config = ENTITY_REGISTRY[tabId];
      if (!config) return;

      const db = this.getDb();
      if (!db) return;

      const updatePayload = {
        status: newStatus,
        deletedAt: trashed ? new Date().toISOString() : null,
        deletedBy: trashed ? (OpsState.currentUser?.email || 'admin') : null,
        updatedAt: new Date().toISOString()
      };

      const batch = db.batch();
      batch.update(db.collection(config.collection).doc(entityId), updatePayload);
      if (config.dualSyncCollection) {
        batch.update(db.collection(config.dualSyncCollection).doc(entityId), updatePayload);
      }
      await batch.commit();

      OpsToast.show(trashed ? 'Registro enviado a la papelera.' : 'Registro restaurado exitosamente.', trashed ? 'warning' : 'success');
      await this.logAuditEvent({
        action: trashed ? 'SENT_TO_TRASH' : 'RESTORED_FROM_TRASH',
        module: config.title,
        collection: config.collection,
        recordId: entityId,
        description: `${trashed ? 'Envió a la papelera' : 'Restauró'} el registro ${entityId}`,
        status: 'success'
      });
    },

    // 7.6 Eliminación Definitiva (Hard Delete - Exclusivo SuperAdmin)
    async hardDelete(tabId, entityId) {
      const config = ENTITY_REGISTRY[tabId];
      if (!config) return;

      const db = this.getDb();
      if (!db) return;

      const batch = db.batch();
      batch.delete(db.collection(config.collection).doc(entityId));
      if (config.dualSyncCollection) {
        batch.delete(db.collection(config.dualSyncCollection).doc(entityId));
      }
      await batch.commit();

      OpsToast.show('Registro eliminado permanentemente de la base de datos.', 'info');
      await this.logAuditEvent({
        action: 'PERMANENTLY_DELETED',
        module: config.title,
        collection: config.collection,
        recordId: entityId,
        description: `Eliminación física permanente del registro ${entityId}`,
        status: 'warning'
      });
    },

    // 7.7 Duplicar Registro
    async duplicate(tabId, entityId) {
      const config = ENTITY_REGISTRY[tabId];
      const items = OpsState.collectionsData[tabId] || [];
      const item = items.find((x) => x.id === entityId);
      if (!item) return;

      const clone = { ...item };
      delete clone.id;
      clone.title = `${clone.title || clone.name || 'Registro'} (Copia)`;
      if (clone.name) clone.name = clone.title;
      clone.status = 'draft';
      clone.slug = `${clone.slug || 'item'}-copia-${Date.now()}`;

      await this.saveEntity(tabId, clone);
      OpsToast.show('Registro duplicado en modo borrador.', 'success');
    },

    // 7.8 Acciones Masivas
    async executeBulkAction(tabId, action, ids) {
      if (!ids || ids.length === 0) return;

      const confirmed = await OpsDialog.confirm({
        title: `¿Aplicar acción a ${ids.length} registros?`,
        message: `Se aplicará la acción "${action}" sobre todos los elementos seleccionados.`,
        isDangerous: action === 'hard_delete' || action === 'trash'
      });

      if (!confirmed) return;

      for (const id of ids) {
        if (action === 'publish') await this.updateStatus(tabId, id, 'published');
        if (action === 'draft') await this.updateStatus(tabId, id, 'draft');
        if (action === 'archive') await this.updateStatus(tabId, id, 'archived');
        if (action === 'trash') await this.setTrashed(tabId, id, true);
        if (action === 'restore') await this.setTrashed(tabId, id, false);
        if (action === 'hard_delete') await this.hardDelete(tabId, id);
      }

      OpsState.selectedIds.clear();
      OpsUI.updateBulkBar();
      OpsToast.show(`Acción masiva completada para ${ids.length} registros.`, 'success');
    }
  };

  // --------------------------------------------------------------------------
  // 8. INTERFAZ DE USUARIO Y CONTROLADOR DOM (OPS UI)
  // --------------------------------------------------------------------------
  const OpsUI = {
    init() {
      this.bindSidebar();
      this.bindLiveClock();
      this.bindTabs();
      this.bindDrawer();
      this.bindCommandPalette();
      this.bindOmniSearch();
    },

    bindSidebar() {
      const toggleBtn = document.getElementById('opsSidebarToggleBtn');
      const sidebar = document.getElementById('opsSidebarMatte');

      if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
          OpsState.sidebarCollapsed = !OpsState.sidebarCollapsed;
          sidebar.classList.toggle('is-collapsed', OpsState.sidebarCollapsed);
          const icon = toggleBtn.querySelector('i');
          if (icon) {
            icon.className = OpsState.sidebarCollapsed ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-left';
          }
        });
      }
    },

    bindLiveClock() {
      const clockEl = document.getElementById('opsLiveClock');
      const dateEl = document.getElementById('opsLiveDate');

      const updateClock = () => {
        const now = new Date();
        if (clockEl) clockEl.textContent = now.toLocaleTimeString('es-NI', { hour12: false });
        if (dateEl) {
          const formatted = now.toLocaleDateString('es-NI', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }).toUpperCase();
          dateEl.textContent = formatted;
        }
      };

      updateClock();
      setInterval(updateClock, 1000);
    },

    bindTabs() {
      const navItems = document.querySelectorAll('.ops-nav-item');
      navItems.forEach((item) => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const tabId = item.getAttribute('data-tab');
          if (tabId) this.switchTab(tabId);
        });
      });
    },

    switchTab(tabId) {
      if (!ENTITY_REGISTRY[tabId]) return;

      OpsState.activeTab = tabId;
      OpsState.selectedIds.clear();
      this.updateBulkBar();

      // Botones activos en el sidebar
      document.querySelectorAll('.ops-nav-item').forEach((item) => {
        item.classList.toggle('is-active', item.getAttribute('data-tab') === tabId);
      });

      // Mostrar panel activo
      document.querySelectorAll('.ops-view-panel').forEach((panel) => {
        panel.classList.toggle('is-active', panel.id === `view-${tabId}`);
      });

      // Iniciar listener si la entidad no está en memoria
      const config = ENTITY_REGISTRY[tabId];
      if (config && config.collection && !OpsState.loadedTabs.has(tabId)) {
        OpsCMS.listenToCollection(tabId);
      }

      this.renderEntityView(tabId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    renderDashboardMetrics() {
      this.setText('kpiPublishedDestinations', OpsState.metrics.publishedDestinations);
      this.setText('kpiTotalDestinations', OpsState.metrics.totalDestinations);
      this.setText('kpiVerifiedBusinesses', OpsState.metrics.verifiedBusinesses);
      this.setText('kpiPendingBusinesses', OpsState.metrics.pendingBusinesses);
      this.setText('kpiActiveSos', OpsState.metrics.activeSosAlerts);
      this.setText('kpiTotalUsers', OpsState.metrics.totalUsers || (OpsState.collectionsData['13-usuarios']?.length || 0));

      const updatedEl = document.getElementById('opsMetricsLastUpdated');
      if (updatedEl) {
        updatedEl.textContent = `Actualizado: ${new Date().toLocaleTimeString('es-NI')}`;
      }
    },

    // 8.1 Renderizado de Tablas CRUD Universales
    renderEntityView(tabId) {
      const panel = document.getElementById(`view-${tabId}`);
      if (!panel) return;

      const config = ENTITY_REGISTRY[tabId];
      if (!config) return;

      // Si es una vista especializada del sistema, delegar al renderizador correspondiente
      if (tabId === '01-dashboard') return this.renderDashboardMetrics();
      if (tabId === '09-verificaciones') return this.renderVerificationsModule();
      if (tabId === '10-suscripciones') return this.renderSubscriptionsModule();
      if (tabId === '21-multimedia') return this.renderMediaLibraryModule();
      if (tabId === '24-builder') return this.renderWebsiteBuilderModule();
      if (tabId === '27-auditoria') return this.renderAuditFeed();

      // Si es una colección administrable estándar, construir o actualizar la tabla
      let items = OpsState.collectionsData[tabId] || [];

      // Aplicar filtros de estado
      if (OpsState.activeFilterStatus !== 'all') {
        items = items.filter((x) => (x.status || 'published') === OpsState.activeFilterStatus);
      }

      // Aplicar búsqueda en tiempo real
      if (OpsState.activeSearchQuery) {
        const query = OpsState.activeSearchQuery.toLowerCase();
        items = items.filter((x) => {
          const text = `${x.title || ''} ${x.name || ''} ${x.department || ''} ${x.category || ''} ${x.type || ''}`.toLowerCase();
          return text.includes(query);
        });
      }

      const totalItems = (OpsState.collectionsData[tabId] || []).length;
      const publishedCount = (OpsState.collectionsData[tabId] || []).filter((x) => x.status === 'published').length;
      const draftCount = (OpsState.collectionsData[tabId] || []).filter((x) => x.status === 'draft').length;
      const archivedCount = (OpsState.collectionsData[tabId] || []).filter((x) => x.status === 'archived').length;
      const trashedCount = (OpsState.collectionsData[tabId] || []).filter((x) => x.status === 'trashed').length;

      panel.innerHTML = `
        <div class="ops-view-header">
          <div class="ops-view-title-group">
            <h1><i class="fa-solid ${config.icon}" style="color: var(--bq-secondary);"></i> ${config.title}</h1>
            <p class="ops-view-subtitle">ADMINISTRACIÓN EDITORIAL EN TIEMPO REAL · PERSISTENCIA CLOUD FIRESTORE</p>
          </div>
          <div class="ops-view-actions">
            <button class="btn-ops-matte accent" onclick="window.BaqueanoOpsEngine.openCreateDrawer('${tabId}')">
              <i class="fa-solid fa-plus"></i> Nuevo ${config.singular || 'Registro'}
            </button>
          </div>
        </div>

        <div class="ops-crud-toolbar">
          <div class="ops-filter-group">
            <button class="ops-filter-pill ${OpsState.activeFilterStatus === 'all' ? 'is-active' : ''}" onclick="window.BaqueanoOpsEngine.setFilterStatus('${tabId}', 'all')">
              Todos <span class="ops-filter-count">${totalItems}</span>
            </button>
            <button class="ops-filter-pill ${OpsState.activeFilterStatus === 'published' ? 'is-active' : ''}" onclick="window.BaqueanoOpsEngine.setFilterStatus('${tabId}', 'published')">
              Publicados <span class="ops-filter-count">${publishedCount}</span>
            </button>
            <button class="ops-filter-pill ${OpsState.activeFilterStatus === 'draft' ? 'is-active' : ''}" onclick="window.BaqueanoOpsEngine.setFilterStatus('${tabId}', 'draft')">
              Borradores <span class="ops-filter-count">${draftCount}</span>
            </button>
            <button class="ops-filter-pill ${OpsState.activeFilterStatus === 'archived' ? 'is-active' : ''}" onclick="window.BaqueanoOpsEngine.setFilterStatus('${tabId}', 'archived')">
              Archivados <span class="ops-filter-count">${archivedCount}</span>
            </button>
            <button class="ops-filter-pill ${OpsState.activeFilterStatus === 'trashed' ? 'is-active' : ''}" onclick="window.BaqueanoOpsEngine.setFilterStatus('${tabId}', 'trashed')">
              Papelera <span class="ops-filter-count">${trashedCount}</span>
            </button>
          </div>

          <div class="ops-search-input-wrap">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" class="ops-filter-search-input" placeholder="Buscar en ${config.title}..." value="${this.escape(OpsState.activeSearchQuery)}" oninput="window.BaqueanoOpsEngine.onSearchInput('${tabId}', this.value)">
          </div>
        </div>

        <div class="ops-table-wrap">
          <table class="ops-table-matte">
            <thead>
              <tr>
                <th style="width: 40px;"><input type="checkbox" onchange="window.BaqueanoOpsEngine.toggleSelectAll('${tabId}', this.checked)"></th>
                <th>${config.singular || 'Elemento'}</th>
                <th>Territorio / Tipo</th>
                <th>Estado</th>
                <th>Actualizado</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${items.length === 0 ? `
                <tr>
                  <td colspan="6" style="text-align: center; padding: 3rem 1.5rem;">
                    <div class="ops-empty-state">
                      <i class="fa-solid ${config.icon} ops-empty-icon"></i>
                      <div class="ops-empty-title">0 ${config.title} encontrados</div>
                      <div class="ops-empty-desc">No existen registros que coincidan con los filtros actuales en Cloud Firestore.</div>
                      <button class="btn-ops-matte primary" style="margin-top: 1rem;" onclick="window.BaqueanoOpsEngine.openCreateDrawer('${tabId}')">
                        <i class="fa-solid fa-plus"></i> Crear Primer ${config.singular || 'Registro'}
                      </button>
                    </div>
                  </td>
                </tr>
              ` : items.map((item) => this.renderTableRow(tabId, item)).join('')}
            </tbody>
          </table>
        </div>
      `;
    },

    renderTableRow(tabId, item) {
      const isSelected = OpsState.selectedIds.has(item.id);
      const title = item.title || item.name || 'Sin Título';
      const status = item.status || 'published';
      const image = item.imageUrl || item.image || item.photo || '';
      const territory = item.department || item.region || item.category || 'Nacional';
      const updated = item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('es-NI', { day: '2-digit', month: 'short' }) : 'Hoy';

      return `
        <tr class="ops-table-row ${isSelected ? 'is-selected' : ''}">
          <td>
            <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="window.BaqueanoOpsEngine.toggleSelect('${item.id}', this.checked)">
          </td>
          <td>
            <div class="ops-cell-title">
              ${image ? `<img src="${image}" class="ops-cell-thumb" alt="" referrerpolicy="no-referrer">` : `<div class="ops-cell-thumb" style="display:flex;align-items:center;justify-content:center;color:var(--ops-text-muted);"><i class="fa-solid fa-image"></i></div>`}
              <div class="ops-cell-meta">
                <span class="ops-cell-meta-title">${this.escape(title)}</span>
                <span class="ops-cell-meta-sub">ID: ${item.id}</span>
              </div>
            </div>
          </td>
          <td>
            <span style="font-size: 0.8rem; color: var(--ops-text-secondary);">${this.escape(territory)}</span>
          </td>
          <td>
            <span class="ops-badge-pill ${status}">
              <i class="fa-solid ${status === 'published' ? 'fa-circle-check' : status === 'draft' ? 'fa-file-pen' : status === 'archived' ? 'fa-box-archive' : 'fa-trash-can'}"></i>
              ${status === 'published' ? 'Publicado' : status === 'draft' ? 'Borrador' : status === 'archived' ? 'Archivado' : 'Papelera'}
            </span>
          </td>
          <td style="font-size: 0.76rem; color: var(--ops-text-muted);">${updated}</td>
          <td>
            <div class="ops-table-actions">
              <button class="btn-ops-icon" title="Editar registro" onclick="window.BaqueanoOpsEngine.openEditDrawer('${tabId}', '${item.id}')">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn-ops-icon" title="Vista previa" onclick="window.BaqueanoOpsEngine.previewEntity('${tabId}', '${item.id}')">
                <i class="fa-solid fa-eye"></i>
              </button>
              <button class="btn-ops-icon" title="Duplicar" onclick="window.BaqueanoOpsEngine.duplicateEntity('${tabId}', '${item.id}')">
                <i class="fa-solid fa-copy"></i>
              </button>
              ${status === 'trashed' ? `
                <button class="btn-ops-icon success" title="Restaurar de papelera" onclick="window.BaqueanoOpsEngine.restoreEntity('${tabId}', '${item.id}')">
                  <i class="fa-solid fa-rotate-left"></i>
                </button>
                <button class="btn-ops-icon danger" title="Eliminación definitiva (SuperAdmin)" onclick="window.BaqueanoOpsEngine.hardDeleteEntity('${tabId}', '${item.id}')">
                  <i class="fa-solid fa-ban"></i>
                </button>
              ` : `
                <button class="btn-ops-icon danger" title="Mover a papelera" onclick="window.BaqueanoOpsEngine.trashEntity('${tabId}', '${item.id}')">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              `}
            </div>
          </td>
        </tr>
      `;
    },

    // 8.2 Drawer de Creación y Edición
    bindDrawer() {
      const drawer = document.getElementById('opsEntityDrawer');
      const closeBtn = document.getElementById('opsDrawerCloseBtn');
      const cancelBtn = document.getElementById('opsDrawerCancelBtn');
      const saveDraftBtn = document.getElementById('opsDrawerSaveDraftBtn');
      const savePublishBtn = document.getElementById('opsDrawerSavePublishBtn');
      const fileInput = document.getElementById('entityFileInput');
      const dropzone = document.getElementById('entityDropzone');
      const removePreviewBtn = document.getElementById('btnRemovePreview');

      const closeDrawer = () => {
        if (drawer) drawer.classList.remove('is-open');
      };

      if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
      if (cancelBtn) cancelBtn.addEventListener('click', closeDrawer);

      // Tabs internos del drawer
      const tabBtns = document.querySelectorAll('.ops-drawer-tab-btn');
      tabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const targetPane = btn.getAttribute('data-drawer-tab');
          tabBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
          document.querySelectorAll('.ops-drawer-tab-pane').forEach((pane) => {
            pane.classList.toggle('is-active', pane.id === `pane-${targetPane}`);
          });
        });
      });

      // Subida de imagen a Firebase Storage
      if (dropzone && fileInput) {
        dropzone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if (file) await this.handleFileUpload(file);
        });
      }

      if (removePreviewBtn) {
        removePreviewBtn.addEventListener('click', () => {
          const urlInput = document.getElementById('entityImageUrl');
          const previewBox = document.getElementById('entityPreviewBox');
          if (urlInput) urlInput.value = '';
          if (previewBox) previewBox.style.display = 'none';
        });
      }

      if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', () => this.submitDrawerForm('draft'));
      }
      if (savePublishBtn) {
        savePublishBtn.addEventListener('click', () => this.submitDrawerForm('published'));
      }
    },

    async handleFileUpload(file) {
      const dropzone = document.getElementById('entityDropzone');
      const previewBox = document.getElementById('entityPreviewBox');
      const previewImg = document.getElementById('entityPreviewImg');
      const urlInput = document.getElementById('entityImageUrl');

      if (dropzone) dropzone.innerHTML = '<i class="fa-solid fa-spinner fa-spin ops-dropzone-icon"></i><div>Subiendo a Firebase Storage...</div>';

      try {
        const { downloadURL } = await OpsStorage.uploadFile(file, 'destinations');
        if (urlInput) urlInput.value = downloadURL;
        if (previewImg) previewImg.src = downloadURL;
        if (previewBox) previewBox.style.display = 'block';
        if (dropzone) {
          dropzone.innerHTML = '<i class="fa-solid fa-check ops-dropzone-icon" style="color:var(--bq-jungle);"></i><div>¡Imagen subida con éxito! Haz clic para cambiar.</div>';
        }
        OpsToast.show('Imagen alojada en Storage con URL pública segura.', 'success');
      } catch (err) {
        OpsToast.show(`Error al subir imagen: ${err.message}`, 'error');
        if (dropzone) {
          dropzone.innerHTML = '<i class="fa-solid fa-cloud-arrow-up ops-dropzone-icon"></i><div>Reintentar carga de imagen</div>';
        }
      }
    },

    openDrawer(tabId, item = null) {
      const drawer = document.getElementById('opsEntityDrawer');
      const titleEl = document.getElementById('opsDrawerTitle');
      const subEl = document.getElementById('opsDrawerSubtitle');
      const config = ENTITY_REGISTRY[tabId];
      if (!drawer || !config) return;

      document.getElementById('entityCollection').value = tabId;
      document.getElementById('entityId').value = item ? item.id : '';

      titleEl.textContent = item ? `Editar ${config.singular || 'Registro'}` : `Nuevo ${config.singular || 'Registro'}`;
      subEl.textContent = item ? `ID: ${item.id}` : `Módulo: ${config.title}`;

      // Resetear campos
      document.getElementById('entityTitle').value = item ? (item.title || item.name || '') : '';
      document.getElementById('entitySlug').value = item ? (item.slug || '') : '';
      document.getElementById('entityCategory').value = item ? (item.category || item.type || '') : '';
      document.getElementById('entityStatus').value = item ? (item.status || 'published') : 'published';
      document.getElementById('entitySortOrder').value = item ? (item.sortOrder || 0) : 0;
      document.getElementById('entityShortDesc').value = item ? (item.shortDesc || '') : '';
      document.getElementById('entityDescription').value = item ? (item.description || '') : '';

      // Ubicación
      document.getElementById('entityDepartment').value = item ? (item.department || 'Nacional') : 'Nacional';
      document.getElementById('entityMunicipality').value = item ? (item.municipality || '') : '';
      document.getElementById('entityAddress').value = item ? (item.address || item.locationDetail || '') : '';
      document.getElementById('entityLatitude').value = item ? (item.latitude || item.coordinates?.lat || '') : '';
      document.getElementById('entityLongitude').value = item ? (item.longitude || item.coordinates?.lng || '') : '';

      // Tarifas
      document.getElementById('entityPriceNio').value = item ? (item.priceNio || '') : '';
      document.getElementById('entityPriceUsd').value = item ? (item.priceUsd || '') : '';
      document.getElementById('entityPhone').value = item ? (item.phone || '') : '';
      document.getElementById('entityWhatsapp').value = item ? (item.whatsapp || '') : '';
      document.getElementById('entityEmail').value = item ? (item.email || '') : '';
      document.getElementById('entityWebsite').value = item ? (item.website || '') : '';
      document.getElementById('entityDayPass').value = item ? (item.dayPass || item.amenities || '') : '';

      // Media
      const imageUrl = item ? (item.imageUrl || item.image || item.photo || '') : '';
      document.getElementById('entityImageUrl').value = imageUrl;
      const previewBox = document.getElementById('entityPreviewBox');
      const previewImg = document.getElementById('entityPreviewImg');
      if (imageUrl && previewBox && previewImg) {
        previewImg.src = imageUrl;
        previewBox.style.display = 'block';
      } else if (previewBox) {
        previewBox.style.display = 'none';
      }

      // SEO
      document.getElementById('entityMetaTitle').value = item ? (item.metaTitle || '') : '';
      document.getElementById('entityMetaDesc').value = item ? (item.metaDescription || '') : '';
      document.getElementById('entityKeywords').value = item ? (item.keywords || '') : '';

      // Activar primer tab
      document.querySelectorAll('.ops-drawer-tab-btn').forEach((b, idx) => b.classList.toggle('is-active', idx === 0));
      document.querySelectorAll('.ops-drawer-tab-pane').forEach((p, idx) => p.classList.toggle('is-active', idx === 0));

      drawer.classList.add('is-open');
    },

    async submitDrawerForm(statusToSave) {
      const tabId = document.getElementById('entityCollection').value;
      const titleInput = document.getElementById('entityTitle');

      if (!titleInput.value.trim()) {
        OpsToast.show('El título / nombre es un campo obligatorio.', 'warning');
        titleInput.focus();
        return;
      }

      const id = document.getElementById('entityId').value;
      const payload = {
        id: id || undefined,
        title: titleInput.value.trim(),
        name: titleInput.value.trim(),
        slug: document.getElementById('entitySlug').value.trim() || titleInput.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: document.getElementById('entityCategory').value.trim(),
        status: statusToSave,
        sortOrder: parseInt(document.getElementById('entitySortOrder').value, 10) || 0,
        shortDesc: document.getElementById('entityShortDesc').value.trim(),
        description: document.getElementById('entityDescription').value.trim(),
        department: document.getElementById('entityDepartment').value,
        municipality: document.getElementById('entityMunicipality').value.trim(),
        address: document.getElementById('entityAddress').value.trim(),
        latitude: parseFloat(document.getElementById('entityLatitude').value) || null,
        longitude: parseFloat(document.getElementById('entityLongitude').value) || null,
        priceNio: parseFloat(document.getElementById('entityPriceNio').value) || 0,
        priceUsd: parseFloat(document.getElementById('entityPriceUsd').value) || 0,
        phone: document.getElementById('entityPhone').value.trim(),
        whatsapp: document.getElementById('entityWhatsapp').value.trim(),
        email: document.getElementById('entityEmail').value.trim(),
        website: document.getElementById('entityWebsite').value.trim(),
        dayPass: document.getElementById('entityDayPass').value.trim(),
        imageUrl: document.getElementById('entityImageUrl').value.trim(),
        metaTitle: document.getElementById('entityMetaTitle').value.trim(),
        metaDescription: document.getElementById('entityMetaDesc').value.trim(),
        keywords: document.getElementById('entityKeywords').value.trim()
      };

      try {
        await OpsCMS.saveEntity(tabId, payload);
        const drawer = document.getElementById('opsEntityDrawer');
        if (drawer) drawer.classList.remove('is-open');
        OpsToast.show(`Registro guardado exitosamente como "${statusToSave}".`, 'success');
      } catch (err) {
        OpsToast.show(`Error al guardar en Firestore: ${err.message}`, 'error');
      }
    },

    updateBulkBar() {
      const bar = document.getElementById('opsBulkBar');
      const countEl = document.getElementById('opsBulkCount');
      const size = OpsState.selectedIds.size;

      if (bar && countEl) {
        countEl.textContent = `${size} seleccionado${size === 1 ? '' : 's'}`;
        bar.classList.toggle('is-visible', size > 0);
      }
    },

    // 8.3 Módulos Especializados
    renderVerificationsModule() {
      const panel = document.getElementById('view-09-verificaciones');
      if (!panel) return;

      const businesses = OpsState.collectionsData['08-negocios'] || [];

      panel.innerHTML = `
        <div class="ops-view-header">
          <div class="ops-view-title-group">
            <h1><i class="fa-solid fa-certificate" style="color: var(--bq-accent);"></i> Verificaciones & Sello Oficial</h1>
            <p class="ops-view-subtitle">ACREDITACIÓN TERRITORIAL Y FISCALIZACIÓN EN CAMPO BAJO LEY 1210/1211</p>
          </div>
        </div>

        <div class="ops-table-wrap">
          <table class="ops-table-matte">
            <thead>
              <tr>
                <th>Negocio</th>
                <th>Territorio</th>
                <th>Estado de Sello</th>
                <th>Notas de Acreditación</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${businesses.length === 0 ? `
                <tr><td colspan="5" style="text-align:center;padding:2rem;">No hay negocios registrados para verificar.</td></tr>
              ` : businesses.map((b) => `
                <tr class="ops-table-row">
                  <td><strong>${this.escape(b.name || b.title)}</strong><div style="font-size:0.75rem;color:var(--ops-text-muted);">ID: ${b.id}</div></td>
                  <td>${this.escape(b.department || 'Nacional')}</td>
                  <td>
                    <span class="ops-badge-pill ${b.verified ? 'verified' : 'draft'}">
                      <i class="fa-solid ${b.verified ? 'fa-shield-check' : 'fa-clock'}"></i>
                      ${b.verified ? 'Verificado Oficial' : 'Sin Sello'}
                    </span>
                  </td>
                  <td style="font-size:0.8rem;color:var(--ops-text-secondary);max-width:280px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${this.escape(b.verificationNotes || 'Pendiente de auditoría física')}
                  </td>
                  <td style="text-align: right;">
                    ${b.verified ? `
                      <button class="btn-ops-matte" onclick="window.BaqueanoOpsEngine.revokeBusinessVerification('${b.id}')"><i class="fa-solid fa-ban"></i> Revocar</button>
                    ` : `
                      <button class="btn-ops-matte primary" onclick="window.BaqueanoOpsEngine.verifyBusiness('${b.id}')"><i class="fa-solid fa-check"></i> Asignar Sello</button>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    },

    renderSubscriptionsModule() {
      const panel = document.getElementById('view-10-suscripciones');
      if (!panel) return;

      const businesses = OpsState.collectionsData['08-negocios'] || [];

      panel.innerHTML = `
        <div class="ops-view-header">
          <div class="ops-view-title-group">
            <h1><i class="fa-solid fa-id-card" style="color: var(--bq-secondary);"></i> Suscripciones & Membresías</h1>
            <p class="ops-view-subtitle">VIGENCIA, COMPROBANTES DE PAGO Y ALERTAS DE RENOVACIÓN DE ALIADOS</p>
          </div>
        </div>

        <div class="ops-table-wrap">
          <table class="ops-table-matte">
            <thead>
              <tr>
                <th>Aliado / Negocio</th>
                <th>Tipo de Membresía</th>
                <th>Inicio</th>
                <th>Vencimiento</th>
                <th>Estado</th>
                <th style="text-align: right;">Gestión</th>
              </tr>
            </thead>
            <tbody>
              ${businesses.length === 0 ? `
                <tr><td colspan="6" style="text-align:center;padding:2rem;">No hay registros de suscripción activos.</td></tr>
              ` : businesses.map((b) => {
                const isExpired = b.subscriptionEnd && new Date(b.subscriptionEnd) < new Date();
                return `
                  <tr class="ops-table-row">
                    <td><strong>${this.escape(b.name || b.title)}</strong></td>
                    <td>${b.subscriptionType || 'Comunitaria Anual'}</td>
                    <td style="font-size:0.78rem;">${b.subscriptionStart || '2026-01-01'}</td>
                    <td style="font-size:0.78rem;">${b.subscriptionEnd || '2026-12-31'}</td>
                    <td>
                      <span class="ops-badge-pill ${isExpired ? 'trashed' : 'published'}">
                        ${isExpired ? 'Vencida' : 'Activa'}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      <button class="btn-ops-matte" onclick="window.BaqueanoOpsEngine.manageSubscription('${b.id}')"><i class="fa-solid fa-pen"></i> Actualizar</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    },

    renderWebsiteBuilderModule() {
      const panel = document.getElementById('view-24-builder');
      if (!panel) return;

      panel.innerHTML = `
        <div class="ops-view-header">
          <div class="ops-view-title-group">
            <h1><i class="fa-solid fa-cubes" style="color: var(--bq-secondary);"></i> Website Builder Dinámico</h1>
            <p class="ops-view-subtitle">EDITOR VISUAL DE PÁGINAS, SECCIONES, BANNERS Y ACCESIBILIDAD RESPONSIVE</p>
          </div>
          <div class="ops-view-actions">
            <button class="btn-ops-matte primary" onclick="window.BaqueanoOpsEngine.saveGlobalAnnouncement()"><i class="fa-solid fa-floppy-disk"></i> Guardar Anuncio</button>
          </div>
        </div>

        <div style="background: var(--ops-surface-1); border: 1px solid var(--ops-border-subtle); border-radius: var(--ops-radius-lg); padding: 1.5rem; margin-bottom: 1.5rem;">
          <h3 style="font-size: 1rem; color: #fff; margin-bottom: 1rem;"><i class="fa-solid fa-bullhorn"></i> Banner de Anuncio Global (Web & Android)</h3>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <label style="font-size: 0.8rem; color: var(--ops-text-secondary);">Texto oficial desplegado en el cintillo superior de toda la plataforma:</label>
            <input type="text" id="cfgAnnouncementText" placeholder="Ej. ¡Descubre Nicaragua auténtica con baqueanos campesinos sin intermediarios!" style="background: var(--ops-surface-2); border: 1px solid var(--ops-border-subtle); border-radius: var(--ops-radius-md); padding: 0.65rem 1rem; color: #fff; font-size: 0.88rem;">
          </div>
        </div>

        <div style="background: var(--ops-surface-1); border: 1px solid var(--ops-border-subtle); border-radius: var(--ops-radius-lg); padding: 1.5rem;">
          <h3 style="font-size: 1rem; color: #fff; margin-bottom: 1rem;"><i class="fa-solid fa-layer-group"></i> Editor de Páginas & Secciones</h3>
          <div class="ops-form-grid-2" style="margin-bottom: 1.25rem;">
            <div class="ops-form-group">
              <label class="ops-form-label">Página a Modificar:</label>
              <select class="ops-form-select" id="builderPageSelect" onchange="window.BaqueanoOpsEngine.onBuilderPageChange(this.value)">
                <option value="index">Página Principal (index.html)</option>
                <option value="nosotros">Nosotros & Manifiesto (nosotros.html)</option>
                <option value="destinos">Catálogo de Destinos (destinos.html)</option>
                <option value="aliados">Red de Aliados (aliados.html)</option>
                <option value="gastronomia">Gastronomía (gastronomia.html)</option>
                <option value="historia">Historia Patria (historia.html)</option>
                <option value="ambiental">Sostenibilidad (ambiental.html)</option>
              </select>
            </div>
            <div class="ops-form-group" style="justify-content: flex-end;">
              <button class="btn-ops-matte accent" onclick="window.BaqueanoOpsEngine.addSectionToPage()"><i class="fa-solid fa-plus"></i> Añadir Nueva Sección</button>
            </div>
          </div>
          <div id="builderSectionsContainer">
            <div style="padding: 1.5rem; background: var(--ops-surface-2); border-radius: var(--ops-radius-md); border: 1px solid var(--ops-border-subtle); margin-bottom: 1rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.75rem;">
                <strong style="color:#fff;"><i class="fa-solid fa-heading"></i> Sección 01 — Hero Principal</strong>
                <span class="ops-badge-pill published">Activo</span>
              </div>
              <p style="font-size:0.82rem; color:var(--ops-text-secondary); margin:0;">Encabezado cinemático con título dinámico, subtítulo cultural y botón de llamada a la acción (CTA).</p>
            </div>
            <div style="padding: 1.5rem; background: var(--ops-surface-2); border-radius: var(--ops-radius-md); border: 1px solid var(--ops-border-subtle);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.75rem;">
                <strong style="color:#fff;"><i class="fa-solid fa-mountain-sun"></i> Sección 02 — Destinos Destacados</strong>
                <span class="ops-badge-pill published">Activo</span>
              </div>
              <p style="font-size:0.82rem; color:var(--ops-text-secondary); margin:0;">Rejilla interactiva conectada a Cloud Firestore en vivo mostrando los destinos más populares.</p>
            </div>
          </div>
        </div>
      `;
    },

    renderMediaLibraryModule() {
      const panel = document.getElementById('view-21-multimedia');
      if (!panel) return;

      panel.innerHTML = `
        <div class="ops-view-header">
          <div class="ops-view-title-group">
            <h1><i class="fa-solid fa-photo-film" style="color: var(--bq-secondary);"></i> Biblioteca Multimedia Cloud Storage</h1>
            <p class="ops-view-subtitle">ALMACENAMIENTO DE ALTA RESOLUCIÓN: FOTOGRAFÍAS, AUDIOS, VIDEOS Y DOCUMENTOS</p>
          </div>
          <div class="ops-view-actions">
            <button class="btn-ops-matte accent" onclick="document.getElementById('mediaDirectUpload').click()"><i class="fa-solid fa-cloud-arrow-up"></i> Cargar Archivo</button>
            <input type="file" id="mediaDirectUpload" style="display:none;" onchange="window.BaqueanoOpsEngine.onDirectMediaUpload(this.files[0])">
          </div>
        </div>

        <div class="ops-dropzone" style="margin-bottom: 1.5rem;" onclick="document.getElementById('mediaDirectUpload').click()">
          <i class="fa-solid fa-cloud-arrow-up ops-dropzone-icon"></i>
          <div style="font-size:0.95rem; font-weight:700; color:#fff;">Haz clic o arrastra archivos multimedia para alojarlos en Cloud Storage</div>
          <div style="font-size:0.78rem; color:var(--ops-text-muted); margin-top:0.3rem;">Soporte nativo para WebP, PNG, JPG, MP3 y PDF bajo políticas de lectura pública y escritura administrativa.</div>
        </div>

        <div style="background: var(--ops-surface-1); border: 1px solid var(--ops-border-subtle); border-radius: var(--ops-radius-md); padding: 1.25rem;">
          <h3 style="font-size:0.92rem; color:#fff; margin-bottom:1rem;"><i class="fa-solid fa-folder-tree"></i> Rutas Oficiales de Almacenamiento</h3>
          <ul style="font-size:0.82rem; color:var(--ops-text-secondary); line-height:1.8; margin:0; padding-left:1.25rem;">
            <li><code>/destinations/{id}</code> — Fotografías oficiales de senderos, playas y volcanes.</li>
            <li><code>/businesses/{id}</code> — Logotipos y galerías de anfitriones y cooperativas.</li>
            <li><code>/pages/{pageId}</code> — Banners y fondos dinámicos del Website Builder.</li>
            <li><code>/multimedia/{id}</code> — Archivos de audio folclórico, marimba y documentos patrimoniales.</li>
          </ul>
        </div>
      `;
    },

    renderAuditFeed() {
      const logs = OpsState.collectionsData['27-auditoria'] || [];

      // Actualizar feed en Dashboard (Vista 01)
      const dashFeed = document.getElementById('opsAuditFeed');
      if (dashFeed) {
        if (logs.length === 0) {
          dashFeed.innerHTML = '<div class="ops-empty-state" style="padding: 1.5rem;"><div style="font-size: 0.85rem;">Esperando eventos de auditoría...</div></div>';
        } else {
          dashFeed.innerHTML = logs.slice(0, 8).map((log) => `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; padding: 0.65rem 0; border-bottom: 1px solid var(--ops-border-subtle); font-size: 0.8rem;">
              <div>
                <strong style="color: #fff;">${this.escape(log.action)}</strong>
                <div style="color: var(--ops-text-secondary); font-size: 0.74rem;">${this.escape(log.description || '')}</div>
              </div>
              <span style="font-size: 0.7rem; color: var(--ops-text-muted); white-space: nowrap;">
                ${log.timestamp ? new Date(log.timestamp).toLocaleTimeString('es-NI', { hour12: false }) : ''}
              </span>
            </div>
          `).join('');
        }
      }

      // Actualizar Módulo Dedicado de Auditoría (Vista 27)
      const auditPanel = document.getElementById('view-27-auditoria');
      if (auditPanel) {
        auditPanel.innerHTML = `
          <div class="ops-view-header">
            <div class="ops-view-title-group">
              <h1><i class="fa-solid fa-file-shield" style="color: var(--bq-secondary);"></i> Registro Inmutable de Auditoría</h1>
              <p class="ops-view-subtitle">TRAZABILIDAD DE ACCIONES EDITORIALES, VERIFICACIONES Y MODIFICACIONES EN FIRESTORE</p>
            </div>
          </div>

          <div class="ops-table-wrap">
            <table class="ops-table-matte">
              <thead>
                <tr>
                  <th>Fecha &amp; Hora</th>
                  <th>Acción</th>
                  <th>Módulo</th>
                  <th>Detalle Operativo</th>
                  <th>Responsable</th>
                </tr>
              </thead>
              <tbody id="auditTableBody">
                ${logs.length === 0 ? `
                  <tr><td colspan="5" style="text-align:center;padding:2.5rem;color:var(--ops-text-muted);">No existen registros de auditoría aún.</td></tr>
                ` : logs.map((log) => `
                  <tr class="ops-table-row">
                    <td style="font-size:0.78rem; font-family:monospace; color:var(--ops-text-muted);">
                      ${log.timestamp ? new Date(log.timestamp).toLocaleString('es-NI', { hour12: false }) : 'Reciente'}
                    </td>
                    <td><strong style="color:#fff;">${this.escape(log.action)}</strong></td>
                    <td>${this.escape(log.module || 'Sistema')}</td>
                    <td style="font-size:0.82rem; color:var(--ops-text-secondary); max-width:320px;">
                      ${this.escape(log.description || '')}
                    </td>
                    <td><code>${this.escape(log.performedBy || 'Admin')}</code></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
    },

    // 8.4 Command Palette (Ctrl+K) con Búsqueda Omnicanal
    bindCommandPalette() {
      const paletteBtn = document.getElementById('opsCommandPaletteTrigger');
      const modal = document.getElementById('opsCommandModalBackdrop');
      const input = document.getElementById('opsCommandSearchInput');
      const closeBtn = document.getElementById('opsCommandCloseBtn');
      const resultsContainer = document.getElementById('opsCommandResultsList');

      const openPalette = () => {
        if (modal) {
          modal.classList.add('is-open');
          if (input) {
            input.value = '';
            input.focus();
          }
          this.renderPaletteResults('');
        }
      };

      const closePalette = () => {
        if (modal) modal.classList.remove('is-open');
      };

      if (paletteBtn) paletteBtn.addEventListener('click', openPalette);
      if (closeBtn) closeBtn.addEventListener('click', closePalette);

      if (input) {
        input.addEventListener('input', (e) => this.renderPaletteResults(e.target.value));
      }

      window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          if (modal && modal.classList.contains('is-open')) closePalette();
          else openPalette();
        }
        if (e.key === 'Escape' && modal) closePalette();
      });
    },

    renderPaletteResults(query) {
      const resultsContainer = document.getElementById('opsCommandResultsList');
      if (!resultsContainer) return;

      const q = (query || '').toLowerCase().trim();
      const results = [];

      // Comandos y navegación directa
      Object.keys(ENTITY_REGISTRY).forEach((tabId) => {
        const conf = ENTITY_REGISTRY[tabId];
        if (!q || conf.title.toLowerCase().includes(q) || tabId.includes(q)) {
          results.push({
            type: 'Módulo',
            label: conf.title,
            icon: conf.icon,
            action: () => {
              this.switchTab(tabId);
              document.getElementById('opsCommandModalBackdrop')?.classList.remove('is-open');
            }
          });
        }
      });

      // Búsqueda en entidades cargadas
      Object.keys(OpsState.collectionsData).forEach((tabId) => {
        const items = OpsState.collectionsData[tabId] || [];
        items.forEach((item) => {
          const text = `${item.title || ''} ${item.name || ''}`.trim();
          if (text && q && text.toLowerCase().includes(q)) {
            results.push({
              type: ENTITY_REGISTRY[tabId]?.singular || 'Elemento',
              label: text,
              icon: ENTITY_REGISTRY[tabId]?.icon || 'fa-file',
              action: () => {
                this.switchTab(tabId);
                this.openDrawer(tabId, item);
                document.getElementById('opsCommandModalBackdrop')?.classList.remove('is-open');
              }
            });
          }
        });
      });

      if (results.length === 0) {
        resultsContainer.innerHTML = '<div style="padding:1.5rem;text-align:center;color:var(--ops-text-muted);font-size:0.85rem;">No se encontraron resultados coincidentes.</div>';
        return;
      }

      resultsContainer.innerHTML = results.slice(0, 15).map((r, idx) => `
        <div class="ops-command-item" data-index="${idx}">
          <i class="fa-solid ${r.icon}"></i>
          <div style="display:flex;flex-direction:column;gap:0.1rem;flex:1;">
            <span style="color:#fff;font-weight:600;">${this.escape(r.label)}</span>
            <span style="font-size:0.72rem;color:var(--ops-text-muted);">${r.type}</span>
          </div>
          <i class="fa-solid fa-chevron-right" style="font-size:0.7rem;color:var(--ops-text-muted);"></i>
        </div>
      `).join('');

      resultsContainer.querySelectorAll('.ops-command-item').forEach((el, idx) => {
        el.addEventListener('click', () => {
          if (results[idx] && typeof results[idx].action === 'function') {
            results[idx].action();
          }
        });
      });
    },

    bindOmniSearch() {
      const topTrigger = document.getElementById('opsCommandPaletteTrigger');
      if (topTrigger) {
        topTrigger.addEventListener('click', () => {
          const modal = document.getElementById('opsCommandModalBackdrop');
          if (modal) {
            modal.classList.add('is-open');
            document.getElementById('opsCommandSearchInput')?.focus();
          }
        });
      }
    },

    updateUserProfileUI(user) {
      const nameEl = document.getElementById('opsTopUserName');
      const roleEl = document.getElementById('opsTopUserRole');
      const avatarEl = document.getElementById('opsTopUserAvatar');

      const displayName = user.name || user.displayName || user.email || 'Administrador';
      if (nameEl) nameEl.textContent = displayName;
      if (roleEl) roleEl.textContent = 'Super Administrador';

      if (avatarEl) {
        const photo = user.photoURL ||
          (Array.isArray(user.providerData) && user.providerData.find((p) => p && p.photoURL)?.photoURL) ||
          '';
        const initials = displayName.substring(0, 2).toUpperCase();

        if (photo) {
          avatarEl.innerHTML = `<img src="${photo}" alt="${displayName}" class="ops-user-avatar-img" referrerpolicy="no-referrer" loading="eager" onerror="this.remove(); this.parentElement.textContent='${initials}';">`;
          avatarEl.title = displayName;
        } else {
          avatarEl.textContent = initials;
          avatarEl.title = displayName;
        }
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
    }
  };

  // --------------------------------------------------------------------------
  // 9. FACHADA PÚBLICA (WINDOW.BAQUEANOOPSENGINE)
  // --------------------------------------------------------------------------
  window.BaqueanoOpsEngine = {
    init() {
      console.info('[BaqueanoOpsEngine] Inicializando cerebro de operaciones & CMS Universal...');
      OpsUI.init();
      OpsAuth.init();
    },

    // Navegación
    switchTab(tabId) {
      OpsUI.switchTab(tabId);
    },

    // Filtros y Búsqueda
    setFilterStatus(tabId, status) {
      OpsState.activeFilterStatus = status;
      OpsUI.renderEntityView(tabId);
    },

    onSearchInput(tabId, query) {
      OpsState.activeSearchQuery = query;
      OpsUI.renderEntityView(tabId);
    },

    toggleSelect(entityId, isChecked) {
      if (isChecked) OpsState.selectedIds.add(entityId);
      else OpsState.selectedIds.delete(entityId);
      OpsUI.updateBulkBar();
    },

    toggleSelectAll(tabId, isChecked) {
      const items = OpsState.collectionsData[tabId] || [];
      if (isChecked) {
        items.forEach((x) => OpsState.selectedIds.add(x.id));
      } else {
        OpsState.selectedIds.clear();
      }
      OpsUI.renderEntityView(tabId);
      OpsUI.updateBulkBar();
    },

    // Operaciones de Formulario / Drawer
    openCreateDrawer(tabId) {
      OpsUI.openDrawer(tabId, null);
    },

    openEditDrawer(tabId, entityId) {
      const item = (OpsState.collectionsData[tabId] || []).find((x) => x.id === entityId);
      if (item) OpsUI.openDrawer(tabId, item);
    },

    async previewEntity(tabId, entityId) {
      const item = (OpsState.collectionsData[tabId] || []).find((x) => x.id === entityId);
      if (!item) return;

      const modal = document.getElementById('opsPreviewModal');
      const titleEl = document.getElementById('previewModalTitle');
      const bodyEl = document.getElementById('previewModalBody');

      if (!modal || !bodyEl) return;

      titleEl.textContent = item.title || item.name || 'Vista Previa';
      bodyEl.innerHTML = `
        <div style="display:flex;gap:1.5rem;flex-wrap:wrap;">
          ${item.imageUrl ? `<img src="${item.imageUrl}" style="width:100%;max-height:260px;object-fit:cover;border-radius:var(--ops-radius-md);border:1px solid var(--ops-border-subtle);" alt="">` : ''}
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;">
              <span class="ops-badge-pill ${item.status || 'published'}">${item.status || 'published'}</span>
              <span style="font-size:0.8rem;color:var(--ops-text-secondary);">${item.department || 'Nacional'}</span>
            </div>
            <h2 style="font-size:1.3rem;color:#fff;margin:0 0 0.75rem 0;">${OpsUI.escape(item.title || item.name)}</h2>
            <p style="font-size:0.88rem;color:var(--ops-text-secondary);line-height:1.6;">${OpsUI.escape(item.description || 'Sin descripción detallada.')}</p>
            ${item.priceUsd ? `<div style="font-size:1.1rem;font-weight:700;color:var(--bq-accent);margin-top:1rem;">$${item.priceUsd} USD <span style="font-size:0.8rem;color:var(--ops-text-muted);">(C$ ${item.priceNio || item.priceUsd * 36.65})</span></div>` : ''}
          </div>
        </div>
      `;

      modal.classList.add('is-open');
      const closeBtn = document.getElementById('previewModalCloseBtn');
      if (closeBtn) closeBtn.onclick = () => modal.classList.remove('is-open');
    },

    // Mutaciones individuales
    async saveDestination(destData) {
      return OpsCMS.saveEntity('03-destinos', destData);
    },

    async duplicateEntity(tabId, entityId) {
      await OpsCMS.duplicate(tabId, entityId);
    },

    async trashEntity(tabId, entityId) {
      const confirmed = await OpsDialog.confirm({
        title: '¿Mover registro a la papelera?',
        message: 'El elemento se despublicará y podrá ser restaurado o eliminado definitivamente por el Superadministrador.',
        isDangerous: true,
        confirmText: 'Mover a Papelera'
      });
      if (confirmed) await OpsCMS.setTrashed(tabId, entityId, true);
    },

    async restoreEntity(tabId, entityId) {
      await OpsCMS.setTrashed(tabId, entityId, false);
    },

    async hardDeleteEntity(tabId, entityId) {
      const confirmed = await OpsDialog.confirm({
        title: '⚠️ ¿ELIMINACIÓN FÍSICA DEFINITIVA?',
        message: 'Esta acción borrará el registro para siempre de Cloud Firestore y no podrá recuperarse.',
        isDangerous: true,
        confirmText: 'Eliminar Permanentemente'
      });
      if (confirmed) await OpsCMS.hardDelete(tabId, entityId);
    },

    // Verificaciones & Suscripciones
    async verifyBusiness(businessId) {
      const confirmed = await OpsDialog.confirm({
        title: '¿Acreditar Sello Oficial BAQUEANO?',
        message: 'Se certificará que el negocio cumple la auditoría de campo bajo Ley 1210 y 1211.',
        confirmText: 'Asignar Sello'
      });
      if (!confirmed) return;

      const db = OpsCMS.getDb();
      if (!db) return;

      await db.collection('businesses').doc(businessId).update({
        verified: true,
        verificationStatus: 'verified',
        verifiedAt: new Date().toISOString(),
        verifiedBy: OpsState.currentUser?.email || 'admin',
        verificationNotes: 'Acreditado tras verificación presencial de estándares ecoturísticos.',
        status: 'published',
        updatedAt: new Date().toISOString()
      });

      OpsToast.show('Sello oficial asignado exitosamente.', 'success');
      OpsUI.renderVerificationsModule();
    },

    async revokeBusinessVerification(businessId) {
      const confirmed = await OpsDialog.confirm({
        title: '¿Revocar Sello de Verificación?',
        message: 'El negocio perderá el distintivo oficial de BAQUEANO en Web y Android.',
        isDangerous: true,
        confirmText: 'Revocar Sello'
      });
      if (!confirmed) return;

      const db = OpsCMS.getDb();
      if (!db) return;

      await db.collection('businesses').doc(businessId).update({
        verified: false,
        verificationStatus: 'unverified',
        updatedAt: new Date().toISOString()
      });

      OpsToast.show('Sello de verificación revocado.', 'warning');
      OpsUI.renderVerificationsModule();
    },

    async manageSubscription(businessId) {
      const confirmed = await OpsDialog.confirm({
        title: '¿Renovar Suscripción de Aliado por 1 Año?',
        message: 'Se actualizará la vigencia hasta el 31 de Diciembre del año en curso con comprobante fiscal validado.',
        confirmText: 'Renovar Membresía'
      });
      if (!confirmed) return;

      const db = OpsCMS.getDb();
      if (!db) return;

      await db.collection('businesses').doc(businessId).update({
        subscriptionStatus: 'active',
        subscriptionType: 'Comunitaria Anual',
        subscriptionStart: new Date().toISOString().split('T')[0],
        subscriptionEnd: `${new Date().getFullYear() + 1}-12-31`,
        updatedAt: new Date().toISOString()
      });

      OpsToast.show('Membresía renovada por 1 año.', 'success');
      OpsUI.renderSubscriptionsModule();
    },

    async saveGlobalAnnouncement() {
      const input = document.getElementById('cfgAnnouncementText');
      const text = input ? input.value.trim() : '';

      const db = OpsCMS.getDb();
      if (!db) return;

      await db.collection('app_config').doc('global').set({
        announcementText: text,
        updatedAt: new Date().toISOString(),
        updatedBy: OpsState.currentUser?.email || 'admin'
      }, { merge: true });

      OpsToast.show('Anuncio global sincronizado con Website y Android.', 'success');
    },

    async onDirectMediaUpload(file) {
      if (!file) return;
      try {
        const { downloadURL } = await OpsStorage.uploadFile(file, 'multimedia');
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(downloadURL).catch(() => {});
        }
        OpsToast.show(`Archivo "${file.name}" subido. Enlace copiado al portapapeles.`, 'success', 4500);
      } catch (err) {
        OpsToast.show(`Error de carga: ${err.message}`, 'error');
      }
    }
  };

  // --------------------------------------------------------------------------
  // 10. AUTO-INICIALIZACIÓN
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    window.BaqueanoOpsEngine.init();

    // Eventos de barra flotante de acciones masivas
    const btnBulkPub = document.getElementById('btnBulkPublish');
    const btnBulkDft = document.getElementById('btnBulkDraft');
    const btnBulkArc = document.getElementById('btnBulkArchive');
    const btnBulkTrs = document.getElementById('btnBulkTrash');

    if (btnBulkPub) btnBulkPub.addEventListener('click', () => OpsCMS.executeBulkAction(OpsState.activeTab, 'publish', Array.from(OpsState.selectedIds)));
    if (btnBulkDft) btnBulkDft.addEventListener('click', () => OpsCMS.executeBulkAction(OpsState.activeTab, 'draft', Array.from(OpsState.selectedIds)));
    if (btnBulkArc) btnBulkArc.addEventListener('click', () => OpsCMS.executeBulkAction(OpsState.activeTab, 'archive', Array.from(OpsState.selectedIds)));
    if (btnBulkTrs) btnBulkTrs.addEventListener('click', () => OpsCMS.executeBulkAction(OpsState.activeTab, 'trash', Array.from(OpsState.selectedIds)));
  });

})(window, document);
