// ============================================================================
// 🤖 MOTOR IA GENKIT & GEMINI 1.5 FLASH — "EL BAQUEANO MAYOR" (INDEX.JS)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una suite de capacidades de Inteligencia Artificial Generativa
//   (conversación multi-turno, streaming, salidas estructuradas Zod,
//   análisis multimodal de imágenes de senderos y llamadas a herramientas/tools)
//   para conectar a exploradores con el ecoturismo de Nicaragua.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Implementa Google Gemini 1.5 Flash mediante `@genkit-ai/googleai` y `genkit`.
// - Soporte para `generateStream()`, schemas estrictos Zod y llamadas a funciones
//   locales (`ai.defineTool`) para consulta en tiempo real de catálogo y clima.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FLUJOS EXPUESTOS):
// - `helloFlow`: Verificación básica de conexión.
// - `baqueanoExplorerFlow`: Generador de itinerarios estructurados bimoneda (USD/NIO).
// - `chatWithBaqueanoFlow`: Chat interactivo multi-turno con personalidad auténtica.
// - `inspectTrailMediaFlow`: Reconocimiento visual de senderos y fauna/flora.
// - `lookupDestinationTool`: Herramienta de consulta de datos locales.
// ============================================================================

import { gemini15Flash, googleAI } from '@genkit-ai/googleai';
import { genkit, z } from 'genkit';

// Configuración de la instancia central de Genkit con soporte para Dotprompt (.prompt)
export const ai = genkit({
  plugins: [googleAI()],
  model: gemini15Flash,
  promptDir: './prompts',
});

// ----------------------------------------------------------------------------
// 🛠️ 1. HERRAMIENTAS / TOOL CALLING (FUNCTION CALLING)
// ----------------------------------------------------------------------------
export const lookupDestinationTool = ai.defineTool(
  {
    name: 'lookupDestinationTool',
    description: 'Busca detalles oficiales de rutas y senderos en Nicaragua',
    inputSchema: z.object({
      department: z.string().describe('Departamento o región de Nicaragua (ej: Madriz, León, Rivas, Matagalpa)'),
    }),
    outputSchema: z.array(
      z.object({
        name: z.string(),
        category: z.string(),
        avgPriceUsd: z.number(),
        difficulty: z.string(),
      })
    ),
  },
  async (input) => {
    // Base de datos de referencia rápida para el modelo
    const catalog = [
      { name: 'Cañón de Somoto', category: 'Cañones & Ríos', avgPriceUsd: 25.0, difficulty: 'Moderado', dept: 'Madriz' },
      { name: 'Volcán Cerro Negro Sandboarding', category: 'Volcanes', avgPriceUsd: 35.0, difficulty: 'Exigente', dept: 'León' },
      { name: 'Cascada La Luna', category: 'Cascadas', avgPriceUsd: 15.0, difficulty: 'Fácil', dept: 'Matagalpa' },
      { name: 'Volcán Concepción & Maderas', category: 'Volcanes', avgPriceUsd: 40.0, difficulty: 'Exigente', dept: 'Rivas' },
      { name: 'Playa Popoyo Surf Reserve', category: 'Playas', avgPriceUsd: 20.0, difficulty: 'Moderado', dept: 'Rivas' },
    ];

    const results = catalog.filter((c) =>
      c.dept.toLowerCase().includes(input.department.toLowerCase())
    );

    return results.length > 0 ? results : catalog.slice(0, 2);
  }
);

// ----------------------------------------------------------------------------
// ⚡ 2. FLUJO: PRUEBA DE CONEXIÓN (HELLO FLOW)
// ----------------------------------------------------------------------------
export const helloFlow = ai.defineFlow('helloFlow', async (name) => {
  const { text } = await ai.generate(`Hello Gemini, my name is ${name}`);
  console.log(`[HelloFlow Response]: ${text}`);
  return text;
});

// ----------------------------------------------------------------------------
// 📋 3. FLUJO: GENERADOR DE ITINERARIOS ESTRUCTURADOS (ZOD SCHEMA)
// ----------------------------------------------------------------------------
export const ItinerarySchema = z.object({
  itineraryTitle: z.string().describe('Título atractivo de la expedición'),
  department: z.string().describe('Departamento o región'),
  summary: z.string().describe('Resumen del recorrido'),
  daysSchedule: z.array(
    z.object({
      dayNumber: z.number(),
      activities: z.array(z.string()),
      mealsRecommendation: z.string(),
    })
  ),
  estimatedBudgetUsd: z.coerce.number().describe('Presupuesto total en dólares'),
  estimatedBudgetNio: z.coerce.number().describe('Presupuesto total en córdobas'),
  communityImpactNote: z.string().describe('Cómo este viaje apoya a las familias campesinas'),
  safetyGuidelines: z.array(z.string()),
});

export const baqueanoExplorerFlow = ai.defineFlow(
  {
    name: 'baqueanoExplorerFlow',
    inputSchema: z.object({
      query: z.string().describe('Consulta o ruta deseada'),
      days: z.number().optional().default(2),
      budgetUsd: z.number().optional(),
      difficulty: z.enum(['Fácil', 'Moderado', 'Exigente']).optional().default('Moderado'),
    }),
    outputSchema: ItinerarySchema,
  },
  async (input) => {
    const prompt = `Actúa como "El Baqueano Mayor", maestro de senderismo campesino y ecoturismo en Nicaragua.
El explorador busca:
- Solicitud: "${input.query}"
- Días: ${input.days}
- Presupuesto en USD: ${input.budgetUsd ? '$' + input.budgetUsd : 'Flexible'}
- Nivel físico: ${input.difficulty}

Genera un itinerario estructurado completo. Realiza los cálculos financieros exactos considerando un tipo de cambio oficial de 36.65 Córdobas por 1 USD.`;

    const { output } = await ai.generate({
      prompt,
      tools: [lookupDestinationTool],
      output: { schema: ItinerarySchema },
      config: {
        temperature: 0.7,
        maxOutputTokens: 1500,
      },
    });

    return output;
  }
);

// ----------------------------------------------------------------------------
// 💬 4. FLUJO: CHAT CONVERSACIONAL MULTI-TURNO
// ----------------------------------------------------------------------------
export const chatWithBaqueanoFlow = ai.defineFlow(
  {
    name: 'chatWithBaqueanoFlow',
    inputSchema: z.object({
      messages: z.array(
        z.object({
          role: z.enum(['user', 'model', 'system']),
          content: z.string(),
        })
      ),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    const systemPrompt = `Eres "El Baqueano Mayor", un guía auténtico, cálido y sabio de Nicaragua. Conoces cada quebrada, volcán, bosque de niebla y camino de herradura.
Tu misión es guiar al explorador, promover el consumo local campesino sin intermediarios y brindar consejos de seguridad claros y amigables.`;

    const formattedMessages = input.messages.map((m) => ({
      role: m.role,
      content: [{ text: m.content }],
    }));

    const response = await ai.generate({
      system: systemPrompt,
      messages: formattedMessages,
      tools: [lookupDestinationTool],
    });

    return response.text;
  }
);

// ----------------------------------------------------------------------------
// 📷 5. FLUJO MULTIMODAL: INSPECCIÓN DE SENDEROS Y FLORA/FAUNA
// ----------------------------------------------------------------------------
export const inspectTrailMediaFlow = ai.defineFlow(
  {
    name: 'inspectTrailMediaFlow',
    inputSchema: z.object({
      imageUrl: z.string().describe('URL pública o data URL de la imagen'),
      question: z.string().optional().default('¿Qué sendero, flora o elemento geográfico de Nicaragua se observa en esta imagen y qué recomendaciones de seguridad sugieres?'),
    }),
    outputSchema: z.object({
      identification: z.string(),
      landscapeType: z.string(),
      safetyWarning: z.string(),
      recommendedGear: z.array(z.string()),
    }),
  },
  async (input) => {
    const prompt = [
      { media: { url: input.imageUrl } },
      { text: input.question },
    ];

    const { output } = await ai.generate({
      prompt,
      system: 'Eres un experto naturalista y guía de montaña de Nicaragua con amplio conocimiento en volcanología y botánica.',
      output: {
        schema: z.object({
          identification: z.string(),
          landscapeType: z.string(),
          safetyWarning: z.string(),
          recommendedGear: z.array(z.string()),
        }),
      },
    });

    return output;
  }
);

// ----------------------------------------------------------------------------
// 👑 6. FLUJO PRO MAESTRO: ASESOR TURÍSTICO INTEGRAL (10 MÓDULOS)
// ----------------------------------------------------------------------------
export const baqueanoMasterFlow = ai.defineFlow(
  {
    name: 'baqueanoMasterFlow',
    inputSchema: z.object({
      userPrompt: z.string().describe('Consulta o solicitud del explorador'),
      originCity: z.string().optional().describe('Ciudad o país de origen'),
      travelDates: z.string().optional().describe('Fechas o temporada estimada'),
      travelersCount: z.number().optional().default(1).describe('Cantidad de personas'),
      budgetUsd: z.number().optional().describe('Presupuesto disponible en USD'),
      travelStyle: z.string().optional().default('Equilibrado').describe('Estilo de viaje: Económico, Equilibrado, Lujo/Confort'),
    }),
    outputSchema: z.object({
      destinationOverview: z.object({
        destination: z.string(),
        department: z.string(),
        bestSeason: z.string(),
      }),
      itinerary: z.object({
        days: z.array(
          z.object({
            dayNumber: z.number(),
            morningActivity: z.string(),
            afternoonActivity: z.string(),
            eveningActivity: z.string(),
            mealsAndGastronomy: z.string(),
            stayRecommendation: z.string(),
          })
        ),
      }),
      budgetBreakdown: z.object({
        economicTierUsd: z.number(),
        balancedTierUsd: z.number(),
        luxuryTierUsd: z.number(),
        exchangeRateNio: z.number(),
        totalNioEquivalent: z.number(),
      }),
      communityAndSafety: z.object({
        communityImpact: z.string(),
        safetyTips: z.array(z.string()),
        emergencyContactNote: z.string(),
        packingList: z.array(z.string()),
      }),
      finalRecommendation: z.string(),
    }),
  },
  async (input) => {
    const masterPrompt = ai.prompt('baqueano_master');
    const { output } = await masterPrompt({
      userPrompt: input.userPrompt,
      originCity: input.originCity,
      travelDates: input.travelDates,
      travelersCount: input.travelersCount,
      budgetUsd: input.budgetUsd,
      travelStyle: input.travelStyle,
    });
    return output;
  }
);

// Auto-ejecución si se lanza directamente con Node
if (process.argv[1]?.endsWith('index.js')) {
  console.log('🤖 Servidor Baqueano Genkit listo con 10 Módulos de Asesoría Turística.');
  console.log('💡 Ejecuta "npx genkit start" para abrir el panel visual de control de IA en tu navegador.');
}
