// ============================================================================
// 🌐 BAQUEANO — IDIOMAS DE LA APP (MISMAS TRADUCCIONES QUE LA WEB)
// ============================================================================
//
// 🎯 POR QUÉ (Propósito):
// - La Web habla 6 idiomas (es, en, fr, it, pt, de); la APK solo español y sus
//   chips "ES/EN" no traducían nada. Una sola fuente evita que diverjan.
//
// ⚙️ CÓMO (Arquitectura):
// - `assets/i18n/<idioma>.json` se genera desde `website/locales/*.json`
//   (`npm run export:app-locales`; CI falla si divergen o falta una clave).
// - `appLanguageProvider`: idioma elegido, persistido en SharedPreferences;
//   por defecto el del dispositivo si está soportado, si no español.
// - `appStringsProvider`: carga el idioma elegido + español como respaldo.
// - `AppStrings.t(key, fallback, params)`: nunca muestra una clave cruda; los
//   parámetros usan `{nombre}`.
// - Sin `flutter_localizations`: no se agregan dependencias; los textos de
//   Material del sistema siguen el idioma del dispositivo.
//
// 📦 QUÉ (Entregables):
// - `kSupportedLanguages`, `AppStrings`, `appLanguageProvider`,
//   `appStringsProvider`, extensión `WidgetRef.strings`.
// ============================================================================

import 'dart:convert';
import 'dart:io';

import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

const List<String> kSupportedLanguages = ['es', 'en', 'fr', 'it', 'pt', 'de'];

const Map<String, String> kLanguageNames = {
  'es': 'Español',
  'en': 'English',
  'fr': 'Français',
  'it': 'Italiano',
  'pt': 'Português',
  'de': 'Deutsch',
};

class AppStrings {
  final String language;
  final Map<String, String> _values;
  final Map<String, String> _fallback;

  const AppStrings(this.language, this._values, this._fallback);

  static const AppStrings empty = AppStrings('es', {}, {});

  /// Traduce `key`; si falta, usa español y luego `fallback`.
  String t(String key, [String? fallback, Map<String, Object?> params = const {}]) {
    var text = _values[key] ?? _fallback[key] ?? fallback ?? key;
    params.forEach((name, value) => text = text.replaceAll('{$name}', '${value ?? ''}'));
    return text;
  }

  static Map<String, String> parse(String json) {
    final decoded = jsonDecode(json);
    if (decoded is! Map) return const {};
    return {
      for (final entry in decoded.entries)
        if (entry.value is String) entry.key.toString(): entry.value as String,
    };
  }
}

class AppLanguageNotifier extends StateNotifier<String> {
  static const String prefKey = 'baqueano_language';

  AppLanguageNotifier() : super(detectDeviceLanguage()) {
    _restore();
  }

  /// `es_NI.UTF-8` → `es`; idiomas no soportados → `es`.
  static String normalize(String raw) {
    final code = raw.trim().toLowerCase().split(RegExp('[_.-]')).first;
    return kSupportedLanguages.contains(code) ? code : 'es';
  }

  static String detectDeviceLanguage() {
    try {
      return normalize(Platform.localeName);
    } catch (_) {
      return 'es';
    }
  }

  Future<void> _restore() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final saved = prefs.getString(prefKey);
      if (saved != null && mounted) state = normalize(saved);
    } catch (_) {}
  }

  Future<void> setLanguage(String language) async {
    final next = normalize(language);
    state = next;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(prefKey, next);
    } catch (_) {}
  }
}

final appLanguageProvider = StateNotifierProvider<AppLanguageNotifier, String>((ref) {
  return AppLanguageNotifier();
});

Future<Map<String, String>> _loadLanguage(String language) async {
  try {
    return AppStrings.parse(await rootBundle.loadString('assets/i18n/$language.json'));
  } catch (_) {
    return const {};
  }
}

final appStringsProvider = FutureProvider<AppStrings>((ref) async {
  final language = ref.watch(appLanguageProvider);
  final fallback = await _loadLanguage('es');
  final values = language == 'es' ? fallback : await _loadLanguage(language);
  return AppStrings(language, values, fallback);
});

extension AppStringsRef on WidgetRef {
  /// Textos del idioma actual (vacío mientras carga: se usan los `fallback`).
  AppStrings get strings => watch(appStringsProvider).valueOrNull ?? AppStrings.empty;
}
