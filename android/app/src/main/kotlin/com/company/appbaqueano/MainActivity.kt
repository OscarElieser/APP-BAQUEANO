package com.company.appbaqueano

// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — ANDROID MAIN ACTIVITY
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Constituye el punto de entrada nativo oficial para el sistema operativo Android.
// - Vincula el ciclo de vida nativo del dispositivo con el motor Flutter de Baqueano,
//   asegurando que los exploradores campesinos y turistas puedan iniciar la app de
//   forma instantánea y sin bloqueos de carga.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Extiende de `FlutterActivity`, cumpliendo con la arquitectura de Flutter Embedding v2.
// - Se alinea estrictamente con el namespace y applicationId `com.company.appbaqueano`
//   configurado en Gradle y Firebase Services (`google-services.json`), garantizando
//   la resolución de clases en tiempo de ejecución por parte de Android OS.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Expone la clase `MainActivity` lista para recibir intents del lanzador del sistema,
//   gestionar renderizado acelerado por hardware y manejar eventos de ciclo de vida.
// ============================================================================

import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val LIFECYCLE_CHANNEL = "com.company.appbaqueano/lifecycle"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, LIFECYCLE_CHANNEL)
            .setMethodCallHandler { call, result ->
                if (call.method == "moveToBackground") {
                    // Mover la tarea a segundo plano sin finalizar la actividad
                    // Conserva la pila de navegación, memoria y estado exactamente donde finalizó
                    val sentToBack = moveTaskToBack(true)
                    result.success(sentToBack)
                } else {
                    result.notImplemented()
                }
            }
    }
}
