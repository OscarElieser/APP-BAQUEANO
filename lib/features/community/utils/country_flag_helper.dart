// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — ASISTENTE DE RECONOCIMIENTO DE PAÍS Y BANDERA
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Permitir que cualquier explorador internacional escriba manualmente su país
//   de origen en español, inglés o abreviatura, y que el sistema reconozca
//   automáticamente la bandera emoji oficial en tiempo real.
// - Eliminar selectores rígidos o interminables de banderas que degradan la
//   experiencia de usuario en pantallas táctiles de Android y tablets.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Algoritmo de normalización de cadenas Unicode (remoción de acentos/tildes y diacríticos).
// - Matriz hash indexada con más de 100 alias de países en múltiples idiomas y abreviaturas comunes.
// - Búsqueda en 3 etapas: coincidencia exacta normalizada, coincidencia de prefijo y subcadena.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & SERVICIOS EXPUESTOS):
// - `CountryFlagHelper`: Clase utilitaria con `detectFlag(String input)` y `popularCountries`.
// - `CountryDetectionResult`: Modelo inmutable con `flag`, `canonicalName` y `isRecognized`.
// ============================================================================

/// Resultado inmutable del análisis y reconocimiento de país.
class CountryDetectionResult {
  final String flag;
  final String canonicalName;
  final bool isRecognized;

  const CountryDetectionResult({
    required this.flag,
    required this.canonicalName,
    required this.isRecognized,
  });
}

class CountryFlagHelper {
  // Lista de países populares para sugerencias rápidas de un toque
  static const List<Map<String, String>> popularCountries = [
    {'name': 'Nicaragua', 'flag': '🇳🇮'},
    {'name': 'Costa Rica', 'flag': '🇨🇷'},
    {'name': 'España', 'flag': '🇪🇸'},
    {'name': 'Estados Unidos', 'flag': '🇺🇸'},
    {'name': 'México', 'flag': '🇲🇽'},
    {'name': 'Colombia', 'flag': '🇨🇴'},
    {'name': 'Honduras', 'flag': '🇭🇳'},
    {'name': 'El Salvador', 'flag': '🇸🇻'},
    {'name': 'Guatemala', 'flag': '🇬🇹'},
    {'name': 'Panamá', 'flag': '🇵🇦'},
    {'name': 'Canadá', 'flag': '🇨🇦'},
    {'name': 'Alemania', 'flag': '🇩🇪'},
  ];

  // Diccionario integral de países normalizados (sin acentos, minúsculas)
  static final Map<String, ({String flag, String name})> _countryMap = {
    // Centroamérica & Caribe
    'nicaragua': (flag: '🇳🇮', name: 'Nicaragua'),
    'nica': (flag: '🇳🇮', name: 'Nicaragua'),
    'ni': (flag: '🇳🇮', name: 'Nicaragua'),
    'costa rica': (flag: '🇨🇷', name: 'Costa Rica'),
    'costarica': (flag: '🇨🇷', name: 'Costa Rica'),
    'cr': (flag: '🇨🇷', name: 'Costa Rica'),
    'honduras': (flag: '🇭🇳', name: 'Honduras'),
    'hn': (flag: '🇭🇳', name: 'Honduras'),
    'el salvador': (flag: '🇸🇻', name: 'El Salvador'),
    'salvador': (flag: '🇸🇻', name: 'El Salvador'),
    'sv': (flag: '🇸🇻', name: 'El Salvador'),
    'guatemala': (flag: '🇬🇹', name: 'Guatemala'),
    'gt': (flag: '🇬🇹', name: 'Guatemala'),
    'panama': (flag: '🇵🇦', name: 'Panamá'),
    'pa': (flag: '🇵🇦', name: 'Panamá'),
    'belice': (flag: '🇧🇿', name: 'Belice'),
    'belize': (flag: '🇧🇿', name: 'Belice'),
    'republica dominicana': (flag: '🇩🇴', name: 'República Dominicana'),
    'dominicana': (flag: '🇩🇴', name: 'República Dominicana'),
    'do': (flag: '🇩🇴', name: 'República Dominicana'),
    'cuba': (flag: '🇨🇺', name: 'Cuba'),
    'puerto rico': (flag: '🇵🇷', name: 'Puerto Rico'),

    // Norteamérica
    'mexico': (flag: '🇲🇽', name: 'México'),
    'mx': (flag: '🇲🇽', name: 'México'),
    'estados unidos': (flag: '🇺🇸', name: 'Estados Unidos'),
    'eeuu': (flag: '🇺🇸', name: 'Estados Unidos'),
    'ee uu': (flag: '🇺🇸', name: 'Estados Unidos'),
    'usa': (flag: '🇺🇸', name: 'Estados Unidos'),
    'us': (flag: '🇺🇸', name: 'Estados Unidos'),
    'united states': (flag: '🇺🇸', name: 'Estados Unidos'),
    'america': (flag: '🇺🇸', name: 'Estados Unidos'),
    'canada': (flag: '🇨🇦', name: 'Canadá'),
    'ca': (flag: '🇨🇦', name: 'Canadá'),

    // Sudamérica
    'colombia': (flag: '🇨🇴', name: 'Colombia'),
    'co': (flag: '🇨🇴', name: 'Colombia'),
    'venezuela': (flag: '🇻🇪', name: 'Venezuela'),
    've': (flag: '🇻🇪', name: 'Venezuela'),
    'peru': (flag: '🇵🇪', name: 'Perú'),
    'pe': (flag: '🇵🇪', name: 'Perú'),
    'ecuador': (flag: '🇪🇨', name: 'Ecuador'),
    'ec': (flag: '🇪🇨', name: 'Ecuador'),
    'bolivia': (flag: '🇧🇴', name: 'Bolivia'),
    'chile': (flag: '🇨🇱', name: 'Chile'),
    'cl': (flag: '🇨🇱', name: 'Chile'),
    'argentina': (flag: '🇦🇷', name: 'Argentina'),
    'ar': (flag: '🇦🇷', name: 'Argentina'),
    'uruguay': (flag: '🇺🇾', name: 'Uruguay'),
    'paraguay': (flag: '🇵🇾', name: 'Paraguay'),
    'brasil': (flag: '🇧🇷', name: 'Brasil'),
    'brazil': (flag: '🇧🇷', name: 'Brasil'),
    'br': (flag: '🇧🇷', name: 'Brasil'),

    // Europa
    'espana': (flag: '🇪🇸', name: 'España'),
    'spain': (flag: '🇪🇸', name: 'España'),
    'es': (flag: '🇪🇸', name: 'España'),
    'alemania': (flag: '🇩🇪', name: 'Alemania'),
    'germany': (flag: '🇩🇪', name: 'Alemania'),
    'deutschland': (flag: '🇩🇪', name: 'Alemania'),
    'de': (flag: '🇩🇪', name: 'Alemania'),
    'francia': (flag: '🇫🇷', name: 'Francia'),
    'france': (flag: '🇫🇷', name: 'Francia'),
    'fr': (flag: '🇫🇷', name: 'Francia'),
    'italia': (flag: '🇮🇹', name: 'Italia'),
    'italy': (flag: '🇮🇹', name: 'Italia'),
    'it': (flag: '🇮🇹', name: 'Italia'),
    'reino unido': (flag: '🇬🇧', name: 'Reino Unido'),
    'inglaterra': (flag: '🇬🇧', name: 'Reino Unido'),
    'england': (flag: '🇬🇧', name: 'Reino Unido'),
    'uk': (flag: '🇬🇧', name: 'Reino Unido'),
    'gran bretana': (flag: '🇬🇧', name: 'Reino Unido'),
    'great britain': (flag: '🇬🇧', name: 'Reino Unido'),
    'suiza': (flag: '🇨🇭', name: 'Suiza'),
    'switzerland': (flag: '🇨🇭', name: 'Suiza'),
    'ch': (flag: '🇨🇭', name: 'Suiza'),
    'paises bajos': (flag: '🇳🇱', name: 'Países Bajos'),
    'holanda': (flag: '🇳🇱', name: 'Países Bajos'),
    'netherlands': (flag: '🇳🇱', name: 'Países Bajos'),
    'nl': (flag: '🇳🇱', name: 'Países Bajos'),
    'belgica': (flag: '🇧🇪', name: 'Bélgica'),
    'belgium': (flag: '🇧🇪', name: 'Bélgica'),
    'portugal': (flag: '🇵🇹', name: 'Portugal'),
    'suecia': (flag: '🇸🇪', name: 'Suecia'),
    'sweden': (flag: '🇸🇪', name: 'Suecia'),
    'noruega': (flag: '🇳🇴', name: 'Noruega'),
    'norway': (flag: '🇳🇴', name: 'Noruega'),
    'dinamarca': (flag: '🇩🇰', name: 'Dinamarca'),
    'denmark': (flag: '🇩🇰', name: 'Dinamarca'),
    'finlandia': (flag: '🇫🇮', name: 'Finlandia'),
    'austria': (flag: '🇦🇹', name: 'Austria'),
    'irlanda': (flag: '🇮🇪', name: 'Irlanda'),
    'ireland': (flag: '🇮🇪', name: 'Irlanda'),
    'polonia': (flag: '🇵🇱', name: 'Polonia'),
    'poland': (flag: '🇵🇱', name: 'Polonia'),
    'grecia': (flag: '🇬🇷', name: 'Grecia'),
    'greece': (flag: '🇬🇷', name: 'Grecia'),
    'rusia': (flag: '🇷🇺', name: 'Rusia'),
    'russia': (flag: '🇷🇺', name: 'Rusia'),

    // Asia & Oceanía
    'japon': (flag: '🇯🇵', name: 'Japón'),
    'japan': (flag: '🇯🇵', name: 'Japón'),
    'jp': (flag: '🇯🇵', name: 'Japón'),
    'china': (flag: '🇨🇳', name: 'China'),
    'corea': (flag: '🇰🇷', name: 'Corea del Sur'),
    'corea del sur': (flag: '🇰🇷', name: 'Corea del Sur'),
    'korea': (flag: '🇰🇷', name: 'Corea del Sur'),
    'australia': (flag: '🇦🇺', name: 'Australia'),
    'au': (flag: '🇦🇺', name: 'Australia'),
    'nueva zelanda': (flag: '🇳🇿', name: 'Nueva Zelanda'),
    'new zealand': (flag: '🇳🇿', name: 'Nueva Zelanda'),
    'israel': (flag: '🇮🇱', name: 'Israel'),
    'india': (flag: '🇮🇳', name: 'India'),
  };

  /// Normaliza el texto eliminando acentos, tildes y caracteres especiales.
  static String normalize(String text) {
    var output = text.trim().toLowerCase();
    const withAccents = 'áàäâãéèëêíìïîóòöôõúùüûñ';
    const withoutAccents = 'aaaaaeeeeiiiiooooouuuun';

    for (int i = 0; i < withAccents.length; i++) {
      output = output.replaceAll(withAccents[i], withoutAccents[i]);
    }
    return output;
  }

  /// Intención: Detectar automáticamente la bandera y nombre de país a partir de texto libre.
  /// Mecanismo: Búsqueda exacta, luego coincidencia por prefijo (>=3 caracteres), luego coincidencia parcial.
  /// Importancia: Proporciona retroalimentación instantánea al explorador mientras escribe.
  static CountryDetectionResult detectFlag(String input) {
    final clean = normalize(input);
    if (clean.isEmpty) {
      return const CountryDetectionResult(
        flag: '🇳🇮',
        canonicalName: 'Nicaragua',
        isRecognized: false,
      );
    }

    // 1. Coincidencia exacta
    if (_countryMap.containsKey(clean)) {
      final entry = _countryMap[clean]!;
      return CountryDetectionResult(
        flag: entry.flag,
        canonicalName: entry.name,
        isRecognized: true,
      );
    }

    // 2. Coincidencia por prefijo (para cuando está escribiendo e.g. "espa...", "costa...")
    if (clean.length >= 3) {
      for (final entry in _countryMap.entries) {
        if (entry.key.startsWith(clean)) {
          return CountryDetectionResult(
            flag: entry.value.flag,
            canonicalName: entry.value.name,
            isRecognized: true,
          );
        }
      }
    }

    // 3. Coincidencia por subcadena
    if (clean.length >= 4) {
      for (final entry in _countryMap.entries) {
        if (entry.key.contains(clean)) {
          return CountryDetectionResult(
            flag: entry.value.flag,
            canonicalName: entry.value.name,
            isRecognized: true,
          );
        }
      }
    }

    // Fallback: Si no se reconoce, muestra bandera de globo terráqueo
    return CountryDetectionResult(
      flag: '🌐',
      canonicalName: input.trim(),
      isRecognized: false,
    );
  }
}
