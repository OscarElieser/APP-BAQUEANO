// ============================================================================
// 📅 BAQUEANO — PRUEBAS DE SOLICITUDES DE RESERVA
// ============================================================================
// 🎯 POR QUÉ: la reserva se coordina por WhatsApp/teléfono sin pago en línea;
//   el mensaje y los datos deben ser reales y trazables.
// ⚙️ CÓMO: funciones puras y caso sin sesión (sin red).
// 📦 QUÉ: mapeo desde el servidor, mensaje de WhatsApp, normalización de
//   teléfonos/departamentos y bloqueo sin sesión.
// ============================================================================

import 'package:baqueano_app/data/repositories/reservation_repository.dart';
import 'package:baqueano_app/features/checkout/widgets/reservation_request_sheet.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('mapea una solicitud del servidor con el negocio real', () {
    final reservation = ReservationRequest.fromJson({
      'id': '3f1c2b9e-0000-4000-8000-000000000001',
      'reservation_code': 'BQ-7KX2MP',
      'status': 'pending',
      'business_id': 'biz-coop-somoto',
      'travel_date': '2026-11-20',
      'people_count': 3,
      'destination_name': 'Cañón de Somoto',
      'businesses': {'name': 'Coop. Guías del Cañón', 'phone': '50584431289', 'whatsapp': '50584431289'},
    });

    expect(reservation, isNotNull);
    expect(reservation!.code, 'BQ-7KX2MP');
    expect(reservation.businessName, 'Coop. Guías del Cañón');
    expect(reservation.travelDate, DateTime(2026, 11, 20));
    expect(reservation.canCancel, isTrue);
    expect(reservation.statusLabel, contains('coordina con el negocio'));
  });

  test('descarta respuestas sin id o sin código', () {
    expect(ReservationRequest.fromJson({'id': 'x'}), isNull);
    expect(ReservationRequest.fromJson({'reservation_code': 'BQ-1'}), isNull);
  });

  test('arma el mensaje de WhatsApp sin datos inventados', () {
    final message = ReservationRepository.buildWhatsAppMessage(
      businessName: 'Red Comunitaria Ometepe Viva',
      travelDate: DateTime(2026, 12, 5),
      people: 2,
      code: 'BQ-ABC234',
      destinationName: 'Isla de Ometepe',
      contactName: 'Ana',
    );

    expect(message, contains('BQ-ABC234'));
    expect(message, contains('Fecha: 2026-12-05'));
    expect(message, contains('Personas: 2'));
    expect(message, contains('precio y forma de pago'));
    expect(message, isNot(contains('USD')));
  });

  test('normaliza teléfonos para wa.me y departamentos con tilde', () {
    expect(ReservationRepository.whatsappDigits('+505 8443-1289'), '50584431289');
    expect(ReservationRequestSheet.normalizeDepartment('León'), 'leon');
    expect(ReservationRequestSheet.normalizeDepartment('rio_san_juan'), 'rio san juan');
    expect(ReservationRequestSheet.normalizeDepartment('Río San Juan'), 'rio san juan');
  });

  test('sin sesión no registra y pide iniciar sesión', () async {
    final repository = ReservationRepository(
      endpoint: 'https://example.invalid/reservas',
      tokenProvider: () async => null,
    );

    expect(
      () => repository.create(
        businessId: 'biz-coop-somoto',
        travelDate: DateTime(2026, 12, 1),
        people: 2,
        contactPhone: '88888888',
      ),
      throwsA(isA<ReservationException>().having((e) => e.needsSignIn, 'needsSignIn', isTrue)),
    );
  });
}
