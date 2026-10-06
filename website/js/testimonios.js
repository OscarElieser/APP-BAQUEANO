// ============================================================================
// 🧭 BAQUEANO — EXPERIENCIAS DE VIAJEROS (testimonios.js)
// ============================================================================
// 🎯 POR QUÉ:
// - Viajeros reales comparten experiencias reales de Nicaragua. Ver es
//   público; publicar, comentar, reaccionar, subir fotos/videos y denunciar
//   exige sesión (Google o cuenta BAQUEANO). Sin datos de ejemplo: si no hay
//   publicaciones se dice con claridad.
//
// ⚙️ CÓMO:
// - Datos vía js/community-api.js → Edge Function baqueano-community
//   (Supabase). El servidor valida, limita frecuencia, verifica el tipo real
//   de cada archivo y deja cada experiencia "en revisión" hasta que el Ops
//   Center la aprueba.
// - Todo el contenido de usuarios se pinta con textContent (sin HTML).
// - Sin sesión, cualquier acción abre "Iniciá sesión para compartir tu
//   experiencia…" y, al volver, retoma la acción (sessionStorage).
// - Fotos y videos: vista previa local, quitar antes de enviar, confirmación
//   de que serán públicos, subida con progreso; en el feed, imágenes con
//   lazy loading y video solo al tocar "Reproducir".
//
// 📦 QUÉ: feed con filtros y buscador, detalle con comentarios y respuestas,
//   formulario "Comparte tu experiencia", denuncias y "Mis experiencias".
// ============================================================================
(function (window, document) {
  'use strict';

  var API = window.BaqueanoCommunity;
  var INTENT_KEY = 'bq_testimonios_intent';
  var DRAFT_KEY = 'bq_testimonios_draft';
  var DEPARTMENTS = [
    ['boaco', 'Boaco'], ['carazo', 'Carazo'], ['chinandega', 'Chinandega'], ['chontales', 'Chontales'], ['esteli', 'Estelí'],
    ['granada', 'Granada'], ['jinotega', 'Jinotega'], ['leon', 'León'], ['madriz', 'Madriz'], ['managua', 'Managua'],
    ['masaya', 'Masaya'], ['matagalpa', 'Matagalpa'], ['nueva_segovia', 'Nueva Segovia'], ['raccn', 'Costa Caribe Norte'],
    ['raccs', 'Costa Caribe Sur'], ['rio_san_juan', 'Río San Juan'], ['rivas', 'Rivas']
  ];
  var TYPES = [
    ['naturaleza', 'Naturaleza'], ['cultura', 'Cultura'], ['gastronomia', 'Gastronomía'], ['aventura', 'Aventura'], ['playa', 'Playa'],
    ['montana', 'Montaña'], ['comunidad', 'Comunidad'], ['historia', 'Historia'], ['ecoturismo', 'Ecoturismo'], ['hospedaje', 'Hospedaje'],
    ['restaurante', 'Restaurante'], ['tour', 'Tour'], ['evento', 'Evento'], ['otro', 'Otro']
  ];
  var REASONS = [['spam', 'Spam o publicidad'], ['ofensivo', 'Lenguaje ofensivo'], ['falso', 'Información falsa'], ['privacidad', 'Expone datos privados'], ['peligroso', 'Contenido peligroso'], ['otro', 'Otro motivo']];
  var DEP_NAME = Object.fromEntries(DEPARTMENTS);
  var TYPE_NAME = Object.fromEntries(TYPES);

  var state = { filters: { sort: 'recent', media: '', department: '', type: '', destination: '', q: '' }, page: 0, total: 0, user: null, service: null, places: null, files: [], busy: false };
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
  function icon(name) { var i = el('i', name); i.setAttribute('aria-hidden', 'true'); return i; }
  function toast(message, type) { if (window.bqToast) window.bqToast(message, type || 'info'); }
  function norm(value) { return String(value || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim(); }

  function relativeDate(iso) {
    var date = new Date(iso);
    if (!isFinite(date)) return '';
    var diff = (date.getTime() - Date.now()) / 1000;
    var units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
    var rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
    for (var i = 0; i < units.length; i += 1) {
      if (Math.abs(diff) >= units[i][1]) return rtf.format(Math.round(diff / units[i][1]), units[i][0]);
    }
    return 'hace un momento';
  }
  function visitLabel(value) {
    if (!value) return '';
    var d = new Date(value + 'T12:00:00');
    return isFinite(d) ? 'Visitó en ' + d.toLocaleDateString('es-NI', { month: 'long', year: 'numeric' }) : '';
  }

  function avatar(name, url) {
    var box = el('span', 'tm-avatar');
    if (url && /^https:\/\//.test(url)) {
      var img = el('img');
      img.src = url; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async'; img.referrerPolicy = 'no-referrer';
      img.width = 44; img.height = 44;
      img.onerror = function () { box.textContent = initials(name); };
      box.appendChild(img);
    } else {
      box.textContent = initials(name);
    }
    return box;
  }
  function initials(name) {
    return String(name || 'V').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0].toUpperCase(); }).join('') || 'V';
  }
  function stars(rating) {
    var wrap = el('span', 'tm-stars');
    wrap.setAttribute('aria-label', rating + ' de 5 estrellas');
    for (var i = 1; i <= 5; i += 1) wrap.appendChild(icon(i <= rating ? 'fa-solid fa-star' : 'fa-regular fa-star'));
    return wrap;
  }
  function placeLine(item) {
    var parts = [item.destination_name || item.place_name, item.municipality, DEP_NAME[item.department_id]].filter(Boolean);
    return parts.join(' · ');
  }
  function placeUrl(item) {
    if (item.destination_ref) return 'destino.html?id=' + encodeURIComponent(item.destination_ref);
    if (item.department_id) return 'departamento.html?id=' + encodeURIComponent(item.department_id.replace(/_/g, '-'));
    return null;
  }

  // ---------------- Sesión y retorno ----------------
  function saveIntent(intent) { try { sessionStorage.setItem(INTENT_KEY, JSON.stringify(intent)); } catch (_) {} }
  function takeIntent() {
    try { var raw = sessionStorage.getItem(INTENT_KEY); sessionStorage.removeItem(INTENT_KEY); return raw ? JSON.parse(raw) : null; } catch (_) { return null; }
  }
  function requireLogin(intent) {
    if (state.user) return true;
    saveIntent(intent);
    var dialog = $('#tmLoginDialog');
    var back = 'testimonios.html' + (intent && intent.id ? '?experiencia=' + encodeURIComponent(intent.id) : '?accion=compartir');
    $('#tmLoginEmail').href = 'perfil.html?volver=' + encodeURIComponent(back);
    $('#tmLoginMessage').textContent = '';
    openDialog(dialog);
    return false;
  }
  function onLogin() {
    var intent = takeIntent();
    if (!intent) return;
    closeDialog($('#tmLoginDialog'));
    if (intent.action === 'compose') openComposer();
    else if (intent.action === 'comment' || intent.action === 'detail') openDetail(intent.id, intent.action === 'comment');
    else if (intent.action === 'react') react(intent.id, null);
    else if (intent.action === 'report') openReport(intent.id, intent.commentId || null);
  }

  // ---------------- Diálogos ----------------
  var lastFocus = null;
  function openDialog(dialog) {
    if (!dialog) return;
    lastFocus = document.activeElement;
    if (typeof dialog.showModal === 'function') { if (!dialog.open) dialog.showModal(); }
    else dialog.setAttribute('open', '');
    document.documentElement.classList.add('tm-dialog-open');
  }
  function closeDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.close === 'function' && dialog.open) dialog.close();
    else dialog.removeAttribute('open');
    if (!$$('dialog[open]').length) document.documentElement.classList.remove('tm-dialog-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // ---------------- Feed ----------------
  function readFiltersFromUrl() {
    var params = new URLSearchParams(window.location.search);
    state.filters.destination = (params.get('destino') || '').replace(/[^A-Za-z0-9_\-]/g, '');
    state.filters.department = (params.get('departamento') || '').replace(/-/g, '_').replace(/[^a-z_]/g, '');
    state.filters.q = (params.get('q') || '').slice(0, 80);
    $('#tmSearch').value = state.filters.q;
    $('#tmDepartment').value = DEP_NAME[state.filters.department] ? state.filters.department : '';
    if (state.filters.destination) {
      var chip = $('#tmDestinationChip');
      chip.hidden = false;
      $('span', chip).textContent = 'Destino: ' + state.filters.destination.replace(/_/g, ' ');
    }
  }

  function cardMedia(item) {
    var media = (item.media || []).slice(0, 4);
    if (!media.length) return null;
    var strip = el('div', 'tm-card-media' + (media.length === 1 ? ' is-single' : ''));
    media.forEach(function (m, index) {
      var cell = el('button', 'tm-media-thumb');
      cell.type = 'button';
      cell.dataset.open = item.id;
      cell.setAttribute('aria-label', (m.kind === 'video' ? 'Ver video de ' : 'Ver foto de ') + item.title);
      var img = el('img');
      img.src = m.thumb || (m.kind === 'image' ? m.url : '');
      img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
      if (m.width && m.height) { img.width = Math.min(480, m.width); img.height = Math.round(Math.min(480, m.width) * m.height / m.width); }
      if (img.src) cell.appendChild(img);
      if (m.kind === 'video') { var play = el('span', 'tm-play'); play.appendChild(icon('fa-solid fa-play')); cell.appendChild(play); }
      if (index === 3 && item.media_count > 4) cell.appendChild(el('span', 'tm-more', '+' + (item.media_count - 4)));
      strip.appendChild(cell);
    });
    return strip;
  }

  function renderCard(item) {
    var card = el('article', 'tm-card' + (item.featured ? ' is-featured' : ''));
    card.dataset.id = item.id;
    var head = el('header', 'tm-card-head');
    head.appendChild(avatar(item.author_name, item.author_avatar));
    var who = el('div', 'tm-card-who');
    who.appendChild(el('strong', null, item.author_name));
    var when = el('small', null, relativeDate(item.published_at || item.created_at));
    who.appendChild(when);
    head.appendChild(who);
    if (item.verified_visit) { var v = el('span', 'tm-badge is-verified'); v.appendChild(icon('fa-solid fa-circle-check')); v.append(' Visita verificada'); head.appendChild(v); }
    else if (item.featured) { var f = el('span', 'tm-badge'); f.appendChild(icon('fa-solid fa-star')); f.append(' Destacada'); head.appendChild(f); }
    card.appendChild(head);
    var place = placeLine(item);
    if (place) { var p = el('p', 'tm-card-place'); p.appendChild(icon('fa-solid fa-location-dot')); p.append(' ' + place); card.appendChild(p); }
    if (item.rating) card.appendChild(stars(item.rating));
    card.appendChild(el('h3', 'tm-card-title', item.title));
    card.appendChild(el('p', 'tm-card-body', item.body));
    var media = cardMedia(item);
    if (media) card.appendChild(media);
    if (item.tags && item.tags.length) {
      var tags = el('div', 'tm-tags');
      item.tags.slice(0, 4).forEach(function (t) { tags.appendChild(el('span', null, '#' + t)); });
      card.appendChild(tags);
    }
    var foot = el('footer', 'tm-card-foot');
    var like = el('button', 'tm-action tm-react' + (item.reacted ? ' is-on' : ''));
    like.type = 'button'; like.dataset.react = item.id;
    like.setAttribute('aria-pressed', item.reacted ? 'true' : 'false');
    like.appendChild(icon(item.reacted ? 'fa-solid fa-heart' : 'fa-regular fa-heart'));
    like.appendChild(el('span', null, String(item.reactions_count || 0)));
    like.setAttribute('aria-label', 'Me inspira (' + (item.reactions_count || 0) + ')');
    var comments = el('button', 'tm-action');
    comments.type = 'button'; comments.dataset.open = item.id; comments.dataset.focusComment = '1';
    comments.appendChild(icon('fa-regular fa-comment'));
    comments.appendChild(el('span', null, String(item.comments_count || 0)));
    comments.setAttribute('aria-label', 'Comentarios (' + (item.comments_count || 0) + ')');
    var read = el('button', 'tm-action tm-read', 'Leer experiencia');
    read.type = 'button'; read.dataset.open = item.id;
    var report = el('button', 'tm-action tm-report');
    report.type = 'button'; report.dataset.report = item.id;
    report.setAttribute('aria-label', 'Denunciar esta experiencia');
    report.appendChild(icon('fa-regular fa-flag'));
    foot.append(like, comments, read, report);
    card.appendChild(foot);
    return card;
  }

  function setFeedMessage(kind, title, text, withCta) {
    var box = $('#tmFeedState');
    box.textContent = '';
    box.hidden = !kind;
    if (!kind) return;
    box.className = 'tm-state is-' + kind;
    box.appendChild(icon(kind === 'error' ? 'fa-solid fa-plug-circle-exclamation' : 'fa-regular fa-compass'));
    box.appendChild(el('strong', null, title));
    box.appendChild(el('p', null, text));
    if (withCta) {
      var cta = el('button', 'tm-btn tm-btn-primary', 'Compartí tu experiencia');
      cta.type = 'button'; cta.dataset.compose = '1';
      box.appendChild(cta);
    }
  }

  function loadFeed(reset) {
    if (state.service === false) return;
    if (reset) { state.page = 0; $('#tmFeed').textContent = ''; }
    var more = $('#tmLoadMore');
    more.hidden = true;
    $('#tmFeed').setAttribute('aria-busy', 'true');
    var payload = Object.assign({ page: state.page, limit: 12 }, state.filters);
    return API.call('list', payload).then(function (data) {
      state.total = data.total || 0;
      var feed = $('#tmFeed');
      (data.items || []).forEach(function (item) { feed.appendChild(renderCard(item)); });
      var shown = feed.children.length;
      $('#tmCount').textContent = state.total ? state.total + ' experiencia' + (state.total === 1 ? '' : 's') + ' publicada' + (state.total === 1 ? '' : 's') : '';
      if (!shown) {
        var filtered = state.filters.q || state.filters.department || state.filters.type || state.filters.media || state.filters.destination;
        setFeedMessage('empty', filtered ? 'No hay experiencias con esos filtros.' : 'Todavía no hay experiencias publicadas.',
          filtered ? 'Probá con otro departamento o limpiá los filtros.' : '¿Ya viviste Nicaragua? Tu experiencia puede inspirar el próximo viaje de alguien.', !filtered);
      } else setFeedMessage(null);
      more.hidden = shown >= state.total;
    }).catch(function (error) {
      setFeedMessage('error', 'No pudimos cargar las experiencias.', error.message, false);
    }).then(function () { $('#tmFeed').setAttribute('aria-busy', 'false'); });
  }

  // ---------------- Reacciones ----------------
  function react(id, button) {
    if (!requireLogin({ action: 'react', id: id })) return;
    var btn = button || $('.tm-react[data-react="' + id + '"]');
    if (btn) btn.disabled = true;
    API.call('react', { testimonial_id: id, kind: 'like' }).then(function (res) {
      $$('.tm-react[data-react="' + id + '"]').forEach(function (b) {
        b.classList.toggle('is-on', res.reacted);
        b.setAttribute('aria-pressed', res.reacted ? 'true' : 'false');
        b.querySelector('i').className = res.reacted ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
        b.querySelector('span').textContent = String(res.count);
      });
    }).catch(function (error) { toast(error.message, 'warning'); })
      .then(function () { if (btn) btn.disabled = false; });
  }

  // ---------------- Detalle y comentarios ----------------
  function openDetail(id, focusComment) {
    var dialog = $('#tmDetailDialog');
    var body = $('#tmDetailBody');
    body.textContent = '';
    body.appendChild(el('p', 'tm-loading', 'Cargando experiencia…'));
    openDialog(dialog);
    API.call('get', { id: id }).then(function (data) {
      renderDetail(data.item, data.comments || []);
      try { history.replaceState(null, '', 'testimonios.html?experiencia=' + encodeURIComponent(id)); } catch (_) {}
      if (focusComment) { var box = $('#tmCommentText'); if (box) box.focus(); }
    }).catch(function (error) {
      body.textContent = '';
      body.appendChild(el('p', 'tm-state is-error', error.message));
    });
  }

  function renderDetail(item, comments) {
    var body = $('#tmDetailBody');
    body.textContent = '';
    $('#tmDetailTitle').textContent = item.title;
    var head = el('div', 'tm-detail-head');
    head.appendChild(avatar(item.author_name, item.author_avatar));
    var who = el('div', 'tm-card-who');
    who.appendChild(el('strong', null, item.author_name));
    who.appendChild(el('small', null, [relativeDate(item.published_at || item.created_at), visitLabel(item.visit_month)].filter(Boolean).join(' · ')));
    head.appendChild(who);
    if (item.rating) head.appendChild(stars(item.rating));
    body.appendChild(head);
    if (item.status && item.status !== 'published') {
      var pending = el('p', 'tm-pending');
      pending.appendChild(icon('fa-regular fa-hourglass-half'));
      pending.append(item.status === 'pending_review' ? ' En revisión: solo vos la ves hasta que el equipo la apruebe.' : ' Estado: ' + item.status.replace('_', ' ') + (item.moderation_note ? ' · ' + item.moderation_note : ''));
      body.appendChild(pending);
    }
    var place = placeLine(item);
    var url = placeUrl(item);
    if (place) {
      var line = el(url ? 'a' : 'p', 'tm-card-place');
      if (url) line.href = url;
      line.appendChild(icon('fa-solid fa-location-dot'));
      line.append(' ' + place + (url ? ' · Ver destino' : ''));
      body.appendChild(line);
    }
    if (item.experience_type) body.appendChild(el('span', 'tm-type', TYPE_NAME[item.experience_type] || item.experience_type));
    body.appendChild(el('p', 'tm-detail-text', item.body));
    if (item.recommendations) { body.appendChild(el('h4', 'tm-subtitle', 'Recomendaciones')); body.appendChild(el('p', 'tm-detail-text', item.recommendations)); }
    if (item.tips) { body.appendChild(el('h4', 'tm-subtitle', 'Consejos para otros viajeros')); body.appendChild(el('p', 'tm-detail-text', item.tips)); }
    if (item.media && item.media.length) body.appendChild(detailGallery(item));
    var bar = el('div', 'tm-card-foot');
    var like = el('button', 'tm-action tm-react' + (item.reacted ? ' is-on' : ''));
    like.type = 'button'; like.dataset.react = item.id;
    like.appendChild(icon(item.reacted ? 'fa-solid fa-heart' : 'fa-regular fa-heart'));
    like.appendChild(el('span', null, String(item.reactions_count || 0)));
    like.setAttribute('aria-label', 'Me inspira');
    var rep = el('button', 'tm-action tm-report');
    rep.type = 'button'; rep.dataset.report = item.id; rep.appendChild(icon('fa-regular fa-flag')); rep.append(' Denunciar');
    bar.append(like, rep);
    if (item.is_mine) {
      var del = el('button', 'tm-action tm-danger');
      del.type = 'button'; del.dataset.deleteTestimonial = item.id; del.appendChild(icon('fa-regular fa-trash-can')); del.append(' Eliminar mi experiencia');
      bar.appendChild(del);
    }
    body.appendChild(bar);
    body.appendChild(commentsSection(item, comments));
  }

  function detailGallery(item) {
    var gallery = el('div', 'tm-gallery');
    item.media.forEach(function (m) {
      if (m.kind === 'image') {
        var a = el('a', 'tm-gallery-item');
        a.href = m.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
        var img = el('img');
        img.src = m.url; img.alt = 'Foto de ' + item.author_name + ' en ' + (item.destination_name || item.title);
        img.loading = 'lazy'; img.decoding = 'async';
        if (m.width && m.height) { img.width = m.width; img.height = m.height; }
        a.appendChild(img);
        gallery.appendChild(a);
      } else {
        // El video NO se descarga hasta que la persona toca "Reproducir".
        var wrap = el('div', 'tm-gallery-item tm-video');
        var poster = el('button', 'tm-video-poster');
        poster.type = 'button';
        poster.setAttribute('aria-label', 'Reproducir video' + (m.duration ? ' (' + Math.round(m.duration) + ' s)' : ''));
        if (m.thumb) { var p = el('img'); p.src = m.thumb; p.alt = ''; p.loading = 'lazy'; poster.appendChild(p); }
        var play = el('span', 'tm-play'); play.appendChild(icon('fa-solid fa-play')); poster.appendChild(play);
        poster.addEventListener('click', function () {
          var video = el('video');
          video.controls = true; video.preload = 'none'; video.playsInline = true;
          if (m.thumb) video.poster = m.thumb;
          video.src = m.url;
          wrap.replaceChildren(video);
          video.play().catch(function () {});
        });
        wrap.appendChild(poster);
        gallery.appendChild(wrap);
      }
    });
    return gallery;
  }

  function commentNode(c, item, byParent) {
    var li = el('li', 'tm-comment');
    li.dataset.commentId = c.id;
    var head = el('div', 'tm-comment-head');
    head.appendChild(avatar(c.author_name, c.author_avatar));
    var meta = el('div', 'tm-card-who');
    meta.appendChild(el('strong', null, c.author_name));
    meta.appendChild(el('small', null, relativeDate(c.created_at) + (c.edited ? ' · editado' : '')));
    head.appendChild(meta);
    li.appendChild(head);
    var text = el('p', 'tm-comment-text', c.body);
    li.appendChild(text);
    var actions = el('div', 'tm-comment-actions');
    if (!c.parent_id) { var reply = el('button', 'tm-link', 'Responder'); reply.type = 'button'; reply.dataset.reply = c.id; actions.appendChild(reply); }
    if (c.is_mine) {
      var edit = el('button', 'tm-link', 'Editar'); edit.type = 'button'; edit.dataset.editComment = c.id;
      var del = el('button', 'tm-link tm-danger', 'Eliminar'); del.type = 'button'; del.dataset.deleteComment = c.id;
      actions.append(edit, del);
    } else {
      var rep = el('button', 'tm-link', 'Denunciar'); rep.type = 'button'; rep.dataset.reportComment = c.id; rep.dataset.testimonial = item.id;
      actions.appendChild(rep);
    }
    li.appendChild(actions);
    var replies = byParent[c.id] || [];
    if (replies.length) {
      var ul = el('ul', 'tm-replies');
      replies.forEach(function (r) { ul.appendChild(commentNode(r, item, byParent)); });
      li.appendChild(ul);
    }
    return li;
  }

  function commentsSection(item, comments) {
    var section = el('section', 'tm-comments');
    section.setAttribute('aria-label', 'Comentarios');
    section.appendChild(el('h4', 'tm-subtitle', 'Comentarios (' + comments.length + ')'));
    var byParent = {};
    comments.forEach(function (c) { if (c.parent_id) (byParent[c.parent_id] = byParent[c.parent_id] || []).push(c); });
    var list = el('ul', 'tm-comment-list');
    comments.filter(function (c) { return !c.parent_id; }).forEach(function (c) { list.appendChild(commentNode(c, item, byParent)); });
    if (!list.children.length) list.appendChild(el('li', 'tm-empty-comments', item.status === 'published' ? 'Sé la primera persona en comentar.' : 'Los comentarios se habilitan cuando la experiencia se publica.'));
    section.appendChild(list);
    if (item.status === 'published') {
      var form = el('form', 'tm-comment-form');
      form.dataset.testimonial = item.id;
      form.innerHTML = '<label class="sr-only" for="tmCommentText">Escribí un comentario</label><textarea id="tmCommentText" rows="2" maxlength="1500" placeholder="Escribí un comentario respetuoso…" required></textarea><input type="hidden" name="parent"><div class="tm-comment-form-row"><span class="tm-replying" hidden></span><button class="tm-btn tm-btn-primary" type="submit">Comentar</button></div>';
      section.appendChild(form);
    }
    return section;
  }

  function submitComment(form) {
    var id = form.dataset.testimonial;
    if (!requireLogin({ action: 'comment', id: id })) return;
    var textarea = $('textarea', form);
    var parent = form.querySelector('input[name="parent"]').value || null;
    var body = textarea.value.trim();
    if (!body) { textarea.focus(); return; }
    var button = $('button[type="submit"]', form);
    button.disabled = true;
    API.call('comment', { testimonial_id: id, parent_id: parent, body: body }).then(function () {
      textarea.value = '';
      toast('Comentario publicado.', 'success');
      openDetail(id, false);
    }).catch(function (error) { toast(error.message, 'warning'); })
      .then(function () { button.disabled = false; });
  }

  // ---------------- Denuncias ----------------
  function openReport(testimonialId, commentId) {
    if (!requireLogin({ action: 'report', id: testimonialId, commentId: commentId })) return;
    var dialog = $('#tmReportDialog');
    var form = $('#tmReportForm');
    form.reset();
    form.dataset.testimonial = commentId ? '' : testimonialId;
    form.dataset.comment = commentId || '';
    $('#tmReportStatus').textContent = '';
    openDialog(dialog);
  }

  function submitReport(form) {
    var reason = (form.querySelector('input[name="reason"]:checked') || {}).value;
    if (!reason) { $('#tmReportStatus').textContent = 'Elegí un motivo.'; return; }
    var payload = { reason: reason, details: $('#tmReportDetails').value };
    if (form.dataset.comment) payload.comment_id = form.dataset.comment; else payload.testimonial_id = form.dataset.testimonial;
    API.call('report', payload).then(function (res) {
      closeDialog($('#tmReportDialog'));
      toast(res.duplicate ? 'Ya habías enviado esta denuncia. Gracias.' : 'Gracias. El equipo BAQUEANO revisará el contenido.', 'success');
    }).catch(function (error) { $('#tmReportStatus').textContent = error.message; });
  }

  // ---------------- Comparte tu experiencia ----------------
  function loadPlaces() {
    if (state.places) return Promise.resolve(state.places);
    return fetch('data/search-index.json?v=2026-10-04', { cache: 'force-cache' }).then(function (r) { return r.json(); }).then(function (json) {
      var depByName = {};
      (json.records || []).filter(function (r) { return r.k === 'departamento'; }).forEach(function (r) {
        var id = (/id=([^&]+)/.exec(r.u) || [])[1];
        if (id) depByName[norm(r.t)] = decodeURIComponent(id).replace(/-/g, '_');
      });
      state.places = (json.records || []).filter(function (r) { return ['destino', 'lugar', 'departamento', 'municipio'].indexOf(r.k) !== -1; }).map(function (r) {
        var ref = (/destino\.html\?id=([^&]+)/.exec(r.u) || [])[1];
        return { title: r.t, ref: ref ? decodeURIComponent(ref) : null, department: depByName[norm(r.dep || (r.k === 'departamento' ? r.t : ''))] || null };
      });
      var list = $('#tmPlacesList');
      var seen = {};
      state.places.forEach(function (p) {
        if (seen[p.title]) return;
        seen[p.title] = true;
        var option = document.createElement('option');
        option.value = p.title;
        list.appendChild(option);
      });
      return state.places;
    }).catch(function () { state.places = []; return state.places; });
  }

  function saveDraft() {
    var form = $('#tmComposeForm');
    var data = {};
    $$('input[name], select[name], textarea[name]', form).forEach(function (f) { if (f.type !== 'file' && f.type !== 'checkbox' && f.type !== 'radio') data[f.name] = f.value; });
    var rating = form.querySelector('input[name="rating"]:checked');
    if (rating) data.rating = rating.value;
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch (_) {}
  }
  function restoreDraft() {
    var form = $('#tmComposeForm');
    var data = null;
    try { data = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null'); } catch (_) {}
    if (!data) return;
    Object.keys(data).forEach(function (name) {
      if (name === 'rating') { var r = form.querySelector('input[name="rating"][value="' + data.rating + '"]'); if (r) r.checked = true; return; }
      var field = form.querySelector('[name="' + name + '"]');
      if (field && field.type !== 'file') field.value = data[name];
    });
  }

  function openComposer() {
    if (state.service === false) { toast('La comunidad de viajeros se está habilitando. Volvé pronto para compartir tu experiencia.', 'info'); return; }
    if (!requireLogin({ action: 'compose' })) { saveDraft(); return; }
    loadPlaces();
    restoreDraft();
    $('#tmComposeStatus').textContent = '';
    openDialog($('#tmComposeDialog'));
    window.setTimeout(function () { $('#tmTitle').focus(); }, 30);
  }

  function renderPreviews() {
    var box = $('#tmPreviews');
    box.textContent = '';
    state.files.forEach(function (f, index) {
      var item = el('div', 'tm-preview');
      if (f.previewUrl) {
        var img = el('img');
        img.src = f.previewUrl; img.alt = '';
        item.appendChild(img);
      }
      if (f.prepared && f.prepared.kind === 'video') { var play = el('span', 'tm-play'); play.appendChild(icon('fa-solid fa-play')); item.appendChild(play); }
      if (!f.prepared) item.appendChild(el('span', 'tm-preview-status', f.error || 'Optimizando…'));
      var remove = el('button', 'tm-preview-remove');
      remove.type = 'button';
      remove.dataset.removeFile = String(index);
      remove.setAttribute('aria-label', 'Quitar archivo');
      remove.appendChild(icon('fa-solid fa-xmark'));
      item.appendChild(remove);
      box.appendChild(item);
    });
    var hasMedia = state.files.some(function (f) { return f.prepared; });
    $('#tmPublicConsentRow').hidden = !hasMedia;
    $('#tmPublicConsent').required = hasMedia;
  }

  function addFiles(fileList) {
    var photos = state.files.filter(function (f) { return f.kind === 'image'; }).length;
    var videos = state.files.filter(function (f) { return f.kind === 'video'; }).length;
    Array.prototype.forEach.call(fileList, function (file) {
      var isVideo = /^video\//.test(file.type);
      if (isVideo && videos >= API.limits.videos) { toast('Máximo un video por experiencia.', 'warning'); return; }
      if (!isVideo && photos >= API.limits.photos) { toast('Máximo ' + API.limits.photos + ' fotos por experiencia.', 'warning'); return; }
      if (isVideo) videos += 1; else photos += 1;
      var entry = { kind: isVideo ? 'video' : 'image', file: file, prepared: null, previewUrl: null, error: null };
      state.files.push(entry);
      (isVideo ? API.videoInfo(file) : API.compressImage(file)).then(function (prepared) {
        entry.prepared = prepared;
        entry.previewUrl = URL.createObjectURL(prepared.thumb || prepared.blob);
        renderPreviews();
      }).catch(function (error) {
        state.files.splice(state.files.indexOf(entry), 1);
        toast(error.message, 'warning');
        renderPreviews();
      });
    });
    renderPreviews();
  }

  function composePayload(form) {
    var get = function (name) { var f = form.querySelector('[name="' + name + '"]'); return f ? f.value.trim() : ''; };
    var placeText = get('destination');
    var match = (state.places || []).find(function (p) { return norm(p.title) === norm(placeText); });
    var rating = form.querySelector('input[name="rating"]:checked');
    return {
      title: get('title'), body: get('body'),
      destination_name: placeText || null,
      destination_ref: match && match.ref ? match.ref : null,
      department_id: get('department') || (match && match.department) || null,
      municipality: get('municipality') || null,
      place_name: get('place') || null,
      visit_month: get('visit') || null,
      rating: rating ? Number(rating.value) : null,
      experience_type: get('type') || null,
      tags: get('tags').split(/[,#]/).map(function (t) { return t.trim(); }).filter(Boolean).slice(0, 8),
      recommendations: get('recommendations') || null,
      tips: get('tips') || null
    };
  }

  function submitCompose(form) {
    if (state.busy) return;
    if (!state.user) { saveDraft(); requireLogin({ action: 'compose' }); return; }
    if (!form.reportValidity()) return;
    if (state.files.some(function (f) { return !f.prepared; })) { $('#tmComposeStatus').textContent = 'Esperá a que terminen de optimizarse las fotos o el video.'; return; }
    var status = $('#tmComposeStatus');
    var submit = $('#tmComposeSubmit');
    state.busy = true;
    submit.disabled = true;
    status.textContent = 'Guardando tu experiencia…';
    var payload = composePayload(form);
    API.call('create', payload).then(function (res) {
      var id = res.id;
      var uploads = state.files.filter(function (f) { return f.prepared; });
      return uploads.reduce(function (chain, f, index) {
        return chain.then(function () {
          status.textContent = 'Subiendo ' + (f.kind === 'video' ? 'el video' : 'foto ' + (index + 1)) + ' de ' + uploads.length + '…';
          return API.uploadMedia(id, f.prepared, index, function (step) { if (step === 'verificando') status.textContent = 'Verificando archivo ' + (index + 1) + '…'; });
        });
      }, Promise.resolve()).then(function () { return id; });
    }).then(function () {
      try { sessionStorage.removeItem(DRAFT_KEY); } catch (_) {}
      form.reset();
      state.files.forEach(function (f) { if (f.previewUrl) URL.revokeObjectURL(f.previewUrl); });
      state.files = [];
      renderPreviews();
      closeDialog($('#tmComposeDialog'));
      toast('¡Gracias! Tu experiencia quedó en revisión y se publicará cuando el equipo la apruebe.', 'success');
      loadMine();
    }).catch(function (error) {
      status.textContent = error.message;
    }).then(function () { state.busy = false; submit.disabled = false; });
  }

  // ---------------- Mis experiencias ----------------
  var STATUS_LABEL = { pending_review: 'En revisión', published: 'Publicada', rejected: 'Rechazada', hidden: 'Oculta', reported: 'En revisión por denuncias', draft: 'Borrador', archived: 'Archivada' };
  function loadMine() {
    var section = $('#tmMine');
    if (!state.user || state.service === false) { section.hidden = true; return; }
    API.call('mine', {}).then(function (data) {
      var list = $('#tmMineList');
      list.textContent = '';
      (data.items || []).forEach(function (item) {
        var row = el('li', 'tm-mine-item');
        var open = el('button', 'tm-link', item.title);
        open.type = 'button'; open.dataset.open = item.id;
        row.appendChild(open);
        row.appendChild(el('span', 'tm-status is-' + item.status, STATUS_LABEL[item.status] || item.status));
        list.appendChild(row);
      });
      section.hidden = !list.children.length;
    }).catch(function () { section.hidden = true; });
  }

  // Diálogos BAQUEANO en lugar de confirm()/prompt() del navegador (2026-10-06).
  function bqAsk(message, options) { return window.BaqueanoDialog ? window.BaqueanoDialog.confirm(message, options || {}) : Promise.resolve(false); }
  function deleteTestimonial(id) {
    bqAsk('¿Eliminar tu experiencia y sus fotos? Esta acción no se puede deshacer.', { danger: true, confirmText: 'Eliminar' }).then(function (ok) {
    if (!ok) return;
    API.call('delete', { id: id }).then(function () {
      closeDialog($('#tmDetailDialog'));
      toast('Experiencia eliminada.', 'success');
      loadFeed(true); loadMine();
    }).catch(function (error) { toast(error.message, 'warning'); });
    });
  }

  // ---------------- Eventos ----------------
  function bind() {
    document.addEventListener('click', function (e) {
      var t = e.target.closest('button, a');
      if (!t) return;
      if (t.dataset.compose) { e.preventDefault(); openComposer(); return; }
      if (t.dataset.react) { e.preventDefault(); react(t.dataset.react, t); return; }
      if (t.dataset.open) { e.preventDefault(); openDetail(t.dataset.open, t.dataset.focusComment === '1'); return; }
      if (t.dataset.report) { e.preventDefault(); openReport(t.dataset.report, null); return; }
      if (t.dataset.reportComment) { e.preventDefault(); openReport(t.dataset.testimonial, t.dataset.reportComment); return; }
      if (t.dataset.removeFile) {
        var f = state.files.splice(Number(t.dataset.removeFile), 1)[0];
        if (f && f.previewUrl) URL.revokeObjectURL(f.previewUrl);
        renderPreviews(); return;
      }
      if (t.dataset.reply) {
        if (!requireLogin({ action: 'comment', id: $('.tm-comment-form') && $('.tm-comment-form').dataset.testimonial })) return;
        var form = $('.tm-comment-form');
        if (!form) return;
        form.querySelector('input[name="parent"]').value = t.dataset.reply;
        var tag = form.querySelector('.tm-replying');
        tag.hidden = false;
        tag.textContent = 'Respondiendo a un comentario · ';
        var cancel = el('button', 'tm-link', 'cancelar');
        cancel.type = 'button';
        cancel.addEventListener('click', function () { form.querySelector('input[name="parent"]').value = ''; tag.hidden = true; });
        tag.appendChild(cancel);
        form.querySelector('textarea').focus();
        return;
      }
      if (t.dataset.editComment) {
        var li = t.closest('.tm-comment');
        var text = li.querySelector('.tm-comment-text');
        var editing = window.BaqueanoDialog ? window.BaqueanoDialog.prompt('Editá tu comentario:', { value: text.textContent, multiline: true, maxLength: 1000 }) : Promise.resolve(null);
        editing.then(function (updated) {
          if (updated == null || !updated.trim() || updated.trim() === text.textContent) return;
          API.call('edit_comment', { id: t.dataset.editComment, body: updated.trim() }).then(function (res) { text.textContent = res.body; toast('Comentario actualizado.', 'success'); })
            .catch(function (error) { toast(error.message, 'warning'); });
        });
        return;
      }
      if (t.dataset.deleteComment) {
        bqAsk('¿Eliminar tu comentario?', { danger: true, confirmText: 'Eliminar' }).then(function (ok) {
          if (!ok) return;
          API.call('delete_comment', { id: t.dataset.deleteComment }).then(function () { var node = t.closest('.tm-comment'); if (node) node.remove(); toast('Comentario eliminado.', 'success'); })
            .catch(function (error) { toast(error.message, 'warning'); });
        });
        return;
      }
      if (t.dataset.deleteTestimonial) { deleteTestimonial(t.dataset.deleteTestimonial); return; }
      if (t.dataset.closeDialog) { closeDialog(t.closest('dialog')); return; }
    });

    document.addEventListener('submit', function (e) {
      var form = e.target;
      if (form.classList.contains('tm-comment-form')) { e.preventDefault(); submitComment(form); }
      else if (form.id === 'tmComposeForm') { e.preventDefault(); submitCompose(form); }
      else if (form.id === 'tmReportForm') { e.preventDefault(); submitReport(form); }
      else if (form.id === 'tmFilters') { e.preventDefault(); }
    });

    $$('dialog').forEach(function (dialog) {
      dialog.addEventListener('click', function (e) { if (e.target === dialog) closeDialog(dialog); });
      dialog.addEventListener('cancel', function (e) { e.preventDefault(); closeDialog(dialog); });
    });

    var timer = null;
    $('#tmSearch').addEventListener('input', function (e) {
      clearTimeout(timer);
      timer = setTimeout(function () { state.filters.q = e.target.value.trim(); loadFeed(true); }, 350);
    });
    $('#tmSort').addEventListener('change', function (e) { state.filters.sort = e.target.value; loadFeed(true); });
    $('#tmDepartment').addEventListener('change', function (e) { state.filters.department = e.target.value; loadFeed(true); });
    $('#tmType').addEventListener('change', function (e) { state.filters.type = e.target.value; loadFeed(true); });
    $$('[data-media-filter]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var value = chip.dataset.mediaFilter;
        state.filters.media = state.filters.media === value ? '' : value;
        $$('[data-media-filter]').forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.mediaFilter === state.filters.media)); });
        loadFeed(true);
      });
    });
    $('#tmDestinationChip').addEventListener('click', function () {
      state.filters.destination = '';
      this.hidden = true;
      try { history.replaceState(null, '', 'testimonios.html'); } catch (_) {}
      loadFeed(true);
    });
    $('#tmClear').addEventListener('click', function () {
      state.filters = { sort: 'recent', media: '', department: '', type: '', destination: '', q: '' };
      $('#tmFilters').reset();
      $('#tmDestinationChip').hidden = true;
      $$('[data-media-filter]').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
      loadFeed(true);
    });
    $('#tmLoadMore').addEventListener('click', function () { state.page += 1; loadFeed(false); });
    $('#tmFiles').addEventListener('change', function (e) { addFiles(e.target.files); e.target.value = ''; });
    $('#tmLoginGoogle').addEventListener('click', function () {
      var msg = $('#tmLoginMessage');
      msg.textContent = 'Abriendo la ventana segura de Google…';
      var session = window.BaqueanoSession;
      var attempt = session && session.loginWithGoogle ? session.loginWithGoogle() : Promise.reject(new Error('El servicio de sesión no cargó. Recargá la página.'));
      attempt.then(function () { msg.textContent = ''; }).catch(function (error) { msg.textContent = error.message; });
    });
  }

  function fillSelects() {
    var addOptions = function (select, list) {
      list.forEach(function (pair) { var o = document.createElement('option'); o.value = pair[0]; o.textContent = pair[1]; select.appendChild(o); });
    };
    addOptions($('#tmDepartment'), DEPARTMENTS);
    addOptions($('#tmComposeDepartment'), DEPARTMENTS);
    addOptions($('#tmType'), TYPES);
    addOptions($('#tmComposeType'), TYPES);
    var reasons = $('#tmReasons');
    REASONS.forEach(function (pair) {
      var label = el('label', 'tm-radio');
      var input = el('input');
      input.type = 'radio'; input.name = 'reason'; input.value = pair[0];
      label.append(input, ' ' + pair[1]);
      reasons.appendChild(label);
    });
    var visit = $('#tmVisit');
    var now = new Date();
    visit.max = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  }

  function watchAuth() {
    var bindAuth = function () {
      try {
        if (!window.firebase || !window.firebase.auth) return false;
        window.firebase.auth().onAuthStateChanged(function (user) {
          state.user = user || null;
          document.documentElement.classList.toggle('tm-signed-in', Boolean(user));
          loadMine();
          if (user) onLogin();
        });
        return true;
      } catch (_) { return false; }
    };
    if (!bindAuth()) {
      var tries = 0;
      var timer = setInterval(function () { tries += 1; if (bindAuth() || tries > 40) clearInterval(timer); }, 250);
    }
  }

  function init() {
    if (!API) { setFeedMessage('error', 'No se pudo iniciar la comunidad.', 'Recargá la página.', false); return; }
    fillSelects();
    readFiltersFromUrl();
    bind();
    watchAuth();
    var params = new URLSearchParams(window.location.search);
    API.available().then(function (ok) {
      state.service = ok;
      if (!ok) {
        $('#tmUnavailable').hidden = false;
        setFeedMessage('error', 'La comunidad de viajeros se está habilitando.', 'Muy pronto vas a poder leer y compartir experiencias reales de Nicaragua. No mostramos publicaciones de ejemplo.', false);
        return;
      }
      loadFeed(true);
      if (params.get('experiencia')) openDetail(params.get('experiencia'), false);
      if (params.get('accion') === 'compartir') openComposer();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})(window, document);
