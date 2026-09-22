// ============================================================================
// 🧭 BAQUEANO — ARCHIVO SONORO DOCUMENTAL (epic-music-player.js)
// ============================================================================
// 🎯 POR QUÉ: preservar y hacer reproducibles los 93 MP3 sin convertir el nombre
// del archivo en una atribución autoral. Una ausencia documental nunca se rellena.
// ⚙️ CÓMO: inventario inmutable + reglas explícitas de catalogación verificada;
// el resto conserva su audio con estado "Pendiente de documentación". El motor usa
// un único HTMLAudioElement, libera la fuente anterior y actualiza una UI accesible.
// 📦 QUÉ: reproductor, búsqueda/filtros, estado editorial y API pública para abrir
// cualquier pista del archivo desde las fichas culturales verificadas.
// ============================================================================

(function () {
  'use strict';

  const AUDIO_FILES = [
    "Alforja Campesina.mp3", "Ama la Naturaleza.mp3", "Amores de Abraham - Vals de Jose de la Crz Mena.mp3",
    "Araré el Aire (con Alejandra Acuña y Katia Cardenal).mp3", "ASI ES LA VIDA.mp3", "Baila Mi Palo.mp3",
    "baile_del_mestizaje.mp3", "Barrio De Pescadores - Trio Monimbo Erwin, Carlos Kruger Pepe Ramirez.mp3",
    "Caballito Chontaleno.mp3", "Caliente Como Verano.mp3", "Camilo Zapata, Minga Rosa Pineda.mp3",
    "Cancion de Cuna.mp3", "Canción del Fuego.mp3", "CANCIONERO.mp3",
    "Cascada de Perlas - Alejandro Vega Matus.mp3", "Cocibolca.mp3", "Cole Cole.mp3", "COMO TE VA NU AMOR.mp3",
    "Como Tinaja.mp3", "Corrido a Chinandega.mp3", "CORRIDO A MANAGUA de Tino López Guerra, nueva versión 2026.mp3",
    "Cuando Venga La Paz.mp3", "Cumbia Piquetona.mp3", "Cumbia Sabrosa.mp3", "Dale Su Rondón.mp3",
    "Dale Una Luz.mp3", "Dias de Amar.mp3", "Dimension Costena - The Bluefields Express.mp3",
    "El cachimbeo.mp3", "El Grito del bolo - Polka.mp3", "EL ZANATILLO (Nicaragua Música y Canto).mp3",
    "El Zenzontle Pregunta Por Arlen.mp3", "el_solar_de_monimbo.mp3", "el_zanatillo.mp3", "EN EL MISMO TREN.mp3",
    "ENTRE REMOLINOS.mp3", "Fiebre Costeña.mp3", "Fiesta Pinolera.mp3", "Flor de Mi Colina Camilo Zapata.mp3",
    "Flor De Pino.mp3", "Folklore - La Danza Negra.mp3", "Gracias a la Vida - Norma Helena (Gadea Nicaraguense).mp3",
    "Guerrero del Amor.mp3", "INSOPORTABLEMENTE BELLA.mp3", "La Cachimba.mp3",
    "La Candona Chinamera - Fuzion 4 (Audio Oficial).mp3", "La canoa rancha.mp3", "La Consigna.mp3",
    "La mama Ramona - Marimba de arco Masaya.mp3", "La Minifalda.mp3", "La negra cumbianbera.mp3",
    "La pelo de maiz Otto de la Rocha.mp3", "La Sutiabeña ♪♫♪ Camilo Zapata Letra.mp3", "La Tonadita.mp3",
    "La Tula Cuecho.mp3", "La tumba del guerrillero.mp3", "la_mora_limpia.mp3",
    "Los Alegres de Ticuantepe El Sapo.mp3", "Luis Enrique Mejía Godoy - Amando En Tiempo De Guerra.mp3",
    "Managua, Linda Managua.mp3", "Mari Cañamo.mp3", "Maria de los Guardias.mp3",
    "Mariposa de alas rotas (versión acústica 2004).mp3", "MAYAYA LA SINKY.mp3", "Meneadito.mp3",
    "Mi Canción.mp3", "Muevelo.mp3", "Nicaragua Mia, Tino López Guerra.mp3", "nicaragua,nicaraguita.mp3",
    "No Pasaran- norma elena.mp3", "No Pasarán.mp3", "Pajarita de la Paz.mp3", "palomita_guasiruca.mp3",
    "Para Ti (with Luis Enrique Mejia Godoy).mp3", "Pobre La María Luis Enrique Mejía Godoy.mp3", "Polka Cumbia.mp3",
    "PROCURO OLVIDARTE.mp3", "QUIERO QUE SEPAS.mp3", "Quincho Barrilete.mp3", "ROMPER EL SILENCIO.mp3",
    "Rosalia - Vals de Jose de la Cruz Mena.mp3", "Ruinas - Vals de Jose de la Cruz Mena.mp3",
    "Sabroso Palo de Mayo.mp3", "Se Rompen Los Fuegos.mp3", "Son Tus Perjúmenes Mujer.mp3", "TULULU.mp3",
    "Tulululu.mp3", "Una Canción.mp3", "Verde Verdad.mp3", "Y Sigue El Rancho Ardiendo.mp3",
    "YO NO SE MAÑANA.mp3", "Yo soy de un Pueblo Sencillo Luis y carlos Mejia Godoy.mp3", "🔊Sones del Güegüense.mp3"
  ];

  const VERIFIED = [
    [/^Alforja Campesina/i, "Alforja Campesina", "Carlos Mejía Godoy", "Composición", "Madriz"],
    [/^Amores de Abraham/i, "Amores de Abraham", "José de la Cruz Mena", "Composición", "León"],
    [/^Araré el Aire/i, "Araré el Aire", "Alejandra Acuña y Katia Cardenal", "Interpretación compartida", "Nicaragua"],
    [/^ASI ES LA VIDA/i, "Así es la vida", "Luis Enrique Mejía López", "Interpretación", "Somoto"],
    [/^Barrio De Pescadores/i, "Barrio de pescadores", "Erwin Krüger · Trío Monimbó", "Composición e interpretación", "León"],
    [/^Caballito Chontaleno/i, "Caballito Chontaleño", "Camilo Zapata", "Composición", "Managua"],
    [/^Camilo Zapata, Minga/i, "Minga Rosa Pineda", "Camilo Zapata", "Composición", "Managua"],
    [/^CANCIONERO/i, "Cancionero", "Hernaldo Zúñiga", "Repertorio autoral", "Nicaragua"],
    [/^Cascada de Perlas/i, "Cascada de Perlas", "Alejandro Vega Matus", "Composición", "Masaya"],
    [/^Corrido a Chinandega/i, "Corrido a Chinandega", "Tino López Guerra", "Composición", "Chinandega"],
    [/^CORRIDO A MANAGUA/i, "Corrido a Managua — versión 2026", "Tino López Guerra", "Composición · versión identificada", "Managua"],
    [/^Dale Su Rondón/i, "Dale su rondón", "Dimensión Costeña", "Repertorio verificado", "Bluefields"],
    [/^Dias de Amar/i, "Días de amar", "Dúo Guardabarranco", "Composición: Salvador Cardenal", "Managua"],
    [/^Dimension Costena/i, "The Bluefields Express", "Dimensión Costeña", "Repertorio verificado", "Bluefields"],
    [/^El Zenzontle/i, "El Zenzontle pregunta por Arlen", "Intérprete por confirmar", "Composición: Luis Enrique Mejía Godoy", "Nicaragua"],
    [/^el_solar/i, "El Solar de Monimbó", "Camilo Zapata", "Composición", "Masaya"],
    [/^ENTRE REMOLINOS/i, "Entre remolinos", "Perrozompopo", "Repertorio autoral", "Managua"],
    [/^Fiebre Costeña/i, "Fiebre Costeña", "Dimensión Costeña", "Repertorio verificado", "Bluefields"],
    [/^Flor de Mi Colina/i, "Flor de mi colina", "Camilo Zapata", "Composición", "Managua"],
    [/^Guerrero del Amor/i, "Guerrero del amor", "Dúo Guardabarranco", "Repertorio de Guardabarranco", "Managua"],
    [/^INSOPORTABLEMENTE/i, "Insoportablemente bella", "Hernaldo Zúñiga", "Interpretación · autores: Manuel Alejandro y Ana Magdalena", "Nicaragua"],
    [/^La mama Ramona/i, "La Mama Ramona", "Marimba de arco de Masaya", "Tradición · arreglo de Alejandro Vega Matus c. 1920", "Masaya"],
    [/^La Minifalda/i, "La Minifalda", "Dimensión Costeña", "Repertorio verificado", "Bluefields"],
    [/^La Sutiabeña/i, "La Sutiabeña", "Camilo Zapata", "Composición", "León"],
    [/^La Tula Cuecho/i, "La Tula Cuecho", "Carlos Mejía Godoy", "Composición", "Nicaragua"],
    [/^La tumba/i, "La tumba del guerrillero", "Carlos Mejía Godoy", "Repertorio autoral", "Nicaragua"],
    [/^la_mora/i, "La Mora Limpia", "Justo Santos", "Composición", "Rivas"],
    [/^Luis Enrique Mejía Godoy/i, "Amando en tiempo de guerra", "Luis Enrique Mejía Godoy", "Repertorio autoral", "Somoto"],
    [/^Mari Cañamo/i, "Mari Cañamo", "Dimensión Costeña", "Repertorio verificado", "Bluefields"],
    [/^Maria de los Guardias/i, "María de los Guardias", "Carlos Mejía Godoy", "Composición", "Nicaragua"],
    [/^Mariposa de alas rotas/i, "Mariposa de alas rotas — acústica 2004", "Katia Cardenal", "Interpretación identificada", "Managua"],
    [/^MAYAYA/i, "Mayaya La Sinky", "Dimensión Costeña", "Interpretación identificada", "Bluefields"],
    [/^Nicaragua Mia/i, "Nicaragua Mía", "Tino López Guerra", "Composición", "Chinandega"],
    [/^nicaragua,nicaraguita/i, "Nicaragua, Nicaragüita", "Carlos Mejía Godoy", "Composición", "Nicaragua"],
    [/^Pajarita de la Paz/i, "Pajarita de la Paz", "Norma Helena Gadea", "Interpretación identificada", "Nicaragua"],
    [/^palomita/i, "Palomita Guasiruca", "Tradición de Chontales · recopilación de Erwin Krüger", "Folclore recopilado", "Chontales"],
    [/^Para Ti/i, "Para ti", "Norma Helena Gadea y Luis Enrique Mejía Godoy", "Interpretación compartida · autoría por confirmar", "Nicaragua"],
    [/^Pobre La María/i, "Pobre la María", "Luis Enrique Mejía Godoy", "Composición", "Somoto"],
    [/^PROCURO/i, "Procuro olvidarte", "Hernaldo Zúñiga", "Interpretación · autores: Manuel Alejandro y Ana Magdalena", "Nicaragua"],
    [/^QUIERO QUE SEPAS/i, "Quiero que sepas", "Perrozompopo", "Repertorio autoral", "Managua"],
    [/^Quincho Barrilete/i, "Quincho Barrilete", "Carlos Mejía Godoy", "Composición · interpretación de Guayo González en OTI 1977", "Somoto"],
    [/^ROMPER EL SILENCIO/i, "Romper el silencio", "Perrozompopo", "Repertorio autoral", "Managua"],
    [/^Rosalia/i, "Rosalía", "José de la Cruz Mena", "Composición", "León"],
    [/^Ruinas/i, "Ruinas", "José de la Cruz Mena", "Composición", "León"],
    [/^Sabroso Palo/i, "Sabroso Palo de Mayo", "Dimensión Costeña", "Repertorio verificado", "Bluefields"],
    [/^Son Tus Perjúmenes/i, "Son tus perjúmenes, mujer", "Carlos Mejía Godoy", "Interpretación · folclore recopilado en Tonalá", "Chinandega"],
    [/^(TULULU|Tulululu)/, "Tululu", "Dimensión Costeña", "Interpretación identificada · versiones por comparar", "Bluefields"],
    [/^Verde Verdad/i, "Verde verdad", "Salvador Cardenal", "Proyecto solista póstumo", "Managua"],
    [/^YO NO SE/i, "Yo no sé mañana", "Luis Enrique Mejía López", "Interpretación · autores: Jorge Luis Piloto y Jorge Villamizar", "Somoto"],
    [/^Yo soy de un Pueblo/i, "Yo soy de un pueblo sencillo", "Luis Enrique Mejía Godoy", "Composición · grabación compartida", "Somoto"],
    [/Sones del Güegüense/i, "Sones del Güegüense", "Tradición de El Güegüense", "Colección conjunta · Patrimonio UNESCO", "Diriamba, Carazo"]
  ];

  const cleanTitle = file => file.replace(/\.mp3$/i, '').replace(/_/g, ' ').replace(/^🔊/, '').trim();
  const tracks = AUDIO_FILES.map((file, index) => {
    const match = VERIFIED.find(rule => rule[0].test(file));
    return {
      id: `archivo-${index + 1}`,
      file,
      title: match ? match[1] : cleanTitle(file),
      artist: match ? match[2] : "Créditos por documentar",
      credit: match ? match[3] : "Sin atribución editorial",
      territory: match ? match[4] : "Procedencia por documentar",
      verified: Boolean(match),
      src: `assets/audio/${encodeURIComponent(file).replace(/%2F/gi, '/')}`
    };
  });

  let currentIndex = 0;
  let activeFilter = 'all';
  const audio = new Audio();
  audio.preload = 'metadata';

  const byId = id => document.getElementById(id);
  const formatTime = seconds => Number.isFinite(seconds) ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}` : '0:00';

  function visibleTracks() {
    return tracks.filter(track => activeFilter === 'all' || (activeFilter === 'verified' ? track.verified : !track.verified));
  }

  function setPlayingUi(playing) {
    const chassis = byId('epicPlayerChassis');
    const button = byId('epicPlayBtn');
    if (chassis) chassis.classList.toggle('is-playing', playing);
    if (button) button.innerHTML = `<i class="fa-solid fa-${playing ? 'pause' : 'play'}"></i>`;
  }

  function loadTrack(index, autoplay = false) {
    currentIndex = Math.max(0, Math.min(index, tracks.length - 1));
    const track = tracks[currentIndex];
    audio.pause();
    audio.src = track.src;
    audio.load();
    byId('epicTrackTitle').textContent = track.title;
    byId('epicTrackArtist').innerHTML = `<i class="fa-solid fa-microphone-lines"></i> ${track.artist}`;
    byId('epicTrackTerritory').textContent = `• ${track.territory}`;
    byId('epicTrackGenre').innerHTML = `<i class="fa-solid fa-${track.verified ? 'circle-check' : 'clock'}"></i> ${track.verified ? 'Ficha verificada' : 'Pendiente de documentación'}`;
    byId('epicDurationTime').textContent = '0:00';
    byId('epicCurrentTime').textContent = '0:00';
    byId('epicScrubber').value = 0;
    renderPlaylist();
    if (autoplay) audio.play().catch(() => setPlayingUi(false));
  }

  function renderPlaylist() {
    const grid = byId('epicPlaylistGrid');
    if (!grid) return;
    const visible = visibleTracks();
    grid.innerHTML = visible.map(track => {
      const index = tracks.indexOf(track);
      return `<button type="button" class="epic-track-card ${index === currentIndex ? 'is-active' : ''}" data-track-index="${index}">
        <span class="epic-track-card-thumb" aria-hidden="true"><i class="fa-solid fa-${track.verified ? 'circle-check' : 'compact-disc'}"></i></span>
        <span class="epic-track-card-info"><strong class="epic-track-card-name">${track.title}</strong><span class="epic-track-card-meta">${track.artist} · ${track.credit}</span></span>
        <span class="epic-track-card-time">${track.verified ? 'Verificada' : 'En revisión'}</span>
      </button>`;
    }).join('');
    grid.querySelectorAll('[data-track-index]').forEach(button => button.addEventListener('click', () => loadTrack(Number(button.dataset.trackIndex), true)));
  }

  function step(direction) {
    const pool = visibleTracks();
    const current = pool.findIndex(track => track === tracks[currentIndex]);
    const next = pool[(current + direction + pool.length) % pool.length] || tracks[0];
    loadTrack(tracks.indexOf(next), true);
  }

  function init() {
    const player = byId('epicMusicPlayer');
    if (!player) return;
    player.querySelector('.epic-playlist-tabs').innerHTML = `
      <button type="button" class="epic-tab-btn is-active" data-status="all"><i class="fa-solid fa-box-archive"></i> Archivo completo (${tracks.length})</button>
      <button type="button" class="epic-tab-btn" data-status="verified"><i class="fa-solid fa-circle-check"></i> Con ficha (${tracks.filter(t => t.verified).length})</button>
      <button type="button" class="epic-tab-btn" data-status="pending"><i class="fa-solid fa-clock"></i> Por documentar (${tracks.filter(t => !t.verified).length})</button>`;
    player.querySelectorAll('[data-status]').forEach(button => button.addEventListener('click', () => {
      activeFilter = button.dataset.status;
      player.querySelectorAll('[data-status]').forEach(item => item.classList.toggle('is-active', item === button));
      renderPlaylist();
    }));
    byId('epicPlayBtn').addEventListener('click', () => audio.paused ? audio.play() : audio.pause());
    byId('epicPrevBtn').addEventListener('click', () => step(-1));
    byId('epicNextBtn').addEventListener('click', () => step(1));
    byId('epicMuteBtn').addEventListener('click', () => { audio.muted = !audio.muted; });
    byId('epicVolumeSlider').addEventListener('input', event => { audio.volume = Number(event.target.value); });
    byId('epicScrubber').addEventListener('input', event => { if (Number.isFinite(audio.duration)) audio.currentTime = audio.duration * Number(event.target.value) / 100; });
    audio.addEventListener('play', () => setPlayingUi(true));
    audio.addEventListener('pause', () => setPlayingUi(false));
    audio.addEventListener('ended', () => step(1));
    audio.addEventListener('loadedmetadata', () => { byId('epicDurationTime').textContent = formatTime(audio.duration); });
    audio.addEventListener('timeupdate', () => {
      byId('epicCurrentTime').textContent = formatTime(audio.currentTime);
      byId('epicScrubber').value = Number.isFinite(audio.duration) && audio.duration > 0 ? (audio.currentTime / audio.duration) * 100 : 0;
    });
    audio.addEventListener('error', () => setPlayingUi(false));
    audio.volume = Number(byId('epicVolumeSlider').value);
    loadTrack(0);
  }

  window.BaqueanoArchive = {
    tracks,
    hasVerifiedTitle(title) {
      const query = String(title || '').toLocaleLowerCase('es');
      return tracks.some(track => track.verified && (track.title.toLocaleLowerCase('es').includes(query) || query.includes(track.title.toLocaleLowerCase('es'))));
    },
    playByTitle(title) {
      const query = String(title || '').toLocaleLowerCase('es');
      const index = tracks.findIndex(track => track.verified && (track.title.toLocaleLowerCase('es').includes(query) || query.includes(track.title.toLocaleLowerCase('es'))));
      if (index >= 0) loadTrack(index, true);
      return index >= 0;
    }
  };

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
