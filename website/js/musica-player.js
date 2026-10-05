// ============================================================================
// BAQUEANO — REPRODUCTOR FUNCIONAL DEL ARCHIVO SONORO
// ============================================================================
// POR QUÉ:
// - La interfaz musical debe reproducir grabaciones existentes y nunca simular
//   actividad cambiando iconos sin emitir audio.
//
// CÓMO:
// - Un único HTMLAudioElement conecta portada, lista, controles superior e inferior.
// - Cada canción visible apunta a un archivo presente en assets/audio.
// - Los controles secundarios reciben acciones verificables y retroalimentación.
//
// QUÉ:
// - Reproducción, pausa, anterior, siguiente, aleatorio, repetición, volumen,
//   progreso, favoritos, búsqueda territorial y carruseles navegables.
// ============================================================================
(function initMusicExperience() {
  'use strict';

  const TRACKS = [
    { title:'La Mora Limpia', artist:'Justo Santos', file:'la_mora_limpia.mp3', image:'assets/artistas/justo santos.jpg', genre:'Son nica', region:'Managua', period:'Siglo XX', summary:'Pieza fundamental del repertorio popular nicaragüense, reconocida por su melodía de guitarra y su identidad nacional.' },
    { title:'Son de Mi Tierra', artist:'Tradición nicaragüense', file:'Fiesta Pinolera.mp3', image:'assets/images/PROPUESTA/NICARAGUA AUTENTICA.png', genre:'Son tradicional', region:'Nicaragua', period:'Tradición viva', summary:'Selección del archivo sonoro que reúne el pulso festivo y campesino de la música tradicional.' },
    { title:'Sirena del Lago', artist:'Camilo Zapata', file:'Cocibolca.mp3', image:'assets/artistas/camilo zapata.jpg', genre:'Son nica', region:'Granada', period:'Siglo XX', summary:'Evocación musical del Gran Lago Cocibolca y del paisaje cultural del Pacífico nicaragüense.' },
    { title:'Nicaragua Nicaragüita', artist:'Carlos Mejía Godoy', file:'nicaragua,nicaraguita.mp3', image:'assets/artistas/carlos mejia godoy.jpg', genre:'Nueva canción', region:'Nicaragua', period:'Década de 1970', summary:'Una de las composiciones nicaragüenses más reconocidas, convertida en símbolo de identidad y afecto por el país.' },
    { title:'El Solar de Monimbó', artist:'Luis Enrique Mejía Godoy', file:'el_solar_de_monimbo.mp3', image:'assets/artistas/Luis Enrique Mejía Godoy.jpg', genre:'Nueva canción', region:'Masaya', period:'Siglo XX', summary:'Canción vinculada a la memoria, la comunidad indígena de Monimbó y la identidad cultural de Masaya.' },
    { title:'Palo de Mayo', artist:'Tradición caribeña', file:'Sabroso Palo de Mayo.mp3', image:'assets/artistas/Dimensión Costeña.jpg', genre:'Palo de Mayo', region:'Costa Caribe', period:'Tradición viva', summary:'Ritmo comunitario afrocaribeño asociado a las celebraciones de mayo, la danza y la herencia creole.' },
    { title:'Danza del Güegüense', artist:'Folclor Nacional', file:'🔊Sones del Güegüense.mp3', image:'assets/artistas/Música de El Güegüense.jpg', genre:'Son tradicional', region:'Diriamba, Carazo', period:'Época colonial', summary:'Música de la obra danzaria El Güegüense, expresión de sátira, teatro, danza y patrimonio cultural nicaragüense.' }
  ].map(track => ({...track, src:`assets/audio/${encodeURIComponent(track.file)}`}));

  const ARTISTS = {
    'Camilo Zapata': { years:'1917–2009', place:'Managua', role:'Compositor y guitarrista', bio:'Considerado creador y principal impulsor del son nica. Su obra convirtió paisajes, costumbres y personajes populares en una expresión musical propia de Nicaragua.', works:'Caballito chontaleño · El solar de Monimbó · Flor de mi colina' },
    'Justo Santos': { years:'1925–1958', place:'Managua', role:'Compositor y guitarrista', bio:'Autor de La Mora Limpia, una de las piezas instrumentales más emblemáticas de Nicaragua. Su legado está unido al desarrollo de la guitarra popular y del son nica.', works:'La Mora Limpia · repertorio instrumental nicaragüense' },
    'Carlos Mejía Godoy': { years:'1943', place:'Somoto, Madriz', role:'Cantautor y compositor', bio:'Figura central de la canción nicaragüense contemporánea. Su repertorio reúne identidad popular, memoria histórica, tradición oral y sonidos propios del país.', works:'Nicaragua Nicaragüita · Son tus perfúmenes mujer · Alforja campesina' },
    'Luis Enrique Mejía Godoy': { years:'1945', place:'Somoto, Madriz', role:'Cantautor y compositor', bio:'Cantautor de amplia trayectoria cuya obra combina raíz popular, poesía, memoria social y ritmos nicaragüenses.', works:'El solar de Monimbó · temas de identidad y memoria nacional' },
    'Salvador Cardenal': { years:'1960–2010', place:'Managua', role:'Cantautor', bio:'Integrante del Dúo Guardabarranco. Su escritura destacó por la sensibilidad ambiental, la poesía y la defensa de la naturaleza.', works:'Guerrero del amor · Días de amar · Colibrí' },
    'Katia Cardenal': { years:'1963', place:'Managua', role:'Cantautora', bio:'Voz fundadora del Dúo Guardabarranco y una de las intérpretes nicaragüenses con mayor proyección internacional.', works:'Días de amar · Dame el corazón · repertorio del Dúo Guardabarranco' },
    'Norma Helena Gadea': { years:'1955', place:'Ocotal, Nueva Segovia', role:'Cantante e intérprete', bio:'Reconocida por una voz de gran fuerza expresiva y por interpretar canción latinoamericana y repertorio nicaragüense.', works:'Gracias a la vida · repertorio testimonial y popular' },
    'Alejandro Vega Matus': { years:'1875–1937', place:'Masaya', role:'Compositor y director', bio:'Autor esencial de la música nicaragüense. Compuso valses, mazurcas, sones y música escénica vinculada a la vida cultural de Masaya.', works:'Cantos y piezas del repertorio tradicional de Masaya' },
    'Tradición nicaragüense': { years:'Patrimonio colectivo', place:'Nicaragua', role:'Tradición musical', bio:'Repertorio transmitido entre generaciones por intérpretes, familias y comunidades del país.', works:'Sones, mazurcas, polcas y cantos tradicionales' },
    'Tradición caribeña': { years:'Patrimonio colectivo', place:'Costa Caribe', role:'Tradición afrocaribeña', bio:'Expresión musical comunitaria que reúne herencias creole, afrodescendientes e indígenas de la Costa Caribe nicaragüense.', works:'Palo de Mayo y repertorios festivos caribeños' },
    'Folclor Nacional': { years:'Patrimonio colectivo', place:'Nicaragua', role:'Patrimonio musical', bio:'Conjunto de expresiones preservadas por comunidades, promotores culturales, músicos y cuerpos de danza tradicional.', works:'Sones de El Güegüense y repertorio tradicional' }
  };

  const audio = new Audio();
  audio.preload = 'metadata';
  const persistentKey = 'baqueano_music_session_v1';
  let currentIndex = 0;
  let shuffle = false;
  let repeat = false;
  let draggingProgress = false;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => Array.from(document.querySelectorAll(selector));
  const formatTime = value => Number.isFinite(value) ? `${Math.floor(value/60)}:${String(Math.floor(value%60)).padStart(2,'0')}` : '0:00';
  function savePersistentState(playing) {
    try { sessionStorage.setItem(persistentKey, JSON.stringify({started:true,dismissed:false,index:currentIndex,time:audio.currentTime||0,playing:!!playing,updatedAt:Date.now()})); }
    catch (error) { /* El reproductor continúa aunque la sesión no pueda guardarse. */ }
  }

  function notify(message) {
    if (window.bqToast) return window.bqToast(message, 'info');
    const node=document.createElement('div'); node.className='musica-action-toast'; node.textContent=message; document.body.appendChild(node); setTimeout(()=>node.remove(),2200);
  }
  function findTrack(title) {
    const query=String(title||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    return TRACKS.findIndex(track=>track.title.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(query)||query.includes(track.title.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()));
  }
  function setTrack(index, autoplay) {
    currentIndex=(index+TRACKS.length)%TRACKS.length;
    const track=TRACKS[currentIndex]; audio.src=track.src; audio.load();
    const featured=$('#featuredTrackTitle'), featuredArtist=$('#featuredTrackArtist'), featuredCover=$('.featured-player-cover'), stickyTitle=$('#stickyTrackTitle'), stickyArtist=$('#stickyTrackArtist'), stickyCover=$('#stickyTrackThumb');
    if(featured) featured.textContent=track.title; if(featuredArtist) featuredArtist.textContent=track.artist; if(featuredCover){featuredCover.src=track.image;featuredCover.alt=track.artist;} if(stickyTitle) stickyTitle.textContent=track.title; if(stickyArtist) stickyArtist.textContent=track.artist; if(stickyCover){stickyCover.src=track.image;stickyCover.alt=track.artist;}
    $$('.track-card-exact').forEach(card=>card.classList.toggle('is-playing',findTrack(card.dataset.title)===currentIndex));
    if(autoplay) audio.play().catch(()=>notify('El navegador bloqueó el inicio automático. Pulsá reproducir nuevamente.'));
  }
  function updatePlayState() {
    const playing=!audio.paused;
    ['#mainPlayIcon','#stickyPlayIcon'].forEach(selector=>{const icon=$(selector);if(icon)icon.className=`fa-solid fa-${playing?'pause':'play'}`;});
    const wave=$('#waveformVisualizer'); if(wave) wave.classList.toggle('is-playing',playing);
    $$('.track-card-exact').forEach(card=>{const button=card.querySelector('.track-play-btn i');if(button&&findTrack(card.dataset.title)===currentIndex)button.className=`fa-solid fa-${playing?'pause':'play'}`;});
  }
  function toggle() { if(!audio.src)setTrack(currentIndex,false); audio.paused?audio.play().catch(()=>notify('No fue posible iniciar esta grabación.')):audio.pause(); }
  function step(direction) { const next=shuffle?Math.floor(Math.random()*TRACKS.length):currentIndex+direction; setTrack(next,true); }
  function toggleFavorite(button) { const icon=button.querySelector('i'); const active=icon.classList.toggle('fa-solid'); icon.classList.toggle('fa-regular',!active); button.classList.toggle('is-active',active); notify(active?'Guardado en favoritos':'Eliminado de favoritos'); }

  function openProfile(artistName, track) {
    const artist=ARTISTS[artistName]||{years:'Archivo sonoro',place:track?.region||'Nicaragua',role:'Intérprete del archivo',bio:'Esta grabación forma parte del patrimonio sonoro reunido por Baqueano.',works:track?.title||'Archivo sonoro'};
    let modal=$('#musicProfileModal');
    if(!modal){modal=document.createElement('div');modal.id='musicProfileModal';modal.className='music-profile-backdrop';modal.setAttribute('aria-hidden','true');modal.innerHTML='<section class="music-profile-dialog" role="dialog" aria-modal="true" aria-labelledby="musicProfileName"><button type="button" class="music-profile-close" aria-label="Cerrar ficha"><i class="fa-solid fa-xmark"></i></button><div class="music-profile-accent"><i class="fa-solid fa-music"></i></div><div class="music-profile-heading"><span>ARCHIVO SONORO NICARAGÜENSE</span><h2 id="musicProfileName"></h2><p id="musicProfileRole"></p></div><div class="music-profile-facts"><span><i class="fa-regular fa-calendar"></i><b id="musicProfileYears"></b></span><span><i class="fa-solid fa-location-dot"></i><b id="musicProfilePlace"></b></span></div><p class="music-profile-bio" id="musicProfileBio"></p><div class="music-profile-work"><small>OBRAS Y REPERTORIO</small><strong id="musicProfileWorks"></strong></div><div class="music-profile-track" id="musicProfileTrack" hidden><small>GRABACIÓN ACTIVA</small><h3></h3><p></p><button type="button"><i class="fa-solid fa-play"></i> Escuchar grabación</button></div></section>';document.body.appendChild(modal);modal.querySelector('.music-profile-close').addEventListener('click',()=>closeProfile());modal.addEventListener('click',event=>{if(event.target===modal)closeProfile();});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&modal.classList.contains('is-open'))closeProfile();});}
    $('#musicProfileName').textContent=artistName;$('#musicProfileRole').textContent=artist.role;$('#musicProfileYears').textContent=artist.years;$('#musicProfilePlace').textContent=artist.place;$('#musicProfileBio').textContent=artist.bio;$('#musicProfileWorks').textContent=artist.works;
    const trackBox=$('#musicProfileTrack');trackBox.hidden=!track;if(track){trackBox.querySelector('h3').textContent=track.title;trackBox.querySelector('p').textContent=`${track.genre} · ${track.region} · ${track.period}`;trackBox.querySelector('button').onclick=()=>{setTrack(TRACKS.indexOf(track),true);closeProfile();};}
    modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');setTimeout(()=>modal.querySelector('.music-profile-close').focus(),30);
  }
  function closeProfile(){const modal=$('#musicProfileModal');if(modal){modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');}}

  window.toggleMainTrack=toggle;
  window.playSong=function(title){const index=findTrack(title);if(index>=0)setTrack(index,true);else notify('Esta ficha todavía no tiene una grabación vinculada.');};

  function wireControls() {
    $('#btnTrackProfile')?.addEventListener('click',()=>openProfile(TRACKS[currentIndex].artist,TRACKS[currentIndex]));
    $$('.artist-card-exact').forEach(card=>{card.setAttribute('tabindex','0');card.setAttribute('role','button');card.setAttribute('aria-label',`Ver ficha de ${card.querySelector('.artist-name')?.textContent||'artista'}`);const open=()=>openProfile(card.querySelector('.artist-name')?.textContent.trim(),null);card.addEventListener('click',open);card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open();}});});
    $$('.player-ctrl-btn[title="Anterior"]').forEach(button=>button.addEventListener('click',()=>step(-1)));
    $$('.player-ctrl-btn[title="Siguiente"]').forEach(button=>button.addEventListener('click',()=>step(1)));
    $$('.player-ctrl-btn[title="Aleatorio"]').forEach(button=>button.addEventListener('click',()=>{shuffle=!shuffle;$$('.player-ctrl-btn[title="Aleatorio"]').forEach(item=>item.classList.toggle('is-active',shuffle));notify(shuffle?'Orden aleatorio activado':'Orden normal activado');}));
    $$('.player-ctrl-btn[title="Repetir"]').forEach(button=>button.addEventListener('click',()=>{repeat=!repeat;audio.loop=repeat;button.classList.toggle('is-active',repeat);notify(repeat?'Repetición activada':'Repetición desactivada');}));
    $$('.btn-player-heart').forEach(button=>button.addEventListener('click',()=>toggleFavorite(button)));
    $$('.player-volume-slider').forEach(slider=>{audio.volume=Number(slider.value)/100;slider.addEventListener('input',()=>{audio.volume=Number(slider.value)/100;});});
    $$('.player-ctrl-btn[title*="Lista"]').forEach(button=>button.addEventListener('click',()=>document.querySelector('#archivoSonoro')?.scrollIntoView({behavior:'smooth'})));
    const progress=$('.sticky-progress-bar'); if(progress){progress.setAttribute('role','slider');progress.setAttribute('tabindex','0');progress.title='Cambiar posición';progress.addEventListener('click',event=>{if(Number.isFinite(audio.duration)){const box=progress.getBoundingClientRect();audio.currentTime=Math.max(0,Math.min(1,(event.clientX-box.left)/box.width))*audio.duration;}});progress.addEventListener('keydown',event=>{if(!Number.isFinite(audio.duration))return;const step={ArrowRight:5,ArrowUp:5,ArrowLeft:-5,ArrowDown:-5}[event.key];if(event.key==='Home'||event.key==='End'||step){event.preventDefault();audio.currentTime=event.key==='Home'?0:event.key==='End'?Math.max(0,audio.duration-1):Math.max(0,Math.min(audio.duration,audio.currentTime+step));}});}
  }
  function wireCarousels() {
    $$('.musica-carousel-arrows').forEach(arrows=>{const section=arrows.closest('.musica-section-common');const rail=section?.querySelector('.genres-grid-exact,.artists-grid-exact,.history-grid-exact,.instruments-grid-exact,.tracks-grid-exact');if(!rail)return;const buttons=arrows.querySelectorAll('.musica-arrow-btn');buttons[0]?.addEventListener('click',()=>rail.scrollBy({left:-Math.max(280,rail.clientWidth*.75),behavior:'smooth'}));buttons[1]?.addEventListener('click',()=>rail.scrollBy({left:Math.max(280,rail.clientWidth*.75),behavior:'smooth'}));});
  }
  function wireMapSearch() {
    const button=$('#btnSoundMapSearch'); if(!button)return;
    button.addEventListener('click',()=>{const dept=$('#soundFilterDepto')?.value;const genre=$('#soundFilterGenre')?.value;const query=[dept,genre].filter(Boolean).join(' ');if(query){const card=$$('.track-card-exact').find(item=>(item.dataset.title+' '+item.dataset.artist).toLowerCase().includes(query));if(card)card.scrollIntoView({behavior:'smooth',block:'center'});else document.querySelector('#archivoSonoro')?.scrollIntoView({behavior:'smooth'});notify(`Archivo filtrado: ${query}`);}else{document.querySelector('#archivoSonoro')?.scrollIntoView({behavior:'smooth'});notify('Mostrando todo el archivo sonoro');}});
  }
  audio.addEventListener('play',()=>{updatePlayState();savePersistentState(true);}); audio.addEventListener('pause',()=>{updatePlayState();savePersistentState(false);}); audio.addEventListener('ended',()=>repeat?audio.play():step(1));
  audio.addEventListener('error',()=>{updatePlayState();notify('La grabación no pudo cargarse. Revisá tu conexión.');});
  audio.addEventListener('timeupdate',()=>{if(draggingProgress)return;const pct=Number.isFinite(audio.duration)&&audio.duration?audio.currentTime/audio.duration*100:0;const fill=$('#stickyProgressFill');if(fill)fill.style.width=`${pct}%`;const bar=$('.sticky-progress-bar');if(bar){bar.setAttribute('aria-valuenow',String(Math.round(pct)));bar.setAttribute('aria-valuetext',formatTime(audio.currentTime));}const text=`${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;const main=$('#playerTime'),sticky=$('#stickyTimeDisplay');if(main)main.textContent=text;if(sticky)sticky.textContent=text;if(Math.floor(audio.currentTime)%3===0)savePersistentState(!audio.paused);});
  window.addEventListener('pagehide',()=>savePersistentState(!audio.paused));
  audio.addEventListener('loadedmetadata',()=>audio.dispatchEvent(new Event('timeupdate')));
  function init(){setTrack(0,false);wireControls();wireCarousels();wireMapSearch();updatePlayState();}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
