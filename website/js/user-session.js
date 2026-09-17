// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — GESTIÓN DE SESIÓN, ROLES Y PERFIL DE USUARIO (user-session.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia integral de identidad y personalización para el explorador
//   turístico en Baqueano Nicaragua, separando de forma estricta:
//   * 👑 ADMINISTRADOR & AUDITOR: Acceso al Centro de Mando y Operaciones ("Ops Center").
//   * 👤 EXPLORADOR / USUARIO REGISTRADO: Acceso a su portal personal ("Perfil")
//     para gestionar reservas, favoritos, facturación, seguridad y preferencias.
// - Respetar la privacidad y soberanía de los datos turísticos sin rastreadores invasivos.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Persistencia híbrida defensiva (localStorage con fallback a sessionStorage y memoria).
// - Soporte RBAC: Reconocimiento automático de roles mediante correo electrónico.
// - Sincronización en tiempo real del menú de navegación (Navbar) en todas las páginas web.
// - Gestión reactiva de viajes: Filtro de reservas (Futuras, Pasadas, Canceladas),
//   generación dinámica de tiquetes de viaje con QR satelital, sincronización de lista de
//   deseos con el motor de favoritos de destinos.html y emisión de recibos Ley 306 INTUR.
//
// 📦 3. QUÉ (WHAT / ENTIDADES EXPUESTAS):
// - BaqueanoSession: Objeto global con métodos de login, registro, logout y actualización.
// - initUserSessionNavbar(): Actualizador dinámico del enlace de navegación (Perfil vs Ops Center).
// - openAuthModal(), closeAuthModal(): Controladores de la ventana modal de autenticación.
// - generateTicketModal(), generateInvoiceModal(): Renderizadores de tiquetes y facturas.
// ============================================================================

(function(window) {
  'use strict';

  // Clave de almacenamiento local
  const STORAGE_KEY = 'baqueano_user_session_v1';
  const FAVS_STORAGE_KEY = 'baqueano_favs';

  // Cuentas de Alta Jerarquía Operativa (Admin & Auditor)
  const PRIVILEGED_ACCOUNTS = {
    'oscarelieser.informatica.inatec@gmail.com': {
      name: 'Oscar Elieser',
      role: 'admin', roleLabel: 'Administrador General', navTitle: 'Ops Center',
      navDesc: 'Comando & Gestión', navBadge: '● Admin', targetUrl: 'admin.html', isPrivileged: true
    },
    'byoscarelieser@gmail.com': {
      name: 'Oscar Elieser',
      role: 'admin', roleLabel: 'Administrador General', navTitle: 'Ops Center',
      navDesc: 'Comando & Gestión', navBadge: '● Admin', targetUrl: 'admin.html', isPrivileged: true
    },
    'vigoronmixt@gmail.com': {
      name: 'Auditor Baqueano',
      role: 'admin', roleLabel: 'Administrador General', navTitle: 'Ops Center',
      navDesc: 'Comando & Gestión', navBadge: '● Admin', targetUrl: 'admin.html', isPrivileged: true
    }
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[character]);
  }

  function safeAvatarUrl(value) {
    try {
      const parsed = new URL(String(value), window.location.origin);
      return parsed.protocol === 'https:' || parsed.origin === window.location.origin ? parsed.href : '';
    } catch (_) {
      return '';
    }
  }
  /**
   * Carga la sesión del usuario desde el almacenamiento local.
   */
  function loadSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (!session || !session.firebaseUid || !session.isLoggedIn) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      // Auto-corregir nombres residuales de placeholder o texto de invitado
      if (!session.name || session.name === 'Inicia sesión para ver tu perfil' || session.name === 'Invitado') {
        const emailLower = (session.email || '').toLowerCase();
        const priv = PRIVILEGED_ACCOUNTS[emailLower];
        if (priv && priv.name) {
          session.name = priv.name;
        } else if (session.email) {
          const prefix = session.email.split('@')[0].replace(/[._-]+/g, ' ');
          session.name = prefix.charAt(0).toUpperCase() + prefix.slice(1);
        } else {
          session.name = 'Explorador';
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      }
      return session;
    } catch (error) {
      console.warn('[Baqueano Session] Sesión local inválida:', error);
      return null;
    }
  }

  /**
   * Guarda los datos de sesión en almacenamiento local.
   */
  function saveSession(userObj) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userObj));
    } catch (e) {
      console.warn('[Baqueano Session] Error guardando localStorage:', e);
    }
  }

  /**
   * Determina las propiedades de rol para la navegación web.
   */
  function getRoleNavMetadata(user) {
    if (!user || !user.isLoggedIn) {
      return {
        isPrivileged: false,
        role: 'guest',
        navTitle: 'Iniciar sesión',
        navSublabel: 'Acceso seguro',
        targetUrl: 'perfil.html',
        badge: null
      };
    }

    const emailKey = (user.email || '').trim().toLowerCase();
    if (PRIVILEGED_ACCOUNTS[emailKey]) {
      const priv = PRIVILEGED_ACCOUNTS[emailKey];
      return {
        isPrivileged: true,
        role: priv.role,
        navTitle: priv.navTitle,
        navSublabel: priv.navDesc,
        targetUrl: priv.targetUrl,
        badge: priv.navBadge
      };
    }

    // Usuario Explorador Registrado
    return {
      isPrivileged: false,
      role: 'explorer',
      navTitle: 'Perfil',
      navSublabel: user.name ? user.name.split(' ')[0] : 'Mi Cuenta',
      targetUrl: 'perfil.html',
      badge: '● Activo'
    };
  }

  /**
   * Actualiza los enlaces del Navbar en la página actual.
   */
  function updateNavbar() {
    const user = loadSession();
    const navMeta = getRoleNavMetadata(user);

    // 1. Localizar el enlace de Ops Center / Perfil en la barra de navegación
    const navLinksMenu = document.getElementById('navLinksMenu');
    if (!navLinksMenu) return;

    // Buscar el enlace existente por targetUrl o clase
    let roleLink = navLinksMenu.querySelector('a[href="admin.html"], a[href="perfil.html"], .nav-link-user-role');

    if (roleLink) {
      roleLink.href = navMeta.targetUrl;
      roleLink.className = roleLink.className.replace(/\bactive\b/, '');

      const currentPath = window.location.pathname.toLowerCase();
      if (currentPath.endsWith(navMeta.targetUrl.toLowerCase())) {
        roleLink.classList.add('active');
      }

      // Icono representativo
      const iconClass = navMeta.isPrivileged ? 'fa-solid fa-satellite-dish' : 'fa-solid fa-user-gear';
      const badgeHtml = navMeta.badge ? `<span class="nav-item-badge ${navMeta.isPrivileged ? 'live' : ''}">${navMeta.badge}</span>` : '';

      roleLink.innerHTML = `
        <span class="nav-item-content">
          <span class="nav-icon-box"><i class="${iconClass} nav-icon"></i></span>
          <span class="nav-text-group">
            <span class="nav-label">${navMeta.navTitle}</span>
            <span class="nav-sublabel">${navMeta.navSublabel}</span>
          </span>
        </span>
        <span class="nav-right-wrap">
          ${badgeHtml}
          <i class="fa-solid fa-chevron-right nav-arrow"></i>
        </span>
      `;
    }

    // 2. Sincronizar el botón de identidad situado a la derecha del encabezado.
    document.querySelectorAll('.nav-profile-btn').forEach((profileButton) => {
      const isAuthenticated = Boolean(user && user.isLoggedIn && user.firebaseUid);
      profileButton.href = isAuthenticated ? 'perfil.html' : 'perfil.html?auth=1';
      profileButton.title = isAuthenticated ? 'Abrir mi perfil' : 'Iniciar sesión';
      profileButton.setAttribute('aria-label', profileButton.title);

      if (!isAuthenticated) {
        profileButton.innerHTML = `
          <span class="nav-profile-avatar" aria-hidden="true"><i class="fa-solid fa-right-to-bracket"></i></span>
          <span class="nav-profile-info"><span class="nav-profile-name">Iniciar sesión</span></span>
        `;
        return;
      }

      const safeName = String(user.name || user.email || 'Usuario');
      const firstName = escapeHtml(safeName.trim().split(/\s+/)[0]);
      const avatarUrl = safeAvatarUrl(user.avatar);
      const avatarContent = avatarUrl
        ? `<img src="${avatarUrl}" alt="" class="nav-profile-photo">`
        : '<i class="fa-solid fa-user"></i>';
      profileButton.innerHTML = `
        <span class="nav-profile-avatar" aria-hidden="true">${avatarContent}</span>
        <span class="nav-profile-info">
          <span class="nav-profile-name">Mi Perfil</span>
          <span class="nav-profile-role">${firstName}</span>
        </span>
      `;
    });

    // 3. Actualizar también el enlace correspondiente en el footer
    const footerRoleLink = document.querySelector('.footer-link-list a[href="admin.html"], .footer-link-list a[href="perfil.html"]');
    if (footerRoleLink) {
      footerRoleLink.href = navMeta.targetUrl;
      footerRoleLink.textContent = navMeta.isPrivileged ? 'Baqueano Ops Center' : 'Mi Perfil de Explorador';
    }
  }

  // Configuración oficial de Firebase Web para el Ecosistema Baqueano Nicaragua
  const BAQUEANO_FIREBASE_CONFIG = {
    apiKey: 'AIzaSyDgdMOJ19RjsgY79LXDIeWlZ48uW5Oo6GE',
    authDomain: 'app-baqueano.firebaseapp.com',
    databaseURL: 'https://app-baqueano-default-rtdb.firebaseio.com/',
    projectId: 'app-baqueano',
    storageBucket: 'app-baqueano.firebasestorage.app',
    messagingSenderId: '578585227888',
    appId: '1:578585227888:web:3e5c9baqueano'
  };

  /**
   * Inicializa Firebase de forma segura y defensiva si está presente en el entorno.
   */
  function ensureFirebaseInitialized() {
    try {
      if (typeof window.firebase !== 'undefined') {
        if (!window.firebase.apps || window.firebase.apps.length === 0) {
          window.firebase.initializeApp(BAQUEANO_FIREBASE_CONFIG);
        }
        return true;
      }
    } catch (err) {
      console.warn('[Baqueano Session] Inicialización de Firebase omitida o diferida:', err);
    }
    return false;
  }

  // ==========================================================================
  // API PÚBLICA DE SESIÓN (BaqueanoSession)
  // ==========================================================================
  const BaqueanoSession = {
    getUser: function() {
      return loadSession();
    },

    saveUser: function(userObj) {
      saveSession(userObj);
      updateNavbar();
      window.dispatchEvent(new CustomEvent('baqueano_session_updated', { detail: userObj }));
    },

    login: async function(email, password) {
      ensureFirebaseInitialized();
      if (!window.firebase || !window.firebase.auth) {
        throw new Error('El servicio de autenticación no está disponible en este entorno.');
      }
      if (!email || !password) {
        throw new Error('Correo y contraseña son obligatorios.');
      }
      try {
        const credential = await window.firebase.auth().signInWithEmailAndPassword(email.trim(), password);
        return syncFirebaseIdentity(credential.user);
      } catch (error) {
        console.error('[Baqueano Session] Error en inicio de sesión:', error);
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
          throw new Error('Credenciales incorrectas o la cuenta no existe. Si es tu primera vez, pulsa "Crear cuenta".');
        } else if (error.code === 'auth/invalid-email') {
          throw new Error('El formato del correo electrónico no es válido.');
        } else if (error.code === 'auth/too-many-requests') {
          throw new Error('Demasiados intentos fallidos. Espera unos minutos antes de reintentar.');
        }
        throw error;
      }
    },

    register: async function(email, password, displayName) {
      ensureFirebaseInitialized();
      if (!window.firebase || !window.firebase.auth) {
        throw new Error('El servicio de autenticación no está disponible en este entorno.');
      }
      if (!email || !password || !displayName) {
        throw new Error('Nombre, correo y contraseña son obligatorios.');
      }
      try {
        const credential = await window.firebase.auth().createUserWithEmailAndPassword(email.trim(), password);
        if (credential.user && credential.user.updateProfile) {
          await credential.user.updateProfile({ displayName: displayName.trim() });
        }
        try {
          if (credential.user && credential.user.sendEmailVerification) {
            await credential.user.sendEmailVerification();
          }
        } catch (_) {}
        if (credential.user && credential.user.reload) {
          await credential.user.reload();
        }
        return syncFirebaseIdentity(window.firebase.auth().currentUser || credential.user);
      } catch (error) {
        console.error('[Baqueano Session] Error en registro:', error);
        if (error.code === 'auth/email-already-in-use') {
          throw new Error('Este correo ya está registrado. Ingresa tu contraseña para iniciar sesión.');
        } else if (error.code === 'auth/weak-password') {
          throw new Error('La contraseña debe tener al menos 8 caracteres seguros.');
        } else if (error.code === 'auth/invalid-email') {
          throw new Error('El formato del correo electrónico no es válido.');
        }
        throw error;
      }
    },

    loginWithGoogle: async function() {
      ensureFirebaseInitialized();
      if (!window.firebase || !window.firebase.auth) {
        throw new Error('El servicio de Google Authentication no está disponible. Revisa tu conexión a internet.');
      }
      try {
        const provider = new window.firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const credential = await window.firebase.auth().signInWithPopup(provider);
        return syncFirebaseIdentity(credential.user);
      } catch (error) {
        console.error('[Baqueano Session] Error en Google Auth:', error);
        if (error.code === 'auth/popup-closed-by-user') {
          throw new Error('La ventana de Google fue cerrada antes de completar el inicio de sesión.');
        } else if (error.code === 'auth/popup-blocked') {
          throw new Error('El navegador bloqueó la ventana emergente de Google. Por favor permite popups en tu navegador.');
        } else if (error.code === 'auth/unauthorized-domain') {
          throw new Error('El dominio actual (' + (window.location.hostname || 'local') + ') no está en la lista blanca de Firebase Auth. Usa el Acceso Rápido de Prueba o autoriza el dominio en Firebase Console.');
        } else if (error.code === 'auth/operation-not-supported-in-this-environment') {
          throw new Error('La autenticación emergente no está soportada en el protocolo file://. Abre la página mediante un servidor local (http://localhost) o usa el Acceso Rápido.');
        }
        throw error;
      }
    },

    loginAsExplorer: function(name, email) {
      const explorerEmail = (email || 'explorador@baqueano.ni').trim().toLowerCase();
      const privileged = PRIVILEGED_ACCOUNTS[explorerEmail];
      const session = {
        firebaseUid: 'usr_' + Date.now(),
        name: (name || (privileged ? 'Administrador' : 'Explorador Baqueano')).trim(),
        email: explorerEmail,
        phone: '+505 8443-1289',
        avatar: 'assets/images/logo.png',
        role: privileged ? privileged.role : 'explorer',
        roleLabel: privileged ? privileged.roleLabel : 'Explorador',
        memberSince: new Date().toLocaleDateString('es-NI', { month: 'long', year: 'numeric' }),
        emailVerified: true,
        providerIds: ['baqueano.identity'],
        isLoggedIn: true,
        settings: { language: 'es', currency: 'USD' },
        travelPreferences: { pace: 'moderate', terrain: 'montana', diet: 'tipica' },
        bookings: [
          {
            id: 'res-bq-001',
            destinationName: 'Monumento Nacional Cañón de Somoto',
            destinationDepartment: 'Madriz',
            date: '2026-10-15',
            time: '08:00 AM',
            status: 'upcoming',
            statusLabel: 'Confirmada',
            totalUsd: 15,
            totalNio: 550,
            guideName: 'Don José Baqueano (Comunitario)',
            pax: 2
          }
        ],
        billingHistory: [],
        savedPaymentMethods: []
      };
      saveSession(session);
      updateNavbar();
      window.dispatchEvent(new CustomEvent('baqueano_session_updated', { detail: session }));
      return session;
    },

    logout: async function() {
      try {
        if (window.firebase && window.firebase.auth) {
          await window.firebase.auth().signOut();
        }
      } catch (err) {
        console.warn('[Baqueano Session] Aviso en cierre de sesión Firebase:', err);
      }
      localStorage.removeItem(STORAGE_KEY);
      updateNavbar();
      window.dispatchEvent(new CustomEvent('baqueano_session_updated', { detail: null }));
      return null;
    },

    updateProfile: function(updatedFields) {
      let user = loadSession();
      if (!user) return null;
      Object.assign(user, updatedFields);
      this.saveUser(user);
      return user;
    },

    addBooking: function(bookingData) {
      let user = loadSession();
      if (!user) return null;
      if (!user.bookings) user.bookings = [];
      user.bookings.unshift(bookingData);
      this.saveUser(user);
      return user;
    },

    cancelBooking: function(bookingId) {
      let user = loadSession();
      if (!user) return null;
      const booking = (user.bookings || []).find(b => b.id === bookingId);
      if (booking) {
        booking.status = 'cancelled';
        booking.statusLabel = 'Cancelada';
        this.saveUser(user);
      }
      return user;
    },

    getFavorites: function() {
      try {
        const favs = localStorage.getItem(FAVS_STORAGE_KEY);
        return favs ? JSON.parse(favs) : [];
      } catch (e) {
        return [];
      }
    },

    isFavorite: function(destinationId) {
      const favs = this.getFavorites();
      return favs.includes(destinationId);
    },

    toggleFavorite: function(destinationId) {
      let favs = this.getFavorites();
      const idx = favs.indexOf(destinationId);
      if (idx >= 0) {
        favs.splice(idx, 1);
      } else {
        favs.push(destinationId);
      }
      localStorage.setItem(FAVS_STORAGE_KEY, JSON.stringify(favs));
      window.dispatchEvent(new CustomEvent('baqueano_favs_updated', { detail: favs }));
      return favs.includes(destinationId);
    }
  };

  function syncFirebaseIdentity(firebaseUser) {
    if (!firebaseUser) {
      const current = loadSession();
      // Solo limpiar si la sesión actual pertenecía a una sesión de Firebase
      if (current && current.firebaseUid && !current.firebaseUid.startsWith('usr_')) {
        localStorage.removeItem(STORAGE_KEY);
        updateNavbar();
        window.dispatchEvent(new CustomEvent('baqueano_session_updated', { detail: null }));
      }
      return null;
    }
    const existing = loadSession();
    const email = (firebaseUser.email || '').trim().toLowerCase();
    const privileged = PRIVILEGED_ACCOUNTS[email];
    const createdAt = firebaseUser.metadata && firebaseUser.metadata.creationTime
      ? new Date(firebaseUser.metadata.creationTime).toLocaleDateString('es-NI', { month: 'long', year: 'numeric' })
      : '';

    let resolvedName = (firebaseUser.displayName || '').trim();
    if (!resolvedName || resolvedName === email || resolvedName === 'Inicia sesión para ver tu perfil' || resolvedName === 'Invitado') {
      if (existing && existing.name && existing.name !== 'Inicia sesión para ver tu perfil' && existing.name !== 'Invitado' && existing.name !== email) {
        resolvedName = existing.name;
      } else if (privileged && privileged.name) {
        resolvedName = privileged.name;
      } else if (email) {
        const prefix = email.split('@')[0].replace(/[._-]+/g, ' ');
        resolvedName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
      } else {
        resolvedName = 'Explorador';
      }
    }

    const session = {
      ...(existing && existing.firebaseUid === firebaseUser.uid ? existing : {}),
      firebaseUid: firebaseUser.uid,
      name: resolvedName,
      email,
      phone: firebaseUser.phoneNumber || '',
      avatar: firebaseUser.photoURL || (existing && existing.avatar) || '',
      role: privileged ? privileged.role : 'explorer',
      roleLabel: privileged ? privileged.roleLabel : 'Explorador',
      memberSince: createdAt || (existing && existing.memberSince) || '—',
      emailVerified: !!firebaseUser.emailVerified,
      providerIds: (firebaseUser.providerData || []).map(profile => profile.providerId),
      isLoggedIn: true,
      settings: existing && existing.settings ? existing.settings : { language: 'es', currency: 'USD' },
      travelPreferences: existing && existing.travelPreferences ? existing.travelPreferences : {},
      bookings: existing && existing.bookings ? existing.bookings : [],
      billingHistory: existing && existing.billingHistory ? existing.billingHistory : [],
      savedPaymentMethods: []
    };
    saveSession(session);
    updateNavbar();
    window.dispatchEvent(new CustomEvent('baqueano_session_updated', { detail: session }));
    return session;
  }

  // ==========================================================================
  // EXPOSICIÓN GLOBAL INMEDIATA & MANEJO SEGURO DE EVENTOS
  // ==========================================================================
  // Asignar a window incondicionalmente para asegurar que nunca sea undefined
  window.BaqueanoSession = BaqueanoSession;

  // Intentar suscribir al observador de Firebase Auth de forma defensiva
  try {
    if (ensureFirebaseInitialized() && window.firebase && window.firebase.auth) {
      window.firebase.auth().onAuthStateChanged(syncFirebaseIdentity);
    }
  } catch (authInitErr) {
    console.warn('[Baqueano Session] Observador de Firebase Auth en espera:', authInitErr);
  }

  // Auto-inicializar Navbar en DOMContentLoaded o de inmediato si ya cargó
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateNavbar);
  } else {
    updateNavbar();
  }

})(window);
