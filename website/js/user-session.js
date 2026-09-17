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
      role: 'admin', roleLabel: 'Administrador General', navTitle: 'Ops Center',
      navDesc: 'Comando & Gestión', navBadge: '● Admin', targetUrl: 'admin.html', isPrivileged: true
    },
    'byoscarelieser@gmail.com': {
      role: 'admin', roleLabel: 'Administrador General', navTitle: 'Ops Center',
      navDesc: 'Comando & Gestión', navBadge: '● Admin', targetUrl: 'admin.html', isPrivileged: true
    },
    'vigoronmixt@gmail.com': {
      role: 'admin', roleLabel: 'Administrador General', navTitle: 'Ops Center',
      navDesc: 'Comando & Gestión', navBadge: '● Admin', targetUrl: 'admin.html', isPrivileged: true
    }
  };

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
        navTitle: 'Perfil',
        navSublabel: 'Mi Cuenta & Viajes',
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

    // 2. Actualizar también el enlace correspondiente en el footer
    const footerRoleLink = document.querySelector('.footer-link-list a[href="admin.html"], .footer-link-list a[href="perfil.html"]');
    if (footerRoleLink) {
      footerRoleLink.href = navMeta.targetUrl;
      footerRoleLink.textContent = navMeta.isPrivileged ? 'Baqueano Ops Center' : 'Mi Perfil de Explorador';
    }
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
      if (!window.firebase || !window.firebase.auth) throw new Error('Firebase Authentication no está disponible.');
      if (!email || !password) throw new Error('Correo y contraseña son obligatorios.');
      const credential = await window.firebase.auth().signInWithEmailAndPassword(email.trim(), password);
      return syncFirebaseIdentity(credential.user);
    },

    register: async function(email, password, displayName) {
      if (!window.firebase || !window.firebase.auth) throw new Error('Firebase Authentication no está disponible.');
      if (!email || !password || !displayName) throw new Error('Nombre, correo y contraseña son obligatorios.');
      const credential = await window.firebase.auth().createUserWithEmailAndPassword(email.trim(), password);
      await credential.user.updateProfile({ displayName: displayName.trim() });
      await credential.user.sendEmailVerification();
      await credential.user.reload();
      return syncFirebaseIdentity(window.firebase.auth().currentUser);
    },
    loginWithGoogle: async function() {
      if (!window.firebase || !window.firebase.auth) throw new Error('Firebase Authentication no está disponible.');
      const provider = new window.firebase.auth.GoogleAuthProvider();
      const credential = await window.firebase.auth().signInWithPopup(provider);
      return syncFirebaseIdentity(credential.user);
    },

    logout: async function() {
      if (window.firebase && window.firebase.auth) await window.firebase.auth().signOut();
      localStorage.removeItem(STORAGE_KEY);
      updateNavbar();
      window.dispatchEvent(new CustomEvent('baqueano_session_updated', { detail: null }));
      return null;
    },

    updateProfile: function(updatedFields) {
      let user = loadSession();
      Object.assign(user, updatedFields);
      this.saveUser(user);
      return user;
    },

    addBooking: function(bookingData) {
      let user = loadSession();
      if (!user.bookings) user.bookings = [];
      user.bookings.unshift(bookingData);
      this.saveUser(user);
      return user;
    },

    cancelBooking: function(bookingId) {
      let user = loadSession();
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
      localStorage.removeItem(STORAGE_KEY);
      updateNavbar();
      window.dispatchEvent(new CustomEvent('baqueano_session_updated', { detail: null }));
      return null;
    }
    const existing = loadSession();
    const email = (firebaseUser.email || '').trim().toLowerCase();
    const privileged = PRIVILEGED_ACCOUNTS[email];
    const createdAt = firebaseUser.metadata && firebaseUser.metadata.creationTime
      ? new Date(firebaseUser.metadata.creationTime).toLocaleDateString('es-NI', { month: 'long', year: 'numeric' })
      : '';
    const session = {
      ...(existing && existing.firebaseUid === firebaseUser.uid ? existing : {}),
      firebaseUid: firebaseUser.uid,
      name: firebaseUser.displayName || email,
      email,
      phone: firebaseUser.phoneNumber || '',
      avatar: firebaseUser.photoURL || '',
      role: privileged ? privileged.role : 'explorer',
      roleLabel: privileged ? privileged.roleLabel : 'Explorador',
      memberSince: createdAt,
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

  if (window.firebase && window.firebase.auth) {
    window.firebase.auth().onAuthStateChanged(syncFirebaseIdentity);
  }
  // Exponer globalmente
  window.BaqueanoSession = BaqueanoSession;

  // Auto-inicializar en DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateNavbar);
  } else {
    updateNavbar();
  }

})(window);
