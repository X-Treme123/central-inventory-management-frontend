import { fetchWithAuth } from "@/lib/api/config";
import { UNIT_ENDPOINTS } from "./endpoints";
import { ApiResponse, Unit } from "./types";

// features/dashboard/units/api/services.ts
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

const unitServices = {
  createUnit,
  getAllUnits,
  getUnitById,
  updateUnit,
  deleteUnit,
};

export default unitServices;