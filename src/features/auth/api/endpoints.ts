// features/auth/api/endpoints.ts - Updated with new endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REFRESH_TOKEN: '/auth/refresh-token',
  LOGOUT: '/auth/logout',
  CHECK_TOKEN: '/auth/check-token',
  
  // New endpoints for departments and users
  DEPARTMENTS: '/auth/departments',
  USERS: '/auth/users',
  USERS_BY_DEPARTMENT: '/auth/users/department',
  CURRENT_USER: '/auth/me',
} as const;