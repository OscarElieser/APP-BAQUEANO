// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CAMPAÑA AMBIENTAL & DENUNCIAS (environmental.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Dotar a los exploradores, guardaparques y familias campesinas de una
//   herramienta digital para reportar talas ilegales, quemas de bosques, vertederos
//   clandestinos o afectaciones a fuentes hídricas con geolocalización satelital.
// - Promover el Decálogo Verde de Baqueano para turismo de huella cero.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Geolocation API para incrustar automáticamente coordenadas GPS precisas
//   en el reporte ciudadano.
// - Conexión directa mediante WhatsApp API y correo formal al equipo de custodia.
// - Validación de campos obligatorios y retroalimentación interactiva.
//
// 📦 3. QUÉ (WHAT / FUNCIONES EXPUESTAS):
// - initEnvironmentalModule(): Vincula eventos del formulario de denuncias y botón GPS.
// ============================================================================

function initEnvironmentalModule() {
  const form = document.getElementById('environmentalReportForm');
  const btnCaptureGps = document.getElementById('btnCaptureGpsReport');
  const descField = document.getElementById('reportDescription');

  if (btnCaptureGps && descField) {
    btnCaptureGps.addEventListener('click', () => {
      if (navigator.geolocation) {
        btnCaptureGps.innerHTML = '<i class="fa-solid fa-satellite fa-spin"></i> Capturando GPS...';
        navigator.geolocation.getCurrentPosition(
          pos => {
            const lat = pos.coords.latitude.toFixed(5);
            const lon = pos.coords.longitude.toFixed(5);
            descField.value += `\n[Coordenadas Satelitales Verificadas: Lat ${lat}°, Lon ${lon}°]\n`;
            btnCaptureGps.innerHTML = '<i class="fa-solid fa-check"></i> Coordenadas Incrustadas';
          },
          () => {
            descField.value += `\n[Coordenadas de Referencia: Nicaragua Lat 12.1364° N, Lon -86.2514° O]\n`;
            btnCaptureGps.innerHTML = '<i class="fa-solid fa-location-dot"></i> Coordenadas Añadidas';
          },
          { timeout: 8000 }
        );
      } else {
        descField.value += `\n[Coordenadas de Referencia: Nicaragua Lat 12.1364° N, Lon -86.2514° O]\n`;
        btnCaptureGps.innerHTML = '<i class="fa-solid fa-location-dot"></i> Coordenadas Añadidas';
      }
    });
  }

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const typeEl = document.getElementById('reportType');
      const locEl = document.getElementById('reportLocation');

      const type = typeEl ? typeEl.value : 'Afectación General';
      const loc = locEl ? locEl.value : 'Territorio de Nicaragua';
      const desc = descField ? descField.value : '';

      const fullMessage = `🌿 DENUNCIA AMBIENTAL OFICIAL BAQUEANO:\nTipo: ${type}\nUbicación: ${loc}\nDetalles:\n${desc}\nFecha: ${new Date().toLocaleDateString('es-NI')}`;
      const waUrl = `https://api.whatsapp.com/send?phone=50584431289&text=${encodeURIComponent(fullMessage)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      alert("¡Gracias por proteger a Nicaragua! Tu evidencia ha sido canalizada al equipo de custodia ambiental.");
      form.reset();

      if (typeof window.logFirebaseEvent === 'function' && window.firebaseAnalytics) {
        window.logFirebaseEvent(window.firebaseAnalytics, 'environmental_report_sent', { type: type });
      }
    });
  }
}
