"use client"

import { useState } from "react"
import { EntitySection, EntityDetailGrid, EntityDetailItem } from "@/components/entity-ui"
import { DryRunActionButton } from "@/components/operations/dry-run-action"
import { SqlViewer } from "@/components/operations/sql-viewer"
import { Input } from "@/components/ui/input"

type ArchivePayload = {
  itemId: string
}

type ArchivePlan = {
  itemId: string
  itemName: string | null
  sql: string
  affected: number
}

async function prepareArchive(payload: ArchivePayload): Promise<ArchivePlan> {
  const itemId = payload.itemId.trim()
  if (!/^\d+$/.test(itemId)) {
    throw new Error("Enter a valid numeric item ID.")
  }

  const res = await fetch(`/api/admin/items/${encodeURIComponent(itemId)}`)
  if (!res.ok) {
    const { message } = (await res.json().catch(() => ({}))) as { message?: string }
    throw new Error(message ?? "Item not found")
  }
  const { data } = (await res.json()) as { data: { id: number; name: string; status: string } }

  if (data.status === "archived") {
    throw new Error("Item is already archived")
  }

  return {
    itemId,
    itemName: data.name,
    sql: `UPDATE items SET status = 'archived', updated_at = CURRENT_TIMESTAMP WHERE id = ${data.id};`,
    affected: 1,
  }
}

async function executeArchive(payload: ArchivePayload, _plan: ArchivePlan): Promise<void> {
  const itemId = payload.itemId.trim()
  if (!/^\d+$/.test(itemId)) {
    throw new Error("Enter a valid numeric item ID.")
  }

  const res = await fetch(`/api/admin/items/${encodeURIComponent(itemId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "archived" }),
  })

  if (!res.ok) {
    const { message } = (await res.json().catch(() => ({}))) as { message?: string }
    throw new Error(message ?? "Archive failed")
  }
}

export default function ExampleOperationPage() {
  const [itemId, setItemId] = useState("")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Archive Item</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Archive an item by ID. This operation can be reversed by updating the status.
        </p>
      </div>

      <EntitySection title="Parameters">
        <div className="flex flex-col gap-2">
          <label htmlFor="item-id" className="text-sm font-medium">
            Item ID
          </label>
          <Input
            id="item-id"
            name="itemId"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            autoComplete="off"
            placeholder="Enter item ID…"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
          />
        </div>
      </EntitySection>

      {successMessage ? (
        <p
          role="status"
          className="rounded border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs text-emerald-700 dark:text-emerald-300"
        >
          {successMessage}
        </p>
      ) : null}

      <DryRunActionButton<ArchivePayload, ArchivePlan>
        payload={{ itemId }}
        disabled={!itemId.trim()}
        variant="default"
        onPrepare={prepareArchive}
        onExecute={executeArchive}
        onSuccess={() => {
          setSuccessMessage(`Item ${itemId} archived successfully.`)
          setItemId("")
        }}
        renderPlan={(plan) => (
          <div className="flex flex-col gap-4">
            <EntityDetailGrid>
              <EntityDetailItem label="Item ID" value={plan.itemId} />
              <EntityDetailItem label="Item Name" value={plan.itemName ?? "—"} />
              <EntityDetailItem label="Rows Affected" value={plan.affected} />
            </EntityDetailGrid>
            <EntitySection title="SQL Preview">
              <SqlViewer sql={plan.sql} />
            </EntitySection>
          </div>
        )}
        modalTitle="Confirm Archive"
        modalDescription="Review the operation below before confirming."
        confirmLabel="Archive Item"
      >
        Preview Archive
      </DryRunActionButton>
    </div>
  )
}
