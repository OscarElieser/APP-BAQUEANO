# 🧭 FINOPS MODEL — GESTIÓN DE COSTOS & EFICIENCIA DE INFRAESTRUCTURA CLOUD

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Optimizar los costos operativos de la infraestructura Cloud de Baqueano (Firestore, Auth, Storage, hosting, APIs y modelos de IA), asegurando que el crecimiento en usuarios y destinos sea económicamente sostenible para el proyecto.

---

## ⚙️ 2. CÓMO (HOW / CENTROS DE COSTOS & ESTRATEGIAS DE OPTIMIZACIÓN)

1. **Firestore Database**:
   - Reducción de lecturas masivas mediante caché en cliente (S-MaxAge 60s) e ISR en Next.js.
   - Eliminación de consultas no indexadas y consultas compuestas innecesarias.
2. **Baqueano AI Gateway**:
   - Uso de modelos de inferencia optimizados (Gemini Flash) con prompts concisos y delimitados.
   - Presupuesto mensual con límites máximos de invocación (cuota de seguridad de $50/mes en fase piloto).
3. **Google Maps Platform**:
   - Restricción estricta de dominios HTTP referrers para evitar uso no autorizado de la API Key.
   - Reemplazo de llamadas dinámicas costosas por mapas estáticos y coordenadas GPS donde sea suficiente.
4. **Cloud Storage & CDN**:
   - Redimensionamiento y compresión automática de fotografías a formato WebP optimizado antes de la carga.

---

## 📦 3. QUÉ (WHAT / ALERTAS PRESUPUESTARIAS & POLÍTICAS DE GASTO)

| Umbral de Presupuesto | Nivel de Alerta | Acción Automática |
| --- | :---: | --- |
| **50% de Cuota Mensual** | 🟢 Informativo | Notificación por correo al equipo técnico. |
| **80% de Cuota Mensual** | 🟡 Advertencia | Revisión de consultas Firestore más frecuentes en Cloud Console. |
| **95% de Cuota Mensual** | 🔴 Crítico | Activación de modo ahorro en AI Gateway (solo respuestas deterministas de catálogo). |
