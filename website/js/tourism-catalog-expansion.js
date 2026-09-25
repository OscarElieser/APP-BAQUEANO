// ============================================================================
// 🧭 BAQUEANO — AMPLIACIÓN DEL CATÁLOGO TURÍSTICO OFICIAL
// ============================================================================
// 🎯 POR QUÉ (WHY / PROPÓSITO):
// Completar en destinos.html los atractivos publicados por Visit Nicaragua que
// todavía no estaban representados, manteniendo una sola composición visual y
// evitando copiar bloques HTML extensos y propensos a quedar desalineados.
//
// ⚙️ CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// Primero normaliza las fichas heredadas y las mueve como hijas directas de la
// cuadrícula; esto repara cierres HTML antiguos que el navegador interpretaba
// como tarjetas anidadas. Luego valida e inserta el catálogo complementario.
// Cada ficha incluye coordenadas para que baqueano-map.js cree su pin.
//
// 📦 QUÉ (WHAT / FUNCIONALIDAD & ENTREGABLES):
// Cuadrícula plana y ordenada, seis volcanes oficiales y Reserva Privada
// Kilimanjaro, con imagen, datos, acciones, categoría y coordenadas de mapa.
// ============================================================================
(function () {
  'use strict';

  const additions = [
    { id: 'dest_volcan_telica', category: 'volcanes', name: 'Volcán Telica', location: 'Telica, León', lat: 12.602, lng: -86.845, image: 'assets/images/destinos/cerro_negro.jpg', badge: 'Cráter & Fumarolas', icon: 'fa-volcano', description: 'Ascenso de aventura hacia un amplio cráter activo, fumarolas y panorámicas de la cordillera volcánica de occidente.', host: 'Guías comunitarios de Telica', address: 'Acceso rural desde Telica y San Jacinto', phone: '50584431289', price: 'C$ 450 – C$ 1,100', usd: '$12 – $30 USD', detail: 'Entrada y transporte según ruta | Recorrido recomendado con guía local', rating: '4.9', reviews: 426, likes: 173 },
    { id: 'dest_volcan_san_cristobal', category: 'volcanes', name: 'Volcán San Cristóbal', location: 'Chichigalpa, Chinandega', lat: 12.702, lng: -87.004, image: 'assets/images/departamentos/chinandega.jpg', badge: 'Cumbre de Nicaragua', icon: 'fa-mountain', description: 'El volcán más alto de Nicaragua ofrece una exigente ruta de montaña y amplias vistas sobre la llanura de Chinandega.', host: 'Guías de la cordillera Los Maribios', address: 'Accesos rurales de Chichigalpa y Posoltega', phone: '50584431289', price: 'C$ 650 – C$ 1,300', usd: '$18 – $36 USD', detail: 'Ascenso de alta exigencia | Guía local, agua y equipo adecuados indispensables', rating: '4.9', reviews: 388, likes: 164 },
    { id: 'dest_volcan_concepcion', category: 'volcanes', name: 'Volcán Concepción', location: 'Isla de Ometepe, Rivas', lat: 11.538, lng: -85.622, image: 'assets/images/destinos/isla_de_ometepe.jpg', badge: 'Gigante de Ometepe', icon: 'fa-volcano', description: 'Cono volcánico activo que domina Ometepe; su ascenso atraviesa bosque tropical antes de alcanzar vistas del Gran Lago.', host: 'Guías certificados de Ometepe', address: 'Rutas desde Altagracia y La Sabana', phone: '50584431289', price: 'C$ 900 – C$ 1,500', usd: '$25 – $41 USD', detail: 'Ascenso largo con guía | Verificar condiciones meteorológicas antes de salir', rating: '4.9', reviews: 612, likes: 248 },
    { id: 'dest_volcan_maderas', category: 'volcanes', name: 'Volcán Maderas', location: 'Balgüe, Isla de Ometepe', lat: 11.446, lng: -85.515, image: 'assets/images/destinos/Finca Magdalena Eco-Lodge Campesino.jpg', badge: 'Bosque Nuboso', icon: 'fa-cloud', description: 'Volcán cubierto de bosque nuboso con senderos de biodiversidad y una laguna de cráter en la parte alta.', host: 'Cooperativas y guías de Balgüe', address: 'Acceso por Balgüe y Finca Magdalena', phone: '50584431289', price: 'C$ 750 – C$ 1,350', usd: '$20 – $37 USD', detail: 'Sendero húmedo de jornada completa | Guía comunitario recomendado', rating: '4.9', reviews: 574, likes: 231 },
    { id: 'dest_volcan_cosiguina', category: 'volcanes', name: 'Volcán Cosigüina', location: 'El Viejo, Chinandega', lat: 12.980, lng: -87.570, image: 'assets/images/departamentos/chinandega.jpg', badge: 'Golfo de Fonseca', icon: 'fa-mountain-sun', description: 'Sendero hacia una laguna cratérica con vistas panorámicas del Golfo de Fonseca, Honduras y El Salvador.', host: 'Guías comunitarios de Cosigüina', address: 'Comarca Potosí, península de Cosigüina', phone: '50584431289', price: 'C$ 450 – C$ 950', usd: '$12 – $26 USD', detail: 'Acceso y guía según temporada | Llevar agua y protección solar', rating: '4.8', reviews: 301, likes: 142 },
    { id: 'dest_volcan_mombacho', category: 'volcanes', name: 'Volcán Mombacho', location: 'Granada, Granada', lat: 11.826, lng: -85.968, image: 'assets/images/destinos/selva_negra.jpg', badge: 'Reserva Natural', icon: 'fa-leaf', description: 'Bosque nuboso, miradores sobre Granada e Isletas y senderos alrededor de cráteres cubiertos por exuberante vegetación.', host: 'Guías de la Reserva Natural Mombacho', address: 'Carretera Granada–Nandaime, desvío a Mombacho', phone: '50584431289', price: 'C$ 250 – C$ 1,100', usd: '$7 – $30 USD', detail: 'Tarifa según transporte y sendero | Opciones de caminata y canopy', rating: '4.9', reviews: 821, likes: 319 },
    { id: 'dest_reserva_kilimanjaro', category: 'selva', name: 'Reserva Privada Kilimanjaro', location: 'El Crucero, Managua', lat: 11.990, lng: -86.310, image: 'assets/images/destinos/selva_negra.jpg', badge: 'Centro de Aventura', icon: 'fa-person-hiking', description: 'Experiencia privada de naturaleza y aventura entre bosque, senderos, miradores y actividades al aire libre cerca de Managua.', host: 'Equipo Reserva Kilimanjaro', address: 'Zona alta de El Crucero, Managua', phone: '50584431289', price: 'Consultar tarifa', usd: 'Según actividad', detail: 'Reservación previa recomendada | Actividades sujetas a clima y disponibilidad', rating: '4.8', reviews: 216, likes: 127 }
  ];

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  }

  function cardTemplate(place) {
    const p = Object.fromEntries(Object.entries(place).map(([key, value]) => [key, escapeHtml(value)]));
    const whatsappText = encodeURIComponent(`Hola ${place.host}, deseo información de ${place.name} desde Baqueano Nicaragua`);
    return `
      <div class="dest-card-pro" data-category="${p.category}" data-id="${p.id}">
        <div class="dest-card-img-wrap dest-carousel-wrap">
          <img src="${p.image}" alt="${p.name}" class="dest-card-img dest-carousel-slide active" loading="lazy" decoding="async">
          <div class="dest-floating-actions">
            <button class="btn-floating-like btn-action-like" data-id="${p.id}" data-initial-likes="${p.likes}" title="Me gusta"><i class="fa-regular fa-heart"></i></button>
            <button class="btn-floating-fav btn-action-fav" data-id="${p.id}" title="Guardar"><i class="fa-regular fa-bookmark"></i></button>
          </div>
          <span class="dest-badge-corner"><i class="fa-solid ${p.icon}"></i> ${p.badge}</span>
          <span class="dest-price-badge">${p.price}</span>
        </div>
        <div class="dest-body-pro">
          <div class="dest-location-tag"><i class="fa-solid fa-location-dot"></i> ${p.location}</div>
          <h3 class="dest-name-title">${p.name}</h3>
          <p class="dest-description-text">${p.description}</p>
          <div class="dest-host-details-box">
            <div class="dest-host-row"><i class="fa-solid fa-user-check"></i><span>Anfitrión / Gestor: <strong>${p.host}</strong></span></div>
            <div class="dest-host-row"><i class="fa-solid fa-map-location-dot"></i><span>Dirección: <strong>${p.address}</strong></span></div>
            <div class="dest-host-row"><i class="fa-solid fa-phone"></i><span>Información: <a href="tel:${p.phone}">+505 8443-1289</a></span></div>
          </div>
          <div class="dest-real-price-strip"><div>Precio orientativo: <span class="price-cordobas">${p.price}</span></div><div class="price-usd">${p.usd}</div></div>
          <div class="dest-price-breakdown"><i class="fa-solid fa-receipt"></i><span>${p.detail}</span></div>
          <div class="dest-card-action-bar">
            <a href="https://api.whatsapp.com/send?phone=${p.phone}&text=${whatsappText}" target="_blank" rel="noopener noreferrer" class="btn-card-whatsapp"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
            <button type="button" class="btn-card-route btn-action-route" data-lat="${p.lat}" data-lng="${p.lng}" data-name="${p.name}" data-id="${p.id}"><i class="fa-solid fa-diamond-turn-right"></i> Cómo Llegar</button>
          </div>
          <div class="dest-footer-strip"><span class="dest-rating-gold"><i class="fa-solid fa-star"></i> ${p.rating} (${p.reviews} reseñas)</span><span class="dest-coop-name">${p.host}</span></div>
        </div>
      </div>`;
  }

  const grid = document.querySelector('.destinations-showcase-grid');
  if (!grid) return;

  // Algunos bloques históricos tienen cierres incompletos. El DOM del navegador
  // sigue siendo recuperable: promover cada tarjeta a hija directa conserva su
  // orden documental y garantiza que CSS Grid controle todas por igual.
  Array.from(grid.querySelectorAll('.dest-card-pro')).forEach((card) => {
    if (card.parentElement !== grid) grid.appendChild(card);
  });

  additions.forEach((place) => {
    if (!document.querySelector(`.dest-card-pro[data-id="${place.id}"]`)) {
      grid.insertAdjacentHTML('beforeend', cardTemplate(place));
    }
  });
})();
