// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MODELO DE ORDEN DE PAGO (PAYMENT ORDER)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Representar la intención de compra formal y el contrato fiscal/financiero
//   antes de derivar al usuario al checkout seguro bancario.
// - Garantizar trazabilidad completa en Firestore de cada transacción iniciada,
//   evitando inconsistencias y permitiendo auditoría y conciliación contable.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Inmutable data class con serialización bidireccional a Map/Firestore.
// - Conversión monetaria precisa entre USD y NIO usando tasa de cambio de referencia.
// - Soporte para planes mensuales y anuales con sus respectivos identificadores.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & MODELO EXPUESTO):
// - `PaymentOrder`: Entidad central de órdenes de facturación.
// - `PaymentOrderStatus`: Enum de estados de vida de la orden.
// ============================================================================

import 'payment_method_type.dart';

enum PaymentOrderStatus {
  pending,
  processing,
  paid,
  failed,
  cancelled;

  static PaymentOrderStatus fromString(String val) {
    return PaymentOrderStatus.values.firstWhere(
      (e) => e.name.toLowerCase() == val.toLowerCase(),
      orElse: () => PaymentOrderStatus.pending,
    );
  }
}

class PaymentOrder {
  final String orderId;
  final String businessId;
  final String businessName;
  final String planId;
  final String planTitle;
  final double amountUsd;
  final double amountNio;
  final double exchangeRate;
  final String currency;
  final bool isAnnual;
  final PaymentMethodType methodType;
  final PaymentOrderStatus status;
  final String? checkoutUrl;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Map<String, dynamic> metadata;

  const PaymentOrder({
    required this.orderId,
    required this.businessId,
    required this.businessName,
    required this.planId,
    required this.planTitle,
    required this.amountUsd,
    required this.amountNio,
    this.exchangeRate = 36.65,
    this.currency = 'USD',
    this.isAnnual = false,
    required this.methodType,
    this.status = PaymentOrderStatus.pending,
    this.checkoutUrl,
    required this.createdAt,
    required this.updatedAt,
    this.metadata = const {},
  });

  PaymentOrder copyWith({
    String? orderId,
    String? businessId,
    String? businessName,
    String? planId,
    String? planTitle,
    double? amountUsd,
    double? amountNio,
    double? exchangeRate,
    String? currency,
    bool? isAnnual,
    PaymentMethodType? methodType,
    PaymentOrderStatus? status,
    String? checkoutUrl,
    DateTime? createdAt,
    DateTime? updatedAt,
    Map<String, dynamic>? metadata,
  }) {
    return PaymentOrder(
      orderId: orderId ?? this.orderId,
      businessId: businessId ?? this.businessId,
      businessName: businessName ?? this.businessName,
      planId: planId ?? this.planId,
      planTitle: planTitle ?? this.planTitle,
      amountUsd: amountUsd ?? this.amountUsd,
      amountNio: amountNio ?? this.amountNio,
      exchangeRate: exchangeRate ?? this.exchangeRate,
      currency: currency ?? this.currency,
      isAnnual: isAnnual ?? this.isAnnual,
      methodType: methodType ?? this.methodType,
      status: status ?? this.status,
      checkoutUrl: checkoutUrl ?? this.checkoutUrl,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      metadata: metadata ?? this.metadata,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'orderId': orderId,
      'businessId': businessId,
      'businessName': businessName,
      'planId': planId,
      'planTitle': planTitle,
      'amountUsd': amountUsd,
      'amountNio': amountNio,
      'exchangeRate': exchangeRate,
      'currency': currency,
      'isAnnual': isAnnual,
      'methodType': methodType.id,
      'status': status.name,
      'checkoutUrl': checkoutUrl,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'metadata': metadata,
    };
  }

  factory PaymentOrder.fromMap(Map<String, dynamic> map, String id) {
    final usd = (map['amountUsd'] as num?)?.toDouble() ?? 0.0;
    final rate = (map['exchangeRate'] as num?)?.toDouble() ?? 36.65;
    final nio = (map['amountNio'] as num?)?.toDouble() ?? (usd * rate);

    return PaymentOrder(
      orderId: id.isNotEmpty ? id : (map['orderId'] ?? ''),
      businessId: map['businessId'] ?? '',
      businessName: map['businessName'] ?? 'Negocio Turístico Baqueano',
      planId: map['planId'] ?? 'aliado_verificado',
      planTitle: map['planTitle'] ?? 'Plan Aliado Verificado',
      amountUsd: usd,
      amountNio: nio,
      exchangeRate: rate,
      currency: map['currency'] ?? 'USD',
      isAnnual: map['isAnnual'] ?? false,
      methodType: PaymentMethodType.fromId(map['methodType'] ?? 'card'),
      status: PaymentOrderStatus.fromString(map['status'] ?? 'pending'),
      checkoutUrl: map['checkoutUrl'],
      createdAt: map['createdAt'] != null
          ? DateTime.tryParse(map['createdAt']) ?? DateTime.now()
          : DateTime.now(),
      updatedAt: map['updatedAt'] != null
          ? DateTime.tryParse(map['updatedAt']) ?? DateTime.now()
          : DateTime.now(),
      metadata: Map<String, dynamic>.from(map['metadata'] ?? {}),
    );
  }
}
