import { NextRequest, NextResponse } from "next/server"

import { toErrorResponse } from "@/lib/api-utils"
import { writeAuditLog, getRequestMeta } from "@/lib/audit"
import { DashboardError } from "@/lib/errors"
import { requireActiveAdmin } from "@/lib/permissions/admin-profile"
import {
  isSuperAdmin,
  listPermissionsForAdmin,
  replacePermissionsForAdmin,
  validatePermissionMatrix,
} from "@/lib/permissions/service"
import { listPermissionResourceKeys } from "@/lib/permissions/resources"

type RouteContext = {
  params: Promise<{ id: string }>
}

function parseAdminId(raw: string): number {
  const id = Number(raw)
  if (!Number.isFinite(id) || id <= 0) throw new DashboardError("Invalid admin id", 400)
  return id
}

/**
 * GET /api/admin/admins/[id]/permissions
 * Admins can view their own permissions; super can view anyone's.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const targetAdminId = parseAdminId(id)
    const { profile } = await requireActiveAdmin(request)

    if (profile.id !== targetAdminId && !profile.isSuper) {
      throw new DashboardError("Forbidden", 403)
    }

    const targetIsSuper = await isSuperAdmin(targetAdminId)
    const matrix = await listPermissionsForAdmin(targetAdminId)

    return NextResponse.json({
      adminId: targetAdminId,
      isSuper: targetIsSuper,
      matrix,
      resources: listPermissionResourceKeys(),
    })
  } catch (error) {
    return toErrorResponse(error)
  }
}

/**
 * PUT /api/admin/admins/[id]/permissions
 * Only superadmins can modify permissions; cannot modify another super's matrix.
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  const startedAt = Date.now()
  try {
    const { id } = await context.params
    const targetAdminId = parseAdminId(id)
    const { profile } = await requireActiveAdmin(request)

    if (!profile.isSuper) throw new DashboardError("Only superadmins can modify permissions", 403)
    if (await isSuperAdmin(targetAdminId)) {
      throw new DashboardError("Cannot modify permissions of a superadmin", 400)
    }

    const body = (await request.json().catch(() => ({}))) as { matrix?: unknown }
    const newMatrix = validatePermissionMatrix(body.matrix)

    const before = await listPermissionsForAdmin(targetAdminId)
    await replacePermissionsForAdmin(targetAdminId, newMatrix)

    await writeAuditLog({
      action: "update",
      resource: "example.admin_permissions",
      resourceId: String(targetAdminId),
      adminId: profile.id,
      adminName: profile.username,
      changes: { matrix: { from: before, to: newMatrix } },
      context: { event: "permissions_update" },
      startedAt,
      ...getRequestMeta(request),
    })

    return NextResponse.json({ ok: true, matrix: newMatrix })
  } catch (error) {
    return toErrorResponse(error)
  }
}
