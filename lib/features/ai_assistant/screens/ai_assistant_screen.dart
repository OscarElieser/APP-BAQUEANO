// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — ASISTENTE INTELIGENTE BAQUEANO AI
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Servir como copiloto y asesor digital 24/7 para el explorador y turista en Nicaragua.
// - Asistir en la planificación de rutas, cálculo de presupuestos en USD/NIO y
//   conexión directa con guías campesinos locales, promoviendo el turismo justo.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Implementa un chat conversacional responsivo con renderizado de mensajes en burbujas
//   estilizadas, sugerencias interactivas rápidas y respuestas contextuales.
// - La barra de entrada de mensajes utiliza Glassmorphism (BackdropFilter) con elevación
//   adaptable calculada mediante MediaQuery para posicionarse holgadamente sobre la barra
//   flotante de navegación móvil y las barras del sistema Android.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - `AiAssistantScreen`: Pantalla con chat interactivo, historial de mensajes,
//   indicador de escritura y barra de entrada con estética visual de alta gama.
// ============================================================================

import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/models/cultural_models.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';
import '../../checkout/widgets/checkout_modal.dart';

class AiAssistantScreen extends StatefulWidget {
  const AiAssistantScreen({super.key});

  @override
  State<AiAssistantScreen> createState() => _AiAssistantScreenState();
}

class _AiAssistantScreenState extends State<AiAssistantScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  final List<ChatMessage> _messages = [
    ChatMessage(
      id: 'm-1',
      text:
          '¡Hola explorador! Soy tu Baqueano AI 🤖🇳🇮. Conozco cada rincón secreto, cumbre volcánica, poza de río y cocina campesina de Nicaragua.\n\n¿En qué aventura estás pensando hoy? Puedo calcular tu presupuesto exacto en USD/NIO, armar tu itinerario día a día o recomendarte al mejor guía nativo.',
      isUser: false,
      timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
      quickActions: [
        '🌋 Ruta de 3 días en Ometepe',
        '🏊 Presupuesto mochilero en Somoto',
        '🏄 Mejor época de surf en Popoyo',
        '🔥 Subida nocturna Volcán Masaya',
      ],
    ),
  ];

  bool _isTyping = false;

  void _sendMessage(String text) {
    if (text.trim().isEmpty) return;

    final userMsg = ChatMessage(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      text: text,
      isUser: true,
      timestamp: DateTime.now(),
    );

    setState(() {
      _messages.add(userMsg);
      _messageController.clear();
      _isTyping = true;
    });

    _scrollToBottom();

    // Generate Intelligent Response based on keywords
    Future.delayed(const Duration(milliseconds: 1200), () {
      if (!mounted) return;
      final aiResponse = _generateAiAnswer(text);
      setState(() {
        _messages.add(aiResponse);
        _isTyping = false;
      });
      _scrollToBottom();
    });
  }

  ChatMessage _generateAiAnswer(String query) {
    final q = query.toLowerCase();

    if (q.contains('ometepe')) {
      return ChatMessage(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        text:
            '🌋 **ITINERARIO BAQUEANO: 3 DÍAS EN ISLA DE OMETEPE**\n\n'
            '• **Día 1:** Llegada en Ferry desde San Jorge a Moyogalpa. Almuerzo típico de tilapia en Charco Verde. Tarde de kayak en Río Istián con avistamiento de monos aulladores.\n'
            '• **Día 2:** Caminata a la Cascada San Ramón (faldas del Volcán Maderas) con guía Mayra Carcache. Baño en las aguas termominerales del Ojo de Agua.\n'
            '• **Día 3:** Tour de cacao criollo en Finca El Encanto y atardecer épico en Punta Jesús María.\n\n'
            '💰 **PRESUPUESTO ESTIMADO:**\n'
            '• Hospedaje Eco-Lodge (2 noches): \$70 USD / C\$ 2,565 NIO\n'
            '• Guías locales y entradas: \$45 USD / C\$ 1,649 NIO\n'
            '• Alimentación campesina: \$35 USD / C\$ 1,282 NIO\n'
            '• **Total por persona:** ~\$150 USD (C\$ 5,497 NIO)\n\n'
            '🎒 **EQUIPO:** Calzado de senderismo impermeable, repelente ecológico y linterna frontal.',
        isUser: false,
        timestamp: DateTime.now(),
        quickActions: ['Reservar Tour Ometepe', 'Ver hospedajes en Ometepe'],
      );
    } else if (q.contains('somoto') || q.contains('cañon') || q.contains('mochilero')) {
      return ChatMessage(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        text:
            '🏊 **EXPEDICIÓN CAÑÓN DE SOMOTO (MADRIZ)**\n\n'
            'El Cañón de Somoto es la joya geológica del norte de Nicaragua. Flotarás entre paredones rocosos de más de 150m en el cauce del Río Coco.\n\n'
            '💰 **DESGLOSE FINANCIERO COMUNITARIO:**\n'
            '• Tour completo (6 horas con saltos de 5m a 14m, chaleco y lancha): \$45.00 USD (C\$ 1,649 NIO)\n'
            '• Guía baqueano certificado: Don Toño Calero (18 años de experiencia)\n'
            '• Almuerzo de güirilas con cuajada y gallina india: Incluido\n\n'
            '✅ El 85% de este valor va directo a la Cooperativa Las Brisas del Cañón.',
        isUser: false,
        timestamp: DateTime.now(),
        quickActions: ['Reservar Cañón de Somoto', 'Ver contacto de Don Toño'],
      );
    } else if (q.contains('surf') || q.contains('popoyo') || q.contains('maderas')) {
      return ChatMessage(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        text:
            '🏄 **GUÍA DE SURF EN EL PACÍFICO SUR**\n\n'
            'Nicaragua cuenta con más de 300 días de viento offshore al año gracias al efecto del Lago Cocibolca.\n\n'
            '• **Playa Maderas (SJDS):** Olas constantes para nivel principiante a intermedio. Renta de tabla: \$10 USD/día.\n'
            '• **Playa Popoyo (Tola):** Point break de roca de clase mundial para intermedios y avanzados. Mejor marea: Media marea subiendo.\n'
            '• **Mejor temporada:** Mayo a Noviembre para swells grandes del sur; Diciembre a Abril para agua cristalina y viento constante.',
        isUser: false,
        timestamp: DateTime.now(),
        quickActions: ['Ver Playas de Surf', 'Ver Bares en San Juan del Sur'],
      );
    } else if (q.contains('masaya') || q.contains('lava') || q.contains('fuego')) {
      return ChatMessage(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        text:
            '🔥 **VOLCÁN MASAYA: CRÁTER SANTIAGO NOCTURNO**\n\n'
            'Uno de los únicos volcanes del planeta donde puedes contemplar un lago de lava hirviendo a solo metros del mirador.\n\n'
            '• **Horario ideal de visita:** 5:30 PM a 7:30 PM (para ver la transición del atardecer a la incandescencia nocturna).\n'
            '• **Entrada Parque Nacional:** \$10 USD para extranjeros / C\$ 150 NIO para nacionales.\n'
            '• **Tarifa Tour Guiado Baqueano:** \$30 USD (C\$ 1,099 NIO) con transporte y equipo de respiración si el viento cambia.',
        isUser: false,
        timestamp: DateTime.now(),
        quickActions: ['Reservar Volcán Masaya', 'Ver Mapa de Volcanes'],
      );
    } else {
      return ChatMessage(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        text:
            'Entendido explorador. Basado en tus gustos sobre "$query", te recomiendo una ruta que combina naturaleza virgen y apoyo comunitario directo.\n\n'
            'Nicaragua tiene opciones tanto para turismo de aventura extrema (sandboarding en Cerro Negro, cañonismo en Somoto) como para desconexión total (eco-lodges en Matagalpa y playas del Caribe).\n\n'
            '¿Deseas que calculemos el presupuesto estimado en Dólares (USD) o Córdobas (NIO)?',
        isUser: false,
        timestamp: DateTime.now(),
        quickActions: ['Calcular en USD & NIO', 'Ver destinos recomendados', 'Hablar con un guía nativo'],
      );
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;
    final bottomPadding = MediaQuery.of(context).padding.bottom;
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    // Altura de separación dinámica: en móviles se eleva para quedar holgadamente sobre
    // la barra de navegación flotante (68px alto + 8px margen + padding inferior del sistema)
    final bottomNavClearance = isDesktop
        ? 24.0
        : (bottomInset > 0 ? 12.0 : (96.0 + bottomPadding));

    return ResponsiveScaffold(
      currentIndex: 3,
      body: Padding(
        padding: EdgeInsets.symmetric(
          horizontal: isDesktop ? 48.0 : 16.0,
          vertical: 16.0,
        ),
        child: Column(
          children: [
            const SectionHeader(
              tag: 'INTELIGENCIA ARTIFICIAL NICA',
              title: '🤖 Baqueano AI Assistant',
              subtitle: 'Tu baqueano digital 24/7. Genera itinerarios, calcula presupuestos reales y contacta guías nativos.',
            ),

            // Chat Messages Container
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  gradient: AppGradients.cardGlass,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppColors.borderGold, width: 1.2),
                ),
                child: ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(16),
                  itemCount: _messages.length + (_isTyping ? 1 : 0),
                  itemBuilder: (context, index) {
                    if (index == _messages.length && _isTyping) {
                      return _buildTypingIndicator();
                    }
                    final msg = _messages[index];
                    return _buildMessageBubble(msg);
                  },
                ),
              ),
            ),

            const SizedBox(height: 14),

            // Barra de ingreso de mensajes con diseño de alta gama visual
            _buildProChatInputBar(),
            SizedBox(height: bottomNavClearance),
          ],
        ),
      ),
    );
  }

  /// Barra de entrada de mensajes estilizada con efecto Glassmorphism,
  /// halo de iluminación dorado y elevación sobre la barra de navegación.
  Widget _buildProChatInputBar() {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.55),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
          BoxShadow(
            color: AppColors.gold.withValues(alpha: 0.12),
            blurRadius: 16,
            offset: const Offset(0, 0),
            spreadRadius: 1,
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(28),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppColors.primaryDark.withValues(alpha: 0.90),
                  AppColors.bgCard.withValues(alpha: 0.95),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(28),
              border: Border.all(
                color: AppColors.gold.withValues(alpha: 0.45),
                width: 1.3,
              ),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Insignia interactiva del Asistente Baqueano
                Container(
                  margin: const EdgeInsets.only(left: 4, right: 8),
                  padding: const EdgeInsets.all(9),
                  decoration: BoxDecoration(
                    color: AppColors.gold.withValues(alpha: 0.14),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: AppColors.gold.withValues(alpha: 0.35),
                      width: 1.2,
                    ),
                  ),
                  child: const Icon(
                    Icons.auto_awesome_rounded,
                    color: AppColors.goldLight,
                    size: 18,
                  ),
                ),

                // Campo de texto con auto-expansión y tipografía optimizada
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    minLines: 1,
                    maxLines: 3,
                    style: GoogleFonts.inter(
                      color: AppColors.textLight,
                      fontSize: 14,
                      fontWeight: FontWeight.w400,
                    ),
                    cursorColor: AppColors.gold,
                    decoration: InputDecoration(
                      hintText: 'Pregunta sobre rutas, presupuestos, guías...',
                      hintStyle: GoogleFonts.inter(
                        color: AppColors.textMuted.withValues(alpha: 0.85),
                        fontSize: 13,
                      ),
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 4,
                        vertical: 10,
                      ),
                    ),
                    onSubmitted: _sendMessage,
                  ),
                ),

                const SizedBox(width: 8),

                // Botón de Envío con degradado Terracota Volcánico y microinteracción
                Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () => _sendMessage(_messageController.text),
                    borderRadius: BorderRadius.circular(24),
                    splashColor: AppColors.gold.withValues(alpha: 0.3),
                    highlightColor: Colors.white.withValues(alpha: 0.15),
                    child: Container(
                      padding: const EdgeInsets.all(11),
                      decoration: BoxDecoration(
                        gradient: AppGradients.sunsetTerracotta,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.terracotta.withValues(alpha: 0.55),
                            blurRadius: 12,
                            offset: const Offset(0, 3),
                          ),
                        ],
                        border: Border.all(
                          color: AppColors.gold.withValues(alpha: 0.4),
                          width: 1.2,
                        ),
                      ),
                      child: const Icon(
                        Icons.arrow_upward_rounded,
                        color: Colors.white,
                        size: 20,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 2),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage msg) {
    return Align(
      alignment: msg.isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: msg.isUser ? AppColors.terracotta : AppColors.primaryLight.withValues(alpha: 0.6),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(18),
            topRight: const Radius.circular(18),
            bottomLeft: Radius.circular(msg.isUser ? 18 : 4),
            bottomRight: Radius.circular(msg.isUser ? 4 : 18),
          ),
          border: Border.all(
            color: msg.isUser ? AppColors.gold : AppColors.borderLight,
            width: 1.0,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  msg.isUser ? Icons.person : Icons.smart_toy_rounded,
                  size: 14,
                  color: msg.isUser ? Colors.white : AppColors.gold,
                ),
                const SizedBox(width: 6),
                Text(
                  msg.isUser ? 'Tú' : 'Baqueano AI',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: msg.isUser ? Colors.white : AppColors.goldLight,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              msg.text,
              style: GoogleFonts.inter(
                fontSize: 13,
                color: Colors.white,
                height: 1.5,
              ),
            ),
            if (msg.quickActions != null && msg.quickActions!.isNotEmpty) ...[
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 6,
                children: msg.quickActions!.map((action) {
                  return InkWell(
                    onTap: () {
                      if (action.contains('Reservar')) {
                        CheckoutModal.show(context, CatalogData.destinations.first);
                      } else {
                        _sendMessage(action);
                      }
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.bgDark.withValues(alpha: 0.7),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.gold.withValues(alpha: 0.6)),
                      ),
                      child: Text(
                        action,
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: AppColors.goldLight,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.primaryLight.withValues(alpha: 0.6),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(
              width: 14,
              height: 14,
              child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.gold),
            ),
            const SizedBox(width: 10),
            Text(
              'Baqueano AI está calculando tu ruta...',
              style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted),
            ),
          ],
        ),
      ),
    );
  }
}
