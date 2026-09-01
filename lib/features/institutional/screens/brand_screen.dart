import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/baqueano_logo.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';

class BrandScreen extends StatelessWidget {
  const BrandScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    return ResponsiveScaffold(
      currentIndex: 1,
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
              tag: 'IDENTIDAD & PROPÓSITO',
              title: '🌿 Nuestra Marca & Manifiesto Baqueano',
              subtitle: '«Descubre lo que no sale en el mapa». Somos el puente tecnológico entre la sabiduría ancestral de los guías locales y el viajero consciente.',
            ),
            const SizedBox(height: 20),

            // Official Logo Emblem Showcase Card
            Center(
              child: GlassContainer(
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 28),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppColors.borderGold, width: 1.2),
                backgroundColor: AppColors.primaryDark.withValues(alpha: 0.7),
                child: const BaqueanoLogo(size: BaqueanoLogoSize.large),
              ),
            ),
            const SizedBox(height: 24),

            // Manifiesto Quote
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: AppGradients.sunsetTerracotta,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.terracotta.withValues(alpha: 0.35),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                children: [
                  const Icon(Icons.format_quote, color: Colors.white, size: 36),
                  const SizedBox(height: 8),
                  Text(
                    '«En Nicaragua, un "Baqueano" es el conocedor nato de los senderos secretos, volcanes y ríos donde ningún mapa tradicional llega. Existimos para dignificar su labor y proteger nuestra tierra.»',
                    style: GoogleFonts.montserrat(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                      fontStyle: FontStyle.italic,
                      height: 1.4,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // Misión y Visión
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: _buildInfoCard(
                    '🎯 NUESTRA MISIÓN',
                    'Empoderar a las comunidades rurales, cooperativas y guías baqueanos de Nicaragua mediante tecnología digital de vanguardia e inteligencia artificial ética, permitiendo que ofrezcan experiencias auténticas y seguras directamente al viajero, asegurando ingresos justos y preservando el patrimonio natural.',
                    AppColors.craterTeal,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildInfoCard(
                    '🔭 NUESTRA VISIÓN',
                    'Consolidarnos como el ecosistema digital líder de ecoturismo y turismo comunitario regenerativo en Centroamérica, transformando la forma en que el mundo experimenta Nicaragua: a través de viajes responsables que regeneran ecosistemas y celebran el folklore auténtico.',
                    AppColors.terracotta,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 32),

            // Paleta de Colores Explicada
            const SectionHeader(
              tag: 'SISTEMA VISUAL',
              title: 'Nuestra Paleta de Colores & Qué Nos Representa',
              subtitle: 'Cada tonalidad de la identidad Baqueano encapsula la geografía y cultura viva de Nicaragua.',
            ),
            const SizedBox(height: 12),

            _buildColorMeaningCard(
              'Verde Selva Profundo (#2E7D32)',
              'Representa la inmensidad de las reservas naturales vírgenes (Indio Maíz, Peñas Blancas y Bosawás), encarnando nuestro compromiso con la protección ecológica.',
              AppColors.jungleGreen,
            ),
            const SizedBox(height: 10),
            _buildColorMeaningCard(
              'Teal Aguas de Cráter (#00A896)',
              'Evoca las aguas minerales de la Laguna de Apoyo, las pozas del Cañón de Somoto, la Cascada La Luna y las corrientes fluviales de Nicaragua.',
              AppColors.craterTeal,
            ),
            const SizedBox(height: 10),
            _buildColorMeaningCard(
              'Arena Costera & Calidez (#F4EBD9)',
              'Simboliza las costas del Pacífico, las orillas de la Isla de Ometepe y la calidez hospitalaria con la que las familias rurales acogen a cada visitante.',
              AppColors.sand,
              textColor: AppColors.textDark,
            ),
            const SizedBox(height: 10),
            _buildColorMeaningCard(
              'Terracota / Naranja Fuego & Atardecer (#C86432)',
              'El color insigne de Baqueano: encarna el fuego de la cordillera volcánica activa (Masaya, Cerro Negro, Telica), los atardeceres y la pasión comunitaria.',
              AppColors.terracotta,
            ),
            const SizedBox(height: 10),
            _buildColorMeaningCard(
              'Oro / Acento Dorado (#D4AF37)',
              'Representa el valor sagrado de la cultura precolombina, los maizales maduros y el estándar de excelencia en cada expedición.',
              AppColors.gold,
              textColor: AppColors.textDark,
            ),

            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard(String tag, String text, Color accentColor) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: accentColor.withValues(alpha: 0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(tag, style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w800, color: accentColor)),
          const SizedBox(height: 10),
          Text(text, style: GoogleFonts.inter(fontSize: 12, color: AppColors.textLight.withValues(alpha: 0.9), height: 1.45)),
        ],
      ),
    );
  }

  Widget _buildColorMeaningCard(String title, String desc, Color color, {Color textColor = Colors.white}) {
    return GlassContainer(
      padding: const EdgeInsets.all(16),
      borderRadius: BorderRadius.circular(16),
      border: Border.all(color: AppColors.borderLight),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: GoogleFonts.montserrat(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.textLight)),
                const SizedBox(height: 4),
                Text(desc, style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted, height: 1.35)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
