// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — HERO PANORÁMICO: HISTORIA DE MI PAÍS
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Generar un impacto visual instantáneo que conecte la identidad patria, el orgullo
//   cultural y el espíritu de aventura con los paisajes volcánicos de Nicaragua.
// - Guiar al explorador mediante llamados a la acción (CTAs) directos para
//   sumergirse en la historia o explorar destinos turísticos activos.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Contenedor con altura proporcional (68% de la pantalla) y cobertura fotográfica.
// - Gradiente volcánico con tonos oscuros para legibilidad óptima.
// - Botones de acción con respuesta háptica y animaciones suaves de entrada.
//
// 📦 3. QUÉ (WHAT / WIDGET EXPUESTO):
// - `HistoryHeroSection`: Encabezado panorámico con títulos y CTAs.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../models/country_history_models.dart';

class HistoryHeroSection extends StatelessWidget {
  final CountryProfile profile;
  final VoidCallback onExploreTap;

  const HistoryHeroSection({
    super.key,
    required this.profile,
    required this.onExploreTap,
  });

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;
    final heroHeight = (screenSize.height * 0.68).clamp(460.0, 680.0);
    final isDesktop = screenSize.width >= 900;

    return Container(
      width: double.infinity,
      height: heroHeight,
      decoration: BoxDecoration(
        color: AppColors.primaryDark,
        image: DecorationImage(
          image: NetworkImage(profile.heroBackdropUrl),
          fit: BoxFit.cover,
          colorFilter: ColorFilter.mode(
            Colors.black.withValues(alpha: 0.55),
            BlendMode.darken,
          ),
        ),
      ),
      child: Stack(
        children: [
          // Gradiente volcánico inferior
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    AppColors.bgDark.withValues(alpha: 0.7),
                    AppColors.bgDark,
                  ],
                  stops: const [0.3, 0.75, 1.0],
                ),
              ),
            ),
          ),

          // Contenido centrado
          SafeArea(
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 960),
                child: Padding(
                  padding: EdgeInsets.symmetric(
                    horizontal: isDesktop ? 40.0 : 20.0,
                    vertical: 24.0,
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Badge Nacional
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.primaryDark.withValues(alpha: 0.8),
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: AppColors.borderGold, width: 1.2),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.4),
                              blurRadius: 16,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(profile.flagEmoji, style: const TextStyle(fontSize: 18)),
                            const SizedBox(width: 8),
                            Text(
                              profile.name.toUpperCase(),
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 12,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 1.6,
                                color: AppColors.gold,
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 20),

                      // Título Principal
                      Text(
                        profile.heroTitle,
                        textAlign: TextAlign.center,
                        style: GoogleFonts.montserrat(
                          fontSize: isDesktop ? 38 : 24,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                          letterSpacing: -0.5,
                          height: 1.2,
                          shadows: [
                            Shadow(
                              color: Colors.black.withValues(alpha: 0.8),
                              blurRadius: 18,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 14),

                      // Subtítulo
                      Text(
                        profile.heroSubtitle,
                        textAlign: TextAlign.center,
                        style: GoogleFonts.inter(
                          fontSize: isDesktop ? 16 : 13.5,
                          fontWeight: FontWeight.w400,
                          color: AppColors.textLight.withValues(alpha: 0.9),
                          height: 1.45,
                        ),
                      ),

                      const SizedBox(height: 28),

                      // Botonera de Doble Acción (CTAs)
                      Wrap(
                        alignment: WrapAlignment.center,
                        spacing: 16,
                        runSpacing: 12,
                        children: [
                          // CTA 1: Explorar Nicaragua
                          ElevatedButton.icon(
                            onPressed: () {
                              HapticFeedback.mediumImpact();
                              onExploreTap();
                            },
                            icon: const Icon(Icons.explore_rounded, size: 20),
                            label: Text(
                              'Explorar Nicaragua',
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 14,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.5,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.terracotta,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 26, vertical: 15),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              elevation: 8,
                              shadowColor: AppColors.terracotta.withValues(alpha: 0.5),
                            ),
                          ),

                          // CTA 2: Descubrir Destinos
                          OutlinedButton.icon(
                            onPressed: () {
                              HapticFeedback.lightImpact();
                              context.go('/descubrir');
                            },
                            icon: const Icon(Icons.location_on_rounded, size: 20, color: AppColors.goldLight),
                            label: Text(
                              'Descubrir Destinos',
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.5,
                                color: Colors.white,
                              ),
                            ),
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: AppColors.borderGold, width: 1.5),
                              backgroundColor: AppColors.primaryDark.withValues(alpha: 0.6),
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 15),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
