// ============================================================================
// 📌 CONSTANTES GLOBALES, REGLAS FISCALES & CONTACTOS (APP_CONSTANTS.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Centralizar los parámetros económicos, reglas tributarias de Nicaragua (DGI/INTUR),
//   códigos de emergencia nacionales y enlaces institucionales en una única fuente de verdad.
// - Garantizar que los cálculos de precios bimoneda (Dólares USD y Córdobas NIO)
//   y la exoneración del 15% de IVA a turistas extranjeros se calculen de manera exacta.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Constantes estáticas `const` evaluadas en tiempo de compilación para cero sobrecosto en memoria.
// - Soporta tanto marcación rápida de 3 dígitos (ej: 118) como números internacionales (+505).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & CONSTANTES EXPUESTAS):
// - `AppConstants.exchangeRateNioUsd`: Tasa oficial de cambio fija (36.65 C$/USD).
// - `AppConstants.residentVatRate` (15%) y `AppConstants.touristVatRate` (0%).
// - Teléfonos de emergencia (Policía Nacional, Cruz Roja, Bomberos Unificados e INTUR).
// ============================================================================

class AppConstants {
  // --------------------------------------------------------------------------
  // 🧭 IDENTIDAD INSTITUCIONAL
  // --------------------------------------------------------------------------
  /// Nombre oficial del ecosistema digital de ecoturismo.
  static const String appName = 'BAQUEANO';

  /// Lema oficial que define la propuesta de valor de experiencias exclusivas.
  static const String appSlogan = 'Nicaragua en modo secreto';

  /// Subtítulo explicativo para descripciones en motores de búsqueda y onboarding.
  static const String appSubtitle =
      'Diseña rutas inmersivas con guías locales, reservas directas, mapa offline y un asistente AI que convierte tus gustos en una aventura lista para vivir.';

  // --------------------------------------------------------------------------
  // 💵 ECONOMÍA, MONEDA & REGLAS FISCALES DE NICARAGUA
  // --------------------------------------------------------------------------
  /// Tasa de cambio oficial de referencia en Nicaragua (Córdobas NIO por 1 Dólar USD).
  static const double exchangeRateNioUsd = 36.65;

  /// Tasa general del Impuesto al Valor Agregado (IVA) para residentes nacionales (15%).
  static const double residentVatRate = 0.15;

  /// Exoneración de IVA según ley de fomento al turismo extranjero (0%).
  static const double touristVatRate = 0.00;

  /// Código promocional activo de lanzamiento para la comunidad de exploradores.
  static const String promoCouponCode = 'BAQUEANO2026';

  /// Porcentaje de descuento aplicado con el cupón oficial (15% de descuento).
  static const double promoCouponDiscount = 0.15;

  // --------------------------------------------------------------------------
  // 🚨 CONTACTOS DE ASISTENCIA & LÍNEAS DE EMERGENCIA OFICIALES
  // --------------------------------------------------------------------------
  /// Marcación rápida a la Policía Nacional de Nicaragua.
  static const String policePhone = '118';

  /// Número PBX directo de la Policía Nacional con código de país.
  static const String policePhoneFull = '+505 2277-4130';

  /// Marcación rápida a la Cruz Blanca / Cruz Roja Nicaragüense para ambulancias.
  static const String redCrossPhone = '128';

  /// PBX directo de la Cruz Blanca para emergencias médicas en ruta.
  static const String redCrossPhoneFull = '+505 2265-2081';

  /// Marcación rápida al Benemérito Cuerpo de Bomberos Unificados.
  static const String firefightersPhone = '115';

  /// Línea oficial de atención al turista del Instituto Nicaragüense de Turismo (INTUR).
  static const String inturPhone = '+505 2254-5191';

  // --------------------------------------------------------------------------
  // 📬 CANALES DIGITALES DE SOPORTE & PRIVACIDAD
  // --------------------------------------------------------------------------
  /// Correo electrónico oficial de soporte técnico y coordinación con guías.
  static const String supportEmail = 'soporte@baqueano.ni';

  /// Correo oficial del oficial de cumplimiento y ejercicio de derechos ARCO.
  static const String privacyEmail = 'privacidad@baqueano.ni';

  /// Enlace directo a la API de WhatsApp con mensaje predeterminado de asistencia.
  static const String supportWhatsApp =
      'https://wa.me/50588888888?text=Hola%20Baqueano,%20necesito%20ayuda%20con%20una%20reserva';

  /// URL canónica de la plataforma web en producción alojada en Firebase Hosting.
  static const String webAppUrl = 'https://baqueanonicaragua-3e5c9.web.app/';
}
