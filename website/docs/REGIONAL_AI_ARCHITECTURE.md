# ARQUITECTURA DE IA REGIONAL & RAG CONTEXTUAL POR PAÍS

## 1. Filtrado Estricto de RAG por País

Para erradicar alucinaciones geográficas (por ejemplo, recomendar un hotel de Costa Rica ante una consulta de un viaje por Matagalpa, Nicaragua):

```
Usuario consulta: "¿Qué cascada visitar cerca de Matagalpa?"
        ↓
Detector de Contexto: [Country: "NI", Territory: "matagalpa"]
        ↓
Vector Search RAG: Query Filter { countryId: "NI", territory: "matagalpa" }
        ↓
Baqueano AI: Genera respuesta fundamentada exclusivamente en la base nicaragüense.
```

---

## 2. Herramientas y Protocolos de Seguridad Cultural de la IA

- **Herramientas Country-Aware**:
  - `searchPlaces(countryId: "NI" | "CR" | "GT")`
  - `getEmergencyInfo(countryId: string)`
- **Salvaguardas de Moneda**: Las estimaciones de presupuesto calculadas por Baqueano AI utilizan exclusivamente la moneda local (`NIO` para Nicaragua, `CRC` para Costa Rica, `GTQ` para Guatemala) o `USD`, sin aplicar conversiones aleatorias ni tasas desactualizadas.
