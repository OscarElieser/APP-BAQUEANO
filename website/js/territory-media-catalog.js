// ============================================================================
// BAQUEANO — ARCHIVO ÚNICO PARA IMÁGENES Y VIDEOS TERRITORIALES
// ============================================================================
// 🎯 POR QUÉ: permitir agregar contenido multimedia sin buscar rutas dentro de
// los controladores, el HTML o los estilos de cada departamento.
// ⚙️ CÓMO: cada territorio tiene destinos explícitos: `carousel` mueve imágenes
// en la franja infinita, `photoGallery` crea tarjetas y `videos` crea reproductores.
// 📦 QUÉ: catálogo central consumido por departamento.html y sus experiencias.
//
// INSTRUCCIONES RÁPIDAS
// 1. Copiá la imagen a: website/assets/images/departamentos/
// 2. Agregá aquí su ruta dentro del territorio y sección deseada.
// 3. Para video, copiá el archivo a website/assets/videos/ y agregá un objeto:
//    { src: 'assets/videos/archivo.mp4', poster: 'assets/images/...jpg',
//      title: 'Título real', description: 'Descripción comprobada' }
// 4. No reutilices una foto o video en otro territorio sin comprobar su origen.
// ============================================================================
(function exposeTerritoryMediaCatalog(global) {
  'use strict';

  const imageRoot = 'assets/images/departamentos/';
  const paths = (...names) => names.map(name => `${imageRoot}${name}`);
  const entry = (gallery, videos = []) => Object.freeze({
    carousel: Object.freeze([...gallery]),
    photoGallery: Object.freeze([...gallery].slice(0, 3)),
    videos: Object.freeze([...videos])
  });

  global.BAQUEANO_MEDIA_CATALOG = Object.freeze({
    madriz: entry([
      'assets/images/madriz/canon_somoto_panoramica.jpg',
      'assets/images/madriz/canon_somoto_interior.png',
      'assets/images/madriz/canon_somoto_bote.png',
      'assets/images/destinos/canon_de_somoto.jpg',
      'assets/images/departamentos/somoto.jpg'
    ], [
      { src: 'assets/videos/video%20nicaragua.mp4', poster: 'assets/images/madriz/canon_somoto_panoramica.jpg', title: 'Navegando el Cañón de Somoto', description: 'Turismo comunitario guiado por baqueanos locales.' },
      { src: 'assets/videos/gastronomia.mp4', poster: 'assets/images/madriz/canon_somoto_interior.png', title: 'Elaboración de Rosquillas', description: 'Tradición centenaria en hornos de barro.' }
    ]),
    leon: entry(paths('leon.png', 'leon1.png', 'leon2.jfif', 'leon3.jfif', 'leon4.jfif')),
    rivas: entry(paths('rivas.png', 'rivas1.jfif', 'sanjuandelsur.jpg', 'islaometepe.png')),
    jinotega: entry(paths('jinotega.jpg', 'jinotega1.jpg')),
    masaya: entry(paths('masaya.png', 'masaya1.png', 'masaya2.jpg', 'masaya4.jpg', 'masaya5.jpg')),
    granada: entry(paths('granada.jpg', 'granada1.jpg', 'granada2.jpg', 'granada3.jfif', 'granada4.jfif')),
    matagalpa: entry(paths('matagalpa.png', 'matagalpa1.png', 'matagalpa2.png', 'matagalpa3.png')),
    esteli: entry(paths('esteli.png', 'esteli1.png', 'reserva tisey.jpg')),
    chinandega: entry(paths(
      'chinandega.jpg', 'chinandega1.png', 'chinandega2.jfif', 'chinandega3.jfif',
      'chinandega4.jfif', 'chinandega5.jfif', 'chinandega6.jfif', 'chinandega7.jpg',
      'chinandega8.jfif', 'chinandega9.jfif', 'chinandega10.jfif', 'chinandega11.jfif',
      'chinandega12.jfif', 'chinandega13.jfif', 'chinandega14.jfif', 'chinandega15.jfif'
    )),
    managua: entry(paths('managua.png', 'managua1.jpg', 'managua2.jfif', 'managua3.jfif', 'managua4.jfif')),
    carazo: entry(paths('carazo.png', 'carazo1.png', 'carazo2.avif', 'carazo3.jfif', 'carazo4.jfif')),
    chontales: entry(paths('chontales.png', 'chontales1.png', 'chontales2.png')),
    boaco: entry(paths('boaco.png', 'boaco1.png')),
    'nueva-segovia': entry(paths('nueva segovia.png', 'nueva segovia1.png')),
    'rio-san-juan': entry(paths('rio san juan.png', 'rio san juan1.png', 'rio san juan2.png')),
    raccn: entry(paths('raan.png', 'RAAN1.png', 'RAAN2.png', 'biosfera bosawas.jpg')),
    raccs: entry(paths('RAAS.png', 'RAAS1.png'))
  });
})(window);
