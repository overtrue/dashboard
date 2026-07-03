import nextCoreWebVitals from "eslint-config-next/core-web-vitals"

const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "coverage/**",
      "*.db",
      "*.db-shm",
      "*.db-wal",
      "tsconfig.tsbuildinfo",
    ],
  },
  ...nextCoreWebVitals,
]

export default config
