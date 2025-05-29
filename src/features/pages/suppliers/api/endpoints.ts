// features/dashboard/suppliers/api/endpoints.ts

// Supplier endpoints
export const SUPPLIER_ENDPOINTS = {
  BASE: '/supplier',
  DETAIL: (id: string) => `/supplier/${id}`,
} as const;