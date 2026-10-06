// ============================================================================
// 🧭 BAQUEANO — POSTULACIÓN A LA RED BAQUEANO (business-application.js)
// ============================================================================
// 🎯 POR QUÉ:
// - Había tres formularios de negocio (tarjeta del pie, modal de aliados y "Apply my business") y
//   ninguno dejaba un registro trazable:
//   - uno solo abría WhatsApp;
//   - otro mostraba un alert de éxito;
//   - otro escribía en Firestore sin que el Ops Center lo viera.
// - El propietario pide una solicitud real: guardar en Supabase, código BAQ-BIZ, revisión en el Ops
//   Center, aviso por correo y "Mis solicitudes" para el solicitante. Aprobar no es publicar ni
//   verificar.
//
// ⚙️ CÓMO:
// - Un solo diálogo (<dialog> nativo: foco atrapado, ESC y regreso del foco al botón de origen).
//   Las entradas existentes lo abren con lo que el usuario ya escribió (prefill), sin perderlo.
// - Requiere sesión; el borrador se guarda en sessionStorage mientras inicia sesión y se
//   restaura solo.
// - Envía a la Edge Function baqueano-intake (business_submit), que valida todo y aplica límites.
//   Clave de idempotencia contra el doble envío; el botón se deshabilita mientras envía.
// - Municipios reales desde Supabase. Todo el texto viene de BaqueanoLanguage (6 idiomas) y se
//   repinta al cambiar el idioma sin borrar lo escrito.
//
// 📦 QUÉ:
// - window.BaqueanoBusinessApply = { open(prefill), openMine() }.
// - Atajos: cualquier elemento con [data-biz-apply] abre el formulario y [data-biz-mine] abre
//   "Mis solicitudes".
// ============================================================================
(function (window, document) {
  'use strict';
  if (window.BaqueanoBusinessApply) return;

  var DRAFT_KEY = 'baqueano_biz_apply_draft_v1';
  var CATEGORIES = ['alojamiento', 'restaurante', 'gastronomia', 'guia', 'transporte', 'finca', 'turismo_rural', 'artesania',
    'cultura', 'musica', 'experiencia', 'day_pass', 'alquiler_vehiculos', 'otro'];
  var CATEGORY_ES = {
    alojamiento: 'Alojamiento', restaurante: 'Restaurante', gastronomia: 'Gastronomía', guia: 'Guía turístico', transporte: 'Transporte',
    finca: 'Finca turística', turismo_rural: 'Turismo rural comunitario', artesania: 'Artesanía', cultura: 'Cultura', musica: 'Música',
    experiencia: 'Experiencia', day_pass: 'Day Pass', alquiler_vehiculos: 'Alquiler de vehículos', otro: 'Otro'
  };
  var LANG_NAMES = { es: 'Español', en: 'English', fr: 'Français', it: 'Italiano', pt: 'Português', de: 'Deutsch' };
  var STATUS_ES = {
    submitted: 'Enviada', under_review: 'En revisión', needs_information: 'Necesitamos más información',
    approved: 'Aprobada (aún no publicada)', rejected: 'No aprobada', published: 'Publicada'
  };

  var state = { dialog: null, key: null, opener: null, mode: 'form' };

  function api() { return window.BaqueanoIntake; }
  function t(key, fallback, vars) { return api() ? api().t(key, fallback, vars) : fallback; }
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'text') node.textContent = v;
      else if (k === 'className') node.className = v;
      else if (k.indexOf('on') === 0 && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? '' : String(v));
    });
    (children || []).forEach(function (c) { if (c != null && c !== false) node.append(c); });
    return node;
  }
  function field(id, labelKey, labelEs, input, opts) {
    opts = opts || {};
    var label = el('label', { for: id, className: 'bza-label' }, [t(labelKey, labelEs) + (opts.required ? ' *' : '')]);
    var help = opts.helpKey ? el('p', { className: 'bza-help', id: id + 'Help', text: t(opts.helpKey, opts.helpEs) }) : null;
    // El atributo va en el control real (en la descripción corta el control está dentro de un div con su contador).
    var control = /^(INPUT|SELECT|TEXTAREA)$/.test(input.tagName) ? input : (input.querySelector('input, select, textarea') || input);
    if (help) control.setAttribute('aria-describedby', id + 'Help');
    if (opts.required) control.setAttribute('aria-required', 'true');
    return el('div', { className: 'bza-field' + (opts.wide ? ' is-wide' : '') }, [label, input, help]);
  }
  function input(id, type, max, extra) { return el('input', Object.assign({ id: id, name: id, type: type || 'text', maxlength: max, className: 'bza-input' }, extra || {})); }
  function textarea(id, max, rows) { return el('textarea', { id: id, name: id, maxlength: max, rows: rows || 3, className: 'bza-input' }); }

  function firebaseUser() { return api() ? api().firebaseUser() : null; }

  // ------------------------------------------------------------------ construcción
  function buildForm() {
    var cat = el('select', { id: 'bzaCategory', name: 'bzaCategory', className: 'bza-input' }, [el('option', { value: '', text: t('bizApply.choose', 'Elegí una opción') })]);
    CATEGORIES.forEach(function (c) { cat.append(el('option', { value: c, text: t('bizApply.cat.' + c, CATEGORY_ES[c]) })); });
    var dept = el('select', { id: 'bzaDepartment', name: 'bzaDepartment', className: 'bza-input' }, [el('option', { value: '', text: t('bizApply.choose', 'Elegí una opción') })]);
    api().territories.forEach(function (x) { dept.append(el('option', { value: x.value, text: x.value === 'RACCN' ? t('intake.regionRaccn', x.label) : x.value === 'RACCS' ? t('intake.regionRaccs', x.label) : x.label })); });
    var muni = el('select', { id: 'bzaMunicipality', name: 'bzaMunicipality', className: 'bza-input', disabled: true }, [el('option', { value: '', text: t('ecoReport.municipalityFirst', 'Primero elegí el territorio') })]);
    dept.addEventListener('change', function () {
      muni.replaceChildren(el('option', { value: '', text: t('ecoReport.municipalityLoading', 'Cargando municipios…') }));
      muni.disabled = true;
      if (!dept.value) return;
      api().loadMunicipalities(dept.value).then(function (names) {
        muni.replaceChildren(el('option', { value: '', text: t('ecoReport.municipalityPick', 'Elegí el municipio (opcional)') }));
        names.forEach(function (n) { muni.append(el('option', { value: n, text: n })); });
        muni.disabled = !names.length;
        if (muni.dataset.pending) { muni.value = muni.dataset.pending; delete muni.dataset.pending; }
      });
    });
    var langs = el('div', { className: 'bza-checks', role: 'group', 'aria-labelledby': 'bzaLangsLabel' }, [el('span', { id: 'bzaLangsLabel', className: 'bza-label', text: t('bizApply.languages', 'Idiomas en que atendés') })]);
    Object.keys(LANG_NAMES).forEach(function (code) {
      langs.append(el('label', { className: 'bza-check' }, [el('input', { type: 'checkbox', name: 'bzaLang', value: code }), ' ' + LANG_NAMES[code]]));
    });
    var short = textarea('bzaShort', 300, 2);
    var counter = el('span', { className: 'bza-counter', 'aria-live': 'polite', text: '0 / 300' });
    short.addEventListener('input', function () { counter.textContent = short.value.length + ' / 300'; });

    function section(titleKey, titleEs, children) {
      return el('fieldset', { className: 'bza-section' }, [el('legend', { text: t(titleKey, titleEs) })].concat(children));
    }
    var form = el('form', { id: 'bzaForm', novalidate: true }, [
      section('bizApply.secBusiness', 'Tu negocio', [
        field('bzaName', 'bizApply.name', 'Nombre del negocio o cooperativa', input('bzaName', 'text', 160, { autocomplete: 'organization' }), { required: true }),
        field('bzaTrade', 'bizApply.tradeName', 'Nombre comercial (si es distinto)', input('bzaTrade', 'text', 160)),
        field('bzaCategory', 'bizApply.category', 'Categoría', cat, { required: true }),
        field('bzaShort', 'bizApply.short', 'Descripción corta', el('div', {}, [short, counter]), { required: true, wide: true, helpKey: 'bizApply.shortHelp', helpEs: 'Entre 20 y 300 caracteres: qué ofrecés y qué lo hace auténtico.' }),
        field('bzaDescription', 'bizApply.description', 'Descripción completa', textarea('bzaDescription', 4000, 4), { wide: true }),
        field('bzaOfferings', 'bizApply.offerings', 'Qué ofrecés (servicios, productos, experiencias)', textarea('bzaOfferings', 2000, 3), { wide: true }),
        field('bzaAudience', 'bizApply.audience', 'Público al que atendés', input('bzaAudience', 'text', 600))
      ]),
      section('bizApply.secContact', 'Responsable y contacto', [
        field('bzaOwner', 'bizApply.owner', 'Nombre del responsable', input('bzaOwner', 'text', 120, { autocomplete: 'name' }), { required: true }),
        field('bzaRole', 'bizApply.role', 'Cargo', input('bzaRole', 'text', 80)),
        field('bzaEmail', 'bizApply.email', 'Correo electrónico', input('bzaEmail', 'email', 254, { autocomplete: 'email' }), { required: true }),
        field('bzaPhone', 'bizApply.phone', 'Teléfono', input('bzaPhone', 'tel', 40, { autocomplete: 'tel' })),
        field('bzaWhatsapp', 'bizApply.whatsapp', 'WhatsApp', input('bzaWhatsapp', 'tel', 40)),
        field('bzaWebsite', 'bizApply.website', 'Sitio web (https://)', input('bzaWebsite', 'url', 300, { placeholder: 'https://' })),
        field('bzaInstagram', 'bizApply.instagram', 'Instagram', input('bzaInstagram', 'text', 120)),
        field('bzaFacebook', 'bizApply.facebook', 'Facebook', input('bzaFacebook', 'text', 120)),
        field('bzaTiktok', 'bizApply.tiktok', 'TikTok', input('bzaTiktok', 'text', 120))
      ]),
      section('bizApply.secLocation', 'Ubicación', [
        field('bzaDepartment', 'bizApply.department', 'Departamento o región', dept, { required: true }),
        field('bzaMunicipality', 'ecoReport.municipality', 'Municipio', muni),
        field('bzaCommunity', 'bizApply.community', 'Comunidad o comarca', input('bzaCommunity', 'text', 120)),
        field('bzaAddress', 'bizApply.address', 'Dirección o referencia', input('bzaAddress', 'text', 300, { autocomplete: 'street-address' }), { wide: true })
      ]),
      section('bizApply.secOperation', 'Operación', [
        field('bzaSchedule', 'bizApply.schedule', 'Horarios', input('bzaSchedule', 'text', 600)),
        field('bzaSeason', 'bizApply.season', 'Temporada o disponibilidad', input('bzaSeason', 'text', 300)),
        field('bzaCapacity', 'bizApply.capacity', 'Capacidad', input('bzaCapacity', 'text', 120)),
        field('bzaPrice', 'bizApply.price', 'Precios orientativos (moneda, unidad y fecha)', textarea('bzaPrice', 1000, 2), { wide: true, helpKey: 'bizApply.priceHelp', helpEs: 'Ejemplo: C$ 350 por persona, vigente desde octubre 2026. No se publica sin revisión.' }),
        el('div', { className: 'bza-field is-wide' }, [langs])
      ]),
      section('bizApply.secImpact', 'Sostenibilidad e impacto local', [
        field('bzaSustainability', 'bizApply.sustainability', 'Prácticas sostenibles', textarea('bzaSustainability', 2000, 3), { wide: true }),
        field('bzaImpact', 'bizApply.impact', 'Impacto en tu comunidad', textarea('bzaImpact', 2000, 3), { wide: true })
      ]),
      el('div', { className: 'bza-consents' }, [
        el('label', { className: 'bza-check' }, [el('input', { type: 'checkbox', id: 'bzaConsentData' }), ' ', el('span', {}, [t('bizApply.consentData', 'Acepto que BAQUEANO trate estos datos para revisar mi solicitud, según la'), ' ', el('a', { href: 'privacidad.html', target: '_blank', rel: 'noopener', text: t('intake.privacyPolicy', 'Política de Privacidad') }), ' *'])]),
        el('label', { className: 'bza-check' }, [el('input', { type: 'checkbox', id: 'bzaConsentTruth' }), ' ', t('bizApply.consentTruth', 'Confirmo que la información es verdadera y que puedo representar a este negocio.') + ' *']),
        el('label', { className: 'bza-check' }, [el('input', { type: 'checkbox', id: 'bzaConsentContact' }), ' ', t('bizApply.consentContact', 'Acepto que el equipo me contacte por teléfono o WhatsApp sobre esta solicitud.')]),
        el('p', { className: 'bza-help', text: t('bizApply.noCertification', 'Enviar la solicitud no implica aprobación, publicación ni verificación. Cada etapa la decide el equipo de BAQUEANO después de revisarla.') })
      ]),
      el('input', { type: 'text', name: 'website_trap', className: 'bza-trap', tabindex: '-1', autocomplete: 'off', 'aria-hidden': 'true' }),
      el('div', { id: 'bzaStatus', className: 'bza-status', role: 'alert', hidden: true }),
      el('div', { className: 'bza-actions' }, [
        el('button', { type: 'button', className: 'bza-btn-ghost', onclick: close, text: t('bizApply.cancel', 'Cancelar') }),
        el('button', { type: 'submit', id: 'bzaSubmit', className: 'bza-btn-primary', text: t('bizApply.submit', 'Enviar solicitud') })
      ])
    ]);
    form.addEventListener('submit', submit);
    form.addEventListener('input', saveDraft);
    return form;
  }

  function loginPanel() {
    var google = el('button', { type: 'button', className: 'bza-btn-primary', text: t('bizApply.loginGoogle', 'Continuar con Google') });
    google.addEventListener('click', function () {
      var session = window.BaqueanoSession;
      var p = session && typeof session.loginWithGoogle === 'function' ? session.loginWithGoogle()
        : (window.firebase && window.firebase.auth ? window.firebase.auth().signInWithPopup(new window.firebase.auth.GoogleAuthProvider()) : Promise.reject(new Error('auth')));
      Promise.resolve(p).then(function () { setTimeout(render, 300); }).catch(function () {
        var s = document.getElementById('bzaLoginStatus');
        if (s) { s.hidden = false; s.textContent = t('bizApply.loginFailed', 'No se pudo iniciar sesión. Probá de nuevo o entrá desde tu perfil.'); }
      });
    });
    var back = encodeURIComponent(window.location.pathname.split('/').pop() + '#bizApply');
    return el('div', { className: 'bza-login' }, [
      el('p', { text: t('bizApply.loginRequired', 'Para postular tu negocio necesitás iniciar sesión. Así podés seguir el estado de tu solicitud en “Mis solicitudes”. Lo que ya escribiste queda guardado.') }),
      el('div', { className: 'bza-actions' }, [google, el('a', { className: 'bza-btn-ghost', href: 'perfil.html?volver=' + back, text: t('bizApply.loginOther', 'Iniciar sesión con correo') })]),
      el('p', { id: 'bzaLoginStatus', className: 'bza-status is-error', role: 'alert', hidden: true })
    ]);
  }

  // ------------------------------------------------------------------ borrador y prefill
  var FIELD_IDS = ['bzaName', 'bzaTrade', 'bzaCategory', 'bzaShort', 'bzaDescription', 'bzaOfferings', 'bzaAudience', 'bzaOwner', 'bzaRole', 'bzaEmail',
    'bzaPhone', 'bzaWhatsapp', 'bzaWebsite', 'bzaInstagram', 'bzaFacebook', 'bzaTiktok', 'bzaDepartment', 'bzaMunicipality', 'bzaCommunity', 'bzaAddress',
    'bzaSchedule', 'bzaSeason', 'bzaCapacity', 'bzaPrice', 'bzaSustainability', 'bzaImpact'];
  function readDraft() { try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY) || '{}'); } catch (_) { return {}; } }
  function saveDraft() {
    var data = {};
    FIELD_IDS.forEach(function (id) { var f = document.getElementById(id); if (f && f.value) data[id] = f.value; });
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch (_) { /* sin almacenamiento */ }
  }
  // Acepta las variantes usadas en formularios anteriores ("Costa Caribe Norte (RACCN)", "RACN", ...).
  function normalizeTerritory(value) {
    var v = String(value || '').trim();
    if (/RACC?N|Caribe Norte/i.test(v)) return 'RACCN';
    if (/RACC?S|Caribe Sur/i.test(v)) return 'RACCS';
    var match = api().territories.filter(function (x) { return x.value.toLowerCase() === v.toLowerCase() || x.label.toLowerCase() === v.toLowerCase(); })[0];
    return match ? match.value : '';
  }
  function applyValues(values) {
    Object.keys(values || {}).forEach(function (id) {
      var f = document.getElementById(id);
      if (!f || values[id] == null || values[id] === '') return;
      if (id === 'bzaMunicipality') { f.dataset.pending = values[id]; return; }
      if (id === 'bzaDepartment') values[id] = normalizeTerritory(values[id]);
      f.value = values[id];
      if (id === 'bzaDepartment') f.dispatchEvent(new Event('change'));
      if (id === 'bzaShort') f.dispatchEvent(new Event('input'));
    });
  }

  // ------------------------------------------------------------------ diálogo
  function ensureDialog() {
    if (state.dialog) return state.dialog;
    var dialog = el('dialog', { className: 'bza-dialog', 'aria-labelledby': 'bzaTitle' });
    dialog.addEventListener('close', function () { if (state.opener && state.opener.focus) state.opener.focus(); document.documentElement.classList.remove('bza-open'); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) close(); });
    document.body.append(dialog);
    state.dialog = dialog;
    window.addEventListener('baqueano:languageChanged', function () { if (dialog.open) { saveDraft(); render(); applyValues(readDraft()); } });
    return dialog;
  }
  function header(titleKey, titleEs, subKey, subEs) {
    return el('header', { className: 'bza-head' }, [
      el('div', {}, [el('h2', { id: 'bzaTitle', text: t(titleKey, titleEs) }), el('p', { text: t(subKey, subEs) })]),
      el('button', { type: 'button', className: 'bza-close', 'aria-label': t('bizApply.close', 'Cerrar'), onclick: close }, [el('i', { className: 'fa-solid fa-xmark', 'aria-hidden': 'true' })])
    ]);
  }
  function render() {
    var dialog = ensureDialog();
    if (state.mode === 'mine') { renderMine(); return; }
    var body = el('div', { className: 'bza-body' }, [firebaseUser() ? buildForm() : loginPanel()]);
    dialog.replaceChildren(header('bizApply.title', 'Postular mi negocio a la Red BAQUEANO', 'bizApply.subtitle', 'Revisamos cada solicitud antes de publicarla. Sin comisiones por postular.'), body);
    if (firebaseUser()) {
      applyValues(readDraft());
      if (state.prefill) { applyValues(state.prefill); state.prefill = null; }
      var u = firebaseUser();
      var emailField = document.getElementById('bzaEmail');
      if (emailField && !emailField.value && u && u.email) emailField.value = u.email;
    }
  }
  function close() {
    if (state.dialog && state.dialog.open) { saveDraft(); state.dialog.close(); }
  }
  function show() {
    var dialog = ensureDialog();
    if (!dialog.open) { dialog.showModal(); document.documentElement.classList.add('bza-open'); }
    var first = dialog.querySelector('input:not([type=checkbox]):not(.bza-trap), select, textarea, button.bza-btn-primary');
    if (first) first.focus();
  }

  // ------------------------------------------------------------------ envío
  function val(id) { var f = document.getElementById(id); return f ? f.value.trim() : ''; }
  function submit(event) {
    event.preventDefault();
    var status = document.getElementById('bzaStatus');
    var errors = [];
    function check(id, ok, key, es) {
      var f = document.getElementById(id);
      if (f) f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (!ok) errors.push(t(key, es));
    }
    check('bzaName', val('bzaName').length >= 2, 'bizApply.errName', 'Escribí el nombre del negocio.');
    check('bzaCategory', !!val('bzaCategory'), 'bizApply.errCategory', 'Elegí la categoría.');
    check('bzaShort', val('bzaShort').length >= 20, 'bizApply.errShort', 'La descripción corta necesita al menos 20 caracteres.');
    check('bzaOwner', val('bzaOwner').length >= 2, 'bizApply.errOwner', 'Escribí el nombre del responsable.');
    check('bzaEmail', /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(val('bzaEmail')), 'bizApply.errEmail', 'Escribí un correo electrónico válido.');
    check('bzaDepartment', !!val('bzaDepartment'), 'bizApply.errDepartment', 'Elegí el departamento o región.');
    var website = val('bzaWebsite');
    check('bzaWebsite', !website || /^https:\/\//i.test(website), 'bizApply.errWebsite', 'El sitio web debe empezar con https://');
    var consentData = document.getElementById('bzaConsentData').checked;
    var consentTruth = document.getElementById('bzaConsentTruth').checked;
    if (!consentData || !consentTruth) errors.push(t('bizApply.errConsent', 'Marcá las dos casillas obligatorias para enviar.'));
    if (errors.length) {
      status.hidden = false; status.className = 'bza-status is-error'; status.textContent = errors.join(' ');
      var first = state.dialog.querySelector('[aria-invalid="true"]'); if (first) first.focus();
      return;
    }
    var button = document.getElementById('bzaSubmit');
    button.disabled = true; button.setAttribute('aria-busy', 'true');
    status.hidden = false; status.className = 'bza-status'; status.textContent = t('intake.sending', 'Enviando…');
    if (!state.key) state.key = api().newKey();
    api().call('business_submit', {
      businessName: val('bzaName'), tradeName: val('bzaTrade') || null, category: val('bzaCategory'),
      shortDescription: val('bzaShort'), description: val('bzaDescription') || null, offerings: val('bzaOfferings') || null, audience: val('bzaAudience') || null,
      ownerName: val('bzaOwner'), ownerRole: val('bzaRole') || null, email: val('bzaEmail'), phone: val('bzaPhone') || null, whatsapp: val('bzaWhatsapp') || null,
      website: website || null, socials: { instagram: val('bzaInstagram') || null, facebook: val('bzaFacebook') || null, tiktok: val('bzaTiktok') || null },
      department: val('bzaDepartment'), municipality: val('bzaMunicipality') || null, community: val('bzaCommunity') || null, address: val('bzaAddress') || null,
      schedule: val('bzaSchedule') || null, season: val('bzaSeason') || null, capacity: val('bzaCapacity') || null, priceInfo: val('bzaPrice') || null,
      languages: Array.prototype.map.call(state.dialog.querySelectorAll('input[name="bzaLang"]:checked'), function (c) { return c.value; }),
      sustainability: val('bzaSustainability') || null, localImpact: val('bzaImpact') || null,
      consentData: consentData, consentTruth: consentTruth, consentContact: document.getElementById('bzaConsentContact').checked,
      website_trap: state.dialog.querySelector('.bza-trap').value, idempotencyKey: state.key
    }).then(function (data) {
      try { sessionStorage.removeItem(DRAFT_KEY); } catch (_) { /* nada */ }
      state.key = null;
      var body = el('div', { className: 'bza-body bza-success', tabindex: '-1' }, [
        el('i', { className: 'fa-solid fa-circle-check', 'aria-hidden': 'true' }),
        el('h3', { text: t('bizApply.successTitle', '¡Solicitud recibida!') }),
        el('p', { text: t('bizApply.successBody', 'Tu solicitud quedó registrada con el código {code}. El equipo de BAQUEANO la revisará y verás cada cambio de estado en “Mis solicitudes”.', { code: data.code || '' }) }),
        el('p', { className: 'bza-code', text: data.code || '' }),
        el('div', { className: 'bza-actions' }, [
          el('button', { type: 'button', className: 'bza-btn-ghost', onclick: close, text: t('bizApply.close', 'Cerrar') }),
          el('button', { type: 'button', className: 'bza-btn-primary', onclick: function () { state.mode = 'mine'; render(); }, text: t('bizApply.mine', 'Mis solicitudes') })
        ])
      ]);
      state.dialog.replaceChildren(header('bizApply.title', 'Postular mi negocio a la Red BAQUEANO', 'bizApply.subtitle', 'Revisamos cada solicitud antes de publicarla. Sin comisiones por postular.'), body);
      body.focus();
    }).catch(function (error) {
      status.className = 'bza-status is-error'; status.textContent = error.message;
      if (error.code === 'login_required' || error.code === 'session_expired') { saveDraft(); setTimeout(render, 1200); }
    }).then(function () {
      if (button.isConnected) { button.disabled = false; button.removeAttribute('aria-busy'); }
    });
  }

  // ------------------------------------------------------------------ mis solicitudes
  function renderMine() {
    var dialog = ensureDialog();
    var body = el('div', { className: 'bza-body' }, [el('p', { text: t('intake.loading', 'Cargando…') })]);
    dialog.replaceChildren(header('bizApply.mineTitle', 'Mis solicitudes', 'bizApply.mineSubtitle', 'Estado de tus postulaciones a la Red BAQUEANO.'), body);
    if (!firebaseUser()) { body.replaceChildren(loginPanel()); return; }
    api().call('my_applications', {}).then(function (data) {
      var items = data.items || [];
      if (!items.length) {
        body.replaceChildren(el('p', { text: t('bizApply.mineEmpty', 'Todavía no enviaste ninguna solicitud.') }),
          el('button', { type: 'button', className: 'bza-btn-primary', onclick: function () { state.mode = 'form'; render(); }, text: t('bizApply.title', 'Postular mi negocio a la Red BAQUEANO') }));
        return;
      }
      body.replaceChildren(el('ul', { className: 'bza-mine' }, items.map(function (it) {
        var date = it.submitted_at ? new Date(it.submitted_at).toLocaleDateString(api().lang(), { dateStyle: 'medium' }) : '';
        return el('li', {}, [
          el('strong', { text: it.business_name }),
          el('span', { className: 'bza-code-sm', text: it.code + ' · ' + date }),
          el('span', { className: 'bza-pill is-' + it.status, text: t('bizApply.status.' + it.status, STATUS_ES[it.status] || it.status) }),
          it.applicant_message ? el('p', { className: 'bza-help', text: t('bizApply.teamMessage', 'Mensaje del equipo:') + ' ' + it.applicant_message }) : null
        ]);
      })));
    }).catch(function (error) { body.replaceChildren(el('p', { className: 'bza-status is-error', text: error.message })); });
  }

  // ------------------------------------------------------------------ API pública
  function open(prefill, opener) {
    if (!api()) return;
    state.mode = 'form'; state.prefill = prefill || null; state.opener = opener || document.activeElement;
    render(); show();
  }
  function openMine(opener) {
    if (!api()) return;
    state.mode = 'mine'; state.opener = opener || document.activeElement;
    render(); show();
  }
  document.addEventListener('click', function (e) {
    var target = e.target.closest && e.target.closest('[data-biz-apply],[data-biz-mine]');
    if (!target) return;
    e.preventDefault();
    if (target.hasAttribute('data-biz-mine')) openMine(target); else open(null, target);
  });
  window.BaqueanoBusinessApply = { open: open, openMine: openMine };
  if (window.location.hash === '#bizApply') {
    var tryOpen = function (n) { if (firebaseUser() || n > 20) open(); else setTimeout(function () { tryOpen(n + 1); }, 300); };
    tryOpen(0);
  }
})(window, document);
