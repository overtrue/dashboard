"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getSafeLoginRedirect } from "@/lib/login-redirect"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { message?: string }
        setError(payload.message ?? "Check the username and password, then try again.")
        return
      }

      router.push(getSafeLoginRedirect(searchParams.get("from")))
    } catch {
      setError("Network error. Check your connection, then try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <form
          onSubmit={handleSubmit}
          className={cn("border-border/60 bg-card flex flex-col gap-4 rounded-lg border p-8")}
        >
          <h1 className="text-xl font-semibold">Admin Login</h1>
          {error ? (
            <p
              id="login-error"
              role="alert"
              className="border-destructive/30 bg-destructive/10 text-destructive rounded border p-2 text-xs"
            >
              {error}
            </p>
          ) : null}
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              spellCheck={false}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "login-error" : undefined}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "login-error" : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Logging in…" : "Log in"}
          </Button>
        </form>
      </div>
    </div>
  )
}
