"use client"

import { useState, type FormEvent } from "react"
import { useParams, useRouter } from "next/navigation"
import { useShow, useUpdate } from "@refinedev/core"
import { RiLoaderLine } from "@remixicon/react"
import { toast } from "@/components/ui/sonner"

import { EntitySection } from "@/components/entity-ui"
import { EditView, EditViewHeader } from "@/components/refine-ui/views/edit-view"
import { PermissionMatrix } from "@/components/permission-matrix"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { useIsSuperAdmin } from "@/components/permissions-provider"
import { type AdminRecord } from "@/lib/admin-records"

export default function AdminEditPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const viewerIsSuper = useIsSuperAdmin()
  const { result: admin, query } = useShow<AdminRecord>({ resource: "admins", id: params.id })
  const { mutateAsync } = useUpdate()

  const [nickname, setNickname] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [enabled, setEnabled] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (query.isLoading) {
    return <div className="border-border/60 bg-muted/40 h-72 animate-pulse rounded-lg border" />
  }

  if (!admin) return null

  const currentNickname = nickname ?? admin.nickname ?? ""
  const currentEnabled = enabled ?? (admin.enabled ? "1" : "0")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const values: Record<string, unknown> = {
        nickname: currentNickname.trim() || null,
        enabled: currentEnabled === "1",
      }
      if (password.trim().length >= 6) {
        values.password = password.trim()
      }
      await mutateAsync({ resource: "admins", id: params.id, values })
      toast.success("Admin updated")
      router.push(`/dashboard/resources/admins/show/${params.id}`)
    } catch {
      toast.error("Failed to update admin")
    } finally {
      setSubmitting(false)
    }
  }

  const adminId = Number(params.id)

  return (
    <EditView>
      <EditViewHeader resource="admins" title={`Edit: ${admin.username}`} />

      <form onSubmit={handleSubmit}>
        <EntitySection title="Account details">
          <FieldGroup className="max-w-lg">
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                spellCheck={false}
                value={admin.username}
                disabled
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="nickname">Nickname</FieldLabel>
              <Input
                id="nickname"
                name="nickname"
                type="text"
                autoComplete="off"
                value={currentNickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Display name…"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">New password (optional)</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current…"
                minLength={6}
              />
              <FieldDescription>Must be at least 6 characters if provided.</FieldDescription>
            </Field>
            {!admin.isSuper ? (
              <Field>
                <FieldLabel htmlFor="enabled">Status</FieldLabel>
                <Select value={currentEnabled} onValueChange={setEnabled}>
                  <SelectTrigger id="enabled">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Active</SelectItem>
                    <SelectItem value="0">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            ) : null}
            <Field>
              <Button type="submit" disabled={submitting} className="w-auto">
                {submitting ? (
                  <RiLoaderLine aria-hidden className="size-4 animate-spin" />
                ) : (
                  "Save changes"
                )}
              </Button>
            </Field>
          </FieldGroup>
        </EntitySection>
      </form>

      {/* Permissions — only shown for non-super targets; editable only by super */}
      {!admin.isSuper && (
        <EntitySection
          title="Permissions"
          description={
            viewerIsSuper
              ? "Check the actions this admin can perform on each resource."
              : "Your current permissions on each resource."
          }
        >
          <PermissionMatrix adminId={adminId} canEdit={viewerIsSuper} />
        </EntitySection>
      )}
    </EditView>
  )
}
