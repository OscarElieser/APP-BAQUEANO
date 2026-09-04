package ni.baqueano.app

// ============================================================================
// BAQUEANO ECOSYSTEM - ANDROID MAIN ACTIVITY
// ============================================================================
//
// POR QUE (WHY / PROPOSITO):
// - Constituye el punto de entrada nativo oficial para Android bajo la identidad
//   publica `ni.baqueano.app`, requerida por Google Sign-In y Firebase Auth.
// - Evita que el APK vuelva a compilar con el package legado y rompa el par OAuth
//   package + SHA-1 usado por Firebase.
//
// COMO (HOW / ARQUITECTURA & IMPLEMENTACION):
// - Extiende `FlutterActivity` usando Flutter Embedding v2.
// - Expone un `MethodChannel` con el mismo namespace del applicationId oficial
//   para mover la actividad a segundo plano sin destruir su estado.
//
// QUE (WHAT / FUNCIONALIDAD & ENTREGABLES):
// - `MainActivity` para launch intents de Android.
// - Canal `ni.baqueano.app/lifecycle` para `moveToBackground`.
// ============================================================================

import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val lifecycleChannel = "ni.baqueano.app/lifecycle"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, lifecycleChannel)
            .setMethodCallHandler { call, result ->
                if (call.method == "moveToBackground") {
                    result.success(moveTaskToBack(true))
                } else {
                    result.notImplemented()
                }
            }
    }
}
