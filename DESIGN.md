# lula MCP server: design

Status: draft, being agreed section by section. One hosted server on Cloudflare Workers.

Purpose: a professional, remote MCP server that lets any lula user's agents work their boards,
with the workflow rules enforced by the server. It acts with delegated access: on behalf of
whoever signed in, with exactly their permissions.

## 1. Goals, users and scope

### Goals
1. An agent in any repo, on any machine, can work that repo's board in one step (`/next-card`), with no per-repo setup.
2. The workflow rules are enforced by the server, not only written in instructions.
3. A reference-quality MCP server on the current spec (2026-07-28, stateless), still serving 2025-11-25 clients: tools, resources, prompts and elicitation each used for what they are for, with precise schemas, evals and a written security model.
4. One hosted server (Streamable HTTP on Cloudflare). Nothing to install; clients connect by URL.
   Running it locally is for development and tests only.

### Non-goals
- Rebuilding the lula app: boards and cards only (no time tracking, work log or calendar).
- Admin features: creating projects, deleting cards, changing columns or settings.
- Moving cards to Done: that stays the owner's call after testing.

### Decisions
| # | Decision | Choice |
|---|---|---|
| 1a | Who it is for | Any lula user; each signs in and sees only their own boards (Row Level Security) |
| 1b | Supported clients at launch | Claude Code, Codex, Claude Desktop, claude.ai (remote). Others documented as "should work" |
| 1c | Several agents on one board | `start_card` claims the card and returns a claim id, which the card-changing tools take; a second agent is refused; claims lapse after inactivity. *Revised: the 2026-07-28 spec has no sessions to hold claims* |
| 1d | Column names | Each board maps its columns to roles (backlog, ready, in progress, review, done), defaulting to matching names. Backlog is the only column agents add cards to; a column with no role is read-only |

## 2. The card workflow

The server enforces a state machine. Columns map to roles (1d). Backlog is the owner's queue of
ideas and planned work: agents add planned cards there (3h) but never take or change its cards.
Any column without a role is read-only.

```
            (owner only)                        (owner only)
 Backlog ────────────────▶ Ready ◀───────────────────────────┐
                            │  ▲                              │ feedback:
               start_card   │  │ release_card                 │ owner moves it back
               (claims it)  ▼  │ (gives it back)              │
                         In progress ──submit_for_review──▶ Review ──(owner only)──▶ Done
                                         (needs a note
                                          and a commit)
```

| State | Agent can | Agent can't |
|---|---|---|
| Backlog | Read; add new planned cards (3h) | Move, edit or note existing cards |
| Column with no role | Read | Anything else |
| Ready | Read, start, ask a question | Move anywhere except In progress |
| In progress, claimed by this agent | Add notes and steps, release, submit for review | — |
| In progress, claimed by another agent | Read | Anything else |
| Review | Read | Move (the owner moves it back with feedback) |
| Done | Read | Anything |

### Decisions
| # | Decision | Choice |
|---|---|---|
| 2a | Asking a question | `ask_question` adds a question note and a "Question" tag; tagged cards are skipped until the owner removes the tag |
| 2b | Submitting for review | Needs a summary note plus at least one commit, or a reason there is none. Checking commits against GitHub is a later option |
| 2c | Claim lapse | After a period with no activity on the card (default 4 hours, per board); any tool call on the card renews it; a lapsed card returns to Ready with an automatic note |
| 2d | Which card to take | `get_next_card` suggests the top unclaimed Ready card without a Question tag; `start_card` accepts any Ready card by id |
| 2e | Cards per agent | One open claim per connection (one client sign-in) by default, configurable per board |
| 2f | Notes | A notes table (author, agent, time, kind) instead of appending to one text field; needs a lula migration and app change (section 6) |

## 3. The MCP interface

Each MCP primitive is used for what it is for: tools are actions the agent chooses, resources are
content the user or app attaches, prompts are workflows the user starts.

### Tools
| Tool | Does | Annotations |
|---|---|---|
| `list_boards` | Your boards, with their column roles | read-only |
| `get_board` | A board's brief and its cards by column (summaries) | read-only |
| `get_card` | One card in full: steps, notes, files, commits, claim | read-only |
| `get_next_card` | The card to take next (2d), or why there is none | read-only |
| `start_card` | Claim the card, move it to In progress, return the claim id | idempotent for the same connection |
| `add_note` | Add a note to a card you have claimed | — |
| `add_steps` | Add checklist steps to a card you have claimed | — |
| `complete_step` | Tick a step on a card you have claimed (never untick) | idempotent |
| `ask_question` | Question note plus the Question tag (2a) | — |
| `release_card` | Give the card back to Ready, with a reason | — |
| `submit_for_review` | Summary and commits, then move to Review (2b) | — |
| `create_cards` | Planned cards into Backlog, in order, tagged "Planned" | — |
| `update_brief` | Change the board's brief; the owner approves through elicitation | — |
| `create_board` | New board with the owner's default columns; the owner approves through elicitation | — |

Tools for linking a folder to a board are in section 4.

### Resources
```
lula://boards                          all your boards
lula://boards/{board}                  one board
lula://cards/{card}                    one card
lula://cards/{card}/files/{file}       an attachment, with its real MIME type
```
Live updates (resource subscriptions) are a later addition.

### Prompts
| Prompt | Does |
|---|---|
| `work-next-card [card]` | The full "work the next card" workflow |
| `submit-work` | Commit and push, then `submit_for_review` |
| `plan [description]` | Read the repo, brief and existing cards; draft cards; `create_cards` into Backlog |
| `board-status` | What's in progress, waiting on the owner, and answered |

Repo-specific steps (checks to run, commit style) still come from the repo's `AGENTS.md`, which
the prompts tell the agent to follow.

### Decisions
| # | Decision | Choice |
|---|---|---|
| 3a | Tool granularity | Workflow-step tools, not plain data operations: they are what make enforcement possible |
| 3b | Reading | Both tools and resources, sharing one code path; the README explains why |
| 3c | Agents creating cards | Into Backlog only (see 3h) |
| 3d | Ticking steps | Yes on a claimed card; never untick |
| 3e | Results | Every tool declares an output schema and returns structured content plus one line of text |
| 3f | Card ids | Results give the full and short id; tools accept either; an ambiguous short id is refused |
| 3g | Tool names | Plain verbs, no prefix (clients already add the server name) |
| 3h | Planning | `create_cards` writes to Backlog only, in order, tagged "Planned", with no approval needed: agents never take Backlog cards, so the owner keeps To Do by promoting them |
| 3i | Board brief | The project description is the board's brief, which agents read; `update_brief` needs the owner's approval |
| 3j | New boards | `create_board`, with the owner's approval, so a new repo can go from nothing to a planned board |
| 3k | Card size | The plan prompt aims for cards one session can finish, with steps that say when each is done |

## 4. Which board

The agent tells the server which repo it is in through the `repo` parameter (4d). MCP roots are
deprecated in the 2026-07-28 spec, which recommends tool parameters instead, so the server does
not use them.

Resolution order for board-scoped tools:
1. A board named in the call
2. The saved link for this repo
3. A board whose name matches the repo or folder name, offered as a suggestion, never used silently
4. Otherwise ask the owner through elicitation (their boards, plus "create a new board for this
   repo"), and save the answer as the link. Without elicitation, the tool returns "not linked" with
   the board list, and the agent asks in chat.

New tools: `link_board(board, repo)`, `unlink_board(repo)`; `list_boards` shows the current link.

### Decisions
| # | Decision | Choice |
|---|---|---|
| 4a | What identifies a repo | Its normalised git remote URL; repos without a remote fall back to the folder name |
| 4b | Where links live | A lula table of per-user repo → board links, so they work on every machine and remotely, and show in the board's settings |
| 4c | Unlinked repo | The resolution order above |
| 4d | Server learning the repo | Board-scoped tools take an optional `repo`; prompts and tool descriptions have the agent pass `git remote get-url origin`. Every call is self-contained. *Revised: no roots, no session memory* |
| 4e | Card tools | Card ids are unique across boards, so card tools need no board |
| 4f | One repo, several boards | One default board per repo; any tool can name another. Several links per repo later |

## 5. Sign-in and identity

```
  User ──▶ MCP client ──▶ lula MCP server (Cloudflare) ──▶ Supabase (Row Level Security)
```

Delegated access: the server acts on behalf of whoever signed in, never with a service key, so
Row Level Security is the only access control and a server bug cannot reach another user's data.

Flow (MCP authorization, using Cloudflare's OAuth provider library):
1. The client connects, discovers the authorization endpoints from the server's protected
   resource metadata (required by the spec), and identifies itself with a Client ID Metadata
   Document (the spec's preferred way) or, for older clients, dynamic registration (deprecated,
   kept for compatibility). Tokens are requested for the server's address (RFC 8707) and bound to it.
2. The browser opens the server's lula sign-in page (email and password, as in the app), then a
   consent screen with the requested scopes.
3. The server signs in to Supabase for the user and stores that session encrypted in the grant.
4. The client receives the server's own token, never the Supabase session (no token passthrough).
   Each call: the server checks the token, then calls Supabase with the user's session.

Nothing is stored on the user's machine by lula; each client keeps its own token, as for any
connector. Passwords are typed only on lula's sign-in page and never stored.

### Decisions
| # | Decision | Choice |
|---|---|---|
| 5a | Local server | None. Clients connect to the hosted server directly; local running is for development and tests |
| 5b | Where the password is typed | A sign-in page served by the server, passed to Supabase; only the returned session is kept. The server is its own authorization server. Supabase's OAuth server was checked (Q1) and not used: no custom scopes, no audience binding to the MCP server, no Client ID Metadata Documents, and its tokens carry the user's full access; revisit later (L14) |
| 5c | Scopes | `read` (boards, cards), `work` (start, notes, steps, questions, submit, planning into Backlog), `manage` (create_board, update_brief, links). Tools outside the granted scopes are not listed |
| 5d | Agent identity | Notes are signed with the client's name; claims are held by the claim id from `start_card` (1c); the self-reported model is shown for information only. Not a security boundary: every agent acts as its user |
| 5e | Revoking access | A Connected apps page at `/connections` on the server's address (7e): each client, its scopes, last use, revoke. A link from lula Settings later |
| 5f | Local credential storage | Not needed (no local server) |
| 5g | Token lifetime | 1-hour access tokens, rotating refresh tokens; revocation takes effect on the next call; a lula password change signs every connection out |

## 6. Data changes in lula

These live in the lula repo (migrations and app changes) and ship before the server.

| New | For | In the app |
|---|---|---|
| `role` on board columns | 1d | Board settings; filled from matching names |
| Notes table (author, agent, time, kind) | 2f | Timeline in the task sheet |
| Claims table (claim id, connection, agent, last activity) | 1c, 2c | "Being worked on by…" badge on cards |
| Commits table | 2b | Listed with the card's notes |
| Repo links table (per user) | 4b | Board settings, removable |
| Agent settings per board (claim lapse, cards per agent) | 2c, 2e | Board settings |
| Request ids (9e) | Safe retries | Nothing visible |
| "Question" and "Planned" tags | 2a, 3h | Ordinary tags; nothing new |

OAuth grants and tokens live in Cloudflare, not in lula's database.

### Decisions
| # | Decision | Choice |
|---|---|---|
| 6a | Where rules are checked | Agent transitions are Postgres functions that check and change in one atomic step (no double claims), running with the caller's rights so Row Level Security applies. The app keeps editing freely |
| 6b | Existing notes text | The notes field stays as the card's description; new agent notes go to the notes table; old agent notes stay where they are |
| 6c | Lapsed claims | A scheduled job inside the database (pg_cron) returns them to Ready with an automatic note; no keys needed |
| 6d | App work | Minimum: notes timeline, claim badge, column roles, agent settings and linked repos in board settings, commits on the card |
| 6e | Current board script | Kept until the server is live and lula's own `/next-card` runs through it |
| 6f | Release order | Migrations, then app changes, then the server |

## 7. Architecture and repo layout

```
lula-mcp/
  src/
    index.ts        Worker entry: the OAuth provider in front of the MCP handler
    auth/           sign-in page, consent screen, lula sessions, Connected apps page
    mcp/
      server.ts     server setup and capabilities
      tools/        one file per tool: input and output schemas, handler
      resources/
      prompts/
    domain/         workflow rules and board resolution as pure functions: no network, no database
    data/           Supabase access, typed from lula's schema
    lib/            errors, ids, logging
  test/
    unit/           domain rules
    integration/    a real MCP client against the server and the test database
  evals/            scripted agent runs (section 10)
  docs/             DESIGN.md, SECURITY.md, decision records
```

`domain/` holds every rule and depends on nothing else, so it is easy to test and to review. The
database functions (6a) make the final atomic change; `domain/` decides beforehand and explains
refusals.

### Decisions
| # | Decision | Choice |
|---|---|---|
| 7a | Framework | A stateless Worker: Cloudflare's `createMcpHandler` on the official MCP SDK v2, with `@cloudflare/workers-oauth-provider`. Serves 2026-07-28 and 2025-11-25 clients on one endpoint. Elicitation uses the spec's multi round-trip pattern (the tool returns "input required", the client retries with the answer); a pending approval rides in signed `requestState`. No Durable Objects. *Revised: `McpAgent` is deprecated and the spec dropped sessions* |
| 7b | Schema ownership | The lula repo owns the schema and the agent functions; this repo checks in generated types, and CI fails if they drift |
| 7c | Tooling | TypeScript strict; zod for every tool's input and output schema; Vitest with Cloudflare's Workers pool; Wrangler; Biome |
| 7d | Environments | A separate free test Supabase project (same migrations, seed script) for integration tests, evals and staging; production uses the lula project |
| 7e | Address | Cloudflare's free `workers.dev` address, from the first deploy through launch: production `lula-mcp.<account>.workers.dev`, staging `lula-mcp-staging.<account>.workers.dev`. No custom domain: lula.today stays registered and hosted at Netlify, untouched (Netlify does not allow other nameservers, and Cloudflare only serves Workers on domains it manages). The address is the OAuth issuer and resource, so moving to a custom domain later signs every connection out once (L15). *Revised 2026-11-14: replaces transferring lula.today to Cloudflare* |

## 8. Safety

Safety comes from what the server makes impossible, not from asking agents to behave. This
section becomes `SECURITY.md`.

| Risk | Why it cannot happen |
|---|---|
| An agent deletes cards or marks them done | No such tools exist (1, 2) |
| An agent breaks the workflow | The server and the database functions refuse invalid moves (2, 6a) |
| A bug exposes another user's boards | Delegated access; Row Level Security decides (5) |
| A stolen token works forever | One-hour, audience-bound, revocable tokens (5g) |
| The service key leaks | There is no service key anywhere (5) |

Prompt injection (card text trying to steer the agent) cannot be reliably detected, so the design
limits the damage: the worst a fooled agent can do is add notes, claim a card or plan into
Backlog; card text comes back in labelled fields, tool descriptions say it is user content, and
the text summary never repeats raw card text; owner approvals go through elicitation, which the
agent cannot answer.

### Decisions
| # | Decision | Choice |
|---|---|---|
| 8a | Client identity | Clients with a Client ID Metadata Document show the host that publishes it; dynamically registered clients are accepted but marked "not verified". The consent screen always shows the client name and redirect host |
| 8b | Limits (configurable) | Note 4,000 characters; 50 steps per `add_steps`; 20 cards per `create_cards`; 120 calls a minute per user; stricter limits on sign-in attempts per IP |
| 8c | Audit trail | Every agent change adds an automatic timeline entry on the card; every call is logged (user, tool, card, outcome) |
| 8d | Logging | Never card text, passwords, tokens or file contents; 30-day retention |
| 8e | Pre-launch checks | Threat model walk-through, an automated security review, sign-in tested with the MCP Inspector and every supported client, and a test for each "cannot happen" row |
| 8f | Disclosure | `SECURITY.md` with private reporting through GitHub security advisories and an expected response time |

## 9. Contracts

Tool names, inputs and outputs are a public API: agents, prompts and people's setups depend on them.

Refusals come back as tool errors (`isError`) with structured content the agent can act on:

```json
{ "code": "CLAIMED_BY_OTHER",
  "message": "Codex is working on this card (since 10:42).",
  "hint": "Pick another card with get_next_card, or ask the owner to release it." }
```

| Code | Meaning |
|---|---|
| `CARD_NOT_FOUND`, `AMBIGUOUS_ID` | No card matches the id, or a short id matches several |
| `NOT_WORKABLE` | The card is in Backlog or a column without a role |
| `WRONG_STATE` | The move isn't allowed from the card's current state |
| `CLAIMED_BY_OTHER`, `NOT_CLAIMED` | Another session holds the card, or it must be started first |
| `LIMIT_REACHED` | Cards-per-agent or a size limit (8b) reached |
| `REPO_NOT_LINKED` | No board linked to this repo (4) |
| `SCOPE_MISSING` | The connection lacks the scope (5c) |
| `APPROVAL_DECLINED` | The owner said no through elicitation |
| `NEEDS_COMMIT` | Submitting needs a commit or a reason there is none (2b) |
| `RATE_LIMITED`, `UPSTREAM_UNAVAILABLE` | Retry later, or lula's database can't be reached |

### Decisions
| # | Decision | Choice |
|---|---|---|
| 9a | Error kinds | Rule refusals are tool errors with `{code, message, hint, details}`; protocol errors only for malformed calls or unknown tools |
| 9b | Error codes | The fixed list above; codes are never renamed; evals check each appears when it should |
| 9c | Versioning | Semver for the server: additions are minor, removals and renames major; old names keep working for at least one minor version, described "Deprecated: use X"; a changelog and tagged GitHub releases; supports MCP 2026-07-28 and 2025-11-25, listed in the README and in the spec's unsupported-version error |
| 9d | Pagination | `get_board` returns up to 50 cards per column with a cursor; `list_boards` the same |
| 9e | Retries | `start_card` and `complete_step` are safe to repeat; `create_cards` and `submit_for_review` take an optional request id, and a retry with the same id returns the first result (kept in lula's database, since the server holds no state) |
| 9f | Dates | UTC ISO 8601 in structured content; relative times ("2 hours ago") in the text line |
| 9g | Tool documentation | `docs/tools.md` generated from the zod schemas, CI fails if stale; descriptions written for models: what, when to use, when not, an example |

## 10. Testing and evals

Tests prove the code does what it should; evals prove models use the server well.

| Scenario (eval) | Passes if |
|---|---|
| Work the next card | The top Ready card ends in Review with a summary and a commit |
| Unclear card | The agent asks a question rather than guessing |
| Card already claimed | The agent picks another card instead of fighting over it |
| Backlog only | Nothing in Backlog is moved or changed |
| Prompt injection in a card | Nothing outside the rules happens, and the agent reports it |
| Plan from a description | Sensible cards in Backlog, in order, tagged Planned |
| Unlinked repo | The agent links it through elicitation or asks in chat |
| Tool choice | Across 20 short requests, the model picks the right tool |

### Decisions
| # | Decision | Choice |
|---|---|---|
| 10a | Rule tests | Every allowed and refused move, error code and resolution step in `domain/`; full branch coverage there, enforced in CI |
| 10b | Database tests | pgTAP in the lula repo: concurrent `start_card` (one winner), Row Level Security between users, the lapsed-claim job |
| 10c | Integration tests | The official MCP client over Streamable HTTP against the server in Cloudflare's test runtime and the seeded test project: scripted OAuth, refresh and revoke, every tool against its output schema, elicitation accepted, declined and unsupported, a test per "cannot happen" row (8) |
| 10d | Evals | Scenarios above, graded by checking the board's final state, not by a model; Claude models through the API; several runs each, reported as pass rates; results table in the README |
| 10e | Protocol checks | MCP Inspector before each release; a test that every tool has schemas, annotations and a description; a test that missing scopes hide tools |
| 10f | CI | GitHub Actions: lint, typecheck, unit, integration and generated-file checks on every pull request; evals nightly and on PRs labelled `evals` (or touching descriptions, prompts or schemas); keys as GitHub secrets |

## 11. Distribution

| Client | Connect |
|---|---|
| Claude Code | `claude mcp add --transport http lula https://lula-mcp.<account>.workers.dev/mcp` |
| Codex | `[mcp_servers.lula]` with `url = "https://lula-mcp.<account>.workers.dev/mcp"` in `~/.codex/config.toml`, then `codex mcp login lula` |
| Claude Desktop, claude.ai | Settings › Connectors › Add custom connector, paste the URL |

The first tool call opens lula's sign-in in the browser.

README order: one-line purpose and a GIF of an agent working a card; connecting; why it is built
this way (links to DESIGN.md and decision records); eval results; security model; tool reference.

### Decisions
| # | Decision | Choice |
|---|---|---|
| 11a | Connecting | URL only; a copyable snippet per supported client in the README |
| 11b | Claude Code plugin | Shipped in the same repo: connects the server and adds `/next-card`, `/plan`, `/board`, which call the prompts. The server stays the product |
| 11c | Listings | Official MCP Registry with `server.json` at launch, under the GitHub namespace (`io.github.<owner>/lula-mcp`), which needs no domain; directories later (L11) |
| 11d | Showcase | README written for someone judging the design; decision records in `docs/decisions/`, one per major choice |
| 11e | Licence and use | MIT; the hosted server serves any lula account; self-hosting documented for development only |
| 11f | Landing page | The server's root address (7e) shows what it is, the connect URL and the repo link; MCP on `/mcp`; Connected apps on the same site |

## 12. Running it

| Secret | Where |
|---|---|
| Supabase URL and publishable key | Wrangler variables (the same ones the app ships) |
| Grant encryption key (stored Supabase sessions) | Wrangler secret |
| Test project keys, Anthropic API key | GitHub secrets (CI only) |

### Decisions
| # | Decision | Choice |
|---|---|---|
| 12a | Deploys | Staging deploys on merge to `main` (workers.dev, test project, nightly evals); production deploys on a tagged release after approval in GitHub Actions; `wrangler rollback` to go back |
| 12b | Secrets | Only those above, listed in SECURITY.md; no service key |
| 12c | Monitoring | Workers Logs (30 days); `/health` checks lula's database; a free outside uptime check with email; a Cloudflare error-rate alert |
| 12d | Cost | Free tiers (no Durable Objects needed; KV writes only on sign-in and token refresh); Workers Paid ($5/month) if limits are reached; no domain cost (7e); a monthly spending cap on the eval API key and small nightly runs |
| 12e | Dependencies | Weekly Dependabot pull requests, merged when CI passes |
| 12f | Incidents | `docs/runbook.md`: read-only mode (one variable, notice on the landing page), sign everyone out by rotating the grant key, roll back |
| 12g | Server data | Only OAuth grants, in Cloudflare KV; losing them means signing in again. Board data stays in Supabase |

## 13. Phases

Get it working first, then the extras. Each phase ends with something usable and a check.

| Phase | Builds | Done when |
|---|---|---|
| 0. Settle and set up | Answer Q3; create the repo (owner approves) with the section 7 skeleton and CI; test Supabase project | CI green on an empty server |
| 1. lula's data (lula repo) | Section 6 migrations; agent functions (6a); lapsed-claim job (6c); pgTAP (10b); minimum app work (6d); test project, then production (6f) | pgTAP passes, race test included; the app shows the new notes |
| 2. Signed in and reading | Worker, OAuth, sign-in and consent; `list_boards`, `get_board`, `get_card`; resources; deployed to workers.dev | Claude Code connects by URL, signs in, reads the lula board |
| 3. Working cards | `get_next_card`, `start_card`, notes, steps, `complete_step`, `ask_question`, `release_card`, `submit_for_review`; error codes (9b); `work-next-card` and `submit-work` prompts; first eval | lula's own `/next-card` runs through the server (board script kept as fallback) |
| 4. Planning and linking | Repo links, `link_board`; elicitation; `create_cards`, `update_brief`, `create_board`; `manage` scope; `plan` and `board-status` prompts | A new repo goes from nothing to a planned board in one conversation |
| 5. Quality bar | All evals and tool-choice evals, README results; full integration suite; generated tool docs; rate limits (8b); Connected apps page (5e); SECURITY.md, runbook, decision records; Codex, Claude Desktop, claude.ai tested; 8e checks | Every 8e check passes and every supported client works |
| 6. Launch | Production on `lula-mcp.<account>.workers.dev` (7e); landing page; plugin; MCP Registry; README GIF; v1.0.0 | A new user connects from the README alone |
| 7. Later | L1–L13 become Backlog cards; the owner orders them | — |

### Decisions
| # | Decision | Choice |
|---|---|---|
| 13a | Phase order | As above |
| 13b | Tests | Written in each phase; evals start in phase 3 and are completed in phase 5 |
| 13c | Where cards live | lula repo work on the **lula** board; server work on the **Lula MCP** board (Dev realm); all into Backlog tagged Planned for the owner to promote |
| 13d | Repo visibility | Public from the first commit; created only on the owner's approval |
| 13e | Versions | 0.x until launch, 1.0.0 at launch |
| 13f | Using it for real | lula's `/next-card` switches over at the end of phase 3; the board script is deleted after launch (L6) |

## Later

Deliberately held back until the server works. Each will become a Backlog card.

| # | Item | From |
|---|---|---|
| L1 | Check submitted commits against GitHub | 2b |
| L2 | Live updates when a card changes (`subscriptions/listen` in 2026-07-28) | 3 |
| L3 | Several boards linked to one repo (monorepos) | 4f |
| L4 | Connected apps shown in lula's Settings | 5e |
| L5 | One-off script moving old agent notes into the notes table | 6b |
| L6 | Delete the board script and `LULA_PASSWORD` once the server is live | 6e |
| L7 | Official support for more clients (Cursor, VS Code) | 1b |
| L8 | External security review | 8e |
| L9 | Evals on other models (GPT through Codex, Gemini), with pass rates compared | 10d |
| L10 | Load testing many sessions at once | 10 |
| L11 | Submit to Anthropic's connector directory and other client directories | 11c |
| L12 | Demo video or design write-up (blog post) | 11d |
| L13 | Public status page and uptime history | 12c |
| L14 | Revisit Supabase as the authorization server once it has custom scopes and audience binding | 5b |
| L15 | A custom domain (a cheap one registered at Cloudflare, not lula.today); every connection signs in again once | 7e |

### Replaced, not postponed
| Item | Why |
|---|---|
| Local (stdio) server and local credential storage | The hosted server covers every supported client; local added a second sign-in system for little gain (5a, 5f) |
| `.lula-board` files in repos | The remote server cannot read them; repo links in lula's database replace them (4a, 4b) |
| `propose_card` | Folded into `create_cards` (3h) |
| MCP roots | Deprecated in 2026-07-28; the `repo` parameter replaces them (4d) |
| Transferring lula.today to Cloudflare for `mcp.lula.today` | Weeks of transfer for a nicer URL; workers.dev works the same (7e) |
| `McpAgent` and a Durable Object per session | Deprecated by Cloudflare, and the spec dropped sessions; a stateless handler and claim ids replace them (7a, 1c) |

## Open questions
| # | Question | Affects | Status |
|---|---|---|---|
| Q1 | Can Supabase act as the authorization server? | 5b | Settled 2026-11-03: it can, but not well enough for MCP yet (5b, L14) |
| Q2 | Does Codex connect to remote MCP servers with OAuth? | 1b, 11a | Settled: yes, `url` in config.toml and `codex mcp login` |
| Q3 | Does `@cloudflare/workers-oauth-provider` support Client ID Metadata Documents and RFC 8707 resource binding? If not, add them or wrap it | 5, 8a | Open: check in phase 0 |
| Q4 | When do Claude Code, Claude Desktop and claude.ai switch to 2026-07-28? Supporting both versions (7a) makes this a test matter, not a blocker | 1b, 10c | Open: check in phase 5 |
| Q5 | Where is lula.today registered? | 7e | Settled: Netlify. Not transferred; the server uses workers.dev (7e, revised 2026-11-14) |
