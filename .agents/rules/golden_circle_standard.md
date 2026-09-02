---
trigger: always_on
---

# 🧭 ESTÁNDAR DE DESARROLLO Y ARQUITECTURA: CÍRCULO DORADO (GOLDEN CIRCLE) & MODO

Este estándar es de cumplimiento obligatorio e irrestricto para todos los archivos, componentes, módulos, servicios y modelos existentes y futuros del proyecto **BAQUEANO NICARAGUA**.

---

## 1. Estructura de Documentación de Código (Círculo Dorado)

Todo archivo de código (`.dart`, `.js`, etc.) debe iniciar con un encabezado de documentación exhaustiva estructurado en los 3 niveles del Círculo Dorado:

```dart
// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — [NOMBRE DEL MÓDULO O COMPONENTE]
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - ¿Cuál es la razón fundamental y de negocio de este archivo?
// - ¿Cómo beneficia la experiencia del explorador y apoya el ecoturismo local campesino sin intermediarios?
// - ¿Por qué es una pieza crítica en el ecosistema Baqueano?
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - ¿Qué patrones arquitectónicos, algoritmos y estructuras de datos se implementan?
// - ¿Cómo se maneja la reactividad, el estado global (Riverpod/StateNotifier) y la sincronización offline/cloud (Firebase)?
// - ¿Cómo se gestionan los breakpoints responsivos (Móvil vs Tablet vs Desktop)?
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - ¿Qué clases, widgets, servicios, streams, métodos o constantes expone este archivo?
// - ¿Cuáles son los contratos de entrada/salida y eventos interactivos?
// ============================================================================
```

---

## 2. Comentarios Línea por Línea / Bloque por Bloque

Cada bloque funcional, método, cálculo fiscal, animación o constructor debe contener comentarios explicativos que detallen:

- **Intención**: Por qué se toma esa decisión técnica.
- **Mecanismo**: Cómo se ejecuta el cálculo, transición o llamada asíncrona.
- **Importancia**: Qué sucedería si falla y cómo se previene cualquier error.

---

## 3. Modo  Innegociable

1. **Alineación Visual de Lujo**:
   - Paleta oficial volcánica: `#082B35` (Petróleo Volcánico), `#C86432` (Terracota), `#D4AF37` (Oro Pinolero), `#0F172A` (Noche Profunda).
   - Glassmorphism con `BackdropFilter(sigmaX: 12, sigmaY: 12)` y bordes sutiles.
   - Microinteracciones, hover states, elevaciones suaves y curvas de animación fluidas (`Curves.easeInOut`).

2. **Cero Warnings / Cero Deprecaciones**:
   - Uso estricto de `.withValues(alpha: X)` en lugar del deprecado `.withOpacity()`.
   - `flutter analyze` debe arrojar siempre **`No issues found!`**.
   - `flutter test` debe pasar el 100% de la suite.

3. **Adaptabilidad Multiplataforma Total**:
   - Soporte impecable en **Android** (con `SafeArea` para barras de gestos), **iOS**, **Web** y **Desktop**.
