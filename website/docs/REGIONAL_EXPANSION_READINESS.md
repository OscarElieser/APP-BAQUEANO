# 🧭 REGIONAL EXPANSION READINESS — PREPARACIÓN PARA EXPANSIÓN REGIONAL FUTURA

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Preparar la arquitectura de Baqueano para soportar configuraciones multi-país en Centroamérica (Centro de Datos, jerarquías territoriales, monedas y husos horarios) sin apresurar una expansión internacional antes de consolidar el liderazgo en Nicaragua.

---

## ⚙️ 2. CÓMO (HOW / ESTRUCTURAS DE DATOS PREPARADAS & DESACOPLAMIENTO)

1. **Configuración de País por Defecto**:
   - `countryId: "NI"` se establece como valor por defecto en los contratos de datos sin código duro (`hardcoding`).
2. **Jerarquía Territorial Parametrizada**:
   - Soporta modelos de división política: `Nivel 1` (Departamento / Provincia / Estado) y `Nivel 2` (Municipio / Cantón / Distrito).
3. **Múltiples Monedas & Husos Horarios**:
   - Modelo preparado para tipificación de moneda (`NIO`, `USD`, `CRC`, `HNL`, `GTQ`) y zona horaria (`America/Managua`).

```text
[Baqueano Core Engine]
           │
           ▼
[Country Configuration: NI (Active) | CR, HN, GT (Ready)]
           │
 ┌─────────┼─────────┬─────────┐
 ▼         ▼         ▼         ▼
[Moneda] [Husos]  [División] [Leyes]
```

---

## 📦 3. QUÉ (WHAT / CONDICIÓN DE EXPANSIÓN)

- **Foco Absoluto**: Nicaragua permanece como el único mercado activo y prioritario. La arquitectura está técnicamente preparada para que el día en que se decida abrir un país hermano, se realice mediante parametrización y convenios locales sin reescribir el núcleo del software.
