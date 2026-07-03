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
  EntityJsonValue,
} from "@/components/entity-ui"
import {
  type AuditLogRecord,
  auditActionTone,
  formatDateTimeLabel,
  formatNullable,
} from "@/lib/admin-records"

export default function AuditLogShowPage() {
  const params = useParams<{ id: string }>()
  const { query, result: log } = useShow<AuditLogRecord>({
    resource: "auditLogs",
    id: params.id,
  })

  if (query.isLoading) {
    return <div className="border-border/60 bg-muted/40 h-72 animate-pulse rounded-lg border" />
  }

  if (query.isError || !log) {
    return (
      <ShowView>
        <ShowViewHeader resource="auditLogs" title="Log not found" />
        <EntityErrorPanel error={query.error}>
          Could not load this audit log entry.
        </EntityErrorPanel>
      </ShowView>
    )
  }

  const actionTone = auditActionTone[log.action as keyof typeof auditActionTone] ?? "outline"

  return (
    <ShowView>
      <ShowViewHeader resource="auditLogs" title={`${log.action} / ${log.resource}`} />

      <EntitySection title="Event">
        <EntityDetailGrid>
          <EntityDetailItem label="ID" value={log.id} copyValue={log.id} />
          <EntityDetailItem
            label="Action"
            value={<EntityStateBadge label={log.action} tone={actionTone} />}
          />
          <EntityDetailItem
            label="Resource"
            value={<span className="font-mono text-xs">{log.resource}</span>}
          />
          <EntityDetailItem label="Record ID" value={formatNullable(log.resourceId)} />
          <EntityDetailItem label="Operator" value={formatNullable(log.adminName)} />
          <EntityDetailItem label="Admin ID" value={formatNullable(log.adminId)} />
          <EntityDetailItem
            label="Status"
            value={
              <EntityStateBadge
                label={log.status ?? "success"}
                tone={log.status === "error" ? "destructive" : "default"}
              />
            }
          />
          <EntityDetailItem
            label="IP"
            value={<span className="font-mono text-xs">{formatNullable(log.ip)}</span>}
          />
          <EntityDetailItem
            label="Duration"
            value={log.duration != null ? `${log.duration}ms` : formatNullable(null)}
          />
          <EntityDetailItem label="Timestamp" value={formatDateTimeLabel(log.createdAt)} />
        </EntityDetailGrid>
      </EntitySection>

      {log.errorMessage ? (
        <EntitySection title="Error">
          <p className="border-destructive/30 bg-destructive/8 text-destructive rounded-lg border p-3 text-xs">
            {log.errorMessage}
          </p>
        </EntitySection>
      ) : null}

      {log.changes ? (
        <EntitySection title="Changes">
          <EntityJsonValue value={log.changes} />
        </EntitySection>
      ) : null}

      {log.context ? (
        <EntitySection title="Context">
          <EntityJsonValue value={log.context} />
        </EntitySection>
      ) : null}

      {log.userAgent ? (
        <EntitySection title="User Agent">
          <p className="text-muted-foreground font-mono text-xs break-all">{log.userAgent}</p>
        </EntitySection>
      ) : null}
    </ShowView>
  )
}
