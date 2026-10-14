// ============================================================================
// 🧭 BAQUEANO — REGISTRO DE CONTACTOS DIRECTOS (lib/services/contact_action_service.dart)
// ============================================================================
// 🎯 POR QUÉ:
// - BAQUEANO no gestiona reservas: el viajero contacta al propietario por WhatsApp,
//   llamada o correo. El Ops Center (web) debe ver esos contactos también cuando
//   salen de la app Android, igual que los de la web.
//
// ⚙️ CÓMO:
// - Llama a la RPC pública `track_commercial_action` de Supabase (la misma que usa
//   `website/js/baqueano-analytics.js`) con la clave publicable. El servidor valida
//   que el negocio exista, limita la frecuencia y fija el usuario con auth.uid().
// - Identificador anónimo aleatorio en memoria por proceso (como PresenceService):
//   no se guarda en el teléfono ni deriva de datos personales. Nunca se envían
//   nombres, teléfonos ni mensajes, solo el tipo de acción y el id público del negocio.
// - Nunca rompe la app: cualquier error se ignora en silencio.
//
// 📦 QUÉ: `ContactActionService.instance.record(ContactChannel.whatsapp, businessId)`.
// ============================================================================
import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math';

import '../core/api/supabase_rest_client.dart';

enum ContactChannel { whatsapp, call, email }

class ContactActionService {
  ContactActionService._();
  static final ContactActionService instance = ContactActionService._();

  static const Duration _timeout = Duration(seconds: 8);
  static const int _maxPerProcess = 30;

  final String _anonymousId = 'android-${_randomId()}';
  final String _sessionId = 'ses-${_randomId()}';
  int _sent = 0;

  static String _randomId() {
    final rnd = Random.secure();
    return List<int>.generate(12, (_) => rnd.nextInt(256))
        .map((b) => b.toRadixString(16).padLeft(2, '0'))
        .join();
  }

  /// Tipo de acción que entiende `track_commercial_action`.
  static String actionType(ContactChannel channel) {
    switch (channel) {
      case ContactChannel.whatsapp:
        return 'whatsapp';
      case ContactChannel.call:
        return 'call';
      case ContactChannel.email:
        return 'contact';
    }
  }

  /// Cuerpo de la RPC. Expuesto para pruebas.
  Map<String, Object?> buildBody(ContactChannel channel, String businessId) => {
        'p_action_type': actionType(channel),
        'p_anonymous_id': _anonymousId,
        'p_session_id': _sessionId,
        'p_platform': 'android',
        'p_business_id': businessId.length > 120 ? businessId.substring(0, 120) : businessId,
      };

  /// Registra el contacto sin bloquear la interfaz (no se espera la respuesta).
  void record(ContactChannel channel, String? businessId) {
    final id = businessId?.trim() ?? '';
    if (id.isEmpty || _sent >= _maxPerProcess) return;
    _sent += 1;
    unawaited(_post(buildBody(channel, id)));
  }

  Future<void> _post(Map<String, Object?> body) async {
    final client = HttpClient()..connectionTimeout = _timeout;
    try {
      final uri = Uri.parse('${SupabaseRestClient.defaultUrl}/rest/v1/rpc/track_commercial_action');
      final request = await client.postUrl(uri).timeout(_timeout);
      request.headers
        ..set('apikey', SupabaseRestClient.defaultPublishableKey)
        ..set(HttpHeaders.authorizationHeader, 'Bearer ${SupabaseRestClient.defaultPublishableKey}')
        ..set(HttpHeaders.contentTypeHeader, 'application/json');
      request.add(utf8.encode(jsonEncode(body)));
      final response = await request.close().timeout(_timeout);
      await response.drain<void>().timeout(_timeout);
    } catch (_) {
      // Sin red o rechazado por el servidor: el contacto con el negocio sigue igual.
    } finally {
      client.close(force: true);
    }
  }
}
