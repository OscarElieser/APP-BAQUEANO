// ============================================================================
// 🎯 POR QUÉ: consolidar favoritos históricos guardados por distintos módulos.
// ⚙️ CÓMO: reúne claves compatibles, normaliza identificadores y permite eliminarlos.
// 📦 QUÉ: renderizado de colección, contador, estado vacío y sincronización local.
// ============================================================================
(function(){'use strict';
  const keys=['baqueano_favs','baqueano-favorites','baqueano_favs_local','baqueano_favorites','baqueano_fav_places_v1'];
  const catalog={
    'isla-de-ometepe':{title:'Isla de Ometepe',region:'Rivas',image:'assets/images/destinos/isla_de_ometepe.jpg',url:'destinos.html?id=ometepe',map:'mapa.html?q=ometepe'},
    'ometepe':{title:'Isla de Ometepe',region:'Rivas',image:'assets/images/destinos/isla_de_ometepe.jpg',url:'destinos.html?id=ometepe',map:'mapa.html?q=ometepe'},
    'granada':{title:'Granada Colonial',region:'Granada',image:'assets/images/departamentos/granada.jpg',url:'destinos.html?id=granada',map:'mapa.html?q=granada'},
    'san-juan-del-sur':{title:'San Juan del Sur',region:'Rivas',image:'assets/images/destinos/Bahía de San Juan del Sur & Mirador del Cristo.jpg',url:'destinos.html?id=sjds',map:'mapa.html?q=san+juan+del+sur'},
    'sjds':{title:'San Juan del Sur',region:'Rivas',image:'assets/images/destinos/Bahía de San Juan del Sur & Mirador del Cristo.jpg',url:'destinos.html?id=sjds',map:'mapa.html?q=san+juan+del+sur'},
    'cerro-negro':{title:'Cerro Negro',region:'León',image:'assets/images/destinos/cerro_negro.jpg',url:'destinos.html?id=cerro_negro',map:'mapa.html?q=cerro+negro'},
    'cerro_negro':{title:'Cerro Negro',region:'León',image:'assets/images/destinos/cerro_negro.jpg',url:'destinos.html?id=cerro_negro',map:'mapa.html?q=cerro+negro'},
    'canon-de-somoto':{title:'Cañón de Somoto',region:'Madriz',image:'assets/images/destinos/canon_de_somoto.jpg',url:'destinos.html?id=somoto',map:'mapa.html?q=somoto'},
    'somoto':{title:'Cañón de Somoto',region:'Madriz',image:'assets/images/destinos/canon_de_somoto.jpg',url:'destinos.html?id=somoto',map:'mapa.html?q=somoto'},
    'masaya':{title:'Volcán Masaya',region:'Masaya',image:'assets/images/destinos/volcan_masaya.jpg',url:'destinos.html?id=masaya',map:'mapa.html?q=volcan+masaya'}
  };
  const parse=(key)=>{try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value:[]}catch(_){return[]}};
  const slug=(value)=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  function collect(){const found=new Map();keys.forEach(key=>parse(key).forEach(item=>{const raw=typeof item==='string'?item:(item.id||item.destinationId||item.title||'');const id=slug(raw);if(!id)return;const base=catalog[id]||{title:typeof item==='object'&&item.title?item.title:String(raw).replace(/[-_]/g,' '),region:typeof item==='object'&&(item.location||item.region)||'Nicaragua',image:'assets/images/destinos/splash_bg.jpg',url:'destinos.html?q='+encodeURIComponent(raw),map:'mapa.html?q='+encodeURIComponent(raw)};found.set(id,{id,...base})}));return [...found.values()]}
  function remove(id){keys.forEach(key=>{const next=parse(key).filter(item=>slug(typeof item==='string'?item:(item.id||item.destinationId||item.title||''))!==id);localStorage.setItem(key,JSON.stringify(next))});render();window.dispatchEvent(new CustomEvent('baqueano_favs_updated'))}
  function render(){const items=collect(),grid=document.getElementById('favoritesGrid'),empty=document.getElementById('favoritesEmpty'),count=document.getElementById('favoritesCount');count.textContent=String(items.length);empty.hidden=items.length>0;grid.hidden=items.length===0;grid.innerHTML=items.map(item=>`<article class="favorite-card"><div class="favorite-card-media"><img src="${item.image}" alt="${item.title}" loading="lazy"><button type="button" class="favorite-remove" data-remove="${item.id}" aria-label="Quitar ${item.title} de favoritos"><i class="fa-solid fa-heart"></i></button></div><div class="favorite-card-body"><span class="favorite-card-tag"><i class="fa-solid fa-location-dot"></i> ${item.region}</span><h2>${item.title}</h2><p>Destino guardado en tu colección personal de BAQUEANO.</p><div class="favorite-card-actions"><a class="favorite-open" href="${item.url}">Ver destino</a><a class="favorite-map" href="${item.map}">Mapa</a></div></div></article>`).join('');grid.querySelectorAll('[data-remove]').forEach(button=>button.addEventListener('click',()=>remove(button.dataset.remove)))}
  document.addEventListener('DOMContentLoaded',render);
})();
