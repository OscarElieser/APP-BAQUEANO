// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PANEL ADMINISTRATIVO & CONTROL DE ROLES (admin-ops.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una pasarela de autenticación segura y control de acceso basado en
//   roles (RBAC) para el Centro de Operaciones (Baqueano Ops Center):
//   * 👑 ADMINISTRADOR: Control total de rutas, alertas a balizas, finanzas y telemetría.
//   * 🔍 AUDITOR: Inspección de cumplimiento legal, fiscal (Ley 306) y ambiental (Solo Lectura).
//   * 🏕️ USUARIO NORMAL (Operador Comunitario): Monitoreo de rutas y balizas en territorio.
// - Proteger información sensible del ecosistema campesino y garantizar trazabilidad.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Gestión de estado de sesión mediante sessionStorage (baqueano_active_user).
// - Matriz de credenciales y roles predefinidos con selector a 1 toque para demostración.
// - Modificación dinámica del DOM aplicando restricciones de permisos según el rol activo.
// - Simulación estocástica de métricas en tiempo real y terminal de eventos.
//
// 📦 3. QUÉ (WHAT / FUNCIONES EXPUESTAS):
// - initAdminAuth(): Inicializa la pasarela de login, selector de roles y cierre de sesión.
// - initAdminOperations(): Vincula botones de refresco y emisión de alertas a sendero.
// - toggleRouteStatus(routeName): Alterna estado operativo de senderos según permisos.
// - applyRolePermissions(user): Configura la interfaz según el rol asignado.
// ============================================================================

// Matriz Oficial de Usuarios y Roles (RBAC)
const BAQUEANO_USERS = {
  admin: {
    username: "admin@baqueano.ni",
    pass: "admin123",
    name: "Lic. Valeria Morales",
    role: "admin",
    roleLabel: "Administrador General",
    title: "Directora de Operaciones & Soberanía Territorial",
    avatarText: "VM",
    badgeClass: "admin",
    canBroadcast: true,
    canToggleRoutes: true,
    canViewFinances: true
  },
  auditor: {
    username: "auditor@baqueano.ni",
    pass: "auditor123",
    name: "Ing. Carlos Rivas",
    role: "auditor",
    roleLabel: "Auditor de Cumplimiento",
    title: "Auditoría Fiscal (Ley 306) & Custodia Ambiental",
    avatarText: "CR",
    badgeClass: "auditor",
    canBroadcast: false,
    canToggleRoutes: false,
    canViewFinances: true
  },
  user: {
    username: "operador@baqueano.ni",
    pass: "usuario123",
    name: "Mateo Sonís",
    role: "user",
    roleLabel: "Usuario Normal",
    title: "Operador Comunitario • Guías Cañón de Somoto",
    avatarText: "MS",
    badgeClass: "user",
    canBroadcast: false,
    canToggleRoutes: true,
    canViewFinances: false
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
        alert("Acción denegada: Tu rol de " + (currentActiveUser ? currentActiveUser.roleLabel : 'invitado') + " no tiene permisos para emitir alertas masivas a los dispositivos en sendero.");
        return;
      }

      const alertMsg = prompt("Ingresa el aviso preventivo para los guías y exploradores en territorio:");
      if (alertMsg && alertMsg.trim()) {
        addNewFeedEvent("Alerta Emitida por Administración", alertMsg.trim(), "fa-triangle-exclamation");
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
// CONTROL DE AUTENTICACIÓN & ROLES
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

  // Selector de roles a 1 toque (rellena credenciales para demo expedita)
  if (roleButtons.length) {
    roleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        roleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const roleKey = btn.getAttribute('data-role');
        const demoUser = BAQUEANO_USERS[roleKey];
        if (demoUser && userInput && passInput) {
          userInput.value = demoUser.username;
          passInput.value = demoUser.pass;
          if (feedbackAlert) feedbackAlert.style.display = 'none';
        }
      });
    });
  }

  // Formulario de inicio de sesión
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const userVal = userInput.value.trim().toLowerCase();
      const passVal = passInput.value.trim();

      let matchedUser = null;
      for (const key in BAQUEANO_USERS) {
        const u = BAQUEANO_USERS[key];
        if ((u.username.toLowerCase() === userVal || key === userVal) && u.pass === passVal) {
          matchedUser = u;
          break;
        }
      }

      if (matchedUser) {
        currentActiveUser = matchedUser;
        sessionStorage.setItem('baqueano_active_user', JSON.stringify(matchedUser));

        if (feedbackAlert) {
          feedbackAlert.className = 'login-feedback-alert success';
          feedbackAlert.innerHTML = `<i class="fa-solid fa-circle-check"></i> Acceso concedido como <strong>${matchedUser.roleLabel}</strong>. Inicializando centro de mando...`;
          feedbackAlert.style.display = 'flex';
        }

        setTimeout(() => {
          showDashboard(matchedUser);
        }, 600);
      } else {
        if (feedbackAlert) {
          feedbackAlert.className = 'login-feedback-alert error';
          feedbackAlert.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> Credenciales no reconocidas. Usa los botones superiores para seleccionar un rol de prueba.`;
          feedbackAlert.style.display = 'flex';
        }
      }
    });
  }

  // Botón de cierre de sesión
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('baqueano_active_user');
      currentActiveUser = null;
      hideDashboard();
    });
  }

  // Verificar sesión persistente
  const savedUserJson = sessionStorage.getItem('baqueano_active_user');
  if (savedUserJson) {
    try {
      const saved = JSON.parse(savedUserJson);
      currentActiveUser = saved;
      showDashboard(saved);
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
  // 1. Actualizar barra de sesión activa
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
  if (sessionTitle) sessionTitle.textContent = user.title;

  // 2. Control de emisión de alertas
  const btnBroadcast = document.getElementById('btnBroadcastAlert');
  if (btnBroadcast) {
    if (user.canBroadcast) {
      btnBroadcast.style.opacity = '1';
      btnBroadcast.style.pointerEvents = 'auto';
      btnBroadcast.innerHTML = '<i class="fa-solid fa-bullhorn"></i> Emitir Alerta a Balizas';
    } else {
      btnBroadcast.style.opacity = '0.4';
      btnBroadcast.style.pointerEvents = 'auto';
      btnBroadcast.innerHTML = '<i class="fa-solid fa-lock"></i> Alertas (Solo Administrador)';
    }
  }

  // 3. Control de visibilidad de ingresos financieros
  const revenueCard = document.getElementById('metricCommunityRevenue');
  if (revenueCard) {
    if (user.canViewFinances) {
      revenueCard.textContent = '$25,120';
    } else {
      revenueCard.textContent = '$ *** (Privado)';
      revenueCard.style.color = 'var(--text-muted)';
    }
  }

  // 4. Control de acciones de ruta
  const routeButtons = document.querySelectorAll('.btn-route-toggle');
  routeButtons.forEach(btn => {
    if (user.canToggleRoutes) {
      btn.removeAttribute('disabled');
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
    } else {
      btn.setAttribute('disabled', 'true');
      btn.style.opacity = '0.45';
      btn.style.cursor = 'not-allowed';
      btn.title = "Modo Solo Lectura: Requiere rol Administrador o Guía Operador";
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

  if (commRevenue && (!currentActiveUser || currentActiveUser.canViewFinances)) {
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
    alert("Operación denegada: Tu rol actual de " + (currentActiveUser ? currentActiveUser.roleLabel : 'auditor') + " está en modo de solo lectura.");
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
    { title: "Descarga de BaqueanoNicaragua.apk", meta: "Dispositivo Android • Managua", icon: "fa-download" },
    { title: "Baliza GPS Sincronizada en Somoto", meta: "Guía Mateo activó sendero Río Abajo", icon: "fa-location-dot" },
    { title: "Denuncia Ambiental Canalizada", meta: "Envío formal a Unidad Ambiental Municipal", icon: "fa-shield-halved" },
    { title: "Aporte Ecológico Registrado", meta: "100% donación a cuenca hídrica La Luna", icon: "fa-leaf" }
  ];

  const pick = events[Math.floor(Math.random() * events.length)];
  addNewFeedEvent(pick.title, pick.meta, pick.icon);
  simulateLiveMetricUpdate();
}
