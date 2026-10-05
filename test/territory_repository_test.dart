// ============================================================================
// 🧭 BAQUEANO — PRUEBAS DEL REPOSITORIO DE TERRITORIOS
// ============================================================================
// 🎯 POR QUÉ: la APK debe mostrar los mismos territorios y lugares que la Web,
//   sin inventar coordenadas.
// ⚙️ CÓMO: parsea el asset real generado desde la Web y casos defectuosos.
// 📦 QUÉ: 17 territorios, lugares con descripción, normalización de IDs.
// ============================================================================

import 'dart:io';

import 'package:baqueano_app/data/repositories/territory_repository.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('el asset compartido con la Web trae 17 territorios con lugares', () {
    final text = File('assets/data/territories_places.json').readAsStringSync();
    final territories = TerritoryRepository.parse(text);

    expect(territories, hasLength(17));
    for (final territory in territories.values) {
      expect(territory.places, isNotEmpty, reason: territory.id);
      for (final place in territory.places) {
        expect(place.desc, isNotEmpty, reason: '${territory.id}/${place.name}');
      }
    }
    expect(territories.containsKey('nueva_segovia'), isTrue);
    expect(territories.containsKey('rio_san_juan'), isTrue);
  });

  test('normaliza los IDs internos de la App al formato de Supabase', () {
    expect(TerritoryRepository.normalizeDepartmentId('d-nueva-segovia'), 'nueva_segovia');
    expect(TerritoryRepository.normalizeDepartmentId('rio-san-juan'), 'rio_san_juan');
    expect(TerritoryRepository.normalizeDepartmentId('Madriz'), 'madriz');
  });

  test('descarta lugares sin descripción y no inventa coordenadas', () {
    final territories = TerritoryRepository.parse('''
      {"territories": [
        {"id": "madriz", "name": "Madriz", "places": [
          {"name": "Cañón de Somoto", "type": "Geositio", "desc": "Cañón del río Coco."},
          {"name": "Sin descripción", "desc": ""}
        ]},
        {"id": "", "name": "Sin id"}
      ]}
    ''');

    expect(territories.keys, ['madriz']);
    expect(territories['madriz']!.places, hasLength(1));
    expect(territories['madriz']!.places.first.hasCoordinates, isFalse);
  });

  test('tolera JSON con formato inesperado', () {
    expect(TerritoryRepository.parse('[]'), isEmpty);
    expect(TerritoryRepository.parse('{"territories": "x"}'), isEmpty);
  });
}
