// ============================================================================
// 🏷️ ENCABEZADO MODULAR DE SECCIONES CON TAG & SUBTÍTULO (SECTION_HEADER.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Estandarizar la jerarquía visual de los títulos en cada pantalla del catálogo,
//   home y módulos institucionales, guiando la lectura del explorador.
// - Transmitir la narrativa de cada sección mediante un badge temático (tag),
//   un título contundente en Montserrat y un subtítulo explicativo en Inter.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Badge superior estilizado con borde terracota y fondo al 15% alfa.
// - Alineación condicional (centrado para pantallas de bienvenida, alineado a la izquierda para feeds).
// - Soporte para widget interactivo a la derecha (`trailing`) como botones de "Ver Todo" o selectores.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `SectionHeader`: Componente reusable presente en las 16 pantallas del sistema.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_colors.dart';

class SectionHeader extends StatelessWidget {
  /// Etiqueta superior corta en mayúsculas (ej: "PATRIMONIO SONORO", "SABORES ANCESTRALES").
  final String tag;

  /// Título principal de la sección (ej: "🍽️ Gastronomía Autóctona de Nicaragua").
  final String title;

  /// Subtítulo descriptivo contextual (opcional).
  final String? subtitle;

  /// Si es true, centra todo el contenido horizontalmente.
  final bool isCentered;

  /// Widget opcional en la esquina superior derecha (ej: botón "Ver Todos →").
  final Widget? trailing;

  const SectionHeader({
    super.key,
    required this.tag,
    required this.title,
    this.subtitle,
    this.isCentered = false,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16.0),
      child: Column(
        crossAxisAlignment:
            isCentered ? CrossAxisAlignment.center : CrossAxisAlignment.start,
        children: [
          // Fila superior con el Tag Pill y el widget trailing opcional
          Row(
            mainAxisAlignment:
                isCentered ? MainAxisAlignment.center : MainAxisAlignment.spaceBetween,
            children: [
              // Badge/Pill envuelto en Flexible para evitar overflow en pantallas compactas
              Flexible(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.terracotta.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: AppColors.terracotta.withValues(alpha: 0.4),
                      width: 1,
                    ),
                  ),
                  child: Text(
                    tag.toUpperCase(),
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.2,
                      color: AppColors.terracottaLight,
                    ),
                    overflow: TextOverflow.ellipsis,
                    maxLines: 1,
                  ),
                ),
              ),
              // Trailing opcional
              if (trailing != null && !isCentered) trailing!,
            ],
          ),
          const SizedBox(height: 8),
          // Título principal con tipografía display
          Text(
            title,
            style: Theme.of(context).textTheme.displaySmall?.copyWith(
                  fontSize: 26,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.5,
                ),
            textAlign: isCentered ? TextAlign.center : TextAlign.start,
          ),
          // Subtítulo contextual explicativo
          if (subtitle != null) ...[
            const SizedBox(height: 6),
            Text(
              subtitle!,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.textMuted,
                    fontSize: 14,
                  ),
              textAlign: isCentered ? TextAlign.center : TextAlign.start,
            ),
          ],
        ],
      ),
    );
  }
}
