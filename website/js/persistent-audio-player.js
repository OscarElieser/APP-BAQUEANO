// ============================================================================
// 🧭 BAQUEANO — MINI REPRODUCTOR SONORO PERSISTENTE
// ============================================================================
// 🎯 POR QUÉ: mantener la continuidad de escucha cuando la navegación reemplaza
// el documento HTML, sin obligar al visitante a volver a la página de música.
// ⚙️ CÓMO: sincroniza pista, segundo, volumen y estado en sessionStorage; en cada
// nueva página reconstruye un único Audio y solicita reanudación defensivamente.
// 📦 QUÉ: tarjeta flotante accesible con continuar/pausar, volver a Música y
// cierre manual definitivo para la sesión de navegación actual.
// ============================================================================

(function () {
  'use strict';

  const STORAGE_KEY = 'baqueano_audio_session_v1';
  const isMusicPage = /(?:^|\/)musica\.html$/i.test(window.location.pathname);
  let audio = null;
  let state = readState();

  function readState() {
    try {
      const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
      return parsed && parsed.src && !parsed.dismissed ? parsed : null;
    } catch (_) {
      return null;
    }
  }

  function saveState(patch) {
    state = { ...(state || {}), ...patch, updatedAt: Date.now() };
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) { /* almacenamiento no disponible */ }
  }

  function escapeHtml(value) {
    const node = document.createElement('span');
    node.textContent = String(value || '');
    return node.innerHTML;
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return '0:00';
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  }

  function injectStyles() {
    if (document.getElementById('baqueanoFloatingAudioStyles')) return;
    const style = document.createElement('style');
    style.id = 'baqueanoFloatingAudioStyles';
    style.textContent = `
      .baq-mini-player{position:fixed;right:clamp(14px,2vw,28px);bottom:clamp(14px,2vw,28px);z-index:2147483000;width:min(430px,calc(100vw - 28px));display:grid;grid-template-columns:52px minmax(0,1fr);gap:12px;align-items:center;padding:12px;background:linear-gradient(145deg,rgba(15,23,42,.97),rgba(22,93,111,.93));border:1px solid rgba(244,230,193,.24);border-radius:18px;box-shadow:0 22px 60px rgba(2,8,23,.48),inset 0 1px 0 rgba(255,255,255,.08);color:#fff;font-family:Inter,system-ui,sans-serif;backdrop-filter:blur(20px);animation:baqMiniIn .28s ease-out;touch-action:none;user-select:none}
      .baq-mini-player::before{content:"";position:absolute;inset:-1px;border-radius:18px;pointer-events:none;background:linear-gradient(120deg,rgba(246,94,1,.55),transparent 35%,rgba(244,230,193,.18));mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;padding:1px}
      .baq-mini-disc{width:52px;height:52px;display:grid;place-items:center;border:0;border-radius:50%;color:#f4e6c1;background:radial-gradient(circle,#f65e01 0 12%,#0f172a 13% 35%,#165d6f 36% 52%,#0f172a 53%);box-shadow:0 0 0 4px rgba(246,94,1,.12),0 10px 24px rgba(0,0,0,.3);cursor:pointer}
      .baq-mini-player.is-playing .baq-mini-disc i{animation:baqDiscSpin 4s linear infinite}
      .baq-mini-main{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;min-width:0}.baq-mini-copy{min-width:0;cursor:grab}.baq-mini-copy:active{cursor:grabbing}.baq-mini-eyebrow{display:block;margin-bottom:3px;color:#f65e01;font-size:10px;font-weight:900;letter-spacing:.09em;text-transform:uppercase}.baq-mini-title{display:block;overflow:hidden;color:#fff;font-size:14px;font-weight:850;line-height:1.25;text-overflow:ellipsis;white-space:nowrap}.baq-mini-artist{display:block;overflow:hidden;margin-top:3px;color:#f4e6c1;font-size:11px;text-overflow:ellipsis;white-space:nowrap}.baq-mini-time{display:block;margin-top:5px;color:#94a3b8;font-size:10px;font-variant-numeric:tabular-nums}
      .baq-mini-actions{display:flex;gap:5px;align-items:center}.baq-mini-btn{position:relative;z-index:2;width:32px;height:32px;display:grid;place-items:center;border:1px solid rgba(244,230,193,.15);border-radius:10px;color:#f4e6c1;background:rgba(255,255,255,.06);cursor:pointer;touch-action:manipulation;pointer-events:auto;transition:transform .18s ease,background .18s ease,border-color .18s ease}.baq-mini-btn:hover{transform:translateY(-2px);background:rgba(246,94,1,.2);border-color:rgba(246,94,1,.5)}.baq-mini-toggle{width:38px;height:38px;color:#fff;background:#f65e01;border-color:#f65e01;border-radius:50%}.baq-mini-close{color:#cbd5e1}.baq-mini-player.is-blocked .baq-mini-eyebrow{color:#f4e6c1}
      .baq-mini-player.is-minimized{width:68px;height:68px;display:grid;grid-template-columns:1fr;padding:8px;border-radius:50%;cursor:grab}.baq-mini-player.is-minimized .baq-mini-main{display:none}.baq-mini-player.is-minimized .baq-mini-disc{width:50px;height:50px}.baq-mini-player.is-dragging{cursor:grabbing;transition:none;animation:none}
      @keyframes baqDiscSpin{to{transform:rotate(360deg)}}@keyframes baqMiniIn{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:none}}
      @media(max-width:620px){.baq-mini-player{grid-template-columns:44px minmax(0,1fr);padding:10px;bottom:10px;right:10px;width:calc(100vw - 20px)}.baq-mini-main{grid-template-columns:1fr}.baq-mini-disc{width:44px;height:44px}.baq-mini-actions{justify-content:flex-start;gap:4px}.baq-mini-btn{width:32px;height:32px}.baq-mini-player.is-minimized{width:62px;height:62px}.baq-mini-player.is-minimized .baq-mini-disc{width:44px;height:44px}}
      @media(prefers-reduced-motion:reduce){.baq-mini-player,.baq-mini-player.is-playing .baq-mini-disc i{animation:none}}
    `;
    document.head.appendChild(style);
  }

  function render() {
    if (!state || isMusicPage || document.getElementById('baqueanoMiniPlayer')) return;
    injectStyles();
    const player = document.createElement('aside');
    player.id = 'baqueanoMiniPlayer';
    player.className = 'baq-mini-player';
    player.setAttribute('aria-label', 'Reproductor de música persistente');
    player.innerHTML = `
      <button class="baq-mini-disc" type="button" data-audio-action="expand" aria-label="Restaurar reproductor" title="Mover o restaurar"><i class="fa-solid fa-compact-disc"></i></button>
      <div class="baq-mini-main"><div class="baq-mini-copy" data-drag-handle><span class="baq-mini-eyebrow">Sonando en BAQUEANO</span><strong class="baq-mini-title">${escapeHtml(state.title)}</strong><span class="baq-mini-artist">${escapeHtml(state.artist)}</span><span class="baq-mini-time">${formatTime(state.currentTime)} / ${formatTime(state.duration)}</span></div>
      <div class="baq-mini-actions"><button class="baq-mini-btn" type="button" data-audio-action="prev" aria-label="Canción anterior" title="Anterior"><i class="fa-solid fa-backward-step"></i></button><button class="baq-mini-btn baq-mini-toggle" type="button" data-audio-action="toggle" aria-label="Pausar o continuar" title="Pausar o continuar"><i class="fa-solid fa-play"></i></button><button class="baq-mini-btn" type="button" data-audio-action="next" aria-label="Canción siguiente" title="Siguiente"><i class="fa-solid fa-forward-step"></i></button><a class="baq-mini-btn" href="musica.html" aria-label="Abrir Música" title="Abrir Música"><i class="fa-solid fa-music"></i></a><button class="baq-mini-btn" type="button" data-audio-action="minimize" aria-label="Minimizar reproductor" title="Minimizar"><i class="fa-solid fa-minus"></i></button><button class="baq-mini-btn baq-mini-close" type="button" data-audio-action="close" aria-label="Cerrar reproductor" title="Cerrar"><i class="fa-solid fa-xmark"></i></button></div></div>`;
    document.body.appendChild(player);
    restorePlacement(player);
    enableDragging(player);
    const actions = { toggle, prev: () => step(-1), next: () => step(1), minimize: () => setMinimized(true), expand: () => setMinimized(false), close };
    player.querySelectorAll('[data-audio-action]').forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        actions[button.dataset.audioAction]?.();
      });
    });
  }

  function setMinimized(minimized) {
    const player = document.getElementById('baqueanoMiniPlayer');
    if (!player) return;
    player.classList.toggle('is-minimized', minimized);
    saveState({ minimized });
    keepInViewport(player);
  }

  function restorePlacement(player) {
    player.classList.toggle('is-minimized', Boolean(state.minimized));
    if (Number.isFinite(state.left) && Number.isFinite(state.top)) {
      player.style.left = `${state.left}px`;
      player.style.top = `${state.top}px`;
      player.style.right = 'auto';
      player.style.bottom = 'auto';
      requestAnimationFrame(() => keepInViewport(player));
    }
  }

  function keepInViewport(player) {
    const rect = player.getBoundingClientRect();
    const left = Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - rect.width - 8));
    const top = Math.min(Math.max(8, rect.top), Math.max(8, window.innerHeight - rect.height - 8));
    player.style.left = `${left}px`;
    player.style.top = `${top}px`;
    player.style.right = 'auto';
    player.style.bottom = 'auto';
    saveState({ left, top });
  }

  function enableDragging(player) {
    let drag = null;
    player.addEventListener('pointerdown', event => {
      const isControl = event.target.closest('[data-audio-action]');
      const canDrag = !isControl && (player.classList.contains('is-minimized') || event.target.closest('[data-drag-handle]'));
      if (!canDrag || event.button !== 0) return;
      const rect = player.getBoundingClientRect();
      drag = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      player.classList.add('is-dragging');
      player.setPointerCapture(event.pointerId);
    });
    player.addEventListener('pointermove', event => {
      if (!drag) return;
      player.style.left = `${event.clientX - drag.x}px`;
      player.style.top = `${event.clientY - drag.y}px`;
      player.style.right = 'auto';
      player.style.bottom = 'auto';
    });
    const finish = () => {
      if (!drag) return;
      drag = null;
      player.classList.remove('is-dragging');
      keepInViewport(player);
    };
    player.addEventListener('pointerup', finish);
    player.addEventListener('pointercancel', finish);
    window.addEventListener('resize', () => keepInViewport(player));
  }

  function step(direction) {
    if (!Array.isArray(state?.queue) || state.queue.length < 2) {
      const eyebrow = document.querySelector('.baq-mini-eyebrow');
      if (eyebrow) eyebrow.textContent = 'Abrí Música para actualizar la lista';
      return;
    }
    const current = Number.isInteger(state.currentIndex) ? state.currentIndex : state.queue.findIndex(track => track.file === state.file);
    const nextIndex = (current + direction + state.queue.length) % state.queue.length;
    const next = state.queue[nextIndex];
    audio.pause();
    audio.src = next.src;
    audio.load();
    saveState({ ...next, currentIndex: nextIndex, currentTime: 0, duration: 0, playing: true });
    const player = document.getElementById('baqueanoMiniPlayer');
    if (player) {
      player.querySelector('.baq-mini-title').textContent = next.title;
      player.querySelector('.baq-mini-artist').textContent = next.artist;
    }
    audio.addEventListener('loadedmetadata', () => audio.play().catch(() => updateUi(true)), { once: true });
  }

  function updateUi(blocked = false) {
    const player = document.getElementById('baqueanoMiniPlayer');
    if (!player || !audio) return;
    player.classList.toggle('is-playing', !audio.paused);
    player.classList.toggle('is-blocked', blocked);
    const icon = player.querySelector('[data-audio-action="toggle"] i');
    if (icon) icon.className = `fa-solid fa-${audio.paused ? 'play' : 'pause'}`;
    const eyebrow = player.querySelector('.baq-mini-eyebrow');
    if (eyebrow) eyebrow.textContent = blocked ? 'Toca para continuar' : (audio.paused ? 'Música en pausa' : 'Sonando en BAQUEANO');
    const time = player.querySelector('.baq-mini-time');
    if (time) time.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration || state.duration)}`;
  }

  function toggle() {
    if (!audio) return;
    if (audio.paused) {
      saveState({ playing: true });
      audio.play().then(() => updateUi(false)).catch(() => { saveState({ playing: false }); updateUi(true); });
    } else {
      saveState({ playing: false, currentTime: audio.currentTime });
      audio.pause();
      updateUi(false);
    }
  }

  function close() {
    if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); }
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (_) { /* almacenamiento no disponible */ }
    state = null;
    document.getElementById('baqueanoMiniPlayer')?.remove();
  }

  function start() {
    if (!state || isMusicPage) return;
    render();
    audio = new Audio(state.src);
    audio.preload = 'metadata';
    audio.volume = Number.isFinite(state.volume) ? state.volume : 0.85;
    audio.addEventListener('loadedmetadata', () => {
      audio.currentTime = Math.min(Number(state.currentTime) || 0, Math.max(0, audio.duration - 0.25));
      updateUi(false);
      if (state.playing) audio.play().then(() => updateUi(false)).catch(() => updateUi(true));
    }, { once: true });
    audio.addEventListener('play', () => { saveState({ playing: true }); updateUi(false); });
    audio.addEventListener('pause', () => { if (state) saveState({ playing: false, currentTime: audio.currentTime }); updateUi(false); });
    audio.addEventListener('timeupdate', () => { if (state) saveState({ currentTime: audio.currentTime, duration: audio.duration }); updateUi(false); });
    audio.addEventListener('ended', close);
    window.addEventListener('pagehide', () => { if (state) saveState({ currentTime: audio.currentTime, duration: audio.duration, playing: !audio.paused, volume: audio.volume }); });
  }

  window.BaqueanoAudioSession = { key: STORAGE_KEY, read: readState, save: saveState, clear: close };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start) : start();
})();
