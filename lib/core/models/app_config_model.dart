// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MODELO DE CONFIGURACIÓN REMOTA
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Permitir a los gestores controlar desde la Web Administrativa parámetros globales
//   de la aplicación (anuncios en la cinta superior, tasa oficial de cambio USD/NIO,
//   categorías activas y promociones) sin necesidad de recompilar la App.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Documento único en Cloud Firestore (`app_config/global`) transmitido vía Stream
//   a la aplicación para reactividad en tiempo real.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES EXPUESTOS):
// - `AppConfigModel`: Entidad de configuración central del ecosistema.
// ============================================================================

// BAQUEANO
// ARCHIVO: app_config_model.dart
// MÓDULO: Configuración Remota
// PROYECTO: SHARED (Administrado en ADMIN WEB, consumido por APP)
// INTEGRACIÓN: Cloud Firestore / app_config/global
// CONSUMIDO POR: AnnouncementRibbon, CheckoutEngine, QuickCategoriesCarousel
// RESPONSABILIDAD: Parámetros globales y promocionales en tiempo real.
// NO CONTIENE: Lógica de red.

class AppConfigModel {
  final String id;
  final String announcementText;
  final String announcementRoute;
  final bool isAnnouncementActive;
  final double officialExchangeRate;
  final List<String> activeCategories;
  final String promoCouponCode;
  final double promoDiscountPercent;
  final DateTime updatedAt;

  const AppConfigModel({
    this.id = 'global',
    required this.announcementText,
    this.announcementRoute = '/descubrir',
    this.isAnnouncementActive = true,
    this.officialExchangeRate = 36.65,
    required this.activeCategories,
    this.promoCouponCode = 'BAQUEANO2026',
    this.promoDiscountPercent = 0.15,
    required this.updatedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'announcementText': announcementText,
      'announcementRoute': announcementRoute,
      'isAnnouncementActive': isAnnouncementActive,
      'officialExchangeRate': officialExchangeRate,
      'activeCategories': activeCategories,
      'promoCouponCode': promoCouponCode,
      'promoDiscountPercent': promoDiscountPercent,
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  factory AppConfigModel.fromMap(Map<String, dynamic> map, [String? docId]) {
    return AppConfigModel(
      id: docId ?? map['id'] ?? 'global',
      announcementText: map['announcementText'] ??
          '¡OFERTAS EXCLUSIVAS! Descubre las mejores promociones de negocios locales y explora nuestros lugares de referencia nacional.',
      announcementRoute: map['announcementRoute'] ?? '/descubrir',
      isAnnouncementActive: map['isAnnouncementActive'] ?? true,
      officialExchangeRate: (map['officialExchangeRate'] as num?)?.toDouble() ?? 36.65,
      activeCategories: List<String>.from(map['activeCategories'] ?? [
        'Hospedaje',
        'Restaurantes',
        'Café',
        'Volcanes',
        'Playas',
        'Artesanía',
      ]),
      promoCouponCode: map['promoCouponCode'] ?? 'BAQUEANO2026',
      promoDiscountPercent: (map['promoDiscountPercent'] as num?)?.toDouble() ?? 0.15,
      updatedAt: map['updatedAt'] != null
          ? DateTime.tryParse(map['updatedAt']) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}
