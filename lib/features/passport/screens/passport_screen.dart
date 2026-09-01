import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';

class PassportScreen extends StatelessWidget {
  const PassportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    return ResponsiveScaffold(
      currentIndex: 4,
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: EdgeInsets.symmetric(
          horizontal: isDesktop ? 48.0 : 20.0,
          vertical: 24.0,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SectionHeader(
              tag: 'DOCUMENTO OFICIAL DEL VIAJERO',
              title: '🛂 Pasaporte Digital de Explorador',
              subtitle: 'Tu bitácora de expediciones verificadas, sellos migratorios campesinos e insignias de conservación en Nicaragua.',
            ),
            const SizedBox(height: 16),

            // PASSPORT DOCUMENT BOOKLET
            _buildOfficialPassportBooklet(context, isDesktop),

            const SizedBox(height: 36),

            // STAMPS SECTION
            const SectionHeader(
              tag: 'CHECK-IN EN RUTA',
              title: 'Sellos de Expedición Verificados',
              subtitle: 'Sellos oficiales obtenidos al completar circuitos con guías baqueanos certificados.',
            ),
            const SizedBox(height: 12),

            _buildStampsGrid(isDesktop),

            const SizedBox(height: 36),

            // BADGES SECTION
            const SectionHeader(
              tag: 'GAMIFICACIÓN & RECONOCIMIENTOS',
              title: 'Insignias Coleccionables',
              subtitle: 'Desbloquea insignias respetando el decálogo ecológico y apoyando al turismo comunitario.',
            ),
            const SizedBox(height: 12),

            _buildBadgesGrid(isDesktop),

            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Widget _buildOfficialPassportBooklet(BuildContext context, bool isDesktop) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFF061A22),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: AppColors.gold, width: 2.0),
        boxShadow: [
          BoxShadow(
            color: AppColors.gold.withValues(alpha: 0.2),
            blurRadius: 30,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          // Passport Cover Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            decoration: BoxDecoration(
              gradient: AppGradients.volcanicHero,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(26)),
              border: const Border(bottom: BorderSide(color: AppColors.gold, width: 1.2)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Text('🇳🇮', style: TextStyle(fontSize: 32)),
                    const SizedBox(width: 14),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'REPÚBLICA DE NICARAGUA',
                          style: GoogleFonts.montserrat(
                            fontSize: 13,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 2.0,
                            color: AppColors.gold,
                          ),
                        ),
                        Text(
                          'PASAPORTE DE EXPEDICIÓN BAQUEANO',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.2,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.gold.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.gold),
                  ),
                  child: Text(
                    'OFICIAL · ACTIVO',
                    style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.goldLight),
                  ),
                ),
              ],
            ),
          ),

          // Passport Body
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: isDesktop
                ? Row(
                    children: [
                      // Left: Photo & QR
                      _buildIdentityPhotoAndQr(),
                      const SizedBox(width: 32),
                      // Right: Explorer Bio & XP
                      Expanded(child: _buildExplorerBio()),
                    ],
                  )
                : Column(
                    children: [
                      _buildIdentityPhotoAndQr(),
                      const SizedBox(height: 20),
                      _buildExplorerBio(),
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildIdentityPhotoAndQr() {
    return Column(
      children: [
        Stack(
          alignment: Alignment.bottomRight,
          children: [
            Container(
              width: 110,
              height: 120,
              decoration: BoxDecoration(
                color: AppColors.primaryLight,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.gold, width: 1.5),
                image: const DecorationImage(
                  image: NetworkImage('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'),
                  fit: BoxFit.cover,
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.all(4),
              decoration: const BoxDecoration(
                color: AppColors.success,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.verified, color: Colors.white, size: 16),
            ),
          ],
        ),
        const SizedBox(height: 12),
        // QR Code
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
          ),
          child: QrImageView(
            data: 'BAQUEANO-PASS-NIC-849204-EXPLORER',
            version: QrVersions.auto,
            size: 80,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'ID: BAQ-849204',
          style: GoogleFonts.spaceGrotesk(fontSize: 10, color: AppColors.goldLight, fontWeight: FontWeight.w700),
        ),
      ],
    );
  }

  Widget _buildExplorerBio() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('TITULAR DEL PASAPORTE', style: GoogleFonts.spaceGrotesk(fontSize: 10, color: AppColors.textMuted, letterSpacing: 1.0)),
                Text(
                  'VALERIA MENDOZA',
                  style: GoogleFonts.montserrat(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white),
                ),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                gradient: AppGradients.sunsetTerracotta,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'RANGO: BAQUEANO MAESTRO',
                style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.white),
              ),
            ),
          ],
        ),

        const SizedBox(height: 16),

        // Metadata grid
        Wrap(
          spacing: 24,
          runSpacing: 10,
          children: [
            _buildPassportMetaItem('NACIONALIDAD', 'Costa Rica 🇨🇷'),
            _buildPassportMetaItem('EXPEDICIONES', '6 Completadas'),
            _buildPassportMetaItem('VOLCANES CONQUISTADOS', '3 Cumbres'),
            _buildPassportMetaItem('CONTRIBUCIÓN DIRECTA', '\$285 USD'),
          ],
        ),

        const SizedBox(height: 18),

        // XP Progress Bar
        Text('EXPERIENCIA DE VIAJE (XP)', style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.goldLight)),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: LinearProgressIndicator(
            value: 1150 / 2000,
            minHeight: 10,
            backgroundColor: AppColors.primaryLight,
            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.gold),
          ),
        ),
        const SizedBox(height: 4),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('1,150 XP acumulados', style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted)),
            Text('Nivel Siguiente: 2,000 XP', style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.goldLight)),
          ],
        ),
      ],
    );
  }

  Widget _buildPassportMetaItem(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.spaceGrotesk(fontSize: 9, color: AppColors.textMuted, letterSpacing: 0.8)),
        Text(value, style: GoogleFonts.spaceGrotesk(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textLight)),
      ],
    );
  }

  Widget _buildStampsGrid(bool isDesktop) {
    final stamps = [
      {'name': 'Cañón de Somoto', 'date': '12 ENE 2026', 'guide': 'Don Toño Calero', 'stamped': true, 'icon': '🏊'},
      {'name': 'Cerro Negro Sandboarding', 'date': '24 FEB 2026', 'guide': 'Chepe Ruiz', 'stamped': true, 'icon': '🌋'},
      {'name': 'Cascada La Luna', 'date': '15 MAR 2026', 'guide': 'Doña Rosa Valle', 'stamped': true, 'icon': '💧'},
      {'name': 'Isla de Ometepe', 'date': '02 ABR 2026', 'guide': 'Mayra Carcache', 'stamped': true, 'icon': '🏝️'},
      {'name': 'Volcán Masaya Nocturno', 'date': 'Pendiente', 'guide': 'Baqueano Local', 'stamped': false, 'icon': '🔥'},
      {'name': 'Little Corn Island', 'date': 'Pendiente', 'guide': 'Captain Jackson', 'stamped': false, 'icon': '🏖️'},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithMaxCrossAxisExtent(
        maxCrossAxisExtent: isDesktop ? 350 : 500,
        mainAxisExtent: 140,
        crossAxisSpacing: 14,
        mainAxisSpacing: 14,
      ),
      itemCount: stamps.length,
      itemBuilder: (context, index) {
        final s = stamps[index];
        final isStamped = s['stamped'] as bool;

        return Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: isStamped ? AppColors.terracotta.withValues(alpha: 0.12) : AppColors.bgCard.withValues(alpha: 0.4),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isStamped ? AppColors.terracotta : AppColors.borderLight,
              width: isStamped ? 1.5 : 0.8,
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isStamped ? AppColors.terracotta.withValues(alpha: 0.3) : AppColors.primaryLight,
                  border: Border.all(color: isStamped ? AppColors.gold : AppColors.borderLight),
                ),
                child: Center(child: Text(s['icon'] as String, style: const TextStyle(fontSize: 22))),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      s['name'] as String,
                      style: GoogleFonts.montserrat(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: isStamped ? AppColors.textLight : AppColors.textMuted,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Guía: ${s['guide']}',
                      style: GoogleFonts.inter(fontSize: 11, color: isStamped ? AppColors.goldLight : AppColors.textMuted),
                    ),
                    Text(
                      isStamped ? '✓ SELLADO EL ${s['date']}' : '🔒 BLOQUEADO',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        color: isStamped ? AppColors.success : AppColors.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildBadgesGrid(bool isDesktop) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithMaxCrossAxisExtent(
        maxCrossAxisExtent: isDesktop ? 350 : 500,
        mainAxisExtent: 130,
        crossAxisSpacing: 14,
        mainAxisSpacing: 14,
      ),
      itemCount: CatalogData.passportBadges.length,
      itemBuilder: (context, index) {
        final badge = CatalogData.passportBadges[index];

        return GlassContainer(
          padding: const EdgeInsets.all(14),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: badge.isUnlocked ? AppColors.gold : AppColors.borderLight,
            width: badge.isUnlocked ? 1.2 : 0.8,
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: badge.isUnlocked ? AppColors.gold.withValues(alpha: 0.2) : AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: badge.isUnlocked ? AppColors.gold : AppColors.borderLight),
                ),
                child: Center(
                  child: Text(
                    badge.icon,
                    style: TextStyle(fontSize: 22, color: badge.isUnlocked ? null : Colors.grey),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          badge.title,
                          style: GoogleFonts.montserrat(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: badge.isUnlocked ? AppColors.goldLight : AppColors.textMuted,
                          ),
                        ),
                        Text(
                          '+${badge.xpValue} XP',
                          style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.terracottaLight),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      badge.description,
                      style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted, height: 1.3),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
