// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — ENTERPRISE PLATFORM CONSOLE (FASE 10)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proporcionar a los superadministradores un panel de comando centralizado
//   para gestionar organizaciones aliadas, credenciales de APIs v1, políticas
//   de gobierno de datos y observabilidad de Disaster Recovery / Continuidad.
// - Asegurar la gobernabilidad y soberanía de datos del ecosistema Baqueano
//   a escala nacional sin crear sobre-ingeniería innecesaria.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Interfaz reactiva en Next.js App Router con componentes accesibles.
// - Conexión desacoplada con platform.service.ts y tipado exhaustivo @baqueano/types.
// - Separación estricta entre identidad de usuario y membresía organizacional (ABAC).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Directorio de organizaciones aliadas (central, cooperativas, alcaldías, INTUR).
// - Monitor de API Keys para partners con scopes, prefijos y límites de tasa.
// - Catálogo formal de gobierno de datos con clasificación y retención.
// - Tablero de Disaster Recovery con RTO/RPO, estado de backups y conmutadores de corte (Kill Switches).
// ============================================================================

"use client";

import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  Database,
  Globe,
  KeyRound,
  Layers,
  Lock,
  Power,
  RefreshCw,
  Server,
  ShieldCheck,
  Sliders,
  Webhook
} from "lucide-react";
import type {
  ApiKeyRecord,
  DataClassification,
  DataGovernanceRecord,
  DisasterRecoveryStatus,
  OrganizationRecord,
  OrganizationType
} from "@baqueano/types";

const initialOrgs: OrganizationRecord[] = [
  {
    id: "org-baqueano-central",
    name: "Baqueano Central",
    legalName: "Baqueano Nicaragua Ecosistema Digital S.A.",
    type: "central_platform",
    status: "active",
    territories: ["national"],
    permissions: ["all_access", "billing_admin", "security_admin"],
    contactEmail: "operaciones@baqueano.ni",
    contactPhone: "+505 2222 0000",
    taxId: "J0310000000001",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-09-07T00:00:00.000Z"
  },
  {
    id: "org-coop-somoto",
    name: "Cooperativa de Guías Cañón de Somoto",
    legalName: "Cooperativa de Servicios Turísticos Comunitarios R.L.",
    type: "cooperative",
    status: "active",
    territories: ["madriz"],
    permissions: ["destinations.manage", "reservations.host", "incidents.report"],
    contactEmail: "guias.somoto@baqueano.ni",
    contactPhone: "+505 8888 1111",
    taxId: "J0310000000002",
    createdAt: "2026-03-15T00:00:00.000Z",
    updatedAt: "2026-09-07T00:00:00.000Z"
  },
  {
    id: "org-alcaldia-el-castillo",
    name: "Alcaldía Municipal de El Castillo",
    legalName: "Gobierno Local de El Castillo, Río San Juan",
    type: "municipality",
    status: "active",
    territories: ["rio-san-juan"],
    permissions: ["territories.monitor", "alerts.publish", "incidents.manage"],
    contactEmail: "turismo@elcastillo.gob.ni",
    contactPhone: "+505 2583 0000",
    createdAt: "2026-05-10T00:00:00.000Z",
    updatedAt: "2026-09-07T00:00:00.000Z"
  },
  {
    id: "org-intur-enlace",
    name: "Enlace Institucional de Turismo",
    legalName: "Instituto Nicaragüense de Turismo — Dirección de Planificación",
    type: "institution_official",
    status: "active",
    territories: ["national"],
    permissions: ["statistics.read", "official_alerts.broadcast"],
    contactEmail: "enlace.tecnologico@intur.gob.ni",
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-09-07T00:00:00.000Z"
  }
];

const initialKeys: ApiKeyRecord[] = [
  {
    id: "key-001",
    organizationId: "org-intur-enlace",
    keyPrefix: "bq_live_intur",
    keyHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    label: "INTUR Portal Oficial — Feed Estadístico",
    scopes: ["places.read", "territories.read", "alerts.read"],
    status: "active",
    rateLimitPerMin: 120,
    lastUsedAt: "2026-09-07T15:45:00.000Z",
    expiresAt: "2027-09-07T00:00:00.000Z",
    createdAt: "2026-06-01T00:00:00.000Z"
  },
  {
    id: "key-002",
    organizationId: "org-alcaldia-el-castillo",
    keyPrefix: "bq_live_elcastillo",
    keyHash: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
    label: "Monitoreo Fluvial & Alertas Municipales",
    scopes: ["alerts.read", "territories.read"],
    status: "active",
    rateLimitPerMin: 60,
    lastUsedAt: "2026-09-07T15:20:00.000Z",
    createdAt: "2026-05-15T00:00:00.000Z"
  }
];

const initialGovernance: DataGovernanceRecord[] = [
  {
    datasetId: "ds-places-catalog",
    domainName: "Territorio y Contenido",
    ownerRole: "admin_contenido",
    classification: "PUBLIC",
    retentionDays: 1825,
    containsPii: false,
    sourceOfTruth: "Firestore /places",
    qualitySlo: "Coordenadas verificadas y 100% categorizadas",
    lastAuditIso: "2026-09-07T00:00:00.000Z"
  },
  {
    datasetId: "ds-reservations-orders",
    domainName: "Marketplace y Pagos",
    ownerRole: "admin_financiero",
    classification: "RESTRICTED",
    retentionDays: 2555,
    containsPii: true,
    sourceOfTruth: "Firestore /reservations + /payment_orders",
    qualitySlo: "Conciliación bancaria diaria con pasarela",
    lastAuditIso: "2026-09-07T00:00:00.000Z"
  },
  {
    datasetId: "ds-user-identities",
    domainName: "Identidad y Seguridad",
    ownerRole: "super_admin_security",
    classification: "CONFIDENTIAL",
    retentionDays: 1095,
    containsPii: true,
    sourceOfTruth: "Firebase Auth + Firestore /users",
    qualitySlo: "Cero PII en logs y cifrado en tránsito/reposo",
    lastAuditIso: "2026-09-07T00:00:00.000Z"
  },
  {
    datasetId: "ds-audit-logs",
    domainName: "Seguridad y Cumplimiento",
    ownerRole: "super_admin_security",
    classification: "RESTRICTED",
    retentionDays: 3650,
    containsPii: false,
    sourceOfTruth: "Firestore /audit_logs",
    qualitySlo: "Inmutabilidad estricta y marcas de tiempo UTC",
    lastAuditIso: "2026-09-07T00:00:00.000Z"
  }
];

const initialDR: DisasterRecoveryStatus = {
  rtoObjectiveHours: 2,
  rpoObjectiveHours: 1,
  lastRestoreTestIso: "2026-09-01T04:00:00.000Z",
  lastRestoreResult: "PASSED",
  automatedBackupEnabled: true,
  backupLocation: "Google Cloud Storage (Dual-Region Iowa/South Carolina)",
  killSwitches: {
    ai_gateway_enabled: true,
    partner_api_enabled: true,
    experimental_payments_enabled: false,
    sms_broadcast_enabled: true
  }
};

export default function PlatformAdminPage() {
  const [organizations] = useState<OrganizationRecord[]>(initialOrgs);
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>(initialKeys);
  const [governance] = useState<DataGovernanceRecord[]>(initialGovernance);
  const [drStatus, setDrStatus] = useState<DisasterRecoveryStatus>(initialDR);
  const [activeTab, setActiveTab] = useState<"orgs" | "apis" | "governance" | "dr">("orgs");

  const toggleKillSwitch = (key: string) => {
    setDrStatus((prev) => ({
      ...prev,
      killSwitches: {
        ...prev.killSwitches,
        [key]: !prev.killSwitches[key]
      }
    }));
  };

  const handleRevokeKey = (keyId: string) => {
    setApiKeys((prev) =>
      prev.map((k) => (k.id === keyId ? { ...k, status: "revoked" as const } : k))
    );
  };

  const getOrgTypeBadge = (type: OrganizationType) => {
    switch (type) {
      case "central_platform":
        return <span className="rounded bg-[#165D6F]/30 px-2 py-0.5 text-xs font-bold text-[#F4E6C1]">Plataforma Central</span>;
      case "cooperative":
        return <span className="rounded bg-[#10B981]/20 px-2 py-0.5 text-xs font-bold text-[#10B981]">Cooperativa Local</span>;
      case "municipality":
        return <span className="rounded bg-[#F65E01]/20 px-2 py-0.5 text-xs font-bold text-[#F65E01]">Alcaldía Municipal</span>;
      case "institution_official":
        return <span className="rounded bg-[#3B82F6]/20 px-2 py-0.5 text-xs font-bold text-[#93C5FD]">Institución Oficial</span>;
      default:
        return <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-bold text-white/70">Aliado Territorial</span>;
    }
  };

  const getClassificationBadge = (classification: DataClassification) => {
    switch (classification) {
      case "PUBLIC":
        return <span className="rounded bg-[#10B981]/20 px-2 py-0.5 text-xs font-bold text-[#10B981]">PÚBLICO</span>;
      case "INTERNAL":
        return <span className="rounded bg-[#3B82F6]/20 px-2 py-0.5 text-xs font-bold text-[#93C5FD]">INTERNO</span>;
      case "CONFIDENTIAL":
        return <span className="rounded bg-[#FBBF24]/20 px-2 py-0.5 text-xs font-bold text-[#FBBF24]">CONFIDENCIAL</span>;
      case "RESTRICTED":
        return <span className="rounded bg-[#EF4444]/20 px-2 py-0.5 text-xs font-bold text-[#EF4444]">RESTRINGIDO</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="rounded-xl border border-white/10 bg-gradient-to-r from-[#0a1b24] via-[#0d222e] to-[#08131a] p-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#165D6F] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#165D6F]" />
              </span>
              <p className="font-tech text-xs font-bold uppercase tracking-widest text-[#F65E01]">
                ENTERPRISE ARCHITECTURE &bull; GOBERNANZA &bull; FASE 10
              </p>
            </div>
            <h1 className="mt-1 font-display text-2xl font-black text-white lg:text-3xl">
              Plataforma Institucional &amp; Multi-Organización
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Gobernanza de entidades aliadas, APIs v1 para terceros, catálogo de datos y continuidad operativa nacional.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-[#10B981]/30 bg-[#10B981]/10 px-4 py-2 text-right">
              <span className="block text-[11px] font-bold uppercase text-[#9EF1D2]">Estado de Plataforma</span>
              <span className="font-tech text-sm font-bold text-white">
                🟢 MONOLITO MODULAR OPERATIVO
              </span>
            </div>
          </div>
        </div>

        {/* Global Key Metrics Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between text-white/50">
              <span className="text-xs uppercase font-medium">Organizaciones</span>
              <Building2 size={14} className="text-[#165D6F]" />
            </div>
            <p className="mt-1 font-tech text-2xl font-black text-white">{organizations.length}</p>
            <span className="text-[11px] text-[#10B981]">1 Central &bull; 3 Aliadas</span>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between text-white/50">
              <span className="text-xs uppercase font-medium">API Keys Activas</span>
              <KeyRound size={14} className="text-[#F65E01]" />
            </div>
            <p className="mt-1 font-tech text-2xl font-black text-white">
              {apiKeys.filter((k) => k.status === "active").length}
            </p>
            <span className="text-[11px] text-white/50">Con rate limiting</span>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between text-white/50">
              <span className="text-xs uppercase font-medium">Datasets Gobernados</span>
              <Database size={14} className="text-[#F4E6C1]" />
            </div>
            <p className="mt-1 font-tech text-2xl font-black text-white">{governance.length}</p>
            <span className="text-[11px] text-[#10B981]">100% auditados</span>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between text-white/50">
              <span className="text-xs uppercase font-medium">RTO / RPO Objetivo</span>
              <ShieldCheck size={14} className="text-[#10B981]" />
            </div>
            <p className="mt-1 font-tech text-2xl font-black text-white">{drStatus.rtoObjectiveHours}h / {drStatus.rpoObjectiveHours}h</p>
            <span className="text-[11px] text-[#10B981]">Backup Dual-Region</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 bg-[#061018] px-2">
        <button
          onClick={() => setActiveTab("orgs")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
            activeTab === "orgs"
              ? "border-[#F65E01] text-[#F65E01]"
              : "border-transparent text-white/60 hover:text-white"
          }`}
        >
          <Building2 size={16} /> Multi-Organizaciones ({organizations.length})
        </button>
        <button
          onClick={() => setActiveTab("apis")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
            activeTab === "apis"
              ? "border-[#F65E01] text-[#F65E01]"
              : "border-transparent text-white/60 hover:text-white"
          }`}
        >
          <KeyRound size={16} /> Partner APIs &amp; Credenciales ({apiKeys.length})
        </button>
        <button
          onClick={() => setActiveTab("governance")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
            activeTab === "governance"
              ? "border-[#F65E01] text-[#F65E01]"
              : "border-transparent text-white/60 hover:text-white"
          }`}
        >
          <Database size={16} /> Gobierno &amp; Catálogo de Datos ({governance.length})
        </button>
        <button
          onClick={() => setActiveTab("dr")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
            activeTab === "dr"
              ? "border-[#F65E01] text-[#F65E01]"
              : "border-transparent text-white/60 hover:text-white"
          }`}
        >
          <Server size={16} /> Disaster Recovery &amp; Conmutadores
        </button>
      </div>

      {/* Tab 1: Multi-Organizaciones */}
      {activeTab === "orgs" && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-3 transition-all hover:border-white/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">{org.name}</h3>
                    <p className="text-xs text-white/50">{org.legalName}</p>
                  </div>
                  {getOrgTypeBadge(org.type)}
                </div>

                <div className="space-y-1.5 border-t border-white/5 pt-3 text-xs text-white/70">
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">ID de Entidad:</span>
                    <span className="font-tech text-white">{org.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">Contacto Oficial:</span>
                    <span className="text-white">{org.contactEmail}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">Alcance Territorial:</span>
                    <span className="text-[#F4E6C1] font-semibold">{org.territories.join(", ")}</span>
                  </div>
                  {org.taxId && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/40">RUC / Cédula Fiscal:</span>
                      <span className="font-tech text-white/80">{org.taxId}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-white/5 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">Permisos Asignados:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {org.permissions.map((p) => (
                      <span key={p} className="rounded bg-white/5 px-2 py-0.5 text-[11px] text-white/80">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Partner APIs & Credenciales */}
      {activeTab === "apis" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#165D6F]/30 bg-[#165D6F]/10 p-4 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#F4E6C1]">
              <Globe size={16} /> Endpoints Públicos / Aliados Disponibles (API v1):
            </div>
            <p className="mt-1 text-white/80">
              <code>GET /api/v1/places</code> &bull; <code>GET /api/v1/territories</code>. Autenticación requerida vía encabezado <code>x-api-key</code>.
            </p>
          </div>

          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-tech text-xs text-white/50">{key.id}</span>
                      <span className={`rounded px-2 py-0.5 text-xs font-bold ${key.status === "active" ? "bg-[#10B981]/20 text-[#10B981]" : "bg-[#EF4444]/20 text-[#EF4444]"}`}>
                        {key.status.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-display text-base font-bold text-white mt-1">{key.label}</h3>
                    <p className="text-xs text-white/50">Organización: {key.organizationId}</p>
                  </div>

                  {key.status === "active" && (
                    <button
                      onClick={() => handleRevokeKey(key.id)}
                      className="rounded border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-1 text-xs font-bold text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors"
                    >
                      Revocar Clave
                    </button>
                  )}
                </div>

                <div className="grid gap-2 rounded-lg bg-black/20 p-3 text-xs sm:grid-cols-3">
                  <div>
                    <span className="text-white/40">Prefijo de Clave: </span>
                    <strong className="font-tech text-white">{key.keyPrefix}_***</strong>
                  </div>
                  <div>
                    <span className="text-white/40">Límite de Tasa: </span>
                    <strong className="font-tech text-white">{key.rateLimitPerMin} req/min</strong>
                  </div>
                  <div>
                    <span className="text-white/40">Último Uso: </span>
                    <span className="text-white/70">{key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : "Nunca"}</span>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">Scopes Autorizados:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {key.scopes.map((s) => (
                      <span key={s} className="rounded bg-[#F65E01]/10 border border-[#F65E01]/20 px-2 py-0.5 text-[11px] font-semibold text-[#F65E01]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Gobierno & Catálogo de Datos */}
      {activeTab === "governance" && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {governance.map((ds) => (
              <div
                key={ds.datasetId}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-tech text-xs text-white/40">{ds.datasetId}</span>
                    <h3 className="font-display text-base font-bold text-white">{ds.domainName}</h3>
                  </div>
                  {getClassificationBadge(ds.classification)}
                </div>

                <div className="space-y-1.5 border-t border-white/5 pt-3 text-xs text-white/70">
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">Fuente de Verdad Maestra:</span>
                    <span className="font-tech text-white">{ds.sourceOfTruth}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">Rol Propietario:</span>
                    <span className="text-white">{ds.ownerRole}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">Retención Obligatoria:</span>
                    <span className="text-white">{ds.retentionDays} días ({Math.round(ds.retentionDays / 365)} años)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">Contiene Datos Personales (PII):</span>
                    <span className={ds.containsPii ? "text-[#FBBF24] font-bold" : "text-[#10B981]"}>
                      {ds.containsPii ? "Sí (Protegido)" : "No"}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-black/20 p-2 text-xs">
                  <span className="text-white/40 font-bold">SLO de Calidad: </span>
                  <span className="text-white/80">{ds.qualitySlo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Disaster Recovery & Conmutadores */}
      {activeTab === "dr" && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
              <h3 className="font-display text-lg font-bold text-white">Objetivos de Recuperación (DR)</h3>
              <div className="space-y-2 text-xs text-white/70">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span>Recovery Time Objective (RTO):</span>
                  <strong className="text-white">{drStatus.rtoObjectiveHours} Horas</strong>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span>Recovery Point Objective (RPO):</span>
                  <strong className="text-white">{drStatus.rpoObjectiveHours} Hora</strong>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span>Última Prueba de Restauración:</span>
                  <span className="text-[#10B981] font-bold">Aprobada ({new Date(drStatus.lastRestoreTestIso).toLocaleDateString()})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Ubicación de Backups:</span>
                  <span className="text-white/50 text-[11px]">{drStatus.backupLocation}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
              <h3 className="font-display text-lg font-bold text-white">Conmutadores de Emergencia (Kill Switches)</h3>
              <div className="space-y-2">
                {Object.entries(drStatus.killSwitches).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5 text-xs">
                    <div>
                      <span className="font-tech text-white capitalize">{key.replace(/_/g, " ")}</span>
                    </div>
                    <button
                      onClick={() => toggleKillSwitch(key)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-bold transition-colors ${
                        enabled
                          ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30"
                          : "bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30"
                      }`}
                    >
                      <Power size={12} /> {enabled ? "Activo" : "Desactivado"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
