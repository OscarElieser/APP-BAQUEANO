// ============================================================================
// 🏪 VITRINA DINÁMICA INFINITA DE NEGOCIOS RURALES (BUSINESS_SHOWCASE.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Empoderar a los emprendedores campesinos y guías comunitarios (comedores, cabañas,
//   cooperativas) mostrándolos en una vitrina viva que fluye de forma continua.
// - Ofrecer contraste de movimiento bidireccional respecto a otras secciones: este carrusel
//   se desplaza en dirección opuesta (de derecha a izquierda / Reverse), enriqueciendo la
//   dinámica visual de la pantalla de inicio.
// - Cumplir con la pausa inteligente: cuando el explorador toca cualquier negocio o su botón
//   de ficha completa, el movimiento se congela de inmediato; al cerrar el modal, continúa su viaje.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `StatefulWidget` con `ScrollController` animado en reversa continua hacia el offset 0
//   y reinicio transparente a la mitad del contenido cuadriplicado (`midPoint`).
// - Detección táctil por `Listener` y apertura asíncrona de `_showBusinessDetailsModal`.
// - Indicador dinámico de estado en vivo (`EN VIVO · 60 FPS` vs `PAUSADO (EXPLORANDO)`).
// - Botones de acción directa para WhatsApp (`https://wa.me/`), Llamada y Mapa GPS.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `BusinessShowcase`: Vitrina interactiva infinita en dirección inversa.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../core/widgets/section_header.dart';

class BusinessShowcase extends StatefulWidget {
  const BusinessShowcase({super.key});

  @override
  State<BusinessShowcase> createState() => _BusinessShowcaseState();
}

class _BusinessShowcaseState extends State<BusinessShowcase> {
  /// Controlador del desplazamiento horizontal en reversa
  late final ScrollController _scrollController;

  /// Bandera para evitar llamadas cuando el widget se destruye
  bool _isDisposed = false;

  /// Estado reactivo de pausa inteligente
  bool _isPaused = false;

  /// Negocio actualmente seleccionado para feedback visual
  dynamic _selectedBiz;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    // Inicia el desplazamiento en reversa una vez montado el widget
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        // Posiciona el scroll en un punto medio seguro para iniciar el avance hacia la izquierda
        final maxScroll = _scrollController.position.maxScrollExtent;
        if (maxScroll > 0) {
          _scrollController.jumpTo(maxScroll * 0.6);
        }
      }
      _startContinuousReverseScroll();
    });
  }

  /// Desplazamiento continuo infinito a 60 FPS en dirección opuesta (Reverse: derecha -> izquierda)
  void _startContinuousReverseScroll() async {
    while (!_isDisposed && mounted) {
      if (_scrollController.hasClients && !_isPaused) {
        final currentScroll = _scrollController.offset;

        if (currentScroll > 5) {
          // Velocidad constante suave hacia 0 (38ms por píxel)
          final durationMs = (currentScroll * 38).toInt();
          await _scrollController.animateTo(
            0,
            duration: Duration(milliseconds: durationMs),
            curve: Curves.linear,
          );
        }

        // Cuando llega a 0, salta transparentemente al punto medio para continuar el bucle infinito
        if (!_isDisposed && mounted && _scrollController.hasClients && !_isPaused) {
          final maxScroll = _scrollController.position.maxScrollExtent;
          _scrollController.jumpTo(maxScroll * 0.6);
        }
      } else {
        await Future.delayed(const Duration(milliseconds: 250));
      }
    }
  }

  /// Abre la ficha técnica y pausa el carrusel hasta que el usuario la cierre
  Future<void> _handleBusinessSelection(dynamic biz) async {
    setState(() {
      _isPaused = true;
      _selectedBiz = biz;
    });

    await _showBusinessDetailsModal(context, biz);

    if (mounted && !_isDisposed) {
      setState(() {
        _isPaused = false;
        _selectedBiz = null;
      });
      _startContinuousReverseScroll();
    }
  }

  Future<void> _launchWhatsApp(BuildContext context, String phone, String bizName) async {
    setState(() => _isPaused = true);
    final cleanPhone = phone.replaceAll(RegExp(r'[^0-9]'), '');
    final uri = Uri.parse('https://wa.me/$cleanPhone?text=Hola%2C%20vi%20su%20negocio%20$bizName%20en%20la%20app%20Baqueano%20y%20deseo%20m%C3%A1s%20informaci%C3%B3n.');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (context.mounted) {
          CustomToast.error(context, 'No se pudo abrir WhatsApp en este dispositivo');
        }
      }
    } catch (_) {
      if (context.mounted) {
        CustomToast.error(context, 'WhatsApp no disponible: $phone');
      }
    }
    await Future.delayed(const Duration(milliseconds: 600));
    if (mounted && !_isDisposed && _selectedBiz == null) {
      setState(() => _isPaused = false);
      _startContinuousReverseScroll();
    }
  }

  Future<void> _launchPhone(BuildContext context, String phone) async {
    setState(() => _isPaused = true);
    final uri = Uri.parse('tel:$phone');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        if (context.mounted) {
          CustomToast.show(context, message: 'Teléfono del negocio: $phone');
        }
      }
    } catch (_) {
      if (context.mounted) {
        CustomToast.show(context, message: 'Contacto: $phone');
      }
    }
    await Future.delayed(const Duration(milliseconds: 600));
    if (mounted && !_isDisposed && _selectedBiz == null) {
      setState(() => _isPaused = false);
      _startContinuousReverseScroll();
    }
  }

  Future<void> _showBusinessDetailsModal(BuildContext context, dynamic biz) async {
    await showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF082B35),
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Center(
                child: Container(
                  width: 44,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.white24,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Text(biz.icon as String, style: const TextStyle(fontSize: 32)),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          biz.name as String,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        Text(
                          '${biz.category} • ${biz.department}',
                          style: const TextStyle(color: Color(0xFFD4AF37), fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(color: Colors.white12),
              const SizedBox(height: 12),

              _buildModalRow(Icons.person_rounded, 'Propietario / Líder', biz.ownerName as String),
              const SizedBox(height: 10),
              _buildModalRow(Icons.place_rounded, 'Ubicación Exacta', biz.address as String),
              const SizedBox(height: 10),
              _buildModalRow(Icons.phone_rounded, 'Contacto Directo', biz.contact as String),
              const SizedBox(height: 10),
              _buildModalRow(Icons.chat_rounded, 'WhatsApp', biz.whatsapp as String),
              const SizedBox(height: 10),
              _buildModalRow(Icons.mail_outline_rounded, 'Correo', biz.email as String),
              const SizedBox(height: 14),

              Text(
                'Descripción & Servicios:',
                style: GoogleFonts.montserrat(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                biz.description as String,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  color: Colors.white.withValues(alpha: 0.8),
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 20),

              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pop(ctx);
                        _launchWhatsApp(context, biz.whatsapp as String, biz.name as String);
                      },
                      icon: const Icon(Icons.chat_rounded, color: Colors.white, size: 16),
                      label: const Text('WhatsApp'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF25D366),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pop(ctx);
                        context.go('/mapa');
                      },
                      icon: const Icon(Icons.map_rounded, color: Colors.white, size: 16),
                      label: const Text('Ver en Mapa'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.terracotta,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildModalRow(IconData icon, String label, String val) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: AppColors.goldLight),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 10,
                  color: Colors.white.withValues(alpha: 0.5),
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                val,
                style: GoogleFonts.inter(fontSize: 12.5, color: Colors.white),
              ),
            ],
          ),
        ),
      ],
    );
  }

  @override
  void dispose() {
    _isDisposed = true;
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final businesses = CatalogData.localBusinesses;

    // Cuadriplicación de la lista para movimiento infinito fluido
    final continuousList = [
      ...businesses,
      ...businesses,
      ...businesses,
      ...businesses,
    ];

    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Encabezado temático centrado con indicador dinámico de estado en vivo
        Padding(
          padding: EdgeInsets.symmetric(horizontal: isDesktop ? 48.0 : 20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SectionHeader(
                tag: 'RED LOCAL DIRECTA',
                title: 'Vitrina de Negocios Locales',
                subtitle: 'Conecta de forma directa con los protagonistas del ecoturismo nicaragüense. Cabañas rústicas, guías nativos certificados y gastronomía campesina.',
                isCentered: true,
              ),
              const SizedBox(height: 6),
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: _isPaused
                      ? AppColors.terracotta.withValues(alpha: 0.22)
                      : AppColors.gold.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: _isPaused
                        ? AppColors.terracotta.withValues(alpha: 0.6)
                        : AppColors.borderGold.withValues(alpha: 0.4),
                    width: 1,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      _isPaused ? Icons.pause_circle_rounded : Icons.sync_alt_rounded,
                      size: 11,
                      color: _isPaused ? AppColors.terracotta : AppColors.gold,
                    ),
                    const SizedBox(width: 5),
                    Text(
                      _isPaused ? 'PAUSADO (EXPLORANDO)' : 'FLUJO INVERSO · 60 FPS',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.6,
                        color: _isPaused ? AppColors.terracotta : AppColors.gold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 14),

        // Carrusel horizontal continuo en dirección opuesta (Reverse)
        SizedBox(
          height: 275,
          child: Listener(
            onPointerDown: (_) => setState(() => _isPaused = true),
            onPointerUp: (_) {
              if (_selectedBiz == null) {
                setState(() => _isPaused = false);
                _startContinuousReverseScroll();
              }
            },
            child: ListView.separated(
              controller: _scrollController,
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              padding: EdgeInsets.symmetric(horizontal: isDesktop ? 48.0 : 20.0),
              itemCount: continuousList.length,
              separatorBuilder: (_, __) => const SizedBox(width: 16),
              itemBuilder: (context, index) {
                final biz = continuousList[index];
                final isSelected = _selectedBiz == biz;

                return AnimatedScale(
                  scale: isSelected ? 1.03 : 1.0,
                  duration: const Duration(milliseconds: 200),
                  child: InkWell(
                    onTap: () => _handleBusinessSelection(biz),
                    borderRadius: BorderRadius.circular(22),
                    child: Container(
                      width: 305,
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        gradient: isSelected
                            ? const LinearGradient(
                                colors: [Color(0xFF0C3D4B), Color(0xFFC86432)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              )
                            : AppGradients.cardGlass,
                        borderRadius: BorderRadius.circular(22),
                        border: Border.all(
                          color: isSelected
                              ? AppColors.gold
                              : AppColors.borderLight.withValues(alpha: 0.7),
                          width: isSelected ? 1.8 : 1.0,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: isSelected
                                ? AppColors.gold.withValues(alpha: 0.35)
                                : Colors.black.withValues(alpha: 0.3),
                            blurRadius: isSelected ? 16 : 14,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Fila superior: Icono del negocio y Badge verde de acreditación
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: AppColors.primaryLight,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(biz.icon, style: const TextStyle(fontSize: 22)),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppColors.jungleGreen.withValues(alpha: 0.2),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: AppColors.jungleGreenLight, width: 0.8),
                                ),
                                child: Text(
                                  biz.badge,
                                  style: GoogleFonts.spaceGrotesk(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.jungleGreenLight,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),

                          // Nombre y categoría
                          Text(
                            biz.name,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '👤 ${biz.ownerName} • ${biz.department}',
                            style: const TextStyle(
                              fontSize: 11,
                              color: Color(0xFFD4AF37),
                              fontWeight: FontWeight.w600,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 6),

                          // Descripción breve
                          Text(
                            biz.description,
                            style: TextStyle(
                              fontSize: 11,
                              color: Colors.white.withValues(alpha: 0.7),
                              height: 1.3,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),

                          const Spacer(),

                          // Botones de Acción
                          Row(
                            children: [
                              // WhatsApp
                              InkWell(
                                onTap: () => _launchWhatsApp(context, biz.whatsapp, biz.name),
                                borderRadius: BorderRadius.circular(10),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF25D366).withValues(alpha: 0.2),
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: const Color(0xFF25D366).withValues(alpha: 0.5)),
                                  ),
                                  child: const Icon(Icons.chat_rounded, color: Color(0xFF25D366), size: 16),
                                ),
                              ),
                              const SizedBox(width: 8),

                              // Llamar
                              InkWell(
                                onTap: () => _launchPhone(context, biz.contact),
                                borderRadius: BorderRadius.circular(10),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF0284C7).withValues(alpha: 0.2),
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: const Color(0xFF0284C7).withValues(alpha: 0.5)),
                                  ),
                                  child: const Icon(Icons.phone_rounded, color: Color(0xFF38BDF8), size: 16),
                                ),
                              ),
                              const SizedBox(width: 8),

                              // Ver Ficha Completa
                              Expanded(
                                child: InkWell(
                                  onTap: () => _handleBusinessSelection(biz),
                                  borderRadius: BorderRadius.circular(10),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(vertical: 8),
                                    decoration: BoxDecoration(
                                      gradient: AppGradients.sunsetTerracotta,
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: const Center(
                                      child: Text(
                                        'Ver Ficha & Pin 🗺️',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 11,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ),
      ],
    );
  }
}
