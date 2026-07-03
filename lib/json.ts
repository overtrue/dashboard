export function parseJsonValue(value: unknown) {
  if (value === null || value === undefined) return null
  if (typeof value === "object") return value
  if (typeof value !== "string") return null

  const trimmed = value.trim()
  if (
    !(
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    )
  ) {
    return null
  }

  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}
