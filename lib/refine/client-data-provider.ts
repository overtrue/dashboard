"use client"

import type { BaseKey, CrudFilters, CrudSorting, DataProvider, Pagination } from "@refinedev/core"

const API_URL = "/api/admin"

function createSearchParams(params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) searchParams.set(key, value)
  }
  const query = searchParams.toString()
  return query ? `?${query}` : ""
}

function serialize<T>(value: T) {
  return JSON.stringify(value)
}

async function request<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })

  const payload = await response.json().catch(() => ({ message: "Unknown request failure" }))

  if (!response.ok) {
    throw {
      message: typeof payload?.message === "string" ? payload.message : "Dashboard request failed",
      statusCode: response.status,
      ...payload,
    }
  }

  return payload as T
}

function buildListQuery(pagination?: Pagination, sorters?: CrudSorting, filters?: CrudFilters) {
  return createSearchParams({
    pagination: pagination ? serialize(pagination) : undefined,
    sorters: sorters?.length ? serialize(sorters) : undefined,
    filters: filters?.length ? serialize(filters) : undefined,
  })
}

function getResourceUrl(resource: string, id?: BaseKey) {
  return id === undefined ? `${API_URL}/${resource}` : `${API_URL}/${resource}/${id}`
}

export const dashboardDataProvider: DataProvider = {
  getApiUrl: () => API_URL,
  async getList({ resource, pagination, sorters, filters }) {
    return request(`${getResourceUrl(resource)}${buildListQuery(pagination, sorters, filters)}`)
  },
  async getOne({ resource, id }) {
    return request(getResourceUrl(resource, id))
  },
  async create({ resource, variables }) {
    return request(getResourceUrl(resource), {
      method: "POST",
      body: JSON.stringify(variables),
    })
  },
  async update({ resource, id, variables }) {
    return request(getResourceUrl(resource, id), {
      method: "PATCH",
      body: JSON.stringify(variables),
    })
  },
  async deleteOne({ resource, id, variables }) {
    return request(getResourceUrl(resource, id), {
      method: "DELETE",
      body: JSON.stringify(variables ?? {}),
    })
  },
}
