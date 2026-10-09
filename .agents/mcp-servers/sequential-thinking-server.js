// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SEQUENTIAL THINKING & COGNITIVE REASONING MCP SERVER
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una capacidad cognitiva formal de razonamiento secuencial, diferencial
//   y de ramificación lógica para el ecosistema BAQUEANO.
// - Permitir formular hipótesis, evaluar transiciones de estado, proyectar el impacto
//   de cambios en código y planificar resoluciones complejas paso a paso antes de
//   ejecutar modificaciones de alto riesgo.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Construido sobre el SDK oficial de MCP (@modelcontextprotocol/sdk).
// - Implementa un árbol de razonamiento en memoria que registra secuencias de
//   pensamiento, ramas alternativas (branching), revisiones lógicas (revision)
//   y ajustes de estimación de profundidad de análisis (totalThoughts).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Herramientas MCP expuestas:
//   * sequential_thinking: Motor de pensamiento dinámico paso a paso que
//     evalúa hipótesis, estado, ramificación y conclusiones lógicas.
//   * get_thought_history: Recuperación del árbol de pensamientos y ramas.
//   * reset_thought_session: Reinicio de la sesión cognitiva para nuevas tareas.
// ============================================================================

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");

const thoughtHistory = [];
const branches = {};

const server = new Server(
  {
    name: "baqueano-sequential-thinking-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "sequential_thinking",
        description:
          "Ejecuta un paso de razonamiento secuencial estructurado. Utilizar para formular hipótesis, analizar cambios de estado, ramificar alternativas y evaluar lógica paso a paso.",
        inputSchema: {
          type: "object",
          properties: {
            thought: {
              type: "string",
              description: "El contenido del pensamiento, análisis o deducción lógica actual.",
            },
            thoughtNumber: {
              type: "integer",
              description: "Número ordinal del pensamiento actual en la secuencia (iniciando en 1).",
            },
            totalThoughts: {
              type: "integer",
              description: "Estimación actual del total de pensamientos requeridos (ajustable dinámicamente).",
            },
            nextThoughtNeeded: {
              type: "boolean",
              description: "Si es true, se requiere continuar con el siguiente paso de razonamiento.",
            },
            isRevision: {
              type: "boolean",
              description: "Si es true, este pensamiento revisa o corrige un paso anterior.",
            },
            revisesThought: {
              type: "integer",
              description: "Número del pensamiento que está siendo revisado o refutado.",
            },
            branchFromThought: {
              type: "integer",
              description: "Número del pensamiento origen si se está explorando una rama alternativa.",
            },
            branchId: {
              type: "string",
              description: "Identificador de la rama de análisis alternativa.",
            },
            hypothesis: {
              type: "string",
              description: "Hipótesis técnica o de arquitectura que se está evaluando.",
            },
            stateChanges: {
              type: "array",
              items: { type: "string" },
              description: "Lista de cambios de estado o efectos colaterales identificados.",
            },
          },
          required: ["thought", "thoughtNumber", "totalThoughts", "nextThoughtNeeded"],
        },
      },
      {
        name: "get_thought_history",
        description: "Obtiene el historial completo de la cadena de razonamiento y ramas activas.",
        inputSchema: {
          type: "object",
          properties: {
            branchId: {
              type: "string",
              description: "Filtrar por una rama específica (opcional).",
            },
          },
        },
      },
      {
        name: "reset_thought_session",
        description: "Limpia el árbol de pensamientos para iniciar una nueva sesión cognitiva.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      case "sequential_thinking": {
        const entry = {
          thoughtNumber: args.thoughtNumber,
          totalThoughts: args.totalThoughts,
          thought: args.thought,
          nextThoughtNeeded: args.nextThoughtNeeded,
          isRevision: Boolean(args.isRevision),
          revisesThought: args.revisesThought || null,
          branchFromThought: args.branchFromThought || null,
          branchId: args.branchId || "main",
          hypothesis: args.hypothesis || null,
          stateChanges: args.stateChanges || [],
          timestamp: new Date().toISOString(),
        };

        thoughtHistory.push(entry);

        if (args.branchId) {
          if (!branches[args.branchId]) branches[args.branchId] = [];
          branches[args.branchId].push(entry);
        }

        const progressPercent = Math.min(
          100,
          Math.round((args.thoughtNumber / Math.max(1, args.totalThoughts)) * 100)
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  status: "recorded",
                  step: `${args.thoughtNumber}/${args.totalThoughts} (${progressPercent}%)`,
                  branch: args.branchId || "main",
                  nextThoughtNeeded: args.nextThoughtNeeded,
                  activeHypothesis: args.hypothesis,
                  stateChangesRecorded: entry.stateChanges.length,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_thought_history": {
        const list = args.branchId ? branches[args.branchId] || [] : thoughtHistory;
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  totalEntries: list.length,
                  history: list,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "reset_thought_session": {
        thoughtHistory.length = 0;
        for (const k of Object.keys(branches)) delete branches[k];
        return {
          content: [{ type: "text", text: "Sesión cognitiva de pensamiento secuencial reiniciada." }],
        };
      }

      default:
        throw new Error(`Herramienta desconocida: ${name}`);
    }
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: `Error en Sequential Thinking MCP: ${error.message}` }],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`Error fatal en Sequential Thinking MCP: ${err.message}\n`);
  process.exit(1);
});
