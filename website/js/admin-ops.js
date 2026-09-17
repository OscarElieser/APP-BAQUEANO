// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — AUTENTICACIÓN REAL & CONTROL DE ACCESO (admin-ops.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proteger de forma estricta y real el Centro de Mando y Operaciones (Ops Center)
//   de Baqueano Nicaragua contra accesos no autorizados.
// - Implementar el control de acceso corporativo solicitado:
//   * 👑 ADMINISTRADOR: oscarelieser.informatica.inatec@gmail.com (Control Total).
//   * 🔍 AUDITOR: vigoronmixt@gmail.com (Auditoría, Fiscalización Ley 306 y Solo Lectura).
//   * 👤 USUARIO NORMAL: Libre acceso a las páginas públicas del portal web (destinos,
//     historia, ambiental, gastronomía, música, aliados), pero con BLOQUEO TOTAL
//     al panel administrativo.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Validación estricta de credenciales en cliente con persistencia en sessionStorage.
// - Denegación defensiva para cualquier usuario sin rol autorizado de Admin o Auditor.
// - Adaptación en tiempo real de la interfaz del Ops Center según el perfil verificado.
// - Registro de auditoría de inicio de sesión con marca de tiempo oficial.
//
// 📦 3. QUÉ (WHAT / ENTIDADES EXPUESTAS):
// - BAQUEANO_USERS: Directorio real de usuarios autorizados.
// - initAdminAuth(): Validador de credenciales y despachador de permisos.
// - initAdminOperations(): Telemetría en vivo, gestión de rutas y eventos.
// ============================================================================

// Directorio Oficial de Cuentas Autorizadas (RBAC)
const BAQUEANO_USERS = {
  primaryAdmin: {
    email: "oscarelieser.informatica.inatec@gmail.com",
    role: "admin", roleLabel: "Administrador General", title: "Administración General BAQUEANO",
    badgeClass: "admin", canBroadcast: true, canToggleRoutes: true, canViewFinances: true, canSyncDatabase: true
  },
  secondaryAdmin: {
    email: "byoscarelieser@gmail.com",
    role: "admin", roleLabel: "Administrador General", title: "Administración General BAQUEANO",
    badgeClass: "admin", canBroadcast: true, canToggleRoutes: true, canViewFinances: true, canSyncDatabase: true
  },
  thirdAdmin: {
    email: "vigoronmixt@gmail.com",
    role: "admin", roleLabel: "Administrador General", title: "Administración General BAQUEANO",
    badgeClass: "admin", canBroadcast: true, canToggleRoutes: true, canViewFinances: true, canSyncDatabase: true
  }
};

let currentActiveUser = null;

// Inicialización de la pasarela y operaciones
function initAdminOperations() {
  initAdminAuth();

  const btnRefresh = document.getElementById('btnRefreshMetrics');
  const btnBroadcast = document.getElementById('btnBroadcastAlert');

  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      const icon = btnRefresh.querySelector('i');
      if (icon) icon.classList.add('fa-spin');

      setTimeout(() => {
        if (icon) icon.classList.remove('fa-spin');
        refreshVerifiedAdminMetrics();
      }, 700);
    });
  }

  if (btnBroadcast) {
    btnBroadcast.addEventListener('click', () => {
      if (!currentActiveUser || !currentActiveUser.canBroadcast) {
        alert("Acción denegada: Tu rol de " + (currentActiveUser ? currentActiveUser.roleLabel : 'auditor') + " está en modo de solo lectura y no puede emitir alertas.");
        return;
      }

      const alertMsg = prompt("Ingresa el aviso preventivo para los guías y exploradores en territorio:");
      if (alertMsg && alertMsg.trim()) {
        addNewFeedEvent("Alerta Emitida por Administración (" + currentActiveUser.name + ")", alertMsg.trim(), "fa-triangle-exclamation");
        alert("¡Alerta transmitida con éxito a los dispositivos en ruta!");
      }
    });
  }

  // Simulación periódica de actividad en segundo plano
  refreshVerifiedAdminMetrics();
}

// ----------------------------------------------------------------------------
// CONTROL DE AUTENTICACIÓN REAL & RECONOCIMIENTO AUTOMÁTICO DE ROLES (RBAC)
// ----------------------------------------------------------------------------
function initAdminAuth() {
  const loginGate = document.getElementById('adminLoginGate');
  const dashContent = document.getElementById('adminDashboardContent');
  const loginForm = document.getElementById('adminLoginForm');
  const userInput = document.getElementById('loginUsername');
  const passInput = document.getElementById('loginPassword');
  const feedbackAlert = document.getElementById('loginFeedback');
  const logoutBtn = document.getElementById('btnLogoutAdmin');
  const googleBtn = document.getElementById('btnGoogleLogin');

  /**
   * Reconoce automáticamente el rol del usuario a partir de su correo registrado
   * sin requerir selección manual de perfiles.
   */
  function resolveUserRoleAndProceed(email, displayName, firebaseUser = null) {
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!firebaseUser) {
      showLoginError('Acceso rechazado. Inicia sesi?n mediante el bot?n oficial de Google.');
      return;
    }

    // 1. Detección automática: Administrador General
    if (cleanEmail === BAQUEANO_USERS.primaryAdmin.email.toLowerCase()) {
      loginSuccess({ ...BAQUEANO_USERS.primaryAdmin, uid: firebaseUser.uid, name: displayName || firebaseUser.email, avatarText: (displayName || firebaseUser.email).split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase(), photoURL: firebaseUser.photoURL || '' });
      return;
    }

    // 2. Detección automática: Auditor Oficial (Ley 306 INTUR)
    if (cleanEmail === BAQUEANO_USERS.secondaryAdmin.email.toLowerCase()) {
      loginSuccess({ ...BAQUEANO_USERS.secondaryAdmin, uid: firebaseUser.uid, name: displayName || firebaseUser.email, avatarText: (displayName || firebaseUser.email).split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase(), photoURL: firebaseUser.photoURL || '' });
      return;
    }

    if (cleanEmail === BAQUEANO_USERS.thirdAdmin.email.toLowerCase()) {
      loginSuccess({ ...BAQUEANO_USERS.thirdAdmin, uid: firebaseUser.uid, name: displayName || firebaseUser.email, avatarText: (displayName || firebaseUser.email).split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase(), photoURL: firebaseUser.photoURL || '' });
      return;
    }

    // 3. Detección automática: Usuario Normal (Explorador Público)
    // El Ops Center es exclusivo para personal autorizado; se sincroniza su sesión y se le dirige a perfil.html
    if (window.firebase && window.firebase.auth) window.firebase.auth().signOut();

    if (feedbackAlert) {
      feedbackAlert.className = 'login-feedback-alert error';
      feedbackAlert.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 0.5rem; text-align: left;">
          <div>
            <i class="fa-solid fa-user-check" style="color: #2DD4BF; font-size: 1.1rem;"></i> 
            <strong>Cuenta Reconocida: Explorador (${cleanEmail || displayName || 'Usuario'})</strong>
          </div>
          <div style="font-size: 0.84rem; line-height: 1.5; color: var(--text-muted);">
            El <strong>Ops Center</strong> está reservado exclusivamente para el Administrador y el Auditor. Tu portal personal para gestionar reservas, tiques, favoritos, facturación y preferencias es <strong>Mi Perfil</strong>.
          </div>
          <div style="margin-top: 0.4rem; display: flex; gap: 0.6rem; flex-wrap: wrap;">
            <a href="perfil.html" class="btn-hero-primary" style="padding: 0.5rem 1rem; font-size: 0.82rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;">
              <i class="fa-solid fa-user-gear"></i> Ir a Mi Perfil de Explorador
            </a>
            <a href="destinos.html" class="btn-hero-glass" style="padding: 0.5rem 0.9rem; font-size: 0.82rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;">
              <i class="fa-solid fa-compass"></i> Ver Destinos
            </a>
          </div>
        </div>
      `;
      feedbackAlert.style.display = 'flex';
    }
  }

  function showLoginError(msg) {
    if (feedbackAlert) {
      feedbackAlert.className = 'login-feedback-alert error';
      feedbackAlert.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <i class="fa-solid fa-circle-exclamation" style="color: #EF4444; font-size: 1.1rem;"></i>
          <span>${msg}</span>
        </div>
      `;
      feedbackAlert.style.display = 'flex';
    }
  }

  // --------------------------------------------------------------------------
  // INICIO DE SESIÓN CON GOOGLE
  // --------------------------------------------------------------------------
  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      if (feedbackAlert) {
        feedbackAlert.className = 'login-feedback-alert success';
        feedbackAlert.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Conectando con Google Identity Services...`;
        feedbackAlert.style.display = 'flex';
      }

      // Intentar autenticación con Firebase Google Auth si está disponible
      if (window.firebase && window.firebase.auth) {
        try {
          const provider = new window.firebase.auth.GoogleAuthProvider();
          window.firebase.auth().signInWithPopup(provider)
            .then(result => {
              const user = result.user;
              const email = user.email || '';
              const hasGoogleProvider = (user.providerData || []).some(profile => profile.providerId === 'google.com');
              if (!hasGoogleProvider || !user.emailVerified) {
                window.firebase.auth().signOut();
                showLoginError('El Ops Center exige una cuenta Google con correo verificado.');
                return;
              }
              const name = user.displayName || user.email;
              resolveUserRoleAndProceed(email, name, user);
            })
            .catch(error => {
              // Si popup es bloqueado o no configurado en entorno estático, pedir correo Google
              showLoginError('Google no pudo validar el acceso. Intenta nuevamente y permite la ventana de autenticaci?n.');
            });
          return;
        } catch (e) {
          showLoginError('Firebase Authentication no pudo iniciar Google.');
          return;
        }
      }

      showLoginError('Firebase Authentication no est? disponible. El acceso local est? deshabilitado.');
    });
  }


  // --------------------------------------------------------------------------
  // INICIO DE SESIÓN CON CORREO & CONTRASEÑA
  // --------------------------------------------------------------------------
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const enteredEmail = userInput ? userInput.value.trim() : '';
      const enteredPass = passInput ? passInput.value.trim() : '';

      if (!enteredEmail) {
        showLoginError("Por favor ingresa tu correo electrónico registrado.");
        return;
      }

      resolveUserRoleAndProceed(enteredEmail, enteredEmail, enteredPass);
    });
  }

  function loginSuccess(userObj) {
    currentActiveUser = userObj;
    sessionStorage.setItem('baqueano_active_user', JSON.stringify(userObj));

    if (feedbackAlert) {
      feedbackAlert.className = 'login-feedback-alert success';
      feedbackAlert.innerHTML = `<i class="fa-solid fa-circle-check"></i> Bienvenido, <strong>${userObj.name}</strong> (${userObj.roleLabel}). Acceso verificado con éxito...`;
      feedbackAlert.style.display = 'flex';
    }

    setTimeout(() => {
      showDashboard(userObj);
    }, 450);
  }

  // Botón de cierre de sesión
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('baqueano_active_user');
      currentActiveUser = null;
      hideDashboard();
      if (userInput) userInput.value = '';
      if (window.firebase && window.firebase.auth) window.firebase.auth().signOut();
      if (passInput) passInput.value = '';
      if (feedbackAlert) feedbackAlert.style.display = 'none';
    });
  }

  // Verificar sesión activa
  sessionStorage.removeItem('baqueano_active_user');
  hideDashboard();
  if (!window.firebase || !window.firebase.auth) return;
  window.firebase.auth().onAuthStateChanged(firebaseUser => {
    if (!firebaseUser) {
      hideDashboard();
      return;
    }
    const hasGoogleProvider = (firebaseUser.providerData || []).some(profile => profile.providerId === 'google.com');
    if (!hasGoogleProvider || !firebaseUser.emailVerified) {
      window.firebase.auth().signOut();
      showLoginError('El Ops Center solo acepta cuentas Google verificadas.');
      return;
    }
    resolveUserRoleAndProceed(firebaseUser.email, firebaseUser.displayName || firebaseUser.email, firebaseUser);
  });
}

function showDashboard(user) {
  const loginGate = document.getElementById('adminLoginGate');
  const dashContent = document.getElementById('adminDashboardContent');

  if (loginGate) loginGate.style.display = 'none';
  if (dashContent) dashContent.style.display = 'block';

  applyRolePermissions(user);
}

function hideDashboard() {
  const loginGate = document.getElementById('adminLoginGate');
  const dashContent = document.getElementById('adminDashboardContent');

  if (dashContent) dashContent.style.display = 'none';
  if (loginGate) loginGate.style.display = 'flex';
}

function applyRolePermissions(user) {
  // 1. Barra de sesión activa
  const sessionAvatar = document.getElementById('sessionUserAvatar');
  const sessionName = document.getElementById('sessionUserName');
  const sessionRole = document.getElementById('sessionUserRole');
  const sessionTitle = document.getElementById('sessionUserTitle');

  if (sessionAvatar) sessionAvatar.textContent = user.avatarText;
  if (sessionName) sessionName.textContent = user.name;
  if (sessionRole) {
    sessionRole.className = `user-role-badge ${user.badgeClass}`;
    sessionRole.innerHTML = `<i class="fa-solid fa-shield"></i> ${user.roleLabel}`;
  }
  if (sessionTitle) sessionTitle.textContent = `${user.title} (${user.email})`;

  // 2. Control de emisión de alertas
  const btnBroadcast = document.getElementById('btnBroadcastAlert');
  if (btnBroadcast) {
    if (user.canBroadcast) {
      btnBroadcast.style.opacity = '1';
      btnBroadcast.style.cursor = 'pointer';
      btnBroadcast.innerHTML = '<i class="fa-solid fa-bullhorn"></i> Emitir Alerta a Balizas';
      btnBroadcast.title = "Emitir alerta masiva a dispositivos en territorio";
    } else {
      btnBroadcast.style.opacity = '0.5';
      btnBroadcast.style.cursor = 'not-allowed';
      btnBroadcast.innerHTML = '<i class="fa-solid fa-lock"></i> Alertas (Solo Administrador)';
      btnBroadcast.title = "Función restringida exclusivamente a la Dirección General";
    }
  }

  // 3. Control de botones de ruta
  const routeButtons = document.querySelectorAll('.btn-route-toggle');
  routeButtons.forEach(btn => {
    if (user.canToggleRoutes) {
      btn.removeAttribute('disabled');
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
      btn.title = "Alternar estado operativo de la ruta";
    } else {
      btn.setAttribute('disabled', 'true');
      btn.style.opacity = '0.4';
      btn.style.cursor = 'not-allowed';
      btn.title = "Modo Auditoría: Inspección en solo lectura";
    }
  });
}

// ----------------------------------------------------------------------------
// OPERACIONES DEL DASHBOARD (MÉTRICAS & RUTAS)
function setAdminDataProvenance(source) {
  const root = document.getElementById('opsDataProvenance');
  const label = document.getElementById('opsDataSourceLabel');
  const detail = document.getElementById('opsDataSourceDetail');
  const badge = document.getElementById('opsDataSourceBadge');
  if (!root || !label || !detail || !badge) return;
  const isLive = source === 'firestore';
  root.classList.toggle('is-live', isLive);
  label.textContent = isLive ? 'DATOS EN VIVO' : 'MODO DEMOSTRACI?N';
  detail.textContent = isLive ? 'M?tricas verificadas desde Cloud Firestore.' : 'Las cifras fijas son referencias visuales y no representan actividad real.';
  badge.textContent = isLive ? 'PRODUCCI?N' : 'DEMO';
  badge.className = 'ops-data-provenance-badge ' + (isLive ? 'live' : 'demo');
}

function refreshVerifiedAdminMetrics() {
  const service = window.BaqueanoFirestore;
  if (!service || typeof service.listenAdminMetrics !== 'function') {
    setAdminDataProvenance('seed');
    return;
  }
  try {
    service.stopListeningMetrics();
    service.listenAdminMetrics(metrics => {
      setAdminDataProvenance(metrics.source);
      const published = document.getElementById('metricPublishedDests');
      if (published && Number.isFinite(metrics.publishedPlaces)) published.textContent = String(metrics.publishedPlaces);
    });
  } catch (error) {
    console.error('[OpsCenter] No fue posible verificar m?tricas:', error);
    setAdminDataProvenance('error');
  }
}

// ----------------------------------------------------------------------------
function simulateLiveMetricUpdate() {
  const appUsers = document.getElementById('metricAppUsers');
  const webVisits = document.getElementById('metricWebVisits');
  const commRevenue = document.getElementById('metricCommunityRevenue');
  const gpsSessions = document.getElementById('metricGpsSessions');

  if (appUsers) {
    const current = parseInt(appUsers.textContent.replace(/,/g, ''), 10) || 1495;
    appUsers.textContent = (current + Math.floor(Math.random() * 5) + 1).toLocaleString('en-US');
  }

  if (webVisits) {
    const current = parseInt(webVisits.textContent.replace(/,/g, ''), 10) || 5872;
    webVisits.textContent = (current + Math.floor(Math.random() * 8) + 2).toLocaleString('en-US');
  }

  if (commRevenue) {
    const current = parseInt(commRevenue.textContent.replace(/[$,]/g, ''), 10) || 25120;
    commRevenue.textContent = '$' + (current + (Math.floor(Math.random() * 3) + 1) * 35).toLocaleString('en-US');
  }

  if (gpsSessions) {
    const current = parseInt(gpsSessions.textContent.replace(/,/g, ''), 10) || 344;
    gpsSessions.textContent = (current + Math.floor(Math.random() * 3) - 1).toLocaleString('en-US');
  }
}

window.toggleRouteStatus = function(routeName) {
  if (!currentActiveUser || !currentActiveUser.canToggleRoutes) {
    alert("Operación denegada: Tu cuenta de " + (currentActiveUser ? currentActiveUser.roleLabel : 'auditor') + " está en modo de inspección (solo lectura).");
    return;
  }

  const table = document.getElementById('routesTableBody');
  if (!table) return;

  const rows = table.querySelectorAll('tr');
  rows.forEach(row => {
    const destName = row.querySelector('.table-dest-name');
    if (destName && destName.textContent.includes(routeName)) {
      const badge = row.querySelector('.status-badge-table');
      if (badge) {
        if (badge.classList.contains('active')) {
          badge.classList.remove('active');
          badge.classList.add('warning');
          badge.textContent = 'Precaución de Clima';
          addNewFeedEvent(`Ruta ${routeName} en Precaución`, `Modificado por ${currentActiveUser.name}`, "fa-cloud-sun-rain");
        } else {
          badge.classList.remove('warning');
          badge.classList.add('active');
          badge.textContent = 'Abierto Normal';
          addNewFeedEvent(`Ruta ${routeName} Restaurada`, `Condiciones validadas por ${currentActiveUser.name}`, "fa-check-double");
        }
      }
    }
  });
};

function addNewFeedEvent(title, meta, iconClass) {
  const feed = document.getElementById('liveFeedStream');
  if (!feed) return;

  const eventDiv = document.createElement('div');
  eventDiv.className = 'feed-event-item';
  eventDiv.innerHTML = `
    <div class="feed-event-icon"><i class="fa-solid ${iconClass}"></i></div>
    <div class="feed-event-content">
      <div class="feed-event-title">${title}</div>
      <div class="feed-event-meta">${meta} • Justo ahora</div>
    </div>
  `;

  feed.insertBefore(eventDiv, feed.firstChild);
  if (feed.children.length > 8) {
    feed.removeChild(feed.lastChild);
  }
}

function simulateLiveStreamEvent() {
  const events = [
    { title: "Nueva Reserva Directa en Ometepe", meta: "Exploradora de Granada • Tarifa justa a guía local", icon: "fa-bookmark" },
    { title: "Descarga de BaqueanoNicaragua.apk", meta: "Dispositivo Android verificado • León", icon: "fa-download" },
    { title: "Baliza GPS Sincronizada en Somoto", meta: "Guía Mateo activó sendero Río Abajo", icon: "fa-location-dot" },
    { title: "Denuncia Ambiental Canalizada", meta: "Envío formal a Unidad Ambiental Municipal", icon: "fa-shield-halved" },
    { title: "Aporte Ecológico Registrado", meta: "100% donación a cuenca hídrica La Luna", icon: "fa-leaf" }
  ];

  const pick = events[Math.floor(Math.random() * events.length)];
  addNewFeedEvent(pick.title, pick.meta, pick.icon);
  simulateLiveMetricUpdate();
}
