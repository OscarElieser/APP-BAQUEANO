// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MODELO DE MENSAJES DE CHAT IA (CHAT MESSAGE)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Representar cada interacción en el hilo de conversación con Baqueano AI,
//   soportando mensajes del usuario, respuestas de los modelos de IA, acciones
//   rápidas de itinerarios y herramientas de ejecución directa (mapas, fichas, llamadas).
// - Proporcionar un nivel de confianza explícito (Confidence Layer) para distinguir
//   datos verificados de Firestore de estimaciones turísticas generales.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Modelo inmutable con serialización a Map y compatibilidad total hacia atrás.
// - Integración de lista opcional de `AiToolAction` para Function Calling en interfaz.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & MODELO EXPUESTO):
// - `ChatMessage`: Entidad de mensaje enriquecida con nivel de confianza y acciones.
// ============================================================================

import 'ai_tool_action.dart';

enum AiConfidenceLevel { high, medium, low }

class ChatMessage {
  final String id;
  final String text;
  final bool isUser;
  final DateTime timestamp;
  final List<String>? quickActions;
  final List<AiToolAction>? toolActions;
  final AiConfidenceLevel confidenceLevel;
  final bool isOfflineBackup;

  const ChatMessage({
    required this.id,
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.quickActions,
    this.toolActions,
    this.confidenceLevel = AiConfidenceLevel.medium,
    this.isOfflineBackup = false,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'text': text,
      'isUser': isUser,
      'timestamp': timestamp.toIso8601String(),
      'quickActions': quickActions,
      'toolActions': toolActions?.map((a) => a.toMap()).toList(),
      'confidenceLevel': confidenceLevel.name,
      'isOfflineBackup': isOfflineBackup,
    };
  }

  factory ChatMessage.fromMap(Map<String, dynamic> map) {
    return ChatMessage(
      id: map['id'] ?? '',
      text: map['text'] ?? '',
      isUser: map['isUser'] ?? false,
      timestamp: map['timestamp'] != null
          ? DateTime.tryParse(map['timestamp']) ?? DateTime.now()
          : DateTime.now(),
      quickActions: List<String>.from(map['quickActions'] ?? []),
      toolActions: map['toolActions'] != null
          ? (map['toolActions'] as List)
              .map((a) => AiToolAction.fromMap(Map<String, dynamic>.from(a)))
              .toList()
          : null,
      confidenceLevel: AiConfidenceLevel.values.firstWhere(
        (c) => c.name == map['confidenceLevel'],
        orElse: () => AiConfidenceLevel.medium,
      ),
      isOfflineBackup: map['isOfflineBackup'] ?? false,
    );
  }
}
