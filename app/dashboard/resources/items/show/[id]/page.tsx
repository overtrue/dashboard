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
  type ItemRecord,
  getItemState,
  itemStateTone,
  formatDateTimeLabel,
  formatNullable,
} from "@/lib/items-records"

export default function ItemShowPage() {
  const params = useParams<{ id: string }>()
  const { query, result: item } = useShow<ItemRecord>({
    resource: "items",
    id: params.id,
  })

  if (query.isLoading) {
    return <div className="border-border/60 bg-muted/40 h-72 animate-pulse rounded-lg border" />
  }

  if (query.isError || !item) {
    return (
      <ShowView>
        <ShowViewHeader resource="items" title="Item not found" />
        <EntityErrorPanel error={query.error}>
          Could not load this item. It may have been deleted.
        </EntityErrorPanel>
      </ShowView>
    )
  }

  const state = getItemState(item)

  return (
    <ShowView>
      <ShowViewHeader resource="items" title={item.name ?? `Item #${item.id}`} />
      <EntitySection title="Item Details">
        <EntityDetailGrid>
          <EntityDetailItem label="ID" value={item.id} copyValue={item.id} />
          <EntityDetailItem label="Name" value={formatNullable(item.name)} />
          <EntityDetailItem
            label="Status"
            value={<EntityStateBadge label={state} tone={itemStateTone[state]} />}
          />
          <EntityDetailItem label="Created At" value={formatDateTimeLabel(item.createdAt)} />
          <EntityDetailItem label="Updated At" value={formatDateTimeLabel(item.updatedAt)} />
          <EntityDetailItem
            label="Description"
            value={formatNullable(item.description)}
            fullWidth
          />
        </EntityDetailGrid>
      </EntitySection>
    </ShowView>
  )
}
