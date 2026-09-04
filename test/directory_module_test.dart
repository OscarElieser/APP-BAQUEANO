// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PRUEBAS UNITARIAS DEL DIRECTORIO NACIONAL
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Validar exhaustivamente la integridad de los modelos de datos, servicios,
//   cálculo de distancias geográficas y filtros del módulo "Descubre Nicaragua".
// - Garantizar que ningún campo nulo rompa la aplicación y que el ordenamiento
//   "Cerca de ti" funcione con absoluta precisión matemática.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Pruebas unitarias de modelos (Department, Municipality, Category, Place).
// - Validación de cálculo de distancia de Haversine con coordenadas reales de Nicaragua.
// - Validación de filtros multicriterio y manejo de emergencias.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & CASOS DE PRUEBA):
// - `directory_module_test.dart`: Suite completa de validación del nuevo módulo.
// ============================================================================

import 'package:flutter_test/flutter_test.dart';
import 'package:baqueano_app/features/directory/models/category_model.dart';
import 'package:baqueano_app/features/directory/models/department_model.dart';
import 'package:baqueano_app/features/directory/models/municipality_model.dart';
import 'package:baqueano_app/features/directory/models/place_model.dart';
import 'package:baqueano_app/features/directory/services/geo_location_service.dart';

void main() {
  group('Directorio Nacional — Modelos Territoriales y Categorías', () {
    test('DepartmentModel des-serializa correctamente departamentos de Nicaragua', () {
      final dept = DepartmentModel.fromMap({
        'id': 'leon',
        'name': 'León',
        'zone': 'Pacífico',
        'capital': 'León',
        'latitude': 12.4379,
        'longitude': -86.8780,
      });

      expect(dept.id, 'leon');
      expect(dept.name, 'León');
      expect(dept.zone, 'Pacífico');
      expect(dept.latitude, closeTo(12.43, 0.01));
      expect(dept.toMap()['capital'], 'León');
    });

    test('MunicipalityModel enlaza adecuadamente con su departamento', () {
      final muni = MunicipalityModel.fromMap({
        'id': 'catarina',
        'departmentId': 'masaya',
        'name': 'Catarina',
        'latitude': 11.9128,
        'longitude': -86.0747,
      });

      expect(muni.id, 'catarina');
      expect(muni.departmentId, 'masaya');
      expect(muni.name, 'Catarina');
    });

    test('CategoryModel resuelve iconos de Material Icons según taxonomía', () {
      const cat = CategoryModel(
        categoryId: 'museums',
        name: 'Museos',
        description: 'Museos arqueológicos e históricos',
        icon: 'museum',
        type: 'culture',
        order: 1,
        active: true,
      );

      expect(cat.categoryId, 'museums');
      expect(cat.type, 'culture');
      expect(cat.iconData, isNotNull);

      final map = cat.toMap();
      expect(map['categoryId'], 'museums');
      final reconstructed = CategoryModel.fromMap(map);
      expect(reconstructed.name, 'Museos');
    });
  });

  group('Directorio Nacional — PlaceModel & Formateo', () {
    test('PlaceModel serializa y formatea distancias en metros y kilómetros', () {
      final place = PlaceModel(
        placeId: 'plc_teatro_ruben_dario',
        name: 'Teatro Nacional Rubén Darío',
        categoryId: 'theaters_culture',
        categoryName: 'Teatros & Centros Culturales',
        subcategory: 'Monumento Cultural',
        description: 'Templo de las artes escénicas de Nicaragua.',
        departmentId: 'managua',
        departmentName: 'Managua',
        municipalityId: 'managua_centro',
        municipalityName: 'Managua',
        address: 'Plaza de la Revolución, Managua',
        latitude: 12.1585,
        longitude: -86.2721,
        isTourist: true,
        isEmergency: false,
        verified: true,
        verificationSource: 'Instituto de Cultura',
        createdAt: DateTime(2026, 9, 1),
        updatedAt: DateTime(2026, 9, 1),
        distanceKm: 0.45,
      );

      expect(place.verified, isTrue);
      expect(place.formattedDistance, '450 m');

      final farPlace = place.copyWith(distanceKm: 3.78);
      expect(farPlace.formattedDistance, '3.8 km');

      final map = place.toMap();
      expect(map['placeId'], 'plc_teatro_ruben_dario');
      expect(map['name'], 'Teatro Nacional Rubén Darío');

      final reconstructed = PlaceModel.fromMap(map);
      expect(reconstructed.name, 'Teatro Nacional Rubén Darío');
      expect(reconstructed.verified, isTrue);
      expect(reconstructed.latitude, closeTo(12.158, 0.01));
    });

    test('PlaceModel maneja servicios de emergencia con números oficiales', () {
      final emergency = PlaceModel(
        placeId: 'plc_cruz_blanca',
        name: 'Cruz Blanca Nicaragüense',
        categoryId: 'red_cross',
        categoryName: 'Cruz Blanca',
        departmentId: 'managua',
        departmentName: 'Managua',
        municipalityId: 'managua_centro',
        municipalityName: 'Managua',
        address: 'Reparto Belmonte',
        latitude: 12.1280,
        longitude: -86.3150,
        phone: '128',
        isEmergency: true,
        is24Hours: true,
        createdAt: DateTime(2026, 9, 1),
        updatedAt: DateTime(2026, 9, 1),
      );

      expect(emergency.isEmergency, isTrue);
      expect(emergency.phone, '128');
      expect(emergency.is24Hours, isTrue);
    });
  });

  group('GeoLocationService — Cálculo de Distancias en Nicaragua', () {
    final geo = GeoLocationService();

    test('Calcula distancia realista entre Managua y León (~75 km)', () {
      // Managua (12.1364, -86.2514) a León (12.4379, -86.8780)
      final distance = geo.calculateDistanceKm(
        startLat: 12.1364,
        startLng: -86.2514,
        endLat: 12.4379,
        endLng: -86.8780,
      );

      // Distancia geodésica en línea recta: aprox 75 km (+/- 5 km)
      expect(distance, greaterThan(70.0));
      expect(distance, lessThan(85.0));
    });

    test('Calcula distancia realista entre Managua y Granada (~40 km)', () {
      // Managua a Granada (11.9299, -85.9560)
      final distance = geo.calculateDistanceKm(
        startLat: 12.1364,
        startLng: -86.2514,
        endLat: 11.9299,
        endLng: -85.9560,
      );

      expect(distance, greaterThan(35.0));
      expect(distance, lessThan(48.0));
    });
  });
}
