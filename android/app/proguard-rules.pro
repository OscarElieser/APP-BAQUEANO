# ============================================================================
# 🧭 BAQUEANO ECOSYSTEM — REGLAS DE OPTIMIZACIÓN Y OFUSCACIÓN PROGUARD / R8
# ============================================================================
#
# 🎯 1. POR QUÉ (WHY / PROPÓSITO):
# - Proteger el código fuente de ingeniería inversa, eliminar código muerto
#   y reducir drásticamente el tamaño del APK para despliegue en producción.
# - Garantizar que los modelos nativos de Firebase, Google Play Services y
#   Google Maps no sean eliminados incorrectamente durante el proceso de shrinking.
#
# ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
# - Reglas keep para serialización de Flutter, plugins de Android y Firebase BoM.
#
# 📦 3. QUÉ (WHAT / CONFIGURACIÓN EXPUESTA):
# - Directivas de preservación de reflection para Google Maps y Firebase.
# ============================================================================

# Flutter Wrapper & Plugins
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.**  { *; }
-keep class io.flutter.plugins.**  { *; }

# Google Play Services & Maps
-keep class com.google.android.gms.maps.** { *; }
-keep interface com.google.android.gms.maps.** { *; }
-keep class com.google.android.gms.common.** { *; }
-dontwarn com.google.android.gms.**

# Firebase & Google Services
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod
-keepclassmembers class * {
    @com.google.firebase.database.PropertyName <fields>;
    @com.google.firebase.database.PropertyName <methods>;
}
-dontwarn com.google.firebase.**
