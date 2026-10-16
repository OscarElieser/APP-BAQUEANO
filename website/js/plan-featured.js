/**
 * 🧭 BAQUEANO — BENEFICIOS DE LOS PLANES EN LA WEB (js/plan-featured.js)
 * 🎯 POR QUÉ: pedido del propietario (2026-10-15): «implementar todo lo que dicen los planes».
 *   Mirador y Cumbre aparecen destacados en la página de su departamento; Cumbre además en la
 *   portada, con su promoción; en Aliados (adonde BAQUI manda a buscar negocios) van primero.
 * ⚙️ CÓMO: lee public_plan_tiers() de Supabase (solo id del negocio, plan vigente y promoción;
 *   ningún dato del cliente) y los negocios publicados. Si no hay negocios con plan vigente, el
 *   bloque no se muestra: nunca se inventa un destacado. Textos con data-i18n / textContent.
 *   En el departamento, el bloque se vuelve a colocar cuando la página cambia de territorio.
 * 📦 QUÉ: window.BaqueanoPlanTiers = { load() → Promise<Map(id → {plan, promo})>, rank(plan) };
 *   bloques #bqFeaturedBiz en index.html y departamento.html.
 */
(function (window, document) {
  'use strict';
  if (window.BaqueanoPlanTiers) return;

  var REST = 'https://heiudfpthqwtjrtluqlm.supabase.co/rest/v1/';
  var KEY = 'sb_publishable_q7ZhqRIRjlerZK7WOu_Qxw_X_AqXV1d';
  var HEADERS = { apikey: KEY, Authorization: 'Bearer ' + KEY, 'content-type': 'application/json' };
  var CACHE = 'bq_plan_tiers_v1';
  var RANK = { cumbre: 1, mirador: 2, sendero: 3 };
  var DEPT_NAMES = {
    boaco: 'Boaco', carazo: 'Carazo', chinandega: 'Chinandega', chontales: 'Chontales', esteli: 'Estelí', granada: 'Granada',
    jinotega: 'Jinotega', leon: 'León', madriz: 'Madriz', managua: 'Managua', masaya: 'Masaya', matagalpa: 'Matagalpa',
    nueva_segovia: 'Nueva Segovia', rivas: 'Rivas', rio_san_juan: 'Río San Juan', raccn: 'Costa Caribe Norte', raccs: 'Costa Caribe Sur'
  };
  var tiersPromise = null;

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
  function digits(v) { return String(v || '').replace(/\D/g, ''); }

  function load() {
    if (tiersPromise) return tiersPromise;
    try {
      var cached = JSON.parse(sessionStorage.getItem(CACHE) || 'null');
      if (cached && Date.now() - cached.at < 10 * 60 * 1000) {
        tiersPromise = Promise.resolve(toMap(cached.rows));
        return tiersPromise;
      }
    } catch (_) { /* sin almacenamiento */ }
    tiersPromise = fetch(REST + 'rpc/public_plan_tiers', { method: 'POST', headers: HEADERS, body: '{}' })
      .then(function (res) { return res.ok ? res.json() : []; })
      .then(function (rows) {
        rows = Array.isArray(rows) ? rows : [];
        try { sessionStorage.setItem(CACHE, JSON.stringify({ at: Date.now(), rows: rows })); } catch (_) { /* sin almacenamiento */ }
        return toMap(rows);
      })
      .catch(function () { return new Map(); });
    return tiersPromise;
  }
  function toMap(rows) {
    var map = new Map();
    (rows || []).forEach(function (r) { if (r && r.business_id) map.set(String(r.business_id), { plan: r.plan_code, promo: r.promo_text || '' }); });
    return map;
  }
  function rank(plan) { return RANK[plan] || 9; }

  window.BaqueanoPlanTiers = { load: load, rank: rank };

  // ── Bloque de destacados ──
  function businesses(ids) {
    if (!ids.length) return Promise.resolve([]);
    var list = ids.map(function (id) { return '"' + String(id).replace(/"/g, '') + '"'; }).join(',');
    var cols = 'id,name,category,department_id,municipality,description,whatsapp,phone,cover_image';
    return fetch(REST + 'businesses?select=' + cols + '&is_published=eq.true&deleted_at=is.null&id=in.(' + encodeURIComponent(list) + ')', { headers: HEADERS })
      .then(function (res) { return res.ok ? res.json() : []; })
      .catch(function () { return []; });
  }

  function card(b, tier) {
    var art = el('article', 'bq-feat-card is-' + tier.plan);
    art.setAttribute('data-business-id', b.id);
    art.setAttribute('data-business-name', b.name);
    var media = el('div', 'bq-feat-media');
    if (b.cover_image && /^https:\/\//.test(b.cover_image)) {
      var img = el('img');
      img.src = b.cover_image; img.alt = b.name; img.loading = 'lazy'; img.decoding = 'async'; img.width = 400; img.height = 260;
      media.appendChild(img);
    } else {
      media.classList.add('is-empty');
      media.appendChild(icon('fa-solid fa-store'));
    }
    var badge = el('span', 'bq-feat-badge');
    badge.appendChild(icon('fa-solid fa-star'));
    var badgeText = el('span', null, t('plans.featured.badge', 'Destacado'));
    badgeText.setAttribute('data-i18n', 'plans.featured.badge');
    badge.appendChild(badgeText);
    media.appendChild(badge);
    art.appendChild(media);
    var body = el('div', 'bq-feat-body');
    body.appendChild(el('h3', 'bq-feat-name', b.name));
    var where = [b.municipality, DEPT_NAMES[b.department_id] || ''].filter(Boolean).join(', ');
    if (where) { var p = el('p', 'bq-feat-place'); p.appendChild(icon('fa-solid fa-location-dot')); p.appendChild(document.createTextNode(' ' + where)); body.appendChild(p); }
    if (tier.promo) {
      var promo = el('p', 'bq-feat-promo');
      promo.appendChild(icon('fa-solid fa-tag'));
      promo.appendChild(document.createTextNode(' ' + tier.promo));
      body.appendChild(promo);
    } else if (b.description) {
      body.appendChild(el('p', 'bq-feat-desc', b.description.length > 120 ? b.description.slice(0, 120) + '…' : b.description));
    }
    var actions = el('div', 'bq-feat-actions');
    var wa = digits(b.whatsapp);
    if (wa.length >= 8) {
      var a = el('a', 'bq-feat-btn is-wa');
      a.href = 'https://wa.me/' + (wa.length === 8 ? '505' + wa : wa) + '?text=' + encodeURIComponent(t('allies.waHello', 'Hola {name}, los encontré en BAQUEANO.', { name: b.name }));
      a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.appendChild(icon('fa-brands fa-whatsapp')); a.appendChild(document.createTextNode(' WhatsApp'));
      actions.appendChild(a);
    }
    var more = el('a', 'bq-feat-btn', t('plans.featured.more', 'Ver ficha'));
    more.setAttribute('data-i18n', 'plans.featured.more');
    more.href = 'aliados.html?negocio=' + encodeURIComponent(b.id);
    actions.appendChild(more);
    body.appendChild(actions);
    art.appendChild(body);
    return art;
  }

  function section(titleKey, titleFallback, vars, leadKey, leadFallback, items) {
    var sec = el('section', 'bq-feat-section');
    sec.id = 'bqFeaturedBiz';
    sec.setAttribute('aria-labelledby', 'bqFeaturedBizTitle');
    var inner = el('div', 'bq-feat-wrap');
    var kicker = el('p', 'bq-feat-kicker');
    kicker.appendChild(icon('fa-solid fa-store'));
    var k = el('span', null, t('plans.featured.kicker', 'Negocios locales con plan BAQUEANO'));
    k.setAttribute('data-i18n', 'plans.featured.kicker');
    kicker.appendChild(document.createTextNode(' ')); kicker.appendChild(k);
    var h = el('h2', 'bq-feat-title', t(titleKey, titleFallback, vars));
    h.id = 'bqFeaturedBizTitle';
    if (!vars) h.setAttribute('data-i18n', titleKey);
    var lead = el('p', 'bq-feat-lead', t(leadKey, leadFallback));
    lead.setAttribute('data-i18n', leadKey);
    var grid = el('div', 'bq-feat-grid');
    items.forEach(function (it) { grid.appendChild(card(it.b, it.tier)); });
    var cta = el('p', 'bq-feat-cta');
    var link = el('a', null, t('plans.featured.yourBusiness', '¿Tenés un negocio? Conocé los planes'));
    link.href = 'planes.html'; link.setAttribute('data-i18n', 'plans.featured.yourBusiness');
    cta.appendChild(link);
    [kicker, h, lead, grid, cta].forEach(function (n) { inner.appendChild(n); });
    sec.appendChild(inner);
    return sec;
  }

  function installStyle() {
    if (document.getElementById('bqFeatStyle')) return;
    var css = '.bq-feat-section{padding:56px 0;background:linear-gradient(180deg,#0b1320,#101b2c);color:#f8fafc}' +
      '.bq-feat-wrap{width:min(1180px,100% - 32px);margin:0 auto}' +
      '.bq-feat-kicker{display:inline-flex;align-items:center;gap:.4rem;margin:0 0 .5rem;color:#f4e6c1;font-weight:800;font-size:.85rem;letter-spacing:.06em;text-transform:uppercase}' +
      '.bq-feat-section .bq-feat-title{margin:0 0 .4rem;font:800 clamp(1.5rem,3vw,2.1rem)/1.15 "League Spartan","Plus Jakarta Sans",sans-serif;color:#fff!important;-webkit-text-fill-color:#fff!important;background:none!important;text-transform:none;letter-spacing:0}' +
      '.bq-feat-lead{margin:0 0 1.4rem;color:#e2e8f0;font-size:1.02rem;line-height:1.6;max-width:720px}' +
      '.bq-feat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:18px}' +
      '.bq-feat-card{display:flex;flex-direction:column;border-radius:18px;overflow:hidden;background:#16243a;border:1px solid rgba(244,230,193,.16);box-shadow:0 14px 34px rgba(0,0,0,.35)}' +
      '.bq-feat-card.is-cumbre{border-color:#d4a72c;box-shadow:0 0 0 1px #d4a72c,0 14px 34px rgba(0,0,0,.35)}' +
      '.bq-feat-media{position:relative;aspect-ratio:16/10;background:#0d1726;display:grid;place-items:center}' +
      '.bq-feat-media img{width:100%;height:100%;object-fit:cover}.bq-feat-media.is-empty i{font-size:2.2rem;color:#f4e6c1}' +
      '.bq-feat-badge{position:absolute;top:10px;left:10px;display:inline-flex;gap:.35rem;align-items:center;padding:.3rem .65rem;border-radius:999px;background:#c2410c;color:#fff;font-weight:800;font-size:.78rem}' +
      '.bq-feat-card.is-cumbre .bq-feat-badge{background:linear-gradient(135deg,#fde68a,#d4a72c);color:#2b2004}' +
      '.bq-feat-body{display:flex;flex-direction:column;gap:.45rem;padding:14px 16px 16px;flex:1}' +
      '.bq-feat-section .bq-feat-name{margin:0;font:800 1.1rem/1.25 "League Spartan",sans-serif;color:#fff!important;-webkit-text-fill-color:#fff!important}' +
      '.bq-feat-place,.bq-feat-desc{margin:0;color:#cbd5e1;font-size:.93rem;line-height:1.5}' +
      '.bq-feat-promo{margin:0;padding:.45rem .65rem;border-radius:10px;background:rgba(212,167,44,.16);border:1px solid rgba(212,167,44,.5);color:#fde68a;font-weight:700;font-size:.92rem}' +
      '.bq-feat-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:auto;padding-top:6px}' +
      '.bq-feat-btn{display:inline-flex;align-items:center;gap:.4rem;min-height:44px;padding:.55rem 1rem;border-radius:999px;border:1px solid rgba(244,230,193,.3);color:#f4e6c1;font-weight:800;text-decoration:none}' +
      '.bq-feat-btn.is-wa{background:#128c4a;border-color:#128c4a;color:#fff}.bq-feat-btn:focus-visible{outline:3px solid #f4e6c1;outline-offset:2px}' +
      '.bq-feat-cta{margin:1.2rem 0 0}.bq-feat-cta a{color:#f4e6c1;font-weight:800}';
    var s = document.createElement('style'); s.id = 'bqFeatStyle'; s.textContent = css; document.head.appendChild(s);
  }

  function featured(filterFn) {
    return load().then(function (map) {
      var ids = [];
      map.forEach(function (tier, id) { if (filterFn(tier)) ids.push(id); });
      return businesses(ids).then(function (rows) {
        return rows.map(function (b) { return { b: b, tier: map.get(String(b.id)) }; })
          .sort(function (x, y) { return rank(x.tier.plan) - rank(y.tier.plan) || String(x.b.name).localeCompare(String(y.b.name), 'es'); });
      });
    });
  }

  // Portada: negocios Cumbre.
  function initHome() {
    var anchor = document.getElementById('experienciasSection') || document.getElementById('testimoniosSection');
    if (!anchor) return;
    featured(function (tier) { return tier.plan === 'cumbre'; }).then(function (items) {
      if (!items.length || document.getElementById('bqFeaturedBiz')) return;
      installStyle();
      anchor.parentNode.insertBefore(section('plans.featured.homeTitle', 'Negocios destacados', null, 'plans.featured.homeLead', 'Hospedajes, restaurantes y experiencias con plan Cumbre. Contactalos directo, sin comisiones.', items), anchor);
    });
  }

  // Departamento: Mirador y Cumbre de ese territorio.
  function deptId() {
    var id = new URLSearchParams(window.location.search).get('id') || 'madriz';
    return id.replace(/-/g, '_').toLowerCase();
  }
  var deptBusy = false;
  function placeDept() {
    if (deptBusy) return;
    var main = document.querySelector('main');
    if (!main) return;
    var id = deptId();
    var current = document.getElementById('bqFeaturedBiz');
    if (current && current.getAttribute('data-dept') === id && main.contains(current)) return;
    deptBusy = true;
    featured(function (tier) { return tier.plan === 'cumbre' || tier.plan === 'mirador'; }).then(function (items) {
      var mine = items.filter(function (it) { return it.b.department_id === id; });
      var old = document.getElementById('bqFeaturedBiz');
      if (old) old.remove();
      if (!mine.length) return;
      installStyle();
      var sec = section('plans.featured.deptTitle', 'Negocios destacados en {dept}', { dept: DEPT_NAMES[id] || '' }, 'plans.featured.deptLead', 'Locales de este territorio con plan BAQUEANO. Contactalos directo por WhatsApp.', mine);
      sec.setAttribute('data-dept', id);
      var before = main.querySelector('.chinandega-logistics-card') || main.querySelector('.territory-closing-card');
      if (before && before.parentNode) before.parentNode.insertBefore(sec, before); else main.appendChild(sec);
    }).then(function () { deptBusy = false; }, function () { deptBusy = false; });
  }
  function initDept() {
    placeDept();
    var main = document.querySelector('main');
    if (main && 'MutationObserver' in window) {
      var timer = null;
      new MutationObserver(function () { clearTimeout(timer); timer = setTimeout(placeDept, 400); }).observe(main, { childList: true });
    }
    window.addEventListener('popstate', function () { setTimeout(placeDept, 600); });
  }

  function init() {
    var path = (window.location.pathname.split('/').pop() || 'index').replace(/\.html$/, '') || 'index';
    if (path === 'index' || path === '') initHome();
    else if (path === 'departamento') initDept();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(window, document);
