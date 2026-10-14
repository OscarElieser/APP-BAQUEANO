/**
 * ============================================================================
 * 🔐 BAQUEANO — INICIAR SESIÓN / CREAR CUENTA SOBRE LA PÁGINA (auth-modal.js)
 * ============================================================================
 * 🎯 POR QUÉ:
 * - Pedido del propietario (2026-10-14): al tocar «Iniciar sesión» el acceso debe
 *   aparecer encima de la página en la que esté la persona, sin llevarla a otra.
 *   Solo Google y cuenta propia (correo + contraseña); sin Facebook.
 *
 * ⚙️ CÓMO:
 * - <dialog> nativo con showModal(): capa superior, foco atrapado, Esc para cerrar
 *   y devolución del foco al botón que lo abrió. El fondo (::backdrop) desenfoca
 *   la página actual; la tarjeta es de vidrio (paleta oficial BAQUEANO).
 * - Usa la API existente window.BaqueanoSession (js/user-session.js): loadAuth(),
 *   login(), register(), resetPassword(), loginWithGoogle(). No duplica lógica de
 *   Firebase ni guarda contraseñas: Firebase Authentication las procesa.
 * - Se abre con cualquier elemento [data-bq-login] (valor "signin" o "signup") o
 *   con window.BaqueanoAuthModal.open('signup'). Sin JavaScript, esos enlaces siguen
 *   llevando a perfil.html (mejora progresiva).
 * - Textos de los catálogos (authModal.*, auth.*) en los 8 idiomas; se repintan al
 *   cambiar de idioma. Todo se construye con createElement/textContent.
 * - Responsive: tarjeta de hasta 440 px; en teléfonos ocupa el ancho con margen y
 *   se desplaza si el teclado reduce el alto.
 *
 * 📦 QUÉ: window.BaqueanoAuthModal = { open(mode), close() }.
 * ============================================================================
 */
(function (window, document) {
  'use strict';
  if (window.BaqueanoAuthModal) return;

  var LOGO = 'assets/images/LOGOS/baqueano_icono_2000x2000-blanco.png';
  var state = { mode: 'signin', busy: false, opener: null, dialog: null, nodes: {} };

  function t(key, fallback, params) {
    try {
      var L = window.BaqueanoLanguage;
      var value = L && L.t ? L.t(key, Object.assign({ fallback: fallback }, params || {})) : '';
      return value || String(fallback).replace(/\{(\w+)\}/g, function (_, k) { return params && params[k] != null ? params[k] : ''; });
    } catch (_) { return fallback; }
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      var value = attrs[key];
      if (value == null || value === false) return;
      if (key === 'text') node.textContent = value;
      else if (key === 'className') node.className = value;
      else if (key.indexOf('on') === 0 && typeof value === 'function') node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value === true ? '' : String(value));
    });
    (children || []).forEach(function (child) { if (child != null && child !== false) node.append(child); });
    return node;
  }
  // Íconos en SVG propio: se ven aunque la hoja de Font Awesome tarde o no cargue.
  var PATHS = {
    close: ['M6 6l12 12', 'M18 6L6 18'],
    eye: ['M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
    eyeOff: ['M3 3l18 18', 'M10.6 5.1A10.4 10.4 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2', 'M6.6 6.6C3.9 8.4 2 12 2 12s3.6 7 10 7a9.9 9.9 0 0 0 5.4-1.6', 'M9.9 9.9a3 3 0 0 0 4.2 4.2']
  };
  function svgIcon(name) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    PATHS[name].forEach(function (d) { var path = document.createElementNS(ns, 'path'); path.setAttribute('d', d); svg.appendChild(path); });
    return svg;
  }

  // Logo oficial de Google (marca multicolor, sin texto).
  function googleMark() {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 48 48');
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    svg.setAttribute('aria-hidden', 'true');
    [
      ['#FFC107', 'M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z'],
      ['#FF3D00', 'M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z'],
      ['#4CAF50', 'M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z'],
      ['#1976D2', 'M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z']
    ].forEach(function (part) {
      var path = document.createElementNS(ns, 'path');
      path.setAttribute('fill', part[0]);
      path.setAttribute('d', part[1]);
      svg.appendChild(path);
    });
    return svg;
  }

  // ── Construcción ──────────────────────────────────────────────────────────
  function field(id, type, autocomplete, extra) {
    var input = el('input', Object.assign({ id: id, name: id, type: type, autocomplete: autocomplete, required: true, className: 'bq-auth-input', placeholder: ' ' }, extra || {}));
    var label = el('label', { for: id, className: 'bq-auth-label' });
    var wrap = el('div', { className: 'bq-auth-field' }, [input, label]);
    return { wrap: wrap, input: input, label: label };
  }

  function build() {
    var n = state.nodes;
    n.title = el('h2', { id: 'bqAuthTitle', className: 'bq-auth-title' });
    n.subtitle = el('p', { className: 'bq-auth-subtitle' });
    n.switchText = el('span');
    n.switchLink = el('button', { type: 'button', className: 'bq-auth-switch-link', onclick: function () { setMode(state.mode === 'signin' ? 'signup' : 'signin'); } });
    n.close = el('button', { type: 'button', className: 'bq-auth-close', onclick: close }, [svgIcon('close')]);

    n.name = field('bqAuthName', 'text', 'name', { maxlength: 80 });
    n.email = field('bqAuthEmail', 'email', 'email', { inputmode: 'email', maxlength: 160 });
    n.password = field('bqAuthPassword', 'password', 'current-password', { minlength: 8, maxlength: 128 });
    n.eye = el('button', { type: 'button', className: 'bq-auth-eye', onclick: togglePassword }, [svgIcon('eye')]);
    n.password.wrap.appendChild(n.eye);
    n.hint = el('p', { className: 'bq-auth-hint', id: 'bqAuthPasswordHint' });
    n.password.input.setAttribute('aria-describedby', 'bqAuthPasswordHint');

    n.forgot = el('button', { type: 'button', className: 'bq-auth-forgot', onclick: forgotPassword });
    n.terms = el('input', { type: 'checkbox', id: 'bqAuthTerms', className: 'bq-auth-check' });
    n.termsText = el('span');
    n.termsRow = el('label', { className: 'bq-auth-terms', for: 'bqAuthTerms' }, [n.terms, n.termsText]);

    n.submit = el('button', { type: 'submit', className: 'bq-auth-submit' });
    n.status = el('p', { className: 'bq-auth-status', role: 'status', 'aria-live': 'polite' });
    n.orText = el('span');
    n.or = el('div', { className: 'bq-auth-or', 'aria-hidden': 'true' }, [n.orText]);
    n.googleText = el('span');
    n.google = el('button', { type: 'button', className: 'bq-auth-google', onclick: google }, [googleMark(), n.googleText]);
    n.secure = el('p', { className: 'bq-auth-secure' });

    n.form = el('form', { className: 'bq-auth-form', novalidate: true, onsubmit: submit }, [
      n.name.wrap, n.email.wrap, n.password.wrap, n.hint, n.forgot, n.termsRow, n.submit, n.status
    ]);

    var card = el('div', { className: 'bq-auth-card' }, [
      n.close,
      el('img', { className: 'bq-auth-logo', src: LOGO, alt: '', width: 56, height: 56, decoding: 'async' }),
      n.title,
      el('p', { className: 'bq-auth-switch' }, [n.switchText, ' ', n.switchLink]),
      n.subtitle,
      n.form,
      n.or,
      n.google,
      n.secure
    ]);
    var dialog = el('dialog', { className: 'bq-auth-dialog', 'aria-labelledby': 'bqAuthTitle', 'data-no-translate': true }, [card]);
    dialog.addEventListener('click', function (event) { if (event.target === dialog) close(); });
    dialog.addEventListener('close', function () {
      document.documentElement.classList.remove('bq-auth-open');
      if (state.opener && state.opener.focus) state.opener.focus();
    });
    dialog.addEventListener('cancel', function (event) { if (state.busy) event.preventDefault(); });
    document.body.appendChild(dialog);
    state.dialog = dialog;
  }

  function termsNode() {
    var a1 = el('a', { href: 'terminos.html', target: '_blank', rel: 'noopener', text: t('auth.termsLink', 'términos') });
    var a2 = el('a', { href: 'privacidad.html', target: '_blank', rel: 'noopener', text: t('auth.privacyLink', 'políticas de privacidad') });
    return [t('auth.acceptTermsPrefix', 'Acepto los'), ' ', a1, ' ', t('auth.acceptTermsMiddle', 'y las'), ' ', a2];
  }

  function paint() {
    var n = state.nodes;
    var signup = state.mode === 'signup';
    n.title.textContent = signup ? t('authModal.titleSignup', 'Crear cuenta') : t('authModal.titleSignin', 'Iniciar sesión');
    n.switchText.textContent = signup ? t('authModal.haveAccount', '¿Ya tenés cuenta?') : t('authModal.noAccount', '¿No tenés cuenta?');
    n.switchLink.textContent = signup ? t('authModal.signinLink', 'Iniciá sesión') : t('authModal.createOne', 'Creá una');
    n.subtitle.textContent = t('authModal.subtitle', 'Guardá favoritos, armá tu viaje y contactá a cada negocio desde tu cuenta BAQUEANO.');
    n.close.setAttribute('aria-label', t('authModal.close', 'Cerrar'));
    n.name.label.textContent = t('authModal.name', 'Nombre completo');
    n.email.label.textContent = t('authModal.email', 'Correo electrónico');
    n.password.label.textContent = t('authModal.password', 'Contraseña');
    n.hint.textContent = t('authModal.passwordHint', 'Mínimo 8 caracteres.');
    n.forgot.textContent = t('authModal.forgot', '¿Olvidaste tu contraseña?');
    n.termsText.replaceChildren.apply(n.termsText, termsNode());
    n.submit.textContent = state.busy ? t('authModal.working', 'Procesando…') : (signup ? t('authModal.submitSignup', 'Crear mi cuenta') : t('authModal.submitSignin', 'Iniciar sesión'));
    n.orText.textContent = t('authModal.or', 'o continuá con');
    n.googleText.textContent = t('authModal.google', 'Continuar con Google');
    n.secure.textContent = t('authModal.secure', 'Acceso seguro con Firebase Authentication. Nunca vemos tu contraseña.');
    var hidden = n.password.input.type === 'password';
    n.eye.setAttribute('aria-label', hidden ? t('authModal.showPassword', 'Mostrar contraseña') : t('authModal.hidePassword', 'Ocultar contraseña'));
    n.eye.replaceChildren(svgIcon(hidden ? 'eye' : 'eyeOff'));
    // Campos de cada modo: nombre y términos solo al crear cuenta; "olvidé" solo al ingresar.
    n.name.wrap.hidden = !signup;
    n.name.input.required = signup;
    n.termsRow.hidden = !signup;
    n.hint.hidden = !signup;
    n.forgot.hidden = signup;
    n.password.input.setAttribute('autocomplete', signup ? 'new-password' : 'current-password');
    state.dialog.classList.toggle('is-signup', signup);
  }

  function setMode(mode) {
    state.mode = mode === 'signup' ? 'signup' : 'signin';
    setStatus('', '');
    paint();
    var focusTarget = state.mode === 'signup' ? state.nodes.name.input : state.nodes.email.input;
    if (state.dialog.open) window.setTimeout(function () { focusTarget.focus(); }, 30);
  }

  function setStatus(message, kind) {
    var s = state.nodes.status;
    s.textContent = message || '';
    s.className = 'bq-auth-status' + (kind ? ' is-' + kind : '');
  }

  function setBusy(busy) {
    state.busy = busy;
    var n = state.nodes;
    [n.submit, n.google, n.switchLink, n.forgot, n.close].forEach(function (b) { b.disabled = busy; });
    n.form.setAttribute('aria-busy', busy ? 'true' : 'false');
    paint();
  }

  function togglePassword() {
    var input = state.nodes.password.input;
    input.type = input.type === 'password' ? 'text' : 'password';
    paint();
    input.focus();
  }

  // ── Errores en el idioma activo (por código de Firebase) ─────────────────
  function errorMessage(error) {
    var code = error && error.code;
    var map = {
      'auth/invalid-credential': ['auth.errors.invalidCredentials', 'Correo o clave incorrectos.'],
      'auth/wrong-password': ['auth.errors.invalidCredentials', 'Correo o clave incorrectos.'],
      'auth/user-not-found': ['auth.errors.invalidCredentials', 'Correo o clave incorrectos.'],
      'auth/invalid-email': ['authModal.errors.invalidEmail', 'El correo no tiene un formato válido.'],
      'auth/email-already-in-use': ['auth.errors.emailInUse', 'Ya existe una cuenta con ese correo. Iniciá sesión.'],
      'auth/weak-password': ['auth.errors.passwordLength', 'La clave debe tener al menos 8 caracteres.'],
      'auth/too-many-requests': ['auth.errors.tooManyRequests', 'Demasiados intentos. Esperá unos minutos y probá otra vez.'],
      'auth/popup-closed-by-user': ['authModal.errors.popupClosed', 'Cerraste la ventana de Google antes de terminar.'],
      'auth/cancelled-popup-request': ['authModal.errors.popupClosed', 'Cerraste la ventana de Google antes de terminar.'],
      'auth/popup-blocked': ['authModal.errors.popupBlocked', 'El navegador bloqueó la ventana de Google. Permití ventanas emergentes e intentá de nuevo.'],
      'auth/unauthorized-domain': ['authModal.errors.unauthorizedDomain', 'Este sitio todavía no está autorizado para entrar con Google. Usá tu correo y contraseña.'],
      'auth/network-request-failed': ['authModal.errors.unavailable', 'No pudimos conectar con el servicio de acceso. Revisá tu conexión e intentá de nuevo.']
    };
    var entry = map[code];
    return entry ? t(entry[0], entry[1]) : t('auth.errors.generic', 'No fue posible completar el acceso.');
  }

  function session() {
    var S = window.BaqueanoSession;
    if (!S || typeof S.login !== 'function') return Promise.reject(Object.assign(new Error('sin sesión'), { code: 'auth/network-request-failed' }));
    var ready = typeof S.loadAuth === 'function' ? S.loadAuth() : Promise.resolve(true);
    return Promise.resolve(ready).then(function (ok) {
      if (ok === false || !(window.firebase && window.firebase.auth)) throw Object.assign(new Error('sin Firebase'), { code: 'auth/network-request-failed' });
      return S;
    });
  }

  function firstName(user, fallback) {
    var name = (user && (user.name || user.displayName)) || fallback || '';
    return String(name).trim().split(/\s+/)[0] || '';
  }

  function done(user, created) {
    var name = firstName(user, state.nodes.name.input.value);
    var message = created
      ? t('authModal.created', '¡Cuenta creada, {name}! Te enviamos un correo para verificarla.', { name: name })
      : t('authModal.welcome', '¡Hola, {name}! Iniciaste sesión.', { name: name });
    state.nodes.password.input.value = '';
    close();
    if (window.bqToast) window.bqToast(message, 'success');
  }

  function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value); }

  function submit(event) {
    event.preventDefault();
    if (state.busy) return;
    var n = state.nodes;
    var signup = state.mode === 'signup';
    var name = n.name.input.value.trim();
    var email = n.email.input.value.trim();
    var password = n.password.input.value;
    if (signup && !name) { setStatus(t('authModal.errors.nameRequired', 'Escribí tu nombre.'), 'error'); n.name.input.focus(); return; }
    if (!validEmail(email)) { setStatus(t('authModal.errors.invalidEmail', 'El correo no tiene un formato válido.'), 'error'); n.email.input.focus(); return; }
    if (password.length < 8) { setStatus(t('auth.errors.passwordLength', 'La clave debe tener al menos 8 caracteres.'), 'error'); n.password.input.focus(); return; }
    if (signup && !n.terms.checked) { setStatus(t('auth.errors.acceptTerms', 'Debés aceptar términos y privacidad para crear la cuenta.'), 'error'); n.terms.focus(); return; }
    setStatus('', '');
    setBusy(true);
    session()
      .then(function (S) { return signup ? S.register(email, password, name) : S.login(email, password); })
      .then(function (user) { setBusy(false); done(user, signup); })
      .catch(function (error) { setBusy(false); setStatus(errorMessage(error), 'error'); });
  }

  function google() {
    if (state.busy) return;
    setStatus('', '');
    setBusy(true);
    session()
      .then(function (S) { return S.loginWithGoogle(); })
      .then(function (user) { setBusy(false); done(user, false); })
      .catch(function (error) { setBusy(false); setStatus(errorMessage(error), 'error'); });
  }

  function forgotPassword() {
    if (state.busy) return;
    var email = state.nodes.email.input.value.trim();
    if (!validEmail(email)) { setStatus(t('authModal.errors.resetNeedsEmail', 'Escribí tu correo para enviarte el enlace.'), 'error'); state.nodes.email.input.focus(); return; }
    setBusy(true);
    session()
      .then(function (S) { return S.resetPassword(email); })
      .then(function () { setBusy(false); setStatus(t('authModal.resetSent', 'Si el correo está registrado, te enviamos un enlace para crear una nueva contraseña.'), 'success'); })
      .catch(function (error) { setBusy(false); setStatus(errorMessage(error), 'error'); });
  }

  // ── Abrir / cerrar ────────────────────────────────────────────────────────
  function open(mode, opener) {
    if (!state.dialog) build();
    state.opener = opener || document.activeElement;
    state.nodes.status.textContent = '';
    setMode(mode);
    document.documentElement.classList.add('bq-auth-open');
    if (typeof state.dialog.showModal === 'function') { if (!state.dialog.open) state.dialog.showModal(); }
    else state.dialog.setAttribute('open', '');
    // Precarga Firebase mientras la persona escribe (no bloquea).
    try { if (window.BaqueanoSession && window.BaqueanoSession.loadAuth) window.BaqueanoSession.loadAuth(); } catch (_) {}
    window.setTimeout(function () { (state.mode === 'signup' ? state.nodes.name.input : state.nodes.email.input).focus(); }, 40);
  }

  function close() {
    if (!state.dialog || state.busy) return;
    if (typeof state.dialog.close === 'function' && state.dialog.open) state.dialog.close();
    else state.dialog.removeAttribute('open');
  }

  function isSignedIn() {
    try { var u = window.BaqueanoSession && window.BaqueanoSession.getUser(); return Boolean(u && u.email); } catch (_) { return false; }
  }

  // Delegación: cualquier [data-bq-login] (incluidos los que pinta user-session.js).
  document.addEventListener('click', function (event) {
    var trigger = event.target && event.target.closest ? event.target.closest('[data-bq-login]') : null;
    if (!trigger || isSignedIn()) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) return; // abrir en pestaña nueva sigue funcionando
    event.preventDefault();
    var menu = trigger.closest('.bq-mobile-drawer, .bq-drawer, [data-bq-drawer]');
    if (menu && window.BaqueanoNavigation && window.BaqueanoNavigation.closeDrawer) { try { window.BaqueanoNavigation.closeDrawer(); } catch (_) {} }
    open(trigger.getAttribute('data-bq-login') === 'signup' ? 'signup' : 'signin', trigger);
  }, true);

  ['baqueano:languageChanged', 'baqueano:i18nReady'].forEach(function (type) {
    window.addEventListener(type, function () { if (state.dialog) paint(); });
  });

  window.BaqueanoAuthModal = Object.freeze({ open: function (mode) { open(mode); }, close: close });
}(window, document));
