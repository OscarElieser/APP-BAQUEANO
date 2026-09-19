/**
 * ============================================================================
 * 🧭 BAQUEANO ECOSYSTEM — LEGAL SCROLLSPY & DYNAMIC TOC CURSOR
 * ============================================================================
 * 
 * 🎯 1. POR QUÉ (WHY / PROPÓSITO):
 * - Permitir a los usuarios y exploradores navegar con total fluidez documentos
 *   legales y regulatorios extensos (Términos, Privacidad, Aviso Legal).
 * - Proveer un indicador visual tipo "cursor" vertical que se desplace de arriba
 *   hacia abajo sincronizado con la lectura, reduciendo la fatiga visual.
 * - Brindar retroalimentación inmediata del progreso lector (0% - 100%) y controles
 *   táctiles rápidos para saltar entre artículos contiguos.
 * 
 * ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
 * - IntersectionObserver con umbral adaptado para detectar el artículo visible.
 * - Cálculo de posición relativa (offsetTop / clientHeight) para posicionar el
 *   .toc-cursor-pip sobre el riel .toc-cursor-rail con suavizado a 60fps.
 * - Sincronización del scroll interno del menú lateral para mantener siempre
 *   a la vista el artículo activo sin desbordar el viewport del usuario.
 * - Eventos de click en botones "▲ Arriba" y "▼ Abajo" para salto secuencial.
 * 
 * 📦 3. QUÉ (WHAT / COMPONENTES EXPUESTOS):
 * - initLegalScrollspy(): función de inicialización automática al DOMContentLoaded.
 * ============================================================================
 */

(function initLegalScrollspy() {
  document.addEventListener('DOMContentLoaded', () => {
    const cards = Array.from(document.querySelectorAll('.legal-card'));
    const navLinks = Array.from(document.querySelectorAll('.sidebar-nav-link'));
    const cursorPip = document.querySelector('.toc-cursor-pip');
    const progressFill = document.querySelector('.toc-progress-fill');
    const counterBadge = document.querySelector('.toc-active-counter');
    const sidebarNav = document.querySelector('.sidebar-nav');
    const btnPrev = document.getElementById('tocBtnPrev');
    const btnNext = document.getElementById('tocBtnNext');

    if (!cards.length || !navLinks.length) {
      return;
    }

    let currentIndex = 0;
    const totalCards = cards.length;

    // Función para actualizar posición del cursor pip y el enlace activo
    function updateActiveState(index) {
      if (index < 0 || index >= totalCards) return;
      currentIndex = index;

      navLinks.forEach((link, i) => {
        if (i === index) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'true');

          // Mover el pip indicador
          if (cursorPip && sidebarNav) {
            const linkTop = link.offsetTop;
            const linkHeight = link.offsetHeight;
            const pipTop = linkTop + (linkHeight / 2) - 14; // Centrado vertical
            cursorPip.style.top = `${Math.max(0, pipTop)}px`;

            // Auto-scroll del contenedor de navegación si el item queda fuera
            const navScrollTop = sidebarNav.scrollTop;
            const navHeight = sidebarNav.clientHeight;
            if (linkTop < navScrollTop || (linkTop + linkHeight) > (navScrollTop + navHeight)) {
              sidebarNav.scrollTo({
                top: Math.max(0, linkTop - (navHeight / 2) + (linkHeight / 2)),
                behavior: 'smooth'
              });
            }
          }
        } else {
          link.classList.remove('active');
          link.removeAttribute('aria-current');
        }
      });

      // Actualizar tarjeta activa en lectura
      cards.forEach((card, i) => {
        if (i === index) {
          card.classList.add('active-reading');
        } else {
          card.classList.remove('active-reading');
        }
      });

      // Actualizar contador numérico
      if (counterBadge) {
        const numStr = String(index + 1).padStart(2, '0');
        const totStr = String(totalCards).padStart(2, '0');
        counterBadge.textContent = `${numStr} / ${totStr}`;
      }
    }

    // Cálculo del progreso global de scroll en la página
    function updateReadingProgress() {
      const scrollY = window.scrollY || window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0 && progressFill) {
        const percent = Math.min(100, Math.max(0, Math.round((scrollY / docHeight) * 100)));
        progressFill.style.width = `${percent}%`;
      }
    }

    // Observador de intersección para detectar artículo visible en pantalla
    const observerOptions = {
      root: null,
      rootMargin: '-15% 0px -65% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          const matchedIdx = cards.findIndex(c => c.getAttribute('id') === id);
          if (matchedIdx !== -1) {
            updateActiveState(matchedIdx);
          }
        }
      });
    }, observerOptions);

    cards.forEach(card => observer.observe(card));

    // Scroll listener optimizado con requestAnimationFrame para la barra de progreso
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateReadingProgress();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Clicks en enlaces del índice
    navLinks.forEach((link, idx) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href')?.replace('#', '');
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          updateActiveState(idx);
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.pushState(null, '', `#${targetId}`);
        }
      });
    });

    // Controles de salto "▲ Arriba" y "▼ Abajo"
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (currentIndex > 0) {
          const prevCard = cards[currentIndex - 1];
          if (prevCard) {
            prevCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (currentIndex < totalCards - 1) {
          const nextCard = cards[currentIndex + 1];
          if (nextCard) {
            nextCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } else {
          const lastCard = cards[totalCards - 1];
          if (lastCard) {
            lastCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    }

    // Inicializar estado inicial
    updateActiveState(0);
    updateReadingProgress();
  });
})();
