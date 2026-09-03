# 🧭 BAQUEANO AGENTS & CODEBASE STANDARD

## 🌟 Reglas Fundamentales del Proyecto:

1. **Documentación Obligatoria bajo el Círculo Dorado (Golden Circle)**:
   - Todo archivo y componente nuevo o modificado debe incluir un encabezado exhaustivo con:
     - 🎯 **POR QUÉ (Why / Propósito)**
     - ⚙️ **CÓMO (How / Arquitectura & Implementación)**
     - 📦 **QUÉ (What / Funcionalidad & Entregables)**
   - Explicar las decisiones de diseño y lógica paso a paso para que cualquier desarrollador entienda su importancia.

2. **Modo Pro de Alta Gama Visual y Técnico**:
   - Paleta de colores oficial: `#082B35`, `#C86432`, `#D4AF37`, `#0F172A`.
   - Efectos Glassmorphism, animaciones continuas a 60fps, y sombras profundas.
   - Cero uso de `.withOpacity()`, siempre utilizar `.withValues(alpha: X)`.
   - Mantener siempre `flutter analyze` y `flutter test` en 100% limpio.
   - Prohibido terminantemente el uso de la palabra p-r-e-m-i-u-m en cualquier archivo, código o comentario del proyecto.

3. **100% Responsivo y Multiplataforma en Diseño**:
   - Asegurar que la interfaz se adapte con total fluidez a formatos móviles, tablets y pantallas variadas.

4. **Enfoque de Plataforma Exclusivo en Android**:
   - Todo el desarrollo, pruebas, configuraciones nativas y optimizaciones se centrarán exclusivamente en **Android** (`android/` y `lib/`).
   - Queda estrictamente prohibido modificar o alterar los directorios y configuraciones de `ios/` y `web/`.

5. **Auditoría Continua de Arquitectura, Rendimiento y Estabilidad (Senior Performance Standard)**:
   - Prohibido ejecutar tareas pesadas o transformaciones síncronas en el Main UI Thread.
   - Prevención activa de ANRs (Application Not Responding) mediante `RepaintBoundary` en listas, galerías y componentes interactivos.
   - Prevención de fugas de memoria (Memory Leaks) y OOM Crashes: todo renderizado de imágenes debe acotar `cacheWidth`/`cacheHeight` al viewport del dispositivo.
   - Manejo de excepciones defensivo estricto (`try/catch`), verificación `if (mounted)` en contextos asíncronos y validación rigurosa de valores nulos o no finitos.
   - El ciclo de vida de componentes reciclables debe implementar `didUpdateWidget` y `ValueKey` estable para erradicar estados huérfanos o desincronizados.
