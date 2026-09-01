// ============================================================================
// 🌦️ WIDGET DE RADAR METEOROLÓGICO & MICROCLIMAS (WEATHER_RADAR_BADGE.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Mostrar en tiempo real la temperatura y condición del sendero en las tarjetas
//   de expedición y en la pantalla de detalle, elevando la utilidad real de la app.
// - Brindar seguridad al usuario antes de emprender caminatas o ascensos a cráteres.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Consume `WeatherRadarService` según el `destinationId`.
// - Renderiza un chip translúcido con icono climático animado y temperatura en grados Celsius.
// - Diálogo emergente interactivo con detalles de viento, humedad y estado del sendero al tocarlo.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `WeatherRadarBadge`: Componente táctil con modal informativo del clima.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/weather_radar_service.dart';
import '../theme/app_colors.dart';

class WeatherRadarBadge extends StatelessWidget {
  final String destinationId;
  final bool compact;

  const WeatherRadarBadge({
    super.key,
    required this.destinationId,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    final weather = WeatherRadarService.getWeatherForDestination(destinationId);

    return InkWell(
      onTap: () => _showWeatherModal(context, weather),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: compact ? 8 : 10,
          vertical: compact ? 4 : 5,
        ),
        decoration: BoxDecoration(
          color: AppColors.primaryDark.withValues(alpha: 0.85),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.craterTeal.withValues(alpha: 0.6), width: 1),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.25),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(weather.icon, style: TextStyle(fontSize: compact ? 12 : 14)),
            const SizedBox(width: 5),
            Text(
              '${weather.temperatureCelsius}°C',
              style: GoogleFonts.spaceGrotesk(
                fontSize: compact ? 11 : 12,
                fontWeight: FontWeight.w800,
                color: Colors.white,
              ),
            ),
            if (!compact) ...[
              const SizedBox(width: 6),
              Text(
                weather.condition,
                style: GoogleFonts.inter(
                  fontSize: 10,
                  fontWeight: FontWeight.w500,
                  color: AppColors.goldLight,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  /// Muestra un modal detallado del estado del clima y del sendero
  void _showWeatherModal(BuildContext context, DestinationWeather weather) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.symmetric(horizontal: 20),
        child: Container(
          width: 380,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: AppColors.bgDark,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: AppColors.craterTeal, width: 1.5),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.6),
                blurRadius: 30,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Text(weather.icon, style: const TextStyle(fontSize: 28)),
                      const SizedBox(width: 10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'RADAR METEOROLÓGICO',
                            style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.gold),
                          ),
                          Text(
                            weather.condition,
                            style: GoogleFonts.montserrat(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white),
                          ),
                        ],
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppColors.textMuted, size: 20),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              // Temperatura principal
              Text(
                '${weather.temperatureCelsius}°C',
                style: GoogleFonts.montserrat(
                  fontSize: 48,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 16),
              // 3 Cajas métricas
              Row(
                children: [
                  Expanded(
                    child: _buildMetricCard('💨 VIENTO', '${weather.windSpeedKmh} km/h'),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildMetricCard('💧 HUMEDAD', '${weather.humidityPercent}%'),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              // Estado del sendero
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: AppColors.jungleGreen.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.jungleGreenLight.withValues(alpha: 0.5)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.terrain_rounded, color: AppColors.jungleGreenLight, size: 18),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'CONDICIÓN DEL SENDERO',
                            style: GoogleFonts.spaceGrotesk(fontSize: 9, fontWeight: FontWeight.w800, color: AppColors.jungleGreenLight),
                          ),
                          Text(
                            weather.trailStatus,
                            style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.white),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetricCard(String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
      decoration: BoxDecoration(
        color: AppColors.primaryLight.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        children: [
          Text(label, style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.textMuted)),
          const SizedBox(height: 4),
          Text(value, style: GoogleFonts.montserrat(fontSize: 15, fontWeight: FontWeight.w900, color: Colors.white)),
        ],
      ),
    );
  }
}
