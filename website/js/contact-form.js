// ============================================================================
// 🧭 BAQUEANO — FORMULARIO DE CONTACTO (contact-form.js)
// ============================================================================
// 🎯 POR QUÉ:
// - El formulario de nosotros.html no tenía manejador: al enviarlo, el navegador recargaba la
//   página con el nombre, el correo y el mensaje en la URL, y nada llegaba al equipo.
// - Ahora el mensaje se guarda en Supabase (contact_messages), aparece en el Ops Center con un
//   código BAQ-CONTACT y solo después se avisa por correo.
//
// ⚙️ CÓMO:
// - Valida en el navegador con mensajes accesibles (aria-invalid más un resumen con role=alert).
//   El servidor vuelve a validar todo.
// - Campo trampa invisible (honeypot) y clave de idempotencia; el botón se deshabilita mientras
//   envía.
// - Si falla la red, lo escrito no se borra.
// - ?motivo=privacidad|cookies preselecciona el tipo de consulta (llega desde cookies.html y
//   privacidad.html).
//
// 📦 QUÉ: se engancha a #baqueanoContactForm; no expone nada global.
// ============================================================================
(function (window, document) {
  'use strict';

  function init() {
    var form = document.getElementById('baqueanoContactForm');
    var api = window.BaqueanoIntake;
    if (!form || !api || form.dataset.intakeReady) return;
    form.dataset.intakeReady = '1';
    var t = api.t;
    var key = api.newKey();

    // Campo trampa: invisible para personas y para lectores de pantalla.
    var trap = document.createElement('input');
    trap.type = 'text'; trap.name = 'website'; trap.tabIndex = -1; trap.autocomplete = 'off';
    trap.setAttribute('aria-hidden', 'true');
    trap.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0;';
    form.appendChild(trap);

    var status = document.createElement('div');
    status.setAttribute('role', 'alert');
    status.className = 'contact-form-status';
    status.style.cssText = 'display:none;margin-top:16px;padding:12px 14px;border-radius:10px;font-size:.88rem;line-height:1.5;';
    form.appendChild(status);

    // Mensaje traído desde otra página (reporte de un destino, por ejemplo); se borra al leerlo.
    try {
      var prefill = JSON.parse(sessionStorage.getItem('baqueano_contact_prefill_v1') || 'null');
      if (prefill) {
        sessionStorage.removeItem('baqueano_contact_prefill_v1');
        if (prefill.message && !form.mensaje.value) form.mensaje.value = prefill.message;
      }
    } catch (_) { /* sin almacenamiento */ }
    var motivo = new URLSearchParams(window.location.search).get('motivo');
    if (motivo && form.tipo && Array.prototype.some.call(form.tipo.options, function (o) { return o.value === motivo; })) form.tipo.value = motivo;

    function showStatus(kind, text) {
      status.style.display = 'block';
      status.style.background = kind === 'error' ? '#FEF2F2' : '#ECFDF5';
      status.style.border = '1px solid ' + (kind === 'error' ? '#FCA5A5' : '#6EE7B7');
      status.style.color = kind === 'error' ? '#7F1D1D' : '#064E3B';
      status.textContent = text;
    }
    function mark(field, invalid) {
      if (!field) return;
      field.setAttribute('aria-invalid', invalid ? 'true' : 'false');
      field.style.borderColor = invalid ? '#DC2626' : '#E2E8F0';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var button = document.getElementById('contactSubmitBtn');
      var name = form.nombre.value.trim();
      var email = form.email.value.trim();
      var subject = form.tipo.value;
      var message = form.mensaje.value.trim();
      var errors = [];
      mark(form.nombre, name.length < 2); if (name.length < 2) errors.push(t('intake.contact.errName', 'Escribí tu nombre.'));
      var emailOk = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email);
      mark(form.email, !emailOk); if (!emailOk) errors.push(t('intake.contact.errEmail', 'Escribí un correo electrónico válido para poder responderte.'));
      mark(form.tipo, !subject); if (!subject) errors.push(t('intake.contact.errSubject', 'Elegí el tipo de consulta.'));
      mark(form.mensaje, message.length < 10); if (message.length < 10) errors.push(t('intake.contact.errMessage', 'Tu mensaje debe tener al menos 10 caracteres.'));
      if (errors.length) {
        showStatus('error', errors.join(' '));
        var first = form.querySelector('[aria-invalid="true"]');
        if (first) first.focus();
        return;
      }
      if (button) { button.disabled = true; button.setAttribute('aria-busy', 'true'); button.style.opacity = '.7'; }
      showStatus('ok', t('intake.sending', 'Enviando…'));
      api.call('contact_submit', {
        name: name, email: email, subject: subject, message: message,
        department: form.departamento.value || null,
        website: trap.value, idempotencyKey: key
      }).then(function (data) {
        if (!data.code) { showStatus('ok', t('intake.contact.thanks', 'Gracias. Recibimos tu mensaje.')); return; }
        var box = document.createElement('div');
        box.setAttribute('role', 'status');
        box.tabIndex = -1;
        box.style.cssText = 'background:#FFF;border:1px solid #6EE7B7;border-radius:20px;padding:32px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.06);';
        var icon = document.createElement('i'); icon.className = 'fa-solid fa-circle-check'; icon.setAttribute('aria-hidden', 'true');
        icon.style.cssText = 'font-size:2.4rem;color:#4A7A5A;';
        var title = document.createElement('h3'); title.textContent = t('intake.contact.successTitle', '¡Recibimos tu mensaje!');
        title.style.cssText = "font-family:'League Spartan',sans-serif;color:#0B253A;margin:12px 0 8px;";
        var p = document.createElement('p'); p.style.cssText = 'color:#334155;margin:0 0 12px;';
        p.textContent = t('intake.contact.successBody', 'Quedó registrado con el código {code}. El equipo de BAQUEANO lo revisará y te responderá a {email}.', { code: data.code, email: email });
        var code = document.createElement('p'); code.style.cssText = 'font-family:monospace;font-size:1.1rem;font-weight:700;color:#165D6F;margin:0 0 16px;';
        code.textContent = data.code;
        var again = document.createElement('button'); again.type = 'button';
        again.style.cssText = 'background:#165D6F;color:#FFF;border:none;padding:11px 24px;border-radius:12px;font-weight:700;cursor:pointer;';
        again.textContent = t('intake.contact.another', 'Enviar otro mensaje');
        again.addEventListener('click', function () {
          box.remove(); form.reset(); key = api.newKey(); status.style.display = 'none'; form.hidden = false; form.nombre.focus();
        });
        box.append(icon, title, p, code, again);
        form.hidden = true;
        form.parentNode.insertBefore(box, form.nextSibling);
        box.focus();
      }).catch(function (error) {
        showStatus('error', error.message);
      }).then(function () {
        if (button) { button.disabled = false; button.removeAttribute('aria-busy'); button.style.opacity = ''; }
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window, document);
