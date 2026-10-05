// ============================================================================
// 📅 BAQUEANO — REPOSITORIO DE SOLICITUDES DE RESERVA (WhatsApp / teléfono)
// ============================================================================
//
// 🎯 POR QUÉ (Propósito):
// - BAQUEANO no cobra en línea: la reserva es una solicitud registrada que el
//   viajero coordina directamente con el negocio verificado (WhatsApp o
//   llamada). Precio y pago se acuerdan con el negocio.
// - Antes la solicitud solo vivía en memoria y se mostraban anfitriones y
//   teléfonos ficticios.
//
// ⚙️ CÓMO (Arquitectura):
// - Edge Function `baqueano-reservas` con el ID token de Firebase. El código
//   BQ-XXXXXX y el contacto del negocio vienen del servidor.
// - Funciones puras para el mensaje de WhatsApp y las etiquetas de estado
//   (probadas sin red).
//
// 📦 QUÉ (Entregables):
// - `ReservationRequest`, `ReservationRepository` (create / mine / cancel).
// - `reservationRepositoryProvider`, `myReservationsProvider`.
// ============================================================================

import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ReservationException implements Exception {
  final String message;
  final int? statusCode;
  const ReservationException(this.message, {this.statusCode});

  bool get needsSignIn => statusCode == 401;

  @override
  String toString() => message;
}

class ReservationRequest {
  final String id;
  final String code;
  final String status;
  final String businessId;
  final String businessName;
  final String businessPhone;
  final String businessWhatsapp;
  final String serviceTitle;
  final String destinationName;
  final DateTime? travelDate;
  final int peopleCount;
  final String notes;
  final DateTime? createdAt;

  const ReservationRequest({
    required this.id,
    required this.code,
    required this.status,
    this.businessId = '',
    this.businessName = '',
    this.businessPhone = '',
    this.businessWhatsapp = '',
    this.serviceTitle = '',
    this.destinationName = '',
    this.travelDate,
    this.peopleCount = 1,
    this.notes = '',
    this.createdAt,
  });

  bool get canCancel => status == 'pending' || status == 'confirmed';

  static const Map<String, String> statusLabels = {
    'pending': 'Solicitud enviada · coordina con el negocio',
    'confirmed': 'Confirmada por el negocio',
    'rejected': 'No disponible',
    'cancelled': 'Cancelada',
    'completed': 'Completada',
  };

  String get statusLabel => statusLabels[status] ?? status;

  static ReservationRequest? fromJson(Map<String, dynamic> json) {
    String text(Object? value) => value?.toString().trim() ?? '';
    final id = text(json['id']);
    final code = text(json['reservation_code']);
    if (id.isEmpty || code.isEmpty) return null;
    final business = json['businesses'];
    final biz = business is Map ? business : const {};
    return ReservationRequest(
      id: id,
      code: code,
      status: text(json['status']).isEmpty ? 'pending' : text(json['status']),
      businessId: text(json['business_id']),
      businessName: text(biz['name']),
      businessPhone: text(biz['phone']),
      businessWhatsapp: text(biz['whatsapp']),
      serviceTitle: text(json['service_title']),
      destinationName: text(json['destination_name']),
      travelDate: DateTime.tryParse(text(json['travel_date'])),
      peopleCount: (json['people_count'] as num?)?.toInt() ?? 1,
      notes: text(json['notes']),
      createdAt: DateTime.tryParse(text(json['created_at'])),
    );
  }
}

class ReservationRepository {
  static const String defaultEndpoint = String.fromEnvironment(
    'RESERVATIONS_ENDPOINT',
    defaultValue:
        'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-reservas',
  );

  final String endpoint;
  final Future<String?> Function() _tokenProvider;

  ReservationRepository({
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

  /// `AAAA-MM-DD` en hora local (lo que el viajero eligió en el calendario).
  static String formatDate(DateTime date) =>
      '${date.year.toString().padLeft(4, '0')}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';

  /// Solo dígitos para wa.me (`+505 8888-8888` → `50588888888`). Un número
  /// nicaragüense de 8 dígitos sin código de país recibe el prefijo 505.
  static String whatsappDigits(String phone) {
    final digits = phone.replaceAll(RegExp(r'[^0-9]'), '');
    return digits.length == 8 ? '505$digits' : digits;
  }

  /// Mensaje prellenado para coordinar por WhatsApp (sin datos inventados).
  static String buildWhatsAppMessage({
    required String businessName,
    required DateTime travelDate,
    required int people,
    String? code,
    String? destinationName,
    String? contactName,
    String? notes,
  }) {
    final lines = <String>[
      'Hola $businessName, vi su negocio verificado en BAQUEANO y quiero reservar.',
      if (code != null && code.isNotEmpty) 'Código de solicitud: $code',
      if (destinationName != null && destinationName.isNotEmpty) 'Destino: $destinationName',
      'Fecha: ${formatDate(travelDate)}',
      'Personas: $people',
      if (contactName != null && contactName.isNotEmpty) 'Nombre: $contactName',
      if (notes != null && notes.isNotEmpty) 'Nota: $notes',
      '¿Me confirman disponibilidad, precio y forma de pago?',
    ];
    return lines.join('\n');
  }

  Future<({ReservationRequest reservation, String businessPhone, String businessWhatsapp})> create({
    required String businessId,
    required DateTime travelDate,
    required int people,
    required String contactPhone,
    String? contactName,
    String? destinationName,
    String? serviceTitle,
    String? notes,
  }) async {
    final data = await _post({
      'action': 'create',
      'business_id': businessId,
      'travel_date': formatDate(travelDate),
      'people_count': people,
      'contact_phone': contactPhone.trim(),
      if (contactName != null && contactName.trim().isNotEmpty) 'contact_name': contactName.trim(),
      if (destinationName != null && destinationName.trim().isNotEmpty) 'destination_name': destinationName.trim(),
      if (serviceTitle != null && serviceTitle.trim().isNotEmpty) 'service_title': serviceTitle.trim(),
      if (notes != null && notes.trim().isNotEmpty) 'notes': notes.trim(),
      'channel': 'android',
    }, requireAuth: true);
    final raw = data['reservation'];
    final business = data['business'] is Map ? data['business'] as Map : const {};
    final reservation = raw is Map
        ? ReservationRequest.fromJson({
            ...Map<String, dynamic>.from(raw),
            'business_id': businessId,
            'travel_date': formatDate(travelDate),
            'people_count': people,
            'destination_name': destinationName,
            'businesses': business,
          })
        : null;
    if (reservation == null) {
      throw const ReservationException('Respuesta inesperada al registrar la solicitud.');
    }
    return (
      reservation: reservation,
      businessPhone: business['phone']?.toString() ?? '',
      businessWhatsapp: business['whatsapp']?.toString() ?? '',
    );
  }

  Future<List<ReservationRequest>> mine() async {
    final data = await _post({'action': 'mine'}, requireAuth: true);
    final items = data['items'];
    if (items is! List) return const [];
    return items
        .whereType<Map>()
        .map((row) => ReservationRequest.fromJson(Map<String, dynamic>.from(row)))
        .whereType<ReservationRequest>()
        .toList(growable: false);
  }

  Future<void> cancel(String id) async {
    await _post({'action': 'cancel', 'id': id}, requireAuth: true);
  }

  Future<Map<String, dynamic>> _post(
    Map<String, dynamic> payload, {
    bool requireAuth = false,
  }) async {
    final token = await _tokenProvider();
    if (requireAuth && (token == null || token.isEmpty)) {
      throw const ReservationException(
        'Inicia sesión para guardar tu solicitud en Mi Viaje.',
        statusCode: 401,
      );
    }
    final client = HttpClient()..connectionTimeout = const Duration(seconds: 6);
    try {
      final request = await client
          .postUrl(Uri.parse(endpoint))
          .timeout(const Duration(seconds: 15));
      request.headers
          .set(HttpHeaders.contentTypeHeader, 'application/json; charset=utf-8');
      if (token != null && token.isNotEmpty) {
        request.headers.set('x-firebase-token', token);
      }
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
        throw ReservationException(
          data?['error']?.toString() ??
              'El servicio de reservas no respondió (HTTP ${response.statusCode}).',
          statusCode: response.statusCode,
        );
      }
      return data;
    } on ReservationException {
      rethrow;
    } on TimeoutException {
      throw const ReservationException('El servicio de reservas tardó demasiado.');
    } on SocketException {
      throw const ReservationException('Sin conexión a internet.');
    } on FormatException {
      throw const ReservationException('Respuesta inválida del servicio de reservas.');
    } finally {
      client.close(force: true);
    }
  }
}

final reservationRepositoryProvider = Provider<ReservationRepository>((ref) {
  return ReservationRepository();
});

/// Solicitudes del viajero ("Mi Viaje"). `ref.invalidate` para recargar.
final myReservationsProvider =
    FutureProvider.autoDispose<List<ReservationRequest>>((ref) {
  return ref.watch(reservationRepositoryProvider).mine();
});
