import { AgentRole, AGENT_REGISTRY } from "./AgentRegistry";

export type OrchestratorTask = {
  id: string;
  taskType: "REVIEW_DESTINATION" | "REVIEW_BUSINESS" | "REVIEW_PAGE";
  resourceId: string;
  adminUid: string;
};

export type OrchestratorResult = {
  success: boolean;
  actionRecommended: "APPROVE" | "REJECT" | "REQUIRES_FIXES";
  summary: string;
  agentReports: Array<{
    agentRole: AgentRole;
    status: "PASS" | "WARNING" | "FAIL";
    message: string;
  }>;
};

export class AIOrchestrator {
  /**
   * Determina qué agentes especializados invocar en base al tipo de tarea.
   */
  private selectAgentsForTask(taskType: OrchestratorTask["taskType"]): AgentRole[] {
    switch (taskType) {
      case "REVIEW_DESTINATION":
        return ["Destination_AI", "Geo_AI", "Content_AI", "SEO_AI"];
      case "REVIEW_BUSINESS":
        return ["Business_AI", "Verification_AI", "Geo_AI", "Media_AI", "Security_AI"];
      case "REVIEW_PAGE":
        return ["Content_AI", "SEO_AI", "Media_AI"];
      default:
        return [];
    }
  }

  /**
   * Ejecuta la orquestación (simulada por ahora hasta conectar un proveedor de IA).
   */
  public async executeTask(task: OrchestratorTask): Promise<OrchestratorResult> {
    const agents = this.selectAgentsForTask(task.taskType);
    console.log(`[Orchestrator] Delegando tarea ${task.id} a los agentes:`, agents.join(", "));

    // Aquí iría el fan-out a los distintos agentes para que evalúen el contexto
    // utilizando LLMs y tools específicas (RAG, etc.)
    // Simulamos una respuesta consolidada:

    const reports = agents.map(role => {
      // Simulación básica: si es SEO_AI siempre encuentra un warning de ejemplo
      if (role === "SEO_AI") {
        return { agentRole: role, status: "WARNING" as const, message: "Falta meta description." };
      }
      return { agentRole: role, status: "PASS" as const, message: "Revisión exitosa." };
    });

    const hasWarnings = reports.some(r => r.status === "WARNING" || r.status === "FAIL");

    return {
      success: true,
      actionRecommended: hasWarnings ? "REQUIRES_FIXES" : "APPROVE",
      summary: hasWarnings 
        ? "El recurso está operativamente completo, pero requiere ajustes antes de la publicación." 
        : "El recurso cumple con todos los criterios de calidad.",
      agentReports: reports
    };
  }
}

export const orchestrator = new AIOrchestrator();
