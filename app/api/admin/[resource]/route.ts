import { NextRequest, NextResponse } from "next/server"

import { parseJsonParam, toErrorResponse } from "@/lib/api-utils"
import { writeAuditLog, getRequestMeta } from "@/lib/audit"
import { requirePermission } from "@/lib/permissions/require"
import {
  assertFieldsAllowed,
  collectFilterFields,
  collectSorterFields,
} from "@/lib/refine/field-whitelist"
import { getServerDataProvider } from "@/lib/refine/server-data-provider"

type ResourceRouteContext = {
  params: Promise<{ resource: string }>
}

export async function GET(request: NextRequest, context: ResourceRouteContext) {
  try {
    const { resource } = await context.params
    await requirePermission(request, resource, "read")

    const dataProvider = await getServerDataProvider(resource)
    const pagination = parseJsonParam<unknown>(
      request.nextUrl.searchParams.get("pagination"),
      "pagination"
    )
    const sorters = parseJsonParam<unknown>(request.nextUrl.searchParams.get("sorters"), "sorters")
    const filters = parseJsonParam<unknown>(request.nextUrl.searchParams.get("filters"), "filters")

    assertFieldsAllowed(resource, [
      ...collectFilterFields(filters),
      ...collectSorterFields(sorters),
    ])

    const result = await dataProvider.getList({
      resource,
      pagination: pagination as never,
      sorters: sorters as never,
      filters: filters as never,
    })

    return NextResponse.json(result)
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function POST(request: NextRequest, context: ResourceRouteContext) {
  const startedAt = Date.now()
  try {
    const { resource } = await context.params
    const profile = await requirePermission(request, resource, "create")

    const variables = (await request.json()) as Record<string, unknown>
    const dataProvider = await getServerDataProvider(resource)
    const result = await dataProvider.create({ resource, variables })
    const record = result.data as Record<string, unknown> | undefined

    await writeAuditLog({
      action: "create",
      resource,
      resourceId: record?.id != null ? String(record.id) : undefined,
      adminId: profile.id,
      adminName: profile.username,
      changes: Object.fromEntries(
        Object.entries(variables).map(([k, v]) => [k, { from: null, to: v }])
      ),
      startedAt,
      ...getRequestMeta(request),
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
}
