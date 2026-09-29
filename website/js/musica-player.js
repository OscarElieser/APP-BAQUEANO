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
    { title:'La Mora Limpia', artist:'Justo Santos', file:'la_mora_limpia.mp3' },
    { title:'Son de Mi Tierra', artist:'Tradición nicaragüense', file:'Fiesta Pinolera.mp3' },
    { title:'Sirena del Lago', artist:'Archivo Cocibolca', file:'Cocibolca.mp3' },
    { title:'Nicaragua Nicaragüita', artist:'Carlos Mejía Godoy', file:'nicaragua,nicaraguita.mp3' },
    { title:'El Solar de Monimbó', artist:'Camilo Zapata', file:'el_solar_de_monimbo.mp3' },
    { title:'Palo de Mayo', artist:'Dimensión Costeña', file:'Sabroso Palo de Mayo.mp3' },
    { title:'Danza del Güegüense', artist:'Folclor Nacional', file:'🔊Sones del Güegüense.mp3' }
  ].map(track => ({...track, src:`assets/audio/${encodeURIComponent(track.file)}`}));

  const audio = new Audio();
  audio.preload = 'metadata';
  let currentIndex = 0;
  let shuffle = false;
  let repeat = false;
  let draggingProgress = false;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => Array.from(document.querySelectorAll(selector));
  const formatTime = value => Number.isFinite(value) ? `${Math.floor(value/60)}:${String(Math.floor(value%60)).padStart(2,'0')}` : '0:00';

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
    const featured=$('#featuredTrackTitle'), stickyTitle=$('#stickyTrackTitle'), stickyArtist=$('#stickyTrackArtist');
    if(featured) featured.textContent=track.title; if(stickyTitle) stickyTitle.textContent=track.title; if(stickyArtist) stickyArtist.textContent=track.artist;
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

  window.toggleMainTrack=toggle;
  window.playSong=function(title){const index=findTrack(title);if(index>=0)setTrack(index,true);else notify('Esta ficha todavía no tiene una grabación vinculada.');};

  function wireControls() {
    $$('.player-ctrl-btn[title="Anterior"]').forEach(button=>button.addEventListener('click',()=>step(-1)));
    $$('.player-ctrl-btn[title="Siguiente"]').forEach(button=>button.addEventListener('click',()=>step(1)));
    $$('.player-ctrl-btn[title="Aleatorio"]').forEach(button=>button.addEventListener('click',()=>{shuffle=!shuffle;$$('.player-ctrl-btn[title="Aleatorio"]').forEach(item=>item.classList.toggle('is-active',shuffle));notify(shuffle?'Orden aleatorio activado':'Orden normal activado');}));
    $$('.player-ctrl-btn[title="Repetir"]').forEach(button=>button.addEventListener('click',()=>{repeat=!repeat;audio.loop=repeat;button.classList.toggle('is-active',repeat);notify(repeat?'Repetición activada':'Repetición desactivada');}));
    $$('.btn-player-heart').forEach(button=>button.addEventListener('click',()=>toggleFavorite(button)));
    $$('.player-volume-slider').forEach(slider=>{audio.volume=Number(slider.value)/100;slider.addEventListener('input',()=>{audio.volume=Number(slider.value)/100;});});
    $$('.player-ctrl-btn[title*="Lista"]').forEach(button=>button.addEventListener('click',()=>document.querySelector('#archivoSonoro')?.scrollIntoView({behavior:'smooth'})));
    const progress=$('.sticky-progress-bar'); if(progress){progress.setAttribute('role','slider');progress.setAttribute('tabindex','0');progress.title='Cambiar posición';progress.addEventListener('click',event=>{if(Number.isFinite(audio.duration)){const box=progress.getBoundingClientRect();audio.currentTime=Math.max(0,Math.min(1,(event.clientX-box.left)/box.width))*audio.duration;}});}
  }
  function wireCarousels() {
    $$('.musica-carousel-arrows').forEach(arrows=>{const section=arrows.closest('.musica-section-common');const rail=section?.querySelector('.genres-grid-exact,.artists-grid-exact,.history-grid-exact,.instruments-grid-exact,.tracks-grid-exact');if(!rail)return;const buttons=arrows.querySelectorAll('.musica-arrow-btn');buttons[0]?.addEventListener('click',()=>rail.scrollBy({left:-Math.max(280,rail.clientWidth*.75),behavior:'smooth'}));buttons[1]?.addEventListener('click',()=>rail.scrollBy({left:Math.max(280,rail.clientWidth*.75),behavior:'smooth'}));});
  }
  function wireMapSearch() {
    const button=$('#btnSoundMapSearch'); if(!button)return;
    button.addEventListener('click',()=>{const dept=$('#soundFilterDepto')?.value;const genre=$('#soundFilterGenre')?.value;const query=[dept,genre].filter(Boolean).join(' ');if(query){const card=$$('.track-card-exact').find(item=>(item.dataset.title+' '+item.dataset.artist).toLowerCase().includes(query));if(card)card.scrollIntoView({behavior:'smooth',block:'center'});else document.querySelector('#archivoSonoro')?.scrollIntoView({behavior:'smooth'});notify(`Archivo filtrado: ${query}`);}else{document.querySelector('#archivoSonoro')?.scrollIntoView({behavior:'smooth'});notify('Mostrando todo el archivo sonoro');}});
  }
  audio.addEventListener('play',updatePlayState); audio.addEventListener('pause',updatePlayState); audio.addEventListener('ended',()=>repeat?audio.play():step(1));
  audio.addEventListener('error',()=>{updatePlayState();notify('La grabación no pudo cargarse. Revisá tu conexión.');});
  audio.addEventListener('timeupdate',()=>{if(draggingProgress)return;const pct=Number.isFinite(audio.duration)&&audio.duration?audio.currentTime/audio.duration*100:0;const fill=$('#stickyProgressFill');if(fill)fill.style.width=`${pct}%`;const text=`${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;const main=$('#playerTime'),sticky=$('#stickyTimeDisplay');if(main)main.textContent=text;if(sticky)sticky.textContent=text;});
  audio.addEventListener('loadedmetadata',()=>audio.dispatchEvent(new Event('timeupdate')));
  function init(){setTrack(0,false);wireControls();wireCarousels();wireMapSearch();updatePlayState();}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
