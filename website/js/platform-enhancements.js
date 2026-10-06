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

  // WCAG 2.5.3 (auditoría 2026-10-06): el contador visible va dentro del nombre accesible
  // ("Favorito 3"). La etiqueta base es la que traiga el botón (traducida por la i18n);
  // si la i18n la reescribe, se toma la nueva como base.
  function nameWithCount(button,badge){
    var current=button.getAttribute('aria-label')||'';
    var base=current&&current===button.dataset.bqNamed?button.dataset.bqBase:(current||button.title||'Guardar');
    var next=base+' '+badge.textContent;
    button.dataset.bqBase=base;button.dataset.bqNamed=next;button.setAttribute('aria-label',next);
  }
  ['baqueano:languageChanged','baqueano:i18nReady'].forEach(function(name){
    window.addEventListener(name,function(){setTimeout(function(){
      document.querySelectorAll('.bq-like-count').forEach(function(badge){nameWithCount(badge.parentElement,badge);});
    },0);});
  });

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
      badge.className='bq-like-count';badge.textContent=String(count);badge.setAttribute('aria-hidden','true');button.appendChild(badge);nameWithCount(button,badge);
      button.setAttribute('aria-pressed',String(saved));button.classList.toggle('active',saved);
      button.addEventListener('click',function(){
        var before=button.getAttribute('aria-pressed')==='true';
        window.setTimeout(function(){
          var managedState=button.getAttribute('aria-pressed')==='true';
          var next=managedState===before?!before:managedState;
          var nextCount=Math.max(0,Number(badge.textContent)+(next===before?0:(next?1:-1)));
          button.setAttribute('aria-pressed',String(next));button.classList.toggle('active',next);
          var icon=button.querySelector('i');if(icon)icon.className=(next?'fa-solid':'fa-regular')+' fa-heart';
          badge.textContent=String(nextCount);nameWithCount(button,badge);counts[key]=nextCount;
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
    ['.destinos-destacados-row','.destinos-catalog-row','.hist-territory-track','.exp-grid','.gastro-dishes-grid','.amb-actions-grid','.musica-carousel-track','.aliados-grid','.aliados-grid-exact','.testimonials-row-exact'].forEach(function(selector){
      document.querySelectorAll(selector).forEach(function(track){
        if(track.dataset.bqGalleryReady==='true'||track.children.length<2)return;
        track.dataset.bqGalleryReady='true';track.classList.add('bq-continuous-gallery');
        var button=document.createElement('button');button.type='button';button.className='bq-gallery-control';track.insertAdjacentElement('afterend',button);
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

  function initAdvancedAllySearch(){
    var bar=document.querySelector('.aliados-filter-bar');if(!bar||document.getElementById('bqAllySearch'))return;var wrap=document.createElement('label');wrap.className='bq-ally-search';wrap.innerHTML='<i class="fa-solid fa-magnifying-glass"></i><span class="sr-only">Buscar aliado por nombre o servicio</span><input id="bqAllySearch" type="search" placeholder="Nombre, territorio o servicio…" autocomplete="off">';bar.insertBefore(wrap,document.getElementById('btnFilterAliados'));
    var input=wrap.querySelector('input');/* 2026-10-06: las tarjetas reales llegan desde Supabase después de cargar; se leen en cada filtro. */var cards=function(){return Array.from(document.querySelectorAll('.aliado-card-exact,.aliado-card'));};
    function apply(){var dept=document.getElementById('filterDepto')?.value||'';var cat=document.getElementById('filterCat')?.value||'';var exp=document.getElementById('filterExp')?.value||'';var verified=document.getElementById('filterVerif')?.value||'todos';var query=input.value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();cards().forEach(function(card){var hay=(card.textContent+' '+(card.dataset.dept||'')+' '+(card.dataset.cat||'')).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();var expTerms={senderismo:'senderismo canon rappell',volcanes:'volcan sandboard',playa:'playa surf descanso acuatico',agroturismo:'cafe finca agroturismo rural',cultura:'cultura patrimonio historia'};var match=(!dept||card.dataset.dept===dept)&&(!cat||card.dataset.cat===cat)&&(!exp||(expTerms[exp]||exp).split(' ').some(function(term){return hay.includes(term);}))&&(verified!=='auditados'||!!card.querySelector('.aliado-card-audit,.aliado-verified-pill'))&&(!query||hay.includes(query));card.style.display=match?'flex':'none';card.hidden=!match;});var status=document.querySelector('.bq-result-status');var visible=cards().filter(function(card){return!card.hidden;}).length;if(status)status.textContent=visible+(visible===1?' aliado visible.':' aliados visibles.');var reset=document.getElementById('bqResetAllyFilters');if(reset)reset.hidden=!(query||dept||cat||exp||verified==='auditados');}
    input.addEventListener('input',apply);bar.querySelectorAll('select').forEach(function(select){select.addEventListener('change',apply);});document.getElementById('btnFilterAliados')?.addEventListener('click',apply);document.getElementById('bqResetAllyFilters')?.addEventListener('click',function(){input.value='';window.setTimeout(apply,0);});
  }

  function initVideoNavigation(){
    var hero=document.querySelector('.bq-hero-background');
    var nav=document.querySelector('#mainNavbar,.main-navbar-exact,.main-navbar');
    if(!hero||!nav||nav.dataset.bqVideoNavReady==='true')return;
    nav.dataset.bqVideoNavReady='true';
    function update(){var overHero=window.scrollY<Math.max(56,hero.closest('section,header').offsetHeight-96);nav.classList.toggle('bq-nav-over-video',overHero);nav.classList.toggle('bq-nav-scrolled',!overHero);}
    update();window.addEventListener('scroll',update,{passive:true});
  }

  function baquiRouteData(){
    var stops=Array.from(document.querySelectorAll('.ia-day-card,.ia-itinerary-card')).map(function(card){return(card.querySelector('h3,h4')||card).textContent.trim();}).filter(Boolean);
    return{id:'baqui-'+Date.now(),name:'Ruta creada con BAQUI',stops:stops.length?stops:['Managua','Volcán Masaya','Granada','Isletas de Granada'],source:'baqueano-ia.html',savedAt:new Date().toISOString()};
  }
  function initBaquiActions(){
    var buttons=document.querySelectorAll('[data-baqui-action]');if(!buttons.length)return;
    buttons.forEach(function(button){if(button.dataset.bqReady==='true')return;button.dataset.bqReady='true';button.addEventListener('click',function(){
      var action=button.dataset.baquiAction;var route=baquiRouteData();var summary='Mi ruta BAQUI por Nicaragua: '+route.stops.join(' → ');var url=location.href;
      if(action==='save'){var trips=readJson('baqueano_saved_trips',[]);if(!Array.isArray(trips))trips=[];trips.push(route);writeJson('baqueano_saved_trips',trips);writeJson('baqueano_active_trip',route);button.innerHTML='<i class="fa-solid fa-check"></i> Guardada en Mi Viaje';if(typeof window.bqToast==='function')window.bqToast('Ruta guardada en Mi Viaje.','success');}
      if(action==='share'){window.open('https://wa.me/?text='+encodeURIComponent(summary+'\n'+url),'_blank','noopener');}
      /* 2026-10-06: el PDF lo genera baqueano-travel-session.js con la plantilla oficial; ya no se imprime la pantalla. */
      if(action==='reserve'){window.open('https://wa.me/50584431289?text='+encodeURIComponent('Hola, quiero contactar a los servicios de esta ruta armada con BAQUI para consultar disponibilidad: '+summary),'_blank','noopener');}
      if(action==='qr')openQrDialog(url,summary);
    });});
  }
  function openQrDialog(url,summary){
    var dialog=document.getElementById('bqRouteQrDialog');if(!dialog){dialog=document.createElement('dialog');dialog.id='bqRouteQrDialog';dialog.className='bq-info-dialog';document.body.appendChild(dialog);}
    var payload=url+'#ruta='+encodeURIComponent(summary);
    dialog.innerHTML='<button type="button" class="bq-dialog-close" aria-label="Cerrar">×</button><header class="bq-dialog-head"><span class="bq-dialog-kicker">RUTA PORTÁTIL</span><h2>Código QR de tu viaje</h2></header><div class="bq-dialog-body" style="text-align:center"><img src="https://api.qrserver.com/v1/create-qr-code/?size=260x260&data='+encodeURIComponent(payload)+'" width="260" height="260" alt="Código QR de la ruta" style="max-width:100%;height:auto;padding:10px;background:#fff;border-radius:16px"><p>El código conserva el enlace de la ruta para abrirla desde otro dispositivo.</p></div>';
    dialog.querySelector('.bq-dialog-close').addEventListener('click',function(){dialog.close();},{once:true});dialog.showModal();
  }

  function initHistoryCards(){
    if(!document.body.classList.contains('page-historia-exact'))return;
    document.querySelectorAll('.hist-people-card,.hist-character-card,.hist-heritage-card').forEach(function(card){if(card.dataset.bqReady==='true')return;card.dataset.bqReady='true';card.classList.add('bq-history-expandable');card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-expanded','false');var title=(card.querySelector('h3,h4,strong')||card).textContent.trim().split('\n')[0];var detail=document.createElement('div');detail.className='bq-history-detail';detail.textContent='Abrí la guía territorial para conocer contexto, ubicación, patrimonio relacionado y recomendaciones de visita sobre '+title+'.';card.appendChild(detail);function toggle(){var open=card.classList.toggle('bq-expanded');card.setAttribute('aria-expanded',String(open));}card.addEventListener('click',function(event){if(!event.target.closest('a,button'))toggle();});card.addEventListener('keydown',function(event){if(event.key==='Enter'||event.key===' '){event.preventDefault();toggle();}});});
  }

  function initExperienceBanner(){
    if(!document.body.classList.contains('page-exp-exact')||document.getElementById('bqReservationBanner'))return;
    var entries=[
      {title:'Reservá con prestadores locales verificados',copy:'Confirmá disponibilidad, precio y punto de encuentro directamente por WhatsApp.',image:'assets/images/destinos/isla_de_ometepe.jpg',href:'aliados.html'},
      {title:'Volcanes con guía y equipo adecuado',copy:'Elegí experiencias con información clara de dificultad, clima y condiciones de acceso.',image:'assets/images/destinos/cerro_negro.jpg',href:'#expCardsGrid'},
      {title:'Aventura acuática con seguridad',copy:'Revisá equipo, nivel del agua, condiciones marítimas y horario de retorno.',image:'assets/images/destinos/canon_de_somoto.jpg',href:'#expCardsGrid'},
      {title:'Conocé a las comunidades anfitrionas',copy:'Tu reserva puede fortalecer guías, cooperativas, cocinas y alojamientos locales.',image:'assets/images/destinos/selva_negra.jpg',href:'aliados.html'},
      {title:'Guardá todo en Mi Viaje',copy:'Organizá experiencias, costos y contactos en una sola ruta disponible durante el recorrido.',image:'assets/images/destinos/laguna_de_apoyo.jpg',href:'mi-viaje.html'}
    ];var banner=document.createElement('section');banner.id='bqReservationBanner';banner.className='bq-reservation-banner';banner.setAttribute('aria-live','polite');var main=document.querySelector('.exp-catalog-section');(main||document.querySelector('main')).insertAdjacentElement('afterend',banner);var index=0;var timer;
    function render(){var item=entries[index];banner.style.setProperty('--bq-banner-image','url("'+item.image+'")');banner.innerHTML='<div class="bq-banner-content"><span class="bq-banner-kicker">RESERVAS RESPONSABLES</span><h2>'+item.title+'</h2><p>'+item.copy+'</p><a class="bq-dialog-action accent" href="'+item.href+'">Continuar <i class="fa-solid fa-arrow-right"></i></a></div><div class="bq-banner-dots">'+entries.map(function(_,i){return'<button type="button" class="bq-banner-dot '+(i===index?'active':'')+'" data-banner-index="'+i+'" aria-label="Mostrar mensaje '+(i+1)+'"></button>';}).join('')+'</div>';banner.querySelectorAll('[data-banner-index]').forEach(function(dot){dot.addEventListener('click',function(){index=Number(dot.dataset.bannerIndex);render();restart();});});}
    function restart(){window.clearInterval(timer);timer=window.setInterval(function(){index=(index+1)%entries.length;render();},10000);}render();restart();
  }

  function initEnvironmentalPoints(){
    if(!document.body.classList.contains('page-ambiental-exact'))return;var key='baqueano_eco_points';var points=Number(localStorage.getItem(key)||0);var target=document.querySelector('.amb-passport-head h2,.amb-passport-head h3');if(target&&!target.querySelector('.bq-eco-points')){var badge=document.createElement('span');badge.className='bq-eco-points';badge.innerHTML='<i class="fa-solid fa-seedling"></i> <span>'+points+'</span> puntos';target.appendChild(badge);}
    document.querySelectorAll('.amb-rule-checkbox').forEach(function(box){if(box.dataset.bqPointsReady)return;box.dataset.bqPointsReady='true';box.addEventListener('change',function(){points=Math.max(0,points+(box.checked?10:-10));localStorage.setItem(key,String(points));var value=document.querySelector('.bq-eco-points span');if(value)value.textContent=String(points);});});
  }

  function initMusicDock(){
    var bar=document.getElementById('stickyMusicBar');if(!bar||document.getElementById('bqMusicMinimize'))return;bar.style.position=bar.style.position||'fixed';bar.classList.add('bq-before-content');var button=document.createElement('button');button.type='button';button.id='bqMusicMinimize';button.className='bq-music-minimize';button.setAttribute('aria-label','Minimizar reproductor');button.innerHTML='<i class="fa-solid fa-minus"></i>';bar.appendChild(button);button.addEventListener('click',function(){var hidden=bar.classList.toggle('bq-player-hidden');button.innerHTML=hidden?'<i class="fa-solid fa-music"></i>':'<i class="fa-solid fa-minus"></i>';button.setAttribute('aria-label',hidden?'Mostrar reproductor':'Minimizar reproductor');bar.style.pointerEvents='auto';});function reveal(){bar.classList.toggle('bq-before-content',window.scrollY<Math.min(420,window.innerHeight*.55));}reveal();window.addEventListener('scroll',reveal,{passive:true});
  }

  function initFormalReport(){
    var form=document.getElementById('ecoReportForm');/* 2026-10-06: la denuncia real la envía js/eco-report.js a Supabase; este registro solo-local con confirmación queda para páginas sin ese script. */if(!form||form.dataset.bqReady==='true'||form.hasAttribute('data-intake')||window.BaqueanoIntake)return;form.dataset.bqReady='true';form.addEventListener('submit',function(event){event.preventDefault();event.stopImmediatePropagation();if(!form.reportValidity())return;var report={id:'BQN-'+Date.now().toString(36).toUpperCase(),type:form.querySelector('select')?.value||'reporte',department:document.getElementById('reportDepartment')?.value||'',location:document.getElementById('reportLocation')?.value||'',details:document.getElementById('reportDetails')?.value||'',contact:document.getElementById('reportContact')?.value||'',createdAt:new Date().toISOString(),status:'recibido'};var reports=readJson('baqueano_environmental_reports',[]);if(!Array.isArray(reports))reports=[];reports.push(report);writeJson('baqueano_environmental_reports',reports);var old=form.querySelector('.bq-report-confirmation');if(old)old.remove();var confirmation=document.createElement('div');confirmation.className='bq-report-confirmation';confirmation.setAttribute('role','status');confirmation.innerHTML='<strong>Reporte recibido · '+report.id+'</strong><span>Conservá este código para seguimiento. Si existe peligro inmediato, utilizá el Centro SOS o las líneas oficiales mostradas en esta página.</span>';form.appendChild(confirmation);form.reset();confirmation.scrollIntoView({behavior:'smooth',block:'center'});},{capture:true});
  }

  // Testimonios de la portada: ahora los pinta js/home-community.js con la
  // comunidad real (Edge Function baqueano-community). Se retiró la versión
  // anterior que guardaba comentarios y "me gusta" solo en localStorage.

  function init(){initLikes();initGalleries();initAllyFilters();initAdvancedAllySearch();initVideoNavigation();initBaquiActions();initHistoryCards();initExperienceBanner();initEnvironmentalPoints();initMusicDock();initFormalReport();new MutationObserver(function(){initLikes();initVideoNavigation();}).observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
