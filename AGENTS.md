# 🧭 BAQUEANO AGENTS & CODEBASE STANDARD

## 🌟 Reglas Fundamentales del Proyecto:

1. **Documentación Obligatoria bajo el Círculo Dorado (Golden Circle)**:
   - Todo archivo y componente nuevo o modificado debe incluir un encabezado exhaustivo con:
     - 🎯 **POR QUÉ (Why / Propósito)**
     - ⚙️ **CÓMO (How / Arquitectura & Implementación)**
     - 📦 **QUÉ (What / Funcionalidad & Entregables)**
   - Explicar las decisiones de diseño y lógica paso a paso para que cualquier desarrollador entienda su importancia.

2. **Modo Premium Visual y Técnico**:
   - Paleta de colores oficial: `#082B35`, `#C86432`, `#D4AF37`, `#0F172A`.
   - Efectos Glassmorphism, animaciones continuas a 60fps, y sombras profundas.
   - Cero uso de `.withOpacity()`, siempre utilizar `.withValues(alpha: X)`.
   - Mantener siempre `flutter analyze` y `flutter test` en 100% limpio.

3. **100% Responsivo y Multiplataforma**:
   - Asegurar que la interfaz se adapte con total fluidez a Android, iOS, Web y Desktop.
