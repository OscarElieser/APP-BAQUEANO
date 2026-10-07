// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CARRUSEL INFINITO INTERACTIVO DE CATEGORÍAS
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Transformar la franja estática de categorías de la portada en una franja viva
//   con movimiento continuo a 60fps, interactiva y táctil para exploradores
//   en móviles y escritorio, facilitando el descubrimiento territorial.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Animación CSS pura acelerada por GPU para 60fps sin consumo excesivo de CPU.
// - Interceptor de puntero táctil (Pointer Events API) con detección de arrastre
//   (drag/swipe) que pausa suavemente durante la interacción manual y reanuda
//   automáticamente tras soltar el elemento.
// - Detección de enlaces para evitar bloquear clics genuinos al tocar una categoría.
// - Compatible con accesibilidad (prefers-reduced-motion y navegación por teclado).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Auto-inicialización idempotente en DOMContentLoaded.
// - Clases reactivas: `.is-paused` y gestión de estado táctil.
// ============================================================================

(function initCategoryStripMarquee() {
  'use strict';

  function setup() {
    const card = document.querySelector('.category-strip-card');
    const track = document.querySelector('.category-strip-track');
    if (!card || !track) return;

    let isPointerDown = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let resumeTimeout = null;
    let hasMoved = false;

    // Pausar al recibir foco de teclado
    card.addEventListener('focusin', () => {
      card.classList.add('is-paused');
    });

    card.addEventListener('focusout', () => {
      card.classList.remove('is-paused');
    });

    // Soporte táctil y arrastre con puntero
    card.addEventListener('pointerdown', (e) => {
      // Ignorar clics secundarios
      if (e.button && e.button !== 0) return;
      isPointerDown = true;
      hasMoved = false;
      startX = e.clientX;
      card.classList.add('is-paused');
      if (resumeTimeout) clearTimeout(resumeTimeout);
    }, { passive: true });

    window.addEventListener('pointermove', (e) => {
      if (!isPointerDown) return;
      const diffX = e.clientX - startX;
      if (Math.abs(diffX) > 6) {
        hasMoved = true;
      }
    }, { passive: true });

    function onPointerEnd() {
      if (!isPointerDown) return;
      isPointerDown = false;
      // Reanudar suavemente tras soltar
      resumeTimeout = setTimeout(() => {
        card.classList.remove('is-paused');
      }, 1600);
    }

    window.addEventListener('pointerup', onPointerEnd, { passive: true });
    window.addEventListener('pointercancel', onPointerEnd, { passive: true });

    // Prevenir activación de enlace si el usuario arrastró deliberadamente
    card.addEventListener('click', (e) => {
      if (hasMoved) {
        e.preventDefault();
        e.stopPropagation();
        hasMoved = false;
      }
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
