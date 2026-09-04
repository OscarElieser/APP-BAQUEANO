// ============================================================================
// 🧭 BAQUEANO — UTILIDADES DEFENSIVAS DE PRIVACIDAD Y VALIDACIÓN
// ============================================================================
//
// 🎯 POR QUÉ (WHY / PROPÓSITO):
// - Reducir la exposición accidental de datos personales en la interfaz y
//   rechazar entradas claramente inválidas antes de enviarlas a servicios.
// - Evitar que una utilidad del cliente se confunda con almacenamiento seguro,
//   autenticación o autorización financiera, responsabilidades del sistema remoto.
//
// ⚙️ CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Se aplican funciones puras para enmascarar datos, normalizar texto y validar
//   formatos; no se guardan secretos, tokens ni perfiles dentro de esta clase.
// - El cálculo de checkout solo detecta inconsistencias de interfaz. El backend
//   debe recalcular y autorizar siempre precios, descuentos, impuestos y pagos.
// - Los números no finitos, porcentajes fuera de rango y entradas mal formadas se
//   rechazan de manera defensiva sin lanzar excepciones hacia la UI.
//
// 📦 QUÉ (WHAT / ENTREGABLES):
// - `SecurityVault`: enmascaramiento, sanitización y validaciones preliminares.
// - `ValidationStatus`: estados compartidos para validaciones de seguridad.
// ============================================================================

enum ValidationStatus { valid, suspicious, rejected }

class SecurityVault {
  /// Oculta parte de un correo antes de presentarlo en superficies públicas.
  static String maskEmail(String email) {
    final trimmed = email.trim();
    final parts = trimmed.split('@');
    if (parts.length != 2) {
      return '*****';
    }
    final user = parts[0];
    final domain = parts[1];
    if (user.isEmpty || domain.isEmpty) {
      return '*****';
    }
    if (user.length <= 2) {
      return '$user****@$domain';
    }
    return '${user[0]}${'*' * (user.length - 2)}${user[user.length - 1]}@$domain';
  }

  /// Oculta los dígitos centrales de un teléfono antes de mostrarlo.
  static String maskPhone(String phone) {
    final clean = phone.replaceAll(RegExp(r'[\s\-()]'), '');
    if (clean.length < 8) {
      return '****-****';
    }
    final start = clean.substring(0, 4);
    final end = clean.substring(clean.length - 2);
    return '$start-****-$end';
  }

  /// Comprueba coherencia visual del total; no aprueba ni confirma un pago.
  static bool verifyCheckoutMathIntegrity({
    required double basePriceUsd,
    required int peopleCount,
    required double discountPercentage,
    required double vatRate,
    required double submittedTotalUsd,
  }) {
    if (!basePriceUsd.isFinite ||
        !discountPercentage.isFinite ||
        !vatRate.isFinite ||
        !submittedTotalUsd.isFinite) {
      return false;
    }
    if (peopleCount < 1 || peopleCount > 50 || basePriceUsd <= 0) {
      return false;
    }
    if (discountPercentage < 0 ||
        discountPercentage > 1 ||
        vatRate < 0 ||
        vatRate > 1 ||
        submittedTotalUsd < 0) {
      return false;
    }

    final subtotal = basePriceUsd * peopleCount;
    final discountAmount = subtotal * discountPercentage;
    final discountedSubtotal = subtotal - discountAmount;
    final vatAmount = discountedSubtotal * vatRate;
    final calculatedTotal = discountedSubtotal + vatAmount;
    return calculatedTotal.isFinite &&
        (calculatedTotal - submittedTotalUsd).abs() < 0.01;
  }

  /// Retira delimitadores peligrosos y normaliza espacios de una entrada breve.
  static String sanitizeInput(String input) {
    if (input.isEmpty) {
      return '';
    }
    return input
        .replaceAll(RegExp(r'[<>{}\[\];`$\\]'), '')
        .replaceAll(RegExp(r'\s+'), ' ')
        .trim();
  }

  /// Valida el formato básico de un correo antes de enviarlo al backend.
  static bool isValidEmail(String email) {
    final emailRegex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    );
    return emailRegex.hasMatch(email.trim());
  }

  /// Valida teléfonos internacionales o nicaragüenses en formato numérico.
  static bool isValidPhone(String phone) {
    final cleanPhone = phone.replaceAll(RegExp(r'[\s\-()]'), '');
    final phoneRegex = RegExp(r'^(\+?[0-9]{8,15})$');
    return phoneRegex.hasMatch(cleanPhone);
  }
}
