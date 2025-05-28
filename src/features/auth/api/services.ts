// features/auth/api/services.ts

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
  ApiResponse,
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

const authService = {
  loginUser,
  refreshToken,
  checkToken,
  logoutUser,
};

export default authService;