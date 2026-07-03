---
name: dashboard-refine-data-provider-wiring
description: Use when wiring a Dashboard resource to a backend data provider. Covers module routing in `lib/refine/server-data-provider.ts`, provider allowlists in `lib/refine/*-data-provider.ts`, and schema/client alignment.
---

# Dashboard Refine Data Provider Wiring

## Scope

- Covers: connecting a resource name to its backend DB provider.
- Goal: ensure `/api/admin/{resource}` dispatches to the correct DB and table.
- Coverage: `lib/refine/server-data-provider.ts`, `lib/refine/*-data-provider.ts`, `db/{module}/{schema,client}.ts`.

## Current dispatch structure

```
app/api/admin/[resource]/route.ts
  → getServerDataProvider(resource)
  → lib/refine/server-data-provider.ts — switch on module
  → get{Module}DataProvider()
  → lib/refine/{module}-data-provider.ts
  → DB via Drizzle ORM
```

## Adding a resource to an existing module (common case)

### 1. Add table to schema

In `db/{module}/schema.ts`:

```ts
export const myTable = sqliteTable("my_table", { ... })
export const {module}Schema = { existingTable, myTable }  // ← add here
```

### 2. Add to provider allowlist

In `lib/refine/{module}-data-provider.ts`:

```ts
const {module}Resources = new Set<{Module}Resource>(["existingTable", "myTable"])  // ← add
```

### 3. Register in dashboard-resources.ts

Add resource definition with correct `module` value.

## Adding a new module (less common)

Use `dashboard-new-module` skill — it covers the full end-to-end setup.

## Notes

- Providers only customize `getList` (pagination/sorting/filtering/count).
  Other operations (getOne, create, update, delete) use `createRefineSQL` defaults.
- Keep the module-level provider promise caching pattern — avoids reconnecting on every request.
- SQLite provider: synchronous `db()` call; no `await` needed for connection.
- For MySQL/Postgres: use `ensure*Connection()` with an async connection pool.

## Pre-checklist before adding

- [ ] `client-data-provider.ts` sends the same resource name as registered
- [ ] `server-data-provider.ts` has a switch case for this module
- [ ] Provider allowlist includes the new resource name
- [ ] Schema key matches the resource name used in `dashboardResourceDefinitions`
- [ ] `lib/refine/field-whitelist.ts` imports the updated schema

## References

- [provider-wiring-contracts.md](references/provider-wiring-contracts.md)
