// ============================================================================
// 🧭 BAQUEANO — TESTIMONIOS DE LA PORTADA = COMUNIDAD REAL (home-community.js)
// ============================================================================
// 🎯 POR QUÉ:
// - La portada y testimonios.html son una sola comunidad (directiva del
//   propietario). Las experiencias reales deben verse en una galería en
//   movimiento continuo que se detiene para que la gente pueda reaccionar y
//   comentar sin salir de la portada. Nunca se muestran reseñas de ejemplo.
//
// ⚙️ CÓMO:
// 1. `list` (hasta 12) a la Edge Function baqueano-community vía
//    window.BaqueanoCommunity: solo lo aprobado en el Ops Center.
// 2. Con 3 o más experiencias: galería infinita. La pista contiene el set
//    real + una copia idéntica (aria-hidden, sin foco) y se desplaza con
//    `transform` (GPU, 60 fps) de 0 a -50 %; el bucle no tiene saltos.
//    Se pausa al pasar el mouse, al enfocar, al tocar y con el botón
//    Pausar/Reanudar (WCAG 2.2.2). Con prefers-reduced-motion no se anima:
//    queda un carrusel deslizable con scroll-snap.
//    Con 1–2 experiencias: fila fija + tarjeta "Compartí tu experiencia".
// 3. Acciones por delegación (data-action + data-id) para que funcionen en
//    las tarjetas originales y en las copias: ♡ = `react`, Comentar abre un
//    panel en la portada que publica con `comment` (sesión de Firebase);
//    sin sesión invita a iniciar sesión en la experiencia.
// 4. Texto de usuarios siempre con textContent; avatares solo https.
//
// 📦 QUÉ:
// - Galería de testimonios reales con pausa, reacciones y comentarios en la
//   portada, y enlace al blog completo (testimonios.html).
// ============================================================================
(function (window, document) {
  'use strict';

  var LIMIT = 12;
  var MIN_MARQUEE = 3;
  var MIN_SET = 6;
  var SECONDS_PER_CARD = 7;
  var BLOG = 'testimonios.html';

  var state = { items: [], byId: {}, root: null, track: null, toggle: null, composer: null, manualPause: false, activeId: null };

  // --------------------------------------------------------------------------
  // Utilidades
  // --------------------------------------------------------------------------
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      var value = attrs[key];
      if (value == null || value === false) return;
      if (key === 'text') node.textContent = value;
      else if (key === 'className') node.className = value;
      else node.setAttribute(key, String(value));
    });
    (children || []).forEach(function (child) {
      if (child == null || child === false) return;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
    return node;
  }

  function icon(name) { return el('i', { className: name, 'aria-hidden': 'true' }); }

  function excerpt(text, max) {
    var clean = String(text || '').replace(/\s+/g, ' ').trim();
    return clean.length > max ? clean.slice(0, max - 1).replace(/\s+\S*$/, '') + '…' : clean;
  }

  function safeAvatar(value) { return typeof value === 'string' && /^https:\/\//.test(value) ? value : ''; }
  function detailUrl(id) { return BLOG + '?experiencia=' + encodeURIComponent(id); }
  function currentUser() {
    try { return window.firebase && window.firebase.auth ? window.firebase.auth().currentUser : null; } catch (_) { return null; }
  }
  function reducedMotion() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) { return false; }
  }

  // --------------------------------------------------------------------------
  // Tarjetas
  // --------------------------------------------------------------------------
  function avatar(item) {
    var name = item.author_name || 'Viajero BAQUEANO';
    var wrap = el('span', { className: 'test-avatar-img bq-test-avatar' });
    var url = safeAvatar(item.author_avatar);
    if (url) {
      var img = el('img', { src: url, alt: '', width: 38, height: 38, loading: 'lazy', decoding: 'async', referrerpolicy: 'no-referrer' });
      img.addEventListener('error', function () {
        wrap.textContent = name.charAt(0).toUpperCase() || 'B';
        wrap.classList.add('is-fallback');
      }, { once: true });
      wrap.appendChild(img);
    } else {
      wrap.textContent = name.charAt(0).toUpperCase() || 'B';
      wrap.classList.add('is-fallback');
    }
    return wrap;
  }

  function card(item, isCopy) {
    var stars = Number(item.rating) >= 1 && Number(item.rating) <= 5 ? Number(item.rating) : 0;
    var starRow = null;
    if (stars) {
      starRow = el('div', { className: 'test-stars-row', role: 'img', 'aria-label': stars + ' de 5 estrellas' });
      for (var i = 0; i < 5; i += 1) starRow.appendChild(icon((i < stars ? 'fa-solid' : 'fa-regular') + ' fa-star'));
    }
    var place = item.destination_name || item.place_name || item.municipality || '';
    var comments = Math.max(0, Number(item.comments_count) || 0);
    var reactions = Math.max(0, Number(item.reactions_count) || 0);
    var focus = isCopy ? '-1' : null;
    return el('article', { className: 'test-card-exact bq-home-community-card', 'data-id': item.id, 'aria-hidden': isCopy ? 'true' : null }, [
      starRow,
      el('a', { className: 'bq-home-community-link', href: detailUrl(item.id), tabindex: focus }, [
        el('strong', { className: 'bq-home-community-title', text: item.title }),
        el('p', { className: 'test-quote-text', text: '“' + excerpt(item.body, 150) + '”' })
      ]),
      el('div', { className: 'test-author-row' }, [
        avatar(item),
        el('div', { className: 'test-author-info' }, [
          el('h4', { text: item.author_name || 'Viajero BAQUEANO' }),
          el('span', { text: place ? 'Comunidad · ' + place : 'Viajero de la comunidad' })
        ])
      ]),
      el('div', { className: 'bq-test-actions' }, [
        el('button', { type: 'button', className: 'bq-test-action', 'data-action': 'like', 'aria-label': 'Me inspira', 'aria-pressed': item.reacted ? 'true' : 'false', tabindex: focus }, [
          icon((item.reacted ? 'fa-solid' : 'fa-regular') + ' fa-heart'), el('span', { className: 'bq-home-like-n', text: String(reactions) })
        ]),
        el('button', { type: 'button', className: 'bq-test-action', 'data-action': 'comment', tabindex: focus }, [
          icon('fa-regular fa-comment'), ' Comentar', el('span', { className: 'bq-home-community-count', text: comments ? '(' + comments + ')' : '' })
        ])
      ])
    ]);
  }

  function shareCard(isEmpty) {
    return el('article', { className: 'test-card-exact bq-home-community-cta' }, [
      icon('fa-solid fa-people-group bq-home-community-cta-icon'),
      el('strong', { className: 'bq-home-community-title', text: isEmpty ? 'Todavía no hay experiencias publicadas.' : '¿Ya viviste Nicaragua?' }),
      el('p', { className: 'test-quote-text', text: 'Contanos ese rincón que vale la pena conocer: cómo llegaste, qué te sorprendió y qué le recomendarías a otro viajero.' }),
      el('a', { className: 'bq-home-community-cta-btn', href: BLOG + '?accion=compartir' }, [icon('fa-solid fa-pen-to-square'), ' Compartí tu experiencia'])
    ]);
  }

  // Actualiza todas las copias de una tarjeta (original + clon del bucle).
  function updateCards(id, patch) {
    state.root.querySelectorAll('.bq-home-community-card[data-id="' + id + '"]').forEach(function (node) {
      if (patch.reacted != null) {
        var like = node.querySelector('[data-action="like"]');
        like.setAttribute('aria-pressed', patch.reacted ? 'true' : 'false');
        like.querySelector('i').className = (patch.reacted ? 'fa-solid' : 'fa-regular') + ' fa-heart';
      }
      if (patch.reactions != null) node.querySelector('.bq-home-like-n').textContent = String(patch.reactions);
      if (patch.comments != null) node.querySelector('.bq-home-community-count').textContent = patch.comments ? '(' + patch.comments + ')' : '';
    });
  }

  // --------------------------------------------------------------------------
  // Galería infinita y pausa
  // --------------------------------------------------------------------------
  function setPaused(paused) {
    if (!state.track) return;
    state.root.classList.toggle('is-paused', paused);
    if (state.toggle) {
      state.toggle.setAttribute('aria-pressed', paused ? 'true' : 'false');
      state.toggle.replaceChildren(icon(paused ? 'fa-solid fa-play' : 'fa-solid fa-pause'), paused ? ' Reanudar' : ' Pausar');
    }
  }

  function buildMarquee(items) {
    var set = [];
    while (set.length < MIN_SET) set = set.concat(items);
    var track = el('div', { className: 'bq-marquee-track' });
    set.forEach(function (item, index) { track.appendChild(card(item, index >= items.length)); });
    set.forEach(function (item) { track.appendChild(card(item, true)); });
    track.style.setProperty('--bq-marquee-duration', Math.max(30, set.length * SECONDS_PER_CARD) + 's');
    var viewport = el('div', { className: 'bq-marquee', role: 'region', 'aria-roledescription': 'carrusel', 'aria-label': 'Testimonios de la comunidad' }, [track]);
    state.track = track;
    return viewport;
  }

  // --------------------------------------------------------------------------
  // Comentar desde la portada
  // --------------------------------------------------------------------------
  function buildComposer() {
    var status = el('p', { className: 'bq-home-composer-status', role: 'status', 'aria-live': 'polite' });
    var textarea = el('textarea', { id: 'bqHomeComment', rows: 3, maxlength: 1500, required: true, placeholder: 'Escribí tu comentario para la comunidad…' });
    var target = el('strong', { className: 'bq-home-composer-target' });
    var loginLink = el('a', { className: 'bq-home-community-cta-btn', href: BLOG, hidden: true }, [icon('fa-solid fa-right-to-bracket'), ' Iniciá sesión para comentar']);
    var submit = el('button', { type: 'submit', className: 'bq-home-community-cta-btn' }, [icon('fa-solid fa-paper-plane'), ' Publicar comentario']);
    var form = el('form', { className: 'bq-home-composer', hidden: true, novalidate: true }, [
      el('div', { className: 'bq-home-composer-head' }, [
        el('div', null, [el('span', { text: 'Comentando:' }), ' ', target]),
        el('button', { type: 'button', className: 'bq-home-composer-close', 'data-close': '1', 'aria-label': 'Cerrar' }, [icon('fa-solid fa-xmark')])
      ]),
      el('label', { className: 'sr-only', for: 'bqHomeComment', text: 'Tu comentario' }),
      textarea,
      el('div', { className: 'bq-home-composer-actions' }, [loginLink, submit]),
      status
    ]);

    function close() {
      form.hidden = true;
      state.activeId = null;
      status.textContent = '';
      if (!state.manualPause) setPaused(false);
    }

    form.addEventListener('click', function (event) { if (event.target.closest('[data-close]')) close(); });
    form.addEventListener('keydown', function (event) { if (event.key === 'Escape') close(); });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var id = state.activeId;
      var body = textarea.value.trim();
      if (!id) return;
      if (!body) { textarea.focus(); return; }
      if (!currentUser()) { window.location.href = detailUrl(id); return; }
      submit.disabled = true;
      status.textContent = 'Publicando…';
      window.BaqueanoCommunity.call('comment', { testimonial_id: id, body: body }).then(function () {
        var item = state.byId[id];
        item.comments_count = (Number(item.comments_count) || 0) + 1;
        updateCards(id, { comments: item.comments_count });
        textarea.value = '';
        status.textContent = 'Comentario publicado. ¡Gracias por sumar a la comunidad!';
      }).catch(function (error) {
        if (error && error.status === 401) { window.location.href = detailUrl(id); return; }
        status.textContent = (error && error.message) || 'No se pudo publicar el comentario.';
      }).then(function () { submit.disabled = false; });
    });

    form.open = function (id) {
      var item = state.byId[id];
      if (!item) return;
      state.activeId = id;
      target.textContent = item.title;
      status.textContent = '';
      var logged = Boolean(currentUser());
      loginLink.hidden = logged;
      loginLink.href = detailUrl(id);
      submit.hidden = !logged;
      textarea.disabled = !logged;
      form.hidden = false;
      setPaused(true);
      (logged ? textarea : loginLink).focus({ preventScroll: true });
      form.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
    };
    return form;
  }

  function onAction(event) {
    var button = event.target.closest('[data-action]');
    if (!button) return;
    var cardNode = button.closest('[data-id]');
    var id = cardNode && cardNode.getAttribute('data-id');
    if (!id || !state.byId[id]) return;
    if (button.getAttribute('data-action') === 'comment') { state.composer.open(id); return; }
    // ♡ Me inspira
    if (!currentUser()) { window.location.href = detailUrl(id); return; }
    if (button.dataset.busy) return;
    button.dataset.busy = '1';
    window.BaqueanoCommunity.call('react', { testimonial_id: id, kind: 'like' }).then(function (res) {
      var item = state.byId[id];
      item.reacted = Boolean(res && res.reacted);
      item.reactions_count = Math.max(0, Number(res && res.count) || 0);
      updateCards(id, { reacted: item.reacted, reactions: item.reactions_count });
    }).catch(function (error) {
      if (error && error.status === 401) window.location.href = detailUrl(id);
    }).then(function () { delete button.dataset.busy; });
  }

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  function render(row, items) {
    state.items = items;
    state.byId = {};
    items.forEach(function (item) { state.byId[item.id] = item; });
    state.root = row;
    row.setAttribute('aria-busy', 'false');

    if (items.length < MIN_MARQUEE) {
      var nodes = items.map(function (item) { return card(item, false); });
      nodes.push(shareCard(items.length === 0));
      row.classList.remove('is-marquee');
      row.replaceChildren.apply(row, nodes);
      if (items.length) {
        state.composer = buildComposer();
        row.insertAdjacentElement('afterend', state.composer);
        row.addEventListener('click', onAction);
      }
      return;
    }

    row.classList.add('is-marquee');
    state.toggle = el('button', { type: 'button', className: 'bq-test-action bq-marquee-toggle', 'aria-pressed': 'false', 'aria-controls': 'bqHomeMarquee' }, [icon('fa-solid fa-pause'), ' Pausar']);
    state.toggle.addEventListener('click', function () {
      state.manualPause = !state.root.classList.contains('is-paused');
      setPaused(state.manualPause);
    });
    var marquee = buildMarquee(items);
    marquee.id = 'bqHomeMarquee';
    // Pausa táctil: tocar la galería la detiene hasta tocar fuera o usar el botón.
    marquee.addEventListener('pointerdown', function (event) { if (event.pointerType === 'touch') setPaused(true); });
    document.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'touch' && !state.manualPause && !state.activeId && !marquee.contains(event.target)) setPaused(false);
    });
    state.composer = buildComposer();
    var controls = el('div', { className: 'bq-marquee-controls' }, [
      state.toggle,
      el('a', { className: 'bq-home-community-cta-btn', href: BLOG + '?accion=compartir' }, [icon('fa-solid fa-pen-to-square'), ' Compartí tu experiencia'])
    ]);
    row.replaceChildren(marquee, controls, state.composer);
    row.addEventListener('click', onAction);
  }

  function start() {
    var row = document.querySelector('#testimoniosSection [data-community-feed]');
    if (!row) return;
    var client = window.BaqueanoCommunity;
    if (!client) { render(row, []); return; }
    client.call('list', { limit: LIMIT, sort: 'recent' }).then(function (data) {
      render(row, Array.isArray(data && data.items) ? data.items : []);
    }).catch(function () { render(row, []); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})(window, document);
