// ============================================================================
// 🧭 BAQUEANO — PRUEBAS DEL REPOSITORIO DE CATÁLOGO (SUPABASE → APP)
// ============================================================================
//
// 🎯 POR QUÉ: garantizar que la App muestra los mismos datos reales que la Web
//   y que nunca inventa coordenadas, calificaciones ni URLs inseguras.
// ⚙️ CÓMO: prueba los mapeadores puros de `CatalogRepository` y la
//   construcción de URLs de `SupabaseRestClient`, sin red.
// 📦 QUÉ: casos válidos, filas incompletas, coordenadas fuera de Nicaragua,
//   estados no publicados, imágenes http y nombres de tabla inválidos.
// ============================================================================

import 'package:baqueano_app/core/api/supabase_rest_client.dart';
import 'package:baqueano_app/data/repositories/catalog_repository.dart';
import 'package:flutter_test/flutter_test.dart';

Map<String, dynamic> _destination([Map<String, dynamic> overrides = const {}]) {
  return {
    'id': 'dest_canon_somoto',
    'department_id': 'madriz',
    'name': 'Cañón de Somoto',
    'category': 'naturaleza',
    'short_desc': 'Cañón del río Coco',
    'description': '',
    'latitude': 13.4766,
    'longitude': -86.6162,
    'cover_image': 'https://example.org/somoto.jpg',
    'rating': null,
    'reviews_count': 0,
    'verified': true,
    'status': 'published',
    'source_name': 'INTUR',
    'source_url': 'https://www.intur.gob.ni',
    'created_at': '2026-10-01T00:00:00Z',
    'updated_at': '2026-10-04T00:00:00Z',
    ...overrides,
  };
}

void main() {
  group('CatalogRepository.placeFromDestinationRow', () {
    test('mapea un destino real con nombre de departamento', () {
      final place = CatalogRepository.placeFromDestinationRow(
        _destination(),
        departmentNames: const {'madriz': 'Madriz'},
      );

      expect(place, isNotNull);
      expect(place!.placeId, 'dest_canon_somoto');
      expect(place.departmentName, 'Madriz');
      expect(place.categoryName, 'Naturaleza');
      expect(place.description, 'Cañón del río Coco');
      expect(place.verified, isTrue);
      expect(place.verificationSource, 'INTUR');
      expect(place.isTourist, isTrue);
    });

    test('no inventa calificación cuando no hay reseñas', () {
      final place = CatalogRepository.placeFromDestinationRow(_destination());
      expect(place!.rating, 0);
      expect(place.reviewCount, 0);
    });

    test('descarta destinos sin coordenadas o fuera de Nicaragua', () {
      expect(
        CatalogRepository.placeFromDestinationRow(
          _destination({'latitude': null}),
        ),
        isNull,
      );
      expect(
        CatalogRepository.placeFromDestinationRow(
          _destination({'latitude': 40.4, 'longitude': -3.7}),
        ),
        isNull,
      );
    });

    test('descarta destinos no publicados', () {
      expect(
        CatalogRepository.placeFromDestinationRow(
          _destination({'status': 'draft'}),
        ),
        isNull,
      );
    });

    test('rechaza imágenes que no son https', () {
      final place = CatalogRepository.placeFromDestinationRow(
        _destination({'cover_image': 'http://inseguro.example/x.jpg'}),
      );
      expect(place!.imageUrl, isEmpty);
      expect(place.imageUrls, isEmpty);
    });
  });

  group('CatalogRepository.businessFromRow', () {
    test('conserva el negocio sin inventar coordenadas', () {
      final business = CatalogRepository.businessFromRow({
        'id': 'biz-coop-somoto',
        'name': 'Cooperativa de guías de Somoto',
        'category': 'guia',
        'department': 'Madriz',
        'latitude': null,
        'longitude': null,
        'verified': true,
      });

      expect(business, isNotNull);
      expect(business!.hasCoordinates, isFalse);
      expect(business.verified, isTrue);
    });
  });

  group('CatalogRepository.snapshotFromRaw', () {
    test('arma el catálogo completo y conserva el origen', () {
      final snapshot = CatalogRepository.snapshotFromRaw(
        {
          'departments': [
            {'id': 'madriz', 'name': 'Madriz', 'capital': 'Somoto'},
            {'id': '', 'name': 'Sin id'},
          ],
          'destinations': [
            _destination(),
            _destination({'id': 'sin_coords', 'longitude': null}),
          ],
          'businesses': [
            {'id': 'biz-1', 'name': 'Negocio verificado', 'verified': true},
          ],
          'fetchedAt': '2026-10-05T00:00:00Z',
        },
        CatalogSource.cache,
      );

      expect(snapshot.source, CatalogSource.cache);
      expect(snapshot.departments, hasLength(1));
      expect(snapshot.places, hasLength(1));
      expect(snapshot.places.first.departmentName, 'Madriz');
      expect(snapshot.businesses, hasLength(1));
      expect(snapshot.fetchedAt, isNotNull);
    });

    test('tolera datos corruptos sin lanzar excepciones', () {
      final snapshot = CatalogRepository.snapshotFromRaw(
        {'departments': 'x', 'destinations': null, 'businesses': [1, 2]},
        CatalogSource.cache,
      );
      expect(snapshot.isEmpty, isTrue);
    });
  });

  group('SupabaseRestClient.buildUri', () {
    const client = SupabaseRestClient(
      baseUrl: 'https://demo.supabase.co',
      publishableKey: 'sb_publishable_demo',
    );

    test('construye la URL de PostgREST con parámetros', () {
      final uri = client.buildUri('destinations', {'select': 'id,name'});
      expect(uri.host, 'demo.supabase.co');
      expect(uri.path, '/rest/v1/destinations');
      expect(uri.queryParameters['select'], 'id,name');
    });

    test('rechaza nombres de tabla inválidos', () {
      expect(
        () => client.buildUri('destinations?select=*', const {}),
        throwsA(isA<SupabaseRestException>()),
      );
    });
  });
}
