import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../theme/app_colors.dart';
import 'baqueano_logo.dart';

class PremiumFooter extends StatelessWidget {
  const PremiumFooter({super.key});

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppColors.primaryDark,
        border: const Border(top: BorderSide(color: AppColors.borderLight, width: 1.2)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.5),
            blurRadius: 30,
            offset: const Offset(0, -10),
          ),
        ],
      ),
      child: Column(
        children: [
          // Top Impact Banner
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppColors.terracotta.withValues(alpha: 0.2),
                  AppColors.primaryLight.withValues(alpha: 0.4),
                  AppColors.terracotta.withValues(alpha: 0.2),
                ],
              ),
              border: const Border(bottom: BorderSide(color: AppColors.borderLight, width: 0.8)),
            ),
            child: Center(
              child: Wrap(
                alignment: WrapAlignment.center,
                crossAxisAlignment: WrapCrossAlignment.center,
                spacing: 16,
                runSpacing: 8,
                children: [
                  const Text('🌿', style: TextStyle(fontSize: 18)),
                  Text(
                    '85% del valor de cada reserva va directamente a las familias campesinas y guías locales.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.montserrat(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.goldLight,
                      letterSpacing: 0.5,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.jungleGreen,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      'TURISMO CONSCIENTE',
                      style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Main Multi-Column Footer Body
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: isDesktop ? 60.0 : 24.0,
              vertical: 48.0,
            ),
            child: isDesktop
                ? Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Brand Column
                      Expanded(flex: 4, child: _buildBrandCol(context)),
                      const SizedBox(width: 48),
                      // Links Col 1: Explorar
                      Expanded(flex: 2, child: _buildCol1(context)),
                      const SizedBox(width: 24),
                      // Links Col 2: Catálogo Cultural
                      Expanded(flex: 2, child: _buildCol2(context)),
                      const SizedBox(width: 24),
                      // Links Col 3: Institucional & Legal
                      Expanded(flex: 2, child: _buildCol3(context)),
                    ],
                  )
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildBrandCol(context),
                      const SizedBox(height: 32),
                      const Divider(color: AppColors.borderLight),
                      const SizedBox(height: 24),
                      _buildCol1(context),
                      const SizedBox(height: 24),
                      _buildCol2(context),
                      const SizedBox(height: 24),
                      _buildCol3(context),
                    ],
                  ),
          ),

          // Bottom Bar (Copyright, Flags, Social)
          Container(
            padding: EdgeInsets.symmetric(
              horizontal: isDesktop ? 60.0 : 24.0,
              vertical: 20.0,
            ),
            decoration: BoxDecoration(
              color: AppColors.bgDark,
              border: const Border(top: BorderSide(color: AppColors.borderLight, width: 0.8)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Row(
                    children: [
                      const Text('🇳🇮', style: TextStyle(fontSize: 20)),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          '© 2026 BAQUEANO · Ecoturismo & Expediciones Comunitarias de Nicaragua. Todos los derechos reservados.',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            color: AppColors.textMuted,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _buildSocialIcon(Icons.camera_alt_outlined, 'https://instagram.com'),
                    const SizedBox(width: 8),
                    _buildSocialIcon(Icons.chat_bubble_outline_rounded, 'https://wa.me/50588888888'),
                    const SizedBox(width: 8),
                    _buildSocialIcon(Icons.video_library_outlined, 'https://youtube.com'),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBrandCol(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const BaqueanoLogo(size: BaqueanoLogoSize.medium),
        const SizedBox(height: 16),
        Text(
          '«Descubre lo que no sale en el mapa». Somos el ecosistema digital que conecta a viajeros intrépidos con baqueanos campesinos, rutas secretas y la identidad cultural más profunda de Nicaragua.',
          style: GoogleFonts.inter(
            fontSize: 13,
            color: AppColors.textLight.withValues(alpha: 0.8),
            height: 1.5,
          ),
        ),
        const SizedBox(height: 20),
        Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.primaryLight.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.borderGold),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.verified, size: 14, color: AppColors.gold),
                  const SizedBox(width: 6),
                  Text(
                    'GUÍAS CERTIFICADOS INTUR',
                    style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.goldLight),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildCol1(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildColTitle('EXPLORACIÓN'),
        _buildFooterLink(context, 'Destinos Populares', '/descubrir'),
        _buildFooterLink(context, 'Mapa Mundial GPS', '/mapa'),
        _buildFooterLink(context, 'Baqueano AI Assistant', '/ai'),
        _buildFooterLink(context, 'Pasaporte Digital', '/pasaporte'),
        _buildFooterLink(context, 'Comunidad de Viajeros', '/comunidad'),
      ],
    );
  }

  Widget _buildCol2(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildColTitle('CATÁLOGO CULTURAL'),
        _buildFooterLink(context, 'Gastronomía Ancestral', '/gastronomia'),
        _buildFooterLink(context, 'Música & Folklore', '/musica'),
        _buildFooterLink(context, 'Videos 4K', '/videos'),
        _buildFooterLink(context, 'Playas & Ríos', '/playas'),
        _buildFooterLink(context, 'Eco-Lodges Rústicos', '/hospedaje'),
        _buildFooterLink(context, 'Vida Nocturna', '/nocturna'),
      ],
    );
  }

  Widget _buildCol3(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildColTitle('INSTITUCIONAL'),
        _buildFooterLink(context, 'Nuestra Marca', '/marca'),
        _buildFooterLink(context, 'Centro de Ayuda', '/ayuda'),
        _buildFooterLink(context, 'Términos & Condiciones', '/terminos'),
        _buildFooterLink(context, 'Políticas de Privacidad', '/privacidad'),
        _buildFooterLink(context, 'Panel Administrador', '/admin'),
      ],
    );
  }

  Widget _buildColTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Text(
        title,
        style: GoogleFonts.montserrat(
          fontSize: 12,
          fontWeight: FontWeight.w900,
          color: AppColors.gold,
          letterSpacing: 1.5,
        ),
      ),
    );
  }

  Widget _buildFooterLink(BuildContext context, String title, String route) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        onTap: () => context.go(route),
        borderRadius: BorderRadius.circular(4),
        child: Text(
          title,
          style: GoogleFonts.inter(
            fontSize: 13,
            color: AppColors.textLight.withValues(alpha: 0.75),
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _buildSocialIcon(IconData icon, String url) {
    return InkWell(
      onTap: () => _launchUrl(url),
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.primaryLight.withValues(alpha: 0.6),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.borderLight),
        ),
        child: Icon(icon, color: AppColors.goldLight, size: 16),
      ),
    );
  }
}
