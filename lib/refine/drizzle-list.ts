import "server-only"

import type { BaseRecord, DataProvider, GetListParams, GetListResponse } from "@refinedev/core"
import { sql } from "drizzle-orm"
import { calculatePagination, filtersToWhere, sortersToOrderBy } from "refine-sqlx"

type GetList = NonNullable<DataProvider["getList"]>
type GetListResult = Awaited<ReturnType<GetList>>

type DynamicQuery<TData> = PromiseLike<TData> & {
  where: (...args: never[]) => DynamicQuery<TData>
  orderBy: (...args: never[]) => DynamicQuery<TData>
  limit: (limit: number) => DynamicQuery<TData>
  offset: (offset: number) => DynamicQuery<TData>
}

type SelectFrom<TData> = {
  from: (table: unknown) => { $dynamic: () => DynamicQuery<TData> }
}

type ReadDb = {
  select: {
    (): SelectFrom<unknown[]>
    (fields: Record<string, unknown>): SelectFrom<Array<{ total: number }>>
  }
}

type CreateDrizzleGetListOptions = {
  db: unknown
  getTable: (resource: string) => unknown
  onError?: (error: unknown, params: GetListParams) => GetListResult | Promise<GetListResult>
}

export function createDrizzleGetList({
  db,
  getTable,
  onError,
}: CreateDrizzleGetListOptions): GetList {
  const readDb = db as ReadDb

  return async <TData extends BaseRecord = BaseRecord>(params: GetListParams) => {
    try {
      const table = getTable(params.resource)
      const where = filtersToWhere(params.filters as never, table as never)
      const orderBy = sortersToOrderBy(params.sorters as never, table as never)
      const paginationMode = params.pagination?.mode ?? "server"
      const { offset, limit } = calculatePagination(params.pagination ?? {})

      let dataQuery = readDb.select().from(table).$dynamic()

      if (where) dataQuery = dataQuery.where(where as never)
      if (orderBy.length > 0) dataQuery = dataQuery.orderBy(...(orderBy as never[]))
      if (paginationMode !== "off" && paginationMode !== "client") {
        dataQuery = dataQuery.limit(limit).offset(offset)
      }

      const data = await dataQuery

      let totalQuery = readDb
        .select({ total: sql<number>`count(*)` })
        .from(table)
        .$dynamic()
      if (where) totalQuery = totalQuery.where(where as never)

      const totalResult = await totalQuery
      const total = Number(totalResult[0]?.total ?? data.length)

      return { data: data as TData[], total } satisfies GetListResponse<TData>
    } catch (error) {
      if (onError) return (await onError(error, params)) as GetListResponse<TData>
      throw error
    }
  }
}
