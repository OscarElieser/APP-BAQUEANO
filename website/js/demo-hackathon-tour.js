// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MODO DEMO JURADO HACKATHON (PITCH NACIONAL 3 MIN)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia de pitch estructurada y tangible para jurados de
//   competencia nacional de tecnología, permitiendo auditar la propuesta de valor
//   completa en 3 minutos.
// - Conectar de extremo a extremo:
//   "Quiero ir 3 días a León con $300" → IA → Ruta → Mapa 3D → Cooperativa Local
//   → Reserva 0% Comisión → GPS GNSS Offline → Android APK v2.4.0.
// - Elimina la necesidad de "explicar" el ecosistema: lo demuestra en vivo.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Máquina de estados en JavaScript (currentStep 1 a 5).
// - Sincronización DOM reactiva con aria-modal y accesibilidad de teclado (Escape).
// - Enlace fluido a elementos del DOM de la página para que el jurado pueda
//   saltar directamente a la sección en vivo correspondiente.
// - Sin dependencias externas pesadas, rendimiento a 60fps.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - window.openDemoHackathonModal(e)
// - window.closeDemoHackathonModal()
// - window.setDemoStep(stepNumber)
// - window.nextDemoStep()
// - window.prevDemoStep()
// ============================================================================

(function () {
  'use strict';

  let currentStep = 1;
  const totalSteps = 5;

  function getModal() {
    return document.getElementById('demoModal');
  }

  window.openDemoHackathonModal = function (e) {
    if (e && e.preventDefault) e.preventDefault();
    const modal = getModal();
    if (!modal) return;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Iniciar en el paso 1 si es primera apertura
    setDemoStep(currentStep || 1);
  };

  window.closeDemoHackathonModal = function () {
    const modal = getModal();
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  window.setDemoStep = function (step) {
    if (step < 1) step = 1;
    if (step > totalSteps) step = totalSteps;
    currentStep = step;

    // Actualizar botones de la barra de pasos
    for (let i = 1; i <= totalSteps; i++) {
      const stepBtn = document.getElementById('demoStepBtn' + i);
      const stepPanel = document.getElementById('demoStepPanel' + i);

      if (stepBtn) {
        stepBtn.classList.toggle('is-active', i === currentStep);
        stepBtn.classList.toggle('is-completed', i < currentStep);
      }
      if (stepPanel) {
        stepPanel.classList.toggle('is-active', i === currentStep);
      }
    }

    // Actualizar botones del footer
    const prevBtn = document.getElementById('demoBtnPrev');
    const nextBtn = document.getElementById('demoBtnNext');
    const stepIndicator = document.getElementById('demoStepIndicatorText');

    if (prevBtn) {
      prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-flex';
    }
    if (nextBtn) {
      if (currentStep === totalSteps) {
        nextBtn.innerHTML = '<i class="fa-solid fa-check-double"></i> <span>Finalizar Demo</span>';
      } else {
        nextBtn.innerHTML = '<span>Siguiente Paso</span> <i class="fa-solid fa-arrow-right"></i>';
      }
    }
    if (stepIndicator) {
      stepIndicator.textContent = 'Paso ' + currentStep + ' de ' + totalSteps;
    }
  };

  window.nextDemoStep = function () {
    if (currentStep < totalSteps) {
      setDemoStep(currentStep + 1);
    } else {
      closeDemoHackathonModal();
    }
  };

  window.prevDemoStep = function () {
    if (currentStep > 1) {
      setDemoStep(currentStep - 1);
    }
  };

  // Atajos de teclado y clics fuera del modal
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const modal = getModal();
      if (modal && modal.classList.contains('active')) {
        closeDemoHackathonModal();
      }
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    const modal = getModal();
    if (!modal) return;

    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        closeDemoHackathonModal();
      }
    });

    const closeBtn = document.getElementById('closeDemoModalBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeDemoHackathonModal);
    }
  });
})();
