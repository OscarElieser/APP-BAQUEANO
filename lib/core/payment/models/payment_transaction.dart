// ============================================================================
// BAQUEANO — VISTA DE TRANSACCIÓN CONFIRMADA POR WEBHOOK
// ============================================================================
//
// POR QUÉ:
// - Una transacción solo existe después de la confirmación bancaria procesada por
//   el servidor; el cliente necesita una representación segura y no un verificador.
//
// CÓMO:
// - El modelo acepta únicamente metadatos no sensibles y usa estado pendiente si
//   el backend no envía una condición reconocida.
// - No contiene métodos que aprueben pagos ni payloads arbitrarios del proveedor.
//
// QUÉ:
// - PaymentTransaction para lectura de comprobantes ya conciliados.
// ============================================================================

import 'package:cloud_firestore/cloud_firestore.dart';

class PaymentTransaction {
  final String transactionId;
  final String orderId;
  final String createdByUid;
  final String providerId;
  final String status;
  final String cardBrand;
  final String last4;
  final double amount;
  final String currency;
  final DateTime timestamp;
  final String? authorizationReference;

  const PaymentTransaction({
    required this.transactionId,
    required this.orderId,
    required this.createdByUid,
    required this.providerId,
    required this.status,
    this.cardBrand = '',
    this.last4 = '',
    required this.amount,
    required this.currency,
    required this.timestamp,
    this.authorizationReference,
  });

  bool get isApprovedByBackend => status == 'approved';

  String get maskedPaymentSummary {
    final safeLast4 = RegExp(r'^\d{4}$').hasMatch(last4) ? last4 : '';
    if (cardBrand.isNotEmpty && safeLast4.isNotEmpty) {
      return '$cardBrand •••• $safeLast4';
    }
    return providerId.toUpperCase();
  }

  factory PaymentTransaction.fromMap(Map<String, dynamic> map, String id) {
    final rawAmount = map['amount'];
    final amount = rawAmount is num
        ? rawAmount.toDouble()
        : double.tryParse(rawAmount?.toString() ?? '') ?? 0;
    final rawTimestamp = map['timestamp'];

    return PaymentTransaction(
      transactionId: id.isNotEmpty
          ? id
          : map['transactionId']?.toString() ?? '',
      orderId: map['orderId']?.toString() ?? '',
      createdByUid: map['createdByUid']?.toString() ?? '',
      providerId: map['providerId']?.toString() ?? '',
      status: map['status']?.toString().toLowerCase() ?? 'pending',
      cardBrand: map['cardBrand']?.toString() ?? '',
      last4: map['last4']?.toString() ?? '',
      amount: amount.isFinite ? amount : 0,
      currency: map['currency']?.toString() ?? '',
      timestamp: rawTimestamp is Timestamp
          ? rawTimestamp.toDate()
          : DateTime.tryParse(rawTimestamp?.toString() ?? '') ??
                DateTime.fromMillisecondsSinceEpoch(0, isUtc: true),
      authorizationReference: map['authorizationReference']?.toString(),
    );
  }
}
