# lula MCP server

A remote [MCP](https://modelcontextprotocol.io) server that lets coding agents work
[lula.today](https://lula.today) kanban boards: pick up the next card, keep notes, and hand the work
back for review. The workflow rules are enforced by the server, not just written in instructions.

> **Status: in development (phase 0 of 6).** The server runs and speaks MCP but has no tools yet.
> See [the phases](docs/DESIGN.md#13-phases).

## Why it's built this way

The full design, with every decision and the reason for it, is in [docs/DESIGN.md](docs/DESIGN.md).
In short:

- **One hosted server, connected by URL.** Streamable HTTP on Cloudflare Workers. Nothing to install.
- **Stateless.** Built on MCP SDK v2 and the 2026-07-28 spec, and still serves 2025-11-25 clients
  from the same endpoint.
- **Delegated access.** It acts as whoever signed in, through Supabase Row Level Security. There is
  no service key, so a server bug cannot reach another user's data.
- **Rules in the server.** Agents get workflow tools (`start_card`, `submit_for_review`, ...) rather
  than raw edits. Invalid moves are refused with error codes the agent can act on.

## Development

Needs Node 22.

```sh
npm install
npm run dev        # wrangler dev; MCP at http://localhost:8787/mcp
npm run check      # lint, typecheck, tests
```

| Script               | Does                                                                           |
| -------------------- | ------------------------------------------------------------------------------ |
| `npm run check`      | Biome, TypeScript and Vitest (in the Workers runtime). Run before every commit |
| `npm run cf-typegen` | Regenerates `worker-configuration.d.ts` after changing `wrangler.jsonc`        |
| `npm run gen:types`  | Regenerates lula's database types (needs the Supabase CLI signed in)           |

The layout follows [DESIGN.md section 7](docs/DESIGN.md#7-architecture-and-repo-layout):
workflow rules in `src/domain/` (pure, no I/O), database access in `src/data/`, MCP wiring in
`src/mcp/`.

## Licence

[MIT](LICENSE)
