# Dashboard Resource Contracts

## Routing rules

- List route path: `app/dashboard/resources/{kebab}/page.tsx`
- Show route path: `app/dashboard/resources/{kebab}/show/[id]/page.tsx`
- Sidebar config lives in `lib/dashboard-resources.ts`; consumed by `components/app-sidebar.tsx`

## Naming rules

- `dashboardResourceDefinitions[].name` (camelCase) matches the API `{resource}` segment exactly
- Route paths use kebab-case; resource names remain camelCase
- Missing `list` → navigation item not shown

## Module alignment

- `module` in resource definition must match a key in `server-data-provider.ts` switch
- `"operations"` module is frontend-only — no data provider needed
- Add new modules via `dashboard-new-module` skill

## Header component requirements

| Page type        | Header component   |
| ---------------- | ------------------ |
| List             | `ListViewHeader`   |
| Show (read-only) | `ShowViewHeader`   |
| Create form      | `CreateViewHeader` |
| Edit form        | `EditViewHeader`   |

Never use `ShowViewHeader` on a create/edit page — it injects stale detail actions.

## Recommended creation sequence

1. Update `lib/dashboard-resources.ts` with resource definition
2. Ensure the provider's resource allowlist includes this resource (`dashboard-refine-data-provider-wiring`)
3. Create `app/dashboard/resources/{kebab}/` page files
4. Add visible resources to `components/app-sidebar.tsx` `resourceIcons`
5. Smoke test: navigate list → click show → navigate back
