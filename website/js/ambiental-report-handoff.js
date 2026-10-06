// ============================================================================
// 🧭 BAQUEANO — PASO PREVIO DE DENUNCIA EN ambiental.html (ambiental-report-handoff.js)
// ============================================================================
// 🎯 POR QUÉ: el formulario rápido de ambiental.html no tenía manejador. Al enviarlo, la página se
//    recargaba y el reporte se perdía, aunque parecía enviado. Hay un solo canal real de denuncias
//    (denuncias.html → Supabase → Ops Center): este formulario no debe ser un segundo canal falso.
// ⚙️ CÓMO: guarda el tipo y la descripción en sessionStorage (solo en esta pestaña) y lleva a
//    denuncias.html, donde eco-report.js los recupera para completar el reporte real con ubicación,
//    evidencias y consentimiento.
// 📦 QUÉ: se engancha a #ambientalReportForm.
// ============================================================================
(function () {
  'use strict';
  var form = document.getElementById('ambientalReportForm');
  if (!form) return;
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    try {
      sessionStorage.setItem('baqueano_eco_prefill_v1', JSON.stringify({
        category: form.category ? form.category.value : '',
        description: form.description ? form.description.value.trim().slice(0, 4000) : ''
      }));
    } catch (_) { /* sin almacenamiento: se continúa igual */ }
    window.location.href = 'denuncias.html#ecoReportForm';
  });
})();
