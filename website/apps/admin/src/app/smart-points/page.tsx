// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SMART POINTS MANAGEMENT (FASE 11)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Administrar el inventario nacional de puntos inteligentes físicos (miradores,
//   senderos, museos comunitarios, centros de visitantes y puntos de socorro).
// - Generar códigos QR normalizados, supervisar interacción de visitantes y
//   vincular dispositivos IoT de medición en tiempo real.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Interfaz reactiva en Next.js App Router con componentes accesibles.
// - Conexión con smart-tourism.service.ts y tipado @baqueano/types.
// - Filtrado por tipo de punto inteligente y territorio nacional.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Catálogo de Smart Points con coordenadas GPS, estado y código público.
// - Estadísticas agregadas de escaneos y aforo en vivo.
// - Acciones de activación, mantenimiento y generación de identificadores.
// ============================================================================

"use client";

import { useState } from "react";
import {
  Compass,
  Headphones,
  Layers,
  MapPin,
  Phone,
  Plus,
  QrCode,
  Radio,
  Search,
  ShieldCheck,
  Smartphone,
  Users
} from "lucide-react";
import type { SmartPointRecord, SmartPointType } from "@baqueano/types";

const initialPoints: SmartPointRecord[] = [
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

export default function SmartPointsAdminPage() {
  const [points] = useState<SmartPointRecord[]>(initialPoints);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const filteredPoints = points.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.territoryName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || p.type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalScans = points.reduce((acc, p) => acc + p.totalScansCount, 0);

  const getTypeBadge = (type: SmartPointType) => {
    switch (type) {
      case "viewpoint":
        return <span className="rounded bg-[#165D6F]/30 px-2 py-0.5 text-xs font-bold text-[#F4E6C1]">Mirador</span>;
      case "trailhead":
        return <span className="rounded bg-[#10B981]/20 px-2 py-0.5 text-xs font-bold text-[#10B981]">Sendero</span>;
      case "visitor_center":
        return <span className="rounded bg-[#F65E01]/20 px-2 py-0.5 text-xs font-bold text-[#F65E01]">Centro Visitantes</span>;
      case "safety_point":
        return <span className="rounded bg-[#EF4444]/20 px-2 py-0.5 text-xs font-bold text-[#EF4444]">Punto Seguro</span>;
      default:
        return <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-bold text-white/70">Sitio Comunitario</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-white/10 bg-gradient-to-r from-[#0a1b24] via-[#0d222e] to-[#08131a] p-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-tech text-xs font-bold uppercase tracking-widest text-[#F65E01]">
              SMART TOURISM &bull; TERRITORIO CONECTADO &bull; FASE 11
            </p>
            <h1 className="mt-1 font-display text-2xl font-black text-white lg:text-3xl">
              Puntos Inteligentes (Smart Points)
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Gestión de placas QR físicas, señalización NFC, audio guías y vinculación con sensores de campo.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-lg bg-[#F65E01] px-4 py-2 text-xs font-bold text-white hover:bg-[#F65E01]/90 transition-colors">
              <Plus size={16} /> Nuevo Smart Point
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <span className="text-xs uppercase text-white/50">Smart Points Activos</span>
            <p className="mt-1 font-tech text-2xl font-black text-white">{points.length}</p>
            <span className="text-[11px] text-[#10B981]">100% operativos</span>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <span className="text-xs uppercase text-white/50">Escaneos QR Totales</span>
            <p className="mt-1 font-tech text-2xl font-black text-white">{totalScans.toLocaleString()}</p>
            <span className="text-[11px] text-white/50">Sin cookies / 100% anónimos</span>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <span className="text-xs uppercase text-white/50">Dispositivos IoT Enlazados</span>
            <p className="mt-1 font-tech text-2xl font-black text-white">4</p>
            <span className="text-[11px] text-[#10B981]">Estaciones y sensores</span>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <span className="text-xs uppercase text-white/50">Cobertura Territorial</span>
            <p className="mt-1 font-tech text-2xl font-black text-white">3 Territorios</p>
            <span className="text-[11px] text-[#F4E6C1]">Fase Piloto Activa</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search size={16} className="absolute left-3 top-2.5 text-white/40" />
            <input
              type="text"
              placeholder="Buscar por nombre, código o territorio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#08131a] pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#F65E01]"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#08131a] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#F65E01]"
          >
            <option value="all">Todos los tipos</option>
            <option value="viewpoint">Miradores</option>
            <option value="trailhead">Senderos</option>
            <option value="visitor_center">Centros de Visitantes</option>
            <option value="safety_point">Puntos Seguros</option>
          </select>
        </div>

        <span className="text-xs text-white/50">
          Mostrando {filteredPoints.length} de {points.length} puntos inteligentes
        </span>
      </div>

      {/* Grid of Smart Points */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPoints.map((point) => (
          <div
            key={point.id}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-3 transition-all hover:border-white/20"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-tech text-xs text-white/40">{point.code}</span>
                <h3 className="font-display text-base font-bold text-white mt-0.5">{point.name}</h3>
                <p className="text-xs text-white/60">{point.placeName} &bull; {point.territoryName}</p>
              </div>
              {getTypeBadge(point.type)}
            </div>

            <div className="space-y-1.5 border-t border-white/5 pt-3 text-xs text-white/70">
              <div className="flex items-center justify-between">
                <span className="text-white/40">Coordenadas:</span>
                <span className="font-tech text-white">
                  {point.coordinates.latitude.toFixed(4)}°, {point.coordinates.longitude.toFixed(4)}°
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40">Escaneos QR Totales:</span>
                <strong className="font-tech text-white">{point.totalScansCount.toLocaleString()}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40">Capacidad Máxima:</span>
                <span className="text-white">{point.maxCapacityEstimate} personas</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40">Dispositivos IoT:</span>
                <span className="text-[#F4E6C1] font-semibold">{point.assignedDeviceIds.length} enlazados</span>
              </div>
            </div>

            <div className="border-t border-white/5 pt-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-bold ${point.qrEnabled ? "bg-[#10B981]/20 text-[#10B981]" : "bg-white/10 text-white/40"}`}>
                  <QrCode size={12} /> QR Activo
                </span>
                <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-bold ${point.nfcEnabled ? "bg-[#3B82F6]/20 text-[#93C5FD]" : "bg-white/10 text-white/40"}`}>
                  <Smartphone size={12} /> NFC
                </span>
              </div>

              <a
                href={`/p/${point.placeId.replace("dest-", "")}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#F65E01] font-bold hover:underline"
              >
                Probar QR &rarr;
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
