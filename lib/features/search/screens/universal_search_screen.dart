// ============================================================================
// 🔍 MOTOR DE BÚSQUEDA UNIVERSAL & FILTROS MULTI-CRITERIO (UNIVERSAL_SEARCH_SCREEN.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia de exploración instantánea y multidimensional
//   donde el usuario pueda encontrar cualquier destino, negocio o experiencia
//   según su presupuesto, nivel de exigencia física, microclima y departamento.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Controlador de texto reactivo con debounce y filtrado compuesto en memoria
//   sobre el catálogo de `DestinationModel.mockDestinations`.
// - Soporte para selección de chips de categorías, slider de presupuesto bimoneda
//   y selector de dificultad de travesía.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGETS EXPUESTOS):
// - `UniversalSearchScreen`: Pantalla completa de búsqueda con filtros activos.
// ============================================================================

import 'dart:async';
import 'package:flutter/material.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/models/destination_model.dart';

class UniversalSearchScreen extends StatefulWidget {
  const UniversalSearchScreen({super.key});

  @override
  State<UniversalSearchScreen> createState() => _UniversalSearchScreenState();
}

class _UniversalSearchScreenState extends State<UniversalSearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounceTimer;
  String _selectedCategory = 'Todos';
  String _selectedDifficulty = 'Todas';
  final double _maxPriceUsd = 200.0;
  String _searchQuery = '';

  final List<String> _categories = [
    'Todos',
    'volcanes',
    'cascadas',
    'playas',
    'lodges',
    'colonial',
  ];

  final List<String> _difficulties = [
    'Todas',
    'Fácil',
    'Moderado',
    'Exigente',
  ];

  void _onSearchChanged(String val) {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 300), () {
      if (mounted) {
        setState(() => _searchQuery = val);
      }
    });
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  List<DestinationModel> get _filteredDestinations {
    return CatalogData.destinations.where((destination) {
      // Filtro por texto
      final matchesQuery = _searchQuery.isEmpty ||
          destination.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          destination.department.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          destination.description.toLowerCase().contains(_searchQuery.toLowerCase());

      // Filtro por categoría
      final matchesCategory = _selectedCategory == 'Todos' ||
          destination.category.toLowerCase() == _selectedCategory.toLowerCase();

      // Filtro por dificultad
      final matchesDifficulty = _selectedDifficulty == 'Todas' ||
          destination.difficulty.toLowerCase() == _selectedDifficulty.toLowerCase();

      // Filtro por precio
      final matchesPrice = destination.priceUsd <= _maxPriceUsd;

      return matchesQuery && matchesCategory && matchesDifficulty && matchesPrice;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final results = _filteredDestinations;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF082B35),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        title: const Text(
          'Explorador Universal',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w800,
            fontSize: 18,
          ),
        ),
      ),
      body: Column(
        children: [
          // Barra de Búsqueda Superior
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF082B35),
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(24),
                bottomRight: Radius.circular(24),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.3),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: [
                TextField(
                  controller: _searchController,
                  onChanged: _onSearchChanged,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    hintText: 'Buscar volcanes, playas, lodges o departamentos...',
                    hintStyle: TextStyle(
                      color: Colors.white.withValues(alpha: 0.45),
                      fontSize: 13,
                    ),
                    prefixIcon: const Icon(
                      Icons.search_rounded,
                      color: Color(0xFFD4AF37),
                    ),
                    suffixIcon: _searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.close_rounded,
                                color: Colors.white70),
                            onPressed: () {
                              _searchController.clear();
                              setState(() => _searchQuery = '');
                            },
                          )
                        : null,
                    filled: true,
                    fillColor: const Color(0xFF1E293B),
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),

                const SizedBox(height: 12),

                // Chips de Categoría
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  child: Row(
                    children: _categories.map((cat) {
                      final isSelected = _selectedCategory == cat;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: FilterChip(
                          label: Text(
                            cat.toUpperCase(),
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: isSelected
                                  ? Colors.white
                                  : const Color(0xFF94A3B8),
                            ),
                          ),
                          selected: isSelected,
                          onSelected: (selected) {
                            setState(() => _selectedCategory = cat);
                          },
                          backgroundColor: const Color(0xFF1E293B),
                          selectedColor: const Color(0xFFC86432),
                          checkmarkColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                            side: BorderSide(
                              color: isSelected
                                  ? const Color(0xFFC86432)
                                  : Colors.transparent,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),

          // Filtros Rápidos de Dificultad y Presupuesto
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Selector de Dificultad
                Row(
                  children: [
                    const Icon(Icons.terrain_rounded,
                        color: Color(0xFFD4AF37), size: 18),
                    const SizedBox(width: 6),
                    DropdownButton<String>(
                      value: _selectedDifficulty,
                      dropdownColor: const Color(0xFF1E293B),
                      underline: const SizedBox(),
                      icon: const Icon(Icons.keyboard_arrow_down_rounded,
                          color: Color(0xFFD4AF37)),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                      items: _difficulties.map((diff) {
                        return DropdownMenuItem(
                          value: diff,
                          child: Text('Dificultad: $diff'),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) setState(() => _selectedDifficulty = val);
                      },
                    ),
                  ],
                ),

                // Presupuesto Máximo
                Text(
                  'Hasta \$${_maxPriceUsd.toInt()} USD',
                  style: const TextStyle(
                    color: Color(0xFF38BDF8),
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),

          // Lista de Resultados
          Expanded(
            child: results.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.travel_explore_rounded,
                          size: 64,
                          color: Colors.white.withValues(alpha: 0.2),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'No se encontraron destinos',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.7),
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Prueba ajustando los filtros o el término de búsqueda',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.4),
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    itemCount: results.length,
                    itemBuilder: (context, index) {
                      final item = results[index];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 14),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(
                            color: const Color(0xFFD4AF37).withValues(alpha: 0.2),
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.25),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            // Imagen / Miniatura
                            ClipRRect(
                              borderRadius: BorderRadius.circular(14),
                              child: Container(
                                width: 85,
                                height: 85,
                                color: const Color(0xFF082B35),
                                child: Image.network(
                                  item.imageUrl,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => const Icon(
                                    Icons.landscape_rounded,
                                    color: Color(0xFFD4AF37),
                                    size: 32,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 14),
                            // Información
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          item.title,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 15,
                                            fontWeight: FontWeight.w800,
                                          ),
                                        ),
                                      ),
                                      Row(
                                        children: [
                                          const Icon(Icons.star_rounded,
                                              color: Color(0xFFD4AF37),
                                              size: 16),
                                          const SizedBox(width: 2),
                                          Text(
                                            item.rating.toString(),
                                            style: const TextStyle(
                                              color: Color(0xFFD4AF37),
                                              fontSize: 12,
                                              fontWeight: FontWeight.w700,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '${item.department} • ${item.duration}',
                                    style: TextStyle(
                                      color: Colors.white.withValues(alpha: 0.55),
                                      fontSize: 12,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 8, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF082B35),
                                          borderRadius:
                                              BorderRadius.circular(8),
                                        ),
                                        child: Text(
                                          item.difficulty,
                                          style: const TextStyle(
                                            color: Color(0xFF38BDF8),
                                            fontSize: 10,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      ),
                                      Text(
                                        '\$${item.priceUsd.toInt()} USD / C\$${item.priceNio.toInt()}',
                                        style: const TextStyle(
                                          color: Color(0xFFD4AF37),
                                          fontSize: 12,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
