// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PRUEBAS UNITARIAS DE ARQUITECTURA DE PAGOS
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Verificar la solidez, precisión financiera, seguridad PCI-DSS y correcto
//   desacoplamiento de la arquitectura de pagos (PaymentGateway).
// - Garantizar que los métodos bancarios oficiales de Nicaragua (Tarjeta,
//   BANPRO, BAC, LAFISE) se orquesten adecuadamente y que los datos sensibles
//   nunca se expongan ni persistan.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Suite de pruebas unitarias Flutter con validación matemática de conversión de divisas,
//   máscara de tarjetas, generación de órdenes y ciclo de vida de transacciones.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & CASOS DE PRUEBA):
// - `payment_gateway_test.dart`: Suite completa de validación.
// ============================================================================

import 'package:flutter_test/flutter_test.dart';
import 'package:baqueano_app/core/payment/models/payment_method_type.dart';
import 'package:baqueano_app/core/payment/models/payment_order.dart';
import 'package:baqueano_app/core/payment/models/payment_transaction.dart';
import 'package:baqueano_app/core/payment/payment_gateway.dart';
import 'package:baqueano_app/core/payment/providers/banpro_payment_provider.dart';
import 'package:baqueano_app/core/payment/providers/card_payment_provider.dart';
import 'package:baqueano_app/core/payment/providers/bac_payment_provider.dart';
import 'package:baqueano_app/core/payment/providers/lafise_payment_provider.dart';

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
      expect(banpro.settlementBank, contains('BANPRO'));

      final bac = PaymentMethodType.fromId('bac');
      expect(bac, PaymentMethodType.bac);
      expect(bac.settlementBank, contains('BAC Credomatic'));

      final lafise = PaymentMethodType.fromId('lafise');
      expect(lafise, PaymentMethodType.lafise);
      expect(lafise.settlementBank, contains('LAFISE'));
    });

    test('PaymentOrder correctly calculates NIO amount and serializes safely', () {
      final order = PaymentOrder(
        orderId: 'ORD-TEST-001',
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

      final map = order.toMap();
      expect(map['orderId'], 'ORD-TEST-001');
      expect(map['methodType'], 'banpro');

      final reconstructed = PaymentOrder.fromMap(map, 'ORD-TEST-001');
      expect(reconstructed.planTitle, 'Plan Aliado Verificado');
      expect(reconstructed.methodType, PaymentMethodType.banpro);
      expect(reconstructed.amountUsd, 20.0);
    });

    test('PaymentTransaction enforces PCI-DSS masking (only last4 & brand)', () {
      final tx = PaymentTransaction(
        transactionId: 'TX-SECURE-9988',
        orderId: 'ORD-TEST-001',
        providerId: 'card',
        status: 'approved',
        cardBrand: 'Visa',
        last4: '4587',
        amount: 20.0,
        timestamp: DateTime(2026, 9, 3),
      );

      expect(tx.isApproved, isTrue);
      expect(tx.maskedPaymentSummary, 'Visa •••• 4587');
      expect(tx.toMap().containsKey('cvv'), isFalse);
      expect(tx.toMap().containsKey('pan'), isFalse);
    });
  });

  group('PaymentGateway Orchestration & Provider Dispatch', () {
    late PaymentGateway gateway;

    setUp(() {
      gateway = PaymentGateway(
        customProviders: [
          const CardPaymentProvider(useProductionGateway: true),
          const BanproPaymentProvider(isAffiliated: true),
          const BacPaymentProvider(isAffiliated: true),
          const LafisePaymentProvider(isAffiliated: true),
        ],
      );
    });

    test('Gateway lists available production methods', () {
      final available = gateway.getAvailablePaymentMethods();
      expect(available.length, 4);
      expect(available, contains(PaymentMethodType.card));
      expect(available, contains(PaymentMethodType.banpro));
      expect(available, contains(PaymentMethodType.bac));
      expect(available, contains(PaymentMethodType.lafise));
    });

    test('Gateway dispatches BANPRO session with direct settlement metadata', () async {
      final order = await gateway.createOrder(
        businessId: 'biz_01',
        businessName: 'Hostal Campesino Ometepe',
        planId: 'aliado_verificado',
        planTitle: 'Plan Aliado Verificado',
        amountUsd: 20.0,
        isAnnual: false,
        methodType: PaymentMethodType.banpro,
      );

      expect(order.status, PaymentOrderStatus.pending);
      expect(order.amountNio, closeTo(733.0, 0.01));

      final sessionOrder = await gateway.initiatePaymentSession(order: order);
      expect(sessionOrder.status, PaymentOrderStatus.processing);
      expect(sessionOrder.checkoutUrl, contains('pagos.banprogrupopromerica.com.ni'));
      expect(sessionOrder.metadata['directSettlement'], isTrue);
      expect(sessionOrder.metadata['settlementAccount'], contains('BANPRO'));
    });

    test('Gateway confirms payment and generates transaction audit trail', () async {
      final order = await gateway.createOrder(
        businessId: 'biz_02',
        businessName: 'Restaurante El Güegüense',
        planId: 'alianza_destacada',
        planTitle: 'Plan Alianza Destacada',
        amountUsd: 45.0,
        isAnnual: false,
        methodType: PaymentMethodType.card,
      );

      final transaction = await gateway.confirmPaymentAndActivateMembership(
        order: order,
        rawBankResult: {
          'status': 'approved',
          'brand': 'Mastercard',
          'last4': '8821',
          'transactionId': 'TX-TEST-7711',
          'authCode': 'AUTH-OK-99',
        },
      );

      expect(transaction.isApproved, isTrue);
      expect(transaction.cardBrand, 'Mastercard');
      expect(transaction.last4, '8821');
      expect(transaction.maskedPaymentSummary, 'Mastercard •••• 8821');
    });
  });
}
