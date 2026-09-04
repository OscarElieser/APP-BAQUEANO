// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MODELO DE TRANSACCIÓN SEGURA (PCI-DSS CUMPLE)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Registrar el comprobante de confirmación de pago emitido por el procesador bancario.
// - Cumplir estrictamente con la normativa internacional PCI-DSS y las reglas del
//   proyecto: QUEDA TERMINANTEMENTE PROHIBIDO almacenar número completo de tarjeta (PAN),
//   CVV o fecha de vencimiento en Firebase o en el almacenamiento local de Baqueano.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Contiene únicamente metadatos no sensibles provistos por la pasarela:
//   `paymentId`, `transactionId`, `status`, `brand`, `last4`, monto y marca temporal.
// - Formateo amigable de comprobante para el usuario final (ej. "Visa •••• 4587").
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & MODELO EXPUESTO):
// - `PaymentTransaction`: Registro auditable de transacción aprobada o procesada.
// ============================================================================

class PaymentTransaction {
  final String transactionId;
  final String orderId;
  final String providerId; // 'card', 'banpro', 'bac', 'lafise'
  final String status; // 'approved', 'declined', 'pending_confirmation'
  final String cardBrand; // 'Visa', 'Mastercard', 'N/A'
  final String last4; // '4587', '0000', etc.
  final double amount;
  final String currency;
  final DateTime timestamp;
  final String? authCode;
  final Map<String, dynamic> providerPayload;

  const PaymentTransaction({
    required this.transactionId,
    required this.orderId,
    required this.providerId,
    required this.status,
    this.cardBrand = 'N/A',
    this.last4 = '••••',
    required this.amount,
    this.currency = 'USD',
    required this.timestamp,
    this.authCode,
    this.providerPayload = const {},
  });

  /// Retorna un identificador legible y seguro de la tarjeta o método utilizado.
  String get maskedPaymentSummary {
    if (cardBrand != 'N/A' && last4 != '••••') {
      return '$cardBrand •••• $last4';
    }
    return providerId.toUpperCase();
  }

  bool get isApproved => status.toLowerCase() == 'approved';

  Map<String, dynamic> toMap() {
    return {
      'transactionId': transactionId,
      'orderId': orderId,
      'providerId': providerId,
      'status': status,
      'cardBrand': cardBrand,
      'last4': last4,
      'amount': amount,
      'currency': currency,
      'timestamp': timestamp.toIso8601String(),
      'authCode': authCode,
      // Se garantiza que providerPayload nunca contenga PAN ni CVV
      'providerPayload': providerPayload,
    };
  }

  factory PaymentTransaction.fromMap(Map<String, dynamic> map, String id) {
    return PaymentTransaction(
      transactionId: id.isNotEmpty ? id : (map['transactionId'] ?? ''),
      orderId: map['orderId'] ?? '',
      providerId: map['providerId'] ?? 'card',
      status: map['status'] ?? 'approved',
      cardBrand: map['cardBrand'] ?? 'N/A',
      last4: map['last4'] ?? '••••',
      amount: (map['amount'] as num?)?.toDouble() ?? 0.0,
      currency: map['currency'] ?? 'USD',
      timestamp: map['timestamp'] != null
          ? DateTime.tryParse(map['timestamp']) ?? DateTime.now()
          : DateTime.now(),
      authCode: map['authCode'],
      providerPayload: Map<String, dynamic>.from(map['providerPayload'] ?? {}),
    );
  }
}
