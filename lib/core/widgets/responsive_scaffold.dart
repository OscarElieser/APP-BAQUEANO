// ============================================================================
// 📱 CONTENEDOR MAESTRO ADAPTATIVO & RESPONSIVE (RESPONSIVE_SCAFFOLD.DART)
// ============================================================================
//
// 🎯 POR QUÉ (WHY / PROPÓSITO):
// Ofrecer una navegación uniforme y ergonómica que se adapte fluidamente a cualquier
// pantalla: teléfonos móviles con barras de gestos, tablets plegables y pantallas
// panorámicas de escritorio, manteniendo siempre la identidad visual de Baqueano.
//
// ⚙️ CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Detecta breakpoints dinámicos (`screenWidth >= 950` para modo Desktop/Web).
// - En Móvil: AppBar compacta, Menú lateral (Drawer de 12 secciones) y barra flotante
//   inferior con `SafeArea(bottom: true)` y glassmorphism.
// - En Desktop: Barra de anuncios superior (`Announcement Ribbon`), Navbar fija con
//   menús desplegables (`Explorar`, `Nosotros`), selector de idioma y botón `INGRESAR`.
//
// 📦 QUÉ (WHAT / ENTREGABLE):
// Scaffold universal que envuelve las pantallas de la aplicación con modales de
// autenticación, transiciones de navegación GoRouter y notificaciones toast.
// ============================================================================

import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/app_lifecycle_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_gradients.dart';
import 'baqueano_button.dart';
import 'baqueano_logo.dart';
import 'custom_toast.dart';
import 'glass_container.dart';
import 'sos_safety_modal.dart';
import 'universal_search_modal.dart';

class ResponsiveScaffold extends StatefulWidget {
  final Widget body;
  final int currentIndex;

  const ResponsiveScaffold({
    super.key,
    required this.body,
    this.currentIndex = 0,
  });

  @override
  State<ResponsiveScaffold> createState() => _ResponsiveScaffoldState();
}

class _ResponsiveScaffoldState extends State<ResponsiveScaffold> {
  String _selectedLanguage = 'ES';

  void _onBottomNavTapped(int index) {
    switch (index) {
      case 0:
        context.go('/home');
        break;
      case 1:
        context.go('/descubrir');
        break;
      case 2:
        context.go('/mapa');
        break;
      case 3:
        context.go('/ai');
        break;
      case 4:
        context.go('/perfil');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;

        // Si el usuario está en otra pestaña principal (ej. Descubrir, Mapa), regresar a Home
        if (widget.currentIndex != 0) {
          context.go('/home');
        } else {
          // Si ya está en Home y presiona Atrás, mover a segundo plano sin destruir la app.
          // Esto preserva el estado, música y posición. Solo se reiniciará si el usuario
          // borra la aplicación de la lista de tareas recientes de Android.
          AppLifecycleService.moveToBackground();
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.bgDark,
        extendBody: true,
        drawer: isDesktop ? null : _buildDrawer(context),
        appBar: isDesktop
            ? PreferredSize(
                preferredSize: const Size.fromHeight(110),
                child: _buildDesktopNavbar(context),
              )
            : PreferredSize(
                preferredSize: const Size.fromHeight(60),
                child: _buildMobileAppBar(context),
              ),
        body: widget.body,
        bottomNavigationBar: isDesktop ? null : _buildFloatingBottomNav(context),
      ),
    );
  }

  // --- MOBILE APP BAR ---
  Widget _buildMobileAppBar(BuildContext context) {
    return AppBar(
      backgroundColor: AppColors.bgDark.withValues(alpha: 0.85),
      elevation: 0,
      centerTitle: false,
      leading: Builder(
        builder: (context) => IconButton(
          icon: const Icon(Icons.menu_rounded, color: AppColors.goldLight, size: 26),
          onPressed: () => Scaffold.of(context).openDrawer(),
        ),
      ),
      title: FittedBox(
        fit: BoxFit.scaleDown,
        alignment: Alignment.centerLeft,
        child: BaqueanoLogo(
          size: BaqueanoLogoSize.small,
          onTap: () => context.go('/home'),
        ),
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.search_rounded, color: AppColors.textLight, size: 22),
          visualDensity: VisualDensity.compact,
          tooltip: 'Búsqueda Global',
          onPressed: () => UniversalSearchModal.show(context),
        ),
        Stack(
          alignment: Alignment.center,
          children: [
            IconButton(
              icon: const Icon(Icons.notifications_outlined, color: AppColors.textLight, size: 22),
              visualDensity: VisualDensity.compact,
              tooltip: 'Notificaciones',
              onPressed: () => context.go('/notificaciones'),
            ),
            Positioned(
              top: 8,
              right: 8,
              child: Container(
                width: 7,
                height: 7,
                decoration: const BoxDecoration(
                  color: AppColors.terracotta,
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ],
        ),
        Stack(
          alignment: Alignment.center,
          children: [
            IconButton(
              icon: const Icon(Icons.chat_bubble_outline_rounded, color: AppColors.textLight, size: 21),
              visualDensity: VisualDensity.compact,
              tooltip: 'Mensajes con Anfitriones',
              onPressed: () => context.go('/mensajes'),
            ),
            Positioned(
              top: 8,
              right: 8,
              child: Container(
                width: 7,
                height: 7,
                decoration: const BoxDecoration(
                  color: AppColors.gold,
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ],
        ),
        IconButton(
          icon: const Icon(Icons.sos_rounded, color: AppColors.error, size: 23),
          visualDensity: VisualDensity.compact,
          tooltip: 'Auxilio SOS',
          onPressed: () => SosSafetyModal.show(context),
        ),
        const SizedBox(width: 6),
      ],
    );
  }

  // --- TOP ANNOUNCEMENT RIBBON ---
  Widget _buildAnnouncementRibbon(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFFE64A19), Color(0xFFFF5722), Color(0xFFE64A19)],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
      ),
      child: Center(
        child: Wrap(
          alignment: WrapAlignment.center,
          crossAxisAlignment: WrapCrossAlignment.center,
          spacing: 12,
          runSpacing: 6,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('🔥', style: TextStyle(fontSize: 14)),
                const SizedBox(width: 6),
                Text(
                  '¡OFERTAS EXCLUSIVAS! Descubre las mejores promociones de negocios locales y explora nuestros lugares de referencia nacional.',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
            InkWell(
              onTap: () => context.go('/descubrir'),
              borderRadius: BorderRadius.circular(20),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.35),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.6), width: 0.8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'EXPLORAR →',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 11,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: 0.8,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // --- DESKTOP NAVBAR ---
  Widget _buildDesktopNavbar(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        _buildAnnouncementRibbon(context),
        ClipRRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
            child: Container(
              height: 72,
              padding: const EdgeInsets.symmetric(horizontal: 32),
              decoration: BoxDecoration(
                color: AppColors.primaryDark.withValues(alpha: 0.95),
                border: const Border(bottom: BorderSide(color: AppColors.borderLight, width: 1)),
              ),
              child: Row(
                children: [
                  // Logo
                  BaqueanoLogo(
                    size: BaqueanoLogoSize.medium,
                    onTap: () => context.go('/home'),
                  ),

                  const SizedBox(width: 24),

                  // Menu Links
                  _buildNavLink(context, 'INICIO', '/home'),
                  _buildExplorarDropdown(context),
                  _buildNavLink(context, 'HISTORIA', '/historia-mi-pais'),
                  _buildNavLink(context, 'MAPA MUNDO', '/mapa'),
                  _buildNavLink(context, 'BAQUEANO AI', '/ai', isHighlight: true),
                  _buildNavLink(context, 'COMUNIDAD', '/comunidad'),
                  _buildNosotrosDropdown(context),

                  const Spacer(),

                  // Quick Search Button
                  IconButton(
                    icon: const Icon(Icons.search_rounded, color: AppColors.textLight, size: 22),
                    tooltip: 'Búsqueda Global',
                    onPressed: () => UniversalSearchModal.show(context),
                  ),

                  // SOS Button
                  IconButton(
                    icon: const Icon(Icons.sos_rounded, color: AppColors.error, size: 22),
                    tooltip: 'Auxilio SOS 24/7',
                    onPressed: () => SosSafetyModal.show(context),
                  ),

                  const SizedBox(width: 8),

                  // Language Selector Pill [NI ES/EN]
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight.withValues(alpha: 0.6),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text('🇳🇮', style: TextStyle(fontSize: 12)),
                        const SizedBox(width: 4),
                        _buildLangChip('ES'),
                        const SizedBox(width: 2),
                        _buildLangChip('EN'),
                      ],
                    ),
                  ),

                  const SizedBox(width: 14),

                  // Mi Perfil Button
                  InkWell(
                    onTap: () => context.go('/pasaporte'),
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                      decoration: BoxDecoration(
                        color: AppColors.bgCard,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.borderLight),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.person_outline_rounded, size: 16, color: AppColors.goldLight),
                          const SizedBox(width: 6),
                          Text(
                            'MI PERFIL',
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(width: 12),

                  // INGRESAR Orange Gradient Button
                  InkWell(
                    onTap: () => _showAuthModal(context),
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFFFF5722), Color(0xFFE64A19)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFFFF5722).withValues(alpha: 0.4),
                            blurRadius: 10,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Text(
                        'INGRESAR',
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 12,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.0,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildNavLink(BuildContext context, String title, String route, {bool isHighlight = false}) {
    final isSelected = GoRouterState.of(context).uri.toString().startsWith(route);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10),
      child: TextButton(
        onPressed: () => context.go(route),
        style: TextButton.styleFrom(
          foregroundColor: isHighlight ? AppColors.gold : (isSelected ? AppColors.terracottaLight : AppColors.textLight),
        ),
        child: Text(
          title,
          style: GoogleFonts.spaceGrotesk(
            fontSize: 13,
            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
            letterSpacing: 0.8,
          ),
        ),
      ),
    );
  }

  Widget _buildExplorarDropdown(BuildContext context) {
    return PopupMenuButton<String>(
      color: AppColors.bgCard,
      elevation: 8,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AppColors.borderLight),
      ),
      offset: const Offset(0, 50),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        child: Row(
          children: [
            Text(
              'EXPLORAR ▾',
              style: GoogleFonts.spaceGrotesk(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.textLight,
                letterSpacing: 0.8,
              ),
            ),
          ],
        ),
      ),
      onSelected: (route) => context.go(route),
      itemBuilder: (context) => [
        _buildPopupItem('📖', 'Historia de mi país', 'Cultura, identidad y patrimonio', '/historia-mi-pais'),
        _buildPopupItem('🎬', 'Videos de Expedición 4K', 'Nicaragua en pantalla grande', '/videos'),
        _buildPopupItem('🎵', 'Música & Folklore', 'Son Nica, Marimba y Ritmos', '/musica'),
        _buildPopupItem('🍽️', 'Gastronomía Autóctona', 'Comidas típicas y restaurantes', '/gastronomia'),
        _buildPopupItem('🏖️', 'Playas, Ríos & Cascadas', 'Pacífico, Caribe y cañones', '/playas'),
        _buildPopupItem('🏨', 'Hospedaje Sostenible', 'Eco-lodges y cabañas rurales', '/hospedaje'),
        _buildPopupItem('🎉', 'Vida Nocturna Bohemia', 'Terrazas, bares y discotecas', '/nocturna'),
        _buildPopupItem('📍', 'Turismo & Volcanes', 'Circuitos volcánicos y coloniales', '/turismo'),
        _buildPopupItem('🧭', 'Mega-Catálogo', 'Todos los destinos y filtros', '/descubrir'),
      ],
    );
  }

  Widget _buildNosotrosDropdown(BuildContext context) {
    return PopupMenuButton<String>(
      color: AppColors.bgCard,
      elevation: 8,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AppColors.borderLight),
      ),
      offset: const Offset(0, 50),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        child: Row(
          children: [
            Text(
              'NOSOTROS ▾',
              style: GoogleFonts.spaceGrotesk(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.textLight,
                letterSpacing: 0.8,
              ),
            ),
          ],
        ),
      ),
      onSelected: (route) => context.go(route),
      itemBuilder: (context) => [
        _buildPopupItem('🌿', 'Nuestra Marca', 'Misión, Visión, Manifiesto y Paleta', '/marca'),
        _buildPopupItem('❓', 'Centro de Ayuda & FAQ', 'Preguntas y Líneas de Emergencia', '/ayuda'),
        _buildPopupItem('📜', 'Términos y Condiciones', 'Condiciones de uso y aventura', '/terminos'),
        _buildPopupItem('🛡️', 'Políticas de Privacidad', 'Protección y cero venta de datos', '/privacidad'),
      ],
    );
  }

  PopupMenuItem<String> _buildPopupItem(String icon, String title, String subtitle, String route) {
    return PopupMenuItem<String>(
      value: route,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4.0),
        child: Row(
          children: [
            Text(icon, style: const TextStyle(fontSize: 20)),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: GoogleFonts.spaceGrotesk(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textLight)),
                Text(subtitle, style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLangChip(String lang) {
    final isSelected = _selectedLanguage == lang;
    return InkWell(
      onTap: () => setState(() => _selectedLanguage = lang),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.terracotta : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          lang,
          style: GoogleFonts.spaceGrotesk(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: isSelected ? Colors.white : AppColors.textMuted,
          ),
        ),
      ),
    );
  }

  // --- FLOATING GLASS BOTTOM NAV (MOBILE) ---
  Widget _buildFloatingBottomNav(BuildContext context) {
    return SafeArea(
      bottom: true,
      child: Padding(
        padding: const EdgeInsets.only(left: 16, right: 16, bottom: 8),
        child: GlassContainer(
        height: 68,
        borderRadius: BorderRadius.circular(34),
        blur: 20,
        backgroundColor: AppColors.primaryDark.withValues(alpha: 0.85),
        border: Border.all(color: AppColors.borderGold, width: 1.2),
        padding: const EdgeInsets.symmetric(horizontal: 8),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildBottomNavItem(0, Icons.home_rounded, 'Inicio'),
            _buildBottomNavItem(1, Icons.explore_rounded, 'Descubrir'),
            _buildBottomNavItem(2, Icons.map_rounded, 'Mapa GPS'),
            _buildBottomNavItem(3, Icons.smart_toy_rounded, 'Baqueano AI', isAi: true),
            _buildBottomNavItem(4, Icons.person_rounded, 'Perfil'),
          ],
        ),
      ),
    ),
  );
}

  Widget _buildBottomNavItem(int index, IconData icon, String label, {bool isAi = false}) {
    final isSelected = widget.currentIndex == index;

    if (isAi) {
      return InkWell(
        onTap: () => _onBottomNavTapped(index),
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            gradient: isSelected ? AppGradients.sunsetTerracotta : AppGradients.gold,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: (isSelected ? AppColors.terracotta : AppColors.gold).withValues(alpha: 0.4),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 18, color: isSelected ? Colors.white : AppColors.textDark),
              const SizedBox(width: 4),
              Text(
                'AI',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  color: isSelected ? Colors.white : AppColors.textDark,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return InkWell(
      onTap: () => _onBottomNavTapped(index),
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 22,
              color: isSelected ? AppColors.gold : AppColors.textMuted,
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: GoogleFonts.spaceGrotesk(
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? AppColors.goldLight : AppColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // --- MOBILE DRAWER ---
  Widget _buildDrawer(BuildContext context) {
    return Drawer(
      backgroundColor: AppColors.bgDark,
      child: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          children: [
            // Drawer Header
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: BaqueanoLogo(
                size: BaqueanoLogoSize.medium,
                onTap: () {
                  Navigator.pop(context);
                  context.go('/home');
                },
              ),
            ),
            const SizedBox(height: 14),
            const Divider(color: AppColors.borderLight),

            _buildDrawerSectionTitle('NAVEGACIÓN PRINCIPAL'),
            _buildDrawerItem(context, '🏠', 'Inicio', '/home'),
            _buildDrawerItem(context, '📖', 'Historia de mi país', '/historia-mi-pais', isGold: true),
            _buildDrawerItem(context, '🧭', 'Descubrir Destinos', '/descubrir'),
            _buildDrawerItem(context, '🌍', 'Mapa Mundial & GPS', '/mapa'),
            _buildDrawerItem(context, '🤖', 'Baqueano AI Assistant', '/ai', isGold: true),
            _buildDrawerItem(context, '👤', 'Mi Perfil & Ajustes', '/perfil'),
            _buildDrawerItem(context, '👥', 'Comunidad & Bitácora', '/comunidad'),

            const Divider(color: AppColors.borderLight),
            _buildDrawerSectionTitle('MI ACTIVIDAD & COMUNICACIÓN'),
            _buildDrawerItem(context, '📜', 'Historial de Expediciones', '/historial'),
            _buildDrawerItem(context, '🔔', 'Centro de Notificaciones', '/notificaciones'),
            _buildDrawerItem(context, '💬', 'Mensajes con Anfitriones', '/mensajes'),

            const Divider(color: AppColors.borderLight),
            _buildDrawerSectionTitle('CATÁLOGO CULTURAL DE NICARAGUA'),
            _buildDrawerItem(context, '🍽️', 'Gastronomía Autóctona', '/gastronomia'),
            _buildDrawerItem(context, '🎵', 'Música & Marimba de Arco', '/musica'),
            _buildDrawerItem(context, '🎬', 'Videos de Expedición 4K', '/videos'),
            _buildDrawerItem(context, '🏖️', 'Playas, Ríos & Cascadas', '/playas'),
            _buildDrawerItem(context, '🏨', 'Hospedaje & Eco-Lodges', '/hospedaje'),
            _buildDrawerItem(context, '🎉', 'Vida Nocturna Bohemia', '/nocturna'),
            _buildDrawerItem(context, '📍', 'Turismo & Volcanes', '/turismo'),

            const Divider(color: AppColors.borderLight),
            _buildDrawerSectionTitle('ALIANZAS & CRECIMIENTO COMERCIAL'),
            _buildDrawerItem(context, '💼', 'Planes para Negocios & Aliados', '/planes-negocios', isGold: true),

            const Divider(color: AppColors.borderLight),
            _buildDrawerSectionTitle('MISIÓN & COMPROMISO VERDE'),
            _buildDrawerItem(context, '🌿', 'Campaña Ambiental & Recursos', '/campana-ambiental', isGold: true),
            _buildDrawerItem(context, '🏛️', 'Nuestra Marca & Manifiesto', '/marca'),
            _buildDrawerItem(context, '❓', 'Centro de Ayuda & FAQ', '/ayuda'),
            _buildDrawerItem(context, '📜', 'Términos y Condiciones', '/terminos'),
            _buildDrawerItem(context, '🛡️', 'Políticas de Privacidad', '/privacidad'),

            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.primaryLight.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Row(
                children: [
                  const Text('🇳🇮', style: TextStyle(fontSize: 22)),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      '85% del valor directo a comunidades campesinas',
                      style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(top: 10, bottom: 4, left: 8),
      child: Text(
        title,
        style: GoogleFonts.spaceGrotesk(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: AppColors.gold,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildDrawerItem(BuildContext context, String icon, String title, String route, {bool isGold = false}) {
    return ListTile(
      dense: true,
      contentPadding: const EdgeInsets.symmetric(horizontal: 8),
      leading: Text(icon, style: const TextStyle(fontSize: 18)),
      title: Text(
        title,
        style: GoogleFonts.spaceGrotesk(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: isGold ? AppColors.goldLight : AppColors.textLight,
        ),
      ),
      onTap: () {
        Navigator.of(context).pop();
        context.go(route);
      },
    );
  }

  void _showAuthModal(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 440),
          child: Container(
            padding: const EdgeInsets.all(28),
            decoration: BoxDecoration(
              color: AppColors.primaryDark,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppColors.borderGold, width: 1.2),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.6),
                  blurRadius: 30,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const BaqueanoLogo(size: BaqueanoLogoSize.medium),
                const SizedBox(height: 20),
                Text(
                  '¡Bienvenido a Baqueano!',
                  style: GoogleFonts.montserrat(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Inicia sesión para acumular sellos en tu Pasaporte y acceder a tarifas exclusivas comunitarias.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: AppColors.textMuted,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 24),

                // Google Button
                BaqueanoButton(
                  text: 'Continuar con Google',
                  icon: const Icon(Icons.g_mobiledata_rounded, color: Colors.white, size: 24),
                  variant: BaqueanoButtonVariant.secondary,
                  width: double.infinity,
                  height: 48,
                  onPressed: () {
                    Navigator.pop(ctx);
                    CustomToast.show(
                      context,
                      message: '¡Sesión iniciada con éxito! Bienvenido, Explorador.',
                      icon: Icons.check_circle_rounded,
                      accentColor: AppColors.jungleGreen,
                    );
                  },
                ),
                const SizedBox(height: 12),

                // WhatsApp MFA Button
                BaqueanoButton(
                  text: 'Ingresar con WhatsApp',
                  icon: const Icon(Icons.chat_bubble_outline_rounded, color: Colors.white, size: 18),
                  variant: BaqueanoButtonVariant.primary,
                  width: double.infinity,
                  height: 48,
                  onPressed: () {
                    Navigator.pop(ctx);
                    CustomToast.show(
                      context,
                      message: 'Código de acceso enviado a tu WhatsApp.',
                      icon: Icons.sms_outlined,
                      accentColor: AppColors.gold,
                    );
                  },
                ),
                const SizedBox(height: 16),

                TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: Text(
                    'Continuar como explorador invitado',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 12,
                      color: AppColors.goldLight,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
