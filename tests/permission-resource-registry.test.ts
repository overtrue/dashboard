import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  isValidPermissionResourceKey,
  listPermissionResourceKeys,
  resolvePermissionResourceKey,
} from "../lib/permissions/resource-registry"

describe("permission resource registry", () => {
  it("lists only grantable dashboard resources", () => {
    assert.deepEqual([...listPermissionResourceKeys()].sort(), [
      "example.admins",
      "example.audit_logs",
      "example.items",
    ])
  })

  it("does not expose the internal permission storage table as a grantable resource", () => {
    assert.equal(resolvePermissionResourceKey("adminPermissions"), null)
    assert.equal(isValidPermissionResourceKey("example.admin_permissions"), false)
  })

  it("resolves camelCase resource names to physical table permission keys", () => {
    assert.equal(resolvePermissionResourceKey("items"), "example.items")
    assert.equal(resolvePermissionResourceKey("auditLogs"), "example.audit_logs")
  })
})
