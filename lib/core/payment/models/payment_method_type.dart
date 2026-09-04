// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MODELO DE TIPOS DE MÉTODOS DE PAGO
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Tipificar los métodos de pago bancarios y digitales oficiales admitidos en el
//   ecosistema Baqueano para el cobro de membresías comerciales y turísticas.
// - Evitar integraciones improvisadas o no autorizadas en el checkout, exponiendo
//   únicamente canales bancarios certificados en Nicaragua.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Enum `PaymentMethodType` con propiedades declarativas: título, subtítulo,
//   icono, canal adquirente, soporte de recurrencia y estado de disponibilidad.
// - Total desacoplamiento de la vista con respecto a la lógica de procesamiento.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & MODELO EXPUESTO):
// - `PaymentMethodType`: Enum con `card`, `banpro`, `bac`, `lafise`.
// - Metadatos de visualización e identificación técnica para el PaymentGateway.
// ============================================================================

import 'package:flutter/material.dart';

enum PaymentMethodType {
  /// Tarjeta bancaria de crédito/débito (Visa, Mastercard de cualquier banco emisor).
  /// Procesada a través de pasarela certificada PCI-DSS con tokenización.
  card(
    id: 'card',
    displayName: 'Tarjeta Bancaria',
    subtitle: 'Visa / Mastercard (BAC, BANPRO, LAFISE e internacionales)',
    icon: Icons.credit_card_rounded,
    isAvailableForProduction: true,
    settlementBank: 'BANPRO Nicaragua (Vía Adquirente)',
  ),

  /// Pasarela / canal oficial BANPRO Nicaragua (CyberSource / Link seguro).
  /// Liquida directamente en cuenta empresarial BANPRO de Baqueano.
  banpro(
    id: 'banpro',
    displayName: 'BANPRO Nicaragua',
    subtitle: 'Canal digital oficial BANPRO (CyberSource / Link Seguro)',
    icon: Icons.account_balance_rounded,
    isAvailableForProduction: true,
    settlementBank: 'BANPRO Nicaragua (Directo)',
  ),

  /// Solución oficial BAC Credomatic Nicaragua (Compra Click / E-Commerce).
  /// Requiere liquidación en cuenta BAC Credomatic.
  bac(
    id: 'bac',
    displayName: 'BAC Credomatic',
    subtitle: 'Enlace de pago seguro Compra Click 3D Secure',
    icon: Icons.storefront_rounded,
    isAvailableForProduction: true,
    settlementBank: 'BAC Credomatic (Cuenta Afiliada)',
  ),

  /// Solución oficial Banco LAFISE Nicaragua (E-Commerce / Pago Recurrente).
  /// Requiere liquidación en cuenta Banco LAFISE.
  lafise(
    id: 'lafise',
    displayName: 'Banco LAFISE',
    subtitle: 'E-Commerce con débito recurrente automatizado',
    icon: Icons.repeat_rounded,
    isAvailableForProduction: true,
    settlementBank: 'Banco LAFISE (Cuenta Afiliada)',
  );

  final String id;
  final String displayName;
  final String subtitle;
  final IconData icon;
  final bool isAvailableForProduction;
  final String settlementBank;

  const PaymentMethodType({
    required this.id,
    required this.displayName,
    required this.subtitle,
    required this.icon,
    required this.isAvailableForProduction,
    required this.settlementBank,
  });

  /// Busca el tipo de método a partir de su identificador de texto.
  static PaymentMethodType fromId(String id) {
    return PaymentMethodType.values.firstWhere(
      (element) => element.id == id,
      orElse: () => PaymentMethodType.card,
    );
  }
}
