// ============================================================================
// BAQUEANO — GALERÍA TERRITORIAL DE SEGURIDAD
// 🎯 POR QUÉ: facilitar el acceso rápido a orientación de salud y auxilio por región.
// ⚙️ CÓMO: carrusel infinito con clones, movimiento temporizado, controles y pausa contextual.
// 📦 QUÉ: navegación anterior/siguiente, pausa manual, pausa por interacción y estado accesible.
// ============================================================================
(function () {
  'use strict';
  const gallery = document.querySelector('[data-safety-gallery]');
  const track = document.querySelector('[data-safety-track]');
  if (!gallery || !track) return;

  const originals = [...track.children];
  if (originals.length < 2) return;
  const previous = document.querySelector('[data-safety-prev]');
  const next = document.querySelector('[data-safety-next]');
  const pause = document.querySelector('[data-safety-pause]');
  const status = document.getElementById('safetyGalleryStatus');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 1;
  let timer = 0;
  let manuallyPaused = reduceMotion;
  let interacting = false;

  const firstClone = originals[0].cloneNode(true);
  const lastClone = originals[originals.length - 1].cloneNode(true);
  firstClone.setAttribute('aria-hidden', 'true');
  lastClone.setAttribute('aria-hidden', 'true');
  firstClone.dataset.safetyClone = 'true';
  lastClone.dataset.safetyClone = 'true';
  track.prepend(lastClone);
  track.append(firstClone);

  function cardStep() {
    const card = track.querySelector('.safety-card');
    const style = getComputedStyle(track);
    return (card?.getBoundingClientRect().width || gallery.clientWidth) + (parseFloat(style.columnGap) || 20);
  }
  function move(animate) {
    track.style.transition = animate ? 'transform .62s cubic-bezier(.22,.72,.24,1)' : 'none';
    track.style.transform = `translate3d(${-index * cardStep()}px,0,0)`;
  }
  function updateStatus() {
    const paused = manuallyPaused || interacting;
    if (status) status.textContent = paused ? 'Recorrido en pausa' : 'Recorrido automático activo';
    if (pause) {
      pause.setAttribute('aria-pressed', String(manuallyPaused));
      pause.innerHTML = manuallyPaused ? '<i class="fa-solid fa-play"></i><span>Reanudar</span>' : '<i class="fa-solid fa-pause"></i><span>Pausar</span>';
    }
  }
  function stopTimer() { clearInterval(timer); timer = 0; }
  function startTimer() {
    stopTimer();
    if (!manuallyPaused && !interacting) timer = window.setInterval(() => { index += 1; move(true); }, 4200);
    updateStatus();
  }
  function step(direction) { index += direction; move(true); startTimer(); }

  track.addEventListener('transitionend', () => {
    if (index === 0) { index = originals.length; move(false); }
    if (index === originals.length + 1) { index = 1; move(false); }
  });
  previous?.addEventListener('click', () => step(-1));
  next?.addEventListener('click', () => step(1));
  pause?.addEventListener('click', () => { manuallyPaused = !manuallyPaused; startTimer(); });
  gallery.addEventListener('mouseenter', () => { interacting = true; startTimer(); });
  gallery.addEventListener('mouseleave', () => { interacting = false; startTimer(); });
  gallery.addEventListener('focusin', () => { interacting = true; startTimer(); });
  gallery.addEventListener('focusout', event => { if (!gallery.contains(event.relatedTarget)) { interacting = false; startTimer(); } });
  gallery.addEventListener('pointerdown', () => { interacting = true; startTimer(); }, { passive: true });
  gallery.addEventListener('pointerup', () => { window.setTimeout(() => { interacting = false; startTimer(); }, 1200); }, { passive: true });
  window.addEventListener('resize', () => move(false), { passive: true });
  document.addEventListener('visibilitychange', () => { interacting = document.hidden; startTimer(); });

  move(false);
  startTimer();
})();
