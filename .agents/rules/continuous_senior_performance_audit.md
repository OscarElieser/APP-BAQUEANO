# ⚡ PROTOCOLO INSTITUCIONAL: AUDITORÍA CONTINUA DE ARQUITECTURA, RENDIMIENTO Y ESTABILIDAD

Este protocolo técnico es de cumplimiento obligatorio y continuo para todo el desarrollo, refactorización y mantenimiento del ecosistema **BAQUEANO NICARAGUA**.

---

## 🎯 1. OBJETIVO PRIMORDIAL
Garantizar una experiencia de usuario blindada a **60-120 FPS sostenidos**, erradicando por completo dos fallas críticas en entornos móviles Android:
1. **Bloqueos de la interfaz (ANRs / congelamientos de pantalla)**.
2. **Cierres inesperados (Crashes / OOM / Uncaught Exceptions)**.

---

## ⚙️ 2. CHECKLIST DE AUDITORÍA CONTINUA

### A. Hilo Principal (Main UI Thread) & Concurrencia
- [ ] **Cero Bloqueos**: Ningún parseo de JSON masivo, cálculo matemático complejo, procesamiento de imágenes o I/O síncrono debe correr en el hilo de renderizado.
- [ ] **Concurrencia Asíncrona**: Usar `Future`, `Stream` o `compute()` / isolates en tareas de alto coste computacional.
- [ ] **Timers y Animaciones**: No implementar loops infinitos sin cancelar; usar `TickerProviderStateMixin` con `AnimationController.dispose()` riguroso.

### B. Gestión de Memoria & Renderizado Multimedia (Anti-OOM)
- [ ] **Límites de Decodificación**: Nunca renderizar `Image.asset` o `Image.network` a resolución original de cámara. Especificar siempre `cacheWidth` y `cacheHeight` proporcionales al `devicePixelRatio` del viewport.
- [ ] **Aislamiento de Pintado**: Encapsular listas horizontales, carruseles, widgets interactivos y tarjetas en `RepaintBoundary` para evitar que la invalidación de una micro-animación redibuje el árbol vertical.
- [ ] **Identidad de Elementos en Listas**: Asignar siempre `ValueKey` estable con el ID único del modelo en `ListView.builder` o `GridView.builder`.
- [ ] **Sincronización de Estado en Reciclaje**: En `StatefulWidget` reciclables, sobreescribir `didUpdateWidget` para reconciliar estados internos mutables.

### C. Blindaje Defensivo contra Excepciones (Crash Prevention)
- [ ] **Encapsulación `try/catch`**: Toda interacción táctil de usuario (botones, reservas, cambios de favorito, llamadas telefónicas, intents de WhatsApp y navegación de rutas) debe estar protegida.
- [ ] **Comprobación de Contexto Asíncrono**: Verificar rigurosamente `if (mounted)` o `if (context.mounted)` antes de invocar `Navigator`, `GoRouter`, `ScaffoldMessenger` o `setState()`.
- [ ] **Aritmética Segura**: Validar números antes de renderizarlos con `.isFinite`, `.isNaN` y `.clamp()`.
- [ ] **Protección de Nulos y Cadenas Vacías**: Brindar textos y widgets de fallback (*fallbacks volcánicos*) ante respuestas de red lentas o fallidas.

---

## 📦 3. VERIFICACIÓN DE CONTROL DE CALIDAD
Antes de cada entrega o confirmación de código:
1. `flutter analyze` debe arrojar **`No issues found!`** (0 errores, 0 warnings, 0 lints).
2. `flutter test` debe aprobar el **100% de la suite de pruebas unitarias y de integración**.
