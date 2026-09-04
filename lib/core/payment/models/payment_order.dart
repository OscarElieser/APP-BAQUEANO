// ============================================================================
// BAQUEANO — MODELO INMUTABLE DE ORDEN EMITIDA POR EL SERVIDOR
// ============================================================================
//
// POR QUÉ:
// - La interfaz necesita mostrar y seguir una orden sin asumir que el dispositivo
//   tiene autoridad sobre precio, moneda, identidad o estado financiero.
//
// CÓMO:
// - Todos los campos financieros se deserializan desde la respuesta firmada por
//   la frontera backend y usan valores conservadores ante datos ausentes.
// - Las fechas aceptan Timestamp, ISO-8601 o epoch para interoperar con callable
//   functions y snapshots Firestore sin cálculos en el hilo de interfaz.
//
// QUÉ:
// - PaymentOrderStatus y PaymentOrder con serialización de solo lectura.
// ============================================================================

import 'package:cloud_firestore/cloud_firestore.dart';

import 'payment_method_type.dart';

enum PaymentOrderStatus {
  pending,
  processing,
  paid,
  failed,
  cancelled;

  static PaymentOrderStatus fromString(Object? value) {
    final normalized = value?.toString().toLowerCase() ?? '';
    return PaymentOrderStatus.values.firstWhere(
      (status) => status.name == normalized,
      orElse: () => PaymentOrderStatus.pending,
    );
  }
}

class PaymentOrder {
  final String orderId;
  final String createdByUid;
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
    required this.createdByUid,
    required this.businessId,
    required this.businessName,
    required this.planId,
    required this.planTitle,
    required this.amountUsd,
    required this.amountNio,
    required this.exchangeRate,
    required this.currency,
    required this.isAnnual,
    required this.methodType,
    required this.status,
    this.checkoutUrl,
    required this.createdAt,
    required this.updatedAt,
    this.metadata = const {},
  });

  Map<String, dynamic> toMap() {
    return {
      'orderId': orderId,
      'createdByUid': createdByUid,
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
    final amountUsd = _finiteDouble(map['amountUsd']);
    final exchangeRate = _finiteDouble(map['exchangeRate']);
    final amountNio = _finiteDouble(map['amountNio']);

    return PaymentOrder(
      orderId: id.isNotEmpty ? id : map['orderId']?.toString() ?? '',
      createdByUid: map['createdByUid']?.toString() ?? '',
      businessId: map['businessId']?.toString() ?? '',
      businessName: map['businessName']?.toString() ?? '',
      planId: map['planId']?.toString() ?? '',
      planTitle: map['planTitle']?.toString() ?? '',
      amountUsd: amountUsd,
      amountNio: amountNio,
      exchangeRate: exchangeRate,
      currency: map['currency']?.toString() ?? '',
      isAnnual: map['isAnnual'] == true,
      methodType: PaymentMethodType.fromId(
        map['methodType']?.toString() ?? '',
      ),
      status: PaymentOrderStatus.fromString(map['status']),
      checkoutUrl: map['checkoutUrl']?.toString(),
      createdAt: _dateTime(map['createdAt']),
      updatedAt: _dateTime(map['updatedAt']),
      metadata: map['metadata'] is Map
          ? Map<String, dynamic>.from(map['metadata'] as Map)
          : const {},
    );
  }

  static double _finiteDouble(Object? value) {
    final parsed = value is num
        ? value.toDouble()
        : double.tryParse(value?.toString() ?? '') ?? 0;
    return parsed.isFinite ? parsed : 0;
  }

  static DateTime _dateTime(Object? value) {
    if (value is Timestamp) return value.toDate();
    if (value is DateTime) return value;
    if (value is int) {
      return DateTime.fromMillisecondsSinceEpoch(value, isUtc: true).toLocal();
    }
    return DateTime.tryParse(value?.toString() ?? '') ??
        DateTime.fromMillisecondsSinceEpoch(0, isUtc: true);
  }
}
