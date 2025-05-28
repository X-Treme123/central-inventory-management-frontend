// features/dashboard/categories/api/services.ts

import { fetchWithAuth } from "@/lib/api/config";
import { CATEGORY_ENDPOINTS } from "./endpoints";
import { Category, ApiResponse } from "./types";

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

const categoriesServices = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
}

export default categoriesServices;