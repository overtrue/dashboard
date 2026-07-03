"use client"

import { useParams } from "next/navigation"
import { useShow } from "@refinedev/core"

import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view"
import {
  EntitySection,
  EntityDetailGrid,
  EntityDetailItem,
  EntityStateBadge,
  EntityErrorPanel,
} from "@/components/entity-ui"
import {
  type AdminRecord,
  getAdminState,
  adminStateTone,
  formatDateTimeLabel,
  formatNullable,
} from "@/lib/admin-records"

export default function AdminShowPage() {
  const params = useParams<{ id: string }>()
  const { query, result: admin } = useShow<AdminRecord>({
    resource: "admins",
    id: params.id,
  })

  if (query.isLoading) {
    return <div className="border-border/60 bg-muted/40 h-72 animate-pulse rounded-lg border" />
  }

  if (query.isError || !admin) {
    return (
      <ShowView>
        <ShowViewHeader resource="admins" title="Admin not found" />
        <EntityErrorPanel error={query.error}>Could not load this admin account.</EntityErrorPanel>
      </ShowView>
    )
  }

  const state = getAdminState(admin)

  return (
    <ShowView>
      <ShowViewHeader resource="admins" title={admin.username} showEditAction />
      <EntitySection title="Account Details">
        <EntityDetailGrid>
          <EntityDetailItem label="ID" value={admin.id} copyValue={admin.id} />
          <EntityDetailItem label="Username" value={admin.username} />
          <EntityDetailItem label="Nickname" value={formatNullable(admin.nickname)} />
          <EntityDetailItem
            label="Status"
            value={<EntityStateBadge label={state} tone={adminStateTone[state]} />}
          />
          <EntityDetailItem
            label="Role"
            value={
              admin.isSuper ? (
                <EntityStateBadge label="superadmin" tone="default" />
              ) : (
                <EntityStateBadge label="admin" tone="outline" />
              )
            }
          />
          <EntityDetailItem label="Last Login" value={formatDateTimeLabel(admin.lastLoginAt)} />
          <EntityDetailItem label="Last Login IP" value={formatNullable(admin.lastLoginIp)} />
          <EntityDetailItem label="Created At" value={formatDateTimeLabel(admin.createdAt)} />
          <EntityDetailItem label="Updated At" value={formatDateTimeLabel(admin.updatedAt)} />
        </EntityDetailGrid>
      </EntitySection>
    </ShowView>
  )
}
