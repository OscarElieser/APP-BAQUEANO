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
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../theme/baqueano_fonts.dart';
import '../services/app_lifecycle_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_gradients.dart';
import 'baqueano_button.dart';
import 'baqueano_logo.dart';
import 'custom_toast.dart';
import 'glass_container.dart';
import 'sos_safety_modal.dart';
import 'universal_search_modal.dart';
import '../i18n/app_i18n.dart';

class ResponsiveScaffold extends ConsumerStatefulWidget {
  final Widget body;
  final int currentIndex;

  const ResponsiveScaffold({
    super.key,
    required this.body,
    this.currentIndex = 0,
  });

  @override
  ConsumerState<ResponsiveScaffold> createState() => _ResponsiveScaffoldState();
}

class _ResponsiveScaffoldState extends ConsumerState<ResponsiveScaffold> {
  bool _sidebarExpanded = true;
  final ScrollController _desktopMenuScrollController = ScrollController();
  final ScrollController _mobileMenuScrollController = ScrollController();

  @override
  void dispose() {
    _desktopMenuScrollController.dispose();
    _mobileMenuScrollController.dispose();
    super.dispose();
  }

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
    final isDesktop = screenWidth >= 840;

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
        appBar:
            isDesktop
                ? null
                : PreferredSize(
                  preferredSize: const Size.fromHeight(60),
                  child: _buildMobileAppBar(context),
                ),
        body:
            isDesktop
                ? Row(
                  children: [
                    RepaintBoundary(child: _buildCollapsibleSidebar(context)),
                    Expanded(child: widget.body),
                  ],
                )
                : widget.body,
        bottomNavigationBar:
            isDesktop ? null : _buildFloatingBottomNav(context),
      ),
    );
  }

  // --- SIDEBAR PLEGABLE PARA TABLET Y PANTALLAS AMPLIAS ---
  Widget _buildCollapsibleSidebar(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 260),
      curve: Curves.easeOutCubic,
      width: _sidebarExpanded ? 272 : 76,
      decoration: BoxDecoration(
        color: AppColors.primaryDark.withValues(alpha: 0.97),
        border: const Border(right: BorderSide(color: AppColors.borderLight)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.34),
            blurRadius: 24,
            offset: const Offset(8, 0),
          ),
        ],
      ),
      child: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: EdgeInsets.fromLTRB(
                _sidebarExpanded ? 16 : 10,
                14,
                10,
                10,
              ),
              child: Row(
                mainAxisAlignment:
                    _sidebarExpanded
                        ? MainAxisAlignment.start
                        : MainAxisAlignment.center,
                children: [
                  BaqueanoLogo.icon(size: 38, onTap: () => context.go('/home')),
                  if (_sidebarExpanded) ...[
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'BAQUEANO',
                        maxLines: 1,
                        style: BaqueanoFonts.text(
                          color: AppColors.textLight,
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.1,
                        ),
                      ),
                    ),
                    _buildSidebarToggle(),
                  ],
                ],
              ),
            ),
            if (!_sidebarExpanded)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: _buildSidebarToggle(),
              ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10),
              child:
                  _sidebarExpanded
                      ? InkWell(
                        onTap: () => UniversalSearchModal.show(context),
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          height: 42,
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          decoration: BoxDecoration(
                            color: AppColors.bgDark.withValues(alpha: 0.52),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.borderLight),
                          ),
                          child: Row(
                            children: [
                              const Icon(
                                Icons.search_rounded,
                                size: 19,
                                color: AppColors.textMuted,
                              ),
                              const SizedBox(width: 10),
                              Text(
                                'Buscar',
                                style: BaqueanoFonts.text(
                                  fontSize: 12,
                                  color: AppColors.textMuted,
                                ),
                              ),
                            ],
                          ),
                        ),
                      )
                      : _buildSidebarAction(
                        icon: Icons.search_rounded,
                        tooltip: 'Buscar',
                        onTap: () => UniversalSearchModal.show(context),
                      ),
            ),
            const SizedBox(height: 10),
            Expanded(
              child: Scrollbar(
                controller: _desktopMenuScrollController,
                thumbVisibility: true,
                thickness: 3,
                radius: const Radius.circular(4),
                child: ListView(
                  controller: _desktopMenuScrollController,
                  padding: const EdgeInsets.fromLTRB(10, 0, 14, 12),
                  physics: const BouncingScrollPhysics(),
                  children: [
                    _buildSidebarSection('EXPLORAR'),
                    _buildSidebarItem(
                      context,
                      Icons.home_rounded,
                      'Inicio',
                      '/home',
                    ),
                    _buildSidebarItem(
                      context,
                      Icons.travel_explore_rounded,
                      'Descubre Nicaragua',
                      '/descubre-nicaragua',
                    ),
                    _buildSidebarItem(
                      context,
                      Icons.explore_rounded,
                      'Destinos',
                      '/descubrir',
                    ),
                    _buildSidebarItem(
                      context,
                      Icons.map_rounded,
                      'Mapa y GPS',
                      '/mapa',
                    ),
                    _buildSidebarItem(
                      context,
                      Icons.auto_awesome_rounded,
                      'Baqueano AI',
                      '/ai',
                      highlighted: true,
                    ),
                    _buildSidebarSection('CULTURA'),
                    _buildSidebarItem(
                      context,
                      Icons.history_edu_rounded,
                      'Historia de mi país',
                      '/historia-mi-pais',
                    ),
                    _buildSidebarItem(
                      context,
                      Icons.restaurant_rounded,
                      'Gastronomía',
                      '/gastronomia',
                    ),
                    _buildSidebarItem(
                      context,
                      Icons.music_note_rounded,
                      'Música',
                      '/musica',
                    ),
                    _buildSidebarItem(
                      context,
                      Icons.smart_display_rounded,
                      'Videos',
                      '/videos',
                    ),
                    _buildSidebarItem(
                      context,
                      Icons.beach_access_rounded,
                      'Playas y cascadas',
                      '/playas',
                    ),
                    _buildSidebarItem(
                      context,
                      Icons.hotel_rounded,
                      'Hospedaje',
                      '/hospedaje',
                    ),
                    _buildSidebarItem(
                      context,
                      Icons.nightlife_rounded,
                      'Vida nocturna',
                      '/nocturna',
                    ),
                    _buildSidebarItem(
                      context,
                      Icons.volcano_rounded,
                      'Turismo y volcanes',
                      '/turismo',
                    ),
                    _buildSidebarSection('MI VIAJE'),
                    _buildSidebarItem(
                      context,
                      Icons.groups_rounded,
                      'Comunidad',
                      '/comunidad',
                    ),
                    _buildSidebarItem(
                      context,
                      Icons.route_rounded,
                      'Mis expediciones',
                      '/historial',
                    ),
                    _buildSidebarItem(
                      context,
                      Icons.chat_bubble_outline_rounded,
                      'Mensajes',
                      '/mensajes',
                    ),
                    _buildSidebarItem(
                      context,
                      Icons.notifications_none_rounded,
                      'Notificaciones',
                      '/notificaciones',
                    ),
                    _buildSidebarSection('SERVICIOS'),
                    _buildSidebarItem(
                      context,
                      Icons.handshake_rounded,
                      'Negocios y aliados',
                      '/planes-negocios',
                    ),
                    _buildSidebarItem(
                      context,
                      Icons.eco_rounded,
                      'Campaña ambiental',
                      '/campana-ambiental',
                    ),
                    _buildSidebarItem(
                      context,
                      Icons.badge_rounded,
                      'Nuestra marca',
                      '/marca',
                    ),
                    _buildSidebarItem(
                      context,
                      Icons.help_outline_rounded,
                      'Centro de ayuda',
                      '/ayuda',
                    ),
                    _buildSidebarItem(
                      context,
                      Icons.description_outlined,
                      'Términos y condiciones',
                      '/terminos',
                    ),
                    _buildSidebarItem(
                      context,
                      Icons.shield_outlined,
                      'Política de privacidad',
                      '/privacidad',
                    ),
                  ],
                ),
              ),
            ),
            const Divider(height: 1, color: AppColors.borderLight),
            Padding(
              padding: const EdgeInsets.all(10),
              child: _buildSidebarItem(
                context,
                Icons.account_circle_rounded,
                'Mi perfil',
                '/perfil',
                showStatus: true,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSidebarToggle() {
    return _buildSidebarAction(
      icon: _sidebarExpanded ? Icons.menu_open_rounded : Icons.menu_rounded,
      tooltip: _sidebarExpanded ? 'Ocultar menú' : 'Abrir menú',
      onTap: () => setState(() => _sidebarExpanded = !_sidebarExpanded),
    );
  }

  Widget _buildSidebarAction({
    required IconData icon,
    required String tooltip,
    required VoidCallback onTap,
  }) {
    return Tooltip(
      message: tooltip,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: SizedBox(
          width: 42,
          height: 42,
          child: Icon(icon, size: 21, color: AppColors.goldLight),
        ),
      ),
    );
  }

  Widget _buildSidebarSection(String label) {
    if (!_sidebarExpanded) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 7),
        child: Divider(height: 1, color: AppColors.borderLight),
      );
    }
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 14, 8, 6),
      child: Text(
        label,
        style: BaqueanoFonts.text(
          color: AppColors.gold,
          fontSize: 9.5,
          fontWeight: FontWeight.w800,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildSidebarItem(
    BuildContext context,
    IconData icon,
    String label,
    String route, {
    bool highlighted = false,
    bool showStatus = false,
  }) {
    final currentRoute = GoRouterState.of(context).uri.path;
    final isSelected =
        currentRoute == route ||
        (route != '/home' && currentRoute.startsWith('$route/'));
    final foreground =
        isSelected
            ? Colors.white
            : highlighted
            ? AppColors.goldLight
            : AppColors.textMuted;

    final item = Material(
      color: Colors.transparent,
      child: InkWell(
        key: ValueKey<String>('sidebar-$route'),
        onTap: () => context.go(route),
        borderRadius: BorderRadius.circular(12),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          height: 44,
          margin: const EdgeInsets.only(bottom: 3),
          padding: EdgeInsets.symmetric(horizontal: _sidebarExpanded ? 12 : 0),
          decoration: BoxDecoration(
            color:
                isSelected
                    ? AppColors.primary.withValues(alpha: 0.74)
                    : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
            border:
                isSelected
                    ? Border.all(
                      color: AppColors.terracotta.withValues(alpha: 0.52),
                    )
                    : null,
          ),
          child: Row(
            mainAxisAlignment:
                _sidebarExpanded
                    ? MainAxisAlignment.start
                    : MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 21,
                color: isSelected ? AppColors.terracottaLight : foreground,
              ),
              if (_sidebarExpanded) ...[
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: BaqueanoFonts.text(
                      color: foreground,
                      fontSize: 12.5,
                      fontWeight:
                          isSelected ? FontWeight.w800 : FontWeight.w600,
                    ),
                  ),
                ),
                if (showStatus)
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: AppColors.success,
                      shape: BoxShape.circle,
                    ),
                  ),
              ],
            ],
          ),
        ),
      ),
    );

    return _sidebarExpanded ? item : Tooltip(message: label, child: item);
  }

  // --- MOBILE APP BAR ---
  Widget _buildMobileAppBar(BuildContext context) {
    return AppBar(
      backgroundColor: AppColors.bgDark.withValues(alpha: 0.85),
      elevation: 0,
      centerTitle: false,
      leading: Builder(
        builder:
            (context) => IconButton(
              icon: const Icon(
                Icons.menu_rounded,
                color: AppColors.goldLight,
                size: 26,
              ),
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
          icon: const Icon(
            Icons.search_rounded,
            color: AppColors.textLight,
            size: 22,
          ),
          visualDensity: VisualDensity.compact,
          tooltip: 'Búsqueda Global',
          onPressed: () => UniversalSearchModal.show(context),
        ),
        Stack(
          alignment: Alignment.center,
          children: [
            IconButton(
              icon: const Icon(
                Icons.notifications_outlined,
                color: AppColors.textLight,
                size: 22,
              ),
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
              icon: const Icon(
                Icons.chat_bubble_outline_rounded,
                color: AppColors.textLight,
                size: 21,
              ),
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
                  style: BaqueanoFonts.text(
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
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.35),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: Colors.white.withValues(alpha: 0.6),
                    width: 0.8,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'EXPLORAR →',
                      style: BaqueanoFonts.text(
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
  // Conservado como respaldo de compatibilidad para una futura variante superior.
  // ignore: unused_element
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
                border: const Border(
                  bottom: BorderSide(color: AppColors.borderLight, width: 1),
                ),
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
                  _buildNavLink(
                    context,
                    'DESCUBRE NICARAGUA',
                    '/descubre-nicaragua',
                    isHighlight: true,
                  ),
                  _buildExplorarDropdown(context),
                  _buildNavLink(context, 'HISTORIA', '/historia-mi-pais'),
                  _buildNavLink(context, 'MAPA MUNDO', '/mapa'),
                  _buildNavLink(
                    context,
                    'BAQUEANO AI',
                    '/ai',
                    isHighlight: true,
                  ),
                  _buildNavLink(context, 'COMUNIDAD', '/comunidad'),
                  _buildNosotrosDropdown(context),

                  const Spacer(),

                  // Quick Search Button
                  IconButton(
                    icon: const Icon(
                      Icons.search_rounded,
                      color: AppColors.textLight,
                      size: 22,
                    ),
                    tooltip: 'Búsqueda Global',
                    onPressed: () => UniversalSearchModal.show(context),
                  ),

                  // SOS Button
                  IconButton(
                    icon: const Icon(
                      Icons.sos_rounded,
                      color: AppColors.error,
                      size: 22,
                    ),
                    tooltip: 'Auxilio SOS 24/7',
                    onPressed: () => SosSafetyModal.show(context),
                  ),

                  const SizedBox(width: 8),

                  // Language Selector Pill [NI ES/EN]
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
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
                        for (final lang in kSupportedLanguages) ...[
                          _buildLangChip(lang.toUpperCase()),
                          if (lang != kSupportedLanguages.last) const SizedBox(width: 2),
                        ],
                      ],
                    ),
                  ),

                  const SizedBox(width: 14),

                  // Mi Perfil Button
                  InkWell(
                    onTap: () => context.go('/pasaporte'),
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 7,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.bgCard,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.borderLight),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.person_outline_rounded,
                            size: 16,
                            color: AppColors.goldLight,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            'MI PERFIL',
                            style: BaqueanoFonts.text(
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
                      padding: const EdgeInsets.symmetric(
                        horizontal: 18,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFFFF5722), Color(0xFFE64A19)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(
                              0xFFFF5722,
                            ).withValues(alpha: 0.4),
                            blurRadius: 10,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Text(
                        'INGRESAR',
                        style: BaqueanoFonts.text(
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

  Widget _buildNavLink(
    BuildContext context,
    String title,
    String route, {
    bool isHighlight = false,
  }) {
    final isSelected = GoRouterState.of(
      context,
    ).uri.toString().startsWith(route);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10),
      child: TextButton(
        onPressed: () => context.go(route),
        style: TextButton.styleFrom(
          foregroundColor:
              isHighlight
                  ? AppColors.gold
                  : (isSelected
                      ? AppColors.terracottaLight
                      : AppColors.textLight),
        ),
        child: Text(
          title,
          style: BaqueanoFonts.text(
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
              style: BaqueanoFonts.text(
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
      itemBuilder:
          (context) => [
            _buildPopupItem(
              '📖',
              'Historia de mi país',
              'Cultura, identidad y patrimonio',
              '/historia-mi-pais',
            ),
            _buildPopupItem(
              '🎬',
              'Videos de Expedición 4K',
              'Nicaragua en pantalla grande',
              '/videos',
            ),
            _buildPopupItem(
              '🎵',
              'Música & Folklore',
              'Son Nica, Marimba y Ritmos',
              '/musica',
            ),
            _buildPopupItem(
              '🍽️',
              'Gastronomía Autóctona',
              'Comidas típicas y restaurantes',
              '/gastronomia',
            ),
            _buildPopupItem(
              '🏖️',
              'Playas, Ríos & Cascadas',
              'Pacífico, Caribe y cañones',
              '/playas',
            ),
            _buildPopupItem(
              '🏨',
              'Hospedaje Sostenible',
              'Eco-lodges y cabañas rurales',
              '/hospedaje',
            ),
            _buildPopupItem(
              '🎉',
              'Vida Nocturna Bohemia',
              'Terrazas, bares y discotecas',
              '/nocturna',
            ),
            _buildPopupItem(
              '📍',
              'Turismo & Volcanes',
              'Circuitos volcánicos y coloniales',
              '/turismo',
            ),
            _buildPopupItem(
              '🧭',
              'Mega-Catálogo',
              'Todos los destinos y filtros',
              '/descubrir',
            ),
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
              style: BaqueanoFonts.text(
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
      itemBuilder:
          (context) => [
            _buildPopupItem(
              '🌿',
              'Nuestra Marca',
              'Misión, Visión, Manifiesto y Paleta',
              '/marca',
            ),
            _buildPopupItem(
              '❓',
              'Centro de Ayuda & FAQ',
              'Preguntas y Líneas de Emergencia',
              '/ayuda',
            ),
            _buildPopupItem(
              '📜',
              'Términos y Condiciones',
              'Condiciones de uso y aventura',
              '/terminos',
            ),
            _buildPopupItem(
              '🛡️',
              'Políticas de Privacidad',
              'Protección y cero venta de datos',
              '/privacidad',
            ),
          ],
    );
  }

  PopupMenuItem<String> _buildPopupItem(
    String icon,
    String title,
    String subtitle,
    String route,
  ) {
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
                Text(
                  title,
                  style: BaqueanoFonts.text(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textLight,
                  ),
                ),
                Text(
                  subtitle,
                  style: BaqueanoFonts.text(
                    fontSize: 11,
                    color: AppColors.textMuted,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  /// Selector real de idioma (antes los chips ES/EN no traducían nada).
  Widget _buildLangChip(String lang) {
    final code = lang.toLowerCase();
    final isSelected = ref.watch(appLanguageProvider) == code;
    return InkWell(
      onTap: () => ref.read(appLanguageProvider.notifier).setLanguage(code),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.terracotta : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          lang,
          style: BaqueanoFonts.text(
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
    final s = ref.strings;
    final screenHeight = MediaQuery.sizeOf(context).height;
    final isCompact = screenHeight < 520;

    return SafeArea(
      bottom: true,
      child: Padding(
        padding: EdgeInsets.only(
          left: 16,
          right: 16,
          bottom: isCompact ? 4 : 8,
        ),
        child: GlassContainer(
          height: isCompact ? 54 : 68,
          borderRadius: BorderRadius.circular(isCompact ? 27 : 34),
          blur: 20,
          backgroundColor: AppColors.primaryDark.withValues(alpha: 0.85),
          border: Border.all(color: AppColors.borderGold, width: 1.2),
          padding: const EdgeInsets.symmetric(horizontal: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildBottomNavItem(
                0,
                Icons.home_rounded,
                s.t('nav.home', 'Inicio'),
                isCompact: isCompact,
              ),
              _buildBottomNavItem(
                1,
                Icons.explore_rounded,
                s.t('app.nav.discover', 'Descubrir'),
                isCompact: isCompact,
              ),
              _buildBottomNavItem(
                2,
                Icons.map_rounded,
                s.t('app.nav.mapGps', 'Mapa GPS'),
                isCompact: isCompact,
              ),
              _buildBottomNavItem(
                3,
                Icons.smart_toy_rounded,
                s.t('app.nav.ai', 'Baqueano AI'),
                isAi: true,
                isCompact: isCompact,
              ),
              _buildBottomNavItem(
                4,
                Icons.person_rounded,
                s.t('app.nav.profile', 'Perfil'),
                isCompact: isCompact,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBottomNavItem(
    int index,
    IconData icon,
    String label, {
    bool isAi = false,
    bool isCompact = false,
  }) {
    final isSelected = widget.currentIndex == index;

    if (isAi) {
      return InkWell(
        onTap: () => _onBottomNavTapped(index),
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: EdgeInsets.symmetric(
            horizontal: isCompact ? 8 : 12,
            vertical: isCompact ? 4 : 6,
          ),
          decoration: BoxDecoration(
            gradient:
                isSelected ? AppGradients.sunsetTerracotta : AppGradients.gold,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: (isSelected ? AppColors.terracotta : AppColors.gold)
                    .withValues(alpha: 0.4),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: isCompact ? 15 : 18,
                color: isSelected ? Colors.white : AppColors.textDark,
              ),
              const SizedBox(width: 4),
              Text(
                'AI',
                style: BaqueanoFonts.text(
                  fontSize: isCompact ? 10.5 : 12,
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
              size: isCompact ? 18 : 22,
              color: isSelected ? AppColors.gold : AppColors.textMuted,
            ),
            if (!isCompact) const SizedBox(height: 2),
            Text(
              label,
              style: BaqueanoFonts.text(
                fontSize: isCompact ? 9 : 10,
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
    final s = ref.strings;
    final drawerWidth =
        MediaQuery.sizeOf(context).width.clamp(0, 320).toDouble();
    return Drawer(
      width: drawerWidth,
      elevation: 0,
      backgroundColor: Colors.transparent,
      child: RepaintBoundary(
        child: Container(
          decoration: BoxDecoration(
            color: AppColors.primaryDark.withValues(alpha: 0.98),
            border: const Border(
              right: BorderSide(color: AppColors.borderLight),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.5),
                blurRadius: 28,
                offset: const Offset(10, 0),
              ),
            ],
          ),
          child: SafeArea(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(18, 14, 10, 12),
                  child: Row(
                    children: [
                      BaqueanoLogo.icon(
                        size: 40,
                        onTap: () => _goFromDrawer(context, '/home'),
                      ),
                      const SizedBox(width: 11),
                      Expanded(
                        child: Text(
                          'BAQUEANO',
                          style: BaqueanoFonts.text(
                            color: AppColors.textLight,
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ),
                      IconButton(
                        tooltip: 'Cerrar menú',
                        onPressed: () => Navigator.of(context).pop(),
                        icon: const Icon(
                          Icons.close_rounded,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  child: InkWell(
                    onTap: () {
                      Navigator.of(context).pop();
                      UniversalSearchModal.show(context);
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      height: 44,
                      padding: const EdgeInsets.symmetric(horizontal: 13),
                      decoration: BoxDecoration(
                        color: AppColors.bgDark.withValues(alpha: 0.52),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.borderLight),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.search_rounded,
                            size: 20,
                            color: AppColors.textMuted,
                          ),
                          const SizedBox(width: 10),
                          Text(
                            'Buscar en Baqueano',
                            style: BaqueanoFonts.text(
                              fontSize: 12,
                              color: AppColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Expanded(
                  child: Scrollbar(
                    controller: _mobileMenuScrollController,
                    thumbVisibility: true,
                    thickness: 3,
                    radius: const Radius.circular(4),
                    child: ListView(
                      controller: _mobileMenuScrollController,
                      padding: const EdgeInsets.fromLTRB(14, 0, 18, 14),
                      physics: const BouncingScrollPhysics(),
                      children: [
                        _buildMobileDrawerSection(s.t('app.drawer.explore', 'EXPLORAR')),
                        _buildMobileDrawerItem(
                          context,
                          Icons.home_rounded,
                          s.t('nav.home', 'Inicio'),
                          '/home',
                        ),
                        _buildMobileDrawerItem(
                          context,
                          Icons.travel_explore_rounded,
                          s.t('app.nav.discoverNicaragua', 'Descubre Nicaragua'),
                          '/descubre-nicaragua',
                        ),
                        _buildMobileDrawerItem(
                          context,
                          Icons.explore_rounded,
                          s.t('nav.destinations', 'Destinos'),
                          '/descubrir',
                        ),
                        _buildMobileDrawerItem(
                          context,
                          Icons.map_rounded,
                          s.t('nav.map', 'Mapa y GPS'),
                          '/mapa',
                        ),
                        _buildMobileDrawerItem(
                          context,
                          Icons.auto_awesome_rounded,
                          s.t('app.nav.ai', 'Baqueano AI'),
                          '/ai',
                          highlighted: true,
                        ),
                        _buildMobileDrawerSection(s.t('app.drawer.culture', 'CULTURA Y TERRITORIO')),
                        _buildMobileDrawerItem(
                          context,
                          Icons.history_edu_rounded,
                          s.t('app.nav.countryHistory', 'Historia de mi país'),
                          '/historia-mi-pais',
                        ),
                        _buildMobileDrawerItem(
                          context,
                          Icons.restaurant_rounded,
                          s.t('nav.gastronomy', 'Gastronomía'),
                          '/gastronomia',
                        ),
                        _buildMobileDrawerItem(
                          context,
                          Icons.music_note_rounded,
                          s.t('nav.music', 'Música'),
                          '/musica',
                        ),
                        _buildMobileDrawerItem(
                          context,
                          Icons.smart_display_rounded,
                          s.t('app.nav.videos', 'Videos'),
                          '/videos',
                        ),
                        _buildMobileDrawerItem(
                          context,
                          Icons.beach_access_rounded,
                          s.t('app.nav.beaches', 'Playas y cascadas'),
                          '/playas',
                        ),
                        _buildMobileDrawerItem(
                          context,
                          Icons.hotel_rounded,
                          s.t('app.nav.lodging', 'Hospedaje'),
                          '/hospedaje',
                        ),
                        _buildMobileDrawerItem(
                          context,
                          Icons.nightlife_rounded,
                          s.t('app.nav.nightlife', 'Vida nocturna'),
                          '/nocturna',
                        ),
                        _buildMobileDrawerItem(
                          context,
                          Icons.volcano_rounded,
                          s.t('app.nav.tourism', 'Turismo y volcanes'),
                          '/turismo',
                        ),
                        _buildMobileDrawerSection(s.t('app.drawer.trip', 'MI VIAJE')),
                        _buildMobileDrawerItem(
                          context,
                          Icons.groups_rounded,
                          s.t('app.nav.community', 'Comunidad'),
                          '/comunidad',
                        ),
                        _buildMobileDrawerItem(
                          context,
                          Icons.route_rounded,
                          s.t('app.nav.trips', 'Mis expediciones'),
                          '/historial',
                        ),
                        _buildMobileDrawerItem(
                          context,
                          Icons.chat_bubble_outline_rounded,
                          s.t('app.nav.messages', 'Mensajes'),
                          '/mensajes',
                        ),
                        _buildMobileDrawerItem(
                          context,
                          Icons.notifications_none_rounded,
                          s.t('app.nav.notifications', 'Notificaciones'),
                          '/notificaciones',
                        ),
                        _buildMobileDrawerItem(
                          context,
                          Icons.account_circle_rounded,
                          s.t('app.nav.myProfile', 'Mi perfil'),
                          '/perfil',
                        ),
                        _buildMobileDrawerSection(s.t('app.drawer.more', 'MÁS')),
                        _buildMobileDrawerItem(
                          context,
                          Icons.handshake_rounded,
                          s.t('app.nav.business', 'Negocios y aliados'),
                          '/planes-negocios',
                        ),
                        _buildMobileDrawerItem(
                          context,
                          Icons.eco_rounded,
                          s.t('app.nav.environmental', 'Campaña ambiental'),
                          '/campana-ambiental',
                        ),
                        _buildMobileDrawerItem(
                          context,
                          Icons.help_outline_rounded,
                          s.t('app.nav.help', 'Ayuda'),
                          '/ayuda',
                        ),
                        _buildMobileDrawerItem(
                          context,
                          Icons.badge_rounded,
                          s.t('app.nav.brand', 'Nuestra marca'),
                          '/marca',
                        ),
                        _buildMobileDrawerItem(
                          context,
                          Icons.description_outlined,
                          s.t('app.nav.terms', 'Términos y condiciones'),
                          '/terminos',
                        ),
                        _buildMobileDrawerItem(
                          context,
                          Icons.shield_outlined,
                          s.t('app.nav.privacy', 'Política de privacidad'),
                          '/privacidad',
                        ),
                        _buildMobileDrawerSection(s.t('app.drawer.language', 'IDIOMA')),
                        Padding(
                          padding: const EdgeInsets.fromLTRB(12, 0, 8, 8),
                          child: Wrap(
                            spacing: 6,
                            runSpacing: 6,
                            children: [
                              for (final lang in kSupportedLanguages)
                                Semantics(
                                  button: true,
                                  selected: ref.watch(appLanguageProvider) == lang,
                                  label: kLanguageNames[lang],
                                  child: _buildLangChip(lang.toUpperCase()),
                                ),
                            ],
                          ),
                        ),
                      ],
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

  Widget _buildMobileDrawerSection(String label) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 16, 8, 6),
      child: Text(
        label,
        style: BaqueanoFonts.text(
          color: AppColors.gold,
          fontSize: 9.5,
          fontWeight: FontWeight.w800,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildMobileDrawerItem(
    BuildContext context,
    IconData icon,
    String label,
    String route, {
    bool highlighted = false,
  }) {
    final currentRoute = GoRouterState.of(context).uri.path;
    final isSelected =
        currentRoute == route ||
        (route != '/home' && currentRoute.startsWith('$route/'));
    return Padding(
      padding: const EdgeInsets.only(bottom: 3),
      child: Material(
        color: Colors.transparent,
        child: ListTile(
          key: ValueKey<String>('drawer-$route'),
          minTileHeight: 44,
          dense: true,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          tileColor:
              isSelected
                  ? AppColors.primary.withValues(alpha: 0.74)
                  : Colors.transparent,
          selectedTileColor: AppColors.primary.withValues(alpha: 0.74),
          leading: Icon(
            icon,
            size: 21,
            color:
                isSelected
                    ? AppColors.terracottaLight
                    : highlighted
                    ? AppColors.goldLight
                    : AppColors.textMuted,
          ),
          title: Text(
            label,
            style: BaqueanoFonts.text(
              color:
                  isSelected || highlighted
                      ? AppColors.textLight
                      : AppColors.textMuted,
              fontSize: 12.5,
              fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
            ),
          ),
          trailing:
              isSelected
                  ? Container(
                    width: 4,
                    height: 20,
                    decoration: BoxDecoration(
                      color: AppColors.terracotta,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  )
                  : null,
          onTap: () => _goFromDrawer(context, route),
        ),
      ),
    );
  }

  void _goFromDrawer(BuildContext context, String route) {
    Navigator.of(context).pop();
    context.go(route);
  }

  // Implementación anterior conservada temporalmente para facilitar comparación visual.
  // ignore: unused_element
  Widget _buildLegacyDrawer(BuildContext context) {
    return Drawer(
      backgroundColor: AppColors.bgDark,
      child: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          children: [
            // Drawer Header
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                children: [
                  BaqueanoLogo.icon(
                    size: 42,
                    onTap: () {
                      Navigator.pop(context);
                      context.go('/home');
                    },
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: BaqueanoLogo(
                      size: BaqueanoLogoSize.small,
                      onTap: () {
                        Navigator.pop(context);
                        context.go('/home');
                      },
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            const Divider(color: AppColors.borderLight),

            _buildDrawerSectionTitle('NAVEGACIÓN PRINCIPAL'),
            _buildDrawerItem(context, '🏠', 'Inicio', '/home'),
            _buildDrawerItem(
              context,
              '🇳🇮',
              'Descubre Nicaragua',
              '/descubre-nicaragua',
              isGold: true,
            ),
            _buildDrawerItem(
              context,
              '📖',
              'Historia de mi país',
              '/historia-mi-pais',
              isGold: true,
            ),
            _buildDrawerItem(context, '🧭', 'Descubrir Destinos', '/descubrir'),
            _buildDrawerItem(context, '🌍', 'Mapa Mundial & GPS', '/mapa'),
            _buildDrawerItem(
              context,
              '🤖',
              'Baqueano AI Assistant',
              '/ai',
              isGold: true,
            ),
            _buildDrawerItem(context, '👤', 'Mi Perfil & Ajustes', '/perfil'),
            _buildDrawerItem(
              context,
              '👥',
              'Comunidad & Bitácora',
              '/comunidad',
            ),

            const Divider(color: AppColors.borderLight),
            _buildDrawerSectionTitle('MI ACTIVIDAD & COMUNICACIÓN'),
            _buildDrawerItem(
              context,
              '📜',
              'Historial de Expediciones',
              '/historial',
            ),
            _buildDrawerItem(
              context,
              '🔔',
              'Centro de Notificaciones',
              '/notificaciones',
            ),
            _buildDrawerItem(
              context,
              '💬',
              'Mensajes con Anfitriones',
              '/mensajes',
            ),

            const Divider(color: AppColors.borderLight),
            _buildDrawerSectionTitle('CATÁLOGO CULTURAL DE NICARAGUA'),
            _buildDrawerItem(
              context,
              '🍽️',
              'Gastronomía Autóctona',
              '/gastronomia',
            ),
            _buildDrawerItem(
              context,
              '🎵',
              'Música & Marimba de Arco',
              '/musica',
            ),
            _buildDrawerItem(
              context,
              '🎬',
              'Videos de Expedición 4K',
              '/videos',
            ),
            _buildDrawerItem(
              context,
              '🏖️',
              'Playas, Ríos & Cascadas',
              '/playas',
            ),
            _buildDrawerItem(
              context,
              '🏨',
              'Hospedaje & Eco-Lodges',
              '/hospedaje',
            ),
            _buildDrawerItem(
              context,
              '🎉',
              'Vida Nocturna Bohemia',
              '/nocturna',
            ),
            _buildDrawerItem(context, '📍', 'Turismo & Volcanes', '/turismo'),

            const Divider(color: AppColors.borderLight),
            _buildDrawerSectionTitle('ALIANZAS & CRECIMIENTO COMERCIAL'),
            _buildDrawerItem(
              context,
              '💼',
              'Planes para Negocios & Aliados',
              '/planes-negocios',
              isGold: true,
            ),

            const Divider(color: AppColors.borderLight),
            _buildDrawerSectionTitle('MISIÓN & COMPROMISO VERDE'),
            _buildDrawerItem(
              context,
              '🌿',
              'Campaña Ambiental & Recursos',
              '/campana-ambiental',
              isGold: true,
            ),
            _buildDrawerItem(
              context,
              '🏛️',
              'Nuestra Marca & Manifiesto',
              '/marca',
            ),
            _buildDrawerItem(context, '❓', 'Centro de Ayuda & FAQ', '/ayuda'),
            _buildDrawerItem(
              context,
              '📜',
              'Términos y Condiciones',
              '/terminos',
            ),
            _buildDrawerItem(
              context,
              '🛡️',
              'Políticas de Privacidad',
              '/privacidad',
            ),

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
                      style: BaqueanoFonts.text(
                        fontSize: 11,
                        color: AppColors.textMuted,
                      ),
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
        style: BaqueanoFonts.text(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: AppColors.gold,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildDrawerItem(
    BuildContext context,
    String icon,
    String title,
    String route, {
    bool isGold = false,
  }) {
    return ListTile(
      dense: true,
      contentPadding: const EdgeInsets.symmetric(horizontal: 8),
      leading: Text(icon, style: const TextStyle(fontSize: 18)),
      title: Text(
        title,
        style: BaqueanoFonts.text(
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
      builder:
          (ctx) => Dialog(
            backgroundColor: Colors.transparent,
            insetPadding: const EdgeInsets.symmetric(
              horizontal: 20,
              vertical: 20,
            ),
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
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const BaqueanoLogo(size: BaqueanoLogoSize.medium),
                      const SizedBox(height: 20),
                      Text(
                        '¡Bienvenido a Baqueano!',
                        style: BaqueanoFonts.display(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Inicia sesión para acumular sellos en tu Pasaporte y acceder a tarifas exclusivas comunitarias.',
                        textAlign: TextAlign.center,
                        style: BaqueanoFonts.text(
                          fontSize: 12,
                          color: AppColors.textMuted,
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Google Button
                      BaqueanoButton(
                        text: 'Continuar con Google',
                        icon: const Icon(
                          Icons.g_mobiledata_rounded,
                          color: Colors.white,
                          size: 24,
                        ),
                        variant: BaqueanoButtonVariant.secondary,
                        width: double.infinity,
                        height: 48,
                        onPressed: () {
                          Navigator.pop(ctx);
                          CustomToast.show(
                            context,
                            message:
                                '¡Sesión iniciada con éxito! Bienvenido, Explorador.',
                            icon: Icons.check_circle_rounded,
                            accentColor: AppColors.jungleGreen,
                          );
                        },
                      ),
                      const SizedBox(height: 12),

                      // WhatsApp MFA Button
                      BaqueanoButton(
                        text: 'Ingresar con WhatsApp',
                        icon: const Icon(
                          Icons.chat_bubble_outline_rounded,
                          color: Colors.white,
                          size: 18,
                        ),
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
                          style: BaqueanoFonts.text(
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
          ),
    );
  }
}
