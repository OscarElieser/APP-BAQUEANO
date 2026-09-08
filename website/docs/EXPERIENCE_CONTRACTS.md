# 🧭 BAQUEANO — EXPERIENCE CONTRACTS

## 🎯 1. POR QUÉ (WHY)
Garantizar la interoperabilidad semántica y de datos entre Web, PWA, Cloud Functions y futuros clientes Android sin incurrir en desviación de esquemas (DTO drift).

## ⚙️ 2. CÓMO (HOW)
Contratos universales tipados en `@baqueano/types`:
- `TripHubRecord`: Identificador de viaje, creador, fechas, paradas (`TripItineraryStopRecord[]`), reservas enlazadas y alertas activas.
- `TripItineraryStopRecord`: Parada numerada, fecha, lugar/destino, notas operativas, coordenadas, tiempo estimado y estado (`PENDING`, `VISITED`, `SKIPPED`).
- `PassportEntryRecord`: Registro de visita verificada, método (`QR_SCAN`, `SMART_POINT`, `NFC_TAP`), sello cultural, fecha y territorio.
- `ExperienceDeepLinkRecord`: Definición de URL canónica, parámetros permitidos, nivel de autorización (`PUBLIC` vs `AUTHENTICATED`) y tiempo de vida.

## 📦 3. QUÉ (WHAT)
- Compatibilidad retroactiva: Todos los campos compartidos respetan la nomenclatura existente en Firestore y Android para una integración sin fricciones.
