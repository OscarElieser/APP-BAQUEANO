/**
 * 🎯 POR QUÉ: "Ver más sobre nuestros pueblos", "Ver más personajes" y "Ver todas las fuentes"
 *   apuntaban a anclas inexistentes (#pueblosOriginarios, #personajes, #fuentes): el visitante
 *   tocaba y no pasaba nada (auditoría de botones 2026-10-06). Regla del proyecto: no inventar
 *   contenido. Estos enlaces muestran solo lo que la página YA documenta con fuente.
 * ⚙️ CÓMO: lee window.BAQUEANO_HISTORY_AUDIO (js/historia-audioguia-data.js: capítulos con
 *   personas y fuentes oficiales con URL).
 *   - Pueblos: abre el capítulo "pueblosOriginarios" de la audioguía, sin reproducirlo.
 *   - Personajes: diálogo con las personas citadas y el capítulo donde aparece cada una.
 *   - Fuentes: diálogo con todas las fuentes citadas (nombre y enlace oficial).
 *   Usa <dialog> nativo con showModal(): foco atrapado, cierre con Escape y foco de vuelta al
 *   enlace. El contenido se arma con textContent, sin HTML. Los href se conservan como respaldo.
 * 📦 QUÉ: tres enlaces funcionales en historia.html, en 6 idiomas (claves pages.historia.links.*).
 */
(function (window, document) {
  'use strict';
  var data = window.BAQUEANO_HISTORY_AUDIO;
  if (!data || !Array.isArray(data.chapters)) return;

  function t(key, fallback, vars) {
    var lang = window.BaqueanoLanguage;
    var text = (lang && typeof lang.t === 'function' && lang.t(key, Object.assign({ fallback: fallback }, vars || {}))) || fallback;
    return String(text).replace(/\{(\w+)\}/g, function (_, k) { return vars && vars[k] != null ? vars[k] : '{' + k + '}'; });
  }
  function el(tag, className, text) { var n = document.createElement(tag); if (className) n.className = className; if (text != null) n.textContent = text; return n; }
  function chapterTitle(id) { return t('pages.historia.audioguia.chapters.' + id + '.title', id); }

  var dialog = null; var opener = null;
  function openDialog(title, buildBody, trigger) {
    if (!dialog) {
      dialog = el('dialog', 'hist-links-dialog');
      dialog.setAttribute('aria-labelledby', 'histLinksTitle');
      dialog.addEventListener('close', function () { if (opener) opener.focus(); });
      dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
      document.body.append(dialog);
    }
    opener = trigger;
    var close = el('button', 'hist-links-close');
    close.type = 'button';
    close.setAttribute('aria-label', t('pages.historia.links.close', 'Cerrar'));
    var x = el('i', 'fa-solid fa-xmark'); x.setAttribute('aria-hidden', 'true'); close.append(x);
    close.addEventListener('click', function () { dialog.close(); });
    var h = el('h2', 'hist-links-title', title); h.id = 'histLinksTitle';
    var body = el('div', 'hist-links-body');
    buildBody(body);
    dialog.replaceChildren(close, h, body);
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
  }

  function sources() {
    var seen = {}; var list = [];
    data.chapters.forEach(function (c) {
      (c.sources || []).forEach(function (s) {
        if (!s || !s.url || seen[s.url]) return;
        seen[s.url] = { name: s.name, url: s.url, chapters: [] };
        list.push(seen[s.url]);
      });
      (c.sources || []).forEach(function (s) { if (s && seen[s.url]) seen[s.url].chapters.push(c.id); });
    });
    return list;
  }
  function people() {
    var map = {}; var list = [];
    data.chapters.forEach(function (c) {
      (c.people || []).forEach(function (p) {
        if (!map[p]) { map[p] = { name: p, chapters: [] }; list.push(map[p]); }
        map[p].chapters.push(c.id);
      });
    });
    return list.sort(function (a, b) { return a.name.localeCompare(b.name, 'es'); });
  }
  function goChapter(id) {
    if (dialog && dialog.open) dialog.close();
    if (window.BaqueanoHistoryAudio) window.BaqueanoHistoryAudio.showChapter(id);
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href="#pueblosOriginarios"], a[href="#personajes"], a[href="#fuentes"]');
    if (!link) return;
    var target = link.getAttribute('href').slice(1);
    event.preventDefault();
    if (target === 'pueblosOriginarios') { goChapter('pueblosOriginarios'); return; }
    if (target === 'personajes') {
      var list = people();
      openDialog(t('pages.historia.links.peopleTitle', 'Personajes citados en la audioguía'), function (body) {
        body.append(el('p', 'hist-links-intro', t('pages.historia.links.peopleIntro', 'Cada nombre aparece en uno o más capítulos verificados. Tocá un capítulo para escucharlo.')));
        var ul = el('ul', 'hist-links-list');
        list.forEach(function (p) {
          var li = el('li');
          var name = el('strong', '', p.name); name.setAttribute('translate', 'no');
          li.append(name, ' — ');
          p.chapters.forEach(function (id, i) {
            if (i) li.append(' · ');
            var b = el('button', 'hist-links-chapter', chapterTitle(id)); b.type = 'button';
            b.addEventListener('click', function () { goChapter(id); });
            li.append(b);
          });
          ul.append(li);
        });
        body.append(ul);
      }, link);
      return;
    }
    var srcs = sources();
    openDialog(t('pages.historia.links.sourcesTitle', 'Fuentes de esta página'), function (body) {
      body.append(el('p', 'hist-links-intro', t('pages.historia.links.sourcesIntro', '{count} fuentes oficiales y académicas citadas en la audioguía y la línea de tiempo.', { count: srcs.length })));
      var ul = el('ul', 'hist-links-list');
      srcs.forEach(function (s) {
        var li = el('li');
        var a = el('a', '', s.name); a.href = s.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
        li.append(a);
        var used = el('span', 'hist-links-used', ' — ' + s.chapters.map(chapterTitle).join(' · '));
        li.append(used);
        ul.append(li);
      });
      body.append(ul);
    }, link);
  });
})(window, document);
