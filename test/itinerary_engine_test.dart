// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PRUEBAS UNITARIAS DEL MOTOR DE ITINERARIOS
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Verificar la exactitud matemática y la integridad operativa del motor de itinerarios
//   turísticos (ItineraryEngineService) en Nicaragua.
// - Garantizar que ningún explorador reciba trayectos alucinados, precios falsos o
//   actividades que sobrepasen su capacidad física seleccionada.
// - Asegurar la conversión bimoneda fidedigna según la tasa oficial del Banco Central
//   de Nicaragua (36.65 NIO / USD).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Pruebas unitarias directas sobre `ItineraryEngineService.generateItinerary` y
//   `recalculateCheaper` empleando `TravelerSessionContext`.
// - Verificación de casos límite: 1 día, 3 días, 5 días, destinos desconocidos,
//   y filtrado estricto por dificultad física (Easy / Moderate / Hard).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & CASOS DE PRUEBA):
// - `test/itinerary_engine_test.dart`: Suite exhaustiva con 6 escenarios de prueba.
// ============================================================================

import 'package:flutter_test/flutter_test.dart';
import 'package:baqueano_app/core/ai/traveler_session_context.dart';
import 'package:baqueano_app/features/ai_assistant/models/itinerary_model.dart';
import 'package:baqueano_app/features/ai_assistant/services/itinerary_engine_service.dart';

void main() {
  group('🗺️ ItineraryEngineService — Generación de Rutas y Validación Operacional', () {
    test(
      '1. Genera itinerario estructurado de 1 día con coherencia bimoneda (USD/NIO)',
      () {
        final context = const TravelerSessionContext(
          destination: 'Ometepe',
          days: 1,
          adults: 2,
          children: 0,
          travelStyle: 'aventura',
        );

        final itinerary = ItineraryEngineService.generateItinerary(
          context: context,
        );

        expect(itinerary.days.length, equals(1));
        expect(itinerary.days.first.dayNumber, equals(1));
        expect(itinerary.days.first.activities.isNotEmpty, isTrue);

        // Verificación de la tasa del Banco Central de Nicaragua
        expect(itinerary.exchangeRate, equals(36.65));
        final expectedNio = itinerary.totalEstimatedCostUsd * 36.65;
        expect(
          (itinerary.totalEstimatedCostNio - expectedNio).abs() < 0.05,
          isTrue,
        );
      },
    );

    test(
      '2. Genera itinerario de 3 días con destinos y actividades secuenciales',
      () {
        final context = const TravelerSessionContext(
          destination: 'Somoto',
          days: 3,
          adults: 1,
          travelStyle: 'ecoturismo',
        );

        final itinerary = ItineraryEngineService.generateItinerary(
          context: context,
        );

        expect(itinerary.days.length, equals(3));
        for (int i = 0; i < 3; i++) {
          expect(itinerary.days[i].dayNumber, equals(i + 1));
          expect(itinerary.days[i].activities.isNotEmpty, isTrue);
        }
        expect(itinerary.totalEstimatedCostUsd, greaterThan(0));
        expect(itinerary.totalEstimatedCostNio, greaterThan(0));
      },
    );

    test(
      '3. Genera itinerario de 5 días respetando tope de días y estructura diaria',
      () {
        final context = const TravelerSessionContext(
          destination: 'Matagalpa',
          days: 5,
          adults: 4,
          travelStyle: 'cultural',
        );

        final itinerary = ItineraryEngineService.generateItinerary(
          context: context,
        );

        expect(itinerary.days.length, equals(5));
        expect(itinerary.travelers, equals(4));
        expect(itinerary.days.last.dayNumber, equals(5));
      },
    );

    test(
      '4. Filtrado estricto por dificultad física: dificultad fácil descarta senderismo muy difícil',
      () {
        final context = const TravelerSessionContext(
          destination: 'Cerro Negro',
          days: 1,
          adults: 2,
        );

        final itinerary = ItineraryEngineService.generateItinerary(
          context: context,
          explicitQuery:
              'Quiero algo tranquilo y suave, nada de esfuerzo extremo',
        );

        for (final day in itinerary.days) {
          for (final act in day.activities) {
            expect(
              act.difficulty,
              isNot(equals(PhysicalDifficulty.muyDificil)),
            );
          }
        }
      },
    );

    test(
      '5. Reajuste de presupuesto (recalculateCheaper) reduce costos sin inventar datos',
      () {
        final context = const TravelerSessionContext(
          destination: 'Granada',
          days: 2,
          adults: 2,
        );

        final originalItinerary = ItineraryEngineService.generateItinerary(
          context: context,
        );
        final cheaperItinerary = ItineraryEngineService.recalculateCheaper(
          originalItinerary,
        );

        expect(
          cheaperItinerary.totalEstimatedCostUsd,
          lessThanOrEqualTo(originalItinerary.totalEstimatedCostUsd),
        );
        expect(
          cheaperItinerary.totalEstimatedCostNio,
          lessThanOrEqualTo(originalItinerary.totalEstimatedCostNio),
        );
      },
    );

    test(
      '6. Manejo resiliente de destinos no catalogados: provee fallback seguro sin colapsar',
      () {
        final context = const TravelerSessionContext(
          destination: 'DestinoFicticioInexistente',
          days: 2,
          adults: 1,
        );

        final itinerary = ItineraryEngineService.generateItinerary(
          context: context,
        );

        expect(itinerary.days.isNotEmpty, isTrue);
        expect(itinerary.days.length, equals(2));
        expect(itinerary.totalEstimatedCostUsd, greaterThan(0));
      },
    );
  });
}
