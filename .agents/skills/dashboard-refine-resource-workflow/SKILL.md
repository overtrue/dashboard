---
name: dashboard-refine-resource-workflow
description: Use when adding or modifying Dashboard resource pages. Handles Refine list/show route scaffolding, sidebar wiring, and dashboard resource metadata alignment across `lib/dashboard-resources.ts`, `app/dashboard/resources/*`, and client/server Refine entry points.
---

# Dashboard Refine Resource Workflow

## Scope

- Applicable to: resource pages and sidebar navigation in any dashboard built with this framework.
- Goal: when adding/migrating a resource, keep "route path, resource name, and module dispatch" consistent.
- Not applicable to: DB modeling or migrations (see `dashboard-new-module`).

## Core flow (required)

### 1. Confirm the resource module

Check which module the table belongs to:

- `db/example/schema.ts` — the built-in example module
- `db/{your-module}/schema.ts` — any custom module you added

Resource name uses camelCase (matching schema object key), path uses kebab-case.
Resource name must match the API path `/api/admin/{resource}`.

### 2. Update `lib/dashboard-resources.ts`

Add/update an entry in `dashboardResourceDefinitions`:

```ts
{
  name: "widgets",           // camelCase — matches API and schema key
  module: "example",         // module name — matches server-data-provider dispatch
  label: "Widgets",          // English display name
  sidebarLabel: "Widgets",   // optional: different sidebar label
  list: "/dashboard/resources/widgets",
  show: "/dashboard/resources/widgets/show/:id",
  group: "resources",        // "overview" | "resources" | "operations" | "system"
}
```

For hidden sub-resources (e.g. relation pages):

```ts
{
  name: "widgetTags",
  module: "example",
  label: "Widget Tags",
  hide: true,
  parent: "widgets",
}
```

### 3. Create page routes

- List: `app/dashboard/resources/{kebab-name}/page.tsx`
- Show: `app/dashboard/resources/{kebab-name}/show/[id]/page.tsx`
- Operations: `app/dashboard/operations/{kebab-name}/page.tsx`

### 4. List page — Refine pattern

```tsx
"use client"
import { useTable } from "@refinedev/react-table"
import { DataTable } from "@/components/refine-ui/data-table/data-table"
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view"

export default function WidgetsPage() {
  const table = useTable({
    columns,
    refineCoreProps: { resource: "widgets", pagination: { pageSize: 25 } },
  })
  return (
    <ListView>
      <ListViewHeader />
      <DataTable table={table} />
    </ListView>
  )
}
```

### 5. Show page — Refine pattern

```tsx
"use client"
import { useShow } from "@refinedev/core"
import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view"
import { EntitySection, EntityDetailGrid, EntityDetailItem } from "@/components/entity-ui"

export default function WidgetShowPage() {
  const params = useParams<{ id: string }>()
  const { query, result: widget } = useShow({ resource: "widgets", id: params.id })

  if (query.isLoading) return <div className="bg-muted/40 h-72 animate-pulse rounded-lg" />

  return (
    <ShowView>
      <ShowViewHeader resource="widgets" title={widget?.name} />
      <EntitySection title="Widget Details">
        <EntityDetailGrid>
          <EntityDetailItem label="ID" value={widget?.id} />
          <EntityDetailItem label="Name" value={widget?.name} />
        </EntityDetailGrid>
      </EntitySection>
    </ShowView>
  )
}
```

### 6. Add sidebar icon (visible resources only)

In `components/app-sidebar.tsx`, add to `resourceIcons`:

```ts
const resourceIcons: Record<string, React.ReactNode> = {
  // existing...
  widgets: <RiWidgetLine />,
}
```

## Common pitfalls

- Resource name mismatch → `Unsupported dashboard resource` or 404
- Missing `list` in resource definition → sidebar shows empty item
- Schema key is `orgMembers` (camelCase), table is `org_member` — route should still use `org-members` (kebab)
- `hide: true` without `parent` → tree navigation loses context

## Checklist

- [ ] `dashboardResourceDefinitions` has correct `list`/`show` config
- [ ] Page files exist under `app/dashboard/resources/{resource}/`
- [ ] Resource name matches `/api/admin/{resource}`
- [ ] Sidebar group (overview/resources/operations/system) is correct
- [ ] `hide: true` resources have `parent` set

## References

- [dashboard-resource-contracts.md](references/dashboard-resource-contracts.md)
