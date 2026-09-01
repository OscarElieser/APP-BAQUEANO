// ============================================================================
// 🏷️ CHIP INTERACTIVO DE FILTRADO Y CATEGORÍAS (BADGE_CHIP.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Permitir a los exploradores filtrar destinos, departamentos y actividades
//   de ecoturismo con un solo toque (single-tap filtering) de manera ergonómica.
// - Proporcionar retroalimentación visual clara e inmediata sobre qué filtro
//   se encuentra activo en la búsqueda actual.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `AnimatedContainer` con interpolación de color y sombra en 200 milisegundos.
// - Transición de borde dorado brillante y fondo terracota cuando `isSelected == true`.
// - Soporte opcional para iconos vectoriales a la izquierda del texto.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `BadgeChip`: Widget reutilizable para listas horizontales de filtros y etiquetas.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_colors.dart';

class BadgeChip extends StatelessWidget {
  /// Texto de la categoría o departamento (ej: "Matagalpa", "Volcanes").
  final String label;

  /// Icono opcional que acompaña la etiqueta.
  final IconData? icon;

  /// Color de fondo personalizado.
  final Color? color;

  /// Color del texto e icono personalizado.
  final Color? textColor;

  /// Indica si el chip está seleccionado activamente por el usuario.
  final bool isSelected;

  /// Callback ejecutado al tocar el chip para conmutar el filtro.
  final VoidCallback? onTap;

  const BadgeChip({
    super.key,
    required this.label,
    this.icon,
    this.color,
    this.textColor,
    this.isSelected = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    // Cálculo dinámico del color según el estado de selección
    final effectiveColor = color ?? (isSelected ? AppColors.terracotta : AppColors.primaryLight);
    final effectiveTextColor = textColor ?? (isSelected ? Colors.white : AppColors.textLight);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: AnimatedContainer(
        // Duración de la animación de transición de selección
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          // Fondo más opaco cuando está seleccionado para máximo contraste
          color: effectiveColor.withValues(alpha: isSelected ? 0.9 : 0.4),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.gold : AppColors.borderLight,
            width: isSelected ? 1.2 : 0.8,
          ),
          // Sombra de elevación activa únicamente en estado seleccionado
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.terracotta.withValues(alpha: 0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Icono opcional
            if (icon != null) ...[
              Icon(icon, size: 14, color: effectiveTextColor),
              const SizedBox(width: 6),
            ],
            // Texto estilizado con Space Grotesk
            Text(
              label,
              style: GoogleFonts.spaceGrotesk(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: effectiveTextColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
