// features/dashboard/suppliers/api/services.ts
import { fetchWithAuth } from "@/lib/api/config";
import { SUPPLIER_ENDPOINTS } from "./endpoints";
import { Supplier, ApiResponse } from "./types";

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

const supplierServices = {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
};

export default supplierServices;
