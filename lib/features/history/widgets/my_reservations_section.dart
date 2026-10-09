// ============================================================================
// 📅 BAQUEANO — MI VIAJE: SOLICITUDES DE RESERVA REALES
// ============================================================================
//
// 🎯 POR QUÉ (Propósito):
// - Que el viajero vea sus solicitudes guardadas en el servidor (no en la
//   memoria del teléfono), su estado real y cómo seguir coordinando con el
//   negocio por WhatsApp o llamada. Sin pagos en línea ni precios inventados.
//
// ⚙️ CÓMO (Arquitectura):
// - `myReservationsProvider` → Edge Function `baqueano-reservas` (`mine`).
// - Estados del servidor: pending / confirmed / rejected / cancelled /
//   completed. Cancelar solo si está pendiente o confirmada.
// - Estados honestos: sin sesión, cargando, error con reintento o vacío.
//
// 📦 QUÉ (Entregables):
// - `MyReservationsSection`.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/baqueano_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../data/repositories/reservation_repository.dart';

class MyReservationsSection extends ConsumerWidget {
  const MyReservationsSection({super.key});

  static const Map<String, Color> _statusColors = {
    'pending': Color(0xFFF65E01),
    'confirmed': Color(0xFF4A7A5A),
    'completed': Color(0xFF165D6F),
    'rejected': Color(0xFF94A3B8),
    'cancelled': Color(0xFF94A3B8),
  };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reservations = ref.watch(myReservationsProvider);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                'MIS SOLICITUDES DE RESERVA',
                style: BaqueanoFonts.text(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.goldLight, letterSpacing: 1.1),
              ),
            ),
            IconButton(
              tooltip: 'Actualizar',
              onPressed: () => ref.invalidate(myReservationsProvider),
              icon: const Icon(Icons.refresh_rounded, color: AppColors.gold, size: 20),
            ),
          ],
        ),
        Text(
          'El precio y el pago se acuerdan directamente con el negocio por WhatsApp o llamada. BAQUEANO no cobra en línea.',
          style: BaqueanoFonts.text(fontSize: 11.5, color: AppColors.textMuted, height: 1.4),
        ),
        const SizedBox(height: 10),
        reservations.when(
          loading: () => _note('Cargando tus solicitudes…'),
          error: (error, _) {
            final needsSignIn = error is ReservationException && error.needsSignIn;
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _note(needsSignIn
                    ? 'Inicia sesión para ver tus solicitudes de reserva guardadas.'
                    : 'No se pudieron cargar tus solicitudes: $error'),
                if (!needsSignIn)
                  TextButton(
                    onPressed: () => ref.invalidate(myReservationsProvider),
                    child: const Text('Reintentar', style: TextStyle(color: AppColors.gold)),
                  ),
              ],
            );
          },
          data: (items) => items.isEmpty
              ? _note('Aún no tienes solicitudes. Desde un destino o negocio verificado toca "Reservar" o "Solicitar reserva".')
              : Column(
                  children: items
                      .map((item) => _ReservationCard(
                            key: ValueKey('reservation_${item.id}'),
                            reservation: item,
                            color: _statusColors[item.status] ?? AppColors.gold,
                          ))
                      .toList(),
                ),
        ),
      ],
    );
  }

  static Widget _note(String text) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Text(text, style: BaqueanoFonts.text(fontSize: 12.5, color: Colors.white70, height: 1.45)),
      );
}

class _ReservationCard extends ConsumerWidget {
  final ReservationRequest reservation;
  final Color color;

  const _ReservationCard({super.key, required this.reservation, required this.color});

  Future<void> _whatsapp(BuildContext context) async {
    final digits = ReservationRepository.whatsappDigits(reservation.businessWhatsapp);
    if (digits.isEmpty) {
      CustomToast.error(context, 'Este negocio no tiene WhatsApp registrado.');
      return;
    }
    final message = ReservationRepository.buildWhatsAppMessage(
      businessName: reservation.businessName.isEmpty ? 'equipo' : reservation.businessName,
      travelDate: reservation.travelDate ?? DateTime.now(),
      people: reservation.peopleCount,
      code: reservation.code,
      destinationName: reservation.destinationName,
    );
    try {
      await launchUrl(
        Uri.parse('https://wa.me/$digits?text=${Uri.encodeComponent(message)}'),
        mode: LaunchMode.externalApplication,
      );
    } catch (_) {
      if (context.mounted) CustomToast.error(context, 'No se pudo abrir WhatsApp.');
    }
  }

  Future<void> _cancel(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('¿Cancelar solicitud?'),
        content: Text('Se marcará ${reservation.code} como cancelada. Avísale también al negocio.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('No')),
          TextButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('Sí, cancelar')),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await ref.read(reservationRepositoryProvider).cancel(reservation.id);
      ref.invalidate(myReservationsProvider);
      if (context.mounted) CustomToast.success(context, 'Solicitud ${reservation.code} cancelada.');
    } catch (error) {
      if (context.mounted) CustomToast.error(context, error.toString());
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final date = reservation.travelDate == null ? '' : ReservationRepository.formatDate(reservation.travelDate!);
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.bgDark,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.7)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  reservation.businessName.isEmpty ? reservation.serviceTitle : reservation.businessName,
                  style: BaqueanoFonts.text(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white),
                ),
              ),
              Text(reservation.code, style: BaqueanoFonts.text(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.gold)),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            [if (reservation.destinationName.isNotEmpty) reservation.destinationName, if (date.isNotEmpty) date, '${reservation.peopleCount} persona${reservation.peopleCount == 1 ? '' : 's'}']
                .join(' · '),
            style: BaqueanoFonts.text(fontSize: 11.5, color: AppColors.goldLight),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(color: color.withValues(alpha: 0.18), borderRadius: BorderRadius.circular(999)),
            child: Text(reservation.statusLabel, style: BaqueanoFonts.text(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white)),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: [
              if (reservation.businessWhatsapp.isNotEmpty)
                TextButton.icon(
                  onPressed: () => _whatsapp(context),
                  icon: const Icon(Icons.chat_rounded, size: 16, color: Color(0xFF25D366)),
                  label: const Text('WhatsApp', style: TextStyle(color: Colors.white)),
                ),
              if (reservation.businessPhone.isNotEmpty)
                TextButton.icon(
                  onPressed: () => launchUrl(Uri.parse('tel:${reservation.businessPhone.replaceAll(RegExp(r'[^0-9+]'), '')}')),
                  icon: const Icon(Icons.phone_rounded, size: 16, color: AppColors.gold),
                  label: const Text('Llamar', style: TextStyle(color: Colors.white)),
                ),
              if (reservation.canCancel)
                TextButton.icon(
                  onPressed: () => _cancel(context, ref),
                  icon: const Icon(Icons.cancel_outlined, size: 16, color: Colors.white54),
                  label: const Text('Cancelar', style: TextStyle(color: Colors.white70)),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
