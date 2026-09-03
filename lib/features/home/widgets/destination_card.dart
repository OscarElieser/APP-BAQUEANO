// ============================================================================
// 🎴 TARJETA MODULAR DE DESTINO CON COTIZACIÓN Y FAVORITOS (DESTINATION_CARD.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Presentar cada destino y expedición del catálogo con un estándar visual de lujo:
//   * Fotografía de alta resolución con badge de dificultad semántico (Fácil, Moderado, Exigente).
//   * Botón flotante de favoritos con notificación emergente reactiva.
//   * Calificación comunitaria por estrellas y conteo de reseñas reales.
//   * Conversión bimoneda en tiempo real ($ USD / C$ NIO) y botón de reserva inmediata.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `StatefulWidget` con estado `_isFavorite` sincronizado localmente.
// - Algoritmo `_getDifficultyColor()` que asigna Verde (`AppColors.success`), Ámbar (`AppColors.warning`)
//   o Rojo (`AppColors.error`) según la exigencia física.
// - Apertura directa de `CheckoutModal.show(context, destination)` para procesar la reserva.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `DestinationCard`: Tarjeta de cuadrícula reusable de 470px de alto.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/models/destination_model.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/baqueano_adaptive_image.dart';
import '../../../core/widgets/baqueano_button.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../core/widgets/weather_radar_badge.dart';
import '../../checkout/widgets/checkout_modal.dart';

class DestinationCard extends StatefulWidget {
  /// Modelo de datos con toda la información de la expedición
  final DestinationModel destination;

  /// Callback ejecutado cuando el usuario conmuta el estado de favorito
  final VoidCallback? onFavoriteToggled;

  /// Callback opcional ejecutado al tocar la tarjeta o el botón de reservar
  final VoidCallback? onCardTapped;

  const DestinationCard({
    super.key,
    required this.destination,
    this.onFavoriteToggled,
    this.onCardTapped,
  });

  @override
  State<DestinationCard> createState() => _DestinationCardState();
}

class _DestinationCardState extends State<DestinationCard> {
  /// Estado mutable local que rastrea si la tarjeta está guardada en favoritos
  late bool _isFavorite;

  @override
  void initState() {
    super.initState();
    _isFavorite = widget.destination.isFavorite;
  }

  @override
  void didUpdateWidget(covariant DestinationCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Intención: Sincronizar el estado reactivo si la lista del catálogo es filtrada o reorganizada.
    // Mecanismo: Comparación por ID único de destino y bandera booleana.
    // Importancia: Evita estados huérfanos y desincronización de memoria en listas recicladas.
    if (oldWidget.destination.id != widget.destination.id ||
        oldWidget.destination.isFavorite != widget.destination.isFavorite) {
      _isFavorite = widget.destination.isFavorite;
    }
  }

  /// Retorna el color semántico según el nivel de dificultad de la expedición
  Color _getDifficultyColor(String difficulty) {
    switch (difficulty.toLowerCase()) {
      case 'fácil':
        return AppColors.success;
      case 'moderado':
        return AppColors.warning;
      case 'exigente':
        return AppColors.error;
      default:
        return AppColors.gold;
    }
  }

  void _handleFavoriteToggle() {
    try {
      setState(() => _isFavorite = !_isFavorite);
      if (_isFavorite && mounted) {
        CustomToast.success(context, '${widget.destination.title} añadido a favoritos.');
      }
      widget.onFavoriteToggled?.call();
    } catch (e) {
      debugPrint('[DestinationCard] Error controlado al alternar favorito: $e');
    }
  }

  void _handleReservationTap() {
    try {
      if (widget.onCardTapped != null) {
        widget.onCardTapped!();
      } else {
        CheckoutModal.show(context, widget.destination);
      }
    } catch (e) {
      debugPrint('[DestinationCard] Error controlado al abrir checkout: $e');
      if (mounted) {
        CustomToast.error(context, 'No se pudo iniciar la reserva en este momento.');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final destination = widget.destination;

    // Intención: Aislar la superficie de repintado de cada tarjeta individual.
    // Mecanismo: RepaintBoundary previene la propagación de invalidated layer frames.
    // Importancia: Elimina bloqueos (ANRs) y caídas de frames en scrolling a 60/120 FPS en Android.
    return RepaintBoundary(
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.borderLight),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.25),
              blurRadius: 14,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ------------------------------------------------------------------
            // 🌄 FOTOGRAFÍA & BADGES SUPERPUESTOS
            // ------------------------------------------------------------------
            Stack(
              children: [
                // Imagen principal con decodificación de memoria optimizada
                BaqueanoAdaptiveImage(
                  imageUrl: destination.imageUrl,
                  height: 155,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                ),

                // Viñeta oscura inferior para asegurar legibilidad
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 60,
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Colors.transparent, AppColors.bgDark.withValues(alpha: 0.8)],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                  ),
                ),

                // Badge de Dificultad en la esquina superior izquierda
                Positioned(
                  top: 12,
                  left: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.bgDark.withValues(alpha: 0.85),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: _getDifficultyColor(destination.difficulty), width: 1),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: _getDifficultyColor(destination.difficulty),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          destination.difficulty,
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Botón interactivo de Favoritos en la esquina superior derecha
                Positioned(
                  top: 10,
                  right: 10,
                  child: InkWell(
                    onTap: _handleFavoriteToggle,
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.bgDark.withValues(alpha: 0.8),
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.borderLight),
                      ),
                      child: Icon(
                        _isFavorite ? Icons.favorite : Icons.favorite_border,
                        size: 18,
                        color: _isFavorite ? AppColors.terracotta : Colors.white,
                      ),
                    ),
                  ),
                ),

                // Pill de Departamento en la esquina inferior izquierda de la foto
                Positioned(
                  bottom: 10,
                  left: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.terracotta.withValues(alpha: 0.85),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      destination.department.toUpperCase(),
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        letterSpacing: 0.8,
                      ),
                    ),
                  ),
                ),

                // Micro-Radar Climático en la esquina inferior derecha
                Positioned(
                  bottom: 8,
                  right: 12,
                  child: WeatherRadarBadge(
                    destinationId: destination.id,
                    compact: true,
                  ),
                ),
              ],
            ),

            // ------------------------------------------------------------------
            // 📝 CUERPO DE LA TARJETA (RATING + TÍTULO + TAGS + PRECIO)
            // ------------------------------------------------------------------
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Fila de Calificación con estrella dorada y duración/distancia
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.star_rounded, size: 18, color: AppColors.gold),
                          const SizedBox(width: 4),
                          Text(
                            destination.rating.clamp(0.0, 5.0).toStringAsFixed(1),
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '(${destination.reviewsCount >= 0 ? destination.reviewsCount : 0})',
                            style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted),
                          ),
                        ],
                      ),
                      Text(
                        '${destination.duration} · ${destination.distance}',
                        style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted),
                      ),
                    ],
                  ),

                  const SizedBox(height: 8),

                  // Título de la expedición con protección de desbordamiento
                  Text(
                    destination.title.isNotEmpty ? destination.title : 'Destino Baqueano',
                    style: GoogleFonts.montserrat(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textLight,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),

                  const SizedBox(height: 6),

                  // Descripción breve
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

                  const SizedBox(height: 12),

                  // Tags temáticos (#Volcanes, #Aventura, etc.)
                  Wrap(
                    spacing: 6,
                    runSpacing: 4,
                    children: [
                      ...destination.tags.take(2).map((tag) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.primaryLight.withValues(alpha: 0.4),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            '#$tag',
                            style: GoogleFonts.spaceGrotesk(fontSize: 10, color: AppColors.goldLight),
                          ),
                        );
                      }),
                      InkWell(
                        onTap: () {
                          try {
                            context.push('/campana-ambiental');
                          } catch (e) {
                            debugPrint('[DestinationCard] Error al navegar a campaña ambiental: $e');
                          }
                        },
                        borderRadius: BorderRadius.circular(6),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.jungleGreen.withValues(alpha: 0.25),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: AppColors.jungleGreenLight.withValues(alpha: 0.6)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Text('🌿', style: TextStyle(fontSize: 10)),
                              const SizedBox(width: 4),
                              Text(
                                'Cuidado Ambiental',
                                style: GoogleFonts.spaceGrotesk(
                                  fontSize: 10,
                                  color: AppColors.jungleGreenLight,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 14),
                  const Divider(color: AppColors.borderLight, height: 1),
                  const SizedBox(height: 12),

                  // ------------------------------------------------------------
                  // 💵 COTIZACIÓN BIMONEDA & BOTÓN DE RESERVA
                  // ------------------------------------------------------------
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Precio x persona', style: GoogleFonts.inter(fontSize: 10, color: AppColors.textMuted)),
                            Wrap(
                              crossAxisAlignment: WrapCrossAlignment.center,
                              children: [
                                Text(
                                  '\$${destination.priceUsd.isFinite ? destination.priceUsd.toInt() : 0} USD',
                                  style: GoogleFonts.montserrat(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w900,
                                    color: AppColors.gold,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  '/ C\$${destination.priceNio.isFinite ? destination.priceNio.toInt() : 0}',
                                  style: GoogleFonts.spaceGrotesk(
                                    fontSize: 11,
                                    color: AppColors.textMuted,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Botón de llamada a la acción directo al checkout protegido
                      BaqueanoButton(
                        text: 'Reservar',
                        variant: BaqueanoButtonVariant.primary,
                        height: 38,
                        padding: const EdgeInsets.symmetric(horizontal: 14),
                        onPressed: _handleReservationTap,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
