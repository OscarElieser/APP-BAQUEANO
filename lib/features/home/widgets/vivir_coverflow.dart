// ============================================================================
// 🧭 BAQUEANO — CARRUSEL 3D «¿QUÉ QUERÉS VIVIR?» (vivir_coverflow.dart)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Paridad web → app (14-10-2026): la portada web presenta las 10 vivencias de
//   «¿Qué querés vivir?» en un carrusel 3D de tarjetas de vidrio; la app Android
//   muestra la misma sección, con las mismas fotos y los mismos textos.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Una sola animación (`AnimationController`) mueve la posición del carrusel; cada
//   tarjeta calcula su distancia circular al centro y se ubica con `Matrix4`
//   (perspectiva + desplazamiento + rotación Y + profundidad).
// - Deslizar, flechas, puntos y tocar una tarjeta lateral la traen al centro; tocar
//   la central (o «Explorar») abre la sección de la app que corresponde a esa vivencia.
// - Textos del catálogo compartido con la web (`assets/i18n`, claves `vivir.*` y
//   las de la sección en `pages.index.*`): 8 idiomas.
// - Sin animación si el sistema pide reducir movimiento; la vivencia elegida se
//   recuerda con la misma clave que la web (`baqueano_vivencia_selected`).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `VivirCoverflow`: sección completa (encabezado, carrusel, barra y puntos).
// - `vivencias`: lista de las 10 vivencias (id, foto, claves y ruta).
// ============================================================================

import 'dart:math' as math;
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/i18n/app_i18n.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/baqueano_fonts.dart';

/// Una vivencia de la sección «¿Qué querés vivir?» (mismos datos que index.html).
class Vivencia {
  const Vivencia({
    required this.id,
    required this.labelKey,
    required this.label,
    required this.place,
    this.placeKey,
    required this.descKey,
    required this.desc,
    required this.route,
  });

  final String id;
  final String labelKey;
  final String label;
  final String place;
  final String? placeKey;
  final String descKey;
  final String desc;

  /// Sección de la app que abre la vivencia al elegirla.
  final String route;

  String get image => 'assets/images/vivir/$id.webp';
}

const List<Vivencia> vivencias = [
  Vivencia(id: 'aventura', labelKey: 'testimonials.types.aventura', label: 'Aventura', place: 'Cerro Negro · León', descKey: 'vivir.desc.aventura', desc: 'Bajá en tabla por la arena negra de un volcán activo y caminá su cráter con guías locales.', route: '/turismo'),
  Vivencia(id: 'naturaleza', labelKey: 'home.destinations.filters.nature', label: 'Naturaleza', place: 'Cañón de Somoto · Madriz', descKey: 'vivir.desc.naturaleza', desc: 'Navegá y nadá entre paredes de roca de un cañón esculpido por el agua en el norte del país.', route: '/descubre-nicaragua'),
  Vivencia(id: 'cultura', labelKey: 'nav.culture', label: 'Cultura', place: 'La Calzada · Granada', placeKey: 'pages.index.vivirSelector.span1', descKey: 'vivir.desc.cultura', desc: 'Recorré la calle peatonal más viva de Granada, entre casas coloniales, música y artesanía.', route: '/musica'),
  Vivencia(id: 'descanso', labelKey: 'pages.index.vivirSelector.span2', label: 'Descanso', place: 'Corn Island · Caribe Sur', placeKey: 'pages.index.vivirSelector.span3', descKey: 'vivir.desc.descanso', desc: 'Agua turquesa, arena blanca y ritmo caribeño en las islas del Caribe Sur.', route: '/playas'),
  Vivencia(id: 'historia', labelKey: 'nav.history', label: 'Historia', place: 'El Castillo · Río San Juan', descKey: 'vivir.desc.historia', desc: 'Subí a la fortaleza del siglo XVII que defendía el río San Juan de los ataques piratas.', route: '/historia-mi-pais'),
  Vivencia(id: 'gastronomia', labelKey: 'nav.gastronomy', label: 'Gastronomía', place: 'Vigorón · Granada', placeKey: 'pages.index.vivirSelector.span4', descKey: 'vivir.desc.gastronomia', desc: 'Probá el vigorón granadino: yuca, chicharrón y ensalada de repollo servidos en hoja de chagüite.', route: '/gastronomia'),
  Vivencia(id: 'comunidades', labelKey: 'home.destinations.filters.communities', label: 'Comunidades', place: 'Finca Magdalena · Ometepe', placeKey: 'pages.index.vivirSelector.span5', descKey: 'vivir.desc.comunidades', desc: 'Quedate con familias campesinas que cultivan café y comparten su vida en la isla de Ometepe.', route: '/comunidad'),
  Vivencia(id: 'romance', labelKey: 'pages.index.vivirSelector.span6', label: 'Romance', place: 'San Juan del Sur · Rivas', descKey: 'vivir.desc.romance', desc: 'Atardeceres sobre la bahía y el mirador del Cristo de la Misericordia, en San Juan del Sur.', route: '/playas'),
  Vivencia(id: 'familia', labelKey: 'pages.index.vivirSelector.span7', label: 'Familia', place: 'Laguna de Apoyo · Masaya', descKey: 'vivir.desc.familia', desc: 'Nadá en una laguna de cráter de aguas tibias y tranquilas, a minutos de Masaya y Granada.', route: '/descubre-nicaragua'),
  Vivencia(id: 'algo-diferente', labelKey: 'pages.index.vivirSelector.span8', label: 'Algo diferente', place: 'Cascada La Luna · Jinotega', placeKey: 'pages.index.vivirSelector.span9', descKey: 'vivir.desc.algoDiferente', desc: 'Cascadas escondidas en la montaña de Jinotega, lejos de las rutas de siempre.', route: '/descubre-nicaragua'),
];

/// Distancia circular más corta de [index] a [position] en un anillo de [count].
double circularOffset(int index, double position, int count) {
  var d = (index - position) % count;
  if (d > count / 2) d -= count;
  if (d < -count / 2) d += count;
  return d;
}

class VivirCoverflow extends ConsumerStatefulWidget {
  const VivirCoverflow({super.key, this.onSelected});

  /// Si se indica, reemplaza la navegación por defecto (útil en pruebas).
  final ValueChanged<Vivencia>? onSelected;

  @override
  ConsumerState<VivirCoverflow> createState() => _VivirCoverflowState();
}

class _VivirCoverflowState extends ConsumerState<VivirCoverflow> with SingleTickerProviderStateMixin {
  static const _prefKey = 'baqueano_vivencia_selected';
  late final AnimationController _controller;
  double _from = 0;
  double _to = 0;
  double _dragDx = 0;

  int get _count => vivencias.length;
  int get _active => (_to.round() % _count + _count) % _count;
  double get _position => lerpDouble(_from, _to, Curves.easeOutCubic.transform(_controller.value))!;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 560))..value = 1;
    _restore();
  }

  Future<void> _restore() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final index = vivencias.indexWhere((v) => v.id == prefs.getString(_prefKey));
      if (index > 0 && mounted) setState(() => _from = _to = index.toDouble());
    } catch (_) {}
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _goTo(int index) {
    final current = _position;
    final delta = circularOffset(index, current, _count);
    if (delta.abs() < 0.01 && _controller.isCompleted) return;
    _from = current;
    _to = current + delta;
    final reduce = MediaQuery.maybeOf(context)?.disableAnimations ?? false;
    HapticFeedback.selectionClick();
    if (reduce) {
      _controller.value = 1;
    } else {
      _controller.forward(from: 0);
    }
    setState(() {});
    final strings = ref.read(appStringsProvider).valueOrNull ?? AppStrings.empty;
    final v = vivencias[(index % _count + _count) % _count];
    SemanticsService.announce(
      strings.t('vivir.carousel.position', '{name}, {n} de {total}', {'name': strings.t(v.labelKey, v.label), 'n': vivencias.indexOf(v) + 1, 'total': _count}),
      Directionality.of(context),
    );
  }

  void _step(int delta) => _goTo(_active + delta);

  Future<void> _choose(Vivencia v) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_prefKey, v.id);
    } catch (_) {}
    if (!mounted) return;
    if (widget.onSelected != null) {
      widget.onSelected!(v);
    } else {
      context.push(v.route);
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = ref.strings;
    final width = MediaQuery.sizeOf(context).width;
    final narrow = width < 640;
    final cardW = narrow ? math.min(width * 0.72, 320.0) : math.min(math.max(width * 0.26, 260.0), 340.0);
    final cardH = cardW * 4 / 3;
    final step = cardW * (narrow ? 0.62 : 0.7);
    final reach = narrow ? 1 : 2;
    final title = '${s.t('pages.index.vivirTitle.h21', '¿Qué querés')} ${s.t('pages.index.vivirTitle.span1', 'vivir')}?';

    return Padding(
      padding: EdgeInsets.symmetric(vertical: narrow ? 28 : 40),
      child: Column(
        children: [
          // Encabezado (mismos textos que la web)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.explore_rounded, size: 16, color: AppColors.terracotta),
                    const SizedBox(width: 6),
                    Flexible(
                      child: Text(
                        s.t('pages.index.vivirHeader.p1', 'DESCUBRÍ NICARAGUA').toUpperCase(),
                        style: BaqueanoFonts.text(fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 1.6, color: AppColors.terracottaDark),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Semantics(
                  header: true,
                  child: Text(
                    title,
                    textAlign: TextAlign.center,
                    style: BaqueanoFonts.display(fontSize: narrow ? 30 : 40, fontWeight: FontWeight.w800, height: 1.1, color: AppColors.bgDark),
                  ),
                ),
                const SizedBox(height: 10),
                ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 560),
                  child: Text(
                    s.t('pages.index.vivirHeader.p2', 'No te preguntamos a dónde querés ir. Te preguntamos qué querés sentir. Nicaragua tiene una experiencia para cada deseo.'),
                    textAlign: TextAlign.center,
                    style: BaqueanoFonts.text(fontSize: 15, height: 1.55, color: const Color(0xFF475569)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // Escenario 3D
          Semantics(
            label: s.t('vivir.carousel.label', 'Vivencias de Nicaragua'),
            child: GestureDetector(
              behavior: HitTestBehavior.translucent,
              onHorizontalDragStart: (_) => _dragDx = 0,
              onHorizontalDragUpdate: (d) => _dragDx += d.delta.dx,
              onHorizontalDragEnd: (d) {
                final v = d.primaryVelocity ?? 0;
                if (_dragDx.abs() > 40 || v.abs() > 350) _step((_dragDx + v * 0.1) < 0 ? 1 : -1);
              },
              child: SizedBox(
                height: cardH + 36,
                width: double.infinity,
                child: AnimatedBuilder(
                  animation: _controller,
                  builder: (context, _) {
                    final pos = _position;
                    final order = List<int>.generate(_count, (i) => i)
                      ..sort((a, b) => circularOffset(b, pos, _count).abs().compareTo(circularOffset(a, pos, _count).abs()));
                    return Stack(
                      clipBehavior: Clip.none,
                      alignment: Alignment.center,
                      children: [
                        // Halo de luz detrás de la tarjeta central
                        IgnorePointer(
                          child: Container(
                            width: math.min(width * 0.92, 760),
                            height: cardH * 0.7,
                            decoration: BoxDecoration(
                              gradient: RadialGradient(colors: [
                                AppColors.terracotta.withValues(alpha: 0.20),
                                AppColors.primary.withValues(alpha: 0.12),
                                Colors.transparent,
                              ]),
                            ),
                          ),
                        ),
                        for (final i in order)
                          if (circularOffset(i, pos, _count).abs() <= reach + 0.6)
                            _CoverCard(
                              key: ValueKey(vivencias[i].id),
                              vivencia: vivencias[i],
                              index: i,
                              total: _count,
                              offset: circularOffset(i, pos, _count),
                              width: cardW,
                              height: cardH,
                              step: step,
                              narrow: narrow,
                              reach: reach,
                              onTap: () => i == _active ? _choose(vivencias[i]) : _goTo(i),
                            ),
                      ],
                    );
                  },
                ),
              ),
            ),
          ),
          const SizedBox(height: 6),
          _Dock(
            vivencia: vivencias[_active],
            onPrev: () => _step(-1),
            onNext: () => _step(1),
            onExplore: () => _choose(vivencias[_active]),
          ),
          const SizedBox(height: 8),
          Wrap(
            alignment: WrapAlignment.center,
            children: [
              for (var i = 0; i < _count; i++)
                Semantics(
                  button: true,
                  selected: i == _active,
                  label: s.t('vivir.carousel.goTo', 'Ir a {name}', {'name': s.t(vivencias[i].labelKey, vivencias[i].label)}),
                  child: InkResponse(
                    onTap: () => _goTo(i),
                    radius: 18,
                    child: SizedBox(
                      width: 30,
                      height: 30,
                      child: Center(
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          width: i == _active ? 24 : 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: i == _active ? AppColors.terracotta : AppColors.primary.withValues(alpha: 0.3),
                            borderRadius: BorderRadius.circular(99),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _CoverCard extends ConsumerWidget {
  const _CoverCard({
    super.key,
    required this.vivencia,
    required this.index,
    required this.total,
    required this.offset,
    required this.width,
    required this.height,
    required this.step,
    required this.narrow,
    required this.reach,
    required this.onTap,
  });

  final Vivencia vivencia;
  final int index;
  final int total;
  final double offset;
  final double width;
  final double height;
  final double step;
  final bool narrow;
  final int reach;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final s = ref.strings;
    final abs = offset.abs();
    final centerness = (1 - abs).clamp(0.0, 1.0);
    final rotation = offset.clamp(-1.0, 1.0) * -0.56;
    final scale = abs <= 1 ? 1 - abs * 0.14 : 0.86 - math.min(abs - 1, 1.6) * 0.22;
    final opacity = abs <= reach ? (1 - abs * 0.18).clamp(0.0, 1.0) : (reach + 0.6 - abs).clamp(0.0, 1.0);
    final matrix = Matrix4.identity()
      ..setEntry(3, 2, narrow ? 0.0016 : 0.0011)
      ..translateByDouble(offset.sign * (math.min(abs, 1.0) * step + math.max(abs - 1, 0.0) * step * 0.6), 0, -abs * (narrow ? 90 : 140), 1)
      ..rotateY(rotation)
      ..scaleByDouble(scale, scale, 1, 1);
    final label = s.t(vivencia.labelKey, vivencia.label);
    final place = vivencia.placeKey == null ? vivencia.place : s.t(vivencia.placeKey!, vivencia.place);

    return Transform(
      alignment: Alignment.center,
      transform: matrix,
      child: Opacity(
        opacity: opacity,
        child: Semantics(
          button: true,
          selected: abs < 0.5,
          label: '$label, $place',
          excludeSemantics: true,
          child: GestureDetector(
            onTap: onTap,
            child: Container(
              width: width,
              height: height,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(26),
                border: Border.all(color: Color.lerp(Colors.white.withValues(alpha: 0.35), AppColors.goldLight.withValues(alpha: 0.6), centerness)!),
                boxShadow: [
                  BoxShadow(color: AppColors.bgDark.withValues(alpha: 0.28 + 0.2 * centerness), blurRadius: 36, offset: const Offset(0, 18), spreadRadius: -14),
                  if (centerness > 0) BoxShadow(color: AppColors.terracotta.withValues(alpha: 0.28 * centerness), blurRadius: 50, spreadRadius: -10),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(25),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    ColorFiltered(
                      colorFilter: ColorFilter.mode(Colors.black.withValues(alpha: 0.22 * (1 - centerness)), BlendMode.darken),
                      child: Image.asset(vivencia.image, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const ColoredBox(color: AppColors.primary)),
                    ),
                    // Degradado inferior para leer el texto
                    const DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.bottomCenter,
                          end: Alignment.topCenter,
                          colors: [Color(0xEB0F172A), Color(0x800F172A), Color(0x000F172A)],
                          stops: [0, 0.38, 0.66],
                        ),
                      ),
                    ),
                    // Brillo de vidrio
                    const DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment(0.2, 0.2),
                          colors: [Color(0x47FFFFFF), Color(0x0FFFFFFF), Color(0x00FFFFFF)],
                          stops: [0, 0.28, 0.46],
                        ),
                      ),
                    ),
                    Positioned(top: 14, left: 14, child: _GlassChip(text: '${index + 1} / $total')),
                    Positioned(
                      left: 18,
                      right: 18,
                      bottom: 18,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            label,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: BaqueanoFonts.display(fontSize: narrow ? 24 : 28, fontWeight: FontWeight.w800, color: Colors.white, height: 1.1),
                          ),
                          const SizedBox(height: 8),
                          _GlassChip(text: place, icon: Icons.place_rounded),
                          ClipRect(
                            child: Align(
                              alignment: Alignment.topLeft,
                              heightFactor: centerness,
                              child: Opacity(
                                opacity: centerness,
                                child: Padding(
                                  padding: const EdgeInsets.only(top: 10),
                                  child: Text(
                                    s.t(vivencia.descKey, vivencia.desc),
                                    maxLines: 3,
                                    overflow: TextOverflow.ellipsis,
                                    style: BaqueanoFonts.text(fontSize: 13.5, height: 1.45, color: const Color(0xEBF7F3EA), fontWeight: FontWeight.w500),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _GlassChip extends StatelessWidget {
  const _GlassChip({required this.text, this.icon});

  final String text;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(99),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.14),
            border: Border.all(color: Colors.white.withValues(alpha: 0.26)),
            borderRadius: BorderRadius.circular(99),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[Icon(icon, size: 14, color: const Color(0xFFFF8A3D)), const SizedBox(width: 4)],
              Flexible(
                child: Text(
                  text,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: BaqueanoFonts.text(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.goldLight),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Dock extends ConsumerWidget {
  const _Dock({required this.vivencia, required this.onPrev, required this.onNext, required this.onExplore});

  final Vivencia vivencia;
  final VoidCallback onPrev;
  final VoidCallback onNext;
  final VoidCallback onExplore;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final s = ref.strings;
    final narrow = MediaQuery.sizeOf(context).width < 400;
    final place = vivencia.placeKey == null ? vivencia.place : s.t(vivencia.placeKey!, vivencia.place);
    return Container(
      constraints: const BoxConstraints(maxWidth: 560),
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [Colors.white.withValues(alpha: 0.9), AppColors.goldLight.withValues(alpha: 0.6)]),
        borderRadius: BorderRadius.circular(99),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.16)),
        boxShadow: [BoxShadow(color: AppColors.bgDark.withValues(alpha: 0.18), blurRadius: 30, offset: const Offset(0, 14), spreadRadius: -12)],
      ),
      child: Row(
        children: [
          _RoundButton(icon: Icons.chevron_left_rounded, label: s.t('vivir.carousel.prev', 'Vivencia anterior'), onTap: onPrev),
          const SizedBox(width: 8),
          if (!narrow) ...[
            ExcludeSemantics(
              child: Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  image: DecorationImage(image: AssetImage(vivencia.image), fit: BoxFit.cover),
                  border: Border.all(color: Colors.white, width: 2),
                  boxShadow: [BoxShadow(color: AppColors.terracotta.withValues(alpha: 0.55), spreadRadius: 1)],
                ),
              ),
            ),
            const SizedBox(width: 10),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(s.t(vivencia.labelKey, vivencia.label), maxLines: 1, overflow: TextOverflow.ellipsis, style: BaqueanoFonts.display(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.bgDark)),
                Text(place, maxLines: 1, overflow: TextOverflow.ellipsis, style: BaqueanoFonts.text(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary)),
              ],
            ),
          ),
          const SizedBox(width: 6),
          Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: onExplore,
              borderRadius: BorderRadius.circular(99),
              child: Ink(
                height: 44,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [AppColors.terracotta, AppColors.terracottaLight]),
                  borderRadius: BorderRadius.circular(99),
                ),
                child: Center(
                  child: Text(s.t('vivir.carousel.explore', 'Explorar'), style: BaqueanoFonts.display(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white)),
                ),
              ),
            ),
          ),
          const SizedBox(width: 6),
          _RoundButton(icon: Icons.chevron_right_rounded, label: s.t('vivir.carousel.next', 'Siguiente vivencia'), onTap: onNext),
        ],
      ),
    );
  }
}

class _RoundButton extends StatelessWidget {
  const _RoundButton({required this.icon, required this.label, required this.onTap});

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: label,
      excludeSemantics: true,
      child: Material(
        color: AppColors.primary,
        shape: const CircleBorder(),
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: onTap,
          child: SizedBox(width: 44, height: 44, child: Icon(icon, color: Colors.white, size: 26)),
        ),
      ),
    );
  }
}
