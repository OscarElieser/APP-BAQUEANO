# MODELO DE DISPOSITIVOS IoT & HARDWARE DE CAMPO

## 1. Definición de Dispositivo IoT (`IoTDeviceRecord`)

Representa una unidad física autónoma desplegada en reservas naturales o instalaciones turísticas.

```typescript
export interface IoTDeviceRecord {
  id: string;                    // Identificador único (ej: "dev-gate-001")
  serialNumber: string;          // Número de serie del fabricante
  type: IoTDeviceType;           // Tipo de equipo
  smartPointId: string;          // Smart Point asociado
  model: string;                 // Modelo de hardware (ej: "Baqueano LoRa Gateway v2.1")
  firmwareVersion: string;       // Versión de firmware actual
  connectivityType: "LORA_WAN" | "CELLULAR_4G" | "CELLULAR_NBIOT" | "WIFI" | "SATELLITE" | "BLE";
  status: "ONLINE" | "OFFLINE" | "DEGRADED" | "MAINTENANCE";
  batteryLevelPercent?: number;  // 0 - 100
  powerSource: "SOLAR_BATTERY" | "GRID_AC" | "INTERNAL_BATTERY" | "POE";
  lastHeartbeatAt?: string;
  ipAddress?: string;
  macAddress?: string;
  apiKeyHash?: string;           // Hash SHA-256 de la API Key para autenticación en ingestion
  latitude?: number;
  longitude?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 2. Tipos de Dispositivos (`IoTDeviceType`)

- **`GATEWAY`**: Concentrador de comunicaciones LoRaWAN o enrutador celular industrial (IP67).
- **`WEATHER_STATION`**: Estación meteorológica autónoma con panel solar y suite de sensores climáticos.
- **`FOOTFALL_COUNTER`**: Contador óptico o ultrasónico de paso direccional anónimo en senderos.
- **`RIVER_MONITOR`**: Sensor de nivel ultrasónico o radar hidrológico para prevención de crecidas repentinas.
- **`AUDIO_BEACON`**: Baliza Bluetooth Low Energy (BLE) para disparo de narrativas sonoras de proximidad.
- **`SOLAR_CHARGER`**: Nodo de gestión y telemetría de energía solar y banco de baterías.
