// ============================================================================
// BAQUEANO — MÉTODOS SOLICITABLES EN CHECKOUT HOSPEDADO
// ============================================================================
//
// POR QUÉ:
// - Nombrar un banco en la interfaz no demuestra afiliación ni disponibilidad.
//   El servidor debe decidir qué canal está habilitado para cada comercio.
//
// CÓMO:
// - El enum contiene solo identificadores y textos de presentación.
// - Ningún valor declara que una integración esté activa, liquide fondos o pueda
//   aprobar una transacción desde el teléfono.
//
// QUÉ:
// - PaymentMethodType con tarjeta y redirecciones bancarias soportadas por contrato.
// ============================================================================

import 'package:flutter/material.dart';

enum PaymentMethodType {
  card(
    id: 'card',
    displayName: 'Tarjeta bancaria',
    subtitle: 'Checkout hospedado; disponibilidad validada por el servidor',
    icon: Icons.credit_card_rounded,
  ),
  banpro(
    id: 'banpro',
    displayName: 'BANPRO',
    subtitle: 'Canal habilitado únicamente si existe afiliación activa',
    icon: Icons.account_balance_rounded,
  ),
  bac(
    id: 'bac',
    displayName: 'BAC Credomatic',
    subtitle: 'Canal habilitado únicamente si existe afiliación activa',
    icon: Icons.storefront_rounded,
  ),
  lafise(
    id: 'lafise',
    displayName: 'LAFISE',
    subtitle: 'Canal habilitado únicamente si existe afiliación activa',
    icon: Icons.repeat_rounded,
  );

  final String id;
  final String displayName;
  final String subtitle;
  final IconData icon;

  const PaymentMethodType({
    required this.id,
    required this.displayName,
    required this.subtitle,
    required this.icon,
  });

  static PaymentMethodType fromId(String id) {
    return PaymentMethodType.values.firstWhere(
      (method) => method.id == id,
      orElse: () => PaymentMethodType.card,
    );
  }
}
