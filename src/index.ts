import { createMcpHandler } from "agents/mcp/server";
import { createServer } from "./mcp/server";

const MCP_ROUTE = "/mcp";

const mcp = createMcpHandler(createServer, { route: MCP_ROUTE });

const LANDING = `lula MCP server

Lets agents work lula.today boards, with the workflow enforced by the server.
Not ready for use yet. MCP endpoint: ${MCP_ROUTE}
Source: https://github.com/platform6/lula.today-mcp
`;

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    if (pathname === MCP_ROUTE) return mcp(request, env, ctx);
    if (pathname === "/" && request.method === "GET") {
      return new Response(LANDING, { headers: { "content-type": "text/plain; charset=utf-8" } });
    }
    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
