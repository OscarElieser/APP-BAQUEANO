// ============================================================================
// 🧭 BAQUEANO — PRUEBAS DEL CARRUSEL «¿QUÉ QUERÉS VIVIR?» (APP)
// ============================================================================
// 🎯 POR QUÉ: paridad web → app (14-10-2026): la app muestra las mismas 10
//   vivencias que la portada web, con las mismas fotos y textos en 8 idiomas.
// ⚙️ CÓMO: datos (ids, fotos, claves en los 8 catálogos), cálculo circular y el
//   widget en teléfono, tablet y escritorio: sin desborde, flechas, tarjeta
//   lateral al centro y la central elige la vivencia.
// 📦 QUÉ: `vivencias`, `circularOffset` y `VivirCoverflow`.
// ============================================================================

import 'dart:convert';
import 'dart:io';

import 'package:baqueano_app/features/home/widgets/vivir_coverflow.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

Future<Vivencia?> _pump(WidgetTester tester, Size size) async {
  SharedPreferences.setMockInitialValues({});
  tester.view.physicalSize = size;
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);
  Vivencia? chosen;
  await tester.pumpWidget(
    ProviderScope(
      child: MaterialApp(
        home: Scaffold(
          body: SingleChildScrollView(child: VivirCoverflow(onSelected: (v) => chosen = v)),
        ),
      ),
    ),
  );
  await tester.pumpAndSettle();
  return chosen;
}

String _dockTitle(WidgetTester tester) {
  final texts = tester.widgetList<Text>(find.descendant(of: find.byType(Row), matching: find.byType(Text)));
  return texts.map((t) => t.data ?? '').join('|');
}

void main() {
  test('las 10 vivencias de la web, con foto propia', () {
    expect(vivencias.map((v) => v.id).toList(), [
      'aventura', 'naturaleza', 'cultura', 'descanso', 'historia',
      'gastronomia', 'comunidades', 'romance', 'familia', 'algo-diferente',
    ]);
    for (final v in vivencias) {
      expect(File(v.image).existsSync(), isTrue, reason: v.image);
      expect(v.route.startsWith('/'), isTrue);
    }
  });

  test('todas las claves existen en los 8 idiomas', () {
    final keys = <String>{
      'pages.index.vivirHeader.p1', 'pages.index.vivirHeader.p2',
      'pages.index.vivirTitle.h21', 'pages.index.vivirTitle.span1',
      'vivir.carousel.label', 'vivir.carousel.prev', 'vivir.carousel.next',
      'vivir.carousel.goTo', 'vivir.carousel.position', 'vivir.carousel.explore',
      for (final v in vivencias) ...[v.labelKey, v.descKey, if (v.placeKey != null) v.placeKey!],
    };
    for (final lang in ['es', 'en', 'fr', 'it', 'pt', 'de', 'ko', 'zh']) {
      final catalog = jsonDecode(File('assets/i18n/$lang.json').readAsStringSync()) as Map<String, dynamic>;
      for (final key in keys) {
        expect((catalog[key] as String?)?.trim().isNotEmpty, isTrue, reason: '$lang · $key');
      }
    }
  });

  test('distancia circular: siempre el camino más corto', () {
    expect(circularOffset(0, 0, 10), 0);
    expect(circularOffset(1, 0, 10), 1);
    expect(circularOffset(9, 0, 10), -1);
    expect(circularOffset(0, 9, 10), 1);
    expect(circularOffset(3, 8.5, 10), 4.5);
  });

  for (final size in const [Size(360, 780), Size(768, 1024), Size(1280, 800)]) {
    testWidgets('sin desborde y navegable a ${size.width.toInt()} px', (tester) async {
      await _pump(tester, size);
      expect(tester.takeException(), isNull);
      expect(find.text('¿Qué querés vivir?'), findsOneWidget);
      expect(_dockTitle(tester), contains('Aventura'));

      // Flecha siguiente
      await tester.ensureVisible(find.bySemanticsLabel('Siguiente vivencia'));
      await tester.pumpAndSettle();
      await tester.tap(find.bySemanticsLabel('Siguiente vivencia'));
      await tester.pumpAndSettle();
      expect(_dockTitle(tester), contains('Naturaleza'));

      // Punto de «Historia»
      await tester.ensureVisible(find.bySemanticsLabel('Ir a Historia'));
      await tester.pumpAndSettle();
      await tester.tap(find.bySemanticsLabel('Ir a Historia'));
      await tester.pumpAndSettle();
      expect(_dockTitle(tester), contains('Historia'));
      expect(tester.takeException(), isNull);
    });
  }

  testWidgets('tarjeta lateral al centro; la central elige la vivencia', (tester) async {
    SharedPreferences.setMockInitialValues({});
    tester.view.physicalSize = const Size(1280, 800);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    Vivencia? chosen;
    await tester.pumpWidget(ProviderScope(
      child: MaterialApp(home: Scaffold(body: SingleChildScrollView(child: VivirCoverflow(onSelected: (v) => chosen = v)))),
    ));
    await tester.pumpAndSettle();

    await tester.tap(find.bySemanticsLabel('Naturaleza, Cañón de Somoto · Madriz'), warnIfMissed: false);
    await tester.pumpAndSettle();
    expect(chosen, isNull);
    expect(_dockTitle(tester), contains('Naturaleza'));

    await tester.tap(find.bySemanticsLabel('Naturaleza, Cañón de Somoto · Madriz'), warnIfMissed: false);
    await tester.pumpAndSettle();
    expect(chosen?.id, 'naturaleza');
    final prefs = await SharedPreferences.getInstance();
    expect(prefs.getString('baqueano_vivencia_selected'), 'naturaleza');

    await tester.tap(find.text('Explorar'));
    await tester.pumpAndSettle();
    expect(chosen?.id, 'naturaleza');
  });
}
