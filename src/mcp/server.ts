import { McpServer } from "@modelcontextprotocol/server";
import { SERVER_NAME, SERVER_VERSION } from "../lib/version";

/**
 * Builds the MCP server for one request. The handler is stateless (DESIGN.md 7a): every request gets
 * a fresh server, so nothing here may hold state between calls.
 *
 * Tools, resources and prompts are registered from src/mcp/{tools,resources,prompts} as they are
 * built (phases 2 to 4).
 */
export function createServer(): McpServer {
  return new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });
}
