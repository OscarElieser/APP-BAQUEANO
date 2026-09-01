import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';

class ImpactCounterStrip extends StatelessWidget {
  const ImpactCounterStrip({super.key});

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    return Container(
      width: double.infinity,
      margin: EdgeInsets.symmetric(
        horizontal: isDesktop ? 48.0 : 20.0,
        vertical: 16.0,
      ),
      padding: EdgeInsets.symmetric(
        horizontal: isDesktop ? 32.0 : 16.0,
        vertical: 20.0,
      ),
      decoration: BoxDecoration(
        gradient: AppGradients.cardGlass,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.25),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: isDesktop
          ? Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatItem('85%', 'Impacto Comunitario', 'Llega directo a familias rurales y guías'),
                _buildDivider(),
                _buildStatItem('50+', 'Emprendedores Aliados', 'Cabañas, comedores y guías certificados'),
                _buildDivider(),
                _buildStatItem('100+', 'Experiencias Únicas', 'Rutas volcánicas, ríos y cañones'),
                _buildDivider(),
                _buildStatItem('15', 'Departamentos', 'Cobertura nacional en toda Nicaragua'),
              ],
            )
          : Wrap(
              spacing: 16,
              runSpacing: 16,
              alignment: WrapAlignment.spaceAround,
              children: [
                _buildStatItemMobile('85%', 'Impacto Directo', 'A comunidades'),
                _buildStatItemMobile('50+', 'Emprendedores', 'Aliados locales'),
                _buildStatItemMobile('100+', 'Experiencias', 'Autenticadas'),
                _buildStatItemMobile('15', 'Departamentos', 'Cubiertos'),
              ],
            ),
    );
  }

  Widget _buildDivider() {
    return Container(
      height: 48,
      width: 1,
      color: AppColors.borderLight,
    );
  }

  Widget _buildStatItem(String number, String label, String sublabel) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        ShaderMask(
          shaderCallback: (bounds) => AppGradients.gold.createShader(
            Rect.fromLTWH(0, 0, bounds.width, bounds.height),
          ),
          child: Text(
            number,
            style: GoogleFonts.montserrat(
              fontSize: 32,
              fontWeight: FontWeight.w900,
              color: Colors.white,
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: GoogleFonts.spaceGrotesk(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: AppColors.textLight,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          sublabel,
          style: GoogleFonts.inter(
            fontSize: 11,
            color: AppColors.textMuted,
          ),
        ),
      ],
    );
  }

  Widget _buildStatItemMobile(String number, String label, String sublabel) {
    return SizedBox(
      width: 130,
      child: Column(
        children: [
          ShaderMask(
            shaderCallback: (bounds) => AppGradients.gold.createShader(
              Rect.fromLTWH(0, 0, bounds.width, bounds.height),
            ),
            child: Text(
              number,
              style: GoogleFonts.montserrat(
                fontSize: 26,
                fontWeight: FontWeight.w900,
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: GoogleFonts.spaceGrotesk(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: AppColors.textLight,
            ),
            textAlign: TextAlign.center,
          ),
          Text(
            sublabel,
            style: GoogleFonts.inter(
              fontSize: 10,
              color: AppColors.textMuted,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
