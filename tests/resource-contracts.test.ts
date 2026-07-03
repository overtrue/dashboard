import assert from "node:assert/strict"
import { existsSync } from "node:fs"
import { describe, it } from "node:test"
import { join } from "node:path"

import {
  type DashboardNavGroup,
  type DashboardResourceDefinition,
  getDashboardResourcesByGroup,
} from "../lib/dashboard-resources"

const root = process.cwd()
const groups: DashboardNavGroup[] = ["overview", "resources", "operations", "system"]

function allVisibleResources(): DashboardResourceDefinition[] {
  return groups.flatMap((group) => getDashboardResourcesByGroup(group))
}

function routeTemplateToPagePath(route: string): string {
  const appRelativePath = route.replace(/^\//, "").replace(/:([^/]+)/g, "[$1]")
  return join(root, "app", appRelativePath.replace(/^dashboard\/?/, "dashboard/"), "page.tsx")
}

describe("dashboard resource contracts", () => {
  it("keeps visible resource names and list routes unique", () => {
    const resources = allVisibleResources()
    const names = resources.map((resource) => resource.name)
    const lists = resources.map((resource) => resource.list)

    assert.equal(new Set(names).size, names.length)
    assert.equal(new Set(lists).size, lists.length)
  })

  it("points every registered route template at an existing App Router page", () => {
    for (const resource of allVisibleResources()) {
      for (const route of [resource.list, resource.show, resource.create, resource.edit]) {
        if (!route) continue
        assert.equal(
          existsSync(routeTemplateToPagePath(route)),
          true,
          `${resource.name} route ${route} must have a matching page`
        )
      }
    }
  })

  it("requires visible sidebar resources to declare permission metadata", () => {
    for (const resource of allVisibleResources()) {
      assert.ok(resource.permissionKey, `${resource.name} must declare permissionKey`)
      assert.ok(resource.requiredAction, `${resource.name} must declare requiredAction`)
    }
  })
})
