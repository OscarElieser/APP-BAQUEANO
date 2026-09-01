import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';

class TermsScreen extends StatelessWidget {
  const TermsScreen({super.key});

  final List<Map<String, String>> termsArticles = const [
    {
      'num': '01',
      'title': 'Aceptación y Objeto de los Términos',
      'content': 'El presente documento establece las Condiciones de Uso que rigen el acceso y utilización de la plataforma digital BAQUEANO NICARAGUA. Al acceder, navegar o registrarse, el usuario acepta de manera expresa y vinculante el cumplimiento íntegro de estos términos.',
    },
    {
      'num': '02',
      'title': 'Naturaleza del Servicio y Rol Tecnológico',
      'content': 'Baqueano opera como una solución tecnológica y canal de comunicación directo que vincula a viajeros ("Exploradores") con emprendimientos rurales, guías comunitarios independientes, hospedajes y comedores ("Prestadores Locales"). Baqueano no es una agencia tradicional mayorista.',
    },
    {
      'num': '03',
      'title': 'Registro de Usuarios y Seguridad de la Cuenta',
      'content': 'Para acceder a funciones como guardar favoritos, solicitar reservas o interactuar en la comunidad, el usuario debe registrarse proporcionando información veraz y actualizada.',
    },
    {
      'num': '04',
      'title': 'Responsabilidad y Riesgo en Ecoturismo de Aventura',
      'content': 'El usuario reconoce que las actividades de turismo de naturaleza y aventura (senderismo en volcanes activos, descenso en cañones, cabalgatas, navegación fluvial) conllevan riesgos inherentes al entorno natural. El explorador se compromete a acatar siempre las instrucciones del baqueano asignado.',
    },
    {
      'num': '05',
      'title': 'Políticas de Reserva, Precios y Cancelaciones',
      'content': 'Los precios se presentan en Dólares (USD) y Córdobas (NIO) con fines informativos. El pago final se coordina de manera directa y transparente con el prestador local. En caso de fuerza mayor climática, se prioriza la reprogramación de fecha sin penalización.',
    },
    {
      'num': '06',
      'title': 'Código de Conducta y Turismo Comunitario Ético',
      'content': 'Queda estrictamente prohibido extraer flora, fauna, formaciones geológicas o piezas arqueológicas de senderos y áreas protegidas. Rige el principio de "Basura Cero".',
    },
    {
      'num': '07',
      'title': 'Propiedad Intelectual y Contenidos',
      'content': 'Los logotipos, marcas, diseños visuales y código fuente son propiedad exclusiva de Baqueano. Las fotografías y relatos compartidos por usuarios en la bitácora continúan siendo propiedad de sus respectivos autores con licencia para promoción turística comunitaria.',
    },
    {
      'num': '08',
      'title': 'Legislación Aplicable y Jurisdicción',
      'content': 'Estos términos se rigen e interpretan de conformidad con las leyes vigentes de la República de Nicaragua y las disposiciones del INTUR y MARENA.',
    },
  ];

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
              tag: 'MARCO LEGAL',
              title: '📜 Términos y Condiciones de Uso',
              subtitle: 'Reglas claras para proteger tanto al explorador como a las comunidades anfitrionas de Nicaragua.',
            ),
            const SizedBox(height: 16),

            ...termsArticles.map((art) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 14.0),
                child: GlassContainer(
                  padding: const EdgeInsets.all(20),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppColors.borderLight),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.terracotta.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.terracottaLight),
                        ),
                        child: Text(
                          art['num']!,
                          style: GoogleFonts.spaceGrotesk(fontSize: 14, fontWeight: FontWeight.w900, color: AppColors.goldLight),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              art['title']!,
                              style: GoogleFonts.montserrat(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.textLight),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              art['content']!,
                              style: GoogleFonts.inter(fontSize: 13, color: AppColors.textMuted, height: 1.45),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }
}
