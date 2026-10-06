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
// - RBAC: el rol sale de js/shared/roles.js (Custom Claim o correo verificado por
//   Firebase). Autenticarse ≠ estar autorizado: un explorador nunca ve el Ops Center.
// - Header global: cuenta con avatar, nombre y menú (renderAccountSlots).
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
  // Matriz oficial (propietario, 2026-10-03): super_admin = cuenta fundadora;
  // admin = byoscarelieser y vigoronmixt. Esta tabla SOLO decide qué ve la
  // interfaz (enlace al Ops Center); los permisos reales los aplican las reglas
  // de Firestore/Storage y Functions, y únicamente con correo verificado.
  const PRIVILEGED_ACCOUNTS = {
    'oscarelieser.informatica.inatec@gmail.com': {
      name: 'Oscar Elieser',
      role: 'super_admin', roleLabel: 'Superadministrador', navTitle: 'Ops Center',
      navDesc: 'Comando & Gestión', navBadge: '● Super Admin', targetUrl: 'admin.html', isPrivileged: true
    },
    'byoscarelieser@gmail.com': {
      name: 'Oscar Elieser',
      role: 'admin', roleLabel: 'Administrador General', navTitle: 'Ops Center',
      navDesc: 'Comando & Gestión', navBadge: '● Admin', targetUrl: 'admin.html', isPrivileged: true
    },
    'vigoronmixt@gmail.com': {
      name: 'Administrador Baqueano',
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
      if (!session.name || session.name === 'Inicia sesión para ver tu perfil' || session.name === 'Entrá para ver tu perfil' || session.name === 'Invitado') {
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
  /**
   * Guarda los datos de sesión en almacenamiento local y sincroniza la identidad
   * y trazabilidad de usuario en tiempo real con Cloud Firestore (Ops Command Center).
   */
  function saveSession(userObj) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userObj));
    } catch (e) {
      console.warn('[Baqueano Session] Error guardando localStorage:', e);
    }

    // Trazabilidad de Usuario en Tiempo Real hacia el Ops Center
    if (userObj && userObj.isLoggedIn && (userObj.firebaseUid || userObj.uid)) {
      try {
        if (typeof window !== 'undefined' && window.firebase && window.firebase.firestore) {
          const db = window.firebase.firestore();
          const uid = userObj.firebaseUid || userObj.uid;
          const userDoc = {
            id: uid,
            uid: uid,
            displayName: userObj.name || userObj.displayName || 'Explorador',
            email: userObj.email || '',
            photoURL: userObj.avatar || userObj.photoURL || '',
            role: userObj.role || 'explorer',
            platform: 'web',
            explorerLevel: userObj.explorerLevel || 'Novato',
            status: 'active',
            lastLogin: window.firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
          };

          // 1. Guardar/actualizar perfil en colección 'users'
          db.collection('users').doc(uid).set(userDoc, { merge: true }).catch(() => {});

          // 2. Registrar evento de auditoría en 'audit_logs'
          db.collection('audit_logs').add({
            action: 'USER_LOGIN_WEB',
            platform: 'web',
            userId: uid,
            userEmail: userObj.email || '',
            performedBy: userObj.name || userObj.email || 'Explorador Web',
            details: 'Inicio de sesión verificado en Portal Web Baqueano',
            timestamp: window.firebase.firestore.FieldValue.serverTimestamp()
          }).catch(() => {});
        }
      } catch (syncErr) {
        console.debug('[Baqueano Session] Telemetría web diferida:', syncErr);
      }
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

    // Autorización de INTERFAZ (qué se muestra): SOLO el rol verificado en vivo
    // por Firebase Auth en ESTA página (liveIdentity). Lo guardado en
    // localStorage (role, claimsRole, emailVerified) nunca concede el enlace:
    // editarlo no muestra el Ops Center. admin.html vuelve a verificar y las
    // reglas de Firestore/Storage protegen los datos.
    const resolvedRole = liveIdentity && liveIdentity.uid === user.firebaseUid ? liveIdentity.role : 'explorer';
    const canOps = window.BaqueanoRoles
      ? window.BaqueanoRoles.canAccessOps(resolvedRole)
      : resolvedRole === 'admin' || resolvedRole === 'super_admin';
    if (canOps) {
      return {
        isPrivileged: true,
        role: resolvedRole,
        navTitle: 'Ops Center',
        navSublabel: 'Comando & Gestión',
        targetUrl: 'admin.html',
        badge: resolvedRole === 'super_admin' ? '● Super Admin' : '● Admin'
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

  // ==========================================================================
  // CUENTA EN EL HEADER GLOBAL
  // 🎯 POR QUÉ: con sesión iniciada el botón solo decía "Cerrar sesión" en rojo:
  //    no mostraba quién había entrado ni llevaba al perfil, y los
  //    administradores no tenían un acceso claro al Ops Center.
  // ⚙️ CÓMO: invitado → enlace "Iniciar sesión" a perfil.html. Con sesión →
  //    botón con avatar y nombre que abre un menú (Mi perfil, Reservas,
  //    Favoritos, Ops Center solo si el rol es admin/super_admin, Cerrar sesión).
  //    Los textos del usuario se insertan con textContent (sin HTML). Un solo
  //    juego de listeners por documento (delegación) aunque el header se
  //    reconstruya. Mostrar el enlace NO autoriza: admin.html vuelve a verificar
  //    con Firebase Auth en vivo y las reglas protegen los datos.
  // 📦 QUÉ: INVITADO "Iniciar sesión" · USUARIO avatar+nombre · ADMIN y
  //    SUPERADMIN avatar+nombre + Ops Center.
  // ==========================================================================
  function buildAvatar(user, firstName) {
    const avatar = document.createElement('span');
    avatar.className = 'bq-account-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    const url = safeAvatarUrl(user && user.avatar);
    if (url) {
      const img = document.createElement('img');
      img.src = url;
      img.alt = '';
      img.width = 32;
      img.height = 32;
      img.decoding = 'async';
      img.referrerPolicy = 'no-referrer';
      img.addEventListener('error', () => { img.remove(); avatar.textContent = (firstName || '?').charAt(0).toUpperCase(); }, { once: true });
      avatar.appendChild(img);
    } else {
      avatar.textContent = (firstName || '?').charAt(0).toUpperCase();
    }
    return avatar;
  }

  function accountMenuItem(href, icon, label, extraClass) {
    const link = document.createElement('a');
    link.href = href;
    link.className = 'bq-account-item' + (extraClass ? ' ' + extraClass : '');
    link.setAttribute('role', 'menuitem');
    const i = document.createElement('i');
    i.className = icon;
    i.setAttribute('aria-hidden', 'true');
    const span = document.createElement('span');
    span.textContent = label;
    link.append(i, span);
    return link;
  }

  function renderAccountSlots(user, navMeta, isAuthenticated, firstName) {
    document.querySelectorAll('[data-bq-account]').forEach((slot, index) => {
      const state = isAuthenticated ? `${navMeta.role}|${user.email}|${user.name}|${user.avatar}` : 'guest';
      if (slot.dataset.renderedState === state) return;
      slot.dataset.renderedState = state;
      slot.replaceChildren();

      if (!isAuthenticated) {
        const login = document.createElement('a');
        login.className = 'exact-nav-btn-login global-session navbar-login-btn';
        login.href = 'perfil.html';
        login.setAttribute('aria-label', 'Iniciar sesión');
        login.innerHTML = '<i class="fa-solid fa-circle-user" aria-hidden="true"></i><span>Iniciar sesión</span>';
        slot.appendChild(login);
        return;
      }

      const menuId = `bqAccountMenu${index}`;
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'bq-account-trigger global-session is-logged-in';
      trigger.setAttribute('aria-haspopup', 'menu');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-controls', menuId);
      trigger.setAttribute('aria-label', `Cuenta de ${firstName}`);
      const name = document.createElement('span');
      name.className = 'bq-account-name';
      name.textContent = firstName;
      const caret = document.createElement('i');
      caret.className = 'fa-solid fa-chevron-down bq-account-caret';
      caret.setAttribute('aria-hidden', 'true');
      trigger.append(buildAvatar(user, firstName), name, caret);

      const menu = document.createElement('div');
      menu.className = 'bq-account-menu';
      menu.id = menuId;
      menu.setAttribute('role', 'menu');
      menu.hidden = true;

      const head = document.createElement('div');
      head.className = 'bq-account-head';
      const headName = document.createElement('strong');
      headName.textContent = user.name || firstName;
      const headEmail = document.createElement('span');
      headEmail.textContent = user.email || '';
      const roleBadge = document.createElement('span');
      roleBadge.className = 'bq-account-role' + (navMeta.isPrivileged ? ' is-admin' : '');
      roleBadge.textContent = window.BaqueanoRoles ? window.BaqueanoRoles.label(navMeta.role) : (navMeta.isPrivileged ? 'Administrador' : 'Explorador');
      head.append(headName, headEmail, roleBadge);

      menu.append(
        head,
        accountMenuItem('perfil.html', 'fa-regular fa-user', 'Mi perfil'),
        accountMenuItem('perfil.html#reservas', 'fa-regular fa-calendar-days', 'Mis reservas'),
        accountMenuItem('favoritos.html', 'fa-regular fa-heart', 'Favoritos')
      );
      if (navMeta.isPrivileged) {
        menu.appendChild(accountMenuItem('admin.html', 'fa-solid fa-satellite-dish', 'Ops Center', 'is-ops'));
      }
      const logout = document.createElement('button');
      logout.type = 'button';
      logout.className = 'bq-account-item is-logout';
      logout.setAttribute('role', 'menuitem');
      logout.dataset.bqLogout = 'true';
      logout.innerHTML = '<i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i><span>Cerrar sesión</span>';
      menu.appendChild(logout);

      slot.append(trigger, menu);
    });
    renderDrawerAccount(user, navMeta, isAuthenticated, firstName);
    bindAccountMenuEvents();
  }

  // Versión del cajón móvil: tarjeta con identidad y accesos en lista (en
  // celular no cabe un desplegable dentro de otro panel).
  function renderDrawerAccount(user, navMeta, isAuthenticated, firstName) {
    document.querySelectorAll('[data-bq-account-drawer]').forEach((box) => {
      const state = isAuthenticated ? `${navMeta.role}|${user.email}|${user.name}|${user.avatar}` : 'guest';
      if (box.dataset.renderedState === state) return;
      box.dataset.renderedState = state;
      box.replaceChildren();

      if (!isAuthenticated) {
        box.appendChild(accountMenuItem('perfil.html', 'fa-solid fa-circle-user', 'Iniciar sesión o crear cuenta', 'is-primary'));
        return;
      }
      const card = document.createElement('div');
      card.className = 'bq-drawer-identity';
      const text = document.createElement('span');
      text.className = 'bq-drawer-identity-text';
      const strong = document.createElement('strong');
      strong.textContent = user.name || firstName;
      const role = document.createElement('small');
      role.textContent = window.BaqueanoRoles ? window.BaqueanoRoles.label(navMeta.role) : 'Explorador';
      text.append(strong, role);
      card.append(buildAvatar(user, firstName), text);
      box.append(card, accountMenuItem('perfil.html', 'fa-regular fa-user', 'Mi perfil'));
      if (navMeta.isPrivileged) {
        box.appendChild(accountMenuItem('admin.html', 'fa-solid fa-satellite-dish', 'Ops Center', 'is-ops'));
      }
      const logout = document.createElement('button');
      logout.type = 'button';
      logout.className = 'bq-account-item is-logout';
      logout.dataset.bqLogout = 'true';
      logout.innerHTML = '<i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i><span>Cerrar sesión</span>';
      box.appendChild(logout);
    });
  }

  function setAccountMenu(slot, open, focusFirst) {
    const trigger = slot && slot.querySelector('.bq-account-trigger');
    const menu = slot && slot.querySelector('.bq-account-menu');
    if (!trigger || !menu) return;
    menu.hidden = !open;
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    slot.classList.toggle('is-open', open);
    if (open && focusFirst) {
      const first = menu.querySelector('.bq-account-item');
      if (first) first.focus();
    }
  }

  function closeAllAccountMenus(exceptSlot) {
    document.querySelectorAll('[data-bq-account].is-open').forEach((slot) => {
      if (slot !== exceptSlot) setAccountMenu(slot, false);
    });
  }

  function bindAccountMenuEvents() {
    if (window.__bqAccountMenuReady) return;
    window.__bqAccountMenuReady = true;

    document.addEventListener('click', async (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      const slot = target.closest('[data-bq-account]');

      if (target.closest('.bq-account-trigger')) {
        event.preventDefault();
        const willOpen = !slot.classList.contains('is-open');
        closeAllAccountMenus(slot);
        setAccountMenu(slot, willOpen, event.detail === 0);
        return;
      }
      if (target.closest('[data-bq-logout]')) {
        event.preventDefault();
        const button = target.closest('[data-bq-logout]');
        button.setAttribute('aria-busy', 'true');
        try {
          await window.BaqueanoSession.logout();
          window.bqToast?.('Cerraste sesión. ¡Volvé pronto!', 'success');
        } finally {
          button.removeAttribute('aria-busy');
        }
        return;
      }
      if (slot && target.closest('.bq-account-item')) {
        setAccountMenu(slot, false);
        return;
      }
      if (!slot) closeAllAccountMenus(null);
    });

    document.addEventListener('keydown', (event) => {
      const openSlot = document.querySelector('[data-bq-account].is-open');
      if (!openSlot) return;
      if (event.key === 'Escape') {
        setAccountMenu(openSlot, false);
        openSlot.querySelector('.bq-account-trigger')?.focus();
        return;
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        const items = Array.from(openSlot.querySelectorAll('.bq-account-item'));
        if (!items.length) return;
        event.preventDefault();
        const index = items.indexOf(document.activeElement);
        const next = event.key === 'ArrowDown'
          ? (index + 1) % items.length
          : (index - 1 + items.length) % items.length;
        items[next].focus();
      }
    });
  }

  /**
   * Pinta el estado de sesión en el header y el pie de la página actual.
   * 🎯 Por qué: la sesión debe verse igual en todas las páginas del portal.
   * ⚙️ Cómo: lee la sesión local (copia de la identidad de Firebase), resuelve el
   *    rol con js/shared/roles.js y actualiza enlaces al Ops Center y la cuenta.
   * 📦 Qué: enlaces admin ocultos salvo admin/super_admin, cuenta del header y
   *    del cajón móvil, y textos del pie.
   */
  function updateNavbar() {
    const user = loadSession();
    const navMeta = getRoleNavMetadata(user);
    const isAuthenticated = Boolean(user && user.isLoggedIn);
    const userFirstName = (user && user.name)
      ? user.name.trim().split(/\s+/)[0]
      : (isAuthenticated ? 'Explorador' : 'Mi Cuenta');

    // 🎯 POR QUÉ: ningún acceso operativo debe mostrarse antes de validar una sesión administrativa.
    // ⚙️ CÓMO: todos los enlaces a admin nacen ocultos y se habilitan únicamente
    //    cuando el correo autenticado pertenece a la lista operativa autorizada.
    // 📦 QUÉ: control uniforme para mega menú, navegación móvil y footer.
    document.querySelectorAll('a[href="admin.html"], a[href="/admin.html"]').forEach((adminLink) => {
      adminLink.hidden = !navMeta.isPrivileged;
      adminLink.setAttribute('aria-hidden', navMeta.isPrivileged ? 'false' : 'true');
      adminLink.style.display = navMeta.isPrivileged ? '' : 'none';
      if (navMeta.isPrivileged) adminLink.removeAttribute('tabindex');
      else adminLink.setAttribute('tabindex', '-1');
    });

    // El menú canónico (navigation.js) ya trae Perfil y el enlace oculto al Ops
    // Center en "Más"; la cuenta del usuario se pinta en .bq-account-slot.
    // 3b. Cuenta en el header global (.bq-account-slot, creado por navigation.js)
    renderAccountSlots(user, navMeta, isAuthenticated, userFirstName);

    // 4. Actualizar enlaces correspondientes en el footer
    const footerPerfilLink = document.querySelector('.footer-link-list a[href="perfil.html"]');
    if (footerPerfilLink) {
      footerPerfilLink.textContent = isAuthenticated ? `Mi Perfil (${userFirstName})` : 'Mi Perfil de Explorador';
    }

    const footerOpsLink = document.querySelector('.footer-link-list a[href="admin.html"]');
    if (footerOpsLink) {
      footerOpsLink.style.display = navMeta.isPrivileged ? '' : 'none';
    }
  }

  // Configuración oficial de Firebase Web para el Ecosistema Baqueano Nicaragua
  const BAQUEANO_FIREBASE_CONFIG = (window.BaqueanoFirebase && window.BaqueanoFirebase.config) || {
    apiKey: 'AIzaSyCRNrYyqmymNkVvmKNyuhp7J-hIjQXN9pA',
    authDomain: 'app-baqueano.firebaseapp.com',
    databaseURL: 'https://app-baqueano-default-rtdb.firebaseio.com',
    projectId: 'app-baqueano',
    storageBucket: 'app-baqueano.firebasestorage.app',
    messagingSenderId: '578585227888',
    appId: '1:578585227888:web:9ce48c63e629cd52f2fab5',
    measurementId: 'G-J2FBQHH47T'
  };

  // ==========================================================================
  // 🎯 POR QUÉ: el perfil se enviaba a Supabase con la clave pública y con el
  //    rol que decía el navegador (incluso "superadmin"). Supabase lo rechazaba
  //    (permiso revocado) y, si alguna vez lo aceptara, sería una escalada de
  //    privilegios. Además las escrituras a Firestore llevaban campos fuera de
  //    la lista blanca de firestore.rules, así que tampoco se guardaban.
  // ⚙️ CÓMO: solo se escribe `users/{uid}` en Firestore con los campos que
  //    permiten las reglas; js/firestore-mirror.js replica cada escritura
  //    confirmada en Supabase a través de la Edge Function baqueano-mirror,
  //    que verifica el ID token de Firebase. El rol nunca sale del navegador:
  //    lo deciden los Custom Claims y public.official_super_admins.
  // 📦 QUÉ: ensureUserDocument() al iniciar sesión y persistProfile() al editar.
  // ==========================================================================
  const PROFILE_LANGUAGES = ['es', 'en', 'fr', 'it', 'pt', 'de'];
  const PROFILE_CURRENCIES = ['NIO', 'USD'];
  const shortText = (value, max) => String(value == null ? '' : value).trim().slice(0, max);

  function userDocs() {
    if (!(window.firebase && window.firebase.firestore && window.firebase.auth)) return null;
    try { return window.firebase.firestore().collection('users'); } catch (error) { return null; }
  }

  // Alta del directorio de usuarios: una vez por cuenta (create con las
  // reglas: uid y correo del token, rol "explorer", contadores en cero).
  async function ensureUserDocument(firebaseUser, session) {
    const users = userDocs();
    if (!users || !firebaseUser || !firebaseUser.uid) return;
    const flag = 'bq_user_doc_' + firebaseUser.uid;
    try { if (sessionStorage.getItem(flag)) return; } catch (_) {}
    try {
      const ref = users.doc(firebaseUser.uid);
      const snapshot = await ref.get();
      if (!snapshot.exists) {
        const now = new Date().toISOString();
        const doc = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: shortText(session && session.name, 120),
          role: 'explorer',
          explorerLevel: 'Explorador Inicial',
          xp: 0,
          stamps: [],
          badges: [],
          favorites: [],
          createdAt: firebaseUser.metadata && firebaseUser.metadata.creationTime ? new Date(firebaseUser.metadata.creationTime).toISOString() : now,
          updatedAt: now
        };
        if (firebaseUser.photoURL) doc.photoUrl = String(firebaseUser.photoURL).slice(0, 500);
        await ref.set(doc);
      }
      try { sessionStorage.setItem(flag, '1'); } catch (_) {}
    } catch (error) {
      console.warn('[Baqueano Session] No se pudo registrar el usuario en Firestore:', error.message);
    }
  }

  // Edición del perfil: solo nombre, foto y el mapa `profile` validado.
  async function persistProfile(userObj) {
    const users = userDocs();
    const current = window.firebase && window.firebase.auth ? window.firebase.auth().currentUser : null;
    if (!users || !current || !userObj || userObj.firebaseUid !== current.uid) return false;
    const settings = userObj.settings || {};
    const profile = {};
    if (userObj.phone) profile.phone = shortText(userObj.phone, 30);
    if (PROFILE_LANGUAGES.includes(settings.language)) profile.language = settings.language;
    if (PROFILE_CURRENCIES.includes(settings.currency)) profile.currency = settings.currency;
    const update = { displayName: shortText(userObj.name, 120), profile: profile, updatedAt: new Date().toISOString() };
    if (userObj.avatar && /^https:\/\//.test(userObj.avatar)) update.photoUrl = String(userObj.avatar).slice(0, 500);
    try {
      await ensureUserDocument(current, userObj);
      await users.doc(current.uid).set(update, { merge: true });
      return true;
    } catch (error) {
      console.warn('[Baqueano Session] Perfil no guardado en Firestore:', error.message);
      return false;
    }
  }

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
  // IDENTIDAD EN VIVO Y CARGA BAJO DEMANDA DE FIREBASE AUTH
  // 🎯 POR QUÉ: solo perfil.html y admin.html cargan Firebase Auth. En las
  //    demás páginas el header confiaba en la copia de localStorage: no se
  //    enteraba de un cierre de sesión, "Cerrar sesión" no cerraba Firebase y
  //    una copia editada a mano mostraba el enlace al Ops Center.
  // ⚙️ CÓMO: si la página no trae el SDK y existe una sesión local, se cargan
  //    app+auth compat y js/firebase-config.js UNA vez, en tiempo ocioso (los
  //    invitados no descargan nada). onAuthStateChanged es la fuente de verdad:
  //    liveIdentity (solo memoria, nunca almacenamiento) guarda uid y rol
  //    verificados en ESTA página.
  // 📦 QUÉ: sesión consistente en todas las páginas, logout real desde
  //    cualquier página y enlace al Ops Center solo con rol verificado en vivo.
  // ==========================================================================
  const FIREBASE_SDK_BASE = 'https://www.gstatic.com/firebasejs/10.14.1/';
  const FIREBASE_SCRIPTS = [
    { src: FIREBASE_SDK_BASE + 'firebase-app-compat.js', ready: () => Boolean(window.firebase && window.firebase.initializeApp) },
    { src: FIREBASE_SDK_BASE + 'firebase-auth-compat.js', ready: () => Boolean(window.firebase && window.firebase.auth) },
    { src: 'js/firebase-config.js?v=20261003-2', ready: () => Boolean(window.BaqueanoFirebase) }
  ];
  let liveIdentity = null;
  let authObserverBound = false;
  let firebaseAuthPromise = null;

  function loadScriptOnce(entry) {
    if (entry.ready()) return Promise.resolve();
    const base = entry.src.split('?')[0];
    const existing = document.querySelector(`script[src^="${base}"]`);
    return new Promise((resolve, reject) => {
      const script = existing || document.createElement('script');
      script.addEventListener('load', () => (entry.ready() ? resolve() : reject(new Error('Sin API: ' + base))), { once: true });
      script.addEventListener('error', () => reject(new Error('No se pudo cargar ' + base)), { once: true });
      if (!existing) {
        script.src = entry.src;
        script.async = false;
        document.head.appendChild(script);
      }
    });
  }

  function bindAuthObserver() {
    if (authObserverBound) return true;
    try {
      if (ensureFirebaseInitialized() && window.firebase && window.firebase.auth) {
        window.firebase.auth().onAuthStateChanged(syncFirebaseIdentity);
        authObserverBound = true;
      }
    } catch (authInitErr) {
      console.warn('[Baqueano Session] Observador de Firebase Auth en espera:', authInitErr);
    }
    return authObserverBound;
  }

  function loadFirebaseAuth() {
    if (window.firebase && window.firebase.auth) return Promise.resolve(bindAuthObserver());
    if (!firebaseAuthPromise) {
      firebaseAuthPromise = FIREBASE_SCRIPTS
        .reduce((chain, entry) => chain.then(() => loadScriptOnce(entry)), Promise.resolve())
        .then(() => bindAuthObserver())
        .catch((error) => {
          firebaseAuthPromise = null;
          // Falla cerrada: sin verificación en vivo no se muestra el Ops Center.
          console.warn('[Baqueano Session] Firebase Auth no disponible; header sin privilegios:', error.message);
          return false;
        });
    }
    return firebaseAuthPromise;
  }

  // ==========================================================================
  // API PÚBLICA DE SESIÓN (BaqueanoSession)
  // ==========================================================================
  const BaqueanoSession = {
    getUser: function() {
      return loadSession();
    },

    // Repinta el estado de sesión en el menú. global-injector.js lo llama tras
    // imponer el menú canónico, para no perder "Cerrar sesión" al reemplazarlo.
    refreshNavbar: function() {
      updateNavbar();
    },

    saveUser: async function(userObj) {
      if (!userObj) return null;
      // 1. Guardar localmente para reactividad instantánea
      saveSession(userObj);
      updateNavbar();
      window.dispatchEvent(new CustomEvent('baqueano_session_updated', { detail: userObj }));

      // 2. Firestore (fuente principal); el espejo lo replica en Supabase.
      persistProfile(userObj);

      return userObj;
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

    // Envía el correo de restablecimiento de contraseña de Firebase. Por
    // privacidad responde igual exista o no la cuenta (no revela registros).
    resetPassword: async function(email) {
      ensureFirebaseInitialized();
      if (!window.firebase || !window.firebase.auth) {
        throw new Error('El servicio de autenticación no está disponible en este entorno.');
      }
      if (!email) throw new Error('Escribí tu correo para enviarte el enlace.');
      try {
        await window.firebase.auth().sendPasswordResetEmail(email.trim());
      } catch (error) {
        if (error.code === 'auth/invalid-email') {
          throw new Error('El formato del correo electrónico no es válido.');
        } else if (error.code === 'auth/too-many-requests') {
          throw new Error('Demasiados intentos. Esperá unos minutos antes de reintentar.');
        } else if (error.code !== 'auth/user-not-found') {
          throw error;
        }
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

    logout: async function() {
      // 1. Cierre seguro de Firebase con timeout de salvaguarda (1.2s). En
      //    páginas sin SDK se carga primero (máx. 4 s): si no, Firebase
      //    conservaría la sesión y la "resucitaría" en perfil.html.
      liveIdentity = null;
      try {
        if (!(window.firebase && window.firebase.auth)) {
          await Promise.race([loadFirebaseAuth(), new Promise((resolve) => setTimeout(resolve, 4000))]);
        }
        if (window.firebase && window.firebase.auth && ensureFirebaseInitialized()) {
          await Promise.race([
            window.firebase.auth().signOut(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase signOut timeout')), 1200))
          ]);
        }
      } catch (err) {
        console.warn('[Baqueano Session] Aviso en cierre de sesión Firebase:', err.message);
      }

      // 2. Cierre seguro de Supabase Auth si está presente
      try {
        if (window.baqueanoSupabase && window.baqueanoSupabase.auth) {
          await Promise.race([
            window.baqueanoSupabase.auth.signOut(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase signOut timeout')), 1000))
          ]);
        }
      } catch (sbErr) {
        console.warn('[Baqueano Session] Aviso en cierre de sesión Supabase:', sbErr.message);
      }

      // 3. Limpiar almacenamiento local y sesión
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
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
      const isNowFav = idx < 0;
      if (idx >= 0) {
        favs.splice(idx, 1);
      } else {
        favs.push(destinationId);
      }
      localStorage.setItem(FAVS_STORAGE_KEY, JSON.stringify(favs));
      window.dispatchEvent(new CustomEvent('baqueano_favs_updated', { detail: favs }));

      // Sincronizar en Supabase (favorites)
      if (typeof window.baqueanoSupabase !== 'undefined' && window.baqueanoSupabase.from) {
        const user = loadSession();
        const uid = user ? (user.firebaseUid || 'guest_uid') : 'guest_uid';
        if (isNowFav) {
          window.baqueanoSupabase.from('favorites').upsert({
            user_uid: uid,
            entity_type: 'destination',
            entity_id: destinationId
          }).then(({ error }) => {
            if (error) console.warn('[Supabase Sync] Favorito no sincronizado:', error.message);
          }).catch(e => console.warn('[Supabase Sync] Error fav:', e.message));
        } else {
          window.baqueanoSupabase.from('favorites').delete()
            .eq('user_uid', uid)
            .eq('entity_type', 'destination')
            .eq('entity_id', destinationId)
            .then(({ error }) => {
              if (error) console.warn('[Supabase Sync] Error borrado fav:', error.message);
            }).catch(e => console.warn('[Supabase Sync] Error delete fav:', e.message));
        }
      }

      return favs.includes(destinationId);
    }
  };

  // Regreso tras iniciar sesión (2026-10-06): un formulario que exige sesión (postular negocio,
  // opiniones) puede mandar a perfil.html?volver=pagina.html#ancla. Solo se aceptan páginas
  // propias con este patrón exacto, para que nadie use el parámetro como redirección abierta.
  function returnAfterLogin() {
    try {
      if (!/perfil\.html$/.test(window.location.pathname) && window.location.pathname !== '/perfil') return;
      const target = new URLSearchParams(window.location.search).get('volver');
      if (!target || !/^[a-z0-9-]+\.html(#[A-Za-z0-9_-]+)?$/.test(target)) return;
      window.location.replace(target);
    } catch (_) { /* sin redirección */ }
  }

  function syncFirebaseIdentity(firebaseUser) {
    if (!firebaseUser) {
      liveIdentity = null;
      // Firebase Auth es la única fuente de autenticación: si confirma que no
      // hay usuario, cualquier copia local (incluida una sesión 'usr_' antigua
      // o editada a mano) deja de valer.
      if (loadSession()) {
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new CustomEvent('baqueano_session_updated', { detail: null }));
      }
      updateNavbar();
      return null;
    }
    returnAfterLogin();
    const existing = loadSession();
    const email = (firebaseUser.email || '').trim().toLowerCase();
    // Rol privilegiado solo con correo verificado por Firebase.
    const privileged = firebaseUser.emailVerified === true ? PRIVILEGED_ACCOUNTS[email] : null;
    // Rol provisional por correo verificado; abajo se refina con el Custom Claim.
    const resolvedRole = window.BaqueanoRoles
      ? window.BaqueanoRoles.resolve({ email, emailVerified: firebaseUser.emailVerified === true })
      : (privileged ? privileged.role : 'explorer');
    const createdAt = firebaseUser.metadata && firebaseUser.metadata.creationTime
      ? new Date(firebaseUser.metadata.creationTime).toLocaleDateString('es-NI', { month: 'long', year: 'numeric' })
      : '';

    let resolvedName = (firebaseUser.displayName || '').trim();
    if (!resolvedName || resolvedName === email || resolvedName === 'Inicia sesión para ver tu perfil' || resolvedName === 'Entrá para ver tu perfil' || resolvedName === 'Invitado') {
      if (existing && existing.name && existing.name !== 'Inicia sesión para ver tu perfil' && existing.name !== 'Entrá para ver tu perfil' && existing.name !== 'Invitado' && existing.name !== email) {
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
      role: resolvedRole,
      roleLabel: window.BaqueanoRoles ? window.BaqueanoRoles.label(resolvedRole) : (privileged ? privileged.roleLabel : 'Explorador'),
      claimsRole: '',
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
    // Rol verificado en vivo (correo verificado por Firebase); el claim lo refina abajo.
    liveIdentity = { uid: firebaseUser.uid, role: resolvedRole };
    saveSession(session);
    updateNavbar();
    window.dispatchEvent(new CustomEvent('baqueano_session_updated', { detail: session }));

    // Custom Claims (admin | super_admin) emitidos por el backend: si existen,
    // mandan sobre la matriz de correos. Se leen del token, nunca del cliente.
    if (window.BaqueanoRoles) {
      window.BaqueanoRoles.resolveFirebaseUser(firebaseUser).then((claimRole) => {
        if (liveIdentity && liveIdentity.uid === firebaseUser.uid) liveIdentity.role = claimRole;
        const current = loadSession();
        if (!current || current.firebaseUid !== firebaseUser.uid || current.role === claimRole) {
          updateNavbar();
          return;
        }
        current.role = claimRole;
        current.roleLabel = window.BaqueanoRoles.label(claimRole);
        current.claimsRole = window.BaqueanoRoles.canAccessOps(claimRole) ? claimRole : '';
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(current)); } catch (_) {}
        updateNavbar();
        window.dispatchEvent(new CustomEvent('baqueano_session_updated', { detail: current }));
      });
    }

    // Directorio de usuarios en Firestore (sin rol del cliente; ver ensureUserDocument).
    ensureUserDocument(firebaseUser, session);

    return session;
  }

  // ==========================================================================
  // EXPOSICIÓN GLOBAL INMEDIATA & MANEJO SEGURO DE EVENTOS
  // ==========================================================================
  // Asignar a window incondicionalmente para asegurar que nunca sea undefined
  window.BaqueanoSession = BaqueanoSession;

  // 🎯 POR QUÉ: la navegación global puede reconstruirse después de cargar la sesión.
  // ⚙️ CÓMO: observa únicamente nodos nuevos y vuelve a aplicar el control de acceso.
  // 📦 QUÉ: evita que OPS aparezca momentáneamente por una actualización tardía del menú.
  let sessionNavRefreshQueued = false;
  const sessionNavObserver = new MutationObserver((mutations) => {
    const addedNavigation = mutations.some((mutation) => Array.from(mutation.addedNodes).some((node) =>
      node.nodeType === 1 && (node.matches?.('nav, footer, a[href="admin.html"]') || node.querySelector?.('a[href="admin.html"]'))
    ));
    if (!addedNavigation || sessionNavRefreshQueued) return;
    sessionNavRefreshQueued = true;
    window.requestAnimationFrame(() => {
      sessionNavRefreshQueued = false;
      updateNavbar();
    });
  });
  sessionNavObserver.observe(document.documentElement, { childList: true, subtree: true });

  // Suscribir al observador de Firebase Auth: de inmediato si la página trae
  // el SDK (perfil.html); si no, solo cuando hay sesión local que verificar,
  // en tiempo ocioso para no competir con el primer pintado.
  if (!bindAuthObserver() && loadSession()) {
    const verifyLater = () => { loadFirebaseAuth(); };
    if ('requestIdleCallback' in window) window.requestIdleCallback(verifyLater, { timeout: 2500 });
    else window.setTimeout(verifyLater, 1200);
  }

  // Iniciar o cerrar sesión en otra pestaña actualiza el header de esta.
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY || event.key === null) updateNavbar();
  });

  // Auto-inicializar Navbar en DOMContentLoaded o de inmediato si ya cargó
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateNavbar);
  } else {
    updateNavbar();
  }

})(window);
