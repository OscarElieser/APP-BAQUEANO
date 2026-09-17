# MODELO DE DATOS DE SIMULACIÓN WHAT-IF

## 📐 1. Estructura de un Escenario Simulado

```typescript
interface SimulationScenarioRecord {
  readonly scenarioId: string;
  readonly name: string;
  readonly description: string;
  readonly baselineSnapshotId: string;
  readonly assumptions: readonly string[];
  readonly parameters: {
    readonly demandMultiplier: number;
    readonly capacityMultiplier: number;
    readonly destinationAvailability: Record<string, boolean>;
    readonly routeClosure: readonly string[];
    readonly weatherDisruptionLevel: "NONE" | "MODERATE" | "SEVERE";
    readonly targetRedistributionPercent: number;
  };
  readonly result: {
    readonly projectedDemand: number;
    readonly projectedCapacityUtilization: number;
    readonly affectedTerritories: readonly string[];
    readonly redistributionSuggestions: readonly SimulationRedistributionResult[];
    readonly riskLevel: "LOW" | "MODERATE" | "HIGH" | "ELEVATED";
    readonly simulatedAt: string;
  };
  readonly createdAt: string;
  readonly createdBy: string;
  readonly isSimulatedData: true; // Hardcoded strictly to prevent real state corruption
}
```

---

## 🔒 2. Garantía de Aislamiento Inviolable

El motor de simulación opera únicamente sobre estructuras de datos clonadas en memoria (`in-memory cloned state`). Jamás emite mutaciones `setDoc`, `updateDoc` o `deleteDoc` sobre las colecciones reales de producción.
