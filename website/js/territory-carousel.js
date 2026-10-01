/*
 * ============================================================================
 * BAQUEANO — EXPLORADOR CIRCULAR DE LOS 17 TERRITORIOS
 * ============================================================================
 * POR QUÉ: Mantener visibles y accesibles todos los territorios de Nicaragua
 * mediante un recorrido continuo que el visitante puede controlar.
 * CÓMO: Sincroniza el carril, la ficha destacada y la barra de progreso con un
 * ciclo temporal; pausa por decisión del usuario, interacción o visibilidad.
 * QUÉ: Navegación anterior/siguiente, pausa, reanudación y enlaces territoriales.
 * ============================================================================
 */
(function () {
  'use strict';

  const INTERVAL_MS = 4800;

  function initializeTerritoryCarousel() {
    const carousel = document.getElementById('territoryCarousel');
    const track = document.getElementById('territoryTrack');
    const items = track ? Array.from(track.querySelectorAll('.hist-dept-pill')) : [];
    const previous = document.getElementById('territoryPrevious');
    const next = document.getElementById('territoryNext');
    const pause = document.getElementById('territoryPause');
    const progress = document.getElementById('territoryProgressBar');
    const image = document.getElementById('territoryHighlightImage');
    const title = document.getElementById('territoryHighlightTitle');
    const region = document.getElementById('territoryHighlightRegion');
    const description = document.getElementById('territoryHighlightDescription');
    const link = document.getElementById('territoryHighlightLink');
    const counter = document.getElementById('territoryCurrent');

    if (!carousel || !track || !items.length || !previous || !next || !pause) return;

    let activeIndex = 0;
    let timerId = null;
    let pausedByUser = false;

    function restartProgress() {
      if (!progress) return;
      progress.classList.remove('is-running');
      void progress.offsetWidth;
      if (!pausedByUser && !document.hidden) progress.classList.add('is-running');
    }

    function update(index, restartTimer) {
      activeIndex = (index + items.length) % items.length;
      const item = items[activeIndex];
      const itemWidth = item.getBoundingClientRect().width + 10;
      const visibleWidth = carousel.getBoundingClientRect().width;
      const maxOffset = Math.max(0, track.scrollWidth - visibleWidth);
      const offset = Math.min(activeIndex * itemWidth, maxOffset);

      items.forEach((territory, territoryIndex) => {
        territory.classList.toggle('is-active', territoryIndex === activeIndex);
        territory.setAttribute('aria-current', territoryIndex === activeIndex ? 'true' : 'false');
      });

      track.style.transform = `translate3d(${-offset}px, 0, 0)`;
      image.src = item.dataset.image || '';
      image.alt = item.dataset.name || '';
      title.textContent = item.dataset.name || '';
      region.textContent = item.dataset.region || '';
      description.textContent = item.dataset.description || '';
      link.href = item.href;
      link.firstChild.textContent = `Explorar ${item.dataset.name || ''} `;
      counter.textContent = String(activeIndex + 1).padStart(2, '0');

      if (restartTimer) startTimer();
      restartProgress();
    }

    function startTimer() {
      window.clearInterval(timerId);
      if (pausedByUser || document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      timerId = window.setInterval(() => update(activeIndex + 1, false), INTERVAL_MS);
    }

    function setPaused(shouldPause) {
      pausedByUser = shouldPause;
      pause.setAttribute('aria-pressed', String(shouldPause));
      pause.setAttribute('aria-label', shouldPause ? 'Reanudar recorrido' : 'Pausar recorrido');
      pause.innerHTML = shouldPause
        ? '<i class="fa-solid fa-play"></i><span>Reanudar</span>'
        : '<i class="fa-solid fa-pause"></i><span>Pausar</span>';
      startTimer();
      restartProgress();
    }

    previous.addEventListener('click', () => update(activeIndex - 1, true));
    next.addEventListener('click', () => update(activeIndex + 1, true));
    pause.addEventListener('click', () => setPaused(!pausedByUser));
    items.forEach((item, index) => item.addEventListener('focus', () => update(index, true)));
    document.addEventListener('visibilitychange', () => {
      startTimer();
      restartProgress();
    });
    window.addEventListener('resize', () => update(activeIndex, false), { passive: true });

    update(0, false);
    startTimer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTerritoryCarousel, { once: true });
  } else {
    initializeTerritoryCarousel();
  }
})();
