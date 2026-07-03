# Dashboard Data Provider Wiring

## Server dispatch flow

```
app/api/admin/[resource]/route.ts
app/api/admin/[resource]/[id]/route.ts
  → getServerDataProvider(resource)
  → lib/refine/server-data-provider.ts switch(module)
```

## Reference module: `example`

| File                                  | Role                                                |
| ------------------------------------- | --------------------------------------------------- |
| `db/example/schema.ts`                | Defines `items`, `admins`, exports `exampleSchema`  |
| `db/example/client.ts`                | `exampleDb()` + `ensureExampleDatabaseConnection()` |
| `lib/refine/example-data-provider.ts` | `getExampleDataProvider()`                          |
| `lib/refine/server-data-provider.ts`  | `case "example": ...`                               |

## Source-of-truth points

- Schema object keys are resource names for UI/API.
- Provider allowlists must include every resource name used in `dashboardResourceDefinitions`.
- `field-whitelist.ts` schemas array must include every schema with registered resources.
- `client-data-provider.ts` sends `pagination`, `sorters`, `filters` as JSON query params.

## Error and fallback patterns

- Unknown resource/module → 404 with `statusCode` in payload
- Allowlist miss → 404: "Unsupported {module} resource: {name}"
- Schema not in field-whitelist → 404: "Unknown resource: {name}"
