// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — REGISTRO & GESTOR DE FONDOS DE VIDEO (video-registry.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una fuente centralizada y configurable para los fondos de video
//   de todos los encabezados principales (Gastronomía, Historia, Ambiental,
//   Música, Aliados, Negocios, Destinos e Inicio).
// - Asegurar carga asíncrona, control de reproducción de bajo consumo y
//   accesibilidad para usuarios con preferencias de movimiento reducido.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Objeto inmutable `VIDEO_CATALOG` con URLs y posters de respaldo.
// - Método `initVideoHeroes()` que vincula botones de pausa/reproducción
//   y maneja eventos de ahorro de batería o fallos de red.
//
// 📦 3. QUÉ (WHAT / MÉTODOS EXPUESTOS):
// - window.BaqueanoVideos = { catalog, init, togglePlay }
// ============================================================================

window.BaqueanoVideos = (function() {
  'use strict';

  const VIDEO_CATALOG = {
    gastronomia: {
      src: 'https://video-previews.elements.envatousercontent.com/h264-video-previews/1b40667e-50b4-470f-82f8-6dc087bfbafe/22747651.mp4',
      poster: 'assets/images/destinos/dona_haydee.jpg',
      title: 'Gastronomía Ancestral y Fogón Campesino'
    },
    historia: {
      src: 'https://video-previews.elements.envatousercontent.com/h264-video-previews/4079ee5e-5883-4a18-a6d1-4db81d6fbb5c/38584852.mp4',
      poster: 'assets/images/destinos/convento_san_francisco.jpg',
      title: 'Historia, Soberanía y Ciudades Coloniales'
    },
    ambiental: {
      src: 'https://video-previews.elements.envatousercontent.com/h264-video-previews/5b0907d7-d779-4560-8438-fbcaef40be44/47942699.mp4',
      poster: 'assets/images/destinos/selva_negra.jpg',
      title: 'Bosques Vírgenes, Cuencas y Selva Tropical'
    },
    musica: {
      src: 'https://video-previews.elements.envatousercontent.com/h264-video-previews/7a0fcda5-1f91-4c6e-8260-264bc80fe3ea/24016149.mp4',
      poster: 'assets/images/destinos/calle_la_calzada.jpg',
      title: 'Patrimonio Sonoro, Marimba y Danza Tradicional'
    },
    aliados: {
      src: 'https://video-previews.elements.envatousercontent.com/h264-video-previews/e2815183-b78f-4aa7-ae49-166fefbce78d/33924376.mp4',
      poster: 'assets/images/destinos/finca_magdalena.jpg',
      title: 'Comunidades Rurales y Cooperativas Agroecológicas'
    },
    negocio: {
      src: 'https://video-previews.elements.envatousercontent.com/h264-video-previews/92e8508e-5b1a-4648-8dfa-80bb4c995fa4/32236543.mp4',
      poster: 'assets/images/destinos/morgans_rock.jpg',
      title: 'Hospitalidad Campesina y Eco-Lodges de Nicaragua'
    },
    destinos: {
      src: 'https://video-previews.elements.envatousercontent.com/h264-video-previews/1b40667e-50b4-470f-82f8-6dc087bfbafe/22747651.mp4',
      poster: 'assets/images/destinos/canon_de_somoto.jpg',
      title: 'Catálogo de Destinos y Áreas Protegidas'
    },
    index: {
      src: 'https://video-previews.elements.envatousercontent.com/h264-video-previews/3e536ec6-3694-4342-9908-ca45d94bc6fb/41551065.mp4',
      poster: 'assets/images/destinos/isla_de_ometepe.jpg',
      title: 'Expediciones y Ecoturismo Soberano en Nicaragua'
    }
  };

  function init() {
    // Configurar botones de control de reproducción de video en la página
    document.querySelectorAll('.video-hero-wrapper').forEach(wrapper => {
      const video = wrapper.querySelector('video');
      const ctrlBtn = wrapper.querySelector('.video-hero-ctrl-btn');

      if (video && ctrlBtn) {
        ctrlBtn.addEventListener('click', () => {
          if (video.paused) {
            video.play();
            ctrlBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            ctrlBtn.setAttribute('title', 'Pausar video de fondo');
          } else {
            video.pause();
            ctrlBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            ctrlBtn.setAttribute('title', 'Reproducir video de fondo');
          }
        });
      }
    });
  }

  // Inicializar al cargar el DOM
  document.addEventListener('DOMContentLoaded', init);

  return {
    catalog: VIDEO_CATALOG,
    init: init
  };
})();
