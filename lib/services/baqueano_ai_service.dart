// ============================================================================
// 🤖 HUB MULTI-LLM DE ASISTENCIA TURÍSTICA CON RAG, PROMPT MAESTRO & MODO OFFLINE
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Dotar a Baqueano de una Inteligencia Artificial experta en turismo, viajes y
//   planificación de itinerarios en Nicaragua y Centroamérica, no robótica,
//   empática y veraz con conexión en vivo a Firestore y respaldo offline continuo.
// - Implementar Memoria Inteligente de Sesión (`TravelerSessionContext`) para recordar
//   duración, destino, presupuesto y reajustes ("está muy caro") a lo largo de la charla.
// - Conectar a la base de datos real y verificada de BAQUEANO mediante RAG (`BaqueanoRagRetriever`)
//   para erradicar alucinaciones de precios, horarios, teléfonos o lugares inexistentes.
// - Soportar Function Calling nativo (`AiToolAction`) para abrir mapas satelitales,
//   fichas de establecimientos, contacto telefónico o iniciar reservas comunitarias.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - RAG Pre-Inferencia: Inyección de datos comprobados de Firestore en el System Prompt.
// - Enrutador inteligente con failover en cascada:
//   1. Nivel 1: Groq Cloud Llama 3.3 70B (Velocidad extrema < 1.0s).
//   2. Nivel 2: Ollama Cloud API (Cuenta oficial `appbaqueanonicaragua`).
//   3. Nivel 3: Google Gemini 1.5 Flash.
//   4. Nivel 4: Memoria Caché de Búsquedas Previas + Base de Conocimiento Offline Nativa.
// - Clasificación de certeza con Confidence Layer (`high`, `medium`, `low`).
// - Auditoría y métricas de observabilidad de latencia y tasa de fallos.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & SERVICIOS EXPUESTOS):
// - `BaqueanoAiService`: Servicio ChangeNotifier para la gestión del chat, RAG y memoria.
// - `baqueanoAiServiceProvider`: Provider global de Riverpod.
// ============================================================================

import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../core/data/catalog_data.dart';
import '../core/ai/baqueano_rag_retriever.dart';
import '../core/ai/master_tourism_prompt.dart';
import '../core/ai/traveler_session_context.dart';
import '../core/security/ai_guardrails.dart';
import '../features/directory/services/places_service.dart';
import '../models/ai_tool_action.dart';
import '../models/chat_message.dart';

enum AiProvider { auto, groq, ollama, gemini, local }

class AiObservabilityMetrics {
  int totalRequests = 0;
  int successfulRequests = 0;
  int fallbackCount = 0;
  int cacheHits = 0;
  int guardrailBlocks = 0;
  int lastLatencyMs = 0;
  String lastProviderUsed = 'none';

  Map<String, dynamic> toMap() => {
        'totalRequests': totalRequests,
        'successfulRequests': successfulRequests,
        'fallbackCount': fallbackCount,
        'cacheHits': cacheHits,
        'guardrailBlocks': guardrailBlocks,
        'lastLatencyMs': lastLatencyMs,
        'lastProviderUsed': lastProviderUsed,
      };

  void loadFromMap(Map<String, dynamic> map) {
    totalRequests = map['totalRequests'] ?? 0;
    successfulRequests = map['successfulRequests'] ?? 0;
    fallbackCount = map['fallbackCount'] ?? 0;
    cacheHits = map['cacheHits'] ?? 0;
    guardrailBlocks = map['guardrailBlocks'] ?? 0;
    lastLatencyMs = map['lastLatencyMs'] ?? 0;
    lastProviderUsed = map['lastProviderUsed'] ?? 'none';
  }
}

class BaqueanoAiService extends ChangeNotifier {
  static const String _persistentCachePrefKey = 'baqueano_ai_offline_cache';
  static const String _metricsPrefKey = 'baqueano_ai_observability_metrics';
  static const String _sessionPrefKey = 'baqueano_traveler_session';

  // 🛡️ AI GATEWAY & CREDENCIALES COMPILADAS (CERO LLAVES SECRETAS EXPUESTAS EN EL APK)
  // En producción, el cliente invoca el endpoint seguro del AI Gateway alojado en backend.
  static const String _aiGatewayBaseUrl = String.fromEnvironment(
    'AI_GATEWAY_URL',
    defaultValue: 'https://api.baqueano.app/ai/v1',
  );

  static String get _groqApiKey => const String.fromEnvironment('GROQ_API_KEY');
  static String get _ollamaApiKey => const String.fromEnvironment('OLLAMA_API_KEY');
  static String get _geminiApiKey => const String.fromEnvironment('GEMINI_API_KEY');

  final BaqueanoRagRetriever _ragRetriever;
  AiProvider _currentProvider = AiProvider.auto;
  TravelerSessionContext _sessionContext = const TravelerSessionContext();
  final List<ChatMessage> _chatHistory = [];
  bool _isTyping = false;
  final AiObservabilityMetrics metrics = AiObservabilityMetrics();

  // Memoria caché de consultas e investigaciones online para respaldo offline permanente
  final Map<String, String> _offlineSearchCache = {
    'ometepe': OfflineTourismKnowledge.getSmartResponse('ometepe'),
    'somoto': OfflineTourismKnowledge.getSmartResponse('somoto'),
    'matagalpa': OfflineTourismKnowledge.getSmartResponse('matagalpa'),
    'cerro negro': OfflineTourismKnowledge.getSmartResponse('cerro negro'),
  };

  BaqueanoAiService({
    PlacesService? placesService,
    BaqueanoRagRetriever? ragRetriever,
  }) : _ragRetriever = ragRetriever ?? BaqueanoRagRetriever(placesService: placesService) {
    _initWelcome();
    _loadPersistentData();
  }

  Future<void> _loadPersistentData() async {
    await _loadPersistentCache();
    await _loadMetrics();
    await _loadTravelerSession();
  }

  Future<void> _loadMetrics() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_metricsPrefKey);
      if (raw != null && raw.isNotEmpty) {
        metrics.loadFromMap(jsonDecode(raw));
      }
    } catch (_) {}
  }

  Future<void> _saveMetrics() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_metricsPrefKey, jsonEncode(metrics.toMap()));
    } catch (_) {}
  }

  Future<void> _loadTravelerSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_sessionPrefKey);
      if (raw != null && raw.isNotEmpty) {
        _sessionContext = TravelerSessionContext.fromMap(jsonDecode(raw));
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> _saveTravelerSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_sessionPrefKey, jsonEncode(_sessionContext.toMap()));
    } catch (_) {}
  }

  /// Verificación de conectividad real a internet en milisegundos (< 600ms)
  Future<bool> _hasActiveInternet() async {
    try {
      final result = await InternetAddress.lookup('api.groq.com')
          .timeout(const Duration(milliseconds: 600));
      return result.isNotEmpty && result[0].rawAddress.isNotEmpty;
    } catch (_) {
      return false;
    }
  }

  Future<void> _loadPersistentCache() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cachedJson = prefs.getString(_persistentCachePrefKey);
      if (cachedJson != null && cachedJson.isNotEmpty) {
        final Map<String, dynamic> decoded = jsonDecode(cachedJson);
        for (final entry in decoded.entries) {
          _offlineSearchCache[entry.key] = entry.value.toString();
        }
      }
    } catch (e) {
      debugPrint('Aviso cargando caché offline de IA: $e');
    }
  }

  Future<void> _saveCacheToDisk() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_persistentCachePrefKey, jsonEncode(_offlineSearchCache));
    } catch (_) {}
  }

  AiProvider get currentProvider => _currentProvider;
  List<ChatMessage> get chatHistory => _chatHistory;
  bool get isTyping => _isTyping;
  TravelerSessionContext get sessionContext => _sessionContext;

  void setProvider(AiProvider provider) {
    _currentProvider = provider;
    notifyListeners();
  }

  void resetTravelerSession() {
    _sessionContext = const TravelerSessionContext();
    notifyListeners();
  }

  void _initWelcome() {
    _chatHistory.add(
      ChatMessage(
        id: 'welcome-1',
        text:
            '¡Buenas explorador! Soy tu Baqueano Mayor 🤖🇳🇮, tu asistente y planificador turístico experto en Nicaragua.\n\n'
            'Cuento con conexión directa a los registros verificados de Baqueano (alojamientos campesinos, guías certificados y rutas seguras).\n\n'
            '¿A dónde deseas viajar o qué experiencia tienes en mente?',
        isUser: false,
        timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
        confidenceLevel: AiConfidenceLevel.high,
        quickActions: [
          '🌋 Planificar 3 días en Ometepe',
          '🏊 Presupuesto Cañón de Somoto',
          '🏄 Surf y Cabañas en Popoyo',
          '☕ Ruta del Café en Matagalpa',
        ],
      ),
    );
  }

  Future<void> sendUserPrompt(String query) async {
    if (query.trim().isEmpty) return;
    metrics.totalRequests++;

    final stopwatch = Stopwatch()..start();

    // 1. Actualizar Memoria Inteligente de Sesión con la nueva consulta del viajero
    _sessionContext = TravelerSessionContext.updateFromQuery(_sessionContext, query);

    final userMsg = ChatMessage(
      id: 'msg-${DateTime.now().millisecondsSinceEpoch}',
      text: query,
      isUser: true,
      timestamp: DateTime.now(),
    );

    _chatHistory.add(userMsg);
    _isTyping = true;

    // Optimización de memoria: Mantener máximo 25 mensajes activos en memoria
    if (_chatHistory.length > 25) {
      final welcome = _chatHistory.first;
      _chatHistory.removeRange(1, _chatHistory.length - 20);
      if (!_chatHistory.contains(welcome)) {
        _chatHistory.insert(0, welcome);
      }
    }
    notifyListeners();

    // 2. 🛡️ BLINDAJE DIGITAL: Validación y Sanitización con AI Guardrails
    final validation = AiGuardrails.sanitizeAndValidate(query);
    if (!validation.isSafe) {
      metrics.guardrailBlocks++;
      final blockMsg = ChatMessage(
        id: 'ai-sec-${DateTime.now().millisecondsSinceEpoch}',
        text:
            '🛡️ **ESCUDO DE SEGURIDAD DIGITAL BAQUEANO**\n\n'
            '${validation.riskReason ?? "La consulta no cumple con las directivas de seguridad del sistema."}\n\n'
            '🔒 *Auditoría de Protección:* `${validation.auditToken}`\n\n'
            'Por favor formula una consulta sobre destinos turísticos, senderismo, transporte o gastronomía comunitaria de Nicaragua.',
        isUser: false,
        timestamp: DateTime.now(),
        confidenceLevel: AiConfidenceLevel.high,
        quickActions: [
          '🌋 Ver Volcán Masaya',
          '🏊 Presupuesto Cañón de Somoto',
          '🏄 Surf en Popoyo',
        ],
      );
      _chatHistory.add(blockMsg);
      _isTyping = false;
      notifyListeners();
      return;
    }

    final sanitizedQuery = validation.sanitizedQuery;

    // 3. 🔴 RECUPERACIÓN RAG: Consultar base de datos real de Firestore antes de inferir
    final ragResult = await _ragRetriever.retrieve(
      query: sanitizedQuery,
      session: _sessionContext,
    );

    final dynamicSystemPrompt = _buildSystemPrompt(
      ragBlock: ragResult.ragSystemPromptBlock,
      sessionBlock: _sessionContext.toPromptContext(),
    );

    String responseText = '';
    AiConfidenceLevel confidence = ragResult.confidenceLevel;
    bool isOffline = false;

    // 4. Detección instantánea de conectividad (< 600ms) para evitar timeouts en offline
    final hasInternet = await _hasActiveInternet();

    if (!hasInternet) {
      isOffline = true;
      metrics.lastProviderUsed = 'local-offline';
      final fallback = _synthesizeLocalResponse(sanitizedQuery);
      responseText = fallback.text;
      confidence = AiConfidenceLevel.medium;
    } else {
      try {
        if (_groqApiKey.isNotEmpty && (_currentProvider == AiProvider.groq || _currentProvider == AiProvider.auto)) {
          responseText = await _fetchGroqInference(sanitizedQuery, dynamicSystemPrompt);
          metrics.lastProviderUsed = 'groq';
        } else if (_ollamaApiKey.isNotEmpty && _currentProvider == AiProvider.ollama) {
          responseText = await _fetchOllamaInference(sanitizedQuery, dynamicSystemPrompt);
          metrics.lastProviderUsed = 'ollama';
        } else if (_geminiApiKey.isNotEmpty && _currentProvider == AiProvider.gemini) {
          responseText = await _fetchGeminiInference(sanitizedQuery, dynamicSystemPrompt);
          metrics.lastProviderUsed = 'gemini';
        } else {
          // Si no hay llaves locales en dev, invocar el AI Gateway de backend
          responseText = await _fetchGatewayInference(sanitizedQuery, dynamicSystemPrompt);
          metrics.lastProviderUsed = 'ai-gateway';
        }
      } catch (_) {
        metrics.fallbackCount++;
        // Fallback 1: Ollama Cloud (si tiene llave configurada)
        try {
          if (_ollamaApiKey.isNotEmpty) {
            responseText = await _fetchOllamaInference(sanitizedQuery, dynamicSystemPrompt);
            metrics.lastProviderUsed = 'ollama-fallback';
          } else {
            throw Exception('Ollama no configurado');
          }
        } catch (_) {
          // Fallback 2: Google Gemini (si tiene llave configurada)
          try {
            if (_geminiApiKey.isNotEmpty) {
              responseText = await _fetchGeminiInference(sanitizedQuery, dynamicSystemPrompt);
              metrics.lastProviderUsed = 'gemini-fallback';
            } else {
              throw Exception('Gemini no configurado');
            }
          } catch (_) {
            // Fallback 3: Base de conocimiento offline y caché local
            isOffline = true;
            metrics.lastProviderUsed = 'local-offline';
            final fallback = _synthesizeLocalResponse(sanitizedQuery);
            responseText = fallback.text;
            confidence = AiConfidenceLevel.medium;
          }
        }
      }
    }

    if (responseText.isEmpty) {
      isOffline = true;
      metrics.lastProviderUsed = 'local-offline';
      final fallback = _synthesizeLocalResponse(sanitizedQuery);
      responseText = fallback.text;
      confidence = AiConfidenceLevel.medium;
    } else if (!isOffline) {
      metrics.successfulRequests++;
      // Guardar en la caché offline en memoria y persistir en disco
      _offlineSearchCache[sanitizedQuery.toLowerCase().trim()] = responseText;
      _saveCacheToDisk();
    }

    stopwatch.stop();
    metrics.lastLatencyMs = stopwatch.elapsedMilliseconds;
    await _saveMetrics();
    await _saveTravelerSession();

    // 5. Creación del mensaje de respuesta enriquecido con acciones de herramienta nativas
    final List<AiToolAction> finalActions = List<AiToolAction>.from(ragResult.generatedActions);
    if (finalActions.isEmpty && _sessionContext.destination != null) {
      final destName = _sessionContext.destination!.toLowerCase();
      final matched = CatalogData.destinations.where((d) =>
        d.title.toLowerCase().contains(destName) ||
        d.department.toLowerCase().contains(destName)
      ).firstOrNull;

      if (matched != null) {
        finalActions.add(
          AiToolAction(
            label: '🛎️ Reservar ${matched.title}',
            type: AiToolType.openCheckout,
            params: {
              'destination': matched.title,
              'placeId': matched.id,
              'amountUsd': matched.priceUsd,
            },
          ),
        );
      }
    }

    final aiMsg = ChatMessage(
      id: 'ai-${DateTime.now().millisecondsSinceEpoch}',
      text: responseText,
      isUser: false,
      timestamp: DateTime.now(),
      confidenceLevel: confidence,
      isOfflineBackup: isOffline,
      toolActions: finalActions.isNotEmpty ? finalActions : null,
      quickActions: _generateQuickActions(sanitizedQuery),
    );

    _chatHistory.add(aiMsg);
    _isTyping = false;
    notifyListeners();
  }

  /// Inferencia mediante el AI Gateway seguro de BAQUEANO (Genkit / Backend)
  Future<String> _fetchGatewayInference(String userQuery, String systemPrompt) async {
    final client = HttpClient();
    client.connectionTimeout = const Duration(seconds: 4);

    try {
      final request = await client.postUrl(Uri.parse('$_aiGatewayBaseUrl/chat'));
      request.headers.set('Content-Type', 'application/json; charset=utf-8');

      final payload = jsonEncode({
        'messages': [
          {'role': 'system', 'content': systemPrompt},
          {'role': 'user', 'content': userQuery},
        ],
        'session': _sessionContext.toMap(),
      });

      request.write(payload);
      final response = await request.close();

      if (response.statusCode == 200) {
        final responseBody = await response.transform(utf8.decoder).join();
        final json = jsonDecode(responseBody) as Map<String, dynamic>;
        final reply = json['reply'] ?? json['text'] ?? json['content'];
        if (reply != null && reply.toString().trim().isNotEmpty) {
          return reply.toString().trim();
        }
      }
      throw Exception('Gateway error: ${response.statusCode}');
    } finally {
      client.close();
    }
  }

  /// Inferencia mediante Groq Cloud (Llama 3.3 70B)
  Future<String> _fetchGroqInference(String userQuery, String systemPrompt) async {
    final client = HttpClient();
    client.connectionTimeout = const Duration(seconds: 4);

    try {
      final request = await client.postUrl(Uri.parse('https://api.groq.com/openai/v1/chat/completions'));
      request.headers.set('Authorization', 'Bearer $_groqApiKey');
      request.headers.set('Content-Type', 'application/json; charset=utf-8');

      final payload = jsonEncode({
        'model': 'llama-3.3-70b-versatile',
        'messages': [
          {'role': 'system', 'content': systemPrompt},
          {'role': 'user', 'content': userQuery},
        ],
        'temperature': 0.7,
        'max_tokens': 1400,
      });

      request.write(payload);
      final response = await request.close();

      if (response.statusCode == 200) {
        final responseBody = await response.transform(utf8.decoder).join();
        final json = jsonDecode(responseBody) as Map<String, dynamic>;
        final choices = json['choices'] as List<dynamic>?;
        if (choices != null && choices.isNotEmpty) {
          final content = choices[0]['message']['content'] as String?;
          if (content != null && content.trim().isNotEmpty) {
            return content.trim();
          }
        }
      }
      throw Exception('Groq error: ${response.statusCode}');
    } finally {
      client.close();
    }
  }

  /// Inferencia mediante Ollama Cloud API (Cuenta: appbaqueanonicaragua)
  Future<String> _fetchOllamaInference(String userQuery, String systemPrompt) async {
    final client = HttpClient();
    client.connectionTimeout = const Duration(seconds: 4);

    try {
      final request = await client.postUrl(Uri.parse('https://api.ollama.com/v1/chat/completions'));
      request.headers.set('Authorization', 'Bearer $_ollamaApiKey');
      request.headers.set('Content-Type', 'application/json; charset=utf-8');

      final payload = jsonEncode({
        'model': 'llama3.3',
        'messages': [
          {'role': 'system', 'content': systemPrompt},
          {'role': 'user', 'content': userQuery},
        ],
        'temperature': 0.7,
        'stream': false,
      });

      request.write(payload);
      final response = await request.close();

      if (response.statusCode == 200) {
        final responseBody = await response.transform(utf8.decoder).join();
        final json = jsonDecode(responseBody) as Map<String, dynamic>;
        final choices = json['choices'] as List<dynamic>?;
        if (choices != null && choices.isNotEmpty) {
          final content = choices[0]['message']['content'] as String?;
          if (content != null && content.trim().isNotEmpty) {
            return content.trim();
          }
        }
      }
      throw Exception('Ollama error: ${response.statusCode}');
    } finally {
      client.close();
    }
  }

  /// Inferencia mediante Google Gemini 1.5 Flash API
  Future<String> _fetchGeminiInference(String userQuery, String systemPrompt) async {
    final client = HttpClient();
    client.connectionTimeout = const Duration(seconds: 4);

    try {
      final url = Uri.parse(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$_geminiApiKey');
      final request = await client.postUrl(url);
      request.headers.set('Content-Type', 'application/json; charset=utf-8');

      final payload = jsonEncode({
        'contents': [
          {
            'parts': [
              {'text': '$systemPrompt\n\nConsulta del viajero: $userQuery'}
            ]
          }
        ],
        'generationConfig': {
          'temperature': 0.7,
          'maxOutputTokens': 1400,
        }
      });

      request.write(payload);
      final response = await request.close();

      if (response.statusCode == 200) {
        final responseBody = await response.transform(utf8.decoder).join();
        final json = jsonDecode(responseBody) as Map<String, dynamic>;
        final candidates = json['candidates'] as List<dynamic>?;
        if (candidates != null && candidates.isNotEmpty) {
          final text = candidates[0]['content']['parts'][0]['text'] as String?;
          if (text != null && text.trim().isNotEmpty) {
            return text.trim();
          }
        }
      }
      throw Exception('Gemini error: ${response.statusCode}');
    } finally {
      client.close();
    }
  }

  String _buildSystemPrompt({required String ragBlock, required String sessionBlock}) {
    return '${MasterTourismPrompt.systemPrompt}\n\n$sessionBlock\n\n$ragBlock';
  }

  List<String> _generateQuickActions(String query) {
    final q = query.toLowerCase();
    if (q.contains('ometepe')) {
      return ['Reservar Tour Ometepe', 'Ver Mapa de Ometepe', 'Contactar Guía Mayra'];
    } else if (q.contains('somoto')) {
      return ['Reservar Cañón de Somoto', 'Ver Ficha de Don Toño', 'Calcular en Córdobas'];
    } else if (q.contains('cerro negro') || q.contains('sandboarding')) {
      return ['Reservar Cerro Negro', 'Ver Videos 4K', 'Guías de León'];
    } else if (q.contains('matagalpa') || q.contains('cascada')) {
      return ['Reservar Cascada La Luna', 'Ficha Doña Rosa Amelia', 'Ruta del Café'];
    } else {
      return ['Calcular en USD & NIO', 'Ver Mapa GPS Satelital', 'Planificar Itinerario'];
    }
  }

  ChatMessage _synthesizeLocalResponse(String query) {
    final cleanQ = query.toLowerCase().trim();

    // 1. Revisar si la consulta fue resuelta previamente y guardada en caché offline
    if (_offlineSearchCache.containsKey(cleanQ)) {
      metrics.cacheHits++;
      return ChatMessage(
        id: 'ai-${DateTime.now().millisecondsSinceEpoch}',
        text: '📱 **[INFORMACIÓN EN MEMORIA OFFLINE]**\n\n${_offlineSearchCache[cleanQ]!}',
        isUser: false,
        timestamp: DateTime.now(),
        isOfflineBackup: true,
        confidenceLevel: AiConfidenceLevel.medium,
        quickActions: _generateQuickActions(query),
      );
    }

    // Búsqueda por subcadena en la caché guardada
    for (final entry in _offlineSearchCache.entries) {
      if (cleanQ.contains(entry.key) || entry.key.contains(cleanQ)) {
        metrics.cacheHits++;
        return ChatMessage(
          id: 'ai-${DateTime.now().millisecondsSinceEpoch}',
          text: '📱 **[INFORMACIÓN EN MEMORIA OFFLINE]**\n\n${entry.value}',
          isUser: false,
          timestamp: DateTime.now(),
          isOfflineBackup: true,
          confidenceLevel: AiConfidenceLevel.medium,
          quickActions: _generateQuickActions(query),
        );
      }
    }

    // 2. Respuesta inteligente de la base de conocimiento nativa
    final localResponse = OfflineTourismKnowledge.getSmartResponse(query);
    return ChatMessage(
      id: 'ai-${DateTime.now().millisecondsSinceEpoch}',
      text: localResponse,
      isUser: false,
      timestamp: DateTime.now(),
      isOfflineBackup: true,
      confidenceLevel: AiConfidenceLevel.medium,
      quickActions: _generateQuickActions(query),
    );
  }
}

final baqueanoAiServiceProvider = ChangeNotifierProvider<BaqueanoAiService>((ref) {
  final placesService = ref.watch(placesServiceProvider);
  return BaqueanoAiService(placesService: placesService);
});
