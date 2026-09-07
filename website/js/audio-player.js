// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — REPRODUCTOR DE MÚSICA FOLCLÓRICA (audio-player.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Honrar y difundir el patrimonio sonoro de Nicaragua mediante la reproducción
//   a 1 toque de piezas icónicas del folklore tradicional nicaragüense.
// - Conectar al visitante con las raíces culturales de Masaya, León y el Norte
//   mientras explora destinos, gastronomía o lee la historia comunitaria.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Utiliza la API HTML5 Audio con gestión de eventos asíncronos y estados reactivos.
// - Control de pista activa, botón play/pause interactivo con íconos dinámicos y
//   notificación visual en tiempo real.
// - Integración defensiva con Firebase Analytics para registro de escucha.
//
// 📦 3. QUÉ (WHAT / FUNCIONES EXPUESTAS):
// - initFolkloreAudio(): Inicializa tarjetas de pistas y reproductor de audio global.
// ============================================================================

let currentAudioPlayer = null;
let currentPlayingBtn = null;

function initFolkloreAudio() {
  const audioEl = document.getElementById('globalFolkloreAudio');
  const trackBtns = document.querySelectorAll('.track-btn-card');
  const display = document.getElementById('currentTrackDisplay');

  if (!audioEl || !trackBtns.length) return;
  currentAudioPlayer = audioEl;

  trackBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const audioSrc = btn.getAttribute('data-audio');
      const trackName = btn.getAttribute('data-name');
      const author = btn.getAttribute('data-author');

      // Si la misma pista se está reproduciendo, pausar
      if (currentPlayingBtn === btn && !audioEl.paused) {
        audioEl.pause();
        btn.classList.remove('playing');
        const icon = btn.querySelector('.track-icon-play i');
        if (icon) icon.className = 'fa-solid fa-play';
        if (display) display.innerHTML = `<i class="fa-solid fa-circle-pause"></i> En pausa: ${trackName}`;
        return;
      }

      // Reiniciar estado visual de los demás botones
      trackBtns.forEach(b => {
        b.classList.remove('playing');
        const icon = b.querySelector('.track-icon-play i');
        if (icon) icon.className = 'fa-solid fa-play';
      });

      // Cargar y reproducir nueva pista
      audioEl.src = audioSrc;
      audioEl.play().then(() => {
        btn.classList.add('playing');
        const icon = btn.querySelector('.track-icon-play i');
        if (icon) icon.className = 'fa-solid fa-pause';
        currentPlayingBtn = btn;
        if (display) display.innerHTML = `<i class="fa-solid fa-compact-disc fa-spin"></i> Sonando: <strong>${trackName}</strong> (${author})`;

        if (typeof window.logFirebaseEvent === 'function' && window.firebaseAnalytics) {
          window.logFirebaseEvent(window.firebaseAnalytics, 'play_folklore_song', { song_name: trackName });
        }
      }).catch(err => {
        console.warn("Audio playback notice:", err);
      });
    });
  });

  audioEl.addEventListener('ended', () => {
    if (currentPlayingBtn) {
      currentPlayingBtn.classList.remove('playing');
      const icon = currentPlayingBtn.querySelector('.track-icon-play i');
      if (icon) icon.className = 'fa-solid fa-play';
    }
    if (display) display.innerHTML = '<i class="fa-solid fa-circle-check"></i> Reproducción finalizada';
  });
}
