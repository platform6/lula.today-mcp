import { exports } from "cloudflare:workers";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { afterEach, describe, expect, it } from "vitest";
import pkg from "../../package.json" with { type: "json" };

const BASE = "http://localhost";

/**
 * Sends a request straight into the Worker under test. Real requests always carry a Host header and
 * the handler refuses those without one (DNS rebinding protection), so it is added here.
 */
function workerFetch(input: string | URL | Request, init?: RequestInit): Promise<Response> {
  const request = new Request(input, init);
  request.headers.set("host", new URL(request.url).host);
  return exports.default.fetch(request);
}

const clients: Client[] = [];

async function connect(versionNegotiation?: { mode: "legacy" | "auto" | { pin: string } }) {
  const client = new Client(
    { name: "lula-mcp-test", version: "0.0.0" },
    versionNegotiation ? { versionNegotiation } : {},
  );
  const transport = new StreamableHTTPClientTransport(new URL("/mcp", BASE), {
    fetch: workerFetch,
  });
  await client.connect(transport);
  clients.push(client);
  return client;
}

afterEach(async () => {
  await Promise.all(clients.splice(0).map((c) => c.close()));
});

describe("MCP endpoint", () => {
  it("serves a 2025-11-25 client", async () => {
    const client = await connect();
    expect(client.getNegotiatedProtocolVersion()).toBe("2025-11-25");
    expect(client.getServerVersion()).toMatchObject({ name: "lula", version: pkg.version });
  });

  it("serves a 2026-07-28 client", async () => {
    const client = await connect({ mode: { pin: "2026-07-28" } });
    expect(client.getNegotiatedProtocolVersion()).toBe("2026-07-28");
    expect(client.getServerVersion()).toMatchObject({ name: "lula", version: pkg.version });
  });
});

describe("request checks", () => {
  const initialize = (headers: Record<string, string>) =>
    exports.default.fetch(
      new Request(`${BASE}/mcp`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json, text/event-stream",
          ...headers,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "initialize",
          params: {
            protocolVersion: "2025-11-25",
            capabilities: {},
            clientInfo: { name: "lula-mcp-test", version: "0.0.0" },
          },
        }),
      }),
    );

  it("accepts a request with a valid Host", async () => {
    const res = await initialize({ host: "localhost" });
    expect(res.status).toBe(200);
  });

  it("refuses a request without a Host header", async () => {
    const res = await initialize({});
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("refuses a browser request from another site", async () => {
    const res = await initialize({ host: "localhost", origin: "https://evil.example" });
    expect(res.status).toBe(403);
  });
});

describe("other routes", () => {
  it("shows the landing page at /", async () => {
    const res = await workerFetch(`${BASE}/`);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("lula MCP server");
  });

  it("returns 404 elsewhere", async () => {
    const res = await workerFetch(`${BASE}/nope`);
    expect(res.status).toBe(404);
  });
});
