// features/dashboard/categories/api/types.ts

// Category types
export interface Category {
  id: string;
  name: string;
  description: string | null;
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