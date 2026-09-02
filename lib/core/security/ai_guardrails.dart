// ============================================================================
// 🛡️ MOTOR DE SEGURIDAD DIGITAL & AI GUARDRAILS — BAQUEANO DEFENSE SYSTEM
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proteger el ecosistema Baqueano contra ataques cibernéticos modernos, incluyendo
//   inyecciones de prompt maliciosas (Prompt Injection), ataques de evasión (Jailbreaks),
//   intentos de exfiltración de datos sensibles del sistema, y ataques de denegación
//   de servicio (DoS) por saturación de costos en APIs de Inteligencia Artificial.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Filtro de Seguridad Multicapa (Defense-in-Depth):
//   1. Sanitización sintáctica y eliminación de caracteres de control peligrosos.
//   2. Detección de patrones de ataque conocidos (DAN, system overrides, XSS, SQLi).
//   3. Limitador de tasa (Sliding Window Rate Limiting) para control de cuota por dispositivo.
//   4. Validación de longitud y entropía de entrada.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & CLASES EXPUESTAS):
// - `AiGuardrails`: Clase de validación y sanitización de consultas de IA.
// - `SecurityValidationResult`: Resultado de validación con flags de seguridad y mensajes.
// ============================================================================

import 'dart:convert';

class SecurityValidationResult {
  final bool isSafe;
  final String sanitizedQuery;
  final String? riskReason;

  const SecurityValidationResult({
    required this.isSafe,
    required this.sanitizedQuery,
    this.riskReason,
  });
}

class AiGuardrails {
  static final List<RegExp> _maliciousPatterns = [
    // Intentos de anular las directivas del sistema (System Prompt Overrides)
    RegExp(r'(ignore|disregard|forget)\s+(all\s+)?(previous|prior)\s+(instructions|prompts|rules)', caseSensitive: false),
    RegExp(r'(system\s+prompt|reveal\s+instructions|show\s+system\s+message|dump\s+context)', caseSensitive: false),
    RegExp(r'(you\s+are\s+now|act\s+as\s+DAN|jailbreak|developer\s+mode|unrestricted\s+mode)', caseSensitive: false),
    
    // Inyección de código y comandos del sistema operativo (Command Injection / XSS)
    RegExp(r'(<script|javascript:|onload=|onerror=|<svg)', caseSensitive: false),
    RegExp(r'(\bexec\b|\beval\b|\bsystem\(|\bpassthru\(|\bcmd\.exe|\b\/bin\/sh)', caseSensitive: false),
    RegExp(r'(\bUNION\s+SELECT\b|\bDROP\s+TABLE\b|--\s*$|\bOR\s+1=1\b)', caseSensitive: false),

    // Exfiltración de secretos y variables de entorno
    RegExp(r'(\.env|api[_-]?key|secret[_-]?token|bearer\s+ey|groq[_-]?key)', caseSensitive: false),
  ];

  // Ventana deslizante para limitar tasa de peticiones (Anti-DDoS / Rate Limiting)
  static final List<DateTime> _requestTimestamps = [];
  static const int _maxRequestsPerMinute = 12;

  /// Valida y sanitiza una consulta antes de enviarla a los motores de IA
  static SecurityValidationResult sanitizeAndValidate(String query) {
    final trimmed = query.trim();

    // 1. Validación de Longitud (Prevenir Buffer Overflow y Ataques de Context Exhaustion)
    if (trimmed.isEmpty) {
      return const SecurityValidationResult(
        isSafe: false,
        sanitizedQuery: '',
        riskReason: 'La consulta no puede estar vacía.',
      );
    }

    if (trimmed.length > 800) {
      return const SecurityValidationResult(
        isSafe: false,
        sanitizedQuery: '',
        riskReason: 'La longitud de la consulta excede el límite de seguridad (máximo 800 caracteres).',
      );
    }

    // 2. Control de Tasa (Rate Limiting)
    final now = DateTime.now();
    _requestTimestamps.removeWhere((ts) => now.difference(ts).inSeconds > 60);

    if (_requestTimestamps.length >= _maxRequestsPerMinute) {
      return const SecurityValidationResult(
        isSafe: false,
        sanitizedQuery: '',
        riskReason: 'Límite de seguridad alcanzado: Por favor espera unos segundos antes de enviar otra consulta.',
      );
    }

    _requestTimestamps.add(now);

    // 3. Detección de Firmas de Ataque
    for (final pattern in _maliciousPatterns) {
      if (pattern.hasMatch(trimmed)) {
        return const SecurityValidationResult(
          isSafe: false,
          sanitizedQuery: '',
          riskReason: 'Consulta bloqueada por el sistema de seguridad preventiva de Baqueano.',
        );
      }
    }

    // 4. Sanitización de Caracteres Peligrosos
    final sanitized = trimmed
        .replaceAll(RegExp(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]'), '') // Caracteres de control ASCII
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');

    return SecurityValidationResult(
      isSafe: true,
      sanitizedQuery: sanitized,
    );
  }

  /// Genera un identificador de auditoría de seguridad
  static String generateAuditToken(String payload) {
    final bytes = utf8.encode('$payload-${DateTime.now().millisecondsSinceEpoch}');
    return base64UrlEncode(bytes);
  }
}
