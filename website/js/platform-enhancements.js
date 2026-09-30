/**
 * BAQUEANO — Motor transversal de interacción
 *
 * POR QUÉ: completar estados equivalentes que estaban fragmentados entre páginas.
 * CÓMO: usa delegación, almacenamiento defensivo y mejoras progresivas.
 * QUÉ: favoritos con contador, galerías pausables y filtros limpiables.
 */
(function BaqueanoPlatformEnhancements(){
  'use strict';
  var LIKE_KEY='baqueano_like_counts_v2';
  var FAVORITE_KEY='baqueano-favorites';
  var galleryTimers=new WeakMap();

  function readJson(key,fallback){try{var value=JSON.parse(localStorage.getItem(key)||'null');return value===null?fallback:value;}catch(error){return fallback;}}
  function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch(error){return false;}}
  function slug(value){return String(value||'elemento').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');}
  function itemData(button){
    var card=button.closest('article,.dest-card,.dest-highlight-card,.dish-card,.aliado-card,.musica-card,.track-row');
    var title=card&&card.querySelector('h2,h3,h4,.track-title,.dish-title,.aliado-name');
    var image=card&&card.querySelector('img');
    var name=title?title.textContent.trim():button.getAttribute('aria-label')||button.title||'Guardado';
    return{id:button.dataset.favoriteId||(card&&card.dataset.destinationId)||slug(name),title:name,page:location.pathname.split('/').pop()||'index.html',image:image?image.getAttribute('src'):'',savedAt:new Date().toISOString()};
  }

  function initLikes(){
    var selector='.dest-heart-btn,.dest-highlight-heart,.dish-fav-btn,.aliado-fav-btn,.btn-player-heart,.btn-action-like';
    var counts=readJson(LIKE_KEY,{});
    var favorites=readJson(FAVORITE_KEY,[]);
    if(!Array.isArray(favorites))favorites=[];
    document.querySelectorAll(selector).forEach(function(button,index){
      if(button.dataset.bqLikeReady==='true')return;
      button.dataset.bqLikeReady='true';
      var data=itemData(button);
      var key=data.page+':'+data.id+':'+index;
      var count=Number(counts[key]);
      if(!Number.isFinite(count))count=Number(button.dataset.initialLikes||0);
      var saved=favorites.some(function(entry){return(typeof entry==='string'?entry:entry.id)===data.id;});
      var badge=document.createElement('span');
      badge.className='bq-like-count';badge.textContent=String(count);badge.setAttribute('aria-label',count+' Me gusta');button.appendChild(badge);
      button.setAttribute('aria-pressed',String(saved));button.classList.toggle('active',saved);
      button.addEventListener('click',function(){
        var before=button.getAttribute('aria-pressed')==='true';
        window.setTimeout(function(){
          var managedState=button.getAttribute('aria-pressed')==='true';
          var next=managedState===before?!before:managedState;
          var nextCount=Math.max(0,Number(badge.textContent)+(next===before?0:(next?1:-1)));
          button.setAttribute('aria-pressed',String(next));button.classList.toggle('active',next);
          var icon=button.querySelector('i');if(icon)icon.className=(next?'fa-solid':'fa-regular')+' fa-heart';
          badge.textContent=String(nextCount);badge.setAttribute('aria-label',nextCount+' Me gusta');counts[key]=nextCount;
          favorites=readJson(FAVORITE_KEY,favorites);if(!Array.isArray(favorites))favorites=[];
          favorites=favorites.filter(function(entry){return(typeof entry==='string'?entry:entry.id)!==data.id;});
          if(next)favorites.push(data);
          writeJson(LIKE_KEY,counts);writeJson(FAVORITE_KEY,favorites);writeJson('baqueano_favs',favorites);
          if(managedState===before&&typeof window.bqToast==='function')window.bqToast(next?'Guardado en tus favoritos.':'Quitado de tus favoritos.','success');
        },0);
      },true);
    });
  }

  function stopGallery(track,button){var timer=galleryTimers.get(track);if(timer)window.clearInterval(timer);galleryTimers.delete(track);if(button){button.innerHTML='<i class="fa-solid fa-play"></i><span>Reanudar galería</span>';button.setAttribute('aria-pressed','true');}}
  function startGallery(track,button){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){stopGallery(track,button);return;}
    stopGallery(track);
    var timer=window.setInterval(function(){
      if(document.hidden||track.matches(':hover')||track.dataset.userPaused==='true')return;
      var step=Math.max(240,Math.min(track.clientWidth*.72,480));
      var atEnd=track.scrollLeft+track.clientWidth>=track.scrollWidth-8;
      track.scrollTo({left:atEnd?0:track.scrollLeft+step,behavior:'smooth'});
    },5200);
    galleryTimers.set(track,timer);
    if(button){button.innerHTML='<i class="fa-solid fa-pause"></i><span>Pausar galería</span>';button.setAttribute('aria-pressed','false');}
  }
  function initGalleries(){
    ['.destinos-destacados-row','.destinos-catalog-row','.hist-territory-track','.exp-grid','.gastro-dishes-grid','.amb-actions-grid','.musica-carousel-track','.aliados-grid'].forEach(function(selector){
      document.querySelectorAll(selector).forEach(function(track){
        if(track.dataset.bqGalleryReady==='true'||track.children.length<2)return;
        track.dataset.bqGalleryReady='true';track.classList.add('bq-continuous-gallery');
        var button=document.createElement('button');button.type='button';button.className='bq-gallery-control';button.setAttribute('aria-label','Pausar movimiento de la galería');track.insertAdjacentElement('afterend',button);
        button.addEventListener('click',function(){var paused=track.dataset.userPaused==='true';track.dataset.userPaused=String(!paused);if(paused)startGallery(track,button);else stopGallery(track,button);});
        track.addEventListener('pointerdown',function(){track.dataset.userPaused='true';stopGallery(track,button);},{passive:true});startGallery(track,button);
      });
    });
  }

  function initAllyFilters(){
    var bar=document.querySelector('.aliados-filter-bar');if(!bar||document.getElementById('bqResetAllyFilters'))return;
    var reset=document.createElement('button');reset.type='button';reset.id='bqResetAllyFilters';reset.className='bq-filter-reset';reset.innerHTML='<i class="fa-solid fa-filter-circle-xmark"></i> Quitar filtros';reset.hidden=true;
    var status=document.createElement('p');status.className='bq-result-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');bar.append(reset,status);
    function update(){var active=Array.from(bar.querySelectorAll('select')).some(function(select){return select.selectedIndex>0&&select.value;});var visible=Array.from(document.querySelectorAll('.aliado-card,.aliado-card-exact')).filter(function(card){return!card.hidden&&getComputedStyle(card).display!=='none';}).length;reset.hidden=!active;status.textContent=visible+(visible===1?' aliado visible.':' aliados visibles.');}
    bar.addEventListener('change',function(){window.setTimeout(update,0);});document.getElementById('btnFilterAliados')?.addEventListener('click',function(){window.setTimeout(update,0);});
    reset.addEventListener('click',function(){bar.querySelectorAll('select').forEach(function(select){select.selectedIndex=0;select.dispatchEvent(new Event('change',{bubbles:true}));});document.querySelectorAll('.aliado-card,.aliado-card-exact').forEach(function(card){card.hidden=false;card.style.display='';});update();});window.setTimeout(update,100);
  }

  function init(){initLikes();initGalleries();initAllyFilters();new MutationObserver(initLikes).observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
