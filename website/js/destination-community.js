// ============================================================================
// 🧭 BAQUEANO — EXPERIENCIAS DE VIAJEROS EN LA FICHA DE DESTINO (destination-community.js)
// ============================================================================
// 🎯 POR QUÉ:
// - Quien mira un destino quiere saber qué vivieron otros viajeros reales
//   ahí mismo (4C: Consumer + Communication). Las experiencias aprobadas en la
//   comunidad deben verse en la ficha, no solo en testimonios.html.
//
// ⚙️ CÓMO:
// - Lee ?id= de destino.html (mismo identificador que `destination_ref` de
//   las experiencias) y pide `destination_feed` a la Edge Function
//   baqueano-community vía window.BaqueanoCommunity (lectura pública: solo
//   lo publicado y aprobado por el Ops Center).
// - Se monta debajo de la ficha sin tocar su render: espera a que
//   #destinoContentCard tenga la ficha (MutationObserver con límite).
// - Todo texto de usuarios se pinta con textContent; miniaturas con tamaño
//   fijo, lazy y async. Si el servicio no responde, la sección no aparece
//   (nunca se muestran testimonios de ejemplo).
//
// 📦 QUÉ:
// - Sección "Lo que cuentan los viajeros" con hasta 3 experiencias y botones
//   "Ver todas" (testimonios.html?destino=) y "Compartí la tuya"
//   (testimonios.html?accion=compartir).
// ============================================================================
(function (window, document) {
  'use strict';

  var ID_PATTERN = /^[A-Za-z0-9_\-]{1,120}$/;

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
    return el('i', { className: 'fa-solid ' + name, 'aria-hidden': 'true' });
  }

  function excerpt(text, max) {
    var clean = String(text || '').replace(/\s+/g, ' ').trim();
    return clean.length > max ? clean.slice(0, max - 1).replace(/\s+\S*$/, '') + '…' : clean;
  }

  function monthLabel(value) {
    if (!value) return null;
    var date = new Date(value);
    if (!isFinite(date.getTime())) return null;
    try { return date.toLocaleDateString('es-NI', { month: 'long', year: 'numeric', timeZone: 'UTC' }); } catch (_) { return null; }
  }

  function card(item) {
    var media = (item.media || [])[0];
    var thumb = media ? (media.thumb || (media.kind === 'image' ? media.url : null)) : null;
    var visit = monthLabel(item.visit_month);
    var stars = Number(item.rating) >= 1 && Number(item.rating) <= 5 ? Number(item.rating) : 0;
    return el('a', {
      className: 'bq-dest-community-card',
      href: 'testimonios.html?experiencia=' + encodeURIComponent(item.id)
    }, [
      thumb ? el('img', { src: thumb, alt: '', width: 320, height: 180, loading: 'lazy', decoding: 'async', className: 'bq-dest-community-thumb' }) : null,
      el('div', { className: 'bq-dest-community-body' }, [
        stars ? el('span', { className: 'bq-dest-community-stars', 'aria-label': stars + ' de 5 estrellas', text: '★★★★★'.slice(0, stars) + '☆☆☆☆☆'.slice(0, 5 - stars) }) : null,
        el('strong', { className: 'bq-dest-community-title', text: item.title }),
        el('p', { className: 'bq-dest-community-text', text: excerpt(item.body, 180) }),
        el('span', { className: 'bq-dest-community-meta' }, [
          icon('fa-user'), ' ', item.author_name || 'Viajero BAQUEANO',
          visit ? ' · ' + visit : '',
          item.verified_visit ? el('span', { className: 'bq-dest-community-verified' }, [' ', icon('fa-certificate'), ' Visita verificada']) : null
        ])
      ])
    ]);
  }

  function section(destId, items) {
    var cta = el('div', { className: 'bq-dest-community-actions' }, [
      el('a', { className: 'bq-dest-community-btn primary', href: 'testimonios.html?accion=compartir' }, [icon('fa-pen-to-square'), ' Compartí tu experiencia']),
      items.length ? el('a', { className: 'bq-dest-community-btn', href: 'testimonios.html?destino=' + encodeURIComponent(destId) }, [icon('fa-people-group'), ' Ver todas las experiencias']) : null
    ]);
    return el('section', { className: 'bq-dest-community', id: 'destinoComunidad', 'aria-labelledby': 'destinoComunidadTitle' }, [
      el('div', { className: 'bq-dest-community-head' }, [
        el('h2', { id: 'destinoComunidadTitle' }, [icon('fa-comments'), ' Lo que cuentan los viajeros']),
        el('p', { text: items.length ? 'Experiencias reales de la comunidad BAQUEANO, revisadas por nuestro equipo.' : 'Todavía nadie compartió su experiencia en este destino. ¡Podés ser la primera persona!' })
      ]),
      items.length ? el('div', { className: 'bq-dest-community-grid' }, items.map(card)) : null,
      cta
    ]);
  }

  function mount(destId) {
    var client = window.BaqueanoCommunity;
    var host = document.getElementById('mainContent');
    if (!client || !host || document.getElementById('destinoComunidad')) return;
    client.call('destination_feed', { destination: destId, limit: 3 }).then(function (data) {
      if (document.getElementById('destinoComunidad')) return;
      var items = Array.isArray(data && data.items) ? data.items : [];
      host.appendChild(section(destId, items));
    }).catch(function () { /* servicio no disponible: la ficha sigue igual */ });
  }

  function start() {
    var destId = new URLSearchParams(window.location.search).get('id') || '';
    if (!ID_PATTERN.test(destId)) return;
    var card = document.getElementById('destinoContentCard');
    if (!card) return;
    // La ficha está lista cuando aparece su portada; hasta entonces se observa.
    if (card.querySelector('.bq-dossier-hero')) { mount(destId); return; }
    var observer = new MutationObserver(function () {
      if (!card.querySelector('.bq-dossier-hero')) return;
      observer.disconnect();
      mount(destId);
    });
    observer.observe(card, { childList: true, subtree: true });
    setTimeout(function () { observer.disconnect(); }, 15000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})(window, document);
