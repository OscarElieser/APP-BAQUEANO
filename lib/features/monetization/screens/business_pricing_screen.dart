// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PLANES COMERCIALES & MEMBRESÍAS DE NEGOCIOS
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Servir como el portal comercial y de ventas B2B donde dueños de eco-lodges,
//   hoteles boutique, restaurantes, guías nativos y cooperativas campesinas
//   descubren el valor de afiliarse a Baqueano y eligen su plan de membresía.
// - Eliminar intermediarios abusivos (Booking, Airbnb) y ofrecer un canal directo
//   hacia turistas nacionales e internacionales con cero comisiones por reserva.
// - Generar ingresos recurrentes sostenibles para el ecosistema Baqueano.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `StatefulWidget` con conmutador de facturación mensual / anual con 20% de ahorro.
// - Calculadora interactiva reactiva de Retorno de Inversión (ROI) que demuestra
//   visualmente que la membresía se paga sola con un solo cliente al mes.
// - Tabla comparativa ergonómica y adaptable para pantallas móviles y anchas.
// - Despacho de contratación directa mediante enlace formal a WhatsApp comercial
//   y correo institucional a `negocios@baqueano.com`.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & PANTALLA EXPUESTA):
// - `BusinessPricingScreen`: Pantalla oficial mapeada en la ruta `/planes-negocios`.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/baqueano_button.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';

class BusinessPricingScreen extends StatefulWidget {
  const BusinessPricingScreen({super.key});

  @override
  State<BusinessPricingScreen> createState() => _BusinessPricingScreenState();
}

class _BusinessPricingScreenState extends State<BusinessPricingScreen> {
  bool _isAnnual = false;
  double _estimatedClients = 3.0;
  final double _averageTicketUsd = 30.0;

  Future<void> _subscribePlan(String planName, String priceUsd) async {
    HapticFeedback.mediumImpact();
    final billing = _isAnnual ? 'Facturación Anual (20% descuento)' : 'Facturación Mensual';
    final msg = Uri.encodeComponent(
      '🤝 *SOLICITUD DE AFILIACIÓN COMERCIAL BAQUEANO*\n\n'
      'Hola equipo Baqueano, deseo activar el *$planName* ($priceUsd - $billing) para mi negocio turístico.\n'
      'Por favor coordinemos los detalles y la activación de mi ficha oficial.',
    );
    final waUri = Uri.parse('https://wa.me/50588883333?text=$msg');

    try {
      await launchUrl(waUri, mode: LaunchMode.externalApplication);
    } catch (_) {
      if (mounted) {
        CustomToast.show(context, message: 'Escríbenos a negocios@baqueano.com');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    final monthlyVerified = _isAnnual ? 16.0 : 20.0;
    final monthlyFeatured = _isAnnual ? 36.0 : 45.0;

    // Cálculo del ROI: ingresos adicionales generados vs costo del plan
    final extraRevenueUsd = _estimatedClients * _averageTicketUsd;
    final planCost = monthlyVerified;
    final netProfit = extraRevenueUsd - planCost;

    return ResponsiveScaffold(
      currentIndex: 0,
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: EdgeInsets.symmetric(
          horizontal: isDesktop ? 48.0 : 20.0,
          vertical: 24.0,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SectionHeader(
              tag: 'ALIANZAS & CRECIMIENTO COMERCIAL',
              title: '💼 Planes de Afiliación para Negocios',
              subtitle: 'Digitaliza tu hotel, restaurante, tour operadora o cooperativa. Conecta directamente con miles de viajeros sin comisiones abusivas.',
              isCentered: true,
            ),
            const SizedBox(height: 18),

            // Selector Mensual / Anual
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.primaryDark,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.gold.withValues(alpha: 0.4)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildBillingTab('Facturación Mensual', !_isAnnual, () {
                    setState(() => _isAnnual = false);
                  }),
                  _buildBillingTab('Anual (Ahorra 20%)', _isAnnual, () {
                    setState(() => _isAnnual = true);
                  }, isHighlight: true),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Cuadrícula / Fila de los 3 Planes
            LayoutBuilder(
              builder: (context, constraints) {
                final isNarrow = constraints.maxWidth < 850;

                final plan1 = _buildPlanCard(
                  badge: 'GRATUITO',
                  title: 'Plan Semilla Rural',
                  price: '\$0',
                  subtitle: 'Ideal para iniciar y tener presencia básica',
                  benefits: const [
                    'Registro en el directorio general de Nicaragua',
                    'Ficha en el mapa satelital interactivo',
                    'Información de contacto por correo electrónico',
                    'Soporte comunitario estándar',
                  ],
                  buttonText: 'Empezar Gratis',
                  isFeatured: false,
                  onPressed: () => _subscribePlan('Plan Semilla Rural', '\$0 USD'),
                );

                final plan2 = _buildPlanCard(
                  badge: 'MÁS POPULAR',
                  title: 'Aliado Verificado',
                  price: '\$${monthlyVerified.toInt()} USD',
                  convertedPrice: 'C\$ ${(monthlyVerified * 36.65).toInt()} NIO / mes',
                  subtitle: 'Para negocios que buscan clientes constantes todo el año',
                  benefits: const [
                    'Sello Oficial de Negocio Verificado Baqueano (Oro)',
                    'Botón directo de WhatsApp Oficial (1-Click) para clientes',
                    'Llamada telefónica directa sin intermediarios',
                    'Prioridad en recomendaciones del Asistente IA',
                    'Cero comisiones por reserva o contacto',
                    'Soporte comercial prioritario 24/7',
                  ],
                  buttonText: 'Elegir Plan Aliado',
                  isFeatured: true,
                  onPressed: () => _subscribePlan('Plan Aliado Verificado', '\$${monthlyVerified.toInt()} USD/mes'),
                );

                final plan3 = _buildPlanCard(
                  badge: 'ALTA VISIBILIDAD',
                  title: 'Alianza Destacada',
                  price: '\$${monthlyFeatured.toInt()} USD',
                  convertedPrice: 'C\$ ${(monthlyFeatured * 36.65).toInt()} NIO / mes',
                  subtitle: 'Máxima exposición en la pantalla de inicio y catálogo',
                  benefits: const [
                    'Todo lo incluido en el Plan Aliado Verificado',
                    'Presencia fija en la Vitrina de Inicio (Home)',
                    'Video 4K y galería de fotografías en 3D',
                    'Posición #1 en las búsquedas de tu departamento',
                    'Notificaciones recomendadas a turistas en tu zona',
                    'Reportes mensuales de visualizaciones e impacto',
                  ],
                  buttonText: 'Elegir Alianza Destacada',
                  isFeatured: false,
                  accentColor: AppColors.terracottaLight,
                  onPressed: () => _subscribePlan('Plan Alianza Destacada', '\$${monthlyFeatured.toInt()} USD/mes'),
                );

                if (isNarrow) {
                  return Column(
                    children: [
                      plan2, // El plan más popular arriba en móviles
                      const SizedBox(height: 18),
                      plan3,
                      const SizedBox(height: 18),
                      plan1,
                    ],
                  );
                }

                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(child: plan1),
                    const SizedBox(width: 16),
                    Expanded(child: plan2),
                    const SizedBox(width: 16),
                    Expanded(child: plan3),
                  ],
                );
              },
            ),

            const SizedBox(height: 36),

            // ----------------------------------------------------------------
            // CALCULADORA INTERACTIVA DE RETORNO DE INVERSIÓN (ROI)
            // ----------------------------------------------------------------
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                gradient: AppGradients.volcanicHero,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppColors.gold.withValues(alpha: 0.6), width: 1.4),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.gold.withValues(alpha: 0.12),
                    blurRadius: 18,
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
                        child: const Icon(Icons.calculate_rounded, color: AppColors.goldLight, size: 24),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'CALCULADORA DE RENTABILIDAD',
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 10.5,
                                fontWeight: FontWeight.w800,
                                color: AppColors.goldLight,
                                letterSpacing: 0.8,
                              ),
                            ),
                            Text(
                              'Comprueba cómo tu plan se paga solo',
                              style: GoogleFonts.montserrat(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
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
                    'Si recibes al mes a través de la app Baqueano:',
                    style: GoogleFonts.inter(fontSize: 13, color: Colors.white70),
                  ),
                  const SizedBox(height: 8),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          '${_estimatedClients.toInt()} clientes adicionales',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: AppColors.goldLight,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '(Ticket: \$${_averageTicketUsd.toInt()} USD)',
                        style: GoogleFonts.inter(fontSize: 11.5, color: AppColors.textMuted),
                      ),
                    ],
                  ),
                  Slider(
                    value: _estimatedClients,
                    min: 1.0,
                    max: 15.0,
                    divisions: 14,
                    activeColor: AppColors.gold,
                    inactiveColor: Colors.white24,
                    onChanged: (val) {
                      setState(() => _estimatedClients = val);
                    },
                  ),
                  const SizedBox(height: 12),

                  // Resumen de Ganancia Neta 100% Protegido contra Overflows
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                    decoration: BoxDecoration(
                      color: AppColors.primaryDark,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.jungleGreenLight.withValues(alpha: 0.6)),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Ingreso Estimado:',
                                style: GoogleFonts.inter(fontSize: 11, color: Colors.white70),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 2),
                              FittedBox(
                                fit: BoxFit.scaleDown,
                                alignment: Alignment.centerLeft,
                                child: Text(
                                  '+\$${extraRevenueUsd.toInt()} USD / mes',
                                  style: GoogleFonts.spaceGrotesk(
                                    fontSize: 17,
                                    fontWeight: FontWeight.w900,
                                    color: AppColors.jungleGreenLight,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          width: 1,
                          height: 36,
                          margin: const EdgeInsets.symmetric(horizontal: 10),
                          color: AppColors.borderLight,
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                'Ganancia Neta:',
                                style: GoogleFonts.inter(fontSize: 11, color: Colors.white70),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 2),
                              FittedBox(
                                fit: BoxFit.scaleDown,
                                alignment: Alignment.centerRight,
                                child: Text(
                                  '+\$${netProfit.toInt()} USD neto',
                                  style: GoogleFonts.spaceGrotesk(
                                    fontSize: 17,
                                    fontWeight: FontWeight.w900,
                                    color: AppColors.goldLight,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),

                  Center(
                    child: Text(
                      '⚡ Con solo 1 cliente al mes recuperas tu inversión. Todo lo demás es ganancia directa para tu negocio.',
                      style: GoogleFonts.inter(fontSize: 12, color: Colors.white60, fontStyle: FontStyle.italic),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 36),

            // Garantías y Soporte
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppColors.primaryDark,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: LayoutBuilder(
                builder: (context, c) {
                  final isNarrow = c.maxWidth < 450;
                  if (isNarrow) {
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Text('🤝', style: TextStyle(fontSize: 26)),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                '¿Deseas una propuesta personalizada para tu cooperativa o cadena?',
                                style: GoogleFonts.spaceGrotesk(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Contacta a nuestro equipo de alianzas estratégicas para convenios institucionales.',
                          style: GoogleFonts.inter(fontSize: 11.5, color: Colors.white70),
                        ),
                        const SizedBox(height: 12),
                        BaqueanoButton(
                          text: 'Contactar a Alianzas',
                          variant: BaqueanoButtonVariant.outline,
                          height: 40,
                          width: double.infinity,
                          onPressed: () => _subscribePlan('Consulta Personalizada', 'Convenio'),
                        ),
                      ],
                    );
                  }

                  return Row(
                    children: [
                      const Text('🤝', style: TextStyle(fontSize: 28)),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '¿Deseas una propuesta personalizada para tu cooperativa o cadena?',
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Contacta a nuestro equipo de alianzas estratégicas para convenios institucionales.',
                              style: GoogleFonts.inter(fontSize: 11.5, color: Colors.white70),
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
                        onPressed: () => _subscribePlan('Consulta Personalizada', 'Convenio'),
                      ),
                    ],
                  );
                },
              ),
            ),

            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Widget _buildBillingTab(String label, bool isSelected, VoidCallback onTap, {bool isHighlight = false}) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        onTap();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.gold : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          label,
          style: GoogleFonts.spaceGrotesk(
            fontSize: 12,
            fontWeight: FontWeight.w800,
            color: isSelected ? const Color(0xFF041920) : Colors.white70,
          ),
        ),
      ),
    );
  }

  Widget _buildPlanCard({
    required String badge,
    required String title,
    required String price,
    String? convertedPrice,
    required String subtitle,
    required List<String> benefits,
    required String buttonText,
    required bool isFeatured,
    Color? accentColor,
    required VoidCallback onPressed,
  }) {
    final effectiveColor = accentColor ?? (isFeatured ? AppColors.gold : Colors.white24);

    return GlassContainer(
      padding: const EdgeInsets.all(20),
      borderRadius: BorderRadius.circular(22),
      border: Border.all(
        color: isFeatured ? AppColors.gold : effectiveColor.withValues(alpha: 0.5),
        width: isFeatured ? 1.8 : 1.0,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: (isFeatured ? AppColors.gold : effectiveColor).withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: isFeatured ? AppColors.gold : effectiveColor, width: 0.8),
            ),
            child: Text(
              badge,
              style: GoogleFonts.spaceGrotesk(
                fontSize: 10,
                fontWeight: FontWeight.w800,
                color: isFeatured ? AppColors.goldLight : Colors.white,
                letterSpacing: 0.8,
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Título
          Text(
            title,
            style: GoogleFonts.montserrat(
              fontSize: 18,
              fontWeight: FontWeight.w900,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: GoogleFonts.inter(fontSize: 11.5, color: Colors.white60, height: 1.3),
          ),
          const SizedBox(height: 14),

          // Precio
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                price,
                style: GoogleFonts.montserrat(
                  fontSize: 28,
                  fontWeight: FontWeight.w900,
                  color: isFeatured ? AppColors.goldLight : Colors.white,
                ),
              ),
              if (price != '\$0') ...[
                const SizedBox(width: 4),
                Text(
                  '/ mes',
                  style: GoogleFonts.inter(fontSize: 12, color: Colors.white60),
                ),
              ],
            ],
          ),
          if (convertedPrice != null) ...[
            const SizedBox(height: 2),
            Text(
              convertedPrice,
              style: GoogleFonts.spaceGrotesk(
                fontSize: 11.5,
                fontWeight: FontWeight.w700,
                color: AppColors.jungleGreenLight,
              ),
            ),
          ],

          const SizedBox(height: 16),
          const Divider(color: AppColors.borderLight),
          const SizedBox(height: 12),

          // Lista de Beneficios
          ...benefits.map((b) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.check_circle_rounded, color: AppColors.jungleGreenLight, size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        b,
                        style: GoogleFonts.inter(fontSize: 12, color: Colors.white70, height: 1.35),
                      ),
                    ),
                  ],
                ),
              )),

          const SizedBox(height: 16),

          BaqueanoButton(
            text: buttonText,
            variant: isFeatured ? BaqueanoButtonVariant.primary : BaqueanoButtonVariant.outline,
            height: 44,
            width: double.infinity,
            onPressed: onPressed,
          ),
        ],
      ),
    );
  }
}
