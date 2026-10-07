// ============================================================================
// 🧭 BAQUEANO — REPOSITORIO DE MENSAJES (VIAJERO ↔ EQUIPO, WEB + APP)
// ============================================================================
//
// 🎯 POR QUÉ (Propósito):
// - Plan de evolución, F6: la mensajería debe ser la misma en la web y en la App. La web ya la
//   usa en perfil.html#mensajes; este repositorio deja lista la capa de datos de Android sobre
//   el MISMO backend, sin una base aparte.
//
// ⚙️ CÓMO (Arquitectura):
// - Edge Function `baqueano-messages` (acciones de persona: unread, list, thread, start, send).
//   Exige el ID token de Firebase en `x-firebase-token`: el servidor decide el uid; la App
//   nunca lo declara. Android no envía Origin, así que el servidor no le exige uno.
// - Validación local con los mismos límites del servidor (asunto 3–120, mensaje 1–2000) para
//   dar mensajes claros sin ida y vuelta. Mapeadores puros probados en
//   test/messages_repository_test.dart.
// - Pendiente honesto: la pantalla de la App se conecta en la próxima versión del APK (aquí no
//   hay Flutter para compilarla y probarla).
//
// 📦 QUÉ (Entregables):
// - `MessagesRepository` + modelos `ConversationSummary`, `ConversationThread`, `ThreadMessage`.
// - `messagesRepositoryProvider` (Riverpod).
// ============================================================================

import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class MessagesException implements Exception {
  final String message;
  final int? statusCode;
  final String? code;
  const MessagesException(this.message, {this.statusCode, this.code});

  @override
  String toString() => message;
}

class ConversationSummary {
  final String id;
  final String subject;
  final String status; // open | answered | closed
  final int unread;
  final DateTime? lastMessageAt;

  const ConversationSummary({
    required this.id,
    required this.subject,
    required this.status,
    required this.unread,
    this.lastMessageAt,
  });
}

class ThreadMessage {
  final bool fromTeam;
  final String body;
  final DateTime? createdAt;

  const ThreadMessage({required this.fromTeam, required this.body, this.createdAt});
}

class ConversationThread {
  final String id;
  final String subject;
  final String status;
  final List<ThreadMessage> messages;

  const ConversationThread({
    required this.id,
    required this.subject,
    required this.status,
    required this.messages,
  });

  bool get isClosed => status == 'closed';
}

class MessagesRepository {
  static const String defaultEndpoint = String.fromEnvironment(
    'MESSAGES_ENDPOINT',
    defaultValue:
        'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-messages',
  );

  final String endpoint;
  final Future<String?> Function() _tokenProvider;

  MessagesRepository({
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

  /// Mismos límites que el servidor. Devuelve `null` si es válido.
  static String? validate({String? subject, required String body}) {
    if (subject != null) {
      final s = subject.trim();
      if (s.length < 3 || s.length > 120) {
        return 'El asunto debe tener entre 3 y 120 caracteres.';
      }
    }
    final b = body.trim();
    if (b.isEmpty || b.length > 2000) {
      return 'El mensaje debe tener entre 1 y 2000 caracteres.';
    }
    return null;
  }

  Future<int> unread() async {
    final data = await _post({'action': 'unread'});
    final value = data['unread'];
    return value is num ? value.toInt() : 0;
  }

  Future<List<ConversationSummary>> list() async {
    final data = await _post({'action': 'list'});
    return summariesFrom(data['items']);
  }

  Future<ConversationThread?> thread(String id) async {
    final data = await _post({'action': 'thread', 'id': id});
    final raw = data['thread'];
    return raw is Map ? threadFrom(Map<String, dynamic>.from(raw)) : null;
  }

  /// Abre una conversación nueva. Devuelve su id.
  Future<String> start({required String subject, required String body}) async {
    final invalid = validate(subject: subject, body: body);
    if (invalid != null) throw MessagesException(invalid, code: 'invalid');
    final data = await _post({'action': 'start', 'subject': subject.trim(), 'body': body.trim()});
    return data['id']?.toString() ?? '';
  }

  Future<void> send({required String id, required String body}) async {
    final invalid = validate(body: body);
    if (invalid != null) throw MessagesException(invalid, code: 'invalid');
    await _post({'action': 'send', 'id': id, 'body': body.trim()});
  }

  // ---------------------------------------------------------------------------
  // Mapeadores puros
  // ---------------------------------------------------------------------------

  static List<ConversationSummary> summariesFrom(Object? items) {
    if (items is! List) return const [];
    return items
        .whereType<Map>()
        .map((row) {
          final id = row['id']?.toString() ?? '';
          final subject = row['subject']?.toString().trim() ?? '';
          if (id.isEmpty || subject.isEmpty) return null;
          final unread = row['unread'];
          return ConversationSummary(
            id: id,
            subject: subject,
            status: row['status']?.toString() ?? 'open',
            unread: unread is num ? unread.toInt() : 0,
            lastMessageAt: DateTime.tryParse(row['last_message_at']?.toString() ?? ''),
          );
        })
        .whereType<ConversationSummary>()
        .toList(growable: false);
  }

  static ConversationThread? threadFrom(Map<String, dynamic> row) {
    final id = row['id']?.toString() ?? '';
    if (id.isEmpty) return null;
    final raw = row['messages'];
    final messages = raw is List
        ? raw
            .whereType<Map>()
            .map((m) => ThreadMessage(
                  // La persona nunca ve el correo del equipo: solo "Equipo BAQUEANO".
                  fromTeam: m['author'] == 'staff',
                  body: m['body']?.toString() ?? '',
                  createdAt: DateTime.tryParse(m['created_at']?.toString() ?? ''),
                ))
            .where((m) => m.body.isNotEmpty)
            .toList(growable: false)
        : const <ThreadMessage>[];
    return ConversationThread(
      id: id,
      subject: row['subject']?.toString() ?? '',
      status: row['status']?.toString() ?? 'open',
      messages: messages,
    );
  }

  Future<Map<String, dynamic>> _post(Map<String, dynamic> payload) async {
    final token = await _tokenProvider();
    if (token == null || token.isEmpty) {
      throw const MessagesException('Inicia sesión para usar los mensajes.', statusCode: 401, code: 'login_required');
    }
    final client = HttpClient()..connectionTimeout = const Duration(seconds: 6);
    try {
      final request = await client.postUrl(Uri.parse(endpoint)).timeout(const Duration(seconds: 15));
      request.headers.set(HttpHeaders.contentTypeHeader, 'application/json; charset=utf-8');
      request.headers.set('x-firebase-token', token);
      request.write(jsonEncode(payload));
      final response = await request.close().timeout(const Duration(seconds: 15));
      final text = await response.transform(utf8.decoder).join().timeout(const Duration(seconds: 15));
      final decoded = jsonDecode(text);
      final data = decoded is Map ? Map<String, dynamic>.from(decoded) : null;
      if (response.statusCode != 200 || data == null || data['ok'] == false) {
        throw MessagesException(
          data?['error']?.toString() ?? 'Los mensajes no respondieron (HTTP ${response.statusCode}).',
          statusCode: response.statusCode,
          code: data?['code']?.toString(),
        );
      }
      return data;
    } on MessagesException {
      rethrow;
    } on TimeoutException {
      throw const MessagesException('Los mensajes tardaron demasiado en responder.');
    } on SocketException {
      throw const MessagesException('Sin conexión a internet.');
    } on FormatException {
      throw const MessagesException('Respuesta inválida del servidor de mensajes.');
    } finally {
      client.close(force: true);
    }
  }
}

final messagesRepositoryProvider = Provider<MessagesRepository>((ref) {
  return MessagesRepository();
});
