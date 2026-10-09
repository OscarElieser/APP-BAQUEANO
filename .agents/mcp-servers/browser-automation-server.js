// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — HEADLESS BROWSER & FLUTTER WEB MCP SERVER
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer capacidades avanzadas de automatización de navegador headless para
//   inspeccionar, depurar y validar el renderizado de Flutter Web (CanvasKit / HTML)
//   y la web pública de BAQUEANO (Firebase Hosting).
// - Permitir captura de capturas de pantalla de viewport, auditoría de logs de consola
//   (incluyendo errores de inicialización de Flutter Engine), y ejecución de scripts.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Construido sobre Puppeteer y el SDK oficial de MCP (@modelcontextprotocol/sdk).
// - Soporta conexión directa a Google Chrome instalado en el sistema o Chromium
//   gestionado por Puppeteer.
// - Manejo de ciclos de vida de páginas, captura de buffers de imagen (Base64)
//   y recolección estructurada de eventos de consola y errores de red.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Herramientas MCP expuestas:
//   * browser_navigate: Abre una URL web y espera a que la red esté inactiva.
//   * browser_screenshot: Captura de pantalla de viewport o página completa en PNG.
//   * browser_console_logs: Inspecciona los mensajes de consola y errores JS emitidos.
//   * browser_eval: Ejecuta expresiones JavaScript en el contexto de la página.
//   * browser_close: Cierra la instancia o pestaña activa del navegador.
// ============================================================================

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

let browserInstance = null;
let activePage = null;
const consoleLogs = [];

const CHROME_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

function findChromeExecutable() {
  for (const p of CHROME_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}

async function getBrowser() {
  if (browserInstance && browserInstance.connected) {
    return browserInstance;
  }

  const executablePath = findChromeExecutable();
  browserInstance = await puppeteer.launch({
    headless: "new",
    executablePath,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--window-size=1280,800",
    ],
  });

  return browserInstance;
}

async function getOrCreatePage() {
  const browser = await getBrowser();
  if (activePage && !activePage.isClosed()) {
    return activePage;
  }

  activePage = await browser.newPage();
  await activePage.setViewport({ width: 1280, height: 800 });

  activePage.on("console", (msg) => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString(),
    });
  });

  activePage.on("pageerror", (err) => {
    consoleLogs.push({
      type: "pageerror",
      text: err.toString(),
      timestamp: new Date().toISOString(),
    });
  });

  return activePage;
}

const server = new Server(
  {
    name: "baqueano-browser-automation-mcp",
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
        name: "browser_navigate",
        description:
          "Abre una URL en el navegador headless (ej. para probar Flutter Web o Firebase Hosting) y registra los logs.",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string", description: "URL completa a cargar (ej. 'http://localhost:8080' o 'https://app-baqueano.web.app')." },
            waitUntil: {
              type: "string",
              enum: ["load", "domcontentloaded", "networkidle0", "networkidle2"],
              description: "Condición de espera para finalizar la navegación.",
            },
          },
          required: ["url"],
        },
      },
      {
        name: "browser_screenshot",
        description: "Toma una captura de pantalla de la página actual y la guarda en disco o retorna información del viewport.",
        inputSchema: {
          type: "object",
          properties: {
            outputPath: {
              type: "string",
              description: "Ruta de archivo opcional para guardar la imagen PNG.",
            },
            fullPage: {
              type: "boolean",
              description: "Si es true captura toda la longitud desplazable de la página.",
            },
          },
        },
      },
      {
        name: "browser_console_logs",
        description: "Obtiene la lista de logs de consola, advertencias y errores generados por la aplicación web.",
        inputSchema: {
          type: "object",
          properties: {
            clear: {
              type: "boolean",
              description: "Si es true purga los logs después de leerlos.",
            },
          },
        },
      },
      {
        name: "browser_eval",
        description: "Ejecuta código JavaScript dentro del contexto de la página (para verificar CanvasKit, Flutter, elementos DOM).",
        inputSchema: {
          type: "object",
          properties: {
            script: { type: "string", description: "Código JavaScript a evaluar." },
          },
          required: ["script"],
        },
      },
      {
        name: "browser_close",
        description: "Cierra la sesión y las instancias activas del navegador headless.",
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
      case "browser_navigate": {
        const page = await getOrCreatePage();
        const waitUntil = args.waitUntil || "networkidle2";
        const response = await page.goto(args.url, { waitUntil, timeout: 45000 });
        const title = await page.title();
        const status = response ? response.status() : "unknown";

        return {
          content: [
            {
              type: "text",
              text: `Navegación completada a ${args.url}\nHTTP Status: ${status}\nTítulo de página: "${title}"\nLogs acumulados: ${consoleLogs.length}`,
            },
          ],
        };
      }

      case "browser_screenshot": {
        const page = await getOrCreatePage();
        const outPath = args.outputPath
          ? path.resolve(process.cwd(), args.outputPath)
          : path.resolve(__dirname, `screenshot_${Date.now()}.png`);

        await page.screenshot({
          path: outPath,
          fullPage: Boolean(args.fullPage),
        });

        return {
          content: [
            {
              type: "text",
              text: `Captura guardada exitosamente en: ${outPath}`,
            },
          ],
        };
      }

      case "browser_console_logs": {
        const out = [...consoleLogs];
        if (args.clear) consoleLogs.length = 0;
        return {
          content: [
            {
              type: "text",
              text: out.length === 0 ? "No hay logs de consola registrados." : JSON.stringify(out, null, 2),
            },
          ],
        };
      }

      case "browser_eval": {
        const page = await getOrCreatePage();
        const result = await page.evaluate((code) => {
          return window.eval(code);
        }, args.script);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "browser_close": {
        if (browserInstance) {
          await browserInstance.close();
          browserInstance = null;
          activePage = null;
        }
        return {
          content: [{ type: "text", text: "Navegador headless cerrado correctamente." }],
        };
      }

      default:
        throw new Error(`Herramienta desconocida: ${name}`);
    }
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: `Error en Browser Automation MCP: ${error.message}` }],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`Error fatal en Browser Automation MCP: ${err.message}\n`);
  process.exit(1);
});
