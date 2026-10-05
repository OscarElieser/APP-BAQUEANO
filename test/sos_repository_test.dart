// ============================================================================
// 🆘 BAQUEANO — PRUEBAS DEL REPOSITORIO SOS
// ============================================================================
// 🎯 POR QUÉ: una alerta SOS nunca debe enviar una ubicación inventada ni
//   bloquear al viajero si no tiene sesión.
// ⚙️ CÓMO: prueba el armado del cuerpo y el caso sin sesión, sin red.
// 📦 QUÉ: coordenadas reales, coordenadas inválidas, número marcado y
//   resultado `needsSignIn` cuando no hay token.
// ============================================================================

import 'package:baqueano_app/data/repositories/sos_repository.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('SosRepository.buildPayload', () {
    test('incluye coordenadas GPS reales y el servicio marcado', () {
      final payload = SosRepository.buildPayload(
        latitude: 13.4766,
        longitude: -86.6162,
        accuracyMeters: 12,
        locationStatus: 'gps',
        dialedService: '118',
      );

      expect(payload['action'], 'report');
      expect(payload['channel'], 'android');
      expect(payload['location_status'], 'gps');
      expect(payload['latitude'], 13.4766);
      expect(payload['longitude'], -86.6162);
      expect(payload['accuracy_m'], 12);
      expect(payload['dialed_service'], '118');
    });

    test('sin coordenadas envía el motivo y ninguna posición', () {
      final payload = SosRepository.buildPayload(locationStatus: 'denied');

      expect(payload['location_status'], 'denied');
      expect(payload.containsKey('latitude'), isFalse);
      expect(payload.containsKey('longitude'), isFalse);
    });

    test('descarta coordenadas no finitas o fuera de rango', () {
      final nan = SosRepository.buildPayload(
        latitude: double.nan,
        longitude: -86.2,
        locationStatus: 'unavailable',
      );
      final outOfRange = SosRepository.buildPayload(
        latitude: 120,
        longitude: -86.2,
        locationStatus: 'unavailable',
      );

      expect(nan.containsKey('latitude'), isFalse);
      expect(outOfRange.containsKey('latitude'), isFalse);
      expect(outOfRange['location_status'], 'unavailable');
    });

    test('ignora números marcados con formato inválido', () {
      final payload = SosRepository.buildPayload(
        locationStatus: 'unavailable',
        dialedService: '118; rm -rf',
      );
      expect(payload.containsKey('dialed_service'), isFalse);
    });
  });

  test('sin sesión no llama al servidor y pide iniciar sesión', () async {
    final repository = SosRepository(
      endpoint: 'https://example.invalid/sos',
      tokenProvider: () async => null,
    );

    final result = await repository.report(dialedService: '118');

    expect(result.status, SosReportStatus.needsSignIn);
    expect(result.message, contains('La llamada funciona igual'));
  });
}
