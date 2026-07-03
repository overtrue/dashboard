"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { useCreate } from "@refinedev/core"
import { RiLoaderLine } from "@remixicon/react"
import { toast } from "@/components/ui/sonner"

import { EntitySection } from "@/components/entity-ui"
import { CreateView, CreateViewHeader } from "@/components/refine-ui/views/create-view"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"

export default function AdminCreatePage() {
  const router = useRouter()
  const { mutateAsync } = useCreate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [nickname, setNickname] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await mutateAsync({
        resource: "admins",
        values: {
          username: username.trim(),
          password: password.trim(),
          nickname: nickname.trim() || null,
          enabled: true,
        },
      })
      toast.success("Admin created")
      router.push("/dashboard/resources/admins")
    } catch {
      toast.error("Failed to create admin")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <CreateView>
      <CreateViewHeader resource="admins" title="New Admin" />
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Login username…"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters…"
                required
                minLength={6}
              />
              <FieldDescription>Minimum 6 characters.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="nickname">Nickname (optional)</FieldLabel>
              <Input
                id="nickname"
                name="nickname"
                type="text"
                autoComplete="off"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Display name…"
              />
            </Field>
            <Field>
              <Button type="submit" disabled={submitting} className="w-auto">
                {submitting ? (
                  <RiLoaderLine aria-hidden className="size-4 animate-spin" />
                ) : (
                  "Create admin"
                )}
              </Button>
            </Field>
          </FieldGroup>
        </EntitySection>
      </form>
    </CreateView>
  )
}
