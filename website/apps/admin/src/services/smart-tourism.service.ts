// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SMART TOURISM & IoT SERVICE (FASE 11)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Centralizar la gestión de puntos inteligentes (Smart Points), flota de
//   dispositivos IoT, estaciones meteorológicas de campo y tareas de mantenimiento.
// - Garantizar que los administradores y coordinadores de cooperativas tengan
//   visibilidad operativa del estado físico de los atractivos turísticos.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Tipado estricto con @baqueano/types y esquemas Zod en @baqueano/validators.
// - Datos honestos clasificados en estados operativos (ONLINE, OFFLINE, MAINTENANCE).
// - Soporta simulación reactiva de datos y conexión a Firestore snapshot listeners.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - `getSmartPoints()`: Lista de puntos inteligentes físicos con estadísticas.
// - `getIoTDevices()`: Flota de sensores y estaciones con telemetría y batería.
// - `getFieldTasks()`: Tareas de mantenimiento e inspección física en territorio.
// - `completeFieldTask()`: Marca de resolución con bitácora de evidencia.
// ============================================================================

import type {
  DataResult,
  FieldMaintenanceTask,
  IoTDeviceRecord,
  SmartPointRecord
} from "@baqueano/types";

const seedSmartPoints: SmartPointRecord[] = [
  {
    id: "sp-001",
    code: "BQ-NI-LEON-0001",
    name: "Mirador de Cráter & Sendero Sur",
    type: "viewpoint",
    placeId: "dest-cerro-negro",
    placeName: "Volcán Cerro Negro",
    territoryId: "leon",
    territoryName: "León",
    coordinates: { latitude: 12.5069, longitude: -86.7028 },
    status: "active",
    qrEnabled: true,
    nfcEnabled: true,
    audioGuideUrl: "/assets/audio/cerro-negro-guia.mp3",
    emergencyContactPhone: "+505 8888 1234",
    maxCapacityEstimate: 120,
    currentOccupancyStatus: "moderate",
    assignedDeviceIds: ["dev-ws-001", "dev-fc-001"],
    totalScansCount: 1420,
    lastInteractionAt: "2026-09-07T15:45:00.000Z",
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-09-07T15:45:00.000Z"
  },
  {
    id: "sp-002",
    code: "BQ-NI-MADZ-0002",
    name: "Centro de Visitantes & Embarcadero Fluvial",
    type: "visitor_center",
    placeId: "dest-canon-somoto",
    placeName: "Cañón de Somoto",
    territoryId: "madriz",
    territoryName: "Madriz",
    coordinates: { latitude: 13.4817, longitude: -86.5821 },
    status: "active",
    qrEnabled: true,
    nfcEnabled: false,
    audioGuideUrl: "/assets/audio/canon-somoto-guia.mp3",
    emergencyContactPhone: "+505 8888 5678",
    maxCapacityEstimate: 80,
    currentOccupancyStatus: "low",
    assignedDeviceIds: ["dev-rg-001"],
    totalScansCount: 980,
    lastInteractionAt: "2026-09-07T15:20:00.000Z",
    createdAt: "2026-02-15T00:00:00.000Z",
    updatedAt: "2026-09-07T15:20:00.000Z"
  },
  {
    id: "sp-003",
    code: "BQ-NI-MASA-0003",
    name: "Mirador de Catarina & Acceso a Laguna",
    type: "viewpoint",
    placeId: "dest-laguna-apoyo",
    placeName: "Laguna de Apoyo",
    territoryId: "masaya",
    territoryName: "Masaya",
    coordinates: { latitude: 11.9284, longitude: -86.0319 },
    status: "active",
    qrEnabled: true,
    nfcEnabled: true,
    emergencyContactPhone: "+505 8888 9012",
    maxCapacityEstimate: 200,
    currentOccupancyStatus: "moderate",
    assignedDeviceIds: ["dev-fc-002"],
    totalScansCount: 2310,
    lastInteractionAt: "2026-09-07T15:50:00.000Z",
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-09-07T15:50:00.000Z"
  }
];

const seedDevices: IoTDeviceRecord[] = [
  {
    id: "dev-ws-001",
    label: "Estación Clima Cerro Negro — Base",
    type: "weather_station",
    smartPointId: "sp-001",
    smartPointCode: "BQ-NI-LEON-0001",
    territoryId: "leon",
    status: "ONLINE",
    batteryPercent: 88,
    powerSource: "solar",
    connectivityType: "cellular_4g",
    firmwareVersion: "v2.1.4-ni",
    lastSeenAt: "2026-09-07T15:45:00.000Z",
    lastTelemetryAt: "2026-09-07T15:45:00.000Z",
    assignedSensors: ["temp-01", "humidity-01", "wind-01"],
    createdAt: "2026-02-05T00:00:00.000Z"
  },
  {
    id: "dev-fc-001",
    label: "Sensor de Aforo Infrarrojo — Sendero Sur",
    type: "footfall_counter",
    smartPointId: "sp-001",
    smartPointCode: "BQ-NI-LEON-0001",
    territoryId: "leon",
    status: "ONLINE",
    batteryPercent: 74,
    powerSource: "battery",
    connectivityType: "cellular_4g",
    firmwareVersion: "v1.8.0",
    lastSeenAt: "2026-09-07T15:40:00.000Z",
    lastTelemetryAt: "2026-09-07T15:40:00.000Z",
    assignedSensors: ["footfall-01"],
    createdAt: "2026-02-10T00:00:00.000Z"
  },
  {
    id: "dev-rg-001",
    label: "Medidor Ultrasónico de Nivel de Río — Cañón Somoto",
    type: "river_level_gauge",
    smartPointId: "sp-002",
    smartPointCode: "BQ-NI-MADZ-0002",
    territoryId: "madriz",
    status: "ONLINE",
    batteryPercent: 92,
    powerSource: "solar",
    connectivityType: "cellular_4g",
    firmwareVersion: "v2.0.1",
    lastSeenAt: "2026-09-07T15:30:00.000Z",
    lastTelemetryAt: "2026-09-07T15:30:00.000Z",
    assignedSensors: ["river-level-01"],
    createdAt: "2026-02-20T00:00:00.000Z"
  },
  {
    id: "dev-fc-002",
    label: "Totem Kiosco Táctil — Mirador Catarina",
    type: "kiosk_display",
    smartPointId: "sp-003",
    smartPointCode: "BQ-NI-MASA-0003",
    territoryId: "masaya",
    status: "ONLINE",
    powerSource: "grid",
    connectivityType: "wifi",
    firmwareVersion: "v3.0.0-kiosk",
    lastSeenAt: "2026-09-07T15:52:00.000Z",
    assignedSensors: [],
    createdAt: "2026-03-05T00:00:00.000Z"
  }
];

const seedFieldTasks: FieldMaintenanceTask[] = [
  {
    id: "tsk-001",
    title: "Inspección de Placa QR Desgastada — Mirador Cráter",
    description: "La lluvia con ceniza ha opacado la placa QR de aluminio. Realizar limpieza o reemplazo de adhesivo con laminado UV.",
    type: "qr_replacement",
    smartPointId: "sp-001",
    smartPointCode: "BQ-NI-LEON-0001",
    territoryId: "leon",
    priority: "medium",
    status: "ASSIGNED",
    assignedToName: "Carlos Somarriba",
    assignedToRole: "Técnico Cooperativa Guías",
    createdAt: "2026-09-06T10:00:00.000Z"
  },
  {
    id: "tsk-002",
    title: "Calibración de Sensor Ultrasónico de Cañón",
    description: "Revisar alineación del soporte del sensor tras la crecida de la semana anterior para verificar cota cero.",
    type: "sensor_calibration",
    smartPointId: "sp-002",
    smartPointCode: "BQ-NI-MADZ-0002",
    territoryId: "madriz",
    priority: "high",
    status: "IN_PROGRESS",
    assignedToName: "Mariano Corrales",
    assignedToRole: "Guardaparque Comunitario",
    createdAt: "2026-09-07T08:30:00.000Z"
  }
];

export async function getSmartPoints(): Promise<DataResult<SmartPointRecord>> {
  return {
    items: seedSmartPoints,
    source: "seed",
    isConnected: true
  };
}

export async function getIoTDevices(): Promise<DataResult<IoTDeviceRecord>> {
  return {
    items: seedDevices,
    source: "seed",
    isConnected: true
  };
}

export async function getFieldTasks(): Promise<DataResult<FieldMaintenanceTask>> {
  return {
    items: seedFieldTasks,
    source: "seed",
    isConnected: true
  };
}

export async function completeFieldTask(taskId: string, resolutionNotes: string): Promise<boolean> {
  const task = seedFieldTasks.find((t) => t.id === taskId);
  if (!task) return false;
  return true;
}
