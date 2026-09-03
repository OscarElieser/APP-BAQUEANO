// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — HISTORIAL REAL DE EXPEDICIONES & RESERVAS
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Mostrar el historial 100% verídico de expediciones y reservas confirmadas por
//   el explorador, sin datos ficticios o estáticos prefabricados.
// - Conectar cada reserva real con su comprobante oficial, código único BAQ-XXXXXX,
//   pase QR y enlace directo para chatear con el anfitrión campesino responsable.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `ConsumerStatefulWidget` reactivo conectado a `bookingCommunicationProvider`.
// - Estado vacío elegante cuando el explorador aún no ha realizado reservas, con
//   acceso directo al mapa para reservar su primera expedición.
// - Filtrado por estado de pago (Todas, Confirmada, Pendiente, Completada) y
//   botón destacado de "Volver a la Pantalla Principal".
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & VISTAS EXPUESTAS):
// - `ExpeditionHistoryScreen`: Pantalla oficial de historial mapeada en `/historial`.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';
import '../../../services/booking_and_communication_service.dart';
import '../../checkout/widgets/baqueano_voucher_dialog.dart';

class ExpeditionHistoryScreen extends ConsumerStatefulWidget {
  const ExpeditionHistoryScreen({super.key});

  @override
  ConsumerState<ExpeditionHistoryScreen> createState() => _ExpeditionHistoryScreenState();
}

class _ExpeditionHistoryScreenState extends ConsumerState<ExpeditionHistoryScreen> {
  String _selectedFilter = 'Todas';

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    final bookingService = ref.watch(bookingCommunicationProvider);
    final allBookings = bookingService.bookings;

    final filtered = allBookings.where((exp) {
      if (_selectedFilter == 'Todas') return true;
      return exp.status == _selectedFilter;
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

            const SectionHeader(
              tag: 'BITÁCORA DE VIAJES & PAGOS DIRECTOS',
              title: '📜 Historial de Expediciones',
              subtitle: 'Consulta tus expediciones reservadas en tiempo real, comprobantes oficiales de comercio justo y comunícate con tus anfitriones.',
            ),
            const SizedBox(height: 16),

            // Filtros de Estado
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              child: Row(
                children: ['Todas', 'Confirmada', 'Pendiente de Pago', 'Completada'].map((status) {
                  final isSelected = _selectedFilter == status;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: InkWell(
                      onTap: () => setState(() => _selectedFilter = status),
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.terracotta : AppColors.primaryDark,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected ? AppColors.gold : AppColors.borderLight,
                          ),
                        ),
                        child: Text(
                          status == 'Todas' ? 'Todas las Rutas (${allBookings.length})' : status,
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

            const SizedBox(height: 20),

            if (allBookings.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppColors.bgCard,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.borderGold.withValues(alpha: 0.4)),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.history_toggle_off_rounded, color: AppColors.gold, size: 54),
                    const SizedBox(height: 16),
                    Text(
                      'Aún no tienes expediciones reservadas',
                      style: GoogleFonts.spaceGrotesk(fontSize: 17, fontWeight: FontWeight.w800, color: Colors.white),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Cuando reserves una ruta en el mapa o catálogo, aquí aparecerán tus reservas reales, comprobantes oficiales, cuentas bancarias y pase QR.',
                      style: GoogleFonts.inter(fontSize: 13, color: AppColors.textMuted, height: 1.4),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 22),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.terracotta,
                        padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 13),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      icon: const Icon(Icons.map_rounded, color: Colors.white, size: 18),
                      label: Text(
                        'Explorar Mapa de Nicaragua',
                        style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13),
                      ),
                      onPressed: () => context.go('/mapa'),
                    ),
                  ],
                ),
              )
            else if (filtered.isEmpty)
              Container(
                padding: const EdgeInsets.all(32),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppColors.bgCard,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.filter_list_off_rounded, color: AppColors.gold, size: 40),
                    const SizedBox(height: 12),
                    Text(
                      'No hay expediciones con el filtro "$_selectedFilter"',
                      style: GoogleFonts.spaceGrotesk(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white),
                    ),
                  ],
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: filtered.length,
                separatorBuilder: (_, __) => const SizedBox(height: 16),
                itemBuilder: (context, index) => _buildExpeditionCard(filtered[index]),
              ),

            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }

  Widget _buildExpeditionCard(RealExpeditionRecord exp) {
    Color statusColor;
    IconData statusIcon;

    switch (exp.status) {
      case 'Confirmada':
        statusColor = AppColors.success;
        statusIcon = Icons.check_circle_rounded;
        break;
      case 'Pendiente de Pago':
        statusColor = const Color(0xFFF59E0B);
        statusIcon = Icons.hourglass_top_rounded;
        break;
      default:
        statusColor = AppColors.gold;
        statusIcon = Icons.task_alt_rounded;
        break;
    }

    return Container(
      decoration: BoxDecoration(
        gradient: AppGradients.cardGlass,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.borderGold.withValues(alpha: 0.6), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.35),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Cabecera de la Reserva
            Wrap(
              alignment: WrapAlignment.spaceBetween,
              crossAxisAlignment: WrapCrossAlignment.center,
              spacing: 8,
              runSpacing: 6,
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primaryDark,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.gold.withValues(alpha: 0.4)),
                      ),
                      child: Text(
                        exp.code,
                        style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.goldLight),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      exp.date,
                      style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: statusColor),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(statusIcon, color: statusColor, size: 14),
                      const SizedBox(width: 4),
                      Text(
                        exp.status.toUpperCase(),
                        style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.w800, color: statusColor),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 14),

            // Cuerpo del Registro
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.network(
                    exp.imageUrl,
                    width: 76,
                    height: 76,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      width: 76,
                      height: 76,
                      color: AppColors.primaryDark,
                      child: const Icon(Icons.landscape, color: AppColors.gold),
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        exp.destinationTitle,
                        style: GoogleFonts.montserrat(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 3),
                      Text(
                        '${exp.department} • ${exp.participants} explorador(es)',
                        style: GoogleFonts.inter(fontSize: 12, color: AppColors.goldLight, fontWeight: FontWeight.w500),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Anfitrión: ${exp.hostName}',
                        style: GoogleFonts.inter(fontSize: 11, color: Colors.white70),
                      ),
                      Text(
                        exp.hostBusiness,
                        style: GoogleFonts.inter(fontSize: 10, color: AppColors.textMuted),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 14),
            const Divider(color: AppColors.borderLight, height: 1),
            const SizedBox(height: 12),

            // Importe Total y Acciones
            Wrap(
              alignment: WrapAlignment.spaceBetween,
              crossAxisAlignment: WrapCrossAlignment.center,
              spacing: 12,
              runSpacing: 10,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'TOTAL A PAGAR',
                      style: GoogleFonts.spaceGrotesk(fontSize: 9, fontWeight: FontWeight.w700, color: AppColors.textMuted),
                    ),
                    // Texto de precio dual: Flexible + ellipsis evita right overflow
                    Text(
                      '\$${exp.totalUsd.toStringAsFixed(2)} USD / C\$ ${exp.totalNio.toStringAsFixed(2)} NIO',
                      style: GoogleFonts.montserrat(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.gold),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
                Wrap(
                  spacing: 8,
                  runSpacing: 6,
                  children: [
                    // Botón Mensaje Directo con Anfitrión
                    OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.goldLight),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      ),
                      icon: const Icon(Icons.chat_bubble_outline_rounded, color: AppColors.goldLight, size: 14),
                      label: Text('Mensaje', style: GoogleFonts.spaceGrotesk(fontSize: 11, color: AppColors.goldLight, fontWeight: FontWeight.w700)),
                      onPressed: () {
                        // Conectar con el anfitrión de la reserva
                        String hostKey = 'h-1';
                        final lower = exp.hostName.toLowerCase();
                        if (lower.contains('toño') || lower.contains('somoto')) {
                          hostKey = 'h-2';
                        } else if (lower.contains('mayra') || lower.contains('ometepe')) {
                          hostKey = 'h-3';
                        } else if (lower.contains('silvio') || lower.contains('granada')) {
                          hostKey = 'h-4';
                        } else if (lower.contains('carlos') || lower.contains('masaya')) {
                          hostKey = 'h-5';
                        }
                        ref.read(bookingCommunicationProvider.notifier).setActiveHost(hostKey);
                        context.go('/mensajes');
                      },
                    ),

                    // Botón Ver Comprobante / Pase QR
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.terracotta,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                      icon: const Icon(Icons.qr_code_rounded, color: Colors.white, size: 14),
                      label: Text('Pase QR', style: GoogleFonts.spaceGrotesk(fontSize: 11, color: Colors.white, fontWeight: FontWeight.w700)),
                      onPressed: () {
                        final dest = CatalogData.destinations.firstWhere(
                          (d) => d.id == exp.destinationId,
                          orElse: () => CatalogData.destinations.first,
                        );
                        BaqueanoVoucherDialog.show(
                          context,
                          destination: dest,
                          travelersCount: exp.participants,
                          totalUsd: exp.totalUsd,
                          totalNio: exp.totalNio,
                          isTouristExempt: exp.isTourist,
                        );
                      },
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
