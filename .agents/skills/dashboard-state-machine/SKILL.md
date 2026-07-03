---
name: dashboard-state-machine
description: Use when adding or updating entity state visualization — state getter function + tone map pattern for EntityStateBadge.
---

# Dashboard State Machine

## Scope

- Covers: entity status visualization via `EntityStateBadge`.
- Use when an entity has multiple states that need distinct visual styling.
- Pattern: state getter function → tone map → `EntityStateBadge` in list cells and detail pages.

## Reference implementation

`lib/items-records.ts` — complete working example:

```ts
export type ItemState = "active" | "archived" | "deleted"

export function getItemState(item: ItemRecord): ItemState {
  return item.status as ItemState
}

export const itemStateTone: Record<ItemState, EntityBadgeTone> = {
  active: "default", // green
  archived: "secondary", // amber
  deleted: "destructive", // red
}
```

## Pattern template

```ts
// lib/{module}-records.ts

import type { InferSelectModel } from "drizzle-orm"
import { myTable } from "@/db/{module}/schema"

export type EntityBadgeTone = "default" | "secondary" | "destructive" | "outline"
export type MyRecord = InferSelectModel<typeof myTable>

// 1. State type — union of all possible states
export type MyEntityState = "active" | "suspended" | "banned" | "deleted"

// 2. Getter — pure function, no side effects
export function getMyEntityState(record: MyRecord): MyEntityState {
  if (record.deletedAt) return "deleted"
  if (record.bannedAt) return "banned"
  if (record.suspendedAt) return "suspended"
  return "active"
}

// 3. Tone map — one entry per state
export const myEntityStateTone: Record<MyEntityState, EntityBadgeTone> = {
  active: "default", // green — healthy
  suspended: "secondary", // amber — warning
  banned: "destructive", // red — blocked
  deleted: "destructive", // red — gone
}
```

## Tone semantics

| Tone            | Color | Use for                            |
| --------------- | ----- | ---------------------------------- |
| `"default"`     | Green | Healthy / active / enabled         |
| `"secondary"`   | Amber | Warning / degraded / archived      |
| `"destructive"` | Red   | Blocked / banned / deleted / error |
| `"outline"`     | Gray  | Unknown / neutral / pending        |

## Usage in list columns

```tsx
columnHelper.accessor("status", {
  header: ({ column }) => <EntityTableHeader title="Status" column={column} />,
  cell: ({ row }) => {
    const state = getMyEntityState(row.original)
    return <EntityStateBadge label={state} tone={myEntityStateTone[state]} />
  },
})
```

## Usage in show pages

```tsx
<EntityDetailItem
  label="Status"
  value={<EntityStateBadge label={state} tone={myEntityStateTone[state]} />}
/>
```

## Row highlighting (optional)

For banned/destructive records, add a subtle row background:

```tsx
<DataTable
  table={table}
  getRowClassName={(record) => (getMyEntityState(record) === "banned" ? "bg-destructive/10" : "")}
/>
```

## Checklist

- [ ] State type covers all possible states (check DB enum / nullable fields)
- [ ] Getter handles all null/undefined gracefully (fallback to neutral state)
- [ ] Tone map has entry for every state in the union type
- [ ] State is derived from record fields, not computed from API response
- [ ] File lives in `lib/{module}-records.ts` alongside other record helpers
