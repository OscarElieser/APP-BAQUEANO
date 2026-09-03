// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — BARRA DE BÚSQUEDA Y FILTROS TEMÁTICOS
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Permitir al usuario explorar de forma intuitiva los contenidos de historia,
//   literatura, personajes, departamentos o platillos mediante búsqueda en tiempo real
//   o selección de filtros temáticos.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Campo de texto estilizado con prefijo de búsqueda e icono de borrado.
// - Chips de categorías temáticas con respuesta táctil y estados activos en terracota.
//
// 📦 3. QUÉ (WHAT / WIDGET EXPUESTO):
// - `CountrySearchFilterBar`: Buscador y carrusel de filtros de contenido.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';

class CountrySearchFilterBar extends StatefulWidget {
  final String activeCategory;
  final Function(String) onSearchChanged;
  final Function(String) onCategorySelected;

  const CountrySearchFilterBar({
    super.key,
    required this.activeCategory,
    required this.onSearchChanged,
    required this.onCategorySelected,
  });

  @override
  State<CountrySearchFilterBar> createState() => _CountrySearchFilterBarState();
}

class _CountrySearchFilterBarState extends State<CountrySearchFilterBar> {
  final TextEditingController _controller = TextEditingController();

  final List<String> _categories = [
    'TODOS',
    'HISTORIA',
    'DEPARTAMENTOS',
    'GASTRONOMÍA',
    'LITERATURA',
    'SÍMBOLOS',
    'NATURALEZA',
    'PERSONAJES',
  ];

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Campo de Búsqueda Universal
        Container(
          decoration: BoxDecoration(
            color: AppColors.bgCard,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.borderGold.withValues(alpha: 0.6), width: 1.0),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.2),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: TextField(
            controller: _controller,
            onChanged: widget.onSearchChanged,
            style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 13.5),
            decoration: InputDecoration(
              hintText: '¿Qué quieres conocer de Nicaragua? (personas, comidas, poetas, volcanes...)',
              hintStyle: GoogleFonts.inter(color: AppColors.textMuted, fontSize: 12.5),
              prefixIcon: const Icon(Icons.search_rounded, color: AppColors.gold, size: 22),
              suffixIcon: _controller.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear_rounded, color: AppColors.textMuted, size: 18),
                      onPressed: () {
                        _controller.clear();
                        widget.onSearchChanged('');
                        setState(() {});
                      },
                    )
                  : null,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            ),
          ),
        ),

        const SizedBox(height: 14),

        // Filtros de Categoría
        SizedBox(
          height: 38,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: _categories.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (context, index) {
              final cat = _categories[index];
              final isSelected = cat == widget.activeCategory;

              return FilterChip(
                selected: isSelected,
                label: Text(cat),
                labelStyle: GoogleFonts.spaceGrotesk(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: isSelected ? Colors.white : AppColors.textLight,
                  letterSpacing: 0.5,
                ),
                selectedColor: AppColors.terracotta,
                backgroundColor: AppColors.bgCard,
                side: BorderSide(
                  color: isSelected ? AppColors.gold : AppColors.borderLight,
                  width: isSelected ? 1.5 : 0.8,
                ),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                onSelected: (val) {
                  HapticFeedback.selectionClick();
                  widget.onCategorySelected(cat);
                },
              );
            },
          ),
        ),
      ],
    );
  }
}
