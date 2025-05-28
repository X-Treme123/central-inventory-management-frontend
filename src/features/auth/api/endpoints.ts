// features/auth/api/endpoints.ts
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REFRESH_TOKEN: '/auth/refresh-token',
  LOGOUT: '/auth/logout',
  CHECK_TOKEN: '/auth/check-token',
} as const;