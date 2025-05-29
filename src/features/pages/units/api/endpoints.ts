// features/dashboard/units/api/endpoints.ts

// Unit endpoints
export const UNIT_ENDPOINTS = {
  BASE: '/unit',
  DETAIL: (id: string) => `/unit/${id}`,
} as const;