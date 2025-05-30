// File: features/profile/api/endpoints.ts

export const PROFILE_ENDPOINTS = {
  // Get user profile by ID
  GET_USER_PROFILE: (idnik: string) => `/profile/${idnik}`,
  
  // Get current user profile
  GET_CURRENT_PROFILE: '/profile/me',
  
  // Update last active
  UPDATE_LAST_ACTIVE: (idnik: string) => `/profile/${idnik}/last-active`,
  
  // Batch operations (if needed in future)
  GET_MULTIPLE_PROFILES: '/profile/batch',
  
  // Profile statistics (if needed)
  GET_PROFILE_STATS: '/profile/stats',
} as const;

export const PROFILE_QUERIES = {
  // React Query keys for caching
  USER_PROFILE: (idnik: string) => ['profile', 'user', idnik],
  CURRENT_PROFILE: ['profile', 'current'],
  PROFILE_STATS: ['profile', 'stats'],
} as const;