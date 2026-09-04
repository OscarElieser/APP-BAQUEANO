// ============================================================================
// BAQUEANO — CLIENTE DE ÓRDENES DE PAGO AUTORIZADAS POR BACKEND
// ============================================================================
//
// POR QUÉ:
// - Un APK controlado por el usuario nunca debe calcular precios definitivos,
//   verificar transacciones ni activar beneficios comerciales.
// - La aplicación solo puede solicitar una sesión y observar el resultado que
//   publique un webhook bancario validado en infraestructura confiable.
//
// CÓMO:
// - Una función callable recibe únicamente identificadores de negocio, plan,
//   ciclo y método. Firebase adjunta Auth y App Check automáticamente.
// - La respuesta se valida de forma estricta antes de abrir una URL HTTPS.
// - Firestore se usa en modo solo lectura para observar el estado de la orden;
//   no existe ninguna escritura financiera desde el cliente.
//
// QUÉ:
// - PaymentGateway, PaymentBackendClient y FirebasePaymentBackendClient.
// - Errores tipificados y stream de seguimiento de órdenes.
// ============================================================================

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'models/payment_method_type.dart';
import 'models/payment_order.dart';

enum PaymentFailureReason {
  unauthenticated,
  invalidRequest,
  unavailable,
  rejected,
  invalidBackendResponse,
}

class PaymentGatewayException implements Exception {
  final PaymentFailureReason reason;
  final String message;
  final String? code;

  const PaymentGatewayException(this.reason, this.message, {this.code});

  @override
  String toString() => message;
}

abstract interface class PaymentBackendClient {
  Future<Map<String, dynamic>> createPaymentOrder(
    Map<String, dynamic> request,
  );
}

class FirebasePaymentBackendClient implements PaymentBackendClient {
  final FirebaseFunctions _functions;

  FirebasePaymentBackendClient({FirebaseFunctions? functions})
      : _functions =
            functions ??
            FirebaseFunctions.instanceFor(
              app: Firebase.app(),
              region: 'us-central1',
            );

  @override
  Future<Map<String, dynamic>> createPaymentOrder(
    Map<String, dynamic> request,
  ) async {
    try {
      final callable = _functions.httpsCallable(
        'createPaymentOrder',
        options: HttpsCallableOptions(timeout: const Duration(seconds: 20)),
      );
      final result = await callable.call<Map<String, dynamic>>(request);
      return Map<String, dynamic>.from(result.data);
    } on FirebaseFunctionsException catch (error) {
      final reason = switch (error.code) {
        'unauthenticated' => PaymentFailureReason.unauthenticated,
        'invalid-argument' => PaymentFailureReason.invalidRequest,
        'permission-denied' => PaymentFailureReason.rejected,
        'failed-precondition' => PaymentFailureReason.unavailable,
        _ => PaymentFailureReason.unavailable,
      };
      throw PaymentGatewayException(
        reason,
        error.message ?? 'No fue posible iniciar el pago.',
        code: error.code,
      );
    } catch (_) {
      throw const PaymentGatewayException(
        PaymentFailureReason.unavailable,
        'No fue posible conectar con el servicio de pagos. Intenta nuevamente.',
      );
    }
  }
}

class PaymentGateway {
  final PaymentBackendClient _backend;
  final FirebaseAuth _auth;
  final FirebaseFirestore? _firestoreOverride;

  PaymentGateway({
    PaymentBackendClient? backend,
    FirebaseAuth? auth,
    FirebaseFirestore? firestore,
  }) : _backend = backend ?? FirebasePaymentBackendClient(),
       _auth = auth ?? FirebaseAuth.instance,
       _firestoreOverride = firestore;

  FirebaseFirestore get _firestore =>
      _firestoreOverride ??
      FirebaseFirestore.instanceFor(
        app: Firebase.app(),
        databaseId: 'appbaqueano',
      );

  Future<PaymentOrder> createCheckoutSession({
    required String businessId,
    required String planId,
    required bool isAnnual,
    required PaymentMethodType methodType,
  }) async {
    final user = _auth.currentUser;
    if (user == null) {
      throw const PaymentGatewayException(
        PaymentFailureReason.unauthenticated,
        'Inicia sesión para administrar pagos de tu negocio.',
      );
    }

    final cleanBusinessId = businessId.trim();
    final cleanPlanId = planId.trim();
    if (cleanBusinessId.isEmpty || cleanPlanId.isEmpty) {
      throw const PaymentGatewayException(
        PaymentFailureReason.invalidRequest,
        'El negocio y el plan deben estar identificados.',
      );
    }

    final response = await _backend.createPaymentOrder({
      'businessId': cleanBusinessId,
      'planId': cleanPlanId,
      'isAnnual': isAnnual,
      'methodType': methodType.id,
    });

    final rawOrder = response['order'];
    if (rawOrder is! Map) {
      throw const PaymentGatewayException(
        PaymentFailureReason.invalidBackendResponse,
        'El servidor devolvió una orden incompleta.',
      );
    }

    final order = PaymentOrder.fromMap(
      Map<String, dynamic>.from(rawOrder),
      rawOrder['orderId']?.toString() ?? '',
    );
    final checkoutUri = Uri.tryParse(order.checkoutUrl ?? '');

    if (order.orderId.isEmpty ||
        order.businessId != cleanBusinessId ||
        order.planId != cleanPlanId ||
        order.createdByUid != user.uid ||
        !order.amountUsd.isFinite ||
        order.amountUsd <= 0 ||
        checkoutUri == null ||
        checkoutUri.scheme != 'https' ||
        checkoutUri.host.isEmpty) {
      throw const PaymentGatewayException(
        PaymentFailureReason.invalidBackendResponse,
        'La sesión recibida no superó la validación de seguridad.',
      );
    }

    return order;
  }

  Stream<PaymentOrder?> watchOrder(String orderId) {
    final cleanOrderId = orderId.trim();
    if (cleanOrderId.isEmpty) {
      return Stream<PaymentOrder?>.value(null);
    }
    return _firestore
        .collection('payment_orders')
        .doc(cleanOrderId)
        .snapshots()
        .map((snapshot) {
          final data = snapshot.data();
          if (!snapshot.exists || data == null) return null;
          return PaymentOrder.fromMap(data, snapshot.id);
        });
  }
}

final paymentGatewayProvider = Provider<PaymentGateway>((ref) {
  return PaymentGateway();
});
