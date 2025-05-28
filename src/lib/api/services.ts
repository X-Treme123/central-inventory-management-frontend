// lib/api/services.ts

import { fetchWithAuth } from "./config";
import { 
  CATEGORY_ENDPOINTS,
  UNIT_ENDPOINTS,
  DEPARTMENT_ENDPOINTS,
  PRODUCT_ENDPOINTS,
  STOCK_IN_ENDPOINTS,
  DEFECT_ENDPOINTS,
  STOCK_OUT_ENDPOINTS,
  REPORT_ENDPOINTS
} from "./endpoints";
import { 
  ApiResponse,
  Supplier,
  Category,
  Unit,
  Department,
  Product,
  UnitConversion,
  StockIn,
  StockInItem,
  ProductBarcode,
  DefectItem,
  StockOut,
  StockOutItem,
  CurrentStock,
  StockHistory,
  MonthlyStockReport,
  CreateProductWithBarcodeForm,
  BarcodeScanResponse,
  AddStockInItemByBarcodeForm,
  StockOutScanResponse,
  BarcodeStockResponse,
  BarcodeScan
} from "./types";

//=============================================================================
// CATEGORY SERVICES
//=============================================================================

// Debug helper
const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[StockOut Service Debug] ${message}`, data ? data : '');
  }
};

// Enhanced error parser
const parseErrorResponse = (error: any): string => {
  debugLog('Parsing error response:', error);
  
  // If error has response data
  if (error.response?.data) {
    const errorData = error.response.data;
    if (errorData.message) return errorData.message;
    if (errorData.error) return errorData.error;
  }
  
  // If error is already a formatted string
  if (typeof error === 'string') return error;
  
  // If error has message property
  if (error.message) {
    try {
      // Try to parse if it's JSON string
      const parsed = JSON.parse(error.message);
      if (parsed.message) return parsed.message;
    } catch {
      return error.message;
    }
  }
  
  return 'Unknown error occurred';
};

export const createCategory = async (
  token: string,
  name: string,
  description?: string
): Promise<ApiResponse<Category>> => {
  return fetchWithAuth(
    CATEGORY_ENDPOINTS.BASE,
    {
      method: "POST",
      body: JSON.stringify({ name, description }),
    },
    token
  );
};

export const getAllCategories = async (
  token: string
): Promise<ApiResponse<Category[]>> => {
  return fetchWithAuth(CATEGORY_ENDPOINTS.BASE, {}, token);
};

export const getCategoryById = async (
  token: string,
  id: string
): Promise<ApiResponse<Category>> => {
  return fetchWithAuth(CATEGORY_ENDPOINTS.DETAIL(id), {}, token);
};

export const updateCategory = async (
  token: string,
  id: string,
  data: Partial<Category>
): Promise<ApiResponse<Category>> => {
  return fetchWithAuth(
    CATEGORY_ENDPOINTS.DETAIL(id),
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    token
  );
};

export const deleteCategory = async (
  token: string,
  id: string
): Promise<ApiResponse<void>> => {
  return fetchWithAuth(
    CATEGORY_ENDPOINTS.DETAIL(id),
    {
      method: "DELETE",
    },
    token
  );
};

//=============================================================================
// UNIT SERVICES
//=============================================================================

export const createUnit = async (
  token: string,
  name: string,
  abbreviation: string
): Promise<ApiResponse<Unit>> => {
  return fetchWithAuth(
    UNIT_ENDPOINTS.BASE,
    {
      method: "POST",
      body: JSON.stringify({ name, abbreviation }),
    },
    token
  );
};

export const getAllUnits = async (
  token: string
): Promise<ApiResponse<Unit[]>> => {
  return fetchWithAuth(UNIT_ENDPOINTS.BASE, {}, token);
};

export const getUnitById = async (
  token: string,
  id: string
): Promise<ApiResponse<Unit>> => {
  return fetchWithAuth(UNIT_ENDPOINTS.DETAIL(id), {}, token);
};

export const updateUnit = async (
  token: string,
  id: string,
  data: Partial<Unit>
): Promise<ApiResponse<Unit>> => {
  return fetchWithAuth(
    UNIT_ENDPOINTS.DETAIL(id),
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    token
  );
};

export const deleteUnit = async (
  token: string,
  id: string
): Promise<ApiResponse<void>> => {
  return fetchWithAuth(
    UNIT_ENDPOINTS.DETAIL(id),
    {
      method: "DELETE",
    },
    token
  );
};

//=============================================================================
// DEPARTMENT SERVICES
//=============================================================================

export const createDepartment = async (
  token: string,
  name: string,
  description?: string
): Promise<ApiResponse<Department>> => {
  return fetchWithAuth(
    DEPARTMENT_ENDPOINTS.BASE,
    {
      method: "POST",
      body: JSON.stringify({ name, description }),
    },
    token
  );
};

export const getAllDepartments = async (
  token: string
): Promise<ApiResponse<Department[]>> => {
  return fetchWithAuth(DEPARTMENT_ENDPOINTS.BASE, {}, token);
};

export const getDepartmentById = async (
  token: string,
  id: string
): Promise<ApiResponse<Department>> => {
  return fetchWithAuth(DEPARTMENT_ENDPOINTS.DETAIL(id), {}, token);
};

export const updateDepartment = async (
  token: string,
  id: string,
  data: Partial<Department>
): Promise<ApiResponse<Department>> => {
  return fetchWithAuth(
    DEPARTMENT_ENDPOINTS.DETAIL(id),
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    token
  );
};

export const deleteDepartment = async (
  token: string,
  id: string
): Promise<ApiResponse<void>> => {
  return fetchWithAuth(
    DEPARTMENT_ENDPOINTS.DETAIL(id),
    {
      method: "DELETE",
    },
    token
  );
};

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
          'Content-Type': 'application/json',
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
): Promise<ApiResponse<{
  id: string;
  piece_barcode: string | null;
  pack_barcode: string | null;
  box_barcode: string | null;
}>> => {
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
): Promise<ApiResponse<{
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
}>> => {
  return fetchWithAuth(
    "/product/debug/barcodes",
    {},
    token
  );
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

//=============================================================================
// STOCK IN SERVICES
//=============================================================================

export const createStockIn = async (
  token: string,
  data: {
    invoice_code: string;
    packing_list_number?: string;
    supplier_id: string;
    receipt_date: string;
    // notes sekarang optional atau bisa dihapus sesuai kebutuhan
  }
): Promise<ApiResponse<StockIn>> => {
  return fetchWithAuth(
    STOCK_IN_ENDPOINTS.BASE,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
};

export const addStockInItem = async (
  token: string,
  stockInId: string,
  data: {
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
): Promise<ApiResponse<StockInItem>> => {
  return fetchWithAuth(
    STOCK_IN_ENDPOINTS.ITEMS(stockInId),
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
};

export const addStockInItemByBarcode = async (
  token: string,
  stockInId: string,
  data: AddStockInItemByBarcodeForm
): Promise<ApiResponse<StockInItem>> => {
  return fetchWithAuth(
    STOCK_IN_ENDPOINTS.ITEMS_SCAN(stockInId),
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
};

export const completeStockIn = async (
  token: string,
  id: string
): Promise<ApiResponse<void>> => {
  try {
    const response = await fetchWithAuth(
      STOCK_IN_ENDPOINTS.COMPLETE(id),
      {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json'
        }
      },
      token
    );
    
    // Log untuk debugging
    console.log('Complete stock in API response:', response);
    
    return response;
  } catch (error) {
    console.error('Complete stock in service error:', error);
    throw error;
  }
};

export const getAllStockIn = async (
  token: string
): Promise<ApiResponse<StockIn[]>> => {
  return fetchWithAuth(STOCK_IN_ENDPOINTS.BASE, {}, token);
};

export const getStockInById = async (
  token: string,
  id: string
): Promise<ApiResponse<StockIn>> => {
  return fetchWithAuth(STOCK_IN_ENDPOINTS.DETAIL(id), {}, token);
};

export const getBarcodesByStockInItem = async (
  token: string,
  itemId: string
): Promise<ApiResponse<ProductBarcode[]>> => {
  return fetchWithAuth(STOCK_IN_ENDPOINTS.BARCODES(itemId), {}, token);
};

//=============================================================================
// DEFECT SERVICES
//=============================================================================

export const reportDefect = async (
  token: string,
  data: {
    stock_in_item_id: string;
    unit_id: string;
    quantity: number;
    defect_type: string;
    defect_description?: string;
  }
): Promise<ApiResponse<DefectItem>> => {
  return fetchWithAuth(
    DEFECT_ENDPOINTS.BASE,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
};

export const getAllDefects = async (
  token: string
): Promise<ApiResponse<DefectItem[]>> => {
  return fetchWithAuth(DEFECT_ENDPOINTS.BASE, {}, token);
};

export const getDefectById = async (
  token: string,
  id: string
): Promise<ApiResponse<DefectItem>> => {
  return fetchWithAuth(DEFECT_ENDPOINTS.DETAIL(id), {}, token);
};

export const updateDefectStatus = async (
  token: string,
  id: string,
  status: 'returned' | 'resolved'
): Promise<ApiResponse<{ id: string; status: string }>> => {
  return fetchWithAuth(
    DEFECT_ENDPOINTS.STATUS(id),
    {
      method: "PUT",
      body: JSON.stringify({ status }),
    },
    token
  );
};

//=============================================================================
// STOCK OUT SERVICES
//=============================================================================

export const createStockOut = async (
  token: string,
  data: {
    reference_number: string;
    department_id: string;
    requestor_name: string;
    notes?: string;
  }
): Promise<ApiResponse<StockOut>> => {
  debugLog('Creating stock out request', data);
  
  try {
    // Input validation
    if (!data.reference_number?.trim()) {
      throw new Error('Reference number wajib diisi');
    }
    
    if (!data.department_id?.trim()) {
      throw new Error('Department wajib dipilih');
    }
    
    if (!data.requestor_name?.trim()) {
      throw new Error('Nama requestor wajib diisi');
    }

    const response = await fetchWithAuth(
      STOCK_OUT_ENDPOINTS.BASE,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    );
    
    debugLog('Create stock out response', response);
    return response;
    
  } catch (error) {
    debugLog('Create stock out error', error);
    throw new Error(parseErrorResponse(error));
  }
};

export const addStockOutItemByBarcode = async (
  token: string,
  stockOutId: string,
  data: {
    barcode: string;
    quantity: number;
    price_per_unit: number;
  }
): Promise<ApiResponse<StockOutItem>> => {
  debugLog('Adding stock out item by barcode', { stockOutId, ...data });
  
  try {
    const response = await fetchWithAuth(
      STOCK_OUT_ENDPOINTS.ITEMS_SCAN(stockOutId),
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    );
    
    debugLog('Add item response', response);
    return response;
    
  } catch (error) {
    debugLog('Add item error', error);
    throw new Error(parseErrorResponse(error));
  }
};

export const scanBarcodeForStockOut = async (
  token: string,
  barcode: string,
  quantity: number = 1
): Promise<ApiResponse<StockOutScanResponse>> => {
  debugLog('Starting barcode scan for stock out', { barcode, quantity });
  
  try {
    // Input validation
    if (!barcode?.trim()) {
      throw new Error('Barcode tidak boleh kosong');
    }
    
    if (!token?.trim()) {
      throw new Error('Token authentication tidak ditemukan');
    }
    
    if (quantity < 1) {
      throw new Error('Quantity harus minimal 1');
    }

    const requestData = { 
      barcode: barcode.trim().toLowerCase(), // Normalize barcode
      quantity: Number(quantity) 
    };
    
    debugLog('Request data prepared', requestData);
    debugLog('Calling endpoint', STOCK_OUT_ENDPOINTS.SCAN);
    
    const response = await fetchWithAuth(
      STOCK_OUT_ENDPOINTS.SCAN,
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      },
      token
    );

    debugLog('Raw response received', response);

    // Validate response structure
    if (!response) {
      throw new Error('No response received from server');
    }

    if (response.code !== "200") {
      const errorMsg = response.message || 'Server returned error status';
      debugLog('Server error response', { code: response.code, message: errorMsg });
      throw new Error(errorMsg);
    }

    if (!response.data) {
      throw new Error('Response data is missing');
    }

    debugLog('Scan successful', response.data);
    return response;

  } catch (error: any) {
    debugLog('Scan error occurred', error);
    
    const errorMessage = parseErrorResponse(error);
    debugLog('Parsed error message', errorMessage);
    
    // Re-throw with consistent error format
    throw new Error(errorMessage);
  }
};

export const addStockOutItem = async (
  token: string,
  stockOutId: string,
  data: {
    product_id: string;
    unit_id: string;
    quantity: number;
    price_per_unit: number;
    packs_per_box?: number;
    pieces_per_pack?: number;
  }
): Promise<ApiResponse<StockOutItem>> => {
  debugLog('Adding traditional stock out item', { stockOutId, ...data });
  
  try {
    const response = await fetchWithAuth(
      STOCK_OUT_ENDPOINTS.ITEMS(stockOutId),
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
      token
    );
    
    return response;
  } catch (error) {
    debugLog('Add traditional item error', error);
    throw new Error(parseErrorResponse(error));
  }
};

export const getStockByBarcode = async (
  token: string,
  barcode: string
): Promise<ApiResponse<BarcodeStockResponse>> => {
  debugLog('Checking stock for barcode', barcode);
  
  try {
    if (!barcode?.trim()) {
      throw new Error('Barcode tidak boleh kosong');
    }
    
    if (!token?.trim()) {
      throw new Error('Token authentication tidak ditemukan');
    }

    const endpoint = STOCK_OUT_ENDPOINTS.STOCK_CHECK(barcode.trim().toLowerCase());
    debugLog('Calling stock check endpoint', endpoint);
    
    const response = await fetchWithAuth(endpoint, {}, token);
    
    debugLog('Stock check response', response);

    if (response.code === "404") {
      throw new Error('Product tidak ditemukan untuk barcode ini');
    }

    if (response.code !== "200") {
      throw new Error(response.message || 'Gagal mengecek stock');
    }

    return response;
    
  } catch (error: any) {
    debugLog('Stock check error', error);
    
    const errorMessage = parseErrorResponse(error);
    throw new Error(errorMessage);
  }
};


export const getScanHistory = async (
  token: string,
  params?: {
    product_id?: string;
    barcode?: string;
    user_id?: string;
    scan_type?: 'stock_out' | 'stock_in' | 'check_stock';
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }
): Promise<ApiResponse<{
  scans: BarcodeScan[];
  pagination: {
    total_count: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}>> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetchWithAuth(
      `${STOCK_OUT_ENDPOINTS.SCAN_HISTORY}?${queryParams.toString()}`,
      {},
      token
    );
    return response;
  } catch (error) {
    console.error("Get scan history error:", error);
    throw error;
  }
};

export const testStockOutEndpoint = async (token: string): Promise<boolean> => {
  try {
    console.log("Testing stock out endpoint connectivity...");
    
    // Simple test - get all stock out (should work even if empty)
    await getAllStockOut(token);
    console.log("Stock out endpoint test: SUCCESS");
    return true;
  } catch (error) {
    console.error("Stock out endpoint test: FAILED", error);
    return false;
  }
};

export const approveStockOut = async (
  token: string,
  id: string
): Promise<ApiResponse<void>> => {
  try {
    const response = await fetchWithAuth(
      STOCK_OUT_ENDPOINTS.APPROVE(id),
      {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
      },
      token
    );
    return response;
  } catch (error) {
    console.error("Approve stock out error:", error);
    throw error;
  }
};

export const completeStockOut = async (
  token: string,
  id: string
): Promise<ApiResponse<void>> => {
  try {
    const response = await fetchWithAuth(
      STOCK_OUT_ENDPOINTS.COMPLETE(id),
      {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
      },
      token
    );
    return response;
  } catch (error) {
    console.error("Complete stock out error:", error);
    throw error;
  }
};

// Data retrieval functions
export const getAllStockOut = async (
  token: string
): Promise<ApiResponse<StockOut[]>> => {
  try {
    const response = await fetchWithAuth(STOCK_OUT_ENDPOINTS.BASE, {}, token);
    return response;
  } catch (error) {
    console.error("Get all stock out error:", error);
    throw error;
  }
};

export const getStockOutById = async (
  token: string,
  id: string
): Promise<ApiResponse<StockOut>> => {
  try {
    const response = await fetchWithAuth(STOCK_OUT_ENDPOINTS.DETAIL(id), {}, token);
    return response;
  } catch (error) {
    console.error("Get stock out by id error:", error);
    throw error;
  }
};

// Utility functions untuk reporting dan analytics
export const getStockOutSummary = async (
  token: string,
  filters?: {
    start_date?: string;
    end_date?: string;
    department_id?: string;
    status?: string;
  }
): Promise<ApiResponse<{
  total_requests: number;
  total_items: number;
  total_pieces: number;
  total_value: number;
  by_status: Record<string, number>;
  by_department: Record<string, number>;
}>> => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }
  
  const url = `${STOCK_OUT_ENDPOINTS.BASE}/summary${params.toString() ? `?${params.toString()}` : ''}`;
  return fetchWithAuth(url, {}, token);
};

export const getBarcodeScanHistory = async (
  token: string,
  filters?: {
    start_date?: string;
    end_date?: string;
    product_id?: string;
    scan_type?: 'stock_in' | 'stock_out' | 'check_stock';
  }
): Promise<ApiResponse<BarcodeScan[]>> => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }
  
  const url = `/barcode-scans${params.toString() ? `?${params.toString()}` : ''}`;
  return fetchWithAuth(url, {}, token);
};

//=============================================================================
// REPORT SERVICES
//=============================================================================

export const getCurrentStock = async (
  token: string
): Promise<ApiResponse<CurrentStock[]>> => {
  return fetchWithAuth(REPORT_ENDPOINTS.CURRENT_STOCK, {}, token);
};

export const getStockHistory = async (
  token: string,
  params?: {
    productId?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<ApiResponse<StockHistory[]>> => {
  const queryParams = new URLSearchParams();
  if (params?.productId) queryParams.append('productId', params.productId);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const url = `${REPORT_ENDPOINTS.STOCK_HISTORY}${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

  return fetchWithAuth(url, {}, token);
};

export const generateMonthlyReport = async (
  token: string,
  year: number,
  month: number
): Promise<ApiResponse<{ year: number; month: number }>> => {
  return fetchWithAuth(
    REPORT_ENDPOINTS.MONTHLY_REPORT,
    {
      method: "POST",
      body: JSON.stringify({ year, month }),
    },
    token
  );
};

export const getMonthlyReport = async (
  token: string,
  params?: {
    year?: number;
    month?: number;
  }
): Promise<ApiResponse<MonthlyStockReport[]>> => {
  const queryParams = new URLSearchParams();
  if (params?.year) queryParams.append('year', params.year.toString());
  if (params?.month) queryParams.append('month', params.month.toString());

  const url = `${REPORT_ENDPOINTS.MONTHLY_REPORT}${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

  return fetchWithAuth(url, {}, token);
};

export const getStockByLocation = async (
  token: string,
  params?: {
    warehouseId?: string;
    containerId?: string;
    rackId?: string;
  }
): Promise<ApiResponse<CurrentStock[]>> => {
  const queryParams = new URLSearchParams();
  if (params?.warehouseId) queryParams.append('warehouseId', params.warehouseId);
  if (params?.containerId) queryParams.append('containerId', params.containerId);
  if (params?.rackId) queryParams.append('rackId', params.rackId);

  const url = `${REPORT_ENDPOINTS.STOCK_BY_LOCATION}${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

  return fetchWithAuth(url, {}, token);
};