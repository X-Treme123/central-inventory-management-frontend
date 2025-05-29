// features/dashboard/products/api/endpoints.ts

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