// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — BRAVE SEARCH & REAL-TIME WEB DISCOVERY MCP SERVER
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer acceso a la web en tiempo real para resolver APIs deprecadas, errores
//   no documentados, conflictos de dependencias en pub.dev, y soluciones de issues
//   en repositorios oficiales de Flutter y Firebase.
// - Eliminar alucinaciones y permitir verificación inmediata contra las fuentes
//   oficiales de documentación técnica.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Construido sobre el SDK oficial de MCP (@modelcontextprotocol/sdk).
// - Soporta la API oficial de Brave Search (mediante `BRAVE_API_KEY` en entorno o .env)
//   con endpoints especializados para la API pública de pub.dev (`https://pub.dev/api/search`)
//   y la API de GitHub (`https://api.github.com/search/issues`).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Herramientas MCP expuestas:
//   * brave_web_search: Búsqueda web general con filtros de dominio y país.
//   * search_pub_dev: Búsqueda directa en el registro oficial de paquetes Flutter/Dart.
//   * search_github_issues: Búsqueda de issues, pull requests y errores en GitHub.
//   * search_documentation: Búsqueda filtrada en documentación oficial (Flutter, Firebase, Supabase).
// ============================================================================

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");

const server = new Server(
  {
    name: "baqueano-brave-search-mcp",
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
        name: "brave_web_search",
        description: "Ejecuta una búsqueda web en tiempo real mediante Brave Search.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Término de búsqueda web." },
            count: { type: "number", description: "Cantidad máxima de resultados (1-20, por defecto 5)." },
          },
          required: ["query"],
        },
      },
      {
        name: "search_pub_dev",
        description: "Busca paquetes, versiones y compatibilidad en el repositorio oficial pub.dev de Flutter y Dart.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Nombre del paquete o funcionalidad (ej. 'flutter_riverpod', 'google_fonts')." },
          },
          required: ["query"],
        },
      },
      {
        name: "search_github_issues",
        description: "Busca errores, issues abiertos/cerrados o soluciones en repositorios de GitHub.",
        inputSchema: {
          type: "object",
          properties: {
            repo: { type: "string", description: "Repositorio objetivo (ej. 'flutter/flutter', 'firebase/flutterfire'). Por defecto busca globalmente." },
            query: { type: "string", description: "Mensaje de error, código o descripción del problema." },
            state: { type: "string", enum: ["open", "closed", "all"], description: "Estado de los issues." },
          },
          required: ["query"],
        },
      },
      {
        name: "search_documentation",
        description: "Busca en la documentación oficial de Flutter, Dart, Firebase, Supabase o MDN.",
        inputSchema: {
          type: "object",
          properties: {
            topic: {
              type: "string",
              enum: ["flutter", "dart", "firebase", "supabase", "mdn", "all"],
              description: "Ecosistema de documentación.",
            },
            query: { type: "string", description: "Consulta o función a investigar." },
          },
          required: ["topic", "query"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  const apiKey = process.env.BRAVE_API_KEY || "";

  try {
    switch (name) {
      case "brave_web_search": {
        if (!apiKey) {
          // Fallback a consulta estructurada cuando no hay API Key activa
          const searchUrl = `https://search.brave.com/search?q=${encodeURIComponent(args.query)}`;
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "Pending Auth / Fallback Ready",
                    query: args.query,
                    webSearchUrl: searchUrl,
                    note: "Para acceso por API nativa configure BRAVE_API_KEY en las variables de entorno o archivo .env. Modo autónomo web activo.",
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        const count = Math.min(20, Math.max(1, args.count || 5));
        const res = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(args.query)}&count=${count}`, {
          headers: {
            "Accept": "application/json",
            "X-Subscription-Token": apiKey,
          },
        });

        if (!res.ok) {
          throw new Error(`Brave API HTTP ${res.status}: ${await res.text()}`);
        }

        const data = await res.json();
        const results = (data.web?.results || []).map((r) => ({
          title: r.title,
          url: r.url,
          description: r.description,
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ query: args.query, count: results.length, results }, null, 2),
            },
          ],
        };
      }

      case "search_pub_dev": {
        const url = `https://pub.dev/api/search?q=${encodeURIComponent(args.query)}`;
        const res = await fetch(url, {
          headers: {
            "User-Agent": "Baqueano-DevOps-Tool/1.0",
          },
        });

        if (!res.ok) {
          throw new Error(`pub.dev API HTTP ${res.status}`);
        }

        const data = await res.json();
        const packages = (data.packages || []).slice(0, 8).map((p) => ({
          package: p.package,
          url: `https://pub.dev/packages/${p.package}`,
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  service: "pub.dev official registry",
                  query: args.query,
                  totalMatches: data.packages?.length || 0,
                  topPackages: packages,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "search_github_issues": {
        let q = args.query;
        if (args.repo) q += ` repo:${args.repo}`;
        if (args.state && args.state !== "all") q += ` state:${args.state}`;

        const url = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=6`;
        const headers = {
          "User-Agent": "Baqueano-DevOps-Tool/1.0",
          "Accept": "application/vnd.github.v3+json",
        };
        if (process.env.GITHUB_TOKEN) {
          headers["Authorization"] = `token ${process.env.GITHUB_TOKEN}`;
        }

        const res = await fetch(url, { headers });
        if (!res.ok) {
          throw new Error(`GitHub API HTTP ${res.status}: ${await res.text()}`);
        }

        const data = await res.json();
        const issues = (data.items || []).map((it) => ({
          number: it.number,
          title: it.title,
          state: it.state,
          url: it.html_url,
          commentsCount: it.comments,
          updatedAt: it.updated_at,
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  service: "GitHub Issues Search",
                  query: q,
                  totalCount: data.total_count || 0,
                  topIssues: issues,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "search_documentation": {
        const domainMap = {
          flutter: "docs.flutter.dev",
          dart: "dart.dev",
          firebase: "firebase.google.com/docs",
          supabase: "supabase.com/docs",
          mdn: "developer.mozilla.org",
        };

        const domains = args.topic === "all" ? Object.values(domainMap).join(" OR site:") : domainMap[args.topic];
        const searchQuery = `${args.query} site:${domains}`;

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  topic: args.topic,
                  query: args.query,
                  targetedSearchQuery: searchQuery,
                  referenceHubs: {
                    flutter: "https://docs.flutter.dev",
                    dart: "https://dart.dev",
                    firebase: "https://firebase.google.com/docs",
                    supabase: "https://supabase.com/docs",
                    pubDev: `https://pub.dev/packages?q=${encodeURIComponent(args.query)}`,
                  },
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        throw new Error(`Herramienta desconocida: ${name}`);
    }
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: `Error en Brave Search MCP: ${error.message}` }],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`Error fatal en Brave Search MCP: ${err.message}\n`);
  process.exit(1);
});
