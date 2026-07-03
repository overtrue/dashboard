"use client"

import { useState, useMemo } from "react"
import { useTranslate, type CrudOperators } from "@refinedev/core"
import type { Column, Table as ReactTable } from "@tanstack/react-table"
import type { DateRange } from "react-day-picker"
import { RiCheckLine, RiExpandUpDownLine, RiFilterLine, RiCloseLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

function setColumnFilterValue<TData>({
  column,
  table,
  value,
  operator,
}: {
  column: Column<TData>
  table?: ReactTable<TData>
  value: string | string[] | undefined
  operator?: CrudOperators
}) {
  const isEmpty =
    value === undefined || value === "" || (Array.isArray(value) && value.length === 0)

  if (!table) {
    column.setFilterValue(isEmpty ? undefined : value)
    return
  }

  table.setColumnFilters((previousFilters) => {
    const nextFilters = previousFilters.filter((filter) => filter.id !== column.id)

    if (isEmpty) {
      return nextFilters
    }

    return [
      ...nextFilters,
      {
        id: column.id,
        value,
        ...(operator ? { operator } : {}),
      },
    ]
  })
}

export type DataTableFilterDropdownProps<TData> = {
  column: Column<TData>
  contentClassName?: string
  triggerClassName?: string
  children: (args: {
    isOpen: boolean
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  }) => React.ReactNode
}

export function DataTableFilterDropdown<TData>({
  column,
  triggerClassName,
  contentClassName,
  children,
}: DataTableFilterDropdownProps<TData>) {
  const [isOpen, setIsOpen] = useState(false)

  const isFiltered = column.getIsFiltered()

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          onClick={() => setIsOpen(true)}
          variant="ghost"
          size="icon"
          aria-label={`${isFiltered ? "Edit" : "Add"} filter for ${column.id}`}
          className={cn(
            "data-[state=open]:bg-accent",
            "h-5 w-5",
            {
              "text-primary": isFiltered,
              "text-muted-foreground": !isFiltered,
            },
            triggerClassName
          )}
        >
          <RiFilterLine aria-hidden className={cn("!h-3", "!w-3")} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn("w-full", "shadow-sm", contentClassName)}>
        {children({ isOpen, setIsOpen })}
      </PopoverContent>
    </Popover>
  )
}

type DataTableFilterDropdownActionsProps = {
  className?: string
  isClearDisabled?: boolean
  isApplyDisabled?: boolean
  onClear: () => void
  onApply: () => void
}

export function DataTableFilterDropdownActions({
  className,
  isClearDisabled,
  isApplyDisabled,
  onClear,
  onApply,
}: DataTableFilterDropdownActionsProps) {
  const t = useTranslate()

  return (
    <div className={cn("flex", "items-center", "justify-between", "w-full", "gap-2", className)}>
      <Button
        size="sm"
        variant="ghost"
        disabled={isClearDisabled}
        className={cn("rounded-sm", "text-xs", "font-semibold", "text-muted-foreground")}
        onClick={() => {
          onClear()
        }}
      >
        <RiCloseLine aria-hidden className={cn("w-3.5", "h-3.5", "text-muted-foreground")} />
        {t("buttons.clear", "清空")}
      </Button>

      <Button
        size="sm"
        disabled={isApplyDisabled}
        className={cn("rounded-sm", "text-xs", "font-semibold")}
        onClick={() => {
          onApply()
        }}
      >
        {t("buttons.apply", "应用")}
      </Button>
    </div>
  )
}

export type DataTableFilterDropdownTextProps<TData> = {
  column: Column<TData>
  table: ReactTable<TData>
  defaultOperator?: CrudOperators
  operators?: CrudOperators[]
  placeholder?: string
}

export function DataTableFilterDropdownText<TData>({
  column,
  table,
  operators = [
    "eq",
    "ne",
    "contains",
    "ncontains",
    "containss",
    "ncontainss",
    "startswith",
    "nstartswith",
    "startswiths",
    "nstartswiths",
    "endswith",
    "nendswith",
    "endswiths",
    "nendswiths",
    "in",
    "nin",
    "ina",
    "nina",
  ],
  defaultOperator = "eq",
  placeholder,
}: DataTableFilterDropdownTextProps<TData>) {
  const t = useTranslate()

  return (
    <DataTableFilterInput
      column={column}
      table={table}
      operators={operators}
      defaultOperator={defaultOperator}
      renderInput={({ value, onChange }) => (
        <Input
          type="text"
          placeholder={placeholder ?? t("table.filter.text.placeholder", "Filter by...")}
          value={value}
          onChange={(event) => {
            onChange(event.target.value)
          }}
        />
      )}
    />
  )
}

export type DataTableFilterDropdownNumericProps<TData> = {
  column: Column<TData>
  table: ReactTable<TData>
  defaultOperator?: CrudOperators
  operators?: CrudOperators[]
  placeholder?: string
}

export function DataTableFilterDropdownNumeric<TData>({
  column,
  table,
  operators = ["eq", "ne", "gt", "lt", "gte", "lte"],
  defaultOperator = "eq",
  placeholder,
}: DataTableFilterDropdownNumericProps<TData>) {
  const t = useTranslate()

  return (
    <DataTableFilterInput
      column={column}
      table={table}
      operators={operators}
      defaultOperator={defaultOperator}
      renderInput={({ value, onChange }) => (
        <Input
          type="number"
          placeholder={placeholder ?? t("table.filter.numeric.placeholder", "Filter by...")}
          value={value}
          onChange={(event) => {
            onChange(event.target.value)
          }}
        />
      )}
    />
  )
}

export type DataTableFilterComboboxProps<TData> = {
  column: Column<TData>
  table?: ReactTable<TData>
  options: { label: string; value: string }[]
  defaultOperator?: CrudOperators
  operators?: CrudOperators[]
  placeholder?: string
  noResultsText?: string
  multiple?: boolean
}

export function DataTableFilterCombobox<TData>({
  column,
  table,
  options,
  defaultOperator = "eq",
  operators = ["eq", "ne", "in", "nin"],
  placeholder,
  noResultsText,
  multiple = false,
}: DataTableFilterComboboxProps<TData>) {
  const t = useTranslate()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DataTableFilterInput
      column={column}
      table={table}
      operators={operators}
      defaultOperator={defaultOperator}
      renderInput={({ value, onChange }) => {
        const currentValues = multiple
          ? Array.isArray(value)
            ? value
            : value && typeof value === "string"
              ? [value]
              : []
          : value && typeof value === "string"
            ? [value]
            : []

        const handleSelect = (optionValue: string) => {
          if (multiple) {
            const newValues = currentValues.includes(optionValue)
              ? currentValues.filter((v) => v !== optionValue)
              : [...currentValues, optionValue]
            onChange(newValues)
          } else {
            onChange(optionValue)
            setIsOpen(false)
          }
        }

        const handleRemove = (optionValue: string) => {
          if (multiple) {
            const newValues = currentValues.filter((v) => v !== optionValue)
            onChange(newValues)
          }
        }

        const getDisplayText = () => {
          if (currentValues.length === 0) {
            return placeholder ?? t("table.filter.combobox.placeholder", "Select...")
          }

          if (multiple) {
            return `${currentValues.length} selected`
          }

          const selectedOption = options.find((option) => option.value === currentValues[0])
          return selectedOption ? selectedOption.label : currentValues[0]
        }

        const getSelectedLabels = () => {
          return currentValues.map((val) => {
            const option = options.find((opt) => opt.value === val)
            return { label: option ? option.label : val, value: val }
          })
        }

        return (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isOpen}
                className={cn(
                  "w-full",
                  "min-w-48",
                  "max-w-80",
                  "justify-start",
                  "h-auto",
                  "min-h-9"
                )}
              >
                <div className={cn("flex", "gap-2", "w-full")}>
                  {multiple && currentValues.length > 0 ? (
                    <div className={cn("flex", "flex-wrap", "gap-1", "flex-1")}>
                      {getSelectedLabels()
                        .slice(0, 3)
                        .map(({ label, value: val }) => (
                          <Badge
                            key={val}
                            variant="outline"
                            className={cn(
                              "inline-flex",
                              "items-center",
                              "gap-0",
                              "h-4",
                              "pr-0.5",
                              "rounded-sm"
                            )}
                          >
                            <span className={cn("text-[10px]", "leading-4")}>{label}</span>
                            <span
                              className={cn(
                                "inline-flex",
                                "items-center",
                                "justify-center",
                                "p-0",
                                "w-4",
                                "h-full",
                                "text-muted-foreground",
                                "hover:text-destructive",
                                "rounded-sm",
                                "cursor-pointer",
                                "transition-colors"
                              )}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleRemove(val)
                              }}
                            >
                              <RiCloseLine aria-hidden className={cn("!h-2", "!w-2")} />
                            </span>
                          </Badge>
                        ))}
                      {currentValues.length > 3 && (
                        <span className={cn("text-xs", "text-muted-foreground", "px-1")}>
                          +{currentValues.length - 3} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <span
                      className={cn(
                        "truncate",
                        "flex-1",
                        "text-start",
                        "text-xs",
                        currentValues.length === 0 && "text-muted-foreground"
                      )}
                    >
                      {getDisplayText()}
                    </span>
                  )}

                  <RiExpandUpDownLine
                    aria-hidden
                    className={cn("h-4", "w-4", "shrink-0", "opacity-50")}
                  />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className={cn("w-[200px]", "p-0")} align="start">
              <Command>
                <CommandInput placeholder={t("table.filter.combobox.search", "Search…")} />
                <CommandList>
                  <CommandEmpty>
                    {noResultsText ?? t("table.filter.combobox.noResults", "Results not found.")}
                  </CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => handleSelect(option.value)}
                        keywords={option.label?.split(" ") ?? []}
                      >
                        {option.label}
                        <RiCheckLine
                          aria-hidden
                          className={cn(
                            "ml-auto",
                            "h-4",
                            "w-4",
                            currentValues.includes(option.value) ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )
      }}
    />
  )
}

export type DataTableFilterDropdownDateSinglePickerProps<TData> = {
  column: Column<TData>
  table?: ReactTable<TData>
  defaultOperator?: CrudOperators
  formatDate?: (date: Date | undefined) => string | undefined
}

export function DataTableFilterDropdownDateSinglePicker<TData>({
  column,
  table,
  defaultOperator = "eq",
  formatDate,
}: DataTableFilterDropdownDateSinglePickerProps<TData>) {
  const columnFilterValue = column.getFilterValue() as string

  const parseDate = (value: string | undefined): Date | undefined => {
    if (!value) return undefined

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return undefined
    return date
  }

  const parsedFilterValue = useMemo(() => parseDate(columnFilterValue), [columnFilterValue])

  const [draftFilterValue, setDraftFilterValue] = useState<Date | undefined>(() =>
    parseDate(columnFilterValue)
  )
  const filterValue = draftFilterValue ?? parsedFilterValue

  const hasDate = !!filterValue

  const formatDateValue = (value: Date | undefined) => {
    if (!value || Number.isNaN(value.getTime())) {
      return undefined
    }

    if (typeof value.toISOString === "function") {
      return value.toISOString()
    }

    return `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}`
  }

  const handleApply = () => {
    if (!filterValue) return

    const value = formatDate?.(filterValue) ?? formatDateValue(filterValue) ?? ""
    setColumnFilterValue({
      column,
      table,
      value,
      operator: defaultOperator,
    })
    setDraftFilterValue(undefined)
  }

  return (
    <DataTableFilterDropdown column={column} contentClassName={cn("w-fit", "p-0")}>
      {({ setIsOpen }) => {
        return (
          <div
            className={cn("flex", "flex-col", "items-center")}
            onKeyDown={(event) => {
              if (!hasDate) return
              if (event.key === "Enter") {
                handleApply()
                setIsOpen(false)
              }
            }}
          >
            <Calendar
              mode="single"
              selected={filterValue}
              onSelect={(date) => {
                setDraftFilterValue(date)
              }}
            />

            <div className={cn("w-full")}>
              <Separator />
            </div>

            <DataTableFilterDropdownActions
              className={cn("p-4")}
              isApplyDisabled={!hasDate}
              onClear={() => {
                setColumnFilterValue({
                  column,
                  table,
                  value: undefined,
                  operator: defaultOperator,
                })
                setDraftFilterValue(undefined)
                setIsOpen(false)
              }}
              onApply={() => {
                handleApply()
                setIsOpen(false)
              }}
            />
          </div>
        )
      }}
    </DataTableFilterDropdown>
  )
}

export type DataTableFilterDropdownDateRangePickerProps<TData> = {
  column: Column<TData>
  table?: ReactTable<TData>
  defaultOperator?: CrudOperators
  formatDateRange?: (dateRange: DateRange | undefined) => string[] | undefined
}

export function DataTableFilterDropdownDateRangePicker<TData>({
  column,
  table,
  defaultOperator = "between",
  formatDateRange,
}: DataTableFilterDropdownDateRangePickerProps<TData>) {
  const columnFilterValue = column.getFilterValue() as string[]

  const parseDateRange = (value: string[] | undefined): DateRange | undefined => {
    if (!value || !Array.isArray(value) || value.length !== 2) return undefined

    const from = value[0] ? new Date(value[0]) : undefined
    const to = value[1] ? new Date(value[1]) : undefined

    if (!from || !to || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return undefined
    return { from, to }
  }

  const parsedFilterValue = useMemo(() => parseDateRange(columnFilterValue), [columnFilterValue])

  const [draftFilterValue, setDraftFilterValue] = useState<DateRange | undefined>(() =>
    parseDateRange(columnFilterValue)
  )
  const filterValue = draftFilterValue ?? parsedFilterValue

  const hasDateRange = filterValue?.from && filterValue?.to

  const handleApply = () => {
    if (!filterValue?.from || !filterValue?.to) return

    const formatRangeDateValue = (value: Date | undefined) => {
      if (!value || Number.isNaN(value.getTime())) {
        return undefined
      }

      if (typeof value.toISOString === "function") {
        return value.toISOString()
      }

      return undefined
    }

    const from = formatRangeDateValue(filterValue.from)
    const to = formatRangeDateValue(filterValue.to)

    if (!from || !to) {
      return
    }

    const values = formatDateRange?.(filterValue) ?? [from, to]
    setColumnFilterValue({
      column,
      table,
      value: values,
      operator: defaultOperator,
    })
    setDraftFilterValue(undefined)
  }

  return (
    <DataTableFilterDropdown column={column} contentClassName={cn("w-fit", "p-0")}>
      {({ setIsOpen }) => {
        return (
          <div
            className={cn("flex", "flex-col", "items-center")}
            onKeyDown={(event) => {
              if (!hasDateRange) return
              if (event.key === "Enter") {
                handleApply()
                setIsOpen(false)
              }
            }}
          >
            <Calendar
              mode="range"
              numberOfMonths={2}
              selected={filterValue}
              onSelect={(date) => {
                setDraftFilterValue({
                  from: date?.from,
                  to: date?.to,
                })
              }}
            />

            <div className={cn("w-full")}>
              <Separator />
            </div>

            <DataTableFilterDropdownActions
              className={cn("p-4")}
              isApplyDisabled={!hasDateRange}
              onClear={() => {
                setColumnFilterValue({
                  column,
                  table,
                  value: undefined,
                  operator: defaultOperator,
                })
                setDraftFilterValue(undefined)
                setIsOpen(false)
              }}
              onApply={() => {
                handleApply()
                setIsOpen(false)
              }}
            />
          </div>
        )
      }}
    </DataTableFilterDropdown>
  )
}

export type DataTableFilterInputProps<TData> = {
  column: Column<TData>
  table?: ReactTable<TData>
  defaultOperator?: CrudOperators
  operators?: CrudOperators[]
  renderInput: (props: {
    value: string | string[]
    onChange: (value: string | string[]) => void
  }) => React.ReactNode
}

export function DataTableFilterInput<TData>({
  column: columnFromProps,
  table: tableFromProps,
  operators: operatorsFromProps,
  defaultOperator: defaultOperatorFromProps,
  renderInput,
}: DataTableFilterInputProps<TData>) {
  const [filterValue, setFilterValue] = useState(
    (columnFromProps.getFilterValue() as string | string[]) || ""
  )

  const [operator, setOperator] = useState<CrudOperators>(() => {
    if (!tableFromProps) {
      return defaultOperatorFromProps || "eq"
    }

    const columnFilter = tableFromProps.getState().columnFilters.find((filter) => {
      return filter.id === columnFromProps.id
    })

    if (columnFilter && "operator" in columnFilter) {
      return columnFilter.operator as CrudOperators
    }

    return defaultOperatorFromProps || "eq"
  })

  const handleApply = () => {
    setColumnFilterValue({
      column: columnFromProps,
      table: tableFromProps,
      value: filterValue,
      operator,
    })
  }

  const handleClear = () => {
    setColumnFilterValue({
      column: columnFromProps,
      table: tableFromProps,
      value: undefined,
      operator,
    })
    setFilterValue("")
  }

  const handleOperatorChange = (value: CrudOperators) => {
    setOperator(value)
  }

  return (
    <DataTableFilterDropdown column={columnFromProps}>
      {({ setIsOpen }) => {
        return (
          <div
            className={cn("flex", "flex-col", "items-center", "gap-4", "w-full")}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleApply()
                setIsOpen(false)
              }
            }}
          >
            <div className={cn("grid", "grid-cols-1", "md:grid-cols-2", "gap-2")}>
              {operatorsFromProps && operatorsFromProps.length > 1 && (
                <DataTableFilterOperatorSelect
                  value={operator}
                  operators={operatorsFromProps}
                  onValueChange={handleOperatorChange}
                />
              )}
              {renderInput({
                value: filterValue,
                onChange: setFilterValue,
              })}
            </div>
            <div className={cn("w-full")}>
              <Separator />
            </div>
            <DataTableFilterDropdownActions
              onClear={() => {
                handleClear()
                setIsOpen(false)
              }}
              onApply={() => {
                handleApply()
                setIsOpen(false)
              }}
            />
          </div>
        )
      }}
    </DataTableFilterDropdown>
  )
}

const CRUD_OPERATOR_LABELS: Record<
  Exclude<CrudOperators, "or" | "and">,
  { i18nKey: string; defaultLabel: string }
> = {
  eq: { i18nKey: "table.filter.operator.eq", defaultLabel: "Equals" },
  ne: { i18nKey: "table.filter.operator.ne", defaultLabel: "Not equals" },
  eqs: {
    i18nKey: "table.filter.operator.eqs",
    defaultLabel: "Equals (case sensitive)",
  },
  nes: {
    i18nKey: "table.filter.operator.nes",
    defaultLabel: "Not equals (case sensitive)",
  },
  lt: { i18nKey: "table.filter.operator.lt", defaultLabel: "Less than" },
  gt: { i18nKey: "table.filter.operator.gt", defaultLabel: "Greater than" },
  lte: {
    i18nKey: "table.filter.operator.lte",
    defaultLabel: "Less than or equal",
  },
  gte: {
    i18nKey: "table.filter.operator.gte",
    defaultLabel: "Greater than or equal",
  },
  in: {
    i18nKey: "table.filter.operator.in",
    defaultLabel: "Includes in an array",
  },
  nin: {
    i18nKey: "table.filter.operator.nin",
    defaultLabel: "Not includes in an array",
  },
  ina: {
    i18nKey: "table.filter.operator.ina",
    defaultLabel: "Includes in an array (case sensitive)",
  },
  nina: {
    i18nKey: "table.filter.operator.nina",
    defaultLabel: "Not includes in an array (case sensitive)",
  },
  contains: {
    i18nKey: "table.filter.operator.contains",
    defaultLabel: "Contains",
  },
  ncontains: {
    i18nKey: "table.filter.operator.ncontains",
    defaultLabel: "Not contains",
  },
  containss: {
    i18nKey: "table.filter.operator.containss",
    defaultLabel: "Contains (case sensitive)",
  },
  ncontainss: {
    i18nKey: "table.filter.operator.ncontainss",
    defaultLabel: "Not contains (case sensitive)",
  },
  between: {
    i18nKey: "table.filter.operator.between",
    defaultLabel: "Between",
  },
  nbetween: {
    i18nKey: "table.filter.operator.nbetween",
    defaultLabel: "Not between",
  },
  null: { i18nKey: "table.filter.operator.null", defaultLabel: "Is null" },
  nnull: {
    i18nKey: "table.filter.operator.nnull",
    defaultLabel: "Is not null",
  },
  startswith: {
    i18nKey: "table.filter.operator.startswith",
    defaultLabel: "Starts with",
  },
  nstartswith: {
    i18nKey: "table.filter.operator.nstartswith",
    defaultLabel: "Not starts with",
  },
  startswiths: {
    i18nKey: "table.filter.operator.startswiths",
    defaultLabel: "Starts with (case sensitive)",
  },
  nstartswiths: {
    i18nKey: "table.filter.operator.nstartswiths",
    defaultLabel: "Not starts with (case sensitive)",
  },
  endswith: {
    i18nKey: "table.filter.operator.endswith",
    defaultLabel: "Ends with",
  },
  nendswith: {
    i18nKey: "table.filter.operator.nendswith",
    defaultLabel: "Not ends with",
  },
  endswiths: {
    i18nKey: "table.filter.operator.endswiths",
    defaultLabel: "Ends with (case sensitive)",
  },
  nendswiths: {
    i18nKey: "table.filter.operator.nendswiths",
    defaultLabel: "Not ends with (case sensitive)",
  },
}

export type DataTableFilterOperatorSelectProps = {
  value: CrudOperators
  onValueChange: (value: CrudOperators) => void
  operators?: CrudOperators[]
  placeholder?: string
  triggerClassName?: string
  contentClassName?: string
}

export function DataTableFilterOperatorSelect({
  value,
  onValueChange,
  operators: operatorsFromProps,
  placeholder,
  triggerClassName,
  contentClassName,
}: DataTableFilterOperatorSelectProps) {
  const t = useTranslate()

  const [open, setOpen] = useState(false)

  const operators = useMemo(() => {
    return Object.entries(CRUD_OPERATOR_LABELS).filter(([operator]) =>
      operatorsFromProps?.includes(operator as CrudOperators)
    )
  }, [operatorsFromProps])

  const selectedLabel = t(
    CRUD_OPERATOR_LABELS[value as Exclude<CrudOperators, "or" | "and">].i18nKey,
    CRUD_OPERATOR_LABELS[value as Exclude<CrudOperators, "or" | "and">].defaultLabel
  )
  const placeholderText = placeholder ?? t("table.filter.operator.placeholder", "Search operator…")
  const noResultsText = t("table.filter.operator.noResults", "No operator found.")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full", "justify-between", "truncate", triggerClassName)}
        >
          <div className={cn("truncate")}>{selectedLabel ?? placeholderText}</div>
          <RiExpandUpDownLine
            aria-hidden
            className={cn("ml-2", "h-4", "w-4", "shrink-0", "opacity-50")}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("p-0", contentClassName)} forceMount>
        <Command>
          <CommandInput placeholder={placeholderText} />
          <CommandList>
            <CommandEmpty>{noResultsText}</CommandEmpty>
            <CommandGroup>
              {operators.map(([op, { i18nKey, defaultLabel }]) => (
                <CommandItem
                  key={op}
                  value={op}
                  onSelect={() => {
                    onValueChange(op as CrudOperators)
                    setOpen(false)
                  }}
                >
                  <RiCheckLine
                    aria-hidden
                    className={cn("mr-2", "h-4", "w-4", value === op ? "opacity-100" : "opacity-0")}
                  />
                  {t(i18nKey, defaultLabel)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

DataTableFilterDropdown.displayName = "DataTableFilterDropdown"
DataTableFilterDropdownText.displayName = "DataTableFilterDropdownText"
DataTableFilterCombobox.displayName = "DataTableFilterCombobox"
DataTableFilterDropdownDateRangePicker.displayName = "DataTableFilterDropdownDateRangePicker"
DataTableFilterOperatorSelect.displayName = "DataTableFilterOperatorSelect"
DataTableFilterDropdownActions.displayName = "DataTableFilterDropdownActions"
DataTableFilterDropdownNumeric.displayName = "DataTableFilterDropdownNumeric"
DataTableFilterInput.displayName = "DataTableFilterInput"
DataTableFilterOperatorSelect.displayName = "DataTableFilterOperatorSelect"
DataTableFilterDropdownDateSinglePicker.displayName = "DataTableFilterDropdownDateSinglePicker"
