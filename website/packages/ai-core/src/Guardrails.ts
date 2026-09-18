export class Guardrails {
  /**
   * Previene acciones críticas automatizadas por la IA sin intervención humana.
   */
  static sensitiveActionGuard(action: string): boolean {
    const blockedActions = [
      "DELETE", 
      "CHANGE_ROLE", 
      "APPROVE_BUSINESS", 
      "PUBLISH_DESTINATION", 
      "APPROVE_PAYMENT", 
      "MODIFY_SECURITY_RULES"
    ];
    
    if (blockedActions.includes(action.toUpperCase())) {
      console.warn(`[Guardrails] Acción ${action} bloqueada. Requiere confirmación humana.`);
      return false; // Bloqueado
    }
    return true; // Permitido
  }

  /**
   * Evita bucles infinitos en la delegación de agentes.
   */
  static loopGuard(delegationCount: number, maxDelegations: number = 5): boolean {
    if (delegationCount >= maxDelegations) {
      console.warn(`[Guardrails] Límite de delegaciones alcanzado (${delegationCount}/${maxDelegations}). Abortando.`);
      return false;
    }
    return true;
  }

  /**
   * Verifica que la IA no haya intentado inventar datos esenciales requeridos por el esquema.
   */
  static hallucinationGuard(data: any, requiredKeys: string[]): boolean {
    for (const key of requiredKeys) {
      if (data[key] === undefined || data[key] === null || data[key] === "") {
        console.warn(`[Guardrails] Posible alucinación o data incompleta: falta el campo '${key}'.`);
        return false;
      }
    }
    return true;
  }
}
