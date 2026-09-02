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

class MainActivity : FlutterActivity()
