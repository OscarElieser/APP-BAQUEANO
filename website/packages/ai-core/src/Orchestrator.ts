import { AgentRole, AGENT_REGISTRY } from "./AgentRegistry";
import { genkitProvider, OrchestratorResultSchemaType } from "./providers/GenkitProvider";

export type OrchestratorTask = {
  id: string;
  taskType: "REVIEW_DESTINATION" | "REVIEW_BUSINESS" | "REVIEW_PAGE";
  resourceId: string;
  adminUid: string;
  contextData?: any;
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
   * Ejecuta la orquestación utilizando GenkitProvider (Gemini).
   */
  public async executeTask(task: OrchestratorTask): Promise<OrchestratorResultSchemaType> {
    const agents = this.selectAgentsForTask(task.taskType);
    console.log(`[Orchestrator] Delegando tarea ${task.id} a los agentes:`, agents.join(", "));

    const taskDescription = `Por favor revisa el recurso ${task.resourceId} de tipo ${task.taskType}.`;
    
    // Llamada real al LLM a través de Genkit
    const result = await genkitProvider.evaluateTask(
      taskDescription, 
      task.contextData || { notice: "No context provided." }, 
      agents
    );

    return result;
  }
}

export const orchestrator = new AIOrchestrator();

