// features/dashboard/products/api/services.ts

import { fetchWithAuth } from "@/lib/api/config";
import { PRODUCT_ENDPOINTS } from "./endpoints";
import {
  ApiResponse,
  Product,
  CreateProductWithBarcodeForm,
  BarcodeScanResponse,
  UnitConversion,
} from "./types";

//=============================================================================
// PRODUCT SERVICES
//=============================================================================

export const createProduct = async (
  token: string,
  data: {
    part_number: string;
    name: string;
    description?: string;
    category_id: string;
    base_unit_id: string;
    price: number;
    // Barcode fields - optional
    piece_barcode?: string;
    pack_barcode?: string;
    box_barcode?: string;
    pieces_per_pack?: number;
    packs_per_box?: number;
  }
): Promise<ApiResponse<Product>> => {
  return fetchWithAuth(
    PRODUCT_ENDPOINTS.BASE,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
};

export const createProductWithBarcode = async (
  token: string,
  data: CreateProductWithBarcodeForm
): Promise<ApiResponse<Product>> => {
  return fetchWithAuth(
    PRODUCT_ENDPOINTS.BASE,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
};

// Service untuk scan barcode dan mendapatkan product info
export const scanBarcode = async (
  token: string,
  barcode: string
): Promise<ApiResponse<BarcodeScanResponse>> => {
  try {
    console.log("Scanning barcode for product info:", barcode); // Debug log

    const response = await fetchWithAuth(
      "/product/scan", // Product scan endpoint
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ barcode: barcode.trim() }),
      },
      token
    );

    console.log("Product scan response:", response); // Debug log
    return response;
  } catch (error: any) {
    console.error("Scan barcode error:", error);

    if (error.response?.status === 404) {
      throw new Error("Product not found for this barcode");
    }

    throw new Error(error.message || "Failed to scan barcode");
  }
};

export const updateProductBarcodes = async (
  token: string,
  productId: string,
  data: {
    piece_barcode?: string;
    pack_barcode?: string;
    box_barcode?: string;
  }
): Promise<
  ApiResponse<{
    id: string;
    piece_barcode: string | null;
    pack_barcode: string | null;
    box_barcode: string | null;
  }>
> => {
  return fetchWithAuth(
    `/product/${productId}/barcodes`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    token
  );
};

export const debugBarcodeConflicts = async (
  token: string
): Promise<
  ApiResponse<{
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
  }>
> => {
  return fetchWithAuth("/product/debug/barcodes", {}, token);
};

export const getAllProducts = async (
  token: string
): Promise<ApiResponse<Product[]>> => {
  return fetchWithAuth(PRODUCT_ENDPOINTS.BASE, {}, token);
};

export const getProductById = async (
  token: string,
  id: string
): Promise<ApiResponse<Product>> => {
  return fetchWithAuth(PRODUCT_ENDPOINTS.DETAIL(id), {}, token);
};

export const updateProduct = async (
  token: string,
  id: string,
  data: Partial<Product>
): Promise<ApiResponse<Product>> => {
  return fetchWithAuth(
    PRODUCT_ENDPOINTS.DETAIL(id),
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    token
  );
};

export const deleteProduct = async (
  token: string,
  id: string
): Promise<ApiResponse<void>> => {
  return fetchWithAuth(
    PRODUCT_ENDPOINTS.DETAIL(id),
    {
      method: "DELETE",
    },
    token
  );
};

export const createUnitConversion = async (
  token: string,
  data: {
    product_id: string;
    from_unit_id: string;
    to_unit_id: string;
    conversion_factor: number;
  }
): Promise<ApiResponse<UnitConversion>> => {
  return fetchWithAuth(
    PRODUCT_ENDPOINTS.CONVERSIONS,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
};

export const getUnitConversionsByProduct = async (
  token: string,
  productId: string
): Promise<ApiResponse<UnitConversion[]>> => {
  return fetchWithAuth(
    PRODUCT_ENDPOINTS.CONVERSIONS_BY_PRODUCT(productId),
    {},
    token
  );
};

export const updateUnitConversion = async (
  token: string,
  id: string,
  conversion_factor: number
): Promise<ApiResponse<UnitConversion>> => {
  return fetchWithAuth(
    PRODUCT_ENDPOINTS.CONVERSION_DETAIL(id),
    {
      method: "PUT",
      body: JSON.stringify({ conversion_factor }),
    },
    token
  );
};

export const deleteUnitConversion = async (
  token: string,
  id: string
): Promise<ApiResponse<void>> => {
  return fetchWithAuth(
    PRODUCT_ENDPOINTS.CONVERSION_DETAIL(id),
    {
      method: "DELETE",
    },
    token
  );
};

const productServices = {
  createProduct,
    createProductWithBarcode,
    scanBarcode,
    updateProductBarcodes,
    debugBarcodeConflicts,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    createUnitConversion,
    getUnitConversionsByProduct,
    updateUnitConversion,
    deleteUnitConversion,
};

export default productServices;