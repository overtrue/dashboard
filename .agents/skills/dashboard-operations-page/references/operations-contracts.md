# Dashboard Operations Page Contracts

## Routing

- Operations pages live under `app/dashboard/operations/{kebab-name}/page.tsx`
- Route registered in `lib/dashboard-resources.ts` with `module: "operations"`, `group: "operations"`
- Operations do NOT go through `/api/admin/{resource}` unless explicitly calling REST endpoints

## DryRunActionButton flow

1. User fills form → button enabled
2. User clicks "Preview" → `onPrepare(payload)` called
3. Plan returned → Dialog opens with `renderPlan(plan)` content
4. User reviews → clicks confirm → `onExecute(payload, plan)` called
5. On success → `onSuccess()` called, dialog closes

## Error handling

- `onPrepare` throw → error shown below button, dialog does NOT open
- `onExecute` throw → error shown inside dialog, dialog stays open

## When to add custom API endpoint vs reuse /api/admin/{resource}

- Reuse `/api/admin/{resource}` for single-record PATCH/DELETE operations
- Add `/api/{operation}/route.ts` for bulk operations or complex multi-table logic
