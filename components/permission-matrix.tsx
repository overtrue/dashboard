"use client"

import { useEffect, useState, useCallback } from "react"
import {
  RiLoaderLine,
  RiCheckboxLine,
  RiCheckboxBlankLine,
  RiCheckboxIndeterminateLine,
} from "@remixicon/react"
import { toast } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import { EntityErrorPanel } from "@/components/entity-ui"
import { cn } from "@/lib/utils"

const ACTIONS = ["read", "create", "update", "delete"] as const
type Action = (typeof ACTIONS)[number]

type Matrix = Record<string, Action[]>

type PermissionsResponse = {
  adminId: number
  isSuper: boolean
  matrix: Matrix
  resources: string[]
}

function groupResources(resources: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {}
  for (const key of resources) {
    const moduleName = key.split(".")[0] ?? key
    groups[moduleName] ??= []
    groups[moduleName].push(key)
  }
  return groups
}

function formatTableName(key: string): string {
  const table = key.split(".")[1] ?? key
  return table.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

/** "all" | "none" | "partial" */
function columnState(keys: string[], action: Action, matrix: Matrix): "all" | "none" | "partial" {
  const count = keys.filter((k) => (matrix[k] ?? []).includes(action)).length
  if (count === 0) return "none"
  if (count === keys.length) return "all"
  return "partial"
}

function moduleState(keys: string[], matrix: Matrix): "all" | "none" | "partial" {
  const total = keys.length * ACTIONS.length
  const granted = keys.reduce((sum, k) => sum + (matrix[k] ?? []).length, 0)
  if (granted === 0) return "none"
  if (granted === total) return "all"
  return "partial"
}

function TriCheckbox({
  state,
  onClick,
  label,
  disabled,
}: {
  state: "all" | "none" | "partial"
  onClick?: () => void
  label: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center rounded transition-colors",
        !disabled
          ? "hover:text-primary focus-visible:ring-ring/50 cursor-pointer focus-visible:ring-2 focus-visible:outline-none"
          : "cursor-default opacity-50"
      )}
    >
      {state === "all" ? (
        <RiCheckboxLine aria-hidden className="text-primary size-4" />
      ) : state === "partial" ? (
        <RiCheckboxIndeterminateLine aria-hidden className="text-primary/60 size-4" />
      ) : (
        <RiCheckboxBlankLine aria-hidden className="text-muted-foreground/40 size-4" />
      )}
    </button>
  )
}

export type PermissionMatrixProps = {
  adminId: number
  /** Only superadmins can edit; non-super viewers see read-only */
  canEdit: boolean
}

export function PermissionMatrix({ adminId, canEdit }: PermissionMatrixProps) {
  const [data, setData] = useState<PermissionsResponse | null>(null)
  const [matrix, setMatrix] = useState<Matrix>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/admins/${adminId}/permissions`)
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { message?: string }
        throw new Error(payload.message ?? `HTTP ${res.status}`)
      }
      const payload = (await res.json()) as PermissionsResponse
      setData(payload)
      setMatrix(payload.matrix)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load permissions")
    } finally {
      setLoading(false)
    }
  }, [adminId])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void load()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [load])

  // ── Mutations ────────────────────────────────────────────────────────────────

  /** Toggle a single cell */
  const toggleCell = (resource: string, action: Action) => {
    if (!canEdit) return
    setMatrix((prev) => {
      const current = prev[resource] ?? []
      const next = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action]
      setDirty(true)
      return { ...prev, [resource]: next }
    })
  }

  /** Toggle all actions for one row */
  const toggleRow = (resource: string) => {
    if (!canEdit) return
    setMatrix((prev) => {
      const current = prev[resource] ?? []
      const next = current.length === ACTIONS.length ? [] : [...ACTIONS]
      setDirty(true)
      return { ...prev, [resource]: next }
    })
  }

  /** Toggle one action for all rows in a module */
  const toggleColumn = (keys: string[], action: Action) => {
    if (!canEdit) return
    setMatrix((prev) => {
      const state = columnState(keys, action, prev)
      const shouldGrant = state !== "all"
      const next = { ...prev }
      for (const key of keys) {
        const current = next[key] ?? []
        next[key] = shouldGrant
          ? current.includes(action)
            ? current
            : [...current, action]
          : current.filter((a) => a !== action)
      }
      setDirty(true)
      return next
    })
  }

  /** Toggle all cells in a module */
  const toggleModule = (keys: string[]) => {
    if (!canEdit) return
    setMatrix((prev) => {
      const state = moduleState(keys, prev)
      const shouldGrant = state !== "all"
      const next = { ...prev }
      for (const key of keys) {
        next[key] = shouldGrant ? [...ACTIONS] : []
      }
      setDirty(true)
      return next
    })
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/admins/${adminId}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matrix }),
      })
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { message?: string }
        throw new Error(payload.message ?? `HTTP ${res.status}`)
      }
      toast.success("Permissions saved")
      setDirty(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save permissions")
    } finally {
      setSaving(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  if (loading) {
    return <div className="border-border/60 bg-muted/20 h-32 animate-pulse rounded-lg border" />
  }

  if (error) {
    return <EntityErrorPanel error={error}>Failed to load permission matrix.</EntityErrorPanel>
  }

  if (data?.isSuper) {
    return (
      <div className="border-border/60 bg-muted/10 text-muted-foreground rounded-lg border px-4 py-3 text-sm">
        Superadmin — all permissions are granted implicitly.
      </div>
    )
  }

  const groups = groupResources(data?.resources ?? [])

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(groups).map(([moduleName, keys]) => (
        <div key={moduleName} className="border-border/60 overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border/60 bg-muted/30 border-b">
                {/* Top-left: module-level select-all */}
                <th className="px-3 py-2 text-left">
                  <div className="flex items-center gap-2">
                    <TriCheckbox
                      state={moduleState(keys, matrix)}
                      onClick={() => toggleModule(keys)}
                      label={`Toggle all in ${moduleName}`}
                      disabled={!canEdit}
                    />
                    <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                      {moduleName}
                    </span>
                  </div>
                </th>
                {/* Column headers: action-level select-all */}
                {ACTIONS.map((action) => (
                  <th key={action} className="w-20 px-2 py-2 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <TriCheckbox
                        state={columnState(keys, action, matrix)}
                        onClick={() => toggleColumn(keys, action)}
                        label={`Toggle ${action} for all in ${moduleName}`}
                        disabled={!canEdit}
                      />
                      <span className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
                        {action}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keys.map((key, idx) => {
                const granted = matrix[key] ?? []
                const rowState = moduleState([key], matrix)
                return (
                  <tr
                    key={key}
                    className={cn(
                      "border-border/40",
                      idx < keys.length - 1 && "border-b",
                      canEdit && "hover:bg-muted/20"
                    )}
                  >
                    {/* Row name: row-level select-all */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <TriCheckbox
                          state={rowState}
                          onClick={() => toggleRow(key)}
                          label={`Toggle all for ${formatTableName(key)}`}
                          disabled={!canEdit}
                        />
                        <span
                          className={cn(
                            "font-mono text-xs",
                            canEdit && "cursor-pointer select-none"
                          )}
                          onClick={() => canEdit && toggleRow(key)}
                        >
                          {formatTableName(key)}
                        </span>
                      </div>
                    </td>
                    {/* Individual cells */}
                    {ACTIONS.map((action) => {
                      const checked = granted.includes(action)
                      return (
                        <td key={action} className="px-2 py-2.5 text-center">
                          <button
                            type="button"
                            disabled={!canEdit}
                            onClick={() => toggleCell(key, action)}
                            className={cn(
                              "inline-flex items-center justify-center rounded transition-colors",
                              canEdit
                                ? "hover:text-primary focus-visible:ring-ring/50 cursor-pointer focus-visible:ring-2 focus-visible:outline-none"
                                : "cursor-default opacity-60"
                            )}
                            aria-label={`${checked ? "Revoke" : "Grant"} ${action} on ${key}`}
                          >
                            {checked ? (
                              <RiCheckboxLine aria-hidden className="text-primary size-4" />
                            ) : (
                              <RiCheckboxBlankLine
                                aria-hidden
                                className="text-muted-foreground/40 size-4"
                              />
                            )}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ))}

      {canEdit && (
        <div className="flex items-center gap-3">
          <Button type="button" size="sm" disabled={!dirty || saving} onClick={save}>
            {saving ? (
              <>
                <RiLoaderLine aria-hidden className="mr-1.5 size-3.5 animate-spin" />
                Saving…
              </>
            ) : (
              "Save permissions"
            )}
          </Button>
          {dirty && <span className="text-muted-foreground text-xs">Unsaved changes</span>}
        </div>
      )}
    </div>
  )
}
