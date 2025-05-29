// features/dashboard/products/api/types.ts

//=============================================================================
// PRODUCT TYPES
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

// Common API response wrapper
export interface ApiResponse<T> {
  code: string;
  message: string;
  data?: T;
  error?: string;
}