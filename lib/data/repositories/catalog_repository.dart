// ============================================================================
// 🧭 BAQUEANO — REPOSITORIO DE CATÁLOGO (SUPABASE-FIRST, MISMO DATO QUE LA WEB)
// ============================================================================
//
// 🎯 POR QUÉ (Propósito):
// - La Web y el APK deben mostrar la misma información real. Lo que el equipo
//   publica o verifica en Ops Center (Supabase) tiene que aparecer en la App.
// - Nunca inventar datos: un destino sin coordenadas no se pinta en el mapa,
//   una calificación inexistente no se muestra como 5 estrellas.
//
// ⚙️ CÓMO (Arquitectura):
// 1. Lee `departments`, `destinations` (publicados) y `businesses`
//    (verificados) vía `SupabaseRestClient`. RLS decide qué es público.
// 2. Guarda la última respuesta válida en SharedPreferences con su fecha
//    (`fetchedAt`): si no hay red, se usa esa copia y se marca su origen.
// 3. Mapeadores puros y estáticos (DTO de Supabase → `PlaceModel`) para
//    poder probarlos sin red.
// 4. Descarta filas con coordenadas nulas, no finitas o fuera de Nicaragua.
//
// 📦 QUÉ (Entregables):
// - `CatalogSnapshot`: departamentos, lugares (destinos) y negocios + origen.
// - `CatalogRepository.load()` (Supabase → caché local → vacío con error).
// - `catalogRepositoryProvider` / `catalogSnapshotProvider` (Riverpod).
// ============================================================================

import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/api/supabase_rest_client.dart';
import '../../features/directory/models/place_model.dart';

/// Origen de los datos mostrados (para estados honestos en la UI).
enum CatalogSource { supabase, cache, none }

class CatalogDepartment {
  final String id;
  final String name;
  final String capital;
  final String shortDesc;
  final String bannerImage;

  const CatalogDepartment({
    required this.id,
    required this.name,
    this.capital = '',
    this.shortDesc = '',
    this.bannerImage = '',
  });
}

class CatalogBusiness {
  final String id;
  final String name;
  final String category;
  final String department;
  final String municipality;
  final String? phone;
  final String? whatsapp;
  final String address;
  final double? latitude;
  final double? longitude;
  final String coverImage;
  final bool verified;
  final String hostName;
  final String hostStory;

  const CatalogBusiness({
    required this.id,
    required this.name,
    this.category = '',
    this.department = '',
    this.municipality = '',
    this.phone,
    this.whatsapp,
    this.address = '',
    this.latitude,
    this.longitude,
    this.coverImage = '',
    this.verified = false,
    this.hostName = '',
    this.hostStory = '',
  });

  bool get hasCoordinates => latitude != null && longitude != null;
}

class CatalogSnapshot {
  final List<CatalogDepartment> departments;
  final List<PlaceModel> places;
  final List<CatalogBusiness> businesses;
  final CatalogSource source;
  final DateTime? fetchedAt;
  final String? error;

  const CatalogSnapshot({
    this.departments = const [],
    this.places = const [],
    this.businesses = const [],
    this.source = CatalogSource.none,
    this.fetchedAt,
    this.error,
  });

  bool get isEmpty =>
      departments.isEmpty && places.isEmpty && businesses.isEmpty;
}

class CatalogRepository {
  static const String _cacheKey = 'baqueano_catalog_supabase_v1';

  // Límites geográficos de Nicaragua (mismos que valida `baqueano-ops`).
  static const double _minLat = 10.6, _maxLat = 15.1;
  static const double _minLng = -87.8, _maxLng = -82.5;

  static const Map<String, String> _categoryLabels = {
    'naturaleza': 'Naturaleza',
    'aventura': 'Aventura',
    'playa': 'Playa',
    'cultura': 'Cultura',
    'historia': 'Historia',
    'gastronomia': 'Gastronomía',
    'hospedaje': 'Hospedaje',
    'guia': 'Guía local',
    'transporte': 'Transporte',
  };

  final SupabaseRestClient _client;

  CatalogRepository({SupabaseRestClient client = const SupabaseRestClient()})
      : _client = client;

  /// Carga Supabase-first; si falla, devuelve la última copia guardada.
  Future<CatalogSnapshot> load() async {
    try {
      final results = await Future.wait([
        _client.select('departments', query: {
          'select': 'id,name,capital,short_desc,banner_image',
          'order': 'name.asc',
        }),
        _client.select('destinations', query: {
          'select':
              'id,department_id,name,category,short_desc,description,latitude,longitude,cover_image,rating,reviews_count,verified,status,source_name,source_url,last_verified_at,how_to_reach,created_at,updated_at',
          'order': 'updated_at.desc',
          'limit': '500',
        }),
        _client.select('businesses', query: {
          'select':
              'id,name,category,department,municipality,phone,whatsapp,address,latitude,longitude,cover_image,verified,host_name,host_story',
          'order': 'name.asc',
          'limit': '500',
        }),
      ]);
      final raw = <String, dynamic>{
        'departments': results[0],
        'destinations': results[1],
        'businesses': results[2],
        'fetchedAt': DateTime.now().toUtc().toIso8601String(),
      };
      await _saveCache(raw);
      return snapshotFromRaw(raw, CatalogSource.supabase);
    } catch (error) {
      debugPrint('⚠️ [CatalogRepository] Supabase no disponible: $error');
      final cached = await _readCache();
      if (cached != null) {
        return snapshotFromRaw(cached, CatalogSource.cache,
            error: error.toString());
      }
      return CatalogSnapshot(error: error.toString());
    }
  }

  Future<void> _saveCache(Map<String, dynamic> raw) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_cacheKey, jsonEncode(raw));
    } catch (error) {
      debugPrint('⚠️ [CatalogRepository] No se pudo guardar caché: $error');
    }
  }

  Future<Map<String, dynamic>?> _readCache() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final value = prefs.getString(_cacheKey);
      if (value == null || value.isEmpty) return null;
      final decoded = jsonDecode(value);
      return decoded is Map<String, dynamic> ? decoded : null;
    } catch (_) {
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Mapeadores puros (probados en test/catalog_repository_test.dart)
  // ---------------------------------------------------------------------------

  static CatalogSnapshot snapshotFromRaw(
    Map<String, dynamic> raw,
    CatalogSource source, {
    String? error,
  }) {
    final departments = _rows(raw['departments'])
        .map(departmentFromRow)
        .whereType<CatalogDepartment>()
        .toList(growable: false);
    final names = {for (final d in departments) d.id: d.name};
    final places = _rows(raw['destinations'])
        .map((row) => placeFromDestinationRow(row, departmentNames: names))
        .whereType<PlaceModel>()
        .toList(growable: false);
    final businesses = _rows(raw['businesses'])
        .map(businessFromRow)
        .whereType<CatalogBusiness>()
        .toList(growable: false);
    return CatalogSnapshot(
      departments: departments,
      places: places,
      businesses: businesses,
      source: source,
      fetchedAt: DateTime.tryParse(raw['fetchedAt']?.toString() ?? ''),
      error: error,
    );
  }

  static CatalogDepartment? departmentFromRow(Map<String, dynamic> row) {
    final id = _str(row['id']);
    final name = _str(row['name']);
    if (id.isEmpty || name.isEmpty) return null;
    return CatalogDepartment(
      id: id,
      name: name,
      capital: _str(row['capital']),
      shortDesc: _str(row['short_desc']),
      bannerImage: _httpsOrEmpty(row['banner_image']),
    );
  }

  /// Devuelve `null` si el destino no tiene nombre o coordenadas válidas.
  static PlaceModel? placeFromDestinationRow(
    Map<String, dynamic> row, {
    Map<String, String> departmentNames = const {},
  }) {
    final id = _str(row['id']);
    final name = _str(row['name']);
    final lat = _finite(row['latitude']);
    final lng = _finite(row['longitude']);
    if (id.isEmpty || name.isEmpty || !_insideNicaragua(lat, lng)) {
      return null;
    }
    final status = _str(row['status']);
    if (status.isNotEmpty && status != 'published') return null;

    final departmentId = _str(row['department_id']);
    final category = _str(row['category']).toLowerCase();
    final description = _str(row['description']).isNotEmpty
        ? _str(row['description'])
        : _str(row['short_desc']);
    final cover = _httpsOrEmpty(row['cover_image']);
    final created =
        DateTime.tryParse(_str(row['created_at'])) ?? DateTime.now();
    final updated = DateTime.tryParse(_str(row['updated_at'])) ?? created;

    return PlaceModel(
      placeId: id,
      name: name,
      categoryId: category,
      categoryName: _categoryLabels[category] ?? _capitalize(category),
      description: description,
      departmentId: departmentId,
      departmentName: departmentNames[departmentId] ?? _capitalize(departmentId),
      municipalityId: '',
      municipalityName: '',
      address: _str(row['how_to_reach']),
      latitude: lat!,
      longitude: lng!,
      imageUrl: cover,
      imageUrls: cover.isEmpty ? const [] : [cover],
      isTourist: true,
      verified: row['verified'] == true,
      verificationSource: _nullIfEmpty(_str(row['source_name'])),
      sourceUrl: _nullIfEmpty(_httpsOrEmpty(row['source_url'])),
      lastVerifiedAt: DateTime.tryParse(_str(row['last_verified_at'])),
      // Sin reseñas reales no se inventa una calificación.
      rating: _finite(row['rating']) ?? 0.0,
      reviewCount: (row['reviews_count'] as num?)?.toInt() ?? 0,
      status: 'published',
      createdAt: created,
      updatedAt: updated,
    );
  }

  static CatalogBusiness? businessFromRow(Map<String, dynamic> row) {
    final id = _str(row['id']);
    final name = _str(row['name']);
    if (id.isEmpty || name.isEmpty) return null;
    final lat = _finite(row['latitude']);
    final lng = _finite(row['longitude']);
    final validCoords = _insideNicaragua(lat, lng);
    return CatalogBusiness(
      id: id,
      name: name,
      category: _str(row['category']),
      department: _str(row['department']),
      municipality: _str(row['municipality']),
      phone: _nullIfEmpty(_str(row['phone'])),
      whatsapp: _nullIfEmpty(_str(row['whatsapp'])),
      address: _str(row['address']),
      latitude: validCoords ? lat : null,
      longitude: validCoords ? lng : null,
      coverImage: _httpsOrEmpty(row['cover_image']),
      verified: row['verified'] == true,
      hostName: _str(row['host_name']),
      hostStory: _str(row['host_story']),
    );
  }

  static Iterable<Map<String, dynamic>> _rows(Object? value) {
    if (value is! List) return const [];
    return value.whereType<Map>().map((row) => Map<String, dynamic>.from(row));
  }

  static String _str(Object? value) => value?.toString().trim() ?? '';

  static String? _nullIfEmpty(String value) => value.isEmpty ? null : value;

  static double? _finite(Object? value) {
    final number = value is num ? value.toDouble() : double.tryParse('$value');
    return number != null && number.isFinite ? number : null;
  }

  static bool _insideNicaragua(double? lat, double? lng) =>
      lat != null &&
      lng != null &&
      lat >= _minLat &&
      lat <= _maxLat &&
      lng >= _minLng &&
      lng <= _maxLng;

  static String _httpsOrEmpty(Object? value) {
    final text = _str(value);
    final uri = Uri.tryParse(text);
    return uri != null && uri.scheme == 'https' && uri.host.isNotEmpty
        ? text
        : '';
  }

  static String _capitalize(String value) {
    if (value.isEmpty) return value;
    final spaced = value.replaceAll('_', ' ');
    return spaced[0].toUpperCase() + spaced.substring(1);
  }
}

final catalogRepositoryProvider = Provider<CatalogRepository>((ref) {
  return CatalogRepository(client: ref.watch(supabaseRestClientProvider));
});

/// Catálogo compartido Web/App. `ref.invalidate(catalogSnapshotProvider)`
/// fuerza una recarga (por ejemplo, al "deslizar para actualizar").
final catalogSnapshotProvider = FutureProvider<CatalogSnapshot>((ref) {
  return ref.watch(catalogRepositoryProvider).load();
});
