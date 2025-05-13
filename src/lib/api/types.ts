// lib/api/types.ts

// Authentication Types
export interface LoginResponse {
  code: string;
  messages?: string;
  message?: string;
  token: string;
  user?: {
    id: number;
    name: string;
    email: string;
    divisi: string;
    avatar?: string;
  };
}

// Product Types
export interface Product {
  product_id: number;
  category_id: number;
  product_name: string;
  description: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  category_name?: string;
  units?: ProductUnit[];
}

export interface ProductUnit {
  product_unit_id: number;
  product_id: number;
  unit_id: number;
  is_base_unit: number; // 0 or 1
  conversion_factor: number;
  created_at: string;
  updated_at: string;
  unit_name?: string;
  unit_code?: string;
}

export interface Unit {
  unit_id: number;
  unit_name: string;
  unit_code: string;
  unit_type: 'PIECE' | 'PACK';
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Warehouse Types
export interface Warehouse {
  warehouse_id: number;
  warehouse_name: string;
  location: string;
  capacity: number | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Rack {
  rack_id: number;
  warehouse_id: number;
  rack_name: string;
  rack_code: string;
  rack_barcode: string;
  capacity: number | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  warehouse_name?: string;
}

// Inventory Types
export interface InventoryItem {
  inventory_id: number;
  product_id: number;
  product_unit_id: number;
  warehouse_id: number;
  rack_id: number;
  quantity: string | number;
  created_at: string;
  updated_at: string;
  product_name: string;
  category_name: string;
  category_type: 'GA' | 'NON-GA';
  unit_name: string;
  unit_code: string;
  warehouse_name: string;
  rack_name: string;
  rack_code: string;
  barcode_count: number;
}

export interface BarcodeItem {
  barcode_id: number;
  product_id: number;
  product_unit_id: number;
  warehouse_id: number;
  rack_id: number;
  barcode: string;
  status: 'available' | 'issued' | 'defect' | 'transit';
  created_at: string;
  updated_at: string;
  product_name: string;
  description: string | null;
  unit_name: string;
  unit_code: string;
  warehouse_name: string;
  rack_name: string;
  barcode_type?: string;
}

// Transaction Types
export interface Transaction {
  transaction_id: number;
  transaction_type: 'stock_in' | 'stock_out' | 'transfer';
  transaction_reason: 'direct_request' | 'incident' | 'regular';
  reference_number: string | null;
  notes: string | null;
  user_id: number | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;
  supplier_id: number | null;
}

export interface TransactionDetail {
  detail_id: number;
  transaction_id: number;
  product_id: number;
  product_unit_id: number;
  warehouse_id: number;
  rack_id: number;
  quantity: number;
  source_warehouse_id: number | null;
  source_rack_id: number | null;
  destination_warehouse_id: number | null;
  destination_rack_id: number | null;
  is_defect: number; // 0 or 1
  defect_reason: 'factory' | 'shipping' | 'other' | null;
  is_transit: number; // 0 or 1
  transit_id: number | null;
  created_at: string;
  updated_at: string;
}

// Stock-In Types
export interface StockInItem {
  product_id: number;
  product_unit_id: number;
  warehouse_id: number;
  rack_id: number;
  quantity: number;
  is_defect: boolean;
  defect_reason?: 'factory' | 'shipping' | 'other';
  is_transit: boolean;
  destination_warehouse_id?: number;
  destination_rack_id?: number;
  is_partial_defect?: boolean;
  parent_unit_id?: number;
  parent_quantity?: number;
}

export interface StockInRequest {
  reference_number: string;
  notes?: string;
  user_id: number;
  supplier_id?: number;
  items: StockInItem[];
}

export interface StockInResponse {
  code: string;
  message: string;
  data: {
    transaction_id: number;
    transaction_type: 'stock_in';
  };
}

export interface StockOutResponse {
  code: string;
  message: string;
  data: {
    transaction_id: number;
    product_name?: string;
    barcode?: string;
    unit_type?: 'PACK' | 'PIECE';
    unit_name?: string;
    unit_code?: string;
    transaction_type?: 'stock_out';
    transaction_reason?: 'direct_request' | 'incident' | 'regular';
    barcodes_processed?: number;
  };
}

export interface DefectProduct {
  defect_id: number;
  product_id: number;
  product_unit_id: number;
  barcode_id: number | null;
  quantity: string | number;
  defect_reason: 'factory' | 'shipping' | 'other';
  parent_unit_id: number | null;
  parent_quantity: number | null;
  is_partial: number; // 0 or 1
  notes: string | null;
  reported_date: string;
  created_at: string;
  updated_at: string;
  product_name: string;
  unit_name: string;
  unit_code: string;
  parent_unit_name: string | null;
  parent_unit_barcode: string | null;
}

export interface TransitProduct {
  transit_id: number;
  product_id: number;
  product_unit_id: number;
  quantity: string | number;
  source_warehouse_id: number | null;
  destination_warehouse_id: number | null;
  status: 'in_transit' | 'completed' | 'cancelled';
  transit_reason: 'category_based' | 'transfer_request' | 'other';
  transit_date: string;
  estimated_arrival: string | null;
  actual_arrival: string | null;
  created_at: string;
  updated_at: string;
  product_name: string;
  unit_name: string;
  unit_code: string;
  source_warehouse_name: string | null;
  destination_warehouse_name: string | null;
  barcode_count: number;
}

export interface Category {
  category_id: string,
  category_name: string,
  category_type?: 'GA' | 'NON-GA',
  description: string,
  created_at: string,
  updated_at: string,
}

export interface Supplier {
  supplier_id: number,
  supplier_name: string,
  contact_person: string,
  email: string,
  phone: string,
  address: string,
  status: 'active' | 'inactive',
  created_at: string,
  upadated_at: string,
}