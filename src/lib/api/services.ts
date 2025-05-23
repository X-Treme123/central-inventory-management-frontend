// lib/api/services.ts

import { fetchWithAuth } from "./config";
import { 
  AUTH_ENDPOINTS, 
  WAREHOUSE_ENDPOINTS, 
  SUPPLIER_ENDPOINTS,
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
  LoginResponse, 
  ApiResponse,
  Warehouse,
  Container,
  Rack,
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
  MonthlyStockReport
} from "./types";

//=============================================================================
// AUTH SERVICES
//=============================================================================

export const loginUser = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await fetchWithAuth(AUTH_ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    // Check if response is in the expected format
    if (response && response.token) {
      return response;
    } else if (response && response.value && response.value.token) {
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
// WAREHOUSE SERVICES
//=============================================================================

export const createWarehouse = async (
  token: string,
  name: string,
  description?: string
): Promise<ApiResponse<Warehouse>> => {
  return fetchWithAuth(
    WAREHOUSE_ENDPOINTS.BASE,
    {
      method: "POST",
      body: JSON.stringify({ name, description }),
    },
    token
  );
};

export const getAllWarehouses = async (
  token: string
): Promise<ApiResponse<Warehouse[]>> => {
  return fetchWithAuth(WAREHOUSE_ENDPOINTS.BASE, {}, token);
};

export const createContainer = async (
  token: string,
  warehouse_id: string,
  name: string,
  description?: string
): Promise<ApiResponse<Container>> => {
  return fetchWithAuth(
    WAREHOUSE_ENDPOINTS.CONTAINERS,
    {
      method: "POST",
      body: JSON.stringify({ warehouse_id, name, description }),
    },
    token
  );
};

export const getContainersByWarehouse = async (
  token: string,
  warehouseId: string
): Promise<ApiResponse<Container[]>> => {
  return fetchWithAuth(
    WAREHOUSE_ENDPOINTS.CONTAINERS_BY_WAREHOUSE(warehouseId),
    {},
    token
  );
};

export const createRack = async (
  token: string,
  container_id: string,
  name: string,
  description?: string
): Promise<ApiResponse<Rack>> => {
  return fetchWithAuth(
    WAREHOUSE_ENDPOINTS.RACKS,
    {
      method: "POST",
      body: JSON.stringify({ container_id, name, description }),
    },
    token
  );
};

export const getRacksByContainer = async (
  token: string,
  containerId: string
): Promise<ApiResponse<Rack[]>> => {
  return fetchWithAuth(
    WAREHOUSE_ENDPOINTS.RACKS_BY_CONTAINER(containerId),
    {},
    token
  );
};

//=============================================================================
// SUPPLIER SERVICES
//=============================================================================

export const createSupplier = async (
  token: string,
  name: string,
  contact_person?: string,
  phone?: string,
  email?: string,
  address?: string
): Promise<ApiResponse<Supplier>> => {
  return fetchWithAuth(
    SUPPLIER_ENDPOINTS.BASE,
    {
      method: "POST",
      body: JSON.stringify({ name, contact_person, phone, email, address }),
    },
    token
  );
};

export const getAllSuppliers = async (
  token: string
): Promise<ApiResponse<Supplier[]>> => {
  return fetchWithAuth(SUPPLIER_ENDPOINTS.BASE, {}, token);
};

export const getSupplierById = async (
  token: string,
  id: string
): Promise<ApiResponse<Supplier>> => {
  return fetchWithAuth(SUPPLIER_ENDPOINTS.DETAIL(id), {}, token);
};

export const updateSupplier = async (
  token: string,
  id: string,
  data: Partial<Supplier>
): Promise<ApiResponse<Supplier>> => {
  return fetchWithAuth(
    SUPPLIER_ENDPOINTS.DETAIL(id),
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    token
  );
};

export const deleteSupplier = async (
  token: string,
  id: string
): Promise<ApiResponse<void>> => {
  return fetchWithAuth(
    SUPPLIER_ENDPOINTS.DETAIL(id),
    {
      method: "DELETE",
    },
    token
  );
};

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
    notes?: string;
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
  return fetchWithAuth(
    STOCK_OUT_ENDPOINTS.BASE,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
};

export const addStockOutItem = async (
  token: string,
  stockOutId: string,
  data: {
    product_id: string;
    unit_id: string;
    quantity: number;
    price_per_unit: number;
    packs_per_box?: number; // Tambahan parameter
    pieces_per_pack?: number; // Tambahan parameter
  }
): Promise<ApiResponse<StockOutItem>> => {
  return fetchWithAuth(
    STOCK_OUT_ENDPOINTS.ITEMS(stockOutId),
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
};

export const approveStockOut = async (
  token: string,
  id: string
): Promise<ApiResponse<void>> => {
  return fetchWithAuth(
    STOCK_OUT_ENDPOINTS.APPROVE(id),
    {
      method: "PUT",
    },
    token
  );
};

export const completeStockOut = async (
  token: string,
  id: string
): Promise<ApiResponse<void>> => {
  return fetchWithAuth(
    STOCK_OUT_ENDPOINTS.COMPLETE(id),
    {
      method: "PUT",
    },
    token
  );
};

export const getAllStockOut = async (
  token: string
): Promise<ApiResponse<StockOut[]>> => {
  return fetchWithAuth(STOCK_OUT_ENDPOINTS.BASE, {}, token);
};

export const getStockOutById = async (
  token: string,
  id: string
): Promise<ApiResponse<StockOut>> => {
  return fetchWithAuth(STOCK_OUT_ENDPOINTS.DETAIL(id), {}, token);
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