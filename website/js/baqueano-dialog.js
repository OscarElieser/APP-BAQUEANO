// ============================================================================
// 🧭 BAQUEANO — DIÁLOGO GLOBAL ACCESIBLE (baqueano-dialog.js)
// ============================================================================
// 🎯 POR QUÉ:
// - La web pública usaba alert(), confirm() y prompt() del navegador: ventanas grises sin marca, sin
//   traducción y bloqueantes, y algunas anunciaban éxitos falsos. El Prompt Maestro Integral pide un
//   sistema único de diálogos BAQUEANO, accesible y en 6 idiomas.
//
// ⚙️ CÓMO:
// - <dialog> nativo: foco atrapado, ESC para cerrar, regreso del foco al elemento de origen y
//   bloqueo del scroll del fondo. Contraste AA y botones de 44 px.
// - Promesas en lugar de bloqueos:
//   - notice(...) resuelve al cerrar;
//   - confirm(...) devuelve true o false;
//   - prompt(...) devuelve el texto o null.
// - window.alert se redirige a notice() (no bloqueante). confirm() y prompt() no se reemplazan
//   globalmente porque su uso es síncrono: cada llamada se migra a mano.
// - Textos de los botones con BaqueanoLanguage (6 idiomas). El mensaje se pinta con textContent.
//
// 📦 QUÉ:
// - window.BaqueanoDialog = { notice, confirm, prompt }.
// - window.BaqueanoNewsletterUnavailable(event): aviso honesto del boletín (todavía no existe).
// ============================================================================
(function (window, document) {
  'use strict';
  if (window.BaqueanoDialog) return;

  var nativeAlert = window.alert ? window.alert.bind(window) : null;
  var queue = Promise.resolve();

  function t(key, fallback) {
    try { return window.BaqueanoLanguage && window.BaqueanoLanguage.t ? window.BaqueanoLanguage.t(key, { fallback: fallback }) : fallback; } catch (_) { return fallback; }
  }
  function injectStyles() {
    if (document.getElementById('bqDialogStyles')) return;
    var style = document.createElement('style');
    style.id = 'bqDialogStyles';
    style.appendChild(document.createTextNode(
      '.bqd{width:min(92vw,480px);border:none;border-radius:18px;padding:0;background:#FFFFFF;color:#0D1B2A;box-shadow:0 30px 80px rgba(13,27,42,.35)}' +
      '.bqd::backdrop{background:rgba(13,27,42,.6)}' +
      '.bqd-body{padding:22px 22px 8px;display:flex;gap:14px;align-items:flex-start}' +
      '.bqd-icon{flex:0 0 auto;width:40px;height:40px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;background:#E6F2F4;color:#165D6F;font-size:1.1rem}' +
      '.bqd.is-warning .bqd-icon{background:#FFF7ED;color:#C2410C}.bqd.is-danger .bqd-icon{background:#FEF2F2;color:#B91C1C}.bqd.is-success .bqd-icon{background:#ECFDF5;color:#166534}' +
      '.bqd h2{margin:0 0 6px;font:800 1.08rem/1.3 League Spartan,system-ui,sans-serif;color:#0D1B2A}' +
      '.bqd p{margin:0;font-size:.93rem;line-height:1.55;color:#334155;white-space:pre-line;overflow-wrap:anywhere}' +
      '.bqd-field{width:100%;box-sizing:border-box;margin-top:12px;min-height:44px;border:1.5px solid #CBD5E1;border-radius:10px;padding:10px 12px;font:inherit;font-size:.92rem;color:#0D1B2A}' +
      '.bqd-field:focus-visible{outline:3px solid rgba(22,93,111,.35);border-color:#165D6F}' +
      '.bqd-actions{display:flex;justify-content:flex-end;gap:10px;padding:14px 22px 20px;flex-wrap:wrap}' +
      '.bqd-btn{min-height:44px;padding:10px 18px;border-radius:12px;font-weight:700;font-size:.92rem;cursor:pointer;border:1.5px solid #165D6F;background:#FFFFFF;color:#165D6F}' +
      '.bqd-btn.is-primary{background:#165D6F;color:#FFFFFF}.bqd.is-danger .bqd-btn.is-primary{background:#B91C1C;border-color:#B91C1C}' +
      '.bqd-btn:focus-visible{outline:3px solid #F65E01;outline-offset:2px}' +
      'html.bqd-open,html.bqd-open body{overflow:hidden}' +
      '@media (max-width:480px){.bqd-actions>*{flex:1 1 auto}}'));
    document.head.appendChild(style);
  }

  function open(kind, message, options) {
    options = options || {};
    var run = function () {
      return new Promise(function (resolve) {
        if (!document.body || typeof HTMLDialogElement === 'undefined') {
          if (kind === 'notice' && nativeAlert) nativeAlert(message);
          resolve(kind === 'confirm' ? false : null);
          return;
        }
        injectStyles();
        var opener = document.activeElement;
        var tone = options.tone || (options.danger ? 'danger' : 'info');
        var dialog = document.createElement('dialog');
        dialog.className = 'bqd is-' + tone;
        dialog.setAttribute('aria-labelledby', 'bqdTitle');
        dialog.setAttribute('aria-describedby', 'bqdText');
        var icons = { info: 'fa-circle-info', warning: 'fa-triangle-exclamation', danger: 'fa-triangle-exclamation', success: 'fa-circle-check' };
        var body = document.createElement('div'); body.className = 'bqd-body';
        var icon = document.createElement('span'); icon.className = 'bqd-icon'; icon.setAttribute('aria-hidden', 'true');
        var i = document.createElement('i'); i.className = 'fa-solid ' + (icons[tone] || icons.info); icon.appendChild(i);
        var copy = document.createElement('div'); copy.style.minWidth = '0'; copy.style.flex = '1 1 auto';
        var title = document.createElement('h2'); title.id = 'bqdTitle';
        title.textContent = options.title || (kind === 'confirm' ? t('dialog.confirmTitle', '¿Confirmás esta acción?') : kind === 'prompt' ? t('dialog.promptTitle', 'Escribí tu respuesta') : 'BAQUEANO');
        var text = document.createElement('p'); text.id = 'bqdText'; text.textContent = String(message == null ? '' : message);
        copy.append(title, text);
        var field = null;
        if (kind === 'prompt') {
          field = document.createElement(options.multiline ? 'textarea' : 'input');
          field.className = 'bqd-field';
          if (!options.multiline) field.type = 'text';
          else field.rows = 4;
          field.value = options.value || '';
          if (options.maxLength) field.maxLength = options.maxLength;
          field.setAttribute('aria-labelledby', 'bqdText');
          copy.append(field);
        }
        body.append(icon, copy);
        var actions = document.createElement('div'); actions.className = 'bqd-actions';
        var result = kind === 'confirm' ? false : null;
        function button(label, primary, onClick) {
          var b = document.createElement('button'); b.type = 'button'; b.className = 'bqd-btn' + (primary ? ' is-primary' : '');
          b.textContent = label; b.addEventListener('click', onClick); return b;
        }
        if (kind !== 'notice') actions.append(button(options.cancelText || t('dialog.cancel', 'Cancelar'), false, function () { dialog.close(); }));
        var ok = button(options.confirmText || (kind === 'notice' ? t('dialog.ok', 'Entendido') : t('dialog.accept', 'Aceptar')), true, function () {
          result = kind === 'confirm' ? true : kind === 'prompt' ? field.value : null;
          dialog.close();
        });
        actions.append(ok);
        dialog.append(body, actions);
        if (field) field.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !options.multiline) { e.preventDefault(); ok.click(); } });
        dialog.addEventListener('close', function () {
          document.documentElement.classList.remove('bqd-open');
          dialog.remove();
          if (opener && typeof opener.focus === 'function' && document.contains(opener)) opener.focus();
          resolve(result);
        });
        document.body.appendChild(dialog);
        document.documentElement.classList.add('bqd-open');
        dialog.showModal();
        (field || ok).focus();
      });
    };
    queue = queue.then(run, run);
    return queue;
  }

  window.BaqueanoDialog = {
    notice: function (message, options) { return open('notice', message, options); },
    confirm: function (message, options) { return open('confirm', message, options); },
    prompt: function (message, options) { return open('prompt', message, options); }
  };
  // Cualquier alert() que quede en la web pública usa el diálogo BAQUEANO (no bloqueante).
  window.alert = function (message) { window.BaqueanoDialog.notice(message); };

  // Lleva un aviso (por ejemplo, "este dato del destino está desactualizado") al formulario real de
  // contacto, que lo guarda en Supabase con código BAQ-CONTACT. Antes se guardaba solo en el navegador.
  window.BaqueanoContactHandoff = function (subject, message) {
    try { sessionStorage.setItem('baqueano_contact_prefill_v1', JSON.stringify({ subject: subject || 'otro', message: String(message || '').slice(0, 4000) })); } catch (_) { /* sin almacenamiento */ }
    return window.BaqueanoDialog.notice(
      t('dialog.handoffBody', 'Para que el equipo lo reciba y te pueda responder, te llevamos a Contacto con tu mensaje ya escrito. Solo agregá tu nombre y correo.'),
      { title: t('dialog.handoffTitle', 'Enviar al equipo de BAQUEANO'), tone: 'info', confirmText: t('dialog.handoffGo', 'Ir a Contacto') }
    ).then(function () { window.location.href = 'nosotros.html?motivo=' + encodeURIComponent(subject || 'otro') + '#contacto'; });
  };

  window.BaqueanoNewsletterUnavailable = function (event) {
    if (event && event.preventDefault) event.preventDefault();
    window.BaqueanoDialog.notice(
      t('dialog.newsletterBody', 'El boletín de BAQUEANO todavía no está disponible: no guardamos tu correo. Mientras tanto, seguinos en Instagram y TikTok o escribinos desde Contacto.'),
      { title: t('dialog.newsletterTitle', 'Boletín: próximamente'), tone: 'info' }
    );
    return false;
  };
})(window, document);
