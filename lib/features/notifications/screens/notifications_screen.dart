// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CENTRO DE NOTIFICACIONES EN TIEMPO REAL
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer un centro de notificaciones reactivo y legítimo, donde cada aviso
//   corresponda exclusivamente a eventos reales del explorador: confirmación de
//   reservas, mensajes enviados o recibidos de anfitriones y alertas de seguridad.
// - Eliminar notificaciones artificiales o fijas que no correspondan a la interacción
//   efectuada por el usuario.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `ConsumerStatefulWidget` conectado a `bookingCommunicationProvider`.
// - Pestañas de filtrado por categoría temática (Todas, Reservas & Pagos, Mensajes, Comunidad).
// - Marcado individual y masivo de estado de lectura con persistencia reactiva.
// - Botón de regreso a la pantalla principal (`/home`) en el encabezado.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & VISTAS EXPUESTAS):
// - `NotificationsScreen`: Pantalla oficial de notificaciones mapeada en `/notificaciones`.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';
import '../../../services/booking_and_communication_service.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  String _selectedCategory = 'Todas';

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    final commService = ref.watch(bookingCommunicationProvider);
    final allNotifications = commService.notifications;
    final unreadCount = commService.unreadNotificationsCount;

    final filtered = allNotifications.where((n) {
      if (_selectedCategory == 'Todas') return true;
      return n.category == _selectedCategory;
    }).toList();

    return ResponsiveScaffold(
      currentIndex: 4,
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: EdgeInsets.symmetric(
          horizontal: isDesktop ? 48.0 : 20.0,
          vertical: 20.0,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Botón de Regreso a la Pantalla Principal
            InkWell(
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
            const SizedBox(height: 14),

            Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SectionHeader(
                  tag: 'ALERTAS & COMUNICACIÓN EN VIVO',
                  title: '🔔 Centro de Notificaciones',
                  subtitle: 'Monitorea el estado real de tus expediciones, pagos y mensajes con anfitriones.',
                  isCentered: true,
                ),
                if (unreadCount > 0) ...[
                  const SizedBox(height: 6),
                  Center(
                    child: TextButton.icon(
                      style: TextButton.styleFrom(
                        foregroundColor: AppColors.goldLight,
                        backgroundColor: AppColors.primaryDark,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                          side: const BorderSide(color: AppColors.borderGold),
                        ),
                      ),
                      icon: const Icon(Icons.done_all_rounded, size: 16),
                      label: Text('Marcar todas leídas ($unreadCount)',
                          style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w700)),
                      onPressed: () {
                        ref.read(bookingCommunicationProvider.notifier).markAllNotificationsAsRead();
                        CustomToast.success(context, 'Notificaciones marcadas como leídas');
                      },
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 16),

            // Pestañas de Filtrado
            Center(
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    {'id': 'Todas', 'label': 'Todas ($unreadCount no leídas)'},
                    {'id': 'reservas', 'label': '💳 Reservas & Pagos'},
                    {'id': 'mensajes', 'label': '💬 Mensajes'},
                    {'id': 'seguridad', 'label': '⚠️ Seguridad & Clima'},
                    {'id': 'comunidad', 'label': '🌿 Comunidad Baqueano'},
                  ].map((cat) {
                    final isSelected = _selectedCategory == cat['id'];
                    return Padding(
                      padding: const EdgeInsets.only(right: 8.0),
                      child: InkWell(
                        onTap: () => setState(() => _selectedCategory = cat['id']!),
                        borderRadius: BorderRadius.circular(20),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSelected ? AppColors.terracotta : AppColors.primaryDark,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: isSelected ? AppColors.gold : AppColors.borderLight,
                            ),
                          ),
                          child: Text(
                            cat['label']!,
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 12,
                              fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                              color: isSelected ? Colors.white : AppColors.textMuted,
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),

            const SizedBox(height: 20),

            if (filtered.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(32),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppColors.bgCard,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.notifications_off_outlined, color: AppColors.gold, size: 48),
                    const SizedBox(height: 12),
                    Text(
                      'No tienes notificaciones en esta categoría',
                      style: GoogleFonts.spaceGrotesk(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Te notificaremos en cuanto haya cambios en tus reservas o mensajes de anfitriones.',
                      style: GoogleFonts.inter(fontSize: 13, color: AppColors.textMuted),
                    ),
                  ],
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: filtered.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final notif = filtered[index];
                  return _buildNotificationCard(notif);
                },
              ),

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationCard(RealNotificationItem notif) {
    return InkWell(
      onTap: () {
        ref.read(bookingCommunicationProvider.notifier).markNotificationAsRead(notif.id);
        if (notif.routeAction != null) {
          context.go(notif.routeAction!);
        }
      },
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: notif.isRead ? AppColors.bgCard.withValues(alpha: 0.6) : AppColors.primaryDark.withValues(alpha: 0.85),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: notif.isRead ? AppColors.borderLight : notif.accentColor.withValues(alpha: 0.5),
            width: notif.isRead ? 1.0 : 1.4,
          ),
          boxShadow: [
            if (!notif.isRead)
              BoxShadow(
                color: notif.accentColor.withValues(alpha: 0.15),
                blurRadius: 14,
                offset: const Offset(0, 4),
              ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: notif.accentColor.withValues(alpha: 0.15),
                shape: BoxShape.circle,
                border: Border.all(color: notif.accentColor.withValues(alpha: 0.5), width: 1.2),
              ),
              child: Icon(notif.icon, color: notif.accentColor, size: 20),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          notif.title,
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 14,
                            fontWeight: notif.isRead ? FontWeight.w600 : FontWeight.w800,
                            color: notif.isRead ? Colors.white70 : Colors.white,
                          ),
                        ),
                      ),
                      Text(
                        notif.timeAgo,
                        style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    notif.message,
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: notif.isRead ? AppColors.textMuted : Colors.white.withValues(alpha: 0.85),
                      height: 1.4,
                    ),
                  ),
                  if (notif.routeAction != null) ...[
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Text(
                          'Toca para ver detalles',
                          style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w700, color: notif.accentColor),
                        ),
                        const SizedBox(width: 4),
                        Icon(Icons.arrow_forward_rounded, color: notif.accentColor, size: 12),
                      ],
                    ),
                  ],
                ],
              ),
            ),
            if (!notif.isRead) ...[
              const SizedBox(width: 8),
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: notif.accentColor,
                  shape: BoxShape.circle,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
