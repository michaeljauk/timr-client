import { openApiMcpServer } from "@cloudflare/codemode/mcp";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import spec from "./spec.json" with { type: "json" };
import { NodeExecutor } from "./executor.js";
import { request } from "./lib/request.js";

const server = openApiMcpServer({
  name: "timr-mcp",
  version: "0.2.0",
  spec: spec as unknown as Record<string, unknown>,
  executor: new NodeExecutor({ timeoutMs: 30_000 }),
  request,
  description:
    "Agent-authored JavaScript runs in the host Node process (no sandbox). " +
    "Auth is injected by the host before each call and never enters your code.",
});

const transport = new StdioServerTransport();
await server.connect(transport);
