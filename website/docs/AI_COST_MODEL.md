# 🧭 MODELO DE COSTOS Y CONSUMO DE TOKENS — BAQUEANO AI

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Asegurar la viabilidad económica y escalabilidad del ecosistema Baqueano al proyectar y optimizar el consumo de tokens y llamadas a modelos de lenguaje, evitando gastos imprevistos mediante rate limiting y agregación de respuestas comunes.

---

## ⚙️ 2. CÓMO (HOW / ESTRATEGIA DE COSTOS)

- **Presupuesto Máximo por Petición**: Acotamiento de tokens de salida (< 1,200 tokens por itinerario) y de entrada (< 1,500 tokens de contexto recuperado).
- **Enrutamiento Inteligente por Complejidad**: Consultas factuales directas resueltas mediante motor determinista local en el servidor con costo de inferencia $0.00.
- **Cuotas y Rate Limiting**: Límite de 10 solicitudes de itinerario por usuario/sesión por hora para prevenir abusos automatizados.

---

## 📦 3. QUÉ (WHAT / TABLA DE COSTOS ESTIMADOS POR INFERENCIA)

| Proveedor / Motor | Costo por 1,000 Tokens (In) | Costo por 1,000 Tokens (Out) | Costo Medio por Itinerario (3 Días) | Estado |
| --- | --- | --- | --- | --- |
| **Baqueano Local Engine (Server)** | $0.00 | $0.00 | $0.00 USD | ✅ REAL (Activo) |
| **Gemini 1.5 Flash (Gateway)** | ~$0.000075 USD | ~$0.000300 USD | ~$0.00045 USD | 🟡 PARCIAL (Conectado a Gateway) |
| **OpenAI GPT-4o-mini (Fallback)** | ~$0.000150 USD | ~$0.000600 USD | ~$0.00090 USD | ⚪ PENDIENTE |
