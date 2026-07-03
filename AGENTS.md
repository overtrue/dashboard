# Dashboard Admin Framework

A production-grade admin dashboard framework built on Next.js 16, Refine, Drizzle ORM, and shadcn/ui. Ships with a working SQLite example module and a set of skills that let an agent add new modules end-to-end without prior project knowledge.

## Canonical agent surface

- `AGENTS.md` is the only repository-level agent instruction file.
- `.agents/skills/` is the only checked-in skill directory.
- Do not add `CLAUDE.md`, `.claude/`, or duplicated agent instruction surfaces.
- README.md starts with a copy-paste bootstrap prompt for external coding agents.

## Tech stack

| Layer        | Technology                                        |
| ------------ | ------------------------------------------------- |
| Framework    | Next.js 16 (App Router) + React 19                |
| Data / State | Refine 5 + TanStack React Table 8 + React Query 5 |
| ORM          | Drizzle ORM 0.45                                  |
| DB (example) | SQLite via `better-sqlite3`                       |
| UI           | shadcn/ui + Tailwind CSS 4                        |
| Icons        | `@remixicon/react` (only)                         |

## Quick start

```bash
pnpm install
pnpm db:generate    # generate migration files
pnpm db:push        # apply schema to SQLite
pnpm db:seed        # seed example data + admin user
pnpm dev            # start on http://localhost:3000
```

Default credentials: **admin / admin123**

## Project structure

```
app/
  api/admin/[resource]/          # generic CRUD handler
  dashboard/
    resources/{resource}/        # list + show pages
    operations/{operation}/      # write-operation pages
  login/                         # login page
components/
  ui/                            # shadcn/ui components
  refine-ui/                     # Refine wrappers (DataTable, ListView, ShowView, buttons)
  entity-ui.tsx                  # EntityDetailGrid, EntityRelationTable, EntityStateBadge, etc.
  operations/                    # DryRunActionButton, SqlViewer
  app-sidebar.tsx                # navigation sidebar
lib/
  dashboard-resources.ts         # resource registry (single source of truth)
  refine/
    server-data-provider.ts      # module dispatch
    client-data-provider.ts      # client-side fetcher
    drizzle-list.ts              # paginated getList factory
    field-whitelist.ts           # security: validates filter/sort fields against schema
    example-data-provider.ts     # example provider
  items-records.ts               # example state machine + formatters
db/example/
  schema.ts                      # items + admins tables
  client.ts                      # SQLite connection
  seed.ts                        # initial data
```

## Adding a new module

Use the skills under `.agents/skills/`:

| Scenario                           | Skill                                                                          |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| New DB + schema + provider + pages | `dashboard-new-module`                                                         |
| Add resource to existing module    | `dashboard-refine-resource-workflow` + `dashboard-refine-data-provider-wiring` |
| Add admin write operation          | `dashboard-operations-page`                                                    |
| Add entity status visualization    | `dashboard-state-machine`                                                      |

## Environment variables

```bash
# Session signing secret (min 32 chars)
DASHBOARD_SESSION_SECRET=change-me-in-production-min-32-chars

# SQLite database path (defaults to ./example.db)
EXAMPLE_DB_PATH=./example.db
```

## Coding conventions

See `.rules.md` for full rules. Key constraints:

- **Icons**: only `@remixicon/react` — no `lucide-react`
- **UI**: only `@/components/ui` shadcn components
- **Headers**: use the page-specific header (`ListViewHeader`, `ShowViewHeader`, `CreateViewHeader`, `EditViewHeader`)
- **State visualization**: always use state getter + tone map + `EntityStateBadge`

## Quality gates

Run validation sequentially from the repository root:

```bash
pnpm format:check
pnpm check
```

For UI/layout changes, also run a browser smoke test for login, one list page, one detail page, and one operation page.
