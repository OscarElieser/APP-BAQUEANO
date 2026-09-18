import { genkit } from 'genkit';
import { googleAI, gemini15Flash, gemini15Pro } from '@genkit-ai/googleai';
import { z } from 'zod';
import { AgentRole } from '../AgentRegistry';

export const ai = genkit({
  plugins: [googleAI()],
});

export const OrchestratorResultSchema = z.object({
  success: z.boolean(),
  actionRecommended: z.enum(["APPROVE", "REJECT", "REQUIRES_FIXES"]),
  summary: z.string(),
  agentReports: z.array(
    z.object({
      agentRole: z.string(),
      status: z.enum(["PASS", "WARNING", "FAIL"]),
      message: z.string()
    })
  )
});

export type OrchestratorResultSchemaType = z.infer<typeof OrchestratorResultSchema>;

export class GenkitProvider {
  /**
   * Ejecuta un prompt a través del orquestador usando Gemini.
   */
  async evaluateTask(
    taskDescription: string, 
    contextData: any, 
    agents: AgentRole[]
  ): Promise<OrchestratorResultSchemaType> {
    const prompt = `
      Eres el BAQUEANO AI Orchestrator. 
      Tienes la tarea de evaluar el siguiente contexto en base a los agentes especializados que te acompañan.
      
      Agentes Involucrados: ${agents.join(", ")}
      
      Contexto/Data:
      ${JSON.stringify(contextData, null, 2)}
      
      Instrucción/Tarea:
      ${taskDescription}
      
      Debes devolver un JSON estructurado de acuerdo al esquema indicado, donde cada agente entregue su estado (PASS, WARNING, FAIL) y un mensaje.
    `;

    try {
      const response = await ai.generate({
        model: gemini15Flash,
        prompt: prompt,
        output: {
          schema: OrchestratorResultSchema,
        }
      });
      
      return response.output();
    } catch (error) {
      console.error("[GenkitProvider] Error executing Gemini:", error);
      throw new Error("Failed to evaluate task with AI.");
    }
  }
}

export const genkitProvider = new GenkitProvider();
