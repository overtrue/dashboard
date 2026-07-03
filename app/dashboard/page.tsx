import type { Metadata } from "next"
import Link from "next/link"
import {
  RiArrowRightLine,
  RiCheckboxCircleLine,
  RiDatabase2Line,
  RiFileList3Line,
  RiRobot2Line,
  RiShieldCheckLine,
  RiTerminalBoxLine,
} from "@remixicon/react"
import {
  getDashboardResourceDisplayName,
  getDashboardResourcesByGroup,
  type DashboardNavGroup,
} from "@/lib/dashboard-resources"

export const metadata: Metadata = {
  title: "Dashboard",
}

const resourceGroups: Array<{
  key: DashboardNavGroup
  title: string
  description: string
  tone: string
}> = [
  {
    key: "resources",
    title: "Resources",
    description: "List and detail surfaces for business data.",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300",
  },
  {
    key: "operations",
    title: "Operations",
    description: "Dry-run guarded write workflows.",
    tone: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/70 dark:bg-sky-950/30 dark:text-sky-300",
  },
  {
    key: "system",
    title: "System",
    description: "Admin and audit management surfaces.",
    tone: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300",
  },
]

const frameworkSignals = [
  {
    icon: RiDatabase2Line,
    label: "Refine + Drizzle",
    value: "Data provider ready",
  },
  {
    icon: RiShieldCheckLine,
    label: "Permission registry",
    value: "Fail-closed by default",
  },
  {
    icon: RiRobot2Line,
    label: "Agent surface",
    value: "AGENTS.md + skills",
  },
  {
    icon: RiCheckboxCircleLine,
    label: "Quality gates",
    value: "Test, lint, type, build",
  },
]

const agentWorkflow = [
  {
    icon: RiFileList3Line,
    title: "Prompt",
    detail: "README starts with the copy-paste brief an agent needs.",
  },
  {
    icon: RiRobot2Line,
    title: "Skill",
    detail: "Agent skills add modules, resources, operations, and state views.",
  },
  {
    icon: RiTerminalBoxLine,
    title: "Verify",
    detail: "Run the project quality gates before handing off.",
  },
]

export default function DashboardPage() {
  const groups = resourceGroups.map((group) => ({
    ...group,
    resources: getDashboardResourcesByGroup(group.key),
  }))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.14em] uppercase">
          Admin Framework
        </p>
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard Console</h1>
            <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
              A compact control surface for resources, permissioned operations, and agent-assisted
              extension work.
            </p>
          </div>
          <Link
            href="/dashboard/resources/items"
            className="border-border bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 inline-flex h-9 w-fit items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            Open example resource
            <RiArrowRightLine aria-hidden className="size-4" />
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {frameworkSignals.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="border-border/60 bg-card text-card-foreground rounded-lg border p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-muted-foreground truncate text-xs">{label}</p>
                <p className="mt-1 text-sm font-medium">{value}</p>
              </div>
              <div className="border-border/60 bg-muted/30 flex size-8 shrink-0 items-center justify-center rounded-md border">
                <Icon aria-hidden className="text-muted-foreground size-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Registered surfaces</h2>
              <p className="text-muted-foreground text-xs">
                Generated from the dashboard resource registry.
              </p>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {groups.map((group) => (
              <div
                key={group.key}
                className="border-border/60 bg-card text-card-foreground flex min-h-48 flex-col rounded-lg border"
              >
                <div className="border-border/60 border-b p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-medium">{group.title}</h3>
                      <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-5">
                        {group.description}
                      </p>
                    </div>
                    <span
                      className={`inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md border px-2 text-xs font-medium ${group.tone}`}
                    >
                      {group.resources.length}
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-2">
                  {group.resources.map((resource) => (
                    <Link
                      key={resource.name}
                      href={resource.list ?? "/dashboard"}
                      className="hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 flex min-h-9 items-center justify-between gap-3 rounded-md px-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    >
                      <span className="truncate">{getDashboardResourceDisplayName(resource)}</span>
                      <RiArrowRightLine
                        aria-hidden
                        className="text-muted-foreground size-4 shrink-0"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-border/60 bg-card text-card-foreground rounded-lg border">
          <div className="border-border/60 border-b p-4">
            <h2 className="text-base font-semibold">Agent workflow</h2>
            <p className="text-muted-foreground mt-1 text-xs">Repeatable extension path.</p>
          </div>
          <div className="flex flex-col">
            {agentWorkflow.map(({ icon: Icon, title, detail }, index) => (
              <div key={title} className="border-border/60 flex gap-3 border-b p-4 last:border-b-0">
                <div className="border-border/60 bg-muted/30 flex size-8 shrink-0 items-center justify-center rounded-md border">
                  <Icon aria-hidden className="text-muted-foreground size-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-sm font-medium">{title}</h3>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs leading-5">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
