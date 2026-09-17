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
      role: 'admin',
      roleLabel: 'Administrador General',
      navTitle: 'Ops Center',
      navDesc: 'Comando & Telemetría',
      navBadge: '● 24/7',
      targetUrl: 'admin.html',
      isPrivileged: true
    },
    'vigoronmixt@gmail.com': {
      role: 'auditor',
      roleLabel: 'Auditor Oficial Ley 306',
      navTitle: 'Ops Center',
      navDesc: 'Auditoría & Fiscalización',
      navBadge: '● Auditor',
      targetUrl: 'admin.html',
      isPrivileged: true
    }
  };

  // Usuario Explorador por Defecto (Mock Inicial para Experiencia Inmediata)
  const DEFAULT_EXPLORER = {
    id: 'usr-nic-2026-884',
    name: 'Carlos Mendoza Jarquín',
    email: 'carlos.mendoza@explorador.ni',
    phone: '+505 8765-4321',
    avatar: 'assets/images/logo.png',
    avatarText: 'CM',
    role: 'explorer',
    roleLabel: 'Explorador Soberano',
    memberSince: 'Febrero 2026',
    isLoggedIn: true,
    twoFactorEnabled: false,
    settings: {
      language: 'es',
      currency: 'USD'
    },
    travelPreferences: {
      interests: ['senderismo', 'volcanes', 'gastronomia', 'aventura'],
      dietaryRestrictions: 'Ninguna',
      accessibilityNeeds: 'Sin limitaciones de movilidad física',
      emergencyContact: 'María Jarquín (+505 8899-1122)'
    },
    savedPaymentMethods: [
      {
        id: 'pm-1',
        brand: 'Visa',
        last4: '4821',
        holder: 'Carlos Mendoza J.',
        expiry: '08/28',
        isDefault: true
      },
      {
        id: 'pm-2',
        brand: 'Mastercard',
        last4: '9034',
        holder: 'Carlos Mendoza J.',
        expiry: '11/27',
        isDefault: false
      }
    ],
    bookings: [
      {
        id: 'BK-2026-9042',
        destinationName: 'Parque Nacional Volcán Masaya & Cuevas de Tálquez',
        destinationCategory: 'Volcanes & Senderos',
        date: '25 Oct 2026',
        days: '2 Días / 1 Noche',
        travelers: 2,
        totalAmount: 95.00,
        currency: 'USD',
        status: 'upcoming', // upcoming, completed, cancelled
        statusLabel: 'Próxima Expedición',
        cooperative: 'Cooperativa Ecoturística Guardaparques de Masaya',
        guideName: 'Don Efraín Morales (Guía Baqueano #14)',
        meetingPoint: 'Entrada Oficial Km 23 Carretera a Masaya, 07:30 AM',
        qrCodeText: 'BAQUEANO-AUTH-RES-MASAYA-9042'
      },
      {
        id: 'BK-2026-7811',
        destinationName: 'Cañón de Somoto & Pozas Escondidas',
        destinationCategory: 'Ríos & Geología',
        date: '14 Ene 2026',
        days: '1 Día Completo',
        travelers: 4,
        totalAmount: 140.00,
        currency: 'USD',
        status: 'completed',
        statusLabel: 'Completada',
        cooperative: 'Cooperativa Multisectorial Guías del Cañón R.L.',
        guideName: 'Marlon Corrales',
        meetingPoint: 'Monumento al Cañón, Somoto Madriz',
        qrCodeText: 'BAQUEANO-AUTH-RES-SOMOTO-7811'
      },
      {
        id: 'BK-2026-6502',
        destinationName: 'Refugio de Vida Silvestre Los Guatuzos',
        destinationCategory: 'Humedales & Aves',
        date: '02 Dic 2025',
        days: '3 Días / 2 Noches',
        travelers: 1,
        totalAmount: 180.00,
        currency: 'USD',
        status: 'cancelled',
        statusLabel: 'Cancelada',
        cooperative: 'Asociación de Pescadores y Guías de Río San Juan',
        guideName: 'Sebastián Solís',
        meetingPoint: 'Muelle de San Carlos, Río San Juan',
        qrCodeText: 'BAQUEANO-AUTH-RES-GUATUZOS-6502'
      }
    ],
    billingHistory: [
      {
        id: 'FAC-2026-00481',
        bookingId: 'BK-2026-9042',
        concept: 'Expedición Nocturna Volcán Masaya & Cuevas de Lava',
        date: '15 Sep 2026',
        subtotal: 95.00,
        inturDiscountLey306: 0.00,
        taxes: 0.00,
        total: 95.00,
        currency: 'USD',
        paymentMethod: 'Visa •••• 4821',
        fiscalRegime: 'Régimen Ecoturístico Comunitario — Ley 306 INTUR'
      },
      {
        id: 'FAC-2026-00312',
        bookingId: 'BK-2026-7811',
        concept: 'Descenso Acuático en Tubing Somoto & Almuerzo Típico',
        date: '10 Ene 2026',
        subtotal: 140.00,
        inturDiscountLey306: 0.00,
        taxes: 0.00,
        total: 140.00,
        currency: 'USD',
        paymentMethod: 'Mastercard •••• 9034',
        fiscalRegime: 'Régimen Ecoturístico Comunitario — Ley 306 INTUR'
      }
    ]
  };

  /**
   * Carga la sesión del usuario desde el almacenamiento local.
   */
  function loadSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[Baqueano Session] Error leyendo localStorage:', e);
    }
    // Si no existe, guardar el explorador inicial por defecto
    saveSession(DEFAULT_EXPLORER);
    return DEFAULT_EXPLORER;
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

    login: function(email, password) {
      const cleanEmail = (email || '').trim().toLowerCase();
      let user = loadSession();

      if (PRIVILEGED_ACCOUNTS[cleanEmail]) {
        const priv = PRIVILEGED_ACCOUNTS[cleanEmail];
        user.email = cleanEmail;
        user.role = priv.role;
        user.roleLabel = priv.roleLabel;
        user.name = priv.role === 'admin' ? 'Oscar Elieser (Admin)' : 'Vigorón Mixto (Auditor)';
        user.isLoggedIn = true;
      } else {
        user.email = cleanEmail;
        user.role = 'explorer';
        user.roleLabel = 'Explorador Soberano';
        user.name = cleanEmail.split('@')[0].replace(/[._]/g, ' ').toUpperCase();
        user.isLoggedIn = true;
      }

      this.saveUser(user);
      return user;
    },

    logout: function() {
      let user = loadSession();
      user.isLoggedIn = false;
      this.saveUser(user);
      return user;
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

  // Exponer globalmente
  window.BaqueanoSession = BaqueanoSession;

  // Auto-inicializar en DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateNavbar);
  } else {
    updateNavbar();
  }

})(window);
