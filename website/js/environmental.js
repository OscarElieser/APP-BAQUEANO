// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CAMPAÑA AMBIENTAL & DECÁLOGO VERDE (environmental.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Transformar el Decálogo Verde de un texto estático a una experiencia
//   gamificada e interactiva ("Pacto del Guardián Baqueano").
// - Permitir a los exploradores firmar individualmente los 10 mandamientos de
//   turismo de huella cero y desbloquear su Certificado Digital de Guardián.
// - Facilitar denuncias ciudadanas georreferenciadas con GPS en tiempo real.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Seguimiento de estado reactivo mediante `committedRules` (Set / LocalStorage).
// - Animaciones fluidas de microinteracción, partículas luminosas y barra de progreso.
// - Filtros por categoría (Sendero, Aguas, Comunidad) con transiciones CSS.
// - Modal de celebración automática al alcanzar 10/10 compromisos.
// - Integración con Geolocation API para capturar coordenadas satelitales en denuncias.
//
// 📦 3. QUÉ (WHAT / FUNCIONES EXPUESTAS):
// - initEnvironmentalModule(): Inicializa el Decálogo interactivo y el formulario SOS.
// ============================================================================

function initEnvironmentalModule() {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. ESTADO DEL DECÁLOGO VERDE INTERACTIVO
  // --------------------------------------------------------------------------
  const savedCommitted = JSON.parse(localStorage.getItem('baqueano_green_pledge') || '[]');
  const committedSet = new Set(savedCommitted);

  const cards = document.querySelectorAll('.decalogo-interactive-card');
  const countText = document.getElementById('decalogoCountText');
  const percentText = document.getElementById('decalogoPercentText');
  const progressBar = document.getElementById('decalogoProgressBar');
  const btnSignAll = document.getElementById('btnSignAllDecalogo');
  const guardianModal = document.getElementById('guardianModal');
  const closeGuardianBtn = document.getElementById('closeGuardianModalBtn');
  const btnDownloadCert = document.getElementById('btnDownloadCert');

  function updateDecalogoUI(triggerCelebration = false) {
    const total = cards.length || 10;
    const count = committedSet.size;
    const percent = Math.round((count / total) * 100);

    // Actualizar textos y barra de progreso
    if (countText) countText.textContent = `${count} de ${total}`;
    if (percentText) percentText.textContent = `${percent}%`;
    if (progressBar) {
      progressBar.style.width = `${percent}%`;
      if (percent === 100) {
        progressBar.style.background = 'linear-gradient(90deg, #10B981, #F65E01)';
      } else {
        progressBar.style.background = 'linear-gradient(90deg, #10B981, #34D399)';
      }
    }

    // Actualizar estado visual de cada tarjeta
    cards.forEach(card => {
      const ruleId = card.dataset.rule;
      const isCommitted = committedSet.has(ruleId);
      const toggleBtn = card.querySelector('.decalogo-check-toggle');

      if (isCommitted) {
        card.classList.add('committed');
        if (toggleBtn) {
          toggleBtn.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #10B981;"></i>';
          toggleBtn.classList.add('checked');
        }
      } else {
        card.classList.remove('committed');
        if (toggleBtn) {
          toggleBtn.innerHTML = '<i class="fa-regular fa-circle"></i>';
          toggleBtn.classList.remove('checked');
        }
      }
    });

    // Guardar en almacenamiento local
    localStorage.setItem('baqueano_green_pledge', JSON.stringify(Array.from(committedSet)));

    // Si completó el 100%, abrir el modal de certificación
    if (count === total && triggerCelebration && guardianModal) {
      setTimeout(() => {
        guardianModal.classList.add('active');
        guardianModal.setAttribute('aria-hidden', 'false');
      }, 400);
    }
  }

  // Toggle individual por tarjeta
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      const ruleId = card.dataset.rule;
      if (committedSet.has(ruleId)) {
        committedSet.delete(ruleId);
        updateDecalogoUI(false);
      } else {
        committedSet.add(ruleId);
        // Micro vibración háptica en móviles si está disponible
        if (navigator.vibrate) navigator.vibrate(30);
        updateDecalogoUI(true);
      }
    });

    // Efecto 3D interactivo con el cursor del ratón
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // Botón "Firmar Todos"
  if (btnSignAll) {
    btnSignAll.addEventListener('click', () => {
      if (committedSet.size === cards.length) {
        committedSet.clear();
        btnSignAll.innerHTML = '<i class="fa-solid fa-check-double"></i> Firmar Todos';
      } else {
        cards.forEach(card => committedSet.add(card.dataset.rule));
        btnSignAll.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Reiniciar Pacto';
      }
      updateDecalogoUI(true);
    });
  }

  // Filtros por Categoría
  const filterBtns = document.querySelectorAll('.decalogo-pill-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      cards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeInCard 0.35s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Controladores del Modal de Guardián
  if (closeGuardianBtn && guardianModal) {
    closeGuardianBtn.addEventListener('click', () => {
      guardianModal.classList.remove('active');
      guardianModal.setAttribute('aria-hidden', 'true');
    });
  }

  if (btnDownloadCert && guardianModal) {
    btnDownloadCert.addEventListener('click', () => {
      guardianModal.classList.remove('active');
      guardianModal.setAttribute('aria-hidden', 'true');
    });
  }

  // Inicializar estado guardado
  updateDecalogoUI(false);

  // --------------------------------------------------------------------------
  // 2. FORMULARIO DE DENUNCIA AMBIENTAL CON GPS
  // --------------------------------------------------------------------------
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
    });
  }
}

// Auto-inicialización al cargar la página
document.addEventListener('DOMContentLoaded', initEnvironmentalModule);
