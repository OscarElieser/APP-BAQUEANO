// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PRUEBAS DE ARQUITECTURA DE IA, RAG Y MEMORIA DE VIAJERO
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Verificar y blindar los nuevos componentes de inteligencia turística de Baqueano AI:
//   1. Memoria de sesión contextual del viajero (retención de destino, presupuesto y reajustes).
//   2. Conexión RAG a datos reales y directivas estrictas anti-alucinación.
//   3. Despacho y serialización de herramientas ejecutables (Function Calling visual).
//   4. Observabilidad y registro de métricas de inferencia.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Casos de prueba unitarios con simulación de lenguaje natural y verificación de aserciones.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & SUITE DE PRUEBAS):
// - `ai_intelligence_test.dart`: Suite completa de pruebas automatizadas de IA.
// ============================================================================

import 'package:flutter_test/flutter_test.dart';
import 'package:baqueano_app/core/ai/traveler_session_context.dart';
import 'package:baqueano_app/core/ai/baqueano_rag_retriever.dart';
import 'package:baqueano_app/models/ai_tool_action.dart';
import 'package:baqueano_app/models/chat_message.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('🧠 1. Memoria Inteligente del Viajero (TravelerSessionContext)', () {
    test('Extrae y retiene destino y duración en días a partir de lenguaje natural', () {
      var context = const TravelerSessionContext();
      context = TravelerSessionContext.updateFromQuery(
        context,
        'Quiero viajar a Ometepe 3 días con mi pareja',
      );

      expect(context.destination, equals('Isla de Ometepe'));
      expect(context.days, equals(3));
      expect(context.toPromptContext(), contains('Isla de Ometepe'));
      expect(context.toPromptContext(), contains('3 días'));
    });

    test('Reajusta el itinerario y presupuesto cuando el usuario dice "está muy caro"', () {
      var context = const TravelerSessionContext(
        destination: 'Isla de Ometepe',
        days: 3,
        budgetUsd: 250.0,
        travelStyle: 'equilibrado',
      );

      // El usuario protesta por el precio
      context = TravelerSessionContext.updateFromQuery(context, 'Está muy caro');

      // Debe conservar el destino y días, pero conmutar el estilo a económico y reducir presupuesto
      expect(context.destination, equals('Isla de Ometepe'));
      expect(context.days, equals(3));
      expect(context.travelStyle, equals('economico'));
      expect(context.budgetUsd! < 250.0, isTrue);
      expect(context.toPromptContext(), contains('Modalidad presupuestaria solicitada: economico'));
    });

    test('Detecta preferencias temáticas y actividades descartadas sin olvidar estado previo', () {
      var context = const TravelerSessionContext(
        destination: 'León Colonial y Volcanes',
      );

      context = TravelerSessionContext.updateFromQuery(
        context,
        'Nos gusta la playa y el surf, pero no volcanes y sin caminata pesada',
      );

      expect(context.preferences, contains('playa'));
      expect(context.discardedActivities, contains('escalada de volcanes'));
      expect(context.discardedActivities, contains('caminatas pesadas'));
    });
  });

  group('🔴 2. Conexión RAG & Directivas Anti-Alucinación', () {
    test('BaqueanoRagRetriever genera prompt contextualizado con directiva obligatoria', () async {
      final retriever = BaqueanoRagRetriever();
      const session = TravelerSessionContext(destination: 'Isla de Ometepe');

      final result = await retriever.retrieve(
        query: '¿Dónde puedo dormir cerca del volcán maderas?',
        session: session,
      );

      expect(result.ragSystemPromptBlock, isNotEmpty);
      expect(result.ragSystemPromptBlock, contains('DIRECTIVA'));
      expect(result.ragSystemPromptBlock, contains('No inventes'));
    });

    test('RagRetrievalResult emite nivel de confianza y herramientas de acción', () async {
      final retriever = BaqueanoRagRetriever();
      const session = TravelerSessionContext(destination: 'Somoto');

      final result = await retriever.retrieve(
        query: 'Cañón de Somoto guías y precios',
        session: session,
      );

      expect(result.confidenceLevel, isNotNull);
      expect(result.generatedActions, isA<List<AiToolAction>>());
    });
  });

  group('🛠️ 3. Function Calling & Herramientas Ejecutables (AiToolAction)', () {
    test('Serializa y deserializa AiToolAction con parámetros de navegación y contacto', () {
      const tool = AiToolAction(
        label: '🗺️ Ver en Mapa',
        type: AiToolType.showMap,
        params: {
          'latitude': 11.5381,
          'longitude': -85.5684,
          'name': 'Ojo de Agua',
        },
      );

      final map = tool.toMap();
      final reconstructed = AiToolAction.fromMap(map);

      expect(reconstructed.label, equals('🗺️ Ver en Mapa'));
      expect(reconstructed.type, equals(AiToolType.showMap));
      expect(reconstructed.params['latitude'], equals(11.5381));
    });

    test('ChatMessage soporta lista de herramientas ejecutables y nivel de confianza', () {
      final message = ChatMessage(
        id: 'msg-test-1',
        text: 'Te recomiendo el Eco-Lodge Ometepe por \$25 la noche.',
        isUser: false,
        timestamp: DateTime.now(),
        confidenceLevel: AiConfidenceLevel.high,
        isOfflineBackup: false,
        toolActions: const [
          AiToolAction(label: '🛎️ Reservar', type: AiToolType.openCheckout),
          AiToolAction(label: '🗺️ Mapa', type: AiToolType.showMap),
        ],
      );

      final map = message.toMap();
      final fromMap = ChatMessage.fromMap(map);

      expect(fromMap.confidenceLevel, equals(AiConfidenceLevel.high));
      expect(fromMap.toolActions!.length, equals(2));
      expect(fromMap.toolActions!.first.type, equals(AiToolType.openCheckout));
    });
  });
}
