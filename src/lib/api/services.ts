// lib/api/services.ts
import { fetchWithAuth } from "./config";
import { 
  AUTH_ENDPOINTS, 
  PRODUCT_ENDPOINTS, 
  INVENTORY_ENDPOINTS, 
  TRANSACTION_ENDPOINTS,
  WAREHOUSE_ENDPOINTS,
  RACK_ENDPOINTS,
  UNIT_ENDPOINTS,
  CATEGORY_ENDPOINTS,
  SUPPLIER_ENDPOINTS
} from "./endpoints";
import { 
  LoginResponse, 
  InventoryItem, 
  Product,
  ProductUnit,
  Unit,
  Warehouse,
  Rack,
  Category,
  Supplier,
  Transaction,
  StockOutResponse,
  StockInRequest,
  StockInResponse,
  DefectProduct,
  TransitProduct,
  BarcodeItem
} from "./types";

//=============================================================================
// AUTH SERVICES
//=============================================================================

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await fetchWithAuth(AUTH_ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // Check if response is in the expected format
    if (response && response.token) {
      return response;
    } else if (response && response.value && response.value.token) {
      // If token is in the value property
      return {
        ...response,
        token: response.value.token,
      };
    } else {
      throw new Error("Invalid response format from login API");
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

//=============================================================================
// INVENTORY SERVICES
//=============================================================================

// Get all inventory items
export const getInventory = async (token: string): Promise<InventoryItem[]> => {
  const response = await fetchWithAuth(INVENTORY_ENDPOINTS.GET_ALL, {
    method: 'GET',
  }, token);
  
  return response.data;
};

// Get inventory by warehouse
export const getInventoryByWarehouse = async (warehouseId: number, token: string): Promise<InventoryItem[]> => {
  const response = await fetchWithAuth(INVENTORY_ENDPOINTS.GET_BY_WAREHOUSE(warehouseId), {
    method: 'GET',
  }, token);
  
  return response.data;
};

// Get inventory by category type (GA or NON-GA)
export const getInventoryByCategoryType = async (categoryType: 'GA' | 'NON-GA', token: string): Promise<InventoryItem[]> => {
  const response = await fetchWithAuth(INVENTORY_ENDPOINTS.GET_BY_CATEGORY_TYPE(categoryType), {
    method: 'GET',
  }, token);
  
  return response.data;
};

// Get inventory item by barcode
export const getInventoryByBarcode = async (barcode: string, token: string): Promise<BarcodeItem> => {
  const response = await fetchWithAuth(INVENTORY_ENDPOINTS.GET_BY_BARCODE(barcode), {
    method: 'GET',
  }, token);
  
  return response.data;
};

//=============================================================================
// PRODUCT SERVICES
//=============================================================================

// Get all products
export const getAllProducts = async (token: string): Promise<Product[]> => {
  const response = await fetchWithAuth(PRODUCT_ENDPOINTS.GET_ALL, {
    method: 'GET',
  }, token);
  
  return response.data;
};

// Get product by ID
export const getProductById = async (productId: number, token: string): Promise<Product> => {
  const response = await fetchWithAuth(PRODUCT_ENDPOINTS.GET_BY_ID(productId), {
    method: 'GET',
  }, token);
  
  return response.data;
};

// Get product by barcode
export const getProductByBarcode = async (barcode: string, token: string): Promise<BarcodeItem> => {
  const response = await fetchWithAuth(PRODUCT_ENDPOINTS.GET_BY_BARCODE(barcode), {
    method: 'GET',
  }, token);
  
  return response.data;
};

// Get barcode image URL
export const getBarcodeImageUrl = (barcode: string): string => {
  return `${process.env.NEXT_PUBLIC_API_URL}${PRODUCT_ENDPOINTS.BARCODE_IMAGE(barcode)}`;
};

//=============================================================================
// WAREHOUSE SERVICES
//=============================================================================

// Get all warehouses
export const getAllWarehouses = async (token: string): Promise<Warehouse[]> => {
  const response = await fetchWithAuth(WAREHOUSE_ENDPOINTS.GET_ALL, {
    method: 'GET',
  }, token);
  
  return response.data;
};

// Get warehouse by ID
export const getWarehouseById = async (warehouseId: number, token: string): Promise<Warehouse> => {
  const response = await fetchWithAuth(WAREHOUSE_ENDPOINTS.GET_BY_ID(warehouseId), {
    method: 'GET',
  }, token);
  
  return response.data;
};

//=============================================================================
// RACK SERVICES
//=============================================================================

// Get all racks
export const getAllRacks = async (token: string): Promise<Rack[]> => {
  const response = await fetchWithAuth(RACK_ENDPOINTS.GET_ALL, {
    method: 'GET',
  }, token);
  
  return response.data;
};

// Get racks by warehouse ID
export const getRacksByWarehouse = async (warehouseId: number, token: string): Promise<Rack[]> => {
  const response = await fetchWithAuth(RACK_ENDPOINTS.GET_BY_WAREHOUSE(warehouseId), {
    method: 'GET',
  }, token);
  
  return response.data;
};

//=============================================================================
// UNIT SERVICES
//=============================================================================

// Get all units
export const getAllUnits = async (token: string): Promise<Unit[]> => {
  const response = await fetchWithAuth(UNIT_ENDPOINTS.GET_ALL, {
    method: 'GET',
  }, token);
  
  return response.data;
};

//=============================================================================
// CATEGORY SERVICES
//=============================================================================

// Get all categories
export const getAllCategories = async (token: string): Promise<Category[]> => {
  const response = await fetchWithAuth(CATEGORY_ENDPOINTS.GET_ALL, {
    method: 'GET',
  }, token);
  
  return response.data;
};

//=============================================================================
// SUPPLIER SERVICES
//=============================================================================

// Get all suppliers
export const getAllSuppliers = async (token: string): Promise<Supplier[]> => {
  const response = await fetchWithAuth(SUPPLIER_ENDPOINTS.GET_ALL, {
    method: 'GET',
  }, token);
  
  return response.data;
};

//=============================================================================
// TRANSACTION SERVICES
//=============================================================================

// Stock In (create new stock-in transaction)
export const stockIn = async (
  stockInData: StockInRequest,
  token: string
): Promise<StockInResponse> => {
  const response = await fetchWithAuth(TRANSACTION_ENDPOINTS.STOCK_IN, {
    method: 'POST',
    body: JSON.stringify(stockInData),
  }, token);
  
  return response;
};

// Stock out by barcode (single item)
export const stockOutByBarcode = async (
  barcode: string, 
  userId: number, 
  transactionReason: 'direct_request' | 'incident' | 'regular' = 'direct_request',
  notes: string = '',
  token: string
): Promise<StockOutResponse> => {
  const response = await fetchWithAuth(TRANSACTION_ENDPOINTS.STOCK_OUT_BARCODE, {
    method: 'POST',
    body: JSON.stringify({
      barcode,
      user_id: userId,
      transaction_reason: transactionReason,
      notes
    }),
  }, token);
  
  return response;
};

// Bulk stock out with multiple barcodes
export const bulkStockOut = async (
  barcodes: string[],
  userId: number,
  referenceNumber: string,
  transactionReason: 'direct_request' | 'incident' | 'regular' = 'regular',
  notes: string = '',
  token: string
): Promise<StockOutResponse> => {
  const response = await fetchWithAuth(TRANSACTION_ENDPOINTS.STOCK_OUT, {
    method: 'POST',
    body: JSON.stringify({
      reference_number: referenceNumber,
      notes,
      user_id: userId,
      transaction_reason: transactionReason,
      barcodes
    }),
  }, token);
  
  return response;
};

// Get all defect products
export const getAllDefectProducts = async (token: string): Promise<DefectProduct[]> => {
  const response = await fetchWithAuth(TRANSACTION_ENDPOINTS.DEFECT, {
    method: 'GET',
  }, token);
  
  return response.data;
};

// Get all transit products
export const getAllTransitProducts = async (token: string): Promise<TransitProduct[]> => {
  const response = await fetchWithAuth(TRANSACTION_ENDPOINTS.TRANSIT, {
    method: 'GET',
  }, token);
  
  return response.data;
};

// Complete transit
export const completeTransit = async (transitId: number, token: string): Promise<any> => {
  const response = await fetchWithAuth(TRANSACTION_ENDPOINTS.TRANSIT_COMPLETE(transitId), {
    method: 'PUT',
  }, token);
  
  return response;
};

// Cancel transit
export const cancelTransit = async (transitId: number, token: string): Promise<any> => {
  const response = await fetchWithAuth(TRANSACTION_ENDPOINTS.TRANSIT_CANCEL(transitId), {
    method: 'PUT',
  }, token);
  
  return response;
};

// Record partial defect
export const recordPartialDefect = async (
  defectData: {
    product_id: number;
    product_unit_id: number;
    barcode_id?: number;
    defective_quantity: number;
    defect_reason: 'factory' | 'shipping' | 'other';
    notes?: string;
    parent_unit_id?: number;
    parent_quantity?: number;
  },
  token: string
): Promise<any> => {
  const response = await fetchWithAuth(TRANSACTION_ENDPOINTS.RECORD_PARTIAL_DEFECT, {
    method: 'POST',
    body: JSON.stringify(defectData),
  }, token);
  
  return response;
};