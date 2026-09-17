# 🧭 BAQUEANO — EXPERIENCE GOVERNANCE & LIFECYCLE

## 🎯 1. POR QUÉ (WHY)
Establecer procesos formales de gobernanza para la evolución de contratos de experiencia, prevención de bifurcaciones funcionales entre canales (channel fork) y versionado de APIs.

## ⚙️ 2. CÓMO (HOW)
- **Gobernanza de Contratos**: Todo cambio en DTOs o interfaces compartidas (`TripHubRecord`, `PassportEntryRecord`, etc.) debe pasar por revisión cruzada y mantener compatibilidad hacia atrás con clientes existentes.
- **Proceso de Adición de Canales**: Ninguna funcionalidad de negocio fundamental (ej. reservas o cálculo de rutas) debe desarrollarse de forma aislada en un solo canal.
- **Estabilidad de URLs**: Las rutas canónicas de destinos y rutas no deben cambiar para proteger la inversión física en códigos QR y señalética territorial.

## 📦 3. QUÉ (WHAT)
- Políticas de deprecación con ventana mínima de 6 meses para APIs públicas de experiencia.
