// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MODELO DE CONTEXTO & MEMORIA DEL VIAJERO
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer memoria contextual persistente de sesión a Baqueano AI para recordar
//   destino, presupuesto, viajeros, gustos y restricciones a lo largo de la conversación.
// - Eliminar la frustración de que el explorador tenga que repetir sus datos cuando pide
//   ajustes como "está muy caro", "prefiero cabaña" o "vamos con niños".
// - Convertir al motor de IA en un copiloto proactivo capaz de reajustar itinerarios
//   conservando el contexto previo de la conversación.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Objeto inmutable `TravelerSessionContext` con método `copyWith`.
// - Motor de análisis heurístico en lenguaje natural `updateFromQuery` que extrae
//   destinos, duración, presupuestos, alertas de costo ("está muy caro") y estilos.
// - Generación de texto estructurado mediante `toPromptContext()` inyectable en System Prompts.
//
// 📦 3. QUÉ (WHAT / CLASE & CONTRATOS EXPUESTOS):
// - `TravelerSessionContext`: Estructura tipada con campos de viaje y presupuesto bimoneda.
// - `updateFromQuery`: Método estático que devuelve una nueva instancia con el contexto enriquecido.
// ============================================================================

import 'package:flutter/foundation.dart';

@immutable
class TravelerSessionContext {
  final String? destination;
  final int? days;
  final int adults;
  final int children;
  final double? budgetUsd;
  final String? travelStyle; // 'economico', 'equilibrado', 'alta_gama'
  final List<String> preferences; // ['volcanes', 'playa', 'cacao', 'cascadas']
  final List<String> discardedActivities;
  final String? selectedPlaceId;

  const TravelerSessionContext({
    this.destination,
    this.days,
    this.adults = 2,
    this.children = 0,
    this.budgetUsd,
    this.travelStyle,
    this.preferences = const [],
    this.discardedActivities = const [],
    this.selectedPlaceId,
  });

  TravelerSessionContext copyWith({
    String? destination,
    int? days,
    int? adults,
    int? children,
    double? budgetUsd,
    String? travelStyle,
    List<String>? preferences,
    List<String>? discardedActivities,
    String? selectedPlaceId,
  }) {
    return TravelerSessionContext(
      destination: destination ?? this.destination,
      days: days ?? this.days,
      adults: adults ?? this.adults,
      children: children ?? this.children,
      budgetUsd: budgetUsd ?? this.budgetUsd,
      travelStyle: travelStyle ?? this.travelStyle,
      preferences: preferences ?? this.preferences,
      discardedActivities: discardedActivities ?? this.discardedActivities,
      selectedPlaceId: selectedPlaceId ?? this.selectedPlaceId,
    );
  }

  /// Analiza una nueva consulta del usuario y actualiza la memoria contextual sin perder datos previos
  static TravelerSessionContext updateFromQuery(TravelerSessionContext current, String rawQuery) {
    final q = rawQuery.toLowerCase().trim();
    var updated = current;

    // 1. Detección de Destinos en Nicaragua
    final destinationsMap = {
      'ometepe': 'Isla de Ometepe',
      'somoto': 'Cañón de Somoto, Madriz',
      'granada': 'Granada y Las Isletas',
      'león': 'León Colonial y Volcanes',
      'leon': 'León Colonial y Volcanes',
      'san juan del sur': 'San Juan del Sur, Rivas',
      'matagalpa': 'Matagalpa, Tierras Altas',
      'jinotega': 'Jinotega y Bosawás',
      'corn island': 'Corn Island y Little Corn',
      'masaya': 'Masaya y Volcán Masaya',
      'río san juan': 'Río San Juan y El Castillo',
      'rio san juan': 'Río San Juan y El Castillo',
      'popoyo': 'Playa Popoyo, Tola',
      'tola': 'Tola, Costa Esmeralda',
    };

    for (final entry in destinationsMap.entries) {
      if (q.contains(entry.key)) {
        updated = updated.copyWith(destination: entry.value);
        break;
      }
    }

    // 2. Detección de Días de Duración
    final daysMatch = RegExp(r'(\d+)\s*(?:días|dias|dia|día)').firstMatch(q);
    if (daysMatch != null) {
      final parsedDays = int.tryParse(daysMatch.group(1) ?? '');
      if (parsedDays != null && parsedDays > 0) {
        updated = updated.copyWith(days: parsedDays);
      }
    } else if (q.contains('fin de semana')) {
      updated = updated.copyWith(days: 2);
    } else if (q.contains('una semana') || q.contains('1 semana')) {
      updated = updated.copyWith(days: 7);
    }

    // 3. Ajuste por Precio Alto ("está muy caro", "muy caro", "algo más barato", "económico")
    final isTooExpensive = q.contains('muy caro') ||
        q.contains('caro') ||
        q.contains('mas barato') ||
        q.contains('más barato') ||
        q.contains('presupuesto bajo') ||
        q.contains('economico') ||
        q.contains('económico') ||
        q.contains('sin gastar mucho') ||
        q.contains('mochilero');

    if (isTooExpensive) {
      // Reajustar estilo de viaje a económico y reducir presupuesto de referencia
      final adjustedBudget = (updated.budgetUsd != null && updated.budgetUsd! > 40)
          ? (updated.budgetUsd! * 0.6)
          : (updated.budgetUsd ?? 45.0);
      updated = updated.copyWith(
        travelStyle: 'economico',
        budgetUsd: adjustedBudget,
      );
    }

    // 4. Detección de Presupuesto Explícito en USD o Córdobas
    final usdMatch = RegExp(r'\$\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?:dolares|dólares|usd)').firstMatch(q);
    if (usdMatch != null) {
      final amountStr = usdMatch.group(1) ?? usdMatch.group(2);
      final amount = double.tryParse(amountStr ?? '');
      if (amount != null && amount > 0) {
        updated = updated.copyWith(budgetUsd: amount);
      }
    }

    final nioMatch = RegExp(r'c\$\s*(\d+)|(\d+)\s*(?:cordobas|córdobas|nio)').firstMatch(q);
    if (nioMatch != null) {
      final amountStr = nioMatch.group(1) ?? nioMatch.group(2);
      final amount = double.tryParse(amountStr ?? '');
      if (amount != null && amount > 0) {
        // Conversión a USD aproximada (tasa 36.65)
        updated = updated.copyWith(budgetUsd: amount / 36.65);
      }
    }

    // 5. Preferencias Temáticas
    final newPrefs = List<String>.from(updated.preferences);
    if (q.contains('playa') || q.contains('surf')) {
      if (!newPrefs.contains('playa')) newPrefs.add('playa');
    }
    if (q.contains('volcán') || q.contains('volcan') || q.contains('sandboarding')) {
      if (!newPrefs.contains('volcanes')) newPrefs.add('volcanes');
    }
    if (q.contains('naturaleza') || q.contains('senderismo') || q.contains('cascada')) {
      if (!newPrefs.contains('naturaleza')) newPrefs.add('naturaleza');
    }
    if (q.contains('cacao') || q.contains('chocolate') || q.contains('café') || q.contains('cafe')) {
      if (!newPrefs.contains('agroturismo')) newPrefs.add('agroturismo');
    }
    if (q.contains('cultura') || q.contains('colonial') || q.contains('museo')) {
      if (!newPrefs.contains('cultura')) newPrefs.add('cultura');
    }

    // 6. Actividades Descartadas
    final newDiscarded = List<String>.from(updated.discardedActivities);
    if (q.contains('no quiero caminar') || q.contains('sin caminata') || q.contains('sin escalar')) {
      if (!newDiscarded.contains('caminatas pesadas')) newDiscarded.add('caminatas pesadas');
    }
    if (q.contains('no volcanes') || q.contains('sin volcan')) {
      if (!newDiscarded.contains('escalada de volcanes')) newDiscarded.add('escalada de volcanes');
    }

    return updated.copyWith(
      preferences: newPrefs,
      discardedActivities: newDiscarded,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'destination': destination,
      'days': days,
      'adults': adults,
      'children': children,
      'budgetUsd': budgetUsd,
      'travelStyle': travelStyle,
      'preferences': preferences,
      'discardedActivities': discardedActivities,
      'selectedPlaceId': selectedPlaceId,
    };
  }

  factory TravelerSessionContext.fromMap(Map<String, dynamic> map) {
    return TravelerSessionContext(
      destination: map['destination'],
      days: map['days'],
      adults: map['adults'] ?? 2,
      children: map['children'] ?? 0,
      budgetUsd: (map['budgetUsd'] as num?)?.toDouble(),
      travelStyle: map['travelStyle'],
      preferences: List<String>.from(map['preferences'] ?? const []),
      discardedActivities: List<String>.from(map['discardedActivities'] ?? const []),
      selectedPlaceId: map['selectedPlaceId'],
    );
  }

  /// Retorna el resumen contextual estructurado para alimentar el System Prompt
  String toPromptContext() {
    final buffer = StringBuffer();
    buffer.writeln('=== MEMORIA INTELIGENTE DE SESIÓN DEL VIAJERO (ESTADO ACTIVO) ===');
    if (destination != null) {
      buffer.writeln('• Destino actual elegido: $destination');
    } else {
      buffer.writeln('• Destino: Pendiente de definición por el viajero');
    }
    if (days != null) buffer.writeln('• Duración del viaje: $days días');
    buffer.writeln('• Composición de grupo: $adults adultos, $children niños');
    if (budgetUsd != null) {
      final nio = (budgetUsd! * 36.65).toStringAsFixed(0);
      buffer.writeln('• Presupuesto límite informado: \$${budgetUsd!.toStringAsFixed(0)} USD (~C\$ $nio NIO)');
    }
    if (travelStyle != null) {
      buffer.writeln('• Modalidad presupuestaria solicitada: $travelStyle (¡Si el usuario dijo que está muy caro, prioriza alojamientos comunitarios y opciones accesibles!)');
    }
    if (preferences.isNotEmpty) buffer.writeln('• Preferencias activas: ${preferences.join(", ")}');
    if (discardedActivities.isNotEmpty) buffer.writeln('• Actividades expresamente descartadas: ${discardedActivities.join(", ")}');
    buffer.writeln('==================================================================');
    return buffer.toString();
  }
}
