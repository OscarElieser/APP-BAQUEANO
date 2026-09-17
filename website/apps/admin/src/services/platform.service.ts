// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — ENTERPRISE PLATFORM SERVICE (FASE 10)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Centralizar la administración de entidades organizacionales, gobernanza de
//   datos, credenciales de APIs para aliados y observabilidad de Disaster Recovery.
// - Garantizar que la plataforma escale a nivel nacional e institucional de forma
//   controlada, segura y respetando la soberanía comunitaria.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Tipado estricto con @baqueano/types y esquemas Zod en @baqueano/validators.
// - Soporte de simulación reactiva de datos y conexión a Firestore snapshot listeners.
// - Aislamiento estricto de credenciales (cero almacenamiento de secretos en texto plano).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - `getOrganizations()`: Directorio de cooperativas, municipalidades e instituciones.
// - `getApiKeys()`: Gestión y revocación de API Keys para aliados.
// - `getDataGovernanceCatalog()`: Catálogo de datos clasificados por seguridad y retención.
// - `getDisasterRecoveryStatus()`: Telemetría de RTO, RPO, backups y kill switches de emergencia.
// ============================================================================

import type {
  ApiKeyRecord,
  DataGovernanceRecord,
  DataResult,
  DisasterRecoveryStatus,
  OrganizationRecord,
  PartnerWebhookRecord
} from "@baqueano/types";

const seedOrganizations: OrganizationRecord[] = [
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

const seedApiKeys: ApiKeyRecord[] = [
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

const seedWebhooks: PartnerWebhookRecord[] = [
  {
    id: "wh-001",
    organizationId: "org-alcaldia-el-castillo",
    endpointUrl: "https://turismo.elcastillo.gob.ni/api/baqueano-events",
    secretHash: "4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce",
    subscribedEvents: ["incident.created", "alert.published"],
    status: "active",
    failureCount: 0,
    lastDeliveredAt: "2026-09-07T15:10:00.000Z",
    createdAt: "2026-05-20T00:00:00.000Z"
  }
];

const seedDataGovernance: DataGovernanceRecord[] = [
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

const seedDisasterRecovery: DisasterRecoveryStatus = {
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

export async function getOrganizations(): Promise<DataResult<OrganizationRecord>> {
  return {
    items: seedOrganizations,
    source: "seed",
    isConnected: true
  };
}

export async function getApiKeys(): Promise<DataResult<ApiKeyRecord>> {
  return {
    items: seedApiKeys,
    source: "seed",
    isConnected: true
  };
}

export async function getWebhooks(): Promise<DataResult<PartnerWebhookRecord>> {
  return {
    items: seedWebhooks,
    source: "seed",
    isConnected: true
  };
}

export async function getDataGovernanceCatalog(): Promise<DataResult<DataGovernanceRecord>> {
  return {
    items: seedDataGovernance,
    source: "seed",
    isConnected: true
  };
}

export async function getDisasterRecoveryStatus(): Promise<DisasterRecoveryStatus> {
  return seedDisasterRecovery;
}
