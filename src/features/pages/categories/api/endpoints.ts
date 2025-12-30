// features/dashboard/categories/api/endpoints.ts

// Category endpoints
export const CATEGORY_ENDPOINTS = {
  BASE: '/category',
  DETAIL: (id: string) => `/category/${id}`,
} as const;