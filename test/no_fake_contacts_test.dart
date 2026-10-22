// 🧪 BAQUEANO — SIN CONTACTOS NI CALIFICACIONES INVENTADOS EN LA APP (22-10-2026)
//
// 🎯 POR QUÉ: regla del propietario «todo real, sin datos falsos». La app mostraba locales,
//   dueños y teléfonos inventados en Gastronomía, anfitriones inventados en Mensajes,
//   testimonios de personas inventadas en la portada, un teléfono y un correo de relleno en
//   Hospedaje, estrellas sin reseñas en Playas y una reserva de ejemplo en el panel.
// ⚙️ CÓMO: los datos viejos se conservan en catalog_data.dart (no se borra nada); estas pruebas
//   fallan si una pantalla vuelve a mostrarlos.
import 'dart:io';

import 'package:baqueano_app/config/feature_flags.dart';
import 'package:flutter_test/flutter_test.dart';

String _read(String path) => File(path).readAsStringSync();

void main() {
  test('mensajería con anfitriones inventados: apagada', () {
    expect(kHostMessagingEnabled, isFalse);
  });

  test('Gastronomía no muestra local, dueño, dirección, precio, horario ni teléfono inventados', () {
    final src = _read('lib/features/catalog/screens/gastronomy_screen.dart');
    for (final field in ['dish.recommendedPlace', 'dish.ownerName', 'dish.fullAddress', 'dish.estimatedPrice', 'dish.schedule', 'dish.contactPhone']) {
      expect(src.contains(field), isFalse, reason: '$field volvió a la pantalla');
    }
    expect(src.contains('baqueanonicaragua.com/aliados'), isTrue);
  });

  test('portada: testimonios reales de Comunidad, no los inventados', () {
    final src = _read('lib/features/home/widgets/explorer_testimonials.dart');
    expect(src.contains('CatalogData.explorerReviews'), isFalse);
    expect(src.contains('communityRepositoryProvider'), isTrue);
  });

  test('Hospedaje sin teléfono ni correo de relleno', () {
    final src = _read('lib/features/catalog/screens/lodging_screen.dart');
    expect(src.contains("'+505 8888 1234'"), isFalse);
    expect(src.contains("?? 'info@baqueano.ni'"), isFalse);
  });

  test('Playas sin estrellas y buscador sin el local inventado', () {
    expect(_read('lib/features/catalog/screens/beaches_screen.dart').contains(r"'${spot.rating}'"), isFalse);
    expect(_read('lib/core/widgets/universal_search_modal.dart').contains('recommendedPlace'), isFalse);
  });

  test('el panel no cuenta la reserva de ejemplo como real', () {
    final src = _read('lib/services/destination_service.dart');
    expect(src.contains('_reservations = <ReservationModel>[];'), isTrue);
    expect(RegExp(r"^\s+bookingCode: 'BAQ-849204'", multiLine: true).hasMatch(src), isFalse);
  });
}
