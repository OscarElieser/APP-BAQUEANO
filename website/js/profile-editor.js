// ============================================================================
// 🧭 BAQUEANO — EDITOR DEL PERFIL DEL VIAJERO (perfil.html)
// ============================================================================
// 🎯 POR QUÉ: el propietario reportó (2026-10-07) que "el usuario no puede editar su perfil en
//    ningún lugar". Los botones "Editar" solo recargaban la página y los datos decían siempre
//    "Sin completar".
// ⚙️ CÓMO:
//    - Fuente única: Supabase public.traveler_profiles mediante la Edge Function baqueano-profile
//      (token de Firebase verificado en el servidor; nada se guarda en el navegador).
//    - Diálogos nativos <dialog> accesibles: "Información personal", "Salud y accesibilidad" y
//      "Foto". Idioma, moneda, intereses y permisos se guardan al cambiarlos.
//    - ?editar=datos|idioma|accesibilidad|foto abre la sección correspondiente (enlaces existentes).
//    - Los valores se escriben con textContent (sin innerHTML con datos del usuario).
//    - Al tener valor, el nodo deja de llevar data-i18n (si no, el motor de idioma lo pisaría con
//      "Sin completar"); al vaciarse, recupera la clave y su traducción.
//    - Foto: se reduce en el navegador a 320×320 WebP (JPEG si no hay WebP) antes de enviarla; el
//      servidor vuelve a validar formato real y tamaño.
// 📦 QUÉ: window.BaqueanoProfileEditor = { open(section), reload() }.
// ============================================================================
(function (window, document) {
  'use strict';
  if (window.BaqueanoProfileEditor) return;

  var ENDPOINT = 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-profile';
  var LANGS = [['es', '🇳🇮 Español'], ['en', '🇺🇸 English'], ['fr', '🇫🇷 Français'], ['it', '🇮🇹 Italiano'], ['pt', '🇧🇷 Português'], ['de', '🇩🇪 Deutsch']];
  var state = { user: null, profile: null, busy: false, dialog: null, lastFocus: null, interestTimer: null };

  function t(key, fallback, vars) {
    var text = fallback;
    try { if (window.BaqueanoLanguage && window.BaqueanoLanguage.t) text = window.BaqueanoLanguage.t(key, { fallback: fallback }) || fallback; } catch (_) { text = fallback; }
    if (vars) Object.keys(vars).forEach(function (k) { text = text.split('{' + k + '}').join(String(vars[k])); });
    return text;
  }
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') node.textContent = attrs[k];
      else if (k === 'class') node.className = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }
  function firebaseUser() {
    try { return window.firebase && window.firebase.auth ? window.firebase.auth().currentUser : null; } catch (_) { return null; }
  }

  // ---------------------------------------------------------------- servidor
  function call(action, payload) {
    var u = firebaseUser();
    if (!u) return Promise.reject(new Error(t('profileEditor.loginRequired', 'Iniciá sesión para editar tu perfil.')));
    return u.getIdToken().then(function (token) {
      return fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json', 'x-firebase-token': token }, body: JSON.stringify(Object.assign({ action: action }, payload || {})) });
    }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (data) {
        if (!res.ok || !data || !data.ok) throw new Error((data && data.error) || t('profileEditor.saveError', 'No se pudo guardar. Intentá de nuevo.'));
        return data;
      });
    });
  }

  // ---------------------------------------------------------------- avisos
  var toast = null;
  function notify(message, isError) {
    if (!toast) {
      toast = el('div', { class: 'pe-toast', role: 'status', 'aria-live': 'polite' });
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.toggle('is-error', !!isError);
    toast.classList.add('is-visible');
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(function () { toast.classList.remove('is-visible'); }, isError ? 6000 : 3000);
  }

  // ---------------------------------------------------------------- pintar valores
  function setValue(field, value) {
    document.querySelectorAll('[data-pe="' + field + '"]').forEach(function (node) {
      if (!node.hasAttribute('data-pe-key')) node.setAttribute('data-pe-key', node.getAttribute('data-i18n') || '');
      if (value) {
        node.removeAttribute('data-i18n');
        node.textContent = value;
        node.classList.add('pe-filled');
      } else {
        var key = node.getAttribute('data-pe-key');
        if (key) {
          node.setAttribute('data-i18n', key);
          try { if (window.BaqueanoLanguage && window.BaqueanoLanguage.translateElement) window.BaqueanoLanguage.translateElement(node); } catch (_) { /* sin motor */ }
        }
        node.classList.remove('pe-filled');
      }
    });
  }
  function languageName(code) {
    for (var i = 0; i < LANGS.length; i += 1) if (LANGS[i][0] === code) return LANGS[i][1].replace(/^\S+\s/, '');
    return '';
  }
  function render() {
    var p = state.profile || {};
    var location = [p.city, p.country].filter(Boolean).join(', ');
    setValue('phone', p.phone || '');
    setValue('location', location);
    setValue('emergency', p.emergency_contact || '');
    setValue('dietary', p.dietary || '');
    setValue('accessibility', p.accessibility || '');
    setValue('language-label', p.language ? languageName(p.language) : '');
    setValue('currency-label', p.currency === 'USD' ? '$ Dólar (USD)' : (p.currency ? 'C$ Córdoba (NIO)' : ''));
    if (p.display_name) {
      document.querySelectorAll('[data-profile-field="name"]').forEach(function (node) { node.removeAttribute('data-i18n'); node.textContent = p.display_name; });
    }
    if (p.avatar_url && /^https:\/\//.test(p.avatar_url)) {
      document.querySelectorAll('.prof-avatar-img, [data-profile-avatar]').forEach(function (img) { img.src = p.avatar_url; });
    }
    var lang = document.getElementById('peLanguage');
    if (lang && p.language) lang.value = p.language;
    var cur = document.getElementById('peCurrency');
    if (cur && p.currency) cur.value = p.currency;
    var interests = p.interests || [];
    document.querySelectorAll('.prof-pref-tag[data-interest]').forEach(function (tag) {
      var on = interests.indexOf(tag.getAttribute('data-interest')) !== -1;
      tag.classList.toggle('active', on);
      tag.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var consents = p.consents || {};
    document.querySelectorAll('input[data-consent]').forEach(function (box) { box.checked = consents[box.getAttribute('data-consent')] === true; });
  }

  // ---------------------------------------------------------------- guardar
  function save(patch, okMessage) {
    if (state.busy) return Promise.resolve(false);
    state.busy = true;
    return call('save', patch).then(function (data) {
      state.profile = data.profile;
      render();
      notify(okMessage || t('profileEditor.saved', 'Cambios guardados.'));
      return true;
    }, function (error) {
      notify(error.message, true);
      return false;
    }).then(function (ok) { state.busy = false; return ok; });
  }

  // ---------------------------------------------------------------- diálogos
  function closeDialog() {
    if (!state.dialog) return;
    var d = state.dialog;
    state.dialog = null;
    try { d.close(); } catch (_) { /* ya cerrado */ }
    d.remove();
    if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus();
  }
  function field(id, label, value, opts) {
    opts = opts || {};
    var input = opts.multiline
      ? el('textarea', { id: id, name: id, rows: '3', maxlength: String(opts.max) })
      : el('input', { id: id, name: id, type: opts.type || 'text', maxlength: String(opts.max), autocomplete: opts.autocomplete || 'off' });
    input.value = value || '';
    if (opts.required) input.required = true;
    if (opts.placeholder) input.placeholder = opts.placeholder;
    var hint = opts.hint ? el('small', { class: 'pe-hint', id: id + 'Hint', text: opts.hint }) : null;
    if (hint) input.setAttribute('aria-describedby', id + 'Hint');
    return el('div', { class: 'pe-field' }, [el('label', { for: id, text: label }), input, hint]);
  }
  function openDialog(title, body, onSubmit) {
    closeDialog();
    state.lastFocus = document.activeElement;
    var error = el('p', { class: 'pe-error', role: 'alert' });
    var cancel = el('button', { type: 'button', class: 'pe-btn pe-btn-ghost', text: t('profileEditor.cancel', 'Cancelar') });
    var submit = el('button', { type: 'submit', class: 'pe-btn pe-btn-primary', text: t('profileEditor.save', 'Guardar') });
    var form = el('form', { class: 'pe-form', novalidate: '' }, [body, error, el('div', { class: 'pe-actions' }, [cancel, submit])]);
    var heading = el('h2', { id: 'peDialogTitle', text: title });
    var dialog = el('dialog', { class: 'pe-dialog', 'aria-labelledby': 'peDialogTitle' }, [heading, form]);
    cancel.addEventListener('click', closeDialog);
    dialog.addEventListener('cancel', function (e) { e.preventDefault(); closeDialog(); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      error.textContent = '';
      var invalid = form.querySelector(':invalid');
      if (invalid) { error.textContent = t('profileEditor.fixFields', 'Revisá los campos marcados.'); invalid.focus(); return; }
      submit.disabled = true;
      Promise.resolve(onSubmit(form)).then(function (ok) {
        submit.disabled = false;
        if (ok) closeDialog();
      });
    });
    document.body.appendChild(dialog);
    state.dialog = dialog;
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    var first = form.querySelector('input, textarea, select');
    if (first) first.focus();
  }
  function value(form, id) { var n = form.querySelector('#' + id); return n ? n.value.trim() : ''; }

  function openDatos() {
    var p = state.profile || {};
    var u = firebaseUser() || {};
    var body = el('div', {}, [
      field('peName', t('profileEditor.name', 'Nombre completo'), p.display_name || u.displayName || '', { max: 120, required: true, autocomplete: 'name' }),
      field('pePhone', t('profileEditor.phone', 'Teléfono'), p.phone, { max: 30, type: 'tel', autocomplete: 'tel', placeholder: '+505 8888 8888' }),
      field('peCity', t('profileEditor.city', 'Ciudad'), p.city, { max: 80, autocomplete: 'address-level2' }),
      field('peCountry', t('profileEditor.country', 'País'), p.country, { max: 80, autocomplete: 'country-name' }),
      field('peEmergency', t('profileEditor.emergency', 'Contacto de emergencia (nombre y teléfono)'), p.emergency_contact, { max: 120 })
    ]);
    openDialog(t('profileEditor.titlePersonal', 'Editar información personal'), body, function (form) {
      var name = value(form, 'peName');
      return save({
        display_name: name, phone: value(form, 'pePhone'), city: value(form, 'peCity'),
        country: value(form, 'peCountry'), emergency_contact: value(form, 'peEmergency')
      }).then(function (ok) {
        // El nombre también se actualiza en la cuenta para que el menú lo muestre igual.
        var user = firebaseUser();
        if (ok && user && user.updateProfile && name && name !== user.displayName) user.updateProfile({ displayName: name }).catch(function () { /* el perfil ya quedó guardado */ });
        return ok;
      });
    });
  }
  function openAccesibilidad() {
    var p = state.profile || {};
    var body = el('div', {}, [
      el('p', { class: 'pe-note', text: t('profileEditor.privateNote', 'Solo vos y el equipo de BAQUEANO pueden ver estos datos. Se comparten únicamente con tu autorización (por ejemplo, en una reserva o una emergencia).') }),
      field('peDietary', t('profileEditor.dietary', 'Alergias o restricciones alimentarias'), p.dietary, { max: 300, multiline: true }),
      field('peAccessibility', t('profileEditor.accessibility', 'Necesidades de accesibilidad'), p.accessibility, { max: 300, multiline: true }),
      field('peEmergency2', t('profileEditor.emergency', 'Contacto de emergencia (nombre y teléfono)'), p.emergency_contact, { max: 120 })
    ]);
    openDialog(t('profileEditor.titleHealth', 'Salud, accesibilidad y bienestar'), body, function (form) {
      return save({ dietary: value(form, 'peDietary'), accessibility: value(form, 'peAccessibility'), emergency_contact: value(form, 'peEmergency2') });
    });
  }
  function resizeImage(file) {
    return new Promise(function (resolve, reject) {
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return reject(new Error(t('profileEditor.photoType', 'Elegí una imagen JPG, PNG o WebP.')));
      if (file.size > 15 * 1024 * 1024) return reject(new Error(t('profileEditor.photoBig', 'La imagen supera 15 MB.')));
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var size = 320;
        var side = Math.min(img.naturalWidth, img.naturalHeight);
        var canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        canvas.getContext('2d').drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size);
        URL.revokeObjectURL(url);
        var data = canvas.toDataURL('image/webp', 0.85);
        if (data.indexOf('data:image/webp') !== 0) data = canvas.toDataURL('image/jpeg', 0.85);
        resolve(data);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error(t('profileEditor.photoBroken', 'No pudimos leer esa imagen.'))); };
      img.src = url;
    });
  }
  function openFoto() {
    var preview = el('img', { class: 'pe-photo-preview', alt: '', width: '120', height: '120' });
    var current = document.querySelector('.prof-avatar-img');
    preview.src = (state.profile && state.profile.avatar_url) || (current && current.src) || 'assets/images/logo.png';
    var input = el('input', { id: 'pePhoto', type: 'file', accept: 'image/jpeg,image/png,image/webp' });
    var prepared = { data: null };
    input.addEventListener('change', function () {
      var file = input.files && input.files[0];
      if (!file) return;
      resizeImage(file).then(function (data) { prepared.data = data; preview.src = data; }, function (err) { prepared.data = null; notify(err.message, true); });
    });
    var children = [
      el('div', { class: 'pe-photo-row' }, [preview, el('div', { class: 'pe-field' }, [el('label', { for: 'pePhoto', text: t('profileEditor.photoChoose', 'Elegí una foto (JPG, PNG o WebP)') }), input,
        el('small', { class: 'pe-hint', text: t('profileEditor.photoHint', 'La recortamos en cuadrado y la reducimos antes de subirla.') })])])
    ];
    var removeBtn = null;
    if (state.profile && state.profile.avatar_url) {
      removeBtn = el('button', { type: 'button', class: 'pe-btn pe-btn-ghost pe-btn-danger', text: t('profileEditor.photoRemove', 'Quitar mi foto') });
      children.push(removeBtn);
    }
    openDialog(t('profileEditor.titlePhoto', 'Cambiar foto de perfil'), el('div', {}, children), function () {
      if (!prepared.data) { notify(t('profileEditor.photoMissing', 'Primero elegí una imagen.'), true); return false; }
      return call('avatar', { image: prepared.data }).then(function (data) {
        state.profile = data.profile; render(); notify(t('profileEditor.photoSaved', 'Foto actualizada.')); return true;
      }, function (err) { notify(err.message, true); return false; });
    });
    if (removeBtn) removeBtn.addEventListener('click', function () {
      call('avatar_remove').then(function (data) {
        state.profile = data.profile;
        var user = firebaseUser();
        document.querySelectorAll('.prof-avatar-img, [data-profile-avatar]').forEach(function (img) { img.src = (user && user.photoURL) || 'assets/images/logo.png'; });
        render(); closeDialog(); notify(t('profileEditor.photoRemoved', 'Foto quitada.'));
      }, function (err) { notify(err.message, true); });
    });
  }
  function openIdioma() {
    var select = document.getElementById('peLanguage');
    if (select) { select.scrollIntoView({ block: 'center', behavior: 'smooth' }); select.focus({ preventScroll: true }); }
  }
  var OPENERS = { datos: openDatos, accesibilidad: openAccesibilidad, foto: openFoto, idioma: openIdioma };
  function open(section) {
    if (!firebaseUser()) { notify(t('profileEditor.loginRequired', 'Iniciá sesión para editar tu perfil.'), true); return; }
    (OPENERS[section] || openDatos)();
  }

  // ---------------------------------------------------------------- enlaces y controles existentes
  function bind() {
    document.querySelectorAll('[data-pe-edit]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (!firebaseUser()) return; // sin sesión, el enlace sigue a la página (panel de acceso)
        e.preventDefault();
        open(link.getAttribute('data-pe-edit'));
      });
    });
    var lang = document.getElementById('peLanguage');
    if (lang) {
      // Las 6 lenguas de la plataforma (el HTML traía solo español e inglés).
      LANGS.forEach(function (pair) {
        if (!lang.querySelector('option[value="' + pair[0] + '"]')) lang.appendChild(el('option', { value: pair[0], text: pair[1] }));
      });
      try { if (window.BaqueanoLanguage && window.BaqueanoLanguage.get) lang.value = window.BaqueanoLanguage.get(); } catch (_) { /* sin motor */ }
      lang.addEventListener('change', function () {
        var code = lang.value;
        try { if (window.BaqueanoLanguage && window.BaqueanoLanguage.set) window.BaqueanoLanguage.set(code); } catch (_) { /* sin motor */ }
        if (firebaseUser()) save({ language: code });
      });
    }
    var cur = document.getElementById('peCurrency');
    if (cur) cur.addEventListener('change', function () { if (firebaseUser()) save({ currency: cur.value }); });
    document.querySelectorAll('.prof-pref-tag[data-interest]').forEach(function (tag) {
      tag.setAttribute('role', 'button');
      tag.setAttribute('tabindex', '0');
      tag.setAttribute('aria-pressed', tag.classList.contains('active') ? 'true' : 'false');
      function toggle() {
        if (!firebaseUser()) return;
        var list = ((state.profile && state.profile.interests) || []).slice();
        var key = tag.getAttribute('data-interest');
        var at = list.indexOf(key);
        if (at === -1) list.push(key); else list.splice(at, 1);
        state.profile = Object.assign({}, state.profile || {}, { interests: list });
        render();
        // Varios toques seguidos → un solo guardado.
        window.clearTimeout(state.interestTimer);
        state.interestTimer = window.setTimeout(function () { save({ interests: list }, t('profileEditor.interestsSaved', 'Intereses guardados.')); }, 900);
      }
      tag.addEventListener('click', toggle);
      tag.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    });
    document.querySelectorAll('input[data-consent]').forEach(function (box) {
      box.addEventListener('change', function () {
        if (!firebaseUser()) return;
        var consents = {};
        document.querySelectorAll('input[data-consent]').forEach(function (b) { consents[b.getAttribute('data-consent')] = b.checked; });
        var patch = { consents: consents };
        // Para aparecer en la comunidad hace falta una foto: si no subió una, se usa la de su cuenta de Google.
        var user = firebaseUser();
        if (consents.community && user && user.photoURL && !(state.profile && state.profile.avatar_url)) patch.provider_photo = user.photoURL;
        var message = box.getAttribute('data-consent') === 'community'
          ? (box.checked ? t('profileEditor.communityOn', 'Listo: tu foto aparecerá en "Únete a la comunidad" de Experiencias.') : t('profileEditor.communityOff', 'Tu foto ya no aparecerá en la comunidad.'))
          : t('profileEditor.consentsSaved', 'Preferencias de privacidad guardadas.');
        save(patch, message);
      });
    });
  }

  function load() {
    return call('get').then(function (data) {
      state.profile = data.profile || {};
      render();
      var section = '';
      try { section = new URLSearchParams(window.location.search).get('editar') || ''; } catch (_) { section = ''; }
      if (section && OPENERS[section]) open(section);
    }, function (error) { notify(error.message, true); });
  }

  function start() {
    bind();
    var tries = 0;
    (function waitAuth() {
      if (!(window.firebase && window.firebase.auth)) {
        if (tries++ < 80) window.setTimeout(waitAuth, 100);
        return;
      }
      window.firebase.auth().onAuthStateChanged(function (user) {
        state.user = user || null;
        if (user) load();
        else { state.profile = null; render(); }
      });
    })();
    // Al cambiar de idioma, los valores vacíos vuelven a traducirse y los llenos se conservan.
    window.addEventListener('baqueano:languageChanged', function () { if (state.profile) render(); });
  }

  window.BaqueanoProfileEditor = { open: open, reload: load };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})(window, document);
