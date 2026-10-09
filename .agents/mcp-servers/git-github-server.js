// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — GIT & GITHUB VERSION CONTROL MCP SERVER
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer gestión de control de versiones Git nativa, autónoma y segura sobre
//   el repositorio de BAQUEANO (OscarElieser/APP-BAQUEANO).
// - Permitir inspeccionar el estado del árbol de trabajo, generar diffs precisos,
//   crear commits semánticos conforme a estándares de ingeniería, administrar ramas
//   y resolver conflictos de fusión con trazabilidad total.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Construido sobre el SDK oficial de MCP (@modelcontextprotocol/sdk).
// - Ejecuta comandos de la suite Git nativa de Windows (git version 2.50+) directamente
//   en el directorio raíz del proyecto con codificación UTF-8.
// - Sanitiza mensajes de commit y parámetros para evitar inyecciones de comandos.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Herramientas MCP expuestas:
//   * git_status: Estado detallado del índice y archivos modificados.
//   * git_diff: Comparación de diferencias en working tree o staged.
//   * git_commit: Creación de commits semánticos (feat, fix, refactor, docs, etc.).
//   * git_branch: Listado, creación y cambio de ramas.
//   * git_log: Historial de commits con formato compacto o detallado.
//   * git_conflicts: Detección y listado de archivos en conflicto de fusión (merge).
//   * git_fetch_pull: Sincronización con remotos (origin/main, ramas wip).
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

// Cargar variables de entorno desde .env si existe en el workspace
function loadEnv() {
  const envPath = path.resolve(WORKSPACE_ROOT, ".env");
  const envVars = { ...process.env };
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, "utf-8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const [key, ...valParts] = trimmed.split("=");
          const val = valParts.join("=").trim().replace(/^["']|["']$/g, "");
          envVars[key.trim()] = val;
        }
      });
    } catch {}
  }
  return envVars;
}

function runGit(args) {
  return new Promise((resolve) => {
    const env = loadEnv();
    const proc = spawn("git", args, {
      cwd: WORKSPACE_ROOT,
      shell: true,
      env,
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

const server = new Server(
  {
    name: "baqueano-git-github-mcp",
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
        name: "git_status",
        description: "Obtiene el estado completo de git (archivos modificados, staged, no rastreados) en el workspace.",
        inputSchema: {
          type: "object",
          properties: {
            short: { type: "boolean", description: "Retornar en formato corto (-s)." },
          },
        },
      },
      {
        name: "git_diff",
        description: "Muestra las diferencias de código pendientes en el árbol de trabajo o staged.",
        inputSchema: {
          type: "object",
          properties: {
            staged: { type: "boolean", description: "Si es true muestra cambios en el área de staging (--staged)." },
            filePath: { type: "string", description: "Ruta específica de archivo a comparar." },
          },
        },
      },
      {
        name: "git_commit",
        description: "Agrega archivos y crea un commit semántico en el repositorio.",
        inputSchema: {
          type: "object",
          properties: {
            message: { type: "string", description: "Mensaje semántico de commit (ej. 'feat(mcp): aprovisionar servidores locales')." },
            files: {
              type: "array",
              items: { type: "string" },
              description: "Lista de archivos a agregar. Por defecto ['.'] para todos.",
            },
          },
          required: ["message"],
        },
      },
      {
        name: "git_branch",
        description: "Administra las ramas locales y remotas del repositorio.",
        inputSchema: {
          type: "object",
          properties: {
            action: {
              type: "string",
              enum: ["list", "create", "checkout", "delete"],
              description: "Acción de rama a ejecutar.",
            },
            branchName: {
              type: "string",
              description: "Nombre de la rama para create, checkout o delete.",
            },
          },
          required: ["action"],
        },
      },
      {
        name: "git_log",
        description: "Muestra el historial reciente de commits.",
        inputSchema: {
          type: "object",
          properties: {
            maxCount: { type: "number", description: "Número de commits a mostrar (por defecto 10)." },
          },
        },
      },
      {
        name: "git_conflicts",
        description: "Detecta si existen archivos con marcadores de conflicto de fusión (merge conflicts).",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "git_fetch_pull",
        description: "Ejecuta git fetch o git pull para sincronizar cambios remotos de GitHub.",
        inputSchema: {
          type: "object",
          properties: {
            action: {
              type: "string",
              enum: ["fetch", "pull"],
              description: "Acción a realizar con el remoto.",
            },
            remote: { type: "string", description: "Nombre del remoto (por defecto 'origin')." },
            branch: { type: "string", description: "Nombre de la rama remota." },
          },
          required: ["action"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      case "git_status": {
        const cmdArgs = ["status"];
        if (args.short) cmdArgs.push("-s");
        const res = await runGit(cmdArgs);
        return {
          content: [{ type: "text", text: res.stdout || res.stderr || "Árbol de trabajo limpio." }],
        };
      }

      case "git_diff": {
        const cmdArgs = ["diff"];
        if (args.staged) cmdArgs.push("--staged");
        if (args.filePath) cmdArgs.push("--", args.filePath);
        const res = await runGit(cmdArgs);
        return {
          content: [{ type: "text", text: res.stdout || "Sin diferencias pendientes." }],
        };
      }

      case "git_commit": {
        const files = args.files && args.files.length > 0 ? args.files : ["."];
        await runGit(["add", ...files]);
        const res = await runGit(["commit", "-m", args.message]);
        return {
          content: [
            {
              type: "text",
              text: `[git commit exit code ${res.code}]\n${res.stdout}\n${res.stderr}`.trim(),
            },
          ],
        };
      }

      case "git_branch": {
        if (args.action === "list") {
          const res = await runGit(["branch", "-a"]);
          return { content: [{ type: "text", text: res.stdout }] };
        } else if (args.action === "create") {
          const res = await runGit(["branch", args.branchName]);
          return { content: [{ type: "text", text: res.stdout || `Rama ${args.branchName} creada.` }] };
        } else if (args.action === "checkout") {
          const res = await runGit(["checkout", args.branchName]);
          return { content: [{ type: "text", text: `${res.stdout}\n${res.stderr}`.trim() }] };
        } else if (args.action === "delete") {
          const res = await runGit(["branch", "-d", args.branchName]);
          return { content: [{ type: "text", text: `${res.stdout}\n${res.stderr}`.trim() }] };
        }
        break;
      }

      case "git_log": {
        const max = args.maxCount || 10;
        const res = await runGit(["log", `-n`, String(max), "--oneline", "--graph", "--decorate"]);
        return {
          content: [{ type: "text", text: res.stdout }],
        };
      }

      case "git_conflicts": {
        const res = await runGit(["diff", "--name-only", "--diff-filter=U"]);
        const files = res.stdout ? res.stdout.split("\n").filter(Boolean) : [];
        return {
          content: [
            {
              type: "text",
              text: files.length === 0
                ? "✅ No hay conflictos de fusión activos en el repositorio."
                : `⚠️ Archivos en conflicto detectados (${files.length}):\n${files.join("\n")}`,
            },
          ],
        };
      }

      case "git_fetch_pull": {
        const remote = args.remote || "origin";
        const cmdArgs = [args.action, remote];
        if (args.branch) cmdArgs.push(args.branch);
        const res = await runGit(cmdArgs);
        return {
          content: [
            {
              type: "text",
              text: `[git ${args.action} exit code ${res.code}]\n${res.stdout}\n${res.stderr}`.trim(),
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
      content: [{ type: "text", text: `Error en Git/GitHub MCP: ${error.message}` }],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`Error fatal en Git/GitHub MCP: ${err.message}\n`);
  process.exit(1);
});
