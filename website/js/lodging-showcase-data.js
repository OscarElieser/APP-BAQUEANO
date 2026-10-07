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
      // Logo original del hotel, entregado por el propietario (2026-10-07). Va como protagonista.
      logo: 'assets/images/negocios/hotel-encanto-del-sur/logo.webp',
      whatsapp: '50577532549',
      whatsappLabel: '+505 7753 2549',
      // Teléfono para llamadas entregado por el propietario (2026-10-07).
      phone: '+50525682222',
      phoneLabel: '+505 2568 2222',
      // Correo de la publicidad del hotel enviada por el propietario (2026-10-07).
      email: 'encantodelsursjs@gmail.com',
      // Ubicación entregada por el propietario (2026-10-07): enlace exacto de Google Maps y dirección que
      // ese enlace confirma.
      mapsUrl: 'https://maps.app.goo.gl/zg64Cd6hWcq5psGF7',
      address: 'Av. Gaspar García Laviana, San Juan del Sur 48600',
      // Plus Code entregado por el propietario: 742H+HX San Juan del Sur (763P742H+HX), celda ~14 m.
      // Centro decodificado = ubicación exacta (las coordenadas "aproximadas" previas quedaban 143 m al sur).
      plusCode: '763P742H+HX',
      latitude: 11.2514375,
      longitude: -85.8700625,
      locationPrecision: 'exact',
      mapsQuery: 'Hotel Encanto del Sur, San Juan del Sur, Nicaragua',
      amenities: ['standard', 'family', 'groups', 'equipped', 'airConditioning', 'wifi', 'cableTv', 'dailyCleaning', 'personalService', 'familyAtmosphere', 'nearBeach'],
      prices: [
        { key: 'coupleNoAc', amount: 30, currency: 'USD' },
        { key: 'coupleAc', amount: 40, currency: 'USD' }
      ],
      // El hotel publica su tarifa en dólares. Se muestra primero en córdobas (regla BAQUEANO) con el
      // cambio de referencia del proyecto (mismo valor que BAQÜI y el planificador).
      exchangeRate: { USD_NIO: 36.6243, verifiedAt: '2026-10-01' },
      pricesValidFrom: '2026-10-01',
      pricesValidUntil: '2026-10-31',
      source: 'business_owner',
      checkedAt: '2026-10-07'
    }
  ]);
})(window);
