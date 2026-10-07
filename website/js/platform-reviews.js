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
  var state = { user: null, summary: null, reviews: [], page: 0, hasMore: false, mine: null, reportId: null, pendingSubmit: false,
    submitting: false, history: null, g: { index: 0, timer: null, paused: false, hold: false, loading: false } };

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
    renderGallery();
  }

  // ---------------------------------------------------------------- galería (2026-10-06)
  // Carrusel infinito: autoplay cada 7 s, pausa/continuar, flechas, teclado y deslizamiento.
  // Con "reducir movimiento" no avanza solo. Al acercarse al final pide la siguiente página
  // (12 opiniones); sin más páginas vuelve al principio. Nunca carga todo de una vez.
  var reduceMotion = false;
  try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) { reduceMotion = false; }
  function galleryCard(r, i, total) {
    // Mismo contenido que la tarjeta de la lista, pero en un <div role="group"> (un <li> con
    // role=group dentro de una lista no es válido para lectores de pantalla).
    var source = reviewNode(r);
    var li = el('div', source.className + ' pr-gallery-slide');
    while (source.firstChild) li.append(source.firstChild);
    li.setAttribute('role', 'group');
    li.setAttribute('aria-roledescription', t('gallerySlide', 'opinión'));
    li.setAttribute('aria-label', t('galleryPos', '{n} de {total}', { n: i + 1, total: total }));
    return li;
  }
  function renderGallery() {
    var box = $('prGallery'); if (!box) return;
    var list = state.reviews;
    show(box, list.length > 0);
    if (!list.length) return;
    if (state.g.index >= list.length) state.g.index = 0;
    var track = $('prGalleryTrack');
    track.replaceChildren.apply(track, list.map(function (r, i) { return galleryCard(r, i, list.length); }));
    paintGallery(false);
    renderToggle();
    scheduleGallery();
  }
  // Varias tarjetas a la vez (pedido del propietario 2026-10-07): 3 en escritorio, 2 en tablet,
  // 1 en móvil, según el ancho real de la galería. Avanza de a una y da la vuelta al llegar al
  // final, así la rotación es infinita; el orden visual lo fija `order` en la grilla.
  function perView() {
    var vp = $('prGalleryViewport');
    var w = vp ? vp.clientWidth : 0;
    var per = w >= 960 ? 3 : (w >= 620 ? 2 : 1);
    return Math.max(1, Math.min(per, state.reviews.length));
  }
  function paintGallery(focus) {
    var track = $('prGalleryTrack');
    var slides = track.children;
    var n = slides.length;
    var per = Math.min(perView(), n || 1);
    track.style.setProperty('--pr-per-view', String(per));
    var visible = {};
    for (var k = 0; k < per; k += 1) visible[(state.g.index + k) % n] = k;
    for (var i = 0; i < n; i += 1) {
      var on = Object.prototype.hasOwnProperty.call(visible, i);
      slides[i].hidden = !on;
      slides[i].setAttribute('aria-hidden', on ? 'false' : 'true');
      slides[i].style.order = on ? String(visible[i]) : '';
    }
    var total = state.reviews.length + (state.hasMore ? '+' : '');
    var from = state.g.index + 1;
    var to = ((state.g.index + per - 1) % n) + 1;
    $('prGalleryPos').textContent = per > 1
      ? t('galleryRange', '{from}–{to} de {total}', { from: from, to: to, total: total })
      : t('galleryPos', '{n} de {total}', { n: from, total: total });
    if (focus && slides[state.g.index]) slides[state.g.index].focus({ preventScroll: true });
  }
  function moveGallery(step) {
    var n = state.reviews.length; if (!n) return;
    var next = state.g.index + step;
    // Pide la página siguiente un poco antes de agotar las tarjetas visibles.
    if (step > 0 && next + perView() > n && state.hasMore && !state.g.loading) {
      state.g.loading = true;
      loadPage(state.page + 1).then(function () { state.g.loading = false; state.g.index = Math.min(next, state.reviews.length - 1); paintGallery(false); });
      return;
    }
    if (next >= n) {
      if (state.hasMore && !state.g.loading) {
        state.g.loading = true;
        loadPage(state.page + 1).then(function () { state.g.loading = false; state.g.index = Math.min(next, state.reviews.length - 1); paintGallery(false); });
        return;
      }
      next = 0;
    }
    if (next < 0) next = n - 1;
    state.g.index = next;
    paintGallery(false);
  }
  function scheduleGallery() {
    window.clearTimeout(state.g.timer);
    if (state.g.paused || state.g.hold || reduceMotion || document.hidden || state.reviews.length < 2) return;
    state.g.timer = window.setTimeout(function () { moveGallery(1); scheduleGallery(); }, 7000);
  }
  function renderToggle() {
    var btn = $('prGalleryToggle'); if (!btn) return;
    var paused = state.g.paused || reduceMotion;
    btn.setAttribute('aria-pressed', paused ? 'true' : 'false');
    btn.querySelector('i').className = paused ? 'fa-solid fa-play' : 'fa-solid fa-pause';
    // La clave sigue al estado: así el motor de idioma traduce la etiqueta correcta al cambiar de idioma.
    var label = $('prGalleryToggleLabel');
    label.setAttribute('data-i18n', paused ? 'platformReviews.galleryPlay' : 'platformReviews.galleryPause');
    label.textContent = paused ? t('galleryPlay', 'Continuar') : t('galleryPause', 'Pausar');
  }
  function bindGallery() {
    var vp = $('prGalleryViewport'); if (!vp) return;
    $('prGalleryPrev').addEventListener('click', function () { moveGallery(-1); scheduleGallery(); });
    $('prGalleryNext').addEventListener('click', function () { moveGallery(1); scheduleGallery(); });
    $('prGalleryToggle').addEventListener('click', function () {
      if (reduceMotion) { reduceMotion = false; state.g.paused = false; } else state.g.paused = !state.g.paused;
      renderToggle(); scheduleGallery();
    });
    vp.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); moveGallery(1); scheduleGallery(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); moveGallery(-1); scheduleGallery(); }
    });
    // Pausa mientras el puntero o el foco están sobre la galería (WCAG 2.2.2).
    var box = $('prGallery');
    ['mouseenter', 'focusin'].forEach(function (ev) { box.addEventListener(ev, function () { state.g.hold = true; scheduleGallery(); }); });
    ['mouseleave', 'focusout'].forEach(function (ev) { box.addEventListener(ev, function () { state.g.hold = false; scheduleGallery(); }); });
    var startX = null;
    vp.addEventListener('pointerdown', function (e) { startX = e.clientX; });
    vp.addEventListener('pointerup', function (e) {
      if (startX == null) return;
      var dx = e.clientX - startX; startX = null;
      if (Math.abs(dx) > 45) { moveGallery(dx < 0 ? 1 : -1); scheduleGallery(); }
    });
    document.addEventListener('visibilitychange', scheduleGallery);
    // Al girar el teléfono o cambiar el tamaño de la ventana se recalcula cuántas tarjetas caben.
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () { if (state.reviews.length) paintGallery(false); }, 150);
    });
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
    if (state.submitting) return; // evita duplicados por doble clic
    state.submitting = true;
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
      resetForm();
      renderMine();
      show($('prThanks'), true);
      $('prThanks').focus();
      loadHistory();
    }, function (error) {
      if (error.status === 401) { state.pendingSubmit = true; showLogin(true); }
      setError('prFormError', null, error.message);
    }).then(function () {
      state.submitting = false;
      btn.disabled = false;
      $('prSubmitLabel').textContent = label;
      renderSubmitLabel();
    });
  }

  // Después de un envío correcto el formulario queda limpio y listo para otra vez:
  // comentario, sugerencia, estrellas y consentimiento vacíos (el consentimiento se pide en
  // cada publicación). La opinión enviada sigue visible en "Mi opinión" y en "Mis opiniones".
  function resetForm() {
    $('prComment').value = '';
    $('prImprovement').value = '';
    document.querySelectorAll('input[name="rating"]').forEach(function (r) { r.checked = false; });
    paintStars(0);
    updateRatingText();
    $('prConsent').checked = false;
    $('prShowAvatar').checked = true;
    ['prCommentError', 'prRatingError', 'prConsentError', 'prFormError'].forEach(function (id) { var n = $(id); if (n) { n.textContent = ''; n.hidden = true; } });
    updateCounter();
  }

  // ---------------------------------------------------------------- mi opinión
  function renderSubmitLabel() {
    $('prSubmitLabel').textContent = state.mine ? t('update', 'ACTUALIZAR MI OPINIÓN') : t('submit', 'PUBLICAR MI OPINIÓN');
  }
  function renderMine() {
    var m = state.mine;
    show($('prMine'), !!m);
    show($('prReplaceNote'), !!m);
    renderSubmitLabel();
    if (!m) return;
    var status = t('status.' + m.status, m.status);
    $('prMineStatus').textContent = t('mineStatus', 'Estado: {status}', { status: status });
    $('prMineStatus').dataset.status = m.status;
    var reason = m.moderation_reason && (m.status === 'rejected' || m.status === 'hidden' || m.status === 'reported');
    $('prMineReason').textContent = reason ? t('mineReason', 'Motivo del equipo: {reason}', { reason: m.moderation_reason }) : '';
    show($('prMineReason'), !!reason);
  }
  // Solo con el botón "Editar mi opinión": antes se rellenaba sola y el comentario anterior
  // quedaba "pegado" en el formulario después de enviarlo.
  function fillFromMine() {
    var m = state.mine;
    if (!m) return;
    $('prComment').value = m.comment || '';
    $('prImprovement').value = m.improvement || '';
    if (m.rating) setRating(m.rating);
    $('prShowAvatar').checked = m.show_avatar !== false;
    updateCounter();
  }
  function loadMine() {
    return call('mine').then(function (d) { state.mine = d.review || null; renderMine(); }, function () { state.mine = null; renderMine(); });
  }

  // ---------------------------------------------------------------- mis opiniones
  var HISTORY_ACTIONS = { created: 'histCreated', edited: 'histEdited', approved: 'histApproved', rejected: 'histRejected', hidden: 'histHidden',
    marked_reported: 'histReported', withdrawn: 'histWithdrawn', erased: 'histErased', responded: 'histResponded' };
  var HISTORY_FALLBACK = { histCreated: 'Enviada', histEdited: 'Editada (vuelve a revisión)', histApproved: 'Aprobada y publicada', histRejected: 'No aprobada',
    histHidden: 'Ocultada por moderación', histReported: 'En revisión por reportes', histWithdrawn: 'Retirada por vos', histErased: 'Eliminada a tu pedido', histResponded: 'BAQUEANO respondió' };
  function loadHistory() {
    if (!firebaseUser()) { state.history = null; renderHistory(); return Promise.resolve(); }
    return call('my_history').then(function (d) { state.history = d; renderHistory(); }, function () { state.history = null; renderHistory(); });
  }
  function renderHistory() {
    var box = $('prHistory'); if (!box) return;
    var h = state.history;
    show(box, !!(state.user && h));
    if (!h) return;
    var list = $('prHistoryList');
    var rows = h.reviews || [];
    show($('prHistoryEmpty'), !rows.length);
    list.replaceChildren.apply(list, rows.map(function (r) {
      var li = el('li', 'pr-history-item');
      var head = el('div', 'pr-history-head');
      var badge = el('span', 'pr-history-status', t('status.' + r.status, r.status));
      badge.dataset.status = r.status;
      head.append(badge);
      if (r.rating) head.append(starsNode(Number(r.rating)));
      var when = el('time', 'pr-review-date', fmtDate(r.created_at)); when.dateTime = r.created_at; head.append(when);
      li.append(head);
      li.append(el('p', 'pr-review-text', r.erased_at ? t('histErasedText', 'Eliminaste esta opinión y sus datos.') : (r.comment || '')));
      if (r.moderation_reason && (r.status === 'rejected' || r.status === 'hidden')) li.append(el('p', 'pr-mine-reason', t('mineReason', 'Motivo del equipo: {reason}', { reason: r.moderation_reason })));
      var evs = (h.events || []).filter(function (e) { return e.review_id === r.id; });
      if (evs.length) {
        var ol = el('ol', 'pr-history-events');
        evs.forEach(function (e) {
          var key = HISTORY_ACTIONS[e.action];
          var item = el('li', null, (key ? t(key, HISTORY_FALLBACK[key]) : e.action) + ' · ' + fmtDate(e.at));
          ol.append(item);
        });
        var det = el('details', 'pr-history-details');
        det.append(el('summary', null, t('histTimeline', 'Ver historial ({n})', { n: evs.length })), ol);
        li.append(det);
      }
      return li;
    }));
    if (location.hash === '#prHistory' && !state.historyFocused) { state.historyFocused = true; box.scrollIntoView({ block: 'start' }); box.focus({ preventScroll: true }); }
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
      loadSummary(); loadPage(0); loadHistory();
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
    loadHistory();
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
  function rerender() { renderSummary(); renderList(); renderMine(); renderHistory(); renderToggle(); updateRatingText(); if (state.user) renderUser(); }

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
    $('prEdit').addEventListener('click', function () { fillFromMine(); show($('prThanks'), false); $('prComment').focus(); });
    $('prWithdraw').addEventListener('click', function () { withdraw(false); });
    $('prDelete').addEventListener('click', function () { withdraw(true); });
    $('prMore').addEventListener('click', function () { loadPage(state.page + 1); });
    $('prReportCancel').addEventListener('click', closeReport);
    $('prReportSend').addEventListener('click', sendReport);
    $('prReportDialog').addEventListener('cancel', function () { if (reportOpener) setTimeout(function () { reportOpener.focus(); }, 0); });

    bindGallery();
    updateCounter();
    loadSummary();
    loadPage(0);
    try {
      if (window.firebase && window.firebase.auth) {
        window.firebase.auth().onAuthStateChanged(function (user) {
          if (user) onSignedIn(); else { state.user = null; state.mine = null; state.history = null; renderUser(); renderMine(); renderHistory(); restoreDraft(); }
        });
      }
    } catch (_) { /* sin Firebase: se puede leer pero no publicar */ }
    window.addEventListener('baqueano:languageChanged', rerender);
    window.addEventListener('baqueano:i18nReady', rerender);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})(window, document);
