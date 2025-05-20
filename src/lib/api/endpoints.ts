// lib/api/endpoints.ts

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
};

// Warehouse endpoints
export const WAREHOUSE_ENDPOINTS = {
  BASE: '/warehouse',
  CONTAINERS: '/warehouse/containers',
  CONTAINERS_BY_WAREHOUSE: (warehouseId: string) => `/warehouse/containers/${warehouseId}`,
  RACKS: '/warehouse/racks',
  RACKS_BY_CONTAINER: (containerId: string) => `/warehouse/racks/${containerId}`,
};

// Supplier endpoints
export const SUPPLIER_ENDPOINTS = {
  BASE: '/supplier',
  DETAIL: (id: string) => `/supplier/${id}`,
};

// Category endpoints
export const CATEGORY_ENDPOINTS = {
  BASE: '/category',
  DETAIL: (id: string) => `/category/${id}`,
};

// Unit endpoints
export const UNIT_ENDPOINTS = {
  BASE: '/unit',
  DETAIL: (id: string) => `/unit/${id}`,
};

// Department endpoints
export const DEPARTMENT_ENDPOINTS = {
  BASE: '/department',
  DETAIL: (id: string) => `/department/${id}`,
};

// Product endpoints
export const PRODUCT_ENDPOINTS = {
  BASE: '/product',
  DETAIL: (id: string) => `/product/${id}`,
  CONVERSIONS: '/product/conversions',
  CONVERSIONS_BY_PRODUCT: (productId: string) => `/product/conversions/${productId}`,
  CONVERSION_DETAIL: (id: string) => `/product/conversions/${id}`,
};

// Stock In endpoints
export const STOCK_IN_ENDPOINTS = {
  BASE: '/stock-in',
  DETAIL: (id: string) => `/stock-in/${id}`,
  ITEMS: (stockInId: string) => `/stock-in/${stockInId}/items`,
  COMPLETE: (id: string) => `/stock-in/${id}/complete`,
  BARCODES: (itemId: string) => `/stock-in/items/${itemId}/barcodes`,
};

// Defect endpoints
export const DEFECT_ENDPOINTS = {
  BASE: '/defect',
  DETAIL: (id: string) => `/defect/${id}`,
  STATUS: (id: string) => `/defect/${id}/status`,
};

// Stock Out endpoints
export const STOCK_OUT_ENDPOINTS = {
  BASE: '/stock-out',
  DETAIL: (id: string) => `/stock-out/${id}`,
  ITEMS: (stockOutId: string) => `/stock-out/${stockOutId}/items`,
  APPROVE: (id: string) => `/stock-out/${id}/approve`,
  COMPLETE: (id: string) => `/stock-out/${id}/complete`,
};

// Report endpoints
export const REPORT_ENDPOINTS = {
  CURRENT_STOCK: '/report/current',
  STOCK_HISTORY: '/report/history',
  MONTHLY_REPORT: '/report/monthly',
  STOCK_BY_LOCATION: '/report/location',
};