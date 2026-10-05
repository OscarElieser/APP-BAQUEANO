// ============================================================================
// 🧭 BAQUEANO — REPOSITORIO DE COMUNIDAD (EXPERIENCIAS REALES WEB + APP)
// ============================================================================
//
// 🎯 POR QUÉ (Propósito):
// - La App mostraba relatos de personas ficticias y "publicaba" solo en
//   memoria, prometiendo XP inexistente. La Web ya usa una comunidad real con
//   moderación en el Ops Center; la App debe mostrar y enviar lo mismo.
//
// ⚙️ CÓMO (Arquitectura):
// - Edge Function `baqueano-community` (la misma de `testimonios.html`):
//   `list` es público (RLS: solo publicado); `create` exige el ID token de
//   Firebase en `x-firebase-token` y deja el relato en `pending_review`.
// - Validación local con los mismos límites del servidor (título 5–120,
//   relato 30–4000, valoración 1–5) para dar mensajes claros sin ida y vuelta.
// - Mapeador puro testimonio → `ExplorerReview` (modelo visual existente):
//   sin bandera, foto ni valoración inventadas; solo URLs https.
//
// 📦 QUÉ (Entregables):
// - `CommunityRepository.listPublished()` / `submit(...)`.
// - `CommunitySubmitResult` con estado tipado y mensaje honesto.
// - `communityRepositoryProvider` (Riverpod).
// ============================================================================

import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/models/cultural_models.dart';

class CommunityException implements Exception {
  final String message;
  final int? statusCode;
  const CommunityException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

enum CommunitySubmitStatus { pendingReview, needsSignIn, invalid, failed }

class CommunitySubmitResult {
  final CommunitySubmitStatus status;
  final String message;
  final String? id;

  const CommunitySubmitResult(this.status, this.message, {this.id});
}

class CommunityRepository {
  static const String defaultEndpoint = String.fromEnvironment(
    'COMMUNITY_ENDPOINT',
    defaultValue:
        'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-community',
  );

  final String endpoint;
  final Future<String?> Function() _tokenProvider;

  CommunityRepository({
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

  /// Experiencias publicadas (moderadas en Ops Center), las mismas de la Web.
  Future<List<ExplorerReview>> listPublished({int limit = 24}) async {
    final data = await _post({'action': 'list', 'limit': limit, 'page': 0});
    final items = data['items'];
    if (items is! List) return const [];
    return items
        .whereType<Map>()
        .map((row) => reviewFromTestimonial(Map<String, dynamic>.from(row)))
        .whereType<ExplorerReview>()
        .toList(growable: false);
  }

  /// Valida con los mismos límites del servidor. Devuelve `null` si es válido.
  static String? validate({
    required String title,
    required String body,
    int? rating,
  }) {
    final cleanTitle = title.trim();
    final cleanBody = body.trim();
    if (cleanTitle.length < 5) return 'El título necesita al menos 5 caracteres.';
    if (cleanTitle.length > 120) return 'El título supera 120 caracteres.';
    if (cleanBody.length < 30) {
      return 'Cuenta un poco más: el relato necesita al menos 30 caracteres.';
    }
    if (cleanBody.length > 4000) return 'El relato supera 4000 caracteres.';
    if (rating != null && (rating < 1 || rating > 5)) {
      return 'La valoración va de 1 a 5 estrellas.';
    }
    return null;
  }

  /// Envía el relato a moderación. Nunca se publica directamente.
  Future<CommunitySubmitResult> submit({
    required String title,
    required String body,
    String? destinationName,
    int? rating,
    String? experienceType,
  }) async {
    final invalid = validate(title: title, body: body, rating: rating);
    if (invalid != null) {
      return CommunitySubmitResult(CommunitySubmitStatus.invalid, invalid);
    }
    final token = await _tokenProvider();
    if (token == null || token.isEmpty) {
      return const CommunitySubmitResult(
        CommunitySubmitStatus.needsSignIn,
        'Inicia sesión con Google para compartir tu experiencia.',
      );
    }
    try {
      final data = await _post({
        'action': 'create',
        'title': title.trim(),
        'body': body.trim(),
        if (destinationName != null && destinationName.trim().isNotEmpty)
          'destination_name': destinationName.trim(),
        if (rating != null) 'rating': rating,
        if (experienceType != null) 'experience_type': experienceType,
      }, token: token);
      return CommunitySubmitResult(
        CommunitySubmitStatus.pendingReview,
        'Tu relato fue enviado a revisión. Aparecerá aquí y en la web cuando el equipo BAQUEANO lo apruebe.',
        id: data['id']?.toString(),
      );
    } on CommunityException catch (error) {
      if (error.statusCode == 401) {
        return const CommunitySubmitResult(
          CommunitySubmitStatus.needsSignIn,
          'Tu sesión venció. Vuelve a iniciar sesión para compartir tu experiencia.',
        );
      }
      return CommunitySubmitResult(CommunitySubmitStatus.failed, error.message);
    }
  }

  Future<Map<String, dynamic>> _post(
    Map<String, dynamic> payload, {
    String? token,
  }) async {
    final client = HttpClient()..connectionTimeout = const Duration(seconds: 6);
    try {
      final request = await client
          .postUrl(Uri.parse(endpoint))
          .timeout(const Duration(seconds: 15));
      request.headers
          .set(HttpHeaders.contentTypeHeader, 'application/json; charset=utf-8');
      if (token != null) request.headers.set('x-firebase-token', token);
      request.write(jsonEncode(payload));
      final response =
          await request.close().timeout(const Duration(seconds: 15));
      final text = await response
          .transform(utf8.decoder)
          .join()
          .timeout(const Duration(seconds: 15));
      final decoded = jsonDecode(text);
      final data = decoded is Map ? Map<String, dynamic>.from(decoded) : null;
      if (response.statusCode != 200 || data == null || data['ok'] == false) {
        throw CommunityException(
          data?['error']?.toString() ??
              'La comunidad no respondió (HTTP ${response.statusCode}).',
          statusCode: response.statusCode,
        );
      }
      return data;
    } on CommunityException {
      rethrow;
    } on TimeoutException {
      throw const CommunityException('La comunidad tardó demasiado en responder.');
    } on SocketException {
      throw const CommunityException('Sin conexión a internet.');
    } on FormatException {
      throw const CommunityException('Respuesta inválida de la comunidad.');
    } finally {
      client.close(force: true);
    }
  }

  // ---------------------------------------------------------------------------
  // Mapeador puro (probado en test/community_repository_test.dart)
  // ---------------------------------------------------------------------------

  static ExplorerReview? reviewFromTestimonial(Map<String, dynamic> row) {
    final id = row['id']?.toString() ?? '';
    final body = row['body']?.toString().trim() ?? '';
    if (id.isEmpty || body.isEmpty) return null;

    String https(Object? value) {
      final text = value?.toString().trim() ?? '';
      final uri = Uri.tryParse(text);
      return uri != null && uri.scheme == 'https' && uri.host.isNotEmpty
          ? text
          : '';
    }

    final media = row['media'];
    final photos = <String>[
      if (media is List)
        for (final item in media.whereType<Map>())
          if (item['kind'] == 'image') https(item['url']),
    ].where((url) => url.isNotEmpty).toList(growable: false);

    final destination = [row['destination_name'], row['place_name']]
        .map((value) => value?.toString().trim() ?? '')
        .firstWhere((value) => value.isNotEmpty, orElse: () => '');
    final rating = (row['rating'] as num?)?.toDouble();
    final published = DateTime.tryParse(
      (row['published_at'] ?? row['created_at'])?.toString() ?? '',
    );
    final avatar = https(row['author_avatar']);
    final type = row['experience_type']?.toString();

    return ExplorerReview(
      id: id,
      author: (row['author_name']?.toString().trim().isNotEmpty ?? false)
          ? row['author_name'].toString().trim()
          : 'Viajero BAQUEANO',
      countryFlag: '',
      destination: destination.isNotEmpty ? destination : 'Nicaragua',
      review: body,
      // 0 = sin valoración (la UI la oculta); nunca se inventa una nota.
      rating: rating != null && rating >= 1 && rating <= 5 ? rating : 0,
      photos: photos,
      userPhotoUrl: avatar.isEmpty ? null : avatar,
      isVerifiedGoogle: row['verified_visit'] == true,
      date: published == null
          ? null
          : '${published.year.toString().padLeft(4, '0')}-${published.month.toString().padLeft(2, '0')}-${published.day.toString().padLeft(2, '0')}',
      isEcoGuardian: type == 'ecoturismo',
    );
  }
}

final communityRepositoryProvider = Provider<CommunityRepository>((ref) {
  return CommunityRepository();
});
