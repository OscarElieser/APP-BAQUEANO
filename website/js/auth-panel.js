/*
=====================================================
BAQUEANO — Panel de acceso: Google o correo y contraseña (perfil.html)
=====================================================

ACTUALIZACIÓN 2026-10-03 (directiva del propietario):
  - super_admin y admin entran con Google (el Ops Center exige correo oficial
    verificado; ver js/ops-center/ops-engine.js).
  - Cualquier otra persona entra "normal" con correo y contraseña (o crea su
    cuenta) SOLO para navegar el portal: guardar destinos, Mi Viaje, perfil.
    Tener cuenta no da acceso al Ops Center; el enlace ni siquiera se muestra.
  - Formulario: Entrar / Crear cuenta / Olvidé mi contraseña. Delegan en
    BaqueanoSession.login, .register y .resetPassword (js/user-session.js),
    que traducen los errores de Firebase al español.

PROPÓSITO:
  Conectar el Website público con Firebase Authentication. Hasta ahora
  "Iniciar sesión" abría un perfil de ejemplo (datos fijos en el HTML) sin
  ningún botón de acceso: BaqueanoSession.loginWithGoogle() existía pero
  ninguna página la llamaba.

ARQUITECTURA:
  1. perfil.html carga el SDK compat de Firebase (app + auth) y
     js/firebase-config.js ANTES de navigation.js, de modo que
     js/user-session.js (inyectado por navigation.js) encuentra Firebase y
     se suscribe a onAuthStateChanged para sincronizar la sesión local.
  2. Este módulo escucha el mismo onAuthStateChanged para la interfaz:
     - Sin usuario: oculta (atributo hidden, sin borrar) las secciones
       personales de ejemplo y muestra el panel "Continuar con Google".
     - Con usuario: muestra las secciones y reemplaza en la tarjeta el
       nombre, foto, correo y fecha de alta por los datos reales.
  3. El inicio de sesión delega en BaqueanoSession.loginWithGoogle()
     (popup de Google; authDomain app-baqueano.firebaseapp.com), que ya
     traduce los errores de Firebase a mensajes en español.

DEPENDENCIAS:
  firebase-app-compat + firebase-auth-compat 10.14.1 (gstatic),
  js/firebase-config.js, js/user-session.js, css/auth-panel.css.

DATOS:
  Perfil público de Google del usuario autenticado (displayName, email,
  photoURL, metadata.creationTime). No se guarda nada nuevo aquí.

SEGURIDAD:
  - Datos de usuario insertados con textContent (sin innerHTML) → sin XSS.
  - La foto solo se acepta si es una URL https.
  - Ocultar secciones NO es autorización: los datos privados reales se
    protegen con reglas de Firestore y RLS de Supabase.
  - Mejora progresiva: si este script falla, la página se ve como antes.

RELACIÓN:
  perfil.html (contenedor), js/user-session.js (BaqueanoSession y navbar),
  firebase.json / azure/nginx (CSP que permite gstatic, apis.google.com y
  el iframe de app-baqueano.firebaseapp.com).
=====================================================
*/
(function initializeBaqueanoAuthPanel(window, document) {
  'use strict';

  if (window.__BAQUEANO_AUTH_PANEL__) return;
  window.__BAQUEANO_AUTH_PANEL__ = true;

  // Secciones de perfil que hoy contienen datos de ejemplo; se ocultan a
  // visitantes anónimos para no mostrar un perfil ajeno como si fuera suyo.
  var PRIVATE_SECTIONS = [
    '.prof-user-section', '.prof-tabs-section', '.prof-top-cards',
    '.prof-passport-section', '.prof-prefs-section', '.prof-mid-cards',
    '.prof-bottom-cards', '.prof-gamification-section'
  ];
  var SESSION_WAIT_MS = 8000;

  // Logotipo "G" oficial de Google (SVG estático, sin datos de usuario).
  var GOOGLE_G_SVG =
    '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">' +
    '<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>' +
    '<path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>' +
    '<path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>' +
    '<path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>' +
    '</svg>';

  var panel = null;
  var messageEl = null;
  var googleBtn = null;
  var emailForm = null;
  var emailMode = 'login'; // 'login' | 'register'

  // Espera a que navigation.js inyecte user-session.js (BaqueanoSession).
  function waitForSession() {
    return new Promise(function (resolve) {
      if (window.BaqueanoSession) return resolve(window.BaqueanoSession);
      var started = Date.now();
      var timer = window.setInterval(function () {
        if (window.BaqueanoSession || Date.now() - started > SESSION_WAIT_MS) {
          window.clearInterval(timer);
          resolve(window.BaqueanoSession || null);
        }
      }, 100);
    });
  }

  function setMessage(text, isInfo) {
    if (!messageEl) return;
    messageEl.textContent = text || '';
    messageEl.classList.toggle('is-info', Boolean(isInfo));
  }

  function setPrivateSectionsHidden(hidden) {
    PRIVATE_SECTIONS.forEach(function (selector) {
      var section = document.querySelector(selector);
      if (section) section.hidden = hidden;
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-private-section]'), function (section) {
      section.hidden = hidden;
    });
  }

  // Campos [data-profile-field]: guardan su valor neutro del HTML para
  // restaurarlo al cerrar sesión (no queda nada de la cuenta anterior).
  function setProfileField(field, value) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-profile-field="' + field + '"]'), function (node) {
      if (!node.hasAttribute('data-default')) node.setAttribute('data-default', node.textContent);
      node.textContent = value != null && value !== '' ? value : node.getAttribute('data-default');
    });
  }

  function resetProfileFields() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-profile-field][data-default]'), function (node) {
      node.textContent = node.getAttribute('data-default');
    });
    Array.prototype.forEach.call(document.querySelectorAll('.prof-avatar-img, [data-profile-avatar]'), function (img) {
      img.src = 'assets/images/logo.png';
      img.alt = '';
    });
  }

  function formatDate(value, withTime) {
    var date = value ? new Date(value) : null;
    if (!date || !Number.isFinite(date.getTime())) return null;
    return withTime
      ? date.toLocaleString('es-NI', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString('es-NI', { month: 'short', year: 'numeric' });
  }

  // Construye el panel con nodos DOM; el único HTML estático es el SVG del logotipo.
  function buildPanel() {
    panel = document.createElement('section');
    panel.className = 'bq-auth-panel';
    panel.id = 'bq-auth-panel';
    panel.setAttribute('aria-labelledby', 'bq-auth-title');

    var eyebrow = document.createElement('span');
    eyebrow.className = 'bq-auth-eyebrow';
    eyebrow.textContent = 'Cuenta BAQUEANO';

    var title = document.createElement('h2');
    title.className = 'bq-auth-title';
    title.id = 'bq-auth-title';
    title.textContent = 'Entrá para ver tu perfil';

    var lead = document.createElement('p');
    lead.className = 'bq-auth-lead';
    lead.textContent = 'Guardá destinos, organizá Mi Viaje y llevá tu Pasaporte Baqueano en cualquier dispositivo.';

    googleBtn = document.createElement('button');
    googleBtn.type = 'button';
    googleBtn.className = 'bq-auth-google';
    googleBtn.innerHTML = GOOGLE_G_SVG;
    var label = document.createElement('span');
    label.textContent = 'Continuar con Google';
    googleBtn.appendChild(label);
    googleBtn.addEventListener('click', handleGoogleLogin);

    messageEl = document.createElement('p');
    messageEl.className = 'bq-auth-message';
    messageEl.setAttribute('role', 'alert');
    messageEl.setAttribute('aria-live', 'polite');

    var privacy = document.createElement('p');
    privacy.className = 'bq-auth-privacy';
    privacy.append('Al continuar aceptas los ');
    var terms = document.createElement('a');
    terms.href = 'terminos.html';
    terms.textContent = 'Términos';
    privacy.append(terms, ' y la ');
    var priv = document.createElement('a');
    priv.href = 'privacidad.html';
    priv.textContent = 'Política de privacidad';
    privacy.append(priv, '.');

    var divider = document.createElement('p');
    divider.className = 'bq-auth-divider';
    divider.textContent = 'o con tu correo';

    emailForm = buildEmailForm();

    panel.append(eyebrow, title, lead, googleBtn, divider, emailForm, messageEl, privacy);
    setEmailMode('login');

    var hero = document.querySelector('.prof-hero');
    if (hero && hero.parentNode) hero.parentNode.insertBefore(panel, hero.nextSibling);
    else document.body.insertBefore(panel, document.body.firstChild);
  }

  function field(type, name, labelText, autocomplete) {
    var wrap = document.createElement('label');
    wrap.className = 'bq-auth-field';
    wrap.dataset.field = name;
    var span = document.createElement('span');
    span.textContent = labelText;
    var input = document.createElement('input');
    input.type = type;
    input.name = name;
    input.autocomplete = autocomplete;
    input.required = true;
    if (type === 'password') input.minLength = 8;
    if (name === 'name') input.maxLength = 80;
    wrap.append(span, input);
    return wrap;
  }

  // Formulario de correo y contraseña para usuarios que navegan el portal.
  function buildEmailForm() {
    var form = document.createElement('form');
    form.className = 'bq-auth-form';

    var tabs = document.createElement('div');
    tabs.className = 'bq-auth-tabs';
    tabs.setAttribute('role', 'tablist');
    [['login', 'Entrar'], ['register', 'Crear cuenta']].forEach(function (pair) {
      var tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'bq-auth-tab';
      tab.dataset.mode = pair[0];
      tab.setAttribute('role', 'tab');
      tab.textContent = pair[1];
      tab.addEventListener('click', function () { setEmailMode(pair[0]); });
      tabs.appendChild(tab);
    });

    var submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'bq-auth-submit';

    var forgot = document.createElement('button');
    forgot.type = 'button';
    forgot.className = 'bq-auth-forgot';
    forgot.textContent = '¿Olvidaste tu contraseña?';
    forgot.addEventListener('click', handlePasswordReset);

    form.append(
      tabs,
      field('text', 'name', 'Nombre', 'name'),
      field('email', 'email', 'Correo electrónico', 'email'),
      field('password', 'password', 'Contraseña (mínimo 8 caracteres)', 'current-password'),
      submit,
      forgot
    );
    form.addEventListener('submit', handleEmailSubmit);
    return form;
  }

  function setEmailMode(mode) {
    emailMode = mode === 'register' ? 'register' : 'login';
    if (!emailForm) return;
    var isRegister = emailMode === 'register';
    Array.prototype.forEach.call(emailForm.querySelectorAll('.bq-auth-tab'), function (tab) {
      var active = tab.dataset.mode === emailMode;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    var nameField = emailForm.querySelector('[data-field="name"]');
    nameField.hidden = !isRegister;
    nameField.querySelector('input').required = isRegister;
    emailForm.querySelector('input[name="password"]').autocomplete = isRegister ? 'new-password' : 'current-password';
    emailForm.querySelector('.bq-auth-submit').textContent = isRegister ? 'Crear mi cuenta' : 'Entrar';
    emailForm.querySelector('.bq-auth-forgot').hidden = isRegister;
    setMessage('', false);
  }

  function friendlyAuthError(error) {
    var code = error && error.code;
    if (code === 'auth/operation-not-allowed') return 'El acceso con correo todavía no está habilitado. Usá Google o intentá más tarde.';
    if (code === 'auth/network-request-failed') return 'Sin conexión con el servicio de acceso. Revisá tu internet.';
    return (error && error.message) || 'No se pudo completar la operación. Inténtalo de nuevo.';
  }

  function setFormBusy(busy) {
    if (emailForm) {
      Array.prototype.forEach.call(emailForm.querySelectorAll('button, input'), function (el) { el.disabled = busy; });
    }
    if (googleBtn) googleBtn.disabled = busy;
  }

  async function handleEmailSubmit(event) {
    event.preventDefault();
    if (!emailForm.reportValidity()) return;
    var name = emailForm.querySelector('input[name="name"]').value.trim();
    var email = emailForm.querySelector('input[name="email"]').value.trim();
    var password = emailForm.querySelector('input[name="password"]').value;
    setFormBusy(true);
    setMessage(emailMode === 'register' ? 'Creando tu cuenta…' : 'Verificando tus datos…', true);
    try {
      var session = await waitForSession();
      if (!session) throw new Error('El servicio de sesión no cargó. Recargá la página.');
      if (emailMode === 'register') {
        await session.register(email, password, name);
        setMessage('¡Cuenta creada! Te enviamos un correo para verificar tu dirección.', true);
      } else {
        await session.login(email, password);
        setMessage('', false);
      }
      emailForm.querySelector('input[name="password"]').value = '';
    } catch (error) {
      setMessage(friendlyAuthError(error), false);
    } finally {
      setFormBusy(false);
    }
  }

  async function handlePasswordReset() {
    var emailInput = emailForm.querySelector('input[name="email"]');
    if (!emailInput.value.trim() || !emailInput.checkValidity()) {
      emailInput.focus();
      setMessage('Escribí tu correo arriba y tocá de nuevo "¿Olvidaste tu contraseña?".', true);
      return;
    }
    setFormBusy(true);
    try {
      var session = await waitForSession();
      if (!session || typeof session.resetPassword !== 'function') throw new Error('El servicio de sesión no cargó. Recargá la página.');
      await session.resetPassword(emailInput.value.trim());
      setMessage('Si existe una cuenta con ese correo, te llegará un enlace para crear una nueva contraseña.', true);
    } catch (error) {
      setMessage(friendlyAuthError(error), false);
    } finally {
      setFormBusy(false);
    }
  }

  async function handleGoogleLogin() {
    googleBtn.disabled = true;
    setMessage('Abriendo la ventana segura de Google…', true);
    try {
      var session = await waitForSession();
      if (session && typeof session.loginWithGoogle === 'function') {
        await session.loginWithGoogle();
      } else {
        // Respaldo: llamada directa al SDK si user-session.js no cargó.
        var provider = new window.firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        await window.firebase.auth().signInWithPopup(provider);
      }
      setMessage('', false);
    } catch (error) {
      setMessage((error && error.message) || 'No se pudo iniciar sesión. Inténtalo de nuevo.', false);
    } finally {
      googleBtn.disabled = false;
    }
  }

  function setText(selector, value) {
    var node = document.querySelector(selector);
    if (node && value) node.textContent = value;
  }

  // Sustituye los datos de ejemplo de la tarjeta por los de la cuenta real.
  function renderUser(user) {
    var name = (user.displayName || user.email || 'Explorador').trim();
    setProfileField('name', name);
    setProfileField('first-name', name.split(/\s+/)[0]);
    setProfileField('email', user.email || '');
    setProfileField('since', formatDate(user.metadata && user.metadata.creationTime, false));
    setProfileField('last-login', formatDate(user.metadata && user.metadata.lastSignInTime, true));

    if (typeof user.photoURL === 'string' && user.photoURL.indexOf('https://') === 0) {
      Array.prototype.forEach.call(document.querySelectorAll('.prof-avatar-img, [data-profile-avatar]'), function (img) {
        img.src = user.photoURL;
        img.alt = name;
        img.referrerPolicy = 'no-referrer';
      });
    }

    var info = document.querySelector('.prof-user-info');
    if (info && !document.getElementById('bq-auth-logout')) {
      var logout = document.createElement('button');
      logout.type = 'button';
      logout.id = 'bq-auth-logout';
      logout.className = 'bq-auth-logout';
      logout.textContent = 'Cerrar sesión';
      logout.addEventListener('click', handleLogout);
      info.appendChild(logout);
    }
  }

  async function handleLogout() {
    try {
      var session = await waitForSession();
      if (session && typeof session.logout === 'function') await session.logout();
      else await window.firebase.auth().signOut();
    } catch (error) {
      console.warn('[Baqueano Auth] Error al cerrar sesión:', error && error.message);
    }
  }

  function onAuthChanged(user) {
    if (user) {
      if (panel) panel.hidden = true;
      setPrivateSectionsHidden(false);
      renderUser(user);
    } else {
      if (panel) panel.hidden = false;
      setPrivateSectionsHidden(true);
      resetProfileFields();
      var logout = document.getElementById('bq-auth-logout');
      if (logout) logout.remove();
    }
  }

  function init() {
    if (!window.firebase || !window.firebase.auth) {
      // Falla cerrada: sin servicio de acceso no se muestra ningún perfil.
      console.warn('[Baqueano Auth] SDK de Firebase Auth no disponible; perfil oculto.');
      setPrivateSectionsHidden(true);
      buildPanel();
      setFormBusy(true);
      setMessage('No pudimos conectar con el servicio de acceso. Revisá tu conexión y recargá la página.', false);
      return;
    }
    try {
      if (!window.firebase.apps.length && window.BaqueanoFirebase && window.BaqueanoFirebase.config) {
        window.firebase.initializeApp(window.BaqueanoFirebase.config);
      }
      buildPanel();
      // Estado inicial: oculto hasta que Firebase confirme si hay sesión,
      // evitando parpadeos entre panel y perfil.
      panel.hidden = true;
      window.firebase.auth().onAuthStateChanged(onAuthChanged);
    } catch (error) {
      console.error('[Baqueano Auth] No se pudo iniciar el panel de acceso:', error);
      // Falla cerrada: el perfil sigue oculto y el panel explica qué pasó.
      setPrivateSectionsHidden(true);
      if (!panel) buildPanel();
      panel.hidden = false;
      setMessage('No pudimos verificar tu sesión. Recargá la página para intentarlo de nuevo.', false);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})(window, document);
