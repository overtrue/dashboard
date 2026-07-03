# Dashboard Module Wiring Contracts

## File locations

| File                                   | Role                                          |
| -------------------------------------- | --------------------------------------------- |
| `db/{module}/schema.ts`                | Table definitions + `{module}Schema` export   |
| `db/{module}/client.ts`                | DB connection + `ensure*Connection()`         |
| `lib/refine/{module}-data-provider.ts` | DataProvider impl                             |
| `lib/refine/field-whitelist.ts`        | All schemas listed in `schemas[]`             |
| `lib/refine/server-data-provider.ts`   | Module dispatch switch                        |
| `lib/dashboard-resources.ts`           | Resource definitions + `DashboardModule` type |

## Invariants

- `{module}Schema` object keys = resource names used in `dashboardResourceDefinitions`
- `providerCache` key = module name in `DashboardModule`
- `field-whitelist.ts` must import every schema that has resources in the registry
- `ensure*Connection()` must be synchronous-safe (idempotent after first call)

## Common errors

- `Unsupported dashboard resource: X` → resource name not registered in server-data-provider.ts OR module mismatch in dashboard-resources.ts
- `Field not allowed: X` → schema not in field-whitelist.ts schemas array
- Infinite connection retry → ensure\*Connection() never resolves; check env vars
