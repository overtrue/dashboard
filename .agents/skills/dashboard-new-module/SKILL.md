---
name: dashboard-new-module
description: Use when adding a brand-new data module to the dashboard — new DB connection, schema, data provider, and resource pages from scratch.
---

# Dashboard New Module

## Scope

- Covers: building a complete new data module end-to-end.
- Use when you need a new DB schema, connection, Refine data provider, and at least one list/show page.
- Not for: adding a resource to an **existing** module (use `dashboard-refine-data-provider-wiring` instead).

## Reference implementation

The `example` module is the canonical reference:

- `db/example/schema.ts` — table definitions + schema export
- `db/example/client.ts` — Drizzle SQLite client + `ensureExampleDatabaseConnection()`
- `lib/refine/example-data-provider.ts` — provider implementation
- `lib/refine/server-data-provider.ts` — module dispatch
- `lib/dashboard-resources.ts` — resource definitions
- `app/dashboard/resources/items/` — list + show pages
- `lib/items-records.ts` — state machine + formatters

## Step-by-step

### 1. Create the DB client (`db/{module}/client.ts`)

```ts
import "server-only"
import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import * as schema from "./schema"

let db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function {module}Db() {
  if (db) return db
  const dbPath = process.env.{MODULE}_DB_PATH ?? "./{module}.db"
  const sqlite = new Database(dbPath)
  sqlite.pragma("journal_mode = WAL")
  sqlite.pragma("foreign_keys = ON")
  db = drizzle(sqlite, { schema })
  return db
}

export async function ensure{Module}DatabaseConnection() {
  {module}Db()
}
```

For MySQL/Postgres, follow the same `ensure*` pattern using `mysql2`/`pg` with connection pooling.

### 2. Define the schema (`db/{module}/schema.ts`)

```ts
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const widgets = sqliteTable("widgets", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  status: text("status", { enum: ["active", "archived"] }).notNull().default("active"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
})

export const {module}Schema = { widgets }
```

### 3. Create the data provider (`lib/refine/{module}-data-provider.ts`)

```ts
import "server-only"
import { createRefineSQL } from "refine-sqlx"
import type { DataProvider } from "@refinedev/core"
import { {module}Db } from "@/db/{module}/client"
import { {module}Schema } from "@/db/{module}/schema"
import { DashboardError } from "@/lib/errors"
import { createDrizzleGetList } from "@/lib/refine/drizzle-list"

type {Module}Resource = keyof typeof {module}Schema
const {module}Resources = new Set<{Module}Resource>(["widgets"])

function get{Module}Table(resource: string) {
  if (!{module}Resources.has(resource as {Module}Resource)) {
    throw new DashboardError(`Unsupported {module} resource: ${resource}`, 404)
  }
  return {module}Schema[resource as {Module}Resource]
}

let baseProviderPromise: ReturnType<typeof createRefineSQL> | null = null
let {module}DataProviderPromise: Promise<DataProvider> | null = null

async function getBase{Module}Provider() {
  const db = {module}Db()
  baseProviderPromise ??= createRefineSQL({
    connection: db as never,
    schema: {module}Schema,
  })
  return baseProviderPromise
}

export async function get{Module}DataProvider(): Promise<DataProvider> {
  {module}DataProviderPromise ??= (async () => {
    const base = (await getBase{Module}Provider()) as DataProvider
    const db = {module}Db()
    return {
      ...base,
      getList: createDrizzleGetList({ db, getTable: get{Module}Table }),
    }
  })()
  return {module}DataProviderPromise as Promise<DataProvider>
}
```

### 4. Register in `lib/refine/field-whitelist.ts`

Add the new schema to the `schemas` array:

```ts
import { {module}Schema } from "@/db/{module}/schema"

const schemas: Record<string, Table>[] = [
  exampleSchema as Record<string, Table>,
  {module}Schema as Record<string, Table>,   // ← add this line
]
```

### 5. Register in `lib/refine/server-data-provider.ts`

```ts
import { get{Module}DataProvider } from "@/lib/refine/{module}-data-provider"

type DataProviderModule = "example" | "{module}"

const providerCache = {
  example: null,
  {module}: null,   // ← add
}

// In getServerDataProvider switch:
case "{module}":
  return getCachedDataProvider("{module}", get{Module}DataProvider)
```

### 6. Register resources in `lib/dashboard-resources.ts`

```ts
// In dashboardResourceDefinitions array:
{
  name: "widgets",
  module: "{module}",
  label: "Widgets",
  sidebarLabel: "Widgets",
  list: "/dashboard/resources/widgets",
  show: "/dashboard/resources/widgets/show/:id",
  group: "resources",
},
```

Also update `DashboardModule` type:

```ts
type DashboardModule = "example" | "operations" | "{module}"
```

### 7. Create list + show pages

Follow the `items` reference:

- `app/dashboard/resources/widgets/page.tsx` — `useTable` + `DataTable` + `ListViewHeader`
- `app/dashboard/resources/widgets/show/[id]/page.tsx` — `useShow` + `ShowView` + `EntityDetailGrid`

### 8. Add state machine (`lib/{module}-records.ts`)

See `dashboard-state-machine` skill.

### 9. Add sidebar icon

In `components/app-sidebar.tsx`, add to `resourceIcons`:

```ts
widgets: <RiWidgetLine />,
```

## Checklist

- [ ] DB client created with `ensure*Connection()` function
- [ ] Schema exported as `{module}Schema`
- [ ] Data provider created and cached
- [ ] `field-whitelist.ts` imports new schema
- [ ] `server-data-provider.ts` dispatches to new provider
- [ ] Resources registered in `lib/dashboard-resources.ts`
- [ ] `DashboardModule` type updated
- [ ] List page renders correctly
- [ ] Show page renders correctly
- [ ] Sidebar icon added

## References

- [module-wiring-contracts.md](references/module-wiring-contracts.md)
