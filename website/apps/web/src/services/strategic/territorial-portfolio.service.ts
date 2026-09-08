// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PORTAFOLIO TERRITORIAL (territorial-portfolio.service.ts)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Permitir analizar los departamentos y regiones de Nicaragua como un portafolio
//   holístico de desarrollo ecoturístico y cultural.
// - Erradicar el "Territory Shaming" y los índices reduccionistas (como "72/100"):
//   un territorio con baja cobertura digital no es un "territorio malo", sino una
//   oportunidad prioritaria de documentación comunitaria e inclusión digital.
// - Presentar el análisis como una herramienta de soporte analítico ("ANALYSIS"),
//   NUNCA como asesoría financiera ni recomendación automática de inversión.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Evaluación Multidimensional: Clasifica cada territorio en 5 dimensiones independientes
//   (Coverage, Trust, Accessibility, Demand, Sustainability) con estados legibles
//   (Strong, Moderate, Developing, Limited data, Partial evidence, Insufficient data).
// - Cuadrantes Estratégicos: Permite cruzar Demanda vs Capacidad, Cobertura vs Potencial,
//   y Confianza vs Demanda sin etiquetas prescriptivas ("ganadores" vs "perdedores").
//
// 📦 3. QUÉ (WHAT / MÉTODOS EXPUESTOS):
// - getTerritoryProfiles(): Obtiene los perfiles de portafolio para un país o región.
// - getTerritoryProfileById(): Obtiene el perfil detallado de un departamento o región.
// - evaluateTerritorialOpportunity(): Sintetiza oportunidades de investigación y campo.
// - getPortfolioMatrix(): Agrupa territorios en cuadrantes de balance estratégico.
// ============================================================================

import {
  type ConfidenceLevel,
  type TerritoryDimensionRating,
  type TerritoryPortfolioProfile
} from "@baqueano/types";
import { TERRITORIAL_PORTFOLIO_DEFAULTS } from "@baqueano/config";

export interface TerritorialMatrixQuadrant {
  readonly quadrantName: string;
  readonly description: string;
  readonly territories: readonly TerritoryPortfolioProfile[];
}

export class TerritorialPortfolioService {
  private profiles: Map<string, TerritoryPortfolioProfile> = new Map();

  constructor(customProfiles?: readonly TerritoryPortfolioProfile[]) {
    const seed = customProfiles ?? TERRITORIAL_PORTFOLIO_DEFAULTS;
    for (const profile of seed) {
      this.profiles.set(profile.territoryId, profile);
    }
  }

  /**
   * Obtiene todos los perfiles de portafolio territorial para el país solicitado.
   */
  public getTerritoryProfiles(countryId: string = "NI"): readonly TerritoryPortfolioProfile[] {
    return Array.from(this.profiles.values()).filter((p) => p.countryId === countryId);
  }

  /**
   * Obtiene el perfil multidimensional de un territorio específico.
   */
  public getTerritoryProfileById(territoryId: string): TerritoryPortfolioProfile | null {
    return this.profiles.get(territoryId) ?? null;
  }

  /**
   * Sintetiza las oportunidades territoriales basadas en evidencia y datos de campo.
   */
  public evaluateTerritorialOpportunity(territoryId: string): {
    readonly territoryId: string;
    readonly territoryName: string;
    readonly focusArea: "FIELD_DOCUMENTATION" | "CAPACITY_MANAGEMENT" | "TRUST_RENEWAL" | "SERVICE_ACCESSIBILITY";
    readonly narrative: string;
    readonly recommendedActions: readonly string[];
    readonly confidence: ConfidenceLevel;
  } | null {
    const profile = this.profiles.get(territoryId);
    if (!profile) return null;

    if (profile.coverageRating === "Developing" || profile.coverageRating === "Limited data") {
      return {
        territoryId: profile.territoryId,
        territoryName: profile.territoryName,
        focusArea: "FIELD_DOCUMENTATION",
        narrative: "Territorio con alto patrimonio natural y cultural pero con baja representación en el mapa digital.",
        recommendedActions: [
          "Coordinar brigada de relevamiento de campo con cooperativas agroecológicas.",
          "Registrar puntos de interés y micro-talleres artesanales.",
          "Verificar vías de acceso y cobertura de telecomunicaciones."
        ],
        confidence: profile.dataConfidence
      };
    }

    if (profile.demandRating === "Strong" && profile.sustainabilityRating === "Moderate") {
      return {
        territoryId: profile.territoryId,
        territoryName: profile.territoryName,
        focusArea: "CAPACITY_MANAGEMENT",
        narrative: "Territorio con alta atracción de visitantes; requiere monitoreo de capacidad de carga para evitar saturación de senderos y micro-cuencas.",
        recommendedActions: [
          "Promocionar destinos alternativos en municipios contiguos.",
          "Instalar sensores de afluencia o Smart Points de conteo en accesos principales.",
          "Fomentar reservas con cupos escalonados por franja horaria."
        ],
        confidence: profile.dataConfidence
      };
    }

    return {
      territoryId: profile.territoryId,
      territoryName: profile.territoryName,
      focusArea: "TRUST_RENEWAL",
      narrative: "Territorio con balance operativo estable; priorizar actualización periódica de fichas y certificaciones comunitarias.",
      recommendedActions: [
        "Auditar fichas con más de 180 días sin revisión.",
        "Facilitar capacitaciones en uso del portal de anfitriones Baqueano."
      ],
      confidence: profile.dataConfidence
    };
  }

  /**
   * Construye la matriz de cuadrantes estratégicos de Demanda vs Capacidad/Sostenibilidad.
   */
  public getDemandCapacityMatrix(countryId: string = "NI"): readonly TerritorialMatrixQuadrant[] {
    const territories = this.getTerritoryProfiles(countryId);

    const highDemandHighSustainability: TerritoryPortfolioProfile[] = [];
    const highDemandDevelopingSustainability: TerritoryPortfolioProfile[] = [];
    const moderateDemandHighSustainability: TerritoryPortfolioProfile[] = [];
    const moderateDemandDevelopingCoverage: TerritoryPortfolioProfile[] = [];

    for (const t of territories) {
      const isHighDemand = t.demandRating === "Strong";
      const isHighSust = t.sustainabilityRating === "Strong";

      if (isHighDemand && isHighSust) {
        highDemandHighSustainability.push(t);
      } else if (isHighDemand && !isHighSust) {
        highDemandDevelopingSustainability.push(t);
      } else if (!isHighDemand && isHighSust) {
        moderateDemandHighSustainability.push(t);
      } else {
        moderateDemandDevelopingCoverage.push(t);
      }
    }

    return [
      {
        quadrantName: "Ejes Consolidados & Resilientes",
        description: "Alta demanda turística respaldada por sólidas prácticas sostenibles y comunitarias.",
        territories: highDemandHighSustainability
      },
      {
        quadrantName: "Zonas de Atención a Capacidad",
        description: "Alta demanda con necesidad de monitoreo continuo de capacidad de carga y redistribución.",
        territories: highDemandDevelopingSustainability
      },
      {
        quadrantName: "Santuarios de Conservación & Ecoturismo",
        description: "Excelente desempeño ecológico y cultural con flujos moderados y controlados.",
        territories: moderateDemandHighSustainability
      },
      {
        quadrantName: "Oportunidades de Inclusión Digital",
        description: "Territorios en desarrollo con necesidad de mayor documentación y relevamiento de campo.",
        territories: moderateDemandDevelopingCoverage
      }
    ];
  }
}

export const territorialPortfolioService = new TerritorialPortfolioService();
