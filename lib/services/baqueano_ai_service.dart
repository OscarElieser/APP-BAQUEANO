// ============================================================================
// 🤖 MOTOR DE ASISTENCIA CONVERSACIONAL IA — "EL BAQUEANO MAYOR"
// ============================================================================
//
// 🎯 POR QUÉ (WHY / PROPÓSITO):
// Empoderar al explorador con un asistente inteligente nativo capaz de planificar
// itinerarios personalizados, resolver dudas culturales y desglosar presupuestos
// exactos en tiempo real con profundo arraigo en la jerga y costumbres nicaragüenses.
//
// ⚙️ CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// Implementa un ChangeNotifier reactivo con inyección contextual de rutas, volcanes,
// tarifas de transporte y hospedajes comunitarios, gestionado por StateNotifierProvider.
//
// 📦 QUÉ (WHAT / ENTREGABLE):
// Historial de mensajes (ChatMessage), respuestas dinámicas simuladas de alta fidelidad,
// sugerencias de rutas rápidas y soporte bimoneda (USD / NIO).
// ============================================================================

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/chat_message.dart';

class BaqueanoAiService extends ChangeNotifier {
  final List<ChatMessage> _chatHistory = [];
  bool _isTyping = false;

  BaqueanoAiService() {
    _initWelcome();
  }

  void _initWelcome() {
    _chatHistory.add(
      ChatMessage(
        id: 'welcome-1',
        text:
            '¡Buenas explorador! Soy tu Baqueano Mayor 🤖🇳🇮, conocedor ancestral de senderos, cráteres de lava, cascadas escondidas y cocinas campesinas de Nicaragua.\n\n¿Qué ruta tienes en mente? Dime tu tiempo y presupuesto y te armo el itinerario exacto en USD o Córdobas (NIO) con contacto directo de guías locales.',
        isUser: false,
        timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
        quickActions: [
          '🌋 Itinerario 3 días en Ometepe',
          '🏊 Presupuesto Cañón de Somoto',
          '🏄 Rutas de Surf en Popoyo',
          '🔥 Cráter Santiago Masaya Nocturno',
        ],
      ),
    );
  }

  List<ChatMessage> get chatHistory => _chatHistory;
  bool get isTyping => _isTyping;

  Future<void> sendUserPrompt(String query) async {
    if (query.trim().isEmpty) return;

    final userMsg = ChatMessage(
      id: 'msg-${DateTime.now().millisecondsSinceEpoch}',
      text: query,
      isUser: true,
      timestamp: DateTime.now(),
    );

    _chatHistory.add(userMsg);
    _isTyping = true;
    notifyListeners();

    // Simulate Gemini AI Inference with Context Injection
    await Future.delayed(const Duration(milliseconds: 1100));

    final aiMsg = _synthesizeGeminiResponse(query);
    _chatHistory.add(aiMsg);
    _isTyping = false;
    notifyListeners();
  }

  ChatMessage _synthesizeGeminiResponse(String query) {
    final q = query.toLowerCase();

    if (q.contains('ometepe') || q.contains('isla')) {
      return ChatMessage(
        id: 'ai-${DateTime.now().millisecondsSinceEpoch}',
        text:
            '🌋 **ITINERARIO BAQUEANO MAYOR: 3 DÍAS EN OMETEPE**\n\n'
            '• **Día 1:** Ferry desde San Jorge a Moyogalpa. Almuerzo de pescado frito en Charco Verde y kayak en Río Istián con monos aulladores.\n'
            '• **Día 2:** Caminata hacia la Cascada San Ramón en el Volcán Maderas. Tarde de relajación en las aguas minerales del Ojo de Agua.\n'
            '• **Día 3:** Visita a la Finca de Cacao Criollo El Encanto y atardecer en la Punta Jesús María.\n\n'
            '💰 **PRESUPUESTO ESTIMADO (TASA C\$ 36.65 NIO / USD):**\n'
            '• Guía Local (Mayra Carcache): \$35.00 USD (C\$ 1,282 NIO)\n'
            '• Cabaña Ecológica (2 noches): \$65.00 USD (C\$ 2,382 NIO)\n'
            '• Alimentación y Entradas: \$40.00 USD (C\$ 1,466 NIO)\n'
            '• **TOTAL APROX:** ~\$140.00 USD (C\$ 5,131 NIO)\n\n'
            '🎒 **EQUIPO:** Zapatos de trekking con buen agarre, linterna frontal y repelente biodegradable.',
        isUser: false,
        timestamp: DateTime.now(),
        quickActions: ['Reservar Tour Ometepe', 'Ver Mapa de Ometepe'],
      );
    } else if (q.contains('somoto') || q.contains('cañon') || q.contains('rio coco')) {
      return ChatMessage(
        id: 'ai-${DateTime.now().millisecondsSinceEpoch}',
        text:
            '🏊 **EXPEDICIÓN CAÑÓN DE SOMOTO (MADRIZ)**\n\n'
            'Navegarás y flotarás entre paredes de roca volcánica de 150m en el cañón más impresionante de Centroamérica.\n\n'
            '💰 **DESGLOSE FINANCIERO:**\n'
            '• Tour guiado de 6 horas con saltos y lancha: \$45.00 USD (C\$ 1,649 NIO)\n'
            '• Almuerzo de güirilas con cuajada fresca: Incluido\n'
            '• Guía asignado: Don Toño Calero (18 años en el cañón)\n\n'
            '✅ El 85% de tu reserva llega íntegro a las familias campesinas de la Cooperativa Sonís.',
        isUser: false,
        timestamp: DateTime.now(),
        quickActions: ['Reservar Cañón de Somoto', 'Ver Ficha de Don Toño'],
      );
    } else if (q.contains('cerro negro') || q.contains('sandboarding') || q.contains('leon')) {
      return ChatMessage(
        id: 'ai-${DateTime.now().millisecondsSinceEpoch}',
        text:
            '🏄‍♂️ **SANDBOARDING EN CERRO NEGRO (LEÓN)**\n\n'
            'Descenso a toda velocidad sobre la ladera de arena negra volcánica a más de 70 km/h.\n\n'
            '• **Dificultad:** Exigente (subida de 1 hora cargando la tabla).\n'
            '• **Tarifa Oficial:** \$40.00 USD (C\$ 1,466 NIO) con equipo completo (traje, gafas, tabla).\n'
            '• **Recomendación:** Llevar calzado cerrado alto para evitar que entre arena volcánica caliente.',
        isUser: false,
        timestamp: DateTime.now(),
        quickActions: ['Reservar Cerro Negro', 'Ver Videos 4K'],
      );
    } else if (q.contains('masaya') || q.contains('lava')) {
      return ChatMessage(
        id: 'ai-${DateTime.now().millisecondsSinceEpoch}',
        text:
            '🔥 **VOLCÁN MASAYA: CRÁTER SANTIAGO NOCTURNO**\n\n'
            'El lago de lava incandescente más accesible del mundo. Puedes contemplar el magma hirviendo a escasos metros de la orilla del cráter.\n\n'
            '• **Tarifa:** \$30.00 USD (C\$ 1,099 NIO) con acceso nocturno y guía.\n'
            '• **Hora recomendada:** 5:45 PM para apreciar el atardecer y la lava brillante.',
        isUser: false,
        timestamp: DateTime.now(),
        quickActions: ['Reservar Volcán Masaya', 'Ver Mapa'],
      );
    } else {
      return ChatMessage(
        id: 'ai-${DateTime.now().millisecondsSinceEpoch}',
        text:
            'He analizado tu consulta sobre "$query" contrastándola con la base de datos de rutas y prestadores comunitarios.\n\n'
            'Nicaragua ofrece una biodiversidad incomparable: desde el clima fresco y cafetales de Matagalpa hasta las aguas cristalinas de Little Corn Island en el Caribe.\n\n'
            '¿Deseas que armemos un presupuesto detallado para viajeros extranjeros (0% IVA) o para residentes locales (15% IVA)?',
        isUser: false,
        timestamp: DateTime.now(),
        quickActions: ['Calcular en USD & NIO', 'Ver Catálogo Completo', 'Consultar por WhatsApp'],
      );
    }
  }
}

final baqueanoAiServiceProvider = ChangeNotifierProvider<BaqueanoAiService>((ref) {
  return BaqueanoAiService();
});
