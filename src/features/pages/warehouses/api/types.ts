// features/dashboard/warehouses/api/types.ts

// Warehouse types
export interface Warehouses {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Container {
  id: string;
  warehouse_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Rack {
  id: string;
  container_id: string;
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