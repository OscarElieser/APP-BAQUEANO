// ============================================================================
// BAQUEANO — REPRODUCTOR SONORO PERSISTENTE GLOBAL
// ============================================================================
// 🎯 POR QUÉ: mantener accesible la música elegida cuando el visitante sale de Música.
// ⚙️ CÓMO: recupera el estado de sesión, crea una barra flotante y sincroniza audio,
//    progreso, volumen y navegación entre pistas sin bloquear la página actual.
// 📦 QUÉ: reproductor global con pausa, anterior, siguiente, cierre y regreso al archivo.
// ============================================================================
(function () {
  'use strict';
  if (document.body.classList.contains('page-musica-exact') || document.getElementById('stickyMusicBar')) return;

  var KEY = 'baqueano_music_session_v1';
  var tracks = [
    { title:'La Mora Limpia', artist:'Justo Santos', file:'la_mora_limpia.mp3', image:'assets/artistas/justo santos.jpg' },
    { title:'Son de Mi Tierra', artist:'Tradición nicaragüense', file:'Fiesta Pinolera.mp3', image:'assets/images/PROPUESTA/NICARAGUA AUTENTICA.png' },
    { title:'Sirena del Lago', artist:'Camilo Zapata', file:'Cocibolca.mp3', image:'assets/artistas/camilo zapata.jpg' },
    { title:'Nicaragua Nicaragüita', artist:'Carlos Mejía Godoy', file:'nicaragua,nicaraguita.mp3', image:'assets/artistas/carlos mejia godoy.jpg' },
    { title:'El Solar de Monimbó', artist:'Luis Enrique Mejía Godoy', file:'el_solar_de_monimbo.mp3', image:'assets/artistas/Luis Enrique Mejía Godoy.jpg' },
    { title:'Palo de Mayo', artist:'Tradición caribeña', file:'Sabroso Palo de Mayo.mp3', image:'assets/artistas/Dimensión Costeña.jpg' },
    { title:'Danza del Güegüense', artist:'Folclor Nacional', file:'🔊Sones del Güegüense.mp3', image:'assets/artistas/Música de El Güegüense.jpg' }
  ];
  function readState() { try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (error) { return null; } }
  var state = readState();
  if (!state || !state.started || state.dismissed) return;
  // 2026-10-07: Música ya reproduce las 93 grabaciones del archivo; la sesión guarda el archivo exacto.
  if (state.file && typeof state.file === 'string' && /^[^\/\\]+\.mp3$/i.test(state.file)) {
    var found = tracks.findIndex(function (track) { return track.file === state.file; });
    if (found < 0) { tracks.push({ title: String(state.title || ''), artist: String(state.artist || ''), file: state.file, image: typeof state.image === 'string' && /^assets\//.test(state.image) ? state.image : 'assets/images/destinos/volcan_masaya.jpg' }); found = tracks.length - 1; }
    state.index = found;
  }
  var index = Math.max(0, Math.min(tracks.length - 1, Number(state.index) || 0));
  var audio = new Audio();
  audio.preload = 'metadata';

  var style = document.createElement('style');
  style.id = 'bq-global-music-style';
  style.textContent = '.bq-music-dock{position:fixed;z-index:2147480000;left:50%;right:auto;transform:translateX(-50%);width:min(600px,calc(100vw - 36px));bottom:16px;min-height:58px;display:grid;grid-template-columns:minmax(120px,1fr) auto minmax(120px,1fr) auto;align-items:center;gap:12px;padding:8px 12px;background:#0B253A;color:#fff;border:1px solid rgba(244,230,193,.2);border-radius:18px;box-shadow:0 18px 55px rgba(15,23,42,.38);font-family:Inter,system-ui,sans-serif}.bq-music-track{display:flex;align-items:center;gap:11px;min-width:0;text-decoration:none;color:#fff}.bq-music-track img{width:44px;height:44px;border-radius:10px;object-fit:cover}.bq-music-copy{min-width:0}.bq-music-copy strong,.bq-music-copy small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.bq-music-copy strong{font-size:.82rem}.bq-music-copy small{margin-top:3px;color:#AFC0CC;font-size:.68rem}.bq-music-controls{display:flex;align-items:center;gap:7px}.bq-music-btn{display:grid;place-items:center;width:34px;height:34px;border:0;border-radius:50%;background:transparent;color:#D9E3E8;cursor:pointer}.bq-music-btn:hover{background:rgba(255,255,255,.1);color:#fff}.bq-music-play{width:40px;height:40px;background:#fff;color:#0B253A}.bq-music-play:hover{background:#F4E6C1;color:#0B253A}.bq-music-progress{display:grid;grid-template-columns:1fr auto;align-items:center;gap:11px}.bq-music-rail{height:5px;background:rgba(255,255,255,.2);border-radius:99px;cursor:pointer;overflow:hidden}.bq-music-fill{height:100%;width:0;background:#14B8A6;border-radius:inherit}.bq-music-time{font-size:.67rem;color:#AFC0CC;white-space:nowrap}.bq-music-actions{display:flex;align-items:center}.bq-music-link{display:grid;place-items:center;width:34px;height:34px;color:#D9E3E8;text-decoration:none;border-radius:50%}.bq-music-close{font-size:.9rem}@media(max-width:760px){.bq-music-dock{left:50%;right:auto;width:calc(100vw - 16px);bottom:8px;grid-template-columns:minmax(0,1fr) auto auto;gap:8px;padding:9px}.bq-music-progress{grid-column:1/4;grid-row:2}.bq-music-track img{width:38px;height:38px}.bq-music-controls .bq-music-skip:first-child{display:none}.bq-music-link{display:none}}';
  document.head.appendChild(style);

  var dock = document.createElement('aside');
  dock.className = 'bq-music-dock'; dock.setAttribute('aria-label','Reproductor de música persistente');
  dock.innerHTML = '<a class="bq-music-track" href="musica.html" title="Abrir archivo sonoro"><img src="assets/images/destinos/isla_de_ometepe.jpg" alt=""><span class="bq-music-copy"><strong></strong><small></small></span></a><div class="bq-music-controls"><button class="bq-music-btn bq-music-skip" data-step="-1" type="button" aria-label="Canción anterior"><i class="fa-solid fa-backward-step"></i></button><button class="bq-music-btn bq-music-play" type="button" aria-label="Reproducir"><i class="fa-solid fa-play"></i></button><button class="bq-music-btn bq-music-skip" data-step="1" type="button" aria-label="Siguiente canción"><i class="fa-solid fa-forward-step"></i></button></div><div class="bq-music-progress"><div class="bq-music-rail" role="slider" tabindex="0" aria-label="Posición de la canción"><div class="bq-music-fill"></div></div><span class="bq-music-time">0:00 / 0:00</span></div><div class="bq-music-actions"><a class="bq-music-link" href="musica.html#archivoSonoro" aria-label="Abrir lista de reproducción"><i class="fa-solid fa-list"></i></a><button class="bq-music-btn bq-music-close" type="button" aria-label="Cerrar reproductor"><i class="fa-solid fa-xmark"></i></button></div>';
  document.body.appendChild(dock);
  var cover = dock.querySelector('.bq-music-track img'), title = dock.querySelector('strong'), artist = dock.querySelector('small'), icon = dock.querySelector('.bq-music-play i'), fill = dock.querySelector('.bq-music-fill'), time = dock.querySelector('.bq-music-time');
  function format(value) { return Number.isFinite(value) ? Math.floor(value/60) + ':' + String(Math.floor(value%60)).padStart(2,'0') : '0:00'; }
  function save(playing) { try { sessionStorage.setItem(KEY, JSON.stringify({ started:true, dismissed:false, index:index, file:tracks[index].file, title:tracks[index].title, artist:tracks[index].artist, image:tracks[index].image, time:audio.currentTime || 0, playing:playing, updatedAt:Date.now() })); } catch (error) { /* El audio continúa aunque el almacenamiento no esté disponible. */ } }
  function loadTrack(autoplay, restoredTime) {
    var track = tracks[index]; cover.src=track.image;cover.alt=track.artist;title.textContent=track.title; artist.textContent=track.artist; audio.src='assets/audio/'+encodeURIComponent(track.file); audio.load();
    audio.addEventListener('loadedmetadata', function restore() { audio.removeEventListener('loadedmetadata', restore); if (Number.isFinite(restoredTime)) audio.currentTime=Math.min(restoredTime,audio.duration||restoredTime); if (autoplay) audio.play().catch(function(){ save(false); }); }, { once:true });
  }
  function step(direction) { index=(index+direction+tracks.length)%tracks.length; loadTrack(true,0); }
  dock.querySelector('.bq-music-play').addEventListener('click',function(){ audio.paused ? audio.play() : audio.pause(); });
  dock.querySelectorAll('[data-step]').forEach(function(button){ button.addEventListener('click',function(){ step(Number(button.dataset.step)); }); });
  dock.querySelector('.bq-music-rail').addEventListener('click',function(event){ if(!Number.isFinite(audio.duration))return; var box=event.currentTarget.getBoundingClientRect(); audio.currentTime=Math.max(0,Math.min(1,(event.clientX-box.left)/box.width))*audio.duration; });
  dock.querySelector('.bq-music-close').addEventListener('click',function(){ audio.pause(); try { sessionStorage.setItem(KEY,JSON.stringify({started:true,dismissed:true,index:index,time:audio.currentTime,playing:false})); } catch(error){} dock.remove(); });
  audio.addEventListener('play',function(){ icon.className='fa-solid fa-pause'; dock.querySelector('.bq-music-play').setAttribute('aria-label','Pausar'); save(true); });
  audio.addEventListener('pause',function(){ icon.className='fa-solid fa-play'; dock.querySelector('.bq-music-play').setAttribute('aria-label','Reproducir'); save(false); });
  audio.addEventListener('timeupdate',function(){ var percent=audio.duration ? audio.currentTime/audio.duration*100 : 0; fill.style.width=percent+'%'; time.textContent=format(audio.currentTime)+' / '+format(audio.duration); if(Math.floor(audio.currentTime)%3===0) save(!audio.paused); });
  audio.addEventListener('ended',function(){ step(1); });
  loadTrack(state.playing,Number(state.time)||0);
}());
