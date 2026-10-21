/**
 * ============================================================================
 * ⭐ BAQUEANO — VALORACIONES Y OPINIONES REALES DE LUGARES (bq-reviews.js)
 * ============================================================================
 * 🎯 POR QUÉ:
 * - Pedido del propietario (2026-10-20): las estrellas de /mapa, /destinos y la ficha deben
 *   venir de usuarios reales, ser las mismas en todas partes y nunca inventarse. Sin opiniones
 *   aprobadas se muestra «Aún sin valoraciones»; nunca 5 estrellas ni promedios por defecto.
 * - Leer es libre; opinar exige sesión (Firebase) para mantener opiniones auténticas.
 *
 * ⚙️ CÓMO:
 * - Un único servicio: Edge Function `baqueano-place-reviews` (Supabase, tabla public.reviews).
 *   El servidor verifica el token de Firebase y decide quién escribe; este archivo nunca envía
 *   un UID propio ni credenciales privilegiadas.
 * - Resúmenes: cualquier elemento [data-bq-rating="place:<slug>|destination:<clave>|business:<id>"]
 *   (tarjetas, popups del mapa, ficha) se agrupa en una sola petición y se rellena con
 *   promedio y cantidad de opiniones APROBADAS. Un MutationObserver cubre lo que aparece después
 *   (popups de Leaflet, tarjetas en vivo). La tarjeta contenedora recibe data-rating real para el
 *   filtro «Valoración» de /destinos.
 * - Sección completa: [data-bq-reviews="<destino>"] monta «Opiniones de los visitantes»:
 *   promedio, distribución, orden (recientes, mejores, críticas), lista paginada, respuesta
 *   oficial distinguida, idioma original indicado (sin traducir en silencio), reporte, y el
 *   formulario propio (crear, editar, retirar) con privacidad de nombre y foto.
 * - Todo se construye con createElement/textContent (sin innerHTML con datos de usuarios).
 * - Textos en los 8 idiomas (reviews.*); se repinta al cambiar de idioma.
 *
 * 📦 QUÉ: window.BaqueanoReviews = { scan(root), summaries(targets), mount(el, target), refresh() }.
 * ============================================================================
 */
(function (window, document) {
  'use strict';
  if (window.BaqueanoReviews) return;

  var ENDPOINT = 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-place-reviews';
  var CONSENT_VERSION = 'lugares-v1-2026-10-20';
  var CACHE_MS = 5 * 60 * 1000;
  var TARGET_RE = /^(place|destination|business):[a-z0-9][a-z0-9_-]{0,119}$/i;
  var LANGS = /^(es|en|fr|it|pt|de|ko|zh)$/;
  var REPORT_REASONS = ['spam', 'insulto', 'falso', 'datos_personales', 'suplantacion', 'enlace_peligroso', 'discriminacion', 'otro'];
  var cache = {};          // target → { at, value }  (value null = sin vínculo)
  var pending = {};        // target → [resolve]
  var timer = null;
  var widgets = [];

  // ------------------------------------------------------------------ utilidades
  function t(key, fallback, vars) {
    var out = fallback;
    try { out = (window.BaqueanoLanguage && window.BaqueanoLanguage.t('reviews.' + key, { fallback: fallback })) || fallback; } catch (_) { out = fallback; }
    return String(out).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; });
  }
  function lang() {
    var l = '';
    try { l = (window.BaqueanoLanguage && window.BaqueanoLanguage.get && window.BaqueanoLanguage.get()) || document.documentElement.lang || 'es'; } catch (_) { l = 'es'; }
    l = String(l).slice(0, 2).toLowerCase();
    return LANGS.test(l) ? l : 'es';
  }
  function el(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text != null) n.textContent = text;
    return n;
  }
  function icon(name) { var i = el('i', name); i.setAttribute('aria-hidden', 'true'); return i; }
  function fmt(n, digits) {
    try { return new Intl.NumberFormat(lang(), { minimumFractionDigits: digits || 0, maximumFractionDigits: digits || 0 }).format(n); } catch (_) { return String(n); }
  }
  function fmtDate(v) {
    try { return new Intl.DateTimeFormat(lang(), { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(v)); } catch (_) { return ''; }
  }
  function langName(code) {
    try { return new Intl.DisplayNames([lang()], { type: 'language' }).of(code); } catch (_) { return code; }
  }
  function countText(n) {
    return n === 1 ? t('count.one', '1 opinión aprobada') : t('count.many', '{n} opiniones aprobadas', { n: fmt(n) });
  }

  function firebaseUser() {
    try { return window.firebase && window.firebase.auth ? window.firebase.auth().currentUser : null; } catch (_) { return null; }
  }
  function sessionUser() {
    try { return window.BaqueanoSession && window.BaqueanoSession.getUser ? window.BaqueanoSession.getUser() : null; } catch (_) { return null; }
  }
  // Si hay sesión guardada, carga Firebase (solo entonces) para obtener el token.
  function ensureAuth() {
    if (firebaseUser() || !sessionUser()) return Promise.resolve(firebaseUser());
    var load = window.BaqueanoSession && window.BaqueanoSession.loadAuth ? window.BaqueanoSession.loadAuth() : Promise.resolve();
    return Promise.resolve(load).catch(function () { return null; }).then(function () {
      var u = firebaseUser();
      if (u || !(window.firebase && window.firebase.auth)) return u;
      // onAuthStateChanged resuelve la sesión persistida en el primer evento.
      return new Promise(function (resolve) {
        var off = window.firebase.auth().onAuthStateChanged(function (user) { try { off(); } catch (_) { /* nada */ } resolve(user); });
        window.setTimeout(function () { resolve(firebaseUser()); }, 4000);
      });
    });
  }

  function call(action, payload, needsAuth) {
    var tokenPromise = (needsAuth ? ensureAuth() : Promise.resolve(firebaseUser())).then(function (user) {
      return user && typeof user.getIdToken === 'function' ? user.getIdToken().catch(function () { return null; }) : null;
    });
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

  // ------------------------------------------------------------------ resúmenes (una sola petición)
  function summaries(targets) {
    var now = Date.now();
    var wanted = (targets || []).filter(function (x) { return TARGET_RE.test(x); });
    return Promise.all(wanted.map(function (target) {
      var hit = cache[target];
      if (hit && now - hit.at < CACHE_MS) return Promise.resolve([target, hit.value]);
      return new Promise(function (resolve) {
        (pending[target] = pending[target] || []).push(function (value) { resolve([target, value]); });
        if (!timer) timer = window.setTimeout(flush, 60);
      });
    })).then(function (pairs) {
      var out = {};
      pairs.forEach(function (p) { out[p[0]] = p[1]; });
      return out;
    });
  }
  function flush() {
    timer = null;
    var batch = Object.keys(pending);
    var waiting = pending;
    pending = {};
    if (!batch.length) return;
    call('summary', { targets: batch.slice(0, 120) }).then(function (data) {
      var map = (data && data.summaries) || {};
      batch.forEach(function (target) {
        var value = map[target] || null;
        cache[target] = { at: Date.now(), value: value };
        waiting[target].forEach(function (fn) { fn(value); });
      });
    }).catch(function () {
      // Sin servicio: queda «Aún sin valoraciones» (nunca un número inventado). No se guarda en caché.
      batch.forEach(function (target) { waiting[target].forEach(function (fn) { fn(undefined); }); });
    });
  }

  function starsNode(rating, size) {
    var wrap = el('span', 'bq-rv-stars' + (size ? ' is-' + size : ''));
    wrap.setAttribute('role', 'img');
    wrap.setAttribute('aria-label', t('starsAria', '{stars} de 5 estrellas', { stars: fmt(rating, rating % 1 ? 1 : 0) }));
    for (var i = 1; i <= 5; i += 1) {
      wrap.append(icon(rating >= i ? 'fa-solid fa-star' : (rating >= i - 0.5 ? 'fa-solid fa-star-half-stroke' : 'fa-regular fa-star')));
    }
    return wrap;
  }

  // Pinta un [data-bq-rating]: promedio real o «Aún sin valoraciones».
  function paintBadge(node, summary) {
    node.setAttribute('data-bq-rating-state', summary && summary.count > 0 ? 'rated' : 'empty');
    node.classList.toggle('is-empty', !(summary && summary.count > 0));
    node.replaceChildren();
    if (summary && summary.count > 0) {
      node.append(icon('fa-solid fa-star'), ' ', el('strong', null, fmt(summary.average, 1)), ' ',
        el('span', 'bq-rv-badge-count', '(' + fmt(summary.count) + ')'));
      node.setAttribute('aria-label', t('summary.aria', '{avg} de 5 estrellas, {n} opiniones aprobadas', { avg: fmt(summary.average, 1), n: fmt(summary.count) }));
      node.setAttribute('title', countText(summary.count));
    } else {
      var none = el('span', null, t('summary.none', 'Aún sin valoraciones'));
      none.setAttribute('data-i18n', 'reviews.summary.none');
      node.append(icon('fa-regular fa-star'), ' ', none);
      node.removeAttribute('aria-label');
      node.removeAttribute('title');
    }
    // Filtro «Valoración» de /destinos: la tarjeta guarda el promedio real (0 = sin opiniones).
    var card = node.closest('[data-rating]');
    if (card) card.dataset.rating = String(summary && summary.count > 0 ? summary.average : 0);
  }

  function scan(root) {
    var nodes = Array.prototype.slice.call((root || document).querySelectorAll('[data-bq-rating]'));
    if (root && root.matches && root.matches('[data-bq-rating]')) nodes.push(root);
    var targets = [];
    nodes.forEach(function (n) {
      var key = n.getAttribute('data-bq-rating');
      if (!TARGET_RE.test(key || '') || n.__bqRatingFor === key) return;
      n.__bqRatingFor = key;
      targets.push(key);
    });
    if (!targets.length) return Promise.resolve();
    return summaries(targets).then(function (map) {
      nodes.forEach(function (n) {
        var key = n.getAttribute('data-bq-rating');
        if (key in map && map[key] !== undefined) paintBadge(n, map[key]);
      });
    });
  }

  // ------------------------------------------------------------------ sección completa
  function Widget(root, target) {
    this.root = root;
    this.target = target;
    this.sort = 'recent';
    this.page = 0;
    this.items = [];
    this.hasMore = false;
    this.summary = null;
    this.mine = null;
    this.editing = false;
    this.user = null;
    this.message = null;
    this.reportFor = null;
    this.confirmWithdraw = false;
    this.busy = false;
    this.linked = true;
    this.loadError = false;
  }
  Widget.prototype.load = function () {
    var self = this;
    self.loading = true;
    self.render();
    var summaryP = summaries([self.target]).then(function (map) {
      var s = map[self.target];
      if (s === undefined) { self.loadError = true; return; }
      self.linked = s !== null;
      self.summary = s;
    });
    var listP = self.fetchList(true);
    var mineP = self.loadMine();
    return Promise.all([summaryP, listP, mineP]).then(function () { self.loading = false; self.render(); }, function () { self.loading = false; self.render(); });
  };
  Widget.prototype.fetchList = function (reset) {
    var self = this;
    if (reset) { self.page = 0; self.items = []; }
    return call('list', { target: self.target, sort: self.sort, page: self.page }).then(function (data) {
      var rows = (data && data.reviews) || [];
      self.items = self.items.concat(rows);
      self.hasMore = rows.length === ((data && data.pageSize) || 10);
      self.loadError = false;
    }).catch(function (e) { if (e.status !== 404) self.loadError = true; });
  };
  Widget.prototype.loadMine = function () {
    var self = this;
    var user = sessionUser();
    self.user = user;
    if (!user) { self.mine = null; return Promise.resolve(); }
    return call('mine', { target: self.target }, true).then(function (data) {
      self.mine = data && data.review;
    }).catch(function (e) {
      if (e.status === 401) self.user = null;
      self.mine = null;
    });
  };
  Widget.prototype.refreshSummary = function () {
    delete cache[this.target];
    var self = this;
    return summaries([this.target]).then(function (map) { if (map[self.target] !== undefined) self.summary = map[self.target]; });
  };

  Widget.prototype.render = function () {
    var self = this;
    var root = self.root;
    root.classList.add('bq-rv');
    root.replaceChildren();
    if (!root.id) root.id = 'opiniones';
    var head = el('div', 'bq-rv-head');
    var title = el('h2', 'bq-rv-title', t('title', 'Opiniones de los visitantes'));
    title.setAttribute('data-i18n', 'reviews.title');
    head.append(title);
    root.append(head);

    if (!self.linked) {
      root.append(el('p', 'bq-rv-note', t('notLinked', 'Este destino todavía no está vinculado a un lugar verificado de BAQUEANO, por eso aún no recibe opiniones.')));
      return;
    }

    // Resumen real
    var box = el('div', 'bq-rv-summary');
    var s = self.summary;
    if (s && s.count > 0) {
      var big = el('div', 'bq-rv-avg');
      big.append(el('strong', null, fmt(s.average, 1)), starsNode(s.average, 'lg'), el('span', 'bq-rv-count', countText(s.count)));
      var dist = el('ul', 'bq-rv-dist');
      dist.setAttribute('aria-label', t('distTitle', 'Distribución de calificaciones'));
      [5, 4, 3, 2, 1].forEach(function (n) {
        var c = Number((s.distribution || {})[n]) || 0;
        var li = el('li');
        li.setAttribute('aria-label', t('distAria', '{stars} estrellas: {n}', { stars: n, n: fmt(c) }));
        var bar = el('span', 'bq-rv-bar');
        var fill = el('span');
        fill.style.width = (s.count ? Math.round(c / s.count * 100) : 0) + '%';
        bar.append(fill);
        li.append(el('span', 'bq-rv-dist-n', String(n)), icon('fa-solid fa-star'), bar, el('span', 'bq-rv-dist-c', fmt(c)));
        dist.append(li);
      });
      box.append(big, dist);
    } else if (!self.loading) {
      var none = el('p', 'bq-rv-none');
      none.append(icon('fa-regular fa-star'), ' ', t('summary.none', 'Aún sin valoraciones'));
      box.append(none);
    }
    root.append(box);

    // Formulario o acceso
    root.append(self.renderMine());

    // Orden
    if (self.items.length > 1 || self.sort !== 'recent') {
      var sorts = el('div', 'bq-rv-sort');
      sorts.setAttribute('role', 'group');
      sorts.setAttribute('aria-label', t('sort.label', 'Ordenar opiniones'));
      [['recent', t('sort.recent', 'Recientes')], ['best', t('sort.best', 'Mejores')], ['critical', t('sort.critical', 'Críticas')]].forEach(function (o) {
        var b = el('button', 'bq-rv-chip' + (self.sort === o[0] ? ' is-active' : ''), o[1]);
        b.type = 'button';
        b.setAttribute('aria-pressed', String(self.sort === o[0]));
        b.addEventListener('click', function () {
          if (self.sort === o[0]) return;
          self.sort = o[0];
          self.fetchList(true).then(function () { self.render(); });
        });
        sorts.append(b);
      });
      root.append(sorts);
    }

    // Lista
    var list = el('div', 'bq-rv-list');
    list.setAttribute('aria-live', 'polite');
    if (self.loading) list.append(el('p', 'bq-rv-note', t('loading', 'Cargando opiniones…')));
    else if (self.loadError) list.append(el('p', 'bq-rv-note', t('error', 'No pudimos cargar las opiniones. Probá de nuevo más tarde.')));
    else if (!self.items.length) list.append(el('p', 'bq-rv-note', t('empty', 'Todavía nadie publicó una opinión sobre este lugar.')));
    self.items.forEach(function (r) { list.append(self.renderItem(r)); });
    root.append(list);
    if (self.hasMore && !self.loading) {
      var more = el('button', 'bq-rv-more', t('more', 'Ver más opiniones'));
      more.type = 'button';
      more.addEventListener('click', function () {
        more.disabled = true;
        self.page += 1;
        self.fetchList(false).then(function () { self.render(); });
      });
      root.append(more);
    }
  };

  Widget.prototype.renderItem = function (r) {
    var self = this;
    var item = el('article', 'bq-rv-item');
    var top = el('div', 'bq-rv-item-head');
    var avatar = el('span', 'bq-rv-avatar');
    var name = r.display_name === 'Viajero BAQUEANO' ? t('anonymousName', 'Viajero BAQUEANO') : String(r.display_name || '');
    if (r.avatar_url && /^https:\/\//.test(r.avatar_url)) {
      var img = el('img');
      img.src = r.avatar_url; img.alt = ''; img.width = 40; img.height = 40; img.loading = 'lazy'; img.decoding = 'async';
      img.referrerPolicy = 'no-referrer';
      avatar.append(img);
    } else {
      avatar.textContent = (name.trim().charAt(0) || 'B').toUpperCase();
    }
    var who = el('div', 'bq-rv-who');
    var nameNode = el('strong', null, name);
    nameNode.setAttribute('translate', 'no');
    var meta = el('span', 'bq-rv-meta', fmtDate(r.published_at) + (r.edited ? ' · ' + t('edited', 'editada') : ''));
    who.append(nameNode, meta);
    top.append(avatar, who, starsNode(Number(r.rating)));
    item.append(top);
    if (r.comment) {
      var body = el('p', 'bq-rv-text', r.comment);
      if (r.language && LANGS.test(r.language)) body.setAttribute('lang', r.language);
      body.setAttribute('translate', 'no');
      item.append(body);
      if (r.language && r.language !== lang()) item.append(el('span', 'bq-rv-lang', t('writtenIn', 'Escrita en {lang}', { lang: langName(r.language) })));
    }
    if (r.response_text) {
      var reply = el('div', 'bq-rv-reply');
      var label = el('strong');
      label.append(icon('fa-solid fa-circle-check'), ' ', t('officialReply', 'Respuesta de BAQUEANO'));
      reply.append(label, el('p', null, r.response_text));
      item.append(reply);
    }
    // Reportar (con sesión; el servidor impide reportar la propia)
    if (self.user && !(self.mine && self.mine.id === r.id)) {
      if (self.reportFor === r.id) item.append(self.renderReport(r));
      else {
        var rep = el('button', 'bq-rv-link', t('reportBtn', 'Reportar'));
        rep.type = 'button';
        rep.addEventListener('click', function () { self.reportFor = r.id; self.render(); });
        item.append(rep);
      }
    }
    return item;
  };

  Widget.prototype.renderReport = function (r) {
    var self = this;
    var form = el('form', 'bq-rv-report');
    var id = 'bqRvReason-' + r.id;
    var label = el('label', null, t('reportForm.reason', 'Motivo del reporte'));
    label.htmlFor = id;
    var select = el('select');
    select.id = id;
    REPORT_REASONS.forEach(function (k) {
      var o = el('option', null, t('reason.' + k, k));
      o.value = k;
      select.append(o);
    });
    var send = el('button', 'bq-rv-btn', t('reportForm.send', 'Enviar reporte'));
    send.type = 'submit';
    var cancel = el('button', 'bq-rv-link', t('reportForm.cancel', 'Cancelar'));
    cancel.type = 'button';
    cancel.addEventListener('click', function () { self.reportFor = null; self.render(); });
    form.append(label, select, send, cancel);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      send.disabled = true;
      call('report', { reviewId: r.id, reason: select.value }, true).then(function () {
        self.reportFor = null;
        self.flash(t('reportForm.sent', 'Gracias. El equipo va a revisar esta opinión.'), false);
      }).catch(function (err) { self.reportFor = null; self.flash(err.message, true); });
    });
    return form;
  };

  Widget.prototype.flash = function (text, isError) {
    this.message = { text: text, error: !!isError };
    this.render();
    var node = this.root.querySelector('.bq-rv-msg');
    if (node) node.focus();
  };

  Widget.prototype.renderMine = function () {
    var self = this;
    var wrap = el('section', 'bq-rv-mine');
    wrap.setAttribute('aria-label', t('mine', 'Tu opinión'));
    if (self.message) {
      var msg = el('p', 'bq-rv-msg' + (self.message.error ? ' is-error' : ''), self.message.text);
      msg.setAttribute('role', self.message.error ? 'alert' : 'status');
      msg.tabIndex = -1;
      wrap.append(msg);
    }
    if (!self.user) {
      wrap.append(el('p', 'bq-rv-prompt', t('prompt', '¿Ya conociste este lugar? Compartí tu experiencia y ayudá a otros viajeros a descubrir Nicaragua.')));
      var login = el('button', 'bq-rv-btn');
      login.type = 'button';
      login.append(icon('fa-solid fa-right-to-bracket'), ' ', t('login', 'Iniciá sesión para opinar'));
      login.addEventListener('click', function () {
        if (window.BaqueanoAuthModal && window.BaqueanoAuthModal.open) window.BaqueanoAuthModal.open('signin');
        else window.location.href = 'perfil.html';
      });
      wrap.append(login, el('p', 'bq-rv-hint', t('loginHint', 'Pedimos una cuenta para mantener opiniones auténticas. Leer es libre.')));
      return wrap;
    }
    var mine = self.mine;
    if (mine && !self.editing) {
      var card = el('div', 'bq-rv-own');
      var head = el('div', 'bq-rv-own-head');
      head.append(el('strong', null, t('mine', 'Tu opinión')), starsNode(Number(mine.rating)));
      var status = el('span', 'bq-rv-status is-' + mine.status, t('status.' + mine.status, mine.status));
      head.append(status);
      card.append(head);
      if (mine.comment) card.append(el('p', 'bq-rv-text', mine.comment));
      if (mine.moderation_reason && (mine.status === 'rejected' || mine.status === 'hidden')) {
        card.append(el('p', 'bq-rv-hint', t('status.reason', 'Motivo: {reason}', { reason: mine.moderation_reason })));
      }
      var actions = el('div', 'bq-rv-actions');
      var edit = el('button', 'bq-rv-btn is-ghost', t('edit', 'Editar'));
      edit.type = 'button';
      edit.addEventListener('click', function () { self.editing = true; self.message = null; self.render(); });
      var withdraw = el('button', 'bq-rv-link', self.confirmWithdraw ? t('form.withdrawConfirm', 'Tocá de nuevo para confirmar') : t('form.withdraw', 'Retirar mi opinión'));
      withdraw.type = 'button';
      withdraw.addEventListener('click', function () {
        if (!self.confirmWithdraw) { self.confirmWithdraw = true; self.render(); return; }
        withdraw.disabled = true;
        call('withdraw', { target: self.target }, true).then(function () {
          self.confirmWithdraw = false;
          self.mine = null;
          return Promise.all([self.refreshSummary(), self.fetchList(true)]);
        }).then(function () { self.flash(t('form.withdrawn', 'Retiraste tu opinión. Ya no se muestra.'), false); })
          .catch(function (err) { self.confirmWithdraw = false; self.flash(err.message, true); });
      });
      actions.append(edit, withdraw);
      card.append(actions);
      wrap.append(card);
      return wrap;
    }
    wrap.append(self.renderForm());
    return wrap;
  };

  Widget.prototype.renderForm = function () {
    var self = this;
    var mine = self.editing ? self.mine : null;
    var uid = 'bqRv' + Math.random().toString(36).slice(2, 8);
    var form = el('form', 'bq-rv-form');
    form.noValidate = true;
    form.append(el('p', 'bq-rv-prompt', t('prompt', '¿Ya conociste este lugar? Compartí tu experiencia y ayudá a otros viajeros a descubrir Nicaragua.')));

    var fs = el('fieldset', 'bq-rv-rate');
    fs.append(el('legend', null, t('form.rating', 'Tu calificación')));
    var current = mine ? Number(mine.rating) : 0;
    for (var n = 1; n <= 5; n += 1) {
      (function (value) {
        var input = el('input');
        input.type = 'radio'; input.name = uid + '-rating'; input.value = String(value); input.id = uid + '-r' + value;
        input.className = 'bq-rv-radio';
        if (value === current) input.checked = true;
        var lab = el('label');
        lab.htmlFor = input.id;
        lab.title = value === 1 ? t('form.star', '{n} estrella', { n: 1 }) : t('form.stars', '{n} estrellas', { n: value });
        lab.append(icon('fa-solid fa-star'), el('span', 'bq-sr-only', lab.title));
        fs.append(input, lab);
      })(n);
    }
    // Ilumina hasta la estrella elegida (o la que está bajo el puntero); orden natural 1→5 para el teclado.
    function paintStars(upTo) {
      fs.querySelectorAll('label').forEach(function (lab, i) { lab.classList.toggle('is-on', i < upTo); });
    }
    function chosen() { var c = fs.querySelector('input:checked'); return c ? Number(c.value) : 0; }
    fs.addEventListener('change', function () { paintStars(chosen()); });
    fs.querySelectorAll('label').forEach(function (lab, i) {
      lab.addEventListener('mouseenter', function () { paintStars(i + 1); });
    });
    fs.addEventListener('mouseleave', function () { paintStars(chosen()); });
    paintStars(current);
    form.append(fs);

    var cLabel = el('label', 'bq-rv-label', t('form.comment', 'Comentario (opcional)'));
    cLabel.htmlFor = uid + '-c';
    var ta = el('textarea');
    ta.id = uid + '-c'; ta.maxLength = 1000; ta.rows = 4;
    ta.value = mine ? (mine.comment || '') : '';
    ta.setAttribute('aria-describedby', uid + '-ch');
    var hint = el('p', 'bq-rv-hint', t('form.commentHint', 'Contá cómo fue el acceso, qué hiciste y qué recomendarías. Mínimo 10 caracteres; sin enlaces ni teléfonos.'));
    hint.id = uid + '-ch';
    form.append(cLabel, ta, hint);

    var row = el('div', 'bq-rv-privacy');
    var nmLabel = el('label', 'bq-rv-label', t('form.nameMode', 'Cómo aparece tu nombre'));
    nmLabel.htmlFor = uid + '-nm';
    var nm = el('select');
    nm.id = uid + '-nm';
    [['full', t('form.nameFull', 'Nombre completo')], ['short', t('form.nameShort', 'Nombre e inicial del apellido')]].forEach(function (o) {
      var opt = el('option', null, o[1]); opt.value = o[0]; nm.append(opt);
    });
    var avatarBox = el('label', 'bq-rv-check');
    var av = el('input'); av.type = 'checkbox'; av.checked = mine ? mine.show_avatar !== false : true;
    avatarBox.append(av, ' ', t('form.showAvatar', 'Mostrar mi foto de perfil'));
    row.append(nmLabel, nm, avatarBox);
    form.append(row);

    var consentBox = el('label', 'bq-rv-check');
    var consent = el('input'); consent.type = 'checkbox'; consent.required = true;
    consentBox.append(consent, ' ', t('form.consent', 'Acepto que mi nombre público, calificación y comentario se muestren en BAQUEANO. Mi opinión pasa por moderación antes de publicarse.'));
    form.append(consentBox);

    var actions = el('div', 'bq-rv-actions');
    var submit = el('button', 'bq-rv-btn', mine ? t('form.update', 'Guardar cambios') : t('form.submit', 'Enviar opinión'));
    submit.type = 'submit';
    actions.append(submit);
    if (mine) {
      var cancel = el('button', 'bq-rv-link', t('reportForm.cancel', 'Cancelar'));
      cancel.type = 'button';
      cancel.addEventListener('click', function () { self.editing = false; self.message = null; self.render(); });
      actions.append(cancel);
    }
    form.append(actions);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (self.busy) return;
      var checked = form.querySelector('input.bq-rv-radio:checked');
      if (!checked) { self.inlineError(form, t('form.needRating', 'Elegí de 1 a 5 estrellas.')); return; }
      var text = ta.value.trim();
      if (text && text.length < 10) { self.inlineError(form, t('form.needLonger', 'El comentario necesita al menos 10 caracteres, o dejalo vacío.')); return; }
      if (!consent.checked) { self.inlineError(form, t('form.needConsent', 'Para publicar tenés que aceptar el aviso.')); return; }
      self.busy = true;
      submit.disabled = true;
      submit.textContent = t('form.sending', 'Enviando…');
      call('submit', {
        target: self.target, rating: Number(checked.value), comment: text, showAvatar: av.checked, nameMode: nm.value,
        consent: true, consentVersion: CONSENT_VERSION, language: lang(), platform: 'web'
      }, true).then(function (data) {
        self.busy = false;
        self.editing = false;
        self.mine = data && data.review;
        return self.refreshSummary();
      }).then(function () {
        self.flash(t('form.sent', '¡Gracias! Tu opinión quedó en revisión y se publicará cuando el equipo la apruebe.'), false);
      }).catch(function (err) {
        self.busy = false;
        submit.disabled = false;
        submit.textContent = mine ? t('form.update', 'Guardar cambios') : t('form.submit', 'Enviar opinión');
        if (err.status === 401) { self.user = null; self.render(); return; }
        self.inlineError(form, err.message);
      });
    });
    return form;
  };
  Widget.prototype.inlineError = function (form, text) {
    var box = form.querySelector('.bq-rv-msg');
    if (!box) {
      box = el('p', 'bq-rv-msg is-error');
      box.setAttribute('role', 'alert');
      box.tabIndex = -1;
      form.insertBefore(box, form.querySelector('.bq-rv-actions'));
    }
    box.textContent = text;
    box.focus();
  };

  function mount(node, target) {
    if (!node || !TARGET_RE.test(target || '')) return null;
    if (node.__bqReviews && node.__bqReviews.target === target) return node.__bqReviews;
    var w = new Widget(node, target);
    node.__bqReviews = w;
    widgets.push(w);
    w.load();
    return w;
  }
  function mountAll(root) {
    (root || document).querySelectorAll('[data-bq-reviews]').forEach(function (n) { mount(n, n.getAttribute('data-bq-reviews')); });
  }

  function refresh() {
    cache = {};
    document.querySelectorAll('[data-bq-rating]').forEach(function (n) { n.__bqRatingFor = null; });
    scan(document);
    widgets.forEach(function (w) { if (document.contains(w.root)) w.load(); });
  }

  function start() {
    scan(document);
    mountAll(document);
    if ('MutationObserver' in window) {
      var queued = false;
      new MutationObserver(function (records) {
        if (queued) return;
        var relevant = records.some(function (r) {
          return Array.prototype.some.call(r.addedNodes, function (n) {
            return n.nodeType === 1 && ((n.matches && n.matches('[data-bq-rating],[data-bq-reviews]')) || (n.querySelector && n.querySelector('[data-bq-rating],[data-bq-reviews]')));
          });
        });
        if (!relevant) return;
        queued = true;
        window.requestAnimationFrame(function () { queued = false; scan(document); mountAll(document); });
      }).observe(document.body, { childList: true, subtree: true });
    }
    window.addEventListener('baqueano:languageChanged', function () {
      document.querySelectorAll('[data-bq-rating]').forEach(function (n) {
        var hit = cache[n.getAttribute('data-bq-rating')];
        if (hit) paintBadge(n, hit.value);
      });
      widgets.forEach(function (w) { if (document.contains(w.root)) w.render(); });
    });
    // Al iniciar o cerrar sesión, el formulario cambia (sin recargar la página).
    window.addEventListener('baqueano_session_updated', function () {
      widgets.forEach(function (w) {
        if (!document.contains(w.root)) return;
        w.loadMine().then(function () { w.render(); });
      });
    });
  }

  window.BaqueanoReviews = { scan: scan, summaries: summaries, mount: mount, refresh: refresh };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})(window, document);
