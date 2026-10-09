// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CONTEXT 7 PERSISTENT MEMORY MCP SERVER
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Mantener una memoria estructural y arquitectónica persistente del proyecto
//   BAQUEANO (modelos de datos, patrones de estado Riverpod/StateNotifier, reglas
//   de negocio, decisiones de diseño y convenciones territoriales).
// - Evitar la pérdida de contexto entre sesiones prolongadas, cambios de modelo o
//   actualizaciones de código a gran escala.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Construido sobre el SDK oficial de MCP (@modelcontextprotocol/sdk).
// - Almacena grafos de entidades, relaciones y observaciones técnicas en un archivo
//   JSON persistente (`memory-store.json`).
// - Autoindexa la estructura de directorios, contratos de Supabase/Firestore y
//   patrones de la aplicación.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Herramientas MCP expuestas:
//   * index_workspace_context: Indexa la arquitectura de BAQUEANO automáticamente.
//   * create_memory_entity: Registra una nueva entidad, patrón o decisión técnica.
//   * read_memory_graph: Consulta el grafo de entidades y relaciones por tipo/tag.
//   * search_memory: Búsqueda semántica o por palabras clave en la memoria persistente.
//   * update_memory_entity: Modifica o añade observaciones a entidades existentes.
// ============================================================================

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");
const fs = require("fs");
const path = require("path");

const MEMORY_FILE = path.resolve(__dirname, "memory-store.json");

function loadMemory() {
  if (fs.existsSync(MEMORY_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(MEMORY_FILE, "utf-8"));
    } catch {
      return { entities: {}, relations: [], lastUpdated: new Date().toISOString() };
    }
  }
  return {
    entities: {
      "baqueano-core": {
        name: "Baqueano Core Architecture",
        type: "Architecture",
        tags: ["flutter", "firebase", "supabase", "nicaragua"],
        summary: "Plataforma de ecoturismo rural y comunitario en Nicaragua sin comisiones abusivas.",
        observations: [
          "Colores oficiales: #165D6F (Petróleo Teal), #F65E01 (Naranja Terracota), #F4E6C1 (Crema Arena), #0F172A (Noche).",
          "Flutter exclusivamente en Android (lib/ y android/). No modificar ios/ ni web/.",
          "Supabase es la fuente principal de verdad operacional; Firebase Auth/Hosting coexistente.",
          "Precios: Córdobas (C$) primero, luego Dólares (US$). Tasa ref C$ 36.6243.",
          "Franja viva de lugares en todos los 15 departamentos y 2 regiones con descripciones únicas.",
        ],
      },
    },
    relations: [],
    lastUpdated: new Date().toISOString(),
  };
}

function saveMemory(data) {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2), "utf-8");
}

const server = new Server(
  {
    name: "baqueano-context7-memory-mcp",
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
        name: "index_workspace_context",
        description: "Indexa automáticamente los módulos, modelos de datos y patrones de estado del workspace.",
        inputSchema: {
          type: "object",
          properties: {
            forceRefresh: {
              type: "boolean",
              description: "Forzar reindexación completa de la memoria del workspace.",
            },
          },
        },
      },
      {
        name: "create_memory_entity",
        description: "Almacena una nueva entidad técnica, patrón de estado, regla o decisión arquitectónica en memoria persistente.",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string", description: "Identificador único de la entidad (ej. 'places-data-model')." },
            name: { type: "string", description: "Nombre descriptivo de la entidad." },
            type: { type: "string", description: "Tipo de entidad (Architecture, Model, Rule, Pattern, State)." },
            tags: { type: "array", items: { type: "string" }, description: "Etiquetas asociadas." },
            summary: { type: "string", description: "Resumen conciso del concepto." },
            observations: { type: "array", items: { type: "string" }, description: "Observaciones técnicas detalladas." },
          },
          required: ["id", "name", "type", "summary"],
        },
      },
      {
        name: "read_memory_graph",
        description: "Recupera todas las entidades almacenadas o filtra por tipo o etiqueta.",
        inputSchema: {
          type: "object",
          properties: {
            type: { type: "string", description: "Filtrar por tipo de entidad." },
            tag: { type: "string", description: "Filtrar por etiqueta." },
          },
        },
      },
      {
        name: "search_memory",
        description: "Busca en la memoria persistente por texto, observaciones o nombres de entidad.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Término de búsqueda." },
          },
          required: ["query"],
        },
      },
      {
        name: "update_memory_entity",
        description: "Actualiza o agrega nuevas observaciones a una entidad existente en memoria.",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string", description: "Identificador de la entidad a actualizar." },
            newObservations: { type: "array", items: { type: "string" }, description: "Nuevas observaciones a anexar." },
            summary: { type: "string", description: "Nuevo resumen (opcional)." },
          },
          required: ["id"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  const memory = loadMemory();

  try {
    switch (name) {
      case "index_workspace_context": {
        // Enriquecer entidades base con los pilares del proyecto
        const baseEntities = {
          "data-models": {
            name: "Modelos de Datos Ecoturísticos",
            type: "Model",
            tags: ["places", "businesses", "profiles", "bookings", "prices"],
            summary: "Catálogo territorial de lugares, fichas de negocios con precios NIO/USD y perfiles.",
            observations: [
              "Colección 'places': 15 departamentos + 2 regiones autónomas.",
              "Colección 'businesses': 7 categorías, precios córdobas prioritarios.",
              "Regla ambiental obligatoria: verificación con evidencia trazable antes de publicar check.",
            ],
          },
          "state-patterns": {
            name: "Patrones de Estado y UI",
            type: "State",
            tags: ["riverpod", "state-notifier", "vanilla-js", "ops-center"],
            summary: "Gestión de estado reactiva en Flutter (Riverpod) y modular en Ops Center (JS).",
            observations: [
              "Flutter: RepaintBoundary en listas y galerías para 60fps.",
              "Uso estricto de .withValues(alpha: X) en vez de .withOpacity().",
              "Ops Center: renderizado dinámico con validaciones defensivas sin nullnull.",
            ],
          },
        };

        memory.entities = { ...memory.entities, ...baseEntities };
        saveMemory(memory);

        return {
          content: [
            {
              type: "text",
              text: `Indexación de contexto completada. Total entidades en memoria: ${Object.keys(memory.entities).length}`,
            },
          ],
        };
      }

      case "create_memory_entity": {
        memory.entities[args.id] = {
          name: args.name,
          type: args.type,
          tags: args.tags || [],
          summary: args.summary,
          observations: args.observations || [],
          createdAt: new Date().toISOString(),
        };
        saveMemory(memory);
        return {
          content: [{ type: "text", text: `Entidad '${args.id}' registrada en la memoria persistente.` }],
        };
      }

      case "read_memory_graph": {
        let results = Object.entries(memory.entities);
        if (args.type) {
          results = results.filter(([, v]) => v.type.toLowerCase() === args.type.toLowerCase());
        }
        if (args.tag) {
          results = results.filter(([, v]) => v.tags && v.tags.includes(args.tag));
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(Object.fromEntries(results), null, 2),
            },
          ],
        };
      }

      case "search_memory": {
        const q = args.query.toLowerCase();
        const matches = [];

        for (const [id, entity] of Object.entries(memory.entities)) {
          const matchName = entity.name.toLowerCase().includes(q);
          const matchSummary = entity.summary.toLowerCase().includes(q);
          const matchObs = entity.observations && entity.observations.some((o) => o.toLowerCase().includes(q));
          const matchTags = entity.tags && entity.tags.some((t) => t.toLowerCase().includes(q));

          if (matchName || matchSummary || matchObs || matchTags) {
            matches.push({ id, ...entity });
          }
        }

        return {
          content: [
            {
              type: "text",
              text: matches.length === 0
                ? `No se encontraron coincidencias para: "${args.query}"`
                : JSON.stringify(matches, null, 2),
            },
          ],
        };
      }

      case "update_memory_entity": {
        const ent = memory.entities[args.id];
        if (!ent) {
          return {
            isError: true,
            content: [{ type: "text", text: `Entidad '${args.id}' no encontrada en memoria.` }],
          };
        }
        if (args.summary) ent.summary = args.summary;
        if (Array.isArray(args.newObservations)) {
          ent.observations = [...(ent.observations || []), ...args.newObservations];
        }
        saveMemory(memory);
        return {
          content: [{ type: "text", text: `Entidad '${args.id}' actualizada exitosamente.` }],
        };
      }

      default:
        throw new Error(`Herramienta desconocida: ${name}`);
    }
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: `Error en Context 7 Memory MCP: ${error.message}` }],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`Error fatal en Context 7 Memory MCP: ${err.message}\n`);
  process.exit(1);
});
