/**
 * 🧭 BAQUEANO — GALERÍA DE FOTOS POR PLAN (js/plan-gallery.js)
 * 🎯 POR QUÉ (propietario, 2026-10-21): las fichas no tenían galería y el límite de fotos de
 *   cada plan (Sendero 6, Mirador 20, Cumbre sin límite + video) no se podía cumplir.
 * ⚙️ CÓMO: habla con la Edge Function baqueano-plans (media_*) con la sesión de Firebase. La
 *   foto sube directo al almacenamiento con un enlace firmado de un solo uso y después se
 *   registra; la base controla el límite del plan. Lo del propietario queda «pendiente» hasta que
 *   el equipo lo aprueba; el equipo publica directo. Nada se borra: se retira con motivo.
 *   Textos con BaqueanoLanguage.t y textContent (i18n plans.gallery.*).
 * 📦 QUÉ: window.BaqueanoPlanGallery.mount(container, { call, businessId }) → Promise.
 *   `call(action, payload)` devuelve el cuerpo de la respuesta o lanza un Error con el mensaje.
 *   La usan planes.html (Mi plan) y el Ops Center (Compromisos del mes).
 */
(function (window, document) {
  'use strict';
  if (window.BaqueanoPlanGallery) return;

  var MAX_BYTES = 5 * 1024 * 1024;
  var TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  function t(key, fallback, vars) {
    var out = fallback;
    try {
      if (window.BaqueanoLanguage && window.BaqueanoLanguage.t) {
        var v = window.BaqueanoLanguage.t(key, { fallback: fallback });
        if (v && v !== key) out = v;
      }
    } catch (_) { out = fallback; }
    return String(out).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; });
  }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function icon(name) { var i = el('i', name); i.setAttribute('aria-hidden', 'true'); return i; }
  function button(label, iconName, cls) {
    var b = el('button', 'bq-gal-btn' + (cls ? ' ' + cls : ''));
    b.type = 'button';
    if (iconName) { b.appendChild(icon(iconName)); b.appendChild(document.createTextNode(' ')); }
    b.appendChild(document.createTextNode(label));
    return b;
  }
  function statusLabel(s) {
    return s === 'active' ? t('plans.gallery.statusActive', 'Publicada')
      : s === 'pending' ? t('plans.gallery.statusPending', 'Pendiente de revisión')
      : s === 'rejected' ? t('plans.gallery.statusRejected', 'Rechazada') : s;
  }

  function installStyle() {
    if (document.getElementById('bqGalleryStyle')) return;
    var css = '.bq-gal{display:grid;gap:12px;margin:.8rem 0 0;padding:14px;border-radius:14px;border:1px solid rgba(244,230,193,.16);background:rgba(15,23,42,.55);color:#f8fafc}' +
      '.bq-gal h4{margin:0;font:800 1rem/1.3 "League Spartan",sans-serif;color:#fff}.bq-gal-count{margin:0;color:#f4e6c1;font-weight:700}' +
      '.bq-gal-hint{margin:0;color:#cbd5e1;font-size:.9rem;line-height:1.5}.bq-gal-msg{margin:0;padding:.55rem .75rem;border-radius:10px;font-weight:700}' +
      '.bq-gal-msg.is-error{background:rgba(248,113,113,.14);border:1px solid rgba(248,113,113,.5);color:#fecaca}.bq-gal-msg.is-ok{background:rgba(74,222,128,.12);border:1px solid rgba(74,222,128,.4);color:#bbf7d0}' +
      '.bq-gal-grid{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}' +
      '.bq-gal-item{display:grid;gap:6px;padding:8px;border-radius:12px;background:#0d1726;border:1px solid rgba(244,230,193,.12)}' +
      '.bq-gal-item img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;background:#111b2b}' +
      '.bq-gal-chip{justify-self:start;padding:.15rem .5rem;border-radius:999px;font-size:.74rem;font-weight:800;background:rgba(148,163,184,.2)}' +
      '.bq-gal-chip.is-active{background:rgba(74,222,128,.18);color:#bbf7d0}.bq-gal-chip.is-pending{background:rgba(251,191,36,.18);color:#fde68a}.bq-gal-chip.is-rejected{background:rgba(248,113,113,.18);color:#fecaca}' +
      '.bq-gal-alt,.bq-gal-reason{margin:0;font-size:.82rem;color:#cbd5e1;overflow-wrap:anywhere}.bq-gal-actions{display:flex;flex-wrap:wrap;gap:6px}' +
      '.bq-gal-btn{display:inline-flex;align-items:center;gap:.3rem;min-height:40px;padding:.4rem .8rem;border-radius:999px;border:1px solid rgba(244,230,193,.3);background:transparent;color:#f4e6c1;font:700 .85rem/1 inherit;cursor:pointer}' +
      '.bq-gal-btn.is-primary{background:#c2410c;border-color:#c2410c;color:#fff}.bq-gal-btn.is-danger{border-color:rgba(248,113,113,.6);color:#fecaca}.bq-gal-btn:disabled{opacity:.55;cursor:not-allowed}' +
      '.bq-gal-btn:focus-visible{outline:3px solid #f4e6c1;outline-offset:2px}' +
      '.bq-gal-form{display:grid;gap:8px}.bq-gal-form label{display:grid;gap:4px;font-weight:700;font-size:.88rem}' +
      '.bq-gal-form input{min-height:44px;padding:.45rem .65rem;border-radius:10px;border:1px solid rgba(244,230,193,.25);background:#0b1320;color:#fff;font:inherit}' +
      '.bq-gal-video a{color:#f4e6c1;font-weight:700;overflow-wrap:anywhere}';
    var s = document.createElement('style'); s.id = 'bqGalleryStyle'; s.textContent = css; document.head.appendChild(s);
  }

  function uploadFile(signedUrl, file) {
    return fetch(signedUrl, { method: 'PUT', headers: { 'content-type': file.type, 'x-upsert': 'false' }, body: file }).then(function (res) {
      if (!res.ok) throw new Error(t('plans.gallery.uploadFailed', 'No se pudo subir la foto. Intentá de nuevo.'));
    });
  }

  function mount(container, opts) {
    installStyle();
    var call = opts.call;
    var businessId = opts.businessId;
    var root = el('section', 'bq-gal');
    root.setAttribute('aria-live', 'polite');
    container.replaceChildren(root);
    var msg = { text: '', kind: '' };

    function say(text, kind) { msg = { text: text, kind: kind || 'ok' }; }

    function render(state) {
      var isStaff = state.role === 'staff';
      var kids = [el('h4', null, t('plans.gallery.title', 'Fotos de la ficha'))];
      var limit = state.photo_limit;
      kids.push(el('p', 'bq-gal-count', limit == null
        ? t('plans.gallery.countUnlimited', '{n} fotos · sin límite en tu plan', { n: state.used })
        : limit === 0 ? t('plans.gallery.noPlan', 'Este negocio no tiene un plan vigente con galería.')
        : t('plans.gallery.count', '{n} de {limit} fotos', { n: state.used, limit: limit })));
      if (!isStaff) kids.push(el('p', 'bq-gal-hint', t('plans.gallery.ownerHint', 'Las fotos que subís las revisa el equipo antes de publicarlas en tu ficha.')));
      if (msg.text) { var m = el('p', 'bq-gal-msg is-' + (msg.kind === 'error' ? 'error' : 'ok'), msg.text); m.setAttribute('role', msg.kind === 'error' ? 'alert' : 'status'); kids.push(m); }

      var photos = state.items.filter(function (it) { return it.kind === 'photo'; });
      var grid = el('ul', 'bq-gal-grid');
      photos.forEach(function (it, idx) {
        var li = el('li', 'bq-gal-item');
        var img = el('img'); img.src = it.url; img.alt = it.alt_text || ''; img.loading = 'lazy'; img.decoding = 'async'; img.width = 300; img.height = 225;
        li.appendChild(img);
        li.appendChild(el('span', 'bq-gal-chip is-' + it.status, statusLabel(it.status)));
        if (it.alt_text) li.appendChild(el('p', 'bq-gal-alt', it.alt_text));
        if (it.status === 'rejected' && it.status_reason) li.appendChild(el('p', 'bq-gal-reason', t('plans.gallery.reason', 'Motivo: {reason}', { reason: it.status_reason })));
        var actions = el('div', 'bq-gal-actions');
        if (isStaff && it.status === 'pending') {
          var ok = button(t('plans.gallery.approve', 'Aprobar'), 'fa-solid fa-check', 'is-primary');
          ok.addEventListener('click', function () { act('media_review', { id: it.id, decision: 'approve' }, t('plans.gallery.approved', 'Foto publicada en la ficha.')); });
          var no = button(t('plans.gallery.reject', 'Rechazar'), 'fa-solid fa-ban', 'is-danger');
          no.addEventListener('click', function () { askReason(li, function (r) { act('media_review', { id: it.id, decision: 'reject', reason: r }, t('plans.gallery.rejected', 'Foto rechazada. El propietario ve el motivo.')); }); });
          actions.appendChild(ok); actions.appendChild(no);
        }
        if (it.status === 'active' && idx > 0) {
          var first = button(t('plans.gallery.makeFirst', 'Poner primera'), 'fa-solid fa-arrow-up');
          first.addEventListener('click', function () {
            var ids = [it.id].concat(photos.filter(function (p) { return p.id !== it.id; }).map(function (p) { return p.id; }));
            act('media_reorder', { business_id: businessId, ids: ids }, t('plans.gallery.reordered', 'Orden guardado.'));
          });
          actions.appendChild(first);
        }
        if (it.status === 'active' || it.status === 'pending') {
          var rm = button(t('plans.gallery.remove', 'Retirar'), 'fa-solid fa-trash-can', 'is-danger');
          rm.addEventListener('click', function () { askReason(li, function (r) { act('media_remove', { id: it.id, reason: r }, t('plans.gallery.removed', 'Foto retirada de la ficha.')); }, !isStaff); });
          actions.appendChild(rm);
        }
        li.appendChild(actions);
        grid.appendChild(li);
      });
      if (photos.length) kids.push(grid);
      else if (limit !== 0) kids.push(el('p', 'bq-gal-hint', t('plans.gallery.empty', 'Todavía no hay fotos en la ficha.')));

      var canAdd = limit !== 0 && (limit == null || state.used < limit);
      if (canAdd) kids.push(uploadForm());
      else if (limit) kids.push(el('p', 'bq-gal-hint', t('plans.gallery.full', 'Llegaste al límite de tu plan. Retirá una foto para subir otra.')));

      if (state.video_allowed) kids.push(videoBlock(state.items.filter(function (it) { return it.kind === 'video'; })[0] || null, isStaff));
      root.replaceChildren.apply(root, kids);
    }

    function askReason(host, done, optional) {
      if (host.querySelector('.bq-gal-form')) return;
      var form = el('div', 'bq-gal-form');
      var input = el('input');
      input.maxLength = 500;
      input.placeholder = optional ? t('plans.gallery.reasonOptional', 'Motivo (opcional)') : t('plans.gallery.reasonRequired', 'Motivo (queda en el historial)');
      var lbl = el('label'); lbl.appendChild(el('span', null, t('plans.gallery.reasonLabel', 'Motivo'))); lbl.appendChild(input);
      var go = button(t('plans.gallery.confirm', 'Confirmar'), null, 'is-danger');
      go.addEventListener('click', function () {
        var r = input.value.trim();
        if (!optional && r.length < 3) { input.focus(); return; }
        done(r || null);
      });
      form.appendChild(lbl); form.appendChild(go);
      host.appendChild(form);
      input.focus();
    }

    function uploadForm() {
      var form = el('div', 'bq-gal-form');
      var file = el('input'); file.type = 'file'; file.accept = TYPES.join(',');
      var alt = el('input'); alt.maxLength = 160; alt.placeholder = t('plans.gallery.altPh', 'Ej.: terraza con vista al volcán');
      var l1 = el('label'); l1.appendChild(el('span', null, t('plans.gallery.file', 'Foto (JPG, PNG o WebP, hasta 5 MB)'))); l1.appendChild(file);
      var l2 = el('label'); l2.appendChild(el('span', null, t('plans.gallery.alt', 'Qué se ve en la foto (para personas que usan lector de pantalla)'))); l2.appendChild(alt);
      var go = button(t('plans.gallery.upload', 'Subir foto'), 'fa-solid fa-cloud-arrow-up', 'is-primary');
      go.addEventListener('click', function () {
        var f = file.files && file.files[0];
        if (!f) { file.focus(); return; }
        if (TYPES.indexOf(f.type) < 0) { say(t('plans.gallery.badType', 'Subí una foto JPG, PNG o WebP.'), 'error'); return refresh(); }
        if (f.size > MAX_BYTES) { say(t('plans.gallery.tooBig', 'La foto tiene que pesar menos de 5 MB.'), 'error'); return refresh(); }
        if (alt.value.trim().length < 3) { alt.focus(); return; }
        go.disabled = true;
        call('media_upload_url', { business_id: businessId, content_type: f.type, size: f.size })
          .then(function (res) { return uploadFile(res.signed_url, f).then(function () { return res.path; }); })
          .then(function (path) { return call('media_attach', { business_id: businessId, path: path, alt_text: alt.value.trim() }); })
          .then(function (res) {
            say(res.media && res.media.status === 'active' ? t('plans.gallery.uploadedLive', 'Foto publicada en la ficha.') : t('plans.gallery.uploadedPending', 'Foto subida. El equipo la revisa antes de publicarla.'));
            return refresh();
          })
          .catch(function (e) { go.disabled = false; say(e.message, 'error'); refresh(); });
      });
      form.appendChild(l1); form.appendChild(l2); form.appendChild(go);
      return form;
    }

    function videoBlock(video, isStaff) {
      var box = el('div', 'bq-gal-video bq-gal-form');
      box.appendChild(el('h4', null, t('plans.gallery.videoTitle', 'Video de presentación (Cumbre)')));
      if (video) {
        var p = el('p', 'bq-gal-alt');
        var a = el('a', null, video.url); a.href = video.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
        p.appendChild(el('span', 'bq-gal-chip is-' + video.status, statusLabel(video.status))); p.appendChild(document.createTextNode(' ')); p.appendChild(a);
        box.appendChild(p);
        var acts = el('div', 'bq-gal-actions');
        if (isStaff && video.status === 'pending') {
          var ok = button(t('plans.gallery.approve', 'Aprobar'), 'fa-solid fa-check', 'is-primary');
          ok.addEventListener('click', function () { act('media_review', { id: video.id, decision: 'approve' }, t('plans.gallery.videoApproved', 'Video publicado en la ficha.')); });
          acts.appendChild(ok);
        }
        if (video.status === 'active' || video.status === 'pending') {
          var rm = button(t('plans.gallery.remove', 'Retirar'), 'fa-solid fa-trash-can', 'is-danger');
          rm.addEventListener('click', function () { askReason(box, function (r) { act('media_remove', { id: video.id, reason: r }, t('plans.gallery.videoRemoved', 'Video retirado.')); }, !isStaff); });
          acts.appendChild(rm);
        }
        box.appendChild(acts);
        return box;
      }
      var url = el('input'); url.type = 'url'; url.inputMode = 'url'; url.maxLength = 500; url.placeholder = t('plans.gallery.videoPh', 'https://youtu.be/…');
      var l = el('label'); l.appendChild(el('span', null, t('plans.gallery.videoUrl', 'Enlace de YouTube, Vimeo, Facebook, Instagram o TikTok'))); l.appendChild(url);
      var go = button(t('plans.gallery.videoSave', 'Guardar video'), 'fa-solid fa-film', 'is-primary');
      go.addEventListener('click', function () {
        if (!/^https:\/\//.test(url.value.trim())) { url.focus(); return; }
        go.disabled = true;
        act('media_video', { business_id: businessId, url: url.value.trim() }, isStaff ? t('plans.gallery.videoApproved', 'Video publicado en la ficha.') : t('plans.gallery.videoPending', 'Video guardado. El equipo lo revisa antes de publicarlo.'));
      });
      box.appendChild(l); box.appendChild(go);
      return box;
    }

    function act(action, payload, okText) {
      return call(action, payload).then(function () { say(okText); return refresh(); }).catch(function (e) { say(e.message, 'error'); return refresh(); });
    }
    function refresh() {
      return call('media_list', { business_id: businessId }).then(render).catch(function (e) {
        root.replaceChildren(el('p', 'bq-gal-msg is-error', e.message));
      });
    }
    root.appendChild(el('p', 'bq-gal-hint', t('plans.gallery.loading', 'Cargando fotos…')));
    return refresh();
  }

  window.BaqueanoPlanGallery = { mount: mount };
})(window, document);
