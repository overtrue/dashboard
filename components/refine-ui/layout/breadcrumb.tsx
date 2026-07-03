"use client"

import Link from "next/link"
import { Fragment } from "react"
import { RiHomeLine } from "@remixicon/react"
import { matchResourceFromRoute, useBreadcrumb, useResourceParams } from "@refinedev/core"
import {
  BreadcrumbSeparator as ShadcnBreadcrumbSeparator,
  BreadcrumbItem as ShadcnBreadcrumbItem,
  BreadcrumbList as ShadcnBreadcrumbList,
  BreadcrumbPage as ShadcnBreadcrumbPage,
  Breadcrumb as ShadcnBreadcrumb,
} from "@/components/ui/breadcrumb"

export function Breadcrumb() {
  const { breadcrumbs } = useBreadcrumb()
  const { resources } = useResourceParams()
  const rootRouteResource = matchResourceFromRoute("/", resources)
  const rootHref = rootRouteResource?.matchedRoute ?? "/dashboard"
  const rootIcon = rootRouteResource?.resource?.meta?.icon ?? (
    <RiHomeLine aria-hidden className="h-4 w-4" />
  )

  return (
    <ShadcnBreadcrumb>
      <ShadcnBreadcrumbList>
        {[
          { key: "breadcrumb-item-home", label: rootIcon, href: rootHref },
          ...breadcrumbs.map((breadcrumb) => ({
            key: `breadcrumb-item-${breadcrumb.label}`,
            label: breadcrumb.label,
            href: breadcrumb.href,
          })),
        ].map((item, index, items) => {
          const content = item.href ? (
            <Link href={item.href}>{item.label}</Link>
          ) : (
            <span>{item.label}</span>
          )

          if (index === items.length - 1) {
            return <ShadcnBreadcrumbPage key={item.key}>{content}</ShadcnBreadcrumbPage>
          }

          return (
            <Fragment key={item.key}>
              <ShadcnBreadcrumbItem>{content}</ShadcnBreadcrumbItem>
              <ShadcnBreadcrumbSeparator />
            </Fragment>
          )
        })}
      </ShadcnBreadcrumbList>
    </ShadcnBreadcrumb>
  )
}

Breadcrumb.displayName = "Breadcrumb"
