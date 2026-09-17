/**
 * POR QUÉ: permitir que la paleta territorial se explore como una historia visual continua.
 * CÓMO: duplica las tarjetas para cerrar el ciclo y controla la pausa mediante selección accesible.
 * QUÉ: inicialización, clonación y control por clic, toque, Enter o barra espaciadora.
 */
(function initializeTerritorialColorGallery() {
  'use strict';

  const setupGallery = () => {
    const gallery = document.getElementById('territorialColorGallery');
    const track = document.getElementById('territorialColorTrack');
    const status = document.getElementById('territorialColorStatus');

    if (!gallery || !track || !status || gallery.dataset.ready === 'true') return;

    const cards = Array.from(track.querySelectorAll('.color-item-card'));
    if (cards.length === 0) return;

    gallery.dataset.ready = 'true';

    cards.forEach((card, index) => {
      card.dataset.galleryIndex = String(index);
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-pressed', 'false');
      const title = card.querySelector('h4')?.textContent?.trim() || `Color ${index + 1}`;
      card.setAttribute('aria-label', `${title}. Seleccionar para pausar.`);

      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.removeAttribute('role');
      clone.removeAttribute('tabindex');
      clone.removeAttribute('aria-pressed');
      clone.removeAttribute('aria-label');
      clone.dataset.galleryClone = 'true';
      clone.dataset.galleryIndex = String(index);
      track.appendChild(clone);
    });

    const toggleSelection = (selectedCard) => {
      const selectedIndex = selectedCard.dataset.galleryIndex;
      const matchingCards = track.querySelectorAll(`[data-gallery-index="${selectedIndex}"]`);
      const resumesGallery = gallery.classList.contains('is-paused')
        && Array.from(matchingCards).some((card) => card.classList.contains('is-selected'));

      track.querySelectorAll('.color-item-card').forEach((card) => card.classList.remove('is-selected'));
      cards.forEach((card) => card.setAttribute('aria-pressed', 'false'));

      if (resumesGallery) {
        gallery.classList.remove('is-paused');
        status.textContent = 'Selecciona una tarjeta para pausar el recorrido';
        return;
      }

      matchingCards.forEach((card) => card.classList.add('is-selected'));
      cards[Number(selectedIndex)]?.setAttribute('aria-pressed', 'true');
      gallery.classList.add('is-paused');
      status.textContent = 'Recorrido pausado · selecciona la misma tarjeta para continuar';
    };

    gallery.addEventListener('click', (event) => {
      const card = event.target.closest('.color-item-card');
      if (card) toggleSelection(card);
    });

    gallery.addEventListener('keydown', (event) => {
      const card = event.target.closest('.color-item-card:not([data-gallery-clone="true"])');
      if (!card || (event.key !== 'Enter' && event.key !== ' ')) return;
      event.preventDefault();
      toggleSelection(card);
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      status.textContent = 'Movimiento reducido según la configuración del dispositivo';
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupGallery, { once: true });
  } else {
    setupGallery();
  }
}());