import "server-only"

import Database from "better-sqlite3"
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3"

import * as schema from "./schema"

let db: BetterSQLite3Database<typeof schema> | null = null

export function exampleDb(): BetterSQLite3Database<typeof schema> {
  if (db) return db

  const dbPath = process.env.EXAMPLE_DB_PATH ?? "./example.db"
  const sqlite = new Database(dbPath)
  sqlite.pragma("journal_mode = WAL")
  sqlite.pragma("foreign_keys = ON")

  db = drizzle(sqlite, { schema })
  return db
}

export async function ensureExampleDatabaseConnection(): Promise<void> {
  exampleDb()
}
