# lula MCP server

A remote MCP server on Cloudflare Workers that lets agents work lula.today boards. The design and the
reasons for every choice are in `docs/DESIGN.md`; read the relevant section before changing behaviour,
and update it when a decision changes (mark the decision _Revised_ with the date).

Run `npm run check` (Biome, TypeScript, Vitest in the Workers runtime) before calling a change done.

## Rules for the code

- `src/domain/` holds the workflow rules as pure functions: no network, no database, no imports
  from the rest of `src/`. Every rule there is unit tested.
- `src/data/database.types.ts` is generated (`npm run gen:types`); never edit it by hand. The lula
  repo owns the schema.
- `worker-configuration.d.ts` is generated (`npm run cf-typegen`) after changing `wrangler.jsonc`.
- One file per tool in `src/mcp/tools/`, with zod input and output schemas.
- No service keys, ever: the server acts with the signed-in user's session (DESIGN.md 5).
- Never log card text, passwords, tokens or file contents (DESIGN.md 8d).

## Cards

Work for this repo is planned as cards on the **Lula MCP** board in lula.today. Work on lula's own
schema and app (phase 1) happens in the lula repo, on the **lula** board.
