// features/dashboard/warehouses/api/services.ts

import { fetchWithAuth } from "@/lib/api/config";
import { WAREHOUSE_ENDPOINTS } from "./endpoints";
import { ApiResponse, Warehouses, Container, Rack } from "./types";

//=============================================================================
// STORAGE SERVICES
//=============================================================================

export const createWarehouse = async (
  token: string,
  name: string,
  description?: string
): Promise<ApiResponse<Warehouses>> => {
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
): Promise<ApiResponse<Warehouses[]>> => {
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

const warehouseServices = {
    createWarehouse,
    getAllWarehouses,
    createContainer,
    getContainersByWarehouse,
    createRack,
    getRacksByContainer,
}

export default warehouseServices;