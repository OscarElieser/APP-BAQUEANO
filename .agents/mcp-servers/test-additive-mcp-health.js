// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — ADDITIVE MCP HEALTH CHECK HARNESS
// ============================================================================

const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");
const path = require("path");

const ADDITIVE_SERVERS = [
  {
    name: "Sequential Thinking MCP (Google/Cognitive)",
    id: "sequential-thinking-mcp",
    script: "sequential-thinking-server.js",
  },
  {
    name: "Context 7 (Memory) MCP",
    id: "context7-memory-mcp",
    script: "context7-memory-server.js",
  },
  {
    name: "Brave Search Tools MCP",
    id: "brave-search-mcp",
    script: "brave-search-server.js",
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
  console.log("Starting Additive MCP Health Check for 4 target servers...\n");
  const results = [];

  for (const s of ADDITIVE_SERVERS) {
    process.stdout.write(`Testing [${s.name}]... `);
    const res = await testServer(s);
    results.push(res);
    console.log(res.status === "Active" ? `✅ OK (${res.toolsCount} tools)` : `❌ FAILED: ${res.error}`);
  }

  console.log("\n--- SUMMARY JSON ---");
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
