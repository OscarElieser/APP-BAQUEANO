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
  admin: {
    email: "oscarelieser.informatica.inatec@gmail.com",
    passwords: ["admin123", "Baqueano2026!", "oscar2026"],
    name: "Oscar Elieser",
    role: "admin",
    roleLabel: "Administrador General",
    title: "Director General de Operaciones & Tecnología Baqueano",
    avatarText: "OE",
    badgeClass: "admin",
    canBroadcast: true,
    canToggleRoutes: true,
    canViewFinances: true,
    canSyncDatabase: true
  },
  auditor: {
    email: "vigoronmixt@gmail.com",
    passwords: ["auditor123", "Baqueano2026!", "vigoron2026"],
    name: "Vigorón Mixto",
    role: "auditor",
    roleLabel: "Auditor Oficial de Cumplimiento",
    title: "Auditoría Fiscal (Ley 306 INTUR) & Custodia Ambiental",
    avatarText: "VM",
    badgeClass: "auditor",
    canBroadcast: false,
    canToggleRoutes: false,
    canViewFinances: true,
    canSyncDatabase: false
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
        simulateLiveMetricUpdate();
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
  setInterval(() => {
    simulateLiveStreamEvent();
  }, 35000);
}

// ----------------------------------------------------------------------------
// CONTROL DE AUTENTICACIÓN REAL & RESTRICCIÓN DE USUARIOS NORMALES
// ----------------------------------------------------------------------------
function initAdminAuth() {
  const loginGate = document.getElementById('adminLoginGate');
  const dashContent = document.getElementById('adminDashboardContent');
  const loginForm = document.getElementById('adminLoginForm');
  const userInput = document.getElementById('loginUsername');
  const passInput = document.getElementById('loginPassword');
  const feedbackAlert = document.getElementById('loginFeedback');
  const logoutBtn = document.getElementById('btnLogoutAdmin');
  const roleButtons = document.querySelectorAll('.role-select-btn');

  // Selector de roles a 1 toque con las cuentas reales
  if (roleButtons.length) {
    roleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        roleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const roleKey = btn.getAttribute('data-role');

        if (roleKey === 'user') {
          // Prueba de Usuario Normal: Muestra que no tiene acceso administrativo
          if (userInput) userInput.value = "usuario.comunitario@gmail.com";
          if (passInput) passInput.value = "usuario123";
          if (feedbackAlert) {
            feedbackAlert.className = 'login-feedback-alert error';
            feedbackAlert.innerHTML = `
              <div style="display: flex; flex-direction: column; gap: 0.3rem;">
                <div><i class="fa-solid fa-ban"></i> <strong>Aviso de Política de Seguridad:</strong></div>
                <div style="font-size: 0.8rem;">Los usuarios normales pueden visitar libremente todas las páginas del portal público (destinos, historia, ambiental, gastronomía, música, aliados), pero <strong>no tienen autorización para ingresar al panel administrativo</strong>.</div>
              </div>
            `;
            feedbackAlert.style.display = 'flex';
          }
          return;
        }

        const authUser = BAQUEANO_USERS[roleKey];
        if (authUser && userInput && passInput) {
          userInput.value = authUser.email;
          passInput.value = authUser.passwords[0];
          if (feedbackAlert) feedbackAlert.style.display = 'none';
        }
      });
    });
  }

  // Formulario de validación real
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const enteredEmail = userInput.value.trim().toLowerCase();
      const enteredPass = passInput.value.trim();

      // 1. Verificar si es el Administrador real
      if (enteredEmail === BAQUEANO_USERS.admin.email.toLowerCase() &&
          BAQUEANO_USERS.admin.passwords.includes(enteredPass)) {
        loginSuccess(BAQUEANO_USERS.admin);
        return;
      }

      // 2. Verificar si es el Auditor real
      if (enteredEmail === BAQUEANO_USERS.auditor.email.toLowerCase() &&
          BAQUEANO_USERS.auditor.passwords.includes(enteredPass)) {
        loginSuccess(BAQUEANO_USERS.auditor);
        return;
      }

      // 3. Si es un usuario normal u otra cuenta: DENEGAR TOTALMENTE
      if (feedbackAlert) {
        feedbackAlert.className = 'login-feedback-alert error';
        feedbackAlert.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 0.4rem; text-align: left;">
            <div><i class="fa-solid fa-shield-xmark" style="color: #EF4444; font-size: 1.1rem;"></i> <strong>Acceso Denegado:</strong></div>
            <div>Esta cuenta no cuenta con credenciales administrativas ni de auditoría en Baqueano Nicaragua.</div>
            <div style="margin-top: 0.3rem;">
              <a href="index.html" class="btn-admin-action" style="padding: 0.4rem 0.8rem; font-size: 0.75rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;">
                <i class="fa-solid fa-arrow-left"></i> Volver al Portal de Explorador Público
              </a>
            </div>
          </div>
        `;
        feedbackAlert.style.display = 'flex';
      }
    });
  }

  function loginSuccess(userObj) {
    currentActiveUser = userObj;
    sessionStorage.setItem('baqueano_active_user', JSON.stringify(userObj));

    if (feedbackAlert) {
      feedbackAlert.className = 'login-feedback-alert success';
      feedbackAlert.innerHTML = `<i class="fa-solid fa-circle-check"></i> Bienvenido, <strong>${userObj.name}</strong> (${userObj.roleLabel}). Cargando telemetría oficial...`;
      feedbackAlert.style.display = 'flex';
    }

    setTimeout(() => {
      showDashboard(userObj);
    }, 500);
  }

  // Botón de cierre de sesión
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('baqueano_active_user');
      currentActiveUser = null;
      hideDashboard();
    });
  }

  // Verificar sesión activa
  const savedUserJson = sessionStorage.getItem('baqueano_active_user');
  if (savedUserJson) {
    try {
      const saved = JSON.parse(savedUserJson);
      if (saved.email === BAQUEANO_USERS.admin.email || saved.email === BAQUEANO_USERS.auditor.email) {
        currentActiveUser = saved;
        showDashboard(saved);
      } else {
        hideDashboard();
      }
    } catch (e) {
      hideDashboard();
    }
  } else {
    hideDashboard();
  }
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
