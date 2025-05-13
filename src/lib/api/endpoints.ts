// lib/api/endpoints.ts

// Authentication
export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
};

// Products
export const PRODUCT_ENDPOINTS = {
  GET_ALL: "/api/products",
  GET_BY_ID: (id: number) => `/api/products/${id}`,
  GET_BY_BARCODE: (barcode: string) => `/api/products/barcode/${barcode}`,
  BARCODE_IMAGE: (barcode: string) => `/api/products/barcode/image/${barcode}`,
  AVAILABLE_BARCODES: (productId: number) => `/api/products/${productId}/barcodes/available`,
};

// Inventory
export const INVENTORY_ENDPOINTS = {
  GET_ALL: "/api/inventory",
  GET_BY_WAREHOUSE: (warehouseId: number) => `/api/inventory/warehouse/${warehouseId}`,
  GET_BY_CATEGORY_TYPE: (categoryType: string) => `/api/inventory/category-type/${categoryType}`,
  GET_BY_BARCODE: (barcode: string) => `/api/inventory/barcode/${barcode}`,
};

// Transactions
export const TRANSACTION_ENDPOINTS = {
  STOCK_IN: "/api/transactions/stock-in",
  STOCK_OUT: "/api/transactions/stock-out",
  STOCK_OUT_DIRECT: "/api/transactions/stock-out/direct-request",
  STOCK_OUT_INCIDENT: "/api/transactions/stock-out/incident",
  STOCK_OUT_REGULAR: "/api/transactions/stock-out/regular",
  STOCK_OUT_BARCODE: "/api/transactions/stock-out/barcode",
  TRANSIT: "/api/transactions/transit",
  TRANSIT_COMPLETE: (transitId: number) => `/api/transactions/transit/${transitId}/complete`,
  TRANSIT_CANCEL: (transitId: number) => `/api/transactions/transit/${transitId}/cancel`,
  DEFECT: "/api/transactions/defect",
  RECORD_PARTIAL_DEFECT: "/api/transactions/defect/record-partial",
};

// Warehouses
export const WAREHOUSE_ENDPOINTS = {
  GET_ALL: "/api/warehouses",
  GET_BY_ID: (id: number) => `/api/warehouses/${id}`,
};

// Racks
export const RACK_ENDPOINTS = {
  GET_ALL: "/api/racks",
  GET_BY_ID: (id: number) => `/api/racks/${id}`,
  GET_BY_WAREHOUSE: (warehouseId: number) => `/api/racks/warehouse/${warehouseId}`,
};

// Units
export const UNIT_ENDPOINTS = {
  GET_ALL: "/api/units",
  GET_BY_ID: (id: number) => `/api/units/${id}`,
};

// Categories
export const CATEGORY_ENDPOINTS = {
  GET_ALL: "/api/categories",
  GET_BY_ID: (id: number) => `/api/categories/${id}`,
};

// Suppliers
export const SUPPLIER_ENDPOINTS = {
  GET_ALL: "/api/suppliers",
  GET_BY_ID: (id: number) => `/api/suppliers/${id}`,
};