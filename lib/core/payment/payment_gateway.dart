// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PASARELA CENTRAL DE PAGOS (PAYMENT GATEWAY)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Centralizar y desacoplar la orquestación de pagos de planes y membresías
//   comerciales para el ecosistema Baqueano.
// - Evitar duplicar implementaciones en cada pantalla y permitir agregar o alternar
//   entre adquirentes (CyberSource, BANPRO, BAC, LAFISE, Tilopay) de forma transparente.
// - Garantizar que los fondos de las membresías se liquiden de forma auditable
//   con destino preferente a la cuenta empresarial BANPRO de Baqueano.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Patrón Gateway + Provider Strategy: `PaymentGateway` delega la llamada al
//   `PaymentProvider` correspondiente según el método seleccionado.
// - Manejo de órdenes en Firestore (`payment_orders`), registro de comprobantes
//   auditables (`payment_transactions`) y activación de membresías
//   en la colección (`business_subscriptions`).
// - Prevención estricta contra la persistencia de datos sensibles (PAN / CVV).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & SERVICIO EXPUESTO):
// - `PaymentGateway`: Orquestador central de pagos.
// - `paymentGatewayProvider`: Proveedor Riverpod global.
// ============================================================================

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'interfaces/payment_provider.dart';
import 'models/payment_method_type.dart';
import 'models/payment_order.dart';
import 'models/payment_transaction.dart';
import 'providers/bac_payment_provider.dart';
import 'providers/banpro_payment_provider.dart';
import 'providers/card_payment_provider.dart';
import 'providers/lafise_payment_provider.dart';

class PaymentGateway {
  final Map<PaymentMethodType, PaymentProvider> _providers = {};
  FirebaseFirestore? _firestoreInstance;

  PaymentGateway({
    FirebaseFirestore? firestore,
    List<PaymentProvider>? customProviders,
  }) {
    _firestoreInstance = firestore;
    _initializeProviders(customProviders);
  }

  void _initializeProviders(List<PaymentProvider>? customProviders) {
    if (customProviders != null && customProviders.isNotEmpty) {
      for (final p in customProviders) {
        _providers[p.methodType] = p;
      }
    } else {
      // Proveedores bancarios oficiales de Nicaragua
      _registerProvider(const CardPaymentProvider());
      _registerProvider(const BanproPaymentProvider());
      _registerProvider(const BacPaymentProvider());
      _registerProvider(const LafisePaymentProvider());
    }
  }

  void _registerProvider(PaymentProvider provider) {
    _providers[provider.methodType] = provider;
  }

  FirebaseFirestore? get _firestore {
    if (_firestoreInstance != null) return _firestoreInstance;
    try {
      if (Firebase.apps.isNotEmpty) {
        _firestoreInstance = FirebaseFirestore.instanceFor(
          app: Firebase.app(),
          databaseId: 'appbaqueano',
        );
      }
    } catch (_) {
      try {
        _firestoreInstance = FirebaseFirestore.instance;
      } catch (_) {
        _firestoreInstance = null;
      }
    }
    return _firestoreInstance;
  }

  /// Retorna los métodos de pago disponibles y habilitados para producción
  List<PaymentMethodType> getAvailablePaymentMethods() {
    return _providers.keys.where((type) {
      final provider = _providers[type];
      return provider != null && provider.isReadyForProduction;
    }).toList();
  }

  /// Obtiene el proveedor específico asociado al método
  PaymentProvider getProvider(PaymentMethodType type) {
    final provider = _providers[type];
    if (provider == null) {
      throw StateError('El proveedor para ${type.displayName} no está registrado.');
    }
    return provider;
  }

  /// Crea e inicializa una nueva orden de pago para un negocio
  Future<PaymentOrder> createOrder({
    required String businessId,
    required String businessName,
    required String planId,
    required String planTitle,
    required double amountUsd,
    required bool isAnnual,
    required PaymentMethodType methodType,
    Map<String, dynamic>? additionalMetadata,
  }) async {
    const exchangeRate = 36.65; // Tasa de cambio oficial de referencia BCN / mercado
    final amountNio = amountUsd * exchangeRate;
    final orderId = 'ORD-${DateTime.now().millisecondsSinceEpoch}';

    final order = PaymentOrder(
      orderId: orderId,
      businessId: businessId,
      businessName: businessName,
      planId: planId,
      planTitle: planTitle,
      amountUsd: amountUsd,
      amountNio: amountNio,
      exchangeRate: exchangeRate,
      currency: 'USD',
      isAnnual: isAnnual,
      methodType: methodType,
      status: PaymentOrderStatus.pending,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
      metadata: additionalMetadata ?? {},
    );

    // Persistir intención de orden en Firestore
    try {
      final db = _firestore;
      if (db != null) {
        await db.collection('payment_orders').doc(orderId).set(order.toMap());
      }
    } catch (e) {
      debugPrint('⚠️ [PaymentGateway] No se pudo escribir orden en Firestore (modo offline/test): $e');
    }

    return order;
  }

  /// Inicia la sesión segura de pago con el banco correspondiente
  Future<PaymentOrder> initiatePaymentSession({
    required PaymentOrder order,
  }) async {
    final provider = getProvider(order.methodType);
    final enrichedOrder = await provider.createPaymentSession(order: order);

    // Actualizar estado en Firestore
    try {
      final db = _firestore;
      if (db != null) {
        await db.collection('payment_orders').doc(order.orderId).update({
          'status': enrichedOrder.status.name,
          'checkoutUrl': enrichedOrder.checkoutUrl,
          'updatedAt': DateTime.now().toIso8601String(),
          'metadata': enrichedOrder.metadata,
        });
      }
    } catch (e) {
      debugPrint('⚠️ [PaymentGateway] Error al actualizar estado de orden: $e');
    }

    return enrichedOrder;
  }

  /// Procesa y confirma la transacción bancaria, registrando el comprobante
  /// y activando la membresía del negocio en `business_subscriptions`
  Future<PaymentTransaction> confirmPaymentAndActivateMembership({
    required PaymentOrder order,
    required Map<String, dynamic> rawBankResult,
  }) async {
    final provider = getProvider(order.methodType);
    final transaction = await provider.verifyTransaction(
      order: order,
      rawResult: rawBankResult,
    );

    if (transaction.isApproved) {
      final now = DateTime.now();
      final expiry = order.isAnnual
          ? now.add(const Duration(days: 365))
          : now.add(const Duration(days: 30));

      // 1. Guardar transacción auditable
      try {
        final db = _firestore;
        if (db != null) {
          await db.collection('payment_transactions').doc(transaction.transactionId).set(transaction.toMap());

          // 2. Actualizar estado de orden
          await db.collection('payment_orders').doc(order.orderId).update({
            'status': PaymentOrderStatus.paid.name,
            'updatedAt': now.toIso8601String(),
            'transactionId': transaction.transactionId,
          });

          // 3. Activar membresía en `business_subscriptions`
          await db.collection('business_subscriptions').doc(order.businessId).set({
            'businessId': order.businessId,
            'businessName': order.businessName,
            'planId': order.planId,
            'planTitle': order.planTitle,
            'status': 'active',
            'isAnnual': order.isAnnual,
            'startDate': now.toIso8601String(),
            'expiryDate': expiry.toIso8601String(),
            'lastPaymentTransactionId': transaction.transactionId,
            'paymentMethodUsed': transaction.maskedPaymentSummary,
            'settlementBank': provider.settlementDestination,
            'updatedAt': now.toIso8601String(),
          }, SetOptions(merge: true));

          // 4. Actualizar estado de verificación en el documento del negocio
          if (order.businessId.isNotEmpty) {
            await db.collection('businesses').doc(order.businessId).set({
              'verified': true,
              'membershipPlan': order.planId,
              'membershipExpiry': expiry.toIso8601String(),
            }, SetOptions(merge: true));
          }
        }
      } catch (e) {
        debugPrint('⚠️ [PaymentGateway] Error al persistir activación de membresía: $e');
      }
    }

    return transaction;
  }
}

final paymentGatewayProvider = Provider<PaymentGateway>((ref) {
  return PaymentGateway();
});
