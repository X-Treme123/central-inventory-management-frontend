// features/auth/api/services.ts - Updated with new functions

import { fetchWithAuth } from "@/lib/api/config";
import Cookies from "js-cookie";
import { 
  AUTH_ENDPOINTS, 
} from "./endpoints";
import { 
  LoginResponse, 
  RefreshTokenRequest,
  RefreshTokenResponse,
  CheckTokenResponse,
  DepartmentsResponse,
  UsersResponse,
  CurrentUserResponse,
  ApiResponse,
  Department,
  UserListItem,
  User,
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
    if (response && response.token && response.user) {
      return response;
    } else {
      throw new Error("Invalid response format from login API");
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const refreshToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
  try {
    const response = await fetchWithAuth(AUTH_ENDPOINTS.REFRESH_TOKEN, {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response && response.token && response.refreshToken) {
      return response;
    } else {
      throw new Error("Invalid response format from refresh token API");
    }
  } catch (error) {
    console.error("Refresh token error:", error);
    throw error;
  }
};

export const checkToken = async (): Promise<CheckTokenResponse> => {
  try {
    const token = Cookies.get('token');
    
    if (!token) {
      throw new Error("No token found");
    }

    const response = await fetchWithAuth(AUTH_ENDPOINTS.CHECK_TOKEN, {
      method: "GET",
    }, token);

    if (response && response.user) {
      return response;
    } else {
      throw new Error("Invalid response format from check token API");
    }
  } catch (error) {
    console.error("Check token error:", error);
    throw error;
  }
};

export const logoutUser = async (): Promise<ApiResponse<null>> => {
  try {
    const token = Cookies.get('token');
    
    const response = await fetchWithAuth(AUTH_ENDPOINTS.LOGOUT, {
      method: "POST",
    }, token);

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

//=============================================================================
// NEW SERVICES - DEPARTMENTS & USERS
//=============================================================================

export const getAllDepartments = async (token: string): Promise<ApiResponse<Department[]>> => {
  try {
    const response = await fetchWithAuth(AUTH_ENDPOINTS.DEPARTMENTS, {
      method: "GET",
    }, token);

    if (response && response.code === "200") {
      return response;
    } else {
      throw new Error(response?.message || "Failed to fetch departments");
    }
  } catch (error) {
    console.error("Get departments error:", error);
    throw error;
  }
};

export const getAllUsers = async (token: string): Promise<ApiResponse<UserListItem[]>> => {
  try {
    const response = await fetchWithAuth(AUTH_ENDPOINTS.USERS, {
      method: "GET",
    }, token);

    if (response && response.code === "200") {
      return response;
    } else {
      throw new Error(response?.message || "Failed to fetch users");
    }
  } catch (error) {
    console.error("Get users error:", error);
    throw error;
  }
};

export const getUsersByDepartment = async (
  token: string, 
  department: string
): Promise<ApiResponse<UserListItem[]>> => {
  try {
    const response = await fetchWithAuth(
      `${AUTH_ENDPOINTS.USERS_BY_DEPARTMENT}/${encodeURIComponent(department)}`, 
      {
        method: "GET",
      }, 
      token
    );

    if (response && response.code === "200") {
      return response;
    } else {
      throw new Error(response?.message || "Failed to fetch users by department");
    }
  } catch (error) {
    console.error("Get users by department error:", error);
    throw error;
  }
};

export const getCurrentUserInfo = async (token: string): Promise<ApiResponse<User>> => {
  try {
    const response = await fetchWithAuth(AUTH_ENDPOINTS.CURRENT_USER, {
      method: "GET",
    }, token);

    if (response && response.code === "200") {
      return response;
    } else {
      throw new Error(response?.message || "Failed to fetch current user info");
    }
  } catch (error) {
    console.error("Get current user info error:", error);
    throw error;
  }
};

//=============================================================================
// CONVENIENCE FUNCTIONS
//=============================================================================

// Get departments for dropdown
export const getDepartmentsForDropdown = async (token: string): Promise<Department[]> => {
  try {
    const response = await getAllDepartments(token);
    return response.data || [];
  } catch (error) {
    console.error("Error getting departments for dropdown:", error);
    return [];
  }
};

// Get users for dropdown (e.g., requestor selection)
export const getUsersForDropdown = async (token: string): Promise<UserListItem[]> => {
  try {
    const response = await getAllUsers(token);
    return response.data || [];
  } catch (error) {
    console.error("Error getting users for dropdown:", error);
    return [];
  }
};

// Get current user's department
export const getCurrentUserDepartment = async (token: string): Promise<string | null> => {
  try {
    const response = await getCurrentUserInfo(token);
    return response.data?.department || null;
  } catch (error) {
    console.error("Error getting current user department:", error);
    return null;
  }
};

const authService = {
  loginUser,
  refreshToken,
  checkToken,
  logoutUser,
  getAllDepartments,
  getAllUsers,
  getUsersByDepartment,
  getCurrentUserInfo,
  getDepartmentsForDropdown,
  getUsersForDropdown,
  getCurrentUserDepartment,
};

export default authService;