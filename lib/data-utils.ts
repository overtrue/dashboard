const DATE_LIKE_FIELD_PATTERN =
  /(?:^|[._])?(?:created|updated|deleted|banned|expired|disabled|verified|refreshed|suspended|_at|At)$/

export function isDateLikeField(field: string) {
  return DATE_LIKE_FIELD_PATTERN.test(field)
}

export function normalizeWriteValue(field: string, value: unknown) {
  if (!isDateLikeField(field)) {
    return value
  }

  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) return value
    const parsed = new Date(trimmed)
    if (Number.isNaN(parsed.getTime())) return value
    return parsed
  }

  return value
}

export function normalizeWriteValues<TValues>(values: TValues | null | undefined) {
  return Object.fromEntries(
    Object.entries((values ?? {}) as Record<string, unknown>).map(([field, value]) => [
      field,
      normalizeWriteValue(field, value),
    ])
  )
}

export function normalizeId(value: string) {
  const trimmed = value.trim()
  const isNumeric = /^-?\d+$/.test(trimmed)
  return isNumeric ? Number(trimmed) : trimmed
}
