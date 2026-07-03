import assert from "node:assert/strict"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, it } from "node:test"

const root = process.cwd()
const requiredSkills = [
  "dashboard-new-module",
  "dashboard-operations-page",
  "dashboard-refine-data-provider-wiring",
  "dashboard-refine-resource-workflow",
  "dashboard-state-machine",
]

describe("agent-facing surface", () => {
  it("uses AGENTS.md and .agents as the only agent entrypoints", () => {
    assert.equal(existsSync(join(root, "AGENTS.md")), true)
    assert.equal(existsSync(join(root, "CLAUDE.md")), false)
    assert.equal(existsSync(join(root, ".claude")), false)
  })

  it("keeps all required dashboard skills available under .agents/skills", () => {
    const skillsDir = join(root, ".agents", "skills")
    const skills = readdirSync(skillsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()

    assert.deepEqual(skills, requiredSkills)
    for (const skill of requiredSkills) {
      assert.equal(existsSync(join(skillsDir, skill, "SKILL.md")), true)
    }
  })

  it("puts the copy-paste agent prompt first in README and avoids legacy agent names", () => {
    const readme = readFileSync(join(root, "README.md"), "utf8")
    assert.match(
      readme,
      /^# AI Agent Native Admin Dashboard\n\nUse this prompt to start work with any coding agent:/
    )
    assert.match(readme, /AGENTS\.md/)
    assert.match(readme, /\.agents\/skills/)
    assert.doesNotMatch(readme, /CLAUDE|\.claude|Claude/)
  })
})
