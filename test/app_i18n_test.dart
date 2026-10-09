// ============================================================================
// 🌐 BAQUEANO — PRUEBAS DE IDIOMAS DE LA APP
// ============================================================================
// 🎯 POR QUÉ: la App debe ofrecer los mismos 8 idiomas que la Web, sin claves
//   crudas en pantalla y con respaldo en español.
// ⚙️ CÓMO: lee los assets generados desde la Web y prueba `AppStrings`.
// 📦 QUÉ: 8 idiomas con las mismas claves, respaldo, parámetros y
//   normalización del idioma del dispositivo.
// ============================================================================

import 'dart:io';

import 'package:baqueano_app/core/i18n/app_i18n.dart';
import 'package:flutter_test/flutter_test.dart';

Map<String, String> _load(String lang) =>
    AppStrings.parse(File('assets/i18n/$lang.json').readAsStringSync());

void main() {
  test('los 8 idiomas tienen todas las claves propias de la App', () {
    final spanish = _load('es');
    final appKeys = spanish.keys.where((k) => k.startsWith('app.')).toList();
    expect(appKeys, isNotEmpty);
    for (final lang in kSupportedLanguages) {
      final values = _load(lang);
      for (final key in appKeys) {
        expect(values[key], isNotNull, reason: '$lang:$key');
        expect(values[key], isNotEmpty, reason: '$lang:$key');
      }
    }
  });

  test('traduce, usa respaldo en español y reemplaza parámetros', () {
    final strings = AppStrings('en', _load('en'), _load('es'));
    expect(strings.t('nav.home'), 'Home');
    expect(
      strings.t('app.map.pending', null, {'count': 5}),
      contains('5'),
    );
    expect(const AppStrings('fr', {}, {'x.y': 'Hola'}).t('x.y'), 'Hola');
    expect(AppStrings.empty.t('no.existe', 'Texto visible'), 'Texto visible');
  });

  test('ofrece coreano y chino con su nombre propio', () {
    expect(kSupportedLanguages, containsAll(<String>['ko', 'zh']));
    expect(kLanguageNames['ko'], '한국어');
    expect(kLanguageNames['zh'], '简体中文');
    expect(_load('ko')['nav.home'], '홈');
    expect(_load('zh')['nav.home'], '首页');
  });

  test('normaliza el idioma del dispositivo', () {
    expect(AppLanguageNotifier.normalize('es_NI.UTF-8'), 'es');
    expect(AppLanguageNotifier.normalize('de-DE'), 'de');
    expect(AppLanguageNotifier.normalize('ko_KR'), 'ko');
    expect(AppLanguageNotifier.normalize('zh_Hans_CN'), 'zh');
    expect(AppLanguageNotifier.normalize('ja_JP'), 'es');
  });
}
