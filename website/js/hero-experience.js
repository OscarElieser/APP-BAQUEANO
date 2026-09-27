// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — HERO CINEMATOGRÁFICO & CARRUSEL DE DESTINOS
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Transformar la portada de inicio en una experiencia editorial inmersiva
//   inspirada en los portales globales de expedición territorial (Condé Nast / NatGeo).
// - Destacar el video cinematográfico en alta definición de Nicaragua en el flanco
//   derecho y proporcionar una marquesina interactiva al pie con tarjetas de destinos
//   icónicos (Corn Island, Ometepe, Cañón de Somoto, San Juan del Sur y Granada),
//   permitiendo previsualizar y alternar el territorio con un solo toque.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - IntersectionObserver para detectar la presencia en el Hero y gestionar la baliza flotante.
// - Transición fluida de video al pulsar cualquiera de las tarjetas de destino.
// - Carrusel táctil con desplazamiento suave (.scrollBy) y controles circulares de avance/retroceso.
// - Controles integrados de reproducción y audio (Mute/Unmute y Play/Pause) en la esquina inferior.
// - Código defensivo estricto, sin fugas de memoria y compatible con políticas de autoplay móvil.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - window.BaqueanoHeroExperience: inicializa el carrusel, transiciones de video y controles HUD.
// ============================================================================

(function initBaqueanoHeroExperience(window, document) {
  'use strict';

  function setupHero() {
    const heroSection = document.getElementById('heroNicaragua');
    if (!heroSection) return;

    const bgVideo = heroSection.querySelector('.hero-nicaragua-bg-media');
    const cardsTrack = document.getElementById('heroCardsScroller');
    const prevBtn = document.getElementById('heroCarouselPrev');
    const nextBtn = document.getElementById('heroCarouselNext');
    const soundBtn = document.getElementById('heroVideoSoundToggle');
    const playBtn = document.getElementById('heroVideoPlayToggle');
    const cards = Array.from(heroSection.querySelectorAll('.hero-destination-card'));

    // --- 1. Control de Visibilidad del Botón Flotante de Tema en el Hero ---
    if ('IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          document.body.classList.toggle('hero-active', entry.isIntersecting && entry.intersectionRatio > 0.25);
        });
      }, { threshold: [0, 0.25, 0.5, 0.8] });
      heroObserver.observe(heroSection);
    } else {
      const handleScroll = () => {
        const isNearTop = window.scrollY < 300;
        document.body.classList.toggle('hero-active', isNearTop);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }

    // --- 2. Desplazamiento del Carrusel de Tarjetas ---
    if (cardsTrack && prevBtn && nextBtn) {
      const scrollStep = 180;

      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        cardsTrack.scrollBy({ left: -scrollStep, behavior: 'smooth' });
      });

      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        cardsTrack.scrollBy({ left: scrollStep, behavior: 'smooth' });
      });

      const updateArrows = () => {
        const atStart = cardsTrack.scrollLeft <= 6;
        const atEnd = cardsTrack.scrollLeft + cardsTrack.clientWidth >= cardsTrack.scrollWidth - 6;
        prevBtn.style.opacity = atStart ? '0.35' : '1';
        nextBtn.style.opacity = atEnd ? '0.35' : '1';
      };

      cardsTrack.addEventListener('scroll', updateArrows, { passive: true });
      updateArrows();
    }

    // --- 3. Selección de Destino e Intercambio de Video ---
    cards.forEach((card) => {
      card.addEventListener('click', (e) => {
        // Remover clase activa previa y marcar la seleccionada
        cards.forEach((c) => c.classList.remove('is-active'));
        card.classList.add('is-active');

        const targetVideo = card.getAttribute('data-dest-video');
        if (bgVideo && targetVideo && bgVideo.getAttribute('src') !== targetVideo) {
          bgVideo.style.opacity = '0.3';
          bgVideo.style.transition = 'opacity 0.35s ease';

          setTimeout(() => {
            bgVideo.src = targetVideo;
            bgVideo.load();
            bgVideo.play().catch(() => {});
            bgVideo.style.opacity = '1';
          }, 320);
        }

        // En caso de doble toque o clic directo sobre el texto, ir al destino
        if (e.detail > 1) {
          const destName = card.getAttribute('data-dest-title');
          if (destName) {
            window.location.href = `destinos.html?q=${encodeURIComponent(destName)}`;
          }
        }
      });
    });

    // --- 4. Controles de Audio y Reproducción del Video ---
    if (bgVideo && soundBtn) {
      soundBtn.addEventListener('click', () => {
        bgVideo.muted = !bgVideo.muted;
        const icon = soundBtn.querySelector('i');
        if (icon) {
          icon.className = bgVideo.muted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
        }
        soundBtn.setAttribute('aria-label', bgVideo.muted ? 'Activar sonido' : 'Silenciar sonido');
        soundBtn.classList.toggle('is-unmuted', !bgVideo.muted);
      });
    }

    if (bgVideo && playBtn) {
      playBtn.addEventListener('click', () => {
        if (bgVideo.paused) {
          bgVideo.play().catch(() => {});
        } else {
          bgVideo.pause();
        }
        const icon = playBtn.querySelector('i');
        if (icon) {
          icon.className = bgVideo.paused ? 'fa-solid fa-play' : 'fa-solid fa-pause';
        }
        playBtn.setAttribute('aria-label', bgVideo.paused ? 'Reproducir video' : 'Pausar video');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupHero);
  } else {
    setupHero();
  }

  window.BaqueanoHeroExperience = { init: setupHero };
})(window, document);
