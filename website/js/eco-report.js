// ============================================================================
// 🧭 BAQUEANO — DENUNCIA AMBIENTAL CONFIDENCIAL (eco-report.js)
// ============================================================================
// 🎯 POR QUÉ:
// - El formulario de denuncias.html mostraba "registrado con éxito" sin guardar nada. El propietario
//   pide:
//   - guardar en Supabase y en el Ops Center con código BAQ-ECO;
//   - evidencias privadas;
//   - punto exacto en el mapa;
//   - fecha del incidente;
//   - anonimato;
//   - un comprobante;
//   - no afirmar nunca que se envió a una institución sin confirmación real.
//
// ⚙️ CÓMO:
// - Envía a la Edge Function baqueano-intake (eco_submit). El servidor valida todo, devuelve el
//   código, un token privado de consulta (se muestra una sola vez) y URLs firmadas para subir cada
//   evidencia al bucket privado.
// - Sube cada archivo con su URL firmada y luego pide confirmar (eco_evidence_confirm): el
//   servidor revisa la firma real del archivo. Si una subida falla, el reporte ya está guardado y
//   se informa con claridad.
// - Mapa Leaflet cargado solo al pulsar "Marcar en el mapa" (no pesa en la carga inicial). Marcador
//   arrastrable.
//   - Geolocalización solo al pulsar "Usar mi ubicación actual" y con el permiso del navegador.
//   - Nunca se usa el centro del departamento como ubicación exacta.
// - Municipios reales desde Supabase (tabla municipalities).
// - Si la red falla, lo escrito no se borra. Clave de idempotencia contra el doble envío.
//
// 📦 QUÉ: se engancha a #ecoReportForm y #ecoLookupForm en denuncias.html.
// ============================================================================
(function (window, document) {
  'use strict';

  var LEAFLET_JS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
  var LEAFLET_JS_SRI = 'sha512-puJW3E/qXDqYp9IfhAI54BJEaWIfloJ7JWs7OeD5i6ruC9JZL1gERT1wjtwXFlh7CjE7ZJ+/vcRZRkIYIb6p4g==';
  var LEAFLET_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
  var NIC_BOUNDS = [[10.5, -88.0], [15.2, -82.5]];
  var LIMITS = { files: 6, image: 10 * 1024 * 1024, video: 50 * 1024 * 1024 };
  var TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];

  function init() {
    var form = document.getElementById('ecoReportForm');
    var api = window.BaqueanoIntake;
    if (!form || !api || form.dataset.ready) return;
    form.dataset.ready = '1';
    var t = api.t;
    var state = { key: api.newKey(), files: [], lat: null, lng: null, source: 'none', map: null, marker: null };

    var el = {
      dept: document.getElementById('reportDepartment'),
      muni: document.getElementById('reportMunicipality'),
      when: document.getElementById('reportWhen'),
      unsure: document.getElementById('reportWhenUnsure'),
      files: document.getElementById('reportEvidence'),
      list: document.getElementById('ecoEvidenceList'),
      anon: document.getElementById('reportAnonymous'),
      contact: document.getElementById('ecoContactFields'),
      status: document.getElementById('ecoFormStatus'),
      submit: document.getElementById('ecoSubmit'),
      receipt: document.getElementById('ecoReceipt'),
      mapBox: document.getElementById('ecoMap'),
      coords: document.getElementById('ecoCoords'),
      openMap: document.getElementById('ecoOpenMap'),
      gps: document.getElementById('ecoUseGps'),
      clear: document.getElementById('ecoClearPin')
    };
    if (el.when) el.when.max = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    // Datos traídos desde el paso previo de ambiental.html (misma pestaña, se borran al leerlos).
    try {
      var prefill = JSON.parse(sessionStorage.getItem('baqueano_eco_prefill_v1') || 'null');
      if (prefill) {
        sessionStorage.removeItem('baqueano_eco_prefill_v1');
        if (prefill.category && form.category.querySelector('option[value="' + prefill.category + '"]')) form.category.value = prefill.category;
        if (prefill.description) form.description.value = prefill.description;
      }
    } catch (_) { /* sin almacenamiento */ }

    function status(kind, text) {
      el.status.hidden = !text;
      el.status.className = 'eco-status ' + (kind === 'error' ? 'is-error' : 'is-ok');
      el.status.textContent = text || '';
    }

    // ---------------------------------------------------------------- municipios reales
    el.dept.addEventListener('change', function () {
      var value = el.dept.value;
      el.muni.replaceChildren();
      var first = document.createElement('option'); first.value = '';
      if (!value) {
        first.textContent = t('ecoReport.municipalityFirst', 'Primero elegí el territorio');
        el.muni.append(first); el.muni.disabled = true; return;
      }
      first.textContent = t('ecoReport.municipalityLoading', 'Cargando municipios…');
      el.muni.append(first); el.muni.disabled = true;
      api.loadMunicipalities(value).then(function (names) {
        first.textContent = names.length ? t('ecoReport.municipalityPick', 'Elegí el municipio (opcional)') : t('ecoReport.municipalityNone', 'No se pudieron cargar; escribilo en la referencia');
        names.forEach(function (name) { var o = document.createElement('option'); o.value = name; o.textContent = name; el.muni.append(o); });
        el.muni.disabled = !names.length;
      });
    });

    // ---------------------------------------------------------------- anonimato
    function syncAnon() { el.contact.hidden = el.anon.checked; }
    el.anon.addEventListener('change', syncAnon); syncAnon();
    el.unsure.addEventListener('change', function () { el.when.disabled = el.unsure.checked; if (el.unsure.checked) el.when.value = ''; });

    // ---------------------------------------------------------------- evidencias
    function fmtSize(bytes) { return bytes >= 1048576 ? (bytes / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(bytes / 1024)) + ' KB'; }
    function renderFiles() {
      el.list.replaceChildren();
      state.files.forEach(function (item, index) {
        var li = document.createElement('li');
        var thumb;
        if (item.file.type.indexOf('image/') === 0) {
          thumb = document.createElement('img'); thumb.src = item.url; thumb.alt = ''; thumb.width = 56; thumb.height = 56;
        } else {
          thumb = document.createElement('span'); thumb.className = 'eco-video-thumb';
          var i = document.createElement('i'); i.className = 'fa-solid fa-film'; i.setAttribute('aria-hidden', 'true'); thumb.append(i);
        }
        var name = document.createElement('span'); name.className = 'eco-file-name'; name.textContent = item.file.name + ' · ' + fmtSize(item.file.size);
        var remove = document.createElement('button'); remove.type = 'button'; remove.className = 'eco-btn-link';
        remove.textContent = t('ecoReport.removeFile', 'Quitar');
        remove.setAttribute('aria-label', t('ecoReport.removeFileAria', 'Quitar {name}', { name: item.file.name }));
        remove.addEventListener('click', function () { URL.revokeObjectURL(item.url); state.files.splice(index, 1); renderFiles(); });
        li.append(thumb, name, remove);
        el.list.append(li);
      });
    }
    el.files.addEventListener('change', function () {
      var problems = [];
      Array.prototype.forEach.call(el.files.files, function (file) {
        if (state.files.length >= LIMITS.files) { problems.push(t('ecoReport.errTooMany', 'Podés adjuntar hasta 6 archivos.')); return; }
        if (TYPES.indexOf(file.type) === -1) { problems.push(t('ecoReport.errType', '{name}: solo fotos JPG, PNG o WebP y videos MP4, WebM o MOV.', { name: file.name })); return; }
        var max = file.type.indexOf('video/') === 0 ? LIMITS.video : LIMITS.image;
        if (file.size > max) { problems.push(t('ecoReport.errSize', '{name} supera el tamaño permitido.', { name: file.name })); return; }
        state.files.push({ file: file, url: URL.createObjectURL(file) });
      });
      el.files.value = '';
      renderFiles();
      status(problems.length ? 'error' : '', problems.filter(function (v, i, a) { return a.indexOf(v) === i; }).join(' '));
    });

    // ---------------------------------------------------------------- mapa y ubicación
    function setPoint(lat, lng, source) {
      if (lat < NIC_BOUNDS[0][0] || lat > NIC_BOUNDS[1][0] || lng < NIC_BOUNDS[0][1] || lng > NIC_BOUNDS[1][1]) {
        status('error', t('ecoReport.errOutside', 'Ese punto está fuera de Nicaragua. Marcá el lugar dentro del país.'));
        return;
      }
      state.lat = Math.round(lat * 1e6) / 1e6; state.lng = Math.round(lng * 1e6) / 1e6; state.source = source;
      el.coords.textContent = t('ecoReport.pointSet', 'Punto marcado: {lat}, {lng}', { lat: state.lat.toFixed(5), lng: state.lng.toFixed(5) });
      el.clear.hidden = false;
      if (state.map) {
        if (!state.marker) {
          state.marker = window.L.marker([state.lat, state.lng], { draggable: true, keyboard: true, title: t('ecoReport.markerTitle', 'Lugar del incidente') }).addTo(state.map);
          state.marker.on('dragend', function () { var p = state.marker.getLatLng(); setPoint(p.lat, p.lng, 'map'); });
        } else {
          state.marker.setLatLng([state.lat, state.lng]);
        }
      }
    }
    function loadLeaflet() {
      if (window.L) return Promise.resolve(window.L);
      return new Promise(function (resolve, reject) {
        var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = LEAFLET_CSS; document.head.append(css);
        var js = document.createElement('script'); js.src = LEAFLET_JS; js.integrity = LEAFLET_JS_SRI; js.crossOrigin = 'anonymous';
        js.onload = function () { resolve(window.L); }; js.onerror = reject;
        document.head.append(js);
      });
    }
    function openMap() {
      el.mapBox.hidden = false;
      if (state.map) { state.map.invalidateSize(); return Promise.resolve(); }
      return loadLeaflet().then(function (L) {
        state.map = L.map(el.mapBox, { maxBounds: [[9.8, -89], [15.8, -81.5]], minZoom: 6 }).fitBounds(NIC_BOUNDS);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(state.map);
        state.map.on('click', function (e) { setPoint(e.latlng.lat, e.latlng.lng, 'map'); });
        if (state.lat != null) { setPoint(state.lat, state.lng, state.source); state.map.setView([state.lat, state.lng], 14); }
      }).catch(function () {
        el.mapBox.hidden = true;
        status('error', t('ecoReport.errMap', 'No se pudo cargar el mapa. Podés describir el lugar en la referencia.'));
      });
    }
    el.openMap.addEventListener('click', openMap);
    el.gps.addEventListener('click', function () {
      if (!navigator.geolocation) { status('error', t('ecoReport.errGpsUnsupported', 'Tu navegador no permite obtener la ubicación.')); return; }
      status('', t('ecoReport.gpsWaiting', 'Pidiendo permiso de ubicación…'));
      navigator.geolocation.getCurrentPosition(function (pos) {
        status('', '');
        openMap().then(function () {
          setPoint(pos.coords.latitude, pos.coords.longitude, 'gps');
          if (state.map && state.lat != null) state.map.setView([state.lat, state.lng], 15);
        });
      }, function () {
        status('error', t('ecoReport.errGpsDenied', 'No obtuvimos tu ubicación. Podés marcar el punto en el mapa o describir el lugar.'));
      }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
    });
    el.clear.addEventListener('click', function () {
      state.lat = state.lng = null; state.source = 'none'; el.coords.textContent = ''; el.clear.hidden = true;
      if (state.marker && state.map) { state.map.removeLayer(state.marker); state.marker = null; }
    });

    // ---------------------------------------------------------------- envío
    function invalid(field, bad) { if (field) field.setAttribute('aria-invalid', bad ? 'true' : 'false'); return bad; }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var errors = [];
      if (invalid(form.category, !form.category.value)) errors.push(t('ecoReport.errCategory', 'Elegí el tipo de incidencia.'));
      if (invalid(form.department, !form.department.value)) errors.push(t('ecoReport.errDepartment', 'Elegí el departamento o región.'));
      var description = form.description.value.trim();
      if (invalid(form.description, description.length < 20)) errors.push(t('ecoReport.errDescription', 'Describí lo que viste con al menos 20 caracteres.'));
      if (invalid(form.consent, !form.consent.checked)) errors.push(t('ecoReport.errConsent', 'Confirmá que la información es verdadera para enviar.'));
      if (!form.reference.value.trim() && state.lat == null) errors.push(t('ecoReport.errWhere', 'Indicá dónde ocurrió: escribí una referencia o marcá el punto en el mapa.'));
      if (errors.length) {
        status('error', errors.join(' '));
        var first = form.querySelector('[aria-invalid="true"]'); if (first) first.focus();
        return;
      }
      var anonymous = el.anon.checked;
      var incidentAt = null;
      if (!el.unsure.checked && el.when.value) incidentAt = new Date(el.when.value).toISOString();
      el.submit.disabled = true; el.submit.setAttribute('aria-busy', 'true');
      status('', t('intake.sending', 'Enviando…'));
      api.call('eco_submit', {
        category: form.category.value,
        department: form.department.value,
        municipality: el.muni.value || null,
        community: form.community.value.trim() || null,
        reference: form.reference.value.trim() || null,
        lat: state.lat, lng: state.lng, locationSource: state.source,
        incidentAt: incidentAt, incidentTimeUnsure: el.unsure.checked,
        severity: form.severity.value || null,
        description: description,
        anonymous: anonymous,
        contactName: anonymous ? null : form.contactName.value.trim() || null,
        contactPhone: anonymous ? null : form.contactPhone.value.trim() || null,
        contactEmail: anonymous ? null : form.contactEmail.value.trim() || null,
        evidence: state.files.map(function (item) { return { type: item.file.type, size: item.file.size }; }),
        website: form.website.value,
        idempotencyKey: state.key
      }).then(function (data) {
        if (!data.code) { status('', t('intake.received', 'Recibido.')); return null; }
        status('', state.files.length ? t('ecoReport.uploading', 'Reporte guardado. Subiendo evidencias…') : '');
        return uploadAll(data).then(function (stored) { showReceipt(data, stored); });
      }).catch(function (error) {
        status('error', error.message);
      }).then(function () {
        el.submit.disabled = false; el.submit.removeAttribute('aria-busy');
      });
    });

    function uploadAll(data) {
      var uploads = data.uploads || [];
      if (!uploads.length) return Promise.resolve({ ok: 0, total: state.files.length });
      var ids = [];
      var chain = Promise.resolve();
      uploads.forEach(function (u, i) {
        var item = state.files[i];
        if (!item) return;
        chain = chain.then(function () {
          return fetch(u.signedUrl, { method: 'PUT', headers: { 'content-type': item.file.type, 'x-upsert': 'false' }, body: item.file })
            .then(function (res) { if (res.ok) ids.push(u.evidenceId); })
            .catch(function () { /* se informa abajo */ });
        });
      });
      return chain.then(function () {
        if (!ids.length) return { ok: 0, total: state.files.length };
        return api.call('eco_evidence_confirm', { code: data.code, lookupToken: data.lookupToken, evidenceIds: ids })
          .then(function (res) { return { ok: (res.results || []).filter(function (r) { return r.stored; }).length, total: state.files.length }; })
          .catch(function () { return { ok: 0, total: state.files.length }; });
      });
    }

    function line(label, value) {
      var row = document.createElement('div'); row.className = 'eco-receipt-row';
      var dt = document.createElement('dt'); dt.textContent = label;
      var dd = document.createElement('dd'); dd.textContent = value;
      row.append(dt, dd); return row;
    }
    function showReceipt(data, stored) {
      var created = new Date(data.createdAt || Date.now());
      var when = created.toLocaleString(api.lang(), { dateStyle: 'long', timeStyle: 'short' });
      el.receipt.replaceChildren();
      var title = document.createElement('h3'); title.textContent = t('ecoReport.receiptTitle', 'Reporte recibido por BAQUEANO');
      var intro = document.createElement('p');
      intro.textContent = t('ecoReport.receiptIntro', 'Tu reporte quedó guardado de forma confidencial y el equipo lo revisará. Recibirlo no significa que ya se haya enviado a una institución: si se deriva, lo verás al consultar el estado.');
      var dl = document.createElement('dl');
      dl.append(
        line(t('ecoReport.receiptCode', 'Código'), data.code),
        line(t('ecoReport.receiptDate', 'Fecha y hora'), when),
        line(t('ecoReport.receiptCategory', 'Tipo'), form.category.options[form.category.selectedIndex].textContent),
        line(t('ecoReport.receiptPlace', 'Territorio'), [form.department.value, el.muni.value].filter(Boolean).join(' · ')),
        line(t('ecoReport.receiptEvidence', 'Evidencias guardadas'), stored.ok + ' / ' + stored.total),
        line(t('ecoReport.receiptStatus', 'Estado'), t('ecoReport.statusReceived', 'Recibido por BAQUEANO'))
      );
      var tokenBox = document.createElement('div'); tokenBox.className = 'eco-token-box';
      var tokenLabel = document.createElement('p');
      tokenLabel.textContent = t('ecoReport.tokenWarning', 'Guardá este token privado junto con el código. Es la única forma de consultar el estado y no se vuelve a mostrar.');
      var token = document.createElement('code'); token.textContent = data.lookupToken;
      var copy = document.createElement('button'); copy.type = 'button'; copy.className = 'eco-btn-secondary';
      copy.textContent = t('ecoReport.copy', 'Copiar código y token');
      copy.addEventListener('click', function () {
        var text = data.code + ' · ' + data.lookupToken;
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
          copy.textContent = t('ecoReport.copied', 'Copiado');
        }).catch(function () { copy.textContent = t('ecoReport.copyManual', 'Seleccioná el texto para copiarlo'); });
      });
      tokenBox.append(tokenLabel, token, copy);
      el.receipt.append(title, intro, dl, tokenBox);
      if (stored.total > stored.ok) {
        var warn = document.createElement('p'); warn.className = 'eco-status is-error';
        warn.textContent = t('ecoReport.uploadPartial', 'Algunas evidencias no se pudieron guardar. El reporte sí quedó registrado; si querés, escribinos citando el código.');
        el.receipt.append(warn);
      }
      if (window.BaqueanoPdf && typeof window.BaqueanoPdf.ecoReceipt === 'function') {
        var pdf = document.createElement('button'); pdf.type = 'button'; pdf.className = 'eco-btn-secondary';
        pdf.textContent = t('ecoReport.downloadReceipt', 'Descargar comprobante (PDF)');
        pdf.addEventListener('click', function () {
          var chosen = form.category.options[form.category.selectedIndex];
          // Claves y fecha original: en coreano/chino el PDF sale en inglés y rehace estos valores.
          window.BaqueanoPdf.ecoReceipt({
            code: data.code, createdAt: when, createdAtDate: created,
            category: chosen.textContent, categoryKey: chosen.getAttribute('data-i18n') || '',
            territory: [form.department.value, el.muni.value].filter(Boolean).join(' · '),
            reference: form.reference.value.trim(), evidence: stored.ok + ' / ' + stored.total,
            status: t('ecoReport.statusReceived', 'Recibido por BAQUEANO'), statusKey: 'ecoReport.statusReceived'
          });
        });
        el.receipt.append(pdf);
      }
      state.files.forEach(function (item) { URL.revokeObjectURL(item.url); });
      form.hidden = true;
      el.receipt.hidden = false;
      el.receipt.focus();
    }

    // ---------------------------------------------------------------- consulta de estado
    var lookup = document.getElementById('ecoLookupForm');
    if (lookup) {
      lookup.addEventListener('submit', function (event) {
        event.preventDefault();
        var out = document.getElementById('ecoLookupResult');
        var code = document.getElementById('ecoLookupCode').value.trim().toUpperCase();
        var token = document.getElementById('ecoLookupToken').value.trim();
        out.hidden = false; out.className = 'eco-status is-ok';
        if (!code || !token) { out.className = 'eco-status is-error'; out.textContent = t('ecoReport.lookupMissing', 'Escribí el código y el token privado.'); return; }
        out.textContent = t('intake.sending', 'Enviando…');
        api.call('eco_status', { code: code, lookupToken: token }).then(function (data) {
          var r = data.report || {};
          var labels = {
            received: t('ecoReport.statusReceived', 'Recibido por BAQUEANO'),
            under_review: t('ecoReport.statusReview', 'En revisión'),
            needs_information: t('ecoReport.statusInfo', 'Necesitamos más información'),
            referred: t('ecoReport.statusReferred', 'Derivado a una institución'),
            closed: t('ecoReport.statusClosed', 'Cerrado'),
            archived: t('ecoReport.statusArchived', 'Archivado')
          };
          var text = r.code + ' · ' + (labels[r.status] || r.status);
          if (r.status === 'referred') {
            text += ' · ' + (r.delivery_status === 'external_confirmed'
              ? t('ecoReport.externalConfirmed', 'La institución confirmó la recepción.')
              : t('ecoReport.externalPending', 'Sin confirmación de recepción por parte de la institución.'));
          }
          if (r.public_note) text += ' · ' + r.public_note;
          out.textContent = text;
        }).catch(function (error) { out.className = 'eco-status is-error'; out.textContent = error.message; });
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window, document);
