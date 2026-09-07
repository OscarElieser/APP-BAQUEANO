// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — RESPONSIBLE TOURISM ENGINE (BRTI v1.0.0)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proporcionar un motor científico, reproducible y libre de 'greenwashing' para
//   evaluar el compromiso y las prácticas de turismo responsable en destinos,
//   cooperativas campesinas y alojamientos aliados.
// - Evitar la discriminación involuntaria de pequeños emprendimientos rurales
//   admitiendo evidencias accesibles y de baja burocracia (visitas de campo, fotos).
// - Prohibir scores de personas o rankings destructivos: el índice es una
//   herramienta de mejora formativa y transparencia territorial.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Algoritmo determinístico con versionado explícito ('1.0.0').
// - Ponderación de 6 dimensiones fundamentales:
//   1. Economía Local Campesina (25%)
//   2. Dimensión Ambiental y Conservación (20%)
//   3. Dimensión Social y Condiciones Dignas (20%)
//   4. Protección y Respeto Cultural (15%)
//   5. Accesibilidad e Inclusión Física/Digital (10%)
//   6. Gestión Responsable y Capacidad de Carga (10%)
// - Factor de Confianza de Evidencia (Evidence Confidence Factor) basado en el
//   ratio de datos verificados por equipo territorial vs autorreportados.
// - Asignación cualitativa transparente: INICIAL, EN_DESARROLLO, COMPROMISO_ALTO, REFERENTE.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - calculateBrtiScore(): Calcula el registro completo ResponsibleTourismIndexRecord.
// - generateBrtiStrengthsAndPending(): Genera textos claros y explicativos.
// ============================================================================

import { BRTI_CONFIG } from "@baqueano/config";
import type {
  BrtiLevel,
  ResponsibleTourismIndexRecord,
  SustainabilityClaimRecord,
  SustainabilityDimension,
  VerificationRecord
} from "@baqueano/types";

export interface BrtiCalculationInput {
  readonly resourceId: string;
  readonly resourceType: "place" | "destination" | "business";
  readonly verification?: VerificationRecord | null;
  readonly claims: readonly SustainabilityClaimRecord[];
  readonly isRuralSmallholder?: boolean;
  readonly hasCommunityEndorsement?: boolean;
}

/**
 * Calcula el índice BRTI de forma determinística y genera explicaciones transparentes.
 */
export function calculateBrtiScore(input: BrtiCalculationInput): ResponsibleTourismIndexRecord {
  const verifiedClaims = input.claims.filter((c) => c.status === "VERIFIED");
  const totalClaims = input.claims.length;

  // 1. Calcular puntuación base por dimensión (0 a 100)
  const dimensionScores: Record<SustainabilityDimension, number> = {
    environmental: calculateDimensionScore("environmental", input.claims, input.verification),
    local_economy: calculateDimensionScore("local_economy", input.claims, input.verification, input.hasCommunityEndorsement),
    social: calculateDimensionScore("social", input.claims, input.verification),
    culture: calculateDimensionScore("culture", input.claims, input.verification, input.hasCommunityEndorsement),
    accessibility: calculateDimensionScore("accessibility", input.claims, input.verification),
    responsible_management: calculateDimensionScore("responsible_management", input.claims, input.verification)
  };

  // 2. Aplicar ponderaciones normativas de BRTI_CONFIG
  const weights = BRTI_CONFIG.dimensionWeights;
  let rawWeightedScore =
    dimensionScores.environmental * weights.environmental +
    dimensionScores.local_economy * weights.local_economy +
    dimensionScores.social * weights.social +
    dimensionScores.culture * weights.culture +
    dimensionScores.accessibility * weights.accessibility +
    dimensionScores.responsible_management * weights.responsible_management;

  // 3. Factor de Confianza de la Evidencia (Evidence Confidence)
  let confidenceScore = 30; // Base para autorreporte
  if (input.verification?.status === "VERIFIED") {
    confidenceScore = 95;
  } else if (input.hasCommunityEndorsement) {
    confidenceScore = 80;
  } else if (verifiedClaims.length > 0 && totalClaims > 0) {
    confidenceScore = Math.round(30 + (verifiedClaims.length / totalClaims) * 50);
  }

  // Salvaguarda de Equidad para Emprendimientos Rurales:
  if (input.isRuralSmallholder && input.hasCommunityEndorsement) {
    rawWeightedScore = Math.min(100, rawWeightedScore + 10);
    confidenceScore = Math.min(100, confidenceScore + 15);
  }

  const finalScore = Math.round(Math.min(100, Math.max(0, rawWeightedScore)));

  // 4. Asignar Nivel Cualitativo
  let level: BrtiLevel = "INICIAL";
  if (finalScore >= BRTI_CONFIG.levelThresholds.REFERENTE.min) {
    level = "REFERENTE";
  } else if (finalScore >= BRTI_CONFIG.levelThresholds.COMPROMISO_ALTO.min) {
    level = "COMPROMISO_ALTO";
  } else if (finalScore >= BRTI_CONFIG.levelThresholds.EN_DESARROLLO.min) {
    level = "EN_DESARROLLO";
  }

  // 5. Explicabilidad transparente
  const { strengths, pendingAreas } = generateBrtiStrengthsAndPending(dimensionScores, confidenceScore, input);

  return {
    id: `brti-${input.resourceId}`,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    indexVersion: BRTI_CONFIG.version,
    level,
    scoreOverall: finalScore,
    dimensionScores,
    confidenceScore,
    strengths,
    pendingAreas,
    calculatedAt: new Date().toISOString()
  };
}

function calculateDimensionScore(
  dimension: SustainabilityDimension,
  claims: readonly SustainabilityClaimRecord[],
  verification?: VerificationRecord | null,
  communityEndorsement?: boolean
): number {
  const dimensionClaims = claims.filter((c) => c.dimension === dimension);
  if (dimensionClaims.length === 0) {
    return communityEndorsement ? 50 : 35;
  }

  const verifiedCount = dimensionClaims.filter((c) => c.status === "VERIFIED").length;
  const selfReportedCount = dimensionClaims.filter((c) => c.status === "SELF_REPORTED" || c.status === "UNDER_REVIEW").length;

  let score = (verifiedCount * 30) + (selfReportedCount * 15);

  if (verification?.status === "VERIFIED") {
    score += 25;
  }
  if (communityEndorsement) {
    score += 15;
  }

  return Math.min(100, Math.max(20, score));
}

function generateBrtiStrengthsAndPending(
  dimensionScores: Record<SustainabilityDimension, number>,
  confidence: number,
  input: BrtiCalculationInput
): { strengths: string[]; pendingAreas: string[] } {
  const strengths: string[] = [];
  const pendingAreas: string[] = [];

  if (dimensionScores.local_economy >= 70) {
    strengths.push("Alto impacto en economía familiar campesina y compras directas locales.");
  }
  if (dimensionScores.environmental >= 70) {
    strengths.push("Prácticas activas de conservación ambiental y reducción de plásticos.");
  }
  if (dimensionScores.culture >= 70) {
    strengths.push("Preservación respetuosa de tradiciones culturales y patrimonio vivo.");
  }
  if (input.verification?.status === "VERIFIED") {
    strengths.push("Verificación territorial completada por el equipo Baqueano.");
  }
  if (input.hasCommunityEndorsement) {
    strengths.push("Respaldo y validación de la directiva comunal del territorio.");
  }

  if (strengths.length === 0) {
    strengths.push("Compromiso inicial con el ecoturismo sostenible.");
  }

  if (dimensionScores.accessibility < 50) {
    pendingAreas.push("Mejorar señalización informativa y opciones de accesibilidad física o sensorial.");
  }
  if (dimensionScores.responsible_management < 50) {
    pendingAreas.push("Implementar protocolo formal de monitoreo de capacidad de carga y aforo.");
  }
  if (confidence < 60) {
    pendingAreas.push("Validar evidencias fotográficas o documentales con el equipo territorial.");
  }

  if (pendingAreas.length === 0) {
    pendingAreas.push("Mantener la actualización periódica de evidencias anuales.");
  }

  return { strengths, pendingAreas };
}
