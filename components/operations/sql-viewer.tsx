"use client"

import { type ReactNode } from "react"

export type SqlViewerProps = {
  sql?: string | null
  className?: string
  fallback?: ReactNode
}

const sqlKeywordList = [
  "SELECT",
  "UPDATE",
  "SET",
  "INSERT",
  "INTO",
  "VALUES",
  "DELETE",
  "FROM",
  "WHERE",
  "AND",
  "OR",
  "ON",
  "LEFT JOIN",
  "RIGHT JOIN",
  "INNER JOIN",
  "JOIN",
  "ORDER BY",
  "GROUP BY",
  "HAVING",
  "LIMIT",
  "OFFSET",
].map((keyword) => keyword.toUpperCase())

const sqlKeywordsSet = new Set(sqlKeywordList)
const sqlKeywordPattern = sqlKeywordList
  .slice()
  .sort((a, b) => b.length - a.length)
  .map((keyword) => keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+"))
  .join("|")

const sqlClauseBreakRegex = new RegExp(`\\b(?:${sqlKeywordPattern})\\b`, "gi")

type SqlToken = { text: string; className?: string }

function formatSqlText(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(sqlClauseBreakRegex, "\n$&")
    .replace(/\s*,\s*/g, ",\n  ")
    .replace(/\s*\(\s*/g, "(\n  ")
    .replace(/\s*\)\s*/g, "\n)")
    .replace(/\s*;\s*/g, ";\n")
    .replace(/\n{2,}/g, "\n")
    .trim()
}

function getSqlTokenClass(token: string) {
  if (!token) return undefined
  if (/^\/\*/.test(token) || /\*\/$/.test(token)) return "text-muted-foreground"
  if (/^`[^`]*`$/.test(token) || /^'.*'$/.test(token) || /^".*"$/.test(token))
    return "text-amber-700 dark:text-amber-300"
  if (/^\d+(?:\.\d+)?$/.test(token)) return "text-emerald-700 dark:text-emerald-300"
  if (/^(NULL|TRUE|FALSE)$/i.test(token.trim())) return "text-sky-700 dark:text-sky-300"
  if (/^(=|<>|!=|>=|<=|<|>)$/.test(token)) return "text-cyan-700 dark:text-cyan-300"
  if (/^(,|\(|\)|;)$/.test(token)) return "text-muted-foreground"
  const normalized = token.trim().replace(/\s+/g, " ").toUpperCase()
  if (sqlKeywordsSet.has(normalized)) return "text-violet-700 dark:text-violet-400"
  return undefined
}

function tokenizeSql(value: string): SqlToken[] {
  const tokenPattern = new RegExp(
    [
      /\/\*[^]*?\*\//.source,
      /`[^`]*`/.source,
      /'(?:[^'\\]|\\.)*'/.source,
      /"(?:[^"\\]|\\.)*"/.source,
      `\\b(?:${sqlKeywordPattern})\\b`,
      ">=|<=|<>|!=|=|<|>|,|\\(|\\)|;",
      "\\b\\d+(?:\\.\\d+)?\\b",
      "\\b(?:NULL|TRUE|FALSE)\\b",
      "[a-zA-Z_][\\w$]*",
    ].join("|"),
    "gi"
  )

  const tokens: SqlToken[] = []
  let cursor = 0

  for (const match of value.matchAll(tokenPattern)) {
    const current = match[0]
    const currentIndex = match.index ?? 0
    if (currentIndex > cursor) tokens.push({ text: value.slice(cursor, currentIndex) })
    tokens.push({ text: current, className: getSqlTokenClass(current) })
    cursor = currentIndex + current.length
  }

  if (cursor < value.length) tokens.push({ text: value.slice(cursor) })
  return tokens
}

export function SqlViewer({
  sql,
  className,
  fallback = "No SQL preview generated",
}: SqlViewerProps) {
  if (!sql) return <p className="text-muted-foreground text-xs">{fallback}</p>

  const formattedSql = formatSqlText(sql)

  return (
    <pre
      className={
        className ??
        "border-border/60 bg-muted text-foreground max-h-40 overflow-auto rounded-lg border p-3 text-[11px] leading-relaxed"
      }
    >
      <code className="font-mono whitespace-pre">
        {tokenizeSql(formattedSql).map((token, index) =>
          token.className ? (
            <span key={index} className={token.className}>
              {token.text}
            </span>
          ) : (
            <span key={index}>{token.text}</span>
          )
        )}
      </code>
    </pre>
  )
}
