// ============================================================================
// 💬 TESTIMONIOS & RESEÑAS DINÁMICAS INFINITAS (EXPLORER_TESTIMONIALS.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Mostrar la prueba social real de exploradores de Alemania, España, Costa Rica y EE.UU.
//   en un carrusel dinámico infinito continuo a 60 FPS.
// - Cumplir con la pausa inteligente: cuando el usuario toca cualquier testimonio para leerlo
//   o ver la experiencia completa, el desplazamiento se detiene inmediatamente; al cerrar la
//   lectura, el flujo infinito reanuda su marcha continua.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `StatefulWidget` con `ScrollController` animado hacia adelante de forma constante
//   (`Curves.linear`) con cuadriplicación de elementos para un bucle continuo invisible.
// - Modal interactivo `_showReviewDetailsModal` que despliega el relato íntegro y badges.
// - Detección de toques con `Listener` para detener temporalmente el scroll al deslizar.
// - Paleta de colores de lujo (#082B35, #C86432, #D4AF37) y Glassmorphism con `AppGradients.cardGlass`.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `ExplorerTestimonials`: Galería dinámica infinita de reseñas en dirección hacia adelante.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/section_header.dart';

class ExplorerTestimonials extends StatefulWidget {
  const ExplorerTestimonials({super.key});

  @override
  State<ExplorerTestimonials> createState() => _ExplorerTestimonialsState();
}

class _ExplorerTestimonialsState extends State<ExplorerTestimonials> {
  /// Controlador del desplazamiento horizontal continuo
  late final ScrollController _scrollController;

  /// Bandera para evitar llamadas asíncronas tras dispose
  bool _isDisposed = false;

  /// Estado reactivo de pausa inteligente
  bool _isPaused = false;

  /// Testimonio actualmente seleccionado para feedback visual
  dynamic _selectedReview;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    // Inicia el desplazamiento infinito una vez renderizado el widget
    WidgetsBinding.instance.addPostFrameCallback((_) => _startContinuousScroll());
  }

  /// Desplazamiento infinito continuo a 60 FPS hacia adelante (Forward: izquierda -> derecha)
  void _startContinuousScroll() async {
    while (!_isDisposed && mounted) {
      if (_scrollController.hasClients && !_isPaused) {
        final maxScroll = _scrollController.position.maxScrollExtent;
        final currentScroll = _scrollController.offset;
        final remainingDistance = maxScroll - currentScroll;

        if (remainingDistance > 0) {
          // Velocidad constante suave (42ms por píxel para lectura cómoda)
          final durationMs = (remainingDistance * 42).toInt();
          await _scrollController.animateTo(
            maxScroll,
            duration: Duration(milliseconds: durationMs),
            curve: Curves.linear,
          );
        }

        // Retorno transparente al inicio para simular bucle continuo sin saltos
        if (!_isDisposed && mounted && _scrollController.hasClients && !_isPaused) {
          _scrollController.jumpTo(0);
        }
      } else {
        await Future.delayed(const Duration(milliseconds: 250));
      }
    }
  }

  /// Abre la lectura detallada del testimonio y pausa el carrusel
  Future<void> _handleReviewSelected(dynamic rev) async {
    setState(() {
      _isPaused = true;
      _selectedReview = rev;
    });

    await _showReviewDetailsModal(context, rev);

    if (mounted && !_isDisposed) {
      setState(() {
        _isPaused = false;
        _selectedReview = null;
      });
      _startContinuousScroll();
    }
  }

  /// Modal de lectura extendida del testimonio con verificación comunitaria
  Future<void> _showReviewDetailsModal(BuildContext context, dynamic rev) async {
    await showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF082B35),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Center(
                child: Container(
                  width: 44,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.white24,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 18),

              // Cabecera del autor
              Row(
                children: [
                  Text(rev.countryFlag as String, style: const TextStyle(fontSize: 32)),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          rev.author as String,
                          style: GoogleFonts.montserrat(
                            fontSize: 17,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                        ),
                        Text(
                          'Expedición en ${rev.destination}',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 12,
                            color: AppColors.gold,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: AppColors.jungleGreen.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.jungleGreenLight, width: 0.8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.verified_rounded, size: 12, color: AppColors.jungleGreenLight),
                        const SizedBox(width: 4),
                        Text(
                          'Verificada',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: AppColors.jungleGreenLight,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 14),
              Row(
                children: List.generate(
                  5,
                  (i) => const Icon(Icons.star_rounded, size: 18, color: AppColors.gold),
                ),
              ),

              const SizedBox(height: 14),
              const Divider(color: Colors.white12),
              const SizedBox(height: 14),

              Text(
                'Relato del Explorador:',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textLight.withValues(alpha: 0.6),
                  letterSpacing: 1.1,
                ),
              ),
              const SizedBox(height: 8),

              Text(
                '"${rev.review}"',
                style: GoogleFonts.inter(
                  fontSize: 14.5,
                  color: Colors.white.withValues(alpha: 0.95),
                  height: 1.6,
                  fontStyle: FontStyle.italic,
                ),
              ),

              const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(ctx),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.terracotta,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: Text(
                    'Entendido · Continuar Explorando',
                    style: GoogleFonts.montserrat(fontWeight: FontWeight.w800, fontSize: 12),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _isDisposed = true;
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final reviews = CatalogData.explorerReviews;

    // Cuadriplicación de la lista para movimiento continuo transparente
    final continuousList = [
      ...reviews,
      ...reviews,
      ...reviews,
      ...reviews,
    ];

    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Encabezado temático centrado con indicador dinámico de estado en vivo
        Padding(
          padding: EdgeInsets.symmetric(horizontal: isDesktop ? 48.0 : 20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SectionHeader(
                tag: 'TESTIMONIOS REALES',
                title: 'Lo que dicen nuestros Exploradores',
                subtitle: 'Historias transparentes de viajeros de todo el mundo que descubrieron la magia oculta de Nicaragua.',
                isCentered: true,
              ),
              const SizedBox(height: 6),
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: _isPaused
                      ? AppColors.terracotta.withValues(alpha: 0.22)
                      : AppColors.success.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: _isPaused
                        ? AppColors.terracotta.withValues(alpha: 0.6)
                        : AppColors.success.withValues(alpha: 0.5),
                    width: 1,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 7,
                      height: 7,
                      decoration: BoxDecoration(
                        color: _isPaused ? AppColors.terracotta : AppColors.success,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      _isPaused ? 'PAUSADO (EXPLORANDO)' : 'EN VIVO · 60 FPS',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.6,
                        color: _isPaused ? AppColors.terracotta : AppColors.success,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 12),

        // Lista horizontal continua de testimonios (Forward)
        SizedBox(
          height: 235,
          child: Listener(
            onPointerDown: (_) => setState(() => _isPaused = true),
            onPointerUp: (_) {
              if (_selectedReview == null) {
                setState(() => _isPaused = false);
                _startContinuousScroll();
              }
            },
            child: ListView.separated(
              controller: _scrollController,
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              padding: EdgeInsets.symmetric(horizontal: isDesktop ? 48.0 : 20.0),
              itemCount: continuousList.length,
              separatorBuilder: (_, __) => const SizedBox(width: 16),
              itemBuilder: (context, index) {
                final rev = continuousList[index];
                final isSelected = _selectedReview == rev;

                return AnimatedScale(
                  scale: isSelected ? 1.03 : 1.0,
                  duration: const Duration(milliseconds: 200),
                  child: InkWell(
                    onTap: () => _handleReviewSelected(rev),
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      width: 320,
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        gradient: isSelected
                            ? const LinearGradient(
                                colors: [Color(0xFF0F3A47), Color(0xFFC86432)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              )
                            : AppGradients.cardGlass,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isSelected
                              ? AppColors.gold
                              : AppColors.borderLight.withValues(alpha: 0.7),
                          width: isSelected ? 1.8 : 1.0,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: isSelected
                                ? AppColors.gold.withValues(alpha: 0.35)
                                : Colors.black.withValues(alpha: 0.25),
                            blurRadius: isSelected ? 16 : 12,
                            offset: const Offset(0, 5),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Fila superior: Bandera nacional, Autor, Destino y 5 Estrellas doradas
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Row(
                                  children: [
                                    Text(rev.countryFlag, style: const TextStyle(fontSize: 22)),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            rev.author,
                                            style: GoogleFonts.montserrat(
                                              fontSize: 13,
                                              fontWeight: FontWeight.w800,
                                              color: AppColors.textLight,
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          Text(
                                            rev.destination,
                                            style: GoogleFonts.spaceGrotesk(
                                              fontSize: 11,
                                              color: AppColors.goldLight,
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 6),
                              // 5 Estrellas doradas
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: List.generate(
                                  5,
                                  (i) => const Icon(Icons.star_rounded, size: 14, color: AppColors.gold),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),

                          // Relato en cursiva del explorador
                          Expanded(
                            child: Text(
                              rev.review,
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                color: AppColors.textLight.withValues(alpha: 0.85),
                                height: 1.45,
                                fontStyle: FontStyle.italic,
                              ),
                              maxLines: 4,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),

                          const SizedBox(height: 6),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              Text(
                                'Toca para leer completa 💬',
                                style: GoogleFonts.spaceGrotesk(
                                  fontSize: 10,
                                  color: AppColors.goldLight.withValues(alpha: 0.7),
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ),
      ],
    );
  }
}
