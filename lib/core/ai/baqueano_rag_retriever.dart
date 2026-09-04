// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MOTOR RAG (RETRIEVAL AUGMENTED GENERATION) TURÍSTICO
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Conectar las respuestas del modelo LLM directamente a los datos reales y verificados
//   de Cloud Firestore y la base de datos local de BAQUEANO (alojamientos, guías,
//   restaurantes campesinos, horarios, teléfonos y servicios de emergencia).
// - Erradicar alucinaciones de la IA (números falsos, precios inventados o negocios inexistentes)
//   mediante inyección de hechos comprobados en el System Prompt.
// - Generar acciones interactivas nativas (Function Calling) asociadas a los lugares reales.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Consulta semántica y de coincidencia de entidades con `PlacesService`.
// - Ponderación de estado verificado (`verified: true`) y fecha de auditoría.
// - Empaquetado en un resultado inmutable `RagRetrievalResult` con texto de contexto,
//   acciones estructuradas `AiToolAction` y nivel de confianza.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & CLASES EXPUESTAS):
// - `RagRetrievalResult`: Contenedor del contexto verificado, nivel de confianza y acciones.
// - `BaqueanoRagRetriever`: Motor de búsqueda y formateador de conocimiento oficial.
// ============================================================================

import 'package:flutter/foundation.dart';
import '../../features/directory/models/place_model.dart';
import '../../features/directory/services/places_service.dart';
import '../../models/ai_tool_action.dart';
import '../../models/chat_message.dart';
import 'traveler_session_context.dart';

class RagRetrievalResult {
  final String ragSystemPromptBlock;
  final List<AiToolAction> generatedActions;
  final AiConfidenceLevel confidenceLevel;
  final List<PlaceModel> retrievedPlaces;

  const RagRetrievalResult({
    required this.ragSystemPromptBlock,
    required this.generatedActions,
    required this.confidenceLevel,
    required this.retrievedPlaces,
  });
}

class BaqueanoRagRetriever {
  final PlacesService _placesService;

  BaqueanoRagRetriever({PlacesService? placesService})
      : _placesService = placesService ?? PlacesService();

  /// Consulta los datos reales de BAQUEANO y genera el contexto verificado para la IA
  Future<RagRetrievalResult> retrieve({
    required String query,
    required TravelerSessionContext session,
  }) async {
    final cleanQuery = query.toLowerCase();

    // 1. Detección exhaustiva de entidades geográficas oficiales de Nicaragua
    final departments = [
      'boaco', 'carazo', 'chinandega', 'chontales', 'estelí', 'esteli',
      'granada', 'jinotega', 'león', 'leon', 'madriz', 'managua',
      'masaya', 'matagalpa', 'nueva segovia', 'río san juan', 'rio san juan',
      'rivas', 'raccn', 'raccs', 'caribe norte', 'caribe sur',
    ];

    final landmarks = [
      'ometepe', 'somoto', 'corn island', 'little corn', 'popoyo',
      'san juan del sur', 'mombacho', 'maderas', 'concepcion', 'concepción',
      'cerro negro', 'apoyo', 'laguna de apoyo', 'cosigüina', 'cosiguina',
      'san ramón', 'san ramon', 'miraflor', 'tiscapa', 'zapatera',
      'solentiname', 'el castillo', 'san carlos', 'poneloya', 'las peñitas',
      'jiquilillo', 'bosawás', 'bosawas', 'peñas blancas',
    ];

    final categoriesIntent = <String, String>{
      'hotel': 'alojamiento',
      'hospedaje': 'alojamiento',
      'dormir': 'alojamiento',
      'cabaña': 'alojamiento',
      'cabana': 'alojamiento',
      'hostal': 'alojamiento',
      'restaurante': 'gastronomia',
      'comida': 'gastronomia',
      'comer': 'gastronomia',
      'almuerzo': 'gastronomia',
      'cena': 'gastronomia',
      'guía': 'tours',
      'guia': 'tours',
      'tour': 'tours',
      'caminata': 'senderismo',
      'senderismo': 'senderismo',
      'volcán': 'volcanes',
      'volcan': 'volcanes',
      'playa': 'playas',
      'surf': 'aventura',
      'emergencia': 'emergencias',
      'hospital': 'emergencias',
      'policía': 'emergencias',
      'policia': 'emergencias',
    };

    String? matchedGeo;
    String? matchedCategory;

    // Priorizar destino de la sesión si ya fue elegido
    if (session.destination != null && session.destination!.isNotEmpty) {
      matchedGeo = session.destination;
    }

    // Buscar si menciona departamento o hito geográfico
    for (final dept in departments) {
      if (cleanQuery.contains(dept)) {
        matchedGeo = dept;
        break;
      }
    }
    if (matchedGeo == null) {
      for (final lm in landmarks) {
        if (cleanQuery.contains(lm)) {
          matchedGeo = lm;
          break;
        }
      }
    }

    // Detectar intención de categoría
    for (final entry in categoriesIntent.entries) {
      if (cleanQuery.contains(entry.key)) {
        matchedCategory = entry.value;
        break;
      }
    }

    String? searchTarget;
    if (matchedGeo != null && matchedCategory != null) {
      searchTarget = '$matchedGeo $matchedCategory';
    } else if (matchedGeo != null) {
      searchTarget = matchedGeo;
    } else if (matchedCategory != null) {
      searchTarget = matchedCategory;
    } else {
      // Tokenizar palabras clave relevantes de más de 4 letras excluyendo stop-words comunes
      const stopWords = {
        'donde', 'puedo', 'quiero', 'viajar', 'hacer', 'estar', 'recomienda',
        'favor', 'buenas', 'hola', 'dias', 'para', 'como', 'cuanto', 'cuesta',
        'tienes', 'sobre', 'este', 'esta', 'estos', 'estas', 'algun', 'alguna'
      };
      final tokens = cleanQuery
          .replaceAll(RegExp(r'[^\w\s]'), '')
          .split(RegExp(r'\s+'))
          .where((w) => w.length >= 4 && !stopWords.contains(w))
          .toList();
      if (tokens.isNotEmpty) {
        searchTarget = tokens.take(2).join(' ');
      }
    }

    // 2. Consultar el repositorio de lugares verificados
    List<PlaceModel> places = [];
    try {
      if (searchTarget != null && searchTarget.isNotEmpty) {
        places = await _placesService.getPlaces(
          searchQuery: searchTarget,
          limit: 4,
        );
      }
      if (places.isEmpty) {
        places = await _placesService.getPlaces(
          limit: 3,
        );
      }
    } catch (e) {
      debugPrint('⚠️ [BaqueanoRagRetriever] Error consultando PlacesService: $e');
    }

    // 3. Formatear los datos y directivas anti-alucinación
    final promptBuffer = StringBuffer();
    final actions = <AiToolAction>[];

    final hasDirectMatch = matchedGeo != null || matchedCategory != null;

    if (places.isNotEmpty && hasDirectMatch) {
      promptBuffer.writeln('=== [BASE DE DATOS REAL Y VERIFICADA DE BAQUEANO EN FIRESTORE (RAG)] ===');
      promptBuffer.writeln('Los siguientes son registros oficiales y comprobados en el territorio de Nicaragua:');

      for (final p in places) {
        final verifiedText = p.verified ? '✅ Verificado Oficialmente' : 'ℹ️ Registro Comunitario';
        final contactPhone = (p.phone != null && p.phone!.trim().isNotEmpty) ? p.phone! : 'No registrado en ficha';
        final contactWa = (p.whatsapp != null && p.whatsapp!.trim().isNotEmpty) ? p.whatsapp! : null;

        promptBuffer.writeln('• ${p.name} (${p.categoryName} - ${p.subcategory})');
        promptBuffer.writeln('  - Ubicación: ${p.municipalityName}, ${p.departmentName} (${p.address})');
        promptBuffer.writeln('  - Estado: $verifiedText (Fuente: ${p.verificationSource ?? "BAQUEANO"})');
        promptBuffer.writeln('  - Teléfono Oficial: $contactPhone');
        if (contactWa != null) {
          promptBuffer.writeln('  - WhatsApp: $contactWa');
        }
        if (p.description.isNotEmpty) {
          promptBuffer.writeln('  - Descripción: ${p.description}');
        }

        // Crear herramientas ejecutables nativas para el usuario
        actions.add(
          AiToolAction(
            label: '📍 ${p.name}',
            type: AiToolType.viewPlace,
            params: {
              'placeId': p.placeId,
              'name': p.name,
              'municipality': p.municipalityName,
            },
          ),
        );

        if (p.latitude != 0.0 && p.longitude != 0.0) {
          actions.add(
            AiToolAction(
              label: '🗺️ Ver en Mapa',
              type: AiToolType.showMap,
              params: {
                'latitude': p.latitude,
                'longitude': p.longitude,
                'name': p.name,
              },
            ),
          );
        }

        if (p.phone != null && p.phone!.trim().isNotEmpty) {
          actions.add(
            AiToolAction(
              label: '📞 Llamar a ${p.name}',
              type: AiToolType.callPhone,
              params: {'phone': p.phone!},
            ),
          );
        }
      }

      promptBuffer.writeln('-------------------------------------------------------------');
      promptBuffer.writeln('DIRECTIVA ANTI-ALUCINACIÓN OBLIGATORIA:');
      promptBuffer.writeln('1. Si el viajero pregunta por opciones concretas de estos destinos o servicios, utiliza los lugares arriba listados.');
      promptBuffer.writeln('2. No inventes números telefónicos, precios exactos ni disponibilidades que no figuren en los datos verificados.');
      promptBuffer.writeln('3. Si un dato no está disponible, dilo explícitamente: "No tengo un registro oficial de precio verificado para esa opción específica en BAQUEANO".');
      promptBuffer.writeln('=============================================================');

      return RagRetrievalResult(
        ragSystemPromptBlock: promptBuffer.toString(),
        generatedActions: actions.take(4).toList(),
        confidenceLevel: AiConfidenceLevel.high,
        retrievedPlaces: places,
      );
    } else {
      promptBuffer.writeln('=== [BASE DE DATOS BAQUEANO - SIN REGISTRO ESPECÍFICO] ===');
      promptBuffer.writeln('No se encontraron registros directos de Firestore para el destino o servicio exacto.');
      promptBuffer.writeln('DIRECTIVA: Proporciona orientación turística geográfica general sobre Nicaragua basada en conocimiento cultural.');
      promptBuffer.writeln('No inventes nombres comerciales ficticios, números de teléfono ni tarifas exactas.');
      promptBuffer.writeln('==========================================================');

      return RagRetrievalResult(
        ragSystemPromptBlock: promptBuffer.toString(),
        generatedActions: const [],
        confidenceLevel: hasDirectMatch ? AiConfidenceLevel.medium : AiConfidenceLevel.low,
        retrievedPlaces: const [],
      );
    }
  }
}
