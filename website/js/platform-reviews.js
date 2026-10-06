/**
 * 🎯 POR QUÉ: opiniones auténticas sobre el uso de BAQUEANO (pedido del propietario, 2026-10-06).
 *   La reputación se demuestra con evidencia, no se aparenta:
 *   - publica solo quien inició sesión;
 *   - una opinión activa por cuenta;
 *   - promedio y distribución calculados en Supabase con opiniones aprobadas;
 *   - nunca una cifra puesta a mano.
 * ⚙️ CÓMO: habla con la Edge Function baqueano-reviews y envía el ID token de Firebase.
 *   - El inicio de sesión (Google, cuenta BAQUEANO o cuenta nueva) ocurre en esta misma página, con
 *     BaqueanoSession (js/user-session.js). El borrador se guarda en sessionStorage, así el usuario
 *     vuelve solo a su formulario.
 *   - Todo texto ajeno se pinta con textContent (sin innerHTML).
 *   - La foto solo se muestra si es https de un host de Google o Firebase; si no, van las iniciales.
 *   - Los textos usan claves platformReviews.* en 6 idiomas y se repintan al cambiar el idioma.
 * 📦 QUÉ: resumen, distribución, lista paginada con respuesta de BAQUEANO, formulario con estrellas
 *   accesibles por teclado, consentimiento sin marcar, "Mi opinión" (estado, editar, retirar,
 *   eliminar) y reporte de opiniones.
 */
(function (window, document) {
  'use strict';
  var ENDPOINT = 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-reviews';
  var CONSENT_VERSION = 'opiniones-v1-2026-10-06';
  var DRAFT_KEY = 'baqueano_platform_review_draft_v1';
  var AVATAR_HOSTS = /^https:\/\/([a-z0-9-]+\.)*(googleusercontent\.com|firebasestorage\.googleapis\.com)\//i;
  var $ = function (id) { return document.getElementById(id); };
  var state = { user: null, summary: null, reviews: [], page: 0, hasMore: false, mine: null, reportId: null, pendingSubmit: false };

  function t(key, fallback, vars) {
    var lang = window.BaqueanoLanguage;
    var text = (lang && typeof lang.t === 'function' && lang.t('platformReviews.' + key, Object.assign({ fallback: fallback }, vars || {}))) || fallback;
    return String(text).replace(/\{(\w+)\}/g, function (_, k) { return vars && vars[k] != null ? vars[k] : '{' + k + '}'; });
  }
  function el(tag, className, text) { var n = document.createElement(tag); if (className) n.className = className; if (text != null) n.textContent = text; return n; }
  function icon(name) { var i = el('i', name); i.setAttribute('aria-hidden', 'true'); return i; }
  function show(node, on) { if (node) node.hidden = !on; }
  function lang() { var l = window.BaqueanoLanguage && window.BaqueanoLanguage.get && window.BaqueanoLanguage.get(); return /^(es|en|fr|it|pt|de)$/.test(l || '') ? l : 'es'; }
  function fmtNumber(n, digits) {
    try { return new Intl.NumberFormat(lang(), { minimumFractionDigits: digits || 0, maximumFractionDigits: digits || 0 }).format(n); } catch (_) { return String(n); }
  }
  function fmtDate(v) {
    try { return new Intl.DateTimeFormat(lang(), { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(v)); } catch (_) { return ''; }
  }
  function firebaseUser() {
    try { return window.firebase && window.firebase.auth ? window.firebase.auth().currentUser : null; } catch (_) { return null; }
  }

  function call(action, payload) {
    var user = firebaseUser();
    var tokenPromise = user && typeof user.getIdToken === 'function' ? user.getIdToken().catch(function () { return null; }) : Promise.resolve(null);
    return tokenPromise.then(function (token) {
      var headers = { 'content-type': 'application/json' };
      if (token) headers['x-firebase-token'] = token;
      return fetch(ENDPOINT, { method: 'POST', headers: headers, body: JSON.stringify(Object.assign({ action: action }, payload || {})) })
        .catch(function () { var e = new Error(t('errorNetwork', 'No pudimos conectar con BAQUEANO. Revisá tu internet e intentá de nuevo.')); e.status = 0; throw e; });
    }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (data) {
        if (res.ok && data && data.ok !== false) return data;
        var e = new Error((data && data.error) || t('errorGeneric', 'No se pudo completar la acción.'));
        e.status = res.status; e.code = data && data.code; throw e;
      });
    });
  }

  // ---------------------------------------------------------------- estrellas y avatar
  function starsNode(rating, size) {
    var wrap = el('span', 'pr-stars' + (size ? ' pr-stars-' + size : ''));
    wrap.setAttribute('role', 'img');
    wrap.setAttribute('aria-label', t('starsAria', '{stars} de 5 estrellas', { stars: fmtNumber(rating, rating % 1 ? 1 : 0) }));
    for (var i = 1; i <= 5; i += 1) {
      var cls = rating >= i ? 'fa-solid fa-star' : (rating >= i - 0.5 ? 'fa-solid fa-star-half-stroke' : 'fa-regular fa-star');
      wrap.append(icon(cls));
    }
    return wrap;
  }
  function initials(name) {
    var parts = String(name || 'B').trim().split(/\s+/).slice(0, 2);
    return parts.map(function (p) { return p.charAt(0).toUpperCase(); }).join('') || 'B';
  }
  function avatarNode(url, name) {
    var box = el('span', 'pr-avatar');
    var fallback = el('span', 'pr-avatar-initials', initials(name));
    fallback.setAttribute('aria-hidden', 'true');
    if (url && AVATAR_HOSTS.test(url)) {
      var img = el('img');
      img.src = url; img.alt = t('photoAlt', 'Foto de perfil de {name}', { name: name });
      img.width = 48; img.height = 48; img.loading = 'lazy'; img.decoding = 'async';
      img.referrerPolicy = 'no-referrer';
      img.addEventListener('error', function () { img.remove(); box.append(fallback); });
      box.append(img);
    } else {
      box.append(fallback);
    }
    return box;
  }

  // ---------------------------------------------------------------- resumen
  function renderSummary() {
    var s = state.summary;
    show($('prSummaryError'), s === false);
    if (!s) { show($('prSummaryEmpty'), false); show($('prAverageBlock'), false); show($('prDistribution'), false); return; }
    var count = Number(s.count) || 0;
    show($('prSummaryEmpty'), count === 0);
    show($('prAverageBlock'), count > 0);
    show($('prDistribution'), count > 0);
    if (!count) return;
    var avg = Number(s.average);
    $('prAverage').textContent = fmtNumber(avg, 1);
    $('prAverage').setAttribute('aria-label', t('averageLabel', 'Promedio: {average} de 5 estrellas', { average: fmtNumber(avg, 1) }));
    $('prAverageStars').replaceWith(Object.assign(starsNode(avg, 'lg'), { id: 'prAverageStars' }));
    $('prBasedOn').textContent = count === 1
      ? t('summaryBasedOnOne', 'Basado en 1 opinión de un usuario BAQUEANO.')
      : t('summaryBasedOn', 'Basado en {count} opiniones de usuarios BAQUEANO.', { count: fmtNumber(count) });
    var dist = $('prDistribution');
    dist.setAttribute('aria-label', t('distributionLabel', 'Distribución de calificaciones'));
    dist.replaceChildren();
    [5, 4, 3, 2, 1].forEach(function (stars) {
      var n = Number(s.distribution && s.distribution[String(stars)]) || 0;
      var row = el('div', 'pr-dist-row');
      row.setAttribute('role', 'listitem');
      row.setAttribute('aria-label', t('starsCount', '{stars} estrellas: {count} opiniones', { stars: stars, count: fmtNumber(n) }));
      var label = el('span', 'pr-dist-label'); label.append(String(stars) + ' ', icon('fa-solid fa-star')); label.setAttribute('aria-hidden', 'true');
      var bar = el('span', 'pr-dist-bar'); bar.setAttribute('aria-hidden', 'true');
      var fill = el('span', 'pr-dist-fill'); fill.style.width = (count ? Math.round((n / count) * 100) : 0) + '%';
      bar.append(fill);
      var num = el('span', 'pr-dist-count', fmtNumber(n)); num.setAttribute('aria-hidden', 'true');
      row.append(label, bar, num);
      dist.append(row);
    });
  }
  function loadSummary() {
    return call('summary').then(function (d) { state.summary = d.summary || null; }, function () { state.summary = false; }).then(renderSummary);
  }

  // ---------------------------------------------------------------- lista pública
  function reviewNode(r) {
    var li = el('li', 'pr-review');
    var head = el('div', 'pr-review-head');
    head.append(avatarNode(r.avatar_url, r.display_name));
    var who = el('div', 'pr-review-who');
    var name = el('strong', 'pr-review-name', r.display_name || 'Usuario BAQUEANO');
    name.setAttribute('translate', 'no');
    var badge = el('span', 'pr-badge');
    badge.append(icon('fa-solid fa-circle-check'), ' ', t('badge', 'Usuario BAQUEANO autenticado'));
    badge.title = t('badgeHint', 'Inició sesión con una cuenta válida de BAQUEANO. No significa que hayamos verificado un viaje ni una compra.');
    who.append(name, badge);
    head.append(who);
    li.append(head);
    var meta = el('div', 'pr-review-meta');
    meta.append(starsNode(Number(r.rating)));
    if (r.published_at) { var time = el('time', 'pr-review-date', fmtDate(r.published_at)); time.dateTime = r.published_at; meta.append(time); }
    if (r.edited) meta.append(el('span', 'pr-review-edited', t('edited', 'Editada')));
    li.append(meta);
    li.append(el('p', 'pr-review-text', r.comment));
    if (r.response_text) {
      var resp = el('div', 'pr-response');
      var rh = el('p', 'pr-response-head');
      rh.append(icon('fa-solid fa-reply'), ' ', t('responseLabel', 'Respuesta de BAQUEANO'));
      resp.append(rh, el('p', 'pr-response-text', r.response_text));
      li.append(resp);
    }
    var rep = el('button', 'pr-link pr-report');
    rep.type = 'button';
    rep.append(icon('fa-regular fa-flag'), ' ', t('report', 'Reportar'));
    rep.addEventListener('click', function () { openReport(r.id, rep); });
    li.append(rep);
    return li;
  }
  function renderList() {
    var list = $('prList');
    list.replaceChildren.apply(list, state.reviews.map(reviewNode));
    show($('prListEmpty'), !state.reviews.length);
    show($('prMore'), state.hasMore);
  }
  function loadPage(page) {
    return call('list', { page: page }).then(function (d) {
      var rows = d.reviews || [];
      state.reviews = page === 0 ? rows : state.reviews.concat(rows);
      state.page = page;
      state.hasMore = rows.length === (d.pageSize || 12);
      renderList();
    }, function () { if (page === 0) { state.reviews = []; renderList(); } });
  }

  // ---------------------------------------------------------------- formulario
  function ratingValue() { var c = document.querySelector('input[name="rating"]:checked'); return c ? Number(c.value) : 0; }
  function setRating(v) { var r = document.querySelector('input[name="rating"][value="' + v + '"]'); if (r) r.checked = true; updateRatingText(); }
  // Las estrellas hasta la elegida (o la que está bajo el puntero) se pintan llenas.
  function paintStars(v) {
    document.querySelectorAll('.pr-stars-input label').forEach(function (label) {
      var input = $(label.htmlFor);
      label.classList.toggle('is-on', !!input && Number(input.value) <= v);
    });
  }
  function updateRatingText() {
    var v = ratingValue();
    $('prRatingText').textContent = v ? t('rating' + v, '') : '';
    paintStars(v);
  }
  function setError(id, inputId, message) {
    var node = $(id);
    node.textContent = message || '';
    show(node, !!message);
    var input = inputId && $(inputId);
    if (input) { if (message) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid'); }
  }
  function updateCounter() { $('prCounter').textContent = $('prComment').value.length + '/1000'; }

  function saveDraft() {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ comment: $('prComment').value, improvement: $('prImprovement').value, rating: ratingValue(), showAvatar: $('prShowAvatar').checked }));
    } catch (_) { /* sin almacenamiento: el borrador vive solo en la página */ }
  }
  function restoreDraft() {
    var d = null;
    try { d = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null'); } catch (_) { d = null; }
    if (!d) return false;
    if (d.comment && !$('prComment').value) $('prComment').value = d.comment;
    if (d.improvement && !$('prImprovement').value) $('prImprovement').value = d.improvement;
    if (d.rating && !ratingValue()) setRating(d.rating);
    if (typeof d.showAvatar === 'boolean') $('prShowAvatar').checked = d.showAvatar;
    updateCounter();
    return true;
  }
  function clearDraft() { try { sessionStorage.removeItem(DRAFT_KEY); } catch (_) { /* nada que borrar */ } }

  function validate() {
    var ok = true;
    var comment = $('prComment').value.trim();
    setError('prCommentError', 'prComment', comment.length < 10 ? t('errorComment', 'Escribí al menos 10 caracteres.') : '');
    if (comment.length < 10) ok = false;
    setError('prRatingError', null, ratingValue() ? '' : t('errorRating', 'Elegí una calificación de 1 a 5 estrellas.'));
    if (!ratingValue()) ok = false;
    setError('prConsentError', 'prConsent', $('prConsent').checked ? '' : t('errorConsent', 'Para publicar tenés que aceptar las condiciones de publicación.'));
    if (!$('prConsent').checked) ok = false;
    if (!ok) {
      var first = document.querySelector('#prForm [aria-invalid="true"]') || (!ratingValue() && $('prStar5'));
      if (first) first.focus();
    }
    return ok;
  }

  function showLogin(on) {
    show($('prLogin'), on);
    if (on) { saveDraft(); $('prLogin').scrollIntoView({ block: 'center', behavior: 'smooth' }); $('prGoogle').focus({ preventScroll: true }); }
  }

  function submit(event) {
    if (event) event.preventDefault();
    setError('prFormError', null, '');
    if (!validate()) return;
    if (!firebaseUser()) { state.pendingSubmit = true; showLogin(true); return; }
    var btn = $('prSubmit');
    btn.disabled = true;
    var label = $('prSubmitLabel').textContent;
    $('prSubmitLabel').textContent = t('sending', 'Enviando…');
    call('submit', {
      comment: $('prComment').value, improvement: $('prImprovement').value, rating: ratingValue(),
      showAvatar: $('prShowAvatar').checked, consent: $('prConsent').checked === true, consentVersion: CONSENT_VERSION,
      language: lang(), platform: 'web'
    }).then(function (d) {
      clearDraft();
      state.mine = d.review || null;
      renderMine();
      show($('prThanks'), true);
      $('prThanks').focus();
    }, function (error) {
      if (error.status === 401) { state.pendingSubmit = true; showLogin(true); }
      setError('prFormError', null, error.message);
    }).then(function () {
      btn.disabled = false;
      $('prSubmitLabel').textContent = label;
      renderSubmitLabel();
    });
  }

  // ---------------------------------------------------------------- mi opinión
  function renderSubmitLabel() {
    $('prSubmitLabel').textContent = state.mine ? t('update', 'ACTUALIZAR MI OPINIÓN') : t('submit', 'PUBLICAR MI OPINIÓN');
  }
  function renderMine() {
    var m = state.mine;
    show($('prMine'), !!m);
    renderSubmitLabel();
    if (!m) return;
    var status = t('status.' + m.status, m.status);
    $('prMineStatus').textContent = t('mineStatus', 'Estado: {status}', { status: status });
    $('prMineStatus').dataset.status = m.status;
    var reason = m.moderation_reason && (m.status === 'rejected' || m.status === 'hidden' || m.status === 'reported');
    $('prMineReason').textContent = reason ? t('mineReason', 'Motivo del equipo: {reason}', { reason: m.moderation_reason }) : '';
    show($('prMineReason'), !!reason);
  }
  function fillFromMine() {
    var m = state.mine;
    if (!m) return;
    if (!$('prComment').value) $('prComment').value = m.comment || '';
    if (!$('prImprovement').value) $('prImprovement').value = m.improvement || '';
    if (!ratingValue() && m.rating) setRating(m.rating);
    $('prShowAvatar').checked = m.show_avatar !== false;
    updateCounter();
  }
  function loadMine() {
    return call('mine').then(function (d) { state.mine = d.review || null; renderMine(); fillFromMine(); }, function () { state.mine = null; renderMine(); });
  }
  function withdraw(erase) {
    var question = erase
      ? t('deleteConfirm', '¿Eliminar tu opinión? Borramos el texto, tu nombre y tu foto; solo queda el registro de que existió, por trazabilidad.')
      : t('withdrawConfirm', '¿Retirar tu opinión? Dejará de mostrarse. Podés publicar otra más adelante.');
    var ask = window.BaqueanoDialog ? window.BaqueanoDialog.confirm(question, { danger: !!erase }) : Promise.resolve(false);
    ask.then(function (accepted) {
    if (!accepted) return;
    call(erase ? 'delete_mine' : 'withdraw').then(function () {
      state.mine = null;
      renderMine();
      $('prForm').reset();
      updateCounter(); updateRatingText();
      var msg = $('prStatusMsg');
      msg.textContent = erase ? t('deleted', 'Tu opinión y tus datos fueron eliminados.') : t('withdrawn', 'Tu opinión fue retirada.');
      show(msg, true);
      loadSummary(); loadPage(0);
    }, function (error) { setError('prFormError', null, error.message); });
    });
  }

  // ---------------------------------------------------------------- sesión
  function renderUser() {
    var u = firebaseUser();
    state.user = u;
    show($('prSigned'), !!u);
    if (u) {
      $('prSignedName').textContent = t('signedInAs', 'Publicás como {name}', { name: u.displayName || u.email || '' });
      var av = $('prSignedAvatar');
      if (u.photoURL && AVATAR_HOSTS.test(u.photoURL)) { av.src = u.photoURL; av.referrerPolicy = 'no-referrer'; show(av, true); } else show(av, false);
      show($('prLogin'), false);
    }
  }
  function onSignedIn() {
    renderUser();
    restoreDraft();
    loadMine().then(function () {
      if (state.pendingSubmit) {
        state.pendingSubmit = false;
        $('prComment').focus();
        $('prCompose').scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
    });
  }
  function loginWith(promiseFactory) {
    setError('prLoginError', null, '');
    saveDraft();
    var session = window.BaqueanoSession;
    if (!session) { setError('prLoginError', null, t('errorGeneric', 'No se pudo completar la acción.')); return; }
    Promise.resolve().then(function () { return promiseFactory(session); }).then(function () { onSignedIn(); }, function (error) {
      setError('prLoginError', null, (error && error.message) || t('errorGeneric', 'No se pudo completar la acción.'));
    });
  }

  // ---------------------------------------------------------------- reportes
  var reportOpener = null;
  function openReport(id, opener) {
    if (!firebaseUser()) { state.pendingSubmit = false; showLogin(true); return; }
    state.reportId = id; reportOpener = opener;
    setError('prReportError', null, '');
    $('prReportDetails').value = '';
    var dlg = $('prReportDialog');
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }
  function closeReport() {
    var dlg = $('prReportDialog');
    if (dlg.open && typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
    if (reportOpener) reportOpener.focus();
  }
  function sendReport() {
    call('report', { reviewId: state.reportId, reason: $('prReportReason').value, details: $('prReportDetails').value }).then(function () {
      closeReport();
      var msg = $('prStatusMsg');
      msg.textContent = t('reportThanks', 'Gracias. El equipo revisará el reporte.');
      show(msg, true);
    }, function (error) { setError('prReportError', null, error.message); });
  }

  // ---------------------------------------------------------------- arranque
  function rerender() { renderSummary(); renderList(); renderMine(); updateRatingText(); if (state.user) renderUser(); }

  function init() {
    if (!$('prForm')) return;
    $('prForm').addEventListener('submit', submit);
    $('prComment').addEventListener('input', function () { updateCounter(); if (!$('prCommentError').hidden) setError('prCommentError', 'prComment', ''); });
    document.querySelectorAll('input[name="rating"]').forEach(function (r) {
      r.addEventListener('change', function () { updateRatingText(); setError('prRatingError', null, ''); });
      var label = document.querySelector('label[for="' + r.id + '"]');
      if (label) {
        label.addEventListener('mouseenter', function () { paintStars(Number(r.value)); });
        label.addEventListener('mouseleave', function () { paintStars(ratingValue()); });
      }
    });
    $('prConsent').addEventListener('change', function () { if ($('prConsent').checked) setError('prConsentError', 'prConsent', ''); });
    $('prGoogle').addEventListener('click', function () { loginWith(function (s) { return s.loginWithGoogle(); }); });
    $('prEmailLogin').addEventListener('click', function () { loginWith(function (s) { return s.login($('prEmail').value, $('prPassword').value); }); });
    $('prRegister').addEventListener('click', function () { loginWith(function (s) { return s.register($('prRegEmail').value, $('prRegPassword').value, $('prRegName').value); }); });
    $('prSignOut').addEventListener('click', function () {
      var s = window.BaqueanoSession;
      Promise.resolve(s && s.logout ? s.logout() : null).then(function () { state.mine = null; renderMine(); renderUser(); });
    });
    $('prWithdraw').addEventListener('click', function () { withdraw(false); });
    $('prDelete').addEventListener('click', function () { withdraw(true); });
    $('prMore').addEventListener('click', function () { loadPage(state.page + 1); });
    $('prReportCancel').addEventListener('click', closeReport);
    $('prReportSend').addEventListener('click', sendReport);
    $('prReportDialog').addEventListener('cancel', function () { if (reportOpener) setTimeout(function () { reportOpener.focus(); }, 0); });

    updateCounter();
    loadSummary();
    loadPage(0);
    try {
      if (window.firebase && window.firebase.auth) {
        window.firebase.auth().onAuthStateChanged(function (user) {
          if (user) onSignedIn(); else { state.user = null; state.mine = null; renderUser(); renderMine(); restoreDraft(); }
        });
      }
    } catch (_) { /* sin Firebase: se puede leer pero no publicar */ }
    window.addEventListener('baqueano:languageChanged', rerender);
    window.addEventListener('baqueano:i18nReady', rerender);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})(window, document);
