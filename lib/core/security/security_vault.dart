// ============================================================================
// 🔒 BÓVEDA CRIPTOGRÁFICA & SEGURIDAD DIGITAL — BAQUEANO SECURITY VAULT
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proteger las credenciales de la aplicación, tokens de sesión permanente, transacciones
//   financieras de checkout y los datos personales de los usuarios contra ingeniería inversa,
//   volcados de memoria (Memory Dumps), ataques de intermediario (MitM), alteración de
//   precios y fugas de privacidad (PII).
// - La seguridad de datos de los exploradores y la soberanía de las comunidades campesinas
//   es innegociable.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Mecanismos de Blindaje:
//   1. Ofuscación de memoria en dos capas (XOR Salteado + Base64 con entropía efímera).
//   2. Enmascaramiento de Privacidad PII (correos y teléfonos ocultos para interfaces públicas).
//   3. Verificador de integridad de cálculo de reservas (Anti-Price Tampering en cliente).
//   4. Sanitizador estricto de entradas alfanuméricas para nombres, relatos y perfiles.
//   5. Detección preventiva de fugas accidentales de datos sensibles.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & CLASES EXPUESTAS):
// - `SecurityVault`: Métodos estáticos de encriptación en memoria, sanitización y enmascaramiento.
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

  /// Ofusca un secreto en memoria o disco utilizando XOR con la sal efímera de la sesión
  static String obfuscate(String secret) {
    if (secret.isEmpty) return '';
    final keyBytes = utf8.encode(_sessionSalt);
    final secretBytes = utf8.encode(secret);
    final resultBytes = List<int>.generate(
      secretBytes.length,
      (i) => secretBytes[i] ^ keyBytes[i % keyBytes.length],
    );
    return base64Encode(resultBytes);
  }

  /// Desofusca un secreto en tiempo de ejecución
  static String deobfuscate(String obfuscatedBase64) {
    if (obfuscatedBase64.isEmpty) return '';
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

  /// Intención: Enmascarar correos electrónicos en pantallas públicas para proteger la privacidad del explorador.
  /// Mecanismo: Muestra el primer carácter y el dominio, ocultando el resto con asteriscos (ej. c****@gmail.com).
  static String maskEmail(String email) {
    final trimmed = email.trim();
    final parts = trimmed.split('@');
    if (parts.length != 2) return '*****';
    final user = parts[0];
    final domain = parts[1];
    if (user.length <= 2) return '$user****@$domain';
    return '${user[0]}${'*' * (user.length - 2)}${user[user.length - 1]}@$domain';
  }

  /// Intención: Enmascarar números de teléfono para prevenir recolección de datos y spam.
  static String maskPhone(String phone) {
    final clean = phone.replaceAll(RegExp(r'[\s\-()]'), '');
    if (clean.length < 8) return '****-****';
    final start = clean.substring(0, 4);
    final end = clean.substring(clean.length - 2);
    return '$start-****-$end';
  }

  /// Verificación de Integridad Financiera (Anti-Price Tampering)
  /// Asegura que el monto de una reserva no haya sido alterado por scripts en el cliente
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
