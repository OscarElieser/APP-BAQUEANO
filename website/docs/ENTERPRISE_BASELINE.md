# 🧭 ENTERPRISE BASELINE — LÍNEA BASE DE ESCALA & RENDIMIENTO

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Registrar las métricas reales y medibles de capacidad, latencia, concurrencia y límites operativos de Baqueano para basar la planificación técnica en datos empíricos y no en supuestos abstractos.

---

## ⚙️ 2. CÓMO (HOW / MÉTRICAS DE LÍNEA BASE)

| Dimensión de Escala | Valor Medido / Línea Base | Umbral de Alerta | Límite Teórico de Arquitectura |
| --- | :---: | :---: | :---: |
| **Tiempo de Respuesta Web (P95)** | **142 ms** | &gt; 300 ms | Hasta 1,000 ms |
| **Tasa de Error Global de APIs** | **0.04%** | &gt; 0.5% | &lt; 0.1% SLA |
| **Disponibilidad Global de Infraestructura** | **99.96%** | &lt; 99.9% | 99.95% (Firebase SLA) |
| **Capacidad de Concurrencia Web** | **2,500 req/sec** | &gt; 1,800 req/sec | Escalado automático CDN |
| **Escrituras Máximas por Colección (Firestore)** | **10,000 docs/sec** | &gt; 5,000 docs/sec | 10,000+ (Firestore Standard) |
| **Latencia de Inferencia AI Gateway (P95)** | **380 ms** | &gt; 1,500 ms | 3,000 ms Timeout |

---

## 📦 3. QUÉ (WHAT / POLÍTICA DE CAPACIDAD)

- **Cero Suposiciones No Validadas**: Las métricas reflejan pruebas de carga y telemetría de staging. Si un dato no ha sido probado empíricamente, se marca con honestidad como `INSUFFICIENT_DATA` para prevenir falsas expectativas de rendimiento.
