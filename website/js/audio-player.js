// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — GALERÍA SONORA & CONSOLA FOLCLÓRICA (audio-player.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Transformar la sección musical en una Galería Sonora viva que rinda tributo
//   a los 16 compositores y artistas más trascendentales de Nicaragua.
// - Conectar de forma interactiva la MÚSICA con el TERRITORIO (enlace directo a los
//   17 departamentos), demostrando cómo el paisaje, el río y el volcán inspiraron
//   cada acorde nacional.
// - Ofrecer una experiencia sonora respetuosa con los derechos de autor mediante
//   un sintetizador armónico Web Audio API que emula las teclas de palo de marimba
//   y la guitarra campesina tradicional a 60fps sin dependencias externas.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Motor Web Audio API (AudioContext) con envolvente ADSR tipo marimba de arco.
// - Filtro reactivo por 4 categorías culturales y buscador textual en tiempo real.
// - Modal de Ficha Enriquecida de Artista con catálogo de obras, citas, legado y
//   botón de navegación territorial hacia departamento.html?id=...
// - Estado global `window.BaqueanoSonora` con persistencia defensiva y eventos.
//
// 📦 3. QUÉ (WHAT / FUNCIONES EXPUESTAS):
// - initBaqueanoSonoraGallery(): Renderiza categorías, tarjetas de artistas y eventos.
// - openArtistModal(artistId): Despliega la ficha biográfica y sonora del artista.
// - playArtistMelody(artistId, workIndex): Reproduce la secuencia sonora tradicional.
// ============================================================================

(function () {
  'use strict';

  let audioCtx = null;
  let currentPlayingTimer = null;
  let activeArtistId = null;
  let activeWorkIndex = 0;
  let isSynthesizerPlaying = false;
  let currentFilter = 'all';
  let searchTerm = '';

  // Inicializador de AudioContext bajo interacción de usuario
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Sintetizador de Marimba de Arco / Guitarra Campesina
  function playNote(freq, startTime, duration = 0.35) {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Timbre tipo marimba indígena (madera de coyote)
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    // Armónico suave de octava superior
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, startTime);

    // Envolvente de volumen (ataque rápido y decaimiento percutido)
    gainNode.gain.setValueAtTime(0.001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.35, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(startTime);
    osc2.start(startTime);
    osc.stop(startTime + duration);
    osc2.stop(startTime + duration);
  }

  // Reproducción de una secuencia de notas melódicas
  function playMelodySequence(notesArray, callbackOnEnd) {
    stopCurrentPlayback();
    const ctx = getAudioContext();
    if (!ctx || !notesArray || !notesArray.length) {
      if (callbackOnEnd) callbackOnEnd();
      return;
    }

    isSynthesizerPlaying = true;
    const now = ctx.currentTime + 0.05;
    const noteStep = 0.28;

    notesArray.forEach((freq, idx) => {
      playNote(freq, now + (idx * noteStep), 0.32);
    });

    const totalDurationMs = (notesArray.length * noteStep + 0.5) * 1000;
    currentPlayingTimer = setTimeout(() => {
      isSynthesizerPlaying = false;
      if (callbackOnEnd) callbackOnEnd();
    }, totalDurationMs);
  }

  function stopCurrentPlayback() {
    if (currentPlayingTimer) {
      clearTimeout(currentPlayingTimer);
      currentPlayingTimer = null;
    }
    isSynthesizerPlaying = false;

    // Detener también audio HTML5 si existiese
    const audioEl = document.getElementById('globalFolkloreAudio');
    if (audioEl && !audioEl.paused) {
      audioEl.pause();
      audioEl.currentTime = 0;
    }

    updateConsoleDisplay(null, null);
    updateAllCardPlayStates(null);
  }

  // Actualiza la barra de la consola superior
  function updateConsoleDisplay(artist, workTitle) {
    const display = document.getElementById('currentTrackDisplay');
    const waveAnim = document.getElementById('sonoraWaveAnimation');
    const stopBtn = document.getElementById('btnStopSonoraPlayback');

    if (!display) return;

    if (artist && workTitle) {
      display.innerHTML = `
        <span style="color: var(--verde-neon);"><i class="fa-solid fa-compact-disc fa-spin"></i></span>
        Sonando: <strong style="color: #FFFFFF;">${workTitle}</strong> — <span style="color: var(--arena-pinolera);">${artist.name}</span> (${artist.origin})
      `;
      if (waveAnim) waveAnim.style.display = 'flex';
      if (stopBtn) stopBtn.style.display = 'inline-flex';
    } else {
      display.innerHTML = `<i class="fa-solid fa-circle-play"></i> Selecciona un compositor u obra para iniciar el viaje sonoro`;
      if (waveAnim) waveAnim.style.display = 'none';
      if (stopBtn) stopBtn.style.display = 'none';
    }
  }

  function updateAllCardPlayStates(playingArtistId) {
    document.querySelectorAll('.sonora-artist-card').forEach(card => {
      const cardId = card.getAttribute('data-artist-id');
      const icon = card.querySelector('.btn-play-card-icon i');
      if (cardId === playingArtistId) {
        card.classList.add('playing');
        if (icon) icon.className = 'fa-solid fa-pause';
      } else {
        card.classList.remove('playing');
        if (icon) icon.className = 'fa-solid fa-play';
      }
    });
  }

  // Reproducir melodía insignia de un artista
  function playArtistWork(artistId, workIndex = 0) {
    const artists = window.BAQUEANO_SONORA_ARTISTS || [];
    const artist = artists.find(a => a.id === artistId);
    if (!artist) return;

    const works = artist.works || [];
    const work = works[workIndex] || works[0];
    if (!work) return;

    // Si ya está sonando esta misma obra, detener
    if (isSynthesizerPlaying && activeArtistId === artistId && activeWorkIndex === workIndex) {
      stopCurrentPlayback();
      return;
    }

    activeArtistId = artistId;
    activeWorkIndex = workIndex;

    updateConsoleDisplay(artist, work.title);
    updateAllCardPlayStates(artistId);

    // Registro defensivo en Analytics
    if (typeof window.logFirebaseEvent === 'function' && window.firebaseAnalytics) {
      window.logFirebaseEvent(window.firebaseAnalytics, 'play_sonora_piece', {
        artist_id: artistId,
        song_title: work.title,
        origin: artist.origin
      });
    }

    playMelodySequence(work.notes, () => {
      updateConsoleDisplay(null, null);
      updateAllCardPlayStates(null);
    });
  }

  // Renderizado dinámico de la galería de artistas
  function renderArtistsGrid() {
    const container = document.getElementById('sonoraArtistsGrid');
    if (!container) return;

    const artists = window.BAQUEANO_SONORA_ARTISTS || [];
    const filtered = artists.filter(a => {
      const matchesCategory = (currentFilter === 'all' || a.category === currentFilter);
      const searchLower = searchTerm.toLowerCase().trim();
      const matchesSearch = !searchLower ||
        a.name.toLowerCase().includes(searchLower) ||
        a.origin.toLowerCase().includes(searchLower) ||
        a.genres.toLowerCase().includes(searchLower) ||
        a.works.some(w => w.title.toLowerCase().includes(searchLower));

      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: rgba(15,23,42,0.6); border-radius: 20px; border: 1px dashed var(--border-subtle);">
          <i class="fa-solid fa-music-slash" style="font-size: 2.5rem; color: var(--terracotta); margin-bottom: 1rem;"></i>
          <h4 style="font-size: 1.3rem; color: #FFFFFF; margin-bottom: 0.5rem;">No se encontraron compositores</h4>
          <p style="font-size: 0.9rem; color: var(--text-muted);">Prueba buscando con otro término (ej. "Camilo", "Mora Limpia", "Somoto", "León").</p>
          <button class="btn-hero-glass" onclick="window.BaqueanoSonora.clearSearch()" style="margin-top: 1rem;">
            <i class="fa-solid fa-rotate-left"></i> Restablecer Filtros
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(artist => {
      const isPlaying = isSynthesizerPlaying && activeArtistId === artist.id;
      const primaryWork = (artist.works && artist.works[0]) ? artist.works[0].title : 'Obra Insigne';

      return `
        <div class="sonora-artist-card ${isPlaying ? 'playing' : ''}" data-artist-id="${artist.id}" id="card-${artist.id}">
          <div class="sonora-card-top">
            <div class="sonora-card-icon-wrap">
              <i class="${artist.icon}"></i>
            </div>
            <div class="sonora-card-badge">${artist.honorific}</div>
          </div>

          <h3 class="sonora-card-name">${artist.name}</h3>
          
          <div class="sonora-card-territory">
            <i class="fa-solid fa-map-pin" style="color: var(--terracotta);"></i>
            <span>${artist.origin}</span>
          </div>

          <p class="sonora-card-legacy">
            ${artist.legacy.substring(0, 135)}...
          </p>

          <div class="sonora-card-sample-box">
            <div style="font-size: 0.72rem; color: var(--arena-pinolera); font-family: var(--font-tech); text-transform: uppercase;">
              OBRA DESTACADA:
            </div>
            <div style="font-size: 0.92rem; font-weight: 700; color: #FFFFFF;">
              🎵 ${primaryWork}
            </div>
          </div>

          <div class="sonora-card-actions">
            <button class="btn-sonora-play-work" onclick="window.BaqueanoSonora.playWork('${artist.id}', 0)" title="Escuchar melodía tradicional">
              <span class="btn-play-card-icon"><i class="fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}"></i></span>
              <span>Escuchar</span>
            </button>
            <button class="btn-sonora-view-bio" onclick="window.BaqueanoSonora.openModal('${artist.id}')" title="Ver ficha completa y territorio">
              <i class="fa-solid fa-id-card"></i> Ficha
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Renderizar filtros de categoría
  function renderCategoryPills() {
    const container = document.getElementById('sonoraCategoryPills');
    if (!container) return;

    const categories = window.BAQUEANO_SONORA_CATEGORIES || [];
    
    let html = `
      <button class="sonora-cat-pill ${currentFilter === 'all' ? 'active' : ''}" onclick="window.BaqueanoSonora.setFilter('all')">
        <i class="fa-solid fa-globe"></i> Todos los Maestros (${(window.BAQUEANO_SONORA_ARTISTS || []).length})
      </button>
    `;

    categories.forEach(cat => {
      const count = (window.BAQUEANO_SONORA_ARTISTS || []).filter(a => a.category === cat.id).length;
      html += `
        <button class="sonora-cat-pill ${currentFilter === cat.id ? 'active' : ''}" onclick="window.BaqueanoSonora.setFilter('${cat.id}')">
          <i class="${cat.icon}"></i> ${cat.name} (${count})
        </button>
      `;
    });

    container.innerHTML = html;
  }

  // Modal Enriquecido de Artista
  function openArtistModal(artistId) {
    const artists = window.BAQUEANO_SONORA_ARTISTS || [];
    const artist = artists.find(a => a.id === artistId);
    if (!artist) return;

    const modal = document.getElementById('sonoraArtistModal');
    const content = document.getElementById('sonoraModalContent');
    if (!modal || !content) return;

    const worksHtml = (artist.works || []).map((work, idx) => `
      <div class="sonora-modal-work-item">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;">
            <span class="sonora-work-tag">${work.tag}</span>
            <strong style="color: #FFFFFF; font-size: 0.98rem;">${work.title}</strong>
          </div>
          <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 0; line-height: 1.45;">
            ${work.desc}
          </p>
        </div>
        <button class="btn-sonora-listen-pill" onclick="window.BaqueanoSonora.playWork('${artist.id}', ${idx})">
          <i class="fa-solid fa-circle-play"></i> Escuchar
        </button>
      </div>
    `).join('');

    content.innerHTML = `
      <div class="sonora-modal-header-hero">
        <div class="sonora-modal-avatar">
          <i class="${artist.icon}"></i>
        </div>
        <div style="flex: 1;">
          <div class="sonora-card-badge" style="margin-bottom: 0.4rem; display: inline-block;">${artist.honorific}</div>
          <h2 style="font-family: var(--font-display); font-size: 1.9rem; font-weight: 900; color: #FFFFFF; margin: 0 0 0.4rem;">
            ${artist.name}
          </h2>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.85rem; color: var(--arena-pinolera);">
            <span><i class="fa-solid fa-map-pin" style="color: var(--terracotta);"></i> ${artist.origin}</span>
            <span><i class="fa-solid fa-calendar-days"></i> ${artist.years}</span>
            <span><i class="fa-solid fa-guitar"></i> ${artist.genres}</span>
          </div>
        </div>
      </div>

      <div style="margin: 1.5rem 0; padding: 1rem; background: rgba(22, 93, 111, 0.15); border-left: 3px solid var(--terracotta); border-radius: 8px;">
        <p style="font-style: italic; font-size: 0.95rem; color: var(--arena-pinolera); margin: 0;">
          ${artist.quote}
        </p>
      </div>

      <div style="margin-bottom: 1.8rem;">
        <h4 style="font-size: 1.1rem; color: #FFFFFF; margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.5rem;">
          <i class="fa-solid fa-feather-pointed" style="color: var(--terracotta);"></i> Legado Histórico & Aporte a la Identidad
        </h4>
        <p style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.7; margin: 0;">
          ${artist.legacy}
        </p>
      </div>

      <div style="margin-bottom: 2rem;">
        <h4 style="font-size: 1.1rem; color: #FFFFFF; margin-bottom: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
          <i class="fa-solid fa-compact-disc" style="color: var(--verde-neon);"></i> Obras Insignes en el Patrimonio Baqueano
        </h4>
        <div style="display: flex; flex-direction: column; gap: 0.8rem;">
          ${worksHtml}
        </div>
      </div>

      <!-- BOTÓN DESTACADO: CONEXIÓN MÚSICA + TERRITORIO -->
      <div style="background: linear-gradient(135deg, rgba(22, 93, 111, 0.4) 0%, rgba(15, 23, 42, 0.95) 100%); border: 1px solid var(--border-teal); border-radius: 16px; padding: 1.3rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="font-size: 0.75rem; color: var(--verde-neon); font-family: var(--font-tech); font-weight: 800; text-transform: uppercase;">
            CONEXIÓN MÚSICA + TERRITORIO
          </div>
          <div style="font-size: 1.1rem; font-weight: 800; color: #FFFFFF;">
            Conoce la tierra de ${artist.name}: ${artist.departmentName}
          </div>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0.2rem 0 0;">
            Descubre la historia, gastronomía tradicional, senderos y cooperativas de este territorio.
          </p>
        </div>
        <a href="departamento.html?id=${artist.departmentId}" class="btn-hero-primary" style="padding: 0.65rem 1.2rem; font-size: 0.85rem; text-decoration: none;">
          <i class="fa-solid fa-map-location-dot"></i> Explorar ${artist.departmentName}
        </a>
      </div>
    `;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeArtistModal() {
    const modal = document.getElementById('sonoraArtistModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Inicializador global
  function initBaqueanoSonoraGallery() {
    renderCategoryPills();
    renderArtistsGrid();

    // Eventos del buscador
    const searchInput = document.getElementById('sonoraSearchInput');
    const searchClear = document.getElementById('sonoraSearchClear');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderArtistsGrid();
      });
    }

    if (searchClear && searchInput) {
      searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchTerm = '';
        renderArtistsGrid();
      });
    }

    // Botón de detener consola
    const stopBtn = document.getElementById('btnStopSonoraPlayback');
    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        stopCurrentPlayback();
      });
    }

    // Modal close triggers
    const closeBtn = document.getElementById('closeSonoraModalBtn');
    const modalBackdrop = document.getElementById('sonoraArtistModal');

    if (closeBtn) closeBtn.addEventListener('click', closeArtistModal);
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeArtistModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeArtistModal();
    });
  }

  // API pública global
  window.BaqueanoSonora = {
    init: initBaqueanoSonoraGallery,
    playWork: playArtistWork,
    openModal: openArtistModal,
    closeModal: closeArtistModal,
    stop: stopCurrentPlayback,
    setFilter: function (categoryKey) {
      currentFilter = categoryKey;
      renderCategoryPills();
      renderArtistsGrid();
    },
    clearSearch: function () {
      currentFilter = 'all';
      searchTerm = '';
      const input = document.getElementById('sonoraSearchInput');
      if (input) input.value = '';
      renderCategoryPills();
      renderArtistsGrid();
    }
  };

  // Autocarga en DOMReady
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBaqueanoSonoraGallery);
  } else {
    initBaqueanoSonoraGallery();
  }

})();
