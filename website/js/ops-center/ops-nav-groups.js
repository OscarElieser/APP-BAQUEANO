// ============================================================================
// 🧭 BAQUEANO — OPS CENTER: MENÚ JERÁRQUICO PLEGABLE (ops-nav-groups.js)
// ============================================================================
// 🎯 POR QUÉ:
// - Plan de evolución (fase Ops Center): con más de 40 vistas en 6 grupos, el menú lateral
//   obligaba a desplazarse mucho. Cada grupo ahora se pliega y despliega.
//
// ⚙️ CÓMO:
// - Mejora progresiva sobre el HTML existente (no se borra ninguna vista): el título de cada
//   .ops-nav-group pasa a ser un botón con aria-expanded/aria-controls y sus enlaces quedan en un
//   contenedor que se oculta con [hidden].
// - El grupo de la vista activa siempre queda abierto (al cargar, al hacer clic y con #hash).
// - La preferencia de grupos plegados se recuerda por navegador (localStorage, con try/catch);
//   si no hay almacenamiento, todos empiezan abiertos.
// - Con la barra lateral contraída (solo íconos) se muestran todos los íconos (CSS).
//
// 📦 QUÉ: window.BaqueanoOpsNavGroups = { openFor(tabId) }.
// ============================================================================
(function (window, document) {
  'use strict';
  if (window.BaqueanoOpsNavGroups) return;
  var KEY = 'baqueano_ops_nav_collapsed_v1';

  function read() { try { return JSON.parse(window.localStorage.getItem(KEY) || '[]'); } catch (_) { return []; } }
  function write(list) { try { window.localStorage.setItem(KEY, JSON.stringify(list)); } catch (_) { /* sin almacenamiento */ } }
  function tr(key, fallback) {
    try { if (window.BaqueanoLanguage && window.BaqueanoLanguage.t) return window.BaqueanoLanguage.t(key, { fallback: fallback }) || fallback; } catch (_) { /* sin motor i18n */ }
    return fallback;
  }

  var groups = [];

  function setOpen(g, open, persist) {
    g.items.hidden = !open;
    g.button.setAttribute('aria-expanded', open ? 'true' : 'false');
    g.chevron.className = 'fa-solid ' + (open ? 'fa-chevron-down' : 'fa-chevron-right') + ' ops-nav-group-chevron';
    if (persist) {
      var list = read().filter(function (id) { return id !== g.id; });
      if (!open) list.push(g.id);
      write(list);
    }
  }

  function openFor(tabId) {
    groups.forEach(function (g) {
      if (tabId && g.items.querySelector('.ops-nav-item[data-tab="' + tabId + '"]')) setOpen(g, true, false);
    });
  }

  function init() {
    var collapsed = read();
    document.querySelectorAll('.ops-nav-group').forEach(function (group, i) {
      var title = group.querySelector(':scope > .ops-nav-group-title');
      if (!title || title.querySelector('button')) return;
      var id = 'opsNavGroup' + (i + 1);
      var items = document.createElement('div');
      items.className = 'ops-nav-group-items';
      items.id = id + 'Items';
      Array.prototype.slice.call(group.children).forEach(function (child) { if (child !== title) items.appendChild(child); });
      group.appendChild(items);
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'ops-nav-group-toggle';
      button.setAttribute('aria-controls', items.id);
      button.setAttribute('title', tr('opsNav.toggleGroup', 'Mostrar u ocultar este grupo'));
      var chevron = document.createElement('i');
      chevron.setAttribute('aria-hidden', 'true');
      var label = document.createElement('span');
      // El texto (y su data-i18n) se mueve al botón: el motor de idioma lo sigue traduciendo.
      label.textContent = title.textContent;
      if (title.getAttribute('data-i18n')) { label.setAttribute('data-i18n', title.getAttribute('data-i18n')); title.removeAttribute('data-i18n'); }
      title.textContent = '';
      button.appendChild(chevron); button.appendChild(label);
      title.appendChild(button);
      var g = { id: id, items: items, button: button, chevron: chevron };
      groups.push(g);
      setOpen(g, collapsed.indexOf(id) === -1, false);
      button.addEventListener('click', function () { setOpen(g, g.items.hidden, true); });
    });
    var current = decodeURIComponent((window.location.hash || '').slice(1));
    var active = document.querySelector('.ops-nav-item.active');
    openFor(current || (active ? active.getAttribute('data-tab') : ''));
    window.addEventListener('hashchange', function () { openFor(decodeURIComponent(window.location.hash.slice(1))); });
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init, { once: true }) : init();
  window.BaqueanoOpsNavGroups = { openFor: openFor };
})(window, document);
