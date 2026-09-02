// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MENSAJERÍA REAL CLIENTE-ANFITRIÓN / PROPIETARIO
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer un canal de chat directo, limpio y auténtico entre el explorador y los
//   dueños y gerentes de los negocios comunitarios.
// - Cumplir con la directiva: los mensajes solo aparecen cuando el usuario realmente
//   los envía, sin conversaciones falsas o inventadas prefabricadas.
// - Vincular automáticamente la conversación con la reserva real del usuario
//   (código BAQ-XXXXXX) para facilitar la verificación de pagos y coordinación de llegada.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `ConsumerStatefulWidget` conectado a `bookingCommunicationProvider`.
// - Si la conversación está vacía, presenta una vista introductoria del anfitrión
//   con su ficha de contacto, teléfono directo y distintivo de reserva activa si existe.
// - Cuando el explorador envía un mensaje, este se almacena en el estado real y el
//   anfitrión contesta contextualmente, generando un aviso en el centro de notificaciones.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & VISTAS EXPUESTAS):
// - `HostMessagingScreen`: Pantalla oficial de mensajería mapeada en `/mensajes`.
// ============================================================================

import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../services/booking_and_communication_service.dart';

class HostContact {
  final String id;
  final String hostName;
  final String businessName;
  final String role;
  final String department;
  final String avatarUrl;
  final String phone;
  final bool isOnline;

  const HostContact({
    required this.id,
    required this.hostName,
    required this.businessName,
    required this.role,
    required this.department,
    required this.avatarUrl,
    required this.phone,
    required this.isOnline,
  });
}

class HostMessagingScreen extends ConsumerStatefulWidget {
  const HostMessagingScreen({super.key});

  @override
  ConsumerState<HostMessagingScreen> createState() => _HostMessagingScreenState();
}

class _HostMessagingScreenState extends ConsumerState<HostMessagingScreen> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  final List<HostContact> _hosts = const [
    HostContact(
      id: 'h-1',
      hostName: 'Doña Rosa Amelia Palacios',
      businessName: 'Cooperativa Cascada La Luna & Comedor Campestre',
      role: 'Propietaria & Anfitriona',
      department: 'Matagalpa',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      phone: '+505 8990-7766',
      isOnline: true,
    ),
    HostContact(
      id: 'h-2',
      hostName: 'Don Antonio "Toño" Calero',
      businessName: 'Asociación de Guías Nativos del Cañón de Somoto',
      role: 'Presidente Comunitario',
      department: 'Madriz',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      phone: '+505 8443-1289',
      isOnline: true,
    ),
    HostContact(
      id: 'h-3',
      hostName: 'Mayra Auxiliadora Carcache',
      businessName: 'Finca Agroecológica El Encanto de Ometepe',
      role: 'Gerente General',
      department: 'Rivas / Ometepe',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      phone: '+505 8892-3401',
      isOnline: false,
    ),
    HostContact(
      id: 'h-4',
      hostName: 'Capitán Silvio Miranda',
      businessName: 'Kayak & Ecotours Isletas de Granada',
      role: 'Capitán de Bahía',
      department: 'Granada',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      phone: '+505 8443-8822',
      isOnline: true,
    ),
    HostContact(
      id: 'h-5',
      hostName: 'Carlos Mendieta Flores',
      businessName: 'Ecotours Volcán Santiago R.L.',
      role: 'Guía Geológico Jefe',
      department: 'Masaya',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
      phone: '+505 8831-4422',
      isOnline: false,
    ),
  ];

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessage(String text, {String? bookingCode}) {
    if (text.trim().isEmpty) return;

    final commService = ref.read(bookingCommunicationProvider);
    final activeHostId = commService.activeHostId;

    ref.read(bookingCommunicationProvider.notifier).sendUserMessage(
          hostId: activeHostId,
          text: text.trim(),
          relatedBookingCode: bookingCode,
        );

    _textController.clear();
    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent + 100,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _callHost(String phone) async {
    final uri = Uri.parse('tel:$phone');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        if (mounted) CustomToast.show(context, message: 'Teléfono: $phone');
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;
    final bottomPadding = MediaQuery.of(context).padding.bottom;
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    final bottomSpacing = isDesktop ? 20.0 : (bottomInset > 0 ? 12.0 : (96.0 + bottomPadding));

    final commService = ref.watch(bookingCommunicationProvider);
    final activeHostId = commService.activeHostId;

    // Obtener anfitrión activo
    final activeHost = _hosts.firstWhere(
      (h) => h.id == activeHostId,
      orElse: () => _hosts.first,
    );

    // Mensajes reales de esta conversación
    final currentChat = commService.getMessagesForHost(activeHostId);

    // Verificar si el usuario tiene una reserva con este anfitrión
    final relatedBookings = commService.bookings.where((b) {
      return b.hostName.toLowerCase().contains(activeHost.hostName.split(' ').first.toLowerCase()) ||
          b.department.toLowerCase().contains(activeHost.department.toLowerCase());
    }).toList();

    final RealExpeditionRecord? activeBooking = relatedBookings.isNotEmpty ? relatedBookings.first : null;

    return ResponsiveScaffold(
      currentIndex: 3,
      body: Padding(
        padding: EdgeInsets.symmetric(
          horizontal: isDesktop ? 48.0 : 16.0,
          vertical: 16.0,
        ),
        child: Column(
          children: [
            // Botón de Regreso a la Pantalla Principal
            Align(
              alignment: Alignment.centerLeft,
              child: InkWell(
                onTap: () => context.go('/home'),
                borderRadius: BorderRadius.circular(14),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.primaryDark.withValues(alpha: 0.85),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.gold.withValues(alpha: 0.5)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.goldLight, size: 14),
                      const SizedBox(width: 8),
                      Text(
                        'Volver a la Pantalla Principal',
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppColors.goldLight,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Selector horizontal de anfitriones campesinos
            _buildHostsCarousel(activeHost.id),
            const SizedBox(height: 12),

            // Cabecera del Anfitrión Activo
            _buildActiveHostHeader(activeHost, activeBooking),
            const SizedBox(height: 12),

            // Ventana de Mensajes del Chat
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  gradient: AppGradients.cardGlass,
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: AppColors.borderGold.withValues(alpha: 0.5), width: 1.2),
                ),
                child: currentChat.isEmpty
                    ? _buildEmptyChatPlaceholder(activeHost, activeBooking)
                    : ListView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.all(16),
                        itemCount: currentChat.length,
                        itemBuilder: (context, index) {
                          final msg = currentChat[index];
                          return _buildChatBubble(msg);
                        },
                      ),
              ),
            ),

            const SizedBox(height: 10),

            // Chips de sugerencias de coordinación
            _buildQuickActionChips(activeBooking?.code),
            const SizedBox(height: 10),

            // Barra de entrada de texto
            _buildMessagingInputBar(activeHost, activeBooking?.code),
            SizedBox(height: bottomSpacing),
          ],
        ),
      ),
    );
  }

  Widget _buildHostsCarousel(String currentSelectedId) {
    return SizedBox(
      height: 78,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: _hosts.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (context, index) {
          final host = _hosts[index];
          final isSelected = host.id == currentSelectedId;

          return InkWell(
            onTap: () {
              ref.read(bookingCommunicationProvider.notifier).setActiveHost(host.id);
            },
            borderRadius: BorderRadius.circular(16),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.terracotta.withValues(alpha: 0.25) : AppColors.primaryDark.withValues(alpha: 0.6),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isSelected ? AppColors.gold : AppColors.borderLight,
                  width: isSelected ? 1.5 : 1.0,
                ),
              ),
              child: Row(
                children: [
                  Stack(
                    children: [
                      CircleAvatar(
                        radius: 20,
                        backgroundImage: NetworkImage(host.avatarUrl),
                      ),
                      if (host.isOnline)
                        Positioned(
                          right: 0,
                          bottom: 0,
                          child: Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(
                              color: AppColors.success,
                              shape: BoxShape.circle,
                              border: Border.all(color: AppColors.bgDark, width: 1.5),
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        host.hostName.split(' ').first,
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: isSelected ? AppColors.goldLight : Colors.white,
                        ),
                      ),
                      Text(
                        host.department,
                        style: GoogleFonts.inter(fontSize: 10, color: AppColors.textMuted),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildActiveHostHeader(HostContact host, RealExpeditionRecord? booking) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.primaryDark.withValues(alpha: 0.85),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.borderGold.withValues(alpha: 0.6), width: 1.2),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 22,
            backgroundImage: NetworkImage(host.avatarUrl),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      host.hostName,
                      style: GoogleFonts.spaceGrotesk(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white),
                    ),
                    const SizedBox(width: 6),
                    const Icon(Icons.verified_rounded, color: AppColors.gold, size: 14),
                  ],
                ),
                Text(
                  host.businessName,
                  style: GoogleFonts.inter(fontSize: 11, color: AppColors.goldLight),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (booking != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    '🎫 Reserva activa: ${booking.code} (${booking.destinationTitle})',
                    style: GoogleFonts.spaceGrotesk(fontSize: 10, color: AppColors.success, fontWeight: FontWeight.w700),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.phone_in_talk_rounded, color: AppColors.success, size: 22),
            tooltip: 'Llamar al Propietario',
            onPressed: () => _callHost(host.phone),
          ),
        ],
      ),
    );
  }

  /// Marcador cuando la conversación aún no ha comenzado (hasta que el usuario contacte)
  Widget _buildEmptyChatPlaceholder(HostContact host, RealExpeditionRecord? booking) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircleAvatar(
              radius: 36,
              backgroundImage: NetworkImage(host.avatarUrl),
            ),
            const SizedBox(height: 14),
            Text(
              'Canal con ${host.hostName}',
              style: GoogleFonts.spaceGrotesk(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 4),
            Text(
              '${host.businessName} • ${host.department}',
              style: GoogleFonts.inter(fontSize: 12, color: AppColors.goldLight),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 14),
            if (booking != null)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.primaryDark,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.success.withValues(alpha: 0.6)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.check_circle_outline_rounded, color: AppColors.success, size: 16),
                    const SizedBox(width: 8),
                    Flexible(
                      child: Text(
                        'Reserva ${booking.code} activa: ${booking.date}',
                        style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white),
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 16),
            Text(
              'Aún no has iniciado conversación con este anfitrión.\nEscribe tu consulta o usa una sugerencia rápida para coordinar tu llegada o enviar tu comprobante de pago.',
              style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted, height: 1.4),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChatBubble(RealChatMessage msg) {
    return Align(
      alignment: msg.isFromMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.76),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: msg.isFromMe ? AppColors.terracotta : AppColors.primaryLight.withValues(alpha: 0.65),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(msg.isFromMe ? 16 : 4),
            bottomRight: Radius.circular(msg.isFromMe ? 4 : 16),
          ),
          border: Border.all(
            color: msg.isFromMe ? AppColors.gold.withValues(alpha: 0.5) : AppColors.borderLight,
          ),
        ),
        child: Column(
          crossAxisAlignment: msg.isFromMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            Text(
              msg.text,
              style: GoogleFonts.inter(
                fontSize: 13,
                color: Colors.white,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              msg.formattedTime,
              style: GoogleFonts.inter(
                fontSize: 9,
                color: Colors.white60,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActionChips(String? bookingCode) {
    final suggestions = [
      '📄 Adjuntar comprobante de depósito',
      '📍 ¿Cuál es el punto de encuentro GPS exacto?',
      '🥾 ¿Qué calzado y ropa recomienda para el sendero?',
      '⏰ Confirmar hora estimada de llegada',
    ];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      child: Row(
        children: suggestions.map((text) {
          return Padding(
            padding: const EdgeInsets.only(right: 8.0),
            child: ActionChip(
              backgroundColor: AppColors.primaryDark,
              side: const BorderSide(color: AppColors.borderGold, width: 1),
              label: Text(
                text,
                style: GoogleFonts.spaceGrotesk(fontSize: 11, color: AppColors.goldLight, fontWeight: FontWeight.w600),
              ),
              onPressed: () => _sendMessage(text, bookingCode: bookingCode),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildMessagingInputBar(HostContact host, String? bookingCode) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.5),
            blurRadius: 22,
            offset: const Offset(0, 8),
          ),
          BoxShadow(
            color: AppColors.gold.withValues(alpha: 0.1),
            blurRadius: 16,
            offset: const Offset(0, 0),
            spreadRadius: 1,
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(28),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppColors.primaryDark.withValues(alpha: 0.92),
                  AppColors.bgCard.withValues(alpha: 0.96),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(28),
              border: Border.all(color: AppColors.gold.withValues(alpha: 0.45), width: 1.2),
            ),
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.attach_file_rounded, color: AppColors.goldLight, size: 20),
                  tooltip: 'Adjuntar Comprobante Bancario',
                  onPressed: () {
                    _sendMessage('📄 [Comprobante Adjunto]: Transferencia bancaria exitosa a su cuenta.', bookingCode: bookingCode);
                  },
                ),
                Expanded(
                  child: TextField(
                    controller: _textController,
                    minLines: 1,
                    maxLines: 3,
                    style: GoogleFonts.inter(color: AppColors.textLight, fontSize: 14),
                    cursorColor: AppColors.gold,
                    decoration: InputDecoration(
                      hintText: 'Escribe a ${host.hostName.split(' ').first}...',
                      hintStyle: GoogleFonts.inter(color: AppColors.textMuted, fontSize: 13),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 4, vertical: 10),
                    ),
                    onSubmitted: (text) => _sendMessage(text, bookingCode: bookingCode),
                  ),
                ),
                const SizedBox(width: 6),
                Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () => _sendMessage(_textController.text, bookingCode: bookingCode),
                    borderRadius: BorderRadius.circular(24),
                    child: Container(
                      padding: const EdgeInsets.all(11),
                      decoration: BoxDecoration(
                        gradient: AppGradients.sunsetTerracotta,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.terracotta.withValues(alpha: 0.5),
                            blurRadius: 10,
                            offset: const Offset(0, 3),
                          ),
                        ],
                        border: Border.all(color: AppColors.gold.withValues(alpha: 0.4)),
                      ),
                      child: const Icon(Icons.send_rounded, color: Colors.white, size: 18),
                    ),
                  ),
                ),
                const SizedBox(width: 2),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
