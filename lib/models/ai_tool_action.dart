// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MODELO DE HERRAMIENTAS Y ACCIONES DE IA (AI TOOL ACTION)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Permitir que la IA de Baqueano no solo dialogue, sino que proporcione acciones
//   interactivas ejecutables en el cliente (Function Calling visual y nativo).
// - Facilitar al viajero la apertura de fichas de lugares, ubicación en mapa satelital,
//   contacto directo por WhatsApp con anfitriones y reservas directas sin intermediarios.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Enumerable `AiToolType` tipado para cada acción ejecutable.
// - Clase inmutable `AiToolAction` con etiqueta, payload de datos y métodos de serialización.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & MODELO EXPUESTO):
// - `AiToolType`: Tipos de acción (`showMap`, `viewPlace`, `openCheckout`, `callPhone`, `openWhatsApp`).
// - `AiToolAction`: Entidad con payload ejecutable por la interfaz de usuario.
// ============================================================================

enum AiToolType {
  showMap,
  viewPlace,
  openCheckout,
  callPhone,
  openWhatsApp,
  showItinerary,
}

class AiToolAction {
  final String label;
  final AiToolType type;
  final Map<String, dynamic> params;

  const AiToolAction({
    required this.label,
    required this.type,
    this.params = const {},
  });

  Map<String, dynamic> toMap() {
    return {
      'label': label,
      'type': type.name,
      'params': params,
    };
  }

  factory AiToolAction.fromMap(Map<String, dynamic> map) {
    return AiToolAction(
      label: map['label'] ?? '',
      type: AiToolType.values.firstWhere(
        (t) => t.name == map['type'],
        orElse: () => AiToolType.viewPlace,
      ),
      params: Map<String, dynamic>.from(map['params'] ?? {}),
    );
  }
}
