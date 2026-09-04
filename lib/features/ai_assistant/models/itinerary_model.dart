// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MODELO DE ITINERARIO OPERACIONAL
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Transformar la intención conversacional del explorador ("Quiero conocer Nicaragua
//   en 3 días con $200") en una estructura de datos estricta, ejecutable y verificable.
// - Erradicar alucinaciones de precios, horarios, teléfonos y coordenadas geográficas
//   vinculando cada actividad a registros verificados de destinos y lugares de Baqueano.
// - Soportar presupuestos bimoneda (USD / NIO), niveles de esfuerzo físico y modos
//   de transporte reales sin intermediarios.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Modelo jerárquico inmutable (`Itinerary` -> `ItineraryDay` -> `ItineraryActivity`).
// - Filtro en código de dificultad física mediante `PhysicalDifficulty` (1: Muy fácil a 5: Muy difícil).
// - Conversión bimoneda transparente con tipo de cambio oficial auditable (36.65 NIO/USD).
// - Serialización bidireccional JSON/Map para almacenamiento en Firestore y caché offline.
// - Niveles de confianza: `VERIFICADO_BAQUEANO`, `INFORMACION_PARCIAL`, `OFFLINE_LOCAL`.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & CLASES):
// - `Itinerary`: Entidad raíz del viaje con presupuesto, viajeros, días y totales.
// - `ItineraryDay`: Bloque diario con agenda, traslados y resumen de costos.
// - `ItineraryActivity`: Ficha operacional de actividad con coordenadas, dificultad y verificación.
// - `PhysicalDifficulty`: Clasificación ordinal de esfuerzo físico.
// - `TravelStyle`: Estilos de viaje (económico, equilibrado, alta gama/confort destacado).
// ============================================================================

import 'package:flutter/foundation.dart';

/// Clasificación ordinal de esfuerzo físico para filtrado determinista en código
enum PhysicalDifficulty {
  muyFacil(1, 'Muy fácil'),
  facil(2, 'Fácil'),
  moderada(3, 'Moderada'),
  dificil(4, 'Difícil'),
  muyDificil(5, 'Muy difícil');

  final int level;
  final String label;
  const PhysicalDifficulty(this.level, this.label);

  static PhysicalDifficulty fromString(String? val) {
    if (val == null) return PhysicalDifficulty.moderada;
    final v = val.toLowerCase().trim();
    if (v.contains('muy f') || v.contains('muy facil') || v.contains('muy fácil')) {
      return PhysicalDifficulty.muyFacil;
    }
    if (v.contains('fácil') || v.contains('facil') || v.contains('suave')) {
      return PhysicalDifficulty.facil;
    }
    if (v.contains('muy d') || v.contains('muy dificil') || v.contains('muy difícil') || v.contains('extrema')) {
      return PhysicalDifficulty.muyDificil;
    }
    if (v.contains('difícil') || v.contains('dificil') || v.contains('exigente')) {
      return PhysicalDifficulty.dificil;
    }
    return PhysicalDifficulty.moderada;
  }
}

/// Modalidad de viaje y asignación presupuestaria
enum TravelStyle {
  economico('Económico', 'Prioriza actividades comunitarias gratuitas y bajo costo'),
  equilibrado('Equilibrado', 'Balance óptimo entre costo, confort y vivencia auténtica'),
  altaGama('Confort Destacado', 'Experiencias de alto confort, transporte privado y posadas exclusivas');

  final String label;
  final String description;
  const TravelStyle(this.label, this.description);

  static TravelStyle fromString(String? val) {
    if (val == null) return TravelStyle.equilibrado;
    final v = val.toLowerCase().trim();
    if (v.contains('econ') || v.contains('mochiler') || v.contains('barato')) {
      return TravelStyle.economico;
    }
    if (v.contains('lujo') || v.contains('confort') || v.contains('alta gama') || v.contains('exclusiv')) {
      return TravelStyle.altaGama;
    }
    return TravelStyle.equilibrado;
  }
}

/// Nivel de verificación y trazabilidad de los datos operacionales
enum ItineraryConfidence {
  verificadoBaqueano('🟢 Verificado BAQUEANO'),
  informacionParcial('🟡 Información parcial'),
  offlineLocal('📱 Offline (Local)');

  final String label;
  const ItineraryConfidence(this.label);

  static ItineraryConfidence fromString(String? val) {
    if (val == null) return ItineraryConfidence.informacionParcial;
    final v = val.toLowerCase();
    if (v.contains('verific') || v.contains('high') || v.contains('oficial')) {
      return ItineraryConfidence.verificadoBaqueano;
    }
    if (v.contains('offline') || v.contains('local')) {
      return ItineraryConfidence.offlineLocal;
    }
    return ItineraryConfidence.informacionParcial;
  }
}

/// Ficha operacional individual de una actividad dentro del itinerario
@immutable
class ItineraryActivity {
  final String id;
  final String timeSlot;
  final String title;
  final String description;
  final String? placeId;
  final String? placeName;
  final String category;
  final double? latitude;
  final double? longitude;
  final int durationMinutes;
  final PhysicalDifficulty difficulty;
  final double estimatedCostUsd;
  final double estimatedCostNio;
  final String transportMode; // Caminata, Taxi, Bus, Lancha, Vehículo
  final double? transportCostUsd;
  final bool isVerified;
  final String? phone;
  final String? notes;

  const ItineraryActivity({
    required this.id,
    required this.timeSlot,
    required this.title,
    required this.description,
    this.placeId,
    this.placeName,
    this.category = 'General',
    this.latitude,
    this.longitude,
    this.durationMinutes = 60,
    this.difficulty = PhysicalDifficulty.moderada,
    this.estimatedCostUsd = 0.0,
    this.estimatedCostNio = 0.0,
    this.transportMode = 'A pie / Traslado local',
    this.transportCostUsd,
    this.isVerified = false,
    this.phone,
    this.notes,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'timeSlot': timeSlot,
      'title': title,
      'description': description,
      'placeId': placeId,
      'placeName': placeName,
      'category': category,
      'latitude': latitude,
      'longitude': longitude,
      'durationMinutes': durationMinutes,
      'difficulty': difficulty.name,
      'estimatedCostUsd': estimatedCostUsd,
      'estimatedCostNio': estimatedCostNio,
      'transportMode': transportMode,
      'transportCostUsd': transportCostUsd,
      'isVerified': isVerified,
      'phone': phone,
      'notes': notes,
    };
  }

  factory ItineraryActivity.fromMap(Map<String, dynamic> map) {
    return ItineraryActivity(
      id: map['id']?.toString() ?? '',
      timeSlot: map['timeSlot']?.toString() ?? '',
      title: map['title']?.toString() ?? '',
      description: map['description']?.toString() ?? '',
      placeId: map['placeId']?.toString(),
      placeName: map['placeName']?.toString(),
      category: map['category']?.toString() ?? 'General',
      latitude: (map['latitude'] as num?)?.toDouble(),
      longitude: (map['longitude'] as num?)?.toDouble(),
      durationMinutes: (map['durationMinutes'] as num?)?.toInt() ?? 60,
      difficulty: PhysicalDifficulty.fromString(map['difficulty']?.toString()),
      estimatedCostUsd: (map['estimatedCostUsd'] as num?)?.toDouble() ?? 0.0,
      estimatedCostNio: (map['estimatedCostNio'] as num?)?.toDouble() ?? 0.0,
      transportMode: map['transportMode']?.toString() ?? 'A pie / Traslado local',
      transportCostUsd: (map['transportCostUsd'] as num?)?.toDouble(),
      isVerified: map['isVerified'] == true,
      phone: map['phone']?.toString(),
      notes: map['notes']?.toString(),
    );
  }
}

/// Bloque diario estructurado de expedición
@immutable
class ItineraryDay {
  final int dayNumber;
  final String? date;
  final String title;
  final String destinationName;
  final List<ItineraryActivity> activities;
  final String estimatedStartTime;
  final String estimatedEndTime;
  final double dayCostUsd;
  final double dayCostNio;
  final String? mealsRecommendation;
  final String? stayRecommendation;
  final bool verified;

  const ItineraryDay({
    required this.dayNumber,
    this.date,
    required this.title,
    required this.destinationName,
    required this.activities,
    this.estimatedStartTime = '08:00',
    this.estimatedEndTime = '18:00',
    this.dayCostUsd = 0.0,
    this.dayCostNio = 0.0,
    this.mealsRecommendation,
    this.stayRecommendation,
    this.verified = true,
  });

  Map<String, dynamic> toMap() {
    return {
      'dayNumber': dayNumber,
      'date': date,
      'title': title,
      'destinationName': destinationName,
      'activities': activities.map((a) => a.toMap()).toList(),
      'estimatedStartTime': estimatedStartTime,
      'estimatedEndTime': estimatedEndTime,
      'dayCostUsd': dayCostUsd,
      'dayCostNio': dayCostNio,
      'mealsRecommendation': mealsRecommendation,
      'stayRecommendation': stayRecommendation,
      'verified': verified,
    };
  }

  factory ItineraryDay.fromMap(Map<String, dynamic> map) {
    return ItineraryDay(
      dayNumber: (map['dayNumber'] as num?)?.toInt() ?? 1,
      date: map['date']?.toString(),
      title: map['title']?.toString() ?? 'Día de expedición',
      destinationName: map['destinationName']?.toString() ?? 'Nicaragua',
      activities: (map['activities'] as List<dynamic>?)
              ?.map((a) => ItineraryActivity.fromMap(a as Map<String, dynamic>))
              .toList() ??
          const [],
      estimatedStartTime: map['estimatedStartTime']?.toString() ?? '08:00',
      estimatedEndTime: map['estimatedEndTime']?.toString() ?? '18:00',
      dayCostUsd: (map['dayCostUsd'] as num?)?.toDouble() ?? 0.0,
      dayCostNio: (map['dayCostNio'] as num?)?.toDouble() ?? 0.0,
      mealsRecommendation: map['mealsRecommendation']?.toString(),
      stayRecommendation: map['stayRecommendation']?.toString(),
      verified: map['verified'] == true,
    );
  }
}

/// Entidad raíz de un itinerario operacional completo en BAQUEANO
@immutable
class Itinerary {
  final String itineraryId;
  final String title;
  final List<String> destinationIds;
  final List<String> destinationNames;
  final String? startDate;
  final String? endDate;
  final int numberOfDays;
  final int travelers;
  final int adults;
  final int children;
  final double budgetUsd;
  final double budgetNio;
  final String budgetMode;
  final TravelStyle travelStyle;
  final List<String> interests;
  final PhysicalDifficulty maxPhysicalDifficulty;
  final String transportationMode;
  final double estimatedTransportCostUsd;
  final double estimatedFoodCostUsd;
  final double estimatedAccommodationCostUsd;
  final double estimatedActivityCostUsd;
  final double totalEstimatedCostUsd;
  final double totalEstimatedCostNio;
  final String currency;
  final List<ItineraryDay> days;
  final List<String> warnings;
  final ItineraryConfidence confidence;
  final double exchangeRate;
  final String exchangeRateSource;
  final DateTime generatedAt;

  const Itinerary({
    required this.itineraryId,
    required this.title,
    this.destinationIds = const [],
    this.destinationNames = const [],
    this.startDate,
    this.endDate,
    required this.numberOfDays,
    this.travelers = 2,
    this.adults = 2,
    this.children = 0,
    this.budgetUsd = 0.0,
    this.budgetNio = 0.0,
    this.budgetMode = 'Flexible',
    this.travelStyle = TravelStyle.equilibrado,
    this.interests = const [],
    this.maxPhysicalDifficulty = PhysicalDifficulty.moderada,
    this.transportationMode = 'Mixto (Público / Caminata)',
    this.estimatedTransportCostUsd = 0.0,
    this.estimatedFoodCostUsd = 0.0,
    this.estimatedAccommodationCostUsd = 0.0,
    this.estimatedActivityCostUsd = 0.0,
    this.totalEstimatedCostUsd = 0.0,
    this.totalEstimatedCostNio = 0.0,
    this.currency = 'USD',
    this.days = const [],
    this.warnings = const [],
    this.confidence = ItineraryConfidence.verificadoBaqueano,
    this.exchangeRate = 36.65,
    this.exchangeRateSource = 'Banco Central de Nicaragua (Referencial)',
    required this.generatedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'itineraryId': itineraryId,
      'title': title,
      'destinationIds': destinationIds,
      'destinationNames': destinationNames,
      'startDate': startDate,
      'endDate': endDate,
      'numberOfDays': numberOfDays,
      'travelers': travelers,
      'adults': adults,
      'children': children,
      'budgetUsd': budgetUsd,
      'budgetNio': budgetNio,
      'budgetMode': budgetMode,
      'travelStyle': travelStyle.name,
      'interests': interests,
      'maxPhysicalDifficulty': maxPhysicalDifficulty.name,
      'transportationMode': transportationMode,
      'estimatedTransportCostUsd': estimatedTransportCostUsd,
      'estimatedFoodCostUsd': estimatedFoodCostUsd,
      'estimatedAccommodationCostUsd': estimatedAccommodationCostUsd,
      'estimatedActivityCostUsd': estimatedActivityCostUsd,
      'totalEstimatedCostUsd': totalEstimatedCostUsd,
      'totalEstimatedCostNio': totalEstimatedCostNio,
      'currency': currency,
      'days': days.map((d) => d.toMap()).toList(),
      'warnings': warnings,
      'confidence': confidence.name,
      'exchangeRate': exchangeRate,
      'exchangeRateSource': exchangeRateSource,
      'generatedAt': generatedAt.toIso8601String(),
    };
  }

  factory Itinerary.fromMap(Map<String, dynamic> map) {
    return Itinerary(
      itineraryId: map['itineraryId']?.toString() ?? '',
      title: map['title']?.toString() ?? 'Itinerario de Expedición Baqueano',
      destinationIds: List<String>.from(map['destinationIds'] ?? const []),
      destinationNames: List<String>.from(map['destinationNames'] ?? const []),
      startDate: map['startDate']?.toString(),
      endDate: map['endDate']?.toString(),
      numberOfDays: (map['numberOfDays'] as num?)?.toInt() ?? 1,
      travelers: (map['travelers'] as num?)?.toInt() ?? 2,
      adults: (map['adults'] as num?)?.toInt() ?? 2,
      children: (map['children'] as num?)?.toInt() ?? 0,
      budgetUsd: (map['budgetUsd'] as num?)?.toDouble() ?? 0.0,
      budgetNio: (map['budgetNio'] as num?)?.toDouble() ?? 0.0,
      budgetMode: map['budgetMode']?.toString() ?? 'Flexible',
      travelStyle: TravelStyle.fromString(map['travelStyle']?.toString()),
      interests: List<String>.from(map['interests'] ?? const []),
      maxPhysicalDifficulty: PhysicalDifficulty.fromString(map['maxPhysicalDifficulty']?.toString()),
      transportationMode: map['transportationMode']?.toString() ?? 'Mixto',
      estimatedTransportCostUsd: (map['estimatedTransportCostUsd'] as num?)?.toDouble() ?? 0.0,
      estimatedFoodCostUsd: (map['estimatedFoodCostUsd'] as num?)?.toDouble() ?? 0.0,
      estimatedAccommodationCostUsd: (map['estimatedAccommodationCostUsd'] as num?)?.toDouble() ?? 0.0,
      estimatedActivityCostUsd: (map['estimatedActivityCostUsd'] as num?)?.toDouble() ?? 0.0,
      totalEstimatedCostUsd: (map['totalEstimatedCostUsd'] as num?)?.toDouble() ?? 0.0,
      totalEstimatedCostNio: (map['totalEstimatedCostNio'] as num?)?.toDouble() ?? 0.0,
      currency: map['currency']?.toString() ?? 'USD',
      days: (map['days'] as List<dynamic>?)
              ?.map((d) => ItineraryDay.fromMap(d as Map<String, dynamic>))
              .toList() ??
          const [],
      warnings: List<String>.from(map['warnings'] ?? const []),
      confidence: ItineraryConfidence.fromString(map['confidence']?.toString()),
      exchangeRate: (map['exchangeRate'] as num?)?.toDouble() ?? 36.65,
      exchangeRateSource: map['exchangeRateSource']?.toString() ?? 'Banco Central de Nicaragua',
      generatedAt: DateTime.tryParse(map['generatedAt']?.toString() ?? '') ?? DateTime.now(),
    );
  }
}
