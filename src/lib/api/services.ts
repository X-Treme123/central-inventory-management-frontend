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
  CurrentStock,
  StockHistory,
  MonthlyStockReport,
  CreateProductWithBarcodeForm,
  BarcodeScanResponse,
  AddStockInItemByBarcodeForm,
  AddStockOutItemByBarcodeForm,
  StockOutBarcodeScanResponse,
  CreateStockOutForm,
  StockOutItem,
  StockOutWorkflowActions,
  StockOutStatus,
  CreateDefectForm,
  DefectStatus,
  StockInItemForDefect
} from "./types";

//=============================================================================
// CATEGORY SERVICES
//=============================================================================

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

// Create defect report
export const reportDefect = async (
  token: string,
  data: CreateDefectForm
): Promise<ApiResponse<DefectItem>> => {
  try {
    const response = await fetchWithAuth(
      '/defect',
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    );
    return response;
  } catch (error) {
    console.error("Report defect error:", error);
    throw error;
  }
};

// Get all defect reports
export const getAllDefects = async (
  token: string
): Promise<ApiResponse<DefectItem[]>> => {
  try {
    const response = await fetchWithAuth('/defect', {}, token);
    return response;
  } catch (error) {
    console.error("Get all defects error:", error);
    throw error;
  }
};

// Get defect report by ID
export const getDefectById = async (
  token: string,
  id: string
): Promise<ApiResponse<DefectItem>> => {
  try {
    const response = await fetchWithAuth(`/defect/${id}`, {}, token);
    return response;
  } catch (error) {
    console.error("Get defect by ID error:", error);
    throw error;
  }
};

// Update defect status
export const updateDefectStatus = async (
  token: string,
  id: string,
  status: DefectStatus
): Promise<ApiResponse<{ id: string; status: string; updated_at: string }>> => {
  try {
    const response = await fetchWithAuth(
      `/defect/${id}/status`,
      {
        method: "PUT",
        body: JSON.stringify({ status }),
      },
      token
    );
    return response;
  } catch (error) {
    console.error("Update defect status error:", error);
    throw error;
  }
};

// Get stock in items available for defect reporting
export const getStockInItemsForDefect = async (
  token: string
): Promise<ApiResponse<StockInItemForDefect[]>> => {
  try {
    const response = await fetchWithAuth('/defect/stock-in-items/available', {}, token);
    return response;
  } catch (error) {
    console.error("Get stock in items for defect error:", error);
    throw error;
  }
};

// Helper function to get defect type options
export const getDefectTypeOptions = () => {
  return [
    { value: 'Damaged Packaging', label: 'Damaged Packaging' },
    { value: 'Broken', label: 'Broken' },
    { value: 'Missing Parts', label: 'Missing Parts' },
    { value: 'Wrong Product', label: 'Wrong Product' },
    { value: 'Expired', label: 'Expired' },
    { value: 'Quality Issue', label: 'Quality Issue' },
    { value: 'Other', label: 'Other' },
  ];
};

// Helper function to calculate defect pieces
export const calculateDefectPieces = (
  quantity: number,
  unitName: string,
  piecesPerPack: number,
  packsPerBox: number
): number => {
  const unitNameLower = unitName.toLowerCase();
  
  if (unitNameLower.includes('box') || unitNameLower.includes('dus')) {
    return quantity * piecesPerPack * packsPerBox;
  } else if (unitNameLower.includes('pack')) {
    return quantity * piecesPerPack;
  } else {
    return quantity; // pieces
  }
};

//=============================================================================
// STOCK OUT SERVICES - Complete implementation
//=============================================================================

export const createStockOut = async (
  token: string,
  data: CreateStockOutForm
): Promise<ApiResponse<StockOut>> => {
  try {
    const response = await fetchWithAuth(
      STOCK_OUT_ENDPOINTS.BASE,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    );
    return response;
  } catch (error) {
    console.error("Create stock out error:", error);
    throw error;
  }
};

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
    console.error("Get stock out by ID error:", error);
    throw error;
  }
};

// Scan barcode untuk mendapatkan product info (sebelum add item)
export const scanBarcodeForStockOut = async (
  token: string,
  barcode: string
): Promise<ApiResponse<StockOutBarcodeScanResponse>> => {
  try {
    const response = await fetchWithAuth(
      STOCK_OUT_ENDPOINTS.SCAN_BARCODE(barcode),
      {},
      token
    );
    return response;
  } catch (error) {
    console.error("Scan barcode for stock out error:", error);
    throw error;
  }
};

// Add stock out item by barcode
export const addStockOutItemByBarcode = async (
  token: string,
  stockOutId: string,
  data: AddStockOutItemByBarcodeForm
): Promise<ApiResponse<StockOutItem>> => {
  try {
    const response = await fetchWithAuth(
      STOCK_OUT_ENDPOINTS.ITEMS_SCAN(stockOutId),
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    );
    return response;
  } catch (error) {
    console.error("Add stock out item by barcode error:", error);
    throw error;
  }
};

// Approve stock out request
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
          'Content-Type': 'application/json'
        }
      },
      token
    );
    return response;
  } catch (error) {
    console.error("Approve stock out error:", error);
    throw error;
  }
};

// Complete stock out process
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
          'Content-Type': 'application/json'
        }
      },
      token
    );
    return response;
  } catch (error) {
    console.error("Complete stock out error:", error);
    throw error;
  }
};

// Helper function untuk menentukan workflow actions berdasarkan status
export const getStockOutWorkflowActions = (
  status: StockOutStatus
): StockOutWorkflowActions => {
  return {
    canAddItems: status === 'pending',
    canApprove: status === 'pending',
    canComplete: status === 'approved',
    canReject: status === 'pending' || status === 'approved',
  };
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