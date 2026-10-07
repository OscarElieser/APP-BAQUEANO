// ============================================================================
// 🧭 BAQUEANO — HOSPEDAJES DESTACADOS (lodging-showcase-data.js)
// ============================================================================
// 🎯 POR QUÉ:
// - BAQUEANO presenta hospedajes locales y conecta al viajero directamente con el
//   establecimiento. La marca del negocio es la protagonista; BAQUEANO solo firma
//   con un sello pequeño ("Disponible en BAQUEANO").
//
// ⚙️ CÓMO:
// - Espejo de public.businesses y public.prices en Supabase (migración
//   supabase/migrations/20261007120000_hotel_encanto_del_sur.sql). Si cambia un dato,
//   se cambia en los dos lugares. js/lodging-showcase.js pinta las fichas.
// - Aquí solo hay datos propios del negocio (nombre, teléfono, montos y fechas). Los
//   textos están en locales/*.json (lodging.<id>.* y lodgingShowcase.*), en 6 idiomas.
// - Las tarifas solo se muestran mientras están vigentes (validUntil, hora de Nicaragua).
// - logo: ruta del logo ORIGINAL del negocio. Mientras sea null, la ficha muestra el
//   nombre del hotel en texto; nunca se reemplaza por el logo de BAQUEANO.
//
// 📦 QUÉ: window.BAQUEANO_LODGING_SHOWCASE = [ { id, name, ... } ].
// ============================================================================
(function (window) {
  'use strict';

  window.BAQUEANO_LODGING_SHOWCASE = Object.freeze([
    {
      id: 'hotel-encanto-del-sur',
      supabaseId: 'biz-hotel-encanto-del-sur',
      i18nKey: 'encantoDelSur', // lodging.encantoDelSur.* en locales (las claves no admiten guiones)
      name: 'Hotel Encanto del Sur',
      place: 'San Juan del Sur, Rivas, Nicaragua',
      territory: 'rivas',
      // Logo original pendiente de entrega por el negocio (ej.: 'assets/images/negocios/hotel-encanto-del-sur/logo.webp').
      logo: null,
      whatsapp: '50577532549',
      whatsappLabel: '+505 7753 2549',
      // Correo de la publicidad del hotel enviada por el propietario (2026-10-07).
      email: 'encantodelsursjs@gmail.com',
      // Ubicación entregada por el propietario (2026-10-07): enlace exacto de Google Maps y dirección que
      // ese enlace confirma.
      mapsUrl: 'https://maps.app.goo.gl/zg64Cd6hWcq5psGF7',
      address: 'Av. Gaspar García Laviana, San Juan del Sur 48600',
      // Coordenadas entregadas por el propietario como "aproximadas" (2026-10-07); en Supabase,
      // location_precision 'approximate' (el pin del mapa exige 'exact').
      latitude: 11.25015,
      longitude: -85.87015,
      locationPrecision: 'approximate',
      mapsQuery: 'Hotel Encanto del Sur, San Juan del Sur, Nicaragua',
      amenities: ['standard', 'family', 'groups', 'equipped', 'airConditioning', 'wifi', 'cableTv', 'dailyCleaning', 'personalService', 'familyAtmosphere', 'nearBeach'],
      prices: [
        { key: 'coupleNoAc', amount: 30, currency: 'USD' },
        { key: 'coupleAc', amount: 40, currency: 'USD' }
      ],
      pricesValidFrom: '2026-10-01',
      pricesValidUntil: '2026-10-31',
      source: 'business_owner',
      checkedAt: '2026-10-07'
    }
  ]);
})(window);
