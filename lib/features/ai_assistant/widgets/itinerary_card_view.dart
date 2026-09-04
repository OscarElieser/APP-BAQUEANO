// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — TARJETA VISUAL DE ITINERARIO OPERACIONAL
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Presentar al explorador un desglose claro, ordenado y visualmente atractivo
//   de su plan de expedición por días, horarios, costos y dificultades.
// - Eliminar la incertidumbre del viaje mostrando botones directos de acción:
//   "Ver en Mapa" (centrado en coordenadas) y "Ficha Oficial" del lugar.
// - Garantizar transparencia presupuestaria bimoneda (USD / NIO) y trazabilidad
//   de verificación oficial de Baqueano.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Widget reactivo `StatelessWidget` con arquitectura Glassmorphism sutil.
// - Paleta de colores oficial: `#165D6F`, `#F65E01`, `#F4E6C1`, `#0F172A`.
// - Renderizado con `.withValues(alpha: X)` y badge de confianza auditado.
// - Acciones interactivas conectadas a `onOpenMap` y `onViewPlace`.
//
// 📦 3. QUÉ (WHAT / WIDGET & PROPIEDADES):
// - `ItineraryCardView`: Widget contenedor de itinerario completo con pestañas o acordeón de días.
// - `_ActivityTimelineTile`: Elemento de línea de tiempo por actividad.
// ============================================================================

import 'package:flutter/material.dart';
import '../models/itinerary_model.dart';

class ItineraryCardView extends StatefulWidget {
  final Itinerary itinerary;
  final VoidCallback? onRecalculateCheaper;
  final void Function(double lat, double lng, String title)? onOpenMap;
  final void Function(String placeId)? onViewPlace;

  const ItineraryCardView({
    super.key,
    required this.itinerary,
    this.onRecalculateCheaper,
    this.onOpenMap,
    this.onViewPlace,
  });

  @override
  State<ItineraryCardView> createState() => _ItineraryCardViewState();
}

class _ItineraryCardViewState extends State<ItineraryCardView> {
  int _selectedDayIndex = 0;

  static const Color _petroleoTeal = Color(0xFF165D6F);
  static const Color _naranjaFuego = Color(0xFFF65E01);
  static const Color _cremaArena = Color(0xFFF4E6C1);
  static const Color _nocheProfunda = Color(0xFF0F172A);

  @override
  Widget build(BuildContext context) {
    final itn = widget.itinerary;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: _petroleoTeal.withValues(alpha: 0.25),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 1. Cabecera Principal del Itinerario
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  _petroleoTeal,
                  _petroleoTeal.withValues(alpha: 0.85),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(18),
                topRight: Radius.circular(18),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: _naranjaFuego,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        itn.confidence.label,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    Text(
                      '${itn.numberOfDays} ${itn.numberOfDays == 1 ? "día" : "días"} • ${itn.travelers} viajeros',
                      style: TextStyle(
                        color: _cremaArena.withValues(alpha: 0.9),
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  itn.title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    letterSpacing: -0.3,
                  ),
                ),
                const SizedBox(height: 10),
                // Resumen Financiero Bimoneda
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Costo Estimado Total',
                            style: TextStyle(
                              color: _cremaArena.withValues(alpha: 0.8),
                              fontSize: 11,
                            ),
                          ),
                          Text(
                            '\$${itn.totalEstimatedCostUsd.toStringAsFixed(0)} USD (~C\$ ${itn.totalEstimatedCostNio.toStringAsFixed(0)} NIO)',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: _cremaArena.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          itn.travelStyle.label,
                          style: const TextStyle(
                            color: _cremaArena,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // 2. Selector de Días (Tabs Horizontales)
          if (itn.days.length > 1)
            Container(
              height: 48,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: itn.days.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, idx) {
                  final isSelected = idx == _selectedDayIndex;
                  return ChoiceChip(
                    label: Text('Día ${idx + 1}'),
                    selected: isSelected,
                    selectedColor: _petroleoTeal,
                    backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : (isDark ? Colors.white70 : _nocheProfunda),
                      fontSize: 12,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                    ),
                    onSelected: (selected) {
                      if (selected) {
                        setState(() => _selectedDayIndex = idx);
                      }
                    },
                  );
                },
              ),
            ),

          // 3. Actividades del Día Seleccionado
          if (itn.days.isNotEmpty) ...[
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    itn.days[_selectedDayIndex].title,
                    style: TextStyle(
                      color: isDark ? Colors.white : _nocheProfunda,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ...itn.days[_selectedDayIndex].activities.map(
                    (act) => _buildActivityTile(context, act, isDark),
                  ),
                ],
              ),
            ),
          ],

          // 4. Recomendaciones de Alimentación y Hospedaje
          if (itn.days.isNotEmpty && itn.days[_selectedDayIndex].mealsRecommendation != null)
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: _cremaArena.withValues(alpha: isDark ? 0.08 : 0.4),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: _petroleoTeal.withValues(alpha: 0.15),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.restaurant, size: 16, color: _naranjaFuego),
                      const SizedBox(width: 6),
                      Text(
                        'Gastronomía recomendada:',
                        style: TextStyle(
                          color: isDark ? Colors.white70 : _nocheProfunda,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    itn.days[_selectedDayIndex].mealsRecommendation!,
                    style: TextStyle(
                      color: isDark ? Colors.white60 : Colors.black.withValues(alpha: 0.85),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),

          // 5. Botones de Acción: Ajuste de Presupuesto
          Padding(
            padding: const EdgeInsets.all(16),
            child: Wrap(
              spacing: 10,
              runSpacing: 10,
              alignment: WrapAlignment.spaceBetween,
              children: [
                if (widget.onRecalculateCheaper != null)
                  OutlinedButton.icon(
                    onPressed: widget.onRecalculateCheaper,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: _naranjaFuego,
                      side: const BorderSide(color: _naranjaFuego, width: 1.5),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    ),
                    icon: const Icon(Icons.savings_outlined, size: 18),
                    label: const Text(
                      'Optimizar Más Barato',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
                Text(
                  'Tasa: 1 USD = ${itn.exchangeRate.toStringAsFixed(2)} NIO',
                  style: TextStyle(
                    color: isDark ? Colors.white38 : Colors.black45,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActivityTile(BuildContext context, ItineraryActivity act, bool isDark) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A).withValues(alpha: 0.6) : const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: Colors.grey.withValues(alpha: isDark ? 0.2 : 0.15),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _petroleoTeal.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  act.timeSlot,
                  style: const TextStyle(
                    color: _petroleoTeal,
                    fontWeight: FontWeight.bold,
                    fontSize: 11,
                  ),
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: _getDifficultyColor(act.difficulty).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  act.difficulty.label,
                  style: TextStyle(
                    color: _getDifficultyColor(act.difficulty),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            act.title,
            style: TextStyle(
              color: isDark ? Colors.white : _nocheProfunda,
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            act.description,
            style: TextStyle(
              color: isDark ? Colors.white70 : Colors.black.withValues(alpha: 0.85),
              fontSize: 12,
              height: 1.35,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Icon(Icons.directions_walk, size: 14, color: isDark ? Colors.white38 : Colors.black45),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  act.transportMode,
                  style: TextStyle(
                    color: isDark ? Colors.white54 : Colors.black54,
                    fontSize: 11,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Text(
                act.estimatedCostUsd > 0
                    ? '\$${act.estimatedCostUsd.toStringAsFixed(0)} USD'
                    : 'Acceso Libre',
                style: const TextStyle(
                  color: _naranjaFuego,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
            ],
          ),
          // Botones de acción (Mapa y Ficha)
          if (act.latitude != null || act.placeId != null) ...[
            const SizedBox(height: 8),
            const Divider(height: 1),
            const SizedBox(height: 6),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                if (act.latitude != null && act.longitude != null && widget.onOpenMap != null)
                  TextButton.icon(
                    onPressed: () => widget.onOpenMap!(act.latitude!, act.longitude!, act.title),
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    icon: const Icon(Icons.map_outlined, size: 15, color: _petroleoTeal),
                    label: const Text(
                      'Ver en Mapa',
                      style: TextStyle(color: _petroleoTeal, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                if (act.placeId != null && widget.onViewPlace != null) ...[
                  const SizedBox(width: 8),
                  TextButton.icon(
                    onPressed: () => widget.onViewPlace!(act.placeId!),
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    icon: const Icon(Icons.info_outline, size: 15, color: _naranjaFuego),
                    label: const Text(
                      'Ficha Oficial',
                      style: TextStyle(color: _naranjaFuego, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ],
      ),
    );
  }

  Color _getDifficultyColor(PhysicalDifficulty diff) {
    switch (diff) {
      case PhysicalDifficulty.muyFacil:
      case PhysicalDifficulty.facil:
        return const Color(0xFF10B981); // Esmeralda Verde
      case PhysicalDifficulty.moderada:
        return const Color(0xFFF59E0B); // Ámbar
      case PhysicalDifficulty.dificil:
      case PhysicalDifficulty.muyDificil:
        return const Color(0xFFEF4444); // Carmín
    }
  }
}
