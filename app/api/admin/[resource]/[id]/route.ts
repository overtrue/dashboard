import { NextRequest, NextResponse } from "next/server"

import { toErrorResponse } from "@/lib/api-utils"
import { writeAuditLog, getRequestMeta } from "@/lib/audit"
import { requirePermission } from "@/lib/permissions/require"
import { getServerDataProvider } from "@/lib/refine/server-data-provider"

type ResourceRecordRouteContext = {
  params: Promise<{ resource: string; id: string }>
}

export async function GET(request: NextRequest, context: ResourceRecordRouteContext) {
  try {
    const { resource, id } = await context.params
    await requirePermission(request, resource, "read")
    const dataProvider = await getServerDataProvider(resource)
    const result = await dataProvider.getOne({ resource, id })
    return NextResponse.json(result)
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function PATCH(request: NextRequest, context: ResourceRecordRouteContext) {
  const startedAt = Date.now()
  try {
    const { resource, id } = await context.params
    const profile = await requirePermission(request, resource, "update")

    const variables = (await request.json()) as Record<string, unknown>
    const dataProvider = await getServerDataProvider(resource)

    const before = await dataProvider
      .getOne({ resource, id })
      .then((r) => r.data as Record<string, unknown>)
      .catch(() => null)

    const result = await dataProvider.update({ resource, id, variables })

    await writeAuditLog({
      action: "update",
      resource,
      resourceId: String(id),
      adminId: profile.id,
      adminName: profile.username,
      changes: Object.fromEntries(
        Object.entries(variables).map(([k, v]) => [k, { from: before?.[k] ?? null, to: v }])
      ),
      startedAt,
      ...getRequestMeta(request),
    })

    return NextResponse.json(result)
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function DELETE(request: NextRequest, context: ResourceRecordRouteContext) {
  const startedAt = Date.now()
  try {
    const { resource, id } = await context.params
    const profile = await requirePermission(request, resource, "delete")

    const variables = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const dataProvider = await getServerDataProvider(resource)
    const result = await dataProvider.deleteOne({ resource, id, variables })

    await writeAuditLog({
      action: "delete",
      resource,
      resourceId: String(id),
      adminId: profile.id,
      adminName: profile.username,
      changes: { "*": { from: "exists", to: "removed" } },
      startedAt,
      ...getRequestMeta(request),
    })

    return NextResponse.json(result)
  } catch (error) {
    return toErrorResponse(error)
  }
}
