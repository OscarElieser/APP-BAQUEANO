// ============================================================================
// BAQUEANO - INVENTARIO OPERATIVO REAL DEL SITIO
// ============================================================================
// POR QUE: Ops Center debe mostrar recursos existentes y configuraciones
// verificables, evitando archivos, actividad de IA o telemetria inventados.
// COMO: Declara rutas presentes en website/assets y capacidades respaldadas
// por archivos del proyecto. Firestore puede extenderlas por ID sin borrarlas.
// QUE: Expone multimedia, notificaciones editoriales, AI y estado Android.
// ============================================================================
(function exposeOperationsCatalog(window) {
  'use strict';
  const folders = {
    'images': ['baqueano_icono_oficial.png','baqueano_launcher_solid.png','baqueano_logo_horizontal.png','logo.png','og-image.jpg'],
    'images/aliados': ['apoyo_resort.jpg','arenas_beach.jpg','beach_club.jpg','corn_island_hostal.jpg','feel_at_home.jpg','hola_ola.jpg','hotel_dario.jpg','hotel_maharaja.jpg','inn_hotel.jpg','oro_eco.jpg','paraiso_beach.jpg','paraiso_nicaragua.jpg','pic_nic.jpg','posada_del_sol.jpg','posada_ecologica_la_abuela.jpg','san_simian.jpg','sohla_rooftop.jpg','town_hostel.jpg'],
    'images/comida': ['baho.jpg','delicias del norte.jpg','gallo_pinto.jpg','indio_viejo.jpg','nacatamal.jpg','quesillo.jpg','vigoron.jpg'],
    'images/destinos': ['Bahía de San Juan del Sur & Mirador del Cristo.jpg','Calle La Calzada & Zona Bohemia.jpg','canon_de_somoto.jpg','Casa Señorial Colonial Granada.jpg','cascada_la_luna.jpg','cerro_negro.jpg','corn_island.jpg','Finca Magdalena Eco-Lodge Campesino.jpg','Fortaleza de la Inmaculada Concepción.jpg','isla_de_ometepe.jpg','isletas_de_granada.jpg','laguna_de_apoyo.jpg',"Morgan's Rock Eco-Lodge & Reserva Marina.jpg",'Museo y Convento San Francisco (1529).jpg','Playa Maderas (Santuario del Surf).jpg','Posada Rural San Ramón Ometepe.avif','Refugio de Vida Silvestre La Flor & Playa El Coco.webp','selva_negra.jpg','splash_bg.jpg','Villa Vista Redonda (Emerald Coast).webp','volcan_masaya.jpg']
  };
  const audio = ['baile_del_mestizaje.mp3','el_solar_de_monimbo.mp3','el_zanatillo.mp3','la_mora_limpia.mp3','palomita_guasiruca.mp3'];
  const slug = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const media = [];
  Object.entries(folders).forEach(([folder, files]) => files.forEach((file) => media.push({
    id: `media-${slug(folder)}-${slug(file)}`, title: file.replace(/\.[^.]+$/, '').replace(/_/g, ' '), name: file,
    type: 'image', category: folder.split('/').pop(), imageUrl: `assets/${folder}/${file}`,
    publicUrl: `assets/${folder}/${file}`, status: 'published', source: 'website_catalog'
  })));
  audio.forEach((file) => media.push({
    id: `media-audio-${slug(file)}`, title: file.replace(/\.mp3$/i, '').replace(/_/g, ' '), name: file,
    type: 'audio', category: 'Patrimonio sonoro', audioUrl: `assets/audio/${file}`,
    publicUrl: `assets/audio/${file}`, status: 'published', source: 'website_catalog'
  }));
  window.BaqueanoWebsiteMedia = media;
  window.BaqueanoWebsiteNotifications = [
    { id: 'notification-sos', title: 'Centro SOS 24/7 disponible', message: 'Para emergencias nacionales utiliza la linea 118.', targetPlatform: 'web_android', link: 'tel:118', category: 'Seguridad', status: 'published', source: 'website_catalog' },
    { id: 'notification-allies', title: 'Red comunitaria activa', message: 'Consulta cooperativas, guias y alojamientos aliados en todo Nicaragua.', targetPlatform: 'web', link: 'aliados.html', category: 'Comunidad', status: 'published', source: 'website_catalog' }
  ];
  window.BaqueanoAiCapabilities = [
    { id: 'ai-assistant-web', title: 'Asistente web Baqueano', category: 'Asistente', description: 'Interfaz activa respaldada por js/baqueano-assistant.js.', implementationPath: 'js/baqueano-assistant.js', status: 'published', source: 'website_catalog' },
    { id: 'ai-itinerary-api', title: 'Generador de itinerarios', category: 'API', description: 'Ruta de servidor existente para planes territoriales.', implementationPath: 'apps/web/src/app/api/baqueano-ai/route.ts', status: 'published', source: 'website_catalog' },
    { id: 'ai-guardrails', title: 'Guardrails de seguridad', category: 'Seguridad', description: 'Politicas defensivas existentes para solicitudes de IA.', implementationPath: '../lib/core/security/ai_guardrails.dart', status: 'published', source: 'website_catalog' }
  ];
  window.BaqueanoAndroidInventory = [
    { id: 'android-app-source', title: 'Aplicacion Android Baqueano', category: 'Codigo fuente', description: 'Proyecto Flutter Android activo con servicios Firebase y experiencia offline.', artifactPath: '../android', releaseChannel: 'development', telemetryStatus: 'sin_datos_de_dispositivos', status: 'published', source: 'website_catalog' }
  ];
})(window);
