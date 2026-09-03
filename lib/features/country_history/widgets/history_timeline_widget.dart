// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — LÍNEA DE TIEMPO INTERACTIVA DE NICARAGUA
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Presentar la evolución histórica de Nicaragua a través de 7 grandes periodos
//   cronológicos de manera pedagógica, visual y no abrumadora.
// - Conectar cada hecho histórico y personaje con las ubicaciones reales y las
//   expediciones disponibles en el motor de BAQUEANO.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Selector interactivo de periodos (chips horizontales con iconos y años).
// - Tarjetas de eventos detallados que muestran personajes, lugares, imágenes,
//   importancia histórica y botón '📍 Conocer este lugar'.
// - Adaptabilidad: deslizamiento horizontal fluido en escritorio y apilado vertical en móvil.
//
// 📦 3. QUÉ (WHAT / WIDGET EXPUESTO):
// - `HistoryTimelineWidget`: Línea de tiempo cronológica con eventos expandibles.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/glass_container.dart';
import '../models/country_history_models.dart';

class HistoryTimelineWidget extends StatefulWidget {
  final List<HistoricalPeriod> periods;

  const HistoryTimelineWidget({super.key, required this.periods});

  @override
  State<HistoryTimelineWidget> createState() => _HistoryTimelineWidgetState();
}

class _HistoryTimelineWidgetState extends State<HistoryTimelineWidget> {
  int _selectedPeriodIndex = 0;

  HistoricalPeriod get _currentPeriod => widget.periods[_selectedPeriodIndex];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Selector Horizontal de Periodos
        SizedBox(
          height: 62,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: widget.periods.length,
            separatorBuilder: (_, __) => const SizedBox(width: 10),
            itemBuilder: (context, index) {
              final period = widget.periods[index];
              final isSelected = index == _selectedPeriodIndex;

              return InkWell(
                onTap: () {
                  HapticFeedback.selectionClick();
                  setState(() => _selectedPeriodIndex = index);
                },
                borderRadius: BorderRadius.circular(16),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.terracotta : AppColors.bgCard,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected ? AppColors.gold : AppColors.borderLight,
                      width: isSelected ? 1.5 : 0.8,
                    ),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: AppColors.terracotta.withValues(alpha: 0.4),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
                            ),
                          ]
                        : null,
                  ),
                  child: Row(
                    children: [
                      Text(period.icon, style: const TextStyle(fontSize: 18)),
                      const SizedBox(width: 8),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            period.title,
                            style: GoogleFonts.montserrat(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: isSelected ? Colors.white : AppColors.textLight,
                            ),
                          ),
                          Text(
                            period.periodYears,
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 10,
                              fontWeight: FontWeight.w500,
                              color: isSelected ? AppColors.goldLight : AppColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),

        const SizedBox(height: 18),

        // Resumen del Periodo Activo
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: AppColors.primaryDark.withValues(alpha: 0.7),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.borderGold.withValues(alpha: 0.5), width: 1.0),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.terracotta.withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.terracotta),
                ),
                child: Center(
                  child: Text(_currentPeriod.icon, style: const TextStyle(fontSize: 22)),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _currentPeriod.title,
                      style: GoogleFonts.montserrat(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppColors.goldLight,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _currentPeriod.summary,
                      style: GoogleFonts.inter(
                        fontSize: 12.5,
                        color: AppColors.textLight.withValues(alpha: 0.9),
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 18),

        // Lista de Hitos / Eventos del Periodo
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _currentPeriod.events.length,
          separatorBuilder: (_, __) => const SizedBox(height: 14),
          itemBuilder: (context, index) {
            final event = _currentPeriod.events[index];

            return GlassContainer(
              padding: const EdgeInsets.all(18),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.borderLight),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Cabecera del Evento
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.gold.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.goldLight, width: 0.8),
                        ),
                        child: Text(
                          event.year,
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                            color: AppColors.gold,
                          ),
                        ),
                      ),
                      if (event.locations.isNotEmpty)
                        Row(
                          children: [
                            const Icon(Icons.place_rounded, size: 14, color: AppColors.terracottaLight),
                            const SizedBox(width: 4),
                            Text(
                              event.locations.join(' · '),
                              style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted),
                            ),
                          ],
                        ),
                    ],
                  ),

                  const SizedBox(height: 10),

                  // Título del evento
                  Text(
                    event.title,
                    style: GoogleFonts.montserrat(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),

                  const SizedBox(height: 6),

                  // Descripción
                  Text(
                    event.description,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: AppColors.textLight.withValues(alpha: 0.85),
                      height: 1.45,
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Personajes y Relevancia
                  if (event.characters.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: event.characters.map((c) {
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.primaryLight.withValues(alpha: 0.5),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              '👤 $c',
                              style: GoogleFonts.spaceGrotesk(fontSize: 11, color: AppColors.textLight),
                            ),
                          );
                        }).toList(),
                      ),
                    ),

                  // Importancia Histórica
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.25),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.borderLight.withValues(alpha: 0.5)),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.verified_rounded, size: 16, color: AppColors.gold),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Importancia: ${event.historicalSignificance}',
                            style: GoogleFonts.inter(
                              fontSize: 11.5,
                              fontStyle: FontStyle.italic,
                              color: AppColors.goldLight,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Botón "📍 Conocer este lugar"
                  if (event.destinationRouteId != null) ...[
                    const SizedBox(height: 12),
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton.icon(
                        onPressed: () {
                          HapticFeedback.lightImpact();
                          context.go(event.destinationRouteId!);
                        },
                        icon: const Icon(Icons.navigation_rounded, size: 16, color: AppColors.terracottaLight),
                        label: Text(
                          '📍 Conocer este lugar en Baqueano',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.terracottaLight,
                          ),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}
