// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SERVICIO DE LUGARES DEL DIRECTORIO NACIONAL (PLACES SERVICE)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Gestionar las consultas, filtrado, paginación, cálculo de proximidad y
//   persistencia de lugares, atracciones turísticas y servicios de emergencia.
// - Integrar los datos de toda Nicaragua de forma modular desde Firebase/Firestore
//   con respaldo local en assets JSON, garantizando disponibilidad y rapidez.
// - Reutilizar y sincronizar el sistema de guardados/favoritos del usuario.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Consultas optimizadas con paginación (`limit`, `startAfter`) y filtros combinables.
// - Algoritmo de proximidad geográfica ("Cerca de ti") mediante `GeoLocationService`.
// - Persistencia de guardados en Firestore (`user_saved_places`) y `SharedPreferences`.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & MÉTODOS EXPUESTOS):
// - `PlacesService`: Motor de datos del directorio nacional.
// - `placesServiceProvider`: Inyección de dependencias Riverpod.
// ============================================================================

import 'dart:convert';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/place_model.dart';
import 'geo_location_service.dart';

class PlacesService {
  final GeoLocationService _geoService;
  List<PlaceModel> _cachedPlaces = [];
  Set<String> _savedPlaceIds = {};
  bool _savedLoaded = false;

  PlacesService({
    GeoLocationService? geoService,
  }) : _geoService = geoService ?? GeoLocationService();

  static const String _savedPlacesPrefKey = 'baqueano_saved_places_ids';

  FirebaseFirestore? get _firestore {
    try {
      if (Firebase.apps.isNotEmpty) {
        return FirebaseFirestore.instanceFor(
          app: Firebase.app(),
          databaseId: 'appbaqueano',
        );
      }
    } catch (_) {
      try {
        return FirebaseFirestore.instance;
      } catch (_) {}
    }
    return null;
  }

  /// Carga inicial de lugares combinando assets locales y Firestore
  Future<List<PlaceModel>> getAllPlaces() async {
    if (_cachedPlaces.isNotEmpty) return _cachedPlaces;

    // 1. Carga desde el asset local para arranque ultrarrápido sin pantalla en blanco
    try {
      final jsonString = await rootBundle.loadString('assets/data/initial_places.json');
      final List<dynamic> jsonList = jsonDecode(jsonString);
      _cachedPlaces = jsonList
          .map((item) => PlaceModel.fromMap(Map<String, dynamic>.from(item)))
          .where((p) => p.status == 'published')
          .toList();
    } catch (e) {
      debugPrint('⚠️ [PlacesService] Error cargando initial_places.json: $e');
    }

    // 2. Consulta en Cloud Firestore (colección `places`)
    try {
      final db = _firestore;
      if (db != null) {
        final querySnap = await db
            .collection('places')
            .where('status', isEqualTo: 'published')
            .limit(100)
            .get();

        if (querySnap.docs.isNotEmpty) {
          final cloudPlaces = querySnap.docs
              .map((doc) => PlaceModel.fromMap(doc.data(), doc.id))
              .toList();

          // Unir evitando duplicados por `placeId`
          final map = {for (var p in _cachedPlaces) p.placeId: p};
          for (var cp in cloudPlaces) {
            map[cp.placeId] = cp;
          }
          _cachedPlaces = map.values.toList();
        }
      }
    } catch (e) {
      debugPrint('⚠️ [PlacesService] Error sincronizando con Firestore (modo offline): $e');
    }

    return _cachedPlaces;
  }

  /// Obtiene los lugares filtrados y ordenados por distancia si se proveen coordenadas.
  /// Soporta paginación eficiente con [limit] y [offset] para no sobrecargar el renderizado ni la memoria.
  Future<List<PlaceModel>> getPlaces({
    String? searchQuery,
    String? categoryId,
    String? departmentId,
    String? municipalityId,
    bool? isEmergency,
    bool? isTourist,
    bool? verifiedOnly,
    double? userLat,
    double? userLng,
    int limit = 50,
    int offset = 0,
  }) async {
    final all = await getAllPlaces();

    var filtered = all.where((place) {
      // Filtro de Emergencia
      if (isEmergency == true && !place.isEmergency) return false;

      // Filtro de Turístico
      if (isTourist == true && !place.isTourist) return false;

      // Filtro de Verificado
      if (verifiedOnly == true && !place.verified) return false;

      // Filtro de Categoría
      if (categoryId != null && categoryId.isNotEmpty && categoryId != 'all') {
        if (place.categoryId.toLowerCase() != categoryId.toLowerCase()) return false;
      }

      // Filtro de Departamento
      if (departmentId != null && departmentId.isNotEmpty && departmentId != 'all') {
        if (place.departmentId.toLowerCase() != departmentId.toLowerCase()) return false;
      }

      // Filtro de Municipio
      if (municipalityId != null && municipalityId.isNotEmpty && municipalityId != 'all') {
        if (place.municipalityId.toLowerCase() != municipalityId.toLowerCase()) return false;
      }

      // Filtro de Búsqueda de Texto Multicriterio
      if (searchQuery != null && searchQuery.trim().isNotEmpty) {
        final q = searchQuery.trim().toLowerCase();
        final match = place.name.toLowerCase().contains(q) ||
            place.categoryName.toLowerCase().contains(q) ||
            place.subcategory.toLowerCase().contains(q) ||
            place.departmentName.toLowerCase().contains(q) ||
            place.municipalityName.toLowerCase().contains(q) ||
            place.description.toLowerCase().contains(q) ||
            place.address.toLowerCase().contains(q);
        if (!match) return false;
      }

      return true;
    }).toList();

    // Cálculo de distancias y ordenamiento por proximidad
    if (userLat != null && userLng != null) {
      filtered = filtered.map((place) {
        final dist = _geoService.calculateDistanceKm(
          startLat: userLat,
          startLng: userLng,
          endLat: place.latitude,
          endLng: place.longitude,
        );
        return place.copyWith(distanceKm: dist);
      }).toList();

      filtered.sort((a, b) {
        final distA = a.distanceKm ?? double.infinity;
        final distB = b.distanceKm ?? double.infinity;
        return distA.compareTo(distB);
      });
    }

    final start = offset.clamp(0, filtered.length);
    final end = (start + limit).clamp(start, filtered.length);
    return filtered.sublist(start, end);
  }

  /// Obtiene los servicios de emergencia clasificados por distancia
  Future<List<PlaceModel>> getEmergencyServices({
    double? userLat,
    double? userLng,
  }) async {
    return getPlaces(
      isEmergency: true,
      userLat: userLat,
      userLng: userLng,
    );
  }

  /// Busca un lugar por su identificador único
  Future<PlaceModel?> getPlaceById(String placeId) async {
    final all = await getAllPlaces();
    try {
      return all.firstWhere((p) => p.placeId == placeId);
    } catch (_) {
      // Si no está en caché, intentar consulta directa a Firestore
      try {
        final db = _firestore;
        if (db != null) {
          final doc = await db.collection('places').doc(placeId).get();
          if (doc.exists && doc.data() != null) {
            return PlaceModel.fromMap(doc.data()!, doc.id);
          }
        }
      } catch (_) {}
      return null;
    }
  }

  // --------------------------------------------------------------------------
  // GESTIÓN DE LUGARES GUARDADOS / FAVORITOS
  // --------------------------------------------------------------------------

  Future<void> _loadSavedPlaceIds() async {
    if (_savedLoaded) return;
    try {
      final prefs = await SharedPreferences.getInstance();
      final list = prefs.getStringList(_savedPlacesPrefKey) ?? [];
      _savedPlaceIds = list.toSet();
      _savedLoaded = true;
    } catch (_) {}
  }

  Future<bool> isPlaceSaved(String placeId) async {
    await _loadSavedPlaceIds();
    return _savedPlaceIds.contains(placeId);
  }

  Future<bool> toggleSavePlace(String placeId) async {
    await _loadSavedPlaceIds();
    final isSaved = _savedPlaceIds.contains(placeId);

    if (isSaved) {
      _savedPlaceIds.remove(placeId);
    } else {
      _savedPlaceIds.add(placeId);
    }

    // Persistir localmente
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList(_savedPlacesPrefKey, _savedPlaceIds.toList());
    } catch (_) {}

    // Sincronizar en Firestore si el usuario está autenticado
    try {
      final user = FirebaseAuth.instance.currentUser;
      final db = _firestore;
      if (user != null && db != null) {
        final docRef = db.collection('user_saved_places').doc('${user.uid}_$placeId');
        if (isSaved) {
          await docRef.delete();
        } else {
          await docRef.set({
            'userId': user.uid,
            'placeId': placeId,
            'createdAt': DateTime.now().toIso8601String(),
          });
        }
      }
    } catch (_) {}

    return !isSaved;
  }
}

final placesServiceProvider = Provider<PlacesService>((ref) {
  final geoService = ref.read(geoLocationServiceProvider);
  return PlacesService(geoService: geoService);
});
