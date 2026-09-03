// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — GALERÍA DINÁMICA INFINITA DE DESTINOS POPULARES
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Transformar la lista de destinos populares en una experiencia viva, continua
//   y de alto impacto visual que recorra las maravillas de Nicaragua a 60 FPS.
// - Cumplir con la interacción inteligente solicitada: la galería se desplaza
//   infinitamente en automático, pero en el momento exacto en que el explorador
//   selecciona un destino para cotizar o revisar, el movimiento se pausa por completo;
//   al cerrar el modal o salir de la selección, la galería reanuda suavemente su viaje.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `ScrollController` sincronizado con un bucle asíncrono infinito a velocidad
//   constante (`Curves.linear`) con multiplicación de elementos sin saltos visibles.
// - Variable reactiva `_isPaused` que detiene el motor de animación cuando se abre
//   el flujo de reserva (`CheckoutModal.show(...)`) o se detectan gestos táctiles.
// - Píldora de estado en vivo que indica al explorador el modo activo:
//   "● EN MOVIMIENTO" vs "⏸ PAUSADO (EXPLORANDO DESTINO)".
// - Tarjetas de destino modulares de 310px de ancho con diseño Glassmorphism,
//   conversión bimoneda (USD/NIO) y botón de reserva directa.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `InfiniteDestinationsGallery`: Componente interactivo para la sección de
//   Top Destinos Populares en la pantalla principal.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/models/destination_model.dart';
import '../../../core/theme/app_colors.dart';
import '../../checkout/widgets/checkout_modal.dart';
import 'destination_card.dart';

class InfiniteDestinationsGallery extends StatefulWidget {
  /// Lista de destinos a mostrar (puede venir filtrada por departamento)
  final List<DestinationModel> destinations;

  const InfiniteDestinationsGallery({
    super.key,
    required this.destinations,
  });

  @override
  State<InfiniteDestinationsGallery> createState() => _InfiniteDestinationsGalleryState();
}

class _InfiniteDestinationsGalleryState extends State<InfiniteDestinationsGallery> {
  /// Controlador del desplazamiento horizontal continuo
  late final ScrollController _scrollController;

  /// Bandera para cancelar operaciones asíncronas si el widget es destruido
  bool _isDisposed = false;

  /// Estado que detiene el movimiento cuando el usuario interactúa o abre un destino
  bool _isPaused = false;

  /// Destino actualmente seleccionado por el usuario (si aplica)
  DestinationModel? _selectedDestination;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    // Inicia el movimiento infinito una vez que el árbol de widgets se monta
    WidgetsBinding.instance.addPostFrameCallback((_) => _startContinuousScroll());
  }

  @override
  void didUpdateWidget(covariant InfiniteDestinationsGallery oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Si la lista de destinos cambia (por filtro de departamento), reinicia la animación
    if (oldWidget.destinations != widget.destinations) {
      if (_scrollController.hasClients) {
        _scrollController.jumpTo(0);
      }
      _startContinuousScroll();
    }
  }

  /// Bucle asíncrono para desplazamiento infinito continuo a velocidad suave y constante
  void _startContinuousScroll() async {
    while (!_isDisposed && mounted) {
      if (_scrollController.hasClients && !_isPaused) {
        final maxScroll = _scrollController.position.maxScrollExtent;
        final currentScroll = _scrollController.offset;
        final remainingDistance = maxScroll - currentScroll;

        if (remainingDistance > 0) {
          // Velocidad constante suave (35ms por píxel para lectura cómoda)
          final durationMs = (remainingDistance * 35).toInt();
          await _scrollController.animateTo(
            maxScroll,
            duration: Duration(milliseconds: durationMs),
            curve: Curves.linear,
          );
        }

        // Reinicio transparente al inicio para bucle infinito perfecto
        if (!_isDisposed && mounted && _scrollController.hasClients && !_isPaused) {
          _scrollController.jumpTo(0);
        }
      } else {
        await Future.delayed(const Duration(milliseconds: 300));
      }
    }
  }

  /// Manejador ejecutado al seleccionar un destino: pausa el carrusel y abre el modal
  Future<void> _handleDestinationSelected(DestinationModel destination) async {
    setState(() {
      _isPaused = true;
      _selectedDestination = destination;
    });

    // Despliega el flujo de cotización y reserva directa
    await CheckoutModal.show(context, destination);

    // Al cerrar el modal o salir de la ficha, reanuda el movimiento continuo
    if (mounted && !_isDisposed) {
      setState(() {
        _isPaused = false;
        _selectedDestination = null;
      });
      _startContinuousScroll();
    }
  }

  @override
  void dispose() {
    _isDisposed = true;
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;
    final destinations = widget.destinations;

    if (destinations.isEmpty) {
      return Container(
        height: 200,
        alignment: Alignment.center,
        child: Text(
          'No hay destinos en este departamento.',
          style: GoogleFonts.inter(color: AppColors.textLight.withValues(alpha: 0.6)),
        ),
      );
    }

    // Cuadriplicación de la lista para crear el bucle infinito continuo
    final continuousList = [
      ...destinations,
      ...destinations,
      ...destinations,
      ...destinations,
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // --------------------------------------------------------------------
        // 🚦 INDICADOR EN VIVO DEL ESTADO DE MOVIMIENTO (PAUSA INTELIGENTE)
        // --------------------------------------------------------------------
        Padding(
          padding: EdgeInsets.symmetric(
            horizontal: isDesktop ? 48.0 : 20.0,
            vertical: 8.0,
          ),
          child: Center(
            child: Wrap(
              alignment: WrapAlignment.center,
              crossAxisAlignment: WrapCrossAlignment.center,
              spacing: 12,
              runSpacing: 6,
              children: [
                Text(
                  'DESLIZAMIENTO DINÁMICO',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.2,
                    color: AppColors.gold,
                  ),
                ),
                AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: _isPaused
                        ? AppColors.terracotta.withValues(alpha: 0.25)
                        : AppColors.success.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: _isPaused
                          ? AppColors.terracotta.withValues(alpha: 0.7)
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
                      const SizedBox(width: 6),
                      Text(
                        _isPaused ? 'PAUSADO (EXPLORANDO)' : 'EN VIVO · 60 FPS',
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 9.5,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.8,
                          color: _isPaused ? AppColors.terracotta : AppColors.success,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 10),

        // --------------------------------------------------------------------
        // ♾️ CARRUSEL INFINITO DE TARJETAS DE DESTINO
        // --------------------------------------------------------------------
        SizedBox(
          height: 485,
          child: Listener(
            // Pausa temporal al poner el dedo encima
            onPointerDown: (_) {
              setState(() => _isPaused = true);
            },
            // Reanuda suavemente al soltar si no hay un modal abierto
            onPointerUp: (_) {
              if (_selectedDestination == null) {
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
              separatorBuilder: (_, __) => const SizedBox(width: 18),
              itemBuilder: (context, index) {
                final dest = continuousList[index];
                final isSelected = _selectedDestination?.id == dest.id;

                return AnimatedScale(
                  scale: isSelected ? 1.02 : 1.0,
                  duration: const Duration(milliseconds: 250),
                  child: SizedBox(
                    width: isDesktop ? 340 : 310,
                    child: InkWell(
                      onTap: () => _handleDestinationSelected(dest),
                      borderRadius: BorderRadius.circular(20),
                      child: DestinationCard(
                        destination: dest,
                        onFavoriteToggled: () => setState(() {}),
                        onCardTapped: () => _handleDestinationSelected(dest),
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
