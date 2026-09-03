// ============================================================================
// 🎠 CARRUSEL DINÁMICO INFINITO DE CATEGORÍAS CULTURALES (QUICK_CATEGORIES_CAROUSEL.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia dinámica y continua a 60 FPS de las 8 categorías
//   temáticas fundamentales de Nicaragua (Gastronomía, Marimba, Videos 4K, Playas, etc.).
// - Cumplir con la interacción de pausa inteligente: el carrusel se desplaza
//   infinitamente de izquierda a derecha; al seleccionar una categoría, se detiene
//   para dar retroalimentación visual al explorador antes de la navegación.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `StatefulWidget` con `ScrollController` y bucle asíncrono constante (`Curves.linear`).
// - Detección táctil mediante `Listener`: `onPointerDown` pausa inmediatamente el carrusel;
//   `onPointerUp` reanuda la marcha suavemente.
// - Cuadruplicación de la lista de categorías para bucle infinito sin parpadeos ni saltos.
// - Tarjetas Glassmorphism con `AppGradients.cardGlass` y bordes sutiles en paleta volcánica.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `QuickCategoriesCarousel`: Carrusel horizontal continuo con desplazamiento hacia adelante.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';

class QuickCategoriesCarousel extends StatefulWidget {
  const QuickCategoriesCarousel({super.key});

  @override
  State<QuickCategoriesCarousel> createState() => _QuickCategoriesCarouselState();
}

class _QuickCategoriesCarouselState extends State<QuickCategoriesCarousel> {
  /// Controlador del desplazamiento horizontal continuo
  late final ScrollController _scrollController;

  /// Bandera para evitar llamadas asíncronas cuando el widget se destruye
  bool _isDisposed = false;

  /// Estado reactivo que pausa la animación cuando el usuario interactúa
  bool _isPaused = false;

  /// Categoría actualmente presionada para feedback táctil
  String? _selectedCategory;

  /// Lista base de categorías temáticas de exploración
  final List<Map<String, String>> _categories = const [
    {'icon': '🍽️', 'title': 'Gastronomía', 'sub': '6 Platillos & Restaurantes', 'route': '/gastronomia'},
    {'icon': '🎵', 'title': 'Música & Folklore', 'sub': 'Reproductor de Marimba', 'route': '/musica'},
    {'icon': '🎬', 'title': 'Videos 4K', 'sub': 'Expediciones en video', 'route': '/videos'},
    {'icon': '🏖️', 'title': 'Playas & Ríos', 'sub': 'Pacífico, Caribe y cañones', 'route': '/playas'},
    {'icon': '🏨', 'title': 'Eco-Lodges', 'sub': 'Hospedaje rural verde', 'route': '/hospedaje'},
    {'icon': '🎉', 'title': 'Vida Nocturna', 'sub': 'Bares bohemios y terrazas', 'route': '/nocturna'},
    {'icon': '📍', 'title': 'Turismo & Volcanes', 'sub': 'Circuitos y cumbres', 'route': '/turismo'},
    {'icon': '🧭', 'title': 'Mega-Catálogo', 'sub': 'Exploración completa', 'route': '/descubrir'},
  ];

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    // Inicia el desplazamiento infinito una vez renderizado el widget
    WidgetsBinding.instance.addPostFrameCallback((_) => _startContinuousScroll());
  }

  /// Desplazamiento infinito continuo a 60 FPS en dirección hacia adelante (Forward ->)
  void _startContinuousScroll() async {
    while (!_isDisposed && mounted) {
      if (_scrollController.hasClients && !_isPaused) {
        final maxScroll = _scrollController.position.maxScrollExtent;
        final currentScroll = _scrollController.offset;
        final remainingDistance = maxScroll - currentScroll;

        if (remainingDistance > 0) {
          // Velocidad constante suave (40ms por píxel)
          final durationMs = (remainingDistance * 40).toInt();
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

  /// Pausa el carrusel al seleccionar una categoría, resalta y ejecuta la navegación
  void _onCategoryTapped(Map<String, String> cat) async {
    setState(() {
      _isPaused = true;
      _selectedCategory = cat['title'];
    });

    // Breve pausa para apreciación visual del toque
    await Future.delayed(const Duration(milliseconds: 180));

    if (mounted) {
      context.go(cat['route']!);
      // Al retornar si aplica, se reanuda
      setState(() {
        _isPaused = false;
        _selectedCategory = null;
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
    // Cuadruplicación de categorías para flujo infinito transparente
    final continuousList = [
      ..._categories,
      ..._categories,
      ..._categories,
      ..._categories,
    ];

    return SizedBox(
      height: 125,
      child: Listener(
        onPointerDown: (_) => setState(() => _isPaused = true),
        onPointerUp: (_) {
          if (_selectedCategory == null) {
            setState(() => _isPaused = false);
            _startContinuousScroll();
          }
        },
        child: ListView.separated(
          controller: _scrollController,
          padding: const EdgeInsets.symmetric(horizontal: 20),
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          itemCount: continuousList.length,
          separatorBuilder: (_, __) => const SizedBox(width: 14),
          itemBuilder: (context, index) {
            final cat = continuousList[index];
            final isSelected = _selectedCategory == cat['title'];

            return AnimatedScale(
              scale: isSelected ? 1.05 : 1.0,
              duration: const Duration(milliseconds: 180),
              child: InkWell(
                onTap: () => _onCategoryTapped(cat),
                borderRadius: BorderRadius.circular(18),
                child: Container(
                  width: 175,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    gradient: isSelected
                        ? const LinearGradient(
                            colors: [Color(0xFF0F3A47), Color(0xFFC86432)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          )
                        : AppGradients.cardGlass,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                      color: isSelected
                          ? AppColors.gold
                          : AppColors.borderLight.withValues(alpha: 0.7),
                      width: isSelected ? 1.8 : 1.0,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: isSelected
                            ? AppColors.gold.withValues(alpha: 0.3)
                            : Colors.black.withValues(alpha: 0.2),
                        blurRadius: isSelected ? 14 : 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Icono / Emoji temático
                      Text(cat['icon']!, style: const TextStyle(fontSize: 26)),
                      const SizedBox(height: 6),

                      // Título en Space Grotesk
                      Text(
                        cat['title']!,
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textLight,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),

                      // Subtítulo descriptivo en Inter
                      Text(
                        cat['sub']!,
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          color: AppColors.textMuted,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
