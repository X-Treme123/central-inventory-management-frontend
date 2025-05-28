// features/dashboard/warehouses/api/endpoints.ts

// Storage endpoints
export const WAREHOUSE_ENDPOINTS = {
  BASE: '/warehouses',
  CONTAINERS: '/containers',
  CONTAINERS_BY_WAREHOUSE: (warehouseId: string) => `/containers/warehouse/${warehouseId}`,
  RACKS: '/racks',
  RACKS_BY_CONTAINER: (containerId: string) => `/racks/container/${containerId}`,
} as const;