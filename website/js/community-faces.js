// ============================================================================
// 🧭 BAQUEANO — FOTOS DE LA COMUNIDAD (estilo "personas que siguen esta página")
// ============================================================================
// 🎯 POR QUÉ: pedido del propietario (2026-10-07): en "Únete a la comunidad" mostrar las fotos de
//    los usuarios registrados, como Facebook, y avisar a cada persona dónde va a salir su foto y
//    qué puede hacer.
// ⚙️ CÓMO:
//    - Solo aparecen quienes activaron "Mostrar mi foto en la comunidad" en su perfil (permiso
//      explícito, se quita en cualquier momento). Los datos vienen de la acción pública
//      community_faces de baqueano-profile: primer nombre + foto, nunca correo ni teléfono.
//    - Hasta 8 fotos superpuestas y el total; si nadie se sumó todavía, invita a ser de los primeros
//      (sin cifras inventadas).
//    - Mensaje fijo: dónde sale la foto, qué se ve y cómo activarlo o quitarlo desde el perfil.
//    - Nombres y URLs se insertan con textContent / atributos (sin innerHTML con datos).
// 📦 QUÉ: rellena todo contenedor [data-community-faces]. Sin dependencias.
// ============================================================================
(function (window, document) {
  'use strict';
  var ENDPOINT = 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-profile';
  var MAX_SHOWN = 8;

  function t(key, fallback, vars) {
    var text = fallback;
    try { if (window.BaqueanoLanguage && window.BaqueanoLanguage.t) text = window.BaqueanoLanguage.t(key, { fallback: fallback }) || fallback; } catch (_) { text = fallback; }
    if (vars) Object.keys(vars).forEach(function (k) { text = text.split('{' + k + '}').join(String(vars[k])); });
    return text;
  }
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function render(box, data) {
    var faces = (data && data.faces) || [];
    var total = (data && data.total) || 0;
    box.replaceChildren();
    var row = el('div', 'bq-faces-row');
    var stack = el('ul', 'bq-faces-stack');
    stack.setAttribute('aria-label', t('communityFaces.label', 'Viajeros de la comunidad BAQUEANO'));
    faces.slice(0, MAX_SHOWN).forEach(function (f) {
      if (!f || typeof f.avatar !== 'string' || !/^https:\/\//.test(f.avatar)) return;
      var li = el('li', 'bq-faces-item');
      var img = document.createElement('img');
      img.src = f.avatar; img.alt = f.name || ''; img.title = f.name || '';
      img.width = 36; img.height = 36; img.loading = 'lazy'; img.decoding = 'async'; img.referrerPolicy = 'no-referrer';
      img.addEventListener('error', function () { li.remove(); });
      li.appendChild(img);
      stack.appendChild(li);
    });
    // "+N" = personas de la comunidad que no se ven en la fila (según las fotos realmente mostradas).
    var shown = stack.children.length;
    if (shown && total > shown) stack.appendChild(el('li', 'bq-faces-more', '+' + (total - shown)));
    if (stack.children.length) row.appendChild(stack);
    row.appendChild(el('p', 'bq-faces-count', total === 0
      ? t('communityFaces.empty', 'Sé de las primeras personas en aparecer aquí.')
      : total === 1 ? t('communityFaces.one', '1 viajero ya se unió') : t('communityFaces.many', '{n} viajeros ya se unieron', { n: total })));
    box.appendChild(row);

    var note = el('p', 'bq-faces-note');
    note.appendChild(el('i', 'fa-solid fa-circle-info'));
    note.firstChild.setAttribute('aria-hidden', 'true');
    note.appendChild(document.createTextNode(' ' + t('communityFaces.note', '¿Querés aparecer aquí? Activá «Mostrar mi foto en la comunidad» en tu perfil: se verán tu foto y tu primer nombre en esta sección. Podés quitarlo cuando quieras.')));
    box.appendChild(note);
    var link = el('a', 'bq-faces-link', t('communityFaces.cta', 'Mostrar mi foto aquí'));
    link.href = 'perfil.html#privacidad-datos';
    box.appendChild(link);
  }

  function load() {
    var boxes = document.querySelectorAll('[data-community-faces]');
    if (!boxes.length) return;
    fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'community_faces' }) })
      .then(function (res) { return res.ok ? res.json() : null; })
      .catch(function () { return null; })
      .then(function (data) {
        var payload = data && data.ok ? data : { faces: [], total: 0 };
        boxes.forEach(function (box) { box.__bqFaces = payload; render(box, payload); });
      });
  }
  // Al cambiar de idioma se vuelven a escribir los textos con los mismos datos.
  window.addEventListener('baqueano:languageChanged', function () {
    document.querySelectorAll('[data-community-faces]').forEach(function (box) { if (box.__bqFaces) render(box, box.__bqFaces); });
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load, { once: true });
  else load();
})(window, document);
