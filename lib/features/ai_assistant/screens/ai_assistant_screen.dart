// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — ASISTENTE INTELIGENTE BAQUEANO AI
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Servir como copiloto y asesor digital 24/7 para el explorador y turista en Nicaragua.
// - Asistir en la planificación de rutas, cálculo de presupuestos en USD/NIO y
//   conexión directa con guías campesinos locales, promoviendo el turismo justo.
// - Conectar en vivo a datos comprobados de Firestore (RAG) y ejecutar herramientas
//   nativas interactivas (Function Calling visual): mapas satelitales, llamadas,
//   fichas de establecimientos y reservas directas sin intermediarios.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Memoria de sesión reactiva que muestra el itinerario activo y presupuesto del viajero.
// - Capa de Confianza (Confidence Layer) que audita visualmente respuestas verificadas vs offline.
// - Botones de herramientas con microinteracciones nativas ejecutables mediante GoRouter y UrlLauncher.
// - Glassmorphism optimizado con `BackdropFilter` y `withValues(alpha: X)` para 60fps constantes.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - `AiAssistantScreen`: Pantalla con chat interactivo, historial de mensajes,
//   barra de memoria de viajero, panel de herramientas nativas y entrada estilizada.
// ============================================================================

import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/data/catalog_data.dart';
import '../../../core/models/destination_model.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';
import '../../../models/ai_tool_action.dart';
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

    // Invocación al servicio real de Inteligencia Artificial de Baqueano con failover multi-LLM, RAG y offline
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

  Future<void> _executeToolAction(AiToolAction action) async {
    switch (action.type) {
      case AiToolType.showMap:
        final lat = action.params['latitude'];
        final lng = action.params['longitude'];
        final name = Uri.encodeComponent(action.params['name']?.toString() ?? '');
        if (lat != null && lng != null) {
          context.push('/mapa?lat=$lat&lng=$lng&title=$name');
        } else {
          context.push('/mapa');
        }
        break;

      case AiToolType.viewPlace:
        final placeId = action.params['placeId']?.toString();
        if (placeId != null && placeId.isNotEmpty) {
          context.push('/descubre-nicaragua/$placeId');
        } else {
          context.push('/descubre-nicaragua');
        }
        break;

      case AiToolType.openCheckout:
        // 🛡️ Validación Estricta de Parámetros de Checkout
        // El LLM NO puede forjar un checkout arbitrario: debe cotejarse contra un paquete verificado
        final destId = action.params['placeId']?.toString();
        final destName = (action.params['destination'] ?? action.params['name'] ?? '').toString().toLowerCase().trim();

        DestinationModel? matchedDest;
        if (destId != null && destId.isNotEmpty) {
          matchedDest = CatalogData.destinations.where((d) => d.id == destId).firstOrNull;
        }
        if (matchedDest == null && destName.isNotEmpty) {
          matchedDest = CatalogData.destinations.where((d) =>
            d.title.toLowerCase().contains(destName) ||
            d.department.toLowerCase().contains(destName)
          ).firstOrNull;
        }

        if (matchedDest != null) {
          CheckoutModal.show(context, matchedDest);
        } else {
          if (mounted) {
            CustomToast.show(
              context,
              message: 'ℹ️ Este destino no cuenta con pasarela digital activa. Contacta al anfitrión por WhatsApp o teléfono oficial.',
            );
          }
        }
        break;

      case AiToolType.callPhone:
        final phone = action.params['phone']?.toString().replaceAll(RegExp(r'[^0-9+]'), '');
        if (phone != null && phone.isNotEmpty && phone.length >= 8) {
          final uri = Uri.parse('tel:$phone');
          if (await canLaunchUrl(uri)) {
            await launchUrl(uri);
          } else {
            if (mounted) {
              CustomToast.error(context, 'No se pudo abrir el marcador telefónico para $phone');
            }
          }
        }
        break;

      case AiToolType.openWhatsApp:
        final phone = action.params['phone']?.toString().replaceAll(RegExp(r'[^0-9]'), '');
        if (phone != null && phone.isNotEmpty) {
          final text = Uri.encodeComponent('Hola, vi su servicio en BAQUEANO Nicaragua y me gustaría consultar disponibilidad.');
          final uri = Uri.parse('https://wa.me/$phone?text=$text');
          if (await canLaunchUrl(uri)) {
            await launchUrl(uri, mode: LaunchMode.externalApplication);
          } else {
            if (mounted) {
              CustomToast.error(context, 'No se pudo abrir WhatsApp para el contacto $phone');
            }
          }
        }
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final aiService = ref.watch(baqueanoAiServiceProvider);
    final messages = aiService.chatHistory;
    final isTyping = aiService.isTyping;
    final session = aiService.sessionContext;

    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;
    final bottomPadding = MediaQuery.of(context).padding.bottom;
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

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
              subtitle: 'Tu copiloto digital 24/7. Genera itinerarios, consulta datos en tiempo real y ejecuta reservas directas.',
            ),

            // Barra de Memoria Inteligente de Sesión del Viajero
            if (session.destination != null || session.budgetUsd != null || session.travelStyle != null)
              _buildSessionMemoryBanner(session, aiService),

            const SizedBox(height: 8),

            // Contenedor de Mensajes de Chat
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

  /// Banner informativo que refleja el estado vivo de la memoria contextual de la sesión
  Widget _buildSessionMemoryBanner(dynamic session, BaqueanoAiService aiService) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.primaryLight.withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.gold.withValues(alpha: 0.4), width: 1),
      ),
      child: Row(
        children: [
          const Icon(Icons.psychology_alt_rounded, color: AppColors.gold, size: 20),
          const SizedBox(width: 8),
          Expanded(
            child: Wrap(
              spacing: 8,
              runSpacing: 4,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                if (session.destination != null)
                  _buildContextChip('📍 ${session.destination}'),
                if (session.days != null)
                  _buildContextChip('⏳ ${session.days} días'),
                if (session.budgetUsd != null)
                  _buildContextChip('💰 \$${session.budgetUsd!.toStringAsFixed(0)} USD'),
                if (session.travelStyle == 'economico')
                  _buildContextChip('🏷️ Modo Económico'),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppColors.textMuted, size: 18),
            tooltip: 'Reiniciar viaje en memoria',
            onPressed: () => aiService.resetTravelerSession(),
          ),
        ],
      ),
    );
  }

  Widget _buildContextChip(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: AppColors.bgDark.withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.gold.withValues(alpha: 0.3)),
      ),
      child: Text(
        label,
        style: GoogleFonts.inter(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: AppColors.goldLight,
        ),
      ),
    );
  }

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
          filter: ImageFilter.blur(sigmaX: 14, sigmaY: 14),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.bgDark.withValues(alpha: 0.88),
              borderRadius: BorderRadius.circular(28),
              border: Border.all(
                color: AppColors.borderGold.withValues(alpha: 0.8),
                width: 1.2,
              ),
            ),
            child: Row(
              children: [
                const SizedBox(width: 4),
                Container(
                  padding: const EdgeInsets.all(7),
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight.withValues(alpha: 0.2),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: AppColors.primaryLight.withValues(alpha: 0.5),
                      width: 1,
                    ),
                  ),
                  child: const Icon(
                    Icons.explore_rounded,
                    color: AppColors.primaryLight,
                    size: 16,
                  ),
                ),
                const SizedBox(width: 10),

                // Campo de Entrada de Texto
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

                // Botón de Envío con degradado Terracota Volcánico
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
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.82),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: msg.isUser ? AppColors.terracotta : AppColors.primaryLight.withValues(alpha: 0.65),
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
                const SizedBox(width: 8),

                // Capa de Confianza (Confidence Layer) y estado Offline
                if (!msg.isUser) ...[
                  if (msg.confidenceLevel == AiConfidenceLevel.high)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.teal.withValues(alpha: 0.25),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: Colors.tealAccent, width: 0.8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.verified_rounded, color: Colors.tealAccent, size: 10),
                          const SizedBox(width: 3),
                          Text(
                            'Verificado Baqueano',
                            style: GoogleFonts.inter(fontSize: 9, color: Colors.tealAccent, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  if (msg.isOfflineBackup) ...[
                    const SizedBox(width: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.blue.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: Colors.lightBlueAccent, width: 0.8),
                      ),
                      child: Text(
                        'Offline',
                        style: GoogleFonts.inter(fontSize: 9, color: Colors.lightBlueAccent, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ],
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

            // Herramientas y Acciones Ejecutables (Function Calling Nativo)
            if (msg.toolActions != null && msg.toolActions!.isNotEmpty) ...[
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 6,
                children: msg.toolActions!.map((tool) {
                  return ElevatedButton.icon(
                    onPressed: () => _executeToolAction(tool),
                    icon: Icon(_getIconForTool(tool.type), size: 14, color: AppColors.bgDark),
                    label: Text(
                      tool.label,
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: AppColors.bgDark,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.gold,
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      minimumSize: const Size(0, 30),
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],

            // Sugerencias de consultas rápidas
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

  IconData _getIconForTool(AiToolType type) {
    switch (type) {
      case AiToolType.showMap:
        return Icons.map_rounded;
      case AiToolType.viewPlace:
        return Icons.place_rounded;
      case AiToolType.openCheckout:
        return Icons.credit_card_rounded;
      case AiToolType.callPhone:
        return Icons.call_rounded;
      case AiToolType.openWhatsApp:
        return Icons.chat_bubble_rounded;
    }
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
              'Baqueano AI está consultando la base de datos de Nicaragua...',
              style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted),
            ),
          ],
        ),
      ),
    );
  }
}
