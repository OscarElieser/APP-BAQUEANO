// ============================================================================
// BAQUEANO — MODELOS DE RESERVAS Y COMUNICACIÓN EN TIEMPO REAL
// ============================================================================
//
// 🎯 POR QUÉ (WHY / PROPÓSITO):
// - Representar únicamente datos privados que provienen de Firestore o de una
//   escritura local pendiente de sincronización del SDK.
// - Separar el estado verificable de una reserva de su presentación, evitando
//   que una solicitud en cola pueda confundirse con una reserva confirmada.
//
// ⚙️ CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Modelos inmutables conservan la API usada por las pantallas y agregan IDs,
//   metadatos de caché y referencias reales entre reserva y conversación.
// - Estados derivados (`isPending`, `canShowVoucher`) centralizan decisiones de
//   seguridad visual para que cada pantalla interprete Firestore igual.
//
// 📦 QUÉ (WHAT / FUNCIONALIDAD & ENTREGABLES):
// - Entidades para expediciones, contactos, mensajes y notificaciones.
// - Utilidades de estado y formato que no fabrican anfitriones ni confirmaciones.
// ============================================================================

import 'package:flutter/material.dart';

import '../core/theme/app_colors.dart';

enum ExpeditionRecordSource { reservationRequest, reservation }

enum MessageStatus { sending, sent, delivered, read }

@immutable
class RealExpeditionRecord {
  final String id;
  final String code;
  final String destinationTitle;
  final String destinationId;
  final String department;
  final String hostUid;
  final String hostName;
  final String hostBusiness;
  final String hostPhone;
  final String date;
  final DateTime requestedDate;
  final DateTime createdAt;
  final int participants;
  final double totalUsd;
  final double totalNio;
  final String status;
  final String rawStatus;
  final bool isTourist;
  final String imageUrl;
  final String clientName;
  final String clientPhone;
  final String? conversationId;
  final ExpeditionRecordSource source;
  final bool hasPendingWrites;

  const RealExpeditionRecord({
    required this.id,
    required this.code,
    required this.destinationTitle,
    required this.destinationId,
    required this.department,
    required this.hostUid,
    required this.hostName,
    required this.hostBusiness,
    required this.hostPhone,
    required this.date,
    required this.requestedDate,
    required this.createdAt,
    required this.participants,
    required this.totalUsd,
    required this.totalNio,
    required this.status,
    required this.rawStatus,
    required this.isTourist,
    required this.imageUrl,
    required this.clientName,
    required this.clientPhone,
    required this.source,
    this.conversationId,
    this.hasPendingWrites = false,
  });

  bool get isRequest => source == ExpeditionRecordSource.reservationRequest;

  bool get isPending {
    if (isRequest) return true;
    return const {
      'queued',
      'pending',
      'pending_host',
      'accepted',
      'pending_payment',
      'cancellation_requested',
    }.contains(rawStatus.toLowerCase());
  }

  bool get isConfirmed => const {
        'confirmed',
        'paid',
        'active',
      }.contains(rawStatus.toLowerCase());

  bool get isCompleted => rawStatus.toLowerCase() == 'completed';

  bool get canShowVoucher => !isRequest && (isConfirmed || isCompleted);

  String get statusGroup {
    if (isCompleted) return 'Completadas';
    if (isConfirmed) return 'Confirmadas';
    return 'Pendientes';
  }
}

@immutable
class RealHostContact {
  final String id;
  final String? conversationId;
  final String hostUid;
  final String hostName;
  final String businessName;
  final String role;
  final String department;
  final String avatarUrl;
  final String phone;
  final String? reservationId;
  final DateTime updatedAt;
  final bool isVerified;

  const RealHostContact({
    required this.id,
    required this.conversationId,
    required this.hostUid,
    required this.hostName,
    required this.businessName,
    required this.role,
    required this.department,
    required this.avatarUrl,
    required this.phone,
    required this.reservationId,
    required this.updatedAt,
    required this.isVerified,
  });

  bool get hasConversation =>
      conversationId != null && conversationId!.trim().isNotEmpty;

  String get primaryLabel {
    if (hostName.trim().isNotEmpty) return hostName.trim();
    if (businessName.trim().isNotEmpty) return businessName.trim();
    return hostUid.trim();
  }

  String get secondaryLabel {
    if (businessName.trim().isNotEmpty &&
        businessName.trim() != primaryLabel) {
      return businessName.trim();
    }
    return department.trim();
  }
}

@immutable
class RealNotificationItem {
  final String id;
  final String title;
  final String message;
  final DateTime timestamp;
  final String category;
  final bool isRead;
  final String? routeAction;
  final bool hasPendingWrites;

  const RealNotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.timestamp,
    required this.category,
    required this.isRead,
    this.routeAction,
    this.hasPendingWrites = false,
  });

  IconData get icon {
    switch (category) {
      case 'reservas':
        return Icons.receipt_long_rounded;
      case 'mensajes':
        return Icons.chat_bubble_rounded;
      case 'seguridad':
        return Icons.health_and_safety_rounded;
      case 'comunidad':
        return Icons.eco_rounded;
      default:
        return Icons.notifications_rounded;
    }
  }

  Color get accentColor {
    switch (category) {
      case 'reservas':
        return AppColors.terracotta;
      case 'mensajes':
        return AppColors.gold;
      case 'seguridad':
        return const Color(0xFFF59E0B);
      case 'comunidad':
        return AppColors.jungleGreenLight;
      default:
        return AppColors.primary;
    }
  }

  String get timeAgo {
    final difference = DateTime.now().difference(timestamp);
    if (difference.isNegative || difference.inMinutes < 1) return 'Ahora';
    if (difference.inMinutes < 60) return 'Hace ${difference.inMinutes} min';
    if (difference.inHours < 24) return 'Hace ${difference.inHours} h';
    return 'Hace ${difference.inDays} d';
  }
}

@immutable
class RealChatMessage {
  final String id;
  final String senderUid;
  final String text;
  final bool isFromMe;
  final DateTime timestamp;
  final String? relatedBookingCode;
  final String? relatedReservationId;
  final String? imageAttachmentPath;
  final MessageStatus status;
  final bool hasPendingWrites;

  const RealChatMessage({
    required this.id,
    required this.senderUid,
    required this.text,
    required this.isFromMe,
    required this.timestamp,
    required this.status,
    this.relatedBookingCode,
    this.relatedReservationId,
    this.imageAttachmentPath,
    this.hasPendingWrites = false,
  });

  String get formattedTime {
    final hour = timestamp.hour % 12 == 0 ? 12 : timestamp.hour % 12;
    final minute = timestamp.minute.toString().padLeft(2, '0');
    final period = timestamp.hour >= 12 ? 'PM' : 'AM';
    return '$hour:$minute $period';
  }
}
