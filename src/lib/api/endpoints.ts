// lib/api/endpoints.ts

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
} as const;

// Warehouse endpoints
export const WAREHOUSE_ENDPOINTS = {
  BASE: '/warehouse',
  CONTAINERS: '/warehouse/containers',
  CONTAINERS_BY_WAREHOUSE: (warehouseId: string) => `/warehouse/containers/${warehouseId}`,
  RACKS: '/warehouse/racks',
  RACKS_BY_CONTAINER: (containerId: string) => `/warehouse/racks/${containerId}`,
} as const;

// Supplier endpoints
export const SUPPLIER_ENDPOINTS = {
  BASE: '/supplier',
  DETAIL: (id: string) => `/supplier/${id}`,
} as const;

// Category endpoints
export const CATEGORY_ENDPOINTS = {
  BASE: '/category',
  DETAIL: (id: string) => `/category/${id}`,
} as const;

// Unit endpoints
export const UNIT_ENDPOINTS = {
  BASE: '/unit',
  DETAIL: (id: string) => `/unit/${id}`,
} as const;

// Department endpoints
export const DEPARTMENT_ENDPOINTS = {
  BASE: '/department',
  DETAIL: (id: string) => `/department/${id}`,
} as const;

//=============================================================================
// PRODUCT ENDPOINTS - Updated dengan barcode scanning support
//=============================================================================

export const PRODUCT_ENDPOINTS = {
  BASE: '/product',
  DETAIL: (id: string) => `/product/${id}`,
  // Barcode scanning endpoints
  SCAN: '/product/scan',
  BARCODE_UPDATE: (id: string) => `/product/${id}/barcodes`,
  DEBUG_BARCODES: '/product/debug/barcodes',
  // Unit conversion endpoints
  CONVERSIONS: '/product/conversions',
  CONVERSIONS_BY_PRODUCT: (productId: string) => `/product/conversions/${productId}`,
  CONVERSION_DETAIL: (id: string) => `/product/conversions/${id}`,
} as const;

//=============================================================================
// STOCK IN ENDPOINTS - Updated dengan barcode scanning support
//=============================================================================

export const STOCK_IN_ENDPOINTS = {
  BASE: '/stock-in',
  DETAIL: (id: string) => `/stock-in/${id}`,
  // Original items endpoint (untuk backward compatibility)
  ITEMS: (stockInId: string) => `/stock-in/${stockInId}/items`,
  // New barcode scanning endpoint
  ITEMS_SCAN: (stockInId: string) => `/stock-in/${stockInId}/items/scan`,
  COMPLETE: (id: string) => `/stock-in/${id}/complete`,
  BARCODES: (itemId: string) => `/stock-in/items/${itemId}/barcodes`,
} as const;

// Defect endpoints
export const DEFECT_ENDPOINTS = {
  BASE: '/defect',
  DETAIL: (id: string) => `/defect/${id}`,
  STATUS: (id: string) => `/defect/${id}/status`,
} as const;

//=============================================================================
// STOCK OUT ENDPOINTS - Updated dengan barcode scanning support
//=============================================================================

export const STOCK_OUT_ENDPOINTS = {
  BASE: '/stock-out',
  DETAIL: (id: string) => `/stock-out/${id}`,
  // Original items endpoints (untuk request-based system)
  ITEMS: (stockOutId: string) => `/stock-out/${stockOutId}/items`,
  ITEMS_SCAN: (stockOutId: string) => `/stock-out/${stockOutId}/items/scan`,
  // New direct scanning endpoints (POS-style)
  SCAN: '/stock-out/scan',
  STOCK_CHECK: (barcode: string) => `/stock-out/stock/${barcode}`,
  // Scan history and analytics
  SCAN_HISTORY: '/stock-out/history/scans',
  SUMMARY: '/stock-out/summary',
  // Approval workflow
  APPROVE: (id: string) => `/stock-out/${id}/approve`,
  COMPLETE: (id: string) => `/stock-out/${id}/complete`,
} as const;

//=============================================================================
// BARCODE ENDPOINTS - New endpoints untuk barcode management
//=============================================================================

export const BARCODE_ENDPOINTS = {
  SCAN_HISTORY: '/barcode-scans',
  PRODUCT_LOOKUP: (barcode: string) => `/barcode/lookup/${barcode}`,
  VALIDATE: '/barcode/validate',
} as const;

// Report endpoints
export const REPORT_ENDPOINTS = {
  CURRENT_STOCK: '/report/current',
  STOCK_HISTORY: '/report/history',
  MONTHLY_REPORT: '/report/monthly',
  STOCK_BY_LOCATION: '/report/location',
  // New barcode analytics endpoints
  BARCODE_ANALYTICS: '/report/barcode-analytics',
  INVENTORY_TURNOVER: '/report/turnover',
} as const;