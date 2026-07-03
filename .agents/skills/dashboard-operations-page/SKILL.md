---
name: dashboard-operations-page
description: Use when adding a new admin operations page — dry-run preview, SQL preview, and destructive/non-CRUD actions under app/dashboard/operations/.
---

# Dashboard Operations Page

## Scope

- Covers: one-off admin write operations that don't fit standard CRUD.
- Examples: archive/delete in bulk, grant credits, generate codes, ban users.
- Not for: regular list/show/edit pages (use `dashboard-refine-resource-workflow`).

## Reference implementation

`app/dashboard/operations/example/page.tsx` — full working example with:

- Input form
- `DryRunActionButton` with `onPrepare` / `onExecute` / `renderPlan`
- `SqlViewer` for SQL preview
- `EntityDetailGrid` / `EntityDetailItem` for plan summary
- Success/error feedback

## Page anatomy

```
/dashboard/operations/{kebab-name}/page.tsx
```

Must register in `lib/dashboard-resources.ts`:

```ts
{
  name: "{kebab-name}",
  module: "operations",
  label: "...",
  list: "/dashboard/operations/{kebab-name}",
  group: "operations",
}
```

`module: "operations"` — these pages don't go through a data provider.

## DryRunActionButton pattern

```tsx
<DryRunActionButton<TPayload, TPlan>
  payload={formPayload}
  disabled={!isFormReady}
  variant="destructive"    // destructive for irreversible, "default" for reversible
  onPrepare={async (payload) => {
    // 1. Validate input
    // 2. Fetch affected records
    // 3. Build preview SQL (optional)
    // 4. Return plan
    return { ... }
  }}
  onExecute={async (payload, plan) => {
    // Execute the actual operation
  }}
  renderPlan={(plan) => (
    <>
      <EntityDetailGrid>
        <EntityDetailItem label="Affected rows" value={plan.count} />
      </EntityDetailGrid>
      <EntitySection title="SQL Preview">
        <SqlViewer sql={plan.sql} />
      </EntitySection>
    </>
  )}
  isConfirmDisabled={(plan) => plan.count === 0}
  onSuccess={() => { /* reset form, show success */ }}
  modalTitle="Confirm operation"
  confirmLabel="Execute"
>
  Preview
</DryRunActionButton>
```

## Variant guidelines

| Scenario                    | variant         |
| --------------------------- | --------------- |
| Irreversible (delete, ban)  | `"destructive"` |
| Reversible (archive, grant) | `"default"`     |
| Read-only preview           | `"outline"`     |

## Checklist

- [ ] Registered in `lib/dashboard-resources.ts` with `module: "operations"`
- [ ] Form validates before enabling button
- [ ] `onPrepare` fetches and validates affected records
- [ ] `renderPlan` shows enough info for operator to confirm
- [ ] `isConfirmDisabled` returns true when plan has nothing to execute
- [ ] Success callback resets the form
- [ ] Sidebar icon added in `components/app-sidebar.tsx`

## References

- [operations-contracts.md](references/operations-contracts.md)
