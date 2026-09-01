// ============================================================================
// 🌄 SECCIÓN HERO MONUMENTAL & TARJETA DESTACADA (HERO_SECTION.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Ser el epicentro de la propuesta de valor al entrar a Baqueano:
//   * Titular editorial "NICARAGUA EN MODO SECRETO".
//   * Doble llamada a la acción: "DISEÑAR MI RUTA" e interactuar con "BAQUEANO AI".
//   * Tarjeta flotante interactiva de *Cascada La Luna* con reserva directa en 1 toque.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `Stack` con orbes de luz atmosférica difuminados (`BoxDecoration(shape: BoxShape.circle)`).
// - Responsive layout: Fila equilibrada (Flex 6 texto / Flex 4 tarjeta) en Desktop (`>= 950px`)
//   y columna vertical fluida en Móvil.
// - Integración directa con `CheckoutModal.show(context, destination)` para procesar reservas.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `HeroSection`: Componente estandarte del Home.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/baqueano_button.dart';
import '../../../core/widgets/glass_container.dart';
import '../../checkout/widgets/checkout_modal.dart';

class HeroSection extends StatelessWidget {
  const HeroSection({super.key});

  @override
  Widget build(BuildContext context) {
    // Detección de dimensiones para layout responsivo
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;
    // Obtiene el destino destacado principal (Cascada La Luna)
    final featuredDestination = CatalogData.destinations.first;

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
        // 🏛️ CONTENIDO PRINCIPAL DEL HERO (TEXTO + TARJETA FLOTANTE)
        // --------------------------------------------------------------------
        Padding(
          padding: EdgeInsets.symmetric(
            horizontal: isDesktop ? 48.0 : 20.0,
            vertical: isDesktop ? 40.0 : 24.0,
          ),
          child: isDesktop
              ? Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    // Columna izquierda: Titular monumental y CTAs
                    Expanded(
                      flex: 6,
                      child: _buildHeroTextContent(context, isDesktop),
                    ),
                    const SizedBox(width: 48),
                    // Columna derecha: Tarjeta flotante con efecto cristal
                    Expanded(
                      flex: 4,
                      child: _buildFeaturedCard(context, featuredDestination),
                    ),
                  ],
                )
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildHeroTextContent(context, isDesktop),
                    const SizedBox(height: 28),
                    _buildFeaturedCard(context, featuredDestination),
                  ],
                ),
        ),
      ],
    );
  }

  // --------------------------------------------------------------------------
  // 📝 BLOQUE EDITORIAL (TAG PILL + TITULAR + SUBTÍTULO + BOTONES)
  // --------------------------------------------------------------------------
  Widget _buildHeroTextContent(BuildContext context, bool isDesktop) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Tag Pill verde selva: Ecoturismo y Turismo Comunitario
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
          decoration: BoxDecoration(
            color: AppColors.primaryDark.withValues(alpha: 0.8),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: AppColors.jungleGreen.withValues(alpha: 0.6), width: 1.2),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.eco_rounded, color: AppColors.jungleGreen, size: 14),
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
                  color: const Color(0xFFFF5722), // Naranja neón volcánico de alto impacto
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
          'Diseña rutas inmersivas con guías locales, reservas directas, mapa offline y un asistente AI que convierte tus gustos en una aventura lista para vivir.',
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
              icon: const Icon(Icons.smart_toy_outlined, size: 18, color: AppColors.textDark),
              variant: BaqueanoButtonVariant.gold,
              height: 52,
              onPressed: () => context.go('/ai'),
            ),
          ],
        ),
      ],
    );
  }

  // --------------------------------------------------------------------------
  // 🌟 TARJETA DESTACADA (CASCADA LA LUNA & METADATOS EN VIVO)
  // --------------------------------------------------------------------------
  Widget _buildFeaturedCard(BuildContext context, dynamic destination) {
    return GlassContainer(
      padding: EdgeInsets.zero,
      borderRadius: BorderRadius.circular(24),
      border: Border.all(color: AppColors.borderGold, width: 1.5),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Imagen local en alta resolución con badge naranja 'DESTACADO'
          Stack(
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                child: Image.asset(
                  'assets/images/cascada_la_luna.jpg',
                  height: 200,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Image.network(
                    destination.imageUrl,
                    height: 200,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      height: 200,
                      color: AppColors.primaryLight,
                      child: const Center(child: Icon(Icons.landscape, size: 48, color: AppColors.gold)),
                    ),
                  ),
                ),
              ),
              Positioned(
                top: 14,
                left: 14,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFF5722),
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Text(
                    'DESTACADO',
                    style: GoogleFonts.montserrat(
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.0,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),

          // Cuerpo de la tarjeta con título, descripción y métricas clave
          Padding(
            padding: const EdgeInsets.all(18.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'RUTA CURADA POR LOCALES',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.5,
                    color: AppColors.gold,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  destination.title.toUpperCase(),
                  style: GoogleFonts.montserrat(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.5,
                    color: Colors.white,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 6),
                Text(
                  destination.description,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: AppColors.textMuted,
                    height: 1.4,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 14),

                // 3 Cajas de métricas: Rating (4.9), Duración (1 Día), Distancia (18 KM)
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 6),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight.withValues(alpha: 0.5),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.borderLight),
                        ),
                        child: Column(
                          children: [
                            Text(
                              '${destination.rating}',
                              style: GoogleFonts.montserrat(fontSize: 13, fontWeight: FontWeight.w900, color: Colors.white),
                            ),
                            Text(
                              'RATING',
                              style: GoogleFonts.spaceGrotesk(fontSize: 9, fontWeight: FontWeight.w700, color: AppColors.goldLight),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 6),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight.withValues(alpha: 0.5),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.borderLight),
                        ),
                        child: Column(
                          children: [
                            Text(
                              destination.duration.toUpperCase(),
                              style: GoogleFonts.montserrat(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.white),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              'DURACIÓN',
                              style: GoogleFonts.spaceGrotesk(fontSize: 9, fontWeight: FontWeight.w700, color: AppColors.goldLight),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 6),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight.withValues(alpha: 0.5),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.borderLight),
                        ),
                        child: Column(
                          children: [
                            Text(
                              destination.distance.toUpperCase(),
                              style: GoogleFonts.montserrat(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.white),
                            ),
                            Text(
                              'RUTA',
                              style: GoogleFonts.spaceGrotesk(fontSize: 9, fontWeight: FontWeight.w700, color: AppColors.goldLight),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Precio bimoneda (USD / Córdobas NIO) y botón de reserva
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Desde', style: GoogleFonts.inter(fontSize: 10, color: AppColors.textMuted)),
                          Wrap(
                            crossAxisAlignment: WrapCrossAlignment.center,
                            children: [
                              Text(
                                '\$${destination.priceUsd.toInt()} USD',
                                style: GoogleFonts.montserrat(fontSize: 17, fontWeight: FontWeight.w900, color: AppColors.gold),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '/ C\$${destination.priceNio.toInt()}',
                                style: GoogleFonts.spaceGrotesk(fontSize: 12, color: AppColors.textMuted),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    BaqueanoButton(
                      text: 'Reservar',
                      variant: BaqueanoButtonVariant.primary,
                      height: 40,
                      onPressed: () => CheckoutModal.show(context, destination),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
