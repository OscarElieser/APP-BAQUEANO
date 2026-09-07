# FASE 16 — DATA READINESS & EVALUACIÓN DE SEÑALES HISTÓRICAS

## 🎯 1. Principio Fundamental: No Model Without Data

En el ecosistema Baqueano, ningún modelo predictivo entra en producción sin antes auditar exhaustivamente la existencia, calidad, completitud y frescura del historial de datos agregados.

---

## 📊 2. Criterios de Evaluación de Disponibilidad

| Nivel de Disponibilidad | Ventana Mínima | Acción en Plataforma |
| :--- | :---: | :--- |
| **INSUFICIENT_DATA** | < 7 días | No se emite pronóstico; se muestra explícitamente "⚪ DATOS INSUFICIENTES". |
| **PARTIAL** | 7 a 27 días | Se genera pronóstico con bandas de incertidumbre amplias (±30%) y confianza `LOW` / `MODERATE`. |
| **READY** | ≥ 28 días | Modelado estadístico completo con estacionalidad mensual y semanal habilitado. |
| **SIMULATED_ONLY** | Datos Sintéticos | Exclusivo para el Simulation Lab en desarrollo y pruebas; prohibido en métricas reales. |

---

## 🔍 3. Señales Agregadas Auditadas

1. **Interacciones en Mapas Topográficos**: Frecuencia de consultas por cuadrante.
2. **Búsquedas & Filtros por Territorio**: Intención temprana de viaje.
3. **Guardados en Favoritos**: Señal de interés futuro diferido.
4. **Solicitudes de Contacto & Consultas al Asistente**: Intención cualificada de reserva.
5. **Telemetría IoT de Capacidad & Footfall**: Mediciones en puntos de acceso validados.
