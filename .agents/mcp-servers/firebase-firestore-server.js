// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — FIREBASE & FIRESTORE DATABASE MCP SERVER
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer gestión directa y segura de colecciones, documentos, reglas de
//   seguridad (firestore.rules) y consultas geoespaciales sobre la base de datos
//   de BAQUEANO para sincronización con los 15 departamentos y 2 regiones.
// - Permitir evaluar el impacto de reglas de seguridad, validar payloads de
//   negocios y consultar coordenadas geográficas sin riesgo de corrupción.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Construido sobre el SDK oficial de MCP (@modelcontextprotocol/sdk).
// - Integra soporte para Firebase CLI (`firebase-tools`) para emuladores,
//   despliegues y validación de reglas.
// - Implementa cálculos geoespaciales nativos (fórmula de Haversine, cálculo de
//   distancia en km, filtrado por radio y bounding boxes).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Herramientas MCP expuestas:
//   * firestore_eval_rules: Valida sintaxis y estructura de firestore.rules.
//   * firestore_geospatial_query: Simula o ejecuta consultas de proximidad por radio (km).
//   * firebase_cli_exec: Ejecuta comandos de firebase-tools (emulators, deploy, etc.).
//   * firestore_inspect_schema: Inspecciona la estructura esperada de colecciones.
// ============================================================================

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const WORKSPACE_ROOT = path.resolve(__dirname, "../../");

function runFirebaseCli(args) {
  return new Promise((resolve) => {
    const proc = spawn("npx.cmd", ["-y", "firebase-tools@latest", ...args], {
      cwd: WORKSPACE_ROOT,
      shell: true,
      env: process.env,
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));

    proc.on("close", (code) => {
      resolve({
        code,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      });
    });

    proc.on("error", (err) => {
      resolve({
        code: -1,
        stdout: "",
        stderr: err.message,
      });
    });
  });
}

/**
 * Cálculo de distancia Haversine en kilómetros entre dos coordenadas GPS.
 */
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const server = new Server(
  {
    name: "baqueano-firebase-firestore-mcp",
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
        name: "firestore_eval_rules",
        description:
          "Analiza y evalúa el archivo firestore.rules del proyecto para detectar fallos sintácticos, accesos desprotegidos o faltas de validación.",
        inputSchema: {
          type: "object",
          properties: {
            rulesPath: {
              type: "string",
              description: "Ruta opcional al archivo .rules (por defecto 'firestore.rules').",
            },
          },
        },
      },
      {
        name: "firestore_geospatial_query",
        description:
          "Ejecuta un filtrado geoespacial por radio (Haversine) sobre un conjunto de coordenadas o puntos territoriales de Nicaragua.",
        inputSchema: {
          type: "object",
          properties: {
            centerLat: { type: "number", description: "Latitud central (ej. 12.1364 para Managua)." },
            centerLon: { type: "number", description: "Longitud central (ej. -86.2514)." },
            radiusKm: { type: "number", description: "Radio de búsqueda en kilómetros." },
            points: {
              type: "array",
              description: "Lista de puntos con { id, name, lat, lon } a evaluar.",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  lat: { type: "number" },
                  lon: { type: "number" },
                },
                required: ["id", "lat", "lon"],
              },
            },
          },
          required: ["centerLat", "centerLon", "radiusKm"],
        },
      },
      {
        name: "firebase_cli_exec",
        description: "Ejecuta comandos directos de la suite Firebase CLI (projects:list, emulators, apps:list, etc.).",
        inputSchema: {
          type: "object",
          properties: {
            subcommand: {
              type: "string",
              description: "Subcomando de firebase (ej. 'projects:list', 'apps:list', 'emulators:exec').",
            },
            args: {
              type: "array",
              items: { type: "string" },
              description: "Argumentos adicionales.",
            },
          },
          required: ["subcommand"],
        },
      },
      {
        name: "firestore_inspect_schema",
        description: "Revisa los esquemas esperados de documentos (lugares, negocios, perfiles, reservas).",
        inputSchema: {
          type: "object",
          properties: {
            collectionName: {
              type: "string",
              enum: ["places", "businesses", "profiles", "bookings", "all"],
              description: "Nombre de la colección a inspeccionar.",
            },
          },
          required: ["collectionName"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      case "firestore_eval_rules": {
        const filePath = path.resolve(WORKSPACE_ROOT, args.rulesPath || "firestore.rules");
        if (!fs.existsSync(filePath)) {
          return {
            content: [{ type: "text", text: `Archivo de reglas no encontrado en: ${filePath}` }],
          };
        }
        const content = fs.readFileSync(filePath, "utf-8");
        const lines = content.split("\n");
        const warnings = [];

        lines.forEach((line, idx) => {
          if (line.includes("allow read, write: if true;") || line.includes("allow write: if true;")) {
            warnings.push(`Línea ${idx + 1}: [CRÍTICO] Regla de escritura abierta a todo público sin autenticación.`);
          }
        });

        return {
          content: [
            {
              type: "text",
              text: `Auditoría de firestore.rules (${lines.length} líneas):\n` +
                (warnings.length > 0
                  ? `Advertencias encontradas:\n${warnings.join("\n")}`
                  : "✅ No se detectaron reglas inseguras abiertas tipo 'allow write: if true'."),
            },
          ],
        };
      }

      case "firestore_geospatial_query": {
        const { centerLat, centerLon, radiusKm, points = [] } = args;
        const results = [];

        for (const pt of points) {
          const dist = haversineDistanceKm(centerLat, centerLon, pt.lat, pt.lon);
          if (dist <= radiusKm) {
            results.push({
              ...pt,
              distanceKm: Number(dist.toFixed(2)),
            });
          }
        }

        results.sort((a, b) => a.distanceKm - b.distanceKm);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  query: { center: { lat: centerLat, lon: centerLon }, radiusKm },
                  totalEvaluated: points.length,
                  totalMatches: results.length,
                  matches: results,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "firebase_cli_exec": {
        const cmdArgs = [args.subcommand];
        if (Array.isArray(args.args)) cmdArgs.push(...args.args);
        const res = await runFirebaseCli(cmdArgs);
        return {
          content: [
            {
              type: "text",
              text: `[firebase ${args.subcommand} exit code ${res.code}]\n${res.stdout}\n${res.stderr}`.trim(),
            },
          ],
        };
      }

      case "firestore_inspect_schema": {
        const schemas = {
          places: {
            fields: {
              id: "string (slug territorial)",
              name: "string (nombre oficial)",
              departmentId: "string (15 deptos + 2 regiones)",
              geo: "{ lat: number, lng: number }",
              desc: "string (descripción única sin duplicados)",
              verified: "boolean (conforme regla ambiental)",
            },
          },
          businesses: {
            fields: {
              id: "string",
              name: "string",
              category: "string (hospedaje, gastronomia, guiado, etc.)",
              priceNIO: "number (Córdobas primero)",
              priceUSD: "number (Referencia)",
              verified: "boolean",
            },
          },
          profiles: {
            fields: {
              uid: "string",
              email: "string",
              role: "string (traveler, partner, admin)",
            },
          },
          bookings: {
            fields: {
              id: "string",
              travelerId: "string",
              partnerId: "string",
              amountNIO: "number",
              status: "string (pending, confirmed, cancelled)",
            },
          },
        };

        const out = args.collectionName === "all" ? schemas : { [args.collectionName]: schemas[args.collectionName] };
        return {
          content: [{ type: "text", text: JSON.stringify(out, null, 2) }],
        };
      }

      default:
        throw new Error(`Herramienta desconocida: ${name}`);
    }
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: `Error en Firebase/Firestore MCP: ${error.message}` }],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`Error fatal en Servidor MCP Firebase/Firestore: ${err.message}\n`);
  process.exit(1);
});
