// ============================================================================
// 🧭 BAQUEANO — REPOSITORIO DE TERRITORIOS (MISMOS LUGARES QUE LA WEB)
// ============================================================================
//
// 🎯 POR QUÉ (Propósito):
// - La Web muestra en cada departamento una franja viva de lugares con
//   descripción propia (AGENTS.md regla 8). La APK debe mostrar lo mismo.
//
// ⚙️ CÓMO (Arquitectura):
// - Lee `assets/data/territories_places.json`, generado desde
//   `website/js/territories-data.js` por `npm run export:app-territories`.
//   CI (`--check`) falla si el asset y la Web divergen.
// - IDs en formato Supabase (`nueva_segovia`); `normalizeDepartmentId` acepta
//   también los IDs internos de la App (`d-nueva-segovia`).
// - Parseo defensivo: entradas incompletas se descartan sin romper la UI.
//
// 📦 QUÉ (Entregables):
// - `TerritoryInfo`, `TerritoryPlace`, `TerritoryRepository`.
// - `territoriesProvider` (Riverpod, `FutureProvider`).
// ============================================================================

import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class TerritoryPlace {
  final String name;
  final String type;
  final String desc;
  final double? lat;
  final double? lng;

  const TerritoryPlace({
    required this.name,
    required this.type,
    required this.desc,
    this.lat,
    this.lng,
  });

  bool get hasCoordinates => lat != null && lng != null;
}

class TerritoryInfo {
  final String id;
  final String name;
  final String tagline;
  final String shortDesc;
  final String bestSeason;
  final String howToReach;
  final List<TerritoryPlace> places;

  const TerritoryInfo({
    required this.id,
    required this.name,
    this.tagline = '',
    this.shortDesc = '',
    this.bestSeason = '',
    this.howToReach = '',
    this.places = const [],
  });
}

class TerritoryRepository {
  static const String assetPath = 'assets/data/territories_places.json';

  /// `d-nueva-segovia`, `nueva-segovia` o `nueva_segovia` → `nueva_segovia`.
  static String normalizeDepartmentId(String raw) {
    var id = raw.trim().toLowerCase();
    if (id.startsWith('d-')) id = id.substring(2);
    return id.replaceAll('-', '_');
  }

  static Map<String, TerritoryInfo> parse(String jsonText) {
    final decoded = jsonDecode(jsonText);
    final list = decoded is Map ? decoded['territories'] : null;
    if (list is! List) return const {};
    final result = <String, TerritoryInfo>{};
    for (final raw in list.whereType<Map>()) {
      String text(Object? value) => value is String ? value.trim() : '';
      double? number(Object? value) =>
          value is num && value.isFinite ? value.toDouble() : null;
      final id = normalizeDepartmentId(text(raw['id']));
      final name = text(raw['name']);
      if (id.isEmpty || name.isEmpty) continue;
      final places = <TerritoryPlace>[
        for (final place in (raw['places'] is List ? raw['places'] as List : const []).whereType<Map>())
          if (text(place['name']).isNotEmpty && text(place['desc']).isNotEmpty)
            TerritoryPlace(
              name: text(place['name']),
              type: text(place['type']),
              desc: text(place['desc']),
              lat: number(place['lat']),
              lng: number(place['lng']),
            ),
      ];
      result[id] = TerritoryInfo(
        id: id,
        name: name,
        tagline: text(raw['tagline']),
        shortDesc: text(raw['shortDesc']),
        bestSeason: text(raw['bestSeason']),
        howToReach: text(raw['howToReach']),
        places: places,
      );
    }
    return result;
  }

  Future<Map<String, TerritoryInfo>> load() async {
    try {
      return parse(await rootBundle.loadString(assetPath));
    } catch (_) {
      return const {};
    }
  }
}

final territoriesProvider = FutureProvider<Map<String, TerritoryInfo>>((ref) {
  return TerritoryRepository().load();
});
