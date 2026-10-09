// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MCP HEALTH CHECK & VALIDATION HARNESS
// ============================================================================

const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");
const path = require("path");

const SERVERS = [
  {
    name: "Flutter/Dart CLI MCP",
    id: "flutter-dart-mcp",
    script: "flutter-dart-server.js",
  },
  {
    name: "Firebase/Firestore MCP",
    id: "firebase-firestore-mcp",
    script: "firebase-firestore-server.js",
  },
  {
    name: "Browser Automation MCP (Puppeteer)",
    id: "browser-automation-mcp",
    script: "browser-automation-server.js",
  },
  {
    name: "REST/OpenAPI Explorer MCP",
    id: "rest-openapi-mcp",
    script: "rest-openapi-server.js",
  },
  {
    name: "Git / GitHub MCP",
    id: "git-github-mcp",
    script: "git-github-server.js",
  },
];

async function testServer(serverDef) {
  const scriptPath = path.resolve(__dirname, serverDef.script);
  const transport = new StdioClientTransport({
    command: "node",
    args: [scriptPath],
  });

  const client = new Client(
    {
      name: `health-checker-${serverDef.id}`,
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  try {
    await client.connect(transport);
    const tools = await client.listTools();
    await client.close();

    return {
      name: serverDef.name,
      id: serverDef.id,
      status: "Active",
      toolsCount: tools.tools.length,
      tools: tools.tools.map((t) => t.name),
      error: null,
    };
  } catch (err) {
    try {
      await client.close();
    } catch {}
    return {
      name: serverDef.name,
      id: serverDef.id,
      status: "Failed",
      toolsCount: 0,
      tools: [],
      error: err.message,
    };
  }
}

async function main() {
  console.log("Starting MCP Health Check...\n");
  const results = [];

  for (const s of SERVERS) {
    process.stdout.write(`Testing [${s.name}]... `);
    const res = await testServer(s);
    results.push(res);
    console.log(res.status === "Active" ? `✅ OK (${res.toolsCount} tools)` : `❌ FAILED: ${res.error}`);
  }

  console.log("\n--- SUMMARY JSON ---");
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
