// ============================================================================
// 🌄 SECCIÓN HERO MONUMENTAL & ROTADOR DE DESTINOS DESTACADOS (HERO_SECTION.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Ser el epicentro de la propuesta de valor al entrar a Baqueano:
//   * Titular editorial "NICARAGUA EN MODO SECRETO".
//   * Doble llamada a la acción: "DISEÑAR MI RUTA" e interactuar con "BAQUEANO AI".
//   * Tarjeta flotante interactiva 3D con rotación automática cada 20 segundos
//     a través de las joyas del catálogo oficial de Nicaragua.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `Timer.periodic(const Duration(seconds: 20))` para ciclar automáticamente entre
//   los destinos del catálogo oficial (`CatalogData.destinations`).
// - Transición fluida cinematográfica a 60 FPS con `AnimatedSwitcher` y `FadeTransition` (800ms).
// - Responsive layout: Fila equilibrada (Flex 6 texto / Flex 4 tarjeta) en Desktop (`>= 950px`)
//   y columna vertical fluida en Móvil y Tablets.
// - Integración directa con `CheckoutModal.show(context, destination)` para procesar reservas.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `HeroSection`: Componente estandarte del Home con rotación dinámica y visual de alta fidelidad.
// ============================================================================

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/baqueano_button.dart';
import 'interactive_3d_featured_card.dart';

class HeroSection extends StatefulWidget {
  const HeroSection({super.key});

  @override
  State<HeroSection> createState() => _HeroSectionState();
}

class _HeroSectionState extends State<HeroSection> {
  /// Índice del destino destacado actual en rotación
  int _currentFeaturedIndex = 0;

  /// Timer recurrente para alternar el destino cada 20 segundos
  Timer? _rotationTimer;

  @override
  void initState() {
    super.initState();
    // Intención: Rotar periódicamente el destino insigne para visibilizar múltiples cooperativas rurales.
    // Mecanismo: Intervalo de 20 segundos que avanza el puntero de forma circular.
    // Importancia: Muestra la diversidad del ecoturismo nicaragüense sin fatigar al explorador.
    _rotationTimer = Timer.periodic(const Duration(seconds: 20), (timer) {
      if (!mounted) return;
      if (CatalogData.destinations.isNotEmpty) {
        setState(() {
          _currentFeaturedIndex =
              (_currentFeaturedIndex + 1) % CatalogData.destinations.length;
        });
      }
    });
  }

  @override
  void dispose() {
    // Intención: Prevenir fugas de memoria al cambiar de pestaña.
    // Mecanismo: Cancelación estricta del timer asíncrono.
    // Importancia: Conserva batería y rendimiento óptimo en Android.
    _rotationTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Detección de dimensiones para layout responsivo
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    final destinations = CatalogData.destinations;
    final featuredDestination =
        destinations.isNotEmpty
            ? destinations[_currentFeaturedIndex % destinations.length]
            : null;

    return Stack(
      children: [
        // --------------------------------------------------------------------
        // 🌌 EFECTOS DE RESPLANDOR ATMOSFÉRICO EN EL FONDO (Glow Spheres)
        // --------------------------------------------------------------------
        Positioned(
          top: -100,
          right: -80,
          child: Container(
            width: 350,
            height: 350,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.terracotta.withValues(alpha: 0.18),
            ),
          ),
        ),
        Positioned(
          top: 150,
          left: -100,
          child: Container(
            width: 300,
            height: 300,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.craterTeal.withValues(alpha: 0.12),
            ),
          ),
        ),

        // --------------------------------------------------------------------
        // 🏛️ CONTENIDO PRINCIPAL DEL HERO (TEXTO + TARJETA ROTATIVA 3D)
        // --------------------------------------------------------------------
        Padding(
          padding: EdgeInsets.symmetric(
            horizontal: isDesktop ? 48.0 : 20.0,
            vertical: isDesktop ? 40.0 : 24.0,
          ),
          child:
              isDesktop
                  ? Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Columna izquierda: Titular monumental y CTAs
                      Expanded(
                        flex: 6,
                        child: _buildHeroTextContent(context, isDesktop),
                      ),
                      const SizedBox(width: 48),
                      // Columna derecha: Tarjeta flotante 3D rotativa
                      Expanded(
                        flex: 4,
                        child: _buildAnimatedFeaturedCard(featuredDestination),
                      ),
                    ],
                  )
                  : Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildHeroTextContent(context, isDesktop),
                      const SizedBox(height: 28),
                      _buildAnimatedFeaturedCard(featuredDestination),
                    ],
                  ),
        ),
      ],
    );
  }

  /// Construye la tarjeta destacada con transición suave de desvanecimiento
  Widget _buildAnimatedFeaturedCard(dynamic destination) {
    if (destination == null) return const SizedBox.shrink();

    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 800),
      switchInCurve: Curves.easeInOutCubic,
      switchOutCurve: Curves.easeInOutCubic,
      transitionBuilder: (child, animation) {
        return FadeTransition(opacity: animation, child: child);
      },
      child: Interactive3DFeaturedCard(
        key: ValueKey('featured_${destination.id}_$_currentFeaturedIndex'),
        destination: destination,
      ),
    );
  }

  // --------------------------------------------------------------------------
  // 📝 BLOQUE EDITORIAL (TAG PILL + TITULAR + SUBTÍTULO + BOTONES)
  // --------------------------------------------------------------------------
  Widget _buildHeroTextContent(BuildContext context, bool isDesktop) {
    return Column(
      crossAxisAlignment:
          isDesktop ? CrossAxisAlignment.start : CrossAxisAlignment.center,
      children: [
        // Tag Pill verde selva: Ecoturismo y Turismo Comunitario
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
          decoration: BoxDecoration(
            color: AppColors.primaryDark.withValues(alpha: 0.8),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: AppColors.jungleGreen.withValues(alpha: 0.6),
              width: 1.2,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.eco_rounded,
                color: AppColors.jungleGreen,
                size: 14,
              ),
              const SizedBox(width: 8),
              Text(
                'EXPEDICIONES PRIVADAS · TURISMO LOCAL',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: AppColors.goldLight,
                  letterSpacing: 1.2,
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),

        // Titular monumental tipográfico en dos colores
        RichText(
          textAlign: isDesktop ? TextAlign.start : TextAlign.center,
          text: TextSpan(
            children: [
              TextSpan(
                text: 'NICARAGUA\n',
                style: GoogleFonts.montserrat(
                  fontSize: isDesktop ? 54 : 38,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  letterSpacing: -1.2,
                  height: 1.05,
                ),
              ),
              TextSpan(
                text: 'EN MODO\nSECRETO.',
                style: GoogleFonts.montserrat(
                  fontSize: isDesktop ? 54 : 38,
                  fontWeight: FontWeight.w900,
                  color: const Color(
                    0xFFFF5722,
                  ), // Naranja neón volcánico de alto impacto
                  letterSpacing: -1.2,
                  height: 1.05,
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 18),

        // Subtítulo descriptivo de la propuesta de valor
        Text(
          'Diseña rutas inmersivas con guías locales, reservas directas, mapa satelital interactivo y un asistente AI que convierte tus gustos en una aventura lista para vivir.',
          textAlign: isDesktop ? TextAlign.start : TextAlign.center,
          style: GoogleFonts.inter(
            fontSize: isDesktop ? 16 : 14,
            fontWeight: FontWeight.w400,
            color: AppColors.textLight.withValues(alpha: 0.9),
            height: 1.6,
          ),
        ),

        const SizedBox(height: 26),

        // Botones interactivos duales (Explorar / Chat IA)
        Wrap(
          spacing: 14,
          runSpacing: 12,
          alignment: isDesktop ? WrapAlignment.start : WrapAlignment.center,
          children: [
            BaqueanoButton(
              text: 'DISEÑAR MI RUTA',
              icon: const Icon(Icons.explore, size: 18, color: Colors.white),
              variant: BaqueanoButtonVariant.primary,
              height: 52,
              onPressed: () => context.go('/descubrir'),
            ),
            BaqueanoButton(
              text: 'PROBAR BAQUEANO AI',
              icon: const Icon(
                Icons.smart_toy_outlined,
                size: 18,
                color: AppColors.textDark,
              ),
              variant: BaqueanoButtonVariant.gold,
              height: 52,
              onPressed: () => context.go('/ai'),
            ),
          ],
        ),
      ],
    );
  }
}
