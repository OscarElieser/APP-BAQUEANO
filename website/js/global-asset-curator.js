// ============================================================================
// BAQUEANO — CURADURÍA GLOBAL DE RECURSOS VISUALES
// ============================================================================
// 🎯 POR QUÉ: utilizar la identidad y las fotografías reales disponibles en el proyecto.
// ⚙️ CÓMO: normaliza rutas antiguas, asigna marca y Baqui oficiales, repara recursos
//    faltantes y optimiza la carga de imágenes que están fuera del primer viewport.
// 📦 QUÉ: logotipo oficial blanco en navegación, Baqui guardabarranco y fallbacks visuales.
// ============================================================================
(function () {
  'use strict';
  var logo='assets/images/LOGOS/baqueano_icono_500x386-blanco.png';
  var icon='assets/images/LOGOS/logo.png';
  var baqui='assets/images/assistant/baqui.png?v=20261009';
  var replacements={
    'assets/images/logo.png':icon,
    'assets/images/baqui.png':baqui,
    'assets/images/baqui-bird.png':baqui,
    'assets/images/destinos/ometepe.webp':'assets/images/destinos/isla_de_ometepe.jpg',
    'assets/images/destinos/granada.webp':'assets/images/destinos/isletas_de_granada.jpg',
    'assets/images/destinos/somoto.jpg':'assets/images/destinos/canon_de_somoto.jpg',
    'assets/images/destinos/canon_somoto_panoramica.jpg':'assets/images/madriz/canon_somoto_panoramica.jpg',
    'assets/images/destinos/ometepe_volcan_concepcion.jpg':'assets/images/destinos/isla_de_ometepe.jpg',
    'assets/images/destinos/granada_isletas.jpg':'assets/images/destinos/isletas_de_granada.jpg',
    'assets/images/destinos/playa_maderas.jpg':'assets/images/destinos/Playa Maderas (Santuario del Surf).jpg',
    'assets/images/destinos/hotel_dario.jpg':'assets/images/aliados/hotel_dario.jpg',
    'assets/images/destinos/fortaleza_el_castillo.jpg':'assets/images/destinos/Fortaleza de la Inmaculada Concepción.jpg',
    'assets/images/destinos/calle_la_calzada.jpg':'assets/images/destinos/Calle La Calzada & Zona Bohemia.jpg',
    'assets/images/destinos/convento_san_francisco.jpg':'assets/images/destinos/Museo y Convento San Francisco (1529).jpg',
    'assets/images/destinos/finca_magdalena.jpg':'assets/images/destinos/Finca Magdalena Eco-Lodge Campesino.jpg',
    'assets/images/destinos/villa_redonda.jpg':'assets/images/destinos/Villa Vista Redonda (Emerald Coast).webp',
    'assets/images/destinos/posada_san_ramon.jpg':'assets/images/destinos/Posada Rural San Ramón Ometepe.avif',
    'assets/images/destinos/casa_senorial.jpg':'assets/images/destinos/Casa Señorial Colonial Granada.jpg',
    'assets/images/comida/indio viejo.jpg':'assets/images/comida/indio_viejo.jpg',
    'assets/images/comida/gallo pinto con huevo.jpg':'assets/images/comida/gallo_pinto.jpg',
    'assets/images/comida/pescado frito con tostones.jpg':'assets/images/comida/vigoron.jpg',
    'assets/images/comida/tacos de carne con salsa y ensalada.jpg':'assets/images/comida/baho.jpg',
    'assets/images/comida/fresco de cacao con leche.jpg':'assets/images/comida/quesillo.jpg',
    'assets/images/aliados/somoto.webp':'assets/images/madriz/canon_somoto_panoramica.jpg',
    'assets/images/aliados/cañon.webp':'assets/images/madriz/canon_somoto_interior.png',
    'assets/images/gastronomia/nacatamal.webp':'assets/images/comida/nacatamal.jpg',
    'assets/images/gastronomia/vigoron.webp':'assets/images/comida/vigoron.jpg',
    'assets/images/destinos-hero.jpg':'assets/images/destinos/splash_bg.jpg',
    'assets/images/hero-home.jpg':'assets/images/destinos/splash_bg.jpg'
  };
  function cleanSource(src){try{var url=new URL(src,location.href);return decodeURIComponent(url.pathname.replace(/^\//,''));}catch(error){return src;}}
  function curateImage(img){
    if(img.dataset.assetCurated==='true')return;
    var source=cleanSource(img.getAttribute('src')||'');
    if(replacements[source])img.src=replacements[source];
    if(img.closest('#mainNavbar,.main-navbar,.main-navbar-exact')&&img.matches('.exact-nav-logo,.navbar-brand-logo,.exact-logo-img,.brand-logo-img')){img.src=logo;img.classList.remove('bq-proposal-logo');img.classList.add('bq-official-nav-logo');}
    if(img.closest('footer')&&img.matches('.footer-logo-img,.footer-brand-logo-img,.footer-logo')){img.src=logo;img.classList.add('bq-footer-proposal-logo');}
    if(!img.closest('#mainNavbar,.main-navbar,.main-navbar-exact')&&!img.hasAttribute('loading'))img.loading='lazy';
    img.decoding='async';img.dataset.assetCurated='true';
    img.addEventListener('error',function fallback(){img.removeEventListener('error',fallback);img.src=icon;img.classList.add('bq-image-fallback');});
  }
  function run(root){(root.matches&&root.matches('img')?[root]:Array.from(root.querySelectorAll?root.querySelectorAll('img'):[])).forEach(curateImage);}
  var style=document.createElement('style');style.textContent='#mainNavbar .bq-official-nav-logo,.main-navbar .bq-official-nav-logo{width:48px!important;max-width:48px!important;height:48px!important;object-fit:contain!important;border-radius:0!important;filter:drop-shadow(0 4px 10px rgba(0,0,0,.38))!important}.bq-footer-proposal-logo{width:min(230px,100%)!important;height:auto!important;max-height:100px!important;object-fit:contain!important}.bq-image-fallback{object-fit:contain!important}@media(max-width:600px){#mainNavbar .bq-official-nav-logo,.main-navbar .bq-official-nav-logo{width:42px!important;height:42px!important}}';document.head.appendChild(style);
  function init(){run(document);new MutationObserver(function(records){records.forEach(function(record){record.addedNodes.forEach(function(node){if(node.nodeType===1)run(node);});});}).observe(document.body,{childList:true,subtree:true});}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
}());
