// ============================================================================
// BAQUEANO — MOTOR GLOBAL DE INTERNACIONALIZACIÓN
// ============================================================================
// 🎯 POR QUÉ: una navegación parcialmente traducida rompe la confianza y deja
//    fuera de contexto a la interfaz, el contenido dinámico y BAQÜI.
// ⚙️ CÓMO: usa catálogos JSON versionados, español de Nicaragua como fallback,
//    atributos semánticos, compatibilidad con textos heredados y un único evento.
// 📦 QUÉ: API `BaqueanoLanguage`, selector accesible, Intl, SEO y traducción de
//    nodos añadidos después del primer render sin insertar HTML del catálogo.
// ============================================================================
(function initializeBaqueanoI18n(window, document) {
  'use strict';

  if (window.__BAQUEANO_I18N_LOADED__) return;
  window.__BAQUEANO_I18N_LOADED__ = true;

  var SUPPORTED = Object.freeze(['es', 'en', 'fr', 'it', 'pt', 'de']);
  var LOCALES = Object.freeze({ es: 'es-NI', en: 'en-US', fr: 'fr-FR', it: 'it-IT', pt: 'pt-BR', de: 'de-DE' });
  var STORAGE_KEY = 'baqueano_language_v2';
  var LEGACY_STORAGE_KEYS = Object.freeze(['baqueano_language_v1', 'baqueano_language']);
  var VERSION = '2026.10.05';
  var cache = new Map();
  var semanticFallbackKeys = new Map();
  // Índice en minúsculas: permite traducir títulos en MAYÚSCULAS (p. ej. "EXPLORÁ")
  // aunque el catálogo guarde la frase en mayúscula inicial.
  var semanticFallbackKeysLower = new Map();
  var originals = new WeakMap();
  var attributeOriginals = new WeakMap();
  var applying = false;
  var scheduled = false;
  var mutationRoots = new Set();

  var legacyKeys = Object.freeze({
    'Inicio': 'nav.home', 'Explorar': 'nav.explore', 'Destinos': 'nav.destinations', 'Mapa': 'nav.map',
    'Experiencias': 'nav.experiences', 'Cultura': 'nav.culture', 'Historia': 'nav.history',
    'Gastronomía': 'nav.gastronomy', 'Música': 'nav.music', 'Mi Viaje': 'nav.trip', 'Más': 'nav.more',
    'Buscar': 'actions.search', 'Cerrar': 'actions.close', 'Volver': 'actions.back', 'Continuar': 'actions.continue',
    'Guardar': 'actions.save', 'Cancelar': 'actions.cancel', 'Aceptar': 'actions.accept', 'Enviar': 'actions.send',
    'Ver más': 'actions.viewMore', 'Leer más': 'actions.readMore', 'Ver detalles': 'actions.details',
    'Compartir': 'actions.share', 'Cargando...': 'status.loading', 'No hay resultados': 'status.empty',
    'Sin resultados': 'status.empty', 'Todos los derechos reservados.': 'footer.rights',
    'Cambiar idioma': 'language.change', 'Preguntá por destinos, rutas o experiencias…': 'baqui.placeholder',
    'Escribe tu consulta': 'baqui.inputLabel', 'Escribí tu consulta': 'baqui.inputLabel', 'Limpiar': 'baqui.clear',
    'Detener': 'baqui.stop', 'Escuchar': 'baqui.listen', 'Abrir panel': 'baqui.openPanel', 'Ahora no': 'baqui.later'
  });

  function normalizeLanguage(value) {
    var code = String(value || '').trim().toLowerCase().split(/[-_]/)[0];
    return SUPPORTED.includes(code) ? code : 'es';
  }

  // El almacenamiento puede estar bloqueado (modo privado, política del
  // navegador): el idioma sigue funcionando en la página aunque no persista.
  function readStored(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }

  function initialLanguage() {
    var stored = readStored(STORAGE_KEY);
    if (!stored) {
      LEGACY_STORAGE_KEYS.some(function findLegacy(key) {
        stored = readStored(key);
        return Boolean(stored);
      });
    }
    return stored ? normalizeLanguage(stored) : normalizeLanguage(navigator.language);
  }

  var currentLanguage = initialLanguage();
  var activeCatalog = null;
  var fallbackCatalog = null;

  function getPath(source, path) {
    return String(path || '').split('.').reduce(function readPath(value, segment) {
      return value && Object.prototype.hasOwnProperty.call(value, segment) ? value[segment] : undefined;
    }, source);
  }

  function indexCanonicalPhrases(source, prefix) {
    Object.keys(source || {}).forEach(function indexValue(segment) {
      var key = prefix ? prefix + '.' + segment : segment;
      var value = source[segment];
      if (value && typeof value === 'object' && !Array.isArray(value)) indexCanonicalPhrases(value, key);
      else if (typeof value === 'string' && value.trim() && !semanticFallbackKeys.has(value.trim())) {
        semanticFallbackKeys.set(value.trim(), key);
        var lowered = value.trim().toLowerCase();
        if (!semanticFallbackKeysLower.has(lowered)) semanticFallbackKeysLower.set(lowered, key);
      }
    });
  }

  async function loadCatalog(language) {
    var safeLanguage = normalizeLanguage(language);
    if (cache.has(safeLanguage)) return cache.get(safeLanguage);
    var request = fetch('locales/' + safeLanguage + '.json?v=' + VERSION, { credentials: 'same-origin', cache: 'force-cache' })
      .then(function parse(response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      });
    cache.set(safeLanguage, request);
    try {
      return await request;
    } catch (error) {
      cache.delete(safeLanguage);
      if (safeLanguage !== 'es') return loadCatalog('es');
      console.error('[i18n] No se pudo cargar el catálogo base.', error);
      return {};
    }
  }

  function translate(key, options) {
    var settings = options || {};
    var value = getPath(activeCatalog, key);
    if (typeof value !== 'string' || !value.trim()) value = getPath(fallbackCatalog, key);
    if (typeof value !== 'string' || !value.trim()) {
      if (settings.fallback != null) return String(settings.fallback);
      if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') console.warn('[i18n] Missing key:', key, currentLanguage);
      return '';
    }
    return value.replace(/\{(\w+)\}/g, function replaceToken(_, token) {
      return settings[token] == null ? '{' + token + '}' : String(settings[token]);
    });
  }

  function translateLegacy(value) {
    var leading = (String(value).match(/^\s*/) || [''])[0];
    var trailing = (String(value).match(/\s*$/) || [''])[0];
    var source = String(value).trim();
    var key = legacyKeys[source] || semanticFallbackKeys.get(source);
    var shouted = false;
    if (!key) {
      // Misma frase con otra capitalización; si el original estaba TODO EN MAYÚSCULAS se conserva ese estilo.
      key = semanticFallbackKeysLower.get(source.toLowerCase());
      shouted = Boolean(key) && source === source.toUpperCase() && source !== source.toLowerCase();
    }
    if (!key || currentLanguage === 'es') return value;
    var translated = translate(key, { fallback: source });
    if (shouted) translated = translated.toLocaleUpperCase(LOCALES[currentLanguage]);
    return leading + translated + trailing;
  }

  function eligibleText(node) {
    var parent = node.parentElement;
    if (!parent || !String(node.nodeValue || '').trim()) return false;
    return !parent.closest('script,style,noscript,code,pre,textarea,[data-no-translate],.notranslate,[data-i18n]');
  }

  function applyTextNode(node) {
    if (!originals.has(node)) originals.set(node, node.nodeValue);
    var value = translateLegacy(originals.get(node));
    if (node.nodeValue !== value) node.nodeValue = value;
  }

  function applyAttribute(element, attribute, dataAttribute) {
    var key = element.getAttribute(dataAttribute);
    if (!key) return;
    var fallback = element.getAttribute(attribute) || '';
    var value = translate(key, { fallback: fallback });
    if (value && element.getAttribute(attribute) !== value) element.setAttribute(attribute, value);
  }

  function applyElement(element) {
    if (element.hasAttribute('data-i18n')) {
      var key = element.getAttribute('data-i18n');
      var fallback = element.textContent;
      var value = translate(key, { fallback: fallback });
      if (value && element.textContent !== value) element.textContent = value;
    }
    applyAttribute(element, 'placeholder', 'data-i18n-placeholder');
    applyAttribute(element, 'title', 'data-i18n-title');
    applyAttribute(element, 'aria-label', 'data-i18n-aria-label');
    applyAttribute(element, 'alt', 'data-i18n-alt');

    var stored = attributeOriginals.get(element) || {};
    ['placeholder', 'title', 'aria-label', 'alt'].forEach(function translateLegacyAttribute(name) {
      if (element.hasAttribute('data-i18n-' + name)) return;
      if (element.hasAttribute(name) && stored[name] == null) stored[name] = element.getAttribute(name);
      if (stored[name] != null) {
        var translatedAttribute = translateLegacy(stored[name]);
        if (element.getAttribute(name) !== translatedAttribute) element.setAttribute(name, translatedAttribute);
      }
    });
    attributeOriginals.set(element, stored);
  }

  function updateMetadata() {
    document.documentElement.lang = LOCALES[currentLanguage];
    document.documentElement.dir = 'ltr';
    var titleKey = document.documentElement.dataset.i18nTitle || document.body?.dataset.i18nTitle;
    var descriptionKey = document.documentElement.dataset.i18nDescription || document.body?.dataset.i18nDescription;
    if (titleKey) document.title = translate(titleKey, { fallback: document.title });
    var description = document.querySelector('meta[name="description"]');
    if (description && descriptionKey) description.content = translate(descriptionKey, { fallback: description.content });
    var ogTitle = document.querySelector('meta[property="og:title"]');
    var ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogTitle && titleKey) ogTitle.content = translate(titleKey, { fallback: ogTitle.content });
    if (ogDescription && descriptionKey) ogDescription.content = translate(descriptionKey, { fallback: ogDescription.content });
  }

  function updateButtons() {
    document.querySelectorAll('.global-language,.navbar-lang-pill').forEach(function updateButton(button) {
      var label = button.querySelector('span');
      if (label) label.textContent = currentLanguage.toUpperCase();
      button.setAttribute('aria-label', translate('language.change', { fallback: 'Cambiar idioma' }));
      button.setAttribute('aria-expanded', String(Boolean(document.querySelector('.bq-language-menu'))));
    });
  }

  function applyTranslations(root) {
    if (applying || !activeCatalog) return;
    applying = true;
    var scope = root && root.nodeType === 1 ? root : document.body;
    if (scope) {
      applyElement(scope);
      scope.querySelectorAll('*').forEach(applyElement);
      var walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) if (eligibleText(walker.currentNode)) applyTextNode(walker.currentNode);
    }
    updateMetadata();
    updateButtons();
    applying = false;
  }

  function closeMenu() {
    var menu = document.querySelector('.bq-language-menu');
    if (menu) menu.remove();
    updateButtons();
  }

  function languageChangedDetail() {
    return { lang: currentLanguage, language: currentLanguage, locale: LOCALES[currentLanguage] };
  }

  async function changeLanguage(language, options) {
    var next = normalizeLanguage(language);
    fallbackCatalog = fallbackCatalog || await loadCatalog('es');
    if (!semanticFallbackKeys.size) indexCanonicalPhrases(fallbackCatalog, '');
    activeCatalog = next === 'es' ? fallbackCatalog : await loadCatalog(next);
    currentLanguage = next;
    try {
      localStorage.setItem(STORAGE_KEY, currentLanguage);
      LEGACY_STORAGE_KEYS.forEach(function removeLegacy(key) { localStorage.removeItem(key); });
    } catch (_) { /* sin persistencia: el idioma aplica solo a esta página */ }
    closeMenu();
    applyTranslations(document.body);
    if (!options || !options.silent) {
      var detail = languageChangedDetail();
      window.dispatchEvent(new CustomEvent('baqueano:languageChanged', { detail: detail }));
      window.dispatchEvent(new CustomEvent('baqueano:language', { detail: detail }));
      window.dispatchEvent(new CustomEvent('baqueano', { detail: detail }));
      window.dataLayer?.push({ event: 'language_changed', language: currentLanguage });
    }
    return currentLanguage;
  }

  function openMenu(button) {
    closeMenu();
    var menu = document.createElement('div');
    menu.className = 'bq-language-menu';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', translate('language.change', { fallback: 'Cambiar idioma' }));
    SUPPORTED.forEach(function addLanguage(language) {
      var item = document.createElement('button');
      item.type = 'button';
      item.dataset.lang = language;
      item.setAttribute('role', 'menuitemradio');
      item.setAttribute('aria-checked', String(language === currentLanguage));
      item.classList.toggle('is-active', language === currentLanguage);
      var code = document.createElement('strong');
      code.textContent = language.toUpperCase();
      var name = document.createElement('span');
      name.textContent = translate('language.' + language, { fallback: language.toUpperCase() });
      var marker = document.createElement('i');
      marker.className = 'fa-solid fa-check';
      marker.setAttribute('aria-hidden', 'true');
      item.append(code, name, marker);
      item.addEventListener('click', function selectItem() { changeLanguage(language); });
      menu.appendChild(item);
    });
    document.body.appendChild(menu);
    var rect = button.getBoundingClientRect();
    menu.style.top = Math.min(innerHeight - menu.offsetHeight - 10, rect.bottom + 8) + 'px';
    menu.style.right = Math.max(10, innerWidth - rect.right) + 'px';
    button.setAttribute('aria-expanded', 'true');
    menu.querySelector('.is-active')?.focus();
    menu.addEventListener('keydown', function navigate(event) {
      var items = Array.from(menu.querySelectorAll('button'));
      var index = items.indexOf(document.activeElement);
      if (event.key === 'Escape') { closeMenu(); button.focus(); return; }
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      event.preventDefault();
      items[(index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus();
    });
  }

  function bindButtons(root) {
    (root || document).querySelectorAll('.global-language,.navbar-lang-pill').forEach(function bind(button) {
      if (button.dataset.languageReady) return;
      button.dataset.languageReady = 'true';
      button.setAttribute('aria-haspopup', 'menu');
      button.setAttribute('aria-expanded', 'false');
      button.addEventListener('click', function toggle(event) {
        event.stopPropagation();
        document.querySelector('.bq-language-menu') ? closeMenu() : openMenu(button);
      });
    });
  }

  function installStyle() {
    if (document.getElementById('baqueano-language-style')) return;
    var style = document.createElement('style');
    style.id = 'baqueano-language-style';
    style.textContent = '.bq-language-menu{position:fixed;z-index:2147483000;width:min(220px,calc(100vw - 20px));max-height:min(420px,calc(100vh - 20px));overflow:auto;padding:7px;background:#fff;border:1px solid #DCE6E9;border-radius:14px;box-shadow:0 18px 45px rgba(15,23,42,.22);font-family:Inter,system-ui,sans-serif}.bq-language-menu button{width:100%;min-width:0;display:grid;grid-template-columns:35px minmax(0,1fr) auto;align-items:center;gap:8px;padding:10px;border:0;border-radius:9px;background:transparent;color:#0F172A;text-align:left;cursor:pointer}.bq-language-menu button:hover,.bq-language-menu button:focus-visible,.bq-language-menu button.is-active{background:#EEF6F7;outline:2px solid transparent}.bq-language-menu button:focus-visible{box-shadow:0 0 0 3px #F65E01}.bq-language-menu strong{color:#165D6F}.bq-language-menu span{font-weight:700;overflow-wrap:anywhere}.bq-language-menu i{visibility:hidden;color:#F65E01}.bq-language-menu button.is-active i{visibility:visible}@media(max-width:960px){#mainNavbar .global-language,#mainNavbar .navbar-lang-pill{display:inline-flex!important}}';
    document.head.appendChild(style);
  }

  function scheduleApply(root) {
    if (root && root.nodeType === 1) mutationRoots.add(root);
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function applyMutationBatch() {
      scheduled = false;
      bindButtons(document);
      var roots = Array.from(mutationRoots);
      mutationRoots.clear();
      if (!roots.length || roots.length > 40) applyTranslations(document.body);
      else roots.forEach(function translateRoot(candidate) {
        if (candidate.isConnected) applyTranslations(candidate);
      });
    });
  }

  async function init() {
    installStyle();
    bindButtons(document);
    await changeLanguage(currentLanguage, { silent: true });
    var observer = new MutationObserver(function observe(records) {
      if (applying) return;
      records.forEach(function collectMutations(record) {
        if (record.type === 'characterData') {
          if (eligibleText(record.target)) scheduleApply(record.target.parentElement);
          return;
        }
        Array.from(record.addedNodes).forEach(function inspect(node) {
          if (node.nodeType === 1) scheduleApply(node);
          else if (node.nodeType === 3 && eligibleText(node)) scheduleApply(node.parentElement);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  document.addEventListener('click', function closeOnOutside(event) {
    if (!event.target.closest('.bq-language-menu,.global-language,.navbar-lang-pill')) closeMenu();
  });
  document.addEventListener('keydown', function closeOnEscape(event) { if (event.key === 'Escape') closeMenu(); });

  window.BaqueanoLanguage = Object.freeze({
    get: function getLanguage() { return currentLanguage; },
    getLocale: function getLocale() { return LOCALES[currentLanguage]; },
    getSupported: function getSupported() { return SUPPORTED.slice(); },
    set: changeLanguage,
    t: translate,
    translate: translateLegacy,
    apply: applyTranslations,
    translateElement: function translateElement(element) { applyTranslations(element); },
    refresh: function refresh() { applyTranslations(document.body); },
    formatDate: function formatDate(value, options) { return new Intl.DateTimeFormat(LOCALES[currentLanguage], options).format(new Date(value)); },
    formatNumber: function formatNumber(value, options) { return new Intl.NumberFormat(LOCALES[currentLanguage], options).format(value); },
    formatCurrency: function formatCurrency(value, currency) { return new Intl.NumberFormat(LOCALES[currentLanguage], { style: 'currency', currency: currency || 'NIO' }).format(value); }
  });

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init, { once: true }) : init();
}(window, document));
