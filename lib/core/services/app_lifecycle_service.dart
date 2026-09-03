// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — GESTOR DE CICLO DE VIDA EN SEGUNDO PLANO (APP_LIFECYCLE_SERVICE.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Garantizar que cuando el usuario cierre o minimice la aplicación en su dispositivo móvil,
//   ésta permanezca viva en la memoria del sistema operativo conservando intacto su estado
//   (pantalla activa, posición de scroll, filtros seleccionados o música en reproducción).
// - Asegurar que la aplicación solo se reinicie desde cero cuando el usuario explícitamente
//   cierre o borre la tarea de las aplicaciones en segundo plano (Recent Apps de Android).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Comunica con el canal nativo de plataforma `com.company.appbaqueano/lifecycle`.
// - Al invocar `moveToBackground()`, delega en el método nativo de Android `moveTaskToBack(true)`,
//   evitando que el sistema invoque `finish()` sobre la `MainActivity`.
// - Manejo defensivo con `try/catch` y fallback automático a `SystemNavigator.pop()` en caso
//   de cualquier anomalía de comunicación entre el motor Flutter y el host nativo.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - `AppLifecycleService.moveToBackground()`: Método asíncrono estático para enviar la app
//   a segundo plano preservando el 100% de la pila de ejecución.
// ============================================================================

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

class AppLifecycleService {
  AppLifecycleService._();

  /// Canal oficial de comunicación nativa para eventos de ciclo de vida Android
  static const MethodChannel _channel = MethodChannel('com.company.appbaqueano/lifecycle');

  /// Envía la aplicación a segundo plano conservando todo su estado en memoria.
  /// No destruye la actividad ni reinicia la pila de navegación.
  static Future<bool> moveToBackground() async {
    try {
      final result = await _channel.invokeMethod<bool>('moveToBackground');
      return result ?? true;
    } on PlatformException catch (e) {
      debugPrint('Aviso en transición a segundo plano nativo: ${e.message}');
      // Fallback estándar si el canal nativo no respondiera
      try {
        await SystemNavigator.pop();
      } catch (_) {}
      return false;
    } catch (e) {
      debugPrint('Error inesperado gestionando ciclo de vida: $e');
      return false;
    }
  }
}
