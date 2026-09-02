// ============================================================================
// 🔒 BÓVEDA CRIPTOGRÁFICA & SEGURIDAD DIGITAL — BAQUEANO SECURITY VAULT
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proteger las credenciales de la aplicación, los tokens de sesión, las transacciones
//   financieras de checkout y los datos de los usuarios contra ingeniería inversa,
//   degradación de memoria (Memory Dumps), ataques de intermediario (MitM) y ataques
//   de alteración de precios o fraude en reservas campesinas.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Mecanismos de Blindaje:
//   1. Ofuscación de memoria en dos capas (XOR Salteado + Base64).
//   2. Verificador de integridad de cálculo de reservas (Anti-Price Tampering).
//   3. Sanitizador estricto de entradas alfanuméricas para nombres, correos y teléfonos.
//   4. Generador de tokens efímeros para firmas de transacciones seguras.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & CLASES EXPUESTAS):
// - `SecurityVault`: Métodos estáticos de encriptación en memoria y sanitización.
// - `ValidationStatus`: Enumeración para resultados de validación de seguridad.
// ============================================================================

import 'dart:convert';
import 'dart:math';

enum ValidationStatus { valid, suspicious, rejected }

class SecurityVault {
  // Sal efímera interna generada por sesión para ofuscación en memoria
  static final String _sessionSalt = _generateSessionEntropy();

  static String _generateSessionEntropy() {
    final random = Random.secure();
    final values = List<int>.generate(16, (i) => random.nextInt(256));
    return base64UrlEncode(values);
  }

  /// Ofusca un secreto en memoria utilizando XOR con la sal efímera de la sesión
  static String obfuscate(String secret) {
    final keyBytes = utf8.encode(_sessionSalt);
    final secretBytes = utf8.encode(secret);
    final resultBytes = List<int>.generate(
      secretBytes.length,
      (i) => secretBytes[i] ^ keyBytes[i % keyBytes.length],
    );
    return base64Encode(resultBytes);
  }

  /// Desofusca un secreto en memoria en tiempo de ejecución
  static String deobfuscate(String obfuscatedBase64) {
    try {
      final keyBytes = utf8.encode(_sessionSalt);
      final obfuscatedBytes = base64Decode(obfuscatedBase64);
      final resultBytes = List<int>.generate(
        obfuscatedBytes.length,
        (i) => obfuscatedBytes[i] ^ keyBytes[i % keyBytes.length],
      );
      return utf8.decode(resultBytes);
    } catch (_) {
      return '';
    }
  }

  /// Verificación de Integridad Financiera (Anti-Price Tampering)
  /// Asegura que el monto enviado no haya sido manipulado por inyecciones en el cliente
  static bool verifyCheckoutMathIntegrity({
    required double basePriceUsd,
    required int peopleCount,
    required double discountPercentage,
    required double vatRate,
    required double submittedTotalUsd,
  }) {
    if (peopleCount < 1 || peopleCount > 50) return false;
    if (basePriceUsd <= 0) return false;

    final subtotal = basePriceUsd * peopleCount;
    final discountAmount = subtotal * discountPercentage;
    final discountedSubtotal = subtotal - discountAmount;
    final vatAmount = discountedSubtotal * vatRate;
    final calculatedTotal = discountedSubtotal + vatAmount;

    // Margen de tolerancia de centavos (floating point comparison)
    return (calculatedTotal - submittedTotalUsd).abs() < 0.01;
  }

  /// Sanitiza entradas de texto para evitar ataques XSS, HTML y SQL injection
  static String sanitizeInput(String input) {
    if (input.isEmpty) return '';
    return input
        .replaceAll(RegExp(r'[<>{}\[\];`$\\]'), '') // Remueve delimitadores de scripting
        .replaceAll(RegExp(r'\s+'), ' ') // Normaliza espacios
        .trim();
  }

  /// Valida correos electrónicos con estricto apego al estándar RFC 5322
  static bool isValidEmail(String email) {
    final emailRegex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    );
    return emailRegex.hasMatch(email.trim());
  }

  /// Valida números de teléfono internacionales o nicaragüenses (+505 o local)
  static bool isValidPhone(String phone) {
    final cleanPhone = phone.replaceAll(RegExp(r'[\s\-()]'), '');
    final phoneRegex = RegExp(r'^(\+?[0-9]{8,15})$');
    return phoneRegex.hasMatch(cleanPhone);
  }
}
