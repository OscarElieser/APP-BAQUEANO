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
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';
import '../../../models/chat_message.dart';
import '../../../services/baqueano_ai_service.dart';
import '../../checkout/widgets/checkout_modal.dart';

class AiAssistantScreen extends ConsumerStatefulWidget {
  const AiAssistantScreen({super.key});

  @override
  ConsumerState<AiAssistantScreen> createState() => _AiAssistantScreenState();
}

class _AiAssistantScreenState extends ConsumerState<AiAssistantScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessage(String text) {
    if (text.trim().isEmpty) return;

    final trimmed = text.trim();
    _messageController.clear();
    _scrollToBottom();

    // Invocación al servicio real de Inteligencia Artificial de Baqueano con failover multi-LLM y offline
    ref.read(baqueanoAiServiceProvider).sendUserPrompt(trimmed).then((_) {
      _scrollToBottom();
    });
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
    final aiService = ref.watch(baqueanoAiServiceProvider);
    final messages = aiService.chatHistory;
    final isTyping = aiService.isTyping;

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
                  itemCount: messages.length + (isTyping ? 1 : 0),
                  itemBuilder: (context, index) {
                    if (index == messages.length && isTyping) {
                      return _buildTypingIndicator();
                    }
                    final msg = messages[index];
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
