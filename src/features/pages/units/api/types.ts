// features/dashboard/units/api/types.ts

// Unit types
export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
  created_at: string;
  updated_at: string;
}

// Common API response wrapper
export interface ApiResponse<T> {
  code: string;
  message: string;
  data?: T;
  error?: string;
}