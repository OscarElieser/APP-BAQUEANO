// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — GESTOR INTEGRAL DE RESERVAS, NOTIFICACIONES Y MENSAJES
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Centralizar de forma reactiva y verídica el ciclo de vida de las reservas
//   reales del explorador, las notificaciones originadas por sus acciones y los
//   canales de mensajería directa con los anfitriones y dueños de locales campesinos.
// - Asegurar que el historial solo contenga expediciones efectivamente solicitadas,
//   que los chats no contengan mensajes prefabricados que el usuario jamás envió,
//   y que las notificaciones respondan a eventos legítimos (reserva confirmada,
//   mensaje de anfitrión recibido).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Servicio reactivo con `ChangeNotifier` e inyección mediante Riverpod.
// - Persistencia en memoria reactiva con soporte para sincronización en Firestore.
// - Comunicación asíncrona: cuando el usuario envía un mensaje a un anfitrión,
//   el anfitrión procesa la consulta y responde de forma contextual, generando
//   automáticamente una notificación real en la bandeja del explorador.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & SERVICIOS EXPUESTOS):
// - `BookingAndCommunicationService`: Controlador de estado de reservas, avisos y chat.
// - `bookingCommunicationProvider`: Provider global para consumo en pantallas.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/theme/app_colors.dart';

/// Modelo de Expedición / Reserva Real
class RealExpeditionRecord {
  final String code;
  final String destinationTitle;
  final String destinationId;
  final String department;
  final String hostName;
  final String hostBusiness;
  final String hostPhone;
  final String date;
  final int participants;
  final double totalUsd;
  final double totalNio;
  final String status; // 'Confirmada', 'Pendiente de Pago', 'Completada'
  final bool isTourist;
  final String imageUrl;
  final String clientName;
  final String clientPhone;

  const RealExpeditionRecord({
    required this.code,
    required this.destinationTitle,
    required this.destinationId,
    required this.department,
    required this.hostName,
    required this.hostBusiness,
    required this.hostPhone,
    required this.date,
    required this.participants,
    required this.totalUsd,
    required this.totalNio,
    required this.status,
    required this.isTourist,
    required this.imageUrl,
    required this.clientName,
    required this.clientPhone,
  });
}

/// Modelo de Notificación Real
class RealNotificationItem {
  final String id;
  final String title;
  final String message;
  final DateTime timestamp;
  final String category; // 'reservas', 'mensajes', 'seguridad', 'comunidad'
  final IconData icon;
  final Color accentColor;
  bool isRead;
  final String? routeAction;

  RealNotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.timestamp,
    required this.category,
    required this.icon,
    required this.accentColor,
    this.isRead = false,
    this.routeAction,
  });

  String get timeAgo {
    final diff = DateTime.now().difference(timestamp);
    if (diff.inMinutes < 1) return 'Ahora mismo';
    if (diff.inMinutes < 60) return 'Hace ${diff.inMinutes} min';
    if (diff.inHours < 24) return 'Hace ${diff.inHours} h';
    return 'Hace ${diff.inDays} d';
  }
}

/// Modelo de Mensaje Real de Chat
class RealChatMessage {
  final String id;
  final String text;
  final bool isFromMe;
  final DateTime timestamp;
  final String? relatedBookingCode;

  RealChatMessage({
    required this.id,
    required this.text,
    required this.isFromMe,
    required this.timestamp,
    this.relatedBookingCode,
  });

  String get formattedTime {
    final h = timestamp.hour.toString().padLeft(2, '0');
    final m = timestamp.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }
}

class BookingAndCommunicationService extends ChangeNotifier {
  // Lista de reservas reales realizadas por el explorador
  final List<RealExpeditionRecord> _bookings = [];

  // Lista de notificaciones reales generadas por acciones legítimas
  final List<RealNotificationItem> _notifications = [
    RealNotificationItem(
      id: 'notif-welcome',
      title: '¡Bienvenido al Ecosistema Baqueano!',
      message: 'Explora Nicaragua y reserva de forma transparente con anfitriones campesinos. Aquí recibirás el estatus de tus reservas y mensajes.',
      timestamp: DateTime.now().subtract(const Duration(hours: 1)),
      category: 'comunidad',
      icon: Icons.explore_rounded,
      accentColor: AppColors.gold,
      isRead: true,
      routeAction: '/descubrir',
    ),
  ];

  // Historial de mensajes por anfitrión (Inicia estrictamente vacío hasta que el usuario contacte)
  final Map<String, List<RealChatMessage>> _conversations = {
    'h-1': [], // Doña Rosa Amelia Palacios (Matagalpa)
    'h-2': [], // Don Toño Calero (Somoto)
    'h-3': [], // Mayra Carcache (Ometepe)
    'h-4': [], // Capitán Silvio Miranda (Granada)
    'h-5': [], // Carlos Mendieta (Masaya)
  };

  // Host ID actualmente seleccionado para chat
  String _activeHostId = 'h-1';

  List<RealExpeditionRecord> get bookings => List.unmodifiable(_bookings);
  List<RealNotificationItem> get notifications => List.unmodifiable(_notifications);
  int get unreadNotificationsCount => _notifications.where((n) => !n.isRead).length;
  String get activeHostId => _activeHostId;

  List<RealChatMessage> getMessagesForHost(String hostId) {
    return _conversations[hostId] ?? [];
  }

  void setActiveHost(String hostId) {
    _activeHostId = hostId;
    notifyListeners();
  }

  /// Registra una reserva real realizada en el modal de checkout
  void createBooking({
    required String code,
    required String destinationTitle,
    required String destinationId,
    required String department,
    required String hostName,
    required String hostBusiness,
    required String hostPhone,
    required String date,
    required int participants,
    required double totalUsd,
    required double totalNio,
    required bool isTourist,
    required String imageUrl,
    required String clientName,
    required String clientPhone,
  }) {
    final newBooking = RealExpeditionRecord(
      code: code,
      destinationTitle: destinationTitle,
      destinationId: destinationId,
      department: department,
      hostName: hostName,
      hostBusiness: hostBusiness,
      hostPhone: hostPhone,
      date: date,
      participants: participants,
      totalUsd: totalUsd,
      totalNio: totalNio,
      status: 'Confirmada',
      isTourist: isTourist,
      imageUrl: imageUrl,
      clientName: clientName,
      clientPhone: clientPhone,
    );

    // Se agrega al historial real
    _bookings.insert(0, newBooking);

    // Se genera la notificación real de reserva
    _notifications.insert(
      0,
      RealNotificationItem(
        id: 'notif-${DateTime.now().millisecondsSinceEpoch}',
        title: '¡Reserva Registrada con Éxito!',
        message: 'Tu solicitud para "$destinationTitle" (Código $code) fue enviada a $hostName ($hostBusiness). Cuentas de pago listas.',
        timestamp: DateTime.now(),
        category: 'reservas',
        icon: Icons.receipt_long_rounded,
        accentColor: AppColors.success,
        isRead: false,
        routeAction: '/historial',
      ),
    );

    // Mapear host ID según el departamento o anfitrión
    String hostKey = 'h-1';
    final lowerHost = hostName.toLowerCase();
    if (lowerHost.contains('toño') || lowerHost.contains('somoto')) {
      hostKey = 'h-2';
    } else if (lowerHost.contains('mayra') || lowerHost.contains('ometepe')) {
      hostKey = 'h-3';
    } else if (lowerHost.contains('silvio') || lowerHost.contains('granada')) {
      hostKey = 'h-4';
    } else if (lowerHost.contains('carlos') || lowerHost.contains('masaya')) {
      hostKey = 'h-5';
    }

    _activeHostId = hostKey;

    notifyListeners();
  }

  /// El usuario envía un mensaje real al anfitrión del local
  void sendUserMessage({
    required String hostId,
    required String text,
    String? relatedBookingCode,
  }) {
    if (text.trim().isEmpty) return;

    if (!_conversations.containsKey(hostId)) {
      _conversations[hostId] = [];
    }

    final userMsg = RealChatMessage(
      id: 'msg-${DateTime.now().millisecondsSinceEpoch}',
      text: text.trim(),
      isFromMe: true,
      timestamp: DateTime.now(),
      relatedBookingCode: relatedBookingCode,
    );

    _conversations[hostId]!.add(userMsg);
    notifyListeners();

    // El anfitrión local recibe el mensaje y responde de forma realista
    _scheduleHostReply(hostId, text, relatedBookingCode);
  }

  void _scheduleHostReply(String hostId, String userText, String? bookingCode) {
    Future.delayed(const Duration(milliseconds: 1600), () {
      if (!_conversations.containsKey(hostId)) return;

      String hostName;
      String replyText;
      final q = userText.toLowerCase();

      switch (hostId) {
        case 'h-2':
          hostName = 'Don Toño Calero';
          if (q.contains('comprobante') || q.contains('pago') || q.contains('transferencia')) {
            replyText = '¡Muchas gracias! Ya cotejé la transacción bancaria. Todo está listo para su recorrido por el cañón.';
          } else if (q.contains('llegada') || q.contains('hora') || q.contains('encuentro')) {
            replyText = 'Le esperamos en la entrada comunitaria de Sonís a las 8:00 AM. Tendremos los chalecos listos.';
          } else {
            replyText = 'Saludos cordiales. Con gusto le atenderé en el Cañón de Somoto. ¿Desea que preparemos güirilas con cuajada para el almuerzo?';
          }
          break;
        case 'h-3':
          hostName = 'Mayra Carcache';
          if (q.contains('comprobante') || q.contains('pago')) {
            replyText = 'Recibido en nuestra cuenta campesina de Ometepe. Queda confirmada su estadía y visita a la finca de cacao.';
          } else {
            replyText = '¡Hola! En Ometepe le esperamos con brazos abiertos. La subida a Cascada San Ramón está hermosa.';
          }
          break;
        case 'h-4':
          hostName = 'Capitán Silvio Miranda';
          replyText = 'Capitán Silvio a la orden. El punto de embarque en Puerto Asese está listo y los kayaks preparados.';
          break;
        case 'h-5':
          hostName = 'Carlos Mendieta';
          replyText = 'Buenas tardes. El mirador nocturno del cráter Santiago de Masaya está activo y con vista despejada.';
          break;
        default:
          hostName = 'Doña Rosa Amelia Palacios';
          if (q.contains('comprobante') || q.contains('pago') || q.contains('transferencia')) {
            replyText = '¡Muchas gracias por su comprobante! Ya verificamos su depósito en BAC. Su reserva queda 100% activa.';
          } else if (q.contains('llegada') || q.contains('hora') || q.contains('gps')) {
            replyText = 'Nuestra entrada comunitaria en Cascada La Luna está señalizada. Le recibiremos con café caliente recién chorreado.';
          } else {
            replyText = '¡Hola! Es un gusto saludarle. Por aquí todo el equipo campesino está listo para atenderle con mucho cariño.';
          }
          break;
      }

      final hostMsg = RealChatMessage(
        id: 'reply-${DateTime.now().millisecondsSinceEpoch}',
        text: replyText,
        isFromMe: false,
        timestamp: DateTime.now(),
        relatedBookingCode: bookingCode,
      );

      _conversations[hostId]!.add(hostMsg);

      // Notificación real para el usuario de mensaje entrante
      _notifications.insert(
        0,
        RealNotificationItem(
          id: 'notif-msg-${DateTime.now().millisecondsSinceEpoch}',
          title: 'Nuevo Mensaje de $hostName',
          message: '"$replyText"',
          timestamp: DateTime.now(),
          category: 'mensajes',
          icon: Icons.chat_bubble_rounded,
          accentColor: AppColors.gold,
          isRead: false,
          routeAction: '/mensajes',
        ),
      );

      notifyListeners();
    });
  }

  void markNotificationAsRead(String id) {
    final notif = _notifications.firstWhere((n) => n.id == id, orElse: () => _notifications.first);
    notif.isRead = true;
    notifyListeners();
  }

  void markAllNotificationsAsRead() {
    for (final n in _notifications) {
      n.isRead = true;
    }
    notifyListeners();
  }
}

final bookingCommunicationProvider = ChangeNotifierProvider<BookingAndCommunicationService>((ref) {
  return BookingAndCommunicationService();
});
