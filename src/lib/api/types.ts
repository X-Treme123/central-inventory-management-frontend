// Authentication Types
export interface LoginResponse {
  code: string;
  messages: string;
  token: string;
  id?: number;
  name?: string;
  divisi?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  divisi: string;
  password: string;
}

// Generic API Response Type
export interface ApiResponse<T> {
  code: string;
  messages: string;
  value?: T;
  error?: string;
}

// Warehouse Types
export interface Warehouse {
  warehouse_id: number;
  warehouse_name: string;
  location: string;
  capacity: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

// Rack Types
export interface Rack {
  rack_id: number;
  warehouse_id: number;
  rack_name: string;
  rack_code: string;
  rack_barcode: string;
  capacity: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  warehouse_name?: string; // From join
}

// Product Category Types
export interface ProductCategory {
  category_id: number;
  category_name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Unit Types
export interface Unit {
  unit_id: number;
  unit_name: string;
  unit_code: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Product Unit Types
export interface ProductUnit {
  product_unit_id: number;
  product_id: number;
  unit_id: number;
  is_base_unit: boolean;
  conversion_factor: number;
  barcode: string;
  created_at: string;
  updated_at: string;
  unit_name?: string; // From join
  unit_code?: string; // From join
}

// Product Types
export interface Product {
  product_id: number;
  category_id: number;
  product_name: string;
  description: string;
  product_barcode: string;
  base_unit_id: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  category_name?: string; // From join
  units?: ProductUnit[]; // Related units
}

// Inventory Types
export interface Inventory {
  inventory_id: number;
  product_id: number;
  product_unit_id: number;
  warehouse_id: number;
  rack_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
  product_name?: string; // From join
  unit_name?: string; // From join
  warehouse_name?: string; // From join
  rack_name?: string; // From join
}

// Transaction Types
export interface Transaction {
  transaction_id: number;
  transaction_type: "stock_in" | "stock_out" | "transfer";
  reference_number: string;
  notes: string;
  user_id: number;
  transaction_date: string;
  created_at: string;
  updated_at: string;
  details?: TransactionDetail[]; // Related details
}

// Transaction Detail Types
export interface TransactionDetail {
  detail_id: number;
  transaction_id: number;
  product_id: number;
  product_unit_id: number;
  warehouse_id: number;
  rack_id: number;
  quantity: number;
  source_warehouse_id?: number;
  source_rack_id?: number;
  destination_warehouse_id?: number;
  destination_rack_id?: number;
  created_at: string;
  updated_at: string;
  product_name?: string; // From join
  unit_name?: string; // From join
}

// Transaction Request Types
export interface TransactionItem {
  product_id: number;
  product_unit_id: number;
  warehouse_id: number;
  rack_id: number;
  quantity: number;
}

export interface StockInRequest {
  reference_number: string;
  notes?: string;
  user_id: number;
  items: TransactionItem[];
}

export interface StockOutRequest {
  reference_number: string;
  notes?: string;
  user_id: number;
  items: TransactionItem[];
}

export interface TransferItem extends TransactionItem {
  source_warehouse_id: number;
  source_rack_id: number;
  destination_warehouse_id: number;
  destination_rack_id: number;
}

export interface TransferRequest {
  reference_number: string;
  notes?: string;
  user_id: number;
  items: TransferItem[];
}
