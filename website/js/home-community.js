// ============================================================================
// 🧭 BAQUEANO — TESTIMONIOS DE LA PORTADA = COMUNIDAD REAL (home-community.js)
// ============================================================================
// 🎯 POR QUÉ:
// - La sección "Testimonios" de index.html mostraba tres reseñas de ejemplo
//   fijas y un formulario cuyos comentarios y "me gusta" vivían solo en el
//   localStorage de cada navegador (nadie más los veía). El propietario pidió
//   un único sistema: la portada y testimonios.html son la misma comunidad.
//
// ⚙️ CÓMO:
// - Pide `list` (featured primero, luego recientes) a la Edge Function
//   baqueano-community vía window.BaqueanoCommunity: solo experiencias
//   aprobadas en el Ops Center. Nunca se muestran testimonios de ejemplo.
// - ♡ = acción `react` real cuando hay sesión de Firebase; sin sesión lleva a
//   la experiencia en testimonios.html, que resuelve el inicio de sesión.
// - "Comentar" abre la experiencia con sus comentarios (testimonios.html).
// - Texto de usuarios siempre con textContent; avatares solo https; imágenes
//   lazy/async y de tamaño acotado por CSS.
//
// 📦 QUÉ:
// - Hasta 3 tarjetas reales con estrellas, extracto, autor, destino,
//   reacciones y comentarios, más una tarjeta "Compartí tu experiencia" que
//   completa la fila cuando hay menos de 3 publicaciones.
// ============================================================================
(function (window, document) {
  'use strict';

  var LIMIT = 3;
  var BLOG = 'testimonios.html';

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

  function icon(name) {
    return el('i', { className: name, 'aria-hidden': 'true' });
  }

  function excerpt(text, max) {
    var clean = String(text || '').replace(/\s+/g, ' ').trim();
    return clean.length > max ? clean.slice(0, max - 1).replace(/\s+\S*$/, '') + '…' : clean;
  }

  function safeAvatar(value) {
    return typeof value === 'string' && /^https:\/\//.test(value) ? value : '';
  }

  function detailUrl(item) {
    return BLOG + '?experiencia=' + encodeURIComponent(item.id);
  }

  function hasSession() {
    try { return Boolean(window.firebase && window.firebase.auth && window.firebase.auth().currentUser); } catch (_) { return false; }
  }

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

  function likeButton(item) {
    var count = Math.max(0, Number(item.reactions_count) || 0);
    var pressed = Boolean(item.reacted);
    var label = el('span', { text: String(count) });
    var heart = icon((pressed ? 'fa-solid' : 'fa-regular') + ' fa-heart');
    var button = el('button', { type: 'button', className: 'bq-test-action', 'aria-label': 'Me inspira', 'aria-pressed': pressed ? 'true' : 'false' }, [heart, label]);
    var busy = false;
    button.addEventListener('click', function () {
      var client = window.BaqueanoCommunity;
      if (!client || !hasSession()) { window.location.href = detailUrl(item); return; }
      if (busy) return;
      busy = true;
      client.call('react', { testimonial_id: item.id, kind: 'like' }).then(function (res) {
        var on = Boolean(res && res.reacted);
        button.setAttribute('aria-pressed', on ? 'true' : 'false');
        heart.className = (on ? 'fa-solid' : 'fa-regular') + ' fa-heart';
        label.textContent = String(Math.max(0, Number(res && res.count) || 0));
      }).catch(function (error) {
        if (error && error.status === 401) window.location.href = detailUrl(item);
      }).then(function () { busy = false; });
    });
    return button;
  }

  function card(item) {
    var stars = Number(item.rating) >= 1 && Number(item.rating) <= 5 ? Number(item.rating) : 0;
    var starRow = null;
    if (stars) {
      starRow = el('div', { className: 'test-stars-row', role: 'img', 'aria-label': stars + ' de 5 estrellas' });
      for (var i = 0; i < 5; i += 1) starRow.appendChild(icon((i < stars ? 'fa-solid' : 'fa-regular') + ' fa-star'));
    }
    var place = item.destination_name || item.place_name || item.municipality || '';
    var comments = Math.max(0, Number(item.comments_count) || 0);
    return el('article', { className: 'test-card-exact bq-home-community-card', 'data-id': item.id }, [
      starRow,
      el('a', { className: 'bq-home-community-link', href: detailUrl(item) }, [
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
        likeButton(item),
        el('a', { className: 'bq-test-action', href: detailUrl(item) + '#comentarios' }, [
          icon('fa-regular fa-comment'), ' Comentar', comments ? el('span', { className: 'bq-home-community-count', text: '(' + comments + ')' }) : null
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

  function render(row, items) {
    var nodes = items.slice(0, LIMIT).map(card);
    if (nodes.length < LIMIT) nodes.push(shareCard(nodes.length === 0));
    row.replaceChildren.apply(row, nodes);
    row.setAttribute('aria-busy', 'false');
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
