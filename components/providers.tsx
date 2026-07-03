"use client"

import { Refine, type AccessControlProvider } from "@refinedev/core"
import routerProvider from "@refinedev/nextjs-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import * as React from "react"

import { PermissionsProvider, type SerializedPermissions } from "@/components/permissions-provider"
import { dashboardRefineResources } from "@/lib/dashboard-resources"
import { canAccessDashboardResource } from "@/lib/permissions/access"
import { dashboardDataProvider } from "@/lib/refine/client-data-provider"

type ProvidersProps = React.PropsWithChildren<{
  perms?: SerializedPermissions
  isSuper?: boolean
}>

function Providers({ children, perms = {}, isSuper = false }: ProvidersProps) {
  const [queryClient] = React.useState(() => new QueryClient())
  const accessControlProvider = React.useMemo<AccessControlProvider>(
    () => ({
      can: async ({ resource, action }) => ({
        can: canAccessDashboardResource({
          perms,
          isSuper,
          resourceName: resource,
          action,
        }),
      }),
      options: {
        buttons: {
          enableAccessControl: true,
          hideIfUnauthorized: true,
        },
      },
    }),
    [isSuper, perms]
  )

  return (
    <QueryClientProvider client={queryClient}>
      <PermissionsProvider perms={perms} isSuper={isSuper}>
        <Refine
          dataProvider={dashboardDataProvider}
          routerProvider={routerProvider}
          resources={dashboardRefineResources}
          accessControlProvider={accessControlProvider}
          options={{ syncWithLocation: true }}
        >
          {children}
        </Refine>
      </PermissionsProvider>
    </QueryClientProvider>
  )
}

export { Providers }
