// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SERVICIO DE GEOLOCALIZACIÓN Y DISTANCIAS
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer la capacidad de ubicar al explorador mediante GPS en tiempo real
//   para ordenar dinámicamente lugares y servicios de emergencia en "Cerca de ti".
// - Garantizar que si el usuario rechaza los permisos de ubicación o no tiene GPS,
//   la aplicación no falle y continúe funcionando con una ubicación de referencia
//   segura (Centro de Managua / Centro de Nicaragua).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Integración defensiva con `Geolocator`.
// - Cálculo de distancia geográfica mediante la fórmula Haversine / `distanceBetween`.
// - Retorno de `Position` y formateo ergonómico de distancias en metros y kilómetros.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & SERVICIO EXPUESTO):
// - `GeoLocationService`: Servicio desacoplado inyectado vía Riverpod (`geoLocationServiceProvider`).
// ============================================================================

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';

class GeoLocationService {
  // Coordenadas de referencia por defecto: Centro de Managua, Nicaragua
  static const double defaultLat = 12.1364;
  static const double defaultLng = -86.2514;

  /// Verifica si el permiso de ubicación ya fue concedido previamente sin abrir diálogos del sistema
  Future<bool> hasPermission() async {
    try {
      final permission = await Geolocator.checkPermission();
      return permission == LocationPermission.always || permission == LocationPermission.whileInUse;
    } catch (_) {
      return false;
    }
  }

  /// Obtiene la posición actual del usuario con manejo defensivo de permisos y timeout
  /// Por defecto [requestIfNotGranted] es falso para evitar congelamiento de la interfaz y ANRs.
  Future<Position?> getCurrentPosition({bool requestIfNotGranted = false}) async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        debugPrint('ℹ️ [GeoLocationService] Servicios de ubicación deshabilitados');
        return null;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        if (!requestIfNotGranted) {
          // No abrir diálogos del sistema durante la carga inicial para prevenir ANR
          return null;
        }
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          debugPrint('ℹ️ [GeoLocationService] Permiso de ubicación denegado por el usuario');
          return null;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        debugPrint('ℹ️ [GeoLocationService] Permisos de ubicación denegados permanentemente');
        return null;
      }

      // Obtener posición con límite de tiempo de 4 segundos y precisión optimizada
      return await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.low,
          timeLimit: Duration(seconds: 4),
        ),
      );
    } catch (e) {
      debugPrint('⚠️ [GeoLocationService] Error al obtener posición: $e');
      return null;
    }
  }

  /// Calcula la distancia en kilómetros entre dos pares de coordenadas geográficas
  double calculateDistanceKm({
    required double startLat,
    required double startLng,
    required double endLat,
    required double endLng,
  }) {
    final distanceInMeters = Geolocator.distanceBetween(
      startLat,
      startLng,
      endLat,
      endLng,
    );
    return distanceInMeters / 1000.0;
  }
}

final geoLocationServiceProvider = Provider<GeoLocationService>((ref) {
  return GeoLocationService();
});
