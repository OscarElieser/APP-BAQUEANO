// ============================================================================
// 🧭 BAQUEANO — HERO CINEMATOGRÁFICO Y GALERÍA TERRITORIAL INFINITA
// ============================================================================
//
// 🎯 POR QUÉ (WHY / PROPÓSITO):
// - Presentar una portada viva, amplia y reconocible como la cara principal de
//   Baqueano sin competir con múltiples videos simultáneos.
// - Mantener un único paisaje audiovisual estable mientras las fotografías de
//   destinos recorren la pantalla de forma continua y claramente perceptible.
//
// ⚙️ CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Un solo video de fondo conserva autoplay, loop, audio y pausa manual.
// - La galería duplica únicamente sus nodos visuales con aria-hidden y utiliza
//   requestAnimationFrame para un desplazamiento infinito sin saltos ni timers.
// - El ciclo reinicia por distancia geométrica real y conserva los controles
//   manuales. La pestaña oculta detiene el frame para reducir consumo.
// - IntersectionObserver gobierna el estado visual del hero y el botón de tema.
//
// 📦 QUÉ (WHAT / ENTREGABLES):
// - window.BaqueanoHeroExperience inicializa video, cinta infinita, navegación,
//   acceso a destinos y controles audiovisuales del hero.
// ============================================================================

(function initBaqueanoHeroExperience(window, document) {
  'use strict';

  function setupHero() {
    const heroSection = document.getElementById('heroNicaragua');
    if (!heroSection || heroSection.dataset.heroExperienceReady === 'true') return;
    heroSection.dataset.heroExperienceReady = 'true';

    const bgVideo = heroSection.querySelector('.hero-nicaragua-bg-media');
    const cardsTrack = document.getElementById('heroCardsScroller');
    const prevBtn = document.getElementById('heroCarouselPrev');
    const nextBtn = document.getElementById('heroCarouselNext');
    const soundBtn = document.getElementById('heroVideoSoundToggle');
    const playBtn = document.getElementById('heroVideoPlayToggle');
    const originalCards = cardsTrack
      ? Array.from(cardsTrack.querySelectorAll('.hero-destination-card'))
      : [];

    const heroTitle = heroSection.querySelector('.hero-editorial-title');
    if (heroTitle) {
      heroTitle.setAttribute('data-no-kinetic', 'true');
      heroTitle.setAttribute('data-kinetic-ready', 'true');
      heroTitle.innerHTML = 'NICARAGUA<br>NO SE VISITA,<br><span class="hero-editorial-title-accent" style="color: #F65E01 !important; -webkit-text-fill-color: #F65E01 !important; display: inline-block;">SE DESCUBRE</span>';
    }

    if (bgVideo) {
      bgVideo.src = 'assets/videos/video%20nicaragua.mp4';
      bgVideo.loop = true;
      bgVideo.muted = true;
      bgVideo.playsInline = true;
      bgVideo.play().catch(() => {});
    }

    if ('IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          document.body.classList.toggle(
            'hero-active',
            entry.isIntersecting && entry.intersectionRatio > 0.25,
          );
        });
      }, { threshold: [0, 0.25, 0.5, 0.8] });
      heroObserver.observe(heroSection);
    }

    if (cardsTrack && originalCards.length > 1) {
      originalCards.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.dataset.carouselClone = 'true';
        clone.setAttribute('aria-hidden', 'true');
        clone.querySelectorAll('a, button, [tabindex]').forEach((item) => {
          item.setAttribute('tabindex', '-1');
        });
        cardsTrack.appendChild(clone);
      });

      let animationFrame = 0;
      let previousTimestamp = 0;
      let loopDistance = 0;
      const pixelsPerMillisecond = 0.055;

      const measureLoop = () => {
        const firstClone = cardsTrack.querySelector('[data-carousel-clone="true"]');
        loopDistance = firstClone
          ? firstClone.offsetLeft - originalCards[0].offsetLeft
          : cardsTrack.scrollWidth / 2;
      };

      const animateGallery = (timestamp) => {
        if (!document.hidden) {
          if (previousTimestamp > 0) {
            const elapsed = Math.min(timestamp - previousTimestamp, 48);
            cardsTrack.scrollLeft += elapsed * pixelsPerMillisecond;
            if (loopDistance > 0 && cardsTrack.scrollLeft >= loopDistance) {
              cardsTrack.scrollLeft -= loopDistance;
            }
          }
          previousTimestamp = timestamp;
        } else {
          previousTimestamp = 0;
        }
        animationFrame = window.requestAnimationFrame(animateGallery);
      };

      measureLoop();
      window.addEventListener('resize', measureLoop, { passive: true });
      animationFrame = window.requestAnimationFrame(animateGallery);

      const manualScroll = (direction) => {
        cardsTrack.scrollLeft += direction * Math.max(220, cardsTrack.clientWidth * 0.42);
        if (loopDistance > 0 && cardsTrack.scrollLeft >= loopDistance) {
          cardsTrack.scrollLeft -= loopDistance;
        } else if (cardsTrack.scrollLeft < 0 && loopDistance > 0) {
          cardsTrack.scrollLeft += loopDistance;
        }
      };

      prevBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        manualScroll(-1);
      });
      nextBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        manualScroll(1);
      });

      cardsTrack.addEventListener('dblclick', (event) => {
        const card = event.target.closest('.hero-destination-card');
        const destination = card?.getAttribute('data-dest-title');
        if (destination) {
          window.location.href = `destinos.html?q=${encodeURIComponent(destination)}`;
        }
      });

      window.addEventListener('pagehide', () => {
        window.cancelAnimationFrame(animationFrame);
      }, { once: true });
    }

    soundBtn?.addEventListener('click', () => {
      if (!bgVideo) return;
      bgVideo.muted = !bgVideo.muted;
      const icon = soundBtn.querySelector('i');
      if (icon) {
        icon.className = bgVideo.muted
          ? 'fa-solid fa-volume-xmark'
          : 'fa-solid fa-volume-high';
      }
      soundBtn.setAttribute('aria-label', bgVideo.muted ? 'Activar sonido' : 'Silenciar sonido');
      soundBtn.classList.toggle('is-unmuted', !bgVideo.muted);
    });

    playBtn?.addEventListener('click', () => {
      if (!bgVideo) return;
      if (bgVideo.paused) bgVideo.play().catch(() => {});
      else bgVideo.pause();
      const icon = playBtn.querySelector('i');
      if (icon) icon.className = bgVideo.paused ? 'fa-solid fa-play' : 'fa-solid fa-pause';
      playBtn.setAttribute('aria-label', bgVideo.paused ? 'Reproducir video' : 'Pausar video');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupHero, { once: true });
  } else {
    setupHero();
  }

  window.BaqueanoHeroExperience = { init: setupHero };
})(window, document);
