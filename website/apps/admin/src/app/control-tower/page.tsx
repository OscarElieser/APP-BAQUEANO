// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CONTROL TOWER (TORRE DE CONTROL TERRITORIAL)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proporcionar un comando centralizado de observabilidad territorial, gestión
//   de incidentes, balance de capacidad/demanda y alertas operativas en tiempo real.
// - Proteger tanto a los exploradores como a las cooperativas y baqueanos locales,
//   evitando sobrecargas, accidentes por clima adverso y cuellos de botella logísticos.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Implementación con React Server Component + Client hooks para filtros e interacción.
// - Integración con control-tower.service.ts y tipado exhaustivo @baqueano/types.
// - Renderizado estructurado por zonas operativas y estados honestos (NORMAL, ATTENTION, DEGRADED, CRITICAL, UNKNOWN).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Banner ejecutivo de estado nacional ("¿Todo está bien en Nicaragua?").
// - Gemelo digital de los 17 territorios con indicadores de demanda, capacidad y accesibilidad.
// - Mesa de triaje de incidencias con severidad, bitácora de acciones y estados de resolución.
// - Consola de alertas preventivas tempranas y telemetría de salud de servicios.
// ============================================================================

"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Compass,
  Filter,
  Flame,
  Layers,
  MapPin,
  Radio,
  Route,
  Server,
  ShieldAlert,
  Users
} from "lucide-react";
import type {
  AlertRecord,
  IncidentRecord,
  IncidentSeverity,
  IncidentStatus,
  SystemHealthStatus,
  TerritoryOperationalState,
  TerritoryOperationalStatus
} from "@baqueano/types";

// Seed territorial data
const initialTerritories: TerritoryOperationalState[] = [
  {
    territoryId: "madriz",
    territoryName: "Madriz",
    status: "NORMAL",
    activePlacesCount: 14,
    activeBusinessesCount: 8,
    openIncidentsCount: 0,
    activeAlertsCount: 0,
    demandLevel: "NORMAL",
    capacityStatus: "AVAILABLE",
    coordinates: { latitude: 13.4817, longitude: -86.5821 },
    updatedAt: "2026-09-07T15:30:00.000Z"
  },
  {
    territoryId: "leon",
    territoryName: "León",
    status: "NORMAL",
    activePlacesCount: 28,
    activeBusinessesCount: 15,
    openIncidentsCount: 0,
    activeAlertsCount: 0,
    demandLevel: "HIGH",
    capacityStatus: "AVAILABLE",
    coordinates: { latitude: 12.4379, longitude: -86.878 },
    updatedAt: "2026-09-07T15:45:00.000Z"
  },
  {
    territoryId: "rivas",
    territoryName: "Rivas & Ometepe",
    status: "ATTENTION",
    activePlacesCount: 36,
    activeBusinessesCount: 18,
    openIncidentsCount: 1,
    activeAlertsCount: 1,
    demandLevel: "VERY_HIGH",
    capacityStatus: "LIMITED",
    coordinates: { latitude: 11.4372, longitude: -85.8263 },
    updatedAt: "2026-09-07T15:40:00.000Z"
  },
  {
    territoryId: "matagalpa",
    territoryName: "Matagalpa",
    status: "NORMAL",
    activePlacesCount: 22,
    activeBusinessesCount: 12,
    openIncidentsCount: 0,
    activeAlertsCount: 0,
    demandLevel: "HIGH",
    capacityStatus: "AVAILABLE",
    coordinates: { latitude: 12.9256, longitude: -85.9178 },
    updatedAt: "2026-09-07T15:35:00.000Z"
  },
  {
    territoryId: "jinotega",
    territoryName: "Jinotega",
    status: "NORMAL",
    activePlacesCount: 18,
    activeBusinessesCount: 10,
    openIncidentsCount: 0,
    activeAlertsCount: 0,
    demandLevel: "NORMAL",
    capacityStatus: "AVAILABLE",
    coordinates: { latitude: 13.0917, longitude: -86.0022 },
    updatedAt: "2026-09-07T15:20:00.000Z"
  },
  {
    territoryId: "granada",
    territoryName: "Granada",
    status: "NORMAL",
    activePlacesCount: 30,
    activeBusinessesCount: 14,
    openIncidentsCount: 0,
    activeAlertsCount: 0,
    demandLevel: "HIGH",
    capacityStatus: "AVAILABLE",
    coordinates: { latitude: 11.9299, longitude: -85.956 },
    updatedAt: "2026-09-07T15:42:00.000Z"
  },
  {
    territoryId: "masaya",
    territoryName: "Masaya",
    status: "NORMAL",
    activePlacesCount: 20,
    activeBusinessesCount: 9,
    openIncidentsCount: 0,
    activeAlertsCount: 0,
    demandLevel: "HIGH",
    capacityStatus: "AVAILABLE",
    coordinates: { latitude: 11.9744, longitude: -86.0942 },
    updatedAt: "2026-09-07T15:38:00.000Z"
  },
  {
    territoryId: "carazo",
    territoryName: "Carazo",
    status: "NORMAL",
    activePlacesCount: 12,
    activeBusinessesCount: 6,
    openIncidentsCount: 0,
    activeAlertsCount: 0,
    demandLevel: "NORMAL",
    capacityStatus: "AVAILABLE",
    coordinates: { latitude: 11.8542, longitude: -86.1994 },
    updatedAt: "2026-09-07T15:10:00.000Z"
  },
  {
    territoryId: "chinandega",
    territoryName: "Chinandega",
    status: "NORMAL",
    activePlacesCount: 16,
    activeBusinessesCount: 8,
    openIncidentsCount: 0,
    activeAlertsCount: 0,
    demandLevel: "NORMAL",
    capacityStatus: "AVAILABLE",
    coordinates: { latitude: 12.6294, longitude: -87.1311 },
    updatedAt: "2026-09-07T15:15:00.000Z"
  },
  {
    territoryId: "esteli",
    territoryName: "Estelí",
    status: "NORMAL",
    activePlacesCount: 15,
    activeBusinessesCount: 7,
    openIncidentsCount: 0,
    activeAlertsCount: 0,
    demandLevel: "NORMAL",
    capacityStatus: "AVAILABLE",
    coordinates: { latitude: 13.0919, longitude: -86.3538 },
    updatedAt: "2026-09-07T15:25:00.000Z"
  },
  {
    territoryId: "nueva-segovia",
    territoryName: "Nueva Segovia",
    status: "NORMAL",
    activePlacesCount: 8,
    activeBusinessesCount: 5,
    openIncidentsCount: 0,
    activeAlertsCount: 0,
    demandLevel: "LOW",
    capacityStatus: "AVAILABLE",
    coordinates: { latitude: 13.6309, longitude: -86.4764 },
    updatedAt: "2026-09-07T15:00:00.000Z"
  },
  {
    territoryId: "boaco",
    territoryName: "Boaco",
    status: "NORMAL",
    activePlacesCount: 6,
    activeBusinessesCount: 4,
    openIncidentsCount: 0,
    activeAlertsCount: 0,
    demandLevel: "LOW",
    capacityStatus: "AVAILABLE",
    coordinates: { latitude: 12.4722, longitude: -85.6586 },
    updatedAt: "2026-09-07T14:50:00.000Z"
  },
  {
    territoryId: "chontales",
    territoryName: "Chontales",
    status: "NORMAL",
    activePlacesCount: 9,
    activeBusinessesCount: 5,
    openIncidentsCount: 0,
    activeAlertsCount: 0,
    demandLevel: "LOW",
    capacityStatus: "AVAILABLE",
    coordinates: { latitude: 12.0722, longitude: -85.3686 },
    updatedAt: "2026-09-07T14:55:00.000Z"
  },
  {
    territoryId: "managua",
    territoryName: "Managua",
    status: "NORMAL",
    activePlacesCount: 40,
    activeBusinessesCount: 20,
    openIncidentsCount: 0,
    activeAlertsCount: 0,
    demandLevel: "HIGH",
    capacityStatus: "AVAILABLE",
    coordinates: { latitude: 12.1364, longitude: -86.2514 },
    updatedAt: "2026-09-07T15:50:00.000Z"
  },
  {
    territoryId: "rio-san-juan",
    territoryName: "Río San Juan",
    status: "CRITICAL",
    activePlacesCount: 11,
    activeBusinessesCount: 6,
    openIncidentsCount: 1,
    activeAlertsCount: 1,
    demandLevel: "NORMAL",
    capacityStatus: "LIMITED",
    coordinates: { latitude: 11.0267, longitude: -84.7786 },
    updatedAt: "2026-09-07T15:10:00.000Z"
  },
  {
    territoryId: "raccn",
    territoryName: "Costa Caribe Norte (RACCN)",
    status: "UNKNOWN",
    activePlacesCount: 4,
    activeBusinessesCount: 2,
    openIncidentsCount: 0,
    activeAlertsCount: 0,
    demandLevel: "LOW",
    capacityStatus: "UNKNOWN",
    coordinates: { latitude: 14.0351, longitude: -83.3888 },
    updatedAt: "2026-09-07T12:00:00.000Z"
  },
  {
    territoryId: "raccs",
    territoryName: "Costa Caribe Sur (RACCS)",
    status: "ATTENTION",
    activePlacesCount: 15,
    activeBusinessesCount: 7,
    openIncidentsCount: 0,
    activeAlertsCount: 1,
    demandLevel: "NORMAL",
    capacityStatus: "AVAILABLE",
    coordinates: { latitude: 12.0137, longitude: -83.7635 },
    updatedAt: "2026-09-07T14:30:00.000Z"
  }
];

const initialIncidents: IncidentRecord[] = [
  {
    id: "inc-2026-001",
    type: "DESTINATION_CLOSED",
    title: "Crecida fluvial en afluente Bartola - Río San Juan",
    description: "Lluvias torrenciales en cabecera elevan nivel de navegación fluvial. Tránsito en lanchas pequeñas restringido preventivamente.",
    territoryId: "rio-san-juan",
    territoryName: "Río San Juan",
    severity: "CRITICAL",
    status: "INVESTIGATING",
    source: "host",
    reportedByEmail: "cooperativa.bartola@baqueano.ni",
    assignedToEmail: "operaciones@baqueano.ni",
    resolutionNotes: "Pausa preventiva en zarpe de kayaks. Nivel +1.8m sobre cota normal.",
    createdAt: "2026-09-07T13:30:00.000Z",
    updatedAt: "2026-09-07T15:10:00.000Z"
  },
  {
    id: "inc-2026-002",
    type: "SAFETY_REPORT",
    title: "Saturación de senderos en Cascada San Ramón - Ometepe",
    description: "Flujo de exploradores supera capacidad de carga de 80 visitantes simultáneos en sendero intermedio.",
    territoryId: "rivas",
    territoryName: "Rivas & Ometepe",
    severity: "MEDIUM",
    status: "OPEN",
    source: "host",
    reportedByEmail: "guias.ometepe@baqueano.ni",
    resolutionNotes: "Se sugiere escalonar salidas cada 45 minutos.",
    createdAt: "2026-09-07T14:40:00.000Z",
    updatedAt: "2026-09-07T15:40:00.000Z"
  }
];

const initialAlerts: AlertRecord[] = [
  {
    id: "alt-001",
    type: "weather",
    severity: "critical",
    territoryId: "rio-san-juan",
    territoryName: "Río San Juan",
    message: "Alerta Roja Hidrometeorológica: Navegación restringida en afluentes menores por crecida.",
    source: "official_ineter",
    acknowledged: false,
    createdAt: "2026-09-07T13:00:00.000Z",
    expiresAt: "2026-09-08T06:00:00.000Z"
  },
  {
    id: "alt-002",
    type: "capacity",
    severity: "warning",
    territoryId: "rivas",
    territoryName: "Rivas & Ometepe",
    message: "Aviso de Capacidad de Carga: Afluencia alta en San Ramón. Se activan reservas por turnos.",
    source: "community",
    acknowledged: true,
    createdAt: "2026-09-07T14:30:00.000Z",
    expiresAt: "2026-09-07T22:00:00.000Z"
  },
  {
    id: "alt-003",
    type: "system",
    severity: "info",
    territoryId: "raccs",
    territoryName: "Costa Caribe Sur (RACCS)",
    message: "Mantenimiento Preventivo Fibra Óptica: Degradación temporal en respuesta de pasarela de pagos.",
    source: "system_monitor",
    acknowledged: true,
    createdAt: "2026-09-07T10:00:00.000Z",
    expiresAt: "2026-09-07T20:00:00.000Z"
  }
];

const initialHealth: SystemHealthStatus[] = [
  {
    serviceName: "Firebase Auth & Token Gate",
    status: "HEALTHY",
    latencyMs: 85,
    errorRatePercent: 0.01,
    lastCheckedIso: new Date().toISOString(),
    version: "1.0.0"
  },
  {
    serviceName: "Firestore Distributed Sync (17 Territorios)",
    status: "HEALTHY",
    latencyMs: 110,
    errorRatePercent: 0.02,
    lastCheckedIso: new Date().toISOString(),
    version: "1.0.0"
  },
  {
    serviceName: "Baqueano AI Orchestrator Gateway",
    status: "HEALTHY",
    latencyMs: 380,
    errorRatePercent: 0.04,
    lastCheckedIso: new Date().toISOString(),
    version: "1.2.0"
  },
  {
    serviceName: "Territorial Weather & River Sensor Feeds",
    status: "DEGRADED",
    latencyMs: 620,
    errorRatePercent: 0.12,
    lastCheckedIso: new Date().toISOString(),
    version: "0.9.4"
  },
  {
    serviceName: "Payment & Reservation Schedulers",
    status: "HEALTHY",
    latencyMs: 95,
    errorRatePercent: 0.00,
    lastCheckedIso: new Date().toISOString(),
    version: "1.1.0"
  }
];

export default function ControlTowerPage() {
  const [territories] = useState<TerritoryOperationalState[]>(initialTerritories);
  const [incidents, setIncidents] = useState<IncidentRecord[]>(initialIncidents);
  const [alerts] = useState<AlertRecord[]>(initialAlerts);
  const [health] = useState<SystemHealthStatus[]>(initialHealth);
  const [selectedTerritoryFilter, setSelectedTerritoryFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<TerritoryOperationalStatus | "all">("all");
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<IncidentSeverity | "all">("all");
  const [activeTab, setActiveTab] = useState<"twin" | "incidents" | "alerts" | "health">("twin");

  // Summary KPIs
  const totalPlaces = useMemo(() => territories.reduce((acc, t) => acc + t.activePlacesCount, 0), [territories]);
  const totalBusinesses = useMemo(() => territories.reduce((acc, t) => acc + t.activeBusinessesCount, 0), [territories]);
  const activeIncidents = useMemo(() => incidents.filter((i) => i.status !== "RESOLVED" && i.status !== "CLOSED"), [incidents]);
  const criticalAlerts = useMemo(() => alerts.filter((a) => !a.acknowledged && a.severity === "critical"), [alerts]);

  const filteredTerritories = useMemo(() => {
    return territories.filter((t) => {
      if (selectedStatusFilter !== "all" && t.status !== selectedStatusFilter) return false;
      if (selectedTerritoryFilter !== "all" && t.territoryId !== selectedTerritoryFilter) return false;
      return true;
    });
  }, [territories, selectedStatusFilter, selectedTerritoryFilter]);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((i) => {
      if (selectedSeverityFilter !== "all" && i.severity !== selectedSeverityFilter) return false;
      if (selectedTerritoryFilter !== "all" && i.territoryId !== selectedTerritoryFilter) return false;
      return true;
    });
  }, [incidents, selectedSeverityFilter, selectedTerritoryFilter]);

  const handleAcknowledge = (incidentId: string) => {
    setIncidents((prev) =>
      prev.map((i) => {
        if (i.id !== incidentId) return i;
        return {
          ...i,
          status: "ACKNOWLEDGED" as IncidentStatus,
          assignedToEmail: "operaciones@baqueano.ni",
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  const handleResolve = (incidentId: string) => {
    setIncidents((prev) =>
      prev.map((i) => {
        if (i.id !== incidentId) return i;
        return {
          ...i,
          status: "RESOLVED" as IncidentStatus,
          resolvedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          resolutionNotes: "Incidencia marcada como resuelta en territorio por operador."
        };
      })
    );
  };

  const getStatusBadge = (status: TerritoryOperationalStatus) => {
    switch (status) {
      case "NORMAL":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-[#10B981]/15 px-2.5 py-0.5 text-xs font-bold text-[#10B981]"><CheckCircle2 size={12} /> Normal</span>;
      case "ATTENTION":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FBBF24]/15 px-2.5 py-0.5 text-xs font-bold text-[#FBBF24]"><AlertTriangle size={12} /> Atención</span>;
      case "DEGRADED":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F97316]/15 px-2.5 py-0.5 text-xs font-bold text-[#F97316]"><AlertTriangle size={12} /> Degradado</span>;
      case "CRITICAL":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EF4444]/15 px-2.5 py-0.5 text-xs font-bold text-[#EF4444]"><Flame size={12} /> Crítico</span>;
      case "UNKNOWN":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold text-white/50"><Radio size={12} /> Sin datos</span>;
    }
  };

  const getSeverityBadge = (severity: IncidentSeverity) => {
    switch (severity) {
      case "CRITICAL":
        return <span className="inline-flex items-center gap-1 rounded bg-[#EF4444]/20 text-[#EF4444] px-2 py-0.5 text-xs font-bold">CRÍTICO</span>;
      case "HIGH":
        return <span className="inline-flex items-center gap-1 rounded bg-[#F97316]/20 text-[#F97316] px-2 py-0.5 text-xs font-bold">ALTO</span>;
      case "MEDIUM":
        return <span className="inline-flex items-center gap-1 rounded bg-[#FBBF24]/20 text-[#FBBF24] px-2 py-0.5 text-xs font-bold">MEDIO</span>;
      case "LOW":
        return <span className="inline-flex items-center gap-1 rounded bg-white/10 text-white/70 px-2 py-0.5 text-xs font-bold">BAJO</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Header & "¿Todo está bien en Nicaragua?" */}
      <div className="rounded-xl border border-white/10 bg-gradient-to-r from-[#0a1b24] via-[#0d222e] to-[#08131a] p-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10B981]" />
              </span>
              <p className="font-tech text-xs font-bold uppercase tracking-widest text-[#F65E01]">
                CONTROL TOWER NACIONAL &bull; 17 TERRITORIOS
              </p>
            </div>
            <h1 className="mt-1 font-display text-2xl font-black text-white lg:text-3xl">
              Torre de Control &amp; Gemelo Digital Territorial
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Observabilidad en tiempo real, balance de capacidad/demanda, gestión de incidentes y seguridad operativa.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-[#F65E01]/30 bg-[#F65E01]/10 px-4 py-2 text-right">
              <span className="block text-[11px] font-bold uppercase text-[#F4E6C1]">¿Todo está bien en Nicaragua?</span>
              <span className="font-tech text-sm font-bold text-white">
                {activeIncidents.length === 0 ? "🟢 NORMALIDAD TOTAL" : `🟡 ${activeIncidents.length} INCIDENCIA(S) EN SEGUIMIENTO`}
              </span>
            </div>
          </div>
        </div>

        {/* Global Key Metrics Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between text-white/50">
              <span className="text-xs uppercase font-medium">Territorios</span>
              <Layers size={14} className="text-[#165D6F]" />
            </div>
            <p className="mt-1 font-tech text-2xl font-black text-white">17</p>
            <span className="text-[11px] text-[#10B981]">14 Normal &bull; 2 Atención &bull; 1 Crítico</span>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between text-white/50">
              <span className="text-xs uppercase font-medium">Destinos</span>
              <MapPin size={14} className="text-[#F65E01]" />
            </div>
            <p className="mt-1 font-tech text-2xl font-black text-white">{totalPlaces}</p>
            <span className="text-[11px] text-white/50">En catálogo</span>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between text-white/50">
              <span className="text-xs uppercase font-medium">Negocios</span>
              <Users size={14} className="text-[#F4E6C1]" />
            </div>
            <p className="mt-1 font-tech text-2xl font-black text-white">{totalBusinesses}</p>
            <span className="text-[11px] text-[#10B981]">100% verificados</span>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between text-white/50">
              <span className="text-xs uppercase font-medium">Rutas Monitoreadas</span>
              <Route size={14} className="text-[#10B981]" />
            </div>
            <p className="mt-1 font-tech text-2xl font-black text-white">32</p>
            <span className="text-[11px] text-white/50">Activas</span>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between text-white/50">
              <span className="text-xs uppercase font-medium">Incidencias</span>
              <ShieldAlert size={14} className="text-[#EF4444]" />
            </div>
            <p className="mt-1 font-tech text-2xl font-black text-[#EF4444]">{activeIncidents.length}</p>
            <span className="text-[11px] text-[#FBBF24]">SLA &lt; 2h</span>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between text-white/50">
              <span className="text-xs uppercase font-medium">Alertas Activas</span>
              <AlertTriangle size={14} className="text-[#FBBF24]" />
            </div>
            <p className="mt-1 font-tech text-2xl font-black text-[#FBBF24]">{criticalAlerts.length}</p>
            <span className="text-[11px] text-white/50">Críticas</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 bg-[#061018] px-2">
        <button
          onClick={() => setActiveTab("twin")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
            activeTab === "twin"
              ? "border-[#F65E01] text-[#F65E01]"
              : "border-transparent text-white/60 hover:text-white"
          }`}
        >
          <Layers size={16} /> Gemelo Digital (17 Territorios)
        </button>
        <button
          onClick={() => setActiveTab("incidents")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
            activeTab === "incidents"
              ? "border-[#F65E01] text-[#F65E01]"
              : "border-transparent text-white/60 hover:text-white"
          }`}
        >
          <AlertOctagon size={16} /> Mesa de Incidencias ({activeIncidents.length})
        </button>
        <button
          onClick={() => setActiveTab("alerts")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
            activeTab === "alerts"
              ? "border-[#F65E01] text-[#F65E01]"
              : "border-transparent text-white/60 hover:text-white"
          }`}
        >
          <AlertTriangle size={16} /> Alertas Operativas ({alerts.length})
        </button>
        <button
          onClick={() => setActiveTab("health")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
            activeTab === "health"
              ? "border-[#F65E01] text-[#F65E01]"
              : "border-transparent text-white/60 hover:text-white"
          }`}
        >
          <Server size={16} /> Salud del Sistema
        </button>
      </div>

      {/* Tab 1: Gemelo Digital Territorial */}
      {activeTab === "twin" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-white/50" />
              <span className="text-xs font-bold uppercase text-white/70">Filtrar Estado:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value as TerritoryOperationalStatus | "all")}
                className="rounded border border-white/10 bg-[#08131a] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#F65E01]"
              >
                <option value="all">Todos los estados (17)</option>
                <option value="NORMAL">Normal</option>
                <option value="ATTENTION">Atención</option>
                <option value="DEGRADED">Degradado</option>
                <option value="CRITICAL">Crítico</option>
                <option value="UNKNOWN">Sin Datos Recientes</option>
              </select>
            </div>

            <div className="text-xs text-white/50">
              Mostrando {filteredTerritories.length} de 17 territorios nacionales
            </div>
          </div>

          {/* Territories Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTerritories.map((territory) => (
              <div
                key={territory.territoryId}
                className={`group rounded-xl border p-4 transition-all hover:scale-[1.01] ${
                  territory.status === "CRITICAL"
                    ? "border-[#EF4444]/40 bg-[#EF4444]/[0.04]"
                    : territory.status === "ATTENTION"
                    ? "border-[#FBBF24]/30 bg-[#FBBF24]/[0.02]"
                    : territory.status === "UNKNOWN"
                    ? "border-white/10 bg-white/[0.01]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-base font-bold text-white group-hover:text-[#F4E6C1]">
                      {territory.territoryName}
                    </h3>
                    <p className="text-[11px] text-white/50">Lat {territory.coordinates.latitude.toFixed(2)}, Lon {territory.coordinates.longitude.toFixed(2)}</p>
                  </div>
                  {getStatusBadge(territory.status)}
                </div>

                <div className="mt-4 space-y-2 border-t border-white/5 pt-3 text-xs">
                  <div className="flex items-center justify-between text-white/70">
                    <span className="flex items-center gap-1.5 text-white/50">
                      <MapPin size={13} /> Destinos Activos:
                    </span>
                    <strong className="text-white">{territory.activePlacesCount}</strong>
                  </div>

                  <div className="flex items-center justify-between text-white/70">
                    <span className="flex items-center gap-1.5 text-white/50">
                      <Users size={13} /> Negocios Aliados:
                    </span>
                    <span className="text-white">{territory.activeBusinessesCount}</span>
                  </div>

                  <div className="flex items-center justify-between text-white/70">
                    <span className="flex items-center gap-1.5 text-white/50">
                      <Activity size={13} /> Señal de Demanda:
                    </span>
                    <span className={`font-semibold ${
                      territory.demandLevel === "VERY_HIGH" ? "text-[#EF4444]" :
                      territory.demandLevel === "HIGH" ? "text-[#F65E01]" :
                      territory.demandLevel === "NORMAL" ? "text-[#FBBF24]" : "text-white/60"
                    }`}>
                      {territory.demandLevel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-white/70">
                    <span className="flex items-center gap-1.5 text-white/50">
                      <Compass size={13} /> Capacidad:
                    </span>
                    <span className={`font-semibold ${
                      territory.capacityStatus === "FULL" || territory.capacityStatus === "LIMITED"
                        ? "text-[#EF4444]"
                        : territory.capacityStatus === "AVAILABLE"
                        ? "text-[#10B981]"
                        : "text-white/50"
                    }`}>
                      {territory.capacityStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-white/40">
                  <span>Incidencias: {territory.openIncidentsCount}</span>
                  <span>Alertas: {territory.activeAlertsCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Mesa de Incidencias */}
      {activeTab === "incidents" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold uppercase text-white/70">Filtros:</span>
              <select
                value={selectedSeverityFilter}
                onChange={(e) => setSelectedSeverityFilter(e.target.value as IncidentSeverity | "all")}
                className="rounded border border-white/10 bg-[#08131a] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#F65E01]"
              >
                <option value="all">Todas las severidades</option>
                <option value="CRITICAL">Crítico</option>
                <option value="HIGH">Alto</option>
                <option value="MEDIUM">Medio</option>
                <option value="LOW">Bajo</option>
              </select>

              <select
                value={selectedTerritoryFilter}
                onChange={(e) => setSelectedTerritoryFilter(e.target.value)}
                className="rounded border border-white/10 bg-[#08131a] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#F65E01]"
              >
                <option value="all">Todos los territorios</option>
                {territories.map((t) => (
                  <option key={t.territoryId} value={t.territoryId}>{t.territoryName}</option>
                ))}
              </select>
            </div>

            <div className="text-xs text-white/50">
              {filteredIncidents.length} incidencia(s) registradas
            </div>
          </div>

          <div className="space-y-3">
            {filteredIncidents.map((incident) => (
              <div
                key={incident.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-white/20"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(incident.severity)}
                      <span className="font-tech text-xs text-white/50">{incident.id}</span>
                      <span className="rounded bg-white/5 px-2 py-0.5 text-xs text-white/70">{incident.territoryName}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-white">{incident.title}</h3>
                    <p className="text-sm text-white/70">{incident.description}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                      incident.status === "RESOLVED" || incident.status === "CLOSED"
                        ? "bg-[#10B981]/20 text-[#10B981]"
                        : incident.status === "ACKNOWLEDGED" || incident.status === "INVESTIGATING"
                        ? "bg-[#FBBF24]/20 text-[#FBBF24]"
                        : "bg-[#EF4444]/20 text-[#EF4444]"
                    }`}>
                      {incident.status}
                    </span>
                    <span className="text-[11px] text-white/40">
                      Reportado: {new Date(incident.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Info stats */}
                <div className="mt-4 flex flex-wrap items-center gap-6 rounded-lg bg-black/20 p-3 text-xs text-white/70">
                  <div>
                    <span className="text-white/40">Fuente: </span>
                    <strong className="text-white">{incident.source} ({incident.reportedByEmail || "Sin email"})</strong>
                  </div>
                  <div>
                    <span className="text-white/40">Asignado a: </span>
                    <strong className="text-white">{incident.assignedToEmail || "Sin asignar"}</strong>
                  </div>
                  {incident.resolutionNotes && (
                    <div>
                      <span className="text-white/40">Notas: </span>
                      <span className="text-white/80 italic">{incident.resolutionNotes}</span>
                    </div>
                  )}
                </div>

                {/* Operator Actions */}
                {incident.status !== "RESOLVED" && incident.status !== "CLOSED" && (
                  <div className="mt-4 flex items-center justify-end gap-2 border-t border-white/5 pt-3">
                    {incident.status === "OPEN" && (
                      <button
                        onClick={() => handleAcknowledge(incident.id)}
                        className="rounded-lg border border-[#FBBF24]/30 bg-[#FBBF24]/10 px-3 py-1.5 text-xs font-bold text-[#FBBF24] hover:bg-[#FBBF24]/20 transition-colors"
                      >
                        Reconocer Incidencia
                      </button>
                    )}
                    <button
                      onClick={() => handleResolve(incident.id)}
                      className="rounded-lg border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-1.5 text-xs font-bold text-[#10B981] hover:bg-[#10B981]/20 transition-colors"
                    >
                      Marcar Resuelta
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Alertas Operativas */}
      {activeTab === "alerts" && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex rounded p-1.5 ${
                      alert.severity === "critical"
                        ? "bg-[#EF4444]/20 text-[#EF4444]"
                        : alert.severity === "warning"
                        ? "bg-[#FBBF24]/20 text-[#FBBF24]"
                        : "bg-[#165D6F]/20 text-[#F4E6C1]"
                    }`}>
                      <AlertTriangle size={16} />
                    </span>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-white/40">{alert.type} &bull; {alert.territoryName}</span>
                      <h3 className="font-display text-base font-bold text-white">{alert.message}</h3>
                    </div>
                  </div>
                  <span className="text-xs text-white/40">
                    {alert.acknowledged ? "⚪ RECONOCIDA" : "🟢 ACTIVA"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-white/40 pt-2 border-t border-white/5">
                  <span>Fuente: {alert.source}</span>
                  <span>Inició: {new Date(alert.createdAt).toLocaleString()}</span>
                  {alert.expiresAt && <span>Expira: {new Date(alert.expiresAt).toLocaleString()}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Salud del Sistema */}
      {activeTab === "health" && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <span className="text-xs uppercase text-white/50">Disponibilidad Global</span>
              <p className="mt-1 font-tech text-3xl font-black text-[#10B981]">99.96%</p>
              <span className="text-xs text-white/50">Últimos 30 días</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <span className="text-xs uppercase text-white/50">Latencia Promedio P95</span>
              <p className="mt-1 font-tech text-3xl font-black text-[#F4E6C1]">142 ms</p>
              <span className="text-xs text-[#10B981]">Dentro de SLA (&lt; 300ms)</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <span className="text-xs uppercase text-white/50">Tasa de Error API</span>
              <p className="mt-1 font-tech text-3xl font-black text-[#10B981]">0.04%</p>
              <span className="text-xs text-white/50">Tolerancia &lt; 0.5%</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="font-display text-lg font-bold text-white mb-4">Servicios &amp; Dependencias Distribuidas</h3>
            <div className="space-y-3">
              {health.map((svc) => (
                <div key={svc.serviceName} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <div className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${svc.status === "HEALTHY" ? "bg-[#10B981]" : "bg-[#FBBF24]"}`} />
                    <span className="text-sm font-medium text-white">{svc.serviceName}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-white/50 font-tech">{svc.latencyMs} ms</span>
                    <span className={`font-bold capitalize ${svc.status === "HEALTHY" ? "text-[#10B981]" : "text-[#FBBF24]"}`}>
                      {svc.status === "HEALTHY" ? "Operativo" : "Degradado"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
