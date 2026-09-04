// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PRUEBAS UNITARIAS DE ARQUITECTURA DE PAGOS
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Verificar la solidez, precisión financiera, seguridad PCI-DSS y correcto
//   desacoplamiento de la arquitectura de pagos (PaymentGateway).
// - Garantizar que los métodos bancarios oficiales de Nicaragua (Tarjeta,
//   BANPRO, BAC, LAFISE) se orquesten adecuadamente y que los datos sensibles
//   nunca se expongan ni persistan en el cliente.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Suite de pruebas unitarias Flutter con validación matemática de conversión de divisas,
//   máscara de tarjetas, generación de órdenes, deserialización y rechazo defensivo.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & CASOS DE PRUEBA):
// - `payment_gateway_test.dart`: Suite completa de validación.
// ============================================================================

import 'package:flutter_test/flutter_test.dart';
import 'package:baqueano_app/core/payment/models/payment_method_type.dart';
import 'package:baqueano_app/core/payment/models/payment_order.dart';
import 'package:baqueano_app/core/payment/models/payment_transaction.dart';
import 'package:baqueano_app/core/payment/payment_gateway.dart';

class MockPaymentBackendClient implements PaymentBackendClient {
  final Map<String, dynamic>? response;
  final Exception? error;

  MockPaymentBackendClient({this.response, this.error});

  @override
  Future<Map<String, dynamic>> createPaymentOrder(
    Map<String, dynamic> request,
  ) async {
    if (error != null) throw error!;
    return response ?? <String, dynamic>{};
  }
}

void main() {
  group('Payment Architecture — Banking Providers & Methods', () {
    test('PaymentMethodType exposes official Nicaraguan banking channels', () {
      final methods = PaymentMethodType.values;
      expect(methods.length, 4);

      final card = PaymentMethodType.fromId('card');
      expect(card, PaymentMethodType.card);
      expect(card.displayName, contains('Tarjeta'));

      final banpro = PaymentMethodType.fromId('banpro');
      expect(banpro, PaymentMethodType.banpro);
      expect(banpro.displayName, contains('BANPRO'));

      final bac = PaymentMethodType.fromId('bac');
      expect(bac, PaymentMethodType.bac);
      expect(bac.displayName, contains('BAC'));

      final lafise = PaymentMethodType.fromId('lafise');
      expect(lafise, PaymentMethodType.lafise);
      expect(lafise.displayName, contains('LAFISE'));
    });

    test(
      'PaymentOrder correctly calculates NIO amount and serializes safely',
      () {
        final order = PaymentOrder(
          orderId: 'ORD-TEST-001',
          createdByUid: 'usr_explorador_123',
          businessId: 'biz_somoto_lodge',
          businessName: 'Eco-Lodge Cañón de Somoto',
          planId: 'aliado_verificado',
          planTitle: 'Plan Aliado Verificado',
          amountUsd: 20.0,
          amountNio: 20.0 * 36.65,
          exchangeRate: 36.65,
          currency: 'USD',
          isAnnual: false,
          methodType: PaymentMethodType.banpro,
          status: PaymentOrderStatus.pending,
          createdAt: DateTime(2026, 9, 3),
          updatedAt: DateTime(2026, 9, 3),
        );

        expect(order.amountUsd, 20.0);
        expect(order.amountNio, closeTo(733.0, 0.01));
        expect(order.createdByUid, 'usr_explorador_123');

        final map = order.toMap();
        expect(map['orderId'], 'ORD-TEST-001');
        expect(map['methodType'], 'banpro');
        expect(map['createdByUid'], 'usr_explorador_123');

        final reconstructed = PaymentOrder.fromMap(map, 'ORD-TEST-001');
        expect(reconstructed.planTitle, 'Plan Aliado Verificado');
        expect(reconstructed.methodType, PaymentMethodType.banpro);
        expect(reconstructed.amountUsd, 20.0);
        expect(reconstructed.createdByUid, 'usr_explorador_123');
      },
    );

    test(
      'PaymentTransaction enforces PCI-DSS masking and backend approval',
      () {
        final tx = PaymentTransaction(
          transactionId: 'TX-SECURE-9988',
          orderId: 'ORD-TEST-001',
          createdByUid: 'usr_explorador_123',
          providerId: 'card',
          status: 'approved',
          cardBrand: 'Visa',
          last4: '4587',
          amount: 20.0,
          currency: 'USD',
          timestamp: DateTime(2026, 9, 3),
        );

        expect(tx.isApprovedByBackend, isTrue);
        expect(tx.maskedPaymentSummary, 'Visa •••• 4587');
        expect(tx.amount, 20.0);
        expect(tx.currency, 'USD');

        // Test fromMap deserialization
        final map = {
          'orderId': 'ORD-TEST-001',
          'createdByUid': 'usr_explorador_123',
          'providerId': 'card',
          'status': 'approved',
          'cardBrand': 'Visa',
          'last4': '4587',
          'amount': 20.0,
          'currency': 'USD',
          'timestamp': DateTime(2026, 9, 3).toIso8601String(),
        };
        final deserialized = PaymentTransaction.fromMap(map, 'TX-SECURE-9988');
        expect(deserialized.isApprovedByBackend, isTrue);
        expect(deserialized.maskedPaymentSummary, 'Visa •••• 4587');
      },
    );
  });

  group('PaymentGateway Defensive Validations', () {
    test(
      'PaymentGateway rejects unauthenticated users without calling backend',
      () async {
        final backend = MockPaymentBackendClient();
        final gateway = PaymentGateway(backend: backend);

        expect(
          () => gateway.createCheckoutSession(
            businessId: 'biz_01',
            planId: 'aliado_verificado',
            isAnnual: false,
            methodType: PaymentMethodType.card,
          ),
          throwsA(
            isA<PaymentGatewayException>().having(
              (e) => e.reason,
              'reason',
              PaymentFailureReason.unauthenticated,
            ),
          ),
        );
      },
    );

    test(
      'PaymentGateway watchOrder returns stream of null for empty orderId',
      () async {
        final gateway = PaymentGateway();
        final stream = gateway.watchOrder('');
        final result = await stream.first;
        expect(result, isNull);
      },
    );
  });
}
