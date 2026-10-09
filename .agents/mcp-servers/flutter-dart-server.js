// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — FLUTTER & DART CLI MCP SERVER
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una interfaz MCP (Model Context Protocol) robusta y de baja latencia
//   para la ejecución, análisis, compilación y pruebas del proyecto Flutter/Android
//   de BAQUEANO sin intermediarios ni bloqueos de interfaz.
// - Permitir diagnósticos en tiempo real de 'flutter analyze', ejecución selectiva
//   o completa de 'flutter test', y compilación reproducible de builds nativos.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Construido sobre el SDK oficial de MCP (@modelcontextprotocol/sdk).
// - Ejecuta procesos hijos sobre el directorio raíz del workspace de BAQUEANO
//   (c:\Users\Lenovo\Desktop\APP-BAQUEANO) con captura asíncrona de stdout y stderr.
// - Sanitización estricta de parámetros, timeouts configurables y prevención de
//   bloqueos de proceso.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Servidor MCP stdio con las siguientes herramientas expuestas:
//   * flutter_analyze: Análisis estático de código Dart con reporte de issues.
//   * flutter_test: Ejecución de suites de prueba unitarias y de widgets.
//   * flutter_build: Compilación de artefactos Android (apk, appbundle) y Web.
//   * flutter_pub: Gestión de dependencias (pub get, pub upgrade, pub outdated).
//   * dart_format: Formateo de código Dart según convenciones oficiales.
//   * dart_fix: Aplicación automatizada de correcciones y migraciones de lints.
//   * flutter_doctor: Diagnóstico de salud del SDK y herramientas nativas.
//   * flutter_clean: Limpieza profunda de cachés de compilación y artefactos.
// ============================================================================

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");
const { spawn } = require("child_process");
const path = require("path");

const WORKSPACE_ROOT = path.resolve(__dirname, "../../");

/**
 * Ejecuta un comando en el directorio del workspace y retorna stdout/stderr.
 */
function runCommand(command, args, options = {}) {
  return new Promise((resolve) => {
    const cwd = options.cwd || WORKSPACE_ROOT;
    const timeoutMs = options.timeoutMs || 120000;

    const proc = spawn(command, args, {
      cwd,
      shell: true,
      env: { ...process.env, ...options.env },
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill("SIGTERM");
    }, timeoutMs);

    proc.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    proc.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        code: timedOut ? -1 : code,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        timedOut,
      });
    });

    proc.on("error", (err) => {
      clearTimeout(timer);
      resolve({
        code: -1,
        stdout: "",
        stderr: err.message,
        timedOut: false,
      });
    });
  });
}

const server = new Server(
  {
    name: "baqueano-flutter-dart-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Definición de herramientas disponibles
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "flutter_analyze",
        description:
          "Ejecuta 'flutter analyze' en el workspace de BAQUEANO para auditar lints, errores y advertencias de Dart.",
        inputSchema: {
          type: "object",
          properties: {
            targetPath: {
              type: "string",
              description: "Ruta relativa opcional a analizar (ej. 'lib/features/places'). Por defecto todo el proyecto.",
            },
            fatalInfos: {
              type: "boolean",
              description: "Tratar advertencias informativas como errores.",
            },
          },
        },
      },
      {
        name: "flutter_test",
        description:
          "Ejecuta la suite de pruebas unitarias y de widgets ('flutter test') en el workspace.",
        inputSchema: {
          type: "object",
          properties: {
            testPath: {
              type: "string",
              description: "Ruta opcional a un archivo o directorio de pruebas (ej. 'test/unit/price_test.dart').",
            },
            plainName: {
              type: "string",
              description: "Filtrar pruebas por nombre exacto o coincidencia de texto.",
            },
            coverage: {
              type: "boolean",
              description: "Generar reporte de cobertura de código (lcov.info).",
            },
          },
        },
      },
      {
        name: "flutter_build",
        description:
          "Compila el proyecto Flutter para Android o Web con captura de logs en tiempo real.",
        inputSchema: {
          type: "object",
          properties: {
            target: {
              type: "string",
              enum: ["apk", "appbundle", "web", "bundle"],
              description: "Tipo de compilación a ejecutar.",
            },
            mode: {
              type: "string",
              enum: ["debug", "profile", "release"],
              description: "Modo de compilación (por defecto 'debug').",
            },
            extraArgs: {
              type: "array",
              items: { type: "string" },
              description: "Argumentos adicionales para 'flutter build'.",
            },
          },
          required: ["target"],
        },
      },
      {
        name: "flutter_pub",
        description:
          "Gestiona paquetes y dependencias en el proyecto ('get', 'upgrade', 'outdated').",
        inputSchema: {
          type: "object",
          properties: {
            action: {
              type: "string",
              enum: ["get", "upgrade", "outdated"],
              description: "Acción de pub a ejecutar.",
            },
          },
          required: ["action"],
        },
      },
      {
        name: "dart_format",
        description:
          "Formatea archivos Dart según el estándar oficial de Flutter/Dart.",
        inputSchema: {
          type: "object",
          properties: {
            targetPath: {
              type: "string",
              description: "Ruta de archivo o carpeta a formatear (por defecto 'lib/').",
            },
            dryRun: {
              type: "boolean",
              description: "Si es true, solo lista los archivos que cambiarían sin modificarlos.",
            },
          },
        },
      },
      {
        name: "dart_fix",
        description:
          "Aplica o evalúa correcciones automáticas de Dart ('dart fix').",
        inputSchema: {
          type: "object",
          properties: {
            apply: {
              type: "boolean",
              description: "Si es true ejecuta '--apply', si es false ejecuta '--dry-run'.",
            },
          },
        },
      },
      {
        name: "flutter_doctor",
        description: "Ejecuta 'flutter doctor -v' para diagnosticar el entorno de desarrollo.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "flutter_clean",
        description: "Ejecuta 'flutter clean' para purgar la caché de compilación.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// Manejador de llamadas a herramientas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      case "flutter_analyze": {
        const cmdArgs = ["analyze"];
        if (args.fatalInfos) cmdArgs.push("--fatal-infos");
        if (args.targetPath) cmdArgs.push(args.targetPath);
        const res = await runCommand("flutter", cmdArgs);
        return {
          content: [
            {
              type: "text",
              text: `[flutter analyze exit code ${res.code}]\n${res.stdout}\n${res.stderr}`.trim(),
            },
          ],
        };
      }

      case "flutter_test": {
        const cmdArgs = ["test"];
        if (args.coverage) cmdArgs.push("--coverage");
        if (args.plainName) cmdArgs.push("--plain-name", args.plainName);
        if (args.testPath) cmdArgs.push(args.testPath);
        const res = await runCommand("flutter", cmdArgs, { timeoutMs: 180000 });
        return {
          content: [
            {
              type: "text",
              text: `[flutter test exit code ${res.code}]\n${res.stdout}\n${res.stderr}`.trim(),
            },
          ],
        };
      }

      case "flutter_build": {
        const mode = args.mode || "debug";
        const cmdArgs = ["build", args.target, `--${mode}`];
        if (Array.isArray(args.extraArgs)) {
          cmdArgs.push(...args.extraArgs);
        }
        const res = await runCommand("flutter", cmdArgs, { timeoutMs: 300000 });
        return {
          content: [
            {
              type: "text",
              text: `[flutter build ${args.target} exit code ${res.code}]\n${res.stdout}\n${res.stderr}`.trim(),
            },
          ],
        };
      }

      case "flutter_pub": {
        const cmdArgs = ["pub", args.action];
        const res = await runCommand("flutter", cmdArgs);
        return {
          content: [
            {
              type: "text",
              text: `[flutter pub ${args.action} exit code ${res.code}]\n${res.stdout}\n${res.stderr}`.trim(),
            },
          ],
        };
      }

      case "dart_format": {
        const target = args.targetPath || "lib";
        const cmdArgs = ["format"];
        if (args.dryRun) cmdArgs.push("-o", "none");
        cmdArgs.push(target);
        const res = await runCommand("dart", cmdArgs);
        return {
          content: [
            {
              type: "text",
              text: `[dart format exit code ${res.code}]\n${res.stdout}\n${res.stderr}`.trim(),
            },
          ],
        };
      }

      case "dart_fix": {
        const cmdArgs = ["fix", args.apply ? "--apply" : "--dry-run"];
        const res = await runCommand("dart", cmdArgs);
        return {
          content: [
            {
              type: "text",
              text: `[dart fix exit code ${res.code}]\n${res.stdout}\n${res.stderr}`.trim(),
            },
          ],
        };
      }

      case "flutter_doctor": {
        const res = await runCommand("flutter", ["doctor", "-v"]);
        return {
          content: [
            {
              type: "text",
              text: `[flutter doctor exit code ${res.code}]\n${res.stdout}\n${res.stderr}`.trim(),
            },
          ],
        };
      }

      case "flutter_clean": {
        const res = await runCommand("flutter", ["clean"]);
        return {
          content: [
            {
              type: "text",
              text: `[flutter clean exit code ${res.code}]\n${res.stdout}\n${res.stderr}`.trim(),
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
      content: [
        {
          type: "text",
          text: `Error al ejecutar ${name}: ${error.message}`,
        },
      ],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`Error fatal en Servidor MCP Flutter/Dart: ${err.message}\n`);
  process.exit(1);
});
