// features/dashboard/suppliers/api/types.ts

// Supplier types
export interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
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