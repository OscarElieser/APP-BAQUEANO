// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CONTROLADOR DE INTERACCIONES DEL INDEX DEFINITIVO (definitive-index-interactions.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Orquestar las interacciones de alta gama de la portada de Baqueano Nicaragua:
//   alternancia del selector de mapas [ MAPA | SATÉLITE | 3D ], contadores animados
//   en viewport para "Nicaragua en Cifras", despliegue colapsable del planificador avanzado,
//   progressive disclosure en las tarjetas de impacto, reproducción automática suave
//   de los clips de Reels en el smartphone del Hero, y micro-interacciones a 60fps.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - IntersectionObserver optimizado para disparar animaciones y contadores solo al entrar al viewport.
// - Conexión defensiva con Leaflet (window.BaqueanoIndexFeatures) y Three.js (window.BaqueanoRealMap).
// - Sincronización de redimensionamiento de ventana (invalidateSize / resize) al cambiar de pestaña.
// - Cero dependencias externas adicionales, 100% resiliente y defensivo ante valores nulos o no finitos.
//
// 📦 3. QUÉ (WHAT / MÓDULOS EXPUESTOS):
// - initUnifiedMapSwitcher(): Alterna entre [ MAPA | SATÉLITE | 3D ].
// - initAnimatedCounters(): Anima contadores estadísticos de "Nicaragua en Cifras".
// - initAdvancedPlannerToggle(): Despliega/oculta el formulario avanzado del planificador.
// - initImpactDisclosure(): Expande detalles de los 5 pilares de impacto.
// - initCategoryChipsToggle(): Muestra/oculta categorías secundarias de búsqueda.
// - initHeroReelsAutoAdvance(): Transición automática suave de clips verticales en el smartphone.
// - initNavbarScrollEffect(): Aplica la clase .scrolled al navbar según el desplazamiento.
// - initInfiniteGalleries(): Carruseles continuos con pausa voluntaria y controles accesibles.
// ============================================================================

(function () {
  'use strict';

  // 1. NAVBAR SCROLL EFFECT (Transparente sobre Hero -> Sólido/Glass al scroll)
  function initNavbarScrollEffect() {
    const navbar = document.getElementById('mainNavbar');
    if (!navbar) return;

    let ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 40;
          navbar.classList.toggle('scrolled', isScrolled);
          navbar.classList.toggle('has-scrolled', isScrolled);
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // 2. UNIFIED MAP SWITCHER [ MAPA TERRITORIAL | SATÉLITE HD | RELIEVE 3D ]
  function initUnifiedMapSwitcher() {
    const tabs = document.querySelectorAll('.map-mode-tab');
    const pane2D = document.getElementById('paneMap2D');
    const pane3D = document.getElementById('paneMap3D');
    if (!tabs.length || !pane2D || !pane3D) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const mode = tab.dataset.mapMode;
        if (!mode) return;

        // Actualizar pestañas activas
        tabs.forEach(t => {
          const isActive = t === tab;
          t.classList.toggle('active', isActive);
          t.setAttribute('aria-selected', String(isActive));
        });

        if (mode === '3d') {
          // Mostrar panel 3D
          pane2D.classList.remove('is-active');
          pane2D.hidden = true;
          pane3D.classList.add('is-active');
          pane3D.hidden = false;

          // Disparar evento de resize para que Three.js o Leaflet 3D ajuste su viewport
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
          }, 60);
        } else {
          // Mostrar panel 2D (Territorial o Satélite)
          pane3D.classList.remove('is-active');
          pane3D.hidden = true;
          pane2D.classList.add('is-active');
          pane2D.hidden = false;

          // Alternar capa en Leaflet si el controlador está disponible
          if (window.BaqueanoIndexFeatures && typeof window.BaqueanoIndexFeatures.switchIndexLayer === 'function') {
            const layerKey = mode === 'satellite' ? 'satellite' : 'streets';
            window.BaqueanoIndexFeatures.switchIndexLayer(layerKey);

            // Sincronizar botones de capa activos en la barra
            const layerBtns = pane2D.querySelectorAll('.index-layer-btn');
            layerBtns.forEach(btn => {
              btn.classList.toggle('active', btn.dataset.layer === layerKey);
            });
          }

          // InvalidateSize en Leaflet para recalcular dimensiones exactas
          setTimeout(() => {
            const mapContainer = document.getElementById('indexTerritoryMap');
            if (mapContainer && mapContainer._leaflet_map) {
              mapContainer._leaflet_map.invalidateSize();
            }
            window.dispatchEvent(new Event('resize'));
          }, 60);
        }
      });
    });
  }

  // 3. ADVANCED PLANNER ACCORDION TOGGLE (#routeBuilderSection)
  function initAdvancedPlannerToggle() {
    const toggleBtn = document.getElementById('btnToggleAdvancedPlanner');
    const plannerWrap = document.getElementById('routeBuilderSection');
    const icon = document.getElementById('advPlannerIcon');
    if (!toggleBtn || !plannerWrap) return;

    toggleBtn.addEventListener('click', () => {
      const isExpanded = plannerWrap.style.display !== 'none';
      if (isExpanded) {
        plannerWrap.style.display = 'none';
        plannerWrap.setAttribute('aria-hidden', 'true');
        toggleBtn.setAttribute('aria-expanded', 'false');
        if (icon) icon.className = 'fa-solid fa-chevron-down';
      } else {
        plannerWrap.style.display = 'block';
        plannerWrap.setAttribute('aria-hidden', 'false');
        toggleBtn.setAttribute('aria-expanded', 'true');
        if (icon) icon.className = 'fa-solid fa-chevron-up';

        // Desplazamiento suave al planificador
        setTimeout(() => {
          plannerWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      }
    });
  }

  // 4. ANIMATED STATS COUNTERS ("Nicaragua de un Vistazo")
  function initAnimatedCounters() {
    const counterCards = document.querySelectorAll('.stat-counter-card');
    if (!counterCards.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const card = entry.target;
        const numEl = card.querySelector('.stat-count-num');
        if (!numEl || card._hasAnimated) return;
        card._hasAnimated = true;

        const targetVal = Number(numEl.dataset.target || 0);
        const duration = 1200; // ms
        const startTime = performance.now();

        function updateCounter(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out expo
          const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          const currentVal = Math.round(easeProgress * targetVal);
          numEl.textContent = String(currentVal);

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            numEl.textContent = String(targetVal);
          }
        }

        requestAnimationFrame(updateCounter);
        obs.unobserve(card);
      });
    }, { threshold: 0.3 });

    counterCards.forEach(card => observer.observe(card));
  }

  // 5. PROGRESSIVE DISCLOSURE EN TARJETAS DE IMPACTO
  function initImpactDisclosure() {
    const impactCards = document.querySelectorAll('.impact-interactive-card');
    if (!impactCards.length) return;

    impactCards.forEach(card => {
      const toggleBtn = card.querySelector('.btn-impact-toggle');
      const drawer = card.querySelector('.impact-card-drawer');
      if (!toggleBtn || !drawer) return;

      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = !drawer.hidden;
        drawer.hidden = isOpen;
        toggleBtn.setAttribute('aria-expanded', String(!isOpen));
        const icon = toggleBtn.querySelector('i');
        const textSpan = toggleBtn.querySelector('span');
        if (icon) icon.className = isOpen ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up';
        if (textSpan) textSpan.textContent = isOpen ? 'Conocer detalles' : 'Ocultar detalles';
        card.classList.toggle('is-open', !isOpen);
      });
    });
  }

  // 6. TOGGLE CATEGORÍAS SECUNDARIAS DE BÚSQUEDA
  function initCategoryChipsToggle() {
    const toggleBtn = document.getElementById('btnToggleAllCategories');
    const extraChips = document.getElementById('homeSearchChipsExtra');
    if (!toggleBtn || !extraChips) return;

    toggleBtn.addEventListener('click', () => {
      const isHidden = extraChips.hidden;
      extraChips.hidden = !isHidden;
      toggleBtn.setAttribute('aria-expanded', String(isHidden));
      const textSpan = toggleBtn.querySelector('span');
      const icon = toggleBtn.querySelector('i');
      if (textSpan) textSpan.textContent = isHidden ? 'Ver menos' : 'Ver todas';
      if (icon) icon.className = isHidden ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down';
    });
  }

  // 7. AUTOPLAY / SMOOTH TRANSITION EN EL TELÉFONO DEL HERO (#baqueanoReels)
  function initHeroReelsAutoAdvance() {
    const feed = document.getElementById('baqueanoReelsFeed');
    const reelsRoot = document.getElementById('baqueanoReels');
    if (!feed || !reelsRoot) return;

    let autoTimer = null;
    let isUserInteracting = false;
    let isPhoneInViewport = false;

    function advanceToNextReel() {
      // Bloquear si el usuario interactúa o si la pantalla del hero no está en el viewport
      if (isUserInteracting || !isPhoneInViewport) return;
      const cards = feed.querySelectorAll('.baqueano-reel');
      if (!cards.length) return;

      const activeCard = feed.querySelector('.baqueano-reel.is-active') || cards[0];
      const currentIndex = Number(activeCard.dataset.index || 0);
      const nextIndex = (currentIndex + 1) % cards.length;
      const nextCard = cards[nextIndex];

      if (nextCard) {
        // NUNCA usar scrollIntoView aquí porque fuerza el scroll de la ventana principal al Hero
        // Usar scroll interno del contenedor feed de forma segura:
        feed.scrollTo({
          top: nextCard.offsetTop,
          behavior: 'smooth'
        });
      }
    }

    function startTimer() {
      stopTimer();
      if (isPhoneInViewport && !isUserInteracting) {
        autoTimer = setInterval(advanceToNextReel, 6000);
      }
    }

    function stopTimer() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    // Observar visibilidad en viewport: solo reproduce/avanza si el usuario está viendo el Hero
    if ('IntersectionObserver' in window) {
      const visibilityObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isPhoneInViewport = entry.isIntersecting;
          if (isPhoneInViewport) {
            startTimer();
          } else {
            stopTimer();
          }
        });
      }, { threshold: 0.2 });

      visibilityObs.observe(reelsRoot);
    } else {
      isPhoneInViewport = true;
      startTimer();
    }

    reelsRoot.addEventListener('mouseenter', () => { isUserInteracting = true; stopTimer(); });
    reelsRoot.addEventListener('mouseleave', () => { isUserInteracting = false; startTimer(); });
    reelsRoot.addEventListener('touchstart', () => { isUserInteracting = true; stopTimer(); }, { passive: true });
    reelsRoot.addEventListener('touchend', () => { isUserInteracting = false; startTimer(); }, { passive: true });
  }

  // 8. INTERACCIONES DE NICARAGUA VIVA (Música, Sabores, Relato con Robot Baqueano)
  function initNicaraguaVivaInteractions() {
    // 1. Reproducir Son Nica y hacer bailar al robot
    const btnPlaySon = document.getElementById('btnPlaySonNica');
    if (btnPlaySon) {
      btnPlaySon.addEventListener('click', () => {
        if (window.BaqueanoAssistant && typeof window.BaqueanoAssistant.setState === 'function') {
          window.BaqueanoAssistant.setState('dancing');
        }
        // Reproducir audio si el reproductor está disponible
        if (window.PersistentAudioPlayer && typeof window.PersistentAudioPlayer.play === 'function') {
          window.PersistentAudioPlayer.play();
        }
      });
    }

    // 2. Historia del platillo con Baqueano
    const btnFood = document.getElementById('btnAskFoodStory');
    if (btnFood) {
      btnFood.addEventListener('click', () => {
        if (window.BaqueanoAssistant && typeof window.BaqueanoAssistant.sendMessage === 'function') {
          window.BaqueanoAssistant.open();
          window.BaqueanoAssistant.sendMessage('¿Cuál es la historia y tradición del nacatamal y el maíz ancestral en Nicaragua?');
        } else {
          location.href = 'gastronomia.html';
        }
      });
    }

    // 3. Relato histórico narrado
    const btnHistory = document.getElementById('btnNarrateHistory');
    if (btnHistory) {
      btnHistory.addEventListener('click', () => {
        if (window.BaqueanoAssistant && typeof window.BaqueanoAssistant.sendMessage === 'function') {
          window.BaqueanoAssistant.open();
          window.BaqueanoAssistant.sendMessage('Contame una leyenda o hito histórico sobre la soberanía de Nicaragua y Rubén Darío.');
        } else {
          location.href = 'historia.html';
        }
      });
    }
  }

  // 9. FILTRADO RÁPIDO DE LOCALES ALIADOS EN LA SECCIÓN 09
  function initAlliesFilter() {
    const chips = document.querySelectorAll('.ally-filter-chip');
    const trackA = document.getElementById('partnersTrackA');
    const trackB = document.getElementById('partnersTrackB');
    if (!chips.length || !trackA) return;

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.toggle('active', c === chip));
        const filter = chip.dataset.filter;
        const allPartnerChips = document.querySelectorAll('.partner-chip');

        allPartnerChips.forEach(pChip => {
          if (filter === 'all') {
            pChip.style.display = 'inline-flex';
          } else {
            const locText = (pChip.querySelector('.partner-chip-location')?.textContent || '').toLowerCase();
            const nameText = (pChip.querySelector('.partner-chip-name')?.textContent || '').toLowerCase();
            const matches = locText.includes(filter) || nameText.includes(filter);
            pChip.style.display = matches ? 'inline-flex' : 'none';
          }
        });
      });
    });
  }

  // 10. INTERACTIVIDAD Y NAVEGACIÓN EN TARJETAS DE EXPERIENCIAS Y DESTINOS EMBLEMÁTICOS
  // 🎯 POR QUÉ: Convertir toda el área de las tarjetas en interactiva para exploradores en móvil y desktop.
  // ⚙️ CÓMO: Detecta clics sobre .living-card y .destination-card-pro y navega al destino indicado en data-href.
  // 📦 QUÉ: initLivingCardsInteractivity()
  function initLivingCardsInteractivity() {
    const cards = document.querySelectorAll('.living-card, .destination-card-pro');
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        const href = card.getAttribute('data-href') || card.querySelector('.living-card-link, .dest-card-cta')?.getAttribute('href');
        if (href) {
          window.location.href = href;
        }
      });
    });
  }

  // 11. GALERÍAS ROTATIVAS CONTINUAS
  // 🎯 POR QUÉ: exhibir todas las experiencias sin una cuadrícula extensa o estática.
  // ⚙️ CÓMO: desplazamiento por requestAnimationFrame, duplicado visual y reinicio imperceptible.
  // 📦 QUÉ: reproducción, pausa, navegación, gestos y respeto a movimiento reducido.
  function initInfiniteGalleries() {
    const galleryConfigs = [
      { track: document.getElementById('livingCarouselTrack'), label: 'Experiencias de Nicaragua' },
      { track: document.querySelector('#destinosDestacadosSection .destinations-pro-grid'), label: 'Destinos destacados' }
    ];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    galleryConfigs.forEach((config, galleryIndex) => {
      const track = config.track;
      if (!track || track.dataset.infiniteReady === 'true') return;
      const originals = [...track.children];
      if (originals.length < 2) return;

      track.dataset.infiniteReady = 'true';
      track.classList.add('is-infinite-track');

      const currentParent = track.parentElement;
      const shell = document.createElement('div');
      const viewport = document.createElement('div');
      const controls = document.createElement('div');
      const status = document.createElement('span');
      shell.className = 'infinite-gallery-shell';
      viewport.className = 'infinite-gallery-viewport';
      viewport.setAttribute('role', 'region');
      viewport.setAttribute('aria-label', config.label);
      viewport.tabIndex = 0;
      controls.className = 'infinite-gallery-controls';
      controls.innerHTML = `
        <button type="button" data-gallery-action="prev" aria-label="Anterior"><i class="fa-solid fa-chevron-left"></i></button>
        <button type="button" data-gallery-action="toggle" aria-label="Pausar galería" aria-pressed="false"><i class="fa-solid fa-pause"></i><span>Pausar</span></button>
        <button type="button" data-gallery-action="next" aria-label="Siguiente"><i class="fa-solid fa-chevron-right"></i></button>`;
      status.className = 'sr-only';
      status.setAttribute('aria-live', 'polite');

      currentParent.insertBefore(shell, track);
      shell.append(controls, viewport, status);
      viewport.appendChild(track);
      if (currentParent.classList.contains('living-carousel-wrap')) {
        shell.classList.add('infinite-gallery-shell--living');
        currentParent.classList.add('is-gallery-host');
      }

      originals.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.dataset.galleryClone = 'true';
        clone.setAttribute('aria-hidden', 'true');
        clone.tabIndex = -1;
        clone.querySelectorAll('a, button, [tabindex]').forEach((node) => { node.tabIndex = -1; });
        track.appendChild(clone);
      });

      let manualPause = reduceMotion;
      let interactionPause = false;
      let lastTime = 0;
      let frameId = 0;
      const toggleButton = controls.querySelector('[data-gallery-action="toggle"]');

      const updateToggle = () => {
        const paused = manualPause || reduceMotion;
        toggleButton.setAttribute('aria-pressed', String(paused));
        toggleButton.setAttribute('aria-label', paused ? 'Reanudar galería' : 'Pausar galería');
        toggleButton.innerHTML = paused
          ? '<i class="fa-solid fa-play"></i><span>Reanudar</span>'
          : '<i class="fa-solid fa-pause"></i><span>Pausar</span>';
        shell.classList.toggle('is-paused', paused || interactionPause);
      };

      const normalizeScroll = () => {
        const midpoint = track.scrollWidth / 2;
        if (midpoint > 0 && viewport.scrollLeft >= midpoint) viewport.scrollLeft -= midpoint;
        if (viewport.scrollLeft < 0) viewport.scrollLeft += midpoint;
      };

      const step = (time) => {
        const elapsed = Math.min(40, time - (lastTime || time));
        lastTime = time;
        if (!manualPause && !interactionPause && !document.hidden && !reduceMotion) {
          viewport.scrollLeft += elapsed * 0.035;
          normalizeScroll();
        }
        frameId = window.requestAnimationFrame(step);
      };

      const moveByCard = (direction) => {
        const first = originals[0];
        const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
        const distance = first.getBoundingClientRect().width + gap;
        if (direction < 0 && viewport.scrollLeft < distance) viewport.scrollLeft += track.scrollWidth / 2;
        viewport.scrollBy({ left: direction * distance, behavior: 'smooth' });
        window.setTimeout(normalizeScroll, 500);
      };

      controls.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        const action = button?.dataset.galleryAction;
        if (action === 'toggle') {
          manualPause = !manualPause;
          status.textContent = manualPause ? 'Galería pausada' : 'Galería reanudada';
          updateToggle();
        } else if (action === 'prev' || action === 'next') {
          interactionPause = true;
          moveByCard(action === 'next' ? 1 : -1);
          window.setTimeout(() => { interactionPause = false; updateToggle(); }, 2200);
        }
      });

      shell.addEventListener('mouseenter', () => { interactionPause = true; updateToggle(); });
      shell.addEventListener('mouseleave', () => { interactionPause = false; updateToggle(); });
      shell.addEventListener('focusin', () => { interactionPause = true; updateToggle(); });
      shell.addEventListener('focusout', (event) => {
        if (!shell.contains(event.relatedTarget)) { interactionPause = false; updateToggle(); }
      });
      viewport.addEventListener('pointerdown', () => { interactionPause = true; updateToggle(); }, { passive: true });
      viewport.addEventListener('pointerup', () => {
        window.setTimeout(() => { interactionPause = false; updateToggle(); }, 3200);
      }, { passive: true });
      viewport.addEventListener('scroll', normalizeScroll, { passive: true });
      viewport.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        interactionPause = true;
        moveByCard(event.key === 'ArrowRight' ? 1 : -1);
      });

      updateToggle();
      frameId = window.requestAnimationFrame(step);
      window.addEventListener('pagehide', () => window.cancelAnimationFrame(frameId), { once: true });
      shell.dataset.galleryIndex = String(galleryIndex);
    });
  }

  // ARRANQUE DEFENSIVO
  function init() {
    initNavbarScrollEffect();
    initUnifiedMapSwitcher();
    initAdvancedPlannerToggle();
    initAnimatedCounters();
    initImpactDisclosure();
    initCategoryChipsToggle();
    initHeroReelsAutoAdvance();
    initHeroBackgroundVideo();
    initNicaraguaVivaInteractions();
    initAlliesFilter();
    initInfiniteGalleries();
    initLivingCardsInteractivity();
  }

  // Reproducción defensiva del video de fondo del Hero
  function initHeroBackgroundVideo() {
    const video = document.querySelector('.hero-nicaragua-bg-media');
    if (video && typeof video.play === 'function') {
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Si el navegador bloquea autoplay, se reproducirá al primer gesto
          window.addEventListener('click', () => { video.play().catch(() => {}); }, { once: true });
        });
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
