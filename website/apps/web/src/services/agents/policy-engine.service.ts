// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — AGENT ACTION POLICY ENGINE (FASE 15)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Evaluar de forma totalmente independiente del modelo de lenguaje la legitimidad,
//   nivel de riesgo y requisitos de confirmación humana de cada acción o herramienta.
// - Impedir que ninguna instrucción de prompt o dato externo pueda alterar
//   las reglas de autorización del backend o acceder a recursos no autorizados.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Motor de reglas determinísticas con 5 niveles de autonomía normativos:
//   - Level 0 (Read / Info): ALLOW inmediato.
//   - Level 1 (Prepare): ALLOW para generar borradores sin impacto de persistencia.
//   - Level 2 (Reversible): REQUIRE_CONFIRMATION (ej. guardar favorito/borrador).
//   - Level 3 (Sensitive): REQUIRE_CONFIRMATION con previsualización explícita.
//   - Level 4 (Prohibited): DENY incondicional (pagos, cambios de rol, borrados masivos).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - evaluateAgentAction(): Retorna ALLOW, DENY, REQUIRE_CONFIRMATION o REQUIRE_REAUTH.
// ============================================================================

import { AGENT_TOOL_PERMISSIONS_CATALOG } from "@baqueano/config";
import type {
  AgentActionPolicyDecision,
  AgentAutonomyLevel,
  UserRole
} from "@baqueano/types";

export interface ActionPolicyEvaluationContext {
  readonly actorRole: UserRole;
  readonly userId: string;
  readonly countryId?: string;
  readonly organizationId?: string;
  readonly isFinancialOperation?: boolean;
  readonly isRoleElevationOperation?: boolean;
  readonly isCriticalDeletionOperation?: boolean;
}

/**
 * Evalúa si una acción de un agente está permitida y si requiere intervención humana (HITL).
 */
export function evaluateAgentAction(
  toolId: string,
  context: ActionPolicyEvaluationContext
): { decision: AgentActionPolicyDecision; autonomyLevel: AgentAutonomyLevel; reason: string } {
  // 1. Reglas Absolutas Prohibitivas (Nivel 4)
  if (context.isFinancialOperation) {
    return {
      decision: "DENY",
      autonomyLevel: "LEVEL_4_PROHIBITED",
      reason: "La IA tiene terminantemente prohibido autorizar movimientos monetarios o pagos automáticos."
    };
  }

  if (context.isRoleElevationOperation) {
    return {
      decision: "DENY",
      autonomyLevel: "LEVEL_4_PROHIBITED",
      reason: "La asignación o modificación de roles de usuario requiere intervención exclusiva de un Super Admin autenticado."
    };
  }

  if (context.isCriticalDeletionOperation) {
    return {
      decision: "DENY",
      autonomyLevel: "LEVEL_4_PROHIBITED",
      reason: "La eliminación de registros históricos de auditoría o recursos críticos está prohibida para agentes."
    };
  }

  // 2. Buscar definición de la herramienta en el catálogo normativo
  const toolDef = AGENT_TOOL_PERMISSIONS_CATALOG.find((t) => t.toolId === toolId);
  if (!toolDef) {
    return {
      decision: "DENY",
      autonomyLevel: "LEVEL_4_PROHIBITED",
      reason: `La herramienta '${toolId}' no está registrada en el catálogo de permisos autorizados.`
    };
  }

  // 3. Verificar roles permitidos
  if (!toolDef.allowedRoles.includes(context.actorRole)) {
    return {
      decision: "DENY",
      autonomyLevel: toolDef.autonomyLevel,
      reason: `El rol '${context.actorRole}' no tiene permisos para invocar '${toolDef.name}'.`
    };
  }

  // 4. Determinar nivel de autonomía y decisión
  const level = toolDef.autonomyLevel as AgentAutonomyLevel;
  switch (level) {
    case "LEVEL_0_READ":
      return {
        decision: "ALLOW",
        autonomyLevel: "LEVEL_0_READ",
        reason: "Herramienta de solo lectura; permitida sin confirmación adicional."
      };

    case "LEVEL_1_PREPARE":
      return {
        decision: "ALLOW",
        autonomyLevel: "LEVEL_1_PREPARE",
        reason: "Herramienta de preparación de borrador; no ejecuta cambios persistentes en producción."
      };

    case "LEVEL_2_REVERSIBLE":
      return {
        decision: "REQUIRE_CONFIRMATION",
        autonomyLevel: "LEVEL_2_REVERSIBLE",
        reason: "Acción de escritura reversible; requiere confirmación simple del usuario."
      };

    case "LEVEL_3_SENSITIVE":
      return {
        decision: "REQUIRE_CONFIRMATION",
        autonomyLevel: "LEVEL_3_SENSITIVE",
        reason: "Acción de impacto sensible; requiere confirmación explícita con previsualización detallada."
      };

    case "LEVEL_4_PROHIBITED":
    default:
      return {
        decision: "DENY",
        autonomyLevel: "LEVEL_4_PROHIBITED",
        reason: "Operación catalogada como no permitida para ejecución por agentes."
      };
  }
}
