import { fetchWithAuth } from "./config";
import {
  AUTH_ENDPOINTS,
  WAREHOUSE_ENDPOINTS,
  RACK_ENDPOINTS,
  UNIT_ENDPOINTS,
  PRODUCT_ENDPOINTS,
  INVENTORY_ENDPOINTS,
  TRANSACTION_ENDPOINTS,
} from "./endpoints";
import {
  LoginResponse,
  ApiResponse,
  Warehouse,
  Rack,
  Unit,
  Product,
  Inventory,
  Transaction,
  StockInRequest,
  StockOutRequest,
  TransferRequest,
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
      // Jika token ada di dalam property value
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

export const getWarehouses = async (token: string): Promise<Warehouse[]> => {
  try {
    const response = await fetchWithAuth(WAREHOUSE_ENDPOINTS.BASE, {
      method: 'GET',
    }, token);
    
    console.log("Warehouse API Response:", response);
    
    // Pastikan mengembalikan array dengan memeriksa format respons
    return Array.isArray(response) ? response : 
           (response.data || response.value || []);
  } catch (error) {
    console.error("Warehouse fetch error:", error);
    throw error;
  }
};

export const getRacksByWarehouseId = async (
  warehouseId: number,
  token: string
): Promise<Rack[]> => {
  return fetchWithAuth(
    WAREHOUSE_ENDPOINTS.RACKS(warehouseId),
    {
      method: "GET",
    },
    token
  );
}

export const getWarehouseById = async (id: number, token: string): Promise<Warehouse> => {
  try {
    const response = await fetchWithAuth(WAREHOUSE_ENDPOINTS.DETAIL(id), {
      method: 'GET',
    }, token);
    
    console.log("API response for warehouse:", response);
    
    // Check how the data is structured - adjust based on your API response format
    if (response.data) {
      return response.data;
    } else if (response.value) {
      return response.value;
    } else {
      return response; // Asumsi response langsung berisi data warehouse
    }
  } catch (error) {
    console.error(`Error fetching warehouse with ID ${id}:`, error);
    throw error;
  }
};

export const createWarehouse = async (
  warehouseData: Partial<Warehouse>,
  token: string
): Promise<ApiResponse<Warehouse>> => {
  return fetchWithAuth(
    WAREHOUSE_ENDPOINTS.BASE,
    {
      method: "POST",
      body: JSON.stringify(warehouseData),
    },
    token
  );
};

export const updateWarehouse = async (
  id: number,
  warehouseData: Partial<Warehouse>,
  token: string
): Promise<ApiResponse<Warehouse>> => {
  return fetchWithAuth(
    WAREHOUSE_ENDPOINTS.DETAIL(id),
    {
      method: "PUT",
      body: JSON.stringify(warehouseData),
    },
    token
  );
};

export const deleteWarehouse = async (
  id: number,
  token: string
): Promise<ApiResponse<null>> => {
  return fetchWithAuth(
    WAREHOUSE_ENDPOINTS.DETAIL(id),
    {
      method: "DELETE",
    },
    token
  );
};

export const getWarehouseRacks = async (
  warehouseId: number,
  token: string
): Promise<Rack[]> => {
  return fetchWithAuth(
    WAREHOUSE_ENDPOINTS.RACKS(warehouseId),
    {
      method: "GET",
    },
    token
  );
};

//=============================================================================
// RACK SERVICES
//=============================================================================

export const getRacks = async (token: string): Promise<Rack[]> => {
  try {
    const response = await fetchWithAuth(
      RACK_ENDPOINTS.BASE,
      {
        method: "GET",
      },
      token
    );
    
    console.log("Rack API Response:", response);
    
    // Ensure we return an array by checking the response format
    return Array.isArray(response) ? response : 
           (response.data || response.value || []);
  } catch (error) {
    console.error("Rack fetch error:", error);
    throw error;
  }
};

export const getRackById = async (id: number, token: string): Promise<Rack> => {
  return fetchWithAuth(
    RACK_ENDPOINTS.DETAIL(id),
    {
      method: "GET",
    },
    token
  );
};

export const createRack = async (
  rackData: Partial<Rack>,
  token: string
): Promise<ApiResponse<Rack>> => {
  return fetchWithAuth(
    RACK_ENDPOINTS.BASE,
    {
      method: "POST",
      body: JSON.stringify(rackData),
    },
    token
  );
};

export const updateRack = async (
  id: number,
  rackData: Partial<Rack>,
  token: string
): Promise<ApiResponse<Rack>> => {
  return fetchWithAuth(
    RACK_ENDPOINTS.DETAIL(id),
    {
      method: "PUT",
      body: JSON.stringify(rackData),
    },
    token
  );
};

export const deleteRack = async (
  id: number,
  token: string
): Promise<ApiResponse<null>> => {
  return fetchWithAuth(
    RACK_ENDPOINTS.DETAIL(id),
    {
      method: "DELETE",
    },
    token
  );
};

export const getRackInventory = async (
  rackId: number,
  token: string
): Promise<Inventory[]> => {
  return fetchWithAuth(
    RACK_ENDPOINTS.INVENTORY(rackId),
    {
      method: "GET",
    },
    token
  );
};

//=============================================================================
// UNIT SERVICES
//=============================================================================

export const getUnits = async (token: string): Promise<Unit[]> => {
  return fetchWithAuth(
    UNIT_ENDPOINTS.BASE,
    {
      method: "GET",
    },
    token
  );
};

export const getUnitById = async (id: number, token: string): Promise<Unit> => {
  return fetchWithAuth(
    UNIT_ENDPOINTS.DETAIL(id),
    {
      method: "GET",
    },
    token
  );
};

export const createUnit = async (
  unitData: Partial<Unit>,
  token: string
): Promise<ApiResponse<Unit>> => {
  return fetchWithAuth(
    UNIT_ENDPOINTS.BASE,
    {
      method: "POST",
      body: JSON.stringify(unitData),
    },
    token
  );
};

export const updateUnit = async (
  id: number,
  unitData: Partial<Unit>,
  token: string
): Promise<ApiResponse<Unit>> => {
  return fetchWithAuth(
    UNIT_ENDPOINTS.DETAIL(id),
    {
      method: "PUT",
      body: JSON.stringify(unitData),
    },
    token
  );
};

export const deleteUnit = async (
  id: number,
  token: string
): Promise<ApiResponse<null>> => {
  return fetchWithAuth(
    UNIT_ENDPOINTS.DETAIL(id),
    {
      method: "DELETE",
    },
    token
  );
};

//=============================================================================
// PRODUCT SERVICES
//=============================================================================

export const getProducts = async (token: string): Promise<Product[]> => {
  return fetchWithAuth(
    PRODUCT_ENDPOINTS.BASE,
    {
      method: "GET",
    },
    token
  );
};

export const getProductById = async (
  id: number,
  token: string
): Promise<Product> => {
  return fetchWithAuth(
    PRODUCT_ENDPOINTS.DETAIL(id),
    {
      method: "GET",
    },
    token
  );
};

export const getProductByBarcode = async (
  barcode: string,
  token: string
): Promise<Product> => {
  return fetchWithAuth(
    PRODUCT_ENDPOINTS.BARCODE(barcode),
    {
      method: "GET",
    },
    token
  );
};

export const createProduct = async (
  productData: Partial<Product>,
  token: string
): Promise<ApiResponse<Product>> => {
  return fetchWithAuth(
    PRODUCT_ENDPOINTS.BASE,
    {
      method: "POST",
      body: JSON.stringify(productData),
    },
    token
  );
};

export const updateProduct = async (
  id: number,
  productData: Partial<Product>,
  token: string
): Promise<ApiResponse<Product>> => {
  return fetchWithAuth(
    PRODUCT_ENDPOINTS.DETAIL(id),
    {
      method: "PUT",
      body: JSON.stringify(productData),
    },
    token
  );
};

export const deleteProduct = async (
  id: number,
  token: string
): Promise<ApiResponse<null>> => {
  return fetchWithAuth(
    PRODUCT_ENDPOINTS.DETAIL(id),
    {
      method: "DELETE",
    },
    token
  );
};

//=============================================================================
// INVENTORY SERVICES
//=============================================================================

export const getInventory = async (token: string): Promise<Inventory[]> => {
  const response = await fetchWithAuth(INVENTORY_ENDPOINTS.BASE, {
    method: 'GET',
  }, token);
  
  // Return langsung array data, bukan seluruh respons
  return response.data || [];
};

export const getInventoryByProduct = async (
  productId: number,
  token: string
): Promise<Inventory[]> => {
  return fetchWithAuth(
    INVENTORY_ENDPOINTS.BY_PRODUCT(productId),
    {
      method: "GET",
    },
    token
  );
};

export const getInventoryByWarehouse = async (
  warehouseId: number,
  token: string
): Promise<Inventory[]> => {
  return fetchWithAuth(
    INVENTORY_ENDPOINTS.BY_WAREHOUSE(warehouseId),
    {
      method: "GET",
    },
    token
  );
};

export const getInventoryByRack = async (
  rackId: number,
  token: string
): Promise<Inventory[]> => {
  return fetchWithAuth(
    INVENTORY_ENDPOINTS.BY_RACK(rackId),
    {
      method: "GET",
    },
    token
  );
};

//=============================================================================
// TRANSACTION SERVICES
//=============================================================================

export const getTransactions = async (
  token: string
): Promise<Transaction[]> => {
  return fetchWithAuth(
    TRANSACTION_ENDPOINTS.BASE,
    {
      method: "GET",
    },
    token
  );
};

export const getTransactionById = async (
  id: number,
  token: string
): Promise<Transaction> => {
  return fetchWithAuth(
    TRANSACTION_ENDPOINTS.DETAIL(id),
    {
      method: "GET",
    },
    token
  );
};

export const createStockIn = async (
  stockInData: StockInRequest,
  token: string
): Promise<ApiResponse<Transaction>> => {
  return fetchWithAuth(
    TRANSACTION_ENDPOINTS.STOCK_IN,
    {
      method: "POST",
      body: JSON.stringify(stockInData),
    },
    token
  );
};

export const createStockOut = async (
  stockOutData: StockOutRequest,
  token: string
): Promise<ApiResponse<Transaction>> => {
  return fetchWithAuth(
    TRANSACTION_ENDPOINTS.STOCK_OUT,
    {
      method: "POST",
      body: JSON.stringify(stockOutData),
    },
    token
  );
};

export const createTransfer = async (
  transferData: TransferRequest,
  token: string
): Promise<ApiResponse<Transaction>> => {
  return fetchWithAuth(
    TRANSACTION_ENDPOINTS.TRANSFER,
    {
      method: "POST",
      body: JSON.stringify(transferData),
    },
    token
  );
};
