// File: features/profile/api/index.ts

export * from './types';
export * from './services';
export * from './endpoints';

// Re-export the main service instance for easy access
export { ProfileApiService as profileApi } from './services';