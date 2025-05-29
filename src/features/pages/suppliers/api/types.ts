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

// Common API response wrapper
export interface ApiResponse<T> {
  code: string;
  message: string;
  data?: T;
  error?: string;
}