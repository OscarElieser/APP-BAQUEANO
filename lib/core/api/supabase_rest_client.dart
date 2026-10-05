// ============================================================================
// 🧭 BAQUEANO — CLIENTE REST DE SUPABASE (FUENTE DE VERDAD OFICIAL)
// ============================================================================
//
// 🎯 POR QUÉ (Propósito):
// - La Web, el Ops Center y la App deben leer la MISMA información. Supabase es
//   la base de datos principal (directiva del propietario, 2026-10-05).
// - La App no tenía ningún acceso a Supabase: lo publicado en Ops Center no
//   llegaba al APK.
//
// ⚙️ CÓMO (Arquitectura):
// - Usa `dart:io HttpClient` (sin dependencias nuevas) contra PostgREST
//   (`/rest/v1/<tabla>`) con la clave PUBLICABLE, la misma que usa la Web en
//   `website/js/supabase-config.js`. No es un secreto: el acceso lo limita RLS
//   (solo filas publicadas / verificadas). Nunca se usa `service_role`.
// - Timeouts de conexión (6 s) y de respuesta (15 s).
// - Reintento solo para GET (idempotente): 3 intentos con espera 0,5 / 1 / 2 s.
// - Errores tipados (`SupabaseRestException`) para que la UI muestre estados
//   honestos (SIN CONEXIÓN / ERROR) en lugar de datos inventados.
// - URL y clave configurables con `--dart-define` (dev/staging/prod).
//
// 📦 QUÉ (Entregables):
// - `SupabaseRestClient.select(table, query)` → `List<Map<String, dynamic>>`.
// - `supabaseRestClientProvider` (Riverpod) para inyectar y probar.
// ============================================================================

import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter_riverpod/flutter_riverpod.dart';

class SupabaseRestException implements Exception {
  final String message;
  final int? statusCode;

  const SupabaseRestException(this.message, {this.statusCode});

  @override
  String toString() => 'SupabaseRestException($statusCode): $message';
}

class SupabaseRestClient {
  static const String defaultUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://heiudfpthqwtjrtluqlm.supabase.co',
  );

  // Clave publicable (pública por diseño, protegida por RLS).
  static const String defaultPublishableKey = String.fromEnvironment(
    'SUPABASE_PUBLISHABLE_KEY',
    defaultValue: 'sb_publishable_q7ZhqRIRjlerZK7WOu_Qxw_X_AqXV1d',
  );

  static const Duration _connectTimeout = Duration(seconds: 6);
  static const Duration _responseTimeout = Duration(seconds: 15);
  static const List<Duration> _retryDelays = [
    Duration(milliseconds: 500),
    Duration(seconds: 1),
    Duration(seconds: 2),
  ];

  final String baseUrl;
  final String publishableKey;

  const SupabaseRestClient({
    this.baseUrl = defaultUrl,
    this.publishableKey = defaultPublishableKey,
  });

  /// Construye la URL de PostgREST. Expuesto para pruebas.
  Uri buildUri(String table, Map<String, String> query) {
    final cleanTable = table.trim();
    if (!RegExp(r'^[a-z_][a-z0-9_]*$').hasMatch(cleanTable)) {
      throw SupabaseRestException('Tabla inválida: $table');
    }
    return Uri.parse('$baseUrl/rest/v1/$cleanTable')
        .replace(queryParameters: query.isEmpty ? null : query);
  }

  /// Lectura (GET) con reintentos acotados. Devuelve las filas visibles por RLS.
  Future<List<Map<String, dynamic>>> select(
    String table, {
    Map<String, String> query = const {},
  }) async {
    final uri = buildUri(table, query);
    SupabaseRestException? lastError;

    for (var attempt = 0; attempt <= _retryDelays.length; attempt++) {
      try {
        return await _get(uri);
      } on SupabaseRestException catch (error) {
        lastError = error;
        // 4xx (salvo 408/429) no se arregla reintentando.
        final code = error.statusCode;
        final retryable =
            code == null || code == 408 || code == 429 || code >= 500;
        if (!retryable || attempt == _retryDelays.length) break;
      }
      await Future<void>.delayed(_retryDelays[attempt]);
    }
    throw lastError ??
        const SupabaseRestException('Error desconocido al leer Supabase');
  }

  Future<List<Map<String, dynamic>>> _get(Uri uri) async {
    final client = HttpClient()..connectionTimeout = _connectTimeout;
    try {
      final request = await client.getUrl(uri).timeout(_responseTimeout);
      request.headers
        ..set('apikey', publishableKey)
        ..set(HttpHeaders.acceptHeader, 'application/json');
      final response = await request.close().timeout(_responseTimeout);
      final body = await response
          .transform(utf8.decoder)
          .join()
          .timeout(_responseTimeout);

      if (response.statusCode != 200) {
        throw SupabaseRestException(
          'HTTP ${response.statusCode}',
          statusCode: response.statusCode,
        );
      }
      final decoded = jsonDecode(body);
      if (decoded is! List) {
        throw const SupabaseRestException('Respuesta inesperada de Supabase');
      }
      return decoded
          .whereType<Map>()
          .map((row) => Map<String, dynamic>.from(row))
          .toList(growable: false);
    } on SupabaseRestException {
      rethrow;
    } on TimeoutException {
      throw const SupabaseRestException('Tiempo de espera agotado');
    } on SocketException catch (error) {
      throw SupabaseRestException('Sin conexión: ${error.message}');
    } on FormatException {
      throw const SupabaseRestException('JSON inválido desde Supabase');
    } on HttpException catch (error) {
      throw SupabaseRestException('HTTP: ${error.message}');
    } finally {
      client.close(force: true);
    }
  }
}

final supabaseRestClientProvider = Provider<SupabaseRestClient>((ref) {
  return const SupabaseRestClient();
});
