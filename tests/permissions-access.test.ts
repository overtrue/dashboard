import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  canAccessDashboardResource,
  canAccessPermission,
  type SerializedPermissions,
} from "../lib/permissions/access"

describe("dashboard permission access", () => {
  it("allows superadmins regardless of serialized permissions", () => {
    assert.equal(
      canAccessPermission({
        isSuper: true,
        perms: {},
        resourceKey: "example.items",
        action: "delete",
      }),
      true
    )
  })

  it("checks serialized permission actions for regular admins", () => {
    const perms = { "example.items": ["read"] } satisfies SerializedPermissions

    assert.equal(
      canAccessPermission({
        isSuper: false,
        perms,
        resourceKey: "example.items",
        action: "read",
      }),
      true
    )
    assert.equal(
      canAccessPermission({
        isSuper: false,
        perms,
        resourceKey: "example.items",
        action: "update",
      }),
      false
    )
  })

  it("maps dashboard resource names to their permission keys", () => {
    const perms = {
      "example.items": ["read", "update"],
      "example.admins": ["read"],
    } satisfies SerializedPermissions

    assert.equal(
      canAccessDashboardResource({
        isSuper: false,
        perms,
        resourceName: "items",
        action: "read",
      }),
      true
    )
    assert.equal(
      canAccessDashboardResource({
        isSuper: false,
        perms,
        resourceName: "example-operation",
        action: "update",
      }),
      true
    )
    assert.equal(
      canAccessDashboardResource({
        isSuper: false,
        perms,
        resourceName: "admins",
        action: "update",
      }),
      false
    )
  })
})
