const DEFAULT_LOGIN_REDIRECT = "/dashboard"

export function getSafeLoginRedirect(value: string | null | undefined): string {
  if (!value) return DEFAULT_LOGIN_REDIRECT
  if (!value.startsWith("/") || value.startsWith("//")) return DEFAULT_LOGIN_REDIRECT

  try {
    const url = new URL(value, "http://dashboard.local")
    if (url.origin !== "http://dashboard.local") return DEFAULT_LOGIN_REDIRECT
    if (url.pathname !== "/dashboard" && !url.pathname.startsWith("/dashboard/")) {
      return DEFAULT_LOGIN_REDIRECT
    }
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return DEFAULT_LOGIN_REDIRECT
  }
}
