// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — INTERFAZ BASE PARA PROVEEDORES DE PAGO (PAYMENT PROVIDER)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Establecer un contrato de interfaz uniforme para cualquier procesador bancario
//   (Tarjeta / CyberSource, BANPRO, BAC, LAFISE), permitiendo intercambiar
//   o agregar pasarelas sin tocar las pantallas de la aplicación.
// - Aislar la lógica de checkout bancario, generación de links y webhooks en capas
//   independientes y testables.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Interfaz abstracta `PaymentProvider` con métodos estandarizados:
//   1. `createPaymentSession`: Genera el hosted checkout seguro o link bancario.
//   2. `verifyTransaction`: Valida el resultado del procesador seguro.
// - Prohíbe el paso o manipulación de datos de tarjetas en bruto (PAN / CVV).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & CONTRATO EXPUESTO):
// - `PaymentProvider`: Clase abstracta de cumplimiento obligatorio para cada banco.
// ============================================================================

import '../models/payment_method_type.dart';
import '../models/payment_order.dart';
import '../models/payment_transaction.dart';

abstract class PaymentProvider {
  /// Tipo de método de pago asociado
  PaymentMethodType get methodType;

  /// Nombre comercial y descriptivo del proveedor bancario
  String get providerName;

  /// Banco o entidad donde se liquidan los fondos
  String get settlementDestination;

  /// Indica si el proveedor cuenta con credenciales activas de producción
  bool get isReadyForProduction;

  /// Genera una sesión de checkout seguro con el banco o pasarela adquirente.
  /// Retorna la orden enriquecida con la URL o identificador seguro de pago.
  Future<PaymentOrder> createPaymentSession({
    required PaymentOrder order,
  });

  /// Procesa o verifica el resultado de la transacción devuelto por el checkout seguro
  /// o confirmado por el webhook del backend.
  Future<PaymentTransaction> verifyTransaction({
    required PaymentOrder order,
    required Map<String, dynamic> rawResult,
  });
}
