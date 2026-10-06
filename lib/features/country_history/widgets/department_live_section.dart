// ============================================================================
// 🧭 BAQUEANO — SECCIÓN VIVA DEL DEPARTAMENTO (PARIDAD CON departamento.html)
// ============================================================================
//
// 🎯 POR QUÉ (Propósito):
// - Regla del propietario (AGENTS.md regla 8): cada departamento y región
//   muestra una franja de lugares en movimiento automático y una ficha propia
//   al tocar cada lugar. La APK debe ofrecer lo mismo que la Web.
// - Mostrar los destinos verificados del departamento con datos reales de
//   Supabase (los que administra Ops Center) y llevarlos al mapa.
//
// ⚙️ CÓMO (Arquitectura):
// - Lugares: `territoriesProvider` (asset generado desde la Web, verificado en
//   CI). Destinos: `catalogSnapshotProvider` (Supabase, con caché local).
// - Franja: `ScrollController` avanzado por un `Ticker` (~28 px/s, como la Web),
//   aislada con `RepaintBoundary`. Se pausa al tocar o desplazar y se reanuda
//   a los 4 s; no se anima si el sistema pide reducir animaciones.
// - Solo se abre el mapa con coordenadas reales del destino (nunca el centro
//   del departamento como posición de un lugar).
//
// 📦 QUÉ (Entregables):
// - `DepartmentLiveSection(departmentId, departmentName)`, con la lista de
//   municipios del territorio desde Supabase (paridad con departamento.html).
// ============================================================================

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../core/theme/app_colors.dart';
import '../../../data/repositories/catalog_repository.dart';
import '../../../data/repositories/territory_repository.dart';
import '../../directory/models/place_model.dart';

class DepartmentLiveSection extends ConsumerWidget {
  final String departmentId;
  final String departmentName;

  const DepartmentLiveSection({
    super.key,
    required this.departmentId,
    required this.departmentName,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final id = TerritoryRepository.normalizeDepartmentId(departmentId);
    final territory = ref.watch(territoriesProvider).valueOrNull?[id];
    final catalogAsync = ref.watch(catalogSnapshotProvider);
    final destinations = (catalogAsync.valueOrNull?.places ?? const <PlaceModel>[])
        .where((place) => place.departmentId == id)
        .toList(growable: false);
    final municipalities =
        (catalogAsync.valueOrNull?.municipalities ?? const <CatalogMunicipality>[])
            .where((m) => m.departmentId == id)
            .toList(growable: false);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (territory != null && territory.shortDesc.isNotEmpty) ...[
          Text(
            territory.shortDesc,
            style: GoogleFonts.inter(fontSize: 12.5, color: Colors.white.withValues(alpha: 0.85), height: 1.5),
          ),
          const SizedBox(height: 14),
        ],
        if (territory != null && territory.places.isNotEmpty) ...[
          _heading('🧭 Lugares de $departmentName'),
          const SizedBox(height: 8),
          _PlacesStrip(
            key: ValueKey('strip_$id'),
            places: territory.places,
          ),
          const SizedBox(height: 4),
          Text(
            'Toca un lugar para ver su ficha.',
            style: GoogleFonts.inter(fontSize: 10.5, color: AppColors.textMuted),
          ),
          const SizedBox(height: 16),
        ],
        _heading('📍 Destinos verificados en el mapa'),
        const SizedBox(height: 8),
        if (catalogAsync.isLoading && !catalogAsync.hasValue)
          _note('Cargando destinos verificados…')
        else if (destinations.isEmpty)
          _note('Aún no hay destinos verificados de $departmentName publicados con coordenadas. Cuando el equipo los verifique en el Ops Center aparecerán aquí, en el mapa y en la web.')
        else
          ...destinations.map((place) => _DestinationTile(place: place)),
        if (municipalities.isNotEmpty) ...[
          const SizedBox(height: 14),
          _heading('🏘️ Municipios de $departmentName (${municipalities.length})'),
          const SizedBox(height: 8),
          ...municipalities.map((m) => _MunicipalityTile(municipality: m)),
          Text(
            'Contornos: geoBoundaries · © OpenStreetMap (ODbL). El área se calcula del contorno y puede incluir agua. Población, historia y fiestas patronales: por verificar con fuente oficial.',
            style: GoogleFonts.inter(fontSize: 10.5, color: AppColors.textMuted, height: 1.4),
          ),
        ],
        if (territory != null && territory.bestSeason.isNotEmpty) ...[
          const SizedBox(height: 14),
          _heading('🌤️ Mejor época'),
          const SizedBox(height: 4),
          _note(territory.bestSeason),
        ],
        if (territory != null && territory.howToReach.isNotEmpty) ...[
          const SizedBox(height: 12),
          _heading('🚌 Cómo llegar'),
          const SizedBox(height: 4),
          _note(territory.howToReach),
        ],
      ],
    );
  }

  static Widget _heading(String text) => Text(
        text,
        style: GoogleFonts.montserrat(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.goldLight),
      );

  static Widget _note(String text) => Text(
        text,
        style: GoogleFonts.inter(fontSize: 12, color: Colors.white70, height: 1.45),
      );
}

class _DestinationTile extends StatelessWidget {
  final PlaceModel place;

  const _DestinationTile({required this.place});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.bgDark,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderGold.withValues(alpha: 0.5)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  place.name,
                  style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white),
                ),
                const SizedBox(height: 2),
                Text(
                  [place.categoryName, if (place.verified) 'Verificado'].join(' · '),
                  style: GoogleFonts.inter(fontSize: 11, color: AppColors.goldLight),
                ),
              ],
            ),
          ),
          TextButton.icon(
            onPressed: () {
              final router = GoRouter.of(context);
              Navigator.of(context).maybePop();
              router.go(
                '/mapa?lat=${place.latitude}&lng=${place.longitude}&title=${Uri.encodeComponent(place.name)}',
              );
            },
            icon: const Icon(Icons.map_rounded, size: 16, color: AppColors.gold),
            label: Text('Ver en mapa', style: GoogleFonts.inter(fontSize: 11.5, color: AppColors.gold)),
          ),
        ],
      ),
    );
  }
}

class _MunicipalityTile extends StatelessWidget {
  final CatalogMunicipality municipality;

  const _MunicipalityTile({required this.municipality});

  @override
  Widget build(BuildContext context) {
    final area = municipality.areaKm2;
    final areaText = area == null
        ? null
        : '≈ ${area < 10 ? area.toStringAsFixed(1) : area.round()} km² (área del contorno)';
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.bgDark,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderGold.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            municipality.name,
            style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white),
          ),
          if (municipality.identity.isNotEmpty) ...[
            const SizedBox(height: 2),
            Text(
              municipality.identity,
              style: GoogleFonts.inter(fontSize: 11.5, color: Colors.white70, height: 1.4),
            ),
          ],
          if (areaText != null) ...[
            const SizedBox(height: 2),
            Text(areaText, style: GoogleFonts.inter(fontSize: 11, color: AppColors.goldLight)),
          ],
        ],
      ),
    );
  }
}

/// Franja horizontal en movimiento continuo (equivalente móvil de la Web).
class _PlacesStrip extends StatefulWidget {
  final List<TerritoryPlace> places;

  const _PlacesStrip({super.key, required this.places});

  @override
  State<_PlacesStrip> createState() => _PlacesStripState();
}

class _PlacesStripState extends State<_PlacesStrip> with SingleTickerProviderStateMixin {
  static const double _pixelsPerSecond = 28;
  final ScrollController _controller = ScrollController();
  late final Ticker _ticker;
  Duration _lastTick = Duration.zero;
  Timer? _resumeTimer;
  bool _paused = false;

  @override
  void initState() {
    super.initState();
    _ticker = createTicker(_onTick);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      if (!MediaQuery.of(context).disableAnimations) _ticker.start();
    });
  }

  @override
  void didUpdateWidget(covariant _PlacesStrip oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.places != widget.places && _controller.hasClients) {
      _controller.jumpTo(0);
    }
  }

  void _onTick(Duration elapsed) {
    final delta = elapsed - _lastTick;
    _lastTick = elapsed;
    if (_paused || !_controller.hasClients) return;
    final position = _controller.position;
    if (position.maxScrollExtent <= 0) return;
    // Lista duplicada: el periodo es la mitad del contenido total. Si el
    // contenido cabe en pantalla no hay nada que desplazar.
    final period = (position.maxScrollExtent + position.viewportDimension) / 2;
    if (period > position.maxScrollExtent) return;
    final seconds = delta.inMicroseconds / Duration.microsecondsPerSecond;
    final next = position.pixels + _pixelsPerSecond * seconds;
    _controller.jumpTo(next >= period ? next - period : next);
  }

  void _pause() {
    _paused = true;
    _resumeTimer?.cancel();
    _resumeTimer = Timer(const Duration(seconds: 4), () {
      if (mounted) _paused = false;
    });
  }

  void _openPlace(TerritoryPlace place) {
    _pause();
    showDialog<void>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        backgroundColor: const Color(0xFF082B35),
        title: Text(place.name, style: GoogleFonts.montserrat(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16)),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              if (place.type.isNotEmpty)
                Text(place.type, style: GoogleFonts.inter(color: AppColors.goldLight, fontSize: 12, fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              Text(place.desc, style: GoogleFonts.inter(color: Colors.white.withValues(alpha: 0.9), fontSize: 13, height: 1.5)),
            ],
          ),
        ),
        actions: [
          if (place.hasCoordinates)
            TextButton(
              onPressed: () {
                final router = GoRouter.of(context);
                Navigator.of(dialogContext).pop();
                router.go('/mapa?lat=${place.lat}&lng=${place.lng}&title=${Uri.encodeComponent(place.name)}');
              },
              child: const Text('Ver en mapa'),
            ),
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('Cerrar'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _resumeTimer?.cancel();
    _ticker.dispose();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final items = [...widget.places, ...widget.places];
    return RepaintBoundary(
      child: SizedBox(
        height: 92,
        child: Listener(
          onPointerDown: (_) => _pause(),
          child: ListView.separated(
            controller: _controller,
            scrollDirection: Axis.horizontal,
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(width: 10),
            itemBuilder: (context, index) {
              final place = items[index];
              return Semantics(
                button: true,
                label: 'Ver ficha de ${place.name}',
                child: InkWell(
                  key: ValueKey('place_${index}_${place.name}'),
                  borderRadius: BorderRadius.circular(14),
                  onTap: () => _openPlace(place),
                  child: Container(
                    width: 190,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.bgDark,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.borderGold.withValues(alpha: 0.6)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          place.name,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.w700, color: Colors.white),
                        ),
                        if (place.type.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Text(
                            place.type,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.inter(fontSize: 10.5, color: AppColors.goldLight),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
