// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PORTAL DE REDIRECCIÓN ADMINISTRATIVA
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Mantener una estricta separación de responsabilidades entre la experiencia del
//   turista (Baqueano App) y el Centro de Control Web (Baqueano Admin Web).
// - Informar con elegancia y transparencia al usuario sobre la arquitectura
//   independiente del ecosistema si accede por enlace directo a la ruta `/admin`.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Interfaz responsiva con `ResponsiveScaffold` y paleta volcánica (#082B35, #C86432).
// - Enlace directo hacia la URL del portal web administrativo independiente vía `url_launcher`.
// - Botón de retorno inmediato al feed principal de exploración.
//
// 📦 3. QUÉ (WHAT / WIDGET EXPUESTO):
// - `AdminScreen`: Pantalla de aviso de desacoplamiento y enlace al Admin Web.
// ============================================================================

// BAQUEANO
// ARCHIVO: admin_screen.dart
// MÓDULO: Arquitectura & Enrutamiento
// PROYECTO: APP (Consumidor)
// INTEGRACIÓN: GoRouter (`/admin`) y Baqueano Admin Web
// CONSUMIDO POR: AppRouter
// RESPONSABILIDAD: Redirigir y educar sobre la separación del centro de control.
// NO CONTIENE: Formularios CRUD administrativos ni manipulación de datos.

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/baqueano_button.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/responsive_scaffold.dart';

class AdminScreen extends StatelessWidget {
  const AdminScreen({super.key});

  Future<void> _openAdminWeb(BuildContext context) async {
    final uri = Uri.parse('http://localhost:8086/#/dashboard');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Accede a Baqueano Admin Web desde su puerto dedicado.'),
              backgroundColor: AppColors.primaryLight,
            ),
          );
        }
      }
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Portal administrativo disponible en el módulo web independiente.'),
            backgroundColor: AppColors.primaryLight,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    return ResponsiveScaffold(
      currentIndex: 0,
      body: Center(
        child: SingleChildScrollView(
          padding: EdgeInsets.symmetric(
            horizontal: isDesktop ? 64.0 : 24.0,
            vertical: 40.0,
          ),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 720),
            child: GlassContainer(
              padding: const EdgeInsets.all(32),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppColors.borderGold),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Icono de Centro de Control
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      color: AppColors.terracotta.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.terracotta, width: 2),
                    ),
                    child: const Center(
                      child: Text('🧭', style: TextStyle(fontSize: 34)),
                    ),
                  ),
                  const SizedBox(height: 24),

                  Text(
                    'CENTRO DE CONTROL BAQUEANO',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 2.0,
                      color: AppColors.gold,
                    ),
                  ),
                  const SizedBox(height: 8),

                  Text(
                    'Portal Administrativo Independiente',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.montserrat(
                      fontSize: isDesktop ? 26 : 20,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 16),

                  Text(
                    'Por directriz de arquitectura, la administración, auditoría, publicación de negocios y gestión multimedia se realiza exclusivamente desde la Web Administrativa independiente.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      color: AppColors.textMuted,
                      height: 1.6,
                    ),
                  ),
                  const SizedBox(height: 12),

                  Text(
                    'Esta aplicación está dedicada 100% a la exploración, mapas, expediciones campesinas y pasaporte cultural del turista.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: AppColors.goldLight,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Botones de Acción
                  Wrap(
                    spacing: 16,
                    runSpacing: 12,
                    alignment: WrapAlignment.center,
                    children: [
                      BaqueanoButton(
                        text: '🌐 Abrir Baqueano Admin Web',
                        variant: BaqueanoButtonVariant.primary,
                        onPressed: () => _openAdminWeb(context),
                      ),
                      BaqueanoButton(
                        text: 'Volver a Explorar',
                        variant: BaqueanoButtonVariant.outline,
                        onPressed: () => context.go('/home'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
