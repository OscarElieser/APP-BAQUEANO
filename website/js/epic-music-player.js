// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — REPRODUCTOR ÉPICO DE MÚSICA PINOLERA (epic-music-player.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia musical interactiva y soberana para el explorador,
//   reuniendo las obras inmortales del folklore campesino, el Son Nica y la canción
//   revolucionaria e histórica de Nicaragua.
// - Conectar cada pieza con su departamento o región de origen, honrando la memoria
//   cultural de las familias campesinas y los héroes de la patria.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Motor Web Audio API (AudioContext) que sintetiza armónicos de marimba de arco
//   y guitarra campesina a 60fps con cero dependencias externas.
// - Gestión reactiva de estado: playlist, scrubbing interactivo, shuffle, repeat,
//   volumen gradual con mute y visualizador de espectro animado.
// - Sincronización visual con tornamesa virtual (vinilo giratorio y brazo tonearm).
//
// 📦 3. QUÉ (WHAT / COMPONENTES & DATOS):
// - Catálogo curado de folklore tradicional y música revolucionaria histórica.
// - Métodos: initEpicMusicPlayer(), loadTrack(), togglePlay(), nextTrack(), prevTrack().
// ============================================================================

(function () {
  'use strict';

  // Catálogo oficial de obras sonoras nicaragüenses
  const EPIC_TRACKS = [
    // ------------------------------------------------------------------------
    // FOLKLORE TRADICIONAL & SON NICA
    // ------------------------------------------------------------------------
    {
      id: "mora-limpia",
      title: "La Mora Limpia",
      artist: "Justo Santos",
      territory: "Rivas • Segundo Himno Nacional",
      category: "folklore",
      categoryName: "Folklore Tradicional",
      genre: "Son Nica / Himno",
      duration: "3:15",
      durationSec: 195,
      cover: "assets/images/destinos/Fortaleza de la Inmaculada Concepción.jpg",
      notes: [523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 587.33, 523.25, 659.25, 783.99, 880.00, 783.99, 659.25, 523.25]
    },
    {
      id: "solar-monimbo",
      title: "El Solar de Monimbó",
      artist: "Camilo Zapata",
      territory: "Masaya • Cuna del Folclore",
      category: "folklore",
      categoryName: "Folklore Tradicional",
      genre: "Son Nica Insigne",
      duration: "2:48",
      durationSec: 168,
      cover: "assets/images/destinos/volcan_masaya.jpg",
      notes: [523.25, 587.33, 659.25, 783.99, 880.00, 659.25, 783.99, 523.25, 587.33, 659.25, 523.25]
    },
    {
      id: "baile-mestizaje",
      title: "Baile del Mestizaje",
      artist: "Tradición Monimboseña",
      territory: "Monimbó • Masaya",
      category: "folklore",
      categoryName: "Folklore Tradicional",
      genre: "Marimba de Arco",
      duration: "2:30",
      durationSec: 150,
      cover: "assets/images/destinos/laguna_de_apoyo.jpg",
      notes: [659.25, 783.99, 880.00, 987.77, 880.00, 783.99, 659.25, 587.33, 523.25, 587.33, 659.25]
    },
    {
      id: "caballito-chontaleño",
      title: "Caballito Chontaleño",
      artist: "Camilo Zapata",
      territory: "Chontales • Serranías Ganaderas",
      category: "folklore",
      categoryName: "Folklore Tradicional",
      genre: "Son Campesino",
      duration: "2:55",
      durationSec: 175,
      cover: "assets/images/destinos/cascada_la_luna.jpg",
      notes: [440.00, 493.88, 523.25, 659.25, 587.33, 523.25, 493.88, 440.00, 523.25, 659.25]
    },
    {
      id: "zanatillo",
      title: "El Zanatillo",
      artist: "Tradición Campesina",
      territory: "Las Segovias • Norte",
      category: "folklore",
      categoryName: "Folklore Tradicional",
      genre: "Son Norteño",
      duration: "2:40",
      durationSec: 160,
      cover: "assets/images/destinos/canon_de_somoto.jpg",
      notes: [392.00, 440.00, 523.25, 587.33, 659.25, 587.33, 523.25, 440.00, 392.00]
    },
    {
      id: "palomita-guasiruca",
      title: "Palomita Guasiruca",
      artist: "Recopilación Folclórica",
      territory: "Matagalpa & Boaco",
      category: "folklore",
      categoryName: "Folklore Tradicional",
      genre: "Danza Tradicional",
      duration: "3:05",
      durationSec: 185,
      cover: "assets/images/destinos/selva_negra.jpg",
      notes: [523.25, 587.33, 659.25, 523.25, 783.99, 659.25, 587.33, 523.25, 440.00, 523.25]
    },

    // ------------------------------------------------------------------------
    // MÚSICA REVOLUCIONARIA & CANCIÓN HISTÓRICA
    // ------------------------------------------------------------------------
    {
      id: "tumba-guerrillero",
      title: "La Tumba del Guerrillero",
      artist: "Carlos Mejía Godoy y Los de Palacagüina",
      territory: "Madriz / Las Segovias • Memoria Viva",
      category: "revolucion",
      categoryName: "Canción Revolucionaria",
      genre: "Canción Testimonial",
      duration: "3:42",
      durationSec: 222,
      cover: "assets/images/destinos/canon_de_somoto.jpg",
      notes: [440.00, 523.25, 659.25, 587.33, 523.25, 440.00, 392.00, 440.00, 523.25, 659.25]
    },
    {
      id: "alla-va-general",
      title: "Allá Va el General",
      artist: "Homenaje a Sandino",
      territory: "Niquinohomo • Masaya",
      category: "revolucion",
      categoryName: "Canción Revolucionaria",
      genre: "Canto Patriótico",
      duration: "3:20",
      durationSec: 200,
      cover: "assets/images/destinos/Fortaleza de la Inmaculada Concepción.jpg",
      notes: [392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25]
    },
    {
      id: "nicaragua-nicaragüita",
      title: "Nicaragua, Nicaragüita",
      artist: "Carlos Mejía Godoy",
      territory: "Territorio Nacional • Soberanía",
      category: "revolucion",
      categoryName: "Canción Revolucionaria",
      genre: "Himno de Esperanza",
      duration: "3:10",
      durationSec: 190,
      cover: "assets/images/destinos/isla_de_ometepe.jpg",
      notes: [523.25, 659.25, 783.99, 880.00, 1046.50, 880.00, 783.99, 659.25, 587.33, 523.25]
    },
    {
      id: "son-chinchibi",
      title: "Son Chinchibí (Insurrección)",
      artist: "Los de Palacagüina",
      territory: "León • Primera Capital",
      category: "revolucion",
      categoryName: "Canción Revolucionaria",
      genre: "Son Revolucionario",
      duration: "2:50",
      durationSec: 170,
      cover: "assets/images/destinos/cerro_negro.jpg",
      notes: [440.00, 523.25, 587.33, 659.25, 587.33, 523.25, 493.88, 440.00]
    },
    {
      id: "no-pasaran",
      title: "No Pasarán",
      artist: "Canto Histórico de Soberanía",
      territory: "Estelí • Tres Veces Heroica",
      category: "revolucion",
      categoryName: "Canción Revolucionaria",
      genre: "Canto de Resistencia",
      duration: "3:30",
      durationSec: 210,
      cover: "assets/images/destinos/cascada_la_luna.jpg",
      notes: [523.25, 587.33, 659.25, 783.99, 880.00, 783.99, 659.25, 587.33, 523.25]
    },
    {
      id: "la-consigna",
      title: "La Consigna",
      artist: "Pancasan & Militancia Popular",
      territory: "Managua • Héroes y Mártires",
      category: "revolucion",
      categoryName: "Canción Revolucionaria",
      genre: "Himno Popular",
      duration: "3:00",
      durationSec: 180,
      cover: "assets/images/destinos/Calle La Calzada & Zona Bohemia.jpg",
      notes: [392.00, 440.00, 523.25, 659.25, 587.33, 440.00, 392.00, 440.00, 523.25]
    },

    // ------------------------------------------------------------------------
    // PALO DE MAYO & RITMOS CARIBEÑOS
    // ------------------------------------------------------------------------
    {
      id: "maypole-tululu",
      title: "Tululu (Maypole Ancestral)",
      artist: "Tradición Creole & Miskita",
      territory: "Bluefields • RACCS",
      category: "caribe",
      categoryName: "Caribe Afrodescendiente",
      genre: "Palo de Mayo Tradicional",
      duration: "3:40",
      durationSec: 220,
      cover: "assets/images/destinos/corn_island.jpg",
      notes: [523.25, 659.25, 783.99, 880.00, 987.77, 880.00, 783.99, 659.25, 783.99, 880.00]
    },
    {
      id: "welcome-bluefields",
      title: "Welcome to Bluefields",
      artist: "Dimensión Costeña",
      territory: "Bluefields & Corn Island",
      category: "caribe",
      categoryName: "Caribe Afrodescendiente",
      genre: "Ritmo Caribeño",
      duration: "3:15",
      durationSec: 195,
      cover: "assets/images/destinos/corn_island.jpg",
      notes: [587.33, 659.25, 783.99, 880.00, 659.25, 783.99, 587.33, 523.25]
    },

    // ------------------------------------------------------------------------
    // POLKAS & MAZURCAS DEL NORTE
    // ------------------------------------------------------------------------
    {
      id: "grito-del-bolo",
      title: "El Grito del Bolo",
      artist: "Don Felipe Urrutia y Sus Cachorros",
      territory: "Estelí & Jinotega",
      category: "norte",
      categoryName: "Polkas & Mazurcas del Norte",
      genre: "Mazurca Segoviana",
      duration: "2:45",
      durationSec: 165,
      cover: "assets/images/destinos/selva_negra.jpg",
      notes: [440.00, 523.25, 659.25, 587.33, 523.25, 493.88, 440.00, 392.00, 440.00]
    },
    {
      id: "flor-de-pino",
      title: "Flor de Pino",
      artist: "Soñadores de Saraguasca",
      territory: "Jinotega • Brumas del Norte",
      category: "norte",
      categoryName: "Polkas & Mazurcas del Norte",
      genre: "Polka Campesina",
      duration: "2:50",
      durationSec: 170,
      cover: "assets/images/destinos/cascada_la_luna.jpg",
      notes: [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 440.00, 523.25]
    }
  ];

  // Variables de Estado
  let currentTrackIndex = 0;
  let isPlaying = false;
  let isShuffle = false;
  let isRepeat = false;
  let isMuted = false;
  let volume = 0.85;
  let currentSec = 0;
  let trackTimer = null;
  let activeCategory = 'all';

  // Audio Context y Sintetizador
  let audioCtx = null;
  let activeGainNode = null;
  let notePlaybackTimer = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (AudioClass) {
        audioCtx = new AudioClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Reproductor de notas de marimba & guitarra campesina
  function synthesizeNote(freq, startTime, duration = 0.38) {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Tono marimba de arco (madera acústica)
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);

    // Armónico cálido
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, startTime);

    const actualVol = isMuted ? 0 : volume * 0.4;
    gainNode.gain.setValueAtTime(0.001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(actualVol, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
  }

  function loopMelodyNotes(notes) {
    if (!isPlaying) return;
    const ctx = getAudioContext();
    if (!ctx || !notes || !notes.length) return;

    const now = ctx.currentTime + 0.05;
    const noteStep = 0.3;

    notes.forEach((freq, idx) => {
      synthesizeNote(freq, now + (idx * noteStep), 0.35);
    });

    const loopTimeMs = (notes.length * noteStep + 0.6) * 1000;
    notePlaybackTimer = setTimeout(() => {
      if (isPlaying) {
        loopMelodyNotes(notes);
      }
    }, loopTimeMs);
  }

  function stopAudioSynthesis() {
    if (notePlaybackTimer) {
      clearTimeout(notePlaybackTimer);
      notePlaybackTimer = null;
    }
  }

  // Formato de segundos a mm:ss
  function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }

  // Inicialización de la Interfaz del Reproductor
  function initEpicMusicPlayer() {
    const chassis = document.getElementById('epicPlayerChassis');
    if (!chassis) return;

    // Elementos DOM
    const playBtn = document.getElementById('epicPlayBtn');
    const prevBtn = document.getElementById('epicPrevBtn');
    const nextBtn = document.getElementById('epicNextBtn');
    const shuffleBtn = document.getElementById('epicShuffleBtn');
    const repeatBtn = document.getElementById('epicRepeatBtn');
    const scrubber = document.getElementById('epicScrubber');
    const currTimeEl = document.getElementById('epicCurrentTime');
    const durTimeEl = document.getElementById('epicDurationTime');
    const volumeSlider = document.getElementById('epicVolumeSlider');
    const muteBtn = document.getElementById('epicMuteBtn');
    const vinylLabelImg = document.getElementById('epicVinylImg');

    const trackTitleEl = document.getElementById('epicTrackTitle');
    const trackArtistEl = document.getElementById('epicTrackArtist');
    const trackTerritoryEl = document.getElementById('epicTrackTerritory');
    const trackGenreEl = document.getElementById('epicTrackGenre');
    const playlistContainer = document.getElementById('epicPlaylistGrid');
    const tabButtons = document.querySelectorAll('.epic-tab-btn');

    // Cargar pista en la interfaz
    function loadTrack(index, autoPlay = false) {
      if (index < 0) index = EPIC_TRACKS.length - 1;
      if (index >= EPIC_TRACKS.length) index = 0;
      currentTrackIndex = index;
      const track = EPIC_TRACKS[currentTrackIndex];

      trackTitleEl.textContent = track.title;
      trackArtistEl.innerHTML = `<i class="fa-solid fa-microphone-lines"></i> ${track.artist}`;
      trackTerritoryEl.textContent = `• ${track.territory}`;
      trackGenreEl.innerHTML = `<i class="fa-solid fa-tag"></i> ${track.genre}`;
      durTimeEl.textContent = track.duration;

      if (vinylLabelImg) {
        vinylLabelImg.src = track.cover;
        vinylLabelImg.alt = track.title;
      }

      currentSec = 0;
      scrubber.value = 0;
      currTimeEl.textContent = "0:00";

      updateActivePlaylistItem();

      if (autoPlay) {
        startPlay();
      } else if (isPlaying) {
        stopAudioSynthesis();
        loopMelodyNotes(track.notes);
      }
    }

    function startPlay() {
      getAudioContext();
      isPlaying = true;
      chassis.classList.add('is-playing');
      playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      playBtn.title = "Pausar";

      stopAudioSynthesis();
      const track = EPIC_TRACKS[currentTrackIndex];
      loopMelodyNotes(track.notes);

      if (trackTimer) clearInterval(trackTimer);
      trackTimer = setInterval(() => {
        currentSec++;
        if (currentSec >= track.durationSec) {
          if (isRepeat) {
            currentSec = 0;
          } else {
            nextTrack(true);
            return;
          }
        }
        currTimeEl.textContent = formatTime(currentSec);
        scrubber.value = (currentSec / track.durationSec) * 100;
      }, 1000);
    }

    function pausePlay() {
      isPlaying = false;
      chassis.classList.remove('is-playing');
      playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      playBtn.title = "Reproducir";
      stopAudioSynthesis();
      if (trackTimer) {
        clearInterval(trackTimer);
        trackTimer = null;
      }
    }

    function togglePlay() {
      if (isPlaying) {
        pausePlay();
      } else {
        startPlay();
      }
    }

    function nextTrack(auto = false) {
      if (isShuffle) {
        let randIdx = Math.floor(Math.random() * EPIC_TRACKS.length);
        if (randIdx === currentTrackIndex && EPIC_TRACKS.length > 1) {
          randIdx = (randIdx + 1) % EPIC_TRACKS.length;
        }
        loadTrack(randIdx, isPlaying || auto);
      } else {
        loadTrack(currentTrackIndex + 1, isPlaying || auto);
      }
    }

    function prevTrack() {
      if (currentSec > 4) {
        currentSec = 0;
        scrubber.value = 0;
        currTimeEl.textContent = "0:00";
      } else {
        loadTrack(currentTrackIndex - 1, isPlaying);
      }
    }

    // Renderizado de lista de reproducción
    function renderPlaylist(filterCategory = 'all') {
      playlistContainer.innerHTML = '';
      EPIC_TRACKS.forEach((track, idx) => {
        if (filterCategory !== 'all' && track.category !== filterCategory) {
          return;
        }
        const card = document.createElement('div');
        card.className = `epic-track-card ${idx === currentTrackIndex ? 'is-active' : ''}`;
        card.setAttribute('data-index', idx);
        card.innerHTML = `
          <div class="epic-track-card-thumb">
            <img src="${track.cover}" alt="${track.title}" loading="lazy">
            <div class="epic-track-card-play-overlay">
              <i class="fa-solid fa-play"></i>
            </div>
          </div>
          <div class="epic-track-card-info">
            <h4 class="epic-track-card-name">${track.title}</h4>
            <div class="epic-track-card-meta">${track.artist} • ${track.categoryName}</div>
          </div>
          <div class="epic-track-card-time">${track.duration}</div>
        `;
        card.addEventListener('click', () => {
          loadTrack(idx, true);
        });
        playlistContainer.appendChild(card);
      });
    }

    function updateActivePlaylistItem() {
      const items = playlistContainer.querySelectorAll('.epic-track-card');
      items.forEach(card => {
        const idx = parseInt(card.getAttribute('data-index'), 10);
        if (idx === currentTrackIndex) {
          card.classList.add('is-active');
        } else {
          card.classList.remove('is-active');
        }
      });
    }

    // Eventos
    playBtn.addEventListener('click', togglePlay);
    nextBtn.addEventListener('click', () => nextTrack(false));
    prevBtn.addEventListener('click', prevTrack);

    shuffleBtn.addEventListener('click', () => {
      isShuffle = !isShuffle;
      shuffleBtn.classList.toggle('is-active', isShuffle);
    });

    repeatBtn.addEventListener('click', () => {
      isRepeat = !isRepeat;
      repeatBtn.classList.toggle('is-active', isRepeat);
    });

    scrubber.addEventListener('input', (e) => {
      const track = EPIC_TRACKS[currentTrackIndex];
      const pct = parseFloat(e.target.value);
      currentSec = Math.floor((pct / 100) * track.durationSec);
      currTimeEl.textContent = formatTime(currentSec);
    });

    volumeSlider.addEventListener('input', (e) => {
      volume = parseFloat(e.target.value);
      if (volume === 0) {
        isMuted = true;
        muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
      } else {
        isMuted = false;
        muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      }
    });

    muteBtn.addEventListener('click', () => {
      isMuted = !isMuted;
      if (isMuted) {
        muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
      } else {
        muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      }
    });

    // Filtros de categoría de playlist
    tabButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        tabButtons.forEach(b => b.classList.remove('is-active'));
        this.classList.add('is-active');
        const filter = this.getAttribute('data-category');
        activeCategory = filter;
        renderPlaylist(filter);
      });
    });

    // Exponer API global
    window.BaqueanoEpicPlayer = {
      playTrackById: function(trackId) {
        const idx = EPIC_TRACKS.findIndex(t => t.id === trackId || t.title.toLowerCase().includes(trackId.toLowerCase()));
        if (idx !== -1) {
          loadTrack(idx, true);
          chassis.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      },
      getCurrentTrack: function() {
        return EPIC_TRACKS[currentTrackIndex];
      }
    };

    // Inicializar estado por defecto
    renderPlaylist('all');
    loadTrack(0, false);
  }

  // Inicializar al cargar DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEpicMusicPlayer);
  } else {
    initEpicMusicPlayer();
  }
})();
