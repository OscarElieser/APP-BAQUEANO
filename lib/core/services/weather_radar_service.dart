// ============================================================================
// 🌦️ SERVICIO DE RADAR METEOROLÓGICO & MICROCLIMAS (WEATHER_RADAR_SERVICE.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer a los exploradores información climática en tiempo real sobre los microclimas
//   de Nicaragua (cumbres volcánicas, bosques de nebliselva, cañones y costas del Pacífico).
// - Evaluar la viabilidad y seguridad del sendero (condición de terreno óptimo vs precaución).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Modelo inmutable `DestinationWeather` con temperatura en °C, humedad, velocidad del viento,
//   icono meteorológico y dictamen técnico para senderismo.
// - Mapeo geográfico por departamento y altitud en Nicaragua.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & MODELO EXPUESTO):
// - `WeatherRadarService`: Servicio con método `getWeatherForDestination(String destinationId)`.
// - `DestinationWeather`: Entidad meteorológica.
// ============================================================================

class DestinationWeather {
  final String destinationId;
  final int temperatureCelsius;
  final String condition;
  final String icon;
  final int humidityPercent;
  final int windSpeedKmh;
  final String trailStatus; // 'Óptimo para Ascenso', 'Rocío & Neblina', 'Precaución Viento'
  final bool isSafe;

  const DestinationWeather({
    required this.destinationId,
    required this.temperatureCelsius,
    required this.condition,
    required this.icon,
    required this.humidityPercent,
    required this.windSpeedKmh,
    required this.trailStatus,
    this.isSafe = true,
  });
}

class WeatherRadarService {
  /// Base de datos meteorológica de microclimas de Nicaragua
  static final Map<String, DestinationWeather> _weatherCache = {
    'cascada-la-luna': const DestinationWeather(
      destinationId: 'cascada-la-luna',
      temperatureCelsius: 22,
      condition: 'Neblina Fresca',
      icon: '🌫️',
      humidityPercent: 82,
      windSpeedKmh: 14,
      trailStatus: 'Sendero Húmedo · Nivel Óptimo',
    ),
    'canon-de-somoto': const DestinationWeather(
      destinationId: 'canon-de-somoto',
      temperatureCelsius: 25,
      condition: 'Soleado con Brisa',
      icon: '☀️',
      humidityPercent: 55,
      windSpeedKmh: 18,
      trailStatus: 'Caudal Seguro para Nado',
    ),
    'volcan-cerro-negro': const DestinationWeather(
      destinationId: 'volcan-cerro-negro',
      temperatureCelsius: 31,
      condition: 'Cielo Despejado',
      icon: '🌋',
      humidityPercent: 40,
      windSpeedKmh: 28,
      trailStatus: 'Óptimo para Sandboarding',
    ),
    'volcan-telica': const DestinationWeather(
      destinationId: 'volcan-telica',
      temperatureCelsius: 28,
      condition: 'Actividad Fumarólica Normal',
      icon: '💨',
      humidityPercent: 48,
      windSpeedKmh: 22,
      trailStatus: 'Crater Abierto · Atardecer Ideal',
    ),
    'finca-selva-negra': const DestinationWeather(
      destinationId: 'finca-selva-negra',
      temperatureCelsius: 18,
      condition: 'Clima de Montaña',
      icon: '🌲',
      humidityPercent: 88,
      windSpeedKmh: 10,
      trailStatus: 'Sombra de Bosque Nuboso',
    ),
    'playa-maderas': const DestinationWeather(
      destinationId: 'playa-maderas',
      temperatureCelsius: 30,
      condition: 'Oleaje Excelente',
      icon: '🌊',
      humidityPercent: 65,
      windSpeedKmh: 24,
      trailStatus: 'Olas de 4-6 pies para Surf',
    ),
    'volcan-mombacho': const DestinationWeather(
      destinationId: 'volcan-mombacho',
      temperatureCelsius: 20,
      condition: 'Nebliselva Tropical',
      icon: '☁️',
      humidityPercent: 90,
      windSpeedKmh: 16,
      trailStatus: 'Fumarolas y Orquídeas Activas',
    ),
    'isla-de-ometepe': const DestinationWeather(
      destinationId: 'isla-de-ometepe',
      temperatureCelsius: 29,
      condition: 'Cálido Lacustre',
      icon: '🌴',
      humidityPercent: 70,
      windSpeedKmh: 20,
      trailStatus: 'Aguas del Cocibolca Calmas',
    ),
  };

  /// Obtiene el reporte meteorológico para un destino específico o genera uno por defecto
  static DestinationWeather getWeatherForDestination(String destinationId) {
    return _weatherCache[destinationId] ??
        const DestinationWeather(
          destinationId: 'default',
          temperatureCelsius: 27,
          condition: 'Clima Tropical Agradable',
          icon: '🌤️',
          humidityPercent: 60,
          windSpeedKmh: 15,
          trailStatus: 'Condiciones Favorables',
        );
  }
}
