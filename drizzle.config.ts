import "dotenv/config"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./db/example/schema.ts",
  out: "./db/example/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.EXAMPLE_DB_PATH ?? "./example.db",
  },
})
