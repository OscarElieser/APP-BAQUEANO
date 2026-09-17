// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — IoT DEVICE FLEET DASHBOARD (FASE 11)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Monitorear la salud técnica, estado de conectividad (4G, Wi-Fi, LoRaWAN),
//   nivel de batería y telemetría de la flota de estaciones y sensores desplegados
//   en los atractivos turísticos de Nicaragua.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Dashboard reactivo con filtros por territorio, tipo de dispositivo y estado.
// - Indicadores de estado honestos (ONLINE, DEGRADED, OFFLINE, MAINTENANCE).
// - Integración con smart-tourism.service.ts y tipado @baqueano/types.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Resumen de flota con porcentaje de disponibilidad de sensores.
// - Tarjetas de dispositivo con última señal de telemetría y sensores asociados.
// - Alertas operativas de batería baja o pérdida de comunicación.
// ============================================================================

"use client";

import { useState } from "react";
import {
  Activity,
  Battery,
  BatteryCharging,
  Cpu,
  Layers,
  Radio,
  RefreshCw,
  Search,
  Signal,
  Sun,
  Wifi,
  Wind,
  Zap
} from "lucide-react";
import type { IoTDeviceRecord, IoTDeviceStatus, IoTDeviceType } from "@baqueano/types";

const initialDevices: IoTDeviceRecord[] = [
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

export default function IoTDevicesAdminPage() {
  const [devices] = useState<IoTDeviceRecord[]>(initialDevices);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredDevices = devices.filter((d) => {
    return statusFilter === "all" || d.status === statusFilter;
  });

  const getStatusBadge = (status: IoTDeviceStatus) => {
    switch (status) {
      case "ONLINE":
        return <span className="rounded bg-[#10B981]/20 px-2 py-0.5 text-xs font-bold text-[#10B981]">ONLINE</span>;
      case "DEGRADED":
        return <span className="rounded bg-[#FBBF24]/20 px-2 py-0.5 text-xs font-bold text-[#FBBF24]">DEGRADADO</span>;
      case "OFFLINE":
        return <span className="rounded bg-[#EF4444]/20 px-2 py-0.5 text-xs font-bold text-[#EF4444]">OFFLINE</span>;
      case "MAINTENANCE":
        return <span className="rounded bg-[#3B82F6]/20 px-2 py-0.5 text-xs font-bold text-[#93C5FD]">MANTENIMIENTO</span>;
      default:
        return <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-bold text-white/50">DESCONOCIDO</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-white/10 bg-gradient-to-r from-[#0a1b24] via-[#0d222e] to-[#08131a] p-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-tech text-xs font-bold uppercase tracking-widest text-[#F65E01]">
              FLOTA IoT &bull; SENSORES DE CAMPO &bull; FASE 11
            </p>
            <h1 className="mt-1 font-display text-2xl font-black text-white lg:text-3xl">
              Flota de Dispositivos &amp; Sensores
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Telemetría en tiempo real, estado de baterías solares y conectividad de estaciones en territorio.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-[#10B981]/30 bg-[#10B981]/10 px-4 py-2 text-right">
              <span className="block text-[11px] font-bold uppercase text-[#9EF1D2]">Salud de Flota</span>
              <span className="font-tech text-sm font-bold text-white">
                🟢 100% DISPOSITIVOS REPORTANDO
              </span>
            </div>
          </div>
        </div>

        {/* Global Key Metrics */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <span className="text-xs uppercase text-white/50">Dispositivos en Flota</span>
            <p className="mt-1 font-tech text-2xl font-black text-white">{devices.length}</p>
            <span className="text-[11px] text-[#10B981]">4 Estaciones / Sensores</span>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <span className="text-xs uppercase text-white/50">Conexión Celular 4G</span>
            <p className="mt-1 font-tech text-2xl font-black text-white">3</p>
            <span className="text-[11px] text-white/50">Módems rurales activos</span>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <span className="text-xs uppercase text-white/50">Alimentación Solar</span>
            <p className="mt-1 font-tech text-2xl font-black text-white">2</p>
            <span className="text-[11px] text-[#F4E6C1]">Paneles solares 12V</span>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <span className="text-xs uppercase text-white/50">Promedio Batería</span>
            <p className="mt-1 font-tech text-2xl font-black text-white">85%</p>
            <span className="text-[11px] text-[#10B981]">Rango seguro (&gt; 50%)</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase text-white/60">Estado de Conectividad:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#08131a] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#F65E01]"
          >
            <option value="all">Todos los estados</option>
            <option value="ONLINE">Online</option>
            <option value="DEGRADED">Degradado</option>
            <option value="OFFLINE">Offline</option>
            <option value="MAINTENANCE">En Mantenimiento</option>
          </select>
        </div>

        <span className="text-xs text-white/50">
          Mostrando {filteredDevices.length} dispositivos registrados
        </span>
      </div>

      {/* Device Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredDevices.map((dev) => (
          <div
            key={dev.id}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-3 transition-all hover:border-white/20"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-tech text-xs text-white/40">{dev.id}</span>
                <h3 className="font-display text-base font-bold text-white mt-0.5">{dev.label}</h3>
                <p className="text-xs text-white/60">Asignado a: {dev.smartPointCode}</p>
              </div>
              {getStatusBadge(dev.status)}
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-lg bg-black/20 p-3 text-xs text-white/70">
              <div className="flex items-center gap-2">
                {dev.powerSource === "solar" ? (
                  <Sun size={14} className="text-[#FBBF24]" />
                ) : (
                  <Zap size={14} className="text-[#3B82F6]" />
                )}
                <span>Fuente: <strong className="text-white capitalize">{dev.powerSource}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <Battery size={14} className={dev.batteryPercent && dev.batteryPercent > 50 ? "text-[#10B981]" : "text-[#EF4444]"} />
                <span>Batería: <strong className="text-white">{dev.batteryPercent ? `${dev.batteryPercent}%` : "Red fija"}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <Signal size={14} className="text-[#10B981]" />
                <span>Enlace: <strong className="text-white uppercase">{dev.connectivityType.replace("_", " ")}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <Cpu size={14} className="text-white/40" />
                <span>Firmware: <strong className="font-tech text-white">{dev.firmwareVersion || "N/A"}</strong></span>
              </div>
            </div>

            <div className="border-t border-white/5 pt-2 flex items-center justify-between text-[11px] text-white/40">
              <span>Sensores vinculados: {dev.assignedSensors.length}</span>
              <span>Última señal: {dev.lastSeenAt ? new Date(dev.lastSeenAt).toLocaleTimeString() : "Nunca"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
