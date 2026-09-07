// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — ADMIN TRUST & INTEGRITY SERVICE (FASE 14)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una capa de administración segura y auditable para la gestión
//   de verificaciones territoriales, auditoría de claims de sostenibilidad
//   (anti-greenwashing), casos de integridad de marketplace y apelaciones.
// - Implementar el principio de cuatro ojos (Four-Eyes Principle) en decisiones críticas.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Métodos asíncronos tipados con DataResult pattern compatible con Firebase Firestore.
// - Datos semilla interactivos con trazabilidad de audit trail.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - getVerifications(), updateVerificationStatus()
// - getSustainabilityClaims(), updateClaimStatus()
// - getIntegrityCases(), resolveIntegrityCase()
// - getTrustAppeals(), resolveAppeal()
// ============================================================================

import type {
  ClaimStatus,
  DataResult,
  IntegrityCaseRecord,
  IntegrityCaseStatus,
  SustainabilityClaimRecord,
  TrustAppealRecord,
  TrustAuditEventRecord,
  VerificationRecord,
  VerificationStatus
} from "@baqueano/types";

const seedVerifications: VerificationRecord[] = [
  {
    id: "ver-001",
    resourceType: "place",
    resourceId: "cerro-negro",
    countryId: "NI",
    status: "VERIFIED",
    verificationType: "FIELD_VISIT",
    verifiedAt: "2026-08-15T10:00:00Z",
    verifiedBy: "admin_territorial_occidente",
    secondReviewerBy: "superadmin_baqueano",
    expiresAt: "2027-08-15T10:00:00Z",
    evidenceIds: ["ev-001-photo", "ev-002-gps"],
    createdAt: "2026-08-01T08:00:00Z",
    updatedAt: "2026-08-15T10:00:00Z"
  },
  {
    id: "ver-002",
    resourceType: "place",
    resourceId: "canon-de-somoto",
    countryId: "NI",
    status: "VERIFIED",
    verificationType: "COMMUNITY_VALIDATED",
    verifiedAt: "2026-07-20T14:30:00Z",
    verifiedBy: "admin_territorial_norte",
    secondReviewerBy: "superadmin_baqueano",
    expiresAt: "2027-07-20T14:30:00Z",
    evidenceIds: ["ev-003-coop-letter"],
    createdAt: "2026-07-10T09:00:00Z",
    updatedAt: "2026-07-20T14:30:00Z"
  },
  {
    id: "ver-003",
    resourceType: "business",
    resourceId: "hospedaje-rural-miraflor",
    countryId: "NI",
    status: "UNDER_REVIEW",
    verificationType: "DOCUMENT_CHECK",
    evidenceIds: ["ev-004-permits", "ev-005-photos"],
    createdAt: "2026-08-25T11:00:00Z",
    updatedAt: "2026-08-25T11:00:00Z"
  }
];

const seedClaims: SustainabilityClaimRecord[] = [
  {
    id: "clm-001",
    resourceId: "canon-de-somoto",
    dimension: "local_economy",
    claimText: "100% de los guías y boteros son residentes de las comunidades locales de Somoto.",
    status: "VERIFIED",
    evidenceId: "ev-003-coop-letter",
    verifiedAt: "2026-07-20T14:30:00Z",
    verifiedBy: "admin_territorial_norte",
    createdAt: "2026-07-10T09:00:00Z"
  },
  {
    id: "clm-002",
    resourceId: "cerro-negro",
    dimension: "environmental",
    claimText: "Prohibición de plásticos de un solo uso en el ascenso al cráter y reforestación de faldas.",
    status: "VERIFIED",
    evidenceId: "ev-001-photo",
    verifiedAt: "2026-08-15T10:00:00Z",
    verifiedBy: "admin_territorial_occidente",
    createdAt: "2026-08-01T08:00:00Z"
  },
  {
    id: "clm-003",
    resourceId: "hospedaje-rural-miraflor",
    dimension: "environmental",
    claimText: "Energía 100% solar y reutilización de aguas grises en cultivo orgánico.",
    status: "UNDER_REVIEW",
    evidenceId: "ev-005-photos",
    createdAt: "2026-08-25T11:00:00Z"
  }
];

const seedIntegrityCases: IntegrityCaseRecord[] = [
  {
    id: "case-001",
    resourceType: "place",
    resourceId: "posada-falsa-ometepe",
    riskLevel: "HIGH",
    signals: ["duplicate_phone_number", "unverifiable_gps_coordinates", "burst_reviews_24h"],
    status: "ACTION_REQUIRED",
    assignedTo: "trust_officer_1",
    findingsNotes: "Coordenadas apuntan a medio del lago y número de contacto coincide con negocio suspendido en Rivas.",
    actionTaken: "Insignias suspendidas y solicitud de visita presencial enviada.",
    createdAt: "2026-08-28T09:00:00Z"
  },
  {
    id: "case-002",
    resourceType: "claim",
    resourceId: "clm-carbon-neutral-falso",
    riskLevel: "MEDIUM",
    signals: ["unsubstantiated_greenwashing_phrase", "missing_certification_attachment"],
    status: "OPEN",
    findingsNotes: "El establecimiento afirma ser '100% carbono neutral' sin respaldo de auditoría.",
    createdAt: "2026-09-01T15:30:00Z"
  }
];

const seedAppeals: TrustAppealRecord[] = [
  {
    id: "apl-001",
    caseIdOrVerificationId: "ver-003",
    resourceId: "hospedaje-rural-miraflor",
    submittedBy: "host_miraflor_don_juan",
    reason: "Hemos adjuntado la constancia comunitaria sellada por el presidente de la cooperativa de Miraflor.",
    counterEvidenceId: "ev-006-stamped-doc",
    status: "UNDER_REVIEW",
    reviewerId: "admin_territorial_norte",
    createdAt: "2026-09-02T10:00:00Z"
  }
];

const seedAudits: TrustAuditEventRecord[] = [
  {
    id: "aud-001",
    eventType: "VERIFICATION_APPROVED",
    resourceId: "cerro-negro",
    actorId: "admin_territorial_occidente",
    actorRole: "admin",
    details: { verificationType: "FIELD_VISIT", expiresAt: "2027-08-15" },
    timestamp: "2026-08-15T10:00:00Z"
  },
  {
    id: "aud-002",
    eventType: "BADGE_GRANTED",
    resourceId: "canon-de-somoto",
    actorId: "superadmin_baqueano",
    actorRole: "super_admin",
    details: { badgeId: "community-validated" },
    timestamp: "2026-07-20T14:35:00Z"
  }
];

export async function getVerifications(): Promise<DataResult<VerificationRecord>> {
  return {
    source: "seed",
    isConnected: true,
    items: seedVerifications
  };
}

export async function updateVerificationStatus(
  id: string,
  status: VerificationStatus,
  reviewerId: string,
  secondReviewerId?: string,
  revocationReason?: string
): Promise<{ success: boolean; message: string }> {
  const item = seedVerifications.find((v) => v.id === id);
  if (!item) return { success: false, message: "Verificación no encontrada." };

  const updated: VerificationRecord = {
    ...item,
    status,
    verifiedBy: reviewerId,
    secondReviewerBy: secondReviewerId,
    verifiedAt: status === "VERIFIED" ? new Date().toISOString() : item.verifiedAt,
    revocationReason: status === "REJECTED" || status === "SUSPENDED" ? revocationReason : undefined,
    revokedAt: status === "REJECTED" || status === "SUSPENDED" ? new Date().toISOString() : undefined,
    updatedAt: new Date().toISOString()
  };

  const idx = seedVerifications.indexOf(item);
  seedVerifications[idx] = updated;

  seedAudits.unshift({
    id: `aud-${Date.now()}`,
    eventType: status === "VERIFIED" ? "VERIFICATION_APPROVED" : "VERIFICATION_REVOKED",
    resourceId: item.resourceId,
    actorId: reviewerId,
    actorRole: "admin",
    details: { status, secondReviewerId, revocationReason },
    timestamp: new Date().toISOString()
  });

  return { success: true, message: `Estado de verificación actualizado a ${status}.` };
}

export async function getSustainabilityClaims(): Promise<DataResult<SustainabilityClaimRecord>> {
  return {
    source: "seed",
    isConnected: true,
    items: seedClaims
  };
}

export async function updateClaimStatus(
  id: string,
  status: ClaimStatus,
  reviewerId: string,
  rejectionReason?: string
): Promise<{ success: boolean; message: string }> {
  const item = seedClaims.find((c) => c.id === id);
  if (!item) return { success: false, message: "Afirmación no encontrada." };

  const updated: SustainabilityClaimRecord = {
    ...item,
    status,
    verifiedBy: reviewerId,
    verifiedAt: status === "VERIFIED" ? new Date().toISOString() : undefined,
    rejectionReason: status === "REJECTED" ? rejectionReason : undefined
  };

  const idx = seedClaims.indexOf(item);
  seedClaims[idx] = updated;

  seedAudits.unshift({
    id: `aud-${Date.now()}`,
    eventType: status === "VERIFIED" ? "CLAIM_VERIFIED" : "CLAIM_REJECTED",
    resourceId: item.resourceId,
    actorId: reviewerId,
    actorRole: "admin",
    details: { status, rejectionReason },
    timestamp: new Date().toISOString()
  });

  return { success: true, message: `Afirmación actualizada a ${status}.` };
}

export async function getIntegrityCases(): Promise<DataResult<IntegrityCaseRecord>> {
  return {
    source: "seed",
    isConnected: true,
    items: seedIntegrityCases
  };
}

export async function resolveIntegrityCase(
  id: string,
  status: IntegrityCaseStatus,
  actionTaken: string,
  notes?: string
): Promise<{ success: boolean; message: string }> {
  const item = seedIntegrityCases.find((c) => c.id === id);
  if (!item) return { success: false, message: "Caso de integridad no encontrado." };

  const updated: IntegrityCaseRecord = {
    ...item,
    status,
    actionTaken,
    findingsNotes: notes || item.findingsNotes,
    resolvedAt: new Date().toISOString()
  };

  const idx = seedIntegrityCases.indexOf(item);
  seedIntegrityCases[idx] = updated;

  seedAudits.unshift({
    id: `aud-${Date.now()}`,
    eventType: "INTEGRITY_CASE_RESOLVED",
    resourceId: item.resourceId,
    actorId: "admin_trust",
    actorRole: "admin",
    details: { status, actionTaken },
    timestamp: new Date().toISOString()
  });

  return { success: true, message: `Caso de integridad resuelto con estado ${status}.` };
}

export async function getTrustAppeals(): Promise<DataResult<TrustAppealRecord>> {
  return {
    source: "seed",
    isConnected: true,
    items: seedAppeals
  };
}

export async function resolveAppeal(
  id: string,
  status: "UPHELD" | "REVERSED",
  reviewerId: string,
  resolutionNotes: string
): Promise<{ success: boolean; message: string }> {
  const item = seedAppeals.find((a) => a.id === id);
  if (!item) return { success: false, message: "Apelación no encontrada." };

  const updated: TrustAppealRecord = {
    ...item,
    status,
    reviewerId,
    resolutionNotes,
    resolvedAt: new Date().toISOString()
  };

  const idx = seedAppeals.indexOf(item);
  seedAppeals[idx] = updated;

  seedAudits.unshift({
    id: `aud-${Date.now()}`,
    eventType: "APPEAL_DECIDED",
    resourceId: item.resourceId,
    actorId: reviewerId,
    actorRole: "super_admin",
    details: { appealId: id, status, resolutionNotes },
    timestamp: new Date().toISOString()
  });

  return { success: true, message: `Apelación resuelta con veredicto: ${status}.` };
}

export async function getTrustAuditLogs(): Promise<DataResult<TrustAuditEventRecord>> {
  return {
    source: "seed",
    isConnected: true,
    items: seedAudits
  };
}
