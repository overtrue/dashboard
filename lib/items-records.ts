import type { InferSelectModel } from "drizzle-orm"
import { items } from "@/db/example/schema"
import { PLACEHOLDER_TEXT } from "@/lib/placeholder"

export type EntityBadgeTone = "default" | "secondary" | "destructive" | "outline"

export type ItemRecord = InferSelectModel<typeof items>

export type ItemState = "active" | "archived" | "deleted"

export function getItemState(item: ItemRecord): ItemState {
  return item.status as ItemState
}

export const itemStateTone: Record<ItemState, EntityBadgeTone> = {
  active: "default",
  archived: "secondary",
  deleted: "destructive",
}

export function formatDateTimeLabel(value: string | Date | null | undefined): string {
  if (!value) return PLACEHOLDER_TEXT

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`
}

export function formatNullable(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return PLACEHOLDER_TEXT
  return String(value)
}
