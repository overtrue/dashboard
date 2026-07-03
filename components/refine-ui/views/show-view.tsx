"use client"

import { createContext, useContext, type PropsWithChildren, type ReactNode } from "react"

import { RiArrowLeftLine } from "@remixicon/react"
import {
  type BaseRecord,
  useBack,
  useResourceParams,
  useShow,
  useUserFriendlyName,
} from "@refinedev/core"
import { useParams } from "next/navigation"
import { EntityErrorPanel, EntitySection } from "@/components/entity-ui"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { EditButton } from "../buttons/edit"

type ShowViewProps = PropsWithChildren<{ className?: string }>

const ShowViewContext = createContext(false)

export const useIsInShowView = () => useContext(ShowViewContext)

export function ShowView({ children, className }: ShowViewProps) {
  return (
    <ShowViewContext.Provider value={true}>
      <div className={cn("flex flex-col", "gap-4", className)}>{children}</div>
    </ShowViewContext.Provider>
  )
}

type ShowViewHeaderProps = PropsWithChildren<{
  resource?: string
  title?: ReactNode
  wrapperClassName?: string
  headerClassName?: string
  actions?: ReactNode
  actionClassName?: string
  showEditAction?: boolean
}>

export const ShowViewHeader = ({
  resource: resourceFromProps,
  title: titleFromProps,
  wrapperClassName,
  headerClassName,
  actions,
  actionClassName,
  showEditAction = false,
}: ShowViewHeaderProps) => {
  const back = useBack()
  const getUserFriendlyName = useUserFriendlyName()
  const { resource, identifier } = useResourceParams({ resource: resourceFromProps })
  const { id: recordItemId } = useResourceParams()
  const resourceName = resource?.name ?? identifier
  const title =
    titleFromProps ??
    getUserFriendlyName(resource?.meta?.label ?? identifier ?? resource?.name, "singular")

  return (
    <div className={cn("flex flex-col", "gap-4", wrapperClassName)}>
      <div
        className={cn(
          "flex",
          "min-w-0",
          "flex-col",
          "gap-3",
          "sm:flex-row",
          "sm:items-center",
          "sm:justify-between",
          headerClassName
        )}
      >
        <div className="flex w-full min-w-0 flex-1 items-center gap-2 sm:w-auto">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={back}
            aria-label="Go back"
            className="shrink-0"
          >
            <RiArrowLeftLine aria-hidden className="h-4 w-4" />
          </Button>
          <h2 className="min-w-0 flex-1 truncate text-xl font-semibold">{title}</h2>
        </div>
        <div
          className={cn(
            "flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end",
            actionClassName
          )}
        >
          {showEditAction ? (
            <EditButton
              variant="outline"
              size="sm"
              recordItemId={recordItemId}
              resource={resourceName}
            />
          ) : null}
          {actions}
        </div>
      </div>
    </div>
  )
}

ShowView.displayName = "ShowView"

type SimpleShowViewProps<TRecord extends BaseRecord> = {
  resource: string
  detailTitle: ReactNode | ((record: TRecord) => ReactNode)
  showEditAction?: boolean
  actions?: ReactNode | ((record: TRecord) => ReactNode)
  sectionTitle: string
  errorTitle: string
  errorMessage: ReactNode
  children: (record: TRecord) => ReactNode
}

export function SimpleShowView<TRecord extends BaseRecord>({
  resource,
  detailTitle,
  showEditAction = false,
  actions,
  sectionTitle,
  errorTitle,
  errorMessage,
  children,
}: SimpleShowViewProps<TRecord>) {
  const params = useParams<{ id: string }>()
  const { query, result: record } = useShow<TRecord>({ resource, id: params.id })

  if (query.isLoading) {
    return <div className="border-border/60 bg-muted/40 h-72 animate-pulse rounded-lg border" />
  }

  if (query.isError || !record) {
    return (
      <ShowView>
        <ShowViewHeader resource={resource} title={errorTitle} />
        <EntityErrorPanel error={query.error}>{errorMessage}</EntityErrorPanel>
      </ShowView>
    )
  }

  const title = typeof detailTitle === "function" ? detailTitle(record) : detailTitle
  const headerActions = typeof actions === "function" ? actions(record) : actions

  return (
    <ShowView>
      <ShowViewHeader
        resource={resource}
        title={title}
        showEditAction={showEditAction}
        actions={headerActions}
      />
      <EntitySection title={sectionTitle}>{children(record)}</EntitySection>
    </ShowView>
  )
}
