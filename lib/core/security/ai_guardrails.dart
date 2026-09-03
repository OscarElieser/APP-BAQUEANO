// ============================================================================
// 🛡️ MOTOR DE SEGURIDAD DIGITAL & AI GUARDRAILS — BAQUEANO DEFENSE SYSTEM
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proteger el ecosistema Baqueano y a sus usuarios contra ataques cibernéticos modernos,
//   incluyendo inyecciones de prompt maliciosas (Prompt Injection), ataques de evasión (Jailbreaks),
//   intentos de exfiltración de credenciales, robo del Prompt Maestro, violación de privacidad
//   de datos personales (PII) y ataques de denegación de servicio (DoS).
// - La privacidad y la seguridad de cada explorador es la prioridad número uno del proyecto.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Filtro de Seguridad Multicapa (Defense-in-Depth):
//   1. Normalización y remoción de caracteres de control invisibles (Zero-width bypasses).
//   2. Detección exhaustiva de patrones de Jailbreak (DAN, Developer Mode, Persona Exploits,
//      delimitadores `<|system|>`, `[INST]`, `### System:`, etc.).
//   3. Detección de cargas ofuscadas en Base64 / Hexadecimal dirigidas a burlar filtros.
//   4. Protección de Privacidad PII: Detección y bloqueo de números de tarjeta, credenciales y secretos.
//   5. Protección del Prompt Maestro contra intentos de extracción o fuga de instrucciones.
//   6. Control de tasa dinámico (Sliding Window Rate Limiting) con control de ráfagas anti-DoS.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & CLASES EXPUESTAS):
// - `AiGuardrails`: Motor estático de validación, sanitización y auditoría de IA.
// - `SecurityValidationResult`: Resultado inmutable con flags de seguridad y mensajes explicativos.
// ============================================================================

import 'dart:convert';

class SecurityValidationResult {
  final bool isSafe;
  final String sanitizedQuery;
  final String? riskReason;
  final String auditToken;

  const SecurityValidationResult({
    required this.isSafe,
    required this.sanitizedQuery,
    this.riskReason,
    required this.auditToken,
  });
}

class AiGuardrails {
  // --------------------------------------------------------------------------
  // PATRONES ADVERSARIOS & JAILBREAKS DE ALTA SEVERIDAD
  // --------------------------------------------------------------------------
  static final List<RegExp> _jailbreakPatterns = [
    // 1. Anulación de directivas y reinicio de contexto (System Overrides)
    RegExp(r'(ignore|disregard|forget|bypass|override)\s+(all\s+)?(previous|prior|system|developer)\s+(instructions|prompts|rules|guidelines)', caseSensitive: false),
    RegExp(r'(ignora|olvida|descarta|omite)\s+(todas\s+las\s+)?(instrucciones|directivas|reglas)\s+(anteriores|previas|del\s+sistema)', caseSensitive: false),
    RegExp(r'(you\s+are\s+now|act\s+as|pretend\s+to\s+be)\s+(an?\s+)?(unrestricted|unfiltered|jailbroken|evil|unaligned|dan|developer\s+mode)', caseSensitive: false),
    RegExp(r'(ahora\s+eres|actua\s+como|finge\s+ser)\s+(un\s+)?(ia\s+sin\s+restricciones|modo\s+desarrollador|sin\s+filtros)', caseSensitive: false),
    RegExp(r'(\bDAN\b|\bJailbreak\b|\bDeveloper\s+Mode\b|\bUncensored\b|\bDo\s+Anything\s+Now\b)', caseSensitive: false),

    // 2. Delimitadores de Secuestro de Contexto (Context Hijacking / Delimiter Injection)
    RegExp(r'(<\|im_start\|>|<\|system\|>|<\|im_end\|>|<\|assistant\|>)', caseSensitive: false),
    RegExp(r'(\[INST\]|\[\/INST\]|###\s*System:|###\s*Instruction:|###\s*Human:|###\s*Assistant:)', caseSensitive: false),
    RegExp(r'(System\s*:\s*You\s+are|Assistant\s*:\s*Understood)', caseSensitive: false),

    // 3. Extracción y Fuga de Prompts del Sistema (Prompt Leaking / Intellectual Property Theft)
    RegExp(r'(repeat|print|show|dump|reveal|output|display)\s+(your\s+)?(system\s+prompt|initial\s+instructions|master\s+prompt|context)', caseSensitive: false),
    RegExp(r'(revela|muestra|repite|imprime|dime)\s+(tu\s+)?(prompt\s+del\s+sistema|instrucciones\s+del\s+sistema|prompt\s+maestro)', caseSensitive: false),
    RegExp(r'(what\s+are\s+your\s+instructions|cuales\s+son\s+tus\s+instrucciones\s+iniciales)', caseSensitive: false),

    // 4. Inyección de Código de Sistema y Exploits (Command Injection / SQLi / XSS)
    RegExp(r'(<script|javascript:|onload=|onerror=|<svg|<iframe)', caseSensitive: false),
    RegExp(r'(\bexec\b|\beval\b|\bsystem\(|\bpassthru\(|\bcmd\.exe|\b\/bin\/sh|\b\/bin\/bash)', caseSensitive: false),
    RegExp(r'(\bUNION\s+SELECT\b|\bDROP\s+TABLE\b|--\s*$|\bOR\s+1=1\b|\bINSERT\s+INTO\b)', caseSensitive: false),

    // 5. Exfiltración de Secretos, Llaves y Tokens de Infraestructura
    RegExp(r'(\.env|api[_-]?key|secret[_-]?token|bearer\s+ey|groq[_-]?key|gemini[_-]?key|firebase[_-]?token)', caseSensitive: false),
    RegExp(r'(google-services\.json|credentials\.json|private_key|service_account)', caseSensitive: false),

    // 6. Protección de Privacidad PII: Tarjetas de Crédito y Cuentas Bancarias
    RegExp(r'\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b'), // Tarjetas Visa/MasterCard/Amex/Discover
    RegExp(r'(cvv|cvc|expiracion|expiration|password|contrase[ñn]a)\s*[:=]\s*[^\s]+', caseSensitive: false),
  ];

  // Detección de cargas ofuscadas en Base64 (posible bypass de filtros)
  static final RegExp _base64SuspiciousPattern = RegExp(r'[A-Za-z0-9+/]{36,}={0,2}');

  // Control de tasa deslizante (Sliding Window Rate Limiter anti-DoS)
  static final List<DateTime> _requestTimestamps = [];
  static const int _maxRequestsPerWindow = 10;
  static const int _windowSeconds = 45;

  /// Intención: Validar y sanitizar minuciosamente la consulta antes de contactar a los LLMs.
  /// Mecanismo: Remoción de Unicode invisible, rate limiting, inspección regex y neutralización HTML.
  /// Importancia: Salvaguarda absoluta de la privacidad del explorador y prevención de ataques AI.
  static SecurityValidationResult sanitizeAndValidate(String query) {
    // 1. Limpieza preliminar y eliminación de caracteres invisibles Unicode (Zero-Width Bypasses)
    var cleaned = query
        .replaceAll(RegExp(r'[\u200B-\u200D\uFEFF]'), '') // Zero-width spaces
        .replaceAll(RegExp(r'[\u202A-\u202E]'), '') // BiDi override characters
        .replaceAll(RegExp(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]'), '') // Caracteres de control ASCII
        .trim();

    final auditToken = generateAuditToken(cleaned);

    // 2. Validación de Longitud (Evita desbordamientos y consumo excesivo de tokens)
    if (cleaned.isEmpty) {
      return SecurityValidationResult(
        isSafe: false,
        sanitizedQuery: '',
        riskReason: 'La consulta no puede estar vacía.',
        auditToken: auditToken,
      );
    }

    if (cleaned.length > 700) {
      return SecurityValidationResult(
        isSafe: false,
        sanitizedQuery: '',
        riskReason: 'La longitud de la consulta supera el límite de seguridad permitido (máximo 700 caracteres).',
        auditToken: auditToken,
      );
    }

    // 3. Control de Tasa (Rate Limiting anti-DoS y prevención de saturación de costos)
    final now = DateTime.now();
    _requestTimestamps.removeWhere((ts) => now.difference(ts).inSeconds > _windowSeconds);

    if (_requestTimestamps.length >= _maxRequestsPerWindow) {
      return SecurityValidationResult(
        isSafe: false,
        sanitizedQuery: '',
        riskReason: 'Límite de peticiones alcanzado: Por favor espera unos segundos antes de enviar otra consulta.',
        auditToken: auditToken,
      );
    }

    _requestTimestamps.add(now);

    // 4. Detección de Cargas Ofuscadas en Base64
    if (_base64SuspiciousPattern.hasMatch(cleaned)) {
      return SecurityValidationResult(
        isSafe: false,
        sanitizedQuery: '',
        riskReason: 'Carga de datos codificada no permitida detectada por el sistema de seguridad preventiva.',
        auditToken: auditToken,
      );
    }

    // 5. Detección de Firmas de Ataque y Jailbreaks
    for (final pattern in _jailbreakPatterns) {
      if (pattern.hasMatch(cleaned)) {
        return SecurityValidationResult(
          isSafe: false,
          sanitizedQuery: '',
          riskReason: 'Consulta bloqueada por el Escudo de Seguridad Digital Baqueano (infracción de directivas de IA y privacidad).',
          auditToken: auditToken,
        );
      }
    }

    // 6. Sanitización Preventiva de Caracteres HTML/Scripting
    final sanitized = cleaned
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');

    return SecurityValidationResult(
      isSafe: true,
      sanitizedQuery: sanitized,
      auditToken: auditToken,
    );
  }

  /// Genera un token criptográfico de auditoría para trazabilidad de cada consulta
  static String generateAuditToken(String payload) {
    final bytes = utf8.encode('$payload-${DateTime.now().millisecondsSinceEpoch}');
    return base64UrlEncode(bytes.take(24).toList());
  }
}
