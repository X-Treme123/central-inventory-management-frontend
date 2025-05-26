// lib/api/types.ts

// Authentication types
export interface LoginResponse {
  code: string;
  messages?: string;
  message?: string;
  token: string;
  user?: {
    id: number;
    name: string;
    username: string;
    divisi: string;
    avatar?: string;
  };
}

// Common types
export interface ApiResponse<T> {
  code: string;
  message: string;
  data?: T;
  error?: string;
}

// Warehouse types
export interface Warehouse {
  id: string;
  name: string;
  description: string | null;
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

// Category types
export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Unit types
export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
  created_at: string;
  updated_at: string;
}

// Department types
export interface Department {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

//=============================================================================
// PRODUCT TYPES - Updated dengan barcode support
//=============================================================================

export interface Product {
  id: string;
  part_number: string;
  name: string;
  description: string | null;
  category_id: string;
  base_unit_id: string;
  price: number;
  // Barcode fields
  piece_barcode: string | null;
  pack_barcode: string | null;
  box_barcode: string | null;
  pieces_per_pack: number;
  packs_per_box: number;
  created_at: string;
  updated_at: string;
  // Populated fields
  category_name?: string;
  base_unit_name?: string;
  total_stock_pieces?: number;
}

export interface UnitConversion {
  id: string;
  product_id: string;
  from_unit_id: string;
  to_unit_id: string;
  conversion_factor: number;
  created_at: string;
  updated_at: string;
  from_unit_name?: string;
  from_unit_abbr?: string;
  to_unit_name?: string;
  to_unit_abbr?: string;
}

//=============================================================================
// BARCODE TYPES - New types untuk barcode scanning system
//=============================================================================

export interface BarcodeScanResponse {
  product: {
    id: string;
    part_number: string;
    name: string;
    description: string | null;
    category_name: string;
    base_unit_name: string;
    price: number;
    pieces_per_pack: number;
    packs_per_box: number;
  };
  scan_info: {
    scanned_barcode: string;
    detected_unit_type: 'piece' | 'pack' | 'box';
    available_units: number;
    total_pieces_in_stock: number;
    storage_locations: number;
  };
  unit_conversion: {
    pieces_per_pack: number;
    packs_per_box: number;
    total_pieces_per_box: number;
  };
}

export interface BarcodeScan {
  id: string;
  barcode: string;
  product_id: string;
  unit_type: 'piece' | 'pack' | 'box';
  scan_type: 'stock_in' | 'stock_out' | 'check_stock';
  scanned_by: number;
  scan_time: string;
  reference_id: string | null;
  // Populated fields
  product_name?: string;
  part_number?: string;
  scanned_by_name?: string;
}

//=============================================================================
// PRODUCT FORM TYPES - Updated untuk barcode support
//=============================================================================

export interface CreateProductForm {
  part_number: string;
  name: string;
  description?: string;
  category_id: string;
  base_unit_id: string;
  price: number;
}

export interface CreateProductWithBarcodeForm extends CreateProductForm {
  piece_barcode?: string;
  pack_barcode?: string;
  box_barcode?: string;
  pieces_per_pack?: number;
  packs_per_box?: number;
}

export interface UpdateProductBarcodesForm {
  piece_barcode?: string;
  pack_barcode?: string;
  box_barcode?: string;
}

//=============================================================================
// STOCK IN TYPES - Updated dengan barcode support
//=============================================================================

export interface StockIn {
  id: string;
  invoice_code: string;
  packing_list_number: string | null;
  supplier_id: string;
  received_by: number;
  receipt_date: string;
  notes: string | null;
  status: 'pending' | 'completed' | 'rejected';
  created_at: string;
  updated_at: string;
  supplier_name?: string;
  received_by_name?: string;
  items?: StockInItem[];
}

export interface StockInItem {
  id: string;
  stock_in_id: string;
  product_id: string;
  unit_id: string;
  quantity: number;
  // Legacy fields (tetap untuk backward compatibility)
  packs_per_box: number | null;
  pieces_per_pack: number | null;
  total_pieces: number;
  price_per_unit: number;
  total_amount: number;
  warehouse_id: string;
  container_id: string;
  rack_id: string;
  checked_by: number;
  // New barcode fields
  scanned_barcode?: string;
  unit_type?: 'piece' | 'pack' | 'box';
  created_at: string;
  updated_at: string;
  // Populated fields
  product_name?: string;
  part_number?: string;
  unit_name?: string;
  unit_abbreviation?: string;
  warehouse_name?: string;
  container_name?: string;
  rack_name?: string;
  checked_by_name?: string;
  barcode_count?: number;
}

export interface AddStockInItemForm {
  product_id: string;
  unit_id: string;
  quantity: number;
  packs_per_box?: number;
  pieces_per_pack?: number;
  price_per_unit: number;
  warehouse_id: string;
  container_id: string;
  rack_id: string;
}

export interface AddStockInItemByBarcodeForm {
  barcode: string;
  quantity: number;
  price_per_unit: number;
  warehouse_id: string;
  container_id: string;
  rack_id: string;
}

export interface ProductBarcode {
  id: string;
  stock_in_item_id: string;
  barcode: string;
  unit_type: 'piece' | 'pack' | 'box';
  is_defect: boolean;
  defect_notes: string | null;
  created_at: string;
  updated_at: string;
}

//=============================================================================
// STOCK OUT TYPES - Updated dengan barcode support
//=============================================================================

export interface StockOut {
  id: string;
  reference_number: string;
  request_date: string;
  department_id: string;
  requestor_name: string;
  requestor_id: number;
  approved_by?: number;
  approval_date?: string;
  notes: string | null;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  created_at: string;
  updated_at: string;
  department_name?: string;
  requestor_username?: string;
  approver_username?: string;
  items?: StockOutItem[];
}

export interface StockOutItem {
  id: string;
  stock_out_id: string;
  product_id: string;
  unit_id: string;
  quantity: number;
  total_pieces: number;
  price_per_unit: number;
  total_amount: number;
  remaining_stock?: number;
  // New barcode fields
  scanned_barcode?: string;
  unit_type?: 'piece' | 'pack' | 'box';
  created_at: string;
  updated_at: string;
  // Populated fields
  product_name?: string;
  part_number?: string;
  unit_name?: string;
  unit_abbreviation?: string;
  barcode_count?: number;
}

export interface StockOutScanResponse {
  product: {
    id: string;
    name: string;
    part_number: string;
  };
  transaction: {
    scanned_barcode: string;
    unit_type: 'piece' | 'pack' | 'box';
    quantity_scanned: number;
    pieces_deducted: number;
    price_per_piece: number;
    total_amount_deducted: number;
  };
  stock_info: {
    location: {
      warehouse: string;
      container: string;
      rack: string;
    };
    previous_stock: number;
    remaining_at_location: number;
    total_remaining_all_locations: number;
  };
  conversion: {
    pieces_per_pack: number;
    packs_per_box: number;
  };
}

export interface BarcodeStockResponse {
  product: {
    id: string;
    name: string;
    part_number: string;
  };
  barcode_info: {
    scanned_barcode: string;
    unit_type: 'piece' | 'pack' | 'box';
  };
  stock_summary: {
    total_pieces_all_locations: number;
    available_units_for_scanned_type: number;
    number_of_locations: number;
  };
  stock_locations: Array<{
    id: string;
    warehouse_id: string;
    container_id: string;
    rack_id: string;
    total_pieces: number;
    total_amount: number;
    warehouse_name: string;
    container_name: string;
    rack_name: string;
  }>;
  conversion: {
    pieces_per_pack: number;
    packs_per_box: number;
  };
}

export interface StockOutBarcode {
  id: string;
  stock_out_item_id: string;
  barcode_id: string;
  created_at: string;
}

//=============================================================================
// DEFECT TYPES
//=============================================================================

export interface DefectItem {
  id: string;
  stock_in_item_id: string;
  unit_id: string;
  quantity: number;
  defect_date: string;
  defect_type: string;
  defect_description: string | null;
  reported_by: number;
  status: 'pending' | 'returned' | 'resolved';
  created_at: string;
  updated_at: string;
  product_name?: string;
  part_number?: string;
  unit_name?: string;
  reported_by_name?: string;
  warehouse_name?: string;
  container_name?: string;
  rack_name?: string;
  barcodes?: ProductBarcode[];
}

//=============================================================================
// STOCK REPORT TYPES
//=============================================================================

export interface CurrentStock {
  id: string;
  product_id: string;
  warehouse_id: string;
  container_id: string;
  rack_id: string;
  total_pieces: number;
  total_amount: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
  product_name?: string;
  part_number?: string;
  category_name?: string;
  warehouse_name?: string;
  container_name?: string;
  rack_name?: string;
  base_unit_name?: string;
}

export interface StockHistory {
  id: string;
  product_id: string;
  transaction_type: 'stock_in' | 'stock_out' | 'defect' | 'adjustment';
  reference_id: string;
  quantity: number;
  unit_id: string;
  total_pieces: number;
  previous_stock: number;
  current_stock: number;
  warehouse_id: string;
  container_id: string;
  rack_id: string;
  user_id: number;
  transaction_date: string;
  notes: string | null;
  created_at: string;
  product_name?: string;
  part_number?: string;
  unit_name?: string;
  warehouse_name?: string;
  container_name?: string;
  rack_name?: string;
  user_name?: string;
}

export interface MonthlyStockReport {
  id: string;
  product_id: string;
  year: number;
  month: number;
  opening_qty: number;
  opening_amount: number;
  incoming_qty: number;
  incoming_amount: number;
  outgoing_qty: number;
  outgoing_amount: number;
  defect_qty: number;
  defect_amount: number;
  closing_qty: number;
  closing_amount: number;
  created_at: string;
  updated_at: string;
  product_name?: string;
  part_number?: string;
  category_name?: string;
}

//=============================================================================
// PAGINATION AND FILTER TYPES
//=============================================================================

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginationResponse {
  total_count: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface ScanHistoryFilters extends PaginationParams {
  product_id?: string;
  barcode?: string;
  user_id?: string;
  scan_type?: 'stock_out' | 'stock_in' | 'check_stock';
  start_date?: string;
  end_date?: string;
}

export interface StockOutSummaryFilters {
  start_date?: string;
  end_date?: string;
  department_id?: string;
  status?: string;
}

export interface StockReportFilters {
  warehouse_id?: string;
  container_id?: string;
  rack_id?: string;
  product_id?: string;
  start_date?: string;
  end_date?: string;
}

//=============================================================================
// DEBUG AND UTILITY TYPES
//=============================================================================

export interface BarcodeDebugResponse {
  total_products_with_barcodes: number;
  products: Array<{
    id: string;
    part_number: string;
    name: string;
    piece_barcode: string | null;
    pack_barcode: string | null;
    box_barcode: string | null;
    created_at: string;
  }>;
  duplicate_barcodes: Array<{
    barcode: string;
    count: number;
    products: string;
  }>;
  has_conflicts: boolean;
}

export interface BarcodeValidationResponse {
  is_valid: boolean;
  exists: boolean;
  product_info?: {
    id: string;
    name: string;
    part_number: string;
    unit_type: 'piece' | 'pack' | 'box';
  };
  message: string;
}