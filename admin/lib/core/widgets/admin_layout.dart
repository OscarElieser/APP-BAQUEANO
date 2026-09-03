// ============================================================================
// 🧭 BAQUEANO ADMIN — ESTRUCTURA Y LAYOUT DEL PANEL DE CONTROL
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia de gestión de nivel profesional optimizada para
//   escritorio y tablets, con navegación fluida por barra lateral (sidebar)
//   y barra de estado en tiempo real.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Layout responsivo con `Row` (Sidebar fija + Contenido expandido).
// - Menú lateral con indicador activo en Oro Pinolero y Terracota.
// - Acceso directo para probar la App pública de turistas en otra pestaña.
//
// 📦 3. QUÉ (WHAT / WIDGET EXPUESTO):
// - `AdminLayout`: Contenedor maestro de la Web Administrativa.
// ============================================================================

// BAQUEANO
// ARCHIVO: admin_layout.dart
// MÓDULO: Navegación & Layout Administrativo
// PROYECTO: ADMIN WEB
// INTEGRACIÓN: GoRouter y navegación de escritorio
// CONSUMIDO POR: Todas las pantallas del panel administrativo
// RESPONSABILIDAD: Ofrecer la barra lateral de navegación y cabecera de control.
// NO CONTIENE: Lógica de negocio específica.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../theme/admin_colors.dart';

class AdminLayout extends StatelessWidget {
  final Widget child;
  final String currentRoute;

  const AdminLayout({
    super.key,
    required this.child,
    required this.currentRoute,
  });

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isCompact = screenWidth < 900;

    return Scaffold(
      backgroundColor: AdminColors.bgDark,
      body: Row(
        children: [
          // SIDEBAR DE NAVEGACIÓN
          if (!isCompact) _buildSidebar(context),

          // ÁREA DE CONTENIDO
          Expanded(
            child: Column(
              children: [
                _buildTopNavbar(context, isCompact),
                Expanded(child: child),
              ],
            ),
          ),
        ],
      ),
      drawer: isCompact ? Drawer(child: _buildSidebar(context)) : null,
    );
  }

  Widget _buildTopNavbar(BuildContext context, bool isCompact) {
    return Container(
      height: 64,
      padding: const EdgeInsets.symmetric(horizontal: 24),
      decoration: BoxDecoration(
        color: AdminColors.primaryDark,
        border: const Border(bottom: BorderSide(color: AdminColors.borderLight)),
      ),
      child: Row(
        children: [
          if (isCompact)
            Builder(
              builder: (ctx) => IconButton(
                icon: const Icon(Icons.menu_rounded, color: Colors.white),
                onPressed: () => Scaffold.of(ctx).openDrawer(),
              ),
            ),
          const SizedBox(width: 8),

          // Título de sección activa
          Text(
            'CENTRO DE CONTROL BAQUEANO',
            style: GoogleFonts.spaceGrotesk(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.2,
              color: AdminColors.gold,
            ),
          ),

          const Spacer(),

          // Badge de Estado Cloud
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AdminColors.statusPublished.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AdminColors.statusPublished.withValues(alpha: 0.5)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: AdminColors.statusPublished,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  'FIRESTORE EN VIVO',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: AdminColors.statusPublished,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(width: 14),

          // Botón "Ver App Turista"
          OutlinedButton.icon(
            onPressed: () async {
              final uri = Uri.parse('http://localhost:8085/#/home');
              if (await canLaunchUrl(uri)) {
                await launchUrl(uri);
              }
            },
            icon: const Icon(Icons.open_in_new_rounded, size: 14, color: AdminColors.goldLight),
            label: Text(
              '📱 Ver App PWA',
              style: GoogleFonts.spaceGrotesk(fontSize: 11.5, fontWeight: FontWeight.w700, color: Colors.white),
            ),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: AdminColors.borderGold),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSidebar(BuildContext context) {
    return Container(
      width: 260,
      decoration: BoxDecoration(
        color: AdminColors.primaryDark,
        border: const Border(right: BorderSide(color: AdminColors.borderLight)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header del Logo
          Padding(
            padding: const EdgeInsets.all(24),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AdminColors.terracotta,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text('🧭', style: TextStyle(fontSize: 20)),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'BAQUEANO',
                      style: GoogleFonts.montserrat(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.5,
                        color: Colors.white,
                      ),
                    ),
                    Text(
                      'ADMINISTRACIÓN',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.0,
                        color: AdminColors.gold,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const Divider(color: AdminColors.borderLight, height: 1),

          // Enlaces de Navegación del Panel
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 12),
              children: [
                _buildNavItem(context, Icons.dashboard_rounded, 'Dashboard', '/dashboard'),
                _buildNavItem(context, Icons.storefront_rounded, 'Negocios & Locales', '/negocios'),
                _buildNavItem(context, Icons.explore_rounded, 'Destinos & Rutas', '/destinos'),
                _buildNavItem(context, Icons.menu_book_rounded, 'Historia de mi país', '/historia'),
                _buildNavItem(context, Icons.photo_library_rounded, 'Centro Multimedia', '/multimedia'),
                _buildNavItem(context, Icons.manage_accounts_rounded, 'Usuarios & Roles', '/usuarios'),
                _buildNavItem(context, Icons.settings_rounded, 'Ajustes & Auditoría', '/ajustes'),
              ],
            ),
          ),

          // Footer de Versión
          Padding(
            padding: const EdgeInsets.all(16),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AdminColors.bgCard,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AdminColors.borderLight),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('BAQUEANO v2.0 ADMIN', style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.w800, color: AdminColors.gold)),
                  const SizedBox(height: 2),
                  Text('Control Centralizado de Ecosistema', style: GoogleFonts.inter(fontSize: 9.5, color: AdminColors.textMuted)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem(BuildContext context, IconData icon, String title, String route) {
    final isSelected = currentRoute == route;

    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: InkWell(
        onTap: () {
          HapticFeedback.selectionClick();
          context.go(route);
        },
        borderRadius: BorderRadius.circular(12),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? AdminColors.terracotta.withValues(alpha: 0.2) : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? AdminColors.gold : Colors.transparent,
              width: 1.0,
            ),
          ),
          child: Row(
            children: [
              Icon(
                icon,
                size: 20,
                color: isSelected ? AdminColors.goldLight : AdminColors.textMuted,
              ),
              const SizedBox(width: 12),
              Text(
                title,
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 13,
                  fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                  color: isSelected ? Colors.white : AdminColors.textLight,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
