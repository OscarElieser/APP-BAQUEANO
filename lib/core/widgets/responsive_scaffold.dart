import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_colors.dart';
import '../theme/app_gradients.dart';
import 'baqueano_button.dart';
import 'glass_container.dart';

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
        context.go('/pasaporte');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      extendBody: true,
      drawer: isDesktop ? null : _buildDrawer(context),
      appBar: isDesktop
          ? PreferredSize(
              preferredSize: const Size.fromHeight(74),
              child: _buildDesktopNavbar(context),
            )
          : PreferredSize(
              preferredSize: const Size.fromHeight(60),
              child: _buildMobileAppBar(context),
            ),
      body: widget.body,
      bottomNavigationBar: isDesktop ? null : _buildFloatingBottomNav(context),
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
      title: InkWell(
        onTap: () => context.go('/home'),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                gradient: AppGradients.sunsetTerracotta,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.terrain_rounded, color: Colors.white, size: 16),
            ),
            const SizedBox(width: 8),
            Text(
              'BAQUEANO',
              style: GoogleFonts.montserrat(
                fontSize: 18,
                fontWeight: FontWeight.w900,
                letterSpacing: 1.5,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.search_rounded, color: AppColors.textLight),
          onPressed: () => context.go('/descubrir'),
        ),
        IconButton(
          icon: const Icon(Icons.smart_toy_outlined, color: AppColors.gold),
          onPressed: () => context.go('/ai'),
        ),
        const SizedBox(width: 4),
      ],
    );
  }

  // --- DESKTOP NAVBAR ---
  Widget _buildDesktopNavbar(BuildContext context) {
    return ClipRRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
        child: Container(
          height: 74,
          padding: const EdgeInsets.symmetric(horizontal: 32),
          decoration: BoxDecoration(
            color: AppColors.primaryDark.withValues(alpha: 0.85),
            border: const Border(bottom: BorderSide(color: AppColors.borderLight, width: 1)),
          ),
          child: Row(
            children: [
              // Logo
              InkWell(
                onTap: () => context.go('/home'),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        gradient: AppGradients.sunsetTerracotta,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.terrain_rounded, color: Colors.white, size: 20),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'BAQUEANO',
                          style: GoogleFonts.montserrat(
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 2.0,
                            color: Colors.white,
                          ),
                        ),
                        Text(
                          'NICARAGUA EXPEDITIONS',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.8,
                            color: AppColors.goldLight,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(width: 32),

              // Menu Links
              _buildNavLink(context, 'INICIO', '/home'),
              _buildExplorarDropdown(context),
              _buildNavLink(context, 'MAPA MUNDI', '/mapa'),
              _buildNavLink(context, 'BAQUEANO AI', '/ai', isHighlight: true),
              _buildNavLink(context, 'COMUNIDAD', '/comunidad'),
              _buildNosotrosDropdown(context),

              const Spacer(),

              // Language Selector
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.bgCard,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Row(
                  children: [
                    _buildLangChip('ES'),
                    const SizedBox(width: 4),
                    _buildLangChip('EN'),
                  ],
                ),
              ),

              const SizedBox(width: 16),

              // Passport Button
              BaqueanoButton(
                text: 'Mi Pasaporte',
                icon: const Icon(Icons.badge_outlined, size: 16, color: Colors.white),
                variant: BaqueanoButtonVariant.secondary,
                height: 40,
                onPressed: () => context.go('/pasaporte'),
              ),
              const SizedBox(width: 12),

              // Admin Button
              IconButton(
                tooltip: 'Panel Admin CMS',
                icon: const Icon(Icons.admin_panel_settings_outlined, color: AppColors.gold, size: 22),
                onPressed: () => context.go('/admin'),
              ),
            ],
          ),
        ),
      ),
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
        _buildPopupItem('🔐', 'Panel Admin (CMS)', 'Gestión y respaldos', '/admin'),
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
            _buildBottomNavItem(4, Icons.badge_rounded, 'Pasaporte'),
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
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    gradient: AppGradients.sunsetTerracotta,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.terrain_rounded, color: Colors.white, size: 24),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'BAQUEANO',
                      style: GoogleFonts.montserrat(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.5,
                        color: Colors.white,
                      ),
                    ),
                    Text(
                      'Nicaragua en modo secreto',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 11,
                        color: AppColors.goldLight,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(color: AppColors.borderLight),

            _buildDrawerSectionTitle('NAVEGACIÓN PRINCIPAL'),
            _buildDrawerItem(context, '🏠', 'Inicio', '/home'),
            _buildDrawerItem(context, '🧭', 'Descubrir Destinos', '/descubrir'),
            _buildDrawerItem(context, '🌍', 'Mapa Mundial & GPS', '/mapa'),
            _buildDrawerItem(context, '🤖', 'Baqueano AI Assistant', '/ai', isGold: true),
            _buildDrawerItem(context, '🛂', 'Mi Pasaporte de Explorador', '/pasaporte'),
            _buildDrawerItem(context, '👥', 'Comunidad & Bitácora', '/comunidad'),

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
            _buildDrawerSectionTitle('NOSOTROS & SOPORTE'),
            _buildDrawerItem(context, '🌿', 'Nuestra Marca & Manifiesto', '/marca'),
            _buildDrawerItem(context, '❓', 'Centro de Ayuda & FAQ', '/ayuda'),
            _buildDrawerItem(context, '📜', 'Términos y Condiciones', '/terminos'),
            _buildDrawerItem(context, '🛡️', 'Políticas de Privacidad', '/privacidad'),
            _buildDrawerItem(context, '🔐', 'Panel Admin (CMS)', '/admin'),

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
}
