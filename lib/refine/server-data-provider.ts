import "server-only"

import type { DataProvider } from "@refinedev/core"

import { DashboardError } from "@/lib/errors"
import { getDashboardResource } from "@/lib/dashboard-resources"
import { getExampleDataProvider } from "@/lib/refine/example-data-provider"

type DataProviderModule = "example"

const providerCache: Record<DataProviderModule, Promise<DataProvider> | null> = {
  example: null,
}

function getCachedDataProvider(module: DataProviderModule, load: () => Promise<DataProvider>) {
  providerCache[module] ??= load().catch((err) => {
    providerCache[module] = null
    throw err
  })
  return providerCache[module]
}

export async function getServerDataProvider(resource: string): Promise<DataProvider> {
  const resourceDefinition = getDashboardResource(resource)

  switch (resourceDefinition?.module) {
    case "example":
      return getCachedDataProvider("example", getExampleDataProvider)
    default:
      throw new DashboardError(`Unsupported dashboard resource: ${resource}`, 404)
  }
}
