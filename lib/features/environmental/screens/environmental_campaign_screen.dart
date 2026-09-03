// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CAMPAÑA AMBIENTAL & CUIDADO DE NUESTROS RECURSOS
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Nicaragua alberga el 7% de la biodiversidad del planeta, 78 áreas protegidas,
//   y reservas de biosfera de la UNESCO (Bosawás, Río San Juan, Ometepe).
// - El objetivo medular e innegociable de Baqueano es la preservación absoluta
//   de los ecosistemas naturales y el apoyo directo a las comunidades campesinas.
// - Esta pantalla educa, sensibiliza y compromete activamente tanto a turistas
//   nacionales como a viajeros internacionales en el cuidado riguroso de volcanes,
//   lagunas cratéricas, arrecifes caribeños, nebliselvas y fauna silvestre.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `StatefulWidget` con persistencia local (`SharedPreferences`) del compromiso
//   ambiental ("Pledge del Explorador").
// - Despliegue interactivo de los 8 Mandamientos del Viajero Responsable.
// - Generación de certificado digital interactivo de "Guardián de los Recursos".
// - Integración con `url_launcher` y `Share` / WhatsApp para viralizar la campaña.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `EnvironmentalCampaignScreen`: Pantalla oficial de la campaña ambiental en `/campana-ambiental`.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/baqueano_button.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';

class EnvironmentalCampaignScreen extends StatefulWidget {
  const EnvironmentalCampaignScreen({super.key});

  @override
  State<EnvironmentalCampaignScreen> createState() => _EnvironmentalCampaignScreenState();
}

class _EnvironmentalCampaignScreenState extends State<EnvironmentalCampaignScreen> {
  bool _hasSignedPledge = false;
  final TextEditingController _nameController = TextEditingController();

  final List<Map<String, dynamic>> _commandments = const [
    {
      'icon': '🐢',
      'title': 'Protección Total de Fauna Silvestre',
      'highlight': 'Prohibido tocar, alimentar o acosar animales',
      'description': 'Monos congos, tortugas paslama en desove (Chococente y La Flor), aves de Los Guatuzos y tiburones nodriza en Corn Island merecen respeto absoluto. Nunca compres artesanías de caparazón de carey, plumas o conchas marinas.',
      'color': AppColors.jungleGreen,
    },
    {
      'icon': '🚫',
      'title': 'Cero Plásticos & "No Dejes Rastro"',
      'highlight': 'Lo que sube contigo, regresa en tu mochila',
      'description': 'En las cumbres volcánicas (Telica, Concepción, Cerro Negro) y en el fondo del Cañón de Somoto no hay cuadrillas de limpieza. Lleva cantimploras reutilizables y traslada todos tus desechos hasta centros de acopio autorizados.',
      'color': AppColors.terracotta,
    },
    {
      'icon': '💧',
      'title': 'Cuidado Sagrado de Fuentes de Agua Dulce',
      'highlight': 'Bloqueadores biodegradables obligatorios',
      'description': 'En la Laguna de Apoyo, ríos de Matagalpa y cascadas naturales, no uses bloqueadores con químicos tóxicos (oxibenzona). Los químicos matan los alevines y enturbian el agua mineral volcánica pura.',
      'color': Color(0xFF0284C7),
    },
    {
      'icon': '🪸',
      'title': 'Arrecifes de Coral Vivos en el Caribe',
      'highlight': 'Nunca te pares ni toques el coral',
      'description': 'En Southwest Bay, Brig Bay y los Cayos Perlas, nada con flotabilidad controlada. Quebrar una sola rama de coral cerebro o cuerno de alce toma más de 50 años en recuperarse.',
      'color': Color(0xFFE11D48),
    },
    {
      'icon': '🔥',
      'title': 'Prevención Rigurosa de Incendios Forestales',
      'highlight': 'Cero fogatas no autorizadas',
      'description': 'En los bosques secos del Pacífico y los pinares de Dipilto-Jalapa, una sola colilla o brasa puede desatar incendios que arrasen miles de hectáreas protegidas y destruyan nidos de aves nativas.',
      'color': Color(0xFFEA580C),
    },
    {
      'icon': '🌾',
      'title': 'Comercio Campesino que Salva Bosques',
      'highlight': 'Consume local, orgánico y de comercio justo',
      'description': 'Comprar frutas, café de sombra y comida típica directamente a cooperativas y familias campesinas garantiza que no tengan que talar sus bosques para subsistir. El turismo regenerativo fortalece el arraigo campesino.',
      'color': AppColors.gold,
    },
    {
      'icon': '👣',
      'title': 'Respeta los Senderos de los Baqueanos',
      'highlight': 'Evita la erosión y el pisoteo de flora silvestre',
      'description': 'Caminar fuera de las trochas delimitadas fragmenta el hábitat de pequeños mamíferos y acelera la erosión de laderas volcánicas ante las lluvias tropicales. Sigue siempre a tu guía nativo.',
      'color': Color(0xFF059669),
    },
    {
      'icon': '🤝',
      'title': 'Respeto a la Identidad Cultural y Comunitaria',
      'highlight': 'Pide permiso antes de fotografiar',
      'description': 'Las comunidades campesinas e indígenas de Nicaragua no son una atracción turística: son familias con historia y dignidad. Saluda cordialmente y solicita permiso antes de fotografiar a personas o ceremonias.',
      'color': Color(0xFF7C3AED),
    },
  ];

  @override
  void initState() {
    super.initState();
    _loadPledgeStatus();
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _loadPledgeStatus() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _hasSignedPledge = prefs.getBool('signed_environmental_pledge') ?? false;
      _nameController.text = prefs.getString('pledge_signer_name') ?? '';
    });
  }

  Future<void> _signPledge() async {
    final name = _nameController.text.trim();
    if (name.isEmpty) {
      CustomToast.show(context, message: 'Por favor ingresa tu nombre completo');
      return;
    }

    HapticFeedback.heavyImpact();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('signed_environmental_pledge', true);
    await prefs.setString('pledge_signer_name', name);

    setState(() {
      _hasSignedPledge = true;
    });

    if (mounted) {
      CustomToast.success(context, '¡Felicidades! Eres Guardián Oficial de Nicaragua');
    }
  }

  Future<void> _sharePledge() async {
    HapticFeedback.lightImpact();
    final name = _nameController.text.trim().isNotEmpty ? _nameController.text.trim() : 'Un explorador';
    final message = Uri.encodeComponent(
      '🌿🇳🇮 $name acaba de firmar el COMPROMISO AMBIENTAL DE BAQUEANO NICARAGUA para proteger nuestros volcanes, lagunas, arrecifes y fauna silvestre.\n\n'
      '¡Únete tú también al turismo regenerativo sin intermediarios con la app Baqueano!',
    );
    final uri = Uri.parse('https://wa.me/?text=$message');
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {
      if (mounted) {
        CustomToast.show(context, message: '¡Gracias por compartir el compromiso verde!');
      }
    }
  }

  Future<void> _reportEnvironmentalIssue() async {
    HapticFeedback.lightImpact();
    final phone = '+50588880000'; // Línea institucional de protección ambiental
    final uri = Uri.parse('tel:$phone');
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {
      if (mounted) {
        CustomToast.show(context, message: 'Reporte a Guardaparques: Contacta a tu guía baqueano local');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    return ResponsiveScaffold(
      currentIndex: 0,
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
              tag: 'OBJETIVO PRINCIPAL DE BAQUEANO',
              title: '🌿 Campaña Ambiental & Cuidado de Nuestros Recursos',
              subtitle: 'Sensibilización activa para turistas nacionales e internacionales: proteger los volcanes, lagunas, selvas y arrecifes de Nicaragua.',
            ),
            const SizedBox(height: 18),

            // Hero Banner Monumental de Sensibilización
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    const Color(0xFF064E3B), // Verde bosque profundo
                    AppColors.primaryDark,
                    const Color(0xFF082B35),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppColors.jungleGreenLight, width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.jungleGreen.withValues(alpha: 0.3),
                    blurRadius: 22,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.jungleGreen.withValues(alpha: 0.25),
                          shape: BoxShape.circle,
                          border: Border.all(color: AppColors.jungleGreenLight),
                        ),
                        child: const Text('🇳🇮', style: TextStyle(fontSize: 32)),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'TURISMO REGENERATIVO & SOSTENIBLE',
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: AppColors.goldLight,
                                letterSpacing: 1.0,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              'Nicaragua no se visita: se cuida, se respeta y se honra.',
                              style: GoogleFonts.montserrat(
                                fontSize: 16,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Cada volcán que escalas, cada laguna cratérica donde nadas y cada playa donde desovan las tortugas marinas es el hogar de comunidades campesinas e indígenas. Nuestro compromiso innegociable es garantizar que tu visita deje una huella positiva imborrable en las familias locales y cero impacto destructivo en la naturaleza.',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: Colors.white.withValues(alpha: 0.88),
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 10,
                    runSpacing: 8,
                    children: [
                      _buildPillTag('🐢 78 Áreas Protegidas', AppColors.jungleGreenLight),
                      _buildPillTag('🌊 3 Reservas de Biosfera UNESCO', AppColors.goldLight),
                      _buildPillTag('🚫 0% Tolerancia a la Basura', AppColors.terracottaLight),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),

            // Título de Mandamientos
            Text(
              'LOS 8 MANDAMIENTOS DEL VIAJERO RESPONSABLE',
              style: GoogleFonts.spaceGrotesk(
                fontSize: 13,
                fontWeight: FontWeight.w800,
                color: AppColors.goldLight,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Reglas de oro para preservar la biodiversidad nicaragüense durante tus expediciones:',
              style: GoogleFonts.inter(fontSize: 13, color: Colors.white70),
            ),
            const SizedBox(height: 16),

            // Lista de los 8 Mandamientos Ambientales
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _commandments.length,
              separatorBuilder: (_, __) => const SizedBox(height: 14),
              itemBuilder: (context, index) {
                final item = _commandments[index];
                final Color accentColor = item['color'] as Color;

                return GlassContainer(
                  padding: const EdgeInsets.all(18),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: accentColor.withValues(alpha: 0.4), width: 1.2),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: accentColor.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: accentColor.withValues(alpha: 0.6)),
                        ),
                        child: Text(item['icon'] as String, style: const TextStyle(fontSize: 26)),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item['title'] as String,
                              style: GoogleFonts.montserrat(
                                fontSize: 15,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              item['highlight'] as String,
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w700,
                                color: accentColor,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              item['description'] as String,
                              style: GoogleFonts.inter(
                                fontSize: 12.5,
                                color: Colors.white70,
                                height: 1.45,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),

            const SizedBox(height: 32),

            // SECCIÓN INTERACTIVA: FIRMA DEL COMPROMISO AMBIENTAL
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                gradient: AppGradients.volcanicHero,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppColors.gold, width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.gold.withValues(alpha: 0.15),
                    blurRadius: 20,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.gold.withValues(alpha: 0.2),
                          shape: BoxShape.circle,
                        ),
                        child: const Text('📜', style: TextStyle(fontSize: 26)),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'PLEDGE DEL EXPLORADOR BAQUEANO',
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: AppColors.goldLight,
                                letterSpacing: 0.8,
                              ),
                            ),
                            Text(
                              'Firma tu Compromiso Verde Oficial',
                              style: GoogleFonts.montserrat(
                                fontSize: 17,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text(
                    '«Como explorador consciente en suelo nicaragüense, prometo honrar la naturaleza, respetar a los baqueanos campesinos, no dejar ningún rastro de basura, proteger la fauna silvestre y consumir comercio justo para que las familias rurales sigan siendo las guardianas de nuestras selvas y volcanes.»',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontStyle: FontStyle.italic,
                      color: Colors.white.withValues(alpha: 0.9),
                      height: 1.45,
                    ),
                  ),
                  const SizedBox(height: 18),

                  if (_hasSignedPledge) ...[
                    // Estado Firmado y Certificado
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.primaryDark,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.jungleGreenLight, width: 1.2),
                      ),
                      child: Column(
                        children: [
                          const Icon(Icons.verified_rounded, color: AppColors.jungleGreenLight, size: 36),
                          const SizedBox(height: 6),
                          Text(
                            '¡COMPROMISO VERDE FIRMADO!',
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              color: AppColors.jungleGreenLight,
                              letterSpacing: 1.0,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Guardián(a) Oficial: ${_nameController.text.trim()}',
                            style: GoogleFonts.montserrat(
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 14),
                          BaqueanoButton(
                            text: 'Compartir mi Compromiso en WhatsApp',
                            icon: const Icon(Icons.share_rounded, size: 18),
                            variant: BaqueanoButtonVariant.gold,
                            height: 44,
                            width: double.infinity,
                            onPressed: _sharePledge,
                          ),
                        ],
                      ),
                    ),
                  ] else ...[
                    // Formulario de Firma
                    TextField(
                      controller: _nameController,
                      style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                      cursorColor: AppColors.gold,
                      decoration: InputDecoration(
                        labelText: 'Tu Nombre Completo para el Certificado',
                        labelStyle: GoogleFonts.spaceGrotesk(color: AppColors.goldLight, fontSize: 13),
                        hintText: 'Ej: María José Morales',
                        hintStyle: GoogleFonts.inter(color: Colors.white38, fontSize: 13),
                        prefixIcon: const Icon(Icons.edit_note_rounded, color: AppColors.gold),
                        filled: true,
                        fillColor: AppColors.primaryDark,
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: const BorderSide(color: AppColors.borderLight),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: const BorderSide(color: AppColors.gold, width: 1.5),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    BaqueanoButton(
                      text: 'FIRMAR COMPROMISO VERDE AHORA',
                      icon: const Icon(Icons.check_circle_outline_rounded, size: 18),
                      variant: BaqueanoButtonVariant.primary,
                      height: 48,
                      width: double.infinity,
                      onPressed: _signPledge,
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Reporte y Alerta Ambiental
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.primaryDark,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.terracotta.withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.emergency_rounded, color: AppColors.terracottaLight, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '¿Presenciaste caza furtiva o daño ambiental?',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                        Text(
                          'Informa de inmediato a guardaparques o guías locales certificados.',
                          style: GoogleFonts.inter(fontSize: 11.5, color: Colors.white60),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  BaqueanoButton(
                    text: 'Contactar',
                    variant: BaqueanoButtonVariant.outline,
                    height: 36,
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    onPressed: _reportEnvironmentalIssue,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Widget _buildPillTag(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.5)),
      ),
      child: Text(
        text,
        style: GoogleFonts.spaceGrotesk(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: color,
        ),
      ),
    );
  }
}
