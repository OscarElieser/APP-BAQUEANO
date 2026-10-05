// ============================================================================
// 🆘 BAQUEANO — REPOSITORIO DE ALERTAS SOS (APP → OPS CENTER)
// ============================================================================
//
// 🎯 POR QUÉ (Propósito):
// - Que el Centro de Operaciones sepa cuándo y dónde un viajero pidió ayuda,
//   sin retrasar nunca la llamada a los servicios de emergencia.
//
// ⚙️ CÓMO (Arquitectura):
// - POST a la Edge Function `baqueano-sos` con el ID token de Firebase en
//   `x-firebase-token` (el servidor lo verifica; la App no decide nada).
// - Solo se envían coordenadas reales del GPS; si no hay, se envía el motivo
//   (`denied`, `disabled`, `unavailable`) y nunca una posición por defecto.
// - Timeout corto (8 s) y sin reintentos: es un registro complementario.
// - El resultado es un estado tipado para mostrar mensajes honestos.
//
// 📦 QUÉ (Entregables):
// - `SosRepository.report(...)` → `SosReportResult`.
// - `sosRepositoryProvider` (Riverpod).
// ============================================================================

import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum SosReportStatus { recorded, throttled, needsSignIn, failed }

class SosReportResult {
  final SosReportStatus status;
  final String? id;

  const SosReportResult(this.status, {this.id});

  /// Mensaje para el viajero. La llamada nunca depende de este registro.
  String get message {
    switch (status) {
      case SosReportStatus.recorded:
        return 'Alerta registrada: el Centro de Operaciones BAQUEANO fue notificado.';
      case SosReportStatus.throttled:
        return 'Tu alerta ya está registrada en el Centro de Operaciones.';
      case SosReportStatus.needsSignIn:
        return 'Inicia sesión para que el Centro de Operaciones reciba tu alerta. La llamada funciona igual.';
      case SosReportStatus.failed:
        return 'No se pudo avisar al Centro de Operaciones (sin conexión). La llamada funciona igual.';
    }
  }
}

class SosRepository {
  static const String defaultEndpoint = String.fromEnvironment(
    'SOS_ENDPOINT',
    defaultValue:
        'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-sos',
  );

  final String endpoint;
  final Future<String?> Function() _tokenProvider;

  SosRepository({
    this.endpoint = defaultEndpoint,
    Future<String?> Function()? tokenProvider,
  }) : _tokenProvider = tokenProvider ?? _firebaseToken;

  static Future<String?> _firebaseToken() async {
    try {
      return await FirebaseAuth.instance.currentUser?.getIdToken();
    } catch (_) {
      return null;
    }
  }

  /// Construye el cuerpo de la solicitud. Expuesto para pruebas.
  static Map<String, dynamic> buildPayload({
    double? latitude,
    double? longitude,
    double? accuracyMeters,
    required String locationStatus,
    String? dialedService,
  }) {
    final hasCoords = latitude != null &&
        longitude != null &&
        latitude.isFinite &&
        longitude.isFinite &&
        latitude.abs() <= 90 &&
        longitude.abs() <= 180;
    return {
      'action': 'report',
      'channel': 'android',
      'location_status': hasCoords ? 'gps' : locationStatus,
      if (hasCoords) 'latitude': latitude,
      if (hasCoords) 'longitude': longitude,
      if (hasCoords && accuracyMeters != null && accuracyMeters.isFinite)
        'accuracy_m': accuracyMeters,
      if (dialedService != null &&
          RegExp(r'^[0-9+]{3,15}$').hasMatch(dialedService))
        'dialed_service': dialedService,
    };
  }

  Future<SosReportResult> report({
    double? latitude,
    double? longitude,
    double? accuracyMeters,
    String locationStatus = 'unavailable',
    String? dialedService,
  }) async {
    final token = await _tokenProvider();
    if (token == null || token.isEmpty) {
      return const SosReportResult(SosReportStatus.needsSignIn);
    }

    final client = HttpClient()..connectionTimeout = const Duration(seconds: 5);
    try {
      final request = await client
          .postUrl(Uri.parse(endpoint))
          .timeout(const Duration(seconds: 8));
      request.headers
        ..set(HttpHeaders.contentTypeHeader, 'application/json; charset=utf-8')
        ..set('x-firebase-token', token);
      request.write(jsonEncode(buildPayload(
        latitude: latitude,
        longitude: longitude,
        accuracyMeters: accuracyMeters,
        locationStatus: locationStatus,
        dialedService: dialedService,
      )));
      final response =
          await request.close().timeout(const Duration(seconds: 8));
      final body = await response
          .transform(utf8.decoder)
          .join()
          .timeout(const Duration(seconds: 8));

      if (response.statusCode == 401) {
        return const SosReportResult(SosReportStatus.needsSignIn);
      }
      if (response.statusCode != 200) {
        return const SosReportResult(SosReportStatus.failed);
      }
      final decoded = jsonDecode(body);
      if (decoded is Map && decoded['recorded'] == true) {
        return SosReportResult(SosReportStatus.recorded,
            id: decoded['id']?.toString());
      }
      if (decoded is Map && decoded['throttled'] == true) {
        return const SosReportResult(SosReportStatus.throttled);
      }
      return const SosReportResult(SosReportStatus.failed);
    } catch (error) {
      debugPrint('⚠️ [SosRepository] No se pudo registrar la alerta: $error');
      return const SosReportResult(SosReportStatus.failed);
    } finally {
      client.close(force: true);
    }
  }
}

final sosRepositoryProvider = Provider<SosRepository>((ref) {
  return SosRepository();
});
