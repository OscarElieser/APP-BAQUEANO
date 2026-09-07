# MODELO DE SENSORES Y LECTURAS AMBIENTALES

## 1. Definición de Sensor (`SensorRecord`)

Un sensor es una sonda individual conectada a un dispositivo IoT que mide una magnitud física específica.

```typescript
export interface SensorRecord {
  id: string;                    // Identificador único (ej: "sens-env-001-temp")
  deviceId: string;              // Dispositivo IoT al que pertenece
  type: SensorType;              // Magnitud que mide
  unit: string;                  // Unidad física (ej: "°C", "%", "hPa", "mm/h", "m")
  minExpectedValue: number;      // Límite inferior de plausibilidad física
  maxExpectedValue: number;      // Límite superior de plausibilidad física
  calibrationFactor?: number;    // Factor de corrección lineal
  lastReadingValue?: number;
  lastReadingAt?: string;
  status: "ACTIVE" | "FAULTY" | "CALIBRATING" | "DECOMMISSIONED";
}
```

---

## 2. Tipología de Sensores (`SensorType`)

| SensorType | Descripción | Unidad Típica | Rango de Validación Físico |
| :--- | :--- | :---: | :---: |
| **`TEMPERATURE`** | Temperatura ambiental | °C | -10.0 a 60.0 |
| **`HUMIDITY`** | Humedad relativa | % | 0.0 a 100.0 |
| **`AIR_PRESSURE`** | Presión atmosférica barométrica | hPa | 700.0 a 1100.0 |
| **`UV_INDEX`** | Índice de radiación ultravioleta | UVI | 0.0 a 16.0 |
| **`RAINFALL`** | Precipitación acumulada | mm/h | 0.0 a 300.0 |
| **`RIVER_LEVEL`** | Nivel o cota de cuerpo de agua | m | 0.0 a 20.0 |
| **`FOOTFALL_COUNT`** | Conteo acumulado de pasos | personas | 0 a 100,000 |
| **`NOISE_LEVEL`** | Nivel de ruido ambiental | dBA | 20.0 a 130.0 |
| **`AIR_QUALITY_PM25`**| Material particulado fino | µg/m³ | 0.0 a 500.0 |

---

## 3. Modelo de Lectura (`SensorReading`)

```typescript
export interface SensorReading {
  id: string;
  sensorId: string;
  deviceId: string;
  smartPointId: string;
  timestamp: string;
  value: number;
  quality: "VALID" | "SUSPECT" | "OUT_OF_RANGE";
  batteryAtReading?: number;
}
```
