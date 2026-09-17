# 🧭 MOTOR DE RUTAS INTELIGENTES Y SECUENCIACIÓN — BAQUEANO AI

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Organizar los destinos y paradas turísticas de forma lógica, fluida y geográficamente coherente dentro del territorio nicaragüense, minimizando traslados innecesarios y optimizando el tiempo de contacto del explorador con la naturaleza y las comunidades campesinas.

---

## ⚙️ 2. CÓMO (HOW / ALGORITMO Y SECUENCIACIÓN)

- **Agrupamiento Departamental**: El motor agrupa paradas por cercanía geográfica (departamentos limítrofes, ej. Estelí ↔ Madriz, León ↔ Chinandega, Managua ↔ Masaya ↔ Granada).
- **Secuenciación Diurna / Nocturna**: Asignación de actividades de senderismo y aventura en horarios matutinos (morning), y visitas culturales o descanso gastronómico en horarios vespertinos (afternoon).
- **Cálculo de Distancias Geodésicas**: Estimación de distancias en kilómetros entre paradas consecutivas mediante fórmula Haversine basada en coordenadas reales de Nicaragua.

---

## 📦 3. QUÉ (WHAT / ESPECIFICACIÓN DEL MOTOR DE RUTAS)

1. **Entrada**: Lista de destinos seleccionados por el explorador o recomendados por el motor RAG.
2. **Proceso de Optimización**:
   - Ordenamiento por proximidad territorial.
   - Distribución equilibrada de gasto físico según el `travelStyle` (relajado vs aventura).
   - Inserción de paradas gastronómicas con comedores comunitarios.
3. **Salida**: Array estructurado `ItineraryDayPlan[]` con coordenadas GPS y descripción de actividades.
