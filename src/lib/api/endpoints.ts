// Authentication
export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
};

// Warehouse Endpoints
export const WAREHOUSE_ENDPOINTS = {
  BASE: "/api/warehouses",
  DETAIL: (id: number) => `/api/warehouses/${id}`,
  RACKS: (id: number) => `/api/warehouses/${id}/racks`,
};

// Rack Endpoints
export const RACK_ENDPOINTS = {
  BASE: "/api/racks",
  DETAIL: (id: number) => `/api/racks/${id}`,
  INVENTORY: (id: number) => `/api/racks/${id}/inventory`,
};

// Unit Endpoints
export const UNIT_ENDPOINTS = {
  BASE: "/api/units",
  DETAIL: (id: number) => `/api/units/${id}`,
};

// Product Endpoints
export const PRODUCT_ENDPOINTS = {
  BASE: "/api/products",
  DETAIL: (id: number) => `/api/products/${id}`,
  BARCODE: (barcode: string) => `/api/products/barcode/${barcode}`,
};

// Inventory Endpoints
export const INVENTORY_ENDPOINTS = {
  BASE: "/api/inventory",
  BY_PRODUCT: (id: number) => `/api/inventory/product/${id}`,
  BY_WAREHOUSE: (id: number) => `/api/inventory/warehouse/${id}`,
  BY_RACK: (id: number) => `/api/inventory/rack/${id}`,
};

// Transaction Endpoints
export const TRANSACTION_ENDPOINTS = {
  BASE: "/api/transactions",
  DETAIL: (id: number) => `/api/transactions/${id}`,
  STOCK_IN: "/api/transactions/stock-in",
  STOCK_OUT: "/api/transactions/stock-out",
  TRANSFER: "/api/transactions/transfer",
};
