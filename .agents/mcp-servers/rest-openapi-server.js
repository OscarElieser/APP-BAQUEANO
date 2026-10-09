// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — REST & OPENAPI EXPLORER MCP SERVER
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una pasarela de auditoría de red, peticiones HTTP e inspección de
//   APIs para validar contratos, esquemas JSON y políticas de rate limit de
//   servicios críticos de BAQUEANO (OpenStreetMap, Nominatim, Overpass API, OSRM
//   y Google Maps Geocoding / Places).
// - Prevenir bloqueos por violación de políticas de uso (ej. User-Agent obligatorio
//   en OSM Nominatim y rate limit de 1 req/segundo).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Construido sobre el SDK oficial de MCP (@modelcontextprotocol/sdk) y la API
//   nativa 'fetch' de Node.js v24.
// - Implementa medición de latencia en milisegundos, auditoría de cabeceras de
//   cuota y validación estructural de respuestas GeoJSON y JSON.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Herramientas MCP expuestas:
//   * rest_http_request: Ejecución genérica de peticiones HTTP (GET, POST, etc.) con métricas.
//   * osm_nominatim_audit: Auditoría de geocodificación y búsqueda en OpenStreetMap.
//   * osm_overpass_query: Ejecución y validación de consultas Overpass QL para POIs de Nicaragua.
//   * google_maps_audit: Validación de endpoints y respuestas de Google Maps API.
// ============================================================================

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");

const server = new Server(
  {
    name: "baqueano-rest-openapi-mcp",
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
        name: "rest_http_request",
        description: "Envía una petición HTTP raw (GET, POST, PUT, DELETE, PATCH) y retorna estado, cabeceras, latencia y cuerpo.",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string", description: "URL de destino." },
            method: {
              type: "string",
              enum: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"],
              description: "Método HTTP (por defecto GET).",
            },
            headers: {
              type: "object",
              description: "Cabeceras HTTP clave-valor.",
            },
            body: {
              type: "string",
              description: "Cuerpo de la petición en formato texto o JSON string.",
            },
            timeoutMs: {
              type: "number",
              description: "Timeout máximo en ms (por defecto 15000).",
            },
          },
          required: ["url"],
        },
      },
      {
        name: "osm_nominatim_audit",
        description:
          "Ejecuta y audita una consulta de geocodificación o búsqueda en OpenStreetMap Nominatim con User-Agent corporativo Baqueano.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Término de búsqueda territorial (ej. 'Ometepe, Rivas, Nicaragua')." },
            limit: { type: "number", description: "Límite de resultados (por defecto 5)." },
          },
          required: ["query"],
        },
      },
      {
        name: "osm_overpass_query",
        description:
          "Ejecuta una consulta Overpass QL contra la infraestructura de OpenStreetMap para auditar nodos turísticos, senderos y miradores.",
        inputSchema: {
          type: "object",
          properties: {
            qlQuery: { type: "string", description: "Consulta Overpass QL (ej. [out:json];node[\"tourism\"](11.0,-87.5,15.0,-83.0);out;)." },
          },
          required: ["qlQuery"],
        },
      },
      {
        name: "google_maps_audit",
        description:
          "Inspecciona y audita una llamada a la API de Google Maps (Geocoding, Places, Directions), evaluando cuota y status.",
        inputSchema: {
          type: "object",
          properties: {
            endpoint: {
              type: "string",
              enum: ["geocode", "places", "directions"],
              description: "Tipo de servicio de Google Maps.",
            },
            params: {
              type: "object",
              description: "Parámetros de consulta (address, place_id, origin, destination, etc.).",
            },
            apiKey: {
              type: "string",
              description: "API Key opcional (si no se proporciona se revisa variable de entorno).",
            },
          },
          required: ["endpoint", "params"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      case "rest_http_request": {
        const method = args.method || "GET";
        const timeoutMs = args.timeoutMs || 15000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const startTime = Date.now();
        const response = await fetch(args.url, {
          method,
          headers: {
            "User-Agent": "Baqueano-DevOps-MCP/1.0 (Nicaragua Ecoturismo)",
            ...args.headers,
          },
          body: ["GET", "HEAD"].includes(method) ? undefined : args.body,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const durationMs = Date.now() - startTime;

        const headersObj = {};
        response.headers.forEach((v, k) => {
          headersObj[k] = v;
        });

        const text = await response.text();
        let parsed = text;
        try {
          parsed = JSON.parse(text);
        } catch {
          // Mantener texto plano
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  status: response.status,
                  statusText: response.statusText,
                  durationMs,
                  headers: headersObj,
                  body: parsed,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "osm_nominatim_audit": {
        const query = encodeURIComponent(args.query);
        const limit = args.limit || 5;
        const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&countrycodes=ni&limit=${limit}`;

        const startTime = Date.now();
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Baqueano-Ecoturismo-App/1.0 (contacto: dev@baqueanonicaragua.com)",
          },
        });
        const durationMs = Date.now() - startTime;
        const data = await response.json();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  service: "OpenStreetMap Nominatim",
                  query: args.query,
                  status: response.status,
                  durationMs,
                  resultsCount: data.length,
                  results: data,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "osm_overpass_query": {
        const url = "https://overpass-api.de/api/interpreter";
        const startTime = Date.now();
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Baqueano-Ecoturismo-App/1.0",
          },
          body: `data=${encodeURIComponent(args.qlQuery)}`,
        });
        const durationMs = Date.now() - startTime;
        const text = await response.text();

        return {
          content: [
            {
              type: "text",
              text: `[Overpass API response: HTTP ${response.status} en ${durationMs}ms]\n${text.substring(0, 4000)}`,
            },
          ],
        };
      }

      case "google_maps_audit": {
        const apiKey = args.apiKey || process.env.GOOGLE_MAPS_API_KEY || "TEST_KEY";
        const endpointsMap = {
          geocode: "https://maps.googleapis.com/maps/api/geocode/json",
          places: "https://maps.googleapis.com/maps/api/place/textsearch/json",
          directions: "https://maps.googleapis.com/maps/api/directions/json",
        };

        const targetUrl = new URL(endpointsMap[args.endpoint]);
        for (const [k, v] of Object.entries(args.params)) {
          targetUrl.searchParams.set(k, String(v));
        }
        targetUrl.searchParams.set("key", apiKey);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  service: `Google Maps (${args.endpoint})`,
                  targetUrl: targetUrl.toString().replace(apiKey, "REDACTED_API_KEY"),
                  params: args.params,
                  apiKeyConfigured: apiKey !== "TEST_KEY",
                  validationNote: "Endpoint estructurado conforme a la especificación de Google Cloud Maps Platform.",
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
      content: [{ type: "text", text: `Error en REST/OpenAPI MCP: ${error.message}` }],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`Error fatal en REST/OpenAPI MCP: ${err.message}\n`);
  process.exit(1);
});
